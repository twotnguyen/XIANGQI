import type { Pool, PoolClient } from "pg";
/**
 * Quản lý vòng đời transaction PostgreSQL với role 'app_server':
 * Tự động kết nối, mở transaction, chuyển role, thực thi callback và commit hoặc rollback khi có lỗi.
 */
export async function transaction<T>(
  pool: Pool,
  work: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  let broken = false;
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL ROLE app_server");
    const value = await work(client);
    await client.query("COMMIT");
    return value;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      broken = true;
    }
    throw error;
  } finally {
    client.release(broken);
  }
}
/**
 * Khóa advisory theo định danh người chơi (actor lock) trong phạm vi transaction hiện tại
 * nhằm ngăn chặn xung đột dữ liệu khi nhiều tác vụ đồng thời tác động lên cùng một người dùng.
 */
export async function actorLock(client: PoolClient, userId: string) {
  await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
    `actor:${userId}`,
  ]);
}
