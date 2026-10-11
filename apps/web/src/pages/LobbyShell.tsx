import { useState } from "react";
import {
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
  TextField,
} from "../ui/primitives.js";
import "./LobbyShell.css";
export interface PublicRoom {
  id: string;
  name: string;
  hostName: string;
  hostGuest: boolean;
  timeMinutes: 5 | 10 | 15;
  status: "waiting" | "playing";
  seats: 0 | 1 | 2;
  viewers: number;
  spectatorLimit: number;
}
export type DataState = "success" | "loading" | "empty" | "error" | "disabled";
export interface LobbyShellProps {
  rooms: PublicRoom[];
  state?: DataState;
  onCreate: () => void;
  onJoinCode: (code: string) => void;
  onPlayAI: () => void;
  onJoinRoom: (id: string, role: "player" | "spectator") => void;
  onRetry: () => void;
  fixture?: boolean;
}
export function LobbyShell({
  rooms,
  state = "success",
  onCreate,
  onJoinCode,
  onPlayAI,
  onJoinRoom,
  onRetry,
  fixture = false,
}: LobbyShellProps) {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  return (
    <div className="xq-lobby xq-stack">
      <div className="xq-lobby-heading">
        <div>
          <h1>Sảnh kỳ hữu</h1>
          <p>Chọn một cách chơi, cùng nhau luận cờ.</p>
        </div>
        {fixture && (
          <p className="xq-fixture">
            Dữ liệu minh họa · chưa kết nối phòng thật
          </p>
        )}
      </div>
      <div className="xq-lobby-modes">
        <section className="xq-panel xq-stack">
          <h2>Tự tạo phòng</h2>
          <p>Mời kỳ hữu qua mã phòng hoặc đường dẫn.</p>
          <Button onClick={onCreate}>Tạo phòng</Button>
          <form
            className="xq-code-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!/^[A-Z0-9]{8}$/.test(code)) {
                setCodeError(
                  "Mã phòng gồm 8 chữ cái hoặc số. Kiểm tra lại rồi thử lại.",
                );
                return;
              }
              setCodeError("");
              onJoinCode(code);
            }}
          >
            <TextField
              label="Mã phòng"
              value={code}
              onChange={(event) => {
                setCode(event.target.value.toUpperCase());
                setCodeError("");
              }}
              maxLength={8}
              helper="Nhập 8 ký tự, không có dấu gạch nối."
              error={codeError}
            />
            <Button type="submit" variant="secondary">
              Vào phòng
            </Button>
          </form>
        </section>
        <section className="xq-panel xq-stack">
          <h2>Đánh với máy</h2>
          <p>Luyện nước đi với ba cấp độ Dễ, Trung bình và Khó.</p>
          <Button onClick={onPlayAI}>Chọn cấp độ máy</Button>
          <div className="xq-future-modes">
            <h3>Ghép ngẫu nhiên</h3>
            <p className="xq-help">
              Đánh Thường và Đánh Hạng sẽ được mở trong bản bổ sung.
            </p>
            <div className="xq-row">
              <Button variant="secondary" disabledReason="Sắp ra mắt">
                Đánh thường
              </Button>
              <Button variant="secondary" disabledReason="Sắp ra mắt">
                Đánh hạng
              </Button>
            </div>
          </div>
        </section>
      </div>
      <section className="xq-panel xq-stack" aria-label="Phòng công khai">
        <h2>Phòng công khai</h2>
        {state === "loading" ? (
          <Skeleton label="Đang tải phòng công khai…" />
        ) : state === "error" ? (
          <ErrorState
            message="Không tải được danh sách phòng. Vui lòng thử lại."
            onRetry={onRetry}
          />
        ) : state === "disabled" ? (
          <EmptyState title="Danh sách đang tạm ngừng">
            Vui lòng quay lại sau. Bạn vẫn có thể đánh với máy.
          </EmptyState>
        ) : state === "empty" || rooms.length === 0 ? (
          <EmptyState
            title="Chưa có phòng công khai"
            action={<Button onClick={onCreate}>Tạo phòng đầu tiên</Button>}
          >
            Hãy tạo phòng rồi mở Công khai để mời kỳ hữu.
          </EmptyState>
        ) : (
          <div className="xq-room-list">
            {rooms.map((room) => (
              <article className="xq-room" key={room.id}>
                <div>
                  <h3>{room.name}</h3>
                  <p className="xq-help">
                    {room.hostName}
                    {room.hostGuest ? " (Khách)" : ""}
                  </p>
                </div>
                <div className="xq-room-meta">
                  <span>{room.timeMinutes} phút / bên</span>
                  <span>
                    {room.status === "waiting" ? "Đang chờ" : "Đang đấu"}
                  </span>
                  <span>
                    {room.spectatorLimit === 0
                      ? "Không cho xem"
                      : `Người xem ${room.viewers}/${room.spectatorLimit}`}
                  </span>
                </div>
                <div className="xq-row">
                  {room.seats < 2 && (
                    <Button
                      variant="secondary"
                      onClick={() => onJoinRoom(room.id, "player")}
                    >
                      Vào chơi
                    </Button>
                  )}
                  {room.viewers < room.spectatorLimit && (
                    <Button
                      variant="ghost"
                      onClick={() => onJoinRoom(room.id, "spectator")}
                    >
                      Vào xem
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
