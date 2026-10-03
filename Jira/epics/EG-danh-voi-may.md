# [EG] Đánh với máy (Nhóm G)

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Epic |
| Nhãn | `P1` |
| Nhóm tính năng ([docs/01](../../docs/01-yeu-cau-chi-tiet.md)) | G |
| Mục tiêu cốt lõi | Mục tiêu 8: đánh với máy theo cấp độ |
| Ước lượng tổng | 14 ngày công (T1 10,5 · T2 2 · T3 1,5) |
| Số Story / Task | 4 / 7 |

## Mô tả

Máy cờ tự viết 3 cấp độ chạy tiến trình riêng và luồng ván với máy.

## Phạm vi

* Tìm kiếm negamax + alpha-beta, 3 cấp Dễ/Trung bình/Khó
* Tiến trình riêng, hàng đợi, hạn chót, xử lý lỗi
* Chọn phe Đỏ/Đen/Ngẫu nhiên
* Giữ ván 30 phút để vào lại, Bỏ dở
* Không làm ở P1: đi lại với máy, lưu lịch sử, widget thông số

## Tiêu chí hoàn thành Epic

* Mọi AC của US-AI-01…04 đạt
* Kịch bản D8, D10 chạy
* Máy cờ đạt thời gian và sức mạnh ở docs/02 mục 9.5 (hoặc ghi số thật nếu không đạt)

## Story

* [US-AI-01](../stories/US-AI-01.md) Chọn cấp độ và phe
* [US-AI-02](../stories/US-AI-02.md) Chơi với máy
* [US-AI-03](../stories/US-AI-03.md) Kết thúc, bỏ dở và vào lại
* [US-AI-04](../stories/US-AI-04.md) Sự cố máy cờ

## Task

| Việc | Vai trò | Ngày | Đợt | Tiền đề |
|---|---|---:|---|---|
| [TG-01](../tasks/TG-01.md) Máy cờ: negamax, alpha-beta, tìm sâu dần, hàm lượng giá | R3 | 3,5 | T1 | TC-02, T0-09 |
| [TG-02](../tasks/TG-02.md) Máy cờ: cấp Dễ và Trung bình (ngẫu nhiên có kiểm soát) | R3 | 1 | T1 | TG-01 |
| [TG-03](../tasks/TG-03.md) Máy cờ: cấp Khó (bảng chuyển vị, tìm tĩnh) | R3 | 2 | T2 | TG-02 |
| [TG-04](../tasks/TG-04.md) Tiến trình máy cờ riêng, hàng đợi, hạn chót, khởi động lại | R3 | 1,5 | T1 | TG-02 |
| [TG-05](../tasks/TG-05.md) BE: dịch vụ ván với máy (phe, vào lại 30 phút, bỏ dở) | R2 | 2 | T1 | TG-04, TD-01, TD-03 |
| [TG-06](../tasks/TG-06.md) FE: thẻ cấp độ, AI-SETUP, trang ván với máy | R4 | 2,5 | T1 | TG-05, TC-07, TD-07 |
| [TG-07](../tasks/TG-07.md) Đo máy cờ: thời gian, sức mạnh, 1 000 ván ổn định | R3 | 1,5 | T3 | TG-03, TG-04 |

## Thành phần giao diện liên quan

`SCR-AI-GAME`, `MODAL-AI-SETUP`

## Rủi ro

* Độ sâu 6 trong 3 giây bằng TypeScript chưa có số đo
* Phương án dự phòng: giảm độ sâu 5 (cần Product Owner đồng ý)

## Tài liệu tham chiếu

* BA 6.1, 6.3
* docs/02 mục 9
* docs/04 mục 8
* DANH-MUC SCR-AI-GAME, MODAL-AI-SETUP
