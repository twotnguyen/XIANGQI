# KỊCH BẢN KIỂM THỬ CHO QA

**ID:** `TS` · **Trạng thái:** v1 · **Cập nhật:** 2026-09-21

Các kịch bản **bắt buộc** phải chạy được, viết theo ngôn ngữ QA dùng được ngay.

---

## 1. CHUẨN BỊ

### Tài khoản thử

| Tên | Vai trò trong kịch bản |
|---|---|
| **A** | Người chơi 1 / chủ phòng |
| **B** | Người chơi 2 |
| **S1–S5** | Năm người xem |
| **S6** | Người xem thứ sáu — **dùng để kiểm bị từ chối** |

### Kịch bản đầu-cuối cần **8 phiên trình duyệt độc lập**: A · B · S1–S5 · S6.

---

## 2. LUỒNG ĐẦY ĐỦ (kịch bản xương sống)

| Bước | Hành động | Kết quả mong đợi |
|---|---|---|
| 1 | A đăng ký, xác minh email, đăng nhập | Vào sảnh |
| 2 | A tạo phòng **công khai**, thời gian **không giới hạn** | Phòng hiện ở sảnh của B |
| 3 | A mời B (đã là bạn) | B nhận lời mời |
| 4 | B chấp nhận | B vào ghế chơi, cầm **đen** |
| 5 | S1–S5 vào xem | Cả 5 vào được, hiện **5/5** |
| 6 | **S6 vào xem** | **BỊ TỪ CHỐI** — *"Phòng đã đủ người xem"* |
| 7 | A và B bấm sẵn sàng | Ván bắt đầu, **ĐỎ (A) đi trước** |
| 8 | A đi một nước | Bàn cập nhật ở **cả 7 phiên** |
| 9 | A gửi **kênh riêng** | **Chỉ B nhận**. S1–S5 **không** nhận |
| 10 | S1 gửi **kênh chung** | S2–S5 **và cả A, B** đều nhận |
| 10b | A gửi **kênh chung** | S1–S5 nhận, có **nhãn "người chơi"** |
| 10c | A ẩn kênh chung, B hiện | Độc lập; A vẫn gửi được, bật lại thấy đủ lịch sử |
| 11 | A bật camera *Chỉ đối thủ* | **B thấy**, S1–S5 **không thấy** |
| 12 | A đổi sang *Đối thủ và người xem* | S1–S5 **bắt đầu thấy** |
| 13 | **A đuổi S3** | S3 về sảnh; hiện **4/5** |
| 14 | **S3 dùng mã cũ vào lại** | **BỊ TỪ CHỐI** |
| 15 | B đầu hàng | A thắng; màn kết quả hiện **"Đầu hàng"** |
| 16 | Cả hai bấm tái đấu | Ván mới, **A cầm đen, B cầm đỏ**; chat **trống**; camera **tắt** |

---

## 3. KỊCH BẢN TRANH CHẤP (cần rào đồng bộ)

| ID | Kịch bản | Kết quả bắt buộc |
|---|---|---|
| `TS-RACE-01` | Hai người cùng xin **ghế chơi cuối** | **Đúng một** được nhận |
| `TS-RACE-02` | Hai người cùng xin **ghế xem thứ 5** | **Đúng một** được nhận, **không** thành 6 |
| `TS-RACE-03` | A và B cùng bấm **sẵn sàng** | Tạo **đúng một** ván |
| `TS-RACE-04` | **Hết giờ** và **đầu hàng** cùng lúc | **Đúng một** kết quả được ghi |
| `TS-RACE-05` | **Hết giờ** và **hết hạn mất mạng** cùng lúc | Ưu tiên **hết giờ** |
| `TS-RACE-06` | Hai người cùng bấm **tái đấu** | Tạo **đúng một** ván mới |
| `TS-RACE-07` | Hai tab cùng bấm **Chuyển camera sang tab này** | **Đúng một** tab thắng |
| `TS-RACE-08` | Hai người chơi cùng **đuổi một người xem** | Thực hiện **một lần** |
| `TS-RACE-09` | Đổi **camera và micro** cùng lúc | **Một** được ghi; cái kia phải đọc lại rồi thử lại |
| `TS-RACE-10` | Hai lời mời cùng dùng cho **ghế cuối** | **Đúng một** thành công |

**Mỗi kịch bản phải kiểm cả phản hồi API lẫn dữ liệu đã lưu**, và **thử đảo thứ tự bên thắng** — không viết test bắt buộc A luôn thắng do thời điểm.

---

## 4. KỊCH BẢN QUYỀN (giả mạo dữ liệu gửi lên)

Mọi kịch bản dưới đây **gửi thẳng dữ liệu giả mạo**, không qua giao diện:

| ID | Kịch bản | Kết quả bắt buộc |
|---|---|---|
| `TS-AUTH-01` | Người **ngoài phòng** gửi lệnh đi cờ | Từ chối |
| `TS-AUTH-02` | **Người xem** gửi lệnh đi cờ | Từ chối |
| `TS-AUTH-03` | **Người xem** gửi vào **kênh riêng người chơi** | Từ chối |
| `TS-AUTH-04` | **Người xem** đọc lịch sử **kênh riêng người chơi** | Từ chối |
| `TS-AUTH-05` | Người xem giả mạo nhãn kênh để gửi vào kênh riêng | **Từ chối** |
| `TS-AUTH-06` | Hai tab cùng gửi lệnh đi cờ | **Đúng một** nước được ghi; cái sau bị từ chối |
| `TS-AUTH-07` | Người chơi đổi **mức media của đối thủ** | Từ chối |
| `TS-AUTH-08` | Không phải chủ phòng đổi **chế độ riêng tư** | Từ chối |
| `TS-AUTH-09` | Người chơi **đuổi đối thủ** | Từ chối |
| `TS-AUTH-10` | **Người xem** đuổi người khác | Từ chối |
| `TS-AUTH-11` | Xem **lịch sử ván của người khác** bằng cách đoán mã | Từ chối |
| `TS-AUTH-12` | Dùng **phiên đã thu hồi** | Từ chối |
| `TS-AUTH-13` | Tab cũ cố phát camera sau khi đã chuyển sang tab khác | Từ chối |
| `TS-AUTH-14` | Người **bị đuổi** dùng mã/link cũ | Từ chối |
| `TS-AUTH-15` | Vào xem phòng **khoá** bằng mã WATCH | Từ chối; PLAY hợp lệ vẫn theo quyền riêng của PLAY |
| `TS-AUTH-16` | **Tự chấp nhận** đề nghị của chính mình | Từ chối |
| `TS-AUTH-17` | Hai tab cùng xác nhận "Tôi còn đây" | Chỉ cộng **một lần** 3 phút |

---

## 5. KỊCH BẢN THỜI GIAN (đồng hồ giả)

| ID | Kịch bản | Kết quả |
|---|---|---|
| `TS-TIME-01` | Ván 5 phút, không đi nước | Hết giờ ⇒ đối thủ thắng |
| `TS-TIME-02` | Ván **không giới hạn**, không đi 3 phút | **Hộp thoại xác nhận** hiện |
| `TS-TIME-03` | Ván **5 phút**, không đi 3 phút | Hộp thoại **KHÔNG** hiện |
| `TS-TIME-04` | Ván **với máy**, không đi 3 phút | Hộp thoại **KHÔNG** hiện |
| `TS-TIME-05` | Xác nhận treo ván | **+3 phút**, ván tiếp tục |
| `TS-TIME-06` | Không xác nhận, chờ 30 giây | Ván kết thúc, **đối thủ thắng** |
| `TS-TIME-07` | Treo 3 chu kỳ liên tiếp | Lần 3 **không hỏi**, vào thẳng đếm ngược |
| `TS-TIME-08` | Treo 2 lần, **đi một nước**, rồi treo tiếp | **Lại có đủ 2 lần** gia hạn |
| `TS-TIME-09` | Mất mạng 59 giây rồi quay lại | Ván tiếp tục |
| `TS-TIME-10` | Mất mạng 61 giây, đối thủ online | **Thua** |
| `TS-TIME-11` | Cả hai mất mạng | **Gián đoạn**, không ai thắng |
| `TS-TIME-12` | Người xem mất mạng 16 giây | **Mất ghế** |
| `TS-TIME-13` | Đề nghị hoà, chờ 30 giây | Đề nghị **hết hạn** |
| `TS-TIME-14` | Phòng đã xong, chờ 10 phút | Phòng **tự đóng** |
| `TS-TIME-15` | Tái đấu đúng phút thứ 9 | Thành công, **huỷ** bộ đếm đóng phòng |
| `TS-TIME-16` | Lời mời trực tiếp, chờ 10 phút | **Hết hạn**, biến khỏi hộp thư |

---

## 6. KỊCH BẢN LUẬT CỜ

| ID | Kịch bản | Kết quả |
|---|---|---|
| `TS-RULE-01` | Thế cờ **F-MATE** | `check = true` · **0 nước hợp lệ** · **chiếu hết**, ĐỎ thắng |
| `TS-RULE-02` | Thế cờ **F-STALEMATE** | `check = false` · **0 nước hợp lệ** · **hết nước**, ĐỎ thắng |
| `TS-RULE-03` | Thế cờ **F-REPEAT**, 4 nửa nước | Đếm = 2, ván **vẫn tiếp tục** |
| `TS-RULE-04` | Thế cờ **F-REPEAT**, 8 nửa nước | Đếm = 3, **HOÀ** |
| `TS-RULE-05` | Mã bị **cản chân** | Nước đi **không hợp lệ** |
| `TS-RULE-06` | Tượng bị **cản mắt** | Không hợp lệ |
| `TS-RULE-07` | Tượng **qua sông** | Không hợp lệ |
| `TS-RULE-08` | Pháo ăn với **0 ngòi** | Không hợp lệ |
| `TS-RULE-09` | Pháo ăn với **1 ngòi** | **Hợp lệ** |
| `TS-RULE-10` | Pháo ăn với **2 ngòi** | Không hợp lệ |
| `TS-RULE-11` | Tốt **chưa qua sông** đi ngang | Không hợp lệ |
| `TS-RULE-12` | Tốt **đã qua sông** đi ngang | **Hợp lệ** |
| `TS-RULE-13` | Tốt đi **lùi** | Không hợp lệ |
| `TS-RULE-14` | Nước làm **hai tướng đối mặt** | Không hợp lệ |
| `TS-RULE-15` | Dời quân đang chắn ⇒ **tướng đối mặt** | Không hợp lệ |
| `TS-RULE-16` | Nước để **tướng mình bị chiếu** | Không hợp lệ |
| `TS-RULE-17` | Sĩ ra **ngoài cung** | Không hợp lệ |
| `TS-RULE-18` | Tướng ra **ngoài cung** | Không hợp lệ |
| `TS-RULE-19` | Hết nước đi **và** lặp 3 lần cùng lúc | **Hết nước đi thắng** |
| `TS-RULE-20` | Đổi mã định danh hai quân cùng loại cùng bên | **Cùng** khoá thế cờ |
| `TS-RULE-21` | Cùng bàn cờ, **khác bên đến lượt** | **Khác** khoá thế cờ |

**`TS-RULE-00`** — Đáp án của `TS-RULE-01` đến `03` phải do **người review tay**, **không** lấy kết quả của hàm sinh nước đi làm đáp án cho chính nó.

---

## 7. KỊCH BẢN CAMERA/MIC (đo luồng thật)

| ID | Kịch bản | Cách kiểm |
|---|---|---|
| `TS-MED-01` | Cả **9 tổ hợp** camera × micro của một người chơi | Đo luồng nhận được ở từng phía |
| `TS-MED-02` | A *Đối thủ và người xem*, B *Chỉ đối thủ* | Người xem **chỉ nhận của A** |
| `TS-MED-03` | A *camera Chỉ đối thủ* + *micro Đối thủ và người xem* | Người xem **nghe tiếng, không thấy hình** |
| `TS-MED-04` | Thu hẹp quyền khi người xem **đang nhận** | Đo **byte nhận về 0** cho luồng mới |
| `TS-MED-05` | Người xem **giữ quyền cũ** rồi thử nhận tiếp | **Không nhận** được luồng mới |
| `TS-MED-06` | Người xem **bị đuổi** khi đang nhận | Luồng **thật sự dừng** |
| `TS-MED-07` | Tải lại trang khi đang bật cả hai | **Cả hai về tắt** |
| `TS-MED-08` | Chuyển camera đang bật sang tab/thiết bị khác | Server chặn luồng cũ rồi nguồn mới OFF; tab hợp tác stop hardware, thiếu ACK không được báo thiết bị vật lý đã tắt |
| `TS-MED-09` | Ván kết thúc | **Mọi** luồng dừng |
| `TS-MED-10` | **2 người phát + 5 người xem** | Tất cả nhận đúng phần được chia sẻ |
| `TS-MED-11` | Hạ tầng media **mất liên lạc** | Trước deadline chờ; tới 30 giây ERROR/FAILED + Thử lại; giữ fence, không phát mới |
| `TS-MED-12` | Từ chối quyền thiết bị | **Vẫn đánh cờ được** |

| `TS-MED-13` | Camera ở tab 1 + micro ở tab 2 → **hợp lệ** |

| `TS-MED-14` | Logout ALL/CURRENT hoặc đổi mật khẩu khi hai thiết bị phát: server chặn phiên/token cũ, socket thật đóng và SFU thật thu hồi. Chưa confirmed không báo dừng thiết bị; đối chứng phiên không thuộc scope vẫn dùng được |

| `TS-MED-15` | Source owner im lặng, ACK giả/muộn, control SFU lỗi: đúng 30 giây lỗi + retry; restart không mất fence, không capture/publish mới trước xác nhận, nguồn còn lại có đối chứng dương |

**`TS-MED-00`** — Phải có **đối chứng dương**: cùng lúc đó, người **còn quyền** vẫn nhận được luồng mới. Nếu không, "không nhận byte" có thể chỉ vì hạ tầng chết.

---

## 8. KỊCH BẢN MÁY (AI)

| ID | Kịch bản | Kết quả |
|---|---|---|
| `TS-AI-01` | Cả 3 cấp trên bộ **20 thế cờ** | Luôn đi **nước hợp lệ** |
| `TS-AI-02` | Đo thời gian, **5 lần lặp** mỗi thế mỗi cấp | p95 nearest-rank **không vượt** 300/1000/3000 ms ở depth 2/4/6; không hoàn tất depth = +∞, không có biên độ nới |
| `TS-AI-03` | So **bản cơ sở** và **bản cắt tỉa**, cùng độ sâu và thứ tự | Điểm và tập nước tốt **tương đương** |
| `TS-AI-04` | Đếm số nút của hai bản | Cắt tỉa **không nhiều hơn**; **giảm tổng** trên toàn tập |
| `TS-AI-05` | Đấu **60 ván** deterministic (3 cặp × 20 ván, đổi màu, seed/depth theo ai-validation) | Cấp cao đạt **> 50%** điểm |
| `TS-AI-06` | **Đi lại** giữa lúc máy đang tính | Huỷ việc; kết quả muộn **bị bỏ** |
| `TS-AI-07` | Máy lỗi **2 lần** liên tiếp | Ván **gián đoạn**, người chơi **không thua** |
| `TS-AI-08` | Đồng hồ máy còn **200 ms** ở cấp Khó | Ngân sách **cắt xuống 200 ms** |
| `TS-AI-09` | AI: người thật offline; đồng hồ còn 20 / 60 / trên 60 giây | TIMEOUT ở 20 / 60; trường hợp còn trên 60 ⇒ INTERRUPTED ở 60 nếu chưa có kết quả khác |
| `TS-AI-10` | Chạy cấp Khó song song với ván khác | Ván khác **không bị nghẽn** |

---

## 9. KỊCH BẢN GIAO DIỆN

| ID | Kịch bản | Kết quả |
|---|---|---|
| `TS-UI-01` | Mở ở **360 px** và **390 px** | **Không tràn ngang**, bàn cờ dùng được |
| `TS-UI-02` | Mở ở **1366 px** và **1920 px** | Bố cục đúng, media **không đè** bàn cờ |
| `TS-UI-03` | Dùng bàn cờ **chỉ bằng bàn phím** | Chọn và đi được nước |
| `TS-UI-04` | Mở bàn phím ảo trên điện thoại | **Không** gây cuộn ngang |
| `TS-UI-05` | Mọi màn hình ở trạng thái **trống** | Có giải thích + gợi ý hành động |
| `TS-UI-06` | Mọi màn hình ở trạng thái **lỗi** | Có nút **Thử lại** |
| `TS-UI-07` | Mọi nút **vô hiệu** | Có **giải thích vì sao** |
| `TS-UI-08` | Mọi cửa sổ (trừ 4 cửa sổ chặn) | Đóng được bằng **X**, `Esc`, bấm ra ngoài |
| `TS-UI-09` | Nhãn khung chat + dòng *"Người chơi cũng đọc và gửi được"* | Hiện **rõ** ở kênh chung |
| `TS-UI-10` | Kiểm mọi trạng thái | **Không** chỉ truyền đạt bằng màu |
| `TS-UI-11` | Thông báo tạm khi đang chơi | **Không che** nút Đầu hàng |
| `TS-UI-12` | Nội dung chat chứa mã HTML | Hiện **dạng chữ**, không thực thi |
| `TS-UI-13` | Bật **giả lập mù màu đỏ–lục** | Vẫn phân biệt được hai phe, kể cả **Sĩ, Mã, Xe** (`DT-21`) |
| `TS-UI-14` | Đo tương phản toàn bộ cặp màu | Đạt **WCAG 2.1 AA** theo bảng ở `design-tokens` |

---

## 10. KỊCH BẢN THỦ CÔNG (cần thiết bị/tài khoản thật)

| ID | Kịch bản | Cần gì |
|---|---|---|
| `TS-MAN-01` | Đăng nhập **Google thật** | Tài khoản Google Cloud đã cấu hình |
| `TS-MAN-02` | Email xác minh và khôi phục **thật** | Dịch vụ gửi email |
| `TS-MAN-03` | Camera/mic giữa **hai thiết bị, hai mạng khác nhau** | 2 điện thoại thật, 2 mạng |
| `TS-MAN-04` | Kiểm trên **Safari iPhone** và **Chrome Android** | Thiết bị thật |
| `TS-MAN-05` | Máy chủ **khởi động lại** khi đang chơi | Quyền khởi động lại |
| `TS-MAN-06` | Thử tải **10 phòng / 70 kết nối** | Máy đủ cấu hình |

**`TS-MAN-00`** — Thiếu tài nguyên ⇒ ghi **chờ**, **không** đánh dấu đã đạt, **không** thay bằng giả lập (`AC-RULE-01`, `AC-RULE-02`).

---

## 11. KỊCH BẢN HỒI QUY TỪ LỖI LẦN TRƯỚC

Sáu kịch bản này tái hiện **đúng những lỗi đã xảy ra**:

| ID | Lỗi cũ | Kịch bản hồi quy |
|---|---|---|
| `TS-REG-01` | Đi nước mới sau đi lại gây lỗi trùng khoá | Đi lại về nửa nước 0, đi nước mới ⇒ **thành công** |
| `TS-REG-02` | Đếm lặp tính cả nhánh đã bỏ | Lặp trên nhánh đã bỏ ⇒ **không** tính vào đếm |
| `TS-REG-03` | Vào phòng theo mã bỏ qua kiểm chế độ | WATCH ở LOCKED ⇒ từ chối; WATCH grant hợp lệ ở CODE_ONLY ⇒ nhận; không cho PLAY/WATCH vượt quyền grant |
| `TS-REG-04` | Thu hồi quyền người xem là code chết | Đổi sang khoá ⇒ người xem **thật sự** mất bàn cờ + chat + media |
| `TS-REG-05` | Không có bộ đếm thời hạn | Hết giờ / mất mạng / hết hạn đề nghị ⇒ **tự động** kích hoạt, không cần ai gửi lệnh |
| `TS-REG-06` | Test dữ liệu tự mock chính nó | Mọi kiểm thử dữ liệu chạy trên **dịch vụ thật**, **0 test bị bỏ qua** |

---

## 12. LIÊN QUAN

[acceptance-criteria.md](acceptance-criteria.md) · [../04-business-rules/permissions.md](../04-business-rules/permissions.md) · [../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) · [../99-archive/reviews-v1/](../99-archive/reviews-v1/)



**Oracle media:** dùng [media-control-contract §4](../09-technical/media-control-contract.md#4-oracle-nghiệm-thu) để phân biệt mẫu mới/buffer và có đối chứng dương, không lấy ACK client hoặc mất mạng toàn bộ làm bằng chứng thu hồi.

**TS-MAT-TERMINAL-REJECT:** MOVE tới khi clock đã hết: command bị từ chối nhưng terminal result được commit đúng một lần và broadcast cho cả phòng; từ chối validation thuần không đổi state thì chỉ phản hồi người gửi.
