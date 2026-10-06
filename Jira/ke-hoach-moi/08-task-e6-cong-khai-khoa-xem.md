# Task của Epic "Phòng công khai, khoá phòng và người xem" (5 task)

**Ngày cập nhật:** 2026-10-05 · **Trạng thái:** đã được PO cho phép tạo và phân công ngày 05/10/2026 · Đã tạo Epic/Story/Task trên XIAN · Viết theo `00-chuan-description.md` và mẫu `00b`.

Mã task `T-01` đến `T-64` đánh theo **thứ tự làm** (số nhỏ làm trước, mỗi task chỉ cần các task có số nhỏ hơn). Một số task gộp nhiều việc nhỏ cùng mục đích thành một task. Ngày Sprint: 1 = 04/10–07/10, 2 = 08/10–10/10, 3 = 11/10–14/10, 4 = 15/10–17/10.

---

### T-39 — Giao diện: cài đặt phòng, đổi chỗ ghế/xem, danh sách người xem, xác nhận đuổi

**Jira thực:** [XIAN-73](https://xiangqi-web.atlassian.net/browse/XIAN-73) · **Loại:** Task · **Assignee:** 4841_Lê Thị Xuân Nhạn · **Sprint:** XIAN Sprint 3 · **Fix version:** v0.3
**Components:** Frontend · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `US-PLAY-09`, `US-ROOM-01`, `US-ROOM-06`, `US-ROOM-07`, `US-ROOM-09`, `xiangqi-mvp-20261005`, `t-39`
**Ước lượng:** 4.5 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-20 · **Due date:** 2026-10-21 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Phòng công khai, khoá phòng và người xem · **Components:** Frontend
**Phải xong trước:**

* **T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ**: Gói hợp đồng chung biên dịch được, có danh sách lệnh, thông tin đi kèm, nhóm lỗi và ví dụ hợp lệ/sai dùng được ở cả giao diện và máy chủ.
* **T-07 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)**: Ứng dụng web chạy được, có kiểu chữ/màu Kỳ Đài Cổ Phong, các khối nền (nút, ô nhập, hộp thoại, thông báo, chú thích, khung xương) đủ 5 trạng thái và trang kiểm tra nội bộ.
* **T-11 — Giao diện: phòng chờ và màn từ chối vào phòng**: Phòng chờ (hai ghế, Sẵn sàng, đếm 3 giây), hộp thoại mời, màn từ chối vào phòng; đủ 5 trạng thái, dữ liệu giả.
* **T-34 — Nghiệm thu bản chơi được: đăng ký, tạo phòng, mời, đánh online và đánh với máy chạy trọn**: Bản chơi được đã PASS M1–M4 trên bản chạy thật; báo cáo hoàn tất nhưng chưa đạt không mở phần làm sau, trừ PO cho phép rõ ràng.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Thêm vào phòng chờ các điều khiển nâng cao: **cài đặt phòng (khoá)**, **đổi chỗ giữa ghế và người xem**, **danh sách người xem**, **xác nhận đuổi**. Giao diện chỉ phản ánh quyền hiện tại do máy chủ báo, phát ý định để task tích hợp (T-46) nối thật.

**Việc cần làm (làm lần lượt)**

1. **Cài đặt phòng:** bật khoá — chỉ chủ phòng, chỉ khi đủ hai ghế; hộp xác nhận nói rõ "người đang trong phòng được giữ lại".
2. **Đổi chỗ:** nút xuống xem, nút mời xem lên ghế. Nút mờ có lý do khi hết chỗ xem, khi chủ phòng định tự xuống, hoặc người xem định tự ngồi; chỉ đổi được khi "Đang chờ" hoặc "Đã kết thúc".
3. **Danh sách người xem** với nút đuổi: chỉ hai người chơi thấy; **hộp xác nhận đuổi**, bấm "Huỷ" thì không gửi gì.
4. Chỉ cập nhật quyền **sau khi máy chủ xác nhận**; lỗi hay mất quyền chủ phòng khi hộp đang mở thì gỡ thao tác.
5. Đủ 5 trạng thái, bàn phím dùng được; không có chức năng chưa làm (xin đổi bên, tái đấu, QR).
6. Hộp **Mời xuống ghế** cho người xem có Chấp nhận/Từ chối: chưa chấp nhận vẫn là người xem, không giữ ghế. Khi chấp nhận mà ghế đã kín hoặc điều kiện đổi thì hiện lý do; thành công vẫn phải Sẵn sàng. Dữ liệu mẫu ở task UI; T-46 kiểm thật.

**Thành phần màn hình phải có (theo danh mục màn hình, chỉ phần P1 (MVP))**
_Hộp Cài đặt phòng_ (`MODAL-ROOM-SETTINGS`)

* Chỉ chủ phòng thấy; đổi giữa **công khai**, **chỉ vào bằng mã** và **khoá** (kể cả khi đang đấu).
* **Khoá** mờ kèm chú thích "Chỉ khoá được khi đã đủ 2 người chơi" nếu chưa đủ; khi bật hiện xác nhận "Người mới sẽ không vào được. Người xem đang có vẫn được giữ lại."
* Giờ và số người xem hiển thị nhưng **không sửa được**.

_Hộp xác nhận Đuổi người xem_ (`MODAL-CONFIRM-KICK`)

* Nội dung: "Người này sẽ không vào lại được phòng này."; nút xác nhận và **Huỷ** (Huỷ không gửi gì).

_Danh sách Người xem_ (`PANEL-SPECTATORS`)

* Tiêu đề "Người xem (X / N)" (N là số người xem tối đa của phòng, 1–5).
* Cạnh tên mỗi người xem có nút **Đuổi**, hai người chơi đều thấy; người xem không thấy nút.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**

| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
| --- | --- | --- | --- | --- | --- |
| Hộp Cài đặt phòng | Host đổi riêng tư, thu hồi mã đúng | Đang thay đổi | Chưa nhận được dữ liệu từ máy chủ: hướng dẫn đợi, không hiện giá trị giả | Không còn quyền/ghi lỗi: tải trạng thái thật | Không Host; bật LOCKED chưa đủ hai ghế |
| Hộp xác nhận Đuổi người xem | Chặn đến đóng phòng, người xem về Sảnh | Đang đuổi/chặn | Mục tiêu đã rời: cập nhật danh sách | Mất quyền/lỗi lệnh: không báo đã đuổi | Mục tiêu không là người xem/người gọi mất ghế |
| Danh sách Người xem | Danh sách/số X/N đúng; Kick cho hai người | Tải/cập nhật danh sách | Chưa ai xem: giải thích; không dựng tài khoản giả | Tải/đuổi lỗi: tải lại danh sách thật | N=0/đã đủ; không ghế thì không quyền Kick |

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Hết chỗ xem, chủ phòng tự xuống, người xem tự ngồi | Nút mờ có lý do hoặc ẩn đúng luật, không gửi lệnh |
| Bật khoá khi thiếu ghế, rồi khi đủ ghế; bấm "Huỷ" | Chặn khi thiếu; xác nhận nói giữ người cũ; Huỷ không gửi |
| Người xem (không phải chủ phòng) nhìn danh sách người xem | Không thấy nút Đuổi |
| Mất quyền chủ phòng khi hộp mở; máy chủ báo lỗi; danh sách rỗng | Gỡ thao tác; không báo thành công giả; đúng 5 trạng thái |

**Cách tự kiểm tra**
Chuẩn bị: dữ liệu giả có quyền đổi khi hộp đang mở.

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Các ca hết chỗ xem / chủ phòng tự xuống / người xem tự ngồi | Nút mờ có lý do, không gửi |
| 2 | Khoá khi thiếu ghế rồi đủ ghế; bấm Huỷ | Đúng; Huỷ không gửi |
| 3 | Đuổi bởi người chơi; người xem thử đuổi | Người chơi có xác nhận; người xem không có quyền |
| 4 | Mất quyền khi hộp mở; lỗi; danh sách rỗng | Gỡ thao tác, không thành công giả, đủ trạng thái |
| 5 | Đối chiếu từng gạch đầu dòng ở phần "Thành phần màn hình phải có" với màn hình thật, và đủ 5 trạng thái ở bảng nghiệm thu | Không thiếu, không thừa; chức năng chưa làm mờ hoặc ẩn đúng quy tắc |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt, kèm ảnh/video.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Dữ liệu giả **không** chứng minh việc đuổi hay thu quyền chạy thật (T-46).

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** các điều khiển cho task tích hợp phòng nâng cao.
**Không thuộc task này:** xử lý ở máy chủ, thu camera/mic, danh sách phòng công khai (đã ở Sảnh), xin đổi bên, tái đấu.
**Phục vụ (nguồn):** Story 5, 19, 20, 21; tiêu chí AC-ROOM-01-04, AC-ROOM-06-01, AC-ROOM-06-02, AC-ROOM-06-03, AC-ROOM-06-04, AC-ROOM-07-01, AC-ROOM-07-06, AC-ROOM-09-01, AC-PLAY-09-03. Thuộc Epic: Phòng công khai, khoá phòng và người xem.
**Kết quả (đầu ra):** Cài đặt phòng (khoá), đổi chỗ ghế/xem, danh sách người xem X/N, xác nhận đuổi; đủ 5 trạng thái, dữ liệu giả.
**Bằng chứng nộp:** Ảnh chụp; kiểm bàn phím. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Chưa chứng minh đuổi thật.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-02, T-07, T-11, T-34; liên quan tới (relates to) Story 5, Story 19, Story 20, Story 21; Epic: Phòng công khai, khoá phòng và người xem.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **4841_Lê Thị Xuân Nhạn**; Sprint **XIAN Sprint 3**; Fix version **v0.3**; Start date **2026-10-20**; Due date **2026-10-21**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/08-task-e6-cong-khai-khoa-xem.md` — T-39.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **4841_Lê Thị Xuân Nhạn**.
* Review/kiểm độc lập dự kiến: **Nguyễn Minh Thư**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-6](https://xiangqi-web.atlassian.net/browse/XIAN-6).

**Phải hoàn tất trước:**

* [T-02 — XIAN-36](https://xiangqi-web.atlassian.net/browse/XIAN-36)
* [T-07 — XIAN-41](https://xiangqi-web.atlassian.net/browse/XIAN-41)
* [T-11 — XIAN-45](https://xiangqi-web.atlassian.net/browse/XIAN-45)
* [T-34 — XIAN-68](https://xiangqi-web.atlassian.net/browse/XIAN-68)

**Story phục vụ:**

* [Story 5 — XIAN-13](https://xiangqi-web.atlassian.net/browse/XIAN-13)
* [Story 19 — XIAN-27](https://xiangqi-web.atlassian.net/browse/XIAN-27)
* [Story 20 — XIAN-28](https://xiangqi-web.atlassian.net/browse/XIAN-28)
* [Story 21 — XIAN-29](https://xiangqi-web.atlassian.net/browse/XIAN-29)

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
| Bắt đầu thực hiện | 2026-10-20 16:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-21 11:00 |
| Bắt đầu review | 2026-10-21 11:00 |
| Review PASS và bàn giao mục tiêu | 2026-10-21 11:30 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-43 — Máy chủ: kiểu phòng (công khai, chỉ mã, khoá) và danh sách phòng ở Sảnh

**Jira thực:** [XIAN-77](https://xiangqi-web.atlassian.net/browse/XIAN-77) · **Loại:** Task · **Assignee:** nguyenhoangtungtuyhoa · **Sprint:** XIAN Sprint 3 · **Fix version:** v0.3
**Components:** Room & Social · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `US-ROOM-04`, `US-ROOM-07`, `US-ROOM-08`, `xiangqi-mvp-20261005`, `t-43`
**Ước lượng:** 4.5 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-20 · **Due date:** 2026-10-20 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Phòng công khai, khoá phòng và người xem · **Components:** Room & Social
**Phải xong trước:**

* **T-19 — Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh**: Chức năng vào phòng bằng mã, đường dẫn, Sảnh: xếp ghế hoặc người xem, kiểm sức chứa, chặn sai mã.
* **T-34 — Nghiệm thu bản chơi được: đăng ký, tạo phòng, mời, đánh online và đánh với máy chạy trọn**: Bản chơi được đã PASS M1–M4 trên bản chạy thật; báo cáo hoàn tất nhưng chưa đạt không mở phần làm sau, trừ PO cho phép rõ ràng.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Thực hiện việc **khoá phòng** và hiển thị **danh sách phòng công khai**. Khoá chỉ chặn **người mới**, **không đuổi** người đang có mặt hợp lệ.

**Việc cần làm (làm lần lượt)**

1. **Bật khoá:** chỉ chủ phòng, và chỉ khi **đủ hai người ngồi ghế**. Khoá thì phòng **biến khỏi Sảnh**, chặn người mới, giữ nguyên người đang có.
2. Khoá làm **đường dẫn và mã chưa dùng mất hiệu lực**; mở khoá thì tạo **mã và đường dẫn mới**, mã cũ không sống lại.
3. Nếu sau đó một ghế trống, phòng **vẫn giữ khoá** (không tự mở).
4. **Giữ chỗ khi mất kết nối:** người chơi vắng trong **60 giây**, người xem trong **5 phút** thì vẫn coi là người cũ; quá hạn coi như người mới (bị chặn nếu phòng đang khoá). Task này chỉ làm **quy tắc**; chạy thật khi mất mạng làm ở task kết nối lại.
5. **Danh sách Sảnh:** chỉ phòng công khai còn mở (đang chờ, đang chơi hoặc đã kết thúc nhưng chưa đóng), **mới nhất trước, tối đa 50 phòng**. Phòng chỉ mã, đã khoá hoặc đã đóng thì không hiện.
6. Danh sách chỉ gồm phòng tự tạo PUBLIC **còn mở**, kể cả FINISHED đang giữ phòng; bỏ phòng khi đóng/đổi khỏi PUBLIC. Mỗi mục có tên, hai ghế/người chơi, trạng thái, số người xem hiện tại/trần; không lộ mã/token/Kênh Riêng. Vào xem luôn là SPECTATOR dù còn ghế, kiểm lại PUBLIC/quyền/sức chứa khi xử lý; mục đã cũ không cho vào trái quyền.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Người không phải chủ phòng, hoặc phòng chưa đủ 2 người ngồi ghế, bật khoá phòng | Không bật được khoá; báo lý do |
| Chủ phòng đủ hai ghế khoá | Biến khỏi Sảnh, người đang trong phòng không bị loại |
| Mở khoá rồi dùng mã cũ | Mã cũ vô hiệu; mã mới dùng được |
| Một người chơi rời đi nên còn ghế trống sau khi phòng đã khoá | Phòng vẫn giữ khoá, không tự mở |
| Người vắng 59 giây / 61 giây (người xem 4:59 / 5:01) | Còn tư cách / coi như người mới |
| Có hơn 50 phòng, lẫn phòng chỉ mã, khoá, đóng | Chỉ phòng công khai đang chờ hoặc chơi, tối đa 50 mới nhất |

**Cách tự kiểm tra**
Chuẩn bị: dữ liệu mẫu nhiều phòng, đồng hồ giả.

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Người không phải chủ và phòng thiếu ghế thử khoá; chủ phòng đủ ghế khoá | Hai ca đầu bị chặn; ca cuối khoá thành công, không loại ai |
| 2 | Mở khoá rồi dùng mã cũ và mã mới | Mã cũ vô hiệu, mã mới dùng được |
| 3 | Làm một ghế trống khi đang khoá | Vẫn khoá |
| 4 | Thử các mốc 59/61 giây (chơi), 4:59/5:01 (xem) | Trong hạn: như người cũ; quá hạn: người mới |
| 5 | Lấy danh sách với dữ liệu hơn 50 phòng, có đủ các loại | Chỉ phòng công khai đang chờ hoặc chơi, tối đa 50 |

**Khi nào chuyển cho người kiểm thử:** cả 5 dòng đạt.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Việc mất mạng thật nghiệm thu ở task kết nối lại.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** khoá, mã mới và danh sách Sảnh cho đuổi/Host, giao diện và mời bạn bè.
**Không thuộc task này:** đánh hạng, ghép ngẫu nhiên, hộp xác nhận khoá (ở giao diện).
**Phục vụ (nguồn):** Story 9, 19; tiêu chí AC-ROOM-04-03, AC-ROOM-07-01, AC-ROOM-07-02, AC-ROOM-07-03, AC-ROOM-07-04, AC-ROOM-07-05, AC-ROOM-08-01, AC-ROOM-08-02. Thuộc Epic: Phòng công khai, khoá phòng và người xem.
**Kết quả (đầu ra):** Kiểu phòng công khai/chỉ-mã/khoá, thu hồi mã khi khoá, danh sách phòng ở Sảnh tối đa 50, quy tắc giữ chỗ 60 giây/5 phút. Sảnh chỉ phòng PUBLIC còn mở, gồm FINISHED chưa đóng; Vào xem luôn SPECTATOR, kiểm lại mục cũ.
**Bằng chứng nộp:** Kết quả thử 5 ca; danh sách trước/sau. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Giữ chỗ khi mất mạng thật kiểm ở task nối nâng cao.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-19, T-34; liên quan tới (relates to) Story 6, Story 8, Story 9, Story 19; Epic: Phòng công khai, khoá phòng và người xem.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **nguyenhoangtungtuyhoa**; Sprint **XIAN Sprint 3**; Fix version **v0.3**; Start date **2026-10-20**; Due date **2026-10-20**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/08-task-e6-cong-khai-khoa-xem.md` — T-43.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **nguyenhoangtungtuyhoa**.
* Review/kiểm độc lập dự kiến: **Võ Thành Đông**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-6](https://xiangqi-web.atlassian.net/browse/XIAN-6).

**Phải hoàn tất trước:**

* [T-19 — XIAN-53](https://xiangqi-web.atlassian.net/browse/XIAN-53)
* [T-34 — XIAN-68](https://xiangqi-web.atlassian.net/browse/XIAN-68)

**Story phục vụ:**

* [Story 6 — XIAN-14](https://xiangqi-web.atlassian.net/browse/XIAN-14)
* [Story 8 — XIAN-16](https://xiangqi-web.atlassian.net/browse/XIAN-16)
* [Story 9 — XIAN-17](https://xiangqi-web.atlassian.net/browse/XIAN-17)
* [Story 19 — XIAN-27](https://xiangqi-web.atlassian.net/browse/XIAN-27)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 3 | nguyenhoangtungtuyhoa |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 1 | nguyenhoangtungtuyhoa |
| Review độc lập | 0.5 | Võ Thành Đông |
| Tổng Original/Remaining Estimate ban đầu | 4.5 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc phạm vi hẹp/cấu hình/giao diện hoặc nối chức năng đã có đầu vào: ca thực hiện ngắn, kiểm và review riêng. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-20 13:30 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-20 17:30 |
| Bắt đầu review | 2026-10-20 17:30 |
| Review PASS và bàn giao mục tiêu | 2026-10-20 18:00 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-44 — Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng

**Jira thực:** [XIAN-78](https://xiangqi-web.atlassian.net/browse/XIAN-78) · **Loại:** Task · **Assignee:** TÌNH 4851_NGUYỄN NGỌC · **Sprint:** XIAN Sprint 3 · **Fix version:** v0.3
**Components:** Room & Social · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `US-ROOM-05`, `US-ROOM-06`, `US-ROOM-09`, `US-ROOM-10`, `US-ROOM-11`, `xiangqi-mvp-20261005`, `t-44`
**Ước lượng:** 8.5 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-21 · **Due date:** 2026-10-22 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Phòng công khai, khoá phòng và người xem · **Components:** Room & Social
**Phải xong trước:**

* **T-23 — Máy chủ: chọn ghế, Sẵn sàng, đếm 3 giây, bắt đầu ván**: Chọn ghế, Sẵn sàng, đếm 3 giây, tạo đúng một ván với thế ban đầu và lượt Đỏ; huỷ đếm khi điều kiện đổi. Mất mạng khi đếm huỷ/reset cả hai Sẵn sàng và giữ ghế 60 giây; chưa có ván không tạo thua.
* **T-34 — Nghiệm thu bản chơi được: đăng ký, tạo phòng, mời, đánh online và đánh với máy chạy trọn**: Bản chơi được đã PASS M1–M4 trên bản chạy thật; báo cáo hoàn tất nhưng chưa đạt không mở phần làm sau, trừ PO cho phép rõ ràng.
* **T-43 — Máy chủ: kiểu phòng (công khai, chỉ mã, khoá) và danh sách phòng ở Sảnh**: Kiểu phòng công khai/chỉ-mã/khoá, thu hồi mã khi khoá, danh sách phòng ở Sảnh tối đa 50, quy tắc giữ chỗ 60 giây/5 phút. Sảnh chỉ phòng PUBLIC còn mở, gồm FINISHED chưa đóng; Vào xem luôn SPECTATOR, kiểm lại mục cũ.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Cho người chơi và người xem **đổi chỗ** theo luật và theo sức chứa. Mỗi lần đổi **xoá trạng thái "Sẵn sàng"** và báo cho các phần khác biết người đó đổi quyền (để chat và camera/mic đổi theo).

Xử lý trọn vòng đời phòng: **đuổi người xem**, **người rời đi**, **chuyển quyền chủ phòng**, **đóng phòng**, và trở về phòng chờ sau ván. Người bị đuổi phải **mất mọi quyền ngay** và không vào lại được.

**Việc cần làm (làm lần lượt)**

1. Chỉ cho đổi khi phòng ở **Đang chờ** hoặc **Đã kết thúc** (không đổi giữa ván).
2. **Người chơi tự xuống xem:** chỉ khi còn chỗ cho người xem.
3. **Chủ phòng chuyển đối thủ xuống xem** nếu còn chỗ xem; hoặc gửi **Mời xuống ghế** cho người xem khi còn ghế trống. Người xem **Chấp nhận mới chuyển**, Từ chối vẫn xem. Lời mời không giữ ghế. Khi chấp nhận kiểm lại trạng thái phòng, quyền Host, vị trí chơi và ghế trống; thất bại giữ vai người xem, thành công reset Sẵn sàng và phải bấm Sẵn sàng trước ván mới.
4. Người xem **không tự ngồi** vào ghế; chủ phòng **không tự xuống** làm người xem.
5. Mỗi lần đổi cập nhật sổ chỗ, thời điểm ngồi ghế và xoá "Sẵn sàng" của cả hai; phát thông báo quyền mới **sau khi** ghi xong.
6. Sau khi ván kết thúc, đổi thành phần ghế thì phòng về "Đang chờ".
7. **Đuổi người xem:** do một trong hai người chơi thực hiện, có xác nhận. Người bị đuổi bị ngắt khỏi phòng, **bị chặn** vào lại, mã hay đường dẫn cũ cũng vô hiệu với họ. Người xem **không** có quyền đuổi.
8. **Chủ phòng rời:** nếu còn người ngồi ghế thì **quyền chủ phòng chuyển** cho người đó; nếu không còn ai ngồi ghế thì **đóng phòng** dù còn người xem.
9. **Rời giữa ván:** chỉ hoàn tất việc rời khi phần ván đã **xác nhận xử thua**; task này không tự tính kết quả ván.
10. **Sau khi ván kết thúc:** phòng ở "Đã kết thúc" nếu không ai làm gì thì **đóng sau 10 phút**; ai đổi thành phần ghế thì về "Đang chờ" (và huỷ đồng hồ 10 phút cũ). Người chơi giữ ghế **60 giây** khi mất mạng.
11. Mỗi khi đuổi hay đóng, **phát thông báo** để chat và camera/mic thu quyền (phần thu thật làm ở Epic khác).

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Người chơi xin chuyển từ ghế xuống làm người xem: khi chỗ xem đã đầy (hoặc tối đa là 0) / khi còn chỗ | Đầy: bị từ chối, vẫn ngồi ghế / còn chỗ: được chuyển xuống xem |
| Chủ phòng mời người xem lên ghế trống / ghế đã kín | Đúng quyền / từ chối, không chiếm ghế người khác |
| Chủ phòng tự chuyển xuống làm người xem, hoặc người xem tự ngồi vào ghế (không được chủ phòng cho phép) | Máy chủ từ chối |
| Xin đổi chỗ ngồi/người xem trong lúc ván đang diễn ra | Từ chối khi đang đấu; đổi được ở WAITING hoặc FINISHED khi đủ điều kiện |
| Đổi lúc "Đã kết thúc", gửi lặp hoặc cùng lúc | Về "Đang chờ", xoá sẵn sàng hai bên, không vượt sức chứa |
| Người chơi đuổi người xem; người bị đuổi vào lại | Bị ngắt và chặn; người xem tự đuổi thì từ chối |
| Chủ phòng rời phòng: khi vẫn còn người ngồi ghế / khi không còn ai ngồi ghế | Còn người: chuyển quyền chủ phòng cho người đó / không còn ai: đóng phòng |
| Rời giữa ván khi phần ván báo thành công / lỗi / không rõ | Chỉ khi xác nhận mới rời; không xử thua hai lần, không báo thành công khi chưa rõ |
| Phòng kết thúc, đổi ghế trước 10 phút / không ai làm gì | Đồng hồ cũ vô hiệu / phòng đóng |

**Cách tự kiểm tra**

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Người chơi xuống xem khi 0 / đầy / còn chỗ | Chỉ trường hợp còn chỗ được nhận |
| 2 | Chủ phòng mời người xem lên ghế trống rồi thử ghế kín | Đúng; không chiếm ghế người khác |
| 3 | Chủ phòng tự chuyển xuống làm người xem; người xem tự ngồi vào ghế | Máy chủ từ chối cả hai |
| 4 | Xin đổi ghế/người xem khi ván đang diễn ra | Từ chối khi đang đấu; đổi được ở WAITING hoặc FINISHED khi đủ điều kiện |
| 5 | Đổi lúc phòng đã kết thúc, gửi hai yêu cầu cùng lúc | Về "Đang chờ", sẵn sàng xoá, không vượt giới hạn |
| 6 | Người chơi đuổi người xem; người này thử vào lại; người xem tự đuổi | Bị chặn; người xem không có quyền |
| 7 | Chủ phòng rời khi còn ghế khác và khi không | Chuyển chủ / đóng, dù còn người xem |
| 8 | Rời giữa ván với "kết quả giả" thành công, lỗi, mất phản hồi | Chỉ rời khi xác nhận; không báo giả |
| 9 | Phòng kết thúc rồi đổi ghế trước 10 phút; để quá 10 phút | Đồng hồ cũ không đóng phòng; quá hạn đóng |
| 10 | Mời người xem rồi Từ chối; mời rồi người khác chiếm ghế trước lúc Chấp nhận; sau đó thử ghế còn trống | Từ chối không đổi vai; không giữ/chiếm ghế đã kín; thành công về WAITING và cả hai chưa sẵn sàng |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý. Việc đổi quyền camera/mic thật làm ở Epic Chat, camera và micro. Ở đây chỉ chứng minh đã phát thông báo. Việc thu camera/mic, dọn chat thật và xử thua thật do các task khác kiểm khi tích hợp.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** chức năng đổi chỗ và thông báo quyền mới cho riêng tư, đuổi, chat, camera/mic; đuổi, chủ phòng, đóng phòng và thông báo quyền, cho giao diện, chat, camera/mic, ván.
**Không thuộc task này:** xin đổi bên; hoán đổi trực tiếp hai người; tái đấu; tự ghi kết quả ván; giao diện.
**Phục vụ (nguồn):** Story 8, 20; tiêu chí AC-ROOM-05-04, AC-ROOM-06-01, AC-ROOM-06-02, AC-ROOM-06-03, AC-ROOM-06-04, AC-ROOM-06-05, AC-ROOM-09-02, AC-ROOM-10-01, AC-ROOM-10-02, AC-ROOM-10-03, AC-ROOM-11-01, AC-ROOM-11-02. Thuộc Epic: Phòng công khai, khoá phòng và người xem.
**Kết quả (đầu ra):** Đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời và chuyển quyền, đóng phòng, quay về phòng chờ sau ván. Mời xuống ghế cần Chấp nhận; không giữ ghế, kiểm lại điều kiện lúc nhận và reset Sẵn sàng.
**Bằng chứng nộp:** Kết quả thử 4 ca; đồng hồ giả 10 phút. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Thu camera/micro và dọn chat thật kiểm ở Epic khác.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-23, T-34, T-43; liên quan tới (relates to) Story 8, Story 20; Epic: Phòng công khai, khoá phòng và người xem.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **TÌNH 4851_NGUYỄN NGỌC**; Sprint **XIAN Sprint 3**; Fix version **v0.3**; Start date **2026-10-21**; Due date **2026-10-22**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/08-task-e6-cong-khai-khoa-xem.md` — T-44.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **TÌNH 4851_NGUYỄN NGỌC**.
* Review/kiểm độc lập dự kiến: **nguyenhoangtungtuyhoa**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-6](https://xiangqi-web.atlassian.net/browse/XIAN-6).

**Phải hoàn tất trước:**

* [T-23 — XIAN-57](https://xiangqi-web.atlassian.net/browse/XIAN-57)
* [T-34 — XIAN-68](https://xiangqi-web.atlassian.net/browse/XIAN-68)
* [T-43 — XIAN-77](https://xiangqi-web.atlassian.net/browse/XIAN-77)

**Story phục vụ:**

* [Story 8 — XIAN-16](https://xiangqi-web.atlassian.net/browse/XIAN-16)
* [Story 20 — XIAN-28](https://xiangqi-web.atlassian.net/browse/XIAN-28)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 6 | TÌNH 4851_NGUYỄN NGỌC |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 1.5 | TÌNH 4851_NGUYỄN NGỌC |
| Review độc lập | 1 | nguyenhoangtungtuyhoa |
| Tổng Original/Remaining Estimate ban đầu | 8.5 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc có luật nghiệp vụ, xử lý trạng thái, tích hợp hoặc kiểm định chất lượng: dành ca dài hơn và dự phòng sửa lỗi. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-21 16:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-22 15:30 |
| Bắt đầu review | 2026-10-22 15:30 |
| Review PASS và bàn giao mục tiêu | 2026-10-22 16:30 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-46 — Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời

**Jira thực:** [XIAN-80](https://xiangqi-web.atlassian.net/browse/XIAN-80) · **Loại:** Task · **Assignee:** 4841_Lê Thị Xuân Nhạn · **Sprint:** XIAN Sprint 3 · **Fix version:** v0.3
**Components:** Frontend, Room & Social · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `integration`, `US-ROOM-05`, `US-ROOM-06`, `US-ROOM-07`, `US-ROOM-08`, `US-ROOM-09`, `US-ROOM-10`, `US-ROOM-11`, `xiangqi-mvp-20261005`, `t-46`
**Ước lượng:** 6 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-23 · **Due date:** 2026-10-24 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Phòng công khai, khoá phòng và người xem · **Components:** Frontend, Room & Social
**Phải xong trước:**

* **T-28 — Nối web với máy chủ: tạo phòng, vào phòng, ghế, Sẵn sàng, bắt đầu ván**: Hai người tạo phòng, vào phòng, ngồi ghế, Sẵn sàng và bắt đầu ván trên hai trình duyệt thật.
* **T-32 — Nối web với máy chủ: bắt đầu ván đầy đủ, đồng hồ, kết thúc ván, đầu hàng, xin hoà**: Bắt đầu ván, đồng hồ, kết thúc ván, đầu hàng và xin hoà chạy trọn trên web và máy chủ thật.
* **T-34 — Nghiệm thu bản chơi được: đăng ký, tạo phòng, mời, đánh online và đánh với máy chạy trọn**: Bản chơi được đã PASS M1–M4 trên bản chạy thật; báo cáo hoàn tất nhưng chưa đạt không mở phần làm sau, trừ PO cho phép rõ ràng.
* **T-39 — Giao diện: cài đặt phòng, đổi chỗ ghế/xem, danh sách người xem, xác nhận đuổi**: Cài đặt phòng (khoá), đổi chỗ ghế/xem, danh sách người xem X/N, xác nhận đuổi; đủ 5 trạng thái, dữ liệu giả.
* **T-43 — Máy chủ: kiểu phòng (công khai, chỉ mã, khoá) và danh sách phòng ở Sảnh**: Kiểu phòng công khai/chỉ-mã/khoá, thu hồi mã khi khoá, danh sách phòng ở Sảnh tối đa 50, quy tắc giữ chỗ 60 giây/5 phút. Sảnh chỉ phòng PUBLIC còn mở, gồm FINISHED chưa đóng; Vào xem luôn SPECTATOR, kiểm lại mục cũ.
* **T-44 — Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng**: Đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời và chuyển quyền, đóng phòng, quay về phòng chờ sau ván. Mời xuống ghế cần Chấp nhận; không giữ ghế, kiểm lại điều kiện lúc nhận và reset Sẵn sàng.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Nối các điều khiển nâng cao với máy chủ thật và kiểm đúng cho **người chơi, người xem và người vừa mất quyền**: đổi chỗ, khoá, đuổi, chủ phòng rời. Quan trọng nhất: người bị đuổi **mất quyền thật** ở máy chủ, không chỉ bị ẩn nút.

**Việc cần làm (làm lần lượt)**

1. Nối các nút ở T-39 với chức năng máy chủ ở T-43 (kiểu phòng, khoá, danh sách ở Sảnh) và T-44 (đổi chỗ, đuổi, chủ phòng rời, đóng phòng).
2. Chạy kịch bản nhiều người: đổi chỗ khi còn/hết chỗ, khoá phòng, đuổi người xem, chủ phòng rời, phòng kết thúc.
3. Với người bị đuổi: thử vào lại bằng mã cũ và thử gửi lệnh bằng kết nối cũ.
4. Kiểm đồng hồ 10 phút của phòng kết thúc khi phòng quay về "Đang chờ".
5. Với việc thu camera/mic, dọn chat: chỉ kiểm **thông báo đã phát**; thu thật kiểm ở Epic Chat, camera và micro.
6. Kiểm mời xuống ghế trên **ba tài khoản thật**: Từ chối giữ vai; Chấp nhận kiểm lại ghế, không có giữ chỗ; cùng lúc người khác vào ghế thì chỉ một người được ghế. Thành công còn phải Sẵn sàng. Kiểm cả phòng PUBLIC FINISHED còn mở và mục Sảnh đã cũ sau đổi kiểu/đóng phòng.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Xuống xem khi còn chỗ / hết chỗ / chủ phòng tự xuống | Đúng quyền và sức chứa; Sẵn sàng xoá |
| Khoá phòng; một ghế trống rồi người xem cũ lên ghế | Vẫn khoá; người cũ đổi vai hợp lệ, người mới bị chặn |
| Đuổi người xem rồi dùng mã cũ và kết nối cũ | Ra Sảnh, không nhận dữ liệu phòng, không vào lại được |
| Phòng kết thúc rồi quay về "Đang chờ" trước hạn | Đồng hồ cũ không đóng phòng mới |
| Chủ phòng mời một người xem lên ghế trống; mời khi ghế đã kín | Chỉ Chấp nhận mới xuống ghế; Từ chối vẫn xem; ghế bị chiếm thì giữ vai xem; thành công phải Sẵn sàng |
| Phòng đã đủ người xem; người xem thử đổi lấy chỗ | Nút "Vào xem" ở Sảnh mờ có chú thích; không vượt số người xem tối đa |
| Ví dụ nghiệm thu: A và C đánh xong, A rời, C thành chủ phòng, C mời B xuống ghế, B Chấp nhận rồi B và C bấm Sẵn sàng | Đếm ngược 3 giây rồi đấu tiếp; khoá phòng không tự mở khi một ghế trống |

**Cách tự kiểm tra**
Chuẩn bị: nhiều trình duyệt (chủ phòng, đối thủ, hai người xem).

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Đổi chỗ trong các ca còn chỗ / hết chỗ / chủ phòng tự xuống | Đúng quyền; Sẵn sàng xoá |
| 2 | Khoá phòng, rồi đổi vai người cũ và thử người mới | Người cũ hợp lệ; người mới bị chặn |
| 3 | Đuổi người xem; người này thử mã cũ và kết nối cũ | Mất quyền thật |
| 4 | Phòng kết thúc, quay về "Đang chờ" trước 10 phút | Phòng mới không bị đóng nhầm |
| 5 | Mời rồi Chấp nhận/Từ chối; ghế bị chiếm trước lúc nhận; thành công bấm Sẵn sàng | Không giữ ghế; Từ chối/ghế kín vẫn xem; Chấp nhận hợp lệ mới xuống ghế và không tự bắt đầu ván |
| 6 | Khoá phòng đủ 2 người; một ghế rời; người mới thử vào; người đang có mặt đổi vai hợp lệ; mở khoá rồi dùng mã cũ và mã mới | Phòng vẫn khoá, không tự mở; người đang có mặt giữ nguyên; mã cũ vô hiệu, mã mới dùng được |
| 7 | Chạy đúng ví dụ nghiệm thu A–C–B ở bảng lỗi | Đếm ngược rồi đấu tiếp |
| 8 | Thử phòng N=0, N=1 và N=5; với N=5 đủ 2 người chơi + 5 người xem rồi gửi thêm nhiều yêu cầu vào đồng thời | Không vượt trần từng phòng; N=5 tối đa 7 người, người xem thứ 6 bị từ chối; không dùng demo N=2 thay ca trần 5 |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt trên môi trường thử, kèm video.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Kết quả liên miền (thu camera/mic thật, dọn chat, xử thua khi rời giữa ván, kết nối lại) do các task của Epic khác kiểm.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** phòng nâng cao chạy thật cho chat, camera/mic, ván nâng cao và bạn bè.
**Không thuộc task này:** viết thêm giao diện còn thiếu (đã ở T-39), tái đấu, mã QR, sửa kết quả ván.
**Phục vụ (nguồn):** Story 8, 19, 20; tiêu chí AC-ROOM-04-03, AC-ROOM-05-04, AC-ROOM-06-02, AC-ROOM-06-03, AC-ROOM-06-05, AC-ROOM-07-01, AC-ROOM-07-02, AC-ROOM-07-05, AC-ROOM-08-03, AC-ROOM-09-01, AC-ROOM-09-02, AC-ROOM-10-01, AC-ROOM-10-02, AC-ROOM-11-01, AC-ROOM-11-04. Thuộc Epic: Phòng công khai, khoá phòng và người xem.
**Kết quả (đầu ra):** Điều khiển phòng nâng cao chạy thật trên web và máy chủ: đổi chỗ, khoá, danh sách, đuổi, chủ phòng rời.
**Bằng chứng nộp:** Video đa trình duyệt; báo cáo. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Người bị đuổi phải mất quyền thật, không chỉ ẩn nút.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-28, T-32, T-34, T-39, T-43, T-44; liên quan tới (relates to) Story 6, Story 8, Story 9, Story 19, Story 20; Epic: Phòng công khai, khoá phòng và người xem.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **4841_Lê Thị Xuân Nhạn**; Sprint **XIAN Sprint 3**; Fix version **v0.3**; Start date **2026-10-23**; Due date **2026-10-24**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/08-task-e6-cong-khai-khoa-xem.md` — T-46.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **4841_Lê Thị Xuân Nhạn**.
* Review/kiểm độc lập dự kiến: **Nguyễn Minh Thư**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-6](https://xiangqi-web.atlassian.net/browse/XIAN-6).

**Phải hoàn tất trước:**

* [T-28 — XIAN-62](https://xiangqi-web.atlassian.net/browse/XIAN-62)
* [T-32 — XIAN-66](https://xiangqi-web.atlassian.net/browse/XIAN-66)
* [T-34 — XIAN-68](https://xiangqi-web.atlassian.net/browse/XIAN-68)
* [T-39 — XIAN-73](https://xiangqi-web.atlassian.net/browse/XIAN-73)
* [T-43 — XIAN-77](https://xiangqi-web.atlassian.net/browse/XIAN-77)
* [T-44 — XIAN-78](https://xiangqi-web.atlassian.net/browse/XIAN-78)

**Story phục vụ:**

* [Story 6 — XIAN-14](https://xiangqi-web.atlassian.net/browse/XIAN-14)
* [Story 8 — XIAN-16](https://xiangqi-web.atlassian.net/browse/XIAN-16)
* [Story 9 — XIAN-17](https://xiangqi-web.atlassian.net/browse/XIAN-17)
* [Story 19 — XIAN-27](https://xiangqi-web.atlassian.net/browse/XIAN-27)
* [Story 20 — XIAN-28](https://xiangqi-web.atlassian.net/browse/XIAN-28)

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
| Bắt đầu thực hiện | 2026-10-23 13:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-23 18:00 |
| Bắt đầu review | 2026-10-24 09:00 |
| Review PASS và bàn giao mục tiêu | 2026-10-24 10:00 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-50 — Máy chủ: người xem theo dõi trực tiếp, lọc dữ liệu theo vai trò

**Jira thực:** [XIAN-84](https://xiangqi-web.atlassian.net/browse/XIAN-84) · **Loại:** Task · **Assignee:** nguyenhoangtungtuyhoa · **Sprint:** XIAN Sprint 3 · **Fix version:** v0.3
**Components:** Game Server · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `US-PLAY-03`, `US-PLAY-09`, `xiangqi-mvp-20261005`, `t-50`
**Ước lượng:** 4.5 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-22 · **Due date:** 2026-10-23 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Phòng công khai, khoá phòng và người xem · **Components:** Game Server
**Phải xong trước:**

* **T-19 — Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh**: Chức năng vào phòng bằng mã, đường dẫn, Sảnh: xếp ghế hoặc người xem, kiểm sức chứa, chặn sai mã.
* **T-27 — Máy chủ: bộ xử lý lệnh của ván và xử lý nước đi**: Bộ xử lý lệnh của ván (hàng đợi, mã yêu cầu, phiên bản, biên lai, lỗi ghi) và xử lý nước đi.
* **T-29 — Máy chủ: đồng hồ ván, kết thúc ván, đầu hàng, xin hoà**: Đồng hồ ván do máy chủ tính, hết giờ, đóng băng khi lỗi ghi; kết thúc ván, đầu hàng, xin hoà.
* **T-34 — Nghiệm thu bản chơi được: đăng ký, tạo phòng, mời, đánh online và đánh với máy chạy trọn**: Bản chơi được đã PASS M1–M4 trên bản chạy thật; báo cáo hoàn tất nhưng chưa đạt không mở phần làm sau, trừ PO cho phép rõ ràng.
* **T-44 — Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng**: Đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời và chuyển quyền, đóng phòng, quay về phòng chờ sau ván. Mời xuống ghế cần Chấp nhận; không giữ ghế, kiểm lại điều kiện lúc nhận và reset Sẵn sàng.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Cho **người xem hợp lệ** nhận luồng trạng thái ván **chỉ đọc** (bàn cờ, giờ, nước đi, kết quả, số người xem X/N). Dữ liệu được **lọc ở máy chủ trước khi gửi**, không gửi hết rồi ẩn ở giao diện.

**Việc cần làm (làm lần lượt)**

1. Chỉ người đã được xác nhận là người xem hợp lệ của phòng mới nhận được luồng.
2. Gửi cho người xem: thế cờ, lượt, **giờ còn lại và mốc lượt do máy chủ tính**, nước vừa đi, kết quả, số người xem hiện tại / tối đa. **Không gửi** kênh chat riêng của hai người chơi, email hay bất cứ thông tin riêng.
3. Người xem gửi lệnh đi nước, đầu hàng… đều **bị từ chối**.
4. Khi người xem bị đuổi hoặc hết thời gian giữ chỗ → **ngừng gửi** dữ liệu; nối lại hợp lệ thì **đồng bộ lại** trạng thái đầy đủ.
5. Không cố ý làm chậm người xem.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Người xem đã được phép vào xem | Nhận nước đi và kết quả ngay khi có |
| Người xem dùng công cụ gửi nước đi hoặc lệnh đầu hàng | Máy chủ từ chối; ván không đổi |
| So dữ liệu người xem và người ngoài phòng | Không có chat riêng, email; người ngoài không nhận gì |
| Người xem đã bị đuổi, hoặc hết thời gian giữ chỗ, rồi xin tải lại thế cờ | Không nhận dữ liệu mới |
| Người xem vào giữa lượt, đồng bộ lại sau nước đi | Giờ và lượt khớp trạng thái máy chủ; chỉ để hiển thị |

**Cách tự kiểm tra**

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Người xem hợp lệ xem một ván có nước đi và kết quả | Nhận trực tiếp |
| 2 | Người xem dùng công cụ gửi nước đi hoặc lệnh đầu hàng | Máy chủ từ chối, ván không đổi |
| 3 | So dữ liệu thô của người xem và người ngoài | Không lộ chat riêng, email; người ngoài không nhận |
| 4 | Đuổi người xem rồi xin đồng bộ | Không nhận thêm |
| 5 | Cho người xem vào giữa lượt | Giờ và lượt khớp |

**Khi nào chuyển cho người kiểm thử:** cả 5 dòng đạt, đã đối chiếu dữ liệu thô gửi đi.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Độ trễ người xem đo ở bài tải (T-63).

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** luồng người xem cho tích hợp ván nâng cao, chat và bài tải.
**Không thuộc task này:** phát camera hay micro cho người xem, xem lại ván, giao diện.
**Phục vụ (nguồn):** Story 17, 21; tiêu chí AC-PLAY-03-03, AC-PLAY-09-01, AC-PLAY-09-02, AC-PLAY-09-03; NFR-01, NFR-04. Thuộc Epic: Phòng công khai, khoá phòng và người xem.
**Kết quả (đầu ra):** Người xem nhận trạng thái ván chỉ đọc, dữ liệu lọc ở máy chủ, thấy X/N người xem.
**Bằng chứng nộp:** Dữ liệu thô gửi cho người xem và người ngoài. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Độ trễ đo ở bài tải.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-19, T-27, T-29, T-34, T-44; liên quan tới (relates to) Story 17, Story 21; Epic: Phòng công khai, khoá phòng và người xem.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **nguyenhoangtungtuyhoa**; Sprint **XIAN Sprint 3**; Fix version **v0.3**; Start date **2026-10-22**; Due date **2026-10-23**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/08-task-e6-cong-khai-khoa-xem.md` — T-50.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **nguyenhoangtungtuyhoa**.
* Review/kiểm độc lập dự kiến: **Võ Thành Đông**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-6](https://xiangqi-web.atlassian.net/browse/XIAN-6).

**Phải hoàn tất trước:**

* [T-19 — XIAN-53](https://xiangqi-web.atlassian.net/browse/XIAN-53)
* [T-27 — XIAN-61](https://xiangqi-web.atlassian.net/browse/XIAN-61)
* [T-29 — XIAN-63](https://xiangqi-web.atlassian.net/browse/XIAN-63)
* [T-34 — XIAN-68](https://xiangqi-web.atlassian.net/browse/XIAN-68)
* [T-44 — XIAN-78](https://xiangqi-web.atlassian.net/browse/XIAN-78)

**Story phục vụ:**

* [Story 17 — XIAN-25](https://xiangqi-web.atlassian.net/browse/XIAN-25)
* [Story 21 — XIAN-29](https://xiangqi-web.atlassian.net/browse/XIAN-29)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 3 | nguyenhoangtungtuyhoa |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 1 | nguyenhoangtungtuyhoa |
| Review độc lập | 0.5 | Võ Thành Đông |
| Tổng Original/Remaining Estimate ban đầu | 4.5 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc phạm vi hẹp/cấu hình/giao diện hoặc nối chức năng đã có đầu vào: ca thực hiện ngắn, kiểm và review riêng. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-22 16:30 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-23 11:30 |
| Bắt đầu review | 2026-10-23 11:30 |
| Review PASS và bàn giao mục tiêu | 2026-10-23 12:00 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---
