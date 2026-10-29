export class EmailError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 409,
  ) {
    super(message);
  }
}

export const OTP_TTL_MS = 180_000;
export const RESEND_COOLDOWN_MS = 60_000;
export const OTP_MAX_ATTEMPTS = 5;
export const ALIAS_DOMAIN = "username.xiangqi.invalid";

export interface EmailStatus {
  email: string | null;
  emailVerified: boolean;
  pendingEmail: string | null;
  expiresAt: string | null;
  resendAt: string | null;
}

/** Gửi OTP tới địa chỉ. Ném EmailError nếu không gửi được. */
export interface EmailSender {
  sendOtp(to: string, otp: string): Promise<void>;
}

/** Hàng đọc từ username_accounts kèm credential email của Auth. */
export interface EmailAccountRow {
  userId: string;
  credentialEmail: string;
  confirmed: boolean;
  initialized: boolean;
  contactEmail: string | null;
  verifiedAt: Date | null;
  pendingEmail: string | null;
  otpHash: string | null;
  lastSentAt: Date | null;
  expiresAt: Date | null;
  attempts: number;
}
