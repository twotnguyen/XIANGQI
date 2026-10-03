# 06 · Kế hoạch phân vai và cấu trúc Jira (Giai đoạn 3)

**Giai đoạn 3 · Trạng thái: Đề xuất (chờ Product Owner duyệt)** · Căn cứ: [01](01-yeu-cau-chi-tiet.md) (US/AC), [02](02-luat-co-tuong.md), [03](03-du-lieu.md), [04](04-kien-truc.md), [05](05-kiem-thu.md), [BA-SCOPE-DECISIONS.md](../BA-SCOPE-DECISIONS.md) Phần 11. **Chưa tạo gì trên Jira thật**: cần Product Owner cung cấp site/dự án/khoá (AGENTS §1, §5: không đoán số Key). Tệp này là bản kế hoạch dùng để tạo Jira. Bảng ở mục 6 và 8 được **sinh bằng chương trình** từ dữ liệu việc nên các tổng khớp nhau.

## 1. Quyết định của Product Owner và kết luận về hạn 2 tuần

**Quyết định của Product Owner (03/10/2026):** (1) **hạn 2 tuần là cố định** (khoảng 14 ngày, **làm cả cuối tuần**); được phép **dừng bớt phần** để vừa hạn; (2) tạo Epic/Story/Task vào dự án Jira **XIAN** (site `xiangqi-web`) **sau khi** review các tệp `.md` ở [`Jira/`](../Jira/README.md); (3) hệ số hiệu dụng giữ **0,8**.

**Công suất 2 tuần:** 14 ngày × 7 người × 0,8 = **78,4 ngày công**. Phạm vi P1 ước lượng **128 ngày công** (78 việc, 53 US) nên **không thể làm hết P1 trong 2 tuần** theo ước lượng cơ sở; phải dừng bớt phần theo thứ tự ở mục 1b.

### 1a. Các mức phạm vi (mỗi mức là tập **đóng theo tiền đề**) và thời gian cần

Mỗi mức gồm **đủ mọi việc tiền đề** của các việc kiểm thử chấp nhận của mức đó, nên là một sản phẩm chạy được. Mô phỏng xếp lịch **theo từng lớp mức** (xếp trọn Mức 1 trước; việc Mức 2 chỉ chèn vào chỗ trống, và cứ thế, nên việc mức cao không bao giờ làm chậm mức thấp), theo tiền đề ở mục 6, cho phép chia việc trong cùng nhóm (máy chủ: R1, R2, R6; giao diện: R4, R5, R6; luật cờ và máy cờ: R3; kiểm thử: R7), việc giao diện và kiểm thử được bắt đầu khi bên phụ trợ làm xong một nửa. **Ước tính tham lam, không phải bằng chứng.** Số ngày làm việc (7 ngày/tuần):

| Mức | Phạm vi | Việc | Ngày công | **Cơ sở** (hệ số 0,8) | Ước lượng −30%, hệ số 0,8 | Độ nhạy: −30%, hệ số 1,0 |
|---|---|---:|---:|---:|---:|---:|
| 1 | Đăng ký/đăng nhập, luật cờ, bàn cờ, ván với máy cấp Dễ/Trung bình | 26 | 48 | **22,2** | 15,6 | 12,5 |
| 2 | Mức 1 + phòng (tạo, vào bằng mã/link, ghế, Sẵn sàng) + phòng thi đấu và ván online (nước đi, đồng hồ, kết thúc ván, mất kết nối) | 40 | 74 | **26,6** | 18,7 | 15 |
| 3 | Mức 2 + khoá phòng, người xem, chat, PoC LiveKit (**toàn bộ đợt 1**) | 52 | 89 | **27,8** | 19,5 | 15,7 |
| 4 | Mức 3 + camera/mic, bạn bè và mời, đuổi người xem, đổi chỗ, xin hoà, cấp Khó, nhiều tab, hồ sơ (**đợt 1+2**) | 73 | 118,5 | **35,9** | 25,2 | 20,2 |
| 5 | Mức 4 + responsive, trợ năng, kiểm thử tải, đo máy cờ (**đủ P1**) | 78 | 128 | **38,4** | 27 | 21,6 |

**Đọc bảng:** hạn là **14 ngày**. Mức nào vừa hạn: theo **ước lượng cơ sở** → không mức nào; theo −30% với hệ số 0,8 → không mức nào; theo độ nhạy −30% và hệ số 1,0 (khác hệ số 0,8 bạn đã chọn, **chỉ để thử độ nhạy**) → Mức 1 (Mức 2 cần 15 ngày, vượt hạn không nhiều). Kết luận trung thực: theo ước lượng cơ sở **ngày 14 có thể chưa xong mức nào**; chỉ khi ước lượng thực tế thấp hơn nhiều thì Mức 1–2 mới kịp. Cần đo tốc độ thật ở mốc ngày 4 và 7 để biết.

**Danh sách việc của từng mức** (cộng dồn):

* **Mức 1** thêm: `T0-01`, `T0-03`, `T0-04`, `T0-05`, `T0-08`, `T0-09`, `TA-01`, `TA-02`, `TA-03`, `TA-04`, `TA-05`, `TA-08`, `TC-01`, `TC-02`, `TC-05`, `TC-06`, `TC-07`, `TD-01`, `TD-03`, `TD-07`, `TG-01`, `TG-02`, `TG-04`, `TG-05`, `TG-06`, `TQ-01a`
* **Mức 2** thêm: `TB-01`, `TB-02`, `TB-03`, `TB-07`, `TB-08`, `TB-09`, `TB-10`, `TB-11`, `TC-03`, `TD-02`, `TD-05`, `TD-06`, `TD-09`, `TQ-01b`
* **Mức 3** thêm: `T0-02`, `T0-06`, `T0-07`, `TA-07`, `TB-05`, `TB-11b`, `TC-04`, `TD-08`, `TE-01`, `TE-02`, `TH-01`, `TQ-01c`
* **Mức 4** thêm: `TA-06`, `TA-06b`, `TB-04`, `TB-06`, `TB-09b`, `TB-10b`, `TC-08`, `TD-04`, `TD-07b`, `TE-03`, `TE-04`, `TE-05`, `TE-06`, `TF-01`, `TF-02`, `TF-03`, `TF-04`, `TG-03`, `TQ-01d`, `TQ-03`, `TQ-04`
* **Mức 5** thêm: `TG-07`, `TH-02`, `TH-03`, `TH-04`, `TQ-02`

**Lối vào khi chưa có Sảnh đầy đủ:** `TG-06` dựng **Sảnh tối giản** (3 thẻ cấp độ máy và Đăng xuất) để Mức 1 chạy được; `TB-08` mở rộng Sảnh ở Mức 2. Các mức chưa làm thì lối vào ở màn hình đã có phải `DISABLED` kèm *"Sắp ra mắt"* hoặc ẩn theo quy tắc ở [DANH-MUC](../DANH-MUC-MAN-HINH-XIANGQI.md) §7. Một Story chỉ **Done** khi mọi việc của nó xong; nếu dừng giữa chừng thì Story ở trạng thái *một phần*.

### 1b. Thứ tự làm và thứ tự dừng phần

Làm **từ Mức 1 lên Mức 5**; khi trễ thì **dừng từ Mức cao xuống**. Việc thuộc mức thấp luôn được ưu tiên người làm trước việc thuộc mức cao.

| Mức | Mục tiêu cốt lõi được phục vụ | Khi dừng ở mức này, cái còn thiếu |
|---:|---|---|
| 1 | 1 (đăng ký/đăng nhập), 4 (bàn cờ), 8 (đánh với máy Dễ/TB) | Phòng, chơi online, chat, camera/mic, bạn bè, cấp Khó |
| 2 | + 2 (tạo phòng), 3 (mời bằng link/mã), 5 (hai người đánh online, có mất kết nối) | Khoá phòng, người xem, chat, camera/mic, bạn bè |
| 3 | + 6 (công khai/khoá/mã, tối đa 2 người xem), 7 (chat) | Camera/mic, bạn bè, đuổi người xem, cấp Khó, đổi chỗ, xin hoà |
| 4 | + 3 (bạn bè), 6 (đuổi), 7 (camera/mic), 8 (Khó) | Responsive, trợ năng, tải |
| 5 | Đủ P1 | — |

### 1c. Mốc kiểm soát (đề xuất)

Mốc dựa trên lịch xếp theo lớp mức ở **độ nhạy (−30%, hệ số 1,0)** (mục 8); nếu thực tế chậm hơn, các mốc là ngưỡng để quyết định dừng phần sớm.

| Mốc | Việc cần xong (theo lịch độ nhạy) | Quy tắc khi trễ |
|---|---|---|
| **Ngày 4** | 13 việc xong thêm trong khoảng này: `T0-01`, `T0-02`, `T0-05`, `T0-03`, `T0-04`, `TA-05`, `T0-06`, `T0-08`, `TB-01`, `TC-05`, `TA-01`, `TC-01`, `TC-06` | Thử nghiệm đầu: nếu PoC OTP, LiveKit hoặc máy cờ không đạt thì báo Product Owner để đổi phương án ngay (PoC máy cờ `T0-09` chỉ chạy được sau `TC-01`) |
| **Ngày 7** | 15 việc xong thêm trong khoảng này: `TC-07`, `T0-09`, `TB-02`, `TA-02`, `TA-04`, `TB-03`, `TC-02`, `T0-07`, `TB-08`, `TA-03`, `TA-08`, `TB-07`, `TB-09`, `TA-07`, `TB-05` | Mức 1 đang chạy: nếu trễ hơn 2 ngày thì **dừng nhận Mức 4 trở lên** khỏi kế hoạch |
| **Ngày 10** | 16 việc xong thêm trong khoảng này: `TB-10`, `TB-11`, `TA-06b`, `TD-01`, `TB-11b`, `TH-01`, `TA-06`, `TG-01`, `TG-02`, `TD-03`, `TD-02`, `TB-06`, `TD-07`, `TE-01`, `TG-04`, `TB-10b` | Mức 2 vào tích hợp: nếu chưa thì **dừng ở Mức 1–2**, chuyển sức sang ổn định |
| **Ngày 12** | 8 việc xong thêm trong khoảng này: `TE-02`, `TD-04`, `TD-05`, `TD-07b`, `TC-03`, `TG-05`, `TB-04`, `TC-04` | Mức 3 chạy: **ngừng nhận tính năng mới** |
| **Ngày 14** | 9 việc xong thêm trong khoảng này: `TG-06`, `TD-06`, `TQ-01a`, `TB-09b`, `TE-03`, `TD-08`, `TG-03`, `TF-01`, `TC-08` | Demo mức đạt được; mọi việc chưa xong ghi là *dừng phần* |

**Cần Product Owner chốt:** chấp nhận rằng nếu ước lượng cơ sở đúng thì ở ngày 14 có thể chưa xong mức nào, và quyết định dừng ở mức nào sẽ được đưa ra ở các mốc trên.

## 2. Giả định lập kế hoạch

* **Nhóm 7 người**; tên và vai trò do Product Owner gán (mục 3).
* **Thời hạn cố định:** 2 tuần kể từ 03/10/2026 (đến khoảng 17/10/2026), **làm cả cuối tuần** (14 ngày).
* **Hệ số hiệu dụng 0,8**; một ngày công = một người làm trọn một ngày; 7 ngày/tuần.
* Ước lượng thô (±30%) dựa trên đặc tả ở `docs/`; chưa tính học công nghệ mới và sửa lỗi do PoC thất bại.
* Thứ tự phụ thuộc ở mục 6 là **phán đoán của người lập kế hoạch**, cần người trong nhóm xác nhận.

## 3. Vai trò đề xuất (7 người)

| Mã | Vai trò | Đợt 1 / 2 / 3 (ngày công) | Tổng |
|---|---|---|---:|
| **R1** | Trưởng nhóm kỹ thuật, máy chủ thời gian thực (phòng, ván, đồng hồ, kết nối) | 10,5 / 4,5 / 0 | 15 |
| **R2** | Backend: tài khoản, phòng, bạn bè, dữ liệu | 14,5 / 4,5 / 0 | 19 |
| **R3** | Gói luật cờ và máy cờ | 16 / 2 / 1,5 | 19,5 |
| **R4** | Frontend trưởng: bàn cờ, phòng thi đấu, ván với máy, responsive | 14 / 2 / 3 | 19 |
| **R5** | Frontend: tài khoản, Sảnh, phòng chờ, giao diện chung, trợ năng | 14 / 2 / 3 | 19 |
| **R6** | Chat, camera/mic (LiveKit), trang Bạn bè (giao diện), ván: đồng hồ và Host | 8,5 / 8 / 0 | 16,5 |
| **R7** | Kiểm thử, CI/CD, triển khai, chuẩn bị demo | 11,5 / 6,5 / 2 | 20 |

*Gán tên người vào R1–R7 là việc của Product Owner.* R1 và R2 là điểm nghẽn của chuỗi nền tảng → phòng → ván; R6 làm cả máy chủ lẫn giao diện nên cần người làm được cả hai phía.

## 4. Cấu trúc Jira đề xuất

* **Epic** = một dòng ở mục 6 (E0, EA…EQ) và các Epic P2 ở mục 10. Mỗi Epic, Story, Task có **một tệp `.md`** trong [`Jira/`](../Jira/README.md) để review trước khi tạo.
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
| TA-06 | FE: hồ sơ cơ bản: đổi tên hiển thị, đăng xuất | R5 | 1 | T2 | US-AUTH-05 | TA-05, TA-06b |
| TA-06b | BE: cập nhật tên hiển thị có lọc từ cấm ở máy chủ (client không ghi trực tiếp) | R2 | 0,5 | T2 | US-AUTH-05 | TA-03 |
| TA-07 | FE: chuyển hướng vào phòng sau đăng nhập | R5 | 0,5 | T1 | US-AUTH-06 | TA-05, TB-02 |
| TA-08 | Kiểm thử nhóm A (đơn vị, tích hợp) | R7 | 1,5 | T1 | docs/05 §4 | TA-03 |

### EB · Phòng, mời, ghế, người xem (Nhóm B) — 20 ngày công (đợt 1: 16,5 · 2: 3,5 · 3: 0)

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
| TB-10 | FE: chia sẻ phòng (link+mã) và màn từ chối truy cập | R5 | 1 | T1 | US-ROOM-04,12 | TB-09 |
| TB-10b | FE: danh sách người xem và xác nhận đuổi | R5 | 0,5 | T2 | US-ROOM-09 | TB-10, TB-06 |
| TB-11 | Kiểm thử nhóm B phần cơ bản: tạo phòng, vào bằng mã/link, ghế, Sẵn sàng, Host rời | R7 | 1 | T1 | docs/05 §4 | TB-07 |
| TB-11b | Kiểm thử nhóm B: khoá phòng, người xem, kết nối lại, kịch bản A–E của BA 2.8 | R7 | 1 | T1 | docs/05 §4 | TB-05, TB-11 |

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
| TD-01 | BE: dịch vụ ván: nhận nước, tuần tự hoá, biên lai, ghi cơ sở dữ liệu | R1 | 3 | T1 | US-PLAY-01 | TC-02, T0-04 |
| TD-02 | BE: đồng hồ, hết giờ, tính giờ trước khi xét nước | R6 | 1,5 | T1 | US-PLAY-02 | TD-01 |
| TD-03 | BE: kết thúc ván, đầu hàng, rời phòng, kết quả | R1 | 1,5 | T1 | US-PLAY-03,04,06,08 | TD-01 |
| TD-04 | BE: xin hoà và giới hạn gửi lại | R1 | 1 | T2 | US-PLAY-05 | TD-03 |
| TD-05 | BE: mất kết nối, ân hạn theo vai trò, đồng bộ lại, INTERRUPTED | R1 | 2,5 | T1 | US-PLAY-07 | TD-02, TD-03 |
| TD-06 | FE: phòng thi đấu (bố cục, đồng hồ, bảng nước đi, trạng thái) | R4 | 3 | T1 | US-PLAY-01,02,10 | TC-07, TC-03, TD-01 |
| TD-07 | FE: kết quả, xác nhận đầu hàng/rời, lớp phủ kết nối | R4 | 2 | T1 | US-PLAY-03,04,06,07 | TD-03 |
| TD-07b | FE: xin hoà (gửi, nhận, rút, đếm lùi) | R4 | 0,5 | T2 | US-PLAY-05 | TD-07, TD-04 |
| TD-08 | FE: chế độ người xem chỉ đọc | R4 | 1 | T1 | US-PLAY-09 | TD-06 |
| TD-09 | Kiểm thử nhóm D (nhiều client, đồng hồ, kết nối lại) | R7 | 2,5 | T1 | docs/05 §4 | TD-05, TD-07, TD-06 |

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
| TG-01 | Máy cờ: negamax, alpha-beta, tìm sâu dần, hàm lượng giá | R3 | 3,5 | T1 | docs/02 §9 | TC-02, T0-09 |
| TG-02 | Máy cờ: cấp Dễ và Trung bình (ngẫu nhiên có kiểm soát) | R3 | 1 | T1 | US-AI-02 | TG-01 |
| TG-03 | Máy cờ: cấp Khó (bảng chuyển vị, tìm tĩnh) | R3 | 2 | T2 | US-AI-02 | TG-02 |
| TG-04 | Tiến trình máy cờ riêng, hàng đợi, hạn chót, khởi động lại | R3 | 1,5 | T1 | US-AI-04 | TG-02 |
| TG-05 | BE: dịch vụ ván với máy (phe, vào lại 30 phút, bỏ dở) | R2 | 2 | T1 | US-AI-01,03 | TG-04, TD-01, TD-03 |
| TG-06 | FE: thẻ cấp độ, AI-SETUP, trang ván với máy | R4 | 2,5 | T1 | US-AI-01,02,03 | TG-05, TC-07, TD-07 |
| TG-07 | Đo máy cờ: thời gian, sức mạnh, 1 000 ván ổn định | R3 | 1,5 | T3 | NFR-05 | TG-03, TG-04 |

### EH · Giao diện chung (Nhóm H) — 7,5 ngày công (đợt 1: 1,5 · 2: 0 · 3: 6)

| Mã | Công việc | Vai trò | Ngày | Đợt | US / tài liệu | Tiền đề |
|---|---|---|---:|---|---|---|
| TH-01 | Thanh điều hướng, mục P2 DISABLED, banner ván dở | R5 | 1,5 | T1 | US-UI-01,02,06 | TB-08 |
| TH-02 | Responsive từ 360 px cho các màn hình P1 | R4 | 3 | T3 | US-UI-04 | TD-07, TB-10 |
| TH-03 | Trợ năng: bàn phím, nhãn, giảm chuyển động, tương phản | R5 | 1,5 | T3 | US-UI-05 | TH-02 |
| TH-04 | Kiểm thử trợ năng và responsive | R5 | 1,5 | T3 | docs/05 §6 | TH-03 |

### EQ · Kiểm thử chấp nhận và chuẩn bị demo — 9 ngày công (đợt 1: 3 · 2: 4 · 3: 2)

| Mã | Công việc | Vai trò | Ngày | Đợt | US / tài liệu | Tiền đề |
|---|---|---|---:|---|---|---|
| TQ-01a | Playwright Mức 1: D1 (đăng ký/đăng nhập) và D8 (ván với máy cấp Dễ/Trung bình) | R7 | 1 | T1 | docs/05 §1 | TA-08, TA-04, TA-05, TG-06, TD-07 |
| TQ-01b | Playwright Mức 2: D2 (tạo phòng) và D6 (ván online đến chiếu hết) | R7 | 1 | T1 | docs/05 §1 | TD-09, TB-11, TB-10 |
| TQ-01c | Playwright Mức 3: D4 (người xem), D5 (khoá phòng), D9 (mất kết nối) | R7 | 1 | T1 | docs/05 §1 | TQ-01b, TB-11b, TD-08, TD-05 |
| TQ-01d | Playwright Mức 4: D3 (mời bạn bè), D7 (camera/mic), D8 cấp Khó, D10, và kịch bản A–E đầy đủ có đổi chỗ ghế | R7 | 1,5 | T2 | docs/05 §1 | TQ-01c, TF-04, TE-06, TG-03, TB-04, TB-09b |
| TQ-02 | Kiểm thử tải 50 kết nối | R7 | 2 | T3 | NFR-02 | TD-09 |
| TQ-03 | Kiểm thử bảo mật | R7 | 1,5 | T2 | docs/05 §5 | TA-08, TD-09 |
| TQ-04 | Chuẩn bị demo: dữ liệu, kịch bản, tập dượt | R7 | 1 | T2 | docs/05 §1 | TQ-01d |

## 7. Tổng hợp theo Epic và công suất

| Epic | Đợt 1 | Đợt 2 | Đợt 3 | Tổng |
|---|---:|---:|---:|---:|
| E0 Nền tảng và thử nghiệm rủi ro | 11 | 0 | 0 | 11 |
| EA Tài khoản và phiên (Nhóm A) | 10,5 | 1,5 | 0 | 12 |
| EB Phòng, mời, ghế, người xem (Nhóm B) | 16,5 | 3,5 | 0 | 20 |
| EC Bàn cờ và luật cờ (Nhóm C) | 14,5 | 1,5 | 0 | 16 |
| ED Ván đấu online (Nhóm D) | 17 | 1,5 | 0 | 18,5 |
| EE Chat và camera/mic (Nhóm E) | 4,5 | 7,5 | 0 | 12 |
| EF Bạn bè (Nhóm F) | 0 | 8 | 0 | 8 |
| EG Đánh với máy (Nhóm G) | 10,5 | 2 | 1,5 | 14 |
| EH Giao diện chung (Nhóm H) | 1,5 | 0 | 6 | 7,5 |
| EQ Kiểm thử chấp nhận và chuẩn bị demo | 3 | 4 | 2 | 9 |
| **Cộng** | **89** | **29,5** | **9,5** | **128** |

**Công suất (7 người, hệ số 0,8, 7 ngày/tuần):** 14 ngày ≈ 78,4 · 21 ngày ≈ 117,6 · 28 ngày ≈ 156,8 ngày công. Thời gian thực tế dài hơn tổng chia công suất vì các việc phụ thuộc nhau (mục 1a).

## 8. Lịch mô phỏng theo người, xếp theo lớp mức (độ nhạy: −30%, hệ số 1,0)

Lịch xếp **theo lớp mức**: Mức 1 trước, rồi việc Mức 2 chèn vào chỗ trống, và cứ thế; nên việc mức cao không làm chậm mức thấp. Mốc là **ngày kể từ ngày bắt đầu** (làm 7 ngày/tuần). Hoàn tất từng mức theo lịch này (việc giao diện/kiểm thử chỉ **bắt đầu** khi tiền đề xong một nửa nhưng chỉ **xong** sau tiền đề cộng thời gian tích hợp): Mức 1: **12,5** ngày, Mức 2: **15** ngày, Mức 3: **15,7** ngày, Mức 4: **20,2** ngày, Mức 5: **21,6** ngày. Đây là kịch bản **độ nhạy**, không phải baseline; người làm chỉ là gợi ý (đổi được trong cùng nhóm máy chủ/giao diện). **Dừng phần theo mức (mục 1b), không theo ngày của từng việc.**

| Vai trò | Chuỗi việc (mã: ngày bắt đầu–kết thúc) |
|---|---|
| **R1** | T0-03 (0,7–2,1) → T0-08 (2,1–2,4) → TA-01 (2,4–3,5) → TA-02 (3,5–4,9) → TA-03 (4,9–5,9) → TB-05 (5,9–7) → TA-06b (7–7,3) → TD-03 (7,7–8,8) → TB-06 (8,8–9,4) → TG-05 (9,8–11,2) → TE-03 (11,2–12,6) → TF-02 (13,3–14,4) → TE-05 (14,7–15,4) |
| **R2** | T0-04 (0,7–2,1) → TB-01 (2,1–3,1) → TB-02 (3,1–4,5) → TB-03 (4,5–5,6) → TD-01 (5,6–7,7) → TD-02 (7,7–8,8) → TD-05 (8,8–10,5) → TB-04 (10,5–11,6) → TF-01 (11,6–13,3) |
| **R3** | TC-01 (0,7–3,5) → T0-09 (3,5–4,2) → TC-02 (4,2–5,6) → TG-01 (5,6–8) → TG-02 (8–8,7) → TG-04 (8,7–9,8) → TC-03 (9,8–10,8) → TC-04 (10,8–11,9) → TG-03 (11,9–13,3) → TG-07 (13,3–14,3) |
| **R4** | T0-05 (0,7–2,1) → TC-06 (2,3–3,8) → TB-08 (3,8–5,9) → TB-10 (5,9–7,1) → TA-06 (7,2–7,9) → TD-07 (8,2–9,6) → TB-10b (9,6–10) → TG-06 (10,5–12,2) → TB-09b (12,2–12,6) → TE-04 (12,6–14,7) → TH-03 (14,7–15,9) |
| **R5** | TA-05 (1,4–2,4) → TC-07 (2,8–4,1) → TB-09 (5,1–6,8) → TH-01 (6,8–7,9) → TE-02 (8,8–10,2) → TD-06 (10,3–12,4) → TC-08 (12,4–13,5) → TH-02 (13,5–15,6) |
| **R6** | TC-05 (1,4–3,1) → TA-04 (3,1–4,9) → T0-07 (4,9–5,6) → TB-07 (5,6–6,6) → TA-07 (6,6–7) → TB-11b (7,2–7,9) → TE-01 (7,9–9,6) → TD-04 (9,6–10,3) → TD-07b (10,3–10,7) → TD-08 (11,4–12,7) → TF-03 (12,7–14,8) → TH-04 (15,2–16,3) |
| **R7** | T0-01 (0–0,7) → T0-02 (0,7–1) → T0-06 (1,4–2,4) → TA-08 (5,4–6,5) → TB-11 (6,5–7,2) → TQ-01a (11,4–12,5) → TD-09 (12,5–14,3) → TQ-01b (14,3–15) → TQ-01c (15–15,7) → TF-04 (15,7–16,4) → TE-06 (16,4–17,4) → TQ-01d (17,4–18,5) → TQ-04 (18,5–19,2) → TQ-03 (19,2–20,2) → TQ-02 (20,2–21,6) |

**Đường găng:** chuỗi nền tảng → phòng → ván (`T0-01` → `T0-03/T0-04` → `TB-01` → `TB-02` → `TB-03`, song song `TC-01/02` → `TD-01` → `TD-03/TD-05` → `TD-09` → `TQ-01b/c`). Rút ngắn bằng cách chốt hợp đồng sự kiện sớm ở `T0-04`, chia việc cho người đang rảnh trong cùng nhóm, và viết kiểm thử song song.

## 9. Ma trận US P1 → việc

Đủ mã US **không** có nghĩa đủ mọi AC: người làm phải đối chiếu từng AC ở [01]. Bảng bảo đảm mỗi US có ít nhất một việc.

| US | Tên | Việc |
|---|---|---|
| US-AUTH-01 | Đăng ký bước 1: username và mật khẩu | TA-01, TA-04 |
| US-AUTH-02 | Đăng ký bước 2: email và gửi OTP | TA-01, TA-04 |
| US-AUTH-03 | Đăng ký bước 3: xác thực OTP, tạo tài khoản | TA-02, TA-04 |
| US-AUTH-04 | Đăng nhập bằng username và mật khẩu | TA-03, TA-05 |
| US-AUTH-05 | Hồ sơ cơ bản và đăng xuất | TA-06, TA-06b |
| US-AUTH-06 | Chuyển hướng vào phòng sau đăng nhập | TA-07 |
| US-ROOM-01 | Tạo phòng | TB-01, TB-08 |
| US-ROOM-02 | Phòng chờ và ghế ngồi | TB-03, TB-09 |
| US-ROOM-03 | Sẵn sàng và bắt đầu ván | TB-03, TB-09 |
| US-ROOM-04 | Chia sẻ phòng bằng link và mã | TB-10 |
| US-ROOM-05 | Vào phòng bằng mã, link hoặc Sảnh | TB-02 |
| US-ROOM-06 | Đổi chỗ giữa ghế và người xem | TB-04, TB-09b |
| US-ROOM-07 | Chế độ riêng tư và khoá phòng | TB-05, TB-09 |
| US-ROOM-08 | Danh sách phòng công khai ở Sảnh | TB-01, TB-08 |
| US-ROOM-09 | Đuổi người xem | TB-06, TB-10b |
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

1. **Review các tệp ở [`Jira/`](../Jira/README.md)** (Epic, Story, Task) rồi cho phép tạo lên Jira dự án **XIAN**. Chưa tạo gì cho đến khi bạn đồng ý.
2. **Chốt thứ tự dừng phần** ở mục 1b và các mốc kiểm soát ở mục 1c.
3. **Tên 7 người và vai trò R1–R7** (để gán người thực hiện).
4. **Tiêu chí chấm** của buổi nộp ngoài kịch bản demo D1–D10 (nếu có).


[01]: 01-yeu-cau-chi-tiet.md
[02]: 02-luat-co-tuong.md
[03]: 03-du-lieu.md
[04]: 04-kien-truc.md
[05]: 05-kiem-thu.md
