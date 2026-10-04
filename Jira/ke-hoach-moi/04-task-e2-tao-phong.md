# Task của Epic "Tạo phòng chơi" (6 task)

**Ngày:** 2026-10-04 · **Trạng thái:** đề xuất, chờ PO duyệt · Chưa tạo gì trên Jira · Viết theo `00-chuan-description.md` và mẫu `00b`.

Mã task `T-01` đến `T-62` đánh theo **thứ tự làm** (số nhỏ làm trước, mỗi task chỉ cần các task có số nhỏ hơn). Một số task gộp nhiều việc nhỏ cùng mục đích thành một task. Ngày Sprint: 1 = 04/10–07/10, 2 = 08/10–10/10, 3 = 11/10–14/10, 4 = 15/10–17/10.

---

### T-14 — Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng
**Thuộc Epic:** Tạo phòng chơi · **Thành phần:** Frontend · **Sprint:** 2 (08/10–10/10)
**Phải xong trước:** *Soạn "hợp đồng chung" giữa trình duyệt và máy chủ (T-02)*: nhận được danh sách yêu cầu tạo, vào, xem danh sách và các lỗi. *Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo) (T-08)*: nhận được nút, ô nhập, hộp thoại, thông báo; nhận được trang chạy được và cách chuyển trang.

**Mục tiêu**
Dựng **thanh điều hướng** và **khung Sảnh** thống nhất để các phần khác (phòng, ván với máy, bạn bè) gắn nội dung vào đúng chỗ. Người dùng thấy mọi chức năng của giai đoạn 1 và biết đường quay lại chỗ chơi đang giữ.

Dựng **Sảnh** và hộp thoại **tạo phòng**, ô **nhập mã** để vào phòng. Giao diện chỉ gửi ý định; **không tự cấp ghế hay tạo phòng**.

**Việc cần làm (làm lần lượt)**
1. Thanh điều hướng đăng nhập: logo, Sảnh, Bạn bè, **chỗ gắn chuông lời mời**, ảnh đại diện và tên với menu Hồ sơ/Đăng xuất. Bảng xếp hạng và Lịch sử **mờ kèm "Sắp ra mắt"**.
2. Khung Sảnh có **chỗ gắn**: phòng (tạo/vào/danh sách), ba thẻ Đánh với máy, **băng "quay lại"**. Thẻ Đánh Hạng mờ kèm "Sắp ra mắt"; Ghép ngẫu nhiên ẩn.
3. Nếu người dùng **đang ngồi ghế phòng hoặc có ván dở**: hiện băng quay lại; các nút tạo mới bị mờ có chú thích lý do (không cho tạo chỗ chơi thứ hai).
4. Mục **Luật chơi** thu gọn/mở rộng bằng chuột và bàn phím, nêu: hết nước đi là thua, không có luật đuổi quân riêng; viết theo tài liệu luật cờ; **không** thêm trang hay hộp thoại mới.
5. Khung bị lỗi tải một chỗ thì chỉ chỗ đó báo lỗi, **không mất cả khung**.
6. Gắn nội dung phòng vào khung Sảnh có sẵn (không dựng thanh điều hướng thứ hai).
7. **Hộp thoại tạo phòng:** tên phòng (1–60 ký tự), giờ **5/10/15 phút** (mặc định 10), kiểu phòng (công khai hoặc chỉ mã), số người xem **0–5 (mặc định 5)**. Kiểm trước khi gửi, giữ lại dữ liệu khi lỗi.
8. **Ô nhập mã** vào phòng.
9. **Danh sách phòng**: trạng thái đang tải, trống, lỗi (có nút "Thử lại").
10. Nếu người dùng **đang có ghế hoặc ván dở**: hiện thanh "Quay lại phòng/ván" và nút tạo mới bị mờ có giải thích.
11. Mục **Luật chơi** thu gọn được bằng bàn phím, ngay trong Sảnh.
12. Các chức năng chưa làm (ghép ngẫu nhiên, đánh hạng, khách…) **mờ có chú thích**, không bấm được.
13. Đủ 5 trạng thái cho từng khung.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Mở Sảnh, Bạn bè, Hồ sơ | Đúng trang; chức năng chưa làm không kích hoạt được |
| Dữ liệu mẫu: còn ghế/ván máy và không có | Đúng băng quay lại / nút mờ có lý do |
| Mở và thu Luật chơi bằng chuột và bàn phím | Đúng nội dung, không mở trang mới |
| Một chỗ gắn tải lỗi | Báo lỗi rõ chỗ đó, không mất cả khung |
| Mở hộp thoại tạo phòng | Mặc định 10 phút, 5 người xem; chỉ có kiểu công khai/chỉ mã; chỉ giờ 5/10/15 |
| Đang có ghế hoặc ván dở | Thanh quay lại hiện; nút tạo mới mờ, có lý do |
| Danh sách tải lỗi / rỗng | Hai trạng thái khác nhau; có "Thử lại" / "Tạo phòng" đúng |
| Mở/thu Luật chơi bằng bàn phím | Gọn, đúng nội dung, không mở trang mới |

**Cách tự kiểm tra**
Chuẩn bị: dữ liệu giả cho trạng thái chỗ chơi; chạy giao diện với dữ liệu giả.

| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Mở Sảnh, Bạn bè, Hồ sơ | Đúng trang; mục chưa làm mờ |
| 2 | Dữ liệu mẫu có và không có chỗ chơi | Băng quay lại; nút mờ có lý do |
| 3 | Mở/thu Luật chơi | Đúng nội dung |
| 4 | Làm một chỗ gắn lỗi | Chỉ chỗ đó báo lỗi |
| 5 | Mở hộp thoại; đổi giá trị; thử sai biên | Mặc định đúng; chỉ giá trị hợp lệ |
| 6 | Giả lập đang có ghế | Thanh quay lại, nút tạo mờ có lý do |
| 7 | Giả lập danh sách lỗi và rỗng | Hai trạng thái khác nhau, nút đúng |
| 8 | Mở và thu Luật chơi bằng bàn phím | Đúng |
| 9 | Xem chức năng chưa làm | Mờ, có chú thích |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt; dùng được bằng bàn phím; kèm ảnh các trạng thái.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý. Dữ liệu thật của từng chỗ gắn do các task của phòng, bạn bè, ván với máy nối ở task tích hợp tương ứng. Chưa nối máy chủ thật nên **không** coi là tạo phòng thật đã đạt (nối ở T-29).
**Bàn giao cho task sau:** khung điều hướng và Sảnh cho giao diện phòng, bạn bè, ván với máy; Sảnh, hộp thoại tạo phòng và ô nhập mã cho task tích hợp.
**Không thuộc task này:** gọi máy chủ thật (làm ở task nối web với máy chủ); ván với máy; bạn bè; trang Luật chơi riêng; chọn cấp độ máy; mã QR.

---

### T-15 — Giao diện: phòng chờ và màn từ chối vào phòng
**Thuộc Epic:** Tạo phòng chơi · **Thành phần:** Frontend · **Sprint:** 2 (08/10–10/10)
**Phải xong trước:** *Soạn "hợp đồng chung" giữa trình duyệt và máy chủ (T-02)*: nhận được thông tin ghế, Sẵn sàng, đếm giờ và các lỗi. *Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo) (T-08)*: nhận được trang chạy được và cách chuyển trang; nhận được nút, hộp thoại, thông báo, chú thích khi mờ.

**Mục tiêu**
Dựng **phòng chờ** (hai ghế, nút Sẵn sàng, đếm 3 giây, chia sẻ mã và đường dẫn) và **màn từ chối vào phòng** (nêu lý do và đưa về Sảnh). Mọi thứ hiển thị đúng theo thông tin máy chủ, kể cả khi thông tin đổi lúc đang mở.

**Việc cần làm (làm lần lượt)**
1. **Hai ghế** (Đỏ và Đen) có tên người, chủ phòng, trạng thái Sẵn sàng.
2. **Nút Sẵn sàng**: gửi ý định; **đếm 3 giây** theo mốc máy chủ gửi về; nếu thông tin mới cho thấy ai bỏ sẵn sàng thì dừng đếm. Giao diện **không tự chuyển sang "Đang chơi"**.
3. **Hộp thoại mời:** hiện mã và đường dẫn, nút sao chép; **chỉ người đang ngồi ghế thấy**. Nếu người dùng mất ghế khi hộp đang mở thì phần mời biến mất.
4. Sao chép lỗi (bị từ chối quyền clipboard) thì **không báo "đã sao chép"**, vẫn cho cách dùng thủ công.
5. **Màn từ chối:** phòng đầy, bị đuổi, phòng khoá… mỗi lý do một câu rõ, một nút về Sảnh.
6. Đủ 5 trạng thái, dùng được bằng bàn phím.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Đang đếm mà một bên bỏ sẵn sàng | Dừng đếm, không có ván |
| Mất ghế khi hộp mời đang mở | Phần mời gỡ ngay |
| Từ chối quyền sao chép | Không báo thành công giả; còn đường dẫn để dùng thủ công |
| Bị từ chối vì đầy / bị đuổi / khoá | Đúng lý do, một nút về Sảnh |

**Cách tự kiểm tra**
Chuẩn bị: dữ liệu giả cho ghế, đếm giờ, thu hồi, quyền.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Bắt đầu đếm rồi giả lập bỏ sẵn sàng | Dừng đếm, không tạo ván |
| 2 | Mở hộp mời rồi giả lập mất ghế | Phần mời gỡ |
| 3 | Từ chối quyền sao chép | Không báo thành công giả |
| 4 | Xem màn từ chối với từng lý do | Đúng câu chữ, một hành động |
| 5 | Dùng bàn phím và xem 5 trạng thái | Đủ, dùng được |

**Khi nào chuyển cho người kiểm thử:** cả 5 dòng đạt, kèm ảnh.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Chưa nối máy chủ thật nên chưa chứng minh vào phòng thật (T-29).
**Bàn giao cho task sau:** phòng chờ và màn từ chối cho cài đặt phòng (T-32), tích hợp và bạn bè.
**Không thuộc task này:** đổi chỗ, khoá, đuổi (T-32), mã QR, xin đổi bên, mời bạn bè.

---

### T-17 — Máy chủ: trạng thái phòng, mỗi người một chỗ chơi và tạo phòng
**Thuộc Epic:** Tạo phòng chơi · **Thành phần:** Room & Social · **Sprint:** 2 (08/10–10/10)
**Phải xong trước:** *Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập (T-04)*: nhận được bảng phòng, người tham gia, ván và ràng buộc "một ghế mỗi người". *Dựng khung máy chủ: nhận kết nối có xác thực và chuyển lệnh (T-07)*: nhận được cách nhận lệnh có xác thực người gửi. *Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ (T-10)*: nhận được cách trả lại kết quả cũ khi gửi lại cùng một yêu cầu; nhận được hàm kiểm tên phòng; nhận được cơ chế giới hạn tạo phòng 5 lần trong 10 phút.

**Mục tiêu**
Làm "bộ não" của phòng: phòng đang ở trạng thái nào, ai ngồi ghế nào, và đảm bảo **mỗi người chỉ có một chỗ chơi** dù nhiều yêu cầu đến cùng lúc. Các task sau (tạo phòng, vào phòng, ghế…) đều dựa vào đây.

Cho người dùng tạo phòng: nhận về phòng mới, mã 8 ký tự và đường dẫn mời, mình là chủ phòng ngồi ghế Đỏ. Nếu mạng chập chờn và người dùng gửi lại cùng yêu cầu, **không được tạo thêm phòng** mà phải trả lại phòng cũ.

**Việc cần làm (làm lần lượt)**
1. Định nghĩa các trạng thái của phòng: **Đang chờ**, **Đang chơi**, **Đã kết thúc**, **Đã đóng**; và kiểu riêng tư (công khai, chỉ mã, khoá) tách riêng khỏi trạng thái.
2. Làm "sổ chỗ chơi": ghi mỗi người đang giữ chỗ nào (ghế trong phòng hoặc ván với máy). Xin chỗ và trả chỗ đều dưới khoá theo người, nên hai yêu cầu cùng lúc không thể cùng thành công.
3. Xử lý các thay đổi phòng **lần lượt từng cái một**, không chồng nhau.
4. Nếu bước sau thất bại, **trả lại chỗ đã xin** để không còn "chỗ ma".
5. Phòng đã đóng thì **không mở lại**, lệnh đến trễ bị bỏ qua.
6. Danh tính người gửi lấy từ phiên đăng nhập, **không tin** thông tin trình duyệt tự khai.
7. Xác định người gửi; xem yêu cầu này đã được xử lý chưa (nếu rồi, trả kết quả cũ, kết thúc).
8. Với yêu cầu mới: kiểm tra giới hạn **5 lần trong 10 phút**.
9. Kiểm tra dữ liệu: tên 1–60 ký tự và không chứa từ cấm; giờ 5/10/15 (mặc định 10); kiểu công khai hoặc chỉ mã; số người xem 0–5 (mặc định 5).
10. Kiểm tra người này **chưa có chỗ chơi nào** khác.
11. Ghi phòng, chủ phòng ngồi ghế Đỏ, mã 8 ký tự không trùng và biên lai, **cùng lúc**; chỉ sau khi ghi xong mới trả kết quả.
12. Trả phòng, mã và đường dẫn mời; chỉ người **đang ngồi ghế** mới đọc được đường dẫn mời và mã.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Một người xin hai chỗ cùng lúc (phòng và ván với máy) | Chỉ một chỗ thành công |
| Bước sau lỗi sau khi đã xin chỗ | Chỗ được trả lại, không để chỗ ma |
| Đổi người ngồi ghế | Trạng thái "Sẵn sàng" của cả hai về chưa sẵn sàng |
| Gửi lệnh vào phòng đã đóng | Bị bỏ qua, phòng không mở lại, không lộ dữ liệu |
| Trình duyệt khai tên người khác | Không chiếm được chỗ của người đó |
| Dữ liệu hợp lệ | Có phòng, chủ phòng ghế Đỏ, mã 8 ký tự |
| Tên chứa từ cấm hoặc giờ ngoài 5/10/15 | Từ chối, nêu lý do |
| Mất kết quả, gửi lại cùng yêu cầu (dù đã có ghế) | Trả lại đúng phòng đã tạo, không báo "đang có chỗ" như yêu cầu mới |
| Yêu cầu mới khi đã có chỗ chơi | Từ chối, không tạo phòng ma |
| Tạo lần thứ 6 trong 10 phút | Bị chặn; hết cửa sổ thì xét lại |
| Lỗi khi ghi | Không báo thành công giả |
| Người ngoài xin đường dẫn mời | Không nhận được |

**Cách tự kiểm tra**
Chuẩn bị: bài thử tự động có thể gửi nhiều yêu cầu cùng lúc.

| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Một người xin chỗ phòng và chỗ ván với máy cùng lúc | Đúng một chỗ |
| 2 | Cho một bước sau thất bại | Không còn chỗ ma |
| 3 | Đổi người ngồi ghế | Cả hai về chưa sẵn sàng |
| 4 | Gửi lệnh vào phòng đã đóng | Không mở lại, không dữ liệu trái quyền |
| 5 | Khai tên người khác | Không chiếm được chỗ |
| 6 | Tạo phòng với các giá trị mặc định, rồi các biên (tên 1 và 60 ký tự, giờ 5/10/15, người xem 0 và 5), tên cấm | Hợp lệ tạo được; sai bị từ chối; chủ phòng ghế Đỏ, mã 8 ký tự |
| 7 | Tạo xong, giả vờ mất kết quả, gửi lại cùng yêu cầu | Trả đúng phòng cũ |
| 8 | Đang có ghế, gửi yêu cầu tạo mới | Từ chối |
| 9 | Tạo 5 lần rồi lần 6 trong 10 phút; thử lại sau hạn | Lần 6 bị chặn; sau hạn xét lại |
| 10 | Người không ngồi ghế xin đường dẫn; gây lỗi ghi | Không nhận được; không báo thành công giả |

**Thông tin vào**
| Thông tin | Giá trị hợp lệ |
|---|---|
| Tên phòng | 1–60 ký tự, không từ cấm |
| Giờ mỗi bên | 5, 10 hoặc 15 phút (mặc định 10) |
| Kiểu phòng | Công khai hoặc chỉ mã |
| Số người xem tối đa | 0–5 (mặc định 5) |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý. Bài thử với ván máy thật chỉ chạy được sau khi có ván với máy. Ở đây kiểm bằng sổ chỗ chơi.
**Bàn giao cho task sau:** trạng thái phòng và sổ chỗ chơi cho tạo phòng, vào phòng, ván với máy, bạn bè; phòng, mã và đường dẫn mời cho vào phòng, riêng tư và giao diện.
**Không thuộc task này:** vào phòng, ghế và Sẵn sàng (các task kế tiếp); đánh hạng; mã QR; giờ "không giới hạn". Thu hồi đường dẫn khi khoá phòng làm ở task kiểu phòng.

---

### T-21 — Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh
**Thuộc Epic:** Tạo phòng chơi · **Thành phần:** Room & Social · **Sprint:** 2 (08/10–10/10)
**Phải xong trước:** *Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ (T-10)*: nhận được cách nhận ra yêu cầu gửi lại; nhận được cơ chế chặn nhập sai mã. *Máy chủ: trạng thái phòng, mỗi người một chỗ chơi và tạo phòng (T-17)*: nhận được phòng, mã, đường dẫn và sức chứa.

**Mục tiêu**
Cho người dùng vào phòng và xếp họ đúng chỗ: **ghế trống thì ngồi ghế, hết ghế thì làm người xem, hết cả hai thì từ chối**. Mọi quyết định làm tại thời điểm nhận yêu cầu; đường dẫn không phải "vé giữ chỗ".

**Việc cần làm (làm lần lượt)**
1. Xác định người gửi; nếu yêu cầu đã xử lý (gửi lại), trả kết quả cũ, **không xếp chỗ lần nữa**.
2. Kiểm tra giới hạn nhập sai mã (**10 lần/phút**, quá thì chặn **5 phút**, đếm theo phiên).
3. Tìm phòng bằng mã, đường dẫn hoặc mã phòng từ Sảnh. **Không** tự sửa mã sai thành phòng khác.
4. Kiểm quyền và sức chứa, rồi xếp chỗ:
   - Vào bằng **đường dẫn hoặc mã**: ghế trống → ngồi ghế; hết ghế, còn chỗ xem → người xem; hết cả hai → từ chối.
   - Vào từ **Sảnh**: luôn là **người xem** (kể cả còn ghế); hết chỗ xem thì từ chối.
   - Người đã bị đuổi hoặc phòng đã khoá/đóng: từ chối.
5. Trả thông tin phòng theo quyền của người đó; lỗi không lộ dữ liệu.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Vào bằng mã khi còn ghế / hết ghế còn chỗ xem | Ngồi ghế / làm người xem, có thông báo |
| Phòng đầy cả ghế và chỗ xem (hoặc số người xem là 0) | Từ chối với lỗi thật; hai người tranh chỗ cuối thì chỉ một vào được |
| Vào từ Sảnh khi còn ghế | Vẫn làm người xem |
| Bị đuổi, phòng khoá hoặc đường dẫn đã thu hồi | Không có tư cách nào, không nhận dữ liệu |
| Mất kết quả, gửi lại sau khi ghế đã kín | Không xếp thêm; không trả dữ liệu ngoài quyền |
| Sai mã đến lần thứ 10 trong 1 phút | Chặn 5 phút, theo từng phiên; hết chặn thì xét lại |

**Cách tự kiểm tra**
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Vào bằng đường dẫn khi còn ghế, rồi khi ghế kín | Ngồi ghế; rồi làm người xem |
| 2 | Vào phòng đầy; hai người tranh chỗ cuối | Không vượt sức chứa; người thua nhận lỗi thật |
| 3 | Vào từ Sảnh khi còn ghế | Làm người xem |
| 4 | Người đã bị đuổi, phòng đã khoá vào lại (dùng dữ liệu mẫu) | Không được vào |
| 5 | Gửi lại cùng yêu cầu sau khi ghế đã kín | Không có chỗ mới |
| 6 | Nhập sai mã 10 lần; thử phiên khác; thử sau 5 phút | Chặn riêng từng phiên; hết hạn thì xét lại |

**Khi nào chuyển cho người kiểm thử:** cả 6 dòng đạt, gồm bộ giới hạn thật.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Ở đây việc "bị đuổi" và "khoá" kiểm bằng dữ liệu mẫu; chạy thật nghiệm thu ở task tích hợp phòng nâng cao (T-40).
**Bàn giao cho task sau:** chức năng vào phòng cho ghế, riêng tư, chat, bạn bè.
**Không thuộc task này:** tự xuống ghế từ vai xem (T-38), mã QR, khách.

---

### T-25 — Máy chủ: chọn ghế, Sẵn sàng, đếm 3 giây, bắt đầu ván
**Thuộc Epic:** Tạo phòng chơi · **Thành phần:** Room & Social · **Sprint:** 2 (08/10–10/10)
**Phải xong trước:** *Luật cờ: mô hình bàn cờ, thế khởi đầu, nước đi của từng loại quân (T-05)*: nhận được hàm tạo thế cờ ban đầu, Đỏ đi trước. *Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh (T-21)*: nhận được người đã vào đúng ghế, thông tin phòng có thẩm quyền.

**Mục tiêu**
Chủ phòng chọn ghế Đỏ/Đen, hai người bấm **Sẵn sàng**, đếm ngược **3 giây**, rồi **bắt đầu ván**: tạo đúng một ván với thế cờ ban đầu. Nếu trong lúc đếm có ai bỏ "Sẵn sàng" hay rời đi thì **không tạo ván**.

**Việc cần làm (làm lần lượt)**
1. **Chọn ghế:** chủ phòng khi còn một mình có thể đổi giữa Đỏ và Đen; người thứ hai vào ghế còn lại. Đổi người ngồi ghế thì **cả hai về chưa sẵn sàng**.
2. **Sẵn sàng:** mỗi người ngồi ghế bật hoặc tắt; người xem không có quyền này.
3. Khi cả hai sẵn sàng, bắt đầu **đếm ngược 3 giây** theo đồng hồ máy chủ. Mọi thay đổi làm huỷ đếm cũ (và đếm cũ không được chạy tiếp).
4. Hết 3 giây, **kiểm lại điều kiện** (đủ hai người, cả hai còn sẵn sàng), rồi tạo **một** ván: thế cờ ban đầu, lượt Đỏ, mức giờ, thời điểm bắt đầu do máy chủ ghi; phòng sang "Đang chơi".
5. Ghi xong mới phát tín hiệu bắt đầu; ghi lỗi thì **không** phát tín hiệu giả.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Hai người sẵn sàng đủ 3 giây | Đúng một ván: thế ban đầu, lượt Đỏ, mức giờ, thời điểm bắt đầu |
| Bỏ sẵn sàng hoặc rời ngay trước hạn | Huỷ đếm, không có ván |
| Lệnh đếm cũ chạy muộn hoặc chạy hai lần | Không có ván thứ hai |
| Người xem bấm sẵn sàng | Từ chối |
| Ghi ván lỗi | Hoàn tác, không phát bắt đầu giả |

**Cách tự kiểm tra**
Chuẩn bị: đồng hồ giả để rút ngắn 3 giây.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Chủ phòng một mình đổi Đỏ/Đen; thay người ngồi rồi bấm sẵn sàng | Ghế đúng; thay người thì hai bên về chưa sẵn sàng |
| 2 | Cả hai sẵn sàng đủ 3 giây | Một ván, thế ban đầu đúng, lượt Đỏ, có mức giờ và thời điểm bắt đầu |
| 3 | Bỏ sẵn sàng sát hạn; gọi lại lệnh cũ | Không có ván |
| 4 | Người xem bấm; gây lỗi ghi | Từ chối; hoàn tác |

**Khi nào chuyển cho người kiểm thử:** cả 4 dòng đạt.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Task này chỉ **khởi tạo** ván; đồng hồ chạy thật và xử lý nước đi do các task ván làm.
**Bàn giao cho task sau:** ván vừa bắt đầu (mã ván, thế cờ, lượt, mốc giờ) cho Epic Hai người đánh cờ qua mạng.
**Không thuộc task này:** đồng hồ chạy, nước đi, xin đổi bên, tái đấu.

---

### T-29 — Nối web với máy chủ: tạo phòng, vào phòng, ghế, Sẵn sàng, bắt đầu ván
**Thuộc Epic:** Tạo phòng chơi · **Thành phần:** Frontend, Room & Social · **Sprint:** 2 (08/10–10/10)
**Phải xong trước:** *Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng (T-14)*: nhận được màn tạo/vào đã dựng. *Giao diện: phòng chờ và màn từ chối vào phòng (T-15)*: nhận được màn phòng chờ đã dựng. *Máy chủ: chọn ghế, Sẵn sàng, đếm 3 giây, bắt đầu ván (T-25)*: nhận được chức năng ghế, Sẵn sàng và một ván có mã.

**Mục tiêu**
Nối giao diện với máy chủ thật để chứng minh **hai người, trên hai trình duyệt, vào cùng một phòng và bắt đầu ván**. Đây là điểm kiểm tra đầu tiên rằng web và máy chủ khớp nhau.

**Việc cần làm (làm lần lượt)**
1. Nối hộp thoại tạo phòng, ô nhập mã, phòng chờ với chức năng thật ở máy chủ (không dùng dữ liệu giả).
2. Dùng tài khoản thử và cách xác thực thử **cô lập**, có ghi rõ là thử; **không** bật cách bỏ qua kiểm tra trên sản phẩm.
3. Chạy kịch bản hai người: A tạo phòng, B vào bằng mã hoặc đường dẫn, cả hai Sẵn sàng.
4. So sánh dữ liệu hai phía: cùng mã ván, thế cờ, lượt đi, thời điểm bắt đầu.
5. Thử huỷ đếm, tranh chỗ cuối, gửi lại yêu cầu khi mất phản hồi.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| A tạo phòng, B vào bằng mã/đường dẫn | Cùng phòng; A là chủ phòng ghế Đỏ, B ở ghế còn lại |
| Hai bên sẵn sàng đủ 3 giây | Hai phía cùng mã ván, thế cờ, lượt Đỏ, thời điểm bắt đầu |
| Một bên bỏ sẵn sàng trước hạn | Không có ván |
| Tranh chỗ cuối; gửi lại khi mất phản hồi | Không vượt sức chứa, không nhân đôi |

**Cách tự kiểm tra**
Chuẩn bị: máy chủ và web chạy thử, hai trình duyệt (hai tài khoản thử).
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | A tạo phòng, B vào bằng giao diện | Cùng phòng, A Đỏ chủ phòng |
| 2 | Cả hai sẵn sàng đủ 3 giây | Cùng mã ván, thế cờ, lượt, thời điểm bắt đầu |
| 3 | Một bên bỏ sẵn sàng trước hạn | Không có ván |
| 4 | Tranh chỗ cuối; mất phản hồi rồi gửi lại | Không vượt chỗ, không nhân đôi |

**Khi nào chuyển cho người kiểm thử:** cả 4 dòng đạt trên môi trường thử, kèm video.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. **Chưa** gồm đồng hồ chạy và nước đi (task ván), cũng chưa kiểm người dùng chưa hoàn tất đăng ký.
**Bàn giao cho task sau:** luồng phòng cơ bản chạy thật cho task đi nước đầu tiên và các task phòng nâng cao.
**Không thuộc task này:** khoá, đuổi, đổi chỗ (T-40), đồng hồ ván, đăng nhập thật (T-27).
