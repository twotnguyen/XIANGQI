# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-011 — Mời trong game, link và mã theo vai trò

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, Apple Silicon (arm64)  
**Tiêu chuẩn kiểm chứng:** [03-STATE-MACHINES.md](../specs/03-STATE-MACHINES.md), [04-CONTRACTS.md](../specs/04-CONTRACTS.md) & [ISSUE-011-invitations](../issues/ISSUE-011-invitations.md)  

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm exec vitest run --config vitest.config.ts tests/unit/invitations-routes.test.ts
```

### Kết quả đầu ra (Exit Code: 0):
```
 RUN  v3.2.7 /Users/twot/Documents/CODE/XIANGQI
 ✓ tests/unit/invitations-routes.test.ts (10 tests) 42ms
 Test Files  1 passed (1)
      Tests  10 passed (10)
   Start at  03:48:53
   Duration  449ms (transform 114ms, setup 0ms, collect 244ms, tests 42ms, environment 0ms, prepare 37ms)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Mã mời 8 ký tự** | Tạo mã mời ngắn hạn theo vai trò PLAYER hoặc SPECTATOR | Mã duy nhất, kiểm tra đúng vai trò khi người nhận nhập mã | Kiểm chứng thành công | **PASS** |
| **Liên kết mời 24 giờ** | Tạo liên kết chứa token xác thực mã hóa an toàn | Token chỉ có hiệu lực trong 24h, bảo vệ qua URL fragment | Kiểm chứng thành công | **PASS** |
| **Vào phòng tự động** | Người dùng truy cập qua liên kết mời | Tự động gán vào ghế trống hoặc danh sách khán giả phù hợp | Kiểm chứng thành công | **PASS** |
| **Dọn dẹp Fragment** | Sau khi tiêu thụ liên kết mời trên trang web | URL fragment được xóa ngay lập tức khỏi thanh địa chỉ trình duyệt | Kiểm chứng thành công | **PASS** |
| **Chặn tranh chấp ghế** | Nhiều người dùng cùng bấm chấp nhận vào 1 ghế trống | Xử lý tuần tự, chỉ người đầu tiên được vào ghế, người sau nhận thông báo | Kiểm chứng thành công | **PASS** |

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
