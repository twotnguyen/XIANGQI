import { createHash, randomBytes, randomUUID } from "node:crypto";
import { validateCredentials } from "./registration.service.js";
import {
  RegistrationError,
  type AuthProvider,
  type RegistrationStore,
} from "./registration.types.js";

type UsernameAuth = AuthProvider & {
  createUsernameAccount(
    email: string,
    password: string,
    intentNonce: string,
  ): Promise<string>;
};

export class UsernameRegistrationService {
  constructor(
    private readonly store: RegistrationStore,
    private readonly auth: UsernameAuth,
    private readonly emails: {
      createUsernameAccount(userId: string): Promise<void>;
    },
    private readonly issueSession: (
      userId: string,
    ) => Promise<{ appSession: string; expiresAt: string }>,
    private readonly now = () => new Date(),
  ) {}

  async register(input: unknown) {
    const credentials = validateCredentials(input);
    const supplied = (input as Record<string, unknown>).registrationToken;
    let draftHash: string | null = null;
    if (supplied !== undefined) {
      if (typeof supplied !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(supplied))
        throw new RegistrationError(
          "REGISTRATION_INVALID",
          "Phiên đăng ký không hợp lệ, vui lòng bắt đầu lại",
          400,
        );
      draftHash = createHash("sha256").update(supplied).digest("hex");
    }
    const initial = draftHash ? await this.store.draftByHash(draftHash) : null;
    if (draftHash && !initial)
      throw new RegistrationError(
        "REGISTRATION_EXPIRED",
        "Phiên đăng ký đã hết hạn, vui lòng bắt đầu lại",
        400,
      );
    const email = `${randomUUID()}@username.xiangqi.invalid`;
    const keys = [
      `username:${credentials.username.toLowerCase()}`,
      `email:${email}`,
      ...(initial ? [`email:${initial.email}`] : []),
    ];
    return this.store.withLocks(keys, async (store) => {
      if (await store.usernameTaken(credentials.username))
        throw new RegistrationError(
          "USERNAME_TAKEN",
          "Username đã có người dùng",
          409,
          1,
        );
      if (initial && draftHash) {
        const draft = await store.draftByHash(draftHash);
        if (
          !draft ||
          draft.email !== initial.email ||
          draft.userId !== initial.userId ||
          draft.username.toLowerCase() !== credentials.username.toLowerCase() ||
          this.now().getTime() - draft.createdAt.getTime() >= 65 * 60000
        )
          throw new RegistrationError(
            "REGISTRATION_INVALID",
            "Phiên đăng ký đã thay đổi, vui lòng bắt đầu lại",
            400,
          );
        const account = await store.accountById(draft.userId);
        if (
          !account ||
          account.completedAt ||
          account.verified ||
          !account.temporary
        )
          throw new RegistrationError(
            "REGISTRATION_RECOVERING",
            "Đăng ký đã được xác minh hoặc đang phục hồi, vui lòng đăng nhập",
            409,
          );
        // Only the capability-owned, unconfirmed draft is cancelled when skipping OTP.
        await this.auth.deletePending(draft.userId);
        await store.removeDraft(draft.userId);
        await store.removeIntent(draft.email);
      }
      const nonce = randomBytes(32).toString("base64url");
      await store.beginIntent(email, nonce, this.now());
      const userId = await this.auth.createUsernameAccount(
        email,
        credentials.password,
        nonce,
      );
      await store.bindIntent(email, userId);
      await this.emails.createUsernameAccount(userId);
      await store.complete(userId, credentials.username, this.now());
      await this.auth.clearPending(userId);
      await store.clearPending(userId);
      const provider = await this.auth.signInPassword(
        email,
        credentials.password,
      );
      if (
        provider.user.id !== userId ||
        provider.user.email?.toLowerCase() !== email ||
        !provider.user.email_confirmed_at ||
        provider.user.app_metadata?.registration_pending === true
      )
        throw new RegistrationError(
          "AUTH_PROVIDER_ERROR",
          "Dịch vụ xác thực chưa thể xử lý yêu cầu",
          503,
        );
      const session = await this.issueSession(userId);
      await store.removeIntent(email);
      return {
        access_token: provider.access_token,
        refresh_token: provider.refresh_token,
        expires_in: provider.expires_in,
        userId,
        username: credentials.username,
        ...session,
      };
    });
  }
}
