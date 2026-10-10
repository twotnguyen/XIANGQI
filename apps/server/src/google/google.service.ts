import { createHash, randomBytes } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import type { Session } from "../auth/contracts.js";
import { validateUsername } from "../auth/name-filter.js";
import {
  GoogleError,
  type GoogleAuth,
  type GoogleClaims,
  type GoogleIdentityVerifier,
  type GoogleSessionIssuer,
} from "./contracts.js";
import { transaction } from "./postgres.js";
interface GoogleAccount {
  userId: string;
  email: string;
  method: "email" | "google";
  createdAt: Date;
  completedAt: Date | null;
  pending: boolean | null;
  username: string | null;
}
const accountQuery = `SELECT o.user_id AS "userId",o.email_key AS email,o.method,o.created_at AS "createdAt",p.completed_at AS "completedAt",p.registration_pending AS pending,p.username FROM xiangqi_auth.account_origins o LEFT JOIN public.profiles p ON p.user_id=o.user_id`;
function hash(value: unknown) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(value))
    throw new GoogleError(
      "GOOGLE_INVALID",
      "Xác thực Google không hợp lệ",
      401,
    );
  return createHash("sha256").update(value).digest("hex");
}
function unavailable() {
  return new GoogleError(
    "GOOGLE_UNAVAILABLE",
    "Chưa thể xác thực Google, vui lòng thử lại",
    503,
  );
}
function duplicate() {
  return new GoogleError("EMAIL_TAKEN", "Email này đã được đăng ký", 409);
}
export class GoogleService {
  private cleanupCursor: { createdAt: Date; userId: string } | null = null;
  constructor(
    private readonly pool: Pool,
    private readonly verifier: GoogleIdentityVerifier,
    private readonly auth: GoogleAuth,
    private readonly issuer: GoogleSessionIssuer,
    private readonly clientId: string,
    private readonly now = () => new Date(),
  ) {}
  private async query(sql: string, values: unknown[] = []) {
    try {
      return await transaction(this.pool, (c) => c.query(sql, values));
    } catch {
      throw unavailable();
    }
  }
  private async byEmail(email: string): Promise<GoogleAccount | undefined> {
    return (
      await this.query(`${accountQuery} WHERE o.email_key=lower($1)`, [email])
    ).rows[0];
  }
  private async account(
    c: PoolClient,
    id: string,
  ): Promise<GoogleAccount | undefined> {
    return (await c.query(`${accountQuery} WHERE o.user_id=$1`, [id])).rows[0];
  }
  async beginChallenge() {
    const capability = randomBytes(32).toString("base64url"),
      nonce = hash(capability),
      expires = new Date(this.now().getTime() + 300000);
    try {
      await this.query(
        "INSERT INTO xiangqi_auth.google_challenges(token_hash,nonce_hash,expires_at) VALUES($1,$1,$2)",
        [nonce, expires],
      );
    } catch {
      throw unavailable();
    }
    return {
      capability,
      nonce,
      clientId: this.clientId,
      expiresAt: expires.toISOString(),
    };
  }
  private claimsValid(claims: GoogleClaims, nonce: string) {
    return (
      claims.aud === this.clientId &&
      ["https://accounts.google.com", "accounts.google.com"].includes(
        claims.iss,
      ) &&
      typeof claims.exp === "number" &&
      Number.isFinite(claims.exp) &&
      claims.exp > this.now().getTime() / 1000 &&
      typeof claims.sub === "string" &&
      claims.sub.length > 0 &&
      claims.sub.length <= 255 &&
      typeof claims.email === "string" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(claims.email) &&
      claims.email.length <= 254 &&
      claims.email_verified === true &&
      claims.nonce === nonce
    );
  }
  async authenticate(credential: unknown, challenge: unknown, remember = true) {
    const nonce = hash(challenge);
    if (
      typeof credential !== "string" ||
      !credential ||
      credential.length > 16384 ||
      typeof remember !== "boolean"
    )
      throw new GoogleError(
        "GOOGLE_INVALID",
        "Xác thực Google không hợp lệ",
        401,
      );
    let claims: GoogleClaims;
    try {
      claims = await this.verifier.verify(credential);
    } catch (error) {
      if ((error as { status?: number })?.status === 503) throw unavailable();
      throw new GoogleError(
        "GOOGLE_INVALID",
        "Xác thực Google không hợp lệ",
        401,
      );
    }
    if (!this.claimsValid(claims, nonce))
      throw new GoogleError(
        "GOOGLE_INVALID",
        "Xác thực Google không hợp lệ",
        401,
      );
    const consumed = await this.query(
      "UPDATE xiangqi_auth.google_challenges SET consumed_at=$2 WHERE token_hash=$1 AND consumed_at IS NULL AND expires_at>$2 RETURNING token_hash",
      [nonce, this.now()],
    );
    if (!consumed.rowCount)
      throw new GoogleError(
        "GOOGLE_INVALID",
        "Xác thực Google không hợp lệ",
        401,
      );
    const before = await this.byEmail(claims.email);
    if (before?.method === "email") throw duplicate();
    if (!before) {
      try {
        await transaction(this.pool, async (c) => {
          await c.query(
            "DELETE FROM xiangqi_auth.google_creation_intents WHERE email_key=lower($1) AND expires_at<=statement_timestamp()",
            [claims.email],
          );
          await c.query(
            "INSERT INTO xiangqi_auth.google_creation_intents(email_key,provider_id) SELECT lower($1),$2 WHERE NOT EXISTS(SELECT 1 FROM xiangqi_auth.account_origins WHERE email_key=lower($1)) ON CONFLICT(email_key) DO NOTHING",
            [claims.email, claims.sub],
          );
        });
      } catch {
        throw unavailable();
      }
    }
    let session: Session;
    try {
      session = await this.auth.exchangeIDToken(
        credential,
        challenge as string,
      );
    } catch {
      if ((await this.byEmail(claims.email))?.method === "email")
        throw duplicate();
      throw unavailable();
    }
    const account = await this.byEmail(claims.email);
    if (
      !account ||
      account.method !== "google" ||
      account.userId !== session.user.id ||
      session.user.email?.toLowerCase() !== claims.email.toLowerCase() ||
      !session.user.email_confirmed_at
    )
      throw new GoogleError(
        "GOOGLE_INVALID",
        "Xác thực Google không hợp lệ",
        401,
      );
    const subject = (
      await this.query(
        "SELECT provider_id FROM xiangqi_auth.google_subjects WHERE user_id=$1",
        [account.userId],
      )
    ).rows[0]?.provider_id;
    if (subject !== claims.sub)
      throw new GoogleError(
        "GOOGLE_INVALID",
        "Xác thực Google không hợp lệ",
        401,
      );
    const decision = await this.locked(account.userId, undefined, async (c) => {
      const fresh = await this.account(c, account.userId);
      if (
        !fresh ||
        fresh.method !== "google" ||
        fresh.email !== claims.email.toLowerCase()
      )
        throw new GoogleError(
          "GOOGLE_INVALID",
          "Xác thực Google không hợp lệ",
          401,
        );
      if (fresh.completedAt && fresh.username) {
        if (fresh.pending) await this.clearPending(c, fresh, session);
        const draft = (
          await c.query(
            "SELECT token_hash FROM xiangqi_auth.google_drafts WHERE user_id=$1",
            [fresh.userId],
          )
        ).rows[0];
        return {
          kind: "member" as const,
          account: fresh,
          draftHash: draft?.token_hash,
        };
      }
      const capability = randomBytes(32).toString("base64url");
      const marker = (
        await c.query(
          "SELECT created_at FROM xiangqi_auth.google_temporary_accounts WHERE user_id=$1",
          [fresh.userId],
        )
      ).rows[0];
      const prior = (
        await c.query(
          "SELECT created_at FROM xiangqi_auth.google_drafts WHERE user_id=$1",
          [fresh.userId],
        )
      ).rows[0];
      const createdAt = marker?.created_at ?? prior?.created_at ?? this.now();
      if (createdAt.getTime() + 3600000 <= this.now().getTime())
        throw new GoogleError(
          "GOOGLE_EXPIRED",
          "Đăng ký Google đã hết hạn",
          401,
        );
      const draft = (
        await c.query(
          `INSERT INTO xiangqi_auth.google_drafts(token_hash,user_id,created_at,remember,owned) VALUES($1,$2,$3,$4,$5) ON CONFLICT(user_id) DO UPDATE SET token_hash=EXCLUDED.token_hash,remember=EXCLUDED.remember RETURNING created_at`,
          [hash(capability), fresh.userId, createdAt, remember, !!marker],
        )
      ).rows[0];
      return {
        kind: "pending" as const,
        capability,
        expiresAt: new Date(draft.created_at.getTime() + 3600000).toISOString(),
        session,
      };
    });
    if (decision.kind === "member") {
      const result = await this.issue(decision.account, session, remember);
      if (decision.draftHash)
        await this.query(
          "DELETE FROM xiangqi_auth.google_drafts WHERE user_id=$1 AND token_hash=$2",
          [decision.account.userId, decision.draftHash],
        );
      return result;
    }
    return decision;
  }

  private async issue(
    account: GoogleAccount,
    session: Session,
    remember: boolean,
  ) {
    try {
      return {
        kind: "member" as const,
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_in: session.expires_in,
        ...(await this.issuer(account.userId, remember)),
        userId: account.userId,
        username: account.username!,
        remember,
      };
    } catch {
      throw new GoogleError(
        "GOOGLE_RECOVERING",
        "Chưa thể hoàn tất đăng nhập, vui lòng thử lại",
        503,
      );
    }
  }
  private async locked<T>(
    id: string,
    username: string | undefined,
    work: (c: PoolClient) => Promise<T>,
  ) {
    const c = await this.pool.connect(),
      keys = [
        `google-user:${id}`,
        ...(username ? [`username:${username.toLowerCase()}`] : []),
      ];
    const acquired: string[] = [];
    let broken = false;
    try {
      await c.query("SET ROLE app_server");
      for (const key of keys) {
        await c.query("SELECT pg_advisory_lock(hashtextextended($1,0))", [key]);
        acquired.push(key);
      }
      return await work(c);
    } finally {
      try {
        await c.query("ROLLBACK");
        for (const key of acquired.reverse())
          await c.query("SELECT pg_advisory_unlock(hashtextextended($1,0))", [
            key,
          ]);
        await c.query("RESET ROLE");
      } catch {
        broken = true;
      }
      c.release(broken);
    }
  }
  async onboarding(capability: unknown) {
    const row = (
      await this.query(
        "SELECT d.created_at,d.state,p.completed_at,p.username,o.email_key AS email FROM xiangqi_auth.google_drafts d JOIN xiangqi_auth.account_origins o ON o.user_id=d.user_id AND o.method='google' JOIN xiangqi_auth.accounts a ON a.id=d.user_id AND a.email_confirmed_at IS NOT NULL AND lower(a.email)=o.email_key LEFT JOIN public.profiles p ON p.user_id=d.user_id WHERE d.token_hash=$1",
        [hash(capability)],
      )
    ).rows[0];
    if (!row || row.state === "cleanup")
      throw new GoogleError(
        "GOOGLE_INVALID",
        "Phiên đăng ký Google không hợp lệ",
        401,
      );
    const expiresAt = new Date(row.created_at.getTime() + 3600000);
    if (expiresAt.getTime() <= this.now().getTime() && !row.completed_at)
      throw new GoogleError("GOOGLE_EXPIRED", "Đăng ký Google đã hết hạn", 401);
    return {
      kind: "pending" as const,
      expiresAt: expiresAt.toISOString(),
      recovering: row.state === "recovering" || !!row.completed_at,
      email: row.email as string,
      avatar: {
        kind: "initials" as const,
        text: row.username?.slice(0, 1).toUpperCase() ?? "?",
      },
    };
  }
  async complete(
    capability: unknown,
    proof: Session,
    input: { username: unknown; password: unknown },
  ) {
    const tokenHash = hash(capability),
      username = validateUsername(input.username);
    if (
      typeof input.password !== "string" ||
      input.password.length < 8 ||
      input.password.length > 4096
    )
      throw new GoogleError(
        "PASSWORD_INVALID",
        "Mật khẩu cần tối thiểu 8 ký tự",
      );
    const password = input.password;
    const initial = (
      await this.query(
        "SELECT user_id FROM xiangqi_auth.google_drafts WHERE token_hash=$1",
        [tokenHash],
      )
    ).rows[0];
    if (!initial)
      throw new GoogleError(
        "GOOGLE_INVALID",
        "Phiên đăng ký Google không hợp lệ",
        401,
      );
    const finished = await this.locked(initial.user_id, username, async (c) => {
      const draft = (
          await c.query(
            "SELECT * FROM xiangqi_auth.google_drafts WHERE token_hash=$1",
            [tokenHash],
          )
        ).rows[0],
        account = await this.account(c, initial.user_id);
      if (
        !draft ||
        !account ||
        account.method !== "google" ||
        draft.state === "cleanup"
      )
        throw new GoogleError(
          "GOOGLE_INVALID",
          "Phiên đăng ký Google không hợp lệ",
          401,
        );
      let user: Session["user"];
      try {
        user = await this.auth.getUser(proof.access_token);
      } catch (error) {
        if ((error as { status?: number })?.status !== 401) throw unavailable();
        throw new GoogleError(
          "GOOGLE_INVALID",
          "Xác thực Google không hợp lệ",
          401,
        );
      }
      if (
        user.id !== account.userId ||
        proof.user.id !== account.userId ||
        user.email?.toLowerCase() !== account.email ||
        !user.email_confirmed_at
      )
        throw new GoogleError(
          "GOOGLE_INVALID",
          "Xác thực Google không hợp lệ",
          401,
        );
      if (!account.completedAt) {
        if (draft.created_at.getTime() + 3600000 <= this.now().getTime())
          throw new GoogleError(
            "GOOGLE_EXPIRED",
            "Đăng ký Google đã hết hạn",
            401,
          );
        const taken = (
          await c.query(
            `SELECT EXISTS(SELECT 1 FROM public.profiles WHERE lower(username)=lower($1) AND user_id<>$2) OR EXISTS(SELECT 1 FROM xiangqi_auth.username_reservations WHERE username_key=lower($1) AND owner_id<>$2 AND expires_at>$3) taken`,
            [username, account.userId, this.now()],
          )
        ).rows[0].taken;
        if (taken)
          throw new GoogleError(
            "USERNAME_TAKEN",
            "Tên tài khoản đã được sử dụng",
            409,
          );
        await c.query(
          "UPDATE xiangqi_auth.google_drafts SET state='recovering' WHERE user_id=$1",
          [account.userId],
        );
        try {
          await this.auth.setPassword(account.userId, password);
        } catch {
          throw new GoogleError(
            "GOOGLE_RECOVERING",
            "Chưa thể hoàn tất đăng ký Google, vui lòng thử lại",
            503,
          );
        }
        try {
          await c.query(
            `INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,$2,$3,true) ON CONFLICT(user_id) DO UPDATE SET username=EXCLUDED.username,display_name=EXCLUDED.display_name,completed_at=EXCLUDED.completed_at`,
            [account.userId, username, this.now()],
          );
        } catch (error) {
          if ((error as { code?: string }).code === "23505")
            throw new GoogleError(
              "USERNAME_TAKEN",
              "Tên tài khoản đã được sử dụng",
              409,
            );
          throw unavailable();
        }
      }
      await this.clearPending(c, account, proof);
      return {
        account: (await this.account(c, account.userId))!,
        remember: draft.remember,
      };
    });
    const result = await this.issue(finished.account, proof, finished.remember);
    await this.query(
      "DELETE FROM xiangqi_auth.google_drafts WHERE user_id=$1 AND token_hash=$2",
      [finished.account.userId, tokenHash],
    );
    return result;
  }
  private async clearPending(
    c: PoolClient,
    account: GoogleAccount,
    proof: Session,
  ) {
    try {
      await this.auth.clearPending(account.userId);
      const current = await this.auth.getUser(proof.access_token);
      if (
        current.id !== account.userId ||
        !current.email_confirmed_at ||
        current.email?.toLowerCase() !== account.email
      )
        throw new Error("Provider proof changed");
      await c.query(
        "UPDATE public.profiles SET registration_pending=false WHERE user_id=$1",
        [account.userId],
      );
    } catch {
      throw new GoogleError(
        "GOOGLE_RECOVERING",
        "Chưa thể hoàn tất đăng ký Google, vui lòng thử lại",
        503,
      );
    }
  }
  async maintain() {
    await this.query(
      "DELETE FROM xiangqi_auth.google_challenges WHERE expires_at<=$1",
      [this.now()],
    );
    await this.query(
      "DELETE FROM xiangqi_auth.google_creation_intents WHERE expires_at<=statement_timestamp()",
    );
    const rows = (
      await this.query(
        "SELECT user_id,created_at FROM xiangqi_auth.google_temporary_accounts WHERE created_at<=$1 AND ($2::timestamptz IS NULL OR (created_at,user_id)>($2,$3::uuid)) ORDER BY created_at,user_id LIMIT 100",
        [
          new Date(this.now().getTime() - 3600000),
          this.cleanupCursor?.createdAt ?? null,
          this.cleanupCursor?.userId ?? null,
        ],
      )
    ).rows;
    for (const row of rows)
      await this.locked(row.user_id, undefined, async (c) => {
        const account = await this.account(c, row.user_id),
          marker = (
            await c.query(
              "SELECT created_at FROM xiangqi_auth.google_temporary_accounts WHERE user_id=$1",
              [row.user_id],
            )
          ).rows[0];
        if (
          !marker ||
          !account ||
          account.method !== "google" ||
          account.completedAt ||
          marker.created_at.getTime() + 3600000 > this.now().getTime()
        )
          return;
        await c.query(
          "UPDATE xiangqi_auth.google_drafts SET state='cleanup' WHERE user_id=$1",
          [row.user_id],
        );
        try {
          await this.auth.deleteTemporary(row.user_id);
        } catch {
          throw unavailable();
        }
      });
    const last = rows.at(-1);
    this.cleanupCursor =
      rows.length === 100 && last
        ? { createdAt: last.created_at, userId: last.user_id }
        : null;
  }
}
