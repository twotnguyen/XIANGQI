# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-030 — Nghiệm thu xuyên suốt, lỗi mạng và thử tải

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.15.0, Fastify 5.3.0, Socket.IO 4.8.3, Playwright Chromium  
**Tiêu chuẩn kiểm chứng:** [07-UI-AND-TESTS.md](../specs/07-UI-AND-TESTS.md) & [ISSUE-030](../issues/ISSUE-030-acceptance-load.md)  

---

## 1. Kết quả các lệnh kiểm chứng bắt buộc

### Lệnh 1: Thử tải đồng thời Socket.IO thật + CSDL thật (`pnpm test:load`)
```
=== RUNNING CONCURRENCY & LOAD TEST (REAL SOCKET.IO + DB) ===
Target: 10 rooms, 70 concurrent socket clients (20 players + 50 spectators) + 2 AI matches
Connected 70 live socket clients across 10 rooms.
Executing concurrent subscriptions across all 70 clients...
Completed 70 concurrent subscriptions.
Submitting concurrent opening moves across all 10 matches...
Completed 10 concurrent WebSocket moves.
Simulating 2 concurrent AI games...

=== LOAD TEST RESULTS ===
  Total operations measured: 158
  p50 Latency: 9.47 ms
  p95 Latency: 67.64 ms (Ngưỡng yêu cầu: < 100 ms)
  p99 Latency: 68.01 ms
  Max Latency: 68.96 ms
  Status: PASS
```

### Lệnh 2: Nghiệm thu E2E xuyên suốt giao diện (`pnpm test:e2e`)
```
Running 92 tests using 1 worker
  ✓  [chromium] › tests/e2e/realtime-sync.spec.ts:169:3 › T015-E2E-04: waiting room follows room:updated and match start without reload (1.4s)
  ✓  [chromium] › tests/e2e/realtime-sync.spec.ts:239:3 › T015-E2E-03: move reaches other player without reload, clock runs, illegal move rejected (4.7s)
  ✓  [chromium] › tests/e2e/keyboard-board.spec.ts:4:3 › T005-E2E-KB-01: Arrow keys navigate board intersections and Enter selects piece (1.2s)
  ✓  [chromium] › tests/e2e/full-demo.spec.ts:4:3 › T030-E2E-01: Full user navigation through core features (323ms)
  ...
  92 passed (32.5s)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Thử tải 70 clients** | 10 phòng đấu, 70 kết nối WebSocket đồng thời, 10 nước đi đồng thời, 2 ván cờ AI | p95 latency < 100ms | Đạt **67.64 ms** (ngưỡng yêu cầu < 100ms) | **PASS** |
| **Lệnh trùng lặp** | Gửi cùng commandId với payload khác nhau | Nhận diện payloadHash khác biệt, chặn mã 409 | `hashPayload` phát hiện thay đổi payload lập tức | **PASS** |
| **Hành trình E2E** | Đi qua Trang chủ $\to$ Sảnh $\to$ Đánh máy $\to$ Lịch sử $\to$ Bàn cờ | Tải mượt mà không lỗi | 92 tests chạy thành công trên cả desktop và mobile 360px | **PASS** |
| **Bảo vệ xác thực** | Gửi lệnh vào ván cờ không có Bearer token | Chặn 401 UNAUTHENTICATED | Hệ thống từ chối mọi request không hợp lệ | **PASS** |

---

## 3. Tổng hợp kiểm thử toàn diện toàn dự án

```
pnpm test:unit         → 34 test files, 301 tests pass (0 fail)
pnpm test:integration  → 13 test files, 90 tests pass (0 fail, 0 skip)
pnpm test:media        → 1 test file, 8 tests pass (RTP bytes/frames verified on live SFU)
pnpm test:load         → 1 test file, p95 67.64ms (PASS < 100ms với 70 socket clients thật)
pnpm test:ai           → 1 test file, 20 thế cờ benchmark (cắt tỉa 78.86%, 20/20 scores match)
pnpm test:e2e          → 16 test files, 92 tests pass (46 desktop + 46 mobile)
pnpm typecheck         → exit 0 (tsc -b)
pnpm lint              → exit 0 (ESLint clean across all apps, packages, tests)
pnpm build             → exit 0 (toàn bộ 6 workspace packages biên dịch thành công)
```
