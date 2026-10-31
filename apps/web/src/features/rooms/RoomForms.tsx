import { useState, type FormEvent } from "react";
import { Button, TextField, Notice } from "../../shared/ui/primitives.js";
import "./rooms.css";
/** 0 = Không giới hạn (chỉ thành viên tạo phòng); 5/10/15 phút mỗi bên. */
export type RoomTimeMinutes = 0 | 5 | 10 | 15;
export interface CreateRoomInput {
  timeMinutes: RoomTimeMinutes;
  viewerLimit: number;
  visibility: "CODE_ONLY" | "PUBLIC";
}
/**
 * Biểu mẫu tạo phòng cờ mới với thời gian, giới hạn người xem và quyền truy cập.
 * `allowUnlimited=false` (Khách) ẩn mức Không giới hạn; mức mặc định là 10 phút.
 */
export function CreateRoomForm({
  onCreate,
  initialTimeMinutes,
  allowUnlimited = true,
  creating = false,
  recoveryInput = null,
}: {
  onCreate: (input: CreateRoomInput) => Promise<void>;
  initialTimeMinutes?: RoomTimeMinutes;
  allowUnlimited?: boolean;
  creating?: boolean;
  recoveryInput?: CreateRoomInput | null;
}) {
  const [timeMinutes, setTime] = useState<RoomTimeMinutes>(
    initialTimeMinutes ?? (allowUnlimited ? 0 : 10),
  );
  const choices: RoomTimeMinutes[] = allowUnlimited
    ? [0, 5, 10, 15]
    : [5, 10, 15];
  const [viewerLimit, setViewers] = useState(5);
  const [visibility, setVisibility] = useState<"CODE_ONLY" | "PUBLIC">(
    "CODE_ONLY",
  );
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const selection = recoveryInput ?? { timeMinutes, viewerLimit, visibility };
  const locked = busy || creating || recoveryInput !== null;
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || creating) return;
    setBusy(true);
    setNotice("");
    try {
      await onCreate(selection);
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
      <fieldset disabled={locked}>
        <legend>Thời gian mỗi bên</legend>
        <div className="xq-room-options">
          {choices.map((value) => (
            <label key={value}>
              <input
                type="radio"
                name="timeMinutes"
                checked={selection.timeMinutes === value}
                onChange={() => setTime(value)}
              />
              {value === 0 ? "Không giới hạn" : `${value} phút`}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="xq-room-select">
        Người xem
        <select
          value={selection.viewerLimit}
          disabled={locked}
          onChange={(event) => setViewers(Number(event.target.value))}
        >
          {[0, 1, 2, 3, 4, 5].map((value) => (
            <option key={value} value={value}>
              {value === 0 ? "Không có người xem" : `Tối đa ${value} người xem`}
            </option>
          ))}
        </select>
      </label>
      <label className="xq-room-select">
        Quyền truy cập
        <select
          value={selection.visibility}
          disabled={locked}
          onChange={(event) =>
            setVisibility(event.target.value as CreateRoomInput["visibility"])
          }
        >
          <option value="CODE_ONLY">Chỉ qua mã/link/lời mời</option>
          <option value="PUBLIC">Công khai</option>
        </select>
      </label>
      <p className="xq-help">
        {selection.visibility === "PUBLIC"
          ? "Hiện ở Sảnh. Người khác có thể vào chơi hoặc vào xem khi còn chỗ."
          : "Không hiện ở Sảnh. Người khác cần mã, link hoặc lời mời để vào phòng."}
      </p>
      <p className="xq-help">
        Thời gian và số người xem được giữ nguyên sau khi tạo. Chủ phòng có thể
        đổi quyền truy cập trong Cài đặt phòng.
      </p>
      {notice && <Notice tone="error" message={notice} />}
      {recoveryInput && (
        <p className="xq-help" role="status">
          Chưa xác nhận được phòng trước. Lựa chọn được giữ nguyên; bấm Tạo
          phòng để kiểm tra lại cùng yêu cầu, không tạo thêm phòng.
        </p>
      )}
      <Button type="submit" loading={busy || creating}>
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
