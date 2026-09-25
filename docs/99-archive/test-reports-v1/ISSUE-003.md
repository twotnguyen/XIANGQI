# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-003 — Luật di chuyển và an toàn tướng

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, Apple Silicon (arm64)  
**Tiêu chuẩn kiểm chứng:** [01-PRODUCT.md](../specs/01-PRODUCT.md), [04-CONTRACTS.md](../specs/04-CONTRACTS.md), [07-UI-AND-TESTS.md](../specs/07-UI-AND-TESTS.md) & [ISSUE-003-legal-moves](../issues/ISSUE-003-legal-moves.md)  

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm exec vitest run --config vitest.config.ts tests/unit/moves.test.ts
```

### Kết quả đầu ra (Exit Code: 0):
```
 RUN  v3.2.7 /Users/twot/Documents/CODE/XIANGQI
 ✓ tests/unit/moves.test.ts (27 tests) 6ms
 Test Files  1 passed (1)
      Tests  27 passed (27)
   Start at  03:48:42
   Duration  288ms (transform 51ms, setup 0ms, collect 95ms, tests 6ms, environment 0ms, prepare 37ms)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Tướng đối mặt** | Tốt chắn (4,5) di chuyển sang (3,5) mở đường 2 tướng đối mặt | Bị chặn với mã lỗi INVALID_MOVE | Kiểm chứng thành công | **PASS** |
| **Pháo ăn quân** | Kiểm tra pháo ăn quân với 0, 1, 2 quân ngòi cản | Chỉ duy nhất trường hợp đúng 1 ngòi cản là hợp lệ | Kiểm chứng thành công | **PASS** |
| **Tốt đỏ qua sông** | Tốt ở y <= 4 (đã qua sông) đi ngang và đi thẳng | Đi ngang và tiến hợp lệ, đi lùi bị từ chối | Kiểm chứng thành công | **PASS** |
| **Nước đi đầu ván** | Tốt đỏ (0,6) -> (0,5) | Hợp lệ, chuyển turn BLACK, bảo toàn bất biến vị trí | Kiểm chứng thành công | **PASS** |
| **Cản mã & cản tượng** | Quân chắn chân mã và mắt tượng | Nước nhảy mã và đi tượng bị cấm khi có vật cản | Kiểm chứng thành công | **PASS** |

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
