# LƯU TRỮ — TÀI LIỆU LẦN XÂY DỰNG TRƯỚC

**Cập nhật:** 2026-09-21 · **Căn cứ:** `DEC-001`, `DEC-017`

---

## ĐÂY LÀ GÌ

Toàn bộ **100 tài liệu** của lần xây dựng trước dự án này. Chúng được **giữ nguyên, không sửa, không xoá**.

> ⚠ **Không dùng tài liệu trong thư mục này làm căn cứ triển khai.**
> Yêu cầu hiện hành nằm ở [../01-requirements/](../01-requirements/).

---

## VÌ SAO GIỮ LẠI

| Thư mục | Giá trị |
|---|---|
| **`reviews-v1/`** | ⭐ **Giá trị cao nhất.** 30 lỗi thật đã xảy ra khi triển khai chính bộ luật này. Là danh sách những chỗ cần phòng trước |
| `test-reports-v1/` | Số đo thật của lần trước — dùng làm mốc so sánh |
| `issues-v1/` | Bằng chứng bộ đặc tả này **phân rã được** thành 32 bước thực thi có thứ tự |
| `specs-v1/` | Bản đặc tả cũ — đối chiếu khi nghi ngờ yêu cầu mới bỏ sót gì |
| `handoff-v1/` | Hướng dẫn vận hành, triển khai của lần trước |
| `research/` | Nghiên cứu nền về xác thực, cơ sở dữ liệu, media |
| `original-analysis.md` | Bản phân tích đầu tiên, trước cả phỏng vấn |

---

## ĐỌC GÌ TRƯỚC KHI CODE

**`reviews-v1/AGENT-HANDOFF-REVIEW-20260913-1706.md`** — báo cáo review độc lập tìm ra 30 lỗi.

Bảy lỗi trọng yếu và cách bộ tài liệu mới phòng ngừa:

| Lỗi từng xảy ra | Phòng ngừa ở đâu |
|---|---|
| Đi nước mới sau **đi lại** luôn gây lỗi trùng khoá | `BR-MAT-09` · mô hình **cây** nước đi |
| Đếm lặp 3 lần tính **cả nhánh đã bỏ** ⇒ hoà sai | `BR-MAT-10` · `GR-END-02` |
| Vào phòng theo mã **bỏ qua kiểm chế độ riêng tư** | `BR-LOB-08` · FLOW-JOIN-ROOM thứ tự kiểm |
| Thu hồi quyền người xem là **code chết** | `BR-SPEC-06` · `AC-MED-07` đo luồng thật |
| **Không có bộ đếm** thời hạn | `ARCH-08` · 5 bộ đếm chủ động |
| Test dữ liệu **tự mock chính nó** | `AC-RULE-02` · chạy trên dịch vụ thật |
| **Toạ độ đặc tả ngược** với mã nguồn | `DEC-003` · `GR-COORD` |

Chi tiết: [../08-ba-review/traceability-matrix.md](../08-ba-review/traceability-matrix.md) §3

---

## LƯU Ý VỀ TRẠNG THÁI

Tài liệu trong đây ghi dự án ở trạng thái **hoàn thành ở máy cá nhân** với 482 kiểm thử đạt. Đó là trạng thái của **lần xây dựng trước**, **không phải** trạng thái của bản đang thiết kế lại.

Bộ tài liệu mới bắt đầu lại từ đầu (`DEC-001`).

---

## NỘI DUNG

| Thư mục | Số file |
|---|---|
| `specs-v1/` | 9 |
| `issues-v1/` | 33 |
| `handoff-v1/` | 11 |
| `reviews-v1/` | 2 |
| `test-reports-v1/` | 35 |
| `research/` | 3 (+2 tệp dữ liệu) |
| Tệp lẻ | `original-analysis.md` · `README-v1.md` · `READINESS.md` · `TRACEABILITY.md` |
