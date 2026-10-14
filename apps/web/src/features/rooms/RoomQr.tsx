import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "../../shared/ui/primitives.js";
import "./room-qr.css";

/**
 * QR thẻ mời: cùng một link token với mã 8 ký tự, không cấp quyền chơi/xem riêng.
 * Host khoá phòng (LOCKED) sẽ ẩn QR/link/mã ở phía RoomPage.
 */
export function RoomQr({ url, code }: { url: string; code: string }) {
  const holder = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function download() {
    const svg = holder.current?.querySelector("svg");
    if (!svg) {
      setError("Chưa thể tạo ảnh QR. Vui lòng thử lại.");
      return;
    }
    setError("");
    try {
      const markup = new XMLSerializer().serializeToString(svg),
        blob = new Blob([markup], { type: "image/svg+xml" }),
        objectUrl = URL.createObjectURL(blob),
        anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `xiangqi-${code}.svg`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
      setStatus("Đã tải ảnh QR.");
    } catch {
      setError("Chưa thể tải ảnh QR. Vui lòng thử lại.");
    }
  }

  async function copyLink() {
    if (busy) return;
    setBusy(true);
    setError("");
    setStatus("");
    try {
      if (!navigator.clipboard?.writeText) throw Error("clipboard unavailable");
      await navigator.clipboard.writeText(url);
      setStatus("Đã sao chép liên kết mời.");
    } catch {
      setError("Chưa thể sao chép liên kết. Hãy chọn và sao chép thủ công.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="xq-room-qr" aria-label="QR mời vào phòng">
      <h3>QR mời vào phòng</h3>
      <div className="xq-room-qr-code" ref={holder}>
        <QRCodeSVG
          value={url}
          size={168}
          level="M"
          title={`QR mời vào phòng, mã ${code}`}
        />
      </div>
      <p className="xq-room-qr-hint">
        QR dùng đúng liên kết và mã phòng hiện tại, không cấp quyền chơi hoặc
        xem riêng. Người quét vẫn phải đăng nhập.
      </p>
      <div className="xq-room-qr-actions">
        <Button variant="secondary" onClick={download}>
          Tải ảnh QR
        </Button>
        <Button
          variant="secondary"
          loading={busy}
          onClick={() => void copyLink()}
        >
          Sao chép liên kết
        </Button>
      </div>
      {status && (
        <p role="status" aria-live="polite">
          {status}
        </p>
      )}
      {error && (
        <p role="alert" aria-live="assertive">
          {error}
        </p>
      )}
    </section>
  );
}
