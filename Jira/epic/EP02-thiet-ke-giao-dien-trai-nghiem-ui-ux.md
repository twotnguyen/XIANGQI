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

**Mô tả:**

**Mục tiêu:** Frontend không phải tự nghĩ giao diện. Mỗi màn hình có bản thiết kế đủ **2 kích thước** (máy tính 1366×768, điện thoại 360×800), đủ **5 trạng thái** (đang tải · trống · lỗi · vô hiệu có giải thích · thành công), và ghi chú tương tác (bấm gì → đi đâu, cửa sổ nào đóng được, xác nhận nào phải ghi hậu quả). Thiết kế xong **trước** sprint Frontend làm màn hình đó.

**Nguyên tắc thiết kế bắt buộc (áp dụng cho mọi Task Design):**
- Định hướng **cờ tướng truyền thống**: nền giấy, bàn gỗ, quân chữ Hán. Không dùng phong cách dashboard hiện đại; không dùng thư viện UI dựng sẵn (Material, Ant, Chakra…).
- **7 màu cố định, không được đổi mã màu:** nền giấy `#F5E8CC` · gỗ sáng `#D8AE72` · gỗ viền `#704525` · mực `#28221C` · đỏ quân `#A51F25` · đen quân `#24201C` · tiêu điểm `#155E75`. Có thể dùng biến thể độ trong suốt cho nền phụ nhưng chữ luôn đạt tương phản ≥ 4,5:1.
- Khoảng cách chỉ dùng bội số **4 · 8 · 12 · 16 · 24 · 32 px**. Vùng chạm nút ≥ **44 px**.
- **Không truyền thông tin chỉ bằng màu**: đến lượt = viền + chữ "Đến lượt bạn"; bị chiếu = chữ "Đang bị chiếu" + biểu tượng; online = chấm + chữ "Đang online"; đồng hồ sắp hết = số + biểu tượng cảnh báo.
- Font giao diện: font hệ thống có tiếng Việt; quân cờ: font chữ Hán **tự host** (chọn font có giấy phép cho phép nhúng web, ghi tên + giấy phép vào ghi chú bàn giao).
- Toàn bộ chữ **tiếng Việt**; thông báo lỗi nói rõ **cách sửa**.
- Năm quy tắc bố cục không được phá: (1) camera/mic không đè bàn cờ; (2) thông báo tạm không che nút Đầu hàng; (3) nhãn khung chat ghi rõ kênh *riêng người chơi* / *chung*; (4) đồng hồ luôn nhìn thấy khi đang chơi; (5) 360px không cuộn ngang.

**Không làm:** viết mã (Frontend làm), đổi luật nghiệp vụ.

**Danh sách Story:**
| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST02.1](../story/ST02.1-design-system-va-ban-co.md) | Design system và bàn cờ | 1 | 5 |
| [ST02.2](../story/ST02.2-man-tai-khoan-ban-be-sanh-phong-cho-loi-moi-nguoi-xem.md) | Màn tài khoản, bạn bè, sảnh, phòng chờ, lời mời, người xem | 1 | 5 |
| [ST02.3](../story/ST02.3-man-van-online-thao-tac-dong-ho-chong-treo-mat-ket-noi-ket-q.md) | Màn ván online: thao tác, đồng hồ, chống treo, mất kết nối, kết quả, chat, media | 2 | 5 |
| [ST02.4](../story/ST02.4-man-choi-voi-may-lich-su-va-xem-lai.md) | Màn chơi với máy, lịch sử và xem lại | 2 | 2 |

**Tiêu chí hoàn thành Epic:** 36 màn hình/cửa sổ trong danh mục đều có thiết kế đủ 2 kích thước và 5 trạng thái (hoặc ghi rõ "không áp dụng" + lý do); Tester rà theo checklist PASS; link file thiết kế gắn vào từng Task Frontend tương ứng.

**Công cụ:** Figma (hoặc công cụ nhóm thống nhất). Mỗi Task Design đính kèm: link file, ảnh PNG từng frame (Attachment), và bảng "ghi chú tương tác".
