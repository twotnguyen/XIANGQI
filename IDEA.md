# Cờ Tướng Online · Ý tưởng sản phẩm

**Bản tổng quan phục vụ review đặc tả P1/P2 · 04/10/2026.** Tài liệu này tóm tắt các quyết định đã duyệt, không tạo nguồn luật thứ hai. Nguồn chuẩn: [BA-SCOPE-DECISIONS.md](BA-SCOPE-DECISIONS.md).

## 1. Sản phẩm và mục đích

Web cờ tướng tiếng Việt cho người chơi giao lưu qua phòng online và luyện tập với máy. Trải nghiệm kết hợp bàn cờ đúng luật rút gọn của dự án với chat, camera và mic tự chọn. Dự án phục vụ đồ án nhóm; thành công P1 được đánh giá bằng tám mục tiêu chạy từ đầu đến cuối, không bằng số màn mockup hoặc số tài liệu.

## 2. Ai dùng và để làm gì?

| Vai trò | Nhu cầu trong phạm vi đã duyệt |
|---|---|
| Người chơi có tài khoản | Tạo/vào phòng, mời bạn bằng link/mã, đánh online và giao lưu; luyện với máy |
| Host | Quản lý phòng, ghế và quyền vào; không có quyền sửa luật hay kết quả |
| Người xem | Theo dõi CASUAL và chat chung; chỉ nhận media khi người chơi cho phép |
| Khách (P2) | Chơi nhanh không đăng ký, nhưng không Đánh Hạng/bạn bè/lịch sử cá nhân |

Đây là vai trò từ phạm vi, không phải kết luận đã nghiên cứu thị trường hay chân dung người dùng đã kiểm chứng.

## 3. Trải nghiệm trọng tâm

1. Đăng ký/đăng nhập → Sảnh → tạo phòng hoặc nhận lời mời.
2. Hai người ngồi ghế, cùng Sẵn sàng → chơi đúng luật với trạng thái do máy chủ quyết định.
3. Có thể trò chuyện, bật camera/mic; mặc định tắt, không ghi âm/ghi hình. Người xem không phát media hoặc đọc Kênh Riêng.
4. Xem kết quả/rời phòng; hoặc từ Sảnh chọn một trong ba cấp AI và phe để luyện tập.
5. P2 bổ sung thi đấu Đánh Hạng theo Elo, tiện ích xã hội, lịch sử/Replay và các mở rộng đã chốt.

Chat/camera/mic thuộc tám mục tiêu P1 vì sản phẩm đã chọn trải nghiệm giao lưu trong phòng; không phải tính năng quản trị hay mạng xã hội đầy đủ. Luật rút gọn được công bố trong Sảnh; không quảng bá là áp dụng mọi luật giải đấu chính thức.

## 4. Phạm vi và ưu tiên

**P1:** đăng ký/đăng nhập; tạo phòng; mời link/mã và bạn bè online; bàn cờ; đánh online; phòng công khai/có mã/khoá tối đa năm người xem; chat + camera + mic; AI ba cấp. Chỉ theme Kỳ Đài Cổ Phong.

**P2:** đúng danh sách BA Phần 11, gồm toàn bộ Đánh Hạng, Khách, Google, khôi phục/đổi tài khoản theo phạm vi, ghép CASUAL, các đề nghị mở rộng, chat 1-1/sticker, QR, lịch sử/Replay/xuất dữ liệu, tiện ích demo và lựa chọn Giấy Sáng/Theo hệ thống.

Hoàn thiện **đặc tả** P2 không đưa P2 vào thời hạn P1. Mốc khoảng hai tuần là mục tiêu để lập kế hoạch kiểm tra lại công suất nhóm bảy người, không phải bằng chứng khả thi.

**Không làm:** xem BA 10.2; không tự thêm giải đấu, gợi ý nước cho người chơi, cộng giây, quản trị/báo cáo vi phạm hoặc công nghệ ngoài danh sách duyệt.

## 5. Thành công được chứng minh thế nào?

- Tám mục tiêu có kịch bản D1–D10 và AC chi tiết; quyền, lỗi, biên và trợ năng có tình huống kiểm.
- Luật cờ được kiểm độc lập; không tin kết quả do client gửi.
- Các ngưỡng máy cờ, đồng bộ và quy mô phải đo thật. Không đạt thì ghi BLOCKED, không giảm ngưỡng ngầm.
- "Đặc tả đã viết" ≠ "Product Owner đã review bản viết" ≠ "chạy thử đạt" ≠ "kế hoạch khả thi".

## 6. Đọc tiếp

1. [Nguồn luật và phân kỳ](BA-SCOPE-DECISIONS.md).
2. [Chỉ mục đặc tả](docs/README.md): yêu cầu, luật, dữ liệu, kiến trúc và kiểm thử.
3. [Hợp đồng nghiệp vụ](docs/07-hop-dong-nghiep-vu.md): tiền điều kiện, trạng thái, lỗi và phục hồi.
4. [Ma trận nghiệm thu](docs/08-ma-tran-nghiem-thu.md): US/AC → kiểm thử; năm trạng thái của 37 thành phần.

Không lấy Jira hoặc mockup làm nguồn bổ sung yêu cầu. Đợt hoàn thiện này không đọc/sửa Jira, kế hoạch hiện có hay mockup; mockup khác đặc tả chỉ là tham khảo.
