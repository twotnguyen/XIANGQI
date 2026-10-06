# Task chung của dự án (6 task)

**Ngày cập nhật:** 2026-10-05 · **Trạng thái:** đã được PO cho phép tạo và phân công ngày 05/10/2026 · Đã tạo Epic/Story/Task trên XIAN · Viết theo `00-chuan-description.md` và mẫu `00b`.

Mã task `T-01` đến `T-64` đánh theo **thứ tự làm** (số nhỏ làm trước, mỗi task chỉ cần các task có số nhỏ hơn). Một số task gộp nhiều việc nhỏ cùng mục đích thành một task. Ngày Sprint: 1 = 04/10–07/10, 2 = 08/10–10/10, 3 = 11/10–14/10, 4 = 15/10–17/10.

Các task này phục vụ cả dự án nên không thuộc Epic nào; trên Jira gắn nhãn `chung`.

---

### T-34 — Nghiệm thu bản chơi được: đăng ký, tạo phòng, mời, đánh online và đánh với máy chạy trọn

**Jira thực:** [XIAN-68](https://xiangqi-web.atlassian.net/browse/XIAN-68) · **Loại:** Task · **Assignee:** Gia Kỳ · **Sprint:** XIAN Sprint 2 · **Fix version:** v0.2
**Components:** QA & DevOps · **Priority:** High · **Nhãn:** `P1`, `QA`, `chung`, `loi`, `gate`, `xiangqi-mvp-20261005`, `t-34`
**Ước lượng:** 8.5 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-18 · **Due date:** 2026-10-19 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Không có — công việc chung của dự án · **Components:** QA & DevOps
**Phải xong trước:**

* **T-25 — Nối web với máy chủ: đăng ký, đăng nhập, hồ sơ**: Đăng ký, đăng nhập, hồ sơ, đăng xuất chạy trọn trên môi trường thử với email thật. Luồng Google chạy trọn.
* **T-28 — Nối web với máy chủ: tạo phòng, vào phòng, ghế, Sẵn sàng, bắt đầu ván**: Hai người tạo phòng, vào phòng, ngồi ghế, Sẵn sàng và bắt đầu ván trên hai trình duyệt thật.
* **T-32 — Nối web với máy chủ: bắt đầu ván đầy đủ, đồng hồ, kết thúc ván, đầu hàng, xin hoà**: Bắt đầu ván, đồng hồ, kết thúc ván, đầu hàng và xin hoà chạy trọn trên web và máy chủ thật.
* **T-33 — Nối web, máy chủ và máy cờ thật: ván với máy**: Ván với máy chạy thật qua web, máy chủ và máy cờ thật: ba cấp, ba phe, vào lại, sự cố.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Chốt mốc **bản chơi được** vào cuối Sprint 2: kiểm bằng người thật trên bản chạy thật rằng **bốn việc cốt lõi** chạy trọn từ đầu đến cuối, trước khi nhóm mở rộng sang người xem, khoá phòng, chat, camera/micro, bạn bè và hoàn thiện. Không đạt thì ghi rõ chỗ nào chưa đạt để quyết định **dừng mở rộng, sửa bản chơi được trước**.

**Việc cần làm (làm lần lượt)**

1. Tự chuẩn bị tài khoản mới và dữ liệu thử trên dịch vụ thật, ghi cách tạo và đặt lại, che bí mật.
2. **Kịch bản M1 – Tài khoản:** đăng ký ba bước bằng mã OTP thật tới email thật và vào Sảnh; đăng xuất rồi đăng nhập lại (có và không "Ghi nhớ"); đăng ký và đăng nhập bằng Google bằng tài khoản Google thử.
3. **Kịch bản M2 – Phòng và mời:** người A tạo phòng; người B vào bằng **mã phòng** và bằng **đường dẫn**; hai người ngồi hai ghế, cùng Sẵn sàng; hai màn hình cùng vào màn ván.
4. **Kịch bản M3 – Đánh online:** hai người đi luân phiên đến khi **kết thúc ván** (chiếu hết, hoặc đầu hàng, hoặc hết giờ); thử một nước sai để xem bị từ chối và quân về chỗ cũ; hai trình duyệt luôn cùng một thế cờ và cùng kết quả; người cầm Đen thấy bàn lật.
5. **Kịch bản M4 – Đánh với máy:** người chơi chọn cấp Dễ, Trung bình, Khó và phe, đánh hết ván với máy ở từng cấp; máy luôn đi nước hợp lệ; rời ván giải phóng chỗ chơi.
6. Ghi **danh sách việc còn thiếu của bản chơi được** (nếu có) kèm người nhận; lỗi mức Cao hoặc Nghiêm trọng phải sửa **trước khi** làm tiếp phần mở rộng.
7. Ghi kết luận: **bản chơi được đạt / chưa đạt**, ngày giờ và bản dựng.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Một trong bốn kịch bản M1–M4 không chạy trọn | Ghi "bản chơi được chưa đạt", nêu rõ bước hỏng và người nhận; chưa mở rộng cho tới khi sửa |
| Chỉ chạy được bằng dữ liệu giả hoặc môi trường khác bản chạy thật | Không tính là đạt; chạy lại trên bản chạy thật |
| Lỗi mức Cao hoặc Nghiêm trọng còn mở | bản chơi được chưa đạt cho tới khi sửa |
| Tính năng mở rộng (chat, camera, người xem, bạn bè) chưa làm | Không ảnh hưởng kết luận bản chơi được; các lối vào chưa làm hiện mờ "Sắp ra mắt" |

**Cách tự kiểm tra**
Chuẩn bị: bản dựng tích hợp, hai trình duyệt (hoặc hai thiết bị), email thật để nhận OTP, tài khoản Google thử.

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Chạy M1 (đăng ký OTP, đăng nhập, Google) | Vào Sảnh; đăng nhập lại được |
| 2 | Chạy M2 (tạo phòng, vào bằng mã và đường dẫn, hai ghế, Sẵn sàng) | Cả hai vào màn ván |
| 3 | Chạy M3 (đánh đến kết thúc; một nước sai) | Cùng thế cờ và kết quả; nước sai bị từ chối |
| 4 | Chạy M4 (ba cấp máy) | Đánh hết ván; nước hợp lệ; giải phóng chỗ chơi |
| 5 | Xem danh sách lỗi và việc thiếu | Có người nhận; không còn lỗi Cao hoặc Nghiêm trọng |

**Khi nào chuyển cho người kiểm thử:** bốn kịch bản M1–M4 đã chạy, có bằng chứng (video hoặc ảnh) và trạng thái trung thực.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý với báo cáo; kết luận bản chơi được đạt hoặc chưa đạt kèm lý do. Nhóm chỉ chuyển sang phần mở rộng sau khi bản chơi được đạt (hoặc PO đồng ý chuyển với danh sách việc thiếu rõ ràng).

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** bản chơi được và danh sách lỗi cho nghiệm thu đầy đủ ở P2.
**Không thuộc task này:** nghiệm thu toàn bộ tiêu chí; tính năng mở rộng (người xem, khoá phòng, chat, camera/micro, bạn bè); bài tải; đo độ khó máy cờ đầy đủ.
**Phục vụ (nguồn):** mốc bản chơi được của kế hoạch; kịch bản demo D1, D2, D5, D8 (phần lõi). Task chung, không thuộc Epic nào.
**Kết quả (đầu ra):** Báo cáo nghiệm thu bản chơi được với kết luận đạt hoặc chưa đạt; danh sách việc còn thiếu.
**Bằng chứng nộp:** Video hoặc ảnh bốn kịch bản M1–M4; báo cáo kết luận. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Mốc bản chơi được dồn nhiều việc vào hai Sprint đầu; nếu sức chứa không đủ khi ước lượng giờ, phải báo PO sớm để điều chỉnh lịch/cách chia việc; không tự bỏ Google, AI hoặc phần P1 khác khỏi MVP.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-25, T-28, T-32, T-33; không thuộc Epic (nhãn chung).

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Gia Kỳ**; Sprint **XIAN Sprint 2**; Fix version **v0.2**; Start date **2026-10-18**; Due date **2026-10-19**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/11-task-chung.md` — T-34.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Gia Kỳ**.
* Review/kiểm độc lập dự kiến: **Võ Thành Đông**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Công việc chung, không có Parent Epic.

**Phải hoàn tất trước:**

* [T-25 — XIAN-59](https://xiangqi-web.atlassian.net/browse/XIAN-59)
* [T-28 — XIAN-62](https://xiangqi-web.atlassian.net/browse/XIAN-62)
* [T-32 — XIAN-66](https://xiangqi-web.atlassian.net/browse/XIAN-66)
* [T-33 — XIAN-67](https://xiangqi-web.atlassian.net/browse/XIAN-67)

**Story phục vụ:**

* Công việc nền tảng/kiểm chung theo phạm vi mô tả.

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 6 | Gia Kỳ |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 1.5 | Gia Kỳ |
| Review độc lập | 1 | Võ Thành Đông |
| Tổng Original/Remaining Estimate ban đầu | 8.5 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc có luật nghiệp vụ, xử lý trạng thái, tích hợp hoặc kiểm định chất lượng: dành ca dài hơn và dự phòng sửa lỗi. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-18 17:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-19 16:30 |
| Bắt đầu review | 2026-10-19 16:30 |
| Review PASS và bàn giao mục tiêu | 2026-10-19 17:30 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-37 — Dựng khung kiểm thử tự động trên nhiều trình duyệt (Playwright)

**Jira thực:** [XIAN-71](https://xiangqi-web.atlassian.net/browse/XIAN-71) · **Loại:** Task · **Assignee:** Gia Kỳ · **Sprint:** XIAN Sprint 3 · **Fix version:** v0.3
**Components:** QA & DevOps · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `QA`, `chung`, `xiangqi-mvp-20261005`, `t-37`
**Ước lượng:** 3 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-21 · **Due date:** 2026-10-22 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Không có — công việc chung của dự án · **Components:** QA & DevOps
**Phải xong trước:**

* **T-01 — Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động**: Kho mã cài đặt sạch được; có lệnh biên dịch, kiểm tra cách viết mã, chạy bài kiểm tra; hệ thống kiểm tra tự động báo xanh/đỏ đúng trên mọi nhánh.
* **T-07 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)**: Ứng dụng web chạy được, có kiểu chữ/màu Kỳ Đài Cổ Phong, các khối nền (nút, ô nhập, hộp thoại, thông báo, chú thích, khung xương) đủ 5 trạng thái và trang kiểm tra nội bộ.
* **T-34 — Nghiệm thu bản chơi được: đăng ký, tạo phòng, mời, đánh online và đánh với máy chạy trọn**: Bản chơi được đã PASS M1–M4 trên bản chạy thật; báo cáo hoàn tất nhưng chưa đạt không mở phần làm sau, trừ PO cho phép rõ ràng.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Dựng **khung kiểm thử giả lập người dùng thật** trên nhiều trình duyệt, mỗi "người dùng" tách biệt nhau (như trên hai máy khác nhau), để các task sau có chỗ chạy kịch bản nhiều người và thu bằng chứng (video, vết thao tác).

**Việc cần làm (làm lần lượt)**

1. Cài và cấu hình công cụ kiểm thử trình duyệt; mỗi người dùng một **phiên tách biệt** (không dùng chung cookie hay dữ liệu lưu).
2. Dùng các giá trị cấu hình **không phải bí mật**.
3. Viết các hàm hỗ trợ: **chuẩn bị và dọn dữ liệu**, chờ theo sự kiện (không chờ giờ tuỳ tiện).
4. Một **bài thử khói** chạy trên trang web ở T-07 để chứng minh khung hoạt động.
5. Nối báo cáo và vết thao tác vào hệ thống kiểm tra tự động; **tách riêng lỗi của ứng dụng và lỗi của môi trường**.
6. **Không** dùng giả lập mã OTP hay camera/micro làm bằng chứng thật; chưa có tài khoản hay phòng thật ở bước này.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Hai phiên cùng lưu một dấu riêng trong cookie và bộ nhớ trình duyệt | Không lẫn dữ liệu (đây chưa phải bằng chứng đăng nhập thật) |
| Bài thử cố ý sai kết quả mong đợi | Báo **không đạt** kèm bước và vết thao tác, không che lỗi |
| Chạy, dọn dữ liệu, chạy lại | Không phụ thuộc dữ liệu còn sót |
| Kiểm báo cáo và vết thao tác trước khi lưu | Không lộ chìa khoá, mật khẩu |

**Cách tự kiểm tra**

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Hai phiên đặt dấu riêng trên trang web thử | Không dùng lẫn |
| 2 | Chạy bài thử cố ý sai | Báo không đạt, có vết |
| 3 | Chạy, dọn, chạy lại | Đạt cả hai lần |
| 4 | Xem báo cáo trước khi lưu | Không có bí mật |

**Khi nào chuyển cho người kiểm thử:** cả 4 dòng đạt; bài thử khói chạy trong kiểm tra tự động.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Không cần đăng nhập thật hay phòng thật để đạt. Chuẩn bị dữ liệu thật cho từng luồng do các task tích hợp và task nghiệm thu (T-62) tự làm.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** khung kiểm thử nhiều trình duyệt cho tích hợp và nghiệm thu.
**Không thuộc task này:** kiểm thử luồng nghiệp vụ, công cụ giả lập mạng trong sản phẩm.
**Phục vụ (nguồn):** NFR-03. Task chung, không thuộc Epic nào.
**Kết quả (đầu ra):** Khung kiểm thử nhiều trình duyệt tách biệt (Playwright), bài thử khói, báo cáo và vết thao tác.
**Bằng chứng nộp:** Lần chạy tự động; báo cáo. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Không dùng giả lập làm bằng chứng đăng nhập thật.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-01, T-07, T-34; không thuộc Epic (nhãn chung).

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Gia Kỳ**; Sprint **XIAN Sprint 3**; Fix version **v0.3**; Start date **2026-10-21**; Due date **2026-10-22**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/11-task-chung.md` — T-37.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Gia Kỳ**.
* Review/kiểm độc lập dự kiến: **TÌNH 4851_NGUYỄN NGỌC**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Công việc chung, không có Parent Epic.

**Phải hoàn tất trước:**

* [T-01 — XIAN-35](https://xiangqi-web.atlassian.net/browse/XIAN-35)
* [T-07 — XIAN-41](https://xiangqi-web.atlassian.net/browse/XIAN-41)
* [T-34 — XIAN-68](https://xiangqi-web.atlassian.net/browse/XIAN-68)

**Story phục vụ:**

* Công việc nền tảng/kiểm chung theo phạm vi mô tả.

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 2 | Gia Kỳ |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 0.5 | Gia Kỳ |
| Review độc lập | 0.5 | TÌNH 4851_NGUYỄN NGỌC |
| Tổng Original/Remaining Estimate ban đầu | 3 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc phạm vi hẹp/cấu hình/giao diện hoặc nối chức năng đã có đầu vào: ca thực hiện ngắn, kiểm và review riêng. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-21 14:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-21 16:30 |
| Bắt đầu review | 2026-10-22 15:30 |
| Review PASS và bàn giao mục tiêu | 2026-10-22 16:00 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-38 — Dựng môi trường demo: chạy cục bộ trước, Render làm dự phòng

**Jira thực:** [XIAN-72](https://xiangqi-web.atlassian.net/browse/XIAN-72) · **Loại:** Task · **Assignee:** Gia Kỳ · **Sprint:** XIAN Sprint 3 · **Fix version:** v0.3
**Components:** QA & DevOps · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `chung`, `xiangqi-mvp-20261005`, `t-38`
**Ước lượng:** 3 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-10-22 · **Due date:** 2026-10-24 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Không có — công việc chung của dự án · **Components:** QA & DevOps
**Phải xong trước:**

* **T-01 — Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động**: Kho mã cài đặt sạch được; có lệnh biên dịch, kiểm tra cách viết mã, chạy bài kiểm tra; hệ thống kiểm tra tự động báo xanh/đỏ đúng trên mọi nhánh.
* **T-06 — Dựng khung máy chủ: nhận kết nối có xác thực và chuyển lệnh**: Máy chủ chạy, nhận kết nối có xác thực, chuyển lệnh theo hợp đồng, có chỗ cắm chốt quyền, hạn phiên, giới hạn tốc độ; mặc định đóng (không có quyền thì không nhận).
* **T-07 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)**: Ứng dụng web chạy được, có kiểu chữ/màu Kỳ Đài Cổ Phong, các khối nền (nút, ô nhập, hộp thoại, thông báo, chú thích, khung xương) đủ 5 trạng thái và trang kiểm tra nội bộ.
* **T-34 — Nghiệm thu bản chơi được: đăng ký, tạo phòng, mời, đánh online và đánh với máy chạy trọn**: Bản chơi được đã PASS M1–M4 trên bản chạy thật; báo cáo hoàn tất nhưng chưa đạt không mở phần làm sau, trừ PO cho phép rõ ràng.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

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
| --- | --- |
| Làm theo hướng dẫn trên máy sạch | Web và máy chủ chạy, mở được |
| Thử kết nối tới máy chủ trên môi trường demo bằng thông tin đăng nhập sai | Bị chặn như bình thường (môi trường demo không bỏ kiểm tra) |
| Tải lại trang hoặc khởi động lại máy chủ | Trang không mất; có thông báo lỗi, không dữ liệu giả |
| Tìm khoá bí mật trong mã web, kho mã và nhật ký vận hành | Không thấy khoá nào |
| Mất mạng ra ngoài (Supabase, LiveKit) | Báo lỗi thật, không giả vờ chạy được |

**Cách tự kiểm tra**

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Một người khác làm theo hướng dẫn trên máy khác | Chạy được trong thời gian hợp lý |
| 2 | Mở web ở hai trình duyệt, kết nối với thông tin đăng nhập sai | Bị chặn như môi trường thật |
| 3 | Đăng nhập thật và bật thử camera/micro | Nối được Supabase và LiveKit |
| 4 | Tải lại trang; khởi động lại máy chủ | Không mất trang; có báo lỗi |
| 5 | Quét kho mã và nhật ký tìm khoá bí mật | Không có |

**Khi nào chuyển cho người kiểm thử:** cả 5 dòng đạt, có hướng dẫn chạy cục bộ.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý; hướng dẫn người khác làm theo được. **Chưa** nghiệm thu toàn bộ P1 (MVP).

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** hướng dẫn chạy demo cục bộ và các bước dự phòng trên Render, cho chuẩn bị demo.
**Không thuộc task này:** triển khai thật lên Render hay mua gói trả phí khi chưa được PO đồng ý, tự dựng máy chủ camera, các tính năng sản phẩm.
**Phục vụ (nguồn):** kịch bản demo D1–D10 (nơi chạy). Task chung, không thuộc Epic nào.
**Kết quả (đầu ra):** Hướng dẫn và lệnh chạy demo cục bộ; các bước dự phòng trên Render.
**Bằng chứng nộp:** Một người khác làm theo hướng dẫn thành công. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Nếu cần địa chỉ trên mạng thì mới dùng Render và cần PO đồng ý chi phí.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-01, T-06, T-07, T-34; không thuộc Epic (nhãn chung).

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Gia Kỳ**; Sprint **XIAN Sprint 3**; Fix version **v0.3**; Start date **2026-10-22**; Due date **2026-10-24**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/11-task-chung.md` — T-38.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Gia Kỳ**.
* Review/kiểm độc lập dự kiến: **TÌNH 4851_NGUYỄN NGỌC**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Công việc chung, không có Parent Epic.

**Phải hoàn tất trước:**

* [T-01 — XIAN-35](https://xiangqi-web.atlassian.net/browse/XIAN-35)
* [T-06 — XIAN-40](https://xiangqi-web.atlassian.net/browse/XIAN-40)
* [T-07 — XIAN-41](https://xiangqi-web.atlassian.net/browse/XIAN-41)
* [T-34 — XIAN-68](https://xiangqi-web.atlassian.net/browse/XIAN-68)

**Story phục vụ:**

* Công việc nền tảng/kiểm chung theo phạm vi mô tả.

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 2 | Gia Kỳ |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 0.5 | Gia Kỳ |
| Review độc lập | 0.5 | TÌNH 4851_NGUYỄN NGỌC |
| Tổng Original/Remaining Estimate ban đầu | 3 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc phạm vi hẹp/cấu hình/giao diện hoặc nối chức năng đã có đầu vào: ca thực hiện ngắn, kiểm và review riêng. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-10-22 16:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-10-23 09:30 |
| Bắt đầu review | 2026-10-24 11:00 |
| Review PASS và bàn giao mục tiêu | 2026-10-24 11:30 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-62 — Nghiệm thu từng tiêu chí P1 (MVP) và chạy kịch bản demo D1–D10

**Jira thực:** [XIAN-96](https://xiangqi-web.atlassian.net/browse/XIAN-96) · **Loại:** Task · **Assignee:** Gia Kỳ · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** QA & DevOps · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `QA`, `chung`, `US-ROOM-11`, `xiangqi-mvp-20261005`, `t-62`
**Ước lượng:** 14 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-11-01 · **Due date:** 2026-11-02 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Không có — công việc chung của dự án · **Components:** QA & DevOps
**Phải xong trước:**

* **T-22 — Thử nghiệm OTP thật và đăng nhập Google; chặn người chưa hoàn tất đăng ký và chặn đổi email**: Báo cáo thử nghiệm OTP thật: gửi thư, hết hạn, giới hạn nhập sai, dọn tài khoản dở, chặn đổi email trực tiếp; kết luận đạt / không đạt / chưa kết luận; chốt chặn người chưa hoàn tất. Có thêm kết luận GATE-GOOGLE kèm bằng chứng. Có chốt API/Socket từ chối OTP email trực tiếp của tài khoản hoàn tất, kèm bằng chứng dịch vụ thật.
* **T-25 — Nối web với máy chủ: đăng ký, đăng nhập, hồ sơ**: Đăng ký, đăng nhập, hồ sơ, đăng xuất chạy trọn trên môi trường thử với email thật. Luồng Google chạy trọn.
* **T-32 — Nối web với máy chủ: bắt đầu ván đầy đủ, đồng hồ, kết thúc ván, đầu hàng, xin hoà**: Bắt đầu ván, đồng hồ, kết thúc ván, đầu hàng và xin hoà chạy trọn trên web và máy chủ thật.
* **T-33 — Nối web, máy chủ và máy cờ thật: ván với máy**: Ván với máy chạy thật qua web, máy chủ và máy cờ thật: ba cấp, ba phe, vào lại, sự cố.
* **T-34 — Nghiệm thu bản chơi được: đăng ký, tạo phòng, mời, đánh online và đánh với máy chạy trọn**: Bản chơi được đã PASS M1–M4 trên bản chạy thật; báo cáo hoàn tất nhưng chưa đạt không mở phần làm sau, trừ PO cho phép rõ ràng.
* **T-37 — Dựng khung kiểm thử tự động trên nhiều trình duyệt (Playwright)**: Khung kiểm thử nhiều trình duyệt tách biệt (Playwright), bài thử khói, báo cáo và vết thao tác.
* **T-42 — Máy chủ: tác vụ định kỳ dọn và phục hồi tài khoản đăng ký dở**: Tác vụ định kỳ dọn và phục hồi tài khoản đăng ký dở (mỗi 5 phút), không xoá nhầm tài khoản hoàn tất. Gồm dọn Google mới chưa hoàn tất sau 60 phút, quét 5 phút, không xoá tài khoản cũ/hoàn tất.
* **T-46 — Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời**: Điều khiển phòng nâng cao chạy thật trên web và máy chủ: đổi chỗ, khoá, danh sách, đuổi, chủ phòng rời.
* **T-52 — Nối web với máy chủ: bạn bè**: Toàn bộ luồng bạn bè và mời vào phòng chạy thật; trạng thái Đang đấu kiểm bằng ván với máy thật.
* **T-53 — Kiểm thử luật cờ: đếm nước đi độc lập và bộ kiểm thử chạy tự động**: Bộ kiểm thử luật chạy tự động: đếm nước đi độc lập (44, 1.920, 79.666, 3.290.240), thế mẫu, 1.000 ván ngẫu nhiên, ký hiệu; báo cáo GATE-PERFT.
* **T-54 — Nối web với máy chủ: bấm đường dẫn mời, đăng nhập rồi vào đúng phòng**: Bấm đường dẫn mời khi chưa đăng nhập, đăng nhập hoặc đăng ký xong thì vào đúng phòng; ưu tiên luật phiên/vị trí trước link mời; khác thiết bị về Sảnh sau xử thua; chặn chuyển hướng ra ngoài.
* **T-55 — Đăng xuất giữa ván: xác nhận, đầu hàng, rời phòng rồi đăng xuất**: Đăng xuất giữa ván: xác nhận, đầu hàng, rời phòng rồi đăng xuất; ván với máy cũng đầu hàng, người chơi thua và huỷ tìm nước.
* **T-56 — Giao diện chat hai kênh và nối web với máy chủ**: Khung chat hai kênh và nối thật với máy chủ; ba trạng thái tin; công tắc Kênh Chung. Desktop mở Riêng mặc định, có thể mở đồng thời Chung hoặc đóng bớt; mobile hai tab mặc định Riêng.
* **T-57 — Nối web với máy chủ: mất kết nối, người xem, bảng nước đi, phòng khoá**: Mất kết nối, kết nối lại, người xem, bảng nước đi, phòng khoá chạy trọn trên web và máy chủ thật. Gồm hết phiên và đăng nhập lại cùng thiết bị, đăng nhập khác thiết bị giữa online/AI trên bản chạy thật.
* **T-58 — Đo máy cờ đầy đủ (GATE-AI): tốc độ, độ sâu, sức mạnh, độ ổn định**: Báo cáo GATE-AI đầy đủ: p95 thời gian, độ sâu, sức mạnh ≥75%, 1.000 ván ổn định, cấp Khó giải đúng 100% bộ chiếu hết 1–2 nước bắt buộc đã xác minh đáp án; bộ mở rộng báo riêng.
* **T-59 — Nối camera/micro thật: theo đối tượng nhận, đổi vai, đuổi, tab (web, máy chủ, LiveKit)**: Camera/micro chạy thật theo đối tượng nhận, đổi vai, đuổi, tiếp quản tab; lỗi camera/micro không làm hỏng cờ và chat.
* **T-60 — Giao diện: đủ 5 trạng thái cho mọi màn hình; tính năng chưa làm hiển thị đúng quy tắc**: Mọi màn hình và khung dữ liệu đủ 5 trạng thái; tính năng chưa làm mờ hoặc ẩn đúng quy tắc; danh sách kiểm các lối vào chưa làm.
* **T-61 — Giao diện: dùng được từ 360 px và bằng cảm ứng; trợ năng**: Giao diện dùng được từ 360 px, cảm ứng, đạt WCAG 2.1 AA; báo cáo tương phản thật. Kèm phông theo DESIGN ở màn lớn/nhỏ, chữ Hán truyền thống và ghi rõ lựa chọn phông chưa duyệt.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
**Đối chiếu từng tiêu chí** của P1 (MVP) với sản phẩm chạy thật và chạy **kịch bản demo D1 đến D10** (xem danh sách ở đầu file). Demo "đường thuận" chỉ là một phần của nghiệm thu.

**Việc cần làm (làm lần lượt)**

1. **Tự chuẩn bị tài khoản đã hoàn tất, phòng và dữ liệu ca biên** trên dịch vụ thật, ghi cách tạo và đặt lại, che bí mật. Tách riêng khỏi tài khoản demo (T-64). D1 vẫn dùng **OTP thật**.
2. Lập **bảng đối chiếu**: mỗi tiêu chí → ca kiểm → bằng chứng; bảo đảm không thiếu, không thừa.
3. Chạy **D1 đến D10** đúng thứ tự (D8: rời ghế trước khi vào ván máy; D9: tạo ván online mới).
4. Chạy từng nhánh ngoài demo: quyền, đồng thời, gọi thẳng sai vai, hết hạn; ghi riêng kết quả và liên kết lỗi.
5. Chạy các nhánh mới nối: đăng ký dở và phục hồi, gọi hệ thống khi chưa hoàn tất, vào phòng qua đường dẫn sau đăng nhập, chat lỗi, các tính năng chưa làm hiển thị đúng.
6. Ba yêu cầu phi chức năng mới (nhật ký vận hành, lưu giữ dữ liệu, hiển thị chữ thuần) **đã được PO duyệt** nên **phải đạt**; cách hiển thị ván gián đoạn cũng đã chốt. Không triển khai dọn chat Khách hoặc chức năng P2 trong task này.
7. Bảng nghiệm thu đủ **167 tiêu chí P1/54 mục yêu cầu** hiện hành: gồm hết phiên trong online/AI, chặn OTP trực tiếp, dọn Google dở, AI mất trạng thái sau khởi động lại và phông chữ. Luật cùng thiết bị/khác thiết bị, Sảnh PUBLIC, CODE_ONLY lúc tạo, mời xuống ghế phải dùng bản cập nhật 05/10. Đối chiếu từng dòng theo bảng 14 và Story, không lấy demo D1–D10 thay cho toàn bộ tiêu chí.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Đối chiếu tập tiêu chí hai chiều | Không thiếu, không trùng sai; mỗi nhánh có kết quả |
| Chạy D1–D10 đúng thứ tự | Đủ tám mục tiêu cốt lõi; không dùng dữ liệu giả làm bằng chứng thật |
| Gọi thẳng sai vai, đồng thời, hết hạn | Đúng theo ma trận nghiệm thu, không lộ dữ liệu |
| Nhật ký vận hành, dọn dữ liệu theo thời hạn, hiển thị chữ thuần | Kiểm theo ba yêu cầu đã duyệt (xem bên dưới) |
| Đăng ký dở, gọi khi chưa hoàn tất, đăng nhập qua đường dẫn, chat lỗi, tính năng chưa làm | Đúng quyền, đúng phòng đích, đúng trạng thái; đủ bằng chứng |
| Bạn vào ván với máy thật; thử mời; rời ván rồi mời lại | Đang chơi: Đang đấu, không nhận mời; rời xong: Online rảnh |
| Từ chối thiết bị hoặc rớt camera/micro rồi đi nước và chat | Nước vẫn đồng bộ, chat đúng kênh; camera/micro báo lỗi riêng |
| Mở tab cùng thiết bị; tab cũ reconnect; đăng nhập thiết bị khác khi đang chơi | Tab cũ chỉ đọc và không tự lấy quyền; thiết bị khác xử thua ngay/rời vị trí, cũ đăng xuất, mới về Sảnh |
| Kết thúc ván online thật, còn ghế bị chặn vào ván máy; Rời phòng rồi vào đủ ba cấp máy | Rời ghế giải phóng chỗ; máy chạy đúng; không dùng dữ liệu mẫu thay cho bước này |

**Cách tự kiểm tra**
Chuẩn bị: bản build tích hợp cùng phiên bản, nhiều trình duyệt, thiết bị thật, hạn mức dịch vụ.

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Đối chiếu tiêu chí và ca hai chiều | Không thiếu, không trùng |
| 2 | Chạy D1 đến D10 | Đạt hoặc có lỗi rõ ràng |
| 3 | Chạy các nhánh: sai quyền, hai người cùng làm một việc, dùng công cụ gửi lệnh trái vai | Kết quả đúng với đặc tả (bị chặn hoặc chỉ một người thành công) |
| 4 | Chạy các nhánh vừa nối thật hai bên (web và máy chủ) | Kết quả khớp với đặc tả của từng tiêu chí |
| 5 | Chạy ba ca nằm giữa nhiều chức năng: bạn bè với ván máy; camera/micro hỏng; tab mới tiếp quản | Kết quả khớp với đặc tả (không treo, không mất dữ liệu, đúng thông báo) |
| 6 | Chạy D8 đầy đủ | Rời ghế thật, vào đủ ba cấp máy |

**Khi nào chuyển cho người kiểm thử:** mọi tiêu chí và D1–D10 có trạng thái trung thực (đạt, không đạt, bị chặn, chưa chạy), có bằng chứng hoặc lý do thiếu; mỗi lỗi có bước tái hiện và người nhận.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý với **báo cáo**; lỗi sản phẩm không cản việc bàn giao báo cáo đầy đủ. **Cửa phát hành P1 (MVP) chưa đạt** nếu còn tiêu chí bắt buộc thất bại hoặc chưa kiểm, hay còn lỗi mức Cao hoặc Nghiêm trọng. Sửa theo từng phần và kiểm lại ngay khi phát hiện, không chờ T-64.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** bảng đối chiếu và danh sách lỗi cho nghiệm thu phi chức năng, chuẩn bị demo, bàn giao.
**Không thuộc task này:** tính năng của P2, lấy "task đã xong" thay cho "tiêu chí đạt".
**Phục vụ (nguồn):** Story 20; tiêu chí AC-ROOM-11-04; toàn bộ tiêu chí P1 (MVP); kịch bản D1–D10. Task chung, không thuộc Epic nào.
**Kết quả (đầu ra):** Bảng đối chiếu từng tiêu chí P1 (MVP) với sản phẩm thật; kết quả D1–D10; danh sách lỗi có bước tái hiện.
**Bằng chứng nộp:** Bảng tiêu chí → ca → bằng chứng; báo cáo D1–D10. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Lỗi giao ngay cho người phụ trách, không chờ cuối.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-22, T-25, T-32, T-33, T-34, T-37, T-42, T-46, T-52, T-53, T-54, T-55, T-56, T-57, T-58, T-59, T-60, T-61; liên quan tới (relates to) Story 20; không thuộc Epic (nhãn chung).

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Gia Kỳ**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-11-01**; Due date **2026-11-02**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/11-task-chung.md` — T-62.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Gia Kỳ**.
* Review/kiểm độc lập dự kiến: **Võ Thành Đông**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Công việc chung, không có Parent Epic.

**Phải hoàn tất trước:**

* [T-22 — XIAN-56](https://xiangqi-web.atlassian.net/browse/XIAN-56)
* [T-25 — XIAN-59](https://xiangqi-web.atlassian.net/browse/XIAN-59)
* [T-32 — XIAN-66](https://xiangqi-web.atlassian.net/browse/XIAN-66)
* [T-33 — XIAN-67](https://xiangqi-web.atlassian.net/browse/XIAN-67)
* [T-34 — XIAN-68](https://xiangqi-web.atlassian.net/browse/XIAN-68)
* [T-37 — XIAN-71](https://xiangqi-web.atlassian.net/browse/XIAN-71)
* [T-42 — XIAN-76](https://xiangqi-web.atlassian.net/browse/XIAN-76)
* [T-46 — XIAN-80](https://xiangqi-web.atlassian.net/browse/XIAN-80)
* [T-52 — XIAN-86](https://xiangqi-web.atlassian.net/browse/XIAN-86)
* [T-53 — XIAN-87](https://xiangqi-web.atlassian.net/browse/XIAN-87)
* [T-54 — XIAN-88](https://xiangqi-web.atlassian.net/browse/XIAN-88)
* [T-55 — XIAN-89](https://xiangqi-web.atlassian.net/browse/XIAN-89)
* [T-56 — XIAN-90](https://xiangqi-web.atlassian.net/browse/XIAN-90)
* [T-57 — XIAN-91](https://xiangqi-web.atlassian.net/browse/XIAN-91)
* [T-58 — XIAN-92](https://xiangqi-web.atlassian.net/browse/XIAN-92)
* [T-59 — XIAN-93](https://xiangqi-web.atlassian.net/browse/XIAN-93)
* [T-60 — XIAN-94](https://xiangqi-web.atlassian.net/browse/XIAN-94)
* [T-61 — XIAN-95](https://xiangqi-web.atlassian.net/browse/XIAN-95)

**Story phục vụ:**

* [Story 20 — XIAN-28](https://xiangqi-web.atlassian.net/browse/XIAN-28)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 10 | Gia Kỳ |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 2 | Gia Kỳ |
| Review độc lập | 2 | Võ Thành Đông |
| Tổng Original/Remaining Estimate ban đầu | 14 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc có luật nghiệp vụ, xử lý trạng thái, tích hợp hoặc kiểm định chất lượng: dành ca dài hơn và dự phòng sửa lỗi. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-11-01 10:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-11-02 15:00 |
| Bắt đầu review | 2026-11-02 15:00 |
| Review PASS và bàn giao mục tiêu | 2026-11-02 17:00 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-63 — Nghiệm thu phi chức năng: bài tải, quyền camera/micro, trình duyệt, bảo mật

**Jira thực:** [XIAN-97](https://xiangqi-web.atlassian.net/browse/XIAN-97) · **Loại:** Task · **Assignee:** Gia Kỳ · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** QA & DevOps · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `QA`, `gate`, `chung`, `US-MEDIA-01`, `US-MEDIA-02`, `US-PLAY-01`, `US-UI-04`, `xiangqi-mvp-20261005`, `t-63`
**Ước lượng:** 14 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-11-02 · **Due date:** 2026-11-04 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Không có — công việc chung của dự án · **Components:** QA & DevOps
**Phải xong trước:**

* **T-22 — Thử nghiệm OTP thật và đăng nhập Google; chặn người chưa hoàn tất đăng ký và chặn đổi email**: Báo cáo thử nghiệm OTP thật: gửi thư, hết hạn, giới hạn nhập sai, dọn tài khoản dở, chặn đổi email trực tiếp; kết luận đạt / không đạt / chưa kết luận; chốt chặn người chưa hoàn tất. Có thêm kết luận GATE-GOOGLE kèm bằng chứng. Có chốt API/Socket từ chối OTP email trực tiếp của tài khoản hoàn tất, kèm bằng chứng dịch vụ thật.
* **T-32 — Nối web với máy chủ: bắt đầu ván đầy đủ, đồng hồ, kết thúc ván, đầu hàng, xin hoà**: Bắt đầu ván, đồng hồ, kết thúc ván, đầu hàng và xin hoà chạy trọn trên web và máy chủ thật.
* **T-53 — Kiểm thử luật cờ: đếm nước đi độc lập và bộ kiểm thử chạy tự động**: Bộ kiểm thử luật chạy tự động: đếm nước đi độc lập (44, 1.920, 79.666, 3.290.240), thế mẫu, 1.000 ván ngẫu nhiên, ký hiệu; báo cáo GATE-PERFT.
* **T-56 — Giao diện chat hai kênh và nối web với máy chủ**: Khung chat hai kênh và nối thật với máy chủ; ba trạng thái tin; công tắc Kênh Chung. Desktop mở Riêng mặc định, có thể mở đồng thời Chung hoặc đóng bớt; mobile hai tab mặc định Riêng.
* **T-57 — Nối web với máy chủ: mất kết nối, người xem, bảng nước đi, phòng khoá**: Mất kết nối, kết nối lại, người xem, bảng nước đi, phòng khoá chạy trọn trên web và máy chủ thật. Gồm hết phiên và đăng nhập lại cùng thiết bị, đăng nhập khác thiết bị giữa online/AI trên bản chạy thật.
* **T-58 — Đo máy cờ đầy đủ (GATE-AI): tốc độ, độ sâu, sức mạnh, độ ổn định**: Báo cáo GATE-AI đầy đủ: p95 thời gian, độ sâu, sức mạnh ≥75%, 1.000 ván ổn định, cấp Khó giải đúng 100% bộ chiếu hết 1–2 nước bắt buộc đã xác minh đáp án; bộ mở rộng báo riêng.
* **T-59 — Nối camera/micro thật: theo đối tượng nhận, đổi vai, đuổi, tab (web, máy chủ, LiveKit)**: Camera/micro chạy thật theo đối tượng nhận, đổi vai, đuổi, tiếp quản tab; lỗi camera/micro không làm hỏng cờ và chat.
* **T-61 — Giao diện: dùng được từ 360 px và bằng cảm ứng; trợ năng**: Giao diện dùng được từ 360 px, cảm ứng, đạt WCAG 2.1 AA; báo cáo tương phản thật. Kèm phông theo DESIGN ở màn lớn/nhỏ, chữ Hán truyền thống và ghi rõ lựa chọn phông chưa duyệt.

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Đo **sức chịu tải** và **độ trễ nước đi** tại đúng điểm cần đo. Kiểm: người xem nhận thế cờ mới dưới 100 ms; 50 kết nối với 10 ván cùng lúc, nước đi p95 dưới 300 ms. Phần camera/micro (PO duyệt 04/10/2026) chạy **quy mô nhỏ, khoảng 3 phòng**, **chỉ ghi số đo** (số luồng, băng thông, mức dùng hạn mức miễn phí), **không đặt ngưỡng đạt** và không nằm trong điều kiện đạt của P1 (MVP), để khỏi dùng hết hạn mức miễn phí trước buổi demo.

Kiểm **độc lập** việc phân quyền camera/micro trên bản ứng dụng đã nối. Bằng chứng phải chứng minh: người **không có quyền** không nhận và không phát được luồng thật.

Kết luận về các **yêu cầu phi chức năng đã được duyệt** dựa trên **số đo và kiểm thử độc lập**, để chất lượng được đánh giá riêng với chuyện "demo chạy được".

**Việc cần làm (làm lần lượt)**

1. **Tự chuẩn bị tài khoản thử** (hồ sơ hoàn tất, phiên hợp lệ, đủ quyền) cho 10 phòng, 20 người chơi và 30 kết nối khác (người xem, Sảnh, chat); **không** làm giả phiên hay bỏ qua kiểm tra để đạt 50 kết nối.
2. Dựng 10 ván; mỗi phòng tối đa **5 người xem**.
3. Cho đi **nước hợp lệ đều đặn trong 10 phút**; ghi thời điểm máy chủ nhận, máy chủ phát và **máy người xem nhận**; ghi cách đồng bộ đồng hồ và sai số.
4. Tính p95 riêng cho **mạng nội bộ** và cho **tải tổng**, không chỉ lấy thời gian máy chủ.
5. Theo dõi tài nguyên máy chủ (CPU, bộ nhớ) trong lúc chạy.
6. Phần **camera/micro** chạy qua ứng dụng thật ở **quy mô nhỏ (\~3 phòng)**: ghi riêng số luồng, băng thông, hạn mức; **chỉ ghi số đo, không có ngưỡng đạt/không đạt**.
7. Báo đủ số đo và kết luận từng chỉ tiêu; có mẫu vượt ngưỡng hay đứt kết nối thì **giữ số thật**, giao miền sửa và đo lại, **không bỏ mẫu để p95 đẹp**; dọn dữ liệu thử.
8. Chuẩn bị tài khoản và thiết bị thử từ bản build của T-59; đo **từng mức chia sẻ** độc lập ở hai người phát.
9. Dùng **client cố tình trái quyền** gọi thẳng vào dịch vụ để thử phát và nhận; kiểm dữ liệu và luồng nhận tại dịch vụ.
10. Đổi vai, đuổi, tiếp quản qua luồng thật; thử token cũ và quyền mới hợp lệ; kiểm phòng khoá không tự thu quyền người đang có mặt (kết nối lại cả phòng đã kiểm ở T-57).
11. Ghi từng quyền: đạt, không đạt, bị chặn, kèm bản build, phương pháp; **lỗi thu quyền giao ngay** cho người làm cấp quyền, rồi kiểm lại trên bản sửa, **không chờ T-64**.
12. Rà cấu hình và sản phẩm kiểm thử để chắc **không ghi hình hay lưu** nội dung camera/micro.
13. Đọc số đo tải, responsive và trợ năng, **cùng phiên bản build**.
14. Kiểm quyền ở máy chủ, dữ liệu trả về và **không có bí mật trong phần chạy ở trình duyệt**; khởi động lại máy chủ giữa ván.
15. Đối chiếu kết quả máy cờ, OTP thật, camera/micro với **tiêu chuẩn thật**; mục nào thiếu bằng chứng thì ghi rõ.
16. Lập bảng đạt hay chưa đạt cho từng tiêu chuẩn; **chạy lại phần đã thay đổi sau lần đo**.
17. Kiểm thêm ba yêu cầu mới duyệt: **nhật ký vận hành** (gây lỗi rồi đọc nhật ký: có mục đúng mã, không có mật khẩu, mã OTP, token, chat); **lưu giữ dữ liệu** (tác vụ dọn: chat phòng đã đóng, biên lai quá 24 giờ, nhật ký quá 14 ngày bị xoá; ván online và nước đi còn nguyên; ván với máy không có bản ghi bền); **hiển thị chữ thuần** (gửi HTML, script, đường dẫn tự kích hoạt vào chat, tên hiển thị, tên phòng: hiện nguyên văn, không chạy gì).

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| 50 kết nối, 10 ván, 10 phút | 0 mất kết nối ngoài ý muốn; p95 nước đi dưới 300 ms |
| Đo từ lúc máy chủ nhận đến lúc người xem nhận | p95 dưới 100 ms; ghi cách đồng bộ đồng hồ |
| Theo dõi tài nguyên trong lúc tải | CPU và bộ nhớ không tăng mãi; ghi số thật |
| Chạy camera/micro ở quy mô nhỏ (\~3 phòng) | Ghi số đo riêng; không tính vào điều kiện đạt |
| Chuẩn bị và đặt lại dữ liệu, kiểm hồ sơ, phiên, quyền | Đủ 50 kết nối hợp lệ, 10 ván thật; không quá 5 người xem mỗi phòng; không vòng qua kiểm tra |
| Có mẫu vượt ngưỡng hoặc đứt kết nối | Giữ số thật, báo không đạt, giao miền sửa |
| Mọi mức chia sẻ với đối thủ và người xem | Chỉ nhận đúng luồng được phép |
| Người xem dùng công cụ gọi thẳng chức năng phát camera/micro | Dịch vụ từ chối, không phát được gì |
| Dùng lại token cũ; xin token mới hợp lệ | Token cũ không lấy lại quyền; token mới hoạt động đúng |
| Rà cấu hình và sản phẩm kiểm thử | Không có ghi hình, ghi âm hay lưu |
| Đối chiếu báo cáo mạng nội bộ và tải | p95 dưới 100 ms và dưới 300 ms, đúng môi trường |
| Giả mạo nước đi hay kết quả; đọc sai vai; quét phần chạy ở trình duyệt | Không có tác động trái quyền, không lộ bí mật |
| Chrome, Edge, Firefox, Safari bản mới, bốn cỡ màn hình | Không lỗi chức năng, không cuộn ngang |
| Khởi động lại; đối chiếu báo cáo máy cờ | Ván gián đoạn đúng; máy đạt ngưỡng thật |
| Một báo cáo (máy cờ, đếm nước, OTP, camera/micro) thiếu bằng chứng hoặc khác phiên bản hiện tại | Không kết luận đạt; đo lại hoặc ghi bị chặn |

**Cách tự kiểm tra**
Chuẩn bị: môi trường thử, tập lệnh tải, máy đo; nhiều tài khoản, thiết bị thật, công cụ gọi thẳng dịch vụ.

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Chạy 50 kết nối, 10 ván trong 10 phút | 0 mất kết nối ngoài ý muốn; p95 < 300 ms |
| 2 | Đo từ máy chủ nhận đến người xem nhận | p95 < 100 ms |
| 3 | Theo dõi CPU, bộ nhớ | Không tăng liên tục |
| 4 | Chạy phần camera/micro (nếu duyệt) | Số liệu riêng, kết luận đúng |
| 5 | Kiểm dữ liệu thử | Hợp lệ, không vượt 5 người xem/phòng |
| 6 | Có mẫu lỗi | Giữ lại, báo đúng |
| 7 | Thử mọi mức chia sẻ | Chỉ luồng được phép |
| 8 | Người xem dùng công cụ gọi thẳng chức năng phát camera/micro | Dịch vụ từ chối, không phát được |
| 9 | Dùng token cũ và mới | Đúng như bảng |
| 10 | Rà cấu hình, sản phẩm | Không có chỗ ghi hay lưu |
| 11 | Đối chiếu báo cáo mạng nội bộ, tải | Đạt ngưỡng đúng môi trường |
| 12 | Thử giả mạo, đọc sai vai, quét phần chạy ở trình duyệt | Không tác động, không lộ |
| 13 | Chạy bốn trình duyệt ở bốn cỡ | Không lỗi |
| 14 | Khởi động lại máy chủ giữa ván; đối chiếu số đo của máy cờ | Ván chuyển sang "gián đoạn" không treo; số đo máy cờ đạt theo từng cấp |
| 15 | Kiểm các báo cáo thiếu hoặc lệch phiên bản | Không kết luận đạt |

**Khi nào chuyển cho người kiểm thử:** báo cáo có quy trình tái lập, bản build, phương pháp, số thô, và kết luận từng chỉ tiêu; mọi ô của ma trận có kết quả và bằng chứng (hoặc lý do chưa kiểm), ghi rõ build và cách làm; mỗi tiêu chuẩn có phương pháp, bản build, số đo, bằng chứng và kết luận (hoặc lý do bị chặn/chưa chạy); có lỗi thì có người nhận và phạm vi đo lại.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý với **báo cáo**. Chỉ tiêu chưa chạy phải ghi lý do, **không** ghi "đã đo đủ". **Tiêu chuẩn sản phẩm** (dưới 100 ms, 50 kết nối/10 ván, dưới 300 ms, tài nguyên ổn định) chỉ "đạt" khi số đo đạt. Không đạt giữ trạng thái không đạt/chặn, giao sửa và đo lại ngay. **Không** đổi kết quả không đạt thành đạt. **Tiêu chuẩn sản phẩm:** mọi quyền bắt buộc đã duyệt đều đạt tại dịch vụ. Không nhận hay phát luồng trái quyền. Không lưu nội dung. Có vi phạm thì tiêu chuẩn bị chặn, sửa và kiểm lại ngay. **Tiêu chuẩn chất lượng:** mọi yêu cầu phi chức năng bắt buộc đã duyệt phải đạt đúng ngưỡng trước khi bàn giao. Sửa và đo lại ngay khi phát hiện, trước T-64. **không hạ ngưỡng**.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** số đo tải cho nghiệm thu các yêu cầu phi chức năng; báo cáo phân quyền camera/micro cho nghiệm thu phi chức năng và bàn giao; bảng nghiệm thu phi chức năng cho chuẩn bị demo và bàn giao.
**Không thuộc task này:** tự thêm ngưỡng cho camera/micro; nâng gói dịch vụ; ghi hình, lưu nội dung; kiểm thử kết nối lại cả phòng (đã làm ở task ván nâng cao); dọn chat Khách và tính năng của P2.
**Phục vụ (nguồn):** Story 4, 15, 23; tiêu chí AC-PLAY-01-01, AC-MEDIA-01-04, AC-MEDIA-02-01, AC-MEDIA-02-02, AC-UI-04-02; NFR-01 đến NFR-10, GATE-LOAD, GATE-MEDIA, GATE-OTP. Task chung, không thuộc Epic nào.
**Kết quả (đầu ra):** Báo cáo nghiệm thu phi chức năng: bài tải, quyền camera/micro, bốn trình duyệt, bảo mật, ba yêu cầu mới (nhật ký, lưu giữ dữ liệu, chữ thuần).
**Bằng chứng nộp:** Bảng yêu cầu → phương pháp → số đo → kết luận. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Không hạ ngưỡng; phần camera/micro tải chỉ ghi số đo.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-22, T-32, T-53, T-56, T-57, T-58, T-59, T-61; liên quan tới (relates to) Story 4, Story 15, Story 23; không thuộc Epic (nhãn chung).

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Gia Kỳ**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-11-02**; Due date **2026-11-04**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/11-task-chung.md` — T-63.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Gia Kỳ**.
* Review/kiểm độc lập dự kiến: **nguyenhoangtungtuyhoa**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Công việc chung, không có Parent Epic.

**Phải hoàn tất trước:**

* [T-22 — XIAN-56](https://xiangqi-web.atlassian.net/browse/XIAN-56)
* [T-32 — XIAN-66](https://xiangqi-web.atlassian.net/browse/XIAN-66)
* [T-53 — XIAN-87](https://xiangqi-web.atlassian.net/browse/XIAN-87)
* [T-56 — XIAN-90](https://xiangqi-web.atlassian.net/browse/XIAN-90)
* [T-57 — XIAN-91](https://xiangqi-web.atlassian.net/browse/XIAN-91)
* [T-58 — XIAN-92](https://xiangqi-web.atlassian.net/browse/XIAN-92)
* [T-59 — XIAN-93](https://xiangqi-web.atlassian.net/browse/XIAN-93)
* [T-61 — XIAN-95](https://xiangqi-web.atlassian.net/browse/XIAN-95)

**Story phục vụ:**

* [Story 4 — XIAN-12](https://xiangqi-web.atlassian.net/browse/XIAN-12)
* [Story 15 — XIAN-23](https://xiangqi-web.atlassian.net/browse/XIAN-23)
* [Story 23 — XIAN-31](https://xiangqi-web.atlassian.net/browse/XIAN-31)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 10 | Gia Kỳ |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 2 | Gia Kỳ |
| Review độc lập | 2 | nguyenhoangtungtuyhoa |
| Tổng Original/Remaining Estimate ban đầu | 14 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc có luật nghiệp vụ, xử lý trạng thái, tích hợp hoặc kiểm định chất lượng: dành ca dài hơn và dự phòng sửa lỗi. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-11-02 17:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-11-04 12:00 |
| Bắt đầu review | 2026-11-04 13:00 |
| Review PASS và bàn giao mục tiêu | 2026-11-04 15:00 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---

### T-64 — Chuẩn bị demo, sửa lỗi cuối, kiểm lại và bàn giao bằng chứng

**Jira thực:** [XIAN-98](https://xiangqi-web.atlassian.net/browse/XIAN-98) · **Loại:** Task · **Assignee:** Gia Kỳ · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** QA & DevOps · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `QA`, `chung`, `xiangqi-mvp-20261005`, `t-64`
**Ước lượng:** 8.5 giờ công (gồm review/hỗ trợ) · **Story Points:** để trống · **Start date:** 2026-11-04 · **Due date:** 2026-11-05 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Không có — công việc chung của dự án · **Components:** QA & DevOps
**Phải xong trước:**

* **T-03 — Cấu hình Supabase: gửi mã OTP đăng ký và đăng nhập Google**: Cấu hình Supabase gửi mã OTP 6 số, hạn 180 giây, gửi lại 60 giây, mẫu thư; danh sách email nhóm; số liệu hạn mức thư thật. Có thêm cấu hình nhà cung cấp Google đã che bí mật và hướng dẫn tạo khoá.
* **T-22 — Thử nghiệm OTP thật và đăng nhập Google; chặn người chưa hoàn tất đăng ký và chặn đổi email**: Báo cáo thử nghiệm OTP thật: gửi thư, hết hạn, giới hạn nhập sai, dọn tài khoản dở, chặn đổi email trực tiếp; kết luận đạt / không đạt / chưa kết luận; chốt chặn người chưa hoàn tất. Có thêm kết luận GATE-GOOGLE kèm bằng chứng. Có chốt API/Socket từ chối OTP email trực tiếp của tài khoản hoàn tất, kèm bằng chứng dịch vụ thật.
* **T-38 — Dựng môi trường demo: chạy cục bộ trước, Render làm dự phòng**: Hướng dẫn và lệnh chạy demo cục bộ; các bước dự phòng trên Render.
* **T-62 — Nghiệm thu từng tiêu chí P1 (MVP) và chạy kịch bản demo D1–D10**: Bảng đối chiếu từng tiêu chí P1 (MVP) với sản phẩm thật; kết quả D1–D10; danh sách lỗi có bước tái hiện.
* **T-63 — Nghiệm thu phi chức năng: bài tải, quyền camera/micro, trình duyệt, bảo mật**: Báo cáo nghiệm thu phi chức năng: bài tải, quyền camera/micro, bốn trình duyệt, bảo mật, ba yêu cầu mới (nhật ký, lưu giữ dữ liệu, chữ thuần).

**Điều kiện nhận việc:** các đầu vào trên phải được bàn giao và đủ điều kiện sử dụng trước khi bắt đầu phần phụ thuộc; ngày trùng nhau không cho phép chạy song song với Task tiền đề. Khi đầu vào bị chặn, chọn việc độc lập ở bảng 15. Báo cáo thử nghiệm hoàn tất nhưng kết luận không đạt không tự mở quyền triển khai dựa trên phương án chưa đạt/chưa duyệt.

**Mục tiêu**
Chuẩn bị **buổi demo nộp bài** trên môi trường và hạn mức thật: người trình bày có sẵn tài khoản, dữ liệu, thứ tự thao tác và cách xử lý khi gặp sự cố.

**Kiểm lại và đối chiếu bằng chứng trên bản build cuối** trước khi bàn giao P1 (MVP). Task này **không phải nơi duy nhất mở việc sửa lỗi**: lỗi đã được giao ngay cho từng phần từ các lượt kiểm trước; ở đây xác minh các bản sửa và chốt gói bàn giao.

**Việc cần làm (làm lần lượt)**

1. **Tự tạo tài khoản demo B, C, D** trên môi trường demo theo quy trình đã cấu hình; kiểm hồ sơ đã hoàn tất và đăng nhập được; **bảo vệ thông tin đăng nhập**. (Tài khoản kiểm thử và bài tải do các task đó tự tạo, không chờ task này.)
2. **Kiểm hạn mức** thư, dịch vụ camera/micro, thiết bị trước buổi diễn tập. A dùng **email nhóm để đăng ký OTP thật** theo D1; **không** đổi dịch vụ gửi thư hay giả lập thư để che thiếu hạn mức.
3. **Diễn tập D1 đến D10** trên bản build đã ghi rõ (D8 rời ghế, D9 ván online mới, D10 vào lại ván máy); ghi cách đặt lại dữ liệu và xử lý sự cố.
4. Khi gặp lỗi: gửi ngay ca tái hiện, bằng chứng, bản build cho phần chịu trách nhiệm; **sửa ngay, không chờ đến bước bàn giao cuối**; diễn tập lại phần bị ảnh hưởng sau khi sửa, lưu kết quả trước và sau.
5. **Bàn giao tài liệu hướng dẫn demo** (runbook) và tình trạng sẵn sàng **thật**; còn lỗi hay thiếu hạn mức thì báo PO, **không ghi "demo sẵn sàng" giả**.
6. Nhận báo cáo ở T-62, T-63 (có thể còn không đạt) và các lỗi đã giao; **xác minh các bản sửa**.
7. **Kiểm lại những luồng bị ảnh hưởng**, cập nhật bảng tiêu chí và tiêu chuẩn trên bản build cuối. Lỗi mới giao lại để sửa ngay rồi kiểm lại; **không tự đổi phạm vi hay hạ ngưỡng**.
8. **Đóng gói bàn giao**: mã nguồn, bản build, môi trường, tài liệu hướng dẫn demo, bằng chứng. Chỉ kết luận P1 (MVP) đạt khi các điều kiện chất lượng đã duyệt đều đạt; chưa đạt thì **báo PO phần còn bị chặn**.

**Các trường hợp lỗi và kết quả mong đợi**

| Tình huống | Kết quả mong đợi |
| --- | --- |
| Đăng nhập tài khoản, kiểm địa chỉ, thiết bị, hạn mức | Đủ điều kiện; không lộ thông tin đăng nhập |
| A đăng ký bằng email nhóm | Nhận thư thật, hoàn tất đúng cấu hình; không dùng giả lập |
| Diễn tập D8 rời ghế; D9 ván mới; D10 vào lại | Đúng chỗ chơi và đúng ván; không dùng kết quả ván cũ |
| Mất mạng hoặc hết hạn mức khi diễn tập | Báo lỗi thật; không bịa kết quả đạt |
| Chuẩn bị B, C, D trước buổi diễn tập | Dùng được, không ở trạng thái đăng ký dở; bí mật không có trong tài liệu công khai |
| Diễn tập gặp lỗi; giao phần phụ trách; nhận bản sửa và chạy lại | Lỗi được xử lý trước bước bàn giao cuối; giữ kết quả trước và sau; chưa sửa thì demo chưa đạt |
| Chạy lại các bước tái hiện trên bản sửa | Lỗi hết, có bằng chứng trước và sau |
| Chạy các luồng liên quan và mọi cửa cần nộp | Không lỗi mới, không bỏ ca để cho "xanh" |
| So danh sách tiêu chí với sản phẩm của bản build cuối | Không thiếu bằng chứng, không dùng build cũ |
| Mở gói bàn giao, làm theo hướng dẫn | Người khác tái hiện được; không có bí mật |

**Cách tự kiểm tra**
Chuẩn bị: email thành viên nhóm, thiết bị và mạng thật.

| # | Việc làm | Phải thấy |
| --- | --- | --- |
| 1 | Đăng nhập, kiểm địa chỉ, thiết bị, hạn mức | Đủ điều kiện |
| 2 | A đăng ký bằng email nhóm | Thư thật, hoàn tất |
| 3 | Diễn tập D8, D9, D10 | Đúng thứ tự, đúng ván |
| 4 | Gây mất mạng hoặc hết hạn mức giả định | Báo lỗi thật |
| 5 | Kiểm tài khoản B, C, D | Dùng được, không đăng ký dở |
| 6 | Gặp lỗi khi diễn tập; nhận bản sửa | Chạy lại đạt |
| 7 | Chạy lại bước tái hiện từng lỗi đã sửa | Lỗi hết, có trước/sau |
| 8 | Chạy các luồng liên quan và toàn bộ cửa cần nộp | Không lỗi mới |
| 9 | So danh sách tiêu chí với bằng chứng trên build cuối | Đủ, không build cũ |
| 10 | Một người khác mở gói và làm theo hướng dẫn | Tái hiện được |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt; tài khoản, dữ liệu, địa chỉ, thiết bị, hạn mức đã kiểm; diễn tập đủ D1–D10 đạt trên build đã ghi.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý; tài liệu hướng dẫn demo người khác làm theo được và không lộ bí mật. Còn lỗi chức năng hoặc điều kiện demo thiếu thì **chưa đạt**; báo cáo lỗi không đồng nghĩa demo sẵn sàng.

**Kiểm tra trước khi đóng:** đối chiếu đầu ra với toàn bộ việc cần làm, bảng lỗi và bảng tự kiểm ở trên; người kiểm thử kiểm độc lập và có bằng chứng trên cùng bản dựng/môi trường. Ready for Test là bàn giao, chưa phải Done. Với Task báo cáo/đo thử, có thể hoàn tất báo cáo khi sản phẩm chưa đạt nhưng phải giữ rõ kết luận không đạt/chưa đo, không đánh dấu Story/Epic đạt theo.
**Bàn giao cho task sau:** tài liệu và tình trạng demo cho bàn giao.
**Không thuộc task này:** đổi dịch vụ gửi thư hay giả lập OTP; công cụ demo của P2; thêm tính năng; cắt phạm vi; nhận tính năng của P2 vào nghiệm thu.
**Khi nào task xong (cửa cuối P1 (MVP)):** D1 đến D10, mọi tiêu chí của P1 (MVP), các yêu cầu phi chức năng đã duyệt và các cửa chất lượng bắt buộc đều đạt trên bản build cuối; không còn lỗi mức Cao hoặc Nghiêm trọng; kiểm thử đơn vị, tích hợp xanh; bàn giao đạt. **Báo cáo ở T-62, T-63 xong không đồng nghĩa cửa này đạt.** Còn lỗi hoặc thiếu bằng chứng thì cửa chưa đạt, sửa và kiểm lại, **không cắt phạm vi hay tự cho phép phát hành**.
**Bàn giao:** gói bàn giao cho PO để nộp.
**Phục vụ (nguồn):** kịch bản D1–D10. Task chung, không thuộc Epic nào.
**Kết quả (đầu ra):** Tài khoản và dữ liệu demo, hướng dẫn demo, gói bàn giao: mã, bản dựng, môi trường, bằng chứng.
**Bằng chứng nộp:** Người khác diễn tập theo hướng dẫn; kiểm hạn mức thư. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Hạn mức thư; lỗi chưa hết thì ghi demo chưa đạt.
**Quan hệ cần đối chiếu trên Jira:** bị chặn bởi (is blocked by) T-03, T-22, T-38, T-62, T-63; không thuộc Epic (nhãn chung).

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Gia Kỳ**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-11-04**; Due date **2026-11-05**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/11-task-chung.md` — T-64.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Gia Kỳ**.
* Review/kiểm độc lập dự kiến: **TÌNH 4851_NGUYỄN NGỌC**, khác người làm. Cường kiêm T-53/T-58 QA đã được PO duyệt 05/10/2026; các thành viên khác giữ vai trò theo bảng phân công.
* Công việc chung, không có Parent Epic.

**Phải hoàn tất trước:**

* [T-03 — XIAN-37](https://xiangqi-web.atlassian.net/browse/XIAN-37)
* [T-22 — XIAN-56](https://xiangqi-web.atlassian.net/browse/XIAN-56)
* [T-38 — XIAN-72](https://xiangqi-web.atlassian.net/browse/XIAN-72)
* [T-62 — XIAN-96](https://xiangqi-web.atlassian.net/browse/XIAN-96)
* [T-63 — XIAN-97](https://xiangqi-web.atlassian.net/browse/XIAN-97)

**Story phục vụ:**

* Công việc nền tảng/kiểm chung theo phạm vi mô tả.

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

| Khoản ước lượng | Giờ công | Người thực hiện |
|---|---:|---|
| Thực hiện và tự kiểm | 6 | Gia Kỳ |
| Sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) | 1.5 | Gia Kỳ |
| Review độc lập | 1 | TÌNH 4851_NGUYỄN NGỌC |
| Tổng Original/Remaining Estimate ban đầu | 8.5 | Không cộng giờ riêng ở Story/Epic |

**Cơ sở:** Việc có luật nghiệp vụ, xử lý trạng thái, tích hợp hoặc kiểm định chất lượng: dành ca dài hơn và dự phòng sửa lỗi. Ước lượng bao phủ toàn bộ Description, không bỏ đầu ra. Đây là dự báo; người nhận phải kiểm lại trước triển khai.

| Mốc dự kiến UTC+7 | Thời điểm |
|---|---|
| Bắt đầu thực hiện | 2026-11-04 15:00 |
| Kết thúc thực hiện/tự kiểm/dự phòng | 2026-11-05 14:30 |
| Bắt đầu review | 2026-11-05 14:30 |
| Review PASS và bàn giao mục tiêu | 2026-11-05 15:30 |

Chỉ bàn giao khi kiểm thật đạt; các ca dự kiến không phải bằng chứng PASS.

---
