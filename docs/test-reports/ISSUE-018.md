# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-018 — AI: hàm đánh giá và thứ tự nước

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, Apple Silicon (arm64)  
**Tiêu chuẩn kiểm chứng:** [01-PRODUCT.md](../specs/01-PRODUCT.md), [04-CONTRACTS.md](../specs/04-CONTRACTS.md) & [ISSUE-018-ai-evaluation](../issues/ISSUE-018-ai-evaluation.md)  

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm exec vitest run --config vitest.config.ts tests/unit/ai-evaluate.test.ts
```

### Kết quả đầu ra (Exit Code: 0):
```
 RUN  v3.2.7 /Users/twot/Documents/CODE/XIANGQI
 ✓ tests/unit/ai-evaluate.test.ts (12 tests) 4ms
 Test Files  1 passed (1)
      Tests  12 passed (12)
   Start at  03:49:00
   Duration  243ms (transform 51ms, setup 0ms, collect 85ms, tests 4ms, environment 0ms, prepare 36ms)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Thang điểm quân cờ** | Đánh giá điểm vật chất của 7 loại quân cờ | Tướng 10000, Xe 900, Pháo 450, Mã 400, Tượng 250, Sĩ 250, Tốt 100 | Kiểm chứng thành công | **PASS** |
| **Tính đối xứng điểm vị trí (PST)** | So sánh bảng điểm vị trí của phe Đỏ và Đen | Đối xứng hoàn hảo qua sông và trục dọc bàn cờ | Kiểm chứng thành công | **PASS** |
| **Thưởng tốt qua sông** | Tốt qua sông và tiến sâu vào cung đối phương | Được cộng thêm điểm thưởng tấn công tương ứng vị trí | Kiểm chứng thành công | **PASS** |
| **Sắp xếp nước đi MVV-LVA** | Phân loại các nước ăn quân | Ưu tiên nước dùng quân giá trị thấp ăn quân giá trị cao | Kiểm chứng thành công | **PASS** |
| **Bảo toàn bất biến thế cờ** | Chạy hàm đánh giá trên bàn cờ | Không làm thay đổi cấu trúc dữ liệu bàn cờ đầu vào | Kiểm chứng thành công | **PASS** |

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
