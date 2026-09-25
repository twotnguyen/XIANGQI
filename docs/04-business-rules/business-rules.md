# LUẬT NGHIỆP VỤ — DANH MỤC TẬP TRUNG

**ID:** `BR` · **Trạng thái:** v1 · **Cập nhật:** 2026-09-21

Đây là **mục lục tra cứu** mọi luật nghiệp vụ của hệ thống. Mỗi luật được **định nghĩa đầy đủ ở đúng một tài liệu**; bảng này chỉ tóm tắt và chỉ đường.

**Quy ước ID:** `BR-<MODULE>-<số>` — ví dụ `BR-SPEC-11` là luật số 11 của người xem.

---

## 1. NHỮNG LUẬT QUAN TRỌNG NHẤT

Nếu chỉ đọc được 12 luật, đọc 12 luật này:

| ID | Luật | Chi tiết |
|---|---|---|
| **BR-MAT-04** | **Máy chủ là nguồn sự thật duy nhất.** Client chỉ gửi ý định | [REQ-MATCH](../01-requirements/REQ-MATCH.md) |
| **BR-CHT-02** | **Người xem không bao giờ** đọc/gửi được **kênh riêng người chơi** | [REQ-CHAT](../01-requirements/REQ-CHAT.md) |
| **BR-MED-03** | Quyền camera/mic thuộc **người phát**; không ai bật thay ai | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) |
| **BR-ROOM-01** | **2 người chơi + tối đa 5 người xem** = 7 thành viên | [REQ-ROOM](../01-requirements/REQ-ROOM.md) |
| **BR-ROOM-07** | Một tài khoản chỉ ở **một phòng** tại một thời điểm | [REQ-ROOM](../01-requirements/REQ-ROOM.md) |
| **BR-DIS-12** | Mọi tab đã xác thực đều thao tác được; ngoại lệ media theo từng nguồn | [REQ-DISCONNECT](../01-requirements/REQ-DISCONNECT.md) |
| **BR-ROOM-09** | Rời phòng khi **đang chơi = đầu hàng** | [REQ-ROOM](../01-requirements/REQ-ROOM.md) |
| **GR-END-01** | **Hết nước đi hợp lệ là THUA**, dù có đang bị chiếu hay không | [game-rules](game-rules.md) |
| **GR-END-02** | Cùng thế cờ + cùng lượt **lần thứ ba ⇒ hoà** | [game-rules](game-rules.md) |
| **BR-MAT-10** | Đếm lặp **chỉ** trên nhánh đang có hiệu lực | [REQ-MATCH](../01-requirements/REQ-MATCH.md) |
| **BR-DIS-05** | Cả hai mất mạng ⇒ **gián đoạn, không ai thắng** | [REQ-DISCONNECT](../01-requirements/REQ-DISCONNECT.md) |
| **BR-AUTH-09** | **Không hỗ trợ khách** — mọi chức năng cần tài khoản | [REQ-AUTH](../01-requirements/REQ-AUTH.md) |

---

## 2. DANH MỤC THEO MODULE

| Tiền tố | Module | Số luật | Tài liệu định nghĩa |
|---|---|:---:|---|
| `GR-*` | **Luật cờ** (toạ độ, di chuyển, kết thúc) | 18 | [game-rules.md](game-rules.md) |
| `BR-AUTH-*` | Tài khoản, đăng nhập, phiên | 22 | [REQ-AUTH](../01-requirements/REQ-AUTH.md) |
| `BR-FRD-*` | Hồ sơ, bạn bè, trạng thái online | 13 | [REQ-PROFILE-FRIENDS](../01-requirements/REQ-PROFILE-FRIENDS.md) |
| `BR-LOB-*` | Sảnh | 10 | [REQ-LOBBY](../01-requirements/REQ-LOBBY.md) |
| `BR-ROOM-*` | Phòng, ghế, sẵn sàng, vòng đời | 24 | [REQ-ROOM](../01-requirements/REQ-ROOM.md) |
| `BR-INV-*` | Mời, mã, link, hộp thư | 19 | [REQ-INVITE](../01-requirements/REQ-INVITE.md) |
| `BR-SPEC-*` | Người xem, thu hồi, **đuổi** | 20 | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) |
| `BR-BRD-*` | Bàn cờ, thao tác, trợ năng | 15 | [REQ-BOARD](../01-requirements/REQ-BOARD.md) |
| `BR-MAT-*` | Ván, đồng bộ, chống trùng lệnh | 16 | [REQ-MATCH](../01-requirements/REQ-MATCH.md) |
| `BR-CLK-*` | Đồng hồ | 17 | [REQ-CLOCK](../01-requirements/REQ-CLOCK.md) |
| `BR-INA-*` | **Chống treo ván** | 15 | [REQ-INACTIVITY](../01-requirements/REQ-INACTIVITY.md) |
| `BR-DIS-*` | Mất kết nối, nối lại, nhiều tab | 19 | [REQ-DISCONNECT](../01-requirements/REQ-DISCONNECT.md) |
| `BR-ACT-*` | Đầu hàng, xin hoà, xin đi lại | 18 | [REQ-GAME-ACTIONS](../01-requirements/REQ-GAME-ACTIONS.md) |
| `BR-CHT-*` | Chat hai kênh | 29 | [REQ-CHAT](../01-requirements/REQ-CHAT.md) |
| `BR-MED-*` | Camera, micro, mức chia sẻ | 25 | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) |
| `BR-AI-*` | Chơi với máy + yêu cầu học thuật | 31 | [REQ-AI](../01-requirements/REQ-AI.md) |
| `BR-HIS-*` | Tái đấu, lịch sử, xem lại | 22 | [REQ-HISTORY-REMATCH](../01-requirements/REQ-HISTORY-REMATCH.md) |

**Tổng: 315 BR và 18 GR.** Tra từng ID trong [registry](../06-acceptance/requirement-register.md); không cộng bản tóm tắt lặp lại.

---

## 3. TRA NHANH THEO CON SỐ

Mọi con số cố định của hệ thống, gom một chỗ:

### Sức chứa

| Giá trị | Con số | Luật |
|---|---|---|
| Người chơi mỗi phòng | **2** | `BR-ROOM-01` |
| Người xem tối đa | **5** | `BR-SPEC-02` |
| Tổng thành viên | **7** | `BR-ROOM-01` |
| Phòng mỗi tài khoản | **1** | `BR-ROOM-07` |
| Tab thao tác mỗi tài khoản | **Không khoá vào một tab** | `BR-DIS-12` |
| Ván với máy mỗi tài khoản | **1** | `BR-AI-15` |

### Thời gian

| Giá trị | Con số | Luật |
|---|---|---|
| Cấu hình đồng hồ | **0 (mặc định) / 5 / 10 / 15 phút** | `BR-CLK-03` |
| Ân hạn mất kết nối (người chơi) | **60 giây** | `BR-DIS-01` |
| Giữ ghế người xem khi mất mạng | **15 giây** | `BR-SPEC-04` |
| **Ngưỡng treo ván** | **3 phút** | `BR-INA-01` |
| **Gia hạn mỗi lần** | **3 phút** | `BR-INA-02` |
| **Số lần gia hạn liên tiếp** | **2** | `BR-INA-03` |
| **Đếm ngược cuối** | **30 giây** | `BR-INA-05` |
| Hết hạn đề nghị hoà / đi lại | **30 giây** | `BR-ACT-05` |
| Giới hạn tần suất đề nghị | **1 / 10 giây / người** | `BR-ACT-06` |
| Hết hạn lời mời trực tiếp | **10 phút** | `BR-INV-03` |
| Hết hạn mã / link | **24 giờ** | `BR-INV-04` |
| Phòng đã xong sống thêm | **10 phút** | `BR-ROOM-12` |
| Phiên "ghi nhớ đăng nhập" | **30 ngày trượt** | `BR-AUTH-10` |
| Lưu tin chat | **30 ngày** | `BR-CHT-07` |

### Giới hạn nội dung

| Giá trị | Con số | Luật |
|---|---|---|
| Username | **3–24** ký tự, `a-z0-9_` | `BR-AUTH-01` |
| Tên hiển thị | **1–40** ký tự | `BR-AUTH-04` |
| Mật khẩu | **10–128** ký tự | `BR-AUTH-05` |
| Tên phòng | **1–60** ký tự | `BR-ROOM-15` |
| Tin nhắn chat | **1–1000** ký tự | `BR-CHT-04` |
| Mã phòng | **8** ký tự (bảng 32 ký tự) | `BR-INV-05` |
| Tần suất chat | **5 tin / 10 giây** | `BR-CHT-05` |
| Tìm người dùng | tối thiểu **3** ký tự, ≤ **20** kết quả | `BR-FRD-04` |
| Phân trang chat | **50** tin | `BR-CHT-06` |
| Phân trang sảnh / lịch sử | **20** | `BR-LOB-03`, `BR-HIS-19` |

### Máy (AI)

| Cấp | Ngân sách | Độ sâu | Luật |
|---|---|---|---|
| Dễ | **300 ms** | 2 | `BR-AI-04` |
| Trung bình | **1000 ms** | 4 | `BR-AI-04` |
| Khó | **3000 ms** | 6 | `BR-AI-04` |

---

## 4. NHÓM LUẬT THEO CHỦ ĐỀ XUYÊN SUỐT

### 4.1 Riêng tư

| ID | Luật |
|---|---|
| `BR-CHT-02` | Người xem **không** đọc được kênh riêng người chơi. *(Chiều ngược lại đã mở — `DEC-018`)* |
| `BR-MED-03` | Không ai bật media thay người khác |
| `BR-AUTH-07` | Email không lộ ở hồ sơ hay tìm kiếm |
| `BR-FRD-07` | Bạn bè chỉ biết online/offline, **không** biết đang ở phòng nào |
| `BR-HIS-12` `BR-HIS-13` | Lịch sử ván chỉ người chơi của ván đó xem được |
| `BR-INV-12` | Mã bí mật không lẫn vào dữ liệu công khai, không ghi log |
| `BR-MAT-14` | Dữ liệu gửi cho client không chứa mã bí mật, email, phiên |
| `BR-SPEC-03` `BR-INV-13` `BR-LOB-*` | Lỗi từ chối **không tiết lộ** phòng có tồn tại hay không |

### 4.2 Công bằng — không thua oan

| ID | Luật |
|---|---|
| `BR-DIS-05` | Cả hai mất mạng ⇒ gián đoạn, không ai thắng |
| `BR-DIS-06` | Máy chủ khởi động lại ⇒ gián đoạn, không ai thắng |
| `BR-AI-03` | Không xử người chơi thua vì lỗi máy |
| `BR-DIS-15` `BR-AI-11` | Ván với máy: quá 60 giây mất mạng ⇒ gián đoạn nếu chưa có kết quả/deadline trước đó; đồng hồ hết trước vẫn TIMEOUT |
| `BR-MED-15` | Từ chối quyền camera/mic **không chặn** việc đánh cờ |
| `BR-AUTH-*` | Dịch vụ xác thực lỗi **không** làm mất ván ngay |

### 4.3 Chống gian lận và lạm dụng

| ID | Luật |
|---|---|
| `BR-MAT-04` | Máy chủ phân xử mọi thứ |
| `BR-BRD-07` | Gợi ý nước đi ở client chỉ hỗ trợ; máy chủ kiểm lại |
| `BR-MAT-06` `BR-MAT-07` | Mỗi lệnh có mã duy nhất; chống gửi trùng và chống sửa nội dung |
| `BR-ROOM-11` | Đang chơi: không đuổi đối thủ, không sửa đồng hồ, không ép kết quả |
| `BR-INA-03` | Giới hạn gia hạn — chặn treo ván vô hạn |
| `BR-SPEC-11` | Người bị đuổi không vào lại được phòng đó |
| `BR-ACT-06` `BR-CHT-05` `BR-AUTH-*` | Giới hạn tần suất cho đề nghị, chat, đăng nhập |
| `BR-CHT-13` | Nội dung người dùng hiện dạng chữ, không thực thi |

### 4.4 Trung thực về giới hạn

| ID | Luật |
|---|---|
| `BR-MED-04` | Chưa thu hồi xong ⇒ **không** báo đã bảo vệ thành công |
| `BR-MED-17` | Nói rõ micro có thể thu lại tiếng loa đối thủ |
| `BR-AI-02` | Không quy đổi cấp độ máy ra Elo |
| `BR-AI-30` | Báo cáo thực nghiệm phải ghi cả kết quả bất lợi |
| `GR-*` | Hiển thị rõ đây là **luật giản lược** trước khi chơi |

---

## 5. NĂM LUẬT SINH RA TỪ LỖI LẦN TRƯỚC

Đợt xây dựng trước để lại 30 lỗi đã được ghi nhận ([99-archive/reviews-v1/](../99-archive/reviews-v1/)). Năm luật sau **tồn tại chính vì những lỗi đó**:

| ID | Luật | Lỗi từng xảy ra |
|---|---|---|
| `BR-MAT-09` | Lịch sử nước đi **chỉ thêm, không xoá**; nhiều nhánh từ cùng một điểm | Đi nước mới sau khi đi lại luôn gây lỗi trùng khoá |
| `BR-MAT-10` | Đếm lặp **chỉ** trên nhánh hiệu lực | Đếm cả nhánh đã bỏ ⇒ báo hoà sai |
| `BR-LOB-08` `BR-SPEC-03` | Kiểm quyền **ở mọi đường vào** | Vào theo mã phòng bỏ qua kiểm tra chế độ riêng tư |
| `BR-MED-06` `BR-SPEC-06` | Thu hồi phải **thực thi tại hạ tầng**, kiểm bằng luồng dữ liệu thật | Thu hồi quyền người xem là code chết, không chạy |
| `BR-INA-*` `BR-CLK-*` `BR-ACT-05` | Mọi thời hạn cần **bộ đếm chủ động** | 15 |

---

## 6. LIÊN QUAN

| Nội dung | Tài liệu |
|---|---|
| Luật cờ đầy đủ | [game-rules.md](game-rules.md) |
| Ai được làm gì | [permissions.md](permissions.md) |
| Chi tiết từng luật | [../01-requirements/](../01-requirements/) |
| Vì sao quyết như vậy | [../07-decisions/decision-log.md](../07-decisions/decision-log.md) |
| Cách kiểm chứng | [../06-acceptance/](../06-acceptance/) |
