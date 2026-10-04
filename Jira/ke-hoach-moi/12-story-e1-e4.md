# Story của các Epic: "Đăng ký và đăng nhập (kèm nền tảng dự án)"; "Tạo phòng chơi"; "Mời bạn vào phòng chơi"; "Khởi tạo bàn cờ" (14 Story)

**Ngày:** 2026-10-04 · **Trạng thái:** đề xuất, chờ PO duyệt · Chưa tạo gì trên Jira · Viết theo `00-chuan-description.md` và mẫu `00b`.

**Cách đọc:** mỗi Story là một việc người dùng muốn làm. Story gộp nhiều việc nhỏ cùng một trải nghiệm được ghi "Phần 1, Phần 2…". Phần "Các việc nhỏ làm nên Story" liệt kê các Task được **liên kết** với Story (quan hệ "liên quan"; Task nằm dưới Epic).

---

### Story 1 — Đăng ký tài khoản qua ba bước
**Thuộc Epic:** Đăng ký và đăng nhập (kèm nền tảng dự án)

**Câu chuyện:** Là người mới, tôi muốn **đăng ký tài khoản qua ba bước** (tên đăng nhập và mật khẩu, email, mã OTP) để dùng được ứng dụng.

**Gồm những việc người dùng làm**
1. Đăng ký bước 1: chọn tên đăng nhập và mật khẩu
2. Đăng ký bước 2: nhập email và nhận mã OTP
3. Đăng ký bước 3: nhập mã OTP và hoàn tất tài khoản

**Điều kiện để dùng:**
- *Phần 1:* chưa đăng nhập; đang ở màn hình đăng ký.
- *Phần 2:* đã qua bước 1.
- *Phần 3:* đã nhận mã ở bước 2.

**Không thuộc Story này:**
- *Phần 1:* gửi mã OTP, tạo tài khoản, đổi tên đăng nhập sau này.
- *Phần 2:* nhập mã, đăng nhập bằng Google, quên mật khẩu.
- *Phần 3:* đăng nhập thường ngày (Story 2), đổi email.

**Các bước người dùng làm và hệ thống phản hồi**
*Phần 1:*
1. Người dùng gõ tên đăng nhập. Sau khi ngừng gõ khoảng 0,3 giây, hệ thống kiểm tra và báo "dùng được", "đã có người dùng" hoặc "không hợp lệ".
2. Người dùng gõ mật khẩu và gõ lại mật khẩu ở ô xác nhận.
3. Khi mọi thứ hợp lệ, nút **Tiếp tục** sáng; bấm thì sang bước 2.
*Phần 2:*
1. Người dùng nhập email, bấm gửi mã.
2. Hệ thống gửi **mã OTP 6 chữ số** tới email và chuyển sang bước 3.
3. Nếu chưa nhận được thư, người dùng bấm **Gửi lại mã** sau khi hết đếm ngược.
*Phần 3:*
1. Người dùng nhập mã 6 số trong vòng 3 phút.
2. Hệ thống kiểm tra mã, kiểm lại tên đăng nhập, tạo tài khoản, đặt tên hiển thị bằng tên đăng nhập.
3. Người dùng được tự đăng nhập và vào Sảnh.

**Các quy tắc**
*Phần 1:*
- Tên đăng nhập 3 đến 20 ký tự, chỉ gồm chữ không dấu, chữ số và dấu gạch dưới. Kiểm trùng **không phân biệt hoa thường** ("Twot" và "twot" là một).
- Mật khẩu từ 8 ký tự trở lên; ô xác nhận phải giống.
- Ở bước này **chưa tạo tài khoản nào** và **chưa giữ chỗ** tên đăng nhập.
*Phần 2:*
- Nếu email **đã có tài khoản hoàn tất** thì báo "Email này đã được đăng ký" và **không gửi** mã.
- Email mới, hoặc chỉ có bản đăng ký dở trước đó, thì được gửi mã.
- Nút **Gửi lại mã** mờ trong **60 giây** sau mỗi lần gửi, có đếm ngược và chú thích lý do.
- Hai yêu cầu gửi mã cho cùng một email cùng lúc phải xử lý **lần lượt**.
*Phần 3:*
- Mã hết hạn sau **180 giây**; hết hạn thì phải gửi lại.
- Nhập sai nhiều lần thì bị chặn (mức giới hạn của dịch vụ xác thực chỉ **gần đúng**, không đếm chính xác từng mã), phải chờ hoặc gửi lại mã.
- **Tài khoản chưa hoàn tất đăng ký thì không được dùng ứng dụng.** Nếu quy trình bị dừng giữa chừng sau khi đã ghi hồ sơ, tài khoản vẫn bị chặn cho đến khi được phục hồi; hồ sơ đã hoàn tất không bao giờ bị xoá nhầm.
- Tài khoản đăng ký dở bị dọn định kỳ (mỗi 5 phút, tài khoản chưa hoàn tất quá 60 phút bị xoá).
- Việc gửi lại, hoàn tất và dọn dẹp cùng một người được xử lý **lần lượt**.

**Khi có lỗi**
*Phần 1:*
- Tên đã có người dùng hoặc không hợp lệ: báo ngay tại ô, không cho tiếp tục.
- Mật khẩu dưới 8 ký tự hoặc hai ô khác nhau: báo lỗi ở ô, nút Tiếp tục mờ.
- Máy chủ lỗi khi kiểm tên: báo lỗi, **không** báo "dùng được" giả.
*Phần 2:*
- Email sai dạng: báo ngay, không gửi.
- Dịch vụ gửi thư hết hạn mức hoặc lỗi: báo lỗi thật, **không** báo "đã gửi".
*Phần 3:*
- Mã sai: báo sai. Mã hết hạn: báo hết hạn, mời gửi lại.
- Tên đăng nhập vừa bị người khác lấy trong lúc chờ: báo lỗi và **quay về bước 1**.
- Dừng đột ngột: tài khoản dở không dùng được; gửi lại cùng email thì dùng lại bản dở; không để kẹt email.

**Điều kiện chấp nhận**
*Phần 1:*
1. Tên 3 và 20 ký tự hợp lệ; 2 và 21 ký tự, có dấu cách hay dấu tiếng Việt thì báo không hợp lệ.
2. Tên chỉ khác hoa thường với tên đã có thì báo trùng và không cho tiếp tục.
3. Mật khẩu sai quy tắc thì không sang được bước 2.
4. Bỏ dở ở bước này thì không có bản ghi nào trong hệ thống.
*Phần 2:*
1. Email đã đăng ký thì không có thư nào được gửi và có thông báo đúng.
2. Email hợp lệ thì thư mã 6 chữ số đến hộp thư và màn hình sang bước 3.
3. Gửi lại sớm hơn 60 giây bị từ chối cả ở giao diện lẫn ở máy chủ.
4. Dịch vụ thư từ chối thì người dùng thấy lỗi thật.
*Phần 3:*
1. Nhập đúng mã thì có đúng một tài khoản hoàn tất, tên hiển thị = tên đăng nhập, đã đăng nhập và đang ở Sảnh.
2. Mã quá 180 giây hoặc sai thì không có tài khoản dùng được.
3. Bỏ dở trước khi xác minh thì không có hồ sơ dùng được và tên đăng nhập không bị giữ.
4. Hoàn tất và dọn dẹp chạy cùng lúc không xoá tài khoản vừa hoàn tất.
5. Người đã xác thực nhưng chưa hoàn tất, hoặc cố đổi email bằng cách gọi thẳng hệ thống đăng nhập, đều bị chặn.

**Các việc nhỏ làm nên Story:** T-03 (Cấu hình Supabase gửi mã OTP đăng ký); T-12 (Máy chủ: đăng ký bước 1 và 2 (kiểm tra tên đăng nhập, gửi mã OTP)); T-19 (Máy chủ: đăng ký bước 3 (xác minh mã, hoàn tất tài khoản)); T-23 (Thử nghiệm OTP thật; chặn người chưa hoàn tất đăng ký và chặn đổi email); T-24 (Giao diện: đăng ký ba bước, đăng nhập, hồ sơ, đăng xuất); T-27 (Nối web với máy chủ: đăng ký, đăng nhập, hồ sơ); T-35 (Máy chủ: tác vụ định kỳ dọn và phục hồi tài khoản đăng ký dở); T-60 (Nghiệm thu từng tiêu chí giai đoạn 1 và chạy kịch bản demo D1–D10); T-62 (Chuẩn bị demo, sửa lỗi cuối, kiểm lại và bàn giao bằng chứng).

---

### Story 2 — Đăng nhập bằng tên đăng nhập và mật khẩu
**Thuộc Epic:** Đăng ký và đăng nhập (kèm nền tảng dự án)

**Câu chuyện:** Là người đã có tài khoản, tôi muốn **đăng nhập** để vào chơi.

**Điều kiện để dùng:** có tài khoản đã hoàn tất.

**Khi có lỗi:** sai thông tin → thông báo chung; bị khoá → báo khoá tạm; phiên hết hạn hoặc bị thu hồi → về trang đăng nhập.

**Không thuộc Story này:** quên mật khẩu, đăng nhập Google và khách (giai đoạn sau).

**Các bước người dùng làm và hệ thống phản hồi**
1. Người dùng nhập tên đăng nhập, mật khẩu; chọn hoặc bỏ "Ghi nhớ đăng nhập" (mặc định chọn).
2. Bấm Đăng nhập; vào Sảnh (hoặc vào đúng phòng nếu đến từ đường dẫn mời).

**Các quy tắc**
- Đăng nhập sai chỉ báo **một thông báo chung** "Sai tên đăng nhập hoặc mật khẩu", không nói sai ô nào và **không lộ email**.
- "Ghi nhớ": phiên giữ **30 ngày**. Không ghi nhớ: hết khi đóng trình duyệt hoặc sau **12 giờ**.
- Sai 5 lần trong 15 phút thì khoá 15 phút.
- Nút đăng nhập khách và đăng nhập Google **mờ**, có chú thích "Sắp ra mắt".
- Đăng nhập khi đang đăng nhập ở nơi khác thì **nơi mới tiếp quản**; nơi cũ nhận thông báo và chuyển chỉ đọc.

**Điều kiện chấp nhận**
1. Đúng tên (khác hoa thường) và đúng mật khẩu thì vào được.
2. Hai trường hợp sai tên và sai mật khẩu cho cùng một thông báo.
3. Phiên hết hạn đúng 12 giờ hoặc 30 ngày theo lựa chọn.
4. Đăng nhập ở nơi mới thì nơi cũ thành chỉ đọc và không gửi được lệnh làm thay đổi.

**Các việc nhỏ làm nên Story:** T-20 (Máy chủ: đăng nhập, quản lý phiên và hồ sơ); T-24 (Giao diện: đăng ký ba bước, đăng nhập, hồ sơ, đăng xuất); T-27 (Nối web với máy chủ: đăng ký, đăng nhập, hồ sơ); T-53 (Máy chủ: cấp quyền camera/micro theo vai và mở nhiều tab (tab mới tiếp quản)).

---

### Story 3 — Hồ sơ cơ bản và đăng xuất
**Thuộc Epic:** Đăng ký và đăng nhập (kèm nền tảng dự án)

**Câu chuyện:** Là người dùng, tôi muốn **xem và đổi tên hiển thị** của mình và **đăng xuất** khi cần.

**Điều kiện để dùng:** đã đăng nhập.

**Khi có lỗi:** tên không hợp lệ hoặc có từ cấm → báo lý do; đăng xuất giữa ván lỗi hoặc chưa rõ → giữ trạng thái chờ hoặc lỗi, đối soát bằng mã yêu cầu cũ, không tạo hai kết quả.

**Không thuộc Story này:** đổi email, đổi tên đăng nhập, ảnh đại diện tuỳ chọn.

**Các bước người dùng làm và hệ thống phản hồi**
1. Mở trang Hồ sơ; xem tên hiển thị, tên đăng nhập, email.
2. Sửa tên hiển thị, bấm lưu.
3. Bấm Đăng xuất; phiên bị xoá, về trang đăng nhập.

**Các quy tắc**
- Tên hiển thị 2 đến 30 ký tự (có dấu, có khoảng trắng); chứa từ cấm thì không lưu.
- **Tên đăng nhập và email hiển thị nhưng không sửa được** (nút đổi tên đăng nhập mờ "Sắp ra mắt").
- Ảnh đại diện luôn là chữ cái đầu của tên; không tải ảnh lên.
- **Đăng xuất khi đang trong ván:** có hộp xác nhận "đăng xuất sẽ xử thua"; đồng ý thì xử thua rồi rời phòng rồi mới đăng xuất; ván với máy thì huỷ ván. Bấm Huỷ thì giữ nguyên. Chỉ báo hoàn tất khi máy chủ đã nhận.
- Đóng tab hay mất mạng **không** phải chủ động đầu hàng; theo quy tắc giữ chỗ.

**Điều kiện chấp nhận**
1. Tên 2 và 30 ký tự lưu được; 1 và 31 ký tự, hay chứa từ cấm thì bị từ chối.
2. Tên đăng nhập, email không sửa được, kể cả khi gửi thêm dữ liệu.
3. Đăng xuất bình thường thì xoá phiên; trong ván thì xử thua đúng quy trình, đối thủ thấy thắng.
4. Bấm Huỷ ở hộp xác nhận thì không có gì thay đổi.

**Các việc nhỏ làm nên Story:** T-10 (Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ); T-20 (Máy chủ: đăng nhập, quản lý phiên và hồ sơ); T-23 (Thử nghiệm OTP thật; chặn người chưa hoàn tất đăng ký và chặn đổi email); T-24 (Giao diện: đăng ký ba bước, đăng nhập, hồ sơ, đăng xuất); T-27 (Nối web với máy chủ: đăng ký, đăng nhập, hồ sơ); T-48 (Đăng xuất giữa ván: xác nhận, đầu hàng, rời phòng rồi đăng xuất).

---

### Story 4 — Giao diện nhất quán: đủ 5 trạng thái, dùng được trên điện thoại, trợ năng, tính năng chưa làm
**Thuộc Epic:** Đăng ký và đăng nhập (kèm nền tảng dự án)

**Câu chuyện:** Là người dùng, tôi muốn **mọi màn hình trông và hoạt động thống nhất**: luôn biết đang tải, trống, lỗi hay bị khoá; dùng được trên điện thoại và bằng bàn phím; và không bấm nhầm vào chức năng chưa làm.

**Gồm những việc người dùng làm**
1. Đủ 5 trạng thái cho mọi màn hình
2. Dùng được trên màn hình nhỏ và cảm ứng
3. Trợ năng
4. Tính năng chưa làm hiển thị đúng quy tắc

**Quy tắc:**
- *Phần 1:* mỗi màn hình và khung dữ liệu có đủ **Thành công; Đang tải** (khung xương, không để trắng, không giật bố cục); **Trống** (giải thích và nút hành động); **Lỗi** (tiếng Việt dễ hiểu, nút "Thử lại"); **Bị khoá** (luôn có chú thích lý do).
- *Phần 2:* không cuộn ngang; bàn cờ chơi được bằng cảm ứng; vùng chạm tối thiểu 44 px; camera và chat có thể thu thành thẻ; kiểm ở 360×800, 390×844, 1366×768, 1920×1080.
- *Phần 3:* đạt WCAG 2.1 AA: tương phản chữ thường ≥ 4,5:1, chữ lớn và thành phần ≥ 3:1; điều khiển bằng bàn phím có viền focus; nhãn cho nút chỉ có biểu tượng; "giảm chuyển động" tắt hiệu ứng; thông báo quan trọng dùng vùng đọc tự động, không đọc từng giây của đếm lùi; **không truyền thông tin chỉ bằng màu**.
- *Phần 4:* lối vào chính của tính năng chưa làm **mờ kèm "Sắp ra mắt"** (Đánh Hạng, Bảng xếp hạng, Lịch sử, khách, Google, Nhắn tin, Thách đấu); chức năng nằm sâu **ẩn hẳn** (mã QR, sticker, xin đi lại, xin đổi bên, tái đấu, xem lại ván, trợ giúp của máy, bộ chọn giao diện); giao diện luôn tối "Kỳ Đài Cổ Phong", không tự theo hệ điều hành.

**Điều kiện chấp nhận:**
- *Phần 1:* tải chậm, không dữ liệu, lỗi, thiếu quyền, đạt giới hạn, đã kết thúc đều hiện đúng; không báo thành công giả; các hộp thoại và lớp phủ đúng quy tắc phím Esc và focus.
- *Phần 2:* duyệt đủ trạng thái ở bốn cỡ không tràn ngang, không che điều khiển; chạm và kéo thả đúng ở cả hai phe.
- *Phần 3:* đo tương phản thật đạt; duyệt bàn phím không kẹt; có nhãn và dấu ngoài màu.
- *Phần 4:* bấm hay dùng bàn phím vào mục chưa làm không mở được gì; các màn của giai đoạn 1 không có nút của chức năng chưa làm; Bạn bè và mời bạn online vẫn hoạt động.

**Các việc nhỏ làm nên Story:** T-08 (Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)); T-11 (Giao diện: bàn cờ SVG, quân chữ Hán, lật bàn cho phe Đen); T-13 (Dựng khung kiểm thử tự động trên nhiều trình duyệt (Playwright)); T-14 (Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng); T-58 (Giao diện: đủ 5 trạng thái cho mọi màn hình; tính năng chưa làm hiển thị đúng quy tắc); T-59 (Giao diện: dùng được từ 360 px và bằng cảm ứng; trợ năng); T-61 (Nghiệm thu phi chức năng: bài tải, quyền camera/micro, trình duyệt, bảo mật).

---

### Story 5 — Tạo phòng
**Thuộc Epic:** Tạo phòng chơi

**Câu chuyện:** Là người chơi đã đăng nhập, tôi muốn **tạo một phòng cờ với thiết lập của mình** để mời bạn vào chơi.

**Điều kiện để dùng:** đã đăng nhập, đang ở Sảnh, chưa ngồi ghế ở phòng hay ván nào khác.

**Khi có lỗi:** tên sai → báo dưới ô tên, giữ thông tin đã điền; đang có chỗ chơi → nút Tạo mờ có chú thích, máy chủ cũng từ chối; tạo quá nhanh → báo "tạo phòng quá nhanh"; mất mạng rồi gửi lại → **không** tạo hai phòng.

**Không thuộc Story này:** mời người, ngồi ghế, bắt đầu ván, khoá phòng.

**Các bước người dùng làm và hệ thống phản hồi**
1. Bấm **Tạo phòng**; hiện biểu mẫu.
2. Điền tên phòng, thời gian mỗi bên (5, 10 hoặc 15 phút, mặc định 10), kiểu phòng (công khai hoặc chỉ vào bằng mã), số người xem tối đa (không có, 1, 2, 3, 4 hoặc 5; mặc định 5).
3. Bấm Tạo; hệ thống tạo phòng, người dùng thành **chủ phòng** ngồi ghế Đỏ.
4. Màn hình chuyển vào phòng chờ, hiện **mã phòng 8 ký tự**.

**Các quy tắc**
- Tên phòng 1 đến 60 ký tự, không chứa từ cấm. Không có kiểu "khoá" lúc tạo.
- Thời gian và số người xem **không đổi được** sau khi tạo.
- Mỗi người chỉ một chỗ chơi cùng lúc. Tạo tối đa 5 phòng trong 10 phút.
- Phòng chỉ coi là đã tạo khi **máy chủ xác nhận**.

**Điều kiện chấp nhận**
1. Điền đúng và bấm Tạo thì có đúng **một** phòng; người tạo ngồi ghế Đỏ, là chủ phòng.
2. Phòng có mã 8 ký tự; hai phòng không bao giờ trùng mã.
3. Giờ và số người xem giữ đúng lựa chọn và không sửa được.
4. Người đang có chỗ chơi khác không tạo được (kể cả khi bỏ qua giao diện).
5. Bấm Tạo hai lần hoặc gửi lại khi mất mạng vẫn chỉ có một phòng.

**Các việc nhỏ làm nên Story:** T-04 (Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập); T-10 (Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ); T-14 (Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng); T-17 (Máy chủ: trạng thái phòng, mỗi người một chỗ chơi và tạo phòng); T-29 (Nối web với máy chủ: tạo phòng, vào phòng, ghế, Sẵn sàng, bắt đầu ván).

---

### Story 6 — Thanh điều hướng và Sảnh
**Thuộc Epic:** Tạo phòng chơi

**Câu chuyện:** Là người dùng đã đăng nhập, tôi muốn **một thanh điều hướng và một trang chính (Sảnh)** để làm mọi việc: tạo phòng, vào phòng, chơi với máy, quay lại ván dở.

**Gồm những việc người dùng làm**
1. Thanh điều hướng
2. Sảnh

**Các bước và phản hồi:**
- *Phần 1:* thanh cố định đầu trang có logo, Sảnh, Bạn bè, chuông lời mời, ảnh đại diện và tên với menu Hồ sơ và Đăng xuất. Bảng xếp hạng và Lịch sử **mờ** kèm "Sắp ra mắt".
- *Phần 2:* Sảnh có Tạo phòng, Vào phòng bằng mã, Danh sách phòng công khai, ba thẻ Đánh với máy; thẻ Đánh Hạng mờ "Sắp ra mắt"; ghép ngẫu nhiên ẩn. Có ván hoặc phòng dở thì hiện băng quay lại và các nút tạo mờ có chú thích. Có mục **Luật chơi** thu gọn được.

**Điều kiện chấp nhận:**
- *Phần 1:* mở Sảnh, Bạn bè, Hồ sơ đúng trang; mục chưa làm không kích hoạt được; dùng được bằng bàn phím.
- *Phần 2:* đủ các chức năng trên; băng quay lại và nút mờ đúng; mở và thu Luật chơi bằng bàn phím được.

**Quy tắc:**
- *Phần 2:* Luật chơi nêu hết nước đi là thua và chưa có luật đuổi quân riêng; không thêm trang hay hộp thoại mới.

**Các việc nhỏ làm nên Story:** T-14 (Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng).

---

### Story 7 — Phòng chờ, hai ghế ngồi, Sẵn sàng và bắt đầu ván
**Thuộc Epic:** Tạo phòng chơi

**Câu chuyện:** Là người chơi, tôi muốn **thấy phòng chờ với hai ghế, bấm Sẵn sàng và để ván tự bắt đầu** khi cả hai đã sẵn sàng.

**Gồm những việc người dùng làm**
1. Phòng chờ và hai ghế ngồi
2. Bấm Sẵn sàng và bắt đầu ván

**Điều kiện để dùng:**
- *Phần 1:* đã ở trong một phòng.
- *Phần 2:* phòng đủ hai người ngồi ghế.

**Các quy tắc:**
- *Phần 1:* mỗi ghế chỉ một người; mọi quyết định do máy chủ làm.
- *Phần 2:* nếu ai bỏ Sẵn sàng hoặc rời đi trong lúc đếm thì **huỷ đếm**, không tạo ván; đồng hồ do máy chủ tính; một lần chỉ tạo một ván.

**Khi có lỗi:**
- *Phần 1:* hai người tranh ghế cuối → chỉ một người được.
- *Phần 2:* ghi dữ liệu lỗi → không báo "bắt đầu" giả, hoàn tác.

**Không thuộc Story này:**
- *Phần 1:* bắt đầu ván (B3), đổi chỗ giữa ghế và chỗ xem (B6).
- *Phần 2:* đi nước và luật cờ (Epic Hai người đánh cờ qua mạng), xin đổi bên, tái đấu.

**Các bước người dùng làm và hệ thống phản hồi**
*Phần 1:*
1. Chủ phòng mặc định ngồi ghế Đỏ. Khi còn **một mình**, chủ phòng đổi sang ghế Đen hoặc đổi lại bao nhiêu lần cũng được.
2. Người thứ hai vào phòng thì tự xếp vào **ghế còn trống**.
3. Khi người ngồi ghế thay đổi, trạng thái "Sẵn sàng" của cả hai **về chưa sẵn sàng**.
*Phần 2:*
1. Mỗi người bật hoặc tắt **Sẵn sàng** tuỳ ý.
2. Khi cả hai cùng sẵn sàng: đếm ngược **3, 2, 1** (có tiếng gỗ).
3. Hết đếm: tạo ván mới, hai người chuyển sang màn hình ván; **đồng hồ của bên Đỏ bắt đầu chạy**.

**Điều kiện chấp nhận**
*Phần 1:*
1. Hai ghế hiển thị đúng người, đúng phe, đúng chủ phòng.
2. Chủ phòng đổi ghế khi một mình được; khi có người thứ hai thì không đổi một mình.
3. Thay người ngồi ghế thì hai bên về chưa sẵn sàng.
*Phần 2:*
1. Hai người sẵn sàng đủ 3 giây thì có một ván, thế cờ ban đầu, lượt Đỏ, hai màn hình cùng vào màn ván.
2. Chỉ đồng hồ Đỏ chạy trước nước đầu; Đen chưa giảm.
3. Bỏ Sẵn sàng trước hết đếm thì không có ván và không có đồng hồ ma.
4. Người xem không bấm được Sẵn sàng.

**Các việc nhỏ làm nên Story:** T-15 (Giao diện: phòng chờ và màn từ chối vào phòng); T-17 (Máy chủ: trạng thái phòng, mỗi người một chỗ chơi và tạo phòng); T-25 (Máy chủ: chọn ghế, Sẵn sàng, đếm 3 giây, bắt đầu ván); T-29 (Nối web với máy chủ: tạo phòng, vào phòng, ghế, Sẵn sàng, bắt đầu ván); T-50 (Nối web với máy chủ: đồng hồ, kết thúc ván, mất kết nối, người xem, bảng nước đi).

---

### Story 8 — Vào phòng bằng mã, đường dẫn hoặc từ Sảnh
**Thuộc Epic:** Tạo phòng chơi

**Câu chuyện:** Là người chơi, tôi muốn **vào một phòng** bằng mã, đường dẫn hoặc từ danh sách ở Sảnh, và nếu không vào được thì **biết rõ lý do**.

**Gồm những việc người dùng làm**
1. Vào phòng bằng mã, đường dẫn hoặc từ Sảnh
2. Màn hình "không vào được phòng"

**Điều kiện để dùng:**
- *Phần 1:* đã đăng nhập và chưa có chỗ chơi khác.
- *Phần 2:* vào phòng thất bại.

**Khi có lỗi:**
- *Phần 1:* phòng đầy → màn "không vào được" với lý do; mã không có → báo không tìm thấy, **không** tự sửa sang phòng khác.

**Không thuộc Story này:**
- *Phần 1:* tự xuống ghế từ vai xem (B6), mã QR, khách.
- *Phần 2:* vào phòng thành công.

**Các quy tắc:**
- *Phần 2:* nội dung thông báo theo từng lý do; không lộ thông tin phòng cho người không có quyền.

**Các bước người dùng làm và hệ thống phản hồi**
*Phần 1:*
1. Nhập mã 8 ký tự ở Sảnh hoặc mở đường dẫn.
2. Còn ghế trống thì **vào ngồi ghế**; hết ghế mà còn chỗ xem thì vào **làm người xem** kèm thông báo.
3. Vào từ **danh sách phòng ở Sảnh** (nút "Vào xem") thì **luôn là người xem**.
*Phần 2:*
1. Màn hình hiện lý do: phòng đầy ("Phòng thi đấu đã đầy người, vui lòng chọn phòng khác!"), bị đuổi, phòng khoá.
2. Chỉ có **một nút**: Quay về Sảnh.

**Các quy tắc**
*Phần 1:*
- Sức chứa = 2 người chơi + số người xem tối đa của phòng (tối đa 7 người); nhiều yêu cầu cùng lúc cũng không vượt.
- Nhập sai mã 10 lần trong 1 phút thì bị chặn 5 phút.
- Người bị đuổi hoặc phòng khoá thì bị từ chối.

**Điều kiện chấp nhận**
*Phần 1:*
1. Còn ghế → vào ghế; hết ghế còn chỗ xem → người xem có thông báo.
2. Phòng đầy hoặc số người xem là 0 → từ chối; hai người tranh chỗ cuối thì chỉ một người vào.
3. Vào từ Sảnh khi còn ghế vẫn là người xem.
4. Bị đuổi hoặc phòng khoá thì không vào được.
5. Gửi lại yêu cầu vào khi mất phản hồi không xếp thêm chỗ.
*Phần 2:*
1. Mỗi lý do có đúng một thông báo và một nút.
2. Đủ 5 trạng thái, dùng được bằng bàn phím.

**Các việc nhỏ làm nên Story:** T-14 (Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng); T-15 (Giao diện: phòng chờ và màn từ chối vào phòng); T-21 (Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh); T-29 (Nối web với máy chủ: tạo phòng, vào phòng, ghế, Sẵn sàng, bắt đầu ván); T-47 (Nối web với máy chủ: bấm đường dẫn mời, đăng nhập rồi vào đúng phòng); T-52 (Máy chủ: mời bạn đang online vào phòng).

---

### Story 9 — Chia sẻ phòng bằng đường dẫn và mã; người được mời đăng nhập xong vào đúng phòng
**Thuộc Epic:** Mời bạn vào phòng chơi

**Câu chuyện:** Là người ngồi ghế, tôi muốn **gửi đường dẫn hoặc mã phòng** cho bạn; và là người được mời, tôi muốn **bấm đường dẫn, đăng nhập (hoặc đăng ký) xong là vào đúng phòng**.

**Gồm những việc người dùng làm**
1. Chia sẻ phòng bằng đường dẫn và mã
2. Đăng nhập xong thì vào đúng phòng được mời

**Điều kiện để dùng:**
- *Phần 1:* đang ngồi ghế trong phòng.
- *Phần 2:* có đường dẫn mời của một phòng.

**Khi có lỗi:**
- *Phần 1:* sao chép bị từ chối quyền → không báo "đã sao chép" giả, vẫn có cách dùng thủ công.
- *Phần 2:* phòng đã đóng, đầy hoặc khoá → báo lý do rõ và về Sảnh.

**Không thuộc Story này:**
- *Phần 1:* mời bạn bè đang online (Epic Mời bạn vào phòng chơi), vào phòng (B5).
- *Phần 2:* tạo phòng, các quy tắc vào phòng.

**Các bước người dùng làm và hệ thống phản hồi**
*Phần 1:*
1. Bấm nút mời; hiện hộp thoại có **đường dẫn** và **mã 8 ký tự**, kèm nút sao chép.
2. Người dùng sao chép và gửi cho bạn.
*Phần 2:*
1. Chưa đăng nhập mà mở đường dẫn: thấy màn đăng nhập hoặc đăng ký (hệ thống nhớ phòng cần vào).
2. Đăng nhập hoặc đăng ký xong: tự vào đúng phòng.
3. Đã đăng nhập sẵn thì vào thẳng phòng.

**Các quy tắc**
*Phần 1:*
- **Chỉ người đang ngồi ghế** mở được hộp thoại mời. Đường dẫn và mã cho **cùng một quyền**, không có đường dẫn riêng "xem" hay "chơi".
- Không có mã QR ở giai đoạn này (ẩn hẳn).
- Khi phòng bị **khoá**, đường dẫn và mã chưa dùng hết hiệu lực; mở khoá thì có **mã và đường dẫn mới**.
*Phần 2:*
- Vào ghế hay chỗ xem do quy tắc vào phòng quyết định (xem Story 8).
- Chỉ chuyển tới **phòng trong hệ thống**, không chuyển tới địa chỉ lạ.
- Đang có ván dở thì đưa vào lại ván thay vì phòng mới.

**Điều kiện chấp nhận**
*Phần 1:*
1. Người ngồi ghế thấy đường dẫn và mã; người xem và người ngoài không thấy.
2. Mất ghế khi hộp đang mở thì phần mời biến mất.
3. Khoá phòng rồi mở lại thì mã cũ vô hiệu, mã mới dùng được.
4. Không có nút mã QR.
*Phần 2:*
1. Mở đường dẫn khi chưa đăng nhập, đăng nhập xong thì vào đúng phòng.
2. Đăng ký mới từ đường dẫn mời thì hoàn tất xong cũng vào đúng phòng.
3. Có ván dở thì vào lại ván.
4. Phòng không còn hoặc đường dẫn trỏ ra ngoài hệ thống thì không chuyển đi và về Sảnh.

**Các việc nhỏ làm nên Story:** T-15 (Giao diện: phòng chờ và màn từ chối vào phòng); T-17 (Máy chủ: trạng thái phòng, mỗi người một chỗ chơi và tạo phòng); T-29 (Nối web với máy chủ: tạo phòng, vào phòng, ghế, Sẵn sàng, bắt đầu ván); T-36 (Máy chủ: kiểu phòng (công khai, chỉ mã, khoá) và danh sách phòng ở Sảnh); T-47 (Nối web với máy chủ: bấm đường dẫn mời, đăng nhập rồi vào đúng phòng); T-60 (Nghiệm thu từng tiêu chí giai đoạn 1 và chạy kịch bản demo D1–D10).

---

### Story 10 — Kết bạn: tìm người, gửi và trả lời lời mời, giới hạn
**Thuộc Epic:** Mời bạn vào phòng chơi

**Câu chuyện:** Là người dùng, tôi muốn **tìm người, gửi và nhận lời mời kết bạn** để có danh sách bạn.

**Gồm những việc người dùng làm**
1. Tìm người và gửi lời mời kết bạn
2. Nhận và trả lời lời mời kết bạn
3. Giới hạn bạn bè

**Điều kiện để dùng:**
- *Phần 1:* đã đăng nhập.
- *Phần 2:* đang có lời mời chờ.
- *Phần 3:* đang kết bạn.

**Các quy tắc:**
- *Phần 1:* tìm **không phân biệt hoa thường**; **không hiện email**; lời mời tự **hết hạn sau 30 ngày**.
- *Phần 2:* bị **cùng một người từ chối 2 lần** thì người đó không gửi lại được; **thu hồi hoặc hết hạn không tính là từ chối**; hai lời mời ngược chiều cùng lúc chỉ giữ **một** lời mời chờ, **không tự thành bạn**.
- *Phần 3:* máy chủ kiểm tra **cả hai tài khoản** khi gửi và khi chấp nhận để hai yêu cầu cùng lúc không vượt trần; hai lời mời ngược chiều cùng lúc chỉ giữ một.

**Khi có lỗi:**
- *Phần 1:* đã đủ giới hạn bạn hoặc lời mời → nút mờ có chú thích; máy chủ cũng chặn.

**Không thuộc Story này:**
- *Phần 1:* nhắn tin 1-1.
- *Phần 2:* chặn người dùng.
- *Phần 3:* tăng giới hạn theo cấp độ.

**Các bước người dùng làm và hệ thống phản hồi**
*Phần 1:*
1. Gõ phần đầu tên đăng nhập; kết quả hiện thẻ (ảnh đại diện, tên hiển thị, tên đăng nhập) và nút **Kết bạn**.
2. Bấm Kết bạn: gửi lời mời. Có thể **thu hồi** lời mời đã gửi.
*Phần 2:*
1. Chuông ở thanh điều hướng liệt kê lời mời đang chờ.
2. **Chấp nhận** → thành bạn **hai chiều**. **Từ chối** → **không báo** cho người gửi.
*Phần 3:*
1. Mỗi người tối đa **200 bạn** và **50 lời mời đang chờ** (cộng cả gửi và nhận).
2. Vượt giới hạn thì nút gửi mờ có chú thích; máy chủ cũng chặn.

**Điều kiện chấp nhận**
*Phần 1:*
1. Tìm theo phần đầu, khác hoa thường, ra đúng thẻ, không có email.
2. Gửi, thu hồi, hết hạn đúng trạng thái.
3. Người khác không thu hồi được lời mời của mình.
*Phần 2:*
1. Chấp nhận thì cả hai thấy nhau trong danh sách bạn.
2. Từ chối hai lần thì chặn gửi tiếp đúng chiều.
3. Người ngoài không trả lời thay được; gửi lại yêu cầu từ chối chỉ đếm một lần.
*Phần 3:*
1. 199 và 200 bạn, 49 và 50 lời mời: không vượt trần ở cả hai đầu dù gửi hay chấp nhận cùng lúc.
2. Gửi chéo chỉ còn một lời mời chờ, không tự thành bạn.

**Các việc nhỏ làm nên Story:** T-33 (Giao diện: bạn bè (tìm, lời mời, danh sách, mời vào phòng)); T-34 (Máy chủ: kết bạn, lời mời và danh sách bạn có trạng thái); T-54 (Nối web với máy chủ: bạn bè).

---

### Story 11 — Danh sách bạn và trạng thái
**Thuộc Epic:** Mời bạn vào phòng chơi

**Câu chuyện:** Là người dùng, tôi muốn **xem bạn nào đang online, đang đấu hay ngoại tuyến**.

**Điều kiện để dùng:** đã có bạn.

**Không thuộc Story này:** lịch sử đấu, Elo.

**Các bước người dùng làm và hệ thống phản hồi**
1. Trang Bạn bè hiện từng người: ảnh đại diện, tên, tên đăng nhập và trạng thái: **Online**, **Đang đấu**, **Ngoại tuyến**.
2. Có thể **huỷ kết bạn**; hai bên không còn là bạn.

**Các quy tắc**
- **Đang đấu** = đang giữ ghế phòng (đang chờ, đang chơi **hoặc đã kết thúc mà chưa rời**) hoặc đang chơi với máy.
- Nút **Nhắn tin** và **Thách đấu** mờ "Sắp ra mắt"; **không có nút mời vào phòng** ở trang này.
- Chưa hiển thị điểm Elo.

**Điều kiện chấp nhận**
1. Trạng thái phản ánh đúng dữ liệu máy chủ khi bạn đăng nhập, vào ván, rời, ngắt mạng.
2. Huỷ kết bạn làm cả hai mất nhau.
3. Không xem được danh sách của người khác.

**Các việc nhỏ làm nên Story:** T-33 (Giao diện: bạn bè (tìm, lời mời, danh sách, mời vào phòng)); T-34 (Máy chủ: kết bạn, lời mời và danh sách bạn có trạng thái); T-54 (Nối web với máy chủ: bạn bè).

---

### Story 12 — Mời bạn đang online vào phòng
**Thuộc Epic:** Mời bạn vào phòng chơi

**Câu chuyện:** Là người đang ngồi ghế, tôi muốn **mời một người bạn đang online** vào phòng của mình.

**Điều kiện để dùng:** đang ngồi ghế trong phòng; có bạn đang online.

**Các quy tắc:** lời mời **không giữ chỗ**; máy chủ **kiểm lại mọi điều kiện** khi người nhận bấm Tham gia (còn là bạn, có bận không, phòng khoá, hết chỗ…).

**Không thuộc Story này:** nút mời ở trang Bạn bè, thách đấu.

**Các bước người dùng làm và hệ thống phản hồi**
1. Người ngồi ghế mở hộp thoại mời của phòng; danh sách bạn hiện trạng thái; nút **Mời** chỉ sáng với bạn **Online**.
2. Bạn **Đang đấu** thì nút mờ "Bạn bè đang trong ván khác"; bạn ngoại tuyến có nhãn "Ngoại tuyến".
3. Người được mời thấy thông báo "[Tên] mời bạn tham gia phòng cờ [Tên phòng]" có nút **Tham gia** và **Từ chối**, **đếm lùi 30 giây** rồi tự tắt.
4. Bấm Tham gia thì vào phòng theo quy tắc vào phòng.

**Điều kiện chấp nhận**
1. Người ngồi ghế mời được bạn online; người xem không mời được.
2. Bạn đang giữ chỗ chơi (ghế hoặc ván với máy) không nhận được lời mời, kiểm ở máy chủ.
3. Quá 30 giây, phòng khoá hay mã mới thì không vào được trái quyền.
4. Hai người cùng tham gia chỗ cuối thì chỉ một vào.

**Các việc nhỏ làm nên Story:** T-33 (Giao diện: bạn bè (tìm, lời mời, danh sách, mời vào phòng)); T-52 (Máy chủ: mời bạn đang online vào phòng); T-54 (Nối web với máy chủ: bạn bè); T-60 (Nghiệm thu từng tiêu chí giai đoạn 1 và chạy kịch bản demo D1–D10); T-62 (Chuẩn bị demo, sửa lỗi cuối, kiểm lại và bàn giao bằng chứng).

---

### Story 13 — Thấy bàn cờ và quân cờ
**Thuộc Epic:** Khởi tạo bàn cờ

**Câu chuyện:** Là người chơi, tôi muốn **thấy bàn cờ tướng đúng chuẩn** (khởi tạo đúng thế, đúng cho cả hai phe) để chơi và xem.

**Điều kiện để dùng:** đang ở màn hình ván (hoặc ván với máy).

**Khi có lỗi:** đang tải/lỗi/chưa có nước/chỉ đọc đều có trạng thái riêng (đủ 5 trạng thái).

**Không thuộc Story này:** chọn quân, đi nước, kéo thả.

**Các bước người dùng làm và hệ thống phản hồi**
1. Màn hình hiện bàn cờ 9 cột × 10 hàng, quân đặt trên các **giao điểm**, ở thế khởi đầu đúng chuẩn.
2. Người cầm quân Đen thấy bàn **lật ngược** để quân mình ở phía dưới.

**Các quy tắc**
- Quân chỉ dùng **chữ Hán truyền thống** (帥仕相傌俥炮兵 và 將士象馬車砲卒); không chữ Việt hay Latin trên mặt quân.
- Hai phe phân biệt không chỉ bằng màu.
- Mỗi quân có nhãn cho trình đọc màn hình theo toạ độ gốc.
- Bàn co giãn theo màn hình; dùng được từ 360 px.

**Điều kiện chấp nhận**
1. Thế khởi đầu đúng 32 quân, đúng ô.
2. Lật bàn cho phe Đen mà dữ liệu gốc không đổi.
3. Nhãn đọc màn hình theo toạ độ gốc.

**Các việc nhỏ làm nên Story:** T-05 (Luật cờ: mô hình bàn cờ, thế khởi đầu, nước đi của từng loại quân); T-11 (Giao diện: bàn cờ SVG, quân chữ Hán, lật bàn cho phe Đen).

---

### Story 14 — Tương tác với quân cờ: chọn, kéo thả, đánh dấu nước đi, cảnh báo chiếu, âm thanh
**Thuộc Epic:** Khởi tạo bàn cờ

**Câu chuyện:** Là người chơi, tôi muốn **chọn quân, kéo thả quân, thấy nước vừa đi, biết khi bị chiếu và nghe tiếng quân** như chơi cờ thật.

**Gồm những việc người dùng làm**
1. Bấm chọn quân và xem gợi ý ô đi
2. Kéo thả quân
3. Đánh dấu nước vừa đi và cảnh báo chiếu
4. Âm thanh và nút tắt tiếng

**Điều kiện để dùng:**
- *Phần 1:* đến lượt mình trong ván.
- *Phần 2:* đến lượt mình.
- *Phần 3:* có ít nhất một nước đã đi.
- *Phần 4:* đang ở màn hình ván.

**Các quy tắc:**
- *Phần 1:* chỉ chọn được quân của mình và chỉ khi đến lượt mình; người xem và ván đã kết thúc là chỉ đọc (có giải thích); các nước đi sẽ làm lộ Tướng không hiện chấm.
- *Phần 2:* kéo thả và bấm dùng song song, cho cùng kết quả; dùng được bằng cảm ứng; bật "giảm chuyển động" thì quân về ngay, không hiệu ứng.
- *Phần 3:* cảnh báo **không nhấp nháy, không rung** (tối đa một nhịp sáng khi vừa bị chiếu; tắt khi bật giảm chuyển động); **không chỉ truyền thông tin bằng màu**.
- *Phần 4:* âm tạo bằng Web Audio, **không tải tệp âm thanh**; nhận lại cùng thế cờ thì không phát lại; trình duyệt chưa cho phát âm thì xử lý êm, không làm lỗi ván.

**Khi có lỗi:**
- *Phần 1:* thế cờ mới đến giữa chừng thì bỏ lựa chọn cũ.
- *Phần 2:* đang kéo thì mất lượt hoặc mất quyền → huỷ kéo, không gửi gì.
- *Phần 3:* nhận lại cùng một thế cờ thì không chồng hiệu ứng.

**Không thuộc Story này:**
- *Phần 1:* kéo thả (C3), gợi ý nước hay.
- *Phần 2:* nối mạng.
- *Phần 3:* âm thanh (C5).
- *Phần 4:* nhạc nền.

**Các bước người dùng làm và hệ thống phản hồi**
*Phần 1:*
1. Bấm quân mình: quân được khoanh, các ô hợp lệ hiện **chấm**; quân đối phương ăn được có vòng cố định (không nhấp nháy).
2. Bấm ô hợp lệ: đi nước đó.
3. Muốn huỷ: bấm lại quân, bấm ô không hợp lệ hoặc nhấn Esc.
*Phần 2:*
1. Giữ chuột (hoặc ngón tay) trên quân, kéo; quân bay theo con trỏ.
2. Thả vào ô hợp lệ thì đi; thả sai thì quân **trượt về chỗ cũ**.
*Phần 3:*
1. Nước vừa đi được đánh dấu bằng **bốn góc ở cả ô đi lẫn ô đến**.
2. Khi bị chiếu: vòng cảnh báo quanh Tướng kèm chữ "Đang bị chiếu" và biểu tượng.
*Phần 4:*
1. Có bốn âm: đi quân, ăn quân, chiếu, kết thúc ván.
2. Nút loa ở góc bàn bật/tắt bằng một lần chạm; trạng thái **nhớ trong phiên**.

**Điều kiện chấp nhận**
*Phần 1:*
1. Chọn quân bị chặn hay bị "ghim" chỉ hiện ô hợp lệ.
2. Bấm đích đi đúng nước; huỷ chọn đúng cách.
3. Quân đối phương, ngoài lượt, người xem, ván kết thúc: không chọn được.
*Phần 2:*
1. Kéo vào ô hợp lệ gửi nước; ô sai hoặc ngoài bàn thì quân về chỗ cũ.
2. Đi cùng một nước bằng bấm và bằng kéo cho cùng kết quả ở cả hai hướng bàn.
3. Mất quyền giữa lúc kéo thì không gửi nước.
*Phần 3:*
1. Nước mới đánh dấu đúng hai ô.
2. Cảnh báo chiếu rõ ràng, không nhấp nháy.
3. Có chữ hoặc biểu tượng, không chỉ màu.
*Phần 4:*
1. Đúng bốn âm cho bốn sự kiện, không có yêu cầu tải tệp.
2. Tắt tiếng giữ nguyên khi đổi trạng thái trong phiên.

**Các việc nhỏ làm nên Story:** T-09 (Luật cờ: nước hợp lệ, chiếu, chiếu hết, hết nước, lặp thế, 120 nửa nước); T-11 (Giao diện: bàn cờ SVG, quân chữ Hán, lật bàn cho phe Đen); T-18 (Giao diện: bấm chọn quân và chấm gợi ý ô đi); T-22 (Giao diện: kéo thả quân, đánh dấu nước vừa đi, cảnh báo chiếu, âm thanh); T-26 (Giao diện ván: bàn cờ nối mạng, đồng hồ, nút, hộp kết quả, khung xin hoà); T-37 (Giao diện: chọn cấp và phe, màn ván với máy, thông báo sự cố).
