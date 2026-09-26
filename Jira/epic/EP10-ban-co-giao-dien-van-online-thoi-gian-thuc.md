# EP10 · Bàn cờ giao diện & ván online thời gian thực

> **Loại:** Epic · **Story:** [ST10.1](../story/ST10.1-ban-co-svg-ve-quan-chon-dich-lat-ban-phim-chuyen-dong.md), [ST10.2](../story/ST10.2-gateway-realtime-presence-heartbeat-duong-xu-ly-lenh-bien-la.md), [ST10.3](../story/ST10.3-di-nuoc-cay-nuoc-di-ham-ket-thuc-van-snapshot-dong-bo.md), [ST10.4](../story/ST10.4-man-phong-choi-realtime-8-phien-hien-thi-dong-ho.md)

| Trường Jira | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | `EP10 · Bàn cờ giao diện & ván online thời gian thực` |
| Components | Frontend, Backend, Tester |
| Priority | Highest |
| Labels | `xq-v2`, `ep10`, `critical-path`, `race` |
| Fix versions | `v1.0.0` |
| Start date / Due date | 2026-10-05 / 2026-10-20 |
| Nguồn đặc tả | ISSUE-078 … ISSUE-091, ISSUE-095 (R05, R06, R07) |

**Mục tiêu:** Bàn cờ SVG đẹp, dùng được bằng chuột/chạm/bàn phím, lật cho người cầm đen; gateway Socket.IO có xác thực; **đường xử lý lệnh ván** (khoá, biên lai chống trùng, phân xử bằng luật cờ ở máy chủ); cây nước đi; **một hàm kết thúc ván duy nhất**; snapshot đồng bộ lại; màn phòng chơi realtime cho 2 người chơi + 5 người xem.

**⭐ Đường xử lý lệnh ván — 11 bước bắt buộc (dùng cho MỌI lệnh ván: đi nước, đầu hàng, đề nghị, đi lại, xác nhận còn trong ván):**
```
① xác thực danh tính (JWT + phiên còn hiệu lực)
② đọc match.room_id (bất biến) để biết khoá phòng nào
③ BEGIN
④ ONLINE: SELECT rooms ... FOR UPDATE → SELECT matches ... FOR UPDATE      AI: chỉ SELECT matches ... FOR UPDATE
⑤ tra command_receipts (match_id, actor_id, command_id): đã có ⇒ cùng hash trả kết quả cũ / khác hash ⇒ COMMAND_ID_REUSED
⑥ ván ACTIVE + expectedVersion khớp version (sai ⇒ VERSION_CONFLICT)
⑦ TÍNH LẠI ĐỒNG HỒ — hết giờ ⇒ kết thúc ván TIMEOUT, TỪ CHỐI lệnh      ← trước bước ⑧
⑧ kiểm lượt · vai trò · luật cờ (validateMove từ @xiangqi/game-rules — không tin client)
⑨ áp dụng · version++ · ghi sự kiện
⑩ ghi biên lai (chỉ khi lệnh thành công — lệnh bị từ chối vì sai luật/lượt KHÔNG ghi biên lai)
⑪ COMMIT → rồi MỚI phát tin (lỗi phát tin không huỷ dữ liệu đã lưu)
```
- Toàn bộ đường này dùng **SQL thuần** (không Prisma). Thứ tự khoá **phòng → người → ván**, không bao giờ khoá ngược.
- ⛔ **Không giữ khoá khi gọi ra ngoài** (AI, LiveKit, email).
- HTTP và socket gọi **cùng một** service (không viết 2 bản logic).
- Đồng hồ **tiêm vào** (`Clock` provider) ở mọi chỗ tính thời gian.

**Danh sách Story:**
| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST10.1](../story/ST10.1-ban-co-svg-ve-quan-chon-dich-lat-ban-phim-chuyen-dong.md) | Bàn cờ SVG: vẽ, quân, chọn/đích, lật, bàn phím, chuyển động | 2 | 8 |
| [ST10.2](../story/ST10.2-gateway-realtime-presence-heartbeat-duong-xu-ly-lenh-bien-la.md) | Gateway realtime, presence/heartbeat, đường xử lý lệnh + biên lai | 3 | 8 |
| [ST10.3](../story/ST10.3-di-nuoc-cay-nuoc-di-ham-ket-thuc-van-snapshot-dong-bo.md) | Đi nước, cây nước đi, hàm kết thúc ván, snapshot đồng bộ | 3 | 8 |
| [ST10.4](../story/ST10.4-man-phong-choi-realtime-8-phien-hien-thi-dong-ho.md) | Màn phòng chơi realtime (8 phiên) + hiển thị đồng hồ | 4 | 5 |
