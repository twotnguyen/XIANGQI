# Nghiệm thu UI bằng browser Orca — 2026-09-13

**Mục đích:** kiểm chứng sản phẩm bằng một trình duyệt thật, thao tác qua giao diện (không chỉ đọc API), trên stack local thật (PostgreSQL + Supabase Auth + Fastify + Socket.IO + LiveKit local).
**Công cụ:** Orca CLI (`/usr/local/bin/orca` 1.3.1) — hướng dẫn thực tế được lấy bằng `orca skills get orca-cli --reference references/browser.md`.
**HEAD khi chạy:** `aa20d4b` (main sau PR #48 `8bfa200` và PR #49 `aa20d4b`).
**Môi trường:** Node 24.15.0, Supabase CLI 2.101.0 (stack local), LiveKit 1.13.6, API `http://localhost:3001`, web dev `http://localhost:5173` (`--mode test`, `VITE_SUPABASE_URL=http://127.0.0.1:54321`).

> Ghi chú thi hành: `VITE_*` phải được truyền tường minh khi chạy dev server ngoài Playwright; nếu để Vite đọc `.env` gốc, app sẽ trỏ vào **Supabase cloud** và buổi nghiệm thu mất giá trị (đã phát hiện và sửa trong buổi chạy: session key chuyển từ `sb-snsnkoicxmubuotcdafi-auth-token` sang `sb-127-auth-token`).

---

## 1. Chuẩn bị và tiền đề

| Bước | Lệnh / thao tác | Kết quả |
|---|---|---|
| API local | `pnpm --filter @xiangqi/server dev` (env local: `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres`, `SUPABASE_URL=http://127.0.0.1:54321`, key local từ `supabase status`) | `Server listening on port 3001` |
| Web local | `pnpm --filter @xiangqi/web dev --mode test` + `VITE_SUPABASE_URL=http://127.0.0.1:54321` | `import.meta.env.VITE_SUPABASE_URL === "http://127.0.0.1:54321"` |
| Seed người dùng | Admin API `POST /auth/v1/admin/users` (3 user: 2 kỳ thủ + 1 khán giả) | 3 user thật, profile do trigger tạo |
| Ca làm việc | `orca status` | `appRunning: true`, `runtimeState: ready` |

## 2. Các bước thao tác và assertion

| # | Thao tác qua UI | Assertion | Kết quả |
|---|---|---|---|
| 1 | `orca tab create --url http://localhost:5173/login`; điền `Tên đăng nhập`/`Mật khẩu`; bấm **Đăng nhập** | `location.pathname === "/lobby"`; localStorage có `sb-127-auth-token` (đúng stack local) | **PASS** |
| 2 | Bấm **+ Tạo phòng mới**, nhập tên, chọn chế độ **Công khai**, bấm **Xác nhận tạo phòng** | Điều hướng sang `/rooms/512988cc-0c1a-465b-8238-38d3cad1ca7d`; không có alert lỗi | **PASS** |
| 3 | Tab mới ở profile **Player 2** (`orca tab create --profile 5bb14bea-…`), đăng nhập user B, bấm **Vào phòng** ở danh sách sảnh | Tab B vào `/rooms/<id>`; hai ghế hiển thị `35fe14eb…` (Đỏ) và `475210f6…` (Đen) | **PASS** (session độc lập: profile khác, cookie khác) |
| 4 | Quan sát tab A (không reload) | Ghế Đen xuất hiện `475210f6…` — do push `room:updated` | **PASS** |
| 5 | Khán giả thứ 3 join qua API (`role: SPECTATOR`) | Panel trên tab A đổi thành `1/5` không reload | **PASS** |
| 6 | Bấm **SẴN SÀNG** trên tab A, rồi trên tab B | Tab A tự chuyển `/matches/5632d1b0-9136-4ac9-83ab-d8cb41908ebf`; `document.querySelectorAll('[role="img"]').length === 32`; `realtime-status = connected`; bàn `data-interactive="true"` | **PASS** |
| 7 | Chọn Tốt đỏ (0,3) và đi (0,4) bằng chuột thật (`orca exec --command "mouse move/down/up"`) | Tab A: `Tốt đỏ, cột 1 hàng 5` xuất hiện, `hàng 4` biến mất, lượt chuyển `Lượt của Đen` | **PASS** |
| 8 | Quan sát tab B (profile Player 2, không reload) | Tab B: `Tốt đỏ, cột 1 hàng 5` xuất hiện, `realtime-status = connected`, `Lượt của bạn / Bạn cầm quân Đen` | **PASS** |

## 3. Các bước KHÔNG chạy được bằng Orca (BLOCKED, có lý do)

| Hạng mục | Lý do | Bằng chứng | Nơi đã kiểm chứng thay thế |
|---|---|---|---|
| Bàn phím bàn cờ (mũi tên/Enter/Escape) | `orca keypress --key …` báo `pressed` nhưng **không** phát keydown tới trang: listener DOM gắn trên `[role="region"]` đếm `0` sự kiện; `KeyboardEvent` tổng hợp cũng không đổi `data-cursor`. Hạn chế công cụ, không phải lỗi sản phẩm. | `{"count":0,"last":null}` sau `orca keypress --key ArrowDown`; cursor vẫn `square-0-0` | `tests/e2e/keyboard-board.spec.ts` (5 test, chạy trên Chromium + Mobile bằng Playwright/CDP, sự kiện bàn phím thật) |
| Đồng hồ đếm ngược | Phòng tạo ở bước 2 dùng mặc định **Không giới hạn** (thao tác `orca select` trên combobox không áp được giá trị), nên ván không có đồng hồ để quan sát | Trang ván hiển thị `Thời gian: Không giới hạn` | `tests/e2e/realtime-sync.spec.ts` T015-E2E-03 (assert đồng hồ Đen giảm sau nước đi) |
| Khán giả thứ 6 bị từ chối trong trình duyệt | Orca chỉ có 2 profile khả dụng (`Default`, `Player 2`); không có lệnh tạo profile mới qua CLI nên không thể mở phiên độc lập thứ 3+ cho 5 khán giả | `orca tab list --json` → 2 profile | `tests/e2e/spectator-capacity.spec.ts` (8 context độc lập: 2 kỳ thủ + 5 khán giả vào được + người thứ 6 nhận `409 ROOM_FULL`) |
| Media 2 chiều (camera/mic) | Cần thiết bị thật và cấp quyền camera/mic cho profile trình duyệt; ngoài phạm vi buổi chạy này | — | `tests/media/spike.ts` (8/8 trên LiveKit SFU thật, có positive control nhận RTP bytes/frames) |

## 4. Kết luận buổi nghiệm thu

- Luồng người dùng thật qua UI Orca: đăng nhập → tạo phòng → người chơi thứ hai (profile độc lập) vào ghế → push realtime không reload → sẵn sàng → vào ván → đi nước đi → nước đi sang bàn đối thủ. **Tất cả PASS.**
- Không phát hiện lỗi sản phẩm mới trong các luồng đã chạy; hai hạn chế gặp phải đều thuộc công cụ (`orca keypress`) hoặc thao tác chọn combobox, và đều có kiểm chứng thay thế bằng Playwright với sự kiện thật.
- Các hạng mục BLOCKED nêu trên phải được đọc kèm kiểm chứng thay thế, không được coi là "đã pass bằng Orca".
