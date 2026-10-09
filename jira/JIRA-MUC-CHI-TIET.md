# Danh sách mục Jira XIAN — đầy đủ thông tin Epic, Story, Task

> Sinh tự động từ cùng nguồn với [`xian-import.csv`](xian-import.csv) và [KE-HOACH-JIRA.md](../KE-HOACH-JIRA.md). **9 Epic · 27 Story · 71 Task = 107 mục.** Thứ tự: Epic → Story của Epic → Task thực hiện Story đó.

## Quy ước

| Trường | Epic | Story | Task |
|---|---|---|---|
| Parent | — | Epic | Epic |
| Assignee | Tình (BA/PO) | Tình (BA/PO) | Người làm Task |
| Reporter | Tình (PO) | Tình (PO) | Tình (PO) |
| Start → Due | 07/10 → Story muộn nhất | 07/10 → hạn R1 | Theo lịch Task |
| Sprint | Không | Không (backlog, R1) | Sprint 1–4 |
| Original Estimate | — | — | Giờ của Task |
| Story Points (trường Jira) | — (Description ghi tổng điểm Task) | — (Description ghi tổng điểm Task) | Quy đổi từ giờ Task (≤4h = 1 · ≤8h = 2 · ≤16h = 3 · ≤24h = 5 · ≤40h = 8 · >40h = 13) |
| Liên kết | Chứa các Story | Được các Task *relates to* | *relates to* Story; *is blocked by* Task phải xong trước |
| Status khi nhập | To Do | To Do (BA chuyển Done khi PO duyệt, không muộn hơn Due date) | To Do |

**Quy tắc R1:** Story xong trước khi Task đầu tiên của nó bắt đầu; ngoại lệ US-08.3, US-00.5 xong ở Task cuối vì AC chờ kết quả đo kỹ thuật. Epic xong theo Story muộn nhất.

## Mục lục

- [EP-00 · Nền tảng kỹ thuật và chất lượng](#ep-00) — US-00.1, US-00.2, US-00.3, US-00.4, US-00.5
- [EP-01 · Đăng ký và đăng nhập](#ep-01) — US-01.1, US-01.2, US-01.3, US-01.4
- [EP-02 · Tạo phòng](#ep-02) — US-02.1, US-02.2
- [EP-03 · Mời vào phòng](#ep-03) — US-03.1, US-03.2
- [EP-04 · Khởi tạo bàn cờ](#ep-04) — US-04.1, US-04.2, US-04.3
- [EP-05 · Hai người đánh cờ online](#ep-05) — US-05.1, US-05.2, US-05.3
- [EP-06 · Chế độ phòng và người xem](#ep-06) — US-06.1, US-06.2, US-06.3
- [EP-07 · Chat, camera và mic](#ep-07) — US-07.1, US-07.2
- [EP-08 · Đánh với máy theo cấp độ](#ep-08) — US-08.1, US-08.2, US-08.3

---

<a id="ep-00"></a>
## EP-00 · Nền tảng kỹ thuật và chất lượng

| Trường | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | EP-00 · Nền tảng kỹ thuật và chất lượng |
| Parent (Epic) | — |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 04/11/2026 |
| Sprint | — |
| Fix version | v1.0 |
| Original Estimate | — |
| Story Points | — |
| Labels | `EP-00`, `dac-ta` |
| Yêu cầu khách hàng | Hỗ trợ tất cả |
| Story con | US-00.1, US-00.2, US-00.3, US-00.4, US-00.5 |
| Số Task / tổng giờ | 10 Task · 144 giờ |
| Tổng điểm các Task | 29 |

**Description**

Việc kỹ thuật và kiểm thử chung mà 8 yêu cầu cùng dựa vào: khung dự án, CI, cơ sở dữ liệu, khung realtime, kế hoạch kiểm thử, nghiệm thu tổng và đóng gói demo.

Yêu cầu khách hàng: Hỗ trợ tất cả. Story: US-00.1, US-00.2, US-00.3, US-00.4, US-00.5.

### US-00.1 · Khung dự án, CI và nhật ký vận hành

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-00.1 · Khung dự án, CI và nhật ký vận hành |
| Parent (Epic) | EP-00 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 08/10/2026 |
| Sprint | — |
| Fix version | v0.1 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-00` |
| Hạn theo R1 | 08/10 (ngày Task đầu tiên bắt đầu) |
| Thi công | XIAN Sprint 1 · Task đầu 08/10 → Task cuối 10/10 |
| Task thực hiện | T01, T03 (2 Task · 24 giờ) |
| Tổng điểm các Task | 5 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** nhóm phát triển, **tôi muốn** một monorepo có sẵn khung ứng dụng, CI, nhật ký và điểm kiểm tra sức khoẻ, **để** mọi người code trên cùng một nền và tìm lỗi nhanh.
*Nguồn:* README (Công nghệ, Quy trình Git), BA 10.1. *Ghi chú:* cấu trúc gợi ý `apps/web` (React + Vite), `apps/server` (NestJS + Socket.IO), `packages/xiangqi-core` (luật cờ dùng chung), `packages/shared` (kiểu dữ liệu, hằng số), `packages/engine` (máy cờ).
*Nguồn:* BA 10.1 (NFR-08, NFR-09).
*Sprint:* S1. *Story Points:* **5** (tổng điểm 2 Task, 24 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-00.1.1 | Máy dev mới clone repo, có Node + pnpm | Chạy `pnpm install` rồi `pnpm dev` | Web và server cùng chạy; `GET /health` trả 200 | M |
| AC-00.1.2 | Một PR vào `develop` | CI chạy | Chạy lint, typecheck, unit test; bất kỳ bước nào lỗi thì PR không merge được (bảo vệ nhánh) | I |
| AC-00.1.3 | Repo | Kiểm tra file môi trường | Có `.env.example` liệt kê mọi biến; không có khoá bí mật trong git; biến `VITE_*` không chứa bí mật | M |
| AC-00.1.4 | Server chạy | Gọi `/health` | Trả trạng thái server, kết nối CSDL và máy cờ | I |
| AC-00.1.5 | Có đăng nhập, gửi OTP, chat | Đọc log | Log dạng JSON có thời gian, mức, mã sự kiện; **không** chứa mật khẩu, OTP, token, nội dung chat | M |
| AC-00.1.6 | Log và biên lai lệnh | Quá hạn lưu giữ | Biên lai lệnh xoá sau 24 giờ; log giữ tối đa 14 ngày | I |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 08/10 (trước khi Task đầu tiên bắt đầu). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 1.

#### T01 · Dựng monorepo, CI, nhật ký và /health

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T01 · Dựng monorepo, CI, nhật ký và /health |
| Parent (Epic) | EP-00 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 08/10/2026 |
| Due date | 08/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 8 giờ |
| Story Points | 2 |
| Labels | `sprint-1`, `phat-trien` |
| Story (relates to) | US-00.1 |
| Is blocked by | — |

**Description**

**Mục tiêu:** Dựng monorepo, CI, nhật ký và /health — phục vụ US-00.1 Khung dự án, CI và nhật ký vận hành (EP-00 Nền tảng kỹ thuật và chất lượng).
**Đầu vào (phải xong trước):** Không có.
**Việc cần làm:**
- Tạo pnpm workspace: `apps/web` (React + Vite + TS), `apps/server` (NestJS), `packages/shared`, `packages/xiangqi-core`, `packages/engine`
- Cấu hình ESLint, Prettier, TypeScript strict, Vitest; GitHub Actions chạy lint + typecheck + test cho mọi PR vào `develop`; bật bảo vệ nhánh
- Server: logger JSON (thời gian, mức, mã sự kiện, lọc mật khẩu/OTP/token/chat), endpoint `/health`; `.env.example` đủ biến (gồm `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` để chuyển giữa LiveKit tự chạy và LiveKit Cloud)
**Đầu ra:** Repo chạy được bằng `pnpm dev`, CI xanh trên PR mẫu, README mục "Chạy dự án".
**Cách kiểm và điều kiện PASS:** AC-00.1.1 → AC-00.1.6. PASS khi: clone mới chạy được web + server, `/health` trả 200, PR cố ý lỗi lint bị CI chặn, log không chứa dữ liệu nhạy cảm.
**Lịch:** Tình · 8 giờ · 2 Story Points · 08/10 sáng → 08/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-00.1; luật ở BA-SCOPE-DECISIONS.md.

#### T03 · Khung giao diện chung: theme, layout, router, thành phần 5 trạng thái

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T03 · Khung giao diện chung: theme, layout, router, thành phần 5 trạng thái |
| Parent (Epic) | EP-00 |
| Assignee | Nhạn |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 09/10/2026 |
| Due date | 10/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 16 giờ |
| Story Points | 3 |
| Labels | `sprint-1`, `phat-trien` |
| Story (relates to) | US-00.1 |
| Is blocked by | T01 |

**Description**

**Mục tiêu:** Khung giao diện chung: theme, layout, router, thành phần 5 trạng thái — phục vụ US-00.1 Khung dự án, CI và nhật ký vận hành (EP-00 Nền tảng kỹ thuật và chất lượng).
**Đầu vào (phải xong trước):** T01 (Dựng monorepo, CI, nhật ký và /health).
**Việc cần làm:**
- Áp design token Kỳ Đài Cổ Phong (DESIGN.md) thành biến CSS; layout chung, router các trang P1, trang Sảnh khung (nút Tạo phòng, Vào phòng bằng mã, Đánh với máy)
- Thành phần dùng chung: Button, Input, Modal, Toast, Tooltip, Skeleton, EmptyState, ErrorState với đủ 5 trạng thái
- Thanh điều hướng `PANEL-NAVBAR` khung (mục chưa làm hiện "Sắp ra mắt")
**Đầu ra:** Bộ thành phần giao diện và khung trang để các Task FE sau dùng lại.
**Cách kiểm và điều kiện PASS:** PASS khi: mỗi thành phần có trang demo đủ 5 trạng thái; hiển thị đúng ở 360 px và 1440 px; tương phản đạt WCAG AA (kiểm bằng công cụ trình duyệt).
**Lịch:** Nhạn · 16 giờ · 3 Story Points · 09/10 sáng → 10/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-00.1; luật ở BA-SCOPE-DECISIONS.md.

### US-00.2 · Cơ sở dữ liệu và phân quyền P1

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-00.2 · Cơ sở dữ liệu và phân quyền P1 |
| Parent (Epic) | EP-00 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 13/10/2026 |
| Sprint | — |
| Fix version | v0.1 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-00` |
| Hạn theo R1 | 13/10 (ngày Task đầu tiên bắt đầu) |
| Thi công | XIAN Sprint 1 · Task đầu 13/10 → Task cuối 14/10 |
| Task thực hiện | T14 (1 Task · 16 giờ) |
| Tổng điểm các Task | 3 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** nhóm phát triển, **tôi muốn** lược đồ dữ liệu P1 có migration và RLS, **để** dữ liệu nhất quán và client không ghi trái phép.
*Nguồn:* BA 1.x, 2.x, 4.2, 5.5, 10.1 (dữ liệu cá nhân). *Ghi chú:* tối thiểu `profiles`, `friendships`/`friend_requests`, `rooms`, `room_blocks`, `matches`, `match_moves`, `login_attempts`; tên bảng do nhóm chốt.
*Sprint:* S1. *Story Points:* **3** (tổng điểm 1 Task, 16 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-00.2.1 | Cơ sở dữ liệu trống | Chạy toàn bộ migration | Tạo đủ bảng, khoá ngoại, chỉ mục; chạy lại từ đầu không lỗi | I |
| AC-00.2.2 | Người dùng đăng nhập bằng khoá công khai ở client | Đọc/ghi dữ liệu người khác hoặc bảng ván/phòng | Bị RLS từ chối; chỉ máy chủ (khoá service) ghi được dữ liệu ván, phòng, kết quả | I |
| AC-00.2.3 | Username lưu theo chữ người dùng gõ | Kiểm tra trùng | Ràng buộc duy nhất so sánh theo chữ thường (`Twot` = `twot`) | U |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 13/10 (trước khi Task đầu tiên bắt đầu). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 1.

#### T14 · Lược đồ CSDL P1, RLS, migration, dữ liệu mẫu

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T14 · Lược đồ CSDL P1, RLS, migration, dữ liệu mẫu |
| Parent (Epic) | EP-00 |
| Assignee | Tùng |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 13/10/2026 |
| Due date | 14/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 16 giờ |
| Story Points | 3 |
| Labels | `sprint-1`, `phat-trien` |
| Story (relates to) | US-00.2 |
| Is blocked by | T01 |

**Description**

**Mục tiêu:** Lược đồ CSDL P1, RLS, migration, dữ liệu mẫu — phục vụ US-00.2 Cơ sở dữ liệu và phân quyền P1 (EP-00 Nền tảng kỹ thuật và chất lượng).
**Đầu vào (phải xong trước):** T01 (Dựng monorepo, CI, nhật ký và /health).
**Việc cần làm:**
- Thiết kế các bảng P1 còn lại: `friend_requests`, `friendships`, `rooms`, `room_members`, `room_blocks`, `matches`, `match_moves` (bảng `profiles`, `login_attempts` do Task đăng ký/đăng nhập tạo; `command_receipts` do Task realtime tạo)
- Viết migration Supabase + RLS: client chỉ đọc dữ liệu được phép; ván/phòng/kết quả chỉ máy chủ ghi
- Chỉ mục duy nhất username theo chữ thường; script dữ liệu mẫu (tài khoản demo)
**Đầu ra:** Migration chạy lại được từ đầu, sơ đồ dữ liệu (ảnh/markdown) trong repo.
**Cách kiểm và điều kiện PASS:** AC-00.2.1 → AC-00.2.3. PASS khi: test tích hợp chứng minh RLS chặn đọc/ghi trái phép và trùng `Twot`/`twot` bị từ chối.
**Lịch:** Tùng · 16 giờ · 3 Story Points · 13/10 sáng → 14/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-00.2; luật ở BA-SCOPE-DECISIONS.md.

### US-00.3 · Khung realtime

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-00.3 · Khung realtime |
| Parent (Epic) | EP-00 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 12/10/2026 |
| Sprint | — |
| Fix version | v0.1 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-00` |
| Hạn theo R1 | 12/10 (ngày Task đầu tiên bắt đầu) |
| Thi công | XIAN Sprint 1 · Task đầu 12/10 → Task cuối 14/10 |
| Task thực hiện | T12 (1 Task · 24 giờ) |
| Tổng điểm các Task | 5 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** nhóm phát triển, **tôi muốn** cổng Socket.IO có xác thực, lệnh chống trùng và đồng bộ lại khi nối lại, **để** phòng, ván và chat dùng chung một cách.
*Nguồn:* BA 3.3 mục 1, 8.3, 1.8 (nhiều tab).
*Hợp đồng sự kiện:* Task của Story này công bố kiểu dữ liệu sự kiện phòng/ván trong `packages/shared` để Story phòng và Story ván làm độc lập với nhau.
*Sprint:* S1. *Story Points:* **5** (tổng điểm 1 Task, 24 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-00.3.1 | Kết nối không có token hợp lệ (người dùng hoặc Khách) | Mở socket | Bị từ chối kết nối | I |
| AC-00.3.2 | Client gửi cùng một `commandId` hai lần | Máy chủ xử lý | Lệnh chỉ có hiệu lực một lần; lần hai trả lại kết quả cũ | I |
| AC-00.3.3 | Client gửi lệnh với phiên bản trạng thái cũ | Máy chủ nhận | Từ chối và gửi ảnh chụp trạng thái mới nhất | I |
| AC-00.3.4 | Client mất kết nối rồi nối lại | Kết nối thành công | Nhận ảnh chụp đầy đủ (phòng, ván, đồng hồ, vai trò) và giao diện khớp máy chủ | I |
| AC-00.3.5 | Cùng tài khoản mở tab thứ hai vào cùng phòng | Tab mới kết nối | Tab mới tiếp quản; tab cũ nhận *"Phiên này đã được mở ở tab khác"* và chỉ đọc; tab cũ tự nối lại vẫn chỉ đọc | E2E |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 12/10 (trước khi Task đầu tiên bắt đầu). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 1.

#### T12 · Khung realtime Socket.IO

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T12 · Khung realtime Socket.IO |
| Parent (Epic) | EP-00 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 12/10/2026 |
| Due date | 14/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 24 giờ |
| Story Points | 5 |
| Labels | `sprint-1`, `phat-trien` |
| Story (relates to) | US-00.3 |
| Is blocked by | T01 |

**Description**

**Mục tiêu:** Khung realtime Socket.IO — phục vụ US-00.3 Khung realtime (EP-00 Nền tảng kỹ thuật và chất lượng).
**Đầu vào (phải xong trước):** T01 (Dựng monorepo, CI, nhật ký và /health).
**Việc cần làm:**
- Cổng Socket.IO trong NestJS: xác thực JWT Supabase (người dùng và Khách), room theo `roomId`
- Phong bì lệnh có `commandId` + phiên bản trạng thái; lưu biên lai chống trùng (migration bảng `command_receipts` trong Task này); gửi ảnh chụp trạng thái khi nối lại
- Tiếp quản tab: tab mới giành quyền, tab cũ chỉ đọc; **công bố hợp đồng sự kiện phòng/ván trong `packages/shared`**
**Đầu ra:** Khung realtime + tài liệu hợp đồng sự kiện để Story phòng và Story ván làm độc lập.
**Cách kiểm và điều kiện PASS:** AC-00.3.1 → AC-00.3.5. PASS khi: test tích hợp socket xanh (từ chối token sai, lệnh trùng chỉ áp một lần, nối lại nhận ảnh chụp, tab cũ thành chỉ đọc).
**Lịch:** Tình · 24 giờ · 5 Story Points · 12/10 sáng → 14/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-00.3; luật ở BA-SCOPE-DECISIONS.md.

### US-00.4 · Kế hoạch kiểm thử và kiểm chứng sớm

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-00.4 · Kế hoạch kiểm thử và kiểm chứng sớm |
| Parent (Epic) | EP-00 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 08/10/2026 |
| Sprint | — |
| Fix version | v0.1 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-00` |
| Hạn theo R1 | 08/10 (ngày Task đầu tiên bắt đầu) |
| Thi công | XIAN Sprint 1 · Task đầu 08/10 → Task cuối 11/10 |
| Task thực hiện | T02, T06 (2 Task · 32 giờ) |
| Tổng điểm các Task | 6 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** nhóm, **tôi muốn** có kế hoạch kiểm thử và kiểm chứng sớm rủi ro media, **để** nghiệm thu có bằng chứng và phát hiện sớm điểm không khả thi.
*Kèm:* spike GATE-MEDIA (LiveKit Cloud) ở Sprint 1.
*Sprint:* S1. *Story Points:* **6** (tổng điểm 2 Task, 32 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-00.4.1 | Backlog P1 | Viết kế hoạch kiểm thử | Có phạm vi, môi trường, dữ liệu thử, tiêu chí vào/ra, quy trình báo lỗi trên Jira (mức độ: Nghiêm trọng/Cao/Trung bình/Thấp) | M |
| AC-00.4.2 | Mỗi AC | Viết TC | TC cùng số có tiền điều kiện, bước, kết quả mong đợi; truy vết 100% AC | M |
| AC-00.4.3 | Cuối mỗi Sprint | Chạy hồi quy | Báo cáo PASS/FAIL/BLOCKED theo TC, lỗi mở được ghi Jira | M |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 08/10 (trước khi Task đầu tiên bắt đầu). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 1.

#### T02 · Kế hoạch kiểm thử, mẫu TC, quy trình lỗi, TC Sprint 1

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T02 · Kế hoạch kiểm thử, mẫu TC, quy trình lỗi, TC Sprint 1 |
| Parent (Epic) | EP-00 |
| Assignee | Thư |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 08/10/2026 |
| Due date | 09/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 16 giờ |
| Story Points | 3 |
| Labels | `sprint-1`, `phat-trien` |
| Story (relates to) | US-00.4 |
| Is blocked by | — |

**Description**

**Mục tiêu:** Kế hoạch kiểm thử, mẫu TC, quy trình lỗi, TC Sprint 1 — phục vụ US-00.4 Kế hoạch kiểm thử và kiểm chứng sớm (EP-00 Nền tảng kỹ thuật và chất lượng).
**Đầu vào (phải xong trước):** Không có.
**Việc cần làm:**
- Viết kế hoạch kiểm thử: phạm vi, môi trường, dữ liệu thử, tiêu chí vào/ra, mức độ lỗi, quy trình báo lỗi trên Jira
- Tạo mẫu TC (tiền điều kiện, bước, kết quả mong đợi) và viết TC cho các Story Sprint 1
- Thống nhất với nhóm cách đặt mã TC trùng số AC
**Đầu ra:** Tài liệu kế hoạch kiểm thử + bộ TC Sprint 1 trên Jira/Confluence hoặc repo.
**Cách kiểm và điều kiện PASS:** AC-00.4.1, AC-00.4.2. PASS khi: PO duyệt kế hoạch; 100% AC của Story S1 có TC tương ứng.
**Lịch:** Thư · 16 giờ · 3 Story Points · 08/10 sáng → 09/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-00.4; luật ở BA-SCOPE-DECISIONS.md.

#### T06 · Spike media: LiveKit tự chạy + LiveKit Cloud, HTTPS demo LAN (GATE-MEDIA)

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T06 · Spike media: LiveKit tự chạy + LiveKit Cloud, HTTPS demo LAN (GATE-MEDIA) |
| Parent (Epic) | EP-00 |
| Assignee | Cường |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 10/10/2026 |
| Due date | 11/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 16 giờ |
| Story Points | 3 |
| Labels | `sprint-1`, `phat-trien` |
| Story (relates to) | US-00.4 |
| Is blocked by | T01 |

**Description**

**Mục tiêu:** Spike media: LiveKit tự chạy + LiveKit Cloud, HTTPS demo LAN (GATE-MEDIA) — phục vụ US-00.4 Kế hoạch kiểm thử và kiểm chứng sớm (EP-00 Nền tảng kỹ thuật và chất lượng).
**Đầu vào (phải xong trước):** T01 (Dựng monorepo, CI, nhật ký và /health).
**Việc cần làm:**
- Chạy LiveKit mã nguồn mở bằng Docker (`livekit/livekit-server --dev`, cổng 7880/7881/7882 UDP) trên máy dev và trên laptop demo; viết hướng dẫn cho cả nhóm
- Tạo dự án LiveKit Cloud gói miễn phí làm phương án demo qua Internet; xác nhận chỉ cần đổi `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`
- Dựng trang thử: 2 người phát camera/mic + 5 người chỉ nhận, thu hồi quyền một người; thử trên các máy khác cùng mạng LAN qua **HTTPS** (mkcert) vì trình duyệt chỉ cho bật camera trên HTTPS hoặc localhost
- Ghi số đo: CPU/RAM của LiveKit tự chạy, thời gian thu hồi quyền, phút sử dụng LiveKit Cloud
**Đầu ra:** Báo cáo GATE-MEDIA (1–2 trang), `docker-compose` chạy LiveKit, hướng dẫn HTTPS cho demo LAN, đoạn code mẫu cho US-07.2.
**Cách kiểm và điều kiện PASS:** PASS khi: 2 máy khác nhau trong LAN thấy/nghe nhau qua HTTPS với LiveKit tự chạy, đổi sang LiveKit Cloud chỉ bằng biến môi trường; báo cáo đủ số đo (không đặt ngưỡng đạt, theo BA 10.1).
**Lịch:** Cường · 16 giờ · 3 Story Points · 10/10 sáng → 11/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-00.4; luật ở BA-SCOPE-DECISIONS.md.

### US-00.5 · Nghiệm thu tổng, NFR và đóng gói demo

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-00.5 · Nghiệm thu tổng, NFR và đóng gói demo |
| Parent (Epic) | EP-00 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 04/11/2026 |
| Sprint | — |
| Fix version | v1.0 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-00` |
| Hạn theo R1 | 04/11 (ngoại lệ: GATE-REALTIME: ngưỡng NFR chỉ chốt được sau khi đo tải thật) |
| Thi công | XIAN Sprint 4 · Task đầu 29/10 → Task cuối 04/11 |
| Task thực hiện | T51, T66, T70, T71 (4 Task · 48 giờ) |
| Tổng điểm các Task | 10 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** PO, **tôi muốn** đo NFR, chạy đủ D1–D10 và có bản demo chạy được theo hướng dẫn, **để** chứng minh 8 yêu cầu cốt lõi với khách hàng.
*Sprint:* S4. *Story Points:* **10** (tổng điểm 4 Task, 48 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-00.5.1 | Môi trường demo local | Chạy D1–D10 (mục 8) | Tất cả PASS; kịch bản tự động hoá được thì có test Playwright | E2E, M |
| AC-00.5.2 | Bản phát hành v1.0 | Chạy lại D1–D10 trên máy demo thật | Tất cả PASS, có ghi hình làm bằng chứng | M |
| AC-00.5.3 | Mục 6 và 7 | Đo | Mỗi NFR/GATE có số đo, ngày đo, người đo; không đạt thì ghi **BLOCKED** kèm lý do, không tự hạ ngưỡng | M |
| AC-00.5.4 | Bài tải | Chạy kịch bản 50 người dùng / 10 ván đồng thời | Báo cáo độ trễ nước đi p95, lỗi, CPU/RAM | I |
| AC-00.5.5 | Máy sạch, có Node + pnpm, có file `.env` được cấp | Làm theo README | Chạy được toàn bộ ứng dụng trong ≤ 15 phút | M |
| AC-00.5.6 | Trước buổi demo | Chuẩn bị | Có tài khoản demo, phòng mẫu và kịch bản dự phòng (Render) nếu mạng local lỗi | M |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 04/11 (ngoại lệ R1 — GATE-REALTIME: ngưỡng NFR chỉ chốt được sau khi đo tải thật). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 4.

#### T51 · Hồi quy toàn bộ và chạy D1–D10 vòng 1

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T51 · Hồi quy toàn bộ và chạy D1–D10 vòng 1 |
| Parent (Epic) | EP-00 |
| Assignee | Thư |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 29/10/2026 |
| Due date | 31/10/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 24 giờ |
| Story Points | 5 |
| Labels | `sprint-4`, `phat-trien` |
| Story (relates to) | US-00.5 |
| Is blocked by | T02, T13, T16, T17, T27, T28, T29, T30, T39, T43, T45, T47, T48, T49, T50 |

**Description**

**Mục tiêu:** Hồi quy toàn bộ và chạy D1–D10 vòng 1 — phục vụ US-00.5 Nghiệm thu tổng, NFR và đóng gói demo (EP-00 Nền tảng kỹ thuật và chất lượng).
**Đầu vào (phải xong trước):** toàn bộ Task tính năng Sprint 1–3 (15 Task cuối, xem liên kết trên Jira).
**Việc cần làm:**
- Chạy hồi quy toàn bộ TC của Story S1–S3 và kịch bản D1–D10 phần đã có
- Ghi lỗi lên Jira, xác nhận lại lỗi đã sửa
**Đầu ra:** Báo cáo hồi quy vòng 1.
**Cách kiểm và điều kiện PASS:** AC-00.5.1. PASS khi không còn lỗi Nghiêm trọng/Cao mở của Story S1–S3.
**Lịch:** Thư · 24 giờ · 5 Story Points · 29/10 sáng → 31/10 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-00.5; luật ở BA-SCOPE-DECISIONS.md.

#### T66 · Kịch bản tải và đo NFR (GATE-REALTIME)

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T66 · Kịch bản tải và đo NFR (GATE-REALTIME) |
| Parent (Epic) | EP-00 |
| Assignee | Tùng |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 03/11/2026 |
| Due date | 04/11/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 16 giờ |
| Story Points | 3 |
| Labels | `sprint-4`, `phat-trien` |
| Story (relates to) | US-00.5 |
| Is blocked by | T33, T37, T52, T55 |

**Description**

**Mục tiêu:** Kịch bản tải và đo NFR (GATE-REALTIME) — phục vụ US-00.5 Nghiệm thu tổng, NFR và đóng gói demo (EP-00 Nền tảng kỹ thuật và chất lượng).
**Đầu vào (phải xong trước):** T33 (Camera/mic LiveKit: token, quyền phát, mức chia sẻ, khung media (BE + FE)), T37 (BE hai kênh chat, bộ lọc từ cấm, giới hạn tốc độ), T52 (Mất kết nối: ân hạn 60 giây, nối lại, ván bị gián đoạn, lớp phủ (BE + FE)), T55 (BE người xem, chuyển ghế ↔ xem, mời xuống ghế, đuổi và chặn).
**Việc cần làm:**
- Viết kịch bản tải (50 client, 10 ván đồng thời) bằng công cụ chọn được (ví dụ k6 hoặc script Node)
- Đo p95 độ trễ nước đi, lỗi, CPU/RAM; đo nhẹ camera/mic ~3 phòng, chỉ ghi số (GATE-REALTIME, NFR-01, NFR-02)
**Đầu ra:** Kịch bản tải trong repo + báo cáo số đo.
**Cách kiểm và điều kiện PASS:** AC-00.5.3, AC-00.5.4. PASS khi báo cáo đủ số đo; chỉ số không đạt được ghi BLOCKED kèm lý do.
**Lịch:** Tùng · 16 giờ · 3 Story Points · 03/11 sáng → 04/11 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-00.5; luật ở BA-SCOPE-DECISIONS.md.

#### T70 · Đóng gói demo, hướng dẫn chạy, dữ liệu demo

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T70 · Đóng gói demo, hướng dẫn chạy, dữ liệu demo |
| Parent (Epic) | EP-00 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 04/11/2026 |
| Due date | 04/11/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 4 giờ |
| Story Points | 1 |
| Labels | `sprint-4`, `phat-trien` |
| Story (relates to) | US-00.5 |
| Is blocked by | T51, T60, T62, T64, T67, T68, T69 |

**Description**

**Mục tiêu:** Đóng gói demo, hướng dẫn chạy, dữ liệu demo — phục vụ US-00.5 Nghiệm thu tổng, NFR và đóng gói demo (EP-00 Nền tảng kỹ thuật và chất lượng).
**Đầu vào (phải xong trước):** toàn bộ Task tính năng Sprint 4 (7 Task cuối, xem liên kết trên Jira).
**Việc cần làm:**
- Đóng gói chạy demo local (hướng dẫn trong README, ≤ 15 phút): web + server + LiveKit tự chạy qua Docker, HTTPS cho máy khác trong LAN; tài khoản và phòng mẫu; phương án dự phòng: web + server trên Render, camera/mic qua LiveKit Cloud miễn phí
**Đầu ra:** Bản phát hành v1.0 và hướng dẫn chạy.
**Cách kiểm và điều kiện PASS:** AC-00.5.5, AC-00.5.6. PASS khi một thành viên không tham gia đóng gói chạy được theo README.
**Lịch:** Tình · 4 giờ · 1 Story Points · 04/11 sáng → 04/11 sáng · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-00.5; luật ở BA-SCOPE-DECISIONS.md.

#### T71 · Chạy D1–D10 vòng cuối trên máy demo, ghi hình

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T71 · Chạy D1–D10 vòng cuối trên máy demo, ghi hình |
| Parent (Epic) | EP-00 |
| Assignee | Thư |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 04/11/2026 |
| Due date | 04/11/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 4 giờ |
| Story Points | 1 |
| Labels | `sprint-4`, `phat-trien` |
| Story (relates to) | US-00.5 |
| Is blocked by | T70 |

**Description**

**Mục tiêu:** Chạy D1–D10 vòng cuối trên máy demo, ghi hình — phục vụ US-00.5 Nghiệm thu tổng, NFR và đóng gói demo (EP-00 Nền tảng kỹ thuật và chất lượng).
**Đầu vào (phải xong trước):** T70 (Đóng gói demo, hướng dẫn chạy, dữ liệu demo).
**Việc cần làm:**
- Chạy D1–D10 lần cuối trên máy demo, ghi hình làm bằng chứng
**Đầu ra:** Video và báo cáo D1–D10.
**Cách kiểm và điều kiện PASS:** AC-00.5.2. PASS khi 10/10 kịch bản đạt.
**Lịch:** Thư · 4 giờ · 1 Story Points · 04/11 chiều → 04/11 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-00.5; luật ở BA-SCOPE-DECISIONS.md.

---

<a id="ep-01"></a>
## EP-01 · Đăng ký và đăng nhập

| Trường | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | EP-01 · Đăng ký và đăng nhập |
| Parent (Epic) | — |
| Assignee | Tình |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 30/10/2026 |
| Sprint | — |
| Fix version | v1.0 |
| Original Estimate | — |
| Story Points | — |
| Labels | `EP-01`, `dac-ta` |
| Yêu cầu khách hàng | YC1 |
| Story con | US-01.1, US-01.2, US-01.3, US-01.4 |
| Số Task / tổng giờ | 12 Task · 140 giờ |
| Tổng điểm các Task | 31 |

**Description**

Đăng ký bằng username + mật khẩu + OTP email hoặc Google; đăng nhập bằng username + mật khẩu (khoá thử sai), Google hoặc Khách; quản lý phiên và hồ sơ.

Yêu cầu khách hàng: YC1. Story: US-01.1, US-01.2, US-01.3, US-01.4.

### US-01.1 · Đăng ký bằng Username + Mật khẩu + OTP email

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-01.1 · Đăng ký bằng Username + Mật khẩu + OTP email |
| Parent (Epic) | EP-01 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 09/10/2026 |
| Sprint | — |
| Fix version | v0.1 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-01` |
| Hạn theo R1 | 09/10 (ngày Task đầu tiên bắt đầu) |
| Thi công | XIAN Sprint 1 · Task đầu 09/10 → Task cuối 12/10 |
| Task thực hiện | T04, T08, T13 (3 Task · 32 giờ) |
| Tổng điểm các Task | 7 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** khách truy cập, **tôi muốn** đăng ký bằng username, mật khẩu và email có mã OTP gửi tới hộp thư thật, **để** có tài khoản chính thức.
*Nguồn:* BA 1.1, 1.4, 1.5. *Màn hình:* `SCR-REGISTER`.
*Nguồn:* BA 0.4. *Ghi chú:* gắn vào Custom SMTP của Supabase Auth; khoá SMTP chỉ lưu phía máy chủ/Supabase.
*Sprint:* S1. *Story Points:* **7** (tổng điểm 3 Task, 32 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-01.1.1 | Bước 1 | Nhập username sai định dạng (không khớp `^[a-zA-Z0-9_]{3,20}$`) | Báo lỗi tại ô, không sang bước 2 | U, E2E |
| AC-01.1.2 | Bước 1 | Nhập username đã tồn tại (không phân biệt hoa thường) | Báo *"Username đã có người dùng"* | I |
| AC-01.1.3 | Bước 1 | Mật khẩu < 8 ký tự hoặc ô xác nhận không khớp | Báo lỗi, không sang bước 2 | U |
| AC-01.1.4 | Bước 2 | Nhập email đã có tài khoản | Báo *"Email này đã được đăng ký"*, **không** gửi OTP | I |
| AC-01.1.5 | Bước 2, email hợp lệ bất kỳ (kể cả Gmail ngoài nhóm) | Bấm "Xác nhận Email" | Gửi OTP 6 số qua SMTP ngoài; hiện ô nhập OTP và đồng hồ 3 phút | E2E, M |
| AC-01.1.6 | Bước 3 | Nhập đúng OTP trong 3 phút | Tài khoản `ACTIVE`, `display_name = username`, tự đăng nhập và vào Sảnh (hoặc phòng mời đang chờ) | E2E |
| AC-01.1.7 | Bước 3 | Nhập sai, mã hết hạn, hoặc bị giới hạn số lần thử | Báo lỗi rõ ràng và hướng dẫn gửi mã mới | E2E |
| AC-01.1.8 | Vừa gửi mã | Muốn gửi lại | Nút "Gửi lại mã OTP" khoá và đếm lùi 60 giây | E2E |
| AC-01.1.9 | Người dùng bỏ dở trước khi xác nhận OTP | Người khác đăng ký cùng username | Username không bị giữ chỗ; bản xác thực tạm được dọn sau khoảng 60 phút | I |
| AC-01.1.10 | Username bị người khác lấy trong lúc chờ OTP | Xác nhận OTP đúng | Báo lỗi và quay về Bước 1, không tạo tài khoản trùng | I |
| AC-01.1.11 | SMTP ngoài đã cấu hình | Đăng ký bằng Gmail không thuộc nhóm | Thư OTP tới hộp thư (mục tiêu ≤ 1 phút), tên người gửi "Cờ Tướng Online", nội dung tiếng Việt | M |
| AC-01.1.12 | Đăng ký liên tiếp 5 lần trong 1 giờ bằng 5 email khác nhau | Gửi OTP | Cả 5 thư đều gửi được (không còn giới hạn 2 thư/giờ của SMTP mặc định) | M |
| AC-01.1.13 | Dịch vụ SMTP lỗi hoặc hết hạn mức | Gửi OTP | Giao diện báo lỗi thật *"Không gửi được mã, vui lòng thử lại sau"*; tài khoản không bị kẹt | I |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 09/10 (trước khi Task đầu tiên bắt đầu). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 1.

#### T04 · BE đăng ký 3 bước, OTP qua SMTP ngoài, dọn bản tạm

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T04 · BE đăng ký 3 bước, OTP qua SMTP ngoài, dọn bản tạm |
| Parent (Epic) | EP-01 |
| Assignee | Đông |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 09/10/2026 |
| Due date | 10/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 16 giờ |
| Story Points | 3 |
| Labels | `sprint-1`, `phat-trien` |
| Story (relates to) | US-01.1 |
| Is blocked by | T01 |

**Description**

**Mục tiêu:** BE đăng ký 3 bước, OTP qua SMTP ngoài, dọn bản tạm — phục vụ US-01.1 Đăng ký bằng Username + Mật khẩu + OTP email (EP-01 Đăng ký và đăng nhập).
**Đầu vào (phải xong trước):** T01 (Dựng monorepo, CI, nhật ký và /health).
**Việc cần làm:**
- API đăng ký 3 bước: kiểm username (định dạng, trùng không phân biệt hoa thường), mật khẩu, email đã tồn tại
- Gửi OTP 6 số qua Supabase Auth với **SMTP ngoài** (cấu hình Custom SMTP, chọn nhà cung cấp gói miễn phí), hạn 3 phút, gửi lại sau 60 giây
- Migration bảng `profiles`; hoàn tất: tạo hồ sơ `display_name = username`, tự đăng nhập; kiểm lại trùng ở bước cuối; tác vụ dọn bản tạm sau ~60 phút; GATE-SMTP, GATE-EMAIL
**Đầu ra:** API đăng ký + cấu hình SMTP + báo cáo GATE-SMTP.
**Cách kiểm và điều kiện PASS:** AC U/I của US-01.1 (định dạng, trùng username/email, OTP, bỏ dở, tranh chấp username, lỗi SMTP). PASS khi test tích hợp xanh và gửi được OTP tới 3 Gmail ngoài nhóm.
**Lịch:** Đông · 16 giờ · 3 Story Points · 09/10 sáng → 10/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-01.1; luật ở BA-SCOPE-DECISIONS.md.

#### T08 · FE màn Đăng ký 3 bước

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T08 · FE màn Đăng ký 3 bước |
| Parent (Epic) | EP-01 |
| Assignee | Nhạn |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 11/10/2026 |
| Due date | 12/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 12 giờ |
| Story Points | 3 |
| Labels | `sprint-1`, `phat-trien` |
| Story (relates to) | US-01.1 |
| Is blocked by | T03, T04 |

**Description**

**Mục tiêu:** FE màn Đăng ký 3 bước — phục vụ US-01.1 Đăng ký bằng Username + Mật khẩu + OTP email (EP-01 Đăng ký và đăng nhập).
**Đầu vào (phải xong trước):** T03 (Khung giao diện chung: theme, layout, router, thành phần 5 trạng thái), T04 (BE đăng ký 3 bước, OTP qua SMTP ngoài, dọn bản tạm).
**Việc cần làm:**
- Màn `SCR-REGISTER` 3 bước: username/mật khẩu → email → 6 ô OTP có đếm 3 phút và nút Gửi lại (đếm 60 giây)
- Hiển thị lỗi tại ô, đủ 5 trạng thái; chuyển vào Sảnh hoặc phòng mời đang chờ sau khi xong
**Đầu ra:** Màn Đăng ký hoạt động với API thật.
**Cách kiểm và điều kiện PASS:** AC E2E của US-01.1. PASS khi Playwright chạy được luồng đăng ký thành công và các luồng lỗi chính.
**Lịch:** Nhạn · 12 giờ · 3 Story Points · 11/10 sáng → 12/10 sáng · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-01.1; luật ở BA-SCOPE-DECISIONS.md.

#### T13 · Kiểm thử US-01.1

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T13 · Kiểm thử US-01.1 |
| Parent (Epic) | EP-01 |
| Assignee | Thư |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 12/10/2026 |
| Due date | 12/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 4 giờ |
| Story Points | 1 |
| Labels | `sprint-1`, `kiem-thu` |
| Story (relates to) | US-01.1 |
| Is blocked by | T08 |

**Description**

**Mục tiêu:** Kiểm thử US-01.1 — phục vụ US-01.1 Đăng ký bằng Username + Mật khẩu + OTP email (EP-01 Đăng ký và đăng nhập).
**Đầu vào (phải xong trước):** T08 (FE màn Đăng ký 3 bước).
**Việc cần làm:**
- Chạy TC của US-01.1, gồm đăng ký bằng Gmail thật ngoài nhóm
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-01.1 đạt.
**Lịch:** Thư · 4 giờ · 1 Story Points · 12/10 chiều → 12/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-01.1; luật ở BA-SCOPE-DECISIONS.md.

### US-01.2 · Đăng nhập bằng Username + Mật khẩu và khoá thử sai

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-01.2 · Đăng nhập bằng Username + Mật khẩu và khoá thử sai |
| Parent (Epic) | EP-01 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 11/10/2026 |
| Sprint | — |
| Fix version | v0.1 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-01` |
| Hạn theo R1 | 11/10 (ngày Task đầu tiên bắt đầu) |
| Thi công | XIAN Sprint 1 · Task đầu 11/10 → Task cuối 14/10 |
| Task thực hiện | T09, T15, T17 (3 Task · 28 giờ) |
| Tổng điểm các Task | 6 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** người dùng, **tôi muốn** đăng nhập bằng username và mật khẩu an toàn, **để** vào ứng dụng mà tài khoản không bị dò mật khẩu.
*Nguồn:* BA 0.2, 1.8. *Màn hình:* `SCR-LOGIN`. *Ghi chú kỹ thuật:* Supabase Auth đăng nhập bằng email, nên máy chủ tra email từ username rồi xác thực; không trả email hay sự tồn tại của username về client.
*Sprint:* S1. *Story Points:* **6** (tổng điểm 3 Task, 28 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-01.2.1 | Tài khoản `twot` tồn tại | Đăng nhập bằng `TWOT` + mật khẩu đúng | Thành công, vào Sảnh (hoặc phòng mời đang chờ) | E2E |
| AC-01.2.2 | Bất kỳ | Sai mật khẩu **hoặc** username không tồn tại | Cùng một câu *"Sai tên đăng nhập hoặc mật khẩu"*, thời gian phản hồi không lộ khác biệt rõ rệt | I, E2E |
| AC-01.2.3 | Cùng username đã sai 4 lần trong 15 phút | Sai lần thứ 5 | Username bị chặn đăng nhập mật khẩu 15 phút tính từ lần sai thứ 5 | I |
| AC-01.2.4 | Username đang bị chặn | Thử đăng nhập, **kể cả đúng mật khẩu** | Báo *"Bạn đã thử quá nhiều lần, vui lòng thử lại sau 15 phút"*, không đăng nhập | I, E2E |
| AC-01.2.5 | Username **không tồn tại** sai 5 lần | Thử lần 6 | Hành vi giống hệt username có thật (cũng bị chặn, cùng câu báo) | I |
| AC-01.2.6 | Đã sai 3 lần | Đăng nhập đúng | Thành công, bộ đếm về 0 | I |
| AC-01.2.7 | Ô "Ghi nhớ đăng nhập" mặc định tick | Đăng nhập | Phiên hết hạn cố định sau 30 ngày; bỏ tick thì hết khi đóng trình duyệt hoặc sau 12 giờ, tuỳ cái nào trước | I, M |
| AC-01.2.8 | Đã đăng nhập | Mở `/login` hoặc `/register` | Tự chuyển về `/lobby` | E2E |
| AC-01.2.9 | Username đang bị chặn do sai mật khẩu 5 lần | Chủ tài khoản đăng nhập thành công bằng Google | Vẫn vào được bằng Google; bộ đếm sai mật khẩu **không** bị xoá, đăng nhập bằng mật khẩu vẫn bị chặn tới hết 15 phút (BA 0.15) | I |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 11/10 (trước khi Task đầu tiên bắt đầu). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 1.

#### T09 · BE đăng nhập username, khoá thử sai, ghi nhớ đăng nhập

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T09 · BE đăng nhập username, khoá thử sai, ghi nhớ đăng nhập |
| Parent (Epic) | EP-01 |
| Assignee | Đông |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 11/10/2026 |
| Due date | 12/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 16 giờ |
| Story Points | 3 |
| Labels | `sprint-1`, `phat-trien` |
| Story (relates to) | US-01.2 |
| Is blocked by | T04 |

**Description**

**Mục tiêu:** BE đăng nhập username, khoá thử sai, ghi nhớ đăng nhập — phục vụ US-01.2 Đăng nhập bằng Username + Mật khẩu và khoá thử sai (EP-01 Đăng ký và đăng nhập).
**Đầu vào (phải xong trước):** T04 (BE đăng ký 3 bước, OTP qua SMTP ngoài, dọn bản tạm).
**Việc cần làm:**
- API đăng nhập bằng username (tra email phía máy chủ, không trả về client), không phân biệt hoa thường, câu báo lỗi chung
- Migration bảng `login_attempts`; bộ đếm thử sai theo username chuẩn hoá (kể cả username không tồn tại): 5 lần/15 phút → chặn 15 phút; đăng nhập mật khẩu đúng thì đặt lại, đăng nhập Google **không** đặt lại (BA 0.15)
- Ghi nhớ đăng nhập: 30 ngày hoặc phiên trình duyệt/12 giờ; GATE-AUTH-USERNAME
**Đầu ra:** API đăng nhập + bảng `login_attempts` + báo cáo GATE-AUTH-USERNAME.
**Cách kiểm và điều kiện PASS:** AC U/I của US-01.2. PASS khi test tích hợp chứng minh khoá đúng, không lộ username tồn tại, đúng câu thông báo.
**Lịch:** Đông · 16 giờ · 3 Story Points · 11/10 sáng → 12/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-01.2; luật ở BA-SCOPE-DECISIONS.md.

#### T15 · FE màn Đăng nhập

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T15 · FE màn Đăng nhập |
| Parent (Epic) | EP-01 |
| Assignee | Nhạn |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 13/10/2026 |
| Due date | 13/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 8 giờ |
| Story Points | 2 |
| Labels | `sprint-1`, `phat-trien` |
| Story (relates to) | US-01.2 |
| Is blocked by | T03, T09 |

**Description**

**Mục tiêu:** FE màn Đăng nhập — phục vụ US-01.2 Đăng nhập bằng Username + Mật khẩu và khoá thử sai (EP-01 Đăng ký và đăng nhập).
**Đầu vào (phải xong trước):** T03 (Khung giao diện chung: theme, layout, router, thành phần 5 trạng thái), T09 (BE đăng nhập username, khoá thử sai, ghi nhớ đăng nhập).
**Việc cần làm:**
- Màn `SCR-LOGIN`: username, mật khẩu, Ghi nhớ đăng nhập (mặc định tick), nút Google và Guest hiển thị (hoạt động ở US-01.3), "Quên mật khẩu?" `DISABLED`
- Hiện thông báo khoá thử sai; đã đăng nhập vào `/login` thì về Sảnh
**Đầu ra:** Màn Đăng nhập hoạt động với API thật.
**Cách kiểm và điều kiện PASS:** AC E2E của US-01.2. PASS khi Playwright đăng nhập `TWOT` thành công và thấy câu khoá sau 5 lần sai.
**Lịch:** Nhạn · 8 giờ · 2 Story Points · 13/10 sáng → 13/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-01.2; luật ở BA-SCOPE-DECISIONS.md.

#### T17 · Kiểm thử US-01.2

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T17 · Kiểm thử US-01.2 |
| Parent (Epic) | EP-01 |
| Assignee | Thư |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 14/10/2026 |
| Due date | 14/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 4 giờ |
| Story Points | 1 |
| Labels | `sprint-1`, `kiem-thu` |
| Story (relates to) | US-01.2 |
| Is blocked by | T15 |

**Description**

**Mục tiêu:** Kiểm thử US-01.2 — phục vụ US-01.2 Đăng nhập bằng Username + Mật khẩu và khoá thử sai (EP-01 Đăng ký và đăng nhập).
**Đầu vào (phải xong trước):** T15 (FE màn Đăng nhập).
**Việc cần làm:**
- Chạy TC của US-01.2
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-01.2 đạt.
**Lịch:** Thư · 4 giờ · 1 Story Points · 14/10 sáng → 14/10 sáng · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-01.2; luật ở BA-SCOPE-DECISIONS.md.

### US-01.3 · Đăng ký/đăng nhập bằng Google và chế độ Khách

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-01.3 · Đăng ký/đăng nhập bằng Google và chế độ Khách |
| Parent (Epic) | EP-01 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 23/10/2026 |
| Sprint | — |
| Fix version | v0.3 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-01` |
| Hạn theo R1 | 23/10 (ngày Task đầu tiên bắt đầu) |
| Thi công | XIAN Sprint 3 · Task đầu 23/10 → Task cuối 28/10 |
| Task thực hiện | T35, T44, T48 (3 Task · 44 giờ) |
| Tổng điểm các Task | 10 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** người dùng mới, **tôi muốn** vào ứng dụng nhanh bằng tài khoản Google hoặc bằng tên tạm (Khách), **để** không mất thời gian đăng ký.
*Nguồn:* BA 1.2, 1.4, 0.2. *Màn hình:* `SCR-LOGIN`, `SCR-REGISTER`, `SCR-ONBOARDING`.
*Nguồn:* BA 0.3, 1.3, 1.4 mục 4, 2.4. *Màn hình:* `SCR-LOGIN`, `MODAL-GUEST-NAME`. *Ghi chú kỹ thuật:* có thể dùng đăng nhập ẩn danh của Supabase; cần spike xác nhận.
*Sprint:* S3. *Story Points:* **10** (tổng điểm 3 Task, 44 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-01.3.1 | Email Google chưa có tài khoản | Bấm "Đăng ký bằng Google" hoặc "Đăng nhập bằng Google" | Chuyển tới `/onboarding`: email chỉ đọc, ô Username và Mật khẩu; không yêu cầu OTP | E2E, M |
| AC-01.3.2 | Đang ở `/onboarding` | Nhập username/mật khẩu hợp lệ, bấm "Hoàn tất thiết lập" | Tạo tài khoản, `display_name = username` (không lấy họ tên Google), vào Sảnh | E2E |
| AC-01.3.3 | Email Google đã thuộc tài khoản Username + Mật khẩu | Bấm đăng ký/đăng nhập Google | Báo *"Email này đã được đăng ký"*, **không** tự liên kết hai tài khoản | I, M |
| AC-01.3.4 | Tài khoản tạo bằng Google đã hoàn tất | Bấm "Đăng nhập bằng Google" | Vào Sảnh ngay | E2E |
| AC-01.3.5 | Tài khoản tạo bằng Google đã hoàn tất | Đăng nhập bằng username + mật khẩu đã đặt | Đăng nhập thành công | E2E |
| AC-01.3.6 | Ở `/onboarding` | Thử đóng/thoát hoặc vào URL khác của ứng dụng | Không có nút X; chưa hoàn tất thì không dùng được ứng dụng | E2E |
| AC-01.3.7 | Bản Google tạm chưa hoàn tất quá 60 phút | Tác vụ dọn chạy (mỗi 5 phút) | Bản tạm bị xoá; tài khoản đã hoàn tất hoặc vừa hoàn tất không bị xoá | I |
| AC-01.3.8 | Ở `SCR-LOGIN` | Nhìn dưới nút "Guest" | Có ghi chú *"Lưu ý: Chế độ Khách (Guest) không được tham gia đánh Xếp hạng để tính điểm Elo và không lưu lịch sử ván cờ."* | E2E |
| AC-01.3.9 | Bấm "Guest" | Nhập tên 2–20 ký tự (có dấu), không chứa từ cấm, bấm "Vào chơi" | Vào Sảnh; tên hiển thị kèm **"(Khách)"** ở mọi nơi | E2E |
| AC-01.3.10 | `MODAL-GUEST-NAME` | Tên < 2, > 20 ký tự hoặc chứa từ cấm | Từ chối với thông báo lỗi tại ô | U, E2E |
| AC-01.3.11 | Khách đang có 1 phòng mở do mình tạo | Tạo phòng thứ hai | Bị chặn kèm tooltip *"Khách chỉ được mở 1 phòng cùng lúc"* | I |
| AC-01.3.12 | Phiên Khách đủ 12 giờ khi đang ngồi ghế hoặc trong ván | Hết 12 giờ | Phiên chưa hết cho đến khi Khách rời ghế/ván | I |
| AC-01.3.13 | Phiên Khách hết hạn hoặc Khách bấm Đăng xuất | Hệ thống xử lý | Về `SCR-LOGIN`; tên và dữ liệu cá nhân của Khách bị xoá; vào lại là danh tính Khách mới | I |
| AC-01.3.14 | Username đang bị chặn | Đăng nhập bằng Google của chính tài khoản đó | Vẫn đăng nhập được (bộ đếm không áp cho Google) | M |
| AC-01.3.15 | Chưa đăng nhập, mở link mời phòng | Chọn "Guest", nhập tên hợp lệ | Tự vào đúng phòng (ghế trống hoặc người xem theo sức chứa), không phải mở link lần hai | E2E |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 23/10 (trước khi Task đầu tiên bắt đầu). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 3.

#### T35 · BE đăng ký/đăng nhập Google, onboarding, phiên Khách

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T35 · BE đăng ký/đăng nhập Google, onboarding, phiên Khách |
| Parent (Epic) | EP-01 |
| Assignee | Đông |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 23/10/2026 |
| Due date | 26/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 24 giờ |
| Story Points | 5 |
| Labels | `sprint-3`, `phat-trien` |
| Story (relates to) | US-01.3 |
| Is blocked by | T09, T14 |

**Description**

**Mục tiêu:** BE đăng ký/đăng nhập Google, onboarding, phiên Khách — phục vụ US-01.3 Đăng ký/đăng nhập bằng Google và chế độ Khách (EP-01 Đăng ký và đăng nhập).
**Đầu vào (phải xong trước):** T09 (BE đăng nhập username, khoá thử sai, ghi nhớ đăng nhập), T14 (Lược đồ CSDL P1, RLS, migration, dữ liệu mẫu).
**Việc cần làm:**
- Google OAuth trên Supabase: email chưa có → onboarding đặt username + mật khẩu; email đã có → báo trùng, không tự liên kết (GATE-GOOGLE); dọn bản tạm 60 phút
- Phiên Khách (đăng nhập ẩn danh, GATE-GUEST): tên tạm qua bộ lọc, nhãn "(Khách)", hạn 12 giờ (không hết khi đang ngồi ghế), xoá dữ liệu khi hết hạn; khoá thử sai không áp cho Google
**Đầu ra:** API Google + Khách + báo cáo GATE-GOOGLE, GATE-GUEST.
**Cách kiểm và điều kiện PASS:** AC U/I của US-01.3. PASS khi test tích hợp xanh và GATE-GOOGLE xác nhận không gộp tài khoản.
**Lịch:** Đông · 24 giờ · 5 Story Points · 23/10 chiều → 26/10 sáng · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-01.3; luật ở BA-SCOPE-DECISIONS.md.

#### T44 · FE nút Google, Onboarding, hộp tên Khách, ẩn chức năng cho Khách

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T44 · FE nút Google, Onboarding, hộp tên Khách, ẩn chức năng cho Khách |
| Parent (Epic) | EP-01 |
| Assignee | Kỳ |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 26/10/2026 |
| Due date | 27/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 12 giờ |
| Story Points | 3 |
| Labels | `sprint-3`, `phat-trien` |
| Story (relates to) | US-01.3 |
| Is blocked by | T15, T35 |

**Description**

**Mục tiêu:** FE nút Google, Onboarding, hộp tên Khách, ẩn chức năng cho Khách — phục vụ US-01.3 Đăng ký/đăng nhập bằng Google và chế độ Khách (EP-01 Đăng ký và đăng nhập).
**Đầu vào (phải xong trước):** T15 (FE màn Đăng nhập), T35 (BE đăng ký/đăng nhập Google, onboarding, phiên Khách).
**Việc cần làm:**
- Nút Google ở Đăng nhập/Đăng ký, màn `SCR-ONBOARDING` (không có nút X)
- Nút Guest + `MODAL-GUEST-NAME`, nhãn "(Khách)", vào phòng từ link mời bằng Khách
**Đầu ra:** Luồng Google và Khách hoạt động trên giao diện.
**Cách kiểm và điều kiện PASS:** AC E2E của US-01.3. PASS khi Playwright vào bằng Khách từ link mời và tự vào phòng.
**Lịch:** Kỳ · 12 giờ · 3 Story Points · 26/10 chiều → 27/10 chiều · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-01.3; luật ở BA-SCOPE-DECISIONS.md.

#### T48 · Kiểm thử US-01.3

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T48 · Kiểm thử US-01.3 |
| Parent (Epic) | EP-01 |
| Assignee | Thư |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 28/10/2026 |
| Due date | 28/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 8 giờ |
| Story Points | 2 |
| Labels | `sprint-3`, `kiem-thu` |
| Story (relates to) | US-01.3 |
| Is blocked by | T44 |

**Description**

**Mục tiêu:** Kiểm thử US-01.3 — phục vụ US-01.3 Đăng ký/đăng nhập bằng Google và chế độ Khách (EP-01 Đăng ký và đăng nhập).
**Đầu vào (phải xong trước):** T44 (FE nút Google, Onboarding, hộp tên Khách, ẩn chức năng cho Khách).
**Việc cần làm:**
- Chạy TC của US-01.3 với tài khoản Google thật
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-01.3 đạt.
**Lịch:** Thư · 8 giờ · 2 Story Points · 28/10 sáng → 28/10 chiều · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-01.3; luật ở BA-SCOPE-DECISIONS.md.

### US-01.4 · Phiên đăng nhập, hồ sơ và Đăng xuất

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-01.4 · Phiên đăng nhập, hồ sơ và Đăng xuất |
| Parent (Epic) | EP-01 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 30/10/2026 |
| Sprint | — |
| Fix version | v1.0 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-01` |
| Hạn theo R1 | 30/10 (ngày Task đầu tiên bắt đầu) |
| Thi công | XIAN Sprint 4 · Task đầu 30/10 → Task cuối 03/11 |
| Task thực hiện | T56, T65, T69 (3 Task · 36 giờ) |
| Tổng điểm các Task | 8 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** người chơi, **tôi muốn** phiên và vị trí chơi được quản lý rõ ràng và tự đặt tên hiển thị, **để** không chơi hai nơi cùng lúc và đối thủ nhận ra tôi.
*Nguồn:* BA 1.8, 2.4, 6.3 mục 4. *Ghi chú kỹ thuật:* Supabase cho phép nhiều phiên song song; cần bảng phiên/vị trí chơi phía máy chủ để thực thi luật "thiết bị khác" (spike S1).
*Nguồn:* BA 1.4, 1.6 (email chỉ đọc), Phần 11. *Màn hình:* `SCR-PROFILE-SETTINGS`, `PANEL-NAVBAR`.
*Sprint:* S4. *Story Points:* **8** (tổng điểm 3 Task, 36 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-01.4.1 | Đang đăng nhập | Dùng ứng dụng liên tục, làm mới token | Hạn phiên **không** được gia hạn; chỉ đăng nhập lại mới tạo hạn mới | I |
| AC-01.4.2 | Phiên chính thức hết hạn khi đang trong ván online | Hết hạn | Mất quyền điều khiển, yêu cầu đăng nhập lại; ván giữ ân hạn 60 giây, đồng hồ vẫn chạy; đăng nhập lại cùng thiết bị trong hạn thì tiếp tục | E2E |
| AC-01.4.3 | Phiên hết hạn khi đang đánh với máy | Hết hạn | Ván AI được giữ 30 phút; đăng nhập lại cùng thiết bị trong hạn thì tiếp tục | I |
| AC-01.4.4 | Tài khoản đang trong ván (online hoặc AI) ở thiết bị A | Đăng nhập thành công ở thiết bị B | Ván bị **xử thua ngay** và kết thúc; thiết bị A bị đăng xuất; thiết bị B vào **Sảnh** | E2E |
| AC-01.4.5 | Tài khoản đang ngồi ghế ở phòng `WAITING` (không có ván) ở thiết bị A | Đăng nhập ở thiết bị B | Không tạo kết quả thua; A bị đăng xuất, rời ghế theo vòng đời phòng; B vào Sảnh | I |
| AC-01.4.6 | Đang ngồi ghế ở một phòng hoặc đang trong ván AI | Bấm Tạo phòng / Vào chơi / Đánh với máy / mở mã phòng khác để ngồi ghế | Nút `DISABLED` kèm tooltip *"Bạn đang ở trong một ván/phòng khác"*; máy chủ cũng từ chối | I, E2E |
| AC-01.4.7 | Có phòng/ván đang dở | Vào Sảnh | Hiện banner *"Bạn có ván đang chơi dở — Quay lại"* dẫn về đúng phòng/ván | E2E |
| AC-01.4.8 | Đang trong ván online | Bấm Đăng xuất | Hiện xác nhận hậu quả đầu hàng; Đồng ý → ván kết thúc `RESIGN`, rời phòng, đăng xuất; Huỷ → giữ nguyên | E2E |
| AC-01.4.9 | Đang ở phòng `WAITING` | Bấm Đăng xuất | Rời phòng theo 2.3 (không xử thua) rồi đăng xuất | E2E |
| AC-01.4.10 | Ở Cài đặt hồ sơ | Nhập Display Name 2–30 ký tự hợp lệ, bấm "Lưu thay đổi" | Lưu ngay, không cần OTP; tên mới hiện ở thanh điều hướng và trong phòng ở lần cập nhật kế tiếp | E2E |
| AC-01.4.11 | Ở Cài đặt hồ sơ | Display Name chứa từ cấm hoặc sai độ dài | Từ chối lưu (không che `***`), báo lỗi tại ô | U, E2E |
| AC-01.4.12 | Ở Cài đặt hồ sơ | Xem thông tin | Thấy avatar chữ cái đầu, `@username`, email **chỉ đọc**; không có nút đổi Username (P2), không có bộ chọn giao diện | E2E |
| AC-01.4.13 | Ở Cài đặt hồ sơ | Bấm "Đăng xuất" | Đăng xuất theo AC-01.4.8/AC-01.4.9 | E2E |
| AC-01.4.14 | Khách | Mở mục Bạn bè, tab mời bạn bè trong `MODAL-INVITE`, hoặc Cài đặt hồ sơ | Bạn bè ở thanh điều hướng `DISABLED` kèm tooltip *"Đăng ký tài khoản để kết bạn"*; tab mời bạn bè ẩn (vẫn có link/mã); Cài đặt chỉ có Đăng xuất | E2E |
| AC-01.4.15 | Khách | Người dùng khác tìm username hoặc mời Khách | Khách không xuất hiện trong tìm kiếm bạn bè, không nhận được lời mời bạn bè | I |
| AC-01.4.16 | Đang trong ván ở nơi khác | Mở link mời | Luật 1.8 được kiểm trước; không tự vào phòng mới để ngồi ghế | I |
| AC-01.4.17 | Đang ngồi ghế phòng online | Bấm "Đánh với máy" | `DISABLED` theo AC-01.4.6 | E2E |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 30/10 (trước khi Task đầu tiên bắt đầu). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 4.

#### T56 · BE phiên cố định, một vị trí chơi, thiết bị khác xử thua, đăng xuất

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T56 · BE phiên cố định, một vị trí chơi, thiết bị khác xử thua, đăng xuất |
| Parent (Epic) | EP-01 |
| Assignee | Cường |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 30/10/2026 |
| Due date | 02/11/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 24 giờ |
| Story Points | 5 |
| Labels | `sprint-4`, `phat-trien` |
| Story (relates to) | US-01.4 |
| Is blocked by | T18, T20, T35 |

**Description**

**Mục tiêu:** BE phiên cố định, một vị trí chơi, thiết bị khác xử thua, đăng xuất — phục vụ US-01.4 Phiên đăng nhập, hồ sơ và Đăng xuất (EP-01 Đăng ký và đăng nhập).
**Đầu vào (phải xong trước):** T18 (BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host), T20 (BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván), T35 (BE đăng ký/đăng nhập Google, onboarding, phiên Khách).
**Việc cần làm:**
- Hạn phiên cố định (không gia hạn khi làm mới token), hết hạn trong ván: ân hạn 60 giây / ván AI 30 phút
- Một vị trí chơi: chặn ngồi ghế/ván thứ hai; đăng nhập thiết bị khác khi đang ván → xử thua, đăng xuất thiết bị cũ (GATE-SESSION)
- Đăng xuất chủ động: đang ván → đầu hàng có xác nhận; ở phòng chờ → rời phòng; banner ván dở
- Giới hạn của Khách: không xuất hiện trong tìm kiếm bạn bè, không nhận lời mời bạn bè
**Đầu ra:** Quản lý phiên phía máy chủ + test tích hợp + báo cáo GATE-SESSION.
**Cách kiểm và điều kiện PASS:** AC U/I của US-01.4. PASS khi test tích hợp xanh cho cả hai thiết bị.
**Lịch:** Cường · 24 giờ · 5 Story Points · 30/10 chiều → 02/11 sáng · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-01.4; luật ở BA-SCOPE-DECISIONS.md.

#### T65 · FE Cài đặt hồ sơ, Đăng xuất, banner ván dở

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T65 · FE Cài đặt hồ sơ, Đăng xuất, banner ván dở |
| Parent (Epic) | EP-01 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 02/11/2026 |
| Due date | 03/11/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 8 giờ |
| Story Points | 2 |
| Labels | `sprint-4`, `phat-trien` |
| Story (relates to) | US-01.4 |
| Is blocked by | T56 |

**Description**

**Mục tiêu:** FE Cài đặt hồ sơ, Đăng xuất, banner ván dở — phục vụ US-01.4 Phiên đăng nhập, hồ sơ và Đăng xuất (EP-01 Đăng ký và đăng nhập).
**Đầu vào (phải xong trước):** T56 (BE phiên cố định, một vị trí chơi, thiết bị khác xử thua, đăng xuất).
**Việc cần làm:**
- `SCR-PROFILE-SETTINGS`: Display Name (2–30, lọc từ cấm), email chỉ đọc, avatar chữ cái, Đăng xuất có xác nhận
- Banner "Bạn có ván đang chơi dở — Quay lại", tooltip nút bị khoá do đang ở ván khác
- Với Khách: mục Bạn bè `DISABLED`, tab mời bạn bè ẩn, Cài đặt chỉ có Đăng xuất
**Đầu ra:** Giao diện hồ sơ và phiên.
**Cách kiểm và điều kiện PASS:** AC E2E của US-01.4. PASS khi Playwright đổi Display Name và thấy banner ván dở.
**Lịch:** Tình · 8 giờ · 2 Story Points · 02/11 chiều → 03/11 sáng · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-01.4; luật ở BA-SCOPE-DECISIONS.md.

#### T69 · Kiểm thử US-01.4

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T69 · Kiểm thử US-01.4 |
| Parent (Epic) | EP-01 |
| Assignee | Nhạn |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 03/11/2026 |
| Due date | 03/11/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 4 giờ |
| Story Points | 1 |
| Labels | `sprint-4`, `kiem-thu` |
| Story (relates to) | US-01.4 |
| Is blocked by | T65 |

**Description**

**Mục tiêu:** Kiểm thử US-01.4 — phục vụ US-01.4 Phiên đăng nhập, hồ sơ và Đăng xuất (EP-01 Đăng ký và đăng nhập).
**Đầu vào (phải xong trước):** T65 (FE Cài đặt hồ sơ, Đăng xuất, banner ván dở).
**Việc cần làm:**
- Chạy TC của US-01.4, gồm đăng nhập trên hai thiết bị thật
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-01.4 đạt.
**Lịch:** Nhạn · 4 giờ · 1 Story Points · 03/11 chiều → 03/11 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-01.4; luật ở BA-SCOPE-DECISIONS.md.

---

<a id="ep-02"></a>
## EP-02 · Tạo phòng

| Trường | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | EP-02 · Tạo phòng |
| Parent (Epic) | — |
| Assignee | Tình |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 26/10/2026 |
| Sprint | — |
| Fix version | v0.3 |
| Original Estimate | — |
| Story Points | — |
| Labels | `EP-02`, `dac-ta` |
| Yêu cầu khách hàng | YC2 |
| Story con | US-02.1, US-02.2 |
| Số Task / tổng giờ | 6 Task · 72 giờ |
| Tổng điểm các Task | 16 |

**Description**

Tạo phòng, ghế Đỏ/Đen, Đổi ghế/Xin đổi bên, Sẵn sàng và đếm ngược, chuyển Host, ở lại phòng sau ván.

Yêu cầu khách hàng: YC2. Story: US-02.1, US-02.2.

### US-02.1 · Tạo phòng, ghế và bắt đầu ván

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-02.1 · Tạo phòng, ghế và bắt đầu ván |
| Parent (Epic) | EP-02 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 15/10/2026 |
| Sprint | — |
| Fix version | v0.2 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-02` |
| Hạn theo R1 | 15/10 (ngày Task đầu tiên bắt đầu) |
| Thi công | XIAN Sprint 2 · Task đầu 15/10 → Task cuối 21/10 |
| Task thực hiện | T18, T21, T28 (3 Task · 48 giờ) |
| Tổng điểm các Task | 10 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** người dùng hoặc Khách, **tôi muốn** tạo phòng với tên, mức giờ, số người xem rồi cùng đối thủ Sẵn sàng để bắt đầu, **để** so tài với người mình mời.
*Nguồn:* BA 2.1, 2.3 mục 1, 2.7 mục 1, 2.8 mục 1. *Màn hình:* `MODAL-CREATE-ROOM`, `SCR-WAITING-ROOM`.
*Nguồn:* BA 2.3 mục 1, 3, 4, 5; 2.8 mục 4; 8.3. *Màn hình:* `SCR-WAITING-ROOM`.
*Sprint:* S2. *Story Points:* **10** (tổng điểm 3 Task, 48 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-02.1.1 | Ở Sảnh, không ngồi ghế nơi khác | Bấm "Tạo phòng" | Mở form: Tên phòng (1–60 ký tự), Mức giờ 5/10/15 phút (**mặc định 10**), Người xem *Không có người xem* hoặc 1–5 (**mặc định 5**) | E2E |
| AC-02.1.2 | Form | Tên phòng rỗng, > 60 ký tự hoặc chứa từ cấm | Từ chối, báo lỗi tại ô | U, E2E |
| AC-02.1.3 | Form hợp lệ | Bấm Tạo | Phòng tạo ở `CODE_ONLY`, có mã 8 ký tự do máy chủ sinh và link mời; người tạo là Host, ngồi **ghế Đỏ**; vào `/rooms/:id` trạng thái `WAITING` | E2E |
| AC-02.1.4 | Phòng đã tạo | Tìm cách đổi mức giờ hoặc số người xem | Không có chức năng đổi | M |
| AC-02.1.5 | Sức chứa | Kiểm tra | = 2 + số người xem đã chọn (tối đa 7) | U |
| AC-02.1.6 | Chỉ có một người ngồi ghế (Host) | Bấm "Đổi ghế" | Chuyển Đỏ ↔ Đen tùy thích, không cần ai duyệt | E2E |
| AC-02.1.7 | Đủ hai người | Mỗi người bấm "Sẵn sàng"/huỷ Sẵn sàng | Trạng thái hiển thị realtime cho cả phòng | E2E |
| AC-02.1.8 | Cả hai Sẵn sàng | Hệ thống | Đếm **3… 2… 1…** kèm âm thanh; hết đếm, máy chủ kiểm lại hai ghế, Sẵn sàng và kết nối rồi tạo ván (Match ID mới), chuyển `SCR-GAME-ROOM`, đồng hồ Đỏ chạy | E2E |
| AC-02.1.9 | Đang đếm | Một người mất kết nối | Huỷ đếm, Sẵn sàng của cả hai về chưa sẵn sàng, giữ ghế người mất kết nối 60 giây; không tạo ván, không xử thua | I, E2E |
| AC-02.1.10 | Phòng `WAITING` | Thành phần người ngồi ghế thay đổi | Sẵn sàng của cả hai reset | I |
| AC-02.1.11 | Host rời phòng `WAITING` khi còn người chơi thứ hai | Host rời | Quyền Host chuyển cho người chơi còn lại | E2E |
| AC-02.1.12 | Không còn người ngồi ghế (Host rời khi chỉ một mình, hoặc người cuối mất ghế sau 60 giây) | Hệ thống | Phòng `CLOSED`; người xem về Sảnh với thông báo *"Phòng đã đóng"*; chat phòng bị xoá | I, E2E |
| AC-02.1.13 | Host chỉ ngồi một mình rất lâu | Không ai vào | Phòng **không** tự đóng do chờ lâu (BA 0.10) | M |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 15/10 (trước khi Task đầu tiên bắt đầu). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 2.

#### T18 · BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T18 · BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host |
| Parent (Epic) | EP-02 |
| Assignee | Cường |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 15/10/2026 |
| Due date | 17/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 24 giờ |
| Story Points | 5 |
| Labels | `sprint-2`, `phat-trien` |
| Story (relates to) | US-02.1 |
| Is blocked by | T12, T14 |

**Description**

**Mục tiêu:** BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host — phục vụ US-02.1 Tạo phòng, ghế và bắt đầu ván (EP-02 Tạo phòng).
**Đầu vào (phải xong trước):** T12 (Khung realtime Socket.IO), T14 (Lược đồ CSDL P1, RLS, migration, dữ liệu mẫu).
**Việc cần làm:**
- API tạo phòng (tên, mức giờ 5/10/15, số người xem 0–5), mã 8 ký tự, link mời; Host ngồi Đỏ; phòng mặc định CODE_ONLY
- Ghế, Đổi ghế tự do khi một người ngồi ghế, Sẵn sàng, đếm 3-2-1 (huỷ khi mất kết nối), phát sự kiện bắt đầu ván theo hợp đồng
- Chuyển Host, đóng phòng khi không còn người ngồi ghế, giới hạn 1 phòng cho Khách
**Đầu ra:** Dịch vụ phòng + test tích hợp.
**Cách kiểm và điều kiện PASS:** AC U/I của US-02.1. PASS khi test tích hợp xanh cho tạo phòng, Sẵn sàng/đếm, mất kết nối khi đếm, chuyển Host, đóng phòng.
**Lịch:** Cường · 24 giờ · 5 Story Points · 15/10 sáng → 17/10 chiều · XIAN Sprint 2.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-02.1; luật ở BA-SCOPE-DECISIONS.md.

#### T21 · FE hộp Tạo phòng và phòng chờ: ghế, Sẵn sàng, đếm ngược

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T21 · FE hộp Tạo phòng và phòng chờ: ghế, Sẵn sàng, đếm ngược |
| Parent (Epic) | EP-02 |
| Assignee | Nhạn |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 18/10/2026 |
| Due date | 19/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 16 giờ |
| Story Points | 3 |
| Labels | `sprint-2`, `phat-trien` |
| Story (relates to) | US-02.1 |
| Is blocked by | T03, T18 |

**Description**

**Mục tiêu:** FE hộp Tạo phòng và phòng chờ: ghế, Sẵn sàng, đếm ngược — phục vụ US-02.1 Tạo phòng, ghế và bắt đầu ván (EP-02 Tạo phòng).
**Đầu vào (phải xong trước):** T03 (Khung giao diện chung: theme, layout, router, thành phần 5 trạng thái), T18 (BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host).
**Việc cần làm:**
- `MODAL-CREATE-ROOM` (kiểm tra trường), trang phòng chờ: hai ghế, Đổi ghế (khi một người), Sẵn sàng, đếm 3-2-1 có âm thanh
- Hiển thị Host, trạng thái realtime, đủ 5 trạng thái
**Đầu ra:** Màn Tạo phòng và phòng chờ nối với API thật.
**Cách kiểm và điều kiện PASS:** AC E2E của US-02.1. PASS khi Playwright tạo phòng và hai trình duyệt cùng Sẵn sàng để vào ván.
**Lịch:** Nhạn · 16 giờ · 3 Story Points · 18/10 sáng → 19/10 chiều · XIAN Sprint 2.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-02.1; luật ở BA-SCOPE-DECISIONS.md.

#### T28 · Kiểm thử US-02.1

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T28 · Kiểm thử US-02.1 |
| Parent (Epic) | EP-02 |
| Assignee | Kỳ |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 21/10/2026 |
| Due date | 21/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 8 giờ |
| Story Points | 2 |
| Labels | `sprint-2`, `kiem-thu` |
| Story (relates to) | US-02.1 |
| Is blocked by | T26 |

**Description**

**Mục tiêu:** Kiểm thử US-02.1 — phục vụ US-02.1 Tạo phòng, ghế và bắt đầu ván (EP-02 Tạo phòng).
**Đầu vào (phải xong trước):** T26 (FE Chia sẻ phòng, nhập mã ở Sảnh, tự vào phòng sau đăng nhập).
**Việc cần làm:**
- Chạy TC của US-02.1 với hai trình duyệt
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-02.1 đạt.
**Lịch:** Kỳ · 8 giờ · 2 Story Points · 21/10 sáng → 21/10 chiều · XIAN Sprint 2.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-02.1; luật ở BA-SCOPE-DECISIONS.md.

### US-02.2 · Xin đổi bên và ở lại phòng sau ván

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-02.2 · Xin đổi bên và ở lại phòng sau ván |
| Parent (Epic) | EP-02 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 26/10/2026 |
| Sprint | — |
| Fix version | v0.3 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-02` |
| Hạn theo R1 | 26/10 (ngày Task đầu tiên bắt đầu) |
| Thi công | XIAN Sprint 3 · Task đầu 26/10 → Task cuối 28/10 |
| Task thực hiện | T41, T46, T50 (3 Task · 24 giờ) |
| Tổng điểm các Task | 6 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** người chơi, **tôi muốn** đề nghị đổi Đỏ/Đen và ở lại phòng để đánh tiếp sau mỗi ván, **để** chọn tiếp tục hay đổi phe mà không phải tạo phòng mới.
*Nguồn:* BA 0.6, 2.3 mục 2, 3.6. *Màn hình:* `SCR-WAITING-ROOM`, `MODAL-SIDE-SWAP-PROMPT`.
*Nguồn:* BA 0.7. *Màn hình:* `MODAL-MATCH-RESULT`, `SCR-WAITING-ROOM`.
*Sprint:* S3. *Story Points:* **6** (tổng điểm 3 Task, 24 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-02.2.1 | Phòng `WAITING` đủ hai người (vừa vào hoặc sau ván) | Xem cụm nút | Cả hai người chơi có nút "Xin đổi bên"; người xem không có | E2E |
| AC-02.2.2 | A bấm "Xin đổi bên" | B nhận | B thấy `MODAL-SIDE-SWAP-PROMPT` đếm 30 giây với "Đồng ý"/"Từ chối"; A thấy trạng thái chờ và nút "Rút đề nghị" | E2E |
| AC-02.2.3 | B bấm "Đồng ý" | Hệ thống | Hai người hoán đổi Đỏ ↔ Đen; Sẵn sàng của cả hai về chưa sẵn sàng | E2E |
| AC-02.2.4 | B từ chối hoặc hết 30 giây | A muốn gửi lại | Nút của A `DISABLED` 60 giây kèm tooltip đếm giây còn lại | E2E |
| AC-02.2.5 | A đang có đề nghị chờ | A bấm lại | Không gửi được đề nghị thứ hai (tối đa 1 đề nghị chờ) | I |
| AC-02.2.6 | Đề nghị đang chờ | Cả hai Sẵn sàng và bắt đầu đếm, hoặc một người rời ghế | Đề nghị tự huỷ | I |
| AC-02.2.7 | Đang đếm 3-2-1 hoặc đang ván | Xem cụm nút | Không có nút "Xin đổi bên" | E2E |
| AC-02.2.8 | Ván vừa kết thúc | Hệ thống | Hộp kết quả có "Ở lại phòng" và "Rời phòng"; phòng đã ở `WAITING`, Sẵn sàng của cả hai = chưa | E2E |
| AC-02.2.9 | Bấm "Ở lại phòng" | Hệ thống | Về phòng chờ; giữ nguyên ghế/phe, người xem, chế độ phòng, mức giờ, Host, Kênh Riêng và Kênh Chung | E2E |
| AC-02.2.10 | Cả hai Sẵn sàng | Hệ thống | Ván mới với Match ID mới, đồng hồ đặt lại đầy đủ theo mức giờ phòng | E2E |
| AC-02.2.11 | Một người chơi bấm "Rời phòng" | Hệ thống | Ghế đó trống; phòng vẫn `WAITING`; Host chuyển cho người còn lại nếu người rời là Host; phòng `LOCKED` vẫn khoá | E2E |
| AC-02.2.12 | Sau ván, không ai rời | 10 phút trôi qua | Phòng **không** tự đóng | I |
| AC-02.2.13 | Người thứ hai vừa ngồi vào ghế còn lại | Xem cụm nút | Nút "Đổi ghế" biến mất, chỉ còn "Xin đổi bên" (US-02.2); người thứ hai rời ghế thì "Đổi ghế" xuất hiện lại | E2E |
| AC-02.2.14 | Hộp kết quả | Nút | Chỉ có "Ở lại phòng" và "Rời phòng" (không Tái đấu, không Xem lại) | E2E |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 26/10 (trước khi Task đầu tiên bắt đầu). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 3.

#### T41 · BE Xin đổi bên và phòng về chờ sau ván

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T41 · BE Xin đổi bên và phòng về chờ sau ván |
| Parent (Epic) | EP-02 |
| Assignee | Tùng |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 26/10/2026 |
| Due date | 27/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 12 giờ |
| Story Points | 3 |
| Labels | `sprint-3`, `phat-trien` |
| Story (relates to) | US-02.2 |
| Is blocked by | T18, T20 |

**Description**

**Mục tiêu:** BE Xin đổi bên và phòng về chờ sau ván — phục vụ US-02.2 Xin đổi bên và ở lại phòng sau ván (EP-02 Tạo phòng).
**Đầu vào (phải xong trước):** T18 (BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host), T20 (BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván).
**Việc cần làm:**
- Xin đổi bên khi phòng chờ có đủ 2 người: 30 giây, đồng ý → hoán đổi + reset Sẵn sàng, từ chối → chờ 60 giây, 1 đề nghị chờ, tự huỷ khi đếm hoặc đổi ghế
- Sau ván: phòng về WAITING ngay, giữ ghế/người xem/chế độ/mức giờ, không hạn đóng 10 phút
**Đầu ra:** API đổi bên và vòng đời sau ván + test tích hợp.
**Cách kiểm và điều kiện PASS:** AC U/I của US-02.2. PASS khi test tích hợp xanh.
**Lịch:** Tùng · 12 giờ · 3 Story Points · 26/10 sáng → 27/10 sáng · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-02.2; luật ở BA-SCOPE-DECISIONS.md.

#### T46 · FE hộp Xin đổi bên, Ở lại phòng / Rời phòng

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T46 · FE hộp Xin đổi bên, Ở lại phòng / Rời phòng |
| Parent (Epic) | EP-02 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 27/10/2026 |
| Due date | 28/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 8 giờ |
| Story Points | 2 |
| Labels | `sprint-3`, `phat-trien` |
| Story (relates to) | US-02.2 |
| Is blocked by | T25, T41 |

**Description**

**Mục tiêu:** FE hộp Xin đổi bên, Ở lại phòng / Rời phòng — phục vụ US-02.2 Xin đổi bên và ở lại phòng sau ván (EP-02 Tạo phòng).
**Đầu vào (phải xong trước):** T25 (FE phòng thi đấu: nối nước đi, đồng hồ, hộp kết quả), T41 (BE Xin đổi bên và phòng về chờ sau ván).
**Việc cần làm:**
- Nút Xin đổi bên, `MODAL-SIDE-SWAP-PROMPT`, trạng thái chờ + Rút đề nghị, nút Đổi ghế ẩn khi đủ 2 người
- Hộp kết quả: Ở lại phòng / Rời phòng
**Đầu ra:** Giao diện đổi bên và sau ván.
**Cách kiểm và điều kiện PASS:** AC E2E của US-02.2. PASS khi Playwright đổi bên thành công và đánh ván thứ hai trong cùng phòng.
**Lịch:** Tình · 8 giờ · 2 Story Points · 27/10 chiều → 28/10 sáng · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-02.2; luật ở BA-SCOPE-DECISIONS.md.

#### T50 · Kiểm thử US-02.2

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T50 · Kiểm thử US-02.2 |
| Parent (Epic) | EP-02 |
| Assignee | Nhạn |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 28/10/2026 |
| Due date | 28/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 4 giờ |
| Story Points | 1 |
| Labels | `sprint-3`, `kiem-thu` |
| Story (relates to) | US-02.2 |
| Is blocked by | T46 |

**Description**

**Mục tiêu:** Kiểm thử US-02.2 — phục vụ US-02.2 Xin đổi bên và ở lại phòng sau ván (EP-02 Tạo phòng).
**Đầu vào (phải xong trước):** T46 (FE hộp Xin đổi bên, Ở lại phòng / Rời phòng).
**Việc cần làm:**
- Chạy TC của US-02.2
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-02.2 đạt.
**Lịch:** Nhạn · 4 giờ · 1 Story Points · 28/10 chiều → 28/10 chiều · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-02.2; luật ở BA-SCOPE-DECISIONS.md.

---

<a id="ep-03"></a>
## EP-03 · Mời vào phòng

| Trường | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | EP-03 · Mời vào phòng |
| Parent (Epic) | — |
| Assignee | Tình |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 22/10/2026 |
| Sprint | — |
| Fix version | v0.3 |
| Original Estimate | — |
| Story Points | — |
| Labels | `EP-03`, `dac-ta` |
| Yêu cầu khách hàng | YC3 |
| Story con | US-03.1, US-03.2 |
| Số Task / tổng giờ | 6 Task · 80 giờ |
| Tổng điểm các Task | 17 |

**Description**

Mời bằng link/mã 8 ký tự cho người chưa kết bạn; kết bạn và mời bạn đang online ngay trong game.

Yêu cầu khách hàng: YC3. Story: US-03.1, US-03.2.

### US-03.1 · Mời bằng link/mã và vào phòng

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-03.1 · Mời bằng link/mã và vào phòng |
| Parent (Epic) | EP-03 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 18/10/2026 |
| Sprint | — |
| Fix version | v0.2 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-03` |
| Hạn theo R1 | 18/10 (ngày Task đầu tiên bắt đầu) |
| Thi công | XIAN Sprint 2 · Task đầu 18/10 → Task cuối 21/10 |
| Task thực hiện | T22, T26, T29 (3 Task · 32 giờ) |
| Tổng điểm các Task | 7 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** người được mời (kể cả chưa kết bạn), **tôi muốn** vào phòng bằng link hoặc mã, **để** chơi hoặc xem ngay.
*Nguồn:* BA 2.4, 2.6, 2.7, 2.8, 4.2, 0.3. *Màn hình:* `MODAL-INVITE`, `SCR-LOBBY`, `SCR-LOGIN`, `SCR-ACCESS-DENIED`.
*Sprint:* S2. *Story Points:* **7** (tổng điểm 3 Task, 32 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-03.1.1 | Người chơi trong phòng | Mở "Chia sẻ phòng" | Thấy link và mã 8 ký tự (chữ monospace) với nút Sao chép; P1 không có QR | E2E |
| AC-03.1.2 | Đã đăng nhập | Mở link mời hoặc nhập mã ở Sảnh | Vào phòng ngay, không cần kết bạn với Host | E2E |
| AC-03.1.3 | Chưa đăng nhập | Mở link mời | Thấy màn Đăng nhập/Đăng ký; sau khi đăng nhập hoặc đăng ký xong thì **tự vào đúng phòng** (đường vào bằng Khách: xem US-01.3), không phải mở link lần hai | E2E |
| AC-03.1.4 | Vào phòng | Còn ghế trống | Được xếp vào ghế trống (Host Đỏ → vào Đen và ngược lại) | E2E |
| AC-03.1.5 | Vào phòng | Hai ghế đã kín, còn chỗ xem | Vào làm Người xem, thông báo *"Ghế đấu đã đủ 2 người, bạn đang tham gia phòng với vai trò Người xem."* | E2E |
| AC-03.1.6 | Vào phòng | Phòng đã đủ sức chứa (hoặc "Không có người xem" và đủ 2 ghế) | `SCR-ACCESS-DENIED`: *"Phòng thi đấu đã đầy người, vui lòng chọn phòng khác!"* + nút "Quay về Sảnh chính" | E2E |
| AC-03.1.7 | Mã sai hoặc phòng đã đóng | Nhập mã | Báo *"Mã phòng không tồn tại hoặc phòng đã đóng"* | E2E |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 18/10 (trước khi Task đầu tiên bắt đầu). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 2.

#### T22 · BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T22 · BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập |
| Parent (Epic) | EP-03 |
| Assignee | Tùng |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 18/10/2026 |
| Due date | 19/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 16 giờ |
| Story Points | 3 |
| Labels | `sprint-2`, `phat-trien` |
| Story (relates to) | US-03.1 |
| Is blocked by | T18 |

**Description**

**Mục tiêu:** BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập — phục vụ US-03.1 Mời bằng link/mã và vào phòng (EP-03 Mời vào phòng).
**Đầu vào (phải xong trước):** T18 (BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host).
**Việc cần làm:**
- API vào phòng bằng mã/link: xếp ghế trống, hết ghế làm người xem nếu còn chỗ, đầy thì từ chối
- Lưu đích chuyển hướng khi chưa đăng nhập để tự vào phòng sau đăng nhập/đăng ký
**Đầu ra:** API vào phòng + test tích hợp.
**Cách kiểm và điều kiện PASS:** AC U/I của US-03.1. PASS khi test tích hợp xanh cho ghế trống, người xem, phòng đầy, mã sai.
**Lịch:** Tùng · 16 giờ · 3 Story Points · 18/10 sáng → 19/10 chiều · XIAN Sprint 2.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-03.1; luật ở BA-SCOPE-DECISIONS.md.

#### T26 · FE Chia sẻ phòng, nhập mã ở Sảnh, tự vào phòng sau đăng nhập

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T26 · FE Chia sẻ phòng, nhập mã ở Sảnh, tự vào phòng sau đăng nhập |
| Parent (Epic) | EP-03 |
| Assignee | Nhạn |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 20/10/2026 |
| Due date | 20/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 8 giờ |
| Story Points | 2 |
| Labels | `sprint-2`, `phat-trien` |
| Story (relates to) | US-03.1 |
| Is blocked by | T21, T22 |

**Description**

**Mục tiêu:** FE Chia sẻ phòng, nhập mã ở Sảnh, tự vào phòng sau đăng nhập — phục vụ US-03.1 Mời bằng link/mã và vào phòng (EP-03 Mời vào phòng).
**Đầu vào (phải xong trước):** T21 (FE hộp Tạo phòng và phòng chờ: ghế, Sẵn sàng, đếm ngược), T22 (BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập).
**Việc cần làm:**
- `MODAL-INVITE` phần link + mã (Sao chép), ô nhập mã ở Sảnh, tự chuyển vào phòng sau đăng nhập
- `SCR-ACCESS-DENIED` cho phòng đầy/mã sai
**Đầu ra:** Luồng mời bằng link/mã chạy với API thật.
**Cách kiểm và điều kiện PASS:** AC E2E của US-03.1. PASS khi Playwright: người thứ hai vào bằng mã, người thứ ba thành người xem, phòng đầy bị từ chối.
**Lịch:** Nhạn · 8 giờ · 2 Story Points · 20/10 sáng → 20/10 chiều · XIAN Sprint 2.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-03.1; luật ở BA-SCOPE-DECISIONS.md.

#### T29 · Kiểm thử US-03.1

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T29 · Kiểm thử US-03.1 |
| Parent (Epic) | EP-03 |
| Assignee | Thư |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 21/10/2026 |
| Due date | 21/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 8 giờ |
| Story Points | 2 |
| Labels | `sprint-2`, `kiem-thu` |
| Story (relates to) | US-03.1 |
| Is blocked by | T26 |

**Description**

**Mục tiêu:** Kiểm thử US-03.1 — phục vụ US-03.1 Mời bằng link/mã và vào phòng (EP-03 Mời vào phòng).
**Đầu vào (phải xong trước):** T26 (FE Chia sẻ phòng, nhập mã ở Sảnh, tự vào phòng sau đăng nhập).
**Việc cần làm:**
- Chạy TC của US-03.1 (đăng nhập, chưa đăng nhập, phòng đầy)
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-03.1 đạt.
**Lịch:** Thư · 8 giờ · 2 Story Points · 21/10 sáng → 21/10 chiều · XIAN Sprint 2.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-03.1; luật ở BA-SCOPE-DECISIONS.md.

### US-03.2 · Bạn bè và mời bạn online

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-03.2 · Bạn bè và mời bạn online |
| Parent (Epic) | EP-03 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 22/10/2026 |
| Sprint | — |
| Fix version | v0.3 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-03` |
| Hạn theo R1 | 22/10 (ngày Task đầu tiên bắt đầu) |
| Thi công | XIAN Sprint 3 · Task đầu 22/10 → Task cuối 28/10 |
| Task thực hiện | T31, T40, T49 (3 Task · 48 giờ) |
| Tổng điểm các Task | 10 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** người dùng, **tôi muốn** kết bạn, biết bạn nào đang online và mời họ vào phòng ngay trong game, **để** rủ bạn chơi chỉ với một chạm.
*Nguồn:* BA 5.5, Phần 11 (Bạn bè P1 tối thiểu). *Màn hình:* `SCR-FRIENDS`.
*Nguồn:* BA 5.5 mục 4–5, 1.8 (hàng đợi). *Màn hình:* `SCR-FRIENDS`, `PANEL-NAVBAR`.
*Nguồn:* BA 2.5, 2.7 mục 3, 2.8, 4.3. *Màn hình:* `MODAL-INVITE`.
*Sprint:* S3. *Story Points:* **10** (tổng điểm 3 Task, 48 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-03.2.1 | Ở `SCR-FRIENDS` | Gõ tiền tố username (không phân biệt hoa thường) | Hiện kết quả gồm avatar, Display Name, `@username`, nút "Kết bạn"; không hiện Khách | E2E |
| AC-03.2.2 | Chưa là bạn | Bấm "Kết bạn" | Bên kia thấy lời mời ở tab "Lời mời kết bạn đang chờ" và ở chuông | E2E |
| AC-03.2.3 | Có lời mời đến | Bấm "Chấp nhận" / "Từ chối" | Chấp nhận → cả hai thấy nhau trong danh sách bạn; Từ chối → lời mời biến mất | E2E |
| AC-03.2.4 | Đã gửi lời mời | Bấm thu hồi | Lời mời bị huỷ ở cả hai phía | I |
| AC-03.2.5 | Lời mời chờ quá 30 ngày | Hệ thống kiểm | Lời mời tự hết hạn | I |
| AC-03.2.6 | Đã có 200 bạn **hoặc** tổng lời mời chờ (gửi + nhận) = 50 | Gửi lời mời mới | Bị chặn kèm lý do | I |
| AC-03.2.7 | A đã bị B từ chối 2 lần | A gửi lại cho B | Không gửi được | I |
| AC-03.2.8 | A và B gửi lời mời cho nhau gần như cùng lúc | Máy chủ xử lý | Chỉ giữ **một** lời mời, không tự thành bạn; bên nhận phải Chấp nhận | I |
| AC-03.2.9 | Danh sách bạn | Bấm "Huỷ kết bạn" | Hai bên không còn trong danh sách của nhau | E2E |
| AC-03.2.10 | Bạn B mở ứng dụng (có kết nối) | A xem danh sách | B hiện 🟢 Online trong ≤ 5 giây, không cần tải lại | E2E |
| AC-03.2.11 | B ngồi ghế trong một phòng | A xem danh sách | B hiện 🟠 Đang đấu | E2E |
| AC-03.2.12 | B đóng mọi tab | A xem danh sách | B chuyển ⚫ Offline (sau khi hết thời gian nhận biết mất kết nối) | E2E |
| AC-03.2.13 | Có lời mời kết bạn đang chờ | Bấm chuông ở thanh điều hướng | Liệt kê lời mời, có số đếm | E2E |
| AC-03.2.14 | Ở `SCR-FRIENDS` | Nhìn nút "Nhắn tin", "Thách đấu" | `DISABLED` kèm tooltip *"Sắp ra mắt"*; trang không có nút mời vào phòng | E2E |
| AC-03.2.15 | Người dùng đang ngồi ghế phòng tự tạo | Mở "Chia sẻ phòng" | Có tab bạn bè; người xem không thấy nút Chia sẻ | E2E |
| AC-03.2.16 | Danh sách bạn trong tab | Xem nút "Mời" | 🟢 bấm được; ⚫ `DISABLED` nhãn *"Ngoại tuyến"*; 🟠 `DISABLED` tooltip *"Bạn bè đang trong ván khác"* | E2E |
| AC-03.2.17 | Gửi mời cho bạn 🟢 | Bạn nhận | Pop-up góc màn hình *"Người chơi [Tên] mời bạn tham gia phòng cờ [Tên phòng]"* với [Tham gia] [Từ chối], đếm lùi 30 giây | E2E |
| AC-03.2.18 | Pop-up đang hiện | Bấm "Tham gia" | Vào phòng theo 2.8: ghế trống → ghế; hết ghế → người xem nếu còn chỗ; đầy → `SCR-ACCESS-DENIED` | E2E |
| AC-03.2.19 | Pop-up | Không bấm trong 30 giây hoặc bấm "Từ chối" | Pop-up biến mất, lời mời hết hiệu lực; không lưu vào chuông | E2E |
| AC-03.2.20 | Lời mời đã gửi, sau đó phòng chuyển `LOCKED` | Người nhận bấm Tham gia | Bị từ chối (lời mời chưa dùng đã bị thu hồi) | I |
| AC-03.2.21 | Người được mời đang ngồi ghế phòng khác | Bấm Tham gia | Không được ngồi ghế thứ hai; thông báo theo AC-01.4.6 | I |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 22/10 (trước khi Task đầu tiên bắt đầu). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 3.

#### T31 · BE bạn bè, trạng thái online, mời bạn online vào phòng

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T31 · BE bạn bè, trạng thái online, mời bạn online vào phòng |
| Parent (Epic) | EP-03 |
| Assignee | Tùng |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 22/10/2026 |
| Due date | 24/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 24 giờ |
| Story Points | 5 |
| Labels | `sprint-3`, `phat-trien` |
| Story (relates to) | US-03.2 |
| Is blocked by | T22 |

**Description**

**Mục tiêu:** BE bạn bè, trạng thái online, mời bạn online vào phòng — phục vụ US-03.2 Bạn bè và mời bạn online (EP-03 Mời vào phòng).
**Đầu vào (phải xong trước):** T22 (BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập).
**Việc cần làm:**
- Tìm theo tiền tố username, lời mời kết bạn (gửi, nhận, thu hồi, hết hạn 30 ngày, giới hạn 200/50, bị từ chối 2 lần), huỷ kết bạn; Khách bị loại
- Trạng thái Online/Đang đấu/Offline realtime, chuông lời mời
- Mời bạn online vào phòng: pop-up 30 giây, Tham gia dùng API vào phòng, thu hồi khi phòng khoá
**Đầu ra:** API bạn bè, trạng thái, lời mời vào phòng + test tích hợp.
**Cách kiểm và điều kiện PASS:** AC U/I của US-03.2. PASS khi test tích hợp xanh.
**Lịch:** Tùng · 24 giờ · 5 Story Points · 22/10 sáng → 24/10 chiều · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-03.2; luật ở BA-SCOPE-DECISIONS.md.

#### T40 · FE màn Bạn bè, chuông, tab mời bạn bè, pop-up lời mời

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T40 · FE màn Bạn bè, chuông, tab mời bạn bè, pop-up lời mời |
| Parent (Epic) | EP-03 |
| Assignee | Nhạn |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 25/10/2026 |
| Due date | 27/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 16 giờ |
| Story Points | 3 |
| Labels | `sprint-3`, `phat-trien` |
| Story (relates to) | US-03.2 |
| Is blocked by | T31 |

**Description**

**Mục tiêu:** FE màn Bạn bè, chuông, tab mời bạn bè, pop-up lời mời — phục vụ US-03.2 Bạn bè và mời bạn online (EP-03 Mời vào phòng).
**Đầu vào (phải xong trước):** T31 (BE bạn bè, trạng thái online, mời bạn online vào phòng).
**Việc cần làm:**
- `SCR-FRIENDS` (tìm kiếm, hai tab, Nhắn tin/Thách đấu `DISABLED`), chuông ở thanh điều hướng
- Tab mời bạn bè trong `MODAL-INVITE` theo trạng thái, pop-up lời mời phía người nhận; ẩn với Khách
**Đầu ra:** Giao diện bạn bè và mời online.
**Cách kiểm và điều kiện PASS:** AC E2E của US-03.2. PASS khi Playwright kết bạn và mời bạn online vào phòng thành công.
**Lịch:** Nhạn · 16 giờ · 3 Story Points · 25/10 chiều → 27/10 sáng · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-03.2; luật ở BA-SCOPE-DECISIONS.md.

#### T49 · Kiểm thử US-03.2

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T49 · Kiểm thử US-03.2 |
| Parent (Epic) | EP-03 |
| Assignee | Kỳ |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 28/10/2026 |
| Due date | 28/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 8 giờ |
| Story Points | 2 |
| Labels | `sprint-3`, `kiem-thu` |
| Story (relates to) | US-03.2 |
| Is blocked by | T40 |

**Description**

**Mục tiêu:** Kiểm thử US-03.2 — phục vụ US-03.2 Bạn bè và mời bạn online (EP-03 Mời vào phòng).
**Đầu vào (phải xong trước):** T40 (FE màn Bạn bè, chuông, tab mời bạn bè, pop-up lời mời).
**Việc cần làm:**
- Chạy TC của US-03.2 với 3 tài khoản
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-03.2 đạt.
**Lịch:** Kỳ · 8 giờ · 2 Story Points · 28/10 sáng → 28/10 chiều · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-03.2; luật ở BA-SCOPE-DECISIONS.md.

---

<a id="ep-04"></a>
## EP-04 · Khởi tạo bàn cờ

| Trường | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | EP-04 · Khởi tạo bàn cờ |
| Parent (Epic) | — |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 15/10/2026 |
| Sprint | — |
| Fix version | v0.2 |
| Original Estimate | — |
| Story Points | — |
| Labels | `EP-04`, `dac-ta` |
| Yêu cầu khách hàng | YC4 |
| Story con | US-04.1, US-04.2, US-04.3 |
| Số Task / tổng giờ | 7 Task · 72 giờ |
| Tổng điểm các Task | 16 |

**Description**

Lõi luật cờ dùng chung, bàn cờ SVG quân chữ Hán, đi cờ bằng click/kéo thả, âm thanh.

Yêu cầu khách hàng: YC4. Story: US-04.1, US-04.2, US-04.3.

### US-04.1 · Lõi luật cờ dùng chung

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-04.1 · Lõi luật cờ dùng chung |
| Parent (Epic) | EP-04 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 09/10/2026 |
| Sprint | — |
| Fix version | v0.1 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-04` |
| Hạn theo R1 | 09/10 (ngày Task đầu tiên bắt đầu) |
| Thi công | XIAN Sprint 1 · Task đầu 09/10 → Task cuối 11/10 |
| Task thực hiện | T05, T07, T10 (3 Task · 24 giờ) |
| Tổng điểm các Task | 6 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** hệ thống, **tôi cần** một thư viện luật cờ duy nhất dùng cho máy chủ, client và máy cờ, **để** mọi nơi phân xử giống nhau.
*Nguồn:* BA 3.3 mục 1–2, 3.5. *Ghi chú:* `packages/xiangqi-core`, phủ unit test cao (mục tiêu ≥ 90% dòng).
*Sprint:* S1. *Story Points:* **6** (tổng điểm 3 Task, 24 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-04.1.1 | Thế khai cuộc | Sinh nước hợp lệ | Đúng 44 nước; perft độ sâu 2 = 1.920, độ sâu 3 = 79.666 (đối chiếu số perft công bố trước khi dùng làm chuẩn) | U |
| AC-04.1.2 | Bộ thế kiểm thử | Sinh nước | Đúng luật: cản chân Mã, chặn mắt Tượng, Tượng không qua sông, Sĩ/Tướng trong cung, Pháo cần đúng một ngòi khi ăn, Tốt qua sông được đi ngang và không lùi | U |
| AC-04.1.3 | Nước làm hai Tướng đối mặt không có quân chắn, hoặc để Tướng mình bị chiếu | Kiểm tra | Bị loại khỏi nước hợp lệ | U |
| AC-04.1.4 | Bên tới lượt bị chiếu và không còn nước hợp lệ | Kiểm kết thúc | `CHECKMATE` — bên đó thua | U |
| AC-04.1.5 | Bên tới lượt **không** bị chiếu nhưng hết nước | Kiểm kết thúc | `STALEMATE` — bên đó **thua** | U |
| AC-04.1.6 | Một thế lặp lần thứ 3 trên nhánh nước hiệu lực | Kiểm kết thúc | `DRAW_REPETITION`, trừ khi mọi nước của một bên trong chu kỳ đều là nước chiếu → `PERPETUAL_CHECK`, bên chiếu thua; cả hai cùng chiếu liên tục → hoà | U |
| AC-04.1.7 | 120 nửa nước liên tiếp không ăn quân | Kiểm kết thúc | `DRAW_NO_CAPTURE` | U |
| AC-04.1.8 | Nước cuối vừa chiếu hết vừa thoả điều kiện hoà | Kiểm kết thúc | Chiếu hết được ưu tiên | U |
| AC-04.1.9 | Bất kỳ thế cờ | Tuần tự hoá rồi đọc lại (chuỗi kiểu FEN nội bộ) | Thu được đúng thế cờ, lượt đi và bộ đếm | U |
| AC-04.1.10 | Hai thế có cùng vị trí mọi quân nhưng khác bên tới lượt | Kiểm lặp thế | Không tính là cùng một thế (BA 0.12) | U |
| AC-04.1.11 | Một thế xuất hiện lần thứ 3 trên nhánh nước hiệu lực | Xác định chu kỳ để xét chiếu liên tục | Chu kỳ gồm mọi nước từ lần xuất hiện thứ 1 đến lần thứ 3 của thế đó; bên chiếu ở **mọi** nước của mình trong chu kỳ là chiếu liên tục (BA 0.12) | U |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 09/10 (trước khi Task đầu tiên bắt đầu). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 1.

#### T05 · Lõi luật cờ (1/3): bàn cờ và nước đi, ăn quân của 7 loại quân

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T05 · Lõi luật cờ (1/3): bàn cờ và nước đi, ăn quân của 7 loại quân |
| Parent (Epic) | EP-04 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 09/10/2026 |
| Due date | 09/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 8 giờ |
| Story Points | 2 |
| Labels | `sprint-1`, `phat-trien` |
| Story (relates to) | US-04.1 |
| Is blocked by | T01 |

**Description**

**Mục tiêu:** Lõi luật cờ (1/3): bàn cờ và nước đi, ăn quân của 7 loại quân — phục vụ US-04.1 Lõi luật cờ dùng chung (EP-04 Khởi tạo bàn cờ).
**Đầu vào (phải xong trước):** T01 (Dựng monorepo, CI, nhật ký và /health).
**Việc cần làm:**
- Biểu diễn bàn cờ 9×10 và thế cờ; tuần tự hoá/đọc lại thế cờ (chuỗi kiểu FEN nội bộ)
- Sinh nước đi và ăn quân cho từng loại quân: Tướng và Sĩ (trong cung), Tượng (đi chéo 2 ô, bị chặn mắt, không qua sông), Xe (đi thẳng), Mã (bị cản chân), Pháo (đi như Xe, **ăn phải nhảy qua đúng một ngòi**), Tốt (chưa qua sông chỉ tiến, qua sông được đi ngang, không lùi)
- Unit test riêng cho từng loại quân, mỗi loại ít nhất một thế bị chặn và một thế ăn quân
**Đầu ra:** Hàm sinh nước giả hợp lệ (chưa xét tự chiếu) cho 7 loại quân trong `packages/xiangqi-core`.
**Cách kiểm và điều kiện PASS:** AC-04.1.2, AC-04.1.9 và phần "thế khai cuộc có đúng 44 nước" của AC-04.1.1. PASS khi unit test của cả 7 loại quân và test tuần tự hoá xanh trong CI.
**Lịch:** Tình · 8 giờ · 2 Story Points · 09/10 sáng → 09/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-04.1; luật ở BA-SCOPE-DECISIONS.md.

#### T07 · Lõi luật cờ (2/3): nước hợp lệ, chiếu, chiếu hết, hết nước

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T07 · Lõi luật cờ (2/3): nước hợp lệ, chiếu, chiếu hết, hết nước |
| Parent (Epic) | EP-04 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 10/10/2026 |
| Due date | 10/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 8 giờ |
| Story Points | 2 |
| Labels | `sprint-1`, `phat-trien` |
| Story (relates to) | US-04.1 |
| Is blocked by | T05 |

**Description**

**Mục tiêu:** Lõi luật cờ (2/3): nước hợp lệ, chiếu, chiếu hết, hết nước — phục vụ US-04.1 Lõi luật cờ dùng chung (EP-04 Khởi tạo bàn cờ).
**Đầu vào (phải xong trước):** T05 (Lõi luật cờ (1/3): bàn cờ và nước đi, ăn quân của 7 loại quân).
**Việc cần làm:**
- Lọc nước giả hợp lệ: loại nước làm hai Tướng đối mặt không có quân chắn và nước để Tướng mình bị chiếu
- Hàm kiểm tra đang bị chiếu; xác định chiếu hết (`CHECKMATE`) và hết nước không bị chiếu (`STALEMATE` — bên hết nước thua)
- API công khai `legalMoves(position)`, `isCheck(position)`, `applyMove(position, move)` để giao diện, máy chủ và máy cờ dùng chung
**Đầu ra:** Bộ sinh nước hợp lệ hoàn chỉnh và nhận biết chiếu/chiếu hết/hết nước.
**Cách kiểm và điều kiện PASS:** AC-04.1.3, AC-04.1.4, AC-04.1.5. PASS khi unit test các thế Tướng đối mặt, tự chiếu, chiếu hết và hết nước xanh trong CI.
**Lịch:** Tình · 8 giờ · 2 Story Points · 10/10 sáng → 10/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-04.1; luật ở BA-SCOPE-DECISIONS.md.

#### T10 · Lõi luật cờ (3/3): luật kết thúc ván, perft, độ phủ kiểm thử

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T10 · Lõi luật cờ (3/3): luật kết thúc ván, perft, độ phủ kiểm thử |
| Parent (Epic) | EP-04 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 11/10/2026 |
| Due date | 11/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 8 giờ |
| Story Points | 2 |
| Labels | `sprint-1`, `phat-trien` |
| Story (relates to) | US-04.1 |
| Is blocked by | T07 |

**Description**

**Mục tiêu:** Lõi luật cờ (3/3): luật kết thúc ván, perft, độ phủ kiểm thử — phục vụ US-04.1 Lõi luật cờ dùng chung (EP-04 Khởi tạo bàn cờ).
**Đầu vào (phải xong trước):** T07 (Lõi luật cờ (2/3): nước hợp lệ, chiếu, chiếu hết, hết nước).
**Việc cần làm:**
- Lịch sử thế cờ trên nhánh nước hiệu lực (thế giống nhau = cùng vị trí mọi quân **và** cùng bên tới lượt; chu kỳ = các nước từ lần xuất hiện thứ 1 đến lần thứ 3 — BA 0.12): lặp 3 lần → hoà, chiếu liên tục → bên chiếu thua (cả hai cùng chiếu → hoà), 120 nửa nước không ăn quân → hoà, chiếu hết được ưu tiên hơn mọi kết quả hoà
- Perft độ sâu 2 và 3 từ thế khai cuộc, đối chiếu số đã công bố
- Viết tài liệu ngắn cho API; đo độ phủ unit test của cả gói
**Đầu ra:** Gói `packages/xiangqi-core` hoàn chỉnh, có tài liệu và độ phủ ≥ 90%.
**Cách kiểm và điều kiện PASS:** AC-04.1.6, AC-04.1.7, AC-04.1.8 và phần perft của AC-04.1.1. PASS khi toàn bộ unit test xanh, perft khớp số công bố, độ phủ dòng ≥ 90%.
**Lịch:** Tình · 8 giờ · 2 Story Points · 11/10 sáng → 11/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-04.1; luật ở BA-SCOPE-DECISIONS.md.

### US-04.2 · Khởi tạo và hiển thị bàn cờ

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-04.2 · Khởi tạo và hiển thị bàn cờ |
| Parent (Epic) | EP-04 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 11/10/2026 |
| Sprint | — |
| Fix version | v0.1 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-04` |
| Hạn theo R1 | 11/10 (ngày Task đầu tiên bắt đầu) |
| Thi công | XIAN Sprint 1 · Task đầu 11/10 → Task cuối 13/10 |
| Task thực hiện | T11, T16 (2 Task · 20 giờ) |
| Tổng điểm các Task | 4 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** người chơi, **tôi muốn** thấy bàn cờ chuẩn với quân chữ Hán, **để** chơi quen thuộc như cờ thật.
*Nguồn:* BA 3.1, 6.3 mục 1, DESIGN §7. *Màn hình:* `SCR-GAME-ROOM`, `SCR-AI-GAME`.
*Sprint:* S1. *Story Points:* **4** (tổng điểm 2 Task, 20 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-04.2.1 | Ván mới | Bàn cờ hiện | SVG 9×10 giao điểm, sông, hai cung; 32 quân đúng vị trí; chữ Hán Đỏ 帥仕相俥傌炮兵, Đen 將士象車馬砲卒 | E2E, M |
| AC-04.2.2 | Người chơi cầm Đen | Bàn cờ hiện | Tự lật để Đen ở phía dưới | E2E |
| AC-04.2.3 | Màn hình 360 px và màn hình máy tính | Xem bàn cờ | Toàn bộ bàn cờ hiển thị không cuộn ngang, quân đủ lớn để chạm | M |
| AC-04.2.4 | Trình đọc màn hình / người mù màu | Tương tác | Quân có viền phân biệt bên; có nhãn văn bản cho quân và trạng thái lượt (WCAG 2.1 AA) | M |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 11/10 (trước khi Task đầu tiên bắt đầu). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 1.

#### T11 · FE bàn cờ SVG: vẽ, quân, lật bàn, responsive, nhãn trợ năng

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T11 · FE bàn cờ SVG: vẽ, quân, lật bàn, responsive, nhãn trợ năng |
| Parent (Epic) | EP-04 |
| Assignee | Kỳ |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 11/10/2026 |
| Due date | 12/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 16 giờ |
| Story Points | 3 |
| Labels | `sprint-1`, `phat-trien` |
| Story (relates to) | US-04.2 |
| Is blocked by | T01 |

**Description**

**Mục tiêu:** FE bàn cờ SVG: vẽ, quân, lật bàn, responsive, nhãn trợ năng — phục vụ US-04.2 Khởi tạo và hiển thị bàn cờ (EP-04 Khởi tạo bàn cờ).
**Đầu vào (phải xong trước):** T01 (Dựng monorepo, CI, nhật ký và /health).
**Việc cần làm:**
- Vẽ bàn cờ SVG 9×10, sông, cung; 32 quân chữ Hán theo DESIGN.md §7; lật bàn khi cầm Đen
- Co giãn từ 360 px, quân đủ lớn để chạm; nhãn trợ năng cho quân và lượt đi
**Đầu ra:** Component `<Board>` hiển thị từ một thế cờ cho trước.
**Cách kiểm và điều kiện PASS:** AC E2E/M của US-04.2. PASS khi: ảnh chụp đúng 32 quân đúng vị trí, lật đúng khi cầm Đen, hiển thị trọn ở 360 px.
**Lịch:** Kỳ · 16 giờ · 3 Story Points · 11/10 sáng → 12/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-04.2; luật ở BA-SCOPE-DECISIONS.md.

#### T16 · Kiểm thử US-04.2

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T16 · Kiểm thử US-04.2 |
| Parent (Epic) | EP-04 |
| Assignee | Thư |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 13/10/2026 |
| Due date | 13/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 4 giờ |
| Story Points | 1 |
| Labels | `sprint-1`, `kiem-thu` |
| Story (relates to) | US-04.2 |
| Is blocked by | T11 |

**Description**

**Mục tiêu:** Kiểm thử US-04.2 — phục vụ US-04.2 Khởi tạo và hiển thị bàn cờ (EP-04 Khởi tạo bàn cờ).
**Đầu vào (phải xong trước):** T11 (FE bàn cờ SVG: vẽ, quân, lật bàn, responsive, nhãn trợ năng).
**Việc cần làm:**
- Viết và chạy TC của US-04.2 trên Chrome, Firefox, Safari và một điện thoại thật
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-04.2 đạt, không còn lỗi Nghiêm trọng/Cao.
**Lịch:** Thư · 4 giờ · 1 Story Points · 13/10 sáng → 13/10 sáng · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-04.2; luật ở BA-SCOPE-DECISIONS.md.

### US-04.3 · Đi cờ bằng click/kéo thả và âm thanh

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-04.3 · Đi cờ bằng click/kéo thả và âm thanh |
| Parent (Epic) | EP-04 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 15/10/2026 |
| Sprint | — |
| Fix version | v0.2 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-04` |
| Hạn theo R1 | 15/10 (ngày Task đầu tiên bắt đầu) |
| Thi công | XIAN Sprint 2 · Task đầu 15/10 → Task cuối 20/10 |
| Task thực hiện | T19, T27 (2 Task · 28 giờ) |
| Tổng điểm các Task | 6 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** người chơi, **tôi muốn** đi quân bằng click hoặc kéo thả kèm gợi ý ô hợp lệ và tiếng gõ cờ, **để** đi nhanh, không nhầm và có cảm giác như cờ thật.
*Nguồn:* BA 3.4 mục 1–2, DESIGN §4, §7.4.
*Nguồn:* BA 3.4 mục 3.
*Sprint:* S2. *Story Points:* **6** (tổng điểm 2 Task, 28 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-04.3.1 | Tới lượt mình | Click/chạm vào quân mình | Quân có vòng chọn; chấm tròn ở mọi ô được đi; vòng cố định (không nhấp nháy) quanh quân đối phương ăn được | E2E |
| AC-04.3.2 | Đã chọn quân | Click ô hợp lệ | Quân đi tới ô đó | E2E |
| AC-04.3.3 | Đã chọn quân | Click lại quân, click ô không hợp lệ, hoặc nhấn `Esc` | Huỷ chọn | E2E |
| AC-04.3.4 | Tới lượt mình | Kéo thả (chuột hoặc chạm giữ) vào ô hợp lệ | Hạ quân thành công | E2E |
| AC-04.3.5 | Kéo thả | Thả vào ô không hợp lệ | Quân trượt mượt về chỗ cũ | E2E |
| AC-04.3.6 | Không phải lượt mình, hoặc là người xem | Bấm/kéo quân | Không chọn được quân | E2E |
| AC-04.3.7 | Vừa có nước đi | Bàn cờ | 4 góc vuông đánh dấu ô đi và ô đến của nước gần nhất (cả người chơi lẫn người xem thấy) | E2E |
| AC-04.3.8 | Một bên bị chiếu | Bàn cờ | Vòng cảnh báo quanh Tướng + chữ *"Đang bị chiếu"* + biểu tượng; tối đa một nhịp sáng, không nhấp nháy/rung; bật giảm chuyển động thì không có hiệu ứng | E2E, M |
| AC-04.3.9 | Âm thanh bật | Đi quân / ăn quân / chiếu / kết thúc ván | Phát đúng 4 âm khác nhau tạo bằng Web Audio API (không tải file âm thanh) | M |
| AC-04.3.10 | Góc trên bàn cờ | Bấm biểu tượng loa | Tắt/bật tất cả âm thanh bàn cờ ngay; lựa chọn giữ khi chuyển ván trong cùng phiên trình duyệt | E2E |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 15/10 (trước khi Task đầu tiên bắt đầu). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 2.

#### T19 · FE đi cờ click/kéo thả, gợi ý ô, đánh dấu, âm thanh

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T19 · FE đi cờ click/kéo thả, gợi ý ô, đánh dấu, âm thanh |
| Parent (Epic) | EP-04 |
| Assignee | Kỳ |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 15/10/2026 |
| Due date | 17/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 24 giờ |
| Story Points | 5 |
| Labels | `sprint-2`, `phat-trien` |
| Story (relates to) | US-04.3 |
| Is blocked by | T10, T11 |

**Description**

**Mục tiêu:** FE đi cờ click/kéo thả, gợi ý ô, đánh dấu, âm thanh — phục vụ US-04.3 Đi cờ bằng click/kéo thả và âm thanh (EP-04 Khởi tạo bàn cờ).
**Đầu vào (phải xong trước):** T10 (Lõi luật cờ (3/3): luật kết thúc ván, perft, độ phủ kiểm thử), T11 (FE bàn cờ SVG: vẽ, quân, lật bàn, responsive, nhãn trợ năng).
**Việc cần làm:**
- Chọn quân bằng click/chạm, kéo thả chuột và cảm ứng, trượt về khi thả sai; chấm ô hợp lệ, vòng quân ăn được (lấy từ `xiangqi-core`)
- Đánh dấu nước vừa đi (4 góc), cảnh báo chiếu không nhấp nháy, tôn trọng giảm chuyển động
- 4 âm thanh Web Audio API + nút tắt tiếng giữ trong phiên
**Đầu ra:** Bàn cờ chơi được hai bên trên một máy (chế độ thử).
**Cách kiểm và điều kiện PASS:** AC E2E của US-04.3. PASS khi Playwright đi được nước bằng click và kéo thả, nước sai bị từ chối.
**Lịch:** Kỳ · 24 giờ · 5 Story Points · 15/10 sáng → 17/10 chiều · XIAN Sprint 2.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-04.3; luật ở BA-SCOPE-DECISIONS.md.

#### T27 · Kiểm thử US-04.3

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T27 · Kiểm thử US-04.3 |
| Parent (Epic) | EP-04 |
| Assignee | Thư |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 20/10/2026 |
| Due date | 20/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 4 giờ |
| Story Points | 1 |
| Labels | `sprint-2`, `kiem-thu` |
| Story (relates to) | US-04.3 |
| Is blocked by | T19 |

**Description**

**Mục tiêu:** Kiểm thử US-04.3 — phục vụ US-04.3 Đi cờ bằng click/kéo thả và âm thanh (EP-04 Khởi tạo bàn cờ).
**Đầu vào (phải xong trước):** T19 (FE đi cờ click/kéo thả, gợi ý ô, đánh dấu, âm thanh).
**Việc cần làm:**
- Chạy TC của US-04.3 trên máy tính và điện thoại
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-04.3 đạt.
**Lịch:** Thư · 4 giờ · 1 Story Points · 20/10 sáng → 20/10 sáng · XIAN Sprint 2.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-04.3; luật ở BA-SCOPE-DECISIONS.md.

---

<a id="ep-05"></a>
## EP-05 · Hai người đánh cờ online

| Trường | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | EP-05 · Hai người đánh cờ online |
| Parent (Epic) | — |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 29/10/2026 |
| Sprint | — |
| Fix version | v1.0 |
| Original Estimate | — |
| Story Points | — |
| Labels | `EP-05`, `dac-ta` |
| Yêu cầu khách hàng | YC5 |
| Story con | US-05.1, US-05.2, US-05.3 |
| Số Task / tổng giờ | 9 Task · 100 giờ |
| Tổng điểm các Task | 22 |

**Description**

Máy chủ phân xử nước đi, đồng hồ, kết thúc ván, đầu hàng, xin hoà, mất kết nối và nối lại.

Yêu cầu khách hàng: YC5. Story: US-05.1, US-05.2, US-05.3.

### US-05.1 · Ván online: đi cờ, đồng hồ và kết thúc ván

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-05.1 · Ván online: đi cờ, đồng hồ và kết thúc ván |
| Parent (Epic) | EP-05 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 15/10/2026 |
| Sprint | — |
| Fix version | v0.2 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-05` |
| Hạn theo R1 | 15/10 (ngày Task đầu tiên bắt đầu) |
| Thi công | XIAN Sprint 2 · Task đầu 15/10 → Task cuối 21/10 |
| Task thực hiện | T20, T23, T25, T30 (4 Task · 56 giờ) |
| Tổng điểm các Task | 12 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** người chơi, **tôi muốn** nước đi được máy chủ phân xử và đồng bộ ngay, đồng hồ chính xác và kết quả rõ ràng, **để** ván đấu công bằng.
*Nguồn:* BA 3.3 mục 1, 4.3 mục 2. *Phụ thuộc:* US-00.3, US-05.1.
*Nguồn:* BA 2.1, 3.3 mục 3.
*Nguồn:* BA 3.3, 3.5 mục 5, 0.7. *Màn hình:* `MODAL-MATCH-RESULT`.
*Sprint:* S2. *Story Points:* **12** (tổng điểm 4 Task, 56 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-05.1.1 | Tới lượt A | A đi nước hợp lệ | Máy chủ chấp nhận; B và mọi người xem thấy nước đi (mục tiêu < 100 ms trong môi trường demo, NFR-01) | I, E2E |
| AC-05.1.2 | Client bị sửa để gửi nước sai luật hoặc đi khi không tới lượt | Máy chủ nhận | Từ chối; bàn cờ client đồng bộ lại theo máy chủ | I |
| AC-05.1.3 | Mạng chập chờn gửi trùng lệnh | Máy chủ nhận | Nước đi chỉ áp dụng một lần (AC-00.3.2) | I |
| AC-05.1.4 | Ván đang diễn ra | Mỗi nước | Nước đi được lưu bền (`match_moves`) theo NFR-09 | I |
| AC-05.1.5 | Ván bắt đầu | Hệ thống | Hai đồng hồ theo mức giờ phòng (5/10/15 phút), chỉ đồng hồ bên tới lượt chạy, không cộng giây | E2E |
| AC-05.1.6 | Đồng hồ một bên về 0 | Máy chủ | Kết thúc ván, bên đó thua `TIMEOUT` | I, E2E |
| AC-05.1.7 | Nước đi tới máy chủ khi đồng hồ người đi đã về 0 | Máy chủ xử lý | Tính giờ trước: xử `TIMEOUT`, không chấp nhận nước | I |
| AC-05.1.8 | Client bị lệch đồng hồ hoặc tab bị ẩn | Quay lại | Đồng hồ hiển thị khớp máy chủ (sai số ≤ 1 giây) | E2E |
| AC-05.1.9 | Một điều kiện kết thúc xảy ra (US-04.1) | Máy chủ | Tự kết thúc ván, không cần ai bấm | I |
| AC-05.1.10 | Ván kết thúc | Hai người chơi | Hộp kết quả: Thắng/Thua/Hoà + lý do tiếng Việt cho mọi lý do P1: chiếu hết, hết nước đi, đầu hàng, hết giờ, mất kết nối, lặp thế, thoả thuận hoà, không ăn quân 120 nửa nước, chiếu liên tục, bị gián đoạn | E2E |
| AC-05.1.11 | Ván kết thúc | Người xem | Thấy kết quả và lý do (không có nút của người chơi) | E2E |
| AC-05.1.12 | Ván kết thúc | Dữ liệu | Kết quả, lý do, thời điểm lưu bền ở `matches` | I |
| AC-05.1.13 | Người xem | Mở phòng | Thấy bàn cờ cùng hướng Đỏ ở dưới, không thao tác được quân | E2E |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 15/10 (trước khi Task đầu tiên bắt đầu). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 2.

#### T20 · BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T20 · BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván |
| Parent (Epic) | EP-05 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 15/10/2026 |
| Due date | 17/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 24 giờ |
| Story Points | 5 |
| Labels | `sprint-2`, `phat-trien` |
| Story (relates to) | US-05.1 |
| Is blocked by | T10, T12 |

**Description**

**Mục tiêu:** BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván — phục vụ US-05.1 Ván online: đi cờ, đồng hồ và kết thúc ván (EP-05 Hai người đánh cờ online).
**Đầu vào (phải xong trước):** T10 (Lõi luật cờ (3/3): luật kết thúc ván, perft, độ phủ kiểm thử), T12 (Khung realtime Socket.IO).
**Việc cần làm:**
- Dịch vụ ván: tạo ván từ sự kiện phòng (theo hợp đồng ở US-00.3), giữ trạng thái, nhận ý định đi cờ, phân xử bằng `xiangqi-core`
- Phát nước đi tới hai người chơi và người xem; tự kết thúc ván theo luật; lưu `matches`, `match_moves`
- Từ chối nước sai luật/không đúng lượt, đồng bộ lại client
**Đầu ra:** Dịch vụ ván online có API socket và test tích hợp.
**Cách kiểm và điều kiện PASS:** AC U/I của US-05.1 (trừ đồng hồ). PASS khi test tích hợp xanh và độ trễ phát nước đi đo được trong môi trường demo.
**Lịch:** Tình · 24 giờ · 5 Story Points · 15/10 sáng → 17/10 chiều · XIAN Sprint 2.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-05.1; luật ở BA-SCOPE-DECISIONS.md.

#### T23 · BE đồng hồ thi đấu và hết giờ

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T23 · BE đồng hồ thi đấu và hết giờ |
| Parent (Epic) | EP-05 |
| Assignee | Đông |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 18/10/2026 |
| Due date | 18/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 8 giờ |
| Story Points | 2 |
| Labels | `sprint-2`, `phat-trien` |
| Story (relates to) | US-05.1 |
| Is blocked by | T20 |

**Description**

**Mục tiêu:** BE đồng hồ thi đấu và hết giờ — phục vụ US-05.1 Ván online: đi cờ, đồng hồ và kết thúc ván (EP-05 Hai người đánh cờ online).
**Đầu vào (phải xong trước):** T20 (BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván).
**Việc cần làm:**
- Đồng hồ máy chủ theo mức giờ phòng, chỉ chạy bên tới lượt, không cộng giây; tính giờ trước khi xét nước
- Hết giờ → kết thúc `TIMEOUT`; gửi thời gian còn lại trong ảnh chụp
**Đầu ra:** Đồng hồ tích hợp trong dịch vụ ván.
**Cách kiểm và điều kiện PASS:** AC U/I về đồng hồ của US-05.1. PASS khi test tích hợp xanh cho hết giờ và nước đến muộn.
**Lịch:** Đông · 8 giờ · 2 Story Points · 18/10 sáng → 18/10 chiều · XIAN Sprint 2.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-05.1; luật ở BA-SCOPE-DECISIONS.md.

#### T25 · FE phòng thi đấu: nối nước đi, đồng hồ, hộp kết quả

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T25 · FE phòng thi đấu: nối nước đi, đồng hồ, hộp kết quả |
| Parent (Epic) | EP-05 |
| Assignee | Kỳ |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 19/10/2026 |
| Due date | 20/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 16 giờ |
| Story Points | 3 |
| Labels | `sprint-2`, `phat-trien` |
| Story (relates to) | US-05.1 |
| Is blocked by | T19, T23 |

**Description**

**Mục tiêu:** FE phòng thi đấu: nối nước đi, đồng hồ, hộp kết quả — phục vụ US-05.1 Ván online: đi cờ, đồng hồ và kết thúc ván (EP-05 Hai người đánh cờ online).
**Đầu vào (phải xong trước):** T19 (FE đi cờ click/kéo thả, gợi ý ô, đánh dấu, âm thanh), T23 (BE đồng hồ thi đấu và hết giờ).
**Việc cần làm:**
- Nối `<Board>` với dịch vụ ván: gửi ý định, nhận nước đi, khoá bàn khi không tới lượt, người xem chỉ xem
- Hiển thị đồng hồ hai bên, đồng bộ lại khi tab ẩn
- Hộp kết quả với lý do tiếng Việt
**Đầu ra:** Màn phòng thi đấu chơi được trọn ván giữa hai trình duyệt.
**Cách kiểm và điều kiện PASS:** AC E2E của US-05.1. PASS khi Playwright đánh trọn một ván chiếu hết giữa hai trình duyệt và người xem thấy cùng bàn cờ.
**Lịch:** Kỳ · 16 giờ · 3 Story Points · 19/10 sáng → 20/10 chiều · XIAN Sprint 2.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-05.1; luật ở BA-SCOPE-DECISIONS.md.

#### T30 · Kiểm thử US-05.1

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T30 · Kiểm thử US-05.1 |
| Parent (Epic) | EP-05 |
| Assignee | Nhạn |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 21/10/2026 |
| Due date | 21/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 8 giờ |
| Story Points | 2 |
| Labels | `sprint-2`, `kiem-thu` |
| Story (relates to) | US-05.1 |
| Is blocked by | T25, T26 |

**Description**

**Mục tiêu:** Kiểm thử US-05.1 — phục vụ US-05.1 Ván online: đi cờ, đồng hồ và kết thúc ván (EP-05 Hai người đánh cờ online).
**Đầu vào (phải xong trước):** T25 (FE phòng thi đấu: nối nước đi, đồng hồ, hộp kết quả), T26 (FE Chia sẻ phòng, nhập mã ở Sảnh, tự vào phòng sau đăng nhập).
**Việc cần làm:**
- Chạy TC của US-05.1 với 2 người chơi + 1 người xem
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-05.1 đạt.
**Lịch:** Nhạn · 8 giờ · 2 Story Points · 21/10 sáng → 21/10 chiều · XIAN Sprint 2.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-05.1; luật ở BA-SCOPE-DECISIONS.md.

### US-05.2 · Đầu hàng và xin hoà

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-05.2 · Đầu hàng và xin hoà |
| Parent (Epic) | EP-05 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 22/10/2026 |
| Sprint | — |
| Fix version | v0.3 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-05` |
| Hạn theo R1 | 22/10 (ngày Task đầu tiên bắt đầu) |
| Thi công | XIAN Sprint 3 · Task đầu 22/10 → Task cuối 25/10 |
| Task thực hiện | T32, T36, T39 (3 Task · 24 giờ) |
| Tổng điểm các Task | 6 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** người chơi, **tôi muốn** đầu hàng có xác nhận và đề nghị hoà mà không chặn bàn cờ, **để** kết thúc ván văn minh, không bấm nhầm.
*Nguồn:* BA 2.3 mục 5, 3.3 mục 2. *Màn hình:* `MODAL-CONFIRM-RESIGN`, `MODAL-CONFIRM-LEAVE`.
*Nguồn:* BA 3.3 mục 2, 3.5 mục 4, 3.6 mục 2, 5. *Màn hình:* `MODAL-DRAW-PROMPT`.
*Sprint:* S3. *Story Points:* **6** (tổng điểm 3 Task, 24 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-05.2.1 | Đang ván | Bấm "Đầu hàng" | Xác nhận *"Bạn có chắc chắn muốn đầu hàng? Bạn sẽ bị xử THUA ngay lập tức…"*, focus ở Huỷ; Đồng ý → `RESIGN`, đối thủ thắng | E2E |
| AC-05.2.2 | Đang ván | Bấm "Rời phòng" | Cảnh báo rời phòng = đầu hàng; "Rời phòng" → thua `RESIGN` rồi rời; "Ở lại" → giữ nguyên | E2E |
| AC-05.2.3 | Host rời giữa ván | Hệ thống | Host thua `RESIGN`, quyền Host chuyển cho người còn lại | I |
| AC-05.2.4 | Có toast/thông báo đang hiện | Nhìn nút Đầu hàng | Toast không che nút Đầu hàng | M |
| AC-05.2.5 | Đang ván | A bấm "Xin hoà" | B thấy khung **không modal** đếm 30 giây "Chấp nhận Hoà"/"Từ chối"; bàn cờ và đồng hồ vẫn chạy; X/Esc chỉ thu gọn và có nút mở lại | E2E |
| AC-05.2.6 | B bấm "Chấp nhận Hoà" | Hệ thống | Ván kết thúc `DRAW_AGREEMENT` | E2E |
| AC-05.2.7 | B từ chối hoặc hết 30 giây | A muốn xin lại | Nút `DISABLED` cho tới khi A đi thêm **5 nước**, tooltip nêu số nước còn chờ | E2E |
| AC-05.2.8 | A có đề nghị đang chờ | A bấm "Rút đề nghị" | Đề nghị bị huỷ ở phía B | E2E |
| AC-05.2.9 | Đề nghị đang chờ | Ván kết thúc vì lý do khác | Đề nghị đóng; phản hồi đến sau không đổi kết quả | I |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 22/10 (trước khi Task đầu tiên bắt đầu). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 3.

#### T32 · BE đầu hàng, rời phòng giữa ván, xin hoà

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T32 · BE đầu hàng, rời phòng giữa ván, xin hoà |
| Parent (Epic) | EP-05 |
| Assignee | Đông |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 22/10/2026 |
| Due date | 23/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 12 giờ |
| Story Points | 3 |
| Labels | `sprint-3`, `phat-trien` |
| Story (relates to) | US-05.2 |
| Is blocked by | T20 |

**Description**

**Mục tiêu:** BE đầu hàng, rời phòng giữa ván, xin hoà — phục vụ US-05.2 Đầu hàng và xin hoà (EP-05 Hai người đánh cờ online).
**Đầu vào (phải xong trước):** T20 (BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván).
**Việc cần làm:**
- Đầu hàng (`RESIGN`), rời phòng giữa ván = đầu hàng, chuyển Host
- Xin hoà: đề nghị 30 giây, chấp nhận → `DRAW_AGREEMENT`, từ chối/hết hạn → chờ 5 nước, rút đề nghị, đóng khi ván kết thúc
**Đầu ra:** API đề nghị trong ván + test tích hợp.
**Cách kiểm và điều kiện PASS:** AC U/I của US-05.2. PASS khi test tích hợp xanh cho đầu hàng, hoà, thời gian chờ 5 nước.
**Lịch:** Đông · 12 giờ · 3 Story Points · 22/10 sáng → 23/10 sáng · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-05.2; luật ở BA-SCOPE-DECISIONS.md.

#### T36 · FE nút Đầu hàng, Xin hoà và khung đề nghị

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T36 · FE nút Đầu hàng, Xin hoà và khung đề nghị |
| Parent (Epic) | EP-05 |
| Assignee | Kỳ |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 23/10/2026 |
| Due date | 24/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 8 giờ |
| Story Points | 2 |
| Labels | `sprint-3`, `phat-trien` |
| Story (relates to) | US-05.2 |
| Is blocked by | T25, T32 |

**Description**

**Mục tiêu:** FE nút Đầu hàng, Xin hoà và khung đề nghị — phục vụ US-05.2 Đầu hàng và xin hoà (EP-05 Hai người đánh cờ online).
**Đầu vào (phải xong trước):** T25 (FE phòng thi đấu: nối nước đi, đồng hồ, hộp kết quả), T32 (BE đầu hàng, rời phòng giữa ván, xin hoà).
**Việc cần làm:**
- `MODAL-CONFIRM-RESIGN`, `MODAL-CONFIRM-LEAVE` (focus ở Huỷ)
- Khung Xin hoà không modal (thu gọn, mở lại, đếm 30 giây), nút `DISABLED` có tooltip số nước còn chờ
**Đầu ra:** Giao diện đầu hàng và xin hoà.
**Cách kiểm và điều kiện PASS:** AC E2E của US-05.2. PASS khi Playwright đầu hàng và xin hoà được giữa hai trình duyệt.
**Lịch:** Kỳ · 8 giờ · 2 Story Points · 23/10 chiều → 24/10 sáng · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-05.2; luật ở BA-SCOPE-DECISIONS.md.

#### T39 · Kiểm thử US-05.2

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T39 · Kiểm thử US-05.2 |
| Parent (Epic) | EP-05 |
| Assignee | Thư |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 25/10/2026 |
| Due date | 25/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 4 giờ |
| Story Points | 1 |
| Labels | `sprint-3`, `kiem-thu` |
| Story (relates to) | US-05.2 |
| Is blocked by | T36 |

**Description**

**Mục tiêu:** Kiểm thử US-05.2 — phục vụ US-05.2 Đầu hàng và xin hoà (EP-05 Hai người đánh cờ online).
**Đầu vào (phải xong trước):** T36 (FE nút Đầu hàng, Xin hoà và khung đề nghị).
**Việc cần làm:**
- Chạy TC của US-05.2
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-05.2 đạt.
**Lịch:** Thư · 4 giờ · 1 Story Points · 25/10 sáng → 25/10 sáng · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-05.2; luật ở BA-SCOPE-DECISIONS.md.

### US-05.3 · Mất kết nối và nối lại

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-05.3 · Mất kết nối và nối lại |
| Parent (Epic) | EP-05 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 29/10/2026 |
| Sprint | — |
| Fix version | v1.0 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-05` |
| Hạn theo R1 | 29/10 (ngày Task đầu tiên bắt đầu) |
| Thi công | XIAN Sprint 4 · Task đầu 29/10 → Task cuối 01/11 |
| Task thực hiện | T52, T60 (2 Task · 20 giờ) |
| Tổng điểm các Task | 4 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** người chơi, **tôi muốn** có 60 giây để quay lại khi rớt mạng, **để** không thua oan vì sự cố ngắn.
*Nguồn:* BA 3.3 mục 4, 8.3, 10.1 (ván gián đoạn). *Màn hình:* `OVERLAY-RECONNECTING`.
*Sprint:* S4. *Story Points:* **4** (tổng điểm 2 Task, 20 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-05.3.1 | A mất kết nối trong ván | Hệ thống | A thấy lớp phủ đếm 60 giây (không đóng bằng Esc); B thấy *"Đối thủ đang mất kết nối, thời gian chờ: 60s"*; đồng hồ ván vẫn chạy | E2E |
| AC-05.3.2 | A nối lại trong 60 giây | Hệ thống | Lớp phủ tắt, bàn cờ/đồng hồ/chat đồng bộ lại, ván tiếp tục | E2E |
| AC-05.3.3 | Quá 60 giây | Máy chủ | A thua `DISCONNECT` | I, E2E |
| AC-05.3.4 | A mất kết nối khi tới lượt A, đồng hồ A về 0 trước khi hết ân hạn | Máy chủ | Xử `TIMEOUT` | I |
| AC-05.3.5 | Cả hai cùng mất kết nối, máy chủ vẫn chạy | Cả hai quá ân hạn | Bên mất kết nối **trước** thua `DISCONNECT` | I |
| AC-05.3.6 | Máy chủ khởi động lại giữa ván | Người chơi nối lại | Hộp kết quả trung tính *"Ván bị gián đoạn"*: không thắng/thua/hoà, chỉ có nút Rời phòng | I, M |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 29/10 (trước khi Task đầu tiên bắt đầu). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 4.

#### T52 · Mất kết nối: ân hạn 60 giây, nối lại, ván bị gián đoạn, lớp phủ (BE + FE)

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T52 · Mất kết nối: ân hạn 60 giây, nối lại, ván bị gián đoạn, lớp phủ (BE + FE) |
| Parent (Epic) | EP-05 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 29/10/2026 |
| Due date | 30/10/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 16 giờ |
| Story Points | 3 |
| Labels | `sprint-4`, `phat-trien` |
| Story (relates to) | US-05.3 |
| Is blocked by | T25 |

**Description**

**Mục tiêu:** Mất kết nối: ân hạn 60 giây, nối lại, ván bị gián đoạn, lớp phủ (BE + FE) — phục vụ US-05.3 Mất kết nối và nối lại (EP-05 Hai người đánh cờ online).
**Đầu vào (phải xong trước):** T25 (FE phòng thi đấu: nối nước đi, đồng hồ, hộp kết quả).
**Việc cần làm:**
- Máy chủ: ân hạn 60 giây (đồng hồ vẫn chạy), `TIMEOUT` vs `DISCONNECT`, cả hai mất kết nối thì bên mất trước thua, khởi động lại → "Ván bị gián đoạn"
- Client: `OVERLAY-RECONNECTING` theo vai trò, tự nối lại và đồng bộ ảnh chụp
**Đầu ra:** Xử lý mất kết nối đầu-cuối.
**Cách kiểm và điều kiện PASS:** AC của US-05.3 mức U/I/E2E. PASS khi test tích hợp xanh và Playwright mô phỏng rớt mạng 30 giây rồi nối lại thành công.
**Lịch:** Tình · 16 giờ · 3 Story Points · 29/10 sáng → 30/10 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-05.3; luật ở BA-SCOPE-DECISIONS.md.

#### T60 · Kiểm thử US-05.3

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T60 · Kiểm thử US-05.3 |
| Parent (Epic) | EP-05 |
| Assignee | Thư |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 01/11/2026 |
| Due date | 01/11/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 4 giờ |
| Story Points | 1 |
| Labels | `sprint-4`, `kiem-thu` |
| Story (relates to) | US-05.3 |
| Is blocked by | T52 |

**Description**

**Mục tiêu:** Kiểm thử US-05.3 — phục vụ US-05.3 Mất kết nối và nối lại (EP-05 Hai người đánh cờ online).
**Đầu vào (phải xong trước):** T52 (Mất kết nối: ân hạn 60 giây, nối lại, ván bị gián đoạn, lớp phủ (BE + FE)).
**Việc cần làm:**
- Chạy TC của US-05.3 (rút mạng thật trên thiết bị)
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-05.3 đạt.
**Lịch:** Thư · 4 giờ · 1 Story Points · 01/11 sáng → 01/11 sáng · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-05.3; luật ở BA-SCOPE-DECISIONS.md.

---

<a id="ep-06"></a>
## EP-06 · Chế độ phòng và người xem

| Trường | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | EP-06 · Chế độ phòng và người xem |
| Parent (Epic) | — |
| Assignee | Tình |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 29/10/2026 |
| Sprint | — |
| Fix version | v1.0 |
| Original Estimate | — |
| Story Points | — |
| Labels | `EP-06`, `dac-ta` |
| Yêu cầu khách hàng | YC6 |
| Story con | US-06.1, US-06.2, US-06.3 |
| Số Task / tổng giờ | 9 Task · 100 giờ |
| Tổng điểm các Task | 22 |

**Description**

PUBLIC / CODE_ONLY / LOCKED, danh sách phòng ở Sảnh, tối đa 5 người xem (7 người/phòng), đuổi người xem.

Yêu cầu khách hàng: YC6. Story: US-06.1, US-06.2, US-06.3.

### US-06.1 · Cài đặt phòng: PUBLIC / CODE_ONLY / LOCKED

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-06.1 · Cài đặt phòng: PUBLIC / CODE_ONLY / LOCKED |
| Parent (Epic) | EP-06 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 29/10/2026 |
| Sprint | — |
| Fix version | v1.0 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-06` |
| Hạn theo R1 | 29/10 (ngày Task đầu tiên bắt đầu) |
| Thi công | XIAN Sprint 4 · Task đầu 29/10 → Task cuối 01/11 |
| Task thực hiện | T53, T57, T62 (3 Task · 28 giờ) |
| Tổng điểm các Task | 6 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** Host, **tôi muốn** mở công khai, chỉ cho vào bằng mã, hoặc khoá phòng, **để** kiểm soát ai được vào.
*Nguồn:* BA 2.7 mục 2, 2.8 mục 5–6, 4.3. *Màn hình:* `MODAL-ROOM-SETTINGS`.
*Sprint:* S4. *Story Points:* **6** (tổng điểm 3 Task, 28 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-06.1.1 | Trong phòng | Người không phải Host | Không thấy nút "Cài đặt phòng" | E2E |
| AC-06.1.2 | Chưa đủ hai người chơi | Host mở Cài đặt | Lựa chọn `LOCKED` `DISABLED` kèm tooltip *"Chỉ khoá được khi đã đủ 2 người chơi"* | E2E |
| AC-06.1.3 | Đủ hai người chơi | Host chọn `LOCKED` (kể cả đang ván) | Không ai mới vào được; mọi link/mã/lời mời chưa dùng bị vô hiệu; người xem hiện có vẫn ở lại, không mất hình/tiếng | I, E2E |
| AC-06.1.4 | Phòng `LOCKED` | Người chơi mất mạng rồi nối lại trong 60 giây, người xem trong 5 phút | Vào lại được; quá hạn thì bị coi là người mới (bị chặn) | I |
| AC-06.1.5 | Phòng `LOCKED` | Host mở lại `CODE_ONLY` hoặc `PUBLIC` | Sinh **mã và link mới**; mã/link cũ không dùng được | I |
| AC-06.1.6 | Phòng `LOCKED` | Một người ngồi ghế rời đi | Phòng vẫn `LOCKED` cho đến khi Host tự mở | I |
| AC-06.1.7 | Phòng `LOCKED` | Người mới mở link/mã | Bị từ chối dù có link/mã | I, E2E |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 29/10 (trước khi Task đầu tiên bắt đầu). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 4.

#### T53 · BE chế độ PUBLIC / CODE_ONLY / LOCKED, thu hồi mã

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T53 · BE chế độ PUBLIC / CODE_ONLY / LOCKED, thu hồi mã |
| Parent (Epic) | EP-06 |
| Assignee | Đông |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 29/10/2026 |
| Due date | 30/10/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 16 giờ |
| Story Points | 3 |
| Labels | `sprint-4`, `phat-trien` |
| Story (relates to) | US-06.1 |
| Is blocked by | T22 |

**Description**

**Mục tiêu:** BE chế độ PUBLIC / CODE_ONLY / LOCKED, thu hồi mã — phục vụ US-06.1 Cài đặt phòng: PUBLIC / CODE_ONLY / LOCKED (EP-06 Chế độ phòng và người xem).
**Đầu vào (phải xong trước):** T22 (BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập).
**Việc cần làm:**
- Chuyển PUBLIC / CODE_ONLY / LOCKED (chỉ Host); LOCKED chỉ bật khi đủ 2 người chơi và giữ khoá khi thiếu ghế
- Khoá: chặn người mới, vô hiệu link/mã/lời mời chưa dùng; mở lại sinh mã/link mới; người đang trong phòng giữ quyền nối lại
**Đầu ra:** API chế độ phòng + test tích hợp.
**Cách kiểm và điều kiện PASS:** AC U/I của US-06.1. PASS khi test tích hợp xanh cho khoá, thu hồi mã và mở lại.
**Lịch:** Đông · 16 giờ · 3 Story Points · 29/10 sáng → 30/10 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-06.1; luật ở BA-SCOPE-DECISIONS.md.

#### T57 · FE Cài đặt phòng

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T57 · FE Cài đặt phòng |
| Parent (Epic) | EP-06 |
| Assignee | Nhạn |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 31/10/2026 |
| Due date | 31/10/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 8 giờ |
| Story Points | 2 |
| Labels | `sprint-4`, `phat-trien` |
| Story (relates to) | US-06.1 |
| Is blocked by | T53 |

**Description**

**Mục tiêu:** FE Cài đặt phòng — phục vụ US-06.1 Cài đặt phòng: PUBLIC / CODE_ONLY / LOCKED (EP-06 Chế độ phòng và người xem).
**Đầu vào (phải xong trước):** T53 (BE chế độ PUBLIC / CODE_ONLY / LOCKED, thu hồi mã).
**Việc cần làm:**
- `MODAL-ROOM-SETTINGS` (chỉ Host), LOCKED `DISABLED` khi chưa đủ 2 người chơi, hiển thị mã/link mới sau khi mở lại
**Đầu ra:** Giao diện Cài đặt phòng.
**Cách kiểm và điều kiện PASS:** AC E2E của US-06.1. PASS khi Playwright khoá phòng và người có mã cũ bị từ chối.
**Lịch:** Nhạn · 8 giờ · 2 Story Points · 31/10 sáng → 31/10 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-06.1; luật ở BA-SCOPE-DECISIONS.md.

#### T62 · Kiểm thử US-06.1

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T62 · Kiểm thử US-06.1 |
| Parent (Epic) | EP-06 |
| Assignee | Thư |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 01/11/2026 |
| Due date | 01/11/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 4 giờ |
| Story Points | 1 |
| Labels | `sprint-4`, `kiem-thu` |
| Story (relates to) | US-06.1 |
| Is blocked by | T57 |

**Description**

**Mục tiêu:** Kiểm thử US-06.1 — phục vụ US-06.1 Cài đặt phòng: PUBLIC / CODE_ONLY / LOCKED (EP-06 Chế độ phòng và người xem).
**Đầu vào (phải xong trước):** T57 (FE Cài đặt phòng).
**Việc cần làm:**
- Chạy TC của US-06.1
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-06.1 đạt.
**Lịch:** Thư · 4 giờ · 1 Story Points · 01/11 chiều → 01/11 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-06.1; luật ở BA-SCOPE-DECISIONS.md.

### US-06.2 · Sảnh và danh sách phòng công khai

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-06.2 · Sảnh và danh sách phòng công khai |
| Parent (Epic) | EP-06 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 29/10/2026 |
| Sprint | — |
| Fix version | v1.0 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-06` |
| Hạn theo R1 | 29/10 (ngày Task đầu tiên bắt đầu) |
| Thi công | XIAN Sprint 4 · Task đầu 29/10 → Task cuối 03/11 |
| Task thực hiện | T54, T61, T67 (3 Task · 36 giờ) |
| Tổng điểm các Task | 8 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** người dùng hoặc Khách, **tôi muốn** Sảnh rõ ràng các lựa chọn, luật chơi và danh sách phòng công khai để vào chơi hoặc xem, **để** tìm trận mà không cần mã.
*Nguồn:* BA 0.5, 2.7. *Màn hình:* `SCR-LOBBY`.
*Nguồn:* BA 2.0, 10.4, Phần 11, DANH-MUC §7. *Màn hình:* `SCR-LOBBY`, `PANEL-NAVBAR`.
*Sprint:* S4. *Story Points:* **8** (tổng điểm 3 Task, 36 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-06.2.1 | Có phòng `PUBLIC` | Mở Sảnh | Mỗi dòng hiện Tên phòng · Host (kèm "(Khách)" nếu có) · Mức giờ · Trạng thái *Đang chờ*/*Đang đấu* · Người xem *x/N* (N = 0 hiện *"Không cho xem"*) | E2E |
| AC-06.2.2 | Danh sách | Sắp xếp | Phòng mở PUBLIC gần nhất lên đầu; tối đa 50 phòng | I |
| AC-06.2.3 | Đang mở Sảnh | Phòng mới mở PUBLIC, đổi trạng thái, đổi số người, đóng hoặc rời PUBLIC | Danh sách tự cập nhật trong ≤ 2 giây, không cần tải lại | E2E |
| AC-06.2.4 | Phòng còn ghế trống | Xem dòng | Có nút "Vào chơi"; có thêm "Vào xem" nếu còn chỗ xem | E2E |
| AC-06.2.5 | Phòng đủ hai ghế | Xem dòng | Chỉ có "Vào xem" (nếu còn chỗ xem); hết chỗ hoặc N = 0 thì không có nút vào | E2E |
| AC-06.2.6 | Bấm "Vào chơi" | Ghế vừa bị người khác lấy | Còn chỗ xem → vào làm Người xem kèm *"Ghế vừa có người, bạn đang xem trận"*; hết chỗ → báo phòng đầy | I |
| AC-06.2.7 | Bấm "Vào xem" | Còn chỗ | Vào làm Người xem, không tự chiếm ghế dù ghế trống | E2E |
| AC-06.2.8 | Không có phòng PUBLIC | Mở Sảnh | Trạng thái `EMPTY` có lời giải thích và nút "Tạo phòng" | E2E |
| AC-06.2.9 | Phòng `CODE_ONLY`/`LOCKED` | Mở Sảnh | Không xuất hiện | I |
| AC-06.2.10 | Mở Sảnh | Xem bốn lựa chọn | "Đánh Thường – Ghép ngẫu nhiên" và "Đánh Hạng" `DISABLED` kèm *"Sắp ra mắt"*; "Tự tạo phòng" và "Đánh với máy" hoạt động; có ô "Vào phòng bằng mã" | E2E |
| AC-06.2.11 | Mở Sảnh | Mở mục "Luật chơi" | Mở rộng/thu gọn tại chỗ (không trang/modal mới), dùng được bằng bàn phím; nội dung nêu: cách đi của 7 loại quân; chiếu hết = thua; **hết nước đi = thua**; lặp thế 3 lần = hoà; **chiếu liên tục = bên chiếu thua** (cả hai cùng chiếu = hoà); **120 nửa nước không ăn quân = hoà**; xin hoà, đầu hàng, hết giờ, mất kết nối 60 giây; **đuổi quân liên tục không xử riêng (xử hoà theo lặp thế)**; câu *"Đây là bộ luật rút gọn của ứng dụng, không phải toàn bộ luật thi đấu chính thức"* | E2E, M |
| AC-06.2.12 | Thanh điều hướng | Xem mục | Sảnh, Bạn bè hoạt động (Khách: Bạn bè `DISABLED`); Lịch sử, Bảng xếp hạng `DISABLED` *"Sắp ra mắt"*; chuông lời mời kết bạn; avatar + Display Name mở menu Cài đặt hồ sơ | E2E |
| AC-06.2.13 | Màn hình `SCR-LOGIN` | Xem liên kết "Quên mật khẩu?" | `DISABLED` kèm *"Sắp ra mắt"* | E2E |
| AC-06.2.14 | Khách | Vào phòng bằng mã/link, Vào chơi/Vào xem ở Sảnh, Đánh với máy | Đều được phép theo luật phòng | E2E |
| AC-06.2.15 | Host | Chuyển sang `PUBLIC` | Phòng xuất hiện ở danh sách Sảnh trong ≤ 2 giây | E2E |
| AC-06.2.16 | Phòng `PUBLIC` | Host chuyển sang `CODE_ONLY` hoặc `LOCKED` | Phòng biến khỏi danh sách Sảnh; yêu cầu vào từ danh sách cũ bị máy chủ từ chối | I, E2E |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 29/10 (trước khi Task đầu tiên bắt đầu). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 4.

#### T54 · BE danh sách phòng PUBLIC realtime, Vào chơi/Vào xem

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T54 · BE danh sách phòng PUBLIC realtime, Vào chơi/Vào xem |
| Parent (Epic) | EP-06 |
| Assignee | Cường |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 29/10/2026 |
| Due date | 30/10/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 12 giờ |
| Story Points | 3 |
| Labels | `sprint-4`, `phat-trien` |
| Story (relates to) | US-06.2 |
| Is blocked by | T22 |

**Description**

**Mục tiêu:** BE danh sách phòng PUBLIC realtime, Vào chơi/Vào xem — phục vụ US-06.2 Sảnh và danh sách phòng công khai (EP-06 Chế độ phòng và người xem).
**Đầu vào (phải xong trước):** T22 (BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập).
**Việc cần làm:**
- Danh sách phòng PUBLIC: cột theo BA 0.5, mới nhất trước, tối đa 50, đẩy cập nhật realtime khi phòng đổi trạng thái/số người/chế độ
- "Vào chơi" (ghế vừa hết → người xem nếu còn chỗ) và "Vào xem"; Khách được dùng
**Đầu ra:** API danh sách Sảnh + test tích hợp.
**Cách kiểm và điều kiện PASS:** AC U/I của US-06.2. PASS khi test tích hợp xanh và danh sách cập nhật ≤ 2 giây.
**Lịch:** Cường · 12 giờ · 3 Story Points · 29/10 sáng → 30/10 sáng · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-06.2; luật ở BA-SCOPE-DECISIONS.md.

#### T61 · FE Sảnh: bốn lựa chọn, Luật chơi, danh sách phòng, thanh điều hướng

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T61 · FE Sảnh: bốn lựa chọn, Luật chơi, danh sách phòng, thanh điều hướng |
| Parent (Epic) | EP-06 |
| Assignee | Nhạn |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 01/11/2026 |
| Due date | 02/11/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 16 giờ |
| Story Points | 3 |
| Labels | `sprint-4`, `phat-trien` |
| Story (relates to) | US-06.2 |
| Is blocked by | T54 |

**Description**

**Mục tiêu:** FE Sảnh: bốn lựa chọn, Luật chơi, danh sách phòng, thanh điều hướng — phục vụ US-06.2 Sảnh và danh sách phòng công khai (EP-06 Chế độ phòng và người xem).
**Đầu vào (phải xong trước):** T54 (BE danh sách phòng PUBLIC realtime, Vào chơi/Vào xem).
**Việc cần làm:**
- Sảnh đầy đủ: bốn lựa chọn (hai lựa chọn P2 `DISABLED` "Sắp ra mắt"), mục Luật chơi mở rộng/thu gọn theo AC, danh sách phòng PUBLIC với nút Vào chơi/Vào xem, trạng thái EMPTY
- Hoàn thiện thanh điều hướng theo AC
**Đầu ra:** Màn Sảnh hoàn chỉnh.
**Cách kiểm và điều kiện PASS:** AC E2E của US-06.2. PASS khi Playwright thấy phòng PUBLIC mới xuất hiện và vào xem được.
**Lịch:** Nhạn · 16 giờ · 3 Story Points · 01/11 sáng → 02/11 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-06.2; luật ở BA-SCOPE-DECISIONS.md.

#### T67 · Kiểm thử US-06.2

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T67 · Kiểm thử US-06.2 |
| Parent (Epic) | EP-06 |
| Assignee | Thư |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 03/11/2026 |
| Due date | 03/11/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 8 giờ |
| Story Points | 2 |
| Labels | `sprint-4`, `kiem-thu` |
| Story (relates to) | US-06.2 |
| Is blocked by | T61 |

**Description**

**Mục tiêu:** Kiểm thử US-06.2 — phục vụ US-06.2 Sảnh và danh sách phòng công khai (EP-06 Chế độ phòng và người xem).
**Đầu vào (phải xong trước):** T61 (FE Sảnh: bốn lựa chọn, Luật chơi, danh sách phòng, thanh điều hướng).
**Việc cần làm:**
- Chạy TC của US-06.2, đối chiếu nội dung Luật chơi với BA 3.3/3.5/10.4
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-06.2 đạt.
**Lịch:** Thư · 8 giờ · 2 Story Points · 03/11 sáng → 03/11 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-06.2; luật ở BA-SCOPE-DECISIONS.md.

### US-06.3 · Người xem và đuổi người xem

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-06.3 · Người xem và đuổi người xem |
| Parent (Epic) | EP-06 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 29/10/2026 |
| Sprint | — |
| Fix version | v1.0 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-06` |
| Hạn theo R1 | 29/10 (ngày Task đầu tiên bắt đầu) |
| Thi công | XIAN Sprint 4 · Task đầu 29/10 → Task cuối 02/11 |
| Task thực hiện | T55, T58, T64 (3 Task · 36 giờ) |
| Tổng điểm các Task | 8 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** Host hoặc người chơi, **tôi muốn** sắp xếp người giữa ghế và hàng người xem và đuổi người xem quấy rối, **để** giữ không gian thi đấu tập trung.
*Nguồn:* BA 2.6, 2.8 mục 3–4, 8.3. *Màn hình:* `SCR-WAITING-ROOM`, `PANEL-SPECTATORS`.
*Nguồn:* BA 4.2, 4.1. *Màn hình:* `PANEL-SPECTATORS`, `MODAL-CONFIRM-KICK`.
*Sprint:* S4. *Story Points:* **8** (tổng điểm 3 Task, 36 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-06.3.1 | Phòng có người xem | Xem `PANEL-SPECTATORS` | Tiêu đề *"Người xem (X / N)"*, danh sách tên cập nhật realtime | E2E |
| AC-06.3.2 | Phòng `WAITING`/sau ván, còn chỗ xem | Người chơi bấm "Chuyển sang người xem" | Rời ghế thành Người xem; Sẵn sàng reset | E2E |
| AC-06.3.3 | Không còn chỗ xem hoặc phòng "Không có người xem" | Xem nút "Chuyển sang người xem" | `DISABLED` kèm tooltip *"Phòng không còn chỗ cho người xem"* | E2E |
| AC-06.3.4 | Host | Bấm "Chuyển sang người xem" cho người chơi kia (còn chỗ xem) | Người đó thành Người xem | E2E |
| AC-06.3.5 | Host, còn ghế trống | Gửi "Mời xuống ghế" cho một người xem | Người xem thấy lời mời Chấp nhận/Từ chối; Chấp nhận → máy chủ kiểm lại ghế trống, quyền, vị trí chơi rồi xếp vào ghế (vẫn phải Sẵn sàng); ghế đã có người → thông báo và giữ vai trò xem; Từ chối → tiếp tục xem | E2E |
| AC-06.3.6 | Người xem | Tìm cách tự ngồi vào ghế trống | Không có thao tác này | M |
| AC-06.3.7 | Host | Tìm nút tự chuyển mình sang người xem | Nút bị ẩn | E2E |
| AC-06.3.8 | Ván đang diễn ra | Mọi thao tác đổi chỗ ghế ↔ xem | Không khả dụng | E2E |
| AC-06.3.9 | Người xem mất kết nối | Nối lại trong 5 phút | Giữ chỗ xem; quá 5 phút mất chỗ (không xử phạt) | I |
| AC-06.3.10 | Phòng có người xem | Bất kỳ người chơi nào xem danh sách | Có nút "Kick" cạnh từng người xem; người xem không có nút này | E2E |
| AC-06.3.11 | Bấm Kick | Hệ thống | Mở xác nhận *"Bạn có chắc chắn muốn đuổi người xem [Tên] ra khỏi phòng thi đấu không?"*, focus mặc định ở Huỷ | E2E |
| AC-06.3.12 | Xác nhận | Hệ thống | Người bị đuổi rời phòng về Sảnh với *"Bạn đã bị đuổi khỏi phòng thi đấu"*; mất quyền nhận hình/tiếng ngay (GATE-MEDIA ghi thời gian) | E2E, I |
| AC-06.3.13 | Người đã bị đuổi | Vào lại bằng link/mã mới, lời mời hoặc từ Sảnh | Bị chặn đến khi phòng `CLOSED` | I |
| AC-06.3.14 | Người đã bị đuổi khỏi phòng | Vào lại bằng bất kỳ cách nào | `SCR-ACCESS-DENIED`: *"Bạn đã bị đuổi và chặn tham gia phòng cờ này!"* | I, E2E |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 29/10 (trước khi Task đầu tiên bắt đầu). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 4.

#### T55 · BE người xem, chuyển ghế ↔ xem, mời xuống ghế, đuổi và chặn

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T55 · BE người xem, chuyển ghế ↔ xem, mời xuống ghế, đuổi và chặn |
| Parent (Epic) | EP-06 |
| Assignee | Tùng |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 29/10/2026 |
| Due date | 30/10/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 16 giờ |
| Story Points | 3 |
| Labels | `sprint-4`, `phat-trien` |
| Story (relates to) | US-06.3 |
| Is blocked by | T22 |

**Description**

**Mục tiêu:** BE người xem, chuyển ghế ↔ xem, mời xuống ghế, đuổi và chặn — phục vụ US-06.3 Người xem và đuổi người xem (EP-06 Chế độ phòng và người xem).
**Đầu vào (phải xong trước):** T22 (BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập).
**Việc cần làm:**
- Vai trò người xem, sức chứa X/N, giữ chỗ 5 phút khi mất kết nối
- Chuyển ghế ↔ người xem, Host mời xuống ghế (chấp nhận/từ chối, không giữ ghế), không đổi chỗ khi đang ván
- Đuổi người xem (cả hai người chơi), chặn đến khi phòng đóng, phát sự kiện đuổi cho Task media
**Đầu ra:** API người xem + test tích hợp.
**Cách kiểm và điều kiện PASS:** AC U/I của US-06.3. PASS khi test tích hợp xanh cho sức chứa, mời xuống ghế, đuổi và chặn.
**Lịch:** Tùng · 16 giờ · 3 Story Points · 29/10 sáng → 30/10 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-06.3; luật ở BA-SCOPE-DECISIONS.md.

#### T58 · FE danh sách người xem, nút Kick, thao tác ghế

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T58 · FE danh sách người xem, nút Kick, thao tác ghế |
| Parent (Epic) | EP-06 |
| Assignee | Kỳ |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 31/10/2026 |
| Due date | 01/11/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 12 giờ |
| Story Points | 3 |
| Labels | `sprint-4`, `phat-trien` |
| Story (relates to) | US-06.3 |
| Is blocked by | T55 |

**Description**

**Mục tiêu:** FE danh sách người xem, nút Kick, thao tác ghế — phục vụ US-06.3 Người xem và đuổi người xem (EP-06 Chế độ phòng và người xem).
**Đầu vào (phải xong trước):** T55 (BE người xem, chuyển ghế ↔ xem, mời xuống ghế, đuổi và chặn).
**Việc cần làm:**
- `PANEL-SPECTATORS` (X/N, cập nhật realtime), nút Kick + `MODAL-CONFIRM-KICK`
- Nút Chuyển sang người xem / Mời xuống ghế, tooltip khi không còn chỗ
**Đầu ra:** Giao diện quản lý người xem.
**Cách kiểm và điều kiện PASS:** AC E2E của US-06.3. PASS khi Playwright đuổi một người xem và người đó không vào lại được.
**Lịch:** Kỳ · 12 giờ · 3 Story Points · 31/10 sáng → 01/11 sáng · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-06.3; luật ở BA-SCOPE-DECISIONS.md.

#### T64 · Kiểm thử US-06.3

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T64 · Kiểm thử US-06.3 |
| Parent (Epic) | EP-06 |
| Assignee | Thư |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 02/11/2026 |
| Due date | 02/11/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 8 giờ |
| Story Points | 2 |
| Labels | `sprint-4`, `kiem-thu` |
| Story (relates to) | US-06.3 |
| Is blocked by | T33, T58 |

**Description**

**Mục tiêu:** Kiểm thử US-06.3 — phục vụ US-06.3 Người xem và đuổi người xem (EP-06 Chế độ phòng và người xem).
**Đầu vào (phải xong trước):** T33 (Camera/mic LiveKit: token, quyền phát, mức chia sẻ, khung media (BE + FE)), T58 (FE danh sách người xem, nút Kick, thao tác ghế).
**Việc cần làm:**
- Chạy TC của US-06.3, gồm kiểm mất hình/tiếng ngay khi bị đuổi
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-06.3 đạt.
**Lịch:** Thư · 8 giờ · 2 Story Points · 02/11 sáng → 02/11 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-06.3; luật ở BA-SCOPE-DECISIONS.md.

---

<a id="ep-07"></a>
## EP-07 · Chat, camera và mic

| Trường | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | EP-07 · Chat, camera và mic |
| Parent (Epic) | — |
| Assignee | Tình |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 24/10/2026 |
| Sprint | — |
| Fix version | v0.3 |
| Original Estimate | — |
| Story Points | — |
| Labels | `EP-07`, `dac-ta` |
| Yêu cầu khách hàng | YC7 |
| Story con | US-07.1, US-07.2 |
| Số Task / tổng giờ | 5 Task · 76 giờ |
| Tổng điểm các Task | 18 |

**Description**

Kênh Riêng cho hai người chơi, Kênh Chung cho người xem, bộ lọc từ cấm; camera/mic qua LiveKit với ba mức chia sẻ.

Yêu cầu khách hàng: YC7. Story: US-07.1, US-07.2.

### US-07.1 · Hai kênh chat và bộ lọc

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-07.1 · Hai kênh chat và bộ lọc |
| Parent (Epic) | EP-07 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 24/10/2026 |
| Sprint | — |
| Fix version | v0.3 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-07` |
| Hạn theo R1 | 24/10 (ngày Task đầu tiên bắt đầu) |
| Thi công | XIAN Sprint 3 · Task đầu 24/10 → Task cuối 28/10 |
| Task thực hiện | T37, T42, T47 (3 Task · 36 giờ) |
| Tổng điểm các Task | 8 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** người chơi, **tôi muốn** một kênh riêng với đối thủ tách khỏi kênh của người xem, có lọc lời thô tục và chống spam, **để** trò chuyện văn minh và riêng tư.
*Nguồn:* BA 5.3 mục 1, 10.1 (chat khi đổi người), 4.1. *Màn hình:* `PANEL-CHAT`.
*Nguồn:* BA 5.3 mục 2.
*Sprint:* S3. *Story Points:* **8** (tổng điểm 3 Task, 36 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-07.1.1 | Người chơi trên máy tính vào phòng | Khung chat | Mặc định chỉ mở **Kênh Riêng**; có thể mở thêm Kênh Chung để xem song song, ẩn/hiện từng khung | E2E |
| AC-07.1.2 | Người chơi trên điện thoại | Khung chat | Hai kênh trong một khung, chuyển bằng tab, mặc định *Kênh Riêng* | E2E |
| AC-07.1.3 | Người xem | Khung chat | Chỉ có tab Kênh Chung; máy chủ từ chối mọi yêu cầu đọc/gửi Kênh Riêng từ người xem | E2E, I |
| AC-07.1.4 | A–B đang chat riêng; B xuống xem, C lên ghế | C và A mở Kênh Riêng | Chỉ thấy tin từ khi cặp A–C hình thành; B mất quyền đọc Kênh Riêng | I |
| AC-07.1.5 | Người xem mới vào | Mở Kênh Chung | Chỉ thấy tin từ lúc mình vào | I |
| AC-07.1.6 | Cùng cặp A–B Xin đổi bên hoặc đánh ván tiếp | Mở Kênh Riêng | Vẫn thấy tin cũ của cặp | I |
| AC-07.1.7 | Phòng đóng | Dữ liệu | Toàn bộ chat phòng bị xoá | I |
| AC-07.1.8 | Tin có thẻ HTML/script | Hiển thị | Hiện như văn bản thuần (NFR-10) | U, E2E |
| AC-07.1.9 | Tin chứa từ trong danh sách cấm | Gửi | Máy chủ thay từ đó bằng `***` trước khi phát cho mọi người | U, I |
| AC-07.1.10 | Biến thể né lọc (có dấu/không dấu, hoa/thường, chèn khoảng trắng hoặc ký tự đặc biệt, `0`→`o`, `1`→`i`) | Gửi | Vẫn bị che | U |
| AC-07.1.11 | Tin > 200 ký tự | Gửi | Bị chặn ở client và máy chủ | U, I |
| AC-07.1.12 | Đã gửi 5 tin trong 10 giây | Gửi tin thứ 6 | Báo *"Bạn gửi quá nhanh"*, tin không được gửi | I |
| AC-07.1.13 | Nhóm cần thêm từ cấm | Sửa tệp cấu hình danh sách | Áp dụng sau khi khởi động lại server, không sửa CSDL | M |
| AC-07.1.14 | Phòng đang ở trạng thái chờ (`WAITING`) | Người chơi và người xem mở khung chat | Có hai kênh theo vai trò như trong ván: người chơi có Kênh Riêng và Kênh Chung, người xem chỉ Kênh Chung; tin nhắn giữ nguyên khi chuyển sang ván (BA 0.13) | E2E |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 24/10 (trước khi Task đầu tiên bắt đầu). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 3.

#### T37 · BE hai kênh chat, bộ lọc từ cấm, giới hạn tốc độ

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T37 · BE hai kênh chat, bộ lọc từ cấm, giới hạn tốc độ |
| Parent (Epic) | EP-07 |
| Assignee | Cường |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 24/10/2026 |
| Due date | 25/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 16 giờ |
| Story Points | 3 |
| Labels | `sprint-3`, `phat-trien` |
| Story (relates to) | US-07.1 |
| Is blocked by | T18 |

**Description**

**Mục tiêu:** BE hai kênh chat, bộ lọc từ cấm, giới hạn tốc độ — phục vụ US-07.1 Hai kênh chat và bộ lọc (EP-07 Chat, camera và mic).
**Đầu vào (phải xong trước):** T18 (BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host).
**Việc cần làm:**
- Kênh Riêng (chỉ hai người chơi, mốc theo cặp) và Kênh Chung (người xem thấy từ lúc vào); hoạt động cả ở phòng chờ lẫn trong ván (BA 0.13); xoá chat khi phòng đóng
- Bộ lọc từ cấm (chuẩn hoá dấu, hoa/thường, ký tự chèn, `0→o`, `1→i`), tệp cấu hình danh sách; 200 ký tự, 5 tin/10 giây
**Đầu ra:** Dịch vụ chat + test.
**Cách kiểm và điều kiện PASS:** AC U/I của US-07.1. PASS khi unit test bộ lọc và test tích hợp quyền kênh xanh.
**Lịch:** Cường · 16 giờ · 3 Story Points · 24/10 sáng → 25/10 chiều · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-07.1; luật ở BA-SCOPE-DECISIONS.md.

#### T42 · FE khung chat hai kênh

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T42 · FE khung chat hai kênh |
| Parent (Epic) | EP-07 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 26/10/2026 |
| Due date | 27/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 12 giờ |
| Story Points | 3 |
| Labels | `sprint-3`, `phat-trien` |
| Story (relates to) | US-07.1 |
| Is blocked by | T25, T37 |

**Description**

**Mục tiêu:** FE khung chat hai kênh — phục vụ US-07.1 Hai kênh chat và bộ lọc (EP-07 Chat, camera và mic).
**Đầu vào (phải xong trước):** T25 (FE phòng thi đấu: nối nước đi, đồng hồ, hộp kết quả), T37 (BE hai kênh chat, bộ lọc từ cấm, giới hạn tốc độ).
**Việc cần làm:**
- `PANEL-CHAT` dùng chung cho phòng chờ và phòng thi đấu: máy tính mặc định chỉ Kênh Riêng, mở thêm Kênh Chung; điện thoại dùng tab; người xem chỉ Kênh Chung; hiển thị văn bản thuần
**Đầu ra:** Khung chat hai kênh.
**Cách kiểm và điều kiện PASS:** AC E2E của US-07.1. PASS khi Playwright: người xem không thấy Kênh Riêng, tin thô tục bị che `***`.
**Lịch:** Tình · 12 giờ · 3 Story Points · 26/10 sáng → 27/10 sáng · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-07.1; luật ở BA-SCOPE-DECISIONS.md.

#### T47 · Kiểm thử US-07.1

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T47 · Kiểm thử US-07.1 |
| Parent (Epic) | EP-07 |
| Assignee | Nhạn |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 27/10/2026 |
| Due date | 28/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 8 giờ |
| Story Points | 2 |
| Labels | `sprint-3`, `kiem-thu` |
| Story (relates to) | US-07.1 |
| Is blocked by | T42 |

**Description**

**Mục tiêu:** Kiểm thử US-07.1 — phục vụ US-07.1 Hai kênh chat và bộ lọc (EP-07 Chat, camera và mic).
**Đầu vào (phải xong trước):** T42 (FE khung chat hai kênh).
**Việc cần làm:**
- Chạy TC của US-07.1
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-07.1 đạt.
**Lịch:** Nhạn · 8 giờ · 2 Story Points · 27/10 chiều → 28/10 sáng · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-07.1; luật ở BA-SCOPE-DECISIONS.md.

### US-07.2 · Camera, mic và mức chia sẻ

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-07.2 · Camera, mic và mức chia sẻ |
| Parent (Epic) | EP-07 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 22/10/2026 |
| Sprint | — |
| Fix version | v0.3 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-07` |
| Hạn theo R1 | 22/10 (ngày Task đầu tiên bắt đầu) |
| Thi công | XIAN Sprint 3 · Task đầu 22/10 → Task cuối 27/10 |
| Task thực hiện | T33, T45 (2 Task · 40 giờ) |
| Tổng điểm các Task | 10 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** người chơi, **tôi muốn** bật camera và mic và chọn ai được thấy/nghe mình, **để** giao lưu như ngồi cùng bàn mà vẫn chủ động quyền riêng tư.
*Nguồn:* BA 4.1, 1.8 (nhiều tab), 10.1 (LiveKit Cloud, không ghi). *Màn hình:* `PANEL-MEDIA`. *Phụ thuộc:* spike GATE-MEDIA.
*Nguồn:* BA 4.1, 4.2.
*Sprint:* S3. *Story Points:* **10** (tổng điểm 2 Task, 40 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-07.2.1 | Người chơi vào phòng | Khung media | Camera và mic mặc định **Tắt** | E2E |
| AC-07.2.2 | Người chơi | Bật/tắt camera, bật/tắt mic | Hai nút độc lập; đối thủ thấy/nghe hoặc ngừng thấy/nghe trong ≤ 2 giây | M |
| AC-07.2.3 | Trình duyệt bị từ chối quyền camera/mic hoặc không có thiết bị | Bấm bật | Báo lỗi tiếng Việt dễ hiểu kèm cách cấp quyền; ván không bị ảnh hưởng | M |
| AC-07.2.4 | Tab mới tiếp quản phiên | Hệ thống | Camera/mic ở tab cũ tự dừng; tab mới mặc định tắt | M |
| AC-07.2.5 | Bất kỳ | Kiểm tra cấu hình | Không bật ghi hình/ghi âm; không lưu media | M |
| AC-07.2.6 | Người chơi rời ghế/rời phòng | Hệ thống | Luồng media của người đó dừng, quyền phát bị thu hồi | I |
| AC-07.2.7 | Người chơi trong phòng tự tạo | Xem mức chia sẻ | Ba mức: *Không chia sẻ* · *Chỉ đối thủ* · *Cả đối thủ và người xem*; chọn sẵn **Chỉ đối thủ**; một mức áp chung cho camera và mic đang bật | E2E |
| AC-07.2.8 | Chọn "Cả đối thủ và người xem" | Người xem | Thấy hình/nghe tiếng của người chơi đó | M |
| AC-07.2.9 | Chọn "Chỉ đối thủ" hoặc "Không chia sẻ" | Người xem / đối thủ | Người xem không nhận; "Không chia sẻ" thì đối thủ cũng không nhận | M |
| AC-07.2.10 | Người xem | Giao diện và token | Không có nút bật camera/mic; token không có quyền phát (`canPublish = false`, `canPublishData = false`) | I, E2E |
| AC-07.2.11 | Đổi mức chia sẻ giữa ván | Hệ thống | Có hiệu lực ngay (≤ 2 giây) | M |
| AC-07.2.12 | Hai người chơi đang ở phòng chờ | Bật camera/mic | Đối thủ (và người xem nếu chọn mức "Cả đối thủ và người xem") thấy/nghe ngay trong phòng chờ; khi bắt đầu ván, hình và tiếng không bị ngắt (BA 0.13) | E2E, M |
| AC-07.2.13 | Dịch vụ camera/mic lỗi, mất kết nối hoặc hết hạn mức | Đang ở phòng chờ hoặc đang ván | Ván tiếp tục bình thường, chat vẫn hoạt động, khung media hiện *"Camera/mic tạm thời không dùng được"*, không xử ai thua (BA 0.14) | I, M |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 22/10 (trước khi Task đầu tiên bắt đầu). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 3.

#### T33 · Camera/mic LiveKit: token, quyền phát, mức chia sẻ, khung media (BE + FE)

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T33 · Camera/mic LiveKit: token, quyền phát, mức chia sẻ, khung media (BE + FE) |
| Parent (Epic) | EP-07 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 22/10/2026 |
| Due date | 25/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 32 giờ |
| Story Points | 8 |
| Labels | `sprint-3`, `phat-trien` |
| Story (relates to) | US-07.2 |
| Is blocked by | T06, T22, T25 |

**Description**

**Mục tiêu:** Camera/mic LiveKit: token, quyền phát, mức chia sẻ, khung media (BE + FE) — phục vụ US-07.2 Camera, mic và mức chia sẻ (EP-07 Chat, camera và mic).
**Đầu vào (phải xong trước):** T06 (Spike media: LiveKit tự chạy + LiveKit Cloud, HTTPS demo LAN (GATE-MEDIA)), T22 (BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập), T25 (FE phòng thi đấu: nối nước đi, đồng hồ, hộp kết quả).
**Việc cần làm:**
- Máy chủ: cấp token LiveKit theo vai trò (người xem `canPublish=false`), áp mức chia sẻ, thu hồi khi rời ghế/bị đuổi
- Client: `PANEL-MEDIA` ở **cả phòng chờ và phòng thi đấu**, không ngắt khi chuyển sang ván (BA 0.13); bật/tắt camera và mic độc lập (mặc định tắt), chọn 3 mức chia sẻ (chọn sẵn Chỉ đối thủ), báo lỗi quyền thiết bị, dừng khi tab bị tiếp quản
- Lỗi dịch vụ media/hết hạn mức: ván và chat tiếp tục, khung media hiện "Camera/mic tạm thời không dùng được" (BA 0.14)
**Đầu ra:** Camera/mic hoạt động giữa hai người chơi và người xem.
**Cách kiểm và điều kiện PASS:** AC của US-07.2. PASS khi test tích hợp token xanh và thử thật trên 2 máy + 1 người xem đúng theo mức chia sẻ.
**Lịch:** Tình · 32 giờ · 8 Story Points · 22/10 sáng → 25/10 chiều · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-07.2; luật ở BA-SCOPE-DECISIONS.md.

#### T45 · Kiểm thử US-07.2

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T45 · Kiểm thử US-07.2 |
| Parent (Epic) | EP-07 |
| Assignee | Thư |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 27/10/2026 |
| Due date | 27/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 8 giờ |
| Story Points | 2 |
| Labels | `sprint-3`, `kiem-thu` |
| Story (relates to) | US-07.2 |
| Is blocked by | T33 |

**Description**

**Mục tiêu:** Kiểm thử US-07.2 — phục vụ US-07.2 Camera, mic và mức chia sẻ (EP-07 Chat, camera và mic).
**Đầu vào (phải xong trước):** T33 (Camera/mic LiveKit: token, quyền phát, mức chia sẻ, khung media (BE + FE)).
**Việc cần làm:**
- Chạy TC của US-07.2 trên hai máy thật và một điện thoại
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-07.2 đạt.
**Lịch:** Thư · 8 giờ · 2 Story Points · 27/10 sáng → 27/10 chiều · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-07.2; luật ở BA-SCOPE-DECISIONS.md.

---

<a id="ep-08"></a>
## EP-08 · Đánh với máy theo cấp độ

| Trường | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | EP-08 · Đánh với máy theo cấp độ |
| Parent (Epic) | — |
| Assignee | Tình |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 03/11/2026 |
| Sprint | — |
| Fix version | v1.0 |
| Original Estimate | — |
| Story Points | — |
| Labels | `EP-08`, `dac-ta` |
| Yêu cầu khách hàng | YC8 |
| Story con | US-08.1, US-08.2, US-08.3 |
| Số Task / tổng giờ | 7 Task · 108 giờ |
| Tổng điểm các Task | 26 |

**Description**

Máy cờ ba cấp Dễ/Trung bình/Khó, chọn phe, Ván mới, ổn định ván với máy.

Yêu cầu khách hàng: YC8. Story: US-08.1, US-08.2, US-08.3.

### US-08.1 · Thiết lập và chơi ván với máy

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-08.1 · Thiết lập và chơi ván với máy |
| Parent (Epic) | EP-08 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 22/10/2026 |
| Sprint | — |
| Fix version | v0.3 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-08` |
| Hạn theo R1 | 22/10 (ngày Task đầu tiên bắt đầu) |
| Thi công | XIAN Sprint 3 · Task đầu 22/10 → Task cuối 26/10 |
| Task thực hiện | T34, T38, T43 (3 Task · 36 giờ) |
| Tổng điểm các Task | 8 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** người chơi, **tôi muốn** chọn cấp độ và phe rồi chơi với máy không giới hạn thời gian, **để** luyện tập.
*Nguồn:* BA 2.0 mục 4, 6.3, 0.9. *Màn hình:* `MODAL-AI-SETUP`, `SCR-AI-GAME`.
*Sprint:* S3. *Story Points:* **8** (tổng điểm 3 Task, 36 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-08.1.1 | Ở Sảnh | Bấm "Đánh với máy" | Mở hộp chọn cấp **Dễ / Trung bình / Khó** và phe **Đỏ / Đen / Ngẫu nhiên** | E2E |
| AC-08.1.2 | Chọn Đỏ | Bắt đầu | Vào `/ai/:id`, người chơi đi trước | E2E |
| AC-08.1.3 | Chọn Đen | Bắt đầu | Máy đi nước đầu ngay; bàn cờ lật để Đen ở dưới | E2E |
| AC-08.1.4 | Chọn Ngẫu nhiên | Bắt đầu (lặp nhiều lần) | Máy chủ bốc phe; tỷ lệ xấp xỉ 50/50 | U |
| AC-08.1.5 | Đang ván AI | Màn hình | Không có đồng hồ, không có nút Xin hoà, không gợi ý nước đi, không có nút Đi lại (P2); có nút Đầu hàng | E2E |
| AC-08.1.6 | Ván AI kết thúc (kể cả đầu hàng) | Hộp kết quả | Có "Ván mới" và "Về Sảnh" | E2E |
| AC-08.1.7 | Bấm "Ván mới" | Hệ thống | Mở `MODAL-AI-SETUP` điền sẵn cấp độ và lựa chọn phe ván trước; người chơi đổi phe/cấp rồi Bắt đầu → ván mới có ID mới | E2E |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 22/10 (trước khi Task đầu tiên bắt đầu). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 3.

#### T34 · BE ván với máy: tạo ván, chọn phe, đầu hàng, Ván mới

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T34 · BE ván với máy: tạo ván, chọn phe, đầu hàng, Ván mới |
| Parent (Epic) | EP-08 |
| Assignee | Cường |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 22/10/2026 |
| Due date | 23/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 16 giờ |
| Story Points | 3 |
| Labels | `sprint-3`, `phat-trien` |
| Story (relates to) | US-08.1 |
| Is blocked by | T20, T24 |

**Description**

**Mục tiêu:** BE ván với máy: tạo ván, chọn phe, đầu hàng, Ván mới — phục vụ US-08.1 Thiết lập và chơi ván với máy (EP-08 Đánh với máy theo cấp độ).
**Đầu vào (phải xong trước):** T20 (BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván), T24 (Máy cờ 3 cấp: negamax + alpha-beta, tìm sâu dần, tiến trình riêng).
**Việc cần làm:**
- API ván với máy: tạo ván `/ai/:id` theo cấp và phe (Ngẫu nhiên do máy chủ bốc), máy đi trước khi người cầm Đen
- Đầu hàng, kết thúc, Ván mới (giữ cấp/phe để điền sẵn), không đồng hồ, không xin hoà
**Đầu ra:** Dịch vụ ván với máy + test tích hợp.
**Cách kiểm và điều kiện PASS:** AC U/I của US-08.1. PASS khi test tích hợp xanh, tỷ lệ phe Ngẫu nhiên xấp xỉ 50/50 trên 200 lần.
**Lịch:** Cường · 16 giờ · 3 Story Points · 22/10 sáng → 23/10 chiều · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-08.1; luật ở BA-SCOPE-DECISIONS.md.

#### T38 · FE hộp chọn cấp/phe và màn đánh với máy

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T38 · FE hộp chọn cấp/phe và màn đánh với máy |
| Parent (Epic) | EP-08 |
| Assignee | Kỳ |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 24/10/2026 |
| Due date | 25/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 12 giờ |
| Story Points | 3 |
| Labels | `sprint-3`, `phat-trien` |
| Story (relates to) | US-08.1 |
| Is blocked by | T19, T34 |

**Description**

**Mục tiêu:** FE hộp chọn cấp/phe và màn đánh với máy — phục vụ US-08.1 Thiết lập và chơi ván với máy (EP-08 Đánh với máy theo cấp độ).
**Đầu vào (phải xong trước):** T19 (FE đi cờ click/kéo thả, gợi ý ô, đánh dấu, âm thanh), T34 (BE ván với máy: tạo ván, chọn phe, đầu hàng, Ván mới).
**Việc cần làm:**
- `MODAL-AI-SETUP` (cấp, phe), màn `SCR-AI-GAME` dùng lại `<Board>`, hộp kết quả Ván mới / Về Sảnh
**Đầu ra:** Giao diện đánh với máy.
**Cách kiểm và điều kiện PASS:** AC E2E của US-08.1. PASS khi Playwright đánh với máy ở cả ba cấp và bấm Ván mới đổi phe.
**Lịch:** Kỳ · 12 giờ · 3 Story Points · 24/10 chiều → 25/10 chiều · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-08.1; luật ở BA-SCOPE-DECISIONS.md.

#### T43 · Kiểm thử US-08.1

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T43 · Kiểm thử US-08.1 |
| Parent (Epic) | EP-08 |
| Assignee | Thư |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 26/10/2026 |
| Due date | 26/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 8 giờ |
| Story Points | 2 |
| Labels | `sprint-3`, `kiem-thu` |
| Story (relates to) | US-08.1 |
| Is blocked by | T38 |

**Description**

**Mục tiêu:** Kiểm thử US-08.1 — phục vụ US-08.1 Thiết lập và chơi ván với máy (EP-08 Đánh với máy theo cấp độ).
**Đầu vào (phải xong trước):** T38 (FE hộp chọn cấp/phe và màn đánh với máy).
**Việc cần làm:**
- Chạy TC của US-08.1
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-08.1 đạt.
**Lịch:** Thư · 8 giờ · 2 Story Points · 26/10 sáng → 26/10 chiều · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-08.1; luật ở BA-SCOPE-DECISIONS.md.

### US-08.2 · Máy cờ ba cấp độ

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-08.2 · Máy cờ ba cấp độ |
| Parent (Epic) | EP-08 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 18/10/2026 |
| Sprint | — |
| Fix version | v0.2 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-08` |
| Hạn theo R1 | 18/10 (ngày Task đầu tiên bắt đầu) |
| Thi công | XIAN Sprint 2 · Task đầu 18/10 → Task cuối 21/10 |
| Task thực hiện | T24 (1 Task · 32 giờ) |
| Tổng điểm các Task | 8 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** người chơi, **tôi muốn** ba cấp độ khác biệt rõ rệt, **để** luyện từ dễ đến khó.
*Nguồn:* BA 6.1 (kèm tiêu chí bổ sung 05/10), 6.3 mục 3. *Ghi chú:* negamax + alpha-beta, tìm sâu dần, chạy ở tiến trình/worker riêng; dùng `xiangqi-core`.
*Sprint:* S2. *Story Points:* **8** (tổng điểm 1 Task, 32 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-08.2.1 | Mọi cấp, mọi thế | Máy chọn nước | Luôn là nước hợp lệ theo `xiangqi-core` | U |
| AC-08.2.2 | Hết ngân sách thời gian khi chưa đạt độ sâu mục tiêu | Máy chọn nước | Đi nước tốt nhất đã tìm được đến lúc đó | U |
| AC-08.2.3 | Máy đang suy nghĩ | Server chính xử lý các phòng khác | Phòng online không bị chậm vì máy cờ (chạy ở tiến trình riêng) | I |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 18/10 (trước khi Task đầu tiên bắt đầu). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 2.

#### T24 · Máy cờ 3 cấp: negamax + alpha-beta, tìm sâu dần, tiến trình riêng

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T24 · Máy cờ 3 cấp: negamax + alpha-beta, tìm sâu dần, tiến trình riêng |
| Parent (Epic) | EP-08 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 18/10/2026 |
| Due date | 21/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 32 giờ |
| Story Points | 8 |
| Labels | `sprint-2`, `phat-trien` |
| Story (relates to) | US-08.2 |
| Is blocked by | T10 |

**Description**

**Mục tiêu:** Máy cờ 3 cấp: negamax + alpha-beta, tìm sâu dần, tiến trình riêng — phục vụ US-08.2 Máy cờ ba cấp độ (EP-08 Đánh với máy theo cấp độ).
**Đầu vào (phải xong trước):** T10 (Lõi luật cờ (3/3): luật kết thúc ván, perft, độ phủ kiểm thử).
**Việc cần làm:**
- Negamax + alpha-beta, tìm sâu dần, bảng chuyển vị đơn giản, sắp xếp nước; hàm lượng giá vật chất + vị trí
- Chạy ở tiến trình/worker riêng; ngân sách 300 / 1.000 / 3.000 ms theo cấp; luôn trả nước hợp lệ tốt nhất đã tìm được
**Đầu ra:** Gói `packages/engine` + tiến trình máy cờ gọi được từ server.
**Cách kiểm và điều kiện PASS:** AC-08.2.1 → AC-08.2.3. PASS khi unit test xanh và chạy 100 thế ngẫu nhiên không trả nước sai luật.
**Lịch:** Tình · 32 giờ · 8 Story Points · 18/10 sáng → 21/10 chiều · XIAN Sprint 2.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-08.2; luật ở BA-SCOPE-DECISIONS.md.

### US-08.3 · Ổn định ván với máy và hoàn thiện cấp Khó

| Trường | Giá trị |
|---|---|
| Issue Type | Story |
| Summary | US-08.3 · Ổn định ván với máy và hoàn thiện cấp Khó |
| Parent (Epic) | EP-08 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 07/10/2026 |
| Due date | 03/11/2026 |
| Sprint | — |
| Fix version | v1.0 |
| Original Estimate | — |
| Story Points | — |
| Labels | `dac-ta`, `EP-08` |
| Hạn theo R1 | 03/11 (ngoại lệ: GATE-ENGINE: cấp Khó phải đo thời gian nghĩ trên máy demo mới chốt được AC) |
| Thi công | XIAN Sprint 4 · Task đầu 31/10 → Task cuối 03/11 |
| Task thực hiện | T59, T63, T68 (3 Task · 40 giờ) |
| Tổng điểm các Task | 10 (chỉ ghi trong Description, không nhập trường Story Points) |

**Description (User Story + AC)**

**Là** người chơi, **tôi muốn** ván với máy không mất vô lý khi rớt mạng hoặc máy cờ lỗi, và cấp Khó đạt chất lượng đã cam kết, **để** yên tâm luyện tập.
*Nguồn:* BA 6.1 (Thử lại), 6.3 mục 4, 1.8.
*Sprint:* S4. *Story Points:* **10** (tổng điểm 3 Task, 40 giờ).

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-08.3.1 | Đang ván AI | Đóng tab hoặc mất mạng, quay lại trong 30 phút | Vào lại `/ai/:id` (hoặc banner ở Sảnh) và chơi tiếp đúng thế cũ | E2E |
| AC-08.3.2 | Quá 30 phút | Hệ thống | Bỏ trạng thái ván trong bộ nhớ; không lưu lịch sử (P1) | I |
| AC-08.3.3 | Máy cờ không trả lời quá 10 giây hoặc lỗi | Hệ thống | Báo *"Máy cờ gặp sự cố"* kèm "Thử lại"; nếu chỉ quá thời gian chờ thì Thử lại tìm nước trên cùng thế; nếu ván đã Bỏ dở thì Thử lại tạo ván mới cùng cấp và phe thực tế | I, M |
| AC-08.3.4 | Bấm "Thử lại" nhiều lần liên tiếp | Hệ thống | Chỉ xử lý một lần (chặn bấm trùng) | I |
| AC-08.3.5 | Máy chủ khởi động lại | Người chơi quay lại | *"Ván không còn trạng thái để tiếp tục"*, về Sảnh hoặc tạo ván mới; không khôi phục giả | M |
| AC-08.3.6 | Đang ván AI | Chủ động Rời ván hoặc Đăng xuất | Xác nhận đầu hàng; Đồng ý → `RESIGN`, huỷ tác vụ máy, giải phóng vị trí chơi; Huỷ → giữ nguyên | E2E |
| AC-08.3.7 | Cấp Dễ / Trung bình / Khó | Máy suy nghĩ | Mục tiêu độ sâu 2 / 4 / 6; thời gian phản hồi ≤ 300 / 1.000 / 3.000 ms (đo p95 trên máy demo, GATE-ENGINE) | I |
| AC-08.3.8 | Bộ thế chiếu hết 1 nước và 2 nước bắt buộc (đáp án đã xác minh) | Cấp Khó giải | Đúng **100%** | U |
| AC-08.3.9 | Đấu máy với máy 20 ván mỗi cặp cấp | Ghi kết quả | Khó thắng Trung bình và Trung bình thắng Dễ ở đa số ván (báo cáo tỷ lệ) | M |

Story là phần việc BA: Done khi đặc tả và AC được PO duyệt, hạn 03/11 (ngoại lệ R1 — GATE-ENGINE: cấp Khó phải đo thời gian nghĩ trên máy demo mới chốt được AC). Nghiệm thu chức năng: Task kiểm thử của Story, theo Definition of Done ở BACKLOG-P1.md mục 2.2. Thi công trong XIAN Sprint 4.

#### T59 · Tinh chỉnh cấp Khó, bộ thế chiếu hết, GATE-ENGINE, giao diện sự cố máy cờ

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T59 · Tinh chỉnh cấp Khó, bộ thế chiếu hết, GATE-ENGINE, giao diện sự cố máy cờ |
| Parent (Epic) | EP-08 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Start date | 31/10/2026 |
| Due date | 02/11/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 20 giờ |
| Story Points | 5 |
| Labels | `sprint-4`, `phat-trien` |
| Story (relates to) | US-08.3 |
| Is blocked by | T24 |

**Description**

**Mục tiêu:** Tinh chỉnh cấp Khó, bộ thế chiếu hết, GATE-ENGINE, giao diện sự cố máy cờ — phục vụ US-08.3 Ổn định ván với máy và hoàn thiện cấp Khó (EP-08 Đánh với máy theo cấp độ).
**Đầu vào (phải xong trước):** T24 (Máy cờ 3 cấp: negamax + alpha-beta, tìm sâu dần, tiến trình riêng).
**Việc cần làm:**
- Tinh chỉnh lượng giá và cắt tỉa để cấp Khó đạt độ sâu 6 trong 3 giây; đo p95 cả ba cấp trên máy demo (GATE-ENGINE)
- Bộ thế chiếu hết 1 và 2 nước có đáp án đã xác minh: cấp Khó giải 100%; đấu máy với máy 20 ván mỗi cặp cấp
- Giao diện "Máy cờ gặp sự cố" + Thử lại trên `SCR-AI-GAME`
**Đầu ra:** Máy cờ hoàn thiện + báo cáo GATE-ENGINE.
**Cách kiểm và điều kiện PASS:** AC về thời gian, chiếu hết và phân cấp sức mạnh của US-08.3. PASS khi đạt ngưỡng; không đạt thì ghi BLOCKED và báo PO, không tự hạ ngưỡng.
**Lịch:** Tình · 20 giờ · 5 Story Points · 31/10 sáng → 02/11 sáng · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-08.3; luật ở BA-SCOPE-DECISIONS.md.

#### T63 · BE giữ ván AI 30 phút, Thử lại, khởi động lại

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T63 · BE giữ ván AI 30 phút, Thử lại, khởi động lại |
| Parent (Epic) | EP-08 |
| Assignee | Đông |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 01/11/2026 |
| Due date | 02/11/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 12 giờ |
| Story Points | 3 |
| Labels | `sprint-4`, `phat-trien` |
| Story (relates to) | US-08.3 |
| Is blocked by | T34 |

**Description**

**Mục tiêu:** BE giữ ván AI 30 phút, Thử lại, khởi động lại — phục vụ US-08.3 Ổn định ván với máy và hoàn thiện cấp Khó (EP-08 Đánh với máy theo cấp độ).
**Đầu vào (phải xong trước):** T34 (BE ván với máy: tạo ván, chọn phe, đầu hàng, Ván mới).
**Việc cần làm:**
- Giữ ván AI 30 phút khi mất kết nối, vào lại `/ai/:id`
- Máy cờ không trả lời quá 10 giây: Thử lại (cùng thế hoặc ván mới theo BA 6.1), chặn bấm trùng; khởi động lại máy chủ → thông báo không tiếp tục được; Rời ván/Đăng xuất = đầu hàng có xác nhận
**Đầu ra:** Xử lý ổn định ván AI + test tích hợp.
**Cách kiểm và điều kiện PASS:** AC U/I về ổn định của US-08.3. PASS khi test tích hợp xanh.
**Lịch:** Đông · 12 giờ · 3 Story Points · 01/11 chiều → 02/11 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-08.3; luật ở BA-SCOPE-DECISIONS.md.

#### T68 · Kiểm thử US-08.3

| Trường | Giá trị |
|---|---|
| Issue Type | Task |
| Summary | T68 · Kiểm thử US-08.3 |
| Parent (Epic) | EP-08 |
| Assignee | Kỳ |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Start date | 03/11/2026 |
| Due date | 03/11/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 8 giờ |
| Story Points | 2 |
| Labels | `sprint-4`, `kiem-thu` |
| Story (relates to) | US-08.3 |
| Is blocked by | T59, T63 |

**Description**

**Mục tiêu:** Kiểm thử US-08.3 — phục vụ US-08.3 Ổn định ván với máy và hoàn thiện cấp Khó (EP-08 Đánh với máy theo cấp độ).
**Đầu vào (phải xong trước):** T59 (Tinh chỉnh cấp Khó, bộ thế chiếu hết, GATE-ENGINE, giao diện sự cố máy cờ), T63 (BE giữ ván AI 30 phút, Thử lại, khởi động lại).
**Việc cần làm:**
- Chạy TC của US-08.3, đối chiếu báo cáo GATE-ENGINE
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-08.3 đạt hoặc có ghi BLOCKED được PO xác nhận.
**Lịch:** Kỳ · 8 giờ · 2 Story Points · 03/11 sáng → 03/11 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-08.3; luật ở BA-SCOPE-DECISIONS.md.

