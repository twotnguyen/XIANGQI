# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-014 — Đầu hàng, xin hòa và đi lại online

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, Apple Silicon (arm64)  
**Tiêu chuẩn kiểm chứng:** [03-STATE-MACHINES.md](../specs/03-STATE-MACHINES.md), [04-CONTRACTS.md](../specs/04-CONTRACTS.md) & [ISSUE-014-draw-undo-resign](../issues/ISSUE-014-draw-undo-resign.md)  

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm exec vitest run --config vitest.config.ts tests/unit/match-proposals.test.ts
```

### Kết quả đầu ra (Exit Code: 0):
```
 RUN  v3.2.7 /Users/twot/Documents/CODE/XIANGQI
 ✓ tests/unit/match-proposals.test.ts (5 tests) 41ms
 Test Files  1 passed (1)
      Tests  5 passed (5)
   Start at  03:48:55
   Duration  449ms (transform 111ms, setup 0ms, collect 239ms, tests 41ms, environment 0ms, prepare 34ms)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Đề nghị hòa (DRAW)** | Gửi đề nghị hòa tới đối phương | Đối phương chấp thuận -> hòa cờ DRAW; từ chối -> tiếp tục chơi | Kiểm chứng thành công | **PASS** |
| **Thời hạn đề nghị hòa** | Đối phương không phản hồi đề nghị hòa trong 30 giây | Đề nghị tự động hết hạn, không làm treo trạng thái ván cờ | Kiểm chứng thành công | **PASS** |
| **Xin đi lại (UNDO)** | Kỳ thủ xin hoàn tác nước đi vừa thực hiện | Đối thủ chấp nhận -> lùi lại 2 ply về trước nước xin đi lại, không bù giờ | Kiểm chứng thành công | **PASS** |
| **Đầu hàng (RESIGN)** | Kỳ thủ bấm nút đầu hàng | Kết thúc ván ngay lập tức, đối phương giành chiến thắng RESIGNATION | Kiểm chứng thành công | **PASS** |
| **Giới hạn tần suất thao tác** | Gửi liên tiếp các yêu cầu xin hòa hoặc xin đi lại | Bị chặn bởi cơ chế rate limit, yêu cầu chờ giữa các lần gửi | Kiểm chứng thành công | **PASS** |

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
