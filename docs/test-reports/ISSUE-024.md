# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-024 — LiveKit local: kiểm chứng quyền và room generations

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.15.0, `livekit-server 1.13.6` (tiến trình riêng do spike tự dựng, xem §2), Playwright Chromium 153.0.8010, Postgres/Auth local (`127.0.0.1:54322` / `:54321`)  
**Tiêu chuẩn kiểm chứng:** [06-MEDIA.md](../specs/06-MEDIA.md) & [ISSUE-024](../issues/ISSUE-024-media-spike.md)  
**Trạng thái:** `LOCAL_DONE` — bằng chứng media thật (bytes/frames) đã có; phần thiết bị/mạng thật còn `MANUAL`.

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi (lane integration, cùng setup DB/Auth của `tests/integration/setup.ts`):
```bash
pnpm exec vitest run --config vitest.integration.config.ts tests/media
```

### Kết quả đầu ra (Exit Code: 0):
```
 ✓ tests/media/spike.ts (8 tests) 12.4s
 Test Files  1 passed (1)
      Tests  8 passed (8)
```

Bằng chứng số đo do chính test in ra (rút gọn; byte/frame thay đổi theo từng run, ngưỡng assert là
`>= 10.000` bytes video và `>= 500` bytes audio, nên số dưới đây là **một** lần chạy thật):
```
[media-spike-evidence] {
  "authorized_viewer_gen1": "bytes=12297 frames=18 tracks=1",
  "authorized_opponent_gen2": "bytes=12049 frames=18 tracks=1",
  "rotation": "retiredGen=1,2,3 readyGen=4 readyRoom=80e7fa6b8ddc retiredRoom=b5ae8dcf3cbc distinct=true",
  "denied_stale_viewer": "bytes=0 frames=0 tracks=0 windowMs=6000 viewerPublishRejected=true cameraTokenMicRejected=true sfuPublisherTracks=1 sfuViewerTracks=0",
  "independent_sources": "micBytes=980 micTracks=1 cameraTracks=0 cameraBytes=0"
}
```

Lệnh unit nhanh (chỉ cấu trúc token, KHÔNG phải bằng chứng SFU):
```bash
pnpm exec vitest run tests/unit/media-spike.test.ts
# ✓ 13 tests (T024-01..05: identity/TTL/canPublishSources/viewer/9 cặp camera-mic)
```

---

## 2. Vì sao spike tự dựng SFU (và cấu hình bắt buộc)

`tests/media/spike.ts` **tự spawn** `livekit-server` trên cổng trống với:

```yaml
rtc:
  use_external_ip: false
  enable_loopback_candidate: true
```

Lý do: browser chạy **cùng máy** với SFU sẽ bị LiveKit lọc candidate loopback/local của client
(`[remote][filtered] udp host …`), ICE kết thúc bằng `ConnectionError: could not establish pc connection`.
Đã tái hiện với SFU đang chạy `livekit-server --dev --bind 127.0.0.1` (cổng 7880, **không** có flag trên) và chứng minh
nguyên nhân bằng cách dựng instance thứ hai **có** `enable_loopback_candidate: true`: cùng đoạn client
code lập tức nhận 161.470 bytes / 62 frames.

Vì vậy lane không cần SFU dựng sẵn; muốn trỏ vào SFU có sẵn thì đặt
`MEDIA_SPIKE_LIVEKIT_URL` (+`_API_KEY`/`_API_SECRET`) và SFU đó **phải** bật `rtc.enable_loopback_candidate` khi client
ở cùng host. Binary lấy từ `PATH` (đổi bằng `LIVEKIT_BINARY`); thiếu binary → **fail rõ**, không skip (F-10).

---

## 3. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Source grants** | Token camera-only cố `publishTrack` microphone | SFU từ chối | Publisher `tryPublish('audio')` bị reject thật trên SFU (`cameraTokenMicRejected=true`) | **PASS** |
| **Private room** | Viewer WATCH không được cấp phòng PRIVATE | Không vào/track nào từ private | Grant của viewer chỉ có `audience=WATCH`, `publishSource=null`; audit SFU: viewer `tracks=0`, player `tracks=1` | **PASS** |
| **Viewer không publish** | Token subscribe-only gọi publish | SFU từ chối | `viewerPublishRejected=true` + `sfuViewerTracks=0` | **PASS** |
| **Positive control** | Player publish camera, subscriber authorized nhận track | Bytes/frames tăng **trước khi** kết luận deny | Gen1: `bytes=12297 frames=18`; tại generation mới: `bytes=12049 frames=18` | **PASS** |
| **Old JWT** | Giữ token gen1, xoá room, phát nguồn mới ở gen2 | Token cũ không nhận byte/track mới | Cửa sổ quan sát 6.000 ms: `bytes=0 frames=0 tracks=0`, room mới khác tên (`distinct=true`) | **PASS** |
| **Clone private/watch** | Camera/mic độc lập, OFF không giết nguồn khác | Không dừng nhầm source | Camera OFF + mic public: `micBytes=980 micTracks=1 cameraTracks=0` | **PASS** |

---

## 4. Còn lại `MANUAL` (cổng thiết bị/provider — không nằm trong máy này)

| Hạng mục | Lý do | Cách kiểm chứng |
|---|---|---|
| Capture camera/mic **thật** trên desktop và mobile (Safari/iPhone, Android) | Spike dùng synthetic track + Chromium fake device; chưa có thiết bị | Runbook [DEPLOY](../handoff/DEPLOY.md), `getUserMedia` trên LAN HTTPS |
| Cuộc gọi 2 mạng khác nhau + TURN/relay | Chỉ loopback trong môi trường này | Hai mạng độc lập, xem [06-MEDIA](../specs/06-MEDIA.md) §Hosting |
| Thu hồi token kiểu Cloud (`RemoveParticipant` + `revoke_token_ts`) | Test này self-host | Tài nguyên LiveKit Cloud thật |

---

## 5. Ghi chú giới hạn

- Không lưu media thật vào Git; mọi số đo là stat RTP tại client subscriber trong cùng run với positive control.
- `tests/media/spike.ts` reo mầm fixture riêng và tự dựng lại nếu một tiến trình integration khác trong cùng máy
  chạy `recoverActiveMatchesOnBoot()` (hàm này đánh `INTERRUPTED` **mọi** match ACTIVE trong DB dùng chung);
  đây là va chạm môi trường, không phải hành vi sản phẩm.
