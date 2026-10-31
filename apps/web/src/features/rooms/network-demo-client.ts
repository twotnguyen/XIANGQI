import type { Socket } from "socket.io-client";

export interface NetworkDemoClient {
  capability(): Promise<boolean>;
  disconnect(): Promise<void>;
  reconnect(): void;
}

/** Các lệnh chỉ thao tác trên socket của tab hiện tại. */
export function networkDemoClient(socket: Socket): NetworkDemoClient {
  function request(
    event: "demo.capability" | "demo.disconnect",
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!socket.connected) {
        reject(new Error("Kết nối phòng đang gián đoạn."));
        return;
      }
      socket
        .timeout(8000)
        .emit(event, null, (error: Error | null, value: unknown) => {
          if (error) reject(error);
          else resolve(value);
        });
    });
  }
  return {
    async capability() {
      const result = await request("demo.capability");
      return (
        !!result &&
        typeof result === "object" &&
        "enabled" in result &&
        result.enabled === true
      );
    },
    async disconnect() {
      const result = await request("demo.disconnect");
      if (
        !result ||
        typeof result !== "object" ||
        !("ok" in result) ||
        result.ok !== true
      )
        throw new Error("Không thể giả lập mất mạng.");
    },
    reconnect() {
      socket.connect();
    },
  };
}
