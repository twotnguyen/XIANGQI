# FLOW-MEDIA — CAMERA VÀ MICRO

**Yêu cầu:** [REQ-MEDIA](../01-requirements/REQ-MEDIA.md)

---

## 1. BẬT CAMERA

```
Khung "Chia sẻ của bạn"
  📹 Camera: [ Tắt ▾ ]
       │
       ▼ chọn "Chỉ đối thủ"
       │
       ▼
Trình duyệt hỏi quyền truy cập camera
   ┌───┴───┐
 TỪ CHỐI  ĐỒNG Ý
   │        │
   ▼        ▼
"Không   Bắt đầu thu hình
 truy cập    │
 được     ▼
 camera" Máy chủ ghi mức mới · cấp quyền nhận CHỈ cho đối thủ
   │        │
   ▼        ▼
⚠ VẪN    ┌──────────────────────────────────────┐
 ĐÁNH CỜ │ Bạn:       xem trước (ĐÃ TẮT TIẾNG)  │
 BÌNH    │ Đối thủ:   thấy hình bạn ✅          │
 THƯỜNG  │ Người xem: KHÔNG thấy gì ❌          │
         └──────────────────────────────────────┘
```

---

## 2. BA MỨC × HAI NGUỒN

```
┌────────────────────────────────────┐
│ 📹 Camera:  [ Tắt              ▾ ] │  ← độc lập
│             [ Chỉ đối thủ         ]│
│             [ Đối thủ và người xem]│
│                                    │
│ 🎤 Micro:   [ Chỉ đối thủ      ▾ ] │  ← độc lập
└────────────────────────────────────┘
```

**Ví dụ tổ hợp hợp lệ:** camera *Chỉ đối thủ* + micro *Đối thủ và người xem*
⇒ người xem **nghe được tiếng nhưng không thấy hình**.

---

## 3. THU HẸP QUYỀN

```
A đổi camera: "Đối thủ và người xem" ──► "Chỉ đối thủ"
    │
    ▼
① ghi mức mong muốn mới
② THU HỒI quyền nhận của người xem TẠI HẠ TẦNG TRUYỀN
   ⚠ KHÔNG chỉ ẩn khung hình
③ chờ hạ tầng XÁC NHẬN
④ cấp lại quyền cho danh sách hợp lệ còn lại
    │
    ├─ trong lúc ③ chưa xong:
    │    UI hiện "Đang ngừng chia sẻ…"
    │    ⚠ KHÔNG báo đã bảo vệ thành công
    │
    ▼ (xong)
┌──────────────────────────────────────┐
│ A:         ô chọn "Chỉ đối thủ"      │
│ Đối thủ:   vẫn thấy hình bình thường │
│ Người xem: khung biến mất VÀ luồng   │
│            THẬT SỰ DỪNG              │
└──────────────────────────────────────┘
```

**Nếu hạ tầng mất liên lạc:** thử lại có giới hạn. Mức **mong muốn vẫn giữ**, **không** tự quay lại mức rộng hơn.

---

## 4. MEDIA VỀ TẮT KHI NÀO

```
Camera/Micro ĐANG PHÁT
      │
      ├─ tải lại trang ──────────► TẮT
      ├─ nối lại sau mất mạng ───► TẮT
      ├─ chuyển nguồn sang tab khác ► CHỈ NGUỒN ĐÓ TẮT; nguồn còn lại giữ nguyên
      ├─ ván mới (kể cả tái đấu) ► TẮT
      └─ đăng xuất rồi vào lại ──► TẮT
```

**Vì sao:** media là quyền riêng tư nhạy cảm. Tự bật lại có thể phát hình/tiếng **khi người dùng không ngờ tới**.

---

### Chuyển nguồn giữa các tab — DEC-033/034

Chọn Chuyển camera/micro → yêu cầu ngắt nguồn tương ứng ở tab cũ → **chờ xác nhận**.

- Thành công: nguồn ở tab mới **Tắt**; muốn phát phải chọn mức chia sẻ chủ động như luồng bật ban đầu.
- Chưa xác nhận: hiện đang chuyển, không cho nguồn mới thu/phát.
- Thất bại: hiện “Chưa chuyển được camera/micro. Thử lại.”; thử lại vẫn kiểm quyền/trạng thái và xác nhận nguồn cũ đã ngắt. Không tự bật sau ACK muộn.
- Nguồn còn lại giữ nguyên tab/mức chia sẻ; cờ và chat vẫn dùng được.

---

## 5. NGƯỜI XEM

```
Người xem KHÔNG có ô chọn phát
    │
    ▼
Chỉ có:  [🔊 Âm lượng]  [🔇 Tắt tiếng]   ← chỉ tác động MÁY MÌNH
    │
    ▼
Nếu trình duyệt chặn tự phát tiếng
    └──► hiện nút [Bật tiếng] để bấm thủ công
```

---

## 6. CẢNH BÁO BẮT BUỘC HIỂN THỊ

```
┌────────────────────────────────────┐
│ ⚠ Micro có thể thu cả tiếng phát   │
│   ra từ loa của bạn.               │
│   Nên dùng tai nghe.               │
└────────────────────────────────────┘
```

Đây là **giới hạn vật lý của thiết bị**, **không** khắc phục được bằng phân quyền mạng. Phải nói rõ **cho người dùng**, không chỉ ghi trong tài liệu.

---

## 7. NHÁNH LỖI

| Tình huống | Xử lý |
|---|---|
| Từ chối quyền thiết bị | Báo rõ, giữ **Tắt**. **Vẫn đánh cờ bình thường** |
| Không có camera/micro | Vô hiệu ô chọn tương ứng, giải thích |
| Thiết bị bị ứng dụng khác chiếm | Báo rõ, cho thử lại |
| Hạ tầng mất liên lạc | *"Đang ngừng chia sẻ…"*, **không** báo đã xong |
| Đổi camera và micro **cùng lúc** | Chỉ một được ghi; đọc lại rồi thử lại cái kia |
| Người xem cố phát | **Từ chối** |
| Đổi mức **thay người khác** | **Từ chối** |
| Tab khác đổi mức | **Từ chối** |

---

## 8. GIỚI HẠN CỐ Ý KHÔNG HỨA

| Không hứa | Lý do |
|---|---|
| Thu hồi **tức thời** bất kể mạng | Hệ phân tán không bảo đảm được |
| Thu hồi dữ liệu **đã tới** máy người nhận | Đã nhận rồi thì không lấy lại được |
| Ngăn người nhận **quay màn hình** | Không đặt mục tiêu chống |

## 9. CHUYỂN/THU HỒI KHÔNG HOÀN TẤT — DEC-041

Áp dụng toàn bộ thiết bị cùng tài khoản. Server nhận thao tác → chặn quyền cũ/mới trong phạm vi nguồn → ngắt ở hạ tầng → xác nhận → chuyển quyền **Tắt**. Mỗi lượt chờ tối đa 30 giây; chưa có chứng cứ thì lỗi + Thử lại, không tự bật hay trả lại mức rộng hơn. Thử lại/ACK muộn tiếp tục đúng thao tác và chỉ kết thúc OFF. Cờ/chat và nguồn còn lại vẫn dùng được.

Tab cũ không trả lời nhưng hạ tầng xác nhận chặn luồng: chuyển được, UI ghi “Đã chặn luồng cũ; chưa xác nhận thiết bị cũ đã tắt.” Không khẳng định đã tắt webcam vật lý từ xa. Nếu hạ tầng cũng không xác nhận, giữ chặn nguồn mới và lỗi. Chi tiết oracle tại [media-control-contract](../09-technical/media-control-contract.md).
