# ACTORS — CÁC VAI TRÒ TRONG HỆ THỐNG

**ID:** `ACT` · **Trạng thái:** v1 · **Cập nhật:** 2026-09-21
**Liên quan:** [glossary.md](glossary.md) · [../04-business-rules/permissions.md](../04-business-rules/permissions.md)

---

## 1. SƠ ĐỒ VAI TRÒ

```
                        ┌─────────────────┐
                        │  Khách (Guest)  │   ❌ KHÔNG ĐƯỢC HỖ TRỢ (DEC-006)
                        │  chưa đăng nhập │   Chỉ vào được: Đăng nhập / Đăng ký
                        └────────┬────────┘
                                 │ đăng ký + xác minh email
                                 ▼
                        ┌─────────────────┐
                        │  Người dùng     │   Đã đăng nhập, đã có username
                        │  (User)         │   Vào sảnh, kết bạn, tạo phòng, chơi máy
                        └────────┬────────┘
                                 │ vào một phòng
                 ┌───────────────┼───────────────┐
                 ▼               ▼               ▼
        ┌────────────────┐ ┌───────────┐ ┌──────────────┐
        │  Chủ phòng     │ │ Người chơi│ │  Người xem   │
        │  (Host)        │ │ (PLAYER)  │ │ (SPECTATOR)  │
        │  = Người chơi  │ │  tối đa 2 │ │   tối đa 5   │
        │    + tạo phòng │ │           │ │              │
        └────────────────┘ └───────────┘ └──────────────┘

        ┌──────────────┐          ┌──────────────┐
        │  Máy (AI)    │          │ Hệ thống     │
        │  không phải  │          │ (System)     │
        │  tài khoản   │          │ tự động      │
        └──────────────┘          └──────────────┘
```

---

## 2. BẢNG VAI TRÒ

### ACT-01 — Khách (Guest) · ❌ không được hỗ trợ

| Mục | Nội dung |
|---|---|
| **Là ai** | Người truy cập website nhưng **chưa đăng nhập** |
| **Làm được gì** | **Chỉ** xem được màn hình Đăng nhập, Đăng ký, Quên mật khẩu |
| **KHÔNG làm được** | Xem sảnh · xem phòng `PUBLIC` · xem ván đang diễn ra · chat · chơi với máy |
| **Căn cứ** | `DEC-006` |

> **Vì sao không hỗ trợ:** guest kéo theo loạt vấn đề chưa được quyết (tên hiển thị trong chat người xem, chặn spam khi không có tài khoản, guest có chiếm ghế trong trần 5 người xem không). Không nằm trong yêu cầu R01–R16 nào.

**Hành vi bắt buộc:** guest mở link mời hoặc link phòng ⇒ chuyển tới màn Đăng nhập, **ghi nhớ đích đến**, đăng nhập xong **tự động tiếp tục** vào phòng đó.

---

### ACT-02 — Người dùng (User)

| Mục | Nội dung |
|---|---|
| **Là ai** | Tài khoản đã đăng nhập **và** đã hoàn tất onboarding (có username) |
| **Điều kiện** | Email đã xác minh (với tài khoản thường) · đã chọn username |
| **Làm được** | Xem sảnh · tìm/kết bạn · tạo phòng · vào phòng · chơi với máy · xem lịch sử ván của mình · sửa tên hiển thị |
| **Ràng buộc quan trọng** | **Chỉ thuộc một phòng tại một thời điểm.** Muốn sang phòng khác phải rời phòng hiện tại. Tạo ván với máy yêu cầu đã rời phòng online |

**Hai trạng thái trung gian — không phải User đầy đủ:**

| Trạng thái | Làm được gì |
|---|---|
| **Chưa xác minh email** | Chỉ thấy màn nhắc xác minh, nút gửi lại email, đăng xuất. Không vào được phòng |
| **Chưa có username** (đăng nhập Google lần đầu) | Chỉ thấy màn chọn username. Phải hoàn tất trước khi làm bất cứ việc gì khác |

---

### ACT-03 — Chủ phòng (Host)

| Mục | Nội dung |
|---|---|
| **Là ai** | User đã **tạo** phòng. Đồng thời **luôn là một người chơi** |
| **Mặc định** | Cầm quân **đỏ**, đi trước |
| **Quyền riêng** | Đổi tên phòng · đổi chế độ riêng tư · đổi cấu hình thời gian (chỉ khi chờ) · tạo/đổi mã xem |
| **KHÔNG có quyền** | Chuyển quyền chủ cho người khác · đuổi đối thủ · sửa đồng hồ · đóng ván để ép kết quả · bật camera/mic thay người khác |

> **Lưu ý thiết kế:** Host **không** phải vai trò quản trị. Về mặt chơi cờ, host và đối thủ **hoàn toàn bình đẳng**.

**Khi chủ phòng rời đi:**

| Trạng thái phòng | Hệ quả |
|---|---|
| Chờ (`WAITING`) | **Đóng phòng**, thu hồi mọi lời mời |
| Đang chơi (`PLAYING`) | Tính là **đầu hàng** (giống mọi người chơi) |
| Đã xong (`FINISHED`) | **Đóng phòng** |

---

### ACT-04 — Người chơi (Player)

| Mục | Nội dung |
|---|---|
| **Là ai** | Thành viên ngồi 1 trong 2 ghế chơi |
| **Số lượng** | Đúng **2** mỗi phòng |
| **Làm được** | Sẵn sàng (ready) · đi cờ khi đến lượt · đầu hàng · xin hoà · xin đi lại · chat **cả hai kênh** · ẩn/hiện kênh chung · bật/tắt camera & mic của **chính mình** · mời người khác · **đuổi người xem** (`DEC-014`) · đồng ý tái đấu |
| **KHÔNG làm được** | Đi thay đối thủ · bật media của đối thủ · đuổi đối thủ |

**Rời phòng khi đang chơi = đầu hàng.** Giao diện phải nói rõ điều này trước khi xác nhận.

---

### ACT-05 — Đối thủ (Opponent)

Không phải vai trò lưu trong hệ thống, mà là **góc nhìn tương đối**: với người chơi A thì B là đối thủ, và ngược lại. Dùng khi mô tả quyền media (`OPPONENT_ONLY`) và thông báo ("đối thủ đã xin hoà").

---

### ACT-06 — Người xem (Spectator)

| Mục | Nội dung |
|---|---|
| **Là ai** | Thành viên không ngồi ghế chơi |
| **Số lượng** | Tối đa **5** mỗi phòng. Người thứ 6 **bị từ chối** |
| **Vào bằng cách nào** | Phòng `PUBLIC`: vào thẳng từ sảnh · `CODE_ONLY`: grant WATCH hợp lệ bằng mời trực tiếp/mã/link · `LOCKED`: **không vào được** |
| **Làm được** | Xem bàn cờ theo thời gian thực · chat trong **kênh chung** · nhận camera/mic của người chơi **nếu** người đó chọn chia sẻ cho người xem · xem lại ván hiện tại |
| **KHÔNG làm được** | Đi cờ · sẵn sàng · đầu hàng/xin hoà/xin đi lại · **đọc hoặc gửi kênh riêng người chơi** · phát camera/mic của mình · đổi cài đặt phòng · tự chuyển thành người chơi |

**Muốn thành người chơi:** phải **rời phòng** rồi vào lại bằng lời mời/mã `PLAY`. Không có đường chuyển tại chỗ.

**Bị mất quyền xem khi:** chủ phòng chuyển PUBLIC→CODE_ONLY, PUBLIC→LOCKED hoặc CODE_ONLY→LOCKED · mã xem bị đổi · **bị người chơi đuổi** (`DEC-014`) · mất kết nối tới hạn **15 giây**.

**Khi bị đuổi:** bị ghi vào danh sách chặn của phòng, **không vào lại phòng đó** bằng bất kỳ đường nào cho tới khi phòng đóng (`DEC-015`). Vẫn vào được phòng khác.

---

### ACT-07 — Máy (AI)

| Mục | Nội dung |
|---|---|
| **Là gì** | Đối thủ máy trong ván một người. **Không phải tài khoản**, không đăng nhập |
| **Ba cấp** | Dễ · Trung bình · Khó |
| **Làm được** | Đi cờ khi đến lượt |
| **KHÔNG có** | Chat · camera/mic · xin hoà (máy chỉ hoà theo luật lặp) · đầu hàng |
| **Đặc thù** | Ván với máy **không có phòng**, **không có người xem**, **không có media**. Người chơi xin đi lại **không cần máy đồng ý**. **Không** áp dụng luật chống treo ván (`DEC-012`) |

---

### ACT-08 — Hệ thống (System)

Không phải người dùng. Là các hành động **tự động** của máy chủ, cần ghi rõ vì chúng thay đổi trạng thái ván mà không ai bấm nút:

| Hành động tự động | Khi nào |
|---|---|
| Kết thúc ván do hết giờ | Đồng hồ của bên đến lượt về 0 |
| Kết thúc ván do treo ván | Hết 30 giây đếm ngược (`DEC-002`) |
| Kết thúc ván do mất mạng | Tới hạn 60 giây ân hạn, đối thủ vẫn online |
| Đánh dấu ván gián đoạn | Cả hai mất mạng · máy chủ khởi động lại · máy lỗi |
| Hết hạn đề nghị | Xin hoà/xin đi lại tới hạn 30 giây |
| Hết hạn lời mời | Lời mời trực tiếp tới hạn 10 phút · mã/link tới hạn 24 giờ |
| Đóng phòng | Phòng đã xong tới hạn 10 phút (now >= deadline) |
| Giải phóng ghế xem | Người xem mất kết nối tới hạn 15 giây |
| Thu hồi quyền xem | Ba chuyển kín hơn hoặc rotate WATCH theo REQ-SPECTATOR; no-op/giảm kín không revoke |

---

## 3. BẢNG SO SÁNH NHANH

| Hành động | Khách | User | Chủ phòng | Người chơi | Người xem |
|---|:---:|:---:|:---:|:---:|:---:|
| Xem sảnh | ❌ | ✅ | ✅ | ✅ | ✅ |
| Tạo phòng | ❌ | ✅ | — | — | — |
| Vào xem phòng `PUBLIC` | ❌ | ✅ | — | — | — |
| Mời người khác | ❌ | ❌ | ✅ | ✅ | ❌ |
| Đổi chế độ riêng tư | ❌ | ❌ | ✅ | ❌ | ❌ |
| Sẵn sàng / bắt đầu ván | ❌ | ❌ | ✅ | ✅ | ❌ |
| Đi cờ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Đầu hàng / xin hoà / xin đi lại | ❌ | ❌ | ✅ | ✅ | ❌ |
| Chat kênh **riêng người chơi** | ❌ | ❌ | ✅ | ✅ | ❌ |
| Chat **kênh chung** | ❌ | ❌ | ✅ | ✅ | ✅ |
| Ẩn/hiện kênh chung | ❌ | ❌ | ✅ | ✅ | ❌ |
| Bật camera/mic của mình | ❌ | ❌ | ✅ | ✅ | ❌ |
| **Đuổi người xem** | ❌ | ❌ | ✅ | ✅ | ❌ |
| Đuổi đối thủ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Chuyển quyền chủ phòng | ❌ | ❌ | ❌ | ❌ | ❌ |
| Chơi với máy | ❌ | ✅ | — | — | — |
| Xem lịch sử ván của mình | ❌ | ✅ | ✅ | ✅ | ✅ |
| Xem lịch sử ván người khác | ❌ | ❌ | ❌ | ❌ | ❌ |

Ma trận quyền đầy đủ theo từng API/sự kiện: [permissions.md](../04-business-rules/permissions.md)

---

## 4. BA QUY TẮC VAI TRÒ TUYỆT ĐỐI

1. **Một tài khoản, một phòng.** Không ngồi hai phòng cùng lúc. Mở nhiều tab **không** tạo thêm ghế; mọi tab đã xác thực đều thao tác được theo DEC-020. Chỉ quyền phát từng nguồn camera/micro mới được giữ bởi một tab.
2. **Người xem không bao giờ đọc được kênh riêng của hai người chơi.** Chiều ngược lại đã mở theo `DEC-018`: người chơi đọc và gửi được **kênh chung**. Máy chủ quyết định theo vai trò, kiểm cả lịch sử lẫn tin mới.
3. **Không ai điều khiển media của người khác.** Mỗi người tự quyết camera/mic của mình. Chủ phòng cũng không có ngoại lệ.
