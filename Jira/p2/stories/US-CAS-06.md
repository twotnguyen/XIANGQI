# [US-CAS-06] Chia sẻ bằng QR (P2)

> **Bản nháp P2, chưa lên kế hoạch.** Chưa tạo trên Jira.

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [K](../epics/K.md) · Đánh Thường mở rộng |
| Nhãn | `P2` |
| Nguồn luật | BA 2.2, 4.3 |

## Tiêu chí nghiệm thu (chép nguyên từ docs/01)

* **AC-CAS-06-01** — MODAL-INVITE có QR của đúng link hiện hành, cùng quyền như mã/link; chỉ người ngồi ghế được mở.
* **AC-CAS-06-02** — Tải ảnh QR tạo ảnh quét được về đúng link; Sao chép QR báo thành công chỉ khi clipboard nhận ảnh, lỗi quyền/hỗ trợ thì báo lỗi và vẫn dùng Tải ảnh hoặc Sao chép link.
* **AC-CAS-06-03** — LOCKED/thu hồi làm QR cũ vô hiệu như mã/link; mở lại tạo QR cho link mới, không tái sử dụng bản cũ.
* **AC-CAS-06-04** — Người quét chưa đăng nhập hoàn tất đăng nhập/Guest rồi tự tới phòng; kiểm lại khoá, chặn, sức chứa ở thời điểm thực sự vào.

## Ghi chú

Tách thành Task và ước lượng khi lên kế hoạch P2.
