import { useCallback, useEffect, useRef, useState } from "react";
import "./friends.css";
import {
  getLocation,
  subscribeLocation,
} from "../../shared/navigation/navigation.js";
import {
  Button,
  EmptyState,
  ErrorState,
  Notice,
  Skeleton,
  Tabs,
  TextField,
} from "../../shared/ui/primitives.js";
import {
  friendErrorText as errorText,
  type FriendClient,
  type FriendPeer,
  type FriendRequest,
} from "./friend-client.js";
function tabFromLocation(): string {
  const tab = new URLSearchParams(getLocation().search).get("tab");
  return tab === "requests" ? "requests" : "list";
}

function statusLabel(status: FriendPeer["status"]) {
  return status === "online"
    ? "Trực tuyến"
    : status === "in-match"
      ? "Đang đấu"
      : "Ngoại tuyến";
}

/**
 * Màn hình quản lý bạn bè: danh sách bạn bè, trạng thái trực tuyến/đang đấu, duyệt lời mời kết bạn và tìm kiếm kỳ hữu.
 */
export function FriendsPage({ client }: { client: FriendClient }) {
  const [friends, setFriends] = useState<FriendPeer[] | null>(null);
  const [requests, setRequests] = useState<FriendRequest[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Omit<FriendPeer, "status">[] | null>(
    null,
  );
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [tabVersion, setTabVersion] = useState(0);
  const [defaultTab, setDefaultTab] = useState(tabFromLocation);
  const searchSeq = useRef(0);
  const loadSeq = useRef(0);
  const loading = useRef(false);

  const load = useCallback(async () => {
    const seq = ++loadSeq.current;
    loading.current = true;
    try {
      const [list, pending] = await Promise.all([
        client.list(),
        client.requests(),
      ]);
      if (seq !== loadSeq.current) return;
      setFriends(list);
      setRequests(pending);
      setFailed(false);
    } catch {
      if (seq === loadSeq.current) setFailed(true);
    } finally {
      if (seq === loadSeq.current) loading.current = false;
    }
  }, [client]);

  useEffect(() => {
    void load();
    const timer = setInterval(() => {
      if (!loading.current) void load();
    }, 2000);
    return () => {
      clearInterval(timer);
      loadSeq.current++;
      searchSeq.current++;
      loading.current = false;
    };
  }, [load]);

  useEffect(
    () =>
      subscribeLocation(() => {
        setDefaultTab(tabFromLocation());
        setTabVersion((version) => version + 1);
      }),
    [],
  );

  async function search() {
    const q = query.trim();
    if (!q || busy) return;
    const seq = ++searchSeq.current;
    setSearching(true);
    setNotice("");
    try {
      const found = await client.search(q);
      if (seq === searchSeq.current) setResults(found);
    } catch (error) {
      if (seq === searchSeq.current) setNotice(errorText(error));
    } finally {
      if (seq === searchSeq.current) setSearching(false);
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

  if (failed && !friends)
    return (
      <main className="xq-friends xq-ui">
        <header className="xq-friends__header">
          <h1>Bạn bè</h1>
          <p className="xq-friends__subtitle">
            Giao lưu kỳ nghệ, kết nối bạn bè và cùng so tài trên bàn cờ
          </p>
        </header>
        <ErrorState
          message="Chưa thể tải danh sách bạn bè."
          onRetry={() => void load()}
        />
      </main>
    );

  if (!friends || !requests)
    return (
      <main className="xq-friends xq-ui">
        <header className="xq-friends__header">
          <h1>Bạn bè</h1>
          <p className="xq-friends__subtitle">
            Giao lưu kỳ nghệ, kết nối bạn bè và cùng so tài trên bàn cờ
          </p>
        </header>
        <div className="xq-friends__loading-card">
          <Skeleton label="Đang tải danh sách bạn bè…" />
        </div>
      </main>
    );

  const incoming = requests.filter((r) => r.direction === "incoming");
  const outgoing = requests.filter((r) => r.direction === "outgoing");

  return (
    <main className="xq-friends xq-ui">
      <header className="xq-friends__header">
        <h1 className="xq-friends__title">Bạn bè</h1>
        <p className="xq-friends__subtitle">
          Giao lưu kỳ nghệ, kết nối bạn bè và cùng so tài trên bàn cờ
        </p>
      </header>

      {notice && (
        <Notice tone="error" message={notice} onDismiss={() => setNotice("")} />
      )}
      {failed && (
        <Notice
          tone="error"
          message="Chưa cập nhật được danh sách. Đang thử kết nối lại…"
        />
      )}

      {/* KHỐI TÌM KIẾM BẠN BÈ */}
      <section className="xq-friends__search-card" aria-label="Tìm bạn bè">
        <div className="xq-friends__card-header">
          <h2>Tìm bạn mới</h2>
          <span className="xq-friends__card-hint">
            Nhập tên đăng nhập để tìm kiếm kỳ thủ
          </span>
        </div>

        <form
          className="xq-friends__search-form"
          onSubmit={(event) => {
            event.preventDefault();
            void search();
          }}
        >
          <div className="xq-friends__search-input-wrap">
            <TextField
              label="Tên đăng nhập"
              placeholder="Nhập tên đăng nhập người chơi..."
              helper=""
              value={query}
              onChange={(event) => {
                searchSeq.current++;
                setSearching(false);
                setResults(null);
                setQuery(event.target.value);
              }}
            />
          </div>
          <Button
            variant="primary"
            className="xq-friends__search-btn"
            loading={searching}
            onClick={() => void search()}
          >
            Tìm
          </Button>
        </form>

        {results && results.length === 0 && (
          <div className="xq-friends__search-empty">
            <EmptyState title="Không tìm thấy">
              Không có kỳ thủ nào bắt đầu bằng &quot;{query}&quot;. Vui lòng thử
              lại với tên khác.
            </EmptyState>
          </div>
        )}

        {results && results.length > 0 && (
          <div className="xq-friends__search-results">
            <h3 className="xq-friends__section-label">
              Kết quả tìm kiếm ({results.length})
            </h3>
            <ul className="xq-friends__user-list">
              {results.map((peer) => (
                <li key={peer.userId} className="xq-friends__user-item">
                  <div className="xq-friends__user-info">
                    <div className="xq-friends__avatar" aria-hidden="true">
                      {peer.displayName.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="xq-friends__user-names">
                      <span className="xq-friends__display-name">
                        {peer.displayName}
                      </span>
                      <span className="xq-friends__username">
                        @{peer.username}
                      </span>
                    </div>
                  </div>
                  {friends.some((friend) => friend.userId === peer.userId) ? (
                    <span className="xq-friends__username">Đã là bạn</span>
                  ) : requests.some(
                      (request) => request.peer.userId === peer.userId,
                    ) ? (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setDefaultTab("requests");
                        setTabVersion((version) => version + 1);
                      }}
                    >
                      {requests.some(
                        (request) =>
                          request.peer.userId === peer.userId &&
                          request.direction === "incoming",
                      )
                        ? "Xem lời mời"
                        : "Đã gửi lời mời"}
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      disabled={busy !== null}
                      loading={busy === `send-${peer.userId}`}
                      onClick={() =>
                        void act(`send-${peer.userId}`, () =>
                          client.send(peer.username),
                        )
                      }
                    >
                      Kết bạn
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* KHỐI DANH SÁCH BẠN BÈ VÀ LỜI MỜI */}
      <section
        className="xq-friends__content-card"
        aria-label="Danh sách và lời mời"
      >
        <Tabs
          key={`${defaultTab}-${tabVersion}`}
          defaultId={defaultTab}
          label="Bạn bè và lời mời"
          items={[
            {
              id: "list",
              label: `Danh sách (${friends.length})`,
              content:
                friends.length === 0 ? (
                  <EmptyState title="Chưa có bạn bè">
                    Bạn chưa có bạn bè nào. Hãy gõ tên đăng nhập ở trên để kết
                    bạn và cùng so tài!
                  </EmptyState>
                ) : (
                  <ul className="xq-friends__user-list">
                    {friends.map((friend) => (
                      <li key={friend.userId} className="xq-friends__user-item">
                        <div className="xq-friends__user-info">
                          <div className="xq-friends__avatar-wrapper">
                            <div
                              className="xq-friends__avatar"
                              aria-hidden="true"
                            >
                              {friend.displayName.slice(0, 1).toUpperCase()}
                            </div>
                            <span
                              className={`xq-friends__status-dot xq-friends__status-dot--${friend.status}`}
                              title={statusLabel(friend.status)}
                              aria-hidden="true"
                            />
                          </div>
                          <div className="xq-friends__user-names">
                            <div className="xq-friends__name-row">
                              <span className="xq-friends__display-name">
                                {friend.displayName}
                              </span>
                              <span
                                className={`xq-friends__status-pill xq-friends__status-pill--${friend.status}`}
                              >
                                {statusLabel(friend.status)}
                              </span>
                            </div>
                            <span className="xq-friends__username">
                              @{friend.username}
                            </span>
                          </div>
                        </div>

                        <div className="xq-friends__actions">
                          <Button variant="ghost" disabledReason="Sắp ra mắt">
                            Nhắn tin
                          </Button>
                          <Button
                            variant="secondary"
                            disabledReason="Sắp ra mắt"
                          >
                            Thách đấu
                          </Button>
                          <Button
                            variant="danger"
                            loading={busy === `unfriend-${friend.userId}`}
                            onClick={() =>
                              void act(`unfriend-${friend.userId}`, () =>
                                client.unfriend(friend.userId),
                              )
                            }
                          >
                            Hủy kết bạn
                          </Button>
                        </div>
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
                    Hiện chưa có lời mời kết bạn nào đang chờ.
                  </EmptyState>
                ) : (
                  <div className="xq-friends__requests-container">
                    {incoming.length > 0 && (
                      <div className="xq-friends__requests-group">
                        <h3 className="xq-friends__section-label">
                          Lời mời nhận được ({incoming.length})
                        </h3>
                        <ul className="xq-friends__user-list">
                          {incoming.map((item) => (
                            <li key={item.id} className="xq-friends__user-item">
                              <div className="xq-friends__user-info">
                                <div
                                  className="xq-friends__avatar"
                                  aria-hidden="true"
                                >
                                  {item.peer.displayName
                                    .slice(0, 1)
                                    .toUpperCase()}
                                </div>
                                <div className="xq-friends__user-names">
                                  <span className="xq-friends__display-name">
                                    {item.peer.displayName}
                                  </span>
                                  <span className="xq-friends__username">
                                    @{item.peer.username} muốn kết bạn
                                  </span>
                                </div>
                              </div>
                              <div className="xq-friends__actions">
                                <Button
                                  variant="primary"
                                  loading={busy === `accept-${item.id}`}
                                  onClick={() =>
                                    void act(`accept-${item.id}`, () =>
                                      client.respond(item.id, true),
                                    )
                                  }
                                >
                                  Chấp nhận
                                </Button>
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
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {outgoing.length > 0 && (
                      <div className="xq-friends__requests-group">
                        <h3 className="xq-friends__section-label">
                          Lời mời đã gửi ({outgoing.length})
                        </h3>
                        <ul className="xq-friends__user-list">
                          {outgoing.map((item) => (
                            <li key={item.id} className="xq-friends__user-item">
                              <div className="xq-friends__user-info">
                                <div
                                  className="xq-friends__avatar"
                                  aria-hidden="true"
                                >
                                  {item.peer.displayName
                                    .slice(0, 1)
                                    .toUpperCase()}
                                </div>
                                <div className="xq-friends__user-names">
                                  <span className="xq-friends__display-name">
                                    {item.peer.displayName}
                                  </span>
                                  <span className="xq-friends__username">
                                    Đang chờ phản hồi từ @{item.peer.username}
                                  </span>
                                </div>
                              </div>
                              <div className="xq-friends__actions">
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
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ),
            },
          ]}
        />
      </section>
    </main>
  );
}
