# 01 · Yêu cầu chi tiết và tiêu chí nghiệm thu

> **Bản hoàn thiện 04/10/2026, chờ Product Owner review bản viết.** Nền tảng đã duyệt 03/10 và các quyết định bổ sung đã duyệt 04/10 được giữ nguyên. Nhãn đã duyệt bên dưới ghi lịch sử nền, không có nghĩa toàn bộ câu chữ/thiết kế mới đã được review; không có mã nguồn hay test ứng dụng được chạy trong đợt tài liệu này.

**Giai đoạn 2 · Trạng thái: **nền tảng đã duyệt 03/10/2026; bản viết 04/10/2026 chờ Product Owner review** (các giả định kỹ thuật chưa đo vẫn cần thử nghiệm ở đầu Giai đoạn 4)** · Nguồn luật: [BA-SCOPE-DECISIONS.md](../BA-SCOPE-DECISIONS.md) (số "BA x.y" là số Quyết định) và [DANH-MUC-MAN-HINH-XIANGQI.md](../DANH-MUC-MAN-HINH-XIANGQI.md). Tài liệu này **không thêm yêu cầu mới**; chỉ chi tiết hoá thành các câu chuyện người dùng (US) có tiêu chí nghiệm thu (AC) kiểm thử được. **Chưa phải Jira**: mã nhóm và mã US chỉ là nhãn tham chiếu, việc chia Epic/Story/Task là Giai đoạn 3.

Cách đọc:
* **P1** = tám mục tiêu ưu tiên của MVP; mục tiêu khoảng hai tuần phải được kiểm tra công suất ở bước lập kế hoạch, không phải cam kết của đặc tả. **P2** = làm sau (BA Phần 11). Cả hai được đặc tả trong tài liệu này; không đổi phân kỳ.
* AC viết theo dạng "Khi … thì …". Mỗi AC phải kiểm được bằng thao tác cụ thể hoặc kiểm thử tự động ([05-kiem-thu.md](05-kiem-thu.md)).
* Mọi màn hình/khung dữ liệu có đủ **5 trạng thái** `SUCCESS`, `LOADING`, `EMPTY`, `ERROR`, `DISABLED` (DANH-MUC §2; xem US-UI-03), nên các AC bên dưới không lặp lại điều này.
* Luật cờ chi tiết ở [02-luat-co-tuong.md](02-luat-co-tuong.md); dữ liệu ở [03-du-lieu.md](03-du-lieu.md); sự kiện thời gian thực ở [04-kien-truc.md](04-kien-truc.md).

## Mục lục nhóm tính năng (ứng viên cho Epic ở Giai đoạn 3)

| Nhóm | Nội dung | P | Mục tiêu cốt lõi |
|---|---|---|---|
| A | Tài khoản và phiên | P1 | 1 |
| B | Phòng, mời, ghế, người xem | P1 | 2, 3, 6 |
| C | Bàn cờ | P1 | 4 |
| D | Ván đấu online | P1 | 5 |
| E | Chat và camera/mic | P1 | 7 |
| F | Bạn bè | P1 | 3 |
| G | Đánh với máy | P1 | 8 |
| H | Giao diện chung | P1 | tất cả |
| I | Tài khoản mở rộng | P2 | — |
| J | Đánh Hạng | P2 | — |
| K | Đánh Thường mở rộng | P2 | — |
| L | Xã hội mở rộng | P2 | — |
| M | Lịch sử, xem lại, xuất dữ liệu | P2 | — |
| N | Tiện ích demo | P2 | — |
| NFR | Yêu cầu phi chức năng | P1 | — |

---

# P1

## Nhóm A — Tài khoản và phiên

### US-AUTH-01 · Đăng ký bước 1: username và mật khẩu (P1) — BA 1.1, 1.4
* **AC-AUTH-01-01** — Khi nhập username đúng `^[a-zA-Z0-9_]{3,20}$` và chưa dùng thì ô hiện "hợp lệ"; kiểm tra trùng chạy sau khi ngừng gõ 300 ms.
* **AC-AUTH-01-02** — Khi username đã dùng (không phân biệt hoa thường, ví dụ `Twot` và `twot`) thì báo trùng và không cho tiếp tục.
* **AC-AUTH-01-03** — Khi mật khẩu dưới 8 ký tự hoặc ô xác nhận không khớp thì báo lỗi tại ô và nút *Tiếp tục* không bấm được.
* **AC-AUTH-01-04** — Khi hợp lệ và bấm *Tiếp tục* thì sang bước 2. **Không** có bản ghi tài khoản nào được tạo.

### US-AUTH-02 · Đăng ký bước 2: email và gửi OTP (P1) — BA 1.1, 1.5
* **AC-AUTH-02-01** — Khi email đã có tài khoản thì báo *"Email này đã được đăng ký"* và không gửi OTP.
* **AC-AUTH-02-02** — Khi email hợp lệ và chưa dùng (hoặc chỉ có bản đăng ký dở) thì gửi mã OTP 6 chữ số và sang bước 3.
* **AC-AUTH-02-03** — Nút *Gửi lại mã* bị vô hiệu trong 60 giây kể từ lần gửi, kèm bộ đếm lùi và tooltip nêu lý do.

### US-AUTH-03 · Đăng ký bước 3: xác thực OTP, tạo tài khoản (P1) — BA 1.1, 1.5
* **AC-AUTH-03-01** — Khi nhập đúng mã trong 3 phút thì tài khoản được tạo, `display_name` = `username`, tự đăng nhập và vào `/lobby`.
* **AC-AUTH-03-02** — Khi mã hết 3 phút thì báo hết hạn và yêu cầu gửi lại.
* **AC-AUTH-03-03** — Khi nhập sai mã thì báo sai; khi bị **giới hạn nhập sai** (mục tiêu 5 lần, thực thi gần đúng theo giới hạn tốc độ của hệ thống xác thực, BA 1.5) thì khoá form và bắt buộc chờ hoặc bấm *Gửi lại mã*.
* **AC-AUTH-03-04** — Bỏ dở trước khi xác minh thì chưa có hồ sơ sử dụng được, username không bị giữ; gửi lại cùng email dùng lại bản ghi dở. Nếu tiến trình chết sau ghi hồ sơ thì tài khoản vẫn bị chặn cho tới khi phục hồi theo BA 1.1 và [04] mục 3.1, không được coi là đăng ký thành công.
* **AC-AUTH-03-05** — Có `completed_at` nhưng còn `PENDING`: phục hồi xoá cờ, không xoá tài khoản; chưa có `completed_at`: dọn sau thời hạn quy định. Gửi lại, hoàn tất và dọn cùng danh tính phải tuần tự hoá; không xoá tài khoản vừa hoàn tất.
* **AC-AUTH-03-06** — Khi username vừa bị người khác lấy trong lúc chờ thì báo lỗi và quay về bước 1.

### US-AUTH-04 · Đăng nhập bằng username và mật khẩu (P1) — BA 1.4, 1.8
* **AC-AUTH-04-01** — Khi nhập đúng thì vào `/lobby` (hoặc vào đúng phòng nếu đến từ link mời, US-AUTH-06).
* **AC-AUTH-04-02** — Khi sai tên hoặc mật khẩu thì báo chung *"Sai tên đăng nhập hoặc mật khẩu"* (không nói sai ô nào) và không tiết lộ email.
* **AC-AUTH-04-03** — Tick *Ghi nhớ đăng nhập* (mặc định tick) thì phiên giữ 30 ngày; bỏ tick thì phiên hết khi đóng trình duyệt hoặc sau 12 giờ.
* **AC-AUTH-04-04** — Nút *Guest* và *Đăng nhập bằng Google* hiện ở trạng thái `DISABLED` kèm tooltip *"Sắp ra mắt"*.
* **AC-AUTH-04-05** — Đăng nhập khi đang đăng nhập ở tab/thiết bị khác thì phiên mới tiếp quản, nơi cũ nhận thông báo và chuyển chỉ đọc (BA 1.8).

### US-AUTH-05 · Hồ sơ cơ bản và đăng xuất (P1) — BA 1.4, 1.6
* **AC-AUTH-05-01** — Ở `/settings` đổi *Tên hiển thị* (2–30 ký tự, có dấu, có khoảng trắng); chứa từ cấm thì **từ chối lưu** kèm thông báo.
* **AC-AUTH-05-02** — `Username` và `Email` hiển thị nhưng **không sửa được** ở P1 (nút đổi Username `DISABLED` + "Sắp ra mắt"; email luôn khoá).
* **AC-AUTH-05-03** — Avatar luôn là chữ cái đầu của tên hiển thị; không có tải ảnh.
* **AC-AUTH-05-04** — Đăng xuất khi không trong ván: thực hiện rời phòng theo BA 1.8 nếu còn ghế, xoá phiên và về `/login`. Khi đang đấu online/AI, dùng xác nhận hậu quả đầu hàng; Huỷ giữ nguyên. Đồng ý chỉ báo hoàn tất khi máy chủ đã nhận đầu hàng/rời ván, không âm thầm biến thành mất mạng.
* **AC-AUTH-05-05** — Nếu lệnh Đăng xuất giữa ván lỗi hoặc chưa rõ đã nhận, giữ trạng thái chờ/lỗi và đối soát ván bằng cùng định danh lệnh; không tạo hai kết quả. Đóng tab/mất mạng vẫn theo ân hạn, không phải chủ động đầu hàng.

### US-AUTH-06 · Chuyển hướng vào phòng sau đăng nhập (P1) — BA 2.4
* **AC-AUTH-06-01** — Khi chưa đăng nhập mà mở link mời thì thấy màn đăng nhập/đăng ký; sau khi đăng nhập hoặc đăng ký xong, **tự vào đúng phòng**, không phải bấm lại link.
* **AC-AUTH-06-02** — Khi đã đăng nhập thì vào thẳng phòng (xem US-ROOM-05 để biết vào ghế hay xem).

---

## Nhóm B — Phòng, mời, ghế, người xem

### US-ROOM-01 · Tạo phòng (P1) — BA 2.7, 2.8
* **AC-ROOM-01-01** — Form gồm: tên phòng (1–60 ký tự, qua bộ lọc từ cấm), mức giờ **5 / 10 / 15 phút (mặc định 10)**, chế độ `PUBLIC` hoặc `CODE_ONLY`, số người xem tối đa **Không có người xem / 1 / 2 (mặc định 2)**. `LOCKED` không chọn được lúc tạo.
* **AC-ROOM-01-02** — Khi tạo thành công thì tạo mã 8 ký tự, người tạo là **Host** ngồi **ghế Đỏ** ở phòng chờ.
* **AC-ROOM-01-03** — Khi đang ngồi ghế ở phòng/ván khác thì nút *Tạo phòng* `DISABLED` kèm tooltip *"Bạn đang ở trong một ván/phòng khác"* (BA 1.8).
* **AC-ROOM-01-04** — Mức giờ và số người xem **không đổi được** sau khi tạo.

### US-ROOM-02 · Phòng chờ và ghế ngồi (P1) — BA 2.3
* **AC-ROOM-02-01** — Host mặc định ghế Đỏ; khi chỉ có một mình, Host đổi sang ghế Đen hoặc đổi lại không giới hạn số lần.
* **AC-ROOM-02-02** — Người thứ hai vào phòng thì tự xếp vào **ghế còn trống**.
* **AC-ROOM-02-03** — Khi thành phần người ngồi ghế thay đổi thì trạng thái *Sẵn sàng* của cả hai **reset về chưa sẵn sàng** (BA 2.8).

### US-ROOM-03 · Sẵn sàng và bắt đầu ván (P1) — BA 2.3
* **AC-ROOM-03-01** — Mỗi người ngồi ghế bật/tắt *Sẵn sàng* tuỳ ý trước khi đối thủ vào.
* **AC-ROOM-03-02** — Khi **cả hai** ngồi ghế và cùng Sẵn sàng thì đếm ngược **3… 2… 1…** (có âm thanh gỗ), rồi tạo ván mới và chuyển sang `SCR-GAME-ROOM`; đồng hồ chạy cho **bên Đỏ**.
* **AC-ROOM-03-03** — Khi một bên bỏ Sẵn sàng trong lúc đếm thì **dừng đếm**.

### US-ROOM-04 · Chia sẻ phòng bằng link và mã (P1) — BA 2.2, 2.8; QR là P2
* **AC-ROOM-04-01** — `MODAL-INVITE` do **chỉ người đang ngồi ghế** mở; hiện **link** và **mã 8 ký tự** (nút sao chép). Link và mã cho **cùng một quyền**; không có link riêng "xem/chơi".
* **AC-ROOM-04-02** — Nút Mã QR không xuất hiện ở P1 (ẩn, không để nút xám).
* **AC-ROOM-04-03** — Khi phòng chuyển `LOCKED` thì link và mã chưa dùng **hết hiệu lực**; khi mở lại thì sinh **link và mã mới** (BA 4.3).

### US-ROOM-05 · Vào phòng bằng mã, link hoặc Sảnh (P1) — BA 2.6, 2.8
* **AC-ROOM-05-01** — Nhập mã 8 ký tự ở Sảnh hoặc mở link: còn ghế trống thì **vào ghế đó**; ghế đã kín và còn chỗ xem thì vào làm **Người xem** kèm thông báo *"Ghế đấu đã đủ 2 người, bạn đang tham gia phòng với vai trò Người xem."*
* **AC-ROOM-05-02** — Phòng đủ (2 người chơi + số người xem tối đa của phòng, tối đa 4 người) thì từ chối kèm *"Phòng thi đấu đã đầy người, vui lòng chọn phòng khác!"* ở `SCR-ACCESS-DENIED`.
* **AC-ROOM-05-03** — Vào từ danh sách phòng ở Sảnh (nút *Vào xem*) thì **luôn** vào làm Người xem.
* **AC-ROOM-05-04** — Người bị đuổi hoặc phòng `LOCKED` thì vào bị từ chối (US-ROOM-09, US-ROOM-07).

### US-ROOM-06 · Đổi chỗ giữa ghế và người xem (P1) — BA 2.8
* **AC-ROOM-06-01** — Chỉ khi phòng `WAITING` hoặc `FINISHED`; khi đang đấu thì không đổi chỗ.
* **AC-ROOM-06-02** — Người ngồi ghế bấm *Chuyển sang người xem*: thực hiện được khi **còn chỗ xem**; phòng không có người xem hoặc đã đủ người xem thì nút `DISABLED` kèm tooltip *"Phòng không còn chỗ cho người xem"*. Không bao giờ vượt số người xem tối đa.
* **AC-ROOM-06-03** — Host bấm *Chuyển sang người xem* cho người đang ngồi ghế (cùng điều kiện còn chỗ), hoặc *Mời xuống ghế* cho người xem khi còn ghế trống.
* **AC-ROOM-06-04** — Người xem **không tự ngồi** vào ghế trống. Host không tự chuyển mình sang người xem (nút ẩn).
* **AC-ROOM-06-05** — Mỗi lần đổi thành phần người ngồi ghế thì phòng về `WAITING` và reset Sẵn sàng.

### US-ROOM-07 · Chế độ riêng tư và khoá phòng (P1) — BA 2.7, 4.3
* **AC-ROOM-07-01** — Host đổi giữa `PUBLIC`, `CODE_ONLY`, `LOCKED` bất kỳ lúc nào (kể cả đang đấu); riêng `LOCKED` chỉ bật được khi **đã đủ 2 người chơi** (nếu chưa thì nút `DISABLED` kèm tooltip *"Chỉ khoá được khi đã đủ 2 người chơi"*).
* **AC-ROOM-07-02** — `LOCKED`: phòng biến mất khỏi Sảnh; **không ai mới vào được** dù có link, mã hay QR; người đang có ghế hoặc đang xem **giữ nguyên** và vẫn xem được.
* **AC-ROOM-07-03** — Người đang có ghế/đang xem mất mạng vẫn vào lại được (người chơi trong 60 giây, người xem trong 5 phút); quá hạn coi như người mới.
* **AC-ROOM-07-04** — `CODE_ONLY`: không hiện ở Sảnh; vào bằng mã hoặc link.
* **AC-ROOM-07-05** — Phòng đã `LOCKED` khi một người rời vẫn giữ khoá; Host mở lại hoặc mời người xem đang có xuống ghế, không tự mở khoá do mất ghế (BA 2.8).
* **AC-ROOM-07-06** — Xác nhận khi chuyển `LOCKED`: *"Người mới sẽ không vào được. Người xem đang có vẫn được giữ lại."*

### US-ROOM-08 · Danh sách phòng công khai ở Sảnh (P1) — BA 2.0, 2.7
* **AC-ROOM-08-01** — Chỉ hiện phòng `PUBLIC` đang `WAITING`/`PLAYING`; mỗi dòng: tên phòng, Host, mức giờ, số người `X/Y`, nút *Vào xem*.
* **AC-ROOM-08-02** — Sắp mới nhất lên đầu, tối đa 50 phòng, tự làm mới.
* **AC-ROOM-08-03** — Phòng đã đủ người xem thì nút *Vào xem* `DISABLED` kèm tooltip nêu lý do.
* **AC-ROOM-08-04** — `EMPTY`: hiện giải thích và nút *Tạo phòng*.

### US-ROOM-09 · Đuổi người xem (P1) — BA 4.2
* **AC-ROOM-09-01** — Cả Host và người chơi còn lại đều thấy nút *Kick* cạnh mỗi người xem; bấm thì hiện xác nhận *"Người này sẽ không vào lại được phòng này."*
* **AC-ROOM-09-02** — Sau xác nhận: người xem bị ngắt kết nối, đưa ra Sảnh kèm *"Bạn đã bị đuổi khỏi phòng thi đấu"*, bị chặn **đến khi phòng đóng**.
* **AC-ROOM-09-03** — Người bị đuổi quay lại bằng link hoặc mã thì thấy *"Bạn đã bị đuổi và chặn tham gia phòng cờ này!"*.

### US-ROOM-10 · Host rời, chuyển quyền, đóng phòng (P1) — BA 2.3
* **AC-ROOM-10-01** — Host rời lúc phòng `WAITING`: nếu còn người chơi thứ hai thì họ thành Host, phòng vẫn mở.
* **AC-ROOM-10-02** — Khi không còn người ngồi ghế sau khi Host rời, đóng phòng dù còn người xem; họ về Sảnh. Ngoài ra phòng còn đóng khi hết hạn `FINISHED` theo US-ROOM-11, không gọi điều kiện hết ghế là nguyên nhân đóng duy nhất.
* **AC-ROOM-10-03** — Đang đấu (`PLAYING`): Host mất kết nối tạm thời **không** đổi Host; Host rời hoặc bị xử thua thì quyền Host chuyển cho người chơi còn lại; rời giữa ván tính là **Đầu hàng**.

### US-ROOM-11 · Sau ván CASUAL: quay về phòng chờ (P1) — BA 2.3 mục 8
* **AC-ROOM-11-01** — Khi ván kết thúc phòng ở `FINISHED` tối đa 10 phút; hết hạn nếu vẫn `FINISHED` thì đóng và đưa thành viên còn lại về Sảnh. Đã trở lại `WAITING` thì hẹn giờ FINISHED cũ không được đóng phòng.
* **AC-ROOM-11-02** — Một người ngồi ghế rời, hoặc thành phần người ngồi ghế đổi, thì phòng về `WAITING`, người còn lại giữ ghế và quyền Host (nếu người rời là Host thì chuyển quyền).
* **AC-ROOM-11-03** — Người mới vào theo US-ROOM-05; mất kết nối ở `WAITING` giữ ghế 60 giây.
* **AC-ROOM-11-04** — Ví dụ nghiệm thu (BA 2.8): A và C đánh xong, A rời, C thành Host, C mời B xuống ghế, B và C bấm Sẵn sàng thì đếm ngược và đấu tiếp.

### US-ROOM-12 · Màn hình từ chối truy cập (P1) — DANH-MUC mục 14
* **AC-ROOM-12-01** — Hiện đúng thông báo theo lý do: phòng đầy, bị đuổi, phòng `LOCKED` (nội dung theo BA 4.3); chỉ có một nút *Quay về Sảnh*.

---

## Nhóm C — Bàn cờ

### US-BOARD-01 · Hiển thị bàn cờ (P1) — BA 3.1; [02](02-luat-co-tuong.md) mục 1
* **AC-BOARD-01-01** — Bàn SVG 9×10 giao điểm, thế khởi đầu đúng [02] mục 1.2; quân **chỉ chữ Hán** (帥仕相傌俥炮兵 / 將士象馬車砲卒), không chữ Việt/Latin.
* **AC-BOARD-01-02** — Người cầm Đen thấy bàn **lật ngược**; toạ độ gửi máy chủ luôn theo hệ gốc.
* **AC-BOARD-01-03** — Có nhãn đọc cho trình đọc màn hình theo toạ độ gốc (DESIGN §7.5).

### US-BOARD-02 · Chọn quân và gợi ý ô đi bằng click (P1) — BA 3.4
* **AC-BOARD-02-01** — Click quân của mình: hiện vòng chọn và các **chấm gợi ý** ở mọi giao điểm hợp lệ; quân đối phương ăn được có vòng cố định (không nhấp nháy).
* **AC-BOARD-02-02** — Click giao điểm hợp lệ: đi nước đó. Hủy chọn: click lại quân, click ô không hợp lệ, hoặc `Esc`.
* **AC-BOARD-02-03** — Chỉ chọn được quân của mình và chỉ khi tới lượt mình; người xem và ván kết thúc là chỉ đọc.

### US-BOARD-03 · Kéo thả (P1) — BA 3.4
* **AC-BOARD-03-01** — Giữ chuột/ngón tay kéo quân bay theo con trỏ; thả vào giao điểm hợp lệ thì đi; thả sai thì quân **trượt về chỗ cũ**.
* **AC-BOARD-03-02** — Hai cách (click và kéo thả) dùng song song, kết quả như nhau; dùng được bằng cảm ứng.

### US-BOARD-04 · Đánh dấu nước cuối và chiếu (P1) — BA 3.4; DESIGN §7.4
* **AC-BOARD-04-01** — Nước vừa đi: 4 góc vuông ở ô đi và ô đến.
* **AC-BOARD-04-02** — Khi bị chiếu: vòng cảnh báo quanh Tướng kèm chữ *"Đang bị chiếu"* và biểu tượng; **không nhấp nháy, không rung** (tối đa một nhịp sáng khi vừa bị chiếu; tắt khi bật giảm chuyển động).
* **AC-BOARD-04-03** — Không truyền thông tin chỉ bằng màu.

### US-BOARD-05 · Âm thanh (P1) — BA 3.4
* **AC-BOARD-05-01** — Có 4 âm: đi quân, ăn quân, chiếu, kết thúc ván; tạo bằng Web Audio API (không tải tệp âm thanh).
* **AC-BOARD-05-02** — Nút loa ở góc bàn cờ bật/tắt 1 chạm; trạng thái nhớ trong phiên.

---

## Nhóm D — Ván đấu online

### US-PLAY-01 · Đi nước qua mạng (P1) — BA 3.3; [04] mục 4
* **AC-PLAY-01-01** — Chỉ người ngồi ghế, đúng lượt, mới gửi được nước đi; máy chủ kiểm hợp lệ theo [02] và phát thế mới cho cả phòng (người chơi và người xem) trong **dưới 100 ms** trên mạng cục bộ.
* **AC-PLAY-01-02** — Nước không hợp lệ bị từ chối và quân về chỗ cũ; trạng thái ván không đổi.
* **AC-PLAY-01-03** — Lệnh gửi trùng (`commandId`) không làm đi hai lần; lệnh cũ (`matchVersion` lỗi thời) bị từ chối kèm thế mới.
* **AC-PLAY-01-04** — Quân vừa gửi hiển thị mờ chờ xác nhận (DESIGN §7.4) rồi cố định khi máy chủ xác nhận.

### US-PLAY-02 · Đồng hồ (P1) — BA 2.1, 3.3
* **AC-PLAY-02-01** — Mức 5/10/15 phút mỗi bên, **không cộng giây**; đồng hồ bên tới lượt chạy, bên kia dừng.
* **AC-PLAY-02-02** — Hết giờ thì ván kết thúc `TIMEOUT` và bên hết giờ thua; máy chủ tính giờ trước khi xét nước đi.
* **AC-PLAY-02-03** — Dưới 30 giây đồng hồ hiện biểu tượng cảnh báo và đổi màu **kèm chữ/biểu tượng**.

### US-PLAY-03 · Kết thúc ván và kết quả (P1) — BA 3.3; [02] mục 3.3
* **AC-PLAY-03-01** — Chiếu hết thua; hết nước đi (không bị chiếu) cũng thua; xử đúng thứ tự ưu tiên ở [02] mục 3.4.
* **AC-PLAY-03-02** — `MODAL-MATCH-RESULT` hiện thắng/thua/hoà, lý do kết thúc, chỉ nút *Rời phòng* (không Tái đấu, không Xem lại ở P1). Ván `INTERRUPTED` (máy chủ tự ghi nhận sự cố/khởi động lại) hiện kết quả **trung tính** *"Ván bị gián đoạn"*: không có bên thắng/thua/hoà, không đổi Elo, chỉ nút *Rời phòng* (đề xuất 04/10/2026, chờ PO duyệt).
* **AC-PLAY-03-03** — Ván ngừng nhận nước đi; người xem thấy kết quả.

### US-PLAY-04 · Đầu hàng (P1) — BA 3.3
* **AC-PLAY-04-01** — Bấm *Đầu hàng* mở xác nhận (*"Bạn sẽ thua ván này ngay lập tức."*, mặc định focus ở Huỷ); đồng ý thì thua ngay, đối thủ thắng.

### US-PLAY-05 · Xin hoà (P1) — BA 3.3, 3.5, 3.6
* **AC-PLAY-05-01** — Gửi đề nghị: người nhận thấy `MODAL-DRAW-PROMPT` với đếm lùi 30 giây; người gửi thấy *"Đang chờ đối thủ trả lời…"* và nút *Rút đề nghị*.
* **AC-PLAY-05-02** — Đồng ý thì ván hoà; từ chối hoặc hết hạn thì ván tiếp tục.
* **AC-PLAY-05-03** — Mỗi người chỉ có **1 đề nghị đang chờ**; bị từ chối hoặc hết hạn thì **phải đi thêm 5 nước của mình** mới xin hoà lại (nút `DISABLED` kèm tooltip số nước còn phải chờ).
* **AC-PLAY-05-04** — Khung không modal, không giữ focus, không chặn bàn cờ; đồng hồ chạy. X/Esc thu gọn, có nút mở lại, hạn vẫn chạy; chỉ Từ chối mới gửi phản hồi từ chối. Ván kết thúc thì đề nghị hết hiệu lực, trả lời đến muộn không đổi kết quả (BA 3.6).

### US-PLAY-06 · Rời phòng giữa ván (P1) — BA 2.3, DANH-MUC modal 13
* **AC-PLAY-06-01** — Bấm *Rời phòng* khi đang đấu hiện xác nhận *"Rời lúc này được tính là đầu hàng."*; đồng ý thì thua ngay.

### US-PLAY-07 · Mất kết nối và kết nối lại (P1) — BA 8.3; DANH-MUC overlay 2
* **AC-PLAY-07-01** — Khi mất kết nối: lớp phủ không đóng bằng `Esc`. Nội dung theo vai trò:
  * Người chơi **đang đấu**: đếm lùi **60 giây**; nối lại thì tự tắt; quá hạn thì thua `DISCONNECT`; **đồng hồ ván vẫn chạy** (hết giờ trước thì `TIMEOUT`).
  * Người chơi ở phòng chờ/kết thúc: giữ ghế 60 giây rồi mất ghế (không xử thua).
  * Người xem: giữ chỗ 5 phút.
* **AC-PLAY-07-02** — Nối lại thành công: nhận lại thế cờ đầy đủ và đồng hồ chính xác.
* **AC-PLAY-07-03** — Cả hai cùng mất kết nối nhưng máy chủ vẫn chạy: **bên mất kết nối trước thua** nếu cả hai cùng quá hạn.
* **AC-PLAY-07-04** — Máy chủ tự ghi nhận sự cố của chính nó (khởi động lại): ván thành `INTERRUPTED`.

### US-PLAY-08 · Lặp thế, chiếu liên tục, không ăn quân (P1) — BA 3.5; [02] mục 4, 5
* **AC-PLAY-08-01** — Thế lặp lần thứ 3 xử theo bảng ở [02] mục 4 (chiếu liên tục thì bên chiếu thua; còn lại hoà); 120 nửa nước không ăn quân thì hoà.
* **AC-PLAY-08-02** — Chiếu hết luôn ưu tiên hơn các kết quả hoà.

### US-PLAY-09 · Người xem theo dõi trực tiếp (P1) — BA 4.1, 4.3
* **AC-PLAY-09-01** — Người xem thấy bàn cờ, đồng hồ, nước đi **thời gian thực** (không trễ cố ý), chỉ đọc.
* **AC-PLAY-09-02** — Người xem không thấy Kênh Riêng; không có nút bật camera/mic.
* **AC-PLAY-09-03** — Ngoài danh sách chung, người xem thấy số người xem hiện tại (X / N).

### US-PLAY-10 · Bảng nước đi (P1) — [02] mục 7
* **AC-PLAY-10-01** — Hiển thị danh sách nước đi theo ký hiệu tiếng Việt (ví dụ `Pháo 2 bình 5`), tự cuộn tới nước mới nhất.

---

## Nhóm E — Chat và camera/mic

### US-CHAT-01 · Hai kênh chat (P1) — BA 5.3
* **AC-CHAT-01-01** — **Người chơi:** thấy cả `[Kênh Riêng]` (mặc định mở) và `[Kênh Chung]`, có công tắc ẩn Kênh Chung. **Người xem:** chỉ thấy `[Kênh Chung]`.
* **AC-CHAT-01-02** — Tin ở Kênh Riêng chỉ hai người **đang ngồi ghế** nhận; người đổi chỗ sau không đọc tin cũ; người xem mới chỉ thấy tin Kênh Chung từ lúc vào.
* **AC-CHAT-01-03** — Chat phòng xoá khi phòng đóng.

### US-CHAT-02 · Giới hạn và bộ lọc từ cấm (P1) — BA 5.3
* **AC-CHAT-02-01** — Mỗi tin tối đa 200 ký tự; tối đa 5 tin/10 giây/người, vượt thì báo *"Bạn gửi quá nhanh"*.
* **AC-CHAT-02-02** — Từ cấm (tiếng Việt, tiếng Anh) bị che bằng `***` ở máy chủ **và** client, có chuẩn hoá dấu, khoảng trắng, ký tự chèn, ký tự thay thế (`0`→`o`, `1`→`i`).
* **AC-CHAT-02-03** — Sticker chưa có ở P1 (khay ẩn).

### US-MEDIA-01 · Camera và micro cho hai người chơi (P1) — BA 4.1, 5.4
* **AC-MEDIA-01-01** — Mỗi người chơi bật/tắt camera và micro độc lập; **mặc định Tắt** khi vào phòng.
* **AC-MEDIA-01-02** — Có 3 mức chia sẻ chọn riêng từng người: *Không chia sẻ / Chỉ đối thủ / Cả đối thủ và người xem* (mức 3 chỉ cho khi phòng có người xem).
* **AC-MEDIA-01-03** — Hai người chơi thấy mặt và nghe tiếng nhau khi cả hai bật mức ≥ 2.
* **AC-MEDIA-01-04** — Không ghi hình, ghi âm hoặc lưu.

### US-MEDIA-02 · Người xem chỉ xem/nghe (P1) — BA 4.1
* **AC-MEDIA-02-01** — Người xem **không có** nút bật camera/mic; máy chủ không cấp quyền phát.
* **AC-MEDIA-02-02** — Người xem chỉ thấy/nghe luồng của người chơi chọn mức *Cả đối thủ và người xem*.

### US-MEDIA-03 · Mở nhiều tab (P1) — BA 1.8
* **AC-MEDIA-03-01** — Mở thêm tab vào cùng phòng thì tab mới **tiếp quản**; tab cũ nhận *"Phiên này đã được mở ở tab khác"*, chuyển chỉ đọc; camera/mic của tab cũ **tự dừng**, tab mới mặc định tắt.

---

## Nhóm F — Bạn bè (tối thiểu ở P1)

### US-FRIEND-01 · Tìm người và gửi lời mời (P1) — BA 5.5
* **AC-FRIEND-01-01** — Tìm theo `username` (tiền tố, **không phân biệt hoa thường**); kết quả hiện thẻ tóm tắt (avatar, tên hiển thị, `@username`) và nút *Kết bạn*.
* **AC-FRIEND-01-02** — Bấm *Kết bạn* thì gửi lời mời; có thể **thu hồi** lời mời đã gửi. Lời mời tự hết hạn sau 30 ngày.

### US-FRIEND-02 · Nhận và trả lời lời mời (P1) — BA 5.5
* **AC-FRIEND-02-01** — Chuông ở thanh điều hướng liệt kê lời mời đang chờ; *Chấp nhận* thì thành bạn hai chiều; *Từ chối* thì không báo cho người gửi.
* **AC-FRIEND-02-02** — Bị **cùng một người từ chối 2 lần** thì không gửi lại được lời mời cho người đó.

### US-FRIEND-03 · Danh sách bạn và trạng thái (P1) — BA 2.5, 5.5
* **AC-FRIEND-03-01** — Hiện avatar, tên, `@username`, Elo (P2) và trạng thái 🟢 Online / 🟠 Đang đấu / ⚫ Offline.
* **AC-FRIEND-03-02** — Nút *Nhắn tin* và *Thách đấu* `DISABLED` kèm tooltip *"Sắp ra mắt"*; **không có nút mời vào phòng** ở trang này.
* **AC-FRIEND-03-03** — Huỷ kết bạn thì hai bên không còn là bạn.

### US-FRIEND-04 · Mời bạn bè online vào phòng (P1) — BA 2.5
* **AC-FRIEND-04-01** — Trong `MODAL-INVITE` (người ngồi ghế mở), danh sách bạn hiện trạng thái; nút *Mời* chỉ sáng với bạn 🟢 Online.
* **AC-FRIEND-04-02** — Bạn 🟠 Đang đấu thì nút `DISABLED` kèm tooltip *"Bạn bè đang trong ván khác"*; bạn ⚫ Offline thì kèm nhãn *"Ngoại tuyến"*.
* **AC-FRIEND-04-03** — Người được mời thấy pop-up *"Người chơi [Tên Host] mời bạn tham gia phòng cờ [Tên phòng]"* với *Tham gia* và *Từ chối*, đếm lùi **30 giây** rồi tự tắt.
* **AC-FRIEND-04-04** — Bấm *Tham gia* thì vào phòng theo US-ROOM-05.

### US-FRIEND-05 · Giới hạn (P1) — BA 5.5
* **AC-FRIEND-05-01** — Tối đa 200 bạn và 50 lời mời đang chờ **tổng gửi + nhận** mỗi người; vượt thì nút `DISABLED` kèm tooltip, máy chủ cũng chặn. Kiểm giới hạn cả hai tài khoản khi gửi/chấp nhận để không vượt trần bởi lệnh đồng thời.
* **AC-FRIEND-05-02** — Hai lời mời ngược chiều đồng thời giữ một lời mời chờ, không tự thành bạn; thu hồi/hết hạn không tính là một lần Từ chối (BA 5.5).

---

## Nhóm G — Đánh với máy

### US-AI-01 · Chọn cấp độ và phe (P1) — BA 6.1, 6.3
* **AC-AI-01-01** — Ở Sảnh có 3 thẻ **Dễ / Trung bình / Khó**; bấm mở `MODAL-AI-SETUP` chọn phe **Đỏ / Đen / Ngẫu nhiên** (50/50 do máy chủ bốc).
* **AC-AI-01-02** — Cầm Đen thì máy (cầm Đỏ) **tự đi nước đầu** và bàn cờ lật cho Đen ở dưới.
* **AC-AI-01-03** — Không có nút gợi ý nước đi.

### US-AI-02 · Chơi với máy (P1) — BA 6.1, 6.3; [02] mục 9
* **AC-AI-02-01** — Người chơi đi, máy trả lời với **thời gian tính** (từ lúc bắt đầu tìm) trong ngân sách: Dễ ≤ 300 ms, Trung bình ≤ 1 000 ms, Khó ≤ 3 000 ms; hàng đợi chờ tiến trình rảnh (tối đa 3 giây, chỉ khi máy bận) không tính vào ngân sách nhưng báo *Thử lại* nếu quá; hết ngân sách thì máy đi nước tốt nhất đã tìm được.
* **AC-AI-02-02** — Ván với máy **không giới hạn thời gian** cho người chơi, không có cảnh báo chống treo ván; không tính Elo; **không có nút Xin hoà**, chỉ có *Đầu hàng*.
* **AC-AI-02-03** — Máy không bao giờ đi nước không hợp lệ.
* **AC-AI-02-04** — `ENGINE_BUSY`: giữ cùng Match ID/thế/lượt máy; Thử lại chỉ yêu cầu tìm nước, không gửi lại nước của người chơi. Kết quả tác vụ cũ bị huỷ hoặc phiên bản cũ không được áp dụng (BA 6.1).

### US-AI-03 · Kết thúc, bỏ dở và vào lại (P1) — BA 6.3
* **AC-AI-03-01** — Kết thúc khi chiếu hết, hết nước đi, đầu hàng hoặc hoà theo [02] mục 3.3; hiện `MODAL-MATCH-RESULT` chỉ có *Rời phòng*.
* **AC-AI-03-02** — Đóng tab hoặc mất kết nối: ván **giữ 30 phút** để vào lại cùng đường dẫn `/ai/:id`; Sảnh hiện banner *"Bạn có ván đang chơi dở — Quay lại"*. Quá 30 phút thì ván coi là *Bỏ dở* (không tính thắng/thua).
* **AC-AI-03-03** — Đi lại và lưu Lịch sử là P2, **không hiện** ở P1.
* **AC-AI-03-04** — Chủ động Rời ván/Đăng xuất AI đang chơi: xác nhận đầu hàng; đồng ý kết thúc `RESIGN`, huỷ tìm kiếm và giải phóng vị trí chơi; Huỷ giữ ván. Không áp dụng ân hạn 30 phút cho hành động đã xác nhận này (BA 6.3).

### US-AI-04 · Sự cố máy cờ (P1) — BA 6.1
* **AC-AI-04-01** — Nếu tiến trình máy cờ lỗi hoặc không phản hồi quá hạn 10 giây thì ván chuyển *Bỏ dở*, báo *"Máy cờ gặp sự cố"* kèm nút *Thử lại*.
* **AC-AI-04-02** — Thử lại sau `ABANDONED`: tạo Match ID mới, cùng cấp độ và phe thực tế, không hồi sinh ván cũ; nếu phe cũ Ngẫu nhiên thì giữ kết quả đã bốc. Kiểm một vị trí chơi và chặn bấm trùng; thất bại không thông báo đã tạo ván (BA 6.1).

---

## Nhóm H — Giao diện chung

### US-UI-01 · Thanh điều hướng (P1) — DANH-MUC panel 1
* **AC-UI-01-01** — Cố định đầu mọi trang đã đăng nhập: logo, Sảnh, Bạn bè (P1); *Bảng xếp hạng* và *Lịch sử* hiện `DISABLED` kèm *"Sắp ra mắt"*; chuông lời mời; avatar và tên hiển thị với menu *Hồ sơ* / *Đăng xuất*.

### US-UI-02 · Sảnh (P1) — BA 2.0, Phần 11
* **AC-UI-02-01** — Có: Tạo phòng, Vào phòng bằng mã, Danh sách phòng công khai, 3 thẻ Đánh với máy. Thẻ **Đánh Hạng** hiện `DISABLED` + *"Sắp ra mắt"*; *Ghép ngẫu nhiên* **ẩn** ở P1.
* **AC-UI-02-02** — Có ván/phòng dở thì hiện banner quay lại; đang ngồi ghế ở phòng thì các nút tạo/ghép `DISABLED` kèm tooltip.
* **AC-UI-02-03** — Sảnh có phần Luật chơi mở rộng/thu gọn bằng chuột/bàn phím, nêu kết thúc ván và khác biệt rút gọn theo BA 10.4 và [02]; không thêm trang/modal hoặc tính vào thành phần thứ 38.

### US-UI-03 · Năm trạng thái cho mọi màn hình (P1) — DANH-MUC §2
* **AC-UI-03-01** — Mỗi màn hình và khung dữ liệu có đủ `SUCCESS`, `LOADING` (khung xương, không để trắng, không giật bố cục), `EMPTY` (giải thích + nút hành động), `ERROR` (tiếng Việt dễ hiểu + nút *Thử lại*), `DISABLED` (luôn có tooltip lý do).

### US-UI-04 · Responsive (P1) — BA 10.1
* **AC-UI-04-01** — Dùng được ở **360 px** trở lên, không cuộn ngang; bàn cờ chơi được bằng cảm ứng; ở màn nhỏ camera/chat có thể thu thành tab.
* **AC-UI-04-02** — Kiểm ở 360, 390, 1366, 1920 px (DESIGN §13).

### US-UI-05 · Trợ năng (P1) — AGENTS §6; DESIGN
* **AC-UI-05-01** — Tuân WCAG 2.1 AA: tương phản theo DESIGN §2, điều khiển bằng bàn phím (có vòng tiêu điểm), nhãn cho mọi nút chỉ có biểu tượng, `prefers-reduced-motion` tắt chuyển động, đếm lùi không đọc từng giây (dùng `aria-live` cho thông báo quan trọng).
* **AC-UI-05-02** — Không truyền thông tin chỉ bằng màu.

### US-UI-06 · Tính năng P2 hiển thị đúng quy tắc (P1) — DANH-MUC §7
* **AC-UI-06-01** — Lối vào điều hướng chính của tính năng P2 hiển thị `DISABLED` kèm *"Sắp ra mắt"*; chức năng nằm sâu trong màn hình P1 (QR, sticker, Xin đi lại, Xin đổi bên, Tái đấu, Xem lại, đi lại với máy, widget AI, bộ chọn giao diện) **ẩn hoàn toàn**.
* **AC-UI-06-02** — P1 luôn Kỳ Đài Cổ Phong; Giấy Sáng/Theo hệ thống thuộc US-UI-P2-01, không tự đổi theo cài đặt hệ điều hành ở P1 (BA 10.3).

---

## Yêu cầu phi chức năng (P1)

| Mã | Yêu cầu | Cách kiểm |
|---|---|---|
| NFR-01 | Người xem **nhận thế cờ mới trong < 100 ms** kể từ lúc máy chủ nhận lệnh nước đi, trên mạng cục bộ (BA 4.3). Phép đo: tại **client người xem** (đồng hồ chung hoặc đo vòng đi-về), p95 | Đo ở client người xem ([05] mục 6) |
| NFR-02 | Chịu **50 kết nối đồng thời gồm 10 ván cùng lúc** (20 người chơi) **và 30 kết nối khác** (người xem, Sảnh, chat) không lỗi; độ trễ nước đi p95 < 300 ms (BA 10.1) | Kiểm thử tải ([05]) |
| NFR-03 | Trình duyệt: bản mới của Chrome, Edge, Firefox, Safari; responsive từ 360 px | Kiểm thủ công và tự động |
| NFR-04 | Bảo mật: client không quyết định kết quả; không lộ dữ liệu không có quyền xem; khoá bí mật không ở client | Kiểm thử bảo mật ([05]) |
| NFR-05 | Máy cờ đạt thời gian và sức mạnh ở [02] mục 9.5 | Kiểm thử máy cờ ([05]) |
| NFR-06 | Chỉ tiếng Việt; không ghi hình/ghi âm | Kiểm thử chấp nhận |
| NFR-07 | Khi máy chủ khởi động lại, ván đang chạy thành `INTERRUPTED`, không treo | Kiểm thử phục hồi |
| NFR-08 | Quan sát vận hành (đề xuất 04/10/2026, chờ PO duyệt): máy chủ ghi nhật ký có cấu trúc (thời điểm, mã lệnh/ván, mã lỗi) cho lỗi, `INTERRUPTED`, sự cố máy cờ, đăng ký bị phục hồi; có điểm kiểm tra sức khoẻ; **không ghi** mật khẩu, mã OTP, token, nội dung chat. Không thêm công cụ ngoài danh sách README | Kiểm tra nhật ký ở các ca lỗi; rà không lộ dữ liệu nhạy cảm |
| NFR-09 | Lưu giữ dữ liệu (đề xuất 04/10/2026, chờ PO duyệt): ván **online** (người–người) và nước đi lưu bền ở quy mô đồ án; ván với máy ở P1 chỉ giữ trong bộ nhớ để vào lại 30 phút (BA 6.3), không lưu bền; chat **phòng** xoá khi phòng `CLOSED` (chat 1-1 P2 theo quy tắc bạn bè, không xoá theo phòng); chat/tên của Khách xoá khi phiên Khách hết (P2); biên lai lệnh xoá sau 24 giờ (đã có ở [03]); nhật ký vận hành giữ tối đa 14 ngày | Kiểm thử dọn dẹp ([05]) |
| NFR-10 | An toàn hiển thị (đề xuất 04/10/2026, chờ PO duyệt): tin chat, tên hiển thị, tên phòng luôn hiển thị là **văn bản thuần**, không chạy HTML/script/URL tự kích hoạt; độ dài và tần suất theo BA 5.3 | Ca có thẻ `<script>`, thuộc tính sự kiện, URL `javascript:` ở chat/tên/tên phòng |

---

# P2 · Đặc tả chi tiết, triển khai sau P1

Các US sau là đặc tả kiểm thử được, không phải công việc Jira. Điều kiện chung về quyền, chống trùng, lỗi và năm trạng thái nằm ở [07](07-hop-dong-nghiep-vu.md) và [08](08-ma-tran-nghiem-thu.md); áp dụng cùng với từng AC, không thay luật BA.

## Nhóm I — Tài khoản mở rộng (P2)

### US-AUTH-P2-01 · Khách (P2) — BA 1.3
* **AC-AUTH-P2-01-01** — Nút Guest mở hộp nhập tên 2–20 ký tự, qua bộ lọc, không cần duy nhất; thành công vào Sảnh hoặc phòng mời ban đầu, luôn gắn nhãn (Khách).
* **AC-AUTH-P2-01-02** — Phiên chỉ trong trình duyệt hiện tại, thời hạn 12 giờ; nếu đến hạn khi đang ngồi ghế/đang đấu thì gia hạn tới lúc rời. Rời phòng trước hạn vẫn giữ cùng phiên; Đăng xuất chủ động kết thúc phiên. Đăng xuất giữa ván theo quy tắc xác nhận đầu hàng ở BA 1.8/6.3.
* **AC-AUTH-P2-01-03** — Khách được Đánh Thường, AI, xem, chat phòng và camera/mic khi ngồi ghế; máy chủ chặn Đánh Hạng, Elo, bạn bè và thay đổi tài khoản dù gọi trực tiếp.
* **AC-AUTH-P2-01-04** — Mỗi Khách có tối đa một phòng đang mở do mình tạo, chịu sức chứa và giới hạn chat như tài khoản; phiên mới là danh tính mới, giới hạn né chặn bằng phiên mới được công bố ở BA 4.2.
* **AC-AUTH-P2-01-05** — Không lịch sử/Replay phía Khách, không chuyển dữ liệu sang tài khoản mới. Đối thủ chính thức vẫn có bản ghi ván; khi phiên Khách hết thì thay tên cá nhân bằng Khách, không xoá bản ghi ván của đối thủ. Đồng thời xoá khỏi mọi phòng còn mở các tin chat do Khách đó gửi và tên hiển thị cá nhân; người còn trong phòng thấy tin đã bị gỡ, tên chung "Khách" (đề xuất 04/10/2026, chờ PO duyệt).

### US-AUTH-P2-02 · Google OAuth (P2) — BA 1.2
* **AC-AUTH-P2-02-01** — Đăng ký bằng Google mới đi tới SCR-ONBOARDING: Username và mật khẩu hợp lệ/xác nhận, không OTP; display_name khởi tạo bằng username.
* **AC-AUTH-P2-02-02** — Đăng nhập Google với danh tính đã hoàn tất thì vào Sảnh hoặc phòng mời; chưa thiết lập thì vào onboarding, chưa được dùng chức năng ứng dụng.
* **AC-AUTH-P2-02-03** — Email thuộc tài khoản khác đã có thì báo Email này đã được đăng ký; không tự gộp tài khoản hoặc làm mất mật khẩu/username hiện có.
* **AC-AUTH-P2-02-04** — Bỏ dở hoặc Google từ chối/lỗi thì không có tài khoản ứng dụng hoàn tất; không tự đi tiếp vào Sảnh. Gửi hoàn tất trùng không tạo hai tài khoản; username bị chiếm trong lúc chờ phải báo để nhập lại.
* **AC-AUTH-P2-02-05** — Sau thiết lập thành công, cùng danh tính đăng nhập được bằng Google hoặc username/mật khẩu; dữ liệu gắn user_id, không tạo hồ sơ thứ hai.

### US-AUTH-P2-03 · Quên và đặt lại mật khẩu (P2) — BA 1.7, 1.5
* **AC-AUTH-P2-03-01** — Nhập email có/không có tài khoản đều nhận cùng thông báo Nếu email này đã đăng ký, mã khôi phục đã được gửi; không tiết lộ tồn tại tài khoản.
* **AC-AUTH-P2-03-02** — OTP tuân BA 1.5: 6 số, 180 giây, gửi lại 60 giây, giới hạn sai gần đúng; email truyền qua trạng thái ứng dụng, không nằm trên URL.
* **AC-AUTH-P2-03-03** — Chỉ OTP hợp lệ cho đúng email/mục đích mới cho đặt mật khẩu đạt tối thiểu 8 ký tự và xác nhận khớp; OTP sai/hết hạn không đổi mật khẩu.
* **AC-AUTH-P2-03-04** — Đổi thành công thu hồi mọi phiên khác theo BA 1.7; mật khẩu cũ không đăng nhập được, mật khẩu mới được. Yêu cầu trùng hoặc lỗi không báo thành công giả.
* **AC-AUTH-P2-03-05** — Khi thiếu trạng thái khôi phục (mở URL trực tiếp/tải lại mất ngữ cảnh), không hiện email đoán hay cho đổi mật khẩu; cho trở về bước yêu cầu mã.

### US-AUTH-P2-04 · Đổi username (P2) — BA 1.6, 1.4
* **AC-AUTH-P2-04-01** — Chính chủ thực hiện bốn bước: yêu cầu đổi → OTP email hiện tại → xác minh → nhập username mới; chưa OTP hợp lệ không được giữ/đổi tên.
* **AC-AUTH-P2-04-02** — Tên mới tuân cú pháp 3–20 ký tự và kiểm trùng không phân biệt hoa/thường; không giới hạn tần suất, email không cho đổi.
* **AC-AUTH-P2-04-03** — Sau đổi, tên cũ bị khoá 30 ngày cho chủ cũ; chính chủ lấy lại được trong thời hạn, người khác không được. Hết thời hạn tên có thể dùng lại nếu không có người đang giữ.
* **AC-AUTH-P2-04-04** — user_id bất biến; Elo, lịch sử, bạn bè, tin nhắn giữ nguyên. Tên cũ không còn là tên đăng nhập hiện tại.
* **AC-AUTH-P2-04-05** — Tên vừa bị lấy hoặc OTP hết hiệu lực thì không đổi dữ liệu; cập nhật tên/đặt giữ tên cũ cùng giao dịch để không có trạng thái nửa chừng.

## Nhóm J — Đánh Hạng (P2)

### US-RANK-01 · Ghép trận Đánh Hạng (P2) — BA 7.1, 7.2
* **AC-RANK-01-01** — Chỉ tài khoản chính thức không chiếm vị trí chơi được tìm; cùng người không có hai vé hàng đợi hoạt động. MODAL-MATCHMAKING hiện thời gian và Huỷ.
* **AC-RANK-01-02** — Biên độ theo BA 7.2: ±100, thêm 50 mỗi 10 giây; ghép dùng biên độ lớn hơn của hai vé. Tại 60 giây thử lần cuối ±400 rồi mới hết hạn; không ghép với AI.
* **AC-RANK-01-03** — Cặp đã bắt đầu đủ 3 ván trong cửa sổ 24 giờ bị bỏ qua âm thầm; tính cả INTERRUPTED, dùng started_at theo BA 7.2, không dùng bộ đếm ván hoàn tất.
* **AC-RANK-01-04** — Huỷ thành công khi chưa MATCH_FOUND thì không tạo ván; nếu ghép thắng cuộc đua trước thì không huỷ, báo trạng thái đã tìm thấy. Hai người chỉ được ghép một lần.
* **AC-RANK-01-05** — Không có đối thủ thì báo Chưa tìm được đối thủ phù hợp, hãy thử lại sau; khởi động lại máy chủ huỷ vé và báo Hàng đợi đã bị huỷ; không khôi phục một vé ma.

### US-RANK-02 · Luật ván Đánh Hạng (P2) — BA 8.1, 7.2
* **AC-RANK-02-01** — Chỉ ghép ngẫu nhiên, 10 phút/bên không cộng giây; cấm Khách, người xem, Đi lại, Tái đấu ở cả giao diện và máy chủ.
* **AC-RANK-02-02** — Xin hoà chỉ bật khi mỗi bên đã đi ít nhất 20 nước; 19/20 còn chặn, 20/20 cho phép; hạn 30 giây và chờ 5 nước sau từ chối/hết hạn theo luật chung.
* **AC-RANK-02-03** — Đầu hàng/rời/Đăng xuất chủ động theo xác nhận như online; dù đầu hàng nước đầu vẫn tính Elo bình thường.
* **AC-RANK-02-04** — Kết thúc dùng thứ tự luật ở [02], ngừng nhận lệnh; chỉ hai người nhận trạng thái và kết quả. Người ngoài đoán đường dẫn không nhận dữ liệu phòng/ván.
* **AC-RANK-02-05** — Sau ván giữ FINISHED/ghế tới khi người chơi Rời phòng, sau đó mới tìm trận khác; một người rời không chuyển WAITING. Người còn lại xem kết quả, không Sẵn sàng/Tái đấu/nhận mới; cả hai rời hoặc hết 10 phút ban đầu thì CLOSED (BA 7.2).

### US-RANK-03 · Elo và cấp bậc (P2) — BA 7.1, 7.3
* **AC-RANK-03-01** — Khởi tạo 1200; tính FIDE theo BA 7.1, K lấy riêng từng người từ số ván hoàn tất trước ván: ván 30 K=32, ván 31 K=16.
* **AC-RANK-03-02** — Elo mới mỗi bên tính từ Elo trước ván; làm tròn gần nhất, .5 lên trên, sau đó sàn 100. Hai K khác nhau hoặc sàn có thể làm tổng biến động khác 0.
* **AC-RANK-03-03** — Kết quả thắng/thua/hoà của ván RANKED hoàn tất cập nhật Elo, thống kê, mốc đạt Elo trong cùng giao dịch, lặp xử lý cùng ván không cập nhật lần hai.
* **AC-RANK-03-04** — INTERRUPTED/ABANDONED không đổi Elo, không đếm ván hoàn tất; CASUAL/AI không đổi Elo. Không nhầm bộ đếm này với giới hạn cặp ghép.
* **AC-RANK-03-05** — Cấp bậc theo toàn bộ bảng khoảng Elo BA 7.1; chưa chơi ván Đánh Hạng nào hiện Chưa xếp hạng, không tự suy thứ hạng từ Elo khởi tạo.

### US-RANK-04 · Bảng xếp hạng (P2) — BA 7.1
* **AC-RANK-04-01** — Chỉ xếp tài khoản có ít nhất 5 ván Đánh Hạng hoàn tất; không Khách, không tính CASUAL/AI hoặc ván gián đoạn vào điều kiện.
* **AC-RANK-04-02** — Trả Top 50 theo Elo giảm dần; bằng thì số thắng giảm dần, thời điểm đạt Elo sớm hơn, cuối cùng user_id tăng dần.
* **AC-RANK-04-03** — Dòng ghim chính mình phản ánh thứ hạng toàn bảng kể cả ngoài Top 50; chưa đủ thì ghi Chưa xếp hạng — cần thêm X ván với X = 5 − số ván hoàn tất.
* **AC-RANK-04-04** — Không bộ lọc ngày/tuần/mùa hoặc reset mùa; không có kết quả thì trạng thái EMPTY, lỗi tải có Thử lại không bịa hạng 0.
* **AC-RANK-04-05** — Thẻ tóm tắt chỉ thông tin công khai và thống kê Đánh Hạng; không tiết lộ email hoặc lịch sử riêng tư.

### US-RANK-05 · Mất kết nối ở Đánh Hạng (P2) — BA 8.3
* **AC-RANK-05-01** — Trục thời gian 60 giây giữ nguyên luật online; đồng hồ ván vẫn chạy, TIMEOUT xảy ra trước hạn mất kết nối thì ưu tiên TIMEOUT.
* **AC-RANK-05-02** — Nối lại trong hạn nhận đầy đủ thế/giờ/phiên bản; quá hạn DISCONNECT thua và Elo cập nhật một lần.
* **AC-RANK-05-03** — Cả hai rớt nhưng máy chủ sống: nếu cùng quá hạn thì bên rớt trước thua; lỗi máy chủ của chính nó thì INTERRUPTED, không người thắng và không thay Elo.
* **AC-RANK-05-04** — Reconnect sau kết thúc chỉ nhận kết quả, không hồi sinh ván hoặc áp dụng lệnh cũ.

### US-RANK-06 · Media và chat trong Đánh Hạng (P2) — BA 5.4
* **AC-RANK-06-01** — Chỉ có Kênh Riêng cho hai người và sticker P2; không người xem/Kênh Chung. Chat vẫn lọc từ cấm, giới hạn theo BA 5.3.
* **AC-RANK-06-02** — Camera/mic phát mặc định tắt; chỉ lựa chọn Không chia sẻ/Chỉ đối thủ, không lựa chọn cho người xem.
* **AC-RANK-06-03** — Phía nhận mặc định ẩn hình và tắt tiếng đối thủ đến khi bấm Hiện hình/tiếng; Tắt ngay ẩn/tắt tức thì, không cần đối thủ đồng ý.
* **AC-RANK-06-04** — Từ chối quyền thiết bị hoặc lỗi media không cản đi cờ/chat; không ghi hình, ghi âm, lưu track hay cấp quyền cho người ngoài.

## Nhóm K — Đánh Thường mở rộng (P2)

### US-CAS-01 · Ghép ngẫu nhiên Đánh Thường (P2) — BA 2.0, 2.1
* **AC-CAS-01-01** — Chọn Không giới hạn/5/10/15 phút; chỉ ghép cùng mức, không thêm tiêu chí Elo hoặc chuyển sang Đánh Hạng.
* **AC-CAS-01-02** — Chờ tối đa 60 giây, được Huỷ trước khi tìm thấy; hết hạn không ghép AI. Kiểm một vị trí chơi và chống ghép trùng như hợp đồng hàng đợi [07].
* **AC-CAS-01-03** — Người vào hàng đợi trước là Host; ghép thành công vào phòng chờ, hai bên Sẵn sàng, đếm 3 giây; bỏ Sẵn sàng dừng đếm.
* **AC-CAS-01-04** — Phòng mặc định PUBLIC có ghi chú cho người tìm; dùng quy tắc CASUAL và sức chứa phòng, không mở quyền xem cho RANKED.

### US-CAS-02 · Xin đi lại (P2) — BA 3.2, 3.6
* **AC-CAS-02-01** — Chỉ ván CASUAL đang chơi, người xin đã đi ít nhất một nước, còn lượt và không có đề nghị của mình đang chờ; RANKED cấm.
* **AC-CAS-02-02** — Đồng ý trong hạn lùi về trước nước gần nhất của người xin: một nửa nước nếu đối thủ chưa đáp, hai nếu đã đáp; huỷ các nước sau con trỏ, phục hồi bộ đếm lặp/không ăn quân của nhánh hiệu lực.
* **AC-CAS-02-03** — Không trả lại thời gian đã trôi; chỉ thành công trừ một lượt, tối đa ba mỗi bên mỗi ván; gửi trùng không lùi hoặc trừ hai lần.
* **AC-CAS-02-04** — Khung không modal theo BA 3.6: X/Esc thu gọn; người xin không đi được khi chờ, đối thủ vẫn có quyền đi; hạn 30 giây, từ chối/hết hạn không trừ lượt, chờ ba nước của mình mới xin lại cùng loại.
* **AC-CAS-02-05** — Ván đã kết thúc hoặc đề nghị đã rút/hết hạn thì trả lời muộn không thay thế, đồng hồ hay kết quả; báo trạng thái mới nhất.

### US-CAS-03 · Xin đổi bên (P2) — BA 2.3, 3.6
* **AC-CAS-03-01** — Chỉ hai người ngồi ghế ở phòng chờ; Host một mình dùng đổi ghế trực tiếp, không gửi đề nghị tới người chưa có.
* **AC-CAS-03-02** — Đề nghị hạn 30 giây, tuân một đề nghị/người; đồng ý khi còn hợp lệ hoán hai ghế và reset Sẵn sàng, giữ Host.
* **AC-CAS-03-03** — Từ chối/hết hạn không đổi ghế; chờ 60 giây trước khi gửi lại; rút lại không đổi ghế.
* **AC-CAS-03-04** — Khi một người rời/đổi vai hoặc ván đã bắt đầu, yêu cầu cũ không còn điều kiện áp dụng; không hoán ghế của ván đang chơi.

### US-CAS-04 · Tái đấu (P2) — BA 3.3, 2.3
* **AC-CAS-04-01** — Chỉ hai người của ván CASUAL vừa kết thúc khi vẫn còn ghế trong cùng phòng FINISHED; RANKED không có Tái đấu.
* **AC-CAS-04-02** — Hai bên đồng ý thì tự hoán phe, đếm 3 giây và bắt đầu Match ID mới, không cần Sẵn sàng lần nữa.
* **AC-CAS-04-03** — Giữ Room ID, chế độ riêng tư, người xem và danh sách chặn; ván cũ/kết quả không bị ghi đè, reset đồng hồ và bộ đếm của ván mới.
* **AC-CAS-04-04** — Một người rời/đổi ghế hoặc phòng hết 10 phút thì đề nghị cũ không thể tạo ván; bấm đồng thời/trùng không tạo hai Match ID.

### US-CAS-05 · Không giới hạn giờ và chống treo (P2) — BA 2.1, 3.3
* **AC-CAS-05-01** — Không giới hạn là lựa chọn thứ tư chỉ của CASUAL; RANKED cố định 10 phút, AI không áp dụng chống treo này.
* **AC-CAS-05-02** — Bên tới lượt không đi 3 phút thì banner không modal đếm 30 giây; không giữ focus/che bàn hay nút Đầu hàng.
* **AC-CAS-05-03** — Tôi còn đây đặt lại 3 phút, tối đa hai lần liên tiếp khi chưa có nước mới; lần cảnh báo thứ ba không có nút đó.
* **AC-CAS-05-04** — Hết hạn không có nước hoặc xác nhận hợp lệ thì INACTIVITY thua; nước hợp lệ mới đặt lại chu kỳ. Lệnh đến sau kết thúc không hồi sinh ván.

### US-CAS-06 · Chia sẻ bằng QR (P2) — BA 2.2, 4.3
* **AC-CAS-06-01** — MODAL-INVITE có QR của đúng link hiện hành, cùng quyền như mã/link; chỉ người ngồi ghế được mở.
* **AC-CAS-06-02** — Tải ảnh QR tạo ảnh quét được về đúng link; Sao chép QR báo thành công chỉ khi clipboard nhận ảnh, lỗi quyền/hỗ trợ thì báo lỗi và vẫn dùng Tải ảnh hoặc Sao chép link.
* **AC-CAS-06-03** — LOCKED/thu hồi làm QR cũ vô hiệu như mã/link; mở lại tạo QR cho link mới, không tái sử dụng bản cũ.
* **AC-CAS-06-04** — Người quét chưa đăng nhập hoàn tất đăng nhập/Guest rồi tự tới phòng; kiểm lại khoá, chặn, sức chứa ở thời điểm thực sự vào.

## Nhóm L — Xã hội mở rộng (P2)

### US-SOC-01 · Chat 1-1 (P2) — BA 5.2, 5.5, 8.2
* **AC-SOC-01-01** — Chỉ hai tài khoản đang ACCEPTED truy cập hội thoại; người ngoài hoặc Khách gọi trực tiếp phải bị chặn, không trả tin rồi ẩn ở UI.
* **AC-SOC-01-02** — Gửi/nhận văn bản và sticker theo giới hạn/lọc BA 5.3; tin lưu bền và có huy hiệu chưa đọc, không bị xoá do đóng một phòng chơi.
* **AC-SOC-01-03** — Huỷ kết bạn lập tức mất quyền gửi/đọc, lịch sử giữ nhưng ẩn; kết bạn lại hiện lịch sử đó, không tạo hội thoại trùng cho cặp đảo chiều.
* **AC-SOC-01-04** — Lỗi gửi không hiện đã gửi; truy lại cùng định danh tin khi mất xác nhận không nhân đôi tin. Lỗi tải lịch sử giữ dữ liệu đang xem, có Thử lại.
* **AC-SOC-01-05** — Badge đếm tổng tin đến chưa đọc từ bạn hiện tại, không tin mình gửi. Tin vào vùng nhìn hội thoại ở tab hoạt động mới đánh dấu đọc; tải nền không đánh dấu. Đồng bộ giữa thiết bị; huỷ bạn loại khỏi badge nhưng giữ trạng thái đọc, kết bạn lại tính lại tin còn chưa đọc (BA 5.2).

### US-SOC-02 · Sticker (P2) — BA 5.1, 5.3
* **AC-SOC-02-01** — Khay đủ 12 biểu tượng đúng danh sách BA 5.1, mỗi nút có nhãn đọc, bấm một lần gửi một shortcode.
* **AC-SOC-02-02** — Dùng trong Kênh Chung, Kênh Riêng hoặc 1-1 theo quyền hiện tại; không mở kênh mới cho người không có quyền.
* **AC-SOC-02-03** — Sticker chịu cùng giới hạn gửi và lưu/xoá như tin của kênh; nội dung không được thực thi HTML/script do client gửi.
* **AC-SOC-02-04** — P1 không có khay; ở P2 lỗi gửi giữ phản hồi lỗi chứ không khẳng định người nhận đã nhận.

### US-SOC-03 · Thách đấu (P2) — BA 2.7, 5.5, 2.5
* **AC-SOC-03-01** — Chỉ tài khoản chính thức thách đấu bạn đang Online từ Bạn bè; Đang đấu/Offline có DISABLED và lý do.
* **AC-SOC-03-02** — Mở form Tạo phòng hiện có, người gửi nhập tên; mặc định 10 phút/CODE_ONLY/2 người xem, được đổi trong phạm vi CASUAL. Xác nhận mới tạo phòng rồi gửi mời theo BA 2.5; Huỷ form không tạo/gửi gì. Không dùng thách đấu để chọn đối thủ Đánh Hạng.
* **AC-SOC-03-03** — Người nhận có Tham gia/Từ chối và hạn 30 giây; Tham gia kiểm quyền/sức chứa/phiên bản link tại máy chủ như mọi lời mời phòng.
* **AC-SOC-03-04** — Người gửi đang có vị trí chơi không tạo thêm phòng; bạn vừa bận hoặc lời mời bị từ chối/hết hạn thì giữ phòng đã tạo để Host quản lý, không giả định người nhận đã vào hoặc tự tạo ván.

### US-SOC-04 · Mở rộng người xem (P2) — BA 4.1, Phần 11
* **AC-SOC-04-01** — P2 mở lựa chọn sức chứa CASUAL tới năm người xem, P1 vẫn tối đa hai; giá trị N đã chọn lúc tạo không đổi trong vòng đời phòng.
* **AC-SOC-04-02** — N=0 không nhận người xem; N=5 nhận tối đa năm, người thứ sáu bị chặn kể cả nhiều lệnh vào đồng thời; Khách tính vào N.
* **AC-SOC-04-03** — Người xem chỉ xem/nghe theo chia sẻ và chat chung; không phát media, không đọc chat riêng, không Replay.
* **AC-SOC-04-04** — LOCKED giữ người xem cũ và chặn mới; chỉ hai người ngồi ghế được đuổi; mở rộng sức chứa không áp dụng cho RANKED.

## Nhóm M — Lịch sử, xem lại, xuất dữ liệu (P2)

### US-HIS-01 · Lịch sử ván (P2) — BA 6.2, 7.3, 1.3
* **AC-HIS-01-01** — Chính chủ xem bộ lọc Tất cả/Đánh Hạng/Đánh Thường/Đấu với Máy; không đọc lịch sử của user_id khác bằng đổi URL/tham số.
* **AC-HIS-01-02** — Mỗi ván hiện loại, đối thủ, phe, kết quả/lý do, biến động Elo nếu RANKED; AI kèm cấp độ. Ván có Khách lưu cho tài khoản chính thức theo BA 1.3.
* **AC-HIS-01-03** — INTERRUPTED và ABANDONED có nhãn riêng, không tính thắng/thua/hoà hoặc Elo; vẫn có thể xem chuỗi nước đã lưu theo quyền.
* **AC-HIS-01-04** — Ván AI của tài khoản lưu ở P2; ván Khách không có lịch sử phía Khách. P1 không có màn Lịch sử dù máy chủ có bản ghi vận hành.
* **AC-HIS-01-05** — Bộ lọc không có kết quả hiện EMPTY và cho đổi bộ lọc; lỗi tải có Thử lại, không hiện lịch sử rỗng như thể chưa chơi.

### US-HIS-02 · Xem lại (P2) — BA 6.2
* **AC-HIS-02-01** — Chỉ người chơi của ván đọc Replay từ Lịch sử; người xem/người ngoài không có link chia sẻ hay dữ liệu, kể cả RANKED.
* **AC-HIS-02-02** — Tái dựng từ thế đầu và chuỗi nước hiệu lực tới current_move_id; không phát các nhánh đã đi lại hoặc nước chưa lưu.
* **AC-HIS-02-03** — Các nút đầu/trước/sau/cuối, nhấp dòng nước nhảy đúng thế; đầu/cuối vô hiệu nút vượt biên kèm lý do.
* **AC-HIS-02-04** — Tự phát 1,5 giây/nước, dừng ở cuối; không có nước thì hiện thế đầu và trạng thái chưa có nước, không lỗi chỉ số.
* **AC-HIS-02-05** — Replay chỉ đọc: không đi quân, không sửa kết quả, không trừ/tăng Elo hoặc gửi lệnh ván thật.

### US-HIS-03 · Đi lại với máy (P2) — BA 6.3
* **AC-HIS-03-01** — Chỉ AI đang chơi ở P2, tối đa ba lần thành công; không cần máy đồng ý.
* **AC-HIS-03-02** — Máy đã đáp thì lùi cặp hai nửa nước về lượt người chơi; máy đang nghĩ thì huỷ tác vụ và chỉ lùi nước vừa đi của người chơi, vẫn tính một lượt.
* **AC-HIS-03-03** — Chưa có nước của người chơi (kể cả cầm Đen máy mới khai cuộc) hoặc ván đã kết thúc thì DISABLED kèm lý do.
* **AC-HIS-03-04** — Lệnh trùng không trừ thêm lượt; kết quả tìm cũ đến sau huỷ không áp dụng; phục hồi bộ đếm lặp/không ăn quân theo nhánh hiệu lực.
* **AC-HIS-03-05** — Hiện Lượt đi lại: X/3 nhất quán với số lượt đã dùng; hết ba lượt không nhận yêu cầu thứ tư ở máy chủ.

### US-HIS-04 · Xuất FEN/PGN (P2) — BA 9.1
* **AC-HIS-04-01** — Chỉ người có quyền Replay có quyền xuất; Sao chép FEN lấy đúng thế đang hiển thị tại con trỏ, không luôn lấy thế cuối.
* **AC-HIS-04-02** — Tải PGN lấy toàn bộ chuỗi nước hiệu lực và metadata theo [02] mục 7.4; không có nước đã đi lại hoặc dữ liệu bí mật.
* **AC-HIS-04-03** — Clipboard bị từ chối hoặc tải thất bại phải báo ERROR/Thử lại, không báo đã sao chép/tải khi chưa thành công.
* **AC-HIS-04-04** — PGN chỉ nghiệm thu khi công cụ ngoài nhập được đúng tệp và tái dựng đúng ván; lưu tên/phiên bản công cụ, mẫu tệp, kết quả kiểm. Chưa có bằng chứng thì BLOCKED, không tự đổi định dạng để tuyên bố đạt.

## Nhóm N — Tiện ích demo và giao diện P2 (P2)

### US-DEMO-01 · Thông số máy cờ (P2) — BA 9.2
* **AC-DEMO-01-01** — Widget AI hiển thị số nút đã duyệt, độ sâu thực tế hoàn tất, thời gian tìm và nước dự tính của máy theo dữ liệu công việc hiện tại.
* **AC-DEMO-01-02** — Chưa có số đo hiển thị chưa có dữ liệu, không điền số mẫu; lỗi tiến trình hiển thị lỗi tương ứng, không giữ số cũ như số hiện tại.
* **AC-DEMO-01-03** — Widget không trở thành Gợi ý nước đi cho người chơi; chỉ thể hiện thông số máy theo phạm vi BA 9.2.

### US-DEMO-02 · Giả lập mạng (P2) — BA 9.3
* **AC-DEMO-02-01** — Chỉ khi DEMO_MODE bật mới có Mô phỏng người chơi mất mạng và Tái kết nối tức thì; máy chủ cũng kiểm cờ, không chỉ ẩn nút.
* **AC-DEMO-02-02** — Giả lập chạy cùng cơ chế mất kết nối/thời gian/kết quả thật của phiên thử, không sửa trực tiếp Elo hoặc kết quả để làm đẹp demo.
* **AC-DEMO-02-03** — Tắt DEMO_MODE thì gọi trực tiếp chức năng cũng bị chặn; không tạo vai trò Admin hoặc cấp quyền quản trị người khác.

### US-DEMO-03 · Chuyển media nhiều tab (P2) — BA 1.8
* **AC-DEMO-03-01** — Tab mới tiếp quản quyền điều khiển theo quy tắc phiên; tab cũ chỉ đọc, không tiếp tục gửi lệnh nước đi.
* **AC-DEMO-03-02** — MODAL-MEDIA-TAB-SWITCH cho chuyển camera/mic sang tab mới hoặc Huỷ; không cho hai tab cùng phát thiết bị.
* **AC-DEMO-03-03** — Tab mới chưa chọn chuyển thì camera/mic tắt; chuyển chỉ thành công khi quyền thiết bị cho phép và tab cũ đã dừng; lỗi quyền báo lỗi, không bật ngầm.
* **AC-DEMO-03-04** — Huỷ không kích hoạt media ở tab mới và không khôi phục quyền gửi lệnh ván cho tab cũ.

### US-UI-P2-01 · Chọn giao diện (P2) — BA 10.3
* **AC-UI-P2-01-01** — P2 tại Hồ sơ có Kỳ Đài Cổ Phong/Giấy Sáng/Theo hệ thống; chưa chọn thì mặc định Kỳ Đài Cổ Phong.
* **AC-UI-P2-01-02** — Chọn sáng/tối áp token tương ứng ở DESIGN; Theo hệ thống phản ánh chế độ sáng/tối của hệ điều hành, không đổi màu/hệ toạ độ bàn cờ.
* **AC-UI-P2-01-03** — Mọi trạng thái ở mỗi giao diện phải thoả tương phản và trợ năng; đổi giao diện không đổi phiên, nước đi hay đồng hồ.
* **AC-UI-P2-01-04** — P1 không có bộ chọn và không áp Theo hệ thống; không nâng chức năng này thành P1 vì CSS mẫu hỗ trợ hai bộ token.

---

## Phụ lục: bảng đối chiếu 8 mục tiêu cốt lõi và US

| # | Mục tiêu | US tương ứng |
|---|---|---|
| 1 | Đăng ký / đăng nhập | US-AUTH-01…06 |
| 2 | Tạo phòng | US-ROOM-01, 02, 03 |
| 3 | Mời vào phòng (link, mã, bạn bè online) | US-ROOM-04, 05; US-FRIEND-01…05 |
| 4 | Khởi tạo bàn cờ | US-BOARD-01…05 |
| 5 | Hai người đánh online | US-PLAY-01…10; US-ROOM-10, 11 |
| 6 | Công khai / khoá / có mã, tối đa 2 người xem | US-ROOM-05…09, 12; US-PLAY-09 |
| 7 | Chat, camera, mic, kênh riêng cho người xem | US-CHAT-01, 02; US-MEDIA-01…03 |
| 8 | Đánh với máy | US-AI-01…04 |

[01]: 01-yeu-cau-chi-tiet.md
[02]: 02-luat-co-tuong.md
[03]: 03-du-lieu.md
[04]: 04-kien-truc.md
[05]: 05-kiem-thu.md
