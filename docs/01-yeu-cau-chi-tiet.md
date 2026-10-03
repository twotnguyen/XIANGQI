# 01 · Yêu cầu chi tiết và tiêu chí nghiệm thu

**Giai đoạn 2 · Trạng thái: **Đã duyệt 03/10/2026** (các giả định kỹ thuật chưa đo vẫn cần thử nghiệm ở đầu Giai đoạn 4)** · Nguồn luật: [BA-SCOPE-DECISIONS.md](../BA-SCOPE-DECISIONS.md) (số "BA x.y" là số Quyết định) và [DANH-MUC-MAN-HINH-XIANGQI.md](../DANH-MUC-MAN-HINH-XIANGQI.md). Tài liệu này **không thêm yêu cầu mới**; chỉ chi tiết hoá thành các câu chuyện người dùng (US) có tiêu chí nghiệm thu (AC) kiểm thử được. **Chưa phải Jira**: mã nhóm và mã US chỉ là nhãn tham chiếu, việc chia Epic/Story/Task là Giai đoạn 3.

Cách đọc:
* **P1** = làm trong MVP 2 tuần (8 mục tiêu cốt lõi). **P2** = làm sau (BA Phần 11).
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
* Khi nhập username đúng `^[a-zA-Z0-9_]{3,20}$` và chưa dùng thì ô hiện "hợp lệ"; kiểm tra trùng chạy sau khi ngừng gõ 300 ms.
* Khi username đã dùng (không phân biệt hoa thường, ví dụ `Twot` và `twot`) thì báo trùng và không cho tiếp tục.
* Khi mật khẩu dưới 8 ký tự hoặc ô xác nhận không khớp thì báo lỗi tại ô và nút *Tiếp tục* không bấm được.
* Khi hợp lệ và bấm *Tiếp tục* thì sang bước 2. **Không** có bản ghi tài khoản nào được tạo.

### US-AUTH-02 · Đăng ký bước 2: email và gửi OTP (P1) — BA 1.1, 1.5
* Khi email đã có tài khoản thì báo *"Email này đã được đăng ký"* và không gửi OTP.
* Khi email hợp lệ và chưa dùng (hoặc chỉ có bản đăng ký dở) thì gửi mã OTP 6 chữ số và sang bước 3.
* Nút *Gửi lại mã* bị vô hiệu trong 60 giây kể từ lần gửi, kèm bộ đếm lùi và tooltip nêu lý do.

### US-AUTH-03 · Đăng ký bước 3: xác thực OTP, tạo tài khoản (P1) — BA 1.1, 1.5
* Khi nhập đúng mã trong 3 phút thì tài khoản được tạo, `display_name` = `username`, tự đăng nhập và vào `/lobby`.
* Khi mã hết 3 phút thì báo hết hạn và yêu cầu gửi lại.
* Khi nhập sai mã thì báo sai; khi bị **giới hạn nhập sai** (mục tiêu 5 lần, thực thi gần đúng theo giới hạn tốc độ của hệ thống xác thực, BA 1.5) thì khoá form và bắt buộc chờ hoặc bấm *Gửi lại mã*.
* Khi bỏ dở (đóng tab, hết hạn) thì **không có hồ sơ và không đăng nhập được**, username không bị giữ, và có thể đăng ký lại ngay bằng cùng email.
* Khi username vừa bị người khác lấy trong lúc chờ thì báo lỗi và quay về bước 1.

### US-AUTH-04 · Đăng nhập bằng username và mật khẩu (P1) — BA 1.4, 1.8
* Khi nhập đúng thì vào `/lobby` (hoặc vào đúng phòng nếu đến từ link mời, US-AUTH-06).
* Khi sai tên hoặc mật khẩu thì báo chung *"Sai tên đăng nhập hoặc mật khẩu"* (không nói sai ô nào) và không tiết lộ email.
* Tick *Ghi nhớ đăng nhập* (mặc định tick) thì phiên giữ 30 ngày; bỏ tick thì phiên hết khi đóng trình duyệt hoặc sau 12 giờ.
* Nút *Guest* và *Đăng nhập bằng Google* hiện ở trạng thái `DISABLED` kèm tooltip *"Sắp ra mắt"*.
* Đăng nhập khi đang đăng nhập ở tab/thiết bị khác thì phiên mới tiếp quản, nơi cũ nhận thông báo và chuyển chỉ đọc (BA 1.8).

### US-AUTH-05 · Hồ sơ cơ bản và đăng xuất (P1) — BA 1.4, 1.6
* Ở `/settings` đổi *Tên hiển thị* (2–30 ký tự, có dấu, có khoảng trắng); chứa từ cấm thì **từ chối lưu** kèm thông báo.
* `Username` và `Email` hiển thị nhưng **không sửa được** ở P1 (nút đổi Username `DISABLED` + "Sắp ra mắt"; email luôn khoá).
* Avatar luôn là chữ cái đầu của tên hiển thị; không có tải ảnh.
* Khi bấm *Đăng xuất* thì xoá phiên và về `/login`.

### US-AUTH-06 · Chuyển hướng vào phòng sau đăng nhập (P1) — BA 2.4
* Khi chưa đăng nhập mà mở link mời thì thấy màn đăng nhập/đăng ký; sau khi đăng nhập hoặc đăng ký xong, **tự vào đúng phòng**, không phải bấm lại link.
* Khi đã đăng nhập thì vào thẳng phòng (xem US-ROOM-05 để biết vào ghế hay xem).

---

## Nhóm B — Phòng, mời, ghế, người xem

### US-ROOM-01 · Tạo phòng (P1) — BA 2.7, 2.8
* Form gồm: tên phòng (1–60 ký tự, qua bộ lọc từ cấm), mức giờ **5 / 10 / 15 phút (mặc định 10)**, chế độ `PUBLIC` hoặc `CODE_ONLY`, số người xem tối đa **Không có người xem / 1 / 2 (mặc định 2)**. `LOCKED` không chọn được lúc tạo.
* Khi tạo thành công thì tạo mã 8 ký tự, người tạo là **Host** ngồi **ghế Đỏ** ở phòng chờ.
* Khi đang ngồi ghế ở phòng/ván khác thì nút *Tạo phòng* `DISABLED` kèm tooltip *"Bạn đang ở trong một ván/phòng khác"* (BA 1.8).
* Mức giờ và số người xem **không đổi được** sau khi tạo.

### US-ROOM-02 · Phòng chờ và ghế ngồi (P1) — BA 2.3
* Host mặc định ghế Đỏ; khi chỉ có một mình, Host đổi sang ghế Đen hoặc đổi lại không giới hạn số lần.
* Người thứ hai vào phòng thì tự xếp vào **ghế còn trống**.
* Khi thành phần người ngồi ghế thay đổi thì trạng thái *Sẵn sàng* của cả hai **reset về chưa sẵn sàng** (BA 2.8).

### US-ROOM-03 · Sẵn sàng và bắt đầu ván (P1) — BA 2.3
* Mỗi người ngồi ghế bật/tắt *Sẵn sàng* tuỳ ý trước khi đối thủ vào.
* Khi **cả hai** ngồi ghế và cùng Sẵn sàng thì đếm ngược **3… 2… 1…** (có âm thanh gỗ), rồi tạo ván mới và chuyển sang `SCR-GAME-ROOM`; đồng hồ chạy cho **bên Đỏ**.
* Khi một bên bỏ Sẵn sàng trong lúc đếm thì **dừng đếm**.

### US-ROOM-04 · Chia sẻ phòng bằng link và mã (P1) — BA 2.2, 2.8; QR là P2
* `MODAL-INVITE` do **chỉ người đang ngồi ghế** mở; hiện **link** và **mã 8 ký tự** (nút sao chép). Link và mã cho **cùng một quyền**; không có link riêng "xem/chơi".
* Nút Mã QR không xuất hiện ở P1 (ẩn, không để nút xám).
* Khi phòng chuyển `LOCKED` thì link và mã chưa dùng **hết hiệu lực**; khi mở lại thì sinh **link và mã mới** (BA 4.3).

### US-ROOM-05 · Vào phòng bằng mã, link hoặc Sảnh (P1) — BA 2.6, 2.8
* Nhập mã 8 ký tự ở Sảnh hoặc mở link: còn ghế trống thì **vào ghế đó**; ghế đã kín và còn chỗ xem thì vào làm **Người xem** kèm thông báo *"Ghế đấu đã đủ 2 người, bạn đang tham gia phòng với vai trò Người xem."*
* Phòng đủ (2 người chơi + số người xem tối đa của phòng, tối đa 4 người) thì từ chối kèm *"Phòng thi đấu đã đầy người, vui lòng chọn phòng khác!"* ở `SCR-ACCESS-DENIED`.
* Vào từ danh sách phòng ở Sảnh (nút *Vào xem*) thì **luôn** vào làm Người xem.
* Người bị đuổi hoặc phòng `LOCKED` thì vào bị từ chối (US-ROOM-09, US-ROOM-07).

### US-ROOM-06 · Đổi chỗ giữa ghế và người xem (P1) — BA 2.8
* Chỉ khi phòng `WAITING` hoặc `FINISHED`; khi đang đấu thì không đổi chỗ.
* Người ngồi ghế bấm *Chuyển sang người xem*: thực hiện được khi **còn chỗ xem**; phòng không có người xem hoặc đã đủ người xem thì nút `DISABLED` kèm tooltip *"Phòng không còn chỗ cho người xem"*. Không bao giờ vượt số người xem tối đa.
* Host bấm *Chuyển sang người xem* cho người đang ngồi ghế (cùng điều kiện còn chỗ), hoặc *Mời xuống ghế* cho người xem khi còn ghế trống.
* Người xem **không tự ngồi** vào ghế trống. Host không tự chuyển mình sang người xem (nút ẩn).
* Mỗi lần đổi thành phần người ngồi ghế thì phòng về `WAITING` và reset Sẵn sàng.

### US-ROOM-07 · Chế độ riêng tư và khoá phòng (P1) — BA 2.7, 4.3
* Host đổi giữa `PUBLIC`, `CODE_ONLY`, `LOCKED` bất kỳ lúc nào (kể cả đang đấu); riêng `LOCKED` chỉ bật được khi **đã đủ 2 người chơi** (nếu chưa thì nút `DISABLED` kèm tooltip *"Chỉ khoá được khi đã đủ 2 người chơi"*).
* `LOCKED`: phòng biến mất khỏi Sảnh; **không ai mới vào được** dù có link, mã hay QR; người đang có ghế hoặc đang xem **giữ nguyên** và vẫn xem được.
* Người đang có ghế/đang xem mất mạng vẫn vào lại được (người chơi trong 60 giây, người xem trong 5 phút); quá hạn coi như người mới.
* `CODE_ONLY`: không hiện ở Sảnh; vào bằng mã hoặc link.
* Xác nhận khi chuyển `LOCKED`: *"Người mới sẽ không vào được. Người xem đang có vẫn được giữ lại."*

### US-ROOM-08 · Danh sách phòng công khai ở Sảnh (P1) — BA 2.0, 2.7
* Chỉ hiện phòng `PUBLIC` đang `WAITING`/`PLAYING`; mỗi dòng: tên phòng, Host, mức giờ, số người `X/Y`, nút *Vào xem*.
* Sắp mới nhất lên đầu, tối đa 50 phòng, tự làm mới.
* Phòng đã đủ người xem thì nút *Vào xem* `DISABLED` kèm tooltip nêu lý do.
* `EMPTY`: hiện giải thích và nút *Tạo phòng*.

### US-ROOM-09 · Đuổi người xem (P1) — BA 4.2
* Cả Host và người chơi còn lại đều thấy nút *Kick* cạnh mỗi người xem; bấm thì hiện xác nhận *"Người này sẽ không vào lại được phòng này."*
* Sau xác nhận: người xem bị ngắt kết nối, đưa ra Sảnh kèm *"Bạn đã bị đuổi khỏi phòng thi đấu"*, bị chặn **đến khi phòng đóng**.
* Người bị đuổi quay lại bằng link hoặc mã thì thấy *"Bạn đã bị đuổi và chặn tham gia phòng cờ này!"*.

### US-ROOM-10 · Host rời, chuyển quyền, đóng phòng (P1) — BA 2.3
* Host rời lúc phòng `WAITING`: nếu còn người chơi thứ hai thì họ thành Host, phòng vẫn mở.
* Phòng đóng (`CLOSED`) chỉ khi không còn người chơi nào (kể cả chỉ còn người xem) và Host rời.
* Đang đấu (`PLAYING`): Host mất kết nối tạm thời **không** đổi Host; Host rời hoặc bị xử thua thì quyền Host chuyển cho người chơi còn lại; rời giữa ván tính là **Đầu hàng**.

### US-ROOM-11 · Sau ván: quay về phòng chờ (P1) — BA 2.3 mục 8
* Khi ván kết thúc phòng ở `FINISHED` tối đa 10 phút.
* Một người ngồi ghế rời, hoặc thành phần người ngồi ghế đổi, thì phòng về `WAITING`, người còn lại giữ ghế và quyền Host (nếu người rời là Host thì chuyển quyền).
* Người mới vào theo US-ROOM-05; mất kết nối ở `WAITING` giữ ghế 60 giây.
* Ví dụ nghiệm thu (BA 2.8): A và C đánh xong, A rời, C thành Host, C mời B xuống ghế, B và C bấm Sẵn sàng thì đếm ngược và đấu tiếp.

### US-ROOM-12 · Màn hình từ chối truy cập (P1) — DANH-MUC mục 14
* Hiện đúng thông báo theo lý do: phòng đầy, bị đuổi, phòng `LOCKED` (nội dung theo BA 4.3); chỉ có một nút *Quay về Sảnh*.

---

## Nhóm C — Bàn cờ

### US-BOARD-01 · Hiển thị bàn cờ (P1) — BA 3.1; [02](02-luat-co-tuong.md) mục 1
* Bàn SVG 9×10 giao điểm, thế khởi đầu đúng [02] mục 1.2; quân **chỉ chữ Hán** (帥仕相傌俥炮兵 / 將士象馬車砲卒), không chữ Việt/Latin.
* Người cầm Đen thấy bàn **lật ngược**; toạ độ gửi máy chủ luôn theo hệ gốc.
* Có nhãn đọc cho trình đọc màn hình theo toạ độ gốc (DESIGN §7.5).

### US-BOARD-02 · Chọn quân và gợi ý ô đi bằng click (P1) — BA 3.4
* Click quân của mình: hiện vòng chọn và các **chấm gợi ý** ở mọi giao điểm hợp lệ; quân đối phương ăn được có vòng cố định (không nhấp nháy).
* Click giao điểm hợp lệ: đi nước đó. Hủy chọn: click lại quân, click ô không hợp lệ, hoặc `Esc`.
* Chỉ chọn được quân của mình và chỉ khi tới lượt mình; người xem và ván kết thúc là chỉ đọc.

### US-BOARD-03 · Kéo thả (P1) — BA 3.4
* Giữ chuột/ngón tay kéo quân bay theo con trỏ; thả vào giao điểm hợp lệ thì đi; thả sai thì quân **trượt về chỗ cũ**.
* Hai cách (click và kéo thả) dùng song song, kết quả như nhau; dùng được bằng cảm ứng.

### US-BOARD-04 · Đánh dấu nước cuối và chiếu (P1) — BA 3.4; DESIGN §7.4
* Nước vừa đi: 4 góc vuông ở ô đi và ô đến.
* Khi bị chiếu: vòng cảnh báo quanh Tướng kèm chữ *"Đang bị chiếu"* và biểu tượng; **không nhấp nháy, không rung** (tối đa một nhịp sáng khi vừa bị chiếu; tắt khi bật giảm chuyển động).
* Không truyền thông tin chỉ bằng màu.

### US-BOARD-05 · Âm thanh (P1) — BA 3.4
* Có 4 âm: đi quân, ăn quân, chiếu, kết thúc ván; tạo bằng Web Audio API (không tải tệp âm thanh).
* Nút loa ở góc bàn cờ bật/tắt 1 chạm; trạng thái nhớ trong phiên.

---

## Nhóm D — Ván đấu online

### US-PLAY-01 · Đi nước qua mạng (P1) — BA 3.3; [04] mục 4
* Chỉ người ngồi ghế, đúng lượt, mới gửi được nước đi; máy chủ kiểm hợp lệ theo [02] và phát thế mới cho cả phòng (người chơi và người xem) trong **dưới 100 ms** trên mạng cục bộ.
* Nước không hợp lệ bị từ chối và quân về chỗ cũ; trạng thái ván không đổi.
* Lệnh gửi trùng (`commandId`) không làm đi hai lần; lệnh cũ (`matchVersion` lỗi thời) bị từ chối kèm thế mới.
* Quân vừa gửi hiển thị mờ chờ xác nhận (DESIGN §7.4) rồi cố định khi máy chủ xác nhận.

### US-PLAY-02 · Đồng hồ (P1) — BA 2.1, 3.3
* Mức 5/10/15 phút mỗi bên, **không cộng giây**; đồng hồ bên tới lượt chạy, bên kia dừng.
* Hết giờ thì ván kết thúc `TIMEOUT` và bên hết giờ thua; máy chủ tính giờ trước khi xét nước đi.
* Dưới 30 giây đồng hồ hiện biểu tượng cảnh báo và đổi màu **kèm chữ/biểu tượng**.

### US-PLAY-03 · Kết thúc ván và kết quả (P1) — BA 3.3; [02] mục 3.3
* Chiếu hết thua; hết nước đi (không bị chiếu) cũng thua; xử đúng thứ tự ưu tiên ở [02] mục 3.4.
* `MODAL-MATCH-RESULT` hiện thắng/thua/hoà, lý do kết thúc, chỉ nút *Rời phòng* (không Tái đấu, không Xem lại ở P1).
* Ván ngừng nhận nước đi; người xem thấy kết quả.

### US-PLAY-04 · Đầu hàng (P1) — BA 3.3
* Bấm *Đầu hàng* mở xác nhận (*"Bạn sẽ thua ván này ngay lập tức."*, mặc định focus ở Huỷ); đồng ý thì thua ngay, đối thủ thắng.

### US-PLAY-05 · Xin hoà (P1) — BA 3.3, 3.5, 3.6
* Gửi đề nghị: người nhận thấy `MODAL-DRAW-PROMPT` với đếm lùi 30 giây; người gửi thấy *"Đang chờ đối thủ trả lời…"* và nút *Rút đề nghị*.
* Đồng ý thì ván hoà; từ chối hoặc hết hạn thì ván tiếp tục.
* Mỗi người chỉ có **1 đề nghị đang chờ**; bị từ chối hoặc hết hạn thì **phải đi thêm 5 nước của mình** mới xin hoà lại (nút `DISABLED` kèm tooltip số nước còn phải chờ).

### US-PLAY-06 · Rời phòng giữa ván (P1) — BA 2.3, DANH-MUC modal 13
* Bấm *Rời phòng* khi đang đấu hiện xác nhận *"Rời lúc này được tính là đầu hàng."*; đồng ý thì thua ngay.

### US-PLAY-07 · Mất kết nối và kết nối lại (P1) — BA 8.3; DANH-MUC overlay 2
* Khi mất kết nối: lớp phủ không đóng bằng `Esc`. Nội dung theo vai trò:
  * Người chơi **đang đấu**: đếm lùi **60 giây**; nối lại thì tự tắt; quá hạn thì thua `DISCONNECT`; **đồng hồ ván vẫn chạy** (hết giờ trước thì `TIMEOUT`).
  * Người chơi ở phòng chờ/kết thúc: giữ ghế 60 giây rồi mất ghế (không xử thua).
  * Người xem: giữ chỗ 5 phút.
* Nối lại thành công: nhận lại thế cờ đầy đủ và đồng hồ chính xác.
* Cả hai cùng mất kết nối nhưng máy chủ vẫn chạy: **bên mất kết nối trước thua** nếu cả hai cùng quá hạn.
* Máy chủ tự ghi nhận sự cố của chính nó (khởi động lại): ván thành `INTERRUPTED`.

### US-PLAY-08 · Lặp thế, chiếu liên tục, không ăn quân (P1) — BA 3.5; [02] mục 4, 5
* Thế lặp lần thứ 3 xử theo bảng ở [02] mục 4 (chiếu liên tục thì bên chiếu thua; còn lại hoà); 120 nửa nước không ăn quân thì hoà.
* Chiếu hết luôn ưu tiên hơn các kết quả hoà.

### US-PLAY-09 · Người xem theo dõi trực tiếp (P1) — BA 4.1, 4.3
* Người xem thấy bàn cờ, đồng hồ, nước đi **thời gian thực** (không trễ cố ý), chỉ đọc.
* Người xem không thấy Kênh Riêng; không có nút bật camera/mic.
* Ngoài danh sách chung, người xem thấy số người xem hiện tại (X / N).

### US-PLAY-10 · Bảng nước đi (P1) — [02] mục 7
* Hiển thị danh sách nước đi theo ký hiệu tiếng Việt (ví dụ `Pháo 2 bình 5`), tự cuộn tới nước mới nhất.

---

## Nhóm E — Chat và camera/mic

### US-CHAT-01 · Hai kênh chat (P1) — BA 5.3
* **Người chơi:** thấy cả `[Kênh Riêng]` (mặc định mở) và `[Kênh Chung]`, có công tắc ẩn Kênh Chung. **Người xem:** chỉ thấy `[Kênh Chung]`.
* Tin ở Kênh Riêng chỉ hai người **đang ngồi ghế** nhận; người đổi chỗ sau không đọc tin cũ; người xem mới chỉ thấy tin Kênh Chung từ lúc vào.
* Chat phòng xoá khi phòng đóng.

### US-CHAT-02 · Giới hạn và bộ lọc từ cấm (P1) — BA 5.3
* Mỗi tin tối đa 200 ký tự; tối đa 5 tin/10 giây/người, vượt thì báo *"Bạn gửi quá nhanh"*.
* Từ cấm (tiếng Việt, tiếng Anh) bị che bằng `***` ở máy chủ **và** client, có chuẩn hoá dấu, khoảng trắng, ký tự chèn, ký tự thay thế (`0`→`o`, `1`→`i`).
* Sticker chưa có ở P1 (khay ẩn).

### US-MEDIA-01 · Camera và micro cho hai người chơi (P1) — BA 4.1, 5.4
* Mỗi người chơi bật/tắt camera và micro độc lập; **mặc định Tắt** khi vào phòng.
* Có 3 mức chia sẻ chọn riêng từng người: *Không chia sẻ / Chỉ đối thủ / Cả đối thủ và người xem* (mức 3 chỉ cho khi phòng có người xem).
* Hai người chơi thấy mặt và nghe tiếng nhau khi cả hai bật mức ≥ 2.
* Không ghi hình, ghi âm hoặc lưu.

### US-MEDIA-02 · Người xem chỉ xem/nghe (P1) — BA 4.1
* Người xem **không có** nút bật camera/mic; máy chủ không cấp quyền phát.
* Người xem chỉ thấy/nghe luồng của người chơi chọn mức *Cả đối thủ và người xem*.

### US-MEDIA-03 · Mở nhiều tab (P1) — BA 1.8
* Mở thêm tab vào cùng phòng thì tab mới **tiếp quản**; tab cũ nhận *"Phiên này đã được mở ở tab khác"*, chuyển chỉ đọc; camera/mic của tab cũ **tự dừng**, tab mới mặc định tắt.

---

## Nhóm F — Bạn bè (tối thiểu ở P1)

### US-FRIEND-01 · Tìm người và gửi lời mời (P1) — BA 5.5
* Tìm theo `username` (tiền tố, **không phân biệt hoa thường**); kết quả hiện thẻ tóm tắt (avatar, tên hiển thị, `@username`) và nút *Kết bạn*.
* Bấm *Kết bạn* thì gửi lời mời; có thể **thu hồi** lời mời đã gửi. Lời mời tự hết hạn sau 30 ngày.

### US-FRIEND-02 · Nhận và trả lời lời mời (P1) — BA 5.5
* Chuông ở thanh điều hướng liệt kê lời mời đang chờ; *Chấp nhận* thì thành bạn hai chiều; *Từ chối* thì không báo cho người gửi.
* Bị **cùng một người từ chối 2 lần** thì không gửi lại được lời mời cho người đó.

### US-FRIEND-03 · Danh sách bạn và trạng thái (P1) — BA 2.5, 5.5
* Hiện avatar, tên, `@username`, Elo (P2) và trạng thái 🟢 Online / 🟠 Đang đấu / ⚫ Offline.
* Nút *Nhắn tin* và *Thách đấu* `DISABLED` kèm tooltip *"Sắp ra mắt"*; **không có nút mời vào phòng** ở trang này.
* Huỷ kết bạn thì hai bên không còn là bạn.

### US-FRIEND-04 · Mời bạn bè online vào phòng (P1) — BA 2.5
* Trong `MODAL-INVITE` (người ngồi ghế mở), danh sách bạn hiện trạng thái; nút *Mời* chỉ sáng với bạn 🟢 Online.
* Bạn 🟠 Đang đấu thì nút `DISABLED` kèm tooltip *"Bạn bè đang trong ván khác"*; bạn ⚫ Offline thì kèm nhãn *"Ngoại tuyến"*.
* Người được mời thấy pop-up *"Người chơi [Tên Host] mời bạn tham gia phòng cờ [Tên phòng]"* với *Tham gia* và *Từ chối*, đếm lùi **30 giây** rồi tự tắt.
* Bấm *Tham gia* thì vào phòng theo US-ROOM-05.

### US-FRIEND-05 · Giới hạn (P1) — BA 5.5
* Tối đa 200 bạn và 50 lời mời đang chờ mỗi người; vượt thì nút `DISABLED` kèm tooltip.

---

## Nhóm G — Đánh với máy

### US-AI-01 · Chọn cấp độ và phe (P1) — BA 6.1, 6.3
* Ở Sảnh có 3 thẻ **Dễ / Trung bình / Khó**; bấm mở `MODAL-AI-SETUP` chọn phe **Đỏ / Đen / Ngẫu nhiên** (50/50 do máy chủ bốc).
* Cầm Đen thì máy (cầm Đỏ) **tự đi nước đầu** và bàn cờ lật cho Đen ở dưới.
* Không có nút gợi ý nước đi.

### US-AI-02 · Chơi với máy (P1) — BA 6.1, 6.3; [02] mục 9
* Người chơi đi, máy trả lời với **thời gian tính** (từ lúc bắt đầu tìm) trong ngân sách: Dễ ≤ 300 ms, Trung bình ≤ 1 000 ms, Khó ≤ 3 000 ms; hàng đợi chờ tiến trình rảnh (tối đa 3 giây, chỉ khi máy bận) không tính vào ngân sách nhưng báo *Thử lại* nếu quá; hết ngân sách thì máy đi nước tốt nhất đã tìm được.
* Ván với máy **không giới hạn thời gian** cho người chơi, không có cảnh báo chống treo ván; không tính Elo; **không có nút Xin hoà**, chỉ có *Đầu hàng*.
* Máy không bao giờ đi nước không hợp lệ.

### US-AI-03 · Kết thúc, bỏ dở và vào lại (P1) — BA 6.3
* Kết thúc khi chiếu hết, hết nước đi, đầu hàng hoặc hoà theo [02] mục 3.3; hiện `MODAL-MATCH-RESULT` chỉ có *Rời phòng*.
* Đóng tab hoặc mất kết nối: ván **giữ 30 phút** để vào lại cùng đường dẫn `/ai/:id`; Sảnh hiện banner *"Bạn có ván đang chơi dở — Quay lại"*. Quá 30 phút thì ván coi là *Bỏ dở* (không tính thắng/thua).
* Đi lại và lưu Lịch sử là P2, **không hiện** ở P1.

### US-AI-04 · Sự cố máy cờ (P1) — BA 6.1
* Nếu tiến trình máy cờ lỗi hoặc không phản hồi trong 10 giây thì ván chuyển *Bỏ dở*, báo *"Máy cờ gặp sự cố"* kèm nút *Thử lại*.

---

## Nhóm H — Giao diện chung

### US-UI-01 · Thanh điều hướng (P1) — DANH-MUC panel 1
* Cố định đầu mọi trang đã đăng nhập: logo, Sảnh, Bạn bè (P1); *Bảng xếp hạng* và *Lịch sử* hiện `DISABLED` kèm *"Sắp ra mắt"*; chuông lời mời; avatar và tên hiển thị với menu *Hồ sơ* / *Đăng xuất*.

### US-UI-02 · Sảnh (P1) — BA 2.0, Phần 11
* Có: Tạo phòng, Vào phòng bằng mã, Danh sách phòng công khai, 3 thẻ Đánh với máy. Thẻ **Đánh Hạng** hiện `DISABLED` + *"Sắp ra mắt"*; *Ghép ngẫu nhiên* **ẩn** ở P1.
* Có ván/phòng dở thì hiện banner quay lại; đang ngồi ghế ở phòng thì các nút tạo/ghép `DISABLED` kèm tooltip.

### US-UI-03 · Năm trạng thái cho mọi màn hình (P1) — DANH-MUC §2
* Mỗi màn hình và khung dữ liệu có đủ `SUCCESS`, `LOADING` (khung xương, không để trắng, không giật bố cục), `EMPTY` (giải thích + nút hành động), `ERROR` (tiếng Việt dễ hiểu + nút *Thử lại*), `DISABLED` (luôn có tooltip lý do).

### US-UI-04 · Responsive (P1) — BA 10.1
* Dùng được ở **360 px** trở lên, không cuộn ngang; bàn cờ chơi được bằng cảm ứng; ở màn nhỏ camera/chat có thể thu thành tab.
* Kiểm ở 360, 390, 1366, 1920 px (DESIGN §13).

### US-UI-05 · Trợ năng (P1) — AGENTS §6; DESIGN
* Tuân WCAG 2.1 AA: tương phản theo DESIGN §2, điều khiển bằng bàn phím (có vòng tiêu điểm), nhãn cho mọi nút chỉ có biểu tượng, `prefers-reduced-motion` tắt chuyển động, đếm lùi không đọc từng giây (dùng `aria-live` cho thông báo quan trọng).
* Không truyền thông tin chỉ bằng màu.

### US-UI-06 · Tính năng P2 hiển thị đúng quy tắc (P1) — DANH-MUC §7
* Lối vào điều hướng chính của tính năng P2 hiển thị `DISABLED` kèm *"Sắp ra mắt"*; chức năng nằm sâu trong màn hình P1 (QR, sticker, Xin đi lại, Xin đổi bên, Tái đấu, Xem lại, đi lại với máy, widget AI) **ẩn hoàn toàn**.

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

---

# P2 (đặc tả đã duyệt, làm sau MVP)

Mỗi mục dưới đây là **tóm tắt AC chính**; chi tiết quy tắc nằm ở BA đã dẫn. Khi lên kế hoạch P2, nhóm sẽ tách thành US như P1.

## Nhóm I — Tài khoản mở rộng (P2)

* **US-AUTH-P2-01 Khách** (BA 1.3): nút *Guest* mở `MODAL-GUEST-NAME` (2–20 ký tự, qua bộ lọc từ cấm, không cần duy nhất, gắn "(Khách)"); phiên 12 giờ nhưng **không hết khi đang ngồi ghế/đang đấu**; được: Đánh Thường, làm người xem, Đánh với máy, chat phòng, camera/mic khi ngồi ghế; không được: Ranked, Elo, kết bạn, đổi tài khoản; tối đa 1 phòng đang mở; ván có Khách không có Lịch sử phía Khách nhưng hiện ở lịch sử đối thủ chính thức với tên "Khách".
* **US-AUTH-P2-02 Google OAuth** (BA 1.2): đăng ký/đăng nhập bằng Google; chuyển sang `SCR-ONBOARDING` đặt Username + Mật khẩu, miễn OTP, `display_name` = `username`; email đã có tài khoản thì báo *"Email này đã được đăng ký"*; đăng nhập Google bằng email chưa đăng ký thì sang màn thiết lập; không tự gộp tài khoản; bỏ dở thì chưa có tài khoản.
* **US-AUTH-P2-03 Quên và đặt lại mật khẩu** (BA 1.7): luôn hiện cùng thông báo *"Nếu email này đã đăng ký, mã khôi phục đã được gửi"*; OTP theo BA 1.5; email truyền bằng trạng thái ứng dụng, không đặt lên URL; đổi xong đăng xuất mọi phiên khác.
* **US-AUTH-P2-04 Đổi username** (BA 1.6, 1.4): 4 bước **OTP trước, nhập tên mới sau**; không giới hạn tần suất; username cũ bị khoá 30 ngày, chỉ chủ cũ lấy lại được; toàn bộ dữ liệu giữ nguyên.

## Nhóm J — Đánh Hạng (P2)

* **US-RANK-01 Ghép trận Ranked** (BA 7.1, 7.2): nút *Tìm trận Xếp hạng* mở `MODAL-MATCHMAKING`; biên độ Elo ban đầu ≤ 100, mở thêm ±50 mỗi 10 giây, **dừng ở 60 giây** (±400); hai người có biên độ khác nhau thì dùng biên độ lớn hơn; quá 60 giây báo *"Chưa tìm được đối thủ phù hợp, hãy thử lại sau"* (không ghép với máy); *Hủy tìm trận* tự do khi chưa tìm thấy, khoá khi `MATCH_FOUND`; hàng đợi mất khi khởi động lại (báo *"Hàng đợi đã bị huỷ"*); cặp đã đủ 3 ván/24 giờ bị bỏ qua âm thầm.
* **US-RANK-02 Luật ván Ranked** (BA 8.1, 7.2): ghép ngẫu nhiên 100%, 10 phút mỗi bên, **cấm người xem, cấm đi lại, cấm Khách, không Tái đấu**; xin hoà chỉ sau **20 nước mỗi bên**; rời phòng giữa ván = Đầu hàng; đầu hàng ở bất kỳ nước nào vẫn trừ Elo thường.
* **US-RANK-03 Elo** (BA 7.1, 7.3): khởi tạo 1200, công thức FIDE, $K=32$ cho 30 ván Ranked hoàn tất đầu và $K=16$ sau đó; tối thiểu 100; `INTERRUPTED` và *Bỏ dở* không đổi Elo và không đếm; cấp bậc theo khoảng Elo (*Người mới* < 1200 … *Đại sư* ≥ 2000); chưa có ván Ranked thì nhãn *"Chưa xếp hạng"*.
* **US-RANK-04 Bảng xếp hạng** (BA 7.1): Top 50, cần ≥ 5 ván Ranked hoàn tất; đồng điểm: nhiều thắng hơn, rồi đạt Elo sớm hơn; dòng ghim vị trí của chính mình (người chưa đủ ván thấy *"Chưa xếp hạng — cần thêm X ván"*); chỉ tính ván Ranked; không theo ngày/tuần/mùa.
* **US-RANK-05 Mất kết nối ở Ranked** (BA 8.3): ân hạn 60 giây, quá hạn thua và trừ Elo; hai người cùng rớt nhưng máy chủ chạy thì bên rớt trước thua; sự cố máy chủ thì `INTERRUPTED` giữ Elo.
* **US-RANK-06 Phương tiện ở Ranked** (BA 5.4): camera/mic/chat Kênh Riêng cho hai người; hình/tiếng đối thủ mặc định **ẩn** phía người nhận cho đến khi bấm *Hiện*, có nút *Tắt ngay*.

## Nhóm K — Đánh Thường mở rộng (P2)

* **US-CAS-01 Ghép ngẫu nhiên Casual** (BA 2.0): chọn 1 trong 4 mức giờ; ghép cùng mức; chờ tối đa 60 giây; người vào hàng đợi trước là Host; vào phòng chờ ở trạng thái Sẵn sàng, đếm 3 giây; phòng mặc định `PUBLIC` kèm ghi chú.
* **US-CAS-02 Xin đi lại** (BA 3.2, 3.6): tối đa 3 lần thành công/bên/ván; lùi về trước nước gần nhất của người xin (1 hoặc 2 nước); chỉ xin được sau khi đã đi ≥ 1 nước; người xin không đi được trong lúc chờ; đồng hồ không hoàn lại; từ chối/hết hạn 30 giây không trừ lượt; chờ 3 nước của mình mới gửi lại.
* **US-CAS-03 Xin đổi bên** (BA 2.3): hạn 30 giây; đồng ý thì hoán ghế và reset Sẵn sàng; chờ 60 giây mới gửi lại sau từ chối/hết hạn.
* **US-CAS-04 Tái đấu** (BA 3.3 mục 7, 2.3): chỉ Đánh Thường; cả hai bấm thì đổi bên và **vào thẳng ván mới sau 3 giây**, không cần Sẵn sàng, trong **cùng phòng** (giữ danh sách chặn và người xem).
* **US-CAS-05 Mức giờ "Không giới hạn" và chống treo ván** (BA 2.1, 3.3 mục 5): sau 3 phút bên tới lượt không đi thì hiện banner không modal, đếm lùi 30 giây; *Tôi còn đây* đặt lại 3 phút nhưng **tối đa 2 lần liên tiếp chưa có nước mới**; hết 30 giây thì thua `INACTIVITY`.
* **US-CAS-06 Mã QR** (BA 2.2): `MODAL-INVITE` có QR của link mời, nút *Tải ảnh QR* và *Sao chép QR*.

## Nhóm L — Xã hội mở rộng (P2)

* **US-SOC-01 Chat 1-1** (BA 5.2, 8.2): chỉ giữa bạn bè; lưu lịch sử; huy hiệu tin chưa đọc; huỷ kết bạn thì ẩn, kết bạn lại thì hiện lại; lọc từ cấm.
* **US-SOC-02 Sticker** (BA 5.1): khay 12 biểu tượng gửi 1 chạm ở mọi kênh, dạng shortcode.
* **US-SOC-03 Thách đấu** (BA 2.7, 5.5): từ danh sách bạn, bạn 🟢 Online: tạo nhanh phòng Casual rồi gửi lời mời theo BA 2.5.
* **US-SOC-04 Mở rộng người xem** (BA 4): nâng trần người xem lên 5.

## Nhóm M — Lịch sử, xem lại, xuất dữ liệu (P2)

* **US-HIS-01 Lịch sử ván** (BA 6.2, 7.3): lọc *Tất cả / Đánh Hạng / Đánh Thường / Đấu với Máy*; hiển thị loại ván, đối thủ, phe, kết quả và lý do, biến động Elo; nhãn riêng *"Bị gián đoạn"* và *"Bỏ dở"* (không tính thắng/thua/hoà, không đổi Elo); ván AI của tài khoản được lưu.
* **US-HIS-02 Xem lại ván** (BA 6.2): chỉ **2 người chơi của ván** xem từ Lịch sử; không có link chia sẻ; ván Ranked cũng riêng tư; hiển thị chuỗi nước đi **hiệu lực** (không hiện nước đã đi lại); tua `|<<` `<` `>` `>>|`, tự phát 1,5 giây/nước, bấm dòng nước để nhảy.
* **US-HIS-03 Đi lại với máy** (BA 6.3): tối đa 3 lần, lùi 1 cặp nước (2 nửa nước), không cần máy đồng ý; huỷ tìm kiếm nếu máy đang nghĩ; bộ đếm *"Lượt đi lại: X/3"*; vô hiệu khi người chơi chưa đi nước nào.
* **US-HIS-04 Xuất FEN/PGN** (BA 9.1): nút *Sao chép FEN* và *Tải biên bản PGN* ở màn xem lại ([02] mục 7.4).

## Nhóm N — Tiện ích demo (P2)

* **US-DEMO-01 Widget thông số máy cờ** (BA 9.2): số nút đã duyệt, độ sâu thực tế, thời gian tính, nước dự tính tối ưu.
* **US-DEMO-02 Công cụ giả lập mạng** (BA 9.3): *Mô phỏng người chơi mất mạng* và *Tái kết nối tức thì*; chỉ bật khi `DEMO_MODE`; không có vai trò Admin.
* **US-DEMO-03 Chọn thiết bị khi nhiều tab** (BA 1.8): `MODAL-MEDIA-TAB-SWITCH` cho phép chuyển camera/mic sang tab mới hoặc huỷ.

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
