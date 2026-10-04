# Kế hoạch mới (bản nháp) — 06: Task của Epic EC — Bàn cờ và luật cờ

**Ngày:** 2026-10-04 · **Trạng thái:** ĐỀ XUẤT, chờ PO và nhóm duyệt · Chưa tạo gì trên Jira. Khung, phụ thuộc và Sprint: `01-components-epic-khung-task.md`; Description Epic: `02-epic.md`.

Epic gồm **10 task**. Mỗi task: dòng đầu (Epic, thành phần, Sprint, **is blocked by**) lấy từ khung; **Bắt đầu khi (kết quả cần có)** nêu hiện vật cụ thể của từng tiền đề. Chưa có ước lượng giờ và người nhận việc (nhóm điền khi Sprint Planning).

### TC-01 — Luật cờ: mô hình bàn cờ, toạ độ, quân, thế khởi đầu
**Epic:** EC · **Thành phần:** Game Engine · **Sprint đề xuất:** 1 (04/10–07/10) · **Bắt đầu khi (is blocked by):** `T0-01`
**Bắt đầu khi (kết quả cần có):** T0-01: workspace có gói TypeScript và Vitest chạy được

**Mục tiêu:** Tạo mô hình thế cờ thuần TypeScript làm nền duy nhất cho client, server và máy cờ. EC bàn giao dữ liệu đúng tọa độ, không gắn hướng hiển thị vào trạng thái nghiệp vụ.

**Yêu cầu / nguồn:** AGENTS §4.3; docs/02 §1–2; US-BOARD-01: AC-BOARD-01-01 bàn/thế đầu, AC-BOARD-01-02 lật chỉ hiển thị. Đỏ đi trước, x=0..8, y=0..9, chỉ số y*9+x.

**Kết quả (đầu ra):**
- Kiểu quân/phe/thế, hàm tạo thế đầu đúng FEN nguồn.
- Fixture chuẩn và phép đọc/copy trạng thái không phụ thuộc DOM hoặc NestJS.

**Phạm vi / ngoài phạm vi:** Không sinh nước, luật kết thúc, UI hoặc xuất FEN/PGN P2; có thể dùng FEN làm dữ liệu kiểm nội bộ.

**Đầu vào cần có:** Bảng vị trí quân docs/02 §1.2, cung/sông/hướng tiến và bảy cặp quân chuẩn.

**Cách làm gợi ý:**
1. Mô hình hóa tọa độ và phe tách hướng nhìn.
2. Khởi tạo từ danh sách vị trí trong nguồn.
3. Kiểm fixture, biên tọa độ và tính độc lập các bản thế.

**Kiểm thử:** Vitest đơn vị.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-BOARD-01-01 | AC-BOARD-01-01 | Đối chiếu mọi vị trí thế đầu với FEN | Đúng quân, ô, phe và lượt Đỏ. |
| Biên tọa độ | docs/02 §1 | Thử ngoài x=0..8/y=0..9 | Không đọc/ghi ngoài bàn hoặc tạo quân sai. |
| TC-BOARD-01-02 | AC-BOARD-01-02 | Đổi hướng nhìn bàn rồi đọc mô hình | Tọa độ gốc không đổi. |
| Độc lập thế | Mô hình luật | Sửa một bản sao thế thử | Không làm biến đổi fixture/bản thế khác. |

**PASS khi:** Mọi ca mô hình đạt, dữ liệu thế đầu khớp nguồn. FAIL nếu đổi hướng nhìn làm đổi tọa độ gửi hoặc gói lệ thuộc môi trường.

**Bằng chứng nộp:** Build/commit, môi trường, fixture thế đầu, kết quả đơn vị và kiểm import đa môi trường; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** Tên hàm/type cụ thể do nhóm định nghĩa, chưa có trong repo; khung dẫn §2 là luật quân, không tự mở rộng chức năng.

### TC-02 — Luật cờ: sinh nước đi cho từng loại quân
**Epic:** EC · **Thành phần:** Game Engine · **Sprint đề xuất:** 1 (04/10–07/10) · **Bắt đầu khi (is blocked by):** `TC-01`
**Bắt đầu khi (kết quả cần có):** TC-01: mô hình quân/toạ độ/thế và fixture khởi đầu chuẩn

**Mục tiêu:** Sinh tập nước đi thô đúng cách di chuyển của từng loại quân. Đây là đầu vào TC-03 lọc an toàn Tướng, chưa phải quyền gửi nước của người dùng.

**Yêu cầu / nguồn:** docs/02 §2 và §2.1: quy tắc bảy quân, chặn chân/ngòi/cung/sông. US-PLAY-01, AC-PLAY-01-02 từ chối nước sai là mục tiêu phục vụ; task này chỉ sinh nước thô, chưa nghiệm thu handler mạng.

**Kết quả (đầu ra):** - Bộ sinh nước thô cho Tướng/Sĩ/Tượng/Mã/Xe/Pháo/Tốt.
- Fixture chặn đường, ngòi, cung/sông và ăn quân cho cả hai phe.

**Phạm vi / ngoài phạm vi:** Chưa lọc tự chiếu/kết thúc/lượt mạng; không phong cấp hoặc thêm luật ngoài bộ rút gọn.

**Đầu vào cần có:** TC-01: mô hình quân/toạ độ/thế đầu; docs/02 §2: cung/sông/hướng tiến và ô cùng phe/đối phương.

**Cách làm gợi ý:** 1. Triển khai riêng luật hình học từng quân.
2. Áp chặn đường/chân/ngòi và kiểm ô đích cùng phe.
3. Tạo fixture đối xứng hai phe, kiểm không sửa thế đầu vào.

**Kiểm thử:** Vitest đơn vị theo tham số. Trạng thái kế hoạch: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Mã/Tượng | docs/02 §2 | Đặt quân chặn chân; cho Tượng thử qua sông | Không sinh nước bị chặn/vượt sông. |
| Pháo | docs/02 §2 | Thử không ngòi, đúng một ngòi, nhiều ngòi | Chỉ ăn qua đúng một ngòi; đi thường không nhảy. |
| Tướng/Sĩ | Cung | Thử cạnh cung và nước sai hướng | Không sinh nước ra cung. |
| Tốt/Xe | Hướng/đường | Tốt hai bên trước/sau sông; Xe bị chắn | Tốt không lùi, qua sông đi ngang; Xe không nhảy quân. |

**PASS khi:** Tất cả fixture quân đạt, không ra bàn/ăn quân mình. FAIL nếu gọi tập thô là tập hợp lệ an toàn Tướng hoặc thiếu kiểm phe Đen.

**Bằng chứng nộp:** Build/commit, môi trường, fixture và log Vitest theo từng quân, báo cáo không mutate; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** Quyền người chơi và chiếu không thuộc hàm này; người dùng TC-03 phải lọc thêm, không cho client lấy tập thô để tự chấp nhận nước.

---

### TC-03 — Luật cờ: nước hợp lệ, chiếu, chiếu hết, hết nước, tướng đối mặt
**Epic:** EC · **Thành phần:** Game Engine · **Sprint đề xuất:** 1 (04/10–07/10) · **Bắt đầu khi (is blocked by):** `TC-02`
**Bắt đầu khi (kết quả cần có):** TC-02: bộ sinh nước thô bảy loại quân đúng chặn đường và ô đích

**Mục tiêu:** Lọc nước thô thành nước hợp lệ và phân định chiếu, chiếu hết, hết nước. Server và AI dùng cùng oracle luật thay vì tự triển khai khác nhau.

**Yêu cầu / nguồn:** docs/02 §2.1, §3.1–3.3; AC-PLAY-01-02 nước sai không đổi thế; AC-PLAY-03-01 chiếu hết và hết nước đều thua; BA 3.3.

**Kết quả (đầu ra):**
- Hàm liệt kê/kiểm nước hợp lệ, phát hiện chiếu và hết nước.
- Bộ thế tự chiếu, lộ mặt Tướng và thoát chiếu cho hai phe.

**Phạm vi / ngoài phạm vi:** Luật thuần; không đồng hồ, xác thực mạng hoặc lặp thế. Không áp stalemate hòa của cờ vua.

**Đầu vào cần có:** Mô hình TC-01 qua TC-02, định nghĩa tấn công có chân/ngòi; thế cờ ghi nguồn.

**Cách làm gợi ý:**
1. Thử nước trên bản thế không làm bẩn đầu vào.
2. Kiểm Tướng mình bị tấn công hoặc hai Tướng đối mặt.
3. Phân loại bên sắp đi còn nước/đang chiếu; viết bộ ca thoát chiếu.

**Kiểm thử:** Vitest đơn vị.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-PLAY-01-02 | AC-PLAY-01-02 | Di chuyển quân đang che hai Tướng | Nước bị loại, thế gốc giữ nguyên. |
| Tự chiếu | docs/02 §3.1 | Thử nước để Tướng mình bị ăn | Không nằm trong tập hợp lệ. |
| TC-PLAY-03-01 | AC-PLAY-03-01 | Thế bị chiếu không nước và không chiếu không nước | Lần lượt CHECKMATE/STALEMATE, đều thua. |
| Thoát chiếu | docs/02 §3.2 | Chắn đường hoặc đi Tướng hợp lệ; kiểm Mã/Pháo bị chặn | Nhận nước thoát thực, không báo chiếu giả. |

**PASS khi:** Mọi ca đạt, không biến đổi thế khi từ chối. FAIL nếu bỏ lộ mặt Tướng hoặc stalemate hòa; perft độc lập sẽ xác minh riêng.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, expected có giải thích, kết quả Vitest; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** Cách biểu diễn trạng thái vô hiệu chưa chốt thì nhóm định nghĩa contract; không tự biến thế hỏng thành ván hợp lệ.

### TC-04 — Luật cờ: lặp thế, chiếu liên tục, 120 nửa nước không ăn
**Epic:** EC · **Thành phần:** Game Engine · **Sprint đề xuất:** 1 (04/10–07/10) · **Bắt đầu khi (is blocked by):** `TC-03`
**Bắt đầu khi (kết quả cần có):** TC-03: tập nước hợp lệ và kết quả CHECKMATE/STALEMATE

**Mục tiêu:** Bổ sung kết quả lặp thế và không ăn quân cho luật dùng chung. EC cung cấp bộ phân xử sau nước đi để online và AI thống nhất lý do kết thúc.

**Yêu cầu / nguồn:** US-PLAY-08: AC-PLAY-08-01 lặp lần ba/chiếu liên tục/120 nửa nước; AC-PLAY-08-02 chiếu hết ưu tiên hòa. Nguồn luật docs/02 §3.4 và §4–5.

**Kết quả (đầu ra):** - Khóa thế gồm vị trí và bên đi, lịch sử chiếu trên nhánh đang hiệu lực.
- Bộ đếm không ăn quân và hàm trả lý do theo thứ tự nguồn.

**Phạm vi / ngoài phạm vi:** P1 không Undo, không luật đuổi quân riêng hoặc hòa thiếu quân; không xét đồng hồ trong hàm luật sau nước.

**Đầu vào cần có:** TC-03: nước hợp lệ và CHECKMATE/STALEMATE; lịch sử thế, chiếu từng bên và bộ đếm không ăn do task xây fixture.

**Cách làm gợi ý:** 1. Tạo khóa thế không chứa bộ đếm nhưng có bên sắp đi.
2. Khi lặp lần ba xét mọi nước mỗi bên từ lần đầu đến lần ba.
3. Áp CHECKMATE/STALEMATE trước PERPETUAL_CHECK, lặp hòa, rồi 120 nửa nước.

**Kiểm thử:** Vitest đơn vị. Trạng thái kế hoạch: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-PLAY-08-01 | Lặp/chiếu liên tục | Chạy chu kỳ một bên chiếu, hai bên chiếu, không bên nào | Một bên chiếu liên tục thua; hai bên/không bên hòa. |
| TC-PLAY-08-01 | Biên 120 | Kiểm 119,120 và nước ăn đặt lại bộ đếm | 119 chưa hòa,120 hòa nếu không kết quả ưu tiên; ăn về 0. |
| TC-PLAY-08-02 | AC-PLAY-08-02 | Nước chiếu hết đồng thời chạm điều kiện hòa | CHECKMATE, không DRAW. |
| Khóa thế | docs/02 §4 | Cùng vị trí nhưng khác bên sắp đi | Không gộp là cùng thế. |

**PASS khi:** Mọi nhánh ưu tiên và biên đạt. FAIL nếu chỉ so vị trí, xử đuổi quân thành luật mới hoặc báo hòa trước chiếu hết.

**Bằng chứng nộp:** Build/commit, môi trường, chuỗi nước/khóa thế và log assertion từng lý do; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** Tính trên nhánh hiệu lực; không triển khai Undo P2 để phục vụ test. Kết quả luật chưa là bằng chứng luồng kết thúc online/AI thật.

---

### TC-05 — Luật cờ: ký hiệu nước đi tiếng Việt
**Epic:** EC · **Thành phần:** Game Engine · **Sprint đề xuất:** 2 (08/10–10/10) · **Bắt đầu khi (is blocked by):** `TC-03`
**Bắt đầu khi (kết quả cần có):** TC-03: danh sách nước hợp lệ có quân, điểm đi/đến và thế trước nước

**Mục tiêu:** Sinh ký hiệu tiếng Việt cho nước hợp lệ, phục vụ bảng nước đi của ván online. Ký hiệu dựa phe người đi, không dựa bàn đang lật ở UI.

**Yêu cầu / nguồn:** US-PLAY-10: AC-PLAY-10-01 bảng nước tiếng Việt; docs/02 §7.1–7.3 quy định cột/tiến/lùi/bình và Trước/Sau. Task kiểm hàm ký hiệu, không nghiệm thu UI bảng nước.

**Kết quả (đầu ra):** - Hàm ký hiệu với kết quả duy nhất trong cùng thế.
- Fixture cả hai phe và ánh xạ ngược ký hiệu tới nước để kiểm tính duy nhất.

**Phạm vi / ngoài phạm vi:** Không UI bảng nước thuộc TD-07, không Replay/FEN/PGN xuất cho người dùng P2.

**Đầu vào cần có:** TC-03: nước hợp lệ và thế trước nước; quy tắc cột Đỏ 9−x, Đen x+1 và phân biệt quân cùng cột trong docs/02 §7.

**Cách làm gợi ý:** 1. Tạo ký hiệu cơ bản từ thế trước nước.
2. Thêm Trước/Giữa/Sau/Thứ n và số cột khi trùng theo nguồn.
3. Kiểm từng nước của một thế có chuỗi duy nhất, giải ngược đúng nước.

**Kiểm thử:** Vitest đơn vị/thuộc tính. Trạng thái kế hoạch: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-PLAY-10-01 | AC-PLAY-10-01 | Dùng ví dụ Pháo 2 bình 5 và Mã 8 tiến 7 | Khớp ký hiệu và hướng phe. |
| Quân cùng cột | docs/02 §7.3 | Thử hai Xe/Pháo/Mã, ba và bốn/năm Tốt | Đúng Trước/Sau/Giữa/Thứ n, không nhập nhằng. |
| Hai cột trùng | Tính duy nhất | Tạo các nước ban đầu cùng ký hiệu | Bổ sung cột để mỗi chuỗi giải được đúng nước. |
| Phe Đen | docs/02 §7.1 | Lật cách hiển thị rồi ký hiệu cùng nước | Ký hiệu theo người đi, không theo UI. |

**PASS khi:** Mọi fixture đạt và không có ký hiệu trùng trong mỗi tập nước hợp lệ. FAIL nếu Mã/Tượng/Sĩ dùng bình hoặc nhầm cột Đen.

**Bằng chứng nộp:** Build/commit, môi trường, bộ thế và bảng nước↔ký hiệu, log kiểm duy nhất; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** Tên hàm chỉ là thiết kế nội bộ; thuật toán giải ngược dùng kiểm, không thành tính năng nhập biên bản P2.

---

### TC-06 — Bộ kiểm thử luật cờ: bộ thế, ca biên, perft ghép vào Vitest
**Epic:** EC · **Thành phần:** Game Engine, QA · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `TC-04`, `T0-09`, `TC-05`, `T0-02`
**Bắt đầu khi (kết quả cần có):** TC-04: bộ luật P1 đầy đủ kết quả và fixture; T0-09: oracle độc lập đã xác minh cùng báo cáo perft hoặc blocker rõ; TC-05: hàm ký hiệu tiếng Việt và fixture phân biệt quân/cột đã kiểm; T0-02: workflow CI gọi script Vitest, lưu log/artifact và bắt test lỗi

**Mục tiêu:** Đóng gói bộ kiểm luật EC vào Vitest để mỗi thay đổi đều phát hiện lệch oracle. Bằng chứng kiểm luật phải tách khỏi tuyên bố máy cờ mạnh hoặc mạng hoạt động.

**Yêu cầu / nguồn:** docs/05 §3.1; GATE-PERFT; AC-PLAY-03-01 hết nước thua, AC-PLAY-08-01 lặp/120, AC-PLAY-08-02 ưu tiên chiếu hết; docs/08 nhóm BOARD/PLAY. AC-PLAY-10-01: ký hiệu tiếng Việt theo docs/02 §7; CI theo docs/05 §7.

**Kết quả (đầu ra):**
- Fixture có nguồn và bộ test quân, hợp lệ, kết thúc/lặp/không ăn.
- Bài perft đã đối chiếu oracle và cấu hình chạy trong CI; seed test ngẫu nhiên.

**Phạm vi / ngoài phạm vi:** Chỉ luật P1; kiểm ký hiệu cần TC-05 nếu đưa vào bộ, không lôi Undo/P2 hay đo sức mạnh AI vào task.

**Đầu vào cần có:** TC-04: luật kết thúc; T0-09: oracle perft độc lập; TC-05: ký hiệu và fixture hai phe; T0-02: CI/script thực. Dùng cùng dữ liệu đầu vào đã gắn nguồn.

**Cách làm gợi ý:**
1. Gom fixture luật và ký hiệu TC-05, giải thích expected.
2. Nối oracle T0-09 vào perft regression và kiểm tính duy nhất ký hiệu.
3. Chạy 1 000 ván ngẫu nhiên seed cố định theo docs/05 §3.1.
4. Đưa toàn bộ test vào workflow T0-02 theo docs/05 §7, thử lỗi chủ động để chứng minh CI bắt lỗi.

**Kiểm thử:** Vitest tự động và CI. Trạng thái kế hoạch: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Perft | GATE-PERFT | Chạy độ sâu 1–4 từ thế đầu | Khớp oracle đã xác minh, không sửa expected vì code sai. |
| TC-PLAY-03-01 | Kết thúc | Chạy CHECKMATE và STALEMATE | Cả hai thua. |
| TC-PLAY-08-01 | Biên/chu kỳ | Chạy lặp và mốc 119/120, ăn quân | Kết quả khớp nguồn. |
| Ngẫu nhiên | docs/05 §3.1 | Chạy 1 000 ván seed cố định có kiểm thứ cấp | Không nước vi phạm luật; số thực được lưu. |
| Ký hiệu/CI | AC-PLAY-10-01; docs/05 §7 | Chạy fixture ký hiệu cả hai phe trong CI; chủ động làm sai assertion | Ký hiệu khớp TC-05; assertion sai làm CI đỏ. |

**PASS khi:** Mọi test P1 của bộ và oracle đạt, CI thực thi chúng. FAIL nếu oracle chưa xác minh mà báo PASS; chưa chạy ghi NOT_RUN.

**Bằng chứng nộp:** Revision/build và môi trường; seed/fixture/version oracle, report Vitest và URL/log CI. Không chứa bí mật.

**Rủi ro / chưa rõ:** Đã có TC-05/T0-02 trong tiền đề; không chạy task trước các artifact này. Thiếu oracle xác minh thì BLOCKED, không sửa expected cho khớp triển khai.

---

### TC-07 — Bàn cờ SVG: vẽ lưới, quân chữ Hán, lật bàn cho phe Đen
**Epic:** EC · **Thành phần:** Frontend · **Sprint đề xuất:** 1 (04/10–07/10) · **Bắt đầu khi (is blocked by):** `T0-10`, `TC-01`, `TH-01`
**Bắt đầu khi (kết quả cần có):** T0-10: web chạy/import shared được; TC-01: mô hình thế đầu/toạ độ gốc và quân chuẩn; TH-01: token Kỳ Đài Cổ Phong và thành phần nền có năm trạng thái/tooltip dùng được trong web

**Mục tiêu:** Hiển thị bàn SVG và quân chữ Hán theo dữ liệu luật, đúng cho cả người cầm Đỏ và Đen. Thành phần nhận thế, không tự quyết nước đi hay kết quả ván.

**Yêu cầu / nguồn:** US-BOARD-01: AC-BOARD-01-01 bàn 9×10/thế đầu, AC-BOARD-01-02 lật hiển thị, AC-BOARD-01-03 nhãn theo tọa độ gốc; DESIGN §7; AC-UI-03-01 năm trạng thái.

**Kết quả (đầu ra):**
- Bàn SVG co giãn, quân đúng cặp chữ Hán và lớp ánh xạ hiển thị.
- Nhãn trợ năng, fixture thế đầu/chưa có nước/đang tải/lỗi/chỉ đọc.

**Phạm vi / ngoài phạm vi:** Không click/kéo thả/network; không chữ Latin/Việt trên mặt quân, không theme P2.

**Đầu vào cần có:** T0-10: app/import chạy được; TC-01: thế đầu/tọa độ gốc; TH-01: token và thành phần nền. Font Hán tự host theo DESIGN, kiểm quyền dùng.

**Cách làm gợi ý:**
1. Dùng token TH-01 vẽ SVG theo mô hình TC-01 trong app T0-10.
2. Lật bàn cho Đen nhưng giữ chữ thẳng và nhãn theo tọa độ gốc.
3. Áp thành phần/trạng thái TH-01; kiểm co giãn và phân phe không chỉ màu.

**Kiểm thử:** Playwright và kiểm tay trợ năng. Trạng thái kế hoạch: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-BOARD-01-01 | AC-BOARD-01-01 | Mở thế đầu, đối chiếu quân/giao điểm | Đúng quân chữ Hán và vị trí, không đặt giữa ô. |
| TC-BOARD-01-02 | AC-BOARD-01-02 | Chuyển Đỏ/Đen | Bàn lật nhưng dữ liệu gốc giữ nguyên. |
| TC-BOARD-01-03 | AC-BOARD-01-03 | Đọc nhãn quân khi lật | Tên quân/phe/cột/hàng gốc đúng. |
| TC-UI-03-01 | AC-UI-03-01 | Kích hoạt năm trạng thái | Không trắng giả khi chưa có nước; lỗi và vô hiệu có lý do. |

**PASS khi:** Mọi ca đạt trên kích thước nghiệm thu 360/390/1366/1920 px, không méo/cuộn ngang. FAIL nếu đổi tọa độ nghiệp vụ hoặc chỉ phân phe bằng màu.

**Bằng chứng nộp:** Revision/build và môi trường; ảnh hai hướng/năm trạng thái, kiểm font/nhãn và report Playwright. Không chứa bí mật.

**Rủi ro / chưa rõ:** TH-01 là đầu vào bắt buộc, không dựng bộ token song song. Không tuyên bố bàn có tương tác/mạng vì task chỉ render.

---

### TC-08 — Bàn cờ: click chọn quân và chấm gợi ý ô đi
**Epic:** EC · **Thành phần:** Frontend · **Sprint đề xuất:** 2 (08/10–10/10) · **Bắt đầu khi (is blocked by):** `TC-07`, `TC-03`
**Bắt đầu khi (kết quả cần có):** TC-07: bàn SVG và ánh xạ hướng nhìn/toạ độ; TC-03: hàm liệt kê nước hợp lệ không tự chiếu

**Mục tiêu:** Cho người có quyền chọn quân và thấy ô đi hợp lệ bằng click/chạm. Thành phần phát ý định cho tầng mạng, không coi animation là xác nhận server.

**Yêu cầu / nguồn:** US-BOARD-02: AC-BOARD-02-01 vòng chọn/chấm/vòng ăn, AC-BOARD-02-02 click đích và hủy chọn, AC-BOARD-02-03 đúng quân/lượt, chỉ đọc khi xem/kết thúc; DESIGN §7.4–7.5.

**Kết quả (đầu ra):**
- Bộ chọn quân/đích dùng bộ luật hợp lệ, phát ý định tọa độ gốc.
- Trạng thái chọn/hủy/vô hiệu và interface nhận snapshot/quyền lượt.

**Phạm vi / ngoài phạm vi:** Không handler mạng; không gợi ý nước hay hoặc nước AI. Bàn phím theo DESIGN, chưa rõ hướng mũi tên khi lật phải hỏi.

**Đầu vào cần có:** Thế/lượt/phe/quyền chỉ đọc từ phía tiêu thụ; fixture quân bị ghim và người xem.

**Cách làm gợi ý:**
1. Liên kết click quân của mình với tập nước hợp lệ.
2. Thêm chọn đích, click lại/ô sai/Esc hủy và nhãn trạng thái.
3. Phát cùng kiểu ý định cho chuột/chạm/bàn phím, xóa chọn khi snapshot đổi.

**Kiểm thử:** Vitest trạng thái và Playwright tương tác.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-BOARD-02-01 | AC-BOARD-02-01 | Chọn quân bị chặn hoặc bị ghim | Chỉ hiện ô hợp lệ, vòng ăn cố định. |
| TC-BOARD-02-02 | AC-BOARD-02-02 | Click đích, sau đó thử click lại/Esc/ô sai | Gửi đúng ý định hoặc hủy, không nước ngoài tập. |
| TC-BOARD-02-03 | AC-BOARD-02-03 | Thử quân đối phương/ngoài lượt/người xem/kết thúc | Không chọn/gửi; chỉ đọc có lý do. |
| Lật/snapshot | AC-BOARD-01-02 | Chọn khi cầm Đen, nhận snapshot mới | Tọa độ gốc đúng; không giữ chọn cũ sai quyền. |

**PASS khi:** Mọi ca và nhánh quyền đạt; FAIL nếu phát nước chỉ vì client thấy hợp lệ rồi tự xác nhận.

**Bằng chứng nộp:** Build/commit, môi trường, report tương tác hai phe, fixture và payload ý định không chứa secret; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** Xác thực cuối tại server ở ED; test component không thay TC-PLAY-01-01 trên mạng thật.

### TC-09 — Bàn cờ: kéo thả và trượt về chỗ cũ khi sai
**Epic:** EC · **Thành phần:** Frontend · **Sprint đề xuất:** 2 (08/10–10/10) · **Bắt đầu khi (is blocked by):** `TC-08`
**Bắt đầu khi (kết quả cần có):** TC-08: chọn quân/tập đích/quyền lượt và interface ý định chung

**Mục tiêu:** Thêm kéo thả song song click/chạm mà giữ nguyên ý nghĩa một nước đi. Kéo sai phải trả quân về trạng thái thật, không sửa thế nghiệp vụ.

**Yêu cầu / nguồn:** US-BOARD-03: AC-BOARD-03-01 kéo và snap-back khi sai, AC-BOARD-03-02 tương đương click/cảm ứng; AC-BOARD-02-03 quyền chọn; DESIGN §4.5 giảm chuyển động.

**Kết quả (đầu ra):**
- Xử lý kéo bằng chuột/cảm ứng dùng chung ý định với click.
- Snap-back và hủy kéo khi quyền/thế đổi; không chặn tương tác bởi hiệu ứng cũ.

**Phạm vi / ngoài phạm vi:** Không bỏ click để chỉ kéo; không network handler, không biến tọa độ màn hình thành tọa độ server trực tiếp.

**Đầu vào cần có:** Ánh xạ bàn SVG co giãn/lật, trạng thái snapshot và tùy chọn giảm chuyển động từ trình duyệt.

**Cách làm gợi ý:**
1. Dùng cùng kiểm quyền và đích với click.
2. Ánh xạ điểm thả qua hướng nhìn và kích thước bàn.
3. Xử lý thả sai/mất con trỏ/snapshot mới, tắt animation khi reduce motion.

**Kiểm thử:** Vitest ánh xạ và Playwright/cảm ứng thật.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-BOARD-03-01 | AC-BOARD-03-01 | Kéo quân vào đích hợp lệ rồi vào ô sai/ngoài bàn | Hợp lệ phát ý định; sai về chỗ cũ, không tác động. |
| TC-BOARD-03-02 | AC-BOARD-03-02 | Đi cùng nước bằng click và kéo trên hai hướng | Cùng tọa độ gốc và kết quả. |
| TC-BOARD-02-03 | AC-BOARD-02-03 | Bắt đầu kéo rồi mất lượt/quyền | Hủy kéo, không gửi nước trái quyền. |
| Giảm chuyển động | DESIGN §4.5 | Bật reduce motion rồi thả sai | Quân về vị trí ngay, không hiệu ứng lặp. |

**PASS khi:** Các ca đạt bằng chuột/cảm ứng tại kích thước nguồn. FAIL nếu kéo vượt quyền, phát trùng với click hoặc tự đổi thế khi thả sai.

**Bằng chứng nộp:** Build/commit, môi trường, video ngắn hai cách tương tác, payload so sánh và report test; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** Thiết bị mô phỏng không thay mọi kiểm cảm ứng thực; không bịa ngưỡng cảm ứng mới nếu trình duyệt khác biệt.

### TC-10 — Bàn cờ: đánh dấu nước cuối, cảnh báo chiếu, âm thanh và nút tắt tiếng
**Epic:** EC · **Thành phần:** Frontend · **Sprint đề xuất:** 2 (08/10–10/10) · **Bắt đầu khi (is blocked by):** `TC-08`
**Bắt đầu khi (kết quả cần có):** TC-08: bàn có state chọn/ý định và nhận dữ liệu thế/lượt

**Mục tiêu:** Thể hiện nước cuối, cảnh báo chiếu và âm thanh đúng sự kiện đã xác nhận. Dấu hiệu giúp đọc ván nhưng không quyết định kết quả hoặc che điều khiển.

**Yêu cầu / nguồn:** US-BOARD-04: AC-BOARD-04-01 bốn góc ở hai ô, AC-BOARD-04-02 chiếu không nhấp nháy/rung, AC-BOARD-04-03 không chỉ màu; US-BOARD-05: AC-BOARD-05-01 bốn âm Web Audio, AC-BOARD-05-02 mute nhớ trong phiên.

**Kết quả (đầu ra):**
- Lớp dấu nước/chiếu theo snapshot và bộ phát âm Web Audio.
- Nút mute có nhãn, nhớ trạng thái phiên; xử lý trình duyệt chưa cho phát âm.

**Phạm vi / ngoài phạm vi:** Không MP3/tài sản âm tải ngoài, không widget AI/P2, không cảnh báo bằng âm thanh đơn độc.

**Đầu vào cần có:** Nước cuối, cờ chiếu, sự kiện ăn/kết thúc đã xác nhận; DESIGN §7.4 và §4.5.

**Cách làm gợi ý:**
1. Render các dấu theo state có thẩm quyền.
2. Tạo bốn âm bằng Web Audio, điều khiển mute và kích hoạt âm theo quyền trình duyệt.
3. Chống phát âm lặp vì snapshot lặp; kiểm reduce motion và trợ năng.

**Kiểm thử:** Vitest bộ điều phối; Playwright và nghe thủ công.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-BOARD-04-01 | AC-BOARD-04-01 | Nhận nước cuối mới rồi snapshot lặp | Đánh đúng cả ô đi/đến, không xếp hiệu ứng cũ. |
| TC-BOARD-04-02 | AC-BOARD-04-02 | Vào/ra chiếu, bật giảm chuyển động | Vòng/chữ/biểu tượng rõ, không rung/nhấp nháy. |
| TC-BOARD-05-01 | AC-BOARD-05-01 | Phát sự kiện đi/ăn/chiếu/kết thúc | Đúng bốn âm Web Audio, không request MP3. |
| TC-BOARD-05-02 | AC-BOARD-05-02 | Mute rồi đổi trạng thái trong phiên; khóa autoplay | Mute giữ nguyên; không có lỗi ván khi không phát được. |

**PASS khi:** Mọi ca đạt, dấu không chỉ màu và mute có hiệu lực. FAIL nếu âm phát từ ý định chưa xác nhận hoặc cảnh báo lặp vô hạn.

**Bằng chứng nộp:** Build/commit, môi trường, ảnh dấu, log test/sự kiện, kiểm nghe và network tài nguyên; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** Nối sự kiện server thật ở TD-08/TD-09; bộ mẫu không chứng minh thời gian truyền mạng.
