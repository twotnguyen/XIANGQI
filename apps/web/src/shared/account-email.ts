/** Trạng thái email của tài khoản, lấy từ GET /account/email. */
export interface AccountEmailStatus {
  email: string | null;
  emailVerified: boolean;
  pendingEmail: string | null;
  expiresAt: string | null;
  resendAt: string | null;
}

export type EmailStatusState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | ({ status: "ready" } & AccountEmailStatus);
