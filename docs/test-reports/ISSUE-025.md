# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-025 — Backend media policy, token và thu hồi

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, LiveKit Server (Docker container port 7880)  
**Tiêu chuẩn kiểm chứng:** [06-MEDIA.md](../../specs/06-MEDIA.md) & [ISSUE-025](../../issues/ISSUE-025-media-authority.md)  

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm exec vitest run --config vitest.config.ts tests/unit/media-policy.test.ts
```

### Kết quả đầu ra (Exit Code: 0):
```
 ✓ tests/unit/media-policy.test.ts (6 tests) 74ms
 Test Files  1 passed (1)
      Tests  6 passed (6)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **A public B private** | Cấu hình scope public cho A, private cho B | Khán giả chỉ nhận được track public của A, không nhận track private của B | Transports tách biệt ROOM và WATCH transport | **PASS** |
| **Camera private mic public** | Cấu hình camera OPPONENT_ONLY, mic PUBLIC | WATCH transport chỉ cấp grant microphone, camera bị loại trừ | `canPublishSources` của WATCH chỉ có microphone | **PASS** |
| **Phân quyền endpoint** | Gọi API không kèm token xác thực Bearer | Từ chối 401 UNAUTHENTICATED | Cả GET session và POST policy đều chặn người chưa đăng nhập | **PASS** |
| **Xoay vòng Generation** | Gọi `rotateRoomGeneration()` khi thu hẹp quyền hoặc khóa phòng | Generation tăng đơn điệu, dọn sạch room cũ trên SFU | Generation tăng 1 $\to$ 2 $\to$ 3, gọi `deleteRoom` trên LiveKit SFU | **PASS** |
| **Schema Validation** | Cập nhật track/scope không hợp lệ | Zod schema từ chối `VALIDATION_ERROR` (400) | Chặn track không tồn tại (screen) hoặc scope lạ (ALL) | **PASS** |

---

## 3. Tổng hợp kết quả kiểm thử toàn dự án

```
pnpm test:unit  → 29 test files, 193 tests pass (0 fail)
pnpm test:e2e   → 74 tests pass (37 desktop + 37 mobile)
pnpm test:ai    → 20 thế cờ benchmark hoàn tất (84.51% pruning reduction)
pnpm typecheck  → exit 0 (tsc -b)
pnpm lint       → exit 0
pnpm build      → exit 0
```
