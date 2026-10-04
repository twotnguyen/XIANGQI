# Task chung của dự án (5 task)

**Ngày:** 2026-10-04 · **Trạng thái:** đề xuất, chờ PO duyệt · Chưa tạo gì trên Jira · Viết theo `00-chuan-description.md` và mẫu `00b`.

Mã task `T-01` đến `T-62` đánh theo **thứ tự làm** (số nhỏ làm trước, mỗi task chỉ cần các task có số nhỏ hơn). Task gộp nhiều phần được ghi "Phần 1, Phần 2…". Ngày Sprint: 1 = 04/10–07/10, 2 = 08/10–10/10, 3 = 11/10–14/10, 4 = 15/10–17/10.

Các task này phục vụ cả dự án nên không thuộc Epic nào; trên Jira gắn nhãn `chung`.

---

### T-13 — Dựng khung kiểm thử tự động trên nhiều trình duyệt (Playwright)
**Thuộc Epic:** không thuộc Epic nào (task chung của dự án) · **Thành phần:** QA · **Sprint:** 1 (04/10–07/10)
**Phải xong trước:** *Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động (T-01)*: nhận được hệ thống biên dịch và kiểm tra chạy mỗi khi có thay đổi. *Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo) (T-08)*: nhận được trang web chạy được, có cách chuyển trang.

**Mục tiêu**
Dựng **khung kiểm thử giả lập người dùng thật** trên nhiều trình duyệt, mỗi "người dùng" tách biệt nhau (như trên hai máy khác nhau), để các task sau có chỗ chạy kịch bản nhiều người và thu bằng chứng (video, vết thao tác).

**Việc cần làm (làm lần lượt)**
1. Cài và cấu hình công cụ kiểm thử trình duyệt; mỗi người dùng một **phiên tách biệt** (không dùng chung cookie hay dữ liệu lưu).
2. Dùng các giá trị cấu hình **không phải bí mật**.
3. Viết các hàm hỗ trợ: **chuẩn bị và dọn dữ liệu**, chờ theo sự kiện (không chờ giờ tuỳ tiện).
4. Một **bài thử khói** chạy trên trang web ở T-08 để chứng minh khung hoạt động.
5. Nối báo cáo và vết thao tác vào hệ thống kiểm tra tự động; **tách riêng lỗi của ứng dụng và lỗi của môi trường**.
6. **Không** dùng giả lập mã OTP hay camera/micro làm bằng chứng thật; chưa có tài khoản hay phòng thật ở bước này.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Hai phiên cùng lưu một dấu riêng trong cookie và bộ nhớ trình duyệt | Không lẫn dữ liệu (đây chưa phải bằng chứng đăng nhập thật) |
| Bài thử cố ý sai kết quả mong đợi | Báo **không đạt** kèm bước và vết thao tác, không che lỗi |
| Chạy, dọn dữ liệu, chạy lại | Không phụ thuộc dữ liệu còn sót |
| Kiểm báo cáo và vết thao tác trước khi lưu | Không lộ chìa khoá, mật khẩu |

**Cách tự kiểm tra**
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Hai phiên đặt dấu riêng trên trang web thử | Không dùng lẫn |
| 2 | Chạy bài thử cố ý sai | Báo không đạt, có vết |
| 3 | Chạy, dọn, chạy lại | Đạt cả hai lần |
| 4 | Xem báo cáo trước khi lưu | Không có bí mật |

**Khi nào chuyển cho người kiểm thử:** cả 4 dòng đạt; bài thử khói chạy trong kiểm tra tự động.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Không cần đăng nhập thật hay phòng thật để đạt. Chuẩn bị dữ liệu thật cho từng luồng do các task tích hợp và task nghiệm thu (T-60) tự làm.
**Bàn giao cho task sau:** khung kiểm thử nhiều trình duyệt cho tích hợp và nghiệm thu.
**Không thuộc task này:** kiểm thử luồng nghiệp vụ, công cụ giả lập mạng trong sản phẩm.

---

### T-16 — Dựng môi trường demo: chạy cục bộ trước, Render làm dự phòng
**Thuộc Epic:** không thuộc Epic nào (task chung của dự án) · **Thành phần:** QA · **Sprint:** 2 (08/10–10/10)
**Phải xong trước:** *Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động (T-01)*: nhận được hệ thống biên dịch và kiểm tra hoạt động. *Dựng khung máy chủ: nhận kết nối có xác thực và chuyển lệnh (T-07)*: nhận được máy chủ chạy và nhận kết nối. *Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo) (T-08)*: nhận được web biên dịch được, có chỗ cấu hình địa chỉ máy chủ.

**Mục tiêu**
Dựng cách **chạy bản demo ngay trên máy cục bộ** (cách ưu tiên, PO quyết định 04/10/2026): chỉ cần một vài lệnh là chạy được cả web và máy chủ trên máy dùng để trình bày, vẫn nối với Supabase và LiveKit Cloud qua mạng. Nếu sau này cần một địa chỉ ai cũng mở được trên mạng thì dùng **Render làm phương án dự phòng**, chỉ làm khi PO đồng ý chi phí.

**Việc cần làm (làm lần lượt)**
1. Viết **hướng dẫn và lệnh chạy cục bộ**: cài đặt, tệp cấu hình mẫu (không chứa bí mật), lệnh chạy web và máy chủ cùng lúc.
2. Đặt các khoá bí mật ở **tệp cấu hình riêng không đưa vào kho mã**; giao diện chỉ biết địa chỉ công khai.
3. Chạy thử trên máy demo: mở web ở hai trình duyệt; thử cả từ **một máy thứ hai cùng mạng** (nếu cần cho buổi trình bày).
4. Kiểm tra máy demo **nối được** Supabase (đăng nhập, gửi mã) và LiveKit Cloud (camera/micro); ghi lại yêu cầu mạng.
5. Ghi **các bước đưa lên Render** (dự phòng) và giới hạn (chỉ một máy chủ); chưa làm thật cho đến khi PO đồng ý.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Làm theo hướng dẫn trên máy sạch | Web và máy chủ chạy, mở được |
| Kết nối sai thông tin đăng nhập | Bị chặn như bình thường |
| Tải lại trang hoặc khởi động lại máy chủ | Trang không mất; có thông báo lỗi, không dữ liệu giả |
| Tìm khoá bí mật trong web, kho mã hoặc nhật ký | Không thấy |
| Mất mạng ra ngoài (Supabase, LiveKit) | Báo lỗi thật, không giả vờ chạy được |

**Cách tự kiểm tra**
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Một người khác làm theo hướng dẫn trên máy khác | Chạy được trong thời gian hợp lý |
| 2 | Mở web ở hai trình duyệt, kết nối sai thông tin | Bị chặn |
| 3 | Đăng nhập thật và bật thử camera/micro | Nối được Supabase và LiveKit |
| 4 | Tải lại trang; khởi động lại máy chủ | Không mất trang; có báo lỗi |
| 5 | Quét kho mã và nhật ký tìm khoá bí mật | Không có |

**Khi nào chuyển cho người kiểm thử:** cả 5 dòng đạt, có hướng dẫn chạy cục bộ.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý; hướng dẫn người khác làm theo được. **Chưa** nghiệm thu toàn bộ giai đoạn đầu.
**Bàn giao cho task sau:** hướng dẫn chạy demo cục bộ và các bước dự phòng trên Render, cho chuẩn bị demo.
**Không thuộc task này:** triển khai thật lên Render hay mua gói trả phí khi chưa được PO đồng ý, tự dựng máy chủ camera, các tính năng sản phẩm.

---

### T-60 — Nghiệm thu từng tiêu chí giai đoạn 1 và chạy kịch bản demo D1–D10
**Thuộc Epic:** không thuộc Epic nào (task chung của dự án) · **Thành phần:** QA · **Sprint:** 4 (15/10–17/10)
**Phải xong trước:** *Dựng khung kiểm thử tự động trên nhiều trình duyệt (Playwright) (T-13)*: nhận được kết quả đã hoàn thành của task này. *Thử nghiệm OTP thật; chặn người chưa hoàn tất đăng ký và chặn đổi email (T-23)*: nhận được kết quả đã hoàn thành của task này. *Nối web với máy chủ: đăng ký, đăng nhập, hồ sơ (T-27)*: nhận được kết quả đã hoàn thành của task này. *Máy chủ: tác vụ định kỳ dọn và phục hồi tài khoản đăng ký dở (T-35)*: nhận được kết quả đã hoàn thành của task này. *Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời (T-40)*: nhận được kết quả đã hoàn thành của task này. *Nối web với máy chủ: bấm đường dẫn mời, đăng nhập rồi vào đúng phòng (T-47)*: nhận được kết quả đã hoàn thành của task này. *Đăng xuất giữa ván: xác nhận, đầu hàng, rời phòng rồi đăng xuất (T-48)*: nhận được kết quả đã hoàn thành của task này. *Giao diện chat hai kênh và nối web với máy chủ (T-49)*: nhận được kết quả đã hoàn thành của task này. *Nối web với máy chủ: đồng hồ, kết thúc ván, mất kết nối, người xem, bảng nước đi (T-50)*: nhận được kết quả đã hoàn thành của task này. *Nối web với máy chủ: bạn bè (T-54)*: nhận được kết quả đã hoàn thành của task này. *Nối web, máy chủ và máy cờ thật: ván với máy (T-55)*: nhận được kết quả đã hoàn thành của task này. *Nối camera/micro thật: theo đối tượng nhận, đổi vai, đuổi, tab (web, máy chủ, LiveKit) (T-57)*: nhận được kết quả đã hoàn thành của task này. *Giao diện: đủ 5 trạng thái cho mọi màn hình; tính năng chưa làm hiển thị đúng quy tắc (T-58)*: nhận được kết quả đã hoàn thành của task này.

**Mục tiêu**
**Đối chiếu từng tiêu chí** của giai đoạn 1 với sản phẩm chạy thật và chạy **kịch bản demo D1 đến D10** (xem danh sách ở đầu file). Demo "đường thuận" chỉ là một phần của nghiệm thu.

**Việc cần làm (làm lần lượt)**
1. **Tự chuẩn bị tài khoản đã hoàn tất, phòng và dữ liệu ca biên** trên dịch vụ thật, ghi cách tạo và đặt lại, che bí mật. Tách riêng khỏi tài khoản demo (T-62). D1 vẫn dùng **OTP thật**.
2. Lập **bảng đối chiếu**: mỗi tiêu chí → ca kiểm → bằng chứng; bảo đảm không thiếu, không thừa.
3. Chạy **D1 đến D10** đúng thứ tự (D8: rời ghế trước khi vào ván máy; D9: tạo ván online mới).
4. Chạy từng nhánh ngoài demo: quyền, đồng thời, gọi thẳng sai vai, hết hạn; ghi riêng kết quả và liên kết lỗi.
5. Chạy các nhánh mới nối: đăng ký dở và phục hồi, gọi hệ thống khi chưa hoàn tất, vào phòng qua đường dẫn sau đăng nhập, chat lỗi, các tính năng chưa làm hiển thị đúng.
6. Các yêu cầu phi chức năng NFR-08 (nhật ký vận hành), NFR-09 (lưu giữ dữ liệu), NFR-10 (hiển thị chữ thuần) **đã được PO duyệt** nên **phải đạt**; cách hiển thị ván gián đoạn cũng đã chốt. Chỉ dọn chat Khách (giai đoạn sau) còn chờ.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Đối chiếu tập tiêu chí hai chiều | Không thiếu, không trùng sai; mỗi nhánh có kết quả |
| Chạy D1–D10 đúng thứ tự | Đủ tám mục tiêu cốt lõi; không dùng dữ liệu giả làm bằng chứng thật |
| Gọi thẳng sai vai, đồng thời, hết hạn | Đúng theo ma trận nghiệm thu, không lộ dữ liệu |
| Nhật ký vận hành, dọn dữ liệu theo thời hạn, hiển thị chữ thuần | Kiểm theo ba yêu cầu đã duyệt (xem bên dưới) |
| Đăng ký dở, gọi khi chưa hoàn tất, đăng nhập qua đường dẫn, chat lỗi, tính năng chưa làm | Đúng quyền, đúng phòng đích, đúng trạng thái; đủ bằng chứng |
| Bạn vào ván với máy thật; thử mời; rời ván rồi mời lại | Đang chơi: Đang đấu, không nhận mời; rời xong: Online rảnh |
| Từ chối thiết bị hoặc rớt camera/micro rồi đi nước và chat | Nước vẫn đồng bộ, chat đúng kênh; camera/micro báo lỗi riêng |
| Nơi cũ đang chơi; mở nơi mới cùng tài khoản; nơi cũ gửi nước | Cũ chỉ đọc, thiết bị dừng, máy chủ chặn nước cũ; mới điều khiển, camera/micro tắt |
| Kết thúc ván online thật, còn ghế bị chặn vào ván máy; Rời phòng rồi vào đủ ba cấp máy | Rời ghế giải phóng chỗ; máy chạy đúng; không dùng dữ liệu mẫu thay cho bước này |

**Cách tự kiểm tra**
Chuẩn bị: bản build tích hợp cùng phiên bản, nhiều trình duyệt, thiết bị thật, hạn mức dịch vụ.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Đối chiếu tiêu chí và ca hai chiều | Không thiếu, không trùng |
| 2 | Chạy D1 đến D10 | Đạt hoặc có lỗi rõ ràng |
| 3 | Chạy các nhánh quyền, đồng thời, gọi thẳng | Đúng |
| 4 | Chạy các nhánh mới nối | Đúng |
| 5 | Chạy ba ca liên miền (bạn bè với ván máy; camera/micro hỏng; tiếp quản) | Đúng |
| 6 | Chạy D8 đầy đủ | Rời ghế thật, vào đủ ba cấp máy |

**Khi nào chuyển cho người kiểm thử:** mọi tiêu chí và D1–D10 có trạng thái trung thực (đạt, không đạt, bị chặn, chưa chạy), có bằng chứng hoặc lý do thiếu; mỗi lỗi có bước tái hiện và người nhận.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý với **báo cáo**; lỗi sản phẩm không cản việc bàn giao báo cáo đầy đủ. **Cửa phát hành giai đoạn 1 chưa đạt** nếu còn tiêu chí bắt buộc thất bại hoặc chưa kiểm, hay còn lỗi mức Cao hoặc Nghiêm trọng. Sửa theo từng phần và kiểm lại ngay khi phát hiện, không chờ T-62.
**Bàn giao cho task sau:** bảng đối chiếu và danh sách lỗi cho nghiệm thu phi chức năng, chuẩn bị demo, bàn giao.
**Không thuộc task này:** tính năng của giai đoạn sau, lấy "task đã xong" thay cho "tiêu chí đạt".

---

### T-61 — Nghiệm thu phi chức năng: bài tải, quyền camera/micro, trình duyệt, bảo mật
**Thuộc Epic:** không thuộc Epic nào (task chung của dự án) · **Thành phần:** QA · **Sprint:** 4 (15/10–17/10)
**Phải xong trước:** *Thử nghiệm OTP thật; chặn người chưa hoàn tất đăng ký và chặn đổi email (T-23)*: nhận được kết quả đã hoàn thành của task này. *Kiểm thử luật cờ: đếm nước đi độc lập và bộ kiểm thử chạy tự động (T-46)*: nhận được kết quả đã hoàn thành của task này. *Giao diện chat hai kênh và nối web với máy chủ (T-49)*: nhận được kết quả đã hoàn thành của task này. *Nối web với máy chủ: đồng hồ, kết thúc ván, mất kết nối, người xem, bảng nước đi (T-50)*: nhận được ván, kết nối lại, người xem chạy thật. *Đo máy cờ đầy đủ (GATE-AI): tốc độ, độ sâu, sức mạnh, độ ổn định (T-56)*: nhận được kết quả đã hoàn thành của task này. *Nối camera/micro thật: theo đối tượng nhận, đổi vai, đuổi, tab (web, máy chủ, LiveKit) (T-57)*: nhận được camera/micro chạy thật cùng đổi vai, đuổi, tiếp quản. *Giao diện: dùng được từ 360 px và bằng cảm ứng; trợ năng (T-59)*: nhận được kết quả đã hoàn thành của task này.

**Mục tiêu**
Task này gồm **3 phần** làm liền nhau vì cùng một mục đích và nên do cùng một người hoặc một cặp làm.

*Phần 1 — Bài tải: 50 kết nối đồng thời, 10 ván (camera/micro chỉ đo nhẹ):*
Đo **sức chịu tải** và **độ trễ nước đi** tại đúng điểm cần đo. Kiểm: người xem nhận thế cờ mới dưới 100 ms; 50 kết nối với 10 ván cùng lúc, nước đi p95 dưới 300 ms. Phần camera/micro (PO duyệt 04/10/2026) chạy **quy mô nhỏ, khoảng 3 phòng**, **chỉ ghi số đo** (số luồng, băng thông, mức dùng hạn mức miễn phí), **không đặt ngưỡng đạt** và không nằm trong điều kiện đạt của giai đoạn 1, để khỏi dùng hết hạn mức miễn phí trước buổi demo.

*Phần 2 — Kiểm thử quyền camera/micro (thủ công và bằng công cụ):*
Kiểm **độc lập** việc phân quyền camera/micro trên bản ứng dụng đã nối. Bằng chứng phải chứng minh: người **không có quyền** không nhận và không phát được luồng thật.

*Phần 3 — Nghiệm thu các yêu cầu phi chức năng đã duyệt (hiệu năng, trình duyệt, bảo mật):*
Kết luận về các **yêu cầu phi chức năng đã được duyệt** dựa trên **số đo và kiểm thử độc lập**, để chất lượng được đánh giá riêng với chuyện "demo chạy được".

**Việc cần làm (làm lần lượt)**
*Phần 1 — Bài tải: 50 kết nối đồng thời, 10 ván (camera/micro chỉ đo nhẹ):*
1. **Tự chuẩn bị tài khoản thử** (hồ sơ hoàn tất, phiên hợp lệ, đủ quyền) cho 10 phòng, 20 người chơi và 30 kết nối khác (người xem, Sảnh, chat); **không** làm giả phiên hay bỏ qua kiểm tra để đạt 50 kết nối.
2. Dựng 10 ván; mỗi phòng tối đa **5 người xem**.
3. Cho đi **nước hợp lệ đều đặn trong 10 phút**; ghi thời điểm máy chủ nhận, máy chủ phát và **máy người xem nhận**; ghi cách đồng bộ đồng hồ và sai số.
4. Tính p95 riêng cho **mạng nội bộ** và cho **tải tổng**, không chỉ lấy thời gian máy chủ.
5. Theo dõi tài nguyên máy chủ (CPU, bộ nhớ) trong lúc chạy.
6. Phần **camera/micro** chạy qua ứng dụng thật ở **quy mô nhỏ (~3 phòng)**: ghi riêng số luồng, băng thông, hạn mức; **chỉ ghi số đo, không có ngưỡng đạt/không đạt**.
7. Báo đủ số đo và kết luận từng chỉ tiêu; có mẫu vượt ngưỡng hay đứt kết nối thì **giữ số thật**, giao miền sửa và đo lại, **không bỏ mẫu để p95 đẹp**; dọn dữ liệu thử.

*Phần 2 — Kiểm thử quyền camera/micro (thủ công và bằng công cụ):*
1. Chuẩn bị tài khoản và thiết bị thử từ bản build của T-57; đo **từng mức chia sẻ** độc lập ở hai người phát.
2. Dùng **client cố tình trái quyền** gọi thẳng vào dịch vụ để thử phát và nhận; kiểm dữ liệu và luồng nhận tại dịch vụ.
3. Đổi vai, đuổi, tiếp quản qua luồng thật; thử token cũ và quyền mới hợp lệ; kiểm phòng khoá không tự thu quyền người đang có mặt (kết nối lại cả phòng đã kiểm ở T-50).
4. Ghi từng quyền: đạt, không đạt, bị chặn, kèm bản build, phương pháp; **lỗi thu quyền giao ngay** cho người làm cấp quyền, rồi kiểm lại trên bản sửa, **không chờ T-62**.
5. Rà cấu hình và sản phẩm kiểm thử để chắc **không ghi hình hay lưu** nội dung camera/micro.

*Phần 3 — Nghiệm thu các yêu cầu phi chức năng đã duyệt (hiệu năng, trình duyệt, bảo mật):*
1. Đọc số đo tải, responsive và trợ năng, **cùng phiên bản build**.
2. Kiểm quyền ở máy chủ, dữ liệu trả về và **không có bí mật trong phần chạy ở trình duyệt**; khởi động lại máy chủ giữa ván.
3. Đối chiếu kết quả máy cờ, OTP thật, camera/micro với **tiêu chuẩn thật**; mục nào thiếu bằng chứng thì ghi rõ.
4. Lập bảng đạt hay chưa đạt cho từng tiêu chuẩn; **chạy lại phần đã thay đổi sau lần đo**.
5. Kiểm thêm ba yêu cầu mới duyệt: **nhật ký vận hành** (gây lỗi rồi đọc nhật ký: có mục đúng mã, không có mật khẩu, mã OTP, token, chat); **lưu giữ dữ liệu** (tác vụ dọn: chat phòng đã đóng, biên lai quá 24 giờ, nhật ký quá 14 ngày bị xoá; ván online và nước đi còn nguyên; ván với máy không có bản ghi bền); **hiển thị chữ thuần** (gửi HTML, script, đường dẫn tự kích hoạt vào chat, tên hiển thị, tên phòng: hiện nguyên văn, không chạy gì).

**Các trường hợp lỗi và kết quả mong đợi**
*Phần 1 — Bài tải: 50 kết nối đồng thời, 10 ván (camera/micro chỉ đo nhẹ):*
| Tình huống | Kết quả mong đợi |
|---|---|
| 50 kết nối, 10 ván, 10 phút | 0 mất kết nối ngoài ý muốn; p95 nước đi dưới 300 ms |
| Đo từ lúc máy chủ nhận đến lúc người xem nhận | p95 dưới 100 ms; ghi cách đồng bộ đồng hồ |
| Theo dõi tài nguyên trong lúc tải | CPU và bộ nhớ không tăng mãi; ghi số thật |
| Chạy camera/micro ở quy mô nhỏ (~3 phòng) | Ghi số đo riêng; không tính vào điều kiện đạt |
| Chuẩn bị và đặt lại dữ liệu, kiểm hồ sơ, phiên, quyền | Đủ 50 kết nối hợp lệ, 10 ván thật; không quá 5 người xem mỗi phòng; không vòng qua kiểm tra |
| Có mẫu vượt ngưỡng hoặc đứt kết nối | Giữ số thật, báo không đạt, giao miền sửa |

*Phần 2 — Kiểm thử quyền camera/micro (thủ công và bằng công cụ):*
| Tình huống | Kết quả mong đợi |
|---|---|
| Mọi mức chia sẻ với đối thủ và người xem | Chỉ nhận đúng luồng được phép |
| Người xem gọi thẳng công cụ phát | Không phát được gì |
| Dùng lại token cũ; xin token mới hợp lệ | Token cũ không lấy lại quyền; token mới hoạt động đúng |
| Rà cấu hình và sản phẩm kiểm thử | Không có ghi hình, ghi âm hay lưu |

*Phần 3 — Nghiệm thu các yêu cầu phi chức năng đã duyệt (hiệu năng, trình duyệt, bảo mật):*
| Tình huống | Kết quả mong đợi |
|---|---|
| Đối chiếu báo cáo mạng nội bộ và tải | p95 dưới 100 ms và dưới 300 ms, đúng môi trường |
| Giả mạo nước đi hay kết quả; đọc sai vai; quét phần chạy ở trình duyệt | Không có tác động trái quyền, không lộ bí mật |
| Chrome, Edge, Firefox, Safari bản mới, bốn cỡ màn hình | Không lỗi chức năng, không cuộn ngang |
| Khởi động lại; đối chiếu báo cáo máy cờ | Ván gián đoạn đúng; máy đạt ngưỡng thật |
| Một báo cáo (máy cờ, đếm nước, OTP, camera/micro) thiếu bằng chứng hoặc khác phiên bản hiện tại | Không kết luận đạt; đo lại hoặc ghi bị chặn |

**Cách tự kiểm tra**
*Phần 1 — Bài tải: 50 kết nối đồng thời, 10 ván (camera/micro chỉ đo nhẹ):*
Chuẩn bị: môi trường thử, tập lệnh tải, máy đo.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Chạy 50 kết nối, 10 ván trong 10 phút | 0 mất kết nối ngoài ý muốn; p95 < 300 ms |
| 2 | Đo từ máy chủ nhận đến người xem nhận | p95 < 100 ms |
| 3 | Theo dõi CPU, bộ nhớ | Không tăng liên tục |
| 4 | Chạy phần camera/micro (nếu duyệt) | Số liệu riêng, kết luận đúng |
| 5 | Kiểm dữ liệu thử | Hợp lệ, không vượt 5 người xem/phòng |
| 6 | Có mẫu lỗi | Giữ lại, báo đúng |

*Phần 2 — Kiểm thử quyền camera/micro (thủ công và bằng công cụ):*
Chuẩn bị: nhiều tài khoản, thiết bị thật, công cụ gọi thẳng dịch vụ.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Thử mọi mức chia sẻ | Chỉ luồng được phép |
| 2 | Người xem gọi thẳng để phát | Không phát được |
| 3 | Dùng token cũ và mới | Đúng như bảng |
| 4 | Rà cấu hình, sản phẩm | Không có chỗ ghi hay lưu |

*Phần 3 — Nghiệm thu các yêu cầu phi chức năng đã duyệt (hiệu năng, trình duyệt, bảo mật):*
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Đối chiếu báo cáo mạng nội bộ, tải | Đạt ngưỡng đúng môi trường |
| 2 | Thử giả mạo, đọc sai vai, quét phần chạy ở trình duyệt | Không tác động, không lộ |
| 3 | Chạy bốn trình duyệt ở bốn cỡ | Không lỗi |
| 4 | Khởi động lại giữa ván; đối chiếu máy cờ | Đúng |
| 5 | Kiểm các báo cáo thiếu hoặc lệch phiên bản | Không kết luận đạt |

**Khi nào chuyển cho người kiểm thử:** (Phần 1) báo cáo có quy trình tái lập, bản build, phương pháp, số thô, và kết luận từng chỉ tiêu. (Phần 2) mọi ô của ma trận có kết quả và bằng chứng (hoặc lý do chưa kiểm), ghi rõ build và cách làm. (Phần 3) mỗi tiêu chuẩn có phương pháp, bản build, số đo, bằng chứng và kết luận (hoặc lý do bị chặn/chưa chạy); có lỗi thì có người nhận và phạm vi đo lại.
**Khi nào task xong:** (Phần 1) người kiểm thử và người xem lại đồng ý với **báo cáo**. Chỉ tiêu chưa chạy phải ghi lý do, **không** ghi "đã đo đủ". **Tiêu chuẩn sản phẩm** (dưới 100 ms, 50 kết nối/10 ván, dưới 300 ms, tài nguyên ổn định) chỉ "đạt" khi số đo đạt; không đạt giữ trạng thái không đạt/chặn, giao sửa và đo lại ngay. (Phần 2) người kiểm thử và người xem lại đồng ý với **báo cáo**. **Không** đổi kết quả không đạt thành đạt. **Tiêu chuẩn sản phẩm:** mọi quyền bắt buộc đã duyệt đều đạt tại dịch vụ; không nhận hay phát luồng trái quyền; không lưu nội dung. Có vi phạm thì tiêu chuẩn bị chặn, sửa và kiểm lại ngay. (Phần 3) người kiểm thử và người xem lại đồng ý với **báo cáo**. **Tiêu chuẩn chất lượng:** mọi yêu cầu phi chức năng bắt buộc đã duyệt phải đạt đúng ngưỡng trước khi bàn giao; sửa và đo lại ngay khi phát hiện, trước T-62; **không hạ ngưỡng**.
**Bàn giao cho task sau:** (Phần 1) số đo tải cho nghiệm thu các yêu cầu phi chức năng. (Phần 2) báo cáo phân quyền camera/micro cho nghiệm thu phi chức năng và bàn giao. (Phần 3) bảng nghiệm thu phi chức năng cho chuẩn bị demo và bàn giao.
**Không thuộc task này:** (Phần 1) tự thêm ngưỡng cho camera/micro, nâng gói dịch vụ. (Phần 2) ghi hình, lưu nội dung, kiểm thử kết nối lại cả phòng (đã ở T-50). (Phần 3) dọn chat Khách (giai đoạn sau), tính năng của giai đoạn sau.

---

### T-62 — Chuẩn bị demo, sửa lỗi cuối, kiểm lại và bàn giao bằng chứng
**Thuộc Epic:** không thuộc Epic nào (task chung của dự án) · **Thành phần:** QA · **Sprint:** 4 (15/10–17/10)
**Phải xong trước:** *Cấu hình Supabase gửi mã OTP đăng ký (T-03)*: nhận được cấu hình đăng ký bằng mã OTP (chưa có tài khoản demo). *Dựng môi trường demo: chạy cục bộ trước, Render làm dự phòng (T-16)*: nhận được hướng dẫn chạy demo cục bộ (và các bước dự phòng trên Render). *Thử nghiệm OTP thật; chặn người chưa hoàn tất đăng ký và chặn đổi email (T-23)*: nhận được số liệu thư, hạn mức để lên lịch gửi thư. *Nghiệm thu từng tiêu chí giai đoạn 1 và chạy kịch bản demo D1–D10 (T-60)*: nhận được bảng đối chiếu và lỗi có bước tái hiện. *Nghiệm thu phi chức năng: bài tải, quyền camera/micro, trình duyệt, bảo mật (T-61)*: nhận được kết quả đã hoàn thành của task này.

**Mục tiêu**
Task này gồm **2 phần** làm liền nhau vì cùng một mục đích và nên do cùng một người hoặc một cặp làm.

*Phần 1 — Chuẩn bị demo: tài khoản dựng sẵn, dữ liệu, kịch bản và kiểm tra hạn mức:*
Chuẩn bị **buổi demo nộp bài** trên môi trường và hạn mức thật: người trình bày có sẵn tài khoản, dữ liệu, thứ tự thao tác và cách xử lý khi gặp sự cố.

*Phần 2 — Sửa lỗi cuối, kiểm lại toàn bộ và bàn giao bằng chứng:*
**Kiểm lại và đối chiếu bằng chứng trên bản build cuối** trước khi bàn giao giai đoạn 1. Task này **không phải nơi duy nhất mở việc sửa lỗi**: lỗi đã được giao ngay cho từng phần từ các lượt kiểm trước; ở đây xác minh các bản sửa và chốt gói bàn giao.

**Việc cần làm (làm lần lượt)**
*Phần 1 — Chuẩn bị demo: tài khoản dựng sẵn, dữ liệu, kịch bản và kiểm tra hạn mức:*
1. **Tự tạo tài khoản demo B, C, D** trên môi trường demo theo quy trình đã cấu hình; kiểm hồ sơ đã hoàn tất và đăng nhập được; **bảo vệ thông tin đăng nhập**. (Tài khoản kiểm thử và bài tải do các task đó tự tạo, không chờ task này.)
2. **Kiểm hạn mức** thư, dịch vụ camera/micro, thiết bị trước buổi diễn tập. A dùng **email nhóm để đăng ký OTP thật** theo D1; **không** đổi dịch vụ gửi thư hay giả lập thư để che thiếu hạn mức.
3. **Diễn tập D1 đến D10** trên bản build đã ghi rõ (D8 rời ghế, D9 ván online mới, D10 vào lại ván máy); ghi cách đặt lại dữ liệu và xử lý sự cố.
4. Khi gặp lỗi: gửi ngay ca tái hiện, bằng chứng, bản build cho phần chịu trách nhiệm; **sửa ngay không chờ phần 2 của task này**; diễn tập lại phần bị ảnh hưởng sau khi sửa, lưu kết quả trước và sau.
5. **Bàn giao tài liệu hướng dẫn demo** (runbook) và tình trạng sẵn sàng **thật**; còn lỗi hay thiếu hạn mức thì báo PO, **không ghi "demo sẵn sàng" giả**.

*Phần 2 — Sửa lỗi cuối, kiểm lại toàn bộ và bàn giao bằng chứng:*
1. Nhận báo cáo ở T-60, T-61 (có thể còn không đạt) và các lỗi đã giao; **xác minh các bản sửa**.
2. **Kiểm lại những luồng bị ảnh hưởng**, cập nhật bảng tiêu chí và tiêu chuẩn trên bản build cuối. Lỗi mới giao lại để sửa ngay rồi kiểm lại; **không tự đổi phạm vi hay hạ ngưỡng**.
3. **Đóng gói bàn giao**: mã nguồn, bản build, môi trường, tài liệu hướng dẫn demo, bằng chứng. Chỉ kết luận giai đoạn 1 đạt khi các điều kiện chất lượng đã duyệt đều đạt; chưa đạt thì **báo PO phần còn bị chặn**.

**Các trường hợp lỗi và kết quả mong đợi**
*Phần 1 — Chuẩn bị demo: tài khoản dựng sẵn, dữ liệu, kịch bản và kiểm tra hạn mức:*
| Tình huống | Kết quả mong đợi |
|---|---|
| Đăng nhập tài khoản, kiểm địa chỉ, thiết bị, hạn mức | Đủ điều kiện; không lộ thông tin đăng nhập |
| A đăng ký bằng email nhóm | Nhận thư thật, hoàn tất đúng cấu hình; không dùng giả lập |
| Diễn tập D8 rời ghế; D9 ván mới; D10 vào lại | Đúng chỗ chơi và đúng ván; không dùng kết quả ván cũ |
| Mất mạng hoặc hết hạn mức khi diễn tập | Báo lỗi thật; không bịa kết quả đạt |
| Chuẩn bị B, C, D trước buổi diễn tập | Dùng được, không ở trạng thái đăng ký dở; bí mật không có trong tài liệu công khai |
| Diễn tập gặp lỗi; giao phần phụ trách; nhận bản sửa và chạy lại | Lỗi xử lý trước phần 2 của task này; giữ kết quả trước và sau; chưa sửa thì demo chưa đạt |

*Phần 2 — Sửa lỗi cuối, kiểm lại toàn bộ và bàn giao bằng chứng:*
| Tình huống | Kết quả mong đợi |
|---|---|
| Chạy lại các bước tái hiện trên bản sửa | Lỗi hết, có bằng chứng trước và sau |
| Chạy các luồng liên quan và mọi cửa cần nộp | Không lỗi mới, không bỏ ca để cho "xanh" |
| So danh sách tiêu chí với sản phẩm của bản build cuối | Không thiếu bằng chứng, không dùng build cũ |
| Mở gói bàn giao, làm theo hướng dẫn | Người khác tái hiện được; không có bí mật |

**Cách tự kiểm tra**
*Phần 1 — Chuẩn bị demo: tài khoản dựng sẵn, dữ liệu, kịch bản và kiểm tra hạn mức:*
Chuẩn bị: email thành viên nhóm, thiết bị và mạng thật.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Đăng nhập, kiểm địa chỉ, thiết bị, hạn mức | Đủ điều kiện |
| 2 | A đăng ký bằng email nhóm | Thư thật, hoàn tất |
| 3 | Diễn tập D8, D9, D10 | Đúng thứ tự, đúng ván |
| 4 | Gây mất mạng hoặc hết hạn mức giả định | Báo lỗi thật |
| 5 | Kiểm tài khoản B, C, D | Dùng được, không đăng ký dở |
| 6 | Gặp lỗi khi diễn tập; nhận bản sửa | Chạy lại đạt |

*Phần 2 — Sửa lỗi cuối, kiểm lại toàn bộ và bàn giao bằng chứng:*
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Chạy lại bước tái hiện từng lỗi đã sửa | Lỗi hết, có trước/sau |
| 2 | Chạy các luồng liên quan và toàn bộ cửa cần nộp | Không lỗi mới |
| 3 | So danh sách tiêu chí với bằng chứng trên build cuối | Đủ, không build cũ |
| 4 | Một người khác mở gói và làm theo hướng dẫn | Tái hiện được |

**Khi nào chuyển cho người kiểm thử:** (Phần 1) tài khoản, dữ liệu, địa chỉ, thiết bị, hạn mức đã kiểm; diễn tập đủ D1–D10 đạt trên build đã ghi. (Phần 2) cả 4 dòng đạt.
**Khi nào task xong:** (Phần 1) người kiểm thử và người xem lại đồng ý; tài liệu hướng dẫn demo người khác làm theo được và không lộ bí mật. Còn lỗi chức năng hoặc điều kiện demo thiếu thì **chưa đạt**; báo cáo lỗi không đồng nghĩa demo sẵn sàng.
**Bàn giao cho task sau:** (Phần 1) tài liệu và tình trạng demo cho bàn giao.
**Không thuộc task này:** (Phần 1) đổi dịch vụ gửi thư hay giả lập OTP, công cụ demo của giai đoạn sau. (Phần 2) thêm tính năng, cắt phạm vi, nhận tính năng của giai đoạn sau vào nghiệm thu.
**Khi nào task xong (cửa cuối giai đoạn 1):** (Phần 2) D1 đến D10, mọi tiêu chí của giai đoạn 1, các yêu cầu phi chức năng đã duyệt và các cửa chất lượng bắt buộc đều đạt trên bản build cuối; không còn lỗi mức Cao hoặc Nghiêm trọng; kiểm thử đơn vị, tích hợp xanh; bàn giao đạt. **Báo cáo ở T-60, T-61 xong không đồng nghĩa cửa này đạt.** Còn lỗi hoặc thiếu bằng chứng thì cửa chưa đạt, sửa và kiểm lại, **không cắt phạm vi hay tự cho phép phát hành**.
**Bàn giao:** (Phần 2) gói bàn giao cho PO để nộp.
