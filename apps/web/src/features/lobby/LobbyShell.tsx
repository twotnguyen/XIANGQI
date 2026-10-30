import { useState, useRef } from "react";
import type { PublicRoomView } from "@xiangqi/shared";
import {
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
  TextField,
} from "../../shared/ui/primitives.js";
import { AppIcon } from "../../shared/ui/AppIcon.js";
import "./LobbyShell.css";
import { GameRules } from "./GameRules.js";

export interface PublicRoom {
  id: string;
  name: string;
  hostName: string;
  hostGuest: boolean;
  timeMinutes: PublicRoomView["timeMinutes"];
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
 * Sảnh kỳ hữu: lời chào, chế độ chơi, vào bằng mã và danh sách phòng công khai.
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
  const [timeFilter, setTimeFilter] = useState<"all" | 5 | 10 | 15>("all");
  const rulesRef = useRef<HTMLDivElement>(null);

  const joinDisabledReason = blockedReason
    ? blockedReason
    : !admissionReady
      ? "Danh sách đang kết nối lại. Vui lòng chờ."
      : joiningRoomId !== null
        ? "Đang vào phòng. Vui lòng chờ."
        : undefined;

  const filteredRooms = rooms.filter((room) => {
    if (timeFilter === "all") return true;
    return room.timeMinutes === timeFilter;
  });

  return (
    <div className="xq-lobby xq-stack">
      <header className="xq-lobby-welcome">
        <div>
          <p className="xq-eyebrow">KỲ ĐÀI CỔ PHONG</p>
          <h1>Sảnh kỳ hữu</h1>
          <p className="xq-welcome-copy">
            Gặp gỡ kỳ hữu. Cùng nhau viết nên những ván cờ hay.
          </p>
        </div>
        <div className="xq-welcome-actions">
          {fixture && <span className="xq-fixture-pill">Dữ liệu minh họa</span>}
          <button
            type="button"
            className="xq-rules-pill-btn"
            onClick={() => {
              const section = rulesRef.current;
              const details = section?.querySelector("details");
              if (details) details.open = true;
              section?.scrollIntoView({ block: "start" });
              section?.querySelector("summary")?.focus({ preventScroll: true });
            }}
          >
            <AppIcon name="book" />
            Luật chơi
          </button>
        </div>
      </header>

      <div className="xq-lobby-hero">
        <div className="xq-hero-copy">
          <span className="xq-hero-kicker">
            <span aria-hidden="true" />
            MỘT BÀN CỜ. MUÔN THẾ TRẬN.
          </span>
          <h2>
            Mỗi nước cờ,
            <br />
            <em>một tầm nhìn.</em>
          </h2>
          <p>
            Thưởng một ván cờ hay, gặp một người bạn mới. Chọn đối thủ của bạn
            và bắt đầu cuộc so tài.
          </p>
          <div className="xq-hero-actions">
            <Button onClick={onCreate} disabledReason={blockedReason}>
              <AppIcon name="plus" />
              Mở bàn cờ
            </Button>
            <Button
              variant="secondary"
              onClick={onPlayAI}
              disabledReason={blockedReason}
            >
              Đấu với máy
              <AppIcon name="arrow" />
            </Button>
          </div>
          <div className="xq-hero-note">
            <span aria-hidden="true">帥</span>Chơi cùng bạn bè · Rèn luyện mỗi
            ngày
          </div>
        </div>
        <div className="xq-hero-art" aria-hidden="true">
          <div className="xq-hero-calligraphy">棋逢對手</div>
          <img
            src="/images/lobby-mode-create.png"
            alt=""
            width="1024"
            height="1024"
            fetchPriority="high"
          />
          <div className="xq-hero-art-caption">
            <span>楚河 · 漢界</span>
            <span>TĨNH TÂM · ĐỊNH THẾ</span>
          </div>
        </div>
      </div>

      <section className="xq-modes-section" aria-label="Chế độ chơi">
        <div className="xq-section-intro">
          <div>
            <span className="xq-eyebrow">CHỌN CÁCH CỦA BẠN</span>
            <h2 className="xq-section-heading">Khởi đầu một ván cờ</h2>
          </div>
          <p>Bạn muốn thử sức hôm nay thế nào?</p>
        </div>

        <div className="xq-modes-grid-target">
          <article className="xq-mode-card-target card-create">
            <div className="xq-card-art">
              <img
                src="/images/lobby-mode-create.png"
                alt="Tự tạo phòng"
                className="xq-art-img"
                width="1024"
                height="1024"
                loading="lazy"
              />
            </div>
            <div className="xq-card-content">
              <span className="xq-mode-label">CÙNG KỲ HỮU</span>
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

          <article className="xq-mode-card-target card-ai">
            <div className="xq-card-art art-glow-red">
              <img
                src="/images/lobby-mode-ai.png"
                alt="Đấu với máy"
                className="xq-art-img"
                width="1024"
                height="1024"
                loading="lazy"
              />
            </div>
            <div className="xq-card-content">
              <span className="xq-mode-label">RÈN CHIẾN THUẬT</span>
              <h3>Đấu với máy</h3>
              <p>Rèn luyện chiến thuật từ Dễ đến Khó</p>
            </div>
            <div className="xq-card-btn-wrap">
              <Button
                variant="secondary"
                onClick={onPlayAI}
                disabledReason={blockedReason}
              >
                Chọn cấp độ máy
              </Button>
            </div>
          </article>

          <article className="xq-mode-card-target card-quick">
            <div className="xq-card-art art-glow-gold">
              <img
                src="/images/lobby-mode-quick.png"
                alt="Ghép ngẫu nhiên"
                className="xq-art-img"
                width="1024"
                height="1024"
                loading="lazy"
              />
            </div>
            <div className="xq-card-content">
              <span className="xq-mode-label">SẮP RA MẮT</span>
              <h3>Ghép ngẫu nhiên</h3>
              <p>Gặp gỡ đối thủ mới trong những ván giao hữu.</p>
            </div>
            <div className="xq-card-btn-wrap">
              <Button variant="secondary" disabledReason="Sắp ra mắt">
                Ghép trận
              </Button>
            </div>
          </article>

          <article className="xq-mode-card-target card-ranked card-disabled">
            <div className="xq-card-art">
              <img
                src="/images/lobby-mode-ranked.png"
                alt="Đấu hạng"
                className="xq-art-img"
                width="1024"
                height="1024"
                loading="lazy"
              />
            </div>
            <div className="xq-card-content">
              <span className="xq-mode-label">SẮP RA MẮT</span>
              <h3>Đấu hạng</h3>
              <p>Chinh phục thứ hạng. Chế độ đang phát triển.</p>
            </div>
            <div className="xq-card-btn-wrap">
              <Button variant="secondary" disabledReason="Sắp ra mắt">
                Đánh hạng
              </Button>
            </div>
          </article>
        </div>
      </section>

      <div className="xq-middle-code-section">
        <div className="xq-code-intro">
          <span className="xq-code-icon">
            <AppIcon name="key" />
          </span>
          <div>
            <h2>Đã có hẹn với kỳ hữu?</h2>
            <p>Nhập mã 8 chữ số để đến đúng bàn cờ.</p>
          </div>
        </div>
        <form
          className="xq-middle-code-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (blockedReason) return;
            if (!/^[0-9]{8}$/.test(code)) {
              setCodeError(
                "Mã phòng gồm đúng 8 chữ số. Kiểm tra lại rồi thử lại.",
              );
              return;
            }
            setCodeError("");
            onJoinCode(code);
          }}
        >
          <TextField
            label="Mã phòng"
            inputMode="numeric"
            placeholder="0000 0000"
            autoComplete="off"
            helper="Mã phòng gồm 8 chữ số"
            value={code}
            onChange={(event) => {
              setCode(event.target.value.replace(/\D/g, ""));
              setCodeError("");
            }}
            maxLength={8}
            error={codeError}
          />
          <Button
            type="submit"
            variant="secondary"
            disabledReason={blockedReason}
          >
            Vào phòng
            <AppIcon name="arrow" />
          </Button>
        </form>
      </div>

      <section
        className="xq-panel xq-target-rooms-section"
        aria-label="Phòng công khai"
        aria-busy={joiningRoomId !== null}
      >
        <div className="xq-target-rooms-head">
          <div className="xq-rooms-title-box">
            <div>
              <span className="xq-eyebrow">CÙNG NHAU SO TÀI</span>
              <h2>Phòng công khai</h2>
              <p className="xq-rooms-subtitle">
                Chọn một bàn cờ để vào chơi hoặc theo dõi.
              </p>
            </div>
          </div>

          <div className="xq-rooms-head-actions">
            <div
              className="xq-filter-pill-group"
              role="group"
              aria-label="Lọc thời gian mỗi bên"
            >
              <button
                type="button"
                aria-pressed={timeFilter === "all"}
                className={`xq-filter-btn ${timeFilter === "all" ? "active" : ""}`}
                onClick={() => setTimeFilter("all")}
              >
                Tất cả
              </button>
              <button
                type="button"
                aria-pressed={timeFilter === 5}
                className={`xq-filter-btn ${timeFilter === 5 ? "active" : ""}`}
                onClick={() => setTimeFilter(5)}
              >
                5 phút
              </button>
              <button
                type="button"
                aria-pressed={timeFilter === 10}
                className={`xq-filter-btn ${timeFilter === 10 ? "active" : ""}`}
                onClick={() => setTimeFilter(10)}
              >
                10 phút
              </button>
              <button
                type="button"
                aria-pressed={timeFilter === 15}
                className={`xq-filter-btn ${timeFilter === 15 ? "active" : ""}`}
                onClick={() => setTimeFilter(15)}
              >
                15 phút
              </button>
            </div>

            <Button onClick={onCreate} disabledReason={blockedReason}>
              <AppIcon name="plus" />
              Tạo phòng mới
            </Button>
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
                  <span
                    className={
                      "xq-room-seal " +
                      (room.status === "playing" ? "is-playing" : "")
                    }
                    aria-hidden="true"
                  >
                    {room.status === "playing" ? "將" : "帥"}
                  </span>
                  <div className="xq-room-primary-text">
                    <h3>{room.name}</h3>
                    <span>
                      {room.hostName}
                      {room.hostGuest ? " (Khách)" : ""}
                    </span>
                  </div>
                  <span className="xq-target-room-sep">•</span>
                  <span className="xq-target-room-time">
                    <AppIcon name="clock" />{" "}
                    {room.timeMinutes === 0
                      ? "Không giới hạn"
                      : `${room.timeMinutes} phút`}
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
                      {room.viewers} người xem
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
                      Vào xem
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div ref={rulesRef}>
        <GameRules />
      </div>
    </div>
  );
}
