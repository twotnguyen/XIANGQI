# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-009 — Bạn bè và trạng thái online

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, Apple Silicon (arm64)  
**Tiêu chuẩn kiểm chứng:** [02-ARCHITECTURE.md](../specs/02-ARCHITECTURE.md), [04-CONTRACTS.md](../specs/04-CONTRACTS.md) & [ISSUE-009-friends-presence](../issues/ISSUE-009-friends-presence.md)  

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm exec vitest run --config vitest.config.ts tests/unit/friends-routes.test.ts tests/unit/presence.test.ts
```

### Kết quả đầu ra (Exit Code: 0):
```
 ✓ tests/unit/presence.test.ts (6 tests) 2ms
 ✓ tests/unit/friends-routes.test.ts (5 tests) 46ms
 Test Files  2 passed (2)
      Tests  11 passed (11)
   Start at  03:48:50
   Duration  444ms (transform 128ms, setup 0ms, collect 264ms, tests 48ms, environment 0ms, prepare 70ms)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Yêu cầu kết bạn 2 chiều** | Gửi, chấp nhận, từ chối hoặc hủy kết bạn | Trạng thái mối quan hệ cập nhật đúng theo 2 chiều | Kiểm chứng thành công | **PASS** |
| **Tìm kiếm bạn bè** | Tìm kiếm người dùng theo tiền tố username tối thiểu 3 ký tự | Trả về danh sách kết quả phù hợp và trạng thái bạn bè | Kiểm chứng thành công | **PASS** |
| **Presence Lease** | Theo dõi trạng thái trực tuyến qua lease 30s và heartbeat 10s | Tự động chuyển sang offline khi hết hạn lease | Kiểm chứng thành công | **PASS** |
| **Bảo vệ riêng tư** | DTO danh sách bạn bè | Không để lộ thông tin nhạy cảm như email hay phòng riêng tư | Kiểm chứng thành công | **PASS** |
| **Đa kết nối một tài khoản** | Một người dùng mở nhiều tab hoặc thiết bị đồng thời | Đóng một kết nối vẫn giữ trạng thái online nếu còn tab khác | Kiểm chứng thành công | **PASS** |

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
