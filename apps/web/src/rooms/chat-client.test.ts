import { expect, it } from "vitest";
import {
  parseChatPage,
  parseChatSent,
  parseChatChanged,
} from "./chat-client.js";
const roomId = "11111111-1111-4111-8111-111111111111";
function page() {
  return {
    roomId,
    channel: "ROOM_PUBLIC" as const,
    roomVersion: 3,
    scopeToken: "a".repeat(64),
    canSend: true,
    messages: [
      {
        messageId: "22222222-2222-4222-8222-222222222222",
        roomId,
        channel: "ROOM_PUBLIC",
        sequence: 7,
        content: "<script>chỉ văn bản</script>",
        createdAt: "2026-10-11T00:00:00.000Z",
        sender: { displayName: "Kỳ hữu", isGuest: false, role: "red" },
      },
    ],
    nextCursor: 7,
    hasMore: false,
  };
}
it("preserves canonical ascending messages, literal content and historical sender side", () => {
  expect(parseChatPage(page(), roomId, "ROOM_PUBLIC", 6)).toEqual(page());
});
it.each([
  { roomId: "33333333-3333-4333-8333-333333333333" },
  { channel: "PLAYERS_PRIVATE" },
  { roomVersion: -1 },
  { roomVersion: Number.MAX_SAFE_INTEGER + 1 },
  { scopeToken: "secret" },
  { canSend: "true" },
  { nextCursor: 6 },
  { nextCursor: 8 },
  { hasMore: true },
  { token: "private" },
])(
  "rejects invalid page authority/cursor and unrecognized fields %j",
  (patch) => {
    expect(() =>
      parseChatPage({ ...page(), ...patch }, roomId, "ROOM_PUBLIC", 6),
    ).toThrow();
  },
);
it.each([
  { messageId: "not-uuid" },
  { roomId: "33333333-3333-4333-8333-333333333333" },
  { channel: "PLAYERS_PRIVATE" },
  { sequence: 6 },
  { sequence: 1.5 },
  { content: "😀".repeat(601) },
  { createdAt: "2026-10-11T00:00:00" },
  { sender: { displayName: "Kỳ hữu", isGuest: false, role: "host" } },
  { sender: { displayName: "Kỳ hữu", isGuest: false } },
  { credential: "private" },
])("rejects invalid historical message DTO %j", (patch) => {
  expect(() =>
    parseChatPage(
      { ...page(), messages: [{ ...page().messages[0], ...patch }] },
      roomId,
      "ROOM_PUBLIC",
      6,
    ),
  ).toThrow();
});
it("accepts exactly 600 Unicode code points and empty pages retaining the requested cursor", () => {
  const p = page();
  p.messages[0]!.content = "😀".repeat(600);
  expect(parseChatPage(p, roomId, "ROOM_PUBLIC", 6).messages[0]!.content).toBe(
    p.messages[0]!.content,
  );
  expect(
    parseChatPage(
      { ...p, messages: [], nextCursor: 6 },
      roomId,
      "ROOM_PUBLIC",
      6,
    ).messages,
  ).toEqual([]);
});
it("rejects duplicate IDs, out-of-order sequences and pages above fifty", () => {
  const p = page(),
    first = p.messages[0]!;
  for (const messages of [
    [first, { ...first, sequence: 8 }],
    [first, { ...first, messageId: roomId, sequence: 7 }],
    Array(51).fill(first),
  ]) {
    expect(() =>
      parseChatPage(
        { ...p, messages, nextCursor: 8 },
        roomId,
        "ROOM_PUBLIC",
        6,
      ),
    ).toThrow();
  }
});
it("accepts a full fifty-message page with a continuation cursor", () => {
  const p = page();
  p.messages = Array.from({ length: 50 }, (_, index) => ({
    ...p.messages[0]!,
    messageId: `22222222-2222-4222-8222-${String(index).padStart(12, "0")}`,
    sequence: index + 7,
  }));
  p.nextCursor = 56;
  p.hasMore = true;
  expect(parseChatPage(p, roomId, "ROOM_PUBLIC", 6).messages).toHaveLength(50);
});
it("rejects calendar-invalid dates rather than silently normalizing them", () => {
  const p = page();
  p.messages[0]!.createdAt = "2026-02-30T00:00:00Z";
  expect(() => parseChatPage(p, roomId, "ROOM_PUBLIC", 6)).toThrow();
});
it("validates sent receipts and channel-specific change notices without leaking extras", () => {
  const sent = {
    messageId: roomId,
    sequence: 8,
    createdAt: "2026-10-11T00:00:01Z",
  };
  expect(parseChatSent(sent)).toEqual(sent);
  expect(() => parseChatSent({ ...sent, sequence: 0 })).toThrow();
  const { roomId: id, channel, roomVersion, scopeToken, canSend } = page();
  const notice = { roomId: id, channel, roomVersion, scopeToken, canSend };
  expect(parseChatChanged(notice, roomId)).toEqual(notice);
  expect(() =>
    parseChatChanged({ ...notice, accessToken: "private" }, roomId),
  ).toThrow();
});
