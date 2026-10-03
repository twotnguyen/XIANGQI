# docs/ · Tài liệu phân tích chuyên sâu (Giai đoạn 2)

**Trạng thái: nền tảng đã duyệt 03/10/2026; bản viết lại 04/10/2026 chờ Product Owner review** (OTP: Phương án B; 13 quyết định duyệt như đề xuất). Giai đoạn 1 và Giai đoạn 2 xong ngày 03/10/2026; hiện ở Giai đoạn 3. Thư mục `docs/` này là **thư mục mới** (không liên quan `docs/` cũ đã xoá ở nhánh `chore/xoa-docs-va-jira-cu`).

Thứ tự ưu tiên khi có mâu thuẫn (AGENTS §2): yêu cầu trực tiếp của người dùng > `AGENTS.md` > [BA-SCOPE-DECISIONS.md](../BA-SCOPE-DECISIONS.md) > `docs/` > [DANH-MUC](../DANH-MUC-MAN-HINH-XIANGQI.md) > [DESIGN.md](../DESIGN.md) và `mockups/`. **`docs/` chi tiết hoá chứ không đổi phạm vi**; thấy mâu thuẫn với BA-SCOPE thì BA-SCOPE thắng và phải báo người dùng.

## Mục lục

| Tệp | Nội dung | Dùng cho |
|---|---|---|
| [01-yeu-cau-chi-tiet.md](01-yeu-cau-chi-tiet.md) | 81 US (53 P1, 28 P2), 280 AC có mã; yêu cầu phi chức năng | Người chia việc, người kiểm thử |
| [02-luat-co-tuong.md](02-luat-co-tuong.md) | Luật cờ tướng chi tiết, kết thúc ván, lặp thế, chiếu liên tục, ký hiệu nước đi, máy cờ và 3 cấp độ | Lập trình luật cờ và máy cờ |
| [03-du-lieu.md](03-du-lieu.md) | Thực thể, cột, ràng buộc, quyền truy cập, dữ liệu tạm | Lập trình máy chủ và cơ sở dữ liệu |
| [04-kien-truc.md](04-kien-truc.md) | Thành phần, xác thực, thời gian thực, đồng hồ, LiveKit, máy cờ, bảo mật, triển khai | Mọi lập trình viên |
| [05-kiem-thu.md](05-kiem-thu.md) | Chiến lược kiểm thử, kịch bản demo (tiêu chí hoàn thành P1), tình huống bắt buộc, con số cần đo | Người kiểm thử, người làm hiệu năng |
| [06-ke-hoach-jira.md](06-ke-hoach-jira.md) | **Giai đoạn 3:** vai trò, Epic/Story/Task, ước lượng, công suất, lịch, cấu trúc Jira | Product Owner, người chia việc |
| [07-hop-dong-nghiep-vu.md](07-hop-dong-nghiep-vu.md) | Quyền, vòng đời, tiền/hậu điều kiện, đồng thời, lỗi và phục hồi P1/P2 | Product Owner, người thiết kế/kiểm thử |
| [08-ma-tran-nghiem-thu.md](08-ma-tran-nghiem-thu.md) | Mọi AC → TC; năm trạng thái của 37 thành phần; ca biên xuyên luồng | Người review và kiểm thử |

## Bản hoàn thiện 04/10/2026

Product Owner đã duyệt các quyết định bổ sung trong BA (nhật ký cuối file) và yêu cầu đặc tả chi tiết **cả P1/P2**, không đổi thứ tự ưu tiên. **Bản viết cập nhật đang chờ review**, chưa được dùng nhãn duyệt 03/10 để tuyên bố toàn bộ thay đổi mới đã được duyệt.

Đọc theo thứ tự: [IDEA](../IDEA.md) → BA → [01] → [07](07-hop-dong-nghiep-vu.md) → [08](08-ma-tran-nghiem-thu.md); [02]–[05] cung cấp chi tiết chuyên môn. Các con số là độ phủ đặc tả, không phải test PASS.

Không đọc/sửa `Jira/`, `06-ke-hoach-jira.md` hoặc `mockups/` trong đợt này. Kế hoạch/US ở các bản nháp cũ chưa được đối soát với baseline mới, **không coi là đã đồng bộ**; khi lập kế hoạch phải làm bước đối soát riêng sau review. Mockup lệch đặc tả chỉ tham khảo.

## Các con số tạm của Giai đoạn 1 (đã duyệt)

| Hạng mục | Giá trị đã duyệt | Nơi định nghĩa |
|---|---|---|
| Hoà không ăn quân | 120 nửa nước | [02] mục 5 |
| Chiếu liên tục | Bên chiếu thua; cả hai chiếu thì hoà | [02] mục 4 |
| Đuổi quân liên tục | **Không xử riêng**, xử hoà theo lặp 3 lần (khác biệt đã biết với luật chính thức) | [02] mục 4.1 |
| Máy cờ | Độ sâu 2 / 4 / 6; 300 / 1 000 / 3 000 ms; có phương án dự phòng | [02] mục 9 |
| Quy mô | 50 người dùng, 10 ván cùng lúc | [04] mục 10; [05] mục 6 |
| Tiêu chí hoàn thành P1 | Demo 8 mục cốt lõi end-to-end (kịch bản D1–D10) | [05] mục 1 |

## Quyết định (Product Owner đã duyệt 03/10/2026)

| # | Quyết định | Chi tiết |
|---|---|---|
| 1 | Đuổi quân liên tục không xử riêng ở cả P1 và P2 | [02] mục 4.1 |
| 2 | 120 nửa nước không ăn quân | [02] mục 5 |
| 3 | Thiết kế máy cờ (hàm lượng giá, yếu tố ngẫu nhiên cấp Dễ/Trung bình, phương án dự phòng độ sâu 5) | [02] mục 9 |
| 4 | Ván với máy ở P1 chỉ giữ trong bộ nhớ 30 phút, chưa lưu cơ sở dữ liệu | [03] mục 5 |
| 5 | Mọi dữ liệu trạng thái ván/phòng đi qua máy chủ; client chỉ đọc cột công khai của `profiles` | [03] mục 5 |
| 6 | Một thể hiện máy chủ, trạng thái ván trong bộ nhớ | [04] mục 11 |
| 7 | **OTP: Phương án B (OTP gốc Supabase)**; BA 1.1, 1.5 đã sửa lời; "huỷ ở lần sai thứ 5" chỉ gần đúng | [04] mục 3.1 |
| 8 | Không thêm công nghệ ngoài danh sách README (Phương án B: máy chủ ứng dụng không tự gửi thư, dùng SMTP mặc định của Supabase, PO duyệt 04/10/2026: khoảng 2 thư/giờ, chỉ tới địa chỉ thuộc nhóm dự án, demo đăng ký chỉ dùng email thành viên nhóm; BA 10.1); thư viện tạo Mã QR và bộ biểu tượng chọn lúc bắt đầu Giai đoạn 4 | [04] mục 11 |
| 9 | Chạy 3 thử nghiệm rủi ro cao ngay đầu Giai đoạn 4: LiveKit quyền đăng ký track theo từng người; cấu hình OTP Supabase (hạn 180 giây, gửi lại 60 giây, giới hạn tốc độ xác minh, mã 6 số) và quét dọn bản ghi chưa hoàn tất; độ sâu máy cờ | [04] mục 11 |
| 10 | Giá trị perft tham chiếu phải được xác minh bằng bộ sinh nước độc lập trước khi dùng làm chuẩn | [05] mục 3.1 |
| 11 | **Khi cơ sở dữ liệu lỗi**: đóng băng đồng hồ, quá 30 giây thì `INTERRUPTED`, ghi bù khi hồi phục (ván với máy P1 chỉ trong bộ nhớ, không áp dụng) | [04] mục 4.2 |
| 12 | Xác nhận danh sách công nghệ README (TypeScript, Node.js, pnpm, React, Vite, NestJS, Socket.IO, Supabase, LiveKit, Vitest, Playwright) và một thể hiện máy chủ duy nhất | [04] mục 11 |
| 13 | PGN: chỉ khi công cụ ngoài nhập được chính tệp xuất ra thì mục đích BA 9.1 mới đạt; ngược lại báo Product Owner | [02] mục 7.4 |

## Đối chiếu thành phần giao diện P1 và US

| Thành phần P1 (DANH-MUC §7) | US |
|---|---|
| `SCR-LOGIN` | AUTH-04 |
| `SCR-REGISTER` | AUTH-01, 02, 03 |
| `SCR-LOBBY` | UI-02, ROOM-08 |
| `SCR-WAITING-ROOM` | ROOM-02, 03, 06, 10, 11 |
| `SCR-GAME-ROOM` | BOARD-01…05, PLAY-01…10 |
| `SCR-AI-GAME` | AI-01…04 |
| `SCR-ACCESS-DENIED` | ROOM-12 |
| `SCR-PROFILE-SETTINGS` | AUTH-05 |
| `SCR-FRIENDS` | FRIEND-01, 02, 03, 05 |
| `MODAL-CREATE-ROOM` | ROOM-01 |
| `MODAL-INVITE` | ROOM-04, FRIEND-04 |
| `MODAL-ROOM-SETTINGS` | ROOM-07 |
| `MODAL-AI-SETUP` | AI-01 |
| `MODAL-DRAW-PROMPT` | PLAY-05 |
| `MODAL-CONFIRM-RESIGN` | PLAY-04 |
| `MODAL-CONFIRM-LEAVE` | PLAY-06 |
| `MODAL-CONFIRM-KICK` | ROOM-09 |
| `MODAL-MATCH-RESULT` | PLAY-03, AI-03 |
| `PANEL-NAVBAR` | UI-01, FRIEND-02 |
| `PANEL-CHAT` | CHAT-01, 02 |
| `PANEL-MEDIA` | MEDIA-01, 02, 03 |
| `PANEL-SPECTATORS` | ROOM-09, PLAY-09 |
| `OVERLAY-RECONNECTING` | PLAY-07 |

Đủ 23 thành phần P1 và 14 P2, không thêm màn hình do có phần Luật chơi/bộ chọn giao diện. Ánh xạ đầy đủ hai phân kỳ và 185 trường hợp trạng thái nằm ở [08](08-ma-tran-nghiem-thu.md). Nhãn `MODAL-DRAW-PROMPT` giữ để tham chiếu nhưng hành vi không modal theo BA 3.6.

## Chưa làm (có chủ ý)

* **Chưa tạo Epic/Story/Task trên Jira**: đó là Giai đoạn 3 và cần Product Owner xác nhận riêng (AGENTS §1). Mã nhóm A–N và US chỉ là nhãn tham chiếu để Giai đoạn 3 dùng lại.
* **Chưa viết mã**, chưa tạo `apps/`, `packages/`, `supabase/`, `tests/` (Giai đoạn 4).
* **Chưa thử nghiệm thực tế**: giá trị perft, độ sâu máy cờ, cấu hình OTP 180 giây của Supabase và quyền đăng ký track của LiveKit đều là **giả định cần đo** ở đầu Giai đoạn 4 (xem [05]). Nếu đo không đạt thì ghi số thật và báo Product Owner.

## Mốc duyệt nền và điều kiện dùng baseline cập nhật

1. Product Owner đã duyệt các quyết định ở bảng trên (03/10/2026). ✔
2. Product Owner đã xác nhận Giai đoạn 2 xong và cho phép bắt đầu Giai đoạn 3 (03/10/2026). ✔
3. Bản bổ sung 04/10 cần Product Owner review các tài liệu đã viết trước khi dùng để chốt kế hoạch mới. Cổng kỹ thuật NOT_RUN ở [05] mục 11 là phụ thuộc/rủi ro phải giữ trong kế hoạch, không bằng chứng thất bại hay đã đạt.
4. Tiêu chí chấm ngoài D1–D10 chỉ bổ sung khi được cung cấp. Không xác minh hoặc thao tác Jira trong đợt này; dữ liệu kế hoạch và dự án/key phải được đối soát riêng trước khi tạo issue.

[01]: 01-yeu-cau-chi-tiet.md
[02]: 02-luat-co-tuong.md
[03]: 03-du-lieu.md
[04]: 04-kien-truc.md
[05]: 05-kiem-thu.md
