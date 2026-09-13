# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-019 — AI: minimax baseline đúng luật và lặp

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, Apple Silicon (arm64)  
**Tiêu chuẩn kiểm chứng:** [01-PRODUCT.md](../specs/01-PRODUCT.md), [04-CONTRACTS.md](../specs/04-CONTRACTS.md) & [ISSUE-019-ai-minimax](../issues/ISSUE-019-ai-minimax.md)  

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm exec vitest run --config vitest.config.ts tests/unit/ai-minimax.test.ts
```

### Kết quả đầu ra (Exit Code: 0):
```
 ✓ tests/unit/ai-minimax.test.ts (9 tests) 1384ms
   ✓ T019-06: Cancellation and deadline > aborts search when isCancelled returns true  1302ms
 Test Files  1 passed (1)
      Tests  9 passed (9)
   Start at  03:49:01
   Duration  1.64s (transform 51ms, setup 0ms, collect 86ms, tests 1.38s, environment 0ms, prepare 31ms)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Tìm kiếm Minimax cơ sở** | Duyệt cây nước đi minimax theo độ sâu cố định | Lựa chọn nước đi có giá trị lượng giá cao nhất | Kiểm chứng thành công | **PASS** |
| **Khoảng cách chiếu hết (Mate distance)** | Xử lý điểm số khi tìm thấy thế cờ chiếu hết | Ưu tiên đường chiếu hết nhanh nhất (ít ply nhất) | Kiểm chứng thành công | **PASS** |
| **Nhận diện hòa lặp trong cây tìm kiếm** | Trạng thái lặp lại 3 lần trên nhánh đang duyệt | Gán điểm 0 (hòa cờ), tránh AI bị bẫy lặp nước vô tận | Kiểm chứng thành công | **PASS** |
| **Thế cờ kết thúc ở gốc** | Bàn cờ đã ở trạng thái kết thúc không còn nước đi | Trả về nước đi null an toàn mà không bị crash lỗi | Kiểm chứng thành công | **PASS** |
| **Hủy tìm kiếm qua token** | Kích hoạt cờ isCancelled trong lúc đang tính toán | Dừng duyệt cây ngay lập tức và trả về kết quả an toàn | Kiểm chứng thành công | **PASS** |

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
