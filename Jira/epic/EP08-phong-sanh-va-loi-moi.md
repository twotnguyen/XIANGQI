# EP08 · Phòng, sảnh và lời mời

> **Loại:** Epic · **Story:** [ST08.1](../story/ST08.1-tao-phong-va-nhan-nguoi-vao-phong-khong-vuot-tran.md), [ST08.2](../story/ST08.2-sanh-san-sang-bat-dau-van-doi-ben-va-giao-dien-phong-cho.md), [ST08.3](../story/ST08.3-roi-dong-phong-doi-cai-dat-va-thu-hoi-nguoi-xem.md), [ST08.4](../story/ST08.4-ma-phong-link-moi-moi-truc-tiep-hop-thu-loi-moi.md)

| Trường Jira | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | `EP08 · Phòng, sảnh và lời mời` |
| Components | Backend, Frontend, Tester |
| Priority | High |
| Labels | `xq-v2`, `ep08`, `race`, `security` |
| Fix versions | `v1.0.0` |
| Start date / Due date | 2026-10-08 / 2026-10-21 |
| Nguồn đặc tả | ISSUE-061 … ISSUE-072 (R03, R04, R19) |

---

> ⏱ **Đọc lần đầu:** khoảng 10 phút. · Từ kỹ thuật lạ ⇒ [Từ điển kỹ thuật](../05-TU-DIEN-KY-THUAT.md) · Cách kiểm ⇒ [Sổ tay kiểm thử](../04-HUONG-DAN-KIEM-THU.md)

## 1. TÓM TẮT (đọc trong 1 phút)

Toàn bộ **phòng chơi online**:
- Tạo phòng, vào phòng (ghế chơi / ghế xem), **không bao giờ vượt trần** 2 + 5.
- Sảnh phòng công khai; sẵn sàng → bắt đầu ván; đổi bên trước ván.
- Rời / đóng phòng; đổi cài đặt; thu hồi người xem khi phòng kín hơn.
- Mời bằng mã, link, mời trực tiếp; hộp thư lời mời.

## 2. BỐI CẢNH — VÌ SAO EPIC NÀY TỒN TẠI

- Đây là Epic có nhiều **tranh chấp** và **rủi ro lộ thông tin** nhất. Lần trước hỏng ở `F-03` (vào bằng mã bỏ qua kiểm riêng tư), `F-07` (thu hồi người xem là code chết), `F-19` (lỗi DB thô khi sẵn sàng).
- EP09 (người xem), EP10 (ván), EP13 (chat), EP14 (camera) đều dựa trên phòng.

## 3. KHÁI NIỆM CẦN HIỂU

| Khái niệm | Giải thích |
|---|---|
| **PLAYER / SPECTATOR** | **Vai trò** trong phòng: người chơi (tối đa 2) / người xem (tối đa 5) |
| **PLAY / WATCH** | **Loại quyền** của mã/link/lời mời. Dùng WATCH ⇒ trở thành SPECTATOR. ⛔ Không viết "vé SPECTATOR" |
| **Bằng chứng được biết phòng** | Thành viên / grant hợp lệ / phòng PUBLIC khi xem. Không có ⇒ 404 chung |
| **`watch_epoch`** | Thế hệ quyền xem; thu hồi ⇒ +1 ⇒ quyền xem cũ vô hiệu |
| **`config_revision` / `ready_revision`** | Phiên bản cấu hình / sẵn sàng; lệch ⇒ `STALE_*` |

Tra thêm: [Khoá dòng](../05-TU-DIEN-KY-THUAT.md#khoa-dong) · [Thứ tự khoá](../05-TU-DIEN-KY-THUAT.md#deadlock) · [Race](../05-TU-DIEN-KY-THUAT.md#race) · [Barrier](../05-TU-DIEN-KY-THUAT.md#barrier) · [IDOR](../05-TU-DIEN-KY-THUAT.md#idor) · [Version](../05-TU-DIEN-KY-THUAT.md#version)

## 4. PHẠM VI

**✅ LÀM:** tạo/vào/rời/đóng phòng; sảnh; sẵn sàng/bắt đầu; đổi bên; đổi cài đặt + thu hồi người xem; mã, link, mời trực tiếp, hộp thư; giao diện tương ứng.

**❌ KHÔNG LÀM**
| Việc | Ở đâu |
|---|---|
| Đuổi người xem có chặn, danh sách người xem chi tiết | EP09 |
| Đi quân, đồng hồ, kết thúc ván | EP10, EP11 |
| Tái đấu, tự đóng phòng sau 10 phút | EP12 (TK12.3.1) |
| Chat | EP13 |
| Thực thi thu hồi camera (`media_jobs`) | EP14 |

## 5. LUẬT BẮT BUỘC CHO MỌI TASK

| Luật | Nghĩa |
|---|---|
| Sức chứa | 2 PLAYER + tối đa 5 SPECTATOR = 7. Đếm **trong** khoá phòng |
| Một tài khoản một phòng | Đang ở phòng khác ⇒ `ALREADY_IN_ROOM`; đang có ván với máy ⇒ `CONFLICT` |
| Chủ phòng | Người tạo, cầm ĐỎ mặc định; **không** chuyển quyền chủ; không đuổi được đối thủ |
| 3 chế độ | `PUBLIC` (hiện ở sảnh khi Chờ/Đang chơi; ai cũng xem) · `CODE_ONLY` (xem bằng mã/link/lời mời WATCH; không hiện sảnh) · `LOCKED` (không ai xem; ghế chơi trống vẫn mời được) |
| Loại quyền | `PLAY` dùng một lần · `WATCH` mã/link dùng nhiều lần trong 24 giờ; mời trực tiếp dùng một lần, hạn 10 phút |
| Nhận người chơi mới | Chỉ khi `WAITING`; `PLAYING`/`FINISHED` ⇒ `ROOM_NOT_WAITING` |
| Lỗi khi chưa có bằng chứng | Mọi trường hợp ⇒ **cùng** `404 ROOM_ACCESS_UNAVAILABLE` *"Không thể vào phòng. Kiểm tra mã hoặc lời mời."* — không id/tên/trạng thái/số người |
| Lỗi khi đã có bằng chứng | Bị chặn `403 BLOCKED_FROM_ROOM`; LOCKED/intent sai loại quyền `403 ACCESS_DENIED`; đầy `409 ROOM_FULL`; PLAY khi không chờ `409 ROOM_NOT_WAITING` |
| Thứ tự khoá | **phòng → người (theo id) → ván** |
| SQL thuần | Tạo phòng, nhận người, sẵn sàng/bắt đầu, rời, đổi cài đặt/thu hồi, tiêu thụ lời mời. Prisma chỉ cho sảnh (đọc) và phát hành lời mời |
| Kín hơn | PUBLIC→CODE_ONLY, PUBLIC→LOCKED, CODE_ONLY→LOCKED, đổi mã xem: `watch_epoch + 1`, thu hồi mọi WATCH cũ, đưa **toàn bộ** người xem ra, ghi job thu hồi media — cùng transaction. Không vào danh sách chặn. Mở lại công khai **không** tự nhận lại người cũ |
| Mã / token | DB chỉ lưu HMAC; không có trong dữ liệu phòng, sự kiện chung, log |

## 6. ĐẦU VÀO

EP05 (bảng phòng, lời mời, ván), EP06 (guard), EP07 (bạn bè — cho mời trực tiếp), EP10 TK10.2.1–10.2.2 (gateway, presence), EP10 TK10.3.2 (finalizer — cho rời khi đang chơi), EP02 (thiết kế).

## 7. DANH SÁCH STORY

| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST08.1](../story/ST08.1-tao-phong-va-nhan-nguoi-vao-phong-khong-vuot-tran.md) | Tạo phòng và nhận người vào phòng không vượt trần | 2 | 5 |
| [ST08.2](../story/ST08.2-sanh-san-sang-bat-dau-van-doi-ben-va-giao-dien-phong-cho.md) | Sảnh, sẵn sàng/bắt đầu ván, đổi bên và giao diện phòng chờ | 3 | 8 |
| [ST08.3](../story/ST08.3-roi-dong-phong-doi-cai-dat-va-thu-hoi-nguoi-xem.md) | Rời/đóng phòng, đổi cài đặt và thu hồi người xem | 3 | 8 |
| [ST08.4](../story/ST08.4-ma-phong-link-moi-moi-truc-tiep-hop-thu-loi-moi.md) | Mã phòng, link mời, mời trực tiếp, hộp thư lời mời | 4 | 8 |

```
TK08.1.1 ─► TK08.1.2 ─┬─► TK08.2.2 (+TK10.2.2) ─┬─► TK08.3.1 (+TK10.3.2 Done)
    └─► TK08.2.1 (+TK10.2.1) ─┴─► TK08.2.3         └─► TK08.3.2 ─┬─► TK08.3.3
                                                                  └─► TK08.4.1 ─► TK08.4.2 ─► TK08.4.3
```

## 8. TIÊU CHÍ HOÀN THÀNH EPIC

- [ ] 4 Story Done, mọi Sub-task có báo cáo.
- [ ] Không lần race nào vượt 2 PLAYER / 5 SPECTATOR (truy vấn tổng kết = 0 dòng).
- [ ] 4 tình huống 404 cho người chưa có bằng chứng giống hệt nhau.
- [ ] Chuyển kín hơn thu hồi toàn bộ người xem; mã/token không xuất hiện trong dữ liệu phòng, sự kiện, log.

## 9. KỊCH BẢN DEMO (~10 phút)

1. A tạo phòng Công khai ⇒ B thấy ở sảnh ngay.
2. A mời B bằng mã đọc to; S1 vào xem bằng link (đang chưa đăng nhập ⇒ đăng nhập xong tự vào).
3. A, B bấm Sẵn sàng ⇒ ván bắt đầu.
4. Terminal: 2 người tranh ghế xem thứ 5 cùng lúc ⇒ đúng 1 vào được.
5. A chuyển phòng sang Khoá ⇒ S1 bị đưa về sảnh với thông báo.
