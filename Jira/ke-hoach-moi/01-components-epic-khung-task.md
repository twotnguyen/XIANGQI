# Kế hoạch Jira — 01: Components, Epic, Story, Task và lịch hiện hành

**Cập nhật 05/10/2026:** 8 Epic, 26 Story, 64 Task; 9 Components; 4 Sprint tương lai; 4 Releases chưa phát hành. Có Assignee, Sprint, Fix version và ngày riêng trên 98 mục; 64 Task có Original/Remaining Estimate ban đầu.

PO xác nhận ngày 05/10/2026: **8 giờ/người/ngày, kể cả cuối tuần; hạn cuối bắt buộc 05/11/2026**. PO giao agent ước lượng Task và xếp ngày riêng. Giờ là ước lượng mục tiêu ban đầu theo hạn PO, chưa được kiểm chứng bằng năng suất thực tế; không phải cam kết chắc chắn đủ giờ đạt AC. Giữ nguyên tám yêu cầu MVP, phân vai, 98 mục và đồ thị phụ thuộc. Story Points để nhóm quyết định.

Lịch làm 09–12, 13–18 (UTC+7), 8 giờ gồm tự kiểm và phối hợp trong Task; ngày đầu 05/10 chỉ từ 14:00. Tối đa **3 Task đang hoạt động**, gồm triển khai, chờ review và review. Một người không làm/review/hỗ trợ hai việc cùng lúc. Người chính không mở Task mới khi Task trước còn mở. Tiền đề phải được kiểm/PASS rồi mới bắt đầu Task phụ thuộc; có thể bàn giao tuần tự **trong cùng ngày theo giờ**. Start/Due date Jira chỉ có ngày, nên thanh giao nhau cùng ngày không chứng minh ca trùng. Mục tiêu T-64 PASS 05/11 lúc 15:30, còn 2,5 giờ trong ngày cho đệm/bàn giao. Không kéo hạn. Khoảng 82% thời gian triển khai có 1–2 Task. Sprint 3 kết thúc 27/10 lúc 14:00, Sprint 4 bắt đầu ngay sau đó; cùng ngày nhưng không trùng ca. Ngày và giờ là mục tiêu, chưa ghi worklog.

## 0. Bản chơi được trước, hoàn thiện đủ MVP sau

Sprint 1–2 làm 34 Task lõi; mốc T-34 kiểm bản chơi được ở Sprint 2, dự kiến 19/10/2026. Sprint 3–4 hoàn thiện người xem, quyền phòng, chat, camera/micro, bạn bè, chất lượng và nghiệm thu đủ tám mục tiêu. T-14 chuyển Sprint 2 để nối luật cờ trước rồi mới làm máy cờ; T-56/T-57 ở Sprint 3; các Task khác giữ Sprint. Phạm vi P1/P2 không đổi. Mốc hai tuần và hạn 18/10 trong tài liệu cũ là đường cơ sở đã được PO cho phép thay ngày, không phải lịch hiện hành.

## 1. Thành phần (Components) đã tạo trên XIAN

**Đã tạo và kiểm tra qua Jira ngày 05/10/2026:** 9 Components, đủ mô tả phạm vi; Component lead để trống, Default assignee = Unassigned. ID thực: Frontend `10037`, Backend `10038`, Authentication `10039`, Game Engine `10040`, Game Server `10041`, Room & Social `10042`, Communication `10043`, AI `10044`, QA & DevOps `10045`. Xem tại [Components XIAN](https://xiangqi-web.atlassian.net/plugins/servlet/project-config/XIAN/administer-components). PO đã xác nhận tạo 98 mục và yêu cầu phân công, Sprint, Fix version ngày 05/10/2026; giờ Task đã được ước lượng theo uỷ quyền PO; Story Points để trống.

| Thành phần | Tên đầy đủ | Nơi trong kho | Phạm vi | Số task |
|---|---|---|---|---:|
| `Frontend` | Giao diện web và hệ thống giao diện | `apps/web` (React, Vite, TypeScript) | Màn hình, luồng người dùng, bàn cờ SVG; màu và kiểu Kỳ Đài Cổ Phong, 5 trạng thái, thích ứng màn hình, trợ năng | 26 |
| `Backend` | Máy chủ ứng dụng, hợp đồng chung và dữ liệu | `apps/server` (NestJS), `packages/shared`, `supabase/migrations` | Khung máy chủ, hợp đồng chung, cơ chế dùng chung, cơ sở dữ liệu | 4 |
| `Authentication` | Tài khoản và phiên | Supabase Auth, `apps/server` | Đăng ký OTP, đăng nhập, phiên, hồ sơ, phục hồi tài khoản dở | 8 |
| `Game Engine` | Luật cờ | `packages/rules` (TypeScript thuần) | Sinh nước đi, hợp lệ, chiếu, hết nước, lặp thế, ký hiệu; bộ kiểm thử luật | 4 |
| `Game Server` | Ván đấu ở máy chủ | `apps/server` (mô-đun ván, Socket.IO) | Xử lý nước đi, đồng hồ, kết thúc ván, đầu hàng, xin hoà; xử lý lệnh tuần tự, chống trùng, kết nối lại, người xem trực tiếp, nhiều tab | 8 |
| `Room & Social` | Phòng, ghế, người xem và bạn bè | `apps/server` (mô-đun phòng và bạn bè), `apps/web` | Tạo/vào phòng, ghế, Sẵn sàng, khoá, đuổi, danh sách phòng; kết bạn, trạng thái bạn, mời vào phòng | 12 |
| `Communication` | Chat và camera/micro | Máy chủ, web, LiveKit Cloud | Chat hai kênh, giới hạn và lọc, quyền camera/micro theo vai | 6 |
| `AI` | Máy cờ | `apps/ai-worker`, mô-đun ván với máy | Tiến trình máy cờ, ba cấp, sự cố, ván với máy | 4 |
| `QA & DevOps` | Kiểm thử, hạ tầng và vận hành | `tests/`, Vitest, Playwright, kho mã, kiểm tra tự động, môi trường demo | Kiểm thử tự động, đo tải, nghiệm thu; kho mã, kiểm tra tự động, môi trường demo | 11 |

Quy tắc: mỗi task gắn **1 thành phần, tối đa 2** (việc liên module); không task nào có 3. Hiện **45 task có 1 thành phần, 19 task có 2**. Thành phần là khu vực ổn định của hệ thống, không dùng cho người làm, mức ưu tiên hay Sprint. **PO đã duyệt 9 thành phần này ngày 04/10/2026** (gộp từ 13 theo yêu cầu của PO; PO sẽ review lại toàn bộ kế hoạch).

## 2. Epic

| Epic | Tên | Yêu cầu được giao | Số Story | Số Task |
|---|---|---|---:|---:|
| 1 | Đăng ký và đăng nhập (kèm nền tảng dự án) | Giao diện đăng ký / đăng nhập | 4 | 16 |
| 2 | Tạo phòng chơi | Tạo phòng chơi game | 4 | 6 |
| 3 | Mời bạn vào phòng chơi | Mời bạn vào phòng (link, mã, bạn bè online) | 4 | 5 |
| 4 | Khởi tạo bàn cờ | Load/khởi tạo bàn cờ | 2 | 6 |
| 5 | Hai người đánh cờ qua mạng | Hai người đánh cờ qua mạng | 4 | 9 |
| 6 | Phòng công khai, khoá phòng và người xem | Công khai / khoá / khoá có mã, người xem | 3 | 5 |
| 7 | Chat, camera và micro | Chat + camera + micro, kênh chat người xem tách riêng | 3 | 6 |
| 8 | Đánh với máy theo cấp độ | Đánh với máy theo cấp độ | 2 | 5 |
| — | Task chung (nhãn `chung`) | Kiểm thử, demo, nơi chạy | 0 | 6 |

## 2.1 Story (26)

| Story | Tên | Epic | Task liên kết |
|---|---|---|---|
| Story 1 | Đăng ký tài khoản qua ba bước hoặc bằng Google | 1 | `T-03`, `T-13`, `T-18`, `T-21`, `T-22`, `T-25`, `T-42` |
| Story 2 | Đăng nhập bằng tên đăng nhập và mật khẩu hoặc bằng Google | 1 | `T-17`, `T-18`, `T-21`, `T-22`, `T-25`, `T-29`, `T-31`, `T-49`, `T-51`, `T-54`, `T-57`, `T-60` |
| Story 3 | Hồ sơ cơ bản và đăng xuất | 1 | `T-09`, `T-17`, `T-21`, `T-22`, `T-25`, `T-55` |
| Story 4 | Giao diện nhất quán: đủ 5 trạng thái, dùng được trên điện thoại, trợ năng, tính năng chưa làm | 1 | `T-07`, `T-12`, `T-60`, `T-61`, `T-63` |
| Story 5 | Tạo phòng | 2 | `T-10`, `T-15`, `T-28`, `T-39` |
| Story 6 | Thanh điều hướng và Sảnh | 2 | `T-10`, `T-26`, `T-33`, `T-43`, `T-46`, `T-60` |
| Story 7 | Phòng chờ, hai ghế ngồi, Sẵn sàng và bắt đầu ván | 2 | `T-11`, `T-19`, `T-23`, `T-28`, `T-32` |
| Story 8 | Vào phòng bằng mã, đường dẫn hoặc từ Sảnh | 2 | `T-10`, `T-11`, `T-19`, `T-28`, `T-43`, `T-44`, `T-46` |
| Story 9 | Chia sẻ phòng bằng đường dẫn và mã; người được mời đăng nhập xong vào đúng phòng | 3 | `T-11`, `T-15`, `T-19`, `T-43`, `T-46`, `T-54`, `T-60` |
| Story 10 | Kết bạn: tìm người, gửi và trả lời lời mời, giới hạn | 3 | `T-40`, `T-41`, `T-52` |
| Story 11 | Danh sách bạn và trạng thái | 3 | `T-40`, `T-41`, `T-52`, `T-60` |
| Story 12 | Mời bạn đang online vào phòng | 3 | `T-19`, `T-40`, `T-45`, `T-52` |
| Story 13 | Thấy bàn cờ và quân cờ | 4 | `T-05`, `T-12`, `T-16`, `T-53`, `T-61` |
| Story 14 | Tương tác với quân cờ: chọn, kéo thả, đánh dấu nước đi, cảnh báo chiếu, âm thanh | 4 | `T-08`, `T-16`, `T-20`, `T-24`, `T-61` |
| Story 15 | Đi nước qua mạng và bảng nước đi | 5 | `T-08`, `T-09`, `T-24`, `T-27`, `T-30`, `T-47`, `T-57`, `T-63` |
| Story 16 | Đồng hồ ván | 5 | `T-24`, `T-29`, `T-32`, `T-57` |
| Story 17 | Kết thúc ván: kết quả, đầu hàng, xin hoà, lặp thế | 5 | `T-08`, `T-24`, `T-29`, `T-32`, `T-50`, `T-51`, `T-53` |
| Story 18 | Rời phòng giữa ván, mất kết nối và kết nối lại | 5 | `T-24`, `T-27`, `T-51`, `T-57` |
| Story 19 | Kiểu phòng, khoá phòng và danh sách phòng công khai | 6 | `T-10`, `T-39`, `T-43`, `T-46`, `T-51`, `T-57`, `T-60` |
| Story 20 | Quản lý phòng: đổi chỗ, đuổi người xem, chủ phòng rời, sau ván | 6 | `T-11`, `T-19`, `T-39`, `T-44`, `T-46`, `T-51`, `T-62` |
| Story 21 | Người xem theo dõi trực tiếp | 6 | `T-36`, `T-39`, `T-50`, `T-56`, `T-57` |
| Story 22 | Chat hai kênh, giới hạn tin nhắn và lọc từ cấm | 7 | `T-09`, `T-48`, `T-56`, `T-60` |
| Story 23 | Camera và micro: người chơi bật, người xem chỉ xem | 7 | `T-35`, `T-36`, `T-49`, `T-59`, `T-63` |
| Story 24 | Mở nhiều tab: tab mới tiếp quản | 7 | `T-49`, `T-59` |
| Story 25 | Chọn cấp độ, chọn phe và máy đi nước đúng luật | 8 | `T-14`, `T-26`, `T-31`, `T-33`, `T-58`, `T-60` |
| Story 26 | Kết thúc ván với máy, vào lại ván và sự cố máy cờ | 8 | `T-10`, `T-26`, `T-31`, `T-33`, `T-55`, `T-60` |

## 3. Sprint và Releases hiện hành

| Sprint | ID Jira | Ngày dự kiến (UTC+7) | Release | ID Release | Task | Giờ công Task | Phạm vi PASS dự kiến |
|---|---:|---|---|---:|---:|---:|---|
| XIAN Sprint 1 | 40 | 2026-10-05 – 2026-10-11 | `v0.1` | 10036 | 18 | 106.5 | 2026-10-11 |
| XIAN Sprint 2 | 41 | 2026-10-12 – 2026-10-19 | `v0.2` | 10037 | 16 | 113 | 2026-10-19 |
| XIAN Sprint 3 | 42 | 2026-10-20 – 2026-10-27 | `v0.3` | 10038 | 19 | 125 | 2026-10-27 |
| XIAN Sprint 4 | 43 | 2026-10-27 – 2026-11-05 | `v1.0` | 10039 | 11 | 113.5 | 2026-11-05 |

Story gán Sprint/Release theo Task liên quan hoàn thành muộn nhất; Epic gán Sprint 4/v1.0 theo yêu cầu PO; Due date riêng theo phạm vi Story/Task, không gán chung hạn nộp. Ngày Epic bao trùm các Story và Task liên quan. Không cộng giờ của Story/Epic lần nữa. Tổng ước lượng mục tiêu **458 giờ công Task**; v1.0 hạn **05/11/2026**. Task mục tiêu xong 05/11 lúc 15:30; còn 2,5 giờ cho bàn giao/đệm trong ngày. Các Sprint vẫn future, Releases vẫn unreleased.

## 4. Thứ tự và điều kiện bàn giao

237 liên kết **Blocks** biểu diễn tiền đề → Task phụ thuộc. 145 liên kết **Relates** chỉ truy vết Story–Task, không có nghĩa Story phải xong trước Task. Task và Story cùng Parent Epic; sáu Task chung không có Parent. Giữ đúng khoá Jira thật, không tạo lại. Đóng Task phải đủ đầu ra, review và bằng chứng; Ready for Test chưa phải Done. Nếu báo cáo thử nghiệm hoàn tất nhưng sản phẩm FAIL/BLOCKED thì giữ kết luận thật và không mở phần phụ thuộc chưa đạt.

## 5. Rủi ro và cơ sở ước lượng

Ước lượng mục tiêu 2,5–16,5 giờ/Task theo yêu cầu PO; chia theo độ phức tạp tương đối, thêm khoảng sửa lỗi, review độc lập 0,5–2 giờ và hỗ trợ bắt buộc T-47/T-55 mỗi Task 2 giờ. Không coi phân bổ này là ước lượng năng suất đã được kiểm chứng; đây là ước lượng mục tiêu ban đầu. Độ chính xác chưa được hiệu chỉnh với nhóm; tích hợp xác thực, máy cờ, media, nhiều tab và đo chất lượng cần cập nhật sau thử nghiệm. Lịch này dùng lịch ca theo giờ và giới hạn ba Task, chưa khẳng định tối ưu toán học. Không đổi vai trò để san giờ; tải của các thành viên không bằng nhau. Xem phân tách giờ và lịch review ở tệp 15.

## 6. Đối chiếu Jira thực — tạo và phân công ngày 05/10/2026

Bảng dưới là dữ liệu cần đối chiếu trên Jira; kiểm cấu hình không chứng minh sản phẩm đạt AC. Toàn bộ kết quả kiểm sản phẩm vẫn **NOT_RUN**.

| Mã | Jira | Loại | Công việc | Assignee | Sprint | Release | Start date | Due date | Original Estimate (giờ) |
|---|---|---|---|---|---:|---|---|---|---:|
| `E-01` | [XIAN-1](https://xiangqi-web.atlassian.net/browse/XIAN-1) | Epic | Đăng ký và đăng nhập (kèm nền tảng dự án) | Tưởng Lê khoa Cường-4572 | 4 | `v1.0` | 2026-10-05 | 2026-11-04 | — |
| `E-02` | [XIAN-2](https://xiangqi-web.atlassian.net/browse/XIAN-2) | Epic | Tạo phòng chơi | Võ Thành Đông | 4 | `v1.0` | 2026-10-08 | 2026-10-31 | — |
| `E-03` | [XIAN-3](https://xiangqi-web.atlassian.net/browse/XIAN-3) | Epic | Mời bạn vào phòng chơi | 4841_Lê Thị Xuân Nhạn | 4 | `v1.0` | 2026-10-08 | 2026-10-31 | — |
| `E-04` | [XIAN-4](https://xiangqi-web.atlassian.net/browse/XIAN-4) | Epic | Khởi tạo bàn cờ | TÌNH 4851_NGUYỄN NGỌC | 4 | `v1.0` | 2026-10-05 | 2026-11-01 | — |
| `E-05` | [XIAN-5](https://xiangqi-web.atlassian.net/browse/XIAN-5) | Epic | Hai người đánh cờ qua mạng | TÌNH 4851_NGUYỄN NGỌC | 4 | `v1.0` | 2026-10-06 | 2026-11-04 | — |
| `E-06` | [XIAN-6](https://xiangqi-web.atlassian.net/browse/XIAN-6) | Epic | Phòng công khai, khoá phòng và người xem | nguyenhoangtungtuyhoa | 4 | `v1.0` | 2026-10-08 | 2026-11-02 | — |
| `E-07` | [XIAN-7](https://xiangqi-web.atlassian.net/browse/XIAN-7) | Epic | Chat, camera và micro | Nguyễn Minh Thư | 4 | `v1.0` | 2026-10-08 | 2026-11-04 | — |
| `E-08` | [XIAN-8](https://xiangqi-web.atlassian.net/browse/XIAN-8) | Epic | Đánh với máy theo cấp độ | TÌNH 4851_NGUYỄN NGỌC | 4 | `v1.0` | 2026-10-08 | 2026-10-31 | — |
| `S-01` | [XIAN-9](https://xiangqi-web.atlassian.net/browse/XIAN-9) | Story | Đăng ký tài khoản qua ba bước hoặc bằng Google | Tưởng Lê khoa Cường-4572 | 3 | `v0.3` | 2026-10-05 | 2026-10-20 | — |
| `S-02` | [XIAN-10](https://xiangqi-web.atlassian.net/browse/XIAN-10) | Story | Đăng nhập bằng tên đăng nhập và mật khẩu hoặc bằng Google | TÌNH 4851_NGUYỄN NGỌC | 4 | `v1.0` | 2026-10-09 | 2026-10-31 | — |
| `S-03` | [XIAN-11](https://xiangqi-web.atlassian.net/browse/XIAN-11) | Story | Hồ sơ cơ bản và đăng xuất | Tưởng Lê khoa Cường-4572 | 4 | `v1.0` | 2026-10-08 | 2026-10-28 | — |
| `S-04` | [XIAN-12](https://xiangqi-web.atlassian.net/browse/XIAN-12) | Story | Giao diện nhất quán: đủ 5 trạng thái, dùng được trên điện thoại, trợ năng, tính năng chưa làm | Nguyễn Minh Thư | 4 | `v1.0` | 2026-10-06 | 2026-11-04 | — |
| `S-05` | [XIAN-13](https://xiangqi-web.atlassian.net/browse/XIAN-13) | Story | Tạo phòng | Võ Thành Đông | 3 | `v0.3` | 2026-10-08 | 2026-10-21 | — |
| `S-06` | [XIAN-14](https://xiangqi-web.atlassian.net/browse/XIAN-14) | Story | Thanh điều hướng và Sảnh | 4841_Lê Thị Xuân Nhạn | 4 | `v1.0` | 2026-10-08 | 2026-10-31 | — |
| `S-07` | [XIAN-15](https://xiangqi-web.atlassian.net/browse/XIAN-15) | Story | Phòng chờ, hai ghế ngồi, Sẵn sàng và bắt đầu ván | Võ Thành Đông | 2 | `v0.2` | 2026-10-08 | 2026-10-17 | — |
| `S-08` | [XIAN-16](https://xiangqi-web.atlassian.net/browse/XIAN-16) | Story | Vào phòng bằng mã, đường dẫn hoặc từ Sảnh | Võ Thành Đông | 3 | `v0.3` | 2026-10-08 | 2026-10-24 | — |
| `S-09` | [XIAN-17](https://xiangqi-web.atlassian.net/browse/XIAN-17) | Story | Chia sẻ phòng bằng đường dẫn và mã; người được mời đăng nhập xong vào đúng phòng | 4841_Lê Thị Xuân Nhạn | 4 | `v1.0` | 2026-10-08 | 2026-10-31 | — |
| `S-10` | [XIAN-18](https://xiangqi-web.atlassian.net/browse/XIAN-18) | Story | Kết bạn: tìm người, gửi và trả lời lời mời, giới hạn | Võ Thành Đông | 4 | `v1.0` | 2026-10-20 | 2026-10-28 | — |
| `S-11` | [XIAN-19](https://xiangqi-web.atlassian.net/browse/XIAN-19) | Story | Danh sách bạn và trạng thái | 4841_Lê Thị Xuân Nhạn | 4 | `v1.0` | 2026-10-20 | 2026-10-31 | — |
| `S-12` | [XIAN-20](https://xiangqi-web.atlassian.net/browse/XIAN-20) | Story | Mời bạn đang online vào phòng | Võ Thành Đông | 4 | `v1.0` | 2026-10-10 | 2026-10-28 | — |
| `S-13` | [XIAN-21](https://xiangqi-web.atlassian.net/browse/XIAN-21) | Story | Thấy bàn cờ và quân cờ | Nguyễn Minh Thư | 4 | `v1.0` | 2026-10-05 | 2026-11-01 | — |
| `S-14` | [XIAN-22](https://xiangqi-web.atlassian.net/browse/XIAN-22) | Story | Tương tác với quân cờ: chọn, kéo thả, đánh dấu nước đi, cảnh báo chiếu, âm thanh | Nguyễn Minh Thư | 4 | `v1.0` | 2026-10-06 | 2026-11-01 | — |
| `S-15` | [XIAN-23](https://xiangqi-web.atlassian.net/browse/XIAN-23) | Story | Đi nước qua mạng và bảng nước đi | TÌNH 4851_NGUYỄN NGỌC | 4 | `v1.0` | 2026-10-06 | 2026-11-04 | — |
| `S-16` | [XIAN-24](https://xiangqi-web.atlassian.net/browse/XIAN-24) | Story | Đồng hồ ván | TÌNH 4851_NGUYỄN NGỌC | 3 | `v0.3` | 2026-10-13 | 2026-10-27 | — |
| `S-17` | [XIAN-25](https://xiangqi-web.atlassian.net/browse/XIAN-25) | Story | Kết thúc ván: kết quả, đầu hàng, xin hoà, lặp thế | TÌNH 4851_NGUYỄN NGỌC | 4 | `v1.0` | 2026-10-06 | 2026-10-29 | — |
| `S-18` | [XIAN-26](https://xiangqi-web.atlassian.net/browse/XIAN-26) | Story | Rời phòng giữa ván, mất kết nối và kết nối lại | TÌNH 4851_NGUYỄN NGỌC | 3 | `v0.3` | 2026-10-13 | 2026-10-27 | — |
| `S-19` | [XIAN-27](https://xiangqi-web.atlassian.net/browse/XIAN-27) | Story | Kiểu phòng, khoá phòng và danh sách phòng công khai | nguyenhoangtungtuyhoa | 4 | `v1.0` | 2026-10-08 | 2026-10-31 | — |
| `S-20` | [XIAN-28](https://xiangqi-web.atlassian.net/browse/XIAN-28) | Story | Quản lý phòng: đổi chỗ, đuổi người xem, chủ phòng rời, sau ván | TÌNH 4851_NGUYỄN NGỌC | 4 | `v1.0` | 2026-10-08 | 2026-11-02 | — |
| `S-21` | [XIAN-29](https://xiangqi-web.atlassian.net/browse/XIAN-29) | Story | Người xem theo dõi trực tiếp | nguyenhoangtungtuyhoa | 3 | `v0.3` | 2026-10-20 | 2026-10-27 | — |
| `S-22` | [XIAN-30](https://xiangqi-web.atlassian.net/browse/XIAN-30) | Story | Chat hai kênh, giới hạn tin nhắn và lọc từ cấm | Nguyễn Minh Thư | 4 | `v1.0` | 2026-10-08 | 2026-10-31 | — |
| `S-23` | [XIAN-31](https://xiangqi-web.atlassian.net/browse/XIAN-31) | Story | Camera và micro: người chơi bật, người xem chỉ xem | TÌNH 4851_NGUYỄN NGỌC | 4 | `v1.0` | 2026-10-20 | 2026-11-04 | — |
| `S-24` | [XIAN-32](https://xiangqi-web.atlassian.net/browse/XIAN-32) | Story | Mở nhiều tab: tab mới tiếp quản | TÌNH 4851_NGUYỄN NGỌC | 4 | `v1.0` | 2026-10-23 | 2026-10-29 | — |
| `S-25` | [XIAN-33](https://xiangqi-web.atlassian.net/browse/XIAN-33) | Story | Chọn cấp độ, chọn phe và máy đi nước đúng luật | TÌNH 4851_NGUYỄN NGỌC | 4 | `v1.0` | 2026-10-12 | 2026-10-31 | — |
| `S-26` | [XIAN-34](https://xiangqi-web.atlassian.net/browse/XIAN-34) | Story | Kết thúc ván với máy, vào lại ván và sự cố máy cờ | Nguyễn Minh Thư | 4 | `v1.0` | 2026-10-08 | 2026-10-31 | — |
| `T-01` | [XIAN-35](https://xiangqi-web.atlassian.net/browse/XIAN-35) | Task | Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động | Gia Kỳ | 1 | `v0.1` | 2026-10-05 | 2026-10-05 | 3 |
| `T-02` | [XIAN-36](https://xiangqi-web.atlassian.net/browse/XIAN-36) | Task | Soạn "hợp đồng chung" giữa trình duyệt và máy chủ | Tưởng Lê khoa Cường-4572 | 1 | `v0.1` | 2026-10-06 | 2026-10-06 | 5.5 |
| `T-03` | [XIAN-37](https://xiangqi-web.atlassian.net/browse/XIAN-37) | Task | Cấu hình Supabase: gửi mã OTP đăng ký và đăng nhập Google | Tưởng Lê khoa Cường-4572 | 1 | `v0.1` | 2026-10-05 | 2026-10-06 | 2.5 |
| `T-04` | [XIAN-38](https://xiangqi-web.atlassian.net/browse/XIAN-38) | Task | Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập | nguyenhoangtungtuyhoa | 1 | `v0.1` | 2026-10-05 | 2026-10-06 | 6 |
| `T-05` | [XIAN-39](https://xiangqi-web.atlassian.net/browse/XIAN-39) | Task | Luật cờ: mô hình bàn cờ, thế khởi đầu, nước đi của từng loại quân | TÌNH 4851_NGUYỄN NGỌC | 1 | `v0.1` | 2026-10-05 | 2026-10-06 | 8.5 |
| `T-06` | [XIAN-40](https://xiangqi-web.atlassian.net/browse/XIAN-40) | Task | Dựng khung máy chủ: nhận kết nối có xác thực và chuyển lệnh | nguyenhoangtungtuyhoa | 1 | `v0.1` | 2026-10-06 | 2026-10-07 | 4.5 |
| `T-07` | [XIAN-41](https://xiangqi-web.atlassian.net/browse/XIAN-41) | Task | Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo) | 4841_Lê Thị Xuân Nhạn | 1 | `v0.1` | 2026-10-06 | 2026-10-07 | 6 |
| `T-08` | [XIAN-42](https://xiangqi-web.atlassian.net/browse/XIAN-42) | Task | Luật cờ: nước hợp lệ, chiếu, chiếu hết, hết nước, lặp thế, 120 nửa nước | TÌNH 4851_NGUYỄN NGỌC | 1 | `v0.1` | 2026-10-06 | 2026-10-08 | 14 |
| `T-09` | [XIAN-43](https://xiangqi-web.atlassian.net/browse/XIAN-43) | Task | Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ | TÌNH 4851_NGUYỄN NGỌC | 1 | `v0.1` | 2026-10-08 | 2026-10-09 | 7 |
| `T-10` | [XIAN-44](https://xiangqi-web.atlassian.net/browse/XIAN-44) | Task | Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng | 4841_Lê Thị Xuân Nhạn | 1 | `v0.1` | 2026-10-08 | 2026-10-08 | 6 |
| `T-11` | [XIAN-45](https://xiangqi-web.atlassian.net/browse/XIAN-45) | Task | Giao diện: phòng chờ và màn từ chối vào phòng | 4841_Lê Thị Xuân Nhạn | 1 | `v0.1` | 2026-10-08 | 2026-10-09 | 4.5 |
| `T-12` | [XIAN-46](https://xiangqi-web.atlassian.net/browse/XIAN-46) | Task | Giao diện: bàn cờ SVG, quân chữ Hán, lật bàn cho phe Đen | Nguyễn Minh Thư | 1 | `v0.1` | 2026-10-07 | 2026-10-08 | 4.5 |
| `T-13` | [XIAN-47](https://xiangqi-web.atlassian.net/browse/XIAN-47) | Task | Máy chủ: đăng ký bước 1 và 2 (kiểm tra tên đăng nhập, gửi mã OTP) | Tưởng Lê khoa Cường-4572 | 1 | `v0.1` | 2026-10-07 | 2026-10-07 | 4.5 |
| `T-14` | [XIAN-48](https://xiangqi-web.atlassian.net/browse/XIAN-48) | Task | Máy cờ: chương trình chạy riêng, ba cấp độ, thử nghiệm sơ bộ tốc độ | TÌNH 4851_NGUYỄN NGỌC | 2 | `v0.2` | 2026-10-12 | 2026-10-13 | 12 |
| `T-15` | [XIAN-49](https://xiangqi-web.atlassian.net/browse/XIAN-49) | Task | Máy chủ: trạng thái phòng, mỗi người một chỗ chơi và tạo phòng | Võ Thành Đông | 1 | `v0.1` | 2026-10-09 | 2026-10-10 | 6 |
| `T-16` | [XIAN-50](https://xiangqi-web.atlassian.net/browse/XIAN-50) | Task | Giao diện: bấm chọn quân và chấm gợi ý ô đi | Nguyễn Minh Thư | 1 | `v0.1` | 2026-10-08 | 2026-10-09 | 2.5 |
| `T-17` | [XIAN-51](https://xiangqi-web.atlassian.net/browse/XIAN-51) | Task | Máy chủ: đăng nhập, quản lý phiên và hồ sơ | TÌNH 4851_NGUYỄN NGỌC | 1 | `v0.1` | 2026-10-10 | 2026-10-11 | 12 |
| `T-18` | [XIAN-52](https://xiangqi-web.atlassian.net/browse/XIAN-52) | Task | Máy chủ: đăng ký bước 3 (xác minh mã, hoàn tất tài khoản) | TÌNH 4851_NGUYỄN NGỌC | 1 | `v0.1` | 2026-10-09 | 2026-10-10 | 6 |
| `T-19` | [XIAN-53](https://xiangqi-web.atlassian.net/browse/XIAN-53) | Task | Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh | Võ Thành Đông | 1 | `v0.1` | 2026-10-10 | 2026-10-10 | 3.5 |
| `T-20` | [XIAN-54](https://xiangqi-web.atlassian.net/browse/XIAN-54) | Task | Giao diện: kéo thả quân, đánh dấu nước vừa đi, cảnh báo chiếu, âm thanh | Nguyễn Minh Thư | 2 | `v0.2` | 2026-10-12 | 2026-10-12 | 3.5 |
| `T-21` | [XIAN-55](https://xiangqi-web.atlassian.net/browse/XIAN-55) | Task | Giao diện: đăng ký ba bước, đăng nhập, hồ sơ, đăng xuất | 4841_Lê Thị Xuân Nhạn | 2 | `v0.2` | 2026-10-12 | 2026-10-13 | 8.5 |
| `T-22` | [XIAN-56](https://xiangqi-web.atlassian.net/browse/XIAN-56) | Task | Thử nghiệm OTP thật và đăng nhập Google; chặn người chưa hoàn tất đăng ký và chặn đổi email | Gia Kỳ | 2 | `v0.2` | 2026-10-13 | 2026-10-14 | 4.5 |
| `T-23` | [XIAN-57](https://xiangqi-web.atlassian.net/browse/XIAN-57) | Task | Máy chủ: chọn ghế, Sẵn sàng, đếm 3 giây, bắt đầu ván | Võ Thành Đông | 2 | `v0.2` | 2026-10-13 | 2026-10-13 | 4.5 |
| `T-24` | [XIAN-58](https://xiangqi-web.atlassian.net/browse/XIAN-58) | Task | Giao diện ván: bàn cờ nối mạng, đồng hồ, nút, hộp kết quả, khung xin hoà | Nguyễn Minh Thư | 2 | `v0.2` | 2026-10-13 | 2026-10-13 | 7 |
| `T-25` | [XIAN-59](https://xiangqi-web.atlassian.net/browse/XIAN-59) | Task | Nối web với máy chủ: đăng ký, đăng nhập, hồ sơ | 4841_Lê Thị Xuân Nhạn | 2 | `v0.2` | 2026-10-14 | 2026-10-14 | 4.5 |
| `T-26` | [XIAN-60](https://xiangqi-web.atlassian.net/browse/XIAN-60) | Task | Giao diện: chọn cấp và phe, màn ván với máy, thông báo sự cố | Nguyễn Minh Thư | 2 | `v0.2` | 2026-10-13 | 2026-10-14 | 3.5 |
| `T-27` | [XIAN-61](https://xiangqi-web.atlassian.net/browse/XIAN-61) | Task | Máy chủ: bộ xử lý lệnh của ván và xử lý nước đi | TÌNH 4851_NGUYỄN NGỌC | 2 | `v0.2` | 2026-10-13 | 2026-10-15 | 14 |
| `T-28` | [XIAN-62](https://xiangqi-web.atlassian.net/browse/XIAN-62) | Task | Nối web với máy chủ: tạo phòng, vào phòng, ghế, Sẵn sàng, bắt đầu ván | 4841_Lê Thị Xuân Nhạn | 2 | `v0.2` | 2026-10-14 | 2026-10-15 | 4.5 |
| `T-29` | [XIAN-63](https://xiangqi-web.atlassian.net/browse/XIAN-63) | Task | Máy chủ: đồng hồ ván, kết thúc ván, đầu hàng, xin hoà | TÌNH 4851_NGUYỄN NGỌC | 2 | `v0.2` | 2026-10-15 | 2026-10-16 | 12 |
| `T-30` | [XIAN-64](https://xiangqi-web.atlassian.net/browse/XIAN-64) | Task | Nối web với máy chủ: đi nước, đồng bộ thế cờ giữa hai trình duyệt | Nguyễn Minh Thư | 2 | `v0.2` | 2026-10-15 | 2026-10-15 | 3.5 |
| `T-31` | [XIAN-65](https://xiangqi-web.atlassian.net/browse/XIAN-65) | Task | Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ | TÌNH 4851_NGUYỄN NGỌC | 2 | `v0.2` | 2026-10-16 | 2026-10-18 | 12 |
| `T-32` | [XIAN-66](https://xiangqi-web.atlassian.net/browse/XIAN-66) | Task | Nối web với máy chủ: bắt đầu ván đầy đủ, đồng hồ, kết thúc ván, đầu hàng, xin hoà | Nguyễn Minh Thư | 2 | `v0.2` | 2026-10-16 | 2026-10-17 | 6 |
| `T-33` | [XIAN-67](https://xiangqi-web.atlassian.net/browse/XIAN-67) | Task | Nối web, máy chủ và máy cờ thật: ván với máy | Nguyễn Minh Thư | 2 | `v0.2` | 2026-10-18 | 2026-10-18 | 4.5 |
| `T-34` | [XIAN-68](https://xiangqi-web.atlassian.net/browse/XIAN-68) | Task | Nghiệm thu bản chơi được: đăng ký, tạo phòng, mời, đánh online và đánh với máy chạy trọn | Gia Kỳ | 2 | `v0.2` | 2026-10-18 | 2026-10-19 | 8.5 |
| `T-35` | [XIAN-69](https://xiangqi-web.atlassian.net/browse/XIAN-69) | Task | Thử nghiệm LiveKit Cloud: camera/micro theo từng người, thu hồi quyền | TÌNH 4851_NGUYỄN NGỌC | 3 | `v0.3` | 2026-10-20 | 2026-10-21 | 12 |
| `T-36` | [XIAN-70](https://xiangqi-web.atlassian.net/browse/XIAN-70) | Task | Giao diện: camera/micro, bật tắt độc lập, mức chia sẻ, thông báo quyền và lỗi | Nguyễn Minh Thư | 3 | `v0.3` | 2026-10-21 | 2026-10-22 | 6 |
| `T-37` | [XIAN-71](https://xiangqi-web.atlassian.net/browse/XIAN-71) | Task | Dựng khung kiểm thử tự động trên nhiều trình duyệt (Playwright) | Gia Kỳ | 3 | `v0.3` | 2026-10-21 | 2026-10-22 | 3 |
| `T-38` | [XIAN-72](https://xiangqi-web.atlassian.net/browse/XIAN-72) | Task | Dựng môi trường demo: chạy cục bộ trước, Render làm dự phòng | Gia Kỳ | 3 | `v0.3` | 2026-10-22 | 2026-10-24 | 3 |
| `T-39` | [XIAN-73](https://xiangqi-web.atlassian.net/browse/XIAN-73) | Task | Giao diện: cài đặt phòng, đổi chỗ ghế/xem, danh sách người xem, xác nhận đuổi | 4841_Lê Thị Xuân Nhạn | 3 | `v0.3` | 2026-10-20 | 2026-10-21 | 4.5 |
| `T-40` | [XIAN-74](https://xiangqi-web.atlassian.net/browse/XIAN-74) | Task | Giao diện: bạn bè (tìm, lời mời, danh sách, mời vào phòng) | 4841_Lê Thị Xuân Nhạn | 3 | `v0.3` | 2026-10-20 | 2026-10-20 | 6 |
| `T-41` | [XIAN-75](https://xiangqi-web.atlassian.net/browse/XIAN-75) | Task | Máy chủ: kết bạn, lời mời và danh sách bạn có trạng thái | Võ Thành Đông | 3 | `v0.3` | 2026-10-21 | 2026-10-21 | 6 |
| `T-42` | [XIAN-76](https://xiangqi-web.atlassian.net/browse/XIAN-76) | Task | Máy chủ: tác vụ định kỳ dọn và phục hồi tài khoản đăng ký dở | Tưởng Lê khoa Cường-4572 | 3 | `v0.3` | 2026-10-20 | 2026-10-20 | 3.5 |
| `T-43` | [XIAN-77](https://xiangqi-web.atlassian.net/browse/XIAN-77) | Task | Máy chủ: kiểu phòng (công khai, chỉ mã, khoá) và danh sách phòng ở Sảnh | nguyenhoangtungtuyhoa | 3 | `v0.3` | 2026-10-20 | 2026-10-20 | 4.5 |
| `T-44` | [XIAN-78](https://xiangqi-web.atlassian.net/browse/XIAN-78) | Task | Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng | TÌNH 4851_NGUYỄN NGỌC | 3 | `v0.3` | 2026-10-21 | 2026-10-22 | 8.5 |
| `T-45` | [XIAN-79](https://xiangqi-web.atlassian.net/browse/XIAN-79) | Task | Máy chủ: mời bạn đang online vào phòng | Võ Thành Đông | 3 | `v0.3` | 2026-10-22 | 2026-10-22 | 3 |
| `T-46` | [XIAN-80](https://xiangqi-web.atlassian.net/browse/XIAN-80) | Task | Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời | 4841_Lê Thị Xuân Nhạn | 3 | `v0.3` | 2026-10-23 | 2026-10-24 | 6 |
| `T-47` | [XIAN-81](https://xiangqi-web.atlassian.net/browse/XIAN-81) | Task | Bảng nước đi: ký hiệu tiếng Việt và hiển thị | Nguyễn Minh Thư | 3 | `v0.3` | 2026-10-21 | 2026-10-21 | 6.5 |
| `T-48` | [XIAN-82](https://xiangqi-web.atlassian.net/browse/XIAN-82) | Task | Máy chủ: chat hai kênh, quyền đọc, giới hạn tin, lọc từ cấm | nguyenhoangtungtuyhoa | 3 | `v0.3` | 2026-10-24 | 2026-10-24 | 6 |
| `T-49` | [XIAN-83](https://xiangqi-web.atlassian.net/browse/XIAN-83) | Task | Máy chủ: cấp quyền camera/micro theo vai và mở nhiều tab (tab mới tiếp quản) | TÌNH 4851_NGUYỄN NGỌC | 3 | `v0.3` | 2026-10-23 | 2026-10-24 | 12 |
| `T-50` | [XIAN-84](https://xiangqi-web.atlassian.net/browse/XIAN-84) | Task | Máy chủ: người xem theo dõi trực tiếp, lọc dữ liệu theo vai trò | nguyenhoangtungtuyhoa | 3 | `v0.3` | 2026-10-22 | 2026-10-23 | 4.5 |
| `T-51` | [XIAN-85](https://xiangqi-web.atlassian.net/browse/XIAN-85) | Task | Máy chủ: rời phòng giữa ván, mất kết nối, giữ chỗ, kết nối lại, ván gián đoạn | TÌNH 4851_NGUYỄN NGỌC | 3 | `v0.3` | 2026-10-24 | 2026-10-25 | 12 |
| `T-52` | [XIAN-86](https://xiangqi-web.atlassian.net/browse/XIAN-86) | Task | Nối web với máy chủ: bạn bè | 4841_Lê Thị Xuân Nhạn | 4 | `v1.0` | 2026-10-28 | 2026-10-28 | 4.5 |
| `T-53` | [XIAN-87](https://xiangqi-web.atlassian.net/browse/XIAN-87) | Task | Kiểm thử luật cờ: đếm nước đi độc lập và bộ kiểm thử chạy tự động | Tưởng Lê khoa Cường-4572 | 4 | `v1.0` | 2026-10-28 | 2026-10-29 | 12 |
| `T-54` | [XIAN-88](https://xiangqi-web.atlassian.net/browse/XIAN-88) | Task | Nối web với máy chủ: bấm đường dẫn mời, đăng nhập rồi vào đúng phòng | 4841_Lê Thị Xuân Nhạn | 4 | `v1.0` | 2026-10-27 | 2026-10-28 | 3 |
| `T-55` | [XIAN-89](https://xiangqi-web.atlassian.net/browse/XIAN-89) | Task | Đăng xuất giữa ván: xác nhận, đầu hàng, rời phòng rồi đăng xuất | Tưởng Lê khoa Cường-4572 | 4 | `v1.0` | 2026-10-27 | 2026-10-28 | 6.5 |
| `T-56` | [XIAN-90](https://xiangqi-web.atlassian.net/browse/XIAN-90) | Task | Giao diện chat hai kênh và nối web với máy chủ | Nguyễn Minh Thư | 3 | `v0.3` | 2026-10-24 | 2026-10-25 | 6 |
| `T-57` | [XIAN-91](https://xiangqi-web.atlassian.net/browse/XIAN-91) | Task | Nối web với máy chủ: mất kết nối, người xem, bảng nước đi, phòng khoá | TÌNH 4851_NGUYỄN NGỌC | 3 | `v0.3` | 2026-10-26 | 2026-10-27 | 12 |
| `T-58` | [XIAN-92](https://xiangqi-web.atlassian.net/browse/XIAN-92) | Task | Đo máy cờ đầy đủ (GATE-AI): tốc độ, độ sâu, sức mạnh, độ ổn định | Tưởng Lê khoa Cường-4572 | 4 | `v1.0` | 2026-10-29 | 2026-10-31 | 14 |
| `T-59` | [XIAN-93](https://xiangqi-web.atlassian.net/browse/XIAN-93) | Task | Nối camera/micro thật: theo đối tượng nhận, đổi vai, đuổi, tab (web, máy chủ, LiveKit) | TÌNH 4851_NGUYỄN NGỌC | 4 | `v1.0` | 2026-10-27 | 2026-10-29 | 16.5 |
| `T-60` | [XIAN-94](https://xiangqi-web.atlassian.net/browse/XIAN-94) | Task | Giao diện: đủ 5 trạng thái cho mọi màn hình; tính năng chưa làm hiển thị đúng quy tắc | 4841_Lê Thị Xuân Nhạn | 4 | `v1.0` | 2026-10-29 | 2026-10-31 | 12 |
| `T-61` | [XIAN-95](https://xiangqi-web.atlassian.net/browse/XIAN-95) | Task | Giao diện: dùng được từ 360 px và bằng cảm ứng; trợ năng | Nguyễn Minh Thư | 4 | `v1.0` | 2026-10-31 | 2026-11-01 | 8.5 |
| `T-62` | [XIAN-96](https://xiangqi-web.atlassian.net/browse/XIAN-96) | Task | Nghiệm thu từng tiêu chí P1 (MVP) và chạy kịch bản demo D1–D10 | Gia Kỳ | 4 | `v1.0` | 2026-11-01 | 2026-11-02 | 14 |
| `T-63` | [XIAN-97](https://xiangqi-web.atlassian.net/browse/XIAN-97) | Task | Nghiệm thu phi chức năng: bài tải, quyền camera/micro, trình duyệt, bảo mật | Gia Kỳ | 4 | `v1.0` | 2026-11-02 | 2026-11-04 | 14 |
| `T-64` | [XIAN-98](https://xiangqi-web.atlassian.net/browse/XIAN-98) | Task | Chuẩn bị demo, sửa lỗi cuối, kiểm lại và bàn giao bằng chứng | Gia Kỳ | 4 | `v1.0` | 2026-11-04 | 2026-11-05 | 8.5 |

## 7. Tệp và thứ tự đọc

Đọc tệp 00/00b để hiểu chuẩn Description; 02 là tám Epic; 03–11 là 64 Task; 12–13 là 26 Story; 14 truy vết yêu cầu và AC; 15 có cơ sở ước lượng, phân vai, tải người, giờ bàn giao và lịch review.

**Xem lịch Task khi trình bày:** [Timeline theo ngày Task](https://xiangqi-web.atlassian.net/jira/software/c/projects/XIAN/boards/39/timeline?rangeMode=WEEKS&hideDependencies=true&jql=type%20%3D%20Task); xem giờ ca, giới hạn 3 và bảng hằng ngày ở [tệp 15](15-bang-chuan-bi-sprint-planning.md). Epic/Story là khoảng bao trùm, không phải số việc thực sự chạy song song.
