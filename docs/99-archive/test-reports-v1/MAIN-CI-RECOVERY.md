# Báo Cáo Khắc Phục CI Main và Phục Hồi Realtime Sync — XIANGQI

**Ngày thực hiện:** 2026-09-14
**Nhánh xử lý:** `fix/issue-015-realtime-sync-race`
**Base commit:** `cc22a94` (main)
**CI run lỗi điều tra:** [GitHub Actions Run #34775069536](https://github.com/twotnguyen/XIANGQI/actions/runs/34775069536)
**Job thất bại:** `e2e` (Job ID: `103771581827`)
**Test case thất bại:** `tests/e2e/realtime-sync.spec.ts:82` (`T015-E2E-04: waiting room follows room:updated and the match start without reload`)

---

## 1. Nguyên Nhân Gốc Rễ (Root Cause Analysis)

Qua phân tích log CI run #34775069536 và trace của Playwright, lỗi `expect(pageA.getByTestId('seat-black')).toContainText(userB.id.slice(0, 8))` bị timeout 15.000ms do sự kết hợp của 4 khiếm khuyết race condition giữa subscription và snapshot:

### 1.1. Race Subscription / Connection Status trên Web Client (`realtime.ts`)
- Trong `apps/web/src/lib/realtime.ts`, sự kiện `socket.on('connect')` trước đây gọi ngay `this.setStatus('connected')` rồi mới kích hoạt `void this.resubscribeAll()` bất đồng bộ trong background.
- Khi React nhận trạng thái `'connected'`, thuộc tính `data-status="connected"` lập tức xuất hiện trong DOM.
- Playwright E2E vừa thấy `data-status="connected"` liền lập tức gửi yêu cầu HTTP `POST /api/v1/rooms/join` cho đối thủ (User B).
- Tại thời điểm này, gói tin `room:subscribe` của Socket A từ browser thậm chí chưa hoàn tất bắt tay (ack) với máy chủ Fastify, dẫn tới việc server phát sóng sự kiện cập nhật vào room topic trước khi Socket A kịp gia nhập topic.

### 1.2. Thứ tự Gia Nhập Topic trên Máy Chủ Socket.IO (`socket.ts`)
- Trong `apps/server/src/realtime/socket.ts`, hàm xử lý `room:subscribe` trước đây thực hiện:
  1. Gọi `deps.roomAccess(state.userId, roomId)` để truy vấn CSDL lấy snapshot phòng.
  2. Sau đó mới gọi `await socket.join(topics)`.
- Nếu có một mutation ghi (như `joinRoom`) diễn ra trong cửa sổ thời gian server đang đọc CSDL:
  - Mutation hoàn tất và emit `room:updated` tới Socket.IO room `room:${roomId}`.
  - Do `socket.join(topics)` chưa chạy, Socket A chưa nằm trong danh sách người nhận nên **hoàn toàn bỏ lỡ** broadcast.
  - Sau đó `roomAccess` trả về snapshot cũ (chưa có User B), ack về cho client. Socket A nhận snapshot cũ và không bao giờ nhận được push mới.

### 1.3. Lỗi Bỏ Sót Tăng `room_version` trong `joinRoom` (`invitations/service.ts`)
- Trong toàn bộ codebase, tất cả các thao tác thay đổi phòng (`patchRoom`, `setReady`, `rematch`, `revokeSpectators`, `leaveRoom`, `closeAbandonedRooms`) đều thực hiện `UPDATE public.rooms SET room_version = room_version + 1, updated_at = now()`.
- Riêng hàm `joinRoom` (`apps/server/src/modules/invitations/service.ts`) chỉ chèn bản ghi vào `room_members` và `active_players` mà **không hề tăng `room_version`**.
- Do đó, phòng trước khi vào và sau khi vào đều giữ nguyên `roomVersion: 1`, khiến các cơ chế lọc version đơn điệu (monotonic versioning) không phân biệt được snapshot mới hay cũ.

### 1.4. Thiếu Bảo Vệ Version Đơn Điệu trong `RoomWaiting.tsx`
- Component `RoomWaiting.tsx` không có `roomRef` để so sánh `roomVersion` của dữ liệu đến với dữ liệu hiện tại.
- Khi có một lượt đọc HTTP trễ (`loadRoom` kích hoạt bởi `onStatus('connected')`) hoặc subscribe ack trễ đến sau một push `room:updated`, component đã ghi đè dữ liệu mới bằng dữ liệu cũ, làm biến mất ghế người chơi Đen vừa tham gia.

### 1.5. SFU Backoff Khởi Động Server (`reconciler.ts`)
- Hàm `deleteMatchTransports` trong `recoverMediaOnBoot()` không truyền tham số giới hạn số lần thử, dẫn đến việc thử lại 5 lần kèm backoff lên đến 22.5 giây cho mỗi phòng có transport tồn đọng nếu SFU chưa sẵn sàng, làm chậm thời gian khởi động server trong môi trường kiểm thử.

---

## 2. Các Thay Đổi Đã Thực Hiện (Implementation Details)

1. **`apps/server/src/modules/invitations/service.ts`**:
   - Bổ sung lệnh `UPDATE public.rooms SET room_version = room_version + 1, updated_at = now() WHERE id = $1` vào transaction của `joinRoom` để đảm bảo `room_version` luôn tăng đơn điệu khi có người chơi hoặc khán giả mới tham gia.

2. **`apps/server/src/realtime/socket.ts`**:
   - Đảo thứ tự trong `room:subscribe`: Cho socket gia nhập `primaryTopic` (`room:${roomId}`) **trước** khi đọc snapshot từ CSDL. Nếu đọc thất bại hoặc không có quyền truy cập, socket tự động rời khỏi topic (`socket.leave`) và ném lỗi.
   - Áp dụng tương tự cho `match:subscribe`: Gia nhập `matchTopic` trước khi đọc snapshot ván cờ.

3. **`apps/web/src/lib/realtime.ts`**:
   - Điều chỉnh sự kiện `socket.on('connect')`: Chờ `await this.resubscribeAll()` hoàn tất việc đăng ký lại toàn bộ các subscription phòng/ván cờ với máy chủ trước khi chuyển `status` sang `'connected'`.
   - Cập nhật `doRoomSubscribe` và `doMatchSubscribe` để chỉ ghi nhận `appliedRoomIds` / `appliedMatchIds` khi máy chủ phản hồi `ok: true`.
   - Bổ sung các phương thức công khai `isRoomSubscribed(roomId)` và `isMatchSubscribed(matchId)`.

4. **`apps/web/src/features/room/RoomWaiting.tsx`**:
   - Triển khai `roomRef` và hàm `applyRoom` với cơ chế bảo vệ monotonic `roomVersion`: Từ chối các snapshot có `roomVersion` nhỏ hơn version hiện tại hoặc có ít thành viên hơn khi version bằng nhau.
   - Áp dụng `applyRoom` đồng nhất cho cả luồng nạp HTTP, push `room:updated` và toggle sẵn sàng.

5. **`apps/server/src/modules/media/reconciler.ts`**:
   - Hỗ trợ tham số `options?: { attempts?: number }` trong `deleteMatchTransports`.
   - Truyền `{ attempts: 1 }` trong `recoverMediaOnBoot()` để tránh lặp backoff làm nghẽn tiến trình khởi động server khi SFU chưa sẵn sàng.

6. **`tests/integration/realtime.test.ts`**:
   - Bổ sung regression test case: `pushes room:updated with incremented room_version when opponent joins a waiting room`, xác minh chính xác việc User B vào phòng đẩy sự kiện với `roomVersion: 2` tới Socket A.

7. **`docs/test-reports/STAGING-ACCEPTANCE.md`**:
   - Chuẩn hóa phân quyền Audience 3 cấp (`OFF`, `OPPONENT_ONLY`, `OPPONENT_AND_SPECTATORS`) độc lập cho Camera và Mic theo contracts.
   - Chuẩn hóa lý do kết thúc ván cờ khi cả 2 mất mạng thành `BOTH_OFFLINE`.
   - Mô tả chính xác `GET /health` là liveness probe tiến trình, không gọi là DB/socket readiness probe.
   - Minh định bằng chứng Orca `aa20d4b` là kiểm thử local stack, không phải Google/cloud smoke.
   - Đánh dấu rõ các gate staging chưa chạy là `NOT_RUN` hoặc `BLOCKED`.

---

## 3. Kết Quả Kiểm Thử (Verification Proof)

### 3.1. Kiểm thử Cục bộ (Local Verification Gates)
- **Unit tests:** 32 files, **298/298 passed** (`pnpm test:unit`)
- **Integration tests:** 11 files, **82/82 passed** (`pnpm test:integration`)
- **Media SFU tests:** 1 file, **8/8 passed** (`pnpm test:media`, LiveKit SFU thật với RTP bytes/frames)
- **E2E tests (Playwright):** 94 tests (47 chromium + 47 mobile), **94/94 passed** (`pnpm exec playwright test`)
- **TypeScript & Linting:** `tsc -b` 0 lỗi, `eslint` 0 lỗi
- **Production Build:** `pnpm run build` hoàn tất sạch cả 6 workspace packages

---

## 4. Theo Dõi Git & CI Recovery

- **PR Branch:** `fix/issue-015-realtime-sync-race`
- **PR Number:** [PR #54](https://github.com/twotnguyen/XIANGQI/pull/54)
- **PR CI Run:** [GitHub Actions Run #34777052679](https://github.com/twotnguyen/XIANGQI/actions/runs/34777052679) (482/482 passed: 298 unit, 82 integration, 8 media, 94 e2e)
- **Merge Commit (Main SHA):** `9cb7766` (Squash merge PR #54 vào `main`)
- **Main CI Run:** [GitHub Actions Run #34777360077](https://github.com/twotnguyen/XIANGQI/actions/runs/34777360077) (482/482 passed: 298 unit, 82 integration, 8 media, 94 e2e — 100% PASS)
