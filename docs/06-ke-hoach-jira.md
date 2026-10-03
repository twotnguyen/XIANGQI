# 06 · Kế hoạch phân vai và cấu trúc Jira (Giai đoạn 3)

**Giai đoạn 3 · Trạng thái: Đề xuất (chờ Product Owner duyệt)** · Căn cứ: [01](01-yeu-cau-chi-tiet.md) (US/AC), [02](02-luat-co-tuong.md), [03](03-du-lieu.md), [04](04-kien-truc.md), [05](05-kiem-thu.md), [BA-SCOPE-DECISIONS.md](../BA-SCOPE-DECISIONS.md) Phần 11. **Chưa tạo gì trên Jira thật**: cần Product Owner cung cấp site/dự án/khoá (AGENTS §1, §5: không đoán số Key). Tệp này là bản kế hoạch dùng để tạo Jira. Bảng ở mục 6 và 8 được **sinh bằng chương trình** từ dữ liệu việc nên các tổng khớp nhau.

## 1. Kết luận quan trọng cho Product Owner

**Phạm vi P1 (8 mục tiêu cốt lõi, 53 US) ước lượng khoảng 127,5 ngày công trong 73 việc.** Với 7 người, mỗi người chỉ có khoảng **4 ngày công hiệu dụng mỗi tuần** (5 ngày × hệ số 0,8), nên 2 tuần chỉ có khoảng **56 ngày công** (khoảng 78 nếu làm cả cuối tuần). **Ba cách tính đều cho thấy 2 tuần không đủ:**

| Phạm vi (đợt) | Ngày công | Cận dưới theo tổng (chia đều 7 người) | Cận dưới theo vai trò (người tải nặng nhất) | Mô phỏng xếp lịch theo phụ thuộc và vai trò |
|---|---:|---:|---:|---:|
| Đợt 1: lõi tối thiểu | 89,5 | 3,2 tuần | 4 tuần | 5,2 tuần |
| Đợt 1+2: đủ chức năng của 8 mục tiêu | 118 | 4,2 tuần | 4,6 tuần | 6,8 tuần |
| Đợt 1+2+3: đủ P1 và hoàn thiện | 127,5 | 4,6 tuần | 4,9 tuần | 7,3 tuần |

*Cận dưới theo tổng* chia tổng cho công suất cả nhóm (28 ngày công/tuần). *Cận dưới theo vai trò* lấy người có nhiều việc nhất chia cho 4 ngày công/tuần (vai trò cố định nên không chia sẻ được). *Mô phỏng* xếp lịch từng việc theo thứ tự phụ thuộc ở mục 6, mỗi vai trò làm tuần tự, việc giao diện và kiểm thử được phép bắt đầu khi bên phụ trợ làm xong một nửa; đây là **ước tính tham lam, không phải bằng chứng** và có thể rút ngắn bằng cách chia việc cho người đang rảnh. Ước lượng thô (±30%). **Kết luận an toàn: P1 cần khoảng 5 đến 7 tuần, không phải 2 tuần.**

**Đợt (T1/T2/T3) chỉ là thứ tự triển khai, không phải mức ưu tiên cắt được.** Không đợt nào một mình đủ 8 mục tiêu: **P1 chỉ xong khi hoàn tất cả ba đợt**. Bỏ một đợt hoặc một phần là **cắt phạm vi P1** và cần Product Owner đồng ý (AGENTS §8). Phân bổ kịch bản demo ([05](05-kiem-thu.md) §1): Đợt 1 phủ D1, D2, D4, D5, D6, D8 (cấp Dễ/Trung bình), D9; Đợt 2 thêm D3 (mời bạn bè), D7 (camera/mic), D10, cấp Khó, đổi chỗ ghế, đuổi người xem, xin hoà, nhiều tab, hồ sơ; Đợt 3 là hoàn thiện (responsive, trợ năng, tải, đo máy cờ).

**Các lựa chọn cần Product Owner quyết (khuyến nghị: lựa chọn 1):**

1. **Dời hạn chót** để làm đủ P1: khoảng **5,2 tuần** cho đợt 1 (demo lõi), khoảng **7,3 tuần** cho đủ P1. Có thể công bố sớm bản đợt 1 rồi bổ sung dần.
2. **Giữ 2 tuần và cắt phạm vi P1.** Đã mô phỏng hai tập con (mục 1b): ngay cả tập nhỏ nhất hợp lý (đăng nhập, bàn cờ, đánh với máy, không phòng và không chơi online; 24 việc, 41,5 ngày công) cũng cần khoảng **3,9 tuần** vì chuỗi luật cờ → máy cờ nằm trọn trên một người (R3); tập có phòng và ván online cơ bản (38 việc, 71,5 ngày công) cần khoảng **4,9 tuần**. **Không có tập con nào chạy được trong 2 tuần** nếu giữ vai trò cố định; chỉ có thể đạt nếu chia việc luật cờ/máy cờ cho ít nhất hai người và thu hẹp thêm. Đây là việc **đổi phạm vi P1**, cần bạn đồng ý (AGENTS §8).
3. **Tăng người hoặc tăng giờ làm** (không khuyến nghị: thiếu hơn 2 lần).

### 1b. Mô phỏng hai tập con phạm vi (để giữ hạn ngắn)

| Tập con | Việc | Ngày công | Mô phỏng |
|---|---:|---:|---:|
| A: đăng nhập + bàn cờ + đánh với máy (không phòng, không chơi online) | 24 | 41,5 | khoảng 3,9 tuần |
| B: A + phòng + ván online cơ bản (không mất kết nối, chat, camera/mic, bạn bè, người xem) | 38 | 71,5 | khoảng 4,9 tuần |

Tập A gồm các việc `T0-01…06, T0-08, T0-09, TA-01…05, TA-08, TC-01, 02, 04…07, TG-01, 02, 04, 06`; tập B thêm `TB-01…03, TB-07…10, TD-01…03, TD-06, TD-07, TD-09, TQ-01`. Cùng mô hình với mục 8, nên có cùng giới hạn (thứ tự phụ thuộc do người lập kế hoạch đoán, vai trò cố định). Chuỗi dài nhất của tập A nằm ở R3 (luật cờ → máy cờ).

## 2. Giả định lập kế hoạch

* **Nhóm 7 người**; tên và vai trò do Product Owner gán (mục 3).
* **Thời hạn gốc:** khoảng 2 tuần kể từ 03/10/2026 (đến khoảng 17/10/2026): 10 ngày làm việc (05–09/10 và 12–16/10).
* **Hệ số hiệu dụng 0,8**; một ngày công = một người làm trọn một ngày; 5 ngày làm việc/tuần.
* Ước lượng thô (±30%) dựa trên đặc tả ở `docs/`; chưa tính học công nghệ mới và sửa lỗi do PoC thất bại.
* Thứ tự phụ thuộc ở mục 6 là **phán đoán của người lập kế hoạch**, cần người trong nhóm xác nhận.

## 3. Vai trò đề xuất (7 người)

| Mã | Vai trò | Đợt 1 / 2 / 3 (ngày công) | Tổng |
|---|---|---|---:|
| **R1** | Trưởng nhóm kỹ thuật, máy chủ thời gian thực (phòng, ván, đồng hồ, kết nối) | 10,5 / 4,5 / 0 | 15 |
| **R2** | Backend: tài khoản, phòng, bạn bè, dữ liệu | 14,5 / 4 / 0 | 18,5 |
| **R3** | Gói luật cờ và máy cờ | 16 / 2 / 1,5 | 19,5 |
| **R4** | Frontend trưởng: bàn cờ, phòng thi đấu, ván với máy, responsive | 14 / 2 / 3 | 19 |
| **R5** | Frontend: tài khoản, Sảnh, phòng chờ, giao diện chung, trợ năng | 14,5 / 2 / 3 | 19,5 |
| **R6** | Chat, camera/mic (LiveKit), trang Bạn bè (giao diện), ván: đồng hồ và Host | 8,5 / 8 / 0 | 16,5 |
| **R7** | Kiểm thử, CI/CD, triển khai, chuẩn bị demo | 11,5 / 6 / 2 | 19,5 |

*Gán tên người vào R1–R7 là việc của Product Owner.* R1 và R2 là điểm nghẽn của chuỗi nền tảng → phòng → ván; R6 làm cả máy chủ lẫn giao diện nên cần người làm được cả hai phía.

## 4. Cấu trúc Jira đề xuất

* **Epic** = một dòng ở mục 6 (E0, EA…EQ) và các Epic P2 ở mục 10.
* **Story** = một US ở [01](01-yeu-cau-chi-tiet.md) (53 US P1); AC chép vào mô tả. Ma trận US → việc ở mục 9.
* **Task** = một mục việc ở mục 6, gắn với Story bằng liên kết *relates to* (một việc có thể phục vụ nhiều Story). Cột "Tiền đề" thành liên kết *is blocked by*.
* **Nhãn:** `P1`/`P2`, đợt `T1`/`T2`/`T3`, vai trò `R1`…`R7`, thành phần `FE`/`BE`/`ENGINE`/`MEDIA`/`QA`/`DEVOPS`.
* **Ước lượng:** *Original estimate* bằng **ngày**. **Trạng thái:** To Do → In Progress → In Review → Done (Done theo mục 11).
* **Tên nhánh/commit/PR (AGENTS §5):** khi có khoá Jira thật thêm `[XW-<số>]`; ⛔ không đoán số.
* Mã tạm (`T0-01`, `US-ROOM-05`) **giữ trong tiêu đề** Jira để đối chiếu tài liệu.

## 5. Ý nghĩa các đợt

| Đợt | Nội dung | Điều kiện đạt |
|---|---|---|
| T1 | Nền tảng, đăng ký/đăng nhập, phòng và ghế, người xem, khoá phòng, bàn cờ, ván online (nước đi, đồng hồ, kết thúc, đầu hàng, mất kết nối), chat, máy cờ Dễ/Trung bình, kiểm thử lõi | Kịch bản D1, D2, D4, D5, D6, D8 (Dễ/TB), D9 chạy |
| T2 | Camera/mic, bạn bè và mời, đuổi người xem, đổi chỗ ghế, xin hoà, cấp Khó, nhiều tab, hồ sơ, kiểm thử D3, D7, D10, bảo mật, chuẩn bị demo | Kịch bản D1–D10 chạy |
| T3 | Responsive từ 360 px, trợ năng, kiểm thử tải, đo máy cờ | NFR-02, NFR-03, NFR-05 đạt |

## 6. Epic, việc, vai trò, ước lượng, tiền đề

### E0 · Nền tảng và thử nghiệm rủi ro — 11 ngày công (đợt 1: 11 · 2: 0 · 3: 0)

| Mã | Công việc | Vai trò | Ngày | Đợt | US / tài liệu | Tiền đề |
|---|---|---|---:|---|---|---|
| T0-01 | Khởi tạo monorepo pnpm, lint, Vitest, .env.example | R7 | 1 | T1 | — | — |
| T0-02 | CI chạy kiểm thử mỗi lần đẩy mã | R7 | 0,5 | T1 | — | T0-01 |
| T0-03 | Dự án Supabase thử nghiệm, khung migration SQL, schema P1 | R2 | 2 | T1 | docs/03 | T0-01 |
| T0-04 | Khung NestJS + Socket.IO, xác thực kết nối, hợp đồng sự kiện dùng chung | R1 | 2 | T1 | docs/04 §4 | T0-01 |
| T0-05 | Khung React/Vite, định tuyến, token thiết kế, thành phần 5 trạng thái | R5 | 2 | T1 | US-UI-03 | T0-01 |
| T0-06 | Triển khai web tĩnh và máy chủ, biến môi trường | R7 | 1 | T1 | docs/04 §10 | T0-04, T0-05 |
| T0-07 | PoC LiveKit: quyền đăng ký track theo từng người | R6 | 1 | T1 | docs/04 §7 | T0-04 |
| T0-08 | PoC OTP Supabase: hạn 180 giây, giới hạn tốc độ, mã 6 số, quét dọn | R2 | 0,5 | T1 | docs/04 §3.1 | T0-03 |
| T0-09 | PoC máy cờ: độ sâu đạt được trong ngân sách | R3 | 1 | T1 | docs/02 §9 | TC-01 |

### EA · Tài khoản và phiên (Nhóm A) — 12 ngày công (đợt 1: 10,5 · 2: 1,5 · 3: 0)

| Mã | Công việc | Vai trò | Ngày | Đợt | US / tài liệu | Tiền đề |
|---|---|---|---:|---|---|---|
| TA-01 | BE: kiểm tra username/email, gửi OTP, dùng lại đăng ký dở, tuần tự hoá theo email | R2 | 1,5 | T1 | US-AUTH-01,02 | T0-03, T0-04, T0-08 |
| TA-02 | BE: xác minh OTP, hoàn tất đăng ký, hoàn tác, tác vụ quét tài khoản chưa hoàn tất | R2 | 2 | T1 | US-AUTH-03 | TA-01 |
| TA-03 | BE: đăng nhập bằng username, phiên 30 ngày/12 giờ, chặn tài khoản chưa hoàn tất | R2 | 1,5 | T1 | US-AUTH-04 | TA-02 |
| TA-04 | FE: trình hướng dẫn đăng ký 3 bước, OTP 6 ô, đếm lùi | R5 | 2,5 | T1 | US-AUTH-01,02,03 | T0-05, TA-01 |
| TA-05 | FE: đăng nhập, ghi nhớ, nút Guest/Google DISABLED | R5 | 1 | T1 | US-AUTH-04 | T0-05 |
| TA-06 | Hồ sơ cơ bản: đổi tên hiển thị, đăng xuất, lọc từ cấm | R5 | 1,5 | T2 | US-AUTH-05 | TA-03, TA-05 |
| TA-07 | FE: chuyển hướng vào phòng sau đăng nhập | R5 | 0,5 | T1 | US-AUTH-06 | TA-05, TB-02 |
| TA-08 | Kiểm thử nhóm A (đơn vị, tích hợp) | R7 | 1,5 | T1 | docs/05 §4 | TA-03 |

### EB · Phòng, mời, ghế, người xem (Nhóm B) — 20 ngày công (đợt 1: 17 · 2: 3 · 3: 0)

| Mã | Công việc | Vai trò | Ngày | Đợt | US / tài liệu | Tiền đề |
|---|---|---|---:|---|---|---|
| TB-01 | BE: tạo phòng, mã 8 ký tự, token mời, danh sách Sảnh | R2 | 1,5 | T1 | US-ROOM-01,08 | T0-03, T0-04 |
| TB-02 | BE: vào phòng (mã/link/Sảnh), ghế hoặc người xem, trần, chặn vào | R2 | 2 | T1 | US-ROOM-05,12 | TB-01 |
| TB-03 | BE: ghế, Sẵn sàng, đếm 3 giây, bắt đầu ván | R1 | 1,5 | T1 | US-ROOM-02,03 | TB-02 |
| TB-04 | BE: đổi chỗ ghế/người xem, reset Sẵn sàng | R2 | 1,5 | T2 | US-ROOM-06 | TB-03 |
| TB-05 | BE: riêng tư, khoá phòng, thu hồi link, kết nối lại theo vai trò | R2 | 1,5 | T1 | US-ROOM-07 | TB-02 |
| TB-06 | BE: đuổi người xem, chặn đến khi đóng phòng | R1 | 1 | T2 | US-ROOM-09 | TB-02 |
| TB-07 | BE: Host rời, chuyển quyền, đóng phòng, quay về phòng chờ | R6 | 1,5 | T1 | US-ROOM-10,11 | TB-03 |
| TB-08 | FE: Sảnh (danh sách phòng, tạo phòng, vào bằng mã, thẻ chế độ) | R5 | 3 | T1 | US-ROOM-01,08, US-UI-02 | T0-05, TB-01 |
| TB-09 | FE: phòng chờ (ghế, Sẵn sàng, đếm ngược, cài đặt phòng) | R5 | 2,5 | T1 | US-ROOM-02,03,07 | TB-08, TB-03 |
| TB-09b | FE: đổi chỗ ghế/người xem trong phòng chờ | R5 | 0,5 | T2 | US-ROOM-06 | TB-09, TB-04 |
| TB-10 | FE: chia sẻ phòng (link+mã), màn từ chối truy cập, xác nhận đuổi | R5 | 1,5 | T1 | US-ROOM-04,09,12 | TB-09 |
| TB-11 | Kiểm thử nhóm B (nhiều client, kịch bản A–E của BA 2.8) | R7 | 2 | T1 | docs/05 §4 | TB-07 |

### EC · Bàn cờ và luật cờ (Nhóm C) — 16 ngày công (đợt 1: 14,5 · 2: 1,5 · 3: 0)

| Mã | Công việc | Vai trò | Ngày | Đợt | US / tài liệu | Tiền đề |
|---|---|---|---:|---|---|---|
| TC-01 | Gói luật cờ: toạ độ, quân, sinh nước, hợp lệ, chiếu, FEN | R3 | 4 | T1 | docs/02 §1–3 | T0-01 |
| TC-02 | Kết thúc ván: chiếu hết, hết nước, lặp thế, chiếu liên tục, 120 nửa nước | R3 | 2 | T1 | US-PLAY-08, docs/02 §3–5 | TC-01 |
| TC-03 | Ký hiệu tiếng Việt duy nhất và bộ thế kiểm thử | R3 | 1,5 | T1 | US-PLAY-10 | TC-02 |
| TC-04 | Kiểm thử luật: xác minh perft, bộ thế từng quân | R3 | 1,5 | T1 | docs/05 §3.1 | TC-02 |
| TC-05 | FE: bàn cờ SVG, quân chữ Hán, lật bàn, nhãn đọc | R4 | 2,5 | T1 | US-BOARD-01 | T0-05 |
| TC-06 | FE: chọn quân, chấm gợi ý, đi bằng click | R4 | 1,5 | T1 | US-BOARD-02 | TC-05, TC-01 |
| TC-07 | FE: kéo thả và cảm ứng | R4 | 1,5 | T1 | US-BOARD-03 | TC-06 |
| TC-08 | FE: dấu nước cuối, chiếu, âm thanh Web Audio | R4 | 1,5 | T2 | US-BOARD-04,05 | TC-07 |

### ED · Ván đấu online (Nhóm D) — 18,5 ngày công (đợt 1: 17 · 2: 1,5 · 3: 0)

| Mã | Công việc | Vai trò | Ngày | Đợt | US / tài liệu | Tiền đề |
|---|---|---|---:|---|---|---|
| TD-01 | BE: dịch vụ ván: nhận nước, tuần tự hoá, biên lai, ghi cơ sở dữ liệu | R1 | 3 | T1 | US-PLAY-01 | TC-02, TB-03 |
| TD-02 | BE: đồng hồ, hết giờ, tính giờ trước khi xét nước | R6 | 1,5 | T1 | US-PLAY-02 | TD-01 |
| TD-03 | BE: kết thúc ván, đầu hàng, rời phòng, kết quả | R1 | 1,5 | T1 | US-PLAY-03,04,06,08 | TD-01 |
| TD-04 | BE: xin hoà và giới hạn gửi lại | R1 | 1 | T2 | US-PLAY-05 | TD-03 |
| TD-05 | BE: mất kết nối, ân hạn theo vai trò, đồng bộ lại, INTERRUPTED | R1 | 2,5 | T1 | US-PLAY-07 | TD-02, TD-03 |
| TD-06 | FE: phòng thi đấu (bố cục, đồng hồ, bảng nước đi, trạng thái) | R4 | 3 | T1 | US-PLAY-01,02,10 | TC-07, TC-03, TD-01 |
| TD-07 | FE: kết quả, xác nhận đầu hàng/rời, lớp phủ kết nối | R4 | 2 | T1 | US-PLAY-03,04,06,07 | TD-06, TD-03 |
| TD-07b | FE: xin hoà (gửi, nhận, rút, đếm lùi) | R4 | 0,5 | T2 | US-PLAY-05 | TD-07, TD-04 |
| TD-08 | FE: chế độ người xem chỉ đọc | R4 | 1 | T1 | US-PLAY-09 | TD-06 |
| TD-09 | Kiểm thử nhóm D (nhiều client, đồng hồ, kết nối lại) | R7 | 2,5 | T1 | docs/05 §4 | TD-05, TD-07 |

### EE · Chat và camera/mic (Nhóm E) — 12 ngày công (đợt 1: 4,5 · 2: 7,5 · 3: 0)

| Mã | Công việc | Vai trò | Ngày | Đợt | US / tài liệu | Tiền đề |
|---|---|---|---:|---|---|---|
| TE-01 | BE: chat 2 kênh, quyền đọc theo mốc ngồi ghế, giới hạn, lọc từ cấm | R6 | 2,5 | T1 | US-CHAT-01,02 | TB-02, T0-04 |
| TE-02 | FE: khung chat (tab, ẩn Kênh Chung) | R6 | 2 | T1 | US-CHAT-01 | TE-01 |
| TE-03 | BE: cấp token LiveKit, quyền theo vai trò, cập nhật khi đổi ghế/đuổi | R6 | 2 | T2 | US-MEDIA-01,02 | T0-07, TB-02 |
| TE-04 | FE: khung camera/mic, 3 mức chia sẻ | R6 | 3 | T2 | US-MEDIA-01,02 | TE-03, TB-09 |
| TE-05 | Nhiều tab tiếp quản (socket và media) | R1 | 1 | T2 | US-MEDIA-03 | TE-04 |
| TE-06 | Kiểm thử nhóm E (chat, kiểm tay LiveKit) | R7 | 1,5 | T2 | docs/05 §4 | TE-04, TE-02 |

### EF · Bạn bè (Nhóm F) — 8 ngày công (đợt 1: 0 · 2: 8 · 3: 0)

| Mã | Công việc | Vai trò | Ngày | Đợt | US / tài liệu | Tiền đề |
|---|---|---|---:|---|---|---|
| TF-01 | BE: tìm, gửi/thu hồi/trả lời lời mời, huỷ kết bạn, giới hạn, lịch sử từ chối | R2 | 2,5 | T2 | US-FRIEND-01,02,03,05 | T0-03, TA-03 |
| TF-02 | BE: trạng thái online/đang đấu, mời bạn vào phòng 30 giây | R1 | 1,5 | T2 | US-FRIEND-03,04 | TF-01, TB-02 |
| TF-03 | FE: trang Bạn bè, chuông, pop-up mời, tab mời trong MODAL-INVITE | R6 | 3 | T2 | US-FRIEND-01..04 | TF-01, TB-10 |
| TF-04 | Kiểm thử nhóm F | R7 | 1 | T2 | docs/05 §4 | TF-03, TF-02 |

### EG · Đánh với máy (Nhóm G) — 14 ngày công (đợt 1: 10,5 · 2: 2 · 3: 1,5)

| Mã | Công việc | Vai trò | Ngày | Đợt | US / tài liệu | Tiền đề |
|---|---|---|---:|---|---|---|
| TG-01 | Máy cờ: negamax, alpha-beta, tìm sâu dần, hàm lượng giá | R3 | 3,5 | T1 | docs/02 §9 | TC-02 |
| TG-02 | Máy cờ: cấp Dễ và Trung bình (ngẫu nhiên có kiểm soát) | R3 | 1 | T1 | US-AI-02 | TG-01 |
| TG-03 | Máy cờ: cấp Khó (bảng chuyển vị, tìm tĩnh) | R3 | 2 | T2 | US-AI-02 | TG-02 |
| TG-04 | Tiến trình máy cờ riêng, hàng đợi, hạn chót, khởi động lại | R3 | 1,5 | T1 | US-AI-04 | TG-02 |
| TG-05 | BE: dịch vụ ván với máy (phe, vào lại 30 phút, bỏ dở) | R2 | 2 | T1 | US-AI-01,03 | TG-04, TD-01 |
| TG-06 | FE: thẻ cấp độ, AI-SETUP, trang ván với máy | R4 | 2,5 | T1 | US-AI-01,02,03 | TG-05, TC-07 |
| TG-07 | Đo máy cờ: thời gian, sức mạnh, 1 000 ván ổn định | R3 | 1,5 | T3 | NFR-05 | TG-03, TG-04 |

### EH · Giao diện chung (Nhóm H) — 7,5 ngày công (đợt 1: 1,5 · 2: 0 · 3: 6)

| Mã | Công việc | Vai trò | Ngày | Đợt | US / tài liệu | Tiền đề |
|---|---|---|---:|---|---|---|
| TH-01 | Thanh điều hướng, mục P2 DISABLED, banner ván dở | R5 | 1,5 | T1 | US-UI-01,02,06 | TB-08 |
| TH-02 | Responsive từ 360 px cho các màn hình P1 | R4 | 3 | T3 | US-UI-04 | TD-07, TB-10 |
| TH-03 | Trợ năng: bàn phím, nhãn, giảm chuyển động, tương phản | R5 | 1,5 | T3 | US-UI-05 | TH-02 |
| TH-04 | Kiểm thử trợ năng và responsive | R5 | 1,5 | T3 | docs/05 §6 | TH-03 |

### EQ · Kiểm thử chấp nhận và chuẩn bị demo — 8,5 ngày công (đợt 1: 3 · 2: 3,5 · 3: 2)

| Mã | Công việc | Vai trò | Ngày | Đợt | US / tài liệu | Tiền đề |
|---|---|---|---:|---|---|---|
| TQ-01 | Playwright kịch bản demo lõi: D1, D2, D4, D5, D6, D8, D9 | R7 | 3 | T1 | docs/05 §1 | TD-09, TB-11, TA-08 |
| TQ-01b | Playwright kịch bản D3 (mời bạn bè), D7 (camera/mic), D10 | R7 | 1 | T2 | docs/05 §1 | TQ-01, TF-04, TE-06 |
| TQ-02 | Kiểm thử tải 50 kết nối | R7 | 2 | T3 | NFR-02 | TD-09 |
| TQ-03 | Kiểm thử bảo mật | R7 | 1,5 | T2 | docs/05 §5 | TA-08, TD-09 |
| TQ-04 | Chuẩn bị demo: dữ liệu, kịch bản, tập dượt | R7 | 1 | T2 | docs/05 §1 | TQ-01b |

## 7. Tổng hợp theo Epic và công suất

| Epic | Đợt 1 | Đợt 2 | Đợt 3 | Tổng |
|---|---:|---:|---:|---:|
| E0 Nền tảng và thử nghiệm rủi ro | 11 | 0 | 0 | 11 |
| EA Tài khoản và phiên (Nhóm A) | 10,5 | 1,5 | 0 | 12 |
| EB Phòng, mời, ghế, người xem (Nhóm B) | 17 | 3 | 0 | 20 |
| EC Bàn cờ và luật cờ (Nhóm C) | 14,5 | 1,5 | 0 | 16 |
| ED Ván đấu online (Nhóm D) | 17 | 1,5 | 0 | 18,5 |
| EE Chat và camera/mic (Nhóm E) | 4,5 | 7,5 | 0 | 12 |
| EF Bạn bè (Nhóm F) | 0 | 8 | 0 | 8 |
| EG Đánh với máy (Nhóm G) | 10,5 | 2 | 1,5 | 14 |
| EH Giao diện chung (Nhóm H) | 1,5 | 0 | 6 | 7,5 |
| EQ Kiểm thử chấp nhận và chuẩn bị demo | 3 | 3,5 | 2 | 8,5 |
| **Cộng** | **89,5** | **28,5** | **9,5** | **127,5** |

**Công suất (7 người, 4 ngày công/người/tuần):** 2 tuần ≈ 56 · 4 tuần ≈ 112 · 6 tuần ≈ 168 · 7 tuần ≈ 196 ngày công. Tuy nhiên **thời gian thực tế dài hơn tổng chia công suất** vì các việc phụ thuộc nhau và vai trò cố định (mục 1).

## 8. Lịch mô phỏng theo người (đủ cả ba đợt)

Mốc tính bằng **ngày làm việc** kể từ ngày bắt đầu (ngày 0); tuần = ngày/5. Tổng thời gian mô phỏng: **36,6 ngày làm việc ≈ 7,3 tuần**.

| Vai trò | Chuỗi việc (mã: ngày bắt đầu–kết thúc) |
|---|---|
| **R1** | T0-04 (1,2–3,8) → TB-03 (8,1–10) → TD-01 (10–13,8) → TD-03 (13,8–15,6) → TD-04 (15,6–16,9) → TB-06 (16,9–18,1) → TD-05 (18,1–21,2) → TF-02 (21,2–23,1) → TE-05 (23,1–24,4) |
| **R2** | T0-03 (1,2–3,8) → TB-01 (3,8–5,6) → TB-02 (5,6–8,1) → T0-08 (8,1–8,8) → TA-01 (8,8–10,6) → TA-02 (10,6–13,1) → TA-03 (13,1–15) → TF-01 (15–18,1) → TG-05 (18,1–20,6) → TB-04 (20,6–22,5) → TB-05 (22,5–24,4) |
| **R3** | TC-01 (1,2–6,2) → TC-02 (6,2–8,8) → TC-03 (8,8–10,6) → TG-01 (10,6–15) → TG-02 (15–16,2) → TG-04 (16,2–18,1) → TG-03 (18,1–20,6) → TC-04 (20,6–22,5) → TG-07 (22,5–24,4) → T0-09 (24,4–25,6) |
| **R4** | TC-05 (2,5–5,6) → TC-06 (5,6–7,5) → TC-07 (7,5–9,4) → TC-08 (9,4–11,2) → TD-06 (11,9–15,6) → TD-07 (15,6–18,1) → TH-02 (18,1–21,9) → TG-06 (21,9–25) → TD-08 (25–26,2) → TD-07b (26,2–26,9) |
| **R5** | T0-05 (1,2–3,8) → TA-05 (3,8–5) → TB-08 (5–8,8) → TH-01 (8,8–10,6) → TB-09 (10,6–13,8) → TB-10 (13,8–15,6) → TA-04 (15,6–18,8) → TA-06 (18,8–20,6) → TH-03 (20,6–22,5) → TH-04 (22,5–24,4) → TA-07 (24,4–25) → TB-09b (25–25,6) |
| **R6** | T0-07 (3,8–5) → TE-03 (8,1–10,6) → TB-07 (10,6–12,5) → TE-01 (12,5–15,6) → TD-02 (15,6–17,5) → TE-04 (17,5–21,2) → TF-03 (21,2–25) → TE-02 (25–27,5) |
| **R7** | T0-01 (0–1,2) → T0-02 (1,2–1,9) → T0-06 (2,5–3,8) → TB-11 (11,6–14,1) → TA-08 (14,1–15,9) → TD-09 (19,7–22,8) → TQ-01 (22,8–26,6) → TE-06 (26,6–28,4) → TF-04 (28,4–29,7) → TQ-01b (29,7–30,9) → TQ-02 (30,9–33,4) → TQ-03 (33,4–35,3) → TQ-04 (35,3–36,6) |

**Đường găng (suy ra từ phụ thuộc):** chuỗi dài nhất bắt đầu từ `T0-01` rồi `T0-03/T0-04` → `TB-01` → `TB-02` → `TB-03` → `TD-01` → `TD-03/TD-05` → `TD-09` → `TQ-01`. Rút ngắn đường găng bằng cách: (1) chốt hợp đồng sự kiện sớm ở `T0-04` để giao diện làm song song; (2) tách các việc của R1/R2 cho người đang rảnh (đã chuyển `TD-02` và `TB-07` sang R6, `TG-05` sang R2); (3) viết kiểm thử song song với phát triển.

## 9. Ma trận US P1 → việc

Đủ mã US **không** có nghĩa đủ mọi AC: người làm phải đối chiếu từng AC ở [01]. Bảng bảo đảm mỗi US có ít nhất một việc.

| US | Tên | Việc |
|---|---|---|
| US-AUTH-01 | Đăng ký bước 1: username và mật khẩu | TA-01, TA-04 |
| US-AUTH-02 | Đăng ký bước 2: email và gửi OTP | TA-01, TA-04 |
| US-AUTH-03 | Đăng ký bước 3: xác thực OTP, tạo tài khoản | TA-02, TA-04 |
| US-AUTH-04 | Đăng nhập bằng username và mật khẩu | TA-03, TA-05 |
| US-AUTH-05 | Hồ sơ cơ bản và đăng xuất | TA-06 |
| US-AUTH-06 | Chuyển hướng vào phòng sau đăng nhập | TA-07 |
| US-ROOM-01 | Tạo phòng | TB-01, TB-08 |
| US-ROOM-02 | Phòng chờ và ghế ngồi | TB-03, TB-09 |
| US-ROOM-03 | Sẵn sàng và bắt đầu ván | TB-03, TB-09 |
| US-ROOM-04 | Chia sẻ phòng bằng link và mã | TB-10 |
| US-ROOM-05 | Vào phòng bằng mã, link hoặc Sảnh | TB-02 |
| US-ROOM-06 | Đổi chỗ giữa ghế và người xem | TB-04, TB-09b |
| US-ROOM-07 | Chế độ riêng tư và khoá phòng | TB-05, TB-09 |
| US-ROOM-08 | Danh sách phòng công khai ở Sảnh | TB-01, TB-08 |
| US-ROOM-09 | Đuổi người xem | TB-06, TB-10 |
| US-ROOM-10 | Host rời, chuyển quyền, đóng phòng | TB-07 |
| US-ROOM-11 | Sau ván: quay về phòng chờ | TB-07 |
| US-ROOM-12 | Màn hình từ chối truy cập | TB-02, TB-10 |
| US-BOARD-01 | Hiển thị bàn cờ | TC-05 |
| US-BOARD-02 | Chọn quân và gợi ý ô đi bằng click | TC-06 |
| US-BOARD-03 | Kéo thả | TC-07 |
| US-BOARD-04 | Đánh dấu nước cuối và chiếu | TC-08 |
| US-BOARD-05 | Âm thanh | TC-08 |
| US-PLAY-01 | Đi nước qua mạng | TD-01, TD-06 |
| US-PLAY-02 | Đồng hồ | TD-02, TD-06 |
| US-PLAY-03 | Kết thúc ván và kết quả | TD-03, TD-07 |
| US-PLAY-04 | Đầu hàng | TD-03, TD-07 |
| US-PLAY-05 | Xin hoà | TD-04, TD-07b |
| US-PLAY-06 | Rời phòng giữa ván | TD-03, TD-07 |
| US-PLAY-07 | Mất kết nối và kết nối lại | TD-05, TD-07 |
| US-PLAY-08 | Lặp thế, chiếu liên tục, không ăn quân | TC-02, TD-03 |
| US-PLAY-09 | Người xem theo dõi trực tiếp | TD-08 |
| US-PLAY-10 | Bảng nước đi | TC-03, TD-06 |
| US-CHAT-01 | Hai kênh chat | TE-01, TE-02 |
| US-CHAT-02 | Giới hạn và bộ lọc từ cấm | TE-01 |
| US-MEDIA-01 | Camera và micro cho hai người chơi | TE-03, TE-04 |
| US-MEDIA-02 | Người xem chỉ xem/nghe | TE-03, TE-04 |
| US-MEDIA-03 | Mở nhiều tab | TE-05 |
| US-FRIEND-01 | Tìm người và gửi lời mời | TF-01, TF-03 |
| US-FRIEND-02 | Nhận và trả lời lời mời | TF-01, TF-03 |
| US-FRIEND-03 | Danh sách bạn và trạng thái | TF-01, TF-02, TF-03 |
| US-FRIEND-04 | Mời bạn bè online vào phòng | TF-02, TF-03 |
| US-FRIEND-05 | Giới hạn | TF-01 |
| US-AI-01 | Chọn cấp độ và phe | TG-05, TG-06 |
| US-AI-02 | Chơi với máy | TG-02, TG-03, TG-06 |
| US-AI-03 | Kết thúc, bỏ dở và vào lại | TG-05, TG-06 |
| US-AI-04 | Sự cố máy cờ | TG-04 |
| US-UI-01 | Thanh điều hướng | TH-01 |
| US-UI-02 | Sảnh | TB-08, TH-01 |
| US-UI-03 | Năm trạng thái cho mọi màn hình | T0-05 |
| US-UI-04 | Responsive | TH-02 |
| US-UI-05 | Trợ năng | TH-03 |
| US-UI-06 | Tính năng P2 hiển thị đúng quy tắc | TH-01 |

## 10. Backlog P2 (chưa ước lượng)

Chỉ tạo Epic và Story, **chưa tạo việc** cho đến khi lên kế hoạch P2.

| Epic P2 | Story (từ [01](01-yeu-cau-chi-tiet.md)) |
|---|---|
| I · Tài khoản mở rộng | US-AUTH-P2-01 Khách · -02 Google · -03 Quên mật khẩu · -04 Đổi username |
| J · Đánh Hạng | US-RANK-01 Ghép trận · -02 Luật Ranked · -03 Elo · -04 Bảng xếp hạng · -05 Mất kết nối Ranked · -06 Phương tiện Ranked |
| K · Đánh Thường mở rộng | US-CAS-01 Ghép ngẫu nhiên · -02 Xin đi lại · -03 Đổi bên · -04 Tái đấu · -05 Không giới hạn + chống treo · -06 Mã QR |
| L · Xã hội mở rộng | US-SOC-01 Chat 1-1 · -02 Sticker · -03 Thách đấu · -04 Người xem tối đa 5 |
| M · Lịch sử và xem lại | US-HIS-01 Lịch sử · -02 Xem lại · -03 Đi lại với máy · -04 FEN/PGN |
| N · Tiện ích demo | US-DEMO-01 Widget máy cờ · -02 Giả lập mạng · -03 Chọn thiết bị khi nhiều tab |

## 11. Định nghĩa hoàn thành (Done)

Một việc hoặc Story chỉ **Done** khi: (1) đạt toàn bộ AC ở [01]; (2) có kiểm thử tự động ở tầng phù hợp ([05]) và chạy xanh trên CI; (3) đã được người khác review; (4) giao diện đủ 5 trạng thái và đúng DESIGN (nếu có giao diện); (5) không có lỗi Nghiêm trọng/Cao mở; (6) tài liệu bị ảnh hưởng đã cập nhật; (7) không commit khoá bí mật.

## 12. Rủi ro của kế hoạch

| Rủi ro | Tác động | Giảm nhẹ |
|---|---|---|
| Ước lượng thấp hơn thực tế (±30%) | Trễ hạn | Theo dõi hằng ngày; cập nhật ước lượng sau tuần đầu |
| Chuỗi nền tảng → phòng → ván dài và tập trung ở R1/R2 | Chặn cả nhóm | Chốt hợp đồng sự kiện sớm; chia việc cho người rảnh; làm kiểm thử song song |
| PoC LiveKit/OTP/máy cờ không đạt | Đổi phương án giữa chừng | Làm ngay đầu (T0-07/08/09); phương án dự phòng ở [02] §9.6 và [04] |
| Thứ tự phụ thuộc do người lập kế hoạch đoán | Lịch sai | Nhóm xác nhận ở buổi lập kế hoạch đầu tiên |
| Công nghệ mới với cả nhóm | Chậm | Dành những ngày đầu cho nền tảng và thử nghiệm |

## 13. Việc cần Product Owner cung cấp hoặc quyết

1. **Chọn lựa chọn 1, 2 hoặc 3** ở mục 1 (dời hạn, cắt phạm vi, hay tăng nguồn lực).
2. **Tên 7 người và vai trò R1–R7.**
3. **Jira thật:** site Atlassian, tên/khoá dự án, đồng ý cho tạo Epic/Story/Task. ⛔ Không đoán số Key.
4. **Lịch làm việc** (có làm cuối tuần không) và hệ số hiệu dụng.
5. Tiêu chí chấm của buổi nộp ngoài kịch bản demo D1–D10 (nếu có).


[01]: 01-yeu-cau-chi-tiet.md
[02]: 02-luat-co-tuong.md
[03]: 03-du-lieu.md
[04]: 04-kien-truc.md
[05]: 05-kiem-thu.md
