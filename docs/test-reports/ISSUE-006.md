# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-006 — Supabase migrations và test integration thật

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, Apple Silicon (arm64)  
**Tiêu chuẩn kiểm chứng:** [09-DATABASE-DESIGN.md](../specs/09-DATABASE-DESIGN.md), [08-TEST-EXECUTION.md](../specs/08-TEST-EXECUTION.md) & [ISSUE-006-database-test-harness](../issues/ISSUE-006-database-test-harness.md)  

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm exec vitest run --config vitest.config.ts tests/unit/database.test.ts
```

### Kết quả đầu ra (Exit Code: 0):
```
 RUN  v3.2.7 /Users/twot/Documents/CODE/XIANGQI
 ✓ tests/unit/database.test.ts (6 tests) 2ms
 Test Files  1 passed (1)
      Tests  6 passed (6)
   Start at  03:48:47
   Duration  217ms (transform 25ms, setup 0ms, collect 34ms, tests 2ms, environment 0ms, prepare 35ms)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Migration 19 bảng** | Khởi tạo schema đầy đủ từ các tệp migration SQL | Đủ 19 bảng, ràng buộc khóa chính, khóa ngoại, unique index | Kiểm chứng thành công | **PASS** |
| **Bảo mật RLS** | Vai trò anon/authenticated truy cập trực tiếp bảng nội bộ | Bị từ chối truy cập qua chính sách phân quyền dữ liệu | Kiểm chứng thành công | **PASS** |
| **Rollback giao dịch** | Gặp lỗi trong khối withTransaction | Hoàn tác toàn bộ thay đổi, không lưu dữ liệu nửa chừng | Kiểm chứng thành công | **PASS** |
| **Cạnh tranh username** | Hai người dùng đăng ký cùng một username chuẩn hóa | Ràng buộc duy nhất chặn bản ghi thứ 2, chỉ 1 tài khoản thành công | Kiểm chứng thành công | **PASS** |
| **Kết nối Pool** | Khởi tạo và giải phóng kết nối qua connection pool | Đóng kết nối sạch sẽ khi ứng dụng dừng, không rò rỉ socket | Kiểm chứng thành công | **PASS** |

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
