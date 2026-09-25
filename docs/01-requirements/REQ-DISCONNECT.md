# REQ-DISCONNECT — MẤT KẾT NỐI VÀ NỐI LẠI

**ID yêu cầu:** `R09` · **Trạng thái:** Ready · **Cập nhật:** 2026-09-22
**Căn cứ:** `DEC-030`, `DEC-031` · Câu 13 phỏng vấn

---

## 1. FEATURE NÀY ĐỂ LÀM GÌ

Xử lý công bằng khi mạng rớt, đóng tab, tải lại trang, hoặc máy chủ khởi động lại — sao cho **không ai thua oan vì lỗi hệ thống**, nhưng cũng **không ai lợi dụng mất mạng** để kéo dài ván.

---

## 2. ACTOR

| Actor | Vai trò |
|---|---|
| **Người chơi mất kết nối** | Có **60 giây** để quay lại |
| **Người chơi còn lại** | Chờ, thấy đếm ngược |
| **Người xem** | Có **15 giây** giữ ghế |
| **Hệ thống** | Phát hiện mất kết nối, đếm hạn, quyết định kết quả |

## 3. PRECONDITIONS

Là thành viên phòng. Phân biệt 60 giây ân hạn khi đang chơi với **60 giây giữ ghế WAITING** (BR-DIS-19): quá hạn phòng chờ không tạo kết quả thắng/thua.

## 4. TRIGGER

Mạng rớt · đóng tab · tải lại trang · tín hiệu duy trì hết hạn · máy chủ khởi động lại.

---

## 5. MAIN FLOW — MỘT NGƯỜI CHƠI MẤT KẾT NỐI RỒI QUAY LẠI

| Bước | Hành động |
|---|---|
| 1 | Máy chủ phát hiện mất kết nối (ngắt rõ ràng, hoặc tín hiệu duy trì hết hạn) |
| 2 | Đánh dấu người đó **ngoại tuyến**, bắt đầu đếm **60 giây** |
| 3 | Đối thủ và người xem thấy: *"Đối thủ mất kết nối — còn 00:54"* |
| 4 | **Đồng hồ ván vẫn chạy bình thường** nếu có |
| 5 | Người đó mở lại trang / mạng có lại |
| 6 | Máy chủ kiểm quyền, trả **trạng thái ván hiện tại** |
| 7 | Đánh dấu **trực tuyến** trở lại, huỷ đếm ngược, báo cả phòng |

---

## 6. ALTERNATIVE FLOWS

- **ALT-1 — Tải lại trang:** giống mất kết nối rồi quay lại, chỉ thường rất nhanh. Ghế **không** mất. **Camera/mic trở về tắt**, phải bật lại.
- **ALT-2 — Mở tab thứ hai:** khi đã xác thực, **cả hai tab đều đồng bộ và đều thao tác được** (`DEC-020`). Phiên tạm ở tab mới thông thường cần đăng nhập riêng; restore/duplicate có giới hạn theo DEC-040. Riêng **camera/micro** chỉ một tab phát; tab kia hiện nút **"Chuyển sang tab này"** (`DEC-021`).
- **ALT-3 — Mất kết nối khi đang chờ (chưa vào ván):** giữ ghế **60 giây** từ lúc máy chủ phát hiện; mất ready, trở lại phải ready lại. Hết hạn Host ⇒ đóng phòng; PLAYER còn lại ⇒ mất ghế, xoá ready cả hai (`DEC-031`, BR-ROOM-19).
- **ALT-4 — Người xem mất kết nối:** giữ ghế **15 giây**. Quay lại kịp thì vào tiếp (**kiểm lại quyền**); quá hạn thì mất ghế.

---

## 7. EXCEPTION FLOWS

### EXC-1 — Không quay lại trong 60 giây

| Điều kiện | Kết quả |
|---|---|
| Đối thủ **vẫn trực tuyến** | Ván **kết thúc**, người mất kết nối **THUA** |
| Đối thủ **cũng ngoại tuyến** | Ván **GIÁN ĐOẠN**, **không ai thắng** |

### EXC-2 — Cả hai mất kết nối
Ngay khi máy chủ xác định **cả hai** đều ngoại tuyến ⇒ ván **gián đoạn**, **không ai thắng**. **`BR-DIS-05`**

### EXC-3 — Máy chủ khởi động lại
Mọi ván đang chơi chuyển **gián đoạn**, **không ai thắng**. **Không** dùng thời gian máy chủ nghỉ để xử thua ai. Lịch sử ván được giữ. **`BR-DIS-06`**

### EXC-4 — Hết giờ trong lúc đang mất kết nối
Đồng hồ vẫn chạy ⇒ có thể **hết giờ trước** khi hết 60 giây. Thời hạn nào đến trước thì thắng; bằng nhau ⇒ **ưu tiên hết giờ**. **`BR-DIS-07`**

### EXC-5 — Quay lại nhưng không có phiên hợp lệ
Phiên đã thu hồi/hết hạn, hoặc phiên tạm không còn dữ liệu/hết hạn (DEC-040) ⇒ về đăng nhập. Đăng nhập không dừng hay cấp lại hạn mất kết nối/chống treo. Ván xử như chưa quay lại cho tới khi xác thực, kiểm lại membership/quyền và nối lại hợp lệ.

### EXC-6 — Quay lại nhưng đã bị mất quyền
Người xem quay lại mà phòng đã chuyển riêng tư hoặc bị đuổi ⇒ **từ chối**, đưa về sảnh.

---

## 8. POSTCONDITION

| Kết cục | Trạng thái |
|---|---|
| Quay lại kịp | Trực tuyến; ván tiếp tục; **camera/mic đã tắt** |
| Không kịp, đối thủ trực tuyến | Ván **kết thúc**, người mất kết nối thua |
| Không kịp, cả hai ngoại tuyến | Ván **gián đoạn**, không ai thắng |
| Máy chủ khởi động lại | Ván **gián đoạn**, không ai thắng |
| Người xem quá 15 giây | Mất ghế, ghế nhường người khác |

---

## 9. BUSINESS RULES

| ID | Luật |
|---|---|
| **BR-DIS-01** | Người chơi có **60 giây** để quay lại, tính **từ lúc máy chủ phát hiện** ngoại tuyến |
| **BR-DIS-02** | **Đồng hồ ván vẫn chạy** trong lúc mất kết nối |
| **BR-DIS-03** | Quá 60 giây **và đối thủ còn trực tuyến** ⇒ người mất kết nối **thua** |
| **BR-DIS-04** | Tải lại trang **không** mất ghế |
| **BR-DIS-05** | **Cả hai** ngoại tuyến ⇒ **gián đoạn**, không ai thắng |
| **BR-DIS-06** | Máy chủ khởi động lại ⇒ **gián đoạn**, không ai thắng |
| **BR-DIS-07** | Thời hạn đến trước thắng; hết giờ và mất mạng bằng nhau ⇒ **ưu tiên hết giờ** |
| **BR-DIS-08** | Một thời hạn **đã tới hạn hợp lệ** thì **không bị xoá** bởi một sự kiện mất kết nối phát hiện sau đó |
| **BR-DIS-09** | Người xem giữ ghế **15 giây** |
| **BR-DIS-10** | Quay lại **phải kiểm tra lại quyền**, không tin trạng thái cũ của client |
| **BR-DIS-11** | Tải lại/nối lại: camera/mic về Tắt theo quy tắc hiện có. Chuyển tab: **chỉ nguồn chuyển về Tắt**, nguồn còn lại giữ nguyên (DEC-033) |
| **BR-DIS-12** | **Mọi tab đều đồng bộ và đều thao tác được** (`DEC-020`). Máy chủ chống xung đột bằng kiểm lượt + phiên bản + mã lệnh |
| **BR-DIS-13** | **Camera/micro chỉ một tab phát được**; chuyển sang tab khác thì tab cũ **dừng thiết bị trước** (`DEC-021`) |
| **BR-DIS-14** | Tab cùng tài khoản không tạo PLAYER thứ hai; mọi tab đã xác thực đều gửi được lệnh của PLAYER đó |
| **BR-DIS-15** | Ván với máy: người thật offline tới **60 giây** ⇒ gián đoạn nếu chưa có deadline/kết quả trước đó. Đồng hồ hết trước vẫn thua TIMEOUT; không thua DISCONNECT chỉ vì AI luôn online (DEC-045) |
| **BR-DIS-16** | Giao diện hiển thị đếm ngược theo **thời gian máy chủ** |
| **BR-DIS-18** | Mất/nối mạng không dời hạn chống treo đã có; nối lại nhận thời gian còn lại, không thêm 3 phút. Hạn hợp lệ đến trước thắng, bằng nhau INACTIVITY/DISCONNECT thì DISCONNECT (`DEC-030`) |
| **BR-DIS-19** | WAITING giữ ghế PLAYER 60 giây; mất ready khi offline, phải ready lại sau nối lại. Hết hạn Host đóng phòng, PLAYER còn lại mất ghế và reset ready cả hai; không có kết quả ván (`DEC-031`) |

---

## 10. PERMISSIONS

| Hành động | Người chơi | Người xem | Tab khác |
|---|:---:|:---:|:---:|
| Quay lại phòng | ✅ (60 giây) | ✅ (15 giây) | ✅ |
| Thấy đếm ngược của đối thủ | ✅ | ✅ | ✅ |
| **Chuyển camera/mic sang tab này** | ✅ | ✅ | ✅ (chính chủ) |
| Ép kết thúc ván sớm | ❌ | ❌ | ❌ |

**`BR-DIS-17`** — Đối thủ **không** có nút ép thắng sớm. Chỉ hệ thống quyết định theo thời gian.

---

## 11. UI LIÊN QUAN

`SCR-GAME-ROOM` (thanh trạng thái kết nối) · `SCR-RECONNECTING` (lớp phủ) · `SCR-MEDIA-TAB-SWITCH`

| Trạng thái | Hiển thị |
|---|---|
| Mình mất kết nối | Lớp phủ *"Mất kết nối — đang thử lại…"*, thao tác bị vô hiệu |
| Đối thủ mất kết nối | *"Đối thủ mất kết nối — còn 00:54"* |
| Đang quay lại | *"Đang đồng bộ…"* |
| Camera bật ở tab khác | *"Camera đang bật ở tab khác"* + nút **Chuyển sang tab này** |
| Ván gián đoạn | Màn kết quả ghi rõ *"Ván bị gián đoạn — không có người thắng"* |

---

## 12. STATES

```
A ONLINE → phát hiện A offline → ghi deadline mất mạng = detectedAt + 60 giây
  ├─ có deadline kết thúc đã tới trước → giữ kết quả đó
  ├─ phát hiện B cũng offline → INTERRUPTED ngay tại thời điểm phát hiện B
  ├─ A nối lại hợp lệ trước mọi deadline → tiếp tục, giữ mốc inactivity cũ
  └─ tới deadline, B vẫn online → A thua DISCONNECT
```

Trước mỗi chuyển trạng thái, phân xử deadline đã tới theo BR-DIS-07/08. Không chờ hết 60 giây mới xử lý khi người thứ hai offline. Với AI, xem BR-DIS-15; WAITING dùng BR-DIS-19; SPECTATOR giữ ghế 15 giây, không tạo kết quả ván.


---

## 13. REALTIME BEHAVIOR

| Sự kiện | Ai tạo | Máy chủ kiểm gì | Ai nhận | UI đổi gì |
|---|---|---|---|---|
| Phát hiện mất kết nối | Hệ thống | Ngắt rõ ràng hoặc hết hạn tín hiệu | Cả phòng | Hiện đếm ngược 60 giây |
| Quay lại | Client | Phiên hợp lệ · vẫn là thành viên · vẫn đủ quyền | Cả phòng | Huỷ đếm ngược; client nhận trạng thái đầy đủ |
| Quá hạn 60 giây | Hệ thống | Đối thủ còn trực tuyến không | Cả phòng | Màn kết quả |
| Chuyển thiết bị sang tab khác | Người dùng | Đúng chủ tài khoản | Tab cũ + cả phòng | Chỉ nguồn chuyển ở tab cũ bị thu hồi; cờ/chat vẫn thao tác được; nguồn còn lại giữ nguyên (DEC-033/041) |
| Máy chủ khởi động lại | Hệ thống | — | Mọi người | Mọi ván đang chơi thành **gián đoạn** |

---

## 14. EDGE CASES

| # | Tình huống | Xử lý |
|---|---|---|
| 1 | Mất kết nối 59 giây rồi quay lại | Ván tiếp tục **nếu chưa có hạn hợp lệ/kết quả khác đến trước**; không reset inactivity |
| 2 | Mất kết nối 61 giây, đối thủ trực tuyến | **Thua** |
| 3 | Mất kết nối 61 giây, đối thủ cũng rớt ở giây thứ 30 | **Gián đoạn** — cả hai ngoại tuyến (`BR-DIS-05`) |
| 4 | A rớt, hết 60 giây; **sau đó** mới phát hiện B cũng đã rớt | Kết quả đã tới hạn **vẫn giữ** (`BR-DIS-08`) |
| 5 | Đồng hồ còn 30 giây, rớt mạng 70 giây | Thua do **hết giờ** (đến trước) |
| 6 | Đồng hồ còn 5 phút, rớt mạng 70 giây | Thua do **mất kết nối** (đến trước) |
| 7 | Tải lại trang liên tục nhiều lần | Mỗi lần là một chu kỳ ngắn; ghế **không** mất |
| 8 | Mở 5 tab cùng lúc | **Cả 5 đồng bộ và thao tác được**, chiếm **một** ghế. Camera chỉ 1 tab phát |
| 9 | Chuyển camera sang tab khác | Xác nhận nguồn cũ ngắt trước; nguồn tab mới Tắt, chỉ phát sau khi bật riêng. Nguồn còn lại giữ nguyên (DEC-033/034) |
| 10 | Rớt mạng đúng lúc đang gửi nước đi | Quay lại rồi đồng bộ; nước đi **không** bị ghi hai lần |
| 11 | Máy chủ khởi động lại khi cả hai đang trực tuyến | **Gián đoạn**, không ai thắng |
| 12 | Người xem rớt 14 giây | Giữ ghế, quay lại được (**kiểm lại quyền**) |
| 13 | Người xem rớt 16 giây, phòng đã đầy | Mất ghế, **không** vào lại được |
| 14 | Quay lại mà phòng đã chuyển sang khoá | Bị từ chối, về sảnh |
| 15 | Ván với máy, người thật rớt 70 giây | **Gián đoạn** (`BR-DIS-15`) |

---

## 15. ACCEPTANCE CRITERIA

| ID | Tiêu chí |
|---|---|
| **AC-DIS-01** | Quay lại **trước** 60 giây và chưa có kết quả/hạn hợp lệ khác ⇒ ván tiếp tục với thời gian còn lại đúng; không dời hạn chống treo |
| **AC-DIS-02** | Quá 60 giây, đối thủ trực tuyến ⇒ người mất kết nối **thua** |
| **AC-DIS-03** | **Cả hai** ngoại tuyến ⇒ **gián đoạn**, **không ai thắng** |
| **AC-DIS-04** | Máy chủ khởi động lại ⇒ **gián đoạn**, không ai thắng, lịch sử được giữ |
| **AC-DIS-05** | Đồng hồ **vẫn chạy** trong lúc mất kết nối |
| **AC-DIS-06** | Hết giờ và hết hạn mất mạng cùng lúc ⇒ **ưu tiên hết giờ** |
| **AC-DIS-07** | Kết quả đã tới hạn **không bị xoá** bởi sự kiện mất kết nối phát hiện sau |
| **AC-DIS-08** | Tải lại trang **không** mất ghế |
| **AC-DIS-09** | Tải lại/quay lại: camera/mic về Tắt; chuyển tab chỉ nguồn chuyển về Tắt, nguồn còn lại tiếp tục (DEC-033) |
| **AC-DIS-10** | Tab thứ hai **đi cờ và chat được**; hai tab đi cùng lúc ⇒ **đúng một** nước được ghi |
| **AC-DIS-11** | **Camera chỉ một nguồn phát được cấp quyền**; chuyển sang tab khác đòi bằng chứng SFU thu hồi nguồn cũ trước. Nguồn mới OFF; không hứa hardware cũ đã dừng khi thiếu ACK (DEC-041) |
| **AC-DIS-12** | Người xem giữ ghế **15 giây**, quá hạn thì mất |
| **AC-DIS-13** | Quay lại **luôn kiểm tra lại quyền** |
| **AC-DIS-14** | Đếm ngược hiển thị **giống nhau** ở cả hai phía, theo thời gian máy chủ |
| **AC-DIS-15** | AI: đồng hồ người thật còn 20 giây hoặc đúng 60 giây khi offline ⇒ TIMEOUT ở hạn tương ứng; còn trên 60 giây ⇒ INTERRUPTED tại 60 giây nếu chưa kết thúc. Không thua DISCONNECT vì AI luôn online (DEC-045) |
| **AC-DIS-16** | Đối thủ **không** có cách nào ép kết thúc sớm |
| **AC-DIS-17** | Đến lượt 0:00, mất mạng 2:50, nối lại 3:10 ⇒ hạn chống treo vẫn 3:30, còn 20 giây; lặp reconnect không cấp thêm 3 phút |
| **AC-DIS-18** | WAITING: kiểm Host và PLAYER quá hạn 60 giây, quay lại trước hạn, nhiều tab và offline đã-ready theo AC-ROOM-18…20; không tạo kết quả Match |

---

## 16. DEPENDENCY

[REQ-MATCH](REQ-MATCH.md) · [REQ-CLOCK](REQ-CLOCK.md) · [REQ-INACTIVITY](REQ-INACTIVITY.md) · [REQ-SPECTATOR](REQ-SPECTATOR.md) · [REQ-MEDIA](REQ-MEDIA.md) · [REQ-AUTH](REQ-AUTH.md)

## 17. OPEN QUESTIONS

Q-AUD-02/03 đã chốt tại DEC-030/031. Các finding khác về media/AI vẫn theo [backlog hiện tại](../08-ba-review/question-backlog-2026-09-22.md); chưa coi toàn module đã qua audit cuối.
