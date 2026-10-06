# Description của 8 Epic

**Ngày cập nhật:** 2026-10-05 · **Trạng thái:** đã được PO cho phép tạo và phân công ngày 05/10/2026 · Đã tạo Epic/Story/Task trên XIAN · Viết theo `00-chuan-description.md` và mẫu `00b`.

**8 Epic ứng với 8 yêu cầu được giao.** Mỗi Epic có: mục tiêu và giá trị; yêu cầu được giao; ai dùng; các Story; phạm vi (có/không); quy tắc quan trọng; nguồn (đặc tả); kết quả khi xong; bắt đầu khi (phụ thuộc); kiểm thử Epic; điều kiện hoàn thành (PASS); bằng chứng nộp; rủi ro; Task. Story ở `12` và `13`; Task ở `03` đến `11`; bảng đối chiếu từng tiêu chí ở `14`. Có thêm **6 task chung** (nghiệm thu bản chơi được, khung kiểm thử nhiều trình duyệt, môi trường demo, nghiệm thu phi chức năng, nghiệm thu tiêu chí và demo, chuẩn bị demo và bàn giao) không thuộc Epic nào, gắn nhãn `chung`.

**Mọi Epic:** Nhãn `P1`, trạng thái To Do, có Assignee và Fix version. PO yêu cầu gán Sprint cho cả Epic ngày 05/10/2026: trường Sprint của tám Epic là Sprint 4 (mốc nghiệm thu cuối), Task con vẫn ở Sprint 1–4.

---

# EPIC 1 — Đăng ký và đăng nhập (kèm nền tảng dự án)

**Jira thực:** [XIAN-1](https://xiangqi-web.atlassian.net/browse/XIAN-1) · **Loại:** Epic · **Assignee:** Tưởng Lê khoa Cường-4572 · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** không gán cho Epic · **Priority:** High · **Nhãn:** `P1`, `loi`, `mo-rong`, `xiangqi-mvp-20261005`, `e-01`
**Ước lượng:** không cộng giờ riêng; tổng Task liên quan chỉ để tham chiếu · **Story Points:** để trống · **Start date:** 2026-10-05 · **Due date:** 2026-11-04 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Giai đoạn:** phần lõi gồm T-01, T-02, T-03, T-04, T-06, T-07, T-09, T-13, T-17, T-18, T-21, T-22, T-25; phần mở rộng gồm T-42, T-60, T-61.

## Mục tiêu và giá trị (Epic này làm gì)

Cho người dùng đăng ký/đăng nhập bằng **Google** hoặc **đăng ký tài khoản qua ba bước** (tên đăng nhập và mật khẩu, email, mã OTP 6 số gửi qua email), **đăng nhập**, có **hồ sơ cơ bản**, **đăng xuất**, và dùng một **giao diện thống nhất** (đủ 5 trạng thái, dùng được trên điện thoại, đạt chuẩn trợ năng). Epic này cũng gồm **nền tảng của cả dự án** (kho mã, kiểm tra tự động, hợp đồng giữa trình duyệt và máy chủ, cơ sở dữ liệu, khung web, khung máy chủ, ba cơ chế dùng chung) vì đăng ký và đăng nhập là chức năng đầu tiên cần đến chúng.

## Yêu cầu được giao

Giao diện đăng ký / đăng nhập

## Ai dùng

Người mới (đăng ký), người đã có tài khoản (đăng nhập); nhóm làm dự án (phần nền tảng).

## Gồm những việc lớn nào (mỗi việc là một Story)

* Story 1 — Đăng ký tài khoản qua ba bước hoặc bằng Google
* Story 2 — Đăng nhập bằng tên đăng nhập và mật khẩu hoặc bằng Google
* Story 3 — Hồ sơ cơ bản và đăng xuất
* Story 4 — Giao diện nhất quán: đủ 5 trạng thái, dùng được trên điện thoại, trợ năng, tính năng chưa làm

## Phạm vi

* **Có:** các Story ở trên.
* **Không:** Đăng nhập khách, quên mật khẩu, đổi tên đăng nhập hoặc email, ảnh đại diện tuỳ chọn, giao diện sáng (P2).
* **P2 (có trong đặc tả nhưng không làm ở giai đoạn này):** Đăng nhập khách (BA 1.3), quên và đặt lại mật khẩu (BA 1.7), đổi tên đăng nhập (BA 1.6) là P2; chỉ hiện nút/liên kết mờ. **Đăng ký và đăng nhập bằng Google (BA 1.2) chạy thật ở P1 (MVP) (PO quyết định 04/10/2026).**

## Các quy tắc quan trọng

* Tên đăng nhập 3–20 ký tự (chữ, số, gạch dưới), không phân biệt hoa thường khi kiểm trùng; mật khẩu từ 8 ký tự; tên hiển thị 2–30 ký tự.
* Mã OTP có hiệu lực **180 giây**; gửi lại cách nhau tối thiểu **60 giây**; mặc định chỉ khoảng **2 thư mỗi giờ**.
* Phiên đăng nhập: ghi nhớ **30 ngày**, không ghi nhớ **12 giờ** hoặc đóng trình duyệt. Hạn cố định từ đăng nhập/hoàn tất, không trượt theo hoạt động/token. Hết phiên trong ván: online giữ 60 giây, đồng hồ chạy; AI 30 phút để cùng thiết bị đăng nhập lại. Khác thiết bị khi đang chơi: xử thua ngay, rời vị trí, nơi cũ đăng xuất, nơi mới về Sảnh. OTP email trực tiếp không đăng nhập ứng dụng.
* Đăng nhập sai chỉ báo **một lỗi chung**, không lộ email. Email và tên đăng nhập **không đổi được**.
* Tài khoản chưa đăng ký xong thì **không được dùng**; tài khoản đã hoàn tất **không bao giờ** bị xoá nhầm.
* Giao diện luôn tối "Kỳ Đài Cổ Phong"; **5 trạng thái** (thành công, đang tải, trống, lỗi, bị khoá có chú thích); dùng được từ **360 px**; chuẩn **WCAG 2.1 AA**; thông tin bí mật không nằm trong mã.

## Nguồn (đặc tả)

BA mục 1.1, 1.2, 1.4, 1.5, 1.8, 10.1, 10.3, 10.4; `docs/01` nhóm A (US-AUTH-01 đến 05 và US-AUTH-07) và nhóm H (US-UI-03 đến 06); `DANH-MUC` các màn hình đăng nhập, đăng ký, cài đặt hồ sơ, thanh điều hướng; `docs/04` mục 2 và 3; `docs/05` cổng GATE-OTP, kịch bản D1, yêu cầu NFR-03, 04, 06.

## Kết quả khi Epic xong

Chạy trên hai trình duyệt: (1) An đăng ký đủ ba bước bằng mã OTP thật tới email thật, vào được Sảnh; (2) An đăng xuất rồi đăng nhập lại (có và không "Ghi nhớ"); (3) An sửa tên hiển thị, tên có từ cấm bị từ chối; (4) người đăng ký dở không dùng được ứng dụng và không bị kẹt email; (5) mọi màn hình hiện đúng khi tải chậm, trống, lỗi và dùng được trên điện thoại.

## Bắt đầu khi (phụ thuộc)

T-01 mở kho mã và công cụ chung; T-03 chuẩn bị dịch vụ xác thực. Từng phần tài khoản dùng hợp đồng T-02, schema T-04, khung máy chủ T-06 và web T-07; không chờ giao diện toàn dự án xong mới làm đăng nhập.

**Quan hệ phụ thuộc áp dụng cho Task, không cho toàn bộ Epic theo tên.** Các phần làm sau bản chơi được nhận T-34 PASS; chỉ Epic/Story có đủ tiêu chí và bằng chứng mới Done.

## Kiểm thử Epic

Kịch bản demo D1: đăng ký ba bước bằng OTP thật và vào Sảnh; kiểm thêm đăng nhập, hồ sơ, đăng xuất, phục hồi đăng ký dở, 5 trạng thái, 360 px, bàn phím.

## Điều kiện hoàn thành (PASS khi)

* Mọi Story của Epic đạt (mọi dòng trong bảng tiêu chí đều đạt, 5 trạng thái giao diện đúng).
* Kịch bản kiểm thử Epic ở trên chạy được trên hai trình duyệt thật, dữ liệu và màn hình khớp nhau.
* Không còn lỗi mức Cao hoặc Nghiêm trọng thuộc Epic.

## Bằng chứng nộp

Báo cáo demo kịch bản tương ứng (video hoặc báo cáo Playwright), bảng tiêu chí của các Story đã điền kết quả, danh sách lỗi có bước tái hiện; ghi bản dựng và môi trường, che bí mật.

## Rủi ro / điểm chưa rõ

Hạn mức thư OTP (khoảng 2 thư/giờ); giới hạn nhập sai chỉ gần đúng; chưa biết có chặn được đổi email ở hệ thống đăng nhập; cần khoá OAuth Google do nhóm tự tạo; nếu hệ thống đăng nhập tự liên kết cùng email thì luồng Google bị chặn (GATE-GOOGLE).

## Task của Epic (liên kết dưới Epic)

* `T-01` — Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động (Sprint 1)
* `T-02` — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ (Sprint 1)
* `T-03` — Cấu hình Supabase: gửi mã OTP đăng ký và đăng nhập Google (Sprint 1)
* `T-04` — Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập (Sprint 1)
* `T-06` — Dựng khung máy chủ: nhận kết nối có xác thực và chuyển lệnh (Sprint 1)
* `T-07` — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo) (Sprint 1)
* `T-09` — Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ (Sprint 1)
* `T-13` — Máy chủ: đăng ký bước 1 và 2 (kiểm tra tên đăng nhập, gửi mã OTP) (Sprint 1)
* `T-17` — Máy chủ: đăng nhập, quản lý phiên và hồ sơ (Sprint 1)
* `T-18` — Máy chủ: đăng ký bước 3 (xác minh mã, hoàn tất tài khoản) (Sprint 1)
* `T-21` — Giao diện: đăng ký ba bước, đăng nhập, hồ sơ, đăng xuất (Sprint 2)
* `T-22` — Thử nghiệm OTP thật và đăng nhập Google; chặn người chưa hoàn tất đăng ký và chặn đổi email (Sprint 2)
* `T-25` — Nối web với máy chủ: đăng ký, đăng nhập, hồ sơ (Sprint 2)
* `T-42` — Máy chủ: tác vụ định kỳ dọn và phục hồi tài khoản đăng ký dở (Sprint 3)
* `T-60` — Giao diện: đủ 5 trạng thái cho mọi màn hình; tính năng chưa làm hiển thị đúng quy tắc (Sprint 4)
* `T-61` — Giao diện: dùng được từ 360 px và bằng cảm ứng; trợ năng (Sprint 4)

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Tưởng Lê khoa Cường-4572**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-10-05**; Due date **2026-11-04**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/02-epic.md` — E-01.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Tưởng Lê khoa Cường-4572**.
* Assignee Epic điều phối phạm vi và thu bằng chứng; không có nghĩa tự triển khai toàn bộ Task. Epic được gán Sprint 4 theo yêu cầu PO để thể hiện mốc nghiệm thu cuối, các Task con vẫn thực hiện ở Sprint 1–4 theo tiền đề.

**Story và Task thuộc Epic:**

* [S-01 — XIAN-9](https://xiangqi-web.atlassian.net/browse/XIAN-9)
* [S-02 — XIAN-10](https://xiangqi-web.atlassian.net/browse/XIAN-10)
* [S-03 — XIAN-11](https://xiangqi-web.atlassian.net/browse/XIAN-11)
* [S-04 — XIAN-12](https://xiangqi-web.atlassian.net/browse/XIAN-12)
* [T-01 — XIAN-35](https://xiangqi-web.atlassian.net/browse/XIAN-35)
* [T-02 — XIAN-36](https://xiangqi-web.atlassian.net/browse/XIAN-36)
* [T-03 — XIAN-37](https://xiangqi-web.atlassian.net/browse/XIAN-37)
* [T-04 — XIAN-38](https://xiangqi-web.atlassian.net/browse/XIAN-38)
* [T-06 — XIAN-40](https://xiangqi-web.atlassian.net/browse/XIAN-40)
* [T-07 — XIAN-41](https://xiangqi-web.atlassian.net/browse/XIAN-41)
* [T-09 — XIAN-43](https://xiangqi-web.atlassian.net/browse/XIAN-43)
* [T-13 — XIAN-47](https://xiangqi-web.atlassian.net/browse/XIAN-47)
* [T-17 — XIAN-51](https://xiangqi-web.atlassian.net/browse/XIAN-51)
* [T-18 — XIAN-52](https://xiangqi-web.atlassian.net/browse/XIAN-52)
* [T-21 — XIAN-55](https://xiangqi-web.atlassian.net/browse/XIAN-55)
* [T-22 — XIAN-56](https://xiangqi-web.atlassian.net/browse/XIAN-56)
* [T-25 — XIAN-59](https://xiangqi-web.atlassian.net/browse/XIAN-59)
* [T-42 — XIAN-76](https://xiangqi-web.atlassian.net/browse/XIAN-76)
* [T-60 — XIAN-94](https://xiangqi-web.atlassian.net/browse/XIAN-94)
* [T-61 — XIAN-95](https://xiangqi-web.atlassian.net/browse/XIAN-95)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

Phạm vi liên quan: T-03, T-13, T-18, T-21, T-22, T-25, T-42, T-17, T-29, T-31, T-49, T-51, T-54, T-57, T-60, T-09, T-55, T-07, T-12, T-61, T-63, T-01, T-02, T-04, T-06. Tổng giờ công tham chiếu **186.5**; mỗi Task chỉ cộng một lần trong phạm vi này. Epic là khoảng bao trùm các phần triển khai, tích hợp và nghiệm thu cuối; thanh Epic giao nhau không đồng nghĩa tất cả Task bên trong chạy đồng thời. Không nhập giờ riêng cho Epic. Các tiêu chí nghiệm thu phải được kiểm thật, hiện vẫn NOT_RUN.

**Cách đọc ngày của Epic:** các Task trực tiếp thuộc Epic dự kiến triển khai từ **2026-10-05 14:00** đến **2026-11-01 10:00**. Thanh Epic còn bao gồm các Task dùng chung phục vụ Story; Due date **2026-11-04** là mốc hoàn tất phạm vi liên quan, không gán chung hạn nộp. Hạn phát hành/bàn giao toàn MVP vẫn 05/11. Trong khoảng thanh Epic dài có thời gian chờ đầu vào hoặc chờ kiểm; không suy ra làm liên tục hay chạy đồng thời cả Epic.

---

# EPIC 2 — Tạo phòng chơi

**Jira thực:** [XIAN-2](https://xiangqi-web.atlassian.net/browse/XIAN-2) · **Loại:** Epic · **Assignee:** Võ Thành Đông · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** không gán cho Epic · **Priority:** High · **Nhãn:** `P1`, `loi`, `xiangqi-mvp-20261005`, `e-02`
**Ước lượng:** không cộng giờ riêng; tổng Task liên quan chỉ để tham chiếu · **Story Points:** để trống · **Start date:** 2026-10-08 · **Due date:** 2026-10-31 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Giai đoạn:** các Task trực tiếp thuộc phần lõi; hoàn tất mọi Story còn cần phần liên kết ngoài Epic (Sảnh PUBLIC và giao diện đầy đủ ở Sprint sau).

## Mục tiêu và giá trị (Epic này làm gì)

Cho người chơi **tạo phòng**, **vào phòng** bằng mã hoặc từ Sảnh, **ngồi ghế**, bấm **Sẵn sàng** và **bắt đầu ván**; kèm thanh điều hướng và trang chính (Sảnh).

## Yêu cầu được giao

Tạo phòng (room) chơi game

## Ai dùng

Chủ phòng và người chơi vào phòng.

## Gồm những việc lớn nào (mỗi việc là một Story)

* Story 5 — Tạo phòng
* Story 6 — Thanh điều hướng và Sảnh
* Story 7 — Phòng chờ, hai ghế ngồi, Sẵn sàng và bắt đầu ván
* Story 8 — Vào phòng bằng mã, đường dẫn hoặc từ Sảnh

## Phạm vi

* **Có:** các Story ở trên.
* **Không:** Mời bạn bè và gửi đường dẫn (Epic Mời bạn), kiểu phòng công khai/khoá và quản lý người xem (Epic Phòng công khai), đi quân và luật chơi, chat, camera/micro, ghép đối thủ ngẫu nhiên, đánh hạng, mã QR.
* **P2 (có trong đặc tả nhưng không làm ở giai đoạn này):** Ghép ngẫu nhiên, đánh hạng, xin đổi bên, tái đấu, mã QR (P2).

## Các quy tắc quan trọng

* Phòng mới luôn **CODE_ONLY**; Host mở PUBLIC sau trong Cài đặt phòng. Phòng có **2 ghế**; chủ phòng ngồi ghế Đỏ; mã phòng 8 ký tự. Giờ 5, 10 hoặc 15 phút mỗi bên (mặc định 10); giờ và số người xem **không đổi** sau khi tạo. Tên phòng 1–60 ký tự, không từ cấm.
* **Mỗi người một chỗ chơi cùng lúc** (một ghế hoặc một ván với máy). Tạo tối đa 5 phòng/10 phút; nhập sai mã phòng 10 lần/phút thì bị chặn 5 phút.
* Ván bắt đầu khi cả hai Sẵn sàng, đếm 3 giây; ai bỏ Sẵn sàng thì huỷ đếm. Mất mạng trong đếm huỷ/reset cả hai Sẵn sàng và giữ ghế 60 giây; chưa tạo ván không ghi thua.
* Mọi quyết định do **máy chủ** làm.

## Nguồn (đặc tả)

BA mục 2.0, 2.1, 2.3, 2.7, 2.8; `docs/01` US-ROOM-01, 02, 03, 05, 12 và US-UI-01, 02; `DANH-MUC` Sảnh, hộp tạo phòng, phòng chờ, màn từ chối; `docs/05` kịch bản D2, D6.

## Kết quả khi Epic xong

Hai máy: An tạo phòng ngồi ghế Đỏ; Bình nhập mã vào ngồi ghế Đen; cả hai bấm Sẵn sàng, sau 3 giây ván bắt đầu với thế cờ ban đầu, lượt Đỏ; nếu Bình bỏ Sẵn sàng giữa lúc đếm thì không có ván; người đang có chỗ chơi khác không tạo được phòng; phòng đầy thì người vào bị từ chối kèm lý do.

## Bắt đầu khi (phụ thuộc)

UI T-10/T-11 nhận hợp đồng T-02 và web T-07; máy chủ phòng T-15/T-19 nhận schema T-04, máy chủ T-06 và cơ chế T-09. Ghép thật T-28 đợi đăng nhập T-25 và Sẵn sàng T-23; khởi tạo ván dùng thế bàn T-05.

**Quan hệ phụ thuộc áp dụng cho Task, không cho toàn bộ Epic theo tên.** Các phần làm sau bản chơi được nhận T-34 PASS; chỉ Epic/Story có đủ tiêu chí và bằng chứng mới Done.

## Kiểm thử Epic

Kịch bản demo D2 và phần Sẵn sàng của D6: tạo phòng, vào phòng, ngồi ghế, đếm 3 giây, bắt đầu ván.

## Điều kiện hoàn thành (PASS khi)

* Mọi Story của Epic đạt (mọi dòng trong bảng tiêu chí đều đạt, 5 trạng thái giao diện đúng).
* Kịch bản kiểm thử Epic ở trên chạy được trên hai trình duyệt thật, dữ liệu và màn hình khớp nhau.
* Không còn lỗi mức Cao hoặc Nghiêm trọng thuộc Epic.

## Bằng chứng nộp

Báo cáo demo kịch bản tương ứng (video hoặc báo cáo Playwright), bảng tiêu chí của các Story đã điền kết quả, danh sách lỗi có bước tái hiện; ghi bản dựng và môi trường, che bí mật.

## Rủi ro / điểm chưa rõ

Hai người tranh ghế cuối; trạng thái một chỗ chơi phải nhất quán với ván máy và bạn bè.

## Task của Epic (liên kết dưới Epic)

* `T-10` — Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng (Sprint 1)
* `T-11` — Giao diện: phòng chờ và màn từ chối vào phòng (Sprint 1)
* `T-15` — Máy chủ: trạng thái phòng, mỗi người một chỗ chơi và tạo phòng (Sprint 1)
* `T-19` — Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh (Sprint 1)
* `T-23` — Máy chủ: chọn ghế, Sẵn sàng, đếm 3 giây, bắt đầu ván (Sprint 2)
* `T-28` — Nối web với máy chủ: tạo phòng, vào phòng, ghế, Sẵn sàng, bắt đầu ván (Sprint 2)

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Võ Thành Đông**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-10-08**; Due date **2026-10-31**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/02-epic.md` — E-02.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Võ Thành Đông**.
* Assignee Epic điều phối phạm vi và thu bằng chứng; không có nghĩa tự triển khai toàn bộ Task. Epic được gán Sprint 4 theo yêu cầu PO để thể hiện mốc nghiệm thu cuối, các Task con vẫn thực hiện ở Sprint 1–4 theo tiền đề.

**Story và Task thuộc Epic:**

* [S-05 — XIAN-13](https://xiangqi-web.atlassian.net/browse/XIAN-13)
* [S-06 — XIAN-14](https://xiangqi-web.atlassian.net/browse/XIAN-14)
* [S-07 — XIAN-15](https://xiangqi-web.atlassian.net/browse/XIAN-15)
* [S-08 — XIAN-16](https://xiangqi-web.atlassian.net/browse/XIAN-16)
* [T-10 — XIAN-44](https://xiangqi-web.atlassian.net/browse/XIAN-44)
* [T-11 — XIAN-45](https://xiangqi-web.atlassian.net/browse/XIAN-45)
* [T-15 — XIAN-49](https://xiangqi-web.atlassian.net/browse/XIAN-49)
* [T-19 — XIAN-53](https://xiangqi-web.atlassian.net/browse/XIAN-53)
* [T-23 — XIAN-57](https://xiangqi-web.atlassian.net/browse/XIAN-57)
* [T-28 — XIAN-62](https://xiangqi-web.atlassian.net/browse/XIAN-62)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

Phạm vi liên quan: T-10, T-15, T-28, T-39, T-26, T-33, T-43, T-46, T-60, T-11, T-19, T-23, T-32, T-44. Tổng giờ công tham chiếu **78.5**; mỗi Task chỉ cộng một lần trong phạm vi này. Epic là khoảng bao trùm các phần triển khai, tích hợp và nghiệm thu cuối; thanh Epic giao nhau không đồng nghĩa tất cả Task bên trong chạy đồng thời. Không nhập giờ riêng cho Epic. Các tiêu chí nghiệm thu phải được kiểm thật, hiện vẫn NOT_RUN.

**Cách đọc ngày của Epic:** các Task trực tiếp thuộc Epic dự kiến triển khai từ **2026-10-08 09:00** đến **2026-10-15 10:30**. Thanh Epic còn bao gồm các Task dùng chung phục vụ Story; Due date **2026-10-31** là mốc hoàn tất phạm vi liên quan, không gán chung hạn nộp. Hạn phát hành/bàn giao toàn MVP vẫn 05/11. Trong khoảng thanh Epic dài có thời gian chờ đầu vào hoặc chờ kiểm; không suy ra làm liên tục hay chạy đồng thời cả Epic.

---

# EPIC 3 — Mời bạn vào phòng chơi

**Jira thực:** [XIAN-3](https://xiangqi-web.atlassian.net/browse/XIAN-3) · **Loại:** Epic · **Assignee:** 4841_Lê Thị Xuân Nhạn · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** không gán cho Epic · **Priority:** Medium · **Nhãn:** `P1`, `loi`, `mo-rong`, `xiangqi-mvp-20261005`, `e-03`
**Ước lượng:** không cộng giờ riêng; tổng Task liên quan chỉ để tham chiếu · **Story Points:** để trống · **Start date:** 2026-10-08 · **Due date:** 2026-10-31 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Giai đoạn:** phần lõi là mời bằng **mã phòng và đường dẫn**, do hộp chia sẻ phòng và việc vào phòng bằng mã/đường dẫn của Epic Tạo phòng chơi đảm nhận (xem Story 9); phần mở rộng (Task của Epic này) gồm kết bạn, danh sách bạn, mời bạn đang online và chuyển hướng sau đăng nhập khi bấm đường dẫn mời.

## Mục tiêu và giá trị (Epic này làm gì)

Cho người chơi **mời người khác vào phòng**: gửi **đường dẫn** hoặc **mã phòng**, người được mời bấm đường dẫn rồi đăng nhập là **vào đúng phòng**; và có **hệ thống bạn bè** để **mời bạn đang online** ngay trong phòng.

## Yêu cầu được giao

Mời bạn vào phòng chơi game (ngay trong game, gửi link, mã phòng…)

## Ai dùng

Người đang ngồi ghế (mời) và người được mời.

## Gồm những việc lớn nào (mỗi việc là một Story)

* Story 9 — Chia sẻ phòng bằng đường dẫn và mã; người được mời đăng nhập xong vào đúng phòng
* Story 10 — Kết bạn: tìm người, gửi và trả lời lời mời, giới hạn
* Story 11 — Danh sách bạn và trạng thái
* Story 12 — Mời bạn đang online vào phòng

## Phạm vi

* **Có:** các Story ở trên.
* **Không:** Nhắn tin 1-1, thách đấu, điểm Elo, mã QR (P2).
* **P2 (có trong đặc tả nhưng không làm ở giai đoạn này):** Nhắn tin 1-1 (BA 5.2), thách đấu, điểm Elo, mã QR (BA 2.2).

## Các quy tắc quan trọng

* Đường dẫn và mã cho **cùng một quyền**; chỉ người đang ngồi ghế mở được hộp thoại mời. Khoá phòng thì mã và đường dẫn cũ vô hiệu.
* Kết bạn: tìm theo tên đăng nhập (không hiện email); lời mời hết hạn sau 30 ngày; bị cùng một người từ chối 2 lần thì không gửi lại được; tối đa **200 bạn** và **50 lời mời đang chờ**.
* Trạng thái bạn: Online, Đang đấu (đang giữ ghế hoặc chơi với máy), Ngoại tuyến. Chỉ bạn Online mới mời được.
* Mời vào phòng **chỉ có trong hộp thoại mời của phòng**; thông báo đếm lùi **30 giây**; lời mời **không giữ chỗ**, máy chủ kiểm lại mọi điều kiện khi bấm Tham gia.

## Nguồn (đặc tả)

BA mục 2.4, 2.5, 2.8, 5.5; `docs/01` US-ROOM-04, US-AUTH-06, US-FRIEND-01 đến 05; `DANH-MUC` hộp chia sẻ phòng, màn bạn bè; `docs/05` kịch bản D3.

## Kết quả khi Epic xong

An tạo phòng, gửi đường dẫn cho Bình đang chưa đăng nhập; Bình đăng nhập xong vào đúng phòng. An kết bạn với Chi, mời Chi đang online; Chi bấm Tham gia và vào đúng chỗ. Chi đang chơi với máy thì không nhận được lời mời; rời ván máy xong thì nhận được. Vượt giới hạn bạn bị chặn ở máy chủ.

## Bắt đầu khi (phụ thuộc)

Chia sẻ mã/link dùng phòng T-15/T-19 và UI T-11. Bạn bè dùng sổ vị trí T-15 và máy chủ T-06/T-09; tích hợp mời T-52 đợi UI T-40, bạn bè T-41, mời T-45, điều khiển phòng T-46 và ván AI T-31. Chuyển hướng T-54 kiểm phiên/vị trí trước link mời.

**Quan hệ phụ thuộc áp dụng cho Task, không cho toàn bộ Epic theo tên.** Các phần làm sau bản chơi được nhận T-34 PASS; chỉ Epic/Story có đủ tiêu chí và bằng chứng mới Done.

## Kiểm thử Epic

Kịch bản demo D3: gửi đường dẫn và mã, mời bạn online, vào đúng phòng; kiểm giới hạn bạn bè.

## Điều kiện hoàn thành (PASS khi)

* Mọi Story của Epic đạt (mọi dòng trong bảng tiêu chí đều đạt, 5 trạng thái giao diện đúng).
* Kịch bản kiểm thử Epic ở trên chạy được trên hai trình duyệt thật, dữ liệu và màn hình khớp nhau.
* Không còn lỗi mức Cao hoặc Nghiêm trọng thuộc Epic.

## Bằng chứng nộp

Báo cáo demo kịch bản tương ứng (video hoặc báo cáo Playwright), bảng tiêu chí của các Story đã điền kết quả, danh sách lỗi có bước tái hiện; ghi bản dựng và môi trường, che bí mật.

## Rủi ro / điểm chưa rõ

Lời mời không được giữ chỗ; trạng thái Đang đấu cần sổ chỗ chơi từ phòng và ván máy.

## Task của Epic (liên kết dưới Epic)

* `T-40` — Giao diện: bạn bè (tìm, lời mời, danh sách, mời vào phòng) (Sprint 3)
* `T-41` — Máy chủ: kết bạn, lời mời và danh sách bạn có trạng thái (Sprint 3)
* `T-45` — Máy chủ: mời bạn đang online vào phòng (Sprint 3)
* `T-52` — Nối web với máy chủ: bạn bè (Sprint 4)
* `T-54` — Nối web với máy chủ: bấm đường dẫn mời, đăng nhập rồi vào đúng phòng (Sprint 4)

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **4841_Lê Thị Xuân Nhạn**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-10-08**; Due date **2026-10-31**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/02-epic.md` — E-03.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **4841_Lê Thị Xuân Nhạn**.
* Assignee Epic điều phối phạm vi và thu bằng chứng; không có nghĩa tự triển khai toàn bộ Task. Epic được gán Sprint 4 theo yêu cầu PO để thể hiện mốc nghiệm thu cuối, các Task con vẫn thực hiện ở Sprint 1–4 theo tiền đề.

**Story và Task thuộc Epic:**

* [S-09 — XIAN-17](https://xiangqi-web.atlassian.net/browse/XIAN-17)
* [S-10 — XIAN-18](https://xiangqi-web.atlassian.net/browse/XIAN-18)
* [S-11 — XIAN-19](https://xiangqi-web.atlassian.net/browse/XIAN-19)
* [S-12 — XIAN-20](https://xiangqi-web.atlassian.net/browse/XIAN-20)
* [T-40 — XIAN-74](https://xiangqi-web.atlassian.net/browse/XIAN-74)
* [T-41 — XIAN-75](https://xiangqi-web.atlassian.net/browse/XIAN-75)
* [T-45 — XIAN-79](https://xiangqi-web.atlassian.net/browse/XIAN-79)
* [T-52 — XIAN-86](https://xiangqi-web.atlassian.net/browse/XIAN-86)
* [T-54 — XIAN-88](https://xiangqi-web.atlassian.net/browse/XIAN-88)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

Phạm vi liên quan: T-11, T-15, T-19, T-43, T-46, T-54, T-60, T-40, T-41, T-52, T-45. Tổng giờ công tham chiếu **59**; mỗi Task chỉ cộng một lần trong phạm vi này. Epic là khoảng bao trùm các phần triển khai, tích hợp và nghiệm thu cuối; thanh Epic giao nhau không đồng nghĩa tất cả Task bên trong chạy đồng thời. Không nhập giờ riêng cho Epic. Các tiêu chí nghiệm thu phải được kiểm thật, hiện vẫn NOT_RUN.

**Cách đọc ngày của Epic:** các Task trực tiếp thuộc Epic dự kiến triển khai từ **2026-10-20 09:00** đến **2026-10-28 15:30**. Thanh Epic còn bao gồm các Task dùng chung phục vụ Story; Due date **2026-10-31** là mốc hoàn tất phạm vi liên quan, không gán chung hạn nộp. Hạn phát hành/bàn giao toàn MVP vẫn 05/11. Trong khoảng thanh Epic dài có thời gian chờ đầu vào hoặc chờ kiểm; không suy ra làm liên tục hay chạy đồng thời cả Epic.

---

# EPIC 4 — Khởi tạo bàn cờ

**Jira thực:** [XIAN-4](https://xiangqi-web.atlassian.net/browse/XIAN-4) · **Loại:** Epic · **Assignee:** TÌNH 4851_NGUYỄN NGỌC · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** không gán cho Epic · **Priority:** High · **Nhãn:** `P1`, `loi`, `mo-rong`, `xiangqi-mvp-20261005`, `e-04`
**Ước lượng:** không cộng giờ riêng; tổng Task liên quan chỉ để tham chiếu · **Story Points:** để trống · **Start date:** 2026-10-05 · **Due date:** 2026-11-01 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Giai đoạn:** phần lõi gồm T-05, T-08, T-12, T-16, T-20; phần mở rộng gồm T-53.

## Mục tiêu và giá trị (Epic này làm gì)

**Khởi tạo và hiển thị bàn cờ**: viết **luật cờ tướng** thành một gói dùng chung (máy chủ, trình duyệt và máy cờ cùng dùng), dựng **bàn cờ trên màn hình** đúng thế khởi đầu cho cả hai phe, và cho người chơi **chọn quân, kéo thả, thấy nước vừa đi, nhận cảnh báo chiếu, nghe âm thanh**.

## Yêu cầu được giao

Load bàn cờ (khởi tạo bàn cờ)

## Ai dùng

Người chơi và người xem (nhìn thấy bàn cờ); nhóm làm máy cờ và ván online (dùng gói luật).

## Gồm những việc lớn nào (mỗi việc là một Story)

* Story 13 — Thấy bàn cờ và quân cờ
* Story 14 — Tương tác với quân cờ: chọn, kéo thả, đánh dấu nước đi, cảnh báo chiếu, âm thanh

## Phạm vi

* **Có:** các Story ở trên.
* **Không:** Đi lại, gợi ý nước hay, xuất và xem lại ván, giao diện sáng (P2). Đồng hồ và kết thúc ván thuộc Epic Hai người đánh cờ qua mạng.
* **P2 (có trong đặc tả nhưng không làm ở giai đoạn này):** Đi lại (BA 3.2), gợi ý nước (BA 6.1), xuất ván FEN/PGN (BA 9.1), giao diện sáng.

## Các quy tắc quan trọng

* Đen ở trên (y=0), Đỏ ở dưới (y=9), **Đỏ đi trước**; người cầm Đen thấy bàn lật nhưng dữ liệu gốc không đổi.
* Luật viết **một lần** dùng chung. Hết nước đi là **thua**; hoà khi lặp thế lần ba (không bên nào chiếu liên tục) hoặc 120 nửa nước không ăn quân; chiếu hết được xét trước.
* Quân chỉ dùng **chữ Hán truyền thống**.
* Kiểm chứng luật bằng nguồn đối chiếu độc lập: số nước đi từ thế khởi đầu ở độ sâu 1–4 là 44, 1.920, 79.666, 3.290.240.

## Nguồn (đặc tả)

BA mục 3.1, 3.4, 10.4; `docs/01` US-BOARD-01 đến 05; `docs/02` mục 1 đến 7; `DANH-MUC` bàn cờ trong màn ván; `docs/05` mục 3 (kiểm thử luật) và cổng GATE-PERFT.

## Kết quả khi Epic xong

Từ thế khởi đầu, mọi nước đi sinh ra khớp nguồn đối chiếu độc lập; các thế chiếu hết, hết nước, lặp thế, 120 nửa nước cho kết quả đúng luật; trên trình duyệt bàn cờ đúng cho cả hai phe, bấm và kéo quân đều đi được, bị chiếu thì có cảnh báo, có âm thanh.

## Bắt đầu khi (phụ thuộc)

Luật T-05/T-08 cần kho công cụ T-01; UI bàn T-12 cần thế bàn T-05 và web T-07. Chọn/kéo quân nhận luật hợp lệ và UI bàn đã bàn giao. Không đợi toàn bộ Epic tài khoản xong.

**Quan hệ phụ thuộc áp dụng cho Task, không cho toàn bộ Epic theo tên.** Các phần làm sau bản chơi được nhận T-34 PASS; chỉ Epic/Story có đủ tiêu chí và bằng chứng mới Done.

## Kiểm thử Epic

Bộ kiểm thử luật tự động chạy xanh (đếm nước độc lập, thế mẫu, 1.000 ván ngẫu nhiên); trên trình duyệt kiểm bàn cờ hai phe, chọn, kéo thả, hiệu ứng, âm thanh.

## Điều kiện hoàn thành (PASS khi)

* Mọi Story của Epic đạt (mọi dòng trong bảng tiêu chí đều đạt, 5 trạng thái giao diện đúng).
* Kịch bản kiểm thử Epic ở trên chạy được trên hai trình duyệt thật, dữ liệu và màn hình khớp nhau.
* Không còn lỗi mức Cao hoặc Nghiêm trọng thuộc Epic.

## Bằng chứng nộp

Báo cáo demo kịch bản tương ứng (video hoặc báo cáo Playwright), bảng tiêu chí của các Story đã điền kết quả, danh sách lỗi có bước tái hiện; ghi bản dựng và môi trường, che bí mật.

## Rủi ro / điểm chưa rõ

Phông chữ Hán; độ đúng luật phải được kiểm bằng nguồn độc lập, không chỉ bằng mã của nhóm.

## Task của Epic (liên kết dưới Epic)

* `T-05` — Luật cờ: mô hình bàn cờ, thế khởi đầu, nước đi của từng loại quân (Sprint 1)
* `T-08` — Luật cờ: nước hợp lệ, chiếu, chiếu hết, hết nước, lặp thế, 120 nửa nước (Sprint 1)
* `T-12` — Giao diện: bàn cờ SVG, quân chữ Hán, lật bàn cho phe Đen (Sprint 1)
* `T-16` — Giao diện: bấm chọn quân và chấm gợi ý ô đi (Sprint 1)
* `T-20` — Giao diện: kéo thả quân, đánh dấu nước vừa đi, cảnh báo chiếu, âm thanh (Sprint 2)
* `T-53` — Kiểm thử luật cờ: đếm nước đi độc lập và bộ kiểm thử chạy tự động (Sprint 4)

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **TÌNH 4851_NGUYỄN NGỌC**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-10-05**; Due date **2026-11-01**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/02-epic.md` — E-04.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **TÌNH 4851_NGUYỄN NGỌC**.
* Assignee Epic điều phối phạm vi và thu bằng chứng; không có nghĩa tự triển khai toàn bộ Task. Epic được gán Sprint 4 theo yêu cầu PO để thể hiện mốc nghiệm thu cuối, các Task con vẫn thực hiện ở Sprint 1–4 theo tiền đề.

**Story và Task thuộc Epic:**

* [S-13 — XIAN-21](https://xiangqi-web.atlassian.net/browse/XIAN-21)
* [S-14 — XIAN-22](https://xiangqi-web.atlassian.net/browse/XIAN-22)
* [T-05 — XIAN-39](https://xiangqi-web.atlassian.net/browse/XIAN-39)
* [T-08 — XIAN-42](https://xiangqi-web.atlassian.net/browse/XIAN-42)
* [T-12 — XIAN-46](https://xiangqi-web.atlassian.net/browse/XIAN-46)
* [T-16 — XIAN-50](https://xiangqi-web.atlassian.net/browse/XIAN-50)
* [T-20 — XIAN-54](https://xiangqi-web.atlassian.net/browse/XIAN-54)
* [T-53 — XIAN-87](https://xiangqi-web.atlassian.net/browse/XIAN-87)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

Phạm vi liên quan: T-05, T-12, T-16, T-53, T-61, T-08, T-20, T-24. Tổng giờ công tham chiếu **60.5**; mỗi Task chỉ cộng một lần trong phạm vi này. Epic là khoảng bao trùm các phần triển khai, tích hợp và nghiệm thu cuối; thanh Epic giao nhau không đồng nghĩa tất cả Task bên trong chạy đồng thời. Không nhập giờ riêng cho Epic. Các tiêu chí nghiệm thu phải được kiểm thật, hiện vẫn NOT_RUN.

**Cách đọc ngày của Epic:** các Task trực tiếp thuộc Epic dự kiến triển khai từ **2026-10-05 17:00** đến **2026-10-29 14:30**. Thanh Epic còn bao gồm các Task dùng chung phục vụ Story; Due date **2026-11-01** là mốc hoàn tất phạm vi liên quan, không gán chung hạn nộp. Hạn phát hành/bàn giao toàn MVP vẫn 05/11. Trong khoảng thanh Epic dài có thời gian chờ đầu vào hoặc chờ kiểm; không suy ra làm liên tục hay chạy đồng thời cả Epic.

---

# EPIC 5 — Hai người đánh cờ qua mạng

**Jira thực:** [XIAN-5](https://xiangqi-web.atlassian.net/browse/XIAN-5) · **Loại:** Epic · **Assignee:** TÌNH 4851_NGUYỄN NGỌC · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** không gán cho Epic · **Priority:** High · **Nhãn:** `P1`, `loi`, `mo-rong`, `xiangqi-mvp-20261005`, `e-05`
**Ước lượng:** không cộng giờ riêng; tổng Task liên quan chỉ để tham chiếu · **Story Points:** để trống · **Start date:** 2026-10-06 · **Due date:** 2026-11-04 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Giai đoạn:** phần lõi gồm T-24, T-27, T-29, T-30, T-32; phần mở rộng gồm T-47, T-51, T-55, T-57.

## Mục tiêu và giá trị (Epic này làm gì)

Cho hai người **đánh một ván cờ qua mạng**: đi nước (hai trình duyệt luôn thấy cùng một thế cờ), đồng hồ chạy, kết thúc ván (chiếu hết, hết giờ, đầu hàng, xin hoà), xử lý khi rớt mạng và nối lại, và đăng xuất giữa ván. **Máy chủ quyết định mọi thứ**.

## Yêu cầu được giao

Hai người đánh cờ qua mạng (online)

## Ai dùng

Hai người chơi.

## Gồm những việc lớn nào (mỗi việc là một Story)

* Story 15 — Đi nước qua mạng và bảng nước đi
* Story 16 — Đồng hồ ván
* Story 17 — Kết thúc ván: kết quả, đầu hàng, xin hoà, lặp thế
* Story 18 — Rời phòng giữa ván, mất kết nối và kết nối lại

## Phạm vi

* **Có:** các Story ở trên.
* **Không:** Tái đấu, xem lại ván, đi lại, điều kiện xin hoà của đánh hạng, giờ "không giới hạn", Elo.
* **P2 (có trong đặc tả nhưng không làm ở giai đoạn này):** Tái đấu (BA 2.3 mục 7), xem lại ván, xin hoà của đánh hạng (BA 7.2), giờ không giới hạn.

## Các quy tắc quan trọng

* Lệnh gửi lại cùng mã chỉ có **một tác dụng**; lệnh dựa trên bản ván cũ bị từ chối; các lệnh của một ván xử lý **lần lượt**.
* Đồng hồ do **máy chủ** tính, không cộng giây; hết giờ thì thua. Xin hoà: một đề nghị mỗi lần, chờ 30 giây; bị từ chối phải đi thêm 5 nước mới xin lại.
* Rời giữa ván = đầu hàng. Mất kết nối: người chơi giữ chỗ **60 giây**; máy chủ khởi động lại thì ván **gián đoạn**.
* Hiệu năng: người xem nhận thế mới dưới **100 ms**; chịu **50 kết nối, 10 ván** cùng lúc.

## Nguồn (đặc tả)

BA mục 3.3, 3.5, 3.6, 8.3; `docs/01` US-PLAY-01 đến 08, 10, US-AUTH-05 (đăng xuất giữa ván); `DANH-MUC` màn ván, khung xin hoà, hộp xác nhận đầu hàng và rời phòng, hộp kết quả, lớp phủ mất kết nối; `docs/04` mục 4 đến 6; `docs/07` mục 3, 6; yêu cầu NFR-01, 02, 07; kịch bản D6, D9.

## Kết quả khi Epic xong

Hai trình duyệt thật: hai người đi nước luân phiên, thế cờ giống nhau ở mọi nước; đồng hồ đúng, hết giờ thì thua; đầu hàng và xin hoà đủ các nhánh; ngắt mạng một bên: nối lại trước 60 giây thì tiếp tục, quá thì thua; bảng nước đi đúng ký hiệu tiếng Việt.

## Bắt đầu khi (phụ thuộc)

Ván online nhận luật T-08, cơ chế lệnh T-09 và ván bắt đầu từ T-23. Ghép đi nước T-30 đợi UI T-24, máy chủ T-27 và phòng thật T-28; đồng hồ/kết quả T-32 đợi T-29/T-30. Phần phục hồi T-57 đợi xác thực và các dịch vụ phòng/ván có tên trong bảng 01.

**Quan hệ phụ thuộc áp dụng cho Task, không cho toàn bộ Epic theo tên.** Các phần làm sau bản chơi được nhận T-34 PASS; chỉ Epic/Story có đủ tiêu chí và bằng chứng mới Done.

## Kiểm thử Epic

Kịch bản demo D6 và D9: đánh đến chiếu hết, hết giờ, đầu hàng, xin hoà; ngắt mạng một bên 60 giây.

## Điều kiện hoàn thành (PASS khi)

* Mọi Story của Epic đạt (mọi dòng trong bảng tiêu chí đều đạt, 5 trạng thái giao diện đúng).
* Kịch bản kiểm thử Epic ở trên chạy được trên hai trình duyệt thật, dữ liệu và màn hình khớp nhau.
* Không còn lỗi mức Cao hoặc Nghiêm trọng thuộc Epic.

## Bằng chứng nộp

Báo cáo demo kịch bản tương ứng (video hoặc báo cáo Playwright), bảng tiêu chí của các Story đã điền kết quả, danh sách lỗi có bước tái hiện; ghi bản dựng và môi trường, che bí mật.

## Rủi ro / điểm chưa rõ

Chuỗi phụ thuộc dài nhất của dự án; yêu cầu dưới 100 ms chỉ đo được khi đã nối thật; lỗi ghi dữ liệu phải đóng băng đồng hồ.

## Task của Epic (liên kết dưới Epic)

* `T-24` — Giao diện ván: bàn cờ nối mạng, đồng hồ, nút, hộp kết quả, khung xin hoà (Sprint 2)
* `T-27` — Máy chủ: bộ xử lý lệnh của ván và xử lý nước đi (Sprint 2)
* `T-29` — Máy chủ: đồng hồ ván, kết thúc ván, đầu hàng, xin hoà (Sprint 2)
* `T-30` — Nối web với máy chủ: đi nước, đồng bộ thế cờ giữa hai trình duyệt (Sprint 2)
* `T-32` — Nối web với máy chủ: bắt đầu ván đầy đủ, đồng hồ, kết thúc ván, đầu hàng, xin hoà (Sprint 2)
* `T-47` — Bảng nước đi: ký hiệu tiếng Việt và hiển thị (Sprint 3)
* `T-51` — Máy chủ: rời phòng giữa ván, mất kết nối, giữ chỗ, kết nối lại, ván gián đoạn (Sprint 3)
* `T-55` — Đăng xuất giữa ván: xác nhận, đầu hàng, rời phòng rồi đăng xuất (Sprint 4)
* `T-57` — Nối web với máy chủ: mất kết nối, người xem, bảng nước đi, phòng khoá (Sprint 3)

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **TÌNH 4851_NGUYỄN NGỌC**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-10-06**; Due date **2026-11-04**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/02-epic.md` — E-05.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **TÌNH 4851_NGUYỄN NGỌC**.
* Assignee Epic điều phối phạm vi và thu bằng chứng; không có nghĩa tự triển khai toàn bộ Task. Epic được gán Sprint 4 theo yêu cầu PO để thể hiện mốc nghiệm thu cuối, các Task con vẫn thực hiện ở Sprint 1–4 theo tiền đề.

**Story và Task thuộc Epic:**

* [S-15 — XIAN-23](https://xiangqi-web.atlassian.net/browse/XIAN-23)
* [S-16 — XIAN-24](https://xiangqi-web.atlassian.net/browse/XIAN-24)
* [S-17 — XIAN-25](https://xiangqi-web.atlassian.net/browse/XIAN-25)
* [S-18 — XIAN-26](https://xiangqi-web.atlassian.net/browse/XIAN-26)
* [T-24 — XIAN-58](https://xiangqi-web.atlassian.net/browse/XIAN-58)
* [T-27 — XIAN-61](https://xiangqi-web.atlassian.net/browse/XIAN-61)
* [T-29 — XIAN-63](https://xiangqi-web.atlassian.net/browse/XIAN-63)
* [T-30 — XIAN-64](https://xiangqi-web.atlassian.net/browse/XIAN-64)
* [T-32 — XIAN-66](https://xiangqi-web.atlassian.net/browse/XIAN-66)
* [T-47 — XIAN-81](https://xiangqi-web.atlassian.net/browse/XIAN-81)
* [T-51 — XIAN-85](https://xiangqi-web.atlassian.net/browse/XIAN-85)
* [T-55 — XIAN-89](https://xiangqi-web.atlassian.net/browse/XIAN-89)
* [T-57 — XIAN-91](https://xiangqi-web.atlassian.net/browse/XIAN-91)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

Phạm vi liên quan: T-08, T-09, T-24, T-27, T-30, T-47, T-57, T-63, T-29, T-32, T-50, T-51, T-53, T-55. Tổng giờ công tham chiếu **131**; mỗi Task chỉ cộng một lần trong phạm vi này. Epic là khoảng bao trùm các phần triển khai, tích hợp và nghiệm thu cuối; thanh Epic giao nhau không đồng nghĩa tất cả Task bên trong chạy đồng thời. Không nhập giờ riêng cho Epic. Các tiêu chí nghiệm thu phải được kiểm thật, hiện vẫn NOT_RUN.

**Cách đọc ngày của Epic:** các Task trực tiếp thuộc Epic dự kiến triển khai từ **2026-10-13 09:30** đến **2026-10-28 09:30**. Thanh Epic còn bao gồm các Task dùng chung phục vụ Story; Due date **2026-11-04** là mốc hoàn tất phạm vi liên quan, không gán chung hạn nộp. Hạn phát hành/bàn giao toàn MVP vẫn 05/11. Trong khoảng thanh Epic dài có thời gian chờ đầu vào hoặc chờ kiểm; không suy ra làm liên tục hay chạy đồng thời cả Epic.

---

# EPIC 6 — Phòng công khai, khoá phòng và người xem

**Jira thực:** [XIAN-6](https://xiangqi-web.atlassian.net/browse/XIAN-6) · **Loại:** Epic · **Assignee:** nguyenhoangtungtuyhoa · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** không gán cho Epic · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `xiangqi-mvp-20261005`, `e-06`
**Ước lượng:** không cộng giờ riêng; tổng Task liên quan chỉ để tham chiếu · **Story Points:** để trống · **Start date:** 2026-10-08 · **Due date:** 2026-11-02 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Giai đoạn:** toàn bộ Epic thuộc phần mở rộng (làm sau khi bản chơi được đạt).

## Mục tiêu và giá trị (Epic này làm gì)

Cho chủ phòng **chọn ai được thấy và được vào phòng**: **công khai** (hiện ở Sảnh để mọi người vào xem), **chỉ vào bằng mã**, hoặc **khoá** (không ai mới vào được); cho **người xem** theo dõi ván trực tiếp (tối đa theo cài đặt phòng); và quản lý phòng: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng.

## Yêu cầu được giao

Mở công khai cho mọi người xem hai người đánh, hoặc khoá lại không cho ai vào, hoặc khoá nhưng có mã phòng để người khác vào xem

## Ai dùng

Chủ phòng, người chơi và người xem.

## Gồm những việc lớn nào (mỗi việc là một Story)

* Story 19 — Kiểu phòng, khoá phòng và danh sách phòng công khai
* Story 20 — Quản lý phòng: đổi chỗ, đuổi người xem, chủ phòng rời, sau ván
* Story 21 — Người xem theo dõi trực tiếp

## Phạm vi

* **Có:** các Story ở trên.
* **Không:** Xem lại ván, chat và camera cho người xem (Epic Chat, camera và micro).
* **P2 (có trong đặc tả nhưng không làm ở giai đoạn này):** Xem lại ván; camera/micro cho người xem (BA 4.1 cấm phát).

## Các quy tắc quan trọng

* Phòng có **tối đa 5 người xem** (mặc định 5, chọn 0–5; cài đặt không đổi sau khi tạo). Khoá chỉ bật được khi **đủ 2 người chơi**; khoá thì phòng biến khỏi Sảnh, người mới không vào được, người đang có mặt **giữ nguyên**; mất ghế **không** tự mở khoá.
* Người đang có mặt mất mạng vào lại được: người chơi **60 giây**, người xem **5 phút**.
* Danh sách Sảnh chỉ có phòng tự tạo PUBLIC còn mở, **tối đa 50**; Vào xem luôn là SPECTATOR, không chiếm ghế trống. Mục cũ vẫn kiểm lại quyền/sức chứa. Mời người xem xuống ghế cần Chấp nhận, không giữ ghế, thành công vẫn phải Sẵn sàng.
* Người xem **chỉ đọc**, không thấy kênh chat riêng; đuổi người xem thì bị chặn đến khi phòng đóng.

## Nguồn (đặc tả)

BA mục 2.7, 2.8, 4.1, 4.2, 4.3; `docs/01` US-ROOM-06 đến 11, US-PLAY-09; `DANH-MUC` hộp cài đặt phòng, hộp đuổi người xem, danh sách người xem; kịch bản D4, D5.

## Kết quả khi Epic xong

Hai máy: An tạo phòng cho tối đa 2 người xem; Bình ngồi ghế; Chi và Dũng vào xem, người thứ ba bị từ chối; An khoá phòng, Em dùng mã không vào được; mở lại thì có mã mới, mã cũ vô hiệu; An đuổi Chi, Chi bị chặn; người xem thấy ván trực tiếp và không thấy kênh riêng.

## Bắt đầu khi (phụ thuộc)

Quyền phòng T-43 nhận vào phòng T-19; đổi vai T-44 nhận Sẵn sàng T-23 và kiểu phòng T-43. Ghép thật T-46 đợi UI T-39, máy chủ T-43/T-44 và luồng phòng/ván T-28/T-32. Stream người xem T-50 nhận T-19/T-27/T-29/T-44.

**Quan hệ phụ thuộc áp dụng cho Task, không cho toàn bộ Epic theo tên.** Các phần làm sau bản chơi được nhận T-34 PASS; chỉ Epic/Story có đủ tiêu chí và bằng chứng mới Done.

## Kiểm thử Epic

Kịch bản demo D4 và D5: người xem thứ ba bị từ chối, khoá phòng chặn người mới, đuổi người xem, chủ phòng rời.

## Điều kiện hoàn thành (PASS khi)

* Mọi Story của Epic đạt (mọi dòng trong bảng tiêu chí đều đạt, 5 trạng thái giao diện đúng).
* Kịch bản kiểm thử Epic ở trên chạy được trên hai trình duyệt thật, dữ liệu và màn hình khớp nhau.
* Không còn lỗi mức Cao hoặc Nghiêm trọng thuộc Epic.

## Bằng chứng nộp

Báo cáo demo kịch bản tương ứng (video hoặc báo cáo Playwright), bảng tiêu chí của các Story đã điền kết quả, danh sách lỗi có bước tái hiện; ghi bản dựng và môi trường, che bí mật.

## Rủi ro / điểm chưa rõ

Người bị đuổi phải mất quyền thật; khoá phòng không được loại người đang có mặt.

## Task của Epic (liên kết dưới Epic)

* `T-39` — Giao diện: cài đặt phòng, đổi chỗ ghế/xem, danh sách người xem, xác nhận đuổi (Sprint 3)
* `T-43` — Máy chủ: kiểu phòng (công khai, chỉ mã, khoá) và danh sách phòng ở Sảnh (Sprint 3)
* `T-44` — Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng (Sprint 3)
* `T-46` — Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời (Sprint 3)
* `T-50` — Máy chủ: người xem theo dõi trực tiếp, lọc dữ liệu theo vai trò (Sprint 3)

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **nguyenhoangtungtuyhoa**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-10-08**; Due date **2026-11-02**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/02-epic.md` — E-06.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **nguyenhoangtungtuyhoa**.
* Assignee Epic điều phối phạm vi và thu bằng chứng; không có nghĩa tự triển khai toàn bộ Task. Epic được gán Sprint 4 theo yêu cầu PO để thể hiện mốc nghiệm thu cuối, các Task con vẫn thực hiện ở Sprint 1–4 theo tiền đề.

**Story và Task thuộc Epic:**

* [S-19 — XIAN-27](https://xiangqi-web.atlassian.net/browse/XIAN-27)
* [S-20 — XIAN-28](https://xiangqi-web.atlassian.net/browse/XIAN-28)
* [S-21 — XIAN-29](https://xiangqi-web.atlassian.net/browse/XIAN-29)
* [T-39 — XIAN-73](https://xiangqi-web.atlassian.net/browse/XIAN-73)
* [T-43 — XIAN-77](https://xiangqi-web.atlassian.net/browse/XIAN-77)
* [T-44 — XIAN-78](https://xiangqi-web.atlassian.net/browse/XIAN-78)
* [T-46 — XIAN-80](https://xiangqi-web.atlassian.net/browse/XIAN-80)
* [T-50 — XIAN-84](https://xiangqi-web.atlassian.net/browse/XIAN-84)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

Phạm vi liên quan: T-10, T-39, T-43, T-46, T-51, T-57, T-60, T-11, T-19, T-44, T-62, T-36, T-50, T-56. Tổng giờ công tham chiếu **104**; mỗi Task chỉ cộng một lần trong phạm vi này. Epic là khoảng bao trùm các phần triển khai, tích hợp và nghiệm thu cuối; thanh Epic giao nhau không đồng nghĩa tất cả Task bên trong chạy đồng thời. Không nhập giờ riêng cho Epic. Các tiêu chí nghiệm thu phải được kiểm thật, hiện vẫn NOT_RUN.

**Cách đọc ngày của Epic:** các Task trực tiếp thuộc Epic dự kiến triển khai từ **2026-10-20 13:30** đến **2026-10-24 10:00**. Thanh Epic còn bao gồm các Task dùng chung phục vụ Story; Due date **2026-11-02** là mốc hoàn tất phạm vi liên quan, không gán chung hạn nộp. Hạn phát hành/bàn giao toàn MVP vẫn 05/11. Trong khoảng thanh Epic dài có thời gian chờ đầu vào hoặc chờ kiểm; không suy ra làm liên tục hay chạy đồng thời cả Epic.

---

# EPIC 7 — Chat, camera và micro

**Jira thực:** [XIAN-7](https://xiangqi-web.atlassian.net/browse/XIAN-7) · **Loại:** Epic · **Assignee:** Nguyễn Minh Thư · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** không gán cho Epic · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `xiangqi-mvp-20261005`, `e-07`
**Ước lượng:** không cộng giờ riêng; tổng Task liên quan chỉ để tham chiếu · **Story Points:** để trống · **Start date:** 2026-10-08 · **Due date:** 2026-11-04 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Giai đoạn:** toàn bộ Epic thuộc phần mở rộng (làm sau khi bản chơi được đạt).

## Mục tiêu và giá trị (Epic này làm gì)

Cho người trong phòng **nhắn tin** (hai kênh: Riêng của hai người chơi, và Chung cho cả phòng gồm người xem) và cho hai người chơi **bật camera, micro** để thấy mặt, nghe tiếng nhau (qua dịch vụ LiveKit Cloud). Mọi thứ phải **đúng quyền**.

## Yêu cầu được giao

Hai người vừa đánh cờ vừa chat, có camera và micro; có kênh chat cho người xem tách riêng với chat của hai người đánh

## Ai dùng

Người chơi và người xem.

## Gồm những việc lớn nào (mỗi việc là một Story)

* Story 22 — Chat hai kênh, giới hạn tin nhắn và lọc từ cấm
* Story 23 — Camera và micro: người chơi bật, người xem chỉ xem
* Story 24 — Mở nhiều tab: tab mới tiếp quản

## Phạm vi

* **Có:** các Story ở trên.
* **Không:** Nhắn tin riêng giữa bạn bè, sticker, ghi hình hay ghi âm (P2).
* **P2 (có trong đặc tả nhưng không làm ở giai đoạn này):** Nhắn tin riêng giữa bạn bè, sticker (BA 5.1, 5.2); chat và camera của đánh hạng; hộp thoại chọn thiết bị khi mở nhiều tab.

## Các quy tắc quan trọng

* Kênh Riêng chỉ hai người ngồi ghế; Kênh Chung cho cả phòng; **người xem chỉ thấy Kênh Chung** (kênh chat của người xem tách riêng với chat của hai người đánh).
* Tin tối đa 200 ký tự, 5 tin/10 giây; từ cấm bị che `***` ở cả máy chủ và trình duyệt.
* Camera và micro **mặc định tắt**, bật tắt độc lập; **3 mức chia sẻ** (không chia sẻ / chỉ đối thủ / cả đối thủ và người xem). Người xem **không bao giờ được phát**. **Không ghi hình, ghi âm.**
* Mở tab cùng thiết bị: tab mới tiếp quản, tab cũ chỉ đọc/dừng thiết bị và tự reconnect không cướp quyền. Khác thiết bị đang chơi xử thua ngay theo Epic tài khoản. Máy tính có thể mở hai khung chat/đóng bớt; điện thoại dùng tab mặc định Riêng. Mức chia sẻ chọn sẵn Chỉ đối thủ, thiết bị vẫn Tắt; chủ động chọn mức 3 mới chia sẻ người xem.
* **Đã chốt:** đổi cặp người ngồi ghế thì người mới (và cả cặp mới) **không đọc** tin cũ của cặp trước.

## Nguồn (đặc tả)

BA mục 1.8 (nhiều tab), 4.1, 5.3, 5.4; `docs/01` US-CHAT-01, 02, US-MEDIA-01 đến 03; `DANH-MUC` khung chat, khung camera/micro; `docs/04` mục 7; cổng GATE-MEDIA; kịch bản D7.

## Kết quả khi Epic xong

Nhiều trình duyệt: hai người chat ở cả hai kênh; người xem chỉ thấy và gửi ở Kênh Chung và không nhận byte nào của Kênh Riêng; hai người bật camera và micro thấy và nghe nhau theo mức chia sẻ; đổi vai hoặc đuổi người xem thì mất quyền thật; mở tab mới thì tab cũ chỉ đọc; camera/micro hỏng không làm hỏng việc đi cờ và chat.

## Bắt đầu khi (phụ thuộc)

PoC LiveKit T-35 phải bàn giao kết luận quyền đủ dùng trước T-36/T-49; chat T-48 dùng cơ chế T-09, vào phòng T-19, đổi vai T-44. T-56/T-59 ghép sau khi UI, máy chủ và sự kiện phòng thật đã sẵn sàng; không đợi toàn bộ Epic khác đóng mới viết UI với dữ liệu mẫu.

**Quan hệ phụ thuộc áp dụng cho Task, không cho toàn bộ Epic theo tên.** Các phần làm sau bản chơi được nhận T-34 PASS; chỉ Epic/Story có đủ tiêu chí và bằng chứng mới Done.

## Kiểm thử Epic

Kịch bản demo D7: chat hai kênh, camera/micro theo mức chia sẻ, người xem không phát; thử nghiệm quyền camera/micro độc lập.

## Điều kiện hoàn thành (PASS khi)

* Mọi Story của Epic đạt (mọi dòng trong bảng tiêu chí đều đạt, 5 trạng thái giao diện đúng).
* Kịch bản kiểm thử Epic ở trên chạy được trên hai trình duyệt thật, dữ liệu và màn hình khớp nhau.
* Không còn lỗi mức Cao hoặc Nghiêm trọng thuộc Epic.

## Bằng chứng nộp

Báo cáo demo kịch bản tương ứng (video hoặc báo cáo Playwright), bảng tiêu chí của các Story đã điền kết quả, danh sách lỗi có bước tái hiện; ghi bản dựng và môi trường, che bí mật.

## Rủi ro / điểm chưa rõ

Có thể vượt hạn mức miễn phí của dịch vụ camera/micro; quyền cũ phải bị thu hồi thật.

## Task của Epic (liên kết dưới Epic)

* `T-35` — Thử nghiệm LiveKit Cloud: camera/micro theo từng người, thu hồi quyền (Sprint 3)
* `T-36` — Giao diện: camera/micro, bật tắt độc lập, mức chia sẻ, thông báo quyền và lỗi (Sprint 3)
* `T-48` — Máy chủ: chat hai kênh, quyền đọc, giới hạn tin, lọc từ cấm (Sprint 3)
* `T-49` — Máy chủ: cấp quyền camera/micro theo vai và mở nhiều tab (tab mới tiếp quản) (Sprint 3)
* `T-56` — Giao diện chat hai kênh và nối web với máy chủ (Sprint 3)
* `T-59` — Nối camera/micro thật: theo đối tượng nhận, đổi vai, đuổi, tab (web, máy chủ, LiveKit) (Sprint 4)

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Nguyễn Minh Thư**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-10-08**; Due date **2026-11-04**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/02-epic.md` — E-07.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Nguyễn Minh Thư**.
* Assignee Epic điều phối phạm vi và thu bằng chứng; không có nghĩa tự triển khai toàn bộ Task. Epic được gán Sprint 4 theo yêu cầu PO để thể hiện mốc nghiệm thu cuối, các Task con vẫn thực hiện ở Sprint 1–4 theo tiền đề.

**Story và Task thuộc Epic:**

* [S-22 — XIAN-30](https://xiangqi-web.atlassian.net/browse/XIAN-30)
* [S-23 — XIAN-31](https://xiangqi-web.atlassian.net/browse/XIAN-31)
* [S-24 — XIAN-32](https://xiangqi-web.atlassian.net/browse/XIAN-32)
* [T-35 — XIAN-69](https://xiangqi-web.atlassian.net/browse/XIAN-69)
* [T-36 — XIAN-70](https://xiangqi-web.atlassian.net/browse/XIAN-70)
* [T-48 — XIAN-82](https://xiangqi-web.atlassian.net/browse/XIAN-82)
* [T-49 — XIAN-83](https://xiangqi-web.atlassian.net/browse/XIAN-83)
* [T-56 — XIAN-90](https://xiangqi-web.atlassian.net/browse/XIAN-90)
* [T-59 — XIAN-93](https://xiangqi-web.atlassian.net/browse/XIAN-93)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

Phạm vi liên quan: T-09, T-48, T-56, T-60, T-35, T-36, T-49, T-59, T-63. Tổng giờ công tham chiếu **91.5**; mỗi Task chỉ cộng một lần trong phạm vi này. Epic là khoảng bao trùm các phần triển khai, tích hợp và nghiệm thu cuối; thanh Epic giao nhau không đồng nghĩa tất cả Task bên trong chạy đồng thời. Không nhập giờ riêng cho Epic. Các tiêu chí nghiệm thu phải được kiểm thật, hiện vẫn NOT_RUN.

**Cách đọc ngày của Epic:** các Task trực tiếp thuộc Epic dự kiến triển khai từ **2026-10-20 09:00** đến **2026-10-29 14:30**. Thanh Epic còn bao gồm các Task dùng chung phục vụ Story; Due date **2026-11-04** là mốc hoàn tất phạm vi liên quan, không gán chung hạn nộp. Hạn phát hành/bàn giao toàn MVP vẫn 05/11. Trong khoảng thanh Epic dài có thời gian chờ đầu vào hoặc chờ kiểm; không suy ra làm liên tục hay chạy đồng thời cả Epic.

---

# EPIC 8 — Đánh với máy theo cấp độ

**Jira thực:** [XIAN-8](https://xiangqi-web.atlassian.net/browse/XIAN-8) · **Loại:** Epic · **Assignee:** TÌNH 4851_NGUYỄN NGỌC · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** không gán cho Epic · **Priority:** High · **Nhãn:** `P1`, `loi`, `mo-rong`, `xiangqi-mvp-20261005`, `e-08`
**Ước lượng:** không cộng giờ riêng; tổng Task liên quan chỉ để tham chiếu · **Story Points:** để trống · **Start date:** 2026-10-08 · **Due date:** 2026-10-31 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Giai đoạn:** phần lõi gồm T-14, T-26, T-31, T-33; phần mở rộng gồm T-37, T-38, T-58, T-62, T-63, T-64.

## Mục tiêu và giá trị (Epic này làm gì)

Cho người dùng **đánh cờ với máy** theo **từng cấp độ** (**Dễ, Trung bình, Khó**), tự chọn phe Đỏ, Đen hoặc ngẫu nhiên. Máy là chương trình **chạy riêng** khỏi máy chủ.

## Yêu cầu được giao

Người đánh với máy theo từng cấp độ của máy

## Ai dùng

Người chơi đã đăng nhập (một mình).

## Gồm những việc lớn nào (mỗi việc là một Story)

* Story 25 — Chọn cấp độ, chọn phe và máy đi nước đúng luật
* Story 26 — Kết thúc ván với máy, vào lại ván và sự cố máy cờ

## Phạm vi

* **Có:** các Story ở trên.
* **Không:** Gợi ý nước đi, đi lại, xin hoà, lưu lịch sử, tính điểm Elo (P2).
* **P2 (có trong đặc tả nhưng không làm ở giai đoạn này):** Đi lại với máy, lưu lịch sử ván máy (BA 6.2), bảng thông số máy (BA 9.2).

## Các quy tắc quan trọng

* Thời gian nghĩ tối đa: Dễ 300 ms, Trung bình 1.000 ms, Khó 3.000 ms. **Máy không bao giờ đi sai luật.**
* Ván với máy **không giới hạn thời gian** cho người chơi; không có xin hoà, không gợi ý nước.
* Đóng tab: giữ ván **30 phút**; chủ động rời hoặc đăng xuất thì đầu hàng ngay.
* Máy lỗi quá 10 giây → ván **Bỏ dở**, có nút **Thử lại** (ván mới cùng cấp, cùng phe đã bốc).
* Phải đạt tiêu chuẩn chất lượng máy cờ: thời gian suy nghĩ đạt ngưỡng (95% lần đo nhanh hơn mức quy định), tỷ lệ thắng cấp cao ≥ 75%, 1.000 ván không lỗi; cấp Khó đúng 100% bộ chiếu hết 1–2 nước bắt buộc đã xác minh đáp án (bộ mở rộng báo riêng).

## Nguồn (đặc tả)

BA mục 6.1, 6.3; `docs/01` US-AI-01 đến 04; `docs/02` mục 9; `DANH-MUC` hộp chọn cấp độ và phe, màn đánh với máy; `docs/05` cổng GATE-AI; kịch bản D8, D10.

## Kết quả khi Epic xong

Người chơi chọn Khó và phe Đen, máy đi trước, bàn lật; đánh đến chiếu hết hoặc đầu hàng, hộp kết quả chỉ có Rời phòng; đóng tab rồi vào lại trước 30 phút thấy đúng thế, sau 30 phút là Bỏ dở; giết tiến trình máy thì báo sự cố và Thử lại tạo ván mới; báo cáo đo máy cờ đủ số liệu.

## Bắt đầu khi (phụ thuộc)

Máy cờ T-14 dùng luật T-08; UI T-26 dùng khung web T-07 và bàn T-20. Máy chủ AI T-31 nhận máy cờ T-14, vị trí chơi T-15, phiên T-17 và xử lý ván T-27. T-33 ghép sau T-26/T-31; chất lượng cuối do T-58, không lấy bản sơ bộ thay báo cáo đầy đủ.

**Quan hệ phụ thuộc áp dụng cho Task, không cho toàn bộ Epic theo tên.** Các phần làm sau bản chơi được nhận T-34 PASS; chỉ Epic/Story có đủ tiêu chí và bằng chứng mới Done.

## Kiểm thử Epic

Kịch bản demo D8 và D10: ba cấp độ, vào lại trong 30 phút; báo cáo đo máy cờ (GATE-AI).

## Điều kiện hoàn thành (PASS khi)

* Mọi Story của Epic đạt (mọi dòng trong bảng tiêu chí đều đạt, 5 trạng thái giao diện đúng).
* Kịch bản kiểm thử Epic ở trên chạy được trên hai trình duyệt thật, dữ liệu và màn hình khớp nhau.
* Không còn lỗi mức Cao hoặc Nghiêm trọng thuộc Epic.

## Bằng chứng nộp

Báo cáo demo kịch bản tương ứng (video hoặc báo cáo Playwright), bảng tiêu chí của các Story đã điền kết quả, danh sách lỗi có bước tái hiện; ghi bản dựng và môi trường, che bí mật.

## Rủi ro / điểm chưa rõ

Chất lượng máy cờ (thời gian suy nghĩ, sức mạnh, độ ổn định) chỉ kết luận sau bài đo đầy đủ; không đạt thì ghi số thật và báo PO.

## Task của Epic (liên kết dưới Epic)

* `T-14` — Máy cờ: chương trình chạy riêng, ba cấp độ, thử nghiệm sơ bộ tốc độ (Sprint 2)
* `T-26` — Giao diện: chọn cấp và phe, màn ván với máy, thông báo sự cố (Sprint 2)
* `T-31` — Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ (Sprint 2)
* `T-33` — Nối web, máy chủ và máy cờ thật: ván với máy (Sprint 2)
* `T-58` — Đo máy cờ đầy đủ (GATE-AI): tốc độ, độ sâu, sức mạnh, độ ổn định (Sprint 4)

---

# Task chung của dự án (không thuộc Epic nào, nhãn `chung`)

* `T-37` — Dựng khung kiểm thử tự động trên nhiều trình duyệt (Playwright) (Sprint 3)
* `T-38` — Chọn nơi chạy ứng dụng và dựng bản demo trên mạng (Sprint 3)
* `T-62` — Nghiệm thu từng tiêu chí P1 (MVP) và chạy kịch bản demo D1–D10 (Sprint 4)
* `T-63` — Nghiệm thu phi chức năng: bài tải, quyền camera/micro, trình duyệt, bảo mật (Sprint 4)
* `T-64` — Chuẩn bị demo, sửa lỗi cuối, kiểm lại và bàn giao bằng chứng (Sprint 4)

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **TÌNH 4851_NGUYỄN NGỌC**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-10-08**; Due date **2026-10-31**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/02-epic.md` — E-08.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **TÌNH 4851_NGUYỄN NGỌC**.
* Assignee Epic điều phối phạm vi và thu bằng chứng; không có nghĩa tự triển khai toàn bộ Task. Epic được gán Sprint 4 theo yêu cầu PO để thể hiện mốc nghiệm thu cuối, các Task con vẫn thực hiện ở Sprint 1–4 theo tiền đề.

**Story và Task thuộc Epic:**

* [S-25 — XIAN-33](https://xiangqi-web.atlassian.net/browse/XIAN-33)
* [S-26 — XIAN-34](https://xiangqi-web.atlassian.net/browse/XIAN-34)
* [T-14 — XIAN-48](https://xiangqi-web.atlassian.net/browse/XIAN-48)
* [T-26 — XIAN-60](https://xiangqi-web.atlassian.net/browse/XIAN-60)
* [T-31 — XIAN-65](https://xiangqi-web.atlassian.net/browse/XIAN-65)
* [T-33 — XIAN-67](https://xiangqi-web.atlassian.net/browse/XIAN-67)
* [T-58 — XIAN-92](https://xiangqi-web.atlassian.net/browse/XIAN-92)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

Phạm vi liên quan: T-14, T-26, T-31, T-33, T-58, T-60, T-10, T-55. Tổng giờ công tham chiếu **70.5**; mỗi Task chỉ cộng một lần trong phạm vi này. Epic là khoảng bao trùm các phần triển khai, tích hợp và nghiệm thu cuối; thanh Epic giao nhau không đồng nghĩa tất cả Task bên trong chạy đồng thời. Không nhập giờ riêng cho Epic. Các tiêu chí nghiệm thu phải được kiểm thật, hiện vẫn NOT_RUN.

**Cách đọc ngày của Epic:** các Task trực tiếp thuộc Epic dự kiến triển khai từ **2026-10-12 09:00** đến **2026-10-31 11:30**. Thanh Epic còn bao gồm các Task dùng chung phục vụ Story; Due date **2026-10-31** là mốc hoàn tất phạm vi liên quan, không gán chung hạn nộp. Hạn phát hành/bàn giao toàn MVP vẫn 05/11. Trong khoảng thanh Epic dài có thời gian chờ đầu vào hoặc chờ kiểm; không suy ra làm liên tục hay chạy đồng thời cả Epic.

---
