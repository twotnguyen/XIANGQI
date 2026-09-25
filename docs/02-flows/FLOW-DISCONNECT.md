# FLOW-DISCONNECT — MẤT KẾT NỐI VÀ NHIỀU TAB

**Yêu cầu:** [REQ-DISCONNECT](../01-requirements/REQ-DISCONNECT.md) · [../05-data-and-realtime/session-state.md](../05-data-and-realtime/session-state.md)

---

## 1. NGƯỜI CHƠI MẤT KẾT NỐI

```
A mất mạng (hoặc đóng tab)
    │
    ▼
Máy chủ phát hiện
   ├─ ngắt rõ ràng ────► đánh dấu NGAY
   └─ hết hạn tín hiệu ► đánh dấu sau 30 giây không có tín hiệu
    │
    ▼
A = NGOẠI TUYẾN · bắt đầu đếm 60 GIÂY
⚠ ĐỒNG HỒ VÁN VẪN CHẠY nếu có
    │
    ├──► B thấy:          "Đối thủ mất kết nối — còn 00:54"
    └──► Người xem thấy:  (cùng dòng)
    │
    ├─ A QUAY LẠI trước 60 giây
    │    │
    │    ▼
    │  ① kiểm phiên còn hợp lệ?
    │  ② vẫn là thành viên?
    │  ③ VẪN ĐỦ QUYỀN? (phòng có đổi chế độ? có bị đuổi?)
    │    │
    │    ▼ (qua hết)
    │  nhận TOÀN BỘ trạng thái · huỷ đếm ngược
    │  ⚠ CAMERA/MIC VỀ TẮT — phải bật lại
    │    │
    │    ▼
    │  VÁN TIẾP TỤC nếu chưa có kết quả/hạn hợp lệ khác
    │
    └─ QUÁ 60 GIÂY
         │
         ▼
      B còn online?
      ┌──┴──┐
     CÓ    KHÔNG
      │      │
      ▼      ▼
  A THUA   VÁN GIÁN ĐOẠN
           (KHÔNG AI THẮNG)
```

---

## 2. HAI THỜI HẠN CHẠY SONG SONG

Ván không giới hạn: giữ hạn chống treo cũ khi mất/nối mạng theo DEC-030; INACTIVITY và DISCONNECT hạn nào hợp lệ đến trước có hiệu lực, bằng nhau ưu tiên DISCONNECT. Không reset 3 phút.

Khi ván **có đồng hồ**, đồng hồ và hạn mất mạng chạy cùng lúc. **Cái nào đến trước thì thắng.**

```
Ví dụ 1: đồng hồ A còn 30 giây, A mất mạng
  0s ──────── 30s ──────────── 60s
              ▲                 ▲
          HẾT GIỜ          (hạn mất mạng)
              │
              └──► A thua do HẾT GIỜ (đến trước)

Ví dụ 2: đồng hồ A còn 5 phút, A mất mạng
  0s ──────── 60s ──────────── 5:00
               ▲                 ▲
        (hạn mất mạng)       (hết giờ)
               │
               └──► A thua do MẤT MẠNG (đến trước)
```

**Bằng nhau** ⇒ ưu tiên **HẾT GIỜ**.

**`FLOW-DIS-01`** — Một thời hạn **đã tới hạn hợp lệ** thì **không bị xoá** bởi một sự kiện mất kết nối phát hiện sau đó. Ví dụ: A hết 60 giây khi B còn online ⇒ A thua. Nếu **sau đó** mới phát hiện B cũng đã rớt từ trước, kết quả **vẫn giữ**.

---

## 3. CẢ HAI MẤT KẾT NỐI

```
A mất mạng ──► đếm 60 giây
    │
    ▼ (giây thứ 30) B CŨNG mất mạng
    │
    ▼
Máy chủ xác định CẢ HAI ngoại tuyến
    │
    ▼
VÁN GIÁN ĐOẠN NGAY — không chờ hết 60 giây
KHÔNG AI THẮNG
```

---

## 4. MÁY CHỦ KHỞI ĐỘNG LẠI

```
Máy chủ khởi động lại
    │
    ▼
MỌI ván đang chơi ──► GIÁN ĐOẠN · KHÔNG AI THẮNG
    │
    ├─ ⚠ KHÔNG dùng thời gian máy chủ nghỉ để xử thua ai
    └─ lịch sử ván ĐƯỢC GIỮ
    │
    ▼
Người dùng nối lại ──► thấy "Ván bị gián đoạn — không có người thắng"
                        [Tạo ván mới] [Về sảnh]
```

---

## 5. TẢI LẠI TRANG

```
Tải lại trang (F5)
    │
    ▼
Giống mất kết nối rồi quay lại — chỉ rất nhanh
    │
    ├─ ✅ GHẾ KHÔNG MẤT
    ├─ ✅ ván tiếp tục
    └─ ⚠ CAMERA/MIC VỀ TẮT
```

---

## 6. NHIỀU TAB

```
Tab 1 ──► mở Tab 2
    │
    ▼
✅ CẢ HAI đồng bộ và THAO TÁC ĐƯỢC NHƯ NHAU   (DEC-020)
    │
    ├─ đi cờ ở tab nào cũng được
    ├─ chat ở tab nào cũng được
    ├─ xác nhận treo ván ở tab nào cũng được
    │
    └─ bấm cùng lúc ở 2 tab ──► máy chủ ghi ĐÚNG MỘT lần
                                 (kiểm lượt + phiên bản + mã lệnh)
```

### Ngoại lệ duy nhất: camera và micro (`DEC-021`)

```
Tab 1: 📹 Đang phát        Tab 2: 📹 Camera đang bật ở tab khác
                                  [ Chuyển sang tab này ]
                                            │
                                            ▼
                            ① Tab 1 DỪNG thiết bị
                            ② Xác nhận đã ngắt camera cũ
                            ③ Camera tab 2 TẮT; bật thủ công mới phát
```

**`FLOW-DIS-02`** — Chuyển theo DEC-033/034: chưa xác nhận ngắt nguồn cũ thì chưa cho phát nguồn mới; lỗi thì báo rõ + Thử lại. Chỉ nguồn chuyển về Tắt, nguồn còn lại giữ nguyên.

**`FLOW-DIS-03`** — Camera và micro **tách riêng** — camera ở tab 1, micro ở tab 2 là hợp lệ.

**Mở nhiều tab KHÔNG tạo thêm ghế** trong phòng.

---

## 7. NGƯỜI XEM MẤT KẾT NỐI

```
Người xem mất mạng
    │
    ▼
Giữ ghế 15 GIÂY (ngắn hơn người chơi nhiều)
    │
    ├─ quay lại kịp ──► ⚠ KIỂM TRA LẠI QUYỀN ──► vào tiếp
    │                    ├─ phòng đã chuyển khoá ──► TỪ CHỐI, về sảnh
    │                    └─ đã bị đuổi ───────────► TỪ CHỐI, về sảnh
    │
    └─ quá 15 giây ───► MẤT GHẾ, ghế nhường người khác
```

---

## 8. VÁN VỚI MÁY

```
Người chơi (thật) mất mạng trong ván với máy
    │
    ▼
Đếm 60 giây
    │
    ├─ quay lại kịp ──► ván tiếp tục
    │
    ├─ đồng hồ hết trước/đúng hạn 60 giây ──► THUA TIMEOUT
    └─ tới 60 giây, chưa có kết quả ───► VÁN GIÁN ĐOẠN
                        ⚠ KHÔNG xử thua DISCONNECT vì "máy vẫn online"
```

---

## 9. BẢNG TỔNG HỢP

| Ai | Hạn | Quá hạn thì sao |
|---|---|---|
| **Người chơi** (đối thủ online) | 60 giây | **Thua** |
| **Người chơi** (đối thủ cũng offline) | — | **Gián đoạn**, không ai thắng |
| **Người chơi** (ván với máy) | 60 giây | **Gián đoạn** nếu chưa hết đồng hồ; TIMEOUT trước hoặc đúng hạn được ưu tiên |
| **PLAYER ở WAITING** | 60 giây | Host ⇒ đóng phòng; PLAYER còn lại ⇒ mất ghế/reset ready; không xử thua (`DEC-031`) |
| **Người xem** | 15 giây | Mất ghế |
| **Máy chủ khởi động lại** | — | **Gián đoạn**, không ai thắng |

**WAITING:** offline mất trạng thái ready; nối lại trước hạn giữ ghế nhưng phải ready lại. Chỉ tạo ván khi đủ hai người online và ready; một tab khác còn online không kích hoạt offline. Xem REQ-ROOM BR-ROOM-19.
