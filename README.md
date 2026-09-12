# Cờ Tướng Online

Ứng dụng cờ tướng trực tuyến hai người chơi với AI tự viết.

## Yêu cầu

- Node.js 24+ (xem `.nvmrc`)
- pnpm 10+
- Docker (cho LiveKit local)

## Bắt đầu

```bash
# Cài dependencies
pnpm install

# Sao chép biến môi trường
cp .env.example .env

# Khởi động dev (web + server)
pnpm dev
```

## Scripts

| Lệnh | Mô tả |
|---|---|
| `pnpm dev` | Khởi động web (5173) + server (3001) |
| `pnpm build` | Build tất cả packages |
| `pnpm typecheck` | Kiểm tra kiểu TypeScript |
| `pnpm lint` | ESLint |
| `pnpm test:unit` | Unit tests (Vitest) |
| `pnpm test:integration` | Integration tests |

## Cấu trúc

```
apps/web/          React + Vite SPA
apps/server/       Fastify API server
packages/contracts/ Shared types/DTOs
packages/game-rules/ Luật cờ tướng (pure)
packages/ai/       AI engine
supabase/          Migrations & config
infra/             Docker compose, LiveKit
```

## Tài liệu

Xem `docs/` cho specs, issues và tiến độ.
