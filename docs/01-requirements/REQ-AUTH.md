# REQ-AUTH — TÀI KHOẢN VÀ ĐĂNG NHẬP

**ID yêu cầu:** `R01` · **Trạng thái:** Đã chốt BA (chưa triển khai) · **Cập nhật:** 2026-09-22
**Căn cứ:** Câu 14, 15 phỏng vấn · `DEC-006` (không hỗ trợ khách) · `DEC-007`, `DEC-038/040` (phiên đăng nhập)

---

## 1. FEATURE NÀY ĐỂ LÀM GÌ

Cổng vào của toàn bộ hệ thống. Cho phép người dùng tạo tài khoản, đăng nhập bằng **username** hoặc **Google**, lấy lại mật khẩu khi quên, và đăng xuất an toàn.

**Nguyên tắc nền:** mọi chức năng khác của sản phẩm đều **yêu cầu tài khoản đã đăng nhập và hoàn tất onboarding**.

---

## 2. ACTOR

| Actor | Vai trò |
|---|---|
| **Khách** | Chưa đăng nhập. Chỉ vào được màn đăng nhập/đăng ký/quên mật khẩu |
| **Người dùng chưa xác minh email** | Đăng ký xong nhưng chưa bấm link trong email |
| **Người dùng chưa có username** | Đăng nhập Google lần đầu |
| **Người dùng** | Đã đăng nhập và hoàn tất onboarding |
| **Hệ thống** | Gửi email, kiểm tra phiên, thu hồi phiên |

---

## 3. PRECONDITIONS

| Chức năng | Điều kiện |
|---|---|
| Đăng ký | Chưa đăng nhập |
| Đăng nhập | Chưa đăng nhập; tài khoản tồn tại |
| Vào mọi chức năng khác | Đã đăng nhập **và** email đã xác minh **và** đã có username |

---

## 4. TRIGGER

Người dùng mở website và chưa có phiên hợp lệ · bấm Đăng ký / Đăng nhập / Quên mật khẩu / Đăng xuất.

---

## 5. MAIN FLOWS

### 5.1 Đăng ký bằng username

| Bước | Hành động |
|---|---|
| 1 | Người dùng nhập **username**, **email**, **mật khẩu** |
| 2 | Hệ thống kiểm tra định dạng và tính duy nhất của username |
| 3 | Tạo tài khoản, gửi **email xác minh** |
| 4 | Người dùng mở email, bấm link xác minh |
| 5 | Tài khoản được kích hoạt, chuyển vào sảnh |

### 5.2 Đăng nhập bằng username

| Bước | Hành động |
|---|---|
| 1 | Nhập **username + mật khẩu**, chọn/bỏ chọn **Ghi nhớ đăng nhập** |
| 2 | Hệ thống xác thực |
| 3 | Email chưa xác minh ⇒ màn nhắc xác minh · chưa có username ⇒ màn chọn username · đủ điều kiện ⇒ vào sảnh |

### 5.3 Đăng nhập bằng Google

| Bước | Hành động |
|---|---|
| 1 | Bấm **Đăng nhập bằng Google** |
| 2 | Chuyển sang Google, người dùng đồng ý |
| 3 | Quay về hệ thống |
| 4 | **Lần đầu** ⇒ màn **chọn username** (bắt buộc, chỉ chọn một lần). Lần sau ⇒ vào thẳng sảnh |

### 5.4 Quên mật khẩu

| Bước | Hành động |
|---|---|
| 1 | Nhập **email** |
| 2 | Hệ thống gửi email khôi phục (**thông báo chung** dù email có tồn tại hay không) |
| 3 | Người dùng bấm link, đặt mật khẩu mới |
| 4 | Hệ thống **đăng xuất toàn bộ thiết bị**, quay về màn đăng nhập |

### 5.5 Đăng xuất

| Phạm vi | Hiệu lực |
|---|---|
| **Thiết bị này** | Kết thúc phiên hiện tại |
| **Mọi thiết bị** | Kết thúc **tất cả** phiên; ngắt mọi kết nối và camera/mic đang mở |

---

## 6. ALTERNATIVE FLOWS

- **ALT-1** — Chưa xác minh email: chỉ thấy màn nhắc, nút **gửi lại email**, nút đăng xuất. Không vào được phòng.
- **ALT-2** — Google nhưng chưa chọn username: chỉ thấy màn chọn username. Không làm được việc gì khác.
- **ALT-3** — Mở link mời/link phòng khi chưa đăng nhập: chuyển tới đăng nhập, **ghi nhớ đích đến**, đăng nhập xong **tự động tiếp tục** vào phòng đó.
- **ALT-4** — Tài khoản chỉ có Google: **không bắt buộc** có mật khẩu. Giao diện ghi rõ *"Đăng nhập bằng Google"*.

---

## 7. EXCEPTION FLOWS

| Tình huống | Phản hồi |
|---|---|
| Sai username **hoặc** sai mật khẩu | **Cùng một** thông báo: *"Thông tin đăng nhập không đúng"* — không nói cái nào sai |
| Username đã có người dùng | *"Tên đăng nhập đã được sử dụng"* |
| Username sai định dạng | Nêu rõ quy tắc |
| Email sai định dạng | Nêu rõ |
| Mật khẩu quá ngắn | Nêu rõ tối thiểu 10 ký tự |
| Link xác minh hết hạn / đã dùng | Báo rõ, cho **gửi lại** |
| Đăng nhập sai nhiều lần | Tạm khoá theo tần suất, báo thử lại sau |
| Dịch vụ xác thực lỗi | Báo lỗi, cho thử lại. **Không** vì thế mà xử thua ván đang chơi |
| Mở link khôi phục ở trình duyệt khác | Báo phải mở cùng trình duyệt đã yêu cầu, hoặc gửi lại |

---

## 8. POSTCONDITION

| Kết cục | Trạng thái |
|---|---|
| Đăng ký xong | Tài khoản tồn tại, **chưa** xác minh, chưa vào được phòng |
| Xác minh xong | Đầy đủ quyền |
| Đăng nhập xong | Có phiên hợp lệ theo `BR-AUTH-10` |
| Đổi mật khẩu | **Mọi** phiên cũ bị thu hồi |
| Đăng xuất | Phiên kết thúc; mọi kết nối và camera/mic đóng |

---

## 9. BUSINESS RULES

| ID | Luật |
|---|---|
| **BR-AUTH-01** | Username: **3–24 ký tự**, chỉ chữ thường `a-z`, số `0-9`, gạch dưới `_`. Duy nhất toàn hệ thống |
| **BR-AUTH-02** | Username **không phân biệt hoa thường** khi kiểm trùng: `Alice` và `alice` là **một**. Lưu dạng chữ thường |
| **BR-AUTH-03** | Username **không đổi được** sau khi chọn |
| **BR-AUTH-04** | Tên hiển thị: **1–40 ký tự**, cho phép tiếng Việt có dấu, **sửa được**. Mặc định bằng username |
| **BR-AUTH-05** | Mật khẩu: **10–128 ký tự**. Cho phép dán từ trình quản lý mật khẩu |
| **BR-AUTH-06** | Email **bắt buộc** khi đăng ký thường; phải xác minh mới dùng được |
| **BR-AUTH-07** | Email **không hiển thị** ở hồ sơ, không hiện khi tìm kiếm người dùng |
| **BR-AUTH-08** | Sai username và sai mật khẩu trả **cùng một** thông báo |
| **BR-AUTH-09** | **Không hỗ trợ khách.** Mọi chức năng cần tài khoản đã đăng nhập và hoàn tất onboarding (`DEC-006`) |
| **BR-AUTH-10** | Có checkbox "Ghi nhớ đăng nhập", mặc định tick. Tick ⇒ phiên **30 ngày trượt** theo BR-AUTH-19. Bỏ tick ⇒ phiên riêng từng tab theo BR-AUTH-18 (`DEC-007/037/038`) |
| **BR-AUTH-11** | Phiên ghi nhớ hết hạn 30 ngày không có hoạt động gia hạn theo BR-AUTH-19 ⇒ phải đăng nhập lại; heartbeat/làm mới token không ngăn hết hạn |
| **BR-AUTH-12** | Đổi mật khẩu ⇒ thu hồi **toàn bộ** phiên trên mọi thiết bị |
| **BR-AUTH-13** | Đăng xuất "mọi thiết bị" chặn ngay thao tác mới tại server; đóng kết nối và thu hồi media theo BR-MED-24/25 |
| **BR-AUTH-14** | Quyền được kiểm ở **mỗi** thao tác, không chỉ lúc đăng nhập. Phiên đã thu hồi bị chặn ngay |
| **BR-AUTH-15** | **Không** đổi email, **không** xoá tài khoản trong phạm vi này |
| **BR-AUTH-16** | Google và tài khoản thường **cùng email đã xác minh** ⇒ **cùng một** tài khoản |
| **BR-AUTH-17** | Thông báo khôi phục mật khẩu **giống nhau** dù email có tồn tại hay không |
| **BR-AUTH-18** | Không ghi nhớ: phiên tạm theo tab; reload giữ phiên hợp lệ, tab mới thông thường đăng nhập riêng. Hết hạn sau **30 phút không hoạt động chủ động** hoặc **12 giờ từ đăng nhập**, điều kiện nào đến trước. Trình duyệt có thể khôi phục/copy phiên tab còn hạn; không bảo đảm phát hiện mọi lần đóng/khôi phục. **Đăng xuất** là cách chắc chắn chấm dứt phiên trên máy chung. DEC-040 thay lời hứa đóng/khôi phục tuyệt đối của DEC-037; không ảnh hưởng phiên độc lập khác |
| **BR-AUTH-19** | Phiên ghi nhớ còn hợp lệ được gia hạn đủ 30 ngày khi người dùng chủ động sử dụng (mở trang/chuyển màn, đi cờ, gửi chat, dùng chức năng). Heartbeat, tự refresh/reconnect, tải nền, nhận sự kiện không gia hạn. Kiểm hạn theo thời gian máy chủ; không gia hạn các phiên khác hoặc hồi sinh phiên đã hết hạn (`DEC-038`) |
| **BR-AUTH-20** | Google trùng email chưa xác minh: chỉ tin danh tính đã xác minh bởi dịch vụ xác thực; dùng tài khoản chuẩn do dịch vụ trả về, không ghép hồ sơ theo email client. Thông tin/credential chưa xác minh không được trở thành đường truy cập sau liên kết; xác minh bảo mật thất bại thì chặn, báo thử lại. Hồ sơ đã xác minh giữ nguyên; hồ sơ chỉ được người đăng ký chưa xác minh đặt tên phải chọn username mới sau xác thực |
| **BR-AUTH-21** | Tài khoản chỉ Google được **tự chọn đặt mật khẩu** bằng luồng khôi phục email; không bắt buộc. Sau khi chứng minh quyền email và đặt thành công, vẫn cùng tài khoản, Google vẫn dùng được, mọi phiên cũ bị thu hồi. Trước khi chứng minh, thông báo giống mọi email khác |
| **BR-AUTH-22** | Callback không tự cấp quyền vào phòng. Hoàn tất xác thực/onboarding rồi kiểm lại đích nội bộ, phiên, lời mời, quyền, sức chứa và trạng thái phòng tại server. Đích hết hiệu lực ⇒ báo không còn vào được + về sảnh; hết phiên ⇒ đăng nhập lại; không tiêu thụ lời mời hoặc nối vòng lặp khi chưa đủ điều kiện |

---

## 10. PERMISSIONS

| Hành động | Khách | Chưa xác minh | Chưa có username | Người dùng |
|---|:---:|:---:|:---:|:---:|
| Đăng ký / Đăng nhập | ✅ | — | — | — |
| Quên mật khẩu | ✅ | ✅ | ✅ | ✅ |
| Gửi lại email xác minh | ❌ | ✅ | — | — |
| Chọn username | ❌ | ❌ | ✅ | ❌ (đã có) |
| Sửa tên hiển thị | ❌ | ❌ | ❌ | ✅ |
| Vào sảnh / phòng / chơi | ❌ | ❌ | ❌ | ✅ |
| Đăng xuất | ❌ | ✅ | ✅ | ✅ |

---

## 11. UI LIÊN QUAN

`SCR-LOGIN` · `SCR-REGISTER` · `SCR-FORGOT-PASSWORD` · `SCR-RESET-PASSWORD` · `SCR-VERIFY-NOTICE` · `SCR-ONBOARDING` · `SCR-PROFILE-SETTINGS`

**Bắt buộc mọi màn:** trạng thái đang tải · lỗi có thể thử lại · thông báo lỗi **tiếng Việt** nêu rõ cách sửa · nút gửi bị vô hiệu khi đang xử lý để tránh bấm hai lần.

---

## 12. STATES

```
KHÁCH ──(đăng ký)──► CHƯA XÁC MINH ──(bấm link)──► NGƯỜI DÙNG
  │                                                     ▲
  └──(Google lần đầu)──► CHƯA CÓ USERNAME ──(chọn)──────┘
  │
  └──(đăng nhập)────────────────────────────────────────┘

NGƯỜI DÙNG ──(đăng xuất / hết hạn / đổi mật khẩu)──► KHÁCH
```

---

## 13. REALTIME BEHAVIOR

| Sự kiện | Ai nhận | Hiệu lực |
|---|---|---|
| Đăng xuất **mọi thiết bị** | Mọi tab của tài khoản | Ngắt kết nối, dừng camera/mic, về màn đăng nhập |
| Đổi mật khẩu | Mọi tab | Như trên |
| Phiên hết hạn giữa chừng | Tab đang dùng | Báo phiên hết hạn, về màn đăng nhập. **Không** mất ván đang chơi một cách âm thầm |

---

## 14. EDGE CASES

| # | Tình huống | Xử lý |
|---|---|---|
| 1 | Hai người cùng đăng ký username `alice` và `Alice` | **Chỉ một** thành công (`BR-AUTH-02`) |
| 2 | Bấm link xác minh hai lần | Lần hai báo đã xác minh rồi, không lỗi nặng |
| 3 | Tải lại trang ngay sau khi xác minh | Không xử lý xác minh lần hai |
| 4 | Đăng nhập Google bằng email đã có tài khoản thường **đã xác minh** | Vào **cùng** tài khoản (`BR-AUTH-16`) |
| 5 | Đổi mật khẩu khi đang chơi ở tab khác | Tab đó bị đăng xuất; ván xử theo luật mất kết nối |
| 6 | Hết hạn phiên đúng lúc đang đi nước | Nước đi bị từ chối, báo phiên hết hạn |
| 7 | Mở 2 tab cùng tài khoản | Mọi tab đã xác thực đều thao tác được (DEC-020). Phiên không ghi nhớ cần đăng nhập riêng từng tab (BR-AUTH-18) |
| 8 | Chọn username đã có người lấy mất trong lúc đang nhập | Báo trùng, cho chọn lại |
| 9 | Mở link mời khi chưa đăng nhập | Ghi nhớ đích, đăng nhập xong kiểm lại theo BR-AUTH-22 |
| 10 | Dịch vụ xác thực chết | Báo lỗi + thử lại. **Không** tự xử thua ván đang chơi |

---

## 15. ACCEPTANCE CRITERIA

| ID | Tiêu chí |
|---|---|
| **AC-AUTH-01** | Đăng ký → nhận email thật → xác minh → đăng nhập bằng username thành công |
| **AC-AUTH-02** | Sai username và sai mật khẩu trả **cùng** thông báo, **không lộ** email |
| **AC-AUTH-03** | Tranh chấp `alice` / `Alice` ⇒ đúng **một** thành công |
| **AC-AUTH-04** | Chưa xác minh email ⇒ **không vào được** phòng |
| **AC-AUTH-05** | Google lần đầu ⇒ **bắt buộc** chọn username trước khi làm gì khác |
| **AC-AUTH-06** | Google lần hai ⇒ giữ nguyên hồ sơ, vào thẳng sảnh |
| **AC-AUTH-07** | Link khôi phục **dùng lại** hoặc **hết hạn** ⇒ bị từ chối |
| **AC-AUTH-08** | Đổi mật khẩu ⇒ **mọi** phiên cũ bị thu hồi, kể cả đang kết nối |
| **AC-AUTH-09** | Phiên đã thu hồi **không dùng được** cho bất kỳ thao tác nào |
| **AC-AUTH-10** | Không ghi nhớ: tab mới thông thường cần đăng nhập; kiểm và ghi hành vi restore/duplicate trên từng trình duyệt. Restore giữ dữ liệu chỉ dùng được khi phiên server còn hạn; đăng xuất, đúng hạn 30 phút nhàn rỗi hoặc 12 giờ tuyệt đối đều chặn |
| **AC-AUTH-11** | Tick Ghi nhớ ⇒ đóng/mở trình duyệt vẫn đăng nhập nếu phiên còn hạn và chưa bị thu hồi |
| **AC-AUTH-12** | Đăng xuất "mọi thiết bị" ⇒ camera/mic đang bật **bị dừng** |
| **AC-AUTH-13** | Khách mở link phòng ⇒ đăng nhập/onboarding, sau đó tự vào đúng phòng **nếu còn đủ điều kiện** theo BR-AUTH-22 |
| **AC-AUTH-14** | Khách **không** gọi được bất kỳ chức năng nào ngoài đăng nhập/đăng ký/khôi phục |
| **AC-AUTH-15** | Reload chính tab giữ phiên hợp lệ; mở tab qua ứng dụng không sao chép phiên tạm. Duplicate/restore do trình duyệt có thể cùng phiên, phải hiển thị giới hạn và vẫn kiểm hạn server |
| **AC-AUTH-16** | Hai tab đăng nhập phiên tạm độc lập: đóng A không đăng xuất B; B vẫn thao tác theo quyền. Đăng xuất mọi thiết bị vẫn thu hồi cả hai |
| **AC-AUTH-17** | Đồng hồ giả: hoạt động chủ động ở ngày 29 gia hạn phiên đó đủ 30 ngày; phiên độc lập không hoạt động không được gia hạn theo |
| **AC-AUTH-18** | Chỉ heartbeat/token refresh/reconnect/tải nền/nhận tin thụ động trong 30 ngày ⇒ hạn ứng dụng không dời; hết hạn phải đăng nhập lại |
| **AC-AUTH-19** | Phiên đã hết hạn: thử thao tác trực tiếp tại server và kết nối realtime đều bị chặn dù token kỹ thuật còn hạn; không tự hồi sinh phiên |
| **AC-AUTH-20** | Google trùng email chưa xác minh: danh tính chuẩn đúng, credential cũ không chiếm được tài khoản; không tin username/display-name chưa xác minh; thử cả callback lặp và giả email client |
| **AC-AUTH-21** | Chỉ Google → khôi phục email thật → tự đặt mật khẩu → giữ cùng tài khoản, đăng nhập được bằng cả hai cách; phiên trước đổi bị chặn |
| **AC-AUTH-22** | Callback/onboarding với lời mời hết hạn, bị thu hồi, phòng đầy/đóng, thiếu quyền ⇒ không tự vào, có thông báo và về sảnh; phiên hết hạn ⇒ login lại, không vòng lặp |
| **AC-AUTH-23** | Hạn phiên: `now == expires_at` từ chối trước gia hạn; hai hoạt động đồng thời không rút ngắn hạn; thu hồi thắng hoạt động đến sau; hết hạn không tự tạo phiên từ refresh token cũ |

---

## 16. DEPENDENCY

Không phụ thuộc yêu cầu nào — đây là **gốc**. Mọi yêu cầu khác phụ thuộc vào `REQ-AUTH`.

## 17. OPEN QUESTIONS

Q-AUD-08/F14 đã chốt bằng DEC-040, bổ sung DEC-038 và sửa giới hạn khả thi của DEC-037. Hợp đồng server, callback và nguồn nền tảng ở [auth-provider-config](../09-technical/auth-provider-config.md). Không còn câu hỏi sản phẩm; kiểm thử tích hợp/thiết bị vẫn là việc triển khai, chưa có bằng chứng PASS.
