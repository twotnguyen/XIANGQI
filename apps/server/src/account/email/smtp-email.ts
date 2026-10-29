import nodemailer from "nodemailer";
import { EmailError, type EmailSender } from "./email.types.js";

const NOT_CONFIGURED = new EmailError(
  "EMAIL_NOT_CONFIGURED",
  "Chưa cấu hình gửi email xác minh",
  503,
);

/**
 * Tạo bộ gửi OTP qua SMTP từ biến môi trường.
 * Thiếu cấu hình thì sendOtp ném EMAIL_NOT_CONFIGURED (không giả lập thành công).
 * SMTP_SECURITY=tls dùng TLS trực tiếp (thường cổng 465); starttls dùng STARTTLS (thường cổng 587).
 */
export function createSmtpEmailSender(
  env: Record<string, string | undefined>,
): EmailSender {
  const host = env.SMTP_HOST;
  const port = Number(env.SMTP_PORT);
  const user = env.SMTP_USER;
  const pass = env.SMTP_PASSWORD;
  const from = env.SMTP_SENDER_EMAIL;
  const security = env.SMTP_SECURITY?.trim().toLowerCase();
  if (
    !host ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535 ||
    !user ||
    !pass ||
    !from ||
    (security !== "tls" && security !== "starttls")
  )
    return { sendOtp: async () => Promise.reject(NOT_CONFIGURED) };
  const name = env.SMTP_SENDER_NAME || "Cờ Tướng Online";
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: security === "tls",
    requireTLS: security === "starttls",
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  return {
    async sendOtp(to, otp) {
      try {
        await transport.sendMail({
          from: { name, address: from },
          to,
          subject: "Mã xác minh email XIANGQI",
          text: `Mã xác minh của bạn là ${otp}. Mã có hiệu lực trong 3 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.`,
        });
      } catch {
        // Không ghi lỗi SMTP chi tiết hay OTP ra log.
        throw new EmailError(
          "EMAIL_SEND_FAILED",
          "Không thể gửi email xác minh, vui lòng thử lại",
          503,
        );
      }
    },
  };
}
