# FLOW-SPECTATOR — NGƯỜI XEM

**Yêu cầu:** [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md)

---

## 1. VÀO XEM

Xem đường vào ở [FLOW-JOIN-ROOM](FLOW-JOIN-ROOM.md). Sau khi vào:

```
Trở thành NGƯỜI XEM
    │
    ├─► nhận thế cờ hiện tại NGAY (kể cả đang giữa ván)
    ├─► nhận lịch sử kênh chat CHUNG (ROOM) của ván hiện tại
    ├─► nhận camera/mic của người chơi CHỌN chia sẻ cho người xem
    └─► cả phòng thấy "Người xem: n/5"
```

---

## 2. NGƯỜI XEM THẤY VÀ LÀM ĐƯỢC GÌ

```
┌─────────────────────────────────────────┐
│  BÀN CỜ (chỉ xem, thao tác vô hiệu)     │
│  đồng hồ · lượt · trạng thái treo ván   │
├─────────────────────────────────────────┤
│  💬 Trò chuyện CHUNG              │  ← nhãn ghi RÕ
│  người chơi và người xem đọc/gửi               │
├─────────────────────────────────────────┤
│  📹 Camera người chơi                   │
│  chỉ của người CHỌN chia sẻ cho người xem│
│  [🔊 âm lượng] [🔇 tắt tiếng]  ← chỉ máy mình│
├─────────────────────────────────────────┤
│  👥 Người xem (3/5)                     │
└─────────────────────────────────────────┘

❌ KHÔNG có: nút đi cờ · sẵn sàng · đầu hàng · xin hoà · xin đi lại
❌ KHÔNG thấy: kênh RIÊNG người chơi (kể cả lịch sử)
❌ KHÔNG có: nút bật camera/mic của mình
❌ KHÔNG có: nút "Vào chơi"
```

---

## 3. CÁC CÁCH MẤT QUYỀN XEM

```
                  ĐANG XEM
                     │
   ┌─────────┬───────┼────────┬──────────┐
   ▼         ▼       ▼        ▼          ▼
Tự rời   Đổi chế   Đổi mã  BỊ ĐUỔI⭐  Mất mạng
         độ kín    xem                 ≥ 15 giây
   │         │       │        │          │
   │      ┌──┴───────┴──┐     │          │
   │      │ TOÀN BỘ 5   │     │          │
   │      │ người xem   │     │          │
   │      │ bị đưa ra   │     │          │
   │      └─────────────┘     │          │
   │         │                │          │
   ▼         ▼                ▼          ▼
NGOÀI    NGOÀI PHÒNG     BỊ CHẶN     NGOÀI PHÒNG
PHÒNG    (vào lại được   KHỎI PHÒNG  (vào lại được
         nếu có mã mới)      │        nếu còn chỗ)
                             ▼
                    ❌ KHÔNG vào lại được
                       bằng BẤT KỲ đường nào
                       cho tới khi PHÒNG ĐÓNG
```

---

## 4. BỊ ĐUỔI ⭐

```
Người chơi A (hoặc B) mở danh sách người xem
    │
    ▼
┌─────────────────────────────┐
│ Người xem (3/5)             │
│ • minh_nguyen      [Đuổi]   │  ← nút CHỈ người chơi thấy
│ • lan_tran         [Đuổi]   │
│ • hoang99          [Đuổi]   │
└─────────────────────────────┘
    │
    ▼ bấm [Đuổi] ở hoang99
    │
    ▼
┌───────────────────────────────────────┐
│ Đuổi hoang99 khỏi phòng?              │
│ Người này sẽ KHÔNG vào lại được       │
│ phòng này.                            │
│          [Huỷ]  [Đuổi]                │
└───────────────────────────────────────┘
    │
    ▼ xác nhận
① xoá tư cách thành viên
② GHI VÀO DANH SÁCH CHẶN của phòng
③ ngắt khỏi bàn cờ + chat chung
④ thu hồi quyền nhận camera/mic
    │
    ├──► hoang99:        về sảnh + "Bạn đã bị đưa khỏi phòng"
    ├──► A, B:           "Người xem: 2/5"
    └──► người xem khác: số lượng cập nhật
```

**Ai đuổi được:** **cả hai** người chơi, không chỉ chủ phòng (`DEC-014`).
**Không đuổi được:** đối thủ (`BR-SPEC-13`).

### Sau khi bị đuổi

```
hoang99 thử vào lại:
   ├─ dùng mã xem cũ ────────────► ❌ "Bạn không thể vào phòng này"
   ├─ dùng link cũ ──────────────► ❌ cùng thông báo
   ├─ phòng chuyển Công khai ────► ❌ cùng thông báo
   └─ vào PHÒNG KHÁC ────────────► ✅ bình thường
```

**Danh sách chặn xoá khi phòng đóng** — chỉ trong phạm vi **một phòng**, không phải chặn toàn hệ thống (`DEC-015`).

---

## 5. THU HỒI HÀNG LOẠT

```
Chủ phòng đổi kín hơn: PUBLIC→CODE_ONLY/LOCKED, CODE_ONLY→LOCKED
hoặc đổi mã xem (không đổi privacy)
    │
    ▼
TOÀN BỘ 5 người xem bị đưa ra cùng lúc
    │
    ├─► mất bàn cờ · mất chat (cả LỊCH SỬ) · mất camera/mic
    ├─► mọi WATCH cũ (lời mời trực tiếp/mã/link) vô hiệu; PLAY giữ nguyên
    └─► kín hơn: ẩn sảnh; chỉ rotate: giữ quy tắc hiện sảnh
    │
    ▼
Đổi NGƯỢC lại thành Công khai
    └──► ⚠ người cũ KHÔNG tự quay lại — phải vào lại như người mới
```

**Khác với đuổi:** người bị thu hồi theo cách này **không** vào danh sách chặn.

---

## 6. QUA TÁI ĐẤU

```
Ván kết thúc ──► cả hai tái đấu ──► VÁN MỚI
                                       │
                    ├─ người xem ĐƯỢC GIỮ LẠI nếu còn quyền
                    ├─ kênh chat MỚI, TRỐNG
                    └─ camera/mic VỀ TẮT (phải bật lại)
```

---

## 7. MUỐN THÀNH NGƯỜI CHƠI

```
Thấy ghế chơi trống
    │
    ▼
❌ KHÔNG có nút "Vào chơi"
    │
    ▼
[Rời phòng] ──► dùng LỜI MỜI hoặc MÃ CHƠI để vào lại
```

---

## 8. NHÁNH LỖI

| Tình huống | Xử lý |
|---|---|
| Đã đủ 5 người xem | Người thứ 6: *"Phòng đã đủ người xem"* |
| Hai người cùng xin ghế cuối | **Đúng một** được nhận |
| Mất mạng 14 giây | Giữ ghế, quay lại **kiểm tra lại quyền** |
| Mất mạng 16 giây | Mất ghế |
| Quay lại mà phòng đã khoá | **Từ chối**, về sảnh |
| Người chơi đuổi **đối thủ** | **Từ chối** |
| Người xem cố đuổi ai đó | **Từ chối** |
| Hai người chơi cùng đuổi một người | Thực hiện **một lần** |
| Bị đuổi đúng lúc đang gửi chat | Tin bị từ chối; tin cũ vẫn còn với người khác |

## 9. ĐỀ NGHỊ VÀ XEM LẠI

Người xem nhận trạng thái đề nghị hoà/đi lại và kết quả, không có nút trả lời; giả mạo trả lời bị từ chối (BR-ACT-18). Sau ván, nút Xem lại mở replay trong phòng hiện tại theo BR-HIS-22. Tái đấu chuyển về ván mới; thu hồi/rời/đóng phòng dừng replay và về sảnh. Không chuyển sang lịch sử cá nhân để xem ván của người khác.

Mọi lỗi ở flow này áp dụng cổng quyền biết phòng tại FLOW-JOIN-ROOM §1/8; lời mời trực tiếp WATCH hợp lệ đủ vào CODE_ONLY, không vượt LOCKED. Ma trận đầy đủ 9 chuyển privacy và rotate tại BR-SPEC-20; mở lại không phục hồi vé cũ hoặc tự nhận người cũ.
