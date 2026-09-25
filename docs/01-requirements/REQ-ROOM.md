# REQ-ROOM — PHÒNG CHƠI

**ID yêu cầu:** `R03`, `R04` · **Trạng thái:** Ready · **Cập nhật:** 2026-09-22
**Căn cứ:** `DEC-042`, `DEC-031`, `DEC-032`, `DEC-035/036` · Câu 7 phỏng vấn · `DEC-005` (5 người xem)
**Phụ thuộc:** [REQ-AUTH](REQ-AUTH.md) · [REQ-LOBBY](REQ-LOBBY.md) · [REQ-INVITE](REQ-INVITE.md) · [REQ-SPECTATOR](REQ-SPECTATOR.md)

---

## 1. FEATURE NÀY ĐỂ LÀM GÌ

Phòng là **không gian chứa người**: 2 ghế chơi + tối đa 5 ghế xem. Phòng quản lý ai được vào, ai cầm bên nào, khi nào ván bắt đầu, và **sống lâu hơn một ván** — tái đấu tạo ván mới trong **cùng** phòng.

---

## 2. ACTOR

| Actor | Vai trò |
|---|---|
| **Chủ phòng** | Tạo phòng; đổi tên/chế độ riêng tư/thời gian; đồng thời là một người chơi |
| **Người chơi thứ hai** | Vào ghế còn lại, sẵn sàng, chơi |
| **Người xem** | Xem — chi tiết ở [REQ-SPECTATOR](REQ-SPECTATOR.md) |
| **Hệ thống** | Đếm sức chứa, bắt đầu ván, đóng phòng |

---

## 3. PRECONDITIONS

| Hành động | Điều kiện |
|---|---|
| Tạo phòng | Đã đăng nhập · **chưa** ở phòng nào · **không** có ván với máy đang chạy |
| Vào ghế chơi | Phòng WAITING · vé PLAY hợp lệ · còn ghế trống · chưa ở phòng khác. FINISHED không nhận PLAYER, kể cả người đã rời quay lại (`DEC-032`) |
| Sẵn sàng | Là PLAYER · phòng WAITING; được bấm cả khi ghế thứ hai trống (BR-ROOM-21) |
| Đổi cài đặt | Là **chủ phòng** |

## 4. TRIGGER

Bấm **Tạo phòng** · chấp nhận lời mời · nhập mã chơi · bấm **Sẵn sàng** · đổi cài đặt · **Rời phòng**.

---

## 5. MAIN FLOWS

### 5.1 Tạo phòng

| Bước | Hành động |
|---|---|
| 1 | Nhập **tên phòng** (1–60 ký tự), chọn **chế độ riêng tư**, chọn **cấu hình thời gian** |
| 2 | Hệ thống tạo phòng, đặt người tạo làm **chủ phòng** và **người chơi cầm quân đỏ** |
| 3 | Phòng vào trạng thái **đang chờ** |
| 4 | Phòng **công khai** ⇒ xuất hiện ở sảnh ngay |

### 5.2 Người thứ hai vào ghế chơi
Vào bằng lời mời/mã chơi → nhận ghế còn lại, cầm **bên còn trống** (mặc định đen khi Host chưa đổi bên) → phòng có đủ 2 người chơi.

### 5.3 Bắt đầu ván

| Bước | Hành động |
|---|---|
| 1 | Mỗi PLAYER bấm **Sẵn sàng** theo cấu hình hiện hành; có thể bấm khi chưa có đối thủ (BR-ROOM-21/22) |
| 2 | Hệ thống kiểm tra đủ 2 người, **cả hai online và đã sẵn sàng**; người từng offline trong WAITING phải xác nhận sẵn sàng lại (`DEC-031`) |
| 3 | **Khoá** cấu hình thời gian |
| 4 | Tạo ván mới, bàn cờ ở thế ban đầu, **ĐỎ đi trước** |
| 5 | Phòng chuyển sang **đang chơi**; cả phòng (kể cả người xem) thấy bàn cờ |

### 5.4 Đổi cài đặt (chỉ chủ phòng)

| Cài đặt | Khi nào đổi được |
|---|---|
| Tên phòng | Mọi lúc |
| **Chế độ riêng tư** | Mọi lúc — **thu hồi toàn bộ người xem** nếu chuyển sang kín hơn |
| **Cấu hình thời gian** | **Chỉ khi đang chờ**; đổi thành công xoá sẵn sàng cả hai, phải xác nhận lại (BR-ROOM-22). Khoá cứng khi ván bắt đầu |

### 5.5 Rời phòng

| Ai rời | Trạng thái phòng | Hệ quả |
|---|---|---|
| **Chủ phòng** | Đang chờ | **Đóng phòng**, thu hồi mọi lời mời, đưa mọi người về sảnh |
| Người chơi thứ hai | Đang chờ | Ghế trống lại, **xoá trạng thái sẵn sàng** của cả hai |
| **Bất kỳ người chơi** | **Đang chơi** | Tính là **ĐẦU HÀNG** |
| Chủ phòng | Đã xong ván | **Đóng phòng** |
| Người chơi thứ hai | Đã xong ván | Rời, **không** ảnh hưởng ván đã ghi |
| Người xem | Bất kỳ | Giải phóng ghế xem |

---

## 6. ALTERNATIVE FLOWS

- **ALT-1** — Một người bỏ sẵn sàng trước khi bên kia bấm ⇒ ván **không** bắt đầu.
- **ALT-2** — Đổi ghế/bên khi đang chờ ⇒ **xoá** trạng thái sẵn sàng, phải bấm lại.
- **ALT-3** — Tái đấu: phòng từ **đã xong** quay lại **đang chơi** với **ván mới, đổi bên**. Xem [REQ-HISTORY-REMATCH](REQ-HISTORY-REMATCH.md).
- **ALT-4** — Ván kết thúc ⇒ phòng giữ **10 phút** cho xem lại/chat/tái đấu, sau đó **tự đóng**.

---

## 7. EXCEPTION FLOWS

| Tình huống | Phản hồi |
|---|---|
| Tạo phòng khi đang ở phòng khác | Từ chối, yêu cầu rời trước |
| Tạo phòng khi đang có ván với máy | Từ chối, yêu cầu kết thúc ván máy trước |
| Có quyền biết phòng, vào ghế chơi khi đã đủ 2 | *"Phòng đã đủ người chơi"* |
| Hai người cùng xin ghế cuối | **Đúng một** người được nhận |
| Bấm sẵn sàng khi chỉ có 1 người | Lưu sẵn sàng, hiện chờ đối thủ và cho bỏ sẵn sàng; chưa tạo ván (BR-ROOM-21) |
| Bấm sẵn sàng khi ván đã bắt đầu | Từ chối — phòng không còn ở trạng thái chờ |
| Đổi thời gian khi đang chơi | **Từ chối** |
| Người không phải chủ phòng đổi cài đặt | **Từ chối** |
| Tên phòng rỗng hoặc quá 60 ký tự | Nêu rõ giới hạn |
| Join mới phòng đã đóng | Lỗi chung FLOW-JOIN-ROOM §8 vì vé đã thu hồi |

---

## 8. POSTCONDITION

| Kết cục | Trạng thái |
|---|---|
| Tạo phòng | Phòng **đang chờ**, người tạo là chủ phòng + người chơi đỏ |
| Đủ 2 người online và sẵn sàng | Phòng **đang chơi**, ván mới tồn tại, thời gian đã khoá |
| Ván kết thúc | Phòng **đã xong**, bắt đầu đếm 10 phút |
| Đóng phòng | Phòng **đã đóng**; mọi lời mời, tư cách thành viên, chat và camera/mic bị thu hồi |

---

## 9. BUSINESS RULES

| ID | Luật |
|---|---|
| **BR-ROOM-01** | Mỗi phòng đúng **2 ghế chơi** + tối đa **5 ghế xem** = **7 thành viên** |
| **BR-ROOM-02** | Người tạo là **chủ phòng**, mặc định cầm **quân đỏ** |
| **BR-ROOM-03** | **Không chuyển quyền chủ phòng** cho ai khác |
| **BR-ROOM-04** | Ván bắt đầu khi **và chỉ khi** đủ 2 người chơi, **cả hai online và đã sẵn sàng** (`DEC-031`) |
| **BR-ROOM-05** | Cấu hình thời gian **khoá cứng** khi ván bắt đầu |
| **BR-ROOM-06** | Đổi ghế/bên làm **mất** trạng thái sẵn sàng |
| **BR-ROOM-07** | Một tài khoản chỉ ở **một** phòng tại một thời điểm |
| **BR-ROOM-08** | Mở nhiều tab **không** tạo thêm ghế. **Mọi tab đều thao tác được** (`DEC-020`) |
| **BR-ROOM-09** | Rời phòng khi **đang chơi** = **đầu hàng**. Giao diện phải nói rõ trước khi xác nhận |
| **BR-ROOM-10** | Chủ phòng rời khi **đang chờ** hoặc **đã xong** ⇒ **đóng phòng** |
| **BR-ROOM-11** | Khi đang chơi, **không ai** được đuổi đối thủ, sửa đồng hồ, hay đóng ván để ép kết quả |
| **BR-ROOM-12** | Phòng **đã xong** sống thêm **10 phút** rồi tự đóng |
| **BR-ROOM-13** | Tái đấu làm phòng quay lại **đang chơi** với **ván mới**; huỷ bộ đếm 10 phút |
| **BR-ROOM-14** | Đóng phòng thu hồi **đồng thời**: lời mời, tư cách thành viên, kênh chat, quyền camera/mic |
| **BR-ROOM-15** | Tên phòng **1–60 ký tự** |
| **BR-ROOM-16** | Đổi chế độ sang kín hơn ⇒ **thu hồi toàn bộ người xem** (`BR-SPEC-05`) |
| **BR-ROOM-17** | Người xem **không** tự chuyển thành người chơi; phải rời và dùng lời mời chơi |
| **BR-ROOM-18** | Đếm sức chứa và nhận người vào phải làm **trong cùng một thao tác** để không vượt trần |
| **BR-ROOM-19** | WAITING: PLAYER offline được giữ ghế 60 giây; người offline mất ready và nối lại phải ready lại. Hết hạn Host ⇒ đóng phòng; PLAYER còn lại ⇒ giải phóng ghế, xoá ready cả hai; không tạo kết quả ván (`DEC-031`) |
| **BR-ROOM-20** | FINISHED chỉ hai PLAYER vẫn ở lại được tái đấu; không nhận PLAYER mới hoặc người đã rời quay lại bằng PLAY. Muốn thay đối thủ phải tạo phòng mới (`DEC-032`) |
| **BR-ROOM-21** | PLAYER được ghi/bỏ sẵn sàng trong WAITING dù chỉ có một người; không vô hiệu nút vì thiếu đối thủ, không tạo Match cho tới khi đủ điều kiện BR-ROOM-04 (`DEC-035`) |
| **BR-ROOM-22** | Host đổi cấu hình thời gian thành công trong WAITING ⇒ xoá sẵn sàng cả hai PLAYER (kể cả Host một mình); phải xác nhận lại theo cấu hình mới. Không dùng xác nhận theo cấu hình cũ để bắt đầu ván mới (`DEC-036`) |

---

### Sẵn sàng và đổi bên (`DEC-042`)

**BR-ROOM-23** — Sẵn sàng xác nhận cấu hình và bên đang hiển thị. Đổi cấu hình/bên, offline hoặc chấm dứt lần nhận ghế làm vô hiệu xác nhận tương ứng. Lệnh cũ đến sau khi vô hiệu không được tính là xác nhận mới; phải tải trạng thái hiện hành và người dùng bấm lại. Đổi tên/privacy không huỷ ready; gửi lại cùng cấu hình thời gian là không thay đổi.

**BR-ROOM-24** — Chỉ hai PLAYER online trong WAITING được đổi bên bằng sự đồng ý của cả hai. Một người bấm Đề nghị đổi bên, đối thủ có 30 giây Đồng ý/Từ chối, người gửi được Huỷ; không tự chấp nhận. Lúc tạo đề nghị xoá ready cả hai, tạm chặn Sẵn sàng; cả hai có thể xem trạng thái pending từ mọi tab. Chấp nhận trước hạn đổi hai bên đồng thời và yêu cầu ready lại. Từ chối/huỷ/hết hạn/offline/rời/đổi thời gian huỷ đề nghị, không đổi bên, không tự khôi phục ready. Người xem chỉ thấy kết quả đổi bên, không có nút trả lời. Chỉ Host một mình thì nút Đổi bên vô hiệu “Cần hai người chơi online”.

| ID | Tiêu chí bổ sung |
|---|---|
| **AC-ROOM-24** | Ready đã gửi trước offline nhưng tới sau reconnect không xác nhận thay người dùng; người dùng phải bấm lại theo snapshot mới |
| **AC-ROOM-25** | Hai PLAYER đồng ý đổi bên trước 30 giây: đổi nguyên tử, reset ready; self-accept/SPECTATOR/PLAYING bị từ chối |
| **AC-ROOM-26** | Từ chối, huỷ, đúng hạn 30 giây, offline, leave hoặc config đổi trong lúc chờ: không đổi bên; đề nghị mất hiệu lực; không phục hồi ready |
| **AC-ROOM-27** | Đổi tên/privacy hoặc lưu lại cùng thời gian không vô hiệu ready; đổi thời gian thực sự vô hiệu cả hai |

## 10. PERMISSIONS

| Hành động | Người ngoài | Người xem | Người chơi | Chủ phòng |
|---|:---:|:---:|:---:|:---:|
| Vào phòng (đủ điều kiện) | ✅ | — | — | — |
| Xem bàn cờ / trạng thái phòng | ❌ | ✅ | ✅ | ✅ |
| Sẵn sàng | ❌ | ❌ | ✅ | ✅ |
| Đi cờ | ❌ | ❌ | ✅ | ✅ |
| Mời người khác | ❌ | ❌ | ✅ | ✅ |
| **Đuổi người xem** | ❌ | ❌ | ✅ | ✅ |
| Đổi tên phòng | ❌ | ❌ | ❌ | ✅ |
| Đổi chế độ riêng tư | ❌ | ❌ | ❌ | ✅ |
| Đổi cấu hình thời gian (khi chờ) | ❌ | ❌ | ❌ | ✅ |
| Tạo / đổi mã xem | ❌ | ❌ | ❌ | ✅ |
| Đuổi đối thủ | ❌ | ❌ | ❌ | ❌ |
| Chuyển quyền chủ phòng | ❌ | ❌ | ❌ | ❌ |
| Rời phòng | ❌ | ✅ | ✅ | ✅ |

---

## 11. UI LIÊN QUAN

`SCR-CREATE-ROOM` · `SCR-WAITING-ROOM` · `SCR-GAME-ROOM` · `SCR-ROOM-SETTINGS` · `SCR-CONFIRM-LEAVE` · `SCR-SIDE-SWAP-PROMPT`

### Phòng chờ hiện

```
┌────────────────────────────────────────┐
│ Cờ chiều thứ 7          [Cài đặt ⚙]    │
│ Không giới hạn thời gian · Công khai   │
├────────────────────────────────────────┤
│ 🔴 Minh Nguyễn (chủ phòng)  ✅ Sẵn sàng│
│ ⚫ Lan Trần                  ⏳ Chưa    │
├────────────────────────────────────────┤
│ Người xem: 2/5                         │
│ [Mời bạn] [Sao chép link] [Mã: K7M2XQP4]│
│                    [ Sẵn sàng ]        │
└────────────────────────────────────────┘
```

**Xác nhận rời khi đang chơi** phải ghi rõ: *"Rời phòng lúc này được tính là **đầu hàng**. Bạn sẽ thua ván này."*

**WAITING offline:** hiển thị người đang mất kết nối và số giây giữ ghế còn lại; chưa đủ điều kiện online/ready thì không bắt đầu ván. FINISHED thiếu đối thủ: giải thích cần tạo phòng mới để thay người.

**Trạng thái bắt buộc:** đang tải · chờ người thứ hai (**trống**) · lỗi + thử lại · nút Sẵn sàng **dùng được** khi chỉ có một PLAYER; sau khi bấm hiện “Đã sẵn sàng — đang chờ đối thủ” và nút Bỏ sẵn sàng (BR-ROOM-21). Đổi thời gian thành công: hiện cấu hình mới và “Thời gian ván đã thay đổi. Vui lòng sẵn sàng lại.” (BR-ROOM-22).

---

## 12. STATES

```
                  ┌─────────────┐
   (tạo phòng)──► │  ĐANG CHỜ   │
                  └──────┬──────┘
                         │ cả hai ONLINE và sẵn sàng
                         ▼
                  ┌─────────────┐
                  │  ĐANG CHƠI  │
                  └──────┬──────┘
                         │ ván kết thúc / gián đoạn
                         ▼
                  ┌─────────────┐
       tái đấu ◄──┤   ĐÃ XONG   │ (sống 10 phút)
       (ván mới)  └──────┬──────┘
                         │ hết 10 phút · chủ phòng rời
                         ▼
                  ┌─────────────┐
                  │   ĐÃ ĐÓNG   │ (không quay lại)
                  └─────────────┘
```

**Chuyển trạng thái KHÔNG hợp lệ (phải bị từ chối):**

| Chuyển | Vì sao cấm |
|---|---|
| Đang chơi → Đang chờ | Ván đã bắt đầu, không quay lại |
| Đã đóng → bất kỳ | Đóng là vĩnh viễn |
| Đang chờ → Đã xong | Phải qua đang chơi |
| Đã xong → Đang chơi **không qua tái đấu** | Chỉ tái đấu mới mở lại được |
| Vào ghế chơi khi **đang chơi hoặc đã xong** | PLAYING khoá ghế; FINISHED chỉ giữ hai thành viên cũ để tái đấu (BR-ROOM-20) |

---

## 13. REALTIME BEHAVIOR

| Sự kiện | Ai tạo | Máy chủ kiểm gì | Ai nhận | UI đổi gì |
|---|---|---|---|---|
| Tạo phòng | Người dùng | Chưa ở phòng khác · không có ván máy | Người tạo + sảnh (nếu công khai) | Vào phòng chờ; sảnh thêm phòng |
| Người chơi vào | Người dùng | Quyền vào · còn ghế (**kiểm trong cùng thao tác**) | Cả phòng | Hiện người chơi thứ hai |
| Bấm sẵn sàng | Người chơi | Là PLAYER · WAITING · xác nhận theo cấu hình hiện hành | Cả phòng | Đổi dấu sẵn sàng; thiếu đối thủ thì vẫn chờ |
| Đổi thời gian | Chủ phòng | Host · WAITING; xử lý nhất quán với start | Cả phòng | Cấu hình mới + cả hai chưa sẵn sàng + lý do cần bấm lại |
| **Cả hai sẵn sàng** | Hệ thống | Đủ 2 người · cả hai online và sẵn sàng | Cả phòng | Bàn cờ xuất hiện; khoá cấu hình |
| Đổi chế độ riêng tư | Chủ phòng | Là chủ phòng | Cả phòng + sảnh | Người xem **bị đưa ra** nếu kín hơn; sảnh cập nhật |
| Người chơi rời khi đang chơi | Người chơi | Là người chơi | Cả phòng | Ván kết thúc — **đầu hàng** |
| Đóng phòng | Chủ phòng / hệ thống | — | Cả phòng | Mọi người về sảnh |

---

## 14. EDGE CASES

| # | Tình huống | Xử lý |
|---|---|---|
| 1 | Hai người cùng xin ghế chơi cuối | Đúng một người được nhận (`BR-ROOM-18`) |
| 2 | Cả hai bấm sẵn sàng **cùng lúc** | Tạo **đúng một** ván, không tạo hai |
| 3 | Bấm sẵn sàng rồi bỏ ngay lập tức | Ván không bắt đầu; nếu ván đã tạo thì lệnh bỏ bị từ chối |
| 4 | Chủ phòng rời đúng lúc người thứ hai đang vào | Phòng đóng; người kia bị từ chối |
| 5 | Mở 2 tab, cả hai bấm sẵn sàng | Cùng kết quả, **không** tạo hai ván (`BR-ROOM-08`) |
| 6 | Đổi sang phòng khoá khi đang có 5 người xem | **Cả 5** bị đưa ra ngay |
| 7 | Đổi lại thành công khai | Người cũ **không** tự quay lại (`BR-SPEC-07`) |
| 8 | Đổi cấu hình thời gian đúng lúc ván đang bắt đầu | Nếu start được chấp nhận trước: từ chối đổi. Nếu đổi được chấp nhận trước: xoá ready, phải xác nhận theo cấu hình mới; không dùng ready/lệnh cũ (DEC-036) |
| 9 | Người chơi mất mạng khi đang chờ | Giữ ghế 60 giây, mất ready; hết hạn xử theo BR-ROOM-19. Trong lúc offline không bắt đầu ván |
| 10 | Phòng hết 10 phút đúng lúc có người bấm tái đấu | Tái đấu được kiểm dưới khoá trước hạn mới hợp lệ; đúng hạn hoặc sau hạn thì đóng phòng (BR-HIS-05) |
| 11 | Chủ phòng rời sau khi ván xong nhưng người kia đang xem lại | Phòng đóng, người kia về sảnh |
| 12 | Tên phòng có ký tự đặc biệt / HTML | Hiển thị đúng dạng chữ, **không** thực thi |

---

## 15. ACCEPTANCE CRITERIA

| ID | Tiêu chí |
|---|---|
| **AC-ROOM-01** | Tạo phòng ⇒ người tạo là chủ phòng và cầm **quân đỏ** |
| **AC-ROOM-02** | Ván bắt đầu **chỉ khi** đủ 2 người, **cả hai online và sẵn sàng**; offline trước start thì không tạo Match |
| **AC-ROOM-03** | Cả hai bấm sẵn sàng cùng lúc ⇒ tạo **đúng một** ván |
| **AC-ROOM-04** | Hai người tranh ghế chơi cuối ⇒ đúng một người được nhận |
| **AC-ROOM-05** | Cấu hình thời gian **không đổi được** sau khi ván bắt đầu |
| **AC-ROOM-06** | Đổi ghế/bên ⇒ **mất** trạng thái sẵn sàng |
| **AC-ROOM-07** | Rời khi đang chơi ⇒ ghi nhận **đầu hàng**, đối thủ thắng |
| **AC-ROOM-08** | Chủ phòng rời khi đang chờ ⇒ **đóng phòng**, mọi người về sảnh |
| **AC-ROOM-09** | Đổi sang khoá ⇒ **toàn bộ** người xem bị thu hồi |
| **AC-ROOM-10** | Người **không phải chủ phòng** đổi cài đặt ⇒ **từ chối**, kể cả khi giả mạo dữ liệu gửi lên |
| **AC-ROOM-11** | Không ai chuyển được quyền chủ phòng |
| **AC-ROOM-12** | Đang ở phòng ⇒ **không** tạo/vào phòng khác được |
| **AC-ROOM-13** | Phòng **đã xong** tự đóng sau đúng **10 phút** |
| **AC-ROOM-14** | Tái đấu **huỷ** bộ đếm đóng phòng |
| **AC-ROOM-15** | Đóng phòng thu hồi **đồng thời** lời mời, thành viên, chat, camera/mic |
| **AC-ROOM-16** | Hai tab bấm sẵn sàng cùng lúc ⇒ tạo **đúng một** ván |
| **AC-ROOM-17** | Không nhận PLAYER khi phòng PLAYING hoặc FINISHED, kể cả vé PLAY hợp lệ; kiểm trực tiếp mọi đường join (`DEC-032`) |
| **AC-ROOM-18** | WAITING: Host offline tới hạn 60 giây ⇒ phòng đóng và thu hồi quyền theo BR-ROOM-14; không ghi thua/Match giả |
| **AC-ROOM-19** | WAITING: PLAYER còn lại offline tới hạn ⇒ mất ghế, ready cả hai bị xoá; phòng còn WAITING, người khác có vé hợp lệ có thể nhận ghế |
| **AC-ROOM-20** | PLAYER đã ready rồi offline: ván không tự bắt đầu; quay lại trước hạn giữ ghế nhưng phải ready lại. Đóng một tab trong nhiều tab online không kích hoạt việc này |
| **AC-ROOM-21** | Chỉ một PLAYER: bấm Sẵn sàng thành công, có thể bỏ, chưa tạo Match. Người thứ hai vào và đủ hai online/ready theo cấu hình hiện hành ⇒ tạo đúng một ván |
| **AC-ROOM-22** | B ready ở 15 phút, Host đổi 5 phút ⇒ cả hai chưa sẵn sàng; Host ready một mình chưa tạo ván, B phải xác nhận lại. Cả phòng thấy cấu hình mới và lý do reset; Host một mình cũng bị reset |
| **AC-ROOM-23** | Ready/start tranh chấp đổi thời gian: start trước ⇒ đổi bị từ chối; đổi trước ⇒ không tạo ván bằng ready cũ hoặc lệnh xác nhận cấu hình cũ đến muộn. Kiểm phía máy chủ |

---

## 16. DEPENDENCY

[REQ-AUTH](REQ-AUTH.md) · [REQ-LOBBY](REQ-LOBBY.md) · [REQ-INVITE](REQ-INVITE.md) · [REQ-SPECTATOR](REQ-SPECTATOR.md) · [REQ-MATCH](REQ-MATCH.md) · [REQ-CLOCK](REQ-CLOCK.md) · [REQ-HISTORY-REMATCH](REQ-HISTORY-REMATCH.md)

## 17. OPEN QUESTIONS

**Đã chốt** theo DEC-031/032/035/036/042. Contract triển khai tại [room-chat-contract](../09-technical/room-chat-contract.md) §1–3.
