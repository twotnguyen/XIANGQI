# Jira/ · Bản nháp Epic, Story, Task để review (Giai đoạn 3)

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

Thư mục này chứa **mỗi Epic, Story và Task một tệp `.md`** với đầy đủ thông tin sẽ nhập vào Jira, để Product Owner và nhóm **review trước khi tạo thật**. Không tệp nào trong đây đã có trên Jira. Căn cứ: [docs/01](../docs/01-yeu-cau-chi-tiet.md) (US/AC), [docs/06](../docs/06-ke-hoach-jira.md) (kế hoạch, ước lượng, vai trò).

## Quy ước

* **Mã tạm** (`E0`, `US-ROOM-05`, `TB-02`) được **giữ trong tiêu đề** Jira để đối chiếu tài liệu. Khoá Jira thật dạng `XIAN-<số>` do Jira cấp.
* **Phân cấp:** Epic → Story (một US) → Task. Một Task có thể phục vụ nhiều Story nên nối bằng *relates to*; cột "Tiền đề" thành *is blocked by*.
* **Nhãn:** `P1`/`P2`, đợt `T1`/`T2`/`T3`, vai trò `R1`…`R7`.
* **Ước lượng:** ngày công (người làm trọn một ngày). Ước lượng thô ±30%.
* **Người thực hiện:** để trống; Product Owner gán tên vào R1–R7 (docs/06 mục 3).

## Số lượng

| Loại | P1 | P2 |
|---|---:|---:|
| Epic | 10 | 6 |
| Story | 53 | 28 |
| Task | 78 | chưa tạo |

## Cách review

1. Đọc [docs/06](../docs/06-ke-hoach-jira.md) mục 1 (kết luận về hạn 2 tuần; thứ tự dừng phần là lịch sử đã bị thay thế 04/10).
2. Với mỗi Epic: kiểm phạm vi, tiêu chí hoàn thành, rủi ro.
3. Với mỗi Story: kiểm tiêu chí nghiệm thu (chép nguyên từ docs/01).
4. Với mỗi Task: kiểm việc cần làm, ước lượng, tiền đề, vai trò.
5. Ghi nhận xét vào PR; sau khi duyệt, Product Owner cho phép tạo lên Jira dự án **XIAN**.

## Danh sách Epic P1

| Epic | Ước lượng | Story | Task |
|---|---:|---:|---:|
| [E0](epics/E0-nen-tang.md) Nền tảng và thử nghiệm rủi ro | 11 | 0 | 9 |
| [EA](epics/EA-tai-khoan.md) Tài khoản và phiên (Nhóm A) | 12 | 6 | 9 |
| [EB](epics/EB-phong.md) Phòng, mời, ghế, người xem (Nhóm B) | 20 | 12 | 14 |
| [EC](epics/EC-ban-co-luat-co.md) Bàn cờ và luật cờ (Nhóm C) | 16 | 5 | 8 |
| [ED](epics/ED-van-online.md) Ván đấu online (Nhóm D) | 18,5 | 10 | 10 |
| [EE](epics/EE-chat-media.md) Chat và camera/mic (Nhóm E) | 12 | 5 | 6 |
| [EF](epics/EF-ban-be.md) Bạn bè (Nhóm F) | 8 | 5 | 4 |
| [EG](epics/EG-danh-voi-may.md) Đánh với máy (Nhóm G) | 14 | 4 | 7 |
| [EH](epics/EH-giao-dien-chung.md) Giao diện chung (Nhóm H) | 7,5 | 6 | 4 |
| [EQ](epics/EQ-kiem-thu-demo.md) Kiểm thử chấp nhận và chuẩn bị demo | 9 | 0 | 7 |

## Epic P2 (chưa lên kế hoạch)

* [I](p2/epics/I.md) Tài khoản mở rộng
* [J](p2/epics/J.md) Đánh Hạng
* [K](p2/epics/K.md) Đánh Thường mở rộng
* [L](p2/epics/L.md) Xã hội mở rộng
* [M](p2/epics/M.md) Lịch sử, xem lại, xuất dữ liệu
* [N](p2/epics/N.md) Tiện ích demo
