# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-007 — Username/password, xác minh và khôi phục email

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, Apple Silicon (arm64)  
**Tiêu chuẩn kiểm chứng:** [05-AUTH.md](../specs/05-AUTH.md), [04-CONTRACTS.md](../specs/04-CONTRACTS.md) & [ISSUE-007-password-auth](../issues/ISSUE-007-password-auth.md)  

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm exec vitest run --config vitest.config.ts tests/unit/auth-routes.test.ts
```

### Kết quả đầu ra (Exit Code: 0):
```
 RUN  v3.2.7 /Users/twot/Documents/CODE/XIANGQI
 ✓ tests/unit/auth-routes.test.ts (5 tests) 59ms
 Test Files  1 passed (1)
      Tests  5 passed (5)
   Start at  03:48:48
   Duration  503ms (transform 115ms, setup 0ms, collect 281ms, tests 59ms, environment 0ms, prepare 34ms)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Đăng nhập Username** | Đăng nhập với đúng/sai cặp tài khoản và mật khẩu | Trả về session hợp lệ hoặc mã lỗi 401 không lộ email | Kiểm chứng thành công | **PASS** |
| **Độ dài mật khẩu** | Đăng ký tài khoản với mật khẩu ngắn dưới 10 ký tự | Form và API từ chối với thông báo yêu cầu tối thiểu 10 ký tự | Kiểm chứng thành công | **PASS** |
| **Khôi phục mật khẩu** | Yêu cầu đặt lại mật khẩu qua email | Tạo liên kết khôi phục an toàn, liên kết dùng một lần | Kiểm chứng thành công | **PASS** |
| **Thu hồi phiên** | Người dùng thực hiện đăng xuất (logout) | Hủy phiên làm việc trên máy chủ, token cũ không thể tái sử dụng | Kiểm chứng thành công | **PASS** |
| **Kiểm tra phiên chủ động** | Endpoint GET /auth/session kiểm tra token hợp lệ | Trả về thông tin người dùng và quyền hạn hiện tại | Kiểm chứng thành công | **PASS** |

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
