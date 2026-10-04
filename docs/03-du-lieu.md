# 03 · Mô hình dữ liệu

> **Bản hoàn thiện 04/10/2026, chờ Product Owner review bản viết.** Nền tảng đã duyệt 03/10 và các quyết định bổ sung đã duyệt 04/10 được giữ nguyên. Nhãn đã duyệt bên dưới ghi lịch sử nền, không có nghĩa toàn bộ câu chữ/thiết kế mới đã được review; không có mã nguồn hay test ứng dụng được chạy trong đợt tài liệu này.

**Giai đoạn 2 · Trạng thái: **nền tảng đã duyệt 03/10/2026; bản viết 04/10/2026 chờ Product Owner review** (các giả định kỹ thuật chưa đo vẫn cần thử nghiệm ở đầu Giai đoạn 4)** · Căn cứ: [BA-SCOPE-DECISIONS.md](../BA-SCOPE-DECISIONS.md). Tên bảng và cột là **đề xuất**; công nghệ lưu trữ là PostgreSQL qua Supabase (README, danh sách dự kiến). Thay đổi cấu trúc bằng **tệp SQL migration**, không dùng `prisma migrate` (AGENTS §4.4). Cột "P" cho biết bảng cần ở P1 hay P2.

Nguyên tắc chung:
* Mọi khoá chính là `uuid` (trừ khi ghi khác). Dữ liệu gắn với `user_id` **bất biến** nên đổi username không mất dữ liệu (BA 1.6).
* Thời gian dùng `timestamptz` (UTC). Hiển thị theo múi giờ trình duyệt.
* **Không có quyền thì không nhận dữ liệu**: lọc ở máy chủ và bằng chính sách RLS, không gửi hết rồi ẩn ở giao diện (AGENTS §4.4).
* Dữ liệu tạm (hàng đợi ghép trận, trạng thái đồng hồ đang chạy, kết nối) nằm **trong bộ nhớ máy chủ**, không lưu cơ sở dữ liệu (xem [04-kien-truc.md](04-kien-truc.md)).

---

## 1. Danh sách thực thể

| # | Bảng | Mục đích | P |
|---|---|---|---|
| 1 | `profiles` | Hồ sơ người dùng (liên kết `auth.users`) | P1 |
| 2 | `username_reservations` | Giữ chỗ username cũ 30 ngày | P2 |
| 3 | `rooms` | Phòng chơi | P1 |
| 4 | `room_participants` | Ai đang ở phòng, ngồi ghế hay xem | P1 |
| 5 | `room_blocks` | Người bị đuổi, chặn đến khi phòng đóng | P1 |
| 6 | `matches` | Một ván cờ | P1 |
| 7 | `match_moves` | Cây nước đi của ván | P1 |
| 8 | `command_receipts` | Biên lai lệnh chống xử lý trùng | P1 |
| 9 | `chat_messages` | Tin nhắn trong phòng | P1 |
| 10 | `friendships`, `friend_declines` | Quan hệ bạn bè và lịch sử từ chối có hướng | P1 |
| 11 | `user_stats` | Elo, thắng/thua/hoà (Ranked) | P2 |
| 12 | `direct_conversations`, `direct_messages` | Chat 1-1 giữa bạn bè | P2 |
| 13 | `ai_games` | Thông tin riêng của ván với máy | P1 |

Khách (`GUEST`, P2) **không có dòng trong `profiles`**; danh tính Khách chỉ tồn tại trong phiên (xem 4.1).

---

## 2. Chi tiết từng bảng

### 2.1 `profiles` (P1)

| Cột | Kiểu | Ràng buộc / ghi chú |
|---|---|---|
| `user_id` | uuid PK | = `auth.users.id` (Supabase Auth) |
| `username` | citext | **UNIQUE không phân biệt hoa thường**, kiểm tra `^[a-zA-Z0-9_]{3,20}$` (BA 1.4) |
| `display_name` | text | 2–30 ký tự; mặc định bằng `username` |
| `email` | text | Chỉ đọc, lấy từ Auth; **không đổi** (BA 1.6); cưỡng chế tại Auth, không chỉ ở giao diện ([04] §3.1) |
| `created_at` | timestamptz | |
| `last_seen_at` | timestamptz | Cập nhật khi kết nối; dùng cho trạng thái online (có thể lấy từ bộ nhớ) |
| `completed_at` | timestamptz NULL | Mốc hoàn tất ghi hồ sơ. Quyền dùng cần cả giá trị này và không còn `PENDING`. Nếu đã có mốc nhưng còn cờ thì **phục hồi xoá cờ, không xoá tài khoản**; chỉ tài khoản email chưa có mốc, quá thời hạn, mới bị dọn. Nguồn: BA 1.1 và [04] mục 3.1 (duyệt 04/10) |

Chỉ mục: `username` (unique). Hồ sơ **chỉ được tạo sau khi OTP đúng** (BA 1.1) và tài khoản chỉ được dùng khi `completed_at` có giá trị **đồng thời không còn PENDING**; trước đó Supabase Auth có thể giữ tạm một bản ghi xác thực chưa xác nhận (Phương án B, [04](04-kien-truc.md) mục 3.1).

### 2.2 `username_reservations` (P2)

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `username` | citext PK | Tên cũ đang bị khoá |
| `owner_id` | uuid | Chủ cũ (chỉ người này lấy lại được) |
| `expires_at` | timestamptz | = lúc đổi + 30 ngày (BA 1.4) |

Kiểm tra trùng username phải xét cả `profiles` và bảng này (chưa hết hạn).

### 2.3 `rooms` (P1)

| Cột | Kiểu | Ràng buộc / ghi chú |
|---|---|---|
| `room_id` | uuid PK | |
| `code` | char(8) | Mã gốc có đúng 8 ký tự, **UNIQUE** khi phòng chưa đóng. Ví dụ lưu `K7M2XQP4`; hiển thị nhóm `K7M2-XQP4` có dấu phân cách, không lưu dấu gạch trong cột `char(8)`. Hợp đồng nhập/lưu thống nhất ở [07] |
| `name` | text | 1–60 ký tự |
| `host_id` | uuid FK `profiles` | Chủ phòng; luôn là người đang ngồi ghế (BA 2.8) |
| `kind` | enum `CASUAL` / `RANKED` | P1 chỉ `CASUAL`; `RANKED` ở P2 |
| `privacy` | enum `PUBLIC` / `CODE_ONLY` / `LOCKED` | CASUAL bật LOCKED cần đủ hai người; đã khoá thì giữ khi mất ghế. RANKED luôn riêng giữa hai người, không có API mở công khai |
| `clock_seconds` | int NULL | 300 / 600 / 900; `NULL` = không giới hạn (P2) |
| `max_spectators` | smallint | **0–5 (mặc định 5)** từ P1 (PO 04/10/2026), không đổi sau khi tạo (BA 2.8) |
| `status` | enum `WAITING` / `PLAYING` / `FINISHED` / `CLOSED` | |
| `invite_token` | text | Token trong link/QR; **đổi mới** khi khoá hoặc mở lại (BA 4.3) |
| `created_at`, `closed_at` | timestamptz | |

Chỉ mục: `code` (unique, phần chưa đóng), `(privacy, status)` cho danh sách Sảnh. Quy tắc nghiệp vụ: phòng `PUBLIC` ở `WAITING`/`PLAYING` mới hiện ở Sảnh.

### 2.4 `room_participants` (P1)

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `room_id` | uuid FK | PK ghép với `user_id` |
| `user_id` | uuid FK | |
| `role` | enum `RED` / `BLACK` / `SPECTATOR` | Ghế đỏ, ghế đen hoặc người xem |
| `ready` | boolean | Sẵn sàng; **reset về false** khi thành phần người ngồi ghế đổi (BA 2.8) |
| `joined_at` | timestamptz | Lúc vào phòng (**không** dùng để lọc chat riêng) |
| `seat_since` | timestamptz NULL | Lúc người này **bắt đầu ngồi ghế hiện tại** (đặt lại mỗi khi đổi vai trò; NULL nếu là người xem). Dùng cho quyền đọc Kênh Riêng |
| `left_at` | timestamptz NULL | |

Ràng buộc: tại mọi thời điểm mỗi phòng tối đa **1 dòng `RED`**, **1 dòng `BLACK`** chưa rời, và số `SPECTATOR` chưa rời **≤ `rooms.max_spectators`**. Một `user_id` chỉ có **một dòng ngồi ghế chưa rời** trong các phòng (ràng buộc duy nhất cục bộ). Quy tắc "một vị trí chơi" của BA 1.8 còn gồm cả **ván với máy (không có `room_id`)**, nên máy chủ phải dùng thêm **sổ vị trí chơi đang dùng có khoá theo người dùng** ([04](04-kien-truc.md) mục 4.2); cần kiểm thử vào phòng và bắt đầu ván với máy cùng lúc.

### 2.5 `room_blocks` (P1)

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `room_id` | uuid FK | PK ghép |
| `blocked_user_id` | uuid FK | |
| `blocked_by` | uuid FK | |
| `created_at` | timestamptz | Hiệu lực đến khi `rooms.status = CLOSED` (BA 4.2) |

### 2.6 `matches` (P1)

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `match_id` | uuid PK | |
| `room_id` | uuid FK NULL | NULL với ván với máy |
| `match_type` | enum `CASUAL` / `RANKED` / `AI` | |
| `red_user_id`, `black_user_id` | uuid NULL | NULL nếu bên đó là máy |
| `clock_seconds` | int NULL | |
| `status` | enum `ONGOING` / `FINISHED` / `INTERRUPTED` / `ABANDONED` | |
| `result` | enum `RED_WIN` / `BLACK_WIN` / `DRAW` / `NONE` | `NONE` cho `INTERRUPTED`, `ABANDONED` |
| `end_reason` | enum | `CHECKMATE`, `STALEMATE`, `RESIGN`, `TIMEOUT`, `DISCONNECT`, `INACTIVITY`, `DRAW_AGREEMENT`, `DRAW_REPETITION`, `DRAW_NO_CAPTURE`, `PERPETUAL_CHECK`, `INTERRUPTED`, `ABANDONED` ([02](02-luat-co-tuong.md) mục 3.3) |
| `current_move_id` | uuid NULL | Con trỏ nước đi hiệu lực hiện tại |
| `version` | int | Tăng mỗi lần trạng thái đổi; dùng làm `matchVersion` |
| `red_remaining_ms`, `black_remaining_ms` | int NULL | Giá trị chốt tại nước đi gần nhất |
| `elo_red_before/after`, `elo_black_before/after` | int NULL | P2, chỉ ván Ranked |
| `started_at`, `ended_at` | timestamptz | |

Ván có Khách (P2) **không ghi `black_user_id`/`red_user_id` của Khách** (để NULL) và không tạo dòng lịch sử cho Khách (BA 1.3).

### 2.7 `match_moves` (P1) — cây nước đi

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `move_id` | uuid PK | |
| `match_id` | uuid FK | |
| `parent_move_id` | uuid NULL | NULL cho nước đầu tiên |
| `ply` | int | Số thứ tự nửa nước (1, 2, 3, …) |
| `from_x/from_y/to_x/to_y` | smallint | Theo hệ toạ độ AGENTS §4.3 |
| `piece`, `captured` | char(1) NULL | Ký tự FEN |
| `is_check` | boolean | Nước này có chiếu không (phục vụ [02](02-luat-co-tuong.md) mục 4) |
| `fen_after` | text | Thế cờ sau nước đi |
| `position_key` | text | Khoá thế cờ (bỏ trường đếm) |
| `halfmove_clock` | smallint | Bộ đếm nửa nước không ăn quân sau nước này |
| `notation` | text | Ký hiệu tiếng Việt ([02](02-luat-co-tuong.md) mục 7) |
| `clock_after_ms` | int NULL | Đồng hồ của người vừa đi sau nước |
| `created_at` | timestamptz | |

Chỉ mục: `(match_id, parent_move_id)`, `(match_id, position_key)`. **Đi lại** = đặt `matches.current_move_id` về nút cha; **không xoá** nút (nước mới tạo một nhánh mới). Nhánh hiệu lực = đi ngược từ `current_move_id` về gốc.

### 2.8 `command_receipts` (P1)

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `command_id` | uuid | Do client sinh; khoá chính gộp `(user_id, command_id)`, khớp hợp đồng chống trùng theo danh tính ở [07] (đề xuất) |
| `match_id` | uuid FK, **nullable** | Rỗng cho lệnh chưa có ván (tạo phòng, chat phòng chờ) (đề xuất) |
| `user_id` | uuid FK | |
| `result` | jsonb | Mã kết quả và định danh tác động để gửi lại khi trùng; **không** lưu dữ liệu đọc nhạy cảm, dữ liệu đọc kèm theo được lọc lại theo quyền hiện tại khi gửi lại ([07] §3; áp cả biên lai trong bộ nhớ của ván với máy) (đề xuất 04/10/2026, chờ PO duyệt) |
| `created_at` | timestamptz | Có thể dọn sau 24 giờ |

### 2.9 `chat_messages` (P1)

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `message_id` | uuid PK | |
| `room_id` | uuid FK | |
| `channel` | enum `PLAYERS_PRIVATE` / `ROOM_PUBLIC` | |
| `sender_id` | uuid | Chủ tin nhắn (người dùng hoặc Khách trong phiên) |
| `body` | text | Tối đa 200 ký tự, đã qua bộ lọc từ cấm (BA 5.3) |
| `kind` | enum `TEXT` / `STICKER` | `STICKER` ở P2 (BA 5.1) |
| `created_at` | timestamptz | |

Xoá khi phòng đóng (BA 5.3): dọn bằng tác vụ định kỳ khi `rooms.status = CLOSED`. Quyền đọc `PLAYERS_PRIVATE`: **chỉ 2 người đang ngồi ghế** và chỉ tin có `created_at ≥` **mốc hình thành cặp ngồi ghế hiện tại**, tức giá trị **lớn hơn** trong hai `room_participants.seat_since` của hai người đang ngồi ghế (PO đã chốt 04/10/2026: đổi cặp thì tin cũ không ai đọc được). Ví dụ: người xem vào 10:00, xuống ghế 10:10 thì **không** đọc được tin riêng 10:00–10:10 (BA 5.3).

### 2.10 `friendships` (P1)

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `requester_id`, `addressee_id` | uuid FK | PK ghép; `requester_id ≠ addressee_id` |
| `status` | enum `PENDING` / `ACCEPTED` / `DECLINED` | |
| `created_at`, `expires_at` | timestamptz | Lời mời tự hết hạn sau 30 ngày |

Giới hạn: theo BA 5.5, tối đa 200 bạn và 50 lời mời đang chờ **tổng gửi + nhận** mỗi người (kiểm cả hai tài khoản trong cùng giao dịch). Cặp không có thứ tự phải duy nhất; hai lời mời ngược chiều đồng thời chỉ giữ một `PENDING`, không tự chuyển `ACCEPTED`. Thu hồi/hết hạn không tăng `friend_declines`; chỉ hành động Từ chối của bên nhận mới tăng bộ đếm.

**`friend_declines` (P1) — lịch sử từ chối có hướng, độc lập vòng đời lời mời:**

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `from_user_id` | uuid | Người **từ chối** (bên nhận lời mời) |
| `to_user_id` | uuid | Người **bị từ chối** (bên gửi lời mời) |
| `count` | smallint | Số lần `from_user_id` đã từ chối `to_user_id`; PK ghép `(from_user_id, to_user_id)` |
| `last_declined_at` | timestamptz | |

`count ≥ 2` thì `to_user_id` **không gửi lại được** lời mời cho `from_user_id` (BA 5.5). Bảng này **không bị dọn** khi lời mời hết hạn hoặc bị xoá, nên không mất lịch sử đếm; hai chiều (A từ chối B và B từ chối A) được đếm **độc lập**.

### 2.11 `user_stats` (P2)

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `user_id` | uuid PK | |
| `elo` | int | Mặc định 1200, tối thiểu 100 (BA 7.1) |
| `ranked_games` | int | Số ván Ranked **hoàn tất** (không tính `INTERRUPTED`) |
| `wins`, `losses`, `draws` | int | Chỉ Ranked |
| `updated_at` | timestamptz | |
| `elo_reached_at` | timestamptz | Lúc đạt Elo hiện tại; chỉ đổi khi Elo sau làm tròn/sàn khác Elo trước ván |

Điều kiện lên bảng xếp hạng: `ranked_games ≥ 5`. Sắp xếp: `elo` giảm dần, rồi `wins` giảm dần, rồi thời điểm đạt Elo hiện tại sớm hơn (BA 7.1); vẫn bằng thì `user_id` tăng dần. Bộ đếm giới hạn ghép cùng cặp lấy các ván đã bắt đầu trong cửa sổ BA 7.2, **không** lấy `ranked_games` vì giới hạn này tính cả `INTERRUPTED`.

### 2.12 `direct_conversations`, `direct_messages` (P2)

Cuộc hội thoại gắn với một **cặp bạn bè** (`user_a < user_b`); tin nhắn `body` ≤ 200 ký tự, có `read_at` để tính chưa đọc. Hiện hay ẩn theo trạng thái `friendships` (huỷ kết bạn thì ẩn, kết bạn lại thì hiện, BA 5.5). RLS: chỉ hai người trong cặp đọc/ghi **và chỉ khi** `friendships.status = ACCEPTED` giữa họ; khi huỷ kết bạn thì không còn đọc hay gửi được (dữ liệu giữ nhưng ẩn, hiện lại khi kết bạn lại). Trạng thái đọc của tin đến chỉ cập nhật khi hiển thị trong vùng nhìn ở tab hoạt động theo BA 5.2; cập nhật idempotent và chỉ người nhận được đánh dấu tin của mình đã đọc. Badge đếm tin đến chưa đọc thuộc quan hệ ACCEPTED hiện tại, không xoá read_at khi huỷ bạn.

### 2.13 `ai_games` (P1)

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `match_id` | uuid PK FK | |
| `difficulty` | enum `EASY` / `MEDIUM` / `HARD` | |
| `player_side` | enum `RED` / `BLACK` | Kết quả sau khi bốc thăm nếu chọn ngẫu nhiên |
| `undo_used` | smallint | Số lần đi lại đã dùng (P2) |

Ván với máy ở **P1 không lưu Lịch sử** (BA Phần 11): chỉ giữ trạng thái để **vào lại trong 30 phút** sau mất kết nối (BA 6.3), **lưu trong bộ nhớ máy chủ** theo quyết định ở mục 5; đây không phải hạn tối đa của một ván vẫn đang kết nối. Ở P2 lưu đầy đủ để Lịch sử/Replay.

---

## 3. Quyền truy cập (RLS) — tóm tắt

| Bảng | Đọc | Ghi |
|---|---|---|
| `profiles` | Client chỉ đọc trực tiếp cột công khai (`username`, `display_name`); email chính chủ qua máy chủ đã xác thực | Máy chủ ghi; chính chủ yêu cầu đổi `display_name` qua máy chủ để lọc từ cấm; username qua OTP ở P2. Client không ghi trực tiếp (theo [04] mục 3.1) |
| `rooms` | Người trong phòng; ai cũng đọc được phòng `PUBLIC` ở Sảnh (cột công khai) | Chỉ máy chủ |
| `room_participants`, `room_blocks` | Người trong phòng | Chỉ máy chủ |
| `matches`, `match_moves` | Hai người chơi của ván; người xem đang ở phòng thấy ván đang diễn ra | Chỉ máy chủ |
| `chat_messages` | Theo kênh và thời điểm (mục 2.9) | Chỉ máy chủ (sau lọc từ cấm) |
| `friendships` | Hai bên | Qua máy chủ (kiểm giới hạn) |

Nguyên tắc: **mọi ghi vào bảng trạng thái ván/phòng đi qua máy chủ** bằng khoá dịch vụ; client không ghi trực tiếp (AGENTS §4.4). Khoá dịch vụ **không bao giờ** đặt vào biến `VITE_*`.

---

## 4. Dữ liệu tạm và vòng đời

### 4.1 Khách (P2)
Danh tính Khách (tên hiển thị tạm, mã phiên) chỉ nằm trong bộ nhớ/phiên. Phiên hết sau 12 giờ hoặc khi **Đăng xuất**; nếu đến hạn trong lúc đang ngồi ghế/đang đấu thì gia hạn tới khi rời. **Rời phòng trước hạn không kết thúc phiên**: Khách về Sảnh vẫn cùng danh tính (BA 1.3). Khi phiên thực sự hết, bản ghi ván giữ cho đối thủ chính thức với tên chung "Khách"; đồng thời máy chủ xoá `chat_messages` do Khách đó gửi và tên hiển thị cá nhân ở mọi phòng còn mở (không chờ phòng `CLOSED`) (đề xuất 04/10/2026, chờ PO duyệt).

### 4.2 Trong bộ nhớ máy chủ (không lưu cơ sở dữ liệu)
Hàng đợi ghép trận (P2, mất khi khởi động lại, BA 7.2), bộ đếm đồng hồ đang chạy, đề nghị đang chờ (xin hoà/đi lại/đổi bên), lời mời bạn bè 30 giây, trạng thái kết nối. **Khi máy chủ khởi động lại:** các ván `ONGOING` được chuyển `INTERRUPTED` lúc khởi động (BA 8.3), phòng đang `PLAYING` được đưa về `FINISHED` với ván `INTERRUPTED` (người chơi kết nối lại thấy kết quả trung tính "Ván bị gián đoạn"), rồi theo luật `FINISHED` thông thường: CASUAL tối đa 10 phút thì `CLOSED`; RANKED theo BA 7.2. Không đóng phòng ngay lúc khởi động (đề xuất 04/10/2026, chờ PO duyệt).

### 4.3 Dọn dẹp
* Phiên Khách hết → xoá `chat_messages` do Khách đó gửi ở phòng còn mở (P2) (đề xuất 04/10/2026, chờ PO duyệt).
* Phòng `CLOSED` → xoá `chat_messages` của phòng đó; giữ `matches`/`match_moves` theo quy tắc từng chế độ.
* `command_receipts` > 24 giờ → xoá.
* Lời mời kết bạn hết hạn 30 ngày → xoá (**không** xoá `friend_declines`).

---

## 5. Quyết định đã duyệt

1. Ván với máy ở P1 có cần lưu cơ sở dữ liệu không, hay chỉ giữ trong bộ nhớ 30 phút? **Đã duyệt:** bộ nhớ ở P1, lưu cơ sở dữ liệu ở P2.
2. Cho phép client đọc trực tiếp một số bảng qua Supabase (RLS) hay mọi thứ qua máy chủ? **Đã duyệt:** mọi dữ liệu trạng thái ván/phòng qua máy chủ, chỉ `profiles` (cột công khai) đọc trực tiếp.

[01]: 01-yeu-cau-chi-tiet.md
[02]: 02-luat-co-tuong.md
[03]: 03-du-lieu.md
[04]: 04-kien-truc.md
[05]: 05-kiem-thu.md
[07]: 07-hop-dong-nghiep-vu.md
