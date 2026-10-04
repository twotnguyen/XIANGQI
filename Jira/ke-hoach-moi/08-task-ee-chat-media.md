# Kế hoạch mới (bản nháp) — 08: Task của Epic EE — Chat và camera/mic

**Ngày:** 2026-10-04 · **Trạng thái:** ĐỀ XUẤT, chờ PO và nhóm duyệt · Chưa tạo gì trên Jira. Khung, phụ thuộc và Sprint: `01-components-epic-khung-task.md`; Description Epic: `02-epic.md`.

Epic gồm **7 task**. Mỗi task: dòng đầu (Epic, thành phần, Sprint, **is blocked by**) lấy từ khung; **Bắt đầu khi (kết quả cần có)** nêu hiện vật cụ thể của từng tiền đề. Chưa có ước lượng giờ và người nhận việc (nhóm điền khi Sprint Planning).

### TE-01 — Máy chủ: chat hai kênh, quyền đọc, giới hạn 5 tin/10 giây, bộ lọc từ cấm
**Epic:** EE · **Thành phần:** Communication · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `TB-03`, `T0-04`, `TB-05`, `T0-14`, `T0-13`
**Bắt đầu khi (kết quả cần có):** TB-03: danh tính và tư cách tham gia phòng, joined_at; T0-04: chat_messages và room_participants với seat_since; TB-05: sự kiện đổi ghế/vai đã commit và mốc seat_since cập nhật; T0-14: hàm chuẩn hoá/che từ cấm dùng chung web–máy chủ, danh sách do nhóm cung cấp và fixture đối chiếu; T0-13: primitive tra/lưu biên lai theo danh tính + commandId, ghép được vào giao dịch nghiệp vụ.

**Mục tiêu:** Cung cấp chat phòng theo quyền hiện tại và thời điểm tham gia. Tin hợp lệ được lọc, lưu và gửi đúng kênh cho EE.

**Yêu cầu / nguồn:** US-CHAT-01, US-CHAT-02: AC-CHAT-01-02 — lọc theo ghế/mốc vào; AC-CHAT-01-03 — xoá khi đóng phòng; AC-CHAT-02-01 — 200 ký tự, 5 tin/10 giây; AC-CHAT-02-02 — lọc biến thể từ cấm hai phía. Nguồn bổ sung: BA 5.3; docs/03 §2.9; docs/07 §9.

**Kết quả (đầu ra):** chat.send/chat.message dùng bộ lọc T0-14 và biên lai T0-13; kiểm kênh/giới hạn và dọn chat phòng.

**Phạm vi / ngoài phạm vi:** Văn bản P1, không sticker/chat 1-1; dọn tên/chat Khách thuộc P2.

**Đầu vào cần có:** Mốc joined_at/seat_since, danh sách hai ghế và CLOSED; định danh lệnh chống trùng. Đầu vào mới bắt buộc: TB-05: sự kiện đổi ghế/vai đã commit và mốc seat_since cập nhật; T0-14: hàm chuẩn hoá/che từ cấm dùng chung web–máy chủ, danh sách do nhóm cung cấp và fixture đối chiếu; T0-13: primitive tra/lưu biên lai theo danh tính + commandId, ghép được vào giao dịch nghiệp vụ.

**Cách làm gợi ý:**

1. Xác thực rồi tra biên lai T0-13; chỉ lệnh mới kiểm vai/kênh/độ dài/tốc độ.
2. Lọc bằng T0-14; ghi tin và biên lai cùng giao dịch rồi phát đúng người.
3. Kiểm mốc vào Chung và thu quyền Riêng người rời ghế qua TB-05; lịch sử người giữ ghế khi đổi đối thủ chờ quyết định, không mặc định seat_since cá nhân đủ.
4. Hook dọn CLOSED kiểm bằng fixture tại đây; TE-03 nối đóng phòng thật qua TB-11.

**Kiểm thử:** Vitest đơn vị bộ lọc và tích hợp DB/kết nối. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Biên | Gửi tin 200/201 ký tự và tin thứ 5/6 trong 10 giây | Biên hợp lệ nhận; vượt bị chặn |
| Ca 2 | Riêng | Người xem gọi gửi/đọc Kênh Riêng | Không nhận hoặc ghi tin |
| Ca 3 | Mốc | Người xem mới/đổi xuống ghế truy tin cũ | Không đọc trước mốc có quyền |
| Ca 4 | Lọc/dọn | Dùng dấu, khoảng trắng, ký tự chèn/0/1; đóng phòng | Che *** đúng; tin phòng được xoá |
| Ca 5 | Ghép bộ lọc/biên lai | Lọc biến thể bằng T0-14, gửi trùng commandId và đổi ghế qua TB-05 | Một tin đã lọc; người mới ngồi không nhận lịch sử trước mốc |
| Ca 6 | Đổi cặp — chờ PO | A/B gửi M_AB; B xuống xem, C ngồi; A/C tải lại và gửi M_AC | Expected đề xuất: A/C không nhận M_AB, B mất quyền Riêng, A/C nhận M_AC. Chờ PO xác nhận, chưa tính PASS |

**PASS khi:** Các ca có oracle duyệt về vai, mốc vào Chung, giới hạn/lọc/biên lai/hook dọn đạt. Nhánh đổi cặp chờ quyết định không được tự PASS; có thể bàn giao phần độc lập nhưng chưa đánh dấu toàn task/AC hoàn tất khi chưa rõ oracle. Đây là thiếu quyết định sản phẩm, không phải chờ task hậu nhiệm. FAIL nếu phát trái quyền/tin trùng.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** Chờ quyết định: docs/03 §2.9 dùng seat_since cá nhân, docs/07 §2/§9 giới hạn lịch sử theo cặp ghế. Không tự chọn thuật toán/schema. Ca PO cần xác nhận: A/B gửi M_AB; B xuống xem, C ngồi; A/C tải lịch sử rồi gửi M_AC. Expected ĐỀ XUẤT: A/C không nhận M_AB của cặp trước, B không nhận Riêng sau mất ghế, A/C nhận M_AC. Chưa duyệt thì không tự tính nhánh đó PASS hoặc toàn AC-CHAT-01-02 đã đạt. Đồng bộ nguồn trước nghiệm thu, không lấy fixture tự chọn làm oracle; không tự đặt ngưỡng dọn mới.

---

### TE-02 — Web: giao diện chat hai kênh, ẩn/hiện Kênh Chung
**Epic:** EE · **Thành phần:** Frontend, Communication · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `T0-10`, `T0-03`, `TH-01`, `T0-14`
**Bắt đầu khi (kết quả cần có):** T0-10: ứng dụng React/Vite với router và kết nối shared chạy được; T0-03: kiểu chat, ack, lỗi và vai trò; TH-01: token Kỳ Đài Cổ Phong và nút/modal/tooltip/thông báo với focus, năm trạng thái; T0-14: hàm chuẩn hoá/che từ cấm dùng chung web–máy chủ, danh sách do nhóm cung cấp và fixture đối chiếu.

**Mục tiêu:** Dựng giao diện chat dễ phân biệt hai kênh. Người dùng nhận rõ tin đang gửi, lỗi và quyền đọc của mình.

**Yêu cầu / nguồn:** US-CHAT-01: AC-CHAT-01-01 — người chơi mặc định Kênh Riêng, người xem chỉ Chung; AC-CHAT-01-02 — không lịch sử trái quyền. AC-CHAT-02-03 — khay sticker ẩn. Nguồn bổ sung: DANH-MUC PANEL-CHAT; DESIGN §6.9; docs/07 §9. US-CHAT-02: AC-CHAT-02-02 — cùng phép lọc biến thể ở client và máy chủ.

**Kết quả (đầu ra):** PANEL-CHAT có công tắc Kênh Chung, nhập/gửi văn bản và trạng thái tin/năm trạng thái khung.

**Phạm vi / ngoài phạm vi:** UI chat phòng P1, không chat trực tiếp hoặc sticker.

**Đầu vào cần có:** Adapter chat theo shared và fixture quyền/mốc; UI không phải chờ dịch vụ TE-01 mới dùng được bộ lọc chung. Đầu vào mới bắt buộc: TH-01: token Kỳ Đài Cổ Phong và nút/modal/tooltip/thông báo với focus, năm trạng thái; T0-14: hàm chuẩn hoá/che từ cấm dùng chung web–máy chủ, danh sách do nhóm cung cấp và fixture đối chiếu.

**Cách làm gợi ý:**

1. Dựng tab/kênh theo vai và nhãn cho Kênh Chung.
2. Hiện đang gửi đến ack; lỗi giữ nội dung không nhạy cảm để thử lại có định danh.
3. Gỡ lịch sử không còn quyền khi đổi ghế; công tắc chỉ đổi hiển thị.
4. Dùng component/tooltip TH-01 và bộ lọc T0-14 trực tiếp trên web; hiển thị phản hồi server vẫn là nguồn xác nhận gửi, không coi lọc client thay kiểm máy chủ.

**Kiểm thử:** Playwright UI với fixture hợp đồng. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Kênh | Vào với hai vai, ẩn/hiện Chung | Đúng kênh mặc định; xem không có Riêng |
| Ca 2 | Tin lỗi | Mô phỏng từ chối và mất ack | Không báo đã gửi; không tạo định danh mới mù quáng |
| Ca 3 | Quyền đổi | PLAYER chuyển SPECTATOR | Không còn dữ liệu Riêng trong UI |
| Ca 4 | Trạng thái | Không tin, tải chậm, lỗi, không được gửi | Đủ EMPTY/LOADING/ERROR/DISABLED và lý do |
| Ca 5 | Bộ lọc chung | Nhập bộ biến thể từ fixture T0-14 và kiểm nút gửi bị vô hiệu | Kết quả che từ thống nhất; trạng thái dùng component/tooltip nền |

**PASS khi:** Mọi ca UI đạt, thao tác được bàn phím; chưa coi chat thật đạt trước TE-03. Sai ca bắt buộc: FAIL; chưa kiểm/thiếu điều kiện: NOT_RUN/BLOCKED.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** Bộ lọc chung đến từ T0-14, không còn chờ TE-01 để dựng UI. Quyền thật và chống gửi trùng được kiểm tại TE-03; dữ liệu fixture không là bằng chứng tích hợp.

### TE-03 — Tích hợp chat (web ↔ máy chủ)
**Epic:** EE · **Thành phần:** Frontend, Communication · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `TE-01`, `TE-02`, `TD-06`, `TB-11`
**Bắt đầu khi (kết quả cần có):** TE-01: chat lưu/lọc/giới hạn và gửi theo quyền; TE-02: khung chat và trạng thái ack; TD-06: tư cách/snapshot người xem thật; TB-11: UI/API đổi ghế, riêng tư, đuổi và vòng đời Host/đóng phòng đã tích hợp.

**Mục tiêu:** Nối khung chat với dịch vụ và tư cách người xem thật. Kiểm phân quyền ở payload, không chỉ nhìn tab bị ẩn.

**Yêu cầu / nguồn:** US-CHAT-01, US-CHAT-02: AC-CHAT-01-02 — không rò lịch sử; AC-CHAT-01-03 — dọn phòng; AC-CHAT-02-01 — giới hạn; AC-CHAT-02-02 — lọc client/server. Nguồn bổ sung: docs/03 §2.9; docs/07 §9; docs/08 nhóm E.

**Kết quả (đầu ra):** Adapter chat hai chiều dùng bộ lọc T0-14 ở hai phía và E2E nhiều người đọc/gửi.

**Phạm vi / ngoài phạm vi:** Chat phòng P1; không nhắn tin bạn bè, không ghi nhận P2 đã làm.

**Đầu vào cần có:** Cặp nối: TE-02 chat UI ↔ TE-01 chat.send/message/ack; vai từ phòng/TD-06. Đầu vào mới bắt buộc: TB-11: UI/API đổi ghế, riêng tư, đuổi và vòng đời Host/đóng phòng đã tích hợp.

**Cách làm gợi ý:**

1. Nối kênh/ack và bộ lọc dùng chung.
2. Chạy người chơi và người xem với bắt payload mạng.
3. Đổi ghế/đuổi/đóng phòng rồi kiểm dữ liệu và trạng thái lỗi.
4. Ghép chat với các thao tác đổi ghế/đuổi/đóng đã tích hợp ở TB-11; kiểm bộ lọc T0-14 cùng phiên bản ở cả web và máy chủ.

**Kiểm thử:** Playwright nhiều client, Vitest tích hợp. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Riêng/Chung | Hai người chơi gửi mỗi kênh; người xem gửi Chung | Nhận đúng tập người |
| Ca 2 | Giới hạn | Gửi nhanh/quá dài và biến thể từ cấm | Chặn/che giống nguồn |
| Ca 3 | Mất ack | Ngắt sau server nhận, gửi lại định danh cũ | Một tin, UI khớp trạng thái thật |
| Ca 4 | Mốc người mới/đóng | Người xem vào muộn, người mới xuống ghế, đóng phòng | Không nhận tin trước mốc được phép; chat dọn. Người giữ ghế khi đổi đối thủ kiểm riêng Ca 6 chờ quyết định |
| Ca 5 | Vòng đời thật | Thu quyền người rời ghế, đóng phòng bằng TB-11 | Mất ghế không nhận Riêng, phòng đóng dọn tin; lịch sử người giữ ghế tách Ca 6 chờ quyết định |
| Ca 6 | Đổi cặp — chờ PO | A/B gửi M_AB; B xuống xem, C ngồi; A/C tải lại và gửi M_AC | Expected đề xuất: A/C không nhận M_AB, B mất quyền Riêng, A/C nhận M_AC. Chờ PO xác nhận, chưa tính PASS |

**PASS khi:** Mọi ca tích hợp có oracle đã duyệt đạt, không byte Riêng tới người xem, không tin trùng, phòng đóng thật dọn chat. Nhánh A/B→A/C phải có expected PO xác nhận trước hoàn tất toàn task/AC; báo phần đã kiểm và phần chờ quyết định riêng, không chọn một nguồn rồi tự PASS.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** Chờ quyết định: docs/03 §2.9 dùng seat_since cá nhân, docs/07 §2/§9 giới hạn lịch sử theo cặp ghế. Không tự chọn thuật toán/schema. Ca PO cần xác nhận: A/B gửi M_AB; B xuống xem, C ngồi; A/C tải lịch sử rồi gửi M_AC. Expected ĐỀ XUẤT: A/C không nhận M_AB của cặp trước, B không nhận Riêng sau mất ghế, A/C nhận M_AC. Chưa duyệt thì không tự tính nhánh đó PASS hoặc toàn AC-CHAT-01-02 đã đạt. Đồng bộ nguồn trước nghiệm thu, không lấy fixture tự chọn làm oracle; không tự đặt ngưỡng dọn mới.

---

### TE-04 — Máy chủ: cấp token LiveKit theo vai trò, thu hồi quyền khi đổi vai/đuổi/tiếp quản
**Epic:** EE · **Thành phần:** Communication · **Sprint đề xuất:** 4 (15/10–17/10) · **Bắt đầu khi (is blocked by):** `T0-07`, `TB-05`, `TB-07`
**Bắt đầu khi (kết quả cần có):** T0-07: PoC có bằng chứng ĐẠT quyền publish/subscribe bắt buộc và thử token cũ; chỉ có báo cáo chưa đủ. Không đạt/chưa kết luận thì BLOCKED phần phụ thuộc, báo PO. TB-05: thay vai đã commit; TB-07: hook đuổi/rời/CLOSED và membership sau xử lý, chưa thu media thật. TE-04 nối các hook với LiveKit.

**Mục tiêu:** Cấp và thay đổi quyền LiveKit từ vai trò phòng có thẩm quyền. Người dùng hợp lệ giữ quyền mới, kết nối cũ không lấy lại quyền đã mất.

**Yêu cầu / nguồn:** US-MEDIA-01, US-MEDIA-02: AC-MEDIA-01-02 — ba mức chia sẻ; AC-MEDIA-02-01 — người xem không phát; AC-MEDIA-02-02 — chỉ nhận track được chia sẻ. Nguồn bổ sung: BA 4.1, 4.3; docs/04 §7; docs/05 GATE-MEDIA.

**Kết quả (đầu ra):** Dịch vụ cấp token từ máy chủ, ma trận publish/subscribe và xử lý thay quyền.

**Phạm vi / ngoài phạm vi:** LiveKit Cloud đã chọn; không tự dựng dịch vụ, ghi âm/ghi hình hoặc mở quyền cho người ngoài.

**Đầu vào cần có:** Danh tính/phiên điều khiển, roomId, vai/chia sẻ và gate T0-07 đạt. Cơ chế thu hồi cụ thể còn đề xuất phải được quyết định trước áp dụng, quyền cấm nhận/phát không trở thành tùy chọn. Hook tiếp quản kiểm bằng client fixture ở đây, TE-06 nối runtime và TE-07 kiểm thiết bị/UI thật.

**Cách làm gợi ý:**

1. Lập ma trận nhận theo người phát và mức chia sẻ trước publish.
2. Cấp token phía server; SPECTATOR canPublish/canPublishData=false.
3. Đổi vai/đuổi/tiếp quản cập nhật hoặc thu hồi kết nối cũ; LOCKED giữ thành viên hiện tại.
4. Nối sự kiện đuổi/Host rời/CLOSED từ TB-07 và đổi vai từ TB-05 vào cùng dịch vụ quyền; giữ quy tắc LOCKED không loại người hiện tại.

**Kiểm thử:** Vitest quyền, kiểm tích hợp LiveKit thật. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Người xem | Token người xem thử publish và gọi xin quyền khác | Bị chặn tại dịch vụ |
| Ca 2 | Mức chia sẻ | Chuyển giữa ba mức với đối thủ/người xem | Đúng tập nhận |
| Ca 3 | Token cũ | Dùng lại token sau đổi vai/đuổi | Không lấy lại quyền cũ; quyền mới hợp lệ vẫn hoạt động |
| Ca 4 | Policy LOCKED | Cấp snapshot LOCKED và membership còn hiệu lực/hết hạn vào dịch vụ token | Không thu quyền chỉ vì khóa; cấp lại đúng tư cách. Runtime reconnect toàn phòng kiểm tại TD-11/TQ-04 |
| Ca 5 | Đuổi/đóng thật | Gọi room.kick hoặc đóng phòng qua TB-07 khi còn track/kết nối | Danh tính bị đuổi không được token mới; phòng đóng không duy trì quyền nhận/phát |

**PASS khi:** Quyền đã duyệt đạt ở dịch vụ thật; không nhận track trái quyền. Phần giải pháp thu hồi đang đề xuất phải có review và số đo trước chốt. Sai ca bắt buộc: FAIL; chưa kiểm/thiếu điều kiện: NOT_RUN/BLOCKED.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** TB-07 đã là tiền đề; chi tiết thu hồi token cũ trong docs/04 vẫn chờ PO và cần số đo PoC. Không dùng ẩn UI thay quyền LiveKit.

---

### TE-05 — Web: giao diện camera/mic, bật/tắt độc lập, mức chia sẻ, trạng thái quyền và lỗi
**Epic:** EE · **Thành phần:** Frontend, Communication · **Sprint đề xuất:** 4 (15/10–17/10) · **Bắt đầu khi (is blocked by):** `T0-07`, `T0-10`, `TH-01`
**Bắt đầu khi (kết quả cần có):** T0-07: cách subscribe theo người đã thử trên Cloud; T0-10: ứng dụng React/Vite với router và kết nối shared chạy được; TH-01: token Kỳ Đài Cổ Phong và nút/modal/tooltip/thông báo với focus, năm trạng thái.

**Mục tiêu:** Dựng điều khiển camera/mic độc lập cho người chơi. Giao diện thông báo quyền thiết bị, chia sẻ và sự cố mà không cản đi cờ.

**Yêu cầu / nguồn:** US-MEDIA-01, US-MEDIA-02: AC-MEDIA-01-01 — mặc định tắt; AC-MEDIA-01-02 — mức chia sẻ chung hai track; AC-MEDIA-01-04 — không ghi lưu; AC-MEDIA-02-01 — người xem không có nút phát. Nguồn bổ sung: DESIGN §6.9; DANH-MUC PANEL-MEDIA; docs/04 §7.

**Kết quả (đầu ra):** PANEL-MEDIA, điều khiển thiết bị/chia sẻ, trạng thái xin quyền/lỗi và cleanup track.

**Phạm vi / ngoài phạm vi:** Media P1; không hộp chuyển media P2 hoặc chức năng ghi âm/ghi hình.

**Đầu vào cần có:** Hợp đồng token/quyền dự kiến và SDK LiveKit đã được PoC; quyền trình duyệt. Đầu vào mới bắt buộc: TH-01: token Kỳ Đài Cổ Phong và nút/modal/tooltip/thông báo với focus, năm trạng thái.

**Cách làm gợi ý:**

1. Khởi tạo thiết bị tắt, chỉ xin quyền khi người chơi thao tác.
2. Tách camera/mic nhưng áp một mức chia sẻ; không bật mức cho người xem khi phòng không có người xem.
3. Dọn track khi rời/tiếp quản, hiển thị lỗi thiết bị và cho thao tác khác tiếp tục.
4. Ghép nút/công tắc/tooltip/thông báo từ TH-01 vào PANEL-MEDIA; kiểm focus và trạng thái lỗi thiết bị trên theme tối.

**Kiểm thử:** Playwright UI và kiểm tay thiết bị thật. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Mặc định | Vào phòng rồi bật riêng mic/camera | Không tự bật; điều khiển độc lập |
| Ca 2 | Quyền thiết bị | Từ chối quyền hoặc không có thiết bị | Lỗi rõ; bàn cờ/chat vẫn dùng |
| Ca 3 | Vai | Mở bằng người xem | Không nút phát, không xin quyền thiết bị |
| Ca 4 | Cleanup | Rời phòng hoặc nhận mất quyền | Track dừng, thiết bị không tiếp tục phát |
| Ca 5 | Nền UI | Dùng bàn phím bật/tắt thiết bị và vào trạng thái không có quyền | Nhãn/focus/tooltip đúng TH-01; không tự bật thiết bị |

**PASS khi:** Mọi ca UI/thiết bị đạt; năm trạng thái có phản hồi đúng, không có chức năng lưu media. Sai ca bắt buộc: FAIL; chưa kiểm/thiếu điều kiện: NOT_RUN/BLOCKED.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** TH-01 đã cung cấp nền UI; quyền truyền thật còn cần TE-07. Không tự thêm thư viện biểu tượng chưa được chọn.

### TE-06 — Máy chủ: mở nhiều tab (tab mới tiếp quản, loại kết nối cũ)
**Epic:** EE · **Thành phần:** Realtime · **Sprint đề xuất:** 4 (15/10–17/10) · **Bắt đầu khi (is blocked by):** `TA-05`, `TE-04`
**Bắt đầu khi (kết quả cần có):** TA-05: xác thực phiên và hạn/thu hồi; TE-04: cấp quyền mới và loại quyền LiveKit cũ.

**Mục tiêu:** Duy trì một tab điều khiển cho cùng phiên chơi. Tab cũ trở thành chỉ đọc và dừng media khi tab mới tiếp quản.

**Yêu cầu / nguồn:** US-MEDIA-03: AC-MEDIA-03-01 — tiếp quản/dừng thiết bị cũ/tab mới tắt; US-AUTH-04: AC-AUTH-04-05 — đăng nhập tab/thiết bị sau tiếp quản nơi trước. TE-06 sở hữu backend hai AC, TE-07 nhận UI/thiết bị thật. BA 1.8; docs/04 §3/§7; docs/07 phần phiên.

**Kết quả (đầu ra):** Một kết nối điều khiển theo người, thông báo tiếp quản, guard từ chối lệnh cũ và thu quyền LiveKit TE-04. Contract web: thông báo tiếng Việt, chuyển chỉ đọc/dừng thiết bị cũ, nơi mới mặc định tắt. Contract không tự chứng minh thiết bị vật lý đã dừng.

**Phạm vi / ngoài phạm vi:** Tiếp quản P1; không MODAL-MEDIA-TAB-SWITCH và không tự bật media tab mới.

**Đầu vào cần có:** Danh tính/phiên/kết nối cũ-mới, roomId, dịch vụ đổi quyền TE-04.

**Cách làm gợi ý:**

1. Chọn tab điều khiển mới dưới xử lý tuần tự theo người.
2. Báo tab cũ chỉ đọc; chặn lệnh thay đổi ở máy chủ.
3. Thu quyền media cũ qua TE-04; contract nơi mới mặc định tắt, kiểm bằng client fixture. TE-07 kiểm thiết bị vật lý thật, không suy thiết bị dừng chỉ từ ACK.

**Kiểm thử:** Vitest kết nối xác thực cạnh tranh và client fixture theo shared; LiveKit thật qua TE-04. Không đòi màn sản phẩm/Playwright đầy đủ ở task backend. Ca nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Backend tiếp quản | Hai client fixture cùng tài khoản, nơi sau tiếp quản | Nơi cũ nhận thông báo/mất quyền ghi và quyền truyền cũ; contract nơi mới mặc định tắt |
| Ca 2 | Guard | Nơi cũ gửi lệnh thay đổi vào handler thử có đếm tác động | Từ chối trước callback, tác động 0; thao tác ván UI thật kiểm tại TQ-04 |
| Ca 3 | Đồng thời | Mở nhiều tab cùng lúc | Chỉ một tab có quyền điều khiển |
| Ca 4 | Phiên lỗi | Token hết hạn xin tiếp quản | Không chiếm điều khiển hợp lệ |

**PASS khi:** Backend/contract và thu quyền qua TE-04 đạt, một kết nối điều khiển. Không đòi màn TE-05/đường chơi web để PASS backend; chưa nhận trọn hai AC. TE-07 kiểm thông báo/chỉ đọc/thiết bị thật, TQ-04 kiểm nước đi thật sau tiếp quản. FAIL nếu client cũ vẫn ghi hoặc lấy lại quyền trái phép.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** Không xoá toàn bộ phiên thay cho tiếp quản, nơi cũ còn đọc theo BA. Thu hồi theo phương án TE-04 được duyệt. Handler fixture chứng minh guard, không chứng minh camera/mic vật lý dừng.

---

### TE-07 — Tích hợp media: camera/mic theo đối tượng nhận, đổi vai, đuổi, tab (web ↔ máy chủ ↔ LiveKit)
**Epic:** EE · **Thành phần:** Frontend, Communication · **Sprint đề xuất:** 4 (15/10–17/10) · **Bắt đầu khi (is blocked by):** `TE-04`, `TE-05`, `TE-06`, `TB-07`, `TE-03`, `TD-09`
**Bắt đầu khi (kết quả cần có):** TE-04: token/thu quyền LiveKit đã kiểm với gate PoC đạt; TE-05: UI camera/mic, chia sẻ và cleanup thiết bị; TE-06: một phiên điều khiển, sự kiện tiếp quản và guard lệnh cũ; TB-07: hook đuổi/rời/CLOSED và membership sau thay đổi; TE-03: chat web–máy chủ thật, ACK/lọc/quyền; TD-09: nước đi thật đồng bộ hai trình duyệt và adapter ván.

**Mục tiêu:** Nối web, dịch vụ quyền và LiveKit Cloud thành media thật. Chứng minh mọi chuyển vai/tab thay đúng tập người nhận.

**Yêu cầu / nguồn:** US-MEDIA-01, US-MEDIA-02, US-MEDIA-03: AC-MEDIA-01-03 — hai người thấy/nghe khi chia sẻ phù hợp; AC-MEDIA-02-02 — người xem chỉ track được cho; AC-MEDIA-03-01 — tiếp quản dừng tab cũ. Nguồn bổ sung: docs/04 §7; docs/05 GATE-MEDIA; docs/07 §9.

**Kết quả (đầu ra):** Adapter media thật, báo cáo ma trận quyền/track và bằng chứng không rò khi chuyển trạng thái.

**Phạm vi / ngoài phạm vi:** P1 hai người chơi, tối đa năm người xem; không ghi/lưu media hoặc mở rộng P2.

**Đầu vào cần có:** Cặp media: TE-05 quản lý track ↔ TE-04/06 token/phiên ↔ LiveKit Cloud. Cặp kiểm không gián đoạn: bảng cờ TD-09 ↔ handler nước đi TD-02, chat TE-03 ↔ dịch vụ TE-01. Quyền phòng qua TB-07 và TB-05 trong tổ tiên; dữ liệu thử/thiết bị được chuẩn bị trên build chung. Không còn dùng host fixture để nghiệm thu cờ/chat khi media hỏng.

**Cách làm gợi ý:**

1. Ghép cấp token/publish/subscribe theo quyền server trước truyền; dùng cùng build của các tiền đề.
2. Chạy ma trận hai người chơi, từng mức chia sẻ và người xem; đổi vai/đuổi/đóng qua dịch vụ phòng thật.
3. Tiếp quản bằng tab/thiết bị thật: kiểm thông báo/chỉ đọc, dừng track thiết bị cũ, mặc định tắt ở nơi mới; thử token/lệnh cũ.
4. Gây lỗi riêng media hoặc từ chối quyền thiết bị, giữ kết nối ứng dụng; đi nước qua TD-09 và gửi chat qua TE-03 rồi kiểm bên nhận/ACK.
5. Lưu metadata quyền/track và báo cáo, không ghi nội dung camera/mic.

**Kiểm thử:** LiveKit thật, Playwright nhiều client và kiểm tay thiết bị; bảng ca nội bộ.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Ba mức chia sẻ | Thử độc lập từng mức ở hai người phát, có tối đa năm người xem | Chỉ đúng đối thủ/người xem được nhận; người xem không publish |
| Ca 2 | Thu quyền thật | Đổi vai hoặc kick qua TB-07 khi đang truyền; dùng lại token cũ | Mất quyền tại LiveKit, không lấy lại quyền cũ; không coi ẩn panel là đủ |
| Ca 3 | Tiếp quản | Tab/thiết bị cũ đang chơi/phát, nơi mới cùng tài khoản tiếp quản; cũ gửi nước | Cũ có thông báo/chỉ đọc, camera/mic dừng, lệnh bị chặn; nơi mới điều khiển và thiết bị mặc định tắt |
| Ca 4 | Media hỏng — cờ/chat thật | Từ chối thiết bị hoặc ngắt riêng media, rồi đi nước hợp lệ và gửi chat | TD-09 vẫn đồng bộ nước ở trình duyệt kia; TE-03 vẫn ACK/phát đúng kênh; lỗi media không khóa hai luồng |
| Ca 5 | Đóng phòng | Đóng bằng TB-07 khi còn track, xin token mới hoặc dùng token cũ | Không còn quyền nhận/phát trong phòng đã đóng |
| Ca 6 | LOCKED tại dịch vụ quyền | Đưa membership hiện tại còn hiệu lực vào phòng LOCKED, đối chiếu người mới | Không thu quyền người hiện tại chỉ vì khóa; không cấp quyền người mới. Reconnect theo timer toàn phòng ở TD-11 |

**PASS khi:** Mọi ca đã duyệt trên đạt với track, nước đi và chat thật; nơi cũ không điều khiển/phát sau tiếp quản, thiết bị dừng và nơi mới tắt mặc định. FAIL nếu nhận/phát trái quyền, cờ/chat bị khóa do lỗi riêng media, hoặc chỉ fixture/ẩn UI làm chứng cứ. TQ-04 có thể hồi quy nhưng không thay nghiệm thu ca liên miền tại TE-07.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** TE-03/TD-09 đã là tiền đề, không còn đề xuất thêm hai cạnh này. Cơ chế thu hồi/cửa sổ hiệu lực còn chờ quyết định theo nguồn; ghi số đo và trạng thái duyệt, không tự đặt ngưỡng/nâng gói. Không giả media hỏng bằng ngắt toàn bộ mạng rồi quy lỗi ván/chat cho media.

---
