import { useEffect, useId, useRef, useState } from "react";
import { Dialog } from "../ui/primitives.js";
import type { RoomView } from "./room-client.js";
import "./RoomSettings.css";
export interface RoomSettingsProps {
  open: boolean;
  onClose: () => void;
  room: RoomView["room"];
  canManage: boolean;
  busy: boolean;
  error?: string;
  status?: string;
  onChange: (visibility: RoomView["room"]["visibility"]) => Promise<void>;
}
const modes = {
  PUBLIC: "Công khai",
  CODE_ONLY: "Chỉ qua mã hoặc link",
  LOCKED: "Khóa phòng",
} as const;
const descriptions = {
  PUBLIC: "Hiện ở Sảnh. Người mới có thể vào chơi hoặc vào xem khi còn chỗ.",
  CODE_ONLY: "Không hiện ở Sảnh. Người mới cần mã hoặc link để vào phòng.",
  LOCKED: "Chặn người mới. Giữ người đang chơi và người xem hiện có.",
} as const;
export function RoomSettings({
  open,
  onClose,
  room,
  canManage,
  busy,
  error,
  status,
  onChange,
}: RoomSettingsProps) {
  const id = useId();
  const [selected, setSelected] = useState(room.visibility);
  const [confirm, setConfirm] = useState(false);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const inFlight = useRef(false);
  const twoPlayers = room.seats.red !== null && room.seats.black !== null;
  const lockUnavailable = !twoPlayers && room.visibility !== "LOCKED";
  const working = busy || pending;
  const valid =
    canManage &&
    selected !== room.visibility &&
    !(selected === "LOCKED" && lockUnavailable);
  useEffect(() => {
    setSelected(room.visibility);
    setConfirm(false);
    setNotice("");
  }, [open, room.visibility]);
  useEffect(() => {
    if (!canManage || lockUnavailable) setConfirm(false);
  }, [canManage, lockUnavailable]);
  function close() {
    if (!busy && !inFlight.current) {
      setConfirm(false);
      onClose();
    }
  }
  async function save() {
    if (busy || inFlight.current || !valid) return;
    inFlight.current = true;
    setPending(true);
    setNotice("");
    try {
      await onChange(selected);
      setConfirm(false);
    } catch {
      setNotice(
        "Chưa thể đổi chế độ phòng. Kiểm tra trạng thái mới rồi thử lại.",
      );
      setConfirm(false);
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }
  function apply() {
    if (!valid || working) return;
    if (selected === "LOCKED") setConfirm(true);
    else void save();
  }
  return (
    <fieldset
      className="room-settings-boundary"
      disabled={working}
      aria-busy={working}
    >
      <Dialog
        open={open}
        onClose={
          confirm
            ? () => {
                if (!working) setConfirm(false);
              }
            : close
        }
        title={confirm ? "Khóa phòng?" : "Cài đặt phòng"}
        danger={confirm}
        onConfirm={
          confirm
            ? () => {
                void save();
              }
            : undefined
        }
        confirmLabel={working ? "Đang khóa…" : "Khóa phòng"}
      >
        <div className="room-settings">
          {confirm ? (
            <>
              <p>
                <strong>
                  Người mới sẽ không vào được. Người xem đang có vẫn được giữ
                  lại.
                </strong>
              </p>
              <p>
                Mã, link và lời mời chưa dùng sẽ bị thu hồi. Mở lại phòng sẽ
                sinh mã và link mới.
              </p>
            </>
          ) : (
            <>
              <p className="room-settings__current">
                Chế độ hiện tại: {modes[room.visibility]}
              </p>
              <p>
                {room.timeMinutes} phút ·{" "}
                {room.viewerLimit === 0
                  ? "Không có người xem"
                  : `Tối đa ${room.viewerLimit} người xem`}
              </p>
              {!canManage && (
                <p role="status">
                  Bạn không còn quyền chủ phòng. Chỉ chủ phòng được đổi chế độ.
                </p>
              )}
              <fieldset className="room-settings__modes" disabled={!canManage}>
                <legend>Chế độ phòng</legend>
                {(Object.keys(modes) as (keyof typeof modes)[]).map((mode) => (
                  <label
                    key={mode}
                    title={
                      mode === "LOCKED" && lockUnavailable
                        ? "Chỉ khoá được khi đã đủ 2 người chơi"
                        : undefined
                    }
                  >
                    <input
                      type="radio"
                      name={`${id}-visibility`}
                      value={mode}
                      checked={selected === mode}
                      disabled={mode === "LOCKED" && lockUnavailable}
                      aria-labelledby={`${id}-${mode}-label`}
                      aria-describedby={`${id}-${mode}`}
                      onChange={() => {
                        setSelected(mode);
                        setNotice("");
                      }}
                    />
                    <span>
                      <span id={`${id}-${mode}-label`}>{modes[mode]}</span>
                      <small id={`${id}-${mode}`}>{descriptions[mode]}</small>
                    </span>
                  </label>
                ))}
              </fieldset>
              {lockUnavailable && (
                <p className="room-settings__help">
                  Chỉ khoá được khi đã đủ 2 người chơi
                </p>
              )}
              <div className="room-settings__actions">
                <button
                  type="button"
                  className="xq-button xq-button-primary"
                  disabled={!valid || working}
                  onClick={apply}
                >
                  Lưu thay đổi
                </button>
              </div>
            </>
          )}
          {(error || notice) && <p role="alert">{error || notice}</p>}
          {status && <p role="status">{status}</p>}
          {working && <p role="status">Đang chờ máy chủ xác nhận…</p>}
        </div>
      </Dialog>
    </fieldset>
  );
}
