# BẢN QUY CHUẨN THƯƠNG HIỆU & HỆ THỐNG TOKEN (BRAND SPEC)
## Dự án: Cờ Tướng Online (Web Xiangqi)

Căn cứ: `docs/03-screens/design-tokens.md`, Quyết định DEC-024 (WCAG AA), Câu 19-20 phỏng vấn.

### 1. Hệ thống Tokens thị giác (Visual Tokens)
Các giá trị màu gốc (Hex) và hệ quy chiếu hiện đại OKLch:

- `--bg`: `oklch(93.2% 0.038 85.5)` (`#F5E8CC` — Nền giấy dó truyền thống)
- `--surface`: `oklch(76.8% 0.088 77.2)` (`#D8AE72` — Mặt bàn cờ gỗ sáng / Thẻ thông tin)
- `--fg`: `oklch(26.1% 0.015 56.8)` (`#28221C` — Mực tàu, chữ chính, độ tương phản 12.95:1 trên giấy)
- `--muted`: `oklch(47.5% 0.035 65.2)` (`#6C5B49` — Chữ phụ, nhãn trạng thái tĩnh)
- `--border`: `oklch(42.5% 0.081 54.4)` (`#704525` — Viền bàn gỗ, đường kẻ ô cờ)
- `--accent`: `oklch(43.8% 0.176 29.8)` (`#A51F25` — Đỏ chu sa, quân đỏ, CTA chính)
- `--focus`: `oklch(45.2% 0.098 221.5)` (`#155E75` — Xanh chàm tiêu điểm bàn phím, đạt 5.99:1 trên giấy)
- `--black-piece`: `oklch(24.8% 0.012 55.0)` (`#24201C` — Quân đen mực đẫm)

### 2. Font Stacks (Phông chữ)
- **Display / Tiêu đề thương hiệu:** `ui-serif, Georgia, Cambria, "Times New Roman", Times, serif` (Gợi cảm giác thư pháp, cổ điển, trang trọng).
- **Body / Giao diện & Thao tác:** `system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` (Đảm bảo hiển thị trọn vẹn dấu tiếng Việt, dễ đọc ở kích thước nhỏ).
- **Quân cờ (Hán tự):** `"Songti SC", "Noto Serif CJK SC", "Source Han Serif SC", SimSun, serif` (Chữ Hán phông Tống thể / Minh thể nét thanh nét đậm, tự host hoặc hệ thống, không phụ thuộc CDN mạng ngoài).
- **Mono / Đồng hồ & Toạ độ:** `ui-monospace, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", monospace` (Đảm bảo số nhảy tabular-nums không làm giật layout).

### 3. Quy tắc cốt lõi định hình ngôn ngữ thị giác
1. **Tinh thần Cờ Tướng truyền thống:** Không mô phỏng bảng điều khiển công nghệ cao (SaaS dashboard đen bóng/neon), giữ trục “Bàn cờ gỗ 9×10 + Sổ ghi nước đi mực tàu”.
2. **Không truyền đạt thông tin chỉ bằng màu (DT-01):** Mọi cảnh báo, lượt đi, trạng thái kết nối đều kèm nhãn chữ tiếng Việt và biểu tượng minh họa.
3. **Phân biệt hai phe không cần màu & chữ Hán (DT-21):** Quân Đỏ có viền đôi (double ring), quân Đen có viền đơn (single ring) với độ đậm nhạt tương phản, hỗ trợ người mù màu đỏ–lục (8% nam giới).
4. **Bảo toàn bố cục & Không tràn ngang (DT-11 -> DT-15):** Bàn cờ luôn đặt tại giao điểm (không phải trong ô); trên mobile bàn cờ chiếm full bề ngang (360px & 390px không bao giờ có thanh cuộn ngang), Camera và Chat tách thành Tab riêng để không che khuất ván đấu.
5. **Tiết chế thị giác & Action Economy:** Mỗi màn hình chỉ có duy nhất 1 nút CTA chính (Primary red button), nút nguy hiểm/rời phòng/đầu hàng được phân cấp rõ ràng và có bước xác nhận bảo vệ quyền lợi người chơi.
