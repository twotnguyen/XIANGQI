import { useState } from "react";
import {
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
  TextField,
} from "../../shared/ui/primitives.js";
import "./LobbyShell.css";
import { GameRules } from "./GameRules.js";

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
  canPlay?: boolean;
  canWatch?: boolean;
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
  admissionReady?: boolean;
  joiningRoomId?: string | null;
  blockedReason?: string;
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
  admissionReady = true,
  joiningRoomId = null,
  blockedReason,
}: LobbyShellProps) {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const joinDisabledReason = blockedReason
    ? blockedReason
    : !admissionReady
      ? "Danh sách đang kết nối lại. Vui lòng chờ."
      : joiningRoomId !== null
        ? "Đang vào phòng. Vui lòng chờ."
        : undefined;

  return (
    <div className="xq-lobby xq-stack">
      {/* 1. HERO BANNER */}
      <div className="xq-welcome-banner">
        <div className="xq-banner-text">
          <div className="xq-banner-sub">
            <span className="xq-online-pill">🟢 Kỳ Đài Trực Tuyến</span>
            {fixture && (
              <span className="xq-fixture-pill">
                Dữ liệu minh họa · chưa kết nối phòng thật
              </span>
            )}
          </div>
          <h1>Sảnh kỳ hữu</h1>
          <p>
            Chọn một cách chơi, cùng nhau luận cờ. Tham gia giao lưu tỷ thí, rèn
            luyện kỳ nghệ trên bàn cờ tướng truyền thống.
          </p>
        </div>
        <div className="xq-banner-calligraphy" aria-hidden="true">
          楚河 漢界
        </div>
      </div>

      {/* 2. GAME MODES GRID */}
      <div className="xq-lobby-modes">
        {/* MODE 1: TỰ TẠO PHÒNG */}
        <section className="xq-panel xq-mode-card xq-stack">
          <div className="xq-mode-top">
            <span className="xq-mode-badge badge-p1">P1 · Khả dụng</span>
            <div className="xq-mode-icon" aria-hidden="true">
              🏛️
            </div>
          </div>
          <div className="xq-mode-info">
            <h2>Tự tạo phòng</h2>
            <p>Mời kỳ hữu qua mã phòng hoặc đường dẫn.</p>
            <div className="xq-mode-pills">
              <span className="xq-pill">5p · 10p · 15p</span>
              <span className="xq-pill">Tối đa 5 người xem</span>
              <span className="xq-pill">Cam / Mic LiveKit</span>
            </div>
          </div>
          <div className="xq-mode-bottom xq-stack">
            <Button onClick={onCreate} disabledReason={blockedReason}>
              Tạo phòng
            </Button>
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
              <Button
                type="submit"
                variant="secondary"
                disabledReason={blockedReason}
              >
                Vào phòng
              </Button>
            </form>
          </div>
        </section>

        {/* MODE 2: ĐÁNH VỚI MÁY */}
        <section className="xq-panel xq-mode-card xq-stack">
          <div className="xq-mode-top">
            <span className="xq-mode-badge badge-ai">P1 · Khả dụng</span>
            <div className="xq-mode-icon" aria-hidden="true">
              🤖
            </div>
          </div>
          <div className="xq-mode-info">
            <h2>Đánh với máy</h2>
            <p>Luyện nước đi với ba cấp độ Dễ, Trung bình và Khó.</p>
            <div className="xq-mode-pills">
              <span className="xq-pill">Dễ · Trung bình · Khó</span>
              <span className="xq-pill">Tự chọn phe</span>
              <span className="xq-pill">Không giới hạn giờ</span>
            </div>
          </div>
          <div className="xq-mode-bottom">
            <Button onClick={onPlayAI} disabledReason={blockedReason}>
              Chọn cấp độ máy
            </Button>
          </div>
        </section>

        {/* MODE 3: GHÉP NGẪU NHIÊN (P2) */}
        <section className="xq-panel xq-mode-card xq-future-card xq-stack">
          <div className="xq-mode-top">
            <span className="xq-mode-badge badge-p2">Sắp ra mắt</span>
            <div className="xq-mode-icon" aria-hidden="true">
              🍵
            </div>
          </div>
          <div className="xq-mode-info">
            <h3>Ghép ngẫu nhiên</h3>
            <p className="xq-help">
              Đánh Thường và Đánh Hạng sẽ được mở trong bản bổ sung.
            </p>
            <div className="xq-mode-pills">
              <span className="xq-pill">Cố định 15 phút</span>
              <span className="xq-pill">Riêng tư 100%</span>
              <span className="xq-pill strict">Không người xem</span>
            </div>
          </div>
          <div className="xq-mode-bottom">
            <Button variant="secondary" disabledReason="Sắp ra mắt">
              Đánh thường
            </Button>
          </div>
        </section>

        {/* MODE 4: ĐÁNH HẠNG (P2) */}
        <section className="xq-panel xq-mode-card xq-future-card xq-ranked-card xq-stack">
          <div className="xq-mode-top">
            <span className="xq-mode-badge badge-ranked">Sắp ra mắt</span>
            <div className="xq-mode-icon" aria-hidden="true">
              🏆
            </div>
          </div>
          <div className="xq-mode-info">
            <h3>Đánh hạng</h3>
            <p className="xq-help">
              Thi đấu tính điểm Elo chuẩn quốc tế FIDE Rapid.
            </p>
            <div className="xq-mode-pills">
              <span className="xq-pill strict">Cấm người xem</span>
              <span className="xq-pill strict">Cấm đi lại</span>
              <span className="xq-pill">10 phút Rapid</span>
            </div>
          </div>
          <div className="xq-mode-bottom">
            <Button variant="secondary" disabledReason="Sắp ra mắt">
              Đánh hạng
            </Button>
          </div>
        </section>
      </div>

      {/* 3. PHÒNG CÔNG KHAI */}
      <section
        className="xq-panel xq-rooms-section xq-stack"
        aria-label="Phòng công khai"
        aria-busy={joiningRoomId !== null}
      >
        <div className="xq-rooms-head-row">
          <div className="xq-rooms-title-wrap">
            <span className="xq-rooms-title-icon" aria-hidden="true">
              📜
            </span>
            <h2>Phòng công khai</h2>
            {rooms.length > 0 && (
              <span className="xq-rooms-count-pill">
                {rooms.length} phòng đang mở
              </span>
            )}
          </div>
        </div>

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
            action={
              <Button onClick={onCreate} disabledReason={blockedReason}>
                Tạo phòng đầu tiên
              </Button>
            }
          >
            Hãy tạo phòng rồi mở Công khai để mời kỳ hữu.
          </EmptyState>
        ) : (
          <div className="xq-room-list">
            {rooms.map((room) => (
              <article className="xq-room xq-room-card" key={room.id}>
                <div className="xq-room-top">
                  <div className="xq-room-title-block">
                    <h3>{room.name}</h3>
                    <p className="xq-help">
                      {room.hostName}
                      {room.hostGuest ? " (Khách)" : ""}
                    </p>
                  </div>
                  <span
                    className={`xq-status-badge ${
                      room.status === "waiting"
                        ? "badge-waiting"
                        : "badge-playing"
                    }`}
                  >
                    {room.status === "waiting" ? "Đang chờ" : "Đang đấu"}
                  </span>
                </div>
                <div className="xq-room-meta">
                  <span className="xq-meta-item">
                    ⏱️ {room.timeMinutes} phút / bên
                  </span>
                  <span className="xq-meta-item">
                    {room.status === "waiting" ? "Đang chờ" : "Đang đấu"}
                  </span>
                  <span className="xq-meta-item">
                    {room.spectatorLimit === 0
                      ? "Không cho xem"
                      : `Người xem ${room.viewers}/${room.spectatorLimit}`}
                  </span>
                </div>
                <div className="xq-room-actions xq-row">
                  {(room.canPlay ??
                    (room.status === "waiting" && room.seats < 2)) && (
                    <Button
                      variant="primary"
                      disabledReason={joinDisabledReason}
                      onClick={() => onJoinRoom(room.id, "player")}
                    >
                      Vào chơi
                    </Button>
                  )}
                  {(room.canWatch ?? room.viewers < room.spectatorLimit) && (
                    <Button
                      variant="secondary"
                      disabledReason={joinDisabledReason}
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

      {/* 4. LUẬT CHƠI RÚT GỌN */}
      <GameRules />
    </div>
  );
}
