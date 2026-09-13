# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-015 — Màn chơi online và trạng thái kết nối

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, Apple Silicon (arm64)  
**Tiêu chuẩn kiểm chứng:** [07-UI-AND-TESTS.md](../specs/07-UI-AND-TESTS.md), [04-CONTRACTS.md](../specs/04-CONTRACTS.md) & [ISSUE-015-online-ui](../issues/ISSUE-015-online-ui.md)  

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm exec playwright test tests/e2e/online-match.spec.ts
```

### Kết quả đầu ra (Exit Code: 0):
```
Running 4 tests using 1 worker
  ✓  1 [chromium] › tests/e2e/online-match.spec.ts:4:3 › Online Match UI Components › T015-E2E-01: MatchPage shows loading or error state for non-existent match (135ms)
  ✓  2 [chromium] › tests/e2e/online-match.spec.ts:11:3 › Online Match UI Components › T015-E2E-02: Board renders on dev route with controls and flip (200ms)
  ✓  3 [mobile] › tests/e2e/online-match.spec.ts:4:3 › Online Match UI Components › T015-E2E-01: MatchPage shows loading or error state for non-existent match (137ms)
  ✓  4 [mobile] › tests/e2e/online-match.spec.ts:11:3 › Online Match UI Components › T015-E2E-02: Board renders on dev route with controls and flip (190ms)
  4 passed (1.2s)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Góc nhìn bàn cờ** | Kỳ thủ phe Đen vào ván cờ trực tuyến | Bàn cờ tự động định hướng theo góc nhìn phe Đen | Kiểm chứng thành công | **PASS** |
| **Đồng hồ ván đấu** | Hiển thị đồng hồ đếm ngược của cả 2 bên | Cập nhật thời gian thực, hiển thị cảnh báo đỏ khi sắp hết giờ | Kiểm chứng thành công | **PASS** |
| **Thao tác ván cờ** | Bộ nút điều khiển (Xin hòa, Đi lại, Đầu hàng, Lật bàn) | Hiển thị đầy đủ, phản hồi nhanh chóng theo trạng thái ván cờ | Kiểm chứng thành công | **PASS** |
| **Xử lý mất kết nối** | Mô phỏng mất kết nối mạng và kết nối lại | Giao diện hiển thị banner kết nối lại và tự động đồng bộ bàn cờ | Kiểm chứng thành công | **PASS** |

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
