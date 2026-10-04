# Kế hoạch mới (bản nháp) — 04: Task của Epic EA — Tài khoản và phiên

**Ngày:** 2026-10-04 · **Trạng thái:** ĐỀ XUẤT, chờ PO và nhóm duyệt · Chưa tạo gì trên Jira. Khung, phụ thuộc và Sprint: `01-components-epic-khung-task.md`; Description Epic: `02-epic.md`.

Epic gồm **12 task**. Mỗi task: dòng đầu (Epic, thành phần, Sprint, **is blocked by**) lấy từ khung; **Bắt đầu khi (kết quả cần có)** nêu hiện vật cụ thể của từng tiền đề. Chưa có ước lượng giờ và người nhận việc (nhóm điền khi Sprint Planning).

### TA-01 — Máy chủ: kiểm tra username (hợp lệ, chưa trùng)
**Epic:** EA · **Thành phần:** Authentication · **Sprint đề xuất:** 1 (04/10–07/10) · **Bắt đầu khi (is blocked by):** `T0-11`, `T0-04`
**Bắt đầu khi (kết quả cần có):** T0-11: gateway/dispatch và lấy danh tính/ngữ cảnh hợp đồng; T0-04: profiles với unique username không phân biệt hoa thường

**Mục tiêu:** Cung cấp kết quả kiểm username để bước đăng ký không tạo tài khoản sớm. Máy chủ kiểm lại ở bước hoàn tất, không hứa tên được giữ chỉ vì lần kiểm đầu hợp lệ.

**Yêu cầu / nguồn:** US-AUTH-01: AC-AUTH-01-01 cú pháp 3–20 ký tự và kiểm sau ngừng gõ 300 ms ở web, AC-AUTH-01-02 trùng không phân biệt hoa thường, AC-AUTH-01-04 bước đầu không tạo tài khoản; BA 1.1/1.4.

**Kết quả (đầu ra):**
- Điểm xử lý kiểm tên với phản hồi hợp lệ/trùng/sai theo shared.
- Test biên tên và không phát sinh hồ sơ/giữ chỗ khi chỉ kiểm.

**Phạm vi / ngoài phạm vi:** Chỉ kiểm username hợp lệ/chưa trùng ở P1; không giữ chỗ trước OTP, không username_reservations/đổi username P2. Debounce form thuộc TA-07.

**Đầu vào cần có:** T0-11: điểm nhận request/ACK theo shared; T0-04: profiles và unique không phân biệt hoa thường. Regex ^[a-zA-Z0-9_]{3,20}$ từ BA 1.4.

**Cách làm gợi ý:**
1. Kiểm kiểu và cú pháp tên trước truy vấn.
2. So trùng không phân biệt hoa thường, trả kết quả không giữ chỗ.
3. Kiểm cạnh tranh: lần kiểm trước không thay kiểm cuối TA-03.

**Kiểm thử:** Vitest đơn vị và tích hợp CSDL. Trạng thái kế hoạch: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-AUTH-01-01 | AC-AUTH-01-01 | Thử tên ở biên 3/20 và ngoài biên, ký tự sai | Chỉ tên đúng regex được nhận. |
| TC-AUTH-01-02 | AC-AUTH-01-02 | Có Twot, thử twot | Báo trùng. |
| TC-AUTH-01-04 | AC-AUTH-01-04 | Kiểm tên rồi bỏ dở | Không hồ sơ/Auth hay giữ tên mới. |
| Lỗi CSDL | docs/07 §3 | Làm truy vấn kiểm tên thất bại | Báo lỗi, không trả tên còn trống giả. |

**PASS khi:** Mọi ca P1 đạt, truy vấn không giữ chỗ và không tạo tài khoản. FAIL nếu bỏ kiểm hoa thường hoặc lần kiểm đầu được coi là giữ username tới khi OTP xong.

**Bằng chứng nộp:** Revision/build và môi trường; request/response đã che, số bản ghi trước/sau và report Vitest. Không chứa bí mật.

**Rủi ro / chưa rõ:** Tên task mới đã bỏ khóa username P2. Kiểm tên không bảo đảm tên còn trống lúc hoàn tất; TA-03 phải kiểm lại. Không tạo bảng giữ chỗ để xử lý cạnh tranh P1.

---

### TA-02 — Máy chủ: đăng ký bước 2 gửi OTP, khoá theo email, gửi lại 60 giây
**Epic:** EA · **Thành phần:** Authentication · **Sprint đề xuất:** 1 (04/10–07/10) · **Bắt đầu khi (is blocked by):** `T0-05`, `T0-11`, `T0-04`
**Bắt đầu khi (kết quả cần có):** T0-05: cấu hình thư sáu số, hạn/gửi lại và quota thử; T0-11: dispatch/ACK theo shared; T0-04: profiles và trường hoàn tất truy được

**Mục tiêu:** Gửi OTP đăng ký từ máy chủ theo email với tuần tự hóa và tái sử dụng bản ghi dở. Luồng phải không phá lần đăng ký đang chạy hoặc tạo hồ sơ dùng được trước xác minh.

**Yêu cầu / nguồn:** US-AUTH-02: AC-AUTH-02-01 email hoàn tất báo đã đăng ký, AC-AUTH-02-02 email mới/dở gửi mã sáu số, AC-AUTH-02-03 gửi lại tối thiểu 60 giây; docs/04 §3.1, BA 1.1/1.5.

**Kết quả (đầu ra):**
- Handler gửi/gửi lại OTP dùng Auth và khóa logic email.
- Phân loại email hoàn tất/dở, phản hồi lỗi quota/dịch vụ không báo gửi thành công giả.

**Phạm vi / ngoài phạm vi:** Chỉ đăng ký email P1; không SMTP ngoài, không Google/reset mật khẩu; không giữ khóa CSDL qua cuộc gọi Supabase.

**Đầu vào cần có:** Auth thử và email nhóm; cơ chế khóa theo email phải dùng chung TA-03/TA-04.

**Cách làm gợi ý:**
1. Xác thực cấu trúc email, lấy khóa logic danh tính.
2. Kiểm trạng thái mới/dở/hoàn tất, dùng lại Auth dở rồi gửi theo giới hạn.
3. Trả lỗi thật và lưu trạng thái phục hồi cần thiết không ghi secret.

**Kiểm thử:** Vitest tích hợp và phép gửi thật có lịch quota.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-AUTH-02-01 | AC-AUTH-02-01 | Gửi email đã có tài khoản hoàn tất | Không gửi, báo đã đăng ký. |
| TC-AUTH-02-02 | AC-AUTH-02-02 | Gửi mới rồi gửi lại bản dở hợp lệ | Dùng lại danh tính, không xóa OTP flow của người thật. |
| TC-AUTH-02-03 | AC-AUTH-02-03 | Hai yêu cầu đồng thời/trước hạn 60 giây | Không vượt hạn gửi lại. |
| Lỗi gửi | docs/04 §3.1 | Auth từ chối quota hoặc không khả dụng | Không ACK thành công, bản dở còn đường phục hồi. |

**PASS khi:** Mọi nhánh đạt; thư thật tách khỏi mock. FAIL nếu email hoàn tất bị xóa/ghi đè hoặc lỗi gửi bị báo thành công.

**Bằng chứng nộp:** Build/commit, môi trường, log trạng thái/danh tính đã che, số thư thực và test đồng thời; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** Nếu PoC T0-06 chưa chứng minh cơ chế/quota cần ghi blocker nghiệm thu, không đổi SMTP hoặc nới hạn để vượt test.

### TA-03 — Máy chủ: đăng ký bước 3 xác thực OTP, tạo hồ sơ, phục hồi completed_at/PENDING
**Epic:** EA · **Thành phần:** Authentication · **Sprint đề xuất:** 2 (08/10–10/10) · **Bắt đầu khi (is blocked by):** `TA-01`, `TA-02`
**Bắt đầu khi (kết quả cần có):** TA-01: kiểm username đúng cú pháp/unique và không giữ chỗ; TA-02: Auth dở/gửi OTP và khóa logic email dùng chung

**Mục tiêu:** Hoàn tất đăng ký chỉ sau OTP đúng và trạng thái hồ sơ nhất quán. Đây là đầu ra tài khoản dùng được cho EA, giữ an toàn khi lỗi giữa các bước ghi.

**Yêu cầu / nguồn:** US-AUTH-03: AC-AUTH-03-01 tự đăng nhập/display_name=username; AC-AUTH-03-02 mã hết 180 giây bị chặn; AC-AUTH-03-03 giới hạn sai gần đúng; AC-AUTH-03-04 chặn bản dở; AC-AUTH-03-05 phục hồi completed_at/PENDING; AC-AUTH-03-06 tên bị chiếm quay bước đầu. docs/07 §4.1.

**Kết quả (đầu ra):**
- Handler xác minh, kiểm lại tên, đặt mật khẩu, ghi hồ sơ và xóa PENDING đúng thứ tự.
- Nhánh bù/khôi phục đồng bộ và trạng thái cho tác vụ TA-04 xử lý lặp.

**Phạm vi / ngoài phạm vi:** Không coi Auth user tạm là tài khoản hoàn tất; không Google/P2; tác vụ định kỳ đầy đủ ở TA-04.

**Đầu vào cần có:** profiles từ T0-04 qua tiền nhiệm, kết quả verifyOtp và các mốc completed_at/PENDING theo docs/04.

**Cách làm gợi ý:**
1. Tuần tự hóa cùng email với gửi lại/dọn.
2. Xác minh OTP rồi kiểm lại tên, đặt password, ghi profiles và completed_at, cuối cùng bỏ PENDING.
3. Phân nhánh lỗi trước/sau completed_at; chỉ trả phiên dùng được khi hoàn tất cả hai điều kiện.

**Kiểm thử:** Vitest tích hợp có fault injection, Auth thử cho gate.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-AUTH-03-01 | AC-AUTH-03-01 | OTP đúng và tên còn trống | Một hồ sơ hoàn tất, display_name=username, có phiên. |
| TC-AUTH-03-02 | AC-AUTH-03-02 | Xác minh mã hết hạn/sai | Không tài khoản dùng được. |
| TC-X-01 | AC-AUTH-03-05 | Dừng sau completed_at trước xóa cờ | Giữ hồ sơ, chặn dùng, phục hồi bỏ cờ. |
| TC-AUTH-03-06 | AC-AUTH-03-06 | Tên bị lấy khi chờ OTP | Báo trùng về bước đầu, không ghi đè người khác. |

**PASS khi:** Mọi nhánh đạt và không trả thành công khi còn PENDING. FAIL nếu xóa hồ sơ có completed_at; kiểm định kỳ cuối cùng cần TA-04.

**Bằng chứng nộp:** Build/commit, môi trường, timeline từng bước, snapshot dữ liệu đã che và test lỗi/đồng thời; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** Sửa thứ tự/bù khác docs/04 cần review; không giữ khóa CSDL khi gọi Auth dù vẫn cần khóa logic email.

### TA-04 — Máy chủ: tác vụ quét và phục hồi tài khoản đăng ký dở
**Epic:** EA · **Thành phần:** Authentication · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `TA-03`
**Bắt đầu khi (kết quả cần có):** TA-03: trạng thái completed_at/PENDING, nhánh lỗi và khóa email dùng chung

**Mục tiêu:** Phục hồi/dọn đăng ký dở mà không kẹt email hay xóa tài khoản hoàn tất. Tác vụ dùng cùng khóa danh tính với gửi lại/hoàn tất.

**Yêu cầu / nguồn:** AC-AUTH-03-04/AC-AUTH-03-05 chặn và phục hồi đúng nhánh; docs/04 §3.1, docs/07 §4.1: chạy khởi động và mỗi 5 phút, chưa completed_at quá 60 phút dọn; độ trễ tối đa khoảng 65 phút khi dịch vụ hoạt động.

**Kết quả (đầu ra):**
- Tác vụ có nhánh phục hồi PENDING và dọn hồ sơ dở trước Auth.
- Báo cáo chạy lặp/đồng thời, lỗi phụ thuộc và danh tính còn cần thử lại.

**Phạm vi / ngoài phạm vi:** Chỉ tài khoản email P1; không dọn Khách, không xử nhầm nhà cung cấp khác.

**Đầu vào cần có:** Truy vấn Auth/profiles và nguồn thời gian kiểm được; test được từng ranh giới tuổi bản ghi.

**Cách làm gợi ý:**
1. Quét dưới khóa, đọc lại trạng thái ngay trước thay đổi.
2. Có completed_at còn cờ thì chỉ xóa cờ; chưa hoàn tất quá hạn mới xóa hồ sơ rồi Auth.
3. Ghi lỗi đã che và thử lại khi phụ thuộc phục hồi; kiểm chạy khởi động/chu kỳ.

**Kiểm thử:** Vitest tích hợp thời gian điều khiển và fault injection.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-X-01 | AC-AUTH-03-05 | Chạy hai lần với hồ sơ có completed_at/PENDING | Không xóa tài khoản, không đổi username/password. |
| TC-X-02 | AC-AUTH-03-04 | Quét đồng thời yêu cầu hoàn tất quá hạn | Không xóa tài khoản vừa hoàn tất. |
| Biên dọn | docs/07 §4.1 | Chưa completed_at tại và quá 60 phút | Tại hạn giữ; quá hạn đủ điều kiện dọn trong chu kỳ. |
| Auth không cờ | docs/04 §3.1 | Bản tạo trực tiếp không PENDING và lỗi dịch vụ | Vẫn xét tuổi; lỗi giữ đường thử lại, không báo đã dọn. |

**PASS khi:** Mọi ca đạt, bản hoàn tất luôn được giữ; FAIL nếu tác vụ bỏ lọt vì thiếu cờ hoặc xóa sai. Không cam kết đúng 65 phút khi dịch vụ hỏng.

**Bằng chứng nộp:** Build/commit, môi trường, lịch chạy, log đã che, trạng thái trước/sau và report tranh chấp; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** GATE-OTP PoC không thay test tác vụ thật; không dùng cơ chế cleanup NFR-09 chưa duyệt để mở rộng dữ liệu bị xóa.

### TA-05 — Máy chủ: đăng nhập username/mật khẩu, phiên 12 giờ/30 ngày, kiểm hạn/thu hồi
**Epic:** EA · **Thành phần:** Authentication · **Sprint đề xuất:** 1 (04/10–07/10) · **Bắt đầu khi (is blocked by):** `T0-05`, `T0-11`, `T0-04`, `T0-15`
**Bắt đầu khi (kết quả cần có):** T0-05: Auth thử và cấu hình tài khoản; T0-11: gateway có hook xác thực/kiểm phiên; T0-04: profiles tra username và điều kiện hoàn tất; T0-15: limiter đăng nhập sai theo (username, IP), trạng thái khóa/hết hạn và fixture biên

**Mục tiêu:** Cấp và kiểm phiên đăng nhập bằng username/password. EA nhận danh tính hợp lệ, không lộ email tra nội bộ.

**Yêu cầu / nguồn:** US-AUTH-04: AC-AUTH-04-01 cấp phiên đúng khi đăng nhập; AC-AUTH-04-02 lỗi chung, không email; AC-AUTH-04-03 ghi nhớ 30 ngày hoặc đóng trình duyệt/12 giờ. docs/04 §3.2–3.3/§9: sai 5 lần/15 phút theo (username, IP), khóa 15 phút từ lần thứ 5. AC-AUTH-04-05 giao TE-06.

**Kết quả (đầu ra):** - Handler tra email nội bộ, xác thực mật khẩu, cấp/kiểm hạn/thu hồi phiên.
- Adapter T0-15 cho sai đăng nhập và hook phiên dùng bởi gateway/TE-06.

**Phạm vi / ngoài phạm vi:** Cấp/kiểm phiên P1; không tiếp quản, OAuth/reset mật khẩu. Hậu quả ván khi hết phiên/logout kiểm sau.

**Đầu vào cần có:** T0-05: Auth thử; T0-11: gateway/hook; T0-04: profiles và fixture tài khoản hoàn tất; T0-15: limiter sai đăng nhập. Harness kiểm phiên không cần UI/TE-06.

**Cách làm gợi ý:** 1. Kiểm khóa T0-15, tra username không phân biệt hoa thường và gọi Auth.
2. Báo lỗi chung, ghi lần sai theo cặp username/IP; không lộ email.
3. Kiểm hạn/thu hồi tại hook, trả tín hiệu hết phiên; không tự xử thua.
4. Kiểm giao diện lưu phiên bằng client thử: session-only khi bỏ ghi nhớ, không chờ UI thật.

**Kiểm thử:** Vitest Auth/gateway và client lưu phiên thử. Trạng thái: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Cấp phiên | AC-AUTH-04-01/02 | Tên khác hoa thường đúng; sai tên hoặc password | Đúng cấp phiên; sai cùng thông báo, không email. |
| Hạn phiên | AC-AUTH-04-03 | Ghi nhớ/bỏ ghi nhớ, đóng client và vượt 12 giờ/30 ngày | Hạn đúng; session-only không khôi phục sau đóng client. |
| Thu hồi | docs/04 §3.3 | Thu hồi phiên thử rồi gọi lại hook với token cũ | Bị từ chối; không suy thành RESIGN. |
| Khóa đăng nhập | docs/04 §9 | Sai 4 rồi lần 5 trong 15 phút; thử trước/sau hạn khóa | Khóa 15 phút từ lần sai thứ 5, lỗi vẫn chung. |

**PASS khi:** Mọi ca cấp/kiểm phiên và limiter đã nêu đạt. FAIL nếu token hết/thu hồi vẫn qua hook hoặc sai ngưỡng. Chưa nghiệm thu đầy đủ US-AUTH-04; tiếp quản không chặn PASS task này.

**Bằng chứng nộp:** Build/commit, môi trường, test thời gian/phiên, response đã che và test không lộ email; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** TE-06 nhận AC-AUTH-04-05, TE-07 kiểm tab thật; TA-09 nối web, TA-06 kiểm hồ sơ. Cơ chế cưỡng chế còn chờ quyết định; luật thời hạn không đổi.

---

### TA-06 — Máy chủ: chặn người dùng chưa hoàn tất; chặn đổi email trực tiếp qua Auth
**Epic:** EA · **Thành phần:** Authentication · **Sprint đề xuất:** 2 (08/10–10/10) · **Bắt đầu khi (is blocked by):** `TA-03`, `T0-06`
**Bắt đầu khi (kết quả cần có):** TA-03: hồ sơ completed_at/PENDING và kết quả xác thực/hoàn tất; T0-06: báo cáo GATE-OTP, kết quả thử đổi email trực tiếp và cơ chế Auth khả dụng đã đối chiếu

**Mục tiêu:** Chặn người có JWT nhưng chưa hoàn tất hồ sơ và kiểm cưỡng chế email bất biến tại Auth. Không dùng việc khóa ô email làm bằng chứng ngăn API trực tiếp.

**Yêu cầu / nguồn:** US-AUTH-03: AC-AUTH-03-04/AC-AUTH-03-05 chỉ dùng khi completed_at và hết PENDING; US-AUTH-05, AC-AUTH-05-02 email luôn khóa; BA 1.6; docs/04 §3.1; GATE-OTP.

**Kết quả (đầu ra):**
- Guard dùng chung ở đường vào/lệnh ứng dụng, đối chiếu hồ sơ có thẩm quyền.
- Cơ chế Auth khả dụng đã review để giữ email hoặc báo cáo BLOCKED nếu chưa chứng minh.

**Phạm vi / ngoài phạm vi:** Không cho client ghi profiles để vượt guard; không đổi username/reset mật khẩu P2. Cơ chế hook/config chặn email chờ quyết định, không bịa API khả dụng.

**Đầu vào cần có:** TA-03: trạng thái completed_at/PENDING và handler hoàn tất; T0-06: cấu hình thử, báo cáo từng nhánh và cơ chế chặn đổi email. Gateway/schema nhận qua tiền nhiệm TA-03.

**Cách làm gợi ý:**
1. Nhận kết luận T0-06, tách điều đã chứng minh khỏi cơ chế chờ PO.
2. Nối guard theo trạng thái TA-03 ở các đường vào/lệnh; thử metadata/profile giả.
3. Áp cơ chế email được duyệt rồi thử API Auth thật; không chỉ khóa UI/NestJS.

**Kiểm thử:** Vitest tích hợp và kiểm Auth trực tiếp. Trạng thái kế hoạch: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-AUTH-03-04 | AC-AUTH-03-04 | JWT hợp lệ nhưng không profiles/completed_at | Không dùng ứng dụng. |
| TC-X-01 | AC-AUTH-03-05 | completed_at có, PENDING còn rồi được bỏ | Trước chặn, sau mới dùng; không xóa hồ sơ. |
| Giả metadata | docs/07 §4.1 | Client tự khai hoàn tất hoặc ghi profiles | Không nâng quyền. |
| TC-AUTH-05-02 | AC-AUTH-05-02; GATE-OTP | Dùng API Auth yêu cầu đổi email | Auth/profiles không đổi; chưa cơ chế thì BLOCKED. |

**PASS khi:** Guard mọi nhánh đạt và email bất biến được chứng minh theo cơ chế duyệt. FAIL nếu chỉ chặn NestJS/UI hoặc coi JWT đủ; không ghi Done toàn task khi phần email chưa đạt.

**Bằng chứng nộp:** Revision/build và môi trường; ma trận trạng thái, test client trực tiếp, config và email trước/sau đã che. Không chứa bí mật.

**Rủi ro / chưa rõ:** T0-06 đã thành tiền đề; báo cáo chưa kết luận/không đạt không tự mở gate. Cơ chế email chờ quyết định thì phần đó BLOCKED, luật email bất biến vẫn bắt buộc.

---

### TA-07 — Web: giao diện đăng ký ba bước theo hợp đồng
**Epic:** EA · **Thành phần:** Frontend · **Sprint đề xuất:** 2 (08/10–10/10) · **Bắt đầu khi (is blocked by):** `T0-10`, `T0-03`, `TH-01`
**Bắt đầu khi (kết quả cần có):** T0-10: khung web/router chạy được; T0-03: hợp đồng kiểm tên/gửi/xác minh và mã lỗi P1; TH-01: token, input/nút/hộp thoại/thông báo và mẫu năm trạng thái có tooltip

**Mục tiêu:** Dựng wizard đăng ký ba bước có phản hồi đúng khi người dùng nhập, chờ và gặp lỗi. Web bám shared, chưa giả định backend đăng ký đã sẵn sàng.

**Yêu cầu / nguồn:** US-AUTH-01: AC-AUTH-01-01 debounce/cú pháp, AC-AUTH-01-02 tên trùng, AC-AUTH-01-03 password ≥8/khớp, AC-AUTH-01-04 chuyển bước không tạo tài khoản. AC-AUTH-02-01/AC-AUTH-02-02/AC-AUTH-02-03: email trùng, gửi mã, chờ gửi lại; AC-AUTH-03-01/AC-AUTH-03-02/AC-AUTH-03-03: thành công, hết mã, giới hạn sai; AC-AUTH-03-04/AC-AUTH-03-05/AC-AUTH-03-06: chờ phục hồi, không thành công sớm, tên bị chiếm quay bước đầu.

**Kết quả (đầu ra):**
- SCR-REGISTER với stepper, input/validation, OTP và thông báo từng bước.
- Năm trạng thái, tooltip vô hiệu và adapter shared có fixture thành công/lỗi.

**Phạm vi / ngoài phạm vi:** Chỉ UI P1; không OAuth/Khách, không lưu OTP/password vào URL/storage/log; TA-09 kiểm tích hợp thật.

**Đầu vào cần có:** T0-10: app/router; T0-03: contract kiểm tên/gửi/xác minh; TH-01: token/component nền. Fixture theo DANH-MUC, không giả backend đã hoàn tất.

**Cách làm gợi ý:**
1. Dựng wizard ba bước trong T0-10 bằng thành phần TH-01.
2. Nối adapter T0-03, debounce 300 ms và validation tại ô.
3. Chặn gửi trùng; hiển thị hạn 180 giây/gửi lại 60 giây và lỗi tên bị chiếm.

**Kiểm thử:** Playwright với adapter fixture, Vitest validation. Trạng thái kế hoạch: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-AUTH-01-03 | AC-AUTH-01-03 | Password ngắn hoặc xác nhận lệch | Nút Tiếp tục vô hiệu có lý do. |
| TC-AUTH-02-03 | AC-AUTH-02-03 | Gửi OTP, thử gửi lại trước hạn | Hiện đếm và chặn gửi. |
| TC-AUTH-03-06 | AC-AUTH-03-06 | Adapter báo username bị chiếm ở bước cuối | Quay bước đầu, không vào Sảnh. |
| TC-UISTATE-02-ERROR | AC-UI-03-01 | Thử loading/error/empty/disabled/success từng bước | Đúng bước, không thành công nếu backend chưa hoàn tất. |

**PASS khi:** Mọi nhánh UI đạt, không lưu bí mật và đủ năm trạng thái. FAIL nếu fixture success được gọi là đã gửi OTP thật.

**Bằng chứng nộp:** Revision/build và môi trường; ảnh các bước, report Playwright và kiểm storage/network đã che. Không chứa bí mật.

**Rủi ro / chưa rõ:** Phải nhận TH-01 trước khi dựng màn; năm trạng thái có tooltip dùng thống nhất. Test fixture không chứng minh gửi OTP/hoàn tất thật; tích hợp thuộc TA-09.

---

### TA-08 — Web: đăng nhập, hồ sơ cơ bản, đăng xuất
**Epic:** EA · **Thành phần:** Frontend · **Sprint đề xuất:** 2 (08/10–10/10) · **Bắt đầu khi (is blocked by):** `T0-10`, `T0-03`, `TA-11`, `TH-01`
**Bắt đầu khi (kết quả cần có):** T0-10: web/router và cấu hình public; T0-03: contract login/profile/logout, lỗi và tiếp quản cần được chốt; TA-11: handler hồ sơ chính chủ đọc/lưu Display Name có lọc từ, dữ liệu avatar và lỗi theo contract; TH-01: token, input/nút/hộp thoại/thông báo và trạng thái vô hiệu có tooltip

**Mục tiêu:** Dựng đăng nhập, hồ sơ cơ bản và ý định đăng xuất cho EA. UI không tự xóa phiên giữa ván khi chưa biết hậu quả phía máy chủ.

**Yêu cầu / nguồn:** US-AUTH-04: AC-AUTH-04-01 vào đích, AC-AUTH-04-02 lỗi chung, AC-AUTH-04-03 ghi nhớ, AC-AUTH-04-04 Guest/Google disabled, AC-AUTH-04-05 phiên mới tiếp quản. US-AUTH-05: AC-AUTH-05-01 tên hiển thị 2–30/lọc, AC-AUTH-05-02 tên đăng nhập/email khóa, AC-AUTH-05-03 avatar chữ đầu, AC-AUTH-05-04/AC-AUTH-05-05 đăng xuất theo xác nhận và đối soát.

**Kết quả (đầu ra):**
- SCR-LOGIN/SCR-PROFILE-SETTINGS và trạng thái phiên chỉ đọc.
- Form tên hiển thị, avatar, hành động đăng xuất chờ ACK/đối soát.

**Phạm vi / ngoài phạm vi:** UI P1; không đổi username/password/email hoặc upload avatar; hành vi server đăng xuất giữa ván ở TA-10.

**Đầu vào cần có:** T0-10: app/router; T0-03: contract phiên/hồ sơ/logout; TA-11: handler profile thật; TH-01: component nền. Luồng kết thúc/rời giữa ván nối riêng TA-10.

**Cách làm gợi ý:**
1. Dùng TH-01 dựng login/remember và thông báo lỗi chung.
2. Nối form hồ sơ với TA-11; kiểm tên trước gửi nhưng server quyết định, khóa username/email.
3. Gửi ý định logout, giữ chờ/lỗi đến ACK; xử lý phiên chỉ đọc theo contract.

**Kiểm thử:** Playwright UI; tích hợp thật phần hồ sơ TA-11, fixture có nhãn cho luồng phiên chưa nối. Trạng thái kế hoạch: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-AUTH-04-02 | AC-AUTH-04-02 | Sai username/password | Một thông báo chung không email. |
| TC-AUTH-05-01 | AC-AUTH-05-01 | Lưu tên hợp lệ qua TA-11, tải lại; thử tên ngoài 2–30 hoặc từ cấm | Tên hợp lệ lưu thật; sai không đổi dữ liệu, thông báo lỗi. |
| TC-AUTH-04-04 | AC-AUTH-04-04 | Bấm Guest/Google P1 | Disabled và Sắp ra mắt. |
| TC-AUTH-05-05 | AC-AUTH-05-05 | Mất ACK khi đăng xuất giữa ván | Giữ chờ/lỗi, không xóa phiên giả thành công. |

**PASS khi:** Mọi ca UI và lưu/đọc lại hồ sơ qua TA-11 đạt. FAIL nếu tự đổi kết quả hoặc báo lưu chưa ACK. Không dùng fixture phiên để nghiệm thu logout giữa ván.

**Bằng chứng nộp:** Revision/build và môi trường; ảnh login/profile/năm trạng thái, test UI và kiểm dữ liệu nhạy cảm. Không chứa bí mật.

**Rủi ro / chưa rõ:** Handler profile và component nền đã có tiền đề, không còn lý do bỏ thử lưu thật. Kết thúc/rời giữa ván ở TA-10; tiếp quản liên miền ở TE-06, không báo toàn bộ phiên đã đạt bằng fixture.

---

### TA-09 — Tích hợp đăng ký, đăng nhập và chuyển hướng vào phòng (web ↔ máy chủ)
**Epic:** EA · **Thành phần:** Frontend, Authentication · **Sprint đề xuất:** 2 (08/10–10/10) · **Bắt đầu khi (is blocked by):** `TA-03`, `TA-05`, `TA-07`, `TA-08`, `TA-06`, `TA-11`
**Bắt đầu khi (kết quả cần có):** TA-03: handler verify/hoàn tất và trạng thái phục hồi; TA-05: handler login/phiên theo shared; TA-07: wizard có adapter và đủ trạng thái; TA-08: login/profile/logout UI theo shared; TA-06: guard tài khoản hoàn tất và kết quả chặn email trực tiếp; TA-11: handler read/update hồ sơ chính chủ với bộ lọc và avatar

**Mục tiêu:** Nối web đăng ký/đăng nhập/hồ sơ với máy chủ Auth để kiểm tài khoản thật. Phạm vi chỉ US-AUTH-01..05; chuyển hướng lời mời thực hiện ở TA-12.

**Yêu cầu / nguồn:** US-AUTH-01..05 theo docs/01 và docs/08: AC-AUTH-03-01 hoàn tất/tự đăng nhập; AC-AUTH-03-04/AC-AUTH-03-05 chặn/phục hồi bản dở; AC-AUTH-04-02 lỗi chung; AC-AUTH-04-03 hạn phiên; AC-AUTH-05-01 lưu tên có lọc; AC-AUTH-05-02 field bất biến; AC-AUTH-05-03 avatar. Các nhánh logout/tiếp quản giữ kiểm riêng khi đủ handler.

**Kết quả (đầu ra):**
- Adapter thật TA-07/TA-08 ↔ TA-03/TA-05/TA-06/TA-11.
- Báo cáo E2E đăng ký/login/hồ sơ và danh sách nhánh 01–05 còn bị chặn.

**Phạm vi / ngoài phạm vi:** Không nhận link/room.join hoặc kiểm redirect trong task này, dù tên khung còn chữ chuyển hướng. Không mock thư/lưu hồ sơ để báo tích hợp đạt.

**Đầu vào cần có:** TA-03/TA-05: handler đăng ký/login; TA-07/TA-08: màn có adapter; TA-06: guard và chặn email; TA-11: read/update profile. Dùng Auth thử thật, email nhóm và quota T0-05.

**Cách làm gợi ý:**
1. Nối adapter web với đủ bốn đầu ra server, không bỏ qua TA-06.
2. Đăng ký/login vào Sảnh, đọc/lưu hồ sơ qua TA-11 rồi tải lại.
3. Gây lỗi OTP/bản dở/quyền/ACK; ghi đúng nhánh cần TA-04/TA-10/TE-06 kiểm tiếp.

**Kiểm thử:** Playwright E2E và tích hợp Auth/profile thật. Trạng thái kế hoạch: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-AUTH-03-01 | AC-AUTH-03-01 | Đăng ký nhận OTP thật rồi vào Sảnh | Một tài khoản hoàn tất, display_name=username. |
| TC-AUTH-03-04 | AC-AUTH-03-04 | JWT hợp lệ nhưng hồ sơ dở gọi ứng dụng | Guard TA-06 chặn, UI không báo hoàn tất. |
| TC-AUTH-04-02 | AC-AUTH-04-02 | Đăng nhập sai tên hoặc mật khẩu | Cùng lỗi, không lộ email. |
| TC-AUTH-05-01 | AC-AUTH-05-01 | Lưu tên hợp lệ rồi gửi tên cấm trực tiếp | Lần đúng lưu thật; lần sai từ chối, giữ dữ liệu cũ. |

**PASS khi:** Các ca tích hợp trên đạt bằng dịch vụ thật. FAIL nếu bỏ guard, mock thư hoặc chỉ update UI. Không ghi toàn US-AUTH-01..05 PASS khi nhánh phụ thuộc chưa kiểm.

**Bằng chứng nộp:** Revision/build và môi trường; report E2E, trạng thái Auth/profile, log đã che và danh mục nhánh PASS/FAIL/BLOCKED. Không chứa bí mật.

**Rủi ro / chưa rõ:** TA-09 giữ tên khung nhưng không chứa redirect. Quét định kỳ TA-04, logout TA-10, tiếp quản TE-06 là nhánh chưa đủ tiền đề để nghiệm thu trọn US; báo cuối, không tự thêm cạnh.

---

### TA-10 — Đăng xuất chủ động giữa ván: xác nhận, đầu hàng, rời phòng rồi đăng xuất
**Epic:** EA · **Thành phần:** Authentication · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `TD-04`, `TA-08`, `TB-07`, `TG-02`
**Bắt đầu khi (kết quả cần có):** TD-04: handler RESIGN/kết quả online có tính duy nhất; TA-08: UI đăng xuất và hộp xác nhận, trạng thái chờ/lỗi; TB-07: handler rời/chuyển Host/đóng phòng và giải phóng membership/vị trí; TG-02: ván AI phía server và sổ vị trí, giao diện kết thúc/hủy phiên tìm khi chủ động rời

**Mục tiêu:** Nối xác nhận đăng xuất với kết thúc ván/rời chỗ rồi mới xóa phiên. Người dùng không bị biến hành động chủ động thành mất mạng có ân hạn.

**Yêu cầu / nguồn:** US-AUTH-05: AC-AUTH-05-04 xác nhận/RESIGN/rời/logout, AC-AUTH-05-05 lỗi hoặc mất ACK đối soát cùng lệnh; BA 1.8/6.3; docs/07 §4.3; TC-X-03.

**Kết quả (đầu ra):**
- Luồng web confirm ↔ server kết thúc/rời ↔ logout có phản hồi rõ.
- Xử lý Huỷ, lặp/mất ACK, ván đã kết thúc và AI hủy tác vụ/giải phóng vị trí.

**Phạm vi / ngoài phạm vi:** Cả CASUAL và AI P1, không Elo/RANKED; không dùng đóng tab như xác nhận đầu hàng.

**Đầu vào cần có:** TA-08: confirm/logout UI; TD-04: RESIGN online duy nhất; TB-07: rời/chuyển Host/giải phóng ghế; TG-02: AI và vị trí. Hợp đồng hủy tìm theo docs/04 §8.

**Cách làm gợi ý:**
1. UI TA-08 kiểm trạng thái, focus Huỷ và chỉ gửi khi xác nhận.
2. Online nối TD-04 rồi TB-07; AI gọi TG-02 kết thúc/hủy tác vụ/nhả vị trí.
3. Đợi kết quả có thẩm quyền mới xóa phiên; mất ACK đối soát cùng commandId, không RESIGN lại.
4. Kiểm Huỷ, ván đã kết thúc và kết quả AI trễ.

**Kiểm thử:** Vitest tích hợp và Playwright nhiều client. Trạng thái kế hoạch: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-X-03 | AC-AUTH-05-04 | Thử Huỷ rồi xác nhận trong ván online | Huỷ không tác động; xác nhận RESIGN một lần rồi rời/logout. |
| TC-AUTH-05-05 | AC-AUTH-05-05 | Mất ACK rồi thử lại cùng định danh | Không hai kết quả, không báo logout sớm. |
| TC-AI-03-04 | AC-AI-03-04 | Đăng xuất khi máy đang tìm | RESIGN, hủy tác vụ, giải phóng vị trí. |
| Ván đã kết thúc | docs/07 §4.3 | Kết quả chốt trước lệnh logout tới | Giữ kết quả, vẫn xử lý rời/logout. |

**PASS khi:** Cả online và AI, lỗi/ACK và Huỷ đạt. FAIL nếu chỉ xóa token client hoặc ghi đè ván kết thúc; thiếu đường AI/rời thì BLOCKED.

**Bằng chứng nộp:** Revision/build và môi trường; timeline xác nhận/lệnh/kết quả/rời/logout, report E2E và log hủy AI. Không chứa bí mật.

**Rủi ro / chưa rõ:** TB-07/TG-02 đã là tiền đề; không còn giả thiếu room.leave/AI. Xác nhận TG-02 có artifact hủy tìm; nếu chỉ ở TG-03 thì thiếu cạnh cần nhóm chốt, không coi gọi stub là đạt.

---

### TA-11 — Máy chủ: hồ sơ cơ bản (đọc hồ sơ chính chủ, Display Name có lọc từ, avatar mặc định)
**Epic:** EA · **Thành phần:** Authentication · **Sprint đề xuất:** 2 (08/10–10/10) · **Bắt đầu khi (is blocked by):** `T0-11`, `T0-04`, `T0-14`
**Bắt đầu khi (kết quả cần có):** T0-11: gateway xác thực danh tính và contract ACK/lỗi; T0-04: profiles, chính sách cột/quyền và ràng buộc dữ liệu; T0-14: bộ lọc/version từ cấm, chế độ từ chối tên đã kiểm

**Mục tiêu:** Cung cấp điểm đọc/sửa hồ sơ chính chủ cho web EA. Chỉ Display Name được đổi trong P1; kết quả server là nguồn để avatar và thông tin hồ sơ cập nhật.

**Yêu cầu / nguồn:** US-AUTH-05: AC-AUTH-05-01 tên 2–30 ký tự, có dấu/khoảng trắng, từ cấm từ chối; AC-AUTH-05-02 username/email không sửa ở P1; AC-AUTH-05-03 avatar từ chữ cái đầu, không tải ảnh. BA 1.4/1.6; docs/03 §2.1; NFR-04 quyền phía server.

**Kết quả (đầu ra):**
- Handler read/update hồ sơ chính chủ và phản hồi validation/quyền theo shared.
- Dữ liệu Display Name/avatar nhất quán sau lưu; test đọc lại, cột bất biến và chống sửa hồ sơ người khác.

**Phạm vi / ngoài phạm vi:** Không upload, đổi username/email/password, profile người khác hoặc logout. Email chỉ trả chính chủ ở màn hồ sơ, không endpoint công khai.

**Đầu vào cần có:** T0-11: danh tính từ phiên; T0-04: profiles/quyền/điều kiện hoàn tất; T0-14: lọc từ cấm tại server, không tin client đã lọc.

**Cách làm gợi ý:**
1. Xác định chính chủ và trạng thái hồ sơ trước đọc/ghi.
2. Chỉ nhận thay đổi Display Name, kiểm độ dài và T0-14; không yêu cầu OTP/unique cho tên hiển thị.
3. Ghi thành công rồi trả hồ sơ/avatar; lỗi giữ dữ liệu cũ.
4. Kiểm trực tiếp API/quyền DB và bàn giao adapter cho TA-08.

**Kiểm thử:** Vitest tích hợp gateway/CSDL. Trạng thái kế hoạch: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-AUTH-05-01 | AC-AUTH-05-01 | Lưu tên tại biên 2/30, có dấu/khoảng trắng và trùng Display Name khác | Được lưu không OTP; đọc lại/avatar khớp. |
| Tên sai/cấm | AC-AUTH-05-01 | Thử ngoài biên và từ cấm biến thể qua API | Từ chối, không sửa tên cũ hoặc lưu ***. |
| Field bất biến | AC-AUTH-05-02 | Gửi username/email kèm update và thử sửa user khác | Không thay field/người khác, không lộ hồ sơ. |
| TC-AUTH-05-03 | AC-AUTH-05-03 | Đổi tên rồi đọc avatar; thử tải ảnh | Avatar theo chữ đầu, không có chức năng upload. |
| Lỗi/phiên | NFR-04 | Phiên sai/bản dở hoặc lỗi ghi DB | Không cấp dữ liệu ngoài quyền, không ACK lưu thành công. |

**PASS khi:** Mọi ca đạt với server/DB thật. FAIL nếu chỉ chặn UI, cho sửa field bất biến hoặc báo lưu khi DB lỗi. Chặn đổi email tại Auth trực tiếp vẫn kiểm riêng TA-06.

**Bằng chứng nộp:** Revision/build và môi trường; request/response đã che, hồ sơ trước/sau và log test quyền/rollback. Không chứa bí mật.

**Rủi ro / chưa rõ:** Chốt tên endpoint trong shared trước tích hợp, không bịa route. Chữ đầu Unicode khó cần fixture nhóm xác nhận, không tự đổi chính sách tên.

---

### TA-12 — Tích hợp chuyển hướng vào phòng sau đăng nhập (web ↔ máy chủ)
**Epic:** EA · **Thành phần:** Frontend, Room Management · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `TA-09`, `TB-03`, `TB-09`, `TB-06`, `TB-07`, `TD-09`
**Bắt đầu khi (kết quả cần có):** TA-09: luồng web–Auth thật, tín hiệu tài khoản/phiên hoàn tất và lỗi; TB-03: room.join thật kiểm link/mã/quyền/sức chứa và xếp vai; TB-09: phòng chờ/denied có adapter room.state và hiển thị nguyên nhân; TB-06: handler khóa/mở, mã-link hiện hành và policy người mới/cũ; TB-07: handler kick/chặn và snapshot quyền phòng sau thay đổi; TD-09: UI ván cùng adapter match.move/match.state chạy thật, nhận Match ID

**Mục tiêu:** Nối xác thực với room.join để mở lời mời vào đúng phòng. Phần US-AUTH-06 tách khỏi TA-09, vẫn kiểm quyền/chỗ lúc join.

**Yêu cầu / nguồn:** US-AUTH-06: AC-AUTH-06-01 chưa đăng nhập đi qua login/register rồi tự vào; AC-AUTH-06-02 đã đăng nhập vào thẳng. US-ROOM-05: AC-ROOM-05-01 ưu tiên ghế rồi xem, AC-ROOM-05-02 đầy từ chối, AC-ROOM-05-04 khóa/kick từ chối; BA 2.4/2.8, docs/07 §5.

**Kết quả (đầu ra):** - Adapter Auth→room.join→phòng chờ/denied hoặc màn PLAYING đúng Match ID.
- E2E giữ đích mời qua login/register, kiểm quyền lại khi vào và nhận thế ván thật.

**Phạm vi / ngoài phạm vi:** Chỉ link/mã P1 theo contract; không QR/Guest/Google. Không giữ ghế trong lúc login, không tự bỏ guard hoặc chuyển sang phòng khác khi lời mời hỏng.

**Đầu vào cần có:** TA-09: phiên/Auth thật; TB-03: join/xếp vai; TB-09: phòng chờ/denied; TB-06: khóa/mã; TB-07: kick/block; TD-09: UI/adapter ván PLAYING. Không đưa OTP/password vào URL/log.

**Cách làm gợi ý:** 1. Giữ đích khi login/register; chỉ join sau tài khoản hoàn tất từ TA-09.
2. TB-03 xét quyền/state mới nhất; WAITING hiển thị TB-09, PLAYING nối TD-09 bằng Match ID thật.
3. Dùng TB-06/07 đổi khóa/mã/kick trong khi đang xác thực, không fixture thay handler.
4. Có phiên thì cùng đường join; retry cùng định danh, không giữ chỗ trước.

**Kiểm thử:** Playwright nhiều context với Auth/phòng/ván thật. Trạng thái: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Qua Auth | AC-AUTH-06-01 | Mở link chưa login; thử login và đăng ký hoàn tất | Tự vào đúng phòng, không bấm lại link hoặc dừng ở token. |
| PLAYING | AC-AUTH-06-02; AC-ROOM-05-01 | Đã login mở lời mời ván TD-09 đang chạy, còn chỗ xem | Đúng Match ID/vai, nhận thế thật tại màn ván, không chỉ đổi URL. |
| Quyền đổi | AC-ROOM-05-02/04 | TB-06 khóa/thu mã hoặc TB-07 kick trước join; thử phòng đầy | Denied thật đúng nguyên nhân, không vào phòng khác. |
| Dở/retry | docs/07 §3–4 | Tài khoản dở thử join; mất ACK sau join rồi retry | Guard thật chặn dở; không nhân membership. |

**PASS khi:** Mọi ca Auth→join→WAITING/PLAYING/denied đạt trên hai phía thật đã có. FAIL nếu bypass quyền, chỉ đổi URL hoặc tạo trùng. Không đòi clock/media runtime để PASS redirect.

**Bằng chứng nộp:** Revision/build và môi trường; video E2E, timeline Auth→join→room.state và membership đã che token. Không chứa bí mật.

**Rủi ro / chưa rõ:** Đã có TB-06/07/TD-09, không còn blocker khóa/kick/màn PLAYING. Đồng hồ chạy ở TD-10, reconnect ở TD-11; đây không phải nhiệm vụ nghiệm thu mọi hành vi bên trong ván.

---
