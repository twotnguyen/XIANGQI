# FLOW-MATCH — VÁN ONLINE

**Yêu cầu:** [REQ-MATCH](../01-requirements/REQ-MATCH.md) · [REQ-BOARD](../01-requirements/REQ-BOARD.md) · [REQ-GAME-ACTIONS](../01-requirements/REQ-GAME-ACTIONS.md)

---

## 1. TOÀN CẢNH MỘT VÁN

```
Cả hai sẵn sàng ──► VÁN BẮT ĐẦU (ĐỎ đi trước)
                          │
                          ▼
         ┌────────────────────────────────┐
         │      VÒNG LẶP MỖI LƯỢT         │
         │                                │
         │  đến lượt ──► chọn quân        │
         │      │         │               │
         │      │         ▼               │
         │      │     chọn đích           │
         │      │         │               │
         │      │         ▼               │
         │      │   máy chủ phân xử       │
         │      │      ┌──┴──┐            │
         │      │  từ chối  chấp nhận     │
         │      │      │       │          │
         │      │  hoàn lại    ▼          │
         │      │      │  đổi lượt        │
         │      └──────┴───────┘          │
         └────────────────────────────────┘
                          │
                          ▼  (một trong các điều kiện kết thúc)
                    VÁN KẾT THÚC
```

---

## 2. TÁM ĐƯỜNG KẾT THÚC VÁN

```
                    VÁN ĐANG CHƠI
                          │
    ┌─────────┬───────────┼───────────┬──────────┐
    ▼         ▼           ▼           ▼          ▼
 LUẬT CỜ   NGƯỜI CHƠI  ĐỒNG HỒ   TREO VÁN ⭐  HỆ THỐNG
    │         │           │           │          │
    ├ chiếu   ├ đầu hàng  └ hết giờ   └ hết 30s  ├ cả hai mất mạng
    │  hết    ├ đồng ý       │           │       ├ máy chủ khởi động lại
    ├ hết     │  hoà         │           │       └ máy lỗi
    │  nước   └ (xem         │           │          │
    └ lặp 3     FLOW-        │           │          │
       lần     INACTIVITY)   │           │          │
    │         │              │           │          │
    ▼         ▼              ▼           ▼          ▼
 ┌────────────────────────────────────┐  ┌──────────────┐
 │           KẾT THÚC                 │  │  GIÁN ĐOẠN   │
 │        (có người thắng             │  │ (KHÔNG AI    │
 │         hoặc hoà)                  │  │   THẮNG)     │
 └────────────────────────────────────┘  └──────────────┘
```

---

## 3. MỘT LƯỢT ĐI CHI TIẾT

```
"Đến lượt bạn"
    │
    ├─ bấm quân ĐỐI THỦ ──► không chọn được (im lặng)
    ├─ bấm ô TRỐNG ───────► không làm gì
    │
    ▼ bấm quân CỦA MÌNH
QUÂN ĐƯỢC CHỌN + hiện các ĐÍCH HỢP LỆ
    │
    ├─ bấm lại quân đó / bấm ra ngoài / Esc ──► bỏ chọn
    ├─ bấm quân khác của mình ────────────────► đổi sang quân đó
    ├─ bấm đích KHÔNG hợp lệ ─────────────────► không đi, giữ lựa chọn
    │
    ▼ bấm đích HỢP LỆ
"Đang gửi…"  (CHƯA coi là đã đi)
    │
    ▼
Máy chủ phân xử
    ├─ hết giờ ──────────► VÁN KẾT THÚC do hết giờ (nước đi bị từ chối)
    ├─ sai lượt ─────────► từ chối
    ├─ sai luật ─────────► từ chối
    ├─ phiên bản cũ ─────► lỗi xung đột + trạng thái mới ──► vẽ lại
    │
    ▼ (chấp nhận)
Bàn cập nhật ở CẢ 3 PHÍA (bạn, đối thủ, người xem)
    │
    ├─ nước này kết thúc ván? ──CÓ──► MÀN KẾT QUẢ
    │
    ▼ KHÔNG
Đổi lượt · đồng hồ chuyển bên · mốc treo ván reset
```

---

## 4. THAO TÁC TRONG LÚC CHƠI

```
┌─────────────────────────────────────────────┐
│  [Đầu hàng]  [Xin hoà]  [Xin đi lại]        │
└─────────────────────────────────────────────┘
       │            │              │
       ▼            ▼              ▼
  XÁC NHẬN     tạo đề nghị    tạo đề nghị
  "bạn sẽ      (30 giây)      (30 giây)
   THUA"            │              │
       │            │   ⚠ VÔ HIỆU nếu chưa đi nước nào
       │            │              │
       ▼            ▼              ▼
  VÁN KẾT     ┌──────────────────────────┐
  THÚC ngay   │  Đối thủ: [Từ chối][Đồng ý]│
              └──────────────────────────┘
                   │              │
         ┌─────────┴───┐     ┌────┴─────────┐
         ▼             ▼     ▼              ▼
     từ chối       hết hạn  đồng ý HOÀ  đồng ý ĐI LẠI
         │             │        │              │
         ▼             ▼        ▼              ▼
    ván tiếp tục          VÁN HOÀ     bàn LÙI 1 hoặc 2 nửa nước
                                       ⚠ KHÔNG hoàn thời gian
                                       ván tiếp tục
```

**Quy tắc quan trọng:**
- Mỗi ván chỉ **một** đề nghị đang chờ.
- Một **nước đi mới** làm đề nghị **mất hiệu lực**.
- **Không tự chấp nhận** đề nghị của chính mình.
- Đồng hồ **vẫn chạy** suốt lúc chờ.

---

## 5. MÀN KẾT QUẢ

```
┌────────────────────────────────────┐
│        🏆 Bạn thắng!               │
│        Chiếu hết                   │   ← ghi RÕ nguyên nhân
│                                    │
│  Phòng đóng sau 08:42              │
│                                    │
│  [ Xem lại ]  [ Tái đấu ]          │
│  [ Rời phòng ]                     │
└────────────────────────────────────┘
```

| Kết cục | Hiển thị |
|---|---|
| Thắng | 🏆 Bạn thắng + nguyên nhân |
| Thua | Bạn thua + nguyên nhân |
| Hoà | Hoà + nguyên nhân (lặp 3 lần / đồng ý hoà) |
| **Gián đoạn** | *"Ván bị gián đoạn — không có người thắng"* |

---

## 6. NGƯỜI XEM THẤY GÌ

| Thời điểm | Người xem thấy |
|---|---|
| Nước đi | Bàn cập nhật **cùng lúc** với người chơi |
| Đề nghị hoà/đi lại | Thấy đề nghị và kết quả, **không** trả lời được |
| Trạng thái treo ván | **Thấy** cả đếm ngược (`DEC-013`) |
| Mất kết nối | Thấy đếm ngược 60 giây |
| Kết quả | Thấy màn kết quả, **không** có nút Tái đấu |

---

## 7. NHÁNH LỖI

| Lỗi | Xử lý |
|---|---|
| Nước đi bị từ chối | **Hoàn lại** bàn cờ theo máy chủ + báo lý do |
| Phiên bản cũ | Tự đồng bộ, vẽ lại, cho thử lại |
| Mất mạng khi đang gửi | Thử lại **cùng mã lệnh**; **không** đi thành hai nước |
| Bấm hai lần nhanh | Ghi **một** nước |
| Ván đã kết thúc mà vẫn gửi lệnh | Từ chối |
