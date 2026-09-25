# REQ-INACTIVITY — CHỐNG TREO VÁN

**ID yêu cầu:** `R17` · **Trạng thái:** NEEDS_CLARIFICATION · **Cập nhật:** 2026-09-22
**Căn cứ:** `DEC-030` · `DEC-027` · `DEC-026` · `DEC-002` · `DEC-010` · `DEC-011` · `DEC-012` · `DEC-013` · `DEC-016`
**Phụ thuộc:** [REQ-MATCH](REQ-MATCH.md) · [REQ-CLOCK](REQ-CLOCK.md) · [REQ-DISCONNECT](REQ-DISCONNECT.md)

---

## 1. FEATURE NÀY ĐỂ LÀM GÌ

Ngăn ván cờ bị treo vô thời hạn khi một người chơi **vẫn kết nối bình thường** nhưng **không đi nước**.

**Vấn đề nếu không có:** cấu hình thời gian **mặc định là không giới hạn**. Ở chế độ đó không có đồng hồ nào chạy, và luật mất kết nối chỉ kích hoạt khi mất mạng thật. Một người ngồi im (rời máy, hoặc cố tình phá) sẽ khiến:
- Đối thủ **không có lối thoát nào** ngoài đầu hàng (tức là chịu thua) hoặc ngồi chờ vô hạn.
- Đối thủ **bị khoá**: mỗi tài khoản chỉ ở một phòng, nên không tạo được phòng khác, cũng không chơi được với máy.

Tính năng này cho đối thủ một **lối thoát tự động, có giới hạn thời gian rõ ràng**, đồng thời vẫn công bằng với người chỉ tạm rời máy.

---

## 2. ACTOR

| Actor | Vai trò trong luồng |
|---|---|
| **Người chơi đến lượt** | Bên bị tính thời gian treo. Là người thấy hộp thoại xác nhận |
| **Người chơi còn lại** | Bên được bảo vệ. Chỉ **quan sát**, không thao tác gì |
| **Người xem** | Chỉ quan sát trạng thái |
| **Hệ thống** | Đếm thời gian, hiện hộp thoại, kết thúc ván khi hết hạn |

---

## 3. PRECONDITIONS

Luật **chỉ** kích hoạt khi **đồng thời** đủ các điều kiện:

| # | Điều kiện | Căn cứ |
|---|---|---|
| 1 | Ván ở trạng thái **đang chơi** (`ACTIVE`) | |
| 2 | Ván là **ván online** (2 người thật) | `DEC-012` |
| 3 | Cấu hình thời gian là **không giới hạn** | `DEC-010` |
| 4 | Người đến lượt online khi bắt đầu theo dõi lượt; khi mất mạng, **giữ nguyên mốc đã có** | DEC-030: phân xử cùng hạn mất mạng, không reset |

> **Không áp dụng khi:** ván 5/10/15 phút (đã có luật hết giờ) · ván với máy (không có ai đang chờ). Không cấp mốc mới vì mất/nối mạng; hạn đã có vẫn xử cùng hạn mất mạng theo DEC-030.

---

## 4. TRIGGER

Bên đến lượt **không thực hiện được nước đi hợp lệ nào** trong **3 phút** liên tục.

**`BR-INA-07`** — Mốc 3 phút **đầu tiên** tính từ **thời điểm đến lượt người đó**; sau xác nhận hợp lệ, tính đủ **3 phút từ thời điểm máy chủ ghi nhận xác nhận** (`DEC-027`). **Không** tính từ lần di chuột/gõ phím cuối của người dùng.

> **Lý do:** máy chủ là nguồn quyết định duy nhất; sự kiện phía client dễ giả mạo (chỉ cần rung chuột là kéo dài vô hạn).

---

## 5. MAIN FLOW (luồng chính)

| Bước | Ai | Hành động |
|---|---|---|
| 1 | Hệ thống | Bên đến lượt không đi nước trong **3 phút** |
| 2 | Hệ thống | Hiện hộp thoại **chỉ** cho bên đến lượt: *"Bạn còn trong ván đấu không?"*, **kèm đếm ngược 30 giây bắt đầu ngay** (`DEC-026`) |
| 3 | Hệ thống | Đối thủ và người xem thấy: *"Đối thủ chưa đi nước — đang chờ xác nhận"* |
| 4 | Người đến lượt | Bấm **"Tôi còn đây"** |
| 5 | Hệ thống | Đóng hộp thoại, đặt mốc cảnh báo kế tiếp = **thời điểm xác nhận hợp lệ + 3 phút**, tăng bộ đếm gia hạn thêm 1 (`DEC-027`) |
| 6 | Hệ thống | Xoá thông báo ở phía đối thủ và người xem |
| 7 | Người đến lượt | Đi một nước hợp lệ |
| 8 | Hệ thống | **Reset bộ đếm gia hạn về 0**, ván tiếp tục bình thường |

---

## 6. ALTERNATIVE FLOWS (luồng thay thế)

### ALT-1 — Đi nước ngay, không cần hộp thoại
Người chơi đi nước **trước** khi hết 3 phút ⇒ đồng hồ treo ván reset, không có gì xảy ra. **Đây là trường hợp phổ biến nhất.**

### ALT-2 — Đi nước trong lúc hộp thoại đang hiện
Hộp thoại đang mở mà người chơi đi luôn một nước hợp lệ ⇒ coi như đã xác nhận. Hộp thoại tự đóng, **không** tính là một lần gia hạn, bộ đếm reset về 0.

### ALT-3 — Đã dùng hết lượt gia hạn
Đã gia hạn **2 lần liên tiếp** mà vẫn không đi nước. Lần treo thứ 3: **không hiện hộp thoại nữa**, vào thẳng đếm ngược 30 giây.

### ALT-4 — Đầu hàng khi đang bị hỏi
Người chơi chọn đầu hàng thay vì xác nhận ⇒ ván kết thúc với nguyên nhân **đầu hàng**, không phải treo ván.

### ALT-5 — Đối thủ chủ động rời trong lúc chờ
Đối thủ (người **đang chờ**) rời phòng ⇒ tính là **đầu hàng của chính họ** theo luật chung. Trạng thái treo ván bị huỷ.

---

## 7. EXCEPTION FLOWS (luồng lỗi)

### EXC-1 — Hết 30 giây không xác nhận ⇒ thua

| Bước | Hành động |
|---|---|
| 1 | Đủ 3 phút không đi nước: hộp thoại và đếm ngược xuất hiện **đồng thời** (`DEC-026`) |
| 2 | Trong **cùng cửa sổ 30 giây**, người chơi có thể xác nhận hoặc đi nước; cả hai bên và người xem thấy đếm ngược |
| 3 | Hết 30 giây vẫn không có xác nhận và không có nước đi |
| 4 | Ván kết thúc: nguyên nhân **`INACTIVITY`**, **đối thủ thắng** |
| 5 | Ghi vào lịch sử ván, thông báo cả hai bên và người xem |

### EXC-2 — Mất kết nối trong lúc treo ván

**`BR-INA-06`** — Theo `DEC-030`, giữ nguyên mốc cảnh báo/hạn phản hồi và số lần gia hạn khi mất/nối mạng. Ân hạn DISCONNECT = lúc phát hiện offline + 60 giây; hạn hợp lệ đến trước có hiệu lực, bằng nhau ưu tiên DISCONNECT. Không cộng thời gian, không reset thành 3 phút mới.

Nối lại nhận trạng thái theo thời gian còn lại; nếu mốc hỏi đã qua thì hiện ngay countdown còn lại. Hạn kết thúc đã đến thì nhận kết quả, không tiếp tục lượt. Ví dụ mất mạng 2:50, quay lại 3:10 ⇒ hạn cũ 3:30, còn 20 giây; mất mạng 3:20 không dời hạn 3:30 sang 4:20.

### EXC-3 — Hai thời hạn cùng đến

**`BR-INA-06`** — Thời hạn nào **đến trước** thì có hiệu lực. Bằng nhau thì ưu tiên **mất kết nối** (`DISCONNECT`).

### EXC-4 — Máy chủ khởi động lại khi đang đếm
Ván chuyển **gián đoạn** (`SERVER_RESTART`), **không ai thắng**. Treo ván **không** được xử lý bằng thời gian máy chủ nghỉ.

### EXC-5 — Ván kết thúc vì lý do khác khi đang đếm
Đối thủ đầu hàng, hoặc hai bên đồng ý hoà, hoặc lặp 3 lần ⇒ ván kết thúc theo nguyên nhân đó. Trạng thái treo ván bị huỷ.

---

## 8. POSTCONDITION

| Kết cục | Trạng thái ván | Người thắng | Bộ đếm gia hạn |
|---|---|---|---|
| Xác nhận kịp | Đang chơi | — | +1 |
| Đi được nước | Đang chơi | — | **Reset về 0** |
| Hết 30 giây | **Kết thúc** (`INACTIVITY`) | **Đối thủ** | — |
| Mất mạng rồi quá 60 giây | **Kết thúc** (`DISCONNECT`) | **Đối thủ** | — |
| Máy chủ khởi động lại | **Gián đoạn** | **Không ai** | — |

Ván đã kết thúc **không bao giờ** quay lại đang chơi.

---

## 9. BUSINESS RULES

| ID | Luật |
|---|---|
| **BR-INA-01** | Ngưỡng treo ván = **3 phút** không đi được nước hợp lệ |
| **BR-INA-02** | Xác nhận hợp lệ ⇒ được đủ **3 phút từ thời điểm xác nhận do máy chủ ghi nhận**; không tính từ mốc hỏi cũ (`DEC-027`) |
| **BR-INA-03** | Tối đa **2 lần gia hạn liên tiếp** mỗi người chơi |
| **BR-INA-04** | Bộ đếm gia hạn **reset về 0** khi người đó **đi được một nước hợp lệ** |
| **BR-INA-05** | Hết lượt gia hạn ⇒ lần treo tiếp theo vào thẳng đếm ngược **30 giây**, không hỏi |
| **BR-INA-06** | Thời hạn đến trước thắng; bằng nhau ưu tiên `DISCONNECT`; không cộng dồn |
| **BR-INA-07** | Mốc đầu từ lúc đến lượt; mốc gia hạn từ xác nhận hợp lệ; đều do **máy chủ** ghi nhận, không theo di chuột/gõ phím client |
| **BR-INA-08** | Chỉ áp dụng khi cấu hình thời gian = **không giới hạn** |
| **BR-INA-09** | **Không** áp dụng cho ván với máy |
| **BR-INA-10** | Hộp thoại xác nhận **chỉ** hiện cho bên đến lượt |
| **BR-INA-11** | Nguyên nhân kết thúc là **`INACTIVITY`** — phân biệt với `TIMEOUT` và `DISCONNECT` |
| **BR-INA-12** | Chỉ **bên đến lượt** xác nhận được. **Mọi tab** của người đó đều xác nhận được (`DEC-020`); bấm hai lần chỉ cộng **một lần** |

**Thời gian khi không đi nước và không có reconnect/undo:**

Mốc cảnh báo đầu = lúc đến lượt + 180 giây. Sau mỗi xác nhận hợp lệ, mốc cảnh báo tiếp theo = lúc máy chủ ghi nhận xác nhận + 180 giây (`DEC-027`). Hết hai lần gia hạn: tới mốc tiếp theo thì đếm cuối 30 giây, không cho gia hạn nữa.

```
0:00 đến lượt → 3:00 hỏi + đếm 30 giây
3:29 xác nhận lần 1 → 6:29 hỏi + đếm 30 giây
6:58 xác nhận lần 2 → 9:58 đếm cuối → 10:28 THUA
```

Với hai lần xác nhận trễ `d1`, `d2` giây, mỗi giá trị từ 0 đến dưới 30: tổng = **570 + d1 + d2 giây** (từ **9:30 đến dưới 10:30**). **9:30 chỉ là trường hợp xác nhận ngay cả hai lần**, không phải trần cố định. Xác nhận đúng hoặc sau hạn bị từ chối. Reconnect không làm tăng mốc theo DEC-030; nếu DISCONNECT hoặc một kết quả khác đến trước thì ván kết thúc sớm hơn. Undo vẫn theo quy tắc riêng.

---

## 10. PERMISSIONS

| Hành động | Người đến lượt | Đối thủ | Người xem | Tab khác |
|---|:---:|:---:|:---:|:---:|
| Thấy hộp thoại xác nhận | ✅ | ❌ | ❌ | ✅ |
| Bấm xác nhận | ✅ | ❌ | ❌ | ✅ |
| Thấy trạng thái "đang chờ xác nhận" | ✅ | ✅ | ✅ | ✅ |
| Thấy đếm ngược 30 giây | ✅ | ✅ | ✅ | ✅ |
| Tự kết thúc ván sớm | ❌ | ❌ | ❌ | ❌ |

**`BR-INA-13`** — Đối thủ **không** có nút nào để ép kết thúc sớm. Chỉ hệ thống quyết định, theo thời gian.

**`BR-INA-14`** — Hộp thoại hiện ở **mọi tab** của bên đến lượt; xác nhận ở tab bất kỳ là đủ (`DEC-020`).

---

## 11. UI LIÊN QUAN

| Màn hình | Phần tử |
|---|---|
| `SCR-GAME-ROOM` | Hộp thoại xác nhận · dòng trạng thái · đồng hồ đếm ngược 30 giây |

### Hộp thoại xác nhận (chỉ bên đến lượt)

```
┌──────────────────────────────────────┐
│  Bạn còn trong ván đấu không?        │
│                                      │
│  Bạn chưa đi nước trong 3 phút.      │
│  Xác nhận để có thêm 3 phút.         │
│                                      │
│  Còn 2 lần gia hạn.                  │
│  Thời gian xác nhận: 00:30           │
│                                      │
│        [ Tôi còn đây ]               │
└──────────────────────────────────────┘
```

- **Không có nút đóng/huỷ.** Chỉ đóng khi xác nhận, khi đi nước, hoặc khi hết giờ.
- Hiển thị **số lần gia hạn còn lại**.
- Lần cuối cùng phải cảnh báo rõ: *"Đây là lần gia hạn cuối."*

### Phía đối thủ và người xem

```
⏳ Đối thủ chưa đi nước — đang chờ xác nhận
```
Đếm ngược bắt đầu **ngay khi hộp thoại hiện**, không có khoảng chờ trước đó (`DEC-026`):
```
⏳ Đối thủ không phản hồi — kết thúc sau 00:27
```

**`BR-UI-INA-01`** — Trạng thái **không** chỉ dựa vào màu sắc. Phải có chữ và biểu tượng đi kèm.

---

## 12. STATES

Định nghĩa thời gian: `DEC-026`. **ĐANG HỎI đã bao gồm đếm ngược 30 giây**, không phải giai đoạn chờ trước đếm ngược. Trạng thái ĐANG ĐẾM NGƯỢC riêng dùng khi hết lượt gia hạn theo BR-INA-05.

```
BÌNH THƯỜNG ──(3 phút không đi, còn gia hạn)──► ĐANG HỎI + ĐẾM 30 GIÂY
                                                    ├─ xác nhận trước hạn → gia hạn (*)
                                                    ├─ đi nước hợp lệ → tiếp tục, reset
                                                    └─ hết hạn, không phản hồi → THUA

BÌNH THƯỜNG ──(3 phút không đi, hết gia hạn)──► ĐẾM 30 GIÂY, KHÔNG CHO GIA HẠN
                                                    ├─ đi nước hợp lệ → tiếp tục, reset
                                                    └─ hết hạn, không đi → THUA
```

(*) Gia hạn đặt mốc tiếp theo tại thời điểm xác nhận hợp lệ + 180 giây (`DEC-027`).

| Trạng thái | UI bên đến lượt | UI đối thủ & người xem |
|---|---|---|
| **Bình thường** | Bàn cờ bình thường | Bàn cờ bình thường |
| **Đang hỏi** | Hộp thoại xác nhận **kèm đếm ngược ngay** | Dòng trạng thái + đếm ngược |
| **Đang đếm ngược (hết gia hạn)** | Đếm ngược, không cho xác nhận gia hạn | Dòng + đếm ngược |
| **Kết thúc** | Màn kết quả | Màn kết quả |

---

## 13. REALTIME BEHAVIOR

| Sự kiện | Ai tạo | Máy chủ kiểm gì | Ai nhận | UI đổi gì |
|---|---|---|---|---|
| Hết 3 phút | **Hệ thống** | Ván đang chơi · không giới hạn thời gian · mốc cảnh báo đã tới; offline không dời mốc (`DEC-030`) | Cả phòng | Bên đến lượt: hộp thoại **kèm đếm ngược ngay**. Người khác: dòng trạng thái + đếm ngược |
| Xác nhận | Người đến lượt | Đúng người đến lượt · tab đã xác thực (mọi tab đều được theo DEC-020) · còn lượt gia hạn | Cả phòng | Đóng hộp thoại, xoá dòng trạng thái |
| Bắt đầu 30 giây (cùng thời điểm hết 3 phút) | **Hệ thống** | Chưa có nước đi · ván còn ACTIVE | Cả phòng | Hiện đếm ngược cho **tất cả**, không tạo thêm một khoảng chờ |
| Hết 30 giây | **Hệ thống** | Vẫn chưa xác nhận | Cả phòng | Màn kết quả, nguyên nhân `INACTIVITY` |

**`BR-INA-15`** — Đồng hồ đếm ngược hiển thị dựa trên **thời gian máy chủ**, client chỉ đếm tiếp cục bộ. Khi đồng bộ lại, lấy theo máy chủ. Client **không bao giờ** tự quyết định ván đã kết thúc.

**Sau khi nối lại:** người chơi nối lại giữa lúc đang hỏi/đang đếm phải **nhận ngay** trạng thái hiện tại và thời gian còn lại.

---

## 14. EDGE CASES

| # | Tình huống | Xử lý |
|---|---|---|
| 1 | Xác nhận đúng **giây thứ 30** | Máy chủ so mốc thời gian. Xác nhận đến **trước** hạn ⇒ hợp lệ. Đến **đúng hoặc sau** hạn ⇒ ván đã kết thúc, trả lỗi "ván đã kết thúc" |
| 2 | Bấm xác nhận **2 lần** (mạng chậm) | Lần thứ hai **không** cộng thêm 3 phút nữa. Cùng một lệnh chỉ có một kết quả |
| 3 | Mở 2 tab, tab nào cũng bấm xác nhận | **Được**; bấm ở cả hai chỉ cộng **một lần 3 phút** (`BR-INA-12`) |
| 4 | Mở tab mới khi đang bị hỏi | Tab mới thấy **cùng** trạng thái và thời gian còn lại, xác nhận được |
| 5 | Treo ván lúc đang có đề nghị hoà chờ | Hai việc độc lập. Đề nghị hoà vẫn hết hạn theo luật riêng (30 giây) |
| 6 | Người **đang chờ** mới là người mất mạng | Giữ mốc lượt hiện tại; theo dõi hạn mất mạng của người offline. Hạn hợp lệ đến trước quyết định; không reset thời gian bên đang đến lượt (`DEC-030`) |
| 7 | Cả hai mất mạng khi đang đếm | Ván **gián đoạn**, **không ai thắng** |
| 8 | Đổi cấu hình thời gian giữa ván | **Không xảy ra** — cấu hình khoá khi ván bắt đầu |
| 9 | Đi lại (undo) được chấp nhận khi đang bị hỏi | Đồng hồ treo ván **bắt đầu lại từ đầu** cho bên đến lượt mới. Bộ đếm gia hạn **giữ nguyên** |
| 10 | Bên đến lượt **không còn nước hợp lệ nào** | Ván đã kết thúc theo luật cờ (`CHECKMATE`/`STALEMATE`) **trước** khi treo ván kích hoạt |
| 11 | Người xem vào giữa lúc đang đếm ngược | Thấy ngay trạng thái và thời gian còn lại |
| 12 | Gia hạn lần 2 rồi đi 1 nước, sau đó lại treo | Bộ đếm đã reset ⇒ **có lại đủ 2 lần** gia hạn (`BR-INA-04`) |

---

## 15. ACCEPTANCE CRITERIA

| ID | Tiêu chí | Cách kiểm |
|---|---|---|
| **AC-INA-01** | Ván không giới hạn, tại **3:00** không đi ⇒ hộp thoại hiện cho bên đến lượt **đồng thời bắt đầu đếm 30 giây**; bên kia chỉ thấy dòng trạng thái + đếm ngược | Đồng hồ giả, 2 phiên |
| **AC-INA-02** | Ván 5/10/15 phút ⇒ hộp thoại **không bao giờ** hiện | Đồng hồ giả, cả 3 cấu hình |
| **AC-INA-03** | Ván với máy ⇒ hộp thoại **không bao giờ** hiện | Đồng hồ giả |
| **AC-INA-04** | Xác nhận tại **3:29** ⇒ mốc cảnh báo tiếp theo **6:29**, chưa cảnh báo tại 6:00; hai lần đều xác nhận trễ 29 giây ⇒ thua tại **10:28** nếu không đi nước/kết thúc vì lý do khác | Đồng hồ giả, không reconnect/undo |
| **AC-INA-05** | Không xác nhận/đi nước, vẫn online, không có nguyên nhân kết thúc khác ⇒ tại **3:30 tính từ lúc đến lượt**, ván kết thúc do **`INACTIVITY`**, **đối thủ thắng** (`DEC-026`) | Đồng hồ giả |
| **AC-INA-06** | Gia hạn **lần 3 bị từ chối** — vào thẳng đếm ngược | Đồng hồ giả, 3 chu kỳ |
| **AC-INA-07** | Đi được 1 nước ⇒ bộ đếm reset, lại có đủ **2 lần** gia hạn | Đồng hồ giả |
| **AC-INA-08** | Mất mạng khi đang đếm ⇒ **giữ hạn cũ**, phân xử với hạn mất mạng 60 giây, không cộng/reset thời gian (`DEC-030`) | Ngắt kết nối thật |
| **AC-INA-09** | Đối thủ và **người xem** đều thấy đếm ngược | 3 phiên (2 chơi + 1 xem) |
| **AC-INA-10** | **Mọi tab** xác nhận được; hai tab bấm cùng lúc chỉ cộng **một lần** | 2 tab cùng tài khoản |
| **AC-INA-11** | Bấm xác nhận 2 lần ⇒ **chỉ cộng 3 phút một lần** | Gửi lặp cùng lệnh |
| **AC-INA-12** | Xác nhận đến sau hạn ⇒ **từ chối**, ván đã kết thúc | Đồng hồ giả, race |
| **AC-INA-13** | Máy chủ khởi động lại khi đang đếm ⇒ **gián đoạn**, không ai thắng | Khởi động lại thật |
| **AC-INA-14** | Nguyên nhân `INACTIVITY` hiện đúng trong **lịch sử ván** | Đọc lịch sử |
| **AC-INA-15** | Mất mạng 2:50, nối lại 3:10 ⇒ thấy **20 giây** tới hạn 3:30; lặp mất/nối không dời hạn (`DEC-030`) | Ngắt/nối thật |

**`AC-INA-16`** — Toàn bộ kiểm thử thời gian dùng **đồng hồ giả tiêm vào**, **không** dùng lệnh chờ thật.

---

## 16. DEPENDENCY

| Phụ thuộc | Quan hệ |
|---|---|
| [REQ-MATCH](REQ-MATCH.md) | Cần vòng đời ván và cơ chế kết thúc ván |
| [REQ-CLOCK](REQ-CLOCK.md) | Cần biết cấu hình thời gian để quyết định có áp dụng không (`BR-INA-08`) |
| [REQ-DISCONNECT](REQ-DISCONNECT.md) | Cần luật ân hạn 60 giây để xử lý va chạm (`BR-INA-06`) |
| [REQ-GAME-ACTIONS](REQ-GAME-ACTIONS.md) | Đi lại được chấp nhận làm reset đồng hồ treo ván (edge case 9) |
| [REQ-SPECTATOR](REQ-SPECTATOR.md) | Người xem cũng nhận trạng thái (`DEC-013`) |

---

## 17. OPEN QUESTIONS

**Q-AUD-01/02 RESOLVED** bởi DEC-026/027/030. Xem [backlog hiện tại](../08-ba-review/question-backlog-2026-09-22.md); quyền xác nhận ở mọi tab đã đồng bộ theo DEC-020.
