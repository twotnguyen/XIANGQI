import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button, Dialog } from "../ui/primitives.js";
import "./ai-setup.css";
export interface AiSetupSelection {
  level: "easy" | "medium" | "hard";
  requestedSide: "red" | "black" | "random";
}
export interface AiSetupDialogProps {
  open: boolean;
  initial?: AiSetupSelection;
  pending?: boolean;
  onClose: () => void;
  onStart: (selection: AiSetupSelection) => Promise<void>;
}
const defaults: AiSetupSelection = { level: "easy", requestedSide: "red" };
export function AiSetupDialog(props: AiSetupDialogProps) {
  const initial = props.initial ?? defaults;
  return props.open ? (
    <SetupForm
      key={`${initial.level}/${initial.requestedSide}`}
      {...props}
      initial={initial}
    />
  ) : null;
}
function SetupForm({
  initial = defaults,
  onClose,
  onStart,
  pending = false,
}: AiSetupDialogProps) {
  const [level, setLevel] = useState(initial.level),
    [side, setSide] = useState(initial.requestedSide);
  const [working, setWorking] = useState(false),
    [error, setError] = useState("");
  const first = useRef<HTMLInputElement>(null),
    alive = useRef(true),
    inFlight = useRef(false);
  useLayoutEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const busy = pending || working;
  function close() {
    if (!busy && !inFlight.current) onClose();
  }
  async function start() {
    if (busy || inFlight.current) return;
    inFlight.current = true;
    setWorking(true);
    setError("");
    try {
      await onStart({ level, requestedSide: side });
      if (alive.current) onClose();
    } catch {
      if (alive.current)
        setError("Chưa thể bắt đầu ván với máy. Vui lòng thử lại.");
    } finally {
      if (alive.current) {
        inFlight.current = false;
        setWorking(false);
      }
    }
  }
  useEffect(() => {
    first.current?.focus();
  }, []);
  return (
    <Dialog
      open
      title="Thiết lập ván với máy"
      onClose={close}
      dismissible={!busy}
      cancelLabel={busy ? "Đang tạo ván…" : "Huỷ"}
    >
      <form
        className="xq-ai-setup"
        onSubmit={(event) => {
          event.preventDefault();
          void start();
        }}
      >
        <div className="xq-ai-setup-options">
          <fieldset disabled={busy}>
            <legend>Cấp độ máy cờ</legend>
            {(
              [
                ["easy", "Dễ"],
                ["medium", "Trung bình"],
                ["hard", "Khó"],
              ] as const
            ).map(([value, label]) => (
              <label key={value}>
                <input
                  ref={value === initial.level ? first : undefined}
                  type="radio"
                  name="ai-level"
                  value={value}
                  checked={level === value}
                  onChange={() => setLevel(value)}
                />
                {label}
              </label>
            ))}
          </fieldset>
          <fieldset disabled={busy}>
            <legend>Phe cờ của bạn</legend>
            {(
              [
                ["red", "Đỏ (đi trước)"],
                ["black", "Đen (máy đi trước)"],
                ["random", "Ngẫu nhiên"],
              ] as const
            ).map(([value, label]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="ai-side"
                  value={value}
                  checked={side === value}
                  onChange={() => setSide(value)}
                />
                {label}
              </label>
            ))}
          </fieldset>
        </div>
        <p>
          Ván đấu không giới hạn thời gian. Máy chủ chọn phe khi bạn chọn Ngẫu
          nhiên.
        </p>
        {error && <p role="alert">{error}</p>}
        <Button type="submit" loading={busy}>
          Bắt đầu
        </Button>
      </form>
    </Dialog>
  );
}
