# Task của Epic "Khởi tạo bàn cờ" (6 task)

**Ngày cập nhật:** 2026-10-05 · **Trạng thái:** đã được PO cho phép tạo và phân công ngày 05/10/2026 · Đã tạo Epic/Story/Task trên XIAN · Viết theo `00-chuan-description.md` và mẫu `00b`.

Mã task `T-01` đến `T-64` đánh theo **thứ tự làm** (số nhỏ làm trước, mỗi task chỉ cần các task có số nhỏ hơn). Một số task gộp nhiều việc nhỏ cùng mục đích thành một task. Ngày Sprint: 1 = 04/10–07/10, 2 = 08/10–10/10, 3 = 11/10–14/10, 4 = 15/10–17/10.

---

### T-05 — Luật cờ: mô hình bàn cờ, thế khởi đầu, nước đi của từng loại quân

**Jira thực:** [XIAN-39](https://xiangqi-web.atlassian.net/browse/XIAN-39) · **Loại:** Task · **Assignee:** TÌNH 4851_NGUYỄN NGỌC · **Sprint:** XIAN Sprint 1 · **Fix version:** v0.1
**Components:** Game Engine · **Priority:** High · **Nhãn:** `P1`, `loi`, `US-BOARD-01`, `xiangqi-mvp-20261005`, `t-05`
**Ước lượng:** 8.5 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-05 · **Due date:** 2026-10-06 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Khởi tạo bàn cờ · **Components:** Game Engine
**Phải xong trước:**

* **T-01 — Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động**: Kho mã cài đặt sạch được; có lệnh biên dịch, kiểm tra cách viết mã, chạy bài kiểm tra; hệ thống kiểm tra tự động báo xanh/đỏ đúng trên mọi nhánh.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Tạo "bộ nhớ" của ván cờ: các loại quân, hai phe, toạ độ ô, và **thế cờ ban đầu** đúng như bàn cờ thật. Đây là nền cho mọi phần khác (sinh nước đi, bàn cờ trên màn hình, máy cờ). Gói này **thuần mã**, không phụ thuộc giao diện hay máy chủ.

Từ một thế cờ, liệt kê **mọi nước "thô"** mà mỗi quân có thể đi theo cách di chuyển riêng của nó (chưa xét việc để Tướng bị chiếu). Task sau sẽ lọc để chỉ còn nước hợp lệ.

**Việc cần làm (làm lần lượt)**

1. Định nghĩa 7 loại quân (Tướng, Sĩ, Tượng, Mã, Xe, Pháo, Tốt), 2 phe và toạ độ theo quy ước ở đầu file. Phe nhìn bàn theo hướng nào là việc của giao diện, **không** nằm trong dữ liệu thế cờ.
2. Viết hàm **tạo thế khởi đầu** theo bảng vị trí quân chuẩn; Đỏ đi trước.
3. Viết cách đọc, sao chép thế cờ để sửa bản sao không làm hỏng bản gốc.
4. Làm sẵn một thế khởi đầu chuẩn để các bài thử sau dùng chung.
5. Làm riêng từng loại quân: Tướng và Sĩ **trong cung**; Tượng đi chéo hai ô, **không qua sông**, **bị chặn "mắt tượng"**; Mã đi hình chữ nhật **bị chặn chân**; Xe đi thẳng, không nhảy quân; Pháo đi như Xe nhưng **ăn quân phải nhảy qua đúng một quân (ngòi)**; Tốt tiến một ô, **sau khi qua sông được đi ngang**, không bao giờ lùi.
6. Không đi vào ô có quân cùng phe; ăn quân đối phương ở ô đích.
7. Làm bài thử cho cả hai phe, kiểm thế đầu vào không bị sửa.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Tạo thế khởi đầu | Đúng 32 quân đúng ô, đúng phe, Đỏ đi trước |
| Đọc hay ghi ô ngoài bàn (x ngoài 0–8, y ngoài 0–9) | Không đọc/ghi được, không tạo quân sai |
| Đổi hướng nhìn của bàn (chỉ hiển thị) | Toạ độ trong dữ liệu không đổi |
| Sửa một bản sao thế cờ | Bản gốc và các bản khác không đổi |
| Mã bị chặn chân; Tượng bị chặn mắt hoặc muốn qua sông | Không có nước đó |
| Pháo không có ngòi / đúng một ngòi / nhiều ngòi | Không ăn / ăn được / không ăn; nước thường không nhảy quân |
| Tướng hoặc Sĩ đang đứng sát mép cung | Không đi ra ngoài cung |
| Tốt trước và sau khi qua sông; Xe bị quân chắn | Tốt không lùi, qua sông mới đi ngang; Xe không nhảy qua |

**Cách tự kiểm tra**
Chuẩn bị: bảng vị trí quân ban đầu (viết bằng chuỗi chuẩn của cờ tướng) làm đáp án.

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | So từng ô của thế khởi đầu với đáp án | Đúng quân, ô, phe, lượt Đỏ |
| 2 | Đọc/ghi ô ngoài bàn | Bị từ chối |
| 3 | Đổi hướng nhìn rồi đọc dữ liệu | Toạ độ gốc giữ nguyên |
| 4 | Sửa một bản sao | Bản khác không đổi |
| 5 | Đặt quân chặn chân Mã, chặn mắt Tượng | Không có nước bị chặn |
| 6 | Pháo với 0, 1, nhiều ngòi | Chỉ ăn qua đúng một ngòi |
| 7 | Tướng và Sĩ sát mép cung | Không ra khỏi cung |
| 8 | Tốt hai phe trước/sau sông; Xe bị chắn | Đúng hướng; không nhảy quân |
| 9 | Chạy cả hai phe | Không đi vào ô quân mình; thế gốc không đổi |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý. Tập nước này **chưa** là "nước hợp lệ" vì chưa lọc việc để Tướng bị chiếu.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** mô hình thế cờ, hàm tạo thế khởi đầu cho sinh nước đi, bàn cờ trên màn hình, bắt đầu ván; bộ sinh nước thô cho lọc hợp lệ, chiếu, máy cờ.
**Không thuộc task này:** luật kết thúc; giao diện; xuất ván cờ; tự chiếu, chiếu hết, lượt đi và mạng (làm ở task luật hợp lệ).
**Phục vụ (nguồn):** Story 13; tiêu chí AC-BOARD-01-01, AC-BOARD-01-02. Thuộc Epic: Khởi tạo bàn cờ.
**Kết quả (đầu ra):** Gói luật cờ: kiểu quân, toạ độ, thế khởi đầu, nước đi từng loại quân, độc lập với giao diện.
**Bằng chứng nộp:** Kết quả bộ thử từng quân; thế khởi đầu đối chiếu. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Không có.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-01; liên quan tới (relates to) Story 13; Epic: Khởi tạo bàn cờ.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **TÌNH 4851_NGUYỄN NGỌC**; Sprint **XIAN Sprint 1**; Fix version **v0.1**; Start date **2026-10-05**; Due date **2026-10-06**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/06-task-e4-khoi-tao-ban-co.md` — T-05.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **TÌNH 4851_NGUYỄN NGỌC**.
* Review/kiểm độc lập dự kiến: **Gia Kỳ**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-4](https://xiangqi-web.atlassian.net/browse/XIAN-4).

**Phải hoàn tất trước:**

* [T-01 — XIAN-35](https://xiangqi-web.atlassian.net/browse/XIAN-35)

**Story phục vụ:**

* [Story 13 — XIAN-21](https://xiangqi-web.atlassian.net/browse/XIAN-21)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 6 | TÌNH 4851_NGUYỄN NGỌC |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 1.5 | TÌNH 4851_NGUYỄN NGỌC |
| Review độc lập | 1 | Gia Kỳ |
| Tổng Original/Remaining Estimate ban đầu | 8.5 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc có luật nghiệp vụ, xử lý trạng thái, tích hợp hoặc kiểm định chất lượng: dành ca dài hơn và dự phòng sửa lỗi. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-05 17:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-06 16:30 |
| Bắt đầu review | 2026-10-06 16:30 |
| Review PASS và bàn giao mục tiêu | 2026-10-06 17:30 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-08 — Luật cờ: nước hợp lệ, chiếu, chiếu hết, hết nước, lặp thế, 120 nửa nước

**Jira thực:** [XIAN-42](https://xiangqi-web.atlassian.net/browse/XIAN-42) · **Loại:** Task · **Assignee:** TÌNH 4851_NGUYỄN NGỌC · **Sprint:** XIAN Sprint 1 · **Fix version:** v0.1
**Components:** Game Engine · **Priority:** High · **Nhãn:** `P1`, `loi`, `US-PLAY-01`, `US-PLAY-03`, `US-PLAY-08`, `xiangqi-mvp-20261005`, `t-08`
**Ước lượng:** 14 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-06 · **Due date:** 2026-10-08 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Khởi tạo bàn cờ · **Components:** Game Engine
**Phải xong trước:**

* **T-05 — Luật cờ: mô hình bàn cờ, thế khởi đầu, nước đi của từng loại quân**: Gói luật cờ: kiểu quân, toạ độ, thế khởi đầu, nước đi từng loại quân, độc lập với giao diện.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Lọc nước thô thành **nước hợp lệ**, nhận biết **chiếu**, **chiếu hết**, **hết nước đi**. Máy chủ và máy cờ dùng chung kết quả này, không mỗi nơi tự làm một kiểu.

Thêm các luật kết thúc ván khác ngoài chiếu hết: **lặp thế**, **chiếu liên tục**, **120 nửa nước không ăn quân**. Cho ra một hàm duy nhất, sau mỗi nước, báo ván tiếp tục hay kết thúc và vì lý do gì.

**Việc cần làm (làm lần lượt)**

1. Với mỗi nước thô, **thử đi trên bản sao** rồi kiểm tra: Tướng mình có bị ăn không? Hai Tướng có **đối mặt trực tiếp** (cùng cột, không quân chắn) không? Nếu có, loại nước đó.
2. Viết hàm **nhận biết chiếu** (Tướng đang bị tấn công, tính cả chặn chân, ngòi).
3. Viết hàm xác định bên sắp đi **còn nước hay không**: bị chiếu mà không còn nước = **chiếu hết**; không bị chiếu mà không còn nước = **hết nước**. Cả hai đều **thua**.
4. Làm bài thử các thế: tự chiếu, lộ mặt Tướng, thoát chiếu bằng cách chắn, ăn quân chiếu hoặc di chuyển Tướng.
5. Ghi **khoá thế cờ** = vị trí các quân + bên sắp đi (cùng vị trí nhưng khác bên sắp đi là hai thế khác nhau).
6. Đếm số lần mỗi thế xuất hiện; khi **lặp lần thứ ba**, xét xem từ lần đầu đến lần ba **bên nào chiếu** ở mọi nước của mình: một bên chiếu liên tục → bên đó **thua** (chiếu liên tục); cả hai bên hoặc không bên nào chiếu liên tục → **hoà** (lặp thế).
7. Đếm số nửa nước liên tiếp không ăn quân; đến **120** thì hoà; mỗi lần ăn quân đưa bộ đếm về 0.
8. Thứ tự xét: **chiếu hết/hết nước** trước, rồi chiếu liên tục, lặp thế hoà, cuối cùng 120 nửa nước.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Di chuyển quân đang chắn giữa hai Tướng | Nước bị loại; thế gốc không đổi |
| Đi nước để Tướng mình bị ăn | Không nằm trong tập hợp lệ |
| Bị chiếu và không còn nước; không bị chiếu mà hết nước | "Chiếu hết" và "hết nước", bên sắp đi **thua** cả hai |
| Thoát chiếu bằng chắn, ăn quân chiếu, hoặc di chuyển Tướng | Nhận đúng nước thoát; Mã hay Pháo bị chặn thì không báo chiếu giả |
| Thế cờ lặp lại thành vòng: chỉ một bên liên tục chiếu / cả hai bên cùng liên tục chiếu / không bên nào chiếu | Bên liên tục chiếu bị xử thua / hoà / hoà |
| 119 và 120 nửa nước không ăn; có ăn quân giữa chừng | 119: chưa hoà; 120: hoà (nếu chưa có kết quả ưu tiên hơn); ăn quân đưa về 0 |
| Nước chiếu hết trùng với điều kiện hoà | Tính là chiếu hết, không hoà |
| Hai thế có quân đứng giống hệt nhau nhưng lượt đi khác bên | Không tính là cùng một thế khi đếm lặp |

**Cách tự kiểm tra**

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Thử nước quân chắn giữa hai Tướng | Bị loại, thế gốc giữ nguyên |
| 2 | Thử nước để Tướng mình bị ăn | Không có trong tập hợp lệ |
| 3 | Thế chiếu hết; thế hết nước nhưng không chiếu | Hai kết quả, bên sắp đi thua |
| 4 | Các thế thoát chiếu | Đúng nước thoát; không báo chiếu giả |
| 5 | Chạy ba loại chu kỳ chiếu | Một bên liên tục: thua; hai bên hoặc không bên: hoà |
| 6 | Kiểm các mốc 119 và 120, và ăn quân giữa chừng | Đúng như bảng trên |
| 7 | Nước chiếu hết đồng thời chạm điều kiện hoà | Chiếu hết |
| 8 | Hai thế cùng vị trí khác bên sắp đi | Không gộp |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý. Độ đúng của toàn bộ bộ sinh nước được kiểm tiếp bằng nguồn độc lập ở thử nghiệm đếm nước (T-53).

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** hàm nước hợp lệ, chiếu, chiếu hết, hết nước cho lặp thế, ký hiệu nước, bàn cờ, máy cờ, xử lý nước đi ở máy chủ; hàm phân xử kết thúc ván cho máy chủ, máy cờ và bộ kiểm thử luật.
**Không thuộc task này:** đồng hồ; đầu hàng, xin hoà, đi lại; các luật "đuổi quân" riêng; kiểm tra mạng.
**Phục vụ (nguồn):** Story 14, 15, 17; tiêu chí AC-BOARD-02-01, AC-PLAY-01-02, AC-PLAY-03-01, AC-PLAY-08-01, AC-PLAY-08-02. Thuộc Epic: Khởi tạo bàn cờ.
**Kết quả (đầu ra):** Nước hợp lệ, chiếu, chiếu hết, hết nước, hai Tướng đối mặt, lặp thế, chiếu liên tục, 120 nửa nước.
**Bằng chứng nộp:** Kết quả bộ thế; bảng thứ tự ưu tiên. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Độ đúng toàn bộ kiểm tiếp ở bài đếm nước độc lập.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-05; liên quan tới (relates to) Story 14, Story 15, Story 17; Epic: Khởi tạo bàn cờ.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **TÌNH 4851_NGUYỄN NGỌC**; Sprint **XIAN Sprint 1**; Fix version **v0.1**; Start date **2026-10-06**; Due date **2026-10-08**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/06-task-e4-khoi-tao-ban-co.md` — T-08.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **TÌNH 4851_NGUYỄN NGỌC**.
* Review/kiểm độc lập dự kiến: **Gia Kỳ**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-4](https://xiangqi-web.atlassian.net/browse/XIAN-4).

**Phải hoàn tất trước:**

* [T-05 — XIAN-39](https://xiangqi-web.atlassian.net/browse/XIAN-39)

**Story phục vụ:**

* [Story 14 — XIAN-22](https://xiangqi-web.atlassian.net/browse/XIAN-22)
* [Story 15 — XIAN-23](https://xiangqi-web.atlassian.net/browse/XIAN-23)
* [Story 17 — XIAN-25](https://xiangqi-web.atlassian.net/browse/XIAN-25)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 10 | TÌNH 4851_NGUYỄN NGỌC |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 2 | TÌNH 4851_NGUYỄN NGỌC |
| Review độc lập | 2 | Gia Kỳ |
| Tổng Original/Remaining Estimate ban đầu | 14 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc có luật nghiệp vụ, xử lý trạng thái, tích hợp hoặc kiểm định chất lượng: dành ca dài hơn và dự phòng sửa lỗi. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-06 17:30 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-08 13:30 |
| Bắt đầu review | 2026-10-08 13:30 |
| Review PASS và bàn giao mục tiêu | 2026-10-08 15:30 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-12 — Giao diện: bàn cờ SVG, quân chữ Hán, lật bàn cho phe Đen

**Jira thực:** [XIAN-46](https://xiangqi-web.atlassian.net/browse/XIAN-46) · **Loại:** Task · **Assignee:** Nguyễn Minh Thư · **Sprint:** XIAN Sprint 1 · **Fix version:** v0.1
**Components:** Frontend · **Priority:** High · **Nhãn:** `P1`, `loi`, `US-BOARD-01`, `xiangqi-mvp-20261005`, `t-12`
**Ước lượng:** 4.5 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-07 · **Due date:** 2026-10-08 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Khởi tạo bàn cờ · **Components:** Frontend
**Phải xong trước:**

* **T-05 — Luật cờ: mô hình bàn cờ, thế khởi đầu, nước đi của từng loại quân**: Gói luật cờ: kiểu quân, toạ độ, thế khởi đầu, nước đi từng loại quân, độc lập với giao diện.
* **T-07 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)**: Ứng dụng web chạy được, có kiểu chữ/màu Kỳ Đài Cổ Phong, các khối nền (nút, ô nhập, hộp thoại, thông báo, chú thích, khung xương) đủ 5 trạng thái và trang kiểm tra nội bộ.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Vẽ **bàn cờ 9 cột × 10 hàng bằng SVG** cùng các quân chữ Hán, **đúng cho cả người cầm Đỏ và Đen**. Thành phần này chỉ **nhận thế cờ để hiển thị**, không tự quyết nước đi hay kết quả.

**Việc cần làm (làm lần lượt)**

1. Vẽ lưới, cung, sông; quân đặt **trên giao điểm** của các đường (không đặt giữa ô); co giãn theo màn hình.
2. Quân dùng **chữ Hán** truyền thống, phe phân biệt không chỉ bằng màu (ví dụ thêm hình viền hoặc chữ khác).
3. **Lật bàn** cho người cầm Đen, nhưng chữ trên quân vẫn thẳng; dữ liệu gốc không đổi.
4. Mỗi quân có **nhãn cho trình đọc màn hình**: tên quân, phe, cột và hàng theo toạ độ gốc.
5. Có đủ 5 trạng thái: đang tải, lỗi, chưa có nước, chỉ đọc, bị khoá (có lý do). Phông chữ Hán tự đặt trong ứng dụng, kiểm quyền sử dụng.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Mở thế khởi đầu | Đúng quân chữ Hán, đúng giao điểm |
| Chuyển Đỏ/Đen | Bàn lật, dữ liệu gốc giữ nguyên |
| Đọc nhãn quân khi bàn lật | Tên quân, phe, cột, hàng gốc đúng |
| Năm trạng thái | Không trắng khi chưa có nước; lỗi và bị khoá có lý do |

**Cách tự kiểm tra**

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Mở thế khởi đầu, đối chiếu từng quân | Đúng quân, chữ Hán, vị trí |
| 2 | Chuyển giữa Đỏ và Đen | Bàn lật, dữ liệu gốc không đổi |
| 3 | Dùng trình đọc màn hình ở bàn lật | Nhãn theo toạ độ gốc |
| 4 | Kích hoạt từng trạng thái | Đủ 5, có lý do khi lỗi hoặc khoá |
| 5 | Thử các độ rộng 360, 390, 1366, 1920 px | Không méo, không cuộn ngang |

**Khi nào chuyển cho người kiểm thử:** cả 5 dòng đạt, kèm ảnh.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** bàn cờ hiển thị được cho chọn quân, kéo thả, ván online, ván với máy.
**Không thuộc task này:** bấm hay kéo quân, nối mạng, giao diện sáng, chữ Latin hoặc chữ Việt trên quân.
**Phục vụ (nguồn):** Story 13; tiêu chí AC-BOARD-01-01, AC-BOARD-01-02, AC-BOARD-01-03. Thuộc Epic: Khởi tạo bàn cờ. Bổ sung tiêu chí AC-UI-04-03.
**Kết quả (đầu ra):** Bàn cờ SVG: lưới, cung, sông, quân chữ Hán, lật bàn cho Đen, nhãn trình đọc màn hình, 5 trạng thái.
**Bằng chứng nộp:** Ảnh chụp bốn cỡ; kiểm nhãn. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Phông chữ Hán.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-05, T-07; liên quan tới (relates to) Story 4, Story 13; Epic: Khởi tạo bàn cờ.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Nguyễn Minh Thư**; Sprint **XIAN Sprint 1**; Fix version **v0.1**; Start date **2026-10-07**; Due date **2026-10-08**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/06-task-e4-khoi-tao-ban-co.md` — T-12.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Nguyễn Minh Thư**.
* Review/kiểm độc lập dự kiến: **4841_Lê Thị Xuân Nhạn**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-4](https://xiangqi-web.atlassian.net/browse/XIAN-4).

**Phải hoàn tất trước:**

* [T-05 — XIAN-39](https://xiangqi-web.atlassian.net/browse/XIAN-39)
* [T-07 — XIAN-41](https://xiangqi-web.atlassian.net/browse/XIAN-41)

**Story phục vụ:**

* [Story 4 — XIAN-12](https://xiangqi-web.atlassian.net/browse/XIAN-12)
* [Story 13 — XIAN-21](https://xiangqi-web.atlassian.net/browse/XIAN-21)

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
| Bắt đầu thực hiện | 2026-10-07 15:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-08 10:00 |
| Bắt đầu review | 2026-10-08 15:00 |
| Review PASS và bàn giao mục tiêu | 2026-10-08 15:30 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-16 — Giao diện: bấm chọn quân và chấm gợi ý ô đi

**Jira thực:** [XIAN-50](https://xiangqi-web.atlassian.net/browse/XIAN-50) · **Loại:** Task · **Assignee:** Nguyễn Minh Thư · **Sprint:** XIAN Sprint 1 · **Fix version:** v0.1
**Components:** Frontend · **Priority:** High · **Nhãn:** `P1`, `loi`, `US-BOARD-01`, `US-BOARD-02`, `xiangqi-mvp-20261005`, `t-16`
**Ước lượng:** 2.5 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-08 · **Due date:** 2026-10-09 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Khởi tạo bàn cờ · **Components:** Frontend
**Phải xong trước:**

* **T-08 — Luật cờ: nước hợp lệ, chiếu, chiếu hết, hết nước, lặp thế, 120 nửa nước**: Nước hợp lệ, chiếu, chiếu hết, hết nước, hai Tướng đối mặt, lặp thế, chiếu liên tục, 120 nửa nước.
* **T-12 — Giao diện: bàn cờ SVG, quân chữ Hán, lật bàn cho phe Đen**: Bàn cờ SVG: lưới, cung, sông, quân chữ Hán, lật bàn cho Đen, nhãn trình đọc màn hình, 5 trạng thái.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Người có quyền đi **bấm hoặc chạm vào quân của mình** thì thấy **các ô có thể đi**, bấm ô đích để đi. Thành phần chỉ **gửi ý định** đi nước; **không coi là xong** cho tới khi máy chủ xác nhận.

**Việc cần làm (làm lần lượt)**

1. Bấm quân mình đang được đi → quân được khoanh; các ô đi hợp lệ hiện **chấm**; ô có quân đối phương ăn được hiện **vòng**.
2. Bấm ô đích → phát ý định đi theo **toạ độ gốc** (kể cả khi bàn đang lật).
3. Bấm lại quân, bấm ô sai hoặc nhấn **Esc** → huỷ chọn.
4. **Không cho chọn** quân đối phương, khi chưa đến lượt, khi là người xem, hoặc khi ván đã kết thúc; chỉ đọc có giải thích.
5. Khi nhận thế cờ mới thì bỏ lựa chọn cũ. Dùng được bằng chuột, chạm và bàn phím.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Chọn quân bị chặn, bị "ghim" (đi sẽ lộ Tướng) | Chỉ hiện ô hợp lệ; vòng ăn cố định |
| Bấm đích, sau đó bấm lại / Esc / ô sai | Gửi đúng ý định hoặc huỷ, không nước ngoài tập hợp lệ |
| Quân đối phương, ngoài lượt, người xem, ván đã kết thúc | Không chọn, không gửi, có lý do |
| Đang cầm Đen và nhận thế mới | Toạ độ gốc đúng; không giữ lựa chọn sai quyền |

**Cách tự kiểm tra**

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Chọn quân bị chặn hoặc bị ghim | Chỉ ô hợp lệ, vòng ăn cố định |
| 2 | Bấm đích; thử bấm lại, Esc, ô sai | Gửi đúng hoặc huỷ |
| 3 | Thử quân đối phương, ngoài lượt, người xem, ván kết thúc | Không chọn; có lý do |
| 4 | Cầm Đen, nhận thế mới | Toạ độ gốc đúng, bỏ chọn cũ |

**Khi nào chuyển cho người kiểm thử:** cả 4 dòng đạt.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Chưa nối máy chủ nên chưa là nước đi thật.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** chọn quân và ý định đi nước cho kéo thả, hiệu ứng và ván online.
**Không thuộc task này:** kéo thả, gợi ý nước hay, nối mạng.
**Phục vụ (nguồn):** Story 13, 14; tiêu chí AC-BOARD-01-02, AC-BOARD-02-01, AC-BOARD-02-02, AC-BOARD-02-03. Thuộc Epic: Khởi tạo bàn cờ.
**Kết quả (đầu ra):** Chọn quân và chấm gợi ý bằng bấm; huỷ chọn; quyền theo lượt.
**Bằng chứng nộp:** Kết quả thử bàn phím và chạm. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Chưa gửi nước thật.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-08, T-12; liên quan tới (relates to) Story 13, Story 14; Epic: Khởi tạo bàn cờ.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Nguyễn Minh Thư**; Sprint **XIAN Sprint 1**; Fix version **v0.1**; Start date **2026-10-08**; Due date **2026-10-09**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/06-task-e4-khoi-tao-ban-co.md` — T-16.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Nguyễn Minh Thư**.
* Review/kiểm độc lập dự kiến: **4841_Lê Thị Xuân Nhạn**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-4](https://xiangqi-web.atlassian.net/browse/XIAN-4).

**Phải hoàn tất trước:**

* [T-08 — XIAN-42](https://xiangqi-web.atlassian.net/browse/XIAN-42)
* [T-12 — XIAN-46](https://xiangqi-web.atlassian.net/browse/XIAN-46)

**Story phục vụ:**

* [Story 13 — XIAN-21](https://xiangqi-web.atlassian.net/browse/XIAN-21)
* [Story 14 — XIAN-22](https://xiangqi-web.atlassian.net/browse/XIAN-22)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 1.5 | Nguyễn Minh Thư |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 0.5 | Nguyễn Minh Thư |
| Review độc lập | 0.5 | 4841_Lê Thị Xuân Nhạn |
| Tổng Original/Remaining Estimate ban đầu | 2.5 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc phạm vi hẹp/cấu hình/giao diện hoặc nối chức năng đã có đầu vào: ca thực hiện ngắn, kiểm và review riêng. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-08 16:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-08 18:00 |
| Bắt đầu review | 2026-10-09 11:00 |
| Review PASS và bàn giao mục tiêu | 2026-10-09 11:30 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-20 — Giao diện: kéo thả quân, đánh dấu nước vừa đi, cảnh báo chiếu, âm thanh

**Jira thực:** [XIAN-54](https://xiangqi-web.atlassian.net/browse/XIAN-54) · **Loại:** Task · **Assignee:** Nguyễn Minh Thư · **Sprint:** XIAN Sprint 2 · **Fix version:** v0.2
**Components:** Frontend · **Priority:** High · **Nhãn:** `P1`, `loi`, `US-BOARD-03`, `US-BOARD-04`, `US-BOARD-05`, `xiangqi-mvp-20261005`, `t-20`
**Ước lượng:** 3.5 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-12 · **Due date:** 2026-10-12 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Khởi tạo bàn cờ · **Components:** Frontend
**Phải xong trước:**

* **T-16 — Giao diện: bấm chọn quân và chấm gợi ý ô đi**: Chọn quân và chấm gợi ý bằng bấm; huỷ chọn; quyền theo lượt.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Thêm cách đi bằng **kéo thả** song song với bấm. Kéo thả cho **cùng kết quả** như bấm; thả sai thì quân **trượt về chỗ cũ**, không đổi thế cờ.

Cho người chơi **thấy** nước vừa đi, **biết** khi bị chiếu và **nghe** âm thanh đúng sự kiện. Các dấu hiệu này chỉ để dễ đọc ván, **không** quyết định kết quả và không che nút bấm.

**Việc cần làm (làm lần lượt)**

1. Dùng chung kiểm tra quyền và danh sách ô đích với cách bấm.
2. Đổi điểm thả trên màn hình thành toạ độ bàn cờ **có tính hướng nhìn và kích thước bàn**.
3. Thả vào ô hợp lệ → phát ý định; thả sai, ngoài bàn, hoặc mất con trỏ → quân trượt về chỗ cũ.
4. Nếu giữa lúc kéo mà mất lượt hoặc mất quyền → **huỷ kéo**, không gửi gì.
5. Tôn trọng cài đặt "giảm chuyển động": quân về ngay, không hiệu ứng.
6. **Đánh dấu nước vừa đi:** bốn góc ở cả ô đi và ô đến, theo nước đã được máy chủ xác nhận.
7. **Cảnh báo chiếu:** viền, chữ hoặc biểu tượng nổi bật, **không nhấp nháy, không rung**, và **không chỉ dùng màu**.
8. **Âm thanh:** bốn âm (đi, ăn, chiếu, kết thúc) tạo bằng Web Audio, không tải tệp âm thanh ngoài.
9. **Nút tắt tiếng**: có nhãn, **nhớ trạng thái trong phiên**; nếu trình duyệt chưa cho phát âm thì xử lý êm, không lỗi.
10. Nhận cùng một thế cờ hai lần thì **không phát lại âm** và không chồng hiệu ứng cũ.
11. Tôn trọng "giảm chuyển động".

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Kéo vào ô hợp lệ / ô sai / ngoài bàn | Phát ý định / về chỗ cũ / về chỗ cũ, không tác động |
| Đi cùng một nước bằng bấm và bằng kéo, ở hai hướng bàn | Cùng toạ độ gốc, cùng kết quả |
| Đang kéo thì mất lượt hoặc quyền | Huỷ kéo, không gửi nước trái quyền |
| Bật "giảm chuyển động" rồi thả sai | Quân về ngay, không hiệu ứng lặp |
| Nhận nước vừa đi mới, rồi nhận lại cùng thế | Đánh dấu đúng ô đi và đến; không chồng hiệu ứng |
| Vào và ra thế chiếu, bật giảm chuyển động | Cảnh báo rõ, không nhấp nháy hay rung |
| Có sự kiện đi, ăn, chiếu, kết thúc | Đúng bốn âm, không có yêu cầu tải tệp |
| Tắt tiếng; đổi trạng thái trong phiên; trình duyệt khoá phát tự động | Tắt tiếng giữ nguyên; ván không lỗi nếu không phát được |

**Cách tự kiểm tra**

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Kéo vào ô hợp lệ, ô sai, ngoài bàn | Phát / về chỗ cũ |
| 2 | Đi cùng nước bằng bấm và bằng kéo, ở bàn Đỏ và bàn lật | Cùng kết quả |
| 3 | Bắt đầu kéo rồi giả lập mất lượt | Huỷ, không gửi |
| 4 | Bật giảm chuyển động, thả sai | Về ngay |
| 5 | Thử bằng chuột và bằng cảm ứng trên điện thoại | Đạt cả hai |
| 6 | Nhận nước mới rồi nhận lại cùng thế | Đánh dấu đúng; không chồng |
| 7 | Vào/ra thế chiếu; bật giảm chuyển động | Cảnh báo rõ, không nhấp nháy |
| 8 | Phát bốn sự kiện | Đúng bốn âm; không tải tệp âm thanh |
| 9 | Tắt tiếng rồi đổi trạng thái; chặn phát tự động | Tắt tiếng giữ; không lỗi |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt; kèm nghe thử thủ công.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** kéo thả cho giao diện ván và giao diện ván với máy; hiệu ứng và âm thanh cho giao diện ván và ván với máy.
**Không thuộc task này:** bỏ cách bấm; nối mạng; nhạc nền; tệp âm thanh tải ngoài; gợi ý nước hay.
**Phục vụ (nguồn):** Story 14; tiêu chí AC-BOARD-03-01, AC-BOARD-03-02, AC-BOARD-04-01, AC-BOARD-04-02, AC-BOARD-04-03, AC-BOARD-05-01, AC-BOARD-05-02. Thuộc Epic: Khởi tạo bàn cờ.
**Kết quả (đầu ra):** Kéo thả, dấu nước vừa đi, cảnh báo chiếu, 4 âm Web Audio, nút tắt tiếng.
**Bằng chứng nộp:** Kết quả thử; nghe thử thủ công; giảm chuyển động. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Trình duyệt có thể chặn phát âm tự động.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-16; liên quan tới (relates to) Story 14; Epic: Khởi tạo bàn cờ.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Nguyễn Minh Thư**; Sprint **XIAN Sprint 2**; Fix version **v0.2**; Start date **2026-10-12**; Due date **2026-10-12**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/06-task-e4-khoi-tao-ban-co.md` — T-20.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Nguyễn Minh Thư**.
* Review/kiểm độc lập dự kiến: **4841_Lê Thị Xuân Nhạn**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-4](https://xiangqi-web.atlassian.net/browse/XIAN-4).

**Phải hoàn tất trước:**

* [T-16 — XIAN-50](https://xiangqi-web.atlassian.net/browse/XIAN-50)

**Story phục vụ:**

* [Story 14 — XIAN-22](https://xiangqi-web.atlassian.net/browse/XIAN-22)

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
| Bắt đầu thực hiện | 2026-10-12 09:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-12 12:00 |
| Bắt đầu review | 2026-10-12 17:30 |
| Review PASS và bàn giao mục tiêu | 2026-10-12 18:00 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-53 — Kiểm thử luật cờ: đếm nước đi độc lập và bộ kiểm thử chạy tự động

**Jira thực:** [XIAN-87](https://xiangqi-web.atlassian.net/browse/XIAN-87) · **Loại:** Task · **Assignee:** Tưởng Lê khoa Cường-4572 · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** Game Engine, QA & DevOps · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `QA`, `gate`, `US-PLAY-03`, `US-PLAY-08`, `xiangqi-mvp-20261005`, `t-53`
**Ước lượng:** 12 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-28 · **Due date:** 2026-10-29 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Khởi tạo bàn cờ · **Components:** Game Engine, QA & DevOps
**Phải xong trước:**

* **T-01 — Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động**: Kho mã cài đặt sạch được; có lệnh biên dịch, kiểm tra cách viết mã, chạy bài kiểm tra; hệ thống kiểm tra tự động báo xanh/đỏ đúng trên mọi nhánh.
* **T-08 — Luật cờ: nước hợp lệ, chiếu, chiếu hết, hết nước, lặp thế, 120 nửa nước**: Nước hợp lệ, chiếu, chiếu hết, hết nước, hai Tướng đối mặt, lặp thế, chiếu liên tục, 120 nửa nước.
* **T-47 — Bảng nước đi: ký hiệu tiếng Việt và hiển thị**: Bảng nước đi ký hiệu tiếng Việt, tự cuộn, không trùng dòng khi nối lại.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Phát hiện sớm nếu bộ luật cờ **đếm sai số nước đi**. Cách làm: đếm số nước đi có thể xảy ra từ thế khởi đầu ở các độ sâu 1, 2, 3, 4 (gọi là "perft"), rồi so với kết quả của **một công cụ độc lập**, không phải chính mã của chúng ta. Nếu tự lấy kết quả từ mã đang kiểm thì lỗi sẽ tự "xác nhận" chính nó.

Gom toàn bộ kiểm thử luật cờ thành một bộ chạy **tự động mỗi khi mã thay đổi**, để nếu ai sửa luật sai thì biết ngay. Kết quả kiểm luật phải **tách bạch** với chuyện máy cờ mạnh hay mạng chạy tốt.

**Việc cần làm (làm lần lượt)**

1. Chọn **một nguồn tham chiếu độc lập** (một bộ sinh nước đi do bên ngoài viết), ghi tên, phiên bản và quyền sử dụng.
2. Đặt cùng thế khởi đầu và cùng quy ước đếm cho cả hai bên.
3. Đếm ở độ sâu 1 đến 4. Số tham chiếu cần đối chiếu: **44, 1.920, 79.666, 3.290.240**; ghi số thật của hai bên.
4. Nếu có chênh lệch: tìm **nước đầu tiên** làm hai bên khác nhau; kết luận lỗi nằm ở nguồn tham chiếu, ở mã của chúng ta hay chưa rõ.
5. Viết báo cáo, ghi rõ nếu chưa có nguồn độc lập đáng tin thì kết luận là **chưa kết luận**.
6. Gom các thế mẫu và ca biên đã viết ở các task luật, ghi rõ lấy đáp án từ đâu.
7. Nối nguồn đối chiếu độc lập (thử nghiệm đếm nước đi nói ở trên) vào bài **đếm nước đi**: từ thế khởi đầu, số nước ở độ sâu 1, 2, 3, 4 phải là **44, 1.920, 79.666, 3.290.240**.
8. Thêm bài thử ký hiệu ở cả hai phe (kiểm tính duy nhất).
9. Chạy **1.000 ván ngẫu nhiên** (hạt giống cố định) kiểm không có nước nào vi phạm luật, lưu số liệu thật.
10. Đưa toàn bộ vào kiểm tra tự động (T-01); **cố tình làm sai một đáp án** để chắc hệ thống báo đỏ.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Dùng thế khác hoặc bên đi khác | Nhận ra là đầu vào khác, **không** so sánh như cùng nguồn |
| Cố ý làm một lỗi cản chân trong bản thử | Phát hiện ra chênh lệch; **không** sửa số mong đợi cho khớp |
| Nguồn tham chiếu chưa kiểm chứng được | Ghi "chưa kết luận" |
| Đếm nước độ sâu 1 đến 4 | Khớp nguồn đối chiếu; không sửa đáp án chỉ để cho đạt |
| Bên đến lượt bị chiếu hết, hoặc hết nước đi hợp lệ | Cả hai trường hợp bên đó đều thua |
| Lặp thế, mốc 119/120, ăn quân | Đúng như quy tắc |
| 1.000 ván ngẫu nhiên | Không nước vi phạm; số liệu thật được lưu |
| Ký hiệu cả hai phe; cố tình làm sai | Ký hiệu khớp; làm sai thì kiểm tra tự động **đỏ** |

**Cách tự kiểm tra**

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Chạy độ sâu 1 đến 4 trên cả hai bên | Có 4 cặp số, đối chiếu với 44, 1.920, 79.666, 3.290.240 |
| 2 | Dùng thế hoặc bên đi khác | Báo "khác đầu vào" |
| 3 | Cho lỗi cản chân vào bản thử | Báo chênh lệch tại nước cụ thể |
| 4 | Xem báo cáo | Có tên, phiên bản nguồn tham chiếu và cách chạy lại |
| 5 | Chạy đếm nước độ sâu 1–4 | 44, 1.920, 79.666, 3.290.240, khớp nguồn đối chiếu |
| 6 | Chạy thế chiếu hết, hết nước, lặp, biên 119/120 | Đúng quy tắc |
| 7 | Chạy 1.000 ván ngẫu nhiên | Không vi phạm; có số liệu |
| 8 | Chạy ký hiệu trong kiểm tra tự động; cố làm sai một đáp án | Đạt; rồi đỏ khi sai |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt; báo cáo đủ, chạy lại được.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý. Báo cáo hoàn tất. "Cổng kiểm chứng luật cờ đạt" chỉ khi nguồn độc lập đã xác minh **và** số liệu đối chiếu đạt. Nếu nguồn đối chiếu chưa được xác minh thì **không** được ghi đạt. Ghi "chưa chạy".

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** bộ số đã xác minh để đưa vào bộ kiểm tra luật cờ; bộ kiểm thử luật cho đo máy cờ đầy đủ và nghiệm thu cuối.
**Không thuộc task này:** đo sức mạnh máy cờ; biến công cụ ngoài thành máy cờ của sản phẩm; kiểm thử giao diện; đi lại; các luật P2.
**Phục vụ (nguồn):** Story 13, 17; tiêu chí AC-PLAY-03-01, AC-PLAY-08-01, AC-PLAY-08-02; GATE-PERFT. Thuộc Epic: Khởi tạo bàn cờ.
**Kết quả (đầu ra):** Bộ kiểm thử luật chạy tự động: đếm nước đi độc lập (44, 1.920, 79.666, 3.290.240), thế mẫu, 1.000 ván ngẫu nhiên, ký hiệu; báo cáo GATE-PERFT.
**Bằng chứng nộp:** Báo cáo so với nguồn đối chiếu; số liệu 1.000 ván; lần chạy tự động. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Nếu nguồn đối chiếu chưa xác minh thì không ghi đạt.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-01, T-08, T-47; liên quan tới (relates to) Story 13, Story 17; Epic: Khởi tạo bàn cờ.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Tưởng Lê khoa Cường-4572**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-10-28**; Due date **2026-10-29**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/06-task-e4-khoi-tao-ban-co.md` — T-53.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Tưởng Lê khoa Cường-4572**.
* Review/kiểm độc lập dự kiến: **TÌNH 4851_NGUYỄN NGỌC**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Epic: [XIAN-4](https://xiangqi-web.atlassian.net/browse/XIAN-4).

**Phải hoàn tất trước:**

* [T-01 — XIAN-35](https://xiangqi-web.atlassian.net/browse/XIAN-35)
* [T-08 — XIAN-42](https://xiangqi-web.atlassian.net/browse/XIAN-42)
* [T-47 — XIAN-81](https://xiangqi-web.atlassian.net/browse/XIAN-81)

**Story phục vụ:**

* [Story 13 — XIAN-21](https://xiangqi-web.atlassian.net/browse/XIAN-21)
* [Story 17 — XIAN-25](https://xiangqi-web.atlassian.net/browse/XIAN-25)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 8 | Tưởng Lê khoa Cường-4572 |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 2 | Tưởng Lê khoa Cường-4572 |
| Review độc lập | 2 | TÌNH 4851_NGUYỄN NGỌC |
| Tổng Original/Remaining Estimate ban đầu | 12 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc có luật nghiệp vụ, xử lý trạng thái, tích hợp hoặc kiểm định chất lượng: dành ca dài hơn và dự phòng sửa lỗi. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-28 09:30 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-29 11:30 |
| Bắt đầu review | 2026-10-29 11:30 |
| Review PASS và bàn giao mục tiêu | 2026-10-29 14:30 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---
