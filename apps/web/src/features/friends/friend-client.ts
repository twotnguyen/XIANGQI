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
export type AuthorizedFetch = (
  path: string,
  init?: RequestInit,
) => Promise<Response>;
export class FriendRequestError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
  ) {
    super("Yêu cầu bạn bè chưa thực hiện được. Vui lòng thử lại.");
  }
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new FriendRequestError("FRIEND_BAD_RESPONSE", 502);
  return value as Record<string, unknown>;
}
export function createFriendClient(authorizedFetch: AuthorizedFetch) {
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
        /* Do not display upstream response bodies. */
      }
      throw new FriendRequestError(code, response.status);
    }
    try {
      return parse(await response.json());
    } catch (error) {
      if (error instanceof FriendRequestError) throw error;
      throw new FriendRequestError("FRIEND_BAD_RESPONSE", 502);
    }
  }
  const peers = (value: unknown): FriendPeer[] => {
    if (!Array.isArray(value))
      throw new FriendRequestError("FRIEND_BAD_RESPONSE", 502);
    return value.map((entry) => {
      const peer = record(entry);
      if (
        typeof peer.userId !== "string" ||
        typeof peer.username !== "string" ||
        typeof peer.displayName !== "string" ||
        !["online", "in-match", "offline"].includes(peer.status as string)
      )
        throw new FriendRequestError("FRIEND_BAD_RESPONSE", 502);
      return peer as unknown as FriendPeer;
    });
  };
  return {
    search: (q: string) =>
      request(`/friends/search?q=${encodeURIComponent(q)}`, peers),
    list: () => request("/friends", peers),
    send: (username: string) =>
      request(
        "/friends/requests",
        (value) => {
          const result = record(value);
          if (typeof result.id !== "string")
            throw new FriendRequestError("FRIEND_BAD_RESPONSE", 502);
          return result as { id: string };
        },
        { username },
      ),
    requests: () =>
      request("/friends/requests", (value) => {
        if (!Array.isArray(value))
          throw new FriendRequestError("FRIEND_BAD_RESPONSE", 502);
        return value as unknown as FriendRequest[];
      }),
    respond: (id: string, accept: boolean) =>
      request(
        `/friends/requests/${encodeURIComponent(id)}/respond`,
        (value) => record(value),
        { accept },
      ),
    revoke: (id: string) =>
      request(`/friends/requests/${encodeURIComponent(id)}/revoke`, (value) =>
        record(value),
      ),
    unfriend: (userId: string) =>
      request(
        `/friends/${encodeURIComponent(userId)}`,
        (value) => record(value),
        undefined,
        "DELETE",
      ),
    invite: (roomId: string, username: string) =>
      request("/friends/invites", (value) => record(value), {
        roomId,
        username,
      }),
    invites: () =>
      request("/friends/invites", (value) => {
        if (!Array.isArray(value))
          throw new FriendRequestError("FRIEND_BAD_RESPONSE", 502);
        return value as unknown as RoomInvite[];
      }),
    respondInvite: (id: string, accept: boolean) =>
      request(
        `/friends/invites/${encodeURIComponent(id)}/respond`,
        (value) =>
          record(value) as {
            accepted: boolean;
            roomId?: string;
            code?: string | null;
          },
        { accept },
      ),
  };
}
export type FriendClient = ReturnType<typeof createFriendClient>;
