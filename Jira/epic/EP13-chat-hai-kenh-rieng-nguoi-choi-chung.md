# EP13 · Chat hai kênh (riêng người chơi + chung)

> **Loại:** Epic · **Story:** [ST13.1](../story/ST13.1-dich-vu-chat-2-kenh-gui-doc-lich-su-phan-quyen-theo-segment.md), [ST13.2](../story/ST13.2-lich-su-phan-trang-don-30-ngay-kiem-thu-hoi-end-to-end-giao.md)

| Trường Jira | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | `EP13 · Chat hai kênh (riêng người chơi + chung)` |
| Components | Backend, Frontend, Tester |
| Priority | High |
| Labels | `xq-v2`, `ep13`, `security`, `race` |
| Fix versions | `v1.0.0` |
| Start date / Due date | 2026-10-19 / 2026-10-22 |
| Nguồn đặc tả | ISSUE-108 … ISSUE-111 (R10) |

**Mục tiêu:** Trong mỗi phòng có **2 kênh**: `PLAYERS` — **kênh riêng** chỉ 2 người chơi đọc/gửi; `ROOM` — **kênh chung** cho mọi thành viên (người xem **và** người chơi đọc/gửi). Mỗi người chơi có **công tắc ẩn/hiện** kênh chung riêng (chỉ là tuỳ chọn giao diện). Người xem **không bao giờ** đọc/gửi kênh riêng. Chat có ngay từ phòng chờ.

**Quy tắc (ghi thẳng):**
| Mục | Quy tắc |
|---|---|
| Quyền | máy chủ quyết định theo vai trò + participant; client chỉ chọn kênh **muốn gửi** (ý định), không khai người gửi/vai trò. Chọn kênh không có quyền ⇒ từ chối, **không** tự chuyển sang kênh khác |
| Phát tin | tin `PLAYERS` **chỉ** gửi tới socket của đúng participant; ⛔ không phát ra room socket có người xem rồi để client lọc |
| Nội dung | chuẩn hoá NFC, trim; 1–1000 ký tự (đếm Unicode code point); hiển thị **dạng chữ thuần** |
| Tần suất | **5 tin / 10 giây / người**, tính **chung cả 2 kênh, mọi tab, mọi context**; retry cùng `clientMessageId` không tính thêm |
| Chống trùng | `(context_id, sender_id, client_message_id)` duy nhất; cùng id + cùng nội dung ⇒ trả tin cũ; khác nội dung/kênh/segment ⇒ `MESSAGE_ID_REUSED` |
| Lịch sử | phân trang **50 tin** bằng con trỏ `(context, channel, sequence)`; `ROOM`: mọi thành viên hiện hành đọc toàn bộ context hiện tại (kể cả tin trước lúc vào); `PLAYERS`: chỉ segment có participant đúng `user_id + membership_id` hiện hành (C thay B không đọc được tin A–B) |
| Ngữ cảnh | phòng chờ → ván đầu giữ tin (chỉ gắn match_id); **tái đấu** ⇒ context mới, 2 kênh trống |
| Gửi | **SQL thuần**: khoá phòng → profile người gửi → context; kiểm membership/epoch/segment; idempotency; rate; cấp sequence; INSERT; COMMIT; phát sau commit cho tài khoản còn quyền **tại lúc phát** |
| Đọc | Prisma được, với điều kiện quyền đầy đủ tại thời điểm đọc |
| Lưu giữ | xoá tin `created_at <= now − 30 ngày` (job định kỳ) |
| Nhãn minh bạch | kênh chung **luôn** hiện dòng *"ℹ️ Người chơi cũng đọc và gửi được ở kênh này"*; tin người chơi gửi vào kênh chung có nhãn "(người chơi)" |

**Danh sách Story:**
| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST13.1](../story/ST13.1-dich-vu-chat-2-kenh-gui-doc-lich-su-phan-quyen-theo-segment.md) | Dịch vụ chat 2 kênh: gửi, đọc lịch sử, phân quyền theo segment | 4 | 3 |
| [ST13.2](../story/ST13.2-lich-su-phan-trang-don-30-ngay-kiem-thu-hoi-end-to-end-giao.md) | Lịch sử/phân trang, dọn 30 ngày, kiểm thu hồi end-to-end, giao diện chat 2 khung | 4 | 5 |
