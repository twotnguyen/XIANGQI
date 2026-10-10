import { useState } from "react";
import { AppShell } from "../layouts/AppShell.js";
import {
  LobbyShell,
  type DataState,
  type PublicRoom,
} from "../pages/LobbyShell.js";
import {
  Badge,
  Button,
  Dialog,
  EmptyState,
  ErrorState,
  Notice,
  Skeleton,
  Tabs,
  TextField,
  Tooltip,
} from "./primitives.js";
import "./gallery.css";
const states: { value: DataState; label: string }[] = [
  { value: "success", label: "Thành công" },
  { value: "loading", label: "Đang tải" },
  { value: "empty", label: "Trống" },
  { value: "error", label: "Lỗi" },
  { value: "disabled", label: "Vô hiệu" },
];
function StatePicker({
  value,
  onChange,
}: {
  value: DataState;
  onChange: (state: DataState) => void;
}) {
  return (
    <div
      className="xq-state-picker"
      role="group"
      aria-label="Trạng thái minh họa"
    >
      {states.map((state) => (
        <Button
          key={state.value}
          variant="secondary"
          aria-pressed={value === state.value}
          onClick={() => onChange(state.value)}
        >
          {state.label}
        </Button>
      ))}
    </div>
  );
}
export function ComponentGallery() {
  const [state, setState] = useState<DataState>("success");
  const [notice, setNotice] = useState("");
  const [dialog, setDialog] = useState<"ordinary" | "danger" | null>(null);
  const [name, setName] = useState("");
  return (
    <AppShell
      title="Thành phần giao diện"
      user={{ displayName: "Kỳ hữu minh họa", guest: false }}
    >
      <div className="xq-gallery xq-stack">
        <header className="xq-stack">
          <h1>Bộ thành phần giao diện</h1>
          <p className="xq-help">
            Dữ liệu và thao tác minh họa. Trang này không tạo phòng hoặc gửi
            lệnh lên máy chủ.
          </p>
        </header>
        <section className="xq-panel xq-stack">
          <h2>Trạng thái nội dung</h2>
          <StatePicker value={state} onChange={setState} />
          {state === "loading" ? (
            <Skeleton />
          ) : state === "empty" ? (
            <EmptyState
              title="Chưa có phòng công khai"
              action={
                <Button onClick={() => setState("success")}>
                  Xem dữ liệu minh họa
                </Button>
              }
            >
              Hãy tạo phòng để mời kỳ hữu.
            </EmptyState>
          ) : state === "error" ? (
            <ErrorState
              message="Chưa tải được dữ liệu minh họa."
              onRetry={() => setState("success")}
            />
          ) : state === "disabled" ? (
            <Button disabledReason="Danh sách đang tạm ngừng. Bạn vẫn có thể đánh với máy.">
              Mở danh sách
            </Button>
          ) : (
            <Notice
              tone="success"
              message="Danh sách đã sẵn sàng. Bạn có thể chọn phòng để vào chơi hoặc xem."
            />
          )}
        </section>
        <div className="xq-gallery-grid">
          <section className="xq-panel xq-stack">
            <h2>Nút và ô nhập</h2>
            <div className="xq-row">
              <Button
                onClick={() =>
                  setNotice("Bạn vừa thực hiện thao tác minh họa.")
                }
              >
                Tạo phòng
              </Button>
              <Button variant="secondary" onClick={() => setDialog("ordinary")}>
                Mở hộp thoại
              </Button>
              <Button variant="danger" onClick={() => setDialog("danger")}>
                Thử xác nhận nguy hiểm
              </Button>
              <Button loading>Gửi</Button>
              <Tooltip text="Sắp ra mắt">
                <Button variant="ghost" disabledReason="Sắp ra mắt">
                  Lịch sử
                </Button>
              </Tooltip>
            </div>
            <TextField
              label="Tên phòng minh họa"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={60}
              helper={`${name.length}/60 ký tự`}
              error={
                name.length > 0 && name.length < 3
                  ? "Nhập ít nhất 3 ký tự cho ví dụ này."
                  : undefined
              }
            />
          </section>
          <section className="xq-panel xq-stack">
            <h2>Thông báo và điều hướng</h2>
            <Notice tone="info" message="Bạn đang xem dữ liệu minh họa." />
            <Notice
              tone="error"
              message="Tin chưa gửi được. Hãy thử lại."
              action={
                <Button
                  variant="secondary"
                  onClick={() =>
                    setNotice("Thao tác Thử lại minh họa đã được nhận.")
                  }
                >
                  Thử lại
                </Button>
              }
            />
            <div className="xq-row">
              <span>Lời mời minh họa</span>
              <Badge count={12} label="lời mời mới" />
            </div>
            <Tabs
              label="Kênh chat minh họa"
              items={[
                {
                  id: "private",
                  label: "Kênh riêng",
                  content: "Chỉ hai người chơi đọc kênh này.",
                },
                {
                  id: "public",
                  label: "Kênh chung",
                  content: "Người chơi cũng đọc và gửi được ở kênh này.",
                },
              ]}
            />
          </section>
        </div>
        {notice && (
          <Notice message={notice} toast onDismiss={() => setNotice("")} />
        )}
        <Dialog
          open={dialog !== null}
          onClose={() => setDialog(null)}
          title={
            dialog === "danger" ? "Bạn muốn đầu hàng?" : "Hộp thoại minh họa"
          }
          danger={dialog === "danger"}
          onConfirm={() => {
            setDialog(null);
            setNotice(
              "Bạn đã xác nhận thao tác minh họa. Không có ván thật bị thay đổi.",
            );
          }}
          confirmLabel={dialog === "danger" ? "Đầu hàng minh họa" : "Xác nhận"}
        >
          {dialog === "danger" ? (
            <p>
              <strong>Bạn sẽ thua ván này ngay lập tức.</strong> Đây là ví dụ
              giao diện, không có ván thật.
            </p>
          ) : (
            <TextField
              label="Lời nhắn minh họa"
              helper="X, Esc hoặc bấm nền ngoài sẽ đóng hộp thoại."
            />
          )}
        </Dialog>
      </div>
    </AppShell>
  );
}
const fixtures: PublicRoom[] = [
  {
    id: "fixture1",
    name: "Trà đình · Ván giao hữu",
    hostName: "Kỳ hữu A",
    hostGuest: false,
    timeMinutes: 10,
    status: "waiting",
    seats: 1,
    viewers: 2,
    spectatorLimit: 5,
  },
  {
    id: "fixture2",
    name: "Luận cờ cuối tuần",
    hostName: "Kỳ hữu B",
    hostGuest: true,
    timeMinutes: 15,
    status: "playing",
    seats: 2,
    viewers: 1,
    spectatorLimit: 5,
  },
  {
    id: "fixture3",
    name: "Phòng không người xem",
    hostName: "Kỳ hữu C",
    hostGuest: false,
    timeMinutes: 5,
    status: "waiting",
    seats: 1,
    viewers: 0,
    spectatorLimit: 0,
  },
];
export function LobbyPreview() {
  const [state, setState] = useState<DataState>("success");
  const [notice, setNotice] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rooms, setRooms] = useState(fixtures);
  return (
    <AppShell
      title="Sảnh minh họa"
      user={{ displayName: "Kỳ hữu minh họa", guest: false }}
    >
      <div className="xq-stack">
        <StatePicker value={state} onChange={setState} />
        {notice && <Notice message={notice} onDismiss={() => setNotice("")} />}
        <LobbyShell
          fixture
          state={state}
          rooms={rooms}
          onCreate={() => setOpen(true)}
          onJoinCode={(code) =>
            setNotice(
              `Đã nhận mã ${code} cho ví dụ. Chưa gửi yêu cầu vào phòng thật.`,
            )
          }
          onPlayAI={() =>
            setNotice(
              "Đã chọn Đánh với máy trong ví dụ. Máy cờ sẽ được nối ở chức năng tương ứng.",
            )
          }
          onJoinRoom={(_id, role) =>
            setNotice(
              role === "player"
                ? "Đã chọn Vào chơi trong dữ liệu minh họa."
                : "Đã chọn Vào xem trong dữ liệu minh họa.",
            )
          }
          onRetry={() => setState("success")}
        />
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          title="Tạo phòng minh họa"
          confirmLabel="Tạo phòng minh họa"
          onConfirm={() => {
            setRooms((previous) => [
              {
                ...fixtures[0]!,
                id: `local-${previous.length}`,
                name: name.trim() || "Phòng minh họa mới",
              },
              ...previous,
            ]);
            setName("");
            setOpen(false);
            setState("success");
            setNotice(
              "Phòng minh họa đã được thêm vào danh sách local. Chưa tạo phòng thật.",
            );
          }}
        >
          <TextField
            label="Tên phòng"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={60}
            helper="Chỉ thay đổi dữ liệu minh họa trên trang này."
          />
        </Dialog>
      </div>
    </AppShell>
  );
}
