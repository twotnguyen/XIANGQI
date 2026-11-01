export const CHAT_STICKERS: readonly { code: string; label: string }[] = [
  { code: "clap", label: "Nước cờ hay" },
  { code: "heart", label: "Thả tim" },
  { code: "think", label: "Đang suy nghĩ" },
  { code: "sweat", label: "Toát mồ hôi" },
  { code: "cry", label: "Khóc ròng" },
  { code: "tea", label: "Uống trà" },
  { code: "lightning", label: "Nhanh tay" },
  { code: "silent", label: "Cạn lời" },
  { code: "thumbsup", label: "Đồng ý" },
  { code: "handshake", label: "Giao lưu vui vẻ" },
  { code: "flag", label: "Tâm phục" },
  { code: "fire", label: "Trận đấu kịch tính" },
];

export function chatSticker(content: string): { code: string; label: string } | undefined {
  return CHAT_STICKERS.find(({ code }) => content === `:${code}:`);
}
