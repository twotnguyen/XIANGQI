# Task của Epic "Tạo phòng chơi" (6 task)

**Ngày cập nhật:** 2026-10-05 · **Trạng thái:** đã được PO cho phép tạo và phân công ngày 05/10/2026 · Đã tạo Epic/Story/Task trên XIAN · Viết theo `00-chuan-description.md` và mẫu `00b`.

Mã task `T-01` đến `T-64` đánh theo **thứ tự làm** (số nhỏ làm trước, mỗi task chỉ cần các task có số nhỏ hơn). Một số task gộp nhiều việc nhỏ cùng mục đích thành một task. Ngày Sprint: 1 = 04/10–07/10, 2 = 08/10–10/10, 3 = 11/10–14/10, 4 = 15/10–17/10.

---

### T-10 — Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng

**Jira thực:** [XIAN-44](https://xiangqi-web.atlassian.net/browse/XIAN-44) · **Loại:** Task · **Assignee:** 4841_Lê Thị Xuân Nhạn · **Sprint:** XIAN Sprint 1 · **Fix version:** v0.1
**Components:** Frontend · **Priority:** High · **Nhãn:** `P1`, `loi`, `US-AI-03`, `US-ROOM-01`, `US-ROOM-05`, `US-ROOM-08`, `US-UI-01`, `US-UI-02`, `xiangqi-mvp-20261005`, `t-10`
**Ước lượng:** 6 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-08 · **Due date:** 2026-10-08 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Tạo phòng chơi · **Components:** Frontend
**Phải xong trước:**

* **T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ**: Gói hợp đồng chung biên dịch được, có danh sách lệnh, thông tin đi kèm, nhóm lỗi và ví dụ hợp lệ/sai dùng được ở cả giao diện và máy chủ.
* **T-07 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)**: Ứng dụng web chạy được, có kiểu chữ/màu Kỳ Đài Cổ Phong, các khối nền (nút, ô nhập, hộp thoại, thông báo, chú thích, khung xương) đủ 5 trạng thái và trang kiểm tra nội bộ.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Dựng **thanh điều hướng** và **khung Sảnh** thống nhất để các phần khác (phòng, ván với máy, bạn bè) gắn nội dung vào đúng chỗ. Người dùng thấy mọi chức năng của P1 (MVP) và biết đường quay lại chỗ chơi đang giữ.

Dựng **Sảnh** và hộp thoại **tạo phòng**, ô **nhập mã** để vào phòng. Giao diện chỉ gửi ý định; **không tự cấp ghế hay tạo phòng**.

**Việc cần làm (làm lần lượt)**

1. Thanh điều hướng đăng nhập: logo, Sảnh, Bạn bè, **chỗ gắn chuông lời mời**, ảnh đại diện và tên với menu Hồ sơ/Đăng xuất. Bảng xếp hạng và Lịch sử **mờ kèm "Sắp ra mắt"**.
2. Khung Sảnh có **chỗ gắn**: phòng (tạo/vào/danh sách), ba thẻ Đánh với máy, **băng "quay lại"**. Bốn lựa chọn Đánh Thường, Đánh Hạng, Tự tạo phòng, Đánh với máy. Đánh Thường ghép ngẫu nhiên và Đánh Hạng mờ kèm "Sắp ra mắt"; Tự tạo phòng và ba cấp AI hoạt động.
3. Nếu người dùng **đang ngồi ghế phòng hoặc có ván dở**: hiện băng quay lại; các nút tạo mới bị mờ có chú thích lý do (không cho tạo chỗ chơi thứ hai).
4. Mục **Luật chơi** thu gọn/mở rộng bằng chuột và bàn phím, nêu: hết nước đi là thua, không có luật đuổi quân riêng; viết theo tài liệu luật cờ; **không** thêm trang hay hộp thoại mới.
5. Khung bị lỗi tải một chỗ thì chỉ chỗ đó báo lỗi, **không mất cả khung**.
6. Gắn nội dung phòng vào khung Sảnh có sẵn (không dựng thanh điều hướng thứ hai).
7. **Hộp thoại tạo phòng:** tên phòng (1–60 ký tự), giờ **5/10/15 phút** (mặc định 10), riêng tư cố định **Chỉ vào bằng mã (CODE_ONLY)** khi tạo; Host mở công khai sau trong Cài đặt phòng, số người xem **0–5 (mặc định 5)**. Kiểm trước khi gửi, giữ lại dữ liệu khi lỗi.
8. **Ô nhập mã** vào phòng.
9. **Danh sách phòng**: trạng thái đang tải, trống, lỗi (có nút "Thử lại").
10. Nếu người dùng **đang có ghế hoặc ván dở**: hiện thanh "Quay lại phòng/ván" và nút tạo mới bị mờ có giải thích.
11. Mục **Luật chơi** thu gọn được bằng bàn phím, ngay trong Sảnh.
12. Các chức năng chưa làm (ghép ngẫu nhiên, đánh hạng, khách…) **mờ có chú thích**, không bấm được.
13. Đủ 5 trạng thái cho từng khung.
14. Hiển thị **chữ thuần**: nội dung do người dùng gõ (tên hiển thị, tên phòng, tin chat) luôn hiện nguyên văn như chữ, **không** chạy mã HTML, script hay đường dẫn tự kích hoạt.

**Thành phần màn hình phải có (theo danh mục màn hình, chỉ phần P1 (MVP))**
_Thanh điều hướng_ (`PANEL-NAVBAR`)

* Cố định đầu mọi trang đã đăng nhập: logo, **Sảnh**, **Bạn bè**; **Bảng xếp hạng** và **Lịch sử** mờ "Sắp ra mắt".
* Chuông lời mời kết bạn; ảnh đại diện và tên hiển thị kèm menu **Hồ sơ** và **Đăng xuất**.
* Không có huy hiệu điểm Elo hay huy hiệu tin nhắn đến ở giai đoạn này.

_Sảnh_ (`SCR-LOBBY`)

* Băng "Bạn có ván đang chơi dở — Quay lại" khi có ván hoặc phòng dở; đang ngồi ghế thì các nút tạo phòng mờ kèm chú thích.
* Vùng **Tự tạo phòng**: nút **Tạo phòng**; ô **Vào phòng bằng mã** (mã 8 ký tự, ví dụ K7M2-XQP4); **danh sách phòng công khai** (cột: tên phòng, hai ghế/người chơi, trạng thái, số người xem hiện tại/trần; không hiển thị mã mời hay token, nút **Vào xem** luôn vào làm người xem). Lựa chọn Đánh Thường ghép ngẫu nhiên **mờ** kèm "Sắp ra mắt".
* Vùng **Đánh hạng**: thẻ mờ "Sắp ra mắt" (không có chức năng).
* Vùng **Đánh với máy**: ba thẻ **Dễ** (độ sâu 2), **Trung bình** (độ sâu 4), **Khó** (độ sâu 6); bấm một thẻ mở hộp chọn phe.
* Mục **Luật chơi** thu gọn/mở rộng được bằng chuột và bàn phím (hết nước đi là thua; chưa có luật đuổi quân riêng); không thêm trang hay hộp thoại mới.

_Hộp thoại Tạo phòng_ (`MODAL-CREATE-ROOM`)

* Tên phòng (1–60 ký tự, lọc từ cấm).
* Thời gian mỗi bên: **5, 10 hoặc 15 phút** (mặc định 10; không có mức "không giới hạn" ở giai đoạn này; không cộng giây; không đổi sau khi tạo).
* Riêng tư khi tạo cố định **Chỉ vào bằng mã (CODE_ONLY)**; không chọn PUBLIC/LOCKED. Host mở công khai sau trong Cài đặt phòng.
* Số người xem tối đa: **không có người xem, hoặc 1 đến 5** (mặc định 5; không đổi sau khi tạo).
* Nút **Tạo** và **Huỷ**; giữ lại dữ liệu đã nhập khi có lỗi.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**

| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
| --- | --- | --- | --- | --- | --- |
| Thanh điều hướng | Mục/menu đúng phiên/phân kỳ; badge là tổng tin đến chưa đọc từ bạn hiện tại, theo BA 5.2 | Tải thông tin/badge | Không thông báo: badge ẩn, chuông có giải thích | Tải thông báo lỗi không biến thành không có thông báo | P2 chưa mở; hành động đang xử lý |
| Sảnh | Danh sách và hành động đúng phân kỳ, có Luật chơi | Tải phòng/bạn/phiên, khung xương từng vùng | Chưa có phòng: giải thích + Tạo phòng | Không tải danh sách: Thử lại, không giả danh sách rỗng | Đang có chỗ chơi (đang ngồi ghế hoặc đang trong ván) hoặc tính năng P2 chưa mở |
| Hộp thoại Tạo phòng | Tạo phòng đúng giá trị đã chọn | Đang tạo, chặn bấm lại | Tên trống: hướng dẫn và các mặc định | Lỗi tạo: kiểm lại với máy chủ trước khi thử lại để không tạo hai phòng | Đang có chỗ chơi (đang ngồi ghế hoặc đang trong ván) hoặc tên không hợp lệ |

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Mở Sảnh, Bạn bè, Hồ sơ | Đúng trang; chức năng chưa làm không kích hoạt được |
| Dữ liệu mẫu: còn ghế/ván máy và không có | Đúng băng quay lại / nút mờ có lý do |
| Mở và thu Luật chơi bằng chuột và bàn phím | Đúng nội dung, không mở trang mới |
| Một chỗ gắn tải lỗi | Báo lỗi rõ chỗ đó, không mất cả khung |
| Mở hộp thoại tạo phòng | Mặc định 10 phút, 5 người xem; chỉ có kiểu công khai/chỉ mã; chỉ giờ 5/10/15 |
| Đang có ghế hoặc ván dở | Thanh quay lại hiện; nút tạo mới mờ, có lý do |
| Danh sách tải lỗi / rỗng | Hai trạng thái khác nhau; có "Thử lại" / "Tạo phòng" đúng |
| Mở/thu Luật chơi bằng bàn phím | Gọn, đúng nội dung, không mở trang mới |
| Có hơn 50 phòng công khai; tạo thêm một phòng mới | Danh sách mới nhất trước, tối đa 50, tự làm mới |
| Phòng công khai đã đủ người xem | Nút "Vào xem" mờ kèm chú thích lý do |

**Cách tự kiểm tra**
Chuẩn bị: dữ liệu giả cho trạng thái chỗ chơi; chạy giao diện với dữ liệu giả.

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Mở Sảnh, Bạn bè, Hồ sơ | Đúng trang; mục chưa làm mờ |
| 2 | Dữ liệu mẫu có và không có chỗ chơi | Băng quay lại; nút mờ có lý do |
| 3 | Mở/thu Luật chơi | Đúng nội dung |
| 4 | Làm một chỗ gắn lỗi | Chỉ chỗ đó báo lỗi |
| 5 | Mở hộp thoại; đổi giá trị; thử sai biên | Mặc định đúng; chỉ giá trị hợp lệ |
| 6 | Giả lập đang có ghế | Thanh quay lại, nút tạo mờ có lý do |
| 7 | Giả lập danh sách lỗi và rỗng | Hai trạng thái khác nhau, nút đúng |
| 8 | Mở và thu Luật chơi bằng bàn phím (Enter mở, Esc thu) | Mở và thu được, con trỏ không bị kẹt |
| 9 | Xem chức năng chưa làm | Mờ, có chú thích |
| 10 | Dữ liệu giả hơn 50 phòng, tạo thêm một phòng mới | Mới nhất trước, tối đa 50, tự làm mới |
| 11 | Một phòng đã đủ người xem | Nút Vào xem mờ có chú thích |
| 12 | Nhập chuỗi chứa thẻ HTML, script, "javascript:" vào tên phòng | Hiện nguyên văn như chữ; không có mã nào chạy, không điều hướng |
| 13 | Đối chiếu từng gạch đầu dòng ở phần "Thành phần màn hình phải có" với màn hình thật, và đủ 5 trạng thái ở bảng nghiệm thu | Không thiếu, không thừa; chức năng chưa làm mờ hoặc ẩn đúng quy tắc |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt; dùng được bằng bàn phím; kèm ảnh các trạng thái.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý. Dữ liệu thật của từng chỗ gắn do các task của phòng, bạn bè, ván với máy nối ở task tích hợp tương ứng. Chưa nối máy chủ thật nên **không** coi là tạo phòng thật đã đạt (nối ở T-28).

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** khung điều hướng và Sảnh cho giao diện phòng, bạn bè, ván với máy; Sảnh, hộp thoại tạo phòng và ô nhập mã cho task tích hợp.
**Không thuộc task này:** gọi máy chủ thật (làm ở task nối web với máy chủ); ván với máy; bạn bè; trang Luật chơi riêng; chọn cấp độ máy; mã QR.
**Phục vụ (nguồn):** Story 5, 6, 8, 19, 26; tiêu chí AC-ROOM-01-01, AC-ROOM-01-03, AC-ROOM-05-01, AC-ROOM-05-03, AC-ROOM-08-01, AC-ROOM-08-02, AC-ROOM-08-03, AC-ROOM-08-04, AC-AI-03-02, AC-UI-01-01, AC-UI-02-01, AC-UI-02-02, AC-UI-02-03. Thuộc Epic: Tạo phòng chơi.
**Kết quả (đầu ra):** Thanh điều hướng, Sảnh, biểu mẫu tạo phòng, ô nhập mã, danh sách phòng công khai, Luật chơi, băng quay lại; đủ 5 trạng thái, dữ liệu giả.
**Bằng chứng nộp:** Ảnh chụp trạng thái; kiểm bàn phím. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Chưa nối máy chủ; không coi là tạo phòng thật.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-02, T-07; liên quan tới (relates to) Story 5, Story 6, Story 8, Story 19, Story 26; Epic: Tạo phòng chơi.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **4841_Lê Thị Xuân Nhạn**; Sprint **XIAN Sprint 1**; Fix version **v0.1**; Start date **2026-10-08**; Due date **2026-10-08**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/04-task-e2-tao-phong.md` — T-10.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **4841_Lê Thị Xuân Nhạn**.
* Review/kiểm độc lập dự kiến: **Nguyễn Minh Thư**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-2](https://xiangqi-web.atlassian.net/browse/XIAN-2).

**Phải hoàn tất trước:**

* [T-02 — XIAN-36](https://xiangqi-web.atlassian.net/browse/XIAN-36)
* [T-07 — XIAN-41](https://xiangqi-web.atlassian.net/browse/XIAN-41)

**Story phục vụ:**

* [Story 5 — XIAN-13](https://xiangqi-web.atlassian.net/browse/XIAN-13)
* [Story 6 — XIAN-14](https://xiangqi-web.atlassian.net/browse/XIAN-14)
* [Story 8 — XIAN-16](https://xiangqi-web.atlassian.net/browse/XIAN-16)
* [Story 19 — XIAN-27](https://xiangqi-web.atlassian.net/browse/XIAN-27)
* [Story 26 — XIAN-34](https://xiangqi-web.atlassian.net/browse/XIAN-34)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 4 | 4841_Lê Thị Xuân Nhạn |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 1 | 4841_Lê Thị Xuân Nhạn |
| Review độc lập | 1 | Nguyễn Minh Thư |
| Tổng Original/Remaining Estimate ban đầu | 6 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc phạm vi hẹp/cấu hình/giao diện hoặc nối chức năng đã có đầu vào: ca thực hiện ngắn, kiểm và review riêng. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-08 09:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-08 15:00 |
| Bắt đầu review | 2026-10-08 15:00 |
| Review PASS và bàn giao mục tiêu | 2026-10-08 16:00 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-11 — Giao diện: phòng chờ và màn từ chối vào phòng

**Jira thực:** [XIAN-45](https://xiangqi-web.atlassian.net/browse/XIAN-45) · **Loại:** Task · **Assignee:** 4841_Lê Thị Xuân Nhạn · **Sprint:** XIAN Sprint 1 · **Fix version:** v0.1
**Components:** Frontend · **Priority:** High · **Nhãn:** `P1`, `loi`, `US-ROOM-02`, `US-ROOM-03`, `US-ROOM-04`, `US-ROOM-05`, `US-ROOM-09`, `US-ROOM-12`, `xiangqi-mvp-20261005`, `t-11`
**Ước lượng:** 4.5 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-08 · **Due date:** 2026-10-09 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Tạo phòng chơi · **Components:** Frontend
**Phải xong trước:**

* **T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ**: Gói hợp đồng chung biên dịch được, có danh sách lệnh, thông tin đi kèm, nhóm lỗi và ví dụ hợp lệ/sai dùng được ở cả giao diện và máy chủ.
* **T-07 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)**: Ứng dụng web chạy được, có kiểu chữ/màu Kỳ Đài Cổ Phong, các khối nền (nút, ô nhập, hộp thoại, thông báo, chú thích, khung xương) đủ 5 trạng thái và trang kiểm tra nội bộ.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Dựng **phòng chờ** (hai ghế, nút Sẵn sàng, đếm 3 giây, chia sẻ mã và đường dẫn) và **màn từ chối vào phòng** (nêu lý do và đưa về Sảnh). Mọi thứ hiển thị đúng theo thông tin máy chủ, kể cả khi thông tin đổi lúc đang mở.

**Việc cần làm (làm lần lượt)**

1. **Hai ghế** (Đỏ và Đen) có tên người, chủ phòng, trạng thái Sẵn sàng.
2. **Nút Sẵn sàng**: gửi ý định; **đếm 3 giây** theo mốc máy chủ gửi về; nếu thông tin mới cho thấy ai bỏ sẵn sàng thì dừng đếm. Giao diện **không tự chuyển sang "Đang chơi"**.
3. **Hộp thoại mời:** hiện mã và đường dẫn, nút sao chép; **chỉ người đang ngồi ghế thấy**. Nếu người dùng mất ghế khi hộp đang mở thì phần mời biến mất.
4. Sao chép lỗi (bị từ chối quyền clipboard) thì **không báo "đã sao chép"**, vẫn cho cách dùng thủ công.
5. **Màn từ chối:** phòng đầy, bị đuổi, phòng khoá… mỗi lý do một câu rõ, một nút về Sảnh.
6. Đủ 5 trạng thái, dùng được bằng bàn phím.
7. Nếu mất mạng lúc đếm 3 giây: huỷ đếm, reset Sẵn sàng của cả hai, giữ ghế người mất mạng 60 giây. Nối lại phải bấm Sẵn sàng lại; khi hết đếm kiểm lại ghế/Sẵn sàng/kết nối. Chưa tạo ván thì không ghi kết quả thua. Giao diện dùng sự kiện mẫu; máy chủ thật xử lý ở T-23, tích hợp ở T-28.

**Thành phần màn hình phải có (theo danh mục màn hình, chỉ phần P1 (MVP))**
_Màn hình Phòng chờ_ (`SCR-WAITING-ROOM`)

* Hai **ghế đấu** lớn (Đỏ và Đen) ở giữa; cụm nút phía dưới; khung chat phòng chờ bên phải.
* Chủ phòng mặc định ghế Đỏ; khi còn một mình có nút **Đổi ghế** (Đỏ ↔ Đen tự do); người thứ hai tự vào ghế còn trống.
* Người ngồi ghế có nút **Chuyển sang người xem**; chủ phòng có thêm **Mời xuống ghế** (cho người xem khi còn ghế trống) và nút **Cài đặt phòng**; nút **Chia sẻ phòng** mở hộp thoại mời.
* Nút **Sẵn sàng**; cả hai sẵn sàng thì đếm ngược **3, 2, 1** kèm tiếng gỗ rồi chuyển sang màn ván. Nút Xin đổi bên **ẩn** ở giai đoạn này.
* Chủ phòng rời thì máy chủ chuyển quyền chủ phòng cho người thứ hai.

_Hộp thoại Chia sẻ phòng_ (`MODAL-INVITE`)

* Chỉ người đang ngồi ghế thấy nút mở và mở được hộp thoại.
* **Đường dẫn** và **mã 8 ký tự** (chữ đậm đều nét) kèm nút sao chép; cùng một quyền vào phòng, không phân biệt xem hay chơi.
* Thẻ **Mời bạn bè online**: danh sách bạn kèm trạng thái; nút **Mời** chỉ sáng với bạn Online.
* Khối **mã QR ẩn hẳn** ở giai đoạn này.

_Màn hình Từ chối vào phòng_ (`SCR-ACCESS-DENIED`)

* Thông báo theo lý do: "Phòng thi đấu đã đầy người, vui lòng chọn phòng khác!"; "Bạn đã bị đuổi và chặn tham gia phòng cờ này!"; thông báo phòng đã khoá.
* Chỉ **một nút hành động**: "Quay về Sảnh chính".
* Không lộ thông tin phòng cho người không có quyền.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**

| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
| --- | --- | --- | --- | --- | --- |
| Màn hình Phòng chờ | Ghế/Host/Sẵn sàng đúng trạng thái | Đang nhận thế cờ hiện tại hoặc chuyển ghế | Ghế còn trống: mời bạn hoặc chia sẻ mã | Lệnh lỗi/phiên bản cũ: nhận lại trạng thái | Chưa đủ hai ghế; khoá/chuyển vai không hợp lệ |
| Hộp thoại Chia sẻ phòng | Mã/link hiện hành; QR P2; mời bạn Online | Tải mã/bạn hoặc sao chép | Không bạn Online: vẫn chia sẻ link/mã nếu hợp lệ | Clipboard/lời mời lỗi; báo và cho cách khác | LOCKED/mất ghế; bạn bận/offline; QR ẩn P1 |
| Màn hình Từ chối vào phòng | Thông báo đúng nguyên nhân + về Sảnh | Đợi kết quả kiểm quyền, chưa lộ phòng | Thiếu đích/lý do: thông báo không xác định đích, về Sảnh | Kiểm quyền lỗi: không tự cấp quyền, về Sảnh | Nút đang chuyển trang bị chặn trùng |

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Đang đếm mà một bên bỏ sẵn sàng | Dừng đếm, không có ván |
| Mất ghế khi hộp mời đang mở | Phần mời gỡ ngay |
| Từ chối quyền sao chép | Không báo thành công giả; còn đường dẫn để dùng thủ công |
| Bị từ chối vì đầy / bị đuổi / khoá | Đúng lý do, một nút về Sảnh |

**Cách tự kiểm tra**
Chuẩn bị: dữ liệu giả cho ghế, đếm giờ, thu hồi, quyền.

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Bắt đầu đếm rồi giả lập bỏ sẵn sàng | Dừng đếm, không tạo ván |
| 2 | Mở hộp mời rồi giả lập mất ghế | Phần mời gỡ |
| 3 | Từ chối quyền sao chép | Không báo thành công giả |
| 4 | Xem màn từ chối với từng lý do | Đúng câu chữ, một hành động |
| 5 | Dùng bàn phím và xem 5 trạng thái | Đủ, dùng được |
| 6 | Đối chiếu từng gạch đầu dòng ở phần "Thành phần màn hình phải có" với màn hình thật, và đủ 5 trạng thái ở bảng nghiệm thu | Không thiếu, không thừa; chức năng chưa làm mờ hoặc ẩn đúng quy tắc |
| 7 | Ngắt kết nối một bên trong lúc 3…2…1, nối lại trước hạn rồi thử quá hạn | Đếm huỷ; cả hai chưa sẵn sàng; giữ ghế đúng 60 giây, chưa có ván/kết quả thua; không tự bắt đầu lại |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt, kèm ảnh.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Chưa nối máy chủ thật nên chưa chứng minh vào phòng thật (T-28).

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** phòng chờ và màn từ chối cho cài đặt phòng (T-39), tích hợp và bạn bè.
**Không thuộc task này:** đổi chỗ, khoá, đuổi (T-39), mã QR, xin đổi bên, mời bạn bè.
**Phục vụ (nguồn):** Story 7, 8, 9, 20; tiêu chí AC-ROOM-02-01, AC-ROOM-02-03, AC-ROOM-03-01, AC-ROOM-03-03, AC-ROOM-04-01, AC-ROOM-04-02, AC-ROOM-05-02, AC-ROOM-09-03, AC-ROOM-12-01. Thuộc Epic: Tạo phòng chơi.
**Kết quả (đầu ra):** Phòng chờ (hai ghế, Sẵn sàng, đếm 3 giây), hộp thoại mời, màn từ chối vào phòng; đủ 5 trạng thái, dữ liệu giả.
**Bằng chứng nộp:** Ảnh chụp; kiểm sao chép khi bị từ chối quyền. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Mã QR phải ẩn hẳn.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-02, T-07; liên quan tới (relates to) Story 7, Story 8, Story 9, Story 20; Epic: Tạo phòng chơi.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **4841_Lê Thị Xuân Nhạn**; Sprint **XIAN Sprint 1**; Fix version **v0.1**; Start date **2026-10-08**; Due date **2026-10-09**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/04-task-e2-tao-phong.md` — T-11.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **4841_Lê Thị Xuân Nhạn**.
* Review/kiểm độc lập dự kiến: **Nguyễn Minh Thư**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-2](https://xiangqi-web.atlassian.net/browse/XIAN-2).

**Phải hoàn tất trước:**

* [T-02 — XIAN-36](https://xiangqi-web.atlassian.net/browse/XIAN-36)
* [T-07 — XIAN-41](https://xiangqi-web.atlassian.net/browse/XIAN-41)

**Story phục vụ:**

* [Story 7 — XIAN-15](https://xiangqi-web.atlassian.net/browse/XIAN-15)
* [Story 8 — XIAN-16](https://xiangqi-web.atlassian.net/browse/XIAN-16)
* [Story 9 — XIAN-17](https://xiangqi-web.atlassian.net/browse/XIAN-17)
* [Story 20 — XIAN-28](https://xiangqi-web.atlassian.net/browse/XIAN-28)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 3 | 4841_Lê Thị Xuân Nhạn |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 1 | 4841_Lê Thị Xuân Nhạn |
| Review độc lập | 0.5 | Nguyễn Minh Thư |
| Tổng Original/Remaining Estimate ban đầu | 4.5 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc phạm vi hẹp/cấu hình/giao diện hoặc nối chức năng đã có đầu vào: ca thực hiện ngắn, kiểm và review riêng. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-08 16:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-09 11:00 |
| Bắt đầu review | 2026-10-09 11:00 |
| Review PASS và bàn giao mục tiêu | 2026-10-09 11:30 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-15 — Máy chủ: trạng thái phòng, mỗi người một chỗ chơi và tạo phòng

**Jira thực:** [XIAN-49](https://xiangqi-web.atlassian.net/browse/XIAN-49) · **Loại:** Task · **Assignee:** Võ Thành Đông · **Sprint:** XIAN Sprint 1 · **Fix version:** v0.1
**Components:** Room & Social · **Priority:** High · **Nhãn:** `P1`, `loi`, `US-ROOM-01`, `US-ROOM-04`, `xiangqi-mvp-20261005`, `t-15`
**Ước lượng:** 6 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-09 · **Due date:** 2026-10-10 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Tạo phòng chơi · **Components:** Room & Social
**Phải xong trước:**

* **T-04 — Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập**: Các tệp tạo bảng và quy tắc quyền truy cập chạy được trên cơ sở dữ liệu thử; ràng buộc (một ghế mỗi người, số người xem 0–5, tên không trùng không phân biệt hoa thường).
* **T-06 — Dựng khung máy chủ: nhận kết nối có xác thực và chuyển lệnh**: Máy chủ chạy, nhận kết nối có xác thực, chuyển lệnh theo hợp đồng, có chỗ cắm chốt quyền, hạn phiên, giới hạn tốc độ; mặc định đóng (không có quyền thì không nhận).
* **T-09 — Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ**: Bộ lọc từ cấm dùng chung, cơ chế chống làm hai lần (biên lai theo người gửi và mã yêu cầu), bộ giới hạn tốc độ với các mức đã chốt; kèm ví dụ cách dùng.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

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
9. Kiểm tra dữ liệu: tên 1–60 ký tự và không chứa từ cấm; giờ 5/10/15 (mặc định 10); riêng tư khi tạo luôn CODE_ONLY; không nhận PUBLIC/LOCKED từ yêu cầu tạo; số người xem 0–5 (mặc định 5).
10. Kiểm tra người này **chưa có chỗ chơi nào** khác.
11. Ghi phòng, chủ phòng ngồi ghế Đỏ, mã 8 ký tự không trùng và biên lai, **cùng lúc**; chỉ sau khi ghi xong mới trả kết quả.
12. Trả phòng, mã và đường dẫn mời; chỉ người **đang ngồi ghế** mới đọc được đường dẫn mời và mã.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Một người cùng lúc xin vào phòng người chơi và vào ván với máy | Chỉ một yêu cầu thành công; yêu cầu kia báo "đang có chỗ chơi" |
| Bước sau lỗi sau khi đã xin chỗ | Chỗ được trả lại, không để chỗ ma |
| Thành phần người ngồi ghế thay đổi | Cả hai người đều bị đưa về "chưa sẵn sàng" |
| Gửi lệnh vào phòng đã đóng | Bị bỏ qua, phòng không mở lại, không lộ dữ liệu |
| Trình duyệt khai tên người khác | Không chiếm được chỗ của người đó |
| Dữ liệu hợp lệ | Có phòng, chủ phòng ghế Đỏ, mã 8 ký tự |
| Tên chứa từ cấm hoặc giờ ngoài 5/10/15 | Từ chối, nêu lý do |
| Mất kết quả, gửi lại cùng yêu cầu (dù đã có ghế) | Trả lại đúng phòng đã tạo, không báo "đang có chỗ" như yêu cầu mới |
| Yêu cầu mới khi đã có chỗ chơi | Từ chối, không tạo phòng ma |
| Tạo lần thứ 6 trong 10 phút | Bị chặn; hết cửa sổ thì xét lại |
| Lỗi khi ghi | Không báo thành công giả |
| Người không ở trong phòng xin lấy đường dẫn mời | Không nhận được đường dẫn |
| Cố sửa giờ hoặc số người xem của phòng đã tạo (qua giao diện hoặc gửi thẳng yêu cầu) | Bị từ chối; giờ và số người xem **không đổi được** sau khi tạo |

**Cách tự kiểm tra**
Chuẩn bị: bài thử tự động có thể gửi nhiều yêu cầu cùng lúc.

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Một người xin chỗ phòng và chỗ ván với máy cùng lúc | Đúng một chỗ |
| 2 | Cho một bước sau thất bại | Không còn chỗ ma |
| 3 | Đổi người ngồi ghế | Cả hai về chưa sẵn sàng |
| 4 | Gửi lệnh vào phòng đã đóng | Không mở lại, không dữ liệu trái quyền |
| 5 | Khai tên người khác | Không chiếm được chỗ |
| 6 | Tạo phòng với các giá trị mặc định, rồi các biên (tên 1 và 60 ký tự, giờ 5/10/15, người xem 0 và 5), tên cấm | Hợp lệ tạo được; sai bị từ chối; chủ phòng ghế Đỏ, mã 8 ký tự |
| 7 | Tạo xong, giả vờ mất kết quả, gửi lại cùng yêu cầu | Trả đúng phòng cũ |
| 8 | Người đang ngồi ghế ở một phòng, gửi thêm yêu cầu tạo phòng mới | Máy chủ từ chối, không tạo thêm phòng |
| 9 | Tạo 5 lần rồi lần 6 trong 10 phút; thử lại sau hạn | Lần 6 bị chặn; sau hạn xét lại |
| 10 | Người không ngồi ghế xin đường dẫn; gây lỗi ghi | Không nhận được; không báo thành công giả |
| 11 | Tạo bằng mặc định; cố gửi PUBLIC hoặc LOCKED trong yêu cầu tạo | Phòng mới CODE_ONLY, không xuất hiện ở Sảnh; không tạo phòng PUBLIC/LOCKED bằng dữ liệu sửa tay |
| 12 | Gửi thẳng yêu cầu sửa giờ và số người xem của một phòng đã tạo | Bị từ chối, dữ liệu không đổi |

**Thông tin vào**

| Thông tin | Giá trị hợp lệ |
| --- | --- |
| Tên phòng | 1–60 ký tự, không từ cấm |
| Giờ mỗi bên | 5, 10 hoặc 15 phút (mặc định 10) |
| Riêng tư khi tạo | Cố định CODE_ONLY; không chọn PUBLIC/LOCKED |
| Số người xem tối đa | 0–5 (mặc định 5) |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý. Bài thử với ván máy thật chỉ chạy được sau khi có ván với máy. Ở đây kiểm bằng sổ chỗ chơi.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** trạng thái phòng và sổ chỗ chơi cho tạo phòng, vào phòng, ván với máy, bạn bè; phòng, mã và đường dẫn mời cho vào phòng, riêng tư và giao diện.
**Không thuộc task này:** vào phòng, ghế và Sẵn sàng (các task kế tiếp); đánh hạng; mã QR; giờ "không giới hạn". Thu hồi đường dẫn khi khoá phòng làm ở task kiểu phòng.
**Phục vụ (nguồn):** Story 5, 9; tiêu chí AC-ROOM-01-01, AC-ROOM-01-02, AC-ROOM-01-03, AC-ROOM-01-04, AC-ROOM-04-01. Thuộc Epic: Tạo phòng chơi.
**Kết quả (đầu ra):** Trạng thái phòng, sổ chỗ chơi (mỗi người một chỗ), chức năng tạo phòng có mã 8 ký tự, đường dẫn mời, chống tạo trùng.
**Bằng chứng nộp:** Kết quả thử đồng thời; chỗ chơi trước/sau; mã không trùng. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Giới hạn tạo 5 phòng/10 phút là mức khởi đầu.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-04, T-06, T-09; liên quan tới (relates to) Story 5, Story 9; Epic: Tạo phòng chơi.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Võ Thành Đông**; Sprint **XIAN Sprint 1**; Fix version **v0.1**; Start date **2026-10-09**; Due date **2026-10-10**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/04-task-e2-tao-phong.md` — T-15.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Võ Thành Đông**.
* Review/kiểm độc lập dự kiến: **nguyenhoangtungtuyhoa**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-2](https://xiangqi-web.atlassian.net/browse/XIAN-2).

**Phải hoàn tất trước:**

* [T-04 — XIAN-38](https://xiangqi-web.atlassian.net/browse/XIAN-38)
* [T-06 — XIAN-40](https://xiangqi-web.atlassian.net/browse/XIAN-40)
* [T-09 — XIAN-43](https://xiangqi-web.atlassian.net/browse/XIAN-43)

**Story phục vụ:**

* [Story 5 — XIAN-13](https://xiangqi-web.atlassian.net/browse/XIAN-13)
* [Story 9 — XIAN-17](https://xiangqi-web.atlassian.net/browse/XIAN-17)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 4 | Võ Thành Đông |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 1 | Võ Thành Đông |
| Review độc lập | 1 | nguyenhoangtungtuyhoa |
| Tổng Original/Remaining Estimate ban đầu | 6 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc phạm vi hẹp/cấu hình/giao diện hoặc nối chức năng đã có đầu vào: ca thực hiện ngắn, kiểm và review riêng. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-09 14:30 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-10 10:30 |
| Bắt đầu review | 2026-10-10 10:30 |
| Review PASS và bàn giao mục tiêu | 2026-10-10 11:30 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-19 — Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh

**Jira thực:** [XIAN-53](https://xiangqi-web.atlassian.net/browse/XIAN-53) · **Loại:** Task · **Assignee:** Võ Thành Đông · **Sprint:** XIAN Sprint 1 · **Fix version:** v0.1
**Components:** Room & Social · **Priority:** High · **Nhãn:** `P1`, `loi`, `US-ROOM-02`, `US-ROOM-05`, `US-ROOM-09`, `xiangqi-mvp-20261005`, `t-19`
**Ước lượng:** 3.5 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-10 · **Due date:** 2026-10-10 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Tạo phòng chơi · **Components:** Room & Social
**Phải xong trước:**

* **T-09 — Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ**: Bộ lọc từ cấm dùng chung, cơ chế chống làm hai lần (biên lai theo người gửi và mã yêu cầu), bộ giới hạn tốc độ với các mức đã chốt; kèm ví dụ cách dùng.
* **T-15 — Máy chủ: trạng thái phòng, mỗi người một chỗ chơi và tạo phòng**: Trạng thái phòng, sổ chỗ chơi (mỗi người một chỗ), chức năng tạo phòng có mã 8 ký tự, đường dẫn mời, chống tạo trùng.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Cho người dùng vào phòng và xếp họ đúng chỗ: **ghế trống thì ngồi ghế, hết ghế thì làm người xem, hết cả hai thì từ chối**. Mọi quyết định làm tại thời điểm nhận yêu cầu; đường dẫn không phải "vé giữ chỗ".

**Việc cần làm (làm lần lượt)**

1. Xác định người gửi; nếu yêu cầu đã xử lý (gửi lại), trả kết quả cũ, **không xếp chỗ lần nữa**.
2. Kiểm tra giới hạn nhập sai mã (**10 lần/phút**, quá thì chặn **5 phút**, đếm theo phiên).
3. Tìm phòng bằng mã, đường dẫn hoặc mã phòng từ Sảnh. **Không** tự sửa mã sai thành phòng khác.
4. Kiểm quyền và sức chứa, rồi xếp chỗ:

    * Vào bằng **đường dẫn hoặc mã**: ghế trống → ngồi ghế; hết ghế, còn chỗ xem → người xem; hết cả hai → từ chối.
    * Vào từ **Sảnh**: luôn là **người xem** (kể cả còn ghế); hết chỗ xem thì từ chối.
    * Người đã bị đuổi hoặc phòng đã khoá/đóng: từ chối.

5. Trả thông tin phòng theo quyền của người đó; lỗi không lộ dữ liệu.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Vào bằng mã khi còn ghế / hết ghế còn chỗ xem | Ngồi ghế / làm người xem, có thông báo |
| Phòng đầy cả ghế và chỗ xem (hoặc số người xem là 0) | Từ chối với lỗi thật; hai người tranh chỗ cuối thì chỉ một vào được |
| Người vào phòng từ Sảnh dù phòng còn ghế trống | Vẫn vào làm người xem (muốn ngồi phải đăng ký ghế riêng) |
| Bị đuổi, phòng khoá hoặc đường dẫn đã thu hồi | Không có tư cách nào, không nhận dữ liệu |
| Mất kết quả, gửi lại sau khi ghế đã kín | Không xếp thêm; không trả dữ liệu ngoài quyền |
| Sai mã đến lần thứ 10 trong 1 phút | Chặn 5 phút, theo từng phiên; hết chặn thì xét lại |

**Cách tự kiểm tra**

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Vào bằng đường dẫn khi còn ghế, rồi khi ghế kín | Ngồi ghế; rồi làm người xem |
| 2 | Vào phòng đầy; hai người tranh chỗ cuối | Không vượt sức chứa; người thua nhận lỗi thật |
| 3 | Vào từ Sảnh khi còn ghế | Làm người xem |
| 4 | Người đã bị đuổi, phòng đã khoá vào lại (dùng dữ liệu mẫu) | Không được vào |
| 5 | Gửi lại cùng yêu cầu sau khi ghế đã kín | Không có chỗ mới |
| 6 | Nhập sai mã 10 lần; thử phiên khác; thử sau 5 phút | Chặn riêng từng phiên; hết hạn thì xét lại |
| 7 | Thử phòng N=0, N=1 và N=5; với N=5 đủ 2 người chơi + 5 người xem rồi gửi thêm nhiều yêu cầu vào đồng thời | Không vượt trần từng phòng; N=5 tối đa 7 người, người xem thứ 6 bị từ chối; không dùng demo N=2 thay ca trần 5 |

**Khi nào chuyển cho người kiểm thử:** cả 6 dòng đạt, gồm bộ giới hạn thật.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Ở đây việc "bị đuổi" và "khoá" kiểm bằng dữ liệu mẫu; chạy thật nghiệm thu ở task tích hợp phòng nâng cao (T-46).

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** chức năng vào phòng cho ghế, riêng tư, chat, bạn bè.
**Không thuộc task này:** tự xuống ghế từ vai xem (T-44), mã QR, khách.
**Phục vụ (nguồn):** Story 7, 8, 20; tiêu chí AC-AUTH-06-02, AC-FRIEND-04-04, AC-ROOM-02-02, AC-ROOM-05-01, AC-ROOM-05-02, AC-ROOM-05-03, AC-ROOM-05-04, AC-ROOM-09-03, AC-ROOM-11-03, AC-ROOM-12-01. Thuộc Epic: Tạo phòng chơi.
**Kết quả (đầu ra):** Chức năng vào phòng bằng mã, đường dẫn, Sảnh: xếp ghế hoặc người xem, kiểm sức chứa, chặn sai mã.
**Bằng chứng nộp:** Ma trận nguồn vào × vai; kết quả thử chặn 10 lần sai/phút. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Việc "bị đuổi" và "khoá" lúc này dùng dữ liệu mẫu; chạy thật ở task nối nâng cao.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-09, T-15; liên quan tới (relates to) Story 7, Story 8, Story 9, Story 12, Story 20; Epic: Tạo phòng chơi.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Võ Thành Đông**; Sprint **XIAN Sprint 1**; Fix version **v0.1**; Start date **2026-10-10**; Due date **2026-10-10**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/04-task-e2-tao-phong.md` — T-19.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Võ Thành Đông**.
* Review/kiểm độc lập dự kiến: **Tưởng Lê khoa Cường-4572**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-2](https://xiangqi-web.atlassian.net/browse/XIAN-2).

**Phải hoàn tất trước:**

* [T-09 — XIAN-43](https://xiangqi-web.atlassian.net/browse/XIAN-43)
* [T-15 — XIAN-49](https://xiangqi-web.atlassian.net/browse/XIAN-49)

**Story phục vụ:**

* [Story 7 — XIAN-15](https://xiangqi-web.atlassian.net/browse/XIAN-15)
* [Story 8 — XIAN-16](https://xiangqi-web.atlassian.net/browse/XIAN-16)
* [Story 9 — XIAN-17](https://xiangqi-web.atlassian.net/browse/XIAN-17)
* [Story 12 — XIAN-20](https://xiangqi-web.atlassian.net/browse/XIAN-20)
* [Story 20 — XIAN-28](https://xiangqi-web.atlassian.net/browse/XIAN-28)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 2.5 | Võ Thành Đông |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 0.5 | Võ Thành Đông |
| Review độc lập | 0.5 | Tưởng Lê khoa Cường-4572 |
| Tổng Original/Remaining Estimate ban đầu | 3.5 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc phạm vi hẹp/cấu hình/giao diện hoặc nối chức năng đã có đầu vào: ca thực hiện ngắn, kiểm và review riêng. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-10 11:30 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-10 15:30 |
| Bắt đầu review | 2026-10-10 15:30 |
| Review PASS và bàn giao mục tiêu | 2026-10-10 16:00 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-23 — Máy chủ: chọn ghế, Sẵn sàng, đếm 3 giây, bắt đầu ván

**Jira thực:** [XIAN-57](https://xiangqi-web.atlassian.net/browse/XIAN-57) · **Loại:** Task · **Assignee:** Võ Thành Đông · **Sprint:** XIAN Sprint 2 · **Fix version:** v0.2
**Components:** Room & Social · **Priority:** High · **Nhãn:** `P1`, `loi`, `US-ROOM-02`, `US-ROOM-03`, `xiangqi-mvp-20261005`, `t-23`
**Ước lượng:** 4.5 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-13 · **Due date:** 2026-10-13 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Tạo phòng chơi · **Components:** Room & Social
**Phải xong trước:**

* **T-05 — Luật cờ: mô hình bàn cờ, thế khởi đầu, nước đi của từng loại quân**: Gói luật cờ: kiểu quân, toạ độ, thế khởi đầu, nước đi từng loại quân, độc lập với giao diện.
* **T-19 — Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh**: Chức năng vào phòng bằng mã, đường dẫn, Sảnh: xếp ghế hoặc người xem, kiểm sức chứa, chặn sai mã.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Chủ phòng chọn ghế Đỏ/Đen, hai người bấm **Sẵn sàng**, đếm ngược **3 giây**, rồi **bắt đầu ván**: tạo đúng một ván với thế cờ ban đầu. Nếu trong lúc đếm có ai bỏ "Sẵn sàng" hay rời đi thì **không tạo ván**.

**Việc cần làm (làm lần lượt)**

1. **Chọn ghế:** chủ phòng khi còn một mình có thể đổi giữa Đỏ và Đen; người thứ hai vào ghế còn lại. Đổi người ngồi ghế thì **cả hai về chưa sẵn sàng**.
2. **Sẵn sàng:** mỗi người ngồi ghế bật hoặc tắt; người xem không có quyền này.
3. Khi cả hai sẵn sàng, bắt đầu **đếm ngược 3 giây** theo đồng hồ máy chủ. Mọi thay đổi làm huỷ đếm cũ (và đếm cũ không được chạy tiếp).
4. Hết 3 giây, **kiểm lại điều kiện** (đủ hai người, cả hai còn sẵn sàng), rồi tạo **một** ván: thế cờ ban đầu, lượt Đỏ, mức giờ, thời điểm bắt đầu do máy chủ ghi; phòng sang "Đang chơi".
5. Ghi xong mới phát tín hiệu bắt đầu; ghi lỗi thì **không** phát tín hiệu giả.
6. Nếu mất mạng lúc đếm 3 giây: huỷ đếm, reset Sẵn sàng của cả hai, giữ ghế người mất mạng 60 giây. Nối lại phải bấm Sẵn sàng lại; khi hết đếm kiểm lại ghế/Sẵn sàng/kết nối. Chưa tạo ván thì không ghi kết quả thua. Không dùng bộ hẹn giờ cũ để tạo ván sau khi đã huỷ.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Hai người sẵn sàng đủ 3 giây | Đúng một ván: thế ban đầu, lượt Đỏ, mức giờ, thời điểm bắt đầu |
| Bỏ sẵn sàng hoặc rời ngay trước hạn | Huỷ đếm, không có ván |
| Bộ hẹn giờ đếm 3-2-1 cũ chạy muộn, hoặc chạy hai lần | Không tạo ra ván thứ hai |
| Người xem (không ngồi ghế) dùng công cụ gửi lệnh "sẵn sàng" | Máy chủ từ chối |
| Ghi ván lỗi | Hoàn tác, không phát bắt đầu giả |

**Cách tự kiểm tra**
Chuẩn bị: đồng hồ giả để rút ngắn 3 giây.

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Chủ phòng một mình đổi Đỏ/Đen; thay người ngồi rồi bấm sẵn sàng | Ghế đúng; thay người thì hai bên về chưa sẵn sàng |
| 2 | Cả hai sẵn sàng đủ 3 giây | Một ván, thế ban đầu đúng, lượt Đỏ, có mức giờ và thời điểm bắt đầu |
| 3 | Bỏ sẵn sàng sát hạn; gọi lại lệnh cũ | Không có ván |
| 4 | Người xem bấm; gây lỗi ghi | Từ chối; hoàn tác |
| 5 | Ngắt kết nối một bên trong lúc 3…2…1, nối lại trước hạn rồi thử quá hạn | Đếm huỷ; cả hai chưa sẵn sàng; giữ ghế đúng 60 giây, chưa có ván/kết quả thua; không tự bắt đầu lại |

**Khi nào chuyển cho người kiểm thử:** mọi dòng trong bảng tự kiểm tra đạt.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Task này chỉ **khởi tạo** ván; đồng hồ chạy thật và xử lý nước đi do các task ván làm.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** ván vừa bắt đầu (mã ván, thế cờ, lượt, mốc giờ) cho Epic Hai người đánh cờ qua mạng.
**Không thuộc task này:** đồng hồ chạy, nước đi, xin đổi bên, tái đấu.
**Phục vụ (nguồn):** Story 7; tiêu chí AC-ROOM-02-01, AC-ROOM-02-02, AC-ROOM-02-03, AC-ROOM-03-01, AC-ROOM-03-02, AC-ROOM-03-03. Thuộc Epic: Tạo phòng chơi.
**Kết quả (đầu ra):** Chọn ghế, Sẵn sàng, đếm 3 giây, tạo đúng một ván với thế ban đầu và lượt Đỏ; huỷ đếm khi điều kiện đổi. Mất mạng khi đếm huỷ/reset cả hai Sẵn sàng và giữ ghế 60 giây; chưa có ván không tạo thua.
**Bằng chứng nộp:** Dòng thời gian máy chủ; mã ván; kết quả thử huỷ. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Chưa chạy đồng hồ ván (làm ở task đồng hồ).
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-05, T-19; liên quan tới (relates to) Story 7; Epic: Tạo phòng chơi.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Võ Thành Đông**; Sprint **XIAN Sprint 2**; Fix version **v0.2**; Start date **2026-10-13**; Due date **2026-10-13**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/04-task-e2-tao-phong.md` — T-23.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Võ Thành Đông**.
* Review/kiểm độc lập dự kiến: **nguyenhoangtungtuyhoa**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-2](https://xiangqi-web.atlassian.net/browse/XIAN-2).

**Phải hoàn tất trước:**

* [T-05 — XIAN-39](https://xiangqi-web.atlassian.net/browse/XIAN-39)
* [T-19 — XIAN-53](https://xiangqi-web.atlassian.net/browse/XIAN-53)

**Story phục vụ:**

* [Story 7 — XIAN-15](https://xiangqi-web.atlassian.net/browse/XIAN-15)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 3 | Võ Thành Đông |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 1 | Võ Thành Đông |
| Review độc lập | 0.5 | nguyenhoangtungtuyhoa |
| Tổng Original/Remaining Estimate ban đầu | 4.5 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc phạm vi hẹp/cấu hình/giao diện hoặc nối chức năng đã có đầu vào: ca thực hiện ngắn, kiểm và review riêng. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-13 09:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-13 14:00 |
| Bắt đầu review | 2026-10-13 14:00 |
| Review PASS và bàn giao mục tiêu | 2026-10-13 14:30 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-28 — Nối web với máy chủ: tạo phòng, vào phòng, ghế, Sẵn sàng, bắt đầu ván

**Jira thực:** [XIAN-62](https://xiangqi-web.atlassian.net/browse/XIAN-62) · **Loại:** Task · **Assignee:** 4841_Lê Thị Xuân Nhạn · **Sprint:** XIAN Sprint 2 · **Fix version:** v0.2
**Components:** Frontend, Room & Social · **Priority:** High · **Nhãn:** `P1`, `loi`, `integration`, `US-ROOM-01`, `US-ROOM-02`, `US-ROOM-03`, `US-ROOM-05`, `xiangqi-mvp-20261005`, `t-28`
**Ước lượng:** 4.5 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-14 · **Due date:** 2026-10-15 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Tạo phòng chơi · **Components:** Frontend, Room & Social
**Phải xong trước:**

* **T-10 — Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng**: Thanh điều hướng, Sảnh, biểu mẫu tạo phòng, ô nhập mã, danh sách phòng công khai, Luật chơi, băng quay lại; đủ 5 trạng thái, dữ liệu giả.
* **T-11 — Giao diện: phòng chờ và màn từ chối vào phòng**: Phòng chờ (hai ghế, Sẵn sàng, đếm 3 giây), hộp thoại mời, màn từ chối vào phòng; đủ 5 trạng thái, dữ liệu giả.
* **T-23 — Máy chủ: chọn ghế, Sẵn sàng, đếm 3 giây, bắt đầu ván**: Chọn ghế, Sẵn sàng, đếm 3 giây, tạo đúng một ván với thế ban đầu và lượt Đỏ; huỷ đếm khi điều kiện đổi. Mất mạng khi đếm huỷ/reset cả hai Sẵn sàng và giữ ghế 60 giây; chưa có ván không tạo thua.
* **T-25 — Nối web với máy chủ: đăng ký, đăng nhập, hồ sơ**: Đăng ký, đăng nhập, hồ sơ, đăng xuất chạy trọn trên môi trường thử với email thật. Luồng Google chạy trọn.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Nối giao diện với máy chủ thật để chứng minh **hai người, trên hai trình duyệt, vào cùng một phòng và bắt đầu ván**. Đây là điểm kiểm tra đầu tiên rằng web và máy chủ khớp nhau.

**Việc cần làm (làm lần lượt)**

1. Nối hộp thoại tạo phòng, ô nhập mã, phòng chờ với chức năng thật ở máy chủ (không dùng dữ liệu giả).
2. Dùng tài khoản thử và cách xác thực thử **cô lập**, có ghi rõ là thử; **không** bật cách bỏ qua kiểm tra trên sản phẩm.
3. Chạy kịch bản hai người: A tạo phòng, B vào bằng mã hoặc đường dẫn, cả hai Sẵn sàng.
4. So sánh dữ liệu hai phía: cùng mã ván, thế cờ, lượt đi, thời điểm bắt đầu.
5. Thử huỷ đếm, tranh chỗ cuối, gửi lại yêu cầu khi mất phản hồi.
6. Dùng **hai tài khoản hoàn tất đăng nhập thật qua T-25**, không thay xác thực bằng danh tính mẫu. Kiểm tạo CODE_ONLY, vào bằng mã/link, mất mạng trong đếm rồi nối lại: cả hai phải Sẵn sàng lại, chưa tạo ván không có kết quả thua.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| A tạo phòng, B vào bằng mã/đường dẫn | Cùng phòng; A là chủ phòng ghế Đỏ, B ở ghế còn lại |
| Hai bên sẵn sàng đủ 3 giây | Hai phía cùng mã ván, thế cờ, lượt Đỏ, thời điểm bắt đầu |
| Một bên bỏ sẵn sàng trước hạn | Không có ván |
| Tranh chỗ cuối; gửi lại khi mất phản hồi | Không vượt sức chứa, không nhân đôi |

**Cách tự kiểm tra**
Chuẩn bị: máy chủ và web chạy thử, hai trình duyệt (hai tài khoản thử).

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | A tạo phòng, B vào bằng giao diện | Cùng phòng, A Đỏ chủ phòng |
| 2 | Cả hai sẵn sàng đủ 3 giây | Cùng mã ván, thế cờ, lượt, thời điểm bắt đầu |
| 3 | Một bên bỏ sẵn sàng trước hạn | Không có ván |
| 4 | Tranh chỗ cuối; mất phản hồi rồi gửi lại | Không vượt chỗ, không nhân đôi |

**Khi nào chuyển cho người kiểm thử:** cả 4 dòng đạt trên môi trường thử, kèm video.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. **Chưa** gồm đồng hồ chạy và nước đi (task ván), cũng chưa kiểm người dùng chưa hoàn tất đăng ký.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** luồng phòng cơ bản chạy thật cho task đi nước đầu tiên và các task phòng nâng cao.
**Không thuộc task này:** khoá, đuổi, đổi chỗ (T-46), đồng hồ ván, đăng nhập thật (T-25).
**Phục vụ (nguồn):** Story 5, 7, 8; tiêu chí AC-ROOM-01-01, AC-ROOM-01-02, AC-ROOM-02-01, AC-ROOM-03-02, AC-ROOM-03-03, AC-ROOM-05-01. Thuộc Epic: Tạo phòng chơi.
**Kết quả (đầu ra):** Hai người tạo phòng, vào phòng, ngồi ghế, Sẵn sàng và bắt đầu ván trên hai trình duyệt thật.
**Bằng chứng nộp:** Video và báo cáo Playwright nhiều trình duyệt. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Dùng tài khoản thử và xác thực cô lập; không dùng cách bỏ qua kiểm tra trên sản phẩm.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-10, T-11, T-23, T-25; liên quan tới (relates to) Story 5, Story 7, Story 8; Epic: Tạo phòng chơi.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **4841_Lê Thị Xuân Nhạn**; Sprint **XIAN Sprint 2**; Fix version **v0.2**; Start date **2026-10-14**; Due date **2026-10-15**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/04-task-e2-tao-phong.md` — T-28.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **4841_Lê Thị Xuân Nhạn**.
* Review/kiểm độc lập dự kiến: **Nguyễn Minh Thư**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-2](https://xiangqi-web.atlassian.net/browse/XIAN-2).

**Phải hoàn tất trước:**

* [T-10 — XIAN-44](https://xiangqi-web.atlassian.net/browse/XIAN-44)
* [T-11 — XIAN-45](https://xiangqi-web.atlassian.net/browse/XIAN-45)
* [T-23 — XIAN-57](https://xiangqi-web.atlassian.net/browse/XIAN-57)
* [T-25 — XIAN-59](https://xiangqi-web.atlassian.net/browse/XIAN-59)

**Story phục vụ:**

* [Story 5 — XIAN-13](https://xiangqi-web.atlassian.net/browse/XIAN-13)
* [Story 7 — XIAN-15](https://xiangqi-web.atlassian.net/browse/XIAN-15)
* [Story 8 — XIAN-16](https://xiangqi-web.atlassian.net/browse/XIAN-16)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 3 | 4841_Lê Thị Xuân Nhạn |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 1 | 4841_Lê Thị Xuân Nhạn |
| Review độc lập | 0.5 | Nguyễn Minh Thư |
| Tổng Original/Remaining Estimate ban đầu | 4.5 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc phạm vi hẹp/cấu hình/giao diện hoặc nối chức năng đã có đầu vào: ca thực hiện ngắn, kiểm và review riêng. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-14 15:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-15 10:00 |
| Bắt đầu review | 2026-10-15 10:00 |
| Review PASS và bàn giao mục tiêu | 2026-10-15 10:30 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---
