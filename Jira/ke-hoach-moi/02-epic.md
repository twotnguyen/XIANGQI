# Kế hoạch mới (bản nháp) — 02: Description của 10 Epic

**Ngày:** 2026-10-04 · **Trạng thái:** ĐỀ XUẤT, chờ PO và nhóm duyệt · Chưa tạo gì trên Jira. Khung và phụ thuộc ở `01-components-epic-khung-task.md`.

Mỗi Epic theo mẫu Description đủ chi tiết (mục 12.1 của tài liệu 08): mục tiêu, nguồn, kết quả, phạm vi, bắt đầu khi, Story, Task, kiểm thử Epic, điều kiện PASS, bằng chứng, rủi ro.

## E0 — Nền tảng và PoC rủi ro

**Mục tiêu:** Dựng nền chạy được (kho, CI, hợp đồng chung, schema, khung web và máy chủ, môi trường demo) và có **bằng chứng sớm bằng số đo thật** cho bốn rủi ro lớn: OTP thật, media LiveKit Cloud, luật cờ (perft) và máy cờ. Mọi Epic sau dựa vào kết quả của Epic này.

**Thành phần Epic (Jira, 0–1):** để trống (nền kỹ thuật trải rộng)

**Yêu cầu / nguồn:** AGENTS §4.4; `docs/04` §2, §11; `docs/05` §11 (GATE-OTP, GATE-MEDIA, GATE-AI, GATE-PERFT); BA 10.1 (SMTP mặc định, LiveKit Cloud).

**Kết quả (đầu ra):**
- Kho `pnpm` chạy `build`, `lint`, `test` và CI xanh.
- Gói hợp đồng chung dùng được cho web, máy chủ, máy cờ.
- Schema Supabase chạy bằng migration.
- Khung web và khung máy chủ chạy trên môi trường demo.
- Bốn báo cáo PoC (OTP, media, perft, máy cờ) có số đo thật, ghi rõ đạt/không đạt/chưa kết luận.

**Phạm vi / ngoài phạm vi:** **Làm:** nền kỹ thuật và PoC. **Không làm:** tính năng sản phẩm, mọi thứ P2, tối ưu sớm.

**Bắt đầu khi:** Không cần Epic nào trước. Cần **quyết định của PO về nơi chạy ứng dụng và chi phí** trước `T0-12`.

**Task của Epic:** `T0-01`, `T0-02`, `T0-03`, `T0-04`, `T0-05`, `T0-06`, `T0-07`, `T0-08`, `T0-09`, `T0-10`, `T0-11`, `T0-12`, `T0-13`, `T0-14`, `T0-15` (15 task; chi tiết ở các tệp Description task).

**Kiểm thử Epic:** - CI xanh trên nhánh mẫu.
- Mở web và máy chủ trên môi trường demo; máy chủ nhận kết nối có xác thực.
- Mỗi PoC có báo cáo kèm cấu hình đã che bí mật và số đo.

**PASS khi:**
- Mọi task của Epic đạt điều kiện PASS riêng.
- Bốn báo cáo PoC có số đo thật. **Không hạ ngưỡng để báo đạt**; không đạt thì ghi số thật, đánh dấu `BLOCKED` và báo PO (AGENTS §4.4).

**Bằng chứng nộp:** Báo cáo PoC, kết quả CI, địa chỉ môi trường demo (không chứa bí mật).

**Rủi ro / chưa rõ:** SMTP mặc định chỉ khoảng 2 thư/giờ và chỉ gửi tới email thuộc nhóm dự án; gói miễn phí LiveKit Cloud 5.000 phút/tháng; nơi chạy ứng dụng chưa chốt; đổi email trực tiếp qua Auth cần PoC.

## EA — Tài khoản và phiên

**Mục tiêu:** Người dùng đăng ký ba bước bằng OTP email, đăng nhập bằng username và mật khẩu, có hồ sơ cơ bản, đăng xuất, và được đưa vào đúng phòng sau khi đăng nhập. Tài khoản chưa hoàn tất không được dùng ứng dụng.

**Thành phần Epic (Jira, 0–1):** `Authentication`

**Yêu cầu / nguồn:** `docs/01` nhóm A; BA 1.1, 1.4, 1.5, 1.8; `docs/04` §3; `docs/07` §4.1.

**Kết quả (đầu ra):**
- Đăng ký ba bước chạy thật với OTP.
- Phục hồi/quét dọn tài khoản đăng ký dở.
- Đăng nhập, phiên 12 giờ/30 ngày, kiểm hạn và thu hồi phía máy chủ.
- Hồ sơ cơ bản, đăng xuất (kể cả giữa ván), chuyển hướng vào phòng sau đăng nhập.

**Phạm vi / ngoài phạm vi:** **Làm:** đăng ký/đăng nhập tài khoản email, phiên, phục hồi. **Không làm (P2):** Khách, Google, quên mật khẩu, đổi username.

**Bắt đầu khi:** `E0`: hợp đồng chung, schema, cấu hình Auth, khung web/máy chủ. Đăng xuất giữa ván cần `TD-04` (đầu hàng) của Epic ED.

**Story của Epic (6 Story P1 từ `docs/01`):**
- `US-AUTH-01` — Đăng ký bước 1: username và mật khẩu
- `US-AUTH-02` — Đăng ký bước 2: email và gửi OTP
- `US-AUTH-03` — Đăng ký bước 3: xác thực OTP, tạo tài khoản
- `US-AUTH-04` — Đăng nhập bằng username và mật khẩu
- `US-AUTH-05` — Hồ sơ cơ bản và đăng xuất
- `US-AUTH-06` — Chuyển hướng vào phòng sau đăng nhập

**Task của Epic:** `TA-01`, `TA-02`, `TA-03`, `TA-04`, `TA-05`, `TA-06`, `TA-07`, `TA-08`, `TA-09`, `TA-10`, `TA-11`, `TA-12` (12 task; chi tiết ở các tệp Description task).

**Kiểm thử Epic:** Demo D1: A đăng ký ba bước bằng OTP thật; B, C, D (tạo sẵn) đăng nhập; vào được `/lobby`. Ca phục hồi: giết tiến trình ở các điểm d1/d2 của bước 3 (docs/07 §4.1).

**PASS khi:**
- Mọi AC `AC-AUTH-01-…` đến `AC-AUTH-06-…` đạt.
- D1 đạt; người chưa hoàn tất bị chặn; lỗi giữa chừng không làm kẹt hay xoá nhầm tài khoản đã ghi `completed_at`.

**Bằng chứng nộp:** Kết quả test, bản ghi D1, log phục hồi (không chứa OTP/mật khẩu).

**Rủi ro / chưa rõ:** Hạn mức thư; chặn đổi email trực tiếp qua Auth chưa chứng minh; nhánh chờ PO không đưa vào bắt buộc.

## EB — Phòng, mời, ghế, người xem

**Mục tiêu:** Người dùng tạo phòng, mời bằng link/mã, vào phòng và được xếp ghế hoặc làm người xem; Sẵn sàng rồi bắt đầu ván; quản lý riêng tư/khoá, người xem, Host và danh sách phòng công khai.

**Thành phần Epic (Jira, 0–1):** `Room Management`

**Yêu cầu / nguồn:** `docs/01` nhóm B; BA 2.x, 4.x; `docs/04` §5; `docs/07` §2, §5; `DANH-MUC` (phòng, Sảnh).

**Kết quả (đầu ra):**
- Tạo phòng với mã 8 ký tự và link mời.
- Vào phòng bằng mã/link/Sảnh, xếp vai theo sức chứa.
- Ghế, Sẵn sàng, đếm 3 giây, bắt đầu ván.
- Đổi chỗ ghế ↔ người xem, riêng tư PUBLIC/CODE_ONLY/LOCKED, đuổi người xem, Host rời/chuyển quyền, quay về phòng chờ.

**Phạm vi / ngoài phạm vi:** **Làm:** phòng CASUAL. **Không làm:** Đánh Hạng, ghép trận ngẫu nhiên, QR, đổi bên, Tái đấu (P2).

**Bắt đầu khi:** `E0` (khung, hợp đồng); danh tính lấy từ xác thực kết nối của `T0-11` (không cần đợi đăng nhập hoàn chỉnh `TA-05`); `TB-04` chỉ **khởi tạo ván** (Match ID, thế đầu, bên đi trước, mốc giờ bắt đầu); xử lý lệnh, đồng hồ chạy thật và kết thúc ván thuộc Epic ED (`TD-01`, `TD-03`); luật cờ cần `TC-01` (`TB-04`) và `TC-04` (`TD-01`).

**Story của Epic (12 Story P1 từ `docs/01`):**
- `US-ROOM-01` — Tạo phòng
- `US-ROOM-02` — Phòng chờ và ghế ngồi
- `US-ROOM-03` — Sẵn sàng và bắt đầu ván
- `US-ROOM-04` — Chia sẻ phòng bằng link và mã
- `US-ROOM-05` — Vào phòng bằng mã, link hoặc Sảnh
- `US-ROOM-06` — Đổi chỗ giữa ghế và người xem
- `US-ROOM-07` — Chế độ riêng tư và khoá phòng
- `US-ROOM-08` — Danh sách phòng công khai ở Sảnh
- `US-ROOM-09` — Đuổi người xem
- `US-ROOM-10` — Host rời, chuyển quyền, đóng phòng
- `US-ROOM-11` — Sau ván CASUAL: quay về phòng chờ
- `US-ROOM-12` — Màn hình từ chối truy cập

**Task của Epic:** `TB-01`, `TB-02`, `TB-03`, `TB-04`, `TB-05`, `TB-06`, `TB-07`, `TB-08`, `TB-09`, `TB-10`, `TB-11`, `TB-12` (12 task; chi tiết ở các tệp Description task).

**Kiểm thử Epic:** Demo D2–D5: A tạo phòng; B vào bằng link/mã; C, D vào sau khi ghế kín thành người xem, người xem vượt sức chứa bị từ chối (demo chọn tối đa 2 người xem); A khoá phòng, E không vào được.

**PASS khi:**
- Mọi AC `AC-ROOM-…` đạt, gồm nhánh phòng đầy, bị chặn, `LOCKED`, một vị trí chơi mỗi người.
- D2–D5 đạt.

**Bằng chứng nộp:** Kết quả test, bản ghi D2–D5, ca đua (hai người vào cùng một ghế).

**Rủi ro / chưa rõ:** Đua ghế/vào đồng thời; quyền dữ liệu theo vai (người xem không nhận dữ liệu của người chơi).

## EC — Bàn cờ và luật cờ

**Mục tiêu:** Có gói luật cờ chính xác dùng chung cho máy chủ, máy cờ và client; bàn cờ SVG hiển thị đúng, chọn quân/gợi ý/kéo thả/đánh dấu/âm thanh.

**Thành phần Epic (Jira, 0–1):** để trống (trải rộng `Game Engine` và `Frontend`)

**Yêu cầu / nguồn:** `docs/01` nhóm C; `docs/02` mục 1–8; `docs/05` mục 3 (kiểm thử luật), GATE-PERFT; `AGENTS` §4.3 (toạ độ); `DESIGN` (bàn cờ).

**Kết quả (đầu ra):**
- `packages/rules`: sinh nước đi, hợp lệ, chiếu/chiếu hết/hết nước, lặp thế, chiếu liên tục, 120 nửa nước không ăn, ký hiệu tiếng Việt.
- Bộ kiểm thử luật (bộ thế, ca biên, perft oracle độc lập).
- Bàn cờ SVG và tương tác.

**Phạm vi / ngoài phạm vi:** **Làm:** luật rút gọn đã công bố, bàn cờ. **Không làm:** luật đuổi quân riêng, đồng hồ (Epic ED).

**Bắt đầu khi:** `E0` (kho, khung web, hợp đồng). Luật là nền cho Epic ED và EG.

**Story của Epic (5 Story P1 từ `docs/01`):**
- `US-BOARD-01` — Hiển thị bàn cờ
- `US-BOARD-02` — Chọn quân và gợi ý ô đi bằng click
- `US-BOARD-03` — Kéo thả
- `US-BOARD-04` — Đánh dấu nước cuối và chiếu
- `US-BOARD-05` — Âm thanh

**Task của Epic:** `TC-01`, `TC-02`, `TC-03`, `TC-04`, `TC-05`, `TC-06`, `TC-07`, `TC-08`, `TC-09`, `TC-10` (10 task; chi tiết ở các tệp Description task).

**Kiểm thử Epic:** Bộ test luật chạy trong CI; mở bàn cờ trên hai trình duyệt và thao tác click/kéo thả hợp lệ/không hợp lệ.

**PASS khi:**
- Mọi AC `AC-BOARD-…` đạt.
- Bộ test luật xanh, perft khớp oracle độc lập (không tự sửa kỳ vọng theo mã).

**Bằng chứng nộp:** Kết quả test luật, báo cáo perft (nguồn, phiên bản oracle), ảnh bàn cờ.

**Rủi ro / chưa rõ:** Giá trị perft tham chiếu chưa kiểm; sai luật ở gói chung lan ra mọi nơi.

## ED — Ván đấu online

**Mục tiêu:** Hai người chơi đánh hết một ván qua mạng: đi nước, đồng hồ, kết thúc, đầu hàng, xin hoà, rời/mất kết nối và kết nối lại; người xem theo dõi trực tiếp; có bảng nước đi. Máy chủ là nguồn sự thật.

**Thành phần Epic (Jira, 0–1):** để trống (trải rộng `Match`, `Realtime`, `Frontend`)

**Yêu cầu / nguồn:** `docs/01` nhóm D; BA 3.x, 8.3; `docs/04` §4–6; `docs/07` §3, §5.

**Kết quả (đầu ra):**
- Máy chủ xử lý lệnh tuần tự, chống trùng lệnh, kiểm `matchVersion`.
- Đồng hồ phía máy chủ, mọi cách kết thúc ván đúng thứ tự ưu tiên.
- Mất kết nối: ân hạn 60 giây, kết nối lại, `INTERRUPTED` khi khởi động lại (nhánh trung tính chờ PO).
- Giao diện ván và tích hợp hai trình duyệt.

**Phạm vi / ngoài phạm vi:** **Làm:** ván CASUAL online. **Không làm:** Xin đi lại, Tái đấu, Đánh Hạng (P2).

**Bắt đầu khi:** `EB` (`TB-04` bắt đầu ván), `EC` (`TC-04` luật), `E0`.

**Story của Epic (10 Story P1 từ `docs/01`):**
- `US-PLAY-01` — Đi nước qua mạng
- `US-PLAY-02` — Đồng hồ
- `US-PLAY-03` — Kết thúc ván và kết quả
- `US-PLAY-04` — Đầu hàng
- `US-PLAY-05` — Xin hoà
- `US-PLAY-06` — Rời phòng giữa ván
- `US-PLAY-07` — Mất kết nối và kết nối lại
- `US-PLAY-08` — Lặp thế, chiếu liên tục, không ăn quân
- `US-PLAY-09` — Người xem theo dõi trực tiếp
- `US-PLAY-10` — Bảng nước đi

**Task của Epic:** `TD-01`, `TD-02`, `TD-03`, `TD-04`, `TD-05`, `TD-06`, `TD-07`, `TD-08`, `TD-09`, `TD-10`, `TD-11` (11 task; chi tiết ở các tệp Description task).

**Kiểm thử Epic:** Demo D6 (Sẵn sàng → đếm 3 giây → đi cờ đến chiếu hết, người xem thấy trực tiếp) và D9 (ngắt mạng một bên: nối lại trong 60 giây thì tiếp tục, quá 60 giây thì thua `DISCONNECT`).

**PASS khi:**
- Mọi AC `AC-PLAY-…` đạt.
- D6 và D9 đạt; hai lệnh đồng thời cho kết quả đúng thứ tự; không áp dụng nước đi hai lần khi gửi lại.

**Bằng chứng nộp:** Kết quả test, bản ghi D6/D9, ca đua (nước đi và đầu hàng cùng lúc).

**Rủi ro / chưa rõ:** Hết giờ và hết ân hạn cùng lúc (ưu tiên `TIMEOUT`); nhánh `INTERRUPTED` chờ PO.

## EE — Chat và camera/mic

**Mục tiêu:** Người chơi và người xem chat hai kênh theo quyền; người chơi bật camera/mic độc lập và chọn mức chia sẻ; người xem chỉ xem/nghe; nhiều tab chỉ một nơi điều khiển.

**Thành phần Epic (Jira, 0–1):** `Communication`

**Yêu cầu / nguồn:** `docs/01` nhóm E; BA 4.1, 5.3, 5.4; `docs/04` §7; GATE-MEDIA.

**Kết quả (đầu ra):**
- Chat Kênh Riêng/Kênh Chung, giới hạn 5 tin/10 giây, bộ lọc từ cấm.
- Token LiveKit theo vai, thu hồi khi đổi vai/đuổi/tiếp quản.
- Giao diện camera/mic: bật/tắt độc lập, một mức chia sẻ chung.
- Mở nhiều tab: tab mới tiếp quản.

**Phạm vi / ngoài phạm vi:** **Làm:** chat phòng, media CASUAL. **Không làm:** chat 1-1, sticker, Kênh Chung ở Đánh Hạng (P2).

**Bắt đầu khi:** `EB` (vai/ghế), `E0` (`T0-07` PoC LiveKit), `TA-05` (phiên) cho nhiều tab.

**Story của Epic (5 Story P1 từ `docs/01`):**
- `US-CHAT-01` — Hai kênh chat
- `US-CHAT-02` — Giới hạn và bộ lọc từ cấm
- `US-MEDIA-01` — Camera và micro cho hai người chơi
- `US-MEDIA-02` — Người xem chỉ xem/nghe
- `US-MEDIA-03` — Mở nhiều tab

**Task của Epic:** `TE-01`, `TE-02`, `TE-03`, `TE-04`, `TE-05`, `TE-06`, `TE-07` (7 task; chi tiết ở các tệp Description task).

**Kiểm thử Epic:** Demo D7: A và B bật camera/mic, chat Kênh Riêng; người xem chat Kênh Chung, không đọc được Kênh Riêng.

**PASS khi:**
- Mọi AC `AC-CHAT-…` và `AC-MEDIA-…` đạt; GATE-MEDIA có bằng chứng (không nhận track trái quyền, token quyền cũ không lấy lại quyền đã mất).
- D7 đạt.

**Bằng chứng nộp:** Kết quả test, log quyền, ghi chú thử bằng client không được phép, mức dùng hạn mức gói LiveKit.

**Rủi ro / chưa rõ:** Hạn mức gói miễn phí LiveKit; cửa sổ hiệu lực thu hồi token; cấu hình đo media chưa đủ.

## EF — Bạn bè (tối thiểu P1)

**Mục tiêu:** Người dùng tìm người, gửi/nhận/trả lời lời mời kết bạn, xem danh sách bạn kèm trạng thái, và mời bạn online vào phòng.

**Thành phần Epic (Jira, 0–1):** `Social`

**Yêu cầu / nguồn:** `docs/01` nhóm F; BA 5.5; `docs/03` (bạn bè).

**Kết quả (đầu ra):**
- Tìm người, lời mời, giới hạn 200 bạn và 50 lời mời đang chờ.
- Danh sách bạn và trạng thái online/đang đấu.
- Mời bạn online vào phòng (pop-up 30 giây).

**Phạm vi / ngoài phạm vi:** **Làm:** hệ thống bạn bè tối thiểu. **Không làm:** chat 1-1, thách đấu, badge chưa đọc (P2).

**Bắt đầu khi:** `E0`, `EB` (`TB-03` vào phòng).

**Story của Epic (5 Story P1 từ `docs/01`):**
- `US-FRIEND-01` — Tìm người và gửi lời mời
- `US-FRIEND-02` — Nhận và trả lời lời mời
- `US-FRIEND-03` — Danh sách bạn và trạng thái
- `US-FRIEND-04` — Mời bạn bè online vào phòng
- `US-FRIEND-05` — Giới hạn

**Task của Epic:** `TF-01`, `TF-02`, `TF-03`, `TF-04`, `TF-05` (5 task; chi tiết ở các tệp Description task).

**Kiểm thử Epic:** Demo D3 (phần mời bạn): A và C là bạn; A mời C đang online; C nhận pop-up 30 giây và vào phòng.

**PASS khi:**
- Mọi AC `AC-FRIEND-…` đạt; D3 phần mời bạn đạt.

**Bằng chứng nộp:** Kết quả test, bản ghi D3.

**Rủi ro / chưa rõ:** Đua hai lời mời ngược chiều; từ chối hai lần thì chặn gửi lại.

## EG — Đánh với máy

**Mục tiêu:** Người chơi chọn cấp độ (Dễ/Trung bình/Khó) và phe rồi đánh với máy; máy trả nước đúng ngân sách thời gian; có bỏ dở, vào lại trong 30 phút và xử lý sự cố máy cờ.

**Thành phần Epic (Jira, 0–1):** `AI`

**Yêu cầu / nguồn:** `docs/01` nhóm G; BA 6.x; `docs/02` mục 9; `docs/04` §8; `docs/05` mục 3, GATE-AI.

**Kết quả (đầu ra):**
- Tiến trình máy cờ riêng, ba cấp, tìm sâu dần, báo `progress`.
- Ván với máy trên máy chủ: một vị trí chơi, vào lại 30 phút.
- Watchdog, hàng đợi, Bỏ dở, Thử lại.
- Báo cáo đo đầy đủ.

**Phạm vi / ngoài phạm vi:** **Làm:** ván với máy P1. **Không làm:** Xin hoà với máy, đi lại với máy (P2).

**Bắt đầu khi:** `EC` (luật, perft), `E0` (`T0-08` PoC máy cờ), `ED` (`TD-02` xử lý nước đi).

**Story của Epic (4 Story P1 từ `docs/01`):**
- `US-AI-01` — Chọn cấp độ và phe
- `US-AI-02` — Chơi với máy
- `US-AI-03` — Kết thúc, bỏ dở và vào lại
- `US-AI-04` — Sự cố máy cờ

**Task của Epic:** `TG-01`, `TG-02`, `TG-03`, `TG-04`, `TG-05`, `TG-06` (6 task; chi tiết ở các tệp Description task).

**Kiểm thử Epic:** Demo D8 (đánh ba cấp, không vào ván máy khi còn ngồi ghế phòng khác) và D10 (đóng tab, vào lại trong 30 phút / sau 30 phút là Bỏ dở).

**PASS khi:**
- Mọi AC `AC-AI-…` đạt; D8 và D10 đạt.
- GATE-AI: số đo thật theo `docs/05` mục 3; không hạ ngưỡng, không đạt thì ghi `BLOCKED` và báo PO.

**Bằng chứng nộp:** Báo cáo đo máy cờ (cấu hình máy đo, số đo), bản ghi D8/D10.

**Rủi ro / chưa rõ:** Cấp Khó có đạt độ sâu 6 trong 3 giây hay không; lỗi/treo tiến trình.

## EH — Giao diện chung

**Mục tiêu:** Toàn bộ ứng dụng có giao diện thống nhất Kỳ Đài Cổ Phong, thanh điều hướng, Sảnh; mọi màn hình đủ năm trạng thái, responsive từ 360 px và đạt trợ năng WCAG 2.1 AA.

**Thành phần Epic (Jira, 0–1):** `UI/UX`

**Yêu cầu / nguồn:** `docs/01` nhóm H; `DESIGN.md`; `DANH-MUC` (SCR-RULE-01, 37 thành phần); `docs/08` mục 4 (năm trạng thái); NFR-03, NFR-A11Y.

**Kết quả (đầu ra):**
- Token và thành phần nền.
- Thanh điều hướng, khung Sảnh.
- Năm trạng thái (SUCCESS, LOADING, EMPTY, ERROR, DISABLED, tooltip lý do) cho mọi màn hình/khung dữ liệu.
- Responsive và trợ năng.
- Lối vào P2 hiển thị DISABLED kèm "Sắp ra mắt".

**Phạm vi / ngoài phạm vi:** **Làm:** giao diện P1. **Không làm:** Giấy Sáng và Theo hệ thống (P2).

**Bắt đầu khi:** `E0` (khung web); các task kiểm toàn bộ (`TH-03`…) cần màn hình của EA, EB, ED, EE, EF, EG.

**Story của Epic (6 Story P1 từ `docs/01`):**
- `US-UI-01` — Thanh điều hướng
- `US-UI-02` — Sảnh
- `US-UI-03` — Năm trạng thái cho mọi màn hình
- `US-UI-04` — Responsive
- `US-UI-05` — Trợ năng
- `US-UI-06` — Tính năng P2 hiển thị đúng quy tắc

**Task của Epic:** `TH-01`, `TH-02`, `TH-03`, `TH-04`, `TH-05`, `TH-06` (6 task; chi tiết ở các tệp Description task).

**Kiểm thử Epic:** Duyệt từng màn hình ở bốn kích thước (360/390/1366/1920 px) và kiểm bàn phím, nhãn, tương phản.

**PASS khi:**
- Mọi AC `AC-UI-…` đạt; không lỗi chức năng và không cuộn ngang ở 360–1920 px; tương phản đạt WCAG 2.1 AA.

**Bằng chứng nộp:** Ảnh chụp từng trạng thái, báo cáo trợ năng, kết quả trình duyệt.

**Rủi ro / chưa rõ:** Làm giao diện một lần ở cuối dễ bị dồn; nên làm cùng từng màn hình.

## EQ — Kiểm thử chấp nhận và Demo

**Mục tiêu:** Chứng minh toàn bộ P1 đạt: kịch bản D1–D10, mọi AC P1, ca biên, trạng thái giao diện và các NFR đã duyệt; chuẩn bị gói demo đúng hạn mức dịch vụ.

**Thành phần Epic (Jira, 0–1):** `QA`

**Yêu cầu / nguồn:** `docs/05` mục 2, 5, 6; `docs/08`; BA 10.1, 11.

**Kết quả (đầu ra):**
- Khung E2E nhiều trình duyệt.
- Kết quả PASS/FAIL cho mọi AC P1 và D1–D10.
- Báo cáo tải và NFR (NFR-01..07, NFR-A11Y).
- Gói demo: tài khoản dựng sẵn, dữ liệu, kịch bản, kiểm tra hạn mức.
- Bằng chứng nghiệm thu.

**Phạm vi / ngoài phạm vi:** **Làm:** kiểm chứng P1. **Không làm:** nghiệm thu P2; NFR-08..10 chỉ khi PO duyệt.

**Bắt đầu khi:** Gần như mọi Epic khác (đây là Epic hội tụ).

**Task của Epic:** `TQ-01`, `TQ-02`, `TQ-03`, `TQ-04`, `TQ-05`, `TQ-06`, `TQ-07` (7 task; chi tiết ở các tệp Description task).

**Kiểm thử Epic:** Chạy D1–D10 trên môi trường demo bằng Playwright cộng thao tác tay cho camera/mic.

**PASS khi:**
- D1–D10 đạt; mọi AC P1 và nhánh đã duyệt đạt; NFR đã duyệt đạt; không còn lỗi Cao/Nghiêm trọng (docs/05 mục 6).

**Bằng chứng nộp:** Báo cáo tổng hợp, kết quả CI/E2E, số đo tải, ảnh/video demo.

**Rủi ro / chưa rõ:** Dồn kiểm thử vào cuối; hạn mức SMTP/LiveKit trong lúc demo.
