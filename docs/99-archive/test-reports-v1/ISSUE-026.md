# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-026 — Camera/mic trực tiếp và xem media được cho phép

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.15.0, `livekit-client 2.22.3` (dependency mới của `apps/web`), Playwright Chromium 153.0.8010, `livekit-server 1.13.6`  
**Tiêu chuẩn kiểm chứng:** [06-MEDIA.md](../specs/06-MEDIA.md), [07-UI-AND-TESTS.md](../specs/07-UI-AND-TESTS.md) & [ISSUE-026](../issues/ISSUE-026-media-ui.md)  
**Trạng thái:** `LOCAL_DONE` — client thật đã publish/subscribe và render track thật; phần thiết bị thật còn `MANUAL`.

---

## 1. Kết quả lệnh kiểm chứng

### 1.1 Typecheck app web (imports/dependency thật)
```bash
pnpm exec tsc --noEmit -p apps/web/tsconfig.json
# exit 0
```

### 1.2 Smoke client thật qua Vite dev-server + Chromium (throwaway, đã dọn)
Dựng một HTML tạm import **chính module** `apps/web/src/features/media/lib/sfu-client.ts`, hai page Chromium dùng
`SfuConnection` để publish và subscribe qua SFU thật:

```
WRAPPER_PROBE {
  "publisher":  { "state": ["CONNECTING", "LIVE"] },
  "viewer":     { "states": ["CONNECTING", "LIVE"], "tracks": 1, "bytes": 2735, "frames": 1 },
  "viewerAfterWindow": { "tracks": 1, "bytes": 179070, "frames": 60 },
  "cleanup":    { "publisher": ["CONNECTING", "LIVE"], "viewer": 0 }
}
```

Diễn giải: wrapper của sản phẩm connect được, publish track của chính mình, nhận 1 remote camera track,
**179.070 bytes / 60 frames** được decode sau cửa sổ quan sát, và `disconnect()` dọn sạch remote track (`viewer: 0`).
Script/HTML tạm đã xoá khỏi repo sau khi chạy (không commit).

### 1.3 Lane unit + integration
```bash
pnpm exec vitest run tests/unit/media-spike.test.ts        # 13 passed (9 cặp audience độc lập camera/mic)
pnpm exec vitest run --config vitest.integration.config.ts tests/media   # 8 passed (SFU thật)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Điều khiển độc lập** | 2 select: Tắt / Chỉ đối thủ / Đối thủ và người xem | Camera và mic độc lập | 9 cặp audience được parameter hóa trong unit test; DB test chứng minh `micTracks=1 cameraTracks=0` cùng viewer | **PASS** |
| **OFF mặc định** | Row `media_policies` mới | Desired/applied OFF, version 0, APPLIED | `defaultPolicyState` + CHECK của DB; sau restart policy về OFF | **PASS** |
| **Chỉ publish khi policy cho phép** | Client đọc grant từ `POST /media/session` | Không tự đoán room/permission | `SfuConnection` chỉ connect/publish theo `canPublish` + `publishSource`; WATCH của player `canSubscribe=false` | **PASS** |
| **Một lease mỗi tab** | Media + client game cùng tab | Không hai chủ lease (không bump `control_epoch` chéo) | Media không gọi `POST /control/takeover`; chỉ đọc/chờ grant từ `realtime` và gửi `X-Control-Id`/`X-Control-Epoch` | **PASS (theo thiết kế, chờ E2E của WebRealtimeClient)** |
| **Render media đối thủ/khán giả** | Remote track events | Có thẻ video/audio thật, không chỉ preview local | `MediaPanel` render `remote-video-*`/`remote-audio-*` từ `TrackSubscribed`; smoke ở §1.2 nhận 179.070 bytes/60 frames | **PASS** |
| **Preview bản thân muted** | Ô preview của người chơi | Luôn `muted` (không echo) | `<video muted>` gắn stream capture gốc | **PASS** |
| **Không hai đường âm thanh** | Player public mic | Đối thủ chỉ nghe 1 đường | Player WATCH `canSubscribe=false`; media đối thủ đi qua PRIVATE | **PASS** |
| **Viewer không có quyền publish** | Panel của spectator | Không nút publish, chỉ mute local | `ownPolicy=null` → chỉ hiện text + nút mute; audit SFU `sfuViewerTracks=0` | **PASS** |
| **Dọn dẹp unmount/rematch** | Đổi match / unmount | Ngắt kết nối + dừng capture | `teardown()` disconnect mọi room + `stopAll()`; probe: remote tracks về 0 sau `disconnect()` | **PASS** |
| **Permission denied vẫn chơi được** | Từ chối quyền camera | Không chặn ván cờ | `ensureCapture` lỗi → hiện `role=alert`, KHÔNG gọi API policy, select giữ nguyên giá trị cũ | **PASS (logic)** |
| **Cờ APPLYING khi SFU lỗi** | `PATCH` trả `503 MEDIA_UNAVAILABLE` | UI hiện desired + đang chờ, không báo APPLIED giả | Hook giữ `mediaUnavailable`, gọi lại `GET /media/policy`, không publish nguồn mới | **PASS (logic)** |

---

## 3. Thay đổi chính

| File | Nội dung |
|---|---|
| `apps/web/package.json` | Thêm `livekit-client ^2.22.3` (dependency duy nhất được thêm) |
| `apps/web/src/features/media/lib/sfu-client.ts` (mới) | `SfuConnection`: connect theo grant, publish **clone** track, phát `RemoteMedia`, `disconnect()` sạch |
| `apps/web/src/features/media/track-manager.ts` | Refcount capture (`acquire`/`release`/`ensureCapture`), `cloneForPublish`, OFF dừng phần cứng khi hết consumer |
| `apps/web/src/features/media/useMedia.ts` | **Tiêu thụ** lease tab do `lib/realtime` sở hữu (`getController('match') ?? getController()`; yêu cầu claim qua `subscribeMatch`/`subscribeRoom` — media không tự gọi takeover), `POST /media/session`, `PATCH /media/policy` kèm `policyVersion`, retry bounded khi `503`, teardown/rematch |
| `apps/web/src/features/media/MediaPanel.tsx` | Hai selector độc lập, tile remote video/audio, mute local, không có control publish cho viewer |
| `apps/web/src/features/match/MatchPage.tsx` | Chỉ truyền thêm `matchId` vào `MediaPanel` |

---

## 4. Còn lại `MANUAL` (cổng thiết bị — chưa thể tự động ở máy này)

| Hạng mục | Lý do | Cách kiểm chứng |
|---|---|---|
| Camera/mic thật (desktop + Safari/iPhone + Android), tab mobile khi bàn phím mở | Cần thiết bị; Chromium dùng fake device | [ISSUE-028] viewport/mobile + runbook DEPLOY |
| E2E trong app (2 context ván online thật) | Cần Supabase Auth thật + lease tab + SFU cùng host; smoke §1.2 đã chứng minh đúng module client nhưng không qua UI ván cờ | Playwright E2E sau khi lane socket/lease ổn định |
| Relay/TURN 2 mạng thật | Ngoài môi trường loopback | [06-MEDIA](../specs/06-MEDIA.md) §Hosting |
