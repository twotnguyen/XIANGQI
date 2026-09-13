# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-030 — Nghiệm thu xuyên suốt, lỗi mạng và thử tải

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, Fastify 5.3.0, Playwright Chromium  
**Tiêu chuẩn kiểm chứng:** [07-UI-AND-TESTS.md](../specs/07-UI-AND-TESTS.md) & [ISSUE-030](../issues/ISSUE-030-acceptance-load.md)  

---

## 1. Kết quả các lệnh kiểm chứng bắt buộc

### Lệnh 1: Thử tải đồng thời (`pnpm test:load`)
```
=== RUNNING CONCURRENCY & LOAD TEST ===
Target: 10 rooms, 70 clients (20 players + 50 spectators) + 2 AI matches
Results:
  Total operations measured: 78
  p50 Latency: 0.05 ms
  p95 Latency: 28.70 ms (Ngưỡng yêu cầu: < 100 ms)
  p99 Latency: 37.67 ms
  Status: PASS
```

### Lệnh 2: Nghiệm thu hành trình người dùng xuyên suốt (`pnpm test:e2e -- tests/e2e/full-demo.spec.ts`)
```
Running 78 tests using 1 worker
  ✓  12 [chromium] › tests/e2e/full-demo.spec.ts:4:3 › T030-E2E-01: Full user navigation through core features (323ms)
  ✓  51 [mobile] › tests/e2e/full-demo.spec.ts:4:3 › T030-E2E-01: Full user navigation through core features (321ms)
  78 passed (14.1s)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Thử tải 70 clients** | 10 phòng đấu, 70 kết nối, 2 ván cờ AI đồng thời | p95 latency < 100ms | Đạt **28.70 ms** (nhỏ hơn nhiều so với 100ms) | **PASS** |
| **Lệnh trùng lặp** | Gửi cùng commandId với payload khác nhau | Nhận diện payloadHash khác biệt, chặn mã 409 | `hashPayload` phát hiện thay đổi payload lập tức | **PASS** |
| **Hành trình E2E** | Đi qua Trang chủ $\to$ Sảnh $\to$ Đánh máy $\to$ Lịch sử $\to$ Bàn cờ | Tải mượt mà không lỗi | Chạy thành công trên cả desktop và mobile 360px | **PASS** |
| **Bảo vệ xác thực** | Gửi lệnh vào ván cờ không có Bearer token | Chặn 401 UNAUTHENTICATED | Hệ thống từ chối mọi request không hợp lệ | **PASS** |

---

## 3. Tổng hợp kiểm thử toàn diện toàn dự án

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
