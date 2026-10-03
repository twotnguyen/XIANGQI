# 05 · Chiến lược kiểm thử và tiêu chí hoàn thành

**Giai đoạn 2 · Trạng thái: **Đã duyệt 03/10/2026** (các giả định kỹ thuật chưa đo vẫn cần thử nghiệm ở đầu Giai đoạn 4)** · Công cụ theo README: **Vitest** (đơn vị, tích hợp) và **Playwright** (đầu-cuối). Không thêm công cụ ngoài danh sách khi chưa được đồng ý (AGENTS §8). Nguyên tắc AGENTS §4.4: **không hạ ngưỡng đo để báo đạt**; không đạt thì ghi **số thật** và trạng thái `BLOCKED`.

Căn cứ: [01-yeu-cau-chi-tiet.md](01-yeu-cau-chi-tiet.md) (US, AC, NFR), [02-luat-co-tuong.md](02-luat-co-tuong.md), [03-du-lieu.md](03-du-lieu.md), [04-kien-truc.md](04-kien-truc.md).

---

## 1. Tiêu chí hoàn thành P1 (Product Owner, 03/10/2026)

> **Demo chạy được 8 mục cốt lõi từ đầu đến cuối (end-to-end).**

Kịch bản demo chuẩn D1–D10 (dùng làm bài kiểm thử chấp nhận P1, chạy bằng Playwright với nhiều trình duyệt, cộng thao tác tay cho camera/mic):

| Bước | Mục tiêu | Thao tác | Kết quả phải thấy |
|---|---|---|---|
| D1 | 1 | Người dùng A đăng ký 3 bước với OTP, đăng nhập; người dùng B, C, D cũng đăng ký | Vào được `/lobby` |
| D2 | 2 | A tạo phòng (10 phút, `PUBLIC`, tối đa 2 người xem) | A ngồi ghế Đỏ ở phòng chờ |
| D3 | 3 | A gửi **link/mã** cho B; A **mời bạn bè online** C (sau khi A và C là bạn) | B vào được phòng; C nhận pop-up 30 giây |
| D4 | 6 | C và D vào sau khi ghế đã kín | Họ thành **Người xem**; người xem thứ 3 bị từ chối |
| D5 | 6 | A thấy phòng đủ, **khoá** phòng; E dùng mã/link | E **không vào được** |
| D6 | 4, 5 | A (Đỏ) và B (Đen) bấm Sẵn sàng; đếm 3 giây; hai bên đi cờ qua mạng đến khi chiếu hết | Bàn cờ khởi tạo đúng thế; mọi nước đồng bộ; kết quả hiện đúng; người xem thấy trực tiếp |
| D7 | 7 | A và B bật camera/mic; chat ở Kênh Riêng; người xem chat ở Kênh Chung | Hai người thấy/nghe nhau; Kênh Riêng người xem không đọc được |
| D8 | 8 | Ván kết thúc rồi A **bấm Rời phòng (rời ghế)**; trước khi rời ghế, thử bắt đầu ván với máy phải bị từ chối; sau khi rời thì đánh với máy ở cả 3 cấp độ | Không vào được ván với máy khi vẫn đang ngồi ghế phòng khác; máy trả lời đúng thời hạn, không đi sai luật |
| D9 | 5 | A và B **bắt đầu lại một ván online mới**, rồi ngắt mạng một bên giữa ván | Overlay đếm 60 giây; nối lại trong 60 giây thì tiếp tục; quá 60 giây thì bên mất kết nối thua `DISCONNECT` |
| D10 | 8 | Đóng tab giữa ván với máy rồi mở lại `/ai/:id` trong 30 phút và sau 30 phút | Trong 30 phút vào lại đúng thế cờ; sau 30 phút ván là *Bỏ dở* |

Mọi bước D1–D10 đạt thì P1 **hoàn thành**. Ngoài ra phải thoả các NFR ở mục 6.

---

## 2. Các tầng kiểm thử

| Tầng | Công cụ | Phạm vi | Chạy khi |
|---|---|---|---|
| Đơn vị | Vitest | Gói luật cờ, máy cờ, bộ lọc từ cấm, Elo (P2), tính đồng hồ, ký hiệu nước đi | Mỗi lần đẩy mã |
| Tích hợp | Vitest + máy chủ thử | Sự kiện Socket.IO (hai client giả), luồng phòng, đồng hồ, kết nối lại, OTP có giả Supabase | Mỗi lần đẩy mã |
| Đầu-cuối | Playwright | Kịch bản D1–D10 và các luồng US chính | Trước khi hợp nhất và trước demo |
| Hiệu năng/tải | Tập lệnh tải (Node, dùng `socket.io-client`) | NFR-01, NFR-02 | Trước demo và khi đổi kiến trúc |
| Máy cờ | Vitest + công cụ đo | Đúng/thời gian/sức mạnh (mục 3) | Khi đổi thuật toán và trước demo |
| Trợ năng | Playwright + kiểm tay | WCAG 2.1 AA, bàn phím, tương phản | Trước demo |
| Bảo mật | Tích hợp + kiểm tay | Mục 5 | Trước demo |

---

## 3. Kiểm thử luật cờ và máy cờ (con số tạm của Giai đoạn 1)

### 3.1 Luật cờ ([02])

1. **Perft (đếm nút đường đi)** từ thế khởi đầu, đối chiếu với giá trị tham chiếu phổ biến của cộng đồng cờ tướng: độ sâu 1 = **44**, độ sâu 2 = **1 920**, độ sâu 3 = **79 666**, độ sâu 4 = **3 290 240**. *Các giá trị này lấy từ tài liệu cộng đồng, **phải xác minh** bằng một bộ sinh nước đi tham chiếu độc lập trước khi dùng làm chuẩn; nếu không khớp thì ghi số thật và điều tra, không sửa số cho khớp.*
2. **Mỗi quân** có bộ thế cờ nhỏ kiểm: Mã bị cản chân, Tượng bị chặn chân/không qua sông, Pháo cần đúng một ngòi, Tốt qua sông, Tướng/Sĩ ở trong cung, hai Tướng đối mặt.
3. **Kết thúc ván:** chiếu hết, hết nước đi (thua), thứ tự ưu tiên (chiếu hết thắng hoà).
4. **Lặp thế:** chiếu liên tục một bên (bên chiếu thua), hai bên (hoà), lặp không chiếu (hoà), lặp do đuổi quân (hoà, đúng mục 4.1 của [02]); tính trên **nhánh hiệu lực sau đi lại** (P2).
5. **120 nửa nước:** 119 chưa hoà, 120 hoà; ăn quân đặt về 0; đi lại khôi phục giá trị.
6. **Ký hiệu tiếng Việt:** ví dụ `Pháo 2 bình 5`, `Mã 8 tiến 7`, và các thế phân biệt `Trước/Sau` ([02] mục 7.3), cho cả Đỏ và Đen.
7. **Ngẫu nhiên có cố định hạt giống:** 1 000 ván ngẫu nhiên không phát sinh nước đi vi phạm luật (so với kiểm tra thứ cấp).

### 3.2 Máy cờ

Đo trên **máy chuẩn** (ghi rõ cấu hình CPU/RAM khi đo, đề xuất 4 vCPU, 8 GB; mọi số đo phải ghi máy) và gọi qua **tiến trình riêng** như khi chạy thật.

| Kiểm | Cách đo | Ngưỡng ([02] mục 9.5) |
|---|---|---|
| Thời gian tính | 200 thế (khởi đầu, trung cuộc, tàn cuộc) mỗi cấp, đo p50/p95 **từ lúc bắt đầu tìm** | Dễ ≤ 300 ms · Trung bình ≤ 1 000 ms · Khó ≤ 3 000 ms (p95) |
| Thời gian người chơi chờ | Cùng bộ thế, qua tiến trình riêng, không có hàng đợi và có 2–3 ván đồng thời | Ghi p95; hàng đợi ≤ 3 giây; vượt thì báo *Thử lại* |
| Độ sâu thực tế cấp Khó | Ghi độ sâu hoàn tất mỗi lần | Trung vị ≥ 6 (khởi đầu) và ≥ 5 (trung cuộc) |
| Phân cấp sức mạnh | Đấu máy với máy ≥ 40 ván, đổi bên đều | Khó thắng TB ≥ 75%; TB thắng Dễ ≥ 75% |
| Chiếu hết ngắn | Bộ thế "chiếu hết 1 nước" và "2 nước" do nhóm biên soạn **kèm ghi nguồn** | Tìm đúng ≥ 95% |
| Độ ổn định | 1 000 ván đấu máy, 0 treo, 0 lỗi tiến trình | 0 |
| Lỗi tiến trình | Giết tiến trình giữa lúc tìm kiếm | Phục hồi trong 10 giây hoặc ván `Bỏ dở` + *Thử lại* |

**Quy tắc ghi kết quả:** nếu cấp Khó không đạt độ sâu 6 trong 3 giây, ghi **độ sâu và thời gian thực tế**, đánh dấu `BLOCKED` và báo Product Owner. Phương án giảm xuống độ sâu 5 ([02] mục 9.6) cần được Product Owner đồng ý trước khi đổi BA 6.1.

---

## 4. Kiểm thử tích hợp và đầu-cuối theo nhóm

Mỗi US ở [01] có ít nhất một kiểm thử; dưới đây là các **tình huống bắt buộc** (không rút gọn).

| Nhóm | Tình huống bắt buộc |
|---|---|
| A (Tài khoản) | Đăng ký đúng; OTP hết hạn; **giới hạn nhập sai** (gần đúng, mục tiêu 5 lần); gửi lại trong 60 giây bị chặn; username trùng khác hoa/thường; email đã đăng ký; bỏ dở không tạo tài khoản; đăng nhập sai thông báo chung; ghi nhớ 30 ngày/12 giờ; mở link mời khi chưa đăng nhập rồi tự vào phòng |
| B (Phòng) | Tạo phòng đủ tuỳ chọn; Host ngồi Đỏ; đổi ghế khi một mình; người thứ hai vào ghế trống; **người thứ ba thành người xem**; hết chỗ xem bị từ chối; không có người xem thì người thứ ba bị từ chối; chuyển sang người xem **không vượt trần**; nút bị vô hiệu đúng khi không còn chỗ; đổi người ngồi ghế reset Sẵn sàng và về `WAITING`; khoá phòng chỉ khi đủ 2 người; sau khoá không ai mới vào dù có link/mã; người đang có ghế/đang xem vào lại trong hạn; đuổi người xem và chặn đến khi đóng; Host rời chuyển quyền; Host rời giữa ván là đầu hàng; ví dụ nghiệm thu A–B–C–D–E (BA 2.8) chạy hết |
| C (Bàn cờ) | Click và kéo thả; hủy chọn bằng `Esc`; không chọn được quân đối phương; bàn lật cho Đen; âm thanh và tắt tiếng; nhãn đọc màn hình |
| D (Ván) | Nước hợp lệ/không hợp lệ; lệnh trùng và lệnh `matchVersion` cũ; hết giờ; kết thúc mọi lý do ở [02] mục 3.3; đầu hàng; xin hoà (đồng ý, từ chối, hết hạn, rút lại, chờ 5 nước); rời phòng giữa ván; kết nối lại đúng ảnh chụp; **cả hai cùng rớt mạng**; **khởi động lại máy chủ giữa ván → `INTERRUPTED`**; người xem chỉ đọc; thứ tự xử lý (hết giờ trước nước đi) |
| E (Chat, media) | Kênh Riêng không lọt tới người xem; người đổi chỗ sau không đọc tin cũ; 5 tin/10 giây; 200 ký tự; từ cấm các biến thể; camera/mic mặc định tắt; 3 mức chia sẻ đúng người nhận; người xem không phát được; nhiều tab thì tab cũ dừng media |
| F (Bạn bè) | Tìm không phân biệt hoa/thường; gửi, thu hồi, chấp nhận, từ chối; bị từ chối 2 lần không gửi lại được; giới hạn 200/50; mời bạn online; bạn đang đấu hoặc offline không mời được; pop-up hết 30 giây |
| G (Với máy) | 3 cấp × cầm Đỏ/Đen/Ngẫu nhiên; máy đi trước khi cầm Đen; vào lại trong 30 phút; sự cố máy cờ; không có Xin hoà |
| H (Giao diện) | 5 trạng thái mỗi màn; 4 kích thước 360/390/1366/1920 không cuộn ngang; điều hướng bằng bàn phím; giảm chuyển động; tooltip cho mọi `DISABLED` |

---

## 5. Bảo mật

| Kiểm | Cách làm |
|---|---|
| Client không quyết định | Gửi nước đi giả/ván đã kết thúc/ngoài lượt: máy chủ từ chối |
| Quyền theo vai trò | Người xem gửi `match.move`, `chat.send` vào Kênh Riêng, bật phát LiveKit: bị từ chối |
| Không lộ dữ liệu | Người ngoài phòng không nhận `room.state`; Kênh Riêng không gửi tới người xem; email không bao giờ trả về trong đăng nhập |
| Khoá bí mật | Quét kho và gói client: không có khoá dịch vụ; `VITE_*` chỉ giá trị công khai |
| Giới hạn tốc độ | Chat, gửi OTP, tạo phòng, kết nối: vượt thì bị chặn |
| Nhập liệu | Tham số sai kiểu/quá dài/có ký tự điều khiển bị từ chối |
| OTP (Phương án B, [04] mục 3.1) | Hạn mã 180 giây và gửi lại tối thiểu 60 giây (kiểm cấu hình thực tế); **giới hạn tốc độ xác minh** chặn nhập sai liên tục từ một địa chỉ (mục tiêu 5 lần/5 phút), ghi **số đo thực** vì chỉ là gần đúng; người dùng còn cờ `PENDING` hoặc `completed_at` rỗng **không dùng được ứng dụng** dù có phiên Supabase; client **không ghi trực tiếp** được vào `profiles`; hoàn tất đăng ký có khả năng phục hồi: giết tiến trình **giữa các bước (a)–(d2)**, trong đó **giữa (c)/(d1) và giữa (d1)/(d2)**, thì tác vụ quét hoàn tác toàn bộ (xoá hồ sơ rồi người dùng, không vướng khoá ngoại) và email, username đăng ký lại được; đăng ký dở rồi gửi lại cùng email thì bản dở bị dọn; hai lệnh đồng thời trên cùng ván được xử lý tuần tự ([04] mục 4.2); lỗi ghi cơ sở dữ liệu không phát thế cờ mới |
| Chặn/khoá | Người bị đuổi và phòng `LOCKED` thật sự bị chặn ở máy chủ (không chỉ ở giao diện) |

---

## 6. Hiệu năng, quy mô, trợ năng

| Mã | Phép đo | Ngưỡng |
|---|---|---|
| NFR-01 | Từ lúc máy chủ **nhận** lệnh nước đi đến lúc **client người xem nhận** thế mới (đo tại client người xem), mạng cục bộ | < 100 ms (p95). Thời gian xử lý riêng ở máy chủ cũng được ghi để phân tích, nhưng tiêu chí nghiệm thu là số đo ở client |
| NFR-02 | **50 kết nối đồng thời = 10 ván chạy (20 người chơi) + 30 kết nối khác (người xem, Sảnh, chat)**, mỗi ván đi nước đều đặn trong 10 phút | 0 lỗi mất kết nối ngoài ý muốn; độ trễ nước đi p95 < 300 ms; bộ nhớ và CPU của máy chủ ổn định (không tăng liên tục) |
| NFR-03 | Ma trận trình duyệt: Chrome, Edge, Firefox, Safari bản mới; màn 360/390/1366/1920 | Không lỗi chức năng, không cuộn ngang |
| NFR-A11Y | Tương phản các cặp màu ở DESIGN §2 (đã tính lại bằng công thức), bàn phím, nhãn, giảm chuyển động | Đạt WCAG 2.1 AA ở các trạng thái chính; tương phản của **từng trạng thái** (hover, vô hiệu, trong suốt) phải đo thêm khi dựng thật |
| NFR-07 | Khởi động lại máy chủ khi có ván | Ván thành `INTERRUPTED`, không treo, không mất dữ liệu đã lưu |

Phương pháp tải: tập lệnh tạo 50 kết nối thử (tài khoản kiểm thử, không dùng email thật): **10 cặp** vào 10 phòng và mỗi cặp đánh một ván ngẫu nhiên hợp lệ (20 kết nối); **30 kết nối còn lại** làm người xem (tối đa 2 mỗi phòng), ở Sảnh và gửi chat. Ghi thời gian máy chủ nhận lệnh/phát và độ trễ nhận ở client người xem.

---

## 7. Dữ liệu, môi trường, quy trình

* **Môi trường:** (1) máy nhà phát triển, (2) dự án Supabase **thử nghiệm** riêng, (3) LiveKit thử nghiệm; **không dùng khoá/dữ liệu thật** để kiểm thử. Email OTP khi thử dùng hộp thư thử hoặc cơ chế bắt thư của Supabase.
* **Dữ liệu thử:** bộ người dùng giả (có tên tiếng Việt), bộ thế cờ kiểm thử (FEN) có ghi nguồn, bộ từ cấm thử nghiệm (không đưa danh sách thật vào kho công khai).
* **Cổng chất lượng khi hợp nhất:** kiểm thử đơn vị và tích hợp xanh; không có lỗi mức Cao/Nghiêm trọng mở; kiểm `git diff --check`; không commit khoá bí mật.
* **Mức độ lỗi:** *Nghiêm trọng* (sai luật/mất ván/lộ dữ liệu/không vào được ván), *Cao* (chức năng P1 hỏng), *Trung bình* (sai hiển thị, có cách vượt), *Thấp* (câu chữ, thẩm mỹ).
* **Báo kết quả:** mỗi lần chạy kiểm thử ghi ngày, phiên bản mã, môi trường, số đo thực. Không đạt thì ghi `BLOCKED` kèm số thật.

---

## 8. Con số tạm đã chốt và cách xác minh

| Hạng mục | Giá trị đã duyệt | Xác minh bằng |
|---|---|---|
| Hoà không ăn quân | 120 nửa nước | Mục 3.1 điểm 5 |
| Chiếu liên tục | Bên chiếu thua | Mục 3.1 điểm 4 |
| Đuổi quân liên tục | Không xử riêng, hoà theo lặp | Mục 3.1 điểm 4; ghi là khác biệt đã biết |
| Máy cờ | Độ sâu 2/4/6, 300/1000/3000 ms | Mục 3.2 |
| Quy mô | 50 người, 10 ván | NFR-02 |
| Xin hoà Ranked (P2) | Sau 20 nước mỗi bên | Kiểm thử luật Ranked ở P2 |

Mọi thay đổi con số phải được Product Owner duyệt và ghi lại ở BA-SCOPE.

---

## 9. Truy vết (tóm tắt)

| Nhóm US | Kiểm thử chính |
|---|---|
| A | Tích hợp (OTP giả), Playwright (đăng ký/đăng nhập), bảo mật |
| B | Tích hợp phòng (hai và nhiều client), Playwright kịch bản D2–D5 |
| C | Playwright, trợ năng |
| D | Đơn vị (luật), tích hợp (đồng hồ, kết nối), Playwright D6, D9, tải |
| E | Tích hợp (chat), kiểm tay LiveKit D7, bảo mật |
| F | Tích hợp, Playwright D3 |
| G | Kiểm thử máy cờ, Playwright D8, D10 |
| H, NFR | Playwright (kích thước, bàn phím), kiểm tay trợ năng, tải |

[01]: 01-yeu-cau-chi-tiet.md
[02]: 02-luat-co-tuong.md
[03]: 03-du-lieu.md
[04]: 04-kien-truc.md
[05]: 05-kiem-thu.md
