# EP09 · Người xem: vào xem, trần 5 người, thu hồi, đuổi

> **Loại:** Epic · **Story:** [ST09.1](../story/ST09.1-vao-xem-theo-che-do-tran-5-nguoi-giu-ghe-15-giay.md), [ST09.2](../story/ST09.2-thu-hoi-hang-loat-duoi-nguoi-xem-va-giao-dien-danh-sach-nguo.md)

| Trường Jira | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | `EP09 · Người xem: vào xem, trần 5 người, thu hồi, đuổi` |
| Components | Backend, Frontend, Tester |
| Priority | High |
| Labels | `xq-v2`, `ep09`, `security`, `race` |
| Fix versions | `v1.0.0` |
| Start date / Due date | 2026-10-13 / 2026-10-21 |
| Nguồn đặc tả | ISSUE-073 … ISSUE-077 (R04, R18) |

---

> ⏱ **Đọc lần đầu:** khoảng 10 phút. · Từ kỹ thuật lạ ⇒ [Từ điển kỹ thuật](../05-TU-DIEN-KY-THUAT.md) · Cách kiểm ⇒ [Sổ tay kiểm thử](../04-HUONG-DAN-KIEM-THU.md)

## 1. TÓM TẮT (đọc trong 1 phút)

**Người xem (SPECTATOR)**:
- Vào xem theo đúng chế độ phòng (PUBLIC / CODE_ONLY / LOCKED), tối đa **5** người.
- Vào là thấy ngay bàn cờ hiện tại; mất mạng được **giữ ghế 15 giây**.
- Người chơi **đuổi** được từng người xem (bị chặn vào lại phòng đó).

## 2. BỐI CẢNH — VÌ SAO EPIC NÀY TỒN TẠI

- EP08 đã có dịch vụ nhận người + thu hồi hàng loạt; EP09 hoàn thiện phía **người xem** và **đuổi**.
- Hai lỗi lần trước: `F-03` (mã phòng bỏ qua kiểm riêng tư), `F-07` (thu hồi là code chết).

## 3. KHÁI NIỆM CẦN HIỂU

| Khái niệm | Giải thích |
|---|---|
| **SPECTATOR** | **Vai trò** người xem. Vào bằng quyền `WATCH` ⇒ trở thành SPECTATOR |
| **Bằng chứng được biết phòng** | Không có ⇒ `404` chung giống hệt cho mọi trường hợp |
| **Giữ ghế 15 giây** | Socket cuối đóng ⇒ hạn `now + 15s`; nối lại phải kiểm lại quyền |
| **`room_blocks`** | Danh sách chặn **của một phòng**; xoá khi phòng đóng |
| **`assertCanReadRoom`** | Hàm kiểm quyền dùng ở **mọi** đường đọc của người xem |

Tra thêm: [IDOR](../05-TU-DIEN-KY-THUAT.md#idor) · [Snapshot](../05-TU-DIEN-KY-THUAT.md#snapshot) · [Đồng hồ tiêm vào](../05-TU-DIEN-KY-THUAT.md#clock) · [Race](../05-TU-DIEN-KY-THUAT.md#race)

## 4. PHẠM VI

**✅ LÀM:** luồng vào xem theo chế độ; snapshot khi vào; giữ ghế 15 giây; đuổi + chặn; kiểm quyền mọi đường đọc; giao diện danh sách người xem.

**❌ KHÔNG LÀM**
| Việc | Ở đâu |
|---|---|
| Thu hồi hàng loạt khi đổi chế độ | EP08 (TK08.3.2) — EP09 chỉ dùng lại |
| Kênh chat chung | EP13 |
| Camera/mic của người chơi cho người xem | EP14 |

## 5. LUẬT BẮT BUỘC CHO MỌI TASK

| Luật | Nghĩa |
|---|---|
| Vào xem theo chế độ | PUBLIC: vào thẳng khi WAITING/PLAYING. CODE_ONLY: cần lời mời/mã/link **WATCH** hợp lệ. LOCKED: **không ai** vào xem; mời **chơi** vẫn dùng được |
| Phòng FINISHED | Không hiện ở sảnh; vào xem được bằng quyền WATCH hợp lệ |
| Thứ tự kiểm | đăng nhập + username + **email đã xác minh** → đang ở phòng khác? → bằng chứng (không có ⇒ lỗi chung) → phòng mở + không bị chặn → đúng chế độ → còn ghế |
| Người xem thấy gì | Bàn cờ realtime, **kênh chung** (kể cả tin trước lúc vào), camera/mic người chơi nếu họ chọn "Đối thủ và người xem". **Không** thấy kênh riêng người chơi |
| Đuổi | Chỉ **người chơi** (cả hai); không đuổi được người chơi; người bị đuổi vào `room_blocks` của phòng đó, xoá khi phòng đóng; vẫn vào phòng khác bình thường |
| Thu hồi hàng loạt | Chỉ dùng `revokeWatch` (TK08.3.2); người bị thu hồi **không** vào `room_blocks` |

## 6. ĐẦU VÀO

EP08 (JoinService, mã/link/lời mời, `revokeWatch`), EP10 TK10.2.2 (presence/heartbeat), EP03 (`MatchSnapshot`), EP02 (thiết kế).

## 7. DANH SÁCH STORY

| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST09.1](../story/ST09.1-vao-xem-theo-che-do-tran-5-nguoi-giu-ghe-15-giay.md) | Vào xem theo chế độ, trần 5 người, giữ ghế 15 giây | 4 | 2 |
| [ST09.2](../story/ST09.2-thu-hoi-hang-loat-duoi-nguoi-xem-va-giao-dien-danh-sach-nguo.md) | Thu hồi hàng loạt, đuổi người xem và giao diện danh sách người xem | 3 | 3 |

```
TK09.1.1 ─┬─► TK09.1.2 (QA, + TK08.4.2)
          └─► TK09.2.1 (+ TK08.3.2) ─► TK09.2.2
```

## 8. TIÊU CHÍ HOÀN THÀNH EPIC

- [ ] 2 Story Done; TK09.1.2 PASS 18/18.
- [ ] Không đường vào nào bỏ qua kiểm chế độ (F-03).
- [ ] Người bị đuổi / thu hồi bị từ chối ở mọi đường đọc (F-07).

## 9. KỊCH BẢN DEMO (~10 phút)

1. S1 vào xem phòng PUBLIC đang chơi ⇒ thấy ngay thế cờ hiện tại.
2. Chủ phòng chuyển CODE_ONLY ⇒ S1 bị đưa ra; S1 dùng mã phòng **khác** ⇒ không vào được.
3. B (không phải chủ) đuổi S2 ⇒ S2 thấy "Bạn đã bị đưa khỏi phòng"; dùng mã cũ ⇒ bị chặn.
4. S3 tắt mạng 10 giây rồi bật lại ⇒ vẫn là người xem.
