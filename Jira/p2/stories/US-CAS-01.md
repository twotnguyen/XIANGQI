# [US-CAS-01] Ghép ngẫu nhiên Đánh Thường (P2)

> **Bản nháp P2, chưa lên kế hoạch.** Chưa tạo trên Jira.

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [K](../epics/K.md) · Đánh Thường mở rộng |
| Nhãn | `P2` |
| Nguồn luật | BA 2.0, 2.1 |

## Tiêu chí nghiệm thu (chép nguyên từ docs/01)

* **AC-CAS-01-01** — Chọn Không giới hạn/5/10/15 phút; chỉ ghép cùng mức, không thêm tiêu chí Elo hoặc chuyển sang Đánh Hạng.
* **AC-CAS-01-02** — Chờ tối đa 60 giây, được Huỷ trước khi tìm thấy; hết hạn không ghép AI. Kiểm một vị trí chơi và chống ghép trùng như hợp đồng hàng đợi [07].
* **AC-CAS-01-03** — Người vào hàng đợi trước là Host; ghép thành công vào phòng chờ, hai bên Sẵn sàng, đếm 3 giây; bỏ Sẵn sàng dừng đếm.
* **AC-CAS-01-04** — Phòng mặc định PUBLIC có ghi chú cho người tìm; dùng quy tắc CASUAL và sức chứa phòng, không mở quyền xem cho RANKED.

## Ghi chú

Tách thành Task và ước lượng khi lên kế hoạch P2.
