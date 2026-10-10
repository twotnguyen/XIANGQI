# Cờ Tướng Online · Ý tưởng sản phẩm

**Bản tổng quan, đồng bộ quyết định PO đến ngày 09/10/2026.** Tài liệu này chỉ giới thiệu sản phẩm, không tạo luật. Nguồn luật: [BA-SCOPE-DECISIONS.md](BA-SCOPE-DECISIONS.md) (Phần 0 ưu tiên cao nhất); tiêu chí nghiệm thu: [BACKLOG-P1.md](BACKLOG-P1.md).

## 1. Sản phẩm và mục đích

Web cờ tướng tiếng Việt để giao lưu qua phòng online và luyện tập với máy. Trải nghiệm kết hợp bàn cờ đúng bộ luật rút gọn của dự án với chat, camera và mic tự chọn. Đây là đồ án môn Quản trị Dự án CNTT mô phỏng làm việc với khách hàng; thành công P1 được đo bằng **tám mục tiêu của khách hàng chạy từ đầu đến cuối** (kịch bản D1–D10), không bằng số màn hình hay số tài liệu.

## 2. Ai dùng và để làm gì?

| Vai trò | Nhu cầu trong phạm vi P1 |
|---|---|
| Người dùng có tài khoản | Đăng ký/đăng nhập (username + mật khẩu hoặc Google), tạo/vào phòng, mời bạn bằng lời mời trong game hoặc link/mã, đánh online, chat, camera/mic, luyện với máy |
| Khách | Vào nhanh bằng tên tạm: tạo 1 phòng, vào phòng bằng link/mã hoặc từ Sảnh, chơi, xem, đánh với máy; không kết bạn |
| Host | Quản lý phòng: chế độ PUBLIC/CODE_ONLY/LOCKED, sắp xếp ghế và người xem; không sửa luật hay kết quả |
| Người xem | Vào phòng PUBLIC từ Sảnh hoặc bằng link/mã, xem ván realtime, chat Kênh Chung; chỉ nhận hình/tiếng khi người chơi cho phép |

Các vai trò lấy từ yêu cầu khách hàng, không phải kết quả nghiên cứu thị trường.

## 3. Trải nghiệm trọng tâm

1. Đăng ký/đăng nhập (hoặc vào Khách) → Sảnh.
2. Tạo phòng hoặc nhận lời mời/link/mã; ở Sảnh có danh sách phòng PUBLIC với **Vào chơi** và **Vào xem**.
3. Hai người ngồi ghế, có thể **Xin đổi bên**, cùng Sẵn sàng → đếm 3-2-1 → chơi; máy chủ quyết định mọi luật.
4. Trò chuyện ở Kênh Riêng, bật camera/mic (mặc định tắt, không ghi). Người xem chat Kênh Chung, không phát media, không đọc Kênh Riêng.
5. Hết ván: **Ở lại phòng** để đánh tiếp (giữ người xem), đổi bên nếu muốn; hoặc rời phòng.
6. Từ Sảnh chọn **Đánh với máy**: ba cấp độ, chọn phe, hết ván bấm Ván mới để đổi phe/cấp.

## 4. Phạm vi và ưu tiên

**P1 (hạn 04/11/2026):** tám mục tiêu khách hàng — đăng ký/đăng nhập (kể cả Google và Khách), tạo phòng, mời vào phòng, khởi tạo bàn cờ, đánh online, chế độ phòng PUBLIC/CODE_ONLY/LOCKED tối đa 5 người xem (7 người/phòng), chat + camera + mic với kênh người xem riêng, đánh với máy theo cấp độ. Chỉ giao diện Kỳ Đài Cổ Phong.

**P2:** Đánh Hạng/Elo, ghép ngẫu nhiên, Tái đấu có chọn phe, Xin đi lại, Lịch sử/Replay, chat 1-1, Thách đấu, sticker, QR, khôi phục mật khẩu/Username, đổi Username, tiện ích demo, giao diện bổ sung (BA Phần 11).

**Không làm:** xem BA 10.2.

## 5. Thành công được chứng minh thế nào?

- 9 Epic (EP-01 → EP-08 khớp 8 yêu cầu khách hàng, EP-00 nền tảng), 27 User Story, 268 tiêu chí nghiệm thu có ca kiểm thử đối ứng; 71 Task, 880 giờ trong 4 Sprint ([KE-HOACH-JIRA.md](KE-HOACH-JIRA.md)).
- Kế hoạch dự kiến: BA đã chốt; lịch triển khai từ 10/10, hoàn tất và tổng duyệt ngày 04/11. Jira hiện có 36 mục BA Done và 71 Task To Do; bốn Sprint chưa bắt đầu. Chưa triển khai sản phẩm; số AC/TC là độ phủ đặc tả, không phải số ca đã kiểm đạt.
- Điều kiện nghiệm thu: kịch bản demo D1–D10 chạy trọn vẹn trên máy demo.
- Luật cờ kiểm độc lập ở máy chủ; không tin kết quả client gửi.
- Ngưỡng máy cờ, đồng bộ và quy mô phải đo thật; không đạt ghi BLOCKED, không hạ ngưỡng ngầm.

## 6. Đọc tiếp

1. [Quyết định nghiệp vụ và phân kỳ](BA-SCOPE-DECISIONS.md)
2. [Backlog P1: Epic, User Story, AC, TC](BACKLOG-P1.md) · [Kế hoạch Jira](KE-HOACH-JIRA.md)
3. [Danh mục màn hình](DANH-MUC-MAN-HINH-XIANGQI.md) · [Hệ thống thiết kế](DESIGN.md)
