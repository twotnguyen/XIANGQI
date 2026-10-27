import { useState, type FormEvent } from "react";
import { Button, TextField, Notice } from "../../shared/ui/primitives.js";
import "./rooms.css";
export interface CreateRoomInput {
  timeMinutes: 5 | 10 | 15;
  viewerLimit: number;
}
/**
 * Biểu mẫu tạo phòng cờ mới (chọn nhịp đấu thời gian mỗi bên và giới hạn số lượng người xem).
 */
export function CreateRoomForm({
  onCreate,
}: {
  onCreate: (input: CreateRoomInput) => Promise<void>;
}) {
  const [timeMinutes, setTime] = useState<5 | 10 | 15>(10);
  const [viewerLimit, setViewers] = useState(5);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice("");
    try {
      await onCreate({
        timeMinutes,
        viewerLimit,
      });
    } catch {
      setNotice("Chưa thể tạo phòng. Kiểm tra kết nối và thử lại.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      className="xq-ui xq-room-form"
      onSubmit={(event) => void submit(event)}
      noValidate
    >
      <h2>Tạo phòng cờ</h2>
      <p>Mã phòng được cấp tự động. Chọn nhịp đấu và mời một kỳ hữu.</p>
      <fieldset disabled={busy}>
        <legend>Thời gian mỗi bên</legend>
        <div className="xq-room-options">
          {([5, 10, 15] as const).map((value) => (
            <label key={value}>
              <input
                type="radio"
                name="timeMinutes"
                checked={timeMinutes === value}
                onChange={() => setTime(value)}
              />
              {value} phút
            </label>
          ))}
        </div>
      </fieldset>
      <label className="xq-room-select">
        Người xem
        <select
          value={viewerLimit}
          disabled={busy}
          onChange={(event) => setViewers(Number(event.target.value))}
        >
          {[0, 1, 2, 3, 4, 5].map((value) => (
            <option key={value} value={value}>
              {value === 0 ? "Không có người xem" : `Tối đa ${value} người xem`}
            </option>
          ))}
        </select>
      </label>
      <p className="xq-help">
        Thời gian và số người xem được giữ nguyên sau khi tạo. Phòng chỉ vào
        bằng mã hoặc lời mời.
      </p>
      {notice && <Notice tone="error" message={notice} />}
      <Button type="submit" loading={busy}>
        Tạo phòng
      </Button>
    </form>
  );
}
/**
 * Biểu mẫu nhập mã mời 8 chữ số để tham gia phòng cờ.
 */
export function JoinRoomForm({
  onJoin,
  initialCode = "",
}: {
  onJoin: (code: string) => Promise<void>;
  initialCode?: string;
}) {
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const normalized = code.replace(/[\s-]/g, "");
    if (!/^[0-9]{8}$/.test(normalized)) {
      setError("Mã phòng gồm đúng 8 chữ số.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onJoin(normalized);
    } catch {
      setError("Chưa thể vào phòng. Kiểm tra mã, quyền vào phòng và kết nối.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      className="xq-ui xq-room-form"
      onSubmit={(event) => void submit(event)}
      noValidate
    >
      <h2>Vào phòng bằng mã</h2>
      <TextField
        label="Mã phòng"
        inputMode="numeric"
        autoComplete="off"
        value={code}
        disabled={busy}
        error={error}
        helper="Nhập 8 chữ số từ người mời."
        onChange={(event) => {
          setCode(event.target.value.replace(/\D/g, ""));
          setError("");
        }}
      />
      <Button type="submit" loading={busy}>
        Vào phòng
      </Button>
    </form>
  );
}
