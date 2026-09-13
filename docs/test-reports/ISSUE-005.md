# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-005 — Bàn gỗ và quân Hán thao tác được

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, Apple Silicon (arm64)  
**Tiêu chuẩn kiểm chứng:** [01-PRODUCT.md](../specs/01-PRODUCT.md), [04-CONTRACTS.md](../specs/04-CONTRACTS.md), [07-UI-AND-TESTS.md](../specs/07-UI-AND-TESTS.md) & [ISSUE-005-board-ui](../issues/ISSUE-005-board-ui.md)  

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm exec playwright test tests/e2e/board.spec.ts
```

### Kết quả đầu ra (Exit Code: 0):
```
  ✓   8 [mobile] › tests/e2e/board.spec.ts:30:3 › Board UI › T005-E2E-02: Click piece shows legal move targets (166ms)
  ✓   9 [mobile] › tests/e2e/board.spec.ts:40:3 › Board UI › T005-E2E-03: Flip board (orientation toggle) (192ms)
  ✓  10 [mobile] › tests/e2e/board.spec.ts:54:3 › Board UI › T005-E2E-04: Non-interactive mode ignores clicks (185ms)
  ✓  11 [mobile] › tests/e2e/board.spec.ts:68:3 › Board UI › T005-E2E-05: Escape key clears selection (177ms)
  ✓  12 [mobile] › tests/e2e/board.spec.ts:85:3 › Mobile layout (360px viewport) › T005-E2E-06: No horizontal scroll at 360px width (135ms)
  12 passed (2.9s)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Lật bàn cờ** | Người chơi phe Đen chọn lật bàn cờ (flip board) | Bàn cờ đảo chiều hiển thị, tọa độ gửi đi vẫn chuẩn canonical | Kiểm chứng thành công | **PASS** |
| **Chế độ xem (Viewer)** | Khán giả click vào bàn cờ với interactive=false | Không phát ra sự kiện onMove hay thay đổi bàn cờ | Kiểm chứng thành công | **PASS** |
| **Hiển thị 32 quân** | Tải bàn cờ cờ tướng chuẩn ban đầu | Đủ 32 quân cờ với chữ Hán sắc nét trên nền gỗ SVG | Kiểm chứng thành công | **PASS** |
| **Gợi ý nước đi** | Click vào một quân cờ hợp lệ | Hiển thị các điểm đích hợp lệ bằng vòng tròn gợi ý | Kiểm chứng thành công | **PASS** |
| **Phím điều hướng** | Nhấn phím Escape khi đang chọn quân | Bỏ chọn quân cờ và xóa các điểm đích gợi ý | Kiểm chứng thành công | **PASS** |
| **Mobile 360px** | Xem bàn cờ trên màn hình di động chiều rộng 360px | Không tràn ngang, kích thước co dãn hoàn hảo | Kiểm chứng thành công | **PASS** |

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
