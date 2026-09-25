# Kịch bản Trình diễn Thực tế (Demo Script)

Kịch bản từng bước để thực hiện buổi demo sản phẩm mượt mà và thuyết phục.

---

## 1. Demo Luồng 1: Đánh Cờ Với Máy (AI Match)

1. Mở trình duyệt truy cập `http://localhost:5173`.
2. Trên thanh điều hướng, nhấn vào **"Đánh với máy"** (`/ai/new`).
3. Chọn các tùy chọn:
   - Bên chơi: **Đỏ (đi trước)**
   - Cấp độ máy: **Trung bình**
   - Thời gian: **10 phút**
4. Nhấn **"Bắt đầu ván đấu"**:
   - Chỉ ra bàn cờ gỗ SVG truyền thống với các quân Hán sắc nét.
   - Thực hiện nước đi khai cuộc: ví dụ click vào Pháo đỏ (1, 2) $\to$ hiển thị các chấm xanh nước đi hợp lệ $\to$ chọn di chuyển Pháo vào trung lộ (4, 2).
   - Ngay lập tức banner hiển thị: **"🤖 Máy đang suy nghĩ..."** (tính toán qua Worker Thread ngầm).
   - Sau vài giây, máy tự động đi nước cờ đối công hợp lệ.
5. Trình diễn tính năng **"Đi lại"**:
   - Nhấn nút **"Đi lại"** $\to$ bàn cờ tua ngược 2 nước đi về trước nước của người chơi mà không cần xin phép máy.

---

## 2. Demo Luồng 2: Tạo Phòng & Đấu Trực Tuyến (Online Match)

1. Đăng nhập 2 tài khoản trên 2 cửa sổ trình duyệt (Tài khoản A và B):
   - Cửa sổ 1: Đăng nhập tài khoản A.
   - Cửa sổ 2 (Ẩn danh): Đăng nhập tài khoản B.
2. Tài khoản A vào **"Sảnh chờ"** (`/lobby`), nhấn **"Tạo phòng mới"**:
   - Đặt tên: "Đại chiến Kỳ đài"
   - Quyền xem: Công khai
   - Thời gian: 5 phút
   - Nhấn Tạo phòng $\to$ chuyển vào màn hình phòng chờ (`/rooms/:id`).
3. Tài khoản B mở Sảnh chờ $\to$ thấy phòng "Đại chiến Kỳ đài" hiển thị $\to$ nhấn "Tham gia".
4. Ghép ghế:
   - A ngồi ghế Đỏ, B ngồi ghế Đen.
   - Cả hai cùng nhấn **"SẴN SÀNG"** $\to$ hệ thống tự động khởi tạo ván đấu authoritative chuyển sang `/matches/:id`.
5. Trong ván đấu:
   - Đồng hồ đếm ngược chạy chính xác theo lượt đi của từng bên.
   - Nhắn tin thử trong khung Chat: kênh Người chơi hoạt động bình thường.
   - Bật camera/mic: chọn chia sẻ "Chỉ đối thủ" $\to$ khung preview video xuất hiện.

---

## 3. Demo Luồng 3: Khán Giả Xem Trận Đấu (Spectator Mode)

1. Mở cửa sổ thứ 3 với tài khoản C (Khán giả).
2. Vào phòng đấu qua link hoặc mã phòng:
   - Hệ thống ghi nhận số lượng người xem: **1/5 người xem**.
   - Khán giả chỉ nhận luồng âm thanh/hình ảnh khi người chơi chọn "Cả khán giả".
   - Khán giả không thể gửi lệnh đi cờ hay bấm nút xin hòa/xin đi lại.

---

## 4. Demo Luồng 4: Xem Lại Ván Đấu (Match Replay)

1. Kết thúc ván cờ (bằng Chiếu hết, Đầu hàng hoặc Hết giờ).
2. Màn hình kết thúc hiển thị bảng thông báo kết quả.
3. Nhấn nút **"Xem lại ván cờ"** (`/matches/:id/replay`):
   - Sử dụng bộ nút điều hướng:
     - `⏮ Về đầu`: Bàn cờ trở về thế cờ khởi đầu.
     - `▶ Tiến 1 nước`: Đi từng nước cờ lần lượt, quan sát thế trận phát triển.
     - `◀ Lùi 1 nước`: Lùi lại nước vừa đi.
     - `⏭ Đến cuối`: Chuyển thẳng đến thế cờ kết thúc ván.
4. Truy cập **"Lịch sử"** (`/history`) trên thanh Navbar để xem toàn bộ danh sách các ván đấu đã tham gia.
