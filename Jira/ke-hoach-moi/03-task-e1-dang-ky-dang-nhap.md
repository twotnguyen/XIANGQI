# Task của Epic "Đăng ký và đăng nhập (kèm nền tảng dự án)" (16 task)

**Ngày:** 2026-10-04 · **Trạng thái:** đề xuất, chờ PO duyệt · Chưa tạo gì trên Jira · Viết theo `00-chuan-description.md` và mẫu `00b`.

Mã task `T-01` đến `T-62` đánh theo **thứ tự làm** (số nhỏ làm trước, mỗi task chỉ cần các task có số nhỏ hơn). Task gộp nhiều phần được ghi "Phần 1, Phần 2…". Ngày Sprint: 1 = 04/10–07/10, 2 = 08/10–10/10, 3 = 11/10–14/10, 4 = 15/10–17/10.

---

### T-01 — Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động
**Thuộc Epic:** Đăng ký và đăng nhập (kèm nền tảng dự án) · **Thành phần:** QA & DevOps · **Sprint:** 1 (04/10–07/10)
**Phải xong trước:** không có (đây là việc đầu tiên).

**Mục tiêu**
Task này gồm **2 phần** làm liền nhau vì cùng một mục đích và nên do cùng một người hoặc một cặp làm.

*Phần 1 — Dựng kho mã chung và các lệnh cài đặt, kiểm tra:*
Tạo "bộ khung" để cả nhóm cùng cài đặt, chạy và kiểm tra phần mềm theo một cách giống nhau. Mọi task sau đều dùng kho mã này. Task này **chưa làm tính năng cờ tướng nào**.

*Phần 2 — Thiết lập kiểm tra tự động mỗi khi có thay đổi mã:*
Mỗi lần ai đó đẩy thay đổi mã lên, hệ thống **tự động** biên dịch, kiểm tra cách viết mã và chạy các bài kiểm tra, rồi báo xanh hoặc đỏ. Nhờ vậy lỗi bị phát hiện sớm và không ai vô tình làm hỏng phần của người khác.

**Việc cần làm (làm lần lượt)**
*Phần 1 — Dựng kho mã chung và các lệnh cài đặt, kiểm tra:*
1. Cùng nhóm chốt phiên bản công cụ chạy mã (Node) và công cụ quản lý thư viện (pnpm); ghi vào tệp mô tả để ai cũng dùng đúng.
2. Tạo **một kho mã duy nhất** chứa các phần: ứng dụng web, máy chủ, máy cờ (chạy riêng), gói luật cờ, gói hợp đồng chung.
3. Cấu hình ngôn ngữ TypeScript dùng chung cho các phần.
4. Tạo các lệnh: **cài đặt**, **biên dịch** (build), **kiểm tra cách viết mã**, **chạy bài kiểm tra tự động**.
5. Thêm một bài kiểm tra mẫu đơn giản để chứng minh lệnh kiểm tra chạy thật.
6. Viết hướng dẫn ngắn: cách cài, cách chạy, cách đọc lỗi.

*Phần 2 — Thiết lập kiểm tra tự động mỗi khi có thay đổi mã:*
1. Tạo cấu hình kiểm tra tự động trên GitHub, dùng **đúng các lệnh đã có ở task dựng kho mã**.
2. Cho chạy ở **mọi nhánh** và mỗi lần có yêu cầu gộp mã.
3. Lưu kết quả và phiên bản mã kèm theo để xem lại.
4. Không in mật khẩu hay khoá bí mật ra nhật ký.
5. Viết hướng dẫn ngắn: cách đọc lỗi, cách chạy lại.

**Các trường hợp lỗi và kết quả mong đợi**
*Phần 1 — Dựng kho mã chung và các lệnh cài đặt, kiểm tra:*
| Tình huống | Kết quả mong đợi |
|---|---|
| Máy chưa cài thư viện nào | Làm theo hướng dẫn là cài được, không cần cài thêm thứ gì ngoài công cụ đã ghi |
| Cố ý viết một lỗi vào mã | Lệnh biên dịch hoặc kiểm tra **báo lỗi**, không báo xanh |
| Cố ý làm một bài kiểm tra sai | Lệnh chạy kiểm tra **báo thất bại** |
| Có mật khẩu hoặc khoá bí mật nằm trong kho | Không được xảy ra; bí mật không nằm trong kho mã |

*Phần 2 — Thiết lập kiểm tra tự động mỗi khi có thay đổi mã:*
| Tình huống | Kết quả mong đợi |
|---|---|
| Có một bài kiểm tra sai | Kiểm tra tự động **đỏ**; không có cách nào che lỗi để thành xanh |
| Thiếu một cấu hình cần cho bài kiểm tra có dịch vụ ngoài | Báo "thiếu cấu hình", **không** báo đạt |
| Ai đó thử bỏ qua kiểm tra | Không cho phép; quy trình của dự án không cho gộp mã khi còn đỏ |

**Cách tự kiểm tra trước khi chuyển cho người kiểm thử**
*Phần 1 — Dựng kho mã chung và các lệnh cài đặt, kiểm tra:*
Chuẩn bị: một máy hoặc thư mục sạch, chưa cài gì của dự án.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Làm đúng theo hướng dẫn để cài đặt | Cài thành công, không thiếu thư viện |
| 2 | Chạy lệnh biên dịch, kiểm tra mã, kiểm tra tự động | Cả ba chạy xong và báo kết quả đúng |
| 3 | Cố ý thêm một lỗi mã rồi chạy lại | Có báo lỗi rõ ràng |
| 4 | Cố ý làm sai bài kiểm tra mẫu rồi chạy lại | Bài kiểm tra báo thất bại |
| 5 | Tìm trong kho các chuỗi giống mật khẩu | Không thấy |

**Cách tự kiểm tra**
*Phần 2 — Thiết lập kiểm tra tự động mỗi khi có thay đổi mã:*
Chuẩn bị: một nhánh thử.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Đẩy một thay đổi hợp lệ lên nhánh thử | Kiểm tra tự động chạy và **xanh**, có nhật ký và phiên bản mã |
| 2 | Cố ý làm một bài kiểm tra sai rồi đẩy lên | Kiểm tra tự động **đỏ** |
| 3 | Sửa lại cho đúng rồi đẩy lên | Chuyển sang xanh |
| 4 | Xem nhật ký | Không có mật khẩu, mã bí mật |

**Khi nào chuyển cho người kiểm thử:** (Phần 1) cả 5 dòng đạt, đã ghi lại lệnh thực tế đã dùng, và người khác làm theo hướng dẫn trên máy khác cũng chạy được. (Phần 2) cả 4 dòng đạt và có đường dẫn tới các lần chạy làm bằng chứng.
**Khi nào task xong:** (Phần 1) người kiểm thử và người xem lại mã đồng ý; không còn lỗi đã biết. (Phần 2) người kiểm thử và người xem lại mã đồng ý; kiểm tra tự động bắt được lỗi thật.
**Bàn giao cho task sau:** (Phần 1) kho mã chạy được cùng hướng dẫn, để các task còn lại dùng. (Phần 2) hệ thống kiểm tra tự động hoạt động cho mọi nhánh.
**Không thuộc task này:** (Phần 1) tính năng cờ tướng, giao diện, máy chủ thật, kiểm tra tự động trên mạng (task kế tiếp). (Phần 2) thay đổi quyền của kho mã, đặt mật khẩu bí mật, triển khai ra mạng (task khác).

---

### T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ
**Thuộc Epic:** Đăng ký và đăng nhập (kèm nền tảng dự án) · **Thành phần:** Backend · **Sprint:** 1 (04/10–07/10)
**Phải xong trước:** *Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động (T-01)*: nhận được kho mã để tạo gói dùng chung.

**Mục tiêu**
Soạn một **bản mô tả thống nhất** cho phần giao diện (trình duyệt) và phần máy chủ: mỗi bên gửi những thông tin gì, nhận lại gì, báo lỗi thế nào. Cả hai nhóm làm theo bản này nên **không phải đoán** và có thể làm song song. Đây là điều kiện để giao diện và máy chủ cùng bắt đầu từ một nơi chung.

**Việc cần làm (làm lần lượt)**
1. Liệt kê các **tin nhắn từ trình duyệt gửi lên** ở giai đoạn đầu và thông tin đi kèm. Tên dưới đây là tên tạm, nhóm chốt tên cuối.
   | Việc người dùng muốn làm | Tên tạm |
   |---|---|
   | Tạo phòng, vào phòng, rời phòng, đổi kiểu phòng, đuổi người xem | tạo phòng; vào phòng; rời phòng; đổi kiểu phòng; đuổi người xem |
   | Chuyển sang ghế hoặc sang chỗ xem, mời người xem xuống ghế | đổi chỗ; mời xuống ghế |
   | Bấm Sẵn sàng | sẵn sàng |
   | Đi một nước cờ; đầu hàng; xin hoà và trả lời | đi nước; đầu hàng; xin hoà; trả lời xin hoà |
   | Gửi tin nhắn chat | gửi chat |
   | Tìm bạn, gửi lời mời kết bạn, trả lời lời mời, mời bạn vào phòng | các lệnh bạn bè |
   | Bắt đầu và đi nước với máy | bắt đầu ván với máy; đi nước với máy |
2. Liệt kê **tin nhắn máy chủ trả về**: trạng thái phòng; trạng thái ván (thế cờ, lượt, đồng hồ, số phiên bản, nước vừa đi); ván kết thúc (kết quả, lý do); tin chat mới; lời mời mới; cập nhật bạn bè; báo lỗi.
3. Với **mọi lệnh gửi lên** quy định: mỗi lần bấm có một **mã yêu cầu duy nhất** (để gửi lại không bị làm hai lần); lệnh về ván có thêm **số phiên bản ván** (để phát hiện lệnh cũ).
4. Máy chủ xác nhận mỗi lệnh bằng **"thành công" hoặc "lỗi kèm nhóm lỗi"**. Các nhóm lỗi: hết phiên hoặc bị đăng nhập nơi khác; không có quyền; phòng đã đóng hoặc không tồn tại; hết ghế hoặc hết chỗ xem; bị đuổi; mã hoặc đường dẫn đã bị thu hồi; số phiên bản cũ; lệnh không hợp lệ; lời đề nghị hết hạn; làm quá nhiều lần; hệ thống bận hoặc lỗi.
5. Mỗi lệnh ghi: **ai được gửi**, **thông tin nào hợp lệ**, **thông tin nào máy chủ tự lấy** (người gửi lấy từ tài khoản đang đăng nhập, **không** tin thông tin "tôi là ai" do trình duyệt gửi).
6. Mỗi lệnh có **ví dụ hợp lệ và ví dụ sai**.
7. Đặt số phiên bản cho bản hợp đồng để hai bên biết đang dùng bản nào.
8. Thông tin chưa quyết được thì **ghi rõ "chờ nhóm quyết"**, không tự đặt như đã chốt.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Gửi lệnh thiếu mã yêu cầu | Hợp đồng quy định bị từ chối |
| Trình duyệt tự khai "tôi là người khác" | Hợp đồng quy định bỏ qua thông tin đó; luôn dùng người đang đăng nhập |
| Gửi lại cùng một mã yêu cầu | Hợp đồng nói rõ: nhận lại kết quả cũ, không làm lần hai |
| Lệnh về ván mang số phiên bản cũ | Hợp đồng nói rõ: bị từ chối và nhận trạng thái ván mới nhất |
| Dữ liệu trả cho người xem hoặc người lạ | Không chứa tin chat riêng, email, mã bí mật |

**Cách tự kiểm tra**
Chuẩn bị: một chương trình mẫu dùng hợp đồng ở cả hai phía.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Biên dịch cả phần giao diện và phần máy chủ dùng hợp đồng | Không lỗi kiểu dữ liệu |
| 2 | Với mỗi lệnh, kiểm tra ví dụ hợp lệ | Được chấp nhận |
| 3 | Với mỗi lệnh, kiểm tra ví dụ sai | Bị từ chối |
| 4 | Đối chiếu danh sách lệnh với danh sách yêu cầu giai đoạn đầu | Không thiếu lệnh nào, không có lệnh giai đoạn sau |
| 5 | Xem dữ liệu trả cho người xem | Không có thông tin không được phép |

**Khi nào chuyển cho người kiểm thử:** cả 5 dòng đạt; nhóm giao diện và nhóm máy chủ đã đọc và không còn câu hỏi "chỗ này là gì".
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý; mọi điều chưa chốt đã ghi rõ ai quyết.
**Bàn giao cho task sau:** gói hợp đồng chung đã biên dịch được, cùng ví dụ để cả hai nhóm dùng.
**Không thuộc task này:** viết phần xử lý thật ở máy chủ, viết giao diện; các lệnh của giai đoạn sau (Đánh Hạng, đi lại, Khách...).

---

### T-03 — Cấu hình Supabase gửi mã OTP đăng ký
**Thuộc Epic:** Đăng ký và đăng nhập (kèm nền tảng dự án) · **Thành phần:** Authentication · **Sprint:** 1 (04/10–07/10)
**Phải xong trước:** *Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động (T-01)*: nhận được quy ước đặt thông tin cấu hình mà không lộ bí mật.

**Mục tiêu**
Cấu hình dịch vụ đăng nhập **Supabase** để gửi **mã OTP 6 chữ số** qua email khi người dùng đăng ký, theo đúng quy định của dự án. Kết quả giúp task thử nghiệm OTP và phần đăng ký ở máy chủ dùng được. **Chưa** tạo tài khoản demo (làm ở task chuẩn bị demo).

**Việc cần làm (làm lần lượt)**
1. Đặt **mã OTP có hiệu lực 180 giây** (3 phút).
2. Đặt **thời gian chờ giữa hai lần gửi lại mã là 60 giây**.
3. Đặt **giới hạn số lần xác minh sai** ở mức thấp (mục tiêu khoảng 5 lần trong vài phút); ghi lại hành vi thật, vì dịch vụ chỉ giới hạn gần đúng.
4. Dùng **thư gửi mặc định của Supabase** (không dùng dịch vụ gửi thư khác). Ghi lại điều kiện thật: khoảng **2 thư mỗi giờ** và chỉ gửi được tới email thuộc nhóm dự án.
5. Đảm bảo thư dùng **mã 6 chữ số**, không dùng đường dẫn đăng nhập thay mã.
6. Đọc lại cấu hình sau khi lưu để chắc đã đúng; lập danh sách email thành viên được phép nhận thư.
7. Ghi cách cấp thông tin bí mật cho máy chủ mà không để lộ trong kho mã.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Gửi lại mã trước 60 giây | Không gửi |
| Nhập mã sau 180 giây | Mã hết hạn, không dùng được |
| Nhập sai liên tiếp nhiều lần | Bị chặn theo giới hạn thật của dịch vụ; ghi lại số liệu thực |
| Gửi tới email ngoài nhóm hoặc khi hết hạn mức thư | Nhận **lỗi thật**; không báo đã gửi |

**Cách tự kiểm tra**
Chuẩn bị: dự án Supabase thử, hộp thư của thành viên nhóm.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Đọc lại cấu hình | Khớp 180 giây, 60 giây, mã 6 chữ số |
| 2 | Gửi mã rồi gửi lại trước và đúng 60 giây | Không gửi quá sớm; gửi được sau 60 giây |
| 3 | Dùng mã trước rồi sau 180 giây | Mã còn hạn dùng được; mã hết hạn không dùng được |
| 4 | Gửi tới địa chỉ ngoài nhóm hoặc khi hết hạn mức | Nhận lỗi thật |
| 5 | Kiểm tra nơi lưu cấu hình | Không có bí mật nằm trong kho mã |

**Khi nào chuyển cho người kiểm thử:** cả 5 dòng đạt, có ảnh chụp hoặc bản ghi cấu hình (đã che bí mật).
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý.
**Bàn giao cho task sau:** cấu hình đã ghi lại, danh sách email nhóm, hạn mức thư thực tế.
**Không thuộc task này:** tạo tài khoản demo; thử nghiệm đầy đủ mã OTP (task kế tiếp); gửi thư bằng dịch vụ khác.

---

### T-04 — Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập
**Thuộc Epic:** Đăng ký và đăng nhập (kèm nền tảng dự án) · **Thành phần:** Backend · **Sprint:** 1 (04/10–07/10)
**Phải xong trước:** *Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động (T-01)*: nhận được kho mã và nơi đặt các tệp tạo bảng dữ liệu.

**Mục tiêu**
Tạo **cơ sở dữ liệu** (nơi lưu thông tin lâu dài trên Supabase) gồm các bảng cần cho giai đoạn đầu và **quy tắc ai được đọc, ai được ghi**. Các phần sau lưu và đọc dữ liệu qua đây. Task này chỉ tạo bảng và quy tắc, **không** viết xử lý nghiệp vụ.

**Việc cần làm (làm lần lượt)**
1. Tạo các bảng sau bằng tệp lệnh SQL (không dùng công cụ tạo bảng tự động khác):
   - **Hồ sơ người dùng:** tên đăng nhập, tên hiển thị, thời điểm hoàn tất đăng ký, cờ "đang chờ hoàn tất". Email lấy từ hệ thống đăng nhập, không lưu công khai.
   - **Phòng:** tên, mã phòng 8 ký tự, trạng thái (đang chờ, đang chơi, đã kết thúc, đã đóng), kiểu phòng (công khai, chỉ vào bằng mã, khoá), thời gian mỗi bên, **số người xem tối đa (0 đến 5)**, chủ phòng.
   - **Người trong phòng:** ai ngồi ghế Đỏ, ghế Đen, hoặc làm người xem; đã Sẵn sàng chưa; lúc vào, lúc ngồi ghế, lúc rời.
   - **Người bị đuổi khỏi phòng.**
   - **Ván cờ** và **nước đi** từng ván (có nước cha để sau này hỗ trợ quay lại nước).
   - **Biên lai lệnh** (ghi nhớ mã yêu cầu đã xử lý, để không làm hai lần).
   - **Tin nhắn chat của phòng.**
   - **Quan hệ bạn bè** và **lịch sử bị từ chối kết bạn**.
2. Đặt các **ràng buộc**: tên đăng nhập không trùng (không phân biệt hoa thường); mỗi phòng tối đa 1 người ngồi ghế Đỏ và 1 người ghế Đen chưa rời; số người xem không vượt số tối đa của phòng; mã phòng duy nhất; một người chỉ ngồi ghế ở **một nơi** tại một thời điểm.
3. Đặt **quy tắc quyền**: trình duyệt **không được ghi trực tiếp** vào các bảng quan trọng; không đọc được email hay cột bí mật của người khác.
4. Ván với máy ở giai đoạn đầu **chỉ giữ trong bộ nhớ**, không tạo bảng lưu.
5. Chạy thử toàn bộ các tệp lệnh trên một cơ sở dữ liệu thử sạch.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Hai người dùng cùng tên đăng nhập chỉ khác hoa thường | Bị từ chối vì trùng |
| Hai người cùng ngồi ghế Đỏ trong một phòng | Bị từ chối |
| Số người xem lớn hơn mức tối đa của phòng | Bị từ chối |
| Mã phòng có dấu gạch hoặc sai độ dài | Không lưu được; chỉ lưu dạng chuẩn 8 ký tự |
| Trình duyệt thử ghi thẳng vào bảng phòng | Bị từ chối |
| Trình duyệt thử đọc email của người khác | Bị từ chối |

**Cách tự kiểm tra**
Chuẩn bị: cơ sở dữ liệu thử sạch, hai tài khoản thử.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Chạy tất cả tệp lệnh tạo bảng | Chạy xong, đủ bảng và cột |
| 2 | Tạo một hồ sơ, một phòng, một ván, vài nước đi theo đúng quan hệ | Lưu đúng, các liên kết khớp |
| 3 | Thử các trường hợp lỗi ở bảng trên | Mỗi trường hợp bị từ chối đúng |
| 4 | Dùng quyền của trình duyệt thử ghi và thử đọc dữ liệu người khác | Bị từ chối, không lộ khoá dịch vụ |
| 5 | Chạy lại các tệp lệnh trên cơ sở dữ liệu khác | Vẫn chạy được |

**Khi nào chuyển cho người kiểm thử:** cả 5 dòng đạt, có ghi kết quả thật.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. **Chưa** kiểm số chỗ thực tế khi nhiều người vào cùng lúc (thuộc Epic Tạo phòng chơi).
**Bàn giao cho task sau:** các tệp lệnh tạo bảng và quy tắc quyền, chạy được trên cơ sở dữ liệu thử.
**Không thuộc task này:** bảng cho Đánh Hạng, chat 1-1, đổi tên đăng nhập, lịch sử xem lại (giai đoạn sau); xử lý nghiệp vụ.
**Lưu ý:** tên bảng và cột là đề xuất, nhóm có thể chỉnh. Hợp đồng chung và cơ sở dữ liệu giao nhau ở trạng thái, cột và biên lai: nhóm chốt từng hiện vật chung một trước khi cài đặt phần giao nhau.

---

### T-07 — Dựng khung máy chủ: nhận kết nối có xác thực và chuyển lệnh
**Thuộc Epic:** Đăng ký và đăng nhập (kèm nền tảng dự án) · **Thành phần:** Backend · **Sprint:** 1 (04/10–07/10)
**Phải xong trước:** *Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động (T-01)*: nhận được kho mã build được. *Soạn "hợp đồng chung" giữa trình duyệt và máy chủ (T-02)*: nhận được danh sách lệnh, thông tin đi kèm và nhóm lỗi. *Cấu hình Supabase gửi mã OTP đăng ký (T-03)*: nhận được cấu hình đăng nhập và cách kiểm tra phiên, bí mật chỉ nằm ở máy chủ.

**Mục tiêu**
Dựng **máy chủ** (NestJS và Socket.IO) biết **ai đang kết nối** và chuyển từng lệnh đến đúng nơi xử lý theo hợp đồng chung. Đây là "khung" cho tất cả phần máy chủ về sau; task này chưa chứa luật phòng hay luật ván.

**Việc cần làm (làm lần lượt)**
1. Dựng máy chủ và đường kết nối thời gian thực.
2. Khi trình duyệt kết nối, **kiểm tra thông tin đăng nhập** (token do dịch vụ đăng nhập cấp). Danh tính của người gửi **luôn lấy từ kết quả kiểm tra này**, không tin thông tin trình duyệt tự khai.
3. Dựng **bộ chuyển lệnh**: nhận lệnh, kiểm tra đúng dạng theo hợp đồng chung, gọi nơi xử lý, trả "thành công" hoặc "lỗi" theo hợp đồng.
4. Dựng **chốt kiểm tra quyền** chạy trước mọi nơi xử lý: **mặc định đóng**. Nếu chốt thiếu hoặc lỗi thì **từ chối**, không bao giờ coi là cho phép.
5. Để chỗ cắm cho kiểm tra hạn phiên (task đăng nhập) và giới hạn tốc độ kết nối (task giới hạn).
6. Dùng chốt thử (cho phép hoặc từ chối) **chỉ trong bài kiểm tra**, không dùng trong sản phẩm.
7. Không ghi bí mật vào nhật ký.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Kết nối thiếu, sai hoặc hết hạn thông tin đăng nhập | Không nhận danh tính, không nhận dữ liệu nghiệp vụ |
| Người A kết nối nhưng gửi kèm "tôi là B" | Vẫn là A |
| Chốt kiểm tra quyền bị thiếu, từ chối hoặc lỗi | Nơi xử lý **không chạy** |
| Lệnh sai dạng | Trả lỗi, không gây tác động |

**Cách tự kiểm tra**
Chuẩn bị: thông tin đăng nhập thử.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Kết nối thiếu/sai/hết hạn thông tin đăng nhập | Bị từ chối |
| 2 | Kết nối bằng thông tin của A, gửi kèm "tôi là B" | Danh tính vẫn là A |
| 3 | Bỏ chốt kiểm tra quyền, hoặc cho chốt từ chối, hoặc gây lỗi trong chốt | Nơi xử lý không chạy |
| 4 | Dùng chốt thử cho phép; gửi lệnh đúng rồi lệnh sai dạng | Đúng thì được xử lý thử; sai thì trả lỗi |

**Khi nào chuyển cho người kiểm thử:** cả 4 dòng đạt, mặc định thật sự đóng.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. **Chưa** nghiệm thu việc chặn tài khoản chưa hoàn tất đăng ký (thuộc task đăng nhập).
**Bàn giao cho task sau:** khung máy chủ, chỗ cắm chốt quyền, chỗ cắm hạn phiên và giới hạn tốc độ.
**Không thuộc task này:** luật phòng, luật ván, kiểm tra hồ sơ đăng ký, giới hạn tốc độ chi tiết.

---

### T-08 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)
**Thuộc Epic:** Đăng ký và đăng nhập (kèm nền tảng dự án) · **Thành phần:** Frontend · **Sprint:** 1 (04/10–07/10)
**Phải xong trước:** *Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động (T-01)*: nhận được kho mã và lệnh biên dịch. *Soạn "hợp đồng chung" giữa trình duyệt và máy chủ (T-02)*: nhận được gói hợp đồng để dùng trong giao diện.

**Mục tiêu**
Task này gồm **2 phần** làm liền nhau vì cùng một mục đích và nên do cùng một người hoặc một cặp làm.

*Phần 1 — Dựng khung ứng dụng web:*
Tạo "bộ khung" trang web (React và Vite): có trang, có chuyển trang, nối được với hợp đồng chung. Các màn hình ở các task sau chỉ việc gắn vào. Task này **chưa làm màn hình nào thật** và chưa nối máy chủ.

*Phần 2 — Giao diện: màu và kiểu "Kỳ Đài Cổ Phong" cùng các khối nền (nút, hộp thoại, thông báo):*
Chuyển bộ màu, kiểu chữ, khoảng cách của thiết kế thành **khối giao diện dùng chung**, để mọi màn hình sau có cùng cách nút bấm, viền focus, trạng thái và thông báo, thay vì mỗi người tự làm một kiểu.

**Việc cần làm (làm lần lượt)**
*Phần 1 — Dựng khung ứng dụng web:*
1. Dựng ứng dụng web và **bộ chuyển trang** theo danh sách trang giai đoạn đầu (đăng nhập, đăng ký, Sảnh, phòng, ván, bạn bè, ván với máy...).
2. Nối **gói hợp đồng chung** để giao diện dùng cùng kiểu dữ liệu với máy chủ.
3. Đọc cấu hình từ biến môi trường **công khai** (địa chỉ máy chủ...). Tuyệt đối không để khoá bí mật trong giao diện, vì mọi thứ trong giao diện đều công khai.
4. Dựng một trang khung có **báo lỗi** khi tải lỗi hoặc thiếu cấu hình.
5. Chỉ dùng giao diện **Kỳ Đài Cổ Phong** (một giao diện tối); không có chỗ chọn giao diện khác ở giai đoạn đầu.
6. Không thêm thư viện giao diện dựng sẵn hay Tailwind.

*Phần 2 — Giao diện: màu và kiểu "Kỳ Đài Cổ Phong" cùng các khối nền (nút, hộp thoại, thông báo):*
1. Chuyển bộ màu đã chốt (giao diện tối) và màu bàn cờ sang dạng biến dùng chung; **không đổi mã màu đã chốt**.
2. Dựng các khối nền: **nút, ô nhập, hộp thoại, thông báo, chú thích (tooltip), khung xương đang tải**. Mỗi khối có nhãn, viền focus và **đủ 5 trạng thái**.
3. Quy tắc focus: hộp xác nhận nguy hiểm (ví dụ đầu hàng) để focus vào "Huỷ"; khung xin hoà **không** giữ focus.
4. Làm một **trang kiểm tra nội bộ** liệt kê mọi khối ở mọi trạng thái để người kiểm thử duyệt.
5. Tôn trọng "giảm chuyển động". Không thêm thư viện giao diện dựng sẵn hay Tailwind.

**Các trường hợp lỗi và kết quả mong đợi**
*Phần 1 — Dựng khung ứng dụng web:*
| Tình huống | Kết quả mong đợi |
|---|---|
| Mở trực tiếp một địa chỉ trang rồi tải lại | Trang vẫn hiện, không trắng |
| Thiếu địa chỉ máy chủ trong cấu hình | Hiện thông báo thiếu cấu hình, **không** giả vờ đăng nhập |
| Có khoá bí mật trong cấu hình công khai | Không được xảy ra |

*Phần 2 — Giao diện: màu và kiểu "Kỳ Đài Cổ Phong" cùng các khối nền (nút, hộp thoại, thông báo):*
| Tình huống | Kết quả mong đợi |
|---|---|
| So màu thật với bản thiết kế | Đúng; giao diện luôn tối, không theo hệ điều hành |
| Duyệt từng trạng thái của nút, ô nhập, khung | Bị khoá có chú thích; lỗi có phản hồi |
| Mở và đóng hộp thoại bằng bàn phím | Focus đúng, và quay về nút đã mở hộp |
| Bật "giảm chuyển động" | Chuyển động tắt theo đặc tả |

**Cách tự kiểm tra**
*Phần 1 — Dựng khung ứng dụng web:*
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Cài, biên dịch, mở ứng dụng | Trang khung hiện, không lỗi khi nối hợp đồng chung |
| 2 | Tải lại một địa chỉ trang bất kỳ | Không bị trang trắng |
| 3 | Bỏ địa chỉ máy chủ khỏi cấu hình | Có thông báo thiếu cấu hình |
| 4 | Tìm khoá bí mật trong sản phẩm đã biên dịch | Không thấy |

*Phần 2 — Giao diện: màu và kiểu "Kỳ Đài Cổ Phong" cùng các khối nền (nút, hộp thoại, thông báo):*
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | So màu thực tế với bản thiết kế | Khớp |
| 2 | Duyệt đủ 5 trạng thái các khối trên trang kiểm tra | Chú thích cho khối bị khoá; có phản hồi khi lỗi |
| 3 | Mở/đóng hộp thoại bằng bàn phím | Focus đúng |
| 4 | Bật giảm chuyển động | Tắt chuyển động |

**Khi nào chuyển cho người kiểm thử:** (Phần 1) cả 4 dòng đạt, có ảnh chụp trang khung. (Phần 2) cả 4 dòng đạt, kèm ảnh chụp trang kiểm tra.
**Khi nào task xong:** (Phần 1) người kiểm thử và người xem lại đồng ý. Trang khung **không** được coi là một luồng đã chạy thật. (Phần 2) người kiểm thử và người xem lại đồng ý. Việc đo trợ năng trên toàn bộ màn hình làm ở T-59.
**Bàn giao cho task sau:** (Phần 1) khung web để các task màn hình dùng. (Phần 2) bộ khối nền cho mọi task giao diện khác.
**Không thuộc task này:** (Phần 1) làm các màn hình cụ thể; nối máy chủ thật; các chức năng giai đoạn sau. (Phần 2) bộ chọn giao diện, giao diện sáng, thư viện ngoài, từng màn hình cụ thể.

---

### T-10 — Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ
**Thuộc Epic:** Đăng ký và đăng nhập (kèm nền tảng dự án) · **Thành phần:** Backend · **Sprint:** 1 (04/10–07/10)
**Phải xong trước:** *Soạn "hợp đồng chung" giữa trình duyệt và máy chủ (T-02)*: nhận được gói chung dùng được ở cả giao diện và máy chủ, có chỗ trả kết quả lọc. *Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập (T-04)*: nhận được bảng "biên lai lệnh" và ràng buộc theo người gửi và mã yêu cầu. *Dựng khung máy chủ: nhận kết nối có xác thực và chuyển lệnh (T-07)*: nhận được máy chủ có điểm kiểm tra khi nhận kết nối và khi chuyển lệnh, và biết ai đang gửi.

**Mục tiêu**
Task này gồm **3 phần** làm liền nhau vì cùng một mục đích và nên do cùng một người hoặc một cặp làm.

*Phần 1 — Bộ lọc từ ngữ bị cấm dùng chung cho giao diện và máy chủ:*
Tạo **một bộ lọc từ ngữ bị cấm duy nhất** dùng cho: tên phòng, tên hiển thị của người dùng, tin nhắn chat. Giao diện và máy chủ dùng chung để cho **cùng một kết quả**; máy chủ luôn kiểm lại, không tin kết quả giao diện.

*Phần 2 — Cơ chế chống làm hai lần khi gửi lại cùng một yêu cầu:*
Khi mạng chập chờn, trình duyệt có thể **gửi lại cùng một yêu cầu** (hoặc người dùng bấm hai lần). Máy chủ phải **chỉ làm một lần** và trả lại đúng kết quả cũ cho lần gửi lại. Task này tạo **cơ chế chung** cho tạo phòng, vào phòng, đi nước, chat... để khỏi mỗi nơi tự làm một kiểu.

*Phần 3 — Cơ chế giới hạn tốc độ dùng chung (chống thử đoán và làm quá nhiều lần):*
Chống việc **thử đoán mật khẩu, thử đoán mã phòng, tạo phòng liên tục** và mở kết nối quá nhiều. Tạo **một cơ chế giới hạn dùng chung** và gắn việc giới hạn số lần kết nối vào máy chủ. Các nơi xử lý khác (đăng nhập, vào phòng, tạo phòng) sẽ dùng cơ chế này.

**Việc cần làm (làm lần lượt)**
*Phần 1 — Bộ lọc từ ngữ bị cấm dùng chung cho giao diện và máy chủ:*
1. Nhận **danh sách từ cấm** (tiếng Việt và tiếng Anh) do nhóm cung cấp, có số phiên bản. **Không tự bịa danh sách.**
2. Viết hàm **chuẩn hoá** để nhận ra cả các cách "né": bỏ dấu, hoa thường, thêm khoảng trắng hoặc ký tự chèn, thay chữ số 0 bằng o, số 1 bằng i.
3. Với **chat**: từ cấm được **thay bằng ***** rồi vẫn gửi đi.
4. Với **tên phòng và tên hiển thị**: nếu có từ cấm thì **từ chối**, không che bằng *** rồi lưu.
5. Cho giao diện và máy chủ dùng chung hàm và danh sách; máy chủ luôn lọc lại kể cả khi giao diện đã lọc.
6. Chuẩn bị bộ ví dụ gồm câu có từ cấm (nhiều cách né) và câu sạch (kể cả từ ghép dễ nhầm; nhóm xác nhận mong đợi).

*Phần 2 — Cơ chế chống làm hai lần khi gửi lại cùng một yêu cầu:*
1. Khi nhận yêu cầu: **xác định người gửi** rồi **tra "biên lai"** theo cặp *(người gửi, mã yêu cầu)* **trước** mọi kiểm tra điều kiện khác (như đến lượt chưa, phiên bản ván).
2. Nếu đã có biên lai: **trả lại kết quả cũ và dừng**, không làm lại.
3. Nếu là yêu cầu mới: thực hiện việc, **lưu kết quả thay đổi và biên lai trong cùng một lần lưu** (hoặc cả hai thành công, hoặc không gì cả).
4. **Chỉ sau khi lưu thành công** mới báo thành công và phát cho các bên khác. Nếu lưu lỗi thì không phát và không lưu biên lai "thành công" giả.
5. Khi trả lại kết quả cũ, **lọc lại dữ liệu theo quyền hiện tại** của người gửi (ví dụ đã bị đuổi thì không nhận dữ liệu phòng). Cách trả tối thiểu cần PO review.
6. Viết tác vụ **dọn biên lai quá 24 giờ** (không xoá ván hay nước đi).
7. Không gọi dịch vụ bên ngoài khi đang khoá cơ sở dữ liệu.

*Phần 3 — Cơ chế giới hạn tốc độ dùng chung (chống thử đoán và làm quá nhiều lần):*
1. Làm cơ chế đếm theo từng loại giới hạn ở trên, **dùng đồng hồ của máy chủ** (không dùng giờ trình duyệt).
2. Đếm **chính xác** khi nhiều yêu cầu đến cùng lúc (không để vượt giới hạn vì chạy song song).
3. Hết thời gian giới hạn thì **mở lại**, không khoá vĩnh viễn.
4. Chốt "khoá" lấy từ **tài khoản đã xác định** hoặc *(tên đăng nhập, địa chỉ mạng)* do máy chủ biết; **không** lấy từ thông tin trình duyệt tự khai.
5. Gắn giới hạn kết nối mới vào cổng kết nối của máy chủ.
6. Cung cấp **hàm dùng chung** cho các nơi xử lý: "kiểm tra", "ghi nhận một lần", "đọc thời gian còn bị khoá".
7. Chuẩn bị bộ giả lập để kiểm tra khi các nơi xử lý thật chưa có.

**Các trường hợp lỗi và kết quả mong đợi**
*Phần 1 — Bộ lọc từ ngữ bị cấm dùng chung cho giao diện và máy chủ:*
| Tình huống | Kết quả mong đợi |
|---|---|
| Chat có từ cấm viết kiểu né (bỏ dấu, chèn ký tự, 0/1) | Che bằng *** giống nhau ở giao diện và máy chủ |
| Tên phòng hoặc tên hiển thị có từ cấm | **Từ chối**, không lưu tên đã che |
| Câu sạch | Không bị che, không bị từ chối nhầm |
| Gọi thẳng máy chủ để bỏ qua giao diện | Máy chủ vẫn lọc |

*Phần 2 — Cơ chế chống làm hai lần khi gửi lại cùng một yêu cầu:*
| Tình huống | Kết quả mong đợi |
|---|---|
| Cùng người, cùng mã yêu cầu gửi lại | Nhận kết quả cũ, **không** làm thêm lần nào |
| Hai người khác nhau dùng cùng mã yêu cầu | Hai biên lai **độc lập**, không đọc được của nhau |
| Yêu cầu chưa gắn với ván (ví dụ tạo phòng, chat ở phòng chờ) | Vẫn lưu được biên lai, không cần ván giả |
| Lỗi lưu trước khi hoàn tất | Không báo thành công, không phát |
| Mất phản hồi sau khi đã lưu xong, rồi gửi lại | Trả kết quả cũ, không làm lần hai |
| Gửi lại sau khi người đó đã bị đuổi hoặc đổi vai | Không phát dữ liệu ngoài quyền; việc cũ không lặp lại |

*Phần 3 — Cơ chế giới hạn tốc độ dùng chung (chống thử đoán và làm quá nhiều lần):*
| Tình huống | Kết quả mong đợi |
|---|---|
| Sai đăng nhập lần thứ 5 trong 15 phút | Khoá 15 phút; báo lỗi chung, không lộ email; hết hạn thì xét lại |
| Nhập sai mã phòng lần thứ 11 trong một phút | Bị chặn 5 phút |
| Tạo phòng lần thứ 6 trong 10 phút | Từ chối; qua 10 phút tạo lại được; người khác không bị ảnh hưởng |
| Kết nối mới lần thứ 11 trong phút | Bị từ chối |
| Hai tài khoản cùng địa chỉ mạng | Không bị tính chung |
| Trình duyệt tự khai mã người khác để né khoá | Không né được |

**Cách tự kiểm tra**
*Phần 1 — Bộ lọc từ ngữ bị cấm dùng chung cho giao diện và máy chủ:*
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Chạy bộ ví dụ trên giao diện và trên máy chủ | Kết quả giống hệt nhau |
| 2 | Đưa từ cấm vào tên phòng, tên hiển thị | Bị từ chối |
| 3 | Chạy các câu sạch | Không bị che sai |
| 4 | Gọi thẳng máy chủ với từ cấm | Vẫn bị lọc |

*Phần 2 — Cơ chế chống làm hai lần khi gửi lại cùng một yêu cầu:*
Chuẩn bị: cơ sở dữ liệu thử, hai tài khoản thử, một việc mẫu đếm số lần được làm.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Gửi cùng yêu cầu đồng thời nhiều lần, rồi gửi lại với số phiên bản ván cũ | Việc mẫu chỉ làm **1 lần**; kết quả cũ được trả lại |
| 2 | Hai tài khoản dùng cùng mã yêu cầu | Biên lai riêng, không đọc chéo |
| 3 | Dùng việc mẫu chưa gắn ván | Lưu và đọc được biên lai |
| 4 | Gây lỗi trước khi lưu, và gây mất phản hồi sau khi lưu | Trước lưu: không phát. Sau lưu: gửi lại không làm lần hai |
| 5 | Gửi lại sau khi bị đuổi hoặc đổi vai | Không có dữ liệu ngoài quyền |
| 6 | Chạy tác vụ dọn | Chỉ biên lai quá 24 giờ bị xoá |

*Phần 3 — Cơ chế giới hạn tốc độ dùng chung (chống thử đoán và làm quá nhiều lần):*
Chuẩn bị: đồng hồ giả để rút ngắn thời gian chờ.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Báo sai đăng nhập 4 lần rồi lần thứ 5; thử trước và sau thời gian khoá | Khoá từ lần thứ 5; hết hạn thì xét lại |
| 2 | Báo sai mã phòng tới lần 10 rồi lần 11, chờ 5 phút | Bị chặn đúng; không kéo dài do giờ trình duyệt |
| 3 | Yêu cầu tạo phòng lần 5 và 6 trong 10 phút, rồi ngoài khoảng đó | Không vượt 5; hết khoảng thì tạo lại; người khác độc lập |
| 4 | Kết nối mới lần 10 và 11 trong một phút | Tối đa 10, vượt bị từ chối |
| 5 | Hai tài khoản cùng mạng; thử đổi mã người dùng để né; gửi đồng thời ở sát ngưỡng | Không tính chung; không né được; không vượt giới hạn |

**Các mức giới hạn (mức khởi đầu, do PO ủy quyền chốt ngày 04/10/2026; nhóm có thể chỉnh sau khi đo)**
*Phần 3 — Cơ chế giới hạn tốc độ dùng chung (chống thử đoán và làm quá nhiều lần):*
| Việc | Giới hạn |
|---|---|
| Đăng nhập sai | Sai **5 lần trong 15 phút** (tính theo tên đăng nhập và địa chỉ mạng) thì **khoá 15 phút**, tính từ lần sai thứ 5; luôn báo lỗi chung |
| Nhập sai mã phòng | **10 lần mỗi phút** cho mỗi phiên; vượt thì **chặn 5 phút** |
| Tạo phòng | **5 lần trong 10 phút** cho mỗi người |
| Kết nối mới | **10 lần mỗi phút** cho mỗi tài khoản; **không** giới hạn riêng theo địa chỉ mạng cho tài khoản đã đăng nhập (vì buổi demo dùng chung mạng) |

**Khi nào chuyển cho người kiểm thử:** (Phần 1) cả 4 dòng đạt; nếu chưa có danh sách thật từ nhóm thì **ghi bị chặn**, không dùng danh sách tự đặt để báo đạt. (Phần 2) cả 6 dòng đạt, có số lần thực hiện được ghi. (Phần 3) cả 5 dòng đạt.
**Khi nào task xong:** (Phần 1) người kiểm thử và người xem lại đồng ý, nhóm đã xác nhận bộ ví dụ. (Phần 2) người kiểm thử và người xem lại đồng ý. Điều cần làm rõ thêm: gửi lại **sau khi biên lai đã bị dọn** hoặc **cùng mã nhưng nội dung khác**; nhóm cần quyết (chờ quyết định). (Phần 3) người kiểm thử và người xem lại đồng ý. **Chưa** nghiệm thu các nơi xử lý đăng nhập, tạo phòng, vào phòng (các task đó dùng cơ chế này và tự kiểm).
**Bàn giao cho task sau:** (Phần 1) bộ lọc dùng chung cho tên phòng, tên hiển thị, chat. (Phần 2) cơ chế dùng chung cho phòng, ván, chat; ví dụ cách dùng. (Phần 3) hàm giới hạn dùng chung, các mức đã chốt.
**Không thuộc task này:** (Phần 1) gửi chat, giới hạn tốc độ, kiểm tra độ dài tên (nơi xử lý kiểm). (Phần 2) luật cờ, giới hạn tốc độ, đồng hồ. Ván với máy ở giai đoạn đầu không lưu vào cơ sở dữ liệu nên dùng bản trong bộ nhớ. (Phần 3) giới hạn gửi mã OTP và giới hạn chat (đã có quy định riêng).

---

### T-12 — Máy chủ: đăng ký bước 1 và 2 (kiểm tra tên đăng nhập, gửi mã OTP)
**Thuộc Epic:** Đăng ký và đăng nhập (kèm nền tảng dự án) · **Thành phần:** Authentication · **Sprint:** 1 (04/10–07/10)
**Phải xong trước:** *Cấu hình Supabase gửi mã OTP đăng ký (T-03)*: nhận được cấu hình thư mã 6 số, hạn 180 giây, gửi lại 60 giây, hạn mức thư thử. *Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập (T-04)*: nhận được bảng hồ sơ và cờ đăng ký dở. *Dựng khung máy chủ: nhận kết nối có xác thực và chuyển lệnh (T-07)*: nhận được cách nhận yêu cầu và trả kết quả.

**Mục tiêu**
Task này gồm **2 phần** làm liền nhau vì cùng một mục đích và nên do cùng một người hoặc một cặp làm.

*Phần 1 — Máy chủ: kiểm tra tên đăng nhập (hợp lệ, chưa trùng):*
Khi người dùng gõ tên đăng nhập ở bước đầu của đăng ký, máy chủ trả lời ngay "tên này **dùng được**", "**đã có người dùng**" hoặc "**không hợp lệ**". Bước này **chỉ kiểm tra**, không tạo tài khoản và không giữ chỗ tên. Giao diện đăng ký (task sau) dùng kết quả này.

*Phần 2 — Máy chủ: đăng ký bước 2, gửi mã OTP qua email:*
Ở bước 2 của đăng ký, người dùng nhập email; máy chủ **gửi mã OTP 6 số** tới email đó. Phải làm sao cho hai yêu cầu cùng lúc không phá nhau, không tạo ra tài khoản dùng được trước khi nhập đúng mã, và không báo "đã gửi" khi thực tế chưa gửi.

**Việc cần làm (làm lần lượt)**
*Phần 1 — Máy chủ: kiểm tra tên đăng nhập (hợp lệ, chưa trùng):*
1. Kiểm tra tên có hợp lệ không: **3 đến 20 ký tự**, chỉ gồm chữ cái không dấu, chữ số và dấu gạch dưới.
2. Nếu hợp lệ, so xem có ai đang dùng chưa, **không phân biệt hoa thường** (đã có "Twot" thì "twot" cũng báo trùng).
3. Trả kết quả theo hợp đồng chung. **Không** tạo hồ sơ, **không** giữ chỗ tên.
4. Lưu ý: tên được báo "còn trống" ở bước này **chưa chắc còn trống** khi hoàn tất đăng ký, vì người khác có thể lấy mất; bước hoàn tất phải kiểm lại.

*Phần 2 — Máy chủ: đăng ký bước 2, gửi mã OTP qua email:*
1. Kiểm tra email có đúng dạng.
2. **Khoá theo email**: tại một thời điểm chỉ xử lý một yêu cầu cho cùng một email (cơ chế khoá này dùng chung với bước hoàn tất và tác vụ dọn dẹp).
3. Xem trạng thái email: (a) **đã có tài khoản hoàn tất** → báo "Email này đã được đăng ký", **không gửi**; (b) **email mới hoặc đã có bản đăng ký dở** → gửi mã.
4. Với bản đăng ký dở: dùng lại bản cũ, không xoá bản của người đang đăng ký thật.
5. Gửi mã qua dịch vụ Supabase. **Gửi lại** chỉ được sau tối thiểu **60 giây**.
6. Nếu dịch vụ từ chối (hết hạn mức, lỗi): trả lỗi thật, **không** báo "đã gửi", và bản đăng ký dở vẫn còn đường phục hồi.
7. Không giữ khoá cơ sở dữ liệu trong lúc chờ dịch vụ bên ngoài.

**Thông tin vào và ra**
*Phần 1 — Máy chủ: kiểm tra tên đăng nhập (hợp lệ, chưa trùng):*
| Nhận vào | Ý nghĩa | Giá trị hợp lệ |
|---|---|---|
| Tên đăng nhập | Tên người dùng muốn dùng | 3–20 ký tự; chữ, số, gạch dưới |
Trả ra: "dùng được", "đã có người dùng" hoặc "không hợp lệ" kèm lý do.

**Các trường hợp lỗi và kết quả mong đợi**
*Phần 1 — Máy chủ: kiểm tra tên đăng nhập (hợp lệ, chưa trùng):*
| Tình huống | Kết quả mong đợi |
|---|---|
| Tên 2 ký tự hoặc 21 ký tự, hoặc có ký tự lạ (dấu cách, dấu tiếng Việt) | Báo "không hợp lệ" |
| Tên chỉ khác hoa thường với tên đã có | Báo "đã có người dùng" |
| Người dùng kiểm tên rồi bỏ dở | Không có hồ sơ nào được tạo, tên không bị giữ |
| Cơ sở dữ liệu lỗi khi kiểm | Báo lỗi; **không** trả "còn trống" giả |

*Phần 2 — Máy chủ: đăng ký bước 2, gửi mã OTP qua email:*
| Tình huống | Kết quả mong đợi |
|---|---|
| Email đã có tài khoản hoàn tất | Báo đã đăng ký, không gửi |
| Gửi lại khi chưa đủ 60 giây | Từ chối |
| Hai yêu cầu gửi cho cùng email cùng lúc | Chỉ xử lý lần lượt, không vượt hạn gửi lại |
| Dịch vụ gửi thư báo hết hạn mức hoặc lỗi | Báo lỗi, bản dở còn phục hồi được |
| Email sai dạng | Báo không hợp lệ |

**Cách tự kiểm tra**
*Phần 1 — Máy chủ: kiểm tra tên đăng nhập (hợp lệ, chưa trùng):*
Chuẩn bị: cơ sở dữ liệu thử, một tài khoản mẫu tên "Twot".
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Kiểm các tên đúng 3 và đúng 20 ký tự, rồi 2 ký tự, 21 ký tự, tên có dấu cách, tên có dấu tiếng Việt | Hai tên đầu hợp lệ; các tên còn lại báo không hợp lệ |
| 2 | Kiểm tên "twot" | Báo đã có người dùng |
| 3 | Kiểm một tên mới rồi dừng | Không có hồ sơ mới trong cơ sở dữ liệu |
| 4 | Làm cơ sở dữ liệu lỗi rồi kiểm | Báo lỗi, không báo "còn trống" |

*Phần 2 — Máy chủ: đăng ký bước 2, gửi mã OTP qua email:*
Chuẩn bị: dự án Supabase thử, email thành viên nhóm, một tài khoản đã hoàn tất mẫu.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Gửi mã cho email đã có tài khoản hoàn tất | Báo đã đăng ký; không có thư |
| 2 | Gửi mã cho email mới, rồi gửi lại ngay, rồi gửi lại sau 60 giây | Lần 1 nhận thư; lần 2 bị từ chối; lần 3 nhận thư |
| 3 | Gửi hai yêu cầu cho cùng email cùng lúc | Không vượt hạn gửi lại |
| 4 | Giả lập dịch vụ từ chối | Báo lỗi thật; bản dở vẫn còn |
| 5 | Nhập email sai dạng | Báo không hợp lệ |

**Khi nào chuyển cho người kiểm thử:** (Phần 1) cả 4 dòng đạt, có ghi kết quả thật. (Phần 2) cả 5 dòng đạt; thư thật kiểm tách riêng khỏi thư giả lập; lưu ý hạn mức thư khoảng 2 thư mỗi giờ.
**Khi nào task xong:** (Phần 1) người kiểm thử và người xem lại mã đồng ý. (Phần 2) người kiểm thử và người xem lại đồng ý.
**Bàn giao cho task sau:** (Phần 1) chức năng kiểm tên chạy được, cho giao diện đăng ký và bước hoàn tất đăng ký. (Phần 2) chức năng gửi mã và cách khoá theo email để bước hoàn tất và tác vụ dọn dùng chung.
**Không thuộc task này:** (Phần 1) giữ chỗ tên, đổi tên đăng nhập (giai đoạn sau), ô nhập ở giao diện. (Phần 2) xác minh mã, tạo tài khoản, đăng nhập Google, quên mật khẩu.

---

### T-19 — Máy chủ: đăng ký bước 3 (xác minh mã, hoàn tất tài khoản)
**Thuộc Epic:** Đăng ký và đăng nhập (kèm nền tảng dự án) · **Thành phần:** Authentication · **Sprint:** 2 (08/10–10/10)
**Phải xong trước:** *Máy chủ: đăng ký bước 1 và 2 (kiểm tra tên đăng nhập, gửi mã OTP) (T-12)*: nhận được chức năng kiểm tên đúng quy tắc và không giữ chỗ; nhận được bản đăng ký dở, chức năng gửi mã và cơ chế khoá theo email dùng chung.

**Mục tiêu**
Chỉ khi người dùng nhập **đúng mã OTP** thì mới hoàn tất tài khoản: kiểm lại tên, đặt mật khẩu, ghi hồ sơ, đánh dấu hoàn tất và đăng nhập. Phải an toàn khi lỗi xảy ra giữa chừng: **không bao giờ để tài khoản dùng được khi chưa hoàn tất, và không xoá nhầm tài khoản đã hoàn tất**.

**Việc cần làm (làm lần lượt, dưới khoá theo email)**
1. **Xác minh mã OTP.** Mã quá 180 giây hoặc sai thì từ chối. Nhập sai nhiều lần thì bị chặn (giới hạn của dịch vụ chỉ gần đúng, không đếm chính xác từng mã).
2. **Kiểm lại tên đăng nhập** (có thể đã bị người khác lấy trong lúc chờ).
3. **Đặt mật khẩu.**
4. **Ghi hồ sơ** (tên hiển thị mặc định bằng tên đăng nhập, ghi thời điểm hoàn tất).
5. **Bỏ cờ "đang chờ hoàn tất".**
6. Chỉ trả về **phiên đăng nhập dùng được** khi **cả hai** điều kiện đã đạt: có thời điểm hoàn tất **và** không còn cờ đang chờ.
7. **Xử lý lỗi giữa chừng:**
   - Lỗi **trước khi** ghi thời điểm hoàn tất: hoàn tác (xoá hồ sơ rồi tài khoản đăng nhập, thử lại có giãn cách).
   - Lỗi **sau khi** đã ghi thời điểm hoàn tất mà còn cờ: **giữ tài khoản**, chỉ bỏ cờ sau; trong lúc đó vẫn chặn không cho dùng.
8. Không giữ khoá cơ sở dữ liệu khi gọi dịch vụ đăng nhập bên ngoài.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Mã đúng, tên còn trống | Có **đúng một** hồ sơ hoàn tất, tên hiển thị = tên đăng nhập, nhận phiên đăng nhập |
| Mã hết hạn hoặc sai | Không có tài khoản dùng được |
| Tên bị người khác lấy trong lúc chờ nhập mã | Báo trùng, quay về bước đầu, **không ghi đè** người khác |
| Dừng đột ngột sau khi ghi thời điểm hoàn tất nhưng trước khi bỏ cờ | Giữ hồ sơ, vẫn chặn dùng, rồi phục hồi bỏ cờ |
| Hoàn tất và dọn dẹp chạy cùng lúc | Không xoá hồ sơ đã hoàn tất |

**Cách tự kiểm tra**
Chuẩn bị: dự án Supabase thử, email nhóm, khả năng "làm dừng" quy trình tại từng bước.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Nhập đúng mã, tên còn trống | Một hồ sơ hoàn tất, tên hiển thị = tên đăng nhập, có phiên đăng nhập |
| 2 | Dùng mã quá 180 giây; dùng mã sai | Không có tài khoản dùng được |
| 3 | Để người khác lấy tên trong lúc chờ rồi nhập mã | Báo trùng, quay bước đầu |
| 4 | Dừng quy trình ngay sau khi ghi thời điểm hoàn tất | Giữ hồ sơ, chặn dùng, phục hồi bỏ cờ |
| 5 | Dừng quy trình ở các điểm lỗi **trước** khi ghi thời điểm hoàn tất | Hoàn tác sạch, không tài khoản dở dang |

**Khi nào chuyển cho người kiểm thử:** cả 5 dòng đạt.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. **Chưa** tính việc dọn định kỳ (task sau).
**Bàn giao cho task sau:** tài khoản dùng được; trạng thái hoàn tất và cờ để các task chặn người chưa hoàn tất và tác vụ dọn dùng.
**Không thuộc task này:** giao diện, dọn dẹp định kỳ, đăng nhập Google.

---

### T-20 — Máy chủ: đăng nhập, quản lý phiên và hồ sơ
**Thuộc Epic:** Đăng ký và đăng nhập (kèm nền tảng dự án) · **Thành phần:** Authentication · **Sprint:** 2 (08/10–10/10)
**Phải xong trước:** *Cấu hình Supabase gửi mã OTP đăng ký (T-03)*: nhận được dịch vụ đăng nhập thử đã cấu hình. *Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập (T-04)*: nhận được bảng hồ sơ và cách bảo vệ. *Dựng khung máy chủ: nhận kết nối có xác thực và chuyển lệnh (T-07)*: nhận được kết quả đã hoàn thành của task này. *Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ (T-10)*: nhận được cơ chế khoá khi đăng nhập sai nhiều lần; nhận được hàm kiểm từ cấm dùng chung.

**Mục tiêu**
Task này gồm **2 phần** làm liền nhau vì cùng một mục đích và nên do cùng một người hoặc một cặp làm.

*Phần 1 — Máy chủ: đăng nhập bằng tên đăng nhập và mật khẩu, quản lý phiên:*
Cho người dùng đăng nhập bằng **tên đăng nhập và mật khẩu**, cấp **phiên đăng nhập**, và kiểm tra phiên mỗi lần kết nối. Không bao giờ để lộ email khi đăng nhập.

*Phần 2 — Máy chủ: xem và sửa hồ sơ (tên hiển thị):*
Cho người dùng đọc hồ sơ của mình và **chỉ sửa được tên hiển thị**. Mọi thứ khác (tên đăng nhập, email, thời điểm hoàn tất) phải **không sửa được** dù ai đó cố gửi thêm dữ liệu.

**Việc cần làm (làm lần lượt)**
*Phần 1 — Máy chủ: đăng nhập bằng tên đăng nhập và mật khẩu, quản lý phiên:*
1. Kiểm tra xem người này có đang bị khoá vì đăng nhập sai nhiều lần không (dùng cơ chế giới hạn).
2. **Tra email** nội bộ từ tên đăng nhập (không phân biệt hoa thường) rồi nhờ dịch vụ đăng nhập xác thực mật khẩu. **Email không bao giờ được trả về** trình duyệt.
3. Đăng nhập sai thì chỉ báo **một thông báo chung**: "Sai tên đăng nhập hoặc mật khẩu" (không nói sai cái nào), và ghi một lần sai cho cặp *(tên đăng nhập, địa chỉ mạng)*.
4. Cấp phiên: nếu người dùng chọn **"Ghi nhớ"** (mặc định) thì phiên kéo dài **30 ngày**; nếu không chọn thì hết khi **đóng trình duyệt** hoặc sau **12 giờ**, cái nào đến trước.
5. Mỗi lần kết nối: kiểm tra phiên còn hạn và **chưa bị thu hồi**. Hết hạn hoặc bị thu hồi thì từ chối và báo "hết phiên".
6. Việc đang chơi dở khi hết phiên được xử theo quy tắc mất kết nối (không tự xử thua ngay).

*Phần 2 — Máy chủ: xem và sửa hồ sơ (tên hiển thị):*
1. **Xem hồ sơ:** trả tên hiển thị, tên đăng nhập, email của **chính người đó**.
2. **Sửa tên hiển thị:** 2 đến 30 ký tự, qua bộ lọc từ cấm dùng chung; sai thì từ chối và nêu lý do.
3. **Bỏ qua mọi trường khác** trong yêu cầu sửa; không báo lỗi lạ, chỉ không áp dụng.
4. Người chưa hoàn tất đăng ký bị chốt chặn ở T-23, không tới đây.
5. Ghi nhận cho mọi lần sửa: ai, lúc nào.

**Các trường hợp lỗi và kết quả mong đợi**
*Phần 1 — Máy chủ: đăng nhập bằng tên đăng nhập và mật khẩu, quản lý phiên:*
| Tình huống | Kết quả mong đợi |
|---|---|
| Đúng tên (khác hoa thường) và đúng mật khẩu | Cấp phiên |
| Sai tên hoặc sai mật khẩu | Cùng một thông báo chung, không lộ email |
| Sai 5 lần trong 15 phút | Khoá 15 phút từ lần thứ 5; hết hạn thì thử lại được; vẫn báo lỗi chung |
| Phiên quá 12 giờ (không ghi nhớ) hoặc quá 30 ngày (ghi nhớ) | Bị từ chối |
| Phiên đã bị thu hồi, dùng lại token cũ | Bị từ chối |

*Phần 2 — Máy chủ: xem và sửa hồ sơ (tên hiển thị):*
| Tình huống | Kết quả mong đợi |
|---|---|
| Tên mới 2–30 ký tự, sạch | Lưu thành công |
| Tên 1 hoặc 31 ký tự | Từ chối |
| Tên chứa từ cấm | Từ chối, nêu lý do |
| Yêu cầu có thêm tên đăng nhập, email | Phần thêm bị bỏ qua; không đổi |
| Người này sửa hồ sơ người khác | Từ chối |

**Cách tự kiểm tra**
*Phần 1 — Máy chủ: đăng nhập bằng tên đăng nhập và mật khẩu, quản lý phiên:*
Chuẩn bị: tài khoản thử đã hoàn tất, đồng hồ giả.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Đăng nhập đúng (viết hoa thường khác); đăng nhập sai tên; sai mật khẩu | Đúng thì có phiên; hai trường hợp sai cùng một thông báo, không có email |
| 2 | Đăng nhập chọn và không chọn "Ghi nhớ"; mô phỏng vượt 12 giờ và 30 ngày | Hạn đúng; không ghi nhớ thì không khôi phục sau khi đóng |
| 3 | Thu hồi một phiên rồi dùng lại token cũ | Bị từ chối |
| 4 | Sai 4 lần rồi lần thứ 5 trong 15 phút; thử trước và sau thời gian khoá | Khoá từ lần thứ 5; hết hạn thì xét lại; lỗi vẫn chung |

*Phần 2 — Máy chủ: xem và sửa hồ sơ (tên hiển thị):*
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Xem hồ sơ | Đúng dữ liệu của mình |
| 2 | Sửa tên với 1, 2, 30, 31 ký tự | 2 và 30 lưu; 1 và 31 từ chối |
| 3 | Sửa tên chứa từ cấm | Từ chối |
| 4 | Gửi thêm email và tên đăng nhập | Không đổi |
| 5 | Sửa hồ sơ của người khác | Từ chối |

**Khi nào chuyển cho người kiểm thử:** (Phần 1) cả 4 dòng đạt. (Phần 2) cả 5 dòng đạt.
**Khi nào task xong:** (Phần 1) người kiểm thử và người xem lại đồng ý. **Chưa** nghiệm thu việc mở nhiều tab (tab mới tiếp quản), giao cho task về camera/micro và nhiều tab. (Phần 2) người kiểm thử và người xem lại đồng ý.
**Bàn giao cho task sau:** (Phần 1) chức năng đăng nhập và chốt kiểm tra phiên cho giao diện và các phần khác. (Phần 2) chức năng hồ sơ cho giao diện hồ sơ và các nơi hiển thị tên.
**Không thuộc task này:** (Phần 1) giao diện đăng nhập, tiếp quản phiên khi mở tab mới, đăng nhập Google, quên mật khẩu. (Phần 2) ảnh đại diện tải lên, đổi email hay tên đăng nhập, giao diện.

---

### T-23 — Thử nghiệm OTP thật; chặn người chưa hoàn tất đăng ký và chặn đổi email
**Thuộc Epic:** Đăng ký và đăng nhập (kèm nền tảng dự án) · **Thành phần:** Authentication, QA & DevOps · **Sprint:** 2 (08/10–10/10)
**Phải xong trước:** *Cấu hình Supabase gửi mã OTP đăng ký (T-03)*: nhận được cấu hình OTP đã ghi, hộp thư nhóm và hạn mức thư thử. *Máy chủ: đăng ký bước 3 (xác minh mã, hoàn tất tài khoản) (T-19)*: nhận được trạng thái hoàn tất và cờ đang chờ cùng quy trình hoàn tất.

**Mục tiêu**
Task này gồm **2 phần** làm liền nhau vì cùng một mục đích và nên do cùng một người hoặc một cặp làm.

*Phần 1 — Thử nghiệm mã OTP thật: gửi thư, hết hạn, dọn tài khoản dở:*
Trả lời một câu hỏi: **Supabase thật có đáp ứng được cách đăng ký bằng mã OTP mà dự án cần không?** Kết quả là một báo cáo có số đo thật. Task này **không** làm tính năng đăng ký, chỉ giúp nhóm biết có làm được và làm bằng cách nào.

*Phần 2 — Máy chủ: chặn người chưa hoàn tất đăng ký và chặn đổi email:*
Hai việc: (1) **người có đăng nhập hợp lệ nhưng chưa hoàn tất đăng ký thì không được dùng ứng dụng**; (2) **email không bao giờ đổi được**, kể cả khi ai đó gọi thẳng vào hệ thống đăng nhập (không qua giao diện). Chỉ khoá ô email ở giao diện là **chưa đủ**.

**Câu hỏi cần trả lời**
*Phần 1 — Thử nghiệm mã OTP thật: gửi thư, hết hạn, dọn tài khoản dở:*
- Thư mã thật gửi tới có đúng hạn 180 giây và gửi lại sau 60 giây không?
- Giới hạn nhập sai thực tế là bao nhiêu?
- Nếu quá trình đăng ký bị gián đoạn giữa chừng thì tài khoản dở có bị kẹt không, và dọn thế nào?
- Một người đã đăng nhập có thể **tự đổi email** qua đường tắt (không qua ứng dụng) không? (Quy định: không được đổi email.)

**Việc cần làm (làm lần lượt)**
*Phần 1 — Thử nghiệm mã OTP thật: gửi thư, hết hạn, dọn tài khoản dở:*
1. Lập bảng các câu hỏi trên và ngưỡng cần đạt.
2. Gửi thư thật tới email nhóm; ghi giờ gửi, giờ nhận, giờ mã hết hạn.
3. Thử nhập sai nhiều lần từ một địa chỉ mạng, ghi số lần thực sự bị chặn.
4. Dựng thử nghiệm đăng ký ba bước; **cố ý làm gián đoạn** ở các mốc khác nhau (trước khi ghi xong hồ sơ, sau khi ghi xong nhưng còn cờ "đang chờ"), rồi xem phục hồi và dọn.
5. Dùng tài khoản thử và khoá công khai, **thử gọi chức năng đổi email trực tiếp** của hệ thống đăng nhập; ghi email trước và sau.
6. Viết báo cáo: từng câu hỏi **đạt / không đạt / chưa kết luận**, kèm số đo thật, cấu hình và đề xuất phương án.

*Phần 2 — Máy chủ: chặn người chưa hoàn tất đăng ký và chặn đổi email:*
1. Đọc báo cáo thử nghiệm OTP thật: phần nào đã chứng minh, phần nào cơ chế chặn đổi email còn chờ quyết định.
2. Dựng **chốt chặn dùng chung** ở mọi đường vào và mọi lệnh: chỉ cho qua khi hồ sơ có thời điểm hoàn tất **và** không còn cờ đang chờ. Dữ liệu hồ sơ lấy từ máy chủ, **không tin** trình duyệt tự khai "tôi đã hoàn tất".
3. Áp dụng cơ chế chặn đổi email **đã được duyệt** ở chính hệ thống đăng nhập (cấu hình hoặc cơ chế chặn), rồi **thử bằng cách gọi thẳng** vào hệ thống đăng nhập với phiên thử.
4. Nếu chưa có cơ chế chặn email nào được duyệt, **ghi rõ "bị chặn"** phần email; luật "email không đổi" vẫn bắt buộc và không được bỏ.

**Các trường hợp lỗi và kết quả mong đợi**
*Phần 1 — Thử nghiệm mã OTP thật: gửi thư, hết hạn, dọn tài khoản dở:*
| Tình huống | Kết quả mong đợi |
|---|---|
| Dùng mã quá 180 giây | Không hoàn tất đăng ký |
| Đã ghi hồ sơ xong nhưng còn cờ "đang chờ", chạy phục hồi nhiều lần | Giữ nguyên tài khoản, chỉ bỏ cờ rồi mới cho dùng |
| Hoàn tất đăng ký và dọn dẹp chạy cùng lúc | Không xoá nhầm hồ sơ đã hoàn tất |
| Gọi đổi email trực tiếp mà không chặn được | Báo **không đạt**, không im lặng bỏ qua |
| Hết hạn mức thư | Ghi **bị chặn**, không bịa số |

*Phần 2 — Máy chủ: chặn người chưa hoàn tất đăng ký và chặn đổi email:*
| Tình huống | Kết quả mong đợi |
|---|---|
| Có đăng nhập hợp lệ nhưng chưa có hồ sơ hoàn tất | Không dùng được ứng dụng |
| Có thời điểm hoàn tất nhưng còn cờ đang chờ | Bị chặn cho đến khi bỏ cờ; không xoá hồ sơ |
| Trình duyệt tự khai "đã hoàn tất" hoặc cố ghi thẳng vào hồ sơ | Không có tác dụng |
| Gọi thẳng chức năng đổi email của hệ thống đăng nhập | Email **không đổi**; chưa chặn được thì báo "bị chặn" |

**Cách tự kiểm tra**
*Phần 1 — Thử nghiệm mã OTP thật: gửi thư, hết hạn, dọn tài khoản dở:*
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Dùng mã quá 180 giây | Đăng ký không hoàn tất |
| 2 | Làm gián đoạn đăng ký sau khi ghi hồ sơ, rồi chạy phục hồi hai lần | Tài khoản còn, cờ được bỏ đúng một lần |
| 3 | Chạy hoàn tất và dọn dẹp cùng lúc | Hồ sơ hoàn tất không bị xoá |
| 4 | Gọi đổi email trực tiếp bằng phiên thử | Báo cáo ghi rõ có đổi được hay không |
| 5 | Đối chiếu số liệu trong báo cáo với nhật ký thật | Khớp, không số bịa |

*Phần 2 — Máy chủ: chặn người chưa hoàn tất đăng ký và chặn đổi email:*
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Dùng đăng nhập hợp lệ nhưng không có hồ sơ hoàn tất | Không dùng được ứng dụng |
| 2 | Để hồ sơ có thời điểm hoàn tất nhưng còn cờ, rồi bỏ cờ | Trước khi bỏ cờ: chặn; sau: dùng được; hồ sơ không bị xoá |
| 3 | Thử tự khai hoàn tất và thử ghi thẳng vào hồ sơ | Không nâng được quyền |
| 4 | Gọi thẳng đổi email bằng phiên thử | Email cũ vẫn nguyên; hoặc ghi "bị chặn" |

**Khi nào chuyển cho người kiểm thử:** (Phần 1) báo cáo đủ, người khác làm lại theo báo cáo ra cùng kết quả. (Phần 2) cả 4 dòng đạt.
**Khi nào task xong:** (Phần 1) báo cáo hoàn tất **kể cả khi kết luận là không đạt**. Nhưng chú ý: "đạt kiểm tra OTP" chỉ được ghi khi phép thử thực sự đạt; không được dùng thư giả để thay. (Phần 2) người kiểm thử và người xem lại đồng ý. **Chỉ ghi "xong" khi cả việc chặn người chưa hoàn tất và việc chặn đổi email đều đạt**; nếu cơ chế đổi email chưa có thì phần đó ghi bị chặn, không ghi xong cả task.
**Bàn giao cho task sau:** (Phần 1) báo cáo và phương án cho các task đăng ký ở Epic Đăng ký và đăng nhập. (Phần 2) chốt chặn dùng chung cho mọi đường vào ứng dụng.
**Không thuộc task này:** (Phần 1) viết tính năng đăng ký, dọn tài khoản chính thức, dùng dịch vụ gửi thư khác. (Phần 2) đổi tên đăng nhập, quên mật khẩu (giai đoạn sau).

---

### T-24 — Giao diện: đăng ký ba bước, đăng nhập, hồ sơ, đăng xuất
**Thuộc Epic:** Đăng ký và đăng nhập (kèm nền tảng dự án) · **Thành phần:** Frontend · **Sprint:** 2 (08/10–10/10)
**Phải xong trước:** *Soạn "hợp đồng chung" giữa trình duyệt và máy chủ (T-02)*: nhận được danh sách yêu cầu và lỗi. *Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo) (T-08)*: nhận được trang chạy được; nhận được ô nhập, nút, thông báo lỗi, trạng thái đang tải. *Máy chủ: đăng nhập, quản lý phiên và hồ sơ (T-20)*: nhận được quy tắc tên hiển thị để giao diện báo đúng.

**Mục tiêu**
Task này gồm **2 phần** làm liền nhau vì cùng một mục đích và nên do cùng một người hoặc một cặp làm.

*Phần 1 — Giao diện: đăng ký ba bước:*
Màn hình đăng ký gồm **3 bước** dẫn người dùng đến tài khoản: (1) tên đăng nhập và mật khẩu, (2) email, (3) nhập mã OTP. Giao diện này làm trước với **dữ liệu giả**, chưa nối máy chủ thật (việc nối nằm ở task tích hợp T-27).

*Phần 2 — Giao diện: đăng nhập, hồ sơ cá nhân, đăng xuất:*
Người dùng đăng nhập, xem và sửa **tên hiển thị**, và đăng xuất. Cũng làm với dữ liệu giả; nối thật ở T-27.

**Việc cần làm (làm lần lượt)**
*Phần 1 — Giao diện: đăng ký ba bước:*
1. **Bước 1:** ô tên đăng nhập (kiểm lại sau khi ngừng gõ khoảng 0,3 giây, báo "dùng được / đã có người dùng / không hợp lệ"), ô mật khẩu, ô nhập lại mật khẩu. Mật khẩu từ **8 ký tự** và hai ô phải giống nhau mới cho bấm "Tiếp tục".
2. **Bước 2:** ô email; sai dạng thì báo ngay và không cho tiếp tục.
3. **Bước 3:** nhập mã 6 số. Hiện **đếm ngược 180 giây** cho hạn mã, và nút "Gửi lại" **bị mờ** (kèm giải thích) trong 60 giây đầu.
4. Nếu máy chủ báo **tên đã bị lấy** ở bước cuối, đưa người dùng **về bước 1** và giữ lại những gì đã nhập (trừ mật khẩu).
5. Mỗi bước có đủ 5 trạng thái: bình thường, đang chờ, trống, lỗi, bị khoá (có lời giải thích khi bị khoá).
6. Chạy được bằng bàn phím; chữ lỗi đọc được với trình đọc màn hình.

*Phần 2 — Giao diện: đăng nhập, hồ sơ cá nhân, đăng xuất:*
1. **Màn hình đăng nhập:** tên đăng nhập, mật khẩu, ô "Ghi nhớ" (mặc định bật). Sai thì chỉ hiện **một thông báo chung**, không nói sai cái nào. Nút "Đăng nhập khách" và "Đăng nhập Google" **mờ**, có chú thích "Sắp ra mắt".
2. **Màn hình hồ sơ:** hiện tên hiển thị (sửa được, **2 đến 30 ký tự**, bị lọc từ cấm), tên đăng nhập và email **hiện nhưng khoá, không sửa**. Ảnh đại diện là chữ cái đầu của tên.
3. **Đăng xuất:** có nút ở nơi dễ thấy; xác nhận trước khi thoát.
4. Mỗi màn hình có đủ 5 trạng thái.
5. Chạy được bằng bàn phím, đạt chuẩn dễ đọc.

**Các trường hợp lỗi và kết quả mong đợi**
*Phần 1 — Giao diện: đăng ký ba bước:*
| Tình huống | Kết quả mong đợi |
|---|---|
| Mật khẩu 7 ký tự hoặc hai ô khác nhau | Không cho tiếp tục, nêu rõ lý do |
| Mã hết hạn (180 giây) | Báo hết hạn, mời gửi lại |
| Bấm "Gửi lại" khi chưa đủ 60 giây | Nút mờ, có tooltip giải thích |
| Máy chủ báo tên bị lấy | Về bước 1, báo rõ |
| Máy chủ lỗi hoặc mất mạng | Báo lỗi, giữ nguyên dữ liệu đã nhập, cho thử lại |

*Phần 2 — Giao diện: đăng nhập, hồ sơ cá nhân, đăng xuất:*
| Tình huống | Kết quả mong đợi |
|---|---|
| Sai thông tin đăng nhập | Một thông báo chung |
| Tên hiển thị 1 hoặc 31 ký tự | Không lưu, báo lý do |
| Tên hiển thị chứa từ cấm | Không lưu, báo lý do |
| Cố sửa tên đăng nhập hoặc email | Ô bị khoá, có chú thích |
| Mất mạng khi lưu | Báo lỗi, giữ nội dung đang sửa |

**Cách tự kiểm tra**
*Phần 1 — Giao diện: đăng ký ba bước:*
Chuẩn bị: chạy giao diện với dữ liệu giả cho từng kịch bản.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Nhập mật khẩu 7 ký tự; hai ô khác nhau | Không qua bước 2, có lý do |
| 2 | Nhập email sai dạng | Báo ngay, không tiếp tục |
| 3 | Ở bước 3 quan sát đồng hồ | Đếm ngược 180 giây; "Gửi lại" mờ 60 giây đầu rồi sáng |
| 4 | Giả lập "tên bị lấy" | Về bước 1, dữ liệu còn giữ |
| 5 | Dùng bàn phím đi hết 3 bước | Làm được không cần chuột |

*Phần 2 — Giao diện: đăng nhập, hồ sơ cá nhân, đăng xuất:*
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Đăng nhập sai bằng dữ liệu giả | Thông báo chung duy nhất |
| 2 | Xem nút khách và Google | Mờ, chú thích "Sắp ra mắt" |
| 3 | Sửa tên 1, 2, 30, 31 ký tự; tên có từ cấm | 2 và 30 lưu được; còn lại báo lỗi |
| 4 | Thử sửa tên đăng nhập và email | Không sửa được, có chú thích |
| 5 | Đăng xuất | Có xác nhận, rồi về trang đăng nhập |

**Khi nào chuyển cho người kiểm thử:** (Phần 1) cả 5 dòng đạt; kèm ảnh chụp 5 trạng thái. (Phần 2) cả 5 dòng đạt, có ảnh 5 trạng thái.
**Khi nào task xong:** (Phần 1) người kiểm thử và người xem lại đồng ý. (Phần 2) người kiểm thử và người xem lại đồng ý.
**Bàn giao cho task sau:** (Phần 1) màn hình đăng ký dùng được với dữ liệu giả để task tích hợp nối với máy chủ. (Phần 2) màn hình đăng nhập, hồ sơ, đăng xuất dùng được với dữ liệu giả.
**Không thuộc task này:** (Phần 1) gọi máy chủ thật, đăng nhập, hồ sơ, đăng nhập Google và khách (đang để "Sắp ra mắt"). (Phần 2) gọi máy chủ thật, xử lý đăng xuất khi đang chơi (T-48), đổi email hay tên đăng nhập.

---

### T-27 — Nối web với máy chủ: đăng ký, đăng nhập, hồ sơ
**Thuộc Epic:** Đăng ký và đăng nhập (kèm nền tảng dự án) · **Thành phần:** Frontend, Authentication · **Sprint:** 2 (08/10–10/10)
**Phải xong trước:** *Máy chủ: đăng ký bước 3 (xác minh mã, hoàn tất tài khoản) (T-19)*: nhận được kết quả đã hoàn thành của task này. *Máy chủ: đăng nhập, quản lý phiên và hồ sơ (T-20)*: nhận được chức năng thật ở máy chủ. *Thử nghiệm OTP thật; chặn người chưa hoàn tất đăng ký và chặn đổi email (T-23)*: nhận được kết quả đã hoàn thành của task này. *Giao diện: đăng ký ba bước, đăng nhập, hồ sơ, đăng xuất (T-24)*: nhận được màn hình đã dựng.

**Mục tiêu**
Thay dữ liệu giả bằng máy chủ thật để **đi trọn từ đăng ký tới đăng nhập, sửa hồ sơ, đăng xuất** trên môi trường thử, có email thật.

**Việc cần làm (làm lần lượt)**
1. Nối ba bước đăng ký với máy chủ thật: kiểm tên, gửi mã, xác minh mã và hoàn tất.
2. Nối đăng nhập, giữ phiên theo lựa chọn "Ghi nhớ", và khôi phục phiên khi mở lại.
3. Nối hồ sơ: đọc, sửa tên hiển thị.
4. Nối đăng xuất; xoá phiên ở trình duyệt.
5. Xử lý các lỗi thật từ máy chủ (trùng tên, hết hạn mã, khoá do sai nhiều lần, hết hạn mức thư) bằng thông báo dễ hiểu.
6. Nếu phiên bị từ chối (hết hạn, bị thu hồi), đưa về trang đăng nhập.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Đăng ký đủ ba bước với email thật | Có tài khoản, vào được ứng dụng |
| Bỏ giữa chừng rồi quay lại | Phục hồi đúng như quy tắc, không kẹt email |
| Sai mật khẩu 5 lần | Hiện thông báo bị khoá tạm |
| Phiên hết hạn khi đang dùng | Về đăng nhập, có thông báo |
| Chưa hoàn tất đăng ký mà vào thẳng | Bị chặn |

**Cách tự kiểm tra**
Chuẩn bị: máy chủ và giao diện chạy thử, email nhóm.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Đăng ký trọn ba bước bằng email thật | Nhận thư, nhập mã, có tài khoản, tên hiển thị = tên đăng nhập |
| 2 | Đăng xuất rồi đăng nhập có và không "Ghi nhớ" | Đóng và mở lại: có ghi nhớ thì còn phiên, không thì hết |
| 3 | Sửa tên hiển thị; thử tên có từ cấm | Hợp lệ lưu được; sai báo lỗi |
| 4 | Sai mật khẩu 5 lần | Báo khoá tạm, thông báo chung |
| 5 | Dùng phiên đã bị thu hồi | Về trang đăng nhập |

**Khi nào chuyển cho người kiểm thử:** cả 5 dòng đạt trên môi trường thử.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý.
**Bàn giao cho task sau:** tài khoản thật đăng nhập được, cho các phần phòng chơi và ván.
**Không thuộc task này:** vào lại đúng phòng sau đăng nhập (T-47), đăng xuất khi đang chơi (T-48).

---

### T-35 — Máy chủ: tác vụ định kỳ dọn và phục hồi tài khoản đăng ký dở
**Thuộc Epic:** Đăng ký và đăng nhập (kèm nền tảng dự án) · **Thành phần:** Authentication · **Sprint:** 3 (11/10–14/10)
**Phải xong trước:** *Máy chủ: đăng ký bước 3 (xác minh mã, hoàn tất tài khoản) (T-19)*: nhận được trạng thái "hoàn tất" và "đang chờ", các nhánh lỗi và cơ chế khoá theo email.

**Mục tiêu**
Có những người bắt đầu đăng ký rồi bỏ dở, hoặc quy trình bị dừng giữa chừng. Cần một **tác vụ chạy định kỳ** để phục hồi hoặc dọn các tài khoản dở này, **không để kẹt email** và **không bao giờ xoá nhầm tài khoản đã hoàn tất**.

**Việc cần làm (làm lần lượt)**
1. Cho tác vụ chạy **khi máy chủ khởi động** và **mỗi 5 phút**.
2. Dùng **cùng cơ chế khoá theo email** với bước gửi mã và bước hoàn tất, để không đụng nhau.
3. Trước mỗi thay đổi, **đọc lại trạng thái** ngay lúc đó.
4. Phân loại:
   - Có thời điểm hoàn tất mà **còn cờ đang chờ** → **chỉ bỏ cờ**, không xoá gì.
   - **Chưa** có thời điểm hoàn tất và **quá 60 phút** → dọn: xoá hồ sơ dở rồi xoá tài khoản đăng nhập.
   - Tài khoản đăng nhập do hệ thống tạo ra mà **không có cờ** nhưng chưa hoàn tất → vẫn xét theo tuổi như trên (không vì thiếu cờ mà bỏ lọt).
5. Nếu dịch vụ bên ngoài lỗi: ghi lỗi (đã che thông tin nhạy cảm) và **thử lại ở lần chạy sau**, không báo "đã dọn".
6. Với dịch vụ hoạt động bình thường, một tài khoản dở được dọn trong khoảng **65 phút** (60 phút cộng tối đa một chu kỳ 5 phút). Không hứa con số này khi dịch vụ hỏng.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Chạy hai lần liên tiếp với hồ sơ đã hoàn tất còn cờ | Không xoá tài khoản; chỉ bỏ cờ một lần |
| Quét trong lúc có người vừa hoàn tất đăng ký | Không xoá tài khoản vừa hoàn tất |
| Hồ sơ dở đúng 60 phút và hơn 60 phút | Đúng 60: giữ lại; hơn 60: đủ điều kiện dọn |
| Dịch vụ bên ngoài lỗi lúc dọn | Ghi lỗi, thử lại lần sau |

**Cách tự kiểm tra**
Chuẩn bị: đồng hồ giả để rút ngắn thời gian; khả năng gây lỗi giả.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Chạy hai lần với hồ sơ đã hoàn tất còn cờ | Không xoá; bỏ cờ đúng một lần; tên và mật khẩu không đổi |
| 2 | Chạy khi cùng lúc có yêu cầu hoàn tất | Tài khoản vừa hoàn tất vẫn còn |
| 3 | Hồ sơ dở tại đúng 60 phút và quá 60 phút | Đúng 60: giữ; quá: dọn trong chu kỳ kế tiếp |
| 4 | Tài khoản đăng nhập không có cờ và lỗi dịch vụ | Vẫn xét tuổi; lỗi thì thử lại, không báo đã dọn |

**Khi nào chuyển cho người kiểm thử:** cả 4 dòng đạt.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý.
**Bàn giao cho task sau:** tác vụ dọn chạy định kỳ; báo cáo các lần chạy.
**Không thuộc task này:** dọn tài khoản khách (giai đoạn sau), mở rộng việc xoá dữ liệu ngoài phạm vi này.

---

### T-58 — Giao diện: đủ 5 trạng thái cho mọi màn hình; tính năng chưa làm hiển thị đúng quy tắc
**Thuộc Epic:** Đăng ký và đăng nhập (kèm nền tảng dự án) · **Thành phần:** Frontend · **Sprint:** 4 (15/10–17/10)
**Phải xong trước:** *Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng (T-14)*: nhận được kết quả đã hoàn thành của task này. *Giao diện: đăng ký ba bước, đăng nhập, hồ sơ, đăng xuất (T-24)*: nhận được kết quả đã hoàn thành của task này. *Giao diện ván: bàn cờ nối mạng, đồng hồ, nút, hộp kết quả, khung xin hoà (T-26)*: nhận được kết quả đã hoàn thành của task này. *Nối web với máy chủ: đăng ký, đăng nhập, hồ sơ (T-27)*: nhận được kết quả đã hoàn thành của task này. *Giao diện: bạn bè (tìm, lời mời, danh sách, mời vào phòng) (T-33)*: nhận được kết quả đã hoàn thành của task này. *Giao diện: chọn cấp và phe, màn ván với máy, thông báo sự cố (T-37)*: nhận được các màn hình của giai đoạn 1 đã dựng để kiểm quy tắc trên từng màn. *Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời (T-40)*: nhận được kết quả đã hoàn thành của task này. *Giao diện chat hai kênh và nối web với máy chủ (T-49)*: nhận được ứng dụng chạy thật cho từng phần để kích hoạt từng trạng thái trên dữ liệu thật. *Nối web với máy chủ: đồng hồ, kết thúc ván, mất kết nối, người xem, bảng nước đi (T-50)*: nhận được kết quả đã hoàn thành của task này. *Nối web với máy chủ: bạn bè (T-54)*: nhận được kết quả đã hoàn thành của task này. *Nối web, máy chủ và máy cờ thật: ván với máy (T-55)*: nhận được kết quả đã hoàn thành của task này. *Nối camera/micro thật: theo đối tượng nhận, đổi vai, đuổi, tab (web, máy chủ, LiveKit) (T-57)*: nhận được kết quả đã hoàn thành của task này.

**Mục tiêu**
Task này gồm **2 phần** làm liền nhau vì cùng một mục đích và nên do cùng một người hoặc một cặp làm.

*Phần 1 — Giao diện: tính năng chưa làm hiển thị đúng quy tắc (mờ kèm "Sắp ra mắt" hoặc ẩn hẳn):*
Bảo đảm người dùng **biết có những thứ "sắp ra mắt"**, nhưng **không bấm nhầm** vào chức năng chưa làm. Đồng thời **không ẩn nhầm** những chức năng của giai đoạn 1.

*Phần 2 — Giao diện: đủ 5 trạng thái cho mọi màn hình và khung dữ liệu:*
Rà lại **toàn bộ các thành phần giao diện của giai đoạn 1** (23 thành phần theo danh mục) trên ứng dụng đã nối thật, bảo đảm người dùng **luôn biết** đang tải, trống, lỗi hay bị khoá và **biết làm gì tiếp**.

**Việc cần làm (làm lần lượt)**
*Phần 1 — Giao diện: tính năng chưa làm hiển thị đúng quy tắc (mờ kèm "Sắp ra mắt" hoặc ẩn hẳn):*
1. **Làm mờ kèm "Sắp ra mắt"** các lối vào chính: Đánh Hạng, Bảng xếp hạng, Lịch sử, đăng nhập khách, đăng nhập Google, Nhắn tin, Thách đấu.
2. **Ẩn hẳn** các chức năng nằm sâu: mã QR, sticker, xin đi lại, xin đổi bên, tái đấu, xem lại ván, đi lại với máy, trợ giúp của máy, bộ chọn giao diện, ghép ngẫu nhiên.
3. Hộp kết quả ván chỉ có **Rời phòng**; giao diện luôn tối kể cả khi hệ điều hành đặt sáng.
4. Duyệt trên **các màn đã có** (đăng ký, đăng nhập, hồ sơ, bạn bè, ván, ván với máy), giữ Sảnh, Bạn bè và mời bạn online hoạt động bình thường.
5. Lập **danh sách kiểm** các lối vào chưa làm để kiểm sau mỗi lần sửa giao diện.

*Phần 2 — Giao diện: đủ 5 trạng thái cho mọi màn hình và khung dữ liệu:*
1. Lập danh sách đúng các thành phần của giai đoạn 1 và các ca kiểm tương ứng.
2. Trên ứng dụng thật, **tạo từng tình huống**: tải chậm, không có dữ liệu, lỗi (từ chối, mất mạng, phụ thuộc hỏng), thiếu quyền, đạt giới hạn, đã kết thúc.
3. Sửa phản hồi, nút "Thử lại" và chú thích; kiểm không giật bố cục và **không báo thành công giả**.
4. **Chat thật:** kiểm tải, trống, lỗi gửi, thiếu quyền, nhận tin thành công, mất xác nhận, vượt giới hạn, đổi vai; chắc chắn **dữ liệu riêng không còn trên màn hình** sau khi đổi vai (đối chiếu dữ liệu, không chỉ nhìn hình).
5. Những trạng thái không hiện (ví dụ khung không có ý nghĩa "trống") ghi theo ma trận, **không mặc định "trống" luôn là một màn hình trắng**.

**Các trường hợp lỗi và kết quả mong đợi**
*Phần 1 — Giao diện: tính năng chưa làm hiển thị đúng quy tắc (mờ kèm "Sắp ra mắt" hoặc ẩn hẳn):*
| Tình huống | Kết quả mong đợi |
|---|---|
| Bấm hoặc nhấn phím vào từng lối chính chưa làm | Không mở chức năng; có chú thích "Sắp ra mắt" |
| Mở các màn của giai đoạn 1 | Không có nút hay khay của chức năng chưa làm |
| Kết thúc ván | Chỉ có nút Rời phòng, không có Xem lại |
| Hệ điều hành đặt giao diện sáng | Ứng dụng vẫn tối |
| Duyệt đăng ký, đăng nhập, hồ sơ, bạn bè, kết quả, ván máy bằng bàn phím | Không lối chưa làm nào hoạt động; không ẩn nhầm chức năng của giai đoạn 1 |

*Phần 2 — Giao diện: đủ 5 trạng thái cho mọi màn hình và khung dữ liệu:*
| Tình huống | Kết quả mong đợi |
|---|---|
| Tải chậm; không có dữ liệu ở từng khung | Khung xương; giải thích và nút hành động đúng |
| Từ chối, mất mạng, phụ thuộc lỗi | Thông báo tiếng Việt, nút "Thử lại" đúng việc |
| Thiếu quyền, đạt giới hạn, đã kết thúc | Chú thích đúng; máy chủ vẫn chặn |
| Hộp thoại, lớp phủ (xin hoà, mất kết nối) | Đúng ngoại lệ phím Esc và focus theo ma trận |
| Chat thật: tải, trống, lỗi, thiếu quyền, nhận tin | Đủ 5 trạng thái; không báo gửi giả; không còn dữ liệu riêng sau đổi vai |

**Cách tự kiểm tra**
*Phần 1 — Giao diện: tính năng chưa làm hiển thị đúng quy tắc (mờ kèm "Sắp ra mắt" hoặc ẩn hẳn):*
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Bấm và dùng bàn phím vào từng mục chưa làm | Không mở; có chú thích |
| 2 | Duyệt các màn giai đoạn 1 | Không nút/khay chưa làm |
| 3 | Kết thúc một ván | Chỉ Rời phòng |
| 4 | Đổi hệ điều hành sang giao diện sáng | Vẫn tối |
| 5 | Duyệt các màn bằng bàn phím | Không ẩn nhầm Bạn bè, mời bạn online |

*Phần 2 — Giao diện: đủ 5 trạng thái cho mọi màn hình và khung dữ liệu:*
Chuẩn bị: ứng dụng chạy thật có công cụ làm chậm mạng và giả lập lỗi.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Làm chậm, làm trống từng khung | Khung xương; giải thích và nút đúng |
| 2 | Từ chối, mất mạng, hỏng phụ thuộc | Thông báo và "Thử lại" đúng |
| 3 | Thiếu quyền, đạt giới hạn, đã kết thúc | Chú thích đúng, máy chủ chặn |
| 4 | Mở các hộp thoại và lớp phủ | Esc, focus đúng |
| 5 | Chat thật ở các tình huống trên | Đủ 5 trạng thái, không dữ liệu riêng sót lại |

**Khi nào chuyển cho người kiểm thử:** (Phần 1) cả 5 dòng đạt. (Phần 2) mỗi ô trạng thái áp dụng có bằng chứng đạt.
**Khi nào task xong:** (Phần 1) người kiểm thử và người xem lại đồng ý. (Phần 2) người kiểm thử và người xem lại đồng ý.
**Bàn giao cho task sau:** (Phần 1) danh sách kiểm này cho nghiệm thu chấp nhận. (Phần 2) giao diện đã đủ trạng thái cho responsive, trợ năng, nghiệm thu.
**Không thuộc task này:** (Phần 1) làm các tính năng chưa làm, đổi mức ưu tiên của tính năng. (Phần 2) dựng các thành phần của chức năng chưa làm.

---

### T-59 — Giao diện: dùng được từ 360 px và bằng cảm ứng; trợ năng
**Thuộc Epic:** Đăng ký và đăng nhập (kèm nền tảng dự án) · **Thành phần:** Frontend · **Sprint:** 4 (15/10–17/10)
**Phải xong trước:** *Giao diện: đủ 5 trạng thái cho mọi màn hình; tính năng chưa làm hiển thị đúng quy tắc (T-58)*: nhận được bản ứng dụng hợp nhất đủ trạng thái.

**Mục tiêu**
Task này gồm **2 phần** làm liền nhau vì cùng một mục đích và nên do cùng một người hoặc một cặp làm.

*Phần 1 — Giao diện: dùng được từ 360 px và bằng cảm ứng:*
Bảo đảm **giai đoạn 1 dùng được từ màn hình 360 px và bằng cảm ứng**: bàn cờ, chat, camera/micro và các nút chính không bị che hay tràn ngang.

*Phần 2 — Giao diện: trợ năng (WCAG 2.1 AA, bàn phím, nhãn, độ tương phản):*
Kiểm và sửa **trợ năng** trên giao diện thật, để người dùng chỉ có bàn phím, người dùng giảm chuyển động hay người đọc màn hình vẫn nhận đủ thông tin.

**Việc cần làm (làm lần lượt)**
*Phần 1 — Giao diện: dùng được từ 360 px và bằng cảm ứng:*
1. Duyệt ở bốn cỡ: **360×800, 390×844, 1366×768, 1920×1080**, đủ các trạng thái.
2. Ở màn nhỏ, xếp lại các bảng theo thiết kế (chat và camera/micro thu thành thẻ), giữ **bàn cờ và các nút quan trọng luôn thao tác được**.
3. Kiểm cảm ứng: chạm chọn quân và ô đích, kéo thả, với cả hai phe (bàn lật), khi có hộp thoại hoặc lỗi đang mở.
4. Đo vùng chạm của nút, thẻ, ô nhập: tối thiểu **44 px** (bàn cờ theo ngoại lệ riêng của thiết kế).
5. Sửa các chỗ vỡ bố cục; **không sửa bằng cách giấu chức năng** hoặc khoá cuộn làm mất nội dung.

*Phần 2 — Giao diện: trợ năng (WCAG 2.1 AA, bàn phím, nhãn, độ tương phản):*
1. **Đo tương phản** của từng cặp chữ/nền và thành phần giao diện ở từng trạng thái (kể cả khi rê chuột, bị khoá, có độ trong suốt): chữ thường ≥ 4,5:1; chữ lớn và thành phần ≥ 3:1.
2. **Duyệt bằng bàn phím** toàn bộ màn hình, hộp thoại và bàn cờ: viền focus nhìn rõ; **không bị kẹt** ở khung xin hoà.
3. Kiểm **nhãn** cho nút chỉ có biểu tượng, trạng thái quân và đồng hồ; có **dấu hiệu ngoài màu**.
4. Bật "giảm chuyển động" và cảnh báo chiếu: **không nhấp nháy, không rung**; thông báo quan trọng không đọc từng giây của đếm lùi.
5. Sửa lỗi và kiểm lại; **không tự đổi màu nguồn** hay thêm công cụ ngoài danh sách đã chọn.

**Các trường hợp lỗi và kết quả mong đợi**
*Phần 1 — Giao diện: dùng được từ 360 px và bằng cảm ứng:*
| Tình huống | Kết quả mong đợi |
|---|---|
| Duyệt giai đoạn 1 ở bốn cỡ, đủ trạng thái | Không cuộn ngang, không che điều khiển |
| Chạm chọn và kéo thả với bàn Đen lật | Đúng giao điểm, thao tác được |
| Đo nút, thẻ, ô nhập | ≥ 44 px |
| Mở chat, camera/micro, hộp thoại ở 360 px | Không mất thao tác bàn cờ cần thiết |

*Phần 2 — Giao diện: trợ năng (WCAG 2.1 AA, bàn phím, nhãn, độ tương phản):*
| Tình huống | Kết quả mong đợi |
|---|---|
| Đo màu trên nền thực | Chữ thường ≥ 4,5:1; chữ lớn và thành phần ≥ 3:1 |
| Duyệt màn, hộp thoại, bàn cờ bằng bàn phím | Focus thấy rõ; không kẹt |
| Nút chỉ có biểu tượng; trạng thái quân và giờ | Có nhãn và dấu ngoài màu |
| Bật giảm chuyển động và cảnh báo chiếu | Không nhấp nháy hay rung; thông báo không đọc từng giây |

**Cách tự kiểm tra**
*Phần 1 — Giao diện: dùng được từ 360 px và bằng cảm ứng:*
Chuẩn bị: công cụ thay đổi kích thước màn hình và một điện thoại cảm ứng thật.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Duyệt bốn cỡ, đủ trạng thái | Không tràn ngang |
| 2 | Chạm và kéo thả ở cả hai phe | Đúng, thao tác được |
| 3 | Đo vùng chạm | ≥ 44 px |
| 4 | Mở chat, camera/micro, hộp thoại ở 360 px | Dùng được |

*Phần 2 — Giao diện: trợ năng (WCAG 2.1 AA, bàn phím, nhãn, độ tương phản):*
Chuẩn bị: công cụ đo tương phản, trình đọc màn hình.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Đo tương phản từng cặp màu thật | Đạt ngưỡng |
| 2 | Duyệt toàn bộ bằng bàn phím | Focus rõ, không kẹt |
| 3 | Kiểm nhãn bằng trình đọc màn hình | Đủ nhãn và dấu ngoài màu |
| 4 | Bật giảm chuyển động | Không nhấp nháy; thông báo đúng |

**Khi nào chuyển cho người kiểm thử:** (Phần 1) cả 4 dòng đạt, kèm ảnh bốn cỡ. (Phần 2) cả 4 dòng đạt; có báo cáo đo thật.
**Khi nào task xong:** (Phần 1) người kiểm thử và người xem lại đồng ý. (Phần 2) người kiểm thử và người xem lại đồng ý. **Bảng màu tính sẵn không thay cho bằng chứng đo trên giao diện thật.**
**Bàn giao cho task sau:** (Phần 1) giao diện đáp ứng cho nghiệm thu tiêu chí phi chức năng. (Phần 2) giao diện đạt trợ năng cho nghiệm thu tiêu chí phi chức năng.
**Không thuộc task này:** (Phần 1) ứng dụng di động riêng, thiết kế cho chức năng chưa làm. (Phần 2) đổi giao diện hay màu nguồn, thêm công cụ mới ngoài danh sách.
