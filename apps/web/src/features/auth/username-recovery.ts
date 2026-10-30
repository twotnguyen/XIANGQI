import {
  parseWindow,
  post,
  PasswordRequestError,
} from "./password-recovery.js";

// requestId chỉ nằm trong state của component: không đưa vào URL hay storage.
export function startUsernameRecovery(email: string) {
  return post("/auth/username/recovery", { email }, parseWindow);
}

export function resendUsernameRecovery(requestId: string) {
  return post("/auth/username/recovery/resend", { requestId }, parseWindow);
}

export function verifyUsernameRecovery(requestId: string, otp: string) {
  return post("/auth/username/recovery/verify", { requestId, otp }, (value) => {
    if (
      !value ||
      typeof value !== "object" ||
      !("username" in value) ||
      typeof value.username !== "string"
    )
      throw new PasswordRequestError("USERNAME_BAD_RESPONSE", 502);
    return value.username;
  });
}
