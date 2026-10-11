import { CreateRoomForm, JoinRoomForm } from "./RoomForms.js";
import type { RoomClient, RoomEntry } from "./room-client.js";
import "./rooms.css";
export function RoomLobby({
  client,
  onEntered,
  initialCode = "",
}: {
  client: RoomClient;
  onEntered: (entry: RoomEntry) => void;
  initialCode?: string;
}) {
  return (
    <main className="xq-ui xq-room-page">
      <header className="xq-room-header">
        <div>
          <h1>Cờ Tướng Online</h1>
          <p>Tạo phòng riêng hoặc vào cùng kỳ hữu bằng mã mời.</p>
        </div>
      </header>
      <div className="xq-room-entry">
        <CreateRoomForm
          onCreate={async (input) => onEntered(await client.create(input))}
        />
        <JoinRoomForm
          initialCode={initialCode}
          onJoin={async (code) => onEntered(await client.join(code))}
        />
      </div>
    </main>
  );
}
