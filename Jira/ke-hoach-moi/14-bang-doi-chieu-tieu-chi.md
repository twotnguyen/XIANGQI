# Bảng đối chiếu: tiêu chí đặc tả → Story → Task → bằng chứng

**Ngày:** 2026-10-04 · **Trạng thái:** đề xuất, chờ PO duyệt · Chưa tạo gì trên Jira · Viết theo `00-chuan-description.md` và mẫu `00b`.

Bảng này chứng minh **không sót yêu cầu**: mỗi tiêu chí của giai đoạn 1 (162 tiêu chí, 54 mục yêu cầu người dùng) đều thuộc một Story và có Task kiểm. Trạng thái tất cả là **NOT_RUN** (chưa chạy); khi chạy thì ghi đạt, không đạt hoặc bị chặn kèm bằng chứng.

## 1. Từng tiêu chí → Story → Task kiểm

| Mã tiêu chí | Mục yêu cầu | Story | Epic | Task kiểm | Trạng thái |
|---|---|---|---|---|---|
| `AC-AUTH-01-01` | US-AUTH-01 — Đăng ký bước 1: username và mật khẩu | Story 1 | 1 | T-21 | NOT_RUN |
| `AC-AUTH-01-02` | US-AUTH-01 — Đăng ký bước 1: username và mật khẩu | Story 1 | 1 | T-13, T-21 | NOT_RUN |
| `AC-AUTH-01-03` | US-AUTH-01 — Đăng ký bước 1: username và mật khẩu | Story 1 | 1 | T-21 | NOT_RUN |
| `AC-AUTH-01-04` | US-AUTH-01 — Đăng ký bước 1: username và mật khẩu | Story 1 | 1 | T-13 | NOT_RUN |
| `AC-AUTH-02-01` | US-AUTH-02 — Đăng ký bước 2: email và gửi OTP | Story 1 | 1 | T-13, T-21 | NOT_RUN |
| `AC-AUTH-02-02` | US-AUTH-02 — Đăng ký bước 2: email và gửi OTP | Story 1 | 1 | T-03, T-13, T-25 | NOT_RUN |
| `AC-AUTH-02-03` | US-AUTH-02 — Đăng ký bước 2: email và gửi OTP | Story 1 | 1 | T-13, T-21 | NOT_RUN |
| `AC-AUTH-03-01` | US-AUTH-03 — Đăng ký bước 3: xác thực OTP, tạo tài khoản | Story 1 | 1 | T-18, T-25 | NOT_RUN |
| `AC-AUTH-03-02` | US-AUTH-03 — Đăng ký bước 3: xác thực OTP, tạo tài khoản | Story 1 | 1 | T-18, T-21 | NOT_RUN |
| `AC-AUTH-03-03` | US-AUTH-03 — Đăng ký bước 3: xác thực OTP, tạo tài khoản | Story 1 | 1 | T-18, T-21, T-22 | NOT_RUN |
| `AC-AUTH-03-04` | US-AUTH-03 — Đăng ký bước 3: xác thực OTP, tạo tài khoản | Story 1 | 1 | T-18, T-22, T-42 | NOT_RUN |
| `AC-AUTH-03-05` | US-AUTH-03 — Đăng ký bước 3: xác thực OTP, tạo tài khoản | Story 1 | 1 | T-18, T-42 | NOT_RUN |
| `AC-AUTH-03-06` | US-AUTH-03 — Đăng ký bước 3: xác thực OTP, tạo tài khoản | Story 1 | 1 | T-18, T-21 | NOT_RUN |
| `AC-AUTH-04-01` | US-AUTH-04 — Đăng nhập bằng username và mật khẩu | Story 2 | 1 | T-17, T-21, T-25, T-54 | NOT_RUN |
| `AC-AUTH-04-02` | US-AUTH-04 — Đăng nhập bằng username và mật khẩu | Story 2 | 1 | T-17, T-21 | NOT_RUN |
| `AC-AUTH-04-03` | US-AUTH-04 — Đăng nhập bằng username và mật khẩu | Story 2 | 1 | T-17, T-21 | NOT_RUN |
| `AC-AUTH-04-04` | US-AUTH-04 — Đăng nhập bằng username và mật khẩu | Story 2 | 1 | T-21, T-60 | NOT_RUN |
| `AC-AUTH-04-05` | US-AUTH-04 — Đăng nhập bằng username và mật khẩu | Story 2 | 1 | T-49, T-59 | NOT_RUN |
| `AC-AUTH-05-01` | US-AUTH-05 — Hồ sơ cơ bản và đăng xuất | Story 3 | 1 | T-09, T-17, T-21 | NOT_RUN |
| `AC-AUTH-05-02` | US-AUTH-05 — Hồ sơ cơ bản và đăng xuất | Story 3 | 1 | T-17, T-21, T-22 | NOT_RUN |
| `AC-AUTH-05-03` | US-AUTH-05 — Hồ sơ cơ bản và đăng xuất | Story 3 | 1 | T-21 | NOT_RUN |
| `AC-AUTH-05-04` | US-AUTH-05 — Hồ sơ cơ bản và đăng xuất | Story 3 | 1 | T-21, T-25, T-55 | NOT_RUN |
| `AC-AUTH-05-05` | US-AUTH-05 — Hồ sơ cơ bản và đăng xuất | Story 3 | 1 | T-55 | NOT_RUN |
| `AC-AUTH-06-01` | US-AUTH-06 — Chuyển hướng vào phòng sau đăng nhập | Story 9 | 3 | T-54 | NOT_RUN |
| `AC-AUTH-06-02` | US-AUTH-06 — Chuyển hướng vào phòng sau đăng nhập | Story 9 | 3 | T-54 | NOT_RUN |
| `AC-AUTH-07-01` | US-AUTH-07 — Đăng ký và đăng nhập bằng Google | Story 1 | 1 | T-18, T-21, T-22, T-25 | NOT_RUN |
| `AC-AUTH-07-02` | US-AUTH-07 — Đăng ký và đăng nhập bằng Google | Story 2 | 1 | T-17, T-21, T-22, T-25 | NOT_RUN |
| `AC-AUTH-07-03` | US-AUTH-07 — Đăng ký và đăng nhập bằng Google | Story 1 | 1 | T-18, T-22 | NOT_RUN |
| `AC-AUTH-07-04` | US-AUTH-07 — Đăng ký và đăng nhập bằng Google | Story 1 | 1 | T-18, T-21, T-42 | NOT_RUN |
| `AC-AUTH-07-05` | US-AUTH-07 — Đăng ký và đăng nhập bằng Google | Story 2 | 1 | T-17, T-18, T-22 | NOT_RUN |
| `AC-ROOM-01-01` | US-ROOM-01 — Tạo phòng | Story 5 | 2 | T-10, T-15 | NOT_RUN |
| `AC-ROOM-01-02` | US-ROOM-01 — Tạo phòng | Story 5 | 2 | T-15, T-28 | NOT_RUN |
| `AC-ROOM-01-03` | US-ROOM-01 — Tạo phòng | Story 5 | 2 | T-10, T-15 | NOT_RUN |
| `AC-ROOM-01-04` | US-ROOM-01 — Tạo phòng | Story 5 | 2 | T-15, T-39 | NOT_RUN |
| `AC-ROOM-02-01` | US-ROOM-02 — Phòng chờ và ghế ngồi | Story 7 | 2 | T-11, T-23, T-28 | NOT_RUN |
| `AC-ROOM-02-02` | US-ROOM-02 — Phòng chờ và ghế ngồi | Story 7 | 2 | T-19, T-23 | NOT_RUN |
| `AC-ROOM-02-03` | US-ROOM-02 — Phòng chờ và ghế ngồi | Story 7 | 2 | T-11, T-23 | NOT_RUN |
| `AC-ROOM-03-01` | US-ROOM-03 — Sẵn sàng và bắt đầu ván | Story 7 | 2 | T-11, T-23 | NOT_RUN |
| `AC-ROOM-03-02` | US-ROOM-03 — Sẵn sàng và bắt đầu ván | Story 7 | 2 | T-23, T-28, T-32 | NOT_RUN |
| `AC-ROOM-03-03` | US-ROOM-03 — Sẵn sàng và bắt đầu ván | Story 7 | 2 | T-11, T-23, T-28 | NOT_RUN |
| `AC-ROOM-04-01` | US-ROOM-04 — Chia sẻ phòng bằng link và mã | Story 9 | 3 | T-11, T-15 | NOT_RUN |
| `AC-ROOM-04-02` | US-ROOM-04 — Chia sẻ phòng bằng link và mã | Story 9 | 3 | T-11, T-60 | NOT_RUN |
| `AC-ROOM-04-03` | US-ROOM-04 — Chia sẻ phòng bằng link và mã | Story 9 | 3 | T-43 | NOT_RUN |
| `AC-ROOM-05-01` | US-ROOM-05 — Vào phòng bằng mã, link hoặc Sảnh | Story 8 | 2 | T-10, T-19, T-28 | NOT_RUN |
| `AC-ROOM-05-02` | US-ROOM-05 — Vào phòng bằng mã, link hoặc Sảnh | Story 8 | 2 | T-11, T-19 | NOT_RUN |
| `AC-ROOM-05-03` | US-ROOM-05 — Vào phòng bằng mã, link hoặc Sảnh | Story 8 | 2 | T-10, T-19 | NOT_RUN |
| `AC-ROOM-05-04` | US-ROOM-05 — Vào phòng bằng mã, link hoặc Sảnh | Story 8 | 2 | T-19, T-44, T-46 | NOT_RUN |
| `AC-ROOM-06-01` | US-ROOM-06 — Đổi chỗ giữa ghế và người xem | Story 20 | 6 | T-39, T-44 | NOT_RUN |
| `AC-ROOM-06-02` | US-ROOM-06 — Đổi chỗ giữa ghế và người xem | Story 20 | 6 | T-39, T-44, T-46 | NOT_RUN |
| `AC-ROOM-06-03` | US-ROOM-06 — Đổi chỗ giữa ghế và người xem | Story 20 | 6 | T-39, T-44, T-46 | NOT_RUN |
| `AC-ROOM-06-04` | US-ROOM-06 — Đổi chỗ giữa ghế và người xem | Story 20 | 6 | T-39, T-44 | NOT_RUN |
| `AC-ROOM-06-05` | US-ROOM-06 — Đổi chỗ giữa ghế và người xem | Story 20 | 6 | T-44, T-46 | NOT_RUN |
| `AC-ROOM-07-01` | US-ROOM-07 — Chế độ riêng tư và khoá phòng | Story 19 | 6 | T-39, T-43, T-46 | NOT_RUN |
| `AC-ROOM-07-02` | US-ROOM-07 — Chế độ riêng tư và khoá phòng | Story 19 | 6 | T-43, T-46 | NOT_RUN |
| `AC-ROOM-07-03` | US-ROOM-07 — Chế độ riêng tư và khoá phòng | Story 19 | 6 | T-43, T-51, T-57 | NOT_RUN |
| `AC-ROOM-07-04` | US-ROOM-07 — Chế độ riêng tư và khoá phòng | Story 19 | 6 | T-43 | NOT_RUN |
| `AC-ROOM-07-05` | US-ROOM-07 — Chế độ riêng tư và khoá phòng | Story 19 | 6 | T-43, T-46, T-57 | NOT_RUN |
| `AC-ROOM-07-06` | US-ROOM-07 — Chế độ riêng tư và khoá phòng | Story 19 | 6 | T-39 | NOT_RUN |
| `AC-ROOM-08-01` | US-ROOM-08 — Danh sách phòng công khai ở Sảnh | Story 19 | 6 | T-10, T-43 | NOT_RUN |
| `AC-ROOM-08-02` | US-ROOM-08 — Danh sách phòng công khai ở Sảnh | Story 19 | 6 | T-10, T-43 | NOT_RUN |
| `AC-ROOM-08-03` | US-ROOM-08 — Danh sách phòng công khai ở Sảnh | Story 19 | 6 | T-10, T-46 | NOT_RUN |
| `AC-ROOM-08-04` | US-ROOM-08 — Danh sách phòng công khai ở Sảnh | Story 19 | 6 | T-10, T-60 | NOT_RUN |
| `AC-ROOM-09-01` | US-ROOM-09 — Đuổi người xem | Story 20 | 6 | T-39, T-46 | NOT_RUN |
| `AC-ROOM-09-02` | US-ROOM-09 — Đuổi người xem | Story 20 | 6 | T-44, T-46 | NOT_RUN |
| `AC-ROOM-09-03` | US-ROOM-09 — Đuổi người xem | Story 20 | 6 | T-11, T-19 | NOT_RUN |
| `AC-ROOM-10-01` | US-ROOM-10 — Host rời, chuyển quyền, đóng phòng | Story 20 | 6 | T-44, T-46 | NOT_RUN |
| `AC-ROOM-10-02` | US-ROOM-10 — Host rời, chuyển quyền, đóng phòng | Story 20 | 6 | T-44, T-46 | NOT_RUN |
| `AC-ROOM-10-03` | US-ROOM-10 — Host rời, chuyển quyền, đóng phòng | Story 20 | 6 | T-44, T-51 | NOT_RUN |
| `AC-ROOM-11-01` | US-ROOM-11 — Sau ván CASUAL: quay về phòng chờ | Story 20 | 6 | T-44, T-46 | NOT_RUN |
| `AC-ROOM-11-02` | US-ROOM-11 — Sau ván CASUAL: quay về phòng chờ | Story 20 | 6 | T-44 | NOT_RUN |
| `AC-ROOM-11-03` | US-ROOM-11 — Sau ván CASUAL: quay về phòng chờ | Story 20 | 6 | T-51 | NOT_RUN |
| `AC-ROOM-11-04` | US-ROOM-11 — Sau ván CASUAL: quay về phòng chờ | Story 20 | 6 | T-46, T-62 | NOT_RUN |
| `AC-ROOM-12-01` | US-ROOM-12 — Màn hình từ chối truy cập | Story 8 | 2 | T-11 | NOT_RUN |
| `AC-BOARD-01-01` | US-BOARD-01 — Hiển thị bàn cờ | Story 13 | 4 | T-05, T-12 | NOT_RUN |
| `AC-BOARD-01-02` | US-BOARD-01 — Hiển thị bàn cờ | Story 13 | 4 | T-05, T-12, T-16 | NOT_RUN |
| `AC-BOARD-01-03` | US-BOARD-01 — Hiển thị bàn cờ | Story 13 | 4 | T-12, T-61 | NOT_RUN |
| `AC-BOARD-02-01` | US-BOARD-02 — Chọn quân và gợi ý ô đi bằng click | Story 14 | 4 | T-16 | NOT_RUN |
| `AC-BOARD-02-02` | US-BOARD-02 — Chọn quân và gợi ý ô đi bằng click | Story 14 | 4 | T-16 | NOT_RUN |
| `AC-BOARD-02-03` | US-BOARD-02 — Chọn quân và gợi ý ô đi bằng click | Story 14 | 4 | T-16, T-24 | NOT_RUN |
| `AC-BOARD-03-01` | US-BOARD-03 — Kéo thả | Story 14 | 4 | T-20 | NOT_RUN |
| `AC-BOARD-03-02` | US-BOARD-03 — Kéo thả | Story 14 | 4 | T-20, T-61 | NOT_RUN |
| `AC-BOARD-04-01` | US-BOARD-04 — Đánh dấu nước cuối và chiếu | Story 14 | 4 | T-20 | NOT_RUN |
| `AC-BOARD-04-02` | US-BOARD-04 — Đánh dấu nước cuối và chiếu | Story 14 | 4 | T-20, T-61 | NOT_RUN |
| `AC-BOARD-04-03` | US-BOARD-04 — Đánh dấu nước cuối và chiếu | Story 14 | 4 | T-20, T-61 | NOT_RUN |
| `AC-BOARD-05-01` | US-BOARD-05 — Âm thanh | Story 14 | 4 | T-20 | NOT_RUN |
| `AC-BOARD-05-02` | US-BOARD-05 — Âm thanh | Story 14 | 4 | T-20 | NOT_RUN |
| `AC-PLAY-01-01` | US-PLAY-01 — Đi nước qua mạng | Story 15 | 5 | T-27, T-30, T-63 | NOT_RUN |
| `AC-PLAY-01-02` | US-PLAY-01 — Đi nước qua mạng | Story 15 | 5 | T-08, T-27, T-30 | NOT_RUN |
| `AC-PLAY-01-03` | US-PLAY-01 — Đi nước qua mạng | Story 15 | 5 | T-09, T-27, T-30 | NOT_RUN |
| `AC-PLAY-01-04` | US-PLAY-01 — Đi nước qua mạng | Story 15 | 5 | T-24 | NOT_RUN |
| `AC-PLAY-02-01` | US-PLAY-02 — Đồng hồ | Story 16 | 5 | T-29 | NOT_RUN |
| `AC-PLAY-02-02` | US-PLAY-02 — Đồng hồ | Story 16 | 5 | T-29, T-32 | NOT_RUN |
| `AC-PLAY-02-03` | US-PLAY-02 — Đồng hồ | Story 16 | 5 | T-24 | NOT_RUN |
| `AC-PLAY-03-01` | US-PLAY-03 — Kết thúc ván và kết quả | Story 17 | 5 | T-08, T-29, T-53 | NOT_RUN |
| `AC-PLAY-03-02` | US-PLAY-03 — Kết thúc ván và kết quả | Story 17 | 5 | T-24, T-29, T-32, T-51 | NOT_RUN |
| `AC-PLAY-03-03` | US-PLAY-03 — Kết thúc ván và kết quả | Story 17 | 5 | T-29, T-50 | NOT_RUN |
| `AC-PLAY-04-01` | US-PLAY-04 — Đầu hàng | Story 17 | 5 | T-24, T-29, T-32 | NOT_RUN |
| `AC-PLAY-05-01` | US-PLAY-05 — Xin hoà | Story 17 | 5 | T-24, T-29, T-32 | NOT_RUN |
| `AC-PLAY-05-02` | US-PLAY-05 — Xin hoà | Story 17 | 5 | T-29, T-32 | NOT_RUN |
| `AC-PLAY-05-03` | US-PLAY-05 — Xin hoà | Story 17 | 5 | T-24, T-29 | NOT_RUN |
| `AC-PLAY-05-04` | US-PLAY-05 — Xin hoà | Story 17 | 5 | T-24, T-32 | NOT_RUN |
| `AC-PLAY-06-01` | US-PLAY-06 — Rời phòng giữa ván | Story 18 | 5 | T-24, T-51, T-57 | NOT_RUN |
| `AC-PLAY-07-01` | US-PLAY-07 — Mất kết nối và kết nối lại | Story 18 | 5 | T-51, T-57 | NOT_RUN |
| `AC-PLAY-07-02` | US-PLAY-07 — Mất kết nối và kết nối lại | Story 18 | 5 | T-51, T-57 | NOT_RUN |
| `AC-PLAY-07-03` | US-PLAY-07 — Mất kết nối và kết nối lại | Story 18 | 5 | T-51 | NOT_RUN |
| `AC-PLAY-07-04` | US-PLAY-07 — Mất kết nối và kết nối lại | Story 18 | 5 | T-27, T-51, T-57 | NOT_RUN |
| `AC-PLAY-08-01` | US-PLAY-08 — Lặp thế, chiếu liên tục, không ăn quân | Story 17 | 5 | T-08, T-29, T-53 | NOT_RUN |
| `AC-PLAY-08-02` | US-PLAY-08 — Lặp thế, chiếu liên tục, không ăn quân | Story 17 | 5 | T-08, T-29, T-53 | NOT_RUN |
| `AC-PLAY-09-01` | US-PLAY-09 — Người xem theo dõi trực tiếp | Story 21 | 6 | T-50, T-57 | NOT_RUN |
| `AC-PLAY-09-02` | US-PLAY-09 — Người xem theo dõi trực tiếp | Story 21 | 6 | T-36, T-50, T-56 | NOT_RUN |
| `AC-PLAY-09-03` | US-PLAY-09 — Người xem theo dõi trực tiếp | Story 21 | 6 | T-39, T-50 | NOT_RUN |
| `AC-PLAY-10-01` | US-PLAY-10 — Bảng nước đi | Story 15 | 5 | T-47, T-57 | NOT_RUN |
| `AC-CHAT-01-01` | US-CHAT-01 — Hai kênh chat | Story 22 | 7 | T-48, T-56 | NOT_RUN |
| `AC-CHAT-01-02` | US-CHAT-01 — Hai kênh chat | Story 22 | 7 | T-48, T-56 | NOT_RUN |
| `AC-CHAT-01-03` | US-CHAT-01 — Hai kênh chat | Story 22 | 7 | T-48, T-56 | NOT_RUN |
| `AC-CHAT-02-01` | US-CHAT-02 — Giới hạn và bộ lọc từ cấm | Story 22 | 7 | T-48 | NOT_RUN |
| `AC-CHAT-02-02` | US-CHAT-02 — Giới hạn và bộ lọc từ cấm | Story 22 | 7 | T-09, T-48, T-56 | NOT_RUN |
| `AC-CHAT-02-03` | US-CHAT-02 — Giới hạn và bộ lọc từ cấm | Story 22 | 7 | T-56, T-60 | NOT_RUN |
| `AC-MEDIA-01-01` | US-MEDIA-01 — Camera và micro cho hai người chơi | Story 23 | 7 | T-36, T-59 | NOT_RUN |
| `AC-MEDIA-01-02` | US-MEDIA-01 — Camera và micro cho hai người chơi | Story 23 | 7 | T-35, T-49, T-59 | NOT_RUN |
| `AC-MEDIA-01-03` | US-MEDIA-01 — Camera và micro cho hai người chơi | Story 23 | 7 | T-59 | NOT_RUN |
| `AC-MEDIA-01-04` | US-MEDIA-01 — Camera và micro cho hai người chơi | Story 23 | 7 | T-49, T-63 | NOT_RUN |
| `AC-MEDIA-02-01` | US-MEDIA-02 — Người xem chỉ xem/nghe | Story 23 | 7 | T-36, T-49, T-63 | NOT_RUN |
| `AC-MEDIA-02-02` | US-MEDIA-02 — Người xem chỉ xem/nghe | Story 23 | 7 | T-49, T-59, T-63 | NOT_RUN |
| `AC-MEDIA-03-01` | US-MEDIA-03 — Mở nhiều tab | Story 24 | 7 | T-49, T-59 | NOT_RUN |
| `AC-FRIEND-01-01` | US-FRIEND-01 — Tìm người và gửi lời mời | Story 10 | 3 | T-40, T-41 | NOT_RUN |
| `AC-FRIEND-01-02` | US-FRIEND-01 — Tìm người và gửi lời mời | Story 10 | 3 | T-40, T-41 | NOT_RUN |
| `AC-FRIEND-02-01` | US-FRIEND-02 — Nhận và trả lời lời mời | Story 10 | 3 | T-40, T-41, T-52 | NOT_RUN |
| `AC-FRIEND-02-02` | US-FRIEND-02 — Nhận và trả lời lời mời | Story 10 | 3 | T-41 | NOT_RUN |
| `AC-FRIEND-03-01` | US-FRIEND-03 — Danh sách bạn và trạng thái | Story 11 | 3 | T-40, T-41 | NOT_RUN |
| `AC-FRIEND-03-02` | US-FRIEND-03 — Danh sách bạn và trạng thái | Story 11 | 3 | T-40, T-60 | NOT_RUN |
| `AC-FRIEND-03-03` | US-FRIEND-03 — Danh sách bạn và trạng thái | Story 11 | 3 | T-41, T-52 | NOT_RUN |
| `AC-FRIEND-04-01` | US-FRIEND-04 — Mời bạn bè online vào phòng | Story 12 | 3 | T-40, T-45 | NOT_RUN |
| `AC-FRIEND-04-02` | US-FRIEND-04 — Mời bạn bè online vào phòng | Story 12 | 3 | T-40, T-45, T-52 | NOT_RUN |
| `AC-FRIEND-04-03` | US-FRIEND-04 — Mời bạn bè online vào phòng | Story 12 | 3 | T-40, T-45, T-52 | NOT_RUN |
| `AC-FRIEND-04-04` | US-FRIEND-04 — Mời bạn bè online vào phòng | Story 12 | 3 | T-45, T-52 | NOT_RUN |
| `AC-FRIEND-05-01` | US-FRIEND-05 — Giới hạn | Story 10 | 3 | T-40, T-41 | NOT_RUN |
| `AC-FRIEND-05-02` | US-FRIEND-05 — Giới hạn | Story 10 | 3 | T-41, T-52 | NOT_RUN |
| `AC-AI-01-01` | US-AI-01 — Chọn cấp độ và phe | Story 25 | 8 | T-26, T-31, T-33 | NOT_RUN |
| `AC-AI-01-02` | US-AI-01 — Chọn cấp độ và phe | Story 25 | 8 | T-26, T-31 | NOT_RUN |
| `AC-AI-01-03` | US-AI-01 — Chọn cấp độ và phe | Story 25 | 8 | T-26, T-60 | NOT_RUN |
| `AC-AI-02-01` | US-AI-02 — Chơi với máy | Story 25 | 8 | T-14, T-58 | NOT_RUN |
| `AC-AI-02-02` | US-AI-02 — Chơi với máy | Story 25 | 8 | T-26, T-31 | NOT_RUN |
| `AC-AI-02-03` | US-AI-02 — Chơi với máy | Story 25 | 8 | T-14, T-58 | NOT_RUN |
| `AC-AI-02-04` | US-AI-02 — Chơi với máy | Story 25 | 8 | T-26, T-31, T-33 | NOT_RUN |
| `AC-AI-03-01` | US-AI-03 — Kết thúc, bỏ dở và vào lại | Story 26 | 8 | T-26, T-31, T-33 | NOT_RUN |
| `AC-AI-03-02` | US-AI-03 — Kết thúc, bỏ dở và vào lại | Story 26 | 8 | T-10, T-26, T-31, T-33 | NOT_RUN |
| `AC-AI-03-03` | US-AI-03 — Kết thúc, bỏ dở và vào lại | Story 26 | 8 | T-26, T-60 | NOT_RUN |
| `AC-AI-03-04` | US-AI-03 — Kết thúc, bỏ dở và vào lại | Story 26 | 8 | T-31, T-33, T-55 | NOT_RUN |
| `AC-AI-04-01` | US-AI-04 — Sự cố máy cờ | Story 26 | 8 | T-26, T-31, T-33 | NOT_RUN |
| `AC-AI-04-02` | US-AI-04 — Sự cố máy cờ | Story 26 | 8 | T-31, T-33 | NOT_RUN |
| `AC-UI-01-01` | US-UI-01 — Thanh điều hướng | Story 6 | 2 | T-10, T-60 | NOT_RUN |
| `AC-UI-02-01` | US-UI-02 — Sảnh | Story 6 | 2 | T-10, T-60 | NOT_RUN |
| `AC-UI-02-02` | US-UI-02 — Sảnh | Story 6 | 2 | T-10 | NOT_RUN |
| `AC-UI-02-03` | US-UI-02 — Sảnh | Story 6 | 2 | T-10 | NOT_RUN |
| `AC-UI-03-01` | US-UI-03 — Năm trạng thái cho mọi màn hình | Story 4 | 1 | T-07, T-60 | NOT_RUN |
| `AC-UI-04-01` | US-UI-04 — Responsive | Story 4 | 1 | T-61 | NOT_RUN |
| `AC-UI-04-02` | US-UI-04 — Responsive | Story 4 | 1 | T-61, T-63 | NOT_RUN |
| `AC-UI-05-01` | US-UI-05 — Trợ năng | Story 4 | 1 | T-07, T-61 | NOT_RUN |
| `AC-UI-05-02` | US-UI-05 — Trợ năng | Story 4 | 1 | T-61 | NOT_RUN |
| `AC-UI-06-01` | US-UI-06 — Tính năng P2 hiển thị đúng quy tắc | Story 4 | 1 | T-60 | NOT_RUN |
| `AC-UI-06-02` | US-UI-06 — Tính năng P2 hiển thị đúng quy tắc | Story 4 | 1 | T-07, T-60 | NOT_RUN |

## 2. Yêu cầu phi chức năng (NFR) → cách kiểm → Task

| Mã | Nội dung | Task làm | Task kiểm |
|---|---|---|---|
| NFR-01 | Người xem nhận thế cờ mới dưới 100 ms (p95, mạng nội bộ) | T-27, T-30, T-50 | T-63 |
| NFR-02 | 50 kết nối đồng thời gồm 10 ván, nước đi p95 dưới 300 ms | T-27, T-30 | T-63 |
| NFR-03 | Chạy được trên Chrome, Edge, Firefox, Safari bản mới; từ 360 px | T-37, T-61 | T-37, T-63 |
| NFR-04 | Máy chủ quyết định; không lộ dữ liệu không có quyền; bí mật không ở trình duyệt | T-04, T-06, T-09, T-27, T-50 | T-63 |
| NFR-05 | Máy cờ đạt thời gian và sức mạnh theo cấp | T-14, T-31 | T-58 |
| NFR-06 | Chỉ tiếng Việt; không ghi hình, ghi âm | T-21, T-49, T-60 | T-62, T-63 |
| NFR-07 | Máy chủ khởi động lại thì ván thành gián đoạn, không treo | T-51 | T-63 |
| NFR-08 | Nhật ký vận hành có cấu trúc, điểm kiểm tra sức khoẻ, không ghi bí mật | T-06, T-27, T-31, T-42, T-51 | T-63 |
| NFR-09 | Lưu giữ dữ liệu: chat phòng xoá khi đóng, biên lai 24 giờ, nhật ký 14 ngày | T-06, T-09, T-48 | T-63 |
| NFR-10 | Tin chat, tên hiển thị, tên phòng hiển thị như chữ thuần | T-10, T-21, T-48, T-56 | T-63 |

## 3. Cổng kiểm chứng kỹ thuật (GATE)

| Cổng | Nội dung | Task | Trạng thái |
|---|---|---|---|
| GATE-GOOGLE | Google không tự liên kết cùng email; tài khoản bỏ dở không dùng được; một hồ sơ đăng nhập được hai cách | T-03, T-22, T-42 | NOT_RUN |
| GATE-OTP | Mã OTP 6 số, 180 giây, gửi lại 60 giây, giới hạn gần đúng với thư mặc định; chặn đổi email trực tiếp; phục hồi tài khoản dở | T-03, T-22, T-42 | NOT_RUN |
| GATE-MEDIA | Phát/nhận camera/micro theo từng người, thu hồi quyền, token cũ | T-35, T-49, T-59 | NOT_RUN |
| GATE-AI | Thời gian (p95), độ sâu, sức mạnh, ổn định của máy cờ | T-14, T-58 | NOT_RUN |
| GATE-PERFT | Đếm nước đi khớp nguồn đối chiếu độc lập (44, 1.920, 79.666, 3.290.240) | T-53 | NOT_RUN |
| GATE-LOAD | 50 kết nối, 10 ván; camera/micro quy mô nhỏ chỉ ghi số đo | T-63 | NOT_RUN |

## 4. Kịch bản bản chơi được (M1–M4) và demo D1–D10 → Epic → Task

| Kịch bản | Nội dung | Epic | Task chạy |
|---|---|---|---|
| M1 (bản chơi được) | Đăng ký ba bước bằng OTP thật, đăng nhập, đăng ký và đăng nhập bằng Google | 1 | T-34 |
| M2 (bản chơi được) | Tạo phòng, người thứ hai vào bằng mã và đường dẫn, hai ghế, Sẵn sàng | 2, 3 | T-34 |
| M3 (bản chơi được) | Hai người đánh online đến hết ván; nước sai bị từ chối | 4, 5 | T-34 |
| M4 (bản chơi được) | Đánh với máy ba cấp độ đến hết ván | 8 | T-34 |
| D1 | Đăng ký ba bước bằng OTP thật (hoặc bằng Google), vào Sảnh | 1 | T-62, T-64 |
| D2 | Tạo phòng 10 phút công khai, chọn tối đa 2 người xem | 2 | T-62, T-64 |
| D3 | Gửi đường dẫn/mã, mời bạn online | 3 | T-62, T-64 |
| D4 | Người xem vào sau khi ghế kín; người thứ ba bị từ chối | 6 | T-62, T-64 |
| D5 | Khoá phòng; người mới không vào được | 6 | T-62, T-64 |
| D6 | Sẵn sàng, đếm 3 giây, đánh đến chiếu hết | 2, 5 | T-62, T-64 |
| D7 | Camera/micro, chat Kênh Riêng và Chung | 7 | T-62, T-64 |
| D8 | Rời ghế rồi đánh với máy ba cấp (trước đó bị chặn) | 8 | T-62, T-64 |
| D9 | Ván mới, ngắt mạng một bên: 60 giây | 5 | T-62, T-64 |
| D10 | Đóng tab giữa ván máy; vào lại trong và sau 30 phút | 8 | T-62, T-64 |

## 5. 24 thành phần giao diện của giai đoạn 1 → Task dựng

| Thành phần | Task dựng | Task nối thật | Đủ 5 trạng thái ở |
|---|---|---|---|
| Màn hình Đăng nhập (`SCR-LOGIN`) | T-21 | T-25 | T-60 |
| Màn hình Đăng ký (ba bước) (`SCR-REGISTER`) | T-21 | T-25 | T-60 |
| Màn hình Thiết lập tài khoản Google (`SCR-ONBOARDING`) | T-21 | T-25 | T-60 |
| Màn hình Cài đặt hồ sơ (`SCR-PROFILE-SETTINGS`) | T-21 | T-25 | T-60 |
| Thanh điều hướng (`PANEL-NAVBAR`) | T-10 | T-28 | T-60 |
| Sảnh (`SCR-LOBBY`) | T-10 | T-28 | T-60 |
| Hộp thoại Tạo phòng (`MODAL-CREATE-ROOM`) | T-10 | T-28 | T-60 |
| Màn hình Phòng chờ (`SCR-WAITING-ROOM`) | T-11 | T-28 | T-60 |
| Hộp thoại Chia sẻ phòng (`MODAL-INVITE`) | T-11 | T-28, T-52 | T-60 |
| Màn hình Từ chối vào phòng (`SCR-ACCESS-DENIED`) | T-11 | T-28, T-46 | T-60 |
| Màn hình Ván đấu (`SCR-GAME-ROOM`) | T-24 | T-30, T-57 | T-60 |
| Khung Đề nghị hoà (`MODAL-DRAW-PROMPT`) | T-24 | T-57 | T-60 |
| Hộp xác nhận Đầu hàng (`MODAL-CONFIRM-RESIGN`) | T-24 | T-57 | T-60 |
| Hộp xác nhận Rời phòng khi đang đấu (`MODAL-CONFIRM-LEAVE`) | T-24 | T-57 | T-60 |
| Hộp Kết quả ván (`MODAL-MATCH-RESULT`) | T-24 | T-57 | T-60 |
| Lớp phủ Mất kết nối (`OVERLAY-RECONNECTING`) | T-24 | T-57 | T-60 |
| Hộp Cài đặt phòng (`MODAL-ROOM-SETTINGS`) | T-39 | T-46 | T-60 |
| Hộp xác nhận Đuổi người xem (`MODAL-CONFIRM-KICK`) | T-39 | T-46 | T-60 |
| Danh sách Người xem (`PANEL-SPECTATORS`) | T-39 | T-46, T-57 | T-60 |
| Khung Chat (`PANEL-CHAT`) | T-56 | T-56 | T-60 |
| Khung Camera và Micro (`PANEL-MEDIA`) | T-36 | T-59 | T-60 |
| Màn hình Bạn bè (`SCR-FRIENDS`) | T-40 | T-52 | T-60 |
| Hộp chọn Cấp độ và Phe (đánh với máy) (`MODAL-AI-SETUP`) | T-26 | T-33 | T-60 |
| Màn hình Đánh với máy (`SCR-AI-GAME`) | T-26 | T-33 | T-60 |

## 6. 54 mục yêu cầu người dùng → Story

| Mục yêu cầu | Story |
|---|---|
| US-AUTH-01 — Đăng ký bước 1: username và mật khẩu | Story 1 |
| US-AUTH-02 — Đăng ký bước 2: email và gửi OTP | Story 1 |
| US-AUTH-03 — Đăng ký bước 3: xác thực OTP, tạo tài khoản | Story 1 |
| US-AUTH-04 — Đăng nhập bằng username và mật khẩu | Story 2 |
| US-AUTH-05 — Hồ sơ cơ bản và đăng xuất | Story 3 |
| US-AUTH-06 — Chuyển hướng vào phòng sau đăng nhập | Story 9 |
| US-AUTH-07 — Đăng ký và đăng nhập bằng Google | Story 1 và Story 2 |
| US-ROOM-01 — Tạo phòng | Story 5 |
| US-ROOM-02 — Phòng chờ và ghế ngồi | Story 7 |
| US-ROOM-03 — Sẵn sàng và bắt đầu ván | Story 7 |
| US-ROOM-04 — Chia sẻ phòng bằng link và mã | Story 9 |
| US-ROOM-05 — Vào phòng bằng mã, link hoặc Sảnh | Story 8 |
| US-ROOM-06 — Đổi chỗ giữa ghế và người xem | Story 20 |
| US-ROOM-07 — Chế độ riêng tư và khoá phòng | Story 19 |
| US-ROOM-08 — Danh sách phòng công khai ở Sảnh | Story 19 |
| US-ROOM-09 — Đuổi người xem | Story 20 |
| US-ROOM-10 — Host rời, chuyển quyền, đóng phòng | Story 20 |
| US-ROOM-11 — Sau ván CASUAL: quay về phòng chờ | Story 20 |
| US-ROOM-12 — Màn hình từ chối truy cập | Story 8 |
| US-BOARD-01 — Hiển thị bàn cờ | Story 13 |
| US-BOARD-02 — Chọn quân và gợi ý ô đi bằng click | Story 14 |
| US-BOARD-03 — Kéo thả | Story 14 |
| US-BOARD-04 — Đánh dấu nước cuối và chiếu | Story 14 |
| US-BOARD-05 — Âm thanh | Story 14 |
| US-PLAY-01 — Đi nước qua mạng | Story 15 |
| US-PLAY-02 — Đồng hồ | Story 16 |
| US-PLAY-03 — Kết thúc ván và kết quả | Story 17 |
| US-PLAY-04 — Đầu hàng | Story 17 |
| US-PLAY-05 — Xin hoà | Story 17 |
| US-PLAY-06 — Rời phòng giữa ván | Story 18 |
| US-PLAY-07 — Mất kết nối và kết nối lại | Story 18 |
| US-PLAY-08 — Lặp thế, chiếu liên tục, không ăn quân | Story 17 |
| US-PLAY-09 — Người xem theo dõi trực tiếp | Story 21 |
| US-PLAY-10 — Bảng nước đi | Story 15 |
| US-CHAT-01 — Hai kênh chat | Story 22 |
| US-CHAT-02 — Giới hạn và bộ lọc từ cấm | Story 22 |
| US-MEDIA-01 — Camera và micro cho hai người chơi | Story 23 |
| US-MEDIA-02 — Người xem chỉ xem/nghe | Story 23 |
| US-MEDIA-03 — Mở nhiều tab | Story 24 |
| US-FRIEND-01 — Tìm người và gửi lời mời | Story 10 |
| US-FRIEND-02 — Nhận và trả lời lời mời | Story 10 |
| US-FRIEND-03 — Danh sách bạn và trạng thái | Story 11 |
| US-FRIEND-04 — Mời bạn bè online vào phòng | Story 12 |
| US-FRIEND-05 — Giới hạn | Story 10 |
| US-AI-01 — Chọn cấp độ và phe | Story 25 |
| US-AI-02 — Chơi với máy | Story 25 |
| US-AI-03 — Kết thúc, bỏ dở và vào lại | Story 26 |
| US-AI-04 — Sự cố máy cờ | Story 26 |
| US-UI-01 — Thanh điều hướng | Story 6 |
| US-UI-02 — Sảnh | Story 6 |
| US-UI-03 — Năm trạng thái cho mọi màn hình | Story 4 |
| US-UI-04 — Responsive | Story 4 |
| US-UI-05 — Trợ năng | Story 4 |
| US-UI-06 — Tính năng P2 hiển thị đúng quy tắc | Story 4 |
