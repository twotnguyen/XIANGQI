# TRIỂN KHAI

**ID:** `DEP` · **Trạng thái:** v1 · **Cập nhật:** 2026-09-21
**Căn cứ:** Câu 6 phỏng vấn (chạy máy cá nhân trước, sau đó đưa lên Internet)

---

## 1. HAI MỐC

| Mốc | Mục tiêu | Chặn bởi |
|---|---|---|
| **Máy cá nhân** | AC **local** của R01–R19 chạy thật; Google/SMTP Internet/two-network media nghiệm thu riêng ở053/137 | **Không** bị chặn bởi tài nguyên bên ngoài |
| **Internet** | Đăng nhập Google thật · email thật · camera/mic qua **hai mạng** | Cần tài khoản dịch vụ bên ngoài |

**`DEP-01`** — Thiếu tài nguyên bên ngoài **chỉ** chặn mốc Internet. **Không** chặn phát triển và kiểm thử ở máy cá nhân.

---

## 2. CHẠY Ở MÁY CÁ NHÂN

Cần chạy được **toàn bộ phạm vi local** không phụ thuộc dịch vụ trả phí. Không coi Google OAuth thật hoặc SMTP Internet là đã đạt bằng local; báo riêng CHỜ ở053/137 theo DEC-047:

| Thành phần | Chạy local |
|---|---|
| Giao diện | Máy chủ phát triển |
| Máy chủ trò chơi | Tiến trình local |
| Cơ sở dữ liệu + xác thực | Supabase bản local |
| Email xác minh | Hộp thư local của Supabase |
| Máy chuyển tiếp media | Bản tự dựng local |
| Máy (AI) | Tiến trình riêng local |

**`DEP-02`** — Người mới **clone về là chạy được** theo hướng dẫn, không phụ thuộc trạng thái máy người viết.

**`DEP-03`** — **Đăng nhập Google** cần mạng và cấu hình thật — **không** giả lập rồi báo đạt.

### Camera/mic trên điện thoại trong mạng nội bộ

Trình duyệt **chỉ** cho truy cập camera/mic ở **ngữ cảnh an toàn**. Mở bằng địa chỉ IP nội bộ **không** phải ngữ cảnh an toàn ⇒ camera **không hoạt động**. Phải dùng kết nối an toàn mà thiết bị tin tưởng.

---

## 3. ĐƯA LÊN INTERNET

| Thành phần | Nơi đặt | Lưu ý |
|---|---|---|
| Giao diện | Dịch vụ lưu trữ trang tĩnh | Mọi đường dẫn trỏ về trang chính |
| **Máy chủ trò chơi + AI child** | **Một** dịch vụ tiến trình dài khi thức | Backend spawn child qua IPC, hai PID; Socket.IO cùng backend; không cần dịch vụ AI thứ hai (`ARCH-16`) |
| Cơ sở dữ liệu + xác thực | Supabase bản đám mây | |
| **Máy chuyển tiếp media** | Dịch vụ chuyên dụng, hoặc máy có đủ cổng mạng | **Không** đặt chung với máy chủ trò chơi |

**`DEP-04`** — Máy chủ trò chơi cần tiến trình **sống lâu**, **không** dùng mô hình hàm chạy theo yêu cầu — kết nối thời gian thực cần tiến trình bền.

**`DEP-05`** — Hồ sơ mặc định **DEMO_SLEEP_ALLOWED** (DEC-046): chấp nhận backend ngủ/restart, không cam kết always-on hoặc tiếp tục ván qua lần chạy mới. Khi thức lại, ván đang ACTIVE từ lần chạy cũ thành **INTERRUPTED**, lịch sử còn, không xử thua vì thời gian server ngừng. Công bố giới hạn trong UI/runbook. Không dùng ping giả chống ngủ, không tự mua gói trả phí. T137-11 quan sát idle20phút và ép stop/start nếu dịch vụ không tự ngủ; phải chứng minh interruption đúng, không yêu cầu socket sống liên tục. Hiệu năng khi thức vẫn giữ nguyên mọi ngưỡng.

**`DEP-06`** — Đăng nhập **không** dùng cookie liên miền giữa hai dịch vụ khác nhau. Dùng khoá gửi kèm mỗi yêu cầu.

---

## 4. CẤU HÌNH BÍ MẬT

| ID | Luật |
|---|---|
| **DEP-07** | Khoá bí mật của máy chủ **không bao giờ** đưa vào gói giao diện — mọi thứ trong đó người dùng đọc được |
| **DEP-08** | Tệp cấu hình mẫu chỉ chứa **giá trị mẫu**, **không** chứa bí mật thật |
| **DEP-09** | Thiếu cấu hình bắt buộc ⇒ **dừng ngay với lỗi rõ ràng**, **không** in giá trị bí mật ra nhật ký |
| **DEP-10** | Khoá bí mật **không** ghi vào nhật ký, **không** gửi cho trình duyệt |

---

## 5. TÀI NGUYÊN BÊN NGOÀI CẦN CÓ

| Cần gì | Cho việc gì | Thiếu thì sao |
|---|---|---|
| Tài khoản Google Cloud (OAuth) | Đăng nhập Google trên tên miền thật | Chặn `TS-MAN-01` |
| Dịch vụ gửi email riêng | Gửi email cho nhiều người ngoài nhóm | Chặn `TS-MAN-02` |
| Dịch vụ chuyển tiếp media | Camera/mic qua hai mạng khác nhau | Chặn `TS-MAN-03` |
| **Hai điện thoại thật, hai mạng** | Nghiệm thu camera/mic | Chặn `TS-MAN-03` |
| Tài khoản dịch vụ triển khai | Đưa lên Internet | Chặn toàn bộ mốc Internet |

**`DEP-11`** — **Không** tự mua dịch vụ trả phí. Dùng tài nguyên người dùng cấp.

**`DEP-12`** — Thiếu tài nguyên ⇒ ghi **chờ**, **không** đánh dấu đạt, **không** thay bằng giả lập (`AC-RULE-01`, `AC-RULE-02`).

---

## 6. CƠ SỞ DỮ LIỆU

| ID | Luật |
|---|---|
| **DEP-13** | Thay đổi cấu trúc dữ liệu đi theo **các bước có thứ tự**, chạy lại được từ đầu. Do **Supabase CLI** quản lý bằng file `.sql`; Prisma chỉ `db pull`, **không bao giờ** `prisma migrate` (`TECH-07`) |
| **DEP-14** | Lệnh **xoá sạch dữ liệu** chỉ chạy trên bản **local đã xác nhận**; không chắc thì **dừng trước khi chạy** |
| **DEP-15** | **Tuyệt đối không** xoá sạch cơ sở dữ liệu đang phục vụ người dùng thật |
| **DEP-16** | Trình duyệt **không** truy cập thẳng bảng dữ liệu; có lớp chặn mặc định phòng khi khoá công khai bị dùng sai |

---

## 7. KIỂM TRA TRƯỚC KHI COI LÀ XONG

### Mốc máy cá nhân

- [ ] Clone sạch → chạy được theo đúng hướng dẫn
- [ ] Mọi AC local R01–R19 chạy thật, **0 test bị bỏ qua**; AC Google/SMTP Internet/hai mạng chưa chạy ghi CHỜ ở053/137 riêng
- [ ] Kiểm thử dữ liệu chạy trên **dịch vụ thật**
- [ ] Kiểm thử camera/mic đo **luồng dữ liệu thật**
- [ ] Thử tải 10 phòng / 70 kết nối đạt chỉ tiêu
- [ ] Bộ thử của máy (AI) có số đo **tái lập được**
- [ ] Khởi động lại máy chủ ⇒ ván **gián đoạn** đúng như thiết kế

### Mốc Internet

- [ ] Hồ sơ DEMO_SLEEP_ALLOWED đã công bố, T137-11 chứng minh gián đoạn/khôi phục lịch sử đúng
- [ ] Kết nối an toàn hoạt động
- [ ] Đăng nhập Google **thật**
- [ ] Email xác minh và khôi phục **thật**
- [ ] Kết nối thời gian thực qua **hai mạng khác nhau**
- [ ] Camera/mic giữa **hai thiết bị thật, hai mạng**
- [ ] Thiếu cấu hình ⇒ báo lỗi rõ, **không lộ bí mật**

---

## 8. LIÊN QUAN

[architecture.md](architecture.md) · [tech-stack.md](tech-stack.md) · [../06-acceptance/test-scenarios.md](../06-acceptance/test-scenarios.md)
