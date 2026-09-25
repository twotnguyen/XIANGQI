# PHẠM VI DỰ ÁN

**ID:** `SCP` · **Trạng thái:** v1 · **Cập nhật:** 2026-09-21
**Nguồn:** [../07-decisions/interview-log.md](../07-decisions/interview-log.md) (24 quyết định) + [../07-decisions/decision-log.md](../07-decisions/decision-log.md) (DEC-001…017)

---

## 1. TRONG PHẠM VI

### 1.1 Danh mục yêu cầu

| ID | Nội dung bắt buộc | Nguồn |
|---|---|---|
| **R01** | Username/password; email đăng ký + xác minh + khôi phục; đăng nhập Google | Câu 14, 15 |
| **R02** | Hồ sơ tên hiển thị; kết bạn; trạng thái online; mời chơi trong ứng dụng | Câu 16 |
| **R03** | Tạo phòng; hai ghế chơi; sẵn sàng; link và mã mời | Đề gốc |
| **R04** | Ba chế độ riêng tư; tối đa 5 người xem; kiểm tra quyền và thu hồi | Câu 7 |
| **R05** | Bàn gỗ, quân chữ Hán; đủ luật di chuyển và an toàn tướng | Câu 19 |
| **R06** | Máy chủ quyết định; lưu bền vững; chống trùng lệnh; đồng bộ lại | Đề gốc |
| **R07** | Luật giản lược: hết nước là thua; lặp 3 lần là hoà | Câu 11 |
| **R08** | Không giới hạn hoặc 5/10/15 phút mỗi bên; **mặc định không giới hạn** | Câu 12 |
| **R09** | Mất mạng 60 giây; đồng hồ vẫn chạy; lỗi máy chủ/cả hai offline không chọn người thắng | Câu 13 |
| **R10** | Kênh **riêng** người chơi (chỉ 2 người chơi) + **kênh chung** (người xem **và** người chơi đọc/gửi), người chơi có công tắc ẩn/hiện độc lập | Câu 8 · `DEC-018` |
| **R11** | Camera và mic độc lập; mỗi người tự chọn Tắt / Chỉ đối thủ / Đối thủ và người xem | Câu 9, 10 |
| **R12** | AI tự viết; 3 cấp với ngân sách 300/1000/3000 ms | Câu 4, 23 |
| **R13** | Đầu hàng; xin hoà; xin đi lại có chấp nhận; đi lại với máy; không hoàn thời gian | Câu 17, 18 |
| **R14** | Tái đấu đổi bên; lịch sử ván và xem lại từng nước | Câu 17 |
| **R15** | Máy tính và điện thoại; chat/media thu gọn trên điện thoại | Câu 20 |
| **R16** | Chạy thật ở local; hướng dẫn triển khai online; test hồi quy/tải/media; hồ sơ bảo vệ | Câu 1, 6 |
| **R17** | **Chống treo ván**: cảnh báo 3 phút → xác nhận → đếm ngược 30 giây | `DEC-002` ⭐ MỚI |
| **R18** | **Đuổi người xem** cụ thể; chặn vào lại trong phòng đó | `DEC-004` ⭐ MỚI |
| **R19** | **Hộp thư lời mời** với chỉ báo số lượng | `DEC-008` ⭐ MỚI |

⭐ = phát sinh từ đợt audit BA 2026-09-21.

### 1.2 Ràng buộc bắt buộc

| Ràng buộc | Giá trị |
|---|---|
| Sức chứa phòng | **2 người chơi + tối đa 5 người xem = 7** |
| Không hỗ trợ khách vãng lai | Mọi chức năng cần tài khoản đã đăng nhập |
| Một tài khoản | Chỉ thuộc **một** phòng tại một thời điểm |
| Nhiều tab | Chỉ **một** tab được thao tác |
| Ngôn ngữ giao diện | **Tiếng Việt** |
| Nền tảng | Website chạy trên trình duyệt |
| Media | **Chỉ trực tiếp** — không ghi, không lưu, không phát lại |

---

## 2. NGOÀI PHẠM VI

> Đây là những thứ **cố ý không làm**. Không phải quên, không phải "để sau" — trừ khi ghi rõ.

### 2.1 Không làm — đã có quyết định

| Hạng mục | Căn cứ | Ghi chú |
|---|---|---|
| Bảng xếp hạng / điểm Elo | Câu 22 | Không tạo issue trong đợt này |
| Giải đấu | Câu 22 | Không có yêu cầu bổ sung |
| Thanh toán / tính phí | Câu 22 | |
| Ghi âm, ghi hình, phát lại cuộc gọi | Câu 21 | **Chỉ** media trực tiếp. Không đưa vào roadmap |
| Ứng dụng cài đặt (iOS/Android native) | Câu 20 | Chỉ web responsive |
| Chat riêng ngoài phòng (nhắn tin bạn bè) | Câu 16 | Kết bạn chỉ để mời chơi |
| Dùng engine cờ có sẵn (Pikafish…) | Câu 4 | AI **phải tự viết** — là nội dung bảo vệ |
| Tự huấn luyện mạng nơ-ron | Câu 4 | Dùng minimax + alpha-beta |
| Chống gian lận bằng engine | Đề gốc | Không phát hiện người chơi dùng máy hỗ trợ |
| Khách vãng lai xem phòng | `DEC-006` | Mọi chức năng cần tài khoản |
| Chuyển quyền chủ phòng | Spec v1 | Chủ phòng cố định từ lúc tạo |
| Đổi username sau khi chọn | Spec v1 | Username bất biến. Tên hiển thị thì sửa được |
| Đổi email | Spec v1 | |
| Xoá tài khoản | Spec v1 | **Cần quyết định riêng trước khi mở công khai** |
| Danh sách chặn toàn hệ thống | `DEC-015` | Chặn chỉ trong phạm vi một phòng |
| Chống treo ván ở ván có đồng hồ | `DEC-010` | Đã có luật hết giờ |
| Chống treo ván ở ván với máy | `DEC-012` | Không có ai đang chờ |
| Bộ luật WXF đầy đủ | Câu 11 | Dùng luật giản lược, ghi rõ cho người chơi |
| Phân xử chiếu dai / đuổi dai | Câu 11 | Áp dụng luật lặp 3 lần |
| Cộng giây sau mỗi nước | Câu 12 | Thời gian là ngân sách cả ván |
| Đổi quân Hán sang chữ Việt | Câu 19 | Chỉ chữ Hán |
| Trình biên tập cây biến thể | Spec v1 | Xem lại chỉ theo nhánh hiệu lực |
| Nhập thế cờ tuỳ ý | Spec v1 | Fixture chỉ dùng trong test |
| Chạy nhiều máy chủ song song | Spec v1 | Một máy chủ trong bản này |

### 2.2 Cố ý KHÔNG hứa

| Hạng mục | Lý do |
|---|---|
| Thu hồi media **tức thời** bất kể mạng | Hệ phân tán không bảo đảm được. Chỉ chặn **cấp phát và luồng mới** |
| Ngăn người nhận quay màn hình / ghi lại | Người đã nhận hình/tiếng có thể ghi bằng công cụ khác. Không đặt mục tiêu chống |
| Quy đổi cấp AI ra Elo | Mẫu thử nhỏ, không đủ cơ sở thống kê |
| Giữ ván khi máy chủ khởi động lại | Ván chuyển **gián đoạn**, không ai thắng |
| 10 phòng video đồng thời | Chỉ nghiệm thu **1 phòng** đủ 2 phát + 5 xem |

---

## 3. RANH GIỚI DỄ HIỂU LẦM

| Câu hỏi thường gặp | Trả lời |
|---|---|
| Người xem có xem được camera người chơi không? | **Có, nếu** người chơi đó chọn mức "Đối thủ và người xem". Từng người tự quyết, không cần cả hai đồng ý |
| Chủ phòng có bật được camera đối thủ không? | **Không.** Không ai điều khiển media của người khác |
| Người chơi đọc được chat người xem không? | **Có** — đó là **kênh chung**, người chơi còn gửi được. Mỗi người chơi tự ẩn/hiện. Nhưng người xem **không** đọc được kênh **riêng** của người chơi (`DEC-018`) |
| Người xem thành người chơi được không? | **Không tại chỗ.** Phải rời phòng rồi vào lại bằng lời mời/mã chơi |
| Phòng khoá thì mời chơi còn dùng được không? | **Còn.** Khoá chỉ chặn **người xem**, ghế chơi trống vẫn mời được |
| Xin đi lại có hoàn lại thời gian không? | **Không.** Chỉ khôi phục bàn cờ và lượt |
| Tái đấu là ván cũ chơi tiếp à? | **Không.** Tạo **ván mới**, đổi bên, giữ cấu hình thời gian |
| Ván gián đoạn có chơi tiếp được không? | **Không.** Nhưng tạo được ván mới |
| Bị đuổi khỏi phòng là bị cấm cả hệ thống? | **Không.** Chỉ chặn trong **phòng đó**, tới khi phòng đóng |

---

## 4. ĐIỀU KIỆN BÊN NGOÀI

Những thứ **không phải thiếu đặc tả** mà là phụ thuộc tài nguyên bên ngoài. Thiếu chúng **không chặn** phát triển và kiểm thử ở local:

| Hạng mục | Cần cho |
|---|---|
| Tài khoản Google Cloud (OAuth) | Đăng nhập Google trên domain thật |
| Dịch vụ truyền media công cộng | Camera/mic giữa hai mạng khác nhau |
| Dịch vụ gửi email riêng | Gửi email xác minh cho nhiều người ngoài nhóm |
| Hai thiết bị thật, hai mạng khác nhau | Nghiệm thu camera/mic thực tế |
| Tài khoản hạ tầng triển khai | Đưa lên Internet |

**Quy tắc:** thiếu tài nguyên bên ngoài ⇒ ghi **chờ**, **không** đánh dấu đã kiểm chứng, và **không** thay bằng giả lập rồi báo đạt.

---

## 5. TIÊU CHÍ HOÀN THÀNH

| Mốc | Điều kiện |
|---|---|
| **Local đầy đủ** | R01–R19 chạy thật trên máy local, có test tự động kèm bằng chứng |
| **Online** | Đưa lên Internet; đăng nhập Google thật; email thật; camera/mic qua hai mạng |
| **Bảo vệ đồ án** | Giải thích được thuật toán AI tự viết kèm số đo tái lập được |

**Mục tiêu đo được:**

| Chỉ tiêu | Giá trị |
|---|---|
| Xử lý lệnh (p95) | < 100 ms |
| Trọn vòng client→server→client | < 500 ms khi độ trễ mạng < 100 ms |
| Đồng bộ lại sau khi mạng ổn định | < 5 giây |
| Tải thử | 10 phòng × 7 thành viên = 70 kết nối + 2 ván với máy |
| Tải media | 1 phòng: 2 người phát + 5 người xem |
