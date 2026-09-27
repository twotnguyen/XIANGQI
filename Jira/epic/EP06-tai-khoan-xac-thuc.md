# EP06 · Tài khoản & xác thực

> **Loại:** Epic · **Story:** [ST06.1](../story/ST06.1-guard-xac-thuc-api-dang-ky-va-xac-minh-email.md), [ST06.2](../story/ST06.2-dang-nhap-bang-username-phien-30-ngay-phien-tam-dang-xuat.md), [ST06.3](../story/ST06.3-quen-mat-khau-dat-lai-va-chon-username-lan-dau.md), [ST06.4](../story/ST06.4-dang-nhap-google-tai-nguyen-ngoai.md)

| Trường Jira | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | `EP06 · Tài khoản & xác thực` |
| Components | Backend, Frontend, DevOps, Tester |
| Priority | High |
| Labels | `xq-v2`, `ep06`, `security` |
| Fix versions | `v0.3.0` |
| Start date / Due date | 2026-10-05 / 2026-10-16 |
| Nguồn đặc tả | ISSUE-046 … ISSUE-055 (R01) |

---

> ⏱ **Đọc lần đầu:** khoảng 10 phút. · Từ kỹ thuật lạ ⇒ [Từ điển kỹ thuật](../05-TU-DIEN-KY-THUAT.md) · Cách kiểm ⇒ [Sổ tay kiểm thử](../04-HUONG-DAN-KIEM-THU.md)

## 1. TÓM TẮT (đọc trong 1 phút)

Mọi thứ về **tài khoản**:
- Đăng ký bằng **username + email + mật khẩu**, xác minh email.
- Đăng nhập bằng **username**; chọn **Ghi nhớ** (30 ngày) hoặc **phiên tạm** (30 phút nhàn rỗi / tối đa 12 giờ).
- Đăng xuất thiết bị này / mọi thiết bị; quên mật khẩu; đăng nhập Google (lần đầu phải chọn username).
- **Người gác cổng** ở máy chủ kiểm phiên ở **mọi** yêu cầu.

**Không có khách vãng lai** — mọi chức năng cần tài khoản.

## 2. BỐI CẢNH — VÌ SAO EPIC NÀY TỒN TẠI

- Mọi Epic sau (bạn bè, phòng, ván, chat, camera) đều cần "ai đang gọi" ⇒ EP06 nằm trên **đường găng**.
- Lỗi lần trước `F-22`: kiểm phiên chỉ lúc đăng nhập ⇒ đăng xuất rồi token vẫn dùng được. EP06 bắt buộc kiểm **mỗi yêu cầu**.

## 3. KHÁI NIỆM CẦN HIỂU

| Khái niệm | Giải thích |
|---|---|
| **JWT** | Token Supabase cấp, sống ~1 giờ; máy chủ kiểm **chữ ký** bằng JWKS |
| **`app_sessions`** | Bảng phiên **của ứng dụng**: chế độ, hạn nhàn rỗi, hạn tuyệt đối, thu hồi. JWT còn hạn nhưng hàng này bị thu hồi ⇒ từ chối |
| **PKCE** | Luồng đăng nhập an toàn cho trình duyệt; link email chỉ dùng được trên đúng trình duyệt đã yêu cầu |
| **Fence + job** | Thu hồi phiên trong DB trước, gọi Supabase sau; lỗi thì worker thử lại |
| **Đồng hồ giả** | Kiểm hạn 30 ngày / 12 giờ mà không đợi thật |

Tra thêm: [Token](../05-TU-DIEN-KY-THUAT.md#jwt) · [Đồng hồ tiêm vào](../05-TU-DIEN-KY-THUAT.md#clock) · [Idempotency](../05-TU-DIEN-KY-THUAT.md#idempotency) · [Khoá dòng](../05-TU-DIEN-KY-THUAT.md#khoa-dong)

## 4. PHẠM VI

**✅ LÀM:** guard + `/me`; đăng ký, xác minh, callback; đăng nhập username, 2 chế độ phiên, gia hạn, đăng xuất CURRENT/ALL; quên/đặt lại mật khẩu; onboarding username; Google OAuth.

**❌ KHÔNG LÀM**
| Việc | Ở đâu |
|---|---|
| Hồ sơ, đổi tên hiển thị, tìm người | EP07 |
| Ngắt socket khi đăng xuất | EP10 (móc vào `auth_security_jobs`) |
| Dừng camera/mic khi đăng xuất ALL | EP14 |
| Redirect URI trên môi trường thật | EP16 |

## 5. LUẬT NGHIỆP VỤ DÙNG CHUNG CHO MỌI TASK

| Mục | Quy tắc |
|---|---|
| Username | `^[a-z0-9_]{3,24}$`, luôn lưu **chữ thường**, **không đổi được** sau khi chọn |
| Mật khẩu | 10–128 ký tự |
| Tên hiển thị | 1–40 ký tự, sửa được |
| Lỗi đăng nhập | Sai username **hay** sai mật khẩu đều trả **cùng** mã `UNAUTHENTICATED` + câu *"Thông tin đăng nhập không đúng"*; **không bao giờ** lộ email |
| Quên mật khẩu | Luôn hiện câu trung tính *"Nếu email tồn tại, chúng tôi đã gửi hướng dẫn"* |
| Giới hạn đăng nhập | 5 lần/phút theo IP + username đã chuẩn hoá |
| Phiên "Ghi nhớ" (REMEMBERED) | hạn nhàn rỗi 30 ngày tính từ lần hoạt động **chủ động** gần nhất; không có hạn tuyệt đối |
| Phiên tạm (TEMPORARY) | hạn nhàn rỗi 30 phút, hạn tuyệt đối 12 giờ; lưu `sessionStorage` riêng |
| "Hoạt động chủ động" | lệnh nghiệp vụ, mở trang/chuyển màn do người dùng bấm. **Không** tính: heartbeat socket, refresh token, polling, nhận sự kiện, tự kết nối lại |
| Đúng bằng hạn | là **hết hạn** (`now >= deadline` ⇒ từ chối) |
| Kiểm phiên | Ở **mọi** yêu cầu HTTP/lệnh realtime/cấp token media: JWT hợp lệ **và** `app_sessions` chưa thu hồi, chưa hết hạn **và** phiên Supabase Auth còn hiệu lực |
| Đăng ký, quên mật khẩu, Google | gọi **thẳng** Supabase Auth từ trình duyệt (PKCE), không qua máy chủ trung gian |
| Callback | Một route `/auth/callback`: đổi mã **đúng một lần**, xoá mã khỏi thanh địa chỉ (`history.replaceState`), chưa có username → `/onboarding`, có đích đã nhớ → tới đích, còn lại → `/lobby`. Đích chỉ nhận đường nội bộ `/rooms/:id`, `/join?...` |

## 6. ĐẦU VÀO

EP05 (bảng `profiles`, `app_sessions`, `auth_security_jobs`, trigger đổi mật khẩu, harness); EP03 (`LoginSchema`, mã lỗi); EP01 (router, `safeNext`); EP02 (thiết kế màn tài khoản).

## 7. DANH SÁCH STORY

| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST06.1](../story/ST06.1-guard-xac-thuc-api-dang-ky-va-xac-minh-email.md) | Guard xác thực API, đăng ký và xác minh email | 3 | 3 |
| [ST06.2](../story/ST06.2-dang-nhap-bang-username-phien-30-ngay-phien-tam-dang-xuat.md) | Đăng nhập bằng username, phiên 30 ngày/phiên tạm, đăng xuất | 3 | 5 |
| [ST06.3](../story/ST06.3-quen-mat-khau-dat-lai-va-chon-username-lan-dau.md) | Quên mật khẩu, đặt lại và chọn username lần đầu | 3 | 3 |
| [ST06.4](../story/ST06.4-dang-nhap-google-tai-nguyen-ngoai.md) | Đăng nhập Google (tài nguyên ngoài) | 3 | 2 |

```
TK06.1.1 ═(Done)═► TK06.1.2 ─► TK06.1.3
     ╚═(Done)═► TK06.2.1 ─► TK06.2.2 ─┬─► TK06.2.3 ─► TK06.3.2 ─┐
                                      └─► TK06.3.1 ─┬───────────┴─► TK06.4.2 ─► TK06.4.3 (QA)
                                                    └─► TK06.4.1 ─┘
```

## 8. TIÊU CHÍ HOÀN THÀNH EPIC

- [ ] 4 Story Done (ST06.4 được phép `BLOCKED_EXTERNAL` đúng quy định — **không** tính là Done).
- [ ] Mọi luồng tài khoản chạy thật trên Supabase local; email tới hộp thư local cổng 54324.
- [ ] Token của phiên đã đăng xuất / đổi mật khẩu bị từ chối ở **mọi** API.
- [ ] `qa login` dùng được cho Tester các Epic sau.

## 9. KỊCH BẢN DEMO (~10 phút)

1. Đăng ký `demo_user` → mở thư ở http://127.0.0.1:54324 → bấm link → vào sảnh.
2. Đăng nhập Chrome (Ghi nhớ) + Firefox (phiên tạm, mở tab mới ⇒ phải đăng nhập lại).
3. Chrome: Đăng xuất mọi thiết bị ⇒ Firefox bấm bất kỳ ⇒ về `/login`.
4. Quên mật khẩu ⇒ đặt lại ⇒ mật khẩu cũ không còn dùng được.
5. (Nếu có Google) Đăng nhập Google lần đầu ⇒ onboarding.
