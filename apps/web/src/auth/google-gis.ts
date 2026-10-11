export interface GoogleIdentity {
  initialize(config: {
    client_id: string;
    nonce: string;
    ux_mode: "popup";
    auto_select: false;
    callback(response: { credential?: unknown }): void;
  }): void;
  renderButton(
    element: HTMLElement,
    options: {
      type: "standard";
      theme: "outline";
      size: "large";
      text: "signin_with" | "signup_with" | "continue_with";
      locale: "vi";
      width: string;
      click_listener(): void;
    },
  ): void;
}
declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleIdentity } };
  }
}
const unavailable = "Chưa thể xác thực Google. Vui lòng thử lại.";
const scriptUrl = "https://accounts.google.com/gsi/client";
let loading: Promise<GoogleIdentity> | null = null;
export function loadGoogleIdentity(): Promise<GoogleIdentity> {
  if (window.google?.accounts?.id)
    return Promise.resolve(window.google.accounts.id);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    const failure = () => {
      script.remove();
      loading = null;
      reject(new Error(unavailable));
    };
    script.addEventListener("error", failure, { once: true });
    script.addEventListener(
      "load",
      () => {
        const id = window.google?.accounts?.id;
        if (!id) failure();
        else resolve(id);
      },
      { once: true },
    );
    document.head.append(script);
  });
  return loading;
}
const messages: Record<string, string> = {
  EMAIL_TAKEN: "Email này đã được đăng ký",
  USERNAME_TAKEN: "Username đã có người dùng. Vui lòng chọn Username khác.",
  USERNAME_FORBIDDEN: "Username chứa từ không được phép sử dụng.",
  GOOGLE_EXPIRED: "Phiên thiết lập đã hết hạn. Vui lòng xác thực Google lại.",
  GOOGLE_INVALID:
    "Phiên xác thực Google không hợp lệ. Vui lòng xác thực Google lại.",
  GOOGLE_RECOVERING: "Chưa thể hoàn tất thiết lập. Vui lòng thử lại.",
};
export class GoogleRequestError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
  ) {
    super(messages[code] ?? unavailable);
  }
}
async function request(
  path: string,
  body?: object,
  signal?: AbortSignal,
): Promise<unknown> {
  const base = (
    import.meta.env.VITE_API_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
  const response = await fetch(`${base}${path}`, {
    method: body === undefined ? "GET" : "POST",
    credentials: "include",
    redirect: "error",
    cache: "no-store",
    ...(body === undefined
      ? {}
      : {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
    signal,
  });
  let value: unknown;
  try {
    value = await response.json();
  } catch {
    throw new GoogleRequestError("GOOGLE_UNAVAILABLE", response.status);
  }
  if (!response.ok) {
    const code =
      value && typeof value === "object"
        ? (value as { code?: unknown }).code
        : undefined;
    throw new GoogleRequestError(
      typeof code === "string" && Object.hasOwn(messages, code)
        ? code
        : "GOOGLE_UNAVAILABLE",
      response.status,
    );
  }
  return value;
}
export async function googleAvailable(signal?: AbortSignal): Promise<boolean> {
  const value = await request("/auth/providers", undefined, signal);
  if (
    !value ||
    typeof value !== "object" ||
    typeof (value as { google?: unknown }).google !== "boolean" ||
    typeof (value as { guest?: unknown }).guest !== "boolean"
  )
    throw new Error(unavailable);
  return (value as { google: boolean }).google;
}
export function googleRequest(
  path: "challenge" | "authenticate" | "onboarding" | "complete",
  body?: object,
  signal?: AbortSignal,
) {
  return request(`/auth/google/${path}`, body, signal);
}
export interface GooglePending {
  kind: "pending";
  expiresAt: string;
  recovering: boolean;
  email?: string;
  avatar?: { kind: "initials"; text: string };
}
export function parseGooglePending(
  value: unknown,
  metadata = false,
): GooglePending {
  if (!value || typeof value !== "object") throw new Error(unavailable);
  const row = value as Record<string, unknown>;
  if (
    row.kind !== "pending" ||
    typeof row.expiresAt !== "string" ||
    !Number.isFinite(Date.parse(row.expiresAt)) ||
    (Date.parse(row.expiresAt) <= Date.now() && row.recovering !== true)
  )
    throw new Error(unavailable);
  const pending: GooglePending = {
    kind: "pending",
    expiresAt: row.expiresAt,
    recovering: row.recovering === true,
  };
  if (metadata) {
    const avatar = row.avatar as { kind?: unknown; text?: unknown } | undefined;
    if (
      typeof row.recovering !== "boolean" ||
      typeof row.email !== "string" ||
      row.email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email) ||
      avatar?.kind !== "initials" ||
      typeof avatar.text !== "string" ||
      Array.from(avatar.text).length !== 1 ||
      Array.from(avatar.text).some(
        (c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127,
      )
    )
      throw new Error(unavailable);
    pending.email = row.email;
    pending.avatar = { kind: "initials", text: avatar.text };
  }
  return pending;
}
