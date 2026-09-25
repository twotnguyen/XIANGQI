# QUESTION BACKLOG

**Cập nhật:** 2026-09-21 · **Round hiện tại:** 2

| Trạng thái | Ý nghĩa |
|---|---|
| `RESOLVED` | Đã có quyết định, xem `decision-log.md` |
| `OPEN` | Đang chờ Product Owner |
| `BA-DECIDED` | BA tự quyết theo uỷ quyền `DEC-000-Q24`, đã ghi rõ trong đặc tả |

---

## ROUND 1 — Trạng thái

| ID | Tiêu đề | Trạng thái | Kết quả |
|---|---|---|---|
| Q-001 | Vai trò `XIANGQI-Design` | `RESOLVED` | `DEC-001` — là nguồn chính thức, mục tiêu rebuild |
| Q-002 | Người chơi không đi nước | `RESOLVED` | `DEC-002` + `DEC-010`…`DEC-013`, `DEC-016` |
| Q-003 | Lời mời khi người nhận offline | `OPEN` | PO chưa hiểu câu hỏi → diễn đạt lại bên dưới |
| Q-004 | Đuổi một người xem | `RESOLVED` | `DEC-004` + `DEC-014`, `DEC-015` |
| Q-005 | Guest | `OPEN` | PO hỏi ngược → khuyến nghị ở `DEC-006`, chờ xác nhận |
| Q-006 | Thời hạn phiên | `OPEN` | PO hỏi ngược → khuyến nghị ở `DEC-007`, chờ xác nhận |
| Q-007 | File canonical về trạng thái | `RESOLVED` | `DEC-001` |
| Q-008 | Toạ độ bàn cờ | `RESOLVED` | `DEC-003` — theo **spec**; đã kiểm chứng tay 2 fixture |
| Q-009 | Giới hạn 5 người xem | `RESOLVED` | `DEC-005` — xác nhận 5 |

---

# ROUND 2 — 9 câu hỏi

Nhóm: **A. Chống treo ván** (4) · **B. Đuổi người xem** (2) · **C. Lời mời** (1) · **D. Tài khoản & phiên** (2)

---

# NHÓM A — CHỐNG TREO VÁN (chi tiết của `DEC-002`)

> Luật đã chốt: không đi nước trong **3 phút** → hộp thoại xác nhận → xác nhận thì **+3 phút** → không xác nhận thì đếm ngược **30 giây** → đối thủ thắng.
> Bốn câu dưới đây quyết định luật này chạy **ở đâu** và **có lỗ hổng không**.

---

## Q-011 — Được bấm "Tôi còn đây" bao nhiêu lần? · **P0 · BLOCKING**

**Related:** `DEC-002`

**Đây là câu quan trọng nhất của Round 2.**

**Vấn đề:** Nếu mỗi lần xác nhận đều được cộng thêm 3 phút và **không giới hạn số lần**, thì người chơi có thể bấm xác nhận mãi mãi mà **vẫn không bao giờ đi nước**. Luật chống treo ván sẽ **không giải quyết được đúng vấn đề nó sinh ra để giải quyết** — ván vẫn treo vô thời hạn, chỉ khác là bây giờ cứ 3 phút phải bấm một nút.

**Ví dụ cụ thể:** A và B chơi ván không giới hạn thời gian. A muốn làm phiền B. A bấm "Tôi còn đây" mỗi 3 phút, suốt 2 tiếng, không đi nước nào. B vẫn kẹt y như trước.

**Options:**
- **A. Giới hạn số lần gia hạn mỗi ván** — ví dụ tối đa 3 lần cho mỗi bên trong cả ván. Hết lượt gia hạn: lần idle tiếp theo đi thẳng vào đếm ngược 30 giây, không hỏi nữa.
- **B. Giới hạn số lần gia hạn liên tiếp** — bộ đếm reset về 0 mỗi khi người đó **thực sự đi một nước**. Ví dụ tối đa 2 lần liên tiếp; đi được một nước thì lại có đủ 2 lần cho lượt sau.
- **C. Không giới hạn** — chấp nhận rằng luật chỉ chống người **rời máy**, không chống người **cố tình phá**.
- **D. Tổng ngân sách idle mỗi ván** — ví dụ mỗi bên có tổng 15 phút idle cho cả ván, gia hạn trừ dần vào đó.

**BA Recommendation (chỉ là khuyến nghị):** **B**, giới hạn **2 lần liên tiếp**.
Lý do: người rời máy thật sự (đi vệ sinh, có việc gấp) hầu như chỉ cần 1 lần gia hạn — B phục vụ họ đầy đủ. Người cố tình phá bị chặn sau 3+3+3 = 9 phút. Và vì bộ đếm reset khi đi nước, người chơi chậm trong ván dài **không bị phạt oan** — đây là ưu điểm B hơn A và D.

**Decision needed:** chọn A/B/C/D; nếu A/B thì cho biết con số cụ thể.

---

## Q-010 — Luật này áp dụng cho time control nào? · **P0 · BLOCKING**

**Related:** `DEC-002`, R08

**Tài liệu hiện nói:** time control có 4 lựa chọn — **không giới hạn** (mặc định), 5, 10, 15 phút mỗi bên. Khi có đồng hồ, hết giờ đã là thua (`TIMEOUT`).

**Vấn đề:** Với ván **có đồng hồ**, việc treo ván đã tự được giải quyết — người không đi nước sẽ hết giờ và thua. Chạy thêm luật 3 phút lên trên đồng hồ tạo hai deadline song song và câu hỏi "cái nào thắng".

**Ví dụ va chạm:** ván 5 phút, B còn 40 giây. B rời máy. Đồng hồ sẽ hết sau 40 giây, nhưng cảnh báo idle chỉ bật ở phút thứ 3. ⇒ đồng hồ luôn thắng, luật idle không bao giờ kích hoạt. Ngược lại ván 15 phút, B còn 12 phút và rời máy ⇒ idle kích hoạt trước.

**Options:**
- **A. Chỉ áp dụng khi không giới hạn thời gian.** Ván có đồng hồ dùng luật TIMEOUT sẵn có.
- **B. Áp dụng cho mọi ván;** deadline nào đến trước thì thắng (đã có sẵn nguyên tắc "deadline sớm hơn thắng" trong `03-STATE-MACHINES.md`).
- **C. Áp dụng cho mọi ván, nhưng đồng hồ luôn ưu tiên** — nếu thời gian còn lại < 3 phút thì không hiện cảnh báo idle nữa.

**BA Recommendation (chỉ là khuyến nghị):** **A**.
Lý do: đơn giản nhất, dễ test nhất, và giải quyết đúng 100% vấn đề — vì vấn đề **chỉ tồn tại** ở chế độ không giới hạn. B và C thêm độ phức tạp về thứ tự deadline mà không mang lại giá trị người dùng nào.

**Decision needed:** chọn A/B/C.

---

## Q-012 — Ván đấu với AI có áp dụng luật này không? · **P1**

**Related:** `DEC-002`, R12

**Vấn đề:** Trong ván AI chỉ có một người thật. Nếu người đó không đi nước, **không có đối thủ nào để "thắng"**. Câu "đối thủ thắng" không áp dụng được.

**Options:**
- **A. Không áp dụng.** Ván AI cứ để đó; người chơi quay lại lúc nào cũng được. (Lưu ý: đã có sẵn luật "human offline quá 60 giây → `INTERRUPTED`" cho ván AI.)
- **B. Áp dụng, nhưng hết 30 giây thì ván thành `INTERRUPTED`** (không có người thắng) thay vì AI thắng.
- **C. Áp dụng và AI thắng** — coi như người chơi bỏ cuộc.

**BA Recommendation (chỉ là khuyến nghị):** **A**.
Lý do: ván AI không có ai bị thiệt hại khi ván treo — không có đối thủ đang chờ. Luật này sinh ra để bảo vệ **người đang chờ**, nên áp vào chế độ một người là thêm phiền toái không có lý do. Ván AI treo cũng không chiếm slot phòng của ai.

**Decision needed:** chọn A/B/C.

---

## Q-013 — Đối thủ nhìn thấy gì trong lúc chờ? · **P1 · UX**

**Related:** `DEC-002`, Screen: Game Room

**Vấn đề:** Luật đã định nghĩa rõ màn hình của **người bị hỏi**. Chưa định nghĩa màn hình của **người đang chờ** — trong khi đây chính là người mà luật sinh ra để bảo vệ. Nếu họ không thấy gì, họ vẫn không biết bao giờ mình được giải thoát.

**Options (có thể chọn nhiều):**
- **A.** Hiện dòng trạng thái: *"Đối thủ chưa đi nước — đang chờ xác nhận"*.
- **B.** Hiện luôn đồng hồ đếm ngược 30 giây **cho cả hai bên**, để người chờ biết chính xác khi nào kết thúc.
- **C.** Chỉ hiện kết quả khi đã xong, không báo gì trong lúc chờ.
- **D.** Người xem (spectator) cũng thấy trạng thái này.

**BA Recommendation (chỉ là khuyến nghị):** **A + B + D**.
Lý do: người đang chờ cần biết hệ thống đã nhận ra vấn đề và đang xử lý — nếu không họ vẫn sẽ đầu hàng vì tưởng bị kẹt vĩnh viễn, tức là luật mới không cứu được họ. D vì người xem đang nhìn một bàn cờ bất động cũng cần lời giải thích.

**Decision needed:** chọn tổ hợp.

---

# NHÓM B — ĐUỔI NGƯỜI XEM (chi tiết của `DEC-004`)

---

## Q-016 — Ai có quyền đuổi người xem? · **P1**

**Related:** `DEC-004`, R04

**Tài liệu hiện nói:** chủ phòng (host) là người tạo phòng, mặc định cầm quân đỏ. Không có chuyển quyền chủ (`01-PRODUCT.md:50`). Đang PLAYING thì **không được kick đối thủ**.

**Options:**
- **A. Chỉ chủ phòng.**
- **B. Cả hai người chơi** — ai cũng đuổi được người xem.
- **C. Chỉ chủ phòng, và chỉ khi phòng ở trạng thái WAITING hoặc FINISHED** (không đuổi giữa ván để tránh gây nhiễu).

**BA Recommendation (chỉ là khuyến nghị):** **B**.
Lý do: người xem quấy rối trong chat SPECTATORS hoặc lợi dụng media gây phiền **cả hai người chơi**, không riêng chủ phòng. Nếu chỉ chủ phòng có quyền mà chủ phòng đang mải suy nghĩ nước cờ, người kia không tự bảo vệ được. Rủi ro lạm dụng thấp vì người xem không ảnh hưởng kết quả ván.

**Decision needed:** chọn A/B/C.

---

## Q-017 — Người bị đuổi có vào lại được không? · **P1**

**Related:** `DEC-004`, R04

**Vấn đề:** Nếu người bị đuổi chỉ cần dùng lại mã phòng/link cũ để vào ngay, tính năng đuổi trở nên vô nghĩa.

**Options:**
- **A. Chặn vĩnh viễn trong phòng đó** — lưu danh sách bị đuổi theo `(room, user)`; mã/link cũ vẫn bị từ chối. Danh sách xoá khi phòng đóng.
- **B. Chặn cho tới khi phòng đổi trạng thái** (ví dụ sang ván mới / rematch).
- **C. Không chặn** — đuổi chỉ để ngắt phiên hiện tại; vào lại được ngay nếu còn chỗ.

**BA Recommendation (chỉ là khuyến nghị):** **A**.
Lý do: đây là điều kiện để tính năng có tác dụng thật. Chi phí thấp — thêm một bảng chặn theo phòng. Phạm vi giới hạn trong vòng đời một phòng nên không phát sinh nhu cầu "danh sách chặn toàn hệ thống" (vốn là phạm vi lớn hơn nhiều và không có trong R nào).

**Decision needed:** chọn A/B/C.

---

# NHÓM C — LỜI MỜI

---

## Q-003 — Lời mời sẽ biến mất nếu bạn bè chưa mở app · **P1 · Diễn đạt lại**

**Related:** R02, R03, `DEC-008`

**Xin lỗi vì câu hỏi trước khó hiểu. Đây là vấn đề bằng ví dụ:**

> Bạn tạo phòng và mời **Nam** vào chơi.
> Lúc đó Nam **chưa mở website** (đang ngủ, đang học, đang ở tab khác).
> 10 phút sau, lời mời **hết hạn và biến mất**.
> Tối đó Nam mở website. **Nam không thấy gì cả** — không biết bạn đã từng mời.

**Vì sao xảy ra:** lời mời hiện chỉ được gửi **tức thời** qua kết nối realtime (như tin nhắn chỉ hiện lên khi đang mở app), và **hết hạn sau 10 phút**. Hệ thống có sẵn chức năng "xem danh sách lời mời đã nhận", nhưng **chưa có màn hình nào để người dùng bấm vào xem**.

**Vì sao quan trọng:** R02 yêu cầu "mời bạn chơi trong ứng dụng". Nếu lời mời chỉ hoạt động khi **cả hai người đang cùng online cùng lúc**, thì tính năng kết bạn + mời gần như chỉ dùng được khi đã hẹn nhau trước qua kênh khác (Zalo, Messenger...).

**Options:**
- **A. Thêm hộp thư lời mời.** Có số đếm trên thanh điều hướng (ví dụ 🔔 2). Nam mở web lúc nào cũng thấy lời mời còn hạn và bấm vào chơi. *Cần thêm 1 màn hình.*
- **B. Giữ nguyên.** Lời mời chỉ hiện khi đang online; ai không có mặt thì mất. *Không cần làm gì thêm.*
- **C. Giữ cách hiện tại nhưng kéo dài thời hạn** từ 10 phút lên lâu hơn (ví dụ 1 tiếng), và hiện lại khi người đó đăng nhập trong khoảng còn hạn.

**BA Recommendation (chỉ là khuyến nghị):** **A**.
Lý do: phần khó (lưu lời mời, API lấy danh sách) **đã được đặc tả sẵn** — chỉ thiếu màn hình hiển thị. Đây là chi phí nhỏ nhất so với giá trị: nó làm cho toàn bộ tính năng kết bạn (R02) thực sự dùng được thay vì chỉ dùng được khi hẹn trước.

**Decision needed:** chọn A/B/C; nếu C thì thời hạn bao lâu.

---

# NHÓM D — TÀI KHOẢN & PHIÊN (xác nhận khuyến nghị)

---

## Q-005 — Guest: xác nhận khuyến nghị · **P1**

PO hỏi *"nên xử lý sao"*. Khuyến nghị đầy đủ kèm lý do ở **`decision-log.md` → `DEC-006`**.

**Tóm tắt khuyến nghị:** **không hỗ trợ guest** — mọi chức năng, kể cả xem phòng PUBLIC, đều yêu cầu tài khoản đã đăng nhập và hoàn tất onboarding.

**Ba lý do chính:**
1. Khớp 100% đặc tả hiện có ⇒ **chi phí bằng 0**, không đổi hành vi nào.
2. Guest kéo theo loạt vấn đề chưa ai quyết: tên hiển thị của guest trong chat người xem là gì, chặn guest spam bằng cách nào khi không có tài khoản, guest có chiếm slot trong trần 5 người xem không.
3. Không nằm trong bất kỳ yêu cầu R01–R16 nào; thêm vào là mở rộng phạm vi trong khi dự án còn 2 tháng.

**Decision needed:** **Đồng ý** (tôi viết thành requirement tường minh) hay **Muốn mở guest** (⇒ thay đổi phạm vi, cần requirement + issue mới).

---

## Q-006 — Thời hạn phiên: xác nhận khuyến nghị · **P1**

PO hỏi *"theo bạn nên là bao lâu để trải nghiệm người dùng tốt nhất"*. Bảng đầy đủ ở **`decision-log.md` → `DEC-007`**.

**Tóm tắt khuyến nghị:**

| Mục | Đề xuất |
|---|---|
| Checkbox "Ghi nhớ đăng nhập" | **Có**, mặc định được tick |
| Tick | Phiên **30 ngày trượt** (mỗi lần dùng gia hạn lại đủ 30 ngày) |
| Bỏ tick | Phiên **chỉ sống trong tab**, đóng browser là mất |
| Không hoạt động > 30 ngày | Đăng nhập lại |
| Đăng xuất mọi thiết bị | Giữ nguyên (đã có) |

**Vì sao 30 ngày:** ngắn hơn (7 ngày) bắt người chơi giải trí không đều đặn đăng nhập lại liên tục; dài hơn/vĩnh viễn không tương xứng với tài khoản gắn email.

**Một điểm PO cần cân nhắc:** đây là ứng dụng **có camera và mic**. Phiên bị người khác dùng trên máy chung nghiêm trọng hơn ứng dụng thường, vì họ có thể bật camera/mic dưới danh nghĩa chủ tài khoản. Đó là lý do tôi đề xuất **có checkbox** thay vì luôn ghi nhớ — người dùng ở phòng máy trường có đường thoát.

**Decision needed:** đồng ý bảng trên, hay đưa con số khác.

---

# CÁC ĐIỂM BA TỰ QUYẾT (theo uỷ quyền `DEC-000-Q24`)

> Câu 24 của phỏng vấn đã uỷ quyền cho BA/agent chốt các chi tiết còn lại "theo hướng đơn giản, nhất quán, dễ kiểm thử", chỉ hỏi lại khi có thay đổi lớn về **phạm vi, chi phí hoặc quyền riêng tư**. Các điểm dưới đây là chi tiết nhất quán nội bộ, không thuộc ba loại đó, nên tôi quyết và ghi rõ — PO có thể bác bất cứ lúc nào.

| ID | Nội dung | Quyết định | Lý do |
|---|---|---|---|
| Q-014 | Idle gặp mất kết nối cùng lúc | Deadline nào **đến trước** thì có hiệu lực; bằng nhau thì ưu tiên `DISCONNECT`. Người chơi đang trong 30 giây đếm ngược mà **mất kết nối** thì chuyển sang luật mất kết nối (grace 60s theo R09), không cộng dồn hai deadline. | Dùng lại đúng nguyên tắc "deadline sớm hơn thắng" đã có trong `03-STATE-MACHINES.md`; không tạo luật thứ hai |
| Q-015 | Tên `reason` của kết quả do treo ván | Thêm giá trị mới **`INACTIVITY`** vào `Outcome.reason`, ánh xạ `FINISHED` / winner = đối thủ | Không gộp vào `TIMEOUT` (là hết đồng hồ) hay `DISCONNECT` (là mất mạng); ba nguyên nhân khác nhau phải phân biệt được trong lịch sử ván và khi QA viết test |
| Q-018 | Hộp thoại xác nhận hiện cho ai | Chỉ hiện cho **bên đến lượt**. Bên kia thấy trạng thái theo Q-013. | Người không đến lượt không có gì để xác nhận |
| Q-019 | Mốc 3 phút tính từ đâu | Tính từ **thời điểm đến lượt người đó** (server ghi nhận), không phải từ lần tương tác chuột/bàn phím cuối | Server-authoritative, đo được, không phụ thuộc sự kiện phía client vốn dễ giả mạo |

---

# ROUND 3 — ĐÃ GIẢI QUYẾT HẾT

| ID | Câu hỏi | Kết quả |
|---|---|---|
| `BA-A-01` | Người xem vào giữa trận? | `RESOLVED` — **`DEC-022`**: cho phép |
| `BA-A-02` | Sảnh hiện phòng đã xong ván? | `RESOLVED` — **`DEC-023`**: **không** hiện; mã/link vẫn vào được |
| `BA-A-04` | Hành vi đóng/huỷ từng cửa sổ | `RESOLVED` — `screen-inventory` §4–§5: mọi cửa sổ đóng được bằng **X / Esc / bấm ra ngoài**, trừ **4 cửa sổ chặn** đã liệt kê rõ |
| `BA-A-05` | Chuẩn tương phản màu | `RESOLVED` — **`DEC-024`**: WCAG 2.1 AA, **đã đo** toàn bộ bảng màu và **đạt**, thêm `DT-21` |
| — | Hai lời mời cùng lúc tới một người | `RESOLVED` — `REQ-INVITE` §14 edge case 11: gửi được cả hai; ai chấp nhận trước thì vào, cái sau bị chặn vì **đã ở phòng** |
| — | Mời người đang ở phòng khác | `RESOLVED` — `REQ-INVITE` §6 ALT-4: gửi được; lúc chấp nhận mới nhắc phải rời phòng cũ |

**Không còn câu hỏi mở nào.**
