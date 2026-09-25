# FLOW-AUTH — LUỒNG TÀI KHOẢN

**Yêu cầu:** [REQ-AUTH](../01-requirements/REQ-AUTH.md)

---

## 1. TOÀN CẢNH

```
                    Mở website
                         │
                         ▼
                  Đã đăng nhập?
                   ┌─────┴─────┐
                  KHÔNG        CÓ
                   │            │
                   ▼            ▼
            ┌────────────┐   Email đã xác minh?
            │  ĐĂNG NHẬP │    ┌──┴──┐
            └──┬──────┬──┘   KHÔNG  CÓ
               │      │        │     │
      username │      │ Google │     ▼
               │      │        │  Có username?
               │      │        │   ┌──┴──┐
               │      │        │  KHÔNG  CÓ
               │      │        │   │     │
               ▼      ▼        ▼   ▼     ▼
          ┌──────────────────────────────────┐
          │  Nhắc     │ Chọn    │   SẢNH     │
          │ xác minh  │username │            │
          └──────────────────────────────────┘
```

---

## 2. ĐĂNG KÝ BẰNG USERNAME

```
Màn Đăng ký
    │
    ├─ nhập username, email, mật khẩu
    │
    ▼
Kiểm tra định dạng
    ├─ username sai định dạng ──► báo quy tắc (3-24 ký tự, a-z 0-9 _)
    ├─ username đã có người dùng ──► "Tên đăng nhập đã được sử dụng"
    ├─ email sai định dạng ──► báo lỗi
    └─ mật khẩu < 10 ký tự ──► báo lỗi
    │
    ▼ (hợp lệ)
Tạo tài khoản + gửi email xác minh
    │
    ▼
Màn "NHẮC XÁC MINH"
    ├─ [Gửi lại email]  (tôn trọng giới hạn tần suất)
    └─ [Đăng xuất]
    │
    ▼ người dùng mở email, bấm link
    │
    ├─ link hết hạn / đã dùng ──► báo rõ + cho gửi lại
    │
    ▼ (hợp lệ)
Tài khoản kích hoạt ──► SẢNH
```

---

## 3. ĐĂNG NHẬP BẰNG USERNAME

```
Màn Đăng nhập
    │
    ├─ nhập username + mật khẩu
    ├─ ☑ Ghi nhớ đăng nhập   (mặc định TICK)
    │
    ▼
Xác thực
    ├─ sai username HOẶC sai mật khẩu
    │   └──► "Thông tin đăng nhập không đúng"
    │        (CÙNG một thông báo — không nói cái nào sai)
    ├─ sai quá nhiều lần ──► tạm khoá, báo thử lại sau
    └─ dịch vụ xác thực lỗi ──► báo lỗi + thử lại
    │
    ▼ (thành công)
Kiểm tra trạng thái tài khoản
    ├─ chưa xác minh email ──► Màn NHẮC XÁC MINH
    ├─ chưa có username ─────► Màn CHỌN USERNAME
    └─ đủ điều kiện ─────────► SẢNH
```

**Nếu trước đó mở link mời/link phòng:** sau xác thực/onboarding, kiểm lại điều kiện theo BR-AUTH-22; hợp lệ mới tự vào phòng, thất bại báo rõ + về sảnh.

---

### Vòng đời sau đăng nhập — DEC-038/040

Theo [BR-AUTH-18/19](../01-requirements/REQ-AUTH.md):

| Tình huống | Kết quả |
|---|---|
| Không ghi nhớ, reload chính tab | Giữ đăng nhập nếu phiên còn hợp lệ |
| Không ghi nhớ, đóng/mở hoặc khôi phục tab | Tab mới thông thường login; browser restore/duplicate có thể giữ phiên còn hạn. Hạn và giới hạn theo BR-AUTH-18/DEC-040 |
| Không ghi nhớ, mở tab mới | Tab mới đăng nhập riêng; không tự lấy phiên tạm cũ |
| Có ghi nhớ, mở lại browser | Tiếp tục nếu phiên chưa hết hạn/thu hồi |
| Chủ động dùng sản phẩm khi phiên ghi nhớ còn hạn | Gia hạn phiên đó đủ 30 ngày |
| Chỉ nhận dữ liệu hoặc kết nối nền tự duy trì | Không gia hạn |
| Phiên hết hạn | Báo hết phiên → đăng nhập lại; không tự hồi sinh bằng refresh |

Nếu đang trong phòng/ván, đăng nhập lại vẫn phải kiểm membership/quyền và hạn reconnect hiện có; đóng tab không phải Rời phòng.

---

## 4. ĐĂNG NHẬP BẰNG GOOGLE

```
Bấm [Đăng nhập bằng Google]
    │
    ▼
Chuyển sang Google
    ├─ người dùng huỷ ──► quay về màn Đăng nhập
    │
    ▼ (đồng ý)
Quay về hệ thống
    │
    ▼
Lần đầu?
 ┌──┴──┐
 CÓ   KHÔNG
 │      │
 ▼      ▼
Màn CHỌN USERNAME    SẢNH
 │
 ├─ username trùng ──► báo, cho chọn lại
 │
 ▼ (hợp lệ, CHỈ CHỌN MỘT LẦN)
SẢNH
```

**Email Google đã có tài khoản thường đã xác minh** ⇒ vào **cùng một** tài khoản (`BR-AUTH-16`).

---

## 5. QUÊN MẬT KHẨU

```
Bấm [Quên mật khẩu]
    │
    ├─ nhập email
    │
    ▼
Gửi email khôi phục
    │
    ▼
"Nếu email tồn tại, chúng tôi đã gửi hướng dẫn"
    (THÔNG BÁO CHUNG — không tiết lộ email có tồn tại hay không)
    │
    ▼ mở email, bấm link
    │
    ├─ link hết hạn / đã dùng ──► báo rõ + cho gửi lại
    ├─ mở ở trình duyệt KHÁC ──► báo phải mở cùng trình duyệt
    │                              hoặc gửi lại từ trình duyệt này
    ▼ (hợp lệ)
Màn Đặt mật khẩu mới
    │
    ▼
Đổi mật khẩu
    │
    ▼
⚠ THU HỒI TOÀN BỘ PHIÊN trên mọi thiết bị
    │
    ▼
Màn Đăng nhập
```

---

## 6. ĐĂNG XUẤT

```
Menu hồ sơ ──► [Đăng xuất]
    │
    ▼
Chọn phạm vi
    ├─ Thiết bị này ──► kết thúc phiên hiện tại
    └─ Mọi thiết bị ──► kết thúc TẤT CẢ phiên
                         + đóng mọi kết nối
                         + ⚠ DỪNG camera/mic đang bật
    │
    ▼
Màn Đăng nhập
```

---

## 7. ĐIỂM RẼ CẦN NHỚ

| Điểm rẽ | Quy tắc |
|---|---|
| Khách mở link phòng | Ghi nhớ đích nội bộ → đăng nhập/onboarding → kiểm lại BR-AUTH-22 → vào phòng hoặc báo không còn vào được |
| Chưa xác minh email | **Chặn hoàn toàn** — chỉ nhắc xác minh / gửi lại / đăng xuất |
| Chưa có username | **Chặn hoàn toàn** — chỉ chọn username |
| Sai đăng nhập | **Một** thông báo chung, **không lộ** email |
| Quên mật khẩu | Thông báo **chung** dù email có tồn tại hay không |
| Đổi mật khẩu | **Thu hồi mọi phiên** |

## 8. NHÁNH BIÊN ĐÃ CHỐT — DEC-040

- Google trùng email chưa xác minh: dịch vụ trả danh tính chuẩn → kiểm credential chưa xác nhận bị loại → hồ sơ chưa được xác minh phải chọn username → kiểm lại đích. Không ghép dữ liệu từ email client.
- Google-only chọn Quên mật khẩu: thông báo chung → email thật → đặt mật khẩu tự nguyện → server chặn/thu hồi mọi phiên → login bằng Google hoặc username + mật khẩu mới. Không ép mọi tài khoản Google đặt mật khẩu.
- Callback lỗi/hết hạn/thiếu verifier: thông báo + đăng nhập/yêu cầu link mới; không tự join. Callback replay đã xử lý: chỉ điều hướng từ phiên hợp lệ, không đổi code lại.
- Đích hết hạn/thu hồi, phòng đầy/đóng hoặc thiếu quyền sau onboarding: giữ tài khoản đã đăng nhập, báo không còn vào được + về sảnh. Session đã hết hạn thì login lại; refresh không hồi sinh.
- Recovery cập nhật mật khẩu qua server; server chặn phiên cũ trước gọi dịch vụ, lưu job thu hồi bền vững. Mất mạng/lỗi thu hồi không báo hoàn thành; retry cùng thao tác. Xem [auth-provider-config §6](../09-technical/auth-provider-config.md).
- UI phiên tạm giải thích 30 phút không sử dụng/tối đa 12 giờ và khả năng browser restore; Đăng xuất là thao tác chấm dứt chắc chắn. Không dùng đóng tab làm oracle thu hồi.
