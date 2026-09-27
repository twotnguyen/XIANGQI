# EP13 · Chat hai kênh (riêng người chơi + chung)

> **Loại:** Epic · **Story:** [ST13.1](../story/ST13.1-dich-vu-chat-2-kenh-gui-doc-lich-su-phan-quyen-theo-segment.md), [ST13.2](../story/ST13.2-lich-su-phan-trang-don-30-ngay-kiem-thu-hoi-end-to-end-giao.md)

| Trường Jira | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | `EP13 · Chat hai kênh (riêng người chơi + chung)` |
| Components | Backend, Frontend, Tester |
| Priority | High |
| Labels | `xq-v2`, `ep13`, `security`, `race` |
| Fix versions | `v0.3.0` |
| Start date / Due date | 2026-10-12 / 2026-10-16 |
| Nguồn đặc tả | ISSUE-108 … ISSUE-111 (R10) |

---

> ⏱ **Đọc lần đầu:** khoảng 10 phút. · Từ kỹ thuật lạ ⇒ [Từ điển kỹ thuật](../05-TU-DIEN-KY-THUAT.md) · Cách kiểm ⇒ [Sổ tay kiểm thử](../04-HUONG-DAN-KIEM-THU.md)

## 1. TÓM TẮT (đọc trong 1 phút)

**Chat trong phòng**, 2 kênh:
- **Kênh riêng người chơi** (`PLAYERS`) — chỉ 2 người chơi hiện tại.
- **Kênh chung** (`ROOM`) — mọi thành viên, kể cả người xem.
Kèm: lịch sử phân trang, giới hạn 5 tin/10 giây, dọn tin sau 30 ngày, thu hồi quyền tức thì.

## 2. BỐI CẢNH — VÌ SAO EPIC NÀY TỒN TẠI

- Rủi ro chính: **rò kênh riêng** sang người xem, hoặc sang người chơi **thay thế**.
- Chat dùng **SQL thuần** khi gửi (khoá + đếm tần suất), Prisma khi đọc (có điều kiện quyền đầy đủ).

## 3. KHÁI NIỆM CẦN HIỂU

| Khái niệm | Giải thích |
|---|---|
| **Context** | Cuộc trò chuyện của phòng; tái đấu ⇒ context mới |
| **Segment** | Đoạn kênh riêng với đúng 2 người chơi (`user_id + membership_id`) |
| **Participant** | Người thuộc segment — kiểm cái này, không chỉ "là PLAYER" |
| **`clientMessageId`** | Chống gửi trùng |
| **Nhãn minh bạch** | Kênh chung luôn ghi "Người chơi cũng đọc và gửi được ở kênh này" |

Tra thêm: [Khoá dòng](../05-TU-DIEN-KY-THUAT.md#khoa-dong) · [Idempotency](../05-TU-DIEN-KY-THUAT.md#idempotency) · [Cursor](../05-TU-DIEN-KY-THUAT.md#cursor) · [RLS](../05-TU-DIEN-KY-THUAT.md#rls) · [Race](../05-TU-DIEN-KY-THUAT.md#race)

## 4. PHẠM VI

**✅ LÀM:** chat service 2 kênh; phân trang; dọn 30 ngày; thu hồi end-to-end; giao diện chat.

**❌ KHÔNG LÀM**
| Việc | Ở đâu |
|---|---|
| Nhắn tin riêng ngoài phòng | **Không có** trong sản phẩm |
| Thu hồi / đuổi người xem (logic) | EP08, EP09 — EP13 chỉ đảm bảo chat tuân theo |
| Tạo segment khi vào phòng / tái đấu | EP08, EP12 |

## 5. LUẬT BẮT BUỘC CHO MỌI TASK

| Luật | Nghĩa |
|---|---|
| Quyền | máy chủ quyết định theo vai trò + participant; client chỉ chọn kênh **muốn gửi** (ý định), không khai người gửi/vai trò. Chọn kênh không có quyền ⇒ từ chối, **không** tự chuyển sang kênh khác |
| Phát tin | tin `PLAYERS` **chỉ** gửi tới socket của đúng participant; ⛔ không phát ra room socket có người xem rồi để client lọc |
| Nội dung | chuẩn hoá NFC, trim; 1–1000 ký tự (đếm Unicode code point); hiển thị **dạng chữ thuần** |
| Tần suất | **5 tin / 10 giây / người**, tính **chung cả 2 kênh, mọi tab, mọi context**; retry cùng `clientMessageId` không tính thêm |
| Chống trùng | `(context_id, sender_id, client_message_id)` duy nhất; cùng id + cùng nội dung ⇒ trả tin cũ; khác nội dung/kênh/segment ⇒ `MESSAGE_ID_REUSED` |
| Lịch sử | phân trang **50 tin** bằng con trỏ `(context, channel, sequence)`; `ROOM`: mọi thành viên hiện hành đọc toàn bộ context hiện tại (kể cả tin trước lúc vào); `PLAYERS`: chỉ segment có participant đúng `user_id + membership_id` hiện hành (C thay B không đọc được tin A–B) |
| Ngữ cảnh | phòng chờ → ván đầu giữ tin (chỉ gắn match_id); **tái đấu** ⇒ context mới, 2 kênh trống |
| Gửi | **SQL thuần**: khoá phòng → profile người gửi → context; kiểm membership/epoch/segment; idempotency; rate; cấp sequence; INSERT; COMMIT; phát sau commit cho tài khoản còn quyền **tại lúc phát** |
| Đọc | Prisma được, với điều kiện quyền đầy đủ tại thời điểm đọc |
| Lưu giữ | xoá tin `created_at <= now − 30 ngày` (job định kỳ) |
| Nhãn minh bạch | kênh chung **luôn** hiện dòng *"ℹ️ Người chơi cũng đọc và gửi được ở kênh này"*; tin người chơi gửi vào kênh chung có nhãn "(người chơi)" |

## 6. ĐẦU VÀO

EP05 (bảng chat), EP08 (segment khi vào phòng, `revokeWatch`), EP09 (đuổi), EP10 (gateway, màn phòng chơi), EP02 (thiết kế khung chat).

## 7. DANH SÁCH STORY

| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST13.1](../story/ST13.1-dich-vu-chat-2-kenh-gui-doc-lich-su-phan-quyen-theo-segment.md) | Dịch vụ chat 2 kênh: gửi, đọc lịch sử, phân quyền theo segment | 3 | 2 |
| [ST13.2](../story/ST13.2-lich-su-phan-trang-don-30-ngay-kiem-thu-hoi-end-to-end-giao.md) | Lịch sử/phân trang, dọn 30 ngày, kiểm thu hồi end-to-end, giao diện chat 2 khung | 3 | 3 |

```
TK13.1.1 ─┬─► TK13.2.1 (+TK09.2.1)
          └─► TK13.2.2 (+TK10.4.1)
```

## 8. TIÊU CHÍ HOÀN THÀNH EPIC

- [ ] 2 Story Done, mọi Task có báo cáo.
- [ ] Người xem không nhận / đọc / gửi được kênh riêng (kể cả giả mạo).
- [ ] Người chơi thay thế không đọc được tin cũ.
- [ ] Thu hồi end-to-end có đối chứng cho 3 chuyển chế độ + đổi mã xem + đuổi.

## 9. KỊCH BẢN DEMO (~10 phút)

1. A và B chat riêng; S1 (người xem) không thấy.
2. S1 chat kênh chung; A thấy nhãn người xem, S1 thấy nhãn "(người chơi)" cho tin của A.
3. A ẩn kênh chung ⇒ B vẫn thấy; A hiện lại thấy đủ tin.
4. Chủ phòng chuyển Khoá ⇒ S1 không nhận tin mới nữa.
