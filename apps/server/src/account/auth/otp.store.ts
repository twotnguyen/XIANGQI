import { createHash } from "node:crypto";
import type { PoolClient } from "pg";

export const OTP_LIMIT_MESSAGE =
  "Bạn đã yêu cầu quá nhiều mã, vui lòng thử lại sau";

/** Called in the challenge transaction immediately before SMTP; failures still consume this send. */
export async function reserveOtpSend(
  client: PoolClient,
  userId: string,
  email: string,
  now: Date,
): Promise<boolean> {
  const emailHash = createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex");
  for (const key of [`otp:user:${userId}`, `otp:email:${emailHash}`].sort())
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
      key,
    ]);
  const since = new Date(now.getTime() - 3600_000);
  await client.query(
    "DELETE FROM xiangqi_auth.otp_sends WHERE (user_id=$1 OR email_hash=$2) AND attempted_at<=$3",
    [userId, emailHash, since],
  );
  const counts = (
    await client.query<{ userCount: number; emailCount: number }>(
      `SELECT count(*) FILTER(WHERE user_id=$1)::int AS "userCount", count(*) FILTER(WHERE email_hash=$2)::int AS "emailCount"
     FROM xiangqi_auth.otp_sends WHERE (user_id=$1 OR email_hash=$2) AND attempted_at>$3`,
      [userId, emailHash, since],
    )
  ).rows[0]!;
  if (counts.userCount >= 5 || counts.emailCount >= 5) return false;
  await client.query(
    "INSERT INTO xiangqi_auth.otp_sends(user_id,email_hash,attempted_at) VALUES($1,$2,$3)",
    [userId, emailHash, now],
  );
  return true;
}
