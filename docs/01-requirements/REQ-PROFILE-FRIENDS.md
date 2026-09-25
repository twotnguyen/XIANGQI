# REQ-PROFILE-FRIENDS — HỒ SƠ VÀ BẠN BÈ

**ID yêu cầu:** `R02` · **Trạng thái:** Ready · **Cập nhật:** 2026-09-21
**Căn cứ:** Câu 16 phỏng vấn
**Phụ thuộc:** [REQ-AUTH](REQ-AUTH.md) · [REQ-INVITE](REQ-INVITE.md)

---

## 1. FEATURE NÀY ĐỂ LÀM GÌ

Cho người dùng một **danh tính hiển thị**, tìm được nhau theo username, **kết bạn hai chiều**, và thấy bạn nào **đang online** để mời vào chơi.

**Giới hạn cố ý:** kết bạn **chỉ phục vụ việc mời chơi**. Không có nhắn tin riêng ngoài phòng, không có bảng tin, không phải mạng xã hội.

---

## 2. ACTOR

| Actor | Vai trò |
|---|---|
| **Người gửi** | Gửi lời mời kết bạn |
| **Người nhận** | Chấp nhận hoặc từ chối |
| **Bạn bè** | Hai người đã chấp nhận nhau |
| **Hệ thống** | Theo dõi trạng thái online |

---

## 3. PRECONDITIONS

Đã đăng nhập và hoàn tất onboarding.

## 4. TRIGGER

Mở trang bạn bè · tìm người dùng · bấm kết bạn / chấp nhận / từ chối / huỷ kết bạn · sửa tên hiển thị.

---

## 5. MAIN FLOWS

### 5.1 Sửa tên hiển thị
Vào cài đặt hồ sơ → nhập tên mới (1–40 ký tự, có dấu tiếng Việt) → lưu. Username **không đổi được**.

### 5.2 Tìm người dùng
Nhập **tối thiểu 3 ký tự** đầu của username → hệ thống trả tối đa **20 kết quả**, mỗi kết quả gồm username và tên hiển thị. **Không bao giờ** hiện email.

### 5.3 Gửi lời mời kết bạn
Chọn người → bấm **Kết bạn** → lời mời ở trạng thái **đang chờ** → người nhận thấy trong danh sách lời mời.

### 5.4 Phản hồi lời mời
Người nhận **chấp nhận** ⇒ thành bạn bè hai chiều. **Từ chối** ⇒ lời mời biến mất, không thành bạn.

### 5.5 Huỷ lời mời đã gửi
Người gửi rút lại lời mời khi chưa được phản hồi.

### 5.6 Huỷ kết bạn
Một trong hai bên huỷ ⇒ quan hệ chấm dứt **cho cả hai**.

### 5.7 Xem trạng thái online
Danh sách bạn bè hiện **đang online** / **ngoại tuyến**, cập nhật theo thời gian thực.

---

## 6. ALTERNATIVE FLOWS

- **ALT-1 — Gửi chéo:** A đã gửi cho B, giờ B bấm kết bạn với A ⇒ **không tạo lời mời thứ hai**. Hệ thống hiện lời mời sẵn có của A để B **chấp nhận**. Không tự động thành bạn.
- **ALT-2 — Đã là bạn:** nút kết bạn đổi thành **Huỷ kết bạn**.
- **ALT-3 — Kết bạn lại sau khi huỷ:** được phép, như lời mời mới.

---

## 7. EXCEPTION FLOWS

| Tình huống | Phản hồi |
|---|---|
| Tự kết bạn với chính mình | Từ chối |
| Gửi trùng lời mời đang chờ | Không tạo bản thứ hai; giữ nguyên cái cũ |
| Người dùng không tồn tại | *"Không tìm thấy người dùng"* |
| Tìm với dưới 3 ký tự | Không tìm, nhắc nhập thêm |
| Phản hồi lời mời không phải của mình | Từ chối |
| Tên hiển thị rỗng hoặc quá 40 ký tự | Nêu rõ giới hạn |

---

## 8. POSTCONDITION

| Kết cục | Trạng thái |
|---|---|
| Gửi lời mời | Một quan hệ **đang chờ** |
| Chấp nhận | Quan hệ **bạn bè** — **một** quan hệ cho mỗi cặp, không hướng |
| Từ chối / huỷ | **Không** còn quan hệ nào |
| Huỷ kết bạn | Quan hệ chấm dứt cho **cả hai** |

---

## 9. BUSINESS RULES

| ID | Luật |
|---|---|
| **BR-FRD-01** | Mỗi cặp người dùng có **đúng một** quan hệ, **không phân biệt** ai gửi trước |
| **BR-FRD-02** | Gửi chéo **không** tự động thành bạn — vẫn phải có người bấm chấp nhận |
| **BR-FRD-03** | Không tự kết bạn với chính mình |
| **BR-FRD-04** | Tìm kiếm cần **tối thiểu 3 ký tự**, trả tối đa **20** kết quả |
| **BR-FRD-05** | Kết quả tìm kiếm **không bao giờ** chứa email |
| **BR-FRD-06** | Chỉ **mời chơi trực tiếp** được với người **đã là bạn**. Người chưa kết bạn vẫn vào được bằng link/mã |
| **BR-FRD-07** | Bạn bè chỉ thấy **online / ngoại tuyến**. **Không** thấy đang ở phòng nào |
| **BR-FRD-08** | Online = đang có kết nối hợp lệ. Mất tín hiệu quá hạn ⇒ chuyển ngoại tuyến |
| **BR-FRD-09** | Mở nhiều tab vẫn tính là **một** người online |
| **BR-FRD-10** | Tên hiển thị **1–40 ký tự**, cho phép tiếng Việt có dấu, mặc định bằng username |
| **BR-FRD-11** | Username **bất biến** (`BR-AUTH-03`) |
| **BR-FRD-12** | Huỷ kết bạn có hiệu lực **hai chiều** ngay |

> **`BR-FRD-07` là luật riêng tư.** Bạn bè biết bạn online nhưng **không** biết bạn đang ở phòng riêng tư nào.

---

## 10. PERMISSIONS

| Hành động | Người lạ | Đang chờ | Bạn bè | Chính mình |
|---|:---:|:---:|:---:|:---:|
| Xem username + tên hiển thị | ✅ | ✅ | ✅ | ✅ |
| Xem email | ❌ | ❌ | ❌ | ✅ |
| Xem trạng thái online | ❌ | ❌ | ✅ | — |
| Xem đang ở phòng nào | ❌ | ❌ | ❌ | — |
| Gửi lời mời kết bạn | ✅ | ❌ | ❌ | ❌ |
| Chấp nhận / từ chối | ❌ | ✅ (người nhận) | ❌ | ❌ |
| Huỷ lời mời đã gửi | ❌ | ✅ (người gửi) | ❌ | ❌ |
| Huỷ kết bạn | ❌ | ❌ | ✅ | ❌ |
| **Mời vào phòng chơi** | ❌ | ❌ | ✅ | ❌ |
| Sửa tên hiển thị | ❌ | ❌ | ❌ | ✅ |

---

## 11. UI LIÊN QUAN

`SCR-FRIENDS` (3 tab: Bạn bè · Lời mời nhận · Lời mời đã gửi) · `SCR-USER-SEARCH` · `SCR-PROFILE-SETTINGS`

**Trạng thái bắt buộc:** đang tải · **trống** (*"Chưa có bạn nào — tìm theo tên đăng nhập để kết bạn"*) · lỗi + thử lại · nút vô hiệu khi đang gửi.

---

## 12. STATES

```
KHÔNG QUAN HỆ ──(A gửi)──► ĐANG CHỜ ──(B chấp nhận)──► BẠN BÈ
      ▲                        │                          │
      │      (B từ chối /      │                          │
      └───── A huỷ lời mời) ◄──┘                          │
      │                                                   │
      └────────────── (một bên huỷ kết bạn) ◄─────────────┘
```

---

## 13. REALTIME BEHAVIOR

| Sự kiện | Ai nhận | UI đổi gì |
|---|---|---|
| Nhận lời mời kết bạn | Người nhận | Danh sách lời mời +1, có chỉ báo |
| Lời mời được chấp nhận | **Cả hai** | Vào danh sách bạn bè |
| Lời mời bị từ chối / huỷ | **Cả hai** | Biến khỏi danh sách chờ |
| Huỷ kết bạn | **Cả hai** | Biến khỏi danh sách bạn |
| Bạn online / ngoại tuyến | **Chỉ bạn bè** | Đổi chấm trạng thái |

**`BR-FRD-13`** — Trạng thái online **chỉ** gửi cho bạn bè, không phát rộng.

---

## 14. EDGE CASES

| # | Tình huống | Xử lý |
|---|---|---|
| 1 | A và B **cùng lúc** bấm kết bạn | Tạo **đúng một** quan hệ đang chờ |
| 2 | A gửi, B gửi ngược | Không tạo bản thứ hai; B thấy nút **Chấp nhận** |
| 3 | Bấm chấp nhận hai lần | Chỉ một quan hệ bạn bè |
| 4 | Chấp nhận lời mời đã bị huỷ | Báo lời mời không còn hiệu lực |
| 5 | Huỷ kết bạn khi đang cùng phòng | Vẫn ở trong phòng; chỉ mất quan hệ bạn bè |
| 6 | Bạn mở 2 tab rồi đóng 1 | Vẫn hiện **online** |
| 7 | Bạn mất mạng đột ngột | Chuyển ngoại tuyến sau khi hết hạn tín hiệu |
| 8 | Tìm bằng chuỗi có chữ hoa | Không phân biệt hoa thường |
| 9 | Bạn đang ở phòng khoá | Vẫn chỉ thấy **online**, không thấy phòng nào (`BR-FRD-07`) |
| 10 | Có hơn 20 kết quả khớp | Trả 20, nhắc gõ cụ thể hơn |

---

## 15. ACCEPTANCE CRITERIA

| ID | Tiêu chí |
|---|---|
| **AC-FRD-01** | Gửi → chấp nhận → thành bạn hai chiều, **cả hai** thấy nhau |
| **AC-FRD-02** | Gửi → từ chối ⇒ không thành bạn, không còn lời mời |
| **AC-FRD-03** | Gửi chéo ⇒ **đúng một** quan hệ, không tự thành bạn |
| **AC-FRD-04** | Hai người bấm cùng lúc ⇒ **đúng một** quan hệ |
| **AC-FRD-05** | Không tự kết bạn với chính mình |
| **AC-FRD-06** | Chỉ người nhận phản hồi được; người khác gửi lệnh bị từ chối |
| **AC-FRD-07** | Chỉ người gửi huỷ được lời mời đã gửi |
| **AC-FRD-08** | Huỷ kết bạn có hiệu lực **hai chiều** |
| **AC-FRD-09** | Tìm kiếm **không bao giờ** trả về email |
| **AC-FRD-10** | Dưới 3 ký tự ⇒ không tìm |
| **AC-FRD-11** | Trạng thái online chỉ bạn bè thấy; người lạ **không** thấy |
| **AC-FRD-12** | Bạn bè **không** thấy đang ở phòng nào |
| **AC-FRD-13** | Ngắt kết nối ⇒ bạn bè thấy ngoại tuyến sau khi hết hạn |
| **AC-FRD-14** | Tên hiển thị có dấu tiếng Việt lưu và hiện đúng |
| **AC-FRD-15** | Chỉ **bạn bè** mới mời chơi trực tiếp được |

---

## 16. DEPENDENCY

[REQ-AUTH](REQ-AUTH.md) — cần tài khoản · [REQ-INVITE](REQ-INVITE.md) — mời trực tiếp chỉ dành cho bạn bè

## 17. OPEN QUESTIONS

**Không còn.**
