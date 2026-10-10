# LiveKit local và Cloud

Bộ chuẩn bị cho T06/GATE-MEDIA; không đánh dấu Task hoàn thành hoặc bắt đầu Sprint.
LiveKit Docker cố định phiên bản `v1.13.9`. Không dùng khóa Cloud để chạy máy chủ local.
Cần Python 3, Docker Engine/Desktop đang chạy và Docker Compose v2 trở lên.
Chạy các lệnh bên dưới từ thư mục gốc XIANGQI.

## Chuẩn bị lần đầu

Điền bộ ba `LIVEKIT_*` của Cloud vào `.env` tổng trước, rồi chạy:

```sh
python3 scripts/livekit-env.py prepare
docker compose --env-file .local/livekit/docker.env -f infra/livekit/compose.yaml config --quiet
docker compose --env-file .local/livekit/docker.env -f infra/livekit/compose.yaml up -d
```

`prepare` giữ nguyên `.env` đang dùng, lưu bộ Cloud vào `.local/livekit/cloud.json`,
tạo khóa local ngẫu nhiên vào `local.json` và cấu hình máy chủ `livekit.yaml`.
Chạy lại không đổi khóa local và không ghi đè bản Cloud đã lưu.
Các file này chỉ ở máy, được Git bỏ qua và có quyền đọc/ghi cho chủ sở hữu.
Compose chỉ mount cấu hình LiveKit; không nạp `.env` tổng chứa Supabase/SMTP.

Mặc định cả ba cổng chỉ được mở trên `127.0.0.1`:

| Cổng | Vai trò |
|---|---|
| 7880 TCP | HTTP API và WebSocket signaling |
| 7881 TCP | Media dự phòng qua TCP |
| 7882 UDP | Media qua UDP |

## Chuyển môi trường

Thử trên cùng máy Docker, ứng dụng web chạy ở `http://localhost:5173`:

```sh
python3 scripts/livekit-env.py local
```

Quay lại Cloud cho demo Internet:

```sh
python3 scripts/livekit-env.py cloud
docker compose --env-file .local/livekit/docker.env -f infra/livekit/compose.yaml down
```

Script chỉ thay ba biến LiveKit ở `.env` tổng rồi đồng bộ toàn bộ bản tổng sang
`apps/web/.env` và `apps/server/.env`. Những chỉnh sửa riêng ở hai bản sao sẽ bị
thay thế; hãy đưa về bản tổng trước. Khi chuyển từ Cloud sang local, bộ khóa
Cloud hiện hành được lưu lại để không mất khóa vừa đổi. Sau mỗi lần chuyển,
khởi động lại server/web khi mã ứng dụng đã được triển khai. Token của môi trường
cũ không dùng được ở môi trường mới; rời phòng và xin token mới từ NestJS.

Không chạy `source .env`; không chia sẻ `cloud.json`, `local.json`, `livekit.yaml`
hoặc token người dùng. Không đưa khóa server vào biến `VITE_*`/`NEXT_PUBLIC_*`.
Khi xoay khóa Cloud, cập nhật bản tổng lúc đang dùng Cloud trước khi chuyển local.

## Demo LAN nhiều máy

Bộ mặc định chỉ dành cho cùng máy, chưa phải cấu hình LAN hoàn chỉnh. Trước demo:

1. Chọn IPv4 LAN cố định của máy Docker, ví dụ `192.168.1.20`; mở firewall cho
   TCP 7881 và UDP 7882 trong LAN. Các thiết bị phải truy cập được IP này.
2. Chuẩn bị HTTPS cho web và một reverse proxy WSS có chứng chỉ được **mọi thiết bị
   tin cậy**, chuyển tiếp WebSocket đến cổng 7880. Ví dụ URL do nhóm tự cấu hình:
   `wss://media.xiangqi.test`. Không bỏ qua cảnh báo chứng chỉ trên trình duyệt.
3. Chuẩn bị lại địa chỉ local (giữ nguyên khóa), rồi tạo lại container:

   ```sh
   python3 scripts/livekit-env.py prepare --host 192.168.1.20 --url wss://media.xiangqi.test
   docker compose --env-file .local/livekit/docker.env -f infra/livekit/compose.yaml up -d --force-recreate
   python3 scripts/livekit-env.py local
   ```

4. IP và URL trên chỉ là ví dụ: phải thay bằng máy, DNS và proxy thực. Đồng bộ URL
   web/API, CORS và Supabase redirect tương ứng trong bản tổng. Lệnh chuyển media
   không tự cấu hình DNS, TLS, CORS, OAuth hay firewall.
5. Trên Docker Desktop, kiểm tra UDP/TCP port forwarding từ máy thứ hai; địa chỉ
   quảng bá media phải là IP máy chủ LAN, không phải IP container. Cấu hình này
   không kèm TURN cho mạng Internet/NAT phức tạp; dùng Cloud cho demo Internet.

Quay về cấu hình cùng máy: chuyển `cloud`, chạy lại `prepare` không tham số,
tạo lại container rồi chuyển `local` nếu cần. Nếu vừa sửa hồ sơ local trong lúc
`.env` vẫn dùng địa chỉ local cũ, hãy chuyển `cloud` trước khi chọn `local` lại.

## Kiểm tra

```sh
docker compose --env-file .local/livekit/docker.env -f infra/livekit/compose.yaml ps
curl --fail http://127.0.0.1:7880/
```

Với LAN, thay địa chỉ kiểm tra bằng địa chỉ phù hợp. HTTP hoạt động chỉ chứng minh
dịch vụ đã khởi động; GATE-MEDIA vẫn cần hai người chơi và năm người xem trên các
thiết bị thật: phát/nhận hình tiếng, quyền chia sẻ, thu hồi quyền, ngắt/kết nối lại,
CPU/RAM và quota Cloud. Không dùng kết quả HTTP để kết luận camera đã hoạt động.
Repo hiện chưa có ứng dụng cấp token/phòng để kiểm thử xuyên suốt.

Tự chạy không tiêu quota LiveKit Cloud nhưng dùng CPU, RAM và băng thông máy chủ.
Không cần Redis cho bộ một máy chủ này, không bật ghi hình/Ingress/Egress.

Nguồn: [chạy local](https://docs.livekit.io/transport/self-hosting/local/),
[cấu hình LiveKit](https://github.com/livekit/livekit/blob/v1.13.9/config-sample.yaml),
[triển khai](https://docs.livekit.io/transport/self-hosting/deployment/).
