# P1 · YC4 — Bàn cờ, lõi luật, thao tác và âm thanh

> **BA 0.27 — PO chốt 31/10/2026:** toàn bộ nội dung từng thuộc P2 (Ranked/Elo/bảng xếp hạng, ghép ngẫu nhiên Casual, Xin đi lại/Tái đấu Casual, phần Ranked của lịch sử/thống kê) nay thuộc **P1**. Mọi câu "vẫn P2 / giữ P2 / làm sau / Sắp ra mắt" còn lại trong tài liệu này là lịch sử và bị thay bởi [BA mục 0.27](BA-SCOPE-DECISIONS.md#027-đưa-toàn-bộ-phần-còn-lại-của-p2-lên-p1--po-chốt-31102026); QR vẫn bị loại. Chưa tái ước lượng giờ/Jira; chưa phải bằng chứng triển khai.

**Rà soát 31/10/2026:** PO chốt bốn điểm tại mục 16 (chuyển chọn quân, hiện nước ngay, không xác nhận nước đi, ký hiệu xuất); **đã có mã và test local 31/10/2026, chưa nghiệm thu** (xem 16.3).

**Ngày lập/chốt bổ sung:** 31/10/2026. **Phạm vi đã duyệt:** EP-04, US-04.1–04.3 và sáu phần mở rộng tại BA0.22/mục12–14. **Trạng thái:** đã chốt đặc tả và đối chiếu mã nguồn; chưa nghiệm thu lại YC4 hoặc phần bổ sung trong lượt này. Không tự cập nhật Jira/lịch hoặc coi có code là đã hoàn thành.

## 1. Mục tiêu và nguồn quyết định

Một bàn cờ dùng chung cho online, người xem và đấu máy: đúng thế khai cuộc, đúng luật rút gọn của dự án, thao tác nhất quán bằng chuột/chạm/bàn phím, thể hiện lượt và chiếu rõ ràng. Client hỗ trợ thao tác; server mới quyết định nước đi và kết quả thật.

Thứ tự nguồn:

1. [BA-SCOPE-DECISIONS.md](BA-SCOPE-DECISIONS.md) **Phần 0**, đặc biệt0.3,0.12,0.17,0.20–0.22.
2. BA 3.1, 3.3–3.6, 6.1, 6.3, 9.1–9.3, 10.4; phạm vi ngoài P1 vẫn giữ nguyên nếu chưa có quyết định thay thế.
3. [BACKLOG-P1.md](BACKLOG-P1.md), EP-04; [DESIGN.md](../design/DESIGN.md) §7–8 cho hình học, dấu hiệu, bố cục và trợ năng.
4. [BACKLOG-P2.md](BACKLOG-P2.md) giữ Story/AC/Jira nguồn của phần đã chuyển P1 và phần còn P2.

Tài liệu này làm rõ cách triển khai/nghiệm thu, không thay bộ luật BA. Khi có xung đột, báo PO và giữ nguồn ưu tiên cao hơn; không sửa luật theo hành vi code đang có.

**Lưu ý số lượng:** danh sách chi tiết EP-04 có **25 AC**: US-04.1 có 11, US-04.2 có 4, US-04.3 có 10. Bảng tổng hợp Epic đang ghi 16; dùng danh sách ID chi tiết để kiểm YC4, chưa tự sửa tổng baseline 268 AC hoặc báo cáo Jira sinh tự động.

## 2. Phạm vi và ranh giới

| Chủ đề | YC4 chịu trách nhiệm | Giao điểm / không tự mở rộng |
|---|---|---|
| Khởi tạo | 90 giao điểm, 32 quân, Đỏ đi trước | YC2 tạo ván đúng thời điểm sau Ready/Tái đấu |
| Lõi luật | Sinh/áp nước hợp lệ, an toàn Tướng, phân xử kết thúc theo luật | YC5 kiểm quyền, phiên bản, thời gian và ghi kết quả |
| Trình bày | SVG, quân chữ Hán, góc nhìn theo phe, dấu chọn/đích/nước vừa đi/chiếu | Không tùy chọn quân Latin/Việt; theme không đổi luật hoặc mặt quân |
| Điều khiển | Click/chạm, kéo thả, bàn phím; gửi ý định từ–đến | Không tin kết quả tính cục bộ thay server |
| Âm thanh | Đi/ăn/chiếu/kết thúc, nút tắt tiếng | Không tự bật camera/mic; lỗi audio không gián đoạn ván |
| Người xem | Bàn cờ chỉ đọc và cùng trạng thái mới nhất | YC6 quản quyền vào/xem; YC7 chat/media |
| AI | Dùng cùng bàn và lõi luật | YC8 chọn cấp độ/phe, worker, ngân sách tính toán, lỗi máy |
| Đi lại, lịch sử, Replay, xuất ván | P1 theo BA0.22, chi tiết mục12–14 | Undo custom cho thành viên/Khách; Undo AI và History/Replay/export chỉ thành viên; Casual/Ranked P1 theo BA 0.27 |

Không thuộc cả P1/P2 theo BA: gợi ý nước tốt cho người chơi, bộ luật giải đấu đầy đủ, xử đuổi quân riêng. Chấm nước hợp lệ là chỉ dẫn hợp lệ, **không phải hint AI**.

## 3. Vai trò và quyền thao tác

| Chủ thể / trạng thái | Thấy bàn | Được chọn / gửi nước |
|---|---|---|
| Thành viên hoặc Khách đang ngồi ghế, ván ACTIVE, đúng lượt, tab có quyền điều khiển | Theo phe của mình | Có, nếu không đang gửi lệnh hoặc bị ràng buộc của ván |
| Người chơi chưa tới lượt | Theo phe của mình | Không; không hiện đích hợp lệ như thể được đi |
| Người xem | Mặc định Đỏ phía dưới | Không; API/socket cũng phải từ chối nước giả |
| Tab chỉ đọc hoặc mất quyền điều khiển | Theo vai trò hiện tại | Không; không giành quyền chỉ bằng click bàn |
| Đang gửi nước | Quân đã hiện ở đích, không có chỉ báo chờ nhìn thấy (PO 31/10) | Không gửi nước thứ hai |
| Mất kết nối / đang đồng bộ lại | Trạng thái gần nhất kèm thông báo | Không coi nước cục bộ là đã được chấp nhận |
| Ván kết thúc | Thế cuối cùng | Chỉ đọc; ván mới phải có Match ID mới |
| Replay P1, thành viên là người chơi/chủ ván AI | Theo phe của chủ ván | Chỉ tua mốc, tuyệt đối không gửi nước vào ván live; Khách/người xem/người ngoài không được đọc |

WAITING/đếm 3 giây không phải ván đang cho phép đi. Việc thay ghế, đổi phe hoặc Tái đấu phải cập nhật góc nhìn và xóa chọn/kéo cũ.

**Quyền bổ sung BA0.22:** trong custom, thành viên và Khách cùng được gửi/đồng ý/từ chối/rút Xin đi lại theo vai trò; người xem không có quyền. Trong AI, chỉ thành viên được Undo. Khách không History/Replay/FEN/PGN, kể cả ván custom mình tham gia; thành viên đối thủ vẫn xem/xuất được ván của họ. Không suy quyền Undo online sang AI hoặc ngược lại.

## 4. Bàn cờ và trạng thái khai cuộc

### 4.1 Tọa độ chuẩn

- Bàn có **9 cột × 10 hàng**, quân nằm tại giao điểm, không nằm giữa ô.
- Tọa độ dữ liệu: `x=0..8`, `y=0..9`, chỉ số `y*9+x`; Đen ban đầu ở trên (`y=0`), Đỏ ở dưới (`y=9`).
- Phe Đen nhìn bàn lật 180°, nhưng tọa độ gửi server và nhãn trợ năng giữ tọa độ gốc. Chữ trên quân và chữ sông vẫn đọc thuận.
- Sông giữa `y=4` và `y=5`; cung Đen `x=3..5,y=0..2`, cung Đỏ `x=3..5,y=7..9`.

### 4.2 Bố trí 32 quân

Mỗi bên: 1 Tướng, 2 Sĩ, 2 Tượng, 2 Xe, 2 Mã, 2 Pháo, 5 Tốt/Binh.

| Hàng y | Quân từ trái sang phải theo tọa độ gốc |
|---|---|
| 0 | Xe Đen, Mã Đen, Tượng Đen, Sĩ Đen, Tướng Đen, Sĩ Đen, Tượng Đen, Mã Đen, Xe Đen |
| 2 | Pháo Đen tại x=1,7 |
| 3 | Tốt Đen tại x=0,2,4,6,8 |
| 6 | Binh Đỏ tại x=0,2,4,6,8 |
| 7 | Pháo Đỏ tại x=1,7 |
| 9 | Xe Đỏ, Mã Đỏ, Tượng Đỏ, Sĩ Đỏ, Tướng Đỏ, Sĩ Đỏ, Tượng Đỏ, Mã Đỏ, Xe Đỏ |

Các giao điểm còn lại trống. Đỏ đi trước; bộ đếm không ăn quân bằng 0, số nước đầy đủ bắt đầu 1.

| Loại | Đỏ | Đen |
|---|---|---|
| Tướng | 帥 | 將 |
| Sĩ | 仕 | 士 |
| Tượng | 相 | 象 |
| Xe | 俥 | 車 |
| Mã | 傌 | 馬 |
| Pháo | 炮 | 砲 |
| Tốt/Binh | 兵 | 卒 |

Không dùng màu làm dấu phân biệt duy nhất: giữ viền/hình dạng phân biệt hai phe và nhãn tiếng Việt; chú giải 14 mặt quân có thể thu gọn.

## 5. Bộ luật di chuyển dùng chung — US-04.1

| Quân | Hợp lệ | Ca phải loại |
|---|---|---|
| Tướng | Một giao điểm ngang/dọc trong cung | Ra cung, đi chéo, tự chiếu, mở mặt hai Tướng |
| Sĩ | Một giao điểm chéo trong cung | Đi ngang/dọc hoặc ra cung |
| Tượng | Hai giao điểm chéo, mắt giữa trống, không qua sông | Bị chặn mắt; qua sông |
| Xe | Ngang/dọc tới ô trống hoặc ăn quân địch đầu tiên | Nhảy qua quân; ăn quân mình |
| Mã | Hai theo một hướng và một vuông góc; chân Mã trống | Chân Mã bị quân bất kỳ chặn |
| Pháo | Đi không ăn như Xe; ăn khi đúng một ngòi nằm giữa | Không ngòi hoặc từ hai ngòi khi ăn; nhảy ngòi để tới ô trống |
| Tốt/Binh | Một giao điểm tiến; qua sông thêm ngang một giao điểm | Đi lùi, đi chéo; đi ngang khi chưa qua sông |

Binh Đỏ tiến theo y giảm, qua sông khi y≤4; Tốt Đen tiến theo y tăng, qua sông khi y≥5. Tới hàng cuối không phong cấp, vẫn đi ngang nếu hợp lệ.

Quy tắc chung:

1. Chỉ quân của bên tới lượt; đích trong bàn và không có quân cùng bên.
2. Áp nước thử rồi kiểm an toàn Tướng; không để Tướng mình còn hoặc mới bị chiếu.
3. Không để hai Tướng cùng cột mà không có quân chắn.
4. Không kết thúc bằng thao tác ăn Tướng trực tiếp; kết thúc bằng phân xử chiếu hết/hết nước và các điều kiện BA.
5. Ăn quân đặt lại bộ đếm không ăn về 0; nước không ăn tăng 1 **kể cả nước đi Tốt/Binh**. Không áp bộ đếm 50 nước của cờ vua.
6. Online, client và engine dùng `packages/xiangqi-core`; không chép một bản luật riêng vào từng bề mặt.

Chuỗi thế nội bộ gồm bố trí, bên tới lượt và bộ đếm. Parse/serialize round-trip phải giữ đủ trạng thái đó. Một FEN đơn lẻ **không chứa toàn bộ lịch sử lặp**, nên không đủ tự khôi phục phân xử lặp ba lần.

## 6. Kết thúc theo luật và thứ tự ưu tiên

### 6.1 Kết quả của lõi luật

| Điều kiện | reason | winner / giải thích |
|---|---|---|
| Bên tới lượt bị chiếu và không có nước hợp lệ | `CHECKMATE` | Bên còn lại thắng |
| Bên tới lượt không bị chiếu nhưng không có nước hợp lệ | `STALEMATE` | Bên còn lại thắng; **không hòa** |
| Thế xuất hiện lần thứ ba, chỉ một bên chiếu ở mọi nước của mình trong chu kỳ | `PERPETUAL_CHECK` | Bên chiếu liên tục thua |
| Cả hai bên đều chiếu liên tục trong chu kỳ | `PERPETUAL_CHECK` | Hòa, winner=null; không hiển thị một bên thua chỉ vì tên reason |
| Thế xuất hiện lần thứ ba, không có ngoại lệ chiếu liên tục | `DRAW_REPETITION` | Hòa |
| 120 nửa nước liên tiếp không ăn quân, không có kết quả ưu tiên cao hơn | `DRAW_NO_CAPTURE` | Hòa |

Hai thế giống nhau khi vị trí mọi quân và **bên tới lượt** giống nhau; khác bộ đếm vẫn có thể là cùng thế để xét lặp. Chu kỳ xét chiếu gồm **mọi nước từ lần xuất hiện thứ nhất đến lần thứ ba** của thế, không chỉ vòng cuối. Chỉ nhánh hiệu lực được tính khi có Đi lại ở phạm vi được duyệt.

### 6.2 Thứ tự xử lý

- Server kiểm thời gian/điều kiện kết thúc đã đến hạn trước khi duyệt nước; không cho nước chiếu hết gửi sau hạn đảo ngược kết quả hết giờ.
- Với một nước đã được chấp nhận: chiếu hết ưu tiên cao nhất; hết nước và chiếu liên tục gây thắng/thua ưu tiên trước hòa 120 nửa nước (BA 0.17).
- Code lõi hiện xét hết nước → lặp/chiếu liên tục → 120 nửa nước. Không đổi thứ tự này chỉ để theo một chuẩn luật bên ngoài.
- `RESIGN`, `TIMEOUT`, `DISCONNECT`, `INACTIVITY`, `DRAW_AGREEMENT`, `INTERRUPTED` thuộc điều phối YC5, không thêm vào luật di chuyển. `INTERRUPTED` trung tính, không thắng/thua/hòa.
- Đuổi quân không phân xử riêng trong cả P1/P2; áp luật lặp nếu đủ điều kiện.

## 7. Chọn, đi quân và kéo thả — US-04.3

### 7.1 Click / chạm / bàn phím

1. Đủ quyền và đúng lượt: chọn quân mình → vòng chọn + mọi đích hợp lệ của riêng quân đó.
2. Đích trống dùng chấm; đích ăn quân dùng vòng cố định quanh quân địch, không nhấp nháy.
3. Chọn đích hợp lệ → gửi một ý định từ–đến, chuyển chờ phản hồi.
4. Click lại quân, click đích không hợp lệ hoặc Esc → bỏ chọn. Khi đã chọn mà bấm quân mình khác thì **chuyển chọn ngay** sang quân mới (PO 31/10, mục 16).
5. Bàn phím: mũi tên theo hướng đang nhìn; Enter/Space chọn/xác nhận; Esc hủy; focus nhìn thấy, không tạo 90 điểm Tab liên tiếp.
6. Thay thế cờ, lượt/quyền, pending hoặc góc nhìn → hủy lựa chọn/kéo cũ; không gửi dựa trên thế đã lỗi thời.

### 7.2 Kéo thả

- Chuột và chạm giữ dùng cùng luật chọn/đích; quy đổi tọa độ SVG khi co giãn hoặc lật bàn.
- Thả đích hợp lệ gửi một lệnh; click phát sinh sau pointerup không được tạo lệnh thứ hai.
- Thả ngoài bàn/đích sai trả quân về nguồn, không đổi trạng thái thật; giảm chuyển động thì không chạy hiệu ứng trượt.
- `pointercancel`, mất quyền hoặc snapshot đổi giữa lúc kéo: hủy kéo an toàn, không áp nước cũ.
- Kéo thả không phải cách duy nhất; trên 360px luôn dùng được chạm quân → chạm đích.

### 7.3 Chờ, lỗi và đồng bộ

| Trạng thái | Thể hiện / hành vi |
|---|---|
| SUCCESS | Thế mới từ server, lượt đổi, dấu nước cuối cập nhật |
| LOADING ban đầu | Chỉ báo đang tải/đồng bộ; không cho tương tác với khai cuộc giả |
| PENDING nước | Quân **hiện ngay** ở đích như đã đi (không dấu, không chữ chờ), khóa gửi thêm bằng `aria-busy`; máy chủ từ chối thì hoàn về và báo lỗi (PO 31/10, mục 16.1) |
| EMPTY / không có ván | Phòng chờ hoặc thông báo phù hợp; không cho đi trên bàn minh họa |
| ERROR | Lỗi tiếng Việt, không tự ăn quân/đổi lượt; đồng bộ lại trạng thái server khi cần |
| DISABLED | Giải thích theo vai trò/lượt/quyền; không chỉ nút mờ không lý do |

Reconnect lấy snapshot server, không phát lại nước thành công như một nước mới. Ván mới đổi Match ID phải đặt lại chọn/kéo/dấu ván cũ và bộ ghi nhận âm thanh theo ván.

## 8. Dấu hiệu, âm thanh và bố cục gọn

### 8.1 Dấu hiệu bắt buộc

- Nước vừa đi: **bốn góc vuông ở nguồn và đích** theo BA 3.4/DESIGN 7.4; người xem cũng thấy.
- Chiếu: vòng quanh Tướng + biểu tượng + “Đang bị chiếu”; tối đa một nhịp sáng khi mới bị chiếu, không rung/nhấp nháy vô hạn; reduced motion tắt chuyển động.
- Focus bàn phím không được biến mất; nhãn quân/ô dùng tên tiếng Việt, tọa độ gốc.
- Mọi theme P1 phải giữ contrast và khả năng nhận biết các dấu; không thay bảng màu bàn cờ chỉ vì đổi theme tài khoản.

### 8.2 Âm thanh

Bốn loại tạo bằng Web Audio API, không tải MP3: đi quân, ăn quân, chiếu, kết thúc. Nút loa có tên trợ năng ở góc trên bàn; tắt dừng âm đang phát và giữ lựa chọn tối thiểu qua các ván cùng phiên trình duyệt. Chính sách autoplay hoặc AudioContext lỗi không được chặn đi quân.

Code online hiện ưu tiên âm chiếu hơn ăn, ăn hơn đi cho cùng nước; âm kết thúc có thể phát sau đó. Snapshot đầu/reconnect không phát lại lịch sử. Cần kiểm tai nghe/loa thật trước khi kết luận chất âm phù hợp; đọc code/test không thay kiểm nghe.

### 8.3 Bố cục và kích thước

- Tái sử dụng component/token hiện tại; không tạo trang mới chỉ để hiển thị bàn hoặc luật.
- Desktop 1366×768: ưu tiên trọn bàn, lượt, đồng hồ và hành động ván trong viewport; chat/người xem/biên bản cuộn nội bộ. Camera không đè bàn.
- Điện thoại 360px: không cuộn ngang; bàn không méo, chạm đủ rõ; chat/media dùng khu vực hoặc tab riêng, không dồn mọi panel thành trang dài.
- Không ép toàn trang `overflow:hidden` khiến mất Đầu hàng, banner chống treo hoặc focus khi zoom/bàn phím ảo. Cỡ màn thấp có thể cần cuộn dọc để giữ trợ năng; mục tiêu là hạn chế cuộn, không cắt nội dung.
- Chú giải quân, luật và chức năng phụ thu gọn; không lặp lại cùng thông tin thành nhiều thẻ.
- Replay P1: bàn và toolbar cố định trong khung, biên bản cuộn nội bộ; điện thoại ưu tiên bàn rồi toolbar/biên bản. Không nhét công cụ Replay vào bàn live.

## 9. Hợp đồng dữ liệu và an toàn

1. Container giữ kết nối/quyền/lệnh; `XiangqiBoard` nhận position, orientation, playerSide, disabled/pending, lastMove, onMove. Khối vẽ không truy vấn DB hay tự gửi socket.
2. Online dùng `commandId`, Match ID và `matchVersion`; tọa độ nguyên trong 0..89. Server kiểm phiên, đúng ghế/tab, lượt, phiên bản, thời gian và luật; client không gửi winner hoặc thế mới để server tin.
3. Ghi ván/phòng qua transaction `withRoom`, biên lai chống trùng, phát realtime/outbox sau commit; không phát thế mới trước khi ghi thành công.
4. Snapshot không hợp lệ không được “sửa” bằng fallback khai cuộc; báo lỗi và lấy lại trạng thái.
5. FEN nội bộ chỉ là mã hóa, không đồng nghĩa sản phẩm đã có tính năng Copy FEN hoặc import FEN. Không tự thêm nhập thế, editor hay phân tích engine.
6. History/replay/export P1: quyền chủ ván kiểm ở API/DB, không chỉ route; không lộ ván qua đoán ID, cache hoặc response cũ sau đổi tài khoản.

## 10. Truy vết đủ 25 AC và kế hoạch nghiệm thu

Bảng dưới là **kế hoạch**, không phải kết quả PASS của lượt soạn tài liệu.

| AC nguồn | Điều cần chứng minh | Kiểm chính |
|---|---|---|
| AC-04.1.1 | Khai cuộc 44 nước; perft depth2=1.920, depth3=79.666 | Bộ đáp án độc lập, không lấy output implementation làm chuẩn |
| AC-04.1.2 | Chân Mã, mắt/sông Tượng, cung, ngòi Pháo, Tốt | Thế nhỏ hợp lệ/không hợp lệ tại biên |
| AC-04.1.3 | Tự chiếu và hai Tướng đối mặt bị loại | Sinh nước và gọi áp nước trực tiếp |
| AC-04.1.4 | CHECKMATE đúng bên thua | Thế chiếu hết có đáp án |
| AC-04.1.5 | STALEMATE là thua, không hòa | Thế hết nước không chiếu |
| AC-04.1.6 | Lặp ba lần và ngoại lệ chiếu liên tục | Chu kỳ không chiếu/một bên/hai bên |
| AC-04.1.7 | 120 nửa nước không ăn | Biên119/120, ăn reset, Tốt không ăn không reset |
| AC-04.1.8 | Ưu tiên kết quả và kiểm giờ trước nước | Các thế chạm đồng thời; tích hợp YC5 |
| AC-04.1.9 | Parse/serialize giữ thế/lượt/bộ đếm | Round-trip và input hỏng |
| AC-04.1.10 | Khác bên tới lượt không cùng thế | Cùng placement, đổi turn |
| AC-04.1.11 | Chu kỳ lần1→lần3, chỉ nhánh hiệu lực | Chu kỳ đầu khác cuối; sau Undo AI/custom không đếm nhánh đã bỏ |
| AC-04.2.1 | 90 giao điểm, sông/cung, 32 quân đúng chữ/vị trí | DOM/SVG và quan sát giao diện |
| AC-04.2.2 | Đen ở dưới, tọa độ thật không đảo | Đi bằng click/kéo ở hai góc nhìn |
| AC-04.2.3 | Desktop và 360px không cuộn ngang | Browser thật, đo viewport và chạm |
| AC-04.2.4 | Phân biệt không chỉ màu, nhãn và lượt | Keyboard, screen reader, mô phỏng mù màu |
| AC-04.3.1 | Vòng chọn, chấm đích, vòng ăn | Chọn quân có cả đích trống và ăn |
| AC-04.3.2 | Click/chạm đích hợp lệ đi đúng | Client→server→hai người/người xem; quân hiện ngay ở máy người đi, đối thủ nhận khi máy chủ xác nhận (AC-YC4-RV-02…04) |
| AC-04.3.3 | Click lại/sai/Esc hủy | Không phát nước ngoài ý muốn; bấm quân mình khác thì chuyển chọn (AC-YC4-RV-01) |
| AC-04.3.4 | Chuột/chạm kéo hợp lệ | Co giãn, lật bàn, không gửi trùng |
| AC-04.3.5 | Thả sai trả về | Ngoài bàn, pointercancel, reduced motion |
| AC-04.3.6 | Sai lượt/người xem không chọn | UI và API/socket giả mạo |
| AC-04.3.7 | Bốn góc ở nguồn/đích, mọi vai trò thấy | Quan sát người chơi và người xem |
| AC-04.3.8 | Chiếu đủ vòng/chữ/icon, không nhấp nháy lặp | Hai phe + reduced motion |
| AC-04.3.9 | Bốn âm phân biệt đúng sự kiện | Web Audio và nghe thật; reconnect không phát lại |
| AC-04.3.10 | Mute tức thì, giữ qua ván | Đang phát→tắt→ván mới; kiểm nút bàn phím |

Bổ sung hồi quy: lệnh trùng/cũ, đổi quyền giữa kéo, mất mạng đang gửi, đổi phe/Tái đấu, xem phòng, AI cầm Đen, theme sáng/tối/system. Không coi test component là đủ chứng minh server hoặc phần cứng cảm ứng/âm thanh.

## 11. Đối chiếu mã nguồn hiện tại

**Phương pháp:** đọc code và file test hiện hữu ngày lập. Không chạy app/test ở lượt này; các hàng “có code” không là bằng chứng nghiệm thu hay xác nhận Cloud đã bật.

| Hạng mục | Bằng chứng trong repo | Kết luận / việc cần kiểm |
|---|---|---|
| Luật/khai cuộc/FEN | `packages/xiangqi-core/src/{position,moves,ending}.ts` | Có lõi dùng chung và thứ tự kết quả; không cần bản luật thứ hai |
| Perft độc lập | `tests/packages/xiangqi-core/legal.test.ts` | Có fixture44/1920/79666 và thế trung cuộc, dẫn nguồn công bố; chưa chạy lại |
| Kiểm luật khác | `tests/packages/xiangqi-core/{pieces,position,ending}.test.ts` | Có test theo nhóm, cần đối chiếu đủ AC khi nghiệm thu |
| SVG và thao tác | `apps/web/src/shared/board/XiangqiBoard.tsx`; `tests/web/shared/board/XiangqiBoard.test.ts` | Có orientation, click, pointer/touch, keyboard, pending, chỉ đọc |
| Nước vừa đi | `XiangqiBoard.tsx` và `XiangqiBoardInteraction.css` | **Lệch yêu cầu:** nguồn dùng vòng/chấm, đích dùng vòng vàng; BA/DESIGN yêu cầu bốn góc. Không tự hợp thức hóa code bằng sửa BA |
| Focus bàn phím | `XiangqiBoard.tsx` gán inline outline/stroke none cho hit target | Điểm cần kiểm browser: focus phải thật sự nhìn thấy theo DESIGN; chưa kết luận đạt/lỗi chỉ bằng đọc đoạn này |
| Âm thanh online | `apps/web/src/features/rooms/game-audio.ts`; test cùng tên trong `tests/web/features/rooms/` | Có bốn âm tổng hợp, mute, chống phát lặp; chưa kiểm nghe hoặc khẳng định mọi bề mặt AI dùng cùng luồng |
| Luật người dùng đọc | `apps/web/src/features/lobby/GameRules.tsx` | Có công bố luật rút gọn, hết nước là thua và không xử đuổi riêng |
| Kiểm server online | `apps/server/src/game/match/match-store.ts` | Dùng playMove/ending, kiểm kết thúc/thời gian; cần test tích hợp cho quyền/race |
| History/Replay | `AppRouter.tsx`, `features/history/{ReplayPage,ReplayViewer}.tsx`, server `game/history/` | **Đã có code**, không phải chức năng phải viết từ đầu. Backend mặc định `HISTORY_ENABLED=false`; cần xác minh cấu hình/migration trước bật |
| Xuất FEN/PGN | `ReplayViewer.tsx`, server `replay-http.service.ts` | Có nút copy/tải và export dựa trên quyền read; chưa chứng minh tương thích công cụ bên ngoài |
| Lưu AI | `game/ai/{ai-history-store,ai-sql-transactions}.ts` | Có đường ghi terminal cho thành viên, bỏ lưu Khách; chưa chứng minh mọi ca Bỏ dở/restart |
| Đi lại AI | `game/ai/ai-games.ts` hàm undo; `features/ai/AiGamePage.tsx` | Có lùi1/2, quota3, hủy tác vụ; cần rà quyền Khách theo BA0.22 trước coi đạt. UI đang truyền onUndo/quota mà chưa phân quyền tại đoạn được đọc |

**Hai loại việc không được nhầm:** sửa sai lệch YC4 baseline (ví dụ dấu bốn góc) và hoàn thiện/nghiệm thu phần mở rộng BA0.22 đều thuộc P1. Phạm vi đã được duyệt không đồng nghĩa code, cờ runtime hoặc Cloud đã sẵn sàng; không xóa code chỉ vì còn tên P2 lịch sử.

## 12. Đối chiếu P2 và phạm vi P1 đã được PO duyệt

> **Lưu ý (rà chéo 31/10/2026):** mục này là đối chiếu lịch sử trước BA 0.27–0.36. Ghép ngẫu nhiên Casual, Ranked và các phần Casual/Ranked đã **P1** (xem [YC9](P1-YC9-GHEP-TRAN-CASUAL-RANKED.md)); mọi câu "giữ P2", "queue 3 phút", "xác nhận 10 giây" hay "vào ván ngay" bên dưới đã bị thay.

### 12.1 Liên quan trực tiếp

| Chức năng / mã nguồn | Quan hệ với YC4 | Phạm vi phải đi cùng | Quyết định PO31/10 |
|---|---|---|---|
| **Replay riêng tư** — US-P2-13 / **XIAN-127**, AC-P2-13.1–3 | Tái hiện bàn/lượt từng mốc, biên bản Việt, đầu/trước/sau/cuối, autoplay1,5s; chỉ đọc | History P2-11, nhánh hiệu lực, quyền chủ ván/API/RLS; không người xem/link chia sẻ | **P1 cho custom và AI**, không kéo Ranked theo |
| **Copy FEN / Tải PGN** — US-P2-15 / **XIAN-129**, AC-P2-15.1–3 | Xuất thế đang xem và biên bản; tận dụng serializePosition | Replay và cùng quyền; FEN mốc hiện tại, PGN toàn nhánh hiệu lực, round-trip/clipboard/download | **P1 cùng Replay**, không thêm Copy FEN trên bàn live hoặc import |
| **Đi lại với máy** — US-P2-14 / **XIAN-128**, AC-P2-14.1–3 | Đổi thế/nhánh; lùi2 hoặc hủy máy đang nghĩ rồi lùi1, tối đa3 | YC8 worker cancellation, stale result, bộ đếm, lặp/không ăn theo nhánh mới | **P1 chỉ thành viên**, Khách bị từ chối |
| **Xin đi lại online** — US-P2-08 / **XIAN-122**, AC-P2-08.1–3 | Đổi thế/nhánh/dấu nước cuối/lượt khi đối thủ đồng ý, lùi1/2 | YC5 proposal30s, quota3, cooldown3 nước mình, không hoàn giờ, phiên bản/biên lai, race | **Custom P1 cho cả thành viên/Khách gửi và trả lời**; Casual P2, Ranked cấm |

Xin đi lại online không giống nút Undo AI: đối thủ được từ chối; người xin bị chặn đi khi pending; X/Esc chỉ thu gọn, không phải Từ chối như popup mời phòng. Không tái sử dụng ngữ nghĩa YC3 sai chỗ.

### 12.2 Liên quan gián tiếp / điều kiện của cụm xem lại

| Chức năng / mã nguồn | Liên quan | Phân kỳ sau quyết định |
|---|---|---|
| **Lịch sử cá nhân** — US-P2-11 / **XIAN-125**, AC-P2-11.1–3 | Điểm vào Replay, lọc ván, phe/đối thủ/kết quả; chỉ chủ ván | **Custom/AI P1**, Ranked/Elo/thống kê Ranked P1 theo BA 0.27; không dựng số liệu giả |
| **Lưu ván AI/Bỏ dở** — US-P2-12 / **XIAN-126**, AC-P2-12.1–3 | Cung cấp dữ liệu bền cho History/Replay AI | **P1**: terminal chống trùng, Bỏ dở sau30phút, không lưu Khách, không hứa khôi phục ACTIVE qua restart |
| Widget AI — US-P2-22 / **XIAN-136**, AC-P2-22.1–3 | Nodes/depth/thời gian cạnh bàn, không thay bằng chứng engine | **Đã P1 theo BA0.26**, mọi môi trường/chỉ thành viên, thu gọn mặc định; chỉ nước máy đã áp, không PV tương lai hoặc hint. Chi tiết YC8 |
| Demo mạng — US-P2-23 / **XIAN-137**, AC-P2-23.1–3 | Giúp trình diễn bàn/đồng hồ đồng bộ sau reconnect | **Đã chuyển P1 theo BA 0.23 khi chốt YC5**: chỉ môi trường demo, production chặn UI/lệnh trực tiếp; không thay kiểm LAN/thiết bị thật |

### 12.3 Đã thuộc P1, không xin chuyển lần nữa

- Tái đấu custom XIAN-123: tạo khai cuộc mới, đổi góc nhìn theo lựa chọn Giữ/Đổi phe; giao điểm YC2/YC5.
- Không giới hạn/chống treo XIAN-124: banner không che bàn, hết hạn xử theo YC5; AI không chịu inactivity.
- Theme XIAN-139: kiểm dấu hiệu/contrast cả sáng/tối/system; không đổi palette bàn cờ.
- Media giữa tab XIAN-138: bàn chỉ đọc ở tab mất quyền; không tự lấy quyền qua click.
- QR XIAN-130 đã loại, không đưa trở lại. DM/Thách đấu không thêm luật hoặc cơ chế thao tác bàn.

## 13. Trình tự triển khai theo phạm vi đã duyệt

**PO đã chọn đủ sáu phần:** Replay, FEN/PGN, Undo AI chỉ thành viên, Xin đi lại custom cho cả thành viên/Khách, History custom/AI và lưu AI/Bỏ dở. BA0.22 là quyết định hiện hành; không còn chờ duyệt chuyển phạm vi.

Triển khai theo phụ thuộc History → lưu AI → Replay → FEN/PGN; kiểm Undo AI hiện có và hoàn thiện Undo custom. Không kéo Casual queue, Ranked, Elo/leaderboard vào P1 chỉ vì chúng cùng xuất hiện trong AC nguồn.

Trình tự phụ thuộc:

1. Hoàn thiện YC4 baseline và kiểm quyền của các bề mặt có code; sửa sai lệch bốn góc/focus nếu xác nhận khi triển khai.
2. Áp dụng BA0.22; giữ Story/AC/Jira nguồn, tách ca custom/AI P1 với Ranked/Casual P2. Không báo toàn Story Done khi còn phần P2.
3. Kiểm migration/quyền và lưu ván online/AI; chốt Bỏ dở/restart; mở history khi schema/runtime thật sẵn sàng. Không chỉ đổi cờ `HISTORY_ENABLED` rồi coi hoàn tất.
4. Nghiệm thu Replay và export trên nhánh hiệu lực, quyền sở hữu và UI gọn; kiểm dữ liệu cũ/không tương thích báo lỗi thật.
5. Nghiệm thu Undo AI và triển khai/nghiệm thu Undo custom cho cả thành viên/Khách; đối chiếu lại lặp thế/120 nửa nước/Replay/PGN sau Undo.
6. Browser thật online/AI/observer và màn nhỏ, DB thật/race/rollback, bộ kiểm hồi quy liên quan; ghi PASS/FAIL/BLOCKED có môi trường/commit. Chỉ commit/push/deploy theo yêu cầu riêng.

Không tái ước lượng giờ/Sprint hoặc sửa issue Jira trong tài liệu này. Có code sẵn làm giảm việc viết mới, không thay công việc kiểm chứng hoặc quyền duyệt phạm vi.

## 14. Các quyết định PO đã chốt và quyền tương ứng

| Câu hỏi đã hỏi | Trả lời PO | Hệ quả bắt buộc |
|---|---|---|
| Q1 — Cụm xem lại lên P1? | **Custom và AI đầy đủ** | XIAN-125/126/127/129 vào P1 theo phần custom/AI; Ranked/Elo P1 theo BA 0.27, không cắt lưu AI/Bỏ dở khỏi cụm |
| Q2 — Đi lại với máy? | **Có, chỉ thành viên** | XIAN-128 P1; tối đa3 lần thành công, lùi1/2 theo trạng thái máy; UI/API từ chối Khách |
| Q3 — Xin đi lại online? | **Có, chỉ phòng tự tạo** | Phần custom XIAN-122 P1, không chờ ghép ngẫu nhiên; giữ luật30s/quota3/cooldown3/không hoàn giờ |
| Q4 — Ván custom có Khách? | **Khách được gửi và trả lời** | Khách/thành viên cùng quyền và giới hạn; không tự đồng ý thay ai. Ngoại lệ này không mở Undo AI hoặc History/export cho Khách |
| Q5 — Chống treo sau Undo custom Không giới hạn? | **3 phút mới, giữ số lần xác nhận** | Bên được trả lượt có3 phút mới; giữ số lần “Tôi còn đây” đã dùng khi chưa có nước mới và quota Undo; không hoàn đồng hồ5/10/15 |

Hướng nhìn người xem giữ mặc định Đỏ ở dưới; chưa bổ sung nút Lật bàn, không phải hạng mục chờ để triển khai phạm vi đã duyệt. Luật chữ Hán, hết nước là thua, chu kỳ lặp và không xử đuổi riêng giữ nguyên.

### 14.1 Tiêu chí bổ sung phải kiểm theo18 AC nguồn

- **Custom Undo (AC-P2-08.1–3):** đủ cả member–member/member–guest/guest–guest; cả hai chiều gửi/đồng ý/từ chối; hết hạn/rút; lùi1 khi đối thủ chưa đi và2 khi đã đi. Quota chỉ trừ khi thành công, không hoàn thời gian; nhánh bỏ không được tính lặp hoặc xuất Replay/PGN. Tab chỉ đọc/người xem/directAPI giả mạo bị từ chối; accept sau kết thúc không hồi sinh ván.
- **Undo + Không giới hạn (biến thể AC-P2-08.2):** sau thành công,3 phút mới chỉ cho bên được trả lượt; không lấy mốc đối thủ để xử thua nhầm. Giữ số lần “Tôi còn đây” của chuỗi chưa có nước mới (kiểm0/1/2 lần), không phục hồi quota Undo. Accept sau kết thúc/đã quá hạn không cứu ván; phòng có giờ giữ toàn thời gian đã tiêu hao của cả hai.
- **History (AC-P2-11.1–3):** thành viên chỉ thấy custom/AI của mình, phân trang/lọc đúng, INTERRUPTED/Bỏ dở không W/D/L. Thành viên xem được ván với Khách; Khách hết phiên dùng tên chung. Từ chối Khách/người ngoài ở API/RLS; phần Ranked chưa mở không giả số0 như thể đã tích hợp.
- **AI persistence (AC-P2-12.1–3):** lưu kết quả/cấp độ/nhánh hiệu lực đúng một lần; quá30phút thành viên có Bỏ dở, Khách không lưu; timeout tính nước không tạo Bỏ dở, Retry/restart không lưu hoặc khôi phục giả.
- **Replay (AC-P2-13.1–3):** đúng từng mốc, biên0/cuối, nhảy dòng và autoplay1,5s; ván không có nước vẫn xem được thế khai cuộc/kết quả. Chỉ đọc, không gọi lệnh live; quyền sở hữu kiểm cả khi đổi URL/tài khoản.
- **AI Undo (AC-P2-14.1–3):** thành viên có nước mình mới được lùi; cầm Đen mới có nước mở đầu máy chưa được Undo; hết3/đã kết thúc bị chặn; hủy worker đang nghĩ và bỏ kết quả trả muộn. Khách bị chặn cả nút và API; quota không phục hồi khi nhánh bị bỏ.
- **Export (AC-P2-15.1–3):** FEN đúng mốc đang xem, PGN đúng toàn nhánh hiệu lực/kết quả; đọc lại bằng đáp án/đường kiểm độc lập, không chỉ so hai hàm cùng implementation. Clipboard lỗi báo thật; tệp tải đúng ván; không cấp export cho Khách/người xem/người ngoài.

## 15. Bàn giao lượt tài liệu

- Đã đọc YC4 P1, BA ưu tiên, Story/AC P2 liên quan, DESIGN và các đường code/test nêu tại mục11.
- Đã thêm đặc tả/liên kết và đồng bộ quyết định PO vào BA0.22/backlog P1/P2; không sửa runtime, bật cờ, migration hoặc Jira. Quyền Khách đổi ở **đặc tả** cho Undo custom, chưa tuyên bố code đã đáp ứng.
- Không lấy kết quả kiểm thử các lượt trước làm chứng cứ PASS cho toàn bộ YC4/phần mở rộng. **Test local: không chạy (không được yêu cầu).**
- Chưa xem giao diện, chưa chạy test/build, chưa kiểm thiết bị cảm ứng/âm thanh thật trong lượt tài liệu; chưa commit/push tài liệu này.

## 16. Quyết định PO khi rà soát YC4 — 31/10/2026

**Đã có mã và test local 31/10/2026, chưa nghiệm thu.** Bổ sung cho mục 7, 8, 9, 10.

| # | Quyết định | AC bổ sung |
|---|---|---|
| 1 | **Chọn quân khác:** đã chọn một quân mình, bấm sang quân mình khác thì **chuyển chọn ngay** sang quân mới và hiện đích của quân đó. Bấm lại chính quân đang chọn, ô đích không hợp lệ hoặc Esc vẫn bỏ chọn | AC-YC4-RV-01 |
| 2 | **Hiện nước đi ngay:** bấm/thả đích hợp lệ thì quân **hiện ngay** ở đích trên máy người đi (không chờ máy chủ), đồng thời gửi nước; máy chủ vẫn là nơi quyết định. Đối thủ và người xem nhận nước **ngay khi máy chủ xác nhận**, đồng bộ nhanh nhất có thể theo NFR-01 (p95 < 100 ms, đo thật, không đạt ghi BLOCKED) | AC-YC4-RV-02, 03, 04 |
| 3 | **Không có bước xác nhận nước đi**, kể cả trên điện thoại: chạm đích hợp lệ là đi (BA 3.4) | — |
| 4 | **Ký hiệu:** biên bản trong UI (Replay) dùng tiếng Việt truyền thống (“Pháo … bình/tiến/thoái …”); PGN ghi nước đi bằng **tọa độ ICCS** (cột a–i, hàng 0–9; hàng 0 là phía Đỏ, hàng 9 là phía Đen theo `squareName` trong `packages/shared/src/replay-export.ts`) kèm FEN thế bắt đầu; FEN theo chuẩn cờ tướng thông dụng: chữ hoa = Đỏ, `w` = Đỏ đi, `b` = Đen đi | AC-YC4-RV-05 |

### 16.1 Hành vi “hiện ngay” (nước chờ xác nhận)

Câu hỏi của PO: *khi đưa quân tới đích thì web hiện ngay và đồng bộ với đối thủ ngay chứ?* Câu trả lời đã chốt: **máy người đi hiện ngay; đối thủ nhận ngay khi máy chủ xác nhận.** Máy chủ vẫn phải kiểm trước khi phát cho đối thủ, nên cần xử lý thêm các việc sau:

1. Quân di chuyển ngay đến đích và trông **như đã đi chính thức**: **không có dấu “chưa xác nhận” và không có chữ “Đang gửi nước…”** (PO 31/10). Ăn quân thì quân bị ăn ẩn ngay. Khóa gửi thêm bằng thuộc tính trợ năng `aria-busy`, không hiện chữ.
2. Máy chủ **chấp nhận**: cập nhật thế/lượt/đồng hồ theo snapshot; **không phát lại âm thanh** và không chạy lại hiệu ứng.
3. Máy chủ **từ chối** (sai lượt, hết giờ, mất quyền điều khiển, lệnh cũ, nước không hợp lệ do thế đã đổi): quân **trượt về vị trí cũ** (không hiệu ứng nếu giảm chuyển động), hiện lỗi tiếng Việt, trả thế về đúng snapshot máy chủ.
4. Mất kết nối khi đang chờ: hiện “Đang đồng bộ lại…” (thông báo mất kết nối sẵn có); sau nối lại lấy snapshot máy chủ làm chuẩn — nước đã được chấp nhận thì giữ, chưa thì hoàn về; không gửi lại tự động một nước đã quá lượt.
5. Trong lúc chờ không cho chọn hay kéo quân khác; đồng hồ hiển thị theo máy chủ, không tự chuyển lượt cục bộ.
6. Âm thanh đi/ăn/chiếu phát **một lần ngay khi hiện nước**; hoàn về do từ chối không phát âm thanh; nước của đối thủ phát khi nhận.
7. Người xem và đối thủ không bao giờ thấy nước chưa được máy chủ chấp nhận.

### 16.2 Tiêu chí bổ sung

| Mã | Given / When | Then bắt buộc |
|---|---|---|
| AC-YC4-RV-01 | Đã chọn quân A của mình; bấm quân B của mình | Chọn chuyển sang B, vòng chọn và đích của A biến mất, đích của B hiện; bấm lại B hoặc ô sai hoặc Esc thì bỏ chọn; làm được bằng chuột, chạm, bàn phím |
| AC-YC4-RV-02 | Người chơi bấm hoặc thả đích hợp lệ | Quân hiện ngay ở đích như đã đi, không dấu và không chữ “Đang gửi nước…”; chỉ gửi đúng một lệnh; khi máy chủ chấp nhận không phát lại âm thanh |
| AC-YC4-RV-03 | Máy chủ từ chối nước (sai lượt, hết giờ, mất quyền, nước cũ) | Quân hoàn về đúng vị trí gốc, thế bằng snapshot máy chủ, báo lỗi tiếng Việt; đối thủ và người xem không thấy nước đó |
| AC-YC4-RV-04 | Mất kết nối khi nước đang chờ; nối lại | Thế cuối theo snapshot máy chủ: nước đã chấp nhận thì giữ, chưa thì hoàn về; không tạo hai nước, không tự gửi lại nước quá lượt |
| AC-YC4-RV-05 | Xuất PGN và Copy FEN từ Replay | PGN ghi nước bằng ICCS và FEN bắt đầu chuẩn cờ tướng, kết quả `1-0`/`0-1`/`1/2-1/2`/`*`; FEN đọc lại đúng bằng bộ kiểm độc lập; Replay hiển thị biên bản tiếng Việt |

**PO xác nhận 31/10:** (a) không có luật tự hòa do thiếu lực — ván không có nước thắng thì kết thúc bằng lặp thế hoặc 120 nửa nước không ăn quân; (b) tắt/bật tiếng giữ theo phiên trình duyệt như mục 8.2; (c) **không có dấu “chưa xác nhận” và không có chữ “Đang gửi nước…”**, nước bị từ chối thì quân nhảy về chỗ cũ kèm thông báo lỗi.

### 16.3 Tác động triển khai (đã có mã local, chưa nghiệm thu)

- Đã làm: `XiangqiBoard` chuyển chọn sang quân mình khác (RV-01), bỏ chữ "Đang gửi nước…" và giữ khóa gửi thêm bằng `aria-busy`; phòng online truyền `pending` cả khi nước hiện ngay; ván đấu máy (`AiGame`) hiện ngay nước người đi và hoàn về khi bị từ chối (RV-02/03); `GameAudio.playLocal` phát âm một lần khi quân hiện, bản xác nhận của máy chủ không phát lại, từ chối không phát. Đã có từ trước và được kiểm lại bằng test: bốn góc ở nguồn/đích, CSS focus-visible, PGN ICCS (hàng 0 phía Đỏ) và FEN chuẩn (test độc lập `replay-standard-notation.test.ts`), biên bản tiếng Việt ở Replay. Sửa mục 11: dòng "Nước vừa đi" và "Focus bàn phím" ở trên là nhận định cũ, mã hiện đã dùng bốn góc và có focus-visible.
- **Đã xem giao diện thật 31/10/2026** (Chrome, server dev nối Supabase, tài khoản thành viên làm Đỏ, đối thủ Khách qua API): chọn Tốt rồi bấm Mã thì chuyển chọn và đích Mã sáng; bấm lại Mã bỏ chọn; đi nước thì 40 ms sau quân đã ở đích, nguồn trống, `aria-busy="true"`, không có chữ "Đang gửi nước…", `aria-busy` tắt khi máy chủ xác nhận (> 560 ms trên Supabase thật); nước đối thủ hiện cùng bốn góc ở nguồn và đích, lượt về Đỏ. **Lỗi ván đấu máy đã tìm ra và sửa:** `startAiGame` gọi `getControl()` ngay sau `connectAi()`, nhưng callback `auth` của socket gọi `revoke()` khi socket mở và hủy luôn mọi tác vụ đang chờ nên mọi ván máy bắt đầu từ Sảnh đều báo "Chưa thể bắt đầu ván với máy" (test cũ giả lập socket nên không thấy). Sửa: tác vụ chờ quyền điều khiển sống qua `revoke()` do tái xác thực, chỉ hủy khi đóng kết nối hoặc hết 5 giây. Xác nhận trên Chrome: vào ván, đi nước thì quân hiện ngay ở đích (`aria-busy`, không chữ chờ), máy đáp sau vài giây (chậm ~6 giây trên Supabase thật), đầu hàng ra "Bạn thua".
- Chưa làm/chưa kiểm: nghe âm thanh thật, màn cảm ứng, đo độ trễ đối thủ nhận nước (NFR-01 p95 < 100 ms), mất kết nối giữa lúc chờ nước trên trình duyệt thật (RV-04 chỉ có test jsdom), âm thanh cho ván đấu máy.
- Ghi chú cũ bên dưới là phân tích ban đầu:

- `XiangqiBoard.tsx`: chuyển chọn quân khác; vẽ nước chờ xác nhận và hoàn về; ghi nhận âm thanh một lần theo nước. Container (`RoomPage`/`AiGame`) giữ trạng thái chờ và đối chiếu snapshot, khối vẽ vẫn chỉ nhận props.
- Cần xác định độ trễ máy chủ thực tế: đo cũ ≈ 1,9 giây; “hiện ngay” chỉ che độ trễ ở máy người đi, đối thủ chỉ nhanh khi đạt NFR-01.
- Bằng chứng ở mục 11 là trước các thay đổi này; không kế thừa PASS.
