# Evidence — ISSUE-001: Workspace, toolchain và ứng dụng khởi động được

## Trạng thái: LOCAL_DONE
## Commit: (pending — chưa commit)
## Nhánh: `chore/issue-001-foundation`

## Môi trường

- OS: macOS 15.7.3 (arm64)
- Node: v24.21.0 (via fnm)
- pnpm: 10.34.5
- TypeScript: ~5.8.0
- Vitest: 3.2.7
- Fastify: ^5.3.0
- Vite: ^6.3.0
- React: ^19.1.0
- ESLint: ^10.10.0

## Thay đổi

### Workspace
- `pnpm-workspace.yaml`: monorepo `apps/*` + `packages/*`
- `package.json`: root scripts dev/build/lint/typecheck/test:unit/test:integration/test:e2e/test:ai/test:load
- `tsconfig.base.json`: TypeScript strict, ES2024, Node16 resolution
- `.nvmrc`: Node 24
- `eslint.config.js`: flat config, typescript-eslint
- `vitest.config.ts`: root config cho tests/unit/
- `.env.example`: biến môi trường mẫu theo architecture spec
- `README.md`: hướng dẫn local

### Packages
- `packages/contracts/`: manifest + empty index (ISSUE-002)
- `packages/game-rules/`: manifest + empty index (ISSUE-002/003)
- `packages/ai/`: manifest + empty index (ISSUE-018+)

### Apps
- `apps/server/src/app.ts`: `createApp()` factory trả FastifyInstance, GET /health → `{status:"ok"}`
- `apps/server/src/main.ts`: entrypoint listen port 3001, SIGTERM/SIGINT shutdown
- `apps/server/src/config.ts`: `loadConfig()`, `requireDatabaseUrl()` — throws naming variable, không in secret
- `apps/web/`: React 19 + Vite 6 SPA, index.html lang="vi", React Router, Home page tiếng Việt

### Infra
- `infra/compose.yaml`: LiveKit SFU local
- `infra/livekit.yaml`: dev config
- `.github/workflows/ci.yml`: CI install/build/typecheck/lint/test:unit

### Tests
- `tests/unit/health.test.ts`: T001-01 (health 200), T001-02 (factory close)
- `tests/unit/config.test.ts`: config validation (missing DATABASE_URL throws, no secret leak)

## Lệnh kiểm chứng và kết quả

### T001-01: Clean install/build và health 200
```bash
pnpm install --frozen-lockfile  # exit 0
pnpm build                     # exit 0 (contracts, server, web, game-rules, ai)
pnpm test:unit                 # exit 0, 4/4 tests pass
```

### T001-02: Factory close không giữ handle
```
✓ tests/unit/health.test.ts > Health endpoint > T001-02: factory close does not hold open handles
```
Test process kết thúc sạch, không timeout.

### T001-03: Script chọn sai file exit khác 0
```bash
pnpm exec vitest run --config vitest.config.ts tests/unit/nonexistent.test.ts
# exit 1 — "No test files found, exiting with code 1"
```

### Typecheck
```bash
pnpm typecheck  # exit 0, 5/5 packages pass
```

### Lint
```bash
pnpm lint  # exit 0, no errors
```

## Acceptance

| Tình huống | Kết quả |
|---|---|
| Khởi động sạch: `pnpm install --frozen-lockfile` rồi build | exit 0, web/API import được |
| Health factory: inject GET /health không mở port | 200, `{status:"ok"}` |
| Thiếu DATABASE_URL ở module DB | throws `Missing required environment variable: DATABASE_URL`, không in secret |

## Kết quả test

- Test Files: 2 passed (2)
- Tests: 4 passed (4)
- Duration: ~271ms

## Quyết định kỹ thuật

- **Node 24.21.0** thay vì system Node 26: spec chốt "Node 24 LTS"; cài qua fnm.
- **pnpm 10.34.5**: stable LTS, không dùng pnpm 12 (breaking changes tiềm năng).
- **Root lint**: ESLint flat config chạy từ root thay vì mỗi package chạy riêng — đơn giản hơn, một config duy nhất.
- **Vitest root**: dev dep ở root, config ở root cho tests/unit/; integration config sẽ thêm ở ISSUE-006 TS harness.

## Gate chưa chạy
- CI workflow chưa chạy trên GitHub Actions (sẽ chạy khi push PR).
- `pnpm dev` chưa test vì chỉ yêu cầu build/test/health trong acceptance.

## Giới hạn
- `test:e2e`, `test:ai`, `test:load` scripts báo chưa có suite (exit 1 có message rõ).
- Packages contracts/game-rules/ai chỉ có manifest, chưa có logic (đúng phạm vi ISSUE-001).
- ESLint lint scripts trong sub-packages vẫn gọi `eslint src/` nhưng chưa cần thiết vì root script lint tất cả.

## Bước tiếp theo
- Commit, push, tạo PR, review, merge.
- Sau merge: ISSUE-002 (contracts, position).
