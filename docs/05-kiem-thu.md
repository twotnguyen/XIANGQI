# 05 · Chiến lược kiểm thử và tiêu chí hoàn thành

> **Đồng bộ 05/10/2026:** theo các quyết định nghiệp vụ đã chốt trong BA; bản viết/thiết kế kỹ thuật còn cần review, các thử nghiệm vẫn NOT_RUN.

> **Bản hoàn thiện 04/10/2026, chờ Product Owner review bản viết.** Nền tảng đã duyệt 03/10 và các quyết định bổ sung đã duyệt 04/10 được giữ nguyên. Nhãn đã duyệt bên dưới ghi lịch sử nền, không có nghĩa toàn bộ câu chữ/thiết kế mới đã được review; không có mã nguồn hay test ứng dụng được chạy trong đợt tài liệu này.

**Giai đoạn 2 · Trạng thái: **nền tảng đã duyệt 03/10/2026; bản viết 04/10/2026 chờ Product Owner review** (các giả định kỹ thuật chưa đo vẫn cần thử nghiệm ở đầu Giai đoạn 4)** · Công cụ theo README: **Vitest** (đơn vị, tích hợp) và **Playwright** (đầu-cuối). Không thêm công cụ ngoài danh sách khi chưa được đồng ý (AGENTS §8). Nguyên tắc AGENTS §4.4: **không hạ ngưỡng đo để báo đạt**; không đạt thì ghi **số thật** và trạng thái `BLOCKED`.

Căn cứ: [01-yeu-cau-chi-tiet.md](01-yeu-cau-chi-tiet.md) (US, AC, NFR), [02-luat-co-tuong.md](02-luat-co-tuong.md), [03-du-lieu.md](03-du-lieu.md), [04-kien-truc.md](04-kien-truc.md).

---

## 1. Tiêu chí hoàn thành P1 (Product Owner, 03/10/2026)

> **Demo chạy được 8 mục cốt lõi từ đầu đến cuối (end-to-end).**

Kịch bản demo chuẩn D1–D10 (dùng làm bài kiểm thử chấp nhận P1, chạy bằng Playwright với nhiều trình duyệt, cộng thao tác tay cho camera/mic):

| Bước | Mục tiêu | Thao tác | Kết quả phải thấy |
|---|---|---|---|
| D1 | 1 | Người dùng A đăng ký 3 bước với **OTP thật** bằng email thành viên nhóm; B, C, D là tài khoản **tạo sẵn trước** (SMTP mặc định chỉ khoảng 2 thư/giờ, BA 10.1), đăng nhập được. Không dùng mock OTP làm bằng chứng đã gửi thư thật (PO đã duyệt 04/10/2026) | Vào được `/lobby` |
| D2 | 2 | A tạo phòng (10 phút, `CODE_ONLY`, chọn tối đa **2** người xem để demo đầy chỗ; mặc định biểu mẫu là 5, cho chọn 0–5) | A ngồi ghế Đỏ ở phòng chờ |
| D3 | 3 | A gửi **link/mã** cho B; A **mời bạn bè online** C (sau khi A và C là bạn) | B vào được phòng; C nhận pop-up 30 giây |
| D4 | 6 | A mở PUBLIC, C vào xem từ danh sách Sảnh và D qua mã/link sau khi ghế đã kín | Họ thành **Người xem**; người xem thứ 3 bị từ chối vì phòng demo đã chọn N=2 |
| D5 | 6 | A chuyển CODE_ONLY: mục biến mất ở Sảnh, E không vào từ mục cũ; D rời để thử E vào bằng mã, C vẫn ở phòng. E rời phòng; A khoá phòng, rồi E thử vào mới bằng mã/link hoặc mục Sảnh cũ | CODE_ONLY chỉ nhận qua mã/link; LOCKED chặn mọi người mới dù còn chỗ; người xem hiện có giữ quyền |
| D6 | 4, 5 | A (Đỏ) và B (Đen) bấm Sẵn sàng; đếm 3 giây; hai bên bắt đầu đi cờ qua mạng; tiếp tục sang D7 khi ván vẫn đang diễn ra | Bàn cờ khởi tạo đúng thế; mọi nước đồng bộ; người xem thấy trực tiếp |
| D7 | 7 | Ngay trong ván D6, A và B bật camera/mic với mức chọn sẵn Chỉ đối thủ; chat ở Kênh Riêng; người xem chat ở Kênh Chung. Thử chủ động chia sẻ cả người xem, sau đó tiếp tục đánh đến chiếu hết | Hai người vừa đánh vừa thấy/nghe/chat với nhau; người xem không đọc Kênh Riêng, chỉ thấy/nghe media khi người phát cho phép; kết quả ván hiện đúng |
| D8 | 8 | Ván kết thúc rồi A **bấm Rời phòng (rời ghế)**; trước khi rời ghế, thử bắt đầu ván với máy phải bị từ chối; sau khi rời thì đánh với máy ở cả 3 cấp độ | Không vào được ván với máy khi vẫn đang ngồi ghế phòng khác; máy trả lời đúng thời hạn, không đi sai luật |
| D9 | 5 | A kết thúc/rời ván AI ở D8; A và B rời mọi vị trí chơi cũ trước khi tạo/tham gia phòng và **bắt đầu một ván online mới**, rồi ngắt mạng một bên giữa ván | Overlay đếm 60 giây; nối lại trong 60 giây thì tiếp tục; quá 60 giây thì bên mất kết nối thua `DISCONNECT` |
| D10 | 8 | Sau D9, kết thúc/rời ván online và rời ghế rồi tạo ván AI mới; đóng tab giữa ván với máy rồi mở lại `/ai/:id` trong 30 phút và sau 30 phút | Trong 30 phút vào lại đúng thế cờ; sau 30 phút ván là *Bỏ dở* |

D1–D10 là kịch bản demo tối thiểu, **không thay thế** các AC/ngoại lệ và yêu cầu an toàn của P1. P1 chỉ hoàn thành khi D1–D10, AC P1 và trạng thái/ca biên áp dụng trong [08](08-ma-tran-nghiem-thu.md), cùng các NFR **đã duyệt** thuộc P1 (NFR-01–10, gồm NFR-08–10 do PO duyệt 04/10/2026, và NFR-A11Y) đều đạt; kết quả trung tính `INTERRUPTED` ở `AC-PLAY-03-02` đã chốt và bắt buộc đạt (không thắng/thua/hoà, không đổi Elo); dọn chat Khách theo BA 1.3 thuộc P2, chi tiết triển khai cần review; không có lỗi Cao/Nghiêm trọng còn mở. Không tính AC P2 vào P1.

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
| Chiếu hết ngắn | Chạy **cấp Khó** trên bộ thế "chiếu hết 1 nước" và "2 nước" do nhóm biên soạn **kèm ghi nguồn** | Tìm đúng 100% bộ bắt buộc đã xác minh đáp án (BA 6.1, PO làm rõ 05/10); bộ mở rộng báo tỷ lệ riêng. Không áp ngưỡng 100% này cho Dễ/Trung bình; vẫn kiểm nước hợp lệ, thời gian và phân cấp sức mạnh của cả ba cấp |
| Tìm tĩnh khi bị chiếu | Bộ thế bị chiếu chỉ thoát được bằng nước **không ăn quân**; thế hết nước đi ở biên độ sâu (bất biến đã bắt buộc ở [02] mục tìm tĩnh; riêng bộ fixture cụ thể là đề xuất, không cần PO duyệt từng thế) | Máy chọn đúng nước thoát chiếu; assertion nội bộ: không nút nào dùng điểm tĩnh làm cận dưới khi bị chiếu, hết nước ở biên sâu trả điểm thua ([02] mục tìm tĩnh) |
| Độ ổn định | 1 000 ván đấu máy, 0 treo, 0 lỗi tiến trình | 0 |
| Lỗi tiến trình / watchdog | (a) Giết tiến trình giữa lúc tìm kiếm (crash); (b) tìm vượt `budgetMs + 2000` khi **đã có** `progress` (đi nước độ sâu hoàn tất gần nhất, không phải lỗi) và khi **chưa có** (Bỏ dở); trả kết quả tác vụ cũ sau huỷ | Ván `Bỏ dở` khi lỗi hoặc quá hạn phản hồi 10 giây theo BA 6.1; Thử lại tạo ván mới, không hồi sinh ván cũ; bỏ kết quả tìm lỗi thời |

**Quy tắc ghi kết quả:** nếu cấp Khó không đạt độ sâu 6 trong 3 giây, ghi **độ sâu và thời gian thực tế**, đánh dấu `BLOCKED` và báo Product Owner. Phương án giảm xuống độ sâu 5 ([02] mục 9.6) cần được Product Owner đồng ý trước khi đổi BA 6.1.

---

## 4. Kiểm thử tích hợp và đầu-cuối theo nhóm

Mỗi **AC** ở [01] có mục kiểm đối ứng trong [08](08-ma-tran-nghiem-thu.md); AC có nhiều nhánh phải kiểm mọi nhánh. Bảng dưới là nhóm tình huống bổ sung, không thay ma trận cấp AC. Hiện tất cả là **đặc tả test, chưa chạy**.

| Nhóm | Tình huống bắt buộc |
|---|---|
| A (Tài khoản) | Đăng ký đúng; OTP hết hạn; **giới hạn nhập sai** (gần đúng, mục tiêu 5 lần); gửi lại trong 60 giây bị chặn; username trùng khác hoa/thường; email đã đăng ký; bỏ dở không tạo tài khoản; đăng nhập sai thông báo chung; ghi nhớ 30 ngày/12 giờ; mở link mời khi chưa đăng nhập rồi tự vào phòng |
| B (Phòng) | Tạo phòng đủ tuỳ chọn; Host ngồi Đỏ; đổi ghế khi một mình; vào bằng mã/link khi còn ghế thì tự vào ghế; khi ghế kín thì thành người xem; Vào xem từ Sảnh không chiếm ghế; hết chỗ xem bị từ chối; phòng N=5 nhận đủ năm người xem và chặn người xem thứ sáu, kể cả nhiều lệnh vào đồng thời; không có người xem thì người thứ ba bị từ chối; chuyển sang người xem **không vượt trần**; nút bị vô hiệu đúng khi không còn chỗ; đổi người ngồi ghế reset Sẵn sàng và về `WAITING`; mời xuống ghế cần Chấp nhận, Từ chối giữ vai trò xem, không giữ ghế và kiểm lại khi chấp nhận; mất mạng trong đếm bắt đầu ván tự tạo huỷ đếm/reset Sẵn sàng cả hai, giữ ghế 60 giây, chưa tạo ván không xử thua; khoá phòng chỉ khi đủ 2 người; sau khoá không ai mới vào dù có link/mã; người đang có ghế/đang xem vào lại trong hạn; đuổi người xem và chặn đến khi đóng; Host rời chuyển quyền; Host rời giữa ván là đầu hàng; ví dụ nghiệm thu A–B–C–D–E (BA 2.8) chạy hết |
| C (Bàn cờ) | Click và kéo thả; hủy chọn bằng `Esc`; không chọn được quân đối phương; bàn lật cho Đen; âm thanh và tắt tiếng; nhãn đọc màn hình |
| D (Ván) | Nước hợp lệ/không hợp lệ; lệnh trùng và lệnh `matchVersion` cũ; hết giờ; kết thúc mọi lý do ở [02] mục 3.3; đầu hàng; xin hoà (đồng ý, từ chối, hết hạn, rút lại, chờ 5 nước); rời phòng giữa ván; kết nối lại đúng ảnh chụp; **cả hai cùng rớt mạng**; **khởi động lại máy chủ giữa ván → `INTERRUPTED`**; người xem chỉ đọc; thứ tự xử lý (hết giờ trước nước đi) |
| E (Chat, media) | Kênh Riêng không lọt tới người xem; cặp mới không đọc tin cũ, cùng cặp Đổi bên/Tái đấu trong cùng phòng giữ chat (P2); 5 tin/10 giây; 200 ký tự; từ cấm các biến thể; camera/mic mặc định tắt, phòng tự tạo chọn sẵn Chỉ đối thủ; 3 mức chia sẻ đúng người nhận; người xem không phát được; nhiều tab thì tab cũ dừng media |
| F (Bạn bè) | Tìm không phân biệt hoa/thường; gửi, thu hồi, chấp nhận, từ chối; bị từ chối 2 lần không gửi lại được; giới hạn 200/50; mời bạn online; bạn đang đấu hoặc offline không mời được; pop-up hết 30 giây |
| P2 (Khôi phục tài khoản) | Email có/không có tài khoản nhận thông báo chung; OTP đúng/sai/hết hạn/thiếu ngữ cảnh; chỉ sau xác minh mới trả Username hiện tại; chỉ quên Username giữ mật khẩu, về Đăng nhập; quên cả mật khẩu đặt lại/thu hồi phiên khác; OTP không tự đăng nhập hoặc dùng API/Socket ứng dụng |
| G (Với máy) | 3 cấp × cầm Đỏ/Đen/Ngẫu nhiên; máy đi trước khi cầm Đen; vào lại trong 30 phút; sự cố máy cờ; không có Xin hoà |
| H (Giao diện) | 5 trạng thái mỗi màn; 4 kích thước 360/390/1366/1920 không cuộn ngang; điều hướng bằng bàn phím; giảm chuyển động; tooltip cho mọi `DISABLED` |

---

## 5. Bảo mật

| Kiểm | Cách làm |
|---|---|
| Client không quyết định | Gửi nước đi giả/ván đã kết thúc/ngoài lượt: máy chủ từ chối |
| Quyền theo vai trò | Người xem gửi `match.move`, `chat.send` vào Kênh Riêng, bật phát LiveKit: bị từ chối |
| Không lộ dữ liệu | Người ngoài phòng không nhận `room.state`; Kênh Riêng không gửi tới người xem; không tiết lộ email người khác khi tra username; email chính chủ theo hồ sơ/phiên đã xác thực |
| Khoá bí mật | Quét kho và gói client: không có khoá dịch vụ; `VITE_*` chỉ giá trị công khai |
| Giới hạn tốc độ | Chat, gửi OTP, tạo phòng, kết nối, đăng nhập sai, nhập mã phòng sai: vượt ngưỡng ở [04] mục giới hạn tốc độ thì bị chặn theo đúng thời gian khoá của từng loại rồi mở lại; báo lỗi chung (ngưỡng theo [04], PO uỷ quyền agent chốt 04/10/2026) |
| Nhập liệu | Tham số sai kiểu/quá dài/có ký tự điều khiển bị từ chối |
| OTP (Phương án B, [04] mục 3.1) | Hạn mã 180 giây và gửi lại tối thiểu 60 giây (kiểm cấu hình thực tế); **giới hạn tốc độ xác minh** chặn nhập sai liên tục từ một địa chỉ (mục tiêu 5 lần/5 phút), ghi **số đo thực** vì chỉ là gần đúng; người dùng còn cờ `PENDING` hoặc `completed_at` rỗng **không dùng được ứng dụng** dù có phiên Supabase; client **không ghi trực tiếp** được vào `profiles`; hoàn tất đăng ký có khả năng phục hồi: giết tiến trình **giữa các bước (a)–(d2)**, trong đó **giữa (c)/(d1) và giữa (d1)/(d2)**, thì tác vụ phục hồi phân nhánh: **chưa ghi completed_at** → giữ chặn và dọn sau thời hạn, email/username đăng ký lại được; **đã ghi completed_at nhưng còn PENDING** → chỉ hoàn tất xoá cờ, không xoá tài khoản, giữ username/mật khẩu. Chạy phục hồi lặp và đồng thời với đăng ký không làm hỏng tài khoản hoàn tất; đăng ký dở rồi gửi lại cùng email thì **dùng lại** người dùng dở (không xoá, không phá phiên OTP đang chạy; thử **gửi lại và đăng ký đồng thời** cùng một email); người dùng tạo trực tiếp bằng API công khai **không có cờ `PENDING`** (hoặc máy chủ chết trước khi đặt cờ) vẫn bị quét sau 60 phút cộng tối đa chu kỳ 5 phút khi phụ thuộc hoạt động và không bị chặn nhầm tài khoản đã hoàn tất hay Google; hai lệnh đồng thời trên cùng ván được xử lý tuần tự ([04] mục 4.2); lỗi ghi cơ sở dữ liệu không phát thế cờ mới |
| Chặn/khoá | Người bị đuổi và phòng `LOCKED` thật sự bị chặn ở máy chủ (không chỉ ở giao diện) |

---

## 6. Hiệu năng, quy mô, trợ năng

| Mã | Phép đo | Ngưỡng |
|---|---|---|
| NFR-01 | Từ lúc máy chủ **nhận** lệnh nước đi đến lúc **client người xem nhận** thế mới (đo tại client người xem), mạng cục bộ | < 100 ms (p95). Thời gian xử lý riêng ở máy chủ cũng được ghi để phân tích, nhưng tiêu chí nghiệm thu là số đo ở client |
| NFR-02 | **50 kết nối đồng thời = 10 ván chạy (20 người chơi) + 30 kết nối khác (người xem, Sảnh, chat)**, mỗi ván đi nước đều đặn trong 10 phút | 0 lỗi mất kết nối ngoài ý muốn; độ trễ nước đi p95 < 300 ms; bộ nhớ và CPU của máy chủ ổn định (không tăng liên tục) |
| NFR-03 | Ma trận trình duyệt: Chrome, Edge, Firefox, Safari bản mới; màn 360/390/1366/1920 | Không lỗi chức năng, không cuộn ngang |
| NFR-A11Y | Tương phản các cặp màu ở DESIGN §2 (đã tính lại bằng công thức), bàn phím, nhãn, giảm chuyển động | Đạt WCAG 2.1 AA ở các trạng thái chính; tương phản của **từng trạng thái** (hover, vô hiệu, trong suốt) phải đo thêm khi dựng thật |
| NFR-07 | Khởi động lại khi có ván online và AI P1 | Online INTERRUPTED từ dữ liệu đã lưu, kết quả trung tính; AI P1 thông báo không còn trạng thái, về Sảnh/chủ động tạo mới; không dựng bản ghi giả |
| NFR-08 | Gây lỗi (máy cờ sập, ghi cơ sở dữ liệu lỗi, khởi động lại) rồi đọc nhật ký (PO đã duyệt 04/10/2026) | Có mục nhật ký đúng mã; không có mật khẩu/OTP/token/chat |
| NFR-09 | Chạy tác vụ dọn: chat phòng `CLOSED`, phiên Khách hết (P2), biên lai > 24 giờ, nhật ký > 14 ngày (PO đã duyệt 04/10/2026) | Dữ liệu đúng loại đã xoá; ván online và nước đi còn nguyên; ván AI P1 không có bản ghi bền; chat 1-1 không bị xoá theo phòng |
| NFR-10 | Gửi chuỗi chứa HTML/script/`javascript:` vào chat, tên hiển thị, tên phòng (PO đã duyệt 04/10/2026) | Hiện nguyên văn như chữ; không script chạy, không điều hướng |

Phương pháp tải: tập lệnh tạo 50 kết nối thử (tài khoản kiểm thử, không dùng email thật): **10 cặp** vào 10 phòng và mỗi cặp đánh một ván ngẫu nhiên hợp lệ (20 kết nối); **30 kết nối còn lại** làm người xem qua link/mã/lời mời phòng tự tạo (mỗi phòng tối đa 5, không nhất thiết đủ), hoặc ở Sảnh; gửi chat ở phòng khi có quyền. Bố trí một phòng chọn N=5 và đủ 5 người xem để kiểm quyền/đồng bộ; thử cả Vào xem từ PUBLIC và mã/link. 30 kết nối khác phân bổ người xem và Sảnh, không vượt trần đã chọn, tối đa 5 người xem/phòng. Ghi thời gian máy chủ nhận lệnh/phát và độ trễ nhận ở client người xem. **Phần media của GATE-LOAD** (PO duyệt 04/10/2026, theo hướng nhẹ): chạy ở **quy mô nhỏ, khoảng 3 phòng** (6 người chơi bật camera và mic ở mức *Đối thủ và người xem*, mỗi phòng 1 người xem media; mỗi ván đi 1 nước/5 giây, 1 tin chat/10 giây); **chỉ ghi số đo** (số luồng, băng thông, mức dùng hạn mức gói miễn phí) tách khỏi bài tải socket, **không đặt ngưỡng đạt** và **không nằm trong điều kiện đạt của P1**; lý do: tránh dùng hết hạn mức miễn phí của LiveKit trước buổi demo. Không chạy cấu hình 10 ván (20 người phát, 40 luồng).

---

## 7. Dữ liệu, môi trường, quy trình

* **Môi trường:** máy nhà phát triển, dự án Supabase/LiveKit thử nghiệm riêng; không dùng bí mật hoặc dữ liệu production. Kiểm thử đơn vị có thể giả OTP; nghiệm thu gửi thư dùng OTP thật đến email thành viên nhóm theo BA 10.1, không dùng giả lập làm bằng chứng.
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


### Bổ sung kiểm P1 theo quyết định 05/10/2026

- Google: thử tuổi bản tạm trước/sau 60 phút, chu kỳ 5 phút khi phụ thuộc hoạt động; hoàn tất cạnh tranh với dọn, tiến trình lỗi rồi phục hồi, tài khoản cũ/đã hoàn tất không bị xoá. Không tự liên kết email trùng.
- Phiên: thử mốc hạn cố định không trượt theo hoạt động/refresh/chuyển tab; tab cũ tự reconnect vẫn chỉ đọc; đăng nhập thiết bị khác giữa ván online/AI xử thua ngay, thiết bị cũ mất API/Socket/media, thiết bị mới về Sảnh. Thử phiên OTP trực tiếp tài khoản hoàn tất bị từ chối ở ứng dụng. Hết hạn đăng nhập 12 giờ/30 ngày trong online/AI, mất quyền điều khiển và đăng nhập lại đúng tài khoản trên cùng thiết bị trước/sau hạn; thiết bị khác vẫn xử thua theo BA 1.8. Online vẫn trừ giờ nên có thể hết đồng hồ trước khi hết 60 giây; token truy cập được làm mới không tự ngắt ván. Đăng xuất chủ động vẫn xác nhận đầu hàng.
- UI: bốn lựa chọn Sảnh đúng P1/P2; danh sách PUBLIC/Vào xem hoạt động; CODE_ONLY/LOCKED không hiện và không vào được qua mục cũ. Máy tính phòng tự tạo mặc định chỉ Kênh Riêng, mở cả hai/đóng bớt một; điện thoại hai tab; người xem chỉ Kênh Chung. Phông theo bốn token DESIGN §3.1, không đổi quyền theo bố cục.

## 10. Nghiệm thu P2 và hồi quy

Nguồn AC chi tiết: Nhóm I–N trong [01], toàn bộ mục kiểm đối ứng tại [08](08-ma-tran-nghiem-thu.md). Không dùng tóm tắt P2 cũ để chia việc bỏ sót nhánh.

| Miền | Tình huống tối thiểu ngoài happy path |
|---|---|
| Tài khoản P2 | Guest đến hạn khi còn ghế và sau rời; đối thủ giữ lịch sử ẩn danh; OTP đúng mục đích; đổi username cạnh tranh và giữ tên 30 ngày; dữ liệu UUID không đổi |
| Đánh Hạng | Cấm người xem/Khách/đi lại/Tái đấu ở API; biên hàng đợi, Huỷ đua MATCH_FOUND; mất mạng hàng đợi 30 giây; giới hạn cặp trượt 24 giờ tính INTERRUPTED; Elo ván 30/31, sàn, làm tròn, cập nhật trùng; Top 50 và thứ tự đồng hạng; FINISHED không quay về WAITING, rời mới tìm trận khác |
| CASUAL mở rộng | Ghép ngẫu nhiên cố định 15 phút/bên, không cộng giây, phe ngẫu nhiên; API chặn xem/mời/chia sẻ/Kênh Chung. Xin đi lại và Tái đấu có ở cả phòng tự tạo/ghép ngẫu nhiên, không hoàn giờ; Tái đấu ghép ngẫu nhiên reset 15 phút. Một người rời sau ván vẫn FINISHED, không người mới, hạn 10 phút không reset. Đổi bên, không giới hạn/chống treo và QR chỉ phòng tự tạo; đề nghị trễ/rút/cooldown, giữ phòng/chặn và QR bị thu hồi |
| Xã hội | Huỷ bạn khi đang mở chat; quyền đọc trực tiếp; unread đếm tin đến, chỉ đọc khi vào vùng nhìn tab hoạt động; tải nền không đọc; huỷ/kết bạn lại giữ trạng thái và đồng bộ thiết bị; sticker đủ 12 và chịu rate limit; Thách đấu mở form đúng mặc định, huỷ không tạo, lỗi mời giữ phòng; không thành ghép Ranked; người xem vượt trần phòng hiện hành bị chặn |
| Lịch sử/xuất | Quyền chính chủ, ván 0 nước và INTERRUPTED/ABANDONED; nhánh đã undo không phát lại; FEN theo con trỏ; PGN nhập thật vào công cụ ngoài |
| Tiện ích/giao diện | DEMO_MODE tắt vẫn chặn API; thông số máy là số thật; nhiều tab chỉ một nơi phát; Giấy Sáng/Theo hệ thống kiểm mọi trạng thái, không biến thành P1 |

P2 cần đạt AC P2, hồi quy AC P1 còn áp dụng, bảo mật/trợ năng/NFR liên quan; không có lỗi Cao/Nghiêm trọng.

## 11. Cổng kiểm chứng kỹ thuật trước cam kết triển khai

**Mọi cổng bên dưới hiện NOT_RUN**. Hoàn thiện đặc tả không thay kết quả thực. Cổng thất bại thì ghi BLOCKED, giải thích phương án cho Product Owner; không tự đổi nguồn luật hoặc công nghệ.

| Mã | P | Câu hỏi cần chứng minh | Bằng chứng để thông qua |
|---|---|---|---|
| GATE-OTP | P1 | Gọi trực tiếp API đổi email của Auth bằng phiên hợp lệ phải không đổi được email (PO đã duyệt 04/10/2026); Supabase đáp ứng OTP 6 số, 180 giây, 60 giây gửi lại, chặn gần đúng, **với SMTP mặc định của Supabase (PO duyệt 04/10, BA 10.1)**: đăng ký thành công với email thành viên nhóm trong hạn mức hiện hành của Supabase (ghi số đo thực: số thư gửi được/giờ); email ngoài nhóm hoặc vượt hạn mức thì gửi mã lỗi được báo cho người dùng và không để lại tài khoản kẹt (PO đã duyệt 04/10/2026); phục hồi tài khoản không kẹt | Cấu hình đã che bí mật, số đo thực, ca gián đoạn/đồng thời TC-X-01/02; chưa completed_at/còn PENDING không dùng được |
| GATE-MEDIA | P1 | LiveKit publish/subscribe theo từng người, thu quyền khi đổi ghế/chia sẻ/tiếp quản; token mang quyền cũ không lấy lại được quyền đã mất (đuổi/đổi vai/tiếp quản), trong khi quyền mới hợp lệ vẫn dùng được; dùng LiveKit Cloud (PO chọn 04/10/2026); ghi cửa sổ hiệu lực thực tế của thu hồi và mức dùng hạn mức gói miễn phí (phút người tham gia, GB, kết nối đồng thời), chỉ ghi số đo thật, không đặt ngưỡng đạt (PO đã duyệt 04/10/2026) | Log quyền và thử bằng client không được phép; không nhận track trái quyền, không chỉ ẩn UI |
| GATE-AI | P1 | Máy cờ tự viết đạt thời gian/sức mạnh/độ sâu và ổn định | Cấu hình máy, seed/bộ thế, số đo tại mục 3.2; không giảm ngưỡng để đạt |
| GATE-PERFT | P1 | Bộ số perft làm oracle có đúng không | Bộ sinh nước độc lập, phiên bản/nguồn, kết quả so sánh; không tự sửa kỳ vọng theo code đang kiểm |
| GATE-GOOGLE | P1 (PO kéo từ P2 lên 04/10/2026) | Google onboarding và đăng nhập kép không tự liên kết email trái BA 1.2 | Thử email mới/cùng email/danh tính cũ, bỏ dở và hoàn tất; gọi trực tiếp Auth để kiểm không tự liên kết. Dọn bản Google mới chưa hoàn tất sau 60 phút, chu kỳ 5 phút khi dịch vụ hoạt động; cạnh tranh hoàn tất/dọn, phục hồi lỗi, bảo vệ tài khoản cũ/đã hoàn tất; chứng minh chưa hoàn tất không dùng ứng dụng (TC-X-26) |
| GATE-SESSION | P1 (hồi quy P2) | Hạn phiên chính thức 12 giờ/30 ngày có được cưỡng chế ở máy chủ đúng BA 1.8, tách khỏi hạn token truy cập? | Thử ở API/Socket đang mở, token cũ và đăng nhập lại đúng/sai tài khoản; online ân hạn 60 giây, đồng hồ vẫn chạy; AI giữ 30 phút; quá hạn theo luật hiện có. Ghi mốc thời gian và quyền thực tế, không chỉ ảnh UI (TC-X-27) |
| GATE-PGN | P2 | Tệp xuất được công cụ ngoài đọc đúng | Chính tệp xuất, tên/phiên bản công cụ, số nước/thế cuối/kết quả tái dựng khớp; FEN được parse độc lập |
| GATE-LOAD | Theo đợt phát hành | Quy mô và độ trễ theo NFR, cả người xem và media | Bài tải, môi trường, số kết nối/ván, p95 thực, lỗi và CPU/RAM; tách số đo máy chủ và client |

Nơi chạy demo đã chốt 04/10/2026: **ưu tiên chạy cục bộ**, Render là dự phòng (BA 10.1). Lựa chọn thư viện QR và biểu tượng là quyết định triển khai chưa đo/chưa chọn; không chặn việc mô tả nghiệp vụ nhưng cần đưa vào phụ thuộc lập kế hoạch. Tiêu chí hội đồng ngoài D1–D10 chỉ bổ sung khi Product Owner cung cấp, không tự phát minh.

[01]: 01-yeu-cau-chi-tiet.md
[02]: 02-luat-co-tuong.md
[03]: 03-du-lieu.md
[04]: 04-kien-truc.md
[05]: 05-kiem-thu.md
