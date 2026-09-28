# Cờ Tướng Online · Bộ Thiết Kế Giao Diện Tương Tác (UI Prototype)

Bản thiết kế giao diện tương tác hoàn chỉnh (**Interactive Web Prototype**) cho toàn bộ 37 màn hình và khung chức năng của dự án Cờ Tướng Online, sẵn sàng làm quy chuẩn thiết kế để đội ngũ phát triển triển khai giao diện ứng dụng.

---

## 📁 Cấu trúc thư mục bàn giao (`/web`)

```text
web/
├── index.html              # Bản duyệt giao diện tương tác hoàn chỉnh (Single-file Web App)
├── brand-spec.md           # Bộ quy chuẩn Design Tokens (Màu sắc, Typography, Quy tắc thị giác)
├── design-analysis.md      # Báo cáo phân tích chuyên sâu kiến trúc 37 màn hình & luồng dữ liệu
├── README.md               # Tài liệu hướng dẫn sử dụng và kiểm tra bản thiết kế
└── previews/               # 14 ảnh chụp màn hình thực tế độ phân giải cao
    ├── 01_sanh_co_lobby.png
    ├── 02_ban_co_game_room.png
    ├── 03_phong_cho_waiting_room.png
    ├── 04_tao_phong_create_room.png
    ├── 05_doi_ben_side_swap.png
    ├── 06_tim_ban_user_search.png
    ├── 07_danh_sach_ban_be.png
    ├── 08_ho_so_ky_thu.png
    ├── 09_mat_mang_reconnecting.png
    ├── 10_ket_qua_match_result.png
    ├── 11_lich_su_history.png
    ├── 12_xem_lai_replay.png
    ├── 13_dieu_huong_37_man_hinh.png
    └── 14_kiem_thu_262_tests.png
```

---

## 🚀 Cách mở và trải nghiệm

Tệp `index.html` được đóng gói khép kín hoàn toàn (**Self-contained Single File**), không phụ thuộc vào bất kỳ thư viện ngoài (CDN) nào, sử dụng inline SVG cho bàn cờ và Web Audio API cho âm thanh cờ gỗ. Bạn có thể mở offline mà không cần mạng Internet.

### 1. Mở trực tiếp bằng trình duyệt
- Trên macOS: Chạy lệnh `open index.html` trong Terminal hoặc nhấp đúp vào tệp `index.html`.
- Trên Windows/Linux: Nhấp đúp vào tệp `index.html` để mở trong Chrome, Safari, Edge, hoặc Firefox.

### 2. Mở qua Web Server cục bộ (Tùy chọn)
```bash
# Sử dụng Python
python3 -m http.server 3000

# Hoặc sử dụng npx serve
npx serve .
```
Sau đó truy cập: `http://localhost:3000`

---

## 🧭 Các phím tắt & Điều hướng nhanh

- **`⌘K`** hoặc **`Ctrl+K`** (hoặc nhấp nút tròn **`🧭 Màn hình (37)`** ở góc dưới bên phải):
  - Mở trung tâm điều hướng nhanh 37 màn hình.
  - Cho phép nhảy trực tiếp đến bất kỳ màn hình hoặc modal nào trong tích tắc.
  - Kích hoạt bộ chọn nhanh 5 trạng thái (*Thành công*, *Đang tải/Skeleton*, *Trống*, *Lỗi*, *Vô hiệu*).
  - Tab **`🧪 Kiểm thử tự động`**: Chạy toàn bộ bộ kiểm thử 262 bài test tự động ngay trong ứng dụng.
- **Phím `Esc` / Bấm ra ngoài (Backdrop click) / Nút `✕`:**
  - Áp dụng chuẩn `SCR-RULE-02` cho 16 modal tiêu chuẩn.
  - Áp dụng chuẩn `SCR-RULE-06` thu gọn UI thành banner ghim cho modal Đề nghị hòa/đi lại.
  - Áp dụng ngoại lệ §5 chặn đóng an toàn cho Lớp phủ mất mạng (`SCR-RECONNECTING`) và Cảnh báo treo ván (`SCR-INACTIVITY-PROMPT`).

---

## 📋 Danh mục 37 Màn hình & Khung chức năng đã hoàn thành

### 1. Bốn Màn hình Cốt lõi (⭐ Đã chốt)
1. **`SCR-LOGIN`**: Trang đăng nhập chia đôi cổ điển, hỗ trợ Google SSO, checkbox "Ghi nhớ đăng nhập 30 ngày" (kèm giải thích phiên tạm 30 phút theo `DEC-038/040`).
2. **`SCR-LOBBY`**: Sảnh cờ chính với 4 tab lọc phòng (*Tất cả*, *Đang chờ*, *Đang đấu*, *Khóa*), ô tìm kiếm phòng thời gian thực, nút Ghép cờ nhanh 15s, lưới 6 bàn cờ và bảng vinh danh Top 3 Đại Kỳ Thủ.
3. **`SCR-WAITING-ROOM`**: Phòng chờ ván đấu với cặp ghế Đỏ/Đen cỡ lớn chuẩn chống mù màu `DT-21`, trạng thái Sẵn sàng của từng bên, nút Xin đổi bên (Side Swap), khung chat thời gian thực `DEC-028`.
4. **`SCR-GAME-ROOM`**: Bàn cờ thi đấu chính chuẩn Widescreen 3 cột: Bàn cờ gỗ SVG 9×10, di chuyển quân và ăn quân thật, âm thanh cờ gỗ, cảnh báo chiếu tướng, đồng hồ số kép, luồng webcam có thước đo âm lượng VU-meter, chat 2 kênh (`PLAYERS` / `ROOM`).

### 2. Mười chín Cửa sổ & Khung chức năng (🪟 Modals & Panels)
1. **`SCR-USER-SEARCH`**: Tìm bạn bè theo username (prefix ≥ 3 ký tự, tối đa 20 kết quả, không lộ email).
2. **`SCR-SIDE-SWAP-PROMPT`**: Hộp thoại đề nghị đổi bên trước ván (đếm ngược 30s, cảnh báo hủy sẵn sàng theo `DEC-035`).
3. **`SCR-CREATE-ROOM`**: Tạo phòng thi đấu mới (tên phòng 1-60 ký tự, 3 chế độ bảo mật `PUBLIC`/`CODE_ONLY`/`LOCKED`, thời gian ván 0p/5p/10p/15p không cộng giây `BR-CLK-02`).
4. **`SCR-JOIN-BY-CODE`**: Nhập mã phòng 8 ký tự monospace tự động viết hoa (`K7M2-XQP4`).
5. **`SCR-INVITE-MODAL`**: Mời người khác vào phòng (3 tab: Bạn bè online, Mã phòng 8 ký tự, Link mời URL riêng cho Đấu thủ và Người xem).
6. **`SCR-ROOM-SETTINGS`**: Cài đặt phòng cờ dành cho chủ phòng (chế độ riêng tư, thời gian ván, quyền chat người xem).
7. **`SCR-SPECTATOR-LIST`**: Danh sách khán giả trong phòng (0-5 người xem) kèm nút Đuổi khỏi phòng.
8. **`SCR-CONFIRM-KICK`**: Xác nhận đuổi người xem (cảnh báo đỏ chữ in hoa `SCR-RULE-03`: người bị đuổi không thể vào lại).
9. **`SCR-CONFIRM-RESIGN`**: Xác nhận đầu hàng (cảnh báo đỏ: bị xử thua ngay lập tức và trừ ELO).
10. **`SCR-CONFIRM-LEAVE`**: Xác nhận rời phòng (đang thi đấu rời phòng bị xử thua).
11. **`SCR-PROPOSAL-PROMPT`**: Đề nghị hòa hoặc xin đi lại (đếm ngược 30s, đóng bằng `Esc` chỉ thu gọn UI theo `SCR-RULE-06`).
12. **`SCR-INACTIVITY-PROMPT`**: Cảnh báo chống treo ván (thiết kế không modal theo `SCR-RULE-07`, đếm ngược 30s, nút gia hạn +3 phút tối đa 2 lần).
13. **`SCR-MATCH-RESULT`**: Bảng kết quả ván đấu (Thắng/Thua/Hòa, hỗ trợ 6 nguyên nhân theo `glossary.md` §8: `DISCONNECT`, `RESIGN`, `TIMEOUT`, `INACTIVITY`, `DRAW`, `CHECKMATE`; bảng biến động ELO; bảo lưu phòng tái đấu 10 phút theo `DEC-029`).
14. **`SCR-CHAT-PANEL`**: Khung trò chuyện 2 kênh (Đấu thủ / Toàn phòng) có công tắc ẩn kênh chung chống phân tâm.
15. **`SCR-MEDIA-PANEL`**: Quản lý thiết bị Camera & Micro SFU WebRTC (3 phạm vi chia sẻ, xem trước camera, thước đo âm lượng VU-meter).
16. **`SCR-MEDIA-TAB-SWITCH`**: Cảnh báo chuyển quyền Camera/Mic từ tab trình duyệt khác theo `DEC-033/034`.
17. **`SCR-RECONNECTING`**: Lớp phủ mất mạng 60 giây (đếm lùi giữ ghế cờ theo `DEC-031`, chặn đóng theo §5).
18. **`SCR-ACCESS-DENIED`**: Thông báo từ chối truy cập (phòng đầy, bị đuổi, phòng khóa, mã hết hạn).
19. **`SCR-NAVBAR`**: Thanh điều hướng toàn cục có chuông thông báo hộp thư lời mời và menu hồ sơ cá nhân.

### 3. Mười bốn Trang Chức năng khác (📄 Secondary Pages)
1. **`SCR-REGISTER`**: Đăng ký tài khoản (username, email, mật khẩu).
2. **`SCR-FORGOT-PASSWORD`**: Yêu cầu đặt lại mật khẩu qua email.
3. **`SCR-RESET-PASSWORD`**: Nhập mật khẩu mới kèm xác thực độ mạnh.
4. **`SCR-VERIFY-NOTICE`**: Thông báo nhắc xác minh địa chỉ email.
5. **`SCR-ONBOARDING`**: Khảo sát cấp độ kỳ thủ cho người mới bắt đầu.
6. **`SCR-FRIENDS`**: Danh bạ kỳ hữu 3 tab (*Bạn bè*, *Lời mời kết bạn*, *Lời mời đã gửi*) kèm hộp thoại xem chi tiết hồ sơ kỳ thủ (`viewFriendProfile`).
7. **`SCR-INVITATION-INBOX`**: Hộp thư danh sách các lời mời thi đấu và lời mời xem ván cờ.
8. **`SCR-AI-SETUP`**: Cài đặt đấu với máy cờ AI (3 cấp độ: Nhập môn 300ms, Kỳ thủ 1000ms, Danh thủ 3000ms).
9. **`SCR-AI-GAME`**: Bàn cờ thi đấu với máy AI có gợi ý chiến thuật và nút hoàn nước đi.
10. **`SCR-HISTORY`**: Lịch sử các ván đấu đã tham gia kèm bộ lọc theo kết quả Thắng/Hòa/Thua/AI và tìm kiếm thời gian thực.
11. **`SCR-REPLAY`**: Xem lại ván cờ tương tác với bộ nút tua nước cờ, thanh trượt tiến trình, bảng 31 nước đi và tính năng **Tự động phát** (tùy chọn tốc độ `1.5s`, `⚡ 0.8s`, `2.5s`).
12. **`SCR-PROFILE-SETTINGS`**: Cài đặt hồ sơ cá nhân, đổi tên, mật khẩu và xem thông số tài khoản.
13. **`SCR-JOIN-LINK`**: Trang tiếp nhận và phân giải liên kết mời tham gia phòng cờ.
14. **`SCR-LEADERBOARD`**: Bảng vinh danh xếp hạng Top 3 Đại Kỳ Thủ và bảng tổng sắp ELO toàn máy chủ.

---

## 🎨 Quy chuẩn Thiết kế & Trợ năng (Design Tokens)

- **Độ tương phản (Contrast):** Nền giấy `#F5E8CC` và màu mực `#28221C` đạt độ tương phản **10.8:1**, vượt xa tiêu chuẩn khắt khe WCAG AA (4.5:1).
- **Chuẩn trợ năng `DT-21` (Chống mù màu đỏ–lục):**
  - Quân **ĐỎ (帥)**: Viền nét đôi (**double ring**) màu đỏ chu sa `#A51F25`.
  - Quân **ĐEN (將)**: Viền nét đơn (**single ring**) màu mực mun `#28221C`.
  - Giúp phân biệt hai phe rõ ràng ngay cả khi người dùng bị mù màu hoặc không đọc được chữ Hán trên mặt quân.
- **Tiêu điểm Focus Ring (`DT-05`):** Viền sáng xanh ngọc `#155E75` độ dày 2.5px trên mọi phần tử có thể nhận tiêu điểm bàn phím.
- **Khổ màn hình hỗ trợ:** Tối ưu hóa đặc biệt cho màn hình Desktop Widescreen / Fullscreen (1920×1080, 1440×900, 1366×768), đồng thời tự động co giãn không bị tràn cuộn ngang ở khổ điện thoại 360px (`DT-15`).

---

## 🧪 Bộ Kiểm thử Tự động (262/262 Tests PASS)

Bản prototype tích hợp sẵn bộ kiểm thử tự động toàn diện bao gồm:
- **37 bài test:** Kiểm tra cấu trúc DOM và tính khép kín của toàn bộ 37 màn hình/modals.
- **185 bài test:** Kiểm tra ma trận 5 trạng thái (*Thành công*, *Đang tải*, *Trống*, *Lỗi*, *Vô hiệu*) cho cả 37 màn hình theo `screen-states.md`.
- **19 bài test:** Kiểm tra cơ chế đóng mở phím `Esc`, bấm ngoài và ngoại lệ chặn đóng của 19 modals theo `SCR-RULE-02`.
- **13 bài test:** Kiểm tra tính toàn vẹn của các luồng định tuyến chuyển trang.
- **8 bài test:** Kiểm tra tuân thủ Design Tokens, WCAG AA, DT-21 và phân quyền SFU Media.

Để chạy kiểm thử: Nhấn **`⌘K`** trong ứng dụng → Chuyển sang tab **`🧪 Kiểm thử tự động`** → Nhấp nút **`⚡ Chạy lại 262 bài Test`**.
