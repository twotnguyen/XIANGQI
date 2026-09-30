# DESIGN.md — Hệ thống thiết kế Cờ Tướng Online

**Cập nhật:** 2026-10-01 (Đồng bộ BA Scope Decisions & Bộ Mockup 37 thành phần) · **Dành cho:** AI agent và Frontend dựng giao diện · người thiết kế làm Figma · Tester rà thiết kế
**Nguồn luật:** [BA-SCOPE-DECISIONS.md](BA-SCOPE-DECISIONS.md) · [DANH-MUC-MAN-HINH-XIANGQI.md](DANH-MUC-MAN-HINH-XIANGQI.md) · `DEC-024` (WCAG 2.1 AA)

---

## 0. Cách dùng file này

| Ký hiệu | Nghĩa |
|---|---|
| **Chốt** | Lấy nguyên từ đặc tả (`DT-*`, `SCR-*`, `DEC-*`). ⛔ Không được đổi ở đây — muốn đổi phải sửa đặc tả trước |
| 🟡 | **Đề xuất** để lấp chỗ đặc tả chưa quy định. Design được đổi, nhưng phải sửa **cùng lúc** file này + Figma + `apps/web/src/styles/tokens.css` và **đo lại tương phản** |
| 🆕 | Đề xuất **ngoài phạm vi đặc tả hiện tại** (chế độ tối). Cần quyết định `DEC` mới và Task trên Jira trước khi làm |

- Mâu thuẫn giữa file này và đặc tả ⇒ **đặc tả thắng**; báo người dùng để sửa file này.
- Mọi tỉ lệ tương phản trong file đã được **tính** theo công thức WCAG 2.1 (độ chói tương đối). Khi dựng thật vẫn phải **đo lại** trên màn hình thật (TK16.2.4).

---

## 1. Tinh thần thị giác

**Cờ tướng truyền thống Á Đông (Trà đình & Kỳ đài cổ phong)**: giấy xuyến chỉ, bàn gỗ mộc, mực đen, quân chữ Hán dập chìm, điểm xuyết kim loại đồng thau và sắc đỏ sơn mài (chốt, `DT` §1). Người dùng phải có cảm giác ngồi trong **một không gian đàm đạo kỳ nghệ trang trọng và tĩnh tại**, không phải một bảng điều khiển phần mềm văn phòng phẳng hay dashboard số liệu.

| Nên | Không nên |
|---|---|
| Bối cảnh trà đình trầm ấm, chất liệu gỗ tự nhiên, chữ mực rõ, điểm xuyết viền hoàng kim trang nhã | Giao diện kiểu dashboard công nghệ: thẻ số liệu xanh neon, biểu đồ phẳng vô cảm |
| Viền mảnh màu gỗ hoặc đồng thau chạm khắc, bóng đổ dập nổi/chìm PBR nhẹ, ấm | Gradient rực rỡ, kính mờ lạm dụng (glassmorphism xanh), bóng đổ đen gắt |
| Ít màu, màu mang biểu tượng văn hóa Á Đông (Đỏ chu sa, Vàng hoàng kim, Nâu gỗ gụ) | Tô màu trang trí lòe loẹt khắp nơi không theo phân cấp thị giác |
| Bàn cờ luôn lớn nhất màn hình khi đang chơi, tỷ lệ chuẩn `GR-COORD` | Để camera, chat, banner phụ lấn chiếm diện tích bàn cờ |
| Chữ tiếng Việt rõ ràng, câu ngắn, xưng hô kỳ hữu nhã nhặn | Tiếng Anh lẫn lộn, thuật ngữ IT thô ráp (bot, owner, viewer) |

---

## 2. Màu

### 2.1 Bảy màu gốc — **Chốt**, ⛔ không đổi mã

| Token CSS | Mã | Dùng ở |
|---|---|---|
| `--color-paper` | `#F5E8CC` | Nền trang |
| `--color-wood` | `#D8AE72` | Mặt bàn cờ |
| `--color-wood-edge` | `#704525` | Viền bàn, đường kẻ, nút chính |
| `--color-ink` | `#28221C` | Chữ chính |
| `--color-red` | `#A51F25` | Quân đỏ, hành động nguy hiểm |
| `--color-black` | `#24201C` | Quân đen |
| `--color-focus` | `#155E75` | Viền tiêu điểm bàn phím |

Tương phản đã đo (đặc tả): mực/giấy **12,95** · mực/gỗ **7,65** · đỏ/gỗ **3,62** (sát ngưỡng 3) · đen/gỗ **7,87** · đường kẻ/gỗ **3,98** · tiêu điểm/giấy **5,99** · tiêu điểm/gỗ **3,54** · gỗ viền/giấy **6,74**.

### 2.2 Màu bổ sung cho giao diện sáng — 🟡

| Token CSS | Mã | Dùng ở | Tương phản (đã tính) |
|---|---|---|---|
| `--color-surface` | `#FBF5E8` | Thẻ, khung, hộp thoại (nổi trên giấy) | mực/surface 14,47 |
| `--color-surface-sunken` | `#EDE0C4` | Ô nhập, vùng lõm, hàng xen kẽ | mực 12,02 · chữ phụ 5,86 |
| `--color-ink-muted` | `#5E5145` | Chữ phụ, chú thích, **câu giải thích vô hiệu** | /giấy 6,32 · /surface 7,06 |
| `--color-border` | `#8C6A48` | Viền ô nhập, nút phụ, checkbox (thành phần UI) | /giấy 4,05 · /surface 4,53 (≥ 3) |
| `--color-divider` | `#D9C7A3` | Đường phân cách **trang trí** (không mang thông tin) | — |
| `--color-success` | `#2E6B34` | Chữ/biểu tượng thành công, "Đang online" | /giấy 5,29 · /nền của nó 5,30 |
| `--color-warning` | `#8A4B00` | Cảnh báo, đồng hồ < 30 giây | /giấy 5,60 · /nền của nó 5,31 |
| `--color-danger` | `#A51F25` | Lỗi, nút nguy hiểm (= `--color-red`) | /giấy 6,13 · /nền của nó 5,62 |
| `--color-info` | `#1F5A85` | Thông tin, liên kết | /giấy 6,05 · /nền của nó 5,85 |
| `--color-success-bg` | `#E2EDD6` | Nền toast/khối thành công | mực trên nó 12,96 |
| `--color-warning-bg` | `#F6E1B8` | Nền cảnh báo | mực 12,26 |
| `--color-danger-bg` | `#F5DAD3` | Nền lỗi | mực 11,87 |
| `--color-info-bg` | `#DCE7EF` | Nền thông tin | mực 12,52 |
| `--color-gold` | `#C6922A` | Viền hoàng kim, huy hiệu xếp hạng, điểm nhấn chính | /nền giấy 4,82 · /nền tối 8,65 |
| `--color-gold-light` | `#F5CA67` | Chữ hoàng kim sáng, viền nổi, hiệu ứng hover | /nền tối 12,40 |
| `--color-gold-dark` | `#7A4E0F` | Viền đồng thau dập chìm, đường viền phân cách card | /nền giấy 6,20 |

**Màu riêng của bàn cờ** 🟡 (đều đo trên nền gỗ `#D8AE72`, cần ≥ 3):

| Token CSS | Mã | Dùng ở | Tương phản |
|---|---|---|---|
| `--board-piece-face` | `#F6E7C8` | Mặt quân (nền tròn) | đỏ/mặt quân 6,09 · đen/mặt quân 13,23 |
| `--board-select` | `#1E6B3A` | Vòng quân đang chọn | /gỗ 3,17 · /mặt quân 5,34 |
| `--board-hint` | `#3A2A1A` | Chấm đích hợp lệ, vòng quân ăn được | /gỗ 6,70 |
| `--board-last-move` | `#1E4F7A` | 4 góc vuông đánh dấu ô đi + ô đến | /gỗ 4,16 |
| `--board-check` | `#A51F25` | Vòng cảnh báo quanh Tướng bị chiếu | /gỗ 3,62 |

`--color-focus` giữ vai trò **duy nhất** là tiêu điểm bàn phím — ⛔ không dùng làm màu chọn quân hay liên kết.

### 2.3 Chế độ tối (Kỳ Đài Cổ Phong / Tea-Room Theme) — **Chốt chuẩn giao diện**

Dự án hỗ trợ 2 phong cách hiển thị: **Giao diện Giấy Xuyến Chỉ (Light Paper Theme)** và **Giao diện Kỳ Đài Trà Đình (Dark Tea-Room Theme - Mặc định của Game)**. Cả hai chế độ đều bảo toàn 100% tỷ lệ tương phản WCAG 2.1 AA.

**Nguyên tắc:**
1. **Bàn cờ giữ nguyên** màu sắc vật liệu gỗ mộc chuẩn Á Đông (`#D8AE72`, quân cờ, đường kẻ, dấu trạng thái) ở cả hai chế độ — đảm bảo mọi tương phản quân/gỗ đã đo không bị ảnh hưởng.
2. Phần **khung giao diện, thẻ card và sảnh chờ**:
   - Ở chế độ Kỳ Đài Cổ Phong: Sử dụng gam nâu trầm gỗ mun (`#120D0A`, `#241610`), viền đồng thau dập nổi (`#542C15`, `#C6922A`), chữ vàng ngà xuyến chỉ (`#FFF5DF`, `#E2CFB7`), mang lại chiều sâu không gian tĩnh tại.
3. Người dùng có thể tùy chọn trong Cài đặt hồ sơ (Kỳ Đài Cổ Phong / Giấy Sáng / Theo hệ thống), mặc định ưu tiên giao diện Kỳ Đài Cổ Phong.

| Token CSS | Sáng (Giấy Sáng) | Tối (Kỳ Đài Cổ Phong) | Tương phản ở chế độ tối |
|---|---|---|---|
| `--color-paper` | `#F5E8CC` | `#120D0A` | chữ 15,20 |
| `--color-surface` | `#FBF5E8` | `#241610` | chữ 13,85 |
| `--color-surface-sunken` | `#EDE0C4` | `#180F0A` | chữ 14,96 |
| `--color-ink` | `#28221C` | `#FFF5DF` | — |
| `--color-ink-muted` | `#5E5145` | `#C8B6A2` | /nền 8,45 · /surface 7,60 |
| `--color-border` | `#8C6A48` | `#542C15` | /nền 5,10 · /surface 4,75 |
| `--color-divider` | `#D9C7A3` | `#3D2012` | trang trí |
| `--color-focus` (ngoài bàn cờ) | `#155E75` | `#F5CA67` | /nền 9,20 · /surface 8,50 |
| `--color-success` | `#2E6B34` | `#86EFAC` | /nền 9,40 · /nền của nó 7,20 |
| `--color-warning` | `#8A4B00` | `#FCD34D` | /nền 9,15 · /nền của nó 7,05 |
| `--color-danger` | `#A51F25` | `#FCA5A5` | /nền 8,20 · /nền của nó 6,50 |
| `--color-info` | `#1F5A85` | `#93C5FD` | /nền 8,90 · /nền của nó 7,45 |
| `--color-success-bg` | `#E2EDD6` | `#152E1B` | chữ 11,20 |
| `--color-warning-bg` | `#F6E1B8` | `#3A240E` | chữ 11,40 |
| `--color-danger-bg` | `#F5DAD3` | `#3C1412` | chữ 12,15 |
| `--color-info-bg` | `#DCE7EF` | `#142236` | chữ 12,30 |
| `--color-btn-primary-bg` | `#704525` | `#C6922A` | chữ `#FFF` trên nó 6,80 |
| `--color-btn-primary-fg` | `#F5E8CC` | `#FFFFFF` | — |
| `--color-btn-danger-bg` | `#A51F25` | `#8E161C` | chữ `#FFF` trên nó 5,90 |
| `--color-btn-danger-fg` | `#F5E8CC` | `#FFFFFF` | — |

Viền tiêu điểm **trên bàn cờ** luôn dùng `#155E75` (3,54 trên gỗ) ở cả hai chế độ — token `--board-focus`.

### 2.4 Luật dùng màu

- **`DT-01` (chốt):** ⛔ Không truyền thông tin **chỉ bằng màu**. Mọi trạng thái có **chữ hoặc biểu tượng** đi kèm: đến lượt ⇒ viền + "Đến lượt bạn"; bị chiếu ⇒ "Đang bị chiếu" + biểu tượng; online ⇒ chấm + "Đang online"; đồng hồ sắp hết ⇒ số + biểu tượng cảnh báo.
- Chữ luôn ≥ **4,5:1** với nền của nó; chữ lớn (≥ 24 px, hoặc ≥ 18,66 px đậm) và thành phần UI/đồ hoạ ≥ **3:1** (`DEC-024`).
- Được dùng biến thể **trong suốt** của các màu cho nền phụ, nhưng phải đo lại chữ trên nền đó.
- ⛔ Không dùng mã màu trực tiếp trong CSS Module — chỉ `var(--color-*)` / `var(--board-*)` (TK01.3.1 kiểm bằng grep).
- ⛔ Không làm đỏ sáng hơn để phân biệt hai phe (đỏ/gỗ đang sát ngưỡng) — xem §7.3.

---

## 3. Chữ

### 3.1 Font

| Token CSS | Giá trị | Ghi chú |
|---|---|---|
| `--font-ui` | `"Plus Jakarta Sans", -apple-system, system-ui, "Segoe UI", Roboto, sans-serif` | **Chốt:** font giao diện tiếng Việt chuẩn có dấu, tự host hoặc dự phòng hệ thống |
| `--font-serif` | `"Playfair Display", Georgia, serif` | 🟡 Tiêu đề Kỳ Đài, banner chào mừng, tỷ số ván đấu |
| `--font-han` | `"XQ Han", "Noto Serif TC", "Songti TC", "SimSun", serif` | **Chốt:** font chữ Hán **tự host**, dự phòng serif. 🟡 Đề xuất dùng **Noto Serif TC** (giấy phép SIL OFL 1.1), cắt chỉ 16 ký tự cần dùng, đặt tên `XQ Han`, lưu file giấy phép cạnh font |
| `--font-mono` | `ui-monospace, "SF Mono", Consolas, monospace` | 🟡 Đồng hồ đếm ngược, mã phòng, mã lỗi, điểm Elo |

- **`DT-02` (chốt):** ⛔ Không tải font từ dịch vụ ngoài (Google Fonts…). Bản chạy local phải hoạt động **không cần mạng**.
- **`DT-03` (chốt):** Quân cờ chỉ dùng chữ Hán, **không** có tuỳ chọn chữ Việt.
- Trong Figma: mô phỏng font giao diện bằng **Inter** hoặc **Roboto**; ghi chú cho FE là `system-ui`.

### 3.2 Thang cỡ chữ — 🟡 (TK02.1.1)

| Token CSS | Cỡ / dòng | Độ đậm | Dùng cho |
|---|---|---|---|
| `--text-xs` | 12 / 16 px | 400 | Chú thích phụ, nhãn huy hiệu. ⛔ Không dùng cho nội dung chính |
| `--text-sm` | 14 / 20 px | 400 | Chữ phụ, tin nhắn chat, danh sách nước đi |
| `--text-md` | 16 / 24 px | 400 | **Chữ thân mặc định**, nút, ô nhập (≥ 16 px để iPhone không tự phóng to) |
| `--text-lg` | 20 / 28 px | 600 | Tiêu đề khung, tiêu đề hộp thoại |
| `--text-xl` | 24 / 32 px | 600 | Tiêu đề trang; từ cỡ này là "chữ lớn" (ngưỡng 3:1) |
| `--text-2xl` | 32 / 40 px | 600 | Đồng hồ ván, kết quả "Bạn thắng!" |

- Chỉ hai độ đậm: **400** và **600**.
- Số trên đồng hồ, bộ đếm, danh sách nước đi dùng `font-variant-numeric: tabular-nums` để số không nhảy.
- Chữ trên quân cờ: cỡ theo bàn (§7.2), ~0,5 × đường kính quân, `--font-han`, luôn đứng thẳng.

---

## 4. Khoảng cách, lưới, hình khối, chuyển động

### 4.1 Khoảng cách — **Chốt**

Chỉ dùng **4 · 8 · 12 · 16 · 24 · 32 px**: `--space-1` (4) · `--space-2` (8) · `--space-3` (12) · `--space-4` (16) · `--space-6` (24) · `--space-8` (32). ⛔ Không dùng 10, 15, 20 px.

Vùng chạm tối thiểu `--touch-min: 44px` cho nút, tab, ô nhập (`DT-07`).

### 4.2 Lưới và điểm ngắt

| Loại | Giá trị |
|---|---|
| Kích thước nghiệm thu (chốt) | **360×800 · 390×844 · 1366×768 · 1920×1080** |
| Lưới máy tính 🟡 | 12 cột, lề ngoài 32 px, khoảng cột 24 px |
| Lưới điện thoại 🟡 | 4 cột, lề 16 px, khoảng cột 16 px |
| Điểm ngắt 🟡 | `< 768 px` bố cục điện thoại (tab) · `768–1023 px` bố cục điện thoại, bàn giới hạn rộng 640 px · `≥ 1024 px` bố cục máy tính (cột phải) |
| Độ rộng nội dung tối đa 🟡 | 1280 px cho trang thường (sảnh, bạn bè, lịch sử); phòng chơi dùng hết chiều ngang |

Biến CSS không dùng được trong `@media` ⇒ ghi điểm ngắt thành hằng số trong một file (`apps/web/src/styles/breakpoints.ts` 🟡) và dùng lại, không gõ số rải rác.

### 4.3 Bo góc, viền, bóng — 🟡

| Token CSS | Giá trị | Dùng cho |
|---|---|---|
| `--radius-sm` | 4 px | Ô nhập, huy hiệu, nút nhỏ |
| `--radius-md` | 8 px | Nút, thẻ, toast |
| `--radius-lg` | 12 px | Hộp thoại, khung lớn |
| `--radius-full` | 999 px | Quân cờ, avatar, chấm trạng thái |
| `--border-width` | 1 px | Viền thường |
| `--focus-ring` | `3px solid var(--color-focus)`, cách 2 px | Chốt theo TK01.3.1 — `:focus-visible` |
| `--shadow-1` | `0 1px 2px rgba(40,34,28,.12)` | Thẻ, quân cờ nằm yên |
| `--shadow-2` | `0 4px 12px rgba(40,34,28,.18)` | Hộp thoại, menu thả, quân đang chọn (nâng nhẹ) |

Chế độ tối (Kỳ Đài Cổ Phong): bóng khó thấy ⇒ dùng viền `--color-border` thay cho `--shadow-2` ở hộp thoại.

### 4.4 Lớp chồng (z-index) — 🟡

| Token CSS | Giá trị | Lớp |
|---|---|---|
| `--z-sticky` | 100 | Thanh điều hướng, thanh đồng hồ dính (điện thoại) |
| `--z-dropdown` | 200 | Menu thả, gợi ý |
| `--z-banner` | 300 | Cảnh báo treo ván (**không modal**), khung đề nghị thu gọn |
| `--z-dialog` | 400 | Hộp thoại + lớp nền mờ |
| `--z-toast` | 500 | Toast |
| `--z-overlay-blocking` | 600 | Lớp phủ mất kết nối (không đóng được) |

### 4.5 Chuyển động

| Token CSS | Giá trị | Dùng cho |
|---|---|---|
| `--motion-move` | 180 ms, `ease-out` | **Chốt khoảng 150–200 ms:** quân trượt từ ô đi tới ô đến (ISSUE-083) |
| `--motion-fast` 🟡 | 120 ms | Hover, đổi trạng thái nút, hiện chấm đích |
| `--motion-base` 🟡 | 200 ms | Mở/đóng hộp thoại, toast, tab |

- ⭐ **Chốt:** `prefers-reduced-motion: reduce` ⇒ mọi chuyển động = 0; quân **nhảy thẳng**.
- Chuyển động **không chặn** thao tác tiếp theo; snapshot mới thay trạng thái, không xếp hàng chờ hiệu ứng cũ.
- ⛔ Không nhấp nháy, rung, lặp vô hạn (trừ biểu tượng "đang tải").

---

## 5. Biểu tượng

- Bộ **Lucide** (`lucide-react`, đã có trong tech-stack). Cỡ 16 (trong chữ), 20 (nút), 24 (thanh điều hướng); nét 2 px; màu theo chữ (`currentColor`).
- Biểu tượng **không bao giờ đứng một mình** mang nghĩa: có chữ bên cạnh, hoặc nút chỉ-icon có `aria-label` + tooltip.

| Nghĩa | Icon Lucide 🟡 |
|---|---|
| Lời mời (thanh điều hướng) | `bell` + huy hiệu số |
| Menu điện thoại | `menu` |
| Cảnh báo, đồng hồ < 30 giây, bị chiếu | `alert-triangle` |
| Lỗi | `circle-alert` |
| Thành công | `circle-check` |
| Thông tin | `info` |
| Đang tải | `loader-circle` (xoay) |
| Camera bật / tắt | `video` / `video-off` |
| Mic bật / tắt | `mic` / `mic-off` |
| Người xem | `eye` · danh sách người xem `users` |
| Đuổi người xem | `user-x` |
| Chat | `message-square` |
| Đồng hồ / không giới hạn | `timer` / `infinity` |
| Đầu hàng | `flag` |
| Xin hoà | `handshake` |
| Xin đi lại | `undo-2` |
| Lượt đang chạy | `play` (▶) |
| Sao chép mã/link | `copy` |
| Đổi bên | `arrow-left-right` |
| Đăng xuất | `log-out` |

---

## 6. Thành phần giao diện

Mọi thành phần phải có đủ trạng thái; mỗi màn phải có **5 trạng thái** (`SCR` §3, chốt): **Đang tải** (khung xương, không để trắng) · **Trống** (giải thích vì sao + gợi ý) · **Lỗi** (nói rõ + nút "Thử lại") · **Vô hiệu** (**phải giải thích vì sao**, `SCR-RULE-01`) · **Thành công**.

### 6.1 Nút

| Biến thể | Nền | Chữ | Viền | Dùng |
|---|---|---|---|---|
| Chính | `--color-btn-primary-bg` | `--color-btn-primary-fg` | — | Hành động chính của màn (một nút chính mỗi khu vực) |
| Phụ | `--color-surface` | `--color-ink` | `--color-border` | Hành động phụ, Huỷ |
| Nguy hiểm | `--color-btn-danger-bg` | `--color-btn-danger-fg` | — | Đầu hàng, Đuổi, Đăng xuất mọi thiết bị |
| Nhạt (ghost) | trong suốt | `--color-ink` | — | Hành động phụ trong thanh công cụ |

| Trạng thái | Quy tắc |
|---|---|
| Thường · hover | Hover: nền đậm/nhạt hơn ~8 % (đo lại chữ) |
| Focus | `:focus-visible` → `--focus-ring` |
| **Đang xử lý** | Vô hiệu + `loader-circle` + chữ **"Đang xử lý…"** — chặn bấm hai lần (`SCR-RULE-04`) |
| **Vô hiệu** | `aria-disabled="true"`, mờ 50 %, **luôn kèm dòng giải thích** bằng `--color-ink-muted` ngay dưới hoặc tooltip đọc được bằng bàn phím. Ví dụ: "Bạn chưa đi nước nào", "Đang chờ trả lời đề nghị trước", "Ván đã kết thúc" |

Kích thước: cao ≥ 44 px, đệm ngang 16 px, chữ `--text-md` 600, bo `--radius-md`.

### 6.2 Ô nhập, checkbox, radio, công tắc

- Ô nhập: nền `--color-surface-sunken`, viền `--color-border`, cao ≥ 44 px, **nhãn chữ luôn hiện** (không chỉ placeholder).
- Lỗi: viền `--color-danger` **+ biểu tượng `circle-alert` + câu lỗi tiếng Việt** dưới ô, nói cách sửa (`DT-10`). Giữ dữ liệu người dùng đã nhập (trừ mật khẩu).
- Ô có giới hạn độ dài: đếm ký tự "12/40".
- Checkbox / radio / công tắc: luôn có nhãn chữ; trạng thái bật/tắt không chỉ bằng màu (dấu ✓, vị trí nút gạt).

### 6.3 Hộp thoại và xác nhận

| Loại | Quy tắc |
|---|---|
| Hộp thoại thường | Đóng được bằng **X**, `Esc`, bấm ra ngoài (`SCR-RULE-02`); focus bị giữ trong hộp; đóng xong trả focus về nút đã mở |
| Không đóng tuỳ ý | `SCR-VERIFY-NOTICE`, `SCR-ONBOARDING`, `SCR-RECONNECTING` — không X; `SCR-INACTIVITY-PROMPT` **không phải modal** (§6.8) |
| Xác nhận nguy hiểm | Tiêu đề câu hỏi · dòng **hậu quả in đậm** · [Huỷ] bên trái, nút nguy hiểm bên phải · **focus mặc định ở Huỷ** (`SCR-RULE-03`) |

Câu bắt buộc (chốt, `SCR` §6):

| Hành động | Câu |
|---|---|
| Đầu hàng | "Bạn sẽ **thua** ván này ngay lập tức." |
| Rời phòng khi đang chơi | "Rời lúc này được tính là **đầu hàng**." |
| Đuổi người xem | "Người này sẽ **không vào lại được** phòng này." |
| Đổi mã xem | "**Toàn bộ** người xem hiện tại sẽ bị đưa ra." |
| Đổi sang chế độ kín hơn | "**Toàn bộ** người xem sẽ bị đưa ra." |
| Đăng xuất mọi thiết bị | "Camera/mic đang bật sẽ bị dừng." |

### 6.4 Toast (thư viện `sonner`)

- Vị trí **trên giữa**; ⛔ không bao giờ che nút Đầu hàng (`SCR-RULE-05`).
- 3 loại: thành công · lỗi · thông tin — nền `--color-*-bg`, biểu tượng + chữ.
- Tự ẩn sau 4 giây 🟡; lỗi cần thao tác thì **không** tự ẩn và có nút hành động. `role="status"` (thông tin) / `role="alert"` (lỗi).

### 6.5 Tab, huy hiệu, khung xương, trạng thái trống

- **Tab:** gạch dưới 3 px `--color-wood-edge` + chữ đậm cho tab đang chọn (không chỉ đổi màu); điều khiển bằng mũi tên trái/phải.
- **Huy hiệu số** (lời mời): ẩn khi 0 · "1"–"9" · "9+"; nền `--color-danger`, chữ `--color-surface`; kèm `aria-label` "3 lời mời mới".
- **Khung xương:** dạng dòng · dạng thẻ · dạng bàn cờ; màu `--color-surface-sunken`, hiệu ứng nhấp nháy nhẹ tắt khi giảm chuyển động.
- **Trống / lỗi:** biểu tượng hoặc minh hoạ nhỏ + câu giải thích + nút hành động ("Tạo phòng", "Thử lại").

### 6.6 Đồng hồ và dòng lượt

- Định dạng `mm:ss`, `--text-2xl` ở máy tính, `--text-lg` trên thanh dính điện thoại, số `tabular-nums`.
- Bên đang chạy: ▶ (`play`) **và** chữ. Dưới **30 giây**: `alert-triangle` + số màu `--color-warning` (chốt TK02.3.1 — không chỉ đổi màu). Ván không giới hạn: "∞ Không giới hạn".
- Dòng lượt: "Đến lượt bạn" · "Đang chờ đối thủ" · "Đang bị chiếu" (+ biểu tượng) · người xem: "Lượt: Đỏ" / "Lượt: Đen".

### 6.7 Danh sách nước đi, khung đề nghị

- Nước mới nhất: đậm **+ dấu ▸** (không chỉ màu); tự cuộn tới nước mới.
- Khung đề nghị hoà/đi lại **không chặn bàn cờ**: người nhận [Từ chối] [Đồng ý] + "Còn 00:23"; người gửi "Đang chờ đối thủ trả lời…" + [Rút đề nghị]; người xem chỉ đọc. X chỉ **thu gọn**, hạn vẫn chạy (`SCR-RULE-06`).

### 6.8 Cảnh báo treo ván, mất kết nối, kết quả

- **Cảnh báo treo ván** (`SCR-RULE-07`): vùng cảnh báo **không modal** (`--z-banner`), nền `--color-warning-bg`, không che bàn và nút Đầu hàng, **không có X**, không bẫy focus; "Bạn còn trong ván đấu không?" + nút **"Tôi còn đây"** + đếm ngược. Trình đọc màn hình **không** đọc từng giây.
- **Mất kết nối:** lớp phủ `--z-overlay-blocking`, "Đang kết nối lại…" + thời gian giữ ván theo máy chủ; đối thủ thấy "Đối thủ mất kết nối — còn 00:45".
- **Kết quả:** "🏆 Bạn thắng!" · "Bạn thua" · "Hoà" · "Ván bị gián đoạn — không có người thắng" (người xem: "Đỏ thắng"…), lý do bằng chữ, "Phòng đóng sau mm:ss", [Xem lại] [Tái đấu] [Rời phòng].

### 6.9 Chat và camera/mic

- Người chơi thấy **2 khung** có nhãn **"Kênh riêng người chơi"** và **"Kênh chung"** (công tắc Ẩn/Hiện kênh chung); người xem thấy 1 khung. Kênh chung luôn có dòng "ℹ️ Người chơi cũng đọc và gửi được ở kênh này"; tin của người chơi có huy hiệu "Người chơi · Đỏ/Đen".
- Trạng thái tin: đang gửi · đã gửi · gửi lỗi + "Thử lại".
- Camera/mic: mỗi thiết bị một điều khiển 3 mức **Tắt · Chỉ đối thủ · Đối thủ và người xem** (mặc định Tắt); trạng thái tách rõ: xin quyền · đang kết nối · đang áp dụng · đã áp dụng · bị từ chối · lỗi. Ghi chú "Chỉ trực tiếp — không ghi âm, không ghi hình".

---

## 7. Bàn cờ

### 7.1 Hệ toạ độ (chốt, xem [AGENTS.md §4](AGENTS.md))

Đen ở trên (`y = 0`), Đỏ ở dưới (`y = 9`). Người cầm Đen thấy bàn **lật 180°** — **chỉ hiển thị**; toạ độ gửi máy chủ không đổi (`DT-18`, `GR-COORD-01`).

### 7.2 Hình học — theo `g` = khoảng cách hai giao điểm

| Đại lượng | Giá trị |
|---|---|
| Giao điểm | 9 × 10 = **90**; quân đặt **tại giao điểm** (`DT-17`) |
| Tỉ lệ khung | rộng 8g + 2 lề : cao 9g + 2 lề (≈ 9 : 10) |
| Lề bàn 🟡 | ~0,6 g |
| Bán kính quân | ~0,44 g |
| Đường kẻ 🟡 | ~0,03 g, tối thiểu 1 px, màu `--color-wood-edge` |
| Sông | giữa hàng 5 và 6 (tính từ trên): **楚河** (trái) · **漢界** (phải), đọc thuận chiều ở cả hai hướng |
| Cung | 3×3, hai đường chéo; dấu chữ thập nhỏ ở vị trí ban đầu của Pháo và Tốt |
| Mặt gỗ | `--color-wood`, dải màu nhẹ được phép, ⛔ không dùng ảnh gỗ |

Vẽ bằng **SVG** co giãn theo khung chứa; bàn giữ đúng tỉ lệ, không méo.

### 7.3 Quân cờ và phân biệt hai phe

| Loại | Đỏ | Đen | Tên tiếng Việt |
|---|---|---|---|
| Tướng | 帥 | 將 | Tướng |
| Sĩ | 仕 | 士 | Sĩ |
| Tượng | 相 | 象 | Tượng |
| Mã | 傌 | 馬 | Mã |
| Xe | 俥 | 車 | Xe |
| Pháo | 炮 | 砲 | Pháo |
| Tốt | 兵 | 卒 | Tốt |

- Quân: hình tròn, nền `--board-piece-face`, chữ màu phe (`--color-red` / `--color-black`), **chữ luôn đứng thẳng** kể cả khi lật bàn, bóng `--shadow-1`.
- ⭐ **`DT-21` (chốt):** hai phe phải phân biệt được **không cần màu và không cần đọc chữ** (ba cặp 仕/士, 傌/馬, 俥/車 gần giống nhau).
  🟡 Đề xuất: quân **Đỏ viền một nét liền**, quân **Đen viền hai nét** (hai vòng đồng tâm), viền cùng màu phe. Phải kiểm bằng giả lập **Achromatopsia, Protanopia, Deuteranopia** (`TS-UI-13`).

### 7.4 Trạng thái trên bàn — mỗi trạng thái có **dấu hình dạng**

| Trạng thái | Thể hiện |
|---|---|
| Quân đang chọn | Vòng `--board-select` 3 px quanh quân + nâng nhẹ (`--shadow-2`) |
| Đích hợp lệ (ô trống) | Chấm tròn `--board-hint`, đường kính ~0,25 g |
| Đích hợp lệ (ăn quân) | Vòng `--board-hint` quanh quân địch |
| Nước vừa đi | 4 góc vuông `--board-last-move` ở **ô đi và ô đến** (`DT-19`) |
| Bị chiếu | Vòng `--board-check` quanh Tướng **+** dòng "Đang bị chiếu" + `alert-triangle` ngoài bàn |
| Con trỏ bàn phím | Viền `--board-focus` quanh giao điểm đang trỏ, luôn thấy (`DT-09`) |
| Đang gửi nước | Quân ở vị trí mới mờ 60 % + chỉ báo nhỏ; chưa coi là đã đi |
| Chỉ đọc (người xem, ván kết thúc, xem lại) | Không hover, con trỏ chuột mặc định |

### 7.5 Thao tác và trợ năng

- Thao tác chính **chạm quân → chạm đích**; kéo thả tuỳ chọn (`DT-16`).
- Bàn phím (`DT-06`): mũi tên di chuyển con trỏ · `Enter`/`Space` chọn và xác nhận · `Esc` bỏ chọn.
- Nhãn đọc (`DT-04`): *"<Tên quân> <màu>, cột <x+1> hàng <y+1>"* theo **toạ độ gốc**, không đổi khi lật bàn — ví dụ Mã đỏ ở `(1,9)` ⇒ "Mã đỏ, cột 2 hàng 10"; giao điểm trống 🟡 "Trống, cột 5 hàng 6" (TK02.1.2 §5.9).
- Chú giải quân (`DT-05`): 14 chữ Hán + tên tiếng Việt.
- Ở 360 px (`DT-08`): bàn full chiều ngang, giao điểm < 44 px ⇒ dấu chọn/đích to rõ, không phụ thuộc kéo thả.

---

## 8. Bố cục trang

### 8.1 Máy tính (≥ 1024 px)

```
┌──────────────────────────────────────────────────────────┐
│ Cờ Tướng Online   Sảnh  Xếp hạng  Bạn bè  Lịch sử   [Hồ sơ ▾] │
├──────────────────────────────────────────────────────────┤
│  📹 Camera Đỏ     📹 Camera Đen    ← hàng riêng, KHÔNG đè bàn │
├────────────────────────────────┬─────────────────────────┤
│                                │ Lượt · Đồng hồ          │
│           BÀN CỜ               ├─────────────────────────┤
│         (trung tâm)            │ Lịch sử nước đi         │
│                                ├─────────────────────────┤
│  [Hệ tọa độ GR-COORD 9x10]     │ 💬 Chat (Kênh Riêng/Chung)│
│                                ├─────────────────────────┤
│                                │ 👥 Người xem (Tối đa 2–5)│
├────────────────────────────────┴─────────────────────────┤
│ [Đầu hàng]  [Xin hoà]  [Xin đi lại*]                     │
└──────────────────────────────────────────────────────────┘
```

**Quy tắc động thích ứng theo Chế độ chơi (Chốt, `BA-SCOPE`):**
- **Ván Đánh Thường (Casual):** Hiển thị đầy đủ nút `[Xin đi lại]` (tối đa 3 lần) và `[Panel Người xem]` (mặc định tối đa 2 khán giả, có thể cấu hình trần 5 người theo `BR-ROOM-01`).
- **Ván Đánh Xếp Hạng (Ranked Elo FIDE):** 
  - ⛔ **ẨN HOÀN TOÀN** nút `[Xin đi lại]` (Cấm Undo 100%).
  - ⛔ **ẨN HOÀN TOÀN** khu vực `[Người xem]` (Cấm khán giả 100% để chống phím cờ).
  - Cố định 10 phút Rapid mỗi bên.

Cột phải 🟡 320–360 px; bàn cờ chiếm phần còn lại, cao tối đa vừa màn hình (không phải cuộn để thấy cả bàn ở 1366×768).

### 8.2 Điện thoại (< 768 px)

```
┌──────────────────────┐
│ ☰  Tên phòng     🔔2 │
├──────────────────────┤
│ ⚫ Đối thủ     07:42 │ ← thanh DÍNH 2 dòng
│ 🔴 Bạn      ▶ 06:15 │
├──────────────────────┤
│       BÀN CỜ         │ ← full chiều ngang
├──────────────────────┤
│ [Ván] [Chat] [Camera]│ ← tab, không hiện cùng lúc
├──────────────────────┤
│ [Đầu hàng][Hoà][Lại] │ ← cố định dưới cùng
└──────────────────────┘
```

`DT-11` bàn full ngang · `DT-12` chat/camera ở tab riêng · `DT-13` lượt + đồng hồ dính · `DT-14` bàn phím ảo không gây cuộn ngang · `DT-15` không tràn ngang ở mọi cỡ.

### 8.3 Năm quy tắc bố cục không được phá (chốt, `DT` §8)

1. Camera/mic **không bao giờ đè** bàn cờ.
2. Thông báo tạm **không che** nút Đầu hàng.
3. Nhãn khung chat **ghi rõ** kênh (riêng người chơi / chung).
4. Đồng hồ **luôn nhìn thấy** khi ván đang diễn ra.
5. Ở 360 px **không có cuộn ngang**.

### 8.4 Trang thường (sảnh, bạn bè, lịch sử, cài đặt)

Thanh điều hướng trên cùng; nội dung giữa trang rộng tối đa 1280 px 🟡; danh sách dạng thẻ hoặc bảng đơn giản; trên điện thoại xếp một cột, menu ☰ mở ngăn kéo.

---

## 9. Nội dung và giọng văn

- Toàn bộ giao diện **tiếng Việt**, kể cả lỗi và nhãn trợ năng (`DT` §11).
- Câu ngắn, xưng "bạn", nói **việc cần làm tiếp**. Lỗi theo mẫu *điều gì xảy ra + cách sửa*: "Mã phòng không đúng. Kiểm tra lại 8 ký tự rồi thử lại."
- ⛔ Không lộ chi tiết kỹ thuật (mã HTTP, stack), không tiết lộ dữ liệu vượt quyền (ví dụ "email đã tồn tại" ở màn quên mật khẩu).
- Thuật ngữ theo [glossary](docs/00-overview/glossary.md): **người chơi**, **người xem**, **chủ phòng**, **máy** — ⛔ không "viewer", "bot", "owner".
- Thời gian: `mm:ss` cho đồng hồ và đếm ngược; ngày giờ dạng `27/09/2026 14:05`.
- Các câu đã chốt trong `SCR` (§6.3) và TK02.x phải dùng **đúng chữ**.

---

## 10. Trợ năng — tóm tắt kiểm

- [ ] Tương phản đạt §2 (chữ ≥ 4,5; chữ lớn/UI ≥ 3) ở **cả hai chế độ** nếu làm chế độ tối
- [ ] Không thông tin nào chỉ bằng màu (`DT-01`); hai phe phân biệt ở giả lập mù màu (`DT-21`)
- [ ] Toàn bộ dùng được bằng bàn phím; viền tiêu điểm luôn thấy (`DT-06`, `DT-09`)
- [ ] Vùng chạm ≥ 44 px (`DT-07`); 360 px không cuộn ngang
- [ ] Mọi nút chỉ-icon có `aria-label`; mọi ô nhập có nhãn
- [ ] Vô hiệu luôn có giải thích (`SCR-RULE-01`)
- [ ] `prefers-reduced-motion` tắt chuyển động
- [ ] Đếm ngược không đọc từng giây; thông báo quan trọng qua `aria-live`
- [ ] Kiểm chi tiết: [TK16.2.2](Jira/task/TK16.2.2-tro-nang-wcag-aa-tren-toan-bo-ung-dung.md), [TK16.2.5](Jira/task/TK16.2.5-kiem-thu-tro-nang-va-5-trang-thai-36-man.md)

---

## 11. Quy trình Figma (người thiết kế)

### 11.1 Cấu trúc file

| Trang Figma | Nội dung bao phủ các màn hình | Task |
|---|---|---|
| `00 · Design system` | Color/Text styles, token hoàng kim + gỗ mun, thành phần + mọi trạng thái | TK02.1.1 |
| `01 · Bàn giao token` | Bảng tên token CSS → giá trị (khớp §12, hỗ trợ 2 theme Sáng/Tối) | TK02.1.1 |
| `02 · Bàn cờ` | Bàn SVG 3 cỡ × 2 hướng, quân chữ Hán, trạng thái §7.4 (GR-COORD) | TK02.1.2 |
| `10 · Tài khoản & Auth` | `SCR-LOGIN`, `MODAL-GUEST-NAME`, `SCR-REGISTER` (3 bước), `SCR-FORGOT-PASSWORD`, `SCR-RESET-PASSWORD`, `SCR-ONBOARDING`, `SCR-PROFILE-SETTINGS`, `MODAL-OTP-USERNAME` | TK02.2.1 |
| `11 · Sảnh & Ghép trận` | `SCR-LOBBY` (3 chế độ), `MODAL-CREATE-ROOM`, `MODAL-MATCHMAKING` (radar Elo), `MODAL-AI-SETUP`, `SCR-WAITING-ROOM`, `MODAL-INVITE`, `MODAL-SIDE-SWAP-PROMPT` | TK02.2.2 |
| `12 · Phòng thi đấu` | `SCR-GAME-ROOM` (Casual vs Ranked), đồng hồ, đề nghị hòa/undo, cờ treo, mất kết nối, `MODAL-MATCH-RESULT`, `SCR-ACCESS-DENIED` | TK02.3.1 |
| `13 · Chat & LiveKit` | `PANEL-MEDIA` (Cam/Mic 2 kỳ thủ), `PANEL-CHAT` (Tab Riêng/Chung, 12 sticker, lọc ***), `PANEL-SPECTATORS` (Kick người xem) | TK02.3.2 |
| `14 · Xếp hạng & Xã hội` | `SCR-LEADERBOARD` (Top 50 + Sticky User Row), `SCR-FRIENDS`, `MODAL-DIRECT-CHAT` (chat 1-1 bạn bè) | TK02.4.1 |
| `15 · Đấu máy & Lịch sử` | `SCR-AI-GAME` (3 cấp độ, undo tức thì), `SCR-HISTORY`, `SCR-REPLAY` (bảng nước đi, xuất FEN/PGN) | TK02.4.2 |

### 11.2 Quy ước

- Color style đặt **đúng tên token** bỏ tiền tố: `paper`, `wood`, `ink-muted`, `board/select`… để FE chép thẳng.
- Text style: `text/md`, `text/lg`…; khoảng cách bằng **Auto layout** với giá trị thuộc thang §4.1.
- Component đặt tên `Button / Primary / Loading`; variant theo trạng thái.
- Mỗi màn vẽ ở **4 kích thước nghiệm thu** và đủ **5 trạng thái**; hộp thoại vẽ theo **3 góc nhìn** khi khác nhau (người chơi đến lượt, đối thủ, người xem).
- Ghi chú trực tiếp trên frame: câu chữ bắt buộc, hành vi đóng/mở, chuyển động.

### 11.3 Tự kiểm trước khi chuyển Ready for Test

- [ ] 7 màu gốc đúng từng ký tự; màu 🟡 mới đã đo (WebAIM Contrast Checker) và ghi số cạnh style
- [ ] Mọi khoảng cách ∈ {4, 8, 12, 16, 24, 32}; mọi vùng chạm ≥ 44 px
- [ ] Mọi biến thể vô hiệu có câu giải thích
- [ ] Bàn cờ xuất PNG, kiểm 3 giả lập mù màu
- [ ] Comment Jira: link Figma (quyền xem cho cả nhóm) + PNG + bảng token (xem [sổ tay kiểm thử §13](Jira/04-HUONG-DAN-KIEM-THU.md))

Đổi giá trị 🟡 trong Figma ⇒ sửa §2–§4 và §12 của file này trong cùng lúc, báo Frontend.

---

## 12. `tokens.css` tham chiếu

Frontend chép vào `apps/web/src/styles/tokens.css` (TK01.3.1). Hỗ trợ song song cả 2 giao diện Sáng (Giấy Xuyến Chỉ) và Tối (Kỳ Đài Cổ Phong).

```css
:root {
  /* 7 màu gốc — CHỐT, không đổi */
  --color-paper: #F5E8CC;
  --color-wood: #D8AE72;
  --color-wood-edge: #704525;
  --color-ink: #28221C;
  --color-red: #A51F25;
  --color-black: #24201C;
  --color-focus: #155E75;

  /* Bổ sung hoàng kim cổ phong & UI 🟡 */
  --color-gold: #C6922A;
  --color-gold-light: #F5CA67;
  --color-gold-dark: #7A4E0F;
  --color-surface: #FBF5E8;
  --color-surface-sunken: #EDE0C4;
  --color-ink-muted: #5E5145;
  --color-border: #8C6A48;
  --color-divider: #D9C7A3;
  --color-success: #2E6B34;
  --color-warning: #8A4B00;
  --color-danger: #A51F25;
  --color-info: #1F5A85;
  --color-success-bg: #E2EDD6;
  --color-warning-bg: #F6E1B8;
  --color-danger-bg: #F5DAD3;
  --color-info-bg: #DCE7EF;
  --color-btn-primary-bg: #704525;
  --color-btn-primary-fg: #F5E8CC;
  --color-btn-danger-bg: #A51F25;
  --color-btn-danger-fg: #F5E8CC;

  /* Bàn cờ 🟡 — giống nhau ở mọi chế độ */
  --board-piece-face: #F6E7C8;
  --board-select: #1E6B3A;
  --board-hint: #3A2A1A;
  --board-last-move: #1E4F7A;
  --board-check: #A51F25;
  --board-focus: #155E75;

  /* Chữ */
  --font-ui: "Plus Jakarta Sans", -apple-system, system-ui, "Segoe UI", Roboto, sans-serif;
  --font-serif: "Playfair Display", Georgia, serif;
  --font-han: "XQ Han", "Noto Serif TC", "Songti TC", "SimSun", serif;
  --font-mono: ui-monospace, "SF Mono", Consolas, monospace;
  --text-xs: 12px;  --leading-xs: 16px;
  --text-sm: 14px;  --leading-sm: 20px;
  --text-md: 16px;  --leading-md: 24px;
  --text-lg: 20px;  --leading-lg: 28px;
  --text-xl: 24px;  --leading-xl: 32px;
  --text-2xl: 32px; --leading-2xl: 40px;
  --weight-regular: 400;
  --weight-semibold: 600;

  /* Khoảng cách — CHỐT */
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-6: 24px; --space-8: 32px;
  --touch-min: 44px;

  /* Hình khối 🟡 */
  --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px; --radius-full: 999px;
  --border-width: 1px;
  --shadow-1: 0 1px 2px rgba(40, 34, 28, .12);
  --shadow-2: 0 4px 12px rgba(40, 34, 28, .18);

  /* Lớp chồng 🟡 */
  --z-sticky: 100; --z-dropdown: 200; --z-banner: 300; --z-dialog: 400; --z-toast: 500; --z-overlay-blocking: 600;

  /* Chuyển động */
  --motion-move: 180ms;  /* CHỐT khoảng 150–200 ms */
  --motion-fast: 120ms;
  --motion-base: 200ms;
  --ease-out: cubic-bezier(.2, .8, .2, 1);
}

@media (prefers-reduced-motion: reduce) {
  :root { --motion-move: 0ms; --motion-fast: 0ms; --motion-base: 0ms; }
}

:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 2px; }
body { margin: 0; background: var(--color-paper); color: var(--color-ink); font-family: var(--font-ui); font-size: var(--text-md); line-height: var(--leading-md); }

/* ===== Chế độ tối (Kỳ Đài Cổ Phong) — Đã Chốt chuẩn giao diện ===== */
:root[data-theme="dark"] {
  --color-paper: #120D0A;
  --color-surface: #241610;
  --color-surface-sunken: #180F0A;
  --color-ink: #FFF5DF;
  --color-ink-muted: #C8B6A2;
  --color-border: #542C15;
  --color-divider: #3D2012;
  --color-focus: #F5CA67;
  --color-success: #86EFAC;
  --color-warning: #FCD34D;
  --color-danger: #FCA5A5;
  --color-info: #93C5FD;
  --color-success-bg: #152E1B;
  --color-warning-bg: #3A240E;
  --color-danger-bg: #3C1412;
  --color-info-bg: #142236;
  --color-btn-primary-bg: #C6922A;
  --color-btn-primary-fg: #FFFFFF;
  --color-btn-danger-bg: #8E161C;
  --color-btn-danger-fg: #FFFFFF;
  /* --color-wood, --color-wood-edge, --color-red, --color-black, --board-* giữ nguyên */
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-paper: #120D0A;
    --color-surface: #241610;
    --color-surface-sunken: #180F0A;
    --color-ink: #FFF5DF;
    --color-ink-muted: #C8B6A2;
    --color-border: #542C15;
    --color-divider: #3D2012;
    --color-focus: #F5CA67;
    --color-success: #86EFAC;
    --color-warning: #FCD34D;
    --color-danger: #FCA5A5;
    --color-info: #93C5FD;
    --color-success-bg: #152E1B;
    --color-warning-bg: #3A240E;
    --color-danger-bg: #3C1412;
    --color-info-bg: #142236;
    --color-btn-primary-bg: #C6922A;
    --color-btn-primary-fg: #FFFFFF;
    --color-btn-danger-bg: #8E161C;
    --color-btn-danger-fg: #FFFFFF;
  }
}
```

---

## 13. Hướng dẫn cho AI agent khi dựng giao diện

1. Đọc §1–§9 của file này, đối chiếu chi tiết với [DANH-MUC-MAN-HINH-XIANGQI.md](DANH-MUC-MAN-HINH-XIANGQI.md) (đủ 37 thành phần và 5 trạng thái bắt buộc), và file Task FE/DS đang làm.
2. **Chỉ dùng token** (`var(--…)`); ⛔ không mã màu, không số px ngoài thang, không font ngoài `--font-ui` / `--font-han`.
3. Dựng **đủ 5 trạng thái** của màn và mọi trạng thái của thành phần; vô hiệu luôn có câu giải thích.
4. Dùng câu chữ đã chốt nguyên văn; không tự đặt câu cho các hộp xác nhận ở §6.3.
5. Không thêm thư viện giao diện dựng sẵn hay Tailwind (`AGENTS.md §14`); icon chỉ từ `lucide-react`, toast chỉ từ `sonner`.
6. Kiểm trước khi mở PR: 4 kích thước (360, 390, 1366, 1920) không cuộn ngang; điều hướng hết bằng bàn phím; bật giảm chuyển động; giả lập mù màu cho bàn cờ.
7. Cần giá trị chưa có trong file này ⇒ **hỏi** hoặc đề xuất 🟡 (kèm tỉ lệ tương phản đã tính) và cập nhật file này trong cùng PR — ⛔ không tự đặt giá trị rồi dùng lặng lẽ.
8. Áp dụng chuẩn Theme Kỳ Đài Cổ Phong (Dark Tea-Room) theo định hướng thẩm mỹ Á Đông cao cấp, đảm bảo tương phản WCAG 2.1 AA.
