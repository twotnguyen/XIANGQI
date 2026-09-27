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
| Tổng ước lượng | **601 giờ** = 336,5h làm + 202,5h Tester kiểm ở bước Ready For Test + 62h Task Tester tích hợp |
| Kết thúc dự kiến | **22/10** (hạn 23/10, dư 14 giờ) |
| Cổng chặn | 2 — cổng đo AI (ST04.3) · cổng media (ST14.1) |

**Giả định tốc độ (cập nhật 2026-09-27):** nhóm code với AI agent hỗ trợ ⇒ giờ **viết code** (BE, FE, AI) lấy bằng **50 %** ước lượng gốc; DevOps **80 %** (phụ thuộc dịch vụ ngoài); Design và Task `[QA]` **90 %**; **giờ Tester kiểm ở Ready For Test giữ nguyên** (kiểm tay, thiết bị thật, đo thật). Đây là giả định chưa đo — kiểm lại sau Sprint 1 (§6b).

**Cách kiểm thử:** mỗi Task phát triển/thiết kế (115 Task) có mục **"🧪 Kiểm thử khi Ready for Test"**. Người làm mở PR rồi kéo Task sang **Ready For Test**; người review duyệt code và Tester kiểm **trên nhánh PR**; đủ approve + CI xanh + Tester PASS thì merge `main` và Tester kéo sang **Done**. Chi tiết: [AGENTS.md §8](../AGENTS.md).

## 2. DANH SÁCH EPIC

| Epic | Tên | Story | Sprint | Vai trò chính |
|---|---|---:|---|---|
| EP01 | Nền tảng kho mã & môi trường phát triển | 3 | 1 | DevOps, Backend, Frontend |
| EP02 | Thiết kế giao diện & trải nghiệm (UI/UX) | 4 | 1–3 | Design |
| EP03 | Contracts dùng chung & luật cờ | 3 | 1 | Backend |
| EP04 | AI máy cờ: lượng giá, tìm kiếm và cổng đo | 3 | 2–3 | AI |
| EP05 | Cơ sở dữ liệu, phân quyền dữ liệu và harness test tích hợp | 3 | 1–2 | Backend |
| EP06 | Tài khoản & xác thực | 4 | 3 | Backend, Frontend, DevOps |
| EP07 | Hồ sơ, bạn bè và trạng thái online | 2 | 3–4 | Backend, Frontend |
| EP08 | Phòng, sảnh và lời mời | 4 | 2–4 | Backend, Frontend |
| EP09 | Người xem: vào xem, trần 5 người, thu hồi, đuổi | 2 | 3–4 | Backend, Frontend |
| EP10 | Bàn cờ giao diện & ván online thời gian thực | 4 | 2–3 | Frontend, Backend |
| EP11 | Đồng hồ, mất kết nối và chống treo ván | 3 | 3–4 | Backend, Frontend |
| EP12 | Thao tác trong ván, lịch sử, xem lại và tái đấu | 3 | 3–4 | Backend, Frontend |
| EP13 | Chat hai kênh (riêng người chơi + chung) | 2 | 3 | Backend, Frontend |
| EP14 | Camera & micro (LiveKit) | 4 | 2–4 | DevOps, Backend, Frontend |
| EP15 | Chơi với máy: tiến trình riêng, hàng đợi, tích hợp ván, thí nghiệm 60 ván | 3 | 3–4 | AI, Backend, Frontend |
| EP16 | Hoàn thiện, bảo mật, thử tải, nghiệm thu, triển khai, bàn giao | 8 | 2–4 | Tất cả |

## 3. MỤC TIÊU TỪNG SPRINT

Sprint được gán theo **ngày Done của Story** (Story và mọi Task của nó cùng sprint). Mục tiêu sprint = các Story dưới đây Done; demo cuối sprint chỉ trình bày Story đã Done.

| Sprint · Fix version | Ngày | Story | SP | Story hoàn thành trong sprint |
|---|---|---:|---:|---|
| **1** · `v0.1.0` | 28/09 – 04/10 | 8 | 32 | ST03.1 Contracts: kiểu dữ liệu, toạ độ, schema Zod, mã lỗi · ST02.1 Design system và bàn cờ · ST05.1 Migration hồ sơ, bạn bè, phòng, lời mời, ván và cây nước đi · ST01.2 CI 4 cổng và Supabase local · ST03.2 Thế cờ ban đầu, khoá lặp, hình học tấn công, nước đi 7 loại quân · ST01.3 Khung ứng dụng web (router, token, bố cục) · ST01.1 Kho mã monorepo, lint và khung kiểm thử · ST03.3 Nước hợp lệ, áp dụng nước, kết thúc ván và lặp 3 lần |
| **2** · `v0.2.0` | 05/10 – 11/10 | 10 | 30 | ST14.1 ⛔ Cổng media: LiveKit local + đo byte RTP thật · ST04.1 Lượng giá thế cờ và sắp xếp nước · ST10.1 Bàn cờ SVG: vẽ, quân, chọn/đích, lật, bàn phím, chuyển động · ST05.2 Migration chat, media, AI, phiên + RLS · ST05.3 Harness test tích hợp thật + Prisma db pull + pool SQL · ST08.1 Tạo phòng và nhận người vào phòng không vượt trần · ST04.2 Tìm kiếm negamax, alpha-beta và đào sâu dần · ST02.4 Màn chơi với máy, lịch sử và xem lại · ST16.7 Giới hạn tần suất, kích thước body, CORS và tiêu đề bảo mật · ST02.2 Màn tài khoản, bạn bè, sảnh, phòng chờ, lời mời, người xem |
| **3** · `v0.3.0` | 12/10 – 18/10 | 21 | 75 | ST06.1 Guard xác thực API, đăng ký và xác minh email · ST08.2 Sảnh, sẵn sàng/bắt đầu ván, đổi bên và giao diện phòng chờ · ST10.3 Đi nước, cây nước đi, hàm kết thúc ván, snapshot đồng bộ · ST02.3 Màn ván online: thao tác, đồng hồ, chống treo, mất kết nối, kết quả, chat, media · ST10.2 Gateway realtime, presence/heartbeat, đường xử lý lệnh + biên lai · ST08.3 Rời/đóng phòng, đổi cài đặt và thu hồi người xem · ST07.2 Trạng thái online và trang bạn bè · ST11.1 Đồng hồ ván và bộ đếm hết giờ (máy chủ) · ST13.1 Dịch vụ chat 2 kênh: gửi, đọc lịch sử, phân quyền theo segment · ST04.3 ⛔ Cổng đo depth 6/3000 ms và bộ 20 thế cờ có đáp án tay · ST14.2 Chính sách camera/micro, cấp token 4 phòng, thu hồi xoay thế hệ · ST12.2 Lịch sử ván riêng tư và xem lại theo nhánh hiệu lực · ST10.4 Màn phòng chơi realtime (8 phiên) + hiển thị đồng hồ · ST06.2 Đăng nhập bằng username, phiên 30 ngày/phiên tạm, đăng xuất · ST15.1 Tiến trình AI riêng, worker thread, huỷ tức thì, hàng đợi 2/8 · ST15.3 Thí nghiệm 60 ván và báo cáo thuật toán tái lập được · ST13.2 Lịch sử/phân trang, dọn 30 ngày, kiểm thu hồi end-to-end, giao diện chat 2 khung · ST06.3 Quên mật khẩu, đặt lại và chọn username lần đầu · ST09.2 Thu hồi hàng loạt, đuổi người xem và giao diện danh sách người xem · ST11.3 Chống treo ván (R17) và giao diện cho cả 3 phía · ST06.4 Đăng nhập Google (tài nguyên ngoài) |
| **4** · `v1.0.0` | 19/10 – 23/10 | 16 | 51 | ST08.4 Mã phòng, link mời, mời trực tiếp, hộp thư lời mời · ST16.1 Kiểm chứng mô hình nhiều tab (mọi tab thao tác, chống xung đột) · ST14.3 Giao diện media và một tab một nguồn · ST12.3 Tái đấu đổi bên, đóng phòng 10 phút, màn kết quả · ST15.2 Tích hợp ván với máy, đi lại với máy, giao diện chơi với máy · ST07.1 Hồ sơ, tìm người dùng, kết bạn · ST16.4 Thử tải 10 phòng / 70 kết nối đồng thời · ST11.2 Ân hạn mất kết nối 60 giây, cả hai offline, khởi động lại máy chủ · ST14.4 Kiểm thử ma trận quyền media bằng luồng thật (TS-MED-01..15) · ST12.1 Đầu hàng, xin hoà/đi lại, đi lại trên cây nước, thanh thao tác · ST16.3 Kiểm ma trận quyền bằng dữ liệu giả mạo · ST09.1 Vào xem theo chế độ, trần 5 người, giữ ghế 15 giây · ST16.2 Responsive 4 kích thước, trợ năng WCAG AA, 5 trạng thái toàn bộ màn hình · ST16.6 Kiểm trên môi trường Internet thật, hồ sơ bàn giao và bảo vệ · ST16.5 Nghiệm thu R01–R19 (local) · ST16.8 Hạ tầng Internet bản đầu: /healthz, triển khai Vercel + Render, môi trường thử tải |

Một Story chỉ được tính vào kết quả sprint khi **mọi Task của nó (nhãn `stxx-y`) đã Done**, tức là đã review, Tester PASS và đã merge `main`.

## 4. STORY THEO SPRINT (lịch có giới hạn người, quy tắc "Task chặn phải Done")

### Sprint 1 (28/09 – 04/10) — 8 Story, 32 SP

| Story | Tên | Bắt đầu | Done (dự kiến) | SP | Vai trò làm | Task `[QA]` tích hợp | Bị chặn bởi |
|---|---|---|---|---|---|---|---|
| ST02.1 | Design system và bàn cờ | 28/09 | 30/09 | 5 | DS | — | — |
| ST01.1 | Kho mã monorepo, lint và khung kiểm thử | 28/09 | 02/10 | 8 | OPS | 1 | — |
| ST03.1 | Contracts: kiểu dữ liệu, toạ độ, schema Zod, mã lỗi | 29/09 | 30/09 | 3 | BE | — | ST01.1 |
| ST01.2 | CI 4 cổng và Supabase local | 29/09 | 01/10 | 5 | OPS · BE | 1 | ST01.1 |
| ST03.2 | Thế cờ ban đầu, khoá lặp, hình học tấn công, nước đi 7 loại quân | 29/09 | 01/10 | 3 | BE | — | ST03.1 |
| ST05.1 | Migration hồ sơ, bạn bè, phòng, lời mời, ván và cây nước đi | 30/09 | 01/10 | 3 | BE | — | ST01.2 |
| ST01.3 | Khung ứng dụng web (router, token, bố cục) | 30/09 | 01/10 | 2 | FE | — | ST01.1, ST02.1 |
| ST03.3 | Nước hợp lệ, áp dụng nước, kết thúc ván và lặp 3 lần | 01/10 | 02/10 | 3 | BE | — | ST03.1, ST03.2 |

### Sprint 2 (05/10 – 11/10) — 10 Story, 30 SP

| Story | Tên | Bắt đầu | Done (dự kiến) | SP | Vai trò làm | Task `[QA]` tích hợp | Bị chặn bởi |
|---|---|---|---|---|---|---|---|
| ST14.1 | ⛔ Cổng media: LiveKit local + đo byte RTP thật | 01/10 | 05/10 | 3 | OPS · BE | 1 | ST01.2 |
| ST10.1 | Bàn cờ SVG: vẽ, quân, chọn/đích, lật, bàn phím, chuyển động | 01/10 | 05/10 | 5 | FE | — | ST01.3, ST02.1, ST03.2, ST03.3 |
| ST05.2 | Migration chat, media, AI, phiên + RLS | 01/10 | 05/10 | 5 | BE | — | ST05.1 |
| ST04.1 | Lượng giá thế cờ và sắp xếp nước | 05/10 | 05/10 | 2 | AI | — | ST03.3 |
| ST05.3 | Harness test tích hợp thật + Prisma db pull + pool SQL | 05/10 | 05/10 | 2 | BE | — | ST05.2 |
| ST04.2 | Tìm kiếm negamax, alpha-beta và đào sâu dần | 05/10 | 07/10 | 3 | AI | — | ST04.1 |
| ST08.1 | Tạo phòng và nhận người vào phòng không vượt trần | 06/10 | 07/10 | 3 | BE | — | ST05.2, ST06.1 |
| ST02.2 | Màn tài khoản, bạn bè, sảnh, phòng chờ, lời mời, người xem | 07/10 | 09/10 | 3 | DS | — | ST02.1 |
| ST16.7 | Giới hạn tần suất, kích thước body, CORS và tiêu đề bảo mật | 08/10 | 09/10 | 2 | BE | — | ST10.2 |
| ST02.4 | Màn chơi với máy, lịch sử và xem lại | 09/10 | 09/10 | 2 | DS | — | ST02.3 |

### Sprint 3 (12/10 – 18/10) — 21 Story, 75 SP

| Story | Tên | Bắt đầu | Done (dự kiến) | SP | Vai trò làm | Task `[QA]` tích hợp | Bị chặn bởi |
|---|---|---|---|---|---|---|---|
| ST06.1 | Guard xác thực API, đăng ký và xác minh email | 05/10 | 12/10 | 3 | BE · FE | — | ST01.3, ST02.2, ST03.1, ST05.3 |
| ST02.3 | Màn ván online: thao tác, đồng hồ, chống treo, mất kết nối, kết quả, chat, media | 06/10 | 13/10 | 5 | DS | — | ST02.1 |
| ST10.2 | Gateway realtime, presence/heartbeat, đường xử lý lệnh + biên lai | 07/10 | 13/10 | 5 | BE | 1 | ST05.3, ST06.2, ST08.1 |
| ST04.3 | ⛔ Cổng đo depth 6/3000 ms và bộ 20 thế cờ có đáp án tay | 07/10 | 14/10 | 3 | AI | — | ST04.2 |
| ST06.2 | Đăng nhập bằng username, phiên 30 ngày/phiên tạm, đăng xuất | 07/10 | 15/10 | 5 | BE · FE | — | ST01.3, ST02.2, ST06.1 |
| ST15.1 | Tiến trình AI riêng, worker thread, huỷ tức thì, hàng đợi 2/8 | 07/10 | 15/10 | 5 | AI · BE | 2 | ST04.3, ST05.2 |
| ST08.2 | Sảnh, sẵn sàng/bắt đầu ván, đổi bên và giao diện phòng chờ | 08/10 | 12/10 | 5 | BE · FE | — | ST02.2, ST05.1, ST08.1, ST10.2 |
| ST07.2 | Trạng thái online và trang bạn bè | 08/10 | 13/10 | 3 | BE · FE | — | ST02.2, ST07.1, ST10.2 |
| ST10.3 | Đi nước, cây nước đi, hàm kết thúc ván, snapshot đồng bộ | 09/10 | 12/10 | 5 | BE | — | ST03.3, ST10.2 |
| ST08.3 | Rời/đóng phòng, đổi cài đặt và thu hồi người xem | 09/10 | 13/10 | 5 | BE · FE | — | ST02.2, ST08.2, ST10.3 |
| ST14.2 | Chính sách camera/micro, cấp token 4 phòng, thu hồi xoay thế hệ | 09/10 | 14/10 | 5 | BE | — | ST05.2, ST08.1, ST10.2, ST14.1 |
| ST13.1 | Dịch vụ chat 2 kênh: gửi, đọc lịch sử, phân quyền theo segment | 12/10 | 13/10 | 2 | BE | — | ST05.2, ST08.1, ST08.3, ST10.2 |
| ST11.1 | Đồng hồ ván và bộ đếm hết giờ (máy chủ) | 13/10 | 13/10 | 2 | BE | — | ST10.3 |
| ST12.2 | Lịch sử ván riêng tư và xem lại theo nhánh hiệu lực | 13/10 | 15/10 | 3 | BE · FE | — | ST02.4, ST10.1, ST10.3 |
| ST10.4 | Màn phòng chơi realtime (8 phiên) + hiển thị đồng hồ | 13/10 | 15/10 | 3 | FE | — | ST02.3, ST08.2, ST10.1, ST10.3, ST11.1 |
| ST15.3 | Thí nghiệm 60 ván và báo cáo thuật toán tái lập được | 14/10 | 16/10 | 2 | AI | — | ST04.3 |
| ST06.3 | Quên mật khẩu, đặt lại và chọn username lần đầu | 14/10 | 16/10 | 3 | BE · FE | — | ST01.3, ST02.2, ST06.1, ST06.2 |
| ST09.2 | Thu hồi hàng loạt, đuổi người xem và giao diện danh sách người xem | 14/10 | 16/10 | 3 | BE · FE | — | ST02.2, ST08.3, ST09.1 |
| ST11.3 | Chống treo ván (R17) và giao diện cho cả 3 phía | 14/10 | 16/10 | 3 | BE · FE | — | ST02.3, ST10.4, ST11.2 |
| ST13.2 | Lịch sử/phân trang, dọn 30 ngày, kiểm thu hồi end-to-end, giao diện chat 2 khung | 15/10 | 16/10 | 3 | BE · FE | — | ST02.3, ST09.2, ST10.4, ST13.1 |
| ST06.4 | Đăng nhập Google (tài nguyên ngoài) | 15/10 | 16/10 | 2 | OPS · FE | 1 | ST06.3 |

### Sprint 4 (19/10 – 23/10) — 16 Story, 51 SP

| Story | Tên | Bắt đầu | Done (dự kiến) | SP | Vai trò làm | Task `[QA]` tích hợp | Bị chặn bởi |
|---|---|---|---|---|---|---|---|
| ST16.8 | Hạ tầng Internet bản đầu: /healthz, triển khai Vercel + Render, môi trường thử tải | 30/09 | 22/10 | 5 | BE · OPS | 1 | ST01.2, ST06.4, ST15.1, ST16.7 |
| ST07.1 | Hồ sơ, tìm người dùng, kết bạn | 06/10 | 19/10 | 3 | BE · FE | — | ST02.2, ST06.1, ST06.2 |
| ST12.1 | Đầu hàng, xin hoà/đi lại, đi lại trên cây nước, thanh thao tác | 12/10 | 20/10 | 5 | BE · FE | 1 | ST02.3, ST10.3, ST10.4, ST11.1 |
| ST08.4 | Mã phòng, link mời, mời trực tiếp, hộp thư lời mời | 13/10 | 19/10 | 5 | BE · FE | — | ST02.2, ST07.1, ST07.2, ST08.1, ST08.3 |
| ST11.2 | Ân hạn mất kết nối 60 giây, cả hai offline, khởi động lại máy chủ | 13/10 | 20/10 | 3 | BE · FE | — | ST10.2, ST10.4, ST11.1 |
| ST09.1 | Vào xem theo chế độ, trần 5 người, giữ ghế 15 giây | 13/10 | 21/10 | 2 | BE | 1 | ST08.1, ST08.4, ST10.2 |
| ST14.3 | Giao diện media và một tab một nguồn | 14/10 | 19/10 | 5 | FE · BE | 1 | ST02.3, ST10.4, ST14.2 |
| ST15.2 | Tích hợp ván với máy, đi lại với máy, giao diện chơi với máy | 15/10 | 19/10 | 3 | BE · FE | — | ST02.4, ST10.1, ST10.4, ST11.1, ST11.2, ST12.1, ST15.1 |
| ST12.3 | Tái đấu đổi bên, đóng phòng 10 phút, màn kết quả | 16/10 | 19/10 | 3 | BE · FE | — | ST02.3, ST08.3, ST10.3, ST10.4 |
| ST16.6 | Kiểm trên môi trường Internet thật, hồ sơ bàn giao và bảo vệ | 16/10 | 21/10 | 3 | OPS · AI | 2 | ST04.3, ST06.4, ST10.4, ST12.3, ST14.3, ST15.3, ST16.4, ST16.8 |
| ST16.1 | Kiểm chứng mô hình nhiều tab (mọi tab thao tác, chống xung đột) | 19/10 | 19/10 | 1 | — | 1 | ST10.4, ST11.3, ST12.1, ST12.3, ST13.1 |
| ST16.4 | Thử tải 10 phòng / 70 kết nối đồng thời | 19/10 | 20/10 | 2 | — | 1 | ST10.3, ST15.2, ST16.8 |
| ST14.4 | Kiểm thử ma trận quyền media bằng luồng thật (TS-MED-01..15) | 19/10 | 20/10 | 2 | — | 1 | ST09.2, ST14.3 |
| ST16.2 | Responsive 4 kích thước, trợ năng WCAG AA, 5 trạng thái toàn bộ màn hình | 19/10 | 21/10 | 5 | FE · DS | 1 | ST07.2, ST10.4, ST11.3, ST12.2, ST12.3, ST13.2, ST14.3, ST15.2 |
| ST16.3 | Kiểm ma trận quyền bằng dữ liệu giả mạo | 20/10 | 21/10 | 2 | — | 1 | ST09.2, ST12.2, ST13.2, ST16.7 |
| ST16.5 | Nghiệm thu R01–R19 (local) | 21/10 | 21/10 | 2 | — | 2 | ST14.4, ST15.3, ST16.1, ST16.2, ST16.3, ST16.4 |

## 5. KHỐI LƯỢNG THEO VAI TRÒ VÀ GỢI Ý PHÂN CÔNG

**Giờ ước lượng theo vai trò × sprint** (đã áp giả định tốc độ §1):

| Vai trò | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 | Tổng |
|---|---:|---:|---:|---:|---:|
| Backend | 28 | 22,5 | 69,5 | 32,5 | 152,5 |
| Frontend | 3 | 9,5 | 36 | 27 | 75,5 |
| AI | 0 | 10 | 17 | 1,5 | 28,5 |
| Design | 12,5 | 14,5 | 12,5 | 2,5 | 42 |
| DevOps | 20,5 | 3 | 2,5 | 12 | 38 |
| Tester: kiểm ở bước Ready For Test | 33,5 | 30,5 | 96 | 42,5 | 202,5 |
| Tester: Task tích hợp `[QA]` | 3,5 | 2 | 8,5 | 48 | 62 |
| **Tổng** | **101** | **92** | **242** | **166** | **601** |

Sức làm mỗi người **37,5 giờ/tuần**. Tải theo lịch đã xếp (giờ làm + giờ kiểm, tính theo tuần bắt đầu việc):

| Thành viên | Tuần 1 | Tuần 2 | Tuần 3 | Tuần 4 | Tổng |
|---|---:|---:|---:|---:|---:|
| TV1 | 17 | 13 | 30 | 5,5 | 65,5 |
| TV2 | 17 | 27 | 33 | 4,5 | 81,5 |
| TV3 | 4,5 | 8 | 37,5 | 6,5 | 56,5 |
| TV4 | 27 | 17,5 | 28 | 8 | 80,5 |
| TV5 | 18,5 | 27 | 33,5 | 21,5 | 100,5 |
| TV6 | 26,5 | 33 | 32 | 22 | 113,5 |
| TV7 | 24,5 | 27,5 | 31,5 | 19,5 | 103 |

Không ai vượt 37,5 giờ/tuần. Người làm và người kiểm từng Task: [07-PHAN-CONG.md](07-PHAN-CONG.md). Người kiểm luôn **khác** người làm.

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

**Giữ lịch:** (1) Cột Ready For Test không dồn quá 1 ngày — tới Daily mà Task nằm ở đó quá 1 ngày thì trưởng nhóm giao thêm người review/kiểm. (2) Task nhãn `critical-path` được review và kiểm **ngay trong ngày**. (3) **Không cắt kiểm thử** để kịp hạn.

## 6. ĐƯỜNG GĂNG (critical path)

Chuỗi phụ thuộc dài nhất (tính cả giờ kiểm, vì Task sau chờ Task trước **Done**): **112,5 giờ** trên tổng 150 giờ của 4 tuần. Ngày Done theo lịch đã xếp:

| # | Task | Việc | Người làm | Làm + kiểm | Done (dự kiến) |
|---|---|---|---|---|---|
| 1 | TK01.1.1 | Khởi tạo monorepo pnpm + TypeScript nghiêm ngặt | TV4 | 5h + 1h | 28/09 |
| 2 | TK01.1.3 | Vitest cho unit test + đồng hồ giả tiêm vào | TV4 | 3h + 1,5h | 29/09 |
| 3 | TK01.2.2 | Supabase local, biến môi trường mẫu và runner test tích hợp | TV4 | 4h + 1,5h | 30/09 |
| 4 | TK05.1.1 | Migration profiles (+ trigger) và friendships | TV2 | 2h + 1,5h | 30/09 |
| 5 | TK05.1.2 | Migration rooms, room_members, room_blocks, user_active_room, invitations | TV2 | 2,5h + 2h | 01/10 |
| 6 | TK05.1.3 | Migration matches, match_moves (cây), match_events, active_players, biên lai lệnh, đề nghị, phiếu tái đấu, đổi bên | TV2 | 3h + 2h | 01/10 |
| 7 | TK05.2.2 | Migration media, ai_jobs, client_controls, app_sessions, auth_security_jobs | TV1 | 3h + 2h | 02/10 |
| 8 | TK05.2.3 | RLS toàn bộ bảng, vai trò app_server, grants, hàm kiểm phiên | TV2 | 2,5h + 2h | 05/10 |
| 9 | TK05.3.1 | Harness test tích hợp: factory người dùng thật, runId, rào đồng bộ | TV2 | 2,5h + 2h | 05/10 |
| 10 | TK06.1.1 | AuthGuard: verify JWT bằng JWKS, kiểm phiên mỗi yêu cầu, OnboardingGuard, /me | TV2 | 2,5h + 2h | 06/10 |
| 11 | TK08.1.1 | API tạo phòng (SQL thuần, một tài khoản một phòng, tạo ngữ cảnh chat) | TV2 | 2h + 1,5h | 06/10 |
| 12 | TK08.1.2 | Dịch vụ nhận người vào phòng (khoá phòng, đếm trong khoá, thứ tự lỗi không lộ phòng) | TV2 | 3h + 3h | 07/10 |
| 13 | TK10.2.1 | Socket.IO gateway: xác thực handshake, kiểm phiên mỗi sự kiện, origin, nhóm phát | TV1 | 2,5h + 1h | 08/10 |
| 14 | TK10.2.3 | Khung xử lý lệnh ván 11 bước + biên lai chống gửi trùng | TV4 | 3,5h + 3h | 08/10 |
| 15 | TK10.3.1 | Lệnh đi nước + version + sự kiện; cây nước đi và nhánh hiệu lực | TV4 | 3,5h + 3h | 09/10 |
| 16 | TK10.3.2 | Hàm kết thúc ván duy nhất finalizeMatch (11 nguyên nhân, 1 lần version++) | TV1 | 2h + 2h | 12/10 |
| 17 | TK11.1.1 | Tính đồng hồ + tích hợp đường lệnh + bộ đếm hết giờ chủ động | TV1 | 3,5h + 2h | 13/10 |
| 18 | TK11.2.1 | Ân hạn 60 giây, va chạm thời hạn, cả hai offline, khởi động lại máy chủ | TV5 | 4h + 3h | 14/10 |
| 19 | TK15.2.1 | Tạo ván với máy, kích hoạt lượt máy, áp nước máy qua đường lệnh, đi lại với máy | TV1 | 4h + 3h | 16/10 |
| 20 | TK15.2.2 | Màn chọn cấp độ /ai/new và màn chơi với máy /ai/:id | TV4 | 3h + 2h | 19/10 |
| 21 | TK16.2.1 | Rà và sửa responsive toàn bộ màn hình ở 4 kích thước | TV3 | 3h + 2h | 20/10 |
| 22 | TK16.2.4 | Rà khớp thiết kế trên sản phẩm thật + đo tương phản trên UI chạy thật | TV6 | 2,5h + 0,5h | 20/10 |
| 23 | TK16.2.5 | Kiểm thử trợ năng và 5 trạng thái 36 màn | TV6 | 2,5h + 0h | 21/10 |

Các Task này ưu tiên `Highest`; trễ một Task trong chuỗi là trễ ngày kết thúc. Tester review/kiểm chúng **ngay trong ngày** chúng sang Ready For Test.

## 6b. KHI NÀO ĐƯỢC BẮT ĐẦU TASK KẾ TIẾP

- **Quy tắc:** Task sau chỉ bắt đầu khi **mọi** Task chặn đã **Done** — review + Tester PASS trên nhánh PR + đã merge `main` ([AGENTS.md §8](../AGENTS.md)). Hậu tố `(Done)` còn ghi ở một số Task có cùng nghĩa.
- Lịch ở §4 được xếp bằng máy theo quy tắc này, có tính **giới hạn người** (mỗi người một việc một lúc, 7,5 giờ/ngày, thứ Hai–thứ Sáu) và giả định tốc độ ở §1.
- **Kiểm chứng sau Sprint 1 (Review 02/10):** so giờ thật (log work) với Original Estimate.
  - Chậm hơn ước lượng ≤ 20 %: giữ lịch, dùng phần dư cuối kỳ.
  - Chậm hơn 20–40 %: cho phép **PR xếp chồng** trên các Task đường găng (§6) — Task sau bắt đầu từ nhánh PR của Task chặn đang Ready For Test; merge vẫn đúng thứ tự, chỉ sau khi Tester PASS.
  - Chậm hơn > 40 %: họp nhóm, dời Story theo thứ tự đã tính sẵn (giúp rút lịch nhiều nhất): ST08.4 → ST14.2 → ST06.4 → ST15.2 → ST13.2 → ST12.3; ghi vào `known-limitations` và version `v1.1.0`.
- Link `Blocks` trên Jira thể hiện đúng các phụ thuộc này.

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
| Giả định tốc độ AI agent (code 50 %) sai | Sau Sprint 1 giờ thật vượt ước lượng | Làm theo §6b: PR xếp chồng trên đường găng, rồi mới dời Story theo thứ tự đã tính; không cắt kiểm thử |
| Lịch còn dư 14 giờ | Một Task đường găng trễ quá 2 ngày | Trưởng nhóm theo dõi các Task `critical-path` mỗi Daily; chuyển người sang hỗ trợ ngay khi trễ |
| Task trước FAIL khi Task sau đã làm dựa trên nó | Bug ở Task đã Ready For Test | Bug `High`/`Highest` sửa trước việc mới; Task sau rebase sau khi bản sửa merge; đổi hợp đồng API thì báo trong ngày |

## 9. NHỊP LÀM VIỆC

- **Sprint Planning** (thứ Hai đầu sprint): kéo Story của sprint vào board, gán người theo §5, đánh dấu Task đường găng.
- **Daily** 15 phút: mỗi người nêu Task đang làm và Task đang chờ. Trưởng nhóm kéo sang **Ready For Dev** những Task đã đủ điều kiện (xem §6b) và xem cột **Ready For Test**.
- **Một Task phát triển:** `Ready For Dev` → **In Progress**, nhánh `feature/XW-<số>-ten-ngan` → viết test trước → code → mở PR (4 cổng xanh) → **Ready For Test**, đổi Assignee sang Tester, comment link PR + cách chạy thử → review (≥ 1 approve) **và** Tester kiểm trên nhánh PR → PASS + CI xanh ⇒ merge `main` → **Done**; FAIL ⇒ Bug, về **In Progress**, sửa trên cùng PR.
- **Task Tester tích hợp:** `Ready For Dev` khi mọi Task chặn tới mức cần → chạy đủ ca → ghi báo cáo `docs/test-reports/<mã-task>.md` → **Done**; FAIL thì tạo Bug gán đúng Task gây lỗi.
- **Sprint Review** (cuối sprint): demo các Story đã Done của sprint (§3). Sau đó **Retrospective** ngắn.
