export type PresenceStatus = "online" | "in-match" | "offline";
export interface FriendPeer {
  userId: string;
  username: string;
  displayName: string;
  status: PresenceStatus;
}
export interface FriendRequest {
  id: string;
  direction: "incoming" | "outgoing";
  peer: { userId: string; username: string; displayName: string };
  createdAt: string;
  expiresAt: string;
}
export interface RoomInvite {
  id: string;
  roomId: string;
  roomName: string;
  inviter: { userId: string; username: string; displayName: string };
  createdAt: string;
  expiresAt: string;
}
export interface SentInvite {
  id: string;
  createdAt: string;
  expiresAt: string;
  cooldownUntil: string | null;
}
export interface InviteDecline {
  id: string;
  inviteId: string;
  displayName: string;
  createdAt: string;
}
export interface InviteState {
  cooldownUntil: string | null;
  declines: InviteDecline[];
}
export interface AcceptedInvite {
  accepted: true;
  roomId: string;
  role: "red" | "black" | "spectator";
  version: number;
  notice?: string;
}
export interface DeclinedInvite {
  accepted: false;
  cooldownUntil: string | null;
}
export type InviteAnswer = DeclinedInvite | AcceptedInvite;
export interface DirectMessage {
  id: string;
  seq: number;
  senderId: string;
  content: string;
  createdAt: string;
}
export interface DirectMessagePage {
  messages: DirectMessage[];
  readSeq: number;
}
export interface DirectUnread {
  total: number;
  peers: { peerId: string; unread: number }[];
}
export type AuthorizedFetch = (
  path: string,
  init?: RequestInit,
) => Promise<Response>;

export interface FriendClient {
  search(q: string): Promise<Omit<FriendPeer, "status">[]>;
  list(): Promise<FriendPeer[]>;
  send(username: string): Promise<unknown>;
  requests(): Promise<FriendRequest[]>;
  respond(id: string, accept: boolean): Promise<unknown>;
  revoke(id: string): Promise<unknown>;
  unfriend(userId: string): Promise<unknown>;
  presence(connectionId: string): Promise<void>;
  invite(roomId: string, username: string): Promise<SentInvite>;
  invites(): Promise<RoomInvite[]>;
  inviteState(): Promise<InviteState>;
  ackInviteState(id: string): Promise<void>;
  respondInvite(
    id: string,
    accept: boolean,
    commandId: string,
  ): Promise<InviteAnswer>;
  messages(userId: string, before?: number): Promise<DirectMessagePage>;
  sendMessage(
    userId: string,
    content: string,
    commandId: string,
  ): Promise<DirectMessage>;
  markRead(userId: string, upToSeq: number): Promise<number>;
  unread(): Promise<DirectUnread>;
}

export class FriendRequestError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
  ) {
    super("Yêu cầu bạn bè chưa thực hiện được. Vui lòng thử lại.");
  }
}

export function friendErrorText(error: unknown): string {
  if (!(error instanceof FriendRequestError))
    return "Chưa thể kết nối. Vui lòng thử lại.";
  switch (error.code) {
    case "FRIEND_LIMIT":
      return "Một trong hai người đã đủ 200 bạn.";
    case "FRIEND_INVITE_LIMIT":
      return "Một trong hai người đã đủ 50 lời mời đang chờ.";
    case "FRIEND_BLOCKED":
      return "Không thể gửi lời mời sau hai lần bị từ chối.";
    case "FRIEND_ALREADY":
      return "Hai bạn đã là bạn bè.";
    case "FRIEND_OFFLINE":
      return "Bạn bè đang ngoại tuyến.";
    case "DM_NOT_FRIENDS":
      return "Chỉ bạn bè mới được nhắn tin. Cuộc trò chuyện đã bị khóa.";
    case "DM_RATE_LIMITED":
      return "Bạn nhắn quá nhanh. Thử lại sau vài giây.";
    case "DM_COMMAND_ID_REUSED":
      return "Tin nhắn bị trùng. Vui lòng tải lại cuộc trò chuyện.";
    case "DM_INPUT_INVALID":
      return "Tin nhắn không hợp lệ (tối đa 200 ký tự).";
    case "FRIEND_BUSY":
    case "ALREADY_SEATED":
      return "Bạn đang ở trong một ván/phòng khác.";
    case "FRIEND_INVITE_RECIPIENT_FULL":
      return "Người nhận đang có quá nhiều lời mời, vui lòng thử lại sau";
    case "FRIEND_INVITE_COOLDOWN":
      return "Bạn cần chờ hết 10 giây trước khi mời tiếp.";
    case "FRIEND_ROOM_FULL":
    case "ROOM_FULL":
      return "Phòng thi đấu đã đầy người, vui lòng chọn phòng khác!";
    case "FRIEND_ROOM_LOCKED":
    case "FRIEND_INVITE_REVOKED":
    case "ROOM_LOCKED":
      return "Phòng đã khóa lời mời này.";
    case "ROOM_BLOCKED":
      return "Bạn đã bị đuổi và chặn tham gia phòng cờ này!";
    case "FRIEND_ROOM_MISSING":
    case "ROOM_FORBIDDEN":
      return "Mã phòng không tồn tại hoặc phòng đã đóng";
    case "FRIEND_INVITE_MISSING":
    case "FRIEND_REQUEST_MISSING":
      return "Lời mời không còn hiệu lực.";
    default:
      return "Thao tác chưa thực hiện được. Vui lòng thử lại.";
  }
}

const badResponse = () => new FriendRequestError("FRIEND_BAD_RESPONSE", 502);

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw badResponse();
  return value as Record<string, unknown>;
}
function text(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  if (typeof value !== "string") throw badResponse();
  return value;
}
function date(source: Record<string, unknown>, key: string): string {
  const value = text(source, key);
  if (!Number.isFinite(Date.parse(value))) throw badResponse();
  return value;
}
function nullableDate(
  source: Record<string, unknown>,
  key: string,
): string | null {
  return source[key] === null ? null : date(source, key);
}
function number(source: Record<string, unknown>, key: string): number {
  const value = source[key];
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0)
    throw badResponse();
  return value;
}
function list<T>(value: unknown, item: (entry: Record<string, unknown>) => T) {
  if (!Array.isArray(value)) throw badResponse();
  return value.map((entry) => item(record(entry)));
}
function peer(entry: Record<string, unknown>): FriendPeer {
  const status = text(entry, "status");
  if (!["online", "in-match", "offline"].includes(status)) throw badResponse();
  return {
    userId: text(entry, "userId"),
    username: text(entry, "username"),
    displayName: text(entry, "displayName"),
    status: status as PresenceStatus,
  };
}
function friendRequest(entry: Record<string, unknown>): FriendRequest {
  const direction = text(entry, "direction");
  if (direction !== "incoming" && direction !== "outgoing") throw badResponse();
  const person = record(entry.peer);
  return {
    id: text(entry, "id"),
    direction,
    peer: {
      userId: text(person, "userId"),
      username: text(person, "username"),
      displayName: text(person, "displayName"),
    },
    createdAt: date(entry, "createdAt"),
    expiresAt: date(entry, "expiresAt"),
  };
}
function roomInvite(entry: Record<string, unknown>): RoomInvite {
  const inviter = record(entry.inviter);
  return {
    id: text(entry, "id"),
    roomId: text(entry, "roomId"),
    roomName: text(entry, "roomName"),
    inviter: {
      userId: text(inviter, "userId"),
      username: text(inviter, "username"),
      displayName: text(inviter, "displayName"),
    },
    createdAt: date(entry, "createdAt"),
    expiresAt: date(entry, "expiresAt"),
  };
}
function parseInviteState(value: unknown): InviteState {
  const entry = record(value);
  return {
    cooldownUntil: nullableDate(entry, "cooldownUntil"),
    declines: list(entry.declines, (decline) => ({
      id: text(decline, "id"),
      inviteId: text(decline, "inviteId"),
      displayName: text(decline, "displayName"),
      createdAt: date(decline, "createdAt"),
    })),
  };
}
function parseSentInvite(value: unknown): SentInvite {
  const entry = record(value);
  return {
    id: text(entry, "id"),
    createdAt: date(entry, "createdAt"),
    expiresAt: date(entry, "expiresAt"),
    cooldownUntil: nullableDate(entry, "cooldownUntil"),
  };
}
function parseInviteAnswer(value: unknown): InviteAnswer {
  const entry = record(value);
  if (entry.accepted === true) {
    const role = text(entry, "role");
    if (role !== "red" && role !== "black" && role !== "spectator")
      throw badResponse();
    return {
      accepted: true,
      roomId: text(entry, "roomId"),
      role,
      version: number(entry, "version"),
      ...(typeof entry.notice === "string" ? { notice: entry.notice } : {}),
    };
  }
  if (entry.accepted !== false) throw badResponse();
  return {
    accepted: false,
    cooldownUntil: nullableDate(entry, "cooldownUntil"),
  };
}

function directMessage(entry: Record<string, unknown>): DirectMessage {
  return {
    id: text(entry, "id"),
    seq: number(entry, "seq"),
    senderId: text(entry, "senderId"),
    content: text(entry, "content"),
    createdAt: date(entry, "createdAt"),
  };
}
function parseUnread(value: unknown): DirectUnread {
  const entry = record(value);
  return {
    total: number(entry, "total"),
    peers: list(entry.peers, (peerEntry) => ({
      peerId: text(peerEntry, "peerId"),
      unread: number(peerEntry, "unread"),
    })),
  };
}

/**
 * Client thao tác bạn bè, presence và lời mời vào phòng. Lỗi luôn là FriendRequestError với mã an toàn.
 */
export function createFriendClient(
  authorizedFetch: AuthorizedFetch,
): FriendClient {
  async function request<T>(
    path: string,
    parse: (value: unknown) => T,
    body?: object,
    method?: "POST" | "DELETE",
  ): Promise<T> {
    const response = await authorizedFetch(path, {
      method: method ?? (body ? "POST" : "GET"),
      redirect: "error",
      cache: "no-store",
      ...(body
        ? {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        : {}),
    });
    if (!response.ok) {
      let code = "FRIEND_UNAVAILABLE";
      try {
        const value = (await response.json()) as { code?: unknown };
        if (typeof value.code === "string") code = value.code;
      } catch {
        /* Không hiển thị nội dung phản hồi thô của máy chủ. */
      }
      throw new FriendRequestError(code, response.status);
    }
    try {
      return parse(await response.json());
    } catch (error) {
      if (error instanceof FriendRequestError) throw error;
      throw badResponse();
    }
  }
  const parseFriends = (value: unknown) => list(value, peer);
  return {
    search: (q) =>
      request(`/friends/search?q=${encodeURIComponent(q)}`, (value) =>
        list(value, (entry) => ({
          userId: text(entry, "userId"),
          username: text(entry, "username"),
          displayName: text(entry, "displayName"),
        })),
      ),
    list: () => request("/friends", parseFriends),
    send: (username) =>
      request("/friends/requests", (value) => record(value), { username }),
    requests: () =>
      request("/friends/requests", (value) => list(value, friendRequest)),
    respond: (id, accept) =>
      request(
        `/friends/requests/${encodeURIComponent(id)}/respond`,
        (value) => record(value),
        { accept },
      ),
    revoke: (id) =>
      request(
        `/friends/requests/${encodeURIComponent(id)}/revoke`,
        (value) => record(value),
        undefined,
        "POST",
      ),
    unfriend: (userId) =>
      request(
        `/friends/${encodeURIComponent(userId)}`,
        (value) => record(value),
        undefined,
        "DELETE",
      ),
    presence: (connectionId) =>
      request("/friends/presence", () => undefined, { connectionId }),
    invite: (roomId, username) =>
      request("/friends/invites", parseSentInvite, { roomId, username }),
    invites: () =>
      request("/friends/invites", (value) => list(value, roomInvite)),
    inviteState: () => request("/friends/invite-state", parseInviteState),
    ackInviteState: (id) =>
      request(
        `/friends/invite-state/${encodeURIComponent(id)}/ack`,
        () => undefined,
        undefined,
        "POST",
      ),
    respondInvite: (id, accept, commandId) =>
      request(
        `/friends/invites/${encodeURIComponent(id)}/respond`,
        parseInviteAnswer,
        { accept, commandId },
      ),
    messages: (userId, before) => {
      const query = before === undefined ? "" : `?before=${before}`;
      return request(
        `/friends/${encodeURIComponent(userId)}/messages${query}`,
        (value) => {
          const entry = record(value);
          return {
            messages: list(entry.messages, directMessage),
            readSeq: number(entry, "readSeq"),
          };
        },
      );
    },
    sendMessage: (userId, content, commandId) =>
      request(
        `/friends/${encodeURIComponent(userId)}/messages`,
        (value) => directMessage(record(record(value).message)),
        { content, commandId },
      ),
    markRead: (userId, upToSeq) =>
      request(
        `/friends/${encodeURIComponent(userId)}/read`,
        (value) => number(record(value), "readSeq"),
        { upToSeq },
      ),
    unread: () => request("/friends/dm/unread", parseUnread),
  };
}
