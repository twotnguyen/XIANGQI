# Kế hoạch mới (bản nháp) — 11: Task của Epic EH — Giao diện chung

**Ngày:** 2026-10-04 · **Trạng thái:** ĐỀ XUẤT, chờ PO và nhóm duyệt · Chưa tạo gì trên Jira. Khung, phụ thuộc và Sprint: `01-components-epic-khung-task.md`; Description Epic: `02-epic.md`.

Epic gồm **6 task**. Mỗi task: dòng đầu (Epic, thành phần, Sprint, **is blocked by**) lấy từ khung; **Bắt đầu khi (kết quả cần có)** nêu hiện vật cụ thể của từng tiền đề. Chưa có ước lượng giờ và người nhận việc (nhóm điền khi Sprint Planning).

### TH-01 — Giao diện: token Kỳ Đài Cổ Phong và thành phần nền (nút, hộp thoại, thông báo)
**Epic:** EH · **Thành phần:** UI/UX · **Sprint đề xuất:** 1 (04/10–07/10) · **Bắt đầu khi (is blocked by):** `T0-10`
**Bắt đầu khi (kết quả cần có):** T0-10: khung React/Vite chạy được.

**Mục tiêu:** Tạo token và thành phần nền cho giao diện Kỳ Đài Cổ Phong. Các màn P1 dùng chung hành vi nút, focus, trạng thái và thông báo.

**Yêu cầu / nguồn:** US-UI-03: AC-UI-03-01 — năm trạng thái có phản hồi đúng. US-UI-06: AC-UI-06-02 — chỉ theme P1. Nguồn bổ sung: DESIGN §2–6, §12; DANH-MUC §2.

**Kết quả (đầu ra):** Token tối, nút/input/hộp thoại/toast/tooltip/skeleton và trang kiểm trạng thái nội bộ.

**Phạm vi / ngoài phạm vi:** Nền P1, không bộ chọn theme hoặc thư viện UI/Tailwind ngoài phạm vi.

**Đầu vào cần có:** Mã màu tối và token bàn cờ DESIGN; mẫu focus/nhãn từ DANH-MUC.

**Cách làm gợi ý:**

1. Chuyển token được chốt sang CSS, giữ màu bàn cờ.
2. Dựng component nền với nhãn, focus và năm trạng thái.
3. Xác nhận nguy hiểm focus Huỷ; không áp trap focus cho khung xin hòa.

**Kiểm thử:** Vitest thành phần, Playwright và kiểm thị giác. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Token | So màu thực với DESIGN | Đúng theme tối, không tự theo hệ điều hành |
| Ca 2 | Năm trạng thái | Duyệt từng trạng thái nút/input/khung | Tooltip cho vô hiệu, lỗi có phản hồi |
| Ca 3 | Focus | Mở/đóng modal bằng bàn phím | Focus đúng và trở về nút mở |
| Ca 4 | Chuyển động | Bật reduced-motion | Tắt chuyển động theo đặc tả |

**PASS khi:** Mọi ca nền đạt; không thay mã màu chốt. Đo trợ năng toàn màn tiếp tục tại TH-05. Sai ca bắt buộc: FAIL; chưa kiểm/thiếu điều kiện: NOT_RUN/BLOCKED.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** Một số token DESIGN ghi đề xuất, không tự xem là quyết định mới; thư viện biểu tượng chưa chọn cần xác nhận trước thêm.

### TH-02 — Giao diện: thanh điều hướng và khung Sảnh
**Epic:** EH · **Thành phần:** Frontend, UI/UX · **Sprint đề xuất:** 2 (08/10–10/10) · **Bắt đầu khi (is blocked by):** `TH-01`
**Bắt đầu khi (kết quả cần có):** TH-01: token và nút/modal/trạng thái nền.

**Mục tiêu:** Tạo thanh điều hướng và shell Sảnh thống nhất để ghép các miền. Người dùng truy cập chức năng P1 và quay lại vị trí chơi đang giữ.

**Yêu cầu / nguồn:** US-UI-01, US-UI-02: AC-UI-01-01 — thanh đầu/chuông/hồ sơ; AC-UI-02-01 — chức năng Sảnh; AC-UI-02-02 — banner quay lại và chặn tạo khi có ghế; AC-UI-02-03 — Luật chơi thu gọn. Nguồn bổ sung: BA 10.4; DANH-MUC SCR-LOBBY, PANEL-NAVBAR; docs/02 §3–5.

**Kết quả (đầu ra):** Điều hướng P1, vị trí gắn chuông/bạn bè, Sảnh có slot phòng/AI/banner và phần Luật chơi.

**Phạm vi / ngoài phạm vi:** Shell P1; không nhân đôi backend hoặc form của TB-08, không trang Luật chơi mới.

**Đầu vào cần có:** Router T0-10, hợp đồng trạng thái phiên/vị trí và slot nội dung từ các miền.

**Cách làm gợi ý:**

1. Dựng điều hướng đăng nhập và đường dẫn P1.
2. Ghép slot cho phòng/AI/chuông, banner theo vị trí thật khi tích hợp.
3. Viết luật từ docs/02, nêu hết nước là thua và đuổi quân không xử riêng.

**Kiểm thử:** Playwright shell/bàn phím. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Điều hướng | Mở Sảnh/Bạn bè/Hồ sơ | Đúng trang; P2 không kích hoạt |
| Ca 2 | Vị trí | Fixture còn ghế/AI và không có | Đúng banner/nút DISABLED có lý do |
| Ca 3 | Luật | Mở/thu bằng chuột/bàn phím | Đúng nội dung, không trang thứ 38 |
| Ca 4 | Trạng thái | Tải lỗi slot | Lỗi rõ, không mất toàn shell |

**PASS khi:** Mọi ca shell đạt, không lối tạo vị trí chơi thứ hai; ghép dữ liệu thật cần các task miền. Sai ca bắt buộc: FAIL; chưa kiểm/thiếu điều kiện: NOT_RUN/BLOCKED.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** Trùng phạm vi Sảnh với TB-08/TG-04; cần quy định TH-02 sở hữu shell, miền sở hữu nội dung, không tự tạo hai trang.

### TH-03 — Giao diện: năm trạng thái cho mọi màn hình và khung dữ liệu
**Epic:** EH · **Thành phần:** UI/UX · **Sprint đề xuất:** 4 (15/10–17/10) · **Bắt đầu khi (is blocked by):** `TH-02`, `TB-11`, `TD-11`, `TE-07`, `TF-05`, `TG-05`, `TA-09`, `TE-03`
**Bắt đầu khi (kết quả cần có):** TH-02: shell Sảnh/điều hướng, vị trí ghép chuông, thẻ AI và banner quay lại; TB-11: UI/API đổi ghế, riêng tư, đuổi và vòng đời Host/đóng phòng đã tích hợp; TD-11: ván/reconnect/người xem thật; TE-07: pipeline UI–máy chủ–LiveKit Cloud với track thật và chuyển quyền/tab; TF-05: bạn bè thật; TG-05: AI thật; TA-09: đăng ký/đăng nhập thật; TE-03: chat web–máy chủ thật với ack/lọc từ/quyền theo kênh và vòng đời phòng.

**Mục tiêu:** Hội tụ năm trạng thái trên toàn bộ thành phần P1 đã tích hợp. Người dùng luôn biết đang tải, rỗng, lỗi hay bị chặn và cách tiếp tục.

**Yêu cầu / nguồn:** US-UI-03: AC-UI-03-01 — SUCCESS/LOADING/EMPTY/ERROR/DISABLED. Các ca thành phần P1 trong docs/08 §4. Nguồn bổ sung: DANH-MUC §2, §7; docs/08 §4.

**Kết quả (đầu ra):** Bảng bao phủ trạng thái của 23 thành phần P1, các sửa giao diện và bộ E2E kích hoạt từng nhánh.

**Phạm vi / ngoài phạm vi:** Hội tụ P1, không dựng 14 thành phần P2; trạng thái không hiện dùng ý nghĩa EMPTY theo docs/08.

**Đầu vào cần có:** Build các miền và fixture/lỗi có thể tái lập; ma trận UI docs/08 đúng từng thành phần. Đầu vào mới bắt buộc: TE-03: chat web–máy chủ thật với ack/lọc từ/quyền theo kênh và vòng đời phòng.

**Cách làm gợi ý:**

1. Lập danh sách đúng thành phần P1 và ca tương ứng.
2. Kích hoạt tải chậm/rỗng/lỗi/quyền thiếu trên build thật.
3. Sửa phản hồi/thử lại/tooltip, đối soát không giật bố cục và không báo thành công giả.
4. Bổ sung PANEL-CHAT từ TE-03 vào ma trận thật: mất ack, vượt giới hạn và đổi vai; đối chiếu quyền dữ liệu chứ không chỉ hình khung.

**Kiểm thử:** Playwright ma trận trạng thái, kiểm tay. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Tải/rỗng | Tải chậm và không dữ liệu mỗi khung | Skeleton/giải thích/hành động đúng |
| Ca 2 | Lỗi | Từ chối/mất mạng/lỗi phụ thuộc | Thông báo tiếng Việt, Thử lại đúng |
| Ca 3 | Vô hiệu | Thiếu quyền/trần/đã kết thúc | Tooltip đúng, máy chủ vẫn chặn |
| Ca 4 | Modal/overlay | Mở/đóng/xin hòa/reconnect | Đúng ngoại lệ Esc/focus theo ma trận |
| Ca 5 | Chat thật | Trên TE-03 gây tải/rỗng/lỗi gửi/thiếu quyền và nhận tin thành công | Đủ năm trạng thái, không giả đã gửi hoặc để dữ liệu riêng sau đổi vai |

**PASS khi:** Mọi ô trạng thái P1 áp dụng có bằng chứng đạt; không mặc định EMPTY luôn là một màn trống. Sai ca bắt buộc: FAIL; chưa kiểm/thiếu điều kiện: NOT_RUN/BLOCKED.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** TE-03 đã là tiền đề. Đây là hội tụ, không cho các miền trì hoãn năm trạng thái tới Sprint 4; phần chuyển hướng TA-12 cần kiểm cuối tại TQ-04.

### TH-04 — Giao diện: responsive từ 360 px, thao tác cảm ứng
**Epic:** EH · **Thành phần:** UI/UX · **Sprint đề xuất:** 4 (15/10–17/10) · **Bắt đầu khi (is blocked by):** `TH-03`
**Bắt đầu khi (kết quả cần có):** TH-03: build mọi miền và năm trạng thái đã hội tụ.

**Mục tiêu:** Đảm bảo P1 sử dụng được từ 360 px và bằng cảm ứng. Bàn cờ, chat/media và hành động chính không bị che hay tràn ngang.

**Yêu cầu / nguồn:** US-UI-04: AC-UI-04-01 — từ 360 px không cuộn ngang/cảm ứng; AC-UI-04-02 — kiểm bốn kích thước. Nguồn bổ sung: DESIGN §4.2, §7.5, §8, §13; docs/05 §6.

**Kết quả (đầu ra):** Bố cục đáp ứng, điều chỉnh vùng chạm/tab nhỏ và bộ ảnh/ca bốn viewport.

**Phạm vi / ngoài phạm vi:** P1 theme tối; không bổ sung app di động hay thiết kế P2.

**Đầu vào cần có:** Build TH-03; board hỗ trợ click/kéo của TC-08/09; panel chat/media.

**Cách làm gợi ý:**

1. Kiểm 360×800, 390×844, 1366×768, 1920×1080.
2. Sắp panel trên màn nhỏ theo DESIGN, giữ bàn/nút quan trọng thao tác được.
3. Kiểm tương tác cảm ứng với cả hai phe và hộp thoại/lỗi mở.

**Kiểm thử:** Playwright viewport và kiểm tay cảm ứng. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Bốn cỡ | Duyệt P1 đủ trạng thái | Không cuộn ngang hoặc che điều khiển |
| Ca 2 | Bàn | Chạm chọn/đích và kéo thả với Đen lật | Đúng giao điểm, thao tác được |
| Ca 3 | Vùng chạm | Đo nút/tab/input | Tối thiểu 44 px theo DESIGN; bàn theo ngoại lệ §7.5 |
| Ca 4 | Panel | Mở chat/media/hộp thoại ở 360 px | Bố cục không mất thao tác bàn cần thiết |

**PASS khi:** Mọi ca bốn viewport đạt; không sửa bằng giấu chức năng P1 hoặc khóa cuộn gây mất nội dung. Sai ca bắt buộc: FAIL; chưa kiểm/thiếu điều kiện: NOT_RUN/BLOCKED.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** Playwright mô phỏng cảm ứng không thay kiểm thiết bị thật; ghi thiết bị/trình duyệt thực.

### TH-05 — Giao diện: trợ năng (WCAG 2.1 AA, bàn phím, nhãn, tương phản)
**Epic:** EH · **Thành phần:** UI/UX · **Sprint đề xuất:** 4 (15/10–17/10) · **Bắt đầu khi (is blocked by):** `TH-03`
**Bắt đầu khi (kết quả cần có):** TH-03: build đầy đủ trạng thái UI P1.

**Mục tiêu:** Kiểm và sửa trợ năng của giao diện P1 thực tế. Người dùng bàn phím và giảm chuyển động vẫn nhận đủ thông tin.

**Yêu cầu / nguồn:** US-UI-05: AC-UI-05-01 — WCAG 2.1 AA/focus/nhãn/reduced-motion; AC-UI-05-02 — không chỉ dùng màu. Nguồn bổ sung: DESIGN §2, §7.5, §10; docs/05 NFR-A11Y.

**Kết quả (đầu ra):** Báo cáo tương phản thực, đường đi bàn phím, nhãn nút/icon/bàn và các sửa được kiểm lại.

**Phạm vi / ngoài phạm vi:** Trợ năng P1; không tự đổi theme/màu nguồn hay đưa công cụ mới ngoài stack.

**Đầu vào cần có:** DOM/CSS thực gồm hover/disabled/transparency; nội dung đếm lùi và bàn cờ.

**Cách làm gợi ý:**

1. Đo sRGB cặp chữ/nền và UI từng trạng thái.
2. Duyệt bằng bàn phím, kiểm focus/nhãn và tương tác bàn.
3. Bật reduced-motion, kiểm thông báo quan trọng không đọc đếm từng giây.

**Kiểm thử:** Playwright và kiểm tay bàn phím/trình đọc màn hình. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Tương phản | Đo màu tổng hợp trên nền thực | Chữ thường ≥4,5:1; chữ lớn/UI ≥3:1 theo DESIGN |
| Ca 2 | Bàn phím | Duyệt màn, modal và bàn cờ | Focus thấy rõ, không kẹt ở khung hòa |
| Ca 3 | Nhãn | Nút chỉ icon, trạng thái quân/giờ | Có nhãn và dấu ngoài màu |
| Ca 4 | Chuyển động | Bật reduced-motion và cảnh báo chiếu | Không nhấp nháy/rung; thông báo không đọc từng giây |

**PASS khi:** Mọi ca áp dụng đạt WCAG 2.1 AA theo ma trận; bảng token tính sẵn không thay bằng chứng giao diện thật. Sai ca bắt buộc: FAIL; chưa kiểm/thiếu điều kiện: NOT_RUN/BLOCKED.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** Chưa có thư viện audit được duyệt; không tự thêm. Nếu màu chốt không đạt ở ngữ cảnh thật, báo PO/thiết kế trước đổi.

### TH-06 — Giao diện: tính năng P2 hiển thị DISABLED kèm tooltip
**Epic:** EH · **Thành phần:** Frontend · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `TH-02`, `TA-07`, `TA-08`, `TF-04`, `TD-08`, `TG-04`
**Bắt đầu khi (kết quả cần có):** TH-02: shell Sảnh/điều hướng, vị trí ghép chuông, thẻ AI và banner quay lại; TA-07: UI đăng ký ba bước và các trạng thái lỗi/vô hiệu; TA-08: UI đăng nhập, hồ sơ cơ bản và đăng xuất đã nối hợp đồng; TF-04: UI tìm bạn/chuông/danh sách và mời trong phòng; TD-08: UI ván, đồng hồ, đề nghị và hộp kết quả P1; TG-04: UI chọn cấp/phe, ván AI, banner quay lại và lỗi/Thử lại.

**Mục tiêu:** Giữ lối vào P2 đúng cách thể hiện trong P1. Người dùng biết phần sắp có mà không gặp nút hoạt động dẫn tới màn chưa làm.

**Yêu cầu / nguồn:** US-UI-06: AC-UI-06-01 — điều hướng chính DISABLED, chức năng sâu ẩn; AC-UI-06-02 — theme cố định. Nguồn bổ sung: BA Phần 11, 10.3; DANH-MUC §7.

**Kết quả (đầu ra):** Danh sách kiểm điều hướng P2, cờ hiển thị P1 và ca kiểm không thao tác được tính năng sau.

**Phạm vi / ngoài phạm vi:** Chỉ cách hiển thị P2, không triển khai P2 hoặc đổi ưu tiên.

**Đầu vào cần có:** Danh sách lối chính và chức năng sâu từ DANH-MUC; màn đăng nhập/bạn bè/ván để kiểm hội tụ. Đầu vào mới bắt buộc: TA-07: UI đăng ký ba bước và các trạng thái lỗi/vô hiệu; TA-08: UI đăng nhập, hồ sơ cơ bản và đăng xuất đã nối hợp đồng; TF-04: UI tìm bạn/chuông/danh sách và mời trong phòng; TD-08: UI ván, đồng hồ, đề nghị và hộp kết quả P1; TG-04: UI chọn cấp/phe, ván AI, banner quay lại và lỗi/Thử lại.

**Cách làm gợi ý:**

1. Vô hiệu Đánh Hạng/Lịch sử/Bảng xếp hạng/Khách/Google/Nhắn tin/Thách đấu với Sắp ra mắt.
2. Ẩn QR/sticker/undo/đổi bên/tái đấu/Replay/widget/bộ chọn theme.
3. Kiểm kết quả chỉ Rời phòng và theme không tự theo hệ điều hành.
4. Kiểm trên các màn TA-07/08, TF-04, TD-08, TG-04 đã có; giữ Sảnh/Bạn bè/mời Online hoạt động và chỉ vô hiệu/ẩn phần P2 đúng nguồn.

**Kiểm thử:** Playwright điều hướng và kiểm DOM. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Lối chính | Click/bàn phím mọi mục P2 | Không mở chức năng; tooltip Sắp ra mắt |
| Ca 2 | Chức năng sâu | Mở các màn P1 | Không nút hoặc khay P2 |
| Ca 3 | Kết quả | Kết thúc ván | Chỉ Rời phòng, không Xem lại |
| Ca 4 | Theme | Đổi sáng/tối hệ điều hành | P1 vẫn Kỳ Đài Cổ Phong |
| Ca 5 | Hội tụ các màn | Duyệt đăng ký/đăng nhập/hồ sơ/bạn bè/kết quả/AI bằng bàn phím | Không lối P2 hoạt động, theme tối giữ nguyên, không ẩn nhầm P1 |

**PASS khi:** Mọi ca đạt, không lối P2 hoạt động và không vô tình ẩn Bạn bè/mời Online P1. Sai ca bắt buộc: FAIL; chưa kiểm/thiếu điều kiện: NOT_RUN/BLOCKED.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** Đã có các UI chính làm tiền đề. Khay sticker của TE-02 và QR/modal phòng còn kiểm ở task miền; xác nhận hội tụ toàn bộ tại TQ-04, không tuyên bố bao phủ màn chưa có ở thời điểm task này.
