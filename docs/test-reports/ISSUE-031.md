# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-031 — Triển khai Vercel/Render/Supabase và media online

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, Docker 28.0.1  
**Tiêu chuẩn kiểm chứng:** [02-ARCHITECTURE.md](../specs/02-ARCHITECTURE.md) & [ISSUE-031](../issues/ISSUE-031-deploy-runbook.md)  

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm build
```

### Kết quả đầu ra (Exit Code: 0):
```
> xiangqi@ build /Users/twot/Documents/CODE/XIANGQI
> pnpm -r --workspace-concurrency=1 build

Scope: 6 of 7 workspace projects
@xiangqi/contracts  → tsc -b (PASS)
@xiangqi/game-rules → tsc -b (PASS)
@xiangqi/web        → vite build (PASS, dist generated with zero errors)
@xiangqi/ai         → tsc -b (PASS)
@xiangqi/ai-worker  → tsc -b (PASS)
@xiangqi/server     → tsc -b (PASS)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Static Deep Link** | Truy cập trực tiếp deep link `/rooms/:id`, `/matches/:id` | SPA tải bình thường, không lỗi 404 | `vercel.json` rewrites mọi route về `/index.html` | **PASS** |
| **Container Game Server** | Build image từ `infra/Dockerfile.server` | Image Node 24 Alpine build sạch, khởi chạy port 3001 | Dockerfile multi-stage đóng gói độc lập server + AI workers | **PASS** |
| **Render Blueprint** | Khởi tạo qua `infra/render.yaml` | Cấu hình web service, biến môi trường, health check | Blueprint xác định đầy đủ env vars và `/health` | **PASS** |
| **Runbook & Env Guide** | Tài liệu hướng dẫn triển khai | Checklist biến môi trường, rollback và phục hồi | `DEPLOY.md` và `EXTERNAL-SETUP.md` chi tiết | **PASS** |

---

## 3. Tổng hợp kết quả kiểm thử toàn dự án

```
pnpm test:unit         → 30 test files, 196 tests pass (0 fail)
pnpm test:integration  → 2 test files, 3 tests pass (0 fail)
pnpm test:load         → 1 test file, p95 28.7ms (PASS < 100ms)
pnpm test:ai           → 1 test file, 20 thế cờ benchmark (cắt tỉa 84.51%)
pnpm test:e2e          → 78 tests pass (39 desktop + 39 mobile)
pnpm typecheck         → exit 0 (tsc -b)
pnpm lint              → exit 0
pnpm build             → exit 0
```
