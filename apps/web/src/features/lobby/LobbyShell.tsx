import { useState, useId } from "react";
import {
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
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

/**
 * Giao diện chính của Sảnh (Hero banner, 4 chế độ chơi phong cách 3D, thanh nhập mã phòng tập trung và danh sách phòng cờ).
 */
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
  const [timeFilter, setTimeFilter] = useState<"all" | 5 | 15 | "blitz">("all");
  const codeInputId = useId();

  const joinDisabledReason = blockedReason
    ? blockedReason
    : !admissionReady
      ? "Danh sách đang kết nối lại. Vui lòng chờ."
      : joiningRoomId !== null
        ? "Đang vào phòng. Vui lòng chờ."
        : undefined;

  const filteredRooms = rooms.filter((room) => {
    if (timeFilter === "all") return true;
    if (timeFilter === "blitz") return room.timeMinutes === 5;
    return room.timeMinutes === timeFilter;
  });

  return (
    <div className="xq-lobby xq-stack">
      {/* 1. TOP HEADER BANNER CHUẨN DESIGN */}
      <div className="xq-lobby-header-bar">
        {/* KHỐI TRÁI: AVATAR TƯỚNG + TIÊU ĐỀ */}
        <div className="xq-header-left">
          <div className="xq-header-general-wrap">
            <img
              src="/images/lobby-avatar-general.png"
              alt="Tướng"
              className="xq-header-general-img"
            />
          </div>
          <div className="xq-header-text">
            <div className="xq-header-title-row">
              <h1>Sảnh kỳ hữu</h1>
            </div>
            <div className="xq-header-meta-row">
              <span className="xq-header-tagline">
                Kỳ Đài Trực Tuyến — Nơi Kỳ Hữu So Tài
              </span>
              <span className="xq-online-badge">
                <span className="xq-live-pulse" aria-hidden="true" />
                Trực tuyến: 1.250
              </span>
              {fixture && (
                <span className="xq-fixture-pill">Dữ liệu minh họa</span>
              )}
            </div>
          </div>
        </div>

        {/* THƯ PHÁP CHÌM Ở GIỮA */}
        <div className="xq-header-calligraphy" aria-hidden="true">
          楚河 漢界
        </div>

        {/* KHỐI PHẢI: USER CHIP + CÀI ĐẶT / LUẬT CHƠI */}
        <div className="xq-header-right">
          <div className="xq-user-stat-chip">
            <div className="xq-user-avatar-mini" aria-hidden="true">
              👤
            </div>
            <span className="xq-user-elo-text">👑 Elo: 1450</span>
            <span className="xq-chevron-down" aria-hidden="true">
              ▾
            </span>
          </div>

          <div className="xq-quick-actions">
            <button
              type="button"
              className="xq-icon-btn"
              title="Cài đặt"
              aria-label="Cài đặt"
            >
              ⚙️
            </button>
            <button
              type="button"
              className="xq-icon-btn"
              title="Âm thanh"
              aria-label="Âm thanh"
            >
              🔊
            </button>
            <button
              type="button"
              className="xq-rules-pill-btn"
              onClick={() => {
                const el = document.getElementById("xq-rules-section");
                el?.scrollIntoView({ behavior: "smooth" });
                const details = el?.querySelector("details");
                if (details) details.open = true;
              }}
            >
              📜 Luật chơi
            </button>
          </div>
        </div>
      </div>

      {/* 2. CHẾ ĐỘ CHƠI (4 CARDS CAO CẤP) */}
      <section className="xq-modes-section" aria-label="Chế độ chơi">
        <h2 className="xq-section-heading">Chế độ chơi</h2>

        <div className="xq-modes-grid-target">
          {/* CARD 1: TỰ TẠO PHÒNG */}
          <article className="xq-mode-card-target card-create">
            <div className="xq-card-art">
              <img
                src="/images/lobby-mode-create.png"
                alt="Tự tạo phòng"
                className="xq-art-img"
              />
            </div>
            <div className="xq-card-content">
              <h3>Tự tạo phòng</h3>
              <p>Tạo phòng riêng, mời bạn bè bằng mã hoặc liên kết</p>
            </div>
            <div className="xq-card-btn-wrap">
              <Button
                variant="primary"
                onClick={onCreate}
                disabledReason={blockedReason}
              >
                Tạo phòng
              </Button>
            </div>
          </article>

          {/* CARD 2: ĐẤU VỚI MÁY */}
          <article className="xq-mode-card-target card-ai">
            <div className="xq-card-art art-glow-red">
              <img
                src="/images/lobby-mode-ai.png"
                alt="Đấu với máy"
                className="xq-art-img"
              />
            </div>
            <div className="xq-card-content">
              <h3>Đấu với máy</h3>
              <p>Rèn luyện chiến thuật từ Dễ đến Khó</p>
            </div>
            <div className="xq-card-btn-wrap">
              <Button
                variant="secondary"
                onClick={onPlayAI}
                disabledReason={blockedReason}
              >
                Vào chơi
              </Button>
            </div>
          </article>

          {/* CARD 3: GHÉP NGẪU NHIÊN */}
          <article className="xq-mode-card-target card-quick">
            <div className="xq-card-art art-glow-gold">
              <img
                src="/images/lobby-mode-quick.png"
                alt="Ghép ngẫu nhiên"
                className="xq-art-img"
              />
            </div>
            <div className="xq-card-content">
              <h3>Ghép ngẫu nhiên</h3>
              <p>Tìm đối thủ cùng trình độ ngay lập tức</p>
            </div>
            <div className="xq-card-btn-wrap">
              <Button variant="secondary" disabledReason="Sắp ra mắt">
                Ghép trận
              </Button>
            </div>
          </article>

          {/* CARD 4: ĐẤU HẠNG (DISABLED / GIAI ĐOẠN 2) */}
          <article className="xq-mode-card-target card-ranked card-disabled">
            <div className="xq-card-art">
              <img
                src="/images/lobby-mode-ranked.png"
                alt="Đấu hạng"
                className="xq-art-img"
              />
            </div>
            <div className="xq-card-content">
              <h3>Đấu hạng</h3>
              <p>Thi đấu xếp hạng chưa mở (Giai đoạn P2)</p>
            </div>
            <div className="xq-card-btn-wrap">
              <Button variant="secondary" disabledReason="Sắp ra mắt">
                Đấu hạng
              </Button>
            </div>
          </article>
        </div>
      </section>

      {/* 3. THANH NHẬP MÃ 8 SỐ Ở GIỮA */}
      <div className="xq-middle-code-section">
        <form
          className="xq-middle-code-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!/^[0-9]{8}$/.test(code)) {
              setCodeError("Mã phòng gồm đúng 8 chữ số.");
              return;
            }
            setCodeError("");
            onJoinCode(code);
          }}
        >
          <div className="xq-middle-input-shell">
            <input
              id={codeInputId}
              type="text"
              inputMode="numeric"
              placeholder="[  Nhập mã 8 số...  ]"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, ""));
                setCodeError("");
              }}
              maxLength={8}
              className="xq-middle-code-input"
              aria-label="Mã phòng 8 số"
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            disabledReason={blockedReason}
          >
            Vào phòng
          </Button>
        </form>
        {codeError && <p className="xq-code-inline-error">{codeError}</p>}
      </div>

      {/* 4. PHÒNG CÔNG KHAI */}
      <section
        className="xq-panel xq-target-rooms-section"
        aria-label="Phòng công khai"
        aria-busy={joiningRoomId !== null}
      >
        <div className="xq-target-rooms-head">
          <div className="xq-rooms-title-box">
            <span className="xq-rooms-icon" aria-hidden="true">
              📜
            </span>
            <h2>Phòng công khai</h2>
          </div>

          <div className="xq-rooms-head-actions">
            {/* TABS LỌC THỜI GIAN */}
            <div className="xq-filter-pill-group" role="tablist">
              <button
                type="button"
                className={`xq-filter-btn ${timeFilter === "all" ? "active" : ""}`}
                onClick={() => setTimeFilter("all")}
              >
                Tất cả
              </button>
              <button
                type="button"
                className={`xq-filter-btn ${timeFilter === 5 ? "active" : ""}`}
                onClick={() => setTimeFilter(5)}
              >
                5 phút
              </button>
              <button
                type="button"
                className={`xq-filter-btn ${timeFilter === 15 ? "active" : ""}`}
                onClick={() => setTimeFilter(15)}
              >
                15 phút
              </button>
              <button
                type="button"
                className={`xq-filter-btn ${timeFilter === "blitz" ? "active" : ""}`}
                onClick={() => setTimeFilter("blitz")}
              >
                Cờ chớp
              </button>
            </div>

            {/* NÚT TẠO PHÒNG MỚI MÀU VÀNG */}
            <button
              type="button"
              className="xq-create-room-gold-btn"
              onClick={onCreate}
              disabled={Boolean(blockedReason)}
            >
              + Tạo phòng mới
            </button>
          </div>
        </div>

        {/* DANH SÁCH PHÒNG */}
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
        ) : state === "empty" || filteredRooms.length === 0 ? (
          <EmptyState
            title={
              rooms.length === 0
                ? "Chưa có phòng công khai"
                : "Không tìm thấy phòng phù hợp"
            }
            action={
              <Button onClick={onCreate} disabledReason={blockedReason}>
                Tạo phòng đầu tiên
              </Button>
            }
          >
            {rooms.length === 0
              ? "Hãy tạo phòng rồi mở Công khai để mời kỳ hữu."
              : "Thử chọn mục 'Tất cả' để xem toàn bộ phòng."}
          </EmptyState>
        ) : (
          <div className="xq-target-room-list">
            {filteredRooms.map((room) => (
              <article className="xq-target-room-row" key={room.id}>
                <div className="xq-target-room-info">
                  <span className="xq-room-primary-text">
                    <strong>{room.name}</strong>
                    {room.hostName && ` (${room.hostName})`}
                  </span>
                  <span className="xq-target-room-sep">•</span>
                  <span className="xq-target-room-time">
                    ⏱️ {room.timeMinutes} phút
                  </span>
                  <span className="xq-target-room-sep">•</span>
                  <span
                    className={`xq-target-room-status ${
                      room.status === "waiting"
                        ? "status-waiting"
                        : "status-playing"
                    }`}
                  >
                    {room.status === "waiting"
                      ? `Đang chờ (${room.seats}/2)`
                      : `Đang đấu (${room.seats}/2)`}
                  </span>
                  {room.spectatorLimit > 0 && (
                    <span className="xq-target-room-viewers">
                      [{room.viewers} xem]
                    </span>
                  )}
                </div>

                <div className="xq-target-room-actions">
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
                      Xem
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 5. LUẬT CHƠI RÚT GỌN */}
      <div id="xq-rules-section">
        <GameRules />
      </div>
    </div>
  );
}
