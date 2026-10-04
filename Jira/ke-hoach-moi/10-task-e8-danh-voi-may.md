# Task của Epic "Đánh với máy theo cấp độ" (5 task)

**Ngày:** 2026-10-04 · **Trạng thái:** đề xuất, chờ PO duyệt · Chưa tạo gì trên Jira · Viết theo `00-chuan-description.md` và mẫu `00b`.

Mã task `T-01` đến `T-62` đánh theo **thứ tự làm** (số nhỏ làm trước, mỗi task chỉ cần các task có số nhỏ hơn). Một số task gộp nhiều việc nhỏ cùng mục đích thành một task. Ngày Sprint: 1 = 04/10–07/10, 2 = 08/10–10/10, 3 = 11/10–14/10, 4 = 15/10–17/10.

---

### T-31 — Máy cờ: chương trình chạy riêng, ba cấp độ, thử nghiệm sơ bộ tốc độ
**Thuộc Epic:** Đánh với máy theo cấp độ · **Thành phần:** AI · **Sprint:** 3 (11/10–14/10)
**Phải xong trước:** *Luật cờ: nước hợp lệ, chiếu, chiếu hết, hết nước, lặp thế, 120 nửa nước (T-09)*: nhận được hàm liệt kê nước hợp lệ và nhận biết chiếu trên thế cờ chuẩn; nhận được luật hợp lệ và kết quả chiếu hết, lặp thế, 120 nửa nước.
**Loại:** Task triển khai · **Nhãn:** `P1`, `US-AI-02` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống · **Ước lượng (giờ):** nhóm điền khi họp Sprint · **Fix version:** v0.3-sprint-3

**Mục tiêu**
Trả lời: **một máy cờ đơn giản chạy ở tiến trình riêng có đạt thời gian suy nghĩ quy định cho ba cấp (Dễ, Trung bình, Khó) không?** Số đo sớm giúp biết có làm được cấp Khó hay không. Đây là đo sơ bộ, **chưa** thay phép đo đầy đủ về sau.

Làm chương trình **máy cờ** tự viết, chạy ở **tiến trình riêng**, nhận một thế cờ và cấp độ, trả về **nước tốt nhất trong thời gian cho phép**. Đây là phần thuật toán của máy; **không** phải tính năng gợi ý cho người chơi.

**Việc cần làm (làm lần lượt)**
1. Dựng một máy cờ thử **chạy ở tiến trình riêng**, tìm nước theo kiểu "nghĩ dần từng độ sâu" (negamax kèm cắt tỉa), dùng luật cơ bản đã có.
2. Đo ba cấp với **độ sâu mục tiêu 2, 4, 6** và **thời gian cho phép 300, 1000, 3000 mili giây**.
3. Dùng một bộ thế cờ có nguồn rõ ràng (đầu ván, giữa ván, tàn cuộc); ghi cấu hình máy đo.
4. Ghi: thời gian tìm, độ sâu hoàn tất, nước trả về; phân biệt thời gian **tính** với thời gian **chờ** do truyền tin giữa hai tiến trình.
5. Thử khi hết thời gian giữa chừng: máy phải trả **nước tốt nhất đã tìm được** ở độ sâu hoàn tất gần nhất.
6. Thử khi tiến trình bị tắt giữa lúc tìm: ghi lại kết quả.
7. Viết báo cáo: **đạt / không đạt / chưa kết luận** cho từng cấp; số đo thật; hạn chế còn lại.
8. Dựng chương trình riêng, nhận việc từ máy chủ (thế cờ, lịch sử, cấp độ, thời gian tối đa, **mã tác vụ**) và gửi lại **tiến độ** và **kết quả** có mã tác vụ.
9. Dùng **luật chung** của dự án để sinh và kiểm tra nước đi (không viết luật riêng).
10. Thuật toán: tìm kiếm **sâu dần**, cắt tỉa, sắp xếp nước, lượng giá thế cờ; giữ kết quả của **độ sâu đã hoàn tất**.
11. Ba cấp: độ sâu 2, 4, 6 với thời gian 300, 1.000, 3.000 ms; cấp Dễ và Trung bình có yếu tố ngẫu nhiên có kiểm soát; cấp Khó thêm bảng nhớ thế đã tính.
12. **Tìm kiếm tĩnh:** khi đang bị chiếu phải xét **mọi nước thoát**, không được "dừng lại lấy điểm tĩnh"; hết nước đi thì luôn trả **điểm thua**.
13. Gắn công cụ kiểm tra **từng nút** của phần tìm kiếm tĩnh và lưu vết cùng hạt giống ngẫu nhiên cho bài đo sau.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Máy trả nước | Nước **luôn hợp lệ**, không tự chiếu tướng mình |
| Hết thời gian giữa chừng | Trả nước ở độ sâu đã hoàn tất, ghi đúng độ sâu |
| Tiến trình bị tắt | Báo lỗi hoặc không đạt; không coi là thành công |
| Không đạt thời gian | Ghi số thật, **không hạ ngưỡng** |
| Tìm trên cùng bộ thế (cấp ngẫu nhiên dùng hạt giống cố định) | Nước hợp lệ; thời gian và độ sâu thực tế được ghi |
| Thế bị chiếu mà chỉ thoát được bằng nước không ăn quân | Chọn nước thoát, không đứng yên |
| Thế chiếu hết hoặc hết nước ở độ sâu tận cùng | Điểm thua, không dùng lượng giá thường |
| Huỷ việc đang tìm rồi nhận tiến độ hoặc kết quả cũ | Mã tác vụ đủ để máy chủ bỏ kết quả cũ |
| Kiểm từng nút tìm kiếm tĩnh trên bộ thế bị chiếu | Không nút đang chiếu dùng điểm tĩnh làm cận dưới; xét cả nước thoát không ăn; hết nước trả thua |

**Cách tự kiểm tra**
Chuẩn bị: bộ thế mẫu và hạt giống cố định.

| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Chạy cùng bộ thế cho ba cấp | Có số đo thời gian và độ sâu thật cho từng cấp |
| 2 | Kiểm tra mọi nước trả về bằng hàm luật cờ | Không có nước sai luật |
| 3 | Buộc hết thời gian | Nhận nước của độ sâu hoàn tất |
| 4 | Tắt tiến trình lúc đang tìm | Có kết quả lỗi, không treo |
| 5 | Chạy ba cấp trên cùng bộ thế | Nước hợp lệ; thời gian, độ sâu được ghi thật |
| 6 | Thế bị chiếu chỉ thoát bằng nước không ăn | Chọn nước thoát |
| 7 | Thế chiếu hết, hết nước ở độ sâu cuối | Trả điểm thua |
| 8 | Huỷ việc rồi nhận kết quả cũ | Mã tác vụ phân biệt được |
| 9 | Chạy công cụ kiểm từng nút trên bộ thế bị chiếu | Không nút vi phạm |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt; báo cáo đủ số đo và cách làm lại; ghi số đo ban đầu.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý. Báo cáo hoàn tất, kể cả khi cấp Khó chưa đạt. **Chưa tính** phép đo đầy đủ và độ ổn định (làm ở task đo máy cờ cuối). **Kết luận máy đạt tiêu chuẩn chất lượng (GATE-AI) chỉ có sau bài đo đầy đủ ở T-56**. Ở đây chỉ báo số đo ban đầu.
**Bàn giao cho task sau:** số đo sơ bộ cho task xây máy cờ chính thức; máy cờ chạy riêng cho ván với máy, xử lý sự cố, đo đầy đủ.
**Không thuộc task này:** giao diện chơi với máy; luật lặp thế và 120 nửa nước; đo sức mạnh đầy đủ; ván với máy ở máy chủ; gợi ý nước; đi lại.
**Phục vụ (nguồn):** Story 25; tiêu chí AC-AI-02-01, AC-AI-02-03; NFR-05. Thuộc Epic: Đánh với máy theo cấp độ.
**Kết quả (đầu ra):** Máy cờ chạy riêng, ba cấp (độ sâu 2/4/6; 300/1.000/3.000 ms), tìm kiếm sâu dần, tìm tĩnh; số đo sơ bộ.
**Bằng chứng nộp:** Số đo ban đầu; kết quả thử 5 ca. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Kết luận chất lượng chỉ có sau bài đo đầy đủ.
**Liên kết Jira (khi được phép tạo):** bị chặn bởi (is blocked by) T-09; liên quan tới (relates to) Story 25; Epic: Đánh với máy theo cấp độ.

---

### T-37 — Giao diện: chọn cấp và phe, màn ván với máy, thông báo sự cố
**Thuộc Epic:** Đánh với máy theo cấp độ · **Thành phần:** Frontend · **Sprint:** 3 (11/10–14/10)
**Phải xong trước:** *Soạn "hợp đồng chung" giữa trình duyệt và máy chủ (T-02)*: nhận được kết quả đã hoàn thành của task này. *Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo) (T-08)*: nhận được kết quả đã hoàn thành của task này. *Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng (T-14)*: nhận được khung Sảnh, chỗ đặt thẻ ván máy và băng "quay lại". *Giao diện: kéo thả quân, đánh dấu nước vừa đi, cảnh báo chiếu, âm thanh (T-22)*: nhận được bàn cờ có dấu nước vừa đi, âm thanh; nhận được kéo thả dùng chung nước hợp lệ với bấm.
**Loại:** Task triển khai · **Nhãn:** `P1`, `US-AI-01`, `US-AI-02`, `US-AI-03`, `US-AI-04` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống · **Ước lượng (giờ):** nhóm điền khi họp Sprint · **Fix version:** v0.3-sprint-3

**Mục tiêu**
Dựng hành trình **chọn cấp, chọn phe và chơi với máy** trên màn hình, và làm rõ cho người dùng khác biệt giữa "tiếp tục vì máy bận" với "bắt đầu ván mới sau sự cố". Làm với dữ liệu giả; nối thật ở T-55.

**Việc cần làm (làm lần lượt)**
1. Ba thẻ cấp trên Sảnh; hộp thoại chọn phe **Đỏ / Đen / Ngẫu nhiên**. **Phe do máy chủ bốc**, giao diện không tự bốc.
2. Màn ván với máy: dùng bàn cờ đã có; nếu người chơi cầm Đen thì **bàn lật** và máy đi trước.
3. Trong lúc **máy đang nghĩ** thì khoá thao tác đi nước và hiện trạng thái; hiện lỗi theo từng loại ("máy bận", "Máy cờ gặp sự cố").
4. **Thử lại**: "bận" → gửi yêu cầu máy tìm lại (không gửi lại nước người); "Bỏ dở" → bắt đầu ván mới.
5. **Rời/đăng xuất** có hộp xác nhận (đầu hàng); bấm huỷ không gửi gì; đồng ý thì chờ kết quả từ máy chủ.
6. **Băng "Bạn có ván đang chơi dở — Quay lại"** trên Sảnh; quay lại đúng ván cũ, không tạo ván khác.
7. **Hộp thoại kết quả** khi thắng, thua, hoà theo luật hoặc đầu hàng: chỉ nút **Rời phòng** (không có Tái đấu, Xem lại, Xin hoà); khác hẳn với thông báo "Bỏ dở" do sự cố có nút Thử lại.
8. Không có nút gợi ý nước, xin hoà, đi lại, lịch sử. Đủ 5 trạng thái.

**Thành phần màn hình phải có (theo danh mục màn hình, chỉ phần giai đoạn 1)**
*Hộp chọn Cấp độ và Phe (đánh với máy)* (`MODAL-AI-SETUP`)
- Chọn cấp **Dễ / Trung bình / Khó**; chọn phe **Đỏ (đi trước)**, **Đen (máy tự đi nước đầu)** hoặc **Ngẫu nhiên (50/50 do máy chủ bốc)**.

*Màn hình Đánh với máy* (`SCR-AI-GAME`)
- Bàn cờ lớn với thẻ người chơi và thẻ máy cờ; đường dẫn riêng cho từng ván để vào lại.
- **Không** có đồng hồ cho người chơi, nút Xin hoà, nút gợi ý, nút đi lại; chỉ có **Đầu hàng**.
- Trạng thái máy đang nghĩ (khoá thao tác), thông báo "máy bận" và "Máy cờ gặp sự cố" kèm nút **Thử lại**; hộp kết quả chỉ có Rời phòng; băng "quay lại" ở Sảnh khi có ván dở.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**
| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
|---|---|---|---|---|---|
| Hộp chọn Cấp độ và Phe (đánh với máy) | Tạo ván đúng cấp/phe | Đang tạo ván và chọn phe | Chưa chọn đủ: hướng dẫn chọn | Tạo lỗi: kiểm lại với máy chủ, không tạo hai ván | Đang có chỗ chơi (đang ngồi ghế hoặc đang trong ván) hoặc đang gửi |
| Màn hình Đánh với máy | Máy đi hợp lệ, đúng cấp/phe | Đang tìm/đợi tiến trình | Chưa có nước: thế đầu, máy khai cuộc nếu người cầm Đen | ENGINE_BUSY thử cùng ván; ABANDONED tạo ván mới | Đến lượt máy hoặc tab đã bị tab khác tiếp quản; đi lại hết lượt hoặc P1 chưa có |

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Chọn Đen, máy đi trước | Bàn lật, lượt đúng |
| Mở ván máy | Không có nút của chức năng chưa làm |
| Nhận lỗi "bận" và lỗi "Bỏ dở" | Hai nút Thử lại gọi hai việc khác nhau; không tự gửi lại nước người |
| Bấm Rời ván máy: lần một chọn Huỷ, lần hai chọn Đồng ý | Huỷ thì không gửi gì lên máy chủ; Đồng ý thì chờ máy chủ xác nhận mới thoát |
| Kéo thả đúng và sai ở hai phe; về Sảnh khi có ván dở | Đúng toạ độ; chỉ một băng quay lại, cùng một ván |
| Thắng, thua, hoà, đầu hàng | Hộp kết quả đúng, chỉ Rời phòng; không nhầm với "Bỏ dở" |

**Cách tự kiểm tra**
Chuẩn bị: dữ liệu giả cho các lỗi, kết quả, đường dẫn `/ai/<mã>`.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Chọn Đen | Bàn lật, máy đi đầu |
| 2 | Mở ván máy | Không có nút ngoài phạm vi |
| 3 | Giả lập "bận" rồi "Bỏ dở" | Đúng hai hành động |
| 4 | Bấm Rời ván máy: lần một chọn Huỷ, lần hai chọn Đồng ý | Huỷ thì ván tiếp tục; Đồng ý thì thoát sau khi máy chủ xác nhận |
| 5 | Kéo thả ở hai phe; về Sảnh với ván dở | Đúng; một băng quay lại |
| 6 | Giả lập các kết quả | Hộp đúng, chỉ Rời phòng |
| 7 | Đối chiếu từng gạch đầu dòng ở phần "Thành phần màn hình phải có" với màn hình thật, và đủ 5 trạng thái ở bảng nghiệm thu | Không thiếu, không thừa; chức năng chưa làm mờ hoặc ẩn đúng quy tắc |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt, đủ 5 trạng thái, kèm ảnh.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. **Không** báo máy thật đã chơi được trước khi nối thật (T-55).
**Bàn giao cho task sau:** giao diện ván với máy cho tích hợp.
**Không thuộc task này:** gọi máy chủ thật, gợi ý nước, xin hoà, đi lại, lưu lịch sử.
**Phục vụ (nguồn):** Story 25, 26; tiêu chí AC-AI-01-01, AC-AI-01-02, AC-AI-01-03, AC-AI-02-02, AC-AI-02-04, AC-AI-03-01, AC-AI-03-02, AC-AI-03-03, AC-AI-04-01. Thuộc Epic: Đánh với máy theo cấp độ.
**Kết quả (đầu ra):** Chọn cấp và phe, màn ván với máy, thông báo bận/sự cố, hộp kết quả; đủ 5 trạng thái, dữ liệu giả.
**Bằng chứng nộp:** Ảnh; kiểm bàn phím. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Chưa nối máy thật.
**Liên kết Jira (khi được phép tạo):** bị chặn bởi (is blocked by) T-02, T-08, T-14, T-22; liên quan tới (relates to) Story 25, Story 26; Epic: Đánh với máy theo cấp độ.

---

### T-43 — Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ
**Thuộc Epic:** Đánh với máy theo cấp độ · **Thành phần:** AI · **Sprint:** 3 (11/10–14/10)
**Phải xong trước:** *Máy chủ: trạng thái phòng, mỗi người một chỗ chơi và tạo phòng (T-17)*: nhận được sổ chỗ chơi (ghế phòng và ván với máy) có khoá theo người. *Máy chủ: bộ xử lý lệnh của ván và xử lý nước đi (T-28)*: nhận được cách xử lý nước đi lần lượt và luật dùng lại được. *Máy cờ: chương trình chạy riêng, ba cấp độ, thử nghiệm sơ bộ tốc độ (T-31)*: nhận được tiến độ, kết quả và tiến trình riêng.
**Loại:** Task triển khai · **Nhãn:** `P1`, `US-AI-01`, `US-AI-02`, `US-AI-03`, `US-AI-04` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống · **Ước lượng (giờ):** nhóm điền khi họp Sprint · **Fix version:** v0.3-sprint-3

**Mục tiêu**
Quản lý **một ván với máy** trong bộ nhớ máy chủ, theo quy tắc "mỗi người một chỗ chơi". Người chơi chọn phe và cấp, và **vào lại đúng ván** nếu mất kết nối.

Phân biệt **máy chỉ đang bận** với **máy bị hỏng**, và trả đúng loại "Thử lại". Kết quả máy tìm xong **muộn** không được áp dụng vào ván mới.

**Việc cần làm (làm lần lượt)**
1. **Bắt đầu ván:** chiếm chỗ chơi dưới khoá theo người (nếu đã có chỗ khác thì từ chối); **chọn phe ngẫu nhiên ở máy chủ**; nếu người chơi cầm Đen, **máy (Đỏ) đi trước**.
2. Ván này lưu **trong bộ nhớ**, tách riêng khỏi ván online; dùng luật chung; mỗi nước máy kiểm tra mã ván, phiên bản và mã tác vụ **trước khi áp dụng**.
3. Sau mỗi nước (của người hay của máy), xét kết thúc theo thứ tự: chiếu hết/hết nước → chiếu liên tục → lặp thế → 120 nửa nước; hoặc **đầu hàng**. **Không** có xin hoà, **không** có hết giờ của người chơi.
4. Khi kết thúc: chốt kết quả **một lần**, huỷ việc tìm nước, chặn nước và kết quả đến muộn, gửi trạng thái kết quả cho hộp thoại. Kết thúc **không** đồng nghĩa người chơi đã rời chỗ; **rời chỗ** mới giải phóng đúng vị trí.
5. **Mất mạng:** giữ ván **30 phút** (vào lại cùng đường dẫn thì thấy đúng thế cờ; quá 30 phút thành "Bỏ dở"). **Chủ động rời hoặc đăng xuất đã xác nhận** thì **đầu hàng ngay**, huỷ tìm, giải phóng chỗ.
6. Báo cho các phần khác (danh sách bạn) việc **chiếm và giải phóng** chỗ chơi; **không** báo "rảnh" khi chỗ chưa được giải phóng.
7. **Hàng đợi:** nếu mọi tiến trình máy đang bận, chờ tối đa **3 giây**; quá thì trả "máy bận" **mà không đi lại nước của người chơi**.
8. **Giới hạn cứng:** thời gian nghĩ của cấp cộng thêm 2 giây; quá thì dừng tiến trình; **nếu đã có tiến độ thì dùng nước tốt nhất tìm được**, chưa có thì báo lỗi.
9. **Sập hoặc không trả lời quá 10 giây:** ván thành **Bỏ dở**, báo "Máy cờ gặp sự cố".
10. **Thử lại:** sau "bận" thì chỉ yêu cầu máy **tìm lại nước** (cùng ván, cùng thế); sau "Bỏ dở" thì tạo **ván mới** cùng cấp, cùng phe đã bốc. Bấm trùng chỉ có **một** tác dụng.
11. Kết quả đến muộn sau khi huỷ, rời hoặc tạo ván mới bị **bỏ**.
12. Ghi nhật ký khi máy cờ sập, quá hạn hoặc Bỏ dở (mã lỗi, mã ván; không chứa bí mật).

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Ba cấp với phe Đỏ / Đen / Ngẫu nhiên | Phe lưu đúng; máy Đỏ đi trước khi người chơi cầm Đen |
| Vào ghế phòng và bắt đầu ván máy cùng lúc | Chỉ một chỗ; không có ván "mồ côi" |
| Đóng tab rồi vào lại trước / sau 30 phút | Cùng thế trong hạn; quá hạn là Bỏ dở |
| Rời hoặc đăng xuất: bấm huỷ / đồng ý | Huỷ giữ ván; đồng ý đầu hàng, huỷ tìm, giải phóng chỗ |
| Cùng người vào ghế phòng và ván máy đồng thời; sau đó rời ván đã xác nhận | Chỉ một chỗ; rời giải phóng đúng, không xoá chỗ khác |
| Thế gây chiếu hết, hết nước, chiếu liên tục, lặp, 120 nửa nước; nước cuối của người và của máy | Đúng luật, hết nước là thua, chiếu hết ưu tiên hơn hoà; kết quả chốt một lần |
| Sau khi kết thúc: gửi nước, kết quả của tác vụ cũ, đầu hàng lặp | Không có nước hay việc tìm thêm; kết quả không bị ghi đè; gửi lại không nhân đôi kết thúc |
| Mọi tiến trình bận quá 3 giây rồi Thử lại | Cùng ván, cùng thế; chỉ xếp lại việc tìm |
| Vượt giới hạn cứng, có và không có tiến độ | Có: dùng nước hoàn tất gần nhất; không: Bỏ dở |
| Giết tiến trình rồi bấm Thử lại nhiều lần | Một ván mới, đúng phe đã bốc |
| Kết quả đến sau khi huỷ, rời, hoặc tạo ván mới | Bị bỏ, thế không đổi |

**Cách tự kiểm tra**
Chuẩn bị: máy chủ và máy cờ chạy thử; có thể làm treo hoặc giết tiến trình máy; đồng hồ điều khiển được.

| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Chạy ba cấp với ba lựa chọn phe | Phe và lượt đúng |
| 2 | Vào ghế phòng và bắt đầu ván máy cùng lúc | Chỉ một chỗ |
| 3 | Đóng tab, vào lại trước và sau 30 phút | Đúng thế hoặc Bỏ dở |
| 4 | Rời/đăng xuất: huỷ rồi đồng ý | Đúng như bảng |
| 5 | Rời ván đã xác nhận | Giải phóng đúng chỗ |
| 6 | Các thế kết thúc theo luật, nước cuối của người và máy | Đúng luật và thứ tự ưu tiên |
| 7 | Sau kết thúc, gửi nước, kết quả cũ, đầu hàng lặp | Không thay đổi, không nhân đôi |
| 8 | Giữ mọi tiến trình bận quá 3 giây, bấm Thử lại | Cùng ván, chỉ xếp lại việc tìm |
| 9 | Cho vượt giới hạn cứng, có và không có tiến độ | Dùng nước có sẵn / Bỏ dở |
| 10 | Giết tiến trình, bấm Thử lại trùng | Một ván mới, đúng phe |
| 11 | Gửi kết quả muộn sau huỷ, rời, ván mới | Bị bỏ |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt; không có nước trùng, ván trùng hay nước trái luật từ máy.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý. Không lưu ván xuống cơ sở dữ liệu ở giai đoạn này. Mất mạng không bị coi là chủ động đầu hàng.
**Bàn giao cho task sau:** ván với máy cho xử lý sự cố, giao diện, tích hợp, bạn bè (trạng thái Đang đấu), đăng xuất giữa ván; xử lý sự cố cho tích hợp ván với máy và đo máy cờ đầy đủ.
**Không thuộc task này:** lưu lịch sử bền; đi lại; đồng hồ người chơi; giao diện; tự hạ cấp máy; hồi sinh ván Bỏ dở.
**Phục vụ (nguồn):** Story 25, 26; tiêu chí AC-AI-01-01, AC-AI-01-02, AC-AI-02-02, AC-AI-02-04, AC-AI-03-01, AC-AI-03-02, AC-AI-03-04, AC-AI-04-01, AC-AI-04-02; NFR-05. Thuộc Epic: Đánh với máy theo cấp độ.
**Kết quả (đầu ra):** Ván với máy ở máy chủ (cấp, phe, một chỗ chơi, vào lại 30 phút), xử lý bận/hỏng/Bỏ dở/Thử lại.
**Bằng chứng nộp:** Kết quả thử 11 ca. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Không lưu bền ván với máy.
**Liên kết Jira (khi được phép tạo):** bị chặn bởi (is blocked by) T-17, T-28, T-31; liên quan tới (relates to) Story 25, Story 26; Epic: Đánh với máy theo cấp độ.

---

### T-55 — Nối web, máy chủ và máy cờ thật: ván với máy
**Thuộc Epic:** Đánh với máy theo cấp độ · **Thành phần:** Frontend, AI · **Sprint:** 4 (15/10–17/10)
**Phải xong trước:** *Giao diện: chọn cấp và phe, màn ván với máy, thông báo sự cố (T-37)*: nhận được màn hình đã dựng. *Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ (T-43)*: nhận được chức năng bắt đầu, đi nước, đồng bộ và quản lý chỗ chơi; nhận được hàng đợi, giới hạn thời gian và hai kiểu Thử lại.
**Loại:** Task triển khai · **Nhãn:** `P1`, `integration`, `US-AI-01`, `US-AI-02`, `US-AI-03`, `US-AI-04` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống · **Ước lượng (giờ):** nhóm điền khi họp Sprint · **Fix version:** v1.0-sprint-4

**Mục tiêu**
Nối màn hình ván với máy chủ và **máy cờ thật** để chứng minh trọn luồng: ba cấp, ba cách chọn phe, vào lại, rời, và phục hồi sau sự cố đều đúng luật. **Không dùng máy giả** làm bằng chứng thuật toán.

**Việc cần làm (làm lần lượt)**
1. Chạy các tổ hợp cấp và phe bằng máy cờ thật.
2. Kiểm "một chỗ chơi": chiếm chỗ bằng ghế phòng mẫu rồi bắt đầu ván máy (bị chặn), giải phóng chỗ rồi bắt đầu lại (được). Phần này **dùng dữ liệu mẫu**, không coi là đã kiểm trọn luồng "ván online → ván máy" (làm ở nghiệm thu cuối T-60).
3. Ngắt tab, giết tiến trình máy, bấm Thử lại nhiều lần, gửi kết quả cũ; kiểm trạng thái.
4. Kiểm vào lại trước và sau 30 phút; người khác mở đường dẫn ván của mình thì bị chặn.
5. Kiểm kết thúc thật: nạp thế thử, đi bằng giao diện và máy thật để gây chiếu hết, hết nước, hoà luật; thử đầu hàng.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Chiếm chỗ bằng ghế mẫu rồi bắt đầu ván máy; giải phóng rồi bắt đầu lại | Chặn trước, nhận sau; không ghi "đạt" từ dữ liệu mẫu |
| Ba cấp, ba lựa chọn phe | Phe và lượt đúng, mọi nước hợp lệ |
| Vào lại trước / sau 30 phút | Giữ đúng thế / Bỏ dở |
| Máy bận hoặc sập; người khác mở `/ai/<mã>` | Thử lại đúng loại; người ngoài bị chặn |
| Gây chiếu hết, hết nước, hoà; thử đầu hàng | Máy chủ chốt một kết quả; giao diện hiện hộp kết quả chỉ có Rời phòng; không đi hay tìm tiếp |
| Nước cuối của người và máy; gửi lại kết quả cũ | Giao diện và máy chủ cùng kết quả; không nhân đôi kết thúc, không hồi sinh ván |

**Cách tự kiểm tra**
Chuẩn bị: máy chủ, máy cờ thật, trình duyệt, hai tài khoản thử.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Chỗ chơi: chiếm bằng ghế mẫu, bắt đầu ván máy, giải phóng, bắt đầu lại | Chặn rồi nhận |
| 2 | Chạy ba cấp, ba lựa chọn phe | Đúng phe, lượt, nước hợp lệ |
| 3 | Đóng tab giữa ván máy rồi vào lại trước 30 phút, và vào lại sau 30 phút | Trước 30 phút: vào lại đúng thế cờ cũ; sau 30 phút: ván đã bỏ dở |
| 4 | Gây máy bận, sập; mở đường dẫn bằng người khác | Thử lại đúng; người ngoài bị chặn |
| 5 | Gây các kiểu kết thúc thật, đầu hàng | Một kết quả; hộp đúng |
| 6 | Gửi lại kết quả cũ | Không hồi sinh ván |

**Khi nào chuyển cho người kiểm thử:** cả 6 dòng đạt với máy cờ thật; ghi rõ phần dùng dữ liệu mẫu.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. **Kết luận chất lượng máy (GATE-AI) do T-56**; luồng "ván online rồi ván máy" đầy đủ do T-60; không coi hai phần đó đạt từ kiểm này.
**Bàn giao cho task sau:** ván với máy chạy thật cho nghiệm thu, đo, bạn bè (trạng thái Đang đấu) và demo.
**Không thuộc task này:** đo sức mạnh và tốc độ máy (T-56), lưu lịch sử.
**Phục vụ (nguồn):** Story 25, 26; tiêu chí AC-AI-01-01, AC-AI-02-04, AC-AI-03-01, AC-AI-03-02, AC-AI-03-04, AC-AI-04-01, AC-AI-04-02. Thuộc Epic: Đánh với máy theo cấp độ.
**Kết quả (đầu ra):** Ván với máy chạy thật qua web, máy chủ và máy cờ thật: ba cấp, ba phe, vào lại, sự cố.
**Bằng chứng nộp:** Video; báo cáo; ghi rõ phần dùng dữ liệu mẫu. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Không dùng máy giả làm bằng chứng thuật toán.
**Liên kết Jira (khi được phép tạo):** bị chặn bởi (is blocked by) T-37, T-43; liên quan tới (relates to) Story 25, Story 26; Epic: Đánh với máy theo cấp độ.

---

### T-56 — Đo máy cờ đầy đủ (GATE-AI): tốc độ, độ sâu, sức mạnh, độ ổn định
**Thuộc Epic:** Đánh với máy theo cấp độ · **Thành phần:** AI, QA & DevOps · **Sprint:** 4 (15/10–17/10)
**Phải xong trước:** *Máy cờ: chương trình chạy riêng, ba cấp độ, thử nghiệm sơ bộ tốc độ (T-31)*: nhận được máy cờ thật ba cấp và công cụ đo độ sâu, số nút, thời gian, hạt giống. *Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ (T-43)*: nhận được hàng đợi, giới hạn thời gian, hai nhánh "bận" và "Bỏ dở" đã kiểm. *Kiểm thử luật cờ: đếm nước đi độc lập và bộ kiểm thử chạy tự động (T-46)*: nhận được báo cáo đối chiếu số nước đi với nguồn độc lập; nhận được bộ thế, ca biên, đếm nước chạy trong kiểm tra tự động.
**Loại:** Task QA · **Nhãn:** `P1`, `QA`, `gate`, `US-AI-02` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống · **Ước lượng (giờ):** nhóm điền khi họp Sprint · **Fix version:** v1.0-sprint-4

**Mục tiêu**
Trả lời bằng **số đo thật**: máy cờ có đạt tiêu chuẩn chất lượng (gọi là **GATE-AI**) hay không. Nhóm tự đặt khung thời gian đo; báo "đạt", "không đạt" hoặc "chưa kết luận" kèm số liệu. **Không hạ ngưỡng và không sửa đáp án để cho đạt.**

**Việc cần làm (làm lần lượt)**
1. Dựng bộ **200 thế cờ cho mỗi cấp** (có nguồn); đo thời gian nghĩ qua tiến trình riêng, cả khi có **2 đến 3 ván chạy cùng lúc**.
2. **Đấu giữa các cấp:** ít nhất **40 ván mỗi cặp** (Khó với Trung bình, Trung bình với Dễ), đổi bên đều nhau; kiểm bài chiếu hết trong 1–2 nước.
3. Chạy **1.000 ván** để kiểm độ ổn định.
4. Tổng hợp từng chỉ tiêu đạt hay không; **báo p50 và p95** (không dùng trung bình để che p95).
5. Đo qua hàng đợi và giới hạn thời gian của T-43; **tách riêng** số đo thuật toán và thời gian chờ người chơi.
6. Chạy công cụ kiểm tìm kiếm tĩnh của T-31 trên thế bị chiếu và hết nước ở độ sâu cuối; lưu vết và hạt giống.
7. Đóng băng bản máy và bộ thế đo; ghi cấu hình máy đo.

**Các ngưỡng cần đạt (GATE-AI)**
| Chỉ tiêu | Ngưỡng |
|---|---|
| Thời gian nghĩ p95 theo cấp | Dễ ≤ 300 ms; Trung bình ≤ 1.000 ms; Khó ≤ 3.000 ms |
| Độ sâu cấp Khó (trung vị) | ≥ 6 ở khai cuộc, ≥ 5 ở trung cuộc |
| Sức mạnh | Tỷ lệ thắng ≥ 75% cho từng cặp cấp (≥ 40 ván mỗi cặp) |
| Độ ổn định (1.000 ván) | 0 nước sai, 0 treo, 0 lỗi tiến trình |
| Bài chiếu hết trong 1–2 nước | Giải đúng ≥ 95% |
| Thời gian chờ khi có 2–3 ván | Hàng đợi ≤ 3 giây hoặc báo bận; ghi p95 chờ riêng |

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Đối chiếu với nguồn đếm nước độc lập; gây vượt giới hạn có và không có tiến độ | Không đổi đáp án để cho khớp; dự phòng và báo lỗi đúng; số đo không che việc vượt ngân sách |
| Công cụ kiểm tìm kiếm tĩnh | Không nút đang chiếu dùng điểm tĩnh làm cận dưới; hết nước trả thua; nước cuối hợp lệ **không** thay thế bằng chứng này |
| Một chỉ tiêu không đạt | Ghi số thật và trạng thái "chặn", báo PO, chuyển lỗi về T-31 và T-43 để sửa; **không hạ ngưỡng** |

**Cách tự kiểm tra**
Chuẩn bị: máy chạy đo ổn định, bộ 200 thế mỗi cấp, công cụ ghi số.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Đo 200 thế mỗi cấp | p95 trong ngưỡng; độ sâu Khó đạt |
| 2 | Đấu ≥ 40 ván mỗi cặp, đổi bên | Tỷ lệ thắng ≥ 75% mỗi cặp |
| 3 | Chạy 1.000 ván và bộ chiếu hết 1–2 nước | 0 lỗi; ≥ 95% đúng |
| 4 | Đo khi có 2–3 ván chạy cùng lúc | Ghi p95 chờ riêng; hàng đợi ≤ 3 giây |
| 5 | Đối chiếu nguồn độc lập; gây vượt giới hạn | Đúng, không đổi đáp án |
| 6 | Chạy công cụ kiểm tìm kiếm tĩnh | Không vi phạm |

**Khi nào chuyển cho người kiểm thử:** báo cáo có số đo tái lập được, kết luận từng chỉ tiêu, cấu hình máy đo.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý với **báo cáo**. Báo cáo xong **không** đồng nghĩa tiêu chuẩn đã đạt: GATE-AI chỉ "đạt" khi **mọi ngưỡng** trên đạt; chưa chạy đủ thì ghi "chưa đo đủ"; không đạt thì ghi số thật, báo PO. Việc sửa và đo lại không chờ đến task cuối.
**Bàn giao cho task sau:** báo cáo GATE-AI cho nghiệm thu các tiêu chí phi chức năng.
**Không thuộc task này:** tối ưu máy bằng cách hạ ngưỡng, sửa nguồn đối chiếu theo kết quả, giao diện.
**Phục vụ (nguồn):** Story 25; tiêu chí AC-AI-02-01, AC-AI-02-03; GATE-AI, NFR-05. Thuộc Epic: Đánh với máy theo cấp độ.
**Kết quả (đầu ra):** Báo cáo GATE-AI đầy đủ: p95 thời gian, độ sâu, sức mạnh ≥75%, 1.000 ván ổn định, bài chiếu hết ≥95%.
**Bằng chứng nộp:** Báo cáo p50/p95, cấu hình máy đo, hạt giống. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Không đạt thì ghi số thật, báo PO, không hạ ngưỡng.
**Liên kết Jira (khi được phép tạo):** bị chặn bởi (is blocked by) T-31, T-43, T-46; liên quan tới (relates to) Story 25; Epic: Đánh với máy theo cấp độ.
