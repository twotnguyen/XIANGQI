# ONBOARDING — LỘ TRÌNH ĐỌC THEO VAI TRÒ

**Cập nhật:** 2026-09-22 · **Dành cho:** thành viên mới vào dự án Cờ Tướng Online

> Muốn hiểu đầy đủ, đọc theo [lộ trình tuần tự](README.md#đọc-từ-đầu-tới-cuối). Muốn bắt đầu theo vai trò, đọc **Bộ lõi** (§1), rồi **vai trò của bạn** (§2). Không cần đọc tuần tự mọi issue trước khi hiểu sản phẩm.

---

## 0. CHỌN ĐƯỜNG CỦA BẠN

| Bạn là | Vào mục | Tổng thời gian |
|---|---|---|
| 🎨 Lập trình viên giao diện | §1 + **§2.1** | ~3 giờ |
| ⚙️ Lập trình viên máy chủ | §1 + **§2.2** | ~4 giờ |
| 🧪 Kiểm thử / QA | §1 + **§2.3** | ~3 giờ |
| 📋 Quản lý / chủ nhiệm / người chấm | §1 + **§2.4** | ~2 giờ |
| 🚀 Triển khai / vận hành | §1 + **§2.5** | ~1,5 giờ |
| 🤖 Agent viết mã | **§2.6** | ~1 giờ |
| 🎮 Chỉ muốn biết sản phẩm là gì | Chỉ đọc mục 1–2 của §1 | ~20 phút |

---

## 1. BỘ LÕI — MỌI NGƯỜI ĐỀU ĐỌC

**~1 giờ.** Đọc **đúng thứ tự này**, không đảo.

| # | File | Dòng | Sau khi đọc bạn biết |
|---|---|---|---|
| 1 | [00-overview/product-overview.md](00-overview/product-overview.md) | — | Sản phẩm là gì, giải quyết vấn đề gì cho ai |
| 2 | ⭐ [00-overview/glossary.md](00-overview/glossary.md) | — | Thuật ngữ thống nhất toàn dự án |
| 3 | [00-overview/actors.md](00-overview/actors.md) | — | Ai làm được gì |
| 4 | [00-overview/scope.md](00-overview/scope.md) | — | Cái gì làm, cái gì **cố ý không làm** |
| 5 | ⭐ [04-business-rules/game-rules.md](04-business-rules/game-rules.md) **§1** | — | **Hệ toạ độ** |

### Vì sao hai file ⭐ không được bỏ

**Glossary** — dự án có một cặp từ cực dễ nhầm:

| | `SPECTATOR` | `WATCH` |
|---|---|---|
| Là gì | **Vai trò** của thành viên trong phòng | **Loại quyền** của lời mời / mã / link |
| Cặp đối xứng | `PLAYER` | `PLAY` |

Dùng mã `WATCH` để vào phòng ⇒ **trở thành** `SPECTATOR`. ⛔ Không có "vé SPECTATOR", không có "vai trò WATCH".

**Hệ toạ độ** — nền của mọi luật cờ:

```
ĐEN ở TRÊN (y=0)  ·  ĐỎ ở DƯỚI (y=9)  ·  y tăng từ trên xuống
x: 0→8 trái sang phải   ·   Sông: giữa y=4 và y=5
Chỉ số mảng: y*9+x (90 phần tử)   ·   ĐỎ đi trước
```

⚠ Mã nguồn lần xây trước đã **đảo ngược** hệ này. Nhớ sai chỗ này là code sai toàn bộ luật cờ.

### ✅ Tự kiểm tra sau Bộ lõi

Trả lời được **hết** thì đi tiếp. Không thì đọc lại.

```
□ Phòng tối đa bao nhiêu người? Chia thế nào?
□ SPECTATOR khác WATCH ở chỗ nào?
□ Quân đỏ ở phía trên hay phía dưới bàn cờ?
□ Tốt đỏ "đã qua sông" nghĩa là y lớn hơn hay nhỏ hơn 5?
□ Hệ thống có hỗ trợ chơi khi chưa đăng nhập không?
□ Hết nước đi thì hoà hay thua?
```

<details>
<summary>Đáp án</summary>

- **7 người** — 2 người chơi + tối đa 5 người xem
- `SPECTATOR` là **vai trò** trong phòng · `WATCH` là **loại quyền** của tấm vé vào phòng
- Quân **đỏ ở phía dưới** (`y = 9`)
- Tốt đỏ qua sông khi **`y ≤ 4`** (đỏ đi từ dưới lên, `y` giảm dần)
- **Không.** Không hỗ trợ khách (`DEC-006`) — phải đăng ký
- **THUA** (`DEC-019`) — khác cờ vua

</details>

---

## 2. LỘ TRÌNH THEO VAI TRÒ

### 2.1 — 🎨 Lập trình viên giao diện

**~2 giờ sau Bộ lõi.**

| # | File | Đọc để làm gì |
|---|---|---|
| 1 | [03-screens/screen-inventory.md](03-screens/screen-inventory.md) | Danh mục màn hình hiện hành, mỗi màn có **5 trạng thái bắt buộc** |
| 2 | [03-screens/design-tokens.md](03-screens/design-tokens.md) | Màu · khoảng cách · chữ — mục tiêu WCAG 2.1 AA cần kiểm trên giao diện thật |
| 3 | [02-flows/](02-flows/) — 9 file | Người dùng đi qua những bước nào, **kể cả nhánh lỗi** |
| 4 | [04-business-rules/permissions.md](04-business-rules/permissions.md) | Cái gì được hiện cho ai |
| 5 | [05-data-and-realtime/session-state.md](05-data-and-realtime/session-state.md) | Nhiều tab · mất mạng · khôi phục |
| 6 | Các `REQ-*` mục **11, 12, 13** | Màn hình liên quan · trạng thái · hành vi realtime |

**Ba điều dễ làm sai nhất:**

| Điều | Ở đâu |
|---|---|
| ⛔ **Không** lọc dữ liệu ở giao diện. Không có quyền ⇒ **máy chủ không gửi**, không phải nhận rồi ẩn | `permissions` |
| ⭐ **`DT-21`** — hai màu quân tương phản chỉ **2.17:1**, bắt buộc có **dấu hiệu ngoài màu sắc** | `design-tokens` |
| ⭐ Lật bàn **chỉ là hiển thị**. Toạ độ gửi lên máy chủ **không đổi** theo góc nhìn | `GR-COORD-01` |

**Bắt tay làm:** nhóm **E10** (issue 078–083, bàn cờ SVG) trong [10-issues/INDEX.md](10-issues/INDEX.md).

---

### 2.2 — ⚙️ Lập trình viên máy chủ

**~3 giờ sau Bộ lõi.**

| # | File | Đọc để làm gì |
|---|---|---|
| 1 | ⭐ [09-technical/tech-stack.md](09-technical/tech-stack.md) **§3** | **Ranh giới Prisma / SQL thuần** — đọc trước mọi thứ khác |
| 2 | [09-technical/architecture.md](09-technical/architecture.md) | 16 bất biến `ARCH-01..16` |
| 3 | [05-data-and-realtime/data-model.md](05-data-and-realtime/data-model.md) | Bảng · khoá · ràng buộc |
| 4 | [05-data-and-realtime/data-flows.md](05-data-and-realtime/data-flows.md) | Luồng xử lý lệnh · **thứ tự khoá** |
| 5 | [05-data-and-realtime/state-machines.md](05-data-and-realtime/state-machines.md) | Máy trạng thái phòng · ván · kết nối |
| 6 | [04-business-rules/business-rules.md](04-business-rules/business-rules.md) | Chỉ mục luật và nguồn định nghĩa |
| 7 | [04-business-rules/permissions.md](04-business-rules/permissions.md) | Ma trận quyền + **10 điều không ai được làm** |
| 8 | [04-business-rules/game-rules.md](04-business-rules/game-rules.md) | Đọc **hết**, không chỉ §1 |

**Năm điều phải thuộc:**

```
① Máy chủ quyết định. Client chỉ gửi Ý ĐỊNH
② Cần KHOÁ DÒNG / THỨ TỰ KHOÁ / ĐẾM-RỒI-GHI  ⇒  SQL THUẦN, không Prisma
③ Thứ tự khoá LUÔN là: phòng → người → ván
④ ⛔ KHÔNG giữ khoá khi đang gọi ra ngoài (máy cờ, email, media)
⑤ ⛔ KHÔNG BAO GIỜ chạy prisma migrate — nó xoá RLS và CHECK constraint
```

**Bắt tay làm:** nhóm **E04** (issue 034–045, cơ sở dữ liệu) trong [10-issues/INDEX.md](10-issues/INDEX.md).

---

### 2.3 — 🧪 Kiểm thử / QA

**~2 giờ sau Bộ lõi.**

| # | File | Đọc để làm gì |
|---|---|---|
| 1 | [06-acceptance/acceptance-criteria.md](06-acceptance/acceptance-criteria.md) | Tiêu chí theo registry hiện hành + **6 quy tắc báo cáo trung thực** |
| 2 | [06-acceptance/test-scenarios.md](06-acceptance/test-scenarios.md) | **~120 kịch bản**, có kịch bản xương sống 16 bước |
| 3 | [04-business-rules/game-rules.md](04-business-rules/game-rules.md) | Đọc **hết** — QA phải biết luật hơn cả dev |
| 4 | [04-business-rules/permissions.md](04-business-rules/permissions.md) | Mọi ô ❌ đều phải có test |
| 5 | [06-acceptance/traceability-matrix.md](06-acceptance/traceability-matrix.md) | Yêu cầu → luồng → màn hình → luật → test |
| 6 | [10-issues/WORKFLOW.md](10-issues/WORKFLOW.md) §4, §5 | **7 luật viết test** + mẫu báo cáo bằng chứng |

**Bảy luật viết test — thuộc lòng:**

| # | Luật |
|---|---|
| 1 | **Thời gian**: đồng hồ giả **tiêm vào**, ⛔ không `sleep` thật |
| 2 | **Dữ liệu**: PostgreSQL **thật**, ⛔ không mock |
| 3 | **Tranh chấp**: rào đồng bộ + **2 kết nối riêng** |
| 4 | **Quyền**: **giả mạo dữ liệu gửi thẳng lên máy chủ** — kiểm nút bị mờ là CHƯA ĐỦ |
| 5 | **Media**: đo **byte RTP thật**, ⛔ không assert object tự tạo |
| 6 | ⛔ Cấm `.only`. Cột `Skip` phải là **0** |
| 7 | ⭐ **Test phải BẮT được lỗi** — viết xong, cố tình phá mã, test phải đỏ |

> **Luật 7 quan trọng nhất.** Test luôn xanh dù mã sai là test vô dụng.

**Bắt tay làm:** [10-issues/ISSUE-136.md](10-issues/ISSUE-136.md) cho biết đích đến cuối cùng của QA.

---

### 2.4 — 📋 Quản lý / chủ nhiệm / người chấm

**~1 giờ sau Bộ lõi.**

| # | File | Đọc để làm gì |
|---|---|---|
| 1 | [01-requirements/README.md](01-requirements/README.md) | Mục lục **19 yêu cầu R01–R19** + sơ đồ liên quan |
| 2 | ⭐ [07-decisions/decision-log.md](07-decisions/decision-log.md) | Quyết định và phần đã được thay thế |
| 3 | [08-ba-review/final-audit-2026-09-22.md](08-ba-review/final-audit-2026-09-22.md) | Kết quả kiểm chất lượng tài liệu |
| 4 | [10-issues/README.md](10-issues/README.md) | Bản đồ **138 đầu việc**, 20 nhóm |
| 5 | [10-issues/INDEX.md](10-issues/INDEX.md) | Trạng thái từng việc |

**Ba yêu cầu mới phát sinh từ đợt audit** — tài liệu cũ **không có**:

| ID | Tên | Lỗ hổng nó vá |
|---|---|---|
| **R17** | Chống treo ván | Ván không giới hạn giờ ⇒ người online nhưng không đi ⇒ **ván treo vô hạn** |
| **R18** | Đuổi người xem | Tài liệu cũ nhắc "kick viewer" 2 lần nhưng **không có chức năng** |
| **R19** | Hộp thư lời mời | Lời mời hết hạn 10 phút ⇒ bạn không online thì **không bao giờ biết** |

**Hai cổng chặn** — hai câu hỏi chưa có đáp án, phải đo thật:

| Cổng | Câu hỏi | Ngưỡng |
|---|---|---|
| [ISSUE-032](10-issues/ISSUE-032.md) | TypeScript tính nổi **độ sâu 6** trong 3 giây? | p95 < 3000 ms, 20 thế × 5 lần |
| [ISSUE-112](10-issues/ISSUE-112.md) | LiveKit truyền được **gói tin thật**? | byte RTP > 0 **và** khung hình > 0 |

---

### 2.5 — 🚀 Triển khai / vận hành

**~30 phút sau Bộ lõi.**

| # | File | Đọc để làm gì |
|---|---|---|
| 1 | [09-technical/deployment.md](09-technical/deployment.md) | Bản đồ triển khai |
| 2 | [09-technical/tech-stack.md](09-technical/tech-stack.md) | Công nghệ đã chốt |
| 3 | ⭐ [10-issues/EXTERNAL-SETUP.md](10-issues/EXTERNAL-SETUP.md) | **Cách xin từng tài nguyên bên ngoài** |
| 4 | [10-issues/ISSUE-137.md](10-issues/ISSUE-137.md) | Checklist triển khai thật |

**Bản đồ chạy ở đâu:**

| Thành phần | Nơi chạy |
|---|---|
| Giao diện | Vercel (tĩnh) |
| Máy chủ + thời gian thực | Render — **phải luôn bật** |
| Máy cờ | Render — ⭐ **tiến trình RIÊNG** |
| Cơ sở dữ liệu | Supabase |
| Camera / mic | LiveKit Cloud |

**Ba cạm bẫy đắt nhất:**

```
⛔ Gói miễn phí Render NGỦ sau ~15 phút → đứt kết nối giữa ván
⛔ Máy cờ chạy chung tiến trình máy chủ → treo MỌI người chơi 3 giây
⛔ Khoá bí mật đặt vào biến VITE_* → LỘ RA GIAO DIỆN, ai cũng đọc được
```

Chi tiết + cách xử lý: `EXTERNAL-SETUP.md` §4 và §9.

---

### 2.6 — 🤖 Agent viết mã

**~1 giờ. Thay thế cả Bộ lõi** — file `AGENTS.md` đã gói sẵn phần cần thiết.

| # | File | Bắt buộc |
|---|---|---|
| 1 | ⭐ [../AGENTS.md](../AGENTS.md) | **Đọc HẾT trước khi chạm file nào** |
| 2 | [00-overview/glossary.md](00-overview/glossary.md) | ✅ |
| 3 | [04-business-rules/game-rules.md](04-business-rules/game-rules.md) §1 | ✅ |
| 4 | [09-technical/tech-stack.md](09-technical/tech-stack.md) §3 | ✅ |
| 5 | [10-issues/WORKFLOW.md](10-issues/WORKFLOW.md) | ✅ |
| 6 | [10-issues/README.md](10-issues/README.md) | ✅ |

**Bắt tay làm:** mở [10-issues/INDEX.md](10-issues/INDEX.md), chọn issue `TODO` đầu tiên có **mọi phụ thuộc đã `DONE`**.

---

## 3. TÀI LIỆU TRA CỨU — KHÔNG ĐỌC MỘT LƯỢT

Mở **đúng file khi cần**, đừng đọc tuần tự:

| Thư mục | Dùng khi |
|---|---|
| [01-requirements/](01-requirements/) — 16 file `REQ-*` | Làm đúng chức năng nào thì mở file đó. Mỗi file có **15 mục** cố định |
| [02-flows/](02-flows/) — 9 file `FLOW-*` | Cần biết thứ tự bước + nhánh lỗi của một luồng |
| [10-issues/](10-issues/) — 138 file `ISSUE-*` | Chỉ mở issue mình đang làm |

---

## 4. ⛔ KHÔNG CẦN ĐỌC ĐỂ HIỂU DỰ ÁN

| Thư mục / file | Vì sao bỏ qua |
|---|---|
| `08-ba-review/` | Đọc README để phân biệt báo cáo/backlog hiện hành với snapshot lịch sử; chỉ đặc tả và DEC hiện hành dùng triển khai |
| `07-decisions/interview-log.md` | Biên bản phỏng vấn thô. Kết luận đã gom vào `decision-log.md` |
| `99-archive/` | **Lịch sử** lần xây trước. ⛔ Không dùng làm căn cứ triển khai, ⛔ không xoá |

**Ngoại lệ đáng đọc:** [99-archive/reviews-v1/](99-archive/reviews-v1/) — **30 lỗi thật** của lần xây trước. Đọc nếu muốn hiểu vì sao đặc tả khắt khe đến vậy. Cả 30 lỗi đã được gắn vào mục **"⚠ CẠM BẪY"** ở cuối từng issue sẽ gặp chúng.

---

## 5. BA QUY TẮC ĐỌC TÀI LIỆU

| # | Quy tắc |
|---|---|
| **1** | `01-requirements/` nói **CÁI GÌ** · `09-technical/` nói **BẰNG GÌ**. Thấy tên thư viện trong `01-` ⇒ **lỗi tài liệu, báo ngay** |
| **2** | Mỗi luật chỉ có **một** chỗ định nghĩa. Chỗ khác chỉ **liên kết tới**. Thấy cùng một luật ghi khác nhau ở hai nơi ⇒ **lỗi, báo ngay** |
| **3** | `99-archive/` là **lịch sử**, không phải yêu cầu |

---

## 6. BẠN VẪN CÒN THẮC MẮC

| Câu hỏi kiểu | Tìm ở |
|---|---|
| *"Chức năng X hoạt động ra sao?"* | `01-requirements/REQ-*.md` |
| *"Vì sao lại quyết như vậy?"* | `07-decisions/decision-log.md` — quyết định kèm lý do |
| *"Màn hình này có trạng thái nào?"* | `03-screens/screen-inventory.md` |
| *"Ai được phép làm gì?"* | `04-business-rules/permissions.md` |
| *"Thế nào là đạt?"* | `06-acceptance/acceptance-criteria.md` |
| *"Tôi phải làm gì tiếp theo?"* | `10-issues/INDEX.md` |

**Không tìm thấy câu trả lời?** Đó là **lỗ hổng tài liệu** — ⛔ **đừng tự đoán**, hãy báo. Quyết định mới phải ghi căn cứ/thẩm quyền và đồng bộ nguồn liên quan.

## Bàn giao bộ issue cho agent

Đọc [AGENT-START-HERE](10-issues/AGENT-START-HERE.md) để có prompt giao việc, [EXECUTION-ORDER](10-issues/EXECUTION-ORDER.md) để chọn dependency hợp lệ, [TEST-CONVENTIONS](10-issues/TEST-CONVENTIONS.md) để dựng test và [AC-COVERAGE](10-issues/AC-COVERAGE.md) để đối chiếu nghiệm thu. Dùng [mẫu báo cáo](10-issues/TEST-REPORT-TEMPLATE.md), không ghi DONE khi chỉ hoàn tất kế hoạch.
