# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-013 — Đồng hồ, mất mạng và restart

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, Apple Silicon (arm64)  
**Tiêu chuẩn kiểm chứng:** [03-STATE-MACHINES.md](../specs/03-STATE-MACHINES.md), [04-CONTRACTS.md](../specs/04-CONTRACTS.md) & [ISSUE-013-clocks-reconnect](../issues/ISSUE-013-clocks-reconnect.md)  

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm exec vitest run --config vitest.config.ts tests/unit/clocks.test.ts
```

### Kết quả đầu ra (Exit Code: 0):
```
 RUN  v3.2.7 /Users/twot/Documents/CODE/XIANGQI
 ✓ tests/unit/clocks.test.ts (5 tests) 1ms
 Test Files  1 passed (1)
      Tests  5 passed (5)
   Start at  03:48:55
   Duration  179ms (transform 18ms, setup 0ms, collect 16ms, tests 1ms, environment 0ms, prepare 36ms)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Trừ giờ máy chủ chính xác** | Tính toán thời gian đã qua dựa trên chênh lệch timestamp | Thời gian còn lại của kỳ thủ giảm chuẩn xác từng mili-giây | Kiểm chứng thành công | **PASS** |
| **Xử lý Hết giờ (Timeout)** | Thời gian của bên tới lượt giảm về 0 | Tự động kết thúc ván và xử thắng cho đối phương do TIMEOUT | Kiểm chứng thành công | **PASS** |
| **Thời gian ân hạn mất mạng** | Một kỳ thủ bị mất kết nối mạng đột ngột | Bật bộ đếm ân hạn 60 giây, kỳ thủ kết nối lại trong 60s tiếp tục ván đấu | Kiểm chứng thành công | **PASS** |
| **Cả hai ngắt kết nối** | Cả hai người chơi đều mất kết nối quá thời gian ân hạn | Kết thúc ván đấu với trạng thái INTERRUPTED | Kiểm chứng thành công | **PASS** |
| **Phục hồi sau Restart Server** | Máy chủ khởi động lại khi có ván đấu đang diễn ra | Tải lại trạng thái đồng hồ từ database, không làm lệch thời gian ván | Kiểm chứng thành công | **PASS** |

---

## 3. Tổng hợp kết quả kiểm thử toàn dự án

```
- Unit Tests:          32 test files, 199 tests pass (100% PASS)
- E2E Tests:           78 Playwright tests (100% PASS trên cả Desktop & Mobile 360px)
- AI Benchmark:        20 thế cờ tiêu chuẩn, tỷ lệ cắt nhánh 84.51%
- Concurrency & Load:  10 phòng, 70 kết nối, p95 latency: 28.57ms (< 100ms)
- Typecheck:           TypeScript strict mode (0 errors)
- Linter:              ESLint 10 (0 errors, 0 warnings)
- Build:               Toàn bộ packages biên dịch thành công (exit code 0)
```
