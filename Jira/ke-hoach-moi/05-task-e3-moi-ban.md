# Task của Epic "Mời bạn vào phòng chơi" (5 task)

**Ngày cập nhật:** 2026-10-05 · **Trạng thái:** đã được PO cho phép tạo và phân công ngày 05/10/2026 · Đã tạo Epic/Story/Task trên XIAN · Viết theo `00-chuan-description.md` và mẫu `00b`.

Mã task `T-01` đến `T-64` đánh theo **thứ tự làm** (số nhỏ làm trước, mỗi task chỉ cần các task có số nhỏ hơn). Một số task gộp nhiều việc nhỏ cùng mục đích thành một task. Ngày Sprint: 1 = 04/10–07/10, 2 = 08/10–10/10, 3 = 11/10–14/10, 4 = 15/10–17/10.

---

### T-40 — Giao diện: bạn bè (tìm, lời mời, danh sách, mời vào phòng)

**Jira thực:** [XIAN-74](https://xiangqi-web.atlassian.net/browse/XIAN-74) · **Loại:** Task · **Assignee:** 4841_Lê Thị Xuân Nhạn · **Sprint:** XIAN Sprint 3 · **Fix version:** v0.3
**Components:** Frontend, Room & Social · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `US-FRIEND-01`, `US-FRIEND-02`, `US-FRIEND-03`, `US-FRIEND-04`, `US-FRIEND-05`, `xiangqi-mvp-20261005`, `t-40`
**Ước lượng:** 6 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-20 · **Due date:** 2026-10-20 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Mời bạn vào phòng chơi · **Components:** Frontend, Room & Social
**Phải xong trước:**

* **T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ**: Gói hợp đồng chung biên dịch được, có danh sách lệnh, thông tin đi kèm, nhóm lỗi và ví dụ hợp lệ/sai dùng được ở cả giao diện và máy chủ.
* **T-07 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)**: Ứng dụng web chạy được, có kiểu chữ/màu Kỳ Đài Cổ Phong, các khối nền (nút, ô nhập, hộp thoại, thông báo, chú thích, khung xương) đủ 5 trạng thái và trang kiểm tra nội bộ.
* **T-10 — Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng**: Thanh điều hướng, Sảnh, biểu mẫu tạo phòng, ô nhập mã, danh sách phòng công khai, Luật chơi, băng quay lại; đủ 5 trạng thái, dữ liệu giả.
* **T-11 — Giao diện: phòng chờ và màn từ chối vào phòng**: Phòng chờ (hai ghế, Sẵn sàng, đếm 3 giây), hộp thoại mời, màn từ chối vào phòng; đủ 5 trạng thái, dữ liệu giả.
* **T-34 — Nghiệm thu bản chơi được: đăng ký, tạo phòng, mời, đánh online và đánh với máy chạy trọn**: Bản chơi được đã PASS M1–M4 trên bản chạy thật; báo cáo hoàn tất nhưng chưa đạt không mở phần làm sau, trừ PO cho phép rõ ràng.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Dựng tìm kiếm, **chuông lời mời** và **danh sách bạn**. Việc **mời vào phòng** chỉ xuất hiện trong hộp thoại mời của phòng, đúng quy tắc. Dữ liệu giả; nối thật ở T-52.

**Việc cần làm (làm lần lượt)**

1. Dựng ô tìm người, chuông lời mời, trang Bạn bè (danh sách và nút huỷ kết bạn) với 5 trạng thái.
2. Đặt nút **Mời** trong **hộp thoại mời của phòng** (chỉ hiện ở đó). Lý do bận, ngoại tuyến, hoặc đạt giới hạn hiện bằng chú thích; **Nhắn tin** và **Thách đấu** mờ với chú thích "Sắp ra mắt".
3. Thông báo nhận lời mời có **đếm lùi 30 giây** theo thời gian máy chủ gửi về, tự tắt khi hết.
4. Chỉ báo "thành công" **sau khi** máy chủ xác nhận; mất xác nhận thì có thông báo và nút "Thử lại".
5. Ghép chuông vào khung đã có ở T-10 và danh sách mời vào hộp thoại ở T-11; **không dựng thêm trang hay hộp thoại thứ hai**.

**Thành phần màn hình phải có (theo danh mục màn hình, chỉ phần P1 (MVP))**
_Màn hình Bạn bè_ (`SCR-FRIENDS`)

* Ô tìm theo tên đăng nhập (phần đầu, không phân biệt hoa thường) và nút **Kết bạn**; thẻ kết quả có ảnh đại diện, tên hiển thị, @tên.
* Thẻ **Danh sách bạn bè**: ảnh, tên, @tên, trạng thái 🟢 Online / 🟠 Đang đấu / ⚫ Ngoại tuyến; nút **Huỷ kết bạn**; nút **Nhắn tin** và **Thách đấu** mờ "Sắp ra mắt"; **không có nút mời vào phòng** ở trang này.
* Thẻ **Lời mời đang chờ**: nút **Chấp nhận** và **Từ chối**; chuông lời mời ở thanh điều hướng.
* Nút Kết bạn mờ kèm chú thích khi đạt giới hạn 200 bạn hoặc 50 lời mời chờ.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**

| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
| --- | --- | --- | --- | --- | --- |
| Màn hình Bạn bè | Bạn/lời mời/trạng thái đúng | Tải hoặc tìm kiếm | Chưa có bạn/kết quả: hướng dẫn tìm username | Tải/gửi/nhận lỗi; giữ nguyên thao tác đã làm; kiểm lại với máy chủ rồi mới gửi lại | Đã đủ số bạn tối đa, bị từ chối hai lần; bạn không Online |

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Mở trang Bạn bè và hộp thoại mời phòng | Chỉ hộp thoại phòng có nút Mời |
| Bạn Online / Đang đấu / Ngoại tuyến; đạt giới hạn | Nút và chú thích đúng |
| Chấp nhận / từ chối / hết 30 giây | Đúng hành động; hết hạn tự tắt |
| Tải hoặc gửi lỗi, mất xác nhận | Không hiện bạn mới giả; có thông báo và "Thử lại" |
| Mở chuông trên khung Sảnh, mời từ phòng chờ, mở trang Bạn bè | Một chuông, một hộp thoại, đúng vị trí; trang Bạn bè không có nút mời vào phòng |
| Bạn còn ghế đang chờ / đang chơi / đã kết thúc, hoặc chơi với máy | Nhãn "Đang đấu"; nút Mời mờ có chú thích; không thành "Online rảnh" chỉ vì ván đã kết thúc |

**Cách tự kiểm tra**
Chuẩn bị: dữ liệu giả cho ba trạng thái, lỗi, giới hạn.

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Mở trang Bạn bè và hộp thoại mời | Chỉ hộp thoại phòng có nút Mời |
| 2 | Xem ba trạng thái và đạt giới hạn | Nút, chú thích đúng |
| 3 | Chấp nhận, từ chối, chờ hết 30 giây | Đúng, tự tắt |
| 4 | Giả lập lỗi và mất xác nhận | Có "Thử lại", không bạn giả |
| 5 | Mở chuông, mời từ phòng chờ, mở trang Bạn bè | Đúng vị trí, không trùng |
| 6 | Bạn đang giữ chỗ | Nhãn Đang đấu, nút mờ có chú thích |
| 7 | Đối chiếu từng gạch đầu dòng ở phần "Thành phần màn hình phải có" với màn hình thật, và đủ 5 trạng thái ở bảng nghiệm thu | Không thiếu, không thừa; chức năng chưa làm mờ hoặc ẩn đúng quy tắc |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt, đủ 5 trạng thái, kèm ảnh.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Toàn luồng thật nghiệm thu ở T-52.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** giao diện bạn bè cho tích hợp.
**Không thuộc task này:** gọi máy chủ thật, điểm Elo, nhắn tin 1-1, thách đấu.
**Phục vụ (nguồn):** Story 10, 11, 12; tiêu chí AC-FRIEND-01-01, AC-FRIEND-01-02, AC-FRIEND-02-01, AC-FRIEND-03-01, AC-FRIEND-03-02, AC-FRIEND-04-01, AC-FRIEND-04-02, AC-FRIEND-04-03, AC-FRIEND-05-01. Thuộc Epic: Mời bạn vào phòng chơi.
**Kết quả (đầu ra):** Giao diện bạn bè: tìm, lời mời, chuông, danh sách, nút Nhắn tin/Thách đấu mờ, nút Mời trong hộp thoại phòng, thông báo đếm lùi 30 giây; đủ 5 trạng thái, dữ liệu giả.
**Bằng chứng nộp:** Ảnh chụp trạng thái; kiểm bàn phím. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Chưa nối máy chủ.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-02, T-07, T-10, T-11, T-34; liên quan tới (relates to) Story 10, Story 11, Story 12; Epic: Mời bạn vào phòng chơi.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **4841_Lê Thị Xuân Nhạn**; Sprint **XIAN Sprint 3**; Fix version **v0.3**; Start date **2026-10-20**; Due date **2026-10-20**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/05-task-e3-moi-ban.md` — T-40.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **4841_Lê Thị Xuân Nhạn**.
* Review/kiểm độc lập dự kiến: **Nguyễn Minh Thư**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-3](https://xiangqi-web.atlassian.net/browse/XIAN-3).

**Phải hoàn tất trước:**

* [T-02 — XIAN-36](https://xiangqi-web.atlassian.net/browse/XIAN-36)
* [T-07 — XIAN-41](https://xiangqi-web.atlassian.net/browse/XIAN-41)
* [T-10 — XIAN-44](https://xiangqi-web.atlassian.net/browse/XIAN-44)
* [T-11 — XIAN-45](https://xiangqi-web.atlassian.net/browse/XIAN-45)
* [T-34 — XIAN-68](https://xiangqi-web.atlassian.net/browse/XIAN-68)

**Story phục vụ:**

* [Story 10 — XIAN-18](https://xiangqi-web.atlassian.net/browse/XIAN-18)
* [Story 11 — XIAN-19](https://xiangqi-web.atlassian.net/browse/XIAN-19)
* [Story 12 — XIAN-20](https://xiangqi-web.atlassian.net/browse/XIAN-20)

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
| Bắt đầu thực hiện | 2026-10-20 09:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-20 15:00 |
| Bắt đầu review | 2026-10-20 15:00 |
| Review PASS và bàn giao mục tiêu | 2026-10-20 16:00 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-41 — Máy chủ: kết bạn, lời mời và danh sách bạn có trạng thái

**Jira thực:** [XIAN-75](https://xiangqi-web.atlassian.net/browse/XIAN-75) · **Loại:** Task · **Assignee:** Võ Thành Đông · **Sprint:** XIAN Sprint 3 · **Fix version:** v0.3
**Components:** Room & Social · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `US-FRIEND-01`, `US-FRIEND-02`, `US-FRIEND-03`, `US-FRIEND-05`, `xiangqi-mvp-20261005`, `t-41`
**Ước lượng:** 6 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-21 · **Due date:** 2026-10-21 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Mời bạn vào phòng chơi · **Components:** Room & Social
**Phải xong trước:**

* **T-04 — Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập**: Các tệp tạo bảng và quy tắc quyền truy cập chạy được trên cơ sở dữ liệu thử; ràng buộc (một ghế mỗi người, số người xem 0–5, tên không trùng không phân biệt hoa thường).
* **T-06 — Dựng khung máy chủ: nhận kết nối có xác thực và chuyển lệnh**: Máy chủ chạy, nhận kết nối có xác thực, chuyển lệnh theo hợp đồng, có chỗ cắm chốt quyền, hạn phiên, giới hạn tốc độ; mặc định đóng (không có quyền thì không nhận).
* **T-09 — Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ**: Bộ lọc từ cấm dùng chung, cơ chế chống làm hai lần (biên lai theo người gửi và mã yêu cầu), bộ giới hạn tốc độ với các mức đã chốt; kèm ví dụ cách dùng.
* **T-15 — Máy chủ: trạng thái phòng, mỗi người một chỗ chơi và tạo phòng**: Trạng thái phòng, sổ chỗ chơi (mỗi người một chỗ), chức năng tạo phòng có mã 8 ký tự, đường dẫn mời, chống tạo trùng.
* **T-34 — Nghiệm thu bản chơi được: đăng ký, tạo phòng, mời, đánh online và đánh với máy chạy trọn**: Bản chơi được đã PASS M1–M4 trên bản chạy thật; báo cáo hoàn tất nhưng chưa đạt không mở phần làm sau, trừ PO cho phép rõ ràng.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

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
| --- | --- |
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
| --- | --- | --- |
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

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** vòng đời bạn bè cho danh sách bạn, mời vào phòng, giao diện, tích hợp; danh sách bạn và trạng thái cho mời vào phòng, giao diện bạn bè, tích hợp.
**Không thuộc task này:** nhắn tin 1-1; thách đấu; điểm Elo; khách; lịch sử đấu của bạn; giao diện.
**Phục vụ (nguồn):** Story 10, 11; tiêu chí AC-FRIEND-01-01, AC-FRIEND-01-02, AC-FRIEND-02-01, AC-FRIEND-02-02, AC-FRIEND-03-01, AC-FRIEND-03-03, AC-FRIEND-05-01, AC-FRIEND-05-02. Thuộc Epic: Mời bạn vào phòng chơi.
**Kết quả (đầu ra):** Vòng đời kết bạn (tìm, mời, thu hồi, chấp nhận, từ chối, hết hạn), giới hạn 200 bạn/50 lời mời, danh sách bạn có trạng thái, huỷ kết bạn.
**Bằng chứng nộp:** Kết quả thử 8 ca của bảng; thử đồng thời hai đầu. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Trạng thái "đang đấu" cần sổ chỗ chơi (task phòng).
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-04, T-06, T-09, T-15, T-34; liên quan tới (relates to) Story 10, Story 11; Epic: Mời bạn vào phòng chơi.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Võ Thành Đông**; Sprint **XIAN Sprint 3**; Fix version **v0.3**; Start date **2026-10-21**; Due date **2026-10-21**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/05-task-e3-moi-ban.md` — T-41.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Võ Thành Đông**.
* Review/kiểm độc lập dự kiến: **Tưởng Lê khoa Cường-4572**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-3](https://xiangqi-web.atlassian.net/browse/XIAN-3).

**Phải hoàn tất trước:**

* [T-04 — XIAN-38](https://xiangqi-web.atlassian.net/browse/XIAN-38)
* [T-06 — XIAN-40](https://xiangqi-web.atlassian.net/browse/XIAN-40)
* [T-09 — XIAN-43](https://xiangqi-web.atlassian.net/browse/XIAN-43)
* [T-15 — XIAN-49](https://xiangqi-web.atlassian.net/browse/XIAN-49)
* [T-34 — XIAN-68](https://xiangqi-web.atlassian.net/browse/XIAN-68)

**Story phục vụ:**

* [Story 10 — XIAN-18](https://xiangqi-web.atlassian.net/browse/XIAN-18)
* [Story 11 — XIAN-19](https://xiangqi-web.atlassian.net/browse/XIAN-19)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 4 | Võ Thành Đông |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 1 | Võ Thành Đông |
| Review độc lập | 1 | Tưởng Lê khoa Cường-4572 |
| Tổng Original/Remaining Estimate ban đầu | 6 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc phạm vi hẹp/cấu hình/giao diện hoặc nối chức năng đã có đầu vào: ca thực hiện ngắn, kiểm và review riêng. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-21 09:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-21 15:00 |
| Bắt đầu review | 2026-10-21 15:00 |
| Review PASS và bàn giao mục tiêu | 2026-10-21 16:00 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-45 — Máy chủ: mời bạn đang online vào phòng

**Jira thực:** [XIAN-79](https://xiangqi-web.atlassian.net/browse/XIAN-79) · **Loại:** Task · **Assignee:** Võ Thành Đông · **Sprint:** XIAN Sprint 3 · **Fix version:** v0.3
**Components:** Room & Social · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `US-FRIEND-04`, `xiangqi-mvp-20261005`, `t-45`
**Ước lượng:** 3 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-22 · **Due date:** 2026-10-22 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Mời bạn vào phòng chơi · **Components:** Room & Social
**Phải xong trước:**

* **T-19 — Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh**: Chức năng vào phòng bằng mã, đường dẫn, Sảnh: xếp ghế hoặc người xem, kiểm sức chứa, chặn sai mã.
* **T-34 — Nghiệm thu bản chơi được: đăng ký, tạo phòng, mời, đánh online và đánh với máy chạy trọn**: Bản chơi được đã PASS M1–M4 trên bản chạy thật; báo cáo hoàn tất nhưng chưa đạt không mở phần làm sau, trừ PO cho phép rõ ràng.
* **T-41 — Máy chủ: kết bạn, lời mời và danh sách bạn có trạng thái**: Vòng đời kết bạn (tìm, mời, thu hồi, chấp nhận, từ chối, hết hạn), giới hạn 200 bạn/50 lời mời, danh sách bạn có trạng thái, huỷ kết bạn.
* **T-43 — Máy chủ: kiểu phòng (công khai, chỉ mã, khoá) và danh sách phòng ở Sảnh**: Kiểu phòng công khai/chỉ-mã/khoá, thu hồi mã khi khoá, danh sách phòng ở Sảnh tối đa 50, quy tắc giữ chỗ 60 giây/5 phút. Sảnh chỉ phòng PUBLIC còn mở, gồm FINISHED chưa đóng; Vào xem luôn SPECTATOR, kiểm lại mục cũ.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Cho người **đang ngồi ghế** mời **bạn đang online** vào phòng hiện tại. Lời mời chỉ là **thông báo có hạn 30 giây**: **không giữ chỗ** và **không cho quyền vào phòng vượt quy tắc**.

**Việc cần làm (làm lần lượt)**

1. Kiểm: người gửi **đang ngồi ghế**; người nhận là **bạn** và **Online rảnh** (đang giữ ghế hoặc chơi với máy là "Đang đấu", không được mời).
2. Gửi thông báo 30 giây; **không đặt chỗ** cho người nhận.
3. Khi người nhận bấm Tham gia: **đọc lại** kiểu phòng và mã/đường dẫn hiện hành, rồi dùng chính chức năng **vào phòng** (T-19). Kiểm lại: còn là bạn không, có đang bận không, phòng có khoá, bị đuổi, hết chỗ không. **Không** dựa vào trạng thái đã nhớ lúc gửi.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Người ngồi ghế mời bạn Online, bạn nhận | Vào ghế, hoặc vào xem nếu hợp lệ |
| Người xem mời, hoặc người nhận bận/ngoại tuyến | Bị chặn, không gửi |
| Chờ hết hạn, hoặc đường dẫn bị thu hồi, phòng bị khoá trước khi tham gia | Không vào được trái quyền |
| Hai người chấp nhận chỗ cuối | Không vượt giới hạn; phản hồi đúng tình trạng |
| Gửi mời rồi phòng bị khoá, hoặc mở khoá tạo mã mới trước khi nhận | Kiểm lại quyền và mã hiện hành; lời mời không phải vé giữ chỗ |
| Người nhận đang ngồi ghế (đang chờ/đang chơi/đã kết thúc) hoặc đang chơi với máy | Máy chủ chặn gửi ở cả bốn trường hợp, không chỉ khoá nút |
| Gửi lúc bạn rảnh, rồi bạn chiếm chỗ khác trước khi nhận | Kiểm lại, không vào phòng thứ hai trái luật |

**Cách tự kiểm tra**

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Người ngồi ghế mời bạn Online, bạn nhận | Vào đúng chỗ |
| 2 | Người xem bấm mời bạn vào; hoặc mời người đang bận hoặc ngoại tuyến | Không gửi được lời mời; có báo lý do |
| 3 | Chờ hết hạn; thu hồi đường dẫn; khoá phòng rồi nhận | Không vào |
| 4 | Hai người chấp nhận chỗ cuối | Không vượt giới hạn |
| 5 | Mời rồi khoá hoặc mở khoá tạo mã mới | Kiểm lại quyền |
| 6 | Mời người đang giữ chỗ (4 loại) | Máy chủ chặn |
| 7 | Mời lúc rảnh rồi người nhận chiếm chỗ khác | Kiểm lại, chặn |

**Khi nào chuyển cho người kiểm thử:** cả 7 dòng đạt; hạn do máy chủ quyết định.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Không giữ chỗ, không tạo phòng khác.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** lời mời vào phòng cho giao diện bạn bè và tích hợp.
**Không thuộc task này:** nút mời ở trang Bạn bè, thách đấu, giao diện.
**Phục vụ (nguồn):** Story 12; tiêu chí AC-FRIEND-04-01, AC-FRIEND-04-02, AC-FRIEND-04-03, AC-FRIEND-04-04. Thuộc Epic: Mời bạn vào phòng chơi.
**Kết quả (đầu ra):** Lời mời bạn online vào phòng (30 giây, không giữ chỗ), kiểm lại mọi điều kiện lúc bấm Tham gia.
**Bằng chứng nộp:** Kết quả thử 7 ca; thử mời người đang giữ chỗ. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Lời mời không phải vé giữ chỗ.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-19, T-34, T-41, T-43; liên quan tới (relates to) Story 12; Epic: Mời bạn vào phòng chơi.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Võ Thành Đông**; Sprint **XIAN Sprint 3**; Fix version **v0.3**; Start date **2026-10-22**; Due date **2026-10-22**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/05-task-e3-moi-ban.md` — T-45.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Võ Thành Đông**.
* Review/kiểm độc lập dự kiến: **Tưởng Lê khoa Cường-4572**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-3](https://xiangqi-web.atlassian.net/browse/XIAN-3).

**Phải hoàn tất trước:**

* [T-19 — XIAN-53](https://xiangqi-web.atlassian.net/browse/XIAN-53)
* [T-34 — XIAN-68](https://xiangqi-web.atlassian.net/browse/XIAN-68)
* [T-41 — XIAN-75](https://xiangqi-web.atlassian.net/browse/XIAN-75)
* [T-43 — XIAN-77](https://xiangqi-web.atlassian.net/browse/XIAN-77)

**Story phục vụ:**

* [Story 12 — XIAN-20](https://xiangqi-web.atlassian.net/browse/XIAN-20)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 2 | Võ Thành Đông |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 0.5 | Võ Thành Đông |
| Review độc lập | 0.5 | Tưởng Lê khoa Cường-4572 |
| Tổng Original/Remaining Estimate ban đầu | 3 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc phạm vi hẹp/cấu hình/giao diện hoặc nối chức năng đã có đầu vào: ca thực hiện ngắn, kiểm và review riêng. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-22 15:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-22 17:30 |
| Bắt đầu review | 2026-10-22 17:30 |
| Review PASS và bàn giao mục tiêu | 2026-10-22 18:00 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-52 — Nối web với máy chủ: bạn bè

**Jira thực:** [XIAN-86](https://xiangqi-web.atlassian.net/browse/XIAN-86) · **Loại:** Task · **Assignee:** 4841_Lê Thị Xuân Nhạn · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** Frontend, Room & Social · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `integration`, `US-FRIEND-02`, `US-FRIEND-03`, `US-FRIEND-04`, `US-FRIEND-05`, `xiangqi-mvp-20261005`, `t-52`
**Ước lượng:** 4.5 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-28 · **Due date:** 2026-10-28 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Mời bạn vào phòng chơi · **Components:** Frontend, Room & Social
**Phải xong trước:**

* **T-28 — Nối web với máy chủ: tạo phòng, vào phòng, ghế, Sẵn sàng, bắt đầu ván**: Hai người tạo phòng, vào phòng, ngồi ghế, Sẵn sàng và bắt đầu ván trên hai trình duyệt thật.
* **T-31 — Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ**: Ván với máy ở máy chủ (cấp, phe, một chỗ chơi, vào lại 30 phút), xử lý bận/hỏng/Bỏ dở/Thử lại. Nối luật hết phiên/thiết bị khác; đường ván AI cũ sau khởi động lại báo mất trạng thái, không tự hồi sinh.
* **T-40 — Giao diện: bạn bè (tìm, lời mời, danh sách, mời vào phòng)**: Giao diện bạn bè: tìm, lời mời, chuông, danh sách, nút Nhắn tin/Thách đấu mờ, nút Mời trong hộp thoại phòng, thông báo đếm lùi 30 giây; đủ 5 trạng thái, dữ liệu giả.
* **T-41 — Máy chủ: kết bạn, lời mời và danh sách bạn có trạng thái**: Vòng đời kết bạn (tìm, mời, thu hồi, chấp nhận, từ chối, hết hạn), giới hạn 200 bạn/50 lời mời, danh sách bạn có trạng thái, huỷ kết bạn.
* **T-45 — Máy chủ: mời bạn đang online vào phòng**: Lời mời bạn online vào phòng (30 giây, không giữ chỗ), kiểm lại mọi điều kiện lúc bấm Tham gia.
* **T-46 — Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời**: Điều khiển phòng nâng cao chạy thật trên web và máy chủ: đổi chỗ, khoá, danh sách, đuổi, chủ phòng rời.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Nối toàn bộ luồng bạn bè với máy chủ và phòng thật, từ **kết bạn tới mời vào phòng**. Bạn được mời phải **vào đúng vai theo trạng thái lúc bấm Tham gia**. Phần "đang chơi với máy thì Đang đấu" kiểm bằng ván với máy **thật**, không bằng dữ liệu giả.

**Việc cần làm (làm lần lượt)**

1. Nối tìm kiếm, chuông, danh sách, chấp nhận, từ chối, thu hồi với máy chủ; kiểm cả hai đầu quan hệ và giới hạn.
2. Mời từ hộp thoại phòng; thử đổi quyền, chỗ, khoá phòng **khi thông báo đang mở** rồi bấm Tham gia: phải kiểm tra lại.
3. Đối chiếu: người còn ghế (đang chờ / đang chơi / đã kết thúc mà chưa rời) là **Đang đấu**. Trạng thái "đã kết thúc" có thể nạp bằng dữ liệu thử; **không** tuyên bố đã kiểm trọn luồng kết thúc ván.
4. Bắt đầu ván với máy **thật** (T-31): bạn thành **Đang đấu**, không nhận mời; **rời ván máy** rồi còn kết nối → **Online rảnh** và mời được.
5. Kiểm lời mời bị gửi lại, giới hạn và quyền ở **máy chủ**, không chỉ ở trạng thái nút.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
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
| --- | --- | --- |
| 1 | Tìm, kết bạn, mời từ phòng rồi nhận | Quan hệ hai chiều, vào đúng phòng |
| 2 | Quá 30 giây; huỷ bạn; khoá/thu hồi đường dẫn | Không vào, báo đúng lỗi |
| 3 | Vượt giới hạn; gửi chéo | Chặn ở máy chủ |
| 4 | Bạn đang ngồi ghế | Đang đấu, không mời được |
| 5 | Bạn chơi với máy thật; mời; rời ván; mời lại | Đang đấu rồi Online rảnh |
| 6 | Gửi lệnh rời lặp lại | Một tác dụng |
| 7 | Phòng đầy, mời vào chỗ xem | Đúng vai hoặc từ chối |

**Khi nào chuyển cho người kiểm thử:** cả 7 dòng đạt với phòng thật và ván với máy thật; trạng thái bạn và vị trí khớp.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Không dùng dữ liệu giả thay cho thông báo của ván với máy. Hộp thoại ván với máy trên màn hình kiểm ở task tích hợp ván với máy (T-33).

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** luồng bạn bè chạy thật cho nghiệm thu và demo.
**Không thuộc task này:** thách đấu, nhắn tin 1-1, hiển thị Elo.
**Phục vụ (nguồn):** Story 10, 11, 12; tiêu chí AC-FRIEND-01-01, AC-FRIEND-02-01, AC-FRIEND-03-03, AC-FRIEND-04-02, AC-FRIEND-04-03, AC-FRIEND-04-04, AC-FRIEND-05-02. Thuộc Epic: Mời bạn vào phòng chơi.
**Kết quả (đầu ra):** Toàn bộ luồng bạn bè và mời vào phòng chạy thật; trạng thái Đang đấu kiểm bằng ván với máy thật.
**Bằng chứng nộp:** Video; báo cáo; nhật ký đã che. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Phụ thuộc ván với máy thật (Epic Đánh với máy).
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-28, T-31, T-40, T-41, T-45, T-46; liên quan tới (relates to) Story 10, Story 11, Story 12; Epic: Mời bạn vào phòng chơi.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **4841_Lê Thị Xuân Nhạn**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-10-28**; Due date **2026-10-28**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/05-task-e3-moi-ban.md` — T-52.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **4841_Lê Thị Xuân Nhạn**.
* Review/kiểm độc lập dự kiến: **Nguyễn Minh Thư**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-3](https://xiangqi-web.atlassian.net/browse/XIAN-3).

**Phải hoàn tất trước:**

* [T-28 — XIAN-62](https://xiangqi-web.atlassian.net/browse/XIAN-62)
* [T-31 — XIAN-65](https://xiangqi-web.atlassian.net/browse/XIAN-65)
* [T-40 — XIAN-74](https://xiangqi-web.atlassian.net/browse/XIAN-74)
* [T-41 — XIAN-75](https://xiangqi-web.atlassian.net/browse/XIAN-75)
* [T-45 — XIAN-79](https://xiangqi-web.atlassian.net/browse/XIAN-79)
* [T-46 — XIAN-80](https://xiangqi-web.atlassian.net/browse/XIAN-80)

**Story phục vụ:**

* [Story 10 — XIAN-18](https://xiangqi-web.atlassian.net/browse/XIAN-18)
* [Story 11 — XIAN-19](https://xiangqi-web.atlassian.net/browse/XIAN-19)
* [Story 12 — XIAN-20](https://xiangqi-web.atlassian.net/browse/XIAN-20)

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
| Bắt đầu thực hiện | 2026-10-28 10:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-28 15:00 |
| Bắt đầu review | 2026-10-28 15:00 |
| Review PASS và bàn giao mục tiêu | 2026-10-28 15:30 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-54 — Nối web với máy chủ: bấm đường dẫn mời, đăng nhập rồi vào đúng phòng

**Jira thực:** [XIAN-88](https://xiangqi-web.atlassian.net/browse/XIAN-88) · **Loại:** Task · **Assignee:** 4841_Lê Thị Xuân Nhạn · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** Frontend, Room & Social · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `integration`, `US-AUTH-04`, `US-AUTH-06`, `xiangqi-mvp-20261005`, `t-54`
**Ước lượng:** 3 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-27 · **Due date:** 2026-10-28 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Mời bạn vào phòng chơi · **Components:** Frontend, Room & Social
**Phải xong trước:**

* **T-11 — Giao diện: phòng chờ và màn từ chối vào phòng**: Phòng chờ (hai ghế, Sẵn sàng, đếm 3 giây), hộp thoại mời, màn từ chối vào phòng; đủ 5 trạng thái, dữ liệu giả.
* **T-19 — Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh**: Chức năng vào phòng bằng mã, đường dẫn, Sảnh: xếp ghế hoặc người xem, kiểm sức chứa, chặn sai mã.
* **T-25 — Nối web với máy chủ: đăng ký, đăng nhập, hồ sơ**: Đăng ký, đăng nhập, hồ sơ, đăng xuất chạy trọn trên môi trường thử với email thật. Luồng Google chạy trọn.
* **T-31 — Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ**: Ván với máy ở máy chủ (cấp, phe, một chỗ chơi, vào lại 30 phút), xử lý bận/hỏng/Bỏ dở/Thử lại. Nối luật hết phiên/thiết bị khác; đường ván AI cũ sau khởi động lại báo mất trạng thái, không tự hồi sinh.
* **T-32 — Nối web với máy chủ: bắt đầu ván đầy đủ, đồng hồ, kết thúc ván, đầu hàng, xin hoà**: Bắt đầu ván, đồng hồ, kết thúc ván, đầu hàng và xin hoà chạy trọn trên web và máy chủ thật.
* **T-33 — Nối web, máy chủ và máy cờ thật: ván với máy**: Ván với máy chạy thật qua web, máy chủ và máy cờ thật: ba cấp, ba phe, vào lại, sự cố.
* **T-43 — Máy chủ: kiểu phòng (công khai, chỉ mã, khoá) và danh sách phòng ở Sảnh**: Kiểu phòng công khai/chỉ-mã/khoá, thu hồi mã khi khoá, danh sách phòng ở Sảnh tối đa 50, quy tắc giữ chỗ 60 giây/5 phút. Sảnh chỉ phòng PUBLIC còn mở, gồm FINISHED chưa đóng; Vào xem luôn SPECTATOR, kiểm lại mục cũ.
* **T-44 — Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng**: Đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời và chuyển quyền, đóng phòng, quay về phòng chờ sau ván. Mời xuống ghế cần Chấp nhận; không giữ ghế, kiểm lại điều kiện lúc nhận và reset Sẵn sàng.
* **T-51 — Máy chủ: rời phòng giữa ván, mất kết nối, giữ chỗ, kết nối lại, ván gián đoạn**: Rời phòng giữa ván, mất kết nối, giữ chỗ 60 giây/5 phút, kết nối lại, ván gián đoạn khi máy chủ khởi động lại. Gồm hết phiên online giữ 60 giây/đồng hồ chạy; thiết bị khác xử thua ngay/rời vị trí.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Người mở đường dẫn mời sau đăng nhập/đăng ký phải đi tới đúng nơi theo **thứ tự ưu tiên phiên và vị trí chơi**, để không bỏ dở ván cũ hoặc tiếp tục trái quyền. Khi không có ràng buộc khác thì tự vào phòng mời, không phải bấm lại link.

**Việc cần làm (làm lần lượt)**

1. Khi mở link phòng chưa đăng nhập, nhớ mã phòng nội bộ rồi chuyển sang Đăng nhập/Đăng ký; chỉ chấp nhận đường dẫn của hệ thống.
2. Sau đăng nhập/hoàn tất Google hoặc email, xử lý **luật phiên trước chuyển hướng**: khác thiết bị khi đang chơi → ván cũ thua ngay, rời vị trí, thiết bị cũ đăng xuất, thiết bị mới về Sảnh; không tiếp tục và không vào phòng mời.
3. Cùng thiết bị đăng nhập lại trong ân hạn → quay lại ván cũ (online 60 giây, AI 30 phút); quá hạn kiểm kết quả và vị trí hiện tại, không hồi sinh ván.
4. Không có vị trí khác ngăn cản → gọi vào phòng đã nhớ. Máy chủ kiểm phiên, phòng, sức chứa và quyền; còn ghế thì vào ghế, kín ghế còn chỗ xem thì vào xem.
5. Phòng đóng/đầy/khoá hoặc bị đuổi → báo đúng lý do; không tạo ghế/phòng giả. Xoá đích đã nhớ sau khi xử lý để lần sau không tự vào nhầm.
6. Kiểm cả đăng nhập mật khẩu, Google đã hoàn tất và đăng ký mới; không triển khai Quên mật khẩu P2.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Mở đường dẫn phòng khi chưa đăng nhập | Đăng nhập xong vào đúng phòng |
| Đăng ký mới từ đường dẫn mời | Hoàn tất xong vào đúng phòng |
| Người được mời đang có một ván chưa xong | Được đưa vào lại ván đó, không vào phòng mời |
| Phòng đã đóng hoặc đầy | Báo lý do, về sảnh |
| Đường dẫn "quay lại" trỏ tới một trang ngoài ứng dụng (kẻ gian dùng để dẫn người dùng sang trang giả) | Bỏ qua, đưa về Sảnh |

**Cách tự kiểm tra**
Chuẩn bị: hai tài khoản thử, một phòng đang mở.

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Mở đường dẫn phòng khi chưa đăng nhập, đăng nhập | Vào đúng phòng |
| 2 | Làm như trên nhưng bằng đăng ký mới | Vào đúng phòng |
| 3 | Cùng thiết bị đăng nhập lại trong ân hạn rồi mở link khác | Quay lại đúng ván cũ; không chiếm thêm vị trí |
| 4 | Phòng đã đóng hoặc đầy | Thông báo rõ, về sảnh |
| 5 | Địa chỉ trả về là trang ngoài hệ thống | Không chuyển đi |
| 6 | Đang chơi online/AI ở thiết bị A; đăng nhập ở thiết bị B bằng link phòng mời | Ván cũ thua ngay, A đăng xuất/mất quyền; B ở Sảnh, không tiếp tục ván và không vào phòng mời |

**Khi nào chuyển cho người kiểm thử:** mọi dòng trong bảng tự kiểm tra đạt.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** luồng từ lời mời tới phòng hoạt động trọn vẹn.
**Không thuộc task này:** tạo phòng, vào phòng (có ở Epic Tạo phòng chơi), mời qua bạn bè.
**Phục vụ (nguồn):** Story 2, 9; tiêu chí AC-AUTH-04-01, AC-AUTH-06-01, AC-AUTH-06-02. Thuộc Epic: Mời bạn vào phòng chơi.
**Kết quả (đầu ra):** Bấm đường dẫn mời khi chưa đăng nhập, đăng nhập hoặc đăng ký xong thì vào đúng phòng; ưu tiên luật phiên/vị trí trước link mời; khác thiết bị về Sảnh sau xử thua; chặn chuyển hướng ra ngoài.
**Bằng chứng nộp:** Video và báo cáo Playwright. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Phụ thuộc phòng thật và quyền vào phòng.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-11, T-19, T-25, T-31, T-32, T-33, T-43, T-44, T-51; liên quan tới (relates to) Story 2, Story 9; Epic: Mời bạn vào phòng chơi.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **4841_Lê Thị Xuân Nhạn**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-10-27**; Due date **2026-10-28**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/05-task-e3-moi-ban.md` — T-54.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **4841_Lê Thị Xuân Nhạn**.
* Review/kiểm độc lập dự kiến: **Nguyễn Minh Thư**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-3](https://xiangqi-web.atlassian.net/browse/XIAN-3).

**Phải hoàn tất trước:**

* [T-11 — XIAN-45](https://xiangqi-web.atlassian.net/browse/XIAN-45)
* [T-19 — XIAN-53](https://xiangqi-web.atlassian.net/browse/XIAN-53)
* [T-25 — XIAN-59](https://xiangqi-web.atlassian.net/browse/XIAN-59)
* [T-31 — XIAN-65](https://xiangqi-web.atlassian.net/browse/XIAN-65)
* [T-32 — XIAN-66](https://xiangqi-web.atlassian.net/browse/XIAN-66)
* [T-33 — XIAN-67](https://xiangqi-web.atlassian.net/browse/XIAN-67)
* [T-43 — XIAN-77](https://xiangqi-web.atlassian.net/browse/XIAN-77)
* [T-44 — XIAN-78](https://xiangqi-web.atlassian.net/browse/XIAN-78)
* [T-51 — XIAN-85](https://xiangqi-web.atlassian.net/browse/XIAN-85)

**Story phục vụ:**

* [Story 2 — XIAN-10](https://xiangqi-web.atlassian.net/browse/XIAN-10)
* [Story 9 — XIAN-17](https://xiangqi-web.atlassian.net/browse/XIAN-17)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 2 | 4841_Lê Thị Xuân Nhạn |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 0.5 | 4841_Lê Thị Xuân Nhạn |
| Review độc lập | 0.5 | Nguyễn Minh Thư |
| Tổng Original/Remaining Estimate ban đầu | 3 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc phạm vi hẹp/cấu hình/giao diện hoặc nối chức năng đã có đầu vào: ca thực hiện ngắn, kiểm và review riêng. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-27 16:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-28 09:30 |
| Bắt đầu review | 2026-10-28 09:30 |
| Review PASS và bàn giao mục tiêu | 2026-10-28 10:00 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---
