# Báo cáo spike media T06/XIAN-42 — LiveKit local + mô hình phiên

Ngày đo: 11/10/2026. Máy: macOS + Docker Desktop 29.8.2, LiveKit `v1.13.9`
(theo `infra/livekit/compose.yaml`). Môi trường active của repo vẫn là Cloud;
spike chỉ dùng khóa local trong `.local/` (Git bỏ qua), không đổi `.env`.

## 1. Kết quả đo trên cùng máy (local Docker)

| Kiểm tra | Kết quả |
|---|---|
| `compose up -d` tới container `Up` | ~6 giây |
| `GET /` liveness | HTTP 200, 3.5 ms |
| `RoomService.ListRooms` (token service grants) | HTTP 200, 27 ms lần đầu / 2.8 ms lần sau, `{"rooms":[]}` |
| `CreateRoom spike-room` | HTTP 200, 25 ms, có `sid` |
| `ListRooms` sau khi tạo | thấy `spike-room` |
| `DeleteRoom spike-room` | HTTP 200 |
| Token thiếu grants | HTTP 401 `permissions denied` — máy chủ có kiểm quyền |
| Idle CPU/RAM container | 0.08% CPU, ~75 MiB RAM |

Cách tạo token probe: JWT HS256 ký bằng `LIVEKIT_API_SECRET` local, claims
`iss` = API key, `video: {roomAdmin, roomList, roomCreate, roomJoin}`.
Xem `infra/livekit/spike-probe.py` (chỉ đọc khóa từ `.local/`, không in khóa).

## 2. Mô hình phiên (kiểm bằng test đã gộp ở develop-merge)

- Hạn cố định từ đăng nhập (30 ngày / 12 giờ, không gia hạn khi hoạt động):
  `apps/server/src/account/login` — 12 test pass.
- Google onboarding + Khách: `google`/`guest`/`session` — 21 test pass,
  31 skip (cần postgres CI, sẽ chạy ở PR #97).
- Thu hồi phiên hai trình duyệt: cơ chế đã có trong SessionProvider
  (tiếp quản tab, tab cũ chỉ đọc); thử hai profile thật để dành khi demo
  vì cần thao tác trình duyệt có đăng nhập.

## 3. Chưa chứng minh trong spike này (trung thực)

- Luồng phát/nhận 2 người + 5 người xem trên thiết bị thật: cần T33
  (cấp token theo quyền, `canPublish: false` cho người xem) + camera/mic thật.
  Cơ chế thu hồi: thu hồi phiên media + chặn cấp token mới (không chỉ chờ hết hạn).
- HTTPS/WSS LAN nhiều máy và LiveKit Cloud qua Internet: cấu hình mẫu và script
  chuyển đã có (`infra/livekit/README.md`, `scripts/livekit-env.py`); chưa chạy
  vì cần máy thứ hai + chứng chỉ được mọi thiết bị tin cậy.
- Không dùng kết quả HTTP/API ở trên để kết luận camera đã hoạt động.

## 4. Kết luận spike

Không phát hiện điểm chặn: Docker local chạy được, API xác thực đúng,
tài nguyên idle thấp, mô hình phiên có test. Giữ phương án đã chốt
(local Docker khi dev/demo LAN, Cloud khi demo Internet, không chạy LiveKit
trên Render). Cổng kiểm chứng GATE-MEDIA (Sprint 1) vẫn phải chạy với thiết bị
thật trước khi nghiệm thu camera/mic.
