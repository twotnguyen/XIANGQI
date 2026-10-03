# 04 · Kiến trúc hệ thống

**Giai đoạn 2 · Trạng thái: **Đã duyệt 03/10/2026** (các giả định kỹ thuật chưa đo vẫn cần thử nghiệm ở đầu Giai đoạn 4)** · Căn cứ: [BA-SCOPE-DECISIONS.md](../BA-SCOPE-DECISIONS.md), nguyên tắc kỹ thuật ở AGENTS §4.4 và danh sách công nghệ dự kiến ở README. **Không thêm công nghệ ngoài danh sách README khi chưa được đồng ý** (AGENTS §8); các điểm cần đồng ý ghi ở mục 11.

Mục tiêu thiết kế: chạy được 8 mục cốt lõi (P1) trong khoảng 2 tuần với 7 người, đơn giản, ít thành phần, và không đóng cửa với P2.

---

## 1. Tổng quan

```
┌──────────────────────────────┐          ┌─────────────────────────────┐
│  Trình duyệt (React + Vite)  │  HTTPS   │  Supabase                   │
│  Bàn cờ SVG, chat, UI        │─────────▶│  Auth (OTP email, Google)   │
│  Socket.IO client            │          │  PostgreSQL + RLS           │
│  LiveKit client              │          └─────────────▲───────────────┘
└───────┬───────────────┬──────┘                        │ khoá dịch vụ
        │ WebSocket     │ WebRTC                        │ (chỉ máy chủ)
        ▼               ▼                               │
┌────────────────────┐  ┌──────────────┐     ┌──────────┴──────────────┐
│ Máy chủ ứng dụng   │  │  LiveKit SFU │◀────│  Cấp token LiveKit      │
│ NestJS + Socket.IO │  │  (camera/mic)│     │  (trong máy chủ ứng dụng)│
│ - Xác thực         │  └──────────────┘     └─────────────────────────┘
│ - Phòng, ván, đồng hồ
│ - Luật cờ (gói chung)
└─────────┬──────────┘
          │ IPC (tiến trình con)
          ▼
┌────────────────────┐
│ Tiến trình máy cờ  │  TypeScript, negamax + alpha-beta, chạy riêng
└────────────────────┘
```

Nguyên tắc (AGENTS §4.4): máy chủ quyết định, client chỉ gửi ý định; không có quyền thì không nhận dữ liệu; máy cờ chạy tiến trình riêng; thay đổi schema bằng SQL migration; không giữ khoá cơ sở dữ liệu khi gọi dịch vụ ngoài; không hạ ngưỡng đo để báo đạt.

---

## 2. Thành phần và trách nhiệm

| Thành phần | Công nghệ | Trách nhiệm | P |
|---|---|---|---|
| **Web** | React, Vite, TypeScript, bàn cờ SVG | Giao diện, gửi ý định, hiển thị thế cờ do máy chủ gửi, đồng hồ hiển thị, LiveKit client | P1 |
| **Máy chủ ứng dụng** | NestJS, Socket.IO, TypeScript | Xác thực kết nối, quản lý phòng/ván, đồng hồ, luật cờ, chat, bạn bè, cấp token LiveKit, gọi máy cờ | P1 |
| **Gói luật cờ** (`packages/rules`) | TypeScript thuần, **không phụ thuộc môi trường** | Sinh nước đi, kiểm hợp lệ, chiếu/chiếu hết, lặp thế, ký hiệu. **Một bản duy nhất** dùng ở máy chủ, tiến trình máy cờ và client (chỉ để vẽ chấm gợi ý; máy chủ vẫn quyết định) | P1 |
| **Tiến trình máy cờ** | TypeScript, `child_process` | Tìm nước đi theo cấp độ ([02](02-luat-co-tuong.md) mục 9) | P1 |
| **Supabase** | PostgreSQL, Auth | Tài khoản, OTP email, lưu dữ liệu ([03](03-du-lieu.md)) | P1 |
| **LiveKit** | SFU (LiveKit Cloud hoặc tự chạy) | Camera/mic giữa hai người chơi, người xem chỉ xem/nghe | P1 |

Cấu trúc kho đề xuất cho Giai đoạn 4 (pnpm workspace; **chưa tạo**): `apps/web`, `apps/server`, `apps/ai-worker`, `packages/rules`, `packages/shared` (kiểu dữ liệu và hợp đồng sự kiện), `supabase/migrations`, `tests/`.

---

## 3. Xác thực (BA Quyết định 1.1, 1.5, 1.8)

### 3.1 Đăng ký 3 bước dùng OTP gốc của Supabase (Phương án B, **đã duyệt 03/10/2026**)

Product Owner chọn **Phương án B**: dùng mã OTP gốc của Supabase Auth, **không thêm dịch vụ gửi thư**. BA 1.1 và 1.5 đã được sửa lời cho khớp (xem các **sai khác** bên dưới). Phương án A (máy chủ tự quản lý mã, cần dịch vụ gửi thư) **không chọn**; ghi lại ở mục 12 để tham khảo.

**Nền tảng:** `signInWithOtp` (với `shouldCreateUser` bật) **tạo người dùng ngay lúc gửi mã**; Supabase không đếm lần nhập sai theo từng mã mà chỉ có giới hạn tốc độ xác minh theo địa chỉ IP, và client luôn gọi được API xác thực bằng khoá công khai.

**Luồng:**
1. Bước 1: client gọi máy chủ **kiểm tra username** (hợp lệ + chưa trùng, kể cả tên đang bị khoá). Máy chủ không lưu gì.
2. Bước 2: client gửi email. Máy chủ kiểm tra email: nếu có người dùng **đã hoàn tất** thì trả *"Email này đã được đăng ký"*; nếu có người dùng còn cờ `PENDING` (đăng ký dở trước đó) thì **dọn người dùng đó** (xoá dòng `profiles` rồi người dùng Auth). Rồi gọi `signInWithOtp` để Supabase gửi mã 6 số và tạo người dùng chưa xác nhận; máy chủ đặt cờ `app_metadata.registration = "PENDING"` cho người dùng này. Gửi lại: Supabase giới hạn tối thiểu **60 giây** giữa hai lần gửi (cấu hình).
3. Bước 3: client gửi `{ email, otp, username, password }` (mật khẩu chỉ nằm trong bộ nhớ của trình hướng dẫn). Máy chủ gọi `verifyOtp`; nếu đúng thì theo thứ tự: (a) kiểm tra lại username; (b) đặt mật khẩu (khoá dịch vụ); (c) tạo `profiles` với `completed_at = NULL`; (d1) đặt `completed_at = now()`; (d2) xoá cờ `PENDING`; rồi trả phiên đăng nhập. Tài khoản chỉ **hoàn tất** khi cả (d1) và (d2) đã xong.
4. **Chặn dùng tài khoản chưa hoàn tất:** máy chủ ứng dụng **từ chối** mọi kết nối/lệnh của người dùng không có `profiles`, hoặc có `completed_at IS NULL`, hoặc còn cờ `PENDING`, **kể cả khi họ có phiên Supabase hợp lệ**. Client **không ghi trực tiếp** vào `profiles` (RLS).
5. **Hoàn tác khi lỗi** ở (a)–(d2) (xung đột username, lỗi ghi): xoá `profiles` rồi người dùng Auth, thử lại có lùi dần (tối đa 5 lần trong 1 phút); báo *"Đăng ký chưa hoàn tất, hãy thử lại"*.
6. **Tác vụ quét dọn** chạy mỗi 5 phút và lúc khởi động: hoàn tác **mọi** người dùng còn cờ `PENDING` quá **60 phút**, bất kể `completed_at` (xoá `profiles` trước, rồi người dùng Auth, để không vướng khoá ngoại). Nhờ vậy email và username không bị kẹt (BA 1.1).

**Cấu hình Supabase cần đặt (và kiểm bằng PoC, mục 11):** hạn mã OTP **180 giây** (BA 1.5); tối thiểu **60 giây** giữa hai lần gửi; **giới hạn tốc độ xác minh thấp** (mục tiêu: tối đa 5 lần xác minh mỗi 5 phút cho mỗi IP); mẫu thư gửi **mã 6 số** (không chỉ liên kết).

**Sai khác so với bản BA gốc, đã được Product Owner chấp nhận** (BA 1.1 và 1.5 đã sửa lời):
1. Supabase có thể giữ **tạm** một bản ghi xác thực chưa xác nhận sau khi gửi mã (không có hồ sơ, không dùng được, tối đa 60 phút).
2. "Huỷ mã ở lần sai thứ 5" chỉ là **mục tiêu gần đúng** nhờ giới hạn tốc độ xác minh, **không đếm chính xác từng mã**; kẻ tấn công đổi IP có thể thử nhiều hơn. Rủi ro đã biết, giảm nhẹ bằng hạn mã 180 giây và mã 6 số.
3. Đăng ký công khai của Supabase **không tắt** (vì `signInWithOtp` cần tạo người dùng); người dùng nào cũng có thể gọi API xác thực trực tiếp, nhưng **không dùng được ứng dụng** nếu chưa hoàn tất (mục 4). Đăng nhập bằng mã email gốc cho người dùng **đã hoàn tất** là một đường vào ngoài đặc tả (họ đã chứng minh sở hữu email); ghi nhận là rủi ro đã biết.

### 3.2 Đăng nhập bằng username
Supabase đăng nhập bằng email, nên: client gửi `{ username, password }` → máy chủ tra email theo `username` bằng khoá dịch vụ → gọi `signInWithPassword` → trả phiên. **Email không bao giờ trả về client** trong luồng này (tránh lộ email theo username). Báo lỗi chung *"Sai tên đăng nhập hoặc mật khẩu"* (không phân biệt nguyên nhân).

### 3.3 Phiên
Token truy cập và làm mới do Supabase cấp. *Ghi nhớ đăng nhập* tick: lưu phiên 30 ngày; không tick: phiên kết thúc khi đóng trình duyệt hoặc sau 12 giờ (BA 1.8). Kết nối Socket.IO xác thực bằng token trong bước bắt tay; máy chủ **kiểm tra lại token** khi hết hạn.

### 3.4 P2
Google OAuth dùng đăng nhập của Supabase (không OTP) và tạo hồ sơ qua luồng thiết lập của máy chủ (`SCR-ONBOARDING`). Quên mật khẩu dùng OTP khôi phục gốc của Supabase (`resetPasswordForEmail`) với cùng cấu hình hạn mã và giới hạn tốc độ, luôn trả thông báo chung (BA 1.7), thu hồi mọi phiên khi đổi xong. Đổi username (BA 1.6) cần chứng minh sở hữu email: gửi OTP tới email của chính tài khoản và chỉ cho đổi khi máy chủ xác nhận mã vừa được xác minh. Cả hai là **P2, cần PoC** ở Giai đoạn 4. Khách (P2): máy chủ cấp **mã phiên Khách** ngẫu nhiên, không có người dùng Supabase.

---

## 4. Thời gian thực (Socket.IO)

Một kết nối cho mỗi tab; tham gia "phòng Socket.IO" theo `roomId` để phát sự kiện. **Máy chủ lọc dữ liệu theo vai trò** khi phát (ví dụ Kênh Riêng chỉ gửi cho hai người ngồi ghế).

### 4.1 Hợp đồng sự kiện (đề xuất, cụ thể hoá khi dựng)

Mọi lệnh từ client mang `commandId` (uuid) và, với lệnh về ván, `matchVersion`. Máy chủ trả xác nhận `ack` có `ok` hoặc `error{code}`; lệnh trùng `commandId` trả lại **kết quả đã lưu** (không xử lý lần 2).

| Hướng | Sự kiện | Nội dung chính | P |
|---|---|---|---|
| C→S | `room.create` | tên, mức giờ, riêng tư, số người xem | P1 |
| C→S | `room.join` | `code` hoặc `inviteToken` hoặc `roomId` (từ Sảnh) | P1 |
| C→S | `room.leave`, `room.setPrivacy`, `room.kick` | | P1 |
| C→S | `seat.toSpectator`, `seat.invitePlayerDown` | đổi chỗ ghế/người xem | P1 |
| C→S | `player.ready` | bật/tắt Sẵn sàng | P1 |
| C→S | `match.move` | `from`, `to`, `matchVersion` | P1 |
| C→S | `match.resign`, `match.offerDraw`, `match.respondDraw` | | P1 |
| C→S | `chat.send` | `channel`, `body` | P1 |
| C→S | `friend.*` (`search`, `request`, `respond`, `invite`) | | P1 |
| C→S | `ai.start`, `ai.move` | cấp độ, phe | P1 |
| C→S | `match.offerUndo/respondUndo`, `seat.offerSwap/respondSwap`, `match.rematch` | | P2 |
| S→C | `room.state` | ảnh chụp đầy đủ của phòng (người ngồi, người xem, trạng thái) đã lọc theo vai trò | P1 |
| S→C | `match.state` | thế cờ, lượt, đồng hồ còn lại, `version`, nước cuối | P1 |
| S→C | `match.ended` | kết quả, lý do | P1 |
| S→C | `chat.message` | | P1 |
| S→C | `invite.received`, `friend.updated` | | P1 |
| S→C | `error` | mã lỗi theo danh mục | P1 |

### 4.2 Đồng bộ và phục hồi
* Máy chủ giữ **một nguồn sự thật** cho từng ván (trong bộ nhớ). Mỗi thay đổi tăng `version`; client chỉ gửi lệnh với `version` mới nhất, lệnh cũ bị từ chối kèm ảnh chụp mới.
* **Kết nối lại:** client gửi `room.join`/`match.sync`; máy chủ trả `room.state` và `match.state` đầy đủ (không phát lại từng sự kiện).
* Đồng hồ: xem mục 6.
* Chống trùng lệnh: bảng `command_receipts` ([03](03-du-lieu.md) mục 2.8).
* **Tuần tự hoá lệnh (mô hình "một người ghi" cho mỗi phòng/ván):** mọi lệnh của một phòng hoặc một ván được xếp **hàng đợi tuần tự** và xử lý lần lượt; hai lệnh đồng thời (ví dụ hai nước đi, hoặc nước đi và đầu hàng) được xử lý theo thứ tự nhận, lệnh sau thấy trạng thái sau lệnh trước. Thứ tự xử lý một lệnh: (1) kiểm quyền, `commandId`, `matchVersion`; (2) tính đồng hồ; (3) áp dụng vào bộ nhớ ở dạng *bản nháp*; (4) **ghi cơ sở dữ liệu và biên lai trong một giao dịch**; (5) nếu ghi thành công thì xác nhận (`ack`), tăng `version` và phát cho phòng; (6) nếu ghi lỗi thì **bỏ bản nháp**, thử lại tối đa 2 lần cách nhau 200 ms, vẫn lỗi thì trả `error PERSIST_FAILED` cho người gửi và **không phát gì**. **Khi ghi lỗi (đề xuất mới, cần duyệt):** ván ở trạng thái *tạm dừng ghi*, **đồng hồ của cả hai bên đóng băng** từ lúc lỗi đầu tiên đến khi ghi lại được, để không ai mất giờ vì lỗi hạ tầng. Lỗi kéo dài **quá 30 giây** thì ván chuyển `INTERRUPTED` (không có người thắng, không đổi Elo, BA 8.3). **Hai tình huống khác nhau:** (1) *Cơ sở dữ liệu hồi phục khi tiến trình máy chủ còn sống*: ván lỗi **chưa quá 30 giây** tiếp tục bình thường (mở lại đồng hồ); chỉ các ván **đã bị đánh dấu `INTERRUPTED` do quá 30 giây** mới được **ghi bù** vào cơ sở dữ liệu. (2) *Máy chủ khởi động lại*: quét mọi ván còn `ONGOING` sót lại và chuyển thành `INTERRUPTED` (BA 8.3).
* **Ngoại lệ ván với máy (P1, chỉ trong bộ nhớ, [03](03-du-lieu.md) mục 2.13):** vẫn tuần tự hoá lệnh theo ván nhưng **không ghi cơ sở dữ liệu**; chống trùng lệnh bằng **bảng biên lai trong bộ nhớ** gắn vòng đời ván; nên không có `PERSIST_FAILED` và không có quy tắc 30 giây.
* **Một vị trí chơi cho mỗi người dùng (BA 1.8):** máy chủ giữ sổ `vị trí chơi đang dùng` theo `user_id` (loại `ROOM` hoặc `AI`), **xin và trả có khoá theo từng người dùng** nên không thể đồng thời ngồi ghế một phòng và đang chơi ván với máy. Ràng buộc trong cơ sở dữ liệu ([03](03-du-lieu.md) mục 2.4) chỉ bảo vệ phần phòng; sổ này là cơ chế chung.

---

## 5. Máy trạng thái phòng và ván

```
Phòng:   WAITING ──(đủ 2 người + cả hai Sẵn sàng + đếm 3s)──▶ PLAYING
         ▲  │                                                   │ (ván kết thúc)
         │  └──(rời hết/chủ rời không còn người chơi)──▶ CLOSED  ▼
         └────────(người ngồi ghế đổi/rời)───────────────── FINISHED
```

* `WAITING → PLAYING`: tạo `matches` mới, khởi động đồng hồ cho **bên Đỏ** (BA 2.3).
* `PLAYING → FINISHED`: khi ván kết thúc (kết quả theo [02](02-luat-co-tuong.md) mục 3.3).
* `FINISHED → WAITING`: khi thành phần người ngồi ghế đổi hoặc một người ngồi ghế rời; reset `ready` (BA 2.8, mục 8). `FINISHED` giữ tối đa 10 phút (BA 3.3).
* Mọi chuyển trạng thái do **máy chủ** thực hiện và ghi cơ sở dữ liệu ở mốc: bắt đầu ván, mỗi nước đi, kết thúc ván.

---

## 6. Đồng hồ (BA 2.1, 8.3)

* Máy chủ giữ `remainingMs` cho mỗi bên và **mốc bắt đầu lượt** theo đồng hồ đơn điệu của máy chủ.
* Đặt một bộ hẹn giờ tại **thời điểm hết giờ dự kiến** của bên đang tới lượt; hết hạn → kết thúc `TIMEOUT` (nếu chưa có nước đi hợp lệ trước đó).
* Khi nhận nước đi: **tính giờ trước** rồi mới xét nước đi (BA `ARCH-04`; [02](02-luat-co-tuong.md) mục 3.4). Không có cộng giây. Không hoàn giờ khi đi lại.
* Client chỉ **hiển thị** đếm lùi, đồng bộ lại mỗi lần nhận `match.state`; sai lệch hiển thị không ảnh hưởng kết quả.
* Mất kết nối: đồng hồ **vẫn chạy**; hết giờ trước ân hạn → `TIMEOUT`, hết ân hạn trước → `DISCONNECT` (BA 8.3).

Hành vi kết nối lại theo vai trò (BA 8.3): người chơi đang đấu 60 giây rồi xử thua; người chơi ở phòng chờ/kết thúc 60 giây rồi mất ghế; người xem 5 phút; ván với máy 30 phút. Mỗi bộ hẹn giờ này nằm trong máy chủ.

---

## 7. Camera và micro (LiveKit)

* Mỗi phòng cờ ứng với **một phòng LiveKit** (tên theo `roomId`).
* **Máy chủ ứng dụng cấp token** ngắn hạn (vài phút, làm mới khi cần): người ngồi ghế có quyền phát; người xem **chỉ đăng ký nhận** (`canPublish=false`, `canPublishData=false`, BA 4.1).
* **Mức chia sẻ** (BA 4.1): (1) Không chia sẻ, (2) Chỉ đối thủ, (3) Cả đối thủ và người xem. Thực hiện bằng **quyền đăng ký track** của LiveKit (cho phép hoặc không cho phép từng người nhận). *Cần PoC sớm* để xác nhận cách điều khiển quyền đăng ký đủ chi tiết theo từng người.
* **Đuổi người xem** hoặc **đổi vai trò** (ngồi ghế ↔ người xem): máy chủ **cập nhật quyền** hoặc **loại** người đó khỏi phòng LiveKit. Quyền phát/đăng ký phải được đặt **trước khi publish** và cập nhật khi đổi vai trò.
* **Khoá phòng (`LOCKED`) không thu hồi token và không loại ai** đang ở trong phòng: người hiện tại giữ quyền xem/nghe (BA 4.3). Máy chủ chỉ **ngừng cấp token mới cho người mới**; người đang có ghế/đang xem vẫn được cấp lại token khi kết nối lại (trong hạn 60 giây/5 phút).
* Mặc định camera/mic của mình **Tắt**; ở Ranked, hình/tiếng đối thủ mặc định ẩn ở phía người nhận (BA 5.4, P2).
* **Nhiều tab (P1):** khi tab mới tiếp quản, máy chủ loại kết nối LiveKit của tab cũ (BA 1.8).
* Không ghi hình, không ghi âm.

---

## 8. Máy cờ (tiến trình riêng)

* Khởi động **một nhóm nhỏ tiến trình con** (đề xuất 2) bằng `child_process.fork`, mỗi tiến trình nhận **một việc tại một thời điểm**; hàng đợi trong máy chủ khi bận.
* Giao thức IPC: `search { fen, history, level, budgetMs }` → `result { move, depth, nodes, elapsedMs }`.
* **Hàng đợi:** chờ tối đa **3 giây** để có tiến trình rảnh, quá thì trả `error ENGINE_BUSY` (người chơi thấy *Thử lại*); thời gian chờ này **không** tính vào ngân sách `budgetMs` của cấp độ.
* **Hai chỉ số khác nhau:** *thời gian tính* (từ lúc bắt đầu tìm đến lúc có nước đi) phải ≤ ngân sách của cấp độ — đây là tiêu chí của BA 6.1/6.3; *thời gian người chơi chờ* = hàng đợi + thời gian tính + truyền. Bình thường (ít ván với máy đồng thời) hàng đợi bằng 0 nên hai chỉ số bằng nhau; không hạ tiêu chí để báo đạt.
* Hạn chót cứng của một lần tìm kiếm = `budgetMs + 2000` tính **từ lúc bắt đầu tìm**: quá hạn thì **kết thúc** tiến trình, khởi động lại, trả nước đã biết (nếu có). Tổng thời gian không phản hồi (kể cả hàng đợi) quá 10 giây → ván `Bỏ dở` (BA 6.1).
* Máy cờ dùng **cùng gói luật** (`packages/rules`) để không lệch luật.
* Huỷ tìm kiếm khi người chơi đi lại hoặc rời ván.

---

## 9. Bảo mật

| Chủ đề | Quy tắc |
|---|---|
| Quyền | Mọi quyết định ở máy chủ; client chỉ gửi ý định. Kiểm vai trò ở **từng sự kiện** (ví dụ chỉ người ngồi ghế được `match.move`) |
| Lọc dữ liệu | Không gửi dữ liệu không có quyền xem (Kênh Riêng, email người khác, danh sách phòng `LOCKED`) |
| Khoá bí mật | Khoá dịch vụ Supabase, khoá LiveKit **chỉ ở máy chủ**; mọi biến `VITE_*` là **công khai** (AGENTS §8). Không commit khoá; chỉ `.env.example` |
| Giới hạn tốc độ | Chat 5 tin/10 giây/người (BA 5.3); gửi OTP 60 giây/email; tạo phòng và kết nối mới giới hạn theo người dùng và địa chỉ IP |
| Nhập liệu | Kiểm tra kiểu và độ dài mọi tham số sự kiện; bộ lọc từ cấm chạy **ở máy chủ** (BA 5.3) |
| Mật khẩu | Do Supabase băm; không ghi vào nhật ký |
| Nhật ký | Có cấu trúc, không ghi mật khẩu, OTP, token |
| Công cụ demo (P2) | Chỉ bật bằng cờ cấu hình `DEMO_MODE`; ở môi trường chính thức máy chủ từ chối lệnh giả lập (BA 9.3) |

---

## 10. Triển khai và quy mô

* **Quy mô thiết kế:** khoảng 50 người dùng đồng thời, 10 ván cùng lúc (BA 10.1). **Một thể hiện máy chủ ứng dụng duy nhất** là đủ; vì trạng thái ván nằm trong bộ nhớ nên **chưa hỗ trợ nhiều thể hiện** (ghi là giới hạn đã biết).
* Máy chủ ứng dụng cần giữ kết nối WebSocket dài: đặt trên dịch vụ cho phép (ví dụ nền tảng chạy container hoặc máy ảo nhỏ). Web tĩnh đặt trên dịch vụ lưu trữ tĩnh. **Chọn nền tảng cụ thể sau khi Product Owner duyệt và xác nhận chi phí/thẻ thanh toán.**
* Cấu hình theo biến môi trường: địa chỉ Supabase, khoá dịch vụ, khoá/địa chỉ LiveKit, `DEMO_MODE`, giới hạn tốc độ.
* **Sao lưu:** bản sao lưu cơ sở dữ liệu theo gói Supabase; dữ liệu trong bộ nhớ (ván đang chạy) mất khi khởi động lại và xử lý bằng `INTERRUPTED` (BA 8.3).

---

## 11. Quyết định (Product Owner đã duyệt 03/10/2026)

| # | Quyết định | Lý do / rủi ro |
|---|---|---|
| 1 | Xác nhận danh sách công nghệ ở README (TypeScript, Node.js, pnpm, React, Vite, NestJS, Socket.IO, Supabase, LiveKit, Vitest, Playwright) | Chưa có thay đổi so với danh sách kế thừa |
| 2 | Thư viện **ngoài** danh sách README: (a) tạo Mã QR (P2), (b) bộ biểu tượng. **Không cần dịch vụ gửi thư** (đã chọn Phương án B) | AGENTS §8 cấm thêm khi chưa được đồng ý. (a) cần quyết định **trước Giai đoạn 4**; (b), (c) chọn khi bắt đầu Giai đoạn 4 |
| 3 | Một thể hiện máy chủ, trạng thái ván trong bộ nhớ | Đơn giản nhất; giới hạn mở rộng và mất ván khi khởi động lại (xử lý `INTERRUPTED`) |
| 4 | **OTP: Phương án B (OTP gốc Supabase) — Product Owner đã chọn 03/10/2026**; BA 1.1, 1.5 đã sửa lời; sai khác ghi ở mục 3.1 | Đã duyệt. Rủi ro: "huỷ ở lần sai thứ 5" chỉ gần đúng; cần PoC cấu hình hạn 180 giây và giới hạn tốc độ |
| 5 | Mọi ghi vào bảng trạng thái ván/phòng qua máy chủ; client chỉ đọc trực tiếp cột công khai của `profiles` | An toàn hơn; xem [03](03-du-lieu.md) mục 5 |
| 6 | Chạy **PoC 3 việc rủi ro cao trong 2 ngày đầu Giai đoạn 4**: (a) LiveKit đăng ký track theo từng người, (b) cấu hình OTP của Supabase (hạn 180 giây, gửi lại 60 giây, giới hạn tốc độ xác minh, mẫu thư mã 6 số) và quét dọn bản ghi chưa hoàn tất, (c) tiến trình máy cờ đạt độ sâu 5–6 trong ngân sách | Tập trung rủi ro vào đầu để còn thời gian xử lý |

---

## 12. Phương án A (không chọn, lưu để tham khảo)

Máy chủ ứng dụng tự tạo, gửi và kiểm mã OTP (đếm chính xác 5 lần sai, không có bản ghi Auth trước khi mã đúng) và chỉ tạo người dùng Supabase bằng khoá dịch vụ **sau** khi mã đúng, kèm tắt đăng ký công khai. Cần thêm **dịch vụ gửi thư giao dịch** (ngoài danh sách README) nên không được chọn. Nếu sau này cần đáp ứng đúng BA 1.1/1.5 ban đầu thì quay lại phương án này.


[01]: 01-yeu-cau-chi-tiet.md
[02]: 02-luat-co-tuong.md
[03]: 03-du-lieu.md
[04]: 04-kien-truc.md
[05]: 05-kiem-thu.md
