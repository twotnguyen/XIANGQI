# EP10 · Bàn cờ giao diện & ván online thời gian thực

> **Loại:** Epic · **Story:** [ST10.1](../story/ST10.1-ban-co-svg-ve-quan-chon-dich-lat-ban-phim-chuyen-dong.md), [ST10.2](../story/ST10.2-gateway-realtime-presence-heartbeat-duong-xu-ly-lenh-bien-la.md), [ST10.3](../story/ST10.3-di-nuoc-cay-nuoc-di-ham-ket-thuc-van-snapshot-dong-bo.md), [ST10.4](../story/ST10.4-man-phong-choi-realtime-8-phien-hien-thi-dong-ho.md)

| Trường Jira | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | `EP10 · Bàn cờ giao diện & ván online thời gian thực` |
| Components | Frontend, Backend, Tester |
| Priority | Highest |
| Labels | `xq-v2`, `ep10`, `critical-path`, `race` |
| Fix versions | `v0.3.0` |
| Start date / Due date | 2026-10-01 / 2026-10-15 |
| Nguồn đặc tả | ISSUE-078 … ISSUE-091, ISSUE-095 (R05, R06, R07) |

---

> ⏱ **Đọc lần đầu:** khoảng 10 phút. · Từ kỹ thuật lạ ⇒ [Từ điển kỹ thuật](../05-TU-DIEN-KY-THUAT.md) · Cách kiểm ⇒ [Sổ tay kiểm thử](../04-HUONG-DAN-KIEM-THU.md)

## 1. TÓM TẮT (đọc trong 1 phút)

**Ván cờ online realtime** — trái tim của sản phẩm:
- Bàn cờ SVG (chạm, bàn phím, lật bàn cho bên ĐEN).
- Máy chủ realtime (Socket.IO) có xác thực + presence.
- **Khung xử lý lệnh 11 bước** dùng cho mọi lệnh ván; lệnh đi nước; cây nước đi; hàm kết thúc ván duy nhất; snapshot.
- Màn phòng chơi cho 2 người chơi + 5 người xem.

## 2. BỐI CẢNH — VÌ SAO EPIC NÀY TỒN TẠI

- Nhiều lỗi lần trước nằm ở đây: `F-01` (500 sau đi lại), `F-02` (hoà sai), `F-06` (không realtime), toạ độ bị đảo.
- EP11 (đồng hồ, mất kết nối, treo ván), EP12 (đầu hàng, đề nghị, tái đấu), EP15 (chơi với máy) dựng **trên** khung lệnh của EP10.

## 3. KHÁI NIỆM CẦN HIỂU

| Khái niệm | Giải thích |
|---|---|
| **Khung 11 bước** | Thứ tự bắt buộc cho mọi lệnh ván — xem §5 |
| **Biên lai lệnh** | `(match_id, actor_id, command_id)` — gửi lại cùng lệnh ⇒ 1 kết quả |
| **Cây nước đi** | Mỗi nước trỏ nước cha; `head_move_id` = cuối nhánh hiệu lực |
| **Finalizer** | Hàm duy nhất kết thúc ván, 11 nguyên nhân |
| **Snapshot** | Ảnh chụp trạng thái để vẽ lại; đọc không ghi DB |
| **Lật bàn** | Chỉ hiển thị; toạ độ gửi lên luôn là toạ độ logic (`GR-COORD-01`) |

Tra thêm: [Pipeline](../05-TU-DIEN-KY-THUAT.md#pipeline) · [Idempotency](../05-TU-DIEN-KY-THUAT.md#idempotency) · [Version](../05-TU-DIEN-KY-THUAT.md#version) · [Khoá dòng](../05-TU-DIEN-KY-THUAT.md#khoa-dong) · [Socket.IO](../05-TU-DIEN-KY-THUAT.md#socket) · [Snapshot](../05-TU-DIEN-KY-THUAT.md#snapshot) · [CTE](../05-TU-DIEN-KY-THUAT.md#cte)

## 4. PHẠM VI

**✅ LÀM:** bàn cờ; gateway + presence; khung lệnh + biên lai; đi nước + cây; finalizer; snapshot; màn phòng chơi + hiển thị đồng hồ.

**❌ KHÔNG LÀM**
| Việc | Ở đâu |
|---|---|
| Tính đồng hồ, hết giờ, mất kết nối 60 giây, treo ván | EP11 |
| Đầu hàng, xin hoà, đi lại, tái đấu, lịch sử | EP12 |
| Chat | EP13 |
| Camera/mic | EP14 |
| Chơi với máy | EP15 |

## 5. LUẬT BẮT BUỘC CHO MỌI TASK

| Luật | Nghĩa |
|---|---|
| Khung 11 bước | **Mọi** lệnh ván (đi nước, đầu hàng, đề nghị, đi lại, xác nhận còn trong ván) chạy đúng thứ tự dưới bảng |
| SQL thuần | Toàn bộ đường lệnh ván (không Prisma). Thứ tự khoá **phòng → người → ván** |
| Không giữ khoá khi gọi ra ngoài | AI, LiveKit, email — dùng `afterCommit` (`ARCH-07`) |
| Một service cho 2 cổng | HTTP và socket gọi **cùng** service |
| Đồng hồ tiêm vào | `Clock` provider ở mọi chỗ tính thời gian; test không `sleep` |
| Finalizer duy nhất | Chỉ `finalizer.ts` được ghi trạng thái kết thúc (test grep) |

**⭐ Khung xử lý lệnh ván — 11 bước:**
```
① xác thực danh tính (JWT + phiên còn hiệu lực)
② đọc match.room_id (bất biến) để biết khoá phòng nào
③ BEGIN
④ ONLINE: SELECT rooms ... FOR UPDATE → SELECT matches ... FOR UPDATE      AI: chỉ SELECT matches ... FOR UPDATE
⑤ tra command_receipts (match_id, actor_id, command_id): đã có ⇒ cùng hash trả kết quả cũ / khác hash ⇒ COMMAND_ID_REUSED
⑥ ván ACTIVE + expectedVersion khớp version (sai ⇒ VERSION_CONFLICT)
⑦ TÍNH LẠI ĐỒNG HỒ — hết giờ ⇒ kết thúc ván TIMEOUT, TỪ CHỐI lệnh      ← trước bước ⑧
⑧ kiểm lượt · vai trò · luật cờ (validateMove từ @xiangqi/game-rules — không tin client)
⑨ áp dụng · version++ · ghi sự kiện
⑩ ghi biên lai (chỉ khi lệnh thành công — lệnh bị từ chối vì sai luật/lượt KHÔNG ghi biên lai)
⑪ COMMIT → rồi MỚI phát tin (lỗi phát tin không huỷ dữ liệu đã lưu)
```

## 6. ĐẦU VÀO

EP03 (luật cờ, kiểu dữ liệu), EP05 (bảng ván, biên lai), EP06 (xác thực), EP08 (phòng, sẵn sàng), EP09 (quyền người xem), EP02 (thiết kế bàn cờ, phòng chơi).

## 7. DANH SÁCH STORY

| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST10.1](../story/ST10.1-ban-co-svg-ve-quan-chon-dich-lat-ban-phim-chuyen-dong.md) | Bàn cờ SVG: vẽ, quân, chọn/đích, lật, bàn phím, chuyển động | 2 | 5 |
| [ST10.2](../story/ST10.2-gateway-realtime-presence-heartbeat-duong-xu-ly-lenh-bien-la.md) | Gateway realtime, presence/heartbeat, đường xử lý lệnh + biên lai | 3 | 5 |
| [ST10.3](../story/ST10.3-di-nuoc-cay-nuoc-di-ham-ket-thuc-van-snapshot-dong-bo.md) | Đi nước, cây nước đi, hàm kết thúc ván, snapshot đồng bộ | 3 | 5 |
| [ST10.4](../story/ST10.4-man-phong-choi-realtime-8-phien-hien-thi-dong-ho.md) | Màn phòng chơi realtime (8 phiên) + hiển thị đồng hồ | 3 | 3 |

```
TK10.1.1 ─► TK10.1.2 ─► TK10.1.3 ──────────────────────────────┐
TK10.2.1 ─┬─► TK10.2.2                                          ├─► TK10.4.1 ─► TK10.4.2 (+TK11.1.1)
          ├─► TK10.2.3 ═(Done)═► TK10.3.1 ─► TK10.3.2 ═(Done)═► TK10.3.3 ─┘
          └─► TK10.2.4 (QA)
```

## 8. TIÊU CHÍ HOÀN THÀNH EPIC

- [ ] 4 Story Done; TK10.2.4 PASS 13/13.
- [ ] 8 phiên thấy cùng nước đi realtime.
- [ ] Lật bàn không đổi toạ độ gửi đi; đi lại rồi đi nước mới không lỗi; lặp chỉ tính nhánh hiệu lực.
- [ ] Chỉ `finalizer.ts` ghi trạng thái kết thúc.

## 9. KỊCH BẢN DEMO (~10 phút)

1. A, B và 5 người xem mở phòng; A đi Pháo đầu ⇒ tất cả thấy ngay.
2. B (cầm đen) thấy bàn lật; đi Pháo đen ⇒ vị trí đúng trên màn A.
3. Terminal: gửi nước Xe xuyên quân ⇒ `INVALID_MOVE`, bàn không đổi.
4. Terminal: gửi cùng lệnh 3 lần ⇒ 1 kết quả.
5. B tắt mạng 10 giây ⇒ lớp phủ kết nối lại ⇒ đồng bộ đúng.
