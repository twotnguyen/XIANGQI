import {
  cloneElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import "../styles/tokens.css";
import "./ui.css";

function Icon({ kind }: { kind: "success" | "error" | "info" | "loading" }) {
  return (
    <svg
      className={`xq-icon ${kind === "loading" ? "xq-spinner" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      {kind === "success" ? (
        <path d="m7 12 3 3 7-7" />
      ) : kind === "loading" ? (
        <path d="M12 3a9 9 0 0 1 9 9" strokeWidth="4" />
      ) : (
        <>
          <path d={kind === "error" ? "M12 7v6" : "M12 11v6"} />
          <path d={kind === "error" ? "M12 16h.01" : "M12 7h.01"} />
        </>
      )}
    </svg>
  );
}
/**
 * Nút bấm đa năng hỗ trợ các biến thể màu sắc, trạng thái đang tải (spinner) và lý do vô hiệu hóa cho trợ năng.
 */
export function Button({
  children,
  variant = "primary",
  loading = false,
  disabledReason,
  disabled = false,
  onClick,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
  disabledReason?: string;
}) {
  const id = useId();
  const blocked = disabled || loading || Boolean(disabledReason);
  const reason =
    disabledReason || (disabled ? "Thao tác hiện chưa khả dụng." : "");
  return (
    <span className="xq-button-group">
      <button
        {...props}
        type={props.type ?? "button"}
        className={`xq-button xq-button-${variant} ${className}`}
        aria-disabled={blocked}
        aria-busy={loading}
        aria-describedby={
          [props["aria-describedby"], reason ? id : ""]
            .filter(Boolean)
            .join(" ") || undefined
        }
        onClick={(event) => {
          if (blocked) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
      >
        {loading && <Icon kind="loading" />}
        {loading ? "Đang xử lý…" : children}
      </button>
      {reason && (
        <span className="xq-help" id={id}>
          {reason}
        </span>
      )}
    </span>
  );
}

/**
 * Ô nhập văn bản kèm nhãn (label), dòng trợ giúp (helper) và thông báo lỗi hợp lệ chuẩn trợ năng.
 */
export function TextField({
  label,
  helper,
  error,
  id: givenId,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helper?: string;
  error?: string;
}) {
  const generated = useId();
  const id = givenId ?? generated;
  return (
    <div className="xq-field">
      <label htmlFor={id}>{label}</label>
      <input
        {...props}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={
          [
            props["aria-describedby"],
            helper ? `${id}-help` : "",
            error ? `${id}-error` : "",
          ]
            .filter(Boolean)
            .join(" ") || undefined
        }
      />
      {helper && (
        <p className="xq-help" id={`${id}-help`}>
          {helper}
        </p>
      )}
      {error && (
        <p className="xq-field-error" id={`${id}-error`}>
          <Icon kind="error" />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Chú thích nổi (tooltip) hiển thị khi rê chuột hoặc di chuyển tiêu điểm bàn phím vào phần tử con.
 */
export function Tooltip({
  text,
  children,
}: {
  text: string;
  children: ReactElement<{ "aria-describedby"?: string }>;
}) {
  const id = useId();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const visible = (hovered || focused) && !dismissed;
  useEffect(() => {
    if (!visible) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDismissed(true);
    };
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [visible]);
  return (
    <span
      className="xq-tooltip-anchor"
      onMouseEnter={() => {
        setHovered(true);
        setDismissed(false);
      }}
      onMouseLeave={(event) => {
        if (
          !(event.relatedTarget instanceof Node) ||
          !event.currentTarget.contains(event.relatedTarget)
        )
          setHovered(false);
      }}
      onFocus={() => {
        setFocused(true);
        setDismissed(false);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setDismissed(true);
          event.stopPropagation();
        }
      }}
    >
      {cloneElement(children, {
        "aria-describedby": visible
          ? [children.props["aria-describedby"], id].filter(Boolean).join(" ")
          : children.props["aria-describedby"],
      })}
      {visible && (
        <span id={id} role="tooltip" className="xq-tooltip">
          {text}
        </span>
      )}
    </span>
  );
}

/**
 * Hộp thông báo hoặc toast hiển thị thông điệp phản hồi (thành công, cảnh báo, lỗi) kèm tùy chọn đóng hoặc hành động.
 */
export function Notice({
  tone = "info",
  message,
  onDismiss,
  action,
  toast = false,
}: {
  tone?: "success" | "error" | "info";
  message: string;
  onDismiss?: () => void;
  action?: ReactNode;
  toast?: boolean;
}) {
  useEffect(() => {
    if (!toast || tone === "error" || action || !onDismiss) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [toast, tone, action, onDismiss, message]);
  return (
    <div
      className={`xq-notice xq-notice-${tone} ${toast ? "xq-toast" : ""}`}
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon kind={tone} />
      <span>{message}</span>
      {action}
      {onDismiss && (
        <Button variant="ghost" aria-label="Đóng thông báo" onClick={onDismiss}>
          <span aria-hidden="true">×</span>
        </Button>
      )}
    </div>
  );
}
/**
 * Khung xương hiển thị hiệu ứng đang tải dạng dòng (placeholder loading skeleton).
 */
export function Skeleton({ label = "Đang tải dữ liệu…" }: { label?: string }) {
  return (
    <div className="xq-skeleton" role="status">
      <span className="xq-sr-only">{label}</span>
      {[1, 2, 3].map((row) => (
        <span key={row} aria-hidden="true" />
      ))}
    </div>
  );
}

/**
 * Màn hình tải toàn trang hiển thị huy hiệu quân Tướng (帥) và thông điệp khởi động phiên/giao diện.
 */
export function LoadingScreen({
  title = "Đang mở kỳ đài",
  message = "Đang tải giao diện…",
}: {
  title?: string;
  message?: string;
}) {
  const headingId = useId();
  return (
    <div className="xq-ui">
      <section className="xq-session-loading" aria-labelledby={headingId}>
        <div className="xq-data-state xq-session-loading-card">
          <span
            className="xq-state-piece xq-session-loading-piece"
            aria-hidden="true"
          >
            帥
          </span>
          <div className="xq-session-loading-copy">
            <h1 id={headingId}>{title}</h1>
            <p role="status">{message}</p>
          </div>
          <span className="xq-session-loading-brand">Cờ Tướng Online</span>
        </div>
      </section>
    </div>
  );
}

/**
 * Khung hiển thị trạng thái dữ liệu trống kèm hình ảnh quân cờ và nút hành động gợi ý.
 */
export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="xq-data-state">
      <span className="xq-state-piece" aria-hidden="true">
        帥
      </span>
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </div>
  );
}

/**
 * Khung hiển thị trạng thái lỗi tải dữ liệu với icon cảnh báo và nút thử lại (retry).
 */
export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="xq-data-state" role="alert">
      <Icon kind="error" />
      <h2>Chưa thể tải dữ liệu</h2>
      <p>{message}</p>
      <Button variant="secondary" onClick={onRetry}>
        Thử lại
      </Button>
    </div>
  );
}

/**
 * Huy hiệu hiển thị số lượng thông báo hoặc lời mời chưa đọc (tối đa hiển thị 9+).
 */
export function Badge({ count, label }: { count: number; label: string }) {
  return count > 0 ? (
    <span className="xq-badge" aria-label={`${count} ${label}`}>
      {count > 9 ? "9+" : count}
    </span>
  ) : null;
}

/**
 * Bộ chuyển đổi các tab nội dung hỗ trợ điều hướng bằng phím mũi tên và chuẩn ARIA tablist.
 */
export function Tabs({
  items,
  label,
}: {
  items: { id: string; label: string; content: ReactNode }[];
  label: string;
}) {
  const group = useId();
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div className="xq-tabs">
      <div role="tablist" aria-label={label}>
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={(node) => {
              tabs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`${group}-${item.id}`}
            aria-controls={`${group}-panel`}
            aria-selected={selected === index}
            tabIndex={selected === index ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => {
              let next: number;
              if (event.key === "ArrowRight") next = (index + 1) % items.length;
              else if (event.key === "ArrowLeft")
                next = (index + items.length - 1) % items.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = items.length - 1;
              else return;
              event.preventDefault();
              setSelected(next);
              tabs.current[next]?.focus();
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${group}-panel`}
        aria-labelledby={`${group}-${items[selected]?.id}`}
        tabIndex={0}
      >
        {items[selected]?.content}
      </div>
    </div>
  );
}

/**
 * Hộp thoại modal (dialog) hỗ trợ focus trap, bấm ra ngoài để đóng, phím Esc và chế độ xác nhận nguy hiểm.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  danger = false,
  onConfirm,
  confirmLabel = "Xác nhận",
  cancelLabel = "Huỷ",
  dismissible = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  danger?: boolean;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  dismissible?: boolean;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const element = dialog.current!;
    if (!open) return;
    const trigger = document.activeElement as HTMLElement | null;
    element.showModal();
    if (danger) cancel.current?.focus();
    return () => {
      element.close();
      trigger?.focus();
    };
  }, [open, danger]);
  return (
    <dialog
      ref={dialog}
      className="xq-dialog xq-ui"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-content`}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
          ),
        ).filter((element) => !element.hidden && !element.closest("[hidden]"));
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          if (dismissible) onClose();
      }}
    >
      <header>
        <h2 id={`${id}-title`}>{title}</h2>
        <Button
          variant="ghost"
          aria-label="Đóng hộp thoại"
          onClick={onClose}
          disabled={!dismissible}
        >
          <span aria-hidden="true">×</span>
        </Button>
      </header>
      <div id={`${id}-content`}>{children}</div>
      <footer>
        <button
          type="button"
          ref={cancel}
          className="xq-button xq-button-secondary"
          onClick={onClose}
          disabled={!dismissible}
        >
          {cancelLabel}
        </button>
        {onConfirm && (
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        )}
      </footer>
    </dialog>
  );
}
