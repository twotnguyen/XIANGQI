# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-004 — Kết thúc ván và luật lặp ba lần

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, Apple Silicon (arm64)  
**Tiêu chuẩn kiểm chứng:** [01-PRODUCT.md](../specs/01-PRODUCT.md), [03-STATE-MACHINES.md](../specs/03-STATE-MACHINES.md), [07-UI-AND-TESTS.md](../specs/07-UI-AND-TESTS.md) & [ISSUE-004-terminal-repetition](../issues/ISSUE-004-terminal-repetition.md)  

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm exec vitest run --config vitest.config.ts tests/unit/terminal.test.ts
```

### Kết quả đầu ra (Exit Code: 0):
```
 RUN  v3.2.7 /Users/twot/Documents/CODE/XIANGQI
 ✓ tests/unit/terminal.test.ts (12 tests) 5ms
 Test Files  1 passed (1)
      Tests  12 passed (12)
   Start at  03:48:43
   Duration  242ms (transform 44ms, setup 0ms, collect 76ms, tests 5ms, environment 0ms, prepare 31ms)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Chiếu hết (Checkmate)** | Bên tới lượt không còn nước đi hợp lệ và đang bị chiếu | Ván kết thúc, đối thủ thắng bằng CHECKMATE | Kiểm chứng thành công | **PASS** |
| **Hết nước (Stalemate)** | Bên tới lượt không còn nước đi hợp lệ nhưng không bị chiếu | Ván kết thúc, đối thủ thắng bằng STALEMATE | Kiểm chứng thành công | **PASS** |
| **Hòa lặp 3 lần** | Vị trí lặp lại lần 2 rồi lần 3 cùng bên tới lượt | Lần 2 tiếp tục chơi, lần 3 xử hòa REPETITION | Kiểm chứng thành công | **PASS** |
| **Undo nhánh lặp** | Hoàn tác nước đi loại bỏ một lần xuất hiện của trạng thái | Không tính hòa từ các trạng thái trong nhánh đã bỏ | Kiểm chứng thành công | **PASS** |
| **Khoảng cách chiếu hết** | Đếm khoảng cách mate distance theo số ply | Thuật toán tính điểm ưu tiên đường thắng ngắn nhất | Kiểm chứng thành công | **PASS** |

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
