import { useEffect, useState } from "react";
import "./friends.css";
import {
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
      <main className="xq-friends">
        <h1>Bạn bè</h1>
        <ErrorState
          message="Chưa thể tải danh sách bạn bè."
          onRetry={() => void load()}
        />
      </main>
    );
  if (!friends || !requests)
    return (
      <main className="xq-friends">
        <h1>Bạn bè</h1>
        <Skeleton label="Đang tải danh sách bạn bè…" />
      </main>
    );
  const incoming = requests.filter((r) => r.direction === "incoming");
  return (
    <main className="xq-friends">
      <h1 className="page-title">Bạn bè</h1>
      <div className="friends-top-row">
        <section className="friends-search-card" aria-label="Tìm bạn bè">
          {/* Hoa văn mây góc trên bên trái tạo sự cân đối */}
          <span className="card-cloud-tl" aria-hidden="true" />

          <h2>Tìm bạn bè</h2>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void search();
            }}
          >
            <TextField
              label="Tên đăng nhập"
              placeholder="Nhập tên đăng nhập…"
              helper="Gõ phần đầu tên đăng nhập, không phân biệt hoa thường."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Button type="submit" loading={searching} onClick={() => void search()}>
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

        <aside className="xq-floating-chess" aria-label="Các quân cờ lơ lửng">
          <div className="xq-chess-glow" />
          <div className="xq-chess-rays" />

          {/* Vệt sương mờ / luồng khí xoay tròn mềm mại cổ phong */}
          <svg className="xq-chess-vortex" viewBox="0 0 450 400" fill="none">
            <path
              d="M225 200 C270 200 310 170 310 130 C310 80 250 50 180 55 C110 60 70 120 70 180 C70 260 140 320 230 325 C310 330 380 270 380 200 C380 120 340 50 260 25 C230 15 190 20 160 35"
              stroke="url(#vortex-gold)"
              strokeWidth="1.2"
              opacity="0.35"
            />
            <path
              d="M225 200 C190 200 160 180 160 150 C160 110 210 90 260 100 C310 110 330 160 320 210 C310 260 250 290 190 280 C130 270 100 220 110 160"
              stroke="url(#vortex-gold-inner)"
              strokeWidth="1.4"
              opacity="0.4"
            />
            <defs>
              <linearGradient id="vortex-gold" x1="70" y1="25" x2="380" y2="330" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffd700" stopOpacity="0.05" />
                <stop offset="40%" stopColor="#f5ca67" stopOpacity="0.5" />
                <stop offset="80%" stopColor="#ffd700" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#fff5df" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="vortex-gold-inner" x1="100" y1="90" x2="330" y2="290" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#f5ca67" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#ffd700" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#f5ca67" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>

          {/* Các tia sáng sao băng lướt qua */}
          <div className="xq-meteor meteor-1" />
          <div className="xq-meteor meteor-2" />
          <div className="xq-meteor meteor-3" />

          {/* Hạt bụi sáng lấp lánh */}
          <span className="xq-chess-sparkle sp-1">✦</span>
          <span className="xq-chess-sparkle sp-2">✦</span>
          <span className="xq-chess-sparkle sp-3">✦</span>
          <span className="xq-chess-sparkle sp-4">✦</span>
          <span className="xq-chess-sparkle sp-5">✦</span>

          {/* Quân Tướng làm tâm điểm nổi bật */}
          <div className="xq-chess-piece floating-piece chess-piece piece-general piece-center" title="將" />

          {/* 6 quân cờ lơ lửng chuyển động bồng bềnh quanh tâm */}
          <div className="xq-chess-piece floating-piece chess-piece piece-advisor piece-shi" title="士" />
          <div className="xq-chess-piece floating-piece chess-piece piece-elephant piece-xiang" title="象" />
          <div className="xq-chess-piece floating-piece chess-piece piece-chariot piece-che" title="車" />
          <div className="xq-chess-piece floating-piece chess-piece piece-cannon piece-pao" title="砲" />
          <div className="xq-chess-piece floating-piece piece-horse chess-piece piece-ma" title="馬" />
          <div className="xq-chess-piece floating-piece chess-piece piece-soldier piece-zu" title="卒" />
        </aside>
      </div>
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
