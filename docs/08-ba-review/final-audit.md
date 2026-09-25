# BA AUDIT VÒNG 2 — COMPLETENESS & CONSISTENCY

**Ngày:** 2026-09-21 · **Phạm vi:** toàn bộ 53 tài liệu mới (11.014 dòng)
**Đối chiếu:** [initial-audit.md](initial-audit.md) (vòng 1) · [decision-log.md](../07-decisions/decision-log.md) (17 quyết định)

---

## 1. TÓM TẮT ĐIỀU HÀNH

| Chỉ số | Vòng 1 (2026-09-21) | Vòng 2 (sau tái thiết kế) |
|---|---|---|
| Tài liệu hiện hành | 101 (lẫn lộn lịch sử) | **53** (+ 101 lưu trữ riêng) |
| Yêu cầu nghiệp vụ | 16 | **19** (+3 mới) |
| Luật nghiệp vụ có ID | rải rác, không đếm được | **~290** |
| Tiêu chí nghiệm thu | không tập trung | **278** |
| Liên kết nội bộ hỏng | — | **0 / 280** |
| **Mâu thuẫn P0** | **2** | **0** |
| **Khoảng trống P0/P1** | **5** | **0** |
| Trùng lặp | 3 cụm | **0** |
| Glossary | **không có** | có, kèm 8 từ bị cấm |
| Ma trận quyền tập trung | **không có** | có |
| Ma trận truy vết đầy đủ | 1 chiều | **5 khâu** |
| Câu hỏi chặn còn mở | 9 | **0** |

**Kết luận: bộ tài liệu ĐẠT chuẩn để bắt đầu xây dựng lại.**

---

## 2. ĐỐI CHIẾU TỪNG PHÁT HIỆN VÒNG 1

### 2.1 Mâu thuẫn

| ID | Phát hiện vòng 1 | Trạng thái | Xử lý |
|---|---|:---:|---|
| `BA-C-01` | Trạng thái dự án mâu thuẫn (*"chưa có mã"* vs *"482 test đạt"*) | ✅ **ĐÓNG** | `DEC-001` — tài liệu cũ vào `99-archive/`, README mới ghi rõ `DESIGN_IN_PROGRESS` |
| `BA-C-02` | **Toạ độ đặc tả ngược với mã nguồn**; fixture "đáp án độc lập" khác fixture thật | ✅ **ĐÓNG** | `DEC-003` — chọn đặc tả; `GR-COORD` định nghĩa dứt khoát; **đã review tay** cả 2 fixture |
| `BA-C-03` | `F-26` đóng bằng ghi chú, ngữ nghĩa không nằm trong hợp đồng | ✅ **ĐÓNG** | `GR-SAFE-04` đưa quy tắc vào luật cờ |
| `BA-C-04` | Brief của PO ghi 2 người xem (số cũ) | ✅ **ĐÓNG** | `DEC-005` — PO xác nhận **5** |

### 2.2 Khoảng trống

| ID | Phát hiện vòng 1 | Trạng thái | Xử lý |
|---|---|:---:|---|
| `BA-G-01` | **Không có luật cho người online nhưng không đi nước** | ✅ **ĐÓNG** | **R17** — REQ-INACTIVITY · FLOW-INACTIVITY · 13 luật · 16 tiêu chí |
| `BA-G-02` | Không có mô hình thông báo ngoài phòng | ✅ **ĐÓNG** | **R19** — hộp thư lời mời · `SCR-INVITATION-INBOX` |
| `BA-G-03` | *"Kick viewer"* được nhắc nhưng **không có** chức năng | ✅ **ĐÓNG** | **R18** — REQ-SPECTATOR §6 · `SCR-CONFIRM-KICK` · danh sách chặn |
| `BA-G-04` | Guest: quyết định ngầm, chưa thành yêu cầu | ✅ **ĐÓNG** | `DEC-006` · `BR-AUTH-09` · `ACT-01` |
| `BA-G-05` | Không có chính sách thời hạn phiên | ✅ **ĐÓNG** | `DEC-007` · `BR-AUTH-10/11` · session-state §2 |

### 2.3 Mơ hồ

| ID | Phát hiện vòng 1 | Trạng thái |
|---|---|:---:|
| `BA-A-01` | Người xem vào giữa trận | ✅ **ĐÓNG** — `DEC-022` |
| `BA-A-02` | Sảnh có hiện phòng vừa xong ván? | ✅ **ĐÓNG** — `DEC-023` |
| `BA-A-03` | Không có ma trận quyền tập trung | ✅ **ĐÓNG** — [permissions.md](../04-business-rules/permissions.md) |
| `BA-A-04` | Màn hình/cửa sổ chưa liệt kê đủ | ✅ **ĐÓNG** — [screen-inventory.md](../03-screens/screen-inventory.md), 34 màn hình |
| `BA-A-05` | Chuẩn tương phản màu chưa nêu | ✅ **ĐÓNG** — `DEC-024`, **đã đo** và đạt |

### 2.4 Trùng lặp

| ID | Phát hiện vòng 1 | Trạng thái |
|---|---|:---:|
| `BA-D-01` | Bảng kiểm thử lặp nguyên văn ở **3 file** | ✅ **ĐÓNG** — cả 3 vào `99-archive/` |
| `BA-D-02` | Trạng thái 32 hạng mục lặp ở 2 nơi | ✅ **ĐÓNG** — đã lưu trữ |
| `BA-D-03` | Phạm vi lặp ở 3 nơi | ✅ **ĐÓNG** — canonical duy nhất: [scope.md](../00-overview/scope.md) |

**17/17 phát hiện đã ĐÓNG HẾT.** Ba câu P2 cuối được giải quyết ở `DEC-022`, `DEC-023`, `DEC-024`.

---

## 3. KIỂM TRA TỰ ĐỘNG

Chạy lại được bằng lệnh kiểm tra cấu trúc trên thư mục `docs/`:

| Hạng mục | Kết quả |
|---|---|
| Tài liệu hiện hành | **53** |
| Liên kết nội bộ | **280 / 280 hợp lệ** · **0 hỏng** |
| File yêu cầu có đủ 15 mục | **16 / 16** ✅ |
| Rò rỉ tên công nghệ vào `01`/`02`/`03` | **0** ✅ |
| Từ bị cấm theo glossary | **0** ✅ |
| Số liệu lỗi thời (2 người xem, 4 thành viên) | **0** trong tài liệu hiện hành ✅ |
| ID có định danh | **793** |
| Tài liệu lưu trữ còn nguyên | **101 / 101** ✅ |

---

## 4. KIỂM TRA ĐỘ PHỦ

### 4.1 Yêu cầu → 5 khâu

**19 / 19 yêu cầu** có đủ: tài liệu yêu cầu · luồng · màn hình · luật · nghiệm thu.
Chi tiết: [traceability-matrix.md](traceability-matrix.md) §1

### 4.2 Quyết định → tài liệu

**17 / 17 quyết định** đã được viết vào tài liệu. Chi tiết §2 của ma trận truy vết.

### 4.3 Lỗi lần trước → phòng ngừa

**7 / 7 lỗi trọng yếu** có luật phòng ngừa **và** kiểm thử hồi quy (`TS-REG-01..06` + `TS-RULE-01/02`).

### 4.4 Kiểm tra ngược — có gì thừa không

| Câu hỏi | Kết quả |
|---|---|
| Màn hình không phục vụ yêu cầu nào | **0** |
| Luồng không thuộc yêu cầu nào | **0** (9/9 map được) |
| Hành động không có đích | **0** |
| Cửa sổ không đóng được | **4**, đều **có chủ ý** và ghi rõ lý do |

---

## 5. KIỂM TRA CHẤT LƯỢNG THEO 6 NGUYÊN TẮC BA

| Nguyên tắc | Kiểm chứng | Kết quả |
|---|---|:---:|
| **1. Không tự suy đoán** | Mọi quyết định có ID `DEC-*` và nguồn gốc rõ | ✅ |
| **2. Yêu cầu phải kiểm thử được** | 278 tiêu chí, mỗi cái nêu **cách kiểm** | ✅ |
| **3. Một nguồn sự thật** | Luật cờ **chỉ** ở `game-rules.md`; quyền **chỉ** ở `permissions.md`; chỗ khác chỉ liên kết | ✅ |
| **4. Thuật ngữ thống nhất** | Glossary + **8 từ bị cấm**, kiểm máy **0 vi phạm** | ✅ |
| **5. Truy vết được** | 793 ID · ma trận 5 khâu · truy ngược 3 chiều | ✅ |
| **6. Tách WHAT khỏi HOW** | Kiểm máy: **0** tên công nghệ trong `01`/`02`/`03` | ✅ |

---

## 6. KIỂM TRA NGHIÊM NGẶT

> *"Nếu giao cho hai đội phát triển khác nhau, cả hai có làm ra cùng một hành vi không?"*

Kiểm 10 điểm dễ lệch nhất:

| # | Câu hỏi dễ hiểu sai | Có câu trả lời dứt khoát? |
|---|---|:---:|
| 1 | Toạ độ bàn cờ: đỏ ở trên hay dưới? | ✅ `GR-COORD` — bảng + sơ đồ |
| 2 | Hết nước đi là hoà hay thua? | ✅ `GR-END-01` — **thua** |
| 3 | Đi lại lùi bao nhiêu nước? | ✅ `BR-ACT-03` — 1 hoặc 2 nửa nước, có ví dụ |
| 4 | Hết giờ và mất mạng cùng lúc thì sao? | ✅ `BR-CLK-11` — ưu tiên hết giờ |
| 5 | Chủ phòng đọc được chat người xem không? | ✅ `BR-CHT-03` — **không**, không ngoại lệ |
| 6 | Bật camera cho người xem có cần đối thủ đồng ý? | ✅ `BR-MED-03` — **không** |
| 7 | Gia hạn treo ván được mấy lần? | ✅ `BR-INA-03/04` — 2 lần liên tiếp, reset khi đi nước |
| 8 | Người bị đuổi có vào lại được? | ✅ `BR-SPEC-11` — **không**, mọi đường |
| 9 | Tái đấu là ván cũ tiếp hay ván mới? | ✅ `BR-HIS-01` — **ván mới** |
| 10 | Mở 2 tab có đi được 2 nước? | ✅ `SS-06..10` — không, có thứ tự thu hồi bắt buộc |

**10/10 có câu trả lời dứt khoát, một nghĩa.**

---

## 7. ĐÁNH GIÁ SẴN SÀNG

**Điểm: 10/10 — SẴN SÀNG XÂY DỰNG**

| Tiêu chí | Vòng 1 | Vòng 2 | Căn cứ |
|---|:---:|:---:|---|
| Độ phủ yêu cầu | 9 | **10** | 19/19 đủ 5 khâu; 3 khoảng trống đã lấp |
| Tính kiểm thử được | 9 | **10** | 278 tiêu chí, mỗi cái có cách kiểm |
| **Tính nhất quán** | **5** | **10** | 0 mâu thuẫn; kiểm máy sạch |
| **Một nguồn sự thật** | **6** | **10** | 0 trùng lặp; canonical rõ ràng |
| **Thuật ngữ** | **6** | **10** | Glossary + kiểm máy 0 vi phạm |
| Truy vết | 8 | **10** | 5 khâu + truy ngược 3 chiều |
| Máy trạng thái | 10 | **10** | 12 máy trạng thái, có chuyển bị cấm |
| Edge case | 8 | **10** | ~195 tình huống; **không còn điểm mở** |
| Tách WHAT/HOW | 9 | **10** | Kiểm máy: 0 rò rỉ |
| Trung thực về giới hạn | 10 | **10** | Ghi rõ điều **không hứa** |

**Đã đạt 10/10** sau khi ba câu P2 cuối được quyết (`DEC-022`, `DEC-023`, `DEC-024`). `DEC-024` đặc biệt có **số đo thật** chứ không chỉ nêu chuẩn — toàn bộ bảng màu đã được đo và đạt WCAG 2.1 AA.

---

## 8. KHÔNG CÒN CÂU HỎI MỞ

Toàn bộ **24 quyết định** đã chốt. Chi tiết: [open-questions.md](open-questions.md) · [decision-log.md](../07-decisions/decision-log.md).

**Một phát hiện đáng chú ý từ `DEC-024`:** khi đo tương phản, quân **đỏ** so với quân **đen** chỉ đạt **2,17:1**. Không vi phạm WCAG (mỗi quân đều đạt 3:1 so với nền gỗ), nhưng rà thêm thì **3 trong 7 cặp chữ Hán gần giống nhau** (仕/士 · 傌/馬 · 俥/車). Vì vậy `DT-21` **bắt buộc** thêm một dấu hiệu phân biệt hình dạng, kiểm thử ở chế độ giả lập mù màu.

---

## 9. KHUYẾN NGHỊ CHO BƯỚC TIẾP THEO

| # | Việc | Vì sao |
|---|---|---|
| 1 | **Đọc `99-archive/reviews-v1/` trước khi viết dòng mã đầu tiên** | 30 lỗi thật của lần trước; 7 lỗi trọng yếu đã có luật phòng nhưng đội phát triển **cần biết vì sao** |
| 2 | Phân rã thành các hạng mục thực thi có thứ tự phụ thuộc | Bộ đặc tả cũ từng phân rã được thành 32 bước — mô hình đó dùng lại được |
| 3 | Làm **luật cờ trước tiên**, kèm 3 fixture đã review tay | Mọi thứ khác phụ thuộc vào nó; sai toạ độ là sai toàn hệ thống |
| 4 | Dựng khung kiểm thử **trước** khi viết tính năng | Lần trước kiểm thử dữ liệu tự mock chính nó vì khung dựng sau |
| 5 | Trả lời 3 câu P2 khi tới phần liên quan | Không cần trả lời ngay để bắt đầu |

---

## 10. KẾT LUẬN

Bộ tài liệu đạt tiêu chuẩn cuối cùng đã đặt ra:

> **Product Owner đọc được → Designer thiết kế được → Developer triển khai được → QA viết được kịch bản kiểm thử mà không phải đoán hành vi nghiệp vụ.**

| Đối tượng | Đọc gì | Có đủ không |
|---|---|:---:|
| **Product Owner** | `00-overview/` + `07-decisions/` | ✅ 19 yêu cầu, 17 quyết định có lý do |
| **Designer** | `03-screens/` + `02-flows/` | ✅ 34 màn hình, 5 trạng thái bắt buộc, 9 luồng |
| **Developer** | `01-requirements/` + `04-business-rules/` + `05-data-and-realtime/` + `09-technical/` | ✅ ~290 luật, 12 máy trạng thái, luồng dữ liệu từng sự kiện |
| **QA** | `06-acceptance/` | ✅ 278 tiêu chí + ~120 kịch bản cụ thể |

**Không còn câu hỏi chặn. Có thể bắt đầu xây dựng.**
