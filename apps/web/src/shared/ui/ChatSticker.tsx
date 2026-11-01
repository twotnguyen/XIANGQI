import { useState } from "react";
import { CHAT_STICKERS, chatSticker } from "@xiangqi/shared";
import "./chat-sticker.css";

const paths: Record<string, string> = {
  clap: "M5 14 3 11m5 1-2-4m5 3V6m3 5 2-4m-9 8c2-2 4-2 6 0l3-3c2-1 3 1 2 2l-4 5c-2 2-6 2-8 0z",
  heart: "M12 20S3 15 3 9c0-5 6-6 9-2 3-4 9-3 9 2 0 6-9 11-9 11z",
  think: "M4 11a8 8 0 1 1 15 4l1 4-4-1a8 8 0 0 1-12-7zm5-2h.01M15 9h.01M9 14h6",
  sweat: "M12 4a8 8 0 1 0 8 8M8 10h.01M15 10h.01M9 16h6M20 3c0 2-2 3-2 5a2 2 0 0 0 4 0c0-2-2-3-2-5z",
  cry: "M12 4a8 8 0 1 0 8 8 8 8 0 0 0-8-8zM8 10h.01M16 10h.01M9 16c2-2 4-2 6 0M7 12v2m10-2v2",
  tea: "M5 9h12v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5zm12 1h2a2 2 0 0 1 0 4h-2M8 3v3m4-3v3",
  lightning: "M13 2 5 13h6l-1 9 9-12h-6z",
  silent: "M12 4a8 8 0 1 0 8 8 8 8 0 0 0-8-8zM8 10h.01M16 10h.01M9 15h6",
  thumbsup: "M8 20H4v-9h4zm0-9 4-7c1-2 3-1 3 1l-1 4h4c2 0 3 1 2 3l-2 6c0 1-1 2-3 2H8z",
  handshake: "M3 10 7 6l5 2 4-2 5 4-6 8-3-2-2 2-7-6zm5-1 3 3 3-2 5 4",
  flag: "M6 21V3m0 1c5-3 8 3 13 0v9c-5 3-8-3-13 0",
  fire: "M12 2c1 5-4 6-4 10-2-1-2-3-2-3-4 7 0 12 6 12s9-5 6-11c0 3-2 3-2 3 0-4-2-7-4-11z",
};

function StickerImage({ code, label }: { code: string; label: string }) {
  return <svg className="xq-chat-sticker__image" viewBox="0 0 24 24" role="img" aria-label={label} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[code.replaceAll(":", "")]} /></svg>;
}

export function ChatContent({ content }: { content: string }) {
  const sticker = chatSticker(content);
  return sticker ? <StickerImage {...sticker} /> : <>{content}</>;
}

export function StickerPicker({ disabled, label, onSelect }: { disabled: boolean; label: string; onSelect: (content: string) => void }) {
  const [open, setOpen] = useState(false);
  return <div className="xq-chat-sticker">
    <button type="button" disabled={disabled} aria-expanded={open} aria-label={`Sticker ${label}`} onClick={() => setOpen(!open)}>Sticker</button>
    {open && <div className="xq-chat-sticker__picker" role="group" aria-label="Chọn sticker">
      {CHAT_STICKERS.map((sticker) => <button type="button" key={sticker.code} disabled={disabled} aria-label={sticker.label} onClick={() => { setOpen(false); onSelect(`:${sticker.code.replaceAll(":", "")}:`); }}><StickerImage {...sticker} /></button>)}
      <button type="button" onClick={() => setOpen(false)}>Đóng</button>
    </div>}
  </div>;
}
