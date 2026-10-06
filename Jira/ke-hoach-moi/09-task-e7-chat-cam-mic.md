# Task của Epic "Chat, camera và micro" (6 task)

**Ngày cập nhật:** 2026-10-05 · **Trạng thái:** đã được PO cho phép tạo và phân công ngày 05/10/2026 · Đã tạo Epic/Story/Task trên XIAN · Viết theo `00-chuan-description.md` và mẫu `00b`.

Mã task `T-01` đến `T-64` đánh theo **thứ tự làm** (số nhỏ làm trước, mỗi task chỉ cần các task có số nhỏ hơn). Một số task gộp nhiều việc nhỏ cùng mục đích thành một task. Ngày Sprint: 1 = 04/10–07/10, 2 = 08/10–10/10, 3 = 11/10–14/10, 4 = 15/10–17/10.

---

### T-35 — Thử nghiệm LiveKit Cloud: camera/micro theo từng người, thu hồi quyền

**Jira thực:** [XIAN-69](https://xiangqi-web.atlassian.net/browse/XIAN-69) · **Loại:** Task · **Assignee:** TÌNH 4851_NGUYỄN NGỌC · **Sprint:** XIAN Sprint 3 · **Fix version:** v0.3
**Components:** Communication, QA & DevOps · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `SPIKE`, `gate`, `US-MEDIA-01`, `xiangqi-mvp-20261005`, `t-35`
**Ước lượng:** 12 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-20 · **Due date:** 2026-10-21 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Chat, camera và micro · **Components:** Communication, QA & DevOps
**Phải xong trước:**

* **T-01 — Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động**: Kho mã cài đặt sạch được; có lệnh biên dịch, kiểm tra cách viết mã, chạy bài kiểm tra; hệ thống kiểm tra tự động báo xanh/đỏ đúng trên mọi nhánh.
* **T-34 — Nghiệm thu bản chơi được: đăng ký, tạo phòng, mời, đánh online và đánh với máy chạy trọn**: Bản chơi được đã PASS M1–M4 trên bản chạy thật; báo cáo hoàn tất nhưng chưa đạt không mở phần làm sau, trừ PO cho phép rõ ràng.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Trả lời: **LiveKit Cloud (dịch vụ chạy camera/micro) có cho phép quy định "ai được phát, ai được nhận" theo từng người, và chặn được người đã bị đuổi hay đổi vai không?** Báo cáo mở đường cho Epic Chat, camera và micro; chưa làm tính năng thật.

**Việc cần làm (làm lần lượt)**

1. Dùng dự án LiveKit Cloud thử (không dùng tài khoản thật của người dùng) và hai đến ba thiết bị có camera/micro.
2. Lập bảng "ai phát, ai được nhận" cho các vai: hai người chơi, người xem.
3. Thử các tình huống: người xem cố tự phát hình; chọn chia sẻ **chỉ đối thủ** rồi **cả đối thủ và người xem**; người chơi bị chuyển xuống làm người xem khi đang bật camera; người bị đuổi; mở tab mới thì tab cũ bị loại.
4. Thử **dùng lại quyền cũ** (thông tin vào phòng đã cấp trước đó) sau khi bị đuổi hoặc đổi vai.
5. Đo **khoảng thời gian** quyền cũ còn dùng được sau khi thu hồi; ghi mức dùng của gói miễn phí (phút người tham gia, dữ liệu, số kết nối).
6. Viết báo cáo: từng tình huống **đạt / không đạt**, số đo, phiên bản và cấu hình đã dùng, đề xuất cách làm.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Người xem dùng công cụ gọi thẳng chức năng phát camera/micro | Dịch vụ từ chối, không phát được |
| Chọn chia sẻ "chỉ đối thủ" | Người xem **không** nhận được hình/tiếng |
| Người chơi bị chuyển xuống xem khi đang phát | Mất quyền phát; không nhận luồng chỉ dành cho đối thủ |
| Người bị đuổi thử dùng lại quyền cũ | Không vào lại được |
| Cùng tài khoản mở thêm một tab mới và tab này tiếp quản | Tab cũ mất quyền điều khiển camera/micro; tab mới **mặc định tắt** camera/micro |

**Cách tự kiểm tra**

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Người xem tìm cách bật camera/micro của mình để phát | Không có nút phát; nếu dùng công cụ gửi thẳng thì dịch vụ chặn |
| 2 | Đổi lần lượt các mức chia sẻ | Người xem nhận đúng theo mức |
| 3 | Chuyển người chơi xuống xem lúc đang phát | Quyền cũ mất ngay |
| 4 | Dùng lại quyền cũ sau khi đuổi | Không vào được; ghi số giây còn hiệu lực nếu có |
| 5 | Đối chiếu mức dùng gói miễn phí | Có số liệu thật trong báo cáo |

**Khi nào chuyển cho người kiểm thử:** báo cáo đủ và làm lại được.
**Khi nào task xong:** báo cáo hoàn tất **kể cả khi một số tình huống không đạt**. Chỉ đánh giá "camera/micro đạt yêu cầu" khi **không** có ai nhận hay phát trái quyền (ẩn trên giao diện không đủ).

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** báo cáo, đề xuất cách thu hồi quyền, mức dùng hạn mức.
**Không thuộc task này:** tự dựng máy chủ camera, ghi hình, ghi âm, bật camera mặc định.
**Phục vụ (nguồn):** Story 23; tiêu chí AC-MEDIA-01-02; GATE-MEDIA. Thuộc Epic: Chat, camera và micro.
**Kết quả (đầu ra):** Báo cáo thử nghiệm dịch vụ camera/micro: quyền phát/nhận theo từng người, thu hồi, token cũ, mức dùng hạn mức; kết luận đạt/không đạt/chưa kết luận.
**Bằng chứng nộp:** Báo cáo số đo thật, cấu hình đã che. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Có thể vượt hạn mức miễn phí nếu chạy lớn; chỉ ghi số đo.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-01, T-34; liên quan tới (relates to) Story 23; Epic: Chat, camera và micro.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **TÌNH 4851_NGUYỄN NGỌC**; Sprint **XIAN Sprint 3**; Fix version **v0.3**; Start date **2026-10-20**; Due date **2026-10-21**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/09-task-e7-chat-cam-mic.md` — T-35.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **TÌNH 4851_NGUYỄN NGỌC**.
* Review/kiểm độc lập dự kiến: **Gia Kỳ**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-7](https://xiangqi-web.atlassian.net/browse/XIAN-7).

**Phải hoàn tất trước:**

* [T-01 — XIAN-35](https://xiangqi-web.atlassian.net/browse/XIAN-35)
* [T-34 — XIAN-68](https://xiangqi-web.atlassian.net/browse/XIAN-68)

**Story phục vụ:**

* [Story 23 — XIAN-31](https://xiangqi-web.atlassian.net/browse/XIAN-31)

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
| Bắt đầu thực hiện | 2026-10-20 09:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-21 11:00 |
| Bắt đầu review | 2026-10-21 11:00 |
| Review PASS và bàn giao mục tiêu | 2026-10-21 14:00 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-36 — Giao diện: camera/micro, bật tắt độc lập, mức chia sẻ, thông báo quyền và lỗi

**Jira thực:** [XIAN-70](https://xiangqi-web.atlassian.net/browse/XIAN-70) · **Loại:** Task · **Assignee:** Nguyễn Minh Thư · **Sprint:** XIAN Sprint 3 · **Fix version:** v0.3
**Components:** Frontend, Communication · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `US-MEDIA-01`, `US-MEDIA-02`, `US-PLAY-09`, `xiangqi-mvp-20261005`, `t-36`
**Ước lượng:** 6 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-21 · **Due date:** 2026-10-22 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Chat, camera và micro · **Components:** Frontend, Communication
**Phải xong trước:**

* **T-07 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)**: Ứng dụng web chạy được, có kiểu chữ/màu Kỳ Đài Cổ Phong, các khối nền (nút, ô nhập, hộp thoại, thông báo, chú thích, khung xương) đủ 5 trạng thái và trang kiểm tra nội bộ.
* **T-34 — Nghiệm thu bản chơi được: đăng ký, tạo phòng, mời, đánh online và đánh với máy chạy trọn**: Bản chơi được đã PASS M1–M4 trên bản chạy thật; báo cáo hoàn tất nhưng chưa đạt không mở phần làm sau, trừ PO cho phép rõ ràng.
* **T-35 — Thử nghiệm LiveKit Cloud: camera/micro theo từng người, thu hồi quyền**: Báo cáo thử nghiệm dịch vụ camera/micro: quyền phát/nhận theo từng người, thu hồi, token cũ, mức dùng hạn mức; kết luận đạt/không đạt/chưa kết luận.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Dựng **bảng điều khiển camera/micro** cho người chơi: bật/tắt độc lập, chọn mức chia sẻ, thông báo khi chưa có quyền thiết bị hoặc gặp lỗi, **mà không cản việc chơi cờ**.

**Việc cần làm (làm lần lượt)**

1. Khi vào phòng, mọi thiết bị **TẮT**; chỉ **xin quyền thiết bị khi người chơi tự bấm bật**.
2. Camera và micro **bật/tắt riêng**, nhưng dùng **chung một mức chia sẻ** (3 mức); mức "Cả đối thủ và người xem" chỉ chọn được khi phòng có người xem.
3. Khi rời phòng, mất quyền hoặc bị tiếp quản: **dừng luồng và đóng thiết bị**.
4. Khi từ chối quyền hoặc không có thiết bị: hiện lỗi rõ ràng; bàn cờ và chat vẫn dùng bình thường.
5. **Người xem** không thấy nút phát, không bị hỏi quyền thiết bị.
6. Dùng khối nền (T-07): nút, công tắc, chú thích; kiểm focus và lỗi thiết bị trên giao diện tối. Không có chức năng ghi hay lưu.
7. Vào phòng tự tạo: chọn sẵn mức **Chỉ đối thủ**, camera/micro vẫn Tắt. Muốn người xem nhận phải chủ động chọn Cả đối thủ và người xem; người nhận không cần bật camera/micro hoặc chia sẻ ngược lại.

**Thành phần màn hình phải có (theo danh mục màn hình, chỉ phần P1 (MVP))**
_Khung Camera và Micro_ (`PANEL-MEDIA`)

* Hai video trực tiếp của hai người chơi; nút **bật/tắt camera** và **bật/tắt micro** riêng (mặc định tắt).
* Chọn **mức chia sẻ** (không chia sẻ / chỉ đối thủ / cả đối thủ và người xem; mức ba chỉ chọn được khi phòng có người xem), áp chung cho camera và micro đang bật.
* Người xem không có nút bật; thông báo khi chưa có quyền thiết bị hoặc gặp lỗi mà không cản việc chơi.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**

| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
| --- | --- | --- | --- | --- | --- |
| Khung Camera và Micro | Luồng chỉ người được phép nhận | Xin quyền thiết bị/kết nối media | Mặc định tắt/chưa chia sẻ: placeholder không bịa video | Từ chối quyền/lỗi thiết bị: hướng dẫn cấp quyền/thử lại | Người xem không phát; mất ghế hoặc tab đã bị tab khác tiếp quản |

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Vào phòng rồi bật riêng micro hoặc camera | Không tự bật; điều khiển độc lập |
| Từ chối quyền hoặc không có thiết bị | Lỗi rõ; cờ và chat vẫn dùng |
| Mở khung camera/micro với vai người xem | Không có nút phát hình; không hỏi xin quyền camera/micro |
| Rời phòng hoặc nhận thông báo mất quyền | Luồng dừng, thiết bị không tiếp tục phát |
| Dùng bàn phím; vào trạng thái không có quyền | Nhãn, focus, chú thích đúng; không tự bật thiết bị |

**Cách tự kiểm tra**
Chuẩn bị: máy có camera và micro thật; thử cả khi từ chối quyền.

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Vào phòng; bật riêng micro rồi camera | Không tự bật; độc lập |
| 2 | Từ chối quyền; rút thiết bị | Lỗi rõ; cờ và chat dùng được |
| 3 | Vào bằng người xem | Không nút phát |
| 4 | Rời phòng; mô phỏng mất quyền | Luồng dừng, đèn thiết bị tắt |
| 5 | Dùng bàn phím | Nhãn, focus đúng |
| 6 | Đối chiếu từng gạch đầu dòng ở phần "Thành phần màn hình phải có" với màn hình thật, và đủ 5 trạng thái ở bảng nghiệm thu | Không thiếu, không thừa; chức năng chưa làm mờ hoặc ẩn đúng quy tắc |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt, đủ 5 trạng thái, không có chức năng lưu.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** bảng điều khiển camera/micro cho tích hợp media.
**Không thuộc task này:** cấp quyền ở máy chủ (T-49), tiếp quản tab (T-49), chức năng ghi.
**Phục vụ (nguồn):** Story 21, 23; tiêu chí AC-PLAY-09-02, AC-MEDIA-01-01, AC-MEDIA-02-01. Thuộc Epic: Chat, camera và micro.
**Kết quả (đầu ra):** Bảng camera/micro: bật tắt độc lập, 3 mức chia sẻ, thông báo quyền và lỗi; đủ 5 trạng thái.
**Bằng chứng nộp:** Ảnh; thử thiết bị thật. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Trình duyệt hỏi quyền chỉ khi người dùng bấm bật.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-07, T-34, T-35; liên quan tới (relates to) Story 21, Story 23; Epic: Chat, camera và micro.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Nguyễn Minh Thư**; Sprint **XIAN Sprint 3**; Fix version **v0.3**; Start date **2026-10-21**; Due date **2026-10-22**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/09-task-e7-chat-cam-mic.md` — T-36.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Nguyễn Minh Thư**.
* Review/kiểm độc lập dự kiến: **4841_Lê Thị Xuân Nhạn**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-7](https://xiangqi-web.atlassian.net/browse/XIAN-7).

**Phải hoàn tất trước:**

* [T-07 — XIAN-41](https://xiangqi-web.atlassian.net/browse/XIAN-41)
* [T-34 — XIAN-68](https://xiangqi-web.atlassian.net/browse/XIAN-68)
* [T-35 — XIAN-69](https://xiangqi-web.atlassian.net/browse/XIAN-69)

**Story phục vụ:**

* [Story 21 — XIAN-29](https://xiangqi-web.atlassian.net/browse/XIAN-29)
* [Story 23 — XIAN-31](https://xiangqi-web.atlassian.net/browse/XIAN-31)

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
| Bắt đầu thực hiện | 2026-10-21 17:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-22 14:00 |
| Bắt đầu review | 2026-10-22 14:00 |
| Review PASS và bàn giao mục tiêu | 2026-10-22 15:00 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-48 — Máy chủ: chat hai kênh, quyền đọc, giới hạn tin, lọc từ cấm

**Jira thực:** [XIAN-82](https://xiangqi-web.atlassian.net/browse/XIAN-82) · **Loại:** Task · **Assignee:** nguyenhoangtungtuyhoa · **Sprint:** XIAN Sprint 3 · **Fix version:** v0.3
**Components:** Communication · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `US-CHAT-01`, `US-CHAT-02`, `xiangqi-mvp-20261005`, `t-48`
**Ước lượng:** 6 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-24 · **Due date:** 2026-10-24 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Chat, camera và micro · **Components:** Communication
**Phải xong trước:**

* **T-04 — Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập**: Các tệp tạo bảng và quy tắc quyền truy cập chạy được trên cơ sở dữ liệu thử; ràng buộc (một ghế mỗi người, số người xem 0–5, tên không trùng không phân biệt hoa thường).
* **T-09 — Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ**: Bộ lọc từ cấm dùng chung, cơ chế chống làm hai lần (biên lai theo người gửi và mã yêu cầu), bộ giới hạn tốc độ với các mức đã chốt; kèm ví dụ cách dùng.
* **T-19 — Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh**: Chức năng vào phòng bằng mã, đường dẫn, Sảnh: xếp ghế hoặc người xem, kiểm sức chứa, chặn sai mã.
* **T-34 — Nghiệm thu bản chơi được: đăng ký, tạo phòng, mời, đánh online và đánh với máy chạy trọn**: Bản chơi được đã PASS M1–M4 trên bản chạy thật; báo cáo hoàn tất nhưng chưa đạt không mở phần làm sau, trừ PO cho phép rõ ràng.
* **T-44 — Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng**: Đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời và chuyển quyền, đóng phòng, quay về phòng chờ sau ván. Mời xuống ghế cần Chấp nhận; không giữ ghế, kiểm lại điều kiện lúc nhận và reset Sẵn sàng.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Cho người dùng nhắn tin trong phòng, **mỗi tin chỉ tới đúng người có quyền đọc ở thời điểm đó**. Tin hợp lệ được lọc, lưu và gửi đúng kênh.

**Việc cần làm (làm lần lượt)**

1. Xác định người gửi; nếu tin này đã xử lý (gửi lại), trả kết quả cũ, **không gửi tin thứ hai**.
2. Với tin mới: kiểm tra **vai và kênh** (người xem không được dùng Kênh Riêng), độ dài tối đa 200 ký tự, và tốc độ 5 tin/10 giây.
3. **Che từ cấm** bằng hàm dùng chung (T-09), rồi ghi tin và biên lai **cùng lúc**, sau đó mới gửi tới đúng người nhận.
4. **Mốc đọc:** Kênh Chung: người vào chỉ đọc từ lúc họ vào; Kênh Riêng: chỉ người đang ngồi ghế; người đổi ghế mất quyền đọc Kênh Riêng cũ. Khi **cả cặp** ngồi ghế đổi, người mới và cả cặp mới **không đọc** tin của cặp cũ (PO đã chốt 04/10/2026).
5. **Dọn dẹp khi phòng đóng:** xoá toàn bộ tin của phòng. Ở task này kiểm bằng "tín hiệu đóng phòng" mẫu; kiểm khi phòng đóng thật làm ở task tích hợp chat (T-56).
6. Xoá toàn bộ tin chat của phòng khi phòng đóng (tác vụ dọn định kỳ) và kiểm chữ thuần: máy chủ không biến đổi nội dung thành mã chạy được.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Gửi tin 200 và 201 ký tự; gửi tin thứ 5 và thứ 6 trong 10 giây | 200 và tin thứ 5 nhận; 201 và tin thứ 6 bị chặn |
| Người xem dùng công cụ gửi tin vào, hoặc đọc tin của Kênh Riêng (kênh của hai người chơi) | Không nhận tin, không lưu tin; không đọc được |
| Người xem mới vào, hoặc người mới xuống ghế đọc tin cũ | Không đọc được tin trước thời điểm có quyền |
| Từ cấm có dấu, khoảng trắng, ký tự chèn, số 0 và 1 thay chữ | Bị che `***` đúng; khi phòng đóng, tin được xoá |
| Gửi lại cùng một tin sau khi đổi ghế | Chỉ một tin đã lọc; người mới ngồi không nhận lịch sử cũ |

**Cách tự kiểm tra**

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Gửi tin 200/201 ký tự; tin thứ 5 và thứ 6 trong 10 giây | Biên hợp lệ nhận, vượt bị chặn |
| 2 | Người xem dùng công cụ thử gửi tin vào và đọc tin của Kênh Riêng | Không gửi được, không đọc được |
| 3 | Người xem mới vào, người mới xuống ghế đọc lịch sử | Không đọc tin trước thời điểm có quyền |
| 4 | Gửi từ cấm với các biến thể; phát tín hiệu đóng phòng mẫu | Che `***`; tin của phòng bị xoá |
| 5 | Gửi lại tin cũ; đổi ghế qua T-44 | Một tin; người mới ngồi không thấy lịch sử |
| 6 | Đổi cặp: A và B chat riêng, B xuống xem, C lên ngồi; tải lại và gửi tin mới | A và C **không** thấy tin cũ của A và B; B mất quyền Kênh Riêng; A và C nhận tin mới |

**Khi nào chuyển cho người kiểm thử:** dòng 1 đến 5 đạt; dòng 6 (đổi cặp) cũng phải đạt.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Trường hợp đổi cặp (dòng 6) bắt buộc đạt theo quyết định đã chốt.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** chức năng chat ở máy chủ cho giao diện chat, tích hợp chat, bài tải.
**Không thuộc task này:** nhắn tin riêng giữa bạn bè, sticker, giao diện, dọn chat khi phòng đóng thật.
**Phục vụ (nguồn):** Story 22; tiêu chí AC-CHAT-01-01, AC-CHAT-01-02, AC-CHAT-01-03, AC-CHAT-02-01, AC-CHAT-02-02. Thuộc Epic: Chat, camera và micro.
**Kết quả (đầu ra):** Chat hai kênh ở máy chủ: quyền đọc theo mốc, 200 ký tự, 5 tin/10 giây, che từ cấm, xoá khi đóng phòng.
**Bằng chứng nộp:** Kết quả thử 6 ca; dữ liệu thô người xem. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Đổi cặp ngồi ghế: đã chốt không đọc tin cũ.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-04, T-09, T-19, T-34, T-44; liên quan tới (relates to) Story 22; Epic: Chat, camera và micro.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **nguyenhoangtungtuyhoa**; Sprint **XIAN Sprint 3**; Fix version **v0.3**; Start date **2026-10-24**; Due date **2026-10-24**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/09-task-e7-chat-cam-mic.md` — T-48.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **nguyenhoangtungtuyhoa**.
* Review/kiểm độc lập dự kiến: **Võ Thành Đông**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-7](https://xiangqi-web.atlassian.net/browse/XIAN-7).

**Phải hoàn tất trước:**

* [T-04 — XIAN-38](https://xiangqi-web.atlassian.net/browse/XIAN-38)
* [T-09 — XIAN-43](https://xiangqi-web.atlassian.net/browse/XIAN-43)
* [T-19 — XIAN-53](https://xiangqi-web.atlassian.net/browse/XIAN-53)
* [T-34 — XIAN-68](https://xiangqi-web.atlassian.net/browse/XIAN-68)
* [T-44 — XIAN-78](https://xiangqi-web.atlassian.net/browse/XIAN-78)

**Story phục vụ:**

* [Story 22 — XIAN-30](https://xiangqi-web.atlassian.net/browse/XIAN-30)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 4 | nguyenhoangtungtuyhoa |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 1 | nguyenhoangtungtuyhoa |
| Review độc lập | 1 | Võ Thành Đông |
| Tổng Original/Remaining Estimate ban đầu | 6 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc phạm vi hẹp/cấu hình/giao diện hoặc nối chức năng đã có đầu vào: ca thực hiện ngắn, kiểm và review riêng. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-24 10:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-24 16:00 |
| Bắt đầu review | 2026-10-24 16:00 |
| Review PASS và bàn giao mục tiêu | 2026-10-24 17:00 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-49 — Máy chủ: cấp quyền camera/micro theo vai và mở nhiều tab (tab mới tiếp quản)

**Jira thực:** [XIAN-83](https://xiangqi-web.atlassian.net/browse/XIAN-83) · **Loại:** Task · **Assignee:** TÌNH 4851_NGUYỄN NGỌC · **Sprint:** XIAN Sprint 3 · **Fix version:** v0.3
**Components:** Communication, Game Server · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `US-AUTH-04`, `US-MEDIA-01`, `US-MEDIA-02`, `US-MEDIA-03`, `xiangqi-mvp-20261005`, `t-49`
**Ước lượng:** 12 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-23 · **Due date:** 2026-10-24 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Chat, camera và micro · **Components:** Communication, Game Server
**Phải xong trước:**

* **T-17 — Máy chủ: đăng nhập, quản lý phiên và hồ sơ**: Đăng nhập bằng tên đăng nhập và mật khẩu, quản lý phiên 12 giờ/30 ngày, kiểm hạn và thu hồi, xem và sửa tên hiển thị. Đăng nhập Google chạy được. Kèm hạn phiên cố định, phân biệt tab/thiết bị, dữ liệu loại phiên và tín hiệu hết phiên/thay thiết bị cho các mô-đun ván.
* **T-29 — Máy chủ: đồng hồ ván, kết thúc ván, đầu hàng, xin hoà**: Đồng hồ ván do máy chủ tính, hết giờ, đóng băng khi lỗi ghi; kết thúc ván, đầu hàng, xin hoà.
* **T-31 — Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ**: Ván với máy ở máy chủ (cấp, phe, một chỗ chơi, vào lại 30 phút), xử lý bận/hỏng/Bỏ dở/Thử lại. Nối luật hết phiên/thiết bị khác; đường ván AI cũ sau khởi động lại báo mất trạng thái, không tự hồi sinh.
* **T-34 — Nghiệm thu bản chơi được: đăng ký, tạo phòng, mời, đánh online và đánh với máy chạy trọn**: Bản chơi được đã PASS M1–M4 trên bản chạy thật; báo cáo hoàn tất nhưng chưa đạt không mở phần làm sau, trừ PO cho phép rõ ràng.
* **T-35 — Thử nghiệm LiveKit Cloud: camera/micro theo từng người, thu hồi quyền**: Báo cáo thử nghiệm dịch vụ camera/micro: quyền phát/nhận theo từng người, thu hồi, token cũ, mức dùng hạn mức; kết luận đạt/không đạt/chưa kết luận.
* **T-44 — Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng**: Đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời và chuyển quyền, đóng phòng, quay về phòng chờ sau ván. Mời xuống ghế cần Chấp nhận; không giữ ghế, kiểm lại điều kiện lúc nhận và reset Sẵn sàng.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Từ **vai trò thật trong phòng**, máy chủ cấp và thay đổi quyền camera/micro ở dịch vụ LiveKit: ai được phát, ai được nghe ai. Người dùng hợp lệ giữ quyền mới; **kết nối hay mã truy cập cũ không dùng lại được để lấy quyền đã mất**.

Mỗi người chỉ **một tab điều khiển** tại một thời điểm. Khi mở tab mới cùng tài khoản và cùng phòng, tab mới **tiếp quản**; tab cũ chuyển **chỉ đọc**, dừng camera/micro, và **không gửi được lệnh** làm thay đổi ván hay phòng. Tiếp quản tab chỉ áp dụng cùng thiết bị. Đăng nhập thiết bị khác là tín hiệu phiên riêng từ T-17: online/AI đang chơi xử thua và rời vị trí, nơi cũ đăng xuất, nơi mới về Sảnh; ở đây thu quyền kết nối/media cũ, kiểm trọn ván ở T-57.

**Việc cần làm (làm lần lượt)**

1. Lập **bảng quyền**: ai được nhận luồng của ai theo mức chia sẻ của người phát (không chia sẻ / chỉ đối thủ / cả đối thủ và người xem).
2. **Cấp token** (chìa truy cập) ở máy chủ: người xem **không bao giờ** có quyền phát.
3. Khi đổi vai, đuổi hoặc tiếp quản: **cập nhật hoặc thu hồi** quyền của kết nối cũ ngay. Phòng bị khoá vẫn **giữ nguyên người đang có mặt**.
4. Nối thông báo đuổi, rời, đóng phòng và đổi vai (T-44) vào cùng dịch vụ quyền.
5. Cách thu hồi cụ thể cần được duyệt và có số đo trước khi dùng; **quyền cấm phát/nhận không được là tuỳ chọn**.
6. Khi người dùng chủ động mở tab mới/tiếp quản trên cùng thiết bị với phiên hợp lệ, chọn nó làm **kết nối điều khiển** (xử lý lần lượt theo người để tránh hai tab cùng thắng).
7. Báo cho tab cũ: "Phiên này đã được mở ở tab khác", chuyển chỉ đọc; **chặn ở máy chủ** mọi lệnh làm thay đổi từ kết nối cũ.
8. **Thu quyền camera/micro cũ** qua việc cấp quyền ở các bước trên; nơi mới **mặc định tắt**.
9. Phiên hết hạn hoặc sai thì **không** được chiếm quyền điều khiển.
10. Task này chỉ chứng minh phía máy chủ bằng kết nối thử; việc thiết bị thật dừng và thông báo trên màn hình nghiệm thu ở T-59.
11. Tab cũ tự reconnect **vẫn chỉ đọc**, không tự tiếp quản; chỉ chủ động tiếp quản mới giành lại quyền. Hạn phiên không trượt. Nối tín hiệu đăng nhập thiết bị khác để thu API/Socket/media cũ; không chuyển thiết bị mới vào ván cũ. Cách nhận diện và cưỡng chế cần PoC theo docs/04, chưa tự chốt thuật toán nhận diện thiết bị.
12. Mức chia sẻ mặc định của phòng tự tạo là **Chỉ đối thủ**, thiết bị vẫn Tắt. Quyền nhận phụ thuộc người phát; không yêu cầu người nhận bật thiết bị hoặc chia sẻ ngược. Người xem chỉ nhận khi người phát chọn Cả đối thủ và người xem.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Người xem dùng công cụ xin quyền phát hình hoặc quyền cao hơn | Dịch vụ camera/micro chặn ngay |
| Đổi giữa ba mức chia sẻ với đối thủ/người xem | Đúng tập người nhận |
| Dùng lại token cũ sau khi đổi vai hoặc bị đuổi | Không lấy lại quyền cũ; quyền mới hợp lệ vẫn hoạt động |
| Phòng khoá; người đang có mặt còn/hết hạn giữ chỗ | Không thu quyền chỉ vì khoá; cấp lại đúng tư cách |
| Đuổi hoặc đóng phòng khi còn luồng đang chạy | Người bị đuổi không xin được token mới; phòng đóng không còn quyền nhận/phát |
| Hai kết nối thử cùng tài khoản, nơi sau tiếp quản | Nơi cũ nhận thông báo, mất quyền ghi và quyền phát; nơi mới mặc định tắt |
| Nơi cũ gửi lệnh làm thay đổi | Bị từ chối **trước khi** vào xử lý, tác động bằng 0 |
| Cùng tài khoản mở nhiều tab cùng lúc | Chỉ một tab (tab mới nhất) có quyền điều khiển camera/micro |
| Phiên hết hạn xin tiếp quản | Không chiếm quyền điều khiển |

**Cách tự kiểm tra**
Chuẩn bị: LiveKit thật (tài khoản thử); hai kết nối thử cùng tài khoản/cùng thiết bị. Mốc giữ chỗ dùng trạng thái vai/ghế mẫu ở task này; kết nối lại cả phòng thật kiểm ở T-57, không báo đã kiểm trọn từ dữ liệu mẫu.

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Người xem dùng công cụ thử phát hình hoặc xin quyền cao hơn | Dịch vụ camera/micro chặn |
| 2 | Đổi qua lại ba mức chia sẻ | Đúng tập nhận |
| 3 | Dùng token cũ sau khi đổi vai/đuổi | Không lấy lại quyền; quyền mới dùng được |
| 4 | Phòng khoá, người còn/hết hạn giữ chỗ xin token | Không thu quyền vì khoá; cấp lại đúng tư cách |
| 5 | Đuổi hoặc đóng phòng khi còn luồng | Không có token mới; không còn quyền |
| 6 | Mở kết nối thứ hai | Kết nối cũ nhận thông báo, mất quyền ghi và phát; mới mặc định tắt |
| 7 | Kết nối cũ gửi lệnh thay đổi | Bị từ chối, không tác động |
| 8 | Mở nhiều kết nối cùng lúc | Chỉ một có quyền |
| 9 | Dùng phiên hết hạn xin tiếp quản | Không chiếm được |
| 10 | Tab cũ tự reconnect; chủ động tiếp quản; phiên không hợp lệ; tín hiệu đăng nhập thiết bị khác | Reconnect không cướp quyền; chỉ phiên hợp lệ/chủ động được tiếp quản cùng thiết bị; thiết bị khác thu quyền cũ và không nối vào ván đang chạy |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt; không ai nhận được luồng trái quyền.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý. Kết nối lại cả phòng khi bị khoá kiểm ở T-57. Tiếp quản tab thật kiểm ở T-59. Thiết bị thật dừng, thông báo trên màn hình và đi nước sau tiếp quản kiểm ở T-59 và nghiệm thu cuối. **chưa** tính đủ hai yêu cầu liên quan cho đến lúc đó.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** dịch vụ cấp quyền cho giao diện camera/mic, tiếp quản tab, tích hợp media; tiếp quản tab cho tích hợp media.
**Không thuộc task này:** ghi hình, ghi âm; tự dựng dịch vụ riêng; giao diện; hộp thoại chọn tab phụ (P2); tự bật camera ở tab mới.
**Phục vụ (nguồn):** Story 2, 23, 24; tiêu chí AC-AUTH-04-05, AC-MEDIA-01-02, AC-MEDIA-01-04, AC-MEDIA-02-01, AC-MEDIA-02-02, AC-MEDIA-03-01. Thuộc Epic: Chat, camera và micro.
**Kết quả (đầu ra):** Cấp quyền camera/micro theo vai, thu hồi khi đổi vai/đuổi/tiếp quản; mở nhiều tab, tab mới tiếp quản.
**Bằng chứng nộp:** Kết quả thử 5 ca; thử token cũ. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Phải có kết luận đạt từ thử nghiệm camera/micro trước khi làm.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-17, T-29, T-31, T-34, T-35, T-44; liên quan tới (relates to) Story 2, Story 23, Story 24; Epic: Chat, camera và micro.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **TÌNH 4851_NGUYỄN NGỌC**; Sprint **XIAN Sprint 3**; Fix version **v0.3**; Start date **2026-10-23**; Due date **2026-10-24**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/09-task-e7-chat-cam-mic.md` — T-49.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **TÌNH 4851_NGUYỄN NGỌC**.
* Review/kiểm độc lập dự kiến: **Tưởng Lê khoa Cường-4572**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-7](https://xiangqi-web.atlassian.net/browse/XIAN-7).

**Phải hoàn tất trước:**

* [T-17 — XIAN-51](https://xiangqi-web.atlassian.net/browse/XIAN-51)
* [T-29 — XIAN-63](https://xiangqi-web.atlassian.net/browse/XIAN-63)
* [T-31 — XIAN-65](https://xiangqi-web.atlassian.net/browse/XIAN-65)
* [T-34 — XIAN-68](https://xiangqi-web.atlassian.net/browse/XIAN-68)
* [T-35 — XIAN-69](https://xiangqi-web.atlassian.net/browse/XIAN-69)
* [T-44 — XIAN-78](https://xiangqi-web.atlassian.net/browse/XIAN-78)

**Story phục vụ:**

* [Story 2 — XIAN-10](https://xiangqi-web.atlassian.net/browse/XIAN-10)
* [Story 23 — XIAN-31](https://xiangqi-web.atlassian.net/browse/XIAN-31)
* [Story 24 — XIAN-32](https://xiangqi-web.atlassian.net/browse/XIAN-32)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 8 | TÌNH 4851_NGUYỄN NGỌC |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 2 | TÌNH 4851_NGUYỄN NGỌC |
| Review độc lập | 2 | Tưởng Lê khoa Cường-4572 |
| Tổng Original/Remaining Estimate ban đầu | 12 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc có luật nghiệp vụ, xử lý trạng thái, tích hợp hoặc kiểm định chất lượng: dành ca dài hơn và dự phòng sửa lỗi. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-23 09:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-24 11:00 |
| Bắt đầu review | 2026-10-24 11:00 |
| Review PASS và bàn giao mục tiêu | 2026-10-24 14:00 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-56 — Giao diện chat hai kênh và nối web với máy chủ

**Jira thực:** [XIAN-90](https://xiangqi-web.atlassian.net/browse/XIAN-90) · **Loại:** Task · **Assignee:** Nguyễn Minh Thư · **Sprint:** XIAN Sprint 3 · **Fix version:** v0.3
**Components:** Frontend, Communication · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `US-CHAT-01`, `US-CHAT-02`, `US-PLAY-09`, `xiangqi-mvp-20261005`, `t-56`
**Ước lượng:** 6 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-24 · **Due date:** 2026-10-25 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Chat, camera và micro · **Components:** Frontend, Communication
**Phải xong trước:**

* **T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ**: Gói hợp đồng chung biên dịch được, có danh sách lệnh, thông tin đi kèm, nhóm lỗi và ví dụ hợp lệ/sai dùng được ở cả giao diện và máy chủ.
* **T-07 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)**: Ứng dụng web chạy được, có kiểu chữ/màu Kỳ Đài Cổ Phong, các khối nền (nút, ô nhập, hộp thoại, thông báo, chú thích, khung xương) đủ 5 trạng thái và trang kiểm tra nội bộ.
* **T-09 — Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ**: Bộ lọc từ cấm dùng chung, cơ chế chống làm hai lần (biên lai theo người gửi và mã yêu cầu), bộ giới hạn tốc độ với các mức đã chốt; kèm ví dụ cách dùng.
* **T-46 — Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời**: Điều khiển phòng nâng cao chạy thật trên web và máy chủ: đổi chỗ, khoá, danh sách, đuổi, chủ phòng rời.
* **T-48 — Máy chủ: chat hai kênh, quyền đọc, giới hạn tin, lọc từ cấm**: Chat hai kênh ở máy chủ: quyền đọc theo mốc, 200 ký tự, 5 tin/10 giây, che từ cấm, xoá khi đóng phòng.
* **T-50 — Máy chủ: người xem theo dõi trực tiếp, lọc dữ liệu theo vai trò**: Người xem nhận trạng thái ván chỉ đọc, dữ liệu lọc ở máy chủ, thấy X/N người xem.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Dựng khung chat để người dùng **phân biệt rõ hai kênh**, biết tin nào đang gửi, tin nào lỗi, và biết quyền đọc của mình. Dùng dữ liệu giả; nối thật ở bước nối với máy chủ ngay sau đây.

Nối khung chat với máy chủ thật và kiểm **quyền ở dữ liệu thật gửi qua mạng**, chứ không chỉ nhìn tab bị ẩn.

**Việc cần làm (làm lần lượt)**

1. **Hai kênh theo vai:** máy tính mặc định chỉ mở Kênh Riêng, có thể mở thêm Kênh Chung để xem đồng thời hoặc đóng bớt một khung; điện thoại dùng hai tab, mặc định Kênh Riêng. Giữ công tắc ẩn Kênh Chung. Người xem chỉ thấy Kênh Chung; bố cục không làm đổi quyền đọc/gửi.
2. Ô nhập tin, nút gửi; hiện **"đang gửi"** đến khi nhận xác nhận. Gửi lỗi giữ lại nội dung (không nhạy cảm) để thử lại, **không tạo tin mới mù quáng**.
3. Dùng **hàm che từ cấm chung** ngay trên giao diện để người dùng thấy trước kết quả, nhưng **máy chủ mới là nơi quyết định**.
4. Khi đổi ghế (người chơi thành người xem), **gỡ khỏi màn hình** lịch sử Kênh Riêng không còn quyền.
5. Đủ 5 trạng thái: không có tin, đang tải, lỗi, không được gửi (có lý do). Khay sticker **ẩn**. Dùng được bằng bàn phím.
6. Nối kênh, phản hồi xác nhận và bộ lọc dùng chung ở cả hai phía.
7. Chạy người chơi và người xem, **bắt dữ liệu mạng** để chắc người xem không nhận byte nào của Kênh Riêng.
8. Đổi ghế, đuổi, đóng phòng rồi kiểm dữ liệu và lỗi.
9. Ghép chat với các thao tác đổi ghế/đuổi/đóng phòng đã nối thật ở T-46; kiểm bộ lọc cùng phiên bản ở web và máy chủ.
10. Hiển thị **chữ thuần**: nội dung do người dùng gõ (tên hiển thị, tên phòng, tin chat) luôn hiện nguyên văn như chữ, **không** chạy mã HTML, script hay đường dẫn tự kích hoạt.

**Thành phần màn hình phải có (theo danh mục màn hình, chỉ phần P1 (MVP))**
_Khung Chat_ (`PANEL-CHAT`)

* Desktop: khung Riêng mặc định, mở thêm khung Chung để xem đồng thời hoặc đóng bớt một khung. Mobile: hai tab Riêng/Chung, mặc định Riêng. Người xem chỉ thấy Chung; giữ công tắc ẩn Chung.
* Ô nhập tin, nút gửi; tin hiện "đang gửi" đến khi xác nhận; thông báo "Bạn gửi quá nhanh"; từ cấm hiện `***`.
* Khay sticker **ẩn**; tin phòng xoá khi phòng đóng.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**

| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
| --- | --- | --- | --- | --- | --- |
| Khung Chat | Tin đúng quyền/kênh sau bộ lọc | Tải/gửi tin | Chưa có tin: lời nhắc viết theo kênh | Gửi lỗi: đánh dấu chưa gửi, kiểm lại rồi mới cho gửi lại | Vượt giới hạn, mất quyền kênh, ô trống |

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
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
| --- | --- | --- |
| 1 | Vào bằng hai vai, ẩn/hiện Kênh Chung | Đúng kênh mặc định |
| 2 | Giả lập từ chối và mất phản hồi | Không báo đã gửi, không tạo tin mới |
| 3 | Chuyển người chơi thành người xem | Mất dữ liệu Kênh Riêng |
| 4 | Xem 5 trạng thái | Đủ, có lý do |
| 5 | Nhập từ cấm biến thể | Che đúng; nút gửi mờ có chú thích |
| 6 | Gửi ở từng kênh từ hai người chơi và người xem | Đúng người nhận |
| 7 | Gửi nhanh, quá dài, từ cấm biến thể | Chặn/che như quy tắc |
| 8 | Ngắt mạng sau khi gửi, gửi lại cùng tin | Một tin duy nhất |
| 9 | Người xem vào muộn, người mới xuống ghế, đóng phòng | Đúng mốc; tin bị xoá khi đóng |
| 10 | Đổi ghế, đóng phòng bằng T-46 | Đúng quyền; không byte Kênh Riêng tới người xem |
| 11 | Đổi cặp: A và B chat riêng, B xuống xem, C lên ngồi; tải lại và gửi tin mới | A và C **không** thấy tin cũ của A và B; B mất quyền Kênh Riêng; A và C nhận tin mới |
| 12 | Nhập chuỗi chứa thẻ HTML, script, "javascript:" vào tin chat | Hiện nguyên văn như chữ; không có mã nào chạy, không điều hướng |
| 13 | Đối chiếu từng gạch đầu dòng ở phần "Thành phần màn hình phải có" với màn hình thật, và đủ 5 trạng thái ở bảng nghiệm thu | Không thiếu, không thừa; chức năng chưa làm mờ hoặc ẩn đúng quy tắc |
| 14 | Máy tính mở cùng lúc hai kênh rồi đóng từng khung; điện thoại đổi hai tab; người xem thử gọi Kênh Riêng | Mặc định Kênh Riêng, bố cục đúng; đóng khung không đổi quyền; người xem không nhận/gửi dữ liệu riêng |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý. Chat chỉ được coi là chạy thật sau khi đã nối với máy chủ ở các bước trên. Ca đổi cặp người chơi ở bảng tự kiểm bắt buộc đạt theo quyết định đã chốt.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** khung chat cho tích hợp chat; chat thật cho tích hợp camera/micro, nghiệm thu, bài tải.
**Không thuộc task này:** nhắn tin giữa bạn bè; sticker.
**Phục vụ (nguồn):** Story 21, 22; tiêu chí AC-PLAY-09-02, AC-CHAT-01-01, AC-CHAT-01-02, AC-CHAT-01-03, AC-CHAT-02-02, AC-CHAT-02-03. Thuộc Epic: Chat, camera và micro.
**Kết quả (đầu ra):** Khung chat hai kênh và nối thật với máy chủ; ba trạng thái tin; công tắc Kênh Chung. Desktop mở Riêng mặc định, có thể mở đồng thời Chung hoặc đóng bớt; mobile hai tab mặc định Riêng.
**Bằng chứng nộp:** Ảnh; dữ liệu mạng; kiểm bàn phím. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Không có sticker.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-02, T-07, T-09, T-46, T-48, T-50; liên quan tới (relates to) Story 21, Story 22; Epic: Chat, camera và micro.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Nguyễn Minh Thư**; Sprint **XIAN Sprint 3**; Fix version **v0.3**; Start date **2026-10-24**; Due date **2026-10-25**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/09-task-e7-chat-cam-mic.md` — T-56.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Nguyễn Minh Thư**.
* Review/kiểm độc lập dự kiến: **4841_Lê Thị Xuân Nhạn**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-7](https://xiangqi-web.atlassian.net/browse/XIAN-7).

**Phải hoàn tất trước:**

* [T-02 — XIAN-36](https://xiangqi-web.atlassian.net/browse/XIAN-36)
* [T-07 — XIAN-41](https://xiangqi-web.atlassian.net/browse/XIAN-41)
* [T-09 — XIAN-43](https://xiangqi-web.atlassian.net/browse/XIAN-43)
* [T-46 — XIAN-80](https://xiangqi-web.atlassian.net/browse/XIAN-80)
* [T-48 — XIAN-82](https://xiangqi-web.atlassian.net/browse/XIAN-82)
* [T-50 — XIAN-84](https://xiangqi-web.atlassian.net/browse/XIAN-84)

**Story phục vụ:**

* [Story 21 — XIAN-29](https://xiangqi-web.atlassian.net/browse/XIAN-29)
* [Story 22 — XIAN-30](https://xiangqi-web.atlassian.net/browse/XIAN-30)

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
| Bắt đầu thực hiện | 2026-10-24 17:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-25 14:00 |
| Bắt đầu review | 2026-10-25 14:00 |
| Review PASS và bàn giao mục tiêu | 2026-10-25 15:00 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-59 — Nối camera/micro thật: theo đối tượng nhận, đổi vai, đuổi, tab (web, máy chủ, LiveKit)

**Jira thực:** [XIAN-93](https://xiangqi-web.atlassian.net/browse/XIAN-93) · **Loại:** Task · **Assignee:** TÌNH 4851_NGUYỄN NGỌC · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** Frontend, Communication · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `integration`, `US-AUTH-04`, `US-MEDIA-01`, `US-MEDIA-02`, `US-MEDIA-03`, `xiangqi-mvp-20261005`, `t-59`
**Ước lượng:** 16.5 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-27 · **Due date:** 2026-10-29 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Chat, camera và micro · **Components:** Frontend, Communication
**Phải xong trước:**

* **T-30 — Nối web với máy chủ: đi nước, đồng bộ thế cờ giữa hai trình duyệt**: Hai trình duyệt đánh nước luân phiên, cùng thế cờ và phiên bản sau mỗi nước.
* **T-36 — Giao diện: camera/micro, bật tắt độc lập, mức chia sẻ, thông báo quyền và lỗi**: Bảng camera/micro: bật tắt độc lập, 3 mức chia sẻ, thông báo quyền và lỗi; đủ 5 trạng thái.
* **T-44 — Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng**: Đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời và chuyển quyền, đóng phòng, quay về phòng chờ sau ván. Mời xuống ghế cần Chấp nhận; không giữ ghế, kiểm lại điều kiện lúc nhận và reset Sẵn sàng.
* **T-49 — Máy chủ: cấp quyền camera/micro theo vai và mở nhiều tab (tab mới tiếp quản)**: Cấp quyền camera/micro theo vai, thu hồi khi đổi vai/đuổi/tiếp quản; mở nhiều tab, tab mới tiếp quản.
* **T-56 — Giao diện chat hai kênh và nối web với máy chủ**: Khung chat hai kênh và nối thật với máy chủ; ba trạng thái tin; công tắc Kênh Chung. Desktop mở Riêng mặc định, có thể mở đồng thời Chung hoặc đóng bớt; mobile hai tab mặc định Riêng.
* **T-57 — Nối web với máy chủ: mất kết nối, người xem, bảng nước đi, phòng khoá**: Mất kết nối, kết nối lại, người xem, bảng nước đi, phòng khoá chạy trọn trên web và máy chủ thật. Gồm hết phiên và đăng nhập lại cùng thiết bị, đăng nhập khác thiết bị giữa online/AI trên bản chạy thật.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Nối giao diện, máy chủ và LiveKit Cloud thành **camera/micro chạy thật** và chứng minh: mỗi khi đổi vai, đuổi, đóng phòng hay mở tab mới thì **đúng người nhận luồng**, không rò, và **lỗi camera/micro không làm hỏng việc chơi cờ và chat**.

**Việc cần làm (làm lần lượt)**

1. Chạy bản ghép chung của các task tiền đề; chuẩn bị tài khoản và thiết bị thử.
2. Kiểm ma trận: hai người chơi với từng mức chia sẻ và có người xem (tối đa 5); đổi vai, đuổi, đóng phòng qua phòng thật.
3. **Tiếp quản tab trên cùng thiết bị thật:** tab cũ có thông báo, chỉ đọc, camera/micro dừng, lệnh bị chặn; tab mới tắt mặc định; tab cũ tự reconnect không cướp quyền. Kiểm riêng đăng nhập thiết bị khác: ván cũ thua ngay, nơi cũ đăng xuất/mất media, nơi mới về Sảnh; thử token và lệnh cũ theo kết quả T-57.
4. **Gây lỗi chỉ ở camera/micro** (từ chối quyền, ngắt luồng) trong khi vẫn kết nối ứng dụng; rồi **đi nước** (T-30) và **gửi chat** (T-56) để chắc không bị ảnh hưởng.
5. Lưu thông tin quyền và luồng làm bằng chứng; **không ghi nội dung hình ảnh hay âm thanh**.
6. Kiểm hai người vừa vào phòng: mức Chỉ đối thủ được chọn sẵn, thiết bị Tắt; bật một người vẫn cho đối thủ nhận dù người nhận không bật. Người xem không nhận cho đến khi người phát chủ động chọn mức Cả đối thủ và người xem.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Từng mức chia sẻ với hai người phát và tối đa năm người xem | Chỉ đúng đối thủ/người xem nhận được; người xem không phát |
| Đổi vai hoặc đuổi trong khi đang truyền; dùng token cũ | Mất quyền tại dịch vụ, không lấy lại; ẩn bảng điều khiển chưa đủ |
| Tab cũ đang phát; tab mới cùng tài khoản tiếp quản; tab cũ gửi nước | Tab cũ có thông báo, chỉ đọc, thiết bị dừng, lệnh bị chặn; tab mới điều khiển, thiết bị tắt |
| Từ chối thiết bị hoặc ngắt riêng camera/micro; rồi đi nước và chat | Nước đi vẫn đồng bộ; chat vẫn gửi và nhận; lỗi camera/micro không khoá hai việc đó |
| Đóng phòng khi còn luồng; xin token mới hoặc dùng token cũ | Không còn quyền nhận hay phát |
| Phòng khoá; người đang có mặt, người mới | Không thu quyền người đang có mặt; không cấp quyền người mới (kết nối lại theo hạn ở T-57) |

**Cách tự kiểm tra**
Chuẩn bị: nhiều trình duyệt, camera và micro thật, tài khoản LiveKit thử.

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Thử từng mức chia sẻ, có người xem | Đúng người nhận; người xem không phát |
| 2 | Đổi vai hoặc đuổi khi đang truyền; dùng token cũ | Mất quyền thật |
| 3 | Mở tab cùng thiết bị, để tab cũ reconnect/gửi nước; đăng nhập thiết bị khác trong ván | Tab cũ chỉ đọc, không cướp quyền; khác thiết bị xử thua ngay, cũ đăng xuất/mất media, mới về Sảnh |
| 4 | Ngắt riêng camera/micro; đi nước và chat | Không bị ảnh hưởng |
| 5 | Đóng phòng khi còn luồng | Không còn quyền |
| 6 | Phòng khoá, so người cũ và mới | Đúng quyền |

**Khi nào chuyển cho người kiểm thử:** mọi dòng trong bảng tự kiểm tra đạt trên luồng, nước đi và chat thật.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Nếu chỉ dùng dữ liệu giả hoặc ẩn giao diện làm bằng chứng thì **không đạt**. Nghiệm thu cuối có thể kiểm lại nhưng không thay thế các ca liên miền ở đây.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** camera/micro chạy thật cho kiểm thử media theo quyền, bài tải, nghiệm thu và demo.
**Không thuộc task này:** ghi hình/ghi âm, mở rộng ngoài hai người chơi và năm người xem.
**Phục vụ (nguồn):** Story 2, 23, 24; tiêu chí AC-AUTH-04-05, AC-MEDIA-01-01, AC-MEDIA-01-02, AC-MEDIA-01-03, AC-MEDIA-02-02, AC-MEDIA-03-01. Thuộc Epic: Chat, camera và micro.
**Kết quả (đầu ra):** Camera/micro chạy thật theo đối tượng nhận, đổi vai, đuổi, tiếp quản tab; lỗi camera/micro không làm hỏng cờ và chat.
**Bằng chứng nộp:** Video; ma trận quyền; nhật ký đã che. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Không ghi nội dung hình, âm thanh.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-30, T-36, T-44, T-49, T-56, T-57; liên quan tới (relates to) Story 23, Story 24; Epic: Chat, camera và micro.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **TÌNH 4851_NGUYỄN NGỌC**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-10-27**; Due date **2026-10-29**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/09-task-e7-chat-cam-mic.md` — T-59.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **TÌNH 4851_NGUYỄN NGỌC**.
* Review/kiểm độc lập dự kiến: **4841_Lê Thị Xuân Nhạn**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-7](https://xiangqi-web.atlassian.net/browse/XIAN-7).

**Phải hoàn tất trước:**

* [T-30 — XIAN-64](https://xiangqi-web.atlassian.net/browse/XIAN-64)
* [T-36 — XIAN-70](https://xiangqi-web.atlassian.net/browse/XIAN-70)
* [T-44 — XIAN-78](https://xiangqi-web.atlassian.net/browse/XIAN-78)
* [T-49 — XIAN-83](https://xiangqi-web.atlassian.net/browse/XIAN-83)
* [T-56 — XIAN-90](https://xiangqi-web.atlassian.net/browse/XIAN-90)
* [T-57 — XIAN-91](https://xiangqi-web.atlassian.net/browse/XIAN-91)

**Story phục vụ:**

* [Story 23 — XIAN-31](https://xiangqi-web.atlassian.net/browse/XIAN-31)
* [Story 24 — XIAN-32](https://xiangqi-web.atlassian.net/browse/XIAN-32)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 12 | TÌNH 4851_NGUYỄN NGỌC |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 2.5 | TÌNH 4851_NGUYỄN NGỌC |
| Review độc lập | 2 | 4841_Lê Thị Xuân Nhạn |
| Tổng Original/Remaining Estimate ban đầu | 16.5 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc có luật nghiệp vụ, xử lý trạng thái, tích hợp hoặc kiểm định chất lượng: dành ca dài hơn và dự phòng sửa lỗi. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-27 14:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-29 11:30 |
| Bắt đầu review | 2026-10-29 11:30 |
| Review PASS và bàn giao mục tiêu | 2026-10-29 14:30 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---
