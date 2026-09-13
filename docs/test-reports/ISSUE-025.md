# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-025 — Backend media policy, token và thu hồi

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.15.0, Postgres/Auth local (`127.0.0.1:54322` / `:54321`), `livekit-server 1.13.6` do spike tự dựng  
**Tiêu chuẩn kiểm chứng:** [06-MEDIA.md](../specs/06-MEDIA.md), [04-CONTRACTS.md](../specs/04-CONTRACTS.md) & [ISSUE-025](../issues/ISSUE-025-media-authority.md)  
**Trạng thái:** `LOCAL_DONE` — policy DB-backed, optimistic concurrency và ngữ nghĩa SFU-ACK đã có bằng chứng thật.

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm exec vitest run --config vitest.integration.config.ts tests/media
pnpm exec vitest run tests/unit/media-policy.test.ts
```

### Kết quả đầu ra (Exit Code: 0):
```
 ✓ tests/media/spike.ts (8 tests) 12.4s        → T025-05..09 + T024-06..08
 ✓ tests/unit/media-policy.test.ts (10 tests) 44ms
 Test Files  2 passed (2)
```

Số đo do test in ra (rút gọn; version/generation là tất định theo thứ tự test, byte/frame chỉ có ở T024):
```
[media-spike-evidence] {
  "restart": "policiesReset=1 transportsRetired=4 failed=0",
  "restart_generations": "2,2,2,2",
  "concurrent_policy": "baseVersion=2 committed=3 statuses=200/409",
  "failed_delete_room": "rotating=2 retainedApplied=OPPONENT_AND_SPECTATORS retried=1 ready=2 retiredCameraGens=1,2,1,2 readyCameraGens=3,3"
}
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Policy bền vững** | `PATCH /media/policy` rồi đọc bằng connection khác | Desired/applied nằm trong `media_policies`, không phải Map in-memory | Row khớp `policy_version`/`applied_version`, `status=APPLIED` | **PASS** |
| **Restart** | `recoverMediaOnBoot()` (đường boot của `main.ts`) | Policy về OFF, generation cũ retire trước khi cấp session mới | `policiesReset=1 transportsRetired=4 failed=0`; session mới cấp generation **2,2,2,2**, không tái dùng room_name cũ | **PASS** |
| **Hai update cùng policyVersion** | 2 `PATCH` song song (camera + mic) cùng base version | Chỉ một commit | `statuses=200/409`, DB `policy_version=base+1`, đúng một selector đổi | **PASS** |
| **A public B private** | Viewer session | Viewer chỉ nhận WATCH, không private | Grant viewer: `audience=WATCH`, `publishSource=null`; audit SFU `sfuViewerTracks=0` | **PASS** |
| **Camera private, mic public** | Session A | Chỉ WATCH microphone được cấp | WATCH camera không có grant publish; `micTracks=1 cameraTracks=0` trên cùng viewer | **PASS** |
| **Policy write cho B** | Body `PATCH` mang `userId` của B / viewer gọi PATCH | Schema/permission từ chối | `400 VALIDATION_ERROR` cho field lạ; `403 FORBIDDEN` cho spectator; row B không đổi | **PASS** |
| **Forged session** | Thiếu header lease / sai epoch / body `controllerId` khác header | Từ chối | `403 CONTROL_REQUIRED` (thiếu + epoch lệch) và `403` khi `controllerId` không khớp | **PASS** |
| **SFU error** | `deleteRoom` fail (admin SFU giả lập lỗi) | APPLYING/error, **không** APPLIED giả, **không** tăng generation | `503 MEDIA_UNAVAILABLE`, `status=APPLYING`, `applied=OPPONENT_AND_SPECTATORS` giữ nguyên, 2 tuple `ROTATING`, chưa có generation mới; session bị chặn `503` | **PASS** |
| **Retry sau sự cố** | `retryPendingMediaJobs()` (hook cho scheduler/operator) | Desired giữ nguyên, chỉ APPLIED sau ACK | `retried=1 failed=0`, tuple `READY` generation 3,3, tên room không trùng | **PASS** |
| **4 transport độc lập** | `TRANSPORT_TUPLES` + xoay theo lock match | PRIVATE_CAMERA/MIC, WATCH_CAMERA/MIC riêng biệt | 4 tuple/match, xoay dưới `pg_advisory_lock`, `UNIQUE` partial giữ tối đa 1 generation active | **PASS** |

---

## 3. Hợp đồng route đã dùng

| Route | Ghi chú |
|---|---|
| `POST /api/v1/media/session` | Body `{roomId, matchId, controllerId}`; `controllerId` phải khớp `X-Control-Id`; trả `MediaSession` (`ownPolicy`, `policies`, `transports`), `Cache-Control: no-store` |
| `GET /api/v1/media/policy?matchId=` | Chỉ membership (không cần controller) → `{policies: PolicyState[]}` |
| `PATCH /api/v1/media/policy` | `{matchId, kind, audience, policyVersion}`; mismatch → `409 CONFLICT`; SFU fail → `503 MEDIA_UNAVAILABLE` giữ desired APPLYING |
| `POST /api/v1/media/end` | `{matchId}` → `{stopped:true}`, chỉ dừng nguồn của chính caller |

Ba route ghi dùng guard `requireControlLease` dùng chung của module rooms (`X-Control-Id`/`X-Control-Epoch`).
`emitMediaPolicy` phát **sau commit** (payload `{matchId, roomId, policy}`).

---

## 4. Còn lại `MANUAL` / phụ thuộc lane khác

| Hạng mục | Lý do | Cách xử lý |
|---|---|---|
| Scheduler gọi `retryPendingMediaJobs()` | Server chưa có timer (cùng khoảng trống với scheduler deadline) | Operator/scheduler gọi; test gọi trực tiếp để chứng minh retry |
| `recoverMediaOnBoot()` khi khởi động | `apps/server/src/main.ts` không thuộc phạm vi file của wave này | Cần thêm 1 lời gọi trong boot sequence `main.ts` |
| `lease_until` hết hạn theo wall-clock | Guard dùng chung chưa ép hạn (heartbeat presence chưa nối) | Ghi nhận ở [ISSUE-013] khi có heartbeat |
