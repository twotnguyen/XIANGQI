# Task của Epic "Chat, camera và micro" (6 task)

**Ngày:** 2026-10-04 · **Trạng thái:** đề xuất, chờ PO duyệt · Chưa tạo gì trên Jira · Viết theo `00-chuan-description.md` và mẫu `00b`.

Mã task `T-01` đến `T-62` đánh theo **thứ tự làm** (số nhỏ làm trước, mỗi task chỉ cần các task có số nhỏ hơn). Một số task gộp nhiều việc nhỏ cùng mục đích thành một task. Ngày Sprint: 1 = 04/10–07/10, 2 = 08/10–10/10, 3 = 11/10–14/10, 4 = 15/10–17/10.

---

### T-06 — Thử nghiệm LiveKit Cloud: camera/micro theo từng người, thu hồi quyền
**Thuộc Epic:** Chat, camera và micro · **Thành phần:** Communication, QA & DevOps · **Sprint:** 1 (04/10–07/10)
**Phải xong trước:** *Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động (T-01)*: nhận được môi trường chạy mã và cách đặt cấu hình thử không lộ bí mật.

**Mục tiêu**
Trả lời: **LiveKit Cloud (dịch vụ chạy camera/micro) có cho phép quy định "ai được phát, ai được nhận" theo từng người, và chặn được người đã bị đuổi hay đổi vai không?** Báo cáo mở đường cho Epic Chat, camera và microro; chưa làm tính năng thật.

**Việc cần làm (làm lần lượt)**
1. Dùng dự án LiveKit Cloud thử (không dùng tài khoản thật của người dùng) và hai đến ba thiết bị có camera/micro.
2. Lập bảng "ai phát, ai được nhận" cho các vai: hai người chơi, người xem.
3. Thử các tình huống: người xem cố tự phát hình; chọn chia sẻ **chỉ đối thủ** rồi **cả đối thủ và người xem**; người chơi bị chuyển xuống làm người xem khi đang bật camera; người bị đuổi; mở tab mới thì tab cũ bị loại.
4. Thử **dùng lại quyền cũ** (thông tin vào phòng đã cấp trước đó) sau khi bị đuổi hoặc đổi vai.
5. Đo **khoảng thời gian** quyền cũ còn dùng được sau khi thu hồi; ghi mức dùng của gói miễn phí (phút người tham gia, dữ liệu, số kết nối).
6. Viết báo cáo: từng tình huống **đạt / không đạt**, số đo, phiên bản và cấu hình đã dùng, đề xuất cách làm.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Người xem gọi thẳng chức năng phát hình | Không phát được |
| Chọn chia sẻ "chỉ đối thủ" | Người xem **không** nhận được hình/tiếng |
| Người chơi bị chuyển xuống xem khi đang phát | Mất quyền phát; không nhận luồng chỉ dành cho đối thủ |
| Người bị đuổi thử dùng lại quyền cũ | Không vào lại được |
| Mở tab mới tiếp quản | Tab cũ mất quyền; tab mới **mặc định tắt** camera/micro |

**Cách tự kiểm tra**
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Người xem cố tự phát hình | Bị chặn |
| 2 | Đổi lần lượt các mức chia sẻ | Người xem nhận đúng theo mức |
| 3 | Chuyển người chơi xuống xem lúc đang phát | Quyền cũ mất ngay |
| 4 | Dùng lại quyền cũ sau khi đuổi | Không vào được; ghi số giây còn hiệu lực nếu có |
| 5 | Đối chiếu mức dùng gói miễn phí | Có số liệu thật trong báo cáo |

**Khi nào chuyển cho người kiểm thử:** báo cáo đủ và làm lại được.
**Khi nào task xong:** báo cáo hoàn tất **kể cả khi một số tình huống không đạt**. Chỉ đánh giá "camera/micro đạt yêu cầu" khi **không** có ai nhận hay phát trái quyền (ẩn trên giao diện không đủ).
**Bàn giao cho task sau:** báo cáo, đề xuất cách thu hồi quyền, mức dùng hạn mức.
**Không thuộc task này:** tự dựng máy chủ camera, ghi hình, ghi âm, bật camera mặc định.

---

### T-41 — Máy chủ: chat hai kênh, quyền đọc, giới hạn tin, lọc từ cấm
**Thuộc Epic:** Chat, camera và micro · **Thành phần:** Communication · **Sprint:** 3 (11/10–14/10)
**Phải xong trước:** *Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập (T-04)*: nhận được bảng tin chat và bảng người tham gia (kèm thời điểm ngồi ghế). *Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ (T-10)*: nhận được hàm che từ cấm dùng chung, danh sách từ cấm và bộ ví dụ đối chiếu; nhận được cách nhận ra tin gửi lại. *Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh (T-21)*: nhận được tư cách tham gia phòng và thời điểm vào. *Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng (T-38)*: nhận được việc đổi ghế/vai đã ghi lại và thời điểm ngồi ghế được cập nhật.

**Mục tiêu**
Cho người dùng nhắn tin trong phòng, **mỗi tin chỉ tới đúng người có quyền đọc ở thời điểm đó**. Tin hợp lệ được lọc, lưu và gửi đúng kênh.

**Việc cần làm (làm lần lượt)**
1. Xác định người gửi; nếu tin này đã xử lý (gửi lại), trả kết quả cũ, **không gửi tin thứ hai**.
2. Với tin mới: kiểm tra **vai và kênh** (người xem không được dùng Kênh Riêng), độ dài tối đa 200 ký tự, và tốc độ 5 tin/10 giây.
3. **Che từ cấm** bằng hàm dùng chung (T-10), rồi ghi tin và biên lai **cùng lúc**, sau đó mới gửi tới đúng người nhận.
4. **Mốc đọc:** Kênh Chung: người vào chỉ đọc từ lúc họ vào; Kênh Riêng: chỉ người đang ngồi ghế; người đổi ghế mất quyền đọc Kênh Riêng cũ. Khi **cả cặp** ngồi ghế đổi, người mới và cả cặp mới **không đọc** tin của cặp cũ (PO đã chốt 04/10/2026).
5. **Dọn dẹp khi phòng đóng:** xoá toàn bộ tin của phòng. Ở task này kiểm bằng "tín hiệu đóng phòng" mẫu; kiểm khi phòng đóng thật làm ở task tích hợp chat (T-49).

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Gửi tin 200 và 201 ký tự; gửi tin thứ 5 và thứ 6 trong 10 giây | 200 và tin thứ 5 nhận; 201 và tin thứ 6 bị chặn |
| Người xem gửi hoặc đọc Kênh Riêng | Không nhận, không ghi |
| Người xem mới vào, hoặc người mới xuống ghế đọc tin cũ | Không đọc được tin trước thời điểm có quyền |
| Từ cấm có dấu, khoảng trắng, ký tự chèn, số 0 và 1 thay chữ | Bị che `***` đúng; khi phòng đóng, tin được xoá |
| Gửi lại cùng một tin sau khi đổi ghế | Chỉ một tin đã lọc; người mới ngồi không nhận lịch sử cũ |

**Cách tự kiểm tra**
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Gửi tin 200/201 ký tự; tin thứ 5 và thứ 6 trong 10 giây | Biên hợp lệ nhận, vượt bị chặn |
| 2 | Người xem thử gửi và đọc Kênh Riêng | Không được |
| 3 | Người xem mới vào, người mới xuống ghế đọc lịch sử | Không đọc tin trước thời điểm có quyền |
| 4 | Gửi từ cấm với các biến thể; phát tín hiệu đóng phòng mẫu | Che `***`; tin của phòng bị xoá |
| 5 | Gửi lại tin cũ; đổi ghế qua T-38 | Một tin; người mới ngồi không thấy lịch sử |
| 6 | Đổi cặp: A và B chat riêng, B xuống xem, C lên ngồi; tải lại và gửi tin mới | A và C **không** thấy tin cũ của A và B; B mất quyền Kênh Riêng; A và C nhận tin mới |

**Khi nào chuyển cho người kiểm thử:** dòng 1 đến 5 đạt; dòng 6 (đổi cặp) cũng phải đạt.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Trường hợp đổi cặp (dòng 6) bắt buộc đạt theo quyết định đã chốt.
**Bàn giao cho task sau:** chức năng chat ở máy chủ cho giao diện chat, tích hợp chat, bài tải.
**Không thuộc task này:** nhắn tin riêng giữa bạn bè, sticker, giao diện, dọn chat khi phòng đóng thật.

---

### T-49 — Giao diện chat hai kênh và nối web với máy chủ
**Thuộc Epic:** Chat, camera và micro · **Thành phần:** Frontend, Communication · **Sprint:** 3 (11/10–14/10)
**Phải xong trước:** *Soạn "hợp đồng chung" giữa trình duyệt và máy chủ (T-02)*: nhận được kiểu tin chat, phản hồi, lỗi, vai trò. *Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo) (T-08)*: nhận được trang chạy được; nhận được nút, hộp thoại, chú thích, thông báo, 5 trạng thái. *Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ (T-10)*: nhận được hàm che từ cấm dùng chung. *Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời (T-40)*: nhận được đổi ghế, riêng tư, đuổi, chủ phòng rời, đóng phòng chạy thật. *Máy chủ: chat hai kênh, quyền đọc, giới hạn tin, lọc từ cấm (T-41)*: nhận được chat lưu, lọc, giới hạn, gửi theo quyền. *Máy chủ: người xem theo dõi trực tiếp, lọc dữ liệu theo vai trò (T-44)*: nhận được tư cách và trạng thái người xem thật.

**Mục tiêu**
Dựng khung chat để người dùng **phân biệt rõ hai kênh**, biết tin nào đang gửi, tin nào lỗi, và biết quyền đọc của mình. Dùng dữ liệu giả; nối thật ở bước nối với máy chủ ngay sau đây.

Nối khung chat với máy chủ thật và kiểm **quyền ở dữ liệu thật gửi qua mạng**, chứ không chỉ nhìn tab bị ẩn.

**Việc cần làm (làm lần lượt)**
1. **Hai kênh** theo vai: người chơi mặc định mở Kênh Riêng, có công tắc ẩn/hiện Kênh Chung (chỉ đổi cách hiển thị); người xem chỉ thấy Kênh Chung.
2. Ô nhập tin, nút gửi; hiện **"đang gửi"** đến khi nhận xác nhận. Gửi lỗi giữ lại nội dung (không nhạy cảm) để thử lại, **không tạo tin mới mù quáng**.
3. Dùng **hàm che từ cấm chung** ngay trên giao diện để người dùng thấy trước kết quả, nhưng **máy chủ mới là nơi quyết định**.
4. Khi đổi ghế (người chơi thành người xem), **gỡ khỏi màn hình** lịch sử Kênh Riêng không còn quyền.
5. Đủ 5 trạng thái: không có tin, đang tải, lỗi, không được gửi (có lý do). Khay sticker **ẩn**. Dùng được bằng bàn phím.
6. Nối kênh, phản hồi xác nhận và bộ lọc dùng chung ở cả hai phía.
7. Chạy người chơi và người xem, **bắt dữ liệu mạng** để chắc người xem không nhận byte nào của Kênh Riêng.
8. Đổi ghế, đuổi, đóng phòng rồi kiểm dữ liệu và lỗi.
9. Ghép chat với các thao tác đổi ghế/đuổi/đóng phòng đã nối thật ở T-40; kiểm bộ lọc cùng phiên bản ở web và máy chủ.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Vào bằng hai vai; ẩn/hiện Kênh Chung | Đúng kênh mặc định; người xem không có Kênh Riêng |
| Máy chủ từ chối hoặc mất phản hồi | Không báo "đã gửi"; không tự tạo tin mới |
| Người chơi chuyển thành người xem | Không còn dữ liệu Kênh Riêng trên màn hình |
| Không có tin, tải chậm, lỗi, không được gửi | Đủ trạng thái và lý do |
| Nhập các biến thể từ cấm, nút gửi bị mờ | Kết quả che thống nhất; chú thích dùng khối nền |
| Hai người chơi gửi ở từng kênh; người xem gửi ở Kênh Chung | Nhận đúng tập người |
| Gửi quá nhanh, quá dài, từ cấm biến thể | Bị chặn hoặc che giống quy tắc |
| Ngắt sau khi máy chủ đã nhận rồi gửi lại cùng tin | Một tin; giao diện khớp trạng thái thật |
| Người xem vào muộn, người mới xuống ghế, đóng phòng | Không nhận tin trước thời điểm được phép; chat bị xoá khi đóng |
| Thu quyền người rời ghế, đóng phòng bằng điều khiển thật | Người mất ghế không nhận Kênh Riêng; phòng đóng thì tin bị xoá |
| Đổi cặp người ngồi ghế (A và B chat, B xuống xem, C lên ngồi) | A và C **không** đọc tin cũ của cặp trước; B mất quyền Kênh Riêng; A và C nhận tin mới |

**Cách tự kiểm tra**
Chuẩn bị: dữ liệu giả có quyền và thời điểm; nhiều trình duyệt (hai người chơi, người xem), công cụ xem dữ liệu mạng.

| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Vào bằng hai vai, ẩn/hiện Kênh Chung | Đúng kênh mặc định |
| 2 | Giả lập từ chối và mất phản hồi | Không báo đã gửi, không tạo tin mới |
| 3 | Chuyển người chơi thành người xem | Mất dữ liệu Kênh Riêng |
| 4 | Xem 5 trạng thái | Đủ, có lý do |
| 5 | Nhập từ cấm biến thể | Che đúng; nút gửi mờ có chú thích |
| 6 | Gửi ở từng kênh từ hai người chơi và người xem | Đúng người nhận |
| 7 | Gửi nhanh, quá dài, từ cấm biến thể | Chặn/che như quy tắc |
| 8 | Ngắt mạng sau khi gửi, gửi lại cùng tin | Một tin duy nhất |
| 9 | Người xem vào muộn, người mới xuống ghế, đóng phòng | Đúng mốc; tin bị xoá khi đóng |
| 10 | Đổi ghế, đóng phòng bằng T-40 | Đúng quyền; không byte Kênh Riêng tới người xem |
| 11 | Đổi cặp: A và B chat riêng, B xuống xem, C lên ngồi; tải lại và gửi tin mới | A và C **không** thấy tin cũ của A và B; B mất quyền Kênh Riêng; A và C nhận tin mới |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý. Chat chỉ được coi là chạy thật sau khi đã nối với máy chủ ở các bước trên. Dòng 6 (đổi cặp) bắt buộc đạt theo quyết định đã chốt.
**Bàn giao cho task sau:** khung chat cho tích hợp chat; chat thật cho tích hợp camera/micro, nghiệm thu, bài tải.
**Không thuộc task này:** nhắn tin giữa bạn bè; sticker.

---

### T-51 — Giao diện: camera/micro, bật tắt độc lập, mức chia sẻ, thông báo quyền và lỗi
**Thuộc Epic:** Chat, camera và micro · **Thành phần:** Frontend, Communication · **Sprint:** 4 (15/10–17/10)
**Phải xong trước:** *Thử nghiệm LiveKit Cloud: camera/micro theo từng người, thu hồi quyền (T-06)*: nhận được cách xem luồng theo từng người đã thử trên dịch vụ thật. *Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo) (T-08)*: nhận được trang chạy được; nhận được nút, công tắc, chú thích, thông báo.

**Mục tiêu**
Dựng **bảng điều khiển camera/micro** cho người chơi: bật/tắt độc lập, chọn mức chia sẻ, thông báo khi chưa có quyền thiết bị hoặc gặp lỗi, **mà không cản việc chơi cờ**.

**Việc cần làm (làm lần lượt)**
1. Khi vào phòng, mọi thiết bị **TẮT**; chỉ **xin quyền thiết bị khi người chơi tự bấm bật**.
2. Camera và micro **bật/tắt riêng**, nhưng dùng **chung một mức chia sẻ** (3 mức); mức "Cả đối thủ và người xem" chỉ chọn được khi phòng có người xem.
3. Khi rời phòng, mất quyền hoặc bị tiếp quản: **dừng luồng và đóng thiết bị**.
4. Khi từ chối quyền hoặc không có thiết bị: hiện lỗi rõ ràng; bàn cờ và chat vẫn dùng bình thường.
5. **Người xem** không thấy nút phát, không bị hỏi quyền thiết bị.
6. Dùng khối nền (T-08): nút, công tắc, chú thích; kiểm focus và lỗi thiết bị trên giao diện tối. Không có chức năng ghi hay lưu.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Vào phòng rồi bật riêng micro hoặc camera | Không tự bật; điều khiển độc lập |
| Từ chối quyền hoặc không có thiết bị | Lỗi rõ; cờ và chat vẫn dùng |
| Mở bằng vai người xem | Không có nút phát, không xin quyền |
| Rời phòng hoặc nhận thông báo mất quyền | Luồng dừng, thiết bị không tiếp tục phát |
| Dùng bàn phím; vào trạng thái không có quyền | Nhãn, focus, chú thích đúng; không tự bật thiết bị |

**Cách tự kiểm tra**
Chuẩn bị: máy có camera và micro thật; thử cả khi từ chối quyền.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Vào phòng; bật riêng micro rồi camera | Không tự bật; độc lập |
| 2 | Từ chối quyền; rút thiết bị | Lỗi rõ; cờ và chat dùng được |
| 3 | Vào bằng người xem | Không nút phát |
| 4 | Rời phòng; mô phỏng mất quyền | Luồng dừng, đèn thiết bị tắt |
| 5 | Dùng bàn phím | Nhãn, focus đúng |

**Khi nào chuyển cho người kiểm thử:** cả 5 dòng đạt, đủ 5 trạng thái, không có chức năng lưu.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý.
**Bàn giao cho task sau:** bảng điều khiển camera/micro cho tích hợp media.
**Không thuộc task này:** cấp quyền ở máy chủ (T-53), tiếp quản tab (T-53), chức năng ghi.

---

### T-53 — Máy chủ: cấp quyền camera/micro theo vai và mở nhiều tab (tab mới tiếp quản)
**Thuộc Epic:** Chat, camera và micro · **Thành phần:** Communication, Game Server · **Sprint:** 4 (15/10–17/10)
**Phải xong trước:** *Thử nghiệm LiveKit Cloud: camera/micro theo từng người, thu hồi quyền (T-06)*: nhận được **báo cáo có kết luận đạt** về việc cấp quyền theo người, thu hồi khi dùng token cũ; **chỉ có báo cáo chưa đủ**, phải có kết luận đạt. Nếu không đạt hoặc chưa kết luận thì phần phụ thuộc bị chặn và báo PO. *Máy chủ: đăng nhập, quản lý phiên và hồ sơ (T-20)*: nhận được kiểm tra phiên và hạn, thu hồi. *Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng (T-38)*: nhận được đổi vai đã ghi; nhận được thông báo đuổi, rời, đóng phòng.

**Mục tiêu**
Từ **vai trò thật trong phòng**, máy chủ cấp và thay đổi quyền camera/micro ở dịch vụ LiveKit: ai được phát, ai được nghe ai. Người dùng hợp lệ giữ quyền mới; **kết nối hay token cũ không lấy lại được quyền đã mất**.

Mỗi người chỉ **một tab điều khiển** tại một thời điểm. Khi mở tab mới cùng tài khoản và cùng phòng, tab mới **tiếp quản**; tab cũ chuyển **chỉ đọc**, dừng camera/micro, và **không gửi được lệnh** làm thay đổi ván hay phòng. Task này cũng đảm bảo đúng quy tắc đăng nhập nơi mới thì nơi cũ bị đẩy ra.

**Việc cần làm (làm lần lượt)**
1. Lập **bảng quyền**: ai được nhận luồng của ai theo mức chia sẻ của người phát (không chia sẻ / chỉ đối thủ / cả đối thủ và người xem).
2. **Cấp token** (chìa truy cập) ở máy chủ: người xem **không bao giờ** có quyền phát.
3. Khi đổi vai, đuổi hoặc tiếp quản: **cập nhật hoặc thu hồi** quyền của kết nối cũ ngay. Phòng bị khoá vẫn **giữ nguyên người đang có mặt**.
4. Nối thông báo đuổi/rời/đóng phòng (T-38) và đổi vai (T-38) vào cùng dịch vụ quyền.
5. Cách thu hồi cụ thể cần được duyệt và có số đo trước khi dùng; **quyền cấm phát/nhận không được là tuỳ chọn**.
6. Khi có kết nối mới của cùng một người, chọn nó làm **kết nối điều khiển** (xử lý lần lượt theo người để tránh hai tab cùng thắng).
7. Báo cho tab cũ: "Phiên này đã được mở ở tab khác", chuyển chỉ đọc; **chặn ở máy chủ** mọi lệnh làm thay đổi từ kết nối cũ.
8. **Thu quyền camera/micro cũ** qua việc cấp quyền ở các bước trên; nơi mới **mặc định tắt**.
9. Phiên hết hạn hoặc sai thì **không** được chiếm quyền điều khiển.
10. Task này chỉ chứng minh phía máy chủ bằng kết nối thử; việc thiết bị thật dừng và thông báo trên màn hình nghiệm thu ở T-57.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Người xem thử phát hoặc xin quyền khác | Bị chặn ngay tại dịch vụ |
| Đổi giữa ba mức chia sẻ với đối thủ/người xem | Đúng tập người nhận |
| Dùng lại token cũ sau khi đổi vai hoặc bị đuổi | Không lấy lại quyền cũ; quyền mới hợp lệ vẫn hoạt động |
| Phòng khoá; người đang có mặt còn/hết hạn giữ chỗ | Không thu quyền chỉ vì khoá; cấp lại đúng tư cách |
| Đuổi hoặc đóng phòng khi còn luồng đang chạy | Người bị đuổi không xin được token mới; phòng đóng không còn quyền nhận/phát |
| Hai kết nối thử cùng tài khoản, nơi sau tiếp quản | Nơi cũ nhận thông báo, mất quyền ghi và quyền phát; nơi mới mặc định tắt |
| Nơi cũ gửi lệnh làm thay đổi | Bị từ chối **trước khi** vào xử lý, tác động bằng 0 |
| Mở nhiều tab cùng lúc | Chỉ một tab có quyền điều khiển |
| Phiên hết hạn xin tiếp quản | Không chiếm quyền điều khiển |

**Cách tự kiểm tra**
Chuẩn bị: dịch vụ LiveKit thật (tài khoản thử); hai kết nối thử cùng một tài khoản.

| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Người xem thử phát, xin quyền khác | Bị chặn |
| 2 | Đổi qua lại ba mức chia sẻ | Đúng tập nhận |
| 3 | Dùng token cũ sau khi đổi vai/đuổi | Không lấy lại quyền; quyền mới dùng được |
| 4 | Phòng khoá, người còn/hết hạn giữ chỗ xin token | Không thu quyền vì khoá; cấp lại đúng tư cách |
| 5 | Đuổi hoặc đóng phòng khi còn luồng | Không có token mới; không còn quyền |
| 6 | Mở kết nối thứ hai | Kết nối cũ nhận thông báo, mất quyền ghi và phát; mới mặc định tắt |
| 7 | Kết nối cũ gửi lệnh thay đổi | Bị từ chối, không tác động |
| 8 | Mở nhiều kết nối cùng lúc | Chỉ một có quyền |
| 9 | Dùng phiên hết hạn xin tiếp quản | Không chiếm được |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt; không ai nhận được luồng trái quyền.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý. Kết nối lại cả phòng khi bị khoá kiểm ở T-50. Tiếp quản tab thật kiểm ở T-57. Thiết bị thật dừng, thông báo trên màn hình và đi nước sau tiếp quản kiểm ở T-57 và nghiệm thu cuối. **chưa** tính đủ hai yêu cầu liên quan cho đến lúc đó.
**Bàn giao cho task sau:** dịch vụ cấp quyền cho giao diện camera/mic, tiếp quản tab, tích hợp media; tiếp quản tab cho tích hợp media.
**Không thuộc task này:** ghi hình, ghi âm; tự dựng dịch vụ riêng; giao diện; hộp thoại chọn tab phụ (giai đoạn sau); tự bật camera ở tab mới.

---

### T-57 — Nối camera/micro thật: theo đối tượng nhận, đổi vai, đuổi, tab (web, máy chủ, LiveKit)
**Thuộc Epic:** Chat, camera và micro · **Thành phần:** Frontend, Communication · **Sprint:** 4 (15/10–17/10)
**Phải xong trước:** *Nối web với máy chủ: đi nước, đồng bộ thế cờ giữa hai trình duyệt (T-30)*: nhận được chat và đi nước đang chạy thật để kiểm khi camera/micro hỏng. *Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng (T-38)*: nhận được thông báo thay đổi phòng. *Giao diện chat hai kênh và nối web với máy chủ (T-49)*: nhận được kết quả đã hoàn thành của task này. *Giao diện: camera/micro, bật tắt độc lập, mức chia sẻ, thông báo quyền và lỗi (T-51)*: nhận được bảng điều khiển và việc dọn thiết bị. *Máy chủ: cấp quyền camera/micro theo vai và mở nhiều tab (tab mới tiếp quản) (T-53)*: nhận được cấp quyền và thu hồi đã kiểm trên dịch vụ thật; nhận được một kết nối điều khiển và việc chặn lệnh cũ.

**Mục tiêu**
Nối giao diện, máy chủ và LiveKit Cloud thành **camera/micro chạy thật** và chứng minh: mỗi khi đổi vai, đuổi, đóng phòng hay mở tab mới thì **đúng người nhận luồng**, không rò, và **lỗi camera/micro không làm hỏng việc chơi cờ và chat**.

**Việc cần làm (làm lần lượt)**
1. Chạy bản ghép chung của các task tiền đề; chuẩn bị tài khoản và thiết bị thử.
2. Kiểm ma trận: hai người chơi với từng mức chia sẻ và có người xem (tối đa 5); đổi vai, đuổi, đóng phòng qua phòng thật.
3. **Tiếp quản bằng tab hoặc thiết bị thật:** nơi cũ có thông báo, chỉ đọc, camera/micro dừng, lệnh bị chặn; nơi mới tắt mặc định; thử token và lệnh cũ.
4. **Gây lỗi chỉ ở camera/micro** (từ chối quyền, ngắt luồng) trong khi vẫn kết nối ứng dụng; rồi **đi nước** (T-30) và **gửi chat** (T-49) để chắc không bị ảnh hưởng.
5. Lưu thông tin quyền và luồng làm bằng chứng; **không ghi nội dung hình ảnh hay âm thanh**.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Từng mức chia sẻ với hai người phát và tối đa năm người xem | Chỉ đúng đối thủ/người xem nhận được; người xem không phát |
| Đổi vai hoặc đuổi trong khi đang truyền; dùng token cũ | Mất quyền tại dịch vụ, không lấy lại; ẩn bảng điều khiển chưa đủ |
| Tab cũ đang phát; tab mới cùng tài khoản tiếp quản; tab cũ gửi nước | Tab cũ có thông báo, chỉ đọc, thiết bị dừng, lệnh bị chặn; tab mới điều khiển, thiết bị tắt |
| Từ chối thiết bị hoặc ngắt riêng camera/micro; rồi đi nước và chat | Nước đi vẫn đồng bộ; chat vẫn gửi và nhận; lỗi camera/micro không khoá hai việc đó |
| Đóng phòng khi còn luồng; xin token mới hoặc dùng token cũ | Không còn quyền nhận hay phát |
| Phòng khoá; người đang có mặt, người mới | Không thu quyền người đang có mặt; không cấp quyền người mới (kết nối lại theo hạn ở T-50) |

**Cách tự kiểm tra**
Chuẩn bị: nhiều trình duyệt, camera và micro thật, tài khoản LiveKit thử.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Thử từng mức chia sẻ, có người xem | Đúng người nhận; người xem không phát |
| 2 | Đổi vai hoặc đuổi khi đang truyền; dùng token cũ | Mất quyền thật |
| 3 | Tiếp quản bằng tab/thiết bị thật; tab cũ gửi nước | Đúng như bảng trên |
| 4 | Ngắt riêng camera/micro; đi nước và chat | Không bị ảnh hưởng |
| 5 | Đóng phòng khi còn luồng | Không còn quyền |
| 6 | Phòng khoá, so người cũ và mới | Đúng quyền |

**Khi nào chuyển cho người kiểm thử:** cả 6 dòng đạt trên luồng, nước đi và chat thật.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Nếu chỉ dùng dữ liệu giả hoặc ẩn giao diện làm bằng chứng thì **không đạt**. Nghiệm thu cuối có thể kiểm lại nhưng không thay thế các ca liên miền ở đây.
**Bàn giao cho task sau:** camera/micro chạy thật cho kiểm thử media theo quyền, bài tải, nghiệm thu và demo.
**Không thuộc task này:** ghi hình/ghi âm, mở rộng ngoài hai người chơi và năm người xem.
