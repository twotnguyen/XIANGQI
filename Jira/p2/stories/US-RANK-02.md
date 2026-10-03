# [US-RANK-02] Luật ván Đánh Hạng (P2)

> **Bản nháp P2, chưa lên kế hoạch.** Chưa tạo trên Jira.

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [J](../epics/J.md) · Đánh Hạng |
| Nhãn | `P2` |
| Nguồn luật | BA 8.1, 7.2 |

## Tiêu chí nghiệm thu (chép nguyên từ docs/01)

* **AC-RANK-02-01** — Chỉ ghép ngẫu nhiên, 10 phút/bên không cộng giây; cấm Khách, người xem, Đi lại, Tái đấu ở cả giao diện và máy chủ.
* **AC-RANK-02-02** — Xin hoà chỉ bật khi mỗi bên đã đi ít nhất 20 nước; 19/20 còn chặn, 20/20 cho phép; hạn 30 giây và chờ 5 nước sau từ chối/hết hạn theo luật chung.
* **AC-RANK-02-03** — Đầu hàng/rời/Đăng xuất chủ động theo xác nhận như online; dù đầu hàng nước đầu vẫn tính Elo bình thường.
* **AC-RANK-02-04** — Kết thúc dùng thứ tự luật ở [02], ngừng nhận lệnh; chỉ hai người nhận trạng thái và kết quả. Người ngoài đoán đường dẫn không nhận dữ liệu phòng/ván.
* **AC-RANK-02-05** — Sau ván giữ FINISHED/ghế tới khi người chơi Rời phòng, sau đó mới tìm trận khác; một người rời không chuyển WAITING. Người còn lại xem kết quả, không Sẵn sàng/Tái đấu/nhận mới; cả hai rời hoặc hết 10 phút ban đầu thì CLOSED (BA 7.2).

## Ghi chú

Tách thành Task và ước lượng khi lên kế hoạch P2.
