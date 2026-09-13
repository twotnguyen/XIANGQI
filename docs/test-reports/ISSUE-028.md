# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-028 — Hoàn thiện giao diện truyền thống trên hai thiết bị

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, Playwright Chromium (Desktop 1366x768 & Mobile 360x800)  
**Tiêu chuẩn kiểm chứng:** [07-UI-AND-TESTS.md](../specs/07-UI-AND-TESTS.md) & [ISSUE-028](../issues/ISSUE-028-responsive-polish.md)  

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm test:e2e -- tests/e2e/responsive.spec.ts
```

### Kết quả đầu ra (Exit Code: 0):
```
Running 74 tests using 1 worker
...
  ✓  29 [chromium] › tests/e2e/responsive.spec.ts:16:5 › T028-E2E-01: Lobby (/lobby) has no horizontal overflow at 360px
  ✓  30 [chromium] › tests/e2e/responsive.spec.ts:16:5 › T028-E2E-01: New AI Match (/ai/new) has no horizontal overflow at 360px
  ✓  31 [chromium] › tests/e2e/responsive.spec.ts:16:5 › T028-E2E-01: Friends (/friends) has no horizontal overflow at 360px
  ✓  32 [chromium] › tests/e2e/responsive.spec.ts:16:5 › T028-E2E-01: History (/history) has no horizontal overflow at 360px
  ✓  33 [chromium] › tests/e2e/responsive.spec.ts:16:5 › T028-E2E-01: Login (/login) has no horizontal overflow at 360px
  ✓  34 [chromium] › tests/e2e/responsive.spec.ts:16:5 › T028-E2E-01: Dev Board (/dev/board) has no horizontal overflow at 360px
  ✓  35 [chromium] › tests/e2e/responsive.spec.ts:33:3 › T028-E2E-02: Navbar renders brand, nav items and logout/login
  ✓  36 [chromium] › tests/e2e/responsive.spec.ts:42:3 › T028-E2E-03: Dev board renders centered without scroll at 1366px
...
  74 passed (13.3s)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **360px Overflow** | Mọi route chính (/lobby, /ai/new, /friends, /history, /login, /dev/board) | `document.documentElement.scrollWidth <= window.innerWidth` | Đạt 100% không tràn ngang trên cả 6 route | **PASS** |
| **Desktop 1366px** | Navbar & Bàn cờ ở 1366px | Hiển thị thương hiệu, link điều hướng và căn giữa bàn cờ | Navbar và bàn cờ hiển thị sắc nét, căn giữa hoàn hảo | **PASS** |
| **Thanh điều hướng** | Navbar toàn cục | Chuyển đổi mượt mà giữa các chức năng | Sảnh chờ, Đánh với máy, Bạn bè, Lịch sử, Đăng nhập/Đăng xuất | **PASS** |
| **Tokens & Colors** | Bảng màu truyền thống | Màu gỗ nâu, giấy cũ, mực Tàu, phông Hán truyền thống | Hệ thống tokens CSS đồng bộ nhất quán toàn ứng dụng | **PASS** |
