# TỔNG QUAN SẢN PHẨM

**ID:** `OVW` · **Trạng thái:** v1 · **Cập nhật:** 2026-09-21

---

## 1. SẢN PHẨM LÀ GÌ

**Cờ Tướng Online** — website chơi cờ tướng qua trình duyệt, cho phép hai người chơi trực tuyến với nhau theo thời gian thực, **nhìn mặt và nói chuyện** với nhau qua camera/mic ngay trong lúc đánh, và cho bạn bè vào xem.

Ngoài chơi với người, người dùng có thể **chơi với máy** ở ba cấp độ. Phần trí tuệ nhân tạo do nhóm **tự viết**, không dùng engine cờ có sẵn.

---

## 2. GIẢI QUYẾT VẤN ĐỀ GÌ

| Vấn đề | Cách sản phẩm giải quyết |
|---|---|
| Muốn đánh cờ với bạn ở xa | Tạo phòng, gửi link hoặc mã, bạn vào chơi ngay trên trình duyệt |
| Đánh cờ online mất cảm giác đối diện | Camera + mic trực tiếp ngay cạnh bàn cờ, thấy mặt và nói chuyện như đánh ngoài đời |
| Muốn bạn bè xem mình đánh | Tối đa 5 người vào xem, có kênh chat riêng không làm phiền hai người đang đánh |
| Không có ai để đánh cùng | Chơi với máy, 3 cấp độ |
| Sợ người lạ vào phá | 3 chế độ phòng: công khai / cần mã / khoá hẳn. Đuổi được người xem quấy rối |
| Đối thủ bỏ bàn giữa chừng | Luật chống treo ván tự xử lý, không phải ngồi chờ vô hạn |

---

## 3. DÀNH CHO AI

| Nhóm | Nhu cầu chính |
|---|---|
| Người chơi cờ tướng nghiệp dư | Đánh với bạn bè, vừa đánh vừa trò chuyện |
| Nhóm bạn / gia đình ở xa nhau | Đánh cờ như hoạt động chung, có người ngồi xem |
| Người mới học cờ | Đánh với máy cấp Dễ để luyện |

**Bối cảnh:** đây là **đồ án tốt nghiệp** cần chạy đầy đủ chức năng để chấm điểm, đồng thời giữ nền tảng để có thể tiếp tục phát triển và mở công khai sau khi nộp. Phần AI tự viết là **nội dung học thuật chính** khi bảo vệ.

---

## 4. NĂNG LỰC CHÍNH

### 4.1 Tài khoản
Đăng ký bằng **username + email + mật khẩu**, xác minh email, khôi phục mật khẩu. Hoặc **đăng nhập bằng Google**. Có hồ sơ với tên hiển thị riêng. **Không hỗ trợ khách vãng lai** — mọi chức năng đều cần tài khoản.

### 4.2 Bạn bè
Tìm bạn theo username, gửi/nhận lời mời kết bạn, thấy bạn nào đang online, mời bạn vào phòng chơi. Có **hộp thư lời mời** để không bỏ lỡ lời mời khi đang offline.

### 4.3 Phòng chơi
Tạo phòng với tên và cấu hình thời gian. Ba chế độ riêng tư:

| Chế độ | Ai vào xem được |
|---|---|
| **Công khai** | Mọi người dùng đủ điều kiện; WAITING/PLAYING hiện ở sảnh |
| **Cần mã** | Người có lời mời trực tiếp/mã/link WATCH hợp lệ; không hiện ở sảnh |
| **Khoá** | Không ai xem được |

Mời người khác bằng **3 cách**: mời trực tiếp bạn bè trong app · gửi **link** · đọc **mã phòng 8 ký tự**.

### 4.4 Chơi cờ
Bàn cờ gỗ truyền thống, quân chữ Hán. Đầy đủ luật di chuyển cờ tướng (cản mã, mắt tượng, ngòi pháo, cung, sông, tướng đối mặt, cấm tự chiếu).

**Luật giản lược** — ghi rõ cho người chơi biết trước khi đánh:
- Chiếu hết **hoặc** hết nước đi hợp lệ ⇒ **thua**.
- Cùng một thế cờ và cùng bên đến lượt xuất hiện **lần thứ ba** ⇒ **hoà**.
- Không phân xử riêng chiếu dai / đuổi dai.

Thời gian: **không giới hạn** (mặc định) hoặc 5 / 10 / 15 phút mỗi bên.

Trong ván: **đầu hàng** · **xin hoà** (cần đối thủ đồng ý) · **xin đi lại** (cần đối thủ đồng ý). Sau ván: **tái đấu đổi bên** · **xem lại từng nước**.

### 4.5 Chat, camera và mic
**Hai kênh chat:** kênh riêng chỉ hai PLAYER của cặp hội thoại được đọc/gửi; kênh chung cho mọi thành viên còn quyền trong phòng. PLAYER tự ẩn/hiện kênh chung; SPECTATOR không đọc kênh riêng. Quyền lịch sử khi thay ghế theo [REQ-CHAT](../01-requirements/REQ-CHAT.md), DEC-018/029.

Mỗi người chơi tự chọn **riêng cho camera** và **riêng cho mic**:

| Mức | Ai nhận được |
|---|---|
| **Tắt** | Không ai |
| **Chỉ đối thủ** | Người chơi còn lại |
| **Đối thủ và người xem** | Cả người xem |

Camera và mic **độc lập** — ví dụ chia sẻ tiếng cho tất cả nhưng hình chỉ cho đối thủ. **Không ai bật thay người khác**, kể cả chủ phòng. Mặc định **tắt hết**.

> **Chỉ trực tiếp** — không ghi âm, không ghi hình, không lưu, không phát lại.

### 4.6 Chơi với máy
Ba cấp **Dễ / Trung bình / Khó**, khác nhau ở ngân sách suy nghĩ (300 / 1000 / 3000 ms) và độ sâu tìm kiếm. Người chơi chọn cầm đỏ hay đen. Xin đi lại với máy **không cần chờ đồng ý**.

### 4.7 Chống treo ván
Nếu đến lượt mà **3 phút** không đi nước, hệ thống hỏi *"Bạn còn trong ván đấu không?"*. Xác nhận thì được thêm 3 phút (tối đa **2 lần liên tiếp**). Không xác nhận thì đếm ngược **30 giây** rồi **đối thủ thắng**.

### 4.8 Lịch sử
Xem lại các ván mình đã đánh, đi lại từng nước. Chỉ **người chơi của ván đó** xem được — không công khai theo username.

---

## 5. ĐIỀU LÀM SẢN PHẨM KHÁC BIỆT

1. **Camera/mic ngay trong bàn cờ**, với quyền chia sẻ **tách riêng từng nguồn, từng người**. Đa số web cờ chỉ có chat chữ.
2. **Chat riêng và chat chung** — người chơi tự ẩn kênh chung khi muốn tập trung; không mô tả kênh chung là bí mật với người chơi.
3. **AI tự viết**, giải thích được thuật toán và có số đo thực nghiệm.

---

## 6. NGUYÊN TẮC THIẾT KẾ

| Nguyên tắc | Nghĩa là |
|---|---|
| **Máy chủ quyết định** | Mọi nước đi, kết quả, thời gian do máy chủ phân xử. Client chỉ gửi ý định. Sửa client không gian lận được |
| **Quyền thật, không phải ẩn giao diện** | Không có quyền thì **không nhận được dữ liệu**, chứ không phải nhận rồi giấu đi |
| **Riêng tư thuộc về người phát** | Chỉ chủ của luồng camera/mic mới đổi được mức chia sẻ của luồng đó |
| **Không mất ván vì lỗi hệ thống** | Cả hai mất mạng, máy chủ khởi động lại, máy lỗi ⇒ **gián đoạn, không ai thua** |
| **Nói thật về giới hạn** | Không hứa điều hạ tầng không bảo đảm được. Ghi rõ cái gì đã kiểm chứng, cái gì chưa |

---

## 7. THIẾT BỊ HỖ TRỢ

| | Hỗ trợ |
|---|---|
| Máy tính | ✅ 1366×768 và 1920×1080 |
| Điện thoại | ✅ 390×844 và 360×800, qua trình duyệt |
| Ứng dụng cài đặt (native app) | ❌ Không có |

Trên điện thoại: bàn cờ chiếm toàn bộ chiều ngang; chat và camera thu gọn vào tab riêng để không che bàn.

**Giao diện tiếng Việt.**

---

## 8. ĐỌC TIẾP

| Muốn biết | Đọc |
|---|---|
| Cái gì **trong/ngoài** phạm vi | [scope.md](scope.md) |
| Thuật ngữ dùng thống nhất | [glossary.md](glossary.md) |
| Ai làm được gì | [actors.md](actors.md) |
| Chi tiết từng chức năng | [../01-requirements/](../01-requirements/) |
| Luật cờ đầy đủ | [../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) |
