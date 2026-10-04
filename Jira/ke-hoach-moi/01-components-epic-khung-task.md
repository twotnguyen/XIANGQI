# Kế hoạch Jira (bản nháp) — 01: Thành phần, Epic, Story và khung Task

**Ngày:** 2026-10-04 · **Trạng thái:** đề xuất, chờ PO duyệt · **Chưa tạo gì trên Jira.**

**Quy mô:** **8 Epic** (đúng 8 yêu cầu được giao) · **26 Story** · **62 Task** (gồm 5 task chung không thuộc Epic) · 4 Sprint (4+3+4+3 ngày), nộp 18/10/2026. Chưa có ước lượng giờ và người nhận việc (nhóm làm khi Sprint Planning).

**Mã:** Task `T-01` đến `T-62` đánh theo **thứ tự làm** (số nhỏ làm trước; mỗi task chỉ cần các task có số nhỏ hơn). Story đánh số 1–26 theo Epic. Khi tạo trên Jira, mỗi mục có số `XIAN-<số>` riêng.

## 1. Thành phần (Components) đề xuất

| Thành phần | Tên đầy đủ | Nơi trong kho | Phạm vi | Số task |
|---|---|---|---|---:|
| `Frontend` | Giao diện web và hệ thống giao diện | `apps/web` (React, Vite, TypeScript) | Màn hình, luồng người dùng, bàn cờ SVG; màu và kiểu Kỳ Đài Cổ Phong, 5 trạng thái, thích ứng màn hình, trợ năng | 25 |
| `Backend` | Máy chủ ứng dụng, hợp đồng chung và dữ liệu | `apps/server` (NestJS), `packages/shared`, `supabase/migrations` | Khung máy chủ, hợp đồng chung, cơ chế dùng chung, cơ sở dữ liệu | 4 |
| `Authentication` | Tài khoản và phiên | Supabase Auth, `apps/server` | Đăng ký OTP, đăng nhập, phiên, hồ sơ, phục hồi tài khoản dở | 8 |
| `Game Engine` | Luật cờ | `packages/rules` (TypeScript thuần) | Sinh nước đi, hợp lệ, chiếu, hết nước, lặp thế, ký hiệu; bộ kiểm thử luật | 4 |
| `Game Server` | Ván đấu ở máy chủ | `apps/server` (mô-đun ván, Socket.IO) | Xử lý nước đi, đồng hồ, kết thúc ván, đầu hàng, xin hoà; xử lý lệnh tuần tự, chống trùng, kết nối lại, người xem trực tiếp, nhiều tab | 7 |
| `Room & Social` | Phòng, ghế, người xem và bạn bè | `apps/server` (mô-đun phòng và bạn bè), `apps/web` | Tạo/vào phòng, ghế, Sẵn sàng, khoá, đuổi, danh sách phòng; kết bạn, trạng thái bạn, mời vào phòng | 12 |
| `Communication` | Chat và camera/micro | Máy chủ, web, LiveKit Cloud | Chat hai kênh, giới hạn và lọc, quyền camera/micro theo vai | 6 |
| `AI` | Máy cờ | `apps/ai-worker`, mô-đun ván với máy | Tiến trình máy cờ, ba cấp, sự cố, ván với máy | 4 |
| `QA & DevOps` | Kiểm thử, hạ tầng và vận hành | `tests/`, Vitest, Playwright, kho mã, kiểm tra tự động, môi trường demo | Kiểm thử tự động, đo tải, nghiệm thu; kho mã, kiểm tra tự động, môi trường demo | 10 |

Quy tắc: mỗi task gắn **1 thành phần, tối đa 2** (việc liên module); không task nào có 3. Hiện **44 task có 1 thành phần, 18 task có 2**. Thành phần là khu vực ổn định của hệ thống, không dùng cho người làm, mức ưu tiên hay Sprint. Chờ PO duyệt 9 thành phần (đã gộp từ 13 theo yêu cầu PO 04/10/2026).

## 2. Epic

| Epic | Tên | Yêu cầu được giao | Số Story | Số Task |
|---|---|---|---:|---:|
| 1 | Đăng ký và đăng nhập (kèm nền tảng dự án) | Giao diện đăng ký / đăng nhập | 4 | 16 |
| 2 | Tạo phòng chơi | Tạo phòng chơi game | 4 | 6 |
| 3 | Mời bạn vào phòng chơi | Mời bạn vào phòng (link, mã, bạn bè online) | 4 | 5 |
| 4 | Khởi tạo bàn cờ | Load/khởi tạo bàn cờ | 2 | 6 |
| 5 | Hai người đánh cờ qua mạng | Hai người đánh cờ qua mạng | 4 | 8 |
| 6 | Phòng công khai, khoá phòng và người xem | Công khai / khoá / khoá có mã, người xem | 3 | 5 |
| 7 | Chat, camera và micro | Chat + camera + micro, kênh chat người xem tách riêng | 3 | 6 |
| 8 | Đánh với máy theo cấp độ | Đánh với máy theo cấp độ | 2 | 5 |
| — | Task chung (nhãn `chung`) | Kiểm thử, demo, nơi chạy | 0 | 5 |

## 2.1 Story (26)

| Story | Tên | Epic | Task liên kết |
|---|---|---|---|
| Story 1 | Đăng ký tài khoản qua ba bước | 1 | `T-03`, `T-12`, `T-19`, `T-23`, `T-24`, `T-27`, `T-35`, `T-60`, `T-62` |
| Story 2 | Đăng nhập bằng tên đăng nhập và mật khẩu | 1 | `T-20`, `T-24`, `T-27`, `T-53` |
| Story 3 | Hồ sơ cơ bản và đăng xuất | 1 | `T-10`, `T-20`, `T-23`, `T-24`, `T-27`, `T-48` |
| Story 4 | Giao diện nhất quán: đủ 5 trạng thái, dùng được trên điện thoại, trợ năng, tính năng chưa làm | 1 | `T-08`, `T-11`, `T-13`, `T-14`, `T-58`, `T-59`, `T-61` |
| Story 5 | Tạo phòng | 2 | `T-04`, `T-10`, `T-14`, `T-17`, `T-29` |
| Story 6 | Thanh điều hướng và Sảnh | 2 | `T-14` |
| Story 7 | Phòng chờ, hai ghế ngồi, Sẵn sàng và bắt đầu ván | 2 | `T-15`, `T-17`, `T-25`, `T-29`, `T-50` |
| Story 8 | Vào phòng bằng mã, đường dẫn hoặc từ Sảnh | 2 | `T-14`, `T-15`, `T-21`, `T-29`, `T-47`, `T-52` |
| Story 9 | Chia sẻ phòng bằng đường dẫn và mã; người được mời đăng nhập xong vào đúng phòng | 3 | `T-15`, `T-17`, `T-29`, `T-36`, `T-47`, `T-60` |
| Story 10 | Kết bạn: tìm người, gửi và trả lời lời mời, giới hạn | 3 | `T-33`, `T-34`, `T-54` |
| Story 11 | Danh sách bạn và trạng thái | 3 | `T-33`, `T-34`, `T-54` |
| Story 12 | Mời bạn đang online vào phòng | 3 | `T-33`, `T-52`, `T-54`, `T-60`, `T-62` |
| Story 13 | Thấy bàn cờ và quân cờ | 4 | `T-05`, `T-11` |
| Story 14 | Tương tác với quân cờ: chọn, kéo thả, đánh dấu nước đi, cảnh báo chiếu, âm thanh | 4 | `T-09`, `T-11`, `T-18`, `T-22`, `T-26`, `T-37` |
| Story 15 | Đi nước qua mạng và bảng nước đi | 5 | `T-26`, `T-28`, `T-30`, `T-42`, `T-46`, `T-50`, `T-61` |
| Story 16 | Đồng hồ ván | 5 | `T-26`, `T-39`, `T-50` |
| Story 17 | Kết thúc ván: kết quả, đầu hàng, xin hoà, lặp thế | 5 | `T-09`, `T-26`, `T-39`, `T-46`, `T-50` |
| Story 18 | Rời phòng giữa ván, mất kết nối và kết nối lại | 5 | `T-28`, `T-45`, `T-50` |
| Story 19 | Kiểu phòng, khoá phòng và danh sách phòng công khai | 6 | `T-14`, `T-32`, `T-36`, `T-40`, `T-50` |
| Story 20 | Quản lý phòng: đổi chỗ, đuổi người xem, chủ phòng rời, sau ván | 6 | `T-32`, `T-38`, `T-40` |
| Story 21 | Người xem theo dõi trực tiếp | 6 | `T-44`, `T-50` |
| Story 22 | Chat hai kênh, giới hạn tin nhắn và lọc từ cấm | 7 | `T-10`, `T-41`, `T-49` |
| Story 23 | Camera và micro: người chơi bật, người xem chỉ xem | 7 | `T-06`, `T-51`, `T-53`, `T-57`, `T-61` |
| Story 24 | Mở nhiều tab: tab mới tiếp quản | 7 | `T-53`, `T-57`, `T-61` |
| Story 25 | Chọn cấp độ, chọn phe và máy đi nước đúng luật | 8 | `T-31`, `T-37`, `T-43`, `T-55`, `T-56` |
| Story 26 | Kết thúc ván với máy, vào lại ván và sự cố máy cờ | 8 | `T-37`, `T-43`, `T-55`, `T-60`, `T-62` |

## 3. Nhịp Sprint

| Sprint | Ngày | Số ngày | Số task | Mục tiêu đề xuất |
|---|---|---|---:|---|
| 1 | 04/10–07/10 | 4 ngày | 13 | Nền tảng, hợp đồng chung, luật cờ cốt lõi, đăng nhập phía máy chủ chạy được. |
| 2 | 08/10–10/10 | 3 ngày | 17 | Đăng ký/đăng nhập chạy thật; hai người vào cùng phòng, bắt đầu ván và đi nước đồng bộ trên hai trình duyệt. |
| 3 | 11/10–14/10 | 4 ngày | 20 | Ván online hoàn chỉnh (đồng hồ, kết thúc, kết nối), phòng công khai/khoá, chat, bạn bè, ván với máy. |
| 4 | 15/10–17/10 | 3 ngày | 12 | Camera/micro, mời bạn, hội tụ giao diện, kiểm thử chấp nhận và gói demo. |

**Nộp ngày 18/10/2026.** Chưa kiểm khả năng chứa vì chưa có ước lượng giờ.

## 4. Quy tắc thứ tự đã áp dụng (tiêu chí giáo viên)

- Cột **Cần xong trước** liệt kê task mà **kết quả** của nó là đầu vào của task này; trên Jira thành liên kết `is blocked by`.
- Không task nào chạy trước hoặc song song với task mà nó cần kết quả. Song song chỉ giữa các task độc lập hoặc cùng bắt đầu từ một hợp đồng đã xong (hợp đồng chung `T-02`).
- Điều kiện hoàn thành của một task chỉ dựa trên kết quả của chính nó và của các task nó cần.
- Mỗi mục có task **nối web với máy chủ** riêng, bắt đầu sau khi cả hai phía xong.
- Đã kiểm bằng chương trình: **62 task, không vòng chờ, không task nào cần task có số lớn hơn, không task nào cần task ở Sprint sau.**

## 5. Rủi ro lịch

- **Chuỗi dài nhất:** 16 task nối tiếp. Sprint 3 có nhiều task nhất (20); cần ước lượng giờ để kiểm khả năng chứa.
- Task gộp nhiều phần (ghi "Phần 1, Phần 2…") có thể to hơn một ngày công; nhóm nên chia lại khi Sprint Planning nếu cần.
- Nơi chạy demo cần **PO quyết định** (hạ tầng, chi phí) trước khi làm task chung `chọn nơi chạy`.
- Điểm đang chờ PO: số người xem mặc định (đã chốt 5; đề bài gốc ghi tối đa 2, kịch bản demo chọn 2 để dễ thử), đổi cặp người ngồi ghế đọc tin cũ, cách hiển thị ván gián đoạn.

## 6. Thứ tự thực hiện và bảng task

Xếp theo thứ tự làm: Sprint, rồi việc không cần gì hoặc chỉ cần việc đã xong, rồi việc mở đường cho nhiều việc nối tiếp nhất.

| Task | Tên | Epic | Thành phần | Cần xong trước | Sprint |
|---|---|---|---|---|---:|
| `T-01` | Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động | 1 | `QA & DevOps` | — | 1 |
| `T-02` | Soạn "hợp đồng chung" giữa trình duyệt và máy chủ | 1 | `Backend` | `T-01` | 1 |
| `T-03` | Cấu hình Supabase gửi mã OTP đăng ký | 1 | `Authentication` | `T-01` | 1 |
| `T-04` | Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập | 1 | `Backend` | `T-01` | 1 |
| `T-05` | Luật cờ: mô hình bàn cờ, thế khởi đầu, nước đi của từng loại quân | 4 | `Game Engine` | `T-01` | 1 |
| `T-06` | Thử nghiệm LiveKit Cloud: camera/micro theo từng người, thu hồi quyền | 7 | `Communication`, `QA & DevOps` | `T-01` | 1 |
| `T-07` | Dựng khung máy chủ: nhận kết nối có xác thực và chuyển lệnh | 1 | `Backend` | `T-01`, `T-02`, `T-03` | 1 |
| `T-08` | Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo) | 1 | `Frontend` | `T-01`, `T-02` | 1 |
| `T-09` | Luật cờ: nước hợp lệ, chiếu, chiếu hết, hết nước, lặp thế, 120 nửa nước | 4 | `Game Engine` | `T-05` | 1 |
| `T-10` | Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ | 1 | `Backend` | `T-02`, `T-04`, `T-07` | 1 |
| `T-11` | Giao diện: bàn cờ SVG, quân chữ Hán, lật bàn cho phe Đen | 4 | `Frontend` | `T-05`, `T-08` | 1 |
| `T-12` | Máy chủ: đăng ký bước 1 và 2 (kiểm tra tên đăng nhập, gửi mã OTP) | 1 | `Authentication` | `T-03`, `T-04`, `T-07` | 1 |
| `T-13` | Dựng khung kiểm thử tự động trên nhiều trình duyệt (Playwright) | — | `QA & DevOps` | `T-01`, `T-08` | 1 |
| `T-14` | Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng | 2 | `Frontend` | `T-02`, `T-08` | 2 |
| `T-15` | Giao diện: phòng chờ và màn từ chối vào phòng | 2 | `Frontend` | `T-02`, `T-08` | 2 |
| `T-16` | Chọn nơi chạy ứng dụng và dựng bản demo trên mạng | — | `QA & DevOps` | `T-01`, `T-07`, `T-08` | 2 |
| `T-17` | Máy chủ: trạng thái phòng, mỗi người một chỗ chơi và tạo phòng | 2 | `Room & Social` | `T-04`, `T-07`, `T-10` | 2 |
| `T-18` | Giao diện: bấm chọn quân và chấm gợi ý ô đi | 4 | `Frontend` | `T-09`, `T-11` | 2 |
| `T-19` | Máy chủ: đăng ký bước 3 (xác minh mã, hoàn tất tài khoản) | 1 | `Authentication` | `T-12` | 2 |
| `T-20` | Máy chủ: đăng nhập, quản lý phiên và hồ sơ | 1 | `Authentication` | `T-03`, `T-04`, `T-07`, `T-10` | 2 |
| `T-21` | Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh | 2 | `Room & Social` | `T-10`, `T-17` | 2 |
| `T-22` | Giao diện: kéo thả quân, đánh dấu nước vừa đi, cảnh báo chiếu, âm thanh | 4 | `Frontend` | `T-18` | 2 |
| `T-23` | Thử nghiệm OTP thật; chặn người chưa hoàn tất đăng ký và chặn đổi email | 1 | `Authentication`, `QA & DevOps` | `T-03`, `T-19` | 2 |
| `T-24` | Giao diện: đăng ký ba bước, đăng nhập, hồ sơ, đăng xuất | 1 | `Frontend` | `T-02`, `T-08`, `T-20` | 2 |
| `T-25` | Máy chủ: chọn ghế, Sẵn sàng, đếm 3 giây, bắt đầu ván | 2 | `Room & Social` | `T-05`, `T-21` | 2 |
| `T-26` | Giao diện ván: bàn cờ nối mạng, đồng hồ, nút, hộp kết quả, khung xin hoà | 5 | `Frontend` | `T-02`, `T-08`, `T-22` | 2 |
| `T-27` | Nối web với máy chủ: đăng ký, đăng nhập, hồ sơ | 1 | `Frontend`, `Authentication` | `T-19`, `T-20`, `T-23`, `T-24` | 2 |
| `T-28` | Máy chủ: bộ xử lý lệnh của ván và xử lý nước đi | 5 | `Game Server` | `T-04`, `T-09`, `T-10`, `T-25` | 2 |
| `T-29` | Nối web với máy chủ: tạo phòng, vào phòng, ghế, Sẵn sàng, bắt đầu ván | 2 | `Frontend`, `Room & Social` | `T-14`, `T-15`, `T-25` | 2 |
| `T-30` | Nối web với máy chủ: đi nước, đồng bộ thế cờ giữa hai trình duyệt | 5 | `Frontend`, `Game Server` | `T-26`, `T-28`, `T-29` | 2 |
| `T-31` | Máy cờ: chương trình chạy riêng, ba cấp độ, thử nghiệm sơ bộ tốc độ | 8 | `AI` | `T-09` | 3 |
| `T-32` | Giao diện: cài đặt phòng, đổi chỗ ghế/xem, danh sách người xem, xác nhận đuổi | 6 | `Frontend` | `T-02`, `T-08`, `T-15` | 3 |
| `T-33` | Giao diện: bạn bè (tìm, lời mời, danh sách, mời vào phòng) | 3 | `Frontend`, `Room & Social` | `T-02`, `T-08`, `T-14`, `T-15` | 3 |
| `T-34` | Máy chủ: kết bạn, lời mời và danh sách bạn có trạng thái | 3 | `Room & Social` | `T-04`, `T-07`, `T-10`, `T-17` | 3 |
| `T-35` | Máy chủ: tác vụ định kỳ dọn và phục hồi tài khoản đăng ký dở | 1 | `Authentication` | `T-19` | 3 |
| `T-36` | Máy chủ: kiểu phòng (công khai, chỉ mã, khoá) và danh sách phòng ở Sảnh | 6 | `Room & Social` | `T-21` | 3 |
| `T-37` | Giao diện: chọn cấp và phe, màn ván với máy, thông báo sự cố | 8 | `Frontend` | `T-02`, `T-08`, `T-14`, `T-22` | 3 |
| `T-38` | Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng | 6 | `Room & Social` | `T-25`, `T-36` | 3 |
| `T-39` | Máy chủ: đồng hồ ván, kết thúc ván, đầu hàng, xin hoà | 5 | `Game Server` | `T-28` | 3 |
| `T-40` | Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời | 6 | `Frontend`, `Room & Social` | `T-29`, `T-32`, `T-36`, `T-38` | 3 |
| `T-41` | Máy chủ: chat hai kênh, quyền đọc, giới hạn tin, lọc từ cấm | 7 | `Communication` | `T-04`, `T-10`, `T-21`, `T-38` | 3 |
| `T-42` | Bảng nước đi: ký hiệu tiếng Việt và hiển thị | 5 | `Game Engine`, `Frontend` | `T-08`, `T-09`, `T-28` | 3 |
| `T-43` | Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ | 8 | `AI` | `T-17`, `T-28`, `T-31` | 3 |
| `T-44` | Máy chủ: người xem theo dõi trực tiếp, lọc dữ liệu theo vai trò | 6 | `Game Server` | `T-21`, `T-28`, `T-39` | 3 |
| `T-45` | Máy chủ: rời phòng giữa ván, mất kết nối, giữ chỗ, kết nối lại, ván gián đoạn | 5 | `Game Server` | `T-39` | 3 |
| `T-46` | Kiểm thử luật cờ: đếm nước đi độc lập và bộ kiểm thử chạy tự động | 4 | `Game Engine`, `QA & DevOps` | `T-01`, `T-09`, `T-42` | 3 |
| `T-47` | Nối web với máy chủ: bấm đường dẫn mời, đăng nhập rồi vào đúng phòng | 3 | `Frontend`, `Room & Social` | `T-15`, `T-21`, `T-27`, `T-30`, `T-36`, `T-38` | 3 |
| `T-48` | Đăng xuất giữa ván: xác nhận, đầu hàng, rời phòng rồi đăng xuất | 5 | `Authentication` | `T-24`, `T-38`, `T-39`, `T-43` | 3 |
| `T-49` | Giao diện chat hai kênh và nối web với máy chủ | 7 | `Frontend`, `Communication` | `T-02`, `T-08`, `T-10`, `T-40`, `T-41`, `T-44` | 3 |
| `T-50` | Nối web với máy chủ: đồng hồ, kết thúc ván, mất kết nối, người xem, bảng nước đi | 5 | `Frontend`, `Game Server` | `T-30`, `T-39`, `T-40`, `T-42`, `T-44`, `T-45` | 3 |
| `T-51` | Giao diện: camera/micro, bật tắt độc lập, mức chia sẻ, thông báo quyền và lỗi | 7 | `Frontend`, `Communication` | `T-06`, `T-08` | 4 |
| `T-52` | Máy chủ: mời bạn đang online vào phòng | 3 | `Room & Social` | `T-21`, `T-34`, `T-36` | 4 |
| `T-53` | Máy chủ: cấp quyền camera/micro theo vai và mở nhiều tab (tab mới tiếp quản) | 7 | `Communication`, `Game Server` | `T-06`, `T-20`, `T-38` | 4 |
| `T-54` | Nối web với máy chủ: bạn bè | 3 | `Frontend`, `Room & Social` | `T-29`, `T-33`, `T-34`, `T-40`, `T-43`, `T-52` | 4 |
| `T-55` | Nối web, máy chủ và máy cờ thật: ván với máy | 8 | `Frontend`, `AI` | `T-37`, `T-43` | 4 |
| `T-56` | Đo máy cờ đầy đủ (GATE-AI): tốc độ, độ sâu, sức mạnh, độ ổn định | 8 | `AI`, `QA & DevOps` | `T-31`, `T-43`, `T-46` | 4 |
| `T-57` | Nối camera/micro thật: theo đối tượng nhận, đổi vai, đuổi, tab (web, máy chủ, LiveKit) | 7 | `Frontend`, `Communication` | `T-30`, `T-38`, `T-49`, `T-51`, `T-53` | 4 |
| `T-58` | Giao diện: đủ 5 trạng thái cho mọi màn hình; tính năng chưa làm hiển thị đúng quy tắc | 1 | `Frontend` | `T-14`, `T-24`, `T-26`, `T-27`, `T-33`, `T-37`, `T-40`, `T-49`, `T-50`, `T-54`, `T-55`, `T-57` | 4 |
| `T-59` | Giao diện: dùng được từ 360 px và bằng cảm ứng; trợ năng | 1 | `Frontend` | `T-58` | 4 |
| `T-60` | Nghiệm thu từng tiêu chí giai đoạn 1 và chạy kịch bản demo D1–D10 | — | `QA & DevOps` | `T-13`, `T-23`, `T-27`, `T-35`, `T-40`, `T-47`, `T-48`, `T-49`, `T-50`, `T-54`, `T-55`, `T-57`, `T-58` | 4 |
| `T-61` | Nghiệm thu phi chức năng: bài tải, quyền camera/micro, trình duyệt, bảo mật | — | `QA & DevOps` | `T-23`, `T-46`, `T-49`, `T-50`, `T-56`, `T-57`, `T-59` | 4 |
| `T-62` | Chuẩn bị demo, sửa lỗi cuối, kiểm lại và bàn giao bằng chứng | — | `QA & DevOps` | `T-03`, `T-16`, `T-23`, `T-60`, `T-61` | 4 |

## 7. Tệp

- Chuẩn: `00-chuan-description.md`; mẫu: `00b-mau-description-chi-tiet.md`.
- 8 Epic: `02-epic.md`. 26 Story: `12-story-e1-e4.md`, `13-story-e5-e8.md`. 62 Task: `03` đến `11` (mỗi Epic một tệp, tệp `11` là task chung).

