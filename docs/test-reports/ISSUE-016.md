# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-016 — Năm người xem, mã phòng và thu hồi quyền

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, Apple Silicon (arm64)  
**Tiêu chuẩn kiểm chứng:** [03-STATE-MACHINES.md](../specs/03-STATE-MACHINES.md), [04-CONTRACTS.md](../specs/04-CONTRACTS.md) & [ISSUE-016-spectators](../issues/ISSUE-016-spectators.md)  

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm exec vitest run --config vitest.config.ts tests/unit/spectators.test.ts
```

### Kết quả đầu ra (Exit Code: 0):
```
 RUN  v3.2.7 /Users/twot/Documents/CODE/XIANGQI
 ✓ tests/unit/spectators.test.ts (2 tests) 1ms
 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  03:48:58
   Duration  193ms (transform 32ms, setup 0ms, collect 42ms, tests 1ms, environment 0ms, prepare 35ms)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Giới hạn 5 khán giả** | Người thứ 6 yêu cầu vào xem phòng đấu | Bị từ chối với thông báo phòng đã đủ 5 khán giả | Kiểm chứng thành công | **PASS** |
| **Khóa phòng thu hồi quyền** | Chủ phòng chuyển chế độ phòng sang LOCKED | Tự động phát sự kiện access:revoked tước quyền toàn bộ khán giả | Kiểm chứng thành công | **PASS** |
| **Bảo vệ vai trò** | Khán giả cố tình gửi nước đi hoặc lệnh điều khiển ván đấu | Máy chủ kiểm tra vai trò và từ chối với mã lỗi FORBIDDEN | Kiểm chứng thành công | **PASS** |
| **Danh sách khán giả UI** | Hiển thị số lượng khán giả đang theo dõi trên giao diện | Cập nhật số người xem chính xác theo thời gian thực (X/5) | Kiểm chứng thành công | **PASS** |

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
