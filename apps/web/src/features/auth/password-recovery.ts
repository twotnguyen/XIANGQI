import { getApiBaseUrl } from "../../shared/api.js";

export interface RecoveryWindow {
  requestId: string;
  expiresAt: string;
  resendAt: string;
}

export class PasswordRequestError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
  ) {
    super("Chưa thể xử lý yêu cầu. Vui lòng thử lại.");
  }
}

// requestId chỉ giữ trong bộ nhớ: không đưa vào URL, localStorage hay sessionStorage.
let pending: RecoveryWindow | null = null;
export function getPendingRecovery(): RecoveryWindow | null {
  return pending;
}
export function setPendingRecovery(value: RecoveryWindow | null) {
  pending = value;
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new PasswordRequestError("PASSWORD_BAD_RESPONSE", 502);
  return value as Record<string, unknown>;
}

function parseWindow(value: unknown): RecoveryWindow {
  const result = record(value);
  if (
    typeof result.requestId !== "string" ||
    typeof result.expiresAt !== "string" ||
    typeof result.resendAt !== "string"
  )
    throw new PasswordRequestError("PASSWORD_BAD_RESPONSE", 502);
  return {
    requestId: result.requestId,
    expiresAt: result.expiresAt,
    resendAt: result.resendAt,
  };
}

async function post<T>(
  path: string,
  body: object,
  parse: (value: unknown) => T,
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    credentials: "include",
    redirect: "error",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    let code = "PASSWORD_UNAVAILABLE";
    try {
      const value = record(await response.json());
      if (typeof value.code === "string") code = value.code;
    } catch {
      /* Không hiển thị nội dung phản hồi thô từ máy chủ. */
    }
    throw new PasswordRequestError(code, response.status);
  }
  try {
    return parse(await response.json());
  } catch (error) {
    if (error instanceof PasswordRequestError) throw error;
    throw new PasswordRequestError("PASSWORD_BAD_RESPONSE", 502);
  }
}

export function startRecovery(username: string) {
  return post("/auth/password/recovery", { username }, parseWindow);
}

export function resendRecovery(requestId: string) {
  return post("/auth/password/recovery/resend", { requestId }, parseWindow);
}

export function verifyRecovery(requestId: string, otp: string) {
  return post("/auth/password/recovery/verify", { requestId, otp }, (value) => {
    const result = record(value);
    if (typeof result.resetToken !== "string")
      throw new PasswordRequestError("PASSWORD_BAD_RESPONSE", 502);
    return { resetToken: result.resetToken };
  });
}

export function resetPassword(body: {
  requestId: string;
  resetToken: string;
  newPassword: string;
  passwordConfirmation: string;
}) {
  return post("/auth/password/recovery/reset", body, (value) => {
    if (record(value).ok !== true)
      throw new PasswordRequestError("PASSWORD_BAD_RESPONSE", 502);
    return { ok: true as const };
  });
}
