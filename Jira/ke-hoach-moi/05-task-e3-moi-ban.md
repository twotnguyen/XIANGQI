# Task của Epic "Mời bạn vào phòng chơi" (5 task)

**Ngày:** 2026-10-04 · **Trạng thái:** đề xuất, chờ PO duyệt · Chưa tạo gì trên Jira · Viết theo `00-chuan-description.md` và mẫu `00b`.

Mã task `T-01` đến `T-62` đánh theo **thứ tự làm** (số nhỏ làm trước, mỗi task chỉ cần các task có số nhỏ hơn). Một số task gộp nhiều việc nhỏ cùng mục đích thành một task. Ngày Sprint: 1 = 04/10–07/10, 2 = 08/10–10/10, 3 = 11/10–14/10, 4 = 15/10–17/10.

---

### T-33 — Giao diện: bạn bè (tìm, lời mời, danh sách, mời vào phòng)
**Thuộc Epic:** Mời bạn vào phòng chơi · **Thành phần:** Frontend, Room & Social · **Sprint:** 3 (11/10–14/10)
**Phải xong trước:** *Soạn "hợp đồng chung" giữa trình duyệt và máy chủ (T-02)*: nhận được kết quả đã hoàn thành của task này. *Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo) (T-08)*: nhận được kết quả đã hoàn thành của task này. *Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng (T-14)*: nhận được chỗ đặt chuông lời mời và điều hướng. *Giao diện: phòng chờ và màn từ chối vào phòng (T-15)*: nhận được phòng chờ và hộp thoại mời chia sẻ mã/đường dẫn để gắn danh sách "Mời bạn".
**Loại:** Task triển khai · **Nhãn:** `P1`, `US-FRIEND-01`, `US-FRIEND-02`, `US-FRIEND-03`, `US-FRIEND-04`, `US-FRIEND-05` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống · **Ước lượng (giờ):** nhóm điền khi họp Sprint · **Fix version:** v0.3-sprint-3

**Mục tiêu**
Dựng tìm kiếm, **chuông lời mời** và **danh sách bạn**. Việc **mời vào phòng** chỉ xuất hiện trong hộp thoại mời của phòng, đúng quy tắc. Dữ liệu giả; nối thật ở T-54.

**Việc cần làm (làm lần lượt)**
1. Dựng ô tìm người, chuông lời mời, trang Bạn bè (danh sách và nút huỷ kết bạn) với 5 trạng thái.
2. Đặt nút **Mời** trong **hộp thoại mời của phòng** (chỉ hiện ở đó). Lý do bận, ngoại tuyến, hoặc đạt giới hạn hiện bằng chú thích; **Nhắn tin** và **Thách đấu** mờ với chú thích "Sắp ra mắt".
3. Thông báo nhận lời mời có **đếm lùi 30 giây** theo thời gian máy chủ gửi về, tự tắt khi hết.
4. Chỉ báo "thành công" **sau khi** máy chủ xác nhận; mất xác nhận thì có thông báo và nút "Thử lại".
5. Ghép chuông vào khung đã có ở T-14 và danh sách mời vào hộp thoại ở T-15; **không dựng thêm trang hay hộp thoại thứ hai**.

**Thành phần màn hình phải có (theo danh mục màn hình, chỉ phần giai đoạn 1)**
*Màn hình Bạn bè* (`SCR-FRIENDS`)
- Ô tìm theo tên đăng nhập (phần đầu, không phân biệt hoa thường) và nút **Kết bạn**; thẻ kết quả có ảnh đại diện, tên hiển thị, @tên.
- Thẻ **Danh sách bạn bè**: ảnh, tên, @tên, trạng thái 🟢 Online / 🟠 Đang đấu / ⚫ Ngoại tuyến; nút **Huỷ kết bạn**; nút **Nhắn tin** và **Thách đấu** mờ "Sắp ra mắt"; **không có nút mời vào phòng** ở trang này.
- Thẻ **Lời mời đang chờ**: nút **Chấp nhận** và **Từ chối**; chuông lời mời ở thanh điều hướng.
- Nút Kết bạn mờ kèm chú thích khi đạt giới hạn 200 bạn hoặc 50 lời mời chờ.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**
| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
|---|---|---|---|---|---|
| Màn hình Bạn bè | Bạn/lời mời/trạng thái đúng | Tải hoặc tìm kiếm | Chưa có bạn/kết quả: hướng dẫn tìm username | Tải/gửi/nhận lỗi; giữ nguyên thao tác đã làm; kiểm lại với máy chủ rồi mới gửi lại | Đã đủ số bạn tối đa, bị từ chối hai lần; bạn không Online |

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Mở trang Bạn bè và hộp thoại mời phòng | Chỉ hộp thoại phòng có nút Mời |
| Bạn Online / Đang đấu / Ngoại tuyến; đạt giới hạn | Nút và chú thích đúng |
| Chấp nhận / từ chối / hết 30 giây | Đúng hành động; hết hạn tự tắt |
| Tải hoặc gửi lỗi, mất xác nhận | Không hiện bạn mới giả; có thông báo và "Thử lại" |
| Mở chuông trên khung Sảnh, mời từ phòng chờ, mở trang Bạn bè | Một chuông, một hộp thoại, đúng vị trí; trang Bạn bè không có nút mời vào phòng |
| Bạn còn ghế đang chờ / đang chơi / đã kết thúc, hoặc chơi với máy | Nhãn "Đang đấu"; nút Mời mờ có chú thích; không thành "Online rảnh" chỉ vì ván đã kết thúc |

**Cách tự kiểm tra**
Chuẩn bị: dữ liệu giả cho ba trạng thái, lỗi, giới hạn.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Mở trang Bạn bè và hộp thoại mời | Chỉ hộp thoại phòng có nút Mời |
| 2 | Xem ba trạng thái và đạt giới hạn | Nút, chú thích đúng |
| 3 | Chấp nhận, từ chối, chờ hết 30 giây | Đúng, tự tắt |
| 4 | Giả lập lỗi và mất xác nhận | Có "Thử lại", không bạn giả |
| 5 | Mở chuông, mời từ phòng chờ, mở trang Bạn bè | Đúng vị trí, không trùng |
| 6 | Bạn đang giữ chỗ | Nhãn Đang đấu, nút mờ có chú thích |
| 7 | Đối chiếu từng gạch đầu dòng ở phần "Thành phần màn hình phải có" với màn hình thật, và đủ 5 trạng thái ở bảng nghiệm thu | Không thiếu, không thừa; chức năng chưa làm mờ hoặc ẩn đúng quy tắc |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt, đủ 5 trạng thái, kèm ảnh.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Toàn luồng thật nghiệm thu ở T-54.
**Bàn giao cho task sau:** giao diện bạn bè cho tích hợp.
**Không thuộc task này:** gọi máy chủ thật, điểm Elo, nhắn tin 1-1, thách đấu.
**Phục vụ (nguồn):** Story 10, 11, 12; tiêu chí AC-FRIEND-01-01, AC-FRIEND-01-02, AC-FRIEND-02-01, AC-FRIEND-03-01, AC-FRIEND-03-02, AC-FRIEND-04-01, AC-FRIEND-04-02, AC-FRIEND-04-03, AC-FRIEND-05-01. Thuộc Epic: Mời bạn vào phòng chơi.
**Kết quả (đầu ra):** Giao diện bạn bè: tìm, lời mời, chuông, danh sách, nút Nhắn tin/Thách đấu mờ, nút Mời trong hộp thoại phòng, thông báo đếm lùi 30 giây; đủ 5 trạng thái, dữ liệu giả.
**Bằng chứng nộp:** Ảnh chụp trạng thái; kiểm bàn phím. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Chưa nối máy chủ.
**Liên kết Jira (khi được phép tạo):** bị chặn bởi (is blocked by) T-02, T-08, T-14, T-15; liên quan tới (relates to) Story 10, Story 11, Story 12; Epic: Mời bạn vào phòng chơi.

---

### T-34 — Máy chủ: kết bạn, lời mời và danh sách bạn có trạng thái
**Thuộc Epic:** Mời bạn vào phòng chơi · **Thành phần:** Room & Social · **Sprint:** 3 (11/10–14/10)
**Phải xong trước:** *Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập (T-04)*: nhận được bảng hồ sơ, quan hệ bạn bè, đếm số lần từ chối và ràng buộc theo cặp. *Dựng khung máy chủ: nhận kết nối có xác thực và chuyển lệnh (T-07)*: nhận được cách xác định người gửi và chuyển lệnh. *Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ (T-10)*: nhận được cách nhận ra yêu cầu gửi lại. *Máy chủ: trạng thái phòng, mỗi người một chỗ chơi và tạo phòng (T-17)*: nhận được sổ chỗ chơi (ghế phòng, ván với máy) theo từng người.
**Loại:** Task triển khai · **Nhãn:** `P1`, `US-FRIEND-01`, `US-FRIEND-02`, `US-FRIEND-03`, `US-FRIEND-05` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống · **Ước lượng (giờ):** nhóm điền khi họp Sprint · **Fix version:** v0.3-sprint-3

**Mục tiêu**
Làm trọn **vòng đời kết bạn** ở máy chủ: tìm người, gửi lời mời, thu hồi, chấp nhận, từ chối, hết hạn, với giới hạn đúng ở **cả hai tài khoản**, để quan hệ hai chiều luôn nhất quán.

Trả **danh sách bạn** kèm trạng thái đúng với dữ liệu máy chủ, để người dùng biết bạn nào đang rảnh để mời. Hỗ trợ **huỷ kết bạn** (hai bên không còn là bạn).

**Việc cần làm (làm lần lượt)**
1. **Tìm người:** theo phần đầu tên đăng nhập, không phân biệt hoa thường; chỉ trả thông tin công khai; không tự gửi lời mời.
2. Với mỗi lệnh thay đổi: xác định người gửi, **tra biên lai** (nếu đã xử lý thì trả kết quả cũ), rồi mới kiểm quyền, giới hạn, trạng thái. **Chỉ người nhận được trả lời; chỉ người gửi được thu hồi.**
3. Xử lý **lần lượt theo từng cặp người**; ghi quan hệ, số lần từ chối và biên lai **cùng lúc**; chỉ báo thành công sau khi ghi xong.
4. Kiểm giới hạn **200 bạn và 50 lời mời chờ** ở cả hai đầu khi gửi và khi chấp nhận. Gửi chéo cùng lúc thì chỉ giữ một lời mời chờ.
5. **Từ chối**: tăng bộ đếm đúng chiều **một lần** (gửi lại yêu cầu từ chối không tăng thêm). **Thu hồi và hết hạn 30 ngày** không tăng và không xoá lịch sử từ chối. Dọn các lời mời hết hạn định kỳ.
6. Trả danh sách bạn **của chính người hỏi**, chỉ các trường được phép (avatar, tên hiển thị, tên đăng nhập, trạng thái).
7. Xác định trạng thái từ dữ liệu máy chủ (không tin màu hay trạng thái do trình duyệt báo): **Đang đấu** nếu bạn đang có kết nối **và** còn chỗ chơi (ghế phòng ở trạng thái đang chờ, đang chơi **hoặc đã kết thúc mà chưa rời**, hoặc đang chơi với máy); **Online** chỉ khi có kết nối và **không** giữ chỗ chơi nào; còn lại **Ngoại tuyến**.
8. Mất kết nối **không** biến thành "Online rảnh", dù chỗ vẫn đang được giữ.
9. **Huỷ kết bạn** ở một bước: cả hai chiều cùng mất; báo cập nhật cho hai bên.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Tìm bằng phần đầu tên, khác hoa thường | Ra thẻ đúng tên đăng nhập, không có email |
| Gửi, thu hồi, chấp nhận, từ chối, hết 30 ngày | Đúng trạng thái; từ chối không báo người gửi |
| 199 và 200 bạn; 49 và 50 lời mời chờ; gửi hoặc chấp nhận cùng lúc | Không vượt giới hạn ở cả hai đầu |
| Gửi chéo; từ chối hai lần rồi dọn lời mời hết hạn | Một lời mời chờ, không tự thành bạn; vẫn chặn đúng chiều |
| Người thứ ba hoặc chính người gửi tự chấp nhận/từ chối thay người nhận | Từ chối; không thành bạn; không tăng bộ đếm từ chối |
| Người khác thu hồi lời mời của người gửi | Từ chối; người gửi vẫn thu hồi được lời mời của mình |
| Từ chối, mất phản hồi, gửi lại (cũng hai bản cùng lúc) | Trả kết quả cũ; bộ đếm chỉ tăng một lần; người gửi không bị báo |
| Lỗi trước khi ghi xong; sau khi ghi xong mất phản hồi rồi gửi lại | Không có tác dụng hay biên lai thành công; gửi lại sau khi ghi thì trả kết quả cũ, chỉ đếm một lần |
| Bạn đăng nhập, bắt đầu ván, rời hoặc ngắt kết nối | Danh sách phản ánh đúng trạng thái |
| Huỷ kết bạn khi hai bên đang mở danh sách | Hai bên không còn là bạn |
| Kẻ gian sửa mã người dùng trong yêu cầu để xem danh sách bạn của người khác | Không đọc được; máy chủ chỉ trả danh sách của người đang đăng nhập |
| Truy vấn lỗi | Báo lỗi, không trả danh sách rỗng giả |
| Bạn có kết nối và ngồi ghế đang chờ / đang chơi / đã kết thúc, hoặc chơi với máy | Cả bốn đều là Đang đấu, không nhận mời; ván kết thúc mà còn ghế vẫn không phải Online rảnh |
| Giải phóng chỗ (rời ghế, rời ván máy) khi còn kết nối; rồi ngắt kết nối | Rời chỗ → Online rảnh; ngắt kết nối → không còn nhận mời như người Online |

**Cách tự kiểm tra**
Chuẩn bị: cơ sở dữ liệu thử, đồng hồ điều khiển được, nhiều tài khoản thử.

| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Tìm theo phần đầu tên, khác hoa thường | Đúng thẻ, không email |
| 2 | Chạy cả vòng đời: gửi, thu hồi, chấp nhận, từ chối, hết 30 ngày | Đúng trạng thái |
| 3 | Kiểm các biên 199/200 bạn, 49/50 lời mời; gửi cùng lúc | Không vượt giới hạn |
| 4 | Gửi chéo; từ chối hai lần | Một lời mời chờ; chặn đúng chiều |
| 5 | Người không liên quan dùng công cụ trả lời, hoặc thu hồi lời mời của người khác | Máy chủ từ chối, lời mời không đổi |
| 6 | Từ chối rồi mất phản hồi, gửi lại | Một lần đếm |
| 7 | Gây lỗi trước và sau khi ghi | Đúng như bảng trên |
| 8 | Cho bạn đăng nhập, vào ván, rời, ngắt | Danh sách đúng từng lúc |
| 9 | Huỷ kết bạn khi hai bên đang mở danh sách | Cả hai mất bạn |
| 10 | Dùng công cụ xin danh sách bạn của người khác | Máy chủ từ chối, không trả danh sách |
| 11 | Làm truy vấn lỗi | Báo lỗi |
| 12 | Dùng dữ liệu mẫu bốn loại chỗ giữ | Cả bốn: Đang đấu, không nhận mời |
| 13 | Giải phóng chỗ rồi ngắt kết nối | Online rảnh; rồi không nhận mời |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý. Không cần giao diện để đạt.
**Bàn giao cho task sau:** vòng đời bạn bè cho danh sách bạn, mời vào phòng, giao diện, tích hợp; danh sách bạn và trạng thái cho mời vào phòng, giao diện bạn bè, tích hợp.
**Không thuộc task này:** nhắn tin 1-1; thách đấu; điểm Elo; khách; lịch sử đấu của bạn; giao diện.
**Phục vụ (nguồn):** Story 10, 11; tiêu chí AC-FRIEND-01-01, AC-FRIEND-01-02, AC-FRIEND-02-01, AC-FRIEND-02-02, AC-FRIEND-03-01, AC-FRIEND-03-03, AC-FRIEND-05-01, AC-FRIEND-05-02. Thuộc Epic: Mời bạn vào phòng chơi.
**Kết quả (đầu ra):** Vòng đời kết bạn (tìm, mời, thu hồi, chấp nhận, từ chối, hết hạn), giới hạn 200 bạn/50 lời mời, danh sách bạn có trạng thái, huỷ kết bạn.
**Bằng chứng nộp:** Kết quả thử 8 ca của bảng; thử đồng thời hai đầu. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Trạng thái "đang đấu" cần sổ chỗ chơi (task phòng).
**Liên kết Jira (khi được phép tạo):** bị chặn bởi (is blocked by) T-04, T-07, T-10, T-17; liên quan tới (relates to) Story 10, Story 11; Epic: Mời bạn vào phòng chơi.

---

### T-47 — Nối web với máy chủ: bấm đường dẫn mời, đăng nhập rồi vào đúng phòng
**Thuộc Epic:** Mời bạn vào phòng chơi · **Thành phần:** Frontend, Room & Social · **Sprint:** 3 (11/10–14/10)
**Phải xong trước:** *Giao diện: phòng chờ và màn từ chối vào phòng (T-15)*: nhận được kết quả đã hoàn thành của task này. *Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh (T-21)*: nhận được kết quả đã hoàn thành của task này. *Nối web với máy chủ: đăng ký, đăng nhập, hồ sơ (T-27)*: có tài khoản và phiên thật. *Nối web với máy chủ: đi nước, đồng bộ thế cờ giữa hai trình duyệt (T-30)*: nhận được chức năng phòng và ván để đưa người dùng tới. *Máy chủ: kiểu phòng (công khai, chỉ mã, khoá) và danh sách phòng ở Sảnh (T-36)*: nhận được kết quả đã hoàn thành của task này. *Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng (T-38)*: nhận được kết quả đã hoàn thành của task này.
**Loại:** Task triển khai · **Nhãn:** `P1`, `integration`, `US-AUTH-04`, `US-AUTH-06` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống · **Ước lượng (giờ):** nhóm điền khi họp Sprint · **Fix version:** v0.3-sprint-3

**Mục tiêu**
Người dùng bấm đường dẫn mời nhưng **chưa đăng nhập** thì sau khi đăng nhập hoặc đăng ký xong phải **vào đúng phòng đó**, không rơi về trang chủ. Nếu đang có ván dở thì đưa vào lại ván.

**Việc cần làm (làm lần lượt)**
1. Khi mở đường dẫn phòng mà chưa đăng nhập, **nhớ phòng đó** rồi chuyển sang đăng nhập.
2. Sau khi đăng nhập hoặc đăng ký xong, **vào đúng phòng** đã nhớ; xoá phần đã nhớ.
3. Nếu người dùng đang có ván dở (còn trong thời gian chờ nối lại), đưa **vào lại ván** thay vì phòng mới.
4. Nếu phòng không còn, đã đầy hoặc bị khoá, báo lý do rõ ràng và đưa về sảnh.
5. Chỉ nhớ **phòng của hệ thống**, không chuyển tới địa chỉ lạ (chống bị dẫn sang trang khác).

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Mở đường dẫn phòng khi chưa đăng nhập | Đăng nhập xong vào đúng phòng |
| Đăng ký mới từ đường dẫn mời | Hoàn tất xong vào đúng phòng |
| Người được mời đang có một ván chưa xong | Được đưa vào lại ván đó, không vào phòng mời |
| Phòng đã đóng hoặc đầy | Báo lý do, về sảnh |
| Đường dẫn "quay lại" trỏ tới một trang ngoài ứng dụng (kẻ gian dùng để dẫn người dùng sang trang giả) | Bỏ qua, đưa về Sảnh |

**Cách tự kiểm tra**
Chuẩn bị: hai tài khoản thử, một phòng đang mở.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Mở đường dẫn phòng khi chưa đăng nhập, đăng nhập | Vào đúng phòng |
| 2 | Làm như trên nhưng bằng đăng ký mới | Vào đúng phòng |
| 3 | Có ván dở rồi mở đường dẫn phòng khác | Vào lại ván dở |
| 4 | Phòng đã đóng hoặc đầy | Thông báo rõ, về sảnh |
| 5 | Địa chỉ trả về là trang ngoài hệ thống | Không chuyển đi |

**Khi nào chuyển cho người kiểm thử:** cả 5 dòng đạt.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý.
**Bàn giao cho task sau:** luồng từ lời mời tới phòng hoạt động trọn vẹn.
**Không thuộc task này:** tạo phòng, vào phòng (có ở Epic Tạo phòng chơi), mời qua bạn bè.
**Phục vụ (nguồn):** Story 2, 9; tiêu chí AC-AUTH-04-01, AC-AUTH-06-01, AC-AUTH-06-02. Thuộc Epic: Mời bạn vào phòng chơi.
**Kết quả (đầu ra):** Bấm đường dẫn mời khi chưa đăng nhập, đăng nhập hoặc đăng ký xong thì vào đúng phòng; vào lại ván dở; chặn chuyển hướng ra ngoài.
**Bằng chứng nộp:** Video và báo cáo Playwright. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Phụ thuộc phòng thật và quyền vào phòng.
**Liên kết Jira (khi được phép tạo):** bị chặn bởi (is blocked by) T-15, T-21, T-27, T-30, T-36, T-38; liên quan tới (relates to) Story 2, Story 9; Epic: Mời bạn vào phòng chơi.

---

### T-52 — Máy chủ: mời bạn đang online vào phòng
**Thuộc Epic:** Mời bạn vào phòng chơi · **Thành phần:** Room & Social · **Sprint:** 4 (15/10–17/10)
**Phải xong trước:** *Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh (T-21)*: nhận được chức năng vào phòng và xếp ghế/người xem. *Máy chủ: kết bạn, lời mời và danh sách bạn có trạng thái (T-34)*: nhận được quan hệ bạn bè và trạng thái đáng tin. *Máy chủ: kiểu phòng (công khai, chỉ mã, khoá) và danh sách phòng ở Sảnh (T-36)*: nhận được quy tắc công khai/chỉ mã/khoá và mã, đường dẫn hiện hành.
**Loại:** Task triển khai · **Nhãn:** `P1`, `US-FRIEND-04` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống · **Ước lượng (giờ):** nhóm điền khi họp Sprint · **Fix version:** v1.0-sprint-4

**Mục tiêu**
Cho người **đang ngồi ghế** mời **bạn đang online** vào phòng hiện tại. Lời mời chỉ là **thông báo có hạn 30 giây**: **không giữ chỗ** và **không cho quyền vào phòng vượt quy tắc**.

**Việc cần làm (làm lần lượt)**
1. Kiểm: người gửi **đang ngồi ghế**; người nhận là **bạn** và **Online rảnh** (đang giữ ghế hoặc chơi với máy là "Đang đấu", không được mời).
2. Gửi thông báo 30 giây; **không đặt chỗ** cho người nhận.
3. Khi người nhận bấm Tham gia: **đọc lại** kiểu phòng và mã/đường dẫn hiện hành, rồi dùng chính chức năng **vào phòng** (T-21). Kiểm lại: còn là bạn không, có đang bận không, phòng có khoá, bị đuổi, hết chỗ không. **Không** dựa vào trạng thái đã nhớ lúc gửi.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Người ngồi ghế mời bạn Online, bạn nhận | Vào ghế, hoặc vào xem nếu hợp lệ |
| Người xem mời, hoặc người nhận bận/ngoại tuyến | Bị chặn, không gửi |
| Chờ hết hạn, hoặc đường dẫn bị thu hồi, phòng bị khoá trước khi tham gia | Không vào được trái quyền |
| Hai người chấp nhận chỗ cuối | Không vượt giới hạn; phản hồi đúng tình trạng |
| Gửi mời rồi phòng bị khoá, hoặc mở khoá tạo mã mới trước khi nhận | Kiểm lại quyền và mã hiện hành; lời mời không phải vé giữ chỗ |
| Người nhận đang ngồi ghế (đang chờ/đang chơi/đã kết thúc) hoặc đang chơi với máy | Máy chủ chặn gửi ở cả bốn trường hợp, không chỉ khoá nút |
| Gửi lúc bạn rảnh, rồi bạn chiếm chỗ khác trước khi nhận | Kiểm lại, không vào phòng thứ hai trái luật |

**Cách tự kiểm tra**
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Người ngồi ghế mời bạn Online, bạn nhận | Vào đúng chỗ |
| 2 | Người xem bấm mời bạn vào; hoặc mời người đang bận hoặc ngoại tuyến | Không gửi được lời mời; có báo lý do |
| 3 | Chờ hết hạn; thu hồi đường dẫn; khoá phòng rồi nhận | Không vào |
| 4 | Hai người chấp nhận chỗ cuối | Không vượt giới hạn |
| 5 | Mời rồi khoá hoặc mở khoá tạo mã mới | Kiểm lại quyền |
| 6 | Mời người đang giữ chỗ (4 loại) | Máy chủ chặn |
| 7 | Mời lúc rảnh rồi người nhận chiếm chỗ khác | Kiểm lại, chặn |

**Khi nào chuyển cho người kiểm thử:** cả 7 dòng đạt; hạn do máy chủ quyết định.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Không giữ chỗ, không tạo phòng khác.
**Bàn giao cho task sau:** lời mời vào phòng cho giao diện bạn bè và tích hợp.
**Không thuộc task này:** nút mời ở trang Bạn bè, thách đấu, giao diện.
**Phục vụ (nguồn):** Story 12; tiêu chí AC-FRIEND-04-01, AC-FRIEND-04-02, AC-FRIEND-04-03, AC-FRIEND-04-04. Thuộc Epic: Mời bạn vào phòng chơi.
**Kết quả (đầu ra):** Lời mời bạn online vào phòng (30 giây, không giữ chỗ), kiểm lại mọi điều kiện lúc bấm Tham gia.
**Bằng chứng nộp:** Kết quả thử 7 ca; thử mời người đang giữ chỗ. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Lời mời không phải vé giữ chỗ.
**Liên kết Jira (khi được phép tạo):** bị chặn bởi (is blocked by) T-21, T-34, T-36; liên quan tới (relates to) Story 12; Epic: Mời bạn vào phòng chơi.

---

### T-54 — Nối web với máy chủ: bạn bè
**Thuộc Epic:** Mời bạn vào phòng chơi · **Thành phần:** Frontend, Room & Social · **Sprint:** 4 (15/10–17/10)
**Phải xong trước:** *Nối web với máy chủ: tạo phòng, vào phòng, ghế, Sẵn sàng, bắt đầu ván (T-29)*: nhận được tạo, vào phòng, bắt đầu ván thật. *Giao diện: bạn bè (tìm, lời mời, danh sách, mời vào phòng) (T-33)*: nhận được màn hình đã dựng. *Máy chủ: kết bạn, lời mời và danh sách bạn có trạng thái (T-34)*: nhận được kết quả đã hoàn thành của task này. *Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời (T-40)*: nhận được đổi chỗ, khoá, đuổi, rời phòng thật. *Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ (T-43)*: nhận được ván với máy chạy thật cùng việc báo chiếm và giải phóng chỗ chơi. *Máy chủ: mời bạn đang online vào phòng (T-52)*: nhận được ba chức năng ở máy chủ.
**Loại:** Task triển khai · **Nhãn:** `P1`, `integration`, `US-FRIEND-02`, `US-FRIEND-03`, `US-FRIEND-04`, `US-FRIEND-05` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống · **Ước lượng (giờ):** nhóm điền khi họp Sprint · **Fix version:** v1.0-sprint-4

**Mục tiêu**
Nối toàn bộ luồng bạn bè với máy chủ và phòng thật, từ **kết bạn tới mời vào phòng**. Bạn được mời phải **vào đúng vai theo trạng thái lúc bấm Tham gia**. Phần "đang chơi với máy thì Đang đấu" kiểm bằng ván với máy **thật**, không bằng dữ liệu giả.

**Việc cần làm (làm lần lượt)**
1. Nối tìm kiếm, chuông, danh sách, chấp nhận, từ chối, thu hồi với máy chủ; kiểm cả hai đầu quan hệ và giới hạn.
2. Mời từ hộp thoại phòng; thử đổi quyền, chỗ, khoá phòng **khi thông báo đang mở** rồi bấm Tham gia: phải kiểm tra lại.
3. Đối chiếu: người còn ghế (đang chờ / đang chơi / đã kết thúc mà chưa rời) là **Đang đấu**. Trạng thái "đã kết thúc" có thể nạp bằng dữ liệu thử; **không** tuyên bố đã kiểm trọn luồng kết thúc ván.
4. Bắt đầu ván với máy **thật** (T-43): bạn thành **Đang đấu**, không nhận mời; **rời ván máy** rồi còn kết nối → **Online rảnh** và mời được.
5. Kiểm lời mời bị gửi lại, giới hạn và quyền ở **máy chủ**, không chỉ ở trạng thái nút.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Tìm, kết bạn, mời bạn Online từ phòng, bạn nhận | Quan hệ hai chiều; vào đúng phòng và vai theo sức chứa |
| Quá 30 giây; huỷ bạn; khoá hoặc thu hồi đường dẫn trước khi nhận | Không vào trái điều kiện; giao diện báo đúng lỗi thật |
| Vượt 200 bạn hoặc 50 lời mời chờ; gửi chéo | Máy chủ chặn ở cả hai đầu; chỉ một lời mời chờ, không tự thành bạn |
| Bạn còn ghế (đang chờ, đang chơi thật; đã kết thúc bằng dữ liệu thử) | Đang đấu; nút và máy chủ cùng chặn mời; rời ghế mới rảnh |
| Bạn vào ván với máy thật; thử mời; rời ván máy khi còn kết nối; thử mời lại | Lúc đang chơi: Đang đấu, không nhận mời; sau khi rời: Online rảnh, mời được |
| Không gửi lệnh rời, rồi gửi lệnh rời đã xác nhận và gửi lại cùng mã | Không rời thì vẫn Đang đấu; rời chỉ một tác dụng, không giải phóng nhầm chỗ mới |
| Hai ghế đã đầy; mời vào chỗ xem; khi hết chỗ | Vào đúng vai hoặc bị từ chối; không vượt tối đa 5 người xem |

**Cách tự kiểm tra**
Chuẩn bị: nhiều tài khoản thử, trình duyệt, ván với máy chạy được.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Tìm, kết bạn, mời từ phòng rồi nhận | Quan hệ hai chiều, vào đúng phòng |
| 2 | Quá 30 giây; huỷ bạn; khoá/thu hồi đường dẫn | Không vào, báo đúng lỗi |
| 3 | Vượt giới hạn; gửi chéo | Chặn ở máy chủ |
| 4 | Bạn đang ngồi ghế | Đang đấu, không mời được |
| 5 | Bạn chơi với máy thật; mời; rời ván; mời lại | Đang đấu rồi Online rảnh |
| 6 | Gửi lệnh rời lặp lại | Một tác dụng |
| 7 | Phòng đầy, mời vào chỗ xem | Đúng vai hoặc từ chối |

**Khi nào chuyển cho người kiểm thử:** cả 7 dòng đạt với phòng thật và ván với máy thật; trạng thái bạn và vị trí khớp.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Không dùng dữ liệu giả thay cho thông báo của ván với máy. Hộp thoại ván với máy trên màn hình kiểm ở task tích hợp ván với máy (T-55).
**Bàn giao cho task sau:** luồng bạn bè chạy thật cho nghiệm thu và demo.
**Không thuộc task này:** thách đấu, nhắn tin 1-1, hiển thị Elo.
**Phục vụ (nguồn):** Story 10, 11, 12; tiêu chí AC-FRIEND-02-01, AC-FRIEND-03-03, AC-FRIEND-04-02, AC-FRIEND-04-03, AC-FRIEND-04-04, AC-FRIEND-05-02. Thuộc Epic: Mời bạn vào phòng chơi.
**Kết quả (đầu ra):** Toàn bộ luồng bạn bè và mời vào phòng chạy thật; trạng thái Đang đấu kiểm bằng ván với máy thật.
**Bằng chứng nộp:** Video; báo cáo; nhật ký đã che. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Phụ thuộc ván với máy thật (Epic Đánh với máy).
**Liên kết Jira (khi được phép tạo):** bị chặn bởi (is blocked by) T-29, T-33, T-34, T-40, T-43, T-52; liên quan tới (relates to) Story 10, Story 11, Story 12; Epic: Mời bạn vào phòng chơi.
