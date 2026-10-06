# Task của Epic "Đánh với máy theo cấp độ" (5 task)

**Ngày cập nhật:** 2026-10-05 · **Trạng thái:** đã được PO cho phép tạo và phân công ngày 05/10/2026 · Đã tạo Epic/Story/Task trên XIAN · Viết theo `00-chuan-description.md` và mẫu `00b`.

Mã task `T-01` đến `T-64` đánh theo **thứ tự làm** (số nhỏ làm trước, mỗi task chỉ cần các task có số nhỏ hơn). Một số task gộp nhiều việc nhỏ cùng mục đích thành một task. Ngày Sprint: 1 = 04/10–07/10, 2 = 08/10–10/10, 3 = 11/10–14/10, 4 = 15/10–17/10.

---

### T-14 — Máy cờ: chương trình chạy riêng, ba cấp độ, thử nghiệm sơ bộ tốc độ

**Jira thực:** [XIAN-48](https://xiangqi-web.atlassian.net/browse/XIAN-48) · **Loại:** Task · **Assignee:** TÌNH 4851_NGUYỄN NGỌC · **Sprint:** XIAN Sprint 2 · **Fix version:** v0.2
**Components:** AI · **Priority:** High · **Nhãn:** `P1`, `loi`, `US-AI-02`, `xiangqi-mvp-20261005`, `t-14`
**Ước lượng:** 12 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-12 · **Due date:** 2026-10-13 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Đánh với máy theo cấp độ · **Components:** AI
**Phải xong trước:**

* **T-08 — Luật cờ: nước hợp lệ, chiếu, chiếu hết, hết nước, lặp thế, 120 nửa nước**: Nước hợp lệ, chiếu, chiếu hết, hết nước, hai Tướng đối mặt, lặp thế, chiếu liên tục, 120 nửa nước.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

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
| --- | --- |
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
| --- | --- | --- |
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
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý. Báo cáo hoàn tất, kể cả khi cấp Khó chưa đạt. **Chưa tính** phép đo đầy đủ và độ ổn định (làm ở task đo máy cờ cuối). **Kết luận máy đạt tiêu chuẩn chất lượng (GATE-AI) chỉ có sau bài đo đầy đủ ở T-58**. Ở đây chỉ báo số đo ban đầu.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** số đo sơ bộ cho task xây máy cờ chính thức; máy cờ chạy riêng cho ván với máy, xử lý sự cố, đo đầy đủ.
**Không thuộc task này:** giao diện chơi với máy; luật lặp thế và 120 nửa nước; đo sức mạnh đầy đủ; ván với máy ở máy chủ; gợi ý nước; đi lại.
**Phục vụ (nguồn):** Story 25; tiêu chí AC-AI-02-01, AC-AI-02-03; NFR-05. Thuộc Epic: Đánh với máy theo cấp độ.
**Kết quả (đầu ra):** Máy cờ chạy riêng, ba cấp (độ sâu 2/4/6; 300/1.000/3.000 ms), tìm kiếm sâu dần, tìm tĩnh; số đo sơ bộ.
**Bằng chứng nộp:** Số đo ban đầu; kết quả thử 5 ca. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Kết luận chất lượng chỉ có sau bài đo đầy đủ.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-08; liên quan tới (relates to) Story 25; Epic: Đánh với máy theo cấp độ.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **TÌNH 4851_NGUYỄN NGỌC**; Sprint **XIAN Sprint 2**; Fix version **v0.2**; Start date **2026-10-12**; Due date **2026-10-13**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/10-task-e8-danh-voi-may.md` — T-14.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **TÌNH 4851_NGUYỄN NGỌC**.
* Review/kiểm độc lập dự kiến: **Gia Kỳ**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-8](https://xiangqi-web.atlassian.net/browse/XIAN-8).

**Phải hoàn tất trước:**

* [T-08 — XIAN-42](https://xiangqi-web.atlassian.net/browse/XIAN-42)

**Story phục vụ:**

* [Story 25 — XIAN-33](https://xiangqi-web.atlassian.net/browse/XIAN-33)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 8 | TÌNH 4851_NGUYỄN NGỌC |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 2 | TÌNH 4851_NGUYỄN NGỌC |
| Review độc lập | 2 | Gia Kỳ |
| Tổng Original/Remaining Estimate ban đầu | 12 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc có luật nghiệp vụ, xử lý trạng thái, tích hợp hoặc kiểm định chất lượng: dành ca dài hơn và dự phòng sửa lỗi. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-12 09:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-13 11:00 |
| Bắt đầu review | 2026-10-13 11:00 |
| Review PASS và bàn giao mục tiêu | 2026-10-13 14:00 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-26 — Giao diện: chọn cấp và phe, màn ván với máy, thông báo sự cố

**Jira thực:** [XIAN-60](https://xiangqi-web.atlassian.net/browse/XIAN-60) · **Loại:** Task · **Assignee:** Nguyễn Minh Thư · **Sprint:** XIAN Sprint 2 · **Fix version:** v0.2
**Components:** Frontend · **Priority:** High · **Nhãn:** `P1`, `loi`, `US-AI-01`, `US-AI-02`, `US-AI-03`, `US-AI-04`, `xiangqi-mvp-20261005`, `t-26`
**Ước lượng:** 3.5 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-13 · **Due date:** 2026-10-14 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Đánh với máy theo cấp độ · **Components:** Frontend
**Phải xong trước:**

* **T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ**: Gói hợp đồng chung biên dịch được, có danh sách lệnh, thông tin đi kèm, nhóm lỗi và ví dụ hợp lệ/sai dùng được ở cả giao diện và máy chủ.
* **T-07 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)**: Ứng dụng web chạy được, có kiểu chữ/màu Kỳ Đài Cổ Phong, các khối nền (nút, ô nhập, hộp thoại, thông báo, chú thích, khung xương) đủ 5 trạng thái và trang kiểm tra nội bộ.
* **T-10 — Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng**: Thanh điều hướng, Sảnh, biểu mẫu tạo phòng, ô nhập mã, danh sách phòng công khai, Luật chơi, băng quay lại; đủ 5 trạng thái, dữ liệu giả.
* **T-20 — Giao diện: kéo thả quân, đánh dấu nước vừa đi, cảnh báo chiếu, âm thanh**: Kéo thả, dấu nước vừa đi, cảnh báo chiếu, 4 âm Web Audio, nút tắt tiếng.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Dựng hành trình **chọn cấp, chọn phe và chơi với máy** trên màn hình, và làm rõ cho người dùng khác biệt giữa "tiếp tục vì máy bận" với "bắt đầu ván mới sau sự cố". Làm với dữ liệu giả; nối thật ở T-33.

**Việc cần làm (làm lần lượt)**

1. Ba thẻ cấp trên Sảnh; hộp thoại chọn phe **Đỏ / Đen / Ngẫu nhiên**. **Phe do máy chủ bốc**, giao diện không tự bốc.
2. Màn ván với máy: dùng bàn cờ đã có; nếu người chơi cầm Đen thì **bàn lật** và máy đi trước.
3. Trong lúc **máy đang nghĩ** thì khoá thao tác đi nước và hiện trạng thái; hiện lỗi theo từng loại ("máy bận", "Máy cờ gặp sự cố").
4. **Thử lại**: "bận" → gửi yêu cầu máy tìm lại (không gửi lại nước người); "Bỏ dở" → bắt đầu ván mới.
5. **Rời/đăng xuất** có hộp xác nhận (đầu hàng); bấm huỷ không gửi gì; đồng ý thì chờ kết quả từ máy chủ.
6. **Băng "Bạn có ván đang chơi dở — Quay lại"** trên Sảnh; quay lại đúng ván cũ, không tạo ván khác.
7. **Hộp thoại kết quả** khi thắng, thua, hoà theo luật hoặc đầu hàng: chỉ nút **Rời phòng** (không có Tái đấu, Xem lại, Xin hoà); khác hẳn với thông báo "Bỏ dở" do sự cố có nút Thử lại.
8. Không có nút gợi ý nước, xin hoà, đi lại, lịch sử. Đủ 5 trạng thái.

**Thành phần màn hình phải có (theo danh mục màn hình, chỉ phần P1 (MVP))**
_Hộp chọn Cấp độ và Phe (đánh với máy)_ (`MODAL-AI-SETUP`)

* Chọn cấp **Dễ / Trung bình / Khó**; chọn phe **Đỏ (đi trước)**, **Đen (máy tự đi nước đầu)** hoặc **Ngẫu nhiên (50/50 do máy chủ bốc)**.

_Màn hình Đánh với máy_ (`SCR-AI-GAME`)

* Bàn cờ lớn với thẻ người chơi và thẻ máy cờ; đường dẫn riêng cho từng ván để vào lại.
* **Không** có đồng hồ cho người chơi, nút Xin hoà, nút gợi ý, nút đi lại; chỉ có **Đầu hàng**.
* Trạng thái máy đang nghĩ (khoá thao tác), thông báo "máy bận" và "Máy cờ gặp sự cố" kèm nút **Thử lại**; hộp kết quả chỉ có Rời phòng; băng "quay lại" ở Sảnh khi có ván dở.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**

| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
| --- | --- | --- | --- | --- | --- |
| Hộp chọn Cấp độ và Phe (đánh với máy) | Tạo ván đúng cấp/phe | Đang tạo ván và chọn phe | Chưa chọn đủ: hướng dẫn chọn | Tạo lỗi: kiểm lại với máy chủ, không tạo hai ván | Đang có chỗ chơi (đang ngồi ghế hoặc đang trong ván) hoặc đang gửi |
| Màn hình Đánh với máy | Máy đi hợp lệ, đúng cấp/phe | Đang tìm/đợi tiến trình | Chưa có nước: thế đầu, máy khai cuộc nếu người cầm Đen | ENGINE_BUSY thử cùng ván; ABANDONED tạo ván mới | Đến lượt máy hoặc tab đã bị tab khác tiếp quản; đi lại hết lượt hoặc P1 chưa có |

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Chọn Đen, máy đi trước | Bàn lật, lượt đúng |
| Mở ván máy | Không có nút của chức năng chưa làm |
| Nhận lỗi "bận" và lỗi "Bỏ dở" | Hai nút Thử lại gọi hai việc khác nhau; không tự gửi lại nước người |
| Bấm Rời ván máy: lần một chọn Huỷ, lần hai chọn Đồng ý | Huỷ thì không gửi gì lên máy chủ; Đồng ý thì chờ máy chủ xác nhận mới thoát |
| Kéo thả đúng và sai ở hai phe; về Sảnh khi có ván dở | Đúng toạ độ; chỉ một băng quay lại, cùng một ván |
| Thắng, thua, hoà, đầu hàng | Hộp kết quả đúng, chỉ Rời phòng; không nhầm với "Bỏ dở" |

**Cách tự kiểm tra**
Chuẩn bị: dữ liệu giả cho các lỗi, kết quả, đường dẫn `/ai/<mã>`.

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Chọn Đen | Bàn lật, máy đi đầu |
| 2 | Mở ván máy | Không có nút ngoài phạm vi |
| 3 | Giả lập "bận" rồi "Bỏ dở" | Đúng hai hành động |
| 4 | Bấm Rời ván máy: lần một chọn Huỷ, lần hai chọn Đồng ý | Huỷ thì ván tiếp tục; Đồng ý thì thoát sau khi máy chủ xác nhận |
| 5 | Kéo thả ở hai phe; về Sảnh với ván dở | Đúng; một băng quay lại |
| 6 | Giả lập các kết quả | Hộp đúng, chỉ Rời phòng |
| 7 | Đối chiếu từng gạch đầu dòng ở phần "Thành phần màn hình phải có" với màn hình thật, và đủ 5 trạng thái ở bảng nghiệm thu | Không thiếu, không thừa; chức năng chưa làm mờ hoặc ẩn đúng quy tắc |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt, đủ 5 trạng thái, kèm ảnh.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. **Không** báo máy thật đã chơi được trước khi nối thật (T-33).

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** giao diện ván với máy cho tích hợp.
**Không thuộc task này:** gọi máy chủ thật, gợi ý nước, xin hoà, đi lại, lưu lịch sử.
**Phục vụ (nguồn):** Story 25, 26; tiêu chí AC-AI-01-01, AC-AI-01-02, AC-AI-01-03, AC-AI-02-02, AC-AI-02-04, AC-AI-03-01, AC-AI-03-02, AC-AI-03-03, AC-AI-04-01. Thuộc Epic: Đánh với máy theo cấp độ.
**Kết quả (đầu ra):** Chọn cấp và phe, màn ván với máy, thông báo bận/sự cố, hộp kết quả; đủ 5 trạng thái, dữ liệu giả.
**Bằng chứng nộp:** Ảnh; kiểm bàn phím. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Chưa nối máy thật.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-02, T-07, T-10, T-20; liên quan tới (relates to) Story 6, Story 25, Story 26; Epic: Đánh với máy theo cấp độ.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Nguyễn Minh Thư**; Sprint **XIAN Sprint 2**; Fix version **v0.2**; Start date **2026-10-13**; Due date **2026-10-14**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/10-task-e8-danh-voi-may.md` — T-26.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Nguyễn Minh Thư**.
* Review/kiểm độc lập dự kiến: **4841_Lê Thị Xuân Nhạn**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-8](https://xiangqi-web.atlassian.net/browse/XIAN-8).

**Phải hoàn tất trước:**

* [T-02 — XIAN-36](https://xiangqi-web.atlassian.net/browse/XIAN-36)
* [T-07 — XIAN-41](https://xiangqi-web.atlassian.net/browse/XIAN-41)
* [T-10 — XIAN-44](https://xiangqi-web.atlassian.net/browse/XIAN-44)
* [T-20 — XIAN-54](https://xiangqi-web.atlassian.net/browse/XIAN-54)

**Story phục vụ:**

* [Story 6 — XIAN-14](https://xiangqi-web.atlassian.net/browse/XIAN-14)
* [Story 25 — XIAN-33](https://xiangqi-web.atlassian.net/browse/XIAN-33)
* [Story 26 — XIAN-34](https://xiangqi-web.atlassian.net/browse/XIAN-34)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 2.5 | Nguyễn Minh Thư |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 0.5 | Nguyễn Minh Thư |
| Review độc lập | 0.5 | 4841_Lê Thị Xuân Nhạn |
| Tổng Original/Remaining Estimate ban đầu | 3.5 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc phạm vi hẹp/cấu hình/giao diện hoặc nối chức năng đã có đầu vào: ca thực hiện ngắn, kiểm và review riêng. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-13 17:30 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-14 11:30 |
| Bắt đầu review | 2026-10-14 14:30 |
| Review PASS và bàn giao mục tiêu | 2026-10-14 15:00 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-31 — Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ

**Jira thực:** [XIAN-65](https://xiangqi-web.atlassian.net/browse/XIAN-65) · **Loại:** Task · **Assignee:** TÌNH 4851_NGUYỄN NGỌC · **Sprint:** XIAN Sprint 2 · **Fix version:** v0.2
**Components:** AI · **Priority:** High · **Nhãn:** `P1`, `loi`, `US-AI-01`, `US-AI-02`, `US-AI-03`, `US-AI-04`, `xiangqi-mvp-20261005`, `t-31`
**Ước lượng:** 12 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-16 · **Due date:** 2026-10-18 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Đánh với máy theo cấp độ · **Components:** AI
**Phải xong trước:**

* **T-14 — Máy cờ: chương trình chạy riêng, ba cấp độ, thử nghiệm sơ bộ tốc độ**: Máy cờ chạy riêng, ba cấp (độ sâu 2/4/6; 300/1.000/3.000 ms), tìm kiếm sâu dần, tìm tĩnh; số đo sơ bộ.
* **T-15 — Máy chủ: trạng thái phòng, mỗi người một chỗ chơi và tạo phòng**: Trạng thái phòng, sổ chỗ chơi (mỗi người một chỗ), chức năng tạo phòng có mã 8 ký tự, đường dẫn mời, chống tạo trùng.
* **T-17 — Máy chủ: đăng nhập, quản lý phiên và hồ sơ**: Đăng nhập bằng tên đăng nhập và mật khẩu, quản lý phiên 12 giờ/30 ngày, kiểm hạn và thu hồi, xem và sửa tên hiển thị. Đăng nhập Google chạy được. Kèm hạn phiên cố định, phân biệt tab/thiết bị, dữ liệu loại phiên và tín hiệu hết phiên/thay thiết bị cho các mô-đun ván.
* **T-27 — Máy chủ: bộ xử lý lệnh của ván và xử lý nước đi**: Bộ xử lý lệnh của ván (hàng đợi, mã yêu cầu, phiên bản, biên lai, lỗi ghi) và xử lý nước đi.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

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
13. Nối tín hiệu phiên từ T-17: hết phiên chính thức giữ ván 30 phút để cùng thiết bị đăng nhập lại; đăng nhập trên thiết bị khác giữa ván thì **người chơi thua ngay**, kết thúc một lần, huỷ tìm nước và giải phóng vị trí; thiết bị mới về Sảnh. Không dùng thời hạn 30 phút cho thiết bị khác hoặc Đăng xuất chủ động đã xác nhận.
14. Máy chủ khởi động lại làm mất ván AI trong bộ nhớ: mở lại /ai/:id báo không còn trạng thái, cho về Sảnh hoặc chủ động tạo mới; không tự tạo kết quả, lịch sử hay khôi phục ván cũ.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
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
| --- | --- | --- |
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
| 12 | Hết phiên rồi cùng thiết bị đăng nhập trước/sau 30 phút; đăng nhập khác thiết bị trong ván; khởi động lại máy chủ | Đúng giữ ván/Bỏ dở/xử thua ngay; đường ván mất báo rõ; không nhận nước trả về từ tác vụ cũ |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt; không có nước trùng, ván trùng hay nước trái luật từ máy.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý. Không lưu ván xuống cơ sở dữ liệu ở giai đoạn này. Mất mạng không bị coi là chủ động đầu hàng.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** ván với máy cho xử lý sự cố, giao diện, tích hợp, bạn bè (trạng thái Đang đấu), đăng xuất giữa ván; xử lý sự cố cho tích hợp ván với máy và đo máy cờ đầy đủ.
**Không thuộc task này:** lưu lịch sử bền; đi lại; đồng hồ người chơi; giao diện; tự hạ cấp máy; hồi sinh ván Bỏ dở.
**Phục vụ (nguồn):** Story 25, 26; tiêu chí AC-AI-01-01, AC-AI-01-02, AC-AI-02-01, AC-AI-02-02, AC-AI-02-04, AC-AI-03-01, AC-AI-03-02, AC-AI-03-04, AC-AI-04-01, AC-AI-04-02; NFR-05. Thuộc Epic: Đánh với máy theo cấp độ. Bổ sung tiêu chí AC-AUTH-04-06. Bổ sung tiêu chí AC-AI-03-05. Bổ sung AC-AUTH-04-05 (thiết bị khác).
**Kết quả (đầu ra):** Ván với máy ở máy chủ (cấp, phe, một chỗ chơi, vào lại 30 phút), xử lý bận/hỏng/Bỏ dở/Thử lại. Nối luật hết phiên/thiết bị khác; đường ván AI cũ sau khởi động lại báo mất trạng thái, không tự hồi sinh.
**Bằng chứng nộp:** Kết quả thử 11 ca. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Không lưu bền ván với máy.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-14, T-15, T-17, T-27; liên quan tới (relates to) Story 2, Story 25, Story 26; Epic: Đánh với máy theo cấp độ.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **TÌNH 4851_NGUYỄN NGỌC**; Sprint **XIAN Sprint 2**; Fix version **v0.2**; Start date **2026-10-16**; Due date **2026-10-18**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/10-task-e8-danh-voi-may.md` — T-31.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **TÌNH 4851_NGUYỄN NGỌC**.
* Review/kiểm độc lập dự kiến: **nguyenhoangtungtuyhoa**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-8](https://xiangqi-web.atlassian.net/browse/XIAN-8).

**Phải hoàn tất trước:**

* [T-14 — XIAN-48](https://xiangqi-web.atlassian.net/browse/XIAN-48)
* [T-15 — XIAN-49](https://xiangqi-web.atlassian.net/browse/XIAN-49)
* [T-17 — XIAN-51](https://xiangqi-web.atlassian.net/browse/XIAN-51)
* [T-27 — XIAN-61](https://xiangqi-web.atlassian.net/browse/XIAN-61)

**Story phục vụ:**

* [Story 2 — XIAN-10](https://xiangqi-web.atlassian.net/browse/XIAN-10)
* [Story 25 — XIAN-33](https://xiangqi-web.atlassian.net/browse/XIAN-33)
* [Story 26 — XIAN-34](https://xiangqi-web.atlassian.net/browse/XIAN-34)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 8 | TÌNH 4851_NGUYỄN NGỌC |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 2 | TÌNH 4851_NGUYỄN NGỌC |
| Review độc lập | 2 | nguyenhoangtungtuyhoa |
| Tổng Original/Remaining Estimate ban đầu | 12 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc có luật nghiệp vụ, xử lý trạng thái, tích hợp hoặc kiểm định chất lượng: dành ca dài hơn và dự phòng sửa lỗi. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-16 16:30 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-18 09:30 |
| Bắt đầu review | 2026-10-18 09:30 |
| Review PASS và bàn giao mục tiêu | 2026-10-18 11:30 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-33 — Nối web, máy chủ và máy cờ thật: ván với máy

**Jira thực:** [XIAN-67](https://xiangqi-web.atlassian.net/browse/XIAN-67) · **Loại:** Task · **Assignee:** Nguyễn Minh Thư · **Sprint:** XIAN Sprint 2 · **Fix version:** v0.2
**Components:** Frontend, AI · **Priority:** High · **Nhãn:** `P1`, `loi`, `integration`, `US-AI-01`, `US-AI-02`, `US-AI-03`, `US-AI-04`, `xiangqi-mvp-20261005`, `t-33`
**Ước lượng:** 4.5 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-18 · **Due date:** 2026-10-18 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Đánh với máy theo cấp độ · **Components:** Frontend, AI
**Phải xong trước:**

* **T-26 — Giao diện: chọn cấp và phe, màn ván với máy, thông báo sự cố**: Chọn cấp và phe, màn ván với máy, thông báo bận/sự cố, hộp kết quả; đủ 5 trạng thái, dữ liệu giả.
* **T-31 — Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ**: Ván với máy ở máy chủ (cấp, phe, một chỗ chơi, vào lại 30 phút), xử lý bận/hỏng/Bỏ dở/Thử lại. Nối luật hết phiên/thiết bị khác; đường ván AI cũ sau khởi động lại báo mất trạng thái, không tự hồi sinh.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Nối màn hình ván với máy chủ và **máy cờ thật** để chứng minh trọn luồng: ba cấp, ba cách chọn phe, vào lại, rời, và phục hồi sau sự cố đều đúng luật. **Không dùng máy giả** làm bằng chứng thuật toán.

**Việc cần làm (làm lần lượt)**

1. Chạy các tổ hợp cấp và phe bằng máy cờ thật.
2. Kiểm "một chỗ chơi": chiếm chỗ bằng ghế phòng mẫu rồi bắt đầu ván máy (bị chặn), giải phóng chỗ rồi bắt đầu lại (được). Phần này **dùng dữ liệu mẫu**, không coi là đã kiểm trọn luồng "ván online → ván máy" (làm ở nghiệm thu cuối T-62).
3. Ngắt tab, giết tiến trình máy, bấm Thử lại nhiều lần, gửi kết quả cũ; kiểm trạng thái.
4. Kiểm vào lại trước và sau 30 phút; người khác mở đường dẫn ván của mình thì bị chặn.
5. Kiểm kết thúc thật: nạp thế thử, đi bằng giao diện và máy thật để gây chiếu hết, hết nước, hoà luật; thử đầu hàng.
6. Kiểm mở đường ván cũ sau khởi động lại máy chủ: có thông báo không còn trạng thái và lựa chọn về Sảnh/tạo mới chủ động; không hồi sinh ván hoặc sinh lịch sử giả. T-57 kiểm bổ sung hết phiên/đăng nhập thiết bị khác ở AI cùng online.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Chiếm chỗ bằng ghế mẫu rồi bắt đầu ván máy; giải phóng rồi bắt đầu lại | Chặn trước, nhận sau; không ghi "đạt" từ dữ liệu mẫu |
| Ba cấp, ba lựa chọn phe | Phe và lượt đúng, mọi nước hợp lệ |
| Vào lại trước / sau 30 phút | Giữ đúng thế / Bỏ dở |
| Máy bận hoặc sập; người khác mở `/ai/<mã>` | Thử lại đúng loại; người ngoài bị chặn |
| Gây chiếu hết, hết nước, hoà; thử đầu hàng | Máy chủ chốt một kết quả; giao diện hiện hộp kết quả chỉ có Rời phòng; không đi hay tìm tiếp |
| Nước cuối của người và máy; gửi lại kết quả cũ | Giao diện và máy chủ cùng kết quả; không nhân đôi kết thúc, không hồi sinh ván |

**Cách tự kiểm tra**
Chuẩn bị: máy chủ, máy cờ thật, trình duyệt, hai tài khoản thử.

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Chỗ chơi: chiếm bằng ghế mẫu, bắt đầu ván máy, giải phóng, bắt đầu lại | Chặn rồi nhận |
| 2 | Chạy ba cấp, ba lựa chọn phe | Đúng phe, lượt, nước hợp lệ |
| 3 | Đóng tab giữa ván máy rồi vào lại trước 30 phút, và vào lại sau 30 phút | Trước 30 phút: vào lại đúng thế cờ cũ; sau 30 phút: ván đã bỏ dở |
| 4 | Gây máy bận, sập; mở đường dẫn bằng người khác | Thử lại đúng; người ngoài bị chặn |
| 5 | Gây các kiểu kết thúc thật, đầu hàng | Một kết quả; hộp đúng |
| 6 | Gửi lại kết quả cũ | Không hồi sinh ván |

**Khi nào chuyển cho người kiểm thử:** cả 6 dòng đạt với máy cờ thật; ghi rõ phần dùng dữ liệu mẫu.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. **Kết luận chất lượng máy (GATE-AI) do T-58**; luồng "ván online rồi ván máy" đầy đủ do T-62; không coi hai phần đó đạt từ kiểm này.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** ván với máy chạy thật cho nghiệm thu, đo, bạn bè (trạng thái Đang đấu) và demo.
**Không thuộc task này:** đo sức mạnh và tốc độ máy (T-58), lưu lịch sử.
**Phục vụ (nguồn):** Story 25, 26; tiêu chí AC-AI-01-01, AC-AI-02-04, AC-AI-03-01, AC-AI-03-02, AC-AI-03-04, AC-AI-04-01, AC-AI-04-02. Thuộc Epic: Đánh với máy theo cấp độ. Bổ sung tiêu chí AC-AI-03-05.
**Kết quả (đầu ra):** Ván với máy chạy thật qua web, máy chủ và máy cờ thật: ba cấp, ba phe, vào lại, sự cố.
**Bằng chứng nộp:** Video; báo cáo; ghi rõ phần dùng dữ liệu mẫu. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Không dùng máy giả làm bằng chứng thuật toán.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-26, T-31; liên quan tới (relates to) Story 6, Story 25, Story 26; Epic: Đánh với máy theo cấp độ.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Nguyễn Minh Thư**; Sprint **XIAN Sprint 2**; Fix version **v0.2**; Start date **2026-10-18**; Due date **2026-10-18**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/10-task-e8-danh-voi-may.md` — T-33.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Nguyễn Minh Thư**.
* Review/kiểm độc lập dự kiến: **4841_Lê Thị Xuân Nhạn**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-8](https://xiangqi-web.atlassian.net/browse/XIAN-8).

**Phải hoàn tất trước:**

* [T-26 — XIAN-60](https://xiangqi-web.atlassian.net/browse/XIAN-60)
* [T-31 — XIAN-65](https://xiangqi-web.atlassian.net/browse/XIAN-65)

**Story phục vụ:**

* [Story 6 — XIAN-14](https://xiangqi-web.atlassian.net/browse/XIAN-14)
* [Story 25 — XIAN-33](https://xiangqi-web.atlassian.net/browse/XIAN-33)
* [Story 26 — XIAN-34](https://xiangqi-web.atlassian.net/browse/XIAN-34)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 3 | Nguyễn Minh Thư |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 1 | Nguyễn Minh Thư |
| Review độc lập | 0.5 | 4841_Lê Thị Xuân Nhạn |
| Tổng Original/Remaining Estimate ban đầu | 4.5 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc phạm vi hẹp/cấu hình/giao diện hoặc nối chức năng đã có đầu vào: ca thực hiện ngắn, kiểm và review riêng. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-18 11:30 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-18 16:30 |
| Bắt đầu review | 2026-10-18 16:30 |
| Review PASS và bàn giao mục tiêu | 2026-10-18 17:00 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-58 — Đo máy cờ đầy đủ (GATE-AI): tốc độ, độ sâu, sức mạnh, độ ổn định

**Jira thực:** [XIAN-92](https://xiangqi-web.atlassian.net/browse/XIAN-92) · **Loại:** Task · **Assignee:** Tưởng Lê khoa Cường-4572 · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** AI, QA & DevOps · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `QA`, `gate`, `US-AI-02`, `xiangqi-mvp-20261005`, `t-58`
**Ước lượng:** 14 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-29 · **Due date:** 2026-10-31 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Đánh với máy theo cấp độ · **Components:** AI, QA & DevOps
**Phải xong trước:**

* **T-14 — Máy cờ: chương trình chạy riêng, ba cấp độ, thử nghiệm sơ bộ tốc độ**: Máy cờ chạy riêng, ba cấp (độ sâu 2/4/6; 300/1.000/3.000 ms), tìm kiếm sâu dần, tìm tĩnh; số đo sơ bộ.
* **T-31 — Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ**: Ván với máy ở máy chủ (cấp, phe, một chỗ chơi, vào lại 30 phút), xử lý bận/hỏng/Bỏ dở/Thử lại. Nối luật hết phiên/thiết bị khác; đường ván AI cũ sau khởi động lại báo mất trạng thái, không tự hồi sinh.
* **T-53 — Kiểm thử luật cờ: đếm nước đi độc lập và bộ kiểm thử chạy tự động**: Bộ kiểm thử luật chạy tự động: đếm nước đi độc lập (44, 1.920, 79.666, 3.290.240), thế mẫu, 1.000 ván ngẫu nhiên, ký hiệu; báo cáo GATE-PERFT.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Trả lời bằng **số đo thật**: máy cờ có đạt tiêu chuẩn chất lượng (gọi là **GATE-AI**) hay không. Nhóm tự đặt khung thời gian đo; báo "đạt", "không đạt" hoặc "chưa kết luận" kèm số liệu. **Không hạ ngưỡng và không sửa đáp án để cho đạt.**

**Việc cần làm (làm lần lượt)**

1. Dựng bộ **200 thế cờ cho mỗi cấp** (có nguồn); đo thời gian nghĩ qua tiến trình riêng, cả khi có **2 đến 3 ván chạy cùng lúc**.
2. **Đấu giữa các cấp:** ít nhất **40 ván mỗi cặp** (Khó với Trung bình, Trung bình với Dễ), đổi bên đều nhau; kiểm bài chiếu hết trong 1–2 nước.
3. Chạy **1.000 ván** để kiểm độ ổn định.
4. Tổng hợp từng chỉ tiêu đạt hay không; **báo p50 và p95** (không dùng trung bình để che p95).
5. Đo qua hàng đợi và giới hạn thời gian của T-31; **tách riêng** số đo thuật toán và thời gian chờ người chơi.
6. Chạy công cụ kiểm tìm kiếm tĩnh của T-14 trên thế bị chiếu và hết nước ở độ sâu cuối; lưu vết và hạt giống.
7. Đóng băng bản máy và bộ thế đo; ghi cấu hình máy đo.
8. Tách bộ **chiếu hết 1–2 nước bắt buộc** đã xác minh đáp án và bộ mở rộng: cấp Khó phải đúng **100% bộ bắt buộc**, bộ mở rộng ghi tỷ lệ riêng. Không áp 100% này cho Dễ/Trung bình; hai cấp đó vẫn phải đạt nước hợp lệ, ngân sách và phân cấp sức mạnh. Không đổi đáp án để che thất bại.

**Các ngưỡng cần đạt (GATE-AI)**

| Chỉ tiêu | Ngưỡng |
| --- | --- |
| Thời gian nghĩ p95 theo cấp | Dễ ≤ 300 ms; Trung bình ≤ 1.000 ms; Khó ≤ 3.000 ms |
| Độ sâu cấp Khó (trung vị) | ≥ 6 ở khai cuộc, ≥ 5 ở trung cuộc |
| Sức mạnh | Tỷ lệ thắng ≥ 75% cho từng cặp cấp (≥ 40 ván mỗi cặp) |
| Độ ổn định (1.000 ván) | 0 nước sai, 0 treo, 0 lỗi tiến trình |
| Bộ bắt buộc chiếu hết 1–2 nước đã xác minh đáp án | **Cấp Khó giải đúng 100%**; bộ mở rộng báo tỷ lệ riêng; không áp ngưỡng này cho Dễ/Trung bình |
| Thời gian chờ khi có 2–3 ván | Hàng đợi ≤ 3 giây hoặc báo bận; ghi p95 chờ riêng |

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Đối chiếu với nguồn đếm nước độc lập; gây vượt giới hạn có và không có tiến độ | Không đổi đáp án để cho khớp; dự phòng và báo lỗi đúng; số đo không che việc vượt ngân sách |
| Công cụ kiểm tìm kiếm tĩnh | Không nút đang chiếu dùng điểm tĩnh làm cận dưới; hết nước trả thua; nước cuối hợp lệ **không** thay thế bằng chứng này |
| Một chỉ tiêu không đạt | Ghi số thật và trạng thái "chặn", báo PO, chuyển lỗi về T-14 và T-31 để sửa; **không hạ ngưỡng** |

**Cách tự kiểm tra**
Chuẩn bị: máy chạy đo ổn định, bộ 200 thế mỗi cấp, công cụ ghi số.

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Đo 200 thế mỗi cấp | p95 trong ngưỡng; độ sâu Khó đạt |
| 2 | Đấu ≥ 40 ván mỗi cặp, đổi bên | Tỷ lệ thắng ≥ 75% mỗi cặp |
| 3 | Chạy 1.000 ván và bộ chiếu hết 1–2 nước | 1.000 ván không nước sai/treo/lỗi tiến trình; cấp Khó đúng 100% bộ chiếu hết bắt buộc, bộ mở rộng báo riêng |
| 4 | Đo khi có 2–3 ván chạy cùng lúc | Ghi p95 chờ riêng; hàng đợi ≤ 3 giây |
| 5 | Đối chiếu nguồn độc lập; gây vượt giới hạn | Đúng, không đổi đáp án |
| 6 | Chạy công cụ kiểm tìm kiếm tĩnh | Không vi phạm |

**Khi nào chuyển cho người kiểm thử:** báo cáo có số đo tái lập được, kết luận từng chỉ tiêu, cấu hình máy đo.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý với **báo cáo**. Báo cáo xong **không** đồng nghĩa tiêu chuẩn đã đạt: GATE-AI chỉ "đạt" khi **mọi ngưỡng** trên đạt; chưa chạy đủ thì ghi "chưa đo đủ"; không đạt thì ghi số thật, báo PO. Việc sửa và đo lại không chờ đến task cuối.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** báo cáo GATE-AI cho nghiệm thu các tiêu chí phi chức năng.
**Không thuộc task này:** tối ưu máy bằng cách hạ ngưỡng, sửa nguồn đối chiếu theo kết quả, giao diện.
**Phục vụ (nguồn):** Story 25; tiêu chí AC-AI-02-01, AC-AI-02-03; GATE-AI, NFR-05. Thuộc Epic: Đánh với máy theo cấp độ.
**Kết quả (đầu ra):** Báo cáo GATE-AI đầy đủ: p95 thời gian, độ sâu, sức mạnh ≥75%, 1.000 ván ổn định, cấp Khó giải đúng 100% bộ chiếu hết 1–2 nước bắt buộc đã xác minh đáp án; bộ mở rộng báo riêng.
**Bằng chứng nộp:** Báo cáo p50/p95, cấu hình máy đo, hạt giống. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Không đạt thì ghi số thật, báo PO, không hạ ngưỡng.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-14, T-31, T-53; liên quan tới (relates to) Story 25; Epic: Đánh với máy theo cấp độ.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Tưởng Lê khoa Cường-4572**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-10-29**; Due date **2026-10-31**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/10-task-e8-danh-voi-may.md` — T-58.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Tưởng Lê khoa Cường-4572**.
* Review/kiểm độc lập dự kiến: **TÌNH 4851_NGUYỄN NGỌC**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-8](https://xiangqi-web.atlassian.net/browse/XIAN-8).

**Phải hoàn tất trước:**

* [T-14 — XIAN-48](https://xiangqi-web.atlassian.net/browse/XIAN-48)
* [T-31 — XIAN-65](https://xiangqi-web.atlassian.net/browse/XIAN-65)
* [T-53 — XIAN-87](https://xiangqi-web.atlassian.net/browse/XIAN-87)

**Story phục vụ:**

* [Story 25 — XIAN-33](https://xiangqi-web.atlassian.net/browse/XIAN-33)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 10 | Tưởng Lê khoa Cường-4572 |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 2 | Tưởng Lê khoa Cường-4572 |
| Review độc lập | 2 | TÌNH 4851_NGUYỄN NGỌC |
| Tổng Original/Remaining Estimate ban đầu | 14 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc có luật nghiệp vụ, xử lý trạng thái, tích hợp hoặc kiểm định chất lượng: dành ca dài hơn và dự phòng sửa lỗi. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-29 14:30 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-31 09:30 |
| Bắt đầu review | 2026-10-31 09:30 |
| Review PASS và bàn giao mục tiêu | 2026-10-31 11:30 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---
