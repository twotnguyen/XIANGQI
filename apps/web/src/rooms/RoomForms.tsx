import { useState, type FormEvent } from "react";
import { containsForbiddenName } from "@xiangqi/shared";
import { Button, TextField, Notice } from "../ui/primitives.js";
import "./rooms.css";
export interface CreateRoomInput {
  name: string;
  timeMinutes: 5 | 10 | 15;
  viewerLimit: number;
}
export function nameError(value: string) {
  const name = value.normalize("NFC").trim();
  if (!name) return "Nhập tên phòng.";
  if (Array.from(name).length > 60) return "Tên phòng tối đa 60 ký tự.";
  if (
    containsForbiddenName(name) ||
    Array.from(name).some((character) => {
      const point = character.codePointAt(0)!;
      return point < 32 || (point >= 127 && point <= 159);
    })
  )
    return "Tên phòng chứa nội dung không được phép.";
  return "";
}
export function CreateRoomForm({
  onCreate,
}: {
  onCreate: (input: CreateRoomInput) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [timeMinutes, setTime] = useState<5 | 10 | 15>(10);
  const [viewerLimit, setViewers] = useState(5);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const invalid = nameError(name);
    setError(invalid);
    if (invalid) return;
    setBusy(true);
    setNotice("");
    try {
      await onCreate({
        name: name.normalize("NFC").trim(),
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
      <p>Mời một kỳ hữu, chọn nhịp đấu của bạn.</p>
      <TextField
        label="Tên phòng"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          setError("");
        }}
        error={error}
        helper="1–60 ký tự, không chứa từ cấm."
        disabled={busy}
      />
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
    const normalized = code.replace(/[\s-]/g, "").toUpperCase();
    if (!/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/.test(normalized)) {
      setError("Nhập mã phòng gồm 8 ký tự hợp lệ.");
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
        autoCapitalize="characters"
        autoComplete="off"
        value={code}
        disabled={busy}
        error={error}
        helper="Nhập mã 8 ký tự từ người mời."
        onChange={(event) => {
          setCode(event.target.value);
          setError("");
        }}
      />
      <Button type="submit" loading={busy}>
        Vào phòng
      </Button>
    </form>
  );
}
