# Kế hoạch Jira (bản nháp) — 01: Thành phần, Epic, Story và khung Task

**Ngày:** 2026-10-04 · **Trạng thái:** đề xuất, chờ PO duyệt · **Chưa tạo gì trên Jira.**

**Quy mô:** **8 Epic** (đúng 8 yêu cầu được giao) · **26 Story** · **64 Task** (gồm 6 task chung không thuộc Epic) · 4 Sprint (4+3+4+3 ngày), nộp 18/10/2026. Chưa có ước lượng giờ và người nhận việc (nhóm làm khi Sprint Planning).

**Mã:** Task `T-01` đến `T-64` đánh theo **thứ tự làm** (số nhỏ làm trước; mỗi task chỉ cần các task có số nhỏ hơn). Story đánh số 1–26 theo Epic. Khi tạo trên Jira, mỗi mục có số `XIAN-<số>` riêng.

## 0. Hướng làm bản chơi được trước, mở rộng sau (PO duyệt 04/10/2026)

**Nguyên tắc:** làm trước các tính năng cốt lõi để có **một bản chơi được từ đầu đến cuối** vào cuối Sprint 2 (10/10). Chỉ khi bản chơi được đạt mới mở rộng sang các phần con và đi sâu vào các tính năng còn lại ở Sprint 3 và 4. Phạm vi giai đoạn 1 (P1) không đổi; đây là cách sắp thứ tự làm, 8 Epic vẫn đúng 8 yêu cầu được giao.

**Lưu ý tên gọi:** các tài liệu đặc tả (`BA-SCOPE-DECISIONS.md`, `DANH-MUC-MAN-HINH-XIANGQI.md`) dùng "MVP 2 tuần" để chỉ **toàn bộ giai đoạn 1 (P1)**. Để không trùng nghĩa, kế hoạch này gọi phần làm trước là **"bản chơi được"** và đánh nhãn `loi` (lõi); phần làm sau là `mo-rong`. Phạm vi P1 không đổi.

**Phần lõi (bản chơi được) gồm:** (1) đăng ký/đăng nhập (OTP và Google); (2) tạo phòng; (3) mời bằng mã phòng và đường dẫn; (4) khởi tạo bàn cờ và tương tác với quân; (5) hai người đánh online từ đầu đến hết ván; (8) đánh với máy ba cấp độ.

**Mở rộng gồm:** (6) phòng công khai, khoá phòng và người xem; (7) chat hai kênh, camera và micro; bạn bè và mời bạn online (thuộc yêu cầu 3); chuyển hướng sau đăng nhập khi bấm đường dẫn mời; rớt mạng và nối lại; bảng nước đi; đăng xuất giữa ván; đo máy cờ đầy đủ; hoàn thiện giao diện (5 trạng thái, 360 px); nghiệm thu đầy đủ và gói demo.

**Cách đánh dấu:** mỗi Epic, Story và Task có nhãn `loi` hoặc `mo-rong` (Story và Epic có cả hai nhãn khi gồm cả phần lõi và phần mở rộng, kèm dòng "Giai đoạn" nêu rõ Task nào thuộc phần nào).

**Số Task lõi:** 34 trong tổng 64: Sprint 1 có 19 (T-01 đến T-19), Sprint 2 có 15 (T-20 đến T-34). Mốc kiểm: Task `T-34` (nghiệm thu bản chơi được) ở cuối Sprint 2; chưa đạt thì sửa bản chơi được trước khi mở rộng.

**Rủi ro:** dồn 34 task vào 7 ngày đầu; cần ước lượng giờ ở buổi Sprint Planning đầu tiên để kiểm sức chứa, nếu thiếu thì báo PO để quyết định bỏ việc nào ra khỏi phần lõi (nhiều khả năng là phần máy cờ hoặc Google).

## 1. Thành phần (Components) đề xuất

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
| Story 1 | Đăng ký tài khoản qua ba bước hoặc bằng Google | 1 || `T-03`, `T-13`, `T-18`, `T-21`, `T-22`, `T-25`, `T-42` |
| Story 2 | Đăng nhập bằng tên đăng nhập và mật khẩu hoặc bằng Google | 1 || `T-17`, `T-21`, `T-25` |
| Story 3 | Hồ sơ cơ bản và đăng xuất | 1 || `T-17`, `T-21`, `T-25`, `T-55` |
| Story 4 | Giao diện nhất quán: đủ 5 trạng thái, dùng được trên điện thoại, trợ năng, tính năng chưa làm | 1 || `T-07`, `T-60`, `T-61` |
| Story 5 | Tạo phòng | 2 || `T-10`, `T-15`, `T-28` |
| Story 6 | Thanh điều hướng và Sảnh | 2 || `T-10` |
| Story 7 | Phòng chờ, hai ghế ngồi, Sẵn sàng và bắt đầu ván | 2 || `T-11`, `T-23`, `T-28`, `T-32` |
| Story 8 | Vào phòng bằng mã, đường dẫn hoặc từ Sảnh | 2 || `T-10`, `T-11`, `T-19`, `T-28` |
| Story 9 | Chia sẻ phòng bằng đường dẫn và mã; người được mời đăng nhập xong vào đúng phòng | 3 || `T-11`, `T-15`, `T-43`, `T-54` |
| Story 10 | Kết bạn: tìm người, gửi và trả lời lời mời, giới hạn | 3 || `T-40`, `T-41`, `T-52` |
| Story 11 | Danh sách bạn và trạng thái | 3 || `T-40`, `T-41`, `T-52` |
| Story 12 | Mời bạn đang online vào phòng | 3 || `T-40`, `T-45`, `T-52` |
| Story 13 | Thấy bàn cờ và quân cờ | 4 || `T-05`, `T-12`, `T-53` |
| Story 14 | Tương tác với quân cờ: chọn, kéo thả, đánh dấu nước đi, cảnh báo chiếu, âm thanh | 4 || `T-08`, `T-16`, `T-20` |
| Story 15 | Đi nước qua mạng và bảng nước đi | 5 || `T-24`, `T-27`, `T-30`, `T-47` |
| Story 16 | Đồng hồ ván | 5 || `T-24`, `T-29`, `T-32` |
| Story 17 | Kết thúc ván: kết quả, đầu hàng, xin hoà, lặp thế | 5 || `T-08`, `T-24`, `T-29`, `T-32`, `T-53` |
| Story 18 | Rời phòng giữa ván, mất kết nối và kết nối lại | 5 || `T-24`, `T-51`, `T-57` |
| Story 19 | Kiểu phòng, khoá phòng và danh sách phòng công khai | 6 || `T-10`, `T-39`, `T-43`, `T-46` |
| Story 20 | Quản lý phòng: đổi chỗ, đuổi người xem, chủ phòng rời, sau ván | 6 || `T-39`, `T-44`, `T-46` |
| Story 21 | Người xem theo dõi trực tiếp | 6 || `T-50`, `T-57` |
| Story 22 | Chat hai kênh, giới hạn tin nhắn và lọc từ cấm | 7 || `T-09`, `T-48`, `T-56` |
| Story 23 | Camera và micro: người chơi bật, người xem chỉ xem | 7 || `T-35`, `T-36`, `T-49`, `T-59` |
| Story 24 | Mở nhiều tab: tab mới tiếp quản | 7 || `T-49`, `T-59` |
| Story 25 | Chọn cấp độ, chọn phe và máy đi nước đúng luật | 8 || `T-14`, `T-26`, `T-31`, `T-33`, `T-58` |
| Story 26 | Kết thúc ván với máy, vào lại ván và sự cố máy cờ | 8 || `T-26`, `T-31`, `T-33` |

## 3. Nhịp Sprint

| Sprint | Fix version | Ngày | Số ngày | Số task | Mục tiêu đề xuất |
|---|---|---|---|---:|---|
| 1 | `v0.1-sprint-1` | 04/10–07/10 | 4 ngày | 19 | **Bản chơi được, phần 1:** nền tảng, hợp đồng chung, luật cờ cốt lõi, đăng ký/đăng nhập phía máy chủ, khung giao diện, bàn cờ, phòng và máy cờ cơ bản. |
| 2 | `v0.2-loi-sprint-2` | 08/10–10/10 | 3 ngày | 15 | **Bản chơi được, phần 2 (mốc bản chơi được):** đăng ký/đăng nhập chạy thật, tạo phòng và vào bằng mã/đường dẫn, hai người đánh online từ đầu đến hết, đánh với máy ba cấp; cuối Sprint chạy nghiệm thu bản chơi được. |
| 3 | `v0.3-sprint-3` | 11/10–14/10 | 4 ngày | 17 | **Mở rộng, phần 1:** phòng công khai/khoá, người xem, đổi chỗ và đuổi, chat hai kênh, bạn bè, bảng nước đi, rớt mạng và nối lại; nền camera/micro; môi trường demo và kiểm thử tự động. |
| 4 | `v1.0-sprint-4` | 15/10–17/10 | 3 ngày | 13 | **Mở rộng, phần 2:** camera/micro thật, mời bạn, đường dẫn mời sau đăng nhập, đăng xuất giữa ván, đo máy cờ, hoàn thiện giao diện (5 trạng thái, 360 px), nghiệm thu đầy đủ và gói demo. |

**Phiên bản (Fix version):** 4 phiên bản, mỗi Sprint một phiên bản. Task gán theo Sprint của nó; Story và Epic gán theo Sprint của Task cuối (nơi việc hoàn thành). Phiên bản `v0.2-loi-sprint-2` là bản **bản chơi được**; `v1.0-sprint-4` là bản nộp bài.

**Nộp ngày 18/10/2026.** Chưa kiểm khả năng chứa vì chưa có ước lượng giờ.

## 4. Quy tắc thứ tự đã áp dụng (tiêu chí giáo viên)

- Cột **Cần xong trước** liệt kê task mà **kết quả** của nó là đầu vào của task này; trên Jira thành liên kết `is blocked by`.
- Không task nào chạy trước hoặc song song với task mà nó cần kết quả. Song song chỉ giữa các task độc lập hoặc cùng bắt đầu từ một hợp đồng đã xong (hợp đồng chung `T-02`).
- Điều kiện hoàn thành của một task chỉ dựa trên kết quả của chính nó và của các task nó cần.
- Mỗi mục có task **nối web với máy chủ** riêng, bắt đầu sau khi cả hai phía xong.
- Đã kiểm bằng chương trình: **64 task, không vòng chờ, không task nào cần task có số lớn hơn, không task nào cần task ở Sprint sau.**

## 5. Rủi ro lịch

- **Chuỗi dài nhất:** 16 task nối tiếp; riêng phần lõi là 11 task nối tiếp trong 7 ngày (Sprint 1 và 2). Sprint 1 có nhiều task nhất (19); cần ước lượng giờ để kiểm khả năng chứa.
- Task gộp nhiều việc nhỏ cùng mục đích có thể to hơn một ngày công; nhóm nên chia lại khi Sprint Planning nếu cần.
- Nơi chạy demo: **PO chốt 04/10/2026 ưu tiên chạy cục bộ, Render là dự phòng** (không còn chặn Sprint 2 vì chi phí).
- Điểm đã chốt: số người xem mặc định 5 (đề bài gốc ghi tối đa 2; kịch bản demo chọn 2 để dễ thử); đổi cặp người ngồi ghế thì không đọc tin cũ; ván gián đoạn hiện kết quả trung tính "Ván bị gián đoạn" (PO uỷ quyền, đã chốt 04/10/2026). Đang chờ PO: nút "Đăng ký bằng Google" (mờ) ở bước 1 đăng ký và liên kết "Quên mật khẩu?" (mờ) ở màn đăng nhập.

## 6. Thứ tự thực hiện và bảng task

Xếp theo thứ tự làm: Sprint, rồi việc không cần gì hoặc chỉ cần việc đã xong, rồi việc mở đường cho nhiều việc nối tiếp nhất.

| Task | Tên | Epic | Thành phần | Cần xong trước | Sprint | Bắt đầu | Hạn |
|---|---|---|---|---|---:|---|---|
| `T-01` | Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động | 1 | `QA & DevOps` | — | 1 | 04/10 | 04/10 |
| `T-02` | Soạn "hợp đồng chung" giữa trình duyệt và máy chủ | 1 | `Backend` | `T-01` | 1 | 04/10 | 05/10 |
| `T-03` | Cấu hình Supabase: gửi mã OTP đăng ký và đăng nhập Google | 1 | `Authentication` | `T-01` | 1 | 04/10 | 05/10 |
| `T-04` | Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập | 1 | `Backend` | `T-01` | 1 | 04/10 | 05/10 |
| `T-05` | Luật cờ: mô hình bàn cờ, thế khởi đầu, nước đi của từng loại quân | 4 | `Game Engine` | `T-01` | 1 | 04/10 | 05/10 |
| `T-06` | Dựng khung máy chủ: nhận kết nối có xác thực và chuyển lệnh | 1 | `Backend` | `T-01`, `T-02`, `T-03` | 1 | 05/10 | 05/10 |
| `T-07` | Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo) | 1 | `Frontend` | `T-01`, `T-02` | 1 | 05/10 | 05/10 |
| `T-08` | Luật cờ: nước hợp lệ, chiếu, chiếu hết, hết nước, lặp thế, 120 nửa nước | 4 | `Game Engine` | `T-05` | 1 | 05/10 | 05/10 |
| `T-09` | Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ | 1 | `Backend` | `T-02`, `T-04`, `T-06` | 1 | 06/10 | 06/10 |
| `T-10` | Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng | 2 | `Frontend` | `T-02`, `T-07` | 1 | 06/10 | 06/10 |
| `T-11` | Giao diện: phòng chờ và màn từ chối vào phòng | 2 | `Frontend` | `T-02`, `T-07` | 1 | 06/10 | 06/10 |
| `T-12` | Giao diện: bàn cờ SVG, quân chữ Hán, lật bàn cho phe Đen | 4 | `Frontend` | `T-05`, `T-07` | 1 | 06/10 | 06/10 |
| `T-13` | Máy chủ: đăng ký bước 1 và 2 (kiểm tra tên đăng nhập, gửi mã OTP) | 1 | `Authentication` | `T-03`, `T-04`, `T-06` | 1 | 06/10 | 06/10 |
| `T-14` | Máy cờ: chương trình chạy riêng, ba cấp độ, thử nghiệm sơ bộ tốc độ | 8 | `AI` | `T-08` | 1 | 06/10 | 06/10 |
| `T-15` | Máy chủ: trạng thái phòng, mỗi người một chỗ chơi và tạo phòng | 2 | `Room & Social` | `T-04`, `T-06`, `T-09` | 1 | 06/10 | 07/10 |
| `T-16` | Giao diện: bấm chọn quân và chấm gợi ý ô đi | 4 | `Frontend` | `T-08`, `T-12` | 1 | 06/10 | 07/10 |
| `T-17` | Máy chủ: đăng nhập, quản lý phiên và hồ sơ | 1 | `Authentication` | `T-03`, `T-04`, `T-06`, `T-09` | 1 | 06/10 | 07/10 |
| `T-18` | Máy chủ: đăng ký bước 3 (xác minh mã, hoàn tất tài khoản) | 1 | `Authentication` | `T-13` | 1 | 06/10 | 07/10 |
| `T-19` | Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh | 2 | `Room & Social` | `T-09`, `T-15` | 1 | 07/10 | 07/10 |
| `T-20` | Giao diện: kéo thả quân, đánh dấu nước vừa đi, cảnh báo chiếu, âm thanh | 4 | `Frontend` | `T-16` | 2 | 08/10 | 08/10 |
| `T-21` | Giao diện: đăng ký ba bước, đăng nhập, hồ sơ, đăng xuất | 1 | `Frontend` | `T-02`, `T-07`, `T-17` | 2 | 08/10 | 08/10 |
| `T-22` | Thử nghiệm OTP thật và đăng nhập Google; chặn người chưa hoàn tất đăng ký và chặn đổi email | 1 | `Authentication`, `QA & DevOps` | `T-03`, `T-18` | 2 | 08/10 | 08/10 |
| `T-23` | Máy chủ: chọn ghế, Sẵn sàng, đếm 3 giây, bắt đầu ván | 2 | `Room & Social` | `T-05`, `T-19` | 2 | 08/10 | 08/10 |
| `T-24` | Giao diện ván: bàn cờ nối mạng, đồng hồ, nút, hộp kết quả, khung xin hoà | 5 | `Frontend` | `T-02`, `T-07`, `T-20` | 2 | 08/10 | 09/10 |
| `T-25` | Nối web với máy chủ: đăng ký, đăng nhập, hồ sơ | 1 | `Frontend`, `Authentication` | `T-17`, `T-18`, `T-21`, `T-22` | 2 | 08/10 | 09/10 |
| `T-26` | Giao diện: chọn cấp và phe, màn ván với máy, thông báo sự cố | 8 | `Frontend` | `T-02`, `T-07`, `T-10`, `T-20` | 2 | 08/10 | 09/10 |
| `T-27` | Máy chủ: bộ xử lý lệnh của ván và xử lý nước đi | 5 | `Game Server` | `T-04`, `T-08`, `T-09`, `T-23` | 2 | 08/10 | 09/10 |
| `T-28` | Nối web với máy chủ: tạo phòng, vào phòng, ghế, Sẵn sàng, bắt đầu ván | 2 | `Frontend`, `Room & Social` | `T-10`, `T-11`, `T-23` | 2 | 08/10 | 09/10 |
| `T-29` | Máy chủ: đồng hồ ván, kết thúc ván, đầu hàng, xin hoà | 5 | `Game Server` | `T-27` | 2 | 09/10 | 09/10 |
| `T-30` | Nối web với máy chủ: đi nước, đồng bộ thế cờ giữa hai trình duyệt | 5 | `Frontend`, `Game Server` | `T-24`, `T-27`, `T-28` | 2 | 09/10 | 09/10 |
| `T-31` | Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ | 8 | `AI` | `T-14`, `T-15`, `T-27` | 2 | 09/10 | 09/10 |
| `T-32` | Nối web với máy chủ: bắt đầu ván đầy đủ, đồng hồ, kết thúc ván, đầu hàng, xin hoà | 5 | `Frontend`, `Game Server` | `T-29`, `T-30` | 2 | 09/10 | 10/10 |
| `T-33` | Nối web, máy chủ và máy cờ thật: ván với máy | 8 | `Frontend`, `AI` | `T-26`, `T-31` | 2 | 09/10 | 10/10 |
| `T-34` | Nghiệm thu bản chơi được: đăng ký, tạo phòng, mời, đánh online và đánh với máy chạy trọn | — | `QA & DevOps` | `T-25`, `T-28`, `T-32`, `T-33` | 2 | 10/10 | 10/10 |
| `T-35` | Thử nghiệm LiveKit Cloud: camera/micro theo từng người, thu hồi quyền | 7 | `Communication`, `QA & DevOps` | `T-01` | 3 | 11/10 | 12/10 |
| `T-36` | Giao diện: camera/micro, bật tắt độc lập, mức chia sẻ, thông báo quyền và lỗi | 7 | `Frontend`, `Communication` | `T-07`, `T-35` | 3 | 12/10 | 13/10 |
| `T-37` | Dựng khung kiểm thử tự động trên nhiều trình duyệt (Playwright) | — | `QA & DevOps` | `T-01`, `T-07` | 3 | 11/10 | 12/10 |
| `T-38` | Dựng môi trường demo: chạy cục bộ trước, Render làm dự phòng | — | `QA & DevOps` | `T-01`, `T-06`, `T-07` | 3 | 11/10 | 12/10 |
| `T-39` | Giao diện: cài đặt phòng, đổi chỗ ghế/xem, danh sách người xem, xác nhận đuổi | 6 | `Frontend` | `T-02`, `T-07`, `T-11` | 3 | 11/10 | 12/10 |
| `T-40` | Giao diện: bạn bè (tìm, lời mời, danh sách, mời vào phòng) | 3 | `Frontend`, `Room & Social` | `T-02`, `T-07`, `T-10`, `T-11` | 3 | 11/10 | 12/10 |
| `T-41` | Máy chủ: kết bạn, lời mời và danh sách bạn có trạng thái | 3 | `Room & Social` | `T-04`, `T-06`, `T-09`, `T-15` | 3 | 11/10 | 12/10 |
| `T-42` | Máy chủ: tác vụ định kỳ dọn và phục hồi tài khoản đăng ký dở | 1 | `Authentication` | `T-18` | 3 | 11/10 | 12/10 |
| `T-43` | Máy chủ: kiểu phòng (công khai, chỉ mã, khoá) và danh sách phòng ở Sảnh | 6 | `Room & Social` | `T-19` | 3 | 11/10 | 12/10 |
| `T-44` | Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng | 6 | `Room & Social` | `T-23`, `T-43` | 3 | 12/10 | 13/10 |
| `T-45` | Máy chủ: mời bạn đang online vào phòng | 3 | `Room & Social` | `T-19`, `T-41`, `T-43` | 3 | 12/10 | 13/10 |
| `T-46` | Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời | 6 | `Frontend`, `Room & Social` | `T-28`, `T-39`, `T-43`, `T-44` | 3 | 13/10 | 14/10 |
| `T-47` | Bảng nước đi: ký hiệu tiếng Việt và hiển thị | 5 | `Game Engine`, `Frontend` | `T-07`, `T-08`, `T-27` | 3 | 11/10 | 12/10 |
| `T-48` | Máy chủ: chat hai kênh, quyền đọc, giới hạn tin, lọc từ cấm | 7 | `Communication` | `T-04`, `T-09`, `T-19`, `T-44` | 3 | 13/10 | 14/10 |
| `T-49` | Máy chủ: cấp quyền camera/micro theo vai và mở nhiều tab (tab mới tiếp quản) | 7 | `Communication`, `Game Server` | `T-17`, `T-35`, `T-44` | 3 | 13/10 | 14/10 |
| `T-50` | Máy chủ: người xem theo dõi trực tiếp, lọc dữ liệu theo vai trò | 6 | `Game Server` | `T-19`, `T-27`, `T-29` | 3 | 11/10 | 12/10 |
| `T-51` | Máy chủ: rời phòng giữa ván, mất kết nối, giữ chỗ, kết nối lại, ván gián đoạn | 5 | `Game Server` | `T-29` | 3 | 11/10 | 12/10 |
| `T-52` | Nối web với máy chủ: bạn bè | 3 | `Frontend`, `Room & Social` | `T-28`, `T-31`, `T-40`, `T-41`, `T-45`, `T-46` | 4 | 15/10 | 15/10 |
| `T-53` | Kiểm thử luật cờ: đếm nước đi độc lập và bộ kiểm thử chạy tự động | 4 | `Game Engine`, `QA & DevOps` | `T-01`, `T-08`, `T-47` | 4 | 15/10 | 15/10 |
| `T-54` | Nối web với máy chủ: bấm đường dẫn mời, đăng nhập rồi vào đúng phòng | 3 | `Frontend`, `Room & Social` | `T-11`, `T-19`, `T-25`, `T-30`, `T-43`, `T-44` | 4 | 15/10 | 15/10 |
| `T-55` | Đăng xuất giữa ván: xác nhận, đầu hàng, rời phòng rồi đăng xuất | 5 | `Authentication` | `T-21`, `T-29`, `T-31`, `T-44` | 4 | 15/10 | 15/10 |
| `T-56` | Giao diện chat hai kênh và nối web với máy chủ | 7 | `Frontend`, `Communication` | `T-02`, `T-07`, `T-09`, `T-46`, `T-48`, `T-50` | 4 | 15/10 | 15/10 |
| `T-57` | Nối web với máy chủ: mất kết nối, người xem, bảng nước đi, phòng khoá | 5 | `Frontend`, `Game Server` | `T-32`, `T-46`, `T-47`, `T-50`, `T-51` | 4 | 15/10 | 15/10 |
| `T-58` | Đo máy cờ đầy đủ (GATE-AI): tốc độ, độ sâu, sức mạnh, độ ổn định | 8 | `AI`, `QA & DevOps` | `T-14`, `T-31`, `T-53` | 4 | 15/10 | 15/10 |
| `T-59` | Nối camera/micro thật: theo đối tượng nhận, đổi vai, đuổi, tab (web, máy chủ, LiveKit) | 7 | `Frontend`, `Communication` | `T-30`, `T-36`, `T-44`, `T-49`, `T-56` | 4 | 15/10 | 15/10 |
| `T-60` | Giao diện: đủ 5 trạng thái cho mọi màn hình; tính năng chưa làm hiển thị đúng quy tắc | 1 | `Frontend` | `T-10`, `T-21`, `T-24`, `T-25`, `T-26`, `T-32`, `T-33`, `T-40`, `T-46`, `T-52`, `T-56`, `T-57`, `T-59` | 4 | 16/10 | 16/10 |
| `T-61` | Giao diện: dùng được từ 360 px và bằng cảm ứng; trợ năng | 1 | `Frontend` | `T-60` | 4 | 16/10 | 16/10 |
| `T-62` | Nghiệm thu từng tiêu chí giai đoạn 1 và chạy kịch bản demo D1–D10 | — | `QA & DevOps` | `T-22`, `T-25`, `T-32`, `T-33`, `T-34`, `T-37`, `T-42`, `T-46`, `T-52`, `T-54`, `T-55`, `T-56`, `T-57`, `T-59`, `T-60` | 4 | 16/10 | 16/10 |
| `T-63` | Nghiệm thu phi chức năng: bài tải, quyền camera/micro, trình duyệt, bảo mật | — | `QA & DevOps` | `T-22`, `T-32`, `T-53`, `T-56`, `T-57`, `T-58`, `T-59`, `T-61` | 4 | 17/10 | 17/10 |
| `T-64` | Chuẩn bị demo, sửa lỗi cuối, kiểm lại và bàn giao bằng chứng | — | `QA & DevOps` | `T-03`, `T-22`, `T-38`, `T-62`, `T-63` | 4 | 17/10 | 17/10 |

## 6.1 Cách tính ngày bắt đầu và hạn của từng Task (PO duyệt 04/10/2026)

Chưa có ước lượng giờ nên ngày được tính theo **chuỗi phụ thuộc** trong từng Sprint, không gán chung một khoảng ngày cho cả Sprint: Task không cần Task nào trong Sprint thì bắt đầu ngay đầu Sprint; Task cần kết quả của Task khác thì **bắt đầu từ ngày kết thúc của Task đó trở đi**. Mỗi tầng phụ thuộc được chia một phần số ngày của Sprint; các Task độc lập cùng tầng có thể trùng ngày vì nhóm làm song song. Story và Epic lấy ngày bắt đầu sớm nhất và hạn muộn nhất của các Task con. **Đây là ngày đề xuất theo thứ tự làm**, nhóm điều chỉnh khi ước lượng giờ ở buổi Sprint Planning.

## 7. Tệp

- Chuẩn: `00-chuan-description.md`; mẫu: `00b-mau-description-chi-tiet.md`.
- 8 Epic: `02-epic.md`. 26 Story: `12-story-e1-e4.md`, `13-story-e5-e8.md`. 64 Task: `03` đến `11` (mỗi Epic một tệp, tệp `11` là task chung). Bảng đối chiếu tiêu chí → Story → Task: `14-bang-doi-chieu-tieu-chi.md`.

