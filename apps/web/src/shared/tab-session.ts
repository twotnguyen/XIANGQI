interface TabSession {
  id: string;
  source?: string;
}
const key = "xiangqi.tab";
const selector =
  /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const lockPrefix = "xiangqi-tab:";
let context: Promise<TabSession> | undefined;
// Sau lần khởi tạo đầu, gọi fetch đồng bộ để không thêm độ trễ cho mỗi request.
let ready: TabSession | undefined;

/** Giữ khóa selector tới khi trang đóng; trả null nếu tab khác đang giữ (tab nhân đôi). */
function acquire(selectorId: string): Promise<(() => void) | null> {
  return new Promise((resolve, reject) => {
    void navigator.locks
      .request(lockPrefix + selectorId, { ifAvailable: true }, (lock) => {
        if (!lock) {
          resolve(null);
          return;
        }
        return new Promise<void>((release) => resolve(release));
      })
      .catch(reject);
  });
}

async function tabSession(): Promise<TabSession> {
  if (context) return context;
  context = (async () => {
    const stored = sessionStorage.getItem(key);
    const previous = stored && selector.test(stored) ? stored : undefined;
    let id: string = crypto.randomUUID();
    let release: (() => void) | null = null;
    // Không có Web Locks thì mỗi lượt tải dùng selector mới và chỉ kế thừa từ selector trước.
    if (navigator.locks) {
      try {
        release = previous ? await acquire(previous) : null;
        if (release) id = previous!;
        else release = await acquire(id);
      } catch {
        release = null;
      }
    }
    sessionStorage.setItem(key, id);
    window.addEventListener(
      "pagehide",
      () => {
        release?.();
        context = undefined;
        ready = undefined;
      },
      { once: true },
    );
    ready = { id, source: previous ?? "last" };
    return ready;
  })().catch((error: unknown) => {
    context = undefined;
    ready = undefined;
    throw error;
  });
  return context;
}

/** Public tab identity, shared with realtime; Web Locks distinguish duplicated tabs. */
export async function getTabSessionId(): Promise<string> {
  return (ready ?? (await tabSession())).id;
}

/** Storage holds a public routing key only; session/refresh secrets stay in HttpOnly cookies. */
export async function tabSessionFetch(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  const tab = ready ?? (await tabSession());
  const headers = new Headers(init.headers);
  headers.set("X-Xiangqi-Tab", tab.id);
  if (tab.source) headers.set("X-Xiangqi-Tab-Source", tab.source);
  else headers.delete("X-Xiangqi-Tab-Source");
  return fetch(url, { ...init, headers });
}

/** Sau khi phiên của tab đã cài đặt, các request sau không cần kế thừa từ tab nguồn nữa. */
export function settleTabSession(): void {
  if (ready) ready.source = undefined;
  else
    void context?.then((tab) => {
      tab.source = undefined;
    });
}
