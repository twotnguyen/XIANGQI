# REQ-INVITE — MỜI NGƯỜI KHÁC VÀO PHÒNG

**ID yêu cầu:** `R03`, `R19` · **Trạng thái:** Ready · **Cập nhật:** 2026-09-21
**Căn cứ:** Đề gốc · `DEC-008` (hộp thư lời mời)
**Phụ thuộc:** [REQ-ROOM](REQ-ROOM.md) · [REQ-PROFILE-FRIENDS](REQ-PROFILE-FRIENDS.md) · [REQ-SPECTATOR](REQ-SPECTATOR.md)

---

> **DEC-032:** vé PLAY chỉ nhận ghế mới trong WAITING. FINISHED không nhận người mới hoặc người đã rời quay lại bằng PLAY, dù vé còn hạn; WATCH vẫn theo quyền xem hiện có. Xem REQ-ROOM BR-ROOM-20.

## 1. FEATURE NÀY ĐỂ LÀM GÌ

Ba cách đưa người khác vào phòng:

| Cách | Dùng khi | Ai dùng được |
|---|---|---|
| **Mời trực tiếp** | Muốn rủ một người bạn cụ thể | Chỉ **bạn bè** |
| **Link mời** | Gửi qua Zalo/Messenger/bất kỳ đâu | Bất kỳ ai có link |
| **Mã phòng** | Đọc miệng cho người ngồi cạnh | Bất kỳ ai có mã |

Mỗi cách đều có **hai loại quyền**: vào **chơi** (`PLAY`) hoặc vào **xem** (`WATCH`).

**Kèm theo `R19`:** **hộp thư lời mời** để người được mời không bỏ lỡ lời mời khi đang offline.

---

## 2. ACTOR

| Actor | Vai trò |
|---|---|
| **Người mời** | Người chơi hoặc chủ phòng của phòng |
| **Người được mời** | Nhận lời mời trực tiếp (phải là bạn bè) |
| **Người có link/mã** | Bất kỳ ai cầm được link hoặc mã |
| **Hệ thống** | Sinh mã/link, kiểm hạn, tiêu thụ lời mời |

---

## 3. PRECONDITIONS

| Hành động | Điều kiện |
|---|---|
| Mời trực tiếp | Người mời là **người chơi** của phòng · người nhận là **bạn bè** · phòng chưa đóng |
| Tạo/xem link, mã chơi | Là **người chơi** của phòng |
| Tạo/đổi **mã xem** | Là **chủ phòng** |
| Dùng lời mời/link/mã | Đã đăng nhập · chưa ở phòng khác · **không bị chặn** khỏi phòng đó |

## 4. TRIGGER

Bấm **Mời bạn** · **Sao chép link** · **Lấy mã** · **Đổi mã xem** · mở link mời · nhập mã · mở **hộp thư lời mời**.

---

## 5. MAIN FLOWS

### 5.1 Mời trực tiếp một người bạn

| Bước | Hành động |
|---|---|
| 1 | Người chơi mở danh sách bạn bè, chọn một người, bấm **Mời** |
| 2 | Hệ thống kiểm tra: là bạn bè · phòng còn ghế · chưa có lời mời đang chờ cho cặp này |
| 3 | Tạo lời mời, hạn **10 phút** |
| 4 | Người nhận **đang online** ⇒ thấy ngay. **Đang offline** ⇒ thấy trong **hộp thư lời mời** khi đăng nhập lại (nếu còn hạn) |
| 5 | Người nhận **chấp nhận** ⇒ vào phòng, lời mời bị **tiêu thụ**. **Từ chối** ⇒ lời mời huỷ |

### 5.2 Gửi link mời

| Bước | Hành động |
|---|---|
| 1 | Người chơi bấm **Sao chép link**, chọn loại: **link chơi** hay **link xem** |
| 2 | Hệ thống tạo link chứa mã bí mật, hạn **24 giờ** |
| 3 | Người mời gửi link qua kênh bất kỳ |
| 4 | Người nhận mở link — **chưa đăng nhập** ⇒ đăng nhập xong **tự vào phòng**; **đã đăng nhập** ⇒ vào thẳng |

### 5.3 Dùng mã phòng

| Bước | Hành động |
|---|---|
| 1 | Người chơi đọc mã **8 ký tự** |
| 2 | Người kia vào sảnh, bấm **Nhập mã**, gõ mã |
| 3 | Hệ thống xác định mã cho **chơi** hay **xem**, đưa vào đúng vai trò |

### 5.4 Hộp thư lời mời (`R19`)

| Bước | Hành động |
|---|---|
| 1 | Sau khi đăng nhập, thanh điều hướng hiện **chỉ báo số lời mời đang chờ** |
| 2 | Bấm vào ⇒ danh sách lời mời **còn hiệu lực**: ai mời, phòng nào, còn bao lâu |
| 3 | Mỗi lời mời có nút **Chấp nhận** / **Từ chối** |
| 4 | Lời mời hết hạn **tự biến mất** khỏi danh sách |

---

## 6. ALTERNATIVE FLOWS

- **ALT-1** — Mời khi ghế chơi đã đủ: vẫn gửi được **lời mời xem**, nhưng lời mời **chơi** bị từ chối ngay với lý do rõ ràng.
- **ALT-2** — Phòng **khoá**: **mời chơi vẫn dùng được** khi còn ghế trống; mời/link/mã **xem** không dùng được (`BR-SPEC-01`).
- **ALT-3** — Đổi mã xem: mã cũ **mất hiệu lực ngay** và **toàn bộ người xem hiện tại bị thu hồi**.
- **ALT-4** — Mời người đang ở phòng khác: lời mời **vẫn gửi được**; người nhận chấp nhận thì được nhắc phải rời phòng hiện tại trước.

---

## 7. EXCEPTION FLOWS

| Tình huống | Phản hồi |
|---|---|
| Mã sai / không tồn tại | Lỗi chung theo FLOW-JOIN-ROOM §8 |
| Mã/link **hết hạn** | Cùng một thông báo như trên |
| Mã/link đã **bị thu hồi** | Cùng một thông báo như trên |
| Mã chơi **đã dùng rồi** | Cùng lỗi chung, không tiết lộ đã từng hợp lệ |
| Có bằng chứng quyền biết phòng, đã đủ người chơi | *"Phòng đã đủ người chơi"* |
| Có bằng chứng quyền biết phòng, đã đủ người xem | *"Phòng đã đủ người xem"* |
| Join mới sau khi phòng đã đóng | Lỗi chung vì vé đã thu hồi; sự kiện đóng cho thành viên trước thu hồi theo FLOW-JOIN-ROOM §8 |
| Dùng mã **xem** để xin ghế **chơi** | Từ chối — vai trò không khớp |
| Người nhận **không phải bạn bè** | Từ chối mời trực tiếp; gợi ý gửi link |
| Có bằng chứng quyền biết phòng, **bị chặn** khỏi phòng | *"Bạn không thể vào phòng này"* |
| Đang ở phòng khác | Yêu cầu rời phòng hiện tại trước |

**`BR-INV-13`** — Lỗi trước bằng chứng quyền biết phòng dùng một thông báo chung; lỗi đầy/chặn/trạng thái chỉ sau bằng chứng hợp lệ hiện hành. Xem thứ tự và bảng lỗi chuẩn ở [FLOW-JOIN-ROOM](../02-flows/FLOW-JOIN-ROOM.md) §1/8.

---

## 8. POSTCONDITION

| Kết cục | Trạng thái |
|---|---|
| Chấp nhận lời mời chơi | Là người chơi; lời mời **đã tiêu thụ**, không dùng lại |
| Dùng mã/link xem | Là người xem; mã/link **vẫn dùng được** cho người khác tới khi đủ 5 |
| Từ chối / hết hạn | Lời mời biến mất, không có thành viên mới |
| Đổi mã xem | Mã cũ vô hiệu; người xem cũ **bị thu hồi** |
| Phòng đóng | **Mọi** lời mời, mã, link của phòng bị thu hồi |

---

## 9. BUSINESS RULES

| ID | Luật |
|---|---|
| **BR-INV-01** | Ba cách mời: **trực tiếp** · **link** · **mã**. Mỗi cách có loại **chơi** hoặc **xem** |
| **BR-INV-02** | Mời **trực tiếp** chỉ dành cho **bạn bè** (`BR-FRD-06`) |
| **BR-INV-03** | Lời mời trực tiếp hạn **10 phút**, **chỉ người nhận** dùng được |
| **BR-INV-04** | Mã và link hạn **24 giờ** |
| **BR-INV-05** | Mã phòng **8 ký tự**, bảng chữ **bỏ ký tự dễ nhầm** (không có `I`, `O`, `0`, `1`) |
| **BR-INV-06** | Mã/lời mời **chơi** dùng được **một lần**; nhận ghế cuối phải kiểm **trong cùng thao tác** |
| **BR-INV-07** | Mã/link **xem** dùng được **nhiều lần** tới khi đủ **5** người xem |
| **BR-INV-08** | Chỉ **chủ phòng** tạo/đổi được **mã xem** |
| **BR-INV-09** | Đổi mã xem ⇒ mã cũ vô hiệu **ngay** và **thu hồi toàn bộ người xem** |
| **BR-INV-10** | Đóng phòng ⇒ thu hồi **mọi** lời mời, mã, link |
| **BR-INV-11** | Người dùng chọn mục đích PLAY/WATCH; máy chủ suy ra vai trò từ vé đã xác minh và kiểm khớp mục đích. Mã WATCH không nhận ghế PLAYER; không tin role do client khai |
| **BR-INV-12** | Mã bí mật **không** được lưu lẫn vào dữ liệu công khai của phòng, **không** ghi log, **không** gửi cho thành viên khác |
| **BR-INV-13** | Thông báo lỗi theo cổng quyền biết phòng ở FLOW-JOIN-ROOM §1/8; không tiết lộ cho người chưa có bằng chứng |
| **BR-INV-14** | Người **bị chặn** khỏi phòng **không** dùng được bất kỳ lời mời/mã/link nào của phòng đó (`BR-SPEC-11`) |
| **BR-INV-15** | Lời mời trực tiếp đã **tiêu thụ** thì **không sống lại** kể cả khi người đó rời phòng |
| **BR-INV-16** | **Hộp thư lời mời** hiện mọi lời mời **còn hạn** khi người dùng đăng nhập, không phụ thuộc lúc được mời họ có online hay không |
| **BR-INV-17** | Mỗi cặp (người mời, người nhận, phòng) chỉ có **một** lời mời đang chờ |

---

**BR-INV-19** — Quyền WATCH trực tiếp và thu hồi mọi vé WATCH khi đổi privacy/rotate theo [REQ-SPECTATOR BR-SPEC-19/20](REQ-SPECTATOR.md). Lời mời WATCH trực tiếp dùng một lần, đúng người nhận, kể cả CODE_ONLY/FINISHED; không vượt LOCKED. Chỉ tiêu thụ vé khi nhận ghế thành công; bị đầy/từ chối không làm mất vé còn hạn.

| ID | Tiêu chí bổ sung |
|---|---|
| **AC-INV-20** | WATCH trực tiếp hợp lệ vào CODE_ONLY; khi phòng kín hơn hoặc rotate, lời mời bị thu hồi khỏi hộp thư và không dùng lại khi mở phòng |
| **AC-INV-21** | Join sai role/side/userId bị từ chối schema; PLAY intent với WATCH grant không nâng quyền; join thất bại vì đầy không tiêu thụ vé |

## 10. PERMISSIONS

| Hành động | Người ngoài | Người xem | Người chơi | Chủ phòng |
|---|:---:|:---:|:---:|:---:|
| Mời trực tiếp bạn bè | ❌ | ❌ | ✅ | ✅ |
| Lấy link/mã **chơi** | ❌ | ❌ | ✅ | ✅ |
| Lấy link/mã **xem** | ❌ | ❌ | ✅ | ✅ |
| **Tạo/đổi** mã xem | ❌ | ❌ | ❌ | ✅ |
| Dùng lời mời/mã/link | ✅ | ❌ | ❌ | ❌ |
| Xem hộp thư lời mời của mình | ✅ | ✅ | ✅ | ✅ |
| Xem lời mời của **người khác** | ❌ | ❌ | ❌ | ❌ |

---

## 11. UI LIÊN QUAN

`SCR-INVITE-MODAL` · `SCR-JOIN-BY-CODE` · `SCR-INVITATION-INBOX` ⭐ **mới** · `SCR-ACCESS-DENIED` · thanh điều hướng (chỉ báo số lời mời)

### Hộp thư lời mời

```
┌──────────────────────────────────────────┐
│ Lời mời chơi (2)                         │
├──────────────────────────────────────────┤
│ Minh Nguyễn mời bạn vào "Cờ chiều thứ 7" │
│ Còn 6 phút        [Từ chối] [Chấp nhận]  │
├──────────────────────────────────────────┤
│ Lan Trần mời bạn vào "Ván nhanh"          │
│ Còn 2 phút        [Từ chối] [Chấp nhận]  │
└──────────────────────────────────────────┘
```

### Cửa sổ mời

Ba tab: **Mời bạn** (danh sách bạn bè + nút Mời) · **Link** (chọn chơi/xem + nút sao chép) · **Mã** (hiện mã, nút sao chép; chủ phòng có thêm nút **Đổi mã xem**).

**Đổi mã xem phải có xác nhận** nêu rõ: *"Toàn bộ người xem hiện tại sẽ bị đưa ra khỏi phòng."*

**Trạng thái bắt buộc:** đang tải · **trống** (*"Chưa có lời mời nào"* · *"Chưa có bạn bè nào để mời"*) · lỗi + thử lại · nút Mời **vô hiệu** với người đã ở trong phòng.

---

## 12. STATES

```
Lời mời trực tiếp:
  ĐANG CHỜ ──(chấp nhận)──► ĐÃ TIÊU THỤ  (không dùng lại)
      ├──(từ chối)────────► ĐÃ HUỶ
      ├──(10 phút)────────► HẾT HẠN
      └──(phòng đóng)─────► ĐÃ THU HỒI

Mã / link:
  CÒN HIỆU LỰC ──(24 giờ)──────────► HẾT HẠN
       ├──(đổi mã xem)─────────────► ĐÃ THU HỒI
       ├──(phòng đóng)─────────────► ĐÃ THU HỒI
       └──(mã chơi được dùng)──────► ĐÃ TIÊU THỤ
```

---

## 13. REALTIME BEHAVIOR

| Sự kiện | Ai tạo | Máy chủ kiểm gì | Ai nhận | UI đổi gì |
|---|---|---|---|---|
| Gửi lời mời trực tiếp | Người chơi | Là bạn bè · là người chơi phòng · chưa có lời mời chờ | **Chỉ người nhận** | Chỉ báo +1, hiện trong hộp thư |
| Chấp nhận lời mời | Người nhận | Lời mời của chính họ · còn hạn · còn ghế · không bị chặn | Người nhận + cả phòng | Người nhận vào phòng; phòng hiện thành viên mới |
| Từ chối | Người nhận | Lời mời của chính họ | Người nhận | Biến khỏi hộp thư |
| Lời mời hết hạn | Hệ thống | Đến hạn 10 phút | Người nhận | Tự biến mất, chỉ báo −1 |
| **Đổi mã xem** | Chủ phòng | Là chủ phòng | Cả phòng | **Toàn bộ** người xem bị đưa ra |
| Đóng phòng | Hệ thống | — | Người có lời mời chờ | Lời mời biến mất |

**`BR-INV-18`** — Sự kiện lời mời **chỉ** gửi cho **đúng người nhận**, **không bao giờ** gửi kèm mã bí mật cho tài khoản khác.

---

## 14. EDGE CASES

| # | Tình huống | Xử lý |
|---|---|---|
| 1 | Hai người cùng dùng mã chơi cho ghế cuối | **Đúng một** người vào được (`BR-INV-06`) |
| 2 | Mời 2 người vào cùng 1 ghế trống | Cả hai nhận được lời mời; **ai chấp nhận trước** thì được, người sau bị báo phòng đã đủ |
| 3 | Chấp nhận lời mời khi phòng vừa đóng | Từ chối, lời mời bị thu hồi |
| 4 | Mở link mời khi **chưa đăng nhập** | Đăng nhập xong **tự vào đúng phòng**; mã bị xoá sau khi dùng |
| 5 | Mở link mời hai lần (link **xem**) | Lần hai vẫn vào được nếu còn chỗ |
| 6 | Mở link mời hai lần (link **chơi**) | Lần hai báo đã dùng rồi |
| 7 | Đổi mã xem khi đang có 5 người xem | **Cả 5** bị đưa ra, mã cũ vô hiệu |
| 8 | Lời mời hết hạn đúng lúc đang bấm chấp nhận | Từ chối — đã hết hạn |
| 9 | Gửi lời mời trùng cho cùng một người | **Không** tạo bản thứ hai (`BR-INV-17`) |
| 10 | Người bị chặn dùng link cũ | Bị từ chối (`BR-INV-14`) |
| 11 | Mời người đang ở phòng khác | Gửi được; lúc chấp nhận mới nhắc phải rời phòng cũ |
| 12 | Người dùng offline suốt 10 phút | Lời mời hết hạn; hộp thư **không** hiện lời mời quá hạn |
| 13 | Rời phòng rồi muốn vào lại bằng lời mời cũ | **Không được** — lời mời đã tiêu thụ (`BR-INV-15`) |
| 14 | Mã phòng bị đoán mò | Bảng chữ 32 ký tự × 8 vị trí; sai mã trả **cùng một** thông báo, có giới hạn tần suất thử |

---

## 15. ACCEPTANCE CRITERIA

| ID | Tiêu chí |
|---|---|
| **AC-INV-01** | Mời trực tiếp → chấp nhận → vào phòng đúng vai trò |
| **AC-INV-02** | Mời trực tiếp **chỉ** gửi được cho **bạn bè** |
| **AC-INV-03** | Lời mời trực tiếp **chỉ người nhận** dùng được; người khác dùng bị từ chối |
| **AC-INV-04** | Lời mời hết hạn sau đúng **10 phút** |
| **AC-INV-05** | Mã/link hết hạn sau đúng **24 giờ** |
| **AC-INV-06** | Mã **chơi** dùng **một lần**; lần hai bị từ chối |
| **AC-INV-07** | Mã **xem** dùng **nhiều lần** tới khi đủ 5 |
| **AC-INV-08** | Hai người cùng dùng mã chơi cho ghế cuối ⇒ **đúng một** thành công |
| **AC-INV-09** | Mã **xem** **không** vào được ghế chơi |
| **AC-INV-10** | Đổi mã xem ⇒ mã cũ vô hiệu **và** toàn bộ người xem bị thu hồi |
| **AC-INV-11** | Chỉ **chủ phòng** đổi được mã xem |
| **AC-INV-12** | Đóng phòng ⇒ mọi lời mời/mã/link bị thu hồi |
| **AC-INV-13** | Mở link khi chưa đăng nhập ⇒ đăng nhập xong **tự vào đúng phòng** |
| **AC-INV-14** | Mã bí mật **không** xuất hiện trong dữ liệu phòng gửi cho thành viên khác, **không** trong log |
| **AC-INV-15** | Mọi thông báo lỗi **không tiết lộ** phòng có tồn tại hay không |
| **AC-INV-16** | **Hộp thư**: được mời lúc offline, đăng nhập lại **vẫn thấy** lời mời nếu còn hạn |
| **AC-INV-17** | **Hộp thư**: chỉ báo số lượng đúng, hết hạn thì tự giảm |
| **AC-INV-18** | Người **bị chặn** không dùng được bất kỳ lời mời/mã/link nào của phòng đó |
| **AC-INV-19** | Phòng **khoá**: mời **chơi** vẫn dùng được, mời **xem** bị từ chối |

---

## 16. DEPENDENCY

[REQ-AUTH](REQ-AUTH.md) · [REQ-PROFILE-FRIENDS](REQ-PROFILE-FRIENDS.md) · [REQ-ROOM](REQ-ROOM.md) · [REQ-SPECTATOR](REQ-SPECTATOR.md) · [REQ-LOBBY](REQ-LOBBY.md)

## 17. OPEN QUESTIONS

**Không còn.**

Tình huống *hai lời mời từ hai phòng khác nhau tới cùng một người* đã được chốt: **cả hai lời mời vẫn tồn tại**; ai được chấp nhận trước thì người đó vào phòng, lời mời còn lại **không tự huỷ** nhưng khi bấm chấp nhận sẽ bị chặn vì người đó **đã ở phòng khác** (`BR-INV-17`, `SS-20`). Giao diện nhắc rõ phải rời phòng hiện tại trước.
