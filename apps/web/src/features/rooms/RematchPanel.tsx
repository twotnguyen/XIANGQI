import { useEffect, useState } from "react";
import { Button } from "../../shared/ui/primitives.js";

type RematchSide = "KEEP" | "SWAP";

export interface RematchOffer {
  proposerId: string;
  responderId: string;
  side: RematchSide;
  expiresAt: string;
}

const SIDE_LABEL: Record<RematchSide, string> = {
  KEEP: "Giữ phe",
  SWAP: "Đổi phe",
};

function useSeconds(expiresAt: string | null, clockSkew: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    setNow(Date.now());
    if (!expiresAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);
  return expiresAt
    ? Math.max(0, Math.ceil((Date.parse(expiresAt) - now - clockSkew) / 1000))
    : 0;
}

/**
 * Khung đề nghị tái đấu sau ván phòng tùy chỉnh (US-P2-09).
 * Chỉ nhận props; máy chủ kiểm quyền, thời hạn và trạng thái thật.
 */
export function RematchPanel({
  offer,
  selfId,
  canPropose,
  busy,
  clockSkew,
  onPropose,
  onRespond,
}: {
  offer: RematchOffer | null;
  selfId: string;
  canPropose: boolean;
  busy: boolean;
  clockSkew: number;
  onPropose: (side: RematchSide) => void;
  onRespond: (accept: boolean) => void;
}) {
  const [side, setSide] = useState<RematchSide>("SWAP");
  const seconds = useSeconds(offer?.expiresAt ?? null, clockSkew);

  if (offer) {
    if (offer.responderId === selfId) {
      return (
        <section className="xq-rematch-panel" aria-label="Đề nghị tái đấu">
          <p role="status" aria-live="polite">
            Đối thủ đề nghị tái đấu: {SIDE_LABEL[offer.side]}. Còn {seconds}{" "}
            giây để trả lời.
          </p>
          <div className="xq-swap-prompt-actions">
            <Button loading={busy} onClick={() => onRespond(true)}>
              Đồng ý
            </Button>
            <Button
              variant="secondary"
              loading={busy}
              onClick={() => onRespond(false)}
            >
              Từ chối
            </Button>
          </div>
        </section>
      );
    }
    return (
      <section className="xq-rematch-panel" aria-label="Đề nghị tái đấu">
        <p role="status" aria-live="polite">
          {offer.proposerId === selfId
            ? `Đang chờ đối thủ trả lời (${SIDE_LABEL[offer.side]}). Còn ${seconds} giây.`
            : `Đang có đề nghị tái đấu. Còn ${seconds} giây.`}
        </p>
      </section>
    );
  }
  if (!canPropose) return null;
  return (
    <section className="xq-rematch-panel" aria-label="Tái đấu">
      <fieldset disabled={busy}>
        <legend>Phe sau ván tái đấu</legend>
        {(["SWAP", "KEEP"] as const).map((value) => (
          <label key={value}>
            <input
              type="radio"
              name="rematch-side"
              value={value}
              checked={side === value}
              onChange={() => setSide(value)}
            />{" "}
            {SIDE_LABEL[value]}
          </label>
        ))}
      </fieldset>
      <Button loading={busy} onClick={() => onPropose(side)}>
        Đề nghị tái đấu
      </Button>
    </section>
  );
}
