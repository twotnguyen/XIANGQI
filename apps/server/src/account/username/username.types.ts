export type UsernamePurpose = "username-change" | "username-recovery";

export class UsernameError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status = 400,
    readonly retryAfterDays?: number,
  ) {
    super(message);
  }
}

/** Tài khoản có email xác minh để nhận OTP; `contactEmail` null nghĩa là không đủ điều kiện. */
export interface UsernameAccount {
  userId: string;
  username: string | null;
  usernameChangedAt: Date | null;
  contactEmail: string | null;
  active: boolean;
}

export interface UsernameChallenge {
  userId: string;
  purpose: UsernamePurpose;
  requestHash: string;
  contactEmail: string;
  verifiedHash: string | null;
  verifiedExpiresAt: Date | null;
  otpHash: string | null;
  sentAt: Date;
  expiresAt: Date;
  attempts: number;
}

export type OtpMatcher = (row: UsernameChallenge) => boolean;
