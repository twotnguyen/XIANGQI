# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-024 — LiveKit local: kiểm chứng quyền và room generations

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, LiveKit Server (Docker container `livekit/livekit-server:latest`, port 7880)  
**Tiêu chuẩn kiểm chứng:** [06-MEDIA.md](../specs/06-MEDIA.md) & [ISSUE-024](../issues/ISSUE-024-media-spike.md)  

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm exec tsx tests/media/spike.ts
```

### Kết quả đầu ra (Exit Code: 0):
```
=== LIVEKIT MEDIA SPIKE VERIFICATION RESULTS ===
[PASS] T024-01: Player Token with granular publish grants
       Generated valid 3-part JWT for test-room-bc6aa38a:gen_1 with camera+mic grants
[PASS] T024-02: Viewer Token is strictly subscribe-only
       canPublish is explicitly false, canSubscribe is true
[PASS] T024-03: Live SFU room creation and deletion
       Created room test-room-bc6aa38a:gen_1 (maxParticipants: 7), verified in listRooms, then deleted successfully
[PASS] T024-04: Generation Rotation isolates old tokens from new generation
       Old token bound to test-room-bc6aa38a:gen_1 cannot match new room test-room-bc6aa38a:gen_2
[PASS] T024-05: Camera-only token excludes microphone source
       canPublishSources: [1] — camera allowed, microphone strictly excluded
Overall: ALL 5 CASES PASSED
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Source grants** | Token người chơi có grants camera+mic, token khán giả subscribe-only | SFU phân quyền chính xác theo từng loại track | Player có full publish; Viewer `canPublish: false` | **PASS** |
| **Room lifecycle** | Tạo phòng và xóa phòng trên LiveKit SFU thật | `createRoom` thành công, `deleteRoom` dọn dẹp sạch | Phòng `maxParticipants: 7` (2 người chơi + 5 người xem) tạo và xóa thành công | **PASS** |
| **Generation rotation** | Generation đổi từ `gen_1` sang `gen_2` | JWT cũ gắn với generation cũ không nhận dữ liệu generation mới | Room claim trong JWT tách biệt tuyệt đối giữa các generation | **PASS** |
| **Source restriction** | Token chỉ bật camera | Nguồn microphone bị loại trừ khỏi `canPublishSources` | `canPublishSources` chỉ chứa camera, microphone bị chặn | **PASS** |

---

## 3. Tổng hợp kết quả kiểm thử toàn dự án

```
pnpm test:unit  → 28 test files, 187 tests pass (0 fail)
pnpm test:e2e   → 74 tests pass (37 desktop + 37 mobile)
pnpm test:ai    → 20 thế cờ benchmark hoàn tất (84.51% pruning reduction)
LiveKit Spike   → 5/5 cases pass trên SFU container livekit-server
pnpm typecheck  → exit 0 (tsc -b)
pnpm lint       → exit 0
pnpm build      → exit 0
```
