# DANH MỤC MÀN HÌNH

**ID:** `SCR` · **Trạng thái:** Đặc tả đã rà soát; chưa kiểm thử giao diện · **Cập nhật:** 2026-09-22

Mọi trang, cửa sổ và khung quan trọng. Trạng thái cụ thể cho từng ID ở [screen-states](screen-states.md); §3 chỉ định nghĩa cách đọc bảng.

---

## 1. TRANG (có địa chỉ riêng)

| ID | Màn hình | Địa chỉ | Ai vào được | Yêu cầu |
|---|---|---|---|---|
| `SCR-LOGIN` | Đăng nhập | `/login` | Khách | [REQ-AUTH](../01-requirements/REQ-AUTH.md) |
| `SCR-REGISTER` | Đăng ký | `/register` | Khách | REQ-AUTH |
| `SCR-FORGOT-PASSWORD` | Quên mật khẩu | `/forgot-password` | Tất cả | REQ-AUTH |
| `SCR-RESET-PASSWORD` | Đặt mật khẩu mới | `/reset-password` | Có link hợp lệ | REQ-AUTH |
| `SCR-VERIFY-NOTICE` | Nhắc xác minh email | `/verify` | Chưa xác minh | REQ-AUTH |
| `SCR-ONBOARDING` | Chọn username | `/onboarding` | Chưa có username | REQ-AUTH |
| `SCR-LOBBY` | Sảnh | `/lobby` | Người dùng | [REQ-LOBBY](../01-requirements/REQ-LOBBY.md) |
| `SCR-FRIENDS` | Bạn bè | `/friends` | Người dùng | [REQ-PROFILE-FRIENDS](../01-requirements/REQ-PROFILE-FRIENDS.md) |
| `SCR-INVITATION-INBOX` ⭐ | **Hộp thư lời mời** | `/invitations` | Người dùng | [REQ-INVITE](../01-requirements/REQ-INVITE.md) |
| `SCR-WAITING-ROOM` | Phòng chờ, có chat ngay theo DEC-028 | `/rooms/:id` | Thành viên | [REQ-ROOM](../01-requirements/REQ-ROOM.md) · [REQ-CHAT](../01-requirements/REQ-CHAT.md) |
| `SCR-GAME-ROOM` | Phòng chơi | `/rooms/:id` | Thành viên | [REQ-MATCH](../01-requirements/REQ-MATCH.md) |
| `SCR-AI-SETUP` | Chọn cấp độ máy | `/ai/new` | Người dùng | [REQ-AI](../01-requirements/REQ-AI.md) |
| `SCR-AI-GAME` | Ván với máy | `/ai/:id` | Người chơi của ván | REQ-AI |
| `SCR-HISTORY` | Lịch sử ván | `/history` | Người dùng | [REQ-HISTORY-REMATCH](../01-requirements/REQ-HISTORY-REMATCH.md) |
| `SCR-REPLAY` | Xem lại ván | `/history/:id` hoặc `/rooms/:roomId/replay/:matchId` | Lịch sử: PLAYER của ván; trong phòng: thành viên hiện hành FINISHED | REQ-HISTORY-REMATCH |
| `SCR-PROFILE-SETTINGS` | Cài đặt hồ sơ | `/settings` | Người dùng | REQ-AUTH |
| `SCR-JOIN-LINK` | Nhận link mời | `/join` | Tất cả | REQ-INVITE |

⭐ = màn hình **mới** từ đợt audit BA.

---

## 2. CỬA SỔ VÀ KHUNG (không có địa chỉ riêng)

| ID | Tên | Xuất hiện ở | Yêu cầu |
|---|---|---|---|
| `SCR-USER-SEARCH` | Tìm theo username | Trang bạn bè | REQ-PROFILE-FRIENDS |
| `SCR-SIDE-SWAP-PROMPT` | Xin đổi bên trước ván, hạn 30 giây | Phòng chờ | REQ-ROOM |
| `SCR-CREATE-ROOM` | Tạo phòng | Sảnh | REQ-ROOM |
| `SCR-JOIN-BY-CODE` | Nhập mã phòng | Sảnh | REQ-INVITE |
| `SCR-INVITE-MODAL` | Mời người khác (3 tab) | Phòng | REQ-INVITE |
| `SCR-ROOM-SETTINGS` | Cài đặt phòng | Phòng (chủ phòng) | REQ-ROOM |
| `SCR-SPECTATOR-LIST` ⭐ | Danh sách người xem + **nút Đuổi** | Phòng | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) |
| `SCR-CONFIRM-KICK` ⭐ | Xác nhận đuổi người xem | Danh sách người xem | REQ-SPECTATOR |
| `SCR-CONFIRM-RESIGN` | Xác nhận đầu hàng | Phòng chơi | [REQ-GAME-ACTIONS](../01-requirements/REQ-GAME-ACTIONS.md) |
| `SCR-CONFIRM-LEAVE` | Xác nhận rời phòng | Phòng | REQ-ROOM |
| `SCR-PROPOSAL-PROMPT` | Đề nghị hoà / đi lại | Phòng chơi | REQ-GAME-ACTIONS |
| `SCR-INACTIVITY-PROMPT` ⭐ | **"Bạn còn trong ván đấu không?"** | Phòng chơi | [REQ-INACTIVITY](../01-requirements/REQ-INACTIVITY.md) |
| `SCR-MATCH-RESULT` | Kết quả ván | Phòng chơi | REQ-MATCH |
| `SCR-CHAT-PANEL` | Khung chat (**2 khung** cho người chơi, **1** cho người xem) + **công tắc ẩn/hiện kênh chung** | Phòng | [REQ-CHAT](../01-requirements/REQ-CHAT.md) |
| `SCR-MEDIA-PANEL` | Khung camera/mic | Phòng | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) |
| `SCR-MEDIA-TAB-SWITCH` ⭐ | **Camera/mic đang bật ở tab khác** + nút *Chuyển sang tab này* | Phòng | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) |
| `SCR-RECONNECTING` | Lớp phủ mất kết nối | Mọi trang | REQ-DISCONNECT |
| `SCR-ACCESS-DENIED` | Không vào được | Toàn cục | REQ-SPECTATOR |
| `SCR-NAVBAR` | Thanh điều hướng + **chỉ báo lời mời** ⭐ | Mọi trang sau đăng nhập | REQ-INVITE |

---

**Chuyển phòng chờ → ván đầu:** SCR-CHAT-PANEL giữ lịch sử được phép đọc, không làm trống. Người mới thay ghế không thấy tin riêng cặp cũ; dữ liệu được lọc tại máy chủ theo REQ-CHAT BR-CHT-25/26 (`DEC-029`).

**Phòng chờ offline (DEC-031):** hiện người mất kết nối và thời gian giữ ghế 60 giây; không bắt đầu khi có người offline; người nối lại xác nhận ready lại. **FINISHED (DEC-032):** thiếu đối thủ thì vô hiệu tái đấu, giải thích cần rời/tạo phòng mới để thay người.

**SCR-MEDIA-TAB-SWITCH (`DEC-033/034`):** đang chuyển/chờ ngắt → thành công với nguồn mới Tắt, hoặc lỗi + Thử lại. Không bật được nguồn mới trước xác nhận; chuyển camera không reset micro và ngược lại.

**SCR-WAITING-ROOM / SCR-ROOM-SETTINGS (`DEC-035/036`):** theo [BR-ROOM-21/22](../01-requirements/REQ-ROOM.md), một PLAYER vẫn bấm/bỏ Sẵn sàng được; chưa có đối thủ thì hiện đang chờ. Đổi sang giá trị thời gian khác thành công cập nhật cấu hình, xoá dấu sẵn sàng cả hai và báo “Thời gian ván đã thay đổi. Vui lòng sẵn sàng lại.” Chỉ chuyển sang bàn cờ khi máy chủ xác nhận đủ điều kiện bắt đầu.

**SCR-LOGIN (`DEC-038/040`):** checkbox Ghi nhớ mặc định tick. Bỏ chọn: “Phiên tạm: hết sau 30 phút không hoạt động hoặc tối đa 12 giờ. Trình duyệt có thể khôi phục phiên khi mở lại tab; hãy đăng xuất để kết thúc chắc chắn.” Chọn: “Giữ đăng nhập 30 ngày từ lần sử dụng chủ động gần nhất.” Quy tắc nguồn ở [REQ-AUTH](../01-requirements/REQ-AUTH.md).

## 3. NĂM TRẠNG THÁI BẮT BUỘC

**Mọi màn hình** trong danh mục trên phải định nghĩa đủ:

| Trạng thái | Nghĩa là | Quy tắc |
|---|---|---|
| **Đang tải** | Đang chờ dữ liệu | Khung xương, **không** để trắng trơn |
| **Trống** | Không có dữ liệu | Giải thích **vì sao** + gợi ý hành động tiếp |
| **Lỗi** | Không lấy được dữ liệu | Nói rõ lỗi + nút **Thử lại** |
| **Vô hiệu** | Có nhưng chưa dùng được | **Phải giải thích vì sao** bị vô hiệu |
| **Thành công** | Dữ liệu bình thường | |

**`SCR-RULE-01`** — Trạng thái **vô hiệu** mà **không giải thích** là lỗi tài liệu và lỗi sản phẩm. Người dùng phải biết cần làm gì để dùng được.

---

## 4. QUY TẮC CHO CỬA SỔ

| ID | Luật |
|---|---|
| **SCR-RULE-02** | Mọi cửa sổ phải đóng được bằng: nút **X**, phím `Esc`, và bấm ra ngoài — **trừ** những cửa sổ ở §5 |
| **SCR-RULE-03** | Cửa sổ xác nhận việc **không đảo ngược được** phải ghi rõ hậu quả bằng chữ |
| **SCR-RULE-04** | Nút gửi bị **vô hiệu** khi đang xử lý, tránh bấm hai lần |
| **SCR-RULE-05** | Thông báo tạm **không được che** nút Đầu hàng |

---

**`SCR-RULE-06`** — Đóng khung đề nghị bằng X/Esc/bấm ngoài chỉ thu gọn UI, không từ chối/huỷ trên máy chủ. Pending vẫn có chỉ báo mở lại; muốn rút phải bấm hành động Rút đề nghị. Hạn vẫn chạy.

**`SCR-RULE-07`** — Cảnh báo chống treo là vùng cảnh báo không modal: không trap focus, không phủ bàn cờ/nút Đầu hàng. Còn cảnh báo vẫn đi nước/đầu hàng được; countdown không đọc liên tục mỗi giây cho trình đọc màn hình. Không cho X ẩn cảnh báo bắt buộc.

## 5. CÁC CỬA SỔ KHÔNG ĐÓNG ĐƯỢC TUỲ Ý

| Cửa sổ | Vì sao | Đóng khi nào |
|---|---|---|
| `SCR-INACTIVITY-PROMPT` ⭐ | Cảnh báo bắt buộc, **không modal**, vẫn truy cập bàn cờ/Đầu hàng | Xác nhận hợp lệ · đi nước · ván kết thúc/hết giờ |
| `SCR-RECONNECTING` | Đang mất kết nối thật | Nối lại được |
| `SCR-VERIFY-NOTICE` | Trạng thái chặn | Xác minh xong hoặc đăng xuất |
| `SCR-ONBOARDING` | Trạng thái chặn | Chọn username xong |

---

## 6. CÁC XÁC NHẬN BẮT BUỘC PHẢI CÓ

| Hành động | Cửa sổ | Phải ghi rõ |
|---|---|---|
| Đầu hàng | `SCR-CONFIRM-RESIGN` | *"Bạn sẽ **thua** ván này ngay lập tức"* |
| Rời phòng khi **đang chơi** | `SCR-CONFIRM-LEAVE` | *"Rời lúc này được tính là **đầu hàng**"* |
| **Đuổi người xem** ⭐ | `SCR-CONFIRM-KICK` | *"Người này sẽ **không vào lại được** phòng này"* |
| **Đổi mã xem** | Trong `SCR-INVITE-MODAL` | *"**Toàn bộ** người xem hiện tại sẽ bị đưa ra"* |
| Đổi sang chế độ kín hơn | `SCR-ROOM-SETTINGS` | *"**Toàn bộ** người xem sẽ bị đưa ra"* |
| Đăng xuất **mọi thiết bị** | Menu hồ sơ | *"Camera/mic đang bật sẽ bị dừng"* |

---

## 7. ĐỐI CHIẾU: CHỨC NĂNG ↔ MÀN HÌNH

Kiểm tra **không có chức năng nào thiếu màn hình** và **không có màn hình nào thừa**:

| Yêu cầu | Màn hình phục vụ | Đủ? |
|---|---|:---:|
| R01 Tài khoản | LOGIN · REGISTER · FORGOT · RESET · VERIFY · ONBOARDING · SETTINGS | ✅ |
| R02 Bạn bè | FRIENDS · NAVBAR | ✅ |
| R03 Phòng | LOBBY · CREATE-ROOM · WAITING-ROOM | ✅ |
| R04 Riêng tư + người xem | ROOM-SETTINGS · SPECTATOR-LIST · JOIN-BY-CODE · ACCESS-DENIED | ✅ |
| R05 Bàn cờ | GAME-ROOM (bàn cờ) | ✅ |
| R06 Đồng bộ | GAME-ROOM · RECONNECTING | ✅ |
| R07 Luật kết thúc | MATCH-RESULT | ✅ |
| R08 Đồng hồ | CREATE-ROOM · GAME-ROOM | ✅ |
| R09 Mất kết nối | RECONNECTING · MEDIA-TAB-SWITCH | ✅ |
| R10 Chat 2 kênh (riêng + chung, có công tắc ẩn/hiện) | CHAT-PANEL | ✅ |
| R11 Camera/mic | MEDIA-PANEL | ✅ |
| R12 Chơi với máy | AI-SETUP · AI-GAME | ✅ |
| R13 Thao tác trong ván | CONFIRM-RESIGN · PROPOSAL-PROMPT | ✅ |
| R14 Tái đấu + lịch sử | MATCH-RESULT · HISTORY · REPLAY | ✅ |
| R16 Local và triển khai Internet | Không phải màn hình sản phẩm; runbook và bằng chứng ISSUE-136/137/138 | ✅ |
| R15 Máy tính + điện thoại | (toàn bộ, xem [design-tokens](design-tokens.md)) | ✅ |
| **R17 Chống treo ván** ⭐ | **INACTIVITY-PROMPT** + dòng trạng thái ở GAME-ROOM | ✅ |
| **R18 Đuổi người xem** ⭐ | **SPECTATOR-LIST · CONFIRM-KICK** | ✅ |
| **R19 Hộp thư lời mời** ⭐ | **INVITATION-INBOX** + chỉ báo ở NAVBAR | ✅ |

**Không có màn hình nào không phục vụ yêu cầu nào.**

---

## 8. HÀNH ĐỘNG DẪN ĐI ĐÂU

Kiểm tra **không có nút nào không có đích**:

| Từ màn hình | Hành động | Tới |
|---|---|---|
| LOGIN | Đăng nhập thành công | LOBBY (hoặc VERIFY / ONBOARDING) |
| LOGIN | Quên mật khẩu | FORGOT-PASSWORD |
| LOGIN | Chưa có tài khoản | REGISTER |
| REGISTER | Đăng ký xong | VERIFY-NOTICE |
| VERIFY-NOTICE | Xác minh xong | LOBBY |
| ONBOARDING | Chọn username xong | LOBBY |
| LOBBY | Tạo phòng | CREATE-ROOM → WAITING-ROOM |
| LOBBY | Bấm vào phòng PUBLIC | WAITING-ROOM hoặc GAME-ROOM theo trạng thái máy chủ, vai trò SPECTATOR |
| LOBBY | Nhập mã | JOIN-BY-CODE → WAITING/GAME-ROOM hoặc MATCH-RESULT khi WATCH vào FINISHED |
| LOBBY | Chơi với máy | AI-SETUP → AI-GAME |
| NAVBAR | Chỉ báo lời mời ⭐ | INVITATION-INBOX |
| INVITATION-INBOX | Chấp nhận | WAITING-ROOM / GAME-ROOM / MATCH-RESULT theo trạng thái và quyền PLAY/WATCH; lỗi không cấp ghế |
| WAITING-ROOM | Máy chủ xác nhận đủ hai PLAYER online và sẵn sàng theo cấu hình hiện hành | GAME-ROOM |
| WAITING-ROOM | Xin đổi bên | SIDE-SWAP-PROMPT; đồng ý ⇒ xoá ready cả hai, giữ WAITING |
| WAITING-ROOM | Rời phòng | LOBBY |
| GAME-ROOM | Ván kết thúc | MATCH-RESULT |
| MATCH-RESULT | Tái đấu | GAME-ROOM (ván mới) |
| MATCH-RESULT | Xem lại | REPLAY trong phòng; lịch sử riêng chỉ cho PLAYER của ván |
| MATCH-RESULT | Rời phòng | LOBBY |
| SPECTATOR-LIST | Đuổi ⭐ | CONFIRM-KICK → về SPECTATOR-LIST |
| (bị đuổi) | — | LOBBY + thông báo |
| ACCESS-DENIED | Về sảnh | LOBBY |
| HISTORY | Bấm vào một ván | REPLAY |

---

## 9. LIÊN QUAN

[design-tokens.md](design-tokens.md) · [../02-flows/](../02-flows/) · [../01-requirements/](../01-requirements/) · [../04-business-rules/permissions.md](../04-business-rules/permissions.md)
