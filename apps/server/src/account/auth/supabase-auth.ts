import {
  RegistrationError,
  type AuthProvider,
  type Session,
} from "./contracts.js";

export class SupabaseAuth implements AuthProvider {
  constructor(
    private readonly url: string,
    private readonly publishable: string,
    private readonly secret: string,
  ) {}
  private async request(
    path: string,
    body?: unknown,
    admin = false,
    token?: string,
    method = "POST",
    signal?: AbortSignal,
  ): Promise<Record<string, unknown>> {
    try {
      const key = admin ? this.secret : this.publishable;
      const headers: Record<string, string> = {
        apikey: key,
        "Content-Type": "application/json",
      };
      if (admin || token) headers.Authorization = `Bearer ${token ?? key}`;
      const response = await fetch(
        `${this.url.replace(/\/$/, "")}/auth/v1/${path}`,
        {
          method,
          redirect: "error",
          headers,
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
          signal: signal
            ? AbortSignal.any([signal, AbortSignal.timeout(10000)])
            : AbortSignal.timeout(10000),
        },
      );
      if (response.status === 429)
        throw new RegistrationError(
          "OTP_RATE_LIMIT",
          "Bạn đã thử quá nhiều lần, hãy chờ hoặc gửi mã mới",
          429,
        );
      if (path === "verify" && [400, 403].includes(response.status))
        throw new RegistrationError(
          "OTP_INVALID",
          "Mã xác minh không đúng hoặc đã hết hạn, vui lòng gửi mã mới",
        );
      if (
        (path === "user" && [401, 403].includes(response.status)) ||
        (path === "token?grant_type=refresh_token" &&
          [400, 401, 403].includes(response.status))
      )
        throw new RegistrationError(
          "SESSION_INVALID",
          "Phiên đăng nhập không hợp lệ",
          401,
        );
      if (
        path === "token?grant_type=password" &&
        [400, 401, 403].includes(response.status)
      )
        throw new RegistrationError(
          "RECOVERY_PASSWORD_INVALID",
          "Mật khẩu không đúng, vui lòng xác thực lại",
          401,
        );
      if (!response.ok)
        throw new RegistrationError(
          "AUTH_PROVIDER_ERROR",
          "Dịch vụ xác thực chưa thể xử lý yêu cầu",
          503,
        );
      const value: unknown = await response.json();
      if (!value || typeof value !== "object" || Array.isArray(value))
        throw new Error();
      return value as Record<string, unknown>;
    } catch (error) {
      if (error instanceof RegistrationError) throw error;
      throw new RegistrationError(
        "AUTH_PROVIDER_ERROR",
        "Dịch vụ xác thực chưa thể xử lý yêu cầu",
        503,
      );
    }
  }
  async signup(email: string, password: string, intentNonce: string) {
    try {
      const user = await this.request("signup", {
        email,
        password,
        data: { registration_intent: intentNonce },
      });
      if (
        typeof user.id !== "string" ||
        !/^[0-9a-f-]{36}$/i.test(user.id) ||
        user.access_token
      )
        throw new Error();
      return user.id;
    } catch {
      throw new RegistrationError(
        "OTP_SEND_FAILED",
        "Không gửi được mã, vui lòng thử lại sau",
        503,
      );
    }
  }
  async updatePendingPassword(userId: string, password: string) {
    await this.request(
      `admin/users/${userId}`,
      { password },
      true,
      undefined,
      "PUT",
    );
  }
  async resend(email: string) {
    try {
      await this.request("resend", { type: "signup", email });
    } catch {
      throw new RegistrationError(
        "OTP_SEND_FAILED",
        "Không gửi được mã, vui lòng thử lại sau",
        503,
      );
    }
  }
  async verify(email: string, otp: string): Promise<Session> {
    return this.session("verify", { email, token: otp, type: "email" });
  }
  async signInPassword(
    email: string,
    password: string,
    signal?: AbortSignal,
  ): Promise<Session> {
    return this.session(
      "token?grant_type=password",
      { email, password },
      signal,
    );
  }
  async refreshSession(refreshToken: unknown): Promise<Session> {
    if (typeof refreshToken !== "string" || !refreshToken)
      throw new RegistrationError(
        "SESSION_INVALID",
        "Phiên đăng nhập không hợp lệ",
        401,
      );
    return this.session("token?grant_type=refresh_token", {
      refresh_token: refreshToken,
    });
  }
  async exchangeIDToken(
    credential: string,
    rawNonce: string,
  ): Promise<Session> {
    return this.session("token?grant_type=id_token", {
      provider: "google",
      id_token: credential,
      nonce: rawNonce,
    });
  }
  async setPassword(userId: string, password: string) {
    await this.updatePendingPassword(userId, password);
  }
  async deleteTemporary(userId: string) {
    await this.deletePending(userId);
  }
  private async session(
    path: string,
    body: object,
    signal?: AbortSignal,
  ): Promise<Session> {
    try {
      const session = await this.request(
        path,
        body,
        false,
        undefined,
        "POST",
        signal,
      );
      const user = session.user;
      if (
        !user ||
        typeof user !== "object" ||
        !("id" in user) ||
        typeof user.id !== "string" ||
        typeof session.access_token !== "string" ||
        typeof session.refresh_token !== "string" ||
        typeof session.expires_in !== "number"
      )
        throw new Error();
      return {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_in: session.expires_in,
        user: user as Session["user"],
      };
    } catch (error) {
      if (error instanceof RegistrationError) throw error;
      throw new RegistrationError(
        "AUTH_PROVIDER_ERROR",
        "Dịch vụ xác thực chưa thể xử lý yêu cầu",
        503,
      );
    }
  }
  async clearPending(userId: string) {
    await this.request(
      `admin/users/${userId}`,
      { app_metadata: { registration_pending: false } },
      true,
      undefined,
      "PUT",
    );
  }
  async deletePending(userId: string) {
    await this.request(
      `admin/users/${userId}`,
      undefined,
      true,
      undefined,
      "DELETE",
    );
  }
  async getUser(token: string): Promise<Session["user"]> {
    const user = await this.request("user", undefined, false, token, "GET");
    if (typeof user.id !== "string")
      throw new RegistrationError(
        "SESSION_INVALID",
        "Phiên đăng nhập không hợp lệ",
        401,
      );
    return user as unknown as Session["user"];
  }
}
