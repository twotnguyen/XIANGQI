# CỜ TƯỚNG ONLINE

> Chơi cờ tướng trực tuyến với bạn bè hoặc với máy — có phòng riêng, người xem, chat và camera/mic.

**Trạng thái:** 📐 `SPEC_REVIEWED` — đã rà soát đặc tả; **chưa triển khai ứng dụng**
**Cập nhật:** 2026-09-25

---

## ⚠ KHO MÃ NÀY ĐANG CHỨA GÌ

Hiện tại đây là **kho đặc tả**, chưa có mã nguồn.

```
XIANGQI/
├── README.md      ← bạn đang đọc
├── AGENTS.md      ← luật làm việc cho coding agent — ĐỌC TRƯỚC KHI CODE
└── docs/          ← yêu cầu và kế hoạch: yêu cầu · luồng · màn hình · luật · 138 đầu việc
```

Mã nguồn sẽ được xây dựng theo **138 đầu việc** trong [docs/10-issues/](docs/10-issues/), lần lượt tạo ra cấu trúc:

```
apps/web/        giao diện React
apps/server/     máy chủ NestJS + Socket.IO
apps/ai-worker/  máy cờ — tiến trình RIÊNG
packages/        contracts · game-rules · ai
supabase/        migration SQL
tests/           unit · integration · e2e · media · load
```

---

## 🎮 SẢN PHẨM LÀ GÌ

Một trang web chơi cờ tướng. Người dùng đăng ký tài khoản, tạo phòng, mời bạn vào đánh, và có thể vừa đánh vừa nói chuyện qua camera/mic.

| Nhóm chức năng | Nội dung |
|---|---|
| **Tài khoản** | Đăng ký · đăng nhập · đăng nhập Google · phiên nhớ 30 ngày |
| **Bạn bè** | Tìm người dùng · kết bạn · thấy ai đang online |
| **Phòng** | Tạo phòng công khai / riêng tư / cần mã · sảnh phòng · mời bằng mã, link hoặc hộp thư |
| **Chơi cờ** | Bộ luật cờ tướng dự án (DEC-019) · đồng hồ · đầu hàng · xin hoà · xin đi lại · tái đấu |
| **Người xem** | Tối đa **5** người xem mỗi phòng · chủ phòng và người chơi đuổi được |
| **Chat** | **Hai khung**: kênh riêng giữa 2 người chơi + kênh chung cả phòng |
| **Camera / Mic** | Bật tắt độc lập · người xem chỉ nhận khi được cho phép |
| **Chơi với máy** | 3 mức độ khó · máy chạy tiến trình riêng |
| **Lịch sử** | Lưu ván đã đánh · xem lại từng nước |

Chi tiết từng chức năng: [docs/01-requirements/](docs/01-requirements/) · Cái gì **cố ý không làm**: [docs/00-overview/scope.md](docs/00-overview/scope.md)

---

## 🚀 BẮT ĐẦU TỪ ĐÂU

Giao cho agent triển khai: [hướng dẫn bắt đầu](docs/10-issues/AGENT-START-HERE.md), [138 issue](docs/10-issues/INDEX.md), [333 AC và nơi kiểm chứng](docs/10-issues/AC-COVERAGE.md), [kiểm tra kế hoạch](docs/10-issues/PLAN-REVIEW.md).

### 🌐 Đọc tài liệu dưới dạng web (dễ nhất)

Double-click **[site/index.html](site/index.html)** — không cần cài gì, không cần server.

Có lộ trình đọc theo vai trò, tìm kiếm toàn văn (gõ được cả không dấu), theo dõi tiến độ đọc, nền sáng/tối.
Hướng dẫn và cách đưa lên mạng: [site/README.md](site/README.md).

### Tôi là người mới, muốn hiểu dự án

👉 **[docs/ONBOARDING.md](docs/ONBOARDING.md)** — lộ trình đọc riêng cho từng vai trò, có bài tự kiểm tra.

Hoặc đọc nhanh bộ lõi theo **đúng thứ tự này** — khoảng 1 giờ:

| # | Đọc | Bạn sẽ biết |
|---|---|---|
| 1 | [docs/00-overview/product-overview.md](docs/00-overview/product-overview.md) | Sản phẩm giải quyết vấn đề gì |
| 2 | [docs/00-overview/glossary.md](docs/00-overview/glossary.md) | ⭐ **Bắt buộc** — thuật ngữ dùng thống nhất |
| 3 | [docs/00-overview/actors.md](docs/00-overview/actors.md) | Ai làm được gì |
| 4 | [docs/04-business-rules/game-rules.md](docs/04-business-rules/game-rules.md) §1 | ⭐ **Hệ toạ độ** — nền của mọi luật cờ |
| 5 | [docs/README.md](docs/README.md) | Bản đồ toàn bộ tài liệu |

> ⚠ **Đừng bỏ bước 2 và 4.** Glossary tránh nhầm `SPECTATOR` với `WATCH`. Hệ toạ độ hiểu sai là code sai toàn bộ luật cờ.

### Tôi là coding agent, sắp viết mã

👉 **[AGENTS.md](AGENTS.md)** — đọc hết trước khi chạm vào bất kỳ file nào.

### Tôi muốn bắt đầu xây dựng

| Bước | Vào đây |
|---|---|
| 1. Luật làm việc của đội | [docs/10-issues/README.md](docs/10-issues/README.md) |
| 2. Quy trình làm một đầu việc | [docs/10-issues/WORKFLOW.md](docs/10-issues/WORKFLOW.md) |
| 3. Chọn việc theo thứ tự | [docs/10-issues/INDEX.md](docs/10-issues/INDEX.md) |
| 4. Xin tài nguyên bên ngoài | [docs/10-issues/EXTERNAL-SETUP.md](docs/10-issues/EXTERNAL-SETUP.md) |

Việc đầu tiên: [ISSUE-001](docs/10-issues/ISSUE-001.md).

---

## 🔧 CÔNG NGHỆ

Đã chốt tại [`DEC-025`](docs/07-decisions/decision-log.md). Muốn đổi phải có quyết định mới.

| Lớp | Chọn |
|---|---|
| Ngôn ngữ | **TypeScript** toàn bộ, chế độ nghiêm ngặt |
| Runtime | Node.js 24 LTS · **pnpm workspace** |
| Giao diện | React + Vite + React Router · **bàn cờ vẽ bằng SVG** |
| Trạng thái | TanStack Query (đọc HTTP) + Zustand (ván realtime) |
| CSS | Tokens toàn cục + CSS Modules — **không** dùng thư viện giao diện dựng sẵn |
| Máy chủ | NestJS + Socket.IO |
| Cơ sở dữ liệu | Supabase PostgreSQL · **Prisma lai** (xem `TECH-07`) |
| Migration | Supabase CLI `.sql` — ⛔ **không** `prisma migrate` |
| Camera/mic | LiveKit |
| Máy cờ | TypeScript, **tiến trình riêng** |
| Kiểm thử | Vitest + Playwright |

**Cố ý không dùng:** Redis · BullMQ · Prometheus · Swagger · i18next · SSR/Next.js · Tailwind.

Lý do từng lựa chọn: [docs/09-technical/tech-stack.md](docs/09-technical/tech-stack.md)

---

## ⛔ HAI CỔNG CHẶN

Hai câu hỏi chưa có đáp án, phải **đo thật** trước khi đi tiếp:

| Cổng | Câu hỏi | Điều kiện qua |
|---|---|---|
| [ISSUE-032](docs/10-issues/ISSUE-032.md) | TypeScript có tính nổi **độ sâu 6** trong 3 giây không? | p95 < 3000 ms trên 20 thế cờ × 5 lần lặp |
| [ISSUE-112](docs/10-issues/ISSUE-112.md) | LiveKit có truyền được **gói tin thật** không? | Số byte RTP > 0 **và** số khung hình > 0 |

**Không đạt thì không được làm tiếp nhánh đó.** Và ⛔ **không được hạ ngưỡng** để đi tiếp — ghi số thật rồi tối ưu.

---

## 📐 VÌ SAO TÀI LIỆU NHIỀU ĐẾN VẬY

Dự án này **đã từng được xây một lần**. Lần đó có đợt review độc lập tìm ra **30 lỗi thật** — lưu ở [docs/99-archive/reviews-v1/](docs/99-archive/reviews-v1/).

Vài lỗi tiêu biểu:

| Từng xảy ra | Lần này phòng ở đâu |
|---|---|
| Đi nước mới sau khi **đi lại** luôn lỗi trùng khoá | Nước đi lưu dạng **cây**, không phải danh sách |
| Đếm lặp 3 lần tính **cả nhánh đã bỏ** ⇒ hoà sai | Chỉ đếm trên **nhánh đang có hiệu lực** |
| Vào phòng bằng mã **bỏ qua kiểm tra riêng tư** | Kiểm quyền ở **mọi** đường vào |
| Thu hồi quyền người xem là **code chết** | Test phải xác nhận **hiệu lực thật** |
| Test dữ liệu **tự mock chính nó** | Test chạy trên PostgreSQL **thật**, thiếu DB là test **đỏ** |
| Camera "kết nối" nhưng **không có gói tin nào** | Cổng chặn đo **byte RTP thật** |

**Toàn bộ 30 lỗi đã được gắn vào đúng đầu việc sẽ gặp chúng** — mục "⚠ CẠM BẪY" ở cuối mỗi issue.

---

## 📊 TRẠNG THÁI

Đặc tả, quyết định, flow, màn hình, contract và kế hoạch đã được rà soát trong [final audit 2026-09-22](docs/08-ba-review/final-audit-2026-09-22.md). [Truy vết hiện hành](docs/06-acceptance/traceability-matrix.md) và [registry ID](docs/06-acceptance/requirement-register.md) thay các tổng số chép tay cũ.

**138 issue vẫn TODO.** Chưa có mã ứng dụng, kết quả unit/integration/e2e, phép đo AI/RTP hoặc triển khai Internet. Bộ biến thiết kế đặt mục tiêu trợ năng; không thay cho kiểm chứng giao diện chạy thật.

---

## 📜 GIẤY PHÉP & GHI CHÚ

- `docs/99-archive/` là **lịch sử**, ⛔ **không xoá** và **không dùng làm căn cứ triển khai**
- Font chữ Hán phải **tự host** và kiểm/lưu giấy phép của đúng font được dùng khi triển khai
- ⛔ **Không commit khoá bí mật.** Mọi giá trị thật điền trên bảng điều khiển của dịch vụ
