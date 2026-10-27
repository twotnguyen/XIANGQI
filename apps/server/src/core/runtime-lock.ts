import type { Pool, PoolClient } from "pg";

/**
 * Khóa đơn (singleton) cấp phiên: chỉ một game runtime giữ trên một database.
 * Khóa nằm trên một kết nối riêng; PID của kết nối đó là danh tính holder.
 * Barrier (shared/exclusive) cùng namespace: mọi kết nối phòng đang checkout giữ shared
 * và được fence bằng PID holder; successor lấy exclusive barrier để chờ kết nối cũ trả về
 * trước khi recovery. Yêu cầu: DATABASE kết nối trực tiếp hoặc session pooler (không dùng transaction pooler).
 */
const LOCK_CLASS = 7204;
const SINGLETON_KEY = 1;
const BARRIER_KEY = 2;
const BARRIER_TIMEOUT = "10s";

export interface RuntimeLock {
  /** Resolve khi kết nối giữ khóa bị lỗi/đóng: runtime phải fail-closed. */
  readonly lost: Promise<Error>;
  /** PID backend giữ khóa đơn; kết nối phòng phải chứng minh PID này vẫn giữ khóa. */
  readonly holderPid: number;
  /** Throw nếu khóa đã mất hoặc đã release. */
  ready(): void;
  /** Idempotent. Gỡ khóa rồi trả kết nối; nếu gỡ lỗi thì hủy kết nối (PostgreSQL tự nhả khóa). */
  release(): Promise<void>;
}

/**
 * Giành khóa không chờ singleton. Sau khi giành, chờ barrier exclusive để mọi kết nối phòng
 * đang checkout của holder trước đã trả về; rồi nhả barrier để kết nối của holder mới dùng được.
 * Gọi trước mọi bước khởi động có ghi dữ liệu (recovery).
 */
export async function acquireRuntimeLock(pool: Pool): Promise<RuntimeLock> {
  const client = await pool.connect();
  let lostError: Error | null = null;
  let released = false;
  let releasing: Promise<void> | undefined;
  let resolveLost!: (error: Error) => void;
  const lost = new Promise<Error>((resolve) => {
    resolveLost = resolve;
  });
  const markLost = (error: Error) => {
    if (lostError || released) return;
    lostError = error;
    resolveLost(error);
  };
  const onError = (error: Error) => markLost(error);
  const onEnd = () => markLost(new Error("Runtime lock connection ended"));
  const detach = () => {
    client.removeListener("error", onError);
    client.removeListener("end", onEnd);
  };
  client.on("error", onError);
  client.on("end", onEnd);

  let locked: boolean;
  let holderPid: number;
  try {
    const result = await client.query<{ locked: boolean; pid: number }>(
      "SELECT pg_try_advisory_lock($1::int,$2::int) AS locked, pg_backend_pid() AS pid",
      [LOCK_CLASS, SINGLETON_KEY],
    );
    locked = result.rows[0]?.locked === true;
    holderPid = result.rows[0]?.pid ?? 0;
    if (locked) {
      await client.query(`SET lock_timeout = '${BARRIER_TIMEOUT}'`);
      try {
        await client.query("SELECT pg_advisory_lock($1::int,$2::int)", [
          LOCK_CLASS,
          BARRIER_KEY,
        ]);
      } catch {
        throw new Error("Previous runtime transactions did not drain");
      }
      await client.query("SELECT pg_advisory_unlock($1::int,$2::int)", [
        LOCK_CLASS,
        BARRIER_KEY,
      ]);
      await client.query("RESET lock_timeout");
    }
  } catch (error) {
    detach();
    client.release(true);
    throw error;
  }
  // A connection lost after the query resolved never holds a usable lock:
  // destroy it (the server frees the session lock) instead of returning a holder.
  if (lostError) {
    detach();
    client.release(true);
    throw new Error("Runtime lock connection was lost during acquisition");
  }
  if (!locked) {
    detach();
    client.release();
    throw new Error("Game runtime is already active on another instance");
  }

  return {
    lost,
    holderPid,
    ready() {
      if (released) throw new Error("Room runtime lock is released");
      if (lostError) throw new Error("Room runtime lock was lost");
    },
    release() {
      return (releasing ??= (async () => {
        released = true;
        if (lostError) {
          detach();
          client.release(true);
          return;
        }
        try {
          await client.query("SELECT pg_advisory_unlock($1::int,$2::int)", [
            LOCK_CLASS,
            SINGLETON_KEY,
          ]);
        } catch (error) {
          detach();
          client.release(true);
          throw error;
        }
        detach();
        client.release();
      })());
    },
  };
}

/**
 * Fence kết nối phòng trước khi dùng: giữ shared barrier tới khi unfence, và chứng minh
 * holder PID vẫn giữ khóa đơn. Holder cũ (kết nối đã mất) không qua được bước này.
 * Lỗi thì caller phải hủy kết nối.
 */
export async function fenceClient(
  client: PoolClient,
  holderPid: number,
): Promise<void> {
  const result = await client.query<{ shared: boolean; owner: boolean }>(
    `WITH barrier AS MATERIALIZED (
       SELECT pg_try_advisory_lock_shared($1::int,$2::int) AS shared
     )
     SELECT shared,shared AND EXISTS(
       SELECT 1 FROM pg_locks WHERE locktype='advisory' AND granted
       AND classid=$1::oid AND objid=$3::oid AND objsubid=2 AND pid=$4::int
     ) AS owner FROM barrier`,
    [LOCK_CLASS, BARRIER_KEY, SINGLETON_KEY, holderPid],
  );
  if (result.rows[0]?.shared !== true)
    throw new Error("Runtime barrier is held by a successor");
  if (result.rows[0]?.owner !== true)
    throw new Error("Room runtime lock holder is no longer active");
}

/** Nhả shared barrier của kết nối phòng đã fence (sau khi giao dịch đã kết thúc). */
export async function unfenceClient(client: PoolClient): Promise<void> {
  await client.query("SELECT pg_advisory_unlock_shared($1::int,$2::int)", [
    LOCK_CLASS,
    BARRIER_KEY,
  ]);
}
