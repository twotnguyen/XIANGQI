# EP08 · Phòng, sảnh và lời mời

> **Loại:** Epic · **Story:** [ST08.1](../story/ST08.1-tao-phong-va-nhan-nguoi-vao-phong-khong-vuot-tran.md), [ST08.2](../story/ST08.2-sanh-san-sang-bat-dau-van-doi-ben-va-giao-dien-phong-cho.md), [ST08.3](../story/ST08.3-roi-dong-phong-doi-cai-dat-va-thu-hoi-nguoi-xem.md), [ST08.4](../story/ST08.4-ma-phong-link-moi-moi-truc-tiep-hop-thu-loi-moi.md)

| Trường Jira | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | `EP08 · Phòng, sảnh và lời mời` |
| Components | Backend, Frontend, Tester |
| Priority | High |
| Labels | `xq-v2`, `ep08`, `race`, `security` |
| Fix versions | `v1.0.0` |
| Start date / Due date | 2026-10-08 / 2026-10-21 |
| Nguồn đặc tả | ISSUE-061 … ISSUE-072 (R03, R04, R19) |

**Mục tiêu:** Tạo phòng (tên, 3 chế độ riêng tư, thời gian), sảnh phòng công khai, vào ghế chơi/ghế xem không vượt trần, sẵn sàng → bắt đầu ván, đổi bên trước ván, rời/đóng phòng, đổi cài đặt (kín hơn ⇒ đuổi toàn bộ người xem), mời bằng **mã 8 ký tự**, **link**, **mời trực tiếp bạn bè**, và **hộp thư lời mời**.

**Quy tắc nghiệp vụ chung (ghi thẳng để mọi Task dùng):**
| Mục | Quy tắc |
|---|---|
| Sức chứa | 2 người chơi (`PLAYER`) + tối đa 5 người xem (`SPECTATOR`) = 7 |
| Một tài khoản một phòng | Đang ở phòng khác ⇒ `ALREADY_IN_ROOM`; đang có ván với máy ⇒ `CONFLICT` |
| Chủ phòng | Người tạo, cầm **ĐỎ** mặc định; **không** chuyển quyền chủ; không đuổi được đối thủ |
| 3 chế độ | `PUBLIC` (hiện ở sảnh khi Chờ/Đang chơi; ai cũng vào xem) · `CODE_ONLY` (xem bằng lời mời/mã/link WATCH hợp lệ; không hiện sảnh) · `LOCKED` (không ai xem được; ghế chơi trống vẫn mời được) |
| Loại quyền vào | `PLAY` (vào ghế chơi, dùng một lần) · `WATCH` (vào xem; mã/link dùng nhiều lần trong 24 giờ; mời trực tiếp dùng một lần, hạn 10 phút). Dùng mã WATCH ⇒ **trở thành** SPECTATOR. ⛔ Không viết "vé SPECTATOR" hay "vai trò WATCH" |
| Nhận người chơi mới | chỉ khi phòng `WAITING`; `PLAYING`/`FINISHED` từ chối `ROOM_NOT_WAITING` |
| Lỗi khi chưa có bằng chứng biết phòng | phòng không tồn tại/riêng tư/mã sai/hết hạn/thu hồi/đã dùng/sai người nhận ⇒ **cùng** 404 `ROOM_ACCESS_UNAVAILABLE` "Không thể vào phòng. Kiểm tra mã hoặc lời mời." — không id/tên/trạng thái/số người |
| Lỗi khi đã có bằng chứng | bị chặn 403 `BLOCKED_FROM_ROOM`; LOCKED/intent sai loại quyền 403 `ACCESS_DENIED`; đầy 409 `ROOM_FULL`; PLAY khi không chờ 409 `ROOM_NOT_WAITING` |
| Thứ tự khoá | **phòng → người (theo thứ tự id) → ván**; đếm sức chứa **trong** khoá phòng |
| SQL thuần | tạo phòng, nhận người, sẵn sàng/bắt đầu, rời, đổi cài đặt/thu hồi, tiêu thụ lời mời. Prisma chỉ cho sảnh (đọc) và phát hành lời mời |
| Kín hơn | PUBLIC→CODE_ONLY, PUBLIC→LOCKED, CODE_ONLY→LOCKED, **đổi mã xem**: tăng `watch_epoch`, thu hồi mọi quyền WATCH cũ, đưa **toàn bộ** người xem ra, ghi job thu hồi media — trong cùng transaction. Không vào danh sách chặn. Mở lại công khai **không** tự nhận lại người cũ |

**Danh sách Story:**
| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST08.1](../story/ST08.1-tao-phong-va-nhan-nguoi-vao-phong-khong-vuot-tran.md) | Tạo phòng và nhận người vào phòng không vượt trần | 2 | 5 |
| [ST08.2](../story/ST08.2-sanh-san-sang-bat-dau-van-doi-ben-va-giao-dien-phong-cho.md) | Sảnh, sẵn sàng/bắt đầu ván, đổi bên và giao diện phòng chờ | 3 | 8 |
| [ST08.3](../story/ST08.3-roi-dong-phong-doi-cai-dat-va-thu-hoi-nguoi-xem.md) | Rời/đóng phòng, đổi cài đặt và thu hồi người xem | 3 | 8 |
| [ST08.4](../story/ST08.4-ma-phong-link-moi-moi-truc-tiep-hop-thu-loi-moi.md) | Mã phòng, link mời, mời trực tiếp, hộp thư lời mời | 4 | 8 |
