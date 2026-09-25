# REQ-LOBBY — SẢNH

**ID yêu cầu:** `R03` · **Trạng thái:** Ready · **Cập nhật:** 2026-09-21
**Phụ thuộc:** [REQ-AUTH](REQ-AUTH.md) · [REQ-ROOM](REQ-ROOM.md)

---

## 1. FEATURE NÀY ĐỂ LÀM GÌ

Màn hình chính sau khi đăng nhập. Là nơi người dùng **tìm phòng công khai để vào xem**, **tạo phòng mới**, **vào phòng bằng mã**, hoặc **bắt đầu ván với máy**.

---

## 2. ACTOR

| Actor | Vai trò |
|---|---|
| **Người dùng** | Xem danh sách, tạo phòng, vào phòng, chơi với máy |
| **Hệ thống** | Cập nhật danh sách phòng theo thời gian thực |

## 3. PRECONDITIONS

Đã đăng nhập và hoàn tất onboarding. **Khách không vào được sảnh** (`BR-AUTH-09`).

## 4. TRIGGER

Đăng nhập xong · bấm về sảnh · rời phòng.

---

## 5. MAIN FLOW

| Bước | Hành động |
|---|---|
| 1 | Người dùng vào sảnh |
| 2 | Hệ thống hiện danh sách **phòng công khai**, mới nhất trước, mỗi trang tối đa **20** |
| 3 | Mỗi phòng hiện: tên · chủ phòng · cấu hình thời gian · trạng thái · **số người xem / 5** |
| 4 | Người dùng chọn: vào xem một phòng · **Tạo phòng** · **Nhập mã** · **Chơi với máy** |

**Mỗi phòng trong danh sách hiện đúng những thông tin sau:**

| Thông tin | Ví dụ |
|---|---|
| Tên phòng | *Cờ chiều thứ 7* |
| Chủ phòng (tên hiển thị) | *Minh Nguyễn* |
| Cấu hình thời gian | *Không giới hạn* / *10 phút* |
| Trạng thái | *Đang chờ* / *Đang chơi* — **chỉ hai trạng thái này hiện ở sảnh** |
| Số người xem | *3/5* |

---

## 6. ALTERNATIVE FLOWS

- **ALT-1** — Không có phòng công khai nào ⇒ trạng thái **trống**, gợi ý tạo phòng hoặc chơi với máy.
- **ALT-2** — Vào phòng bằng **mã**: nhập mã 8 ký tự → hệ thống xác định mã cho **chơi** hay **xem** → vào đúng vai trò.
- **ALT-3** — Đang ở phòng khác: sảnh hiện rõ *"Bạn đang ở trong một phòng"* kèm nút **quay lại phòng đó**.

---

## 7. EXCEPTION FLOWS

| Tình huống | Phản hồi |
|---|---|
| Bấm vào phòng vừa đầy | *"Phòng đã đủ người xem"*, làm mới danh sách |
| Bấm vào phòng vừa đóng | *"Phòng không còn tồn tại"*, làm mới danh sách |
| Bấm vào phòng vừa chuyển sang riêng tư | *"Phòng này không cho xem"* |
| Đang ở phòng khác mà bấm vào phòng mới | Yêu cầu rời phòng hiện tại trước |
| **Bị chặn** khỏi phòng đó | *"Bạn không thể vào phòng này"* (`BR-SPEC-11`) |
| Mất kết nối | Hiện lỗi + nút thử lại, **không** hiện danh sách trắng không giải thích |

---

## 8. POSTCONDITION

Ở sảnh, hoặc đã chuyển vào phòng / ván với máy.

---

## 9. BUSINESS RULES

| ID | Luật |
|---|---|
| **BR-LOB-01** | Sảnh **chỉ** hiện phòng **công khai**. Phòng cần mã và phòng khoá **không bao giờ** xuất hiện |
| **BR-LOB-02** | Phòng **đã đóng** không hiện |
| **BR-LOB-09** | Sảnh **chỉ** hiện phòng **đang chờ** và **đang chơi**. Phòng **đã xong ván** (10 phút chờ tái đấu) **không hiện**, nhưng **vào được bằng mã/link** (`DEC-023`) |
| **BR-LOB-10** | Phòng tái đấu chuyển lại **đang chơi** ⇒ **tự xuất hiện lại** ở sảnh |
| **BR-LOB-03** | Mỗi trang tối đa **20** phòng, sắp xếp **mới nhất trước** |
| **BR-LOB-04** | Danh sách cập nhật theo thời gian thực khi có phòng mới/đóng/đổi số người xem |
| **BR-LOB-05** | Sảnh **không** hiện nội dung ván (thế cờ, nước đi) — muốn xem phải vào phòng |
| **BR-LOB-06** | Một tài khoản **chỉ ở một phòng**. Đang ở phòng thì phải rời trước khi vào phòng khác |
| **BR-LOB-07** | Tạo ván với máy yêu cầu **đã rời** phòng online |
| **BR-LOB-08** | Quyền vào phòng được kiểm **lại** lúc bấm vào, không tin danh sách đã tải |

> **`BR-LOB-08` quan trọng:** danh sách có thể cũ vài giây. Phòng có thể đã đầy hoặc đã chuyển riêng tư. **Luôn kiểm lại** khi thực sự vào.

---

## 10. PERMISSIONS

| Hành động | Khách | Người dùng | Người dùng đang ở phòng khác |
|---|:---:|:---:|:---:|
| Xem sảnh | ❌ | ✅ | ✅ |
| Thấy phòng công khai | ❌ | ✅ | ✅ |
| Thấy phòng cần mã / khoá | ❌ | ❌ | ❌ |
| Tạo phòng | ❌ | ✅ | ❌ |
| Vào xem phòng | ❌ | ✅ | ❌ |
| Vào bằng mã | ❌ | ✅ | ❌ |
| Chơi với máy | ❌ | ✅ | ❌ |

---

## 11. UI LIÊN QUAN

`SCR-LOBBY` · `SCR-CREATE-ROOM` (modal) · `SCR-JOIN-BY-CODE` (modal) · `SCR-AI-SETUP`

**Trạng thái bắt buộc:**

| Trạng thái | Nội dung |
|---|---|
| Đang tải | Khung xương danh sách |
| **Trống** | *"Chưa có phòng công khai nào"* + nút Tạo phòng + nút Chơi với máy |
| Lỗi | Thông báo + nút thử lại |
| Vô hiệu | Nút tạo/vào phòng mờ khi đang ở phòng khác, kèm giải thích |

---

## 12. STATES

```
Ở SẢNH ──(tạo phòng)──────► TRONG PHÒNG (chủ phòng)
   │
   ├──(vào xem)────────────► TRONG PHÒNG (người xem)
   ├──(nhập mã chơi)───────► TRONG PHÒNG (người chơi)
   ├──(nhập mã xem)────────► TRONG PHÒNG (người xem)
   └──(chơi với máy)───────► VÁN VỚI MÁY
```

---

## 13. REALTIME BEHAVIOR

| Sự kiện | Ai nhận | UI đổi gì |
|---|---|---|
| Phòng công khai mới | Mọi người ở sảnh | Thêm lên đầu danh sách |
| Phòng đóng | Mọi người ở sảnh | Xoá khỏi danh sách |
| Phòng đổi sang riêng tư | Mọi người ở sảnh | **Biến mất** khỏi danh sách |
| Phòng đổi sang công khai | Mọi người ở sảnh | **Xuất hiện** |
| Số người xem đổi | Mọi người ở sảnh | Cập nhật *n/5* |
| Ván bắt đầu / kết thúc | Mọi người ở sảnh | Loại phòng FINISHED khỏi danh sách |

---

## 14. EDGE CASES

| # | Tình huống | Xử lý |
|---|---|---|
| 1 | Phòng đầy đúng lúc đang bấm vào | Bị từ chối, danh sách làm mới (`BR-LOB-08`) |
| 2 | Phòng chuyển riêng tư đúng lúc đang bấm | Bị từ chối |
| 3 | Hai người cùng bấm vào ghế xem cuối | Đúng một người vào được |
| 4 | Có rất nhiều phòng công khai | Phân trang 20 mỗi trang |
| 5 | Đang ở sảnh mà bị đăng xuất từ thiết bị khác | Về màn đăng nhập |
| 6 | Mở 2 tab sảnh | Cả hai cập nhật; ràng buộc một phòng vẫn áp dụng |
| 7 | Vào phòng mình **bị đuổi** trước đó | Bị từ chối (`BR-SPEC-11`) |
| 8 | Nhập mã phòng đã hết hạn | *"Mã không hợp lệ hoặc đã hết hạn"* |

---

## 15. ACCEPTANCE CRITERIA

| ID | Tiêu chí |
|---|---|
| **AC-LOB-01** | Chỉ phòng **công khai** hiện ở sảnh; phòng cần mã và phòng khoá **không** hiện |
| **AC-LOB-02** | Phòng mới tạo xuất hiện **realtime** ở sảnh người khác |
| **AC-LOB-03** | Đổi công khai → riêng tư ⇒ phòng **biến mất** khỏi sảnh người khác |
| **AC-LOB-04** | Số người xem cập nhật realtime |
| **AC-LOB-05** | Bấm vào phòng vừa đầy ⇒ bị từ chối kèm thông báo rõ |
| **AC-LOB-06** | Đang ở phòng khác ⇒ **không** tạo/vào phòng mới được |
| **AC-LOB-07** | Đang ở phòng online ⇒ **không** tạo ván với máy được |
| **AC-LOB-08** | Phân trang đúng 20 mỗi trang |
| **AC-LOB-09** | Trạng thái **trống** hiện đúng khi không có phòng nào |
| **AC-LOB-10** | Người **bị đuổi** không vào lại được phòng đó từ sảnh |
| **AC-LOB-11** | Khách **không** vào được sảnh |
| **AC-LOB-12** | Ván kết thúc ⇒ phòng **biến mất** khỏi sảnh; tái đấu ⇒ **xuất hiện lại** |

---

## 16. DEPENDENCY

[REQ-AUTH](REQ-AUTH.md) · [REQ-ROOM](REQ-ROOM.md) · [REQ-SPECTATOR](REQ-SPECTATOR.md) · [REQ-INVITE](REQ-INVITE.md) · [REQ-AI](REQ-AI.md)

## 17. OPEN QUESTIONS

**Không còn.** `BA-A-02` đã chốt ở `DEC-023`: sảnh **không** hiện phòng đã xong ván; mã/link vẫn vào được.
