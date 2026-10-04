# Description của 8 Epic

**Ngày:** 2026-10-04 · **Trạng thái:** đề xuất, chờ PO duyệt · Chưa tạo gì trên Jira · Viết theo `00-chuan-description.md` và mẫu `00b`.

**8 Epic ứng với 8 yêu cầu được giao.** Mỗi Epic có: mục tiêu và giá trị; yêu cầu được giao; ai dùng; các Story; phạm vi (có/không); quy tắc quan trọng; nguồn (đặc tả); kết quả khi xong; bắt đầu khi (phụ thuộc); kiểm thử Epic; điều kiện hoàn thành (PASS); bằng chứng nộp; rủi ro; Task. Story ở `12` và `13`; Task ở `03` đến `11`; bảng đối chiếu từng tiêu chí ở `14`. Có thêm **5 task chung** (khung kiểm thử nhiều trình duyệt, môi trường demo, nghiệm thu phi chức năng, nghiệm thu tiêu chí và demo, chuẩn bị demo và bàn giao) không thuộc Epic nào, gắn nhãn `chung`.

**Mọi Epic:** Nhãn `P1`; trạng thái ban đầu To Do; người nhận để trống; Sprint không gán cho Epic (chỉ gán cho Task).

---

# EPIC 1 — Đăng ký và đăng nhập (kèm nền tảng dự án)

**Nhãn:** `P1` · **Thành phần:** để trống (Epic trải rộng nhiều khu vực) · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống

## Mục tiêu và giá trị (Epic này làm gì)

Cho người dùng **đăng ký tài khoản qua ba bước** (tên đăng nhập và mật khẩu, email, mã OTP 6 số gửi qua email), **đăng nhập**, có **hồ sơ cơ bản**, **đăng xuất**, và dùng một **giao diện thống nhất** (đủ 5 trạng thái, dùng được trên điện thoại, đạt chuẩn trợ năng). Epic này cũng gồm **nền tảng của cả dự án** (kho mã, kiểm tra tự động, hợp đồng giữa trình duyệt và máy chủ, cơ sở dữ liệu, khung web, khung máy chủ, ba cơ chế dùng chung) vì đăng ký và đăng nhập là chức năng đầu tiên cần đến chúng.

## Yêu cầu được giao

Giao diện đăng ký / đăng nhập

## Ai dùng

Người mới (đăng ký), người đã có tài khoản (đăng nhập); nhóm làm dự án (phần nền tảng).

## Gồm những việc lớn nào (mỗi việc là một Story)

- Story 1 — Đăng ký tài khoản qua ba bước hoặc bằng Google
- Story 2 — Đăng nhập bằng tên đăng nhập và mật khẩu hoặc bằng Google
- Story 3 — Hồ sơ cơ bản và đăng xuất
- Story 4 — Giao diện nhất quán: đủ 5 trạng thái, dùng được trên điện thoại, trợ năng, tính năng chưa làm

## Phạm vi

- **Có:** các Story ở trên.
- **Không:** Đăng nhập khách, quên mật khẩu, đổi tên đăng nhập hoặc email, ảnh đại diện tuỳ chọn, giao diện sáng (giai đoạn sau).
- **Giai đoạn sau (có trong đặc tả nhưng không làm ở giai đoạn này):** Đăng nhập khách (BA 1.3), quên và đặt lại mật khẩu (BA 1.7), đổi tên đăng nhập (BA 1.6) là giai đoạn sau; chỉ hiện nút/liên kết mờ. **Đăng ký và đăng nhập bằng Google (BA 1.2) chạy thật ở giai đoạn 1 (PO quyết định 04/10/2026).**

## Các quy tắc quan trọng

- Tên đăng nhập 3–20 ký tự (chữ, số, gạch dưới), không phân biệt hoa thường khi kiểm trùng; mật khẩu từ 8 ký tự; tên hiển thị 2–30 ký tự.
- Mã OTP có hiệu lực **180 giây**; gửi lại cách nhau tối thiểu **60 giây**; mặc định chỉ khoảng **2 thư mỗi giờ**.
- Phiên đăng nhập: ghi nhớ thì **30 ngày**, không thì **12 giờ** hoặc đến khi đóng trình duyệt.
- Đăng nhập sai chỉ báo **một lỗi chung**, không lộ email. Email và tên đăng nhập **không đổi được**.
- Tài khoản chưa đăng ký xong thì **không được dùng**; tài khoản đã hoàn tất **không bao giờ** bị xoá nhầm.
- Giao diện luôn tối "Kỳ Đài Cổ Phong"; **5 trạng thái** (thành công, đang tải, trống, lỗi, bị khoá có chú thích); dùng được từ **360 px**; chuẩn **WCAG 2.1 AA**; thông tin bí mật không nằm trong mã.

## Nguồn (đặc tả)

BA mục 1.1, 1.4, 1.5, 1.8, 10.1, 10.3, 10.4; `docs/01` nhóm A (US-AUTH-01 đến 05) và nhóm H (US-UI-03 đến 06); `DANH-MUC` các màn hình đăng nhập, đăng ký, cài đặt hồ sơ, thanh điều hướng; `docs/04` mục 2 và 3; `docs/05` cổng GATE-OTP, kịch bản D1, yêu cầu NFR-03, 04, 06.

## Kết quả khi Epic xong

Chạy trên hai trình duyệt: (1) An đăng ký đủ ba bước bằng mã OTP thật tới email thật, vào được Sảnh; (2) An đăng xuất rồi đăng nhập lại (có và không "Ghi nhớ"); (3) An sửa tên hiển thị, tên có từ cấm bị từ chối; (4) người đăng ký dở không dùng được ứng dụng và không bị kẹt email; (5) mọi màn hình hiện đúng khi tải chậm, trống, lỗi và dùng được trên điện thoại.

## Bắt đầu khi (phụ thuộc)

Không cần Epic nào trước. Nơi chạy demo đã chốt: **ưu tiên chạy cục bộ, Render là dự phòng** (task chung).

## Kiểm thử Epic

Kịch bản demo D1: đăng ký ba bước bằng OTP thật và vào Sảnh; kiểm thêm đăng nhập, hồ sơ, đăng xuất, phục hồi đăng ký dở, 5 trạng thái, 360 px, bàn phím.

## Điều kiện hoàn thành (PASS khi)

- Mọi Story của Epic đạt (mọi dòng trong bảng tiêu chí đều đạt, 5 trạng thái giao diện đúng).
- Kịch bản kiểm thử Epic ở trên chạy được trên hai trình duyệt thật, dữ liệu và màn hình khớp nhau.
- Không còn lỗi mức Cao hoặc Nghiêm trọng thuộc Epic.

## Bằng chứng nộp

Báo cáo demo kịch bản tương ứng (video hoặc báo cáo Playwright), bảng tiêu chí của các Story đã điền kết quả, danh sách lỗi có bước tái hiện; ghi bản dựng và môi trường, che bí mật.

## Rủi ro / điểm chưa rõ

Hạn mức thư OTP (khoảng 2 thư/giờ); giới hạn nhập sai chỉ gần đúng; chưa biết có chặn được đổi email ở hệ thống đăng nhập; cần khoá OAuth Google do nhóm tự tạo; nếu hệ thống đăng nhập tự liên kết cùng email thì luồng Google bị chặn (GATE-GOOGLE).

## Task của Epic (liên kết dưới Epic)

- `T-01` — Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động (Sprint 1)
- `T-02` — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ (Sprint 1)
- `T-03` — Cấu hình Supabase: gửi mã OTP đăng ký và đăng nhập Google (Sprint 1)
- `T-04` — Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập (Sprint 1)
- `T-07` — Dựng khung máy chủ: nhận kết nối có xác thực và chuyển lệnh (Sprint 1)
- `T-08` — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo) (Sprint 1)
- `T-10` — Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ (Sprint 1)
- `T-12` — Máy chủ: đăng ký bước 1 và 2 (kiểm tra tên đăng nhập, gửi mã OTP) (Sprint 1)
- `T-19` — Máy chủ: đăng ký bước 3 (xác minh mã, hoàn tất tài khoản) (Sprint 2)
- `T-20` — Máy chủ: đăng nhập, quản lý phiên và hồ sơ (Sprint 2)
- `T-23` — Thử nghiệm OTP thật và đăng nhập Google; chặn người chưa hoàn tất đăng ký và chặn đổi email (Sprint 2)
- `T-24` — Giao diện: đăng ký ba bước, đăng nhập, hồ sơ, đăng xuất (Sprint 2)
- `T-27` — Nối web với máy chủ: đăng ký, đăng nhập, hồ sơ (Sprint 2)
- `T-35` — Máy chủ: tác vụ định kỳ dọn và phục hồi tài khoản đăng ký dở (Sprint 3)
- `T-58` — Giao diện: đủ 5 trạng thái cho mọi màn hình; tính năng chưa làm hiển thị đúng quy tắc (Sprint 4)
- `T-59` — Giao diện: dùng được từ 360 px và bằng cảm ứng; trợ năng (Sprint 4)

---

# EPIC 2 — Tạo phòng chơi

**Nhãn:** `P1` · **Thành phần:** để trống (Epic trải rộng nhiều khu vực) · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống

## Mục tiêu và giá trị (Epic này làm gì)

Cho người chơi **tạo phòng**, **vào phòng** bằng mã hoặc từ Sảnh, **ngồi ghế**, bấm **Sẵn sàng** và **bắt đầu ván**; kèm thanh điều hướng và trang chính (Sảnh).

## Yêu cầu được giao

Tạo phòng (room) chơi game

## Ai dùng

Chủ phòng và người chơi vào phòng.

## Gồm những việc lớn nào (mỗi việc là một Story)

- Story 5 — Tạo phòng
- Story 6 — Thanh điều hướng và Sảnh
- Story 7 — Phòng chờ, hai ghế ngồi, Sẵn sàng và bắt đầu ván
- Story 8 — Vào phòng bằng mã, đường dẫn hoặc từ Sảnh

## Phạm vi

- **Có:** các Story ở trên.
- **Không:** Mời bạn bè và gửi đường dẫn (Epic Mời bạn), kiểu phòng công khai/khoá và quản lý người xem (Epic Phòng công khai), đi quân và luật chơi, chat, camera/micro, ghép đối thủ ngẫu nhiên, đánh hạng, mã QR.
- **Giai đoạn sau (có trong đặc tả nhưng không làm ở giai đoạn này):** Ghép ngẫu nhiên, đánh hạng, xin đổi bên, tái đấu, mã QR (giai đoạn sau).

## Các quy tắc quan trọng

- Phòng có **2 ghế**; chủ phòng ngồi ghế Đỏ; mã phòng 8 ký tự. Giờ 5, 10 hoặc 15 phút mỗi bên (mặc định 10); giờ và số người xem **không đổi** sau khi tạo. Tên phòng 1–60 ký tự, không từ cấm.
- **Mỗi người một chỗ chơi cùng lúc** (một ghế hoặc một ván với máy). Tạo tối đa 5 phòng/10 phút; nhập sai mã phòng 10 lần/phút thì bị chặn 5 phút.
- Ván bắt đầu khi cả hai Sẵn sàng, đếm 3 giây; ai bỏ Sẵn sàng thì huỷ đếm.
- Mọi quyết định do **máy chủ** làm.

## Nguồn (đặc tả)

BA mục 2.0, 2.1, 2.3, 2.7, 2.8; `docs/01` US-ROOM-01, 02, 03, 05, 12 và US-UI-01, 02; `DANH-MUC` Sảnh, hộp tạo phòng, phòng chờ, màn từ chối; `docs/05` kịch bản D2, D6.

## Kết quả khi Epic xong

Hai máy: An tạo phòng ngồi ghế Đỏ; Bình nhập mã vào ngồi ghế Đen; cả hai bấm Sẵn sàng, sau 3 giây ván bắt đầu với thế cờ ban đầu, lượt Đỏ; nếu Bình bỏ Sẵn sàng giữa lúc đếm thì không có ván; người đang có chỗ chơi khác không tạo được phòng; phòng đầy thì người vào bị từ chối kèm lý do.

## Bắt đầu khi (phụ thuộc)

Khung máy chủ, hợp đồng chung, cơ sở dữ liệu, đăng nhập (Epic Đăng ký và đăng nhập). Để ván bắt đầu thật cần mô hình bàn cờ (Epic Khởi tạo bàn cờ).

## Kiểm thử Epic

Kịch bản demo D2 và phần Sẵn sàng của D6: tạo phòng, vào phòng, ngồi ghế, đếm 3 giây, bắt đầu ván.

## Điều kiện hoàn thành (PASS khi)

- Mọi Story của Epic đạt (mọi dòng trong bảng tiêu chí đều đạt, 5 trạng thái giao diện đúng).
- Kịch bản kiểm thử Epic ở trên chạy được trên hai trình duyệt thật, dữ liệu và màn hình khớp nhau.
- Không còn lỗi mức Cao hoặc Nghiêm trọng thuộc Epic.

## Bằng chứng nộp

Báo cáo demo kịch bản tương ứng (video hoặc báo cáo Playwright), bảng tiêu chí của các Story đã điền kết quả, danh sách lỗi có bước tái hiện; ghi bản dựng và môi trường, che bí mật.

## Rủi ro / điểm chưa rõ

Hai người tranh ghế cuối; trạng thái một chỗ chơi phải nhất quán với ván máy và bạn bè.

## Task của Epic (liên kết dưới Epic)

- `T-14` — Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng (Sprint 2)
- `T-15` — Giao diện: phòng chờ và màn từ chối vào phòng (Sprint 2)
- `T-17` — Máy chủ: trạng thái phòng, mỗi người một chỗ chơi và tạo phòng (Sprint 2)
- `T-21` — Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh (Sprint 2)
- `T-25` — Máy chủ: chọn ghế, Sẵn sàng, đếm 3 giây, bắt đầu ván (Sprint 2)
- `T-29` — Nối web với máy chủ: tạo phòng, vào phòng, ghế, Sẵn sàng, bắt đầu ván (Sprint 2)

---

# EPIC 3 — Mời bạn vào phòng chơi

**Nhãn:** `P1` · **Thành phần:** để trống (Epic trải rộng nhiều khu vực) · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống

## Mục tiêu và giá trị (Epic này làm gì)

Cho người chơi **mời người khác vào phòng**: gửi **đường dẫn** hoặc **mã phòng**, người được mời bấm đường dẫn rồi đăng nhập là **vào đúng phòng**; và có **hệ thống bạn bè** để **mời bạn đang online** ngay trong phòng.

## Yêu cầu được giao

Mời bạn vào phòng chơi game (ngay trong game, gửi link, mã phòng…)

## Ai dùng

Người đang ngồi ghế (mời) và người được mời.

## Gồm những việc lớn nào (mỗi việc là một Story)

- Story 9 — Chia sẻ phòng bằng đường dẫn và mã; người được mời đăng nhập xong vào đúng phòng
- Story 10 — Kết bạn: tìm người, gửi và trả lời lời mời, giới hạn
- Story 11 — Danh sách bạn và trạng thái
- Story 12 — Mời bạn đang online vào phòng

## Phạm vi

- **Có:** các Story ở trên.
- **Không:** Nhắn tin 1-1, thách đấu, điểm Elo, mã QR (giai đoạn sau).
- **Giai đoạn sau (có trong đặc tả nhưng không làm ở giai đoạn này):** Nhắn tin 1-1 (BA 5.2), thách đấu, điểm Elo, mã QR (BA 2.2).

## Các quy tắc quan trọng

- Đường dẫn và mã cho **cùng một quyền**; chỉ người đang ngồi ghế mở được hộp thoại mời. Khoá phòng thì mã và đường dẫn cũ vô hiệu.
- Kết bạn: tìm theo tên đăng nhập (không hiện email); lời mời hết hạn sau 30 ngày; bị cùng một người từ chối 2 lần thì không gửi lại được; tối đa **200 bạn** và **50 lời mời đang chờ**.
- Trạng thái bạn: Online, Đang đấu (đang giữ ghế hoặc chơi với máy), Ngoại tuyến. Chỉ bạn Online mới mời được.
- Mời vào phòng **chỉ có trong hộp thoại mời của phòng**; thông báo đếm lùi **30 giây**; lời mời **không giữ chỗ**, máy chủ kiểm lại mọi điều kiện khi bấm Tham gia.

## Nguồn (đặc tả)

BA mục 2.4, 2.5, 2.8, 5.5; `docs/01` US-ROOM-04, US-AUTH-06, US-FRIEND-01 đến 05; `DANH-MUC` hộp chia sẻ phòng, màn bạn bè; `docs/05` kịch bản D3.

## Kết quả khi Epic xong

An tạo phòng, gửi đường dẫn cho Bình đang chưa đăng nhập; Bình đăng nhập xong vào đúng phòng. An kết bạn với Chi, mời Chi đang online; Chi bấm Tham gia và vào đúng chỗ. Chi đang chơi với máy thì không nhận được lời mời; rời ván máy xong thì nhận được. Vượt giới hạn bạn bị chặn ở máy chủ.

## Bắt đầu khi (phụ thuộc)

Epic Tạo phòng chơi (phòng và vào phòng), Epic Đánh với máy theo cấp độ (để kiểm trạng thái Đang đấu thật).

## Kiểm thử Epic

Kịch bản demo D3: gửi đường dẫn và mã, mời bạn online, vào đúng phòng; kiểm giới hạn bạn bè.

## Điều kiện hoàn thành (PASS khi)

- Mọi Story của Epic đạt (mọi dòng trong bảng tiêu chí đều đạt, 5 trạng thái giao diện đúng).
- Kịch bản kiểm thử Epic ở trên chạy được trên hai trình duyệt thật, dữ liệu và màn hình khớp nhau.
- Không còn lỗi mức Cao hoặc Nghiêm trọng thuộc Epic.

## Bằng chứng nộp

Báo cáo demo kịch bản tương ứng (video hoặc báo cáo Playwright), bảng tiêu chí của các Story đã điền kết quả, danh sách lỗi có bước tái hiện; ghi bản dựng và môi trường, che bí mật.

## Rủi ro / điểm chưa rõ

Lời mời không được giữ chỗ; trạng thái Đang đấu cần sổ chỗ chơi từ phòng và ván máy.

## Task của Epic (liên kết dưới Epic)

- `T-33` — Giao diện: bạn bè (tìm, lời mời, danh sách, mời vào phòng) (Sprint 3)
- `T-34` — Máy chủ: kết bạn, lời mời và danh sách bạn có trạng thái (Sprint 3)
- `T-47` — Nối web với máy chủ: bấm đường dẫn mời, đăng nhập rồi vào đúng phòng (Sprint 3)
- `T-52` — Máy chủ: mời bạn đang online vào phòng (Sprint 4)
- `T-54` — Nối web với máy chủ: bạn bè (Sprint 4)

---

# EPIC 4 — Khởi tạo bàn cờ

**Nhãn:** `P1` · **Thành phần:** để trống (Epic trải rộng nhiều khu vực) · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống

## Mục tiêu và giá trị (Epic này làm gì)

**Khởi tạo và hiển thị bàn cờ**: viết **luật cờ tướng** thành một gói dùng chung (máy chủ, trình duyệt và máy cờ cùng dùng), dựng **bàn cờ trên màn hình** đúng thế khởi đầu cho cả hai phe, và cho người chơi **chọn quân, kéo thả, thấy nước vừa đi, nhận cảnh báo chiếu, nghe âm thanh**.

## Yêu cầu được giao

Load bàn cờ (khởi tạo bàn cờ)

## Ai dùng

Người chơi và người xem (nhìn thấy bàn cờ); nhóm làm máy cờ và ván online (dùng gói luật).

## Gồm những việc lớn nào (mỗi việc là một Story)

- Story 13 — Thấy bàn cờ và quân cờ
- Story 14 — Tương tác với quân cờ: chọn, kéo thả, đánh dấu nước đi, cảnh báo chiếu, âm thanh

## Phạm vi

- **Có:** các Story ở trên.
- **Không:** Đi lại, gợi ý nước hay, xuất và xem lại ván, giao diện sáng (giai đoạn sau). Đồng hồ và kết thúc ván thuộc Epic Hai người đánh cờ qua mạng.
- **Giai đoạn sau (có trong đặc tả nhưng không làm ở giai đoạn này):** Đi lại (BA 3.2), gợi ý nước (BA 6.1), xuất ván FEN/PGN (BA 9.1), giao diện sáng.

## Các quy tắc quan trọng

- Đen ở trên (y=0), Đỏ ở dưới (y=9), **Đỏ đi trước**; người cầm Đen thấy bàn lật nhưng dữ liệu gốc không đổi.
- Luật viết **một lần** dùng chung. Hết nước đi là **thua**; hoà khi lặp thế lần ba (không bên nào chiếu liên tục) hoặc 120 nửa nước không ăn quân; chiếu hết được xét trước.
- Quân chỉ dùng **chữ Hán truyền thống**.
- Kiểm chứng luật bằng nguồn đối chiếu độc lập: số nước đi từ thế khởi đầu ở độ sâu 1–4 là 44, 1.920, 79.666, 3.290.240.

## Nguồn (đặc tả)

BA mục 3.1, 3.4, 10.4; `docs/01` US-BOARD-01 đến 05; `docs/02` mục 1 đến 7; `DANH-MUC` bàn cờ trong màn ván; `docs/05` mục 3 (kiểm thử luật) và cổng GATE-PERFT.

## Kết quả khi Epic xong

Từ thế khởi đầu, mọi nước đi sinh ra khớp nguồn đối chiếu độc lập; các thế chiếu hết, hết nước, lặp thế, 120 nửa nước cho kết quả đúng luật; trên trình duyệt bàn cờ đúng cho cả hai phe, bấm và kéo quân đều đi được, bị chiếu thì có cảnh báo, có âm thanh.

## Bắt đầu khi (phụ thuộc)

Khung web và khối giao diện nền (Epic Đăng ký và đăng nhập, phần nền tảng).

## Kiểm thử Epic

Bộ kiểm thử luật tự động chạy xanh (đếm nước độc lập, thế mẫu, 1.000 ván ngẫu nhiên); trên trình duyệt kiểm bàn cờ hai phe, chọn, kéo thả, hiệu ứng, âm thanh.

## Điều kiện hoàn thành (PASS khi)

- Mọi Story của Epic đạt (mọi dòng trong bảng tiêu chí đều đạt, 5 trạng thái giao diện đúng).
- Kịch bản kiểm thử Epic ở trên chạy được trên hai trình duyệt thật, dữ liệu và màn hình khớp nhau.
- Không còn lỗi mức Cao hoặc Nghiêm trọng thuộc Epic.

## Bằng chứng nộp

Báo cáo demo kịch bản tương ứng (video hoặc báo cáo Playwright), bảng tiêu chí của các Story đã điền kết quả, danh sách lỗi có bước tái hiện; ghi bản dựng và môi trường, che bí mật.

## Rủi ro / điểm chưa rõ

Phông chữ Hán; độ đúng luật phải được kiểm bằng nguồn độc lập, không chỉ bằng mã của nhóm.

## Task của Epic (liên kết dưới Epic)

- `T-05` — Luật cờ: mô hình bàn cờ, thế khởi đầu, nước đi của từng loại quân (Sprint 1)
- `T-09` — Luật cờ: nước hợp lệ, chiếu, chiếu hết, hết nước, lặp thế, 120 nửa nước (Sprint 1)
- `T-11` — Giao diện: bàn cờ SVG, quân chữ Hán, lật bàn cho phe Đen (Sprint 1)
- `T-18` — Giao diện: bấm chọn quân và chấm gợi ý ô đi (Sprint 2)
- `T-22` — Giao diện: kéo thả quân, đánh dấu nước vừa đi, cảnh báo chiếu, âm thanh (Sprint 2)
- `T-46` — Kiểm thử luật cờ: đếm nước đi độc lập và bộ kiểm thử chạy tự động (Sprint 3)

---

# EPIC 5 — Hai người đánh cờ qua mạng

**Nhãn:** `P1` · **Thành phần:** để trống (Epic trải rộng nhiều khu vực) · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống

## Mục tiêu và giá trị (Epic này làm gì)

Cho hai người **đánh một ván cờ qua mạng**: đi nước (hai trình duyệt luôn thấy cùng một thế cờ), đồng hồ chạy, kết thúc ván (chiếu hết, hết giờ, đầu hàng, xin hoà), xử lý khi rớt mạng và nối lại, và đăng xuất giữa ván. **Máy chủ quyết định mọi thứ**.

## Yêu cầu được giao

Hai người đánh cờ qua mạng (online)

## Ai dùng

Hai người chơi.

## Gồm những việc lớn nào (mỗi việc là một Story)

- Story 15 — Đi nước qua mạng và bảng nước đi
- Story 16 — Đồng hồ ván
- Story 17 — Kết thúc ván: kết quả, đầu hàng, xin hoà, lặp thế
- Story 18 — Rời phòng giữa ván, mất kết nối và kết nối lại

## Phạm vi

- **Có:** các Story ở trên.
- **Không:** Tái đấu, xem lại ván, đi lại, điều kiện xin hoà của đánh hạng, giờ "không giới hạn", Elo.
- **Giai đoạn sau (có trong đặc tả nhưng không làm ở giai đoạn này):** Tái đấu (BA 2.3 mục 7), xem lại ván, xin hoà của đánh hạng (BA 7.2), giờ không giới hạn.

## Các quy tắc quan trọng

- Lệnh gửi lại cùng mã chỉ có **một tác dụng**; lệnh dựa trên bản ván cũ bị từ chối; các lệnh của một ván xử lý **lần lượt**.
- Đồng hồ do **máy chủ** tính, không cộng giây; hết giờ thì thua. Xin hoà: một đề nghị mỗi lần, chờ 30 giây; bị từ chối phải đi thêm 5 nước mới xin lại.
- Rời giữa ván = đầu hàng. Mất kết nối: người chơi giữ chỗ **60 giây**; máy chủ khởi động lại thì ván **gián đoạn**.
- Hiệu năng: người xem nhận thế mới dưới **100 ms**; chịu **50 kết nối, 10 ván** cùng lúc.

## Nguồn (đặc tả)

BA mục 3.3, 3.5, 3.6, 8.3; `docs/01` US-PLAY-01 đến 08, 10, US-AUTH-05 (đăng xuất giữa ván); `DANH-MUC` màn ván, khung xin hoà, hộp xác nhận đầu hàng và rời phòng, hộp kết quả, lớp phủ mất kết nối; `docs/04` mục 4 đến 6; `docs/07` mục 3, 6; yêu cầu NFR-01, 02, 07; kịch bản D6, D9.

## Kết quả khi Epic xong

Hai trình duyệt thật: hai người đi nước luân phiên, thế cờ giống nhau ở mọi nước; đồng hồ đúng, hết giờ thì thua; đầu hàng và xin hoà đủ các nhánh; ngắt mạng một bên: nối lại trước 60 giây thì tiếp tục, quá thì thua; bảng nước đi đúng ký hiệu tiếng Việt.

## Bắt đầu khi (phụ thuộc)

Epic Tạo phòng chơi (ván bắt đầu từ phòng), Epic Khởi tạo bàn cờ (luật và bàn cờ).

## Kiểm thử Epic

Kịch bản demo D6 và D9: đánh đến chiếu hết, hết giờ, đầu hàng, xin hoà; ngắt mạng một bên 60 giây.

## Điều kiện hoàn thành (PASS khi)

- Mọi Story của Epic đạt (mọi dòng trong bảng tiêu chí đều đạt, 5 trạng thái giao diện đúng).
- Kịch bản kiểm thử Epic ở trên chạy được trên hai trình duyệt thật, dữ liệu và màn hình khớp nhau.
- Không còn lỗi mức Cao hoặc Nghiêm trọng thuộc Epic.

## Bằng chứng nộp

Báo cáo demo kịch bản tương ứng (video hoặc báo cáo Playwright), bảng tiêu chí của các Story đã điền kết quả, danh sách lỗi có bước tái hiện; ghi bản dựng và môi trường, che bí mật.

## Rủi ro / điểm chưa rõ

Chuỗi phụ thuộc dài nhất của dự án; yêu cầu dưới 100 ms chỉ đo được khi đã nối thật; lỗi ghi dữ liệu phải đóng băng đồng hồ.

## Task của Epic (liên kết dưới Epic)

- `T-26` — Giao diện ván: bàn cờ nối mạng, đồng hồ, nút, hộp kết quả, khung xin hoà (Sprint 2)
- `T-28` — Máy chủ: bộ xử lý lệnh của ván và xử lý nước đi (Sprint 2)
- `T-30` — Nối web với máy chủ: đi nước, đồng bộ thế cờ giữa hai trình duyệt (Sprint 2)
- `T-39` — Máy chủ: đồng hồ ván, kết thúc ván, đầu hàng, xin hoà (Sprint 3)
- `T-42` — Bảng nước đi: ký hiệu tiếng Việt và hiển thị (Sprint 3)
- `T-45` — Máy chủ: rời phòng giữa ván, mất kết nối, giữ chỗ, kết nối lại, ván gián đoạn (Sprint 3)
- `T-48` — Đăng xuất giữa ván: xác nhận, đầu hàng, rời phòng rồi đăng xuất (Sprint 3)
- `T-50` — Nối web với máy chủ: đồng hồ, kết thúc ván, mất kết nối, người xem, bảng nước đi (Sprint 3)

---

# EPIC 6 — Phòng công khai, khoá phòng và người xem

**Nhãn:** `P1` · **Thành phần:** để trống (Epic trải rộng nhiều khu vực) · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống

## Mục tiêu và giá trị (Epic này làm gì)

Cho chủ phòng **chọn ai được thấy và được vào phòng**: **công khai** (hiện ở Sảnh để mọi người vào xem), **chỉ vào bằng mã**, hoặc **khoá** (không ai mới vào được); cho **người xem** theo dõi ván trực tiếp (tối đa theo cài đặt phòng); và quản lý phòng: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng.

## Yêu cầu được giao

Mở công khai cho mọi người xem hai người đánh, hoặc khoá lại không cho ai vào, hoặc khoá nhưng có mã phòng để người khác vào xem

## Ai dùng

Chủ phòng, người chơi và người xem.

## Gồm những việc lớn nào (mỗi việc là một Story)

- Story 19 — Kiểu phòng, khoá phòng và danh sách phòng công khai
- Story 20 — Quản lý phòng: đổi chỗ, đuổi người xem, chủ phòng rời, sau ván
- Story 21 — Người xem theo dõi trực tiếp

## Phạm vi

- **Có:** các Story ở trên.
- **Không:** Xem lại ván, chat và camera cho người xem (Epic Chat, camera và micro).
- **Giai đoạn sau (có trong đặc tả nhưng không làm ở giai đoạn này):** Xem lại ván; camera/micro cho người xem (BA 4.1 cấm phát).

## Các quy tắc quan trọng

- Phòng có **tối đa 5 người xem** (mặc định 5, chọn 0–5; cài đặt không đổi sau khi tạo). Khoá chỉ bật được khi **đủ 2 người chơi**; khoá thì phòng biến khỏi Sảnh, người mới không vào được, người đang có mặt **giữ nguyên**; mất ghế **không** tự mở khoá.
- Người đang có mặt mất mạng vào lại được: người chơi **60 giây**, người xem **5 phút**.
- Danh sách phòng công khai: mới nhất trước, **tối đa 50**.
- Người xem **chỉ đọc**, không thấy kênh chat riêng; đuổi người xem thì bị chặn đến khi phòng đóng.

## Nguồn (đặc tả)

BA mục 2.7, 2.8, 4.1, 4.2, 4.3; `docs/01` US-ROOM-06 đến 11, US-PLAY-09; `DANH-MUC` hộp cài đặt phòng, hộp đuổi người xem, danh sách người xem; kịch bản D4, D5.

## Kết quả khi Epic xong

Hai máy: An tạo phòng cho tối đa 2 người xem; Bình ngồi ghế; Chi và Dũng vào xem, người thứ ba bị từ chối; An khoá phòng, Em dùng mã không vào được; mở lại thì có mã mới, mã cũ vô hiệu; An đuổi Chi, Chi bị chặn; người xem thấy ván trực tiếp và không thấy kênh riêng.

## Bắt đầu khi (phụ thuộc)

Epic Tạo phòng chơi (phòng và vào phòng), Epic Hai người đánh cờ qua mạng (ván để xem).

## Kiểm thử Epic

Kịch bản demo D4 và D5: người xem thứ ba bị từ chối, khoá phòng chặn người mới, đuổi người xem, chủ phòng rời.

## Điều kiện hoàn thành (PASS khi)

- Mọi Story của Epic đạt (mọi dòng trong bảng tiêu chí đều đạt, 5 trạng thái giao diện đúng).
- Kịch bản kiểm thử Epic ở trên chạy được trên hai trình duyệt thật, dữ liệu và màn hình khớp nhau.
- Không còn lỗi mức Cao hoặc Nghiêm trọng thuộc Epic.

## Bằng chứng nộp

Báo cáo demo kịch bản tương ứng (video hoặc báo cáo Playwright), bảng tiêu chí của các Story đã điền kết quả, danh sách lỗi có bước tái hiện; ghi bản dựng và môi trường, che bí mật.

## Rủi ro / điểm chưa rõ

Người bị đuổi phải mất quyền thật; khoá phòng không được loại người đang có mặt.

## Task của Epic (liên kết dưới Epic)

- `T-32` — Giao diện: cài đặt phòng, đổi chỗ ghế/xem, danh sách người xem, xác nhận đuổi (Sprint 3)
- `T-36` — Máy chủ: kiểu phòng (công khai, chỉ mã, khoá) và danh sách phòng ở Sảnh (Sprint 3)
- `T-38` — Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng (Sprint 3)
- `T-40` — Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời (Sprint 3)
- `T-44` — Máy chủ: người xem theo dõi trực tiếp, lọc dữ liệu theo vai trò (Sprint 3)

---

# EPIC 7 — Chat, camera và micro

**Nhãn:** `P1` · **Thành phần:** để trống (Epic trải rộng nhiều khu vực) · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống

## Mục tiêu và giá trị (Epic này làm gì)

Cho người trong phòng **nhắn tin** (hai kênh: Riêng của hai người chơi, và Chung cho cả phòng gồm người xem) và cho hai người chơi **bật camera, micro** để thấy mặt, nghe tiếng nhau (qua dịch vụ LiveKit Cloud). Mọi thứ phải **đúng quyền**.

## Yêu cầu được giao

Hai người vừa đánh cờ vừa chat, có camera và micro; có kênh chat cho người xem tách riêng với chat của hai người đánh

## Ai dùng

Người chơi và người xem.

## Gồm những việc lớn nào (mỗi việc là một Story)

- Story 22 — Chat hai kênh, giới hạn tin nhắn và lọc từ cấm
- Story 23 — Camera và micro: người chơi bật, người xem chỉ xem
- Story 24 — Mở nhiều tab: tab mới tiếp quản

## Phạm vi

- **Có:** các Story ở trên.
- **Không:** Nhắn tin riêng giữa bạn bè, sticker, ghi hình hay ghi âm (giai đoạn sau).
- **Giai đoạn sau (có trong đặc tả nhưng không làm ở giai đoạn này):** Nhắn tin riêng giữa bạn bè, sticker (BA 5.1, 5.2); chat và camera của đánh hạng; hộp thoại chọn thiết bị khi mở nhiều tab.

## Các quy tắc quan trọng

- Kênh Riêng chỉ hai người ngồi ghế; Kênh Chung cho cả phòng; **người xem chỉ thấy Kênh Chung** (kênh chat của người xem tách riêng với chat của hai người đánh).
- Tin tối đa 200 ký tự, 5 tin/10 giây; từ cấm bị che `***` ở cả máy chủ và trình duyệt.
- Camera và micro **mặc định tắt**, bật tắt độc lập; **3 mức chia sẻ** (không chia sẻ / chỉ đối thủ / cả đối thủ và người xem). Người xem **không bao giờ được phát**. **Không ghi hình, ghi âm.**
- Mở tab mới thì tab mới tiếp quản, tab cũ chỉ đọc và dừng thiết bị.
- **Đã chốt:** đổi cặp người ngồi ghế thì người mới (và cả cặp mới) **không đọc** tin cũ của cặp trước.

## Nguồn (đặc tả)

BA mục 1.8 (nhiều tab), 4.1, 5.3, 5.4; `docs/01` US-CHAT-01, 02, US-MEDIA-01 đến 03; `DANH-MUC` khung chat, khung camera/micro; `docs/04` mục 7; cổng GATE-MEDIA; kịch bản D7.

## Kết quả khi Epic xong

Nhiều trình duyệt: hai người chat ở cả hai kênh; người xem chỉ thấy và gửi ở Kênh Chung và không nhận byte nào của Kênh Riêng; hai người bật camera và micro thấy và nghe nhau theo mức chia sẻ; đổi vai hoặc đuổi người xem thì mất quyền thật; mở tab mới thì tab cũ chỉ đọc; camera/micro hỏng không làm hỏng việc đi cờ và chat.

## Bắt đầu khi (phụ thuộc)

Epic Tạo phòng chơi (phòng), Epic Phòng công khai, khoá phòng và người xem (đổi chỗ, đuổi), Epic Hai người đánh cờ qua mạng (đi nước để kiểm khi camera hỏng).

## Kiểm thử Epic

Kịch bản demo D7: chat hai kênh, camera/micro theo mức chia sẻ, người xem không phát; thử nghiệm quyền camera/micro độc lập.

## Điều kiện hoàn thành (PASS khi)

- Mọi Story của Epic đạt (mọi dòng trong bảng tiêu chí đều đạt, 5 trạng thái giao diện đúng).
- Kịch bản kiểm thử Epic ở trên chạy được trên hai trình duyệt thật, dữ liệu và màn hình khớp nhau.
- Không còn lỗi mức Cao hoặc Nghiêm trọng thuộc Epic.

## Bằng chứng nộp

Báo cáo demo kịch bản tương ứng (video hoặc báo cáo Playwright), bảng tiêu chí của các Story đã điền kết quả, danh sách lỗi có bước tái hiện; ghi bản dựng và môi trường, che bí mật.

## Rủi ro / điểm chưa rõ

Có thể vượt hạn mức miễn phí của dịch vụ camera/micro; quyền cũ phải bị thu hồi thật.

## Task của Epic (liên kết dưới Epic)

- `T-06` — Thử nghiệm LiveKit Cloud: camera/micro theo từng người, thu hồi quyền (Sprint 1)
- `T-41` — Máy chủ: chat hai kênh, quyền đọc, giới hạn tin, lọc từ cấm (Sprint 3)
- `T-49` — Giao diện chat hai kênh và nối web với máy chủ (Sprint 3)
- `T-51` — Giao diện: camera/micro, bật tắt độc lập, mức chia sẻ, thông báo quyền và lỗi (Sprint 4)
- `T-53` — Máy chủ: cấp quyền camera/micro theo vai và mở nhiều tab (tab mới tiếp quản) (Sprint 4)
- `T-57` — Nối camera/micro thật: theo đối tượng nhận, đổi vai, đuổi, tab (web, máy chủ, LiveKit) (Sprint 4)

---

# EPIC 8 — Đánh với máy theo cấp độ

**Nhãn:** `P1` · **Thành phần:** để trống (Epic trải rộng nhiều khu vực) · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống

## Mục tiêu và giá trị (Epic này làm gì)

Cho người dùng **đánh cờ với máy** theo **từng cấp độ** (**Dễ, Trung bình, Khó**), tự chọn phe Đỏ, Đen hoặc ngẫu nhiên. Máy là chương trình **chạy riêng** khỏi máy chủ.

## Yêu cầu được giao

Người đánh với máy theo từng cấp độ của máy

## Ai dùng

Người chơi đã đăng nhập (một mình).

## Gồm những việc lớn nào (mỗi việc là một Story)

- Story 25 — Chọn cấp độ, chọn phe và máy đi nước đúng luật
- Story 26 — Kết thúc ván với máy, vào lại ván và sự cố máy cờ

## Phạm vi

- **Có:** các Story ở trên.
- **Không:** Gợi ý nước đi, đi lại, xin hoà, lưu lịch sử, tính điểm Elo (giai đoạn sau).
- **Giai đoạn sau (có trong đặc tả nhưng không làm ở giai đoạn này):** Đi lại với máy, lưu lịch sử ván máy (BA 6.2), bảng thông số máy (BA 9.2).

## Các quy tắc quan trọng

- Thời gian nghĩ tối đa: Dễ 300 ms, Trung bình 1.000 ms, Khó 3.000 ms. **Máy không bao giờ đi sai luật.**
- Ván với máy **không giới hạn thời gian** cho người chơi; không có xin hoà, không gợi ý nước.
- Đóng tab: giữ ván **30 phút**; chủ động rời hoặc đăng xuất thì đầu hàng ngay.
- Máy lỗi quá 10 giây → ván **Bỏ dở**, có nút **Thử lại** (ván mới cùng cấp, cùng phe đã bốc).
- Phải đạt tiêu chuẩn chất lượng máy cờ: thời gian suy nghĩ đạt ngưỡng (95% lần đo nhanh hơn mức quy định), tỷ lệ thắng cấp cao ≥ 75%, 1.000 ván không lỗi.

## Nguồn (đặc tả)

BA mục 6.1, 6.3; `docs/01` US-AI-01 đến 04; `docs/02` mục 9; `DANH-MUC` hộp chọn cấp độ và phe, màn đánh với máy; `docs/05` cổng GATE-AI; kịch bản D8, D10.

## Kết quả khi Epic xong

Người chơi chọn Khó và phe Đen, máy đi trước, bàn lật; đánh đến chiếu hết hoặc đầu hàng, hộp kết quả chỉ có Rời phòng; đóng tab rồi vào lại trước 30 phút thấy đúng thế, sau 30 phút là Bỏ dở; giết tiến trình máy thì báo sự cố và Thử lại tạo ván mới; báo cáo đo máy cờ đủ số liệu.

## Bắt đầu khi (phụ thuộc)

Luật cờ (Epic Khởi tạo bàn cờ) và xử lý nước đi (Epic Hai người đánh cờ qua mạng).

## Kiểm thử Epic

Kịch bản demo D8 và D10: ba cấp độ, vào lại trong 30 phút; báo cáo đo máy cờ (GATE-AI).

## Điều kiện hoàn thành (PASS khi)

- Mọi Story của Epic đạt (mọi dòng trong bảng tiêu chí đều đạt, 5 trạng thái giao diện đúng).
- Kịch bản kiểm thử Epic ở trên chạy được trên hai trình duyệt thật, dữ liệu và màn hình khớp nhau.
- Không còn lỗi mức Cao hoặc Nghiêm trọng thuộc Epic.

## Bằng chứng nộp

Báo cáo demo kịch bản tương ứng (video hoặc báo cáo Playwright), bảng tiêu chí của các Story đã điền kết quả, danh sách lỗi có bước tái hiện; ghi bản dựng và môi trường, che bí mật.

## Rủi ro / điểm chưa rõ

Chất lượng máy cờ (thời gian suy nghĩ, sức mạnh, độ ổn định) chỉ kết luận sau bài đo đầy đủ; không đạt thì ghi số thật và báo PO.

## Task của Epic (liên kết dưới Epic)

- `T-31` — Máy cờ: chương trình chạy riêng, ba cấp độ, thử nghiệm sơ bộ tốc độ (Sprint 3)
- `T-37` — Giao diện: chọn cấp và phe, màn ván với máy, thông báo sự cố (Sprint 3)
- `T-43` — Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ (Sprint 3)
- `T-55` — Nối web, máy chủ và máy cờ thật: ván với máy (Sprint 4)
- `T-56` — Đo máy cờ đầy đủ (GATE-AI): tốc độ, độ sâu, sức mạnh, độ ổn định (Sprint 4)

---

# Task chung của dự án (không thuộc Epic nào, nhãn `chung`)

- `T-13` — Dựng khung kiểm thử tự động trên nhiều trình duyệt (Playwright) (Sprint 1)
- `T-16` — Chọn nơi chạy ứng dụng và dựng bản demo trên mạng (Sprint 2)
- `T-60` — Nghiệm thu từng tiêu chí giai đoạn 1 và chạy kịch bản demo D1–D10 (Sprint 4)
- `T-61` — Nghiệm thu phi chức năng: bài tải, quyền camera/micro, trình duyệt, bảo mật (Sprint 4)
- `T-62` — Chuẩn bị demo, sửa lỗi cuối, kiểm lại và bàn giao bằng chứng (Sprint 4)
