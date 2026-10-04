# Story của các Epic: "Hai người đánh cờ qua mạng"; "Phòng công khai, khoá phòng và người xem"; "Chat, camera và micro"; "Đánh với máy theo cấp độ" (12 Story)

**Ngày:** 2026-10-04 · **Trạng thái:** đề xuất, chờ PO duyệt · Chưa tạo gì trên Jira · Viết theo `00-chuan-description.md` và mẫu `00b`.

**Cách đọc:** mỗi Story là một việc người dùng muốn làm. Story gộp nhiều việc nhỏ cùng một trải nghiệm được ghi "Phần 1, Phần 2…". Phần "Các việc nhỏ làm nên Story" liệt kê các Task được **liên kết** với Story (quan hệ "liên quan"; Task nằm dưới Epic).

---

### Story 15 — Đi nước qua mạng và bảng nước đi
**Thuộc Epic:** Hai người đánh cờ qua mạng

**Câu chuyện:** Là người chơi, tôi muốn **đi nước và thấy đối thủ cùng người xem thấy ngay**, kèm bảng các nước đã đi.

**Gồm những việc người dùng làm**
1. Đi nước qua mạng
2. Bảng nước đi

**Điều kiện để dùng:**
- *Phần 1:* ván đã bắt đầu, đến lượt mình.
- *Phần 2:* ván có ít nhất một nước.

**Khi có lỗi:**
- *Phần 1:* nước không hợp lệ → quân về chỗ cũ, ván không đổi; mất phản hồi → gửi lại không đi hai nước; lỗi ghi dữ liệu → thử lại, vẫn lỗi thì tạm dừng ghi và đóng băng đồng hồ.

**Không thuộc Story này:**
- *Phần 1:* đồng hồ, kết thúc ván.
- *Phần 2:* tua lại nước đi, xuất ván cờ.

**Các quy tắc:**
- *Phần 2:* ký hiệu tính theo **phe người đi**, không theo bàn đang lật; mỗi nước một dòng, không thiếu không trùng khi nối lại.

**Các bước người dùng làm và hệ thống phản hồi**
*Phần 1:*
1. Người chơi đi một nước (bấm hoặc kéo); quân hiển thị **mờ** chờ xác nhận.
2. Máy chủ kiểm tra: đúng ghế, đúng lượt, nước hợp lệ.
3. Máy chủ xác nhận và phát thế cờ mới cho cả phòng; quân hết mờ.
*Phần 2:*
1. Bảng hiện danh sách nước đi bằng **ký hiệu tiếng Việt** (ví dụ "Pháo 2 bình 5", "Mã 8 tiến 7").
2. Tự cuộn tới nước mới nhất.

**Các quy tắc**
*Phần 1:*
- **Máy chủ quyết định**, không tin thế cờ do trình duyệt gửi.
- Người xem nhận thế mới trong **dưới 100 ms** trên mạng nội bộ.
- Lệnh gửi trùng (cùng mã yêu cầu) chỉ có một tác dụng; lệnh dựa trên bản ván cũ bị từ chối kèm thế mới.

**Điều kiện chấp nhận**
*Phần 1:*
1. Hai người luân phiên đi trên hai trình duyệt, cùng thế cờ, cùng lượt, cùng nước vừa đi.
2. Nước sai bị từ chối, thế không đổi.
3. Gửi trùng chỉ có một nước trong dữ liệu; gửi bản cũ bị từ chối.
4. Người xem, người ngoài và người sai lượt không đi được.
5. Người xem nhận thế mới dưới 100 ms (đo ở bài tải).
*Phần 2:*
1. Ký hiệu đúng ở cả hai phe, quân trùng cột vẫn phân biệt được.
2. Nối lại thì danh sách đúng thứ tự, không trùng dòng.
3. Ván chưa có nước hiện trạng thái trống đúng.

**Các việc nhỏ làm nên Story:** T-26 (Giao diện ván: bàn cờ nối mạng, đồng hồ, nút, hộp kết quả, khung xin hoà); T-28 (Máy chủ: bộ xử lý lệnh của ván và xử lý nước đi); T-30 (Nối web với máy chủ: đi nước, đồng bộ thế cờ giữa hai trình duyệt); T-42 (Bảng nước đi: ký hiệu tiếng Việt và hiển thị); T-46 (Kiểm thử luật cờ: đếm nước đi độc lập và bộ kiểm thử chạy tự động); T-50 (Nối web với máy chủ: đồng hồ, kết thúc ván, mất kết nối, người xem, bảng nước đi); T-61 (Nghiệm thu phi chức năng: bài tải, quyền camera/micro, trình duyệt, bảo mật).

---

### Story 16 — Đồng hồ ván
**Thuộc Epic:** Hai người đánh cờ qua mạng

**Câu chuyện:** Là người chơi, tôi muốn **đồng hồ chạy công bằng** và thua nếu hết giờ.

**Điều kiện để dùng:** ván đang diễn ra.

**Các quy tắc:** **máy chủ tính giờ**; trừ giờ trước khi xét nước đi; đồng hồ trên trình duyệt chỉ để hiển thị.

**Khi có lỗi:** lỗi ghi dữ liệu thì **đóng băng cả hai đồng hồ**; quá 30 giây không hồi phục thì ván gián đoạn.

**Không thuộc Story này:** giờ "không giới hạn", hoàn hay cộng giờ.

**Các bước người dùng làm và hệ thống phản hồi**
1. Mỗi bên có 5, 10 hoặc 15 phút (theo phòng); **không cộng giây**.
2. Đồng hồ của bên đang đi chạy, bên kia dừng.
3. Còn dưới **30 giây** thì hiện cảnh báo (chữ, biểu tượng và đổi màu).
4. Hết giờ thì ván kết thúc, bên hết giờ thua.

**Điều kiện chấp nhận**
1. Chỉ bên đang đi giảm giờ; không cộng giây.
2. Hết giờ thì thua, nước đến sau không được ghi.
3. Cảnh báo dưới 30 giây có chữ và biểu tượng.
4. Giờ trên hai trình duyệt khớp với máy chủ.

**Các việc nhỏ làm nên Story:** T-26 (Giao diện ván: bàn cờ nối mạng, đồng hồ, nút, hộp kết quả, khung xin hoà); T-39 (Máy chủ: đồng hồ ván, kết thúc ván, đầu hàng, xin hoà); T-50 (Nối web với máy chủ: đồng hồ, kết thúc ván, mất kết nối, người xem, bảng nước đi).

---

### Story 17 — Kết thúc ván: kết quả, đầu hàng, xin hoà, lặp thế
**Thuộc Epic:** Hai người đánh cờ qua mạng

**Câu chuyện:** Là người chơi hay người xem, tôi muốn **ván kết thúc đúng luật và biết kết quả**, kể cả khi đầu hàng, xin hoà hoặc đi lặp thế.

**Gồm những việc người dùng làm**
1. Kết thúc ván và hiện kết quả
2. Đầu hàng
3. Xin hoà
4. Lặp thế, chiếu liên tục, 120 nửa nước không ăn quân

**Điều kiện để dùng:**
- *Phần 1:* ván có kết quả.
- *Phần 2:* đang trong ván.
- *Phần 3:* đang trong ván.
- *Phần 4:* ván đang diễn ra.

**Khi có lỗi:**
- *Phần 1:* kết quả chỉ chốt **một lần**.

**Không thuộc Story này:**
- *Phần 1:* tái đấu, xem lại ván.
- *Phần 2:* đầu hàng khi đăng xuất hoặc rời phòng (Story 3, D6).
- *Phần 3:* điều kiện đi tối thiểu 20 nước của đánh hạng.
- *Phần 4:* luật đuổi quân riêng, hoà do thiếu quân.

**Các quy tắc:**
- *Phần 2:* người xem không đầu hàng thay; huỷ thì không gửi gì.
- *Phần 4:* **chiếu hết luôn được xét trước** các kết quả hoà; thế cờ tính cả bên sắp đi.

**Các bước người dùng làm và hệ thống phản hồi**
*Phần 1:*
1. Khi chiếu hết, hết nước đi, hết giờ, đầu hàng hay hoà, ván **ngừng nhận nước**.
2. Hiện hộp kết quả: thắng, thua hoặc hoà, kèm lý do; chỉ có nút **Rời phòng**.
3. Người xem cũng thấy kết quả.
*Phần 2:*
1. Bấm **Đầu hàng**; hiện xác nhận "Bạn sẽ thua ván này ngay lập tức." (focus mặc định ở **Huỷ**).
2. Đồng ý thì thua ngay, đối thủ thắng.
*Phần 3:*
1. Bấm xin hoà; đối thủ thấy khung đề nghị **đếm lùi 30 giây**; người xin thấy "Đang chờ đối thủ trả lời…" và nút **Rút đề nghị**.
2. Đồng ý → hoà. Từ chối hoặc hết hạn → ván tiếp tục.
*Phần 4:*
1. Thế cờ lặp lại lần thứ ba: nếu một bên chiếu liên tục thì bên đó **thua**; còn lại thì **hoà**.
2. 120 nửa nước liên tiếp không ăn quân thì **hoà**.

**Các quy tắc**
*Phần 1:*
- Chiếu hết là thua; **hết nước đi cũng là thua** (không có "hoà vì hết nước").
- Thứ tự xét: chiếu hết/hết nước → chiếu liên tục → lặp thế → 120 nửa nước.
- Ván bị gián đoạn do máy chủ khởi động lại hiện kết quả trung tính "Ván bị gián đoạn" (không thắng thua, không đổi điểm, chỉ nút Rời phòng) — **đã chốt 04/10/2026**.
*Phần 3:*
- Mỗi người chỉ **một đề nghị đang chờ**.
- Sau khi bị từ chối hoặc hết hạn, phải **đi thêm 5 nước của mình** mới được xin lại (nút mờ có chú thích số nước còn lại).
- Khung đề nghị **không chặn bàn cờ**, không giữ focus; Esc hoặc nút X chỉ **thu gọn** (không phải từ chối), có nút mở lại, hạn vẫn chạy.
- Ván kết thúc thì đề nghị hết hiệu lực.

**Điều kiện chấp nhận**
*Phần 1:*
1. Mỗi cách kết thúc cho đúng kết quả và lý do.
2. Sau khi kết thúc không nhận thêm nước.
3. Hộp kết quả chỉ có Rời phòng.
*Phần 2:*
1. Huỷ không tác dụng; đồng ý thì cùng kết quả ở hai máy.
2. Đầu hàng cùng lúc với phản hồi hoà chỉ có một kết quả.
*Phần 3:*
1. Đồng ý, từ chối, rút, hết 30 giây đều đúng.
2. Xin lại sớm hơn 5 nước bị chặn.
3. Trả lời hoà sau chiếu hết không ghi đè kết quả.
*Phần 4:*
1. Các chu kỳ chiếu cho kết quả đúng.
2. Mốc 119 chưa hoà, 120 hoà; ăn quân đưa bộ đếm về 0.
3. Chiếu hết ưu tiên hơn hoà.

**Các việc nhỏ làm nên Story:** T-09 (Luật cờ: nước hợp lệ, chiếu, chiếu hết, hết nước, lặp thế, 120 nửa nước); T-26 (Giao diện ván: bàn cờ nối mạng, đồng hồ, nút, hộp kết quả, khung xin hoà); T-39 (Máy chủ: đồng hồ ván, kết thúc ván, đầu hàng, xin hoà); T-46 (Kiểm thử luật cờ: đếm nước đi độc lập và bộ kiểm thử chạy tự động); T-50 (Nối web với máy chủ: đồng hồ, kết thúc ván, mất kết nối, người xem, bảng nước đi).

---

### Story 18 — Rời phòng giữa ván, mất kết nối và kết nối lại
**Thuộc Epic:** Hai người đánh cờ qua mạng

**Câu chuyện:** Là người chơi, khi **rời phòng hoặc rớt mạng**, tôi muốn biết rõ hậu quả và **được quay lại ván** nếu nối lại kịp.

**Gồm những việc người dùng làm**
1. Rời phòng giữa ván
2. Mất kết nối và kết nối lại

**Điều kiện để dùng:**
- *Phần 1:* đang trong ván.
- *Phần 2:* đang trong phòng hoặc ván.

**Các quy tắc:**
- *Phần 1:* **rời có chủ ý** khác hẳn **mất kết nối** (Story 18); rời có xác nhận thì xử ngay, không chờ 60 giây.
- *Phần 2:* nếu **cả hai** cùng rớt và cùng quá hạn thì **bên rớt trước thua**; máy chủ khởi động lại thì ván thành **gián đoạn** (không thắng thua).

**Không thuộc Story này:**
- *Phần 1:* mất kết nối.
- *Phần 2:* ván với máy (có thời hạn 30 phút riêng).

**Các bước người dùng làm và hệ thống phản hồi**
*Phần 1:*
1. Bấm **Rời phòng**; hiện xác nhận "Rời lúc này được tính là đầu hàng."
2. Đồng ý thì thua ngay, rời phòng.
*Phần 2:*
1. Khi mất kết nối, xuất hiện lớp phủ **không tắt được bằng Esc**.
2. Người **đang đấu**: đếm lùi **60 giây**; nối lại thì tự tắt; quá hạn thì thua; **đồng hồ ván vẫn chạy** (hết giờ trước thì thua do hết giờ).
3. Người ngồi ghế ở phòng chờ hoặc phòng đã kết thúc: giữ ghế **60 giây** rồi mất ghế (không thua).
4. Người xem: giữ chỗ **5 phút**.
5. Nối lại thành công: nhận **đủ thế cờ và đồng hồ chính xác**.

**Điều kiện chấp nhận**
*Phần 1:*
1. Xác nhận rời giữa ván → đầu hàng ngay.
2. Huỷ thì giữ nguyên.
*Phần 2:*
1. Nối lại trước hạn giữ nguyên tư cách; quá hạn đúng hậu quả theo từng loại người.
2. Hai bên cùng rớt: bên rớt trước thua; hết giờ sớm hơn vẫn ưu tiên.
3. Khởi động lại máy chủ giữa ván thì ván gián đoạn, không ghi đè nước đã lưu.

**Các việc nhỏ làm nên Story:** T-28 (Máy chủ: bộ xử lý lệnh của ván và xử lý nước đi); T-45 (Máy chủ: rời phòng giữa ván, mất kết nối, giữ chỗ, kết nối lại, ván gián đoạn); T-50 (Nối web với máy chủ: đồng hồ, kết thúc ván, mất kết nối, người xem, bảng nước đi).

---

### Story 19 — Kiểu phòng, khoá phòng và danh sách phòng công khai
**Thuộc Epic:** Phòng công khai, khoá phòng và người xem

**Câu chuyện:** Là chủ phòng, tôi muốn **chọn ai được thấy và được vào phòng** (công khai, chỉ vào bằng mã, khoá); và là người chơi, tôi muốn **thấy các phòng công khai đang mở** để vào xem.

**Gồm những việc người dùng làm**
1. Kiểu phòng: công khai, chỉ vào bằng mã, khoá phòng
2. Danh sách phòng công khai ở Sảnh

**Điều kiện để dùng:**
- *Phần 1:* là chủ phòng.
- *Phần 2:* đã đăng nhập, ở Sảnh.

**Khi có lỗi:**
- *Phần 1:* không phải chủ hoặc thiếu người mà bật khoá → từ chối.

**Không thuộc Story này:**
- *Phần 1:* đuổi người (B9), đánh hạng.
- *Phần 2:* lọc, tìm kiếm phòng (giai đoạn sau).

**Các quy tắc:**
- *Phần 2:* mới nhất lên đầu, **tối đa 50 phòng**; phòng đã đủ người xem thì nút Vào xem mờ có chú thích; phòng chỉ-mã, khoá, đóng không hiện.

**Khi có lỗi / trống:**
- *Phần 2:* danh sách rỗng → giải thích và nút "Tạo phòng"; tải lỗi → thông báo và "Thử lại".

**Các bước người dùng làm và hệ thống phản hồi**
*Phần 1:*
1. Chủ phòng đổi giữa **công khai**, **chỉ vào bằng mã** và **khoá**, kể cả khi đang đấu.
2. Bật khoá: hộp xác nhận "Người mới sẽ không vào được. Người xem đang có vẫn được giữ lại."
*Phần 2:*
1. Danh sách hiện các phòng công khai đang chờ hoặc đang chơi; mỗi dòng: tên phòng, chủ phòng, mức giờ, số người (X/Y), nút **Vào xem**.
2. Danh sách tự làm mới.

**Các quy tắc**
*Phần 1:*
- Chỉ **khoá** được khi **đủ 2 người chơi**; chưa đủ thì nút mờ "Chỉ khoá được khi đã đủ 2 người chơi".
- Phòng khoá: biến khỏi Sảnh, **không ai mới vào được** dù có mã hay đường dẫn; người đang có ghế hoặc đang xem **giữ nguyên**.
- Người đang có mặt mất mạng vẫn vào lại được: người chơi trong **60 giây**, người xem trong **5 phút**; quá hạn coi như người mới.
- Phòng đã khoá mà một người rời đi **vẫn giữ khoá**; chủ phòng mở lại hoặc mời người xem xuống ghế, phòng không tự mở.
- Phòng chỉ-mã không hiện ở Sảnh.

**Điều kiện chấp nhận**
*Phần 1:*
1. Khoá bật được đúng người, đúng lúc; không loại người đang có mặt.
2. Phòng khoá không hiện ở Sảnh, người mới bị từ chối, mã cũ vô hiệu.
3. Mất ghế không tự mở khoá.
4. Người cũ nối lại trong hạn giữ tư cách; quá hạn bị chặn.
*Phần 2:*
1. Chỉ phòng công khai đang chờ hoặc đang chơi hiện ra; tối đa 50, mới nhất trước.
2. Phòng đầy người xem thì nút mờ có lý do.
3. Danh sách trống có nút "Tạo phòng".

**Các việc nhỏ làm nên Story:** T-14 (Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng); T-32 (Giao diện: cài đặt phòng, đổi chỗ ghế/xem, danh sách người xem, xác nhận đuổi); T-36 (Máy chủ: kiểu phòng (công khai, chỉ mã, khoá) và danh sách phòng ở Sảnh); T-40 (Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời); T-50 (Nối web với máy chủ: đồng hồ, kết thúc ván, mất kết nối, người xem, bảng nước đi).

---

### Story 20 — Quản lý phòng: đổi chỗ, đuổi người xem, chủ phòng rời, sau ván
**Thuộc Epic:** Phòng công khai, khoá phòng và người xem

**Câu chuyện:** Là người trong phòng, tôi muốn **đổi giữa ghế và chỗ xem, đuổi người xem gây phiền, và phòng vẫn hợp lý** khi chủ phòng rời đi hoặc sau khi ván kết thúc.

**Gồm những việc người dùng làm**
1. Đổi chỗ giữa ghế ngồi và chỗ xem
2. Đuổi người xem
3. Chủ phòng rời đi, chuyển quyền, đóng phòng
4. Sau ván: quay về phòng chờ

**Điều kiện để dùng:**
- *Phần 1:* phòng đang ở trạng thái "đang chờ" hoặc "đã kết thúc".
- *Phần 2:* là một trong hai người ngồi ghế; có người xem trong phòng.
- *Phần 3:* là chủ phòng trong một phòng.
- *Phần 4:* ván vừa kết thúc.

**Khi có lỗi:**
- *Phần 1:* hết chỗ → từ chối; gửi trùng → không vượt sức chứa.
- *Phần 2:* người xem tự đuổi → từ chối; huỷ xác nhận → không có gì xảy ra.
- *Phần 3:* việc xác nhận đầu hàng chưa rõ → không báo rời xong.

**Không thuộc Story này:**
- *Phần 1:* xin đổi bên (Đỏ/Đen), hoán đổi trực tiếp (giai đoạn sau).
- *Phần 2:* chặn người dùng toàn hệ thống.
- *Phần 3:* tái đấu.
- *Phần 4:* nút "Tái đấu" (giai đoạn sau).

**Các quy tắc:**
- *Phần 2:* bị chặn **đến khi phòng đóng**; vào lại bằng mã hay đường dẫn thì thấy "Bạn đã bị đuổi và chặn tham gia phòng cờ này!"; người xem không có quyền đuổi.
- *Phần 3:* phòng cũng đóng khi ở trạng thái "đã kết thúc" quá 10 phút.
- *Phần 4:* đã về "đang chờ" thì đồng hồ 10 phút cũ **không** được đóng phòng.

**Ví dụ nghiệm thu:**
- *Phần 4:* A và C đánh xong, A rời, C thành chủ phòng, C mời B xuống ghế, B và C bấm Sẵn sàng thì đếm ngược và đấu tiếp.

**Các bước người dùng làm và hệ thống phản hồi**
*Phần 1:*
1. Người ngồi ghế bấm "Chuyển sang người xem".
2. Hoặc chủ phòng chuyển người còn lại xuống xem, hoặc **mời một người xem lên ghế trống**.
3. Phòng về "Đang chờ", "Sẵn sàng" của cả hai về chưa sẵn sàng.
*Phần 2:*
1. Cả chủ phòng và người chơi còn lại thấy nút **Đuổi** cạnh mỗi người xem.
2. Bấm Đuổi, hiện xác nhận "Người này sẽ không vào lại được phòng này."
3. Người bị đuổi bị ngắt, đưa ra Sảnh với thông báo "Bạn đã bị đuổi khỏi phòng thi đấu".
*Phần 3:*
1. Chủ phòng rời khi phòng đang chờ: nếu còn người ngồi ghế thì người đó thành chủ phòng; phòng mở tiếp.
2. Không còn ai ngồi ghế thì **đóng phòng** dù còn người xem; họ về Sảnh.
3. Đang đấu: mất kết nối tạm thời **không** đổi chủ phòng; chủ phòng rời hoặc bị xử thua thì quyền chuyển cho người còn lại; **rời giữa ván là đầu hàng**.
*Phần 4:*
1. Phòng ở trạng thái "đã kết thúc" tối đa **10 phút**; hết hạn mà vẫn vậy thì **đóng phòng** và đưa mọi người về Sảnh.
2. Người ngồi ghế rời, hoặc thành phần ngồi ghế đổi: phòng về "đang chờ"; người còn lại giữ ghế (và quyền chủ phòng, nếu người rời là chủ thì chuyển quyền).
3. Người mới vào theo quy tắc vào phòng; mất kết nối trong phòng chờ giữ ghế **60 giây**.

**Các quy tắc**
*Phần 1:*
- Không đổi chỗ khi đang đấu.
- Chuyển xuống xem chỉ được khi **còn chỗ xem**; hết chỗ thì nút mờ "Phòng không còn chỗ cho người xem".
- Người xem **không tự ngồi** vào ghế trống; chủ phòng **không tự xuống** làm người xem (nút ẩn).

**Điều kiện chấp nhận**
*Phần 1:*
1. Chỉ đổi được khi còn chỗ; không bao giờ vượt số người xem tối đa.
2. Chủ phòng mời người xem lên ghế trống được; ghế kín thì từ chối.
3. Chủ phòng tự xuống và người xem tự ngồi đều bị từ chối ở máy chủ.
4. Đổi trong ván bị từ chối.
5. Mỗi lần đổi thì xoá sẵn sàng.
*Phần 2:*
1. Hai người chơi đuổi được, người xem thì không.
2. Người bị đuổi mất kết nối, không nhận dữ liệu phòng và không vào lại được.
3. Mã hay kết nối cũ của người bị đuổi đều vô hiệu.
*Phần 3:*
1. Chủ phòng rời khi còn ghế khác → chuyển chủ; không còn ai → đóng.
2. Rời giữa ván xử thua đúng một lần.
3. Mất kết nối tạm thời không đổi chủ phòng.
*Phần 4:*
1. Không ai làm gì thì phòng đóng sau 10 phút.
2. Đổi thành phần ghế thì về "đang chờ" và đồng hồ cũ vô hiệu.
3. Ví dụ nghiệm thu chạy được.

**Các việc nhỏ làm nên Story:** T-32 (Giao diện: cài đặt phòng, đổi chỗ ghế/xem, danh sách người xem, xác nhận đuổi); T-38 (Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng); T-40 (Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời).

---

### Story 21 — Người xem theo dõi trực tiếp
**Thuộc Epic:** Phòng công khai, khoá phòng và người xem

**Câu chuyện:** Là người xem, tôi muốn **xem ván đang diễn ra** như người trong cuộc (chỉ xem).

**Điều kiện để dùng:** đã vào phòng làm người xem.

**Các quy tắc:** người xem **không thấy Kênh Riêng**, không có nút bật camera/micro, không gửi được lệnh; dữ liệu được **lọc ở máy chủ** trước khi gửi; bị đuổi hoặc hết hạn giữ chỗ thì ngừng nhận.

**Không thuộc Story này:** xem lại ván, phát camera cho người xem.

**Các bước người dùng làm và hệ thống phản hồi**
1. Người xem thấy bàn cờ, đồng hồ, nước đi **theo thời gian thực** (không chậm cố ý), **chỉ đọc**.
2. Thấy số người xem hiện tại và tối đa (ví dụ 3/5).

**Điều kiện chấp nhận**
1. Người xem nhận trực tiếp nước đi và kết quả.
2. Gửi lệnh đi nước, đầu hàng bị từ chối.
3. Dữ liệu người xem không chứa chat riêng, email.
4. Vào giữa lượt thì giờ và lượt khớp máy chủ.

**Các việc nhỏ làm nên Story:** T-44 (Máy chủ: người xem theo dõi trực tiếp, lọc dữ liệu theo vai trò); T-50 (Nối web với máy chủ: đồng hồ, kết thúc ván, mất kết nối, người xem, bảng nước đi).

---

### Story 22 — Chat hai kênh, giới hạn tin nhắn và lọc từ cấm
**Thuộc Epic:** Chat, camera và micro

**Câu chuyện:** Là người trong phòng, tôi muốn **nhắn tin** với đối thủ (kênh riêng) hoặc với cả phòng (kênh chung), không bị quấy rối.

**Gồm những việc người dùng làm**
1. Chat hai kênh: Riêng và Chung
2. Giới hạn tin nhắn và bộ lọc từ cấm

**Điều kiện để dùng:**
- *Phần 1:* đang ở trong phòng.
- *Phần 2:* đang chat.

**Khi có lỗi:**
- *Phần 1:* máy chủ từ chối hoặc mất phản hồi → không báo "đã gửi", không tự tạo tin mới; mất ghế → gỡ ngay dữ liệu kênh riêng khỏi màn hình.

**Không thuộc Story này:**
- *Phần 1:* nhắn tin riêng giữa bạn bè, sticker.
- *Phần 2:* báo cáo vi phạm, cấm người dùng.

**Các bước người dùng làm và hệ thống phản hồi**
*Phần 1:*
1. **Người chơi** thấy cả **Kênh Riêng** (mặc định mở, chỉ hai người ngồi ghế) và **Kênh Chung** (cả phòng), có công tắc ẩn Kênh Chung.
2. **Người xem** chỉ thấy **Kênh Chung**.
3. Gõ tin, bấm gửi; tin hiện "đang gửi" cho đến khi máy chủ xác nhận.
*Phần 2:*
1. Tin quá dài hoặc gửi quá nhanh bị chặn kèm thông báo "Bạn gửi quá nhanh".
2. Từ cấm được che bằng `***`.

**Các quy tắc**
*Phần 1:*
- Tin ở Kênh Riêng chỉ hai người **đang ngồi ghế** nhận; **người đổi chỗ sau không đọc được tin cũ**; người xem mới vào chỉ thấy tin Kênh Chung **từ lúc họ vào**.
- Tin chat của phòng **xoá khi phòng đóng**.
- **Đã chốt (PO 04/10/2026):** khi cặp người ngồi ghế đổi (A và B chat riêng, B xuống xem, C lên ngồi), người mới **và cả cặp mới** không đọc tin cũ của cặp trước.
*Phần 2:*
- Mỗi tin tối đa **200 ký tự**; mỗi người tối đa **5 tin trong 10 giây**.
- Từ cấm (tiếng Việt, tiếng Anh) bị che **ở cả máy chủ và trình duyệt**, có xử lý bỏ dấu, khoảng trắng, ký tự chèn thêm, ký tự thay thế (số 0 thay chữ o, số 1 thay chữ i).
- Không có sticker (khay ẩn).
- Máy chủ là nơi quyết định; việc che ở trình duyệt chỉ để người dùng thấy trước.

**Điều kiện chấp nhận**
*Phần 1:*
1. Người chơi gửi và nhận đúng ở từng kênh; người xem không có Kênh Riêng và **không nhận byte nào** của kênh này.
2. Người xem mới, người mới ngồi ghế không đọc được tin trước thời điểm có quyền.
3. Phòng đóng thì tin bị xoá.
4. Đổi cặp ngồi ghế: người mới không đọc được tin cũ của cặp trước; B mất quyền Kênh Riêng.
*Phần 2:*
1. 200 ký tự nhận, 201 bị chặn; tin thứ 5 nhận, tin thứ 6 trong 10 giây bị chặn.
2. Mọi biến thể từ cấm trong bộ mẫu đều bị che giống nhau ở hai phía.
3. Gửi lại cùng một tin khi mất phản hồi chỉ ra một tin.

**Các việc nhỏ làm nên Story:** T-10 (Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ); T-41 (Máy chủ: chat hai kênh, quyền đọc, giới hạn tin, lọc từ cấm); T-49 (Giao diện chat hai kênh và nối web với máy chủ).

---

### Story 23 — Camera và micro: người chơi bật, người xem chỉ xem
**Thuộc Epic:** Chat, camera và micro

**Câu chuyện:** Là người chơi, tôi muốn **bật camera và micro** để đối thủ thấy mặt và nghe tiếng tôi; và là người xem, tôi chỉ **xem và nghe** những gì người chơi cho phép.

**Gồm những việc người dùng làm**
1. Camera và micro cho hai người chơi
2. Người xem chỉ xem, không phát

**Điều kiện để dùng:**
- *Phần 1:* đang ngồi ghế trong phòng.
- *Phần 2:* đang là người xem của phòng.

**Các quy tắc:**
- *Phần 1:* mức chia sẻ chọn **riêng từng người chơi**, áp **chung** cho camera và micro đang bật; **không ghi hình, ghi âm hay lưu**; lỗi camera/micro **không** làm hỏng việc đi cờ và chat.
- *Phần 2:* máy chủ **không cấp quyền phát** cho người xem; đổi vai, bị đuổi, phòng đóng thì **thu hồi quyền ngay**; token cũ không lấy lại quyền.

**Khi có lỗi:**
- *Phần 1:* từ chối quyền hoặc không có thiết bị → báo lỗi rõ, bàn cờ và chat vẫn dùng.

**Không thuộc Story này:**
- *Phần 1:* quyền của người xem (E4), tiếp quản tab (E5).
- *Phần 2:* chat của người xem (E1).

**Các bước người dùng làm và hệ thống phản hồi**
*Phần 1:*
1. Khi vào phòng, camera và micro **TẮT**. Người chơi tự bật từng thiết bị (độc lập nhau); lúc đó trình duyệt mới hỏi quyền.
2. Chọn **mức chia sẻ**: *Không chia sẻ*, *Chỉ đối thủ*, hoặc *Cả đối thủ và người xem* (mức ba chỉ chọn được khi phòng có người xem).
3. Khi cả hai bật và chọn từ "Chỉ đối thủ" trở lên thì thấy mặt và nghe tiếng nhau.
*Phần 2:*
1. Người xem **không có nút** bật camera hay micro; không bị hỏi quyền thiết bị.
2. Người xem chỉ thấy và nghe luồng của người chơi chọn mức "Cả đối thủ và người xem".

**Điều kiện chấp nhận**
*Phần 1:*
1. Không tự bật; bật/tắt độc lập.
2. Mỗi mức chia sẻ chỉ đến đúng người nhận.
3. Rời phòng thì luồng và thiết bị dừng.
4. Không có chức năng ghi hay lưu.
*Phần 2:*
1. Người xem gọi thẳng công cụ phát vẫn bị chặn tại dịch vụ.
2. Người xem không nhận luồng của người chọn mức thấp hơn.
3. Đổi vai hoặc bị đuổi thì mất quyền thật; dùng lại token cũ không được.

**Các việc nhỏ làm nên Story:** T-06 (Thử nghiệm LiveKit Cloud: camera/micro theo từng người, thu hồi quyền); T-51 (Giao diện: camera/micro, bật tắt độc lập, mức chia sẻ, thông báo quyền và lỗi); T-53 (Máy chủ: cấp quyền camera/micro theo vai và mở nhiều tab (tab mới tiếp quản)); T-57 (Nối camera/micro thật: theo đối tượng nhận, đổi vai, đuổi, tab (web, máy chủ, LiveKit)); T-61 (Nghiệm thu phi chức năng: bài tải, quyền camera/micro, trình duyệt, bảo mật).

---

### Story 24 — Mở nhiều tab: tab mới tiếp quản
**Thuộc Epic:** Chat, camera và micro

**Câu chuyện:** Là người dùng, khi **mở thêm tab** vào cùng phòng, tôi muốn **chỉ một tab điều khiển** để không bị lộn xộn.

**Điều kiện để dùng:** đang ở trong phòng ở một tab.

**Các quy tắc:** máy chủ **chặn mọi lệnh làm thay đổi** từ tab cũ; phiên hết hạn hoặc sai thì không chiếm được quyền điều khiển.

**Không thuộc Story này:** hộp thoại chọn tab phụ (giai đoạn sau).

**Các bước người dùng làm và hệ thống phản hồi**
1. Mở thêm một tab vào cùng phòng: **tab mới tiếp quản**.
2. Tab cũ hiện "Phiên này đã được mở ở tab khác", chuyển **chỉ đọc**; camera và micro của tab cũ **tự dừng**.
3. Tab mới mặc định **tắt** camera và micro.

**Điều kiện chấp nhận**
1. Chỉ một kết nối có quyền điều khiển tại một thời điểm.
2. Tab cũ gửi nước đi hoặc lệnh khác bị từ chối, tác động bằng 0.
3. Thiết bị tab cũ dừng thật; tab mới tắt mặc định.

**Các việc nhỏ làm nên Story:** T-53 (Máy chủ: cấp quyền camera/micro theo vai và mở nhiều tab (tab mới tiếp quản)); T-57 (Nối camera/micro thật: theo đối tượng nhận, đổi vai, đuổi, tab (web, máy chủ, LiveKit)); T-61 (Nghiệm thu phi chức năng: bài tải, quyền camera/micro, trình duyệt, bảo mật).

---

### Story 25 — Chọn cấp độ, chọn phe và máy đi nước đúng luật
**Thuộc Epic:** Đánh với máy theo cấp độ

**Câu chuyện:** Là người chơi, tôi muốn **chọn cấp độ và phe rồi đánh với máy**, máy đáp lại nhanh và không bao giờ đi sai luật.

**Gồm những việc người dùng làm**
1. Chọn cấp độ và phe để chơi với máy
2. Máy đi nước trong thời hạn và không bao giờ sai luật

**Điều kiện để dùng:**
- *Phần 1:* đã đăng nhập, chưa có chỗ chơi khác.
- *Phần 2:* đang chơi với máy.

**Các quy tắc:**
- *Phần 1:* mỗi người một chỗ chơi cùng lúc; phe do máy chủ bốc và lưu.
- *Phần 2:* ván với máy **không giới hạn thời gian** cho người chơi, không tính Elo, **không có nút xin hoà**, chỉ có Đầu hàng; **máy không bao giờ đi nước không hợp lệ**; máy bận thì giữ nguyên ván và lượt.

**Không thuộc Story này:**
- *Phần 1:* nước đi của máy (G2).
- *Phần 2:* gợi ý nước, đi lại.

**Các bước người dùng làm và hệ thống phản hồi**
*Phần 1:*
1. Ở Sảnh có ba thẻ **Dễ**, **Trung bình**, **Khó**; bấm một thẻ thì chọn phe **Đỏ**, **Đen** hoặc **Ngẫu nhiên** (máy chủ bốc 50/50).
2. Nếu người chơi cầm Đen thì **máy (Đỏ) tự đi nước đầu** và bàn lật cho Đen ở dưới.
3. Không có nút gợi ý nước đi.
*Phần 2:*
1. Người chơi đi, máy tìm nước trong thời gian của cấp: **Dễ 300 ms, Trung bình 1.000 ms, Khó 3.000 ms**; hết thời gian thì đi nước tốt nhất đã tìm được.
2. Nếu máy đang bận, chờ tối đa 3 giây (không tính vào thời gian nghĩ), quá thì báo "Thử lại".

**Điều kiện chấp nhận**
*Phần 1:*
1. Ba cấp với ba lựa chọn phe cho phe và lượt đúng.
2. Vào ghế phòng và bắt đầu ván máy cùng lúc chỉ một chỗ thành công.
3. Không có nút gợi ý.
*Phần 2:*
1. Thời gian nghĩ p95 trong ngưỡng từng cấp; độ sâu Khó đạt 6 ở khai cuộc, 5 ở trung cuộc.
2. 1.000 ván không có nước sai, không treo.
3. Cấp cao thắng cấp thấp ít nhất 75% (≥ 40 ván mỗi cặp).

**Các việc nhỏ làm nên Story:** T-31 (Máy cờ: chương trình chạy riêng, ba cấp độ, thử nghiệm sơ bộ tốc độ); T-37 (Giao diện: chọn cấp và phe, màn ván với máy, thông báo sự cố); T-43 (Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ); T-55 (Nối web, máy chủ và máy cờ thật: ván với máy); T-56 (Đo máy cờ đầy đủ (GATE-AI): tốc độ, độ sâu, sức mạnh, độ ổn định).

---

### Story 26 — Kết thúc ván với máy, vào lại ván và sự cố máy cờ
**Thuộc Epic:** Đánh với máy theo cấp độ

**Câu chuyện:** Là người chơi, tôi muốn **biết ván với máy kết thúc ra sao, quay lại nếu rớt mạng và thử lại khi máy gặp sự cố**.

**Gồm những việc người dùng làm**
1. Kết thúc ván với máy và vào lại ván
2. Sự cố máy cờ và Thử lại

**Điều kiện để dùng:**
- *Phần 1:* đang chơi với máy.
- *Phần 2:* đang chơi với máy.

**Các quy tắc:**
- *Phần 1:* không có đi lại và lịch sử ở giai đoạn này.
- *Phần 2:* bấm trùng chỉ có một tác dụng; kết quả đến muộn bị bỏ.

**Không thuộc Story này:**
- *Phần 1:* lưu lịch sử bền.
- *Phần 2:* tự hạ cấp máy.

**Các bước người dùng làm và hệ thống phản hồi**
*Phần 1:*
1. Ván kết thúc khi chiếu hết, hết nước đi, đầu hàng hoặc hoà; hiện hộp kết quả chỉ có **Rời phòng**.
2. Đóng tab hoặc mất mạng: ván **giữ 30 phút** để vào lại cùng đường dẫn; Sảnh hiện băng "Bạn có ván đang chơi dở — Quay lại". Quá 30 phút ván là **Bỏ dở**.
3. **Chủ động rời hoặc đăng xuất** (có xác nhận) thì **đầu hàng ngay**, không có ân hạn 30 phút.
*Phần 2:*
1. Máy lỗi hoặc không trả lời quá 10 giây: ván thành **Bỏ dở**, báo "Máy cờ gặp sự cố" kèm nút **Thử lại**.
2. Thử lại sau sự cố tạo **ván mới**, **cùng cấp và cùng phe thực tế**.
3. Máy chỉ **đang bận**: nút Thử lại chỉ yêu cầu máy tìm lại, **không gửi lại nước của người chơi**.

**Điều kiện chấp nhận**
*Phần 1:*
1. Vào lại trước 30 phút thấy đúng thế; sau 30 phút là Bỏ dở.
2. Rời có xác nhận: đồng ý thì đầu hàng và giải phóng chỗ; huỷ thì giữ ván.
3. Sau khi kết thúc không nhận thêm nước hay kết quả muộn.
*Phần 2:*
1. Bận và Bỏ dở cho hai nút Thử lại khác nhau.
2. Giết tiến trình máy rồi bấm Thử lại nhiều lần chỉ có một ván mới đúng phe.
3. Kết quả muộn không đổi thế cờ.

**Các việc nhỏ làm nên Story:** T-37 (Giao diện: chọn cấp và phe, màn ván với máy, thông báo sự cố); T-43 (Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ); T-55 (Nối web, máy chủ và máy cờ thật: ván với máy); T-60 (Nghiệm thu từng tiêu chí giai đoạn 1 và chạy kịch bản demo D1–D10); T-62 (Chuẩn bị demo, sửa lỗi cuối, kiểm lại và bàn giao bằng chứng).
