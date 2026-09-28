# BÁO CÁO PHÂN TÍCH TOÀN BỘ DỰ ÁN & THIẾT KẾ GIAO DIỆN
## Dự án: Cờ Tướng Online (Web Xiangqi)

**Người thực hiện:** Senior Digital Product Designer  
**Đối tượng bàn giao:** Chủ dự án / Quản lý dự án  
**Tài liệu căn cứ:** Bộ đặc tả chính thức tại `XIANGQI/docs/` và `XIANGQI/Jira/`  
**Trạng thái phiên bản:** v1.1 — **Đã chốt 4 Màn cốt lõi & Hoàn thiện chi tiết 19 Modals/Khung chức năng**

---

## 1. TỔNG QUAN SẢN PHẨM & ĐỊNH VỊ THIẾT KẾ (`product-overview.md`)
- **Bản chất sản phẩm:** Ứng dụng web cờ tướng đối kháng trực tuyến thời gian thực chạy trên trình duyệt máy tính và điện thoại.
- **Tính năng độc đáo (Differentiators):**
  1. Tích hợp Camera & Mic trực tiếp trong không gian bàn cờ với quyền riêng tư độc lập (Tắt / Chỉ đối thủ / Đối thủ & người xem).
  2. Hai kênh trò chuyện độc lập: Kênh riêng giữa hai đấu thủ (`PLAYERS`) và Kênh chung (`ROOM`) cho cả phòng (người chơi có thể ẩn/hiện kênh chung tùy ý).
  3. AI cờ tướng tự viết phục vụ đồ án tốt nghiệp với 3 cấp độ tính toán (Dễ: 300ms, Trung bình: 1000ms, Khó: 3000ms).
- **Ranh giới sản phẩm (Scope):** Không hỗ trợ tài khoản khách (`Guest`) — người dùng bắt buộc phải đăng nhập bằng Username/Password hoặc Google; không có ứng dụng di động cài đặt riêng (Native App), toàn bộ tối ưu qua trình duyệt di động (Responsive Web).

---

## 2. CHUẨN HOÁ THUẬT NGỮ & PHÂN BIỆT KHÁI NIỆM CỐT LÕI (`glossary.md`)
Việc sai lệch thuật ngữ là nguyên nhân hàng đầu gây lỗi kiến trúc giao diện. Bản thiết kế cam kết tuân thủ 100% từ điển thuật ngữ chuẩn:
- **`SPECTATOR` (Vai trò) vs `WATCH` (Loại vé/grant):** "Người xem" trong phòng là vai trò `SPECTATOR`; mã/link để vào xem là loại `WATCH`. Tuyệt đối không gọi là "vé SPECTATOR" hay "vai trò WATCH".
- **`Room` (Phòng) vs `Match` (Ván):** Phòng chứa tối đa 7 người (2 người chơi + 5 người xem) và tồn tại qua nhiều ván; ván cờ có vòng đời riêng, khi tái đấu sẽ tạo `Match` mới trong cùng `Room`.
- **Chế độ phòng:** `PUBLIC` (Công khai - hiện ở sảnh), `CODE_ONLY` (Cần mã - người có vé WATCH hợp lệ), `LOCKED` (Khóa - không cho người xem).
- **Nguyên nhân kết thúc ván:** Phân biệt rành mạch `TIMEOUT` (hết giờ đồng hồ), `INACTIVITY` (treo ván khi không giới hạn giờ), và `DISCONNECT` (mất mạng quá 60s).

---

## 3. BIÊN BẢN CHỐT 4 MÀN HÌNH CỐT LÕI (SIGNED-OFF / LOCKED)
4 màn hình cốt lõi đã được kiểm tra, duyệt và **chính thức khóa thiết kế (Locked)** để làm tiêu chuẩn đối chiếu:

### 3.1. `SCR-LOGIN` — Màn hình Đăng nhập `[✓ ĐÃ CHỐT]`
- Bố cục Split view: Cánh trái nhận diện thương hiệu gỗ trầm `#704525`, con dấu "Tượng" (象); cánh phải form nhập liệu tinh gọn trên nền giấy dó `#F5E8CC`.
- Form Username/Password + Nút Google SSO chuẩn.
- Checkbox "Ghi nhớ đăng nhập" mặc định tick (30 ngày theo DEC-038/040; bỏ tick là phiên tạm hết sau 30 phút).
- Chuyển hướng chuẩn: Nếu chưa xác minh email chuyển `SCR-VERIFY-NOTICE`; nếu tài khoản mới qua Google chuyển `SCR-ONBOARDING`.

### 3.2. `SCR-LOBBY` — Sảnh trò chơi `[✓ ĐÃ CHỐT]`
- Thanh điều hướng toàn cục (`SCR-NAVBAR`) luôn hiển thị ở trên cùng, mang biểu tượng hộp thư lời mời (`SCR-INVITATION-INBOX`) có badge đỏ.
- Danh sách phòng công khai (`PUBLIC`) hiển thị trạng thái `WAITING` (Chờ đối thủ) / `PLAYING` (Đang đấu), số người xem (VD: 0/5, 4/5).
- Tác vụ nhanh: Nút "Tạo phòng mới" (mở `SCR-CREATE-ROOM`), "Chơi với máy" (mở `SCR-AI-SETUP`), "Nhập mã phòng" (mở `SCR-JOIN-BY-CODE`).

### 3.3. `SCR-WAITING-ROOM` — Phòng chờ ván đấu `[✓ ĐÃ CHỐT]`
- Banner phòng: Tên phòng, mã phòng `K7M2XQP4`, nút sao chép link, nút mời bạn (mở `SCR-INVITE-MODAL`), cài đặt phòng (mở `SCR-ROOM-SETTINGS`).
- Cặp ghế chơi (`Seat Pair`): Ghế Đỏ (Chủ phòng) và Ghế Đen (Đối thủ/Đang chờ), trạng thái Sẵn sàng của từng bên.
- Nút "Xin đổi bên" (Side swap): Mở `SCR-SIDE-SWAP-PROMPT` (30 giây, hủy trạng thái sẵn sàng cả hai bên).
- Khung chat phòng chờ: Đọc và gửi tin nhắn ngay lập tức theo DEC-028.

### 3.4. `SCR-GAME-ROOM` — Không gian Ván cờ chính `[✓ ĐÃ CHỐT]`
- Hàng Camera riêng trên đầu (`media-strip`), tuyệt đối không đè bàn cờ (Quy tắc bố cục #1).
- Bàn cờ gỗ 9×10 chuẩn SVG với chữ Hán (楚河 / 漢界), quân Đỏ viền đôi (double ring), quân Đen viền đơn (single ring) chống mù màu đỏ-lục (DT-21).
- Đồng hồ kép `tabular-nums`, biên bản nước đi, khung chat 2 kênh (chuyển đổi Đấu thủ / Cả phòng), danh sách người xem có nút "Đuổi" dành riêng cho chủ phòng.
- Thanh thao tác ván đấu: Nút [Đầu hàng] (mở `SCR-CONFIRM-RESIGN`), [Xin hoà] / [Xin đi lại] (mở `SCR-PROPOSAL-PROMPT`), nút mở `SCR-MEDIA-PANEL`.
- Cảnh báo chống treo ván (`SCR-INACTIVITY-PROMPT`): Non-modal alert, 30s countdown, không che bàn cờ và nút Đầu hàng.

---

## 4. CHI TIẾT ĐẶC TẢ HOÀN THIỆN 19 CỬA SỔ & KHUNG CHỨC NĂNG (MODALS & PANELS)

| STT | ID | Tên Modal / Khung | Ngữ cảnh xuất hiện | Đặc tả nghiệp vụ & Quy tắc thiết kế |
|---|---|---|---|---|
| 1 | `SCR-USER-SEARCH` | Tìm bạn bè theo username | Mở từ Trang Bạn bè (`/friends`) | Nhập từ 3 ký tự trở lên. Hiển thị tối đa 20 kết quả dạng danh thiếp kèm ELO. Nút "Kết bạn", "Đã gửi lời mời", "Đã là bạn bè". Hỗ trợ 5 trạng thái chuẩn. |
| 2 | `SCR-SIDE-SWAP-PROMPT` | Xin đổi bên trước ván | Phòng chờ (`SCR-WAITING-ROOM`) | Đếm ngược 30 giây. Cảnh báo bắt buộc SCR-RULE-03: *"Đồng ý đổi bên sẽ hủy bỏ trạng thái Sẵn sàng của cả 2 đấu thủ (cần bấm Sẵn sàng lại)"*. Hỗ trợ 2 góc nhìn (Người nhận đề nghị / Người gửi đề nghị kèm nút Rút đề nghị). |
| 3 | `SCR-CREATE-ROOM` | Tạo phòng mới | Sảnh cờ (`SCR-LOBBY`) | Tên phòng 1-60 ký tự; Chế độ phòng: `PUBLIC` / `CODE_ONLY` / `LOCKED`; Thời gian ván: Không giới hạn (kèm chống treo ván), 5p, 10p, 15p; Checkbox cho phép người xem chat. |
| 4 | `SCR-JOIN-BY-CODE` | Nhập mã phòng 8 ký tự | Sảnh cờ (`SCR-LOBBY`) | Input format `XXXX - XXXX` tự động viết hoa; nút "Dán từ clipboard"; Giải thích rõ: Máy chủ tự cấp quyền Ghế thi đấu hoặc Người xem theo chỗ trống. |
| 5 | `SCR-INVITE-MODAL` | Mời người khác (3 tab) | Phòng chờ / Phòng chơi | **Tab 1:** Bạn bè trực tuyến (nút Mời đấu / Mời xem, hạn 10p). **Tab 2:** Mã phòng 8 ký tự + nút Đổi mã mới (Rotate) kèm cảnh báo SCR-RULE-03: *"Đổi mã sẽ đưa toàn bộ người xem hiện tại ra ngoài!"*. **Tab 3:** Liên kết mời URL (tách link Đấu thủ vs link Người xem). |
| 6 | `SCR-ROOM-SETTINGS` | Cài đặt phòng cờ | Trong phòng (Chủ phòng) | Đổi chế độ riêng tư (Cảnh báo đổi sang LOCKED sẽ đưa người xem ra ngoài); Đổi thời gian ván (chỉ chỉnh được ở WAITING, reset Sẵn sàng cả 2); Bật/tắt quyền Chat & Camera của người xem. |
| 7 | `SCR-SPECTATOR-LIST` | Danh sách người xem & Đuổi | Khung Trong phòng | Tối đa 5 người xem (0/5 -> 5/5). Hiển thị avatar, username, thời gian vào phòng, trạng thái xem camera. Nút "Đuổi khỏi phòng" (Kick) mở `SCR-CONFIRM-KICK`. |
| 8 | `SCR-CONFIRM-KICK` | Xác nhận đuổi người xem | Mở từ Danh sách người xem | Cảnh báo chữ to bắt buộc SCR-RULE-03: *"NGƯỜI NÀY SẼ KHÔNG THỂ VÀO LẠI PHÒNG NÀY!"*. Thu hồi tức thì quyền tham gia, chat và luồng media. |
| 9 | `SCR-CONFIRM-RESIGN` | Xác nhận đầu hàng | Phòng chơi (`SCR-GAME-ROOM`) | Cảnh báo chữ to bắt buộc SCR-RULE-03: *"BẠN SẼ THUA VÁN NÀY NGAY LẬP TỨC."*. Quyết định không thể hoàn tác, cập nhật ELO ngay lập tức. Nút đỏ nguy hiểm `danger-solid`. |
| 10 | `SCR-CONFIRM-LEAVE` | Xác nhận rời phòng | Phòng cờ | Cảnh báo ngữ cảnh SCR-RULE-03: Nếu đang thi đấu: *"Rời phòng lúc này được tính là ĐẦU HÀNG!"*; Nếu ở phòng chờ: *"Bạn sẽ rời ghế chơi"*; Nếu là chủ phòng: Chuyển giao quyền chủ phòng hoặc đóng phòng. |
| 11 | `SCR-PROPOSAL-PROMPT` | Đề nghị hoà / đi lại (30s) | Khung Ván đấu | Đồng hồ đếm ngược 30 giây. Quy tắc SCR-RULE-06: *"Đóng khung bằng nút X chỉ thu gọn giao diện, không từ chối trên máy chủ."* Nút Đồng ý, Từ chối, hoặc Rút lại đề nghị. |
| 12 | `SCR-INACTIVITY-PROMPT` | Cảnh báo chống treo ván | Vùng cảnh báo Ván cờ | Quy tắc SCR-RULE-07: **Vùng cảnh báo KHÔNG MODAL**, không che bàn cờ, không che nút Đầu hàng, không trap focus. Đếm ngược 30 giây. Nút [Tôi còn chơi (+3 phút)] gia hạn tối đa 2 lần. |
| 13 | `SCR-MATCH-RESULT` | Kết quả ván đấu | Phòng chơi kết thúc | Banner Vinh danh trang nhã; Ghi rõ nguyên nhân (Chiếu bí, Đầu hàng, Hết giờ, Treo ván, Mất mạng, Hòa); Biến động ELO (+15 / -15); 3 nút hành động: [Tái đấu] (giữ ghế 10p, khóa nếu đối thủ rời), [Xem lại ván], [Rời phòng]. |
| 14 | `SCR-CHAT-PANEL` | Khung chat 2 kênh | Khung Trong phòng | 2 Tab: Kênh riêng đấu thủ (`PLAYERS`) và Kênh chung cả phòng (`ROOM`). **Công tắc "Ẩn kênh chung"** giúp người chơi tập trung đánh cờ, chống phân tâm. |
| 15 | `SCR-MEDIA-PANEL` | Khung Camera & Micro | Khung Trong phòng | Quản lý độc lập: Camera có 3 mức (Tắt / Chỉ đối thủ / Cả phòng) kèm xem trước; Micro có toggle Bật/Tắt và **Thước đo âm lượng thời gian thực (VU meter)**. Tắt thiết bị thu hồi quyền ngay tại hạ tầng SFU. |
| 16 | `SCR-MEDIA-TAB-SWITCH` | Chuyển Camera/Mic từ tab khác | Modal Thu hồi Media | Theo chuẩn DEC-033/034: Phát hiện tab khác đang chạy media, thông báo xung đột thiết bị, nút [Chuyển sang tab này] thu hồi tab cũ và cấp tài nguyên mới ở trạng thái mặc định Tắt. |
| 17 | `SCR-RECONNECTING` | Lớp phủ mất mạng (60s) | Lớp phủ toàn cục | Hiển thị khi ngắt kết nối WebSocket/mạng. **Đồng hồ đếm ngược 60 giây giữ ghế cờ**. Vòng quay tải (Spinner) và nút "Thử kết nối lại ngay". |
| 18 | `SCR-ACCESS-DENIED` | Thông báo từ chối truy cập | Màn hình Toàn cục | Con dấu Cấm tao nhã. Hiển thị 4 lý do từ chối: Phòng đầy (2 đấu thủ, 5 người xem), Bị chủ phòng đuổi, Phòng ở chế độ LOCKED, Mã/link không hợp lệ hoặc hết hạn. Nút [Về sảnh cờ] & [Nhập mã khác]. |
| 19 | `SCR-NAVBAR` | Thanh điều hướng toàn cục | Toàn cục sau đăng nhập | Logo, liên kết điều hướng, chuông thông báo có huy hiệu đỏ số lời mời chờ (mở popover lời mời nhanh), avatar người dùng xổ xuống Cài đặt hồ sơ & Đăng xuất (cảnh báo dừng camera/mic). |

---

## 5. NĂM TRẠNG THÁI BẮT BUỘC TRÊN TOÀN BỘ 36 MÀN HÌNH (`SCR-RULE-01`)
Mọi màn hình và modal đều hỗ trợ kiểm thử 5 trạng thái thông qua thanh công cụ Review Toolbar:
1. **Đang tải (Loading):** Skeleton shimmer animation, giữ nguyên vị trí layout, không làm giật trang.
2. **Trống (Empty):** Hình ảnh con dấu và thông điệp tiếng Việt giải thích vì sao trống + gợi ý hành động tiếp theo.
3. **Lỗi (Error):** Khung viền đỏ chu sa, thông điệp lỗi rõ ràng + nút "Thử lại".
4. **Vô hiệu (Disabled):** Nút/form bị làm mờ kèm dòng giải thích lý do vì sao chưa dùng được (bắt buộc theo `SCR-RULE-01`).
5. **Thành công (Success / Normal):** Dữ liệu mẫu chuẩn xác, tương tác mượt mà.

---

## 6. HƯỚNG DẪN DUYỆT TRÊN BẢN NGUYÊN MẪU TƯƠNG TÁC (`index.html`)
1. **Duyệt 4 Màn cốt lõi (ĐÃ CHỐT):** Bấm tab `⭐ 4 Cốt lõi` trên thanh Sidebar. Cả 4 màn hình đều có huy hiệu xanh `✓ ĐÃ CHỐT` xác nhận hoàn thiện.
2. **Duyệt 19 Modals & Khung chi tiết:** Bấm tab `🪟 19 Modals` trên Sidebar để kiểm tra từng modal. Bạn có thể:
   - Chuyển đổi giữa chế độ `👁 Bối cảnh thực tế` (xem modal đè trên bàn cờ/sảnh/phòng chờ) và `🔲 Khung độc lập`.
   - Bấm `⚡ Thử tương tác thật` để mở modal trực tiếp trên màn hình, thử nghiệm đóng bằng nút `X`, phím `Esc`, hoặc bấm ra ngoài.
   - Thử nghiệm các nút mở modal trực tiếp ngay trong 4 màn cốt lõi (ví dụ: bấm "Đầu hàng", "Cài đặt Media", "Mời bạn", "Tạo phòng").
3. **Duyệt 36 ID toàn diện:** Bấm tab `36 ID` để xem toàn bộ 17 trang và 19 khung chức năng của dự án.
4. **Kiểm tra Responsive:** Chọn khổ màn hình từ Desktop 1366px, 1920px đến Mobile 390px, 360px để kiểm chứng không có lỗi tràn cuộn ngang (DT-15).

---

## 7. BÁO CÁO KIỂM THỬ TƯƠNG TÁC PHÍM ESC & BẤM RA NGOÀI (SCR-RULE-02, SCR-RULE-06, §5)

Toàn bộ 19 Modals & Khung chức năng đã được rà soát và kiểm định tương tác đóng bằng **Phím `Esc`**, **Bấm ra ngoài vùng tối (Backdrop Click)** và **Nút `✕`** theo đúng các quy chuẩn thiết kế:

### 7.1. Phân loại và Quy tắc xử lý
| Nhóm | Số lượng | Quy chuẩn áp dụng | Hành vi phím `Esc` | Hành vi Bấm ra ngoài | Hành vi Nút `✕` | Kết quả |
|---|:---:|---|---|---|---|:---:|
| **Modals tiêu chuẩn** | 16 | **`SCR-RULE-02`** | Đóng modal tức thì | Đóng modal tức thì | Đóng modal | **100% ĐẠT** |
| **Khung đề nghị** | 1 | **`SCR-RULE-06`** (`SCR-PROPOSAL-PROMPT`) | Thu gọn UI, giữ đề nghị pending trên server | Thu gọn UI, giữ đề nghị pending trên server | Thu gọn UI | **100% ĐẠT** |
| **Ngoại lệ chặn đóng** | 2 | **Section 5** (`SCR-RECONNECTING`, `SCR-INACTIVITY-PROMPT`) | **Chặn đóng** (Hiệu ứng rung thẻ + Thông báo bảo vệ ván cờ) | **Chặn đóng** (Không cho đóng khi mất mạng/treo ván) | Không có nút ✕ (§5) | **100% ĐẠT** |

### 7.2. Chi tiết 19 Modals đã kiểm chứng
1. `SCR-USER-SEARCH`: Đóng bằng Esc ✓, Bấm ngoài ✓, Nút ✕ ✓
2. `SCR-SIDE-SWAP-PROMPT`: Đóng bằng Esc ✓, Bấm ngoài ✓, Nút ✕ ✓, Nút Đóng (Để sau) ✓
3. `SCR-CREATE-ROOM`: Đóng bằng Esc ✓, Bấm ngoài ✓, Nút ✕ ✓, Nút Hủy ✓
4. `SCR-JOIN-BY-CODE`: Đóng bằng Esc ✓, Bấm ngoài ✓, Nút ✕ ✓, Nút Đóng ✓
5. `SCR-INVITE-MODAL`: Đóng bằng Esc ✓, Bấm ngoài ✓, Nút ✕ ✓, Nút Đóng ✓
6. `SCR-ROOM-SETTINGS`: Đóng bằng Esc ✓, Bấm ngoài ✓, Nút ✕ ✓, Nút Hủy ✓
7. `SCR-SPECTATOR-LIST`: Đóng bằng Esc ✓, Bấm ngoài ✓, Nút ✕ ✓, Nút Đóng ✓
8. `SCR-CONFIRM-KICK`: Đóng bằng Esc ✓, Bấm ngoài ✓, Nút ✕ ✓, Nút Hủy bỏ ✓
9. `SCR-CONFIRM-RESIGN`: Đóng bằng Esc ✓, Bấm ngoài ✓, Nút ✕ ✓, Nút Tiếp tục thi đấu ✓
10. `SCR-CONFIRM-LEAVE`: Đóng bằng Esc ✓, Bấm ngoài ✓, Nút ✕ ✓, Nút Ở lại phòng ✓
11. `SCR-PROPOSAL-PROMPT` (Hòa/Đi lại): Thu gọn bằng Esc/Bấm ngoài/✕ theo **`SCR-RULE-06`**, duy trì trạng thái hiệu lực trên máy chủ, ghim huy hiệu `[Mở lại đề nghị]` trên bàn cờ.
12. `SCR-INACTIVITY-PROMPT` (Chống treo ván): Không modal, chặn đóng tùy ý theo **`SCR-RULE-07 & §5`**, không có nút ✕; cờ thủ phải đi cờ hoặc bấm xác nhận.
13. `SCR-MATCH-RESULT`: Đóng bằng Esc ✓, Bấm ngoài ✓, Nút ✕ ✓
14. `SCR-CHAT-PANEL`: Đóng bằng Esc ✓, Bấm ngoài ✓, Nút ✕ ✓ khi mở dưới dạng khung modal.
15. `SCR-MEDIA-PANEL`: Đóng bằng Esc ✓, Bấm ngoài ✓, Nút ✕ ✓, Nút Đóng ✓
16. `SCR-MEDIA-TAB-SWITCH`: Đóng bằng Esc ✓, Bấm ngoài ✓, Nút ✕ ✓, Nút Để nguyên ở tab kia ✓
17. `SCR-RECONNECTING` (Mất mạng 60s): **Section 5 Ngoại lệ** — Chặn đóng khi nhấn Esc hoặc bấm ra ngoài để bảo vệ dữ liệu ván đấu và tránh thao tác nhầm; thẻ rung nhẹ (shake animation) kèm cảnh báo giải thích rõ lý do.
18. `SCR-ACCESS-DENIED`: Đóng bằng Esc ✓, Bấm ngoài ✓, Nút ✕ ✓, Nút Quay về sảnh ✓
19. `SCR-NAVBAR`: Popover Hộp thư lời mời và Menu hồ sơ đóng bằng phím Esc ✓ và bấm ra ngoài ✓

### 7.3. Công cụ kiểm thử trực quan trên bản Prototype (`index.html`)
- **Nút "🧪 Kiểm tra Esc & Bấm ngoài" trên Toolbar:** Mở Bảng kiểm định tương tác trực quan cho toàn bộ 19 modal.
- **Hệ thống Toast thông báo thời gian thực:** Phản hồi ngay lập tức nguyên nhân đóng modal, quy chuẩn được kích hoạt (`SCR-RULE-02`, `SCR-RULE-06`, hoặc `Section 5`).
- **Nút "🤖 Auto Test" & "⚡ Chạy kiểm thử tự động 19 Modal":** Cho phép quản lý kiểm tra hàng loạt trong 5 giây mà không cần thao tác thủ công từng màn.
