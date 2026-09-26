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
| Start date / Due date | 2026-10-07 / 2026-10-15 |
| Nguồn đặc tả | ISSUE-046 … ISSUE-055 (R01) |

**Mục tiêu:** Người dùng đăng ký bằng **username + email + mật khẩu**, xác minh email, đăng nhập bằng **username**, chọn "Ghi nhớ" (30 ngày) hoặc phiên tạm, đăng xuất thiết bị này/mọi thiết bị, quên mật khẩu, đăng nhập Google (lần đầu phải chọn username). **Không có khách vãng lai** — mọi chức năng cần tài khoản.

**Quy tắc nghiệp vụ dùng xuyên suốt Epic (ghi ở đây để mọi Task dùng chung):**
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

**Danh sách Story:**
| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST06.1](../story/ST06.1-guard-xac-thuc-api-dang-ky-va-xac-minh-email.md) | Guard xác thực API, đăng ký và xác minh email | 2 | 5 |
| [ST06.2](../story/ST06.2-dang-nhap-bang-username-phien-30-ngay-phien-tam-dang-xuat.md) | Đăng nhập bằng username, phiên 30 ngày/phiên tạm, đăng xuất | 3 | 8 |
| [ST06.3](../story/ST06.3-quen-mat-khau-dat-lai-va-chon-username-lan-dau.md) | Quên mật khẩu, đặt lại và chọn username lần đầu | 3 | 5 |
| [ST06.4](../story/ST06.4-dang-nhap-google-tai-nguyen-ngoai.md) | Đăng nhập Google (tài nguyên ngoài) | 3 | 3 |

**Tiêu chí hoàn thành Epic:** các luồng tài khoản chạy thật trên Supabase local (email vào hộp thư local cổng 54324); Google chạy thật với OAuth client của nhóm hoặc ghi `BLOCKED_EXTERNAL` đúng quy định.
