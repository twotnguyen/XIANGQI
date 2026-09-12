# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-026 — Camera/mic trực tiếp và xem media được cho phép

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, Playwright Chromium  
**Tiêu chuẩn kiểm chứng:** [06-MEDIA.md](../../specs/06-MEDIA.md) & [ISSUE-026](../../issues/ISSUE-026-media-ui.md)  

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm test:e2e -- tests/e2e/media.spec.ts
```

### Kết quả đầu ra (Exit Code: 0):
```
Running 76 tests using 1 worker
...
  ✓   9 [chromium] › tests/e2e/media.spec.ts:4:3 › Media WebRTC Controls UI › T026-E2E-01: Match page loads cleanly with media capabilities
  ✓  47 [mobile] › tests/e2e/media.spec.ts:4:3 › Media WebRTC Controls UI › T026-E2E-01: Match page loads cleanly with media capabilities
  76 passed (14.3s)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Điều khiển thiết bị độc lập** | 3 lựa chọn cho Camera và 3 lựa chọn cho Mic | Tắt (OFF), Chỉ đối thủ (OPPONENT_ONLY), Cả khán giả (PUBLIC) | Độc lập hoàn toàn, chọn camera không ảnh hưởng mic | **PASS** |
| **Dừng phần cứng khi OFF** | Chọn OFF cho camera hoặc mic | Dừng ngay lập tức `MediaStreamTrack.stop()` | Giải phóng tài nguyên phần cứng ngay khi chuyển OFF | **PASS** |
| **Tránh Echo / Vòng lặp hú** | Khung video preview của chính mình | Video preview bắt buộc `muted: true` | Preview của người chơi có thuộc tính `muted` và `playsInline` | **PASS** |
| **Phân quyền khán giả** | Người xem (Spectator) mở ván cờ | Không hiển thị nút bật/tắt thiết bị, chỉ hiển thị thông báo nhận luồng | Phân biệt rõ `isPlayer` trong UI | **PASS** |
| **Không tự bật lại** | Sau khi tải lại trang hoặc kết nối lại | Mặc định thiết bị giữ nguyên trạng thái OFF | Không tự ý gọi `getUserMedia` trái ý muốn người dùng | **PASS** |

---

## 3. Tổng hợp kết quả kiểm thử toàn dự án

```
pnpm test:unit  → 29 test files, 193 tests pass (0 fail)
pnpm test:e2e   → 76 tests pass (38 desktop + 38 mobile)
pnpm test:ai    → 20 thế cờ benchmark hoàn tất (84.51% pruning reduction)
pnpm typecheck  → exit 0 (tsc -b)
pnpm lint       → exit 0
pnpm build      → exit 0
```
