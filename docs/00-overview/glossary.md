# GLOSSARY — TỪ ĐIỂN THUẬT NGỮ

**ID:** `GLO` · **Trạng thái:** Draft v1 · **Cập nhật:** 2026-09-21

Đây là **nguồn chuẩn duy nhất** cho thuật ngữ của dự án. Mọi tài liệu khác dùng đúng từ ở đây. Nếu một tài liệu cần dùng từ khác, phải bổ sung vào đây trước.

**Quy ước viết:**
- Tên **trạng thái, vai trò, enum** viết `HOA_GẠCH_DƯỚI` bằng tiếng Anh (`WAITING`, `SPECTATOR`) — để khớp với code sau này.
- Văn bản mô tả viết **tiếng Việt**.
- Mỗi khái niệm có **đúng một** từ tiếng Việt chuẩn. Các từ đồng nghĩa bị cấm dùng được liệt kê ở cột "Không dùng".

---

## 1. CON NGƯỜI VÀ VAI TRÒ

> ⚠ **Điểm dễ nhầm nhất của dự án.** "Người xem" có **hai** từ khác nhau tuỳ ngữ cảnh: `SPECTATOR` (vai trò trong phòng) và `WATCH` (loại vé để vào phòng). Xem §1.1.

| Thuật ngữ chuẩn | Tiếng Việt | Định nghĩa | Không dùng |
|---|---|---|---|
| **User** | Người dùng | Một tài khoản đã đăng ký trong hệ thống. Tồn tại độc lập với phòng/ván. | "account holder", "thành viên" |
| **Guest** | Khách | Người **chưa đăng nhập**. → Hệ thống **không hỗ trợ** guest (`DEC-006`). Từ này chỉ dùng để nói "không hỗ trợ". | "vãng lai", "ẩn danh" |
| **Member** | Thành viên phòng | User đang ở trong một phòng, **bất kể** vai trò gì. Một phòng có tối đa **7** thành viên. | "participant" |
| **Player** (`PLAYER`) | Người chơi | Thành viên ngồi một trong **2 ghế chơi**. Là người được đi nước cờ. | "đấu thủ", "kỳ thủ" |
| **Spectator** (`SPECTATOR`) | Người xem | Thành viên **không** ngồi ghế chơi, chỉ xem. Tối đa **5**. | "viewer", "khán giả", "observer" |
| **Host** | Chủ phòng | User đã **tạo** phòng. Mặc định cầm quân **đỏ**. **Không chuyển quyền chủ** được. | "owner", "room master" |
| **Opponent** | Đối thủ | Người chơi còn lại, xét từ góc nhìn của một người chơi cụ thể. Là **vai trò tương đối**, không phải trạng thái lưu trong hệ thống. | "địch thủ" |
| **AI** | Máy | Đối thủ máy trong ván một người. **Không phải** User, không có tài khoản. | "bot", "máy tính", "engine" |
| **Tab** | Tab | Cửa sổ trình duyệt. **Mọi tab đều thao tác được** (`DEC-020`). Riêng camera/mic chỉ một tab phát. Xem §5. | "tab đang giữ thiết bị", "tab khác" |

### 1.1 `SPECTATOR` khác `WATCH` như thế nào

Đây là hai khái niệm **khác nhau**, không phải hai tên của một thứ:

| | `SPECTATOR` | `WATCH` |
|---|---|---|
| Là gì | **Vai trò** của một thành viên đang ở trong phòng | **Loại quyền** của một lời mời / mã / link |
| Trả lời câu hỏi | "Người này đang làm gì trong phòng?" | "Tấm vé này cho phép vào làm gì?" |
| Cặp đối xứng | `PLAYER` | `PLAY` |
| Ví dụ | "Phòng có 3 `SPECTATOR`" | "Mã này là mã `WATCH`, không vào ghế chơi được" |

**Quan hệ:** dùng mã `WATCH` để vào phòng ⇒ trở thành `SPECTATOR`. Dùng mã `PLAY` ⇒ trở thành `PLAYER`.

**Quy tắc bắt buộc:** không viết "vé SPECTATOR" hay "vai trò WATCH". Sai cặp là lỗi tài liệu.

---

## 2. PHÒNG VÀ VÁN

> ⚠ **Điểm dễ nhầm thứ hai.** "Phòng" và "ván" là hai thứ khác nhau và có vòng đời riêng. Một phòng có thể chứa **nhiều ván** nối tiếp (qua tái đấu).

| Thuật ngữ chuẩn | Tiếng Việt | Định nghĩa | Không dùng |
|---|---|---|---|
| **Room** | Phòng | Không gian chứa người: 2 ghế chơi + tối đa 5 ghế xem. Có tên, chế độ riêng tư, cấu hình thời gian. **Sống lâu hơn ván.** | "bàn", "table" |
| **Match** | Ván | Một ván cờ cụ thể từ nước đầu tới khi kết thúc. Có ID riêng. Tái đấu tạo **ván mới**, **không** phải ván cũ tiếp tục. | "game", "trận" |
| **Game** | — | ❌ **Cấm dùng.** Quá mơ hồ — có thể hiểu là "ván", "phòng", hoặc "trò chơi nói chung". Dùng `Room` hoặc `Match`. | — |
| **Session** | Phiên đăng nhập | Phiên xác thực của một User. **Không liên quan** tới phòng hay ván. | "session" khi nói về ván |
| **Seat** | Ghế | Vị trí trong phòng. Có **ghế chơi** (2) và **ghế xem** (5). | "slot" |
| **Side** | Bên | `RED` (đỏ) hoặc `BLACK` (đen). Đỏ đi trước. | "màu", "phe" |
| **Move** | Nước đi | Một lần di chuyển quân hợp lệ. | "bước" |
| **Ply** | Nửa nước | Độ dài nhánh nước đi đang có hiệu lực. **Có thể giảm** khi đi lại. | "turn" |
| **Turn** | Lượt | Bên nào đang được đi. | "phiên" |

### 2.1 Vòng đời: Phòng và Ván

```
PHÒNG:  WAITING ──► PLAYING ──► FINISHED ──► CLOSED
                       ▲            │
                       └── tái đấu ─┘  (tạo VÁN MỚI, không phải ván cũ)

VÁN:    ACTIVE ──► FINISHED        (có kết quả)
             └───► INTERRUPTED     (không có người thắng)
```

**Hệ quả cần nhớ:** "phòng kết thúc" ≠ "ván kết thúc". Phòng `FINISHED` sống thêm **10 phút** để xem lại / chat / tái đấu, rồi mới `CLOSED`.

---

## 3. VÀO PHÒNG: MÃ, LINK, LỜI MỜI

> ⚠ Ba cách vào phòng, **không được gọi lẫn nhau**.

| Thuật ngữ chuẩn | Tiếng Việt | Định nghĩa | Không dùng |
|---|---|---|---|
| **Room Code** | Mã phòng | Chuỗi **8 ký tự** người dùng gõ tay. Bảng chữ bỏ ký tự dễ nhầm (`ABCDEFGHJKLMNPQRSTUVWXYZ23456789` — không có `I`, `O`, `0`, `1`). Có loại `PLAY` và loại `WATCH`. Hết hạn **24 giờ**. | "password", "mật khẩu phòng" |
| **Invite Link** | Link mời | Đường dẫn bấm vào là vào phòng. Chứa token ngẫu nhiên. Hết hạn **24 giờ**. | "share link" |
| **Direct Invitation** | Lời mời trực tiếp | Lời mời gửi **đích danh** cho một người bạn trong ứng dụng. Chỉ người nhận dùng được. Hết hạn **10 phút**. | "invite" trống nghĩa |
| **Password** | — | ❌ **Cấm dùng cho phòng.** Phòng **không có mật khẩu**. Kiểm soát vào phòng bằng mã/link/lời mời. "Password" chỉ dùng cho **đăng nhập tài khoản**. | — |

### 3.1 Quy tắc dùng một lần / nhiều lần

| Loại | Dùng được mấy lần |
|---|---|
| Mã/link `PLAY` | **Một lần** — ghế chơi chỉ có 2 |
| Mã/link `WATCH` | **Nhiều lần** — cho tới khi đủ 5 người xem |
| Lời mời trực tiếp | **Một lần**, chỉ đúng người nhận |

---

## 4. CHẾ ĐỘ RIÊNG TƯ CỦA PHÒNG

| Chế độ | Tiếng Việt | Ai vào xem được | Có hiện ở sảnh |
|---|---|---|---|
| `PUBLIC` | Công khai | Mọi User đã đăng nhập, khi còn chỗ | **Có khi WAITING/PLAYING** |
| `CODE_ONLY` | Cần mã | Có grant WATCH hợp lệ: mời trực tiếp, mã hoặc link | Không |
| `LOCKED` | Khoá | **Không ai** — phòng không có người xem | Không |

**Lưu ý:** `LOCKED` chỉ chặn **người xem**. Lời mời **chơi** vẫn dùng được khi còn ghế trống.

---

## 5. NHIỀU TAB

| Thuật ngữ chuẩn | Tiếng Việt | Định nghĩa |
|---|---|---|
| **Tab** | Tab | Một cửa sổ/thẻ trình duyệt. Một User mở **bao nhiêu tab cũng được**. |
| **Media owner tab** | Tab đang giữ thiết bị | Tab **duy nhất** đang phát camera hoặc micro. Riêng cho từng nguồn. |
| **Tab switch** | Chuyển thiết bị sang tab | Hành động chuyển quyền phát camera/micro sang tab khác. Luồng nguồn cũ phải được SFU xác nhận thu hồi trước; nguồn mới OFF, bật thủ công. Không hứa hardware tab cũ đã tắt khi chưa có ACK (DEC-041). |

**Quy tắc (`DEC-020`):** **mọi tab đều đồng bộ và đều thao tác được** — đi cờ, chat, đầu hàng, xác nhận treo ván… Máy chủ chống hai nước bằng **kiểm lượt + kiểm phiên bản + mã lệnh duy nhất**, không cần khoá tab.

**Ngoại lệ duy nhất (`DEC-021`):** **camera/micro chỉ một tab phát được** — đây là chính sách một nguồn phát đã chọn; khả năng thiết bị/trình duyệt cần kiểm thử, không coi là giới hạn phần cứng tuyệt đối.

Mở nhiều tab **không** tạo thêm ghế trong phòng.

❌ Không dùng “tab có quyền điều khiển ván” để hạn chế đi cờ/chat. “Tab khác”, “quyền phát thiết bị”, “chuyển nguồn” vẫn hợp lệ cho camera/micro; owner áp dụng toàn tài khoản xuyên thiết bị.

---

## 6. CHAT

| Thuật ngữ chuẩn | Tiếng Việt | Ai **đọc** | Ai **gửi** |
|---|---|---|---|
| `PLAYERS` channel | **Kênh riêng người chơi** | PLAYER hiện hành thuộc participant/segment của tin, kể cả Host solo | PLAYER hiện hành vào segment đang mở, tối đa 2; xem REQ-CHAT |
| `ROOM` channel | **Kênh chung** | 5 người xem **+ 2 người chơi** | 5 người xem **+ 2 người chơi** |

**Quy tắc còn lại tuyệt đối:** người xem **không bao giờ** đọc hay gửi được **kênh riêng người chơi**.

**Đã đổi theo `DEC-018`:** kênh này trước dành riêng cho SPECTATOR; hiện là kênh chung vì người chơi nay **đọc và gửi được**, và còn có **công tắc ẩn/hiện riêng, độc lập** — nhưng đó là **tuỳ chọn giao diện**, không phải phân quyền.

---

## 7. CAMERA VÀ MIC

| Thuật ngữ chuẩn | Tiếng Việt | Định nghĩa |
|---|---|---|
| **Media** | Media | Gọi chung camera + mic. Chỉ **trực tiếp** — không ghi, không lưu, không phát lại. |
| **Policy** | Mức chia sẻ | Lựa chọn của **người phát** về ai được nhận. |
| `OFF` | Tắt | Không ai nhận |
| `OPPONENT_ONLY` | Chỉ đối thủ | Chỉ người chơi còn lại |
| `OPPONENT_AND_SPECTATORS` | Đối thủ và người xem | Cả đối thủ lẫn người xem |

**Quy tắc:** camera và mic có mức chia sẻ **độc lập**. Mỗi người **tự quyết** luồng của mình — **không ai bật thay người khác**, kể cả chủ phòng. Mặc định cả hai `OFF`.

---

## 8. KẾT THÚC VÁN

| `reason` | Tiếng Việt | Ai thắng |
|---|---|---|
| `CHECKMATE` | Chiếu hết | Bên chiếu |
| `STALEMATE` | Hết nước đi | **Bên còn nước** (luật giản lược: hết nước là **thua**) |
| `REPETITION` | Lặp 3 lần | **Hoà** |
| `AGREED_DRAW` | Thoả thuận hoà | **Hoà** |
| `RESIGN` | Đầu hàng | Đối thủ |
| `TIMEOUT` | Hết giờ | Đối thủ |
| `INACTIVITY` | Treo ván (`DEC-002`) | Đối thủ |
| `DISCONNECT` | Mất mạng quá hạn | Đối thủ |
| `BOTH_OFFLINE` | Cả hai mất mạng | **Không ai** (`INTERRUPTED`) |
| `SERVER_RESTART` | Máy chủ khởi động lại | **Không ai** (`INTERRUPTED`) |
| `AI_UNAVAILABLE` | Máy lỗi | **Không ai** (`INTERRUPTED`) |

**Ba nguyên nhân dễ nhầm — phải phân biệt:**
- `TIMEOUT` = **hết đồng hồ ván** (chỉ có ở chế độ 5/10/15 phút).
- `INACTIVITY` = **vẫn online nhưng không đi nước** (chỉ có ở chế độ không giới hạn — chờ `Q-010`).
- `DISCONNECT` = **mất kết nối** quá 60 giây.

---

## 9. THAO TÁC TRONG VÁN

| Thuật ngữ chuẩn | Tiếng Việt | Định nghĩa |
|---|---|---|
| **Resign** | Đầu hàng | Tự nhận thua. Chỉ khi ván đang `ACTIVE`. |
| **Draw offer** | Xin hoà | Đề nghị hoà, cần đối thủ đồng ý. **Chỉ có ở ván online.** |
| **Undo** | Đi lại | Quay về trước nước gần nhất **của người xin**. Online cần đối thủ đồng ý; với AI thì không cần. |
| **Proposal** | Đề nghị | Gọi chung xin hoà + xin đi lại. Mỗi ván chỉ **một** đề nghị chờ tại một thời điểm. Hết hạn **30 giây**. |
| **Rematch** | Tái đấu | Cả hai đồng ý chơi ván mới, **đổi bên**. Tạo `Match` mới trong cùng `Room`. |
| **Replay** | Xem lại | Xem lại từng nước của ván đã kết thúc. |

**Quy tắc đi lại:** lùi **1 nửa nước** nếu đối thủ chưa đáp, **2 nửa nước** nếu đã đáp. **Không hoàn lại thời gian** đã dùng.

---

## 10. AI

| Thuật ngữ chuẩn | Tiếng Việt | Ghi chú |
|---|---|---|
| `EASY` | Dễ | Ngân sách suy nghĩ **300 ms** |
| `MEDIUM` | Trung bình | **1000 ms** |
| `HARD` | Khó | **3000 ms** |

**Lưu ý:** ngân sách là **thời gian tính toán**, không phải tổng độ trễ người dùng cảm nhận. **Không** quy đổi ra Elo.

---

## 11. THỜI GIAN

| Thuật ngữ chuẩn | Tiếng Việt | Giá trị |
|---|---|---|
| **Time Control** | Cấu hình thời gian | `0` (không giới hạn, **mặc định**), `300`, `600`, `900` giây mỗi bên |
| **Grace period** | Thời gian ân hạn | **60 giây** để nối lại sau khi mất mạng |

**Lưu ý:** thời gian là ngân sách cho **cả ván** của mỗi bên, **không phải** giới hạn mỗi nước. Không cộng giây sau mỗi nước.

---

## 12. TỪ BỊ CẤM — BẢNG TRA NHANH

| ❌ Không viết | ✅ Viết | Lý do |
|---|---|---|
| "game" | "ván" (`Match`) hoặc "phòng" (`Room`) | Mơ hồ |
| "viewer", "khán giả" | "người xem" (`SPECTATOR`) | Thống nhất một từ |
| "kênh riêng người xem" | "**kênh chung**" | Người chơi cũng đọc/gửi được (`DEC-018`) |
| "vé SPECTATOR" | "mã `WATCH`" | Sai cặp khái niệm (§1.1) |
| "vai trò WATCH" | "vai trò `SPECTATOR`" | Sai cặp khái niệm (§1.1) |
| "mật khẩu phòng" | "mã phòng" (`Room Code`) | Phòng không có mật khẩu |
| "bot", "máy tính" | "máy" (`AI`) | Thống nhất |
| "trận" | "ván" | Thống nhất |
| "hết giờ" cho mọi trường hợp | phân biệt `TIMEOUT` / `INACTIVITY` / `DISCONNECT` | Ba nguyên nhân khác nhau (§8) |

---

## 13. CÒN CHỜ QUYẾT ĐỊNH

| Thuật ngữ | Trạng thái |
|---|---|
| `INACTIVITY` | Đã đặt tên (`Q-015`, BA quyết). Chi tiết theo REQ-INACTIVITY và DEC-026/027/030. |
| **Kick** / "đuổi người xem" | Tính năng đã chốt (`DEC-004`). Tên chuẩn tiếng Việt: **"đuổi người xem"**. Chi tiết theo REQ-SPECTATOR. |
| **Guest** | Không hỗ trợ theo DEC-006. |
| **Remember me** / "ghi nhớ đăng nhập" | Đã chốt DEC-007/037/038. Tick: phiên 30 ngày trượt theo hoạt động chủ động; bỏ tick: phiên riêng từng tab, reload giữ nhưng đóng/mở lại phải đăng nhập. Xem [BR-AUTH-18/19](../01-requirements/REQ-AUTH.md). |
| **Invitation Inbox** / "hộp thư lời mời" | Đã chốt DEC-008; xem REQ-INVITE. |
