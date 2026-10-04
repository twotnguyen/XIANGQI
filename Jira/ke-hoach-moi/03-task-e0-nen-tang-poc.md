# Kế hoạch mới (bản nháp) — 03: Task của Epic E0 — Nền tảng và PoC rủi ro

**Ngày:** 2026-10-04 · **Trạng thái:** ĐỀ XUẤT, chờ PO và nhóm duyệt · Chưa tạo gì trên Jira. Khung, phụ thuộc và Sprint: `01-components-epic-khung-task.md`; Description Epic: `02-epic.md`.

Epic gồm **15 task**. Mỗi task: dòng đầu (Epic, thành phần, Sprint, **is blocked by**) lấy từ khung; **Bắt đầu khi (kết quả cần có)** nêu hiện vật cụ thể của từng tiền đề. Chưa có ước lượng giờ và người nhận việc (nhóm điền khi Sprint Planning).

### T0-01 — Khởi tạo monorepo pnpm, TypeScript, lint, Vitest
**Epic:** E0 · **Thành phần:** DevOps · **Sprint đề xuất:** 1 (04/10–07/10) · **Bắt đầu khi (is blocked by):** — (không cần task nào)
**Bắt đầu khi (kết quả cần có):** Không có task tiền nhiệm trong khung; chỉ thực thi sau khi được phép Giai đoạn 4.

**Mục tiêu:** Tạo nền kho để các miền cùng cài đặt, biên dịch và kiểm thử được. Đây là đầu vào kỹ thuật cho E0, không phải Increment chơi cờ.

**Yêu cầu / nguồn:** AGENTS §4.4, §6; docs/04 §2 xác định TypeScript/pnpm workspace, Vitest; docs/05 §7 yêu cầu kiểm trước hợp nhất. Không có AC chức năng riêng cho bootstrap.

**Kết quả (đầu ra):**
- Workspace và manifest có phiên bản công cụ/lockfile; gói luật và shared có ranh giới.
- Các script cài đặt, build, lint, test cùng hướng dẫn chạy và báo lỗi.

**Phạm vi / ngoài phạm vi:** Chỉ nền P1; chưa dựng tính năng, không Tailwind/thư viện UI hoặc công nghệ ngoài danh sách chưa duyệt.

**Đầu vào cần có:** Cấu trúc dự kiến apps/web, apps/server, apps/ai-worker, packages/rules, packages/shared trong docs/04; quyền làm nhánh theo AGENTS.

**Cách làm gợi ý:**
1. Xác nhận phiên bản Node/pnpm và công cụ lint với nhóm.
2. Thiết lập workspace, TypeScript và script có tác dụng thật.
3. Thêm kiểm thử nền Vitest; chạy cài sạch, build, lint, test và ghi lệnh thực tế.

**Kiểm thử:** Kiểm kỹ thuật trên checkout thử.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Cài sạch | Workspace | Cài bằng lockfile trên môi trường sạch | Không phụ thuộc thư viện cài toàn cục ngoài công cụ đã ghi. |
| Build/lint/test | docs/05 §7 | Chạy các script vừa định nghĩa | Mỗi bước thực sự xử lý đầu vào và trả trạng thái đúng. |
| Lỗi chủ động | Cổng kiểm | Đưa lỗi type/test vào bản thử, chạy lại | Thất bại được phát hiện; không dùng script rỗng báo xanh. |

**PASS khi:** Cài sạch và các bước nền đạt; lỗi chủ động bị bắt. FAIL nếu bỏ qua test/type hoặc cần cấu hình bí mật trong repo.

**Bằng chứng nộp:** Build/commit, môi trường, lockfile, phiên bản công cụ, log cài/build/lint/test và ca thất bại có kiểm soát; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** Phiên bản và công cụ lint cụ thể chưa có trong đặc tả, nhóm chốt; không xem skeleton là ứng dụng hoàn tất.

### T0-02 — Thiết lập CI (build, lint, test) cho mọi nhánh
**Epic:** E0 · **Thành phần:** DevOps · **Sprint đề xuất:** 1 (04/10–07/10) · **Bắt đầu khi (is blocked by):** `T0-01`
**Bắt đầu khi (kết quả cần có):** T0-01: workspace cài sạch được và script build/lint/Vitest trả mã lỗi chính xác

**Mục tiêu:** Tự động kiểm build, lint và test khi thay đổi mã. CI tạo bằng chứng kỹ thuật cho các miền, không thay kiểm chấp nhận P1.

**Yêu cầu / nguồn:** docs/05 §7: cổng hợp nhất kiểm đơn vị/tích hợp, diff và bí mật. AGENTS §5 cấm né CI/push trực tiếp nhánh bảo vệ. Task chỉ kiểm pipeline nền, không nghiệm thu chức năng chưa có.

**Kết quả (đầu ra):** - Cấu hình CI chạy trên các nhánh theo khung, dùng lockfile và script thật.
- Log/artifact test gắn revision; hướng dẫn đọc failure và chạy lại.

**Phạm vi / ngoài phạm vi:** Không tự sửa quyền kho, branch protection hoặc cấp secret; không triển khai production/P2.

**Đầu vào cần có:** T0-01: workspace/lockfile và script build/lint/Vitest có mã lỗi đúng. Runner tương thích manifest và quyền chạy workflow trên nhánh thử được phép.

**Cách làm gợi ý:** 1. Dùng đúng script T0-01 trong workflow.
2. Thiết lập trigger không bỏ nhánh cần kiểm; tránh đưa secret vào log.
3. Chạy trên nhánh thử được phép, gây lỗi test/lint rồi phục hồi bằng thay đổi bình thường.

**Kiểm thử:** CI và Vitest. Trạng thái kế hoạch: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Nhánh hợp lệ | Cổng hợp nhất | Đẩy thay đổi thử qua quy trình được phép | Build/lint/test có log và revision. |
| Test lỗi | Không né CI | Làm assertion sai trong nhánh thử | Job đỏ, không continue-on-error che lỗi. |
| Cấu hình thiếu | Quyền/secret | Chạy khi thiếu biến phục vụ bài kiểm cần dịch vụ | Báo thiếu cấu hình, không báo test tích hợp PASS. |

**PASS khi:** Workflow bắt lỗi và chạy xanh sau sửa; đủ trigger đã thống nhất. FAIL nếu lỗi bị che hoặc chỉ chạy trang trí.

**Bằng chứng nộp:** Build/commit, môi trường, URL run hoặc log export, revision và đối chiếu trigger; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** Cấu hình CI hiện hữu phải đọc trước khi sửa ở GĐ4; quyền ngoài repo cần phép riêng, không tự thiết lập branch protection.

---

### T0-03 — Gói hợp đồng chung `packages/shared`: kiểu dữ liệu, sự kiện, mã lỗi, commandId
**Epic:** E0 · **Thành phần:** Backend · **Sprint đề xuất:** 1 (04/10–07/10) · **Bắt đầu khi (is blocked by):** `T0-01`
**Bắt đầu khi (kết quả cần có):** T0-01: workspace TypeScript và cơ chế import nội bộ build được

**Mục tiêu:** Tạo hợp đồng dữ liệu chung cho web và máy chủ phát triển không đoán payload. Shared thống nhất ý nghĩa lệnh của E0 và các Epic nghiệp vụ.

**Yêu cầu / nguồn:** docs/04 §4.1; docs/07 §2–3; US-PLAY-01: AC-PLAY-01-03 chống trùng/version cũ; NFR-04 kiểm quyền ở server. Tên lỗi chưa có trong nguồn do nhóm chốt.

**Kết quả (đầu ra):**
- Kiểu phòng/ván/vai trò, payload/ACK/snapshot P1 và commandId/matchVersion.
- Danh mục lỗi có hành vi UI, ví dụ dữ liệu hợp lệ/sai và phiên bản hợp đồng.

**Phạm vi / ngoài phạm vi:** P1; không triển khai handler, không đưa lệnh P2 thành chức năng bật. Lọc biên lai theo quyền hiện tại vẫn ghi chờ quyết định về thiết kế.

**Đầu vào cần có:** Bảng sự kiện docs/04, ma trận quyền docs/07, hệ tọa độ gốc và trạng thái phòng/ván riêng biệt.

**Cách làm gợi ý:**
1. Liệt kê ý định P1 và dữ liệu được trả theo vai.
2. Định nghĩa hợp đồng xác thực, ACK lỗi, snapshot và retry cùng commandId.
3. Biên dịch phía dùng thử và kiểm fixture; ghi câu hỏi thiếu thay tự đặt mã nghiệp vụ.

**Kiểm thử:** Vitest cho hợp đồng; kiểm kiểu và tích hợp mẫu.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-PLAY-01-03 | AC-PLAY-01-03 | Mô tả lệnh mới, lệnh trùng, version cũ | Ba trường hợp phân biệt, không hứa thực thi hai lần. |
| Payload sai | docs/07 §3 | Đưa thiếu định danh, sai tọa độ hoặc role tự khai | Hợp đồng quy định từ chối; không tin dữ liệu quyền từ client. |
| Quyền dữ liệu | NFR-04 | Đối chiếu snapshot người xem/người ngoài | Không có chat riêng/email/token trong dữ liệu ngoài quyền. |

**PASS khi:** Mọi sự kiện P1 có input/output/lỗi rõ và fixture kiểm được; FAIL nếu hai phía phải đoán hoặc cùng tên có hai nghĩa.

**Bằng chứng nộp:** Build/commit, môi trường, bản hợp đồng, fixture, kết quả kiểm kiểu và test; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** Chi tiết API còn là thiết kế, không khẳng định endpoint đã tồn tại; biên lai nhạy cảm cần PO review theo docs/07 §3.

### T0-04 — Schema Supabase: migration cho tài khoản, phòng, ván, nước đi, bạn bè, chat, biên lai
**Epic:** E0 · **Thành phần:** Backend · **Sprint đề xuất:** 1 (04/10–07/10) · **Bắt đầu khi (is blocked by):** `T0-01`
**Bắt đầu khi (kết quả cần có):** T0-01: workspace và nơi quản lý migration SQL theo thiết kế

**Mục tiêu:** Tạo schema và quyền dữ liệu nền cho tài khoản, phòng và ván P1. Migration là đầu vào bền cho server, không tự triển khai toàn bộ hành vi của EA/EB.

**Yêu cầu / nguồn:** docs/03 §2, §3, §5; NFR-04; US-ROOM-01 với AC-ROOM-01-02 tạo mã/Host và AC-ROOM-01-04 bất biến cấu hình. SQL migration, không prisma migrate.

**Kết quả (đầu ra):**
- Migration cho profiles, rooms, room_participants, room_blocks, matches, match_moves, command_receipts, chat_messages, friendships/friend_declines.
- Ràng buộc/chỉ mục và quyền đọc/ghi; báo cáo chạy trên Supabase thử.

**Phạm vi / ngoài phạm vi:** Không schema phục vụ Elo/chat 1-1/đổi username P2; AI P1 ở bộ nhớ, không lưu bảng ai_games chỉ vì danh mục gọi là bảng P1.

**Đầu vào cần có:** Mô hình docs/03; Supabase thử có quyền cần thiết, không dùng dữ liệu production.

**Cách làm gợi ý:**
1. Đối chiếu cột P1 và thứ tự khóa ngoại.
2. Tạo ràng buộc duy nhất/giới hạn, chính sách cột công khai profiles và chặn ghi client.
3. Chạy migration trên CSDL thử sạch rồi thử quyền bằng client và server.

**Kiểm thử:** Tích hợp Vitest/CSDL thử.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Dữ liệu hợp lệ | docs/03 §2 | Tạo hồ sơ/phòng/ván/nước theo quan hệ | Lưu đúng FK và kiểu dữ liệu. |
| Tên/ghế trùng | docs/03 §2.1/2.4 | Ghi username khác hoa thường và hai ghế Đỏ cùng phòng | Ràng buộc từ chối trùng. |
| Client trái quyền | NFR-04 | Dùng quyền client ghi phòng hoặc đọc email người khác | Bị từ chối; không lộ khóa dịch vụ. |
| Mã phòng | docs/07 §5 | Thử mã lưu có dấu gạch như dạng hiển thị | Chỉ giá trị chuẩn tám ký tự được lưu. |

**PASS khi:** Migration chạy và mọi ca ràng buộc/quyền đạt. FAIL nếu client ghi trạng thái hoặc đọc cột bí mật; kiểm sức chứa runtime thuộc EB.

**Bằng chứng nộp:** Build/commit, môi trường, migration SQL, catalog/ràng buộc và kết quả test quyền; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** Tên bảng/cột là đề xuất; chọn cơ chế giới hạn cần review. Không giữ khóa CSDL khi gọi dịch vụ ngoài; hợp đồng chung (T0-03) và schema (T0-04) giao nhau ở trạng thái, cột và biên lai: nhóm chốt hiện vật chung từng hợp đồng một trước khi hiện thực phần giao nhau.

### T0-05 — Cấu hình Supabase Auth: OTP 180s/60s, giới hạn tốc độ xác minh, SMTP mặc định
**Epic:** E0 · **Thành phần:** Authentication · **Sprint đề xuất:** 1 (04/10–07/10) · **Bắt đầu khi (is blocked by):** `T0-01`
**Bắt đầu khi (kết quả cần có):** T0-01: quy ước môi trường và workspace không lộ bí mật

**Mục tiêu:** Cấu hình Supabase Auth cho OTP đăng ký P1 theo quyết định PO. Đầu ra cấu hình phục vụ PoC và máy chủ EA, không tạo tài khoản demo.

**Yêu cầu / nguồn:** BA 1.1/1.5/10.1; docs/04 §3.1; US-AUTH-02, AC-AUTH-02-03 gửi lại 60 giây; US-AUTH-03, AC-AUTH-03-02 hết mã 180 giây, AC-AUTH-03-03 chặn sai gần đúng.

**Kết quả (đầu ra):**
- Cấu hình hạn OTP/gửi lại/xác minh, template thư sáu số; bản ghi đã che bí mật.
- Danh sách điều kiện email được phép, hạn mức thực tế và cách kiểm cấu hình.

**Phạm vi / ngoài phạm vi:** Dùng SMTP mặc định Supabase; không SMTP ngoài, Google/Khách. Tạo tài khoản demo thuộc TQ-06, không thuộc đầu ra này.

**Đầu vào cần có:** T0-01 cung cấp workspace và quy ước môi trường không lộ bí mật; cần quyền cấu hình Supabase thử và email thành viên nhóm được phép nhận.

**Cách làm gợi ý:**
1. Đặt hạn mã 180 giây, gửi lại 60 giây và template OTP.
2. Ghi cấu hình giới hạn xác minh gần đúng, email được phép và quota.
3. Đọc lại cấu hình, kiểm thư/lỗi trong quota; bàn giao thông tin kết nối công khai và cách cấp bí mật phía server.

**Kiểm thử:** Kiểm thủ công cấu hình và tích hợp Auth thử. Trạng thái kế hoạch: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-AUTH-02-03 | AC-AUTH-02-03 | Gửi lại trước và tại hạn 60 giây | Không gửi quá sớm. |
| TC-AUTH-03-02 | AC-AUTH-03-02 | Xác minh trước/sau 180 giây | Mã hết hạn không kích hoạt tài khoản. |
| TC-AUTH-03-03 | AC-AUTH-03-03 | Nhập sai liên tiếp trên IP thử | Ghi giới hạn thực; không giả đếm chính xác mỗi mã. |
| Email/quota | BA 10.1 | Thử địa chỉ ngoài nhóm hoặc hết quota | Nhận lỗi thật; không báo đã gửi. |

**PASS khi:** Cấu hình đọc lại khớp nguồn và các ca cấu hình trên đạt. FAIL nếu gửi magic link thay mã, dùng SMTP khác hoặc bỏ giới hạn; PoC đầy đủ thuộc T0-06.

**Bằng chứng nộp:** Revision/build và môi trường; ảnh cấu hình đã che, log kiểm và số thư thực gửi; không chứa mã OTP. Không chứa bí mật.

**Rủi ro / chưa rõ:** Quota khoảng hai thư/giờ theo nguồn không là SLA; quota hết ghi BLOCKED phần kiểm thật. Không dùng tài khoản demo chưa có để báo cấu hình đạt.

---

### T0-06 — PoC OTP thật (GATE-OTP): thư thật, hạn mức, quét dọn, chặn đổi email
**Epic:** E0 · **Thành phần:** Authentication, QA · **Sprint đề xuất:** 1 (04/10–07/10) · **Bắt đầu khi (is blocked by):** `T0-05`
**Bắt đầu khi (kết quả cần có):** T0-05: cấu hình OTP đã ghi, hộp thư nhóm và quota thử khả dụng

**Mục tiêu:** Supabase thật đáp ứng từng nhánh GATE-OTP đến đâu? Báo cáo giúp chọn cơ chế EA, không thay triển khai đăng ký.

**Timebox:** nhóm đặt.

**Yêu cầu / nguồn:** GATE-OTP tại docs/05 §11; AC-AUTH-03-02 hết hạn, AC-AUTH-03-03 giới hạn gần đúng, AC-AUTH-03-04/AC-AUTH-03-05 chặn và phục hồi; BA 1.6 cấm đổi email.

**Kết quả (đầu ra):**
- Báo cáo đạt/không đạt/chưa kết luận theo từng nhánh; số đo quota/hạn/gửi lại.
- Thử nghiệm gián đoạn/dọn và API đổi email, cấu hình và phương án cho nhóm review.

**Phạm vi / ngoài phạm vi:** PoC P1 trên môi trường thử, không SMTP mới. Cơ chế chặn đổi email và ca lỗi quota bổ sung chờ quyết định; luật email bất biến vẫn bắt buộc.

**Đầu vào cần có:** Dữ liệu đăng ký dở và mô hình completed_at/PENDING; prototype phục hồi cần schema/mô hình, thiếu dependency ghi cuối.

**Cách làm gợi ý:**
1. Lập bảng câu hỏi/ngưỡng từ gate.
2. Thử thư thật và các biên thời gian; ghi số xác minh sai thực.
3. Gây gián đoạn prototype ở các mốc hoàn tất, thử gọi đổi email trực tiếp.
4. Tách nhánh đã chứng minh, thiếu đầu vào và phương án cần PO.

**Kiểm thử:** Tích hợp Auth thật, Vitest prototype; không lấy mock làm chứng cứ gửi thư.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-AUTH-03-02 | AC-AUTH-03-02 | Dùng mã quá 180 giây | Không hoàn tất đăng ký. |
| TC-X-01 | AC-AUTH-03-05 | Có completed_at còn PENDING; phục hồi lặp | Giữ tài khoản, bỏ cờ rồi mới dùng. |
| TC-X-02 | AC-AUTH-03-04 | Hoàn tất và dọn cùng danh tính | Không xóa hồ sơ hoàn tất. |
| Đổi email trực tiếp | GATE-OTP, chờ quyết định cơ chế | Gọi Auth bằng phiên thử và khóa công khai | Ghi email trước/sau; chưa chặn được thì báo không đạt. |

**PASS khi:** Task PASS khi báo cáo tái lập, trả lời rõ từng câu hỏi; nhánh gate chỉ PASS khi phép thử đạt nguồn. FAIL nếu bịa số hoặc dùng mock thư.

**Bằng chứng nộp:** Build/commit, môi trường, log đã che, mốc thời gian, config, trạng thái trước/sau và báo cáo từng nhánh; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** Prototype không thay TA-03/TA-04/TA-06; hết quota/thiếu cơ chế khả dụng ghi BLOCKED, không tự bỏ email bất biến.

### T0-07 — PoC LiveKit Cloud (GATE-MEDIA): quyền theo người, thu hồi token, tab mới
**Epic:** E0 · **Thành phần:** Communication, QA · **Sprint đề xuất:** 1 (04/10–07/10) · **Bắt đầu khi (is blocked by):** `T0-01`
**Bắt đầu khi (kết quả cần có):** T0-01: runtime TypeScript và cấu hình thử không lộ secret

**Mục tiêu:** LiveKit Cloud có thực thi quyền theo từng người và chặn token cũ sau thu hồi không? Bằng chứng mở đường EE, chưa nghiệm thu media sản phẩm.

**Timebox:** nhóm đặt.

**Yêu cầu / nguồn:** GATE-MEDIA, docs/04 §7; AC-MEDIA-01-02 ba mức chia sẻ, AC-MEDIA-02-01 cấm người xem phát, AC-MEDIA-02-02 nhận đúng luồng, AC-MEDIA-03-01 tab mới tiếp quản; BA 4.1/4.2.

**Kết quả (đầu ra):**
- Prototype quyền với người chơi/người xem và báo cáo từng tình huống.
- Số đo cửa sổ thu hồi token cũ, quota sử dụng và giới hạn Cloud.

**Phạm vi / ngoài phạm vi:** Cloud được PO chọn; không tự dựng SFU, ghi hình/ghi âm hay bật media mặc định. Cơ chế thu hồi cụ thể ở docs/04 còn chờ quyết định.

**Đầu vào cần có:** Dự án LiveKit Cloud thử, thiết bị có camera/mic, các danh tính thử gắn vai; không dùng token người thật.

**Cách làm gợi ý:**
1. Dựng ma trận publish/subscribe theo người nhận.
2. Thử đổi chia sẻ, đổi ghế, kick và tiếp quản với token cũ/mới.
3. Đo hiệu lực thu hồi và quota; ghi phiên bản SDK/cấu hình.
4. Đề xuất cơ chế và điều kiện tích hợp EE.

**Kiểm thử:** Kiểm thủ công thiết bị và tích hợp client trái quyền.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-MEDIA-02-01 | AC-MEDIA-02-01 | Người xem gọi publish trực tiếp | Không phát được track. |
| TC-MEDIA-02-02 | AC-MEDIA-02-02 | Chọn chỉ đối thủ rồi cả người xem | Người xem chỉ nhận trường hợp được phép. |
| TC-X-17 | Quyền khi đổi ghế | Hạ người chơi xuống xem khi track đang mở | Mất quyền phát/nhận luồng chỉ đối thủ. |
| TC-MEDIA-03-01 | AC-MEDIA-03-01 | Tab mới tiếp quản, thử token cũ kết nối lại | Tab cũ không lấy lại quyền; tab mới mặc định tắt. |

**PASS khi:** Báo cáo đầy đủ có số đo và kết luận là PASS task nghiên cứu; GATE chỉ đạt khi không nhận/phát trái quyền. FAIL nếu chỉ ẩn UI.

**Bằng chứng nộp:** Build/commit, môi trường, log quyền/track, video thử có đồng ý, cấu hình đã che và số dùng Cloud; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** Cần đo cả token mới phát ngay trước thu hồi; chưa chứng minh thì gate BLOCKED, không tự mua gói hoặc giảm yêu cầu.

### T0-08 — PoC máy cờ: đo thời gian, độ sâu, IPC (GATE-AI sơ bộ)
**Epic:** E0 · **Thành phần:** AI, QA · **Sprint đề xuất:** 1 (04/10–07/10) · **Bắt đầu khi (is blocked by):** `TC-03`
**Bắt đầu khi (kết quả cần có):** TC-03: hàm nước hợp lệ, chiếu/hết nước và mô hình thế cờ chuẩn để prototype tìm kiếm

**Mục tiêu:** Prototype từ TC-03 có đạt ngân sách ba cấp qua IPC không? Báo số đo sơ bộ cho EG, không thay GATE-AI.

**Timebox:** nhóm đặt.

**Yêu cầu / nguồn:** docs/02 §9; docs/05 §3, GATE-AI; AC-AI-02-01 ngân sách 300/1000/3000 ms từ lúc tìm; AC-AI-02-03 không nước sai luật; BA 6.1.

**Kết quả (đầu ra):** - Prototype tìm sâu dần/IPC tiến trình riêng trên luật cơ bản TC-03.
- Số đo thực theo cấp, cấu hình/bộ thế/seed và kết luận đạt/không đạt/chưa kết luận sơ bộ.

**Phạm vi / ngoài phạm vi:** PoC Sprint 1, ưu tiên hai ngày đầu GĐ4 theo docs/04 §11. Chưa kiểm đầy đủ lặp/120 của TC-04, không UI AI hoặc GATE-AI hoàn chỉnh.

**Đầu vào cần có:** TC-03: nước hợp lệ/chiếu và thế cơ bản; task tự tạo prototype IPC/bộ thế có nguồn. Không đợi TC-04, T0-09 hoặc worker TG-01.

**Cách làm gợi ý:** 1. Từ TC-03 dựng prototype negamax/alpha-beta tìm sâu dần ở tiến trình riêng.
2. Đo ba cấp 2/4/6 với ngân sách 300/1000/3000 ms; tách chờ IPC/thời gian tìm.
3. Ghi thời gian/độ sâu hoàn tất, nước trả và hành vi vượt ngân sách/lỗi.
4. Báo giới hạn oracle/luật chưa đủ và bàn giao số đo cho TG-01, không nhận GATE-AI đầy đủ.

**Kiểm thử:** Vitest prototype và đo tiến trình thật. Trạng thái: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ba cấp sơ bộ | AC-AI-02-01 — phép đo sơ bộ | Đo cùng tập thế có nguồn qua IPC | Ghi số thật và so ngân sách, không hạ ngưỡng. |
| Nước trả | AC-AI-02-03 — luật cơ bản | Kiểm nước trả bằng TC-03 ở hai phe | Không tự chiếu/lộ Tướng; chưa chứng minh mọi luật lặp. |
| Hết ngân sách | docs/02 §9.4 | Buộc hết thời gian giữa lần tìm | Ghi nước độ sâu đã hoàn tất và độ sâu thật, không số giả. |
| Lỗi | GATE-AI sơ bộ | Ngắt prototype khi tìm | Có kết luận lỗi/không đạt, không coi treo là thành công. |

**PASS khi:** Hoàn tất PoC khi báo cáo tái lập, số đo/giới hạn và kết luận đầy đủ kể cả không đạt. FAIL task nếu thiếu bằng chứng hoặc bịa số; gate đầy đủ chưa PASS.

**Bằng chứng nộp:** Build/commit, môi trường, cấu hình CPU/RAM, bộ thế/seed, lệnh đo thực và dữ liệu thô; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** TG-01 nối TC-04; TG-06 đo toàn docs/05 §3.2. Sprint 1 không bảo đảm kịp hai ngày: ưu tiên chuỗi TC-03, không kịp báo PO.

---

### T0-09 — PoC perft: bộ oracle độc lập kiểm bộ sinh nước đi (GATE-PERFT)
**Epic:** E0 · **Thành phần:** Game Engine, QA · **Sprint đề xuất:** 1 (04/10–07/10) · **Bắt đầu khi (is blocked by):** `TC-03`
**Bắt đầu khi (kết quả cần có):** TC-03: hàm liệt kê nước hợp lệ và kiểm chiếu trên mô hình thế cờ chuẩn

**Mục tiêu:** Oracle độc lập có xác nhận số perft tham chiếu và kết quả bộ sinh nước EC không? Báo cáo ngăn test chỉ xác nhận lại chính lỗi của triển khai.

**Timebox:** nhóm đặt.

**Yêu cầu / nguồn:** GATE-PERFT; docs/05 §3.1: số tham chiếu 44, 1920, 79666, 3290240 ở độ sâu 1–4 phải được kiểm độc lập; docs/02 §1.2, §3.

**Kết quả (đầu ra):** - Nguồn/phiên bản bộ sinh tham chiếu và cấu hình luật.
- Báo cáo từng độ sâu, sai khác và vị trí phân nhánh đầu tiên nếu có.

**Phạm vi / ngoài phạm vi:** Perft kiểm sinh nước; không tự chứng minh chiếu liên tục/sức mạnh AI, không tích hợp công cụ ngoài thành máy cờ sản phẩm.

**Đầu vào cần có:** TC-03: bộ sinh nước hợp lệ; thế đầu FEN docs/02; công cụ tham chiếu độc lập có nguồn/phiên bản/quyền dùng. Không cần TC-04 hoặc TC-06 để chạy perft.

**Cách làm gợi ý:** 1. Chọn và ghi nguồn oracle; không lấy kết quả từ code đang kiểm.
2. Chạy cùng thế đầu, độ sâu và quy ước đếm trên hai bộ.
3. Khoanh sai khác theo nước gốc; kết luận oracle/triển khai/chưa rõ.

**Kiểm thử:** Đơn vị Vitest hỗ trợ và chạy oracle ngoài độc lập. Trạng thái kế hoạch: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Perft chuẩn | GATE-PERFT | Đếm từ thế đầu ở độ sâu 1–4 | Đối chiếu từng số tham chiếu, ghi số thực. |
| Thế sai | docs/02 §1.2 | Dùng thế hoặc bên đi khác | Nhận ra đầu vào khác, không so kết quả như cùng oracle. |
| Sai lệch có kiểm soát | Độc lập oracle | Thử lỗi cản chân trong bản test | Phát hiện sai khác, không đổi expected cho khớp. |

**PASS khi:** Task nghiên cứu đạt khi kết luận có thể kiểm lại; GATE chỉ PASS khi oracle độc lập được xác minh và đối chiếu đạt. FAIL nếu tự lấy code làm chuẩn.

**Bằng chứng nộp:** Build/commit, môi trường, FEN, độ sâu, version oracle, kết quả từng nhánh và lệnh chạy thực; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** Chuyển Sprint 1, sau TC-03 và độc lập T0-08. Chưa có oracle thì báo chưa kết luận; TC-06 chỉ nhận bộ số đã xác minh, không tự cài công cụ thành dependency sản phẩm.

---

### T0-10 — Khung ứng dụng web: React, Vite, router, cấu hình, kết nối shared
**Epic:** E0 · **Thành phần:** Frontend · **Sprint đề xuất:** 1 (04/10–07/10) · **Bắt đầu khi (is blocked by):** `T0-01`, `T0-03`
**Bắt đầu khi (kết quả cần có):** T0-01: workspace TypeScript và script build/test; T0-03: kiểu dữ liệu và hợp đồng P1 dùng qua import nội bộ

**Mục tiêu:** Tạo khung web React/Vite sử dụng shared cho các màn P1. Nền này cho FE phát triển theo hợp đồng, chưa phải luồng đăng nhập hay phòng chạy thật.

**Yêu cầu / nguồn:** docs/04 §2; NFR-04 không bí mật phía client; US-UI-06 với AC-UI-06-02 chỉ Kỳ Đài Cổ Phong ở P1; DANH-MUC và DESIGN định hướng các route.

**Kết quả (đầu ra):**
- Khung app và router, cấu hình môi trường công khai, import shared build được.
- Trang khung có xử lý lỗi tải/cấu hình và hướng dẫn nối màn; không kích hoạt P2.

**Phạm vi / ngoài phạm vi:** Không dựng toàn màn, không Tailwind/thư viện UI chưa duyệt; skeleton không là bằng chứng AC nghiệp vụ.

**Đầu vào cần có:** Danh mục route P1 và cách phân biệt trạng thái WAITING/PLAYING chung URL; biến public của Vite.

**Cách làm gợi ý:**
1. Thiết lập app/router theo stack đã duyệt.
2. Nối shared và lớp cấu hình public, không hardcode secret.
3. Chạy build và kiểm route tải lại; ghi ranh giới lớp UI và kết nối.

**Kiểm thử:** Vitest, Playwright hoặc kiểm trình duyệt khi khung E2E chưa có.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Khởi động | docs/04 §2 | Cài/build/mở app | Trang khung hiện và import shared không lỗi. |
| Route trực tiếp | DANH-MUC | Tải lại URL P1 trong cấu hình thử | Không lỗi trắng do fallback router. |
| Bí mật | NFR-04 | Kiểm bundle và cấu hình public | Không khóa dịch vụ/Auth/LiveKit secret. |
| Thiếu cấu hình | Nhánh lỗi | Bỏ địa chỉ dịch vụ thử | Báo cấu hình thiếu, không giả đăng nhập. |

**PASS khi:** App build/run và route/error thử đạt; FAIL nếu bí mật vào bundle hoặc trang khung được báo là luồng tích hợp hoàn tất.

**Bằng chứng nộp:** Build/commit, môi trường, log build, route thử, kết quả quét cấu hình và ảnh khung; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** Thư viện router cụ thể chưa chốt trong stack; nhóm chọn/duyệt trước thêm, không tự coi đã có dependency.

### T0-11 — Khung máy chủ: NestJS, Socket.IO, xác thực kết nối, xử lý lệnh theo hợp đồng
**Epic:** E0 · **Thành phần:** Backend · **Sprint đề xuất:** 1 (04/10–07/10) · **Bắt đầu khi (is blocked by):** `T0-01`, `T0-03`, `T0-05`
**Bắt đầu khi (kết quả cần có):** T0-01: workspace build/test được; T0-03: event/payload/ACK và danh mục lỗi P1 đã rõ; T0-05: cấu hình Auth/OTP đã kiểm, thông tin kết nối và quy tắc kiểm phiên, bí mật chỉ cấp phía server

**Mục tiêu:** Tạo máy chủ và cổng Socket.IO nhận danh tính xác thực rồi điều phối ý định theo shared. Nền này phục vụ EA/EB/ED, không tự chứa toàn luật phòng/ván.

**Yêu cầu / nguồn:** docs/04 §2/§4, docs/07 §3; NFR-04; AC-PLAY-01-03 định danh/version cho chống trùng; nguồn quyền là phiên máy chủ, không user_id client.

**Kết quả (đầu ra):** - Ứng dụng NestJS/Socket.IO chạy, xác thực handshake và lớp dispatch/ACK lỗi.
- Điểm mở rộng guard và điều phối theo danh tính/phòng; test contract, không ghi payload bí mật.

**Phạm vi / ngoài phạm vi:** Nền gateway/guard interface P1, không guard hồ sơ/ván thật. Thiếu adapter thì đóng đường nghiệp vụ bảo vệ; không cho tài khoản dở dùng sản phẩm.

**Đầu vào cần có:** T0-01: runtime/script; T0-03: payload/ACK và loại lỗi; T0-05: cấu hình Auth để xác minh token. Guard thử chỉ có trong harness, không cần profiles/TA-06 để PASS nền.

**Cách làm gợi ý:** 1. Dựng NestJS/Socket.IO, lấy danh tính từ token đã xác minh.
2. Định nghĩa hook guard trước dispatch; thiếu adapter, từ chối hoặc lỗi đều không chạy handler bảo vệ.
3. Dùng adapter thử trả allow/deny để kiểm pipeline; log không chứa bí mật.
4. Bàn giao hook cho TA-06, điểm kiểm hạn phiên cho TA-05 và limiter kết nối cho T0-15.

**Kiểm thử:** Vitest gateway với token thử và guard fixture có nhãn. Trạng thái: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Token sai | NFR-04 | Handshake thiếu/sai/hết token | Không nhận danh tính hoặc dữ liệu nghiệp vụ. |
| Giả danh | docs/07 §3 | Token A kèm user_id B | Danh tính vẫn là A. |
| Guard mặc định | NFR-04 | Thiếu adapter, adapter deny hoặc lỗi | Handler bảo vệ không chạy; lỗi không biến thành allow. |
| Dispatch thử | Contract T0-03 | Adapter thử allow; gửi đúng/sai kiểu payload | Đúng gọi handler thử; sai trả lỗi, không tác động. |

**PASS khi:** Mọi ca gateway/hook trên đạt, mặc định đóng và không lộ dữ liệu. FAIL nếu thiếu/lỗi guard vẫn chạy handler. Không chờ TA-06 để PASS nền; chưa nghiệm thu AC tài khoản hoàn tất.

**Bằng chứng nộp:** Revision/build và môi trường; log handshake/ACK đã che và báo cáo kiểm quyền. Không chứa bí mật.

**Rủi ro / chưa rõ:** TA-06 nối profiles/completed_at/PENDING và kiểm AC-AUTH-03-04/05 thật; TA-09 kiểm web–Auth. T0-15 kiểm hạn kết nối. Adapter allow thử không dùng trong sản phẩm.

---

### T0-12 — Chốt nơi chạy ứng dụng và dựng môi trường demo
**Epic:** E0 · **Thành phần:** DevOps · **Sprint đề xuất:** 2 (08/10–10/10) · **Bắt đầu khi (is blocked by):** `T0-02`, `T0-10`, `T0-11`
**Bắt đầu khi (kết quả cần có):** T0-02: pipeline build/lint/test hoạt động; T0-10: web build và cấu hình địa chỉ server công khai; T0-11: server chạy, handshake/ACK theo shared

**Mục tiêu:** Chốt nơi chạy ứng dụng phù hợp WebSocket và triển khai bản demo có thể truy cập. Đầu ra nối web build của T0-10 với máy chủ T0-11 trên môi trường thật, không chỉ đề xuất nhà cung cấp.

**Yêu cầu / nguồn:** docs/04 §10; BA 10.1 dùng Supabase SMTP/LiveKit Cloud; NFR-04 giữ secret phía server. Nhà cung cấp ứng dụng/chi phí cần PO quyết.

**Kết quả (đầu ra):**
- Quyết định hosting/chi phí được duyệt và cấu hình triển khai đã che.
- URL web/máy chủ demo cùng hướng dẫn deploy và kết quả smoke kết nối thật.

**Phạm vi / ngoài phạm vi:** Một thể hiện server theo nguồn; không tự mua gói, thêm công nghệ hoặc dựng LiveKit riêng; chưa nghiệm thu toàn P1.

**Đầu vào cần có:** Quyền triển khai, cấu hình Auth/Cloud thử và quyết định PO; web cần địa chỉ HTTPS/WSS phù hợp môi trường media.

**Cách làm gợi ý:**
1. Trình PO lựa chọn đáp ứng WebSocket và chi phí.
2. Đặt secret ở server, cấu hình web trỏ đúng server.
3. Deploy hai phía; thử truy cập, handshake và reload route từ ngoài máy phát triển.
4. Ghi cách phát hành lại và giới hạn một server.

**Kiểm thử:** Smoke tích hợp web–server trên demo, kiểm thủ công mạng.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Kết nối thật | docs/04 §10 | Mở web demo, thực hiện handshake có xác thực | Web nối đúng server, không localhost. |
| Sai token | NFR-04 | Gửi kết nối không hợp lệ trên URL demo | Bị chặn như local. |
| Reload/lỗi server | Hạ tầng | Tải lại route rồi làm server thử không khả dụng | Route không mất; lỗi được báo, không dữ liệu giả. |
| Secret | NFR-04 | Kiểm bundle/log triển khai | Không lộ khóa dịch vụ. |

**PASS khi:** Có quyết định PO, URL chạy và toàn smoke đạt. FAIL nếu chọn/mua ngoài phép hoặc demo chỉ chạy nhờ môi trường cá nhân.

**Bằng chứng nộp:** Build/commit, môi trường, URL, cấu hình đã che, log deploy/smoke và quyết định PO; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** Chọn hosting có thể làm sớm hơn triển khai; khung gộp hai việc, cần xem đề xuất tách mốc quyết định để tránh chặn muộn.

### T0-13 — Máy chủ: cơ chế chống trùng lệnh dùng chung (biên lai theo danh tính + commandId)
**Epic:** E0 · **Thành phần:** Realtime · **Sprint đề xuất:** 1 (04/10–07/10) · **Bắt đầu khi (is blocked by):** `T0-11`, `T0-04`
**Bắt đầu khi (kết quả cần có):** T0-11: gateway xác thực, danh tính có thẩm quyền và ACK/lỗi theo shared; T0-04: migration command_receipts và ràng buộc khóa danh tính/commandId, match_id có thể rỗng

**Mục tiêu:** Tạo primitive chống trùng cho phòng/ván/chat. TD-01 dùng nó trong giao dịch ván riêng.

**Yêu cầu / nguồn:** docs/04 §4.2, docs/07 §3; AC-PLAY-01-03: retry không đi hai lần, lệnh mới kiểm version. docs/03 §2.8/§4.3 đã nêu dọn command_receipts >24 giờ. Thiết kế lưu kết quả tối thiểu/lọc quyền khi trả còn chờ quyết định.

**Kết quả (đầu ra):** - Primitive tra/lưu/ACK theo danh tính + commandId, callback và giao dịch nghiệp vụ.
- Adapter biên lai, thao tác dọn bản ghi >24 giờ và fixture concurrency/rollback/quyền.

**Phạm vi / ngoài phạm vi:** P1; không luật cờ/rate limit/timer nghiệp vụ. Không ép AI ghi DB; biên lai AI trong bộ nhớ theo vòng đời ván.

**Đầu vào cần có:** T0-11: dispatch/ACK/phiên; T0-04: schema/transaction. Chỉ callback lệnh mới thi hành; không gọi dịch vụ ngoài trong khóa DB.

**Cách làm gợi ý:** 1. Xác thực rồi tra biên lai trước điều kiện biến đổi; chỉ lệnh mới gọi callback.
2. Tuần tự hóa, ghi tác động bền và biên lai cùng giao dịch; chỉ phát sau commit.
3. Khi trả lại kết quả, lọc dữ liệu theo quyền hiện tại; lỗi ghi không để thành công giả.
4. Dọn đúng biên lai >24 giờ, không xóa ván/nước; ghi riêng câu hỏi retry sau dọn.

**Kiểm thử:** Vitest đơn vị primitive và tích hợp CSDL với handler thử. Trạng thái kế hoạch: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-PLAY-01-03 | AC-PLAY-01-03 | Gửi cùng lệnh đồng thời rồi retry với version cũ | Một tác động; kết quả cũ trả lại, không chạy callback lại. |
| Phân danh tính | docs/07 §3 | Hai user dùng cùng commandId; giả user_id trong payload | Hai khóa độc lập theo phiên, không đọc biên lai người khác. |
| Không có ván | docs/03 §2.8 | Handler create/chat WAITING dùng match_id rỗng | Lưu/đọc biên lai không bắt tạo match giả. |
| Ghi lỗi | docs/04 §4.2 | Gây lỗi trước commit và mất ACK sau commit | Trước commit không phát; sau commit retry không tái thi hành. |
| Mất quyền đọc | Đề xuất docs/07 §3, chờ quyết định | Retry sau kick/đổi vai | Không phát dữ liệu cũ ngoài quyền; tác động không lặp. |
| Dọn biên lai | docs/03 §4.3 | Tạo bản ghi tại/quá 24 giờ, chạy thao tác dọn | Chỉ bản ghi >24 giờ bị xóa; ván/nước còn nguyên; không suy ra chính sách retry sau dọn. |

**PASS khi:** Primitive và dọn đúng mốc vượt qua mọi ca thuộc contract đã duyệt. FAIL nếu tác động/biên lai lệch, dọn sai tuổi hoặc lộ dữ liệu. Không tuyên bố đã giải quyết retry sau dọn khi còn chờ quyết định.

**Bằng chứng nộp:** Revision/build và môi trường; log số lần callback, dữ liệu trước/sau commit, kiểm tranh chấp và quyền đã che. Không chứa bí mật.

**Rủi ro / chưa rõ:** Mốc >24 giờ đã có. Retry sau dọn/payload khác cùng commandId còn cần làm rõ; không tự chọn thực thi lại/từ chối. Nhịp dọn do nhóm thiết kế.

---

### T0-14 — Bộ lọc từ cấm dùng chung cho máy chủ và web (tên phòng, Display Name, chat)
**Epic:** E0 · **Thành phần:** Backend · **Sprint đề xuất:** 1 (04/10–07/10) · **Bắt đầu khi (is blocked by):** `T0-03`
**Bắt đầu khi (kết quả cần có):** T0-03: gói shared import nội bộ được, kiểu dữ liệu/lỗi chung để công bố kết quả lọc

**Mục tiêu:** Tạo bộ lọc chung cho web và máy chủ. Một danh sách phục vụ tên phòng, Display Name và chat.

**Yêu cầu / nguồn:** BA 5.3, BA 1.4/2.7; US-CHAT-02, AC-CHAT-02-02: chat che *** ở hai phía, chuẩn hóa dấu/khoảng trắng/ký tự chèn và 0→o, 1→i. AC-ROOM-01-01 và AC-AUTH-05-01: tên phòng/Display Name chứa từ cấm bị từ chối, không che để lưu.

**Kết quả (đầu ra):**
- Hàm chuẩn hóa/so khớp, kết quả phát hiện và hàm che chat; dùng từ web/server.
- Danh sách tiếng Việt/Anh do nhóm cung cấp trong cấu hình, fixture và phiên bản đồng bộ.

**Phạm vi / ngoài phạm vi:** Chỉ bộ lọc P1; không gửi chat/rate limit/Khách/chat 1-1. Không bịa danh sách; độ dài tên/tin do handler kiểm.

**Đầu vào cần có:** T0-03: gói/kiểu shared; nhóm cung cấp danh sách và fixture biên từ ghép. Danh sách nằm trong cấu hình, không sửa trực tiếp ở DB.

**Cách làm gợi ý:**
1. Nhận danh sách có phiên bản, dựng fixture từ dữ liệu nhóm cung cấp.
2. Chuẩn hóa để so khớp nhưng giữ nội dung hiển thị không thuộc phần cần che.
3. Xuất phát hiện/từ chối tên và che chat, không gộp hai chính sách.
4. Chạy cùng fixture ở web/server, thử bypass client bằng lời gọi server.

**Kiểm thử:** Vitest chung và kiểm adapter hai môi trường. Trạng thái kế hoạch: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-CHAT-02-02 | AC-CHAT-02-02 | Biến thể từ trong danh sách: dấu, hoa thường, khoảng/ký tự chèn, 0/1 | Hai phía nhận diện và che *** như nhau. |
| Tên bị cấm | AC-ROOM-01-01; AC-AUTH-05-01 | Đưa cùng từ cấm vào tên phòng/Display Name | Trả kết quả từ chối, không biến thành tên có *** rồi lưu. |
| Nội dung sạch | BA 5.3 | Chạy fixture sạch/biên so khớp đã được nhóm xác nhận | Không che/từ chối sai mẫu có expected rõ. |
| Bỏ lọc client | NFR-04 | Gọi adapter máy chủ trực tiếp bằng biến thể cấm | Vẫn lọc, không tin kết quả do client tự báo. |

**PASS khi:** Mọi fixture được nhóm xác nhận đạt ở cả hai môi trường. FAIL nếu tên được che rồi lưu, lệch danh sách hoặc server bỏ lọc; thiếu danh sách thật thì BLOCKED nghiệm thu.

**Bằng chứng nộp:** Revision/build và môi trường; version danh sách, fixture/expected và báo cáo so sánh web–server. Không chứa bí mật.

**Rủi ro / chưa rõ:** Biên từ ghép/phép thay thế ngoài ví dụ nguồn cần nhóm xác nhận. Không tự biến dữ liệu test thành chính sách cấm.

---

### T0-15 — Máy chủ: giới hạn tốc độ dùng chung (đăng nhập sai, mã phòng sai, tạo phòng, kết nối mới)
**Epic:** E0 · **Thành phần:** Realtime · **Sprint đề xuất:** 1 (04/10–07/10) · **Bắt đầu khi (is blocked by):** `T0-11`
**Bắt đầu khi (kết quả cần có):** T0-11: gateway xác minh danh tính, hook trước nhận kết nối/dispatch và contract ACK/lỗi

**Mục tiêu:** Cung cấp limiter chung và gắn hạn kết nối ở gateway. Các handler dùng một API/baseline.

**Yêu cầu / nguồn:** docs/04 §9, docs/05 §5; NFR-04. Sai đăng nhập: 5 lần/15 phút theo (username, IP), khóa 15 phút từ lần sai thứ 5, lỗi chung. Mã phòng sai: 10/phút/phiên, chặn 5 phút. Tạo phòng: 5/10 phút/người. Kết nối mới: 10/phút/tài khoản, không thêm hạn IP cho tài khoản đã xác thực.

**Kết quả (đầu ra):** - Limiter, cấu hình baseline, clock kiểm được và API kiểm/ghi lần sai/đọc hạn khóa.
- Tích hợp hạn kết nối vào gateway T0-11; fixture consumer cho các handler chưa có.

**Phạm vi / ngoài phạm vi:** P1 một server; không thay OTP/chat limiter, không Redis/dịch vụ mới. Handler đăng nhập/phòng thật kiểm sau.

**Đầu vào cần có:** T0-11: gateway/hook và danh tính; task tự tạo clock/consumer fixture. Khóa lấy từ phiên xác minh hoặc (username, IP) phía server, không từ user_id client tự khai.

**Cách làm gợi ý:** 1. Tách policy và khóa từng loại, cấu hình đúng ngưỡng nguồn.
2. Kiểm/cập nhật bộ đếm nguyên tử theo clock server, mở lại sau hạn.
3. Gắn hạn kết nối mới vào gateway; không gộp tài khoản cùng IP.
4. Xuất API cho TA-05/TB-02/TB-03; consumer chỉ gọi hạn nghiệp vụ cho lệnh mới sau tra biên lai.

**Kiểm thử:** Vitest limiter/consumer fixture và gateway thật, thời gian điều khiển. Trạng thái: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Sai đăng nhập | docs/04 §9 | Consumer báo sai 4 rồi lần 5 trong 15 phút, thử trước/sau hạn khóa | Khóa từ lần thứ 5 trong 15 phút; lỗi chung, hết hạn được xét lại. |
| Mã sai | docs/04 §9 | Consumer báo sai tới lần 10/phút/phiên rồi đợi 5 phút | Chặn đúng phiên; không kéo dài hạn do clock client. |
| Tạo phòng | docs/04 §9 | Consumer yêu cầu lần 5/6 trong 10 phút rồi ra ngoài cửa sổ | Không vượt 5, hết cửa sổ xét lại; tài khoản khác độc lập. |
| Kết nối | docs/04 §9 | Cùng tài khoản kết nối mới lần 10/11 trong phút | Gateway nhận tối đa 10, vượt bị từ chối. |
| Chung IP/quyền | NFR-04 | Hai tài khoản chung IP; giả user_id để né khóa; gửi đồng thời ở biên | Không quota IP bổ sung; không đổi khóa bằng payload, không vượt hạn. |
| Khóa/lỗi | AC-AUTH-04-02 — contract | So lỗi consumer sai tên/password/khi khóa và thử lại lúc hạn hết | Cùng lỗi đăng nhập, không lộ email/nhật ký bí mật; hết hạn không khóa vĩnh viễn. |

**PASS khi:** Mọi ca limiter và gateway đạt ngưỡng thực. FAIL nếu vượt trần, gộp IP tài khoản đã xác thực hoặc dùng giờ client. Không chờ TA-05/TB-02/TB-03; chưa nghiệm thu các handler đó.

**Bằng chứng nộp:** Build/commit, môi trường, cấu hình/khóa đã che và log timeline đếm/hạn; không mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** TA-05/TB-02/TB-03 nối handler thật; TQ-05 kiểm tổng. Ngưỡng IP chưa xác thực/chi tiết cửa sổ cần nhóm chốt, không tự áp 10/phút/IP.

---
