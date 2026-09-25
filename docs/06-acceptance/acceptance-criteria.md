# TIÊU CHÍ NGHIỆM THU — TỔNG HỢP

**ID:** `AC` · **Trạng thái:** v1 · **Cập nhật:** 2026-09-21

Danh mục tra cứu mọi tiêu chí nghiệm thu. Chi tiết từng tiêu chí nằm trong tài liệu yêu cầu tương ứng.

---

## 1. TỔNG SỐ THEO MODULE

| Nhóm | Số tiêu chí | Tài liệu |
|---|:---:|---|
| `AC-AUTH-*` Tài khoản | 23 | [REQ-AUTH](../01-requirements/REQ-AUTH.md) |
| `AC-FRD-*` Bạn bè | 15 | [REQ-PROFILE-FRIENDS](../01-requirements/REQ-PROFILE-FRIENDS.md) |
| `AC-LOB-*` Sảnh | 12 | [REQ-LOBBY](../01-requirements/REQ-LOBBY.md) |
| `AC-ROOM-*` Phòng | 27 | [REQ-ROOM](../01-requirements/REQ-ROOM.md) |
| `AC-INV-*` Mời | 21 | [REQ-INVITE](../01-requirements/REQ-INVITE.md) |
| `AC-SPEC-*` Người xem | 24 | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) |
| `AC-BRD-*` Bàn cờ | 15 | [REQ-BOARD](../01-requirements/REQ-BOARD.md) |
| `AC-MAT-*` Ván | 17 | [REQ-MATCH](../01-requirements/REQ-MATCH.md) |
| `AC-CLK-*` Đồng hồ | 15 | [REQ-CLOCK](../01-requirements/REQ-CLOCK.md) |
| `AC-INA-*` **Chống treo ván** | 16 | [REQ-INACTIVITY](../01-requirements/REQ-INACTIVITY.md) |
| `AC-DIS-*` Mất kết nối | 18 | [REQ-DISCONNECT](../01-requirements/REQ-DISCONNECT.md) |
| `AC-ACT-*` Thao tác trong ván | 20 | [REQ-GAME-ACTIONS](../01-requirements/REQ-GAME-ACTIONS.md) |
| `AC-CHT-*` Chat | 28 | [REQ-CHAT](../01-requirements/REQ-CHAT.md) |
| `AC-MED-*` Camera/mic | 23 | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) |
| `AC-AI-*` Chơi với máy | 19 | [REQ-AI](../01-requirements/REQ-AI.md) |
| `AC-HIS-*` Tái đấu/lịch sử | 22 | [REQ-HISTORY-REMATCH](../01-requirements/REQ-HISTORY-REMATCH.md) |
| `AC-SS-*` Phiên và tab | 18 | [session-state](../05-data-and-realtime/session-state.md) |

**Tổng: 333 tiêu chí nghiệm thu có ID.** Đây là số đặc tả, chưa phải test đã PASS; xem [registry](requirement-register.md).

---

## 2. BỐN LOẠI KIỂM THỬ

| Loại | Nghĩa | Dùng cho |
|---|---|---|
| **Đơn vị** | Hàm thuần, không có mạng/dữ liệu | Luật cờ · thuật toán máy · tính đồng hồ |
| **Tích hợp** | Chạy trên **dịch vụ thật** | Quyền · tranh chấp · vòng đời ván · chat |
| **Đầu-cuối** | Trình duyệt thật, nhiều phiên | Luồng người dùng · realtime · giao diện |
| **Thủ công** | Người thật + thiết bị thật | Camera/mic · đăng nhập Google · hai mạng khác nhau |

---

## 3. NĂM QUY TẮC KIỂM THỬ BẮT BUỘC

| # | Quy tắc | Vì sao |
|---|---|---|
| **1** | Kiểm thử thời gian dùng **đồng hồ giả tiêm vào**, **không** chờ thật | Chờ thật làm test chậm và không ổn định |
| **2** | Kiểm thử tranh chấp phải có **rào đồng bộ** và **hai kết nối riêng** | Không có rào thì không tái hiện được tranh chấp |
| **3** | Mọi ô ❌ trong [ma trận quyền](../04-business-rules/permissions.md) phải có kiểm thử **giả mạo dữ liệu gửi lên** | Kiểm nút bị vô hiệu là **chưa đủ** |
| **4** | Kiểm thử camera/mic phải đo **luồng dữ liệu thật**, không chỉ nhìn giao diện | Lần trước thu hồi quyền là code chết mà test vẫn xanh |
| **5** | Kiểm thử dữ liệu phải chạy trên **dịch vụ thật**, **không** dùng giả lập tự đối chiếu chính nó | Lần trước test dữ liệu tự mock chính mình |

**Quy tắc 3, 4, 5 sinh ra trực tiếp từ các lỗi đã xảy ra** ở lần xây dựng trước.

---

## 4. HAI MƯƠI TIÊU CHÍ QUAN TRỌNG NHẤT

Nếu chỉ chạy được 20 kiểm thử, chạy 20 cái này:

| # | ID | Tiêu chí |
|---|---|---|
| 1 | `AC-MAT-02` | Nước đi hợp lệ ⇒ **đúng một** bản ghi và **đúng một** lần tăng phiên bản |
| 2 | `AC-MAT-04` | Gửi lại **cùng lệnh** ⇒ trả kết quả cũ, **không** đi hai nước |
| 3 | `AC-MAT-12` | **Đi được nước mới sau khi đi lại** (lỗi F-01 lần trước) |
| 4 | `AC-MAT-11` | Đếm lặp **chỉ** trên nhánh hiệu lực (lỗi F-02 lần trước) |
| 5 | `AC-CHT-01` | Kênh **riêng** người chơi ⇒ người xem **không nhận** |
| 6 | `AC-CHT-07` | **Bốn tổ hợp** ẩn/hiện của A và B hoạt động **độc lập** |
| 7 | `AC-SPEC-01` | 5 người xem vào được, người thứ **6 bị từ chối** |
| 8 | `AC-SPEC-02` | Hai người tranh ghế cuối ⇒ **đúng một** được nhận |
| 9 | `AC-SPEC-11` | Người **bị đuổi** không vào lại được bằng **mọi** đường |
| 10 | `AC-MED-07` | Thu hẹp quyền ⇒ đo **luồng thật**, người mất quyền **không nhận byte mới** |
| 11 | `AC-INA-05` | Không xác nhận ⇒ sau 30 giây **đối thủ thắng** |
| 12 | `AC-INA-06` | Gia hạn **lần 3 bị từ chối** |
| 13 | `AC-INA-07` | **Đi được một nước ⇒ reset** gia hạn |
| 14 | `AC-DIS-03` | Cả hai mất mạng ⇒ **gián đoạn, không ai thắng** |
| 15 | `AC-DIS-06` | Hết giờ và mất mạng cùng lúc ⇒ **ưu tiên hết giờ** |
| 16 | `AC-CLK-11` | Hết giờ và đầu hàng tranh nhau ⇒ **đúng một** kết quả |
| 17 | `AC-SS-02` | Mọi tab có phiên hợp lệ đều đi cờ/chat được; media có quy trình chuyển quyền riêng theo AC-MED |
| 18 | `AC-ROOM-10` | Không phải chủ phòng đổi cài đặt ⇒ **từ chối** kể cả khi giả mạo |
| 19 | `AC-AI-14` | Cắt tỉa alpha-beta **giảm tổng số nút** so với bản cơ sở |
| 20 | `AC-HIS-13` | Xem lại chỉ hiện **nhánh hiệu lực** sau khi đi lại |

---

## 5. MỐC NGHIỆM THU

| Mốc | Điều kiện |
|---|---|
| **Local đầy đủ** | Phần local của R01–R19 chạy thật với bằng chứng; Google/SMTP cloud/hai mạng khác nhau tách sang mốc Online và ghi CHỜ tại 053/137, không tính là đã đạt |
| **Online** | Đưa lên Internet · đăng nhập Google thật · email thật · camera/mic qua **hai mạng khác nhau** |
| **Bảo vệ đồ án** | Giải thích được thuật toán máy kèm số đo **tái lập được** |

### Chỉ tiêu đo được

| Chỉ tiêu | Giá trị |
|---|---|
| Xử lý lệnh (p95) | **< 100 ms** |
| Trọn vòng client → máy chủ → client | **< 500 ms** khi độ trễ mạng < 100 ms |
| Đồng bộ lại sau khi mạng ổn định | **< 5 giây** |
| Tải thử | 10 phòng × 7 thành viên = **70 kết nối** + 2 ván với máy |
| Tải media | 1 phòng: **2 người phát + 5 người xem** |

---

## 6. QUY TẮC BÁO CÁO TRUNG THỰC

| ID | Luật |
|---|---|
| **AC-RULE-01** | Thiếu tài nguyên bên ngoài ⇒ ghi **chờ**, **không** đánh dấu đã đạt |
| **AC-RULE-02** | **Không** thay giả lập cho kiểm thử cần dịch vụ thật rồi báo đạt |
| **AC-RULE-03** | Kiểm thử **bị bỏ qua** không được tính là đạt |
| **AC-RULE-04** | Số liệu bất lợi phải **ghi rõ**, không giấu |
| **AC-RULE-05** | **Không** dùng phần trăm dòng mã được kiểm thử thay cho nghiệm thu hành vi |
| **AC-RULE-06** | Máy đi nước không hợp lệ hoặc treo ⇒ **lần chạy hỏng**, không tính thành thắng |

---

## 7. LIÊN QUAN

[test-scenarios.md](test-scenarios.md) · [../01-requirements/](../01-requirements/) · [../04-business-rules/permissions.md](../04-business-rules/permissions.md) · [traceability-matrix.md](traceability-matrix.md)
