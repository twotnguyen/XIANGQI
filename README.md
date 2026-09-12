# XIANGQI — Nền tảng Cờ Tướng Trực Tuyến & AI Engine

Ứng dụng chơi cờ tướng trực tuyến thời gian thực với công nghệ WebRTC audio/video, AI engine tự phát triển và máy chủ phân xử luật cờ authoritative.

---

## 1. Công nghệ Sử dụng (Tech Stack)

- **Frontend:** React 19, Vite, TypeScript, CSS Modules (giao diện gỗ truyền thống, quân Hán, responsive mobile 360px & desktop).
- **Backend:** Fastify 5, Node.js 24 LTS, TypeScript strict mode, Helmet, CORS, Worker Threads.
- **Database & Auth:** Supabase (PostgreSQL 16, Row Level Security, Triggers, Functions, PKCE Google OAuth + Password).
- **WebRTC SFU:** LiveKit Server (Audio/Video streams phân quyền theo nguồn, token TTL 60s, luân chuyển generation).
- **AI Engine (`@xiangqi/ai`):** Alpha-Beta Pruning, Negamax formulation, Iterative Deepening, MVV-LVA move ordering, 3 cấp độ (DỄ, TRUNG BÌNH, KHÓ).
- **Kiểm thử:** Vitest (Unit & Integration), Playwright (E2E Chromium desktop & mobile 360px).

---

## 2. Cấu trúc Thư mục Monorepo

```
.
├── apps/
│   ├── web/                  # Ứng dụng giao diện React 19 + Vite
│   ├── server/               # Fastify API Server (Port 3001)
│   └── ai-worker/            # Cụm Worker Threads tính toán AI độc lập
├── packages/
│   ├── contracts/            # Schemas Zod & Types dùng chung
│   ├── game-rules/           # Luật cờ tướng, sinh nước hợp lệ, chiếu hết, lặp 3 lần
│   └── ai/                   # Thuật toán tìm kiếm Minimax, Alpha-Beta, lượng giá
├── infra/
│   ├── compose.yaml          # Docker Compose chạy LiveKit SFU cục bộ
│   ├── Dockerfile.server     # Multi-stage production container
│   └── render.yaml           # Blueprint triển khai Render
├── tests/
│   ├── unit/                 # 30 files unit test (~200 tests)
│   ├── integration/          # Kiểm thử tích hợp CSDL, lỗi mạng, LiveKit
│   ├── e2e/                  # 78 Playwright E2E tests (desktop + mobile)
│   ├── ai/                   # Benchmark 20 thế cờ, đo lường cắt tỉa
│   └── load/                 # Thử tải 10 phòng, 70 kết nối, 2 AI games
└── docs/                     # Toàn bộ tài liệu đặc tả, runbook và test reports
```

---

## 3. Hướng dẫn Khởi chạy Cục bộ (Quickstart)

### Yêu cầu tiên quyết:
- Node.js `v24.x` (khuyến nghị dùng `fnm` hoặc `nvm`)
- pnpm `10.34.5`
- Docker (để chạy LiveKit SFU cục bộ)

### Cài đặt:
```bash
# 1. Cài đặt toàn bộ thư viện
pnpm install

# 2. Biên dịch toàn bộ packages
pnpm build

# 3. Khởi động LiveKit SFU cục bộ
docker compose -f infra/compose.yaml up -d
```

### Chạy môi trường phát triển (Dev Mode):
```bash
pnpm dev
# Web chạy tại http://localhost:5173
# Server chạy tại http://localhost:3001
```

---

## 4. Các Lệnh Kiểm thử Chính thức (Testing Matrix)

| Lệnh | Mục đích | Kết quả |
|---|---|---|
| `pnpm lint` | Kiểm tra chất lượng mã nguồn qua ESLint | **Clean (0 errors)** |
| `pnpm typecheck` | Kiểm tra kiểu dữ liệu tĩnh qua TypeScript (`tsc -b`) | **Clean (0 errors)** |
| `pnpm build` | Biên dịch toàn bộ 6 workspace packages | **Exit 0** |
| `pnpm test:unit` | Chạy toàn bộ ~200 unit tests | **100% PASS** |
| `pnpm test:e2e` | Chạy 78 Playwright tests (desktop 1366px + mobile 360px) | **78 PASS** |
| `pnpm test:ai` | Benchmark 20 thế cờ AI (đo tỷ lệ cắt nhánh) | **Cắt tỉa 84.51%** |
| `pnpm test:load` | Thử tải đồng thời 70 clients + 2 AI matches | **p95 < 30ms (chuẩn < 100ms)** |

---

## 5. Tài liệu Chuyển giao & Tham khảo

- [Tài liệu Kiến trúc AI](docs/handoff/AI-EXPLANATION.md)
- [Hướng dẫn Kịch bản Bảo vệ Đồ án](docs/handoff/DEFENSE.md)
- [Kịch bản Demo Trực tiếp](docs/handoff/DEMO.md)
- [Quy trình Triển khai Production](docs/handoff/DEPLOY.md)
- [Hướng dẫn Bảo trì & Khôi phục](docs/handoff/MAINTENANCE.md)
- [Ma trận Phủ Yêu cầu Kỹ thuật](docs/test-reports/final-coverage.md)
