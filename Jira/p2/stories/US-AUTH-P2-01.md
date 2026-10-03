# [US-AUTH-P2-01] Khách (P2)

> **Bản nháp P2, chưa lên kế hoạch.** Chưa tạo trên Jira.

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [I](../epics/I.md) · Tài khoản mở rộng |
| Nhãn | `P2` |
| Nguồn luật | BA 1.3 |

## Tiêu chí nghiệm thu (chép nguyên từ docs/01)

* **AC-AUTH-P2-01-01** — Nút Guest mở hộp nhập tên 2–20 ký tự, qua bộ lọc, không cần duy nhất; thành công vào Sảnh hoặc phòng mời ban đầu, luôn gắn nhãn (Khách).
* **AC-AUTH-P2-01-02** — Phiên chỉ trong trình duyệt hiện tại, thời hạn 12 giờ; nếu đến hạn khi đang ngồi ghế/đang đấu thì gia hạn tới lúc rời. Rời phòng trước hạn vẫn giữ cùng phiên; Đăng xuất chủ động kết thúc phiên. Đăng xuất giữa ván theo quy tắc xác nhận đầu hàng ở BA 1.8/6.3.
* **AC-AUTH-P2-01-03** — Khách được Đánh Thường, AI, xem, chat phòng và camera/mic khi ngồi ghế; máy chủ chặn Đánh Hạng, Elo, bạn bè và thay đổi tài khoản dù gọi trực tiếp.
* **AC-AUTH-P2-01-04** — Mỗi Khách có tối đa một phòng đang mở do mình tạo, chịu sức chứa và giới hạn chat như tài khoản; phiên mới là danh tính mới, giới hạn né chặn bằng phiên mới được công bố ở BA 4.2.
* **AC-AUTH-P2-01-05** — Không lịch sử/Replay phía Khách, không chuyển dữ liệu sang tài khoản mới. Đối thủ chính thức vẫn có bản ghi ván; khi phiên Khách hết thì thay tên cá nhân bằng Khách, không xoá bản ghi ván của đối thủ. Đồng thời xoá khỏi mọi phòng còn mở các tin chat do Khách đó gửi và tên hiển thị cá nhân; người còn trong phòng thấy tin đã bị gỡ, tên chung "Khách" (đề xuất 04/10/2026, chờ PO duyệt).

## Ghi chú

Tách thành Task và ước lượng khi lên kế hoạch P2.
