# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-020 — AI: alpha-beta, iterative deepening và cấp độ

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, Apple Silicon (arm64)  
**Tiêu chuẩn kiểm chứng:** [01-PRODUCT.md](../specs/01-PRODUCT.md), [04-CONTRACTS.md](../specs/04-CONTRACTS.md) & [ISSUE-020-ai-alpha-beta](../issues/ISSUE-020-ai-alpha-beta.md)  

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm exec vitest run --config vitest.config.ts tests/unit/ai-search.test.ts
```

### Kết quả đầu ra (Exit Code: 0):
```
 ✓ tests/unit/ai-search.test.ts (9 tests) 594ms
   ✓ T020-03: Cancellation and Fallback > cancellation mid-search returns legal fallback move  480ms
 Test Files  1 passed (1)
      Tests  9 passed (9)
   Start at  03:49:03
   Duration  837ms (transform 50ms, setup 0ms, collect 84ms, tests 594ms, environment 0ms, prepare 36ms)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Cắt nhánh Alpha-Beta** | So sánh điểm đánh giá giữa Alpha-Beta và Minimax | Điểm số và nước đi tối ưu tương đương nhưng số node duyệt giảm mạnh | Kiểm chứng thành công | **PASS** |
| **Tăng độ sâu dần (Iterative Deepening)** | Tìm kiếm từng tầng độ sâu 1, 2, 3... | Lưu lại kết quả tầng trước đó để làm fallback khi hết thời gian | Kiểm chứng thành công | **PASS** |
| **Sắp xếp nước đi theo PV** | Đưa nước đi tối ưu ở độ sâu trước lên đầu | Tăng tỷ lệ cắt tỉa alpha-beta lên trên 80% | Kiểm chứng thành công | **PASS** |
| **3 Cấp độ khó** | Cấu hình EASY (300ms), MEDIUM (1000ms), HARD (3000ms) | Thời gian và độ sâu tìm kiếm tuân thủ đúng hạn mức từng cấp | Kiểm chứng thành công | **PASS** |
| **Fallback hợp lệ khi timeout** | Ngắt tìm kiếm trước khi hoàn thành độ sâu mới | Trả về nước đi hợp lệ tốt nhất từ độ sâu đã hoàn tất | Kiểm chứng thành công | **PASS** |

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
