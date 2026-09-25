# CÔNG NGHỆ CHÍNH THỨC

**ID:** `TECH` · **Trạng thái:** v2 — **đã chốt** · **Cập nhật:** 2026-09-21
**Căn cứ:** **`DEC-025`** · Câu 2, 4, 5, 6, 20 phỏng vấn

> Đây là **quyết định**, không còn là đề xuất. Muốn đổi phải có `DEC` mới.

---

## 1. BẢNG CHỐT

| Lớp | Chọn | Ghi chú |
|---|---|---|
| **Ngôn ngữ** | **TypeScript toàn bộ** | Chế độ nghiêm ngặt |
| Runtime | **Node.js 24 LTS** | |
| Kho mã | **pnpm workspace** | Bắt buộc — để chia sẻ gói luật cờ |
| Giao diện | React + Vite + React Router | Không SSR |
| Trạng thái | TanStack Query + Zustand | Query cho đọc HTTP, Zustand cho ván realtime |
| CSS | **Tokens toàn cục + CSS Modules** | |
| Bàn cờ | **SVG** | |
| Icon / thông báo | lucide-react + sonner | |
| Máy chủ | **NestJS** | |
| Thời gian thực | **Socket.IO** qua `@nestjs/websockets` | |
| Cơ sở dữ liệu | **Supabase PostgreSQL** | |
| Truy cập dữ liệu | **Prisma lai** (`TECH-07`) | |
| Migration | **Supabase CLI `.sql`** | Prisma **không** migrate |
| Xác thực | Supabase Auth | |
| Camera/mic | **LiveKit** | |
| AI | TypeScript, **tiến trình riêng** | |
| Kiểm thử | **Vitest** + Playwright | |

**Không dùng ở bản đầu:** Redis · BullMQ · Prometheus · Swagger · i18next · SSR/Next.js · Tailwind · Prisma migrate.

---

## 2. BA MỤC TIÊU CỦA PRODUCT OWNER

### 2.1 Giao diện đẹp

**Bàn cờ vẽ bằng SVG**, không dùng canvas và không dùng ảnh:

| Vì sao | |
|---|---|
| Nét ở mọi kích thước | Từ 360 px tới 1920 px đều sắc |
| Mỗi quân là một phần tử riêng | Gắn được **nhãn trợ năng tiếng Việt** (`DT-04`) |
| Di chuyển mượt | Chuyển động bằng `transform` |
| Bắt sự kiện chạm chính xác | Vùng chạm từng giao điểm không chồng lấn (`DT-07`) |

**Mặt gỗ dùng dải màu CSS, không dùng ảnh nền** — nhẹ, không phụ thuộc giấy phép ảnh, đổi sắc độ được cho chế độ tương phản cao.

**Chuyển động nước đi:** `transform: translate()` kèm `transition` khoảng **150–200 ms**. Đủ để mắt theo kịp, không làm người chơi sốt ruột. Phải tôn trọng `prefers-reduced-motion`.

**Không dùng thư viện giao diện dựng sẵn** (Material, Ant, Chakra). Chúng mang ngôn ngữ thị giác hiện đại, **chống lại** định hướng cờ tướng truyền thống đã chốt ở Câu 19. Bảng màu và khoảng cách đã có sẵn trong [design-tokens](../03-screens/design-tokens.md) — là mục tiêu thiết kế; nghiệm thu WCAG AA cần số đo và kiểm UI thực ở ISSUE-131, không suy từ bảng màu.

**CSS Modules thay vì CSS thuần:** phòng chơi có nhiều thành phần chồng nhau (bàn cờ · hai khung chat · media · danh sách người xem · nhiều hộp thoại). CSS thuần dễ **đụng tên lớp**. Tokens vẫn để ở file toàn cục như dự án tham chiếu đang làm.

**Chữ quân:** font chữ Hán **tự host**; phải lưu giấy phép phù hợp và kiểm khi chọn asset ở ISSUE-079. Không tải từ dịch vụ ngoài (`DT-02`).

### 2.2 Backend xử lý tốt

Mốc là **p95 < 100 ms**. Điểm nghẽn thật **không phải** khung web mà là **thời gian giữ khoá cơ sở dữ liệu**.

| Nguyên tắc | Vì sao |
|---|---|
| **AI ở tiến trình riêng** (`TECH-09`) | CPU search trong event loop chính có thể chặn phục vụ ván khác; tách child theo ARCH-16 |
| **Không giữ khoá khi gọi ra ngoài** (`ARCH-07`) | Giữ khoá ván trong lúc chờ AI hoặc LiveKit ⇒ đứng cả ván đó |
| **Một dịch vụ, hai cổng vào** (`ARCH-14`) | HTTP và Socket.IO gọi **cùng** service. NestJS tách sẵn service khỏi controller/gateway |
| **Kiểm quyền bằng guard** | Chặn trước mọi lệnh, không phải nhớ gắn tay từng chỗ — đúng loại lỗi `F-03` của lần trước |
| **Đồng hồ tiêm vào** | Test thời gian dùng đồng hồ giả, không chờ thật (`AC-INA-16`) |

### 2.3 Lưu trữ dữ liệu tốt

**Supabase là PostgreSQL** — SQL thuần là ngôn ngữ gốc của nó, không phải đường vòng.

| Việc | Công cụ |
|---|---|
| Tạo và sửa schema | **Supabase CLI**, file `.sql` |
| Sinh kiểu dữ liệu cho mã nguồn | **Prisma `db pull`** (chỉ đọc vào) |
| Đọc đơn giản: hồ sơ, bạn bè, lời mời, lịch sử | **Prisma** |
| **Đường xử lý lệnh ván** | **SQL thuần** |

**Vì sao Prisma không quản lý schema:** thiết kế cần RLS · CHECK constraint · index có điều kiện · **unique hoãn kiểm** (để đổi bên khi tái đấu) · khoá ngoại phức hợp · hàm `SECURITY DEFINER`. Prisma **tự cảnh báo** nó không quản lý được RLS và CHECK — thấy rõ trong chính dự án tham chiếu.

---

## 3. `TECH-07` — RANH GIỚI PRISMA / SQL THUẦN

> ⚠ **Đây là ranh giới quan trọng nhất của toàn bộ backend.** Viết nhầm bên là **mất khoá**, dẫn đúng vào loại lỗi tranh chấp mà đặc tả đang phòng.

| Dùng **Prisma** | Dùng **SQL thuần** |
|---|---|
| Hồ sơ, tên hiển thị | **Đi một nước cờ** |
| Bạn bè, lời mời kết bạn | **Đầu hàng · xin hoà · xin đi lại** |
| Lời mời phòng, mã, link | **Nhận người vào phòng** (đếm sức chứa) |
| Lịch sử tin nhắn (đọc, predicate quyền đầy đủ) | **Bắt đầu ván** (hai người sẵn sàng) |
| | **Gửi chat**: kiểm membership/quyền rồi ghi, serialize với thu hồi |
| Lịch sử ván (đọc) | **Tái đấu** (đổi bên) |
| Danh sách sảnh | **Mọi bộ đếm thời hạn** kết thúc ván |
| | **Đuổi người xem / thu hồi quyền** |

Chat send dùng SQL thuần; chat read có thể dùng Prisma khi predicate quyền và context đầy đủ, không tái dùng kết quả quyền cũ sau thu hồi (ROOM-CHAT §5).

**Quy tắc nhận biết:** thao tác nào cần **khoá dòng**, **thứ tự khoá**, hoặc **đếm rồi ghi trong cùng một transaction** ⇒ **SQL thuần**. Còn lại dùng Prisma.

---

## 4. `TECH-08` — CỔNG ĐO AI (bắt buộc)

**Vấn đề:** lần xây dựng trước chỉ benchmark **depth 2**. Ngân sách p95 và đấu 60 ván **chưa đo bao giờ**. Nên câu hỏi *"TypeScript có chạy nổi depth 6 trong 3 giây không"* **vẫn chưa có đáp án**.

**Cổng bắt buộc:** ngay sau khi xong module luật cờ, **trước khi viết phần còn lại của AI**:

| Cấp | Độ sâu | Ngân sách | Phải đạt |
|---|---|---|---|
| Dễ | 2 | 300 ms | p95 trong ngân sách |
| Trung bình | 4 | 1000 ms | p95 trong ngân sách |
| **Khó** | **6** | **3000 ms** | **p95 trong ngân sách** |

Đo **5 lần lặp mỗi thế cờ mỗi cấp** trên bộ 20 thế. Phép đo chuẩn tại [ai-validation](ai-validation.md) (DEC-045): nearest-rank; lần chưa hoàn thành depth mục tiêu là +∞, không dùng thời gian trả fallback để làm p95 đẹp. Bỏ tiêu chí 90% vì yếu hơn p95 depth; không hạ độ sâu/ngân sách. Bộ chất lượng độc lập HARD ≥16/20 và 5/5 tránh lặp.

**Không đạt thì làm theo thứ tự này — không được đảo:**

1. Bỏ cấp phát bộ nhớ trong vòng lặp sinh nước đi (dùng mảng số, không tạo object mỗi nước)
2. Cải thiện sắp xếp thứ tự nước đi
3. Thêm bảng ghi nhớ thế cờ
4. **Chỉ khi cả ba đều không đủ** mới xét đổi ngôn ngữ — và phải đổi **toàn bộ backend + AI**, không làm nửa vời

---

## 5. VÌ SAO KHÔNG CHỌN .NET

.NET đã được cân nhắc như phương án kỹ thuật khác. Chưa có benchmark cùng thuật toán/corpus/phần cứng để khẳng định C# nhanh hơn bao nhiêu hoặc xoá rủi ro ở §4; mọi ngôn ngữ vẫn phải vượt cổng đo.

Vẫn không chọn, vì ba lý do nặng hơn:

| # | Lý do |
|---|---|
| 1 | **Phá `TECH-01`** — giao diện chạy trong trình duyệt nên luật cờ phải viết **hai lần**. Câu 5 phỏng vấn đã chọn TypeScript đúng vì muốn tránh điều này |
| 2 | **Kinh nghiệm thật của đội là TypeScript** — dự án tham chiếu là NestJS + React + TS. Hai tháng thì quen tay quan trọng hơn tốc độ chạy |
| 3 | **LiveKit là phần rủi ro nhất còn lại** (4/30 lỗi lần trước nằm ở media). stack đã chọn có đường tích hợp Node cần kiểm chứng; không suy khả năng SDK từ nhãn ngôn ngữ |

**Phương án lai bị loại thẳng:** *"AI bằng C#, còn lại Node"* là **tệ nhất** — AI gọi bộ sinh nước đi hàng triệu lần mỗi giây, không thể gọi ngược sang dịch vụ TypeScript ⇒ vẫn hai bản luật, lại thêm một ngôn ngữ phải bảo trì.

**Đường mở nếu sau này cần:** chuyển **toàn bộ** backend + AI sang .NET, **bỏ luật cờ phía giao diện**, máy chủ gửi kèm danh sách nước hợp lệ trong mỗi lần cập nhật trạng thái (`BR-BRD-07` đã cho phép). Sạch sẽ, một bản luật duy nhất bằng C#.

---

## 6. VÌ SAO BỎ REDIS / BULLMQ

Thoạt nhìn BullMQ hợp với 5 bộ đếm thời hạn và hàng đợi AI (2 chạy, 8 chờ). Nhưng:

1. **Máy chủ khởi động lại ⇒ ván gián đoạn** (`ARCH-10`). Thời hạn **không cần sống sót** qua khởi động lại ⇒ hẹn giờ trong bộ nhớ là đủ.
2. **Render gói miễn phí không có Redis** — thêm Redis là thêm chi phí hoặc thêm một nhà cung cấp, mà **không có ngân sách** (`DEP-11`).
3. Một máy chủ duy nhất ⇒ không cần điều phối giữa các tiến trình.

Khi nào thêm: lúc mở công khai và chạy nhiều máy chủ.

---

## 7. NGUYÊN TẮC PHIÊN BẢN

| ID | Luật |
|---|---|
| **TECH-04** | **Khoá chính xác** phiên bản thư viện, không lấy bản mới nhất tự động |
| **TECH-05** | Ghi lại phiên bản **thực tế** đã kiểm thử |
| **TECH-06** | **Không** ghi phiên bản chưa cài như đã thử |

---

## 8. TIẾN TRÌNH VÀ HOSTING

**`TECH-09`** — Một dịch vụ backend tạo AI child qua IPC, supervisor chạy tối đa hai search worker trong child, theo `ARCH-16` và ISSUE-118/119. Không có endpoint AI công khai, không thêm dịch vụ thứ hai.

**`TECH-11`** — Hồ sơ mặc định `DEMO_SLEEP_ALLOWED` (DEC-046): một backend, được ngủ/khởi động lại; ván cũ `INTERRUPTED`, không tự chống ngủ, không hứa always-on. Không tự mua dịch vụ. Tài nguyên và kiểm chứng Internet theo [deployment](deployment.md); hiệu năng khi thức vẫn giữ nguyên cổng AI và tải.

## 9. LIÊN QUAN

[architecture.md](architecture.md) · [deployment.md](deployment.md) · [../07-decisions/decision-log.md](../07-decisions/decision-log.md) `DEC-025` · [../03-screens/design-tokens.md](../03-screens/design-tokens.md)
