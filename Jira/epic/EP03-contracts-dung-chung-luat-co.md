# EP03 · Contracts dùng chung & luật cờ

> **Loại:** Epic · **Story:** [ST03.1](../story/ST03.1-contracts-kieu-du-lieu-toa-do-schema-zod-ma-loi.md), [ST03.2](../story/ST03.2-the-co-ban-dau-khoa-lap-hinh-hoc-tan-cong-nuoc-di-7-loai-qua.md), [ST03.3](../story/ST03.3-nuoc-hop-le-ap-dung-nuoc-ket-thuc-van-va-lap-3-lan.md)

| Trường Jira | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | `EP03 · Contracts dùng chung & luật cờ` |
| Components | Backend, Tester |
| Priority | Highest |
| Labels | `xq-v2`, `ep03`, `critical-path` |
| Fix versions | `v0.1.0` |
| Start date / Due date | 2026-09-29 / 2026-10-02 |
| Nguồn đặc tả | ISSUE-006 … ISSUE-025 |

**Mục tiêu:** Một gói kiểu dữ liệu dùng chung (`@xiangqi/contracts`) và một gói **luật cờ thuần** (`@xiangqi/game-rules`) — không phụ thuộc DB, mạng, React — dùng chung cho server (phân xử), web (gợi ý nước hợp lệ) và AI (tìm kiếm). Sai ở đây là sai toàn bộ.

**⭐ Hệ toạ độ (áp dụng cho MỌI Task trong Epic):**
```
Bàn 9 cột × 10 hàng giao điểm, toạ độ (x, y) đếm từ 0.
x: 0 → 8 trái sang phải.  y: 0 → 9 TRÊN xuống DƯỚI.
y = 0: hàng cuối của ĐEN (trên cùng).  y = 9: hàng cuối của ĐỎ (dưới cùng).
Nửa sân ĐEN y 0..4 · Nửa sân ĐỎ y 5..9 · Sông giữa y=4 và y=5.
Cung ĐEN: x 3..5, y 0..2 · Cung ĐỎ: x 3..5, y 7..9.
Tốt ĐỎ qua sông khi y ≤ 4 · Tốt ĐEN qua sông khi y ≥ 5.
Chỉ số mảng = y * 9 + x, mảng đúng 90 phần tử. ĐỎ đi trước.
Người cầm ĐEN thấy bàn lật — CHỈ là hiển thị; toạ độ gửi lên server không đổi.
```
Lần xây dựng trước đã đặt ĐỎ ở `y=0` (ngược đặc tả) và phát hiện quá muộn. Mọi mục kiểm thử (Ready for Test) và Task Tester trong Epic này phải có ca khẳng định **ĐEN ở y=0, ĐỎ ở y=9**.

**Phạm vi:** kiểu bàn cờ/ván/phòng/chat/media/AI, schema Zod + mã lỗi; thế ban đầu; khoá thế cờ; hình học tấn công; sinh nước 7 loại quân; tướng đối mặt; cấm tự chiếu; validate/apply; kết thúc (chiếu hết, hết nước); lặp 3 lần.
**Không làm:** lưu DB (EP05, EP10), đồng hồ (EP11), AI (EP04).

**Luật chung cho mọi Task BE trong Epic:**
- Hàm **thuần**: không sửa tham số đầu vào, cùng input → cùng output, không dùng biến toàn cục.
- `packages/game-rules` chỉ được import `@xiangqi/contracts` (luật lint đã chặn `pg`, `@nestjs/*`, `fs`, `react`…).
- Unit test đặt cạnh mã (`*.test.ts`) hoặc `tests/unit/`, tên test có mã ca (ví dụ `T017-02`).
- **Đáp án test phải lập luận tay**, không lấy output của chính hàm đang test làm đáp án.

**Danh sách Story:**
| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST03.1](../story/ST03.1-contracts-kieu-du-lieu-toa-do-schema-zod-ma-loi.md) | Contracts: kiểu dữ liệu, toạ độ, schema Zod, mã lỗi | 1 | 5 |
| [ST03.2](../story/ST03.2-the-co-ban-dau-khoa-lap-hinh-hoc-tan-cong-nuoc-di-7-loai-qua.md) | Thế cờ ban đầu, khoá lặp, hình học tấn công, nước đi 7 loại quân | 1 | 8 |
| [ST03.3](../story/ST03.3-nuoc-hop-le-ap-dung-nuoc-ket-thuc-van-va-lap-3-lan.md) | Nước hợp lệ, áp dụng nước, kết thúc ván và lặp 3 lần | 1 | 5 |

**Tiêu chí hoàn thành Epic:** `getLegalMoves(createInitialPosition())` trả đúng 44 nước; 3 fixture F-MATE / F-STALEMATE / F-REPEAT cho đúng kết quả; mọi test xanh, 0 skip; Tester ký xác nhận toạ độ.

**Gợi ý nhân lực:** đây là đường găng Sprint 1. Hai người làm song song: người A làm ST03.1 rồi hỗ trợ; người B làm ST03.2 → ST03.3. Thành viên nhóm AI (chưa có việc AI ở Sprint 1) có thể nhận TK03.2.3 — component vẫn là **Backend**.
