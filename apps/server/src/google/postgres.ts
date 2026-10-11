import type { Pool, PoolClient } from "pg";
// Owns role/transaction/locks; nested work receives the same client, never a second pool checkout.
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
export async function actorLock(client: PoolClient, userId: string) {
  await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
    `actor:${userId}`,
  ]);
}
