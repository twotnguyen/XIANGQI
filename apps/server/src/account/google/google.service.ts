import { createHash, randomBytes } from "node:crypto";
import type { Session } from "../auth/registration.types.js";
import { validateUsername } from "../auth/registration.service.js";
import {
  GoogleError,
  type GoogleAuth,
  type GoogleClaims,
  type GoogleIdentityVerifier,
  type GoogleSessionIssuer,
} from "./google.types.js";
import type {
  CleanupCursor,
  GoogleAccount,
  GoogleStore,
  GoogleTx,
} from "./google.store.js";
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
/**
 * Dịch vụ xử lý nghiệp vụ đăng nhập và đăng ký qua Google:
 * Quản lý nonce challenge, xác thực ID token, tạo draft onboarding và thu hồi tài khoản tạm.
 */
export class GoogleService {
  private cleanupCursor: CleanupCursor | null = null;
  constructor(
    private readonly store: GoogleStore,
    private readonly verifier: GoogleIdentityVerifier,
    private readonly auth: GoogleAuth,
    private readonly issuer: GoogleSessionIssuer,
    private readonly clientId: string,
    private readonly now = () => new Date(),
  ) {}
  /** Any database failure of a stand-alone store call is reported as unavailable. */
  private async db<T>(work: () => Promise<T>): Promise<T> {
    try {
      return await work();
    } catch {
      throw unavailable();
    }
  }
  private byEmail(email: string): Promise<GoogleAccount | undefined> {
    return this.db(() => this.store.findAccountByEmail(email));
  }
  /**
   * Tạo phiên thử thách (challenge) mới chứa capability token và nonce để gửi cho client.
   */
  async beginChallenge() {
    const capability = randomBytes(32).toString("base64url"),
      nonce = hash(capability),
      expires = new Date(this.now().getTime() + 300000);
    await this.db(() => this.store.insertChallenge(nonce, expires));
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
  /**
   * Xác thực Google ID Token gửi từ client:
   * Kiểm tra chữ ký, so khớp nonce, liên kết với Supabase Auth và phân nhánh thành công hoặc cần onboarding.
   */
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
    const consumed = await this.db(() =>
      this.store.consumeChallenge(nonce, this.now()),
    );
    if (!consumed)
      throw new GoogleError(
        "GOOGLE_INVALID",
        "Xác thực Google không hợp lệ",
        401,
      );
    const before = await this.byEmail(claims.email);
    if (before?.method === "email") throw duplicate();
    if (!before) {
      try {
        await this.store.recordCreationIntent(claims.email, claims.sub);
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
    const subject = await this.db(() => this.store.findSubject(account.userId));
    if (subject !== claims.sub)
      throw new GoogleError(
        "GOOGLE_INVALID",
        "Xác thực Google không hợp lệ",
        401,
      );
    const decision = await this.store.locked(
      account.userId,
      undefined,
      async (tx) => {
        const fresh = await tx.account(account.userId);
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
          if (fresh.pending) await this.clearPending(tx, fresh, session);
          return {
            kind: "member" as const,
            account: fresh,
            draftHash: await tx.draftHash(fresh.userId),
          };
        }
        const capability = randomBytes(32).toString("base64url");
        const marker = await tx.temporaryCreatedAt(fresh.userId);
        const prior = await tx.draftCreatedAt(fresh.userId);
        const createdAt = marker ?? prior ?? this.now();
        if (createdAt.getTime() + 3600000 <= this.now().getTime())
          throw new GoogleError(
            "GOOGLE_EXPIRED",
            "Đăng ký Google đã hết hạn",
            401,
          );
        const draftCreatedAt = await tx.upsertDraft({
          tokenHash: hash(capability),
          userId: fresh.userId,
          createdAt,
          remember,
          owned: !!marker,
        });
        return {
          kind: "pending" as const,
          capability,
          expiresAt: new Date(draftCreatedAt.getTime() + 3600000).toISOString(),
          session,
        };
      },
    );
    if (decision.kind === "member") {
      const result = await this.issue(decision.account, session, remember);
      if (decision.draftHash)
        await this.db(() =>
          this.store.deleteDraft(decision.account.userId, decision.draftHash!),
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
  /**
   * Truy vấn thông tin trạng thái chuẩn bị tạo tài khoản (onboarding) của người dùng Google.
   */
  async onboarding(capability: unknown) {
    const row = await this.db(() =>
      this.store.findOnboarding(hash(capability)),
    );
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
  /**
   * Hoàn tất tạo tài khoản Google: lưu tên người dùng, mật khẩu dự phòng và kích hoạt hồ sơ.
   */
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
    const initialUserId = await this.db(() =>
      this.store.findDraftOwner(tokenHash),
    );
    if (!initialUserId)
      throw new GoogleError(
        "GOOGLE_INVALID",
        "Phiên đăng ký Google không hợp lệ",
        401,
      );
    const finished = await this.store.locked(
      initialUserId,
      username,
      async (tx) => {
        const draft = await tx.findDraft(tokenHash),
          account = await tx.account(initialUserId);
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
          if ((error as { status?: number })?.status !== 401)
            throw unavailable();
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
        let activeProof = proof;
        if (!account.completedAt) {
          if (draft.created_at.getTime() + 3600000 <= this.now().getTime())
            throw new GoogleError(
              "GOOGLE_EXPIRED",
              "Đăng ký Google đã hết hạn",
              401,
            );
          if (await tx.isUsernameTaken(username, account.userId, this.now()))
            throw new GoogleError(
              "USERNAME_TAKEN",
              "Tên tài khoản đã được sử dụng",
              409,
            );
          await tx.markDraftRecovering(account.userId);
          try {
            await this.auth.setPassword(account.userId, password);
          } catch {
            throw new GoogleError(
              "GOOGLE_RECOVERING",
              "Chưa thể hoàn tất đăng ký Google, vui lòng thử lại",
              503,
            );
          }
          let saved: boolean;
          try {
            saved = await tx.saveCompletedProfile(
              account.userId,
              username,
              this.now(),
            );
          } catch {
            throw unavailable();
          }
          if (!saved)
            throw new GoogleError(
              "USERNAME_TAKEN",
              "Tên tài khoản đã được sử dụng",
              409,
            );
          try {
            // The password update revoked the Google proof session; continue on a fresh one.
            activeProof = await this.auth.signInPassword(
              account.email,
              password,
            );
          } catch {
            throw new GoogleError(
              "GOOGLE_RECOVERING",
              "Chưa thể hoàn tất đăng ký Google, vui lòng thử lại",
              503,
            );
          }
        }
        await this.clearPending(tx, account, activeProof);
        return {
          account: (await tx.account(account.userId))!,
          remember: draft.remember,
          session: activeProof,
        };
      },
    );
    const result = await this.issue(
      finished.account,
      finished.session,
      finished.remember,
    );
    await this.db(() =>
      this.store.deleteDraft(finished.account.userId, tokenHash),
    );
    return result;
  }
  private async clearPending(
    tx: GoogleTx,
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
      await tx.clearRegistrationPending(account.userId);
    } catch {
      throw new GoogleError(
        "GOOGLE_RECOVERING",
        "Chưa thể hoàn tất đăng ký Google, vui lòng thử lại",
        503,
      );
    }
  }
  /**
   * Tác vụ bảo trì định kỳ: dọn dẹp các challenge quá hạn và xóa tài khoản Google tạm không hoàn thành.
   */
  async maintain() {
    await this.db(() => this.store.purgeExpiredChallenges(this.now()));
    await this.db(() => this.store.purgeExpiredIntents());
    const rows = await this.db(() =>
      this.store.temporaryAccountsBefore(
        new Date(this.now().getTime() - 3600000),
        this.cleanupCursor,
      ),
    );
    for (const row of rows)
      await this.store.locked(row.user_id, undefined, async (tx) => {
        const account = await tx.account(row.user_id),
          markerCreatedAt = await tx.temporaryCreatedAt(row.user_id);
        if (
          !markerCreatedAt ||
          !account ||
          account.method !== "google" ||
          account.completedAt ||
          markerCreatedAt.getTime() + 3600000 > this.now().getTime()
        )
          return;
        await tx.markDraftCleanup(row.user_id);
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
