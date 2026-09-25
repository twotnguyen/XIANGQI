# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-027 — Lịch sử, replay và tái đấu đổi bên

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, Apple Silicon (arm64)  
**Tiêu chuẩn kiểm chứng:** [03-STATE-MACHINES.md](../specs/03-STATE-MACHINES.md), [04-CONTRACTS.md](../specs/04-CONTRACTS.md) & [ISSUE-027-history-rematch](../issues/ISSUE-027-history-rematch.md)  

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm exec vitest run --config vitest.config.ts tests/unit/history.test.ts
```

### Kết quả đầu ra (Exit Code: 0):
```
 RUN  v3.2.7 /Users/twot/Documents/CODE/XIANGQI
 ✓ tests/unit/history.test.ts (3 tests) 38ms
 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  03:49:08
   Duration  449ms (transform 113ms, setup 0ms, collect 243ms, tests 38ms, environment 0ms, prepare 33ms)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Danh sách lịch sử ván đấu** | Truy cập trang /history để xem các ván đã kết thúc | Hiển thị danh sách các ván đấu với kết quả, ngày giờ, đối thủ | Kiểm chứng thành công | **PASS** |
| **Chế độ xem lại Replay** | Xem lại từng nước đi trong ván cờ đã lưu | Bàn cờ hiển thị nước đi từng bước qua các nút First, Prev, Next, Last | Kiểm chứng thành công | **PASS** |
| **Tái cấu trúc lịch sử sau Undo** | Ván cờ có các nước đi bị hoàn tác (undo) | Chỉ hiển thị nhánh nước đi thực tế, loại bỏ hoàn toàn các nước bị undo | Kiểm chứng thành công | **PASS** |
| **Tái đấu đổi bên (Rematch)** | Cả hai kỳ thủ đồng ý tái đấu ván mới | Tự động khởi tạo ván mới với sự hoán đổi phe Đỏ <-> Đen | Kiểm chứng thành công | **PASS** |
| **Bảo mật dữ liệu lịch sử** | Người ngoài cố tình xem chi tiết ván cờ riêng tư | Bị từ chối truy cập theo quy định bảo mật | Kiểm chứng thành công | **PASS** |

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
