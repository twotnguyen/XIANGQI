import { useEffect, useState } from "react";
import "./friends.css";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
  Tabs,
  TextField,
} from "../../shared/ui/primitives.js";
import {
  FriendRequestError,
  type FriendClient,
  type FriendPeer,
  type FriendRequest,
} from "./friend-client.js";
function statusLabel(status: FriendPeer["status"]) {
  return status === "online"
    ? "Trực tuyến"
    : status === "in-match"
      ? "Đang đấu"
      : "Ngoại tuyến";
}
function errorText(error: unknown) {
  if (error instanceof FriendRequestError) {
    switch (error.code) {
      case "FRIEND_LIMIT":
        return "Bạn đã có tối đa 200 bạn.";
      case "FRIEND_INVITE_LIMIT":
        return "Quá nhiều lời mời đang chờ (tối đa 50).";
      case "FRIEND_BLOCKED":
        return "Không thể gửi lời mời lúc này.";
      case "FRIEND_ALREADY":
        return "Hai bạn đã là bạn bè.";
      default:
        return "Thao tác chưa thực hiện được. Vui lòng thử lại.";
    }
  }
  return "Chưa thể tải dữ liệu. Kiểm tra kết nối rồi thử lại.";
}
export function FriendsPage({ client }: { client: FriendClient }) {
  const [friends, setFriends] = useState<FriendPeer[] | null>(null);
  const [requests, setRequests] = useState<FriendRequest[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FriendPeer[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  async function load() {
    setFailed(false);
    try {
      const [list, pending] = await Promise.all([
        client.list(),
        client.requests(),
      ]);
      setFriends(list);
      setRequests(pending);
    } catch {
      setFailed(true);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function search() {
    if (!query.trim() || busy) return;
    setSearching(true);
    setNotice("");
    try {
      setResults(await client.search(query));
    } catch (error) {
      setNotice(errorText(error));
    } finally {
      setSearching(false);
    }
  }
  async function act(id: string, work: () => Promise<unknown>) {
    if (busy) return;
    setBusy(id);
    setNotice("");
    try {
      await work();
      await load();
    } catch (error) {
      setNotice(errorText(error));
    } finally {
      setBusy(null);
    }
  }
  if (failed)
    return (
      <main>
        <h1>Bạn bè</h1>
        <ErrorState
          message="Chưa thể tải danh sách bạn bè."
          onRetry={() => void load()}
        />
      </main>
    );
  if (!friends || !requests)
    return (
      <main>
        <h1>Bạn bè</h1>
        <Skeleton label="Đang tải danh sách bạn bè…" />
      </main>
    );
  const incoming = requests.filter((r) => r.direction === "incoming");
  return (
    <main>
      <h1>Bạn bè</h1>
      <section aria-label="Tìm bạn bè">
        <h2>Tìm bạn bè</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void search();
          }}
        >
          <TextField
            label="Tên đăng nhập"
            helper="Gõ phần đầu tên đăng nhập, không phân biệt hoa thường."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button loading={searching} onClick={() => void search()}>
            Tìm
          </Button>
        </form>
        {results && results.length === 0 && (
          <EmptyState title="Không tìm thấy">
            Thử phần đầu tên đăng nhập khác.
          </EmptyState>
        )}
        {results && results.length > 0 && (
          <ul>
            {results.map((peer) => (
              <li key={peer.userId}>
                <span aria-hidden="true">
                  {peer.displayName.slice(0, 1).toUpperCase()}
                </span>{" "}
                {peer.displayName} @{peer.username}{" "}
                <Button
                  variant="secondary"
                  loading={busy === `send-${peer.userId}`}
                  onClick={() =>
                    void act(`send-${peer.userId}`, () =>
                      client.send(peer.username),
                    )
                  }
                >
                  Kết bạn
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
      {notice && (
        <p role="status" aria-live="polite">
          {notice}
        </p>
      )}
      <Tabs
        label="Bạn bè và lời mời"
        items={[
          {
            id: "list",
            label: `Danh sách (${friends.length})`,
            content:
              friends.length === 0 ? (
                <EmptyState title="Chưa có bạn bè">
                  Tìm tên đăng nhập ở trên để kết bạn và rủ chơi.
                </EmptyState>
              ) : (
                <ul>
                  {friends.map((friend) => (
                    <li key={friend.userId}>
                      <span aria-hidden="true" data-status={friend.status}>
                        ●
                      </span>{" "}
                      {friend.displayName} @{friend.username} ·{" "}
                      {statusLabel(friend.status)}{" "}
                      <Button variant="ghost" disabledReason="Sắp ra mắt">
                        Nhắn tin
                      </Button>{" "}
                      <Button variant="ghost" disabledReason="Sắp ra mắt">
                        Thách đấu
                      </Button>{" "}
                      <Button
                        variant="danger"
                        loading={busy === `unfriend-${friend.userId}`}
                        onClick={() =>
                          void act(`unfriend-${friend.userId}`, () =>
                            client.unfriend(friend.userId),
                          )
                        }
                      >
                        Huỷ kết bạn
                      </Button>
                    </li>
                  ))}
                </ul>
              ),
          },
          {
            id: "requests",
            label: `Lời mời (${incoming.length})`,
            content:
              requests.length === 0 ? (
                <EmptyState title="Không có lời mời">
                  Lời mời kết bạn mới sẽ hiện ở đây.
                </EmptyState>
              ) : (
                <ul>
                  {requests.map((item) =>
                    item.direction === "incoming" ? (
                      <li key={item.id}>
                        {item.peer.displayName} @{item.peer.username} muốn kết
                        bạn{" "}
                        <Button
                          loading={busy === `accept-${item.id}`}
                          onClick={() =>
                            void act(`accept-${item.id}`, () =>
                              client.respond(item.id, true),
                            )
                          }
                        >
                          Chấp nhận
                        </Button>{" "}
                        <Button
                          variant="secondary"
                          loading={busy === `decline-${item.id}`}
                          onClick={() =>
                            void act(`decline-${item.id}`, () =>
                              client.respond(item.id, false),
                            )
                          }
                        >
                          Từ chối
                        </Button>
                      </li>
                    ) : (
                      <li key={item.id}>
                        Đã gửi tới {item.peer.displayName} @{item.peer.username}{" "}
                        <Button
                          variant="secondary"
                          loading={busy === `revoke-${item.id}`}
                          onClick={() =>
                            void act(`revoke-${item.id}`, () =>
                              client.revoke(item.id),
                            )
                          }
                        >
                          Thu hồi
                        </Button>
                      </li>
                    ),
                  )}
                </ul>
              ),
          },
        ]}
      />
    </main>
  );
}
export function FriendsBell({ client }: { client: FriendClient }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let alive = true;
    async function poll() {
      try {
        const pending = await client.requests();
        if (alive)
          setCount(pending.filter((r) => r.direction === "incoming").length);
      } catch {
        /* Chuong im lang khi mang loi; trang chinh van bao loi. */
      }
    }
    void poll();
    const timer = setInterval(poll, 15000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [client]);
  return (
    <a
      href="/friends"
      className="xq-friends-bell"
      aria-label={count ? `${count} lời mời kết bạn` : "Bạn bè"}
      title={count ? `${count} lời mời kết bạn` : "Thông báo kết bạn"}
    >
      <span aria-hidden="true">🔔</span>
      <Badge count={count} label="lời mời kết bạn" />
    </a>
  );
}
