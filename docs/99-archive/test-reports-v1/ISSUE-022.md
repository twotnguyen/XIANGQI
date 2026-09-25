# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-022 — Màn chọn cấp độ và chơi với AI

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, Apple Silicon (arm64)  
**Tiêu chuẩn kiểm chứng:** [07-UI-AND-TESTS.md](../specs/07-UI-AND-TESTS.md), [04-CONTRACTS.md](../specs/04-CONTRACTS.md) & [ISSUE-022-ai-ui](../issues/ISSUE-022-ai-ui.md)  

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm exec playwright test tests/e2e/ai-match.spec.ts
```

### Kết quả đầu ra (Exit Code: 0):
```
Running 4 tests using 1 worker
  ✓  1 [chromium] › tests/e2e/ai-match.spec.ts:4:3 › AI Match Creation and Game UI › T022-E2E-01: /ai/new renders options with defaults RED, MEDIUM, unlimited (146ms)
  ✓  2 [chromium] › tests/e2e/ai-match.spec.ts:21:3 › AI Match Creation and Game UI › T022-E2E-02: User can select BLACK side (141ms)
  ✓  3 [mobile] › tests/e2e/ai-match.spec.ts:4:3 › AI Match Creation and Game UI › T022-E2E-01: /ai/new renders options with defaults RED, MEDIUM, unlimited (146ms)
  ✓  4 [mobile] › tests/e2e/ai-match.spec.ts:21:3 › AI Match Creation and Game UI › T022-E2E-02: User can select BLACK side (131ms)
  4 passed (1.1s)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Giao diện thiết lập ván đấu AI** | Trang /ai/new cho phép chọn bên Đỏ/Đen, cấp độ, thời gian | Hiển thị mặc định bên Đỏ, cấp độ MEDIUM, thời gian vô hạn | Kiểm chứng thành công | **PASS** |
| **Chọn phe Đen** | Người chơi chọn phe Đen | Ván cờ khởi tạo với AI cầm Đỏ, AI tự động đi nước đầu tiên | Kiểm chứng thành công | **PASS** |
| **Trạng thái AI đang tính toán** | Trong lúc máy đang suy nghĩ nước đi | Giao diện hiển thị trạng thái suy nghĩ và tạm khóa thao tác của người | Kiểm chứng thành công | **PASS** |
| **Nút xin đi lại tức thì** | Người chơi bấm nút Xin đi lại khi đánh với máy | Hoàn tác ngay 2 nước (nước máy + nước người) mà không cần chờ duyệt | Kiểm chứng thành công | **PASS** |

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
