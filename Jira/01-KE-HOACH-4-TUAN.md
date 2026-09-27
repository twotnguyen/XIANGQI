# 01 — KẾ HOẠCH 4 TUẦN (28/09 – 23/10/2026)

**Dự án:** Cờ Tướng Online · **Jira:** `XW` (board Scrum `XW board`) · **Cập nhật:** 2026-09-27

---

## 1. TỔNG QUAN SỐ LƯỢNG

| Hạng mục | Số lượng |
|---|---:|
| Epic | **16** |
| Story | **55** |
| Task (loại Task trên Jira) | **135** |
| — Backend `[BE]` | 57 |
| — Frontend `[FE]` | 28 |
| — AI `[AI]` | 11 |
| — Design `[DS]` | 8 |
| — DevOps `[OPS]` | 11 |
| — Tester `[QA]` (kiểm thử tích hợp nhiều Task / toàn hệ thống) | 20 |
| Tổng ước lượng | **879.5 giờ** = 608h làm + 202.5h Tester kiểm ở bước Ready For Test + 69h Task Tester tích hợp |
| Cổng chặn | 2 — cổng đo AI (ST04.3) · cổng media (ST14.1) |

**Cách kiểm thử:** mỗi Task phát triển/thiết kế (115 Task) có sẵn mục **"🧪 Kiểm thử khi Ready for Test"** gồm ca kiểm thử, tiêu chí PASS và bằng chứng. Người làm xong kéo Task sang **Ready For Test** thì Tester vào kiểm. PASS thì Tester kéo sang **Done**; FAIL thì Tester tạo Bug và kéo Task về **In Progress**. Chi tiết quy trình ở [00-CAU-HINH-JIRA.md §10](00-CAU-HINH-JIRA.md).

## 2. DANH SÁCH EPIC

| Epic | Tên | Story | Sprint | Vai trò chính |
|---|---|---:|---|---|
| EP01 | Nền tảng kho mã & môi trường phát triển | 3 | 1 | DevOps, Backend, Frontend |
| EP02 | Thiết kế giao diện & trải nghiệm (UI/UX) | 4 | 1–2 | Design |
| EP03 | Contracts dùng chung & luật cờ | 3 | 1 | Backend |
| EP04 | AI máy cờ: lượng giá, tìm kiếm và cổng đo | 3 | 2 | AI |
| EP05 | Cơ sở dữ liệu, phân quyền dữ liệu và harness test tích hợp | 3 | 1–2 | Backend |
| EP06 | Tài khoản & xác thực | 4 | 2–3 | Backend, Frontend, DevOps |
| EP07 | Hồ sơ, bạn bè và trạng thái online | 2 | 3 | Backend, Frontend |
| EP08 | Phòng, sảnh và lời mời | 4 | 2–4 | Backend, Frontend |
| EP09 | Người xem: vào xem, trần 5 người, thu hồi, đuổi | 2 | 4 | Backend, Frontend |
| EP10 | Bàn cờ giao diện & ván online thời gian thực | 4 | 2–4 | Frontend, Backend |
| EP11 | Đồng hồ, mất kết nối và chống treo ván | 3 | 3–4 | Backend, Frontend |
| EP12 | Thao tác trong ván, lịch sử, xem lại và tái đấu | 3 | 4 | Backend, Frontend |
| EP13 | Chat hai kênh (riêng người chơi + chung) | 2 | 4 | Backend, Frontend |
| EP14 | Camera & micro (LiveKit) | 4 | 2–4 | DevOps, Backend, Frontend |
| EP15 | Chơi với máy: tiến trình riêng, hàng đợi, tích hợp ván, thí nghiệm 60 ván | 3 | 3–4 | AI, Backend, Frontend |
| EP16 | Hoàn thiện, bảo mật, thử tải, nghiệm thu, triển khai, bàn giao | 8 | 3–4 | Tất cả |

## 3. MỤC TIÊU TỪNG SPRINT

| Sprint · Fix version | Ngày | Mục tiêu (Sprint Goal ghi trên Jira) | Kết quả demo cuối sprint |
|---|---|---|---|
| **1** · `v0.1.0` | 28/09 – 04/10 | Kho mã + CI + Supabase local chạy được; contracts + **luật cờ đầy đủ**; migration hồ sơ/bạn bè/phòng/ván; design system, bàn cờ, các màn thiết kế | `pnpm` 4 cổng xanh trên CI; `getLegalMoves` thế ban đầu = 44; chiếu hết / hết nước / lặp 3 lần đúng; bản thiết kế được duyệt |
| **2** · `v0.2.0` | 05/10 – 11/10 | Migration chat/media/phiên + RLS + harness; guard + đăng ký/xác minh email; **cổng AI**; **cổng media**; bàn cờ SVG; tạo phòng/nhận người | Đăng ký thật với email local; bàn cờ đi nước cục bộ; số đo thật p95 depth 6 và byte RTP |
| **3** · `v0.3.0` | 12/10 – 18/10 | Đăng nhập/phiên/đăng xuất, quên mật khẩu, Google; gateway + đường xử lý lệnh + đi nước + finalizer + snapshot; sảnh/phòng chờ/sẵn sàng; rời phòng/cài đặt; đồng hồ máy chủ; chính sách + token + thu hồi media; tiến trình AI + hàng đợi; thí nghiệm 60 ván; bạn bè/presence; bảo mật cơ bản; triển khai bản đầu | Hai người tạo phòng, sẵn sàng, bắt đầu ván (API); ván tự kết thúc khi hết giờ; web chạy trên Vercel/Render |
| **4** · `v1.0.0` | 19/10 – 23/10 | Màn phòng chơi realtime; lời mời; người xem; mất kết nối; chống treo ván; thao tác ván; lịch sử/tái đấu; chat; giao diện media; chơi với máy; responsive/trợ năng; ma trận quyền; thử tải; nghiệm thu; kiểm Internet; bàn giao | Kịch bản xương sống 8 phiên chạy xanh; báo cáo nghiệm thu R01–R19; hồ sơ bảo vệ |

Một Story chỉ được tính vào kết quả sprint khi **mọi Task của nó (nhãn `stxx-y`) đã Done**, tức là đã được Tester kiểm và PASS. Ngày "Done (dự kiến)" trong các bảng dưới đã tính cả thời gian kiểm thử.

## 4. STORY THEO SPRINT (ngày = sớm nhất theo phụ thuộc)

### Sprint 1 (28/09 – 04/10) — 9 Story, 51 SP

| Story | Tên | Bắt đầu | Done (dự kiến) | SP | Vai trò làm | Task `[QA]` tích hợp | Bị chặn bởi |
|---|---|---|---|---|---|---|---|
| ST01.1 | Kho mã monorepo, lint và khung kiểm thử | 28/09 | 29/09 | 8 | OPS | 1 | — |
| ST02.1 | Design system và bàn cờ | 28/09 | 29/09 | 5 | DS | — | — |
| ST01.2 | CI 4 cổng và Supabase local | 29/09 | 30/09 | 5 | OPS · BE | 1 | ST01.1 |
| ST01.3 | Khung ứng dụng web (router, token, bố cục) | 29/09 | 30/09 | 2 | FE | — | ST01.1, ST02.1 |
| ST02.2 | Màn tài khoản, bạn bè, sảnh, phòng chờ, lời mời, người xem | 29/09 | 29/09 | 5 | DS | — | ST02.1 |
| ST03.1 | Contracts: kiểu dữ liệu, toạ độ, schema Zod, mã lỗi | 29/09 | 30/09 | 5 | BE | — | ST01.1 |
| ST03.2 | Thế cờ ban đầu, khoá lặp, hình học tấn công, nước đi 7 loại quân | 29/09 | 01/10 | 8 | BE | — | ST03.1 |
| ST05.1 | Migration hồ sơ, bạn bè, phòng, lời mời, ván và cây nước đi | 29/09 | 01/10 | 8 | BE | — | ST01.2 |
| ST03.3 | Nước hợp lệ, áp dụng nước, kết thúc ván và lặp 3 lần | 01/10 | 02/10 | 5 | BE | — | ST03.1, ST03.2 |

### Sprint 2 (05/10 – 11/10) — 11 Story, 54 SP

| Story | Tên | Bắt đầu | Done (dự kiến) | SP | Vai trò làm | Task `[QA]` tích hợp | Bị chặn bởi |
|---|---|---|---|---|---|---|---|
| ST02.3 | Màn ván online: thao tác, đồng hồ, chống treo, mất kết nối, kết quả, chat, media | 05/10 | 06/10 | 5 | DS | — | ST02.1 |
| ST04.1 | Lượng giá thế cờ và sắp xếp nước | 05/10 | 06/10 | 3 | AI | — | ST03.3 |
| ST05.2 | Migration chat, media, AI, phiên + RLS | 05/10 | 06/10 | 8 | BE | — | ST05.1 |
| ST10.1 | Bàn cờ SVG: vẽ, quân, chọn/đích, lật, bàn phím, chuyển động | 05/10 | 07/10 | 8 | FE | — | ST01.3, ST02.1, ST03.2, ST03.3 |
| ST14.1 | ⛔ Cổng media: LiveKit local + đo byte RTP thật | 05/10 | 06/10 | 5 | OPS · BE | 1 | ST01.2 |
| ST02.4 | Màn chơi với máy, lịch sử và xem lại | 06/10 | 06/10 | 2 | DS | — | ST02.3 |
| ST04.2 | Tìm kiếm negamax, alpha-beta và đào sâu dần | 06/10 | 07/10 | 5 | AI | — | ST04.1 |
| ST05.3 | Harness test tích hợp thật + Prisma db pull + pool SQL | 06/10 | 07/10 | 3 | BE | — | ST05.2 |
| ST04.3 | ⛔ Cổng đo depth 6/3000 ms và bộ 20 thế cờ có đáp án tay | 07/10 | 08/10 | 5 | AI | — | ST04.2 |
| ST06.1 | Guard xác thực API, đăng ký và xác minh email | 07/10 | 09/10 | 5 | BE · FE | — | ST01.3, ST02.2, ST03.1, ST05.3 |
| ST08.1 | Tạo phòng và nhận người vào phòng không vượt trần | 08/10 | 09/10 | 5 | BE | — | ST05.2, ST06.1 |

### Sprint 3 (12/10 – 18/10) — 15 Story, 87 SP

| Story | Tên | Bắt đầu | Done (dự kiến) | SP | Vai trò làm | Task `[QA]` tích hợp | Bị chặn bởi |
|---|---|---|---|---|---|---|---|
| ST06.2 | Đăng nhập bằng username, phiên 30 ngày/phiên tạm, đăng xuất | 12/10 | 14/10 | 8 | BE · FE | — | ST01.3, ST02.2, ST06.1 |
| ST07.1 | Hồ sơ, tìm người dùng, kết bạn | 12/10 | 14/10 | 5 | BE · FE | — | ST02.2, ST06.1, ST06.2 |
| ST07.2 | Trạng thái online và trang bạn bè | 12/10 | 14/10 | 5 | BE · FE | — | ST02.2, ST07.1, ST10.2 |
| ST08.2 | Sảnh, sẵn sàng/bắt đầu ván, đổi bên và giao diện phòng chờ | 12/10 | 15/10 | 8 | BE · FE | — | ST02.2, ST05.1, ST08.1, ST10.2 |
| ST10.2 | Gateway realtime, presence/heartbeat, đường xử lý lệnh + biên lai | 12/10 | 13/10 | 8 | BE | 1 | ST05.3, ST06.2, ST08.1 |
| ST14.2 | Chính sách camera/micro, cấp token 4 phòng, thu hồi xoay thế hệ | 12/10 | 14/10 | 8 | BE | — | ST05.2, ST08.1, ST10.2, ST14.1 |
| ST15.1 | Tiến trình AI riêng, worker thread, huỷ tức thì, hàng đợi 2/8 | 12/10 | 14/10 | 8 | AI · BE | 2 | ST04.3, ST05.2 |
| ST15.3 | Thí nghiệm 60 ván và báo cáo thuật toán tái lập được | 12/10 | 13/10 | 3 | AI | — | ST04.3 |
| ST16.7 | Giới hạn tần suất, kích thước body, CORS và tiêu đề bảo mật | 12/10 | 13/10 | 2 | BE | — | ST10.2 |
| ST16.8 | Hạ tầng Internet bản đầu: /healthz, triển khai Vercel + Render, môi trường thử tải | 12/10 | 15/10 | 5 | BE · OPS | 1 | ST01.2, ST06.4, ST15.1, ST16.7 |
| ST06.3 | Quên mật khẩu, đặt lại và chọn username lần đầu | 13/10 | 14/10 | 5 | BE · FE | — | ST01.3, ST02.2, ST06.1, ST06.2 |
| ST10.3 | Đi nước, cây nước đi, hàm kết thúc ván, snapshot đồng bộ | 13/10 | 16/10 | 8 | BE | — | ST03.3, ST10.2 |
| ST06.4 | Đăng nhập Google (tài nguyên ngoài) | 14/10 | 15/10 | 3 | OPS · FE | 1 | ST06.3 |
| ST08.3 | Rời/đóng phòng, đổi cài đặt và thu hồi người xem | 14/10 | 16/10 | 8 | BE · FE | — | ST02.2, ST08.2, ST10.3 |
| ST11.1 | Đồng hồ ván và bộ đếm hết giờ (máy chủ) | 15/10 | 16/10 | 3 | BE | — | ST10.3 |

### Sprint 4 (19/10 – 23/10) — 20 Story, 93 SP

| Story | Tên | Bắt đầu | Done (dự kiến) | SP | Vai trò làm | Task `[QA]` tích hợp | Bị chặn bởi |
|---|---|---|---|---|---|---|---|
| ST08.4 | Mã phòng, link mời, mời trực tiếp, hộp thư lời mời | 19/10 | 21/10 | 8 | BE · FE | — | ST02.2, ST07.1, ST07.2, ST08.1, ST08.3 |
| ST09.1 | Vào xem theo chế độ, trần 5 người, giữ ghế 15 giây | 19/10 | 20/10 | 3 | BE | 1 | ST08.1, ST08.4, ST10.2 |
| ST10.4 | Màn phòng chơi realtime (8 phiên) + hiển thị đồng hồ | 19/10 | 20/10 | 5 | FE | — | ST02.3, ST08.2, ST10.1, ST10.3, ST11.1 |
| ST11.2 | Ân hạn mất kết nối 60 giây, cả hai offline, khởi động lại máy chủ | 19/10 | 20/10 | 5 | BE · FE | — | ST10.2, ST10.4, ST11.1 |
| ST12.1 | Đầu hàng, xin hoà/đi lại, đi lại trên cây nước, thanh thao tác | 19/10 | 21/10 | 8 | BE · FE | 1 | ST02.3, ST10.3, ST10.4, ST11.1 |
| ST12.2 | Lịch sử ván riêng tư và xem lại theo nhánh hiệu lực | 19/10 | 20/10 | 5 | BE · FE | — | ST02.4, ST10.1, ST10.3 |
| ST12.3 | Tái đấu đổi bên, đóng phòng 10 phút, màn kết quả | 19/10 | 20/10 | 5 | BE · FE | — | ST02.3, ST08.3, ST10.3, ST10.4 |
| ST13.1 | Dịch vụ chat 2 kênh: gửi, đọc lịch sử, phân quyền theo segment | 19/10 | 20/10 | 3 | BE | — | ST05.2, ST08.1, ST08.3, ST10.2 |
| ST14.3 | Giao diện media và một tab một nguồn | 19/10 | 21/10 | 8 | FE · BE | 1 | ST02.3, ST10.4, ST14.2 |
| ST16.6 | Kiểm trên môi trường Internet thật, hồ sơ bàn giao và bảo vệ | 19/10 | 22/10 | 5 | OPS · AI | 2 | ST04.3, ST06.4, ST10.4, ST12.3, ST14.3, ST15.3, ST16.4, ST16.8 |
| ST09.2 | Thu hồi hàng loạt, đuổi người xem và giao diện danh sách người xem | 20/10 | 21/10 | 5 | BE · FE | — | ST02.2, ST08.3, ST09.1 |
| ST11.3 | Chống treo ván (R17) và giao diện cho cả 3 phía | 20/10 | 21/10 | 5 | BE · FE | — | ST02.3, ST10.4, ST11.2 |
| ST13.2 | Lịch sử/phân trang, dọn 30 ngày, kiểm thu hồi end-to-end, giao diện chat 2 khung | 20/10 | 22/10 | 5 | BE · FE | — | ST02.3, ST09.2, ST10.4, ST13.1 |
| ST15.2 | Tích hợp ván với máy, đi lại với máy, giao diện chơi với máy | 20/10 | 22/10 | 5 | BE · FE | — | ST02.4, ST10.1, ST10.4, ST11.1, ST11.2, ST12.1, ST15.1 |
| ST14.4 | Kiểm thử ma trận quyền media bằng luồng thật (TS-MED-01..15) | 21/10 | 22/10 | 2 | — | 1 | ST09.2, ST14.3 |
| ST16.1 | Kiểm chứng mô hình nhiều tab (mọi tab thao tác, chống xung đột) | 21/10 | 21/10 | 1 | — | 1 | ST10.4, ST11.3, ST12.1, ST12.3, ST13.1 |
| ST16.3 | Kiểm ma trận quyền bằng dữ liệu giả mạo | 21/10 | 22/10 | 2 | — | 1 | ST09.2, ST12.2, ST13.2, ST16.7 |
| ST16.4 | Thử tải 10 phòng / 70 kết nối đồng thời | 21/10 | 22/10 | 2 | — | 1 | ST10.3, ST15.2, ST16.8 |
| ST16.2 | Responsive 4 kích thước, trợ năng WCAG AA, 5 trạng thái toàn bộ màn hình | 22/10 | 23/10 | 8 | FE · DS | 1 | ST07.2, ST10.4, ST11.3, ST12.2, ST12.3, ST13.2, ST14.3, ST15.2 |
| ST16.5 | Nghiệm thu R01–R19 (local) | 23/10 | 23/10 | 3 | — | 2 | ST14.4, ST15.3, ST16.1, ST16.2, ST16.3, ST16.4 |

## 5. KHỐI LƯỢNG THEO VAI TRÒ VÀ GỢI Ý PHÂN CÔNG

**Giờ ước lượng theo vai trò × sprint:**

| Vai trò | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 | Tổng |
|---|---:|---:|---:|---:|---:|
| Backend | 56 | 48 | 113 | 88 | 305 |
| Frontend | 6 | 25 | 37 | 83 | 151 |
| AI | 0 | 34 | 20 | 3 | 57 |
| Design | 26 | 18 | 0 | 3 | 47 |
| DevOps | 26 | 4 | 14 | 4 | 48 |
| Tester: kiểm ở bước Ready For Test | 35.5 | 39.5 | 63.5 | 64 | 202.5 |
| Tester: Task tích hợp `[QA]` | 3.5 | 2 | 10.5 | 53 | 69 |
| **Tổng** | **153** | **170.5** | **258** | **298** | **879.5** |

Sức làm ước tính của 7 người là khoảng **262 giờ/sprint** (5 ngày × 7,5 giờ × 7 người). Sprint 1–3 vừa sức. **Sprint 4 vượt khoảng 36 giờ**, và riêng phần kiểm thử ở Sprint 4 đã là 117 giờ, cần khoảng 3 người kiểm cùng lúc.

**Gợi ý phân công 7 thành viên.** Component của Task giữ đúng theo nội dung việc. Một người có thể nhận Task của component khác khi rảnh, và kiểm ở bước Ready For Test nếu **không phải người làm Task đó**.

| Thành viên | Vai trò chính | Nhận thêm khi rảnh |
|---|---|---|
| TV1 | Backend A: đường xử lý ván, realtime, đồng hồ, thao tác ván | Kiểm Ready For Test cho Task FE (S4) |
| TV2 | Backend B: CSDL, tài khoản, phòng, lời mời, người xem, chat | Kiểm Ready For Test cho Task FE/AI (S4) |
| TV3 | Frontend A: khung web, tài khoản, sảnh/phòng, lời mời, chat | Kiểm Ready For Test cho Task BE |
| TV4 | Frontend B: bàn cờ, phòng chơi, đồng hồ, treo ván, media, chơi với máy | DevOps (S1) |
| TV5 | AI: lượng giá, tìm kiếm, cổng đo, tiến trình AI, thí nghiệm | Backend luật cờ (S1), Tester (S3–S4) |
| TV6 | Design (S1–S2) | **Tester thứ hai** từ S2; Design rà sản phẩm (S4) |
| TV7 | **Tester chính**: nhận mọi Task ở cột Ready For Test, 20 Task tích hợp | DevOps (hạ tầng, triển khai) |

**Giữ Sprint 4 vừa sức:** (1) TV5, TV6, TV7 dành phần lớn Sprint 4 cho kiểm thử; developer xong việc thì kiểm Task của **người khác**. (2) Cột Ready For Test không được dồn quá 1 ngày: tới Daily mà Task nằm ở Ready For Test quá 1 ngày thì trưởng nhóm giao thêm người kiểm. (3) Nếu vẫn trễ: giữ Story `Highest`/`High`, làm Story `Medium` (ST07.2, ST12.2, ST16.1) sau cùng; **không cắt phần kiểm thử**.

## 6. ĐƯỜNG GĂNG (critical path)

Mỗi sprint có một chuỗi việc nối tiếp gần bằng độ dài sprint (40 giờ làm việc). Trễ một Task trong chuỗi thì Story cuối chuỗi sẽ không Done kịp trong sprint. Ký hiệu: `→` = bắt đầu khi Task trước **Ready For Test**; `⇒` = phải chờ Task trước **Done**.

| Sprint | Chuỗi dài nhất | Giờ dư |
|---|---|---:|
| 1 | TK01.1.1 monorepo → TK01.1.3 Vitest → TK03.1.1 kiểu lõi → TK03.2.1 thế cờ/tấn công → TK03.2.3 Mã/Xe/Pháo → TK03.3.1 getLegalMoves → TK03.3.2 validate/apply → TK03.3.3 kết thúc ván (Done cuối ngày 02/10) | 0h |
| 2 | TK05.2.2 migration media/phiên → TK05.2.3 RLS ⇒ TK05.3.1 harness ⇒ TK06.1.1 guard ⇒ TK08.1.1 tạo phòng → TK08.1.2 nhận người (Done 09/10) | 0,5h |
| 3 | TK10.2.1 gateway → TK10.2.3 đường lệnh ⇒ TK10.3.1 đi nước → TK10.3.2 finalizer ⇒ TK11.1.1 đồng hồ máy chủ (Done 16/10) | 3h |
| 4 | TK12.1.1 đầu hàng/đề nghị → TK12.1.2 đi lại → TK15.2.1 ván với máy → TK15.2.2 màn chơi với máy → TK16.2.1 responsive → TK16.2.3 5 trạng thái → TK16.2.5 kiểm trợ năng (Done 23/10) | 1h |

Các Task trong những chuỗi này gắn nhãn `critical-path`, độ ưu tiên `Highest`. Tester ưu tiên kiểm các Task này **ngay trong ngày** chúng sang Ready For Test.

## 6b. KHI NÀO ĐƯỢC BẮT ĐẦU TASK KẾ TIẾP

- **Mặc định (cập nhật 2026-09-27):** Task sau chỉ bắt đầu khi Task chặn nó đã **Done** — PR được review **và** Tester kiểm ngay trên nhánh PR ở bước Ready For Test, PASS mới merge `main`.
- ⚠ Các ngày Bắt đầu / Ready For Test / Done trong kế hoạch này được lập theo quy tắc cũ (Task sau bắt đầu khi Task chặn tới Ready For Test). Với quy tắc mới, mỗi mắt xích trên đường găng chờ thêm thời gian kiểm ⇒ **cần tính lại lịch**.
- **Phải chờ Done** (ghi `(Done)` trong trường "Is blocked by" của Task):
  - Cổng chặn AI: TK04.3.1, TK04.3.2. EP15 chỉ bắt đầu khi cổng đo đã được chạy lại độc lập và PASS.
  - Cổng chặn media: TK14.1.3. ST14.2–14.4 chỉ bắt đầu khi cổng PASS.
  - Nền quyền và nền test: RLS TK05.2.3, harness TK05.3.1, guard TK06.1.1.
  - Đường xử lý lệnh ván TK10.2.3 và finalizer TK10.3.2 (lỗi tranh chấp phát hiện muộn rất khó sửa).
  - Các chỗ Task sau cần kết quả **đã kiểm**: số đo thật cho hồ sơ bàn giao, thí nghiệm 60 ván cho nghiệm thu, responsive cho kịch bản xương sống, v.v.
- Link `Blocks` trên Jira không phân biệt hai mức này. Khi tạo, ghi thêm dòng `Chờ Done: XW-…` trong Description của Task bị chặn.

## 7. PHỤ THUỘC ĐÃ ĐIỀU CHỈNH SO VỚI BỘ 138 ISSUE

Bộ 138 issue xếp phụ thuộc theo thứ tự làm tuần tự của **một** agent. Với nhóm 7 người trong 4 tuần, một số phụ thuộc không có quan hệ "đầu ra → đầu vào" thật đã được nới để làm song song. **Không đổi yêu cầu nghiệp vụ nào.**

| # | Đặc tả gốc | Kế hoạch mới | Lý do |
|---|---|---|---|
| 1 | 003 sau 002 | Vitest (TK01.1.3) song song lint (TK01.1.2) | Không dùng đầu ra của nhau |
| 2 | 034 sau 005 | Supabase local (TK01.2.2) chỉ cần Vitest | Runner test tích hợp dùng Vitest, không cần CI |
| 3 | 055 là issue giao diện cuối nhóm | Router + tokens + bố cục tách lên ST01.3 (Sprint 1); 6 màn chia vào FE của ST06.1–06.3 | Mọi màn hình khác cần khung web trước |
| 4 | 061 sau 055 | Tạo phòng (TK08.1.1) sau guard (046) + migration chat (040) | API tạo phòng không cần màn tài khoản |
| 5 | 084 sau 051, 052 | Gateway (TK10.2.1) sau guard + nhận người; ca ngắt socket khi đăng xuất kiểm ở TK10.2.4 sau TK06.2.2 | Gateway kiểm phiên mỗi sự kiện; ngắt chủ động khi logout nối vào sau |
| 6 | 066 sau 065 | Cài đặt/thu hồi (TK08.3.2) song song rời phòng (TK08.3.1) | Primitive thu hồi không dùng đầu ra của rời phòng |
| 7 | 073 sau 070 | Vào xem (TK09.1.1) sau mã/link; đường vào bằng lời mời trực tiếp kiểm ở TK09.1.2 sau TK08.4.2 | Cùng một primitive nhận người |
| 8 | 108 sau 066 + 109 sau 073 | Chat (TK13.1.1) sau thu hồi (TK08.3.2) + primitive nhận người (TK08.1.2) | Vai trò SPECTATOR đã có từ 063 |
| 9 | 114 sau 073 | Token media (TK14.2.1) sau primitive nhận người (TK08.1.2); kiểm WATCH đầy đủ hồi quy ở TK14.4.1 | Như trên |
| 10 | 104 sau 093, 065 | Đầu hàng (TK12.1.1) sau finalizer; tranh chấp với hết giờ kiểm ở TK12.1.4 sau TK11.1.1 | Đầu hàng chỉ cần finalizer; rời phòng gọi lại hàm đầu hàng |
| 11 | 125 sau 121 | Lịch sử (TK12.2.1) sau snapshot/nhánh (090) | Ván AI tự xuất hiện trong lịch sử khi ST15.2 xong |
| 12 | 127 sau 126 | Tái đấu (TK12.3.1) sau đóng phòng (065) + finalizer | Tái đấu không dùng API xem lại |
| 13 | 094 thuộc nhóm đồng hồ | Hiển thị đồng hồ (TK10.4.2) chuyển vào ST10.4 (màn phòng chơi) | Đi cùng màn hình, cùng sprint |
| 14 | 124 sau 123 | Thí nghiệm 60 ván (ST15.3) chạy ngay sau cổng đo, Sprint 3 | Chạy trên `packages/ai`, không cần giao diện |
| 15 | 137 sau 136 | Hạ tầng Internet dựng sớm (ST16.8, Sprint 3), kiểm Internet đầy đủ ở cuối (TK16.6.1) | Triển khai liên tục, tránh dồn 2 ngày cuối |
| 16 | 138 sau 136 | Hồ sơ bàn giao (TK16.6.2) sau số đo tải + AI; nghiệm thu chạy song song ngày cuối | Hồ sơ cần số đo thật, không cần kết quả nghiệm thu |
| 17 | 134 sau 133 (cuối nhóm E20) | Giới hạn tần suất/tiêu đề bảo mật tách Story ST16.7, làm Sprint 3 | Không phụ thuộc giao diện |
| 18 | 038, 039 (migration ván) cùng nhóm 040–043 | Migration ván/cây nước đi/biên lai (TK05.1.3) làm ngay Sprint 1 trong ST05.1 | Nối tiếp migration phòng; giúp chuỗi RLS → harness → guard → phòng xong trong Sprint 2 |

Các phụ thuộc còn lại giữ đúng như đặc tả (ví dụ: luật cờ trước AI và trước đi nước; cổng AI trước EP15; cổng media trước ST14.2–14.4; finalizer trước mọi bộ đếm kết thúc ván; thu hồi trước chat/media thu hồi).

## 8. CỔNG CHẶN VÀ RỦI RO

| Rủi ro | Dấu hiệu | Xử lý (không hạ ngưỡng) |
|---|---|---|
| Cổng AI (ST04.3) không đạt p95 depth 6 ≤ 3000 ms | Tester chạy lại ở bước Ready For Test của TK04.3.1 ra số > ngưỡng | Flag Task, ghi số thật; tối ưu **đúng thứ tự**: bỏ cấp phát → killer/history → transposition table → báo trưởng nhóm. Mỗi bước là một Task `[AI] TK04.3.1-OPTn` (nhãn `st04-3`) có mục kiểm thử đo lại. EP15 chưa bắt đầu |
| Cổng media (ST14.1) không có byte RTP | TK14.1.3 đỏ | Flag, kiểm cổng UDP/loopback/phiên bản LiveKit; ST14.2–14.4 chưa bắt đầu |
| Thiếu tài nguyên ngoài (Google Cloud, SMTP, Render/Vercel, LiveKit Cloud, 2 điện thoại/2 mạng) | TK06.4.1, TK16.8.2, TK16.6.1 | Nhãn `blocked-external`, ghi rõ thiếu gì; **không** giả lập rồi báo đạt; phần local vẫn nghiệm thu |
| **Cột Ready For Test bị dồn** | Nhiều Task nằm ở Ready For Test quá 1 ngày | Người rảnh nhận kiểm (không kiểm Task mình làm); Task trên đường găng được kiểm trước |
| Lịch khít (dư 0–3 giờ mỗi sprint) | Một Task đường găng trễ nửa ngày | Trưởng nhóm theo dõi các Task `critical-path` mỗi Daily; chuyển người sang hỗ trợ ngay khi trễ |
| Sprint 4 quá tải (~32 giờ) | Burndown Sprint 4 không giảm tới 21/10 | Chuyển người rảnh sang kiểm thử; lùi Story Medium; không cắt kiểm thử |
| Task trước FAIL khi Task sau đã làm dựa trên nó | Bug ở Task đã Ready For Test | Bug `High`/`Highest` sửa trước việc mới; Task sau rebase sau khi bản sửa merge; đổi hợp đồng API thì báo trong ngày |

## 9. NHỊP LÀM VIỆC

- **Sprint Planning** (thứ Hai đầu sprint): kéo Story của sprint vào board, gán người theo §5, đánh dấu Task đường găng.
- **Daily** 15 phút: mỗi người nêu Task đang làm và Task đang chờ. Trưởng nhóm kéo sang **Ready For Dev** những Task đã đủ điều kiện (xem §6b) và xem cột **Ready For Test**.
- **Một Task phát triển:** `Ready For Dev` → **In Progress**, nhánh `feature/XW-<số>-ten-ngan` → viết test trước → code → mở PR (4 cổng xanh) → **Ready For Test**, đổi Assignee sang Tester, comment link PR + cách chạy thử → review (≥ 1 approve) **và** Tester kiểm trên nhánh PR → PASS + CI xanh ⇒ merge `main` → **Done**; FAIL ⇒ Bug, về **In Progress**, sửa trên cùng PR.
- **Task Tester tích hợp:** `Ready For Dev` khi mọi Task chặn tới mức cần → chạy đủ ca → ghi báo cáo `docs/test-reports/<mã-task>.md` → **Done**; FAIL thì tạo Bug gán đúng Task gây lỗi.
- **Sprint Review** (cuối sprint): demo theo cột "Kết quả demo" ở §3, chỉ demo Story đã Done. Sau đó **Retrospective** ngắn.
