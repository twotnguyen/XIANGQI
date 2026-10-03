# 08 · Ma trận truy vết và nghiệm thu P1/P2

**Bản đặc tả 04/10/2026 — chờ review bản viết; không phải báo cáo test đã chạy.** Nguồn luật [BA](../BA-SCOPE-DECISIONS.md), AC chuẩn ở [01](01-yeu-cau-chi-tiet.md), hợp đồng dùng chung ở [07](07-hop-dong-nghiep-vu.md), phương pháp ở [05](05-kiem-thu.md).

## 1. Độ phủ và cách đọc

- **81 US: 53 P1 + 28 P2; 280 AC có mã duy nhất.** Mã US/AC/TC là nhãn đặc tả, không phải key Jira.
- **37 thành phần: 23 P1 + 14 P2**, mỗi thành phần có điều kiện và kết quả năm trạng thái. Một thành phần P1 có thể có chức năng P2 bên trong; lấy phân kỳ của AC, không lấy toàn màn hình để kéo việc vào P1.
- `TC-…` đối ứng từng `AC-…`: nội dung AC là oracle (kết quả bắt buộc), không sao chép luật sang bảng test để tạo nguồn thứ hai. Nếu AC có nhiều nhánh, triển khai test tham số hoá cho **từng nhánh**, không lấy một ca đại diện rồi đánh dấu cả AC đạt.
- Toàn bộ kiểm thử hiện **NOT_RUN**. Số hàng là độ phủ **đặc tả**, không phải độ phủ code hoặc số test PASS.
- Mỗi lần chạy cần lưu: TC/AC, phiên bản mã, môi trường, fixture/đầu vào, bước, kết quả mong đợi từ AC, kết quả thực, log/ảnh/số đo, PASS/FAIL/BLOCKED. Không có bằng chứng thì không PASS.

## 2. Chuẩn bị kiểm thử theo nhóm

| Nhóm | Fixture và thao tác bắt buộc | Tầng |
|---|---|---|
| AUTH | Tài khoản mới/dở/đã hoàn tất; OTP đúng/sai/hết hạn; gián đoạn từng bước; hai phiên và hai yêu cầu đồng thời; nhập ngoài biên tên/mật khẩu | Tích hợp + E2E; nhà cung cấp thật ở cổng [05] |
| ROOM/FRIEND | A/B ngồi ghế, C/D xem, E thử vào; phòng N=0/1/2 và P2 N=5; đổi vai/quyền trong lúc lệnh đang chờ; trần 200/50 và yêu cầu chéo | Tích hợp nhiều client + E2E |
| BOARD/PLAY | Thế đầu, từng thế kết thúc [02], lệnh trùng/cũ/ngoài lượt; điều khiển thời gian ở trước/tại/sau hạn, kết nối lại và lỗi CSDL | Đơn vị + tích hợp + E2E |
| CHAT/MEDIA/SOC | Cặp ghế cũ/mới, người xem, bạn/cựu bạn; gửi vượt 200 ký tự/5 tin; cấp/từ chối thiết bị, đổi chia sẻ, nhận track bằng người không có quyền | Tích hợp + E2E + kiểm tay thiết bị |
| AI | Mỗi cấp × phe, hàng đợi bận, giết tiến trình, kết quả tìm cũ, Thử lại từng loại lỗi, mất kết nối trước/sau 30 phút | Đơn vị + tích hợp + đo thật |
| UI | 360/390/1366/1920 px; bàn phím/trình đọc; giảm chuyển động; năm trạng thái và hai theme ở P2 | E2E + kiểm tay trợ năng |
| RANK/CAS | Biên Elo ±100/±400, vé 0/10/60 giây, cặp đủ giới hạn; K ở ván 30/31, sàn 100, tròn .5; đề nghị đồng thời với kết thúc | Đơn vị + tích hợp + E2E |
| HIS | Tài khoản chủ ván/người ngoài/Khách, ván không nước/có đi lại/gián đoạn; con trỏ đầu/giữa/cuối và tệp xuất thật | Tích hợp + E2E + nhập công cụ ngoài |
| DEMO | DEMO_MODE bật/tắt, gọi trực tiếp ngoài UI; đổi tab khi đang phát, kết quả máy đang tìm/cũ | Tích hợp + kiểm tay |

Đầu vào không hợp lệ hoặc thiếu quyền phải kiểm ở máy chủ, không chỉ xác nhận nút bị ẩn. Với thao tác có tác động: luôn thử gửi hai lần và mất ACK theo [07] §3. Không thử OTP/mật khẩu thật hoặc môi trường người dùng đang dùng.

## 3. Từng US/AC → mục kiểm

| US | P | Nguồn | AC | TC đối ứng | Trạng thái |
|---|---|---|---|---|---|
| US-AUTH-01 | P1 | BA 1.1, 1.4 | AC-AUTH-01-01 | TC-AUTH-01-01 | NOT_RUN |
| US-AUTH-01 | P1 | BA 1.1, 1.4 | AC-AUTH-01-02 | TC-AUTH-01-02 | NOT_RUN |
| US-AUTH-01 | P1 | BA 1.1, 1.4 | AC-AUTH-01-03 | TC-AUTH-01-03 | NOT_RUN |
| US-AUTH-01 | P1 | BA 1.1, 1.4 | AC-AUTH-01-04 | TC-AUTH-01-04 | NOT_RUN |
| US-AUTH-02 | P1 | BA 1.1, 1.5 | AC-AUTH-02-01 | TC-AUTH-02-01 | NOT_RUN |
| US-AUTH-02 | P1 | BA 1.1, 1.5 | AC-AUTH-02-02 | TC-AUTH-02-02 | NOT_RUN |
| US-AUTH-02 | P1 | BA 1.1, 1.5 | AC-AUTH-02-03 | TC-AUTH-02-03 | NOT_RUN |
| US-AUTH-03 | P1 | BA 1.1, 1.5 | AC-AUTH-03-01 | TC-AUTH-03-01 | NOT_RUN |
| US-AUTH-03 | P1 | BA 1.1, 1.5 | AC-AUTH-03-02 | TC-AUTH-03-02 | NOT_RUN |
| US-AUTH-03 | P1 | BA 1.1, 1.5 | AC-AUTH-03-03 | TC-AUTH-03-03 | NOT_RUN |
| US-AUTH-03 | P1 | BA 1.1, 1.5 | AC-AUTH-03-04 | TC-AUTH-03-04 | NOT_RUN |
| US-AUTH-03 | P1 | BA 1.1, 1.5 | AC-AUTH-03-05 | TC-AUTH-03-05 | NOT_RUN |
| US-AUTH-03 | P1 | BA 1.1, 1.5 | AC-AUTH-03-06 | TC-AUTH-03-06 | NOT_RUN |
| US-AUTH-04 | P1 | BA 1.4, 1.8 | AC-AUTH-04-01 | TC-AUTH-04-01 | NOT_RUN |
| US-AUTH-04 | P1 | BA 1.4, 1.8 | AC-AUTH-04-02 | TC-AUTH-04-02 | NOT_RUN |
| US-AUTH-04 | P1 | BA 1.4, 1.8 | AC-AUTH-04-03 | TC-AUTH-04-03 | NOT_RUN |
| US-AUTH-04 | P1 | BA 1.4, 1.8 | AC-AUTH-04-04 | TC-AUTH-04-04 | NOT_RUN |
| US-AUTH-04 | P1 | BA 1.4, 1.8 | AC-AUTH-04-05 | TC-AUTH-04-05 | NOT_RUN |
| US-AUTH-05 | P1 | BA 1.4, 1.6 | AC-AUTH-05-01 | TC-AUTH-05-01 | NOT_RUN |
| US-AUTH-05 | P1 | BA 1.4, 1.6 | AC-AUTH-05-02 | TC-AUTH-05-02 | NOT_RUN |
| US-AUTH-05 | P1 | BA 1.4, 1.6 | AC-AUTH-05-03 | TC-AUTH-05-03 | NOT_RUN |
| US-AUTH-05 | P1 | BA 1.4, 1.6 | AC-AUTH-05-04 | TC-AUTH-05-04 | NOT_RUN |
| US-AUTH-05 | P1 | BA 1.4, 1.6 | AC-AUTH-05-05 | TC-AUTH-05-05 | NOT_RUN |
| US-AUTH-06 | P1 | BA 2.4 | AC-AUTH-06-01 | TC-AUTH-06-01 | NOT_RUN |
| US-AUTH-06 | P1 | BA 2.4 | AC-AUTH-06-02 | TC-AUTH-06-02 | NOT_RUN |
| US-ROOM-01 | P1 | BA 2.7, 2.8 | AC-ROOM-01-01 | TC-ROOM-01-01 | NOT_RUN |
| US-ROOM-01 | P1 | BA 2.7, 2.8 | AC-ROOM-01-02 | TC-ROOM-01-02 | NOT_RUN |
| US-ROOM-01 | P1 | BA 2.7, 2.8 | AC-ROOM-01-03 | TC-ROOM-01-03 | NOT_RUN |
| US-ROOM-01 | P1 | BA 2.7, 2.8 | AC-ROOM-01-04 | TC-ROOM-01-04 | NOT_RUN |
| US-ROOM-02 | P1 | BA 2.3 | AC-ROOM-02-01 | TC-ROOM-02-01 | NOT_RUN |
| US-ROOM-02 | P1 | BA 2.3 | AC-ROOM-02-02 | TC-ROOM-02-02 | NOT_RUN |
| US-ROOM-02 | P1 | BA 2.3 | AC-ROOM-02-03 | TC-ROOM-02-03 | NOT_RUN |
| US-ROOM-03 | P1 | BA 2.3 | AC-ROOM-03-01 | TC-ROOM-03-01 | NOT_RUN |
| US-ROOM-03 | P1 | BA 2.3 | AC-ROOM-03-02 | TC-ROOM-03-02 | NOT_RUN |
| US-ROOM-03 | P1 | BA 2.3 | AC-ROOM-03-03 | TC-ROOM-03-03 | NOT_RUN |
| US-ROOM-04 | P1 | BA 2.2, 2.8; QR là P2 | AC-ROOM-04-01 | TC-ROOM-04-01 | NOT_RUN |
| US-ROOM-04 | P1 | BA 2.2, 2.8; QR là P2 | AC-ROOM-04-02 | TC-ROOM-04-02 | NOT_RUN |
| US-ROOM-04 | P1 | BA 2.2, 2.8; QR là P2 | AC-ROOM-04-03 | TC-ROOM-04-03 | NOT_RUN |
| US-ROOM-05 | P1 | BA 2.6, 2.8 | AC-ROOM-05-01 | TC-ROOM-05-01 | NOT_RUN |
| US-ROOM-05 | P1 | BA 2.6, 2.8 | AC-ROOM-05-02 | TC-ROOM-05-02 | NOT_RUN |
| US-ROOM-05 | P1 | BA 2.6, 2.8 | AC-ROOM-05-03 | TC-ROOM-05-03 | NOT_RUN |
| US-ROOM-05 | P1 | BA 2.6, 2.8 | AC-ROOM-05-04 | TC-ROOM-05-04 | NOT_RUN |
| US-ROOM-06 | P1 | BA 2.8 | AC-ROOM-06-01 | TC-ROOM-06-01 | NOT_RUN |
| US-ROOM-06 | P1 | BA 2.8 | AC-ROOM-06-02 | TC-ROOM-06-02 | NOT_RUN |
| US-ROOM-06 | P1 | BA 2.8 | AC-ROOM-06-03 | TC-ROOM-06-03 | NOT_RUN |
| US-ROOM-06 | P1 | BA 2.8 | AC-ROOM-06-04 | TC-ROOM-06-04 | NOT_RUN |
| US-ROOM-06 | P1 | BA 2.8 | AC-ROOM-06-05 | TC-ROOM-06-05 | NOT_RUN |
| US-ROOM-07 | P1 | BA 2.7, 4.3 | AC-ROOM-07-01 | TC-ROOM-07-01 | NOT_RUN |
| US-ROOM-07 | P1 | BA 2.7, 4.3 | AC-ROOM-07-02 | TC-ROOM-07-02 | NOT_RUN |
| US-ROOM-07 | P1 | BA 2.7, 4.3 | AC-ROOM-07-03 | TC-ROOM-07-03 | NOT_RUN |
| US-ROOM-07 | P1 | BA 2.7, 4.3 | AC-ROOM-07-04 | TC-ROOM-07-04 | NOT_RUN |
| US-ROOM-07 | P1 | BA 2.7, 4.3 | AC-ROOM-07-05 | TC-ROOM-07-05 | NOT_RUN |
| US-ROOM-07 | P1 | BA 2.7, 4.3 | AC-ROOM-07-06 | TC-ROOM-07-06 | NOT_RUN |
| US-ROOM-08 | P1 | BA 2.0, 2.7 | AC-ROOM-08-01 | TC-ROOM-08-01 | NOT_RUN |
| US-ROOM-08 | P1 | BA 2.0, 2.7 | AC-ROOM-08-02 | TC-ROOM-08-02 | NOT_RUN |
| US-ROOM-08 | P1 | BA 2.0, 2.7 | AC-ROOM-08-03 | TC-ROOM-08-03 | NOT_RUN |
| US-ROOM-08 | P1 | BA 2.0, 2.7 | AC-ROOM-08-04 | TC-ROOM-08-04 | NOT_RUN |
| US-ROOM-09 | P1 | BA 4.2 | AC-ROOM-09-01 | TC-ROOM-09-01 | NOT_RUN |
| US-ROOM-09 | P1 | BA 4.2 | AC-ROOM-09-02 | TC-ROOM-09-02 | NOT_RUN |
| US-ROOM-09 | P1 | BA 4.2 | AC-ROOM-09-03 | TC-ROOM-09-03 | NOT_RUN |
| US-ROOM-10 | P1 | BA 2.3 | AC-ROOM-10-01 | TC-ROOM-10-01 | NOT_RUN |
| US-ROOM-10 | P1 | BA 2.3 | AC-ROOM-10-02 | TC-ROOM-10-02 | NOT_RUN |
| US-ROOM-10 | P1 | BA 2.3 | AC-ROOM-10-03 | TC-ROOM-10-03 | NOT_RUN |
| US-ROOM-11 | P1 | BA 2.3 mục 8 | AC-ROOM-11-01 | TC-ROOM-11-01 | NOT_RUN |
| US-ROOM-11 | P1 | BA 2.3 mục 8 | AC-ROOM-11-02 | TC-ROOM-11-02 | NOT_RUN |
| US-ROOM-11 | P1 | BA 2.3 mục 8 | AC-ROOM-11-03 | TC-ROOM-11-03 | NOT_RUN |
| US-ROOM-11 | P1 | BA 2.3 mục 8 | AC-ROOM-11-04 | TC-ROOM-11-04 | NOT_RUN |
| US-ROOM-12 | P1 | DANH-MUC mục 14 | AC-ROOM-12-01 | TC-ROOM-12-01 | NOT_RUN |
| US-BOARD-01 | P1 | BA 3.1; [02](02-luat-co-tuong.md) mục 1 | AC-BOARD-01-01 | TC-BOARD-01-01 | NOT_RUN |
| US-BOARD-01 | P1 | BA 3.1; [02](02-luat-co-tuong.md) mục 1 | AC-BOARD-01-02 | TC-BOARD-01-02 | NOT_RUN |
| US-BOARD-01 | P1 | BA 3.1; [02](02-luat-co-tuong.md) mục 1 | AC-BOARD-01-03 | TC-BOARD-01-03 | NOT_RUN |
| US-BOARD-02 | P1 | BA 3.4 | AC-BOARD-02-01 | TC-BOARD-02-01 | NOT_RUN |
| US-BOARD-02 | P1 | BA 3.4 | AC-BOARD-02-02 | TC-BOARD-02-02 | NOT_RUN |
| US-BOARD-02 | P1 | BA 3.4 | AC-BOARD-02-03 | TC-BOARD-02-03 | NOT_RUN |
| US-BOARD-03 | P1 | BA 3.4 | AC-BOARD-03-01 | TC-BOARD-03-01 | NOT_RUN |
| US-BOARD-03 | P1 | BA 3.4 | AC-BOARD-03-02 | TC-BOARD-03-02 | NOT_RUN |
| US-BOARD-04 | P1 | BA 3.4; DESIGN §7.4 | AC-BOARD-04-01 | TC-BOARD-04-01 | NOT_RUN |
| US-BOARD-04 | P1 | BA 3.4; DESIGN §7.4 | AC-BOARD-04-02 | TC-BOARD-04-02 | NOT_RUN |
| US-BOARD-04 | P1 | BA 3.4; DESIGN §7.4 | AC-BOARD-04-03 | TC-BOARD-04-03 | NOT_RUN |
| US-BOARD-05 | P1 | BA 3.4 | AC-BOARD-05-01 | TC-BOARD-05-01 | NOT_RUN |
| US-BOARD-05 | P1 | BA 3.4 | AC-BOARD-05-02 | TC-BOARD-05-02 | NOT_RUN |
| US-PLAY-01 | P1 | BA 3.3; [04] mục 4 | AC-PLAY-01-01 | TC-PLAY-01-01 | NOT_RUN |
| US-PLAY-01 | P1 | BA 3.3; [04] mục 4 | AC-PLAY-01-02 | TC-PLAY-01-02 | NOT_RUN |
| US-PLAY-01 | P1 | BA 3.3; [04] mục 4 | AC-PLAY-01-03 | TC-PLAY-01-03 | NOT_RUN |
| US-PLAY-01 | P1 | BA 3.3; [04] mục 4 | AC-PLAY-01-04 | TC-PLAY-01-04 | NOT_RUN |
| US-PLAY-02 | P1 | BA 2.1, 3.3 | AC-PLAY-02-01 | TC-PLAY-02-01 | NOT_RUN |
| US-PLAY-02 | P1 | BA 2.1, 3.3 | AC-PLAY-02-02 | TC-PLAY-02-02 | NOT_RUN |
| US-PLAY-02 | P1 | BA 2.1, 3.3 | AC-PLAY-02-03 | TC-PLAY-02-03 | NOT_RUN |
| US-PLAY-03 | P1 | BA 3.3; [02] mục 3.3 | AC-PLAY-03-01 | TC-PLAY-03-01 | NOT_RUN |
| US-PLAY-03 | P1 | BA 3.3; [02] mục 3.3 | AC-PLAY-03-02 | TC-PLAY-03-02 | NOT_RUN |
| US-PLAY-03 | P1 | BA 3.3; [02] mục 3.3 | AC-PLAY-03-03 | TC-PLAY-03-03 | NOT_RUN |
| US-PLAY-04 | P1 | BA 3.3 | AC-PLAY-04-01 | TC-PLAY-04-01 | NOT_RUN |
| US-PLAY-05 | P1 | BA 3.3, 3.5, 3.6 | AC-PLAY-05-01 | TC-PLAY-05-01 | NOT_RUN |
| US-PLAY-05 | P1 | BA 3.3, 3.5, 3.6 | AC-PLAY-05-02 | TC-PLAY-05-02 | NOT_RUN |
| US-PLAY-05 | P1 | BA 3.3, 3.5, 3.6 | AC-PLAY-05-03 | TC-PLAY-05-03 | NOT_RUN |
| US-PLAY-05 | P1 | BA 3.3, 3.5, 3.6 | AC-PLAY-05-04 | TC-PLAY-05-04 | NOT_RUN |
| US-PLAY-06 | P1 | BA 2.3, DANH-MUC modal 13 | AC-PLAY-06-01 | TC-PLAY-06-01 | NOT_RUN |
| US-PLAY-07 | P1 | BA 8.3; DANH-MUC overlay 2 | AC-PLAY-07-01 | TC-PLAY-07-01 | NOT_RUN |
| US-PLAY-07 | P1 | BA 8.3; DANH-MUC overlay 2 | AC-PLAY-07-02 | TC-PLAY-07-02 | NOT_RUN |
| US-PLAY-07 | P1 | BA 8.3; DANH-MUC overlay 2 | AC-PLAY-07-03 | TC-PLAY-07-03 | NOT_RUN |
| US-PLAY-07 | P1 | BA 8.3; DANH-MUC overlay 2 | AC-PLAY-07-04 | TC-PLAY-07-04 | NOT_RUN |
| US-PLAY-08 | P1 | BA 3.5; [02] mục 4, 5 | AC-PLAY-08-01 | TC-PLAY-08-01 | NOT_RUN |
| US-PLAY-08 | P1 | BA 3.5; [02] mục 4, 5 | AC-PLAY-08-02 | TC-PLAY-08-02 | NOT_RUN |
| US-PLAY-09 | P1 | BA 4.1, 4.3 | AC-PLAY-09-01 | TC-PLAY-09-01 | NOT_RUN |
| US-PLAY-09 | P1 | BA 4.1, 4.3 | AC-PLAY-09-02 | TC-PLAY-09-02 | NOT_RUN |
| US-PLAY-09 | P1 | BA 4.1, 4.3 | AC-PLAY-09-03 | TC-PLAY-09-03 | NOT_RUN |
| US-PLAY-10 | P1 | [02] mục 7 | AC-PLAY-10-01 | TC-PLAY-10-01 | NOT_RUN |
| US-CHAT-01 | P1 | BA 5.3 | AC-CHAT-01-01 | TC-CHAT-01-01 | NOT_RUN |
| US-CHAT-01 | P1 | BA 5.3 | AC-CHAT-01-02 | TC-CHAT-01-02 | NOT_RUN |
| US-CHAT-01 | P1 | BA 5.3 | AC-CHAT-01-03 | TC-CHAT-01-03 | NOT_RUN |
| US-CHAT-02 | P1 | BA 5.3 | AC-CHAT-02-01 | TC-CHAT-02-01 | NOT_RUN |
| US-CHAT-02 | P1 | BA 5.3 | AC-CHAT-02-02 | TC-CHAT-02-02 | NOT_RUN |
| US-CHAT-02 | P1 | BA 5.3 | AC-CHAT-02-03 | TC-CHAT-02-03 | NOT_RUN |
| US-MEDIA-01 | P1 | BA 4.1, 5.4 | AC-MEDIA-01-01 | TC-MEDIA-01-01 | NOT_RUN |
| US-MEDIA-01 | P1 | BA 4.1, 5.4 | AC-MEDIA-01-02 | TC-MEDIA-01-02 | NOT_RUN |
| US-MEDIA-01 | P1 | BA 4.1, 5.4 | AC-MEDIA-01-03 | TC-MEDIA-01-03 | NOT_RUN |
| US-MEDIA-01 | P1 | BA 4.1, 5.4 | AC-MEDIA-01-04 | TC-MEDIA-01-04 | NOT_RUN |
| US-MEDIA-02 | P1 | BA 4.1 | AC-MEDIA-02-01 | TC-MEDIA-02-01 | NOT_RUN |
| US-MEDIA-02 | P1 | BA 4.1 | AC-MEDIA-02-02 | TC-MEDIA-02-02 | NOT_RUN |
| US-MEDIA-03 | P1 | BA 1.8 | AC-MEDIA-03-01 | TC-MEDIA-03-01 | NOT_RUN |
| US-FRIEND-01 | P1 | BA 5.5 | AC-FRIEND-01-01 | TC-FRIEND-01-01 | NOT_RUN |
| US-FRIEND-01 | P1 | BA 5.5 | AC-FRIEND-01-02 | TC-FRIEND-01-02 | NOT_RUN |
| US-FRIEND-02 | P1 | BA 5.5 | AC-FRIEND-02-01 | TC-FRIEND-02-01 | NOT_RUN |
| US-FRIEND-02 | P1 | BA 5.5 | AC-FRIEND-02-02 | TC-FRIEND-02-02 | NOT_RUN |
| US-FRIEND-03 | P1 | BA 2.5, 5.5 | AC-FRIEND-03-01 | TC-FRIEND-03-01 | NOT_RUN |
| US-FRIEND-03 | P1 | BA 2.5, 5.5 | AC-FRIEND-03-02 | TC-FRIEND-03-02 | NOT_RUN |
| US-FRIEND-03 | P1 | BA 2.5, 5.5 | AC-FRIEND-03-03 | TC-FRIEND-03-03 | NOT_RUN |
| US-FRIEND-04 | P1 | BA 2.5 | AC-FRIEND-04-01 | TC-FRIEND-04-01 | NOT_RUN |
| US-FRIEND-04 | P1 | BA 2.5 | AC-FRIEND-04-02 | TC-FRIEND-04-02 | NOT_RUN |
| US-FRIEND-04 | P1 | BA 2.5 | AC-FRIEND-04-03 | TC-FRIEND-04-03 | NOT_RUN |
| US-FRIEND-04 | P1 | BA 2.5 | AC-FRIEND-04-04 | TC-FRIEND-04-04 | NOT_RUN |
| US-FRIEND-05 | P1 | BA 5.5 | AC-FRIEND-05-01 | TC-FRIEND-05-01 | NOT_RUN |
| US-FRIEND-05 | P1 | BA 5.5 | AC-FRIEND-05-02 | TC-FRIEND-05-02 | NOT_RUN |
| US-AI-01 | P1 | BA 6.1, 6.3 | AC-AI-01-01 | TC-AI-01-01 | NOT_RUN |
| US-AI-01 | P1 | BA 6.1, 6.3 | AC-AI-01-02 | TC-AI-01-02 | NOT_RUN |
| US-AI-01 | P1 | BA 6.1, 6.3 | AC-AI-01-03 | TC-AI-01-03 | NOT_RUN |
| US-AI-02 | P1 | BA 6.1, 6.3; [02] mục 9 | AC-AI-02-01 | TC-AI-02-01 | NOT_RUN |
| US-AI-02 | P1 | BA 6.1, 6.3; [02] mục 9 | AC-AI-02-02 | TC-AI-02-02 | NOT_RUN |
| US-AI-02 | P1 | BA 6.1, 6.3; [02] mục 9 | AC-AI-02-03 | TC-AI-02-03 | NOT_RUN |
| US-AI-02 | P1 | BA 6.1, 6.3; [02] mục 9 | AC-AI-02-04 | TC-AI-02-04 | NOT_RUN |
| US-AI-03 | P1 | BA 6.3 | AC-AI-03-01 | TC-AI-03-01 | NOT_RUN |
| US-AI-03 | P1 | BA 6.3 | AC-AI-03-02 | TC-AI-03-02 | NOT_RUN |
| US-AI-03 | P1 | BA 6.3 | AC-AI-03-03 | TC-AI-03-03 | NOT_RUN |
| US-AI-03 | P1 | BA 6.3 | AC-AI-03-04 | TC-AI-03-04 | NOT_RUN |
| US-AI-04 | P1 | BA 6.1 | AC-AI-04-01 | TC-AI-04-01 | NOT_RUN |
| US-AI-04 | P1 | BA 6.1 | AC-AI-04-02 | TC-AI-04-02 | NOT_RUN |
| US-UI-01 | P1 | DANH-MUC panel 1 | AC-UI-01-01 | TC-UI-01-01 | NOT_RUN |
| US-UI-02 | P1 | BA 2.0, Phần 11 | AC-UI-02-01 | TC-UI-02-01 | NOT_RUN |
| US-UI-02 | P1 | BA 2.0, Phần 11 | AC-UI-02-02 | TC-UI-02-02 | NOT_RUN |
| US-UI-02 | P1 | BA 2.0, Phần 11 | AC-UI-02-03 | TC-UI-02-03 | NOT_RUN |
| US-UI-03 | P1 | DANH-MUC §2 | AC-UI-03-01 | TC-UI-03-01 | NOT_RUN |
| US-UI-04 | P1 | BA 10.1 | AC-UI-04-01 | TC-UI-04-01 | NOT_RUN |
| US-UI-04 | P1 | BA 10.1 | AC-UI-04-02 | TC-UI-04-02 | NOT_RUN |
| US-UI-05 | P1 | AGENTS §6; DESIGN | AC-UI-05-01 | TC-UI-05-01 | NOT_RUN |
| US-UI-05 | P1 | AGENTS §6; DESIGN | AC-UI-05-02 | TC-UI-05-02 | NOT_RUN |
| US-UI-06 | P1 | DANH-MUC §7 | AC-UI-06-01 | TC-UI-06-01 | NOT_RUN |
| US-UI-06 | P1 | DANH-MUC §7 | AC-UI-06-02 | TC-UI-06-02 | NOT_RUN |
| US-AUTH-P2-01 | P2 | BA 1.3 | AC-AUTH-P2-01-01 | TC-AUTH-P2-01-01 | NOT_RUN |
| US-AUTH-P2-01 | P2 | BA 1.3 | AC-AUTH-P2-01-02 | TC-AUTH-P2-01-02 | NOT_RUN |
| US-AUTH-P2-01 | P2 | BA 1.3 | AC-AUTH-P2-01-03 | TC-AUTH-P2-01-03 | NOT_RUN |
| US-AUTH-P2-01 | P2 | BA 1.3 | AC-AUTH-P2-01-04 | TC-AUTH-P2-01-04 | NOT_RUN |
| US-AUTH-P2-01 | P2 | BA 1.3 | AC-AUTH-P2-01-05 | TC-AUTH-P2-01-05 | NOT_RUN |
| US-AUTH-P2-02 | P2 | BA 1.2 | AC-AUTH-P2-02-01 | TC-AUTH-P2-02-01 | NOT_RUN |
| US-AUTH-P2-02 | P2 | BA 1.2 | AC-AUTH-P2-02-02 | TC-AUTH-P2-02-02 | NOT_RUN |
| US-AUTH-P2-02 | P2 | BA 1.2 | AC-AUTH-P2-02-03 | TC-AUTH-P2-02-03 | NOT_RUN |
| US-AUTH-P2-02 | P2 | BA 1.2 | AC-AUTH-P2-02-04 | TC-AUTH-P2-02-04 | NOT_RUN |
| US-AUTH-P2-02 | P2 | BA 1.2 | AC-AUTH-P2-02-05 | TC-AUTH-P2-02-05 | NOT_RUN |
| US-AUTH-P2-03 | P2 | BA 1.7, 1.5 | AC-AUTH-P2-03-01 | TC-AUTH-P2-03-01 | NOT_RUN |
| US-AUTH-P2-03 | P2 | BA 1.7, 1.5 | AC-AUTH-P2-03-02 | TC-AUTH-P2-03-02 | NOT_RUN |
| US-AUTH-P2-03 | P2 | BA 1.7, 1.5 | AC-AUTH-P2-03-03 | TC-AUTH-P2-03-03 | NOT_RUN |
| US-AUTH-P2-03 | P2 | BA 1.7, 1.5 | AC-AUTH-P2-03-04 | TC-AUTH-P2-03-04 | NOT_RUN |
| US-AUTH-P2-03 | P2 | BA 1.7, 1.5 | AC-AUTH-P2-03-05 | TC-AUTH-P2-03-05 | NOT_RUN |
| US-AUTH-P2-04 | P2 | BA 1.6, 1.4 | AC-AUTH-P2-04-01 | TC-AUTH-P2-04-01 | NOT_RUN |
| US-AUTH-P2-04 | P2 | BA 1.6, 1.4 | AC-AUTH-P2-04-02 | TC-AUTH-P2-04-02 | NOT_RUN |
| US-AUTH-P2-04 | P2 | BA 1.6, 1.4 | AC-AUTH-P2-04-03 | TC-AUTH-P2-04-03 | NOT_RUN |
| US-AUTH-P2-04 | P2 | BA 1.6, 1.4 | AC-AUTH-P2-04-04 | TC-AUTH-P2-04-04 | NOT_RUN |
| US-AUTH-P2-04 | P2 | BA 1.6, 1.4 | AC-AUTH-P2-04-05 | TC-AUTH-P2-04-05 | NOT_RUN |
| US-RANK-01 | P2 | BA 7.1, 7.2 | AC-RANK-01-01 | TC-RANK-01-01 | NOT_RUN |
| US-RANK-01 | P2 | BA 7.1, 7.2 | AC-RANK-01-02 | TC-RANK-01-02 | NOT_RUN |
| US-RANK-01 | P2 | BA 7.1, 7.2 | AC-RANK-01-03 | TC-RANK-01-03 | NOT_RUN |
| US-RANK-01 | P2 | BA 7.1, 7.2 | AC-RANK-01-04 | TC-RANK-01-04 | NOT_RUN |
| US-RANK-01 | P2 | BA 7.1, 7.2 | AC-RANK-01-05 | TC-RANK-01-05 | NOT_RUN |
| US-RANK-02 | P2 | BA 8.1, 7.2 | AC-RANK-02-01 | TC-RANK-02-01 | NOT_RUN |
| US-RANK-02 | P2 | BA 8.1, 7.2 | AC-RANK-02-02 | TC-RANK-02-02 | NOT_RUN |
| US-RANK-02 | P2 | BA 8.1, 7.2 | AC-RANK-02-03 | TC-RANK-02-03 | NOT_RUN |
| US-RANK-02 | P2 | BA 8.1, 7.2 | AC-RANK-02-04 | TC-RANK-02-04 | NOT_RUN |
| US-RANK-02 | P2 | BA 8.1, 7.2 | AC-RANK-02-05 | TC-RANK-02-05 | NOT_RUN |
| US-RANK-03 | P2 | BA 7.1, 7.3 | AC-RANK-03-01 | TC-RANK-03-01 | NOT_RUN |
| US-RANK-03 | P2 | BA 7.1, 7.3 | AC-RANK-03-02 | TC-RANK-03-02 | NOT_RUN |
| US-RANK-03 | P2 | BA 7.1, 7.3 | AC-RANK-03-03 | TC-RANK-03-03 | NOT_RUN |
| US-RANK-03 | P2 | BA 7.1, 7.3 | AC-RANK-03-04 | TC-RANK-03-04 | NOT_RUN |
| US-RANK-03 | P2 | BA 7.1, 7.3 | AC-RANK-03-05 | TC-RANK-03-05 | NOT_RUN |
| US-RANK-04 | P2 | BA 7.1 | AC-RANK-04-01 | TC-RANK-04-01 | NOT_RUN |
| US-RANK-04 | P2 | BA 7.1 | AC-RANK-04-02 | TC-RANK-04-02 | NOT_RUN |
| US-RANK-04 | P2 | BA 7.1 | AC-RANK-04-03 | TC-RANK-04-03 | NOT_RUN |
| US-RANK-04 | P2 | BA 7.1 | AC-RANK-04-04 | TC-RANK-04-04 | NOT_RUN |
| US-RANK-04 | P2 | BA 7.1 | AC-RANK-04-05 | TC-RANK-04-05 | NOT_RUN |
| US-RANK-05 | P2 | BA 8.3 | AC-RANK-05-01 | TC-RANK-05-01 | NOT_RUN |
| US-RANK-05 | P2 | BA 8.3 | AC-RANK-05-02 | TC-RANK-05-02 | NOT_RUN |
| US-RANK-05 | P2 | BA 8.3 | AC-RANK-05-03 | TC-RANK-05-03 | NOT_RUN |
| US-RANK-05 | P2 | BA 8.3 | AC-RANK-05-04 | TC-RANK-05-04 | NOT_RUN |
| US-RANK-06 | P2 | BA 5.4 | AC-RANK-06-01 | TC-RANK-06-01 | NOT_RUN |
| US-RANK-06 | P2 | BA 5.4 | AC-RANK-06-02 | TC-RANK-06-02 | NOT_RUN |
| US-RANK-06 | P2 | BA 5.4 | AC-RANK-06-03 | TC-RANK-06-03 | NOT_RUN |
| US-RANK-06 | P2 | BA 5.4 | AC-RANK-06-04 | TC-RANK-06-04 | NOT_RUN |
| US-CAS-01 | P2 | BA 2.0, 2.1 | AC-CAS-01-01 | TC-CAS-01-01 | NOT_RUN |
| US-CAS-01 | P2 | BA 2.0, 2.1 | AC-CAS-01-02 | TC-CAS-01-02 | NOT_RUN |
| US-CAS-01 | P2 | BA 2.0, 2.1 | AC-CAS-01-03 | TC-CAS-01-03 | NOT_RUN |
| US-CAS-01 | P2 | BA 2.0, 2.1 | AC-CAS-01-04 | TC-CAS-01-04 | NOT_RUN |
| US-CAS-02 | P2 | BA 3.2, 3.6 | AC-CAS-02-01 | TC-CAS-02-01 | NOT_RUN |
| US-CAS-02 | P2 | BA 3.2, 3.6 | AC-CAS-02-02 | TC-CAS-02-02 | NOT_RUN |
| US-CAS-02 | P2 | BA 3.2, 3.6 | AC-CAS-02-03 | TC-CAS-02-03 | NOT_RUN |
| US-CAS-02 | P2 | BA 3.2, 3.6 | AC-CAS-02-04 | TC-CAS-02-04 | NOT_RUN |
| US-CAS-02 | P2 | BA 3.2, 3.6 | AC-CAS-02-05 | TC-CAS-02-05 | NOT_RUN |
| US-CAS-03 | P2 | BA 2.3, 3.6 | AC-CAS-03-01 | TC-CAS-03-01 | NOT_RUN |
| US-CAS-03 | P2 | BA 2.3, 3.6 | AC-CAS-03-02 | TC-CAS-03-02 | NOT_RUN |
| US-CAS-03 | P2 | BA 2.3, 3.6 | AC-CAS-03-03 | TC-CAS-03-03 | NOT_RUN |
| US-CAS-03 | P2 | BA 2.3, 3.6 | AC-CAS-03-04 | TC-CAS-03-04 | NOT_RUN |
| US-CAS-04 | P2 | BA 3.3, 2.3 | AC-CAS-04-01 | TC-CAS-04-01 | NOT_RUN |
| US-CAS-04 | P2 | BA 3.3, 2.3 | AC-CAS-04-02 | TC-CAS-04-02 | NOT_RUN |
| US-CAS-04 | P2 | BA 3.3, 2.3 | AC-CAS-04-03 | TC-CAS-04-03 | NOT_RUN |
| US-CAS-04 | P2 | BA 3.3, 2.3 | AC-CAS-04-04 | TC-CAS-04-04 | NOT_RUN |
| US-CAS-05 | P2 | BA 2.1, 3.3 | AC-CAS-05-01 | TC-CAS-05-01 | NOT_RUN |
| US-CAS-05 | P2 | BA 2.1, 3.3 | AC-CAS-05-02 | TC-CAS-05-02 | NOT_RUN |
| US-CAS-05 | P2 | BA 2.1, 3.3 | AC-CAS-05-03 | TC-CAS-05-03 | NOT_RUN |
| US-CAS-05 | P2 | BA 2.1, 3.3 | AC-CAS-05-04 | TC-CAS-05-04 | NOT_RUN |
| US-CAS-06 | P2 | BA 2.2, 4.3 | AC-CAS-06-01 | TC-CAS-06-01 | NOT_RUN |
| US-CAS-06 | P2 | BA 2.2, 4.3 | AC-CAS-06-02 | TC-CAS-06-02 | NOT_RUN |
| US-CAS-06 | P2 | BA 2.2, 4.3 | AC-CAS-06-03 | TC-CAS-06-03 | NOT_RUN |
| US-CAS-06 | P2 | BA 2.2, 4.3 | AC-CAS-06-04 | TC-CAS-06-04 | NOT_RUN |
| US-SOC-01 | P2 | BA 5.2, 5.5, 8.2 | AC-SOC-01-01 | TC-SOC-01-01 | NOT_RUN |
| US-SOC-01 | P2 | BA 5.2, 5.5, 8.2 | AC-SOC-01-02 | TC-SOC-01-02 | NOT_RUN |
| US-SOC-01 | P2 | BA 5.2, 5.5, 8.2 | AC-SOC-01-03 | TC-SOC-01-03 | NOT_RUN |
| US-SOC-01 | P2 | BA 5.2, 5.5, 8.2 | AC-SOC-01-04 | TC-SOC-01-04 | NOT_RUN |
| US-SOC-01 | P2 | BA 5.2, 5.5, 8.2 | AC-SOC-01-05 | TC-SOC-01-05 | NOT_RUN |
| US-SOC-02 | P2 | BA 5.1, 5.3 | AC-SOC-02-01 | TC-SOC-02-01 | NOT_RUN |
| US-SOC-02 | P2 | BA 5.1, 5.3 | AC-SOC-02-02 | TC-SOC-02-02 | NOT_RUN |
| US-SOC-02 | P2 | BA 5.1, 5.3 | AC-SOC-02-03 | TC-SOC-02-03 | NOT_RUN |
| US-SOC-02 | P2 | BA 5.1, 5.3 | AC-SOC-02-04 | TC-SOC-02-04 | NOT_RUN |
| US-SOC-03 | P2 | BA 2.7, 5.5, 2.5 | AC-SOC-03-01 | TC-SOC-03-01 | NOT_RUN |
| US-SOC-03 | P2 | BA 2.7, 5.5, 2.5 | AC-SOC-03-02 | TC-SOC-03-02 | NOT_RUN |
| US-SOC-03 | P2 | BA 2.7, 5.5, 2.5 | AC-SOC-03-03 | TC-SOC-03-03 | NOT_RUN |
| US-SOC-03 | P2 | BA 2.7, 5.5, 2.5 | AC-SOC-03-04 | TC-SOC-03-04 | NOT_RUN |
| US-SOC-04 | P2 | BA 4.1, Phần 11 | AC-SOC-04-01 | TC-SOC-04-01 | NOT_RUN |
| US-SOC-04 | P2 | BA 4.1, Phần 11 | AC-SOC-04-02 | TC-SOC-04-02 | NOT_RUN |
| US-SOC-04 | P2 | BA 4.1, Phần 11 | AC-SOC-04-03 | TC-SOC-04-03 | NOT_RUN |
| US-SOC-04 | P2 | BA 4.1, Phần 11 | AC-SOC-04-04 | TC-SOC-04-04 | NOT_RUN |
| US-HIS-01 | P2 | BA 6.2, 7.3, 1.3 | AC-HIS-01-01 | TC-HIS-01-01 | NOT_RUN |
| US-HIS-01 | P2 | BA 6.2, 7.3, 1.3 | AC-HIS-01-02 | TC-HIS-01-02 | NOT_RUN |
| US-HIS-01 | P2 | BA 6.2, 7.3, 1.3 | AC-HIS-01-03 | TC-HIS-01-03 | NOT_RUN |
| US-HIS-01 | P2 | BA 6.2, 7.3, 1.3 | AC-HIS-01-04 | TC-HIS-01-04 | NOT_RUN |
| US-HIS-01 | P2 | BA 6.2, 7.3, 1.3 | AC-HIS-01-05 | TC-HIS-01-05 | NOT_RUN |
| US-HIS-02 | P2 | BA 6.2 | AC-HIS-02-01 | TC-HIS-02-01 | NOT_RUN |
| US-HIS-02 | P2 | BA 6.2 | AC-HIS-02-02 | TC-HIS-02-02 | NOT_RUN |
| US-HIS-02 | P2 | BA 6.2 | AC-HIS-02-03 | TC-HIS-02-03 | NOT_RUN |
| US-HIS-02 | P2 | BA 6.2 | AC-HIS-02-04 | TC-HIS-02-04 | NOT_RUN |
| US-HIS-02 | P2 | BA 6.2 | AC-HIS-02-05 | TC-HIS-02-05 | NOT_RUN |
| US-HIS-03 | P2 | BA 6.3 | AC-HIS-03-01 | TC-HIS-03-01 | NOT_RUN |
| US-HIS-03 | P2 | BA 6.3 | AC-HIS-03-02 | TC-HIS-03-02 | NOT_RUN |
| US-HIS-03 | P2 | BA 6.3 | AC-HIS-03-03 | TC-HIS-03-03 | NOT_RUN |
| US-HIS-03 | P2 | BA 6.3 | AC-HIS-03-04 | TC-HIS-03-04 | NOT_RUN |
| US-HIS-03 | P2 | BA 6.3 | AC-HIS-03-05 | TC-HIS-03-05 | NOT_RUN |
| US-HIS-04 | P2 | BA 9.1 | AC-HIS-04-01 | TC-HIS-04-01 | NOT_RUN |
| US-HIS-04 | P2 | BA 9.1 | AC-HIS-04-02 | TC-HIS-04-02 | NOT_RUN |
| US-HIS-04 | P2 | BA 9.1 | AC-HIS-04-03 | TC-HIS-04-03 | NOT_RUN |
| US-HIS-04 | P2 | BA 9.1 | AC-HIS-04-04 | TC-HIS-04-04 | NOT_RUN |
| US-DEMO-01 | P2 | BA 9.2 | AC-DEMO-01-01 | TC-DEMO-01-01 | NOT_RUN |
| US-DEMO-01 | P2 | BA 9.2 | AC-DEMO-01-02 | TC-DEMO-01-02 | NOT_RUN |
| US-DEMO-01 | P2 | BA 9.2 | AC-DEMO-01-03 | TC-DEMO-01-03 | NOT_RUN |
| US-DEMO-02 | P2 | BA 9.3 | AC-DEMO-02-01 | TC-DEMO-02-01 | NOT_RUN |
| US-DEMO-02 | P2 | BA 9.3 | AC-DEMO-02-02 | TC-DEMO-02-02 | NOT_RUN |
| US-DEMO-02 | P2 | BA 9.3 | AC-DEMO-02-03 | TC-DEMO-02-03 | NOT_RUN |
| US-DEMO-03 | P2 | BA 1.8 | AC-DEMO-03-01 | TC-DEMO-03-01 | NOT_RUN |
| US-DEMO-03 | P2 | BA 1.8 | AC-DEMO-03-02 | TC-DEMO-03-02 | NOT_RUN |
| US-DEMO-03 | P2 | BA 1.8 | AC-DEMO-03-03 | TC-DEMO-03-03 | NOT_RUN |
| US-DEMO-03 | P2 | BA 1.8 | AC-DEMO-03-04 | TC-DEMO-03-04 | NOT_RUN |
| US-UI-P2-01 | P2 | BA 10.3 | AC-UI-P2-01-01 | TC-UI-P2-01-01 | NOT_RUN |
| US-UI-P2-01 | P2 | BA 10.3 | AC-UI-P2-01-02 | TC-UI-P2-01-02 | NOT_RUN |
| US-UI-P2-01 | P2 | BA 10.3 | AC-UI-P2-01-03 | TC-UI-P2-01-03 | NOT_RUN |
| US-UI-P2-01 | P2 | BA 10.3 | AC-UI-P2-01-04 | TC-UI-P2-01-04 | NOT_RUN |

## 4. Năm trạng thái của 37 thành phần

Mỗi ô dưới đây là điều kiện tạo trạng thái và phản hồi cần nghiệm thu. `EMPTY` không có nghĩa mọi trang phải thành một trang trắng: form là chưa nhập, bàn cờ là chưa có nước, overlay là chưa có sự kiện nên không hiện. `DISABLED` luôn có lý do đọc được bằng bàn phím/tooltip; chức năng cấm hoặc ẩn theo phân kỳ vẫn phải bị chặn ở máy chủ.

### UI-01 · `SCR-LOGIN` · P1

US: US-AUTH-04, US-AUTH-06, US-AUTH-P2-01, US-AUTH-P2-02. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Phiên hợp lệ vào Sảnh/đích mời | TC-UISTATE-01-SUCCESS |
| LOADING | Đang xác thực, chặn gửi trùng | TC-UISTATE-01-LOADING |
| EMPTY | Form chưa nhập có hướng dẫn đăng nhập/đăng ký | TC-UISTATE-01-EMPTY |
| ERROR | Sai thông tin chung hoặc lỗi dịch vụ; cho sửa/thử lại | TC-UISTATE-01-ERROR |
| DISABLED | Form chưa hợp lệ; Guest/Google P1 Sắp ra mắt | TC-UISTATE-01-DISABLED |

### UI-02 · `SCR-REGISTER` · P1

US: US-AUTH-01, US-AUTH-02, US-AUTH-03. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Hoàn tất OTP và hồ sơ mới cho vào | TC-UISTATE-02-SUCCESS |
| LOADING | Gửi/xác minh/hoàn tất từng bước | TC-UISTATE-02-LOADING |
| EMPTY | Bước chưa có dữ liệu hướng dẫn nhập | TC-UISTATE-02-EMPTY |
| ERROR | Trùng tên/email, sai/hết mã hoặc phục hồi chưa xong; ở đúng bước | TC-UISTATE-02-ERROR |
| DISABLED | Chưa hợp lệ, gửi lại chưa đủ 60 giây, đang xử lý | TC-UISTATE-02-DISABLED |

### UI-03 · `SCR-FORGOT-PASSWORD` · P2

US: US-AUTH-P2-03. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Thông báo chung không lộ email tồn tại | TC-UISTATE-03-SUCCESS |
| LOADING | Đang yêu cầu mã | TC-UISTATE-03-LOADING |
| EMPTY | Email trống, hướng dẫn nhập | TC-UISTATE-03-EMPTY |
| ERROR | Lỗi dịch vụ; thử lại, không báo địa chỉ có tồn tại | TC-UISTATE-03-ERROR |
| DISABLED | Email sai định dạng hoặc gửi lại quá sớm | TC-UISTATE-03-DISABLED |

### UI-04 · `SCR-RESET-PASSWORD` · P2

US: US-AUTH-P2-03. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Mật khẩu mới được nhận và phiên khác thu hồi | TC-UISTATE-04-SUCCESS |
| LOADING | Xác minh/đổi mật khẩu | TC-UISTATE-04-LOADING |
| EMPTY | Thiếu ngữ cảnh khôi phục: về yêu cầu mã | TC-UISTATE-04-EMPTY |
| ERROR | OTP sai/hết hạn; không đổi mật khẩu | TC-UISTATE-04-ERROR |
| DISABLED | Chưa xác minh hoặc mật khẩu không hợp lệ | TC-UISTATE-04-DISABLED |

### UI-05 · `SCR-ONBOARDING` · P2

US: US-AUTH-P2-02. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Google đã xác minh và hồ sơ hoàn tất | TC-UISTATE-05-SUCCESS |
| LOADING | Đang lấy danh tính/ghi hồ sơ | TC-UISTATE-05-LOADING |
| EMPTY | Chưa có tên/mật khẩu: hướng dẫn thiết lập | TC-UISTATE-05-EMPTY |
| ERROR | Email có tài khoản hoặc tên bị lấy; không gộp | TC-UISTATE-05-ERROR |
| DISABLED | Chưa hợp lệ/đang xử lý; không đóng tuỳ ý | TC-UISTATE-05-DISABLED |

### UI-06 · `SCR-LOBBY` · P1

US: US-UI-02, US-ROOM-08, US-RANK-01, US-CAS-01. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Danh sách và hành động đúng phân kỳ, có Luật chơi | TC-UISTATE-06-SUCCESS |
| LOADING | Tải phòng/bạn/phiên, khung xương từng vùng | TC-UISTATE-06-LOADING |
| EMPTY | Chưa có phòng: giải thích + Tạo phòng | TC-UISTATE-06-EMPTY |
| ERROR | Không tải danh sách: Thử lại, không giả danh sách rỗng | TC-UISTATE-06-ERROR |
| DISABLED | Đang có vị trí chơi hoặc tính năng P2 chưa mở | TC-UISTATE-06-DISABLED |

### UI-07 · `SCR-WAITING-ROOM` · P1

US: US-ROOM-02, US-ROOM-03, US-ROOM-06, US-ROOM-10, US-ROOM-11, US-CAS-03. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Ghế/Host/Sẵn sàng đúng trạng thái | TC-UISTATE-07-SUCCESS |
| LOADING | Đang nhận snapshot/chuyển ghế | TC-UISTATE-07-LOADING |
| EMPTY | Ghế còn trống: mời bạn hoặc chia sẻ mã | TC-UISTATE-07-EMPTY |
| ERROR | Lệnh lỗi/phiên bản cũ: nhận lại trạng thái | TC-UISTATE-07-ERROR |
| DISABLED | Chưa đủ hai ghế; khoá/chuyển vai không hợp lệ | TC-UISTATE-07-DISABLED |

### UI-08 · `SCR-GAME-ROOM` · P1

US: US-BOARD-01, US-BOARD-02, US-BOARD-03, US-BOARD-04, US-BOARD-05, US-PLAY-01, US-PLAY-02, US-PLAY-03, US-PLAY-04, US-PLAY-05, US-PLAY-06, US-PLAY-07, US-PLAY-08, US-PLAY-09, US-PLAY-10, US-RANK-01, US-RANK-02, US-RANK-03, US-RANK-04, US-RANK-05, US-RANK-06, US-CAS-02, US-CAS-04, US-CAS-05. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Thế/giờ/lượt đồng bộ máy chủ | TC-UISTATE-08-SUCCESS |
| LOADING | Đợi snapshot hoặc ACK nước đi | TC-UISTATE-08-LOADING |
| EMPTY | Chưa có nước: thế đầu và hướng dẫn, không bàn trắng | TC-UISTATE-08-EMPTY |
| ERROR | Mất kết nối/ghi lỗi: không phát nước giả, phục hồi theo [07] | TC-UISTATE-08-ERROR |
| DISABLED | Ngoài lượt, chỉ xem, phiên cũ hoặc ván đã kết thúc | TC-UISTATE-08-DISABLED |

### UI-09 · `SCR-AI-GAME` · P1

US: US-AI-01, US-AI-02, US-AI-03, US-AI-04, US-HIS-03, US-DEMO-01. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Máy đi hợp lệ, đúng cấp/phe | TC-UISTATE-09-SUCCESS |
| LOADING | Đang tìm/đợi tiến trình | TC-UISTATE-09-LOADING |
| EMPTY | Chưa có nước: thế đầu, máy khai cuộc nếu người cầm Đen | TC-UISTATE-09-EMPTY |
| ERROR | ENGINE_BUSY thử cùng ván; ABANDONED tạo ván mới | TC-UISTATE-09-ERROR |
| DISABLED | Lượt máy/phiên cũ; đi lại hết lượt hoặc P1 chưa có | TC-UISTATE-09-DISABLED |

### UI-10 · `SCR-LEADERBOARD` · P2

US: US-RANK-04. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Top 50 + dòng mình đúng thứ tự | TC-UISTATE-10-SUCCESS |
| LOADING | Tải bảng/dòng mình | TC-UISTATE-10-LOADING |
| EMPTY | Chưa có người đủ điều kiện, hiển thị cần thêm ván | TC-UISTATE-10-EMPTY |
| ERROR | Tải lỗi, Thử lại; không bịa thứ hạng | TC-UISTATE-10-ERROR |
| DISABLED | P1 Sắp ra mắt; tài khoản không có quyền thao tác riêng | TC-UISTATE-10-DISABLED |

### UI-11 · `SCR-FRIENDS` · P1

US: US-FRIEND-01, US-FRIEND-02, US-FRIEND-03, US-FRIEND-04, US-FRIEND-05, US-SOC-01, US-SOC-03. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Bạn/lời mời/trạng thái đúng | TC-UISTATE-11-SUCCESS |
| LOADING | Tải hoặc tìm kiếm | TC-UISTATE-11-LOADING |
| EMPTY | Chưa có bạn/kết quả: hướng dẫn tìm username | TC-UISTATE-11-EMPTY |
| ERROR | Tải/gửi/nhận lỗi; giữ ý định, đối soát trước gửi lại | TC-UISTATE-11-ERROR |
| DISABLED | Đủ trần, bị từ chối hai lần; bạn không Online | TC-UISTATE-11-DISABLED |

### UI-12 · `SCR-HISTORY` · P2

US: US-HIS-01. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Lịch sử chính chủ, lọc và nhãn đúng | TC-UISTATE-12-SUCCESS |
| LOADING | Tải lịch sử | TC-UISTATE-12-LOADING |
| EMPTY | Chưa có ván theo bộ lọc: đổi lọc/về Sảnh | TC-UISTATE-12-EMPTY |
| ERROR | Tải lỗi hoặc không có quyền; không trả dữ liệu | TC-UISTATE-12-ERROR |
| DISABLED | P1, Khách hoặc ván không thuộc chính chủ | TC-UISTATE-12-DISABLED |

### UI-13 · `SCR-REPLAY` · P2

US: US-HIS-02, US-HIS-04. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Nhánh hiệu lực tại con trỏ đúng | TC-UISTATE-13-SUCCESS |
| LOADING | Tải biên bản | TC-UISTATE-13-LOADING |
| EMPTY | Ván không có nước: thế đầu và giải thích | TC-UISTATE-13-EMPTY |
| ERROR | Thiếu/không có quyền dữ liệu: báo, không dựng ván giả | TC-UISTATE-13-ERROR |
| DISABLED | Đầu/cuối không tua vượt; mọi thao tác đi ván thật cấm | TC-UISTATE-13-DISABLED |

### UI-14 · `SCR-ACCESS-DENIED` · P1

US: US-ROOM-12. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Thông báo đúng nguyên nhân + về Sảnh | TC-UISTATE-14-SUCCESS |
| LOADING | Đợi kết quả kiểm quyền, chưa lộ phòng | TC-UISTATE-14-LOADING |
| EMPTY | Thiếu đích/lý do: thông báo không xác định đích, về Sảnh | TC-UISTATE-14-EMPTY |
| ERROR | Kiểm quyền lỗi: không tự cấp quyền, về Sảnh | TC-UISTATE-14-ERROR |
| DISABLED | Nút đang chuyển trang bị chặn trùng | TC-UISTATE-14-DISABLED |

### UI-15 · `SCR-PROFILE-SETTINGS` · P1

US: US-AUTH-05, US-AUTH-P2-04, US-UI-P2-01. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Lưu Display Name; P2 thêm chức năng đúng quyền | TC-UISTATE-15-SUCCESS |
| LOADING | Tải/lưu hồ sơ | TC-UISTATE-15-LOADING |
| EMPTY | Ô nhập trống: hướng dẫn, không lưu rỗng | TC-UISTATE-15-EMPTY |
| ERROR | Từ cấm/lỗi lưu: giữ dữ liệu nhập và cho sửa | TC-UISTATE-15-ERROR |
| DISABLED | Email luôn khoá; đổi username P1; đang lưu | TC-UISTATE-15-DISABLED |

### UI-16 · `MODAL-GUEST-NAME` · P2

US: US-AUTH-P2-01. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Tên hợp lệ tạo phiên có nhãn Khách | TC-UISTATE-16-SUCCESS |
| LOADING | Đang tạo phiên | TC-UISTATE-16-LOADING |
| EMPTY | Tên trống: hướng dẫn nhập | TC-UISTATE-16-EMPTY |
| ERROR | Tên bị lọc/lỗi phiên: không vào giả | TC-UISTATE-16-ERROR |
| DISABLED | Tên chưa hợp lệ hoặc đang gửi | TC-UISTATE-16-DISABLED |

### UI-17 · `MODAL-CREATE-ROOM` · P1

US: US-ROOM-01, US-SOC-04, US-SOC-03. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Tạo phòng đúng giá trị đã chọn | TC-UISTATE-17-SUCCESS |
| LOADING | Đang tạo, chặn bấm lại | TC-UISTATE-17-LOADING |
| EMPTY | Tên trống: hướng dẫn và các mặc định | TC-UISTATE-17-EMPTY |
| ERROR | Lỗi tạo: đối soát trước thử lại tránh hai phòng | TC-UISTATE-17-ERROR |
| DISABLED | Đang chiếm vị trí chơi hoặc tên không hợp lệ | TC-UISTATE-17-DISABLED |

### UI-18 · `MODAL-INVITE` · P1

US: US-ROOM-04, US-FRIEND-04, US-CAS-06. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Mã/link hiện hành; QR P2; mời bạn Online | TC-UISTATE-18-SUCCESS |
| LOADING | Tải mã/bạn hoặc sao chép | TC-UISTATE-18-LOADING |
| EMPTY | Không bạn Online: vẫn chia sẻ link/mã nếu hợp lệ | TC-UISTATE-18-EMPTY |
| ERROR | Clipboard/lời mời lỗi; báo và cho cách khác | TC-UISTATE-18-ERROR |
| DISABLED | LOCKED/mất ghế; bạn bận/offline; QR ẩn P1 | TC-UISTATE-18-DISABLED |

### UI-19 · `MODAL-ROOM-SETTINGS` · P1

US: US-ROOM-07. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Host đổi riêng tư, thu hồi mã đúng | TC-UISTATE-19-SUCCESS |
| LOADING | Đang thay đổi | TC-UISTATE-19-LOADING |
| EMPTY | Chưa có snapshot: hướng dẫn đợi, không chọn giá trị giả | TC-UISTATE-19-EMPTY |
| ERROR | Không còn quyền/ghi lỗi: tải trạng thái thật | TC-UISTATE-19-ERROR |
| DISABLED | Không Host; bật LOCKED chưa đủ hai ghế | TC-UISTATE-19-DISABLED |

### UI-20 · `MODAL-MATCHMAKING` · P2

US: US-RANK-01, US-CAS-01. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | MATCH_FOUND chỉ một ván | TC-UISTATE-20-SUCCESS |
| LOADING | Đang tìm có thời gian/biên độ | TC-UISTATE-20-LOADING |
| EMPTY | Hết 60 giây chưa đối thủ: thử lại theo chế độ | TC-UISTATE-20-EMPTY |
| ERROR | Hàng đợi bị huỷ/lỗi kết nối; không vé ma | TC-UISTATE-20-ERROR |
| DISABLED | Huỷ vô hiệu khi MATCH_FOUND; đang có vị trí khác | TC-UISTATE-20-DISABLED |

### UI-21 · `MODAL-AI-SETUP` · P1

US: US-AI-01. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Tạo ván đúng cấp/phe | TC-UISTATE-21-SUCCESS |
| LOADING | Đang tạo/bốc phe | TC-UISTATE-21-LOADING |
| EMPTY | Chưa chọn đủ: hướng dẫn chọn | TC-UISTATE-21-EMPTY |
| ERROR | Tạo lỗi: đối soát, không ván kép | TC-UISTATE-21-ERROR |
| DISABLED | Đang có vị trí chơi hoặc đang gửi | TC-UISTATE-21-DISABLED |

### UI-22 · `MODAL-OTP-USERNAME` · P2

US: US-AUTH-P2-04. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Đúng OTP rồi đổi tên và giữ dữ liệu | TC-UISTATE-22-SUCCESS |
| LOADING | Gửi/xác minh/đổi tên | TC-UISTATE-22-LOADING |
| EMPTY | Chưa nhập OTP/tên ở bước tương ứng | TC-UISTATE-22-EMPTY |
| ERROR | OTP/tên không hợp lệ; không thay tên nửa chừng | TC-UISTATE-22-ERROR |
| DISABLED | Chưa đủ bước, chưa hết chờ gửi lại | TC-UISTATE-22-DISABLED |

### UI-23 · `MODAL-DIRECT-CHAT` · P2

US: US-SOC-01, US-SOC-02. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Tin được lưu/nhận đúng hai bạn | TC-UISTATE-23-SUCCESS |
| LOADING | Tải lịch sử/đang gửi | TC-UISTATE-23-LOADING |
| EMPTY | Chưa có tin: mời bắt đầu trò chuyện | TC-UISTATE-23-EMPTY |
| ERROR | Gửi lỗi/tải lỗi: cho thử lại có đối soát | TC-UISTATE-23-ERROR |
| DISABLED | Không còn bạn: chặn đọc/gửi, ẩn lịch sử | TC-UISTATE-23-DISABLED |

### UI-24 · `MODAL-SIDE-SWAP-PROMPT` · P2

US: US-CAS-03. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Trả lời hợp lệ, hoán ghế/reset Ready nếu đồng ý | TC-UISTATE-24-SUCCESS |
| LOADING | Đang gửi phản hồi | TC-UISTATE-24-LOADING |
| EMPTY | Không còn đề nghị: đóng và trả focus | TC-UISTATE-24-EMPTY |
| ERROR | Đề nghị cũ/đổi ghế: lấy trạng thái hiện tại | TC-UISTATE-24-ERROR |
| DISABLED | Không còn phòng chờ/đúng người nhận hoặc hết hạn | TC-UISTATE-24-DISABLED |

### UI-25 · `MODAL-DRAW-PROMPT` · P1

US: US-PLAY-05, US-RANK-02. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Đề nghị còn hạn, trả lời đúng tác động | TC-UISTATE-25-SUCCESS |
| LOADING | Đang gửi/rút/trả lời; không dừng đồng hồ | TC-UISTATE-25-LOADING |
| EMPTY | Không còn đề nghị: gỡ khung/nút mở lại | TC-UISTATE-25-EMPTY |
| ERROR | Phản hồi lỗi: đối soát hạn/trạng thái, không hoà giả | TC-UISTATE-25-ERROR |
| DISABLED | Hết hạn/đã rút/đã kết thúc hoặc không phải người nhận | TC-UISTATE-25-DISABLED |

### UI-26 · `MODAL-UNDO-PROMPT` · P2

US: US-CAS-02. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Chấp nhận lùi đúng nhánh và trừ một lượt | TC-UISTATE-26-SUCCESS |
| LOADING | Đang gửi/rút/trả lời, đồng hồ chạy | TC-UISTATE-26-LOADING |
| EMPTY | Không có đề nghị: gỡ khung | TC-UISTATE-26-EMPTY |
| ERROR | Trạng thái cũ: không lùi thêm, tải thế đúng | TC-UISTATE-26-ERROR |
| DISABLED | Hết hạn, RANKED, hết lượt hoặc ván kết thúc | TC-UISTATE-26-DISABLED |

### UI-27 · `MODAL-CONFIRM-RESIGN` · P1

US: US-PLAY-04, US-AI-03. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Xác nhận: RESIGN; Huỷ không đổi ván | TC-UISTATE-27-SUCCESS |
| LOADING | Đợi ACK; chặn xác nhận trùng | TC-UISTATE-27-LOADING |
| EMPTY | Không còn ván đang chơi: đóng, hiện kết quả thật | TC-UISTATE-27-EMPTY |
| ERROR | Mất ACK: đối soát, không báo thua giả | TC-UISTATE-27-ERROR |
| DISABLED | Ván kết thúc/phiên cũ/không phải người chơi | TC-UISTATE-27-DISABLED |

### UI-28 · `MODAL-CONFIRM-LEAVE` · P1

US: US-PLAY-06, US-AUTH-05, US-AI-03. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Rời/Đăng xuất giữa ván xác nhận hậu quả | TC-UISTATE-28-SUCCESS |
| LOADING | Đợi xử lý rời/đầu hàng | TC-UISTATE-28-LOADING |
| EMPTY | Không còn mục tiêu: đóng, về trạng thái hiện tại | TC-UISTATE-28-EMPTY |
| ERROR | Lỗi xử lý: giữ thông báo và đối soát | TC-UISTATE-28-ERROR |
| DISABLED | Đã xử lý hoặc không còn quyền điều khiển | TC-UISTATE-28-DISABLED |

### UI-29 · `MODAL-CONFIRM-KICK` · P1

US: US-ROOM-09. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Chặn đến đóng phòng, người xem về Sảnh | TC-UISTATE-29-SUCCESS |
| LOADING | Đang đuổi/chặn | TC-UISTATE-29-LOADING |
| EMPTY | Mục tiêu đã rời: cập nhật danh sách | TC-UISTATE-29-EMPTY |
| ERROR | Mất quyền/lỗi lệnh: không báo đã đuổi | TC-UISTATE-29-ERROR |
| DISABLED | Mục tiêu không là người xem/người gọi mất ghế | TC-UISTATE-29-DISABLED |

### UI-30 · `MODAL-MATCH-RESULT` · P1

US: US-PLAY-03, US-AI-03, US-CAS-04, US-RANK-03. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Kết quả/lý do đúng; nút theo phân kỳ | TC-UISTATE-30-SUCCESS |
| LOADING | Đợi kết quả có thẩm quyền | TC-UISTATE-30-LOADING |
| EMPTY | Chưa có kết quả: đợi/đối soát, không đoán thắng | TC-UISTATE-30-EMPTY |
| ERROR | Tải kết quả lỗi: Thử lại, không cho đi thêm | TC-UISTATE-30-ERROR |
| DISABLED | Tái đấu/Replay sai chế độ, P1 ẩn | TC-UISTATE-30-DISABLED |

### UI-31 · `PANEL-NAVBAR` · P1

US: US-UI-01, US-FRIEND-02. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Mục/menu đúng phiên/phân kỳ; badge là tổng tin đến chưa đọc từ bạn hiện tại, theo BA 5.2 | TC-UISTATE-31-SUCCESS |
| LOADING | Tải thông tin/badge | TC-UISTATE-31-LOADING |
| EMPTY | Không thông báo: badge ẩn, chuông có giải thích | TC-UISTATE-31-EMPTY |
| ERROR | Tải thông báo lỗi không biến thành không có thông báo | TC-UISTATE-31-ERROR |
| DISABLED | P2 chưa mở; hành động đang xử lý | TC-UISTATE-31-DISABLED |

### UI-32 · `PANEL-CHAT` · P1

US: US-CHAT-01, US-CHAT-02, US-SOC-02. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Tin đúng quyền/kênh sau bộ lọc | TC-UISTATE-32-SUCCESS |
| LOADING | Tải/gửi tin | TC-UISTATE-32-LOADING |
| EMPTY | Chưa có tin: lời nhắc viết theo kênh | TC-UISTATE-32-EMPTY |
| ERROR | Gửi lỗi: đánh dấu chưa gửi, đối soát trước thử | TC-UISTATE-32-ERROR |
| DISABLED | Vượt giới hạn, mất quyền kênh, ô trống | TC-UISTATE-32-DISABLED |

### UI-33 · `PANEL-MEDIA` · P1

US: US-MEDIA-01, US-MEDIA-02, US-MEDIA-03, US-RANK-06. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Luồng chỉ người được phép nhận | TC-UISTATE-33-SUCCESS |
| LOADING | Xin quyền thiết bị/kết nối media | TC-UISTATE-33-LOADING |
| EMPTY | Mặc định tắt/chưa chia sẻ: placeholder không bịa video | TC-UISTATE-33-EMPTY |
| ERROR | Từ chối quyền/lỗi thiết bị: hướng dẫn cấp quyền/thử lại | TC-UISTATE-33-ERROR |
| DISABLED | Người xem không phát; mất ghế/phiên cũ | TC-UISTATE-33-DISABLED |

### UI-34 · `PANEL-SPECTATORS` · P1

US: US-ROOM-09, US-PLAY-09, US-SOC-04. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Danh sách/số X/N đúng; Kick cho hai người | TC-UISTATE-34-SUCCESS |
| LOADING | Tải/cập nhật danh sách | TC-UISTATE-34-LOADING |
| EMPTY | Chưa ai xem: giải thích; không dựng tài khoản giả | TC-UISTATE-34-EMPTY |
| ERROR | Tải/đuổi lỗi: tải lại danh sách thật | TC-UISTATE-34-ERROR |
| DISABLED | N=0/đã đủ; không ghế thì không quyền Kick | TC-UISTATE-34-DISABLED |

### UI-35 · `ALERT-INACTIVITY-BANNER` · P2

US: US-CAS-05. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Cảnh báo đúng bên tới lượt, 30 giây | TC-UISTATE-35-SUCCESS |
| LOADING | Đang gửi Tôi còn đây | TC-UISTATE-35-LOADING |
| EMPTY | Chưa tới ngưỡng: banner không hiện | TC-UISTATE-35-EMPTY |
| ERROR | Mất ACK: đối soát, không tự reset đồng hồ | TC-UISTATE-35-ERROR |
| DISABLED | Đã dùng hai lần liên tiếp; không áp AI/giờ hữu hạn | TC-UISTATE-35-DISABLED |

### UI-36 · `OVERLAY-RECONNECTING` · P1

US: US-PLAY-07, US-AI-03, US-RANK-05, US-DEMO-02. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Đã nối lại nhận snapshot rồi tự tắt | TC-UISTATE-36-SUCCESS |
| LOADING | Nối lại kèm thời hạn đúng vai trò | TC-UISTATE-36-LOADING |
| EMPTY | Không mất kết nối: overlay không hiện | TC-UISTATE-36-EMPTY |
| ERROR | Quá hạn: kết quả/mất ghế/về Sảnh đúng loại | TC-UISTATE-36-ERROR |
| DISABLED | Không Esc/bấm ngoài; chặn lệnh cần kết nối | TC-UISTATE-36-DISABLED |

### UI-37 · `MODAL-MEDIA-TAB-SWITCH` · P2

US: US-DEMO-03. Các US-UI-03/04/05/06 áp dụng chung.

| Trạng thái | Điều kiện / phản hồi bắt buộc | Mục kiểm |
|---|---|---|
| SUCCESS | Chuyển đúng một tab phát hoặc Huỷ | TC-UISTATE-37-SUCCESS |
| LOADING | Dừng cũ/xin thiết bị mới | TC-UISTATE-37-LOADING |
| EMPTY | Không tranh chấp: không hiện hộp | TC-UISTATE-37-EMPTY |
| ERROR | Không cấp quyền/chuyển lỗi: tab mới vẫn tắt | TC-UISTATE-37-ERROR |
| DISABLED | Tab không điều khiển hoặc thao tác đang xử lý | TC-UISTATE-37-DISABLED |

## 5. Ca biên xuyên luồng bắt buộc

| Mã | Chuẩn bị và hành động | Kết quả bắt buộc | Nguồn |
|---|---|---|---|
| TC-X-01 | Dừng sau ghi completed_at, trước xoá PENDING; chạy phục hồi hai lần | Chỉ một tài khoản, không xoá; trước xoá cờ vẫn chặn, sau xoá dùng được | BA 1.1; [07] §4 |
| TC-X-02 | Bản ghi chưa completed_at quá hạn; đồng thời hoàn tất và quét dọn | Tuần tự cùng danh tính, không xoá tài khoản đã hoàn tất, không tài khoản dở dùng được | BA 1.1 |
| TC-X-03 | Đăng xuất giữa ván: thử Huỷ, xác nhận, mất ACK rồi gửi lại | Huỷ không đổi; xác nhận RESIGN một lần rồi rời; không giả thành ân hạn | BA 1.8/6.3 |
| TC-X-04 | ENGINE_BUSY sau nước người; Thử lại hai lần | Cùng Match ID/thế, không đi lại nước người hoặc hai nước máy | BA 6.1 |
| TC-X-05 | Ván AI ABANDONED, phe gốc Ngẫu nhiên đã thành Đen; Thử lại | Match ID mới, giữ Đen/cấp, máy khai cuộc, ván cũ kết thúc | BA 6.1 |
| TC-X-06 | Thu gọn/mở lại đề nghị và dùng bàn phím đi quân | Hạn/đồng hồ không dừng; không giữ focus; không gửi từ chối vì X/Esc | BA 3.6 |
| TC-X-07 | Trả lời đề nghị sau ván kết thúc/hết hạn | Không đổi kết quả, không trừ lượt, nhận trạng thái thật | BA 3.6; [02] |
| TC-X-08 | CASUAL: FINISHED → WAITING ở phút 9 rồi đến hạn cũ phút 10 | Phòng WAITING không bị đóng bởi hẹn giờ cũ | BA 3.3 |
| TC-X-09 | FINISHED giữ nguyên quá 10 phút | CLOSED, mọi thành viên về Sảnh | BA 3.3 |
| TC-X-10 | LOCKED, một ghế rời; người mới dùng mã cũ và Host mời người xem cũ xuống | Giữ khoá; chặn người mới; cho đổi ghế cũ khi hợp lệ | BA 2.8 |
| TC-X-11 | Hai người cùng chiếm ghế cuối/chỗ xem cuối | Không vượt sức chứa; một thành công, bên kia nhận tình trạng thực | BA 2.8 |
| TC-X-12 | Một người vừa vào phòng vừa bắt đầu AI/tìm trận | Chỉ một vị trí chơi, không ghế/AI/vé mồ côi | BA 1.8 |
| TC-X-13 | A/B gửi kết bạn chéo đồng thời; tổng PENDING 49/50/51 | Một yêu cầu chờ, không tự bạn; không vượt 50 cả hai đầu | BA 5.5 |
| TC-X-14 | Ghép RANKED tại giây 60, đối thủ đúng biên 400 rồi ngoài biên | Thử lần cuối; trong biên được xét, ngoài biên không ghép; hết hạn không AI | BA 7.2 |
| TC-X-15 | Cặp có ba ván, trong đó một INTERRUPTED; một ván nằm đúng t−24 giờ | Ván gián đoạn trong cửa sổ vẫn đếm; ván ở đúng biên trái ra khỏi cửa sổ | BA 7.2 |
| TC-X-16 | Xử lý kết quả RANKED hai lần; ván 30/31, K khác nhau, tròn .5 và sàn | Elo/thống kê đổi một lần, K và làm tròn/sàn theo nguồn | BA 7.1 |
| TC-X-17 | Đổi từ ghế sang xem trong lúc chat/track đang mở | Không nhận chat riêng cặp mới, không phát media, không nghe track chỉ đối thủ | BA 4.1/5.3 |
| TC-X-18 | Huỷ bạn khi 1-1 đang mở rồi gọi đọc/gửi trực tiếp; kết bạn lại | Chặn tức thì, dữ liệu ẩn nhưng giữ; khôi phục khi kết bạn lại | BA 5.5 |
| TC-X-19 | Replay ván có nhánh đã đi lại, xuất FEN ở giữa và PGN cả ván | Chỉ nhánh hiệu lực; FEN tại con trỏ; PGN nhập đúng công cụ ngoài | BA 6.2/9.1 |
| TC-X-20 | Khách hết phiên sau ván với tài khoản chính thức | Không lịch sử phía Khách; bản ghi đối thủ giữ và tên cá nhân thành Khách | BA 1.3 |
| TC-X-21 | Khách rời phòng lúc phiên chưa đủ 12 giờ; sau đó thử đến hạn trong lúc còn ghế rồi rời | Trước hạn vẫn cùng danh tính; đến hạn khi có ghế không hết, rời sau hạn mới hết phiên | BA 1.3 |
| TC-X-22 | RANKED kết thúc; A rời, B ở lại; A tìm mới, B thử tìm trước khi rời; đợi hạn 10 phút | A được tìm, B bị chặn do còn ghế; phòng không WAITING; không reset hạn; tới hạn đóng | BA 7.2 |
| TC-X-23 | Thách đấu mở form rồi Huỷ; mở lại xác nhận; người nhận vừa bận/từ chối/hết hạn | Huỷ không tạo phòng; mặc định 10 phút/CODE_ONLY/N=2; xác nhận chỉ một phòng, lỗi mời không xoá phòng | BA 2.7 |
| TC-X-24 | Có hai hội thoại, nhiều tin đến và tin mình gửi; tải ở tab nền rồi xem một phần; huỷ/kết bạn lại | Badge đếm tin đến chưa đọc của bạn hiện tại; chỉ tin vào vùng nhìn tab hoạt động thành đã đọc; đồng bộ thiết bị, không reset read_at | BA 5.2 |

## 6. Cổng nghiệm thu

- P1: D1–D10, mọi AC P1, trạng thái UI P1 áp dụng, ca biên P1 và NFR ở [05]. Không đưa AC P2 vào điều kiện P1.
- P2: mọi AC P2, hồi quy AC P1 còn áp dụng, trạng thái UI mở rộng và các cổng kỹ thuật P2 ở [05]. Không coi P2 đã nghiệm thu vì đã liệt kê US.
- Không có ứng dụng trong đợt tài liệu này; toàn bộ mục kiểm bên trên đang **NOT_RUN**. Kiểm định tài liệu chỉ chứng minh số lượng/mã/liên kết, không chứng minh hành vi thực.

[01]: 01-yeu-cau-chi-tiet.md
[02]: 02-luat-co-tuong.md
[03]: 03-du-lieu.md
[04]: 04-kien-truc.md
[05]: 05-kiem-thu.md
