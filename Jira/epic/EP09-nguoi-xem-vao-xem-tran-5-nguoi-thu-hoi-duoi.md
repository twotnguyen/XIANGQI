# EP09 · Người xem: vào xem, trần 5 người, thu hồi, đuổi

> **Loại:** Epic · **Story:** [ST09.1](../story/ST09.1-vao-xem-theo-che-do-tran-5-nguoi-giu-ghe-15-giay.md), [ST09.2](../story/ST09.2-thu-hoi-hang-loat-duoi-nguoi-xem-va-giao-dien-danh-sach-nguo.md)

| Trường Jira | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | `EP09 · Người xem: vào xem, trần 5 người, thu hồi, đuổi` |
| Components | Backend, Frontend, Tester |
| Priority | High |
| Labels | `xq-v2`, `ep09`, `security`, `race` |
| Fix versions | `v1.0.0` |
| Start date / Due date | 2026-10-19 / 2026-10-21 |
| Nguồn đặc tả | ISSUE-073 … ISSUE-077 (R04, R18) |

**Mục tiêu:** Người dùng vào xem đúng quyền theo chế độ phòng, tối đa **5** người xem, giữ ghế **15 giây** khi mất mạng, bị đưa ra hàng loạt khi phòng chuyển kín hơn/đổi mã xem, và **cả hai người chơi** đuổi được một người xem cụ thể — người bị đuổi **không vào lại phòng đó bằng bất kỳ đường nào** cho tới khi phòng đóng.

**Quy tắc chung:**
| Mục | Quy tắc |
|---|---|
| Vào xem theo chế độ | PUBLIC: vào thẳng (khi phòng WAITING/PLAYING). CODE_ONLY: cần lời mời trực tiếp/mã/link **WATCH** hợp lệ. LOCKED: **không ai** vào xem; mời **chơi** vẫn dùng được |
| Phòng đã xong ván (FINISHED) | không hiện ở sảnh; vào xem được bằng quyền WATCH hợp lệ |
| Thứ tự kiểm | đăng nhập + onboarding + **email đã xác minh** → đang ở phòng khác? → bằng chứng biết phòng (không có ⇒ lỗi chung) → phòng mở + không bị chặn → đúng chế độ → còn ghế |
| Người xem thấy gì | bàn cờ realtime, **kênh chung** (kể cả tin trước lúc vào), camera/mic của người chơi nếu người đó chọn "Đối thủ và người xem". **Không** thấy kênh riêng người chơi |
| Đuổi | chỉ **người chơi** (cả hai, không riêng chủ phòng); không đuổi được người chơi (kể cả đối thủ/chính mình); người bị đuổi vào `room_blocks` của phòng đó, xoá khi phòng đóng; vẫn vào phòng khác bình thường |
| Thu hồi hàng loạt | chỉ dùng primitive `revokeWatch` (TK08.3.2); người bị thu hồi **không** vào `room_blocks` |

**Danh sách Story:**
| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST09.1](../story/ST09.1-vao-xem-theo-che-do-tran-5-nguoi-giu-ghe-15-giay.md) | Vào xem theo chế độ, trần 5 người, giữ ghế 15 giây | 4 | 3 |
| [ST09.2](../story/ST09.2-thu-hoi-hang-loat-duoi-nguoi-xem-va-giao-dien-danh-sach-nguo.md) | Thu hồi hàng loạt, đuổi người xem và giao diện danh sách người xem | 4 | 5 |
