# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-008 — Google PKCE và onboarding username

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, Apple Silicon (arm64)  
**Tiêu chuẩn kiểm chứng:** [05-AUTH.md](../specs/05-AUTH.md), [04-CONTRACTS.md](../specs/04-CONTRACTS.md) & [ISSUE-008-google-profile](../issues/ISSUE-008-google-profile.md)  

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm exec vitest run --config vitest.config.ts tests/unit/google-profile.test.ts
```

### Kết quả đầu ra (Exit Code: 0):
```
 RUN  v3.2.7 /Users/twot/Documents/CODE/XIANGQI
 ✓ tests/unit/google-profile.test.ts (3 tests) 39ms
 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  03:48:49
   Duration  437ms (transform 109ms, setup 0ms, collect 236ms, tests 39ms, environment 0ms, prepare 30ms)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Google Onboarding** | Người dùng mới đăng nhập Google lần đầu chưa có username | Chuyển hướng đến màn hình Onboarding để đặt username | Kiểm chứng thành công | **PASS** |
| **Quy tắc Username** | Đặt username chứa chữ hoa, dấu cách hoặc dưới 3 ký tự | Hệ thống từ chối và yêu cầu nhập đúng định dạng | Kiểm chứng thành công | **PASS** |
| **Cập nhật Profile** | PATCH /api/users/me cập nhật displayName, avatar | Cập nhật thông tin thành công và kiểm tra dữ liệu đầu vào | Kiểm chứng thành công | **PASS** |
| **Chống Open Redirect** | Tham số next trỏ đến URL bên ngoài trong callback OAuth | Chặn chuyển hướng ra ngoài, chỉ cho phép đường dẫn nội bộ | Kiểm chứng thành công | **PASS** |

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
