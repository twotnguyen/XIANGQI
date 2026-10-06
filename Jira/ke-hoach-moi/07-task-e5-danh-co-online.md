# Task của Epic "Hai người đánh cờ qua mạng" (8 task)

**Ngày cập nhật:** 2026-10-05 · **Trạng thái:** đã được PO cho phép tạo và phân công ngày 05/10/2026 · Đã tạo Epic/Story/Task trên XIAN · Viết theo `00-chuan-description.md` và mẫu `00b`.

Mã task `T-01` đến `T-64` đánh theo **thứ tự làm** (số nhỏ làm trước, mỗi task chỉ cần các task có số nhỏ hơn). Một số task gộp nhiều việc nhỏ cùng mục đích thành một task. Ngày Sprint: 1 = 04/10–07/10, 2 = 08/10–10/10, 3 = 11/10–14/10, 4 = 15/10–17/10.

---

### T-24 — Giao diện ván: bàn cờ nối mạng, đồng hồ, nút, hộp kết quả, khung xin hoà

**Jira thực:** [XIAN-58](https://xiangqi-web.atlassian.net/browse/XIAN-58) · **Loại:** Task · **Assignee:** Nguyễn Minh Thư · **Sprint:** XIAN Sprint 2 · **Fix version:** v0.2
**Components:** Frontend · **Priority:** High · **Nhãn:** `P1`, `loi`, `US-BOARD-02`, `US-PLAY-01`, `US-PLAY-02`, `US-PLAY-03`, `US-PLAY-04`, `US-PLAY-05`, `US-PLAY-06`, `xiangqi-mvp-20261005`, `t-24`
**Ước lượng:** 7 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-13 · **Due date:** 2026-10-13 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Hai người đánh cờ qua mạng · **Components:** Frontend
**Phải xong trước:**

* **T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ**: Gói hợp đồng chung biên dịch được, có danh sách lệnh, thông tin đi kèm, nhóm lỗi và ví dụ hợp lệ/sai dùng được ở cả giao diện và máy chủ.
* **T-07 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)**: Ứng dụng web chạy được, có kiểu chữ/màu Kỳ Đài Cổ Phong, các khối nền (nút, ô nhập, hộp thoại, thông báo, chú thích, khung xương) đủ 5 trạng thái và trang kiểm tra nội bộ.
* **T-20 — Giao diện: kéo thả quân, đánh dấu nước vừa đi, cảnh báo chiếu, âm thanh**: Kéo thả, dấu nước vừa đi, cảnh báo chiếu, 4 âm Web Audio, nút tắt tiếng.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Dựng **màn hình ván** để nối với máy chủ sau: bàn cờ, đồng hồ, nút đầu hàng và xin hoà, hộp kết quả, khung đề nghị hoà. Làm với dữ liệu giả; chưa phải bằng chứng ván online đã chạy.

**Việc cần làm (làm lần lượt)**

1. Dựng màn hình với 5 trạng thái và hai vai: **người chơi** và **người xem** (người xem chỉ đọc).
2. **Chờ xác nhận:** sau khi đi, quân hiển thị **mờ** cho đến khi máy chủ xác nhận; bị từ chối thì quân về chỗ cũ và có thông báo.
3. **Đồng hồ** hai bên theo dữ liệu máy chủ; còn **dưới 30 giây** thì cảnh báo bằng chữ và biểu tượng (không chỉ màu).
4. **Đầu hàng:** hộp xác nhận, focus mặc định vào "Huỷ".
5. **Xin hoà:** khung đề nghị **không phải hộp thoại chặn**; nút X hoặc Esc chỉ **thu gọn**, **không** nghĩa là từ chối; hạn vẫn chạy.
6. **Hộp kết quả:** ở giai đoạn này chỉ có nút **Rời phòng** (chưa có tái đấu).
7. Ghép kéo thả (T-20) vào cùng luồng ý định đi nước như bấm; kiểm thả sai và chờ xác nhận trên cả hai hướng bàn.

**Thành phần màn hình phải có (theo danh mục màn hình, chỉ phần P1 (MVP))**
_Màn hình Ván đấu_ (`SCR-GAME-ROOM`)

* Bố cục ba cột: **trái** thẻ người chơi và đồng hồ hai bên, kèm **chỗ gắn** khung camera/micro; **giữa** bàn cờ SVG, dòng trạng thái lượt đi và cụm nút; **phải** **chỗ gắn** danh sách người xem và khung chat hai kênh. Ở bản chơi được các chỗ gắn này chưa có nội dung, hiện gọn kèm "Sắp ra mắt"; nội dung do các task camera/micro (T-36), người xem (T-39) và chat (T-56) ở giai đoạn mở rộng gắn vào.
* Bàn cờ lật khi cầm quân Đen; đi bằng bấm hoặc kéo thả; chấm ô đi hợp lệ, vòng cố định quanh quân ăn được, bốn góc đánh dấu nước vừa đi, vòng cảnh báo chiếu kèm chữ "Đang bị chiếu" (không nhấp nháy).
* Cụm nút: **tắt/bật âm thanh**, **Đầu hàng** (mở hộp xác nhận), **Xin hoà** (khi mờ có chú thích lý do). Nút Xin đi lại **ẩn**.
* Bảng **nước đi** ký hiệu tiếng Việt tự cuộn; quân vừa đi hiển thị mờ chờ máy chủ xác nhận.
* Đồng hồ dưới 30 giây có cảnh báo chữ và biểu tượng; ván kết thúc thì hiện hộp kết quả.

_Khung Đề nghị hoà_ (`MODAL-DRAW-PROMPT`)

* Hiện ở phía người nhận với **đếm lùi 30 giây**, nút **Chấp nhận Hoà** và **Từ chối**.
* **Không chặn** bàn cờ, không giữ focus; đồng hồ ván vẫn chạy; nút X hoặc Esc chỉ **thu gọn**, có nút mở lại, hạn vẫn chạy; chỉ Từ chối mới gửi phản hồi từ chối.
* Phía người gửi thấy "Đang chờ đối thủ trả lời…" và nút **Rút đề nghị**.

_Hộp xác nhận Đầu hàng_ (`MODAL-CONFIRM-RESIGN`)

* Nội dung: "Bạn sẽ thua ván này ngay lập tức."; focus mặc định ở nút **Huỷ**; nút Đồng ý đầu hàng.

_Hộp xác nhận Rời phòng khi đang đấu_ (`MODAL-CONFIRM-LEAVE`)

* Nội dung: "Rời lúc này được tính là đầu hàng."; hai nút **Rời phòng** và **Ở lại**.

_Hộp Kết quả ván_ (`MODAL-MATCH-RESULT`)

* Biểu ngữ **thắng / thua / hoà** kèm lý do (chiếu hết, hết nước, đầu hàng, hết giờ, mất kết nối, lặp thế, hoà thoả thuận, 120 nửa nước, chiếu liên tục).
* Ván gián đoạn do máy chủ khởi động lại: kết quả trung tính "Ván bị gián đoạn" (không thắng thua hoà, không đổi điểm).
* Chỉ có nút **Rời phòng** (không Tái đấu, không Xem lại).

_Lớp phủ Mất kết nối_ (`OVERLAY-RECONNECTING`)

* Phủ mờ toàn màn hình khi đứt kết nối; **không đóng được bằng Esc**.
* Người đang đấu: đếm lùi **60 giây**; quá hạn thì thua; đồng hồ ván vẫn chạy.
* Người ở phòng chờ hoặc phòng kết thúc: giữ ghế 60 giây rồi mất ghế (không thua). Người xem: giữ chỗ 5 phút.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**

| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
| --- | --- | --- | --- | --- | --- |
| Màn hình Ván đấu | Thế cờ, giờ và lượt đi khớp với máy chủ | Đợi máy chủ gửi thế cờ hoặc xác nhận nước đi | Chưa có nước: thế đầu và hướng dẫn, không bàn trắng | Mất mạng hoặc ghi lỗi: không hiện nước đi sai; tự nối lại theo quy tắc rớt mạng | Chưa đến lượt, chỉ được xem, tab này đã bị tab khác tiếp quản, hoặc ván đã kết thúc |
| Khung Đề nghị hoà | Đề nghị còn hạn, trả lời đúng tác động | Đang gửi/rút/trả lời; không dừng đồng hồ | Không còn đề nghị: gỡ khung/nút mở lại | Phản hồi lỗi: kiểm lại hạn và trạng thái, không báo hoà sai | Hết hạn/đã rút/đã kết thúc hoặc không phải người nhận |
| Hộp xác nhận Đầu hàng | Xác nhận: đầu hàng; Huỷ không đổi ván | Đợi máy chủ xác nhận; chặn bấm trùng | Không còn ván đang chơi: đóng, hiện kết quả thật | Không nhận được xác nhận: kiểm lại với máy chủ, không báo thua sai | Ván kết thúc, tab đã bị tab khác tiếp quản, hoặc không phải người chơi |
| Hộp xác nhận Rời phòng khi đang đấu | Rời/Đăng xuất giữa ván xác nhận hậu quả | Đợi xử lý rời/đầu hàng | Không còn mục tiêu: đóng, về trạng thái hiện tại | Lỗi xử lý: giữ thông báo và kiểm lại với máy chủ | Đã xử lý hoặc không còn quyền điều khiển |
| Hộp Kết quả ván | Kết quả/lý do đúng; nút theo phân kỳ | Đợi kết quả chính thức từ máy chủ | Chưa có kết quả: đợi và kiểm lại với máy chủ, không tự đoán thắng thua | Tải kết quả lỗi: Thử lại, không cho đi thêm | Nút Tái đấu và Xem lại ẩn ở P1 (MVP) |
| Lớp phủ Mất kết nối | Đã nối lại, nhận lại thế cờ rồi tự tắt | Nối lại kèm thời hạn đúng vai trò | Không mất kết nối: overlay không hiện | Quá hạn: kết quả/mất ghế/về Sảnh đúng loại | Không Esc/bấm ngoài; chặn lệnh cần kết nối |

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Đi nước, máy chủ trễ rồi từ chối | Quân mờ lúc chờ; bị từ chối thì về chỗ cũ |
| Giờ xuống dưới 30 giây | Cảnh báo có chữ và biểu tượng |
| Bấm Esc hoặc X trên khung xin hoà, rồi mở lại trong thời hạn | Hạn vẫn chạy, không gửi từ chối |
| Ván kết thúc; vào bằng vai người xem | Chỉ đọc; chỉ nút Rời phòng, không có nút của P2 |
| Kéo hợp lệ và sai, chờ xác nhận; lặp trên bàn lật Đen | Đúng toạ độ; sai trượt về; cùng trạng thái chờ như bấm |
| Bị từ chối hoặc hết hạn xin hoà rồi xin lại khi chưa đi đủ 5 nước của mình | Nút Xin hoà mờ kèm chú thích số nước còn phải đi |

**Cách tự kiểm tra**
Chuẩn bị: dữ liệu giả cho trạng thái ván, giờ, phản hồi, kết quả.

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Đi nước, trì hoãn rồi từ chối | Mờ rồi về chỗ cũ |
| 2 | Cho giờ về 30 giây rồi thấp hơn | Cảnh báo chữ + biểu tượng |
| 3 | Thu gọn khung xin hoà rồi mở lại | Hạn vẫn chạy |
| 4 | Kết thúc ván; vào vai người xem | Chỉ đọc, chỉ Rời phòng |
| 5 | Kéo hợp lệ và sai trên bàn lật | Đúng toạ độ, sai về chỗ cũ |
| 6 | Xin hoà bị từ chối rồi xin lại sớm hơn 5 nước của mình | Nút mờ, chú thích số nước còn lại |
| 7 | Đối chiếu từng gạch đầu dòng ở phần "Thành phần màn hình phải có" với màn hình thật, và đủ 5 trạng thái ở bảng nghiệm thu | Không thiếu, không thừa; chức năng chưa làm mờ hoặc ẩn đúng quy tắc |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt, đủ 5 trạng thái, kèm ảnh.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. **Không** báo "ván online đã chạy" trước khi nối thật (T-30).

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** màn hình ván cho tích hợp đi nước, tích hợp đồng hồ/kết thúc và ván với máy.
**Không thuộc task này:** gọi máy chủ thật, tái đấu, xem lại ván, đi lại.
**Phục vụ (nguồn):** Story 14, 15, 16, 17, 18; tiêu chí AC-BOARD-02-03, AC-PLAY-01-04, AC-PLAY-02-03, AC-PLAY-03-02, AC-PLAY-04-01, AC-PLAY-05-01, AC-PLAY-05-03, AC-PLAY-05-04, AC-PLAY-06-01. Thuộc Epic: Hai người đánh cờ qua mạng.
**Kết quả (đầu ra):** Màn ván: bàn cờ, đồng hồ, nút Đầu hàng/Xin hoà, hộp kết quả, khung xin hoà, lớp phủ mất kết nối; 5 trạng thái, dữ liệu giả.
**Bằng chứng nộp:** Ảnh chụp trạng thái; kiểm bàn phím và focus. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Chưa là bằng chứng ván online đã chạy.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-02, T-07, T-20; liên quan tới (relates to) Story 14, Story 15, Story 16, Story 17, Story 18; Epic: Hai người đánh cờ qua mạng.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Nguyễn Minh Thư**; Sprint **XIAN Sprint 2**; Fix version **v0.2**; Start date **2026-10-13**; Due date **2026-10-13**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/07-task-e5-danh-co-online.md` — T-24.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Nguyễn Minh Thư**.
* Review/kiểm độc lập dự kiến: **4841_Lê Thị Xuân Nhạn**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-5](https://xiangqi-web.atlassian.net/browse/XIAN-5).

**Phải hoàn tất trước:**

* [T-02 — XIAN-36](https://xiangqi-web.atlassian.net/browse/XIAN-36)
* [T-07 — XIAN-41](https://xiangqi-web.atlassian.net/browse/XIAN-41)
* [T-20 — XIAN-54](https://xiangqi-web.atlassian.net/browse/XIAN-54)

**Story phục vụ:**

* [Story 14 — XIAN-22](https://xiangqi-web.atlassian.net/browse/XIAN-22)
* [Story 15 — XIAN-23](https://xiangqi-web.atlassian.net/browse/XIAN-23)
* [Story 16 — XIAN-24](https://xiangqi-web.atlassian.net/browse/XIAN-24)
* [Story 17 — XIAN-25](https://xiangqi-web.atlassian.net/browse/XIAN-25)
* [Story 18 — XIAN-26](https://xiangqi-web.atlassian.net/browse/XIAN-26)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 5 | Nguyễn Minh Thư |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 1 | Nguyễn Minh Thư |
| Review độc lập | 1 | 4841_Lê Thị Xuân Nhạn |
| Tổng Original/Remaining Estimate ban đầu | 7 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc có luật nghiệp vụ, xử lý trạng thái, tích hợp hoặc kiểm định chất lượng: dành ca dài hơn và dự phòng sửa lỗi. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-13 09:30 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-13 16:30 |
| Bắt đầu review | 2026-10-13 16:30 |
| Review PASS và bàn giao mục tiêu | 2026-10-13 17:30 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-27 — Máy chủ: bộ xử lý lệnh của ván và xử lý nước đi

**Jira thực:** [XIAN-61](https://xiangqi-web.atlassian.net/browse/XIAN-61) · **Loại:** Task · **Assignee:** TÌNH 4851_NGUYỄN NGỌC · **Sprint:** XIAN Sprint 2 · **Fix version:** v0.2
**Components:** Game Server · **Priority:** High · **Nhãn:** `P1`, `loi`, `US-PLAY-01`, `US-PLAY-07`, `xiangqi-mvp-20261005`, `t-27`
**Ước lượng:** 14 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-13 · **Due date:** 2026-10-15 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Hai người đánh cờ qua mạng · **Components:** Game Server
**Phải xong trước:**

* **T-04 — Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập**: Các tệp tạo bảng và quy tắc quyền truy cập chạy được trên cơ sở dữ liệu thử; ràng buộc (một ghế mỗi người, số người xem 0–5, tên không trùng không phân biệt hoa thường).
* **T-08 — Luật cờ: nước hợp lệ, chiếu, chiếu hết, hết nước, lặp thế, 120 nửa nước**: Nước hợp lệ, chiếu, chiếu hết, hết nước, hai Tướng đối mặt, lặp thế, chiếu liên tục, 120 nửa nước.
* **T-09 — Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ**: Bộ lọc từ cấm dùng chung, cơ chế chống làm hai lần (biên lai theo người gửi và mã yêu cầu), bộ giới hạn tốc độ với các mức đã chốt; kèm ví dụ cách dùng.
* **T-23 — Máy chủ: chọn ghế, Sẵn sàng, đếm 3 giây, bắt đầu ván**: Chọn ghế, Sẵn sàng, đếm 3 giây, tạo đúng một ván với thế ban đầu và lượt Đỏ; huỷ đếm khi điều kiện đổi. Mất mạng khi đếm huỷ/reset cả hai Sẵn sàng và giữ ghế 60 giây; chưa có ván không tạo thua.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Dựng **"đường ống" chung** để xử lý mọi lệnh của một ván: lệnh xếp hàng lần lượt, gửi lại không làm hai lần, lệnh cũ bị từ chối, và biết phải làm gì khi ghi dữ liệu thất bại. Các task đi nước, đồng hồ, kết thúc ván đều chạy trên đường ống này.

Nhận lệnh **đi nước** từ người chơi, kiểm tra theo luật cờ chung, cập nhật thế cờ và **phát trạng thái mới** cho mọi người trong phòng để các trình duyệt đồng bộ. **Không bao giờ tin thế cờ do trình duyệt gửi**; chỉ nhận nước đi.

**Việc cần làm (làm lần lượt)**

1. Nhận lệnh, xác định người gửi, **tra biên lai** theo (người gửi, mã yêu cầu). Nếu đã xử lý, trả kết quả cũ ngay.
2. Lệnh mới: kiểm tra quyền, trạng thái ván và **phiên bản ván** (phiên bản cũ thì từ chối).
3. Xếp lệnh vào **hàng đợi riêng của ván**, xử lý từng cái.
4. Ghi thay đổi ván và biên lai **trong cùng một giao dịch**; chỉ công bố trạng thái mới **sau khi** ghi thành công.
5. **Ghi lỗi**: bỏ bản nháp, thử lại tối đa 2 lần cách 200 ms; vẫn lỗi thì báo lỗi ghi, chuyển ván sang **tạm dừng ghi**, phát tín hiệu nội bộ kèm **mốc thời gian của lỗi đầu tiên**, không phát trạng thái "thành công".
6. **Phục hồi:** nếu tiến trình còn sống và dữ liệu hồi lại trong **30 giây** thì phát tín hiệu cho phép tiếp tục; quá 30 giây thì chuyển ván sang **gián đoạn** (không hồi sinh).
7. Với đồng hồ thật làm ở task sau, task này dùng một **đồng hồ thử** để kiểm tín hiệu.
8. Nhận lệnh đi nước (điểm đi, điểm đến theo toạ độ gốc) qua bộ xử lý lệnh nói ở các bước trên; kiểm tra người gửi **đúng ghế, đúng lượt**.
9. Dùng luật chung (hàm nước hợp lệ) kiểm tra nước đi; sai thì **từ chối, thế cờ không đổi**, trả lý do và trạng thái mới nhất.
10. Hợp lệ: tạo thế mới, cập nhật lượt, nước vừa đi, các bộ đếm lặp thế và 120 nửa nước; **ghi nước đi vào lịch sử**; giữ chỗ để task đồng hồ kiểm giờ trước khi áp dụng nước.
11. Ghi xong mới **phát trạng thái mới** (kèm số phiên bản) theo quyền từng người.
12. Ghi nhật ký (không chứa bí mật) khi ghi dữ liệu lỗi, khi ván chuyển sang gián đoạn hoặc khi tạm dừng ghi.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Hai lệnh cùng mã yêu cầu; gửi lại sau khi phiên bản ván đã đổi | Một tác dụng; gửi lại nhận kết quả cũ trước cả kiểm phiên bản |
| Mã yêu cầu mới nhưng phiên bản ván cũ hoặc sai quyền | Bị từ chối, dữ liệu không đổi |
| Lỗi ghi trước khi hoàn tất | Bỏ bản nháp, tối đa 2 lần thử lại cách 200 ms, báo lỗi ghi; không phát thành công; mốc lỗi đầu tiên được ghi |
| Hồi phục trong hạn / đúng 30 giây / quá 30 giây | Tiếp tục / (theo quy tắc hạn) / gián đoạn; ván đã gián đoạn không sống lại |
| Ghi xong nhưng mất phản hồi; khởi động lại bộ xử lý; gửi lại cùng lệnh | Đọc biên lai đã lưu, không làm lại |
| Đổi vai người chơi rồi đọc lại biên lai | Không tác dụng lần hai, không lộ dữ liệu ngoài quyền |
| Nước hợp lệ của Đỏ rồi của Đen | Mỗi nước một bản ghi; lượt và phiên bản tiến đúng |
| Người xem, người ngoài, hoặc người sai lượt gửi nước | Không đổi thế, không ghi nước |
| Nước làm hai Tướng đối mặt hoặc tự bị chiếu | Bị từ chối, thế giữ nguyên |
| Gửi lại cùng lệnh; lệnh mới có phiên bản cũ | Không thêm nước; hai phản hồi khác nhau, đúng |

**Cách tự kiểm tra**
Chuẩn bị: cơ sở dữ liệu thử, khả năng gây lỗi ghi, đồng hồ thử; một ván thử có hai người chơi và một người xem.

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Gửi hai lệnh cùng mã; gửi lại sau khi phiên bản đổi | Một tác dụng; kết quả cũ |
| 2 | Lệnh mã mới nhưng phiên bản cũ; lệnh sai quyền | Từ chối, dữ liệu không đổi |
| 3 | Gây lỗi ghi trước hoàn tất | Bỏ bản nháp, 2 lần thử lại, báo lỗi, không phát thành công |
| 4 | Cho đồng hồ thử tiến: trong hạn, đúng 30 giây, quá 30 giây | Quá hạn mới gián đoạn; gián đoạn rồi thì không sống lại |
| 5 | Ghi xong rồi mất phản hồi, khởi động lại, gửi lại | Không làm lại |
| 6 | Đổi vai rồi đọc lại biên lai | Không làm lần hai, không lộ dữ liệu |
| 7 | Đỏ đi một nước hợp lệ, Đen đi một nước | Hai nước được lưu, lượt và phiên bản tiến đúng |
| 8 | Người xem, người ngoài, người sai lượt gửi nước | Không có gì thay đổi |
| 9 | Gửi nước làm lộ Tướng hoặc tự chiếu | Từ chối, thế giữ nguyên |
| 10 | Gửi lại cùng lệnh; gửi lệnh mới với phiên bản cũ | Không thêm nước; phản hồi phân biệt đúng |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt; ghi rõ phần dùng đồng hồ thử.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý. **Chưa** khẳng định đồng hồ thật đã đóng băng hay khởi động lại máy chủ đã đúng (làm ở T-29 và T-51). Yêu cầu "xử lý nước dưới 100 ms" chỉ đo được khi cả luồng đã nối với trình duyệt (T-30) và khi chạy bài tải (T-63).

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** đường ống xử lý lệnh, tín hiệu lỗi ghi và phục hồi cho xử lý nước đi, đồng hồ, kết thúc ván; xử lý nước đi cho đồng hồ, kết thúc ván, người xem, bảng nước đi và tích hợp.
**Không thuộc task này:** đồng hồ thật; kết thúc ván; tính điểm Elo; ván với máy; đi lại; xem lại ván.
**Phục vụ (nguồn):** Story 15, 18; tiêu chí AC-PLAY-01-01, AC-PLAY-01-02, AC-PLAY-01-03, AC-PLAY-07-04; NFR-01, NFR-04. Thuộc Epic: Hai người đánh cờ qua mạng.
**Kết quả (đầu ra):** Bộ xử lý lệnh của ván (hàng đợi, mã yêu cầu, phiên bản, biên lai, lỗi ghi) và xử lý nước đi.
**Bằng chứng nộp:** Kết quả thử 6+4 ca; dữ liệu và trạng thái phát khớp nhau. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Yêu cầu dưới 100 ms chỉ đo được khi đã nối web và chạy bài tải.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-04, T-08, T-09, T-23; liên quan tới (relates to) Story 15, Story 18; Epic: Hai người đánh cờ qua mạng.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **TÌNH 4851_NGUYỄN NGỌC**; Sprint **XIAN Sprint 2**; Fix version **v0.2**; Start date **2026-10-13**; Due date **2026-10-15**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/07-task-e5-danh-co-online.md` — T-27.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **TÌNH 4851_NGUYỄN NGỌC**.
* Review/kiểm độc lập dự kiến: **nguyenhoangtungtuyhoa**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-5](https://xiangqi-web.atlassian.net/browse/XIAN-5).

**Phải hoàn tất trước:**

* [T-04 — XIAN-38](https://xiangqi-web.atlassian.net/browse/XIAN-38)
* [T-08 — XIAN-42](https://xiangqi-web.atlassian.net/browse/XIAN-42)
* [T-09 — XIAN-43](https://xiangqi-web.atlassian.net/browse/XIAN-43)
* [T-23 — XIAN-57](https://xiangqi-web.atlassian.net/browse/XIAN-57)

**Story phục vụ:**

* [Story 15 — XIAN-23](https://xiangqi-web.atlassian.net/browse/XIAN-23)
* [Story 18 — XIAN-26](https://xiangqi-web.atlassian.net/browse/XIAN-26)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 10 | TÌNH 4851_NGUYỄN NGỌC |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 2 | TÌNH 4851_NGUYỄN NGỌC |
| Review độc lập | 2 | nguyenhoangtungtuyhoa |
| Tổng Original/Remaining Estimate ban đầu | 14 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc có luật nghiệp vụ, xử lý trạng thái, tích hợp hoặc kiểm định chất lượng: dành ca dài hơn và dự phòng sửa lỗi. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-13 14:30 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-15 09:30 |
| Bắt đầu review | 2026-10-15 09:30 |
| Review PASS và bàn giao mục tiêu | 2026-10-15 11:30 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-29 — Máy chủ: đồng hồ ván, kết thúc ván, đầu hàng, xin hoà

**Jira thực:** [XIAN-63](https://xiangqi-web.atlassian.net/browse/XIAN-63) · **Loại:** Task · **Assignee:** TÌNH 4851_NGUYỄN NGỌC · **Sprint:** XIAN Sprint 2 · **Fix version:** v0.2
**Components:** Game Server · **Priority:** High · **Nhãn:** `P1`, `loi`, `US-PLAY-02`, `US-PLAY-03`, `US-PLAY-04`, `US-PLAY-05`, `US-PLAY-08`, `xiangqi-mvp-20261005`, `t-29`
**Ước lượng:** 12 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-15 · **Due date:** 2026-10-16 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Hai người đánh cờ qua mạng · **Components:** Game Server
**Phải xong trước:**

* **T-27 — Máy chủ: bộ xử lý lệnh của ván và xử lý nước đi**: Bộ xử lý lệnh của ván (hàng đợi, mã yêu cầu, phiên bản, biên lai, lỗi ghi) và xử lý nước đi.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Để **máy chủ quyết định thời gian còn lại và việc hết giờ**. Đồng hồ trên trình duyệt chỉ để hiển thị, không bao giờ thay đổi được kết quả.

Chốt **mọi cách kết thúc** một ván Đánh Thường: chiếu hết hoặc hết nước đi (thua), chiếu liên tục (thua), lặp thế và 120 nửa nước (hoà), **đầu hàng**, và **xin hoà**. Một ván chỉ được kết thúc **một lần**.

**Việc cần làm (làm lần lượt)**

1. Khi ván bắt đầu, **chạy đồng hồ của bên Đỏ** từ mốc bắt đầu; mỗi bên có 5, 10 hoặc 15 phút (theo mức chọn), **không cộng giây**.
2. Dùng đồng hồ **đơn điệu** của máy chủ (không bị ảnh hưởng nếu giờ hệ thống bị chỉnh); trừ giờ của bên đang đi **trước khi** xét nước đi.
3. Hết giờ trước khi nước đi được áp dụng → **kết thúc ván: bên đó thua do hết giờ**, nước đó không được ghi.
4. Đặt hạn hết giờ tuyệt đối cho lượt hiện tại; khi đổi lượt phải **huỷ bộ hẹn cũ** để không kết thúc nhầm.
5. **Nối tín hiệu lỗi ghi** từ T-27: từ lỗi đầu tiên **đóng băng cả hai đồng hồ**; phục hồi trong 30 giây thì chạy tiếp; quá 30 giây thì ván gián đoạn và không chạy tiếp.
6. **Phân xử khi hết giờ trùng với mất kết nối** (giả lập): hết giờ sớm hơn hoặc **bằng** hạn mất kết nối thì **hết giờ được ưu tiên**; kết quả không phụ thuộc thứ tự các bộ hẹn chạy.
7. Gửi giờ còn lại cho trình duyệt trong trạng thái ván.
8. Sau mỗi nước, dùng luật chung xét theo thứ tự: chiếu hết/hết nước → chiếu liên tục → lặp thế → 120 nửa nước.
9. **Đầu hàng**: người chơi (đã xác nhận ở giao diện) thua ngay.
10. **Xin hoà:** người chơi gửi đề nghị; **chỉ một đề nghị cùng lúc**; đối thủ đồng ý → hoà; từ chối hoặc **30 giây không trả lời** → đề nghị hết; người xin chỉ xin lại được sau khi đi thêm **5 nước của chính mình**. Người xin được rút đề nghị.
11. Kết thúc: ghi kết quả và lý do **một lần**, ngừng nhận nước đi, **huỷ đề nghị hoà đang chờ**, thông báo cho cả phòng.
12. Khi đầu hàng, nước kết thúc và phản hồi hoà đến cùng lúc, chỉ **một** kết quả được chốt; phản hồi đến muộn vô hiệu.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Khởi tạo ván 5, 10, 15 phút; đi nước | Chỉ bên đang đi giảm giờ; không cộng giây |
| Nước đến khi giờ còn đúng 0 | Hết giờ, nước đó không áp dụng |
| Bên kia đã đi nước, nhưng bộ hẹn giờ của lượt trước chạy muộn báo hết giờ | Không xử thua nhầm; ván tiếp tục |
| Lỗi ghi (qua T-27), hồi phục trong hạn / quá 30 giây | Cả hai đồng hồ đóng băng; chỉ ván còn tiếp tục mới chạy lại; gián đoạn thì không chạy |
| Hết giờ trước / sau / bằng mốc mất kết nối giả lập; đảo thứ tự bộ hẹn | Hết giờ / mất kết nối / hết giờ; luôn một kết quả |
| Ván vừa bắt đầu | Đồng hồ Đỏ chạy trước nước đầu tiên; khi chuyển lượt, đồng hồ không bị đặt lại về ban đầu |
| Thế hết nước, chiếu liên tục, lặp lần ba, mốc 119/120 | Kết quả theo luật; ăn quân đưa bộ đếm về 0 |
| Xin hoà: đồng ý / từ chối / rút / hết 30 giây; xin lại trước đủ 5 nước | Đúng hoà hoặc tiếp tục; bị chặn khi chưa đủ 5 nước |
| Đầu hàng và phản hồi hoà đến cùng lúc | Một kết quả, phản hồi muộn vô hiệu |
| Người xem dùng công cụ trả lời đề nghị hoà, hoặc đầu hàng, thay người chơi | Máy chủ từ chối; ván không đổi |

**Cách tự kiểm tra**
Chuẩn bị: đồng hồ điều khiển được để rút ngắn thời gian.

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Khởi tạo lần lượt 5, 10, 15 phút rồi đi nước | Chỉ bên đến lượt giảm, không cộng |
| 2 | Gửi nước khi giờ đúng bằng 0 | Hết giờ, nước không áp dụng |
| 3 | Đổi lượt, cho bộ hẹn lượt trước chạy | Không kết thúc nhầm |
| 4 | Gây lỗi ghi qua T-27, hồi phục trong hạn rồi thử quá 30 giây | Đóng băng đúng; chạy lại hoặc gián đoạn đúng |
| 5 | Mô phỏng hết giờ trước/sau/bằng hạn mất kết nối, đảo thứ tự | Một kết quả, hết giờ ưu tiên khi bằng |
| 6 | Bắt đầu ván, đi nước đầu | Chỉ Đỏ chạy trước nước đầu |
| 7 | Chạy các thế hết nước, chiếu liên tục, lặp lần ba, 119/120 nửa nước | Kết quả đúng luật |
| 8 | Xin hoà: đồng ý, từ chối, rút, hết 30 giây; xin lại sớm | Đúng; xin sớm bị chặn |
| 9 | Đầu hàng đồng thời với phản hồi hoà | Một kết quả duy nhất |
| 10 | Người xem dùng công cụ thử đầu hàng và trả lời đề nghị hoà | Máy chủ từ chối, ván không đổi |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý. **Chưa** nghiệm thu mất mạng thật (T-51) và việc đồng hồ chạy đúng trên màn hình hai người (T-32). Không tự hoà vì thiếu quân, không có luật "đuổi quân" riêng.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** đồng hồ thật, kết thúc khi hết giờ và giờ còn lại trong trạng thái cho mất kết nối, người xem, tích hợp; kết thúc một lần và đề nghị hoà cho mất kết nối, tích hợp đồng hồ/kết thúc, đăng xuất giữa ván, ván với máy.
**Không thuộc task này:** giờ "không giới hạn" (P2); hoàn giờ hoặc cộng giờ; hiển thị đồng hồ; điều kiện xin hoà của đánh hạng (20 nước); tái đấu; đi lại; giao diện.
**Phục vụ (nguồn):** Story 16, 17; tiêu chí AC-PLAY-02-01, AC-PLAY-02-02, AC-PLAY-03-01, AC-PLAY-03-02, AC-PLAY-03-03, AC-PLAY-04-01, AC-PLAY-05-01, AC-PLAY-05-02, AC-PLAY-05-03, AC-PLAY-05-04, AC-PLAY-08-01, AC-PLAY-08-02. Thuộc Epic: Hai người đánh cờ qua mạng. Bổ sung AC-AUTH-04-05 (thiết bị khác).
**Kết quả (đầu ra):** Đồng hồ ván do máy chủ tính, hết giờ, đóng băng khi lỗi ghi; kết thúc ván, đầu hàng, xin hoà.
**Bằng chứng nộp:** Kết quả thử bằng đồng hồ giả; kết quả một lần. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Không xử hoà vì thiếu quân.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-27; liên quan tới (relates to) Story 2, Story 16, Story 17; Epic: Hai người đánh cờ qua mạng.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **TÌNH 4851_NGUYỄN NGỌC**; Sprint **XIAN Sprint 2**; Fix version **v0.2**; Start date **2026-10-15**; Due date **2026-10-16**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/07-task-e5-danh-co-online.md` — T-29.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **TÌNH 4851_NGUYỄN NGỌC**.
* Review/kiểm độc lập dự kiến: **nguyenhoangtungtuyhoa**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-5](https://xiangqi-web.atlassian.net/browse/XIAN-5).

**Phải hoàn tất trước:**

* [T-27 — XIAN-61](https://xiangqi-web.atlassian.net/browse/XIAN-61)

**Story phục vụ:**

* [Story 2 — XIAN-10](https://xiangqi-web.atlassian.net/browse/XIAN-10)
* [Story 16 — XIAN-24](https://xiangqi-web.atlassian.net/browse/XIAN-24)
* [Story 17 — XIAN-25](https://xiangqi-web.atlassian.net/browse/XIAN-25)

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
| Bắt đầu thực hiện | 2026-10-15 11:30 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-16 14:30 |
| Bắt đầu review | 2026-10-16 14:30 |
| Review PASS và bàn giao mục tiêu | 2026-10-16 16:30 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-30 — Nối web với máy chủ: đi nước, đồng bộ thế cờ giữa hai trình duyệt

**Jira thực:** [XIAN-64](https://xiangqi-web.atlassian.net/browse/XIAN-64) · **Loại:** Task · **Assignee:** Nguyễn Minh Thư · **Sprint:** XIAN Sprint 2 · **Fix version:** v0.2
**Components:** Frontend, Game Server · **Priority:** High · **Nhãn:** `P1`, `loi`, `integration`, `US-PLAY-01`, `xiangqi-mvp-20261005`, `t-30`
**Ước lượng:** 3.5 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-15 · **Due date:** 2026-10-15 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Hai người đánh cờ qua mạng · **Components:** Frontend, Game Server
**Phải xong trước:**

* **T-24 — Giao diện ván: bàn cờ nối mạng, đồng hồ, nút, hộp kết quả, khung xin hoà**: Màn ván: bàn cờ, đồng hồ, nút Đầu hàng/Xin hoà, hộp kết quả, khung xin hoà, lớp phủ mất kết nối; 5 trạng thái, dữ liệu giả.
* **T-27 — Máy chủ: bộ xử lý lệnh của ván và xử lý nước đi**: Bộ xử lý lệnh của ván (hàng đợi, mã yêu cầu, phiên bản, biên lai, lỗi ghi) và xử lý nước đi.
* **T-28 — Nối web với máy chủ: tạo phòng, vào phòng, ghế, Sẵn sàng, bắt đầu ván**: Hai người tạo phòng, vào phòng, ngồi ghế, Sẵn sàng và bắt đầu ván trên hai trình duyệt thật.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Nối giao diện ván với xử lý nước đi **qua phòng thật** để chứng minh: hai người đánh nhau trên hai trình duyệt, **cùng nhìn một ván và cùng một phiên bản** sau mỗi nước.

**Việc cần làm (làm lần lượt)**

1. Đi từ phòng đã bắt đầu ván ở T-28, không ghép hai bản dữ liệu giả.
2. Hai người luân phiên đi nước bằng bấm và kéo thả; kiểm thế cờ, lượt, nước vừa đi và phiên bản trên cả hai trình duyệt.
3. Kiểm toạ độ khi người cầm Đen thấy bàn lật.
4. Gây các tình huống: mất phản hồi rồi gửi lại, nước sai, phiên bản cũ; đối chiếu với dữ liệu đã lưu.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Hai người luân phiên đi bằng bấm và kéo | Cùng thế, lượt, nước vừa đi sau khi xác nhận |
| Gửi trùng khi mất phản hồi | Chỉ một nước được lưu |
| Nước sai hoặc phiên bản cũ | Thông báo đúng; thế trở về như máy chủ |
| Tab chỉ xem (không phải tab điều khiển), hoặc người không chơi trong ván, dùng công cụ gửi lệnh đi quân | Máy chủ từ chối; ván không đổi |

**Cách tự kiểm tra**
Chuẩn bị: hai trình duyệt, máy chủ và cơ sở dữ liệu thử.

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Hai người luân phiên đi bằng bấm và kéo | Cùng thế, lượt, nước vừa đi |
| 2 | Gửi trùng khi mất phản hồi | Chỉ một nước trong dữ liệu |
| 3 | Gửi nước sai; phiên bản cũ | Thông báo đúng, thế về như máy chủ |
| 4 | Dùng tab chỉ đọc và người ngoài gửi lệnh | Không đổi ván |

**Khi nào chuyển cho người kiểm thử:** cả 4 dòng đạt trên máy chủ và dữ liệu thật; một nguồn thế cờ duy nhất, không lệch sau đồng bộ.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Đồng hồ và kết thúc ván kiểm ở T-32.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** chơi online đã chạy thật cho đồng hồ, kết thúc ván, chat, ván nâng cao và bạn bè.
**Không thuộc task này:** đồng hồ, kết thúc ván, mất kết nối, người xem.
**Phục vụ (nguồn):** Story 15; tiêu chí AC-PLAY-01-01, AC-PLAY-01-02, AC-PLAY-01-03, AC-PLAY-01-04; NFR-01. Thuộc Epic: Hai người đánh cờ qua mạng.
**Kết quả (đầu ra):** Hai trình duyệt đánh nước luân phiên, cùng thế cờ và phiên bản sau mỗi nước.
**Bằng chứng nộp:** Video; báo cáo Playwright; dữ liệu đối chiếu. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Một nguồn thế cờ duy nhất.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-24, T-27, T-28; liên quan tới (relates to) Story 15; Epic: Hai người đánh cờ qua mạng.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Nguyễn Minh Thư**; Sprint **XIAN Sprint 2**; Fix version **v0.2**; Start date **2026-10-15**; Due date **2026-10-15**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/07-task-e5-danh-co-online.md` — T-30.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Nguyễn Minh Thư**.
* Review/kiểm độc lập dự kiến: **4841_Lê Thị Xuân Nhạn**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-5](https://xiangqi-web.atlassian.net/browse/XIAN-5).

**Phải hoàn tất trước:**

* [T-24 — XIAN-58](https://xiangqi-web.atlassian.net/browse/XIAN-58)
* [T-27 — XIAN-61](https://xiangqi-web.atlassian.net/browse/XIAN-61)
* [T-28 — XIAN-62](https://xiangqi-web.atlassian.net/browse/XIAN-62)

**Story phục vụ:**

* [Story 15 — XIAN-23](https://xiangqi-web.atlassian.net/browse/XIAN-23)

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
| Bắt đầu thực hiện | 2026-10-15 11:30 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-15 15:30 |
| Bắt đầu review | 2026-10-15 15:30 |
| Review PASS và bàn giao mục tiêu | 2026-10-15 16:00 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-32 — Nối web với máy chủ: bắt đầu ván đầy đủ, đồng hồ, kết thúc ván, đầu hàng, xin hoà

**Jira thực:** [XIAN-66](https://xiangqi-web.atlassian.net/browse/XIAN-66) · **Loại:** Task · **Assignee:** Nguyễn Minh Thư · **Sprint:** XIAN Sprint 2 · **Fix version:** v0.2
**Components:** Frontend, Game Server · **Priority:** High · **Nhãn:** `P1`, `integration`, `loi`, `US-PLAY-02`, `US-PLAY-03`, `US-PLAY-04`, `US-PLAY-05`, `US-ROOM-03`, `xiangqi-mvp-20261005`, `t-32`
**Ước lượng:** 6 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-16 · **Due date:** 2026-10-17 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Hai người đánh cờ qua mạng · **Components:** Frontend, Game Server
**Phải xong trước:**

* **T-29 — Máy chủ: đồng hồ ván, kết thúc ván, đầu hàng, xin hoà**: Đồng hồ ván do máy chủ tính, hết giờ, đóng băng khi lỗi ghi; kết thúc ván, đầu hàng, xin hoà.
* **T-30 — Nối web với máy chủ: đi nước, đồng bộ thế cờ giữa hai trình duyệt**: Hai trình duyệt đánh nước luân phiên, cùng thế cờ và phiên bản sau mỗi nước.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Nối **đồng hồ** và mọi cách **kết thúc ván** vào ván đã đi nước thật, và nghiệm thu luôn bước **bắt đầu ván đầy đủ** (Sẵn sàng, đếm 3…2…1 có âm thanh, chuyển sang màn ván, đồng hồ Đỏ chạy). Đây là phần giúp ván **chơi được từ đầu đến hết** trong bản chơi được: kết quả cuối trên hai trình duyệt phải **khớp với máy chủ**.

Phần rớt mạng và quay lại, người xem, bảng nước đi và phòng khoá thuộc task khác ở giai đoạn mở rộng.

**Việc cần làm (làm lần lượt)**

1. Hai người vào phòng, cùng Sẵn sàng; theo dõi đếm **3, 2, 1** (có tiếng gỗ), chuyển màn, và đồng hồ **chỉ Đỏ chạy** trước nước đầu, Đen chưa giảm.
2. Một bên bỏ Sẵn sàng trước khi hết đếm rồi Sẵn sàng lại: đếm cũ dừng, không có ván ma hay đồng hồ ma; đợt hợp lệ chỉ tạo **một** ván và **một** đồng hồ Đỏ.
3. Kiểm hết giờ rồi gửi nước muộn; đầu hàng (huỷ và đồng ý); xin hoà (đồng ý, từ chối, hết hạn, rút, chờ 5 nước).
4. Kiểm tranh chấp: trả lời hoà sau khi đã chiếu hết → không ghi đè kết quả.
5. Gây lỗi ghi dữ liệu theo task máy chủ của ván trong luồng thật rồi hồi phục trong hạn: đồng hồ đóng băng, màn hình theo trạng thái hợp lệ, **không coi mất phản hồi là nước mới**.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Đợi hết giờ rồi gửi nước | Hai bên cùng thấy thua do hết giờ; nước muộn không lưu |
| Đầu hàng: bấm huỷ / đồng ý | Huỷ không tác dụng; đồng ý cùng kết quả cả hai máy |
| Xin hoà: đồng ý / từ chối / hết hạn / rút / xin lại sớm | Đúng trạng thái, có chú thích khi nút mờ |
| Ván đã kết thúc do chiếu hết, rồi mới có người trả lời đề nghị hoà | Kết quả cũ giữ nguyên, không bị ghi đè |
| Hai người Sẵn sàng đủ 3 giây | Một mã ván và thế đầu; hai màn hình cùng vào màn ván; chỉ Đỏ chạy giờ |
| Bỏ Sẵn sàng trước hết đếm rồi Sẵn sàng lại | Đếm cũ dừng; không có ván hay đồng hồ ma |
| Lỗi ghi dữ liệu rồi hồi phục trong hạn | Đồng hồ đóng băng; không mất giờ vì lỗi; mất phản hồi không bị tính là nước mới |

**Cách tự kiểm tra**
Chuẩn bị: hai trình duyệt, máy chủ thật, khả năng gây lỗi ghi.

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Hai người Sẵn sàng; xem đếm, tiếng gỗ, chuyển màn, đồng hồ | Một ván, chỉ Đỏ chạy giờ |
| 2 | Bỏ rồi bật lại Sẵn sàng trước hết đếm | Không ván hay đồng hồ ma |
| 3 | Đợi hết giờ rồi gửi nước | Cùng kết quả thua; nước muộn không lưu |
| 4 | Đầu hàng (huỷ, đồng ý); xin hoà (các nhánh) | Đúng trạng thái và chú thích |
| 5 | Trả lời hoà sau chiếu hết | Không ghi đè |
| 6 | Gây lỗi ghi rồi hồi phục trong hạn | Đóng băng đúng, không mất giờ |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt; dữ liệu và màn hình cùng kết quả, giờ dừng sau khi kết thúc.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý. Một ván hai người chơi được từ lúc Sẵn sàng đến lúc có kết quả, hai trình duyệt luôn cùng kết quả.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** ván chơi được từ đầu đến hết cho nghiệm thu bản chơi được; nền cho phần rớt mạng, người xem và bảng nước đi ở giai đoạn mở rộng.
**Không thuộc task này:** rớt mạng và nối lại, người xem, bảng nước đi, phòng khoá (task nối mở rộng); điều kiện xin hoà của đánh hạng; tái đấu; xem lại ván.
**Phục vụ (nguồn):** Story 7, 16, 17; tiêu chí AC-ROOM-03-02, AC-PLAY-02-02, AC-PLAY-03-02, AC-PLAY-04-01, AC-PLAY-05-01, AC-PLAY-05-02, AC-PLAY-05-04. Thuộc Epic: Hai người đánh cờ qua mạng.
**Kết quả (đầu ra):** Bắt đầu ván, đồng hồ, kết thúc ván, đầu hàng và xin hoà chạy trọn trên web và máy chủ thật.
**Bằng chứng nộp:** Video; báo cáo; trạng thái trước/sau. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Cách hiển thị ván gián đoạn đã chốt (kết quả trung tính); phần này kiểm ở task mở rộng.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-29, T-30; liên quan tới (relates to) Story 7, Story 16, Story 17; Epic: Hai người đánh cờ qua mạng.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Nguyễn Minh Thư**; Sprint **XIAN Sprint 2**; Fix version **v0.2**; Start date **2026-10-16**; Due date **2026-10-17**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/07-task-e5-danh-co-online.md` — T-32.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Nguyễn Minh Thư**.
* Review/kiểm độc lập dự kiến: **4841_Lê Thị Xuân Nhạn**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-5](https://xiangqi-web.atlassian.net/browse/XIAN-5).

**Phải hoàn tất trước:**

* [T-29 — XIAN-63](https://xiangqi-web.atlassian.net/browse/XIAN-63)
* [T-30 — XIAN-64](https://xiangqi-web.atlassian.net/browse/XIAN-64)

**Story phục vụ:**

* [Story 7 — XIAN-15](https://xiangqi-web.atlassian.net/browse/XIAN-15)
* [Story 16 — XIAN-24](https://xiangqi-web.atlassian.net/browse/XIAN-24)
* [Story 17 — XIAN-25](https://xiangqi-web.atlassian.net/browse/XIAN-25)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 4 | Nguyễn Minh Thư |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 1 | Nguyễn Minh Thư |
| Review độc lập | 1 | 4841_Lê Thị Xuân Nhạn |
| Tổng Original/Remaining Estimate ban đầu | 6 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc phạm vi hẹp/cấu hình/giao diện hoặc nối chức năng đã có đầu vào: ca thực hiện ngắn, kiểm và review riêng. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-16 16:30 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-17 13:30 |
| Bắt đầu review | 2026-10-17 13:30 |
| Review PASS và bàn giao mục tiêu | 2026-10-17 14:30 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-47 — Bảng nước đi: ký hiệu tiếng Việt và hiển thị

**Jira thực:** [XIAN-81](https://xiangqi-web.atlassian.net/browse/XIAN-81) · **Loại:** Task · **Assignee:** Nguyễn Minh Thư · **Sprint:** XIAN Sprint 3 · **Fix version:** v0.3
**Components:** Game Engine, Frontend · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `US-PLAY-10`, `xiangqi-mvp-20261005`, `t-47`
**Ước lượng:** 6.5 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-21 · **Due date:** 2026-10-21 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Hai người đánh cờ qua mạng · **Components:** Game Engine, Frontend
**Phải xong trước:**

* **T-07 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)**: Ứng dụng web chạy được, có kiểu chữ/màu Kỳ Đài Cổ Phong, các khối nền (nút, ô nhập, hộp thoại, thông báo, chú thích, khung xương) đủ 5 trạng thái và trang kiểm tra nội bộ.
* **T-08 — Luật cờ: nước hợp lệ, chiếu, chiếu hết, hết nước, lặp thế, 120 nửa nước**: Nước hợp lệ, chiếu, chiếu hết, hết nước, hai Tướng đối mặt, lặp thế, chiếu liên tục, 120 nửa nước.
* **T-27 — Máy chủ: bộ xử lý lệnh của ván và xử lý nước đi**: Bộ xử lý lệnh của ván (hàng đợi, mã yêu cầu, phiên bản, biên lai, lỗi ghi) và xử lý nước đi.
* **T-34 — Nghiệm thu bản chơi được: đăng ký, tạo phòng, mời, đánh online và đánh với máy chạy trọn**: Bản chơi được đã PASS M1–M4 trên bản chạy thật; báo cáo hoàn tất nhưng chưa đạt không mở phần làm sau, trừ PO cho phép rõ ràng.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Hiện **danh sách nước đi** của ván đang diễn ra bằng ký hiệu tiếng Việt, tự cuộn tới nước mới nhất, cho cả người chơi và người xem. Danh sách **chỉ để theo dõi**, không phải chức năng xem lại ván.

Viết hàm đổi một nước đi thành **ký hiệu tiếng Việt** cho bảng nước đi, ví dụ "Pháo 2 bình 5", "Mã 8 tiến 7". Ký hiệu tính theo **phe người đi**, không phụ thuộc bàn đang lật hay không.

**Việc cần làm (làm lần lượt)**

1. Ở máy chủ: với mỗi nước đã lưu, sinh ký hiệu từ thế trước nước và bên đi (hàm ký hiệu nói ở các bước dưới), gửi kèm thứ tự và ký hiệu.
2. Ở web: dựng danh sách nước đi, **tự cuộn** khi có nước mới; có trạng thái trống (ván chưa có nước) và lỗi.
3. Sau khi nối lại hoặc đồng bộ lại: **thay danh sách theo dữ liệu mới nhất**, không thiếu, không trùng dòng.
4. Ghép bảng nước đi vào ứng dụng web ở T-07 và kiểm cả hai phía (web và máy chủ) biên dịch và chạy.
5. Quy tắc cột: phe Đỏ đếm cột từ phải sang trái (**cột = 9 − x**), phe Đen đếm từ trái sang phải (**cột = x + 1**).
6. Mô tả nước: tên quân, cột xuất phát, **tiến**/**lùi**/**bình** (đi ngang), cột hoặc số ô đích. Mã, Tượng, Sĩ **không dùng "bình"**.
7. Khi hai quân cùng loại cùng cột thì thêm **Trước/Sau**; ba quân hoặc nhiều Tốt thì **Trước/Giữa/Sau/Thứ n** theo quy tắc.
8. Nếu hai nước vẫn cho cùng ký hiệu thì thêm số cột để **mỗi ký hiệu chỉ ứng với một nước** trong thế đó.
9. Viết hàm ngược (ký hiệu → nước) để kiểm tính duy nhất.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Đi Pháo, Mã ở hai phía của bàn lật | Cột tính theo bên đi, không theo góc màn hình |
| Hai Xe, Pháo, Mã hoặc nhiều Tốt cùng cột | Ký hiệu duy nhất |
| Ngắt rồi nối lại; máy chủ gửi lại toàn bộ | Không thiếu, không trùng; đúng thứ tự |
| Ván chưa có nước; tải thất bại | Trạng thái trống / lỗi đúng, không bịa nước |
| Mở trang trong khung web thật, nhận nước đã lưu và gửi lại | Danh sách dựng được, không trùng dòng, không dùng ký hiệu giả |
| Ví dụ "Pháo 2 bình 5", "Mã 8 tiến 7" | Khớp đúng ký hiệu và hướng của từng phe |
| Hai Xe, Pháo hoặc Mã cùng cột; ba, bốn, năm Tốt | Trước/Sau/Giữa/Thứ n đúng, không nhập nhằng |
| Các nước ban đầu trùng ký hiệu | Bổ sung cột để giải ra đúng một nước |
| Phe Đen khi bàn bị lật | Ký hiệu tính theo người đi, không theo màn hình |

**Cách tự kiểm tra**

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Đi Pháo và Mã ở cả hai phe, bàn lật | Ký hiệu theo bên đi |
| 2 | Dùng bộ thế có quân trùng cột | Ký hiệu duy nhất |
| 3 | Ngắt, nối lại, phát lại trạng thái | Không thiếu hay trùng dòng |
| 4 | Xem ván chưa có nước; giả lập lỗi tải | Trống / lỗi đúng |
| 5 | Chạy trong web thật | Danh sách đúng, không trùng |
| 6 | Chạy các ví dụ mẫu ở cả hai phe | Khớp |
| 7 | Các thế có hai, ba, bốn, năm quân cùng cột | Đúng Trước/Sau/Giữa/Thứ n |
| 8 | Với mỗi nước hợp lệ của một thế, đổi sang ký hiệu rồi giải ngược | Mỗi ký hiệu ra đúng một nước |
| 9 | Lật hiển thị, ký hiệu cùng nước | Không đổi |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý. Mỗi nước đã lưu có đúng một dòng khớp máy chủ. Người xem không có thao tác nào sửa được cờ. Không có ký hiệu trùng trong mọi tập nước hợp lệ của các thế thử.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** bảng nước đi cho tích hợp ván nâng cao; hàm ký hiệu nước đi cho bộ kiểm thử luật.
**Không thuộc task này:** tua lại nước đi; xuất ván cờ ra tệp; lịch sử ván.
**Phục vụ (nguồn):** Story 15; tiêu chí AC-PLAY-10-01. Thuộc Epic: Hai người đánh cờ qua mạng.
**Kết quả (đầu ra):** Bảng nước đi ký hiệu tiếng Việt, tự cuộn, không trùng dòng khi nối lại.
**Bằng chứng nộp:** Kết quả thử hai phe; hàm ký hiệu. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Ký hiệu phải duy nhất trong mỗi thế.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-07, T-08, T-27, T-34; liên quan tới (relates to) Story 15; Epic: Hai người đánh cờ qua mạng.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Nguyễn Minh Thư**; Sprint **XIAN Sprint 3**; Fix version **v0.3**; Start date **2026-10-21**; Due date **2026-10-21**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/07-task-e5-danh-co-online.md` — T-47.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phối hợp đúng chuyên môn

Frontend phụ trách bảng nước đi và hiển thị; người phụ trách luật cờ cung cấp/xác minh ký hiệu và bộ ví dụ. Bàn giao dữ liệu ký hiệu đã kiểm trước khi nghiệm thu giao diện; ghi riêng thời gian hỗ trợ và review khi Sprint Planning. Assignee đã gán; đây là phối hợp giữa chuyên môn, không chuyển toàn bộ phần việc sang người chính.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Nguyễn Minh Thư**.
* Review/kiểm độc lập dự kiến: **4841_Lê Thị Xuân Nhạn**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-5](https://xiangqi-web.atlassian.net/browse/XIAN-5).

**Phải hoàn tất trước:**

* [T-07 — XIAN-41](https://xiangqi-web.atlassian.net/browse/XIAN-41)
* [T-08 — XIAN-42](https://xiangqi-web.atlassian.net/browse/XIAN-42)
* [T-27 — XIAN-61](https://xiangqi-web.atlassian.net/browse/XIAN-61)
* [T-34 — XIAN-68](https://xiangqi-web.atlassian.net/browse/XIAN-68)

**Story phục vụ:**

* [Story 15 — XIAN-23](https://xiangqi-web.atlassian.net/browse/XIAN-23)

**Hỗ trợ bắt buộc:** TÌNH 4851_NGUYỄN NGỌC xác minh luật/ký hiệu; Nguyễn Minh Thư làm giao diện; review dự kiến bởi 4841_Lê Thị Xuân Nhạn. Xếp thời gian hỗ trợ của Tình vào lịch, không giao đồng thời Task khác cần cùng người.

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 3 | Nguyễn Minh Thư |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 1 | Nguyễn Minh Thư |
| Review độc lập | 0.5 | 4841_Lê Thị Xuân Nhạn |
| Hỗ trợ bắt buộc | 2 | TÌNH 4851_NGUYỄN NGỌC |
| Tổng Original/Remaining Estimate ban đầu | 6.5 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc phạm vi hẹp/cấu hình/giao diện hoặc nối chức năng đã có đầu vào: ca thực hiện ngắn, kiểm và review riêng. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-21 11:30 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-21 16:30 |
| Bắt đầu review | 2026-10-21 16:30 |
| Review PASS và bàn giao mục tiêu | 2026-10-21 17:00 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-51 — Máy chủ: rời phòng giữa ván, mất kết nối, giữ chỗ, kết nối lại, ván gián đoạn

**Jira thực:** [XIAN-85](https://xiangqi-web.atlassian.net/browse/XIAN-85) · **Loại:** Task · **Assignee:** TÌNH 4851_NGUYỄN NGỌC · **Sprint:** XIAN Sprint 3 · **Fix version:** v0.3
**Components:** Game Server · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `US-PLAY-03`, `US-PLAY-06`, `US-PLAY-07`, `US-ROOM-07`, `US-ROOM-10`, `US-ROOM-11`, `xiangqi-mvp-20261005`, `t-51`
**Ước lượng:** 12 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-24 · **Due date:** 2026-10-25 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Hai người đánh cờ qua mạng · **Components:** Game Server
**Phải xong trước:**

* **T-17 — Máy chủ: đăng nhập, quản lý phiên và hồ sơ**: Đăng nhập bằng tên đăng nhập và mật khẩu, quản lý phiên 12 giờ/30 ngày, kiểm hạn và thu hồi, xem và sửa tên hiển thị. Đăng nhập Google chạy được. Kèm hạn phiên cố định, phân biệt tab/thiết bị, dữ liệu loại phiên và tín hiệu hết phiên/thay thiết bị cho các mô-đun ván.
* **T-29 — Máy chủ: đồng hồ ván, kết thúc ván, đầu hàng, xin hoà**: Đồng hồ ván do máy chủ tính, hết giờ, đóng băng khi lỗi ghi; kết thúc ván, đầu hàng, xin hoà.
* **T-34 — Nghiệm thu bản chơi được: đăng ký, tạo phòng, mời, đánh online và đánh với máy chạy trọn**: Bản chơi được đã PASS M1–M4 trên bản chạy thật; báo cáo hoàn tất nhưng chưa đạt không mở phần làm sau, trừ PO cho phép rõ ràng.
* **T-44 — Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng**: Đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời và chuyển quyền, đóng phòng, quay về phòng chờ sau ván. Mời xuống ghế cần Chấp nhận; không giữ ghế, kiểm lại điều kiện lúc nhận và reset Sẵn sàng.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Phân biệt **rời phòng có chủ ý** (là đầu hàng) với **mất kết nối** (được giữ chỗ trong một thời gian). Người rớt mạng quay lại đúng hạn thì giữ nguyên tư cách; quá hạn thì chịu hậu quả đúng luật; không để ván đã kết thúc "sống lại".

**Việc cần làm (làm lần lượt)**

1. Ghi **mốc mất kết nối** ở máy chủ. Nối lại thì nhận ra đúng người và chỗ đang giữ, gửi lại **đầy đủ trạng thái** (thế cờ, giờ, nước đi).
2. **Giữ chỗ:** người đang đấu **60 giây** (**giờ vẫn chạy**, quá hạn thì **thua**); người đang ngồi ghế ở phòng chờ hoặc phòng đã kết thúc **60 giây** (quá hạn chỉ **mất ghế**, không thua); người xem **5 phút** (quá hạn mất chỗ xem).
3. **Phân xử**: hết giờ và quá hạn giữ chỗ phải ra **một** kết quả; khi cả hai bên cùng rớt và cùng quá hạn thì **bên rớt trước thua**; hết giờ sớm hơn vẫn được ưu tiên.
4. **Rời phòng có chủ ý giữa ván** → **đầu hàng ngay**, không chờ 60 giây.
5. **Máy chủ khởi động lại:** quét các ván đang diễn ra, chuyển sang **gián đoạn**, không ghi đè nước đã lưu, không tiếp tục chơi. (Việc này tách khỏi trường hợp phục hồi lỗi ghi khi tiến trình vẫn sống.)
6. Việc "phòng bị khoá thì sao khi nối lại" chỉ ghép ở task tích hợp cuối (T-57).
7. Ghi nhật ký khi ván chuyển sang gián đoạn sau khi máy chủ khởi động lại (không chứa bí mật).
8. Nối tín hiệu hết phiên chính thức từ T-17 vào mất kết nối: online giữ 60 giây, đồng hồ vẫn chạy, có thể hết giờ trước khi hết ân hạn. Cùng thiết bị đăng nhập lại đúng tài khoản trong hạn mới tiếp tục; đăng nhập thiết bị khác giữa ván xử thua ngay, rời ghế và thu hồi phiên cũ, không chờ ân hạn. Các nhánh chỉ kết thúc ván một lần.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Nối lại trước / sau hạn (đang đấu, phòng chờ, người xem) | Trong hạn giữ tư cách; quá hạn: đang đấu thua, phòng chờ mất ghế, người xem mất chỗ |
| Hai bên cùng rớt lệch nhau, đều quá hạn | Bên rớt trước thua; hết giờ sớm hơn vẫn ưu tiên |
| Xác nhận rời phòng giữa ván | Đầu hàng ngay, không chờ |
| Khởi động lại máy chủ khi có ván và nước đã lưu | Ván gián đoạn; nước cũ không bị ghi đè |
| Rớt mạng thật lúc đang đấu, hạn hết giờ trước / sau / bằng hạn 60 giây | Một kết quả theo luật ưu tiên; giờ vẫn chạy khi mất mạng; không phụ thuộc thứ tự bộ hẹn |
| Chủ phòng mất kết nối tạm thời lúc đang đấu; chủ phòng rời hoặc bị xử thua | Không đổi chủ phòng khi chỉ mất kết nối tạm thời; rời hoặc bị xử thua thì quyền chuyển cho người còn lại (rời giữa ván là đầu hàng) |

**Cách tự kiểm tra**
Chuẩn bị: có thể ngắt/nối kết nối và khởi động lại máy chủ thử.

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Ngắt rồi nối lại trước/sau hạn, với ba loại người | Đúng như bảng trên |
| 2 | Hai bên rớt lệch nhau, chờ cả hai quá hạn | Bên rớt trước thua |
| 3 | Rời phòng chủ động giữa ván | Đầu hàng ngay |
| 4 | Khởi động lại máy chủ giữa ván | Gián đoạn; nước cũ còn nguyên |
| 5 | Ngắt đang đấu, đặt hạn hết giờ so với hạn 60 giây, đảo thứ tự | Một kết quả, đúng ưu tiên |
| 6 | Ngắt tạm thời kết nối chủ phòng lúc đang đấu; rồi cho chủ phòng rời | Không đổi chủ phòng khi chỉ ngắt tạm thời; rời thì chuyển quyền và tính đầu hàng |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt với đồng hồ và kết thúc ván thật.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Phần "phòng khoá" chưa nghiệm thu ở đây mà ở T-57. Ván với máy có thời hạn 30 phút riêng (Epic Đánh với máy theo cấp độ).

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** chức năng mất kết nối và kết nối lại cho người xem, ván nâng cao và đăng xuất.
**Không thuộc task này:** giao diện lớp phủ "đang mất kết nối", ván với máy.
**Phục vụ (nguồn):** Story 17, 18, 19, 20; tiêu chí AC-ROOM-07-03, AC-ROOM-10-03, AC-ROOM-11-03, AC-PLAY-03-02, AC-PLAY-06-01, AC-PLAY-07-01, AC-PLAY-07-02, AC-PLAY-07-03, AC-PLAY-07-04; NFR-07. Thuộc Epic: Hai người đánh cờ qua mạng. Bổ sung tiêu chí AC-AUTH-04-06.
**Kết quả (đầu ra):** Rời phòng giữa ván, mất kết nối, giữ chỗ 60 giây/5 phút, kết nối lại, ván gián đoạn khi máy chủ khởi động lại. Gồm hết phiên online giữ 60 giây/đồng hồ chạy; thiết bị khác xử thua ngay/rời vị trí.
**Bằng chứng nộp:** Kết quả thử runtime ngắt/nối; khởi động lại thử. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Phòng khoá chỉ ghép ở task nối nâng cao.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-17, T-29, T-34, T-44; liên quan tới (relates to) Story 2, Story 17, Story 18, Story 19, Story 20; Epic: Hai người đánh cờ qua mạng.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **TÌNH 4851_NGUYỄN NGỌC**; Sprint **XIAN Sprint 3**; Fix version **v0.3**; Start date **2026-10-24**; Due date **2026-10-25**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/07-task-e5-danh-co-online.md` — T-51.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **TÌNH 4851_NGUYỄN NGỌC**.
* Review/kiểm độc lập dự kiến: **nguyenhoangtungtuyhoa**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-5](https://xiangqi-web.atlassian.net/browse/XIAN-5).

**Phải hoàn tất trước:**

* [T-17 — XIAN-51](https://xiangqi-web.atlassian.net/browse/XIAN-51)
* [T-29 — XIAN-63](https://xiangqi-web.atlassian.net/browse/XIAN-63)
* [T-34 — XIAN-68](https://xiangqi-web.atlassian.net/browse/XIAN-68)
* [T-44 — XIAN-78](https://xiangqi-web.atlassian.net/browse/XIAN-78)

**Story phục vụ:**

* [Story 2 — XIAN-10](https://xiangqi-web.atlassian.net/browse/XIAN-10)
* [Story 17 — XIAN-25](https://xiangqi-web.atlassian.net/browse/XIAN-25)
* [Story 18 — XIAN-26](https://xiangqi-web.atlassian.net/browse/XIAN-26)
* [Story 19 — XIAN-27](https://xiangqi-web.atlassian.net/browse/XIAN-27)
* [Story 20 — XIAN-28](https://xiangqi-web.atlassian.net/browse/XIAN-28)

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
| Bắt đầu thực hiện | 2026-10-24 14:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-25 16:00 |
| Bắt đầu review | 2026-10-25 16:00 |
| Review PASS và bàn giao mục tiêu | 2026-10-25 18:00 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-55 — Đăng xuất giữa ván: xác nhận, đầu hàng, rời phòng rồi đăng xuất

**Jira thực:** [XIAN-89](https://xiangqi-web.atlassian.net/browse/XIAN-89) · **Loại:** Task · **Assignee:** Tưởng Lê khoa Cường-4572 · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** Authentication · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `US-AI-03`, `US-AUTH-05`, `xiangqi-mvp-20261005`, `t-55`
**Ước lượng:** 6.5 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-27 · **Due date:** 2026-10-28 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Hai người đánh cờ qua mạng · **Components:** Authentication
**Phải xong trước:**

* **T-21 — Giao diện: đăng ký ba bước, đăng nhập, hồ sơ, đăng xuất**: Màn hình đăng ký ba bước, đăng nhập, hồ sơ, đăng xuất đủ 5 trạng thái, chạy với dữ liệu giả. Có thêm màn thiết lập tài khoản Google và hai nút Google.
* **T-25 — Nối web với máy chủ: đăng ký, đăng nhập, hồ sơ**: Đăng ký, đăng nhập, hồ sơ, đăng xuất chạy trọn trên môi trường thử với email thật. Luồng Google chạy trọn.
* **T-29 — Máy chủ: đồng hồ ván, kết thúc ván, đầu hàng, xin hoà**: Đồng hồ ván do máy chủ tính, hết giờ, đóng băng khi lỗi ghi; kết thúc ván, đầu hàng, xin hoà.
* **T-31 — Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ**: Ván với máy ở máy chủ (cấp, phe, một chỗ chơi, vào lại 30 phút), xử lý bận/hỏng/Bỏ dở/Thử lại. Nối luật hết phiên/thiết bị khác; đường ván AI cũ sau khởi động lại báo mất trạng thái, không tự hồi sinh.
* **T-44 — Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng**: Đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời và chuyển quyền, đóng phòng, quay về phòng chờ sau ván. Mời xuống ghế cần Chấp nhận; không giữ ghế, kiểm lại điều kiện lúc nhận và reset Sẵn sàng.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Khi người dùng bấm đăng xuất **trong lúc đang có ván**, hệ thống phải xử lý trọn vẹn: không để ván treo, không để người kia đợi vô hạn, không để phiên còn sống ngầm.

**Việc cần làm (làm lần lượt)**

1. Giao diện hỏi xác nhận: "Đang trong ván, đăng xuất sẽ **xử thua**".
2. Nếu đang trong ván với người: **xử thua** người đăng xuất, rồi **rời phòng** (nhường chủ phòng nếu cần), rồi mới đăng xuất.
3. Nếu đang trong ván với máy: **đầu hàng (RESIGN), người chơi thua**, huỷ tìm nước, giải phóng vị trí rồi đăng xuất.
4. Nếu chỉ đang xem hoặc chờ trong phòng: rời phòng rồi đăng xuất.
5. Sau cùng thu hồi phiên; mọi tab của người đó đều về trang đăng nhập.
6. Nếu một bước thất bại giữa chừng, **không đăng xuất** nửa vời: báo lỗi và cho thử lại.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Đăng xuất khi đang đánh người | Thua, rời phòng, thoát; đối thủ thấy thắng |
| Đăng xuất khi đang chơi với máy | Ván bị huỷ, thoát |
| Từ chối ở hộp xác nhận | Không có gì thay đổi |
| Ghi kết quả xử thua (khi đăng xuất giữa ván) bị lỗi | Không đăng xuất; báo lỗi để thử lại |

**Cách tự kiểm tra**

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Đang đánh người, bấm đăng xuất và đồng ý | Thua, đối thủ thắng, người này ra ngoài |
| 2 | Đang chơi với máy, đăng xuất | Người chơi thua, tìm nước bị huỷ, vị trí được giải phóng rồi đăng xuất |
| 3 | Bấm đăng xuất rồi chọn "Huỷ" | Giữ nguyên ván |
| 4 | Giả lập lỗi ở bước xử thua | Không thoát, báo lỗi |

**Khi nào chuyển cho người kiểm thử:** cả 4 dòng đạt.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** đăng xuất an toàn trong mọi tình huống.
**Không thuộc task này:** tiếp quản phiên khi mở tab mới (task về nhiều tab), đăng xuất khi đang xem (chỉ rời phòng).
**Phục vụ (nguồn):** Story 3, 26; tiêu chí AC-AUTH-05-04, AC-AUTH-05-05, AC-AI-03-04. Thuộc Epic: Hai người đánh cờ qua mạng.
**Kết quả (đầu ra):** Đăng xuất giữa ván: xác nhận, đầu hàng, rời phòng rồi đăng xuất; ván với máy cũng đầu hàng, người chơi thua và huỷ tìm nước.
**Bằng chứng nộp:** Kết quả thử 4 ca; kiểm lại bằng mã yêu cầu. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Bước thất bại giữa chừng không được đăng xuất nửa vời.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-21, T-25, T-29, T-31, T-44; liên quan tới (relates to) Story 3, Story 26; Epic: Hai người đánh cờ qua mạng.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Tưởng Lê khoa Cường-4572**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-10-27**; Due date **2026-10-28**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/07-task-e5-danh-co-online.md` — T-55.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phối hợp đúng chuyên môn

Backend phụ trách đầu hàng/kết thúc ván, rời phòng và thu hồi phiên theo đúng vòng đời. Frontend phụ trách hộp xác nhận, phản hồi huỷ/đồng ý và chuyển màn hình. Hai phía kiểm cùng kịch bản online/AI trước khi bàn giao; ghi thời gian hỗ trợ và review khi Sprint Planning. Assignee đã gán; đây là phối hợp giữa chuyên môn, không chuyển toàn bộ phần việc sang người chính.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Tưởng Lê khoa Cường-4572**.
* Review/kiểm độc lập dự kiến: **nguyenhoangtungtuyhoa**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-5](https://xiangqi-web.atlassian.net/browse/XIAN-5).

**Phải hoàn tất trước:**

* [T-21 — XIAN-55](https://xiangqi-web.atlassian.net/browse/XIAN-55)
* [T-25 — XIAN-59](https://xiangqi-web.atlassian.net/browse/XIAN-59)
* [T-29 — XIAN-63](https://xiangqi-web.atlassian.net/browse/XIAN-63)
* [T-31 — XIAN-65](https://xiangqi-web.atlassian.net/browse/XIAN-65)
* [T-44 — XIAN-78](https://xiangqi-web.atlassian.net/browse/XIAN-78)

**Story phục vụ:**

* [Story 3 — XIAN-11](https://xiangqi-web.atlassian.net/browse/XIAN-11)
* [Story 26 — XIAN-34](https://xiangqi-web.atlassian.net/browse/XIAN-34)

**Hỗ trợ bắt buộc:** 4841_Lê Thị Xuân Nhạn làm hộp xác nhận/chuyển màn hình; Tưởng Lê khoa Cường-4572 làm vòng đời phía máy chủ; review dự kiến bởi nguyenhoangtungtuyhoa. Xếp thời gian Frontend hỗ trợ vào lịch, không trộn vai trò chính.

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 3 | Tưởng Lê khoa Cường-4572 |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 1 | Tưởng Lê khoa Cường-4572 |
| Review độc lập | 0.5 | nguyenhoangtungtuyhoa |
| Hỗ trợ bắt buộc | 2 | 4841_Lê Thị Xuân Nhạn |
| Tổng Original/Remaining Estimate ban đầu | 6.5 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc phạm vi hẹp/cấu hình/giao diện hoặc nối chức năng đã có đầu vào: ca thực hiện ngắn, kiểm và review riêng. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-27 14:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-27 18:00 |
| Bắt đầu review | 2026-10-28 09:00 |
| Review PASS và bàn giao mục tiêu | 2026-10-28 09:30 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-57 — Nối web với máy chủ: mất kết nối, người xem, bảng nước đi, phòng khoá

**Jira thực:** [XIAN-91](https://xiangqi-web.atlassian.net/browse/XIAN-91) · **Loại:** Task · **Assignee:** TÌNH 4851_NGUYỄN NGỌC · **Sprint:** XIAN Sprint 3 · **Fix version:** v0.3
**Components:** Frontend, Game Server · **Priority:** Medium · **Nhãn:** `P1`, `integration`, `mo-rong`, `US-PLAY-06`, `US-PLAY-07`, `US-PLAY-09`, `US-PLAY-10`, `US-ROOM-07`, `xiangqi-mvp-20261005`, `t-57`
**Ước lượng:** 12 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-26 · **Due date:** 2026-10-27 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Hai người đánh cờ qua mạng · **Components:** Frontend, Game Server
**Phải xong trước:**

* **T-25 — Nối web với máy chủ: đăng ký, đăng nhập, hồ sơ**: Đăng ký, đăng nhập, hồ sơ, đăng xuất chạy trọn trên môi trường thử với email thật. Luồng Google chạy trọn.
* **T-31 — Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ**: Ván với máy ở máy chủ (cấp, phe, một chỗ chơi, vào lại 30 phút), xử lý bận/hỏng/Bỏ dở/Thử lại. Nối luật hết phiên/thiết bị khác; đường ván AI cũ sau khởi động lại báo mất trạng thái, không tự hồi sinh.
* **T-32 — Nối web với máy chủ: bắt đầu ván đầy đủ, đồng hồ, kết thúc ván, đầu hàng, xin hoà**: Bắt đầu ván, đồng hồ, kết thúc ván, đầu hàng và xin hoà chạy trọn trên web và máy chủ thật.
* **T-33 — Nối web, máy chủ và máy cờ thật: ván với máy**: Ván với máy chạy thật qua web, máy chủ và máy cờ thật: ba cấp, ba phe, vào lại, sự cố.
* **T-46 — Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời**: Điều khiển phòng nâng cao chạy thật trên web và máy chủ: đổi chỗ, khoá, danh sách, đuổi, chủ phòng rời.
* **T-47 — Bảng nước đi: ký hiệu tiếng Việt và hiển thị**: Bảng nước đi ký hiệu tiếng Việt, tự cuộn, không trùng dòng khi nối lại.
* **T-49 — Máy chủ: cấp quyền camera/micro theo vai và mở nhiều tab (tab mới tiếp quản)**: Cấp quyền camera/micro theo vai, thu hồi khi đổi vai/đuổi/tiếp quản; mở nhiều tab, tab mới tiếp quản.
* **T-50 — Máy chủ: người xem theo dõi trực tiếp, lọc dữ liệu theo vai trò**: Người xem nhận trạng thái ván chỉ đọc, dữ liệu lọc ở máy chủ, thấy X/N người xem.
* **T-51 — Máy chủ: rời phòng giữa ván, mất kết nối, giữ chỗ, kết nối lại, ván gián đoạn**: Rời phòng giữa ván, mất kết nối, giữ chỗ 60 giây/5 phút, kết nối lại, ván gián đoạn khi máy chủ khởi động lại. Gồm hết phiên online giữ 60 giây/đồng hồ chạy; thiết bị khác xử thua ngay/rời vị trí.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Hoàn thiện phần ván **khó nhất**: rớt mạng và quay lại, người xem, bảng nước đi và việc giữ chỗ khi phòng bị **khoá**. Kiểm trên môi trường thật nhiều người, không dùng dữ liệu giả thay cho việc kết nối lại thật. Kết quả cuối trên hai trình duyệt phải **khớp với máy chủ**.

**Việc cần làm (làm lần lượt)**

1. **Lớp phủ "mất kết nối"** có đồng hồ giữ chỗ theo máy chủ, **không đóng được bằng Esc**; nối lại thì tắt, hiện đúng thế, giờ và phiên bản.
2. Nối lại **nhận đủ trạng thái** và **xoá dữ liệu mà người đó không còn quyền xem**.
3. Kiểm: rời phòng, nối lại sau khi ván kết thúc, người xem, hai người cùng rớt, quá hạn.
4. Dùng các điều khiển phòng nâng cao ở task đổi chỗ, khoá, đuổi để đổi ghế, đuổi, khoá phòng trong lúc kiểm; so quyền nhận dữ liệu trước và sau.
5. **Phòng khoá:** người cũ trong hạn nối lại giữ tư cách; quá hạn hoặc người mới không vào được; khoá không tự mở khi một ghế trống.
6. Kiểm hết phiên chính thức ngay trong online/AI trên bản chạy thật: mất quyền điều khiển; online giữ 60 giây và đồng hồ chạy; AI giữ 30 phút. Đăng nhập lại cùng tài khoản/cùng thiết bị trước và sau hạn; làm mới token khi phiên còn hạn không ngắt ván.
7. Kiểm riêng **đăng nhập thiết bị khác** trong online/AI: ván cũ thua ngay, rời vị trí, thiết bị cũ mất quyền API/Socket/media và đăng xuất; thiết bị mới ở Sảnh. Ngoài ván không tạo thua. Cùng thiết bị mở tab khác theo T-49, không dùng luật xử thua này.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Rớt rồi nối lại trước hạn | Đúng thế, giờ, phiên bản; lớp phủ tự tắt |
| Quá hạn: đang đấu / phòng chờ / phòng kết thúc / người xem | Thua hoặc mất ghế hoặc mất chỗ đúng, không áp nhầm |
| Người xem trong ván: đi nước, kết thúc, bị đuổi | Bảng nước đồng bộ; sau khi bị đuổi không nhận dữ liệu mới |
| Máy chủ khởi động lại giữa ván | Ván gián đoạn; hộp kết quả trung tính "Ván bị gián đoạn" (không thắng thua, không đổi điểm, chỉ nút Rời phòng) |
| Đuổi người xem rồi dùng kết nối cũ xin đồng bộ; người cũ nối lại khi phòng khoá | Người bị đuổi không nhận mới; người cũ hợp lệ được phục hồi |
| Phòng đủ hai ghế khoá; người có ghế rớt ở ba trạng thái phòng, nối lại trước/sau hạn 60 giây | Trong hạn giữ tư cách và trạng thái; quá hạn coi như người mới, không vượt khoá; đang chơi thì thua theo đồng hồ; phòng chờ/kết thúc chỉ mất ghế |
| Người xem cũ rớt/nối lại trước/sau 5 phút; một người mới dùng mã hoặc đường dẫn | Trong hạn người cũ phục hồi; quá hạn và người mới không vào được |
| Khoá rồi một ghế rời; người cũ nối lại, người mới thử vào | Phòng vẫn khoá; không biến người mới thành người cũ |

**Cách tự kiểm tra**
Chuẩn bị: nhiều trình duyệt, công cụ ngắt mạng thử, khả năng khởi động lại máy chủ.

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Rớt rồi nối lại trước hạn | Đúng thế, giờ; lớp phủ tắt |
| 2 | Để quá hạn với từng loại người | Đúng hậu quả |
| 3 | Người xem xem ván, rồi bị đuổi | Bảng đồng bộ; sau đuổi không nhận mới |
| 4 | Khởi động lại máy chủ giữa ván | Gián đoạn |
| 5 | Đuổi người xem, dùng kết nối cũ xin đồng bộ; khoá phòng và nối lại | Đúng quyền |
| 6 | Khoá phòng đủ ghế, ngắt/nối người có ghế ở 3 trạng thái, người xem và người mới | Đúng như bảng trên |
| 7 | Khoá rồi để một ghế rời, nối lại người cũ, thử người mới | Vẫn khoá |
| 8 | Dùng đồng hồ kiểm thử cho hết phiên trong online/AI; đăng nhập lại cùng thiết bị trong/quá hạn | Online giữ 60 giây, đồng hồ chạy; AI giữ 30 phút; quá hạn đúng kết quả, không hồi sinh ván; token refresh còn hạn không gây ngắt |
| 9 | Đăng nhập thiết bị khác khi đang đánh online/AI và ngoài ván | Trong ván xử thua ngay, thu quyền nơi cũ, nơi mới về Sảnh; ngoài ván không tạo kết quả thua |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt; dữ liệu và màn hình cùng kết quả; không có dữ liệu rò rỉ.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý. Hộp kết quả "Ván bị gián đoạn" (đã chốt) phải hiển thị đúng sau khi máy chủ khởi động lại. Không thay việc kết nối lại thật bằng dữ liệu giả.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** ván chạy trọn vẹn cả phần rớt mạng và người xem cho tích hợp nâng cao, nghiệm thu AC và demo; ván online đã chạy trọn cho bài tải, nghiệm thu AC, demo.
**Không thuộc task này:** bắt đầu ván, đồng hồ, kết thúc ván, đầu hàng, xin hoà (đã nối ở task trước); điều kiện xin hoà của đánh hạng; tái đấu; xem lại ván; công cụ giả lập mạng trong sản phẩm.
**Phục vụ (nguồn):** Story 15, 18, 19, 21; tiêu chí AC-PLAY-02-03, AC-PLAY-06-01, AC-PLAY-07-01, AC-PLAY-07-02, AC-PLAY-07-04, AC-PLAY-09-01, AC-PLAY-10-01, AC-ROOM-07-03, AC-ROOM-07-05. Thuộc Epic: Hai người đánh cờ qua mạng. Bổ sung tiêu chí AC-AUTH-04-06. Bổ sung AC-AUTH-04-05 (thiết bị khác).
**Kết quả (đầu ra):** Mất kết nối, kết nối lại, người xem, bảng nước đi, phòng khoá chạy trọn trên web và máy chủ thật. Gồm hết phiên và đăng nhập lại cùng thiết bị, đăng nhập khác thiết bị giữa online/AI trên bản chạy thật.
**Bằng chứng nộp:** Video; báo cáo; trạng thái trước/sau. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Cách hiển thị ván gián đoạn đã chốt (kết quả trung tính).
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-25, T-31, T-32, T-33, T-46, T-47, T-49, T-50, T-51; liên quan tới (relates to) Story 2, Story 15, Story 16, Story 18, Story 19, Story 21; Epic: Hai người đánh cờ qua mạng.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **TÌNH 4851_NGUYỄN NGỌC**; Sprint **XIAN Sprint 3**; Fix version **v0.3**; Start date **2026-10-26**; Due date **2026-10-27**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/07-task-e5-danh-co-online.md` — T-57.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **TÌNH 4851_NGUYỄN NGỌC**.
* Review/kiểm độc lập dự kiến: **Nguyễn Minh Thư**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-5](https://xiangqi-web.atlassian.net/browse/XIAN-5).

**Phải hoàn tất trước:**

* [T-25 — XIAN-59](https://xiangqi-web.atlassian.net/browse/XIAN-59)
* [T-31 — XIAN-65](https://xiangqi-web.atlassian.net/browse/XIAN-65)
* [T-32 — XIAN-66](https://xiangqi-web.atlassian.net/browse/XIAN-66)
* [T-33 — XIAN-67](https://xiangqi-web.atlassian.net/browse/XIAN-67)
* [T-46 — XIAN-80](https://xiangqi-web.atlassian.net/browse/XIAN-80)
* [T-47 — XIAN-81](https://xiangqi-web.atlassian.net/browse/XIAN-81)
* [T-49 — XIAN-83](https://xiangqi-web.atlassian.net/browse/XIAN-83)
* [T-50 — XIAN-84](https://xiangqi-web.atlassian.net/browse/XIAN-84)
* [T-51 — XIAN-85](https://xiangqi-web.atlassian.net/browse/XIAN-85)

**Story phục vụ:**

* [Story 2 — XIAN-10](https://xiangqi-web.atlassian.net/browse/XIAN-10)
* [Story 15 — XIAN-23](https://xiangqi-web.atlassian.net/browse/XIAN-23)
* [Story 16 — XIAN-24](https://xiangqi-web.atlassian.net/browse/XIAN-24)
* [Story 18 — XIAN-26](https://xiangqi-web.atlassian.net/browse/XIAN-26)
* [Story 19 — XIAN-27](https://xiangqi-web.atlassian.net/browse/XIAN-27)
* [Story 21 — XIAN-29](https://xiangqi-web.atlassian.net/browse/XIAN-29)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 8 | TÌNH 4851_NGUYỄN NGỌC |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 2 | TÌNH 4851_NGUYỄN NGỌC |
| Review độc lập | 2 | Nguyễn Minh Thư |
| Tổng Original/Remaining Estimate ban đầu | 12 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc có luật nghiệp vụ, xử lý trạng thái, tích hợp hoặc kiểm định chất lượng: dành ca dài hơn và dự phòng sửa lỗi. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-26 09:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-27 11:00 |
| Bắt đầu review | 2026-10-27 11:00 |
| Review PASS và bàn giao mục tiêu | 2026-10-27 14:00 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---
