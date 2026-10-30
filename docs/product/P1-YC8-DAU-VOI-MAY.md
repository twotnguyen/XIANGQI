# P1 · YC8 — Đấu với máy, độ khó và ổn định ván AI

> **BA 0.27 — PO chốt 31/10/2026:** toàn bộ nội dung từng thuộc P2 (Ranked/Elo/bảng xếp hạng, ghép ngẫu nhiên Casual, Xin đi lại/Tái đấu Casual, phần Ranked của lịch sử/thống kê) nay thuộc **P1**. Mọi câu "vẫn P2 / giữ P2 / làm sau / Sắp ra mắt" còn lại trong tài liệu này là lịch sử và bị thay bởi [BA mục 0.27](BA-SCOPE-DECISIONS.md#027-đưa-toàn-bộ-phần-còn-lại-của-p2-lên-p1--po-chốt-31102026); QR vẫn bị loại. Chưa tái ước lượng giờ/Jira; chưa phải bằng chứng triển khai.

**Rà soát 31/10/2026:** PO chốt bốn điểm tại mục 17 (Khó không đạt thì BLOCKED, máy ngẫu nhiên nhẹ, lịch sử giữ vĩnh viễn, nút Bỏ ván ở banner Sảnh); **chưa triển khai**.

**Ngày lập/chốt:** 31/10/2026. **Phạm vi:** EP-08, US-08.1–08.3 và các giao điểm P1 theo BA0.22/0.26. **Trạng thái:** bốn lựa chọn PO đã chốt tại mục15; đã đối chiếu nguồn/code, chưa triển khai hoặc nghiệm thu lại phần mềm.

## 1. Mục tiêu và nguồn ưu tiên

Thành viên và Khách có thể chơi một ván cờ tướng hoàn chỉnh với máy, chọn cấp độ/phe, đi đúng luật, không mất ván vô lý khi worker chậm hoặc mất mạng. Cấp độ phải được chứng minh bằng chất lượng nước đi và số đo thật, không chỉ tên/nút Dễ–Trung bình–Khó.

Nguồn:

1. [BA-SCOPE-DECISIONS](BA-SCOPE-DECISIONS.md), Phần0 thắng: 0.3,0.9,0.17,0.20–0.22,0.26; tiếp đến1.8,3.5,6.1–6.3,9.1–9.2. YC7 dừng media khi xuống nền không tự trở thành luật ngừng/đầu hàng ván AI.
2. [BACKLOG-P1](BACKLOG-P1.md), EP-08: **19 AC baseline** — 7 của US-08.1,3 của US-08.2,9 của US-08.3. Số24 ở bảng Epic là Story Points, không phải số AC.
3. [BACKLOG-P2](BACKLOG-P2.md) cho AC nguồn History/lưu AI/Replay/Undo/export và widget đã chuyển P1. Giữ ID/Jira gốc; phần PV được PO thay bằng chỉ nước máy đã áp theo0.26, không để thành phần chờ P2.
4. [YC1](P1-YC1-TAI-KHOAN-VA-XAC-THUC.md) cho phiên/thiết bị; [YC4](P1-YC4-BAN-CO-VA-LUAT.md) cho core/bàn cờ/nhánh hiệu lực; [YC5](P1-YC5-VAN-ONLINE-VA-SU-CO.md) cho phân biệt AI với online; [YC6](P1-YC6-PHONG-VA-NGUOI-XEM.md) cho reservation không chiếm ghế khác.
5. [Kiến trúc](../engineering/server/architecture.md), [realtime](../engineering/server/realtime.md), [DESIGN](../design/DESIGN.md), [danh mục màn hình](../design/DANH-MUC-MAN-HINH-XIANGQI.md). Bằng chứng local cũ không thay nghiệm thu hiện tại.

**Điểm phân kỳ cần sửa khi đọc nguồn cũ:** câu “Undo/History/Replay AI là P2” và “quá30phút không lưu lịch sử” đã bị BA0.22 thay đối với thành viên. Ván ACTIVE vẫn trong RAM, lưu terminal không đồng nghĩa khôi phục được ACTIVE qua restart.

## 2. Phạm vi và phần không làm

| Chủ đề | P1 hiện hành | Không suy rộng |
|---|---|---|
| Tạo/chơi AI | Dễ/Trung bình/Khó; Đỏ/Đen/Ngẫu nhiên; một vị trí chơi | Không phòng AI công khai, mời bạn/người xem vào cùng ván |
| Luật | Dùng chung xiangqi-core, server phân xử | Không hint, engine ngoài hoặc luật đuổi quân mới |
| Thời gian người | Không đồng hồ, không TIMEOUT/INACTIVITY do suy nghĩ lâu | Không mang chống treo3phút của custom online sang AI |
| Worker | Tách khỏi luồng server, ngân sách theo cấp, hủy/fence kết quả cũ | Không giả nước máy hoặc chờ timer rồi chọn nước không qua luật |
| Undo AI | Thành viên tối đa3 lần thành công/ván | Khách không Undo; không quota vô hạn hoặc Undo sau terminal |
| History/Replay/export | Thành viên, riêng tư, nhánh hiệu lực | Không lưu Khách, không share replay/import/editor/phân tích gợi ý |
| Mất mạng | Giữ cùng ván30phút theo quyền/reservation | Không xử DISCONNECT60giây như online |
| Restart | Mất ACTIVE trong RAM, thông báo đúng | Không khôi phục giả hoặc hứa HA/checkpoint mới |
| Widget AI | P1 mọi môi trường, chỉ chủ ván thành viên, thu gọn mặc định | Không PV tương lai/hint; Khách không telemetry widget; không số giả |

Không thêm cấp Siêu khó/tùy biến depth, đổi cấp/phe giữa ván, engine picker, chế độ bài tập, chấm điểm nước đi hoặc phân tích bằng dịch vụ ngoài. DM P1 độc lập có thể tồn tại ở navigation nhưng không tạo chat/media/người xem riêng cho AI.

## 3. Quyền và trạng thái người dùng

| Hành động | Thành viên là chủ ván | Khách là chủ ván | Người khác/tab chỉ đọc |
|---|---|---|---|
| Tạo/chơi ván AI | Khi không bận vị trí khác | Tương tự, theo phiên Khách | Không tạo thay/chơi thay người khác |
| Đọc ván đang chơi | Theo quyền chủ ván/phiên | Theo quyền danh tính Khách | Người khác bị từ chối; tab cùng chủ có thể chỉ đọc |
| Đi quân/Undo/đầu hàng/retry | Chỉ tab điều khiển và quyền hiện hành | Đi/đầu hàng/retry; không Undo | Không vượt quyền bằng gọi HTTP/socket trực tiếp |
| Lưu History/Replay/export | Có theo BA0.22 | Không | Không suy quyền từ việc biết URL/id |
| Tiếp quản tab cùng thiết bị | Thao tác chủ động theo YC1 | Theo cơ chế phiên hiện có | Reconnect tab cũ không tự giành lại |

- Một user chỉ có một vị trí chơi: ghế phòng chờ/online và AI loại trừ nhau. Kiểm server sau khóa, không chỉ disabled nút.
- Đăng nhập thiết bị khác trong ván áp luật YC1, không mở đường tiếp tục AI cũ hoặc bỏ qua kết quả đã chốt bằng URL cũ.
- Hết phiên thành viên giữ ván theo hạn30phút để đăng nhập lại đúng danh tính/thiết bị; không gia hạn phiên vì chơi AI. Khách đang có vị trí hợp lệ theo ngoại lệ12giờ YC1 không bị đối xử như người xem.
- Tên và cấp độ là dữ liệu hiển thị an toàn; không dùng ownerId/role/phe do client gửi để cấp quyền.

## 4. Thiết lập và bắt đầu ván

1. Bấm Đánh với máy từ Sảnh mở `MODAL-AI-SETUP`, chọn cấp và Đỏ/Đen/Ngẫu nhiên. Hủy không tạo ván/reservation/worker.
2. Nếu chọn cấp từ thẻ Sảnh, form nhận đúng cấp đã chọn; không tự đổi vì default nội bộ. Không thêm lưu sở thích tài khoản ngoài yêu cầu.
3. Bắt đầu chỉ sau xác nhận; server kiểm phiên, input, quyền một vị trí và runtime sẵn sàng. Bấm lặp/retry không tạo hai ván hoặc bốc lại phe cùng ý định.
4. Đỏ: người đi đầu; Đen: máy cầm Đỏ tự tính nước khai cuộc, bàn lật Đen phía dưới. Máy vẫn phải qua cùng luật và cơ chế worker như nước khác.
5. Ngẫu nhiên bốc phía server gần50/50; lưu riêng lựa chọn Ngẫu nhiên và phe thực tế. Reconnect/retry cùng ván không bốc lại.
6. Vào `/ai/:id`; không có Ready hoặc đếm3giây như phòng hai người. Chưa nhận snapshot authoritative không cho đi trên một bàn khai cuộc giả rồi ghi đè.
7. Tạo lỗi giữ form/lựa chọn và thông báo tiếng Việt; không để reservation mồ côi hoặc nói đã tạo khi transaction thất bại.

**Ván mới** sau terminal mở lại form điền sẵn cấp và **lựa chọn phe ban đầu**; có thể đổi rồi xác nhận, ID mới. Nếu trước chọn Ngẫu nhiên thì Ván mới có thể bốc lại. **Thử lại ABANDONED** khác Ván mới: cùng cấp và **phe thực tế** cũ, không bốc lại.

## 5. Luật, thao tác và vòng đời nước đi

- Bàn90 giao điểm,32 quân đúng vị trí/chữ Hán; góc nhìn theo phe, click/chạm/kéo/bàn phím, âm thanh và reduced motion theo YC4. Không tạo bộ luật riêng cho AI.
- Client chỉ hiển thị đích hợp lệ; server kiểm owner/controller/version/trạng thái/lượt và legality trước commit. Chỉ đi quân của mình khi tới lượt.
- Nước người hợp lệ được ghi đúng một lần trước khi yêu cầu worker cho máy. Request timeout/retry không được áp lại nước người rồi tạo nhánh khác.
- Máy tính trên snapshot/nhánh/thế cụ thể. Kết quả chỉ nhận nếu game/generation/version/lượt vẫn phù hợp; Undo/terminal/restart/retry phải vô hiệu kết quả cũ.
- Nước worker trả cũng phải được kiểm hợp lệ theo core; nước lỗi không được sửa âm thầm thành một nước bất kỳ để che lỗi.
- Sau mỗi nước áp dụng cùng thứ tự kết thúc YC4: hết nước/chiếu hết, chiếu liên tục/lặp và120 nửa nước trên nhánh hiệu lực. Hết nước đi là thua, không phải hòa mặc định.
- Khi máy đang nghĩ, người không đi quân tiếp nhưng còn thao tác phù hợp: Đầu hàng, Undo nếu đủ quyền/điều kiện; nút không bị che bởi overlay toàn bàn.
- Không có Xin hòa/hint. Chấm nước hợp lệ không phải hint tốt/xấu; không lén gọi engine phân tích cho bên người.

### 5.1 Trạng thái nghiệp vụ

| Trạng thái | Cho phép | Không cho phép |
|---|---|---|
| ACTIVE, lượt người | Đi hợp lệ; Undo đủ điều kiện; Đầu hàng | Nước của máy, nhập thế tùy ý |
| ACTIVE, máy đang nghĩ | Chờ; Undo hợp lệ; Đầu hàng | Đi tiếp/quota Undo giả |
| ACTIVE, lỗi tính nước có thể thử lại | Thử lại trên cùng thế theo quyền | Tự gửi lại nước người, xử timeout thành Bỏ dở |
| Đang chốt terminal/lưu kết quả | Hiển thị trạng thái đang xử lý thật | Nhận nước/Undo để đảo kết quả đã xác định |
| FINISHED/Bỏ dở | Xem kết quả; Ván mới/Về Sảnh; Retry đúng nhánh lỗi | Hồi sinh ván cũ hoặc Undo sau kết thúc |
| Không còn ACTIVE sau restart | Thông báo mất trạng thái, đường thoát/tạo chủ động | Bàn giả như đang tiếp tục ván cũ |

Tên kỹ thuật engineState/status cụ thể theo contract hiện có; không tạo status mới chỉ vì bảng mô tả này.

## 6. Ba cấp độ và ngân sách engine

| Cấp | Độ sâu mục tiêu | Phản hồi p95 trên máy demo |
|---|---|---|
| Dễ | 2 | ≤300ms |
| Trung bình | 4 | ≤1.000ms |
| Khó | 6 | ≤3.000ms |

- Negamax/minimax tương đương với alpha-beta, tìm sâu dần, chạy worker/tiến trình riêng và dùng xiangqi-core. Không thêm dependency engine khác chỉ để vượt benchmark.
- Hết ngân sách trước depth mục tiêu: trả nước tốt nhất đã tìm được hợp lệ, ghi depth thực tế; không giả depth6 vì cấu hình target6.
- Không có một iteration hoàn tất vẫn phải có nước hợp lệ đã xác định theo đường engine thực; không chọn nước bên client hoặc nhận worker kết quả ngoài thế gốc.
- Budget tìm kiếm, overhead hàng đợi/khởi tạo worker và độ trễ mạng là các số khác nhau. Báo riêng phạm vi đo; không gọi compute2.999ms là end-to-end≤3.000ms nếu còn queue/network chưa đo.
- Ngưỡng10giây là watchdog sự cố không phản hồi, không thay ngân sách300/1000/3000ms hoặc cách đo p95. Không tăng ngưỡng để “làm xanh” bộ đo.
- Một AI nặng không được chặn event loop xử lý online. Đánh giá contention/queue thật; worker riêng chưa đủ chứng minh không ảnh hưởng tài nguyên chung.
- Độ khó cảm nhận là mục tiêu, không lời hứa cấp Khó bất bại. Bằng chứng bắt buộc gồm bộ mate độc lập và đấu máy20ván/cặp theo mục13.

## 7. Undo AI — đã thuộc P1

| Tình huống | Hành vi |
|---|---|
| Máy vừa trả nước, đã có nước người | Lùi2 nửa nước về trước nước gần nhất của người, trả lượt người |
| Máy đang tính sau nước người | Hủy/fence tác vụ, lùi1 nước người, trả lượt người |
| Chưa có nước người (kể cả Đen chỉ có khai cuộc máy) | Disabled và lý do, server từ chối |
| Khách/hết3 lần/terminal/tab chỉ đọc | Không được Undo; không dùng lỗi UI thay kiểm server |

- Một lần thành công mới trừ một lượt, kể cả lùi1. Hiển thị rõ đã dùng X/3; quota không được reset bằng reload/reconnect/đổi nhánh hoặc retry cùng lệnh.
- Không cần máy đồng ý; không áp popup30giây/cooldown3nước của Undo online vào AI.
- Undo phải khôi phục vị trí, lượt, last move, bộ đếm120 nửa nước/lặp/chiếu theo nhánh hiệu lực, không chỉ trả lại quân.
- Kết quả/metrics từ worker cũ trả sau Undo không được áp hoặc cập nhật sang lượt mới. Terminal đến trước thì Undo không đảo; Undo thành công trước thì kết quả worker cũ vô hiệu.
- Replay/History/export chỉ dùng nhánh hiệu lực; không hiển thị nước đã bỏ như vẫn xảy ra. Không xóa quota đã tiêu vì nước đó bị Undo tiếp.
- Giữ AC-P2-14.1–3; quyền thành viên/Khách đã chốt, không hỏi lại việc mở Undo cho Khách.

## 8. Lỗi máy và Thử lại

| Tình huống | Trạng thái người dùng / hành động |
|---|---|
| Hết budget bình thường | Máy đi nước tốt nhất hợp lệ đã tìm; không báo sự cố chỉ vì chưa depth mục tiêu |
| Không phản hồi quá10giây | “Máy cờ gặp sự cố” + Thử lại; giữ cùng ván/thế, không tự Bỏ dở |
| Thử lại khi ván còn ACTIVE | Tính lại đúng lượt máy/thế hiện hành, không lặp nước người, không bốc lại phe |
| Lỗi thực sự đã chuyển ABANDONED | Giữ kết quả Bỏ dở; Retry chủ động tạo ván mới cùng cấp/phe thực tế, ID mới |
| Snapshot/request cũ | Lấy trạng thái mới theo quyền, không thử lại vô hạn thao tác đã hết hiệu lực |
| Không sẵn sàng/DB/worker khởi động lỗi | Báo lỗi thật, không nước giả hoặc giả lưu thành công |

- Retry dùng đúng ý định/idempotency, khóa nút khi xử lý; hai tab/lệnh đồng thời không tạo hai worker hoặc hai ván mới.
- Worker timeout/cancel phải có fence, kết quả đến muộn không được “hồi phục” sau khi người đã Retry/Undo/Đầu hàng.
- Lỗi ghi terminal phải phân biệt lỗi tính nước: không chạy lại máy để tạo kết quả khác khi kết quả đã xác định. Không giải phóng hoặc tái sử dụng vị trí giữa transaction lỗi để làm mất ván.
- Không thêm fallback engine, retry tự động vô hạn hoặc chuyển cấp nhẹ hơn ngoài yêu cầu. Phần chốt/lưu có retry nội bộ theo pattern hiện có phải giữ tính đúng đắn, không hiển thị đã lưu trước commit.

## 9. Mất mạng, tab và reservation

- Mất kết nối tab điều khiển bắt đầu grace30phút; quay lại đúng `/ai/:id` hoặc banner Sảnh, đúng chủ và phiên, tiếp tục snapshot authoritative. Tab chỉ đọc không reset hạn, cần chủ động tiếp quản trong hạn theo BA0.26.
- Refresh không phải Rời ván/Đầu hàng. Không dùng beacon không bảo đảm gửi để tuyên bố người dùng đã resign.
- Trong hạn vẫn bận vị trí chơi, không thể nhận ghế online hoặc tạo AI khác bằng tab thứ hai. Không giải phóng chỉ vì presence hiển thị Offline.
- Cùng thiết bị một tab điều khiển; tab cũ chỉ đọc khi bị tiếp quản, reconnect không tự giành lại. HTTP read không tự biến thành controller.
- Máy được hoàn thành tối đa nước đang chờ khi offline theo BA0.26, không đi tiếp thay người. Nếu nước đó kết thúc ván thì chốt kết quả thật, không đợi expiry đổi thành Bỏ dở. Worker/nước máy/telemetry và tab chỉ đọc không reset grace; không dùng heartbeat Bạn bè/mousemove để giữ ván.
- Quá hạn: hủy tác vụ, đóng ván/giải phóng reservation nhất quán; thành viên lưu Bỏ dở theo BA0.22, Khách không lưu. Reconnect/request đúng sát deadline phải phân xử bằng thời gian server và khóa, không worker dọn muộn.
- Thời gian người suy nghĩ khi còn kết nối không có hạn, không tự Bỏ dở sau30phút chỉ vì không đi nước.
- Ẩn tab không tự resign hoặc đổi phe/cấp; browser đình chỉ mạng có thể dẫn tới grace qua cơ chế mất kết nối thật. Không giả cam kết chạy nền liên tục trên mọi OS.

## 10. Kết thúc, lưu và restart

### 10.1 Kết quả và điều hướng

- Thắng/Thua/Hòa theo core; Đầu hàng là RESIGN. AI không tính Elo/Ranked count; Bỏ dở không tính W/D/L.
- Đầu hàng, chủ động Rời ván hoặc Đăng xuất khi ACTIVE có xác nhận. Hủy giữ nguyên ván; đồng ý chốt RESIGN, hủy worker, giải phóng vị trí theo transaction. Không để nút Back/navigation nội bộ lách xác nhận.
- Terminal bất biến: worker cũ, Undo hoặc retry không thay kết quả. Ván mới dùng ID mới/quota mới, không sửa ván cũ.
- Hộp kết quả có Ván mới/Về Sảnh; thành viên có đường Xem lại khi bản lưu thực sự sẵn sàng, không dẫn vào404 rồi nói đã lưu. Khách không có History/Replay/export.

### 10.2 Bản lưu thành viên

- Lưu type AI, cấp độ, phe thực tế, lựa chọn phe khi cần cho luồng Ván mới, kết quả/lý do, nhánh hiệu lực; thời gian và danh tính phải theo dữ liệu server.
- Mỗi ván một kết quả bền, chống ghi trùng khi kết thúc/expiry/retry/worker chạy lại. Không chỉ kiểm count tăng mà phải đối chiếu quân/lượt/nước cuối/kết quả được lưu.
- Hết30phút hoặc ABANDONED thật có History/Replay Bỏ dở cho thành viên, không W/D/L/Elo; Khách không ghi lịch sử riêng.
- History/Replay chỉ chủ ván; API/socket/RLS và export từ chối người khác/Khách. Thay URL không cấp quyền.
- Replay read-only, đầu/trước/sau/cuối/nhảy dòng, biên bản Việt, autoplay1,5giây/nước và dừng cuối. Copy FEN đúng mốc; PGN toàn nhánh hiệu lực. Không import hoặc phân tích gợi ý.
- Terminal không có nước nào vẫn là kết quả có thể xem thế khai cuộc; không fabricate một nước để Replay có nội dung.

### 10.3 Restart và giới hạn dữ liệu

- ACTIVE dùng RAM: restart mất trạng thái, không giả tiếp tục từ khai cuộc hoặc khôi phục chỉ vì còn reservation/id cũ trong DB.
- Bản terminal đã commit vẫn là lịch sử bền; mất RAM không được xóa/ghi đè lịch sử đó.
- Trạng thái terminal còn đang lưu mà tiến trình chết có giới hạn cần mô tả theo kiến trúc thực; không tuyên bố exactly-once qua crash nếu chỉ giữ pending RAM.
- Luồng mất trạng thái hiện thông báo “Ván không còn trạng thái để tiếp tục”, về Sảnh/tạo mới theo hành động chủ động. Không tự biến restart thành thắng/thua hoặc khôi phục quota/worker cũ.
- Không mở rộng thành checkpoint ACTIVE/HA/cloud persistence trong tác vụ đặc tả này; nếu PO muốn đổi đây là phạm vi riêng cần chốt.

## 11. Giao diện gọn, đồng bộ và đủ trạng thái

Đây là đặc tả cần nghiệm thu, không phải giao diện đã xem trong lượt này.

- Trang AI giữ bàn cờ lớn nhất, thẻ Bạn/Máy và cấp độ; không panel người xem/chat/camera/đồng hồ thi đấu giả. “Không giới hạn” là thông tin, không đồng hồ00:00 gây hiểu lầm.
- Hiện lượt người/“Máy đang suy nghĩ” rõ ràng, trạng thái lỗi/Thử lại nằm gọn gần thẻ máy, không overlay chặn Đầu hàng hoặc Undo hợp lệ.
- Member thấy Đi lại + đã dùngX/3; chưa có nước/hếtquota/ended/readonly có lý do, Khách không có hành động có thể dùng. Không chỉ dùng tooltip hover cho màn cảm ứng.
- Form setup gọn hai nhóm chọn cấp/phe, Bắt đầu/Hủy, loading/error không làm nhảy bố cục; keyboard/focus/trap/return focus đúng component sẵn có.
- Trong kết quả tách Ván mới với Thử lại sự cố; không dùng chung nhãn cho hai semantics khác phe Ngẫu nhiên.
- Biên bản nếu có nằm panel/tab thu gọn, cuộn nội bộ; không thêm danh sách dài bên dưới khiến phải cuộn cả trang để đến nút ván.
- Widget chỉ chủ ván thành viên, mọi môi trường, thu gọn mặc định; không chiếm chiều rộng bàn hoặc thành dashboard. Số nodes/depth/thời gian từ worker thật, không timer giả; trường chưa có dữ liệu hiện “Chưa có số liệu”, không bịa0. Nhãn “Nước máy vừa đi” chỉ sau khi đã áp, không hiện best move/PV tương lai.
- 360px không cuộn ngang;1366×768 ưu tiên thấy bàn/lượt/nút chính. Zoom/màn thấp/bàn phím ảo cho phép cuộn dọc cần thiết thay vì cắt nội dung.
- Tái dùng tokens/components, quân/bàn/typography hiện tại; theme member theo YC1, Khách không mở rộng quyền chọn theme. Chỉ báo không dựa màu, nhãn Việt và reduced motion đúng YC4.
- Mọi bề mặt có loading/empty/error/disabled rõ. Screen reader không đọc từng node hoặc từngms nếu widget chạy; cập nhật không giành focus người đang đi cờ.

## 12. Đối chiếu code và bằng chứng hiện có

### 12.1 Phân biệt code với nghiệm thu

Có code sẵn cho AI, Undo, History và Replay; không cần thiết lập một engine/store/UI song song. Cần kiểm code theo BA0.22 và các quyết định mới thay vì suy mọi phần mang nhãn P2 đều phải viết lại.

| Hạng mục | Bằng chứng code đã đọc | Đánh giá / phần cần kiểm |
|---|---|---|
| Setup/phe | `apps/web/src/features/ai/AiSetupDialog.tsx:16–36`; `apps/server/src/game/ai/ai-games.ts:224–261` | Default Dễ/Đỏ; server bốc Random, lưu requestedSide/actualSide; Retry ABANDONED dùng actualSide cũ |
| Quyền/lượt/version | `ai-games.ts:160–178,488–500`; `ai-presence.ts:175–235` | Có owner, version, lượt/core và controller generation; cần thử trực tiếp quyền người khác/tab cũ, không suy từ UI |
| Worker cũ/Undo | `ai-games.ts:331–343,617–655` | Có epoch/version/cancel và lùi1/2/quota3. `ai-http.service.ts:158–161` gọi Undo không có điều kiện member tại đoạn này; phải hoàn thiện/kiểm guard xuyên đường Khách theo BA0.22, không coi quota đủ là quyền đã đúng |
| Timeout/retry | `ai-games.ts:365–376,525–539,660–688` | Timeout/busy giữ RETRY; fatal có ENGINE_FAILURE/Bỏ dở; Retry FINALIZING thử lưu thay vì tính lại máy. Cần kiểm lỗi thực và kết quả muộn |
| Offline đang tính | `ai-runtime.ts` đường disconnect; `ai-games.ts` settle | Disconnect hiện ghi presence, không hủy ngay worker; nước máy có thể commit trong grace. PO đã chọn hoàn thành tối đa nước đang chờ theo0.26; cần kiểm không reset deadline hoặc đi thay người |
| Mốc grace | `ai-presence.ts:309–325` | Chỉ disconnect đúng controller mới ghi disconnected_at. Tab chỉ đọc không tự reset mốc, phù hợp lựa chọn PO0.26; cần kiểm cảnh báo/tiếp quản và biên30phút end-to-end |
| Hết30phút | `ai-runtime.ts:243–291`, `ai-sql-transactions.ts` đường drop | Đường sweep hiện drop/release rồi bỏ RAM, chưa qua chốt Bỏ dở vào History ở đoạn khảo sát; đây là gap cần hoàn thiện theo BA0.22, không chỉ sửa câu chữ |
| Lưu terminal | `ai-games.ts:425–451`; `ai-history-store.ts` | Ghi bền rồi mới xóa active/retire; có dedup. FINALIZING lỗi vẫn giữ active, chặn ván mới; giữ bảo vệ dữ liệu, không thêm nút bỏ qua/làm mất lịch sử ngoài yêu cầu |
| Search/telemetry | `packages/engine/src/contracts.ts:38–42`, `search.ts:323–354` | Có giới hạn2/4/6 và300/1000/3000ms; trả completedDepth/elapsedMs/nodes/timedOut và best move, chưa có mảng PV trong kết quả. Widget full PV không chỉ là gắn nhãn UI |
| UI | `AiGame.tsx:135–146,190–261`; `ai-game.css:55–68` | Có bàn/Undo/Đầu hàng/Thử lại/Thử lưu, CSS theo viewport; chưa xem browser nên chưa kết luận gọn/đẹp hoặc không cuộn |
| Tests hiện có | `tests/server/game/ai/ai-games.{undo,deadlines,resign,workers,recovery}.test.ts`, `ai-presence.test.ts`, `ai-history-store.test.ts`; `tests/packages/engine/{search,worker}.test.ts`; `tests/web/features/ai/` | Có tests cấu phần; cần phủ quyền Khách Undo, expiry lưu Bỏ dở, widget theo BA0.26 và bộ mate đa dạng. Không chạy lại hoặc coi test tồn tại là PASS |

Đối chiếu chỉ đọc, không sửa code hoặc tái hiện lỗi runtime. Những phần giữ RAM/pending khi lỗi có giới hạn crash; không biến chúng thành bảo đảm khôi phục bền hoặc ngầm thêm checkpoint.

### 12.2 Báo cáo engine local cũ

Nguồn [GATE-ENGINE-LOCAL](../planning/jira/reports/GATE-ENGINE-LOCAL.md), ngày11/10/2026, **không chạy lại trong lượt này**:

- Đo50 thế/cấp trên AppleM3Pro, Node26.7.0, một lần có tải nền; khác Node22 của dự án và chưa phải máy demo.
- Dễ/Trung bình đạt timing trong lượt đo; cấp Khó p95 đạt3.000ms nhưng2mẫu vượt trần nhỏ, depth6 chỉ5/50 thế. Không dùng kết quả này hứa luôn đạt depth6.
- Mate2/2 nhưng chỉ một nguồn và một thế dẫn xuất, báo cáo kết luận **BLOCKED vì chưa có bộ mate đa dạng**; không được viết “100% mate đã nghiệm thu”.
- Chưa chạy20ván cho mỗi cặp cấp trong báo cáo đó; gate tổng chưa PASS.

Số đo/đường dist trong báo cáo phản ánh phiên bản lúc đo, không chứng minh cấu hình runtime/build hiện tại giữ nguyên. Metrics hiển thị cũng không tự chứng minh tác giả engine; cần code/trace và bộ kiểm độc lập.

## 13. Truy vết và kế hoạch nghiệm thu

Bảng là kế hoạch, không phải kết quả đã chạy.

| AC | Bằng chứng cần có / biến thể |
|---|---|
| AC-08.1.1 | Sảnh mở setup đủ 3 cấp/3 phe, Hủy không tạo ván |
| AC-08.1.2 | Đỏ đi trước, owner/controller/version đúng, không máy đi hộ |
| AC-08.1.3 | Đen ở dưới, máy tự đi khai cuộc hợp lệ, chưa có nước người thì không Undo |
| AC-08.1.4 | Random server bốc gần 50/50 theo mẫu hợp lý; retry không bốc lại cùng ý định |
| AC-08.1.5 | Không clock/Xin hòa/hint, có Đầu hàng; thành viên có Undo, Khách bị từ chối |
| AC-08.1.6 | Kết quả đúng gồm resign, Ván mới/Về Sảnh và giải phóng vị trí |
| AC-08.1.7 | Ván mới điền cấp/lựa chọn phe cũ nhưng đổi được, ID mới/quota mới |
| AC-08.2.1 | Mọi cấp trả nước core hợp lệ, không tự chiếu/ăn Tướng/lách lượt |
| AC-08.2.2 | Hết budget trả best-so-far hợp lệ, depth thực không giả target |
| AC-08.2.3 | Worker tách; đo online thật khi AI bận, không chỉ kiểm import worker |
| AC-08.3.1 | Đóng tab/mất mạng/reload vào lại cùng URL/thế/nhánh/quota trong 30 phút |
| AC-08.3.2 | Quá 30 phút chốt Bỏ dở/lưu thành viên, Khách không lưu; giải phóng vị trí; biên deadline theo BA0.22 |
| AC-08.3.3 | Timeout >10 giây giữ ván; Retry cùng thế không lặp nước người; ABANDONED thật Retry ID mới/phe thực tế |
| AC-08.3.4 | Retry click lặp/2 tab/request timeout chỉ một ý định, kết quả cũ không áp |
| AC-08.3.5 | Restart mất ACTIVE báo đúng, không khôi phục giả; terminal đã lưu không mất |
| AC-08.3.6 | Rời/Đăng xuất xác nhận; Hủy giữ ván, Đồng ý RESIGN/hủy worker/giải phóng vị trí |
| AC-08.3.7 | 50 thế/cấp, Node 22 trên máy demo, p95/depth thực và phạm vi đo rõ |
| AC-08.3.8 | Khó 100% bộ mate 1/2 nước bắt buộc, đáp án độc lập/đa dạng; không chỉ 2 thế cùng nguồn |
| AC-08.3.9 | 20 ván/cặp cấp, cân phe, kết quả/thời gian/phương pháp đầy đủ, phân cấp thắng đa số |

Các AC nguồn đã chuyển P1:

| Bộ AC | Phạm vi cần nghiệm thu cùng YC8 |
|---|---|
| AC-P2-11.1–3 | History AI đúng cấp/phe/kết quả/quyền, không Ranked giả hoặc lưu Khách |
| AC-P2-12.1–3 | Lưu terminal/Bỏ dở chống trùng, timeout không Bỏ dở, restart không khôi phục giả |
| AC-P2-13.1–3 | Replay riêng chủ ván, từng mốc/biên/autoplay/nhánh hiệu lực |
| AC-P2-14.1–3 | Undo 1/2 plies/quota 3/chỉ thành viên, hủy worker và chặn kết quả cũ |
| AC-P2-15.1–3 | FEN đúng mốc/PGN toàn nhánh/quyền xuất, clipboard/download thật |
| AC-P2-22.1–3 | Widget thật/member-only/mọi môi trường, chỉ nước máy đã áp, không PV tương lai; generation/Undo/quyền và UI gọn |

### 13.1 Cách đo chất lượng engine

- Tập 50 thế giữa ván và mate có nguồn/đáp án kiểm độc lập; không lấy cùng hàm search làm đáp án của chính nó. Đáp án mate có thể có nhiều nước thắng tương đương, chấp nhận đúng tập đã xác minh.
- Ghi commit, Node 22, máy/OS, cold/warm, tải nền, level/budget/depth thực/nodes/elapsed/timeout và kết quả hợp lệ từng mẫu. Báo p95 theo phương pháp rõ; không loại mẫu chậm để hạ p95.
- 20 ván mỗi cặp cấp theo AC, ghi từng ván/cân phe/thế xuất phát/điều kiện dừng, hòa/Bỏ dở riêng; không dùng Elo giả hoặc cảm nhận người chơi thay thắng đa số. Dữ liệu không đủ/không phân cấp thì báo FAIL/BLOCKED đúng nguyên nhân, không tự giảm yêu cầu.
- Thời gian search và thời gian API/socket/browser phải báo đúng phạm vi; kiểm quá 10 giây/cancel/stale bằng đồng hồ điều khiển hoặc worker thử lỗi cô lập, không làm hỏng dữ liệu thật.
- DB test cô lập cho ownership/RLS/terminal/retry/reservation; không trỏ fixture reset schema vào Supabase. Browser thật cho bàn/điều hướng/tab/Undo/reconnect, không chỉ snapshot component.

## 14. So sánh P2 và đề xuất phân kỳ

> **Lưu ý (rà chéo 31/10/2026):** mục này là đối chiếu lịch sử trước BA 0.27–0.36. Ghép ngẫu nhiên Casual, Ranked và các phần Casual/Ranked đã **P1** (xem [YC9](P1-YC9-GHEP-TRAN-CASUAL-RANKED.md)); mọi câu "giữ P2", "queue 3 phút", "xác nhận 10 giây" hay "vào ván ngay" bên dưới đã bị thay.

| Story / Jira | Liên quan YC8 | Phân kỳ hiện hành / đề xuất |
|---|---|---|
| US-P2-12 / XIAN-126 | Trực tiếp: lưu AI/terminal/Bỏ dở | **Đã P1 BA0.22**, không xin chuyển lại |
| US-P2-14 / XIAN-128 | Trực tiếp: Undo AI | **Đã P1 chỉ thành viên**, tối đa 3, Khách không Undo |
| US-P2-11 / XIAN-125 | Trực tiếp: điểm vào History AI/cấp độ | AI/custom P1, Ranked/thống kê Ranked P2 |
| US-P2-13 / XIAN-127 | Trực tiếp: Replay luyện tập sau ván | Đã P1 riêng chủ ván, không hint/phân tích mới |
| US-P2-15 / XIAN-129 | Trực tiếp: FEN/PGN từ Replay AI | Đã P1, không import/live export/hint |
| **US-P2-22 / XIAN-136** | Trực tiếp: thông số engine thật | **P1 theo BA0.26**, mọi môi trường/chỉ thành viên. Nodes/depth/thời gian thật; chỉ nước máy đã áp, yêu cầu PV tương lai đã được thay, không để P2 |
| US-P2-23 / XIAN-137 | Gián tiếp: demo mất mạng/reconnect | Đã P1 demo-only BA0.23; không tự thêm công cụ phá worker production hoặc sửa deadline AI 30 phút |
| US-P2-25 / XIAN-139 | Gián tiếp: theme bàn/setup/history/widget | Đã P1 BA0.21, giữ contrast/quyền Khách |
| US-P2-01/02/06 / XIAN-115/116/120 | Elo/queue/leaderboard không cần cho AI | Giữ P2, ván AI không đổi Elo |

**Kết luận:** cả sáu Story trực tiếp (History/lưu AI/Replay/Undo/export/widget) đã P1 theo phần AI được duyệt. Widget chỉ thành viên, mọi môi trường, không PV tương lai; không thay gate chất lượng. Không có Story P2 riêng đã duyệt cho khôi phục ACTIVE qua restart, đổi cấp giữa ván, cấp Siêu khó hoặc hint; Ranked/Elo/queue P1 theo BA 0.27.

## 15. Bốn quyết định PO đã chốt — BA0.26

| Câu hỏi | PO chọn | Hệ quả |
|---|---|---|
| Q1 — Widget XIAN-136 | **P1 mọi môi trường, chỉ thành viên** | Chủ ván thành viên có bảng thu gọn, không demo-only; chặn Khách/người khác ở UI/API/socket |
| Q2 — Thông tin nước máy/PV | **Chỉ nước máy đã đi** | Nodes/depth/thời gian thật khi đang tính, không lộ best move/PV tương lai. Nước chỉ xuất hiện sau khi đã áp thành công, nhãn không gọi full PV |
| Q3 — Offline lúc máy đang nghĩ | **Hoàn thành tối đa nước máy đó** | Giữ budget/watchdog, có thể chốt terminal thật; không đi thay người, không reset deadline |
| Q4 — Grace đa tab | **Tính từ mất tab điều khiển** | Tab chỉ đọc không kéo dài hạn; cảnh báo/đường chủ động tiếp quản trong30phút; không tự chiếm khi reconnect |

Không còn câu hỏi chờ trong bốn mục này. Giữ No Hint, Undo chỉ thành viên/quota3, History riêng tư, ACTIVE RAM/restart không khôi phục giả; không mở quyền widget cho Khách.

### 15.1 Chi tiết widget và ba AC nguồn đã cập nhật

- **AC-P2-22.1:** chủ ván thành viên xem numbers thật nodes/completedDepth/targetDepth/elapsed khi máy tính; không giả số hoặc dùng thời gian chờ mạng làm compute latency. Khách/người khác không nhận payload widget kể cả gọi trực tiếp.
- **AC-P2-22.2:** số cuối khớp kết quả worker thực và đúng game/epoch/version. Sau khi nước máy đã áp thành công mới hiện nước đó theo ký pháp Việt; không dùng best move chưa commit làm “Nước máy vừa đi”. Timeout/cancel/Undo/đổi ván không để dữ liệu tác vụ cũ lấn lượt mới.
- **AC-P2-22.3:** không phát/hiện PV tương lai hoặc gọi engine cho bên người. Khi tới lượt người có thể giữ số cuối/nước máy đã áp với nhãn lượt tương ứng; không biến thành phân tích thế hiện tại. Lượt máy tiếp theo xóa dữ liệu gắn nhầm, không phát lại PV qua API/socket dù UI đã ẩn.
- Trong lúc đang tìm, chỉ đưa các mẫu worker thực đã đo được; cập nhật tại mốc tìm kiếm có dữ liệu, không bắt UI phải nhảy số theo nhịp giả. Có thể hiển thị thời gian chờ riêng nếu đã có UI, nhưng không đặt tên compute latency cho đồng hồ client.
- Mỗi mẫu gắn đúng task/branch; công việc bị hủy không cập nhật số cuối hoặc hiện nước cũ. Widget không giữ lịch sử nhánh Undo để hiển thị lại như còn hiệu lực.
- Không lưu tài khoản/theme preference mới chỉ để nhớ mở widget, không dựng dashboard hoặc endpoint phân tích nhập thế. Số đo worker phục vụ vận hành server không vì Khách bị chặn widget mà phải dừng đo nội bộ.

### 15.2 Biến thể nghiệm thu sau chốt

1. **Offline worker:** ngắt controller khi đang tính, máy commit tối đa một nước; bên người vẫn đứng yên. Kiểm nước thường và nước kết thúc; reconnect đúng snapshot/quota, không gửi lại nước người. Hết budget/timeout bình thường không tự retry vô hạn lúc offline.
2. **Grace đa tab:** tab điều khiển mất tạiT, tab chỉ đọc còn mở; cảnh báo có deadlineT+30phút. Đọc/poll/nhận snapshot/telemetry không đẩy hạn. Chủ động tiếp quản trước hạn phục hồi điều khiển; stale reconnect không tự giành. Đến hạn, thao tác phải bị từ chối dù worker cleanup chưa chạy; lưu Bỏ dở thành viên/release đúng một lần.
3. **Worker đua expiry/terminal:** nước máy đã chốt terminal trước hạn không bị ghi đè Bỏ dở. Tác vụ cũ sau expiry/Undo/Resign không tạo nước/metrics hoặc chiếm lại reservation đã giải phóng.
4. **Widget quyền:** chủ thành viên/tab chỉ đọc chỉ đọc đúng dữ liệu của mình; Khách, người khác, đoánID/đổiaccount không đọc được telemetry qua HTTP/socket. Không chỉ test hide button.
5. **Widget nội dung:** so worker trace với số UI và nước đã commit; test chưa có số liệu, failed iteration, budget/cancel/Retry/Undo/thay ván. Xác nhận không có future move/PV trong payload, không engine chạy cho lượt người.
6. **UI/runtime:** mở/thu widget ở desktop/mobile không che bàn/Đầu hàng; screen reader không đọc mọi node/ms; telemetry không làm trễ budget hoặc nước online. Browser thật và dữ liệu engine thật mới đủ kết luận, không dùng mock số.


## 16. Bàn giao

1. Áp dụng BA0.26/mục15 và ba AC widget nguồn đã sửa; giữ ID AC/Story/Task/Jira, không tự đổi lịch/giờ/Done.
2. Khi được giao triển khai, hoàn thiện gap trên đường code hiện có và mọi caller/test/schema bị ảnh hưởng; không viết engine/reservation/UI thứ hai.
3. Nghiệm thu19 AC baseline và18 AC nguồn US-P2-11/12/13/14/15/22 đã P1, cùng biến thể mục15.2; không bỏ phần widget đã duyệt hoặc yêu cầu PV tương lai đã bị thay.
4. Ghi PASS/FAIL/BLOCKED theo commit/môi trường/kịch bản đã chạy; không dùng test cũ hoặc báo cáo local Node 26 làm PASS hiện tại.
5. Commit/push/deploy/Jira chỉ theo yêu cầu riêng.

**Lượt này:** chỉ tài liệu/đối chiếu nguồn, không bật cờ, migration hoặc thay code. **Test local: không chạy (không được yêu cầu).** Chưa xem giao diện hoặc đo engine/runtime hiện tại.

## 17. Quyết định PO khi rà soát YC8 — 31/10/2026

**Chưa triển khai**; code và số đo hiện còn như mục 12. Bổ sung cho mục 6, 9, 10.

| # | Quyết định | AC bổ sung |
|---|---|---|
| 1 | **Cấp Khó không đạt ngưỡng (độ sâu 6 trong 3 giây, 100% bộ chiếu hết ngắn) thì ghi BLOCKED, giữ nguyên ngưỡng, báo PO quyết định hướng khắc phục.** Không tự nâng ngân sách, hạ mục tiêu hoặc đổi tiêu chí để báo đạt | AC-YC8-RV-01 |
| 2 | **Máy có yếu tố ngẫu nhiên nhẹ:** khi có nhiều nước có điểm đánh giá gần bằng nhau thì chọn ngẫu nhiên giữa chúng để mỗi ván khác nhau. Nước chiếu hết bắt buộc và nước tránh bị chiếu hết bắt buộc luôn được chọn; không đổi độ sâu hay ngân sách thời gian | AC-YC8-RV-02 |
| 3 | **Lịch sử và Replay của thành viên giữ vĩnh viễn, không giới hạn số ván và không tự xóa** (ván custom, AI, Bỏ dở, ván bị hủy). Áp dụng cho mọi nơi có History/Replay | AC-YC8-RV-03 |
| 4 | **Banner ván dở ở Sảnh có thêm nút Bỏ ván (Đầu hàng) có xác nhận** cho ván AI: đồng ý thì `RESIGN`, hủy worker, giải phóng vị trí chơi ngay; Hủy giữ nguyên ván | AC-YC8-RV-04, 05 |

### 17.1 Quy tắc chi tiết

- **Ngẫu nhiên nhẹ:** áp cho cả ba cấp; ngưỡng “gần bằng nhau” (độ lệch điểm) do dev chọn, ghi trong mã và tài liệu kỹ thuật; không được làm máy bỏ nước thắng/chiếu hết hoặc nước tránh thua hiển nhiên chỉ vì ngẫu nhiên. Nguồn ngẫu nhiên có thể gieo hạt cố định trong test để kết quả lặp lại được; bộ kiểm chiếu hết và đo p95 vẫn dùng chế độ xác định.
- **Kiểm cấp Khó:** vẫn dùng bộ chiếu hết độc lập và đấu máy 20 ván/cặp theo mục 13; kết quả BLOCKED ghi rõ số đo (độ sâu đạt, p95, tỷ lệ chiếu hết) thay vì kết luận đạt/không đạt chung chung.
- **Banner Sảnh:** hiện “Quay lại ván” và “Bỏ ván” cho chủ ván AI còn hạn 30 phút. Bỏ ván dùng cùng hộp xác nhận Đầu hàng (focus mặc định ở Giữ ván). Thành viên được lưu History kết quả `RESIGN`; Khách không lưu. Sau đó vị trí chơi được giải phóng để vào phòng khác.
- **Giữ vĩnh viễn:** không có job xóa theo tuổi hoặc theo số lượng; không có chức năng xóa ván của người dùng. Dung lượng dữ liệu tăng theo thời gian và được theo dõi trong vận hành, không thành lý do tự cắt lịch sử.

### 17.2 Tiêu chí bổ sung

| Mã | Given / When | Then bắt buộc |
|---|---|---|
| AC-YC8-RV-01 | Đo lại cấp Khó nhưng không đạt độ sâu 6 hoặc không đạt 100% bộ chiếu hết | Gate ghi BLOCKED kèm số đo thực; ngưỡng không bị sửa; không có thay đổi ngân sách/mục tiêu nếu PO chưa quyết |
| AC-YC8-RV-02 | Chơi nhiều ván cùng chuỗi nước người từ khai cuộc, mỗi cấp; chạy bộ chiếu hết | Ít nhất hai chuỗi nước máy khác nhau ở khai cuộc; mọi thế chiếu hết bắt buộc vẫn được giải đúng; nước máy luôn hợp lệ; gieo hạt cố định thì kết quả lặp lại |
| AC-YC8-RV-03 | Thành viên có ván cũ nhiều tháng | Lịch sử và Replay vẫn xem được; không có job xóa; số ván không bị cắt |
| AC-YC8-RV-04 | Chủ ván AI ở Sảnh khi ván còn trong 30 phút | Banner có Quay lại và Bỏ ván; Bỏ ván + xác nhận → `RESIGN`, hủy worker, giải phóng vị trí; thành viên có History, Khách không; Hủy giữ nguyên ván |
| AC-YC8-RV-05 | Người khác, tab hết quyền hoặc API trực tiếp gọi Bỏ ván của ván không phải của mình | Bị từ chối; ván không đổi |

**PO xác nhận 31/10/2026:** (a) ngẫu nhiên nhẹ áp cho cả ba cấp với cùng ngưỡng lệch điểm do dev chọn; (b) nút Bỏ ván ở banner chỉ cho ván AI, ván online/phòng chờ vẫn chỉ có Quay lại (rời ngay trong phòng).

### 17.3 Tác động triển khai (chưa làm)

- `packages/engine`: chọn ngẫu nhiên giữa nước điểm gần bằng nhau có thể cấu hình gieo hạt; giữ đường xác định cho bộ kiểm và GATE-ENGINE.
- Banner Sảnh (`LobbyShell`/banner ván dở): thêm Bỏ ván gọi cùng lệnh Đầu hàng AI; kiểm quyền chủ ván.
- Không thêm job dọn lịch sử; thêm theo dõi dung lượng nếu cần.
- Bằng chứng ở mục 12 và số đo `GATE-ENGINE-LOCAL` là trước các thay đổi này; không kế thừa PASS.
