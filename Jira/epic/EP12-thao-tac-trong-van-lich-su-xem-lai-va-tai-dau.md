# EP12 · Thao tác trong ván, lịch sử, xem lại và tái đấu

> **Loại:** Epic · **Story:** [ST12.1](../story/ST12.1-dau-hang-xin-hoa-di-lai-di-lai-tren-cay-nuoc-thanh-thao-tac.md), [ST12.2](../story/ST12.2-lich-su-van-rieng-tu-va-xem-lai-theo-nhanh-hieu-luc.md), [ST12.3](../story/ST12.3-tai-dau-doi-ben-dong-phong-10-phut-man-ket-qua.md)

| Trường Jira | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | `EP12 · Thao tác trong ván, lịch sử, xem lại và tái đấu` |
| Components | Backend, Frontend, Tester |
| Priority | High |
| Labels | `xq-v2`, `ep12`, `race` |
| Fix versions | `v1.0.0` |
| Start date / Due date | 2026-10-12 / 2026-10-20 |
| Nguồn đặc tả | ISSUE-104 … ISSUE-107, ISSUE-125 … ISSUE-129 (R13, R14) |

---

> ⏱ **Đọc lần đầu:** khoảng 12 phút. · Từ kỹ thuật lạ ⇒ [Từ điển kỹ thuật](../05-TU-DIEN-KY-THUAT.md) · Cách kiểm thử chung ⇒ [Sổ tay kiểm thử](../04-HUONG-DAN-KIEM-THU.md)

## 1. TÓM TẮT (đọc trong 1 phút)

Sau Epic này, hai người chơi đang đánh một ván online có thể:

| Việc | Cần đối thủ đồng ý? | Kết quả |
|---|---|---|
| **Đầu hàng** | Không | Ván kết thúc ngay, mình thua |
| **Xin hoà** | Có (trong 30 giây) | Đồng ý ⇒ ván hoà |
| **Xin đi lại** | Có (trong 30 giây) | Đồng ý ⇒ bàn cờ lùi về trước nước gần nhất của người xin |

Khi ván kết thúc, người chơi thấy **màn kết quả** (thắng / thua / hoà / gián đoạn và **vì sao**), có thể **tái đấu** (ván mới, đổi màu quân), hoặc để phòng **tự đóng sau 10 phút**. Mỗi người xem lại được **lịch sử các ván của chính mình**, đi lại từng nước.

## 2. BỐI CẢNH — VÌ SAO EPIC NÀY TỒN TẠI

- Yêu cầu **R13** (đầu hàng, xin hoà, xin đi lại có chấp nhận, không hoàn thời gian) và **R14** (tái đấu đổi bên, lịch sử và xem lại) trong phạm vi đồ án.
- Lần xây trước dự án **đã hỏng đúng ở chỗ này**. Mỗi lỗi dưới đây đều có ca kiểm thử riêng trong Epic:

| Mã lỗi cũ | Chuyện gì đã xảy ra | Ca kiểm chặn |
|---|---|---|
| `F-01` | Đi lại xong, đi một nước mới ⇒ lỗi trùng khoá DB ⇒ **lỗi 500**, ván kẹt | QA12.1.2-05 |
| `F-02` | Đếm "lặp 3 lần" tính cả những nước đã bị đi lại ⇒ **báo hoà sai** | QA12.1.2-06 |
| `F-20` | Không có bộ đếm hết hạn đề nghị 30 giây; không có bộ đếm đóng phòng 10 phút; không xoá mốc kết thúc khi tái đấu ⇒ **đóng nhầm phòng đang đánh** | QA12.1.1-06, QA12.3.1-15, QA12.3.1-16 |
| (phát lại) | Màn xem lại hiện cả nhánh đã bị đi lại ⇒ người xem **hiểu sai diễn biến ván** | QA12.2.1-08 |

## 3. KHÁI NIỆM CẦN HIỂU TRƯỚC KHI LÀM (dành cho người mới)

| Khái niệm | Giải thích dễ hiểu |
|---|---|
| **Nửa nước (ply)** | Mỗi lần **một bên** di chuyển = 1 nửa nước. ĐỎ đi rồi ĐEN đáp = 2 nửa nước |
| **Cây nước đi** | Nước đi được lưu như cây gia phả: mỗi nước có "nước cha" (`parent_move_id`). Đi lại **không xoá** nước nào, chỉ dời con trỏ `head_move_id` về nước cha. Đi nước mới sau đó tạo ra **nhánh** mới cùng cha |
| **Nhánh hiệu lực** | Đường đi từ nước đầu tiên tới `head_move_id` hiện tại. Nhánh bị bỏ vẫn nằm trong DB nhưng **không** được tính (không tính lặp, không hiện khi xem lại) |
| **version** | Số của ván, **tăng 1** mỗi khi trạng thái ván đổi (đi nước, tạo đề nghị, từ chối, đi lại…). Client gửi kèm `expectedVersion` để máy chủ biết client đang nhìn trạng thái nào. **Đi lại làm ply giảm nhưng version vẫn tăng** |
| **Đề nghị (proposal)** | Gọi chung "xin hoà" và "xin đi lại". Mỗi ván chỉ có **tối đa 1** đề nghị đang chờ |
| **Đường xử lý lệnh (`CommandPipeline`)** | Khung 11 bước dùng chung cho mọi lệnh ván (xác thực → khoá → biên lai → kiểm version → tính đồng hồ → kiểm luật → áp dụng → kiểm kết thúc → lưu → mở khoá → phát tin). Được làm ở TK10.2.3. Epic này **chỉ viết phần riêng** của từng lệnh, **không** viết lại khung |
| **`finalizeMatch`** | Hàm **duy nhất** được phép kết thúc ván (TK10.3.2). Mọi cách kết thúc (đầu hàng, hoà, hết giờ…) đều gọi hàm này để đảm bảo mỗi ván chỉ kết thúc **một lần** |
| **Biên lai lệnh (receipt)** | Bảng ghi `commandId` đã xử lý. Client gửi lại cùng `commandId` ⇒ máy chủ trả **kết quả cũ**, không làm lại (chống bấm đúp, mạng chập chờn) |
| **Đồng hồ tiêm vào (`Clock`)** | Máy chủ không gọi `Date.now()` trực tiếp mà hỏi đối tượng `Clock`. Nhờ vậy test tua nhanh được thời gian (xem [Sổ tay kiểm thử §8](../04-HUONG-DAN-KIEM-THU.md)) |
| **SQL thuần vs Prisma** | Lệnh cần **khoá dòng DB** (đầu hàng, đề nghị, đi lại, tái đấu, đóng phòng) viết bằng **SQL thuần**. Chỉ **đọc** (lịch sử, xem lại) mới dùng Prisma |

## 4. PHẠM VI

**✅ LÀM trong Epic này**
- Lệnh đầu hàng; cơ chế đề nghị (tạo, trả lời, rút, tự hết hạn 30 giây); đi lại trên cây nước.
- Thanh thao tác 3 nút, hộp xác nhận đầu hàng, khung đề nghị có đếm ngược.
- API lịch sử ván (phân trang, riêng tư) và API xem lại (chỉ nhánh hiệu lực).
- Trang `/history` và trang xem lại.
- Tái đấu đổi bên; bộ đếm tự đóng phòng 10 phút; màn kết quả ván.

**❌ KHÔNG LÀM trong Epic này**
| Việc | Ở đâu |
|---|---|
| Đi lại khi chơi với **máy** (không cần đồng ý) | EP15 — TK15.2.1 dùng lại `applyUndo` của Epic này |
| Bộ đếm hết giờ của đồng hồ ván | EP11 — TK11.1.1 |
| Hàm `finalizeMatch`, khung `CommandPipeline` | EP10 — TK10.3.2, TK10.2.3 |
| Hàm đóng phòng (thu hồi thành viên, lời mời, chat, media) | EP08 — TK08.3.1 (Epic này **gọi lại**) |
| Tra lịch sử theo username của người khác | ⛔ **Cấm làm** (quy tắc riêng tư `BR-HIS-13`) |
| Trình biên tập cây biến thể | ⛔ Ngoài phạm vi — xem lại chỉ một nhánh |

## 5. QUY TẮC NGHIỆP VỤ DÙNG CHUNG (mọi Task trong Epic phải tuân theo)

### 5.1 Đường lệnh
Đầu hàng, tạo/trả lời/rút đề nghị, đi lại, tái đấu đều chạy qua `CommandPipeline` (SQL thuần). **Thứ tự khoá luôn là: phòng → người dùng (theo id tăng dần) → ván.** Đảo thứ tự = kẹt khoá chéo (deadlock). **Không** giữ khoá trong lúc gọi dịch vụ ngoài.

### 5.2 Đề nghị (xin hoà / xin đi lại)
| Mã luật | Quy tắc | Ví dụ |
|---|---|---|
| `BR-ACT-02` | Xin hoà **chỉ có ở ván online**, ván với máy **không có** | Ván với máy gửi lệnh xin hoà ⇒ `VALIDATION_ERROR`, giao diện ẩn nút |
| `BR-ACT-04` | Mỗi ván tối đa **1** đề nghị đang chờ (hoà và đi lại dùng chung) | A đang xin hoà, B xin đi lại ⇒ `PROPOSAL_PENDING` |
| `BR-ACT-05` | Hết hạn sau **30 giây**, máy chủ **tự** chuyển `EXPIRED` (không chờ ai gửi lệnh) | Tạo lúc 10:00:00, đúng 10:00:30 hết hạn |
| `BR-ACT-06` | Mỗi người tối đa **1 đề nghị / 10 giây** | A xin hoà, B từ chối ngay, A xin lại sau 4 giây ⇒ `RATE_LIMITED` |
| `BR-ACT-07` | **Không** tự đồng ý đề nghị của mình | A xin hoà rồi A gửi "đồng ý" ⇒ `FORBIDDEN` |
| `BR-ACT-08` | **Nước đi mới** làm đề nghị đang chờ **mất hiệu lực** | — |
| `BR-ACT-14` | Xin đi lại: người xin phải **đã đi ít nhất 1 nước** trên nhánh hiện tại | ĐEN chưa đi nước nào xin đi lại ⇒ từ chối |
| `BR-ACT-16` | Đề nghị đang chờ **không dừng** đồng hồ | Chờ 30 giây ⇒ bên đến lượt mất 30 giây |
| `BR-ACT-17` | Trả lời lặp lại chỉ cho **1** kết quả | Bấm "Đồng ý" 2 lần ⇒ 1 lần hoà |
| `BR-ACT-18` | Người xem **thấy** đề nghị và kết quả nhưng **không** trả lời được | — |
| ALT-2 | Người xin **rút** đề nghị trước khi đối thủ trả lời ⇒ đề nghị huỷ | — |

### 5.3 Đi lại
| Mã luật | Quy tắc |
|---|---|
| `BR-ACT-03` | Lùi về **ngay trước nước gần nhất của người xin**: đối thủ **chưa** đáp ⇒ lùi **1** nửa nước; **đã** đáp ⇒ lùi **2** |
| `BR-ACT-09` | **Không hoàn thời gian** đã dùng |
| `BR-ACT-10` | `version` **tăng** dù `ply` giảm |
| `BR-ACT-11` | Bộ đếm lặp **dựng lại từ nhánh mới**; nhánh bỏ không tính |
| `BR-ACT-12` | Nước bị đi lại **vẫn còn** trong DB |
| `BR-ACT-13` | Ván đã kết thúc **không** đi lại được |

### 5.4 Lịch sử và xem lại
| Mã luật | Quy tắc |
|---|---|
| `BR-HIS-12` | Lịch sử ván **chỉ người chơi của ván đó** xem được |
| `BR-HIS-13` | **Không** có cách tra lịch sử theo username |
| `BR-HIS-14` | Người xem chỉ xem lại **ván hiện tại** của phòng khi còn ở trong phòng |
| `BR-HIS-15` | Xem lại **chỉ nhánh hiệu lực cuối cùng** |
| `BR-HIS-16` | Ván có đi lại phải có **nhãn "Ván này có đi lại"** |
| `BR-HIS-17` | Bàn cờ khi xem lại **chỉ đọc** |
| `BR-HIS-18` | Lịch sử **không bị sửa** sau khi ván kết thúc |
| `BR-HIS-19` | Mỗi trang tối đa **20** ván, mới nhất trước |

### 5.5 Tái đấu và đóng phòng
| Mã luật | Quy tắc |
|---|---|
| `BR-HIS-01..04` | Cần **cả hai** đồng ý ⇒ **ván mới**, **đổi bên** (ĐỎ↔ĐEN), **giữ** cấu hình thời gian |
| `BR-HIS-05` | Chỉ nhận tái đấu nếu **sau khi khoá phòng**, `now < finished_at + 10 phút`. Đúng hạn hoặc sau hạn ⇒ `ROOM_CLOSED` |
| `BR-HIS-06` | Tái đấu **huỷ** bộ đếm đóng phòng (xoá `finished_at`) |
| `BR-HIS-07` | **Giữ** người xem còn quyền |
| `BR-HIS-08` | Ván mới có **2 kênh chat mới, trống**; camera/mic **về Tắt** |
| `BR-HIS-09` | Hai người bấm **cùng lúc** ⇒ **đúng một** ván mới |
| `BR-HIS-10` | Lệnh tái đấu cho **ván cũ** sau khi ván mới đã có ⇒ `CONFLICT` |
| `BR-HIS-11` | Ván **gián đoạn** tái đấu được (nhưng không chơi tiếp ván cũ) |
| `BR-ROOM-12/13` | Không tái đấu ⇒ phòng **tự đóng** đúng 10 phút sau khi ván kết thúc; lịch sử ván **giữ lại** |

## 6. ĐẦU VÀO — EPIC KHÁC PHẢI XONG TRƯỚC

| Cần gì | Từ Task | Để làm gì |
|---|---|---|
| `CommandPipeline` + biên lai lệnh | TK10.2.3 | Mọi lệnh trong Epic chạy qua đây |
| Lệnh đi nước + cây nước `head_move_id` | TK10.3.1 | Đi lại dời head; nước mới làm đề nghị mất hiệu lực |
| `finalizeMatch` | TK10.3.2 | Kết thúc ván khi đầu hàng / đồng ý hoà |
| Snapshot ván | TK10.3.3 | API xem lại và giao diện đọc trạng thái |
| Màn phòng chơi + store Zustand | TK10.4.1 | Nơi gắn thanh thao tác, màn kết quả |
| Đồng hồ + bộ đếm hết giờ | TK11.1.1 | Tính đồng hồ khi đi lại; race đầu hàng vs hết giờ |
| Hàm đóng phòng | TK08.3.1 | Bộ đếm 10 phút gọi lại |
| Thiết kế màn | TK02.3.1, TK02.4.1 | Giao diện theo bản thiết kế |

## 7. DANH SÁCH STORY

| Story | Tên | Sprint | SP | Vai trò |
|---|---|---|---|---|
| [ST12.1](../story/ST12.1-dau-hang-xin-hoa-di-lai-di-lai-tren-cay-nuoc-thanh-thao-tac.md) | Đầu hàng, xin hoà/đi lại, đi lại trên cây nước, thanh thao tác | 4 | 5 | BE, FE, QA |
| [ST12.2](../story/ST12.2-lich-su-van-rieng-tu-va-xem-lai-theo-nhanh-hieu-luc.md) | Lịch sử ván riêng tư và xem lại theo nhánh hiệu lực | 3 | 3 | BE, FE |
| [ST12.3](../story/ST12.3-tai-dau-doi-ben-dong-phong-10-phut-man-ket-qua.md) | Tái đấu đổi bên, đóng phòng 10 phút, màn kết quả | 4 | 3 | BE, FE |

ST12.2 **song song** được với ST12.1 và ST12.3 (không dùng đầu ra của nhau). ST12.1 và ST12.3 cũng song song; chỉ gặp nhau ở màn phòng chơi.

## 8. TIÊU CHÍ HOÀN THÀNH EPIC (Definition of Done)

Epic chỉ được chuyển **Done** khi **tất cả** ô dưới đây đạt:

- [ ] 3 Story Done (mọi Task Done, Tester đã PASS và có báo cáo `docs/test-reports/TK12.*.md`).
- [ ] Test tự động xanh, **0 skipped**: `issue-104`, `105`, `106`, `125`, `126`, `127`, `128` (integration) và `issue-107`, `129` (e2e, cả desktop lẫn mobile).
- [ ] Ba lỗi cũ `F-01`, `F-02`, `F-20` có ca kiểm riêng và PASS.
- [ ] Mọi ca "giả mạo" (người xem / người ngoài gửi lệnh thẳng lên máy chủ) đều bị từ chối và **DB không đổi**.
- [ ] Mọi ca "đồng thời" chạy bằng rào đồng bộ + 2 kết nối DB, cho đúng **1** kết quả.
- [ ] **Demo cuối Epic** chạy trọn trên máy local (mục 9) trước nhóm.

## 9. KỊCH BẢN DEMO CUỐI EPIC (~10 phút)

1. A (ĐỎ) và B (ĐEN) đánh 4 nửa nước. A xin đi lại → B đồng ý → bàn lùi 2 nửa nước ở cả A, B, S1.
2. A đi một nước khác (tạo nhánh mới) → thành công.
3. B xin hoà → A **không trả lời** → sau 30 giây khung tự biến mất.
4. A bấm Đầu hàng → hộp xác nhận "Bạn sẽ THUA ván này ngay lập tức." → Đầu hàng → màn kết quả: B "Bạn thắng!", A "Bạn thua", lý do "Đầu hàng", đếm ngược "Phòng đóng sau 09:5x".
5. Cả hai bấm Tái đấu → ván mới, A cầm ĐEN, B cầm ĐỎ, chat trống.
6. A mở `/history` → thấy ván cũ, nhãn "Có đi lại" → xem lại chỉ thấy nhánh hiệu lực.

## 10. RỦI RO VÀ CÁCH GIẢM

| Rủi ro | Khả năng | Ảnh hưởng | Cách giảm |
|---|---|---|---|
| Epic nằm cuối Sprint 4, chỉ có 3 ngày; phụ thuộc EP10/EP11 trễ | Cao | Cao | Bắt đầu TK12.2.1 (chỉ cần snapshot) sớm nhất; BE viết test integration trước khi FE xong |
| Viết nhầm lệnh sang Prisma ⇒ mất khoá dòng ⇒ tranh chấp | Trung bình | Cao | Review PR kiểm: file service lệnh chỉ dùng `withTransaction` + SQL; ca race bắt buộc |
| Bộ đếm (30 giây, 10 phút) chạy trễ hoặc đóng nhầm phòng | Trung bình | Cao | Kiểm lại dưới khoá (4 điều kiện); test biên −1 ms / 0 / +1 ms bằng đồng hồ giả |
| Đi lại tính sai đồng hồ (hoàn giờ) | Trung bình | Trung bình | Ca QA12.1.2-07 so số dư trước/sau |
| Tester chưa quen gửi request giả mạo | Cao | Trung bình | Sổ tay kiểm thử §5 có lệnh copy được; Dev BE ngồi cùng Tester 15 phút ở ca đầu |
