# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-012 — Ván online, transaction nước đi và resync

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, Apple Silicon (arm64)  
**Tiêu chuẩn kiểm chứng:** [03-STATE-MACHINES.md](../specs/03-STATE-MACHINES.md), [04-CONTRACTS.md](../specs/04-CONTRACTS.md) & [ISSUE-012-authoritative-match](../issues/ISSUE-012-authoritative-match.md)  

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm exec vitest run --config vitest.config.ts tests/unit/match-routes.test.ts tests/integration/faults.test.ts
```

### Kết quả đầu ra (Exit Code: 0):
```
 ✓ tests/integration/faults.test.ts (2 tests) 36ms
 ✓ tests/unit/match-routes.test.ts (5 tests) 44ms
 Test Files  2 passed (2)
      Tests  7 passed (7)
   Start at  03:48:54
   Duration  461ms (transform 117ms, setup 0ms, collect 505ms, tests 80ms, environment 0ms, prepare 69ms)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Giao dịch Nước đi Nguyên khối** | Người chơi gửi nước đi hợp lệ qua HTTP/Socket | Áp dụng nước đi, tăng match version, ghi nhận command receipt | Kiểm chứng thành công | **PASS** |
| **Lọc trùng lệnh Idempotent** | Gửi lại cùng một commandId với cùng tham số | Trả về kết quả cũ mà không thực hiện nước đi lần 2 | Kiểm chứng thành công | **PASS** |
| **Phát hiện Tái sử dụng CommandId** | Gửi cùng commandId nhưng thay đổi thông số nước đi | Từ chối với mã lỗi COMMAND_ID_REUSED | Kiểm chứng thành công | **PASS** |
| **Tranh chấp Phiên bản (Version Race)** | Hai yêu cầu cùng gửi với cùng match version | Chỉ một yêu cầu được chấp thuận, yêu cầu sau báo lỗi xung đột | Kiểm chứng thành công | **PASS** |
| **Khôi phục Snapshot** | Client yêu cầu lấy lại dữ liệu sau khi mất mạng | Trả về snapshot ván cờ đầy đủ và chính xác nhất từ DB | Kiểm chứng thành công | **PASS** |

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
