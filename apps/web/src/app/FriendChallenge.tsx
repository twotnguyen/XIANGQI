import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Button, Dialog, Notice } from "../shared/ui/primitives.js";
import { generateUuid } from "../shared/uuid.js";
import {
  friendErrorText,
  type FriendClient,
  type FriendPeer,
} from "../features/friends/friend-client.js";
import type { CreateRoomInput } from "../features/rooms/RoomForms.js";
import type { RoomClient, RoomEntry } from "../features/rooms/room-client.js";

const CreateRoomForm = lazy(() =>
  import("../features/rooms/RoomForms.js").then((module) => ({
    default: module.CreateRoomForm,
  })),
);
const FriendsPage = lazy(() =>
  import("../features/friends/FriendsPage.js").then((module) => ({
    default: module.FriendsPage,
  })),
);

type Peer = Pick<FriendPeer, "userId" | "username" | "displayName">;

export function FriendsRoute({
  friends,
  rooms,
  blockedReason,
  onEntered,
}: {
  friends: FriendClient;
  rooms: RoomClient;
  blockedReason?: string;
  onEntered: (entry: RoomEntry) => void;
}) {
  const [peer, setPeer] = useState<Peer | null>(null);
  return (
    <>
      <FriendsPage
        client={friends}
        onChallenge={setPeer}
        challengeBlockedReason={blockedReason}
      />
      {peer && (
        <FriendChallenge
          peer={peer}
          friends={friends}
          rooms={rooms}
          onEntered={onEntered}
          onClose={() => setPeer(null)}
        />
      )}
    </>
  );
}

export function FriendChallenge({
  peer,
  friends,
  rooms,
  onClose,
  onEntered,
}: {
  peer: Peer;
  friends: FriendClient;
  rooms: RoomClient;
  onClose: () => void;
  onEntered: (entry: RoomEntry) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const attempt = useRef<{
    input: CreateRoomInput;
    commandId: string;
    username: string;
  } | null>(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  async function create(input: CreateRoomInput) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (!attempt.current) {
        const [peers, state] = await Promise.all([
          friends.list(),
          friends.inviteState(),
        ]);
        if (!alive.current) return;
        const current = peers.find((item) => item.userId === peer.userId);
        if (!current || current.status !== "online") {
          setError(
            !current
              ? "Hai người không còn là bạn bè."
              : "Bạn hiện không thể nhận lời mời. Vui lòng thử lại khi bạn Online.",
          );
          return;
        }
        if (
          state.cooldownUntil &&
          Date.parse(state.cooldownUntil) > Date.now()
        ) {
          setError(
            "Bạn đang trong thời gian chờ gửi lời mời. Vui lòng thử lại sau 10 giây.",
          );
          return;
        }
        attempt.current = {
          input,
          commandId: generateUuid(),
          username: current.username,
        };
      }
      // Khôi phục đúng lệnh đã gửi trước khi kiểm điều kiện mời hiện tại:
      // phòng có thể đã được tạo dù client chưa nhận phản hồi.
      const entry = await rooms.create(
        attempt.current.input,
        attempt.current.commandId,
      );
      if (!alive.current) return;
      let notice = "Đã tạo phòng và gửi lời mời cho bạn.";
      try {
        await friends.invite(entry.roomId, attempt.current.username);
      } catch (failure) {
        notice = `Phòng đã tạo và vẫn được giữ. Chưa xác nhận gửi được lời mời: ${friendErrorText(failure)}`;
      }
      if (alive.current) onEntered({ ...entry, notice });
    } catch (failure) {
      if (alive.current)
        setError(
          attempt.current
            ? "Chưa xác nhận được kết quả tạo phòng. Thử lại sẽ kiểm tra cùng yêu cầu, không tạo thêm phòng."
            : friendErrorText(failure),
        );
    } finally {
      if (alive.current) setBusy(false);
    }
  }

  return (
    <Dialog
      open
      title={`Thách đấu ${peer.displayName}`}
      onClose={onClose}
      dismissible={!busy}
    >
      <p>
        Lời mời được gửi đến @{peer.username} chỉ sau khi bạn xác nhận tạo
        phòng.
      </p>
      {error && <Notice tone="error" message={error} />}
      {attempt.current ? (
        <Button
          loading={busy}
          onClick={() => void create(attempt.current!.input)}
        >
          Thử lại yêu cầu tạo phòng
        </Button>
      ) : (
        <Suspense fallback={<p role="status">Đang tải biểu mẫu…</p>}>
          <CreateRoomForm
            initialTimeMinutes={10}
            allowUnlimited
            onCreate={create}
          />
        </Suspense>
      )}
    </Dialog>
  );
}
