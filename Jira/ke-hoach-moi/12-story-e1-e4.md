# Story của các Epic: "Đăng ký và đăng nhập (kèm nền tảng dự án)"; "Tạo phòng chơi"; "Mời bạn vào phòng chơi"; "Khởi tạo bàn cờ" (14 Story)

**Ngày cập nhật:** 2026-10-05 · **Trạng thái:** đã được PO cho phép tạo và phân công ngày 05/10/2026 · Đã tạo Epic/Story/Task trên XIAN · Viết theo `00-chuan-description.md` và mẫu `00b`.

**Cách đọc:** mỗi Story là một việc người dùng muốn làm, viết theo mẫu Story đầy đủ: câu chuyện; nguồn (mã đặc tả); phạm vi có/không; điều kiện để dùng; bắt đầu khi; các bước; quy tắc; khi có lỗi; năm trạng thái giao diện; **bảng tiêu chí chấp nhận đối chiếu từng tiêu chí của đặc tả (có cách kiểm và Task kiểm)**; điều kiện hoàn thành; điểm còn mở; bằng chứng; liên kết. Task nằm dưới Epic và được liên kết với Story bằng quan hệ "liên quan". Mã `AC-…`, `US-…` chỉ là mã đặc tả để truy vết, không phải số Jira.

---

### Story 1 — Đăng ký tài khoản qua ba bước hoặc bằng Google

**Jira thực:** [XIAN-9](https://xiangqi-web.atlassian.net/browse/XIAN-9) · **Loại:** Story · **Assignee:** Tưởng Lê khoa Cường-4572 · **Sprint:** XIAN Sprint 3 · **Fix version:** v0.3
**Components:** Authentication, Frontend · **Priority:** High · **Nhãn:** `P1`, `loi`, `mo-rong`, `US-AUTH-01`, `US-AUTH-02`, `US-AUTH-03`, `US-AUTH-07`, `xiangqi-mvp-20261005`, `s-01`
**Ước lượng:** không cộng giờ riêng; tổng Task liên quan chỉ để tham chiếu · **Story Points:** để trống · **Start date:** 2026-10-05 · **Due date:** 2026-10-20 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Đăng ký và đăng nhập (kèm nền tảng dự án) · **Components:** Authentication, Frontend
**Giai đoạn:** Phần lõi liên kết T-03, T-13, T-18, T-21, T-22, T-25. Phần làm sau/kiểm đầy đủ liên kết T-42. Cả hai đều P1; nhãn không đổi phạm vi MVP.

**Câu chuyện:** Là người mới, tôi muốn đăng ký qua ba bước bằng email/OTP hoặc xác thực Google rồi thiết lập tên đăng nhập và mật khẩu, để có một tài khoản dùng được ứng dụng và đăng nhập lại về sau.

**Nguồn (đặc tả)**

* US-AUTH-01 — Đăng ký bước 1: username và mật khẩu (BA 1.1, 1.4)
* US-AUTH-02 — Đăng ký bước 2: email và gửi OTP (BA 1.1, 1.5)
* US-AUTH-03 — Đăng ký bước 3: xác thực OTP, tạo tài khoản (BA 1.1, 1.5)
* Tiêu chí gốc ở `docs/01-yeu-cau-chi-tiet.md`: AC-AUTH-01-01, AC-AUTH-01-02, AC-AUTH-01-03, AC-AUTH-01-04, AC-AUTH-02-01, AC-AUTH-02-02, AC-AUTH-02-03, AC-AUTH-03-01, AC-AUTH-03-02, AC-AUTH-03-03, AC-AUTH-03-04, AC-AUTH-03-05, AC-AUTH-03-06, AC-AUTH-07-01, AC-AUTH-07-03, AC-AUTH-07-04, AC-AUTH-07-06.
* Màn hình và thành phần giao diện (`DANH-MUC-MAN-HINH-XIANGQI.md`): Màn hình Đăng ký (ba bước) (`SCR-REGISTER`).

**Nhu cầu và phạm vi**

* **Có:** Đăng ký bằng Google (chạy thật): bấm nút Google → màn thiết lập tên đăng nhập và mật khẩu dự phòng → Hoàn tất (không OTP); Đăng ký bước 1: username và mật khẩu; Đăng ký bước 2: email và gửi OTP; Đăng ký bước 3: xác thực OTP, tạo tài khoản.
* **Không:** đăng nhập thường ngày (Story 2); quên mật khẩu; đăng nhập bằng Google ở lần sau (Story 2); đổi tên đăng nhập hoặc email sau này.

**Điều kiện để dùng:** chưa đăng nhập; đang ở màn hình đăng ký.

**Bắt đầu khi (phụ thuộc)**
Bắt đầu từng Task khi đầu vào của **chính Task đó** đã bàn giao; không chờ toàn bộ Epic khác hoàn tất. Các phần triển khai chính nhận:

* **T-01 — Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động**.
* **T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ**.
* **T-04 — Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập**.
* **T-06 — Dựng khung máy chủ: nhận kết nối có xác thực và chuyển lệnh**.
* **T-07 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)**.
* **T-17 — Máy chủ: đăng nhập, quản lý phiên và hồ sơ**.
* **T-34 — Nghiệm thu bản chơi được: đăng ký, tạo phòng, mời, đánh online và đánh với máy chạy trọn**.

Các Task triển khai/kiểm bổ sung ở bảng tiêu chí có tiền đề riêng tại Description của Task và bảng 01. Ready for Test chưa phải Done; Task đo/báo cáo Done nhưng kết luận không đạt không làm Story đạt.

**Các bước người dùng làm và hệ thống phản hồi**

1. **Thanh tiến trình ba bước** luôn hiện ở đầu màn hình đăng ký: "1. Tài khoản" → "2. Email" → "3. Xác thực OTP".
2. **Chọn tên đăng nhập và mật khẩu.** Người dùng gõ tên đăng nhập; sau khi ngừng gõ khoảng 0,3 giây, hệ thống báo "dùng được", "đã có người dùng" hoặc "không hợp lệ". Người dùng gõ mật khẩu và gõ lại ở ô xác nhận. Khi cả hai hợp lệ, nút **Tiếp tục** sáng; bấm thì sang bước tiếp theo. Phía dưới nút Tiếp tục có nút **Đăng ký bằng Google** (hoạt động). Bấm nút này: sau khi Google xác thực, người dùng sang **màn thiết lập tài khoản** (ảnh và email Google chỉ đọc; nhập tên đăng nhập, mật khẩu và xác nhận; **không có OTP**, **không có nút đóng**), bấm **Hoàn tất thiết lập** thì tài khoản được tạo với tên hiển thị = tên đăng nhập (không dùng họ tên Google) và vào thẳng Sảnh. Thoát giữa chừng thì chưa có tài khoản. Email đã đăng ký thì báo "Email này đã được đăng ký", không tự gộp.
3. **Nhập email.** Người dùng nhập email chính chủ và bấm **Xác nhận Email** (có nút **Quay lại** về bước 1). Hệ thống gửi **mã OTP 6 chữ số** tới email đó rồi chuyển sang bước nhập mã. Nếu chưa nhận được thư, người dùng bấm **Gửi lại mã** khi hết đếm ngược.
4. **Nhập mã OTP.** Màn hình báo "Mã OTP 6 số đã được gửi đến email …" và hiện **6 ô nhập mã riêng**, tự nhảy sang ô kế khi gõ, kèm **đồng hồ đếm lùi 3 phút**. Người dùng nhập mã 6 số trong vòng 3 phút. Hệ thống kiểm tra mã, kiểm lại tên đăng nhập, tạo tài khoản (tên hiển thị mặc định bằng tên đăng nhập), tự đăng nhập và đưa vào Sảnh.

**Các quy tắc**

* Tên đăng nhập 3 đến 20 ký tự, chỉ gồm chữ không dấu, chữ số và dấu gạch dưới; kiểm trùng **không phân biệt hoa thường** ("Twot" và "twot" là một). Mật khẩu từ 8 ký tự trở lên và ô xác nhận phải giống.
* Hai bước đầu **chưa tạo tài khoản nào** và **chưa giữ chỗ** tên đăng nhập; tên báo "dùng được" ở bước 1 vẫn được kiểm lại ở bước cuối vì người khác có thể lấy mất.
* Email đã có tài khoản hoàn tất thì báo "Email này đã được đăng ký" và **không gửi** mã. Email mới, hoặc chỉ có bản đăng ký dở trước đó, thì được gửi mã.
* Nút **Gửi lại mã** mờ trong **60 giây** sau mỗi lần gửi, có đếm ngược và chú thích lý do. Mã OTP hết hạn sau **180 giây**.
* Nhập sai nhiều lần thì bị chặn (mức giới hạn của dịch vụ xác thực chỉ **gần đúng**, không đếm chính xác từng mã); người dùng phải chờ hoặc gửi lại mã.
* **Tài khoản chưa hoàn tất đăng ký thì không được dùng ứng dụng.** Nếu quy trình bị dừng giữa chừng sau khi đã ghi hồ sơ, tài khoản vẫn bị chặn cho đến khi được phục hồi; tài khoản đã hoàn tất không bao giờ bị xoá nhầm.
* Tài khoản đăng ký dở bị dọn định kỳ (mỗi 5 phút; chưa hoàn tất quá 60 phút thì bị xoá). Việc gửi lại, hoàn tất và dọn dẹp của cùng một người được xử lý **lần lượt**.

**Khi có lỗi**

* Tên đã có người dùng hoặc không hợp lệ: báo ngay tại ô, không cho tiếp tục. Máy chủ lỗi khi kiểm tên: báo lỗi, **không** báo "dùng được" giả.
* Mật khẩu dưới 8 ký tự hoặc hai ô khác nhau: báo lỗi ở ô, nút Tiếp tục mờ.
* Email sai dạng: báo ngay, không gửi. Dịch vụ gửi thư hết hạn mức hoặc lỗi: báo lỗi thật, **không** báo "đã gửi".
* Mã sai: báo sai. Mã hết hạn: báo hết hạn và mời gửi lại.
* Tên đăng nhập vừa bị người khác lấy trong lúc chờ nhập mã: báo lỗi và **quay về bước chọn tên**.
* Quy trình dừng đột ngột: tài khoản dở không dùng được; gửi lại cùng email thì dùng lại bản dở; không để kẹt email.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**

| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
| --- | --- | --- | --- | --- | --- |
| Màn hình Đăng ký (ba bước) | Hoàn tất OTP và hồ sơ mới cho vào | Gửi/xác minh/hoàn tất từng bước | Bước chưa có dữ liệu hướng dẫn nhập | Trùng tên/email, sai/hết mã hoặc phục hồi chưa xong; ở đúng bước | Chưa hợp lệ, gửi lại chưa đủ 60 giây, đang xử lý |

**Tiêu chí chấp nhận và cách kiểm (đối chiếu từng tiêu chí của đặc tả)**

| Mã tiêu chí | Điều kiện đạt | Cách kiểm | Task kiểm |
| --- | --- | --- | --- |
| `AC-AUTH-01-01` | Tên đăng nhập đúng quy tắc (3–20 ký tự: chữ không dấu, số, gạch dưới) và chưa ai dùng thì ô hiện "hợp lệ". Việc kiểm trùng chạy sau khi ngừng gõ khoảng 0,3 giây. | Gõ tên 3, 20 ký tự (hợp lệ), 2, 21 ký tự, có dấu cách, có dấu tiếng Việt (không hợp lệ); quan sát thời điểm kiểm. | T-13, T-21, T-25 |
| `AC-AUTH-01-02` | Tên đã có người dùng (không phân biệt hoa thường, ví dụ Twot và twot) thì báo trùng và không cho đi tiếp. | Tạo sẵn tài khoản Twot rồi gõ twot. | T-13, T-21, T-25 |
| `AC-AUTH-01-03` | Mật khẩu dưới 8 ký tự, hoặc ô xác nhận không khớp, thì báo lỗi ngay tại ô và nút Tiếp tục không bấm được. | Gõ mật khẩu 7 ký tự; gõ hai ô khác nhau. | T-21 |
| `AC-AUTH-01-04` | Khi hợp lệ và bấm Tiếp tục thì sang bước 2; **chưa tạo bản ghi tài khoản nào**. | Đi hết bước 1 rồi bỏ dở; xem cơ sở dữ liệu không có hồ sơ mới. | T-13, T-21, T-25 |
| `AC-AUTH-02-01` | Email đã có tài khoản hoàn tất thì báo "Email này đã được đăng ký" và không gửi mã OTP. | Nhập email của tài khoản mẫu đã hoàn tất; kiểm hộp thư không có thư. | T-13, T-21, T-25 |
| `AC-AUTH-02-02` | Email hợp lệ và chưa dùng (hoặc chỉ có bản đăng ký dở) thì gửi mã OTP 6 chữ số và sang bước 3. | Nhập email thành viên nhóm; nhận thư mã 6 số. | T-03, T-13, T-25 |
| `AC-AUTH-02-03` | Nút Gửi lại mã mờ trong 60 giây kể từ lần gửi, có đếm ngược và chú thích nêu lý do. | Bấm gửi lại ngay, sau 59 giây và sau 61 giây. | T-13, T-21 |
| `AC-AUTH-03-01` | Nhập đúng mã trong 3 phút thì tài khoản được tạo, tên hiển thị = tên đăng nhập, tự đăng nhập và vào Sảnh. | Đăng ký đủ ba bước bằng OTP thật; kiểm hồ sơ và Sảnh. | T-18, T-25 |
| `AC-AUTH-03-02` | Mã quá 3 phút thì báo hết hạn và yêu cầu gửi lại. | Đợi quá 180 giây (hoặc đồng hồ giả) rồi nhập mã. | T-18, T-21 |
| `AC-AUTH-03-03` | Nhập sai mã thì báo sai; khi bị giới hạn nhập sai (mục tiêu 5 lần, thực thi gần đúng theo giới hạn của hệ thống xác thực) thì khoá biểu mẫu, bắt buộc chờ hoặc gửi lại mã. | Nhập sai liên tiếp tới khi bị giới hạn; ghi số lần thực tế. | T-18, T-21, T-22 |
| `AC-AUTH-03-04` | Bỏ dở trước khi xác minh thì chưa có hồ sơ dùng được và tên đăng nhập không bị giữ; gửi lại cùng email dùng lại bản dở. Nếu tiến trình chết sau khi ghi hồ sơ thì tài khoản vẫn bị chặn cho đến khi phục hồi, không coi là đăng ký thành công. | Bỏ dở ở từng bước; làm dừng quy trình sau khi ghi hồ sơ; thử đăng nhập. | T-18, T-22, T-42 |
| `AC-AUTH-03-05` | Có thời điểm hoàn tất nhưng còn cờ "đang chờ": phục hồi chỉ bỏ cờ, không xoá tài khoản. Chưa có thời điểm hoàn tất: dọn sau thời hạn. Việc gửi lại, hoàn tất và dọn của cùng một người xử lý lần lượt; không xoá tài khoản vừa hoàn tất. | Chạy tác vụ dọn hai lần với hồ sơ đã hoàn tất còn cờ; chạy dọn cùng lúc hoàn tất. | T-18, T-42 |
| `AC-AUTH-03-06` | Tên đăng nhập vừa bị người khác lấy trong lúc chờ nhập mã thì báo lỗi và quay về bước 1. | Hai người cùng chọn một tên; người sau nhập mã. | T-18, T-21 |
| `AC-AUTH-07-01` | Bấm Đăng ký bằng Google và xác thực xong thì sang màn thiết lập tên đăng nhập và mật khẩu, không có bước OTP; Hoàn tất thiết lập thì tạo tài khoản với tên hiển thị = tên đăng nhập và vào Sảnh. | Dùng tài khoản Google thử; đăng ký mới; xem hồ sơ. | T-18, T-21, T-22, T-25 |
| `AC-AUTH-07-03` | Email Google đã thuộc tài khoản khác thì báo "Email này đã được đăng ký", không tự gộp tài khoản. | Đăng ký Google bằng email đã đăng ký bằng mật khẩu. | T-18, T-22 |
| `AC-AUTH-07-04` | Bỏ dở hoặc Google từ chối/lỗi thì không có tài khoản ứng dụng hoàn tất; không tự đi tiếp vào Sảnh. Gửi hoàn tất trùng không tạo hai tài khoản; username bị chiếm trong lúc chờ phải báo để nhập lại. | Bỏ dở rồi làm lại; gửi hoàn tất hai lần; chiếm tên giữa chừng. | T-18, T-21, T-42 |
| `AC-AUTH-07-06` | Bản xác thực Google mới chưa hoàn tất onboarding bị dọn sau 60 phút, quét mỗi 5 phút khi dịch vụ hoạt động; chưa hoàn tất không được dùng ứng dụng. Hoàn tất và dọn đồng thời không xoá nhầm tài khoản đã hoàn tất hoặc tài khoản cũ; lỗi phụ thuộc phải phục hồi/thử lại, không báo đã dọn khi chưa thành công (BA 1.2, PO chọn A 05/10). | Google mới bỏ dở quá 60 phút; hoàn tất cùng lúc dọn; gây lỗi phụ thuộc và kiểm thử lại; đối chiếu tài khoản hoàn tất/cũ còn nguyên. | T-18, T-42 |

**Điều kiện hoàn thành (PASS khi)**

* Mọi dòng trong bảng tiêu chí ở trên đều **đạt**, có bằng chứng; dòng nào không đạt thì Story chưa xong.
* Mọi màn hình ở bảng 5 trạng thái đều hiện đúng cả 5 trạng thái (thành công, đang tải, trống, lỗi, bị khoá có chú thích).
* Các Task liên kết đều đã xong và đã được người kiểm thử và người xem lại mã đồng ý; các điều kiện chấp nhận được kiểm ở máy chủ, không chỉ ở giao diện.
* Không có lỗi mức Cao hoặc Nghiêm trọng còn mở thuộc Story này.

**Còn mở / chờ quyết định:** Cần khoá OAuth Google do nhóm tự tạo (Google Cloud); nếu hệ thống đăng nhập tự liên kết cùng email thì luồng Google bị chặn (GATE-GOOGLE), không tự gộp. Cách chặn đổi email ở hệ thống đăng nhập phụ thuộc kết quả thử nghiệm OTP thật; nếu không chặn được thì ghi "bị chặn" cho phần đó.

**Bằng chứng nộp:** trạng thái ban đầu là NOT_RUN (chưa chạy). Khi chạy, ghi bản dựng, môi trường, kết quả từng dòng (đạt / không đạt / bị chặn), ảnh hoặc nhật ký đã che bí mật.

**Quan hệ cần đối chiếu trên Jira:** Parent = Epic «Đăng ký và đăng nhập (kèm nền tảng dự án)»; relates to: T-03, T-13, T-18, T-21, T-22, T-25, T-42. Các Task có thể thuộc Epic khác; đây là liên kết triển khai/kiểm, không phải quan hệ cha–con với Story.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Tưởng Lê khoa Cường-4572**; Sprint **XIAN Sprint 3**; Fix version **v0.3**; Start date **2026-10-05**; Due date **2026-10-20**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/12-story-e1-e4.md` — S-01.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Tưởng Lê khoa Cường-4572**.
* Assignee Story phối hợp các Task và kiểm đủ tiêu chí chấp nhận. Story gán Sprint dự kiến hoàn tất toàn bộ phạm vi, không kéo sớm chỉ vì một Task con đã xong; không cộng trùng điểm Story và Task.
* Epic: [XIAN-1](https://xiangqi-web.atlassian.net/browse/XIAN-1).

**Task triển khai/kiểm liên quan:**

* [T-03 — XIAN-37](https://xiangqi-web.atlassian.net/browse/XIAN-37)
* [T-13 — XIAN-47](https://xiangqi-web.atlassian.net/browse/XIAN-47)
* [T-18 — XIAN-52](https://xiangqi-web.atlassian.net/browse/XIAN-52)
* [T-21 — XIAN-55](https://xiangqi-web.atlassian.net/browse/XIAN-55)
* [T-22 — XIAN-56](https://xiangqi-web.atlassian.net/browse/XIAN-56)
* [T-25 — XIAN-59](https://xiangqi-web.atlassian.net/browse/XIAN-59)
* [T-42 — XIAN-76](https://xiangqi-web.atlassian.net/browse/XIAN-76)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

Phạm vi liên quan: T-03, T-13, T-18, T-21, T-22, T-25, T-42. Tổng giờ công tham chiếu **34**; mỗi Task chỉ cộng một lần trong phạm vi này. Không nhập giờ riêng cho Story. Các tiêu chí nghiệm thu phải được kiểm thật, hiện vẫn NOT_RUN.

---

### Story 2 — Đăng nhập bằng tên đăng nhập và mật khẩu hoặc bằng Google

**Jira thực:** [XIAN-10](https://xiangqi-web.atlassian.net/browse/XIAN-10) · **Loại:** Story · **Assignee:** TÌNH 4851_NGUYỄN NGỌC · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** Authentication, Frontend · **Priority:** High · **Nhãn:** `P1`, `loi`, `mo-rong`, `US-AUTH-04`, `US-AUTH-07`, `xiangqi-mvp-20261005`, `s-02`
**Ước lượng:** không cộng giờ riêng; tổng Task liên quan chỉ để tham chiếu · **Story Points:** để trống · **Start date:** 2026-10-09 · **Due date:** 2026-10-31 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Đăng ký và đăng nhập (kèm nền tảng dự án) · **Components:** Authentication, Frontend
**Giai đoạn:** Phần lõi liên kết T-17, T-18, T-21, T-22, T-25, T-29, T-31. Phần làm sau/kiểm đầy đủ liên kết T-49, T-51, T-54, T-57, T-60. Cả hai đều P1; nhãn không đổi phạm vi MVP.

**Câu chuyện:** Là người đã có tài khoản, tôi muốn **đăng nhập** để vào chơi.

**Nguồn (đặc tả)**

* US-AUTH-04 — Đăng nhập bằng username và mật khẩu (BA 1.4, 1.8)
* Tiêu chí gốc ở `docs/01-yeu-cau-chi-tiet.md`: AC-AUTH-04-01, AC-AUTH-04-02, AC-AUTH-04-03, AC-AUTH-04-04, AC-AUTH-04-05, AC-AUTH-07-02, AC-AUTH-07-05, AC-AUTH-04-06, AC-AUTH-04-07.
* Màn hình và thành phần giao diện (`DANH-MUC-MAN-HINH-XIANGQI.md`): Màn hình Đăng nhập (`SCR-LOGIN`).

**Nhu cầu và phạm vi**

* **Có:** Đăng nhập bằng username và mật khẩu.
* **Có thêm:** Đăng nhập bằng Google (đã hoàn tất → Sảnh; chưa → màn thiết lập).
* **Không:** quên mật khẩu và đăng nhập khách (P2, nút/liên kết mờ "Sắp ra mắt").

**Điều kiện để dùng:** có tài khoản đã hoàn tất.

**Bắt đầu khi (phụ thuộc)**
Bắt đầu từng Task khi đầu vào của **chính Task đó** đã bàn giao; không chờ toàn bộ Epic khác hoàn tất. Các phần triển khai chính nhận:

* **T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ**.
* **T-03 — Cấu hình Supabase: gửi mã OTP đăng ký và đăng nhập Google**.
* **T-04 — Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập**.
* **T-06 — Dựng khung máy chủ: nhận kết nối có xác thực và chuyển lệnh**.
* **T-07 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)**.
* **T-09 — Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ**.
* **T-18 — Máy chủ: đăng ký bước 3 (xác minh mã, hoàn tất tài khoản)**.
* **T-22 — Thử nghiệm OTP thật và đăng nhập Google; chặn người chưa hoàn tất đăng ký và chặn đổi email**.

Các Task triển khai/kiểm bổ sung ở bảng tiêu chí có tiền đề riêng tại Description của Task và bảng 01. Ready for Test chưa phải Done; Task đo/báo cáo Done nhưng kết luận không đạt không làm Story đạt.

**Các bước người dùng làm và hệ thống phản hồi**

1. Người dùng nhập tên đăng nhập, mật khẩu; chọn hoặc bỏ "Ghi nhớ đăng nhập" (mặc định chọn).
2. Bấm Đăng nhập; vào Sảnh (hoặc vào đúng phòng nếu đến từ đường dẫn mời).
3. Hoặc bấm **Đăng nhập bằng Google**: tài khoản đã hoàn tất thì vào Sảnh (hoặc đúng phòng mời); email chưa đăng ký hoặc chưa thiết lập xong thì sang màn thiết lập và chưa dùng được ứng dụng. Sau khi thiết lập, cùng một tài khoản đăng nhập được bằng Google hoặc bằng tên và mật khẩu.

**Các quy tắc**

* Hạn phiên cố định; cùng thiết bị mở tab khác chỉ tiếp quản tab. Đăng nhập thiết bị khác giữa ván online/AI xử thua ngay và thiết bị mới về Sảnh. Hết phiên giữ 60 giây online/30 phút AI để cùng thiết bị đăng nhập lại. OTP email trực tiếp không đăng nhập ứng dụng.
* Đăng nhập sai chỉ báo **một thông báo chung** "Sai tên đăng nhập hoặc mật khẩu", không nói sai ô nào và **không lộ email**.
* "Ghi nhớ": phiên giữ **30 ngày**. Không ghi nhớ: hết khi đóng trình duyệt hoặc sau **12 giờ**.
* Sai 5 lần trong 15 phút thì khoá 15 phút.
* Nút đăng nhập khách và liên kết "Quên mật khẩu?" **mờ**, có chú thích "Sắp ra mắt"; nút đăng nhập/đăng ký bằng Google bấm được.
* Đăng nhập khi đang đăng nhập ở nơi khác thì **nơi mới tiếp quản** (nơi mới được dùng bình thường, nơi cũ bị hạ xuống); nơi cũ nhận thông báo và chuyển chỉ đọc.

**Khi có lỗi**
sai thông tin → thông báo chung; bị khoá → báo khoá tạm; phiên hết hạn hoặc bị thu hồi → về trang đăng nhập.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**

| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
| --- | --- | --- | --- | --- | --- |
| Màn hình Đăng nhập | Phiên hợp lệ vào Sảnh/đích mời | Đang xác thực, chặn gửi trùng | Form chưa nhập có hướng dẫn đăng nhập/đăng ký | Sai thông tin chung hoặc lỗi dịch vụ; cho sửa/thử lại | Form chưa hợp lệ; Guest và Quên mật khẩu: Sắp ra mắt |

**Tiêu chí chấp nhận và cách kiểm (đối chiếu từng tiêu chí của đặc tả)**

| Mã tiêu chí | Điều kiện đạt | Cách kiểm | Task kiểm |
| --- | --- | --- | --- |
| `AC-AUTH-04-01` | Đăng nhập đúng thì vào Sảnh (hoặc vào đúng phòng nếu đến từ đường dẫn mời). | Đăng nhập tài khoản mẫu, có và không đi từ đường dẫn mời. | T-17, T-21, T-25, T-54 |
| `AC-AUTH-04-02` | Sai tên hoặc mật khẩu thì chỉ báo chung "Sai tên đăng nhập hoặc mật khẩu", không nói sai ô nào và không lộ email. | Thử sai tên, sai mật khẩu; so hai thông báo. | T-17, T-21 |
| `AC-AUTH-04-03` | Ghi nhớ (mặc định tick): 30 ngày; không ghi nhớ: đóng trình duyệt hoặc 12 giờ, cái nào trước. Hạn tính cố định từ đăng nhập thành công (đăng ký mới: hoàn tất đăng ký); hoạt động, chuyển tab và refresh token không gia hạn; đăng nhập lại thực sự tạo hạn mới. Đóng riêng một tab chỉ theo mất kết nối. | Đăng nhập hai kiểu; đồng hồ giả 12 giờ và 30 ngày; đóng và mở lại trình duyệt. | T-17, T-21 |
| `AC-AUTH-04-04` | Nút Đăng nhập khách và liên kết Quên mật khẩu (màn đăng nhập) hiện mờ kèm chú thích "Sắp ra mắt"; nút Đăng nhập bằng Google và Đăng ký bằng Google bấm được. | Mở hai màn hình; rê chuột và dùng bàn phím vào từng mục; bấm hai nút Google. | T-21, T-60 |
| `AC-AUTH-04-05` | Đăng nhập thành công ở phiên mới trên thiết bị khác khi tài khoản đang chơi: xử thua ngay ván online/AI đang chạy, kết thúc và rời vị trí chơi, đăng xuất thiết bị cũ; thiết bị mới vào Sảnh, không tiếp tục ván và không chờ ân hạn. Ngoài ván không tạo kết quả thua. Mở tab trên cùng thiết bị theo US-MEDIA-03, không dùng luật thiết bị khác. | Trong online và AI, đăng nhập thật ở thiết bị khác: ván thua ngay/rời vị trí, nơi cũ đăng xuất và mất quyền, nơi mới ở Sảnh. Ngoài ván không tạo thua; mở tab cùng thiết bị không xử thua. | T-17, T-29, T-31, T-49, T-57 |
| `AC-AUTH-04-06` | Phiên đăng nhập chính thức hết hạn 12 giờ/30 ngày trong ván thì ngắt quyền điều khiển: online giữ 60 giây, đồng hồ vẫn chạy; AI giữ 30 phút. Đăng nhập lại đúng tài khoản trên cùng thiết bị trong hạn được tiếp tục; thiết bị khác áp dụng AC-AUTH-04-05; quá hạn theo BA 8.3/6.3. Làm mới token truy cập không tự coi là hết phiên; Đăng xuất chủ động vẫn theo BA 1.8. | Dùng đồng hồ kiểm thử hết phiên trong online/AI; đăng nhập lại cùng thiết bị trước/sau hạn; thử refresh token khi phiên còn hạn. | T-17, T-31, T-51, T-57 |
| `AC-AUTH-04-07` | Phiên OTP email trực tiếp của tài khoản đã hoàn tất không được dùng để đăng nhập ứng dụng; phiên đăng ký chỉ được vào sau hoàn tất luồng đăng ký hợp lệ; OTP khôi phục P2 chỉ cho xem Username sau xác minh và đặt lại mật khẩu nếu cần rồi về Đăng nhập, không tự cấp quyền dùng ứng dụng (BA 1.7, PO chốt 05/10). | Lấy OTP email trực tiếp của tài khoản hoàn tất gọi API/Socket; so với phiên đăng ký hợp lệ và đăng nhập mật khẩu/Google. | T-17, T-22, T-25 |
| `AC-AUTH-07-02` | Đăng nhập Google với danh tính đã hoàn tất thì vào Sảnh hoặc phòng mời theo ưu tiên phiên/vị trí chơi ở US-AUTH-06 và BA 1.8/2.4; chưa thiết lập thì vào onboarding, chưa được dùng chức năng ứng dụng. | Đăng nhập Google với tài khoản đã hoàn tất và với email mới. | T-17, T-21, T-22, T-25 |
| `AC-AUTH-07-05` | Sau thiết lập, đăng nhập được cả bằng Google lẫn bằng tên đăng nhập và mật khẩu, vào cùng một hồ sơ. | Đăng nhập hai cách rồi so mã người dùng. | T-17, T-18, T-22 |

**Điều kiện hoàn thành (PASS khi)**

* Mọi dòng trong bảng tiêu chí ở trên đều **đạt**, có bằng chứng; dòng nào không đạt thì Story chưa xong.
* Mọi màn hình ở bảng 5 trạng thái đều hiện đúng cả 5 trạng thái (thành công, đang tải, trống, lỗi, bị khoá có chú thích).
* Các Task liên kết đều đã xong và đã được người kiểm thử và người xem lại mã đồng ý; các điều kiện chấp nhận được kiểm ở máy chủ, không chỉ ở giao diện.
* Không có lỗi mức Cao hoặc Nghiêm trọng còn mở thuộc Story này.

**Còn mở / chờ quyết định:** Giới hạn đăng nhập sai (5 lần trong 15 phút, khoá 15 phút) là mức khởi đầu, nhóm có thể chỉnh sau khi đo.

**Bằng chứng nộp:** trạng thái ban đầu là NOT_RUN (chưa chạy). Khi chạy, ghi bản dựng, môi trường, kết quả từng dòng (đạt / không đạt / bị chặn), ảnh hoặc nhật ký đã che bí mật.

**Quan hệ cần đối chiếu trên Jira:** Parent = Epic «Đăng ký và đăng nhập (kèm nền tảng dự án)»; relates to: T-17, T-18, T-21, T-22, T-25, T-29, T-31, T-49, T-51, T-54, T-57, T-60. Các Task có thể thuộc Epic khác; đây là liên kết triển khai/kiểm, không phải quan hệ cha–con với Story.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **TÌNH 4851_NGUYỄN NGỌC**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-10-09**; Due date **2026-10-31**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/12-story-e1-e4.md` — S-02.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **TÌNH 4851_NGUYỄN NGỌC**.
* Assignee Story phối hợp các Task và kiểm đủ tiêu chí chấp nhận. Story gán Sprint dự kiến hoàn tất toàn bộ phạm vi, không kéo sớm chỉ vì một Task con đã xong; không cộng trùng điểm Story và Task.
* Epic: [XIAN-1](https://xiangqi-web.atlassian.net/browse/XIAN-1).

**Task triển khai/kiểm liên quan:**

* [T-17 — XIAN-51](https://xiangqi-web.atlassian.net/browse/XIAN-51)
* [T-18 — XIAN-52](https://xiangqi-web.atlassian.net/browse/XIAN-52)
* [T-21 — XIAN-55](https://xiangqi-web.atlassian.net/browse/XIAN-55)
* [T-22 — XIAN-56](https://xiangqi-web.atlassian.net/browse/XIAN-56)
* [T-25 — XIAN-59](https://xiangqi-web.atlassian.net/browse/XIAN-59)
* [T-29 — XIAN-63](https://xiangqi-web.atlassian.net/browse/XIAN-63)
* [T-31 — XIAN-65](https://xiangqi-web.atlassian.net/browse/XIAN-65)
* [T-49 — XIAN-83](https://xiangqi-web.atlassian.net/browse/XIAN-83)
* [T-51 — XIAN-85](https://xiangqi-web.atlassian.net/browse/XIAN-85)
* [T-54 — XIAN-88](https://xiangqi-web.atlassian.net/browse/XIAN-88)
* [T-57 — XIAN-91](https://xiangqi-web.atlassian.net/browse/XIAN-91)
* [T-60 — XIAN-94](https://xiangqi-web.atlassian.net/browse/XIAN-94)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

Phạm vi liên quan: T-17, T-18, T-21, T-22, T-25, T-29, T-31, T-49, T-51, T-54, T-57, T-60. Tổng giờ công tham chiếu **110.5**; mỗi Task chỉ cộng một lần trong phạm vi này. Không nhập giờ riêng cho Story. Các tiêu chí nghiệm thu phải được kiểm thật, hiện vẫn NOT_RUN.

---

### Story 3 — Hồ sơ cơ bản và đăng xuất

**Jira thực:** [XIAN-11](https://xiangqi-web.atlassian.net/browse/XIAN-11) · **Loại:** Story · **Assignee:** Tưởng Lê khoa Cường-4572 · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** Authentication, Frontend · **Priority:** High · **Nhãn:** `P1`, `loi`, `mo-rong`, `US-AUTH-05`, `xiangqi-mvp-20261005`, `s-03`
**Ước lượng:** không cộng giờ riêng; tổng Task liên quan chỉ để tham chiếu · **Story Points:** để trống · **Start date:** 2026-10-08 · **Due date:** 2026-10-28 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Đăng ký và đăng nhập (kèm nền tảng dự án) · **Components:** Authentication, Frontend
**Giai đoạn:** Phần lõi liên kết T-09, T-17, T-21, T-22, T-25. Phần làm sau/kiểm đầy đủ liên kết T-55. Cả hai đều P1; nhãn không đổi phạm vi MVP.

**Câu chuyện:** Là người dùng, tôi muốn **xem và đổi tên hiển thị** của mình và **đăng xuất** khi cần.

**Nguồn (đặc tả)**

* US-AUTH-05 — Hồ sơ cơ bản và đăng xuất (BA 1.4, 1.6)
* Tiêu chí gốc ở `docs/01-yeu-cau-chi-tiet.md`: AC-AUTH-05-01, AC-AUTH-05-02, AC-AUTH-05-03, AC-AUTH-05-04, AC-AUTH-05-05.
* Màn hình và thành phần giao diện (`DANH-MUC-MAN-HINH-XIANGQI.md`): Màn hình Cài đặt hồ sơ (`SCR-PROFILE-SETTINGS`), Hộp xác nhận Rời phòng khi đang đấu (`MODAL-CONFIRM-LEAVE`).

**Nhu cầu và phạm vi**

* **Có:** Hồ sơ cơ bản và đăng xuất.
* **Không:** đổi email, đổi tên đăng nhập, ảnh đại diện tuỳ chọn.

**Điều kiện để dùng:** đã đăng nhập.

**Bắt đầu khi (phụ thuộc)**
Bắt đầu từng Task khi đầu vào của **chính Task đó** đã bàn giao; không chờ toàn bộ Epic khác hoàn tất. Các phần triển khai chính nhận:

* **T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ**.
* **T-03 — Cấu hình Supabase: gửi mã OTP đăng ký và đăng nhập Google**.
* **T-04 — Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập**.
* **T-06 — Dựng khung máy chủ: nhận kết nối có xác thực và chuyển lệnh**.
* **T-07 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)**.
* **T-09 — Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ**.
* **T-18 — Máy chủ: đăng ký bước 3 (xác minh mã, hoàn tất tài khoản)**.
* **T-22 — Thử nghiệm OTP thật và đăng nhập Google; chặn người chưa hoàn tất đăng ký và chặn đổi email**.
* **T-29 — Máy chủ: đồng hồ ván, kết thúc ván, đầu hàng, xin hoà**.
* **T-31 — Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ**.
* **T-44 — Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng**.

Các Task triển khai/kiểm bổ sung ở bảng tiêu chí có tiền đề riêng tại Description của Task và bảng 01. Ready for Test chưa phải Done; Task đo/báo cáo Done nhưng kết luận không đạt không làm Story đạt.

**Các bước người dùng làm và hệ thống phản hồi**

1. Mở trang Hồ sơ; xem tên hiển thị, tên đăng nhập, email.
2. Sửa tên hiển thị, bấm lưu.
3. Bấm Đăng xuất; phiên bị xoá, về trang đăng nhập.

**Các quy tắc**

* Tên hiển thị 2 đến 30 ký tự (có dấu, có khoảng trắng); chứa từ cấm thì không lưu.
* **Tên đăng nhập và email hiển thị nhưng không sửa được** (nút đổi tên đăng nhập mờ "Sắp ra mắt").
* Ảnh đại diện luôn là chữ cái đầu của tên; không tải ảnh lên.
* **Đăng xuất khi đang trong ván:** có hộp xác nhận "đăng xuất sẽ xử thua"; đồng ý thì xử thua rồi rời phòng rồi mới đăng xuất; ván với máy thì huỷ ván. Bấm Huỷ thì giữ nguyên. Chỉ báo hoàn tất khi máy chủ đã nhận.
* Đóng tab hay mất mạng **không** phải chủ động đầu hàng; theo quy tắc giữ chỗ.

**Khi có lỗi**
tên không hợp lệ hoặc có từ cấm → báo lý do; đăng xuất giữa ván lỗi hoặc chưa rõ → giữ trạng thái chờ hoặc lỗi, kiểm lại bằng mã yêu cầu cũ, không tạo hai kết quả.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**

| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
| --- | --- | --- | --- | --- | --- |
| Màn hình Cài đặt hồ sơ | Lưu Display Name; P2 thêm chức năng đúng quyền | Tải/lưu hồ sơ | Ô nhập trống: hướng dẫn, không lưu rỗng | Từ cấm/lỗi lưu: giữ dữ liệu nhập và cho sửa | Email luôn khoá; đổi username P1; đang lưu |
| Hộp xác nhận Rời phòng khi đang đấu | Rời/Đăng xuất giữa ván xác nhận hậu quả | Đợi xử lý rời/đầu hàng | Không còn mục tiêu: đóng, về trạng thái hiện tại | Lỗi xử lý: giữ thông báo và kiểm lại với máy chủ | Đã xử lý hoặc không còn quyền điều khiển |

**Tiêu chí chấp nhận và cách kiểm (đối chiếu từng tiêu chí của đặc tả)**

| Mã tiêu chí | Điều kiện đạt | Cách kiểm | Task kiểm |
| --- | --- | --- | --- |
| `AC-AUTH-05-01` | Đổi tên hiển thị ở trang Hồ sơ: 2–30 ký tự (có dấu, có khoảng trắng); chứa từ cấm thì từ chối lưu kèm thông báo. | Lưu tên 1, 2, 30, 31 ký tự và tên có từ cấm. | T-09, T-17, T-21 |
| `AC-AUTH-05-02` | Tên đăng nhập và email hiển thị nhưng không sửa được (nút đổi tên đăng nhập mờ "Sắp ra mắt"; email luôn khoá). | Cố sửa trên giao diện và gửi thẳng yêu cầu thêm trường. | T-17, T-21, T-22 |
| `AC-AUTH-05-03` | Ảnh đại diện luôn là chữ cái đầu của tên hiển thị; không có tải ảnh lên. | Xem hồ sơ; tìm chức năng tải ảnh (không có). | T-21 |
| `AC-AUTH-05-04` | Đăng xuất khi không trong ván: rời phòng nếu còn ghế, xoá phiên, về trang đăng nhập. Đang đấu online hoặc ván với máy: hiện xác nhận hậu quả đầu hàng; huỷ thì giữ nguyên; đồng ý chỉ báo xong khi máy chủ đã nhận. | Đăng xuất ở phòng chờ, trong ván người, trong ván máy; thử Huỷ và Đồng ý. | T-21, T-25, T-55 |
| `AC-AUTH-05-05` | Nếu lệnh đăng xuất giữa ván lỗi hoặc chưa rõ đã nhận thì giữ trạng thái chờ hoặc lỗi và kiểm lại ván bằng cùng mã yêu cầu (mã riêng của lần bấm đó, giúp máy chủ nhận ra lệnh gửi trùng), không tạo hai kết quả. Đóng tab hay mất mạng vẫn theo thời gian chờ nối lại, không phải chủ động đầu hàng. | Mất phản hồi sau khi đồng ý rồi gửi lại; đóng tab giữa ván. | T-55 |

**Điều kiện hoàn thành (PASS khi)**

* Mọi dòng trong bảng tiêu chí ở trên đều **đạt**, có bằng chứng; dòng nào không đạt thì Story chưa xong.
* Mọi màn hình ở bảng 5 trạng thái đều hiện đúng cả 5 trạng thái (thành công, đang tải, trống, lỗi, bị khoá có chú thích).
* Các Task liên kết đều đã xong và đã được người kiểm thử và người xem lại mã đồng ý; các điều kiện chấp nhận được kiểm ở máy chủ, không chỉ ở giao diện.
* Không có lỗi mức Cao hoặc Nghiêm trọng còn mở thuộc Story này.

**Còn mở / chờ quyết định:** Không có điểm chờ quyết định.

**Bằng chứng nộp:** trạng thái ban đầu là NOT_RUN (chưa chạy). Khi chạy, ghi bản dựng, môi trường, kết quả từng dòng (đạt / không đạt / bị chặn), ảnh hoặc nhật ký đã che bí mật.

**Quan hệ cần đối chiếu trên Jira:** Parent = Epic «Đăng ký và đăng nhập (kèm nền tảng dự án)»; relates to: T-09, T-17, T-21, T-22, T-25, T-55. Các Task có thể thuộc Epic khác; đây là liên kết triển khai/kiểm, không phải quan hệ cha–con với Story.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Tưởng Lê khoa Cường-4572**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-10-08**; Due date **2026-10-28**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/12-story-e1-e4.md` — S-03.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Tưởng Lê khoa Cường-4572**.
* Assignee Story phối hợp các Task và kiểm đủ tiêu chí chấp nhận. Story gán Sprint dự kiến hoàn tất toàn bộ phạm vi, không kéo sớm chỉ vì một Task con đã xong; không cộng trùng điểm Story và Task.
* Epic: [XIAN-1](https://xiangqi-web.atlassian.net/browse/XIAN-1).

**Task triển khai/kiểm liên quan:**

* [T-09 — XIAN-43](https://xiangqi-web.atlassian.net/browse/XIAN-43)
* [T-17 — XIAN-51](https://xiangqi-web.atlassian.net/browse/XIAN-51)
* [T-21 — XIAN-55](https://xiangqi-web.atlassian.net/browse/XIAN-55)
* [T-22 — XIAN-56](https://xiangqi-web.atlassian.net/browse/XIAN-56)
* [T-25 — XIAN-59](https://xiangqi-web.atlassian.net/browse/XIAN-59)
* [T-55 — XIAN-89](https://xiangqi-web.atlassian.net/browse/XIAN-89)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

Phạm vi liên quan: T-09, T-17, T-21, T-22, T-25, T-55. Tổng giờ công tham chiếu **43**; mỗi Task chỉ cộng một lần trong phạm vi này. Không nhập giờ riêng cho Story. Các tiêu chí nghiệm thu phải được kiểm thật, hiện vẫn NOT_RUN.

---

### Story 4 — Giao diện nhất quán: đủ 5 trạng thái, dùng được trên điện thoại, trợ năng, tính năng chưa làm

**Jira thực:** [XIAN-12](https://xiangqi-web.atlassian.net/browse/XIAN-12) · **Loại:** Story · **Assignee:** Nguyễn Minh Thư · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** Frontend · **Priority:** High · **Nhãn:** `P1`, `loi`, `mo-rong`, `US-UI-03`, `US-UI-04`, `US-UI-05`, `US-UI-06`, `xiangqi-mvp-20261005`, `s-04`
**Ước lượng:** không cộng giờ riêng; tổng Task liên quan chỉ để tham chiếu · **Story Points:** để trống · **Start date:** 2026-10-06 · **Due date:** 2026-11-04 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Đăng ký và đăng nhập (kèm nền tảng dự án) · **Components:** Frontend
**Giai đoạn:** Phần lõi liên kết T-07, T-12. Phần làm sau/kiểm đầy đủ liên kết T-60, T-61, T-63. Cả hai đều P1; nhãn không đổi phạm vi MVP.

**Câu chuyện:** Là người dùng, tôi muốn **mọi màn hình trông và hoạt động thống nhất**: luôn biết ứng dụng đang tải, trống, lỗi hay bị khoá; dùng được trên điện thoại và bằng bàn phím; và không bấm nhầm vào chức năng chưa làm.

**Nguồn (đặc tả)**

* US-UI-03 — Năm trạng thái cho mọi màn hình (DANH-MUC §2)
* US-UI-04 — Responsive (BA 10.1)
* US-UI-05 — Trợ năng (AGENTS §6; DESIGN)
* US-UI-06 — Tính năng P2 hiển thị đúng quy tắc (DANH-MUC §7)
* Tiêu chí gốc ở `docs/01-yeu-cau-chi-tiet.md`: AC-UI-03-01, AC-UI-04-01, AC-UI-04-02, AC-UI-05-01, AC-UI-05-02, AC-UI-06-01, AC-UI-06-02, AC-UI-04-03.
* Màn hình và thành phần giao diện (`DANH-MUC-MAN-HINH-XIANGQI.md`): Màn hình Đăng nhập (`SCR-LOGIN`), Màn hình Đăng ký (ba bước) (`SCR-REGISTER`), Sảnh (`SCR-LOBBY`), Màn hình Phòng chờ (`SCR-WAITING-ROOM`), Màn hình Ván đấu (`SCR-GAME-ROOM`), Màn hình Đánh với máy (`SCR-AI-GAME`), Màn hình Bạn bè (`SCR-FRIENDS`), Màn hình Từ chối vào phòng (`SCR-ACCESS-DENIED`), Màn hình Cài đặt hồ sơ (`SCR-PROFILE-SETTINGS`), Hộp thoại Tạo phòng (`MODAL-CREATE-ROOM`), Hộp thoại Chia sẻ phòng (`MODAL-INVITE`), Hộp Cài đặt phòng (`MODAL-ROOM-SETTINGS`), Hộp chọn Cấp độ và Phe (đánh với máy) (`MODAL-AI-SETUP`), Khung Đề nghị hoà (`MODAL-DRAW-PROMPT`), Hộp xác nhận Đầu hàng (`MODAL-CONFIRM-RESIGN`), Hộp xác nhận Rời phòng khi đang đấu (`MODAL-CONFIRM-LEAVE`), Hộp xác nhận Đuổi người xem (`MODAL-CONFIRM-KICK`), Hộp Kết quả ván (`MODAL-MATCH-RESULT`), Thanh điều hướng (`PANEL-NAVBAR`), Khung Chat (`PANEL-CHAT`), Khung Camera và Micro (`PANEL-MEDIA`), Danh sách Người xem (`PANEL-SPECTATORS`), Lớp phủ Mất kết nối (`OVERLAY-RECONNECTING`).

**Nhu cầu và phạm vi**

* **Có:** Năm trạng thái cho mọi màn hình; Responsive; Trợ năng; Tính năng P2 hiển thị đúng quy tắc.
* **Không:** giao diện sáng và bộ chọn giao diện; ứng dụng di động riêng; làm các tính năng chưa làm.

**Điều kiện để dùng:** mọi màn hình và khung dữ liệu của P1 (MVP).

**Bắt đầu khi (phụ thuộc)**
Bắt đầu từng Task khi đầu vào của **chính Task đó** đã bàn giao; không chờ toàn bộ Epic khác hoàn tất. Các phần triển khai chính nhận:

* **T-01 — Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động**.
* **T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ**.
* **T-10 — Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng**.
* **T-21 — Giao diện: đăng ký ba bước, đăng nhập, hồ sơ, đăng xuất**.
* **T-24 — Giao diện ván: bàn cờ nối mạng, đồng hồ, nút, hộp kết quả, khung xin hoà**.
* **T-25 — Nối web với máy chủ: đăng ký, đăng nhập, hồ sơ**.
* **T-26 — Giao diện: chọn cấp và phe, màn ván với máy, thông báo sự cố**.
* **T-32 — Nối web với máy chủ: bắt đầu ván đầy đủ, đồng hồ, kết thúc ván, đầu hàng, xin hoà**.
* **T-33 — Nối web, máy chủ và máy cờ thật: ván với máy**.
* **T-40 — Giao diện: bạn bè (tìm, lời mời, danh sách, mời vào phòng)**.
* **T-46 — Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời**.
* **T-52 — Nối web với máy chủ: bạn bè**.
* **T-56 — Giao diện chat hai kênh và nối web với máy chủ**.
* **T-57 — Nối web với máy chủ: mất kết nối, người xem, bảng nước đi, phòng khoá**.
* **T-59 — Nối camera/micro thật: theo đối tượng nhận, đổi vai, đuổi, tab (web, máy chủ, LiveKit)**.

Các Task triển khai/kiểm bổ sung ở bảng tiêu chí có tiền đề riêng tại Description của Task và bảng 01. Ready for Test chưa phải Done; Task đo/báo cáo Done nhưng kết luận không đạt không làm Story đạt.

**Các bước người dùng làm và hệ thống phản hồi**

1. Khi mở một màn hình hay khung dữ liệu, người dùng thấy **khung xương** trong lúc đang tải; có dữ liệu thì hiện bình thường; không có dữ liệu thì thấy lời giải thích kèm nút hành động; lỗi thì thấy thông báo tiếng Việt kèm nút **Thử lại**.
2. Nút hay chức năng không dùng được thì **mờ** kèm chú thích nêu lý do.
3. Trên điện thoại (từ 360 px), mọi thứ vẫn dùng được: bàn cờ chơi được bằng cảm ứng; chat và camera thu thành thẻ.
4. Người dùng chỉ bàn phím, người dùng giảm chuyển động hay dùng trình đọc màn hình vẫn nhận đủ thông tin.
5. Lối vào của tính năng chưa làm (Đánh Hạng, Bảng xếp hạng, Lịch sử, đăng nhập khách, Quên mật khẩu, Nhắn tin, Thách đấu) **mờ kèm "Sắp ra mắt"**; chức năng nằm sâu (mã QR, sticker, xin đi lại, xin đổi bên, tái đấu, xem lại ván, trợ giúp của máy, bộ chọn giao diện, ghép ngẫu nhiên) **ẩn hẳn**.

**Các quy tắc**

* Mỗi màn hình và khung dữ liệu có đủ **5 trạng thái**: thành công; đang tải (khung xương, không để trắng, không giật bố cục); trống (giải thích và nút hành động); lỗi (tiếng Việt dễ hiểu, nút "Thử lại"); bị khoá (luôn có chú thích lý do).
* Giao diện luôn **tối** theo phong cách "Kỳ Đài Cổ Phong", không tự theo cài đặt sáng/tối của hệ điều hành.
* Dùng được từ **360 px**, không cuộn ngang; vùng chạm tối thiểu **44 px**; kiểm ở 360×800, 390×844, 1366×768, 1920×1080.
* Đạt **WCAG 2.1 AA**: chữ thường tương phản ≥ 4,5:1, chữ lớn và thành phần giao diện ≥ 3:1; điều khiển được bằng bàn phím với viền focus nhìn thấy; nút chỉ có biểu tượng có nhãn; "giảm chuyển động" tắt hiệu ứng; thông báo quan trọng dùng vùng đọc tự động, không đọc từng giây của đếm lùi; **không truyền thông tin chỉ bằng màu**.

**Khi có lỗi**
một khung tải lỗi thì chỉ khung đó báo lỗi, không mất cả màn hình; không bao giờ báo "thành công" giả.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**

| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
| --- | --- | --- | --- | --- | --- |
| Màn hình Đăng nhập | Phiên hợp lệ vào Sảnh/đích mời | Đang xác thực, chặn gửi trùng | Form chưa nhập có hướng dẫn đăng nhập/đăng ký | Sai thông tin chung hoặc lỗi dịch vụ; cho sửa/thử lại | Form chưa hợp lệ; Guest và Quên mật khẩu: Sắp ra mắt |
| Màn hình Đăng ký (ba bước) | Hoàn tất OTP và hồ sơ mới cho vào | Gửi/xác minh/hoàn tất từng bước | Bước chưa có dữ liệu hướng dẫn nhập | Trùng tên/email, sai/hết mã hoặc phục hồi chưa xong; ở đúng bước | Chưa hợp lệ, gửi lại chưa đủ 60 giây, đang xử lý |
| Sảnh | Danh sách và hành động đúng phân kỳ, có Luật chơi | Tải phòng/bạn/phiên, khung xương từng vùng | Chưa có phòng: giải thích + Tạo phòng | Không tải danh sách: Thử lại, không giả danh sách rỗng | Đang có chỗ chơi (đang ngồi ghế hoặc đang trong ván) hoặc tính năng P2 chưa mở |
| Màn hình Phòng chờ | Ghế/Host/Sẵn sàng đúng trạng thái | Đang nhận thế cờ hiện tại hoặc chuyển ghế | Ghế còn trống: mời bạn hoặc chia sẻ mã | Lệnh lỗi/phiên bản cũ: nhận lại trạng thái | Chưa đủ hai ghế; khoá/chuyển vai không hợp lệ |
| Màn hình Ván đấu | Thế cờ, giờ và lượt đi khớp với máy chủ | Đợi máy chủ gửi thế cờ hoặc xác nhận nước đi | Chưa có nước: thế đầu và hướng dẫn, không bàn trắng | Mất mạng hoặc ghi lỗi: không hiện nước đi sai; tự nối lại theo quy tắc rớt mạng | Chưa đến lượt, chỉ được xem, tab này đã bị tab khác tiếp quản, hoặc ván đã kết thúc |
| Màn hình Đánh với máy | Máy đi hợp lệ, đúng cấp/phe | Đang tìm/đợi tiến trình | Chưa có nước: thế đầu, máy khai cuộc nếu người cầm Đen | ENGINE_BUSY thử cùng ván; ABANDONED tạo ván mới | Đến lượt máy hoặc tab đã bị tab khác tiếp quản; đi lại hết lượt hoặc P1 chưa có |
| Màn hình Bạn bè | Bạn/lời mời/trạng thái đúng | Tải hoặc tìm kiếm | Chưa có bạn/kết quả: hướng dẫn tìm username | Tải/gửi/nhận lỗi; giữ nguyên thao tác đã làm; kiểm lại với máy chủ rồi mới gửi lại | Đã đủ số bạn tối đa, bị từ chối hai lần; bạn không Online |
| Màn hình Từ chối vào phòng | Thông báo đúng nguyên nhân + về Sảnh | Đợi kết quả kiểm quyền, chưa lộ phòng | Thiếu đích/lý do: thông báo không xác định đích, về Sảnh | Kiểm quyền lỗi: không tự cấp quyền, về Sảnh | Nút đang chuyển trang bị chặn trùng |
| Màn hình Cài đặt hồ sơ | Lưu Display Name; P2 thêm chức năng đúng quyền | Tải/lưu hồ sơ | Ô nhập trống: hướng dẫn, không lưu rỗng | Từ cấm/lỗi lưu: giữ dữ liệu nhập và cho sửa | Email luôn khoá; đổi username P1; đang lưu |
| Hộp thoại Tạo phòng | Tạo phòng đúng giá trị đã chọn | Đang tạo, chặn bấm lại | Tên trống: hướng dẫn và các mặc định | Lỗi tạo: kiểm lại với máy chủ trước khi thử lại để không tạo hai phòng | Đang có chỗ chơi (đang ngồi ghế hoặc đang trong ván) hoặc tên không hợp lệ |
| Hộp thoại Chia sẻ phòng | Mã/link hiện hành; QR P2; mời bạn Online | Tải mã/bạn hoặc sao chép | Không bạn Online: vẫn chia sẻ link/mã nếu hợp lệ | Clipboard/lời mời lỗi; báo và cho cách khác | LOCKED/mất ghế; bạn bận/offline; QR ẩn P1 |
| Hộp Cài đặt phòng | Host đổi riêng tư, thu hồi mã đúng | Đang thay đổi | Chưa nhận được dữ liệu từ máy chủ: hướng dẫn đợi, không hiện giá trị giả | Không còn quyền/ghi lỗi: tải trạng thái thật | Không Host; bật LOCKED chưa đủ hai ghế |
| Hộp chọn Cấp độ và Phe (đánh với máy) | Tạo ván đúng cấp/phe | Đang tạo ván và chọn phe | Chưa chọn đủ: hướng dẫn chọn | Tạo lỗi: kiểm lại với máy chủ, không tạo hai ván | Đang có chỗ chơi (đang ngồi ghế hoặc đang trong ván) hoặc đang gửi |
| Khung Đề nghị hoà | Đề nghị còn hạn, trả lời đúng tác động | Đang gửi/rút/trả lời; không dừng đồng hồ | Không còn đề nghị: gỡ khung/nút mở lại | Phản hồi lỗi: kiểm lại hạn và trạng thái, không báo hoà sai | Hết hạn/đã rút/đã kết thúc hoặc không phải người nhận |
| Hộp xác nhận Đầu hàng | Xác nhận: đầu hàng; Huỷ không đổi ván | Đợi máy chủ xác nhận; chặn bấm trùng | Không còn ván đang chơi: đóng, hiện kết quả thật | Không nhận được xác nhận: kiểm lại với máy chủ, không báo thua sai | Ván kết thúc, tab đã bị tab khác tiếp quản, hoặc không phải người chơi |
| Hộp xác nhận Rời phòng khi đang đấu | Rời/Đăng xuất giữa ván xác nhận hậu quả | Đợi xử lý rời/đầu hàng | Không còn mục tiêu: đóng, về trạng thái hiện tại | Lỗi xử lý: giữ thông báo và kiểm lại với máy chủ | Đã xử lý hoặc không còn quyền điều khiển |
| Hộp xác nhận Đuổi người xem | Chặn đến đóng phòng, người xem về Sảnh | Đang đuổi/chặn | Mục tiêu đã rời: cập nhật danh sách | Mất quyền/lỗi lệnh: không báo đã đuổi | Mục tiêu không là người xem/người gọi mất ghế |
| Hộp Kết quả ván | Kết quả/lý do đúng; nút theo phân kỳ | Đợi kết quả chính thức từ máy chủ | Chưa có kết quả: đợi và kiểm lại với máy chủ, không tự đoán thắng thua | Tải kết quả lỗi: Thử lại, không cho đi thêm | Nút Tái đấu và Xem lại ẩn ở P1 (MVP) |
| Thanh điều hướng | Mục/menu đúng phiên/phân kỳ; badge là tổng tin đến chưa đọc từ bạn hiện tại, theo BA 5.2 | Tải thông tin/badge | Không thông báo: badge ẩn, chuông có giải thích | Tải thông báo lỗi không biến thành không có thông báo | P2 chưa mở; hành động đang xử lý |
| Khung Chat | Tin đúng quyền/kênh sau bộ lọc | Tải/gửi tin | Chưa có tin: lời nhắc viết theo kênh | Gửi lỗi: đánh dấu chưa gửi, kiểm lại rồi mới cho gửi lại | Vượt giới hạn, mất quyền kênh, ô trống |
| Khung Camera và Micro | Luồng chỉ người được phép nhận | Xin quyền thiết bị/kết nối media | Mặc định tắt/chưa chia sẻ: placeholder không bịa video | Từ chối quyền/lỗi thiết bị: hướng dẫn cấp quyền/thử lại | Người xem không phát; mất ghế hoặc tab đã bị tab khác tiếp quản |
| Danh sách Người xem | Danh sách/số X/N đúng; Kick cho hai người | Tải/cập nhật danh sách | Chưa ai xem: giải thích; không dựng tài khoản giả | Tải/đuổi lỗi: tải lại danh sách thật | N=0/đã đủ; không ghế thì không quyền Kick |
| Lớp phủ Mất kết nối | Đã nối lại, nhận lại thế cờ rồi tự tắt | Nối lại kèm thời hạn đúng vai trò | Không mất kết nối: overlay không hiện | Quá hạn: kết quả/mất ghế/về Sảnh đúng loại | Không Esc/bấm ngoài; chặn lệnh cần kết nối |

**Tiêu chí chấp nhận và cách kiểm (đối chiếu từng tiêu chí của đặc tả)**

| Mã tiêu chí | Điều kiện đạt | Cách kiểm | Task kiểm |
| --- | --- | --- | --- |
| `AC-UI-03-01` | Mỗi màn hình và khung dữ liệu có đủ 5 trạng thái: thành công; đang tải (khung xương, không để trắng, không giật bố cục); trống (giải thích và nút hành động); lỗi (tiếng Việt, nút Thử lại); bị khoá (luôn có chú thích lý do). | Kích hoạt từng trạng thái trên từng màn. | T-07, T-60 |
| `AC-UI-04-01` | Dùng được từ 360 px, không cuộn ngang; bàn cờ chơi được bằng cảm ứng; ở màn nhỏ camera và chat có thể thu thành thẻ. | Duyệt ở 360 px; chạm và kéo thả. | T-61 |
| `AC-UI-04-02` | Kiểm ở 360, 390, 1366, 1920 px. | Duyệt đủ trạng thái ở bốn cỡ. | T-61, T-63 |
| `AC-UI-04-03` | Dùng đúng phông theo DESIGN §3.1: Plus Jakarta Sans cho UI, Playfair Display cho trang trí, token `--font-han` cho chữ Hán (lựa chọn cắt Noto Serif TC vẫn là đề xuất trong DESIGN), monospace cho đồng hồ/mã; kiểm cả màn lớn và nhỏ. Không đổi chữ Hán truyền thống trên mặt quân. | So phông thực tế và mặt quân ở 360/390/1366/1920 px theo DESIGN; ghi phương án phông Hán còn đề xuất. | T-07, T-12, T-61 |
| `AC-UI-05-01` | Đạt WCAG 2.1 AA: tương phản theo thiết kế, điều khiển bằng bàn phím có viền focus, nhãn cho nút chỉ có biểu tượng, giảm chuyển động tắt hiệu ứng, đếm lùi không đọc từng giây (dùng vùng đọc tự động cho thông báo quan trọng). | Đo tương phản; duyệt bàn phím; trình đọc màn hình. | T-07, T-61 |
| `AC-UI-05-02` | Không truyền thông tin chỉ bằng màu. | Kiểm các trạng thái ở chế độ không màu. | T-61 |
| `AC-UI-06-01` | Lối vào điều hướng chính của tính năng chưa làm mờ "Sắp ra mắt"; chức năng nằm sâu (QR, sticker, xin đi lại, xin đổi bên, tái đấu, xem lại, đi lại với máy, trợ giúp của máy, bộ chọn giao diện) ẩn hoàn toàn. | Duyệt mọi màn bằng chuột và bàn phím. | T-60 |
| `AC-UI-06-02` | P1 (MVP) luôn là giao diện Kỳ Đài Cổ Phong (tối), không tự đổi theo hệ điều hành. | Đặt hệ điều hành sang giao diện sáng. | T-07, T-60 |

**Điều kiện hoàn thành (PASS khi)**

* Mọi dòng trong bảng tiêu chí ở trên đều **đạt**, có bằng chứng; dòng nào không đạt thì Story chưa xong.
* Mọi màn hình ở bảng 5 trạng thái đều hiện đúng cả 5 trạng thái (thành công, đang tải, trống, lỗi, bị khoá có chú thích).
* Các Task liên kết đều đã xong và đã được người kiểm thử và người xem lại mã đồng ý; các điều kiện chấp nhận được kiểm ở máy chủ, không chỉ ở giao diện.
* Không có lỗi mức Cao hoặc Nghiêm trọng còn mở thuộc Story này.

**Còn mở / chờ quyết định:** Không có điểm chờ quyết định; phần đo trợ năng và tương phản dựa trên giao diện thật nên làm ở Sprint cuối.

**Bằng chứng nộp:** trạng thái ban đầu là NOT_RUN (chưa chạy). Khi chạy, ghi bản dựng, môi trường, kết quả từng dòng (đạt / không đạt / bị chặn), ảnh hoặc nhật ký đã che bí mật.

**Quan hệ cần đối chiếu trên Jira:** Parent = Epic «Đăng ký và đăng nhập (kèm nền tảng dự án)»; relates to: T-07, T-12, T-60, T-61, T-63. Các Task có thể thuộc Epic khác; đây là liên kết triển khai/kiểm, không phải quan hệ cha–con với Story.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Nguyễn Minh Thư**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-10-06**; Due date **2026-11-04**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/12-story-e1-e4.md` — S-04.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Nguyễn Minh Thư**.
* Assignee Story phối hợp các Task và kiểm đủ tiêu chí chấp nhận. Story gán Sprint dự kiến hoàn tất toàn bộ phạm vi, không kéo sớm chỉ vì một Task con đã xong; không cộng trùng điểm Story và Task.
* Epic: [XIAN-1](https://xiangqi-web.atlassian.net/browse/XIAN-1).

**Task triển khai/kiểm liên quan:**

* [T-07 — XIAN-41](https://xiangqi-web.atlassian.net/browse/XIAN-41)
* [T-12 — XIAN-46](https://xiangqi-web.atlassian.net/browse/XIAN-46)
* [T-60 — XIAN-94](https://xiangqi-web.atlassian.net/browse/XIAN-94)
* [T-61 — XIAN-95](https://xiangqi-web.atlassian.net/browse/XIAN-95)
* [T-63 — XIAN-97](https://xiangqi-web.atlassian.net/browse/XIAN-97)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

Phạm vi liên quan: T-07, T-12, T-60, T-61, T-63. Tổng giờ công tham chiếu **45**; mỗi Task chỉ cộng một lần trong phạm vi này. Không nhập giờ riêng cho Story. Các tiêu chí nghiệm thu phải được kiểm thật, hiện vẫn NOT_RUN.

---

### Story 5 — Tạo phòng

**Jira thực:** [XIAN-13](https://xiangqi-web.atlassian.net/browse/XIAN-13) · **Loại:** Story · **Assignee:** Võ Thành Đông · **Sprint:** XIAN Sprint 3 · **Fix version:** v0.3
**Components:** Frontend, Room & Social · **Priority:** High · **Nhãn:** `P1`, `loi`, `mo-rong`, `US-ROOM-01`, `xiangqi-mvp-20261005`, `s-05`
**Ước lượng:** không cộng giờ riêng; tổng Task liên quan chỉ để tham chiếu · **Story Points:** để trống · **Start date:** 2026-10-08 · **Due date:** 2026-10-21 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Tạo phòng chơi · **Components:** Frontend, Room & Social
**Giai đoạn:** Phần lõi liên kết T-10, T-15, T-28. Phần làm sau/kiểm đầy đủ liên kết T-39. Cả hai đều P1; nhãn không đổi phạm vi MVP.

**Câu chuyện:** Là người chơi đã đăng nhập, tôi muốn **tạo một phòng cờ với thiết lập của mình** để mời bạn vào chơi.

**Nguồn (đặc tả)**

* US-ROOM-01 — Tạo phòng (BA 2.7, 2.8)
* Tiêu chí gốc ở `docs/01-yeu-cau-chi-tiet.md`: AC-ROOM-01-01, AC-ROOM-01-02, AC-ROOM-01-03, AC-ROOM-01-04.
* Màn hình và thành phần giao diện (`DANH-MUC-MAN-HINH-XIANGQI.md`): Hộp thoại Tạo phòng (`MODAL-CREATE-ROOM`).

**Nhu cầu và phạm vi**

* **Có:** Tạo phòng.
* **Không:** mời người, ngồi ghế, bắt đầu ván, khoá phòng.

**Điều kiện để dùng:** đã đăng nhập, đang ở Sảnh, chưa ngồi ghế ở phòng hay ván nào khác.

**Bắt đầu khi (phụ thuộc)**
Bắt đầu từng Task khi đầu vào của **chính Task đó** đã bàn giao; không chờ toàn bộ Epic khác hoàn tất. Các phần triển khai chính nhận:

* **T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ**.
* **T-04 — Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập**.
* **T-06 — Dựng khung máy chủ: nhận kết nối có xác thực và chuyển lệnh**.
* **T-07 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)**.
* **T-09 — Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ**.
* **T-11 — Giao diện: phòng chờ và màn từ chối vào phòng**.
* **T-23 — Máy chủ: chọn ghế, Sẵn sàng, đếm 3 giây, bắt đầu ván**.
* **T-25 — Nối web với máy chủ: đăng ký, đăng nhập, hồ sơ**.

Các Task triển khai/kiểm bổ sung ở bảng tiêu chí có tiền đề riêng tại Description của Task và bảng 01. Ready for Test chưa phải Done; Task đo/báo cáo Done nhưng kết luận không đạt không làm Story đạt.

**Các bước người dùng làm và hệ thống phản hồi**

1. Bấm **Tạo phòng**; hiện biểu mẫu.
2. Điền tên phòng, thời gian mỗi bên (5, 10 hoặc 15 phút, mặc định 10), riêng tư cố định Chỉ vào bằng mã (CODE_ONLY); Host mở công khai sau trong Cài đặt phòng, số người xem tối đa (không có, 1, 2, 3, 4 hoặc 5; mặc định 5).
3. Bấm Tạo; hệ thống tạo phòng, người dùng thành **chủ phòng** ngồi ghế Đỏ.
4. Màn hình chuyển vào phòng chờ, hiện **mã phòng 8 ký tự**.

**Các quy tắc**

* Phòng mới luôn CODE_ONLY; không chọn PUBLIC/LOCKED trong form tạo. Mở công khai sau bằng Cài đặt phòng (Story 19).
* Tên phòng 1 đến 60 ký tự, không chứa từ cấm. Không có kiểu "khoá" lúc tạo.
* Thời gian và số người xem **không đổi được** sau khi tạo.
* Mỗi người chỉ một chỗ chơi cùng lúc. Tạo tối đa 5 phòng trong 10 phút.
* Phòng chỉ coi là đã tạo khi **máy chủ xác nhận**.

**Khi có lỗi**
tên sai → báo dưới ô tên, giữ thông tin đã điền; đang có chỗ chơi → nút Tạo mờ có chú thích, máy chủ cũng từ chối; tạo quá nhanh → báo "tạo phòng quá nhanh"; mất mạng rồi gửi lại → **không** tạo hai phòng.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**

| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
| --- | --- | --- | --- | --- | --- |
| Hộp thoại Tạo phòng | Tạo phòng đúng giá trị đã chọn | Đang tạo, chặn bấm lại | Tên trống: hướng dẫn và các mặc định | Lỗi tạo: kiểm lại với máy chủ trước khi thử lại để không tạo hai phòng | Đang có chỗ chơi (đang ngồi ghế hoặc đang trong ván) hoặc tên không hợp lệ |

**Tiêu chí chấp nhận và cách kiểm (đối chiếu từng tiêu chí của đặc tả)**

| Mã tiêu chí | Điều kiện đạt | Cách kiểm | Task kiểm |
| --- | --- | --- | --- |
| `AC-ROOM-01-01` | Form gồm: tên phòng (1–60 ký tự, qua bộ lọc từ cấm), mức giờ **5 / 10 / 15 phút (mặc định 10)**, riêng tư cố định `CODE_ONLY` khi tạo, số người xem tối đa **Không có người xem / 1 / 2 / 3 / 4 / 5 (mặc định 5)**. `LOCKED` không chọn được lúc tạo. | Thử các biên của từng ô; tên có từ cấm; xem giá trị mặc định. | T-10, T-15, T-28 |
| `AC-ROOM-01-02` | Tạo thành công thì có mã 8 ký tự; người tạo là chủ phòng ngồi ghế Đỏ ở phòng chờ. | Tạo phòng; xem mã và ghế. | T-15, T-28 |
| `AC-ROOM-01-03` | Đang ngồi ghế ở phòng hoặc ván khác thì nút Tạo phòng mờ kèm chú thích "Bạn đang ở trong một ván/phòng khác" (và máy chủ cũng từ chối). | Có ghế rồi bấm tạo; gửi thẳng yêu cầu tạo. | T-10, T-15 |
| `AC-ROOM-01-04` | Giờ và số người xem không đổi được sau khi tạo. | Cố sửa qua giao diện và qua yêu cầu trực tiếp. | T-15, T-39 |

**Điều kiện hoàn thành (PASS khi)**

* Mọi dòng trong bảng tiêu chí ở trên đều **đạt**, có bằng chứng; dòng nào không đạt thì Story chưa xong.
* Mọi màn hình ở bảng 5 trạng thái đều hiện đúng cả 5 trạng thái (thành công, đang tải, trống, lỗi, bị khoá có chú thích).
* Các Task liên kết đều đã xong và đã được người kiểm thử và người xem lại mã đồng ý; các điều kiện chấp nhận được kiểm ở máy chủ, không chỉ ở giao diện.
* Không có lỗi mức Cao hoặc Nghiêm trọng còn mở thuộc Story này.

**Còn mở / chờ quyết định:** Giới hạn tạo 5 phòng trong 10 phút là mức khởi đầu.

**Bằng chứng nộp:** trạng thái ban đầu là NOT_RUN (chưa chạy). Khi chạy, ghi bản dựng, môi trường, kết quả từng dòng (đạt / không đạt / bị chặn), ảnh hoặc nhật ký đã che bí mật.

**Quan hệ cần đối chiếu trên Jira:** Parent = Epic «Tạo phòng chơi»; relates to: T-10, T-15, T-28, T-39. Các Task có thể thuộc Epic khác; đây là liên kết triển khai/kiểm, không phải quan hệ cha–con với Story.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Võ Thành Đông**; Sprint **XIAN Sprint 3**; Fix version **v0.3**; Start date **2026-10-08**; Due date **2026-10-21**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/12-story-e1-e4.md` — S-05.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Võ Thành Đông**.
* Assignee Story phối hợp các Task và kiểm đủ tiêu chí chấp nhận. Story gán Sprint dự kiến hoàn tất toàn bộ phạm vi, không kéo sớm chỉ vì một Task con đã xong; không cộng trùng điểm Story và Task.
* Epic: [XIAN-2](https://xiangqi-web.atlassian.net/browse/XIAN-2).

**Task triển khai/kiểm liên quan:**

* [T-10 — XIAN-44](https://xiangqi-web.atlassian.net/browse/XIAN-44)
* [T-15 — XIAN-49](https://xiangqi-web.atlassian.net/browse/XIAN-49)
* [T-28 — XIAN-62](https://xiangqi-web.atlassian.net/browse/XIAN-62)
* [T-39 — XIAN-73](https://xiangqi-web.atlassian.net/browse/XIAN-73)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

Phạm vi liên quan: T-10, T-15, T-28, T-39. Tổng giờ công tham chiếu **21**; mỗi Task chỉ cộng một lần trong phạm vi này. Không nhập giờ riêng cho Story. Các tiêu chí nghiệm thu phải được kiểm thật, hiện vẫn NOT_RUN.

---

### Story 6 — Thanh điều hướng và Sảnh

**Jira thực:** [XIAN-14](https://xiangqi-web.atlassian.net/browse/XIAN-14) · **Loại:** Story · **Assignee:** 4841_Lê Thị Xuân Nhạn · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** Frontend · **Priority:** High · **Nhãn:** `P1`, `loi`, `mo-rong`, `US-UI-01`, `US-UI-02`, `xiangqi-mvp-20261005`, `s-06`
**Ước lượng:** không cộng giờ riêng; tổng Task liên quan chỉ để tham chiếu · **Story Points:** để trống · **Start date:** 2026-10-08 · **Due date:** 2026-10-31 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Tạo phòng chơi · **Components:** Frontend
**Giai đoạn:** Phần lõi liên kết T-10, T-26, T-33. Phần làm sau/kiểm đầy đủ liên kết T-43, T-46, T-60. Cả hai đều P1; nhãn không đổi phạm vi MVP.

**Câu chuyện:** Là người dùng đã đăng nhập, tôi muốn **một thanh điều hướng và một trang chính (Sảnh)** để làm mọi việc: tạo phòng, vào phòng, chơi với máy, quay lại ván dở.

**Nguồn (đặc tả)**

* US-UI-01 — Thanh điều hướng (DANH-MUC panel 1)
* US-UI-02 — Sảnh (BA 2.0, Phần 11)
* Tiêu chí gốc ở `docs/01-yeu-cau-chi-tiet.md`: AC-UI-01-01, AC-UI-02-01, AC-UI-02-02, AC-UI-02-03.

**Nhu cầu và phạm vi**

* **Có:** Thanh điều hướng; Sảnh.
* **Không:** biểu mẫu tạo phòng (Story 5); chơi với máy (Epic Đánh với máy theo cấp độ); bạn bè (Epic Mời bạn vào phòng chơi).

**Điều kiện để dùng:** đã đăng nhập.

**Bắt đầu khi (phụ thuộc)**
Bắt đầu từng Task khi đầu vào của **chính Task đó** đã bàn giao; không chờ toàn bộ Epic khác hoàn tất. Các phần triển khai chính nhận:

* **T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ**.
* **T-07 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)**.

Các Task triển khai/kiểm bổ sung ở bảng tiêu chí có tiền đề riêng tại Description của Task và bảng 01. Ready for Test chưa phải Done; Task đo/báo cáo Done nhưng kết luận không đạt không làm Story đạt.

**Các bước người dùng làm và hệ thống phản hồi**

1. Ở đầu mọi trang có thanh điều hướng cố định: logo, **Sảnh**, **Bạn bè**, chuông lời mời, ảnh đại diện và tên với menu **Hồ sơ** và **Đăng xuất**. Bảng xếp hạng và Lịch sử **mờ** kèm "Sắp ra mắt".
2. Ở Sảnh người dùng thấy: **Tạo phòng**, **Vào phòng bằng mã**, **danh sách phòng công khai**, ba thẻ **Đánh với máy**. Thẻ Đánh Hạng mờ "Sắp ra mắt"; ghép ngẫu nhiên ẩn.
3. Nếu người dùng đang ngồi ghế hoặc có ván dở, Sảnh hiện băng "quay lại" và các nút tạo mới mờ có chú thích lý do.
4. Mục **Luật chơi** thu gọn và mở rộng được bằng chuột và bàn phím.

**Các quy tắc**
Luật chơi nêu rõ hết nước đi là thua và chưa có luật đuổi quân riêng; không thêm trang hay hộp thoại mới; mỗi người một chỗ chơi nên không cho tạo chỗ thứ hai.

**Khi có lỗi**
một chỗ trên Sảnh tải lỗi thì chỉ chỗ đó báo lỗi (có "Thử lại"), không mất cả Sảnh.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**

| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
| --- | --- | --- | --- | --- | --- |
| Thanh điều hướng | Mục/menu đúng phiên/phân kỳ; badge là tổng tin đến chưa đọc từ bạn hiện tại, theo BA 5.2 | Tải thông tin/badge | Không thông báo: badge ẩn, chuông có giải thích | Tải thông báo lỗi không biến thành không có thông báo | P2 chưa mở; hành động đang xử lý |
| Sảnh | Danh sách và hành động đúng phân kỳ, có Luật chơi | Tải phòng/bạn/phiên, khung xương từng vùng | Chưa có phòng: giải thích + Tạo phòng | Không tải danh sách: Thử lại, không giả danh sách rỗng | Đang có chỗ chơi (đang ngồi ghế hoặc đang trong ván) hoặc tính năng P2 chưa mở |

**Tiêu chí chấp nhận và cách kiểm (đối chiếu từng tiêu chí của đặc tả)**

| Mã tiêu chí | Điều kiện đạt | Cách kiểm | Task kiểm |
| --- | --- | --- | --- |
| `AC-UI-01-01` | Thanh điều hướng cố định đầu mọi trang đã đăng nhập: logo, Sảnh, Bạn bè; Bảng xếp hạng và Lịch sử mờ "Sắp ra mắt"; chuông lời mời; ảnh đại diện và tên với menu Hồ sơ/Đăng xuất. | Mở các trang; dùng bàn phím. | T-10, T-60 |
| `AC-UI-02-01` | Có bốn lựa chọn: **Đánh Thường**, **Đánh Hạng**, **Tự tạo phòng**, **Đánh với máy**, cùng Vào phòng bằng mã. P1: Tự tạo phòng và ba cấp AI hoạt động; Đánh Thường ghép ngẫu nhiên và Đánh Hạng hiện `DISABLED` + tooltip _"Sắp ra mắt"_. Có danh sách phòng PUBLIC để vào xem theo US-ROOM-08. | Mở Sảnh. | T-10, T-26, T-33, T-43, T-46, T-60 |
| `AC-UI-02-02` | Có ván hoặc phòng dở thì hiện băng quay lại; đang ngồi ghế thì các nút tạo mờ kèm chú thích. | Dữ liệu mẫu có và không có chỗ chơi. | T-10 |
| `AC-UI-02-03` | Sảnh có mục Luật chơi mở rộng/thu gọn bằng chuột và bàn phím, nêu kết thúc ván và các điểm khác biệt rút gọn; không thêm trang hay hộp thoại mới. | Mở và thu bằng bàn phím. | T-10 |

**Điều kiện hoàn thành (PASS khi)**

* Mọi dòng trong bảng tiêu chí ở trên đều **đạt**, có bằng chứng; dòng nào không đạt thì Story chưa xong.
* Các Task liên kết đều đã xong và đã được người kiểm thử và người xem lại mã đồng ý; các điều kiện chấp nhận được kiểm ở máy chủ, không chỉ ở giao diện.
* Không có lỗi mức Cao hoặc Nghiêm trọng còn mở thuộc Story này.

**Còn mở / chờ quyết định:** Không có điểm chờ quyết định.

**Bằng chứng nộp:** trạng thái ban đầu là NOT_RUN (chưa chạy). Khi chạy, ghi bản dựng, môi trường, kết quả từng dòng (đạt / không đạt / bị chặn), ảnh hoặc nhật ký đã che bí mật.

**Quan hệ cần đối chiếu trên Jira:** Parent = Epic «Tạo phòng chơi»; relates to: T-10, T-26, T-33, T-43, T-46, T-60. Các Task có thể thuộc Epic khác; đây là liên kết triển khai/kiểm, không phải quan hệ cha–con với Story.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **4841_Lê Thị Xuân Nhạn**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-10-08**; Due date **2026-10-31**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/12-story-e1-e4.md` — S-06.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **4841_Lê Thị Xuân Nhạn**.
* Assignee Story phối hợp các Task và kiểm đủ tiêu chí chấp nhận. Story gán Sprint dự kiến hoàn tất toàn bộ phạm vi, không kéo sớm chỉ vì một Task con đã xong; không cộng trùng điểm Story và Task.
* Epic: [XIAN-2](https://xiangqi-web.atlassian.net/browse/XIAN-2).

**Task triển khai/kiểm liên quan:**

* [T-10 — XIAN-44](https://xiangqi-web.atlassian.net/browse/XIAN-44)
* [T-26 — XIAN-60](https://xiangqi-web.atlassian.net/browse/XIAN-60)
* [T-33 — XIAN-67](https://xiangqi-web.atlassian.net/browse/XIAN-67)
* [T-43 — XIAN-77](https://xiangqi-web.atlassian.net/browse/XIAN-77)
* [T-46 — XIAN-80](https://xiangqi-web.atlassian.net/browse/XIAN-80)
* [T-60 — XIAN-94](https://xiangqi-web.atlassian.net/browse/XIAN-94)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

Phạm vi liên quan: T-10, T-26, T-33, T-43, T-46, T-60. Tổng giờ công tham chiếu **36.5**; mỗi Task chỉ cộng một lần trong phạm vi này. Không nhập giờ riêng cho Story. Các tiêu chí nghiệm thu phải được kiểm thật, hiện vẫn NOT_RUN.

---

### Story 7 — Phòng chờ, hai ghế ngồi, Sẵn sàng và bắt đầu ván

**Jira thực:** [XIAN-15](https://xiangqi-web.atlassian.net/browse/XIAN-15) · **Loại:** Story · **Assignee:** Võ Thành Đông · **Sprint:** XIAN Sprint 2 · **Fix version:** v0.2
**Components:** Frontend, Room & Social · **Priority:** High · **Nhãn:** `P1`, `loi`, `US-ROOM-02`, `US-ROOM-03`, `xiangqi-mvp-20261005`, `s-07`
**Ước lượng:** không cộng giờ riêng; tổng Task liên quan chỉ để tham chiếu · **Story Points:** để trống · **Start date:** 2026-10-08 · **Due date:** 2026-10-17 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Tạo phòng chơi · **Components:** Frontend, Room & Social
**Giai đoạn:** Phần lõi liên kết T-11, T-19, T-23, T-28, T-32. Toàn bộ phần triển khai/kiểm liên kết nằm ở phần lõi. Cả hai đều P1; nhãn không đổi phạm vi MVP.

**Câu chuyện:** Là người chơi, tôi muốn **thấy phòng chờ với hai ghế, bấm Sẵn sàng và để ván tự bắt đầu** khi cả hai đã sẵn sàng.

**Nguồn (đặc tả)**

* US-ROOM-02 — Phòng chờ và ghế ngồi (BA 2.3)
* US-ROOM-03 — Sẵn sàng và bắt đầu ván (BA 2.3)
* Tiêu chí gốc ở `docs/01-yeu-cau-chi-tiet.md`: AC-ROOM-02-01, AC-ROOM-02-02, AC-ROOM-02-03, AC-ROOM-03-01, AC-ROOM-03-02, AC-ROOM-03-03.
* Màn hình và thành phần giao diện (`DANH-MUC-MAN-HINH-XIANGQI.md`): Màn hình Phòng chờ (`SCR-WAITING-ROOM`).

**Nhu cầu và phạm vi**

* **Có:** Phòng chờ và ghế ngồi; Sẵn sàng và bắt đầu ván.
* **Không:** đi nước và luật cờ (Epic Hai người đánh cờ qua mạng); xin đổi bên; tái đấu; đổi chỗ giữa ghế và chỗ xem (Story 20).

**Điều kiện để dùng:** đã ở trong một phòng.

**Bắt đầu khi (phụ thuộc)**
Bắt đầu từng Task khi đầu vào của **chính Task đó** đã bàn giao; không chờ toàn bộ Epic khác hoàn tất. Các phần triển khai chính nhận:

* **T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ**.
* **T-05 — Luật cờ: mô hình bàn cờ, thế khởi đầu, nước đi của từng loại quân**.
* **T-07 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)**.
* **T-10 — Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng**.
* **T-19 — Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh**.
* **T-25 — Nối web với máy chủ: đăng ký, đăng nhập, hồ sơ**.
* **T-29 — Máy chủ: đồng hồ ván, kết thúc ván, đầu hàng, xin hoà**.
* **T-30 — Nối web với máy chủ: đi nước, đồng bộ thế cờ giữa hai trình duyệt**.

Các Task triển khai/kiểm bổ sung ở bảng tiêu chí có tiền đề riêng tại Description của Task và bảng 01. Ready for Test chưa phải Done; Task đo/báo cáo Done nhưng kết luận không đạt không làm Story đạt.

**Các bước người dùng làm và hệ thống phản hồi**

1. Phòng chờ hiện hai ghế (Đỏ và Đen) với tên người ngồi và chủ phòng. Chủ phòng mặc định ngồi ghế Đỏ; khi còn **một mình**, chủ phòng đổi sang ghế Đen hoặc đổi lại bao nhiêu lần cũng được.
2. Người thứ hai vào phòng thì tự xếp vào **ghế còn trống**.
3. Mỗi người ngồi ghế bật hoặc tắt **Sẵn sàng** tuỳ ý. Khi người ngồi ghế thay đổi, "Sẵn sàng" của cả hai **về chưa sẵn sàng**.
4. Khi cả hai cùng sẵn sàng, màn hình **đếm ngược 3, 2, 1** (có tiếng gỗ).
5. Hết đếm, hệ thống tạo ván mới, hai người chuyển sang màn hình ván và **đồng hồ của bên Đỏ bắt đầu chạy**.

**Các quy tắc**

* Mất mạng trong đếm thì huỷ đếm, reset cả hai Sẵn sàng, giữ ghế 60 giây; nối lại phải Sẵn sàng lại. Chưa tạo ván không xử thua.
* Mỗi ghế chỉ một người; mọi quyết định do máy chủ làm, giao diện không tự cấp ghế.
* Nếu ai bỏ Sẵn sàng hoặc rời đi trong lúc đếm thì **huỷ đếm**, không tạo ván; một lần chỉ tạo **một** ván; đồng hồ do máy chủ tính.
* Người xem không bấm được Sẵn sàng.

**Khi có lỗi**
hai người tranh ghế cuối thì chỉ một người được; ghi dữ liệu lỗi lúc bắt đầu ván thì hoàn tác, không báo "bắt đầu" giả.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**

| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
| --- | --- | --- | --- | --- | --- |
| Màn hình Phòng chờ | Ghế/Host/Sẵn sàng đúng trạng thái | Đang nhận thế cờ hiện tại hoặc chuyển ghế | Ghế còn trống: mời bạn hoặc chia sẻ mã | Lệnh lỗi/phiên bản cũ: nhận lại trạng thái | Chưa đủ hai ghế; khoá/chuyển vai không hợp lệ |

**Tiêu chí chấp nhận và cách kiểm (đối chiếu từng tiêu chí của đặc tả)**

| Mã tiêu chí | Điều kiện đạt | Cách kiểm | Task kiểm |
| --- | --- | --- | --- |
| `AC-ROOM-02-01` | Chủ phòng mặc định ghế Đỏ; khi chỉ có một mình, đổi sang Đen và đổi lại không giới hạn số lần. | Đổi ghế nhiều lần khi một mình; khi đã có người thứ hai. | T-11, T-23, T-28 |
| `AC-ROOM-02-02` | Người vào bằng mã/link hoặc lời mời khi còn ghế trống thì tự xếp vào **ghế còn trống**; Vào xem từ Sảnh theo AC-ROOM-05-03. | Chủ phòng ngồi Đỏ rồi Đen; người thứ hai vào. | T-19, T-23 |
| `AC-ROOM-02-03` | Khi thành phần người ngồi ghế thay đổi, "Sẵn sàng" của cả hai về chưa sẵn sàng. | Thay người ngồi ghế khi một bên đã sẵn sàng. | T-11, T-23 |
| `AC-ROOM-03-01` | Mỗi người ngồi ghế bật hoặc tắt Sẵn sàng tuỳ ý, kể cả trước khi đối thủ vào. | Chủ phòng bật/tắt khi một mình. | T-11, T-23 |
| `AC-ROOM-03-02` | Cả hai cùng sẵn sàng thì đếm ngược 3, 2, 1 (có tiếng gỗ), rồi tạo ván mới, chuyển sang màn ván và đồng hồ bên Đỏ bắt đầu chạy. | Hai trình duyệt cùng sẵn sàng; xem đếm, âm thanh, màn ván, đồng hồ. | T-23, T-28, T-32 |
| `AC-ROOM-03-03` | Khi một bên bỏ Sẵn sàng trong lúc đếm thì **dừng đếm**. Phòng tự tạo: mất mạng trong lúc đếm bắt đầu ván thì huỷ đếm, reset Sẵn sàng của cả hai, giữ ghế người mất mạng 60 giây theo BA 2.3; khi nối lại cả hai phải bấm Sẵn sàng để đếm lại. Máy chủ kiểm lại ghế/Sẵn sàng/kết nối khi hết đếm; chưa tạo ván thì không ghi kết quả thua (PO duyệt 05/10). | Huỷ Sẵn sàng khi đếm; ngắt mạng trong đếm rồi nối lại trước/sau 60 giây. Kiểm hai trạng thái Sẵn sàng, không tạo ván/kết quả thua trước bắt đầu. | T-11, T-23, T-28 |

**Điều kiện hoàn thành (PASS khi)**

* Mọi dòng trong bảng tiêu chí ở trên đều **đạt**, có bằng chứng; dòng nào không đạt thì Story chưa xong.
* Mọi màn hình ở bảng 5 trạng thái đều hiện đúng cả 5 trạng thái (thành công, đang tải, trống, lỗi, bị khoá có chú thích).
* Các Task liên kết đều đã xong và đã được người kiểm thử và người xem lại mã đồng ý; các điều kiện chấp nhận được kiểm ở máy chủ, không chỉ ở giao diện.
* Không có lỗi mức Cao hoặc Nghiêm trọng còn mở thuộc Story này.

**Còn mở / chờ quyết định:** Không có điểm chờ quyết định.

**Bằng chứng nộp:** trạng thái ban đầu là NOT_RUN (chưa chạy). Khi chạy, ghi bản dựng, môi trường, kết quả từng dòng (đạt / không đạt / bị chặn), ảnh hoặc nhật ký đã che bí mật.

**Quan hệ cần đối chiếu trên Jira:** Parent = Epic «Tạo phòng chơi»; relates to: T-11, T-19, T-23, T-28, T-32. Các Task có thể thuộc Epic khác; đây là liên kết triển khai/kiểm, không phải quan hệ cha–con với Story.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Võ Thành Đông**; Sprint **XIAN Sprint 2**; Fix version **v0.2**; Start date **2026-10-08**; Due date **2026-10-17**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/12-story-e1-e4.md` — S-07.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Võ Thành Đông**.
* Assignee Story phối hợp các Task và kiểm đủ tiêu chí chấp nhận. Story gán Sprint dự kiến hoàn tất toàn bộ phạm vi, không kéo sớm chỉ vì một Task con đã xong; không cộng trùng điểm Story và Task.
* Epic: [XIAN-2](https://xiangqi-web.atlassian.net/browse/XIAN-2).

**Task triển khai/kiểm liên quan:**

* [T-11 — XIAN-45](https://xiangqi-web.atlassian.net/browse/XIAN-45)
* [T-19 — XIAN-53](https://xiangqi-web.atlassian.net/browse/XIAN-53)
* [T-23 — XIAN-57](https://xiangqi-web.atlassian.net/browse/XIAN-57)
* [T-28 — XIAN-62](https://xiangqi-web.atlassian.net/browse/XIAN-62)
* [T-32 — XIAN-66](https://xiangqi-web.atlassian.net/browse/XIAN-66)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

Phạm vi liên quan: T-11, T-19, T-23, T-28, T-32. Tổng giờ công tham chiếu **23**; mỗi Task chỉ cộng một lần trong phạm vi này. Không nhập giờ riêng cho Story. Các tiêu chí nghiệm thu phải được kiểm thật, hiện vẫn NOT_RUN.

---

### Story 8 — Vào phòng bằng mã, đường dẫn hoặc từ Sảnh

**Jira thực:** [XIAN-16](https://xiangqi-web.atlassian.net/browse/XIAN-16) · **Loại:** Story · **Assignee:** Võ Thành Đông · **Sprint:** XIAN Sprint 3 · **Fix version:** v0.3
**Components:** Frontend, Room & Social · **Priority:** High · **Nhãn:** `P1`, `loi`, `mo-rong`, `US-ROOM-05`, `US-ROOM-12`, `xiangqi-mvp-20261005`, `s-08`
**Ước lượng:** không cộng giờ riêng; tổng Task liên quan chỉ để tham chiếu · **Story Points:** để trống · **Start date:** 2026-10-08 · **Due date:** 2026-10-24 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Tạo phòng chơi · **Components:** Frontend, Room & Social
**Giai đoạn:** Phần lõi liên kết T-10, T-11, T-19, T-28. Phần làm sau/kiểm đầy đủ liên kết T-43, T-44, T-46. Cả hai đều P1; nhãn không đổi phạm vi MVP.

**Câu chuyện:** Là người chơi, tôi muốn **vào một phòng** bằng mã, đường dẫn hoặc từ danh sách ở Sảnh, và nếu không vào được thì **biết rõ lý do**.

**Nguồn (đặc tả)**

* US-ROOM-05 — Vào phòng bằng mã, link hoặc Sảnh (BA 2.6, 2.8)
* US-ROOM-12 — Màn hình từ chối truy cập (DANH-MUC mục 14)
* Tiêu chí gốc ở `docs/01-yeu-cau-chi-tiet.md`: AC-ROOM-05-01, AC-ROOM-05-02, AC-ROOM-05-03, AC-ROOM-05-04, AC-ROOM-12-01.
* Màn hình và thành phần giao diện (`DANH-MUC-MAN-HINH-XIANGQI.md`): Màn hình Từ chối vào phòng (`SCR-ACCESS-DENIED`).

**Nhu cầu và phạm vi**

* **Có:** Vào phòng bằng mã, link hoặc Sảnh; Màn hình từ chối truy cập.
* **Không:** tự xuống ghế từ vai xem (Story 20); mã QR; đăng nhập khách.

**Điều kiện để dùng:** đã đăng nhập và chưa có chỗ chơi khác.

**Bắt đầu khi (phụ thuộc)**
Bắt đầu từng Task khi đầu vào của **chính Task đó** đã bàn giao; không chờ toàn bộ Epic khác hoàn tất. Các phần triển khai chính nhận:

* **T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ**.
* **T-07 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)**.
* **T-09 — Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ**.
* **T-15 — Máy chủ: trạng thái phòng, mỗi người một chỗ chơi và tạo phòng**.
* **T-23 — Máy chủ: chọn ghế, Sẵn sàng, đếm 3 giây, bắt đầu ván**.
* **T-25 — Nối web với máy chủ: đăng ký, đăng nhập, hồ sơ**.

Các Task triển khai/kiểm bổ sung ở bảng tiêu chí có tiền đề riêng tại Description của Task và bảng 01. Ready for Test chưa phải Done; Task đo/báo cáo Done nhưng kết luận không đạt không làm Story đạt.

**Các bước người dùng làm và hệ thống phản hồi**

1. Người dùng nhập mã 8 ký tự ở Sảnh, hoặc mở đường dẫn, hoặc bấm **Vào xem** ở danh sách phòng.
2. Vào bằng mã hoặc đường dẫn: còn ghế trống thì **vào ngồi ghế**; hết ghế mà còn chỗ xem thì vào **làm người xem** kèm thông báo "Ghế đấu đã đủ 2 người, bạn đang tham gia phòng với vai trò Người xem."
3. Vào từ **danh sách ở Sảnh** thì **luôn là người xem**, kể cả khi còn ghế.
4. Nếu bị từ chối, người dùng thấy màn hình "không vào được phòng" nêu đúng lý do (phòng đầy: "Phòng thi đấu đã đầy người, vui lòng chọn phòng khác!"; bị đuổi; phòng khoá) và **một nút** "Quay về Sảnh".

**Các quy tắc**

* Sức chứa = 2 người chơi + số người xem tối đa của phòng (tối đa 7 người); nhiều yêu cầu cùng lúc cũng không vượt.
* Nhập sai mã 10 lần trong 1 phút thì bị chặn 5 phút (đếm theo từng phiên). Mã không có thì báo không tìm thấy, **không** tự sửa sang phòng khác.
* Người bị đuổi hoặc phòng đã khoá thì bị từ chối; màn từ chối không lộ thông tin phòng cho người không có quyền.

**Khi có lỗi**
gửi lại yêu cầu vào khi mất phản hồi không xếp thêm chỗ; màn từ chối có đủ 5 trạng thái và dùng được bằng bàn phím.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**

| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
| --- | --- | --- | --- | --- | --- |
| Màn hình Từ chối vào phòng | Thông báo đúng nguyên nhân + về Sảnh | Đợi kết quả kiểm quyền, chưa lộ phòng | Thiếu đích/lý do: thông báo không xác định đích, về Sảnh | Kiểm quyền lỗi: không tự cấp quyền, về Sảnh | Nút đang chuyển trang bị chặn trùng |

**Tiêu chí chấp nhận và cách kiểm (đối chiếu từng tiêu chí của đặc tả)**

| Mã tiêu chí | Điều kiện đạt | Cách kiểm | Task kiểm |
| --- | --- | --- | --- |
| `AC-ROOM-05-01` | Nhập mã hoặc mở đường dẫn: còn ghế thì vào ghế; hết ghế mà còn chỗ xem thì vào làm người xem kèm thông báo "Ghế đấu đã đủ 2 người, bạn đang tham gia phòng với vai trò Người xem." | Vào lúc còn ghế, rồi lúc hết ghế còn chỗ xem. | T-10, T-19, T-28 |
| `AC-ROOM-05-02` | Phòng đủ (2 người chơi + số người xem tối đa, tối đa 7; nhiều yêu cầu cùng lúc cũng không vượt) thì từ chối kèm "Phòng thi đấu đã đầy người, vui lòng chọn phòng khác!" ở màn từ chối. | Phòng 0 người xem; phòng đầy; hai người tranh chỗ cuối. | T-11, T-19 |
| `AC-ROOM-05-03` | Bấm Vào xem từ Sảnh: máy chủ kiểm phòng PUBLIC còn mở, phiên hợp lệ, không bị chặn và còn chỗ xem; vào với vai trò SPECTATOR, không tự chiếm ghế trống. Đổi sang CODE_ONLY/LOCKED hoặc hết chỗ trước khi xử lý thì từ chối. | Vào từ Sảnh khi còn ghế. | T-19, T-43, T-46 |
| `AC-ROOM-05-04` | Người bị đuổi hoặc phòng khoá thì vào bị từ chối. | Người đã bị đuổi và phòng khoá vào bằng mã. | T-19, T-44, T-46 |
| `AC-ROOM-12-01` | Màn từ chối hiện đúng thông báo theo lý do (phòng đầy, bị đuổi, phòng khoá) và chỉ có một nút Quay về Sảnh. | Tạo từng lý do; đếm nút. | T-11, T-19 |

**Điều kiện hoàn thành (PASS khi)**

* Mọi dòng trong bảng tiêu chí ở trên đều **đạt**, có bằng chứng; dòng nào không đạt thì Story chưa xong.
* Mọi màn hình ở bảng 5 trạng thái đều hiện đúng cả 5 trạng thái (thành công, đang tải, trống, lỗi, bị khoá có chú thích).
* Các Task liên kết đều đã xong và đã được người kiểm thử và người xem lại mã đồng ý; các điều kiện chấp nhận được kiểm ở máy chủ, không chỉ ở giao diện.
* Không có lỗi mức Cao hoặc Nghiêm trọng còn mở thuộc Story này.

**Còn mở / chờ quyết định:** Giới hạn nhập sai mã phòng (10 lần/phút, chặn 5 phút) là mức khởi đầu.

**Bằng chứng nộp:** trạng thái ban đầu là NOT_RUN (chưa chạy). Khi chạy, ghi bản dựng, môi trường, kết quả từng dòng (đạt / không đạt / bị chặn), ảnh hoặc nhật ký đã che bí mật.

**Quan hệ cần đối chiếu trên Jira:** Parent = Epic «Tạo phòng chơi»; relates to: T-10, T-11, T-19, T-28, T-43, T-44, T-46. Các Task có thể thuộc Epic khác; đây là liên kết triển khai/kiểm, không phải quan hệ cha–con với Story.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Võ Thành Đông**; Sprint **XIAN Sprint 3**; Fix version **v0.3**; Start date **2026-10-08**; Due date **2026-10-24**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/12-story-e1-e4.md` — S-08.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Võ Thành Đông**.
* Assignee Story phối hợp các Task và kiểm đủ tiêu chí chấp nhận. Story gán Sprint dự kiến hoàn tất toàn bộ phạm vi, không kéo sớm chỉ vì một Task con đã xong; không cộng trùng điểm Story và Task.
* Epic: [XIAN-2](https://xiangqi-web.atlassian.net/browse/XIAN-2).

**Task triển khai/kiểm liên quan:**

* [T-10 — XIAN-44](https://xiangqi-web.atlassian.net/browse/XIAN-44)
* [T-11 — XIAN-45](https://xiangqi-web.atlassian.net/browse/XIAN-45)
* [T-19 — XIAN-53](https://xiangqi-web.atlassian.net/browse/XIAN-53)
* [T-28 — XIAN-62](https://xiangqi-web.atlassian.net/browse/XIAN-62)
* [T-43 — XIAN-77](https://xiangqi-web.atlassian.net/browse/XIAN-77)
* [T-44 — XIAN-78](https://xiangqi-web.atlassian.net/browse/XIAN-78)
* [T-46 — XIAN-80](https://xiangqi-web.atlassian.net/browse/XIAN-80)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

Phạm vi liên quan: T-10, T-11, T-19, T-28, T-43, T-44, T-46. Tổng giờ công tham chiếu **37.5**; mỗi Task chỉ cộng một lần trong phạm vi này. Không nhập giờ riêng cho Story. Các tiêu chí nghiệm thu phải được kiểm thật, hiện vẫn NOT_RUN.

---

### Story 9 — Chia sẻ phòng bằng đường dẫn và mã; người được mời đăng nhập xong vào đúng phòng

**Jira thực:** [XIAN-17](https://xiangqi-web.atlassian.net/browse/XIAN-17) · **Loại:** Story · **Assignee:** 4841_Lê Thị Xuân Nhạn · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** Room & Social, Frontend · **Priority:** High · **Nhãn:** `P1`, `loi`, `mo-rong`, `US-ROOM-04`, `US-AUTH-06`, `xiangqi-mvp-20261005`, `s-09`
**Ước lượng:** không cộng giờ riêng; tổng Task liên quan chỉ để tham chiếu · **Story Points:** để trống · **Start date:** 2026-10-08 · **Due date:** 2026-10-31 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Mời bạn vào phòng chơi · **Components:** Room & Social, Frontend
**Giai đoạn:** Phần lõi liên kết T-11, T-15, T-19. Phần làm sau/kiểm đầy đủ liên kết T-43, T-46, T-54, T-60. Cả hai đều P1; nhãn không đổi phạm vi MVP.

**Câu chuyện:** Là người ngồi ghế, tôi muốn **gửi đường dẫn hoặc mã phòng** cho bạn; và là người được mời, tôi muốn **bấm đường dẫn rồi đăng nhập (hoặc đăng ký) là vào đúng phòng**, không phải bấm lại.

**Nguồn (đặc tả)**

* US-ROOM-04 — Chia sẻ phòng bằng link và mã (BA 2.2, 2.8; QR là P2)
* US-AUTH-06 — Chuyển hướng vào phòng sau đăng nhập (BA 2.4)
* Tiêu chí gốc ở `docs/01-yeu-cau-chi-tiet.md`: AC-ROOM-04-01, AC-ROOM-04-02, AC-ROOM-04-03, AC-AUTH-06-01, AC-AUTH-06-02.
* Màn hình và thành phần giao diện (`DANH-MUC-MAN-HINH-XIANGQI.md`): Màn hình Đăng nhập (`SCR-LOGIN`), Hộp thoại Chia sẻ phòng (`MODAL-INVITE`).

**Nhu cầu và phạm vi**

* **Có:** Chia sẻ phòng bằng link và mã; Chuyển hướng vào phòng sau đăng nhập.
* **Không:** mời bạn bè đang online (Story 12); các quy tắc vào phòng (Story 8); tạo phòng (Story 5).

**Điều kiện để dùng:** người mời đang ngồi ghế trong phòng; người được mời có đường dẫn hoặc mã.

**Bắt đầu khi (phụ thuộc)**
Bắt đầu từng Task khi đầu vào của **chính Task đó** đã bàn giao; không chờ toàn bộ Epic khác hoàn tất. Các phần triển khai chính nhận:

* **T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ**.
* **T-04 — Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập**.
* **T-06 — Dựng khung máy chủ: nhận kết nối có xác thực và chuyển lệnh**.
* **T-07 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)**.
* **T-09 — Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ**.
* **T-19 — Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh**.
* **T-25 — Nối web với máy chủ: đăng ký, đăng nhập, hồ sơ**.
* **T-31 — Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ**.
* **T-32 — Nối web với máy chủ: bắt đầu ván đầy đủ, đồng hồ, kết thúc ván, đầu hàng, xin hoà**.
* **T-33 — Nối web, máy chủ và máy cờ thật: ván với máy**.
* **T-34 — Nghiệm thu bản chơi được: đăng ký, tạo phòng, mời, đánh online và đánh với máy chạy trọn**.
* **T-44 — Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng**.
* **T-51 — Máy chủ: rời phòng giữa ván, mất kết nối, giữ chỗ, kết nối lại, ván gián đoạn**.

Các Task triển khai/kiểm bổ sung ở bảng tiêu chí có tiền đề riêng tại Description của Task và bảng 01. Ready for Test chưa phải Done; Task đo/báo cáo Done nhưng kết luận không đạt không làm Story đạt.

**Các bước người dùng làm và hệ thống phản hồi**

1. Người ngồi ghế bấm nút mời; hiện hộp thoại có **đường dẫn** và **mã 8 ký tự** kèm nút sao chép. Người dùng sao chép và gửi cho bạn.
2. Người được mời mở đường dẫn. Nếu **chưa đăng nhập**, họ thấy màn đăng nhập hoặc đăng ký; hệ thống nhớ phòng cần vào.
3. Đăng nhập hoặc đăng ký xong thì **tự vào đúng phòng**. Nếu đã đăng nhập sẵn thì vào thẳng. Vào ghế hay chỗ xem do quy tắc vào phòng quyết định (Story 8). Nếu người đó đang có ván dở thì được đưa vào lại ván thay vì phòng mới.

**Các quy tắc**

* Luật phiên/vị trí chơi được xử trước link mời: khác thiết bị khi đang chơi xử thua và về Sảnh; cùng thiết bị đăng nhập lại trong ân hạn tiếp tục ván cũ; chỉ khi không bị ràng buộc mới tự vào phòng mời.
* **Chỉ người đang ngồi ghế** mở được hộp thoại mời. Đường dẫn và mã cho **cùng một quyền**, không có đường dẫn riêng "xem" hay "chơi". Không có mã QR ở giai đoạn này.
* Khi phòng bị **khoá**, đường dẫn và mã chưa dùng hết hiệu lực; mở khoá thì có **mã và đường dẫn mới**.
* Chỉ chuyển tới **phòng trong hệ thống**, không chuyển tới địa chỉ lạ.

**Khi có lỗi**
sao chép bị từ chối quyền thì không báo "đã sao chép" giả, vẫn có cách dùng thủ công; phòng đã đóng, đầy hoặc khoá thì báo lý do rõ và đưa về Sảnh.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**

| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
| --- | --- | --- | --- | --- | --- |
| Màn hình Đăng nhập | Phiên hợp lệ vào Sảnh/đích mời | Đang xác thực, chặn gửi trùng | Form chưa nhập có hướng dẫn đăng nhập/đăng ký | Sai thông tin chung hoặc lỗi dịch vụ; cho sửa/thử lại | Form chưa hợp lệ; Guest và Quên mật khẩu: Sắp ra mắt |
| Hộp thoại Chia sẻ phòng | Mã/link hiện hành; QR P2; mời bạn Online | Tải mã/bạn hoặc sao chép | Không bạn Online: vẫn chia sẻ link/mã nếu hợp lệ | Clipboard/lời mời lỗi; báo và cho cách khác | LOCKED/mất ghế; bạn bận/offline; QR ẩn P1 |

**Tiêu chí chấp nhận và cách kiểm (đối chiếu từng tiêu chí của đặc tả)**

| Mã tiêu chí | Điều kiện đạt | Cách kiểm | Task kiểm |
| --- | --- | --- | --- |
| `AC-AUTH-06-01` | Khi chưa đăng nhập mà mở link mời thì thấy màn đăng nhập/đăng ký; sau khi đăng nhập hoặc đăng ký xong, **tự vào đúng phòng**, không phải bấm lại link, nếu không bị ràng buộc bởi vị trí chơi khác. Kiểm luật phiên BA 1.8 trước chuyển hướng: đăng nhập thiết bị khác khi đang chơi thì xử thua và về Sảnh; đăng nhập lại cùng thiết bị trong ân hạn thì tiếp tục ván cũ. Kiểm quyền/sức chứa theo US-ROOM-05 (BA 2.4, đồng bộ 05/10). | Mở đường dẫn khi chưa đăng nhập; đăng nhập rồi đăng ký mới. | T-54 |
| `AC-AUTH-06-02` | Khi đã đăng nhập và không có vị trí chơi khác ngăn cản theo BA 1.8 thì vào thẳng phòng; máy chủ vẫn kiểm quyền/sức chứa (xem US-ROOM-05 để biết vào ghế hay xem). | Mở đường dẫn khi đã đăng nhập, lúc còn ghế và hết ghế. | T-19, T-54 |
| `AC-ROOM-04-01` | Hộp thoại mời do người đang ngồi ghế mở; hiện đường dẫn và mã 8 ký tự (có nút sao chép), cùng một quyền, không có đường dẫn riêng "xem" hay "chơi". | Người xem và người ngoài tìm hộp thoại (không có); sao chép khi bị từ chối quyền clipboard. | T-11, T-15 |
| `AC-ROOM-04-02` | Nút Mã QR không xuất hiện ở giai đoạn này (ẩn, không để nút mờ). | Mở hộp thoại; tìm nút QR. | T-11, T-60 |
| `AC-ROOM-04-03` | Phòng khoá thì đường dẫn và mã chưa dùng hết hiệu lực; mở khoá thì sinh đường dẫn và mã mới. | Khoá, dùng mã cũ; mở khoá, dùng mã mới. | T-43, T-46 |

**Điều kiện hoàn thành (PASS khi)**

* Mọi dòng trong bảng tiêu chí ở trên đều **đạt**, có bằng chứng; dòng nào không đạt thì Story chưa xong.
* Mọi màn hình ở bảng 5 trạng thái đều hiện đúng cả 5 trạng thái (thành công, đang tải, trống, lỗi, bị khoá có chú thích).
* Các Task liên kết đều đã xong và đã được người kiểm thử và người xem lại mã đồng ý; các điều kiện chấp nhận được kiểm ở máy chủ, không chỉ ở giao diện.
* Không có lỗi mức Cao hoặc Nghiêm trọng còn mở thuộc Story này.

**Còn mở / chờ quyết định:** Không có điểm chờ quyết định.

**Bằng chứng nộp:** trạng thái ban đầu là NOT_RUN (chưa chạy). Khi chạy, ghi bản dựng, môi trường, kết quả từng dòng (đạt / không đạt / bị chặn), ảnh hoặc nhật ký đã che bí mật.

**Quan hệ cần đối chiếu trên Jira:** Parent = Epic «Mời bạn vào phòng chơi»; relates to: T-11, T-15, T-19, T-43, T-46, T-54, T-60. Các Task có thể thuộc Epic khác; đây là liên kết triển khai/kiểm, không phải quan hệ cha–con với Story.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **4841_Lê Thị Xuân Nhạn**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-10-08**; Due date **2026-10-31**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/12-story-e1-e4.md` — S-09.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **4841_Lê Thị Xuân Nhạn**.
* Assignee Story phối hợp các Task và kiểm đủ tiêu chí chấp nhận. Story gán Sprint dự kiến hoàn tất toàn bộ phạm vi, không kéo sớm chỉ vì một Task con đã xong; không cộng trùng điểm Story và Task.
* Epic: [XIAN-3](https://xiangqi-web.atlassian.net/browse/XIAN-3).

**Task triển khai/kiểm liên quan:**

* [T-11 — XIAN-45](https://xiangqi-web.atlassian.net/browse/XIAN-45)
* [T-15 — XIAN-49](https://xiangqi-web.atlassian.net/browse/XIAN-49)
* [T-19 — XIAN-53](https://xiangqi-web.atlassian.net/browse/XIAN-53)
* [T-43 — XIAN-77](https://xiangqi-web.atlassian.net/browse/XIAN-77)
* [T-46 — XIAN-80](https://xiangqi-web.atlassian.net/browse/XIAN-80)
* [T-54 — XIAN-88](https://xiangqi-web.atlassian.net/browse/XIAN-88)
* [T-60 — XIAN-94](https://xiangqi-web.atlassian.net/browse/XIAN-94)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

Phạm vi liên quan: T-11, T-15, T-19, T-43, T-46, T-54, T-60. Tổng giờ công tham chiếu **39.5**; mỗi Task chỉ cộng một lần trong phạm vi này. Không nhập giờ riêng cho Story. Các tiêu chí nghiệm thu phải được kiểm thật, hiện vẫn NOT_RUN.

---

### Story 10 — Kết bạn: tìm người, gửi và trả lời lời mời, giới hạn

**Jira thực:** [XIAN-18](https://xiangqi-web.atlassian.net/browse/XIAN-18) · **Loại:** Story · **Assignee:** Võ Thành Đông · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** Room & Social, Frontend · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `US-FRIEND-01`, `US-FRIEND-02`, `US-FRIEND-05`, `xiangqi-mvp-20261005`, `s-10`
**Ước lượng:** không cộng giờ riêng; tổng Task liên quan chỉ để tham chiếu · **Story Points:** để trống · **Start date:** 2026-10-20 · **Due date:** 2026-10-28 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Mời bạn vào phòng chơi · **Components:** Room & Social, Frontend
**Giai đoạn:** Phần làm sau/kiểm đầy đủ liên kết T-40, T-41, T-52. Cả hai đều P1; nhãn không đổi phạm vi MVP.

**Câu chuyện:** Là người dùng, tôi muốn **tìm người, gửi và nhận lời mời kết bạn** để có danh sách bạn.

**Nguồn (đặc tả)**

* US-FRIEND-01 — Tìm người và gửi lời mời (BA 5.5)
* US-FRIEND-02 — Nhận và trả lời lời mời (BA 5.5)
* US-FRIEND-05 — Giới hạn (BA 5.5)
* Tiêu chí gốc ở `docs/01-yeu-cau-chi-tiet.md`: AC-FRIEND-01-01, AC-FRIEND-01-02, AC-FRIEND-02-01, AC-FRIEND-02-02, AC-FRIEND-05-01, AC-FRIEND-05-02.
* Màn hình và thành phần giao diện (`DANH-MUC-MAN-HINH-XIANGQI.md`): Màn hình Bạn bè (`SCR-FRIENDS`), Thanh điều hướng (`PANEL-NAVBAR`).

**Nhu cầu và phạm vi**

* **Có:** Tìm người và gửi lời mời; Nhận và trả lời lời mời; Giới hạn.
* **Không:** nhắn tin 1-1; chặn người dùng; tăng giới hạn theo cấp độ.

**Điều kiện để dùng:** đã đăng nhập.

**Bắt đầu khi (phụ thuộc)**
Bắt đầu từng Task khi đầu vào của **chính Task đó** đã bàn giao; không chờ toàn bộ Epic khác hoàn tất. Các phần triển khai chính nhận:

* **T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ**.
* **T-04 — Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập**.
* **T-06 — Dựng khung máy chủ: nhận kết nối có xác thực và chuyển lệnh**.
* **T-07 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)**.
* **T-09 — Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ**.
* **T-10 — Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng**.
* **T-11 — Giao diện: phòng chờ và màn từ chối vào phòng**.
* **T-15 — Máy chủ: trạng thái phòng, mỗi người một chỗ chơi và tạo phòng**.
* **T-28 — Nối web với máy chủ: tạo phòng, vào phòng, ghế, Sẵn sàng, bắt đầu ván**.
* **T-31 — Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ**.
* **T-34 — Nghiệm thu bản chơi được: đăng ký, tạo phòng, mời, đánh online và đánh với máy chạy trọn**.
* **T-45 — Máy chủ: mời bạn đang online vào phòng**.
* **T-46 — Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời**.

Các Task triển khai/kiểm bổ sung ở bảng tiêu chí có tiền đề riêng tại Description của Task và bảng 01. Ready for Test chưa phải Done; Task đo/báo cáo Done nhưng kết luận không đạt không làm Story đạt.

**Các bước người dùng làm và hệ thống phản hồi**

1. Người dùng gõ phần đầu tên đăng nhập; kết quả hiện thẻ (ảnh đại diện, tên hiển thị, tên đăng nhập) và nút **Kết bạn**.
2. Bấm Kết bạn thì gửi lời mời; người gửi có thể **thu hồi** lời mời đã gửi.
3. Người nhận thấy lời mời ở **chuông** trên thanh điều hướng; **Chấp nhận** thì thành bạn **hai chiều**; **Từ chối** thì **không báo** cho người gửi.

**Các quy tắc**

* Tìm **không phân biệt hoa thường** và **không hiện email**. Lời mời tự **hết hạn sau 30 ngày**.
* Bị **cùng một người từ chối 2 lần** thì không gửi lại được cho người đó; thu hồi hoặc hết hạn **không tính** là một lần từ chối.
* Hai lời mời ngược chiều cùng lúc chỉ giữ **một** lời mời chờ, **không tự thành bạn**.
* Mỗi người tối đa **200 bạn** và **50 lời mời đang chờ** (cộng cả gửi và nhận). Máy chủ kiểm tra **cả hai tài khoản** khi gửi và khi chấp nhận để hai yêu cầu cùng lúc không vượt giới hạn.

**Khi có lỗi**
đã đủ giới hạn thì nút mờ có chú thích và máy chủ cũng chặn; người khác không trả lời hay thu hồi thay được.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**

| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
| --- | --- | --- | --- | --- | --- |
| Màn hình Bạn bè | Bạn/lời mời/trạng thái đúng | Tải hoặc tìm kiếm | Chưa có bạn/kết quả: hướng dẫn tìm username | Tải/gửi/nhận lỗi; giữ nguyên thao tác đã làm; kiểm lại với máy chủ rồi mới gửi lại | Đã đủ số bạn tối đa, bị từ chối hai lần; bạn không Online |
| Thanh điều hướng | Mục/menu đúng phiên/phân kỳ; badge là tổng tin đến chưa đọc từ bạn hiện tại, theo BA 5.2 | Tải thông tin/badge | Không thông báo: badge ẩn, chuông có giải thích | Tải thông báo lỗi không biến thành không có thông báo | P2 chưa mở; hành động đang xử lý |

**Tiêu chí chấp nhận và cách kiểm (đối chiếu từng tiêu chí của đặc tả)**

| Mã tiêu chí | Điều kiện đạt | Cách kiểm | Task kiểm |
| --- | --- | --- | --- |
| `AC-FRIEND-01-01` | Tìm theo tên đăng nhập (phần đầu, không phân biệt hoa thường); kết quả hiện thẻ tóm tắt (ảnh đại diện, tên hiển thị, tên đăng nhập) và nút Kết bạn. | Tìm bằng phần đầu khác hoa thường; xem thẻ (không có email). | T-40, T-41, T-52 |
| `AC-FRIEND-01-02` | Bấm Kết bạn thì gửi lời mời; thu hồi được lời mời đã gửi; lời mời tự hết hạn sau 30 ngày. | Gửi, thu hồi, đồng hồ giả 30 ngày. | T-40, T-41 |
| `AC-FRIEND-02-01` | Chuông ở thanh điều hướng liệt kê lời mời đang chờ; Chấp nhận thì thành bạn hai chiều; Từ chối thì không báo cho người gửi. | Chấp nhận; từ chối. | T-40, T-41, T-52 |
| `AC-FRIEND-02-02` | Bị cùng một người từ chối 2 lần thì không gửi lại được lời mời cho người đó. | Từ chối hai lần rồi gửi lại. | T-41 |
| `AC-FRIEND-05-01` | Tối đa 200 bạn và 50 lời mời đang chờ (cộng gửi và nhận) mỗi người; vượt thì nút mờ kèm chú thích và máy chủ cũng chặn; kiểm cả hai tài khoản khi gửi và chấp nhận để lệnh đồng thời không vượt giới hạn. | Biên 199/200 và 49/50; gửi và chấp nhận cùng lúc. | T-40, T-41 |
| `AC-FRIEND-05-02` | Hai lời mời ngược chiều cùng lúc giữ một lời mời chờ, không tự thành bạn; thu hồi hoặc hết hạn không tính là một lần từ chối. | Hai người cùng gửi cho nhau. | T-41, T-52 |

**Điều kiện hoàn thành (PASS khi)**

* Mọi dòng trong bảng tiêu chí ở trên đều **đạt**, có bằng chứng; dòng nào không đạt thì Story chưa xong.
* Mọi màn hình ở bảng 5 trạng thái đều hiện đúng cả 5 trạng thái (thành công, đang tải, trống, lỗi, bị khoá có chú thích).
* Các Task liên kết đều đã xong và đã được người kiểm thử và người xem lại mã đồng ý; các điều kiện chấp nhận được kiểm ở máy chủ, không chỉ ở giao diện.
* Không có lỗi mức Cao hoặc Nghiêm trọng còn mở thuộc Story này.

**Còn mở / chờ quyết định:** Không có điểm chờ quyết định.

**Bằng chứng nộp:** trạng thái ban đầu là NOT_RUN (chưa chạy). Khi chạy, ghi bản dựng, môi trường, kết quả từng dòng (đạt / không đạt / bị chặn), ảnh hoặc nhật ký đã che bí mật.

**Quan hệ cần đối chiếu trên Jira:** Parent = Epic «Mời bạn vào phòng chơi»; relates to: T-40, T-41, T-52. Các Task có thể thuộc Epic khác; đây là liên kết triển khai/kiểm, không phải quan hệ cha–con với Story.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Võ Thành Đông**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-10-20**; Due date **2026-10-28**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/12-story-e1-e4.md` — S-10.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Võ Thành Đông**.
* Assignee Story phối hợp các Task và kiểm đủ tiêu chí chấp nhận. Story gán Sprint dự kiến hoàn tất toàn bộ phạm vi, không kéo sớm chỉ vì một Task con đã xong; không cộng trùng điểm Story và Task.
* Epic: [XIAN-3](https://xiangqi-web.atlassian.net/browse/XIAN-3).

**Task triển khai/kiểm liên quan:**

* [T-40 — XIAN-74](https://xiangqi-web.atlassian.net/browse/XIAN-74)
* [T-41 — XIAN-75](https://xiangqi-web.atlassian.net/browse/XIAN-75)
* [T-52 — XIAN-86](https://xiangqi-web.atlassian.net/browse/XIAN-86)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

Phạm vi liên quan: T-40, T-41, T-52. Tổng giờ công tham chiếu **16.5**; mỗi Task chỉ cộng một lần trong phạm vi này. Không nhập giờ riêng cho Story. Các tiêu chí nghiệm thu phải được kiểm thật, hiện vẫn NOT_RUN.

---

### Story 11 — Danh sách bạn và trạng thái

**Jira thực:** [XIAN-19](https://xiangqi-web.atlassian.net/browse/XIAN-19) · **Loại:** Story · **Assignee:** 4841_Lê Thị Xuân Nhạn · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** Room & Social, Frontend · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `US-FRIEND-03`, `xiangqi-mvp-20261005`, `s-11`
**Ước lượng:** không cộng giờ riêng; tổng Task liên quan chỉ để tham chiếu · **Story Points:** để trống · **Start date:** 2026-10-20 · **Due date:** 2026-10-31 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Mời bạn vào phòng chơi · **Components:** Room & Social, Frontend
**Giai đoạn:** Phần làm sau/kiểm đầy đủ liên kết T-40, T-41, T-52, T-60. Cả hai đều P1; nhãn không đổi phạm vi MVP.

**Câu chuyện:** Là người dùng, tôi muốn **xem bạn nào đang online, đang đấu hay ngoại tuyến**.

**Nguồn (đặc tả)**

* US-FRIEND-03 — Danh sách bạn và trạng thái (BA 2.5, 5.5)
* Tiêu chí gốc ở `docs/01-yeu-cau-chi-tiet.md`: AC-FRIEND-03-01, AC-FRIEND-03-02, AC-FRIEND-03-03.
* Màn hình và thành phần giao diện (`DANH-MUC-MAN-HINH-XIANGQI.md`): Màn hình Bạn bè (`SCR-FRIENDS`).

**Nhu cầu và phạm vi**

* **Có:** Danh sách bạn và trạng thái.
* **Không:** lịch sử đấu, Elo.

**Điều kiện để dùng:** đã có bạn.

**Bắt đầu khi (phụ thuộc)**
Bắt đầu từng Task khi đầu vào của **chính Task đó** đã bàn giao; không chờ toàn bộ Epic khác hoàn tất. Các phần triển khai chính nhận:

* **T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ**.
* **T-04 — Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập**.
* **T-06 — Dựng khung máy chủ: nhận kết nối có xác thực và chuyển lệnh**.
* **T-07 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)**.
* **T-09 — Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ**.
* **T-10 — Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng**.
* **T-11 — Giao diện: phòng chờ và màn từ chối vào phòng**.
* **T-15 — Máy chủ: trạng thái phòng, mỗi người một chỗ chơi và tạo phòng**.
* **T-28 — Nối web với máy chủ: tạo phòng, vào phòng, ghế, Sẵn sàng, bắt đầu ván**.
* **T-31 — Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ**.
* **T-34 — Nghiệm thu bản chơi được: đăng ký, tạo phòng, mời, đánh online và đánh với máy chạy trọn**.
* **T-45 — Máy chủ: mời bạn đang online vào phòng**.
* **T-46 — Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời**.

Các Task triển khai/kiểm bổ sung ở bảng tiêu chí có tiền đề riêng tại Description của Task và bảng 01. Ready for Test chưa phải Done; Task đo/báo cáo Done nhưng kết luận không đạt không làm Story đạt.

**Các bước người dùng làm và hệ thống phản hồi**

1. Trang Bạn bè hiện từng người: ảnh đại diện, tên, tên đăng nhập và trạng thái: **Online**, **Đang đấu**, **Ngoại tuyến**.
2. Có thể **huỷ kết bạn**; hai bên không còn là bạn.

**Các quy tắc**

* **Đang đấu** = đang giữ ghế phòng (đang chờ, đang chơi **hoặc đã kết thúc mà chưa rời**) hoặc đang chơi với máy.
* Nút **Nhắn tin** và **Thách đấu** mờ "Sắp ra mắt"; **không có nút mời vào phòng** ở trang này.
* Chưa hiển thị điểm Elo.

**Khi có lỗi**
tải danh sách bạn lỗi → báo lỗi và cho **Thử lại**, không hiện danh sách rỗng giả; huỷ kết bạn lỗi → giữ nguyên danh sách và báo lỗi; hai bên cùng đang mở danh sách mà một bên huỷ kết bạn → cả hai thấy không còn là bạn.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**

| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
| --- | --- | --- | --- | --- | --- |
| Màn hình Bạn bè | Bạn/lời mời/trạng thái đúng | Tải hoặc tìm kiếm | Chưa có bạn/kết quả: hướng dẫn tìm username | Tải/gửi/nhận lỗi; giữ nguyên thao tác đã làm; kiểm lại với máy chủ rồi mới gửi lại | Đã đủ số bạn tối đa, bị từ chối hai lần; bạn không Online |

**Tiêu chí chấp nhận và cách kiểm (đối chiếu từng tiêu chí của đặc tả)**

| Mã tiêu chí | Điều kiện đạt | Cách kiểm | Task kiểm |
| --- | --- | --- | --- |
| `AC-FRIEND-03-01` | Danh sách bạn hiện ảnh đại diện, tên, tên đăng nhập và trạng thái Online / Đang đấu / Ngoại tuyến (điểm Elo là P2). | Bạn đăng nhập, vào ván, rời, ngắt mạng. | T-40, T-41 |
| `AC-FRIEND-03-02` | Nút Nhắn tin và Thách đấu mờ kèm "Sắp ra mắt"; trang Bạn bè không có nút mời vào phòng. | Mở trang Bạn bè. | T-40, T-60 |
| `AC-FRIEND-03-03` | Huỷ kết bạn thì hai bên không còn là bạn. | Huỷ khi hai bên đang mở danh sách. | T-41, T-52 |

**Điều kiện hoàn thành (PASS khi)**

* Mọi dòng trong bảng tiêu chí ở trên đều **đạt**, có bằng chứng; dòng nào không đạt thì Story chưa xong.
* Mọi màn hình ở bảng 5 trạng thái đều hiện đúng cả 5 trạng thái (thành công, đang tải, trống, lỗi, bị khoá có chú thích).
* Các Task liên kết đều đã xong và đã được người kiểm thử và người xem lại mã đồng ý; các điều kiện chấp nhận được kiểm ở máy chủ, không chỉ ở giao diện.
* Không có lỗi mức Cao hoặc Nghiêm trọng còn mở thuộc Story này.

**Còn mở / chờ quyết định:** Không có điểm chờ quyết định.

**Bằng chứng nộp:** trạng thái ban đầu là NOT_RUN (chưa chạy). Khi chạy, ghi bản dựng, môi trường, kết quả từng dòng (đạt / không đạt / bị chặn), ảnh hoặc nhật ký đã che bí mật.

**Quan hệ cần đối chiếu trên Jira:** Parent = Epic «Mời bạn vào phòng chơi»; relates to: T-40, T-41, T-52, T-60. Các Task có thể thuộc Epic khác; đây là liên kết triển khai/kiểm, không phải quan hệ cha–con với Story.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **4841_Lê Thị Xuân Nhạn**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-10-20**; Due date **2026-10-31**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/12-story-e1-e4.md` — S-11.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **4841_Lê Thị Xuân Nhạn**.
* Assignee Story phối hợp các Task và kiểm đủ tiêu chí chấp nhận. Story gán Sprint dự kiến hoàn tất toàn bộ phạm vi, không kéo sớm chỉ vì một Task con đã xong; không cộng trùng điểm Story và Task.
* Epic: [XIAN-3](https://xiangqi-web.atlassian.net/browse/XIAN-3).

**Task triển khai/kiểm liên quan:**

* [T-40 — XIAN-74](https://xiangqi-web.atlassian.net/browse/XIAN-74)
* [T-41 — XIAN-75](https://xiangqi-web.atlassian.net/browse/XIAN-75)
* [T-52 — XIAN-86](https://xiangqi-web.atlassian.net/browse/XIAN-86)
* [T-60 — XIAN-94](https://xiangqi-web.atlassian.net/browse/XIAN-94)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

Phạm vi liên quan: T-40, T-41, T-52, T-60. Tổng giờ công tham chiếu **28.5**; mỗi Task chỉ cộng một lần trong phạm vi này. Không nhập giờ riêng cho Story. Các tiêu chí nghiệm thu phải được kiểm thật, hiện vẫn NOT_RUN.

---

### Story 12 — Mời bạn đang online vào phòng

**Jira thực:** [XIAN-20](https://xiangqi-web.atlassian.net/browse/XIAN-20) · **Loại:** Story · **Assignee:** Võ Thành Đông · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** Room & Social, Frontend · **Priority:** Medium · **Nhãn:** `P1`, `mo-rong`, `US-FRIEND-04`, `xiangqi-mvp-20261005`, `s-12`
**Ước lượng:** không cộng giờ riêng; tổng Task liên quan chỉ để tham chiếu · **Story Points:** để trống · **Start date:** 2026-10-10 · **Due date:** 2026-10-28 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Mời bạn vào phòng chơi · **Components:** Room & Social, Frontend
**Giai đoạn:** Phần lõi liên kết T-19. Phần làm sau/kiểm đầy đủ liên kết T-40, T-45, T-52. Cả hai đều P1; nhãn không đổi phạm vi MVP.

**Câu chuyện:** Là người đang ngồi ghế, tôi muốn **mời một người bạn đang online** vào phòng của mình.

**Nguồn (đặc tả)**

* US-FRIEND-04 — Mời bạn bè online vào phòng (BA 2.5)
* Tiêu chí gốc ở `docs/01-yeu-cau-chi-tiet.md`: AC-FRIEND-04-01, AC-FRIEND-04-02, AC-FRIEND-04-03, AC-FRIEND-04-04.
* Màn hình và thành phần giao diện (`DANH-MUC-MAN-HINH-XIANGQI.md`): Màn hình Bạn bè (`SCR-FRIENDS`), Hộp thoại Chia sẻ phòng (`MODAL-INVITE`).

**Nhu cầu và phạm vi**

* **Có:** Mời bạn bè online vào phòng.
* **Không:** nút mời ở trang Bạn bè, thách đấu.

**Điều kiện để dùng:** đang ngồi ghế trong phòng; có bạn đang online.

**Bắt đầu khi (phụ thuộc)**
Bắt đầu từng Task khi đầu vào của **chính Task đó** đã bàn giao; không chờ toàn bộ Epic khác hoàn tất. Các phần triển khai chính nhận:

* **T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ**.
* **T-07 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)**.
* **T-10 — Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng**.
* **T-11 — Giao diện: phòng chờ và màn từ chối vào phòng**.
* **T-19 — Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh**.
* **T-28 — Nối web với máy chủ: tạo phòng, vào phòng, ghế, Sẵn sàng, bắt đầu ván**.
* **T-31 — Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ**.
* **T-34 — Nghiệm thu bản chơi được: đăng ký, tạo phòng, mời, đánh online và đánh với máy chạy trọn**.
* **T-41 — Máy chủ: kết bạn, lời mời và danh sách bạn có trạng thái**.
* **T-43 — Máy chủ: kiểu phòng (công khai, chỉ mã, khoá) và danh sách phòng ở Sảnh**.
* **T-46 — Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời**.

Các Task triển khai/kiểm bổ sung ở bảng tiêu chí có tiền đề riêng tại Description của Task và bảng 01. Ready for Test chưa phải Done; Task đo/báo cáo Done nhưng kết luận không đạt không làm Story đạt.

**Các bước người dùng làm và hệ thống phản hồi**

1. Người ngồi ghế mở hộp thoại mời của phòng; danh sách bạn hiện trạng thái; nút **Mời** chỉ sáng với bạn **Online**.
2. Bạn **Đang đấu** thì nút mờ "Bạn bè đang trong ván khác"; bạn ngoại tuyến có nhãn "Ngoại tuyến".
3. Người được mời thấy thông báo "\[Tên\] mời bạn tham gia phòng cờ \[Tên phòng\]" có nút **Tham gia** và **Từ chối**, **đếm lùi 30 giây** rồi tự tắt.
4. Bấm Tham gia thì vào phòng theo quy tắc vào phòng.

**Các quy tắc**
lời mời **không giữ chỗ**; máy chủ **kiểm lại mọi điều kiện** khi người nhận bấm Tham gia (còn là bạn, có bận không, phòng khoá, hết chỗ…).

**Khi có lỗi**
người xem hoặc người không ngồi ghế bấm mời → không gửi được; người nhận đang bận (Đang đấu) hoặc ngoại tuyến → nút mờ, không gửi; lời mời hết 30 giây → tự tắt; người nhận bấm Tham gia khi phòng đã khoá, hết chỗ hoặc không còn là bạn → vào theo quy tắc vào phòng hoặc bị từ chối kèm lý do, không vào trái quyền.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**

| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
| --- | --- | --- | --- | --- | --- |
| Màn hình Bạn bè | Bạn/lời mời/trạng thái đúng | Tải hoặc tìm kiếm | Chưa có bạn/kết quả: hướng dẫn tìm username | Tải/gửi/nhận lỗi; giữ nguyên thao tác đã làm; kiểm lại với máy chủ rồi mới gửi lại | Đã đủ số bạn tối đa, bị từ chối hai lần; bạn không Online |
| Hộp thoại Chia sẻ phòng | Mã/link hiện hành; QR P2; mời bạn Online | Tải mã/bạn hoặc sao chép | Không bạn Online: vẫn chia sẻ link/mã nếu hợp lệ | Clipboard/lời mời lỗi; báo và cho cách khác | LOCKED/mất ghế; bạn bận/offline; QR ẩn P1 |

**Tiêu chí chấp nhận và cách kiểm (đối chiếu từng tiêu chí của đặc tả)**

| Mã tiêu chí | Điều kiện đạt | Cách kiểm | Task kiểm |
| --- | --- | --- | --- |
| `AC-FRIEND-04-01` | Trong hộp thoại mời của phòng (do người ngồi ghế mở), danh sách bạn hiện trạng thái; nút Mời chỉ sáng với bạn Online. | Mở hộp thoại với ba loại bạn. | T-40, T-45 |
| `AC-FRIEND-04-02` | Bạn Đang đấu thì nút mờ kèm "Bạn bè đang trong ván khác"; bạn Ngoại tuyến thì kèm nhãn "Ngoại tuyến". | Bạn đang giữ ghế, đang chơi với máy, ngoại tuyến. | T-40, T-45, T-52 |
| `AC-FRIEND-04-03` | Người được mời thấy thông báo "Người chơi \[Tên chủ phòng\] mời bạn tham gia phòng cờ \[Tên phòng\]" với Tham gia và Từ chối, đếm lùi 30 giây rồi tự tắt. | Gửi lời mời; chờ hết 30 giây; bấm từng nút. | T-40, T-45, T-52 |
| `AC-FRIEND-04-04` | Bấm Tham gia thì vào phòng theo quy tắc vào phòng. | Tham gia lúc còn ghế, hết ghế, phòng khoá. | T-19, T-45, T-52 |

**Điều kiện hoàn thành (PASS khi)**

* Mọi dòng trong bảng tiêu chí ở trên đều **đạt**, có bằng chứng; dòng nào không đạt thì Story chưa xong.
* Mọi màn hình ở bảng 5 trạng thái đều hiện đúng cả 5 trạng thái (thành công, đang tải, trống, lỗi, bị khoá có chú thích).
* Các Task liên kết đều đã xong và đã được người kiểm thử và người xem lại mã đồng ý; các điều kiện chấp nhận được kiểm ở máy chủ, không chỉ ở giao diện.
* Không có lỗi mức Cao hoặc Nghiêm trọng còn mở thuộc Story này.

**Còn mở / chờ quyết định:** Không có điểm chờ quyết định.

**Bằng chứng nộp:** trạng thái ban đầu là NOT_RUN (chưa chạy). Khi chạy, ghi bản dựng, môi trường, kết quả từng dòng (đạt / không đạt / bị chặn), ảnh hoặc nhật ký đã che bí mật.

**Quan hệ cần đối chiếu trên Jira:** Parent = Epic «Mời bạn vào phòng chơi»; relates to: T-19, T-40, T-45, T-52. Các Task có thể thuộc Epic khác; đây là liên kết triển khai/kiểm, không phải quan hệ cha–con với Story.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Võ Thành Đông**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-10-10**; Due date **2026-10-28**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/12-story-e1-e4.md` — S-12.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Võ Thành Đông**.
* Assignee Story phối hợp các Task và kiểm đủ tiêu chí chấp nhận. Story gán Sprint dự kiến hoàn tất toàn bộ phạm vi, không kéo sớm chỉ vì một Task con đã xong; không cộng trùng điểm Story và Task.
* Epic: [XIAN-3](https://xiangqi-web.atlassian.net/browse/XIAN-3).

**Task triển khai/kiểm liên quan:**

* [T-19 — XIAN-53](https://xiangqi-web.atlassian.net/browse/XIAN-53)
* [T-40 — XIAN-74](https://xiangqi-web.atlassian.net/browse/XIAN-74)
* [T-45 — XIAN-79](https://xiangqi-web.atlassian.net/browse/XIAN-79)
* [T-52 — XIAN-86](https://xiangqi-web.atlassian.net/browse/XIAN-86)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

Phạm vi liên quan: T-19, T-40, T-45, T-52. Tổng giờ công tham chiếu **17**; mỗi Task chỉ cộng một lần trong phạm vi này. Không nhập giờ riêng cho Story. Các tiêu chí nghiệm thu phải được kiểm thật, hiện vẫn NOT_RUN.

---

### Story 13 — Thấy bàn cờ và quân cờ

**Jira thực:** [XIAN-21](https://xiangqi-web.atlassian.net/browse/XIAN-21) · **Loại:** Story · **Assignee:** Nguyễn Minh Thư · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** Game Engine, Frontend · **Priority:** High · **Nhãn:** `P1`, `loi`, `mo-rong`, `US-BOARD-01`, `xiangqi-mvp-20261005`, `s-13`
**Ước lượng:** không cộng giờ riêng; tổng Task liên quan chỉ để tham chiếu · **Story Points:** để trống · **Start date:** 2026-10-05 · **Due date:** 2026-11-01 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Khởi tạo bàn cờ · **Components:** Game Engine, Frontend
**Giai đoạn:** Phần lõi liên kết T-05, T-12, T-16. Phần làm sau/kiểm đầy đủ liên kết T-53, T-61. Cả hai đều P1; nhãn không đổi phạm vi MVP.

**Câu chuyện:** Là người chơi, tôi muốn **thấy bàn cờ tướng đúng chuẩn** (khởi tạo đúng thế, đúng cho cả hai phe) để chơi và xem.

**Nguồn (đặc tả)**

* US-BOARD-01 — Hiển thị bàn cờ (BA 3.1; [02](02-luat-co-tuong.md) mục 1)
* Tiêu chí gốc ở `docs/01-yeu-cau-chi-tiet.md`: AC-BOARD-01-01, AC-BOARD-01-02, AC-BOARD-01-03.
* Màn hình và thành phần giao diện (`DANH-MUC-MAN-HINH-XIANGQI.md`): Màn hình Ván đấu (`SCR-GAME-ROOM`).

**Nhu cầu và phạm vi**

* **Có:** Hiển thị bàn cờ.
* **Không:** chọn quân, đi nước, kéo thả.

**Điều kiện để dùng:** đang ở màn hình ván (hoặc ván với máy).

**Bắt đầu khi (phụ thuộc)**
Bắt đầu từng Task khi đầu vào của **chính Task đó** đã bàn giao; không chờ toàn bộ Epic khác hoàn tất. Các phần triển khai chính nhận:

* **T-01 — Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động**.
* **T-07 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)**.
* **T-08 — Luật cờ: nước hợp lệ, chiếu, chiếu hết, hết nước, lặp thế, 120 nửa nước**.
* **T-47 — Bảng nước đi: ký hiệu tiếng Việt và hiển thị**.

Các Task triển khai/kiểm bổ sung ở bảng tiêu chí có tiền đề riêng tại Description của Task và bảng 01. Ready for Test chưa phải Done; Task đo/báo cáo Done nhưng kết luận không đạt không làm Story đạt.

**Các bước người dùng làm và hệ thống phản hồi**

1. Màn hình hiện bàn cờ 9 cột × 10 hàng, quân đặt trên các **giao điểm**, ở thế khởi đầu đúng chuẩn.
2. Người cầm quân Đen thấy bàn **lật ngược** để quân mình ở phía dưới.

**Các quy tắc**

* Quân chỉ dùng **chữ Hán truyền thống** (帥仕相傌俥炮兵 và 將士象馬車砲卒); không chữ Việt hay Latin trên mặt quân.
* Hai phe phân biệt không chỉ bằng màu.
* Mỗi quân có nhãn cho trình đọc màn hình theo toạ độ gốc.
* Bàn co giãn theo màn hình; dùng được từ 360 px.

**Khi có lỗi**
đang tải/lỗi/chưa có nước/chỉ đọc đều có trạng thái riêng (đủ 5 trạng thái).

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**

| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
| --- | --- | --- | --- | --- | --- |
| Màn hình Ván đấu | Thế cờ, giờ và lượt đi khớp với máy chủ | Đợi máy chủ gửi thế cờ hoặc xác nhận nước đi | Chưa có nước: thế đầu và hướng dẫn, không bàn trắng | Mất mạng hoặc ghi lỗi: không hiện nước đi sai; tự nối lại theo quy tắc rớt mạng | Chưa đến lượt, chỉ được xem, tab này đã bị tab khác tiếp quản, hoặc ván đã kết thúc |

**Tiêu chí chấp nhận và cách kiểm (đối chiếu từng tiêu chí của đặc tả)**

| Mã tiêu chí | Điều kiện đạt | Cách kiểm | Task kiểm |
| --- | --- | --- | --- |
| `AC-BOARD-01-01` | Bàn cờ vẽ bằng SVG, 9×10 giao điểm, thế khởi đầu đúng chuẩn; quân chỉ dùng chữ Hán (帥仕相傌俥炮兵 và 將士象馬車砲卒), không chữ Việt hay Latin trên mặt quân. | So từng quân với thế chuẩn; tìm chữ Việt trên mặt quân (không có). | T-05, T-12 |
| `AC-BOARD-01-02` | Người cầm Đen thấy bàn lật ngược; toạ độ gửi máy chủ luôn theo hệ gốc. | Đổi phe hiển thị; xem dữ liệu gửi đi không đổi. | T-05, T-12, T-16 |
| `AC-BOARD-01-03` | Có nhãn cho trình đọc màn hình theo toạ độ gốc. | Dùng trình đọc màn hình ở bàn lật. | T-12, T-61 |

**Điều kiện hoàn thành (PASS khi)**

* Mọi dòng trong bảng tiêu chí ở trên đều **đạt**, có bằng chứng; dòng nào không đạt thì Story chưa xong.
* Mọi màn hình ở bảng 5 trạng thái đều hiện đúng cả 5 trạng thái (thành công, đang tải, trống, lỗi, bị khoá có chú thích).
* Các Task liên kết đều đã xong và đã được người kiểm thử và người xem lại mã đồng ý; các điều kiện chấp nhận được kiểm ở máy chủ, không chỉ ở giao diện.
* Không có lỗi mức Cao hoặc Nghiêm trọng còn mở thuộc Story này.

**Còn mở / chờ quyết định:** Phông chữ Hán phải tự đặt trong ứng dụng và cần kiểm quyền sử dụng.

**Bằng chứng nộp:** trạng thái ban đầu là NOT_RUN (chưa chạy). Khi chạy, ghi bản dựng, môi trường, kết quả từng dòng (đạt / không đạt / bị chặn), ảnh hoặc nhật ký đã che bí mật.

**Quan hệ cần đối chiếu trên Jira:** Parent = Epic «Khởi tạo bàn cờ»; relates to: T-05, T-12, T-16, T-53, T-61. Các Task có thể thuộc Epic khác; đây là liên kết triển khai/kiểm, không phải quan hệ cha–con với Story.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Nguyễn Minh Thư**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-10-05**; Due date **2026-11-01**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/12-story-e1-e4.md` — S-13.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Nguyễn Minh Thư**.
* Assignee Story phối hợp các Task và kiểm đủ tiêu chí chấp nhận. Story gán Sprint dự kiến hoàn tất toàn bộ phạm vi, không kéo sớm chỉ vì một Task con đã xong; không cộng trùng điểm Story và Task.
* Epic: [XIAN-4](https://xiangqi-web.atlassian.net/browse/XIAN-4).

**Task triển khai/kiểm liên quan:**

* [T-05 — XIAN-39](https://xiangqi-web.atlassian.net/browse/XIAN-39)
* [T-12 — XIAN-46](https://xiangqi-web.atlassian.net/browse/XIAN-46)
* [T-16 — XIAN-50](https://xiangqi-web.atlassian.net/browse/XIAN-50)
* [T-53 — XIAN-87](https://xiangqi-web.atlassian.net/browse/XIAN-87)
* [T-61 — XIAN-95](https://xiangqi-web.atlassian.net/browse/XIAN-95)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

Phạm vi liên quan: T-05, T-12, T-16, T-53, T-61. Tổng giờ công tham chiếu **36**; mỗi Task chỉ cộng một lần trong phạm vi này. Không nhập giờ riêng cho Story. Các tiêu chí nghiệm thu phải được kiểm thật, hiện vẫn NOT_RUN.

---

### Story 14 — Tương tác với quân cờ: chọn, kéo thả, đánh dấu nước đi, cảnh báo chiếu, âm thanh

**Jira thực:** [XIAN-22](https://xiangqi-web.atlassian.net/browse/XIAN-22) · **Loại:** Story · **Assignee:** Nguyễn Minh Thư · **Sprint:** XIAN Sprint 4 · **Fix version:** v1.0
**Components:** Frontend, Game Engine · **Priority:** High · **Nhãn:** `P1`, `loi`, `mo-rong`, `US-BOARD-02`, `US-BOARD-03`, `US-BOARD-04`, `US-BOARD-05`, `xiangqi-mvp-20261005`, `s-14`
**Ước lượng:** không cộng giờ riêng; tổng Task liên quan chỉ để tham chiếu · **Story Points:** để trống · **Start date:** 2026-10-06 · **Due date:** 2026-11-01 · **Reporter:** PO · **Trạng thái:** To Do.

## Bối cảnh và vị trí công việc

Dự án Cờ Tướng Online cho phép người dùng đăng ký/đăng nhập, tự tạo phòng và mời bằng mã/đường dẫn hoặc bạn bè online, chơi cờ tướng qua mạng; phòng có tối đa hai người chơi và năm người xem, chat riêng/chung, camera/micro; có chế độ đấu với máy ba cấp độ. Mục này thuộc MVP P1. Đánh Hạng, ghép ngẫu nhiên, tài khoản khách và các tính năng được ghi P2 không phải đầu ra của mục này.

**Thuộc Epic:** Khởi tạo bàn cờ · **Components:** Frontend, Game Engine
**Giai đoạn:** Phần lõi liên kết T-08, T-16, T-20, T-24. Phần làm sau/kiểm đầy đủ liên kết T-61. Cả hai đều P1; nhãn không đổi phạm vi MVP.

**Câu chuyện:** Là người chơi, tôi muốn **chọn quân, kéo thả quân, thấy nước vừa đi, biết khi bị chiếu và nghe tiếng quân** như chơi cờ thật.

**Nguồn (đặc tả)**

* US-BOARD-02 — Chọn quân và gợi ý ô đi bằng click (BA 3.4)
* US-BOARD-03 — Kéo thả (BA 3.4)
* US-BOARD-04 — Đánh dấu nước cuối và chiếu (BA 3.4; DESIGN §7.4)
* US-BOARD-05 — Âm thanh (BA 3.4)
* Tiêu chí gốc ở `docs/01-yeu-cau-chi-tiet.md`: AC-BOARD-02-01, AC-BOARD-02-02, AC-BOARD-02-03, AC-BOARD-03-01, AC-BOARD-03-02, AC-BOARD-04-01, AC-BOARD-04-02, AC-BOARD-04-03, AC-BOARD-05-01, AC-BOARD-05-02.
* Màn hình và thành phần giao diện (`DANH-MUC-MAN-HINH-XIANGQI.md`): Màn hình Ván đấu (`SCR-GAME-ROOM`).

**Nhu cầu và phạm vi**

* **Có:** Chọn quân và gợi ý ô đi bằng click; Kéo thả; Đánh dấu nước cuối và chiếu; Âm thanh.
* **Không:** gợi ý nước hay; nối mạng (Epic Hai người đánh cờ qua mạng); nhạc nền.

**Điều kiện để dùng:** đang ở màn hình ván; đến lượt mình thì mới đi được.

**Bắt đầu khi (phụ thuộc)**
Bắt đầu từng Task khi đầu vào của **chính Task đó** đã bàn giao; không chờ toàn bộ Epic khác hoàn tất. Các phần triển khai chính nhận:

* **T-05 — Luật cờ: mô hình bàn cờ, thế khởi đầu, nước đi của từng loại quân**.
* **T-12 — Giao diện: bàn cờ SVG, quân chữ Hán, lật bàn cho phe Đen**.

Các Task triển khai/kiểm bổ sung ở bảng tiêu chí có tiền đề riêng tại Description của Task và bảng 01. Ready for Test chưa phải Done; Task đo/báo cáo Done nhưng kết luận không đạt không làm Story đạt.

**Các bước người dùng làm và hệ thống phản hồi**

1. Người dùng **bấm quân của mình**: quân được khoanh, các ô đi hợp lệ hiện **chấm**, quân đối phương ăn được có vòng cố định (không nhấp nháy). Bấm ô hợp lệ thì đi nước đó. Muốn huỷ thì bấm lại quân, bấm ô không hợp lệ hoặc nhấn Esc.
2. Hoặc người dùng **giữ chuột (hay ngón tay) kéo quân**, thả vào ô hợp lệ thì đi, thả sai thì quân **trượt về chỗ cũ**. Bấm và kéo dùng song song, cho cùng kết quả.
3. Nước vừa đi được đánh dấu bằng **bốn góc ở cả ô đi lẫn ô đến**.
4. Khi Tướng bị chiếu, hiện vòng cảnh báo quanh Tướng kèm chữ "Đang bị chiếu" và biểu tượng.
5. Mỗi sự kiện có âm thanh: đi quân, ăn quân, chiếu, kết thúc ván. Nút loa ở góc bàn bật/tắt tiếng bằng một lần chạm; trạng thái **nhớ trong phiên**.

**Các quy tắc**

* Chỉ chọn được quân của mình và chỉ khi đến lượt mình; người xem và ván đã kết thúc là chỉ đọc (có giải thích). Nước làm lộ Tướng không hiện chấm.
* Cảnh báo chiếu **không nhấp nháy, không rung** (tối đa một nhịp sáng khi vừa bị chiếu) và **không chỉ dùng màu**; bật "giảm chuyển động" thì quân về ngay, không hiệu ứng.
* Âm thanh tạo bằng Web Audio, **không tải tệp âm thanh**; nhận lại cùng một thế cờ thì không phát lại âm hay chồng hiệu ứng.
* Khi nhận thế cờ mới thì bỏ lựa chọn cũ.

**Khi có lỗi**
đang kéo thì mất lượt hoặc mất quyền → huỷ kéo, không gửi gì; trình duyệt chưa cho phát âm → xử lý êm, không làm lỗi ván.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**

| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
| --- | --- | --- | --- | --- | --- |
| Màn hình Ván đấu | Thế cờ, giờ và lượt đi khớp với máy chủ | Đợi máy chủ gửi thế cờ hoặc xác nhận nước đi | Chưa có nước: thế đầu và hướng dẫn, không bàn trắng | Mất mạng hoặc ghi lỗi: không hiện nước đi sai; tự nối lại theo quy tắc rớt mạng | Chưa đến lượt, chỉ được xem, tab này đã bị tab khác tiếp quản, hoặc ván đã kết thúc |

**Tiêu chí chấp nhận và cách kiểm (đối chiếu từng tiêu chí của đặc tả)**

| Mã tiêu chí | Điều kiện đạt | Cách kiểm | Task kiểm |
| --- | --- | --- | --- |
| `AC-BOARD-02-01` | Bấm quân của mình: hiện vòng chọn và các chấm gợi ý ở mọi giao điểm hợp lệ; quân đối phương ăn được có vòng cố định (không nhấp nháy). | Chọn quân bị chặn, bị ghim; quân có thể ăn. | T-08, T-16 |
| `AC-BOARD-02-02` | Bấm giao điểm hợp lệ thì đi nước đó. Huỷ chọn bằng bấm lại quân, bấm ô không hợp lệ, hoặc Esc. | Thử từng cách huỷ. | T-16 |
| `AC-BOARD-02-03` | Chỉ chọn được quân của mình và chỉ khi đến lượt mình; người xem và ván kết thúc là chỉ đọc. | Thử quân đối phương, ngoài lượt, người xem, ván kết thúc. | T-16, T-24 |
| `AC-BOARD-03-01` | Giữ chuột hoặc ngón tay kéo quân bay theo con trỏ; thả vào giao điểm hợp lệ thì đi; thả sai thì quân trượt về chỗ cũ. | Kéo vào ô hợp lệ, ô sai, ngoài bàn. | T-20 |
| `AC-BOARD-03-02` | Bấm và kéo thả dùng song song, kết quả như nhau; dùng được bằng cảm ứng. | Đi cùng một nước bằng hai cách ở cả hai hướng bàn; thử trên điện thoại. | T-20, T-61 |
| `AC-BOARD-04-01` | Nước vừa đi được đánh dấu bằng bốn góc vuông ở ô đi và ô đến. | Nhận nước mới; nhận lại cùng thế. | T-20 |
| `AC-BOARD-04-02` | Khi bị chiếu: vòng cảnh báo quanh Tướng kèm chữ "Đang bị chiếu" và biểu tượng; không nhấp nháy, không rung (tối đa một nhịp sáng lúc vừa bị chiếu; tắt khi bật giảm chuyển động). | Vào và ra thế chiếu; bật giảm chuyển động. | T-20, T-61 |
| `AC-BOARD-04-03` | Không truyền thông tin chỉ bằng màu. | Xem ở chế độ không màu hoặc đo dấu hiệu ngoài màu. | T-20, T-61 |
| `AC-BOARD-05-01` | Có 4 âm (đi quân, ăn quân, chiếu, kết thúc ván) tạo bằng Web Audio, không tải tệp âm thanh. | Phát bốn sự kiện; theo dõi yêu cầu mạng. | T-20 |
| `AC-BOARD-05-02` | Nút loa ở góc bàn bật/tắt bằng một lần chạm; trạng thái nhớ trong phiên. | Tắt tiếng rồi đổi trạng thái trong phiên. | T-20 |

**Điều kiện hoàn thành (PASS khi)**

* Mọi dòng trong bảng tiêu chí ở trên đều **đạt**, có bằng chứng; dòng nào không đạt thì Story chưa xong.
* Mọi màn hình ở bảng 5 trạng thái đều hiện đúng cả 5 trạng thái (thành công, đang tải, trống, lỗi, bị khoá có chú thích).
* Các Task liên kết đều đã xong và đã được người kiểm thử và người xem lại mã đồng ý; các điều kiện chấp nhận được kiểm ở máy chủ, không chỉ ở giao diện.
* Không có lỗi mức Cao hoặc Nghiêm trọng còn mở thuộc Story này.

**Còn mở / chờ quyết định:** Trình duyệt có thể chặn phát âm thanh tự động; phải xử lý êm.

**Bằng chứng nộp:** trạng thái ban đầu là NOT_RUN (chưa chạy). Khi chạy, ghi bản dựng, môi trường, kết quả từng dòng (đạt / không đạt / bị chặn), ảnh hoặc nhật ký đã che bí mật.

**Quan hệ cần đối chiếu trên Jira:** Parent = Epic «Khởi tạo bàn cờ»; relates to: T-08, T-16, T-20, T-24, T-61. Các Task có thể thuộc Epic khác; đây là liên kết triển khai/kiểm, không phải quan hệ cha–con với Story.

## Trạng thái lập kế hoạch và cách bàn giao

- Assignee: **Nguyễn Minh Thư**; Sprint **XIAN Sprint 4**; Fix version **v1.0**; Start date **2026-10-06**; Due date **2026-11-01**.
- Đây là công việc dự kiến; To Do, Sprint future và Release unreleased. Story Points để nhóm thống nhất; Task có ước lượng mục tiêu ban đầu theo uỷ quyền PO, không ghi worklog khi chưa làm.
- Tiền đề phải PASS trước phần phụ thuộc. Ready for Test chưa phải Done; kết luận FAIL/BLOCKED không được dùng để nghiệm thu Story/Epic.

## Nguồn đối chiếu

* Bản kế hoạch: `Jira/ke-hoach-moi/12-story-e1-e4.md` — S-14.
* Luật phạm vi: `BA-SCOPE-DECISIONS.md`; yêu cầu chi tiết và tiêu chí: `docs/01-yeu-cau-chi-tiet.md`. Các mã AC/US dùng để đối chiếu; các bước, đầu ra và cách kiểm cần làm đã được viết trong Description này.

## Phân công, Sprint và liên kết thực trên XIAN

* Người chịu trách nhiệm: **Nguyễn Minh Thư**.
* Assignee Story phối hợp các Task và kiểm đủ tiêu chí chấp nhận. Story gán Sprint dự kiến hoàn tất toàn bộ phạm vi, không kéo sớm chỉ vì một Task con đã xong; không cộng trùng điểm Story và Task.
* Epic: [XIAN-4](https://xiangqi-web.atlassian.net/browse/XIAN-4).

**Task triển khai/kiểm liên quan:**

* [T-08 — XIAN-42](https://xiangqi-web.atlassian.net/browse/XIAN-42)
* [T-16 — XIAN-50](https://xiangqi-web.atlassian.net/browse/XIAN-50)
* [T-20 — XIAN-54](https://xiangqi-web.atlassian.net/browse/XIAN-54)
* [T-24 — XIAN-58](https://xiangqi-web.atlassian.net/browse/XIAN-58)
* [T-61 — XIAN-95](https://xiangqi-web.atlassian.net/browse/XIAN-95)

## Ước lượng mục tiêu và lịch bàn giao — hạn nộp 05/11/2026

Nhóm có 8 giờ/người/ngày kể cả cuối tuần; hạn cuối 05/11/2026. Ước lượng ban đầu theo độ phức tạp của từng việc, chưa hiệu chỉnh bằng năng suất thực tế. Lịch 09–12 và 13–18 (UTC+7); ngày 05/10 bắt đầu 14:00. Tối đa **3 Task đang mở**, tính cả triển khai, chờ review và review; khoảng **82% thời gian triển khai có 1–2 Task**. Mỗi người chỉ triển khai/hỗ trợ/review một việc tại một thời điểm. Người chính không mở Task mới khi Task trước chưa đóng. Tiền đề phải review/PASS trước khi mở phần phụ thuộc. Jira chỉ hiển thị ngày, nên các ca nối tiếp trong cùng ngày có thể có thanh giao nhau. Sprint 3 bàn giao chiều 27/10; Sprint 4 bắt đầu ngay sau bàn giao, không chạy đồng thời. Mục tiêu T-64 PASS 05/11 lúc 15:30; còn 2,5 giờ trong ngày để bàn giao/đệm. Khi vượt giờ hoặc FAIL phải cập nhật lịch, không giảm AC hay đóng Task để khớp ngày.

Phạm vi liên quan: T-08, T-16, T-20, T-24, T-61. Tổng giờ công tham chiếu **35.5**; mỗi Task chỉ cộng một lần trong phạm vi này. Không nhập giờ riêng cho Story. Các tiêu chí nghiệm thu phải được kiểm thật, hiện vẫn NOT_RUN.

---
