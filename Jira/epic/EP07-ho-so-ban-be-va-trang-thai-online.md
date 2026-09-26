# EP07 · Hồ sơ, bạn bè và trạng thái online

> **Loại:** Epic · **Story:** [ST07.1](../story/ST07.1-ho-so-tim-nguoi-dung-ket-ban.md), [ST07.2](../story/ST07.2-trang-thai-online-va-trang-ban-be.md)

| Trường Jira | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | `EP07 · Hồ sơ, bạn bè và trạng thái online` |
| Components | Backend, Frontend, Tester |
| Priority | High |
| Labels | `xq-v2`, `ep07` |
| Fix versions | `v0.3.0` |
| Start date / Due date | 2026-10-12 / 2026-10-14 |
| Nguồn đặc tả | ISSUE-056 … ISSUE-060 (R02) |

**Mục tiêu:** Người dùng sửa tên hiển thị (username bất biến), tìm người khác theo username, gửi/nhận/từ chối/huỷ lời mời kết bạn, thấy bạn bè đang online hay ngoại tuyến. Kết bạn chỉ để mời chơi — **không** có nhắn tin riêng ngoài phòng.

**Quy tắc chung:**
- Mọi thao tác trong Epic này dùng **Prisma** (không phải đường lệnh ván).
- **Không bao giờ trả email** ở bất kỳ API nào (kể cả `/me`).
- Presence **chỉ** cho biết online/ngoại tuyến; **tuyệt đối không** kèm phòng đang ở, tên phòng, đang chơi với ai.
- Một cặp người dùng chỉ có **một** quan hệ (DB đã ép `user_a < user_b` + UNIQUE).

**Danh sách Story:**
| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST07.1](../story/ST07.1-ho-so-tim-nguoi-dung-ket-ban.md) | Hồ sơ, tìm người dùng, kết bạn | 3 | 3 |
| [ST07.2](../story/ST07.2-trang-thai-online-va-trang-ban-be.md) | Trạng thái online và trang bạn bè | 3 | 5 |
