# BÁO CÁO KIỂM ĐỊNH — TRANG TÀI LIỆU

**Ngày:** 2026-09-21 · **Đối tượng:** `site/` · **Môi trường:** Chromium, server `127.0.0.1:8777`

> ⚠ **Ghi chú về cách làm.** Kế hoạch ban đầu là giao cho 3 subagent (phân tích nội dung · review mã · QC chức năng).
> **Agent review mã và agent QC chết giữa chừng** vì chạm giới hạn phiên, chưa kịp ghi kết quả nào.
> Agent phân tích nội dung **kịp hoàn thành** — sản phẩm là [SYNTAX-REPORT.md](SYNTAX-REPORT.md) và `inventory.json`.
> Toàn bộ phần review và QC dưới đây **do tôi tự chạy lại**, không phải kết quả của agent.

---

## 1. KẾT QUẢ TỔNG

| Nhóm | Đạt | Không đạt | Ghi chú |
|---|---|---|---|
| Render tài liệu | 199/199 | 0 | 0 ngoại lệ, 757 bảng, 270 khối mã |
| Liên kết nội bộ | ✓ | 0 | 0 liên kết chết sau khi sửa |
| Lộ trình 6 vai trò | 6/6 | 0 | 0 liên kết hỏng trong mọi bước |
| Tìm kiếm | ✓ | 0 | Có dấu và không dấu ra kết quả **giống hệt** |
| Điện thoại (375 px) | ✓ | 0 | Không trang nào tràn ngang |
| Tương phản WCAG AA | ✓ | 0 | Sau khi sửa 4 cặp màu |

**Đã tìm và sửa 5 lỗi thật.** Chi tiết ở §4.

---

## 2. KIỂM THỬ CHỨC NĂNG

### A. Trang chủ
| Mã | Kiểm | Kết quả |
|---|---|---|
| A1 | Trang tải, console sạch | ✅ |
| A2 | 7 ô thống kê · 6 thẻ vai trò · 11 thẻ chủ đề · ô "Hai cổng chặn" | ✅ |
| A3 | Thanh bên 12 nhóm, mỗi nhóm có số lượng | ✅ |

### B. Đọc tài liệu
| Mã | Kiểm | Kết quả |
|---|---|---|
| B1 | `game-rules.md` — 13 bảng, 1 khối mã | ✅ |
| B2 | **Sơ đồ bàn cờ ASCII nguyên vẹn** — có đủ `y=0`…`y=9`, `楚 河`, `漢 界` | ✅ |
| B3 | `white-space: pre` trên khối mã — sơ đồ không bị bẻ dòng | ✅ |
| B4 | Mục lục phải: 27 mục, tự sáng theo vị trí cuộn | ✅ |
| B5 | Link `.md` trong nội dung → điều hướng trong trang, không tải lại | ✅ |
| B6 | **Tài liệu 8 H1** (`open-questions.md`) — mục lục đủ 18 mục | ✅ *(sau khi sửa — xem L3)* |
| B7 | Nút "Đánh dấu đã đọc" ghi vào `localStorage`, giữ sau F5 | ✅ |

### C. Lộ trình theo vai trò
| Vai trò | Số bước | Thanh tiến độ | Link hỏng |
|---|---|---|---|
| frontend | 10 | ✅ | 0 |
| backend | 13 | ✅ | 0 |
| qa | 11 | ✅ | 0 |
| pm | 10 | ✅ | 0 |
| devops | 9 | ✅ | 0 |
| agent | 6 | ✅ | 0 |

### D. Tìm kiếm
| Từ khoá | Có dấu | Không dấu | Kết quả đầu |
|---|---|---|---|
| hết nước / het nuoc | 19 | **19** | ISSUE-024 — Kết thúc ván |
| người xem / nguoi xem | 40 | **40** | REQ-SPECTATOR |
| toạ độ / toa do | — | **26** | ISSUE-007 — Hệ toạ độ |

| Mã định danh | Kết quả | Đầu tiên |
|---|---|---|
| `DEC-019` | 3 | ONBOARDING |
| `ISSUE-032` | 7 | ISSUE-032 — Cổng đo AI |
| `TECH-07` | 14 | AGENTS.md |

- Chuỗi vô nghĩa `zzzqqq` → 0 kết quả, thông báo rõ, **không lỗi** ✅
- <kbd>↑</kbd><kbd>↓</kbd><kbd>Enter</kbd><kbd>Esc</kbd> hoạt động ✅

### E. Thư mục & lưu trữ
| Mã | Kiểm | Kết quả |
|---|---|---|
| E1 | `#/dir/docs/03-screens` liệt kê đúng 2 file | ✅ |
| E2 | Kho lưu trữ 102 file tải theo yêu cầu | ✅ |
| E4 | Link trỏ tới thư mục → trang liệt kê, không báo lỗi | ✅ *(sau khi sửa — xem L2)* |

### F. Giao diện & thiết bị
| Mã | Kiểm | Kết quả |
|---|---|---|
| F1 | Đổi nền sáng/tối, giữ sau khi tải lại | ✅ |
| F2 | Khổ 375 px — thanh bên ẩn, nút ☰ hiện | ✅ |
| F3 | ☰ mở thanh bên, bấm ra ngoài đóng | ✅ |
| F4 | **Không tràn ngang** ở 375 px trên 5 loại trang khác nhau | ✅ |

`scrollWidth` = `innerWidth` = 375 px trên: trang nhiều bảng · trang sơ đồ ASCII · trang bàn cờ · trang chủ · lộ trình.

---

## 3. HIỆU NĂNG (đo thật)

| Chỉ số | Giá trị |
|---|---|
| Dựng chỉ mục tìm kiếm (một lần duy nhất) | **25 ms** |
| **Mỗi lần gõ phím** | **0,5 ms** |
| Bộ nhớ chỉ mục thêm vào | 0,92 MB |
| Dữ liệu nhúng | 1,08 MB (199 tài liệu) |
| Kho lưu trữ | 0,93 MB — **chỉ tải khi mở** |

---

## 4. LỖI ĐÃ TÌM VÀ SỬA

| # | Lỗi | Mức | Cách sửa |
|---|---|---|---|
| **L1** | Tiêu đề tài liệu còn sót dấu markdown (`` LUẬT CỜ — BỘ LUẬT `xiangqi-simple-v1` ``) | Nhỏ | `build.mjs` bỏ `` ` `` và `*` khi trích tiêu đề |
| **L2** | **37 liên kết trỏ tới thư mục** bị đánh dấu chết, bấm không đi đâu | Trung bình | Thêm tuyến `#/dir/<path>` — trang liệt kê tài liệu trong thư mục |
| **L3** | Tài liệu có **nhiều H1** (`open-questions.md` có 8) bị **thiếu mục lục** — chỉ lấy H2/H3 | Trung bình | Khi tài liệu có >1 H1 thì mục lục gồm cả H1 |
| **L4** | **4 cặp màu không đạt WCAG AA** | Trung bình | Xem bảng §5 |
| **L5** | Rãnh thanh tiến độ ở 0% trông như **đã đầy** (màu quá đậm) | Nhỏ | Đổi sang nền nhạt + viền mảnh |

---

## 5. TƯƠNG PHẢN MÀU — TRƯỚC VÀ SAU

| Cặp | Chế độ | Trước | Sau | Cần |
|---|---|---|---|---|
| Chữ mờ trên nền | Sáng | 3,50 ✗ | **4,52 ✓** | 4,5 |
| Chữ mờ trên thẻ | Sáng | 3,81 ✗ | **4,73 ✓** | 4,5 |
| Chữ mờ trên thẻ | Tối | 4,39 ✗ | **4,54 ✓** | 4,5 |
| Chữ vàng trên nền vàng nhạt | Sáng | 4,16 ✗ | **4,56 ✓** | 4,5 |
| Viền ô nhập / nút (`--border-ui` mới) | Cả hai | — | **3,02 ✓** | 3,0 |

Màu mới được **tính bằng script** (giữ nguyên sắc độ, chỉ chỉnh độ sáng tới khi vừa đạt ngưỡng), không chọn bằng mắt.

**Đã chấp nhận có chủ đích:** viền bảng và đường kẻ phân cách (`--border`) giữ mức tương phản thấp. Đây là yếu tố **trang trí** — nội dung bảng vẫn đọc được mà không cần thấy viền, nên WCAG 1.4.11 không áp dụng.

---

## 6. BA RỦI RO TỪ BÁO CÁO CÚ PHÁP — ĐÃ KIỂM CHỨNG

[SYNTAX-REPORT.md](SYNTAX-REPORT.md) §13 nêu 3 rủi ro cao. Kết quả kiểm chứng bằng script chạy trên cả 199 tài liệu:

| Rủi ro | Kết luận |
|---|---|
| **11 code fence mở cùng dòng với số thứ tự** (`1. ```ts`) → parser ngây thơ sẽ lệch trạng thái | ✅ **Không xảy ra** — marked xử lý đúng cả 11, đều sinh được `<pre>` |
| **Placeholder `<ver>`, `<sha>`, `<T>` trông như thẻ HTML** → có thể bị trình duyệt nuốt mất chữ | ✅ **Không xảy ra** — quét toàn bộ, mọi placeholder đều nằm trong khối mã nên được escape tự động. Chỉ `<details>`/`<summary>` là HTML thật, và đó là cố ý |
| **97 fence thụt lề trong list item** → sơ đồ ASCII có thể lệch | ✅ **Không xảy ra** — 270/270 khối mã render đúng, sơ đồ bàn cờ nguyên vẹn |

---

## 7. CHƯA KIỂM ĐƯỢC

| Mục | Lý do | Rủi ro |
|---|---|---|
| **Mở bằng `file://` (double-click)** | Pane xem trước của công cụ biến trang thành ảnh tĩnh, JS không chạy | **Thấp** — đã xác minh gián tiếp: không dùng `fetch`/`XHR`/`import()`, chỉ dùng thẻ `<script>` (hợp lệ trên `file://`), mọi `localStorage` đều bọc `try/catch`. **Nên thử tay một lần.** |
| Safari / Firefox | Chỉ có Chromium | **Thấp–Trung bình** — `color-mix()` và `:has()` được cả ba hỗ trợ từ 2023; nếu trình duyệt quá cũ thì mất màu nền vài khối, không vỡ bố cục |
| Trình đọc màn hình thật | Không có công cụ | **Trung bình** — đã có `aria-*`, `aria-current`, nhãn tiếng Việt, nhưng chưa nghe thử |
| In ra PDF | Chưa chạy | **Thấp** — có kiểu `@media print` ẩn thanh bên |

---

*Mọi con số trong báo cáo là kết quả đo thật, không ước lượng.*
