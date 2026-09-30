# Cờ Tướng Online

Ứng dụng web chơi cờ tướng trực tuyến với bạn bè hoặc với máy: phòng riêng, người xem, chat hai kênh và camera/mic.

> **Trạng thái:** đặc tả đã rà soát xong, **chưa có mã nguồn ứng dụng**. Việc xây dựng chạy theo 4 sprint từ **28/09 đến 23/10/2026** trên Jira project [`XW`](https://xiangqi-web.atlassian.net/jira/software/c/projects/XW/boards/4).

---

## Mục lục

- [Tính năng](#tính-năng)
- [Công nghệ](#công-nghệ)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Bắt đầu](#bắt-đầu)
- [Lệnh thường dùng](#lệnh-thường-dùng)
- [Kiểm thử](#kiểm-thử)
- [Quy trình làm việc](#quy-trình-làm-việc)
- [Tài liệu](#tài-liệu)
- [Nhóm phát triển](#nhóm-phát-triển)
- [Bảo mật](#bảo-mật)
- [Giấy phép](#giấy-phép)

---

## Tính năng

| Nhóm | Nội dung |
|---|---|
| Tài khoản | Đăng ký bằng username + email, xác minh email, đăng nhập Google, phiên nhớ 30 ngày |
| Bạn bè | Tìm người dùng, kết bạn, xem ai đang online |
| Phòng | Phòng công khai / riêng tư / cần mã, sảnh phòng, mời bằng mã, link hoặc hộp thư |
| Chơi cờ | Luật cờ tướng của dự án (`DEC-019`), đồng hồ, đầu hàng, xin hoà, xin đi lại, tái đấu |
| Người xem | Tối đa 5 người xem mỗi phòng; chủ phòng và người chơi đuổi được |
| Chat | Hai kênh: riêng giữa 2 người chơi và chung cả phòng |
| Camera / mic | Bật tắt độc lập; người xem chỉ nhận khi được cho phép |
| Chơi với máy | 3 mức độ khó; máy cờ chạy ở tiến trình riêng |
| Lịch sử | Lưu ván đã đánh, xem lại từng nước |

Chi tiết: [docs/01-requirements/](docs/01-requirements/). Những gì **cố ý không làm**: [docs/00-overview/scope.md](docs/00-overview/scope.md).

## Công nghệ

Đã chốt tại `DEC-025` ([decision-log](docs/07-decisions/decision-log.md)); lý do từng lựa chọn ở [tech-stack.md](docs/09-technical/tech-stack.md).

| Lớp | Công nghệ |
|---|---|
| Ngôn ngữ / runtime | TypeScript (strict), Node.js 24 LTS, pnpm workspace |
| Giao diện | React, Vite, React Router, bàn cờ vẽ bằng SVG, TanStack Query, Zustand, CSS Modules + design tokens |
| Máy chủ | NestJS, Socket.IO |
| Dữ liệu | Supabase PostgreSQL; Prisma cho truy vấn thường, SQL thuần cho đường xử lý cần khoá; migration bằng file `.sql` qua Supabase CLI |
| Camera / mic | LiveKit |
| Máy cờ | TypeScript, chạy ở tiến trình riêng |
| Kiểm thử | Vitest, Playwright |

Không dùng: Redis, BullMQ, Tailwind, thư viện UI dựng sẵn, SSR/Next.js, Swagger, i18next, Prometheus.

## Cấu trúc thư mục

Hiện có:

```
.
├── AGENTS.md                   Luật làm việc cho AI agent (người mới cũng nên đọc)
├── BA-SCOPE-DECISIONS.md       Quyết định chốt phạm vi sản phẩm (Scope Freeze, 21 yêu cầu)
├── DANH-MUC-MAN-HINH-XIANGQI.md Danh mục chi tiết 37 thành phần giao diện & 5 trạng thái
├── DESIGN.md                   Hệ thống thiết kế giao diện (Kỳ Đài Cổ Phong)
├── docs/                       Đặc tả: yêu cầu, luồng, màn hình, luật, dữ liệu, nghiệm thu, quyết định, 138 issue
├── Jira/                       Kế hoạch Sprint, Epics, User Stories và Tasks
├── mockups/                    Bộ Mockup Prototype HTML/CSS tương tác 37 thành phần (mở mockups/index.html)
└── site/                       Trang web đọc tài liệu (mở site/index.html)
```

Sẽ hình thành dần qua các Task (không tạo trước):

```
apps/
  web/           Giao diện React
  server/        API NestJS + Socket.IO
  ai-worker/     Máy cờ, tiến trình riêng
packages/
  contracts/     Kiểu dữ liệu + schema Zod dùng chung
  game-rules/    Luật cờ thuần, không phụ thuộc gì
  ai/            Lượng giá, tìm kiếm
supabase/migrations/
tests/           unit · integration · e2e · media · load
```

## Bắt đầu

### Yêu cầu

- Node.js 24 LTS và pnpm (phiên bản chính xác sẽ ghi trong `package.json` → `engines` / `packageManager`)
- Docker Desktop (Supabase local, LiveKit local)
- Supabase CLI
- Git

### Cài đặt và chạy

> Các lệnh dưới đây có hiệu lực sau khi Task [TK01.1.1](Jira/task/TK01.1.1-khoi-tao-monorepo-pnpm-typescript-nghiem-ngat.md) (khởi tạo monorepo) và [TK01.2.2](Jira/task/TK01.2.2-supabase-local-bien-moi-truong-mau-va-runner-test-tich-hop.md) (Supabase local) được merge.

```bash
git clone https://github.com/twotnguyen/XIANGQI.git
cd XIANGQI
pnpm install --frozen-lockfile
cp .env.example .env          # điền giá trị local, KHÔNG commit .env
pnpm db:start                 # Supabase local: Studio :54323, hộp thư :54324
pnpm dev                      # web http://localhost:5173 · API http://127.0.0.1:3000/health
```

### Đọc tài liệu

Mở `site/index.html` bằng trình duyệt (không cần server): có lộ trình đọc theo vai trò, tìm kiếm toàn văn, nền sáng/tối. Sửa file trong `docs/` xong chạy `node site/build.mjs` để cập nhật trang. Xem [site/README.md](site/README.md).

## Lệnh thường dùng

| Lệnh | Việc |
|---|---|
| `pnpm dev` | Chạy web (5173) và server (3000) cùng lúc |
| `pnpm build` | Build mọi package |
| `pnpm typecheck` | Kiểm kiểu TypeScript |
| `pnpm lint` | ESLint + Prettier + luật ranh giới kiến trúc |
| `pnpm test:unit` | Unit test (Vitest) |
| `pnpm test:integration` | Test trên PostgreSQL thật |
| `pnpm test:e2e` | Test trình duyệt thật (Playwright) |
| `pnpm test:ai` · `test:media` · `test:load` | Đo máy cờ · đo luồng camera/mic thật · thử tải |
| `pnpm db:start` | Bật Supabase local |

Lane nào chưa có công cụ sẽ **báo lỗi** `NOT_IMPLEMENTED — xem <Task>` và thoát mã 1, không bao giờ báo xanh giả.

## Kiểm thử

- **Bốn cổng bắt buộc** trước mỗi PR: `pnpm lint && pnpm typecheck && pnpm build && pnpm test:unit`.
- Test dữ liệu chạy trên **PostgreSQL thật**; thiếu DB thì test phải đỏ.
- Test thời gian dùng **đồng hồ giả tiêm vào**, không `sleep` thật.
- Không `.only`, không test bị bỏ qua.
- Hai cổng đo chặn tiến độ: **máy cờ** tính độ sâu 6 trong 3000 ms (p95, [TK04.3.1](Jira/task/TK04.3.1-corpus-hieu-nang-20-the-benchmark-cong-depth-lane-test-ai.md)) và **LiveKit** truyền byte RTP + khung hình thật ([ST14.1](Jira/story/ST14.1-cong-media-livekit-local-do-byte-rtp-that.md)). Không đạt thì ghi số thật, **không hạ ngưỡng**.

Tester dùng [sổ tay kiểm thử](Jira/04-HUONG-DAN-KIEM-THU.md) và công cụ `Jira/tools/qa.sh`, `Jira/tools/sock.mjs`.

## Quy trình làm việc

**Nhánh:**

| Nhánh | Vai trò | Ai merge vào |
|---|---|---|
| `main` | Ổn định nhất; **deploy từ nhánh này** | Chỉ trưởng nhóm hoặc Tester, bằng PR `develop → main` (phát hành cuối sprint) |
| `develop` | Nhánh làm việc chung của cả nhóm | Mọi thành viên, qua PR đã được review + CI xanh + Tester PASS |
| `feature/XW-…`, `fix/XW-…`… | Một Task | Tạo từ `develop`, PR ngược về `develop` |


Mỗi Task đi theo vòng đời trên Jira:

```
To Do → Ready For Dev → In Progress → Ready For Test (review + test) → merge develop → Done
```

1. Chỉ nhận Task khi mọi Task chặn đã **Done**. Đọc file `Jira/task/TKxx.y.z-….md` và các `docs/10-issues/ISSUE-NNN.md` mà Task truy về. Kéo sang **In Progress**.
2. Tạo nhánh từ `develop` có Key Jira: `feature/XW-72-khoi-tao-monorepo`.
3. Viết test trước, rồi viết mã; chạy 4 cổng. Commit: `feat(auth): API đăng nhập [XW-111]`.
4. Mở PR `[XW-72] TK01.1.1 · …` vào **`develop`** — **một Task một PR**. Comment bàn giao, giao cho Người kiểm, kéo sang **Ready For Test**.
5. Ở Ready For Test: ≥ 1 người khác **review + approve**, Tester **kiểm trên nhánh PR** theo mục 🧪. FAIL ⇒ Bug, sửa tiếp trên cùng PR.
6. Đủ approve + CI xanh + Tester PASS ⇒ merge `develop` ⇒ Tester kéo sang **Done**. Log work.

Chi tiết (Definition of Ready/Done, mẫu PR, mẫu comment, mẫu Bug): [AGENTS.md §8](AGENTS.md). Cấu hình Jira: [Jira/00-CAU-HINH-JIRA.md](Jira/00-CAU-HINH-JIRA.md).

## Tài liệu
 
| Cần | Xem |
|---|---|
| Người mới bắt đầu từ đâu | [docs/ONBOARDING.md](docs/ONBOARDING.md) |
| Quyết định chốt phạm vi (21 yêu cầu) | [BA-SCOPE-DECISIONS.md](BA-SCOPE-DECISIONS.md) |
| Danh mục 37 màn hình & 5 trạng thái | [DANH-MUC-MAN-HINH-XIANGQI.md](DANH-MUC-MAN-HINH-XIANGQI.md) |
| Bộ Mockup Prototype 37 thành phần | [mockups/index.html](mockups/index.html) |
| Hệ thống thiết kế (màu, chữ, thành phần, bàn cờ, Figma) | [DESIGN.md](DESIGN.md) |
| Thuật ngữ (bắt buộc đọc) | [docs/00-overview/glossary.md](docs/00-overview/glossary.md) |
| Hệ toạ độ bàn cờ | [docs/04-business-rules/game-rules.md](docs/04-business-rules/game-rules.md) §1 |
| Bản đồ toàn bộ đặc tả | [docs/README.md](docs/README.md) |
| Kiến trúc | [docs/09-technical/architecture.md](docs/09-technical/architecture.md) |
| Vì sao quyết định như vậy | [docs/07-decisions/decision-log.md](docs/07-decisions/decision-log.md) |
| Kế hoạch 4 tuần & Epics | [Jira/01-KE-HOACH-4-TUAN.md](Jira/01-KE-HOACH-4-TUAN.md) · [Jira/EPIC-01-AUTHENTICATION-IDENTITY.md](Jira/EPIC-01-AUTHENTICATION-IDENTITY.md) |
| Task ↔ Key Jira ↔ issue đặc tả | [Jira/03-TRUY-VET.md](Jira/03-TRUY-VET.md) |
| API HTTP và sự kiện realtime | [Jira/06-HOP-DONG-API-SU-KIEN.md](Jira/06-HOP-DONG-API-SU-KIEN.md) |
| Từ kỹ thuật cho sinh viên | [Jira/05-TU-DIEN-KY-THUAT.md](Jira/05-TU-DIEN-KY-THUAT.md) |
| Dùng AI agent với dự án | [AGENTS.md](AGENTS.md) |

`docs/99-archive/` là lịch sử của lần xây trước (có 30 lỗi đã phân tích): không xoá, không dùng làm căn cứ triển khai.

## Nhóm phát triển

7 thành viên, vai trò TV1–TV7 (Backend ×2, Frontend ×2, AI + luật cờ, Design/Tester, Tester + DevOps). Phân công từng Task: [Jira/07-PHAN-CONG.md](Jira/07-PHAN-CONG.md).

## Bảo mật

- Không commit khoá bí mật; `.env` đã nằm trong `.gitignore`, chỉ commit `.env.example` với giá trị mẫu.
- Mọi biến `VITE_*` đều **công khai** trong trình duyệt — không đặt khoá bí mật vào đó.
- Phát hiện lỗ hổng: báo trực tiếp trưởng nhóm, không mở issue công khai.

## Giấy phép

Chưa chọn giấy phép. Font chữ Hán dùng trong bàn cờ phải tự host và lưu giấy phép của đúng font được dùng.
