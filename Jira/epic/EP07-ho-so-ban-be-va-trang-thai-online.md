# EP07 · Hồ sơ, bạn bè và trạng thái online

> **Loại:** Epic · **Story:** [ST07.1](../story/ST07.1-ho-so-tim-nguoi-dung-ket-ban.md), [ST07.2](../story/ST07.2-trang-thai-online-va-trang-ban-be.md)

| Trường Jira | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | `EP07 · Hồ sơ, bạn bè và trạng thái online` |
| Components | Backend, Frontend, Tester |
| Priority | High |
| Labels | `xq-v2`, `ep07` |
| Fix versions | `v0.3.0` |
| Start date / Due date | 2026-10-12 / 2026-10-14 |
| Nguồn đặc tả | ISSUE-056 … ISSUE-060 (R02) |

---

> ⏱ **Đọc lần đầu:** khoảng 10 phút. · Từ kỹ thuật lạ ⇒ [Từ điển kỹ thuật](../05-TU-DIEN-KY-THUAT.md) · Cách kiểm ⇒ [Sổ tay kiểm thử](../04-HUONG-DAN-KIEM-THU.md)

## 1. TÓM TẮT (đọc trong 1 phút)

- Sửa **tên hiển thị** (username bất biến).
- **Tìm** người khác theo username; gửi / nhận / từ chối / huỷ **lời mời kết bạn**.
- Thấy bạn bè **đang online** hay **ngoại tuyến**.

Kết bạn **chỉ để mời chơi** — **không** có nhắn tin riêng ngoài phòng.

## 2. BỐI CẢNH — VÌ SAO EPIC NÀY TỒN TẠI

- EP08 (mời trực tiếp bạn bè vào phòng) cần danh sách bạn + trạng thái online.
- Đây là nơi dễ **lộ thông tin**: email, phòng đang ở, danh sách toàn bộ người dùng. Mọi Task đều có ca kiểm riêng tư.

## 3. KHÁI NIỆM CẦN HIỂU

| Khái niệm | Giải thích |
|---|---|
| **Quan hệ bạn bè** | 1 hàng / 1 cặp (`user_a < user_b`), trạng thái `PENDING` → `ACCEPTED`; `requested_by` = người gửi |
| **Kiểm actor** | Máy chủ kiểm người gọi có đúng vai (người nhận / người gửi / người trong cặp) — không dựa vào nút bị ẩn |
| **Presence** | Online khi còn ≥ 1 kết nối socket; ngoại tuyến khi kết nối cuối đóng hoặc im lặng 30 giây |
| **Riêng tư presence** | Sự kiện chỉ có `userId`, `online` — không phòng, không đối thủ |

Tra thêm: [IDOR](../05-TU-DIEN-KY-THUAT.md#idor) · [Socket.IO](../05-TU-DIEN-KY-THUAT.md#socket) · [Race](../05-TU-DIEN-KY-THUAT.md#race) · [Đồng hồ tiêm vào](../05-TU-DIEN-KY-THUAT.md#clock)

## 4. PHẠM VI

**✅ LÀM:** API hồ sơ, tìm kiếm, kết bạn; màn `/settings`; presence bạn bè; trang `/friends`.

**❌ KHÔNG LÀM**
| Việc | Ở đâu |
|---|---|
| Mời bạn vào phòng, hộp thư lời mời | EP08 (ST08.4) |
| Gateway Socket.IO, heartbeat | EP10 (TK10.2.1) |
| Nhắn tin riêng, chặn người dùng | **Không có** trong sản phẩm |
| Đổi username / email, xoá tài khoản | **Không có** trong sản phẩm |

## 5. LUẬT BẮT BUỘC CHO MỌI TASK

| Luật | Nghĩa |
|---|---|
| Dùng **Prisma** | Không có thao tác cần khoá dòng / đếm-rồi-ghi trong Epic này (`TECH-07`) |
| **Không bao giờ trả email** | Ở mọi API, kể cả `/me` |
| Presence không lộ phòng | Chỉ `userId`, `online` |
| Một cặp một quan hệ | DB đã ép `user_a < user_b` + UNIQUE; code dùng `ON CONFLICT DO NOTHING` |
| Kiểm actor ở máy chủ | Test gửi thẳng API bằng tài khoản sai vai (`qa friend-respond C yes`) |

## 6. ĐẦU VÀO

EP06 (guard, `/me`, phiên), EP05 (`profiles`, `friendships`, harness), EP10 TK10.2.1 (gateway — chỉ cho ST07.2), EP02 (thiết kế).

## 7. DANH SÁCH STORY

| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST07.1](../story/ST07.1-ho-so-tim-nguoi-dung-ket-ban.md) | Hồ sơ, tìm người dùng, kết bạn | 3 | 5 |
| [ST07.2](../story/ST07.2-trang-thai-online-va-trang-ban-be.md) | Trạng thái online và trang bạn bè | 3 | 5 |

```
TK06.1.1 ═(Done)═► TK07.1.1 ─┬─► TK07.1.2
                             └─► TK07.2.1 (+ TK10.2.1) ─► TK07.2.2
```

## 8. TIÊU CHÍ HOÀN THÀNH EPIC

- [ ] 2 Story Done, mọi Task có báo cáo.
- [ ] Không API nào trong Epic trả email (quét response bằng `grep`).
- [ ] Kiểm actor bằng gọi thẳng API đạt cho cả 3 endpoint lời mời.
- [ ] Presence không lộ phòng (kiểm lại khi EP08 xong).

## 9. KỊCH BẢN DEMO (~10 phút)

1. A đổi tên hiển thị có dấu ⇒ thanh điều hướng đổi ngay.
2. A tìm `tes` ⇒ thấy B ⇒ Kết bạn ⇒ B thấy lời mời không F5 ⇒ Chấp nhận.
3. B đóng trình duyệt ⇒ A thấy B *Ngoại tuyến* trong ≤ 30 giây.
4. Terminal: `qa friend-respond C yes` ⇒ 403 (người ngoài không trả lời thay được).
