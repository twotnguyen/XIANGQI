# EP02 · Thiết kế giao diện & trải nghiệm (UI/UX)

> **Loại:** Epic · **Story:** [ST02.1](../story/ST02.1-design-system-va-ban-co.md), [ST02.2](../story/ST02.2-man-tai-khoan-ban-be-sanh-phong-cho-loi-moi-nguoi-xem.md), [ST02.3](../story/ST02.3-man-van-online-thao-tac-dong-ho-chong-treo-mat-ket-noi-ket-q.md), [ST02.4](../story/ST02.4-man-choi-voi-may-lich-su-va-xem-lai.md)

| Trường Jira | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | `EP02 · Thiết kế giao diện & trải nghiệm (UI/UX)` |
| Components | Design, Tester |
| Priority | High |
| Labels | `xq-v2`, `ep02` |
| Fix versions | `v0.2.0` |
| Start date / Due date | 2026-09-28 / 2026-10-06 |
| Nguồn đặc tả | `docs/03-screens/` (design-tokens, screen-inventory, screen-states), REQ-BOARD. Bộ 138 issue gốc **không có** issue Design — Epic này bổ sung phần thiếu đó |

---

> ⏱ **Đọc lần đầu:** khoảng 10 phút. · Từ kỹ thuật lạ ⇒ [Từ điển kỹ thuật](../05-TU-DIEN-KY-THUAT.md) · Cách kiểm thiết kế ⇒ [Sổ tay kiểm thử §13](../04-HUONG-DAN-KIEM-THU.md)

## 1. TÓM TẮT (đọc trong 1 phút)

Frontend **không phải tự nghĩ giao diện**. Trước khi Frontend làm một màn, màn đó đã có trên Figma:
- đủ **2 kích thước** (máy tính 1366, điện thoại 360; phòng chơi thêm 390 và 1920),
- đủ **5 trạng thái** (Đang tải · Trống · Lỗi · Vô hiệu có giải thích · Thành công),
- **ghi chú tương tác** (bấm gì → đi đâu; cửa sổ nào đóng được; xác nhận nào phải ghi hậu quả),
- **bảng chữ** (mọi câu thông báo chính xác từng chữ).

Tổng cộng khoảng **36 màn/cửa sổ**, chia 4 Story theo thứ tự Frontend cần.

## 2. BỐI CẢNH — VÌ SAO EPIC NÀY TỒN TẠI

- PO đặt mục tiêu **"giao diện đẹp"** theo phong cách cờ tướng truyền thống (Câu 19 phỏng vấn).
- Chuẩn **WCAG 2.1 AA có số đo thật** (`DEC-024`): bảng màu đã được đo, không ai được tự đổi.
- Nhiều câu chữ trên giao diện là **luật bảo mật** (không lộ tài khoản/phòng tồn tại) và **luật nghiệp vụ** (xác nhận phải nói hậu quả) — thiết kế sai là code sai theo.

## 3. KHÁI NIỆM CẦN HIỂU

| Khái niệm | Giải thích |
|---|---|
| **Figma** | Công cụ thiết kế trên web; cả nhóm xem chung một file qua link |
| **Frame** | Một "màn hình" có kích thước cố định trong Figma |
| **Component / variant** | Thành phần dùng lại và các trạng thái của nó |
| **Token** | Tên có ý nghĩa cho màu/khoảng cách (`--color-red`) — Frontend dùng tên, không dùng mã |
| **Tương phản WCAG AA** | Chữ thường ≥ 4,5:1; chữ lớn và đồ hoạ ≥ 3:1 |
| **Ready for Test (Task thiết kế)** | Đã gửi link Figma + PNG + bảng chữ trong Jira (không có PR/CI) — xem [Sổ tay §13](../04-HUONG-DAN-KIEM-THU.md) |

## 4. PHẠM VI

**✅ LÀM:** design system + bàn cờ; màn tài khoản, bạn bè, sảnh, phòng chờ, lời mời, người xem; phòng chơi, chat, camera; chơi với máy, lịch sử, xem lại.
**❌ KHÔNG LÀM:** viết code (Frontend); đổi luật nghiệp vụ (thấy luật vô lý ⇒ báo PO/BA, không tự đổi trên thiết kế); thiết kế logo/thương hiệu riêng.

## 5. NGUYÊN TẮC BẮT BUỘC (mọi Task thiết kế)

| # | Nguyên tắc |
|---|---|
| 1 | Định hướng **cờ tướng truyền thống**: nền giấy, bàn gỗ, quân chữ Hán. Không phong cách dashboard; không thư viện UI dựng sẵn (Material, Ant, Chakra…) |
| 2 | **7 màu cố định, không đổi mã:** giấy `#F5E8CC` · gỗ `#D8AE72` · gỗ viền `#704525` · mực `#28221C` · đỏ `#A51F25` · đen `#24201C` · tiêu điểm `#155E75`. Được dùng biến thể trong suốt cho nền phụ nhưng chữ luôn ≥ 4,5:1 |
| 3 | Khoảng cách chỉ **4 · 8 · 12 · 16 · 24 · 32 px**; vùng chạm ≥ **44 px** |
| 4 | **Không truyền thông tin chỉ bằng màu**: đến lượt = viền + chữ; bị chiếu = chữ + biểu tượng; online = chấm + chữ; đồng hồ sắp hết = số + biểu tượng |
| 5 | Font giao diện: font hệ thống có tiếng Việt. Quân cờ: font chữ Hán **tự host**, có giấy phép nhúng web (ghi tên + giấy phép) |
| 6 | Toàn bộ chữ **tiếng Việt**; thông báo lỗi nói rõ **cách sửa** |
| 7 | **5 quy tắc bố cục:** camera/mic không đè bàn · thông báo tạm không che nút Đầu hàng · nhãn chat ghi rõ kênh *riêng người chơi* / *chung* · đồng hồ luôn thấy khi đang chơi · 360 px không cuộn ngang |
| 8 | Vô hiệu **luôn** có câu giải thích (`SCR-RULE-01`) |

## 6. ĐẦU VÀO

Không phụ thuộc Epic nào. Cần: tài khoản Figma (gói miễn phí đủ), file chung của nhóm; đọc đặc tả `docs/03-screens/` (danh mục màn, trạng thái, token).

## 7. DANH SÁCH STORY

| Story | Tên | Sprint | SP | Frontend dùng ở |
|---|---|---|---|---|
| [ST02.1](../story/ST02.1-design-system-va-ban-co.md) | Design system và bàn cờ | 1 | 5 | EP01 (TK01.3.1), EP10 |
| [ST02.2](../story/ST02.2-man-tai-khoan-ban-be-sanh-phong-cho-loi-moi-nguoi-xem.md) | Màn tài khoản, bạn bè, sảnh, phòng chờ, lời mời, người xem | 1 | 5 | EP06–EP09 |
| [ST02.3](../story/ST02.3-man-van-online-thao-tac-dong-ho-chong-treo-mat-ket-noi-ket-q.md) | Màn ván online: thao tác, đồng hồ, chống treo, mất kết nối, kết quả, chat, media | 2 | 5 | EP10–EP14 |
| [ST02.4](../story/ST02.4-man-choi-voi-may-lich-su-va-xem-lai.md) | Màn chơi với máy, lịch sử và xem lại | 2 | 2 | EP12, EP15 |

## 8. TIÊU CHÍ HOÀN THÀNH EPIC

- [ ] 4 Story Done; mọi Task có báo cáo rà thiết kế.
- [ ] Mọi màn trong `docs/03-screens/screen-inventory.md` có frame 2 kích thước và 5 trạng thái (hoặc ghi "Không áp dụng vì …").
- [ ] Link Figma gắn vào **từng** Task Frontend tương ứng (xem mục "Bàn giao" của mỗi Task thiết kế).
- [ ] Không có màu ngoài 7 mã chốt dùng cho chữ; mọi cặp chữ/nền đo đạt AA.

## 9. KỊCH BẢN DEMO (~10 phút, cuối Sprint 2)

Chiếu Figma ở chế độ Present: design system → bàn cờ (bật/tắt giả lập mù màu) → đăng nhập → sảnh → phòng chờ → phòng chơi (góc nhìn người chơi và người xem) → treo ván → kết quả → lịch sử → xem lại.

## 10. RỦI RO VÀ CÁCH GIẢM

| Rủi ro | Khả năng | Ảnh hưởng | Cách giảm |
|---|---|---|---|
| Thiết kế trễ ⇒ Frontend phải đoán | Trung bình | Cao | Thứ tự Story theo đúng thứ tự Frontend cần; ST02.1 xong ngày 29/09 |
| Người thiết kế đổi màu cho đẹp | Trung bình | Cao | Nguyên tắc 2 + ca kiểm QA02.1.1-01/02 |
| Câu chữ trên thiết kế lệch đặc tả | Cao | Trung bình | Bảng chữ + Tester so từng câu |
| Thiết kế thiếu trạng thái Lỗi/Trống | Cao | Trung bình | Checklist 5 trạng thái ở mỗi Task |
