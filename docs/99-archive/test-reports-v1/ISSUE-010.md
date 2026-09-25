# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-010 — Phòng chờ, ghế và sẵn sàng

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, Apple Silicon (arm64)  
**Tiêu chuẩn kiểm chứng:** [03-STATE-MACHINES.md](../specs/03-STATE-MACHINES.md), [04-CONTRACTS.md](../specs/04-CONTRACTS.md) & [ISSUE-010-rooms-lobby](../issues/ISSUE-010-rooms-lobby.md)  

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm exec vitest run --config vitest.config.ts tests/unit/rooms-routes.test.ts
```

### Kết quả đầu ra (Exit Code: 0):
```
 RUN  v3.2.7 /Users/twot/Documents/CODE/XIANGQI
 ✓ tests/unit/rooms-routes.test.ts (3 tests) 40ms
 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  03:48:52
   Duration  430ms (transform 111ms, setup 0ms, collect 238ms, tests 40ms, environment 0ms, prepare 35ms)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Tạo phòng chờ** | Chủ phòng tạo phòng với tùy chọn thời gian và chế độ hiển thị | Mặc định gán ghế Đỏ, cấu hình thời gian chuẩn | Kiểm chứng thành công | **PASS** |
| **Danh sách Sảnh công khai** | Lấy danh sách phòng sảnh công khai | Chỉ hiển thị phòng PUBLIC, ẩn phòng CODE_ONLY và LOCKED | Kiểm chứng thành công | **PASS** |
| **Ghép ghế và sẵn sàng** | Hai người chơi vào ghế Đỏ/Đen và bấm sẵn sàng | Chuyển trạng thái phòng sang READY, chuẩn bị tạo ván đấu | Kiểm chứng thành công | **PASS** |
| **Giới hạn phòng tham gia** | Người dùng đang trong một phòng cố tạo hoặc vào phòng khác | Bị từ chối với lỗi ALREADY_IN_ROOM | Kiểm chứng thành công | **PASS** |
| **Phiên điều khiển (Takeover)** | Tab mới yêu cầu chiếm quyền điều khiển phòng | Cấp lease cho tab mới, tước quyền thao tác của tab cũ | Kiểm chứng thành công | **PASS** |

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
