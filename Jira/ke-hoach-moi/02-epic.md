# Description của 8 Epic

**Ngày:** 2026-10-04 · **Trạng thái:** đề xuất, chờ PO duyệt · Chưa tạo gì trên Jira · Viết theo `00-chuan-description.md` và mẫu `00b`.

**8 Epic ứng với 8 yêu cầu được giao.** Mỗi Epic: Epic này làm gì; Yêu cầu được giao; Ai dùng; Các Story; Không làm; Quy tắc quan trọng; Khi nào xong; Cần xong trước; Task. Story ở `12` và `13`; Task ở `03` đến `11`. Có thêm **5 task chung** (khung kiểm thử nhiều trình duyệt, nơi chạy demo, nghiệm thu, chuẩn bị demo và bàn giao) không thuộc Epic nào, gắn nhãn `chung`.

---

# EPIC 1 — Đăng ký và đăng nhập (kèm nền tảng dự án)

## Yêu cầu được giao

Giao diện đăng ký / đăng nhập

## Epic này làm gì

Cho người dùng **đăng ký tài khoản qua ba bước** (tên đăng nhập và mật khẩu, email, mã OTP 6 số gửi qua email), **đăng nhập**, có **hồ sơ cơ bản**, **đăng xuất**, và dùng một **giao diện thống nhất** (đủ 5 trạng thái, dùng được trên điện thoại, đạt chuẩn trợ năng). Epic này cũng gồm **nền tảng của cả dự án** (kho mã, kiểm tra tự động, hợp đồng giữa trình duyệt và máy chủ, cơ sở dữ liệu, khung web, khung máy chủ, ba cơ chế dùng chung) vì đăng ký và đăng nhập là chức năng đầu tiên cần đến chúng.

## Ai dùng

Người mới (đăng ký), người đã có tài khoản (đăng nhập); nhóm làm dự án (phần nền tảng).

## Gồm những việc lớn nào (mỗi việc là một Story)

- Story 1 — Đăng ký tài khoản qua ba bước
- Story 2 — Đăng nhập bằng tên đăng nhập và mật khẩu
- Story 3 — Hồ sơ cơ bản và đăng xuất
- Story 4 — Giao diện nhất quán: đủ 5 trạng thái, dùng được trên điện thoại, trợ năng, tính năng chưa làm

## Không làm trong Epic này

Đăng nhập khách, đăng nhập Google, quên mật khẩu, đổi tên đăng nhập hoặc email, ảnh đại diện tuỳ chọn, giao diện sáng (giai đoạn sau).

## Các quy tắc quan trọng

- Tên đăng nhập 3–20 ký tự (chữ, số, gạch dưới), không phân biệt hoa thường khi kiểm trùng; mật khẩu từ 8 ký tự; tên hiển thị 2–30 ký tự.
- Mã OTP có hiệu lực **180 giây**; gửi lại cách nhau tối thiểu **60 giây**; mặc định chỉ khoảng **2 thư mỗi giờ**.
- Phiên đăng nhập: ghi nhớ thì **30 ngày**, không thì **12 giờ** hoặc đến khi đóng trình duyệt.
- Đăng nhập sai chỉ báo **một lỗi chung**, không lộ email. Email và tên đăng nhập **không đổi được**.
- Tài khoản chưa đăng ký xong thì **không được dùng**; tài khoản đã hoàn tất **không bao giờ** bị xoá nhầm.
- Giao diện luôn tối "Kỳ Đài Cổ Phong"; **5 trạng thái** (thành công, đang tải, trống, lỗi, bị khoá có chú thích); dùng được từ **360 px**; chuẩn **WCAG 2.1 AA**; thông tin bí mật không nằm trong mã.

## Khi nào Epic được coi là xong

Chạy trên hai trình duyệt: (1) An đăng ký đủ ba bước bằng mã OTP thật tới email thật, vào được Sảnh; (2) An đăng xuất rồi đăng nhập lại (có và không "Ghi nhớ"); (3) An sửa tên hiển thị, tên có từ cấm bị từ chối; (4) người đăng ký dở không dùng được ứng dụng và không bị kẹt email; (5) mọi màn hình hiện đúng khi tải chậm, trống, lỗi và dùng được trên điện thoại.

## Cần xong trước

Không cần Epic nào trước. Phần dựng môi trường demo (task chung) đã chốt: **ưu tiên chạy cục bộ, Render là dự phòng**.

## Task của Epic

- `T-01` — Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động (Sprint 1)
- `T-02` — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ (Sprint 1)
- `T-03` — Cấu hình Supabase gửi mã OTP đăng ký (Sprint 1)
- `T-04` — Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập (Sprint 1)
- `T-07` — Dựng khung máy chủ: nhận kết nối có xác thực và chuyển lệnh (Sprint 1)
- `T-08` — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo) (Sprint 1)
- `T-10` — Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ (Sprint 1)
- `T-12` — Máy chủ: đăng ký bước 1 và 2 (kiểm tra tên đăng nhập, gửi mã OTP) (Sprint 1)
- `T-19` — Máy chủ: đăng ký bước 3 (xác minh mã, hoàn tất tài khoản) (Sprint 2)
- `T-20` — Máy chủ: đăng nhập, quản lý phiên và hồ sơ (Sprint 2)
- `T-23` — Thử nghiệm OTP thật; chặn người chưa hoàn tất đăng ký và chặn đổi email (Sprint 2)
- `T-24` — Giao diện: đăng ký ba bước, đăng nhập, hồ sơ, đăng xuất (Sprint 2)
- `T-27` — Nối web với máy chủ: đăng ký, đăng nhập, hồ sơ (Sprint 2)
- `T-35` — Máy chủ: tác vụ định kỳ dọn và phục hồi tài khoản đăng ký dở (Sprint 3)
- `T-58` — Giao diện: đủ 5 trạng thái cho mọi màn hình; tính năng chưa làm hiển thị đúng quy tắc (Sprint 4)
- `T-59` — Giao diện: dùng được từ 360 px và bằng cảm ứng; trợ năng (Sprint 4)

---

# EPIC 2 — Tạo phòng chơi

## Yêu cầu được giao

Tạo phòng (room) chơi game

## Epic này làm gì

Cho người chơi **tạo phòng**, **vào phòng** bằng mã hoặc từ Sảnh, **ngồi ghế**, bấm **Sẵn sàng** và **bắt đầu ván**; kèm thanh điều hướng và trang chính (Sảnh).

## Ai dùng

Chủ phòng và người chơi vào phòng.

## Gồm những việc lớn nào (mỗi việc là một Story)

- Story 5 — Tạo phòng
- Story 6 — Thanh điều hướng và Sảnh
- Story 7 — Phòng chờ, hai ghế ngồi, Sẵn sàng và bắt đầu ván
- Story 8 — Vào phòng bằng mã, đường dẫn hoặc từ Sảnh

## Không làm trong Epic này

Mời bạn bè và gửi đường dẫn (Epic Mời bạn), kiểu phòng công khai/khoá và quản lý người xem (Epic Phòng công khai), đi quân và luật chơi, chat, camera/micro, ghép đối thủ ngẫu nhiên, đánh hạng, mã QR.

## Các quy tắc quan trọng

- Phòng có **2 ghế**; chủ phòng ngồi ghế Đỏ; mã phòng 8 ký tự. Giờ 5, 10 hoặc 15 phút mỗi bên (mặc định 10); giờ và số người xem **không đổi** sau khi tạo. Tên phòng 1–60 ký tự, không từ cấm.
- **Mỗi người một chỗ chơi cùng lúc** (một ghế hoặc một ván với máy). Tạo tối đa 5 phòng/10 phút; nhập sai mã phòng 10 lần/phút thì bị chặn 5 phút.
- Ván bắt đầu khi cả hai Sẵn sàng, đếm 3 giây; ai bỏ Sẵn sàng thì huỷ đếm.
- Mọi quyết định do **máy chủ** làm.

## Khi nào Epic được coi là xong

Hai máy: An tạo phòng ngồi ghế Đỏ; Bình nhập mã vào ngồi ghế Đen; cả hai bấm Sẵn sàng, sau 3 giây ván bắt đầu với thế cờ ban đầu, lượt Đỏ; nếu Bình bỏ Sẵn sàng giữa lúc đếm thì không có ván; người đang có chỗ chơi khác không tạo được phòng; phòng đầy thì người vào bị từ chối kèm lý do.

## Cần xong trước

Khung máy chủ, hợp đồng chung, cơ sở dữ liệu, đăng nhập (Epic Đăng ký và đăng nhập). Để ván bắt đầu thật cần mô hình bàn cờ (Epic Khởi tạo bàn cờ).

## Task của Epic

- `T-14` — Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng (Sprint 2)
- `T-15` — Giao diện: phòng chờ và màn từ chối vào phòng (Sprint 2)
- `T-17` — Máy chủ: trạng thái phòng, mỗi người một chỗ chơi và tạo phòng (Sprint 2)
- `T-21` — Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh (Sprint 2)
- `T-25` — Máy chủ: chọn ghế, Sẵn sàng, đếm 3 giây, bắt đầu ván (Sprint 2)
- `T-29` — Nối web với máy chủ: tạo phòng, vào phòng, ghế, Sẵn sàng, bắt đầu ván (Sprint 2)

---

# EPIC 3 — Mời bạn vào phòng chơi

## Yêu cầu được giao

Mời bạn vào phòng chơi game (ngay trong game, gửi link, mã phòng…)

## Epic này làm gì

Cho người chơi **mời người khác vào phòng**: gửi **đường dẫn** hoặc **mã phòng**, người được mời bấm đường dẫn rồi đăng nhập là **vào đúng phòng**; và có **hệ thống bạn bè** để **mời bạn đang online** ngay trong phòng.

## Ai dùng

Người đang ngồi ghế (mời) và người được mời.

## Gồm những việc lớn nào (mỗi việc là một Story)

- Story 9 — Chia sẻ phòng bằng đường dẫn và mã; người được mời đăng nhập xong vào đúng phòng
- Story 10 — Kết bạn: tìm người, gửi và trả lời lời mời, giới hạn
- Story 11 — Danh sách bạn và trạng thái
- Story 12 — Mời bạn đang online vào phòng

## Không làm trong Epic này

Nhắn tin 1-1, thách đấu, điểm Elo, mã QR (giai đoạn sau).

## Các quy tắc quan trọng

- Đường dẫn và mã cho **cùng một quyền**; chỉ người đang ngồi ghế mở được hộp thoại mời. Khoá phòng thì mã và đường dẫn cũ vô hiệu.
- Kết bạn: tìm theo tên đăng nhập (không hiện email); lời mời hết hạn sau 30 ngày; bị cùng một người từ chối 2 lần thì không gửi lại được; tối đa **200 bạn** và **50 lời mời đang chờ**.
- Trạng thái bạn: Online, Đang đấu (đang giữ ghế hoặc chơi với máy), Ngoại tuyến. Chỉ bạn Online mới mời được.
- Mời vào phòng **chỉ có trong hộp thoại mời của phòng**; thông báo đếm lùi **30 giây**; lời mời **không giữ chỗ**, máy chủ kiểm lại mọi điều kiện khi bấm Tham gia.

## Khi nào Epic được coi là xong

An tạo phòng, gửi đường dẫn cho Bình đang chưa đăng nhập; Bình đăng nhập xong vào đúng phòng. An kết bạn với Chi, mời Chi đang online; Chi bấm Tham gia và vào đúng chỗ. Chi đang chơi với máy thì không nhận được lời mời; rời ván máy xong thì nhận được. Vượt giới hạn bạn bị chặn ở máy chủ.

## Cần xong trước

Epic Tạo phòng chơi (phòng và vào phòng), Epic Đánh với máy theo cấp độ (để kiểm trạng thái Đang đấu thật).

## Task của Epic

- `T-33` — Giao diện: bạn bè (tìm, lời mời, danh sách, mời vào phòng) (Sprint 3)
- `T-34` — Máy chủ: kết bạn, lời mời và danh sách bạn có trạng thái (Sprint 3)
- `T-47` — Nối web với máy chủ: bấm đường dẫn mời, đăng nhập rồi vào đúng phòng (Sprint 3)
- `T-52` — Máy chủ: mời bạn đang online vào phòng (Sprint 4)
- `T-54` — Nối web với máy chủ: bạn bè (Sprint 4)

---

# EPIC 4 — Khởi tạo bàn cờ

## Yêu cầu được giao

Load bàn cờ (khởi tạo bàn cờ)

## Epic này làm gì

**Khởi tạo và hiển thị bàn cờ**: viết **luật cờ tướng** thành một gói dùng chung (máy chủ, trình duyệt và máy cờ cùng dùng), dựng **bàn cờ trên màn hình** đúng thế khởi đầu cho cả hai phe, và cho người chơi **chọn quân, kéo thả, thấy nước vừa đi, nhận cảnh báo chiếu, nghe âm thanh**.

## Ai dùng

Người chơi và người xem (nhìn thấy bàn cờ); nhóm làm máy cờ và ván online (dùng gói luật).

## Gồm những việc lớn nào (mỗi việc là một Story)

- Story 13 — Thấy bàn cờ và quân cờ
- Story 14 — Tương tác với quân cờ: chọn, kéo thả, đánh dấu nước đi, cảnh báo chiếu, âm thanh

## Không làm trong Epic này

Đi lại, gợi ý nước hay, xuất và xem lại ván, giao diện sáng (giai đoạn sau). Đồng hồ và kết thúc ván thuộc Epic Hai người đánh cờ qua mạng.

## Các quy tắc quan trọng

- Đen ở trên (y=0), Đỏ ở dưới (y=9), **Đỏ đi trước**; người cầm Đen thấy bàn lật nhưng dữ liệu gốc không đổi.
- Luật viết **một lần** dùng chung. Hết nước đi là **thua**; hoà khi lặp thế lần ba (không bên nào chiếu liên tục) hoặc 120 nửa nước không ăn quân; chiếu hết được xét trước.
- Quân chỉ dùng **chữ Hán truyền thống**.
- Kiểm chứng luật bằng nguồn đối chiếu độc lập: số nước đi từ thế khởi đầu ở độ sâu 1–4 là 44, 1.920, 79.666, 3.290.240.

## Khi nào Epic được coi là xong

Từ thế khởi đầu, mọi nước đi sinh ra khớp nguồn đối chiếu độc lập; các thế chiếu hết, hết nước, lặp thế, 120 nửa nước cho kết quả đúng luật; trên trình duyệt bàn cờ đúng cho cả hai phe, bấm và kéo quân đều đi được, bị chiếu thì có cảnh báo, có âm thanh.

## Cần xong trước

Khung web và khối giao diện nền (Epic Đăng ký và đăng nhập, phần nền tảng).

## Task của Epic

- `T-05` — Luật cờ: mô hình bàn cờ, thế khởi đầu, nước đi của từng loại quân (Sprint 1)
- `T-09` — Luật cờ: nước hợp lệ, chiếu, chiếu hết, hết nước, lặp thế, 120 nửa nước (Sprint 1)
- `T-11` — Giao diện: bàn cờ SVG, quân chữ Hán, lật bàn cho phe Đen (Sprint 1)
- `T-18` — Giao diện: bấm chọn quân và chấm gợi ý ô đi (Sprint 2)
- `T-22` — Giao diện: kéo thả quân, đánh dấu nước vừa đi, cảnh báo chiếu, âm thanh (Sprint 2)
- `T-46` — Kiểm thử luật cờ: đếm nước đi độc lập và bộ kiểm thử chạy tự động (Sprint 3)

---

# EPIC 5 — Hai người đánh cờ qua mạng

## Yêu cầu được giao

Hai người đánh cờ qua mạng (online)

## Epic này làm gì

Cho hai người **đánh một ván cờ qua mạng**: đi nước (đồng bộ giữa hai trình duyệt), đồng hồ chạy, kết thúc ván (chiếu hết, hết giờ, đầu hàng, xin hoà), xử lý khi rớt mạng và nối lại, và đăng xuất giữa ván. **Máy chủ quyết định mọi thứ**.

## Ai dùng

Hai người chơi.

## Gồm những việc lớn nào (mỗi việc là một Story)

- Story 15 — Đi nước qua mạng và bảng nước đi
- Story 16 — Đồng hồ ván
- Story 17 — Kết thúc ván: kết quả, đầu hàng, xin hoà, lặp thế
- Story 18 — Rời phòng giữa ván, mất kết nối và kết nối lại

## Không làm trong Epic này

Tái đấu, xem lại ván, đi lại, điều kiện xin hoà của đánh hạng, giờ "không giới hạn", Elo.

## Các quy tắc quan trọng

- Lệnh gửi lại cùng mã chỉ có **một tác dụng**; lệnh dựa trên bản ván cũ bị từ chối; các lệnh của một ván xử lý **lần lượt**.
- Đồng hồ do **máy chủ** tính, không cộng giây; hết giờ thì thua. Xin hoà: một đề nghị mỗi lần, chờ 30 giây; bị từ chối phải đi thêm 5 nước mới xin lại.
- Rời giữa ván = đầu hàng. Mất kết nối: người chơi giữ chỗ **60 giây**; máy chủ khởi động lại thì ván **gián đoạn**.
- Hiệu năng: người xem nhận thế mới dưới **100 ms**; chịu **50 kết nối, 10 ván** cùng lúc.

## Khi nào Epic được coi là xong

Hai trình duyệt thật: hai người đi nước luân phiên, thế cờ giống nhau ở mọi nước; đồng hồ đúng, hết giờ thì thua; đầu hàng và xin hoà đủ các nhánh; ngắt mạng một bên: nối lại trước 60 giây thì tiếp tục, quá thì thua; bảng nước đi đúng ký hiệu tiếng Việt.

## Cần xong trước

Epic Tạo phòng chơi (ván bắt đầu từ phòng), Epic Khởi tạo bàn cờ (luật và bàn cờ).

## Task của Epic

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

## Yêu cầu được giao

Mở công khai cho mọi người xem hai người đánh, hoặc khoá lại không cho ai vào, hoặc khoá nhưng có mã phòng để người khác vào xem

## Epic này làm gì

Cho chủ phòng **chọn ai được thấy và được vào phòng**: **công khai** (hiện ở Sảnh để mọi người vào xem), **chỉ vào bằng mã**, hoặc **khoá** (không ai mới vào được); cho **người xem** theo dõi ván trực tiếp (tối đa theo cài đặt phòng); và quản lý phòng: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng.

## Ai dùng

Chủ phòng, người chơi và người xem.

## Gồm những việc lớn nào (mỗi việc là một Story)

- Story 19 — Kiểu phòng, khoá phòng và danh sách phòng công khai
- Story 20 — Quản lý phòng: đổi chỗ, đuổi người xem, chủ phòng rời, sau ván
- Story 21 — Người xem theo dõi trực tiếp

## Không làm trong Epic này

Xem lại ván, chat và camera cho người xem (Epic Chat, camera và micro).

## Các quy tắc quan trọng

- Phòng có **tối đa 5 người xem** (mặc định 5, chọn 0–5; cài đặt không đổi sau khi tạo). Khoá chỉ bật được khi **đủ 2 người chơi**; khoá thì phòng biến khỏi Sảnh, người mới không vào được, người đang có mặt **giữ nguyên**; mất ghế **không** tự mở khoá.
- Người đang có mặt mất mạng vào lại được: người chơi **60 giây**, người xem **5 phút**.
- Danh sách phòng công khai: mới nhất trước, **tối đa 50**.
- Người xem **chỉ đọc**, không thấy kênh chat riêng; đuổi người xem thì bị chặn đến khi phòng đóng.

## Khi nào Epic được coi là xong

Hai máy: An tạo phòng cho tối đa 2 người xem; Bình ngồi ghế; Chi và Dũng vào xem, người thứ ba bị từ chối; An khoá phòng, Em dùng mã không vào được; mở lại thì có mã mới, mã cũ vô hiệu; An đuổi Chi, Chi bị chặn; người xem thấy ván trực tiếp và không thấy kênh riêng.

## Cần xong trước

Epic Tạo phòng chơi (phòng và vào phòng), Epic Hai người đánh cờ qua mạng (ván để xem).

## Task của Epic

- `T-32` — Giao diện: cài đặt phòng, đổi chỗ ghế/xem, danh sách người xem, xác nhận đuổi (Sprint 3)
- `T-36` — Máy chủ: kiểu phòng (công khai, chỉ mã, khoá) và danh sách phòng ở Sảnh (Sprint 3)
- `T-38` — Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng (Sprint 3)
- `T-40` — Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời (Sprint 3)
- `T-44` — Máy chủ: người xem theo dõi trực tiếp, lọc dữ liệu theo vai trò (Sprint 3)

---

# EPIC 7 — Chat, camera và micro

## Yêu cầu được giao

Hai người vừa đánh cờ vừa chat, có camera và micro; có kênh chat cho người xem tách riêng với chat của hai người đánh

## Epic này làm gì

Cho người trong phòng **nhắn tin** (hai kênh: Riêng của hai người chơi, và Chung cho cả phòng gồm người xem) và cho hai người chơi **bật camera, micro** để thấy mặt, nghe tiếng nhau (qua dịch vụ LiveKit Cloud). Mọi thứ phải **đúng quyền**.

## Ai dùng

Người chơi và người xem.

## Gồm những việc lớn nào (mỗi việc là một Story)

- Story 22 — Chat hai kênh, giới hạn tin nhắn và lọc từ cấm
- Story 23 — Camera và micro: người chơi bật, người xem chỉ xem
- Story 24 — Mở nhiều tab: tab mới tiếp quản

## Không làm trong Epic này

Nhắn tin riêng giữa bạn bè, sticker, ghi hình hay ghi âm (giai đoạn sau).

## Các quy tắc quan trọng

- Kênh Riêng chỉ hai người ngồi ghế; Kênh Chung cho cả phòng; **người xem chỉ thấy Kênh Chung** (kênh chat của người xem tách riêng với chat của hai người đánh).
- Tin tối đa 200 ký tự, 5 tin/10 giây; từ cấm bị che `***` ở cả máy chủ và trình duyệt.
- Camera và micro **mặc định tắt**, bật tắt độc lập; **3 mức chia sẻ** (không chia sẻ / chỉ đối thủ / cả đối thủ và người xem). Người xem **không bao giờ được phát**. **Không ghi hình, ghi âm.**
- Mở tab mới thì tab mới tiếp quản, tab cũ chỉ đọc và dừng thiết bị.
- **Đã chốt:** đổi cặp người ngồi ghế thì người mới (và cả cặp mới) **không đọc** tin cũ của cặp trước.

## Khi nào Epic được coi là xong

Nhiều trình duyệt: hai người chat ở cả hai kênh; người xem chỉ thấy và gửi ở Kênh Chung và không nhận byte nào của Kênh Riêng; hai người bật camera và micro thấy và nghe nhau theo mức chia sẻ; đổi vai hoặc đuổi người xem thì mất quyền thật; mở tab mới thì tab cũ chỉ đọc; camera/micro hỏng không làm hỏng việc đi cờ và chat.

## Cần xong trước

Epic Tạo phòng chơi (phòng), Epic Phòng công khai, khoá phòng và người xem (đổi chỗ, đuổi), Epic Hai người đánh cờ qua mạng (đi nước để kiểm khi camera hỏng).

## Task của Epic

- `T-06` — Thử nghiệm LiveKit Cloud: camera/micro theo từng người, thu hồi quyền (Sprint 1)
- `T-41` — Máy chủ: chat hai kênh, quyền đọc, giới hạn tin, lọc từ cấm (Sprint 3)
- `T-49` — Giao diện chat hai kênh và nối web với máy chủ (Sprint 3)
- `T-51` — Giao diện: camera/micro, bật tắt độc lập, mức chia sẻ, thông báo quyền và lỗi (Sprint 4)
- `T-53` — Máy chủ: cấp quyền camera/micro theo vai và mở nhiều tab (tab mới tiếp quản) (Sprint 4)
- `T-57` — Nối camera/micro thật: theo đối tượng nhận, đổi vai, đuổi, tab (web, máy chủ, LiveKit) (Sprint 4)

---

# EPIC 8 — Đánh với máy theo cấp độ

## Yêu cầu được giao

Người đánh với máy theo từng cấp độ của máy

## Epic này làm gì

Cho người dùng **đánh cờ với máy** theo **từng cấp độ** (**Dễ, Trung bình, Khó**), tự chọn phe Đỏ, Đen hoặc ngẫu nhiên. Máy là chương trình **chạy riêng** khỏi máy chủ.

## Ai dùng

Người chơi đã đăng nhập (một mình).

## Gồm những việc lớn nào (mỗi việc là một Story)

- Story 25 — Chọn cấp độ, chọn phe và máy đi nước đúng luật
- Story 26 — Kết thúc ván với máy, vào lại ván và sự cố máy cờ

## Không làm trong Epic này

Gợi ý nước đi, đi lại, xin hoà, lưu lịch sử, tính điểm Elo (giai đoạn sau).

## Các quy tắc quan trọng

- Thời gian nghĩ tối đa: Dễ 300 ms, Trung bình 1.000 ms, Khó 3.000 ms. **Máy không bao giờ đi sai luật.**
- Ván với máy **không giới hạn thời gian** cho người chơi; không có xin hoà, không gợi ý nước.
- Đóng tab: giữ ván **30 phút**; chủ động rời hoặc đăng xuất thì đầu hàng ngay.
- Máy lỗi quá 10 giây → ván **Bỏ dở**, có nút **Thử lại** (ván mới cùng cấp, cùng phe đã bốc).
- Phải đạt tiêu chuẩn chất lượng máy cờ: p95 thời gian trong ngưỡng, tỷ lệ thắng cấp cao ≥ 75%, 1.000 ván không lỗi.

## Khi nào Epic được coi là xong

Người chơi chọn Khó và phe Đen, máy đi trước, bàn lật; đánh đến chiếu hết hoặc đầu hàng, hộp kết quả chỉ có Rời phòng; đóng tab rồi vào lại trước 30 phút thấy đúng thế, sau 30 phút là Bỏ dở; giết tiến trình máy thì báo sự cố và Thử lại tạo ván mới; báo cáo đo máy cờ đủ số liệu.

## Cần xong trước

Luật cờ (Epic Khởi tạo bàn cờ) và xử lý nước đi (Epic Hai người đánh cờ qua mạng).

## Task của Epic

- `T-31` — Máy cờ: chương trình chạy riêng, ba cấp độ, thử nghiệm sơ bộ tốc độ (Sprint 3)
- `T-37` — Giao diện: chọn cấp và phe, màn ván với máy, thông báo sự cố (Sprint 3)
- `T-43` — Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ (Sprint 3)
- `T-55` — Nối web, máy chủ và máy cờ thật: ván với máy (Sprint 4)
- `T-56` — Đo máy cờ đầy đủ (GATE-AI): tốc độ, độ sâu, sức mạnh, độ ổn định (Sprint 4)

---

# Task chung của dự án (không thuộc Epic nào, nhãn `chung`)

- `T-13` — Dựng khung kiểm thử tự động trên nhiều trình duyệt (Playwright) (Sprint 1)
- `T-16` — Dựng môi trường demo: chạy cục bộ trước, Render làm dự phòng (Sprint 2)
- `T-60` — Nghiệm thu từng tiêu chí giai đoạn 1 và chạy kịch bản demo D1–D10 (Sprint 4)
- `T-61` — Nghiệm thu phi chức năng: bài tải, quyền camera/micro, trình duyệt, bảo mật (Sprint 4)
- `T-62` — Chuẩn bị demo, sửa lỗi cuối, kiểm lại và bàn giao bằng chứng (Sprint 4)
