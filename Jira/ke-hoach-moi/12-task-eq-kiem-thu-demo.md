# Kế hoạch mới (bản nháp) — 12: Task của Epic EQ — Kiểm thử chấp nhận và Demo

**Ngày:** 2026-10-04 · **Trạng thái:** ĐỀ XUẤT, chờ PO và nhóm duyệt · Chưa tạo gì trên Jira. Khung, phụ thuộc và Sprint: `01-components-epic-khung-task.md`; Description Epic: `02-epic.md`.

Epic gồm **7 task**. Mỗi task: dòng đầu (Epic, thành phần, Sprint, **is blocked by**) lấy từ khung; **Bắt đầu khi (kết quả cần có)** nêu hiện vật cụ thể của từng tiền đề. Chưa có ước lượng giờ và người nhận việc (nhóm điền khi Sprint Planning).

### TQ-01 — Khung kiểm thử đầu-cuối Playwright nhiều trình duyệt
**Epic:** EQ · **Thành phần:** QA · **Sprint đề xuất:** 1 (04/10–07/10) · **Bắt đầu khi (is blocked by):** `T0-02`, `T0-10`
**Bắt đầu khi (kết quả cần có):** T0-02: pipeline build/lint/test chạy được; T0-10: web khởi động và router truy cập được.

**Mục tiêu:** Tạo khung E2E dùng nhiều danh tính và trình duyệt tách biệt. EQ có cơ chế tái lập ca nghiệp vụ và thu bằng chứng cho các task sau.

**Yêu cầu / nguồn:** US-UI-03: AC-UI-03-01 — các trạng thái cần kích hoạt; NFR-03 — ma trận trình duyệt. Phục vụ D1–D10, không tự coi đã nghiệm thu các luồng đó. Nguồn bổ sung: docs/05 §2, §7; docs/08 §1.

**Kết quả (đầu ra):** Playwright/CI, contexts cách ly, smoke trên web T0-10, interface adapter chuẩn bị/dọn dữ liệu và báo cáo/trace gắn build/môi trường. Chưa bao gồm fixture Auth/phòng thật đã nghiệm thu.

**Phạm vi / ngoài phạm vi:** Hạ tầng kiểm P1; không giả OTP/media thành bằng chứng thật, không công cụ mạng P2 trong sản phẩm.

**Đầu vào cần có:** Web T0-10 và CI T0-02. Task tự tạo dữ liệu smoke cục bộ không nhạy cảm để kiểm storage/cookie/teardown; không đòi server, tài khoản Auth hay phòng thật.

**Cách làm gợi ý:**

1. Tách browser context cho các người dùng; cấu hình môi trường bằng giá trị không bí mật.
2. Viết helper chuẩn bị/dọn dữ liệu và bắt sự kiện thay chờ thời gian tuỳ tiện.
3. Nối báo cáo/trace vào CI, ghi riêng lỗi ứng dụng và lỗi môi trường.

**Kiểm thử:** Playwright smoke và tự kiểm fixture. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Cách ly smoke | Hai context đặt cookie/storage đánh dấu riêng trên web thử | Không dùng lẫn state; không phải bằng chứng đăng nhập Auth thật |
| Ca 2 | Thất bại | Ca cố ý sai kỳ vọng trên môi trường thử | Báo FAIL có bước/trace, không che lỗi |
| Ca 3 | Lặp lại | Chạy rồi teardown, chạy lại | Không phụ thuộc dữ liệu sót |
| Ca 4 | Bí mật | Kiểm báo cáo/trace trước lưu | Không phát tán token/mật khẩu |

**PASS khi:** Smoke web chạy CI, contexts cách ly, teardown chạy lại được, ca cố ý sai báo FAIL có trace, artifact truy về build/môi trường. Không đòi Auth/phòng thật để PASS khung. Task tích hợp tự chuẩn bị/kiểm fixture nghiệp vụ với tiền đề server đã có; TQ-04 chuẩn bị/kiểm dữ liệu nghiệm thu trước D1–D10.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** TQ-04 có dịch vụ thật trong tiền đề, tự chuẩn bị fixture, không chờ tài khoản demo TQ-06. TQ-02 cần tự chuẩn bị dữ liệu tải từ dịch vụ tiền đề, đề nghị ghi rõ trách nhiệm này. WebKit không tự chứng minh Safari đã kiểm tay.

---

### TQ-02 — Bài tải 50 kết nối, 10 ván (và workload media)
**Epic:** EQ · **Thành phần:** QA · **Sprint đề xuất:** 4 (15/10–17/10) · **Bắt đầu khi (is blocked by):** `TD-11`, `TE-03`, `TE-07`
**Bắt đầu khi (kết quả cần có):** TD-11: ván/reconnect/người xem tích hợp thật; TE-03: chat web–máy chủ thật với ack/lọc từ/quyền theo kênh và vòng đời phòng; TE-07: pipeline UI–máy chủ–LiveKit Cloud với track thật và chuyển quyền/tab.

**Mục tiêu:** Đo sức chịu tải và độ trễ nước đi ở đúng điểm nhận. Tách bài socket đã có ngưỡng với workload media còn chờ chốt.

**Yêu cầu / nguồn:** NFR-01 — người xem nhận p95 <100 ms trên LAN; NFR-02 — 50 kết nối/10 ván, p95 <300 ms. US-PLAY-01: AC-PLAY-01-01 — phát nước đúng quyền. Nguồn bổ sung: docs/05 §6, GATE-LOAD; docs/04 §10; BA 10.1.

**Kết quả (đầu ra):** Tập lệnh tải Node/socket.io-client, quy trình tạo/reset dữ liệu thử, 50 kết nối/10 ván có danh tính hợp lệ; dữ liệu thô thời gian/lỗi/CPU/RAM, phương pháp tính p95 và báo cáo theo build. Kết luận NFR-01/02 và trạng thái GATE-LOAD tách khỏi trạng thái hoàn tất báo cáo; media có báo riêng nếu được duyệt.

**Phạm vi / ngoài phạm vi:** Socket P1; media workload cụ thể là đề xuất, không tự thêm ngưỡng hoặc nâng gói Cloud.

**Đầu vào cần có:** Build có ván/người xem TD-11, chat TE-03, media TE-07; môi trường thử và quyền chuẩn bị dữ liệu. Task tự tạo/kiểm tài khoản fixture có profiles hoàn tất và phiên hợp lệ, 10 phòng/20 người chơi cùng 30 kết nối còn lại; không chờ TQ-06 cấp tài khoản demo. Dữ liệu dựng sẵn phải ghi nguồn, không dùng nó để tuyên bố đã kiểm OTP thật.

**Cách làm gợi ý:**

1. Tự chuẩn bị/reset tài khoản và dữ liệu riêng trên môi trường thử bằng dịch vụ tiền đề; kiểm đăng nhập, hoàn tất hồ sơ, quyền và registry. Không tạo các phiên giả hoặc bỏ guard để đạt 50 kết nối.
2. Dựng 10 ván/20 người chơi + 30 kết nối khác ở xem/Sảnh/chat; mỗi phòng tối đa 5 người xem. Ghi cách tăng kết nối phù hợp giới hạn tài khoản đã chốt.
3. Chạy nước hợp lệ đều trong 10 phút; ghi mốc server nhận/phát và client người xem nhận, phương pháp đồng bộ giờ/sai số. Tính riêng p95 LAN và tải tổng, không chỉ lấy thời gian server.
4. Nếu workload media đã được duyệt, chạy qua TE-07 thật theo cấu hình docs/05 §6; ghi track/băng thông/quota riêng, không lấy socket thay media.
5. Báo đủ số đo và FAIL/BLOCKED/chưa kết luận, giao lỗi miền ngay và đo lại sau bản sửa; dọn dữ liệu thử, không chờ TQ-07 mới sửa.

**Kiểm thử:** Tập lệnh tải Node, client đo và kiểm tay media. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Tải socket | 50 kết nối với 10 ván trong 10 phút | 0 mất kết nối ngoài ý muốn; p95 nước <300 ms |
| Ca 2 | LAN | Đo từ server nhận đến người xem nhận | p95 <100 ms, ghi phương pháp đồng bộ giờ |
| Ca 3 | Tài nguyên | Theo dõi cùng thời gian tải | CPU/RAM không tăng liên tục; ghi số thật |
| Ca 4 | Media đề xuất | Chạy cấu hình được nhóm chốt trên Cloud | Ghi track/băng thông riêng; chưa ngưỡng thì chưa kết luận đạt |
| Ca 5 | Media đầu vào thật | Xác nhận build TE-07 rồi chạy workload được duyệt và theo dõi người nhận | Có track thật đúng quyền; thiếu quota/ngưỡng ghi BLOCKED/chưa kết luận, không PASS giả |
| Ca 6 | Dữ liệu tải thật | Chuẩn bị/reset fixture, kiểm hồ sơ hoàn tất/phiên/quyền rồi mở tải | Đủ 50 kết nối hợp lệ, 10 ván thực; không vượt 2 người xem/phòng, không bypass guard/rate limit; không cần tài khoản TQ-06 |
| Ca 7 | Báo cáo không đạt | Có mẫu vượt ngưỡng hoặc đứt kết nối ngoài ý muốn | Giữ số thật/mẫu lỗi, báo NFR/gate không đạt và giao miền sửa; không bỏ mẫu để p95 đẹp |

**PASS khi:** **PASS công việc đo/báo cáo:** có quy trình dữ liệu tái lập, build/môi trường, phương pháp, dữ liệu thô và kết luận từng phép đo; phép chưa chạy có lý do/đầu vào thiếu rõ, không ghi đã đo đủ. Báo cáo thiếu bằng chứng hoặc sai cách tính là chưa PASS. **Gate sản phẩm:** NFR-01 p95 <100 ms tại client người xem trên LAN; NFR-02 50 kết nối/10 ván trong 10 phút, 0 mất kết nối ngoài ý muốn, p95 <300 ms, CPU/RAM ổn định. Không đạt giữ FAIL/BLOCKED gate, giao sửa/đo lại ngay; báo cáo xong không đồng nghĩa gate đạt. Media chưa có cấu hình/ngưỡng duyệt thì chờ quyết định, không tự PASS GATE-LOAD đầy đủ.

**Bằng chứng nộp:** Build/commit, môi trường/CPU/RAM, manifest dữ liệu thử đã che bí mật, cách tạo/reset, số kết nối/ván/vai, dữ liệu thô và công thức p95, biểu đồ tài nguyên, lỗi/ca tái lập và kết quả đo lại. Không lưu mật khẩu/token hay nội dung camera/mic.

**Rủi ro / chưa rõ:** Độ phân giải/FPS/bitrate và ngưỡng workload media chờ quyết định; không nâng gói hoặc hạ ngưỡng. Thiếu quota/dữ liệu/môi trường không được gọi phép đo đạt. Fixture tải khác tài khoản demo TQ-06; thời gian chuẩn bị phải được nhóm ước lượng, không giả sẵn 50 tài khoản dùng được.

---

### TQ-03 — Kiểm thử media theo quyền (thủ công và có công cụ)
**Epic:** EQ · **Thành phần:** QA · **Sprint đề xuất:** 4 (15/10–17/10) · **Bắt đầu khi (is blocked by):** `TE-07`
**Bắt đầu khi (kết quả cần có):** TE-07: media thật với đổi vai/đuổi/tiếp quản.

**Mục tiêu:** Kiểm độc lập quyền media trên build tích hợp. Bằng chứng phải cho thấy người không có quyền không nhận/phát track thực.

**Yêu cầu / nguồn:** US-MEDIA-01, US-MEDIA-02, US-MEDIA-03: AC-MEDIA-01-04 — không ghi/lưu; AC-MEDIA-02-01 — người xem không phát; AC-MEDIA-02-02 — lọc nhận; AC-MEDIA-03-01 — tiếp quản. GATE-MEDIA. Nguồn bổ sung: docs/05 §11; docs/04 §7; BA 4.1, 1.8.

**Kết quả (đầu ra):** Ma trận quyền người phát/người nhận/mức chia sẻ trên build thật, số đo hiệu lực thu quyền, log metadata token/track đã che, lỗi có tái lập và kết quả kiểm lại; kết luận GATE-MEDIA tách khỏi việc bàn giao báo cáo.

**Phạm vi / ngoài phạm vi:** P1; không nghiệm thu bằng screenshot video bị ẩn, không lưu nội dung camera/mic.

**Đầu vào cần có:** Tài khoản người chơi/người xem, thiết bị, môi trường Cloud thử và build TE-07.

**Cách làm gợi ý:**

1. Chuẩn bị danh tính/thiết bị thử từ build TE-07; đo từng mức chia sẻ độc lập ở hai người phát.
2. Dùng client trái quyền thử publish/subscribe trực tiếp, kiểm payload/track nhận tại dịch vụ.
3. Đổi vai/kick/tiếp quản qua luồng thật, thử token cũ và quyền mới hợp lệ; kiểm LOCKED không tự thu quyền người hiện tại. Reconnect toàn timer đã kiểm tại TD-11, task này không tự đòi đường runtime ngoài tiền đề.
4. Ghi PASS/FAIL/BLOCKED từng quyền và trạng thái duyệt; lỗi thu quyền được giao TE-04/06/07 xử lý ngay, rồi kiểm lại trên build sửa, không chờ TQ-07.

**Kiểm thử:** Kiểm tay thiết bị thật, kiểm tích hợp và Playwright hỗ trợ. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Ma trận | Mọi mức chia sẻ với đối thủ/người xem | Chỉ track được phép nhận |
| Ca 2 | Publish | Người xem gọi trực tiếp SDK | Không phát dữ liệu/media |
| Ca 3 | Thu quyền | Dùng lại token cũ, xin token mới hợp lệ | Cũ không lấy lại quyền; mới hoạt động đúng |
| Ca 4 | Không lưu | Rà cấu hình và artifact kiểm thử | Không recording/egress hoặc lưu nội dung media |

**PASS khi:** **PASS công việc kiểm/báo cáo:** mọi ô ma trận áp dụng có kết quả/bằng chứng hoặc lý do chưa kiểm, ghi rõ build/phương pháp và lỗi giao miền. Kết quả FAIL không bị đổi thành PASS chỉ để hoàn tất báo cáo; báo cáo thiếu dữ liệu/tái lập thì chưa PASS. **Gate sản phẩm:** mọi quyền bắt buộc đã duyệt phải đạt tại dịch vụ, không nhận/phát track trái quyền, không ghi/lưu nội dung media. Có vi phạm thì gate FAIL/BLOCKED, sửa/kiểm lại ngay trước cổng cuối; nhánh cơ chế/cửa sổ thu hồi chờ quyết định ghi riêng. Hoàn tất báo cáo kiểm độc lập không cho phép vượt GATE-MEDIA trước triển khai đã đặt ở T0-07/TE-04.

**Bằng chứng nộp:** Build, phiên bản SDK, cấu hình Cloud che bí mật, ma trận ca và log metadata quyền/track; dùng ảnh trạng thái hoặc hình thử, không nộp nội dung ghi âm/ghi hình của người dùng.

**Rủi ro / chưa rõ:** Quota thiếu/chưa kiểm là BLOCKED phép kiểm/gate, có thể bàn giao báo cáo thiếu điều kiện nhưng không nhận sản phẩm đạt. Cửa sổ thu hồi/giải pháp cụ thể còn chờ quyết định, không tự đặt số. Kiểm media theo membership không thay TD-11 nghiệm thu timer reconnect.

---

### TQ-04 — Kiểm thử chấp nhận AC P1 và kịch bản demo D1–D10
**Epic:** EQ · **Thành phần:** QA · **Sprint đề xuất:** 4 (15/10–17/10) · **Bắt đầu khi (is blocked by):** `TD-11`, `TF-05`, `TG-05`, `TE-07`, `TA-09`, `TB-11`, `TA-10`, `TQ-01`, `TE-03`, `TH-03`, `TH-06`, `TA-04`, `TA-06`, `TA-12`
**Bắt đầu khi (kết quả cần có):** TD-11: ván đầy đủ; TF-05: bạn bè/mời thật; TG-05: AI thật; TE-07: pipeline UI–máy chủ–LiveKit Cloud với track thật và chuyển quyền/tab; TA-09: đăng ký/đăng nhập thật; TB-11: UI/API đổi ghế, riêng tư, đuổi và vòng đời Host/đóng phòng đã tích hợp; TA-10: đăng xuất giữa ván đã tích hợp; TQ-01: khung smoke/context cách ly và báo cáo E2E; TE-03: chat web–máy chủ thật với ack/lọc từ/quyền theo kênh và vòng đời phòng; TH-03: build và ma trận năm trạng thái của các thành phần P1 đã hội tụ; TH-06: kiểm lối P2 vô hiệu/ẩn đúng trên UI và theme P1 cố định; TA-04: tác vụ quét phục hồi đăng ký dở cùng ca trước/sau completed_at và PENDING; TA-06: chặn tài khoản chưa hoàn tất và kết quả kiểm đường gọi trực tiếp Auth; TA-12: luồng đăng nhập qua link/mã rồi kiểm lại quyền và chuyển vào đúng phòng.

**Mục tiêu:** Đối chiếu toàn bộ AC P1 với ứng dụng thật và chạy D1–D10. Demo đường thuận chỉ là một phần của nghiệm thu EQ.

**Yêu cầu / nguồn:** Toàn bộ 53 US/157 AC P1 trong docs/01 và ma trận docs/08, gồm US-PLAY-01, US-FRIEND-04, US-AI-03. AC-PLAY-01-03 — trùng/cũ; AC-FRIEND-04-04 — join; AC-AI-03-02 — vào lại. Nguồn bổ sung: docs/05 §1, §4; docs/08 §4–6. US-AUTH-06: AC-AUTH-06-01 — đăng nhập/đăng ký xong tự vào đích mời; AC-AUTH-06-02 — đã đăng nhập thì vào thẳng theo quyền phòng. US-AUTH-03: AC-AUTH-03-05 — phục hồi đúng completed_at/PENDING.

**Kết quả (đầu ra):** Bảng AC→ca→bằng chứng, báo 157 AC theo nhánh áp dụng và kịch bản D1–D10; danh sách lỗi có tái lập.

**Phạm vi / ngoài phạm vi:** Chỉ P1; tách nhánh chưa duyệt của AC và NFR-08–10; không lấy task Done thay AC đạt.

**Đầu vào cần có:** Build tích hợp cùng phiên bản, nguồn AC ghim, tài khoản/thiết bị/quota và fixture ca biên. Đầu vào mới bắt buộc: TE-03: chat web–máy chủ thật với ack/lọc từ/quyền theo kênh và vòng đời phòng; TH-03: build và ma trận năm trạng thái của các thành phần P1 đã hội tụ; TH-06: kiểm lối P2 vô hiệu/ẩn đúng trên UI và theme P1 cố định; TA-04: tác vụ quét phục hồi đăng ký dở cùng ca trước/sau completed_at và PENDING; TA-06: chặn tài khoản chưa hoàn tất và kết quả kiểm đường gọi trực tiếp Auth; TA-12: luồng đăng nhập qua link/mã rồi kiểm lại quyền và chuyển vào đúng phòng.

**Cách làm gợi ý:**

1. Tự chuẩn bị/kiểm fixture Auth hoàn tất, phòng và dữ liệu ca biên trên dịch vụ thật trong tiền đề; ghi cách tạo/reset, kiểm đăng nhập/quyền, che bí mật. Tách khỏi tài khoản demo TQ-06. D1 vẫn OTP thật theo SMTP mặc định. Lập mapping đầy đủ AC/quyền/lỗi/đồng thời/UI.
2. Chạy D1–D10: OTP thật; D8 rời ghế trước AI; D9 tạo ván online mới.
3. Chạy từng nhánh ngoài demo, ghi FAIL/BLOCKED riêng và liên kết lỗi.
4. Chạy thêm chuyển hướng TA-12, quét phục hồi TA-04, chặn tài khoản TA-06, chat TE-03 và hội tụ TH-03/06 trên cùng baseline.

**Kiểm thử:** Playwright nhiều trình duyệt, Vitest tích hợp và kiểm tay media. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Bao phủ | Đối chiếu tập mã hai chiều | Không thiếu/trùng sai; mỗi nhánh có kết quả |
| Ca 2 | Demo | Chạy D1–D10 đúng thứ tự/đầu vào | Đủ tám mục tiêu, không mock làm chứng cứ thật |
| Ca 3 | Biên/quyền | Gọi trực tiếp sai vai, đồng thời, hết hạn | Đúng docs/08, không rò dữ liệu |
| Ca 4 | Chưa duyệt | Tách INTERRUPTED trung tính/NFR mới | Không ép PASS/FAIL như yêu cầu đã chốt |
| Ca 5 | Các nhánh mới nối | Đăng ký dở/khôi phục, gọi API khi chưa hoàn tất; đăng nhập qua link; chat lỗi và P2 visibility | Đúng quyền/đích phòng/trạng thái; đủ bằng chứng AC tương ứng, không chỉ demo thuận |
| Ca 6 | Bạn bè và AI thật | TG-05/TG-02 cùng TF-05: bạn vào AI thật, thử mời, bạn xác nhận rời AI, giữ kết nối rồi mời lại | Trong AI Đang đấu/không nhận mời; rời giải phóng vị trí thì Online rảnh và mời được nếu đủ điều kiện |
| Ca 7 | Media hỏng, cờ/chat thật | TE-07 + TE-03 + TD-11: từ chối thiết bị/rớt media rồi đi nước hợp lệ và gửi chat | Nước vẫn đồng bộ, chat đúng kênh/ACK, media báo lỗi riêng; không dùng host fixture làm chứng cứ |
| Ca 8 | Tiếp quản toàn luồng | Nơi cũ đang chơi/phát; đăng nhập hoặc mở cùng phòng ở nơi mới, nơi cũ gửi nước | Cũ thông báo/chỉ đọc/thiết bị dừng, server chặn nước cũ; nơi mới điều khiển, media mặc định tắt |
| Ca 9 | D8 đầy đủ | Kết thúc online thật, còn ghế thử AI bị chặn; Rời phòng rồi vào cả ba cấp AI | Rời ghế thật giải phóng vị trí, AI chạy đúng; không dùng registry fixture thay D8 |

**PASS khi:** **PASS công việc kiểm/báo cáo:** mọi AC/nhánh áp dụng và D1–D10 có trạng thái trung thực PASS/FAIL/BLOCKED/NOT_RUN, bằng chứng hoặc lý do thiếu và lỗi có bước tái lập/chủ miền nhận xử lý. Lỗi sản phẩm không cản bàn giao báo cáo đầy đủ. Thiếu mapping/kết luận không tái lập thì báo cáo chưa PASS. **Gate P1 chưa đạt** nếu còn AC/NFR bắt buộc thất bại/chưa kiểm hoặc lỗi Cao/Nghiêm trọng. Sửa theo miền và kiểm lại được bắt đầu ngay khi phát hiện, không chờ TQ-07; TQ-07 đối soát build cuối. Không đổi FAIL ứng dụng thành PASS sản phẩm.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** Nhánh lịch sử đổi cặp Riêng thiếu oracle phải ghi chờ quyết định, không tự chọn/nhận P1 hoàn tất. Task tự chuẩn bị fixture trước chạy, không cần đầu ra TQ-06. Thiếu quota/thiết bị ghi thật; báo cáo có thể xong với gate BLOCKED nhưng sản phẩm chưa đạt.

---

### TQ-05 — Nghiệm thu NFR đã duyệt (hiệu năng, trình duyệt, bảo mật)
**Epic:** EQ · **Thành phần:** QA · **Sprint đề xuất:** 4 (15/10–17/10) · **Bắt đầu khi (is blocked by):** `TQ-02`, `TH-04`, `TH-05`, `TG-06`, `TC-06`, `T0-06`, `TQ-03`
**Bắt đầu khi (kết quả cần có):** TQ-02: báo tải và độ trễ thật; TH-04: responsive/cảm ứng đã kiểm; TH-05: báo trợ năng thực; TG-06: báo GATE-AI đủ thời gian/độ sâu/sức mạnh/ổn định với máy/build/seed; TC-06: bộ thế/ca biên luật, ký hiệu và perft chạy trong CI kèm kết quả; T0-06: báo GATE-OTP với số đo thư/hạn mức, ca lỗi và phục hồi, cấu hình che bí mật; TQ-03: ma trận quyền media thật, kiểm token cũ và báo thu hồi/không lưu.

**Mục tiêu:** Nghiệm thu NFR đã duyệt dựa trên số đo và kiểm độc lập. EQ có kết luận chất lượng tách khỏi việc chỉ chạy được demo.

**Yêu cầu / nguồn:** NFR-01..07, NFR-A11Y; US-UI-04, US-UI-05. AC-UI-04-02 — bốn viewport; AC-UI-05-01 — trợ năng. NFR-08..10 chưa là điều kiện bắt buộc. Nguồn bổ sung: docs/05 §3, §5–6, §11; docs/08 §6.

**Kết quả (đầu ra):** Bảng NFR→phương pháp→số đo→kết luận, kiểm bảo mật và phục hồi; các gate liên quan ghi riêng.

**Phạm vi / ngoài phạm vi:** NFR P1 đã duyệt; không dùng đề xuất lưu log 14 ngày để chặn P1 khi chưa duyệt.

**Đầu vào cần có:** Artifact tải/UI và build/DB/Cloud thử; từng báo cáo gate phải kèm phiên bản và trạng thái thực, không suy PASS từ việc đã có báo cáo. Đầu vào mới bắt buộc: TG-06: báo GATE-AI đủ thời gian/độ sâu/sức mạnh/ổn định với máy/build/seed; TC-06: bộ thế/ca biên luật, ký hiệu và perft chạy trong CI kèm kết quả; T0-06: báo GATE-OTP với số đo thư/hạn mức, ca lỗi và phục hồi, cấu hình che bí mật; TQ-03: ma trận quyền media thật, kiểm token cũ và báo thu hồi/không lưu.

**Cách làm gợi ý:**

1. Đọc số đo tải, responsive và trợ năng cùng phiên bản build.
2. Kiểm quyền server, dữ liệu trả và bí mật trong client; restart giữa ván.
3. Đối chiếu AI/OTP/media với gate thật; ghi mục thiếu bằng chứng.
4. Nhận báo TG-06, TC-06, T0-06, TQ-03 với build/cấu hình/nguồn tương ứng; lập bảng gate đạt/chưa đạt và chạy lại phần thay đổi sau đo.

**Kiểm thử:** Tích hợp, Playwright, kiểm tay và đọc báo cáo số đo. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Hiệu năng | Đối chiếu báo LAN/tải | p95 <100/<300 ms đúng môi trường |
| Ca 2 | Bảo mật | Giả nước/kết quả, đọc sai vai, quét bundle | Không tác động trái quyền/bí mật |
| Ca 3 | Trình duyệt | Chrome/Edge/Firefox/Safari mới, bốn cỡ | Không lỗi chức năng/cuộn ngang |
| Ca 4 | Phục hồi/AI | Restart và đối chiếu báo GATE-AI | INTERRUPTED đúng; AI đạt ngưỡng thật |
| Ca 5 | Đối soát gate | Một báo AI/perft/OTP/media thiếu bằng chứng hoặc khác phiên bản hiện tại | Không kết luận NFR liên quan PASS; đo/kiểm lại hoặc ghi BLOCKED |

**PASS khi:** **PASS công việc báo cáo:** mỗi NFR/gate có phương pháp/build/số đo/bằng chứng/kết luận hoặc lý do BLOCKED/NOT_RUN; sai lệch có lỗi giao miền và phạm vi đo lại. Không yêu cầu hết lỗi sản phẩm mới được bàn giao báo cáo. **Gate chất lượng:** NFR-01–07/trợ năng và gate bắt buộc phải đạt đúng ngưỡng trước bàn giao P1; đề xuất chỉ bắt buộc khi PO duyệt. Sửa/đo lại ngay sau phát hiện, trước TQ-07; không hạ ngưỡng docs/05 §6.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** Tiền đề đo có thể phát hiện gate FAIL. TQ-02/03 đã tách việc đo/báo cáo hoàn tất khỏi gate sản phẩm đạt; TQ-05 nhận báo cáo của chúng kể cả khi gate FAIL/BLOCKED và không tự vượt gate kỹ thuật ngăn triển khai. Báo cáo khác build cần đánh giá ảnh hưởng/đo lại, nhánh đề xuất ghi trạng thái duyệt riêng.

---

### TQ-06 — Chuẩn bị demo: tài khoản dựng sẵn, dữ liệu, kịch bản và kiểm tra hạn mức
**Epic:** EQ · **Thành phần:** QA · **Sprint đề xuất:** 4 (15/10–17/10) · **Bắt đầu khi (is blocked by):** `TQ-04`, `T0-05`, `T0-12`, `T0-06`
**Bắt đầu khi (kết quả cần có):** TQ-04: báo cáo AC/D1–D10 và lỗi có tái lập, có thể còn FAIL sản phẩm; không đòi hết lỗi mới chuẩn bị demo. T0-05: cấu hình Auth/OTP/SMTP mặc định, chưa gồm tài khoản demo. T0-12: môi trường/URL web/server demo. T0-06: báo cáo OTP thật/quota/phục hồi để lập lịch gửi thư.

**Mục tiêu:** Chuẩn bị buổi demo P1 trên môi trường và hạn mức thật. Người trình bày có dữ liệu, thứ tự thao tác và phương án báo sự cố rõ.

**Yêu cầu / nguồn:** D1–D10 ở docs/05; US-AUTH-03, US-FRIEND-04, US-AI-03. AC-FRIEND-04-03 — lời mời 30 giây; AC-AI-03-02 — giữ 30 phút. Nguồn bổ sung: BA 10.1; docs/05 §1, §7, GATE-OTP.

**Kết quả (đầu ra):** Runbook demo, tài khoản dựng sẵn được bảo vệ, dữ liệu phòng/bạn, kiểm quota và danh sách điều kiện trước buổi nộp.

**Phạm vi / ngoài phạm vi:** Demo P1, không đổi SMTP hoặc mock OTP để che thiếu quota; không công cụ demo P2 trong UI.

**Đầu vào cần có:** Email thành viên nhóm, quyền chuẩn bị tài khoản thử, thiết bị/mạng thật; tài khoản demo do chính task này tạo/hoàn tất và kiểm đăng nhập, không phải đầu ra T0-05. Đầu vào mới bắt buộc: T0-05: cấu hình Supabase Auth/OTP/SMTP mặc định đã ghi và che bí mật, không gồm tài khoản demo; T0-12: URL web/máy chủ demo hoạt động, cấu hình môi trường và cách kiểm truy cập; T0-06: báo GATE-OTP với số đo thư/hạn mức, ca lỗi và phục hồi, cấu hình che bí mật.

**Cách làm gợi ý:**

1. Tự chuẩn bị tài khoản demo B/C/D trên môi trường T0-12 theo cấu hình/quy trình T0-05/06, kiểm profiles hoàn tất và đăng nhập; bảo vệ thông tin truy cập. Tài khoản fixture nghiệm thu/tải do task kiểm tương ứng tạo, không chờ tài khoản demo này.
2. Kiểm quota SMTP/Cloud/thiết bị trước diễn tập; A dùng email nhóm đăng ký OTP thật theo D1, không đổi SMTP/mock thư để che thiếu quota.
3. Diễn tập D1–D10 trên build ghi rõ: D8 rời ghế, D9 ván online mới, D10 vào lại AI; ghi cách reset dữ liệu và báo sự cố.
4. Khi gặp lỗi, gửi ngay ca tái lập/bằng chứng/build cho miền chịu trách nhiệm; miền sửa ngay không chờ TQ-07. TQ-06 diễn tập lại phần bị ảnh hưởng sau bản sửa, lưu trước/sau.
5. Bàn giao runbook và trạng thái sẵn sàng thật; lỗi chưa hết/quota thiếu báo PO, không ghi demo sẵn sàng giả.

**Kiểm thử:** Diễn tập thủ công có Playwright hỗ trợ. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Trước demo | Đăng nhập tài khoản, kiểm URL/thiết bị/quota | Đủ điều kiện, không lộ thông tin đăng nhập |
| Ca 2 | OTP | A dùng email nhóm nhận thư thật | Hoàn tất trong điều kiện cấu hình; không thay bằng mock |
| Ca 3 | Thứ tự | D8 rời ghế; D9 mở ván mới; D10 vào lại | Đúng vị trí/ván, không dùng kết quả ván cũ |
| Ca 4 | Sự cố | Mất mạng hoặc hết hạn mức khi diễn tập | Có báo lỗi thật, không bịa kết quả đạt |
| Ca 5 | Tài khoản demo mới | Chuẩn bị B/C/D trước buổi diễn tập, xác nhận hồ sơ hoàn tất và đăng nhập trên T0-12 | Tài khoản dùng được, không PENDING/thiếu completed_at; bí mật không nằm trong runbook công khai |
| Ca 6 | Lỗi trong diễn tập | Diễn tập gặp lỗi P1, giao miền cùng ca tái lập; nhận build sửa và chạy lại | Lỗi được xử lý trước TQ-07, giữ trace/build trước-sau; chưa sửa thì demo chưa đạt, không bị khóa việc sửa bởi tiền đề QA |

**PASS khi:** Tài khoản/dữ liệu/URL/thiết bị/quota kiểm được và diễn tập đủ D1–D10 đạt trên build đã ghi; runbook người khác dùng được, không lộ bí mật. FAIL/BLOCKED nếu lỗi chức năng hoặc điều kiện demo còn thiếu. Lỗi diễn tập chuyển miền sửa ngay, rồi TQ-06 chạy lại; không cần TQ-07 bắt đầu mới được sửa. Bàn giao một báo cáo lỗi không đồng nghĩa demo sẵn sàng hoặc cổng phát hành đạt.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** TQ-04 bàn giao báo cáo dù còn FAIL để mở chuẩn bị/diễn tập. TQ-06 không là nơi duy nhất được tạo tài khoản thử, không gây phụ thuộc ngược QA. Hạn mức email/Cloud phải theo số đo thực; các nhánh chưa duyệt ghi riêng, không tự cắt P1 hoặc thay nhà cung cấp.

### TQ-07 — Sửa lỗi cuối, hồi quy và bàn giao bằng chứng
**Epic:** EQ · **Thành phần:** QA · **Sprint đề xuất:** 4 (15/10–17/10) · **Bắt đầu khi (is blocked by):** `TQ-04`, `TQ-05`, `TQ-06`, `TQ-03`
**Bắt đầu khi (kết quả cần có):** TQ-04: bảng AC và lỗi có bước tái lập; TQ-05: báo NFR đã duyệt; TQ-06: runbook/tài khoản/dữ liệu demo; TQ-03: báo quyền media thật.

**Mục tiêu:** Hồi quy/đối soát bằng chứng build cuối trước bàn giao P1. Tên khung còn Sửa lỗi cuối, nhưng task này không là nơi duy nhất mở việc sửa: lỗi đã được giao miền ngay từ TQ-04/05 hoặc lượt kiểm trước.

**Yêu cầu / nguồn:** Tập AC P1 docs/01, docs/08 §6; NFR đã duyệt docs/05. AC-PLAY-01-03 — lệnh trùng/cũ là ca hồi quy quan trọng. Nguồn bổ sung: docs/05 §1, §7; BA 10.1, Phần 11.

**Kết quả (đầu ra):** Danh sách lỗi đã sửa/kiểm lại, báo hồi quy cùng build, bảng bao phủ cuối và gói bàn giao cho PO.

**Phạm vi / ngoài phạm vi:** Sửa lỗi P1 theo nguồn; không tự thêm tính năng, cắt phạm vi hoặc nhận P2 vào nghiệm thu.

**Đầu vào cần có:** Issue nội bộ với bằng chứng, build sửa của các miền, baseline đặc tả đã duyệt và báo cáo gate.

**Cách làm gợi ý:**

1. Nhận báo TQ-04/05 có thể chứa FAIL và các lỗi đã giao miền; xác minh bản sửa/kiểm lại. Không đợi tiền đề sản phẩm PASS mới được sửa.
2. Hồi quy luồng bị ảnh hưởng, cập nhật AC/NFR/gate trên build cuối. Lỗi mới trả miền sửa ngay rồi kiểm lại; không tự đổi phạm vi/ngưỡng.
3. Đóng gói source/build/môi trường/runbook/bằng chứng; chỉ kết luận P1 đạt khi điều kiện chất lượng đã duyệt đạt, nếu chưa thì báo PO phần còn chặn.

**Kiểm thử:** Vitest, Playwright và kiểm tay theo loại lỗi. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Sửa lỗi | Chạy lại bước tái lập trên build sửa | Lỗi hết, có bằng chứng trước/sau |
| Ca 2 | Hồi quy | Chạy luồng liên quan và toàn bộ cổng cần nộp | Không lỗi mới, không bỏ ca để xanh |
| Ca 3 | Đối soát | So manifest AC/gate với artifact build cuối | Không thiếu bằng chứng hoặc dùng build cũ |
| Ca 4 | Bàn giao | Mở gói và diễn tập theo runbook | Người khác tái lập được, không chứa bí mật |

**PASS khi:** Cổng cuối: D1–D10, mọi AC/nhánh P1, NFR-01–07/trợ năng đã duyệt và gate bắt buộc đạt trên build cuối; không lỗi Cao/Nghiêm trọng mở; kiểm đơn vị/tích hợp xanh và kiểm bàn giao docs/05 §7 đạt. Báo cáo TQ-04/05 hoàn tất không đồng nghĩa gate này PASS. Còn lỗi/thiếu bằng chứng thì gate FAIL/BLOCKED, sửa/kiểm lại theo miền, không cắt P1 hoặc tự cho phép phát hành.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** Cần bảo đảm GATE-AI/PERFT/OTP nối tới gói cuối; chưa đủ phải báo PO, không tự cắt P1 để kịp ngày.
