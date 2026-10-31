import type { Socket } from "socket.io";
import type { RoomSnapshot } from "@xiangqi/shared";

type DemoSnapshot = {
  role: RoomSnapshot["role"];
  control: Pick<RoomSnapshot["control"], "mode">;
  match: Pick<NonNullable<RoomSnapshot["match"]>, "status"> | null;
};

/** Chỉ kết nối đang gửi lệnh có thể tự ngắt; quyền được đọc lại trước mỗi lệnh. */
export function bindNetworkDemo(
  socket: Socket,
  options: {
    env: Record<string, string | undefined>;
    authorize: () => Promise<DemoSnapshot>;
  },
) {
  async function permitted() {
    if (
      options.env.NODE_ENV === "production" ||
      options.env.NETWORK_DEMO !== "true"
    )
      return false;
    try {
      const snapshot = await options.authorize();
      return (
        socket.connected &&
        snapshot.role !== "spectator" &&
        snapshot.control.mode === "writable" &&
        snapshot.match?.status === "ACTIVE"
      );
    } catch {
      return false;
    }
  }
  socket.on("demo.capability", (_input: unknown, acknowledge: unknown) => {
    if (typeof acknowledge !== "function") return;
    void permitted().then((enabled) => acknowledge({ enabled }));
  });
  socket.on("demo.disconnect", (_input: unknown, acknowledge: unknown) => {
    if (typeof acknowledge !== "function") return;
    void permitted().then((ok) => {
      acknowledge({ ok });
      if (ok) socket.disconnect(true);
    });
  });
}
