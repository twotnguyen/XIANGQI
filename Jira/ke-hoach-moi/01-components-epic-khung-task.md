# Kế hoạch mới (bản nháp) — 01: Thành phần Jira, Epic và khung Task

**Ngày:** 2026-10-04 · **Trạng thái:** ĐỀ XUẤT, chờ PO và nhóm duyệt · **Chưa tạo gì trên Jira.**

**Căn cứ:** `docs/01` (53 US P1), `docs/04–05`, BA Phần 10–11, tiêu chí của giáo viên (BA 10.1: Description chi tiết gồm yêu cầu, mục tiêu, kết quả, cách kiểm thử, điều kiện PASS; thứ tự sao cho kết quả việc này là đầu vào việc kia). Tài liệu tổng hợp phương pháp: `Jira/scrum-jira-2026-10-04/08-tong-hop-nghien-cuu-3-agent.md`.

**Chưa có trong bản này (cố ý):** ước lượng giờ (nhóm ước lượng khi Sprint Planning), người nhận việc (nhóm gán), ngày hoàn thành từng task. Bản này chỉ cố định **cấu trúc, phụ thuộc và thứ tự**.

## 1. Thành phần (Components) đề xuất của dự án XIAN

13 thành phần. Mỗi task gắn **một thành phần (tối đa hai nếu liên module)**; tên dùng đúng khi tạo trường **Components** trên Jira (sau khi PO cho phép).

| Thành phần | Tên đầy đủ | Nơi trong kho / công nghệ | Phạm vi | Số task |
|---|---|---|---|---:|
| `Frontend` | Giao diện web | `apps/web` (React, Vite, TypeScript) | Màn hình, luồng người dùng, bàn cờ SVG và tương tác phía client | 29 |
| `UI/UX` | Hệ thống giao diện và trải nghiệm | `apps/web` (token, thành phần nền) | Token Kỳ Đài Cổ Phong, 5 trạng thái, responsive, trợ năng | 5 |
| `Backend` | Máy chủ ứng dụng, hợp đồng chung và dữ liệu | `apps/server` (NestJS), `packages/shared`, `supabase/migrations` | Khung máy chủ, hợp đồng chung, bộ lọc dùng chung, schema và migration cơ sở dữ liệu; không chứa nghiệp vụ miền đã có thành phần riêng | 4 |
| `Authentication` | Tài khoản và phiên | Supabase Auth, `apps/server` | Đăng ký OTP, đăng nhập, phiên, hồ sơ, phục hồi tài khoản dở | 11 |
| `Game Engine` | Luật cờ | `packages/rules` (TypeScript thuần) | Sinh nước đi, hợp lệ, chiếu/chiếu hết, hết nước, lặp thế, chiếu liên tục, ký hiệu; bộ kiểm thử luật, perft | 7 |
| `Match` | Vòng đời ván | `apps/server` (mô-đun ván) | Xử lý nước đi vào ván, đồng hồ, kết thúc ván, đầu hàng, xin hoà | 3 |
| `Room Management` | Phòng, ghế, người xem | `apps/server` (mô-đun phòng) | Tạo/vào phòng, ghế, Sẵn sàng, riêng tư/khoá, đuổi, Host, danh sách phòng | 10 |
| `Realtime` | Thời gian thực | `apps/server` (Socket.IO) | Xử lý lệnh tuần tự, chống trùng, đồng bộ trạng thái, kết nối lại, người xem trực tiếp, nhiều tab | 10 |
| `Communication` | Chat và camera/mic | Máy chủ, web, LiveKit Cloud | Chat hai kênh, giới hạn/lọc, token LiveKit, quyền theo vai, bật/tắt, mức chia sẻ | 7 |
| `Social` | Bạn bè | `apps/server`, `apps/web` | Tìm người, lời mời, danh sách bạn, trạng thái online, mời vào phòng | 5 |
| `AI` | Máy cờ | `apps/ai-worker`, mô-đun ván với máy | Tiến trình máy cờ, ba cấp, watchdog, ván với máy, vào lại, Thử lại | 6 |
| `QA` | Kiểm thử và bằng chứng | `tests/`, Vitest, Playwright | Kiểm thử luật, tích hợp, đầu-cuối, tải, các cổng PoC, nghiệm thu | 13 |
| `DevOps` | Hạ tầng và vận hành | Kho, CI, môi trường chạy | Monorepo, CI, môi trường demo, cấu hình | 3 |

### 1.1 Quy tắc gán thành phần (theo `Components-guide.md`, áp dụng cho XIANGQI)

1. Thành phần là **module hoặc khu vực ổn định** của hệ thống. **Không** dùng cho người làm, mức ưu tiên, Sprint, tính năng tạm thời hay từng việc nhỏ (dùng Assignee, Priority, Sprint, Label, Fix version).
2. Gán theo **trách nhiệm chính** của issue ("nơi chịu thay đổi chính"), không liệt kê mọi module nó chạm tới.
3. **Một thành phần là bình thường; hai là việc liên module; từ ba trở lên thì xem xét tách issue.**
4. Epic, Story, Task **không bắt buộc cùng thành phần** với cấp trên.

| Loại | Quy tắc thành phần | Thể hiện |
|---|---|---|
| Epic | Tuỳ chọn, 0–1 (tối đa 2); để trống nếu Epic trải rộng nhiều module | Miền lớn rõ ràng |
| Story | Nên có 1 (tối đa 2) | Module chức năng |
| Task | Nên có 1 (tối đa 2) | Khu vực kỹ thuật chịu thay đổi chính |
| Bug | Bắt buộc 1 (tối đa 2) | Module xảy ra lỗi |

**Nhãn (Label) cho phân loại tạm thời/xuyên suốt:** `P1`, `P2`, mã US (ví dụ `US-ROOM-05`), `poc`, `contract`, `integration`, `gate`, `spike`. Nhãn không thay thành phần.

**Kiểm tra bản kế hoạch này:** 90 task; **68 task có 1 thành phần, 22 task có 2 (việc liên module như tích hợp web ↔ máy chủ), không task nào có 3 trở lên.** Thành phần dùng nhiều nhất là `Frontend` (29 task); mọi thành phần còn lại không quá 13 task.

**Quyết định thành phần (đề xuất 04/10/2026, chờ PO duyệt):** (1) tách `Match` khỏi `Game Engine` để luật cờ (gói dùng chung) và vòng đời ván (đồng hồ, kết thúc, đầu hàng, xin hoà) là hai khu vực ổn định khác nhau; (2) **không** tạo `Database` riêng vì chỉ có 1 task, gộp schema/migration vào `Backend`; (3) **chưa** tạo `Security`, `Monitoring`, `Documentation` vì NFR liên quan (quan sát vận hành, lưu giữ dữ liệu, an toàn hiển thị) còn chờ duyệt; tạo thêm khi cần, vì thành phần Jira thêm bất kỳ lúc nào.

## 2. Epic đề xuất

| Epic | Tên | Nguồn | US phục vụ | Thành phần Epic (0–1) | Số task |
|---|---|---|---|---|---:|
| E0 | Nền tảng và PoC rủi ro | Nền chạy được và bằng chứng sớm cho các rủi ro lớn (OTP, media, luật, máy cờ) | — | (để trống) | 15 |
| EA | Tài khoản và phiên | Nhóm A (docs/01) | US-AUTH-01..06 | Authentication | 12 |
| EB | Phòng, mời, ghế, người xem | Nhóm B | US-ROOM-01..12 | Room Management | 12 |
| EC | Bàn cờ và luật cờ | Nhóm C | US-BOARD-01..05 | (để trống: trải rộng Game Engine và Frontend) | 10 |
| ED | Ván đấu online | Nhóm D | US-PLAY-01..10 | (để trống: trải rộng Match, Realtime, Frontend) | 11 |
| EE | Chat và camera/mic | Nhóm E | US-CHAT-01..02, US-MEDIA-01..03 | Communication | 7 |
| EF | Bạn bè (tối thiểu P1) | Nhóm F | US-FRIEND-01..05 | Social | 5 |
| EG | Đánh với máy | Nhóm G | US-AI-01..04 | AI | 6 |
| EH | Giao diện chung | Nhóm H | US-UI-01..06 | UI/UX | 6 |
| EQ | Kiểm thử chấp nhận và Demo | Kiểm chứng toàn P1 và chuẩn bị nộp | — | QA | 7 |

Nhóm I–N (P2) giữ ở Product Backlog dạng Epic nháp, **không** vào Sprint trong 14 ngày.

## 2.1 Story (53 US P1): Epic và thành phần

Mỗi US thành một Story (đối chiếu 1:1 mặc định; nhóm có thể gộp/tách khi lập lát giá trị). Thành phần của Story là **module chức năng chính**, không cần giống Epic hay Task.

| Story (US) | Tên | Epic | Thành phần Story |
|---|---|---|---|
| `US-AUTH-01` | Đăng ký bước 1: username và mật khẩu | EA | Authentication |
| `US-AUTH-02` | Đăng ký bước 2: email và gửi OTP | EA | Authentication |
| `US-AUTH-03` | Đăng ký bước 3: xác thực OTP, tạo tài khoản | EA | Authentication |
| `US-AUTH-04` | Đăng nhập bằng username và mật khẩu | EA | Authentication |
| `US-AUTH-05` | Hồ sơ cơ bản và đăng xuất | EA | Authentication |
| `US-AUTH-06` | Chuyển hướng vào phòng sau đăng nhập | EA | Authentication |
| `US-ROOM-01` | Tạo phòng | EB | Room Management |
| `US-ROOM-02` | Phòng chờ và ghế ngồi | EB | Room Management |
| `US-ROOM-03` | Sẵn sàng và bắt đầu ván | EB | Room Management |
| `US-ROOM-04` | Chia sẻ phòng bằng link và mã | EB | Room Management |
| `US-ROOM-05` | Vào phòng bằng mã, link hoặc Sảnh | EB | Room Management |
| `US-ROOM-06` | Đổi chỗ giữa ghế và người xem | EB | Room Management |
| `US-ROOM-07` | Chế độ riêng tư và khoá phòng | EB | Room Management |
| `US-ROOM-08` | Danh sách phòng công khai ở Sảnh | EB | Room Management |
| `US-ROOM-09` | Đuổi người xem | EB | Room Management |
| `US-ROOM-10` | Host rời, chuyển quyền, đóng phòng | EB | Room Management |
| `US-ROOM-11` | Sau ván CASUAL: quay về phòng chờ | EB | Room Management |
| `US-ROOM-12` | Màn hình từ chối truy cập | EB | Room Management |
| `US-BOARD-01` | Hiển thị bàn cờ | EC | Frontend |
| `US-BOARD-02` | Chọn quân và gợi ý ô đi bằng click | EC | Frontend |
| `US-BOARD-03` | Kéo thả | EC | Frontend |
| `US-BOARD-04` | Đánh dấu nước cuối và chiếu | EC | Frontend |
| `US-BOARD-05` | Âm thanh | EC | Frontend |
| `US-PLAY-01` | Đi nước qua mạng | ED | Realtime |
| `US-PLAY-02` | Đồng hồ | ED | Match |
| `US-PLAY-03` | Kết thúc ván và kết quả | ED | Match |
| `US-PLAY-04` | Đầu hàng | ED | Match |
| `US-PLAY-05` | Xin hoà | ED | Match |
| `US-PLAY-06` | Rời phòng giữa ván | ED | Room Management |
| `US-PLAY-07` | Mất kết nối và kết nối lại | ED | Realtime |
| `US-PLAY-08` | Lặp thế, chiếu liên tục, không ăn quân | ED | Match |
| `US-PLAY-09` | Người xem theo dõi trực tiếp | ED | Realtime |
| `US-PLAY-10` | Bảng nước đi | ED | Frontend |
| `US-CHAT-01` | Hai kênh chat | EE | Communication |
| `US-CHAT-02` | Giới hạn và bộ lọc từ cấm | EE | Communication |
| `US-MEDIA-01` | Camera và micro cho hai người chơi | EE | Communication |
| `US-MEDIA-02` | Người xem chỉ xem/nghe | EE | Communication |
| `US-MEDIA-03` | Mở nhiều tab | EE | Communication |
| `US-FRIEND-01` | Tìm người và gửi lời mời | EF | Social |
| `US-FRIEND-02` | Nhận và trả lời lời mời | EF | Social |
| `US-FRIEND-03` | Danh sách bạn và trạng thái | EF | Social |
| `US-FRIEND-04` | Mời bạn bè online vào phòng | EF | Social |
| `US-FRIEND-05` | Giới hạn | EF | Social |
| `US-AI-01` | Chọn cấp độ và phe | EG | AI |
| `US-AI-02` | Chơi với máy | EG | AI |
| `US-AI-03` | Kết thúc, bỏ dở và vào lại | EG | AI |
| `US-AI-04` | Sự cố máy cờ | EG | AI |
| `US-UI-01` | Thanh điều hướng | EH | Frontend |
| `US-UI-02` | Sảnh | EH | Frontend |
| `US-UI-03` | Năm trạng thái cho mọi màn hình | EH | UI/UX |
| `US-UI-04` | Responsive | EH | UI/UX |
| `US-UI-05` | Trợ năng | EH | UI/UX |
| `US-UI-06` | Tính năng P2 hiển thị đúng quy tắc | EH | UI/UX |

## 3. Nhịp Sprint và mục tiêu

| Sprint | Ngày | Số ngày | Số task | Chuỗi phụ thuộc dài nhất trong Sprint | Mục tiêu đề xuất |
|---|---|---|---:|---:|---|
| 1 | 04/10–07/10 | 4 ngày | 25 | 5 | Nền tảng, hợp đồng chung, luật cờ cốt lõi và đăng nhập phía máy chủ chạy được; các PoC rủi ro có số đo thật. |
| 2 | 08/10–10/10 | 3 ngày | 22 | 6 | Đăng ký/đăng nhập chạy thật; hai người vào cùng phòng, bắt đầu ván và đi nước đồng bộ trên hai trình duyệt. |
| 3 | 11/10–14/10 | 4 ngày | 27 | 4 | Ván online hoàn chỉnh (đồng hồ, kết thúc, kết nối), phòng xã hội, chat và ván với máy ba cấp. |
| 4 | 15/10–17/10 | 3 ngày | 17 | 7 | Camera/mic, bạn bè, hội tụ giao diện (5 trạng thái, responsive, trợ năng), kiểm thử chấp nhận và gói demo. |

**Nộp ngày 18/10/2026.** Số task và chuỗi dài nhất chỉ để thấy độ nén; **chưa kiểm khả năng chứa** vì chưa có ước lượng giờ (xem mục 5).

## 4. Quy tắc thứ tự đã áp dụng (tiêu chí giáo viên)

- Cột **Bắt đầu khi** liệt kê task mà **kết quả** của nó là đầu vào của task này. Mỗi dòng sẽ thành liên kết `is blocked by` trên Jira.
- Không task nào chạy trước hoặc song song với task mà nó cần kết quả. Song song chỉ giữa các task **độc lập** hoặc **cùng bắt đầu từ một hợp đồng đã xong** (`T0-03` cho giao diện và máy chủ).
- **Điều kiện PASS của một task chỉ dựa trên hiện vật của chính nó và của các tiền đề đã khai báo.** Ca kiểm cần hiện vật của task đứng sau (đồng hồ thật, thu hồi media thật, tiếp quản tab, guard hồ sơ thật…) phải chuyển sang task hậu nhiệm; không ghi "BLOCKED" cuối task để che một vòng chờ ẩn (phát hiện qua chéo kiểm của Codex và Hermes).
- Mỗi miền có task **tích hợp** riêng (web ↔ máy chủ) bắt đầu sau khi cả hai phía xong; mock theo hợp đồng chỉ để phát triển.
- Kiểm bằng chương trình: **91 task, không có vòng chờ, không task nào phụ thuộc vào task ở Sprint sau, 53/53 US P1 có ít nhất một task phục vụ.**

## 5. Rủi ro lịch nhìn thấy từ cấu trúc

- **Đường găng** (chuỗi dài nhất): 17 task nối tiếp: `TQ-07` ← `TQ-05` ← `TH-04` ← `TH-03` ← `TE-07` ← `TE-03` ← `TD-06` ← `TD-03` ← `TD-02` ← `TD-01` ← `TB-04` ← `TB-03` ← `TB-02` ← `TB-01` ← `T0-11` ← `T0-03` ← `T0-01`. Nếu trung bình mỗi task trên đường này mất hơn khoảng 7 giờ làm việc thì tổng vượt 14 ngày. Phải ước lượng giờ rồi mới biết.
- Sprint 2 (3 ngày) và Sprint 4 (3 ngày) có chuỗi dài nhất 6–7 task nối tiếp: **rất sát**. Nên rút ngắn bằng cách chia nhỏ task trên đường găng hoặc dồn việc không thuộc đường găng sang Sprint khác sau khi có ước lượng.
- `T0-12` (chốt nơi chạy ứng dụng) cần quyết định của PO về hạ tầng/chi phí; chưa quyết thì Sprint 2 bị chặn ở phần môi trường demo.

## 6. Bảng task (khung)

Cột **Sprint** là đề xuất theo lớp phụ thuộc; **Tầng** là độ sâu phụ thuộc (0 = không cần gì).

| ID | Tên task | Epic | Thành phần | Nguồn (US/AC/tài liệu) | Bắt đầu khi (is blocked by) | Kết quả (đầu ra) | Sprint | Tầng |
|---|---|---|---|---|---|---|---:|---:|
| `T0-01` | Khởi tạo monorepo pnpm, TypeScript, lint, Vitest | E0 | `DevOps` | AGENTS §4.4; docs/04 §2 | — | Kho chạy được `pnpm install/build/test` | 1 | 0 |
| `T0-02` | Thiết lập CI (build, lint, test) cho mọi nhánh | E0 | `DevOps` | docs/05 §7 | `T0-01` | CI xanh trên nhánh mẫu | 1 | 1 |
| `T0-03` | Gói hợp đồng chung `packages/shared`: kiểu dữ liệu, sự kiện, mã lỗi, commandId | E0 | `Backend` | docs/04 §4.1; docs/07 §3 | `T0-01` | Gói shared đã xuất bản nội bộ, mọi bên dùng chung | 1 | 1 |
| `T0-04` | Schema Supabase: migration cho tài khoản, phòng, ván, nước đi, bạn bè, chat, biên lai | E0 | `Backend` | docs/03 | `T0-01` | Migration chạy được trên Supabase thử | 1 | 1 |
| `T0-05` | Cấu hình Supabase Auth: OTP 180s/60s, giới hạn tốc độ xác minh, SMTP mặc định | E0 | `Authentication` | docs/04 §3.1; BA 10.1 | `T0-01` | Cấu hình đã ghi lại (che bí mật) | 1 | 1 |
| `T0-06` | PoC OTP thật (GATE-OTP): thư thật, hạn mức, quét dọn, chặn đổi email | E0 | `Authentication`, `QA` | docs/05 §11 GATE-OTP | `T0-05` | Báo cáo số đo thật và kết luận đạt/không đạt | 1 | 2 |
| `T0-07` | PoC LiveKit Cloud (GATE-MEDIA): quyền theo người, thu hồi token, tab mới | E0 | `Communication`, `QA` | docs/05 §11 GATE-MEDIA; docs/04 §7 | `T0-01` | Báo cáo số đo thật và kết luận | 1 | 1 |
| `T0-08` | PoC máy cờ: đo thời gian, độ sâu, IPC (GATE-AI sơ bộ) | E0 | `AI`, `QA` | docs/05 §3; docs/02 §9 | `TC-03` | Số đo sơ bộ ba cấp | 1 | 4 |
| `T0-09` | PoC perft: bộ oracle độc lập kiểm bộ sinh nước đi (GATE-PERFT) | E0 | `Game Engine`, `QA` | docs/05 §11 GATE-PERFT | `TC-03` | Báo cáo so sánh perft | 1 | 4 |
| `T0-10` | Khung ứng dụng web: React, Vite, router, cấu hình, kết nối shared | E0 | `Frontend` | docs/04 §2 | `T0-01`, `T0-03` | Trang trắng chạy được, đã nối shared | 1 | 2 |
| `T0-11` | Khung máy chủ: NestJS, Socket.IO, xác thực kết nối, xử lý lệnh theo hợp đồng | E0 | `Backend` | docs/04 §2, §4 | `T0-01`, `T0-03`, `T0-05` | Máy chủ chạy, nhận kết nối có xác thực | 1 | 2 |
| `T0-12` | Chốt nơi chạy ứng dụng và dựng môi trường demo | E0 | `DevOps` | docs/04 §10 | `T0-02`, `T0-10`, `T0-11` | Web và máy chủ chạy trên môi trường demo | 2 | 3 |
| `TC-01` | Luật cờ: mô hình bàn cờ, toạ độ, quân, thế khởi đầu | EC | `Game Engine` | docs/02 §1–2; AGENTS §4.3 | `T0-01` | Mô hình thế cờ và hàm khởi tạo | 1 | 1 |
| `TC-02` | Luật cờ: sinh nước đi cho từng loại quân | EC | `Game Engine` | docs/02 §2 | `TC-01` | Bộ sinh nước đi thô cho bảy loại quân | 1 | 2 |
| `TC-03` | Luật cờ: nước hợp lệ, chiếu, chiếu hết, hết nước, tướng đối mặt | EC | `Game Engine` | docs/02 §3.1–3.2 | `TC-02` | Hàm kiểm hợp lệ và kết quả chiếu hết/hết nước | 1 | 3 |
| `TC-04` | Luật cờ: lặp thế, chiếu liên tục, 120 nửa nước không ăn | EC | `Game Engine` | docs/02 §3.4, §4–5 | `TC-03` | Phát hiện hoà/thua theo thứ tự ưu tiên | 1 | 4 |
| `TC-05` | Luật cờ: ký hiệu nước đi tiếng Việt | EC | `Game Engine` | docs/02 §7 | `TC-03` | Hàm sinh ký hiệu nước đi | 2 | 4 |
| `TC-06` | Bộ kiểm thử luật cờ: bộ thế, ca biên, perft ghép vào Vitest | EC | `Game Engine`, `QA` | docs/05 §3 | `TC-04`, `T0-09`, `TC-05`, `T0-02` | Bộ test luật chạy trong CI | 3 | 5 |
| `TC-07` | Bàn cờ SVG: vẽ lưới, quân chữ Hán, lật bàn cho phe Đen | EC | `Frontend` | US-BOARD-01 | `T0-10`, `TC-01`, `TH-01` | Bàn cờ hiển thị đúng hai phe | 1 | 4 |
| `TC-08` | Bàn cờ: click chọn quân và chấm gợi ý ô đi | EC | `Frontend` | US-BOARD-02 | `TC-07`, `TC-03` | Chọn quân và gợi ý theo luật | 2 | 5 |
| `TC-09` | Bàn cờ: kéo thả và trượt về chỗ cũ khi sai | EC | `Frontend` | US-BOARD-03 | `TC-08` | Kéo thả cho kết quả như click | 2 | 6 |
| `TC-10` | Bàn cờ: đánh dấu nước cuối, cảnh báo chiếu, âm thanh và nút tắt tiếng | EC | `Frontend` | US-BOARD-04, US-BOARD-05 | `TC-08` | Hiệu ứng thị giác và âm thanh | 2 | 6 |
| `TA-01` | Máy chủ: kiểm tra username (hợp lệ, chưa trùng) | EA | `Authentication` | US-AUTH-01 | `T0-11`, `T0-04` | Điểm kết nối kiểm username | 1 | 3 |
| `TA-02` | Máy chủ: đăng ký bước 2 gửi OTP, khoá theo email, gửi lại 60 giây | EA | `Authentication` | US-AUTH-02 | `T0-05`, `T0-11`, `T0-04` | Gửi OTP đúng luật | 1 | 3 |
| `TA-03` | Máy chủ: đăng ký bước 3 xác thực OTP, tạo hồ sơ, phục hồi completed_at/PENDING | EA | `Authentication` | US-AUTH-03; docs/07 §4.1 | `TA-01`, `TA-02` | Tạo tài khoản hoàn tất, phục hồi khi lỗi | 2 | 4 |
| `TA-04` | Máy chủ: tác vụ quét và phục hồi tài khoản đăng ký dở | EA | `Authentication` | docs/04 §3.1; docs/07 §4.1 | `TA-03` | Tác vụ chạy 5 phút, dọn đúng loại | 3 | 5 |
| `TA-05` | Máy chủ: đăng nhập username/mật khẩu, phiên 12 giờ/30 ngày, kiểm hạn/thu hồi | EA | `Authentication` | US-AUTH-04; docs/04 §3.2–3.3 | `T0-05`, `T0-11`, `T0-04`, `T0-15` | Đăng nhập và kiểm phiên | 1 | 4 |
| `TA-06` | Máy chủ: chặn người dùng chưa hoàn tất; chặn đổi email trực tiếp qua Auth | EA | `Authentication` | US-AUTH-03; docs/04 §3.1 | `TA-03`, `T0-06` | Người chưa hoàn tất không vào được ứng dụng | 2 | 5 |
| `TA-07` | Web: giao diện đăng ký ba bước theo hợp đồng | EA | `Frontend` | US-AUTH-01..03; DANH-MUC | `T0-10`, `T0-03`, `TH-01` | Ba bước đăng ký hiển thị đủ 5 trạng thái | 2 | 4 |
| `TA-08` | Web: đăng nhập, hồ sơ cơ bản, đăng xuất | EA | `Frontend` | US-AUTH-04..05 | `T0-10`, `T0-03`, `TA-11`, `TH-01` | Đăng nhập/hồ sơ/đăng xuất giao diện | 2 | 4 |
| `TA-09` | Tích hợp đăng ký, đăng nhập và chuyển hướng vào phòng (web ↔ máy chủ) | EA | `Frontend`, `Authentication` | US-AUTH-01..05 | `TA-03`, `TA-05`, `TA-07`, `TA-08`, `TA-06`, `TA-11` | Luồng đăng ký/đăng nhập chạy thật | 2 | 6 |
| `TB-01` | Máy chủ: máy trạng thái phòng, một vị trí chơi mỗi người | EB | `Room Management` | docs/04 §5; US-ROOM-01..02 | `T0-11`, `T0-04` | Trạng thái phòng và quy tắc vị trí | 1 | 3 |
| `TB-02` | Máy chủ: tạo phòng, mã 8 ký tự, link mời, mức giờ, riêng tư, người xem | EB | `Room Management` | US-ROOM-01, US-ROOM-04 | `TB-01`, `T0-13`, `T0-14`, `T0-15` | Lệnh tạo phòng | 2 | 4 |
| `TB-03` | Máy chủ: vào phòng bằng mã/link/Sảnh, xếp ghế hoặc người xem, sức chứa | EB | `Room Management` | US-ROOM-05 | `TB-02`, `T0-13`, `T0-15` | Lệnh vào phòng và xếp vai | 2 | 5 |
| `TB-04` | Máy chủ: ghế, Sẵn sàng, đếm 3 giây, bắt đầu ván | EB | `Room Management` | US-ROOM-02, US-ROOM-03 | `TB-03`, `TC-01` | Ván bắt đầu khi đủ hai người sẵn sàng | 2 | 6 |
| `TB-05` | Máy chủ: đổi chỗ ghế ↔ người xem, mời xuống ghế | EB | `Room Management` | US-ROOM-06 | `TB-04` | Đổi chỗ đúng luật | 3 | 7 |
| `TB-06` | Máy chủ: riêng tư LOCKED/CODE_ONLY/PUBLIC và danh sách phòng công khai | EB | `Room Management` | US-ROOM-07, US-ROOM-08 | `TB-03` | Quyền vào theo riêng tư; danh sách công khai | 3 | 6 |
| `TB-07` | Máy chủ: đuổi người xem, Host rời/chuyển quyền/đóng phòng, quay về phòng chờ | EB | `Room Management` | US-ROOM-09..11 | `TB-05`, `TB-06` | Các chuyển trạng thái phòng | 3 | 8 |
| `TB-08` | Web: Sảnh, hộp thoại tạo phòng, vào bằng mã | EB | `Frontend` | US-ROOM-01, US-ROOM-05, US-UI-02 | `T0-10`, `T0-03`, `TH-02`, `TH-01` | Sảnh và tạo/vào phòng (giao diện) | 2 | 5 |
| `TB-09` | Web: phòng chờ (ghế, Sẵn sàng, chia sẻ link/mã), màn từ chối truy cập | EB | `Frontend` | US-ROOM-02..04, US-ROOM-12 | `T0-10`, `T0-03`, `TH-01` | Phòng chờ và từ chối truy cập (giao diện) | 2 | 4 |
| `TB-10` | Tích hợp phòng cơ bản: tạo, vào, ghế, Sẵn sàng, bắt đầu ván (web ↔ máy chủ) | EB | `Frontend`, `Room Management` | US-ROOM-01..05 | `TB-04`, `TB-08`, `TB-09` | Hai người vào cùng phòng và bắt đầu ván (chạy thật) | 2 | 7 |
| `TB-11` | Tích hợp phòng nâng cao: đổi chỗ, riêng tư, danh sách công khai, đuổi, Host rời (web ↔ máy chủ) | EB | `Frontend`, `Room Management` | US-ROOM-06..12 | `TB-05`, `TB-06`, `TB-07`, `TB-10`, `TB-12` | Phòng nâng cao chạy thật | 3 | 9 |
| `TD-01` | Máy chủ: máy trạng thái ván, hàng đợi lệnh, commandId/matchVersion, biên lai | ED | `Realtime` | docs/04 §4.2, §5; docs/07 §3 | `TB-04`, `TC-04`, `T0-04`, `T0-13` | Khung xử lý lệnh ván tuần tự, chống trùng | 2 | 7 |
| `TD-02` | Máy chủ: xử lý nước đi, cập nhật thế cờ, phát trạng thái | ED | `Match`, `Realtime` | US-PLAY-01 | `TD-01` | Nước đi hợp lệ được áp dụng và phát | 2 | 8 |
| `TD-03` | Máy chủ: đồng hồ phía máy chủ và kết thúc TIMEOUT | ED | `Match` | US-PLAY-02; docs/04 §6 | `TD-02` | Đồng hồ chạy, hết giờ thì thua | 3 | 9 |
| `TD-04` | Máy chủ: kết thúc ván, đầu hàng, xin hoà, lặp thế/chiếu liên tục/không ăn | ED | `Match` | US-PLAY-03..05, US-PLAY-08 | `TD-02` | Mọi cách kết thúc ván đúng thứ tự ưu tiên | 3 | 9 |
| `TD-05` | Máy chủ: rời phòng giữa ván, mất kết nối, ân hạn 60 giây, kết nối lại, INTERRUPTED | ED | `Realtime` | US-PLAY-06..07; docs/07 §5 | `TD-03`, `TD-04` | Phục hồi và các kết quả do kết nối | 3 | 10 |
| `TD-06` | Máy chủ: người xem theo dõi trực tiếp, lọc dữ liệu theo vai trò | ED | `Realtime` | US-PLAY-09 | `TD-02`, `TB-03`, `TD-03` | Người xem nhận đúng dữ liệu | 3 | 10 |
| `TD-07` | Máy chủ và Web: bảng nước đi (ký hiệu tiếng Việt) | ED | `Frontend` | US-PLAY-10 | `TC-05`, `TD-02`, `T0-10` | Bảng nước đi theo ván | 3 | 9 |
| `TD-08` | Web: giao diện ván (bàn cờ nối mạng, đồng hồ, nút, hộp kết quả, khung đề nghị) | ED | `Frontend` | US-PLAY-01..05; DANH-MUC | `TC-10`, `T0-03`, `T0-10`, `TC-09` | Giao diện ván (đã nối hợp đồng) | 2 | 7 |
| `TD-09` | Tích hợp nước đi: đi nước, đồng bộ thế cờ hai trình duyệt (web ↔ máy chủ) | ED | `Frontend`, `Realtime` | US-PLAY-01 | `TD-02`, `TD-08`, `TB-10` | Hai trình duyệt đi nước và thấy thế cờ đồng bộ (chạy thật) | 2 | 9 |
| `TD-10` | Tích hợp đồng hồ, kết thúc ván, đầu hàng, xin hoà (web ↔ máy chủ) | ED | `Frontend`, `Realtime` | US-PLAY-02..05 | `TD-03`, `TD-04`, `TD-09` | Hai trình duyệt chơi hết một ván (chạy thật) | 3 | 10 |
| `TD-11` | Tích hợp ván nâng cao: mất kết nối, kết nối lại, người xem, bảng nước đi (web ↔ máy chủ) | ED | `Frontend`, `Realtime` | US-PLAY-06..10 | `TD-05`, `TD-06`, `TD-07`, `TD-10`, `TB-11` | Phục hồi, người xem, bảng nước đi chạy thật | 3 | 11 |
| `TA-10` | Đăng xuất chủ động giữa ván: xác nhận, đầu hàng, rời phòng rồi đăng xuất | EA | `Authentication` | US-AUTH-05; BA 1.8 | `TD-04`, `TA-08`, `TB-07`, `TG-02` | Đăng xuất giữa ván xử lý đúng | 3 | 10 |
| `TE-01` | Máy chủ: chat hai kênh, quyền đọc, giới hạn 5 tin/10 giây, bộ lọc từ cấm | EE | `Communication` | US-CHAT-01..02 | `TB-03`, `T0-04`, `TB-05`, `T0-14`, `T0-13` | Chat theo quyền, giới hạn và lọc | 3 | 8 |
| `TE-02` | Web: giao diện chat hai kênh, ẩn/hiện Kênh Chung | EE | `Frontend`, `Communication` | US-CHAT-01 | `T0-10`, `T0-03`, `TH-01`, `T0-14` | Khung chat (giao diện) | 3 | 4 |
| `TE-03` | Tích hợp chat (web ↔ máy chủ) | EE | `Frontend`, `Communication` | US-CHAT-01..02 | `TE-01`, `TE-02`, `TD-06`, `TB-11` | Chat chạy thật cho người chơi và người xem | 3 | 11 |
| `TE-04` | Máy chủ: cấp token LiveKit theo vai trò, thu hồi quyền khi đổi vai/đuổi/tiếp quản | EE | `Communication` | US-MEDIA-01..02; docs/04 §7 | `T0-07`, `TB-05`, `TB-07` | Token và thu hồi theo vai | 4 | 9 |
| `TE-05` | Web: giao diện camera/mic, bật/tắt độc lập, mức chia sẻ, trạng thái quyền và lỗi | EE | `Frontend`, `Communication` | US-MEDIA-01..02 | `T0-07`, `T0-10`, `TH-01` | Khung camera/mic (giao diện) | 4 | 4 |
| `TE-06` | Máy chủ: mở nhiều tab (tab mới tiếp quản, loại kết nối cũ) | EE | `Realtime` | US-MEDIA-03; US-AUTH-04 (AC-AUTH-04-05) | `TA-05`, `TE-04` | Một tab điều khiển tại một thời điểm | 4 | 10 |
| `TE-07` | Tích hợp media: camera/mic theo đối tượng nhận, đổi vai, đuổi, tab (web ↔ máy chủ ↔ LiveKit) | EE | `Frontend`, `Communication` | US-MEDIA-01..03 | `TE-04`, `TE-05`, `TE-06`, `TB-07`, `TE-03`, `TD-09` | Media chạy thật theo quyền | 4 | 12 |
| `TF-01` | Máy chủ: tìm người, gửi/nhận lời mời, giới hạn bạn bè | EF | `Social` | US-FRIEND-01..02, US-FRIEND-05 | `T0-11`, `T0-04`, `T0-13` | Lời mời và giới hạn theo luật | 3 | 4 |
| `TF-02` | Máy chủ: danh sách bạn và trạng thái online/đang đấu | EF | `Social` | US-FRIEND-03 | `TF-01`, `TB-01` | Danh sách và trạng thái | 3 | 5 |
| `TF-03` | Máy chủ: mời bạn online vào phòng | EF | `Social` | US-FRIEND-04 | `TF-02`, `TB-03`, `TB-06` | Lời mời vào phòng | 4 | 7 |
| `TF-04` | Web: giao diện bạn bè (tìm, lời mời, danh sách, mời vào phòng) | EF | `Frontend`, `Social` | US-FRIEND-01..05 | `T0-10`, `T0-03`, `TH-01`, `TH-02`, `TB-09` | Giao diện bạn bè | 3 | 5 |
| `TF-05` | Tích hợp bạn bè (web ↔ máy chủ) | EF | `Frontend`, `Social` | US-FRIEND-01..05 | `TF-01`, `TF-02`, `TF-03`, `TF-04`, `TB-10`, `TB-11`, `TG-02` | Bạn bè chạy thật | 4 | 10 |
| `TG-01` | Máy cờ: tiến trình riêng, IPC, negamax/alpha-beta ba cấp, tìm tĩnh, progress | EG | `AI` | docs/02 §9; docs/04 §8 | `TC-04`, `T0-08` | Tiến trình máy cờ trả nước đúng ngân sách | 3 | 5 |
| `TG-02` | Máy chủ: ván với máy (chọn cấp/phe, một vị trí chơi, vào lại 30 phút) | EG | `AI` | US-AI-01..03 | `TG-01`, `TD-02`, `TB-01` | Ván với máy chạy trên máy chủ | 3 | 9 |
| `TG-03` | Máy chủ: sự cố máy cờ (watchdog, hàng đợi, Bỏ dở, Thử lại) | EG | `AI` | US-AI-04; docs/02 §9.4 | `TG-01`, `TG-02` | Xử lý sự cố theo luật | 3 | 10 |
| `TG-04` | Web: chọn cấp độ/phe, ván với máy, thông báo sự cố | EG | `Frontend` | US-AI-01..04 | `T0-10`, `T0-03`, `TC-10`, `TH-01`, `TC-09`, `TH-02` | Giao diện ván với máy | 3 | 7 |
| `TG-05` | Tích hợp ván với máy (web ↔ máy chủ ↔ máy cờ) | EG | `Frontend`, `AI` | US-AI-01..04 | `TG-02`, `TG-03`, `TG-04` | Ván với máy chạy thật | 4 | 11 |
| `TG-06` | Đo máy cờ đầy đủ (GATE-AI): thời gian, độ sâu, sức mạnh, ổn định | EG | `AI`, `QA` | docs/05 §3, §11 | `TG-01`, `T0-09`, `TC-06`, `TG-03` | Báo cáo đo đầy đủ | 4 | 11 |
| `TH-01` | Giao diện: token Kỳ Đài Cổ Phong và thành phần nền (nút, hộp thoại, thông báo) | EH | `UI/UX` | DESIGN.md; US-UI-03 | `T0-10` | Bộ token và thành phần nền | 1 | 3 |
| `TH-02` | Giao diện: thanh điều hướng và khung Sảnh | EH | `Frontend`, `UI/UX` | US-UI-01..02 | `TH-01` | Điều hướng và khung Sảnh | 2 | 4 |
| `TH-03` | Giao diện: năm trạng thái cho mọi màn hình và khung dữ liệu | EH | `UI/UX` | US-UI-03; docs/08 §4 | `TH-02`, `TB-11`, `TD-11`, `TE-07`, `TF-05`, `TG-05`, `TA-09`, `TE-03` | Mọi màn hình đủ 5 trạng thái | 4 | 13 |
| `TH-04` | Giao diện: responsive từ 360 px, thao tác cảm ứng | EH | `UI/UX` | US-UI-04 | `TH-03` | Hiển thị đúng 360–1920 px | 4 | 14 |
| `TH-05` | Giao diện: trợ năng (WCAG 2.1 AA, bàn phím, nhãn, tương phản) | EH | `UI/UX` | US-UI-05 | `TH-03` | Đạt kiểm trợ năng | 4 | 14 |
| `TH-06` | Giao diện: tính năng P2 hiển thị DISABLED kèm tooltip | EH | `Frontend` | US-UI-06 | `TH-02`, `TA-07`, `TA-08`, `TF-04`, `TD-08`, `TG-04` | Lối vào P2 đúng quy tắc | 3 | 8 |
| `TQ-01` | Khung kiểm thử đầu-cuối Playwright nhiều trình duyệt | EQ | `QA` | docs/05 §6 | `T0-02`, `T0-10` | Bộ khung E2E chạy được | 1 | 3 |
| `TQ-02` | Bài tải 50 kết nối, 10 ván (và workload media) | EQ | `QA` | docs/05 §5; NFR-02 | `TD-11`, `TE-03`, `TE-07` | Báo cáo tải và độ trễ | 4 | 13 |
| `TQ-03` | Kiểm thử media theo quyền (thủ công và có công cụ) | EQ | `QA` | docs/05 GATE-MEDIA | `TE-07` | Bằng chứng media đúng quyền | 4 | 13 |
| `TQ-04` | Kiểm thử chấp nhận AC P1 và kịch bản demo D1–D10 | EQ | `QA` | docs/05 §2; docs/08 | `TD-11`, `TF-05`, `TG-05`, `TE-07`, `TA-09`, `TB-11`, `TA-10`, `TQ-01`, `TE-03`, `TH-03`, `TH-06`, `TA-04`, `TA-06`, `TA-12` | Kết quả PASS/FAIL cho mọi AC P1 | 4 | 14 |
| `TQ-05` | Nghiệm thu NFR đã duyệt (hiệu năng, trình duyệt, bảo mật) | EQ | `QA` | docs/05 §5; NFR-01..07 | `TQ-02`, `TH-04`, `TH-05`, `TG-06`, `TC-06`, `T0-06`, `TQ-03` | Báo cáo NFR | 4 | 15 |
| `TQ-06` | Chuẩn bị demo: tài khoản dựng sẵn, dữ liệu, kịch bản và kiểm tra hạn mức | EQ | `QA` | BA 10.1; docs/05 D1–D10 | `TQ-04`, `T0-05`, `T0-12`, `T0-06` | Gói demo sẵn sàng | 4 | 15 |
| `TQ-07` | Sửa lỗi cuối, hồi quy và bàn giao bằng chứng | EQ | `QA` | docs/05 §6 | `TQ-04`, `TQ-05`, `TQ-06`, `TQ-03` | Bằng chứng nghiệm thu P1 | 4 | 16 |
| `T0-13` | Máy chủ: cơ chế chống trùng lệnh dùng chung (biên lai theo danh tính + commandId) | E0 | `Realtime` | docs/04 §4.2; docs/07 §3; docs/03 (command_receipts) | `T0-11`, `T0-04` | Primitive chống trùng lệnh mà phòng, ván, chat dùng chung | 1 | 3 |
| `T0-14` | Bộ lọc từ cấm dùng chung cho máy chủ và web (tên phòng, Display Name, chat) | E0 | `Backend` | BA 5.3; US-CHAT-02; US-ROOM-01; US-AUTH-05 | `T0-03` | Hàm lọc dùng chung và danh sách từ do nhóm cung cấp | 1 | 2 |
| `TA-11` | Máy chủ: hồ sơ cơ bản (đọc hồ sơ chính chủ, Display Name có lọc từ, avatar mặc định) | EA | `Authentication` | US-AUTH-05 | `T0-11`, `T0-04`, `T0-14` | Điểm kết nối hồ sơ chính chủ | 2 | 3 |
| `TA-12` | Tích hợp chuyển hướng vào phòng sau đăng nhập (web ↔ máy chủ) | EA | `Frontend`, `Room Management` | US-AUTH-06 | `TA-09`, `TB-03`, `TB-09`, `TB-06`, `TB-07`, `TD-09` | Đăng nhập xong vào đúng phòng/link mời | 3 | 10 |
| `TB-12` | Web: cài đặt phòng, đổi chỗ ghế ↔ xem, danh sách người xem, xác nhận đuổi | EB | `Frontend` | US-ROOM-06..10; DANH-MUC | `TB-09`, `T0-03`, `TH-01` | Giao diện phòng nâng cao | 3 | 5 |
| `T0-15` | Máy chủ: giới hạn tốc độ dùng chung (đăng nhập sai, mã phòng sai, tạo phòng, kết nối mới) | E0 | `Realtime` | docs/04 §9 (giới hạn tốc độ); docs/05 §5 | `T0-11` | Cơ chế giới hạn theo ngưỡng baseline, dùng chung cho các handler | 1 | 3 |

## 7. Bước tiếp theo

1. Viết **Description đầy đủ** cho từng task (mục tiêu, nguồn, kết quả, phạm vi, bắt đầu khi, cách làm, kiểm thử, điều kiện PASS, bằng chứng, rủi ro) theo mẫu mục 12 của tài liệu 08.
2. Viết Epic và Story (53 Story) từ `docs/01`.
3. Nhóm ước lượng giờ từng task và kiểm khả năng chứa của từng Sprint; PO duyệt trước khi tạo Jira.
