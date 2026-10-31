# P1 · YC6 — Quyền phòng, Sảnh công khai và người xem

> **BA 0.27 — PO chốt 31/10/2026:** toàn bộ nội dung từng thuộc P2 (Ranked/Elo/bảng xếp hạng, ghép ngẫu nhiên Casual, Xin đi lại/Tái đấu Casual, phần Ranked của lịch sử/thống kê) nay thuộc **P1**. Mọi câu "vẫn P2 / giữ P2 / làm sau / Sắp ra mắt" còn lại trong tài liệu này là lịch sử và bị thay bởi [BA mục 0.27](BA-SCOPE-DECISIONS.md#027-đưa-toàn-bộ-phần-còn-lại-của-p2-lên-p1--po-chốt-31102026); QR vẫn bị loại. Chưa tái ước lượng giờ/Jira; chưa phải bằng chứng triển khai.

**Rà soát 31/10/2026:** PO chốt thêm Mời rời ghế, Xin ngồi ghế (nhiều yêu cầu, Host duyệt), danh sách tên người xem cho mọi người và bộ lọc Sảnh tại mục 17; **chưa triển khai**.

**Ngày lập/chốt bổ sung:** 31/10/2026. **Phạm vi:** EP-06, US-06.1–06.3 và giao điểm P1 theo BA0.19–0.24. **Trạng thái:** đã chốt đặc tả và đối chiếu code; chưa sửa hoặc nghiệm thu lại runtime trong lượt này. Ba lựa chọn PO tại mục15 đã ghi vào BA0.24: sticker cho cả Khách theo vai trò, cooldown10giây Host–phòng và khung mời ghế hai nút không X/Esc riêng.

## 1. Mục tiêu và nguồn ưu tiên

Host kiểm soát ai được vào phòng; người chơi/người xem đúng vai trò, đúng sức chứa, không có đường vòng qua mã/link/Sảnh/API/socket. Người xem theo dõi cùng bàn và kết quả nhưng không điều khiển ván, đọc chat riêng hoặc phát camera/mic. Chuyển vai trò/kick/khóa phải cập nhật quyền thật, không chỉ thay giao diện.

Nguồn:

1. [BA-SCOPE-DECISIONS.md](BA-SCOPE-DECISIONS.md), **Phần0 ưu tiên cao nhất**: 0.3,0.5–0.7,0.13–0.14,0.19–0.24; tiếp đến1.8,2.6–2.8,4.1–4.3,5.1,5.3,8.3.
2. [BACKLOG-P1.md](BACKLOG-P1.md), EP-06; [BACKLOG-P2.md](BACKLOG-P2.md) cho đối chiếu và AC nguồn của các Story mở rộng.
3. [YC2](P1-YC2-TAO-PHONG.md) cho ghế/Host/Ready; [YC3](P1-YC3-MOI-VAO-PHONG.md) cho vào/chuyển phòng; [YC4](P1-YC4-BAN-CO-VA-LUAT.md) cho chỉ đọc/Replay; [YC5](P1-YC5-VAN-ONLINE-VA-SU-CO.md) cho ván/reconnect/gián đoạn.
4. [Hợp đồng phòng](../engineering/server/room.md), [kiến trúc](../engineering/server/architecture.md), [realtime](../engineering/server/realtime.md); kỹ thuật không thay luật BA.
5. [DESIGN](../design/DESIGN.md) §7–8 và [danh mục giao diện](../design/DANH-MUC-MAN-HINH-XIANGQI.md) cho Sảnh/cài đặt/phòng/người xem; phân kỳ cũ trong danh mục bị thay bởi BA Phần 0.

**Truy vết:** danh sách EP-06 có **37 AC chi tiết**: 7 của US-06.1, 16 của US-06.2, 14 của US-06.3. Bảng tổng hợp Epic đang ghi 22; dùng 37 ID chi tiết để nghiệm thu, không tự sửa tổng baseline/giờ/Jira sinh báo cáo.

## 2. Phạm vi và ranh giới

| Chủ đề | YC6 chịu trách nhiệm | Không suy rộng |
|---|---|---|
| Quyền truy cập | PUBLIC/CODE_ONLY/LOCKED, Host quản lý, xoay mã khi mở khóa | CODE_ONLY không phải phòng có mật khẩu hoặc chỉ dành bạn bè |
| Sảnh | Tối đa 50 phòng PUBLIC, nút Vào chơi/Vào xem, cập nhật ≤2 giây | Không thêm queue Casual/Ranked, tìm kiếm/lọc/phân trang nếu chưa duyệt |
| Sức chứa | 2 ghế + 0–5 chỗ xem; kiểm server, giữ chỗ trong hạn | Không tăng trần hoặc đổi viewerLimit sau tạo |
| Chuyển vai trò | Người chơi không phải Host xuống xem; Host chuyển người kia/mời người xem xuống ghế | Không hoán đổi trực tiếp, không tự ngồi (chỉ Xin ngồi chờ Host duyệt, mục 17), không đổi vai trong ACTIVE |
| Kick | Cả hai người chơi được đuổi người xem; chặn danh tính tới CLOSED | Không đuổi đối thủ giữa ván bằng nút Kick, không ban toàn hệ thống |
| Đồng bộ | Người xem nhận bàn/lượt/clock/kết quả đúng quyền | Không độ trễ cố ý, không nhận quyền chơi |
| Chat/media | Thu hồi/cấp lại quyền theo vai trò, Kênh Chung cho người xem | YC7 phụ trách transport/filter/media; lỗi media không dừng ván |
| Lịch sử | Người xem không có quyền History/Replay của ván | P1 có Replay cho người chơi không đồng nghĩa Replay công khai |

Không có vai trò Admin/Moderator mới. Host luôn là người ngồi ghế; Host rời thì chuyển cho người chơi còn lại theo YC2. Phòng không còn người ngồi ghế đóng dù còn người xem.

## 3. Ma trận quyền

| Hành động | Host | Người chơi còn lại | Người xem | Người ngoài |
|---|---|---|---|---|
| Đổi chế độ phòng | Có | Không | Không | Không |
| Bật LOCKED | Khi đủ 2 ghế | Không | Không | Không |
| Tự chuyển sang xem | Không | WAITING, còn chỗ xem | Không áp dụng | Không |
| Chuyển người chơi kia sang xem | WAITING, còn chỗ xem | Không | Không | Không |
| Mời người xem xuống ghế | WAITING, còn ghế | Không | Không | Không |
| Nhận/từ chối lời mời xuống ghế | Không áp dụng | Không áp dụng | Chỉ người được mời | Không |
| Tự lấy ghế trống từ vai trò xem | Không áp dụng | Không áp dụng | Không | Không |
| Kick người xem | Có | Có | Không | Không |
| Đi quân/Xin hòa/Undo online | Theo YC4/YC5 | Theo YC4/YC5 | Không | Không |
| Chat Kênh Riêng | Có | Có | Không | Không |
| Chat Kênh Chung | Có | Có | Có | Không |
| Phát camera/mic | Theo quyền tab và lựa chọn cá nhân | Tương tự | Không | Không |
| Nhận camera/mic người chơi | Theo policy nhận/phát | Tương tự | Chỉ người chơi cho chia sẻ tới người xem | Không |

Thành viên và Khách có quyền YC6 theo vai trò, kể cả Host/đối thủ là Khách; không yêu cầu kết bạn để vào/xem. Phiên hết hạn/quyền tab chỉ đọc vẫn chặn mutation. **Sticker P1 cho cả Khách theo BA0.24**, nhưng không mở DM, Replay, Kênh Riêng của người chơi cho người xem hoặc quyền phát media.

## 4. Ba chế độ và chuyển trạng thái

| Chế độ | Hiện ở Sảnh | Người mới vào | Người hiện có |
|---|---|---|---|
| PUBLIC | Có | Sảnh hoặc mã/link/lời mời hợp lệ | Giữ vai trò/quyền |
| CODE_ONLY | Không | Mã/link/lời mời hợp lệ, không cần là bạn | Giữ vai trò/quyền |
| LOCKED | Không | Bị chặn dù có mã/link/lời mời | Giữ người chơi/người xem; reconnect còn hạn được phép |

### 4.1 Tạo và đổi chế độ

- Form tạo chỉ cho PUBLIC hoặc CODE_ONLY; CODE_ONLY mặc định. Không chọn LOCKED khi tạo; số người xem 0–5 cố định từ tạo, mặc định 5.
- Chỉ Host được đổi chế độ trong phòng đang mở, kể cả đang đấu. Server kiểm quyền mới nhất, phiên bản phòng và đủ ghế nếu đang bật LOCKED.
- Đủ 2 người là điều kiện **bật khóa**, không phải điều kiện giữ khóa. Phòng đã LOCKED mà một người rời vẫn LOCKED; Host chủ động mở hoặc mời người xem đang có xuống ghế.
- Khóa không đuổi người đang xem, không ngắt media/chat của họ; muốn đuổi phải Kick đích danh.
- PUBLIC → CODE_ONLY/LOCKED: phòng biến khỏi feed; yêu cầu Vào chơi/Vào xem từ dòng Sảnh cũ phải bị kiểm lại và từ chối. Không coi cache danh sách là quyền vào.
- PUBLIC ↔ CODE_ONLY không tự đặc tả xoay mã; rào thu hồi và sinh mã mới bắt buộc ở chu kỳ khóa/mở khóa theo BA 4.3.

### 4.2 Khóa, mã/link và mở lại

Khóa vô hiệu mã/link/lời mời chưa dùng ngay về quyền vào. Mở LOCKED → PUBLIC/CODE_ONLY sinh mã 8 chữ số và link mời mới; mã/link cũ không được sống lại. Room ID và người hiện có không đổi. Chỉ có Sao chép link/Sao chép mã, không QR.

Cần phân biệt URL nội bộ của người đã là thành viên phòng với link mời mang quyền vào: không dùng Room ID công khai hoặc route cũ để bỏ qua yêu cầu thu hồi link/mã. Kiểm cả route, resolve, API và admission thực tế; không kết luận đạt chỉ vì mã hiển thị đổi.

Retry cùng lệnh không xoay nhiều lần; mã trùng/lỗi DB rollback cả thay đổi, không báo mở thành công khi vẫn chưa có mã hợp lệ. Nếu mất quyền Host khi modal đang mở, khóa thao tác và yêu cầu đồng bộ; không tin trạng thái Host đã cache.

## 5. Sảnh công khai — US-06.2

### 5.1 Nội dung, thứ tự và nhịp

Mỗi dòng: tên tự sinh `Phòng <mã>`; Host Display Name + nhãn Khách nếu có; mức giờ Không giới hạn/5/10/15; Đang chờ/Đang đấu; Người xem x/N hoặc “Không cho xem” nếu N=0; hành động theo chỗ.

- Phòng mở PUBLIC gần nhất lên đầu, tối đa 50. Không tự thêm phân trang hoặc ưu tiên “đông người”/“bạn bè” khác BA.
- PUBLIC mới, thay trạng thái/số chỗ, đổi Host, đóng/rời PUBLIC phải cập nhật trong **≤2 giây**, không yêu cầu refresh thủ công.
- Feed hiện dùng poll server 1.000 ms; không nâng nhịp để tiết kiệm DB mà tự phá AC. Số đo query/tick không thay bằng chứng thời gian cập nhật UI qua mạng.
- CODE_ONLY/LOCKED/đóng không lọt vào catalog kể cả response cũ, cache hoặc tab tài khoản khác. Catalog chung không chia sẻ phiên/quyền; mỗi người đọc vẫn xác thực.
- Danh sách stale hoặc mất kết nối phải báo rõ; không giả ERROR là EMPTY, không để nút vào dựa dữ liệu cũ lách quyền server.

### 5.2 Vào chơi và vào xem

| Ý định | Khi server xử lý | Kết quả |
|---|---|---|
| Vào chơi | WAITING, còn ghế, actor không giữ vị trí chơi khác | Ngồi ghế còn lại |
| Vào chơi | Ghế vừa bị người khác lấy, còn chỗ xem | Vào xem, báo “Ghế vừa có người, bạn đang xem trận” |
| Vào chơi | Không còn ghế/chỗ xem | Báo phòng đầy, không ghi dở |
| Vào xem | Còn chỗ xem | Là người xem dù có ghế trống |
| Vào xem | Hết chỗ xem/N=0 | Từ chối, không tự lấy ghế thay |
| Bất kỳ nút Sảnh cũ | Phòng không còn PUBLIC | Từ chối từ đường Sảnh, không tự chuyển sang admission CODE_ONLY |
| Mã/link/lời mời | Ghế trống hoặc đầy | Theo YC3: auto ghế trước, rồi người xem nếu còn chỗ và đủ quyền |

Vị trí được xác nhận dưới khóa, không giữ chỗ từ thời điểm render nút hoặc precheck. Tranh chỗ cuối không vượt 2 người chơi/N người xem/7 người tổng. Bị block, sai phiên hoặc LOCKED vẫn từ chối dù catalog trước đó có nút.

### 5.3 Chuyển từ phòng A

Đang xem A nhận lời mời/vào B qua luồng chuyển của YC3: chỉ rời A khi B nhận chỗ hợp lệ trong cùng giao dịch; B đầy/khóa/lỗi phải giữ A và báo tại chỗ. Không đưa ra màn lỗi toàn trang làm mất A. Không tự rời ghế/ván AI/online khác để chuyển.

Không suy một vị trí chơi thành cấm mọi thao tác xem ngoài phạm vi đã chốt; cũng không tự thiết kế chế độ xem nhiều phòng. Nếu thay đổi chính sách nhiều tab/phòng, phải có quyết định riêng; đặc tả này giữ ràng buộc hiện hành và nguyên tử của luồng chuyển YC3.

## 6. Sức chứa, người offline và quyền quay lại

- Số chỗ xem cố định 0–5; tối đa 2 ghế + N chỗ xem. N=0 không nhận người xem và không cho chuyển người chơi xuống xem.
- Người xem mất kết nối giữ chỗ 5 phút. Trong hạn, chỗ đó vẫn tính vào sức chứa; reconnect không thêm một người thứ hai. Quá hạn mất chỗ, không xử phạt.
- Người chơi WAITING giữ ghế 60 giây khi mất kết nối; ACTIVE xử theo YC5. Không nhận người mới vào ghế đang được giữ chỉ vì UI hiện Offline.
- LOCKED vẫn cho người có ghế/chỗ xem nối lại trong hạn; quá hạn hoặc chủ động rời là admission mới, bị khóa/chặn/sức chứa hiện tại kiểm lại.
- Gia hạn token/refresh/reconnect không tự đặt lại cửa sổ 5 phút vô hạn bằng yêu cầu stale; mốc server và fencing connection quyết định.
- Không xóa chỗ của người offline trước hạn để nhận người mới. Dọn hết hạn phải an toàn khi worker trễ và nhiều người cùng vào.

Danh sách tên/số đếm cần nhất quán với chỗ được giữ, không chỉ đếm socket đang online. Nếu UI có nhãn offline thì không biến thành quyền mất chỗ trước hạn.

## 7. Ghế → người xem

### 7.1 Người chơi tự xuống xem

Chỉ người chơi không phải Host, phòng WAITING/sau ván đã về WAITING, chưa đếm bắt đầu, còn chỗ xem. Thành công:

1. Chuyển membership thành SPECTATOR, bỏ phe/Ready và giải phóng reservation ghế đúng phòng.
2. Reset Sẵn sàng của đối thủ (Host không có Sẵn sàng, YC2 mục 21.1), hủy countdown/đề nghị ghế hoặc đổi bên không còn hợp lệ.
3. Mất quyền điều khiển ván và đọc/gửi Kênh Riêng; cập nhật token/track media, không giữ quyền phát cũ.
4. Tăng phiên bản/phát snapshot sau commit; không xóa toàn bộ chat chung hoặc reset ván cũ sai vòng đời.

Nút của Host ẩn. Với người chơi có quyền tự xuống nhưng N=0/đầy chỗ, nút **disabled kèm lý do “Phòng không còn chỗ cho người xem”**, không biến mất khiến người dùng không biết vì sao.

### 7.2 Host chuyển người chơi kia

Cùng điều kiện WAITING/còn chỗ xem; không được chuyển chính mình, người xem hoặc đối thủ ACTIVE. Không cần đối thủ chấp nhận theo BA hiện hành; không tự đổi thành thao tác Kick hoặc hoán đổi trực tiếp để vượt N.

Cập nhật reservation, Ready, proposal, chat/media như tự xuống. Trong lúc countdown không đổi thành phần ghế để khởi tạo sai cặp; phải hủy/kiểm lại theo hợp đồng YC2.

## 8. Người xem → ghế: lời mời của Host

### 8.1 Luồng đã có trong repo

- Chỉ Host ở WAITING, còn ghế, mời người đang xem trong cùng phòng.
- Repo hiện có một pending/room và hạn **30 giây**; lời mời **không giữ ghế**.
- Người nhận chủ động Chấp nhận/Từ chối; không tự đồng ý, không cho người xem tự gọi join để đổi vai.
- Khi accept: kiểm lại phiên/quyền người nhận, đúng lời mời còn hạn, Host/roster/phòng/countdown, ghế trống và mọi vị trí chơi khác **kể cả AI**.
- Thành công vào phe đang trống, giải phóng chỗ xem, chưa Ready; cả phòng reset Ready theo YC2, không vào ván trực tiếp.
- Nếu ghế đã có người/phòng thay đổi/quyền không còn, báo rõ và giữ vai trò xem. Lời mời cũ không áp lên ván/Host/offer mới.

BA0.24 giữ hạn30giây/một pending/phòng và không giữ chỗ; chưa coi chốt đặc tả là nghiệm thu code. Không sao chép nhiều popup mời vào phòng YC3 sang lời mời ngồi một ghế còn lại trong phòng.

### 8.2 Hợp đồng và UI cần hoàn thiện

- Hiện người mời, hành động, thời gian còn lại từ server; hết hạn không giữ nút như còn nhận được.
- Phản hồi phải ràng buộc đúng offer identity/phiên bản; response/HTTP retry từ lời mời cũ không được trả lời lời mời mới vừa gửi cùng người nhận.
- Host có trạng thái “Đã mời, chờ trả lời”; không tạo trùng hoặc kéo deadline bằng click lặp. Khi ghế đầy/thành phần ghế đổi/phòng đóng, lời mời không còn hợp lệ được đóng.
- Khung nonmodal, chỉ **Chấp nhận/Từ chối + đếm ngược**; không X/Esc riêng, không bắt Esc toàn trang để xử lời mời, không trap focus/che bàn. Cooldown sau phản hồi/hết hạn theo mục8.3/BA0.24, không mượn quy tắc Xin hòa hoặc room invite.
- Không dùng expired-offer cleanup rồi throw để rollback chính cleanup như thể đã đóng; kiểm commit/ack/snapshot thực tế.

### 8.3 Cooldown mời ghế — PO đã chốt

- Sau **Từ chối hoặc hết hạn** chờ10giây theo cặp `(Host, phòng)`, chung mọi người nhận và tab của Host đó. Một pending/phòng vẫn là ràng buộc riêng, không cho mời song song chỉ vì cooldown đã hết.
- Từ chối tại thời điểm server T → hạn T+10giây. Expire ở deadline E → hạn E+10giây, không lấy lúc worker dọn; nếu worker chạy sau hạn cooldown thì không bắt chờ thêm10giây.
- Không áp cooldown từ gửi lỗi, retry trùng hoặc đóng offer vì ghế/phòng đổi; không trừ slot như đã gửi thành công.
- Host mới dùng cặp danh tính–phòng riêng; Host cũ trở lại vẫn chịu hạn của mình còn hiệu lực. Đổi tab/thiết bị không reset hoặc tạo bộ đếm riêng.
- Server trả hạn/còn bao lâu; UI disabled có lý do và hết chờ theo thời gian server, recheck khi gửi. Cooldown này **không** kéo hoặc reset hạn mời vào phòng YC3.

## 9. Kick và block theo vòng đời phòng

Cả hai người chơi, không chỉ Host, có quyền Kick người đang là SPECTATOR trong phòng. Người xem/người ngoài/readonly không được gửi lệnh đuổi. Không Kick người chơi hoặc dùng target ID tùy ý ngoài phòng.

1. Bấm Đuổi → xác nhận tên mục tiêu, nói rõ chặn đến khi phòng đóng; focus mặc định Hủy. Hủy không gửi lệnh.
2. Confirm → server kiểm lại quyền/target hiện tại trong transaction. Nếu target vừa lên ghế, không đuổi như người xem cũ.
3. Xóa membership, ghi block theo room + danh tính, cập nhật version/outbox và đóng quyền chat/snapshot. Sau commit gửi thông báo đưa người bị đuổi về Sảnh; không gửi snapshot riêng tư để thông báo terminal.
4. Thu hồi người tham gia LiveKit/quyền nhận media thực tế qua outbox; ghi thời gian thu hồi trong GATE-MEDIA. Không báo “đã thu hồi ngay” chỉ từ một dòng event DB.
5. Mọi lối vào lại cùng danh tính đều bị chặn tới **CLOSED**, kể cả mã/link mới, lời mời, PUBLIC, refresh, reconnect, retry receipt cũ hoặc đổi Display Name/Username.

Block giữ qua ván mới/Tái đấu/đổi phe/đổi Host/đổi chế độ; không chỉ tới FINISHED. Không thêm nút bỏ chặn/report/ban hệ thống ngoài BA.

**Giới hạn PO đã chấp nhận:** cùng người thật có thể tạo phiên Khách mới rồi quay lại nếu phòng chưa LOCKED, vì đó là danh tính mới. Không hứa chặn theo người thật, không thêm fingerprint/IP ban hoặc bỏ quyền Guest để che giới hạn. Khóa phòng là cách hiện hành ngăn người mới.

Token LiveKit đã phát có hạn riêng; việc disconnect người tham gia và chặn cấp token mới không tự chứng minh token cũ không thể được replay trước TTL. Phải kiểm provider thực tế và báo giới hạn; không coi hết JWT là thu hồi stream đang chạy. Không tự mở rộng sang thiết kế token mới trong lượt tài liệu.

## 10. Quyền xem bàn, chat, media và kết quả

| Bề mặt | Quyền người xem | Khi mất vai trò/quyền |
|---|---|---|
| Bàn/lượt/đồng hồ/kết quả | Cùng dữ liệu ván hiện tại, Đỏ dưới, chỉ đọc | Không nhận snapshot mới khi bị kick/rời |
| Kênh Chung | Đọc/gửi text và12 sticker P1, tin từ lúc vào | Thu hồi theo membership; không biến room chat thành DM |
| Kênh Riêng | Không đọc/gửi, kể cả API/socket trực tiếp | Xuống xem mất quyền của cặp cũ |
| Camera/mic | Chỉ nhận người chơi chọn chia sẻ tới người xem | Không có publish/data permission; token phải phản ánh role mới |
| Kết quả | Panel đúng winner/reason, không nút người chơi | Hòa đồng thời/INTERRUPTED theo BA 0.23/YC5 |
| History/Replay/FEN/PGN | Không có quyền chỉ từ việc đã xem | Thành viên phải là người chơi của ván mới đọc được |

Người xem không bị thêm độ trễ cố ý 5–10 giây. Mục tiêu nước đi p95 <100 ms theo NFR-01 là mục tiêu khác với feed Sảnh ≤2 giây; không dùng số đo feed hoặc ack thay cho cập nhật bàn người xem.

Thay cặp ghế tạo mốc chat riêng mới, người mới không đọc tin cặp cũ; cùng cặp đổi phe/Tái đấu giữ chat. Lỗi media không phá ván, chat hoặc việc quản lý chỗ; nhưng quyền người đã bị kick vẫn phải tiếp tục thu hồi/đối soát, không giả thành công nếu provider lỗi.


**Sticker P1 — BA0.24:** người chơi thành viên/Khách dùng ở Riêng/Chung theo quyền; người xem thành viên/Khách chỉ Chung; DM chỉ thành viên accepted friends. Đủ12 allowlist `clap`, `heart`, `think`, `sweat`, `cry`, `tea`, `lightning`, `silent`, `thumbsup`, `handshake`, `flag`, `fire`; một chạm gửi shortcode, SVG ứng dụng và nhãn trợ năng, không HTML/SVG tùy ý. Một sticker tính một tin theo rate/filter của kênh, không mở quota riêng. `flag` không đầu hàng ván, `thumbsup`/`handshake` không tự đồng ý đề nghị.

## 11. Dữ liệu, transaction và race

- Admission/mutation dùng proof thực, khóa actor/phòng theo thứ tự, kiểm phiên và role mới nhất; `withRoom` chứa ghi DB/receipt/outbox cùng commit. Controller không chạy SQL hoặc nhận RoomScope tin cậy từ body.
- Tất cả reservation/vị trí online/AI phải được kiểm, không chỉ `room_id IS NOT NULL`. Không đổi vai trước rồi phát hiện actor đã giữ AI khiến trả lỗi SQL thay lỗi nghiệp vụ.
- Version/commandId/fingerprint ngăn retry tạo hai block, hai lời mời, hai chỗ hoặc xoay mã nhiều lần. Receipt không cấp lại quyền người đã bị block/kick.
- Server recheck target sau khi chờ khóa: người xem vừa thành người chơi thì lệnh kick cũ không còn hợp lệ; Host vừa rời thì modal cũ không được đổi settings.
- Người ngồi ghế cuối rời: đóng phòng, đưa người xem về Sảnh, xóa room chat và thu hồi media theo vòng đời. Không tạo một phòng chỉ có người xem với Host không còn ghế.
- Cache catalog chỉ chia sẻ dữ liệu PUBLIC theo tick; không cache/quá hạn role/phiên để tiết kiệm kiểm quyền.
- Migration mới nếu cần phải có rollback, không sửa migration đã áp dụng hoặc xóa block/dữ liệu người dùng để vượt readiness.

## 12. Giao diện gọn và đủ trạng thái

- Sảnh: danh sách gọn, hiển thị đúng cột/nút; desktop dùng vùng danh sách cuộn nội bộ khi dài, mobile thẻ gọn không cuộn ngang. Không đẩy luật chơi mở rộng và 50 phòng thành trang buộc cuộn dài mặc định.
- Phòng: panel Người xem x/N, danh sách tối đa 5; hành động theo vai trò, không thêm page quản trị riêng. Cài đặt tái sử dụng modal hiện có, mức giờ/trần xem chỉ đọc.
- Phân biệt quyền không có với hành động tạm không khả dụng: người xem không thấy Kick; Host không thấy tự xuống; người chơi hết chỗ xem thấy disabled có lý do.
- SUCCESS đồng bộ từ server; LOADING khóa gửi lặp; EMPTY giải thích và đường Tạo phòng; ERROR giữ thông tin và có thử lại; DISABLED có lý do truy cập được bằng bàn phím/chạm, không chỉ tooltip hover.
- Người nhận mời ghế dùng được bằng bàn phím, deadline rõ; khung nonmodal không trap focus, chỉ Chấp nhận/Từ chối, không X/Esc riêng theo BA0.24.
- Confirm kick/khóa không chồng modal; Hủy an toàn, tên mục tiêu là text thuần. Thông báo tạm không che bàn/Đầu hàng; focus không mất sau cập nhật danh sách.
- 360 px không cuộn ngang; 1366×768 ưu tiên bàn/lượt/hành động chính, panel phụ cuộn nội bộ; zoom hoặc màn thấp được cuộn dọc thay vì cắt nội dung. Kiểm sáng/tối/system theo theme P1, không thêm palette hoặc style riêng YC6.

## 13. Truy vết đủ 37 AC và kế hoạch nghiệm thu

Bảng là kế hoạch, không phải kết quả PASS của lượt đặc tả.

| AC | Điều cần chứng minh | Ca chính |
|---|---|---|
| AC-06.1.1 | Chỉ Host mở/đổi settings | UI + API giả mạo, Host đổi khi modal đang mở |
| AC-06.1.2 | Chưa đủ 2 ghế không bật LOCKED | Disabled có lý do, server từ chối |
| AC-06.1.3 | Khóa chặn mới, giữ người cũ/media | Join/kick/khóa race, mã/link/invite cũ |
| AC-06.1.4 | LOCKED reconnect đúng hạn | Người chơi 60 giây/người xem 5 phút, biên hạn |
| AC-06.1.5 | Mở khóa sinh mã/link mới | Trùng mã/retry/rollback, mã/link cũ không sống lại |
| AC-06.1.6 | Thiếu ghế vẫn giữ khóa | Host mới chủ động mở hoặc mời người xem cũ |
| AC-06.1.7 | Người mới có mã vẫn bị chặn | Mọi entry point, không chỉ nút UI |
| AC-06.2.1 | Dòng PUBLIC đủ nội dung | Host Khách, Không giới hạn, N=0 |
| AC-06.2.2 | Thứ tự mở PUBLIC, tối đa 50 | Đóng/mở lại PUBLIC, cùng mốc sắp xếp ổn định |
| AC-06.2.3 | Thay đổi feed ≤2 giây | Tạo/đổi/đóng/số chỗ, browser thật |
| AC-06.2.4 | Còn ghế có Vào chơi, xem khi còn chỗ | WAITING và reservation offline |
| AC-06.2.5 | Đủ ghế chỉ xem; đầy/N=0 không xem | Ma trận sức chứa 0–5 |
| AC-06.2.6 | Ghế vừa hết fallback xem hoặc đầy | Hai người tranh ghế cuối, notice đúng |
| AC-06.2.7 | Vào xem không tự ngồi | Phòng còn ghế, gọi API với watch |
| AC-06.2.8 | Không phòng PUBLIC có EMPTY/Tạo phòng | Không nhầm lỗi feed thành EMPTY |
| AC-06.2.9 | CODE_ONLY/LOCKED không trong feed | Catalog/cache/response cũ, phiên bị thu hồi |
| AC-06.2.10 | Bốn mode đúng phân kỳ | Cả bốn mode hoạt động theo BA 0.27; Khách bị chặn Đánh Hạng kèm tooltip |
| AC-06.2.11 | Luật chơi thu gọn, đúng luật rút gọn | Hết nước thua, chiếu/lặp/120, không đuổi riêng; keyboard |
| AC-06.2.12 | Navigation theo BA hiện hành | History thành viên hoạt động theo BA 0.22, leaderboard P2; Khách không History/Bạn bè |
| AC-06.2.13 | Quên mật khẩu hoạt động P1 | Không nhãn Sắp ra mắt, dùng username/OTP YC1 |
| AC-06.2.14 | Khách được entry/play/watch/AI | Vai trò và phiên đúng, không vô tình yêu cầu bạn bè |
| AC-06.2.15 | Tạo/chuyển PUBLIC hiện ≤2 giây | Thành viên/Khách, version sau commit |
| AC-06.2.16 | Rời PUBLIC biến mất, stale join bị chặn | PUBLIC→CODE_ONLY/LOCKED, không fallback đường riêng |
| AC-06.3.1 | Danh sách x/N realtime | Người offline giữ chỗ, đổi tên/role/join/leave |
| AC-06.3.2 | Người không Host tự xuống WAITING | Reset Ready/reservation/chat/media, chưa countdown |
| AC-06.3.3 | Hết chỗ/N=0 disabled có lý do | Không chỉ ẩn nút, server không vượt N |
| AC-06.3.4 | Host chuyển người chơi kia | Đúng target/khóa/quyền, không tự chuyển Host |
| AC-06.3.5 | Host mời, người xem đồng ý, recheck | 30 giây, stale offer, ghế bị lấy, AI reservation, giữ xem khi lỗi |
| AC-06.3.6 | Người xem không tự ngồi | UI và API/socket trực tiếp, không đổi intent lách |
| AC-06.3.7 | Host không tự xuống xem | Ẩn UI và server từ chối |
| AC-06.3.8 | ACTIVE không đổi ghế↔xem | Cả tự/Host/mời/accept, request cũ sau start |
| AC-06.3.9 | Giữ chỗ 5 phút, quá hạn mất | Worker chậm/reconnect/tranh chỗ, LOCKED |
| AC-06.3.10 | Cả hai người chơi được Kick | Host/đối thủ/Khách, người xem không được |
| AC-06.3.11 | Kick xác nhận tên, focus Hủy | Hủy/Esc không gửi; target vừa đổi vai |
| AC-06.3.12 | Kick về Sảnh, thu hồi media thật | Socket/chat/LiveKit, đo revoke, provider lỗi |
| AC-06.3.13 | Block tới CLOSED mọi đường | Tái đấu/đổi Host/đổi mã, retry/receipt/reconnect |
| AC-06.3.14 | Thông báo bị chặn rõ ràng | Đúng màn/lỗi Việt, không lộ snapshot riêng |

Hồi quy chung: tranh chỗ cuối; khóa hoặc kick đúng lúc accept; nhiều tab/phiên bị thu hồi; member–guest; chuyển A→B rollback; đổi vai khi còn token phát cũ; Tái đấu giữ block/người xem; đúng reason hòa mới BA 0.23; không nhận người xem trong mode AI/Casual/Ranked.

Không đặt PASS cho media hoặc độ trễ chỉ bằng unit/SQL fixture. Kiểm API/socket/RLS và browser thật, GATE-MEDIA ghi thời gian provider; kiểm mạng LAN/thiết bị thật theo gate dự án. Chưa chạy các ca này trong lượt tài liệu.

## 14. Đối chiếu code và những phần P2 liên quan

> **Lưu ý (rà chéo 31/10/2026):** mục này là đối chiếu lịch sử trước BA 0.27–0.36. Ghép ngẫu nhiên Casual, Ranked và các phần Casual/Ranked đã **P1** (xem [YC9](P1-YC9-GHEP-TRAN-CASUAL-RANKED.md)); mọi câu "giữ P2", "queue 3 phút", "xác nhận 10 giây" hay "vào ván ngay" bên dưới đã bị thay.

### 14.1 Code hiện tại — chỉ đọc, chưa tái hiện runtime

| Hạng mục | Bằng chứng | Kết luận / việc cần kiểm |
|---|---|---|
| Đổi chế độ/xoay mã | `room-store.ts` hàm changeVisibility; `RoomSettings.tsx` | Có Host/version/2 ghế/xác nhận, xoay mã khi mở khóa; kiểm link cũ end-to-end trước kết luận đạt |
| Admission | `room-store.ts` hàm join; `public/public-room-store.ts` | Có LOCKED/block/sức chứa/active position và public recheck trước shortcut; watch không lấy ghế |
| Feed | `public-room-feed.ts`, `public-room-catalog.ts`, `public-room-store.ts` | Poll 1.000 ms, PUBLIC/LIMIT50, catalog theo tick nhưng auth riêng. Đếm người xem chưa quá grace; chưa đo ≤2 giây hiện tại |
| Tự/Host xuống xem | `room-store-viewers.ts` | Có WAITING/quyền/capacity, reset Ready và reservation; cần kiểm thu hồi chat/media thực tế khi đổi role |
| Nút xuống xem khi đầy | `RoomPage.tsx:1071–1077`, `SpectatorsPanel.tsx` | **Lệch AC-06.3.3:** container chỉ cho render khi còn chỗ, panel không có disabled reason. Cần giữ nút với giải thích cho người có quyền nhưng hết chỗ |
| Seat invite deadline | `room-store-viewers.ts`, migration `20261011000016_room_viewers.sql` | Có một pending/room và 30 giây. UI nhận tại RoomPage chỉ có hai nút, chưa thấy đếm ngược/hết hạn tại khung đã đọc |
| Seat invite identity | respondDown và `RoomPage.tsx` | Response hiện chỉ accept, store lấy pending mới nhất. **Rủi ro phản hồi cũ trả lời offer mới**; cần offerId/phiên bản, kiểm consumer-visible regression, không coi một pending là đủ chống stale |
| Người được mời đang AI | inviteDown/respondDown | Query busy dùng room_id khác phòng và không null, chưa kiểm AI reservation ở đoạn này; INSERT active_players vẫn có thể chặn cuối nhưng cần lỗi nghiệp vụ đúng, không SQL generic/đổi role dở |
| Mốc thời gian | respondDown | Tạo/expire dùng DB clock, nhánh accept so Date.now; cần nguồn thời gian tin cậy nhất quán sau khóa và ca sát deadline |
| Kick/block | kickViewer, tests `room-viewers.test.ts` | Có role PLAYER/target SPECTATOR/block/outbox revoke, không chỉ Host; cần thử quyền socket/token cũ và target đổi role |
| Snapshot/role UI | `RoomPage.tsx`, `SpectatorsPanel.tsx`, `RoomSettings.tsx` | Khối trình bày nhận props, lệnh tại container; cần disabled khi mất quyền/tab, không chỉ busy |
| Test hiện hữu | `room-modes.test.ts`, `room-viewers.test.ts`, `room-viewer-grace.test.ts`, `room-worker-viewer.test.ts`, `SpectatorsPanel.test.ts`, `RoomSettings.test.ts` | Có test cấu phần; không dùng số lượng test hoặc test forwarding làm bằng chứng đủ AC/end-to-end |

Một số tài liệu/design vẫn ghi Lịch sử/Replay P2 hoặc luôn Sắp ra mắt. BA 0.22 đã chuyển phần custom/AI lên P1; cần điều chỉnh tham chiếu giao diện liên quan, không đổi quyền người xem để hợp thức hóa label cũ.

### 14.2 P2 còn lại: có gì đáng đưa lên P1?

| Chức năng / mã | Quan hệ với YC6 | Quyết định hiện hành / đề xuất |
|---|---|---|
| **12 sticker — US-P2-17 / XIAN-131**, AC-P2-17.1–3 | Người xem thành viên/Khách dùng ở Chung, người chơi đúng kênh, DM chỉ thành viên accepted friends; không cấp private/media cho người xem | **PO chuyển P1 theo BA0.24, cả Khách đúng vai trò**. Là giao điểm YC6/YC7, không kéo Ranked/Casual hoặc DM cho Khách; đủ12 và các kênh P1 tương ứng, chưa nghiệm thu |
| Thẻ tóm tắt/leaderboard — US-P2-06 / XIAN-120 | Có thể hiển thị tóm tắt người chơi khi tương tác tên trong Sảnh/phòng | **Giữ P2**, phụ thuộc Ranked/Elo/thống kê; không tách một hồ sơ công khai hoặc làm Elo giả để gắn vào YC6. Tên/nhãn Khách đã là yêu cầu P1, không cần Story này |
| Quyền Ranked — US-P2-04/05 / XIAN-118/119 | Cấm người xem/PUBLIC/chia sẻ, quyền nhận media riêng | **Giữ P2** cùng Ranked; không mang hạn chế này áp vào custom, không mở người xem Ranked |
| Ghép Casual — US-P2-07 / XIAN-121 và phần Casual XIAN-122/123 | Phòng ghép không người xem/chia sẻ/Kênh Chung, vòng đời khác custom | **PO đã chốt giữ P2 ở BA 0.23**, không hỏi lại hoặc kéo lên chỉ vì làm settings |

**Không có Story P2 riêng còn lại** cho tăng người xem, đổi viewerLimit giữa phòng, spectator delay, chỉ Host được Kick, moderator, unban/report hoặc chặn IP/thiết bị. Một số còn trái BA hoặc ngoài phạm vi; không trình bày chúng như hạng mục P2 sẵn có để chuyển.

### 14.3 Đã lên P1 — chỉ nghiệm thu giao điểm

- XIAN-123 Tái đấu custom giữ spectators/blocks/privacy cùng phòng; không reset ban sau một ván.
- XIAN-124 Không giới hạn hiển thị đúng trong feed và Khách được xem theo sức chứa, không đồng hồ0 giả.
- XIAN-125/127/129 History/Replay/export chỉ người chơi thành viên; người xem không có quyền vì đã từng tham gia phòng.
- XIAN-132/133 DM/Thách đấu không thay quyền người xem; DM chỉ bạn accepted, thách đấu mở form tạo phòng đã chốt.
- XIAN-137 demo mạng chỉ môi trường demo; kiểm grace người xem 5 phút, không gán họ thành người chơi bị thua.
- XIAN-138 media giữa tab, XIAN-139 theme: giữ role/readonly/contrast, không mở publish cho người xem.
- XIAN-130 QR đã bỏ cả hai phân kỳ, không đưa lại.

**Phạm vi đã chốt:**37 AC YC6 giữ nguyên, mở rộng hành vi AC-06.3.5 theo BA0.24;3 AC sticker nguồn bổ sung P1 cho thành viên/Khách đúng vai trò. Casual/Ranked/leaderboard P1 theo BA 0.27. Chốt phạm vi không thay kiểm chứng quyền thật, race, cooldown hoặc thu hồi media.

## 15. Các quyết định PO đã chốt — BA0.24

| Câu hỏi | Trả lời PO | Hệ quả bắt buộc |
|---|---|---|
| Q1 — Sticker XIAN-131? | **Đưa P1, cho cả Khách theo vai trò** | Đủ12 allowlist SVG/shortcode; người xem chỉ Chung, người chơi đúng kênh; DM vẫn chỉ thành viên accepted friends. Cùng rate/filter, không kéo Ranked/Casual |
| Q2 — Cooldown mời xuống ghế? | **10giây theo Host trong phòng** | Chung mọi người nhận/tab; Từ chối tính từ phản hồi server, expiry từ deadline gốc; không reset bằng tab hoặc lúc worker dọn. Tách cooldown room invite YC3 |
| Q3 — Đóng khung mời ghế? | **Chỉ hai nút, không X/Esc** | Nonmodal, Chấp nhận/Từ chối + đếm ngược; không bắt Esc toàn trang, không thêm thu gọn hoặc tự chấp nhận |

Không còn câu hỏi chờ cho ba quyết định này. Quyền Kick của cả hai người chơi, giới hạn phiên Khách mới, giữ chỗ5phút, khóa không đuổi người cũ và trần5 người xem giữ nguyên; không thêm Admin/unban/ban theo người thật.

## 16. Bàn giao và trình tự khi có nhiệm vụ triển khai

1. Áp dụng BA0.24/AC nguồn/giao điểm YC7 đã đồng bộ; giữ ID Story/Jira, không tự Done/đổi giờ.
2. Hoàn thiện sai lệch AC đã có: disabled có lý do, deadline/offer identity, kiểm mọi reservation, lỗi stale rõ ràng, nguồn thời gian nhất quán.
3. Kiểm thực tế các entry point, race chỗ cuối, khóa/mở mã mới, role transition/chat/media, block qua Tái đấu/Host mới; không dùng test cũ để giữ hành vi trái BA.
4. Browser thật desktop/mobile, người chơi/Khách/người xem và provider LiveKit; đo ≤2giây feed, độ trễ bàn và revoke theo gate. Ghi phần chưa có điều kiện là BLOCKED, không giả PASS từ mock.
5. Cập nhật bằng chứng theo commit/môi trường/AC khi thực sự chạy; commit/push/deploy chỉ theo yêu cầu riêng.

### 16.1 Biến thể cần kiểm theo ba quyết định mới

- **AC-P2-17.1–3:** đủ12 sticker và nhãn trợ năng; role matrix thành viên/Khách × người chơi/người xem × Riêng/Chung. Người xem gọi thẳng private bị chặn; Khách gọi DM bị chặn. DM accepted friends nhận sticker/unread đúng như tin, unfriend thu hồi quyền. Một sticker là một tin, trộn text+sticker không vượt rate; request sticker có shortcode ngoài allowlist bị từ chối, không nhận HTML/SVG tùy ý hoặc thực thi markup người dùng.
- **AC-06.3.5/cooldown:** decline tạiT, expiry tạiE, kiểm trước/đúng/sauT+10/E+10; worker dọn muộn không kéo hạn. Nhiều tab/người nhận của cùng Host–phòng dùng chung; Host mới và Host cũ trở lại theo cặp đúng. Không cooldown vì gửi lỗi/offer đóng do ghế đổi. Response/receipt cũ không chấp nhận offer mới.
- **AC-06.3.5/khung:** khung30giây với hai nút và countdown từ server; Esc không thay trạng thái lời mời. Không modal/focus trap, không che bàn. Hết hạn/mất quyền/ghế bị lấy không tự promote; giữ người xem, thông báo rõ và cập nhật pending/cooldown chính thức.

**Lượt hiện tại:** chỉ tài liệu/đối chiếu nguồn, không sửa code/migration/runtime/cờ, không Jira/MCP dịch vụ. **Test local: không chạy (không được yêu cầu).** Chưa xem giao diện hoặc kiểm media/thiết bị thật; chưa commit/push tài liệu YC6.

## 17. Quyết định PO khi rà soát YC6 — 31/10/2026

**Đã triển khai trên `develop` (01/11/2026)**, xem mục 18 cho bằng chứng và giới hạn. Bổ sung hoặc sửa mục 2, 3, 7, 8, 12.

| # | Quyết định | AC bổ sung |
|---|---|---|
| 1 | **Mời rời ghế:** Host có nút **Mời rời ghế** để gỡ người chơi thứ hai về Sảnh khi phòng `WAITING`, đủ hai người, không đang đếm. Có hộp xác nhận. Người bị gỡ **không bị chặn** (khác Kick) và vào lại được nếu phòng chưa `LOCKED`. Không dùng được khi đang ván, một mình, hoặc nhắm chính Host; người chơi thứ hai và người xem không có nút | AC-YC6-RV-01, 02 |
| 2 | **Danh sách tên người xem hiển thị cho mọi người trong phòng** (kèm “(Khách)”); chỉ hai người chơi có nút Kick | AC-YC6-RV-03 |
| 3 | **Xin ngồi ghế:** người xem gửi yêu cầu để Host **Đồng ý/Từ chối**. Hạn **30 giây**; bị từ chối hoặc hết hạn thì chờ **10 giây** mới xin lại (theo từng người xem). **Nhiều yêu cầu cùng lúc** (tối đa 5, mỗi người xem một). Host Đồng ý thì người xin **ngồi vào ghế ngay** (không cần xác nhận lần hai); các yêu cầu còn lại tự đóng với thông báo “Ghế đã có người” | AC-YC6-RV-04…07 |
| 4 | **Bộ lọc Sảnh:** hai nút lọc **Đang chờ** và **Còn chỗ xem**, tắt mặc định; không đổi thứ tự (mới nhất lên đầu) | AC-YC6-RV-08 |

### 17.1 Xin ngồi ghế — quy tắc chi tiết

- Điều kiện để người xem thấy nút **Xin ngồi ghế** hoạt động: phòng `WAITING`, còn ghế trống, không đang đếm, người xem không giữ vị trí chơi khác (kể cả AI), hết cooldown 10 giây. Không đủ điều kiện thì `DISABLED` kèm lý do (ví dụ *“Ghế đã đủ người”*, *“Đang trong ván”*, *“Chờ 7 giây để xin lại”*), không biến mất. Khi đang ván không có Xin ngồi (không đổi vai trong `ACTIVE`).
- Yêu cầu chỉ hiện cho **Host** (trong panel Người xem, mỗi yêu cầu một hàng có tên, đếm ngược, **Đồng ý / Từ chối**, không modal, không X/Esc riêng, không trap focus). Người chơi thứ hai không quyết định.
- Mỗi người xem tối đa một yêu cầu đang chờ; gửi lặp không tạo bản sao hay gia hạn.
- Host Đồng ý: máy chủ kiểm lại dưới khóa phòng — yêu cầu còn hạn, người xin vẫn là người xem trong phòng, ghế còn trống, phòng `WAITING` không đếm, người xin không giữ vị trí khác (kể cả AI) — rồi chuyển người xin thành người chơi ở phe còn trống, giải phóng chỗ xem, reset Sẵn sàng của đối thủ (YC2 mục 21.1) và đóng mọi yêu cầu và lời mời ghế còn lại. Không đủ điều kiện: báo lỗi nghiệp vụ rõ ràng, giữ vai trò xem.
- Host Từ chối: chỉ đóng yêu cầu đó, người xin chờ 10 giây. Hết hạn 30 giây tính như Từ chối nhưng không báo “bị từ chối”.
- **Cùng tồn tại với lời mời xuống ghế của Host** (mục 8): lời mời vẫn một pending/phòng; hai loại có thể cùng chờ, ai vào ghế trước thì các đề nghị còn lại tự đóng. Cooldown 10 giây của lời mời (theo Host–phòng) và của Xin ngồi (theo người xem) độc lập.
- Server là nguồn sự thật cho hạn và cooldown; reload, nhiều tab không làm mới hạn hay tạo thêm yêu cầu.

### 17.2 Mời rời ghế — quy tắc chi tiết

- Chỉ Host; nhắm người chơi thứ hai. Xác nhận nêu rõ tên và *“Người này vẫn có thể vào lại phòng nếu phòng chưa bị khóa.”* Hủy không gửi lệnh.
- Thành công: người bị gỡ mất ghế, Kênh Riêng và quyền phát media, được đưa về Sảnh kèm thông báo *“Chủ phòng đã mời bạn rời ghế”*; Sẵn sàng đã reset; đề nghị đổi bên và lời mời ghế đang chờ bị đóng; Host trở lại trạng thái ngồi một mình (có Đổi ghế).
- Không ghi block (khác Kick, mục 9). Nếu muốn ngăn vào lại thì khóa phòng (`LOCKED`). Không có cooldown riêng.
- Không áp dụng khi ván `ACTIVE`, khi đang đếm, hoặc khi phòng chỉ có một người ngồi ghế; Host không tự gỡ chính mình.

### 17.3 Tiêu chí bổ sung

| Mã | Given / When | Then bắt buộc |
|---|---|---|
| AC-YC6-RV-01 | Phòng `WAITING` đủ hai người, Host bấm Mời rời ghế và xác nhận | Người chơi thứ hai về Sảnh với thông báo, ghế trống, không bị block, vào lại được khi chưa `LOCKED`; chat riêng và media bị thu hồi thật |
| AC-YC6-RV-02 | Đang đếm, đang ván, một mình, người chơi thứ hai hoặc người xem gọi lệnh | Không có nút hoặc `DISABLED`; gọi trực tiếp bị từ chối; không đổi phòng |
| AC-YC6-RV-03 | Phòng có người xem | Mọi người trong phòng (người chơi và người xem) thấy danh sách tên người xem; chỉ hai người chơi thấy Kick; người xem không thể gọi Kick |
| AC-YC6-RV-04 | Người xem đủ điều kiện bấm Xin ngồi ghế | Host thấy yêu cầu với đếm ngược 30 giây; người xin thấy “Đang chờ chủ phòng”; hết hạn thì tự đóng, chờ 10 giây mới xin lại |
| AC-YC6-RV-05 | Ba người xem cùng xin; Host Đồng ý một người | Người đó ngồi ghế ngay; hai yêu cầu còn lại tự đóng với *“Ghế đã có người”*; không ai có hai vai trò; Sẵn sàng của đối thủ reset |
| AC-YC6-RV-06 | Host Đồng ý nhưng người xin vừa rời phòng, hoặc đang giữ vị trí AI, hoặc ghế vừa đầy | Báo lỗi nghiệp vụ, không đổi vai, không lỗi SQL chung chung |
| AC-YC6-RV-07 | Xin ngồi khi đang ván, ghế đầy, cooldown, đã có vị trí khác; gọi API trực tiếp | Nút `DISABLED` có lý do; API từ chối; người chơi và người ngoài không gửi được |
| AC-YC6-RV-08 | Sảnh bật lọc Đang chờ và/hoặc Còn chỗ xem | Chỉ hiện phòng khớp, giữ thứ tự mới nhất; bỏ lọc trả lại danh sách; cập nhật vẫn trong 2 giây; trạng thái rỗng khi không phòng khớp có giải thích |

**PO xác nhận 31/10/2026:** (a) Mời rời ghế không có cooldown (Host có thể khóa phòng để chặn vào lại); (b) bộ lọc Sảnh áp lên 50 phòng mới nhất ở phía client, không truy vấn thêm phòng ngoài 50; (c) Xin ngồi ghế và lời mời của Host có thể cùng chờ trong một phòng.

### 17.4 Tác động triển khai (đã làm, xem mục 18)

- Hai lệnh phòng mới (Mời rời ghế, Xin ngồi ghế/Trả lời yêu cầu) trong `RoomStore` đúng lớp (`RoomViewerStore`), qua `withRoom`, có `commandId`; hợp đồng `realtime.ts`, `SpectatorsPanel`, `RoomPage`, `RoomLobby`/bộ lọc Sảnh.
- Cần bảng/cột lưu yêu cầu Xin ngồi (người xin, hạn, cooldown) — có thể cần migration kèm rollback.
- Panel Người xem: danh sách tên cho mọi vai trò, hàng yêu cầu cho Host.
- Bằng chứng ở mục 14 là trước các thay đổi này; không kế thừa PASS.

## 18. Triển khai và bằng chứng (01/11/2026)

### 18.1 Đã làm

- **Lời mời xuống ghế (AC-06.3.5, BA 0.24):** `respondDown` gắn `offerId`; hồi đáp cho lời mời cũ bị từ chối, không chạm lời mời mới. Hết hạn tính bằng giờ DB sau khi khóa; trả lời muộn đóng `EXPIRED` và giữ vai trò xem. Kiểm vị trí khác (kể cả AI) trước khi đổi vai, trả `ALREADY_SEATED` thay vì lỗi SQL. Cooldown 10 giây theo cặp `(Host, phòng)`, mốc là phản hồi của server (Từ chối) hoặc hạn gốc (hết hạn); đóng do ghế/phòng đổi không tính. UI có đếm ngược, ẩn khi hết hạn, nút Mời khóa kèm lý do.
- **Xin ngồi ghế (AC-YC6-RV-04…07):** bảng `seat_requests` (migration `20261103000008`, có rollback), tối đa một yêu cầu đang chờ mỗi người xem, 30 giây, cooldown 10 giây theo người xin. Host Đồng ý thì người xin ngồi ngay sau khi kiểm lại dưới khóa (còn hạn, vẫn là người xem, ghế trống, WAITING không đếm ngược, không giữ vị trí khác); các yêu cầu và lời mời còn lại tự đóng không tính cooldown. Mỗi người chỉ thấy yêu cầu của mình, Host thấy tất cả.
- **Mời rời ghế (AC-YC6-RV-01, 02):** `inviteLeave`, không ghi block, thu hồi media qua outbox, người bị gỡ nhận “Chủ phòng đã mời bạn rời ghế” và về Sảnh.
- **Danh sách tên người xem (AC-YC6-RV-03):** mọi vai thấy tên và nhãn Khách; Đuổi chỉ hiện cho người chơi. Người bị Đuổi nhận thông báo riêng và về Sảnh; vào lại bị `ROOM_BLOCKED`.
- **Bộ lọc Sảnh (AC-YC6-RV-08):** Đang chờ và Còn chỗ xem, lọc phía client trên ≤50 phòng, giữ thứ tự, có trạng thái rỗng giải thích.

### 18.2 Kiểm đã chạy (Node 22, Postgres 17 cô lập, môi trường local)

- Server toàn bộ: 182 file / 1.946 test đạt. Mới: `room-seat-requests.test.ts` (13 ca trên SQL thật: quyền thấy yêu cầu, ngồi ngay và đóng yêu cầu khác, cooldown trước/sau mốc, hạn gốc khi worker trễ, vị trí AI/đã rời, Mời rời ghế không block, cooldown lời mời, `offerId` cũ, cờ Khách) và `game.runtime.seats.test.ts` (HTTP + Socket.IO + worker: xin ngồi, Host duyệt, snapshot, Đuổi và Mời rời ghế gửi đúng thông báo, vào lại).
- Web + packages: 116 file / 1.316 test đạt (RoomPage, SpectatorsPanel, Lobby, client HTTP). Typecheck, ESLint toàn repo và Prettier đạt.

### 18.3 Chưa kiểm / giới hạn

- Chưa xem giao diện ở trình duyệt thật (desktop 1366×768, mobile 360 px, sáng/tối), chưa kiểm bàn phím/trợ năng ngoài test React.
- Chưa đo ≤2 giây của feed Sảnh sau lọc qua mạng thật, chưa thử media LiveKit thật (chỉ xác nhận sự kiện thu hồi vào outbox); GATE-MEDIA, thiết bị/mạng thật và Supabase Cloud chưa chạy.
- Migration `20261103000008` chưa áp lên Supabase Cloud; server mới có nhánh bỏ qua bảng thiếu (Xin ngồi báo chưa sẵn sàng; chưa chạy thử trên schema cũ) nhưng web mới gọi `respond-down` kèm `offerId`, nên triển khai server trước web.
- `room.removed` bỏ qua người đã vào lại trước khi sự kiện tới; người đang offline lúc bị Đuổi/Mời rời ghế chỉ thấy phòng không còn khả dụng khi nối lại.
- Không đổi quyết định BA; không đánh dấu Jira Done hay PO nghiệm thu.
