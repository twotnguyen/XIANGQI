# P1 · YC7 — Chat, camera và mic

> **BA 0.27 — PO chốt 31/10/2026:** toàn bộ nội dung từng thuộc P2 (Ranked/Elo/bảng xếp hạng, ghép ngẫu nhiên Casual, Xin đi lại/Tái đấu Casual, phần Ranked của lịch sử/thống kê) nay thuộc **P1**. Mọi câu "vẫn P2 / giữ P2 / làm sau / Sắp ra mắt" còn lại trong tài liệu này là lịch sử và bị thay bởi [BA mục 0.27](BA-SCOPE-DECISIONS.md#027-đưa-toàn-bộ-phần-còn-lại-của-p2-lên-p1--po-chốt-31102026); QR vẫn bị loại. Chưa tái ước lượng giờ/Jira; chưa phải bằng chứng triển khai.

**Rà soát 31/10/2026:** PO chốt bốn điểm tại mục 17 (link chỉ là văn bản, kết nối LiveKit theo nhu cầu, video tự điều chỉnh không đặt trần, dấu báo tin chưa xem); **chưa triển khai**.

**Ngày lập/chốt:** 31/10/2026. **Phạm vi:** EP-07, US-07.1–07.2 và giao điểm các Story đã chuyển P1. **Trạng thái:** tám quyết định PO đã chốt tại mục15/BA0.25; đã đối chiếu nguồn/code, chưa triển khai hoặc nghiệm thu lại phần mềm.

## 1. Mục tiêu và nguồn ưu tiên

Người trong phòng trò chuyện đúng vai trò; hai người chơi tự quyết định phát camera/mic và ai được nhận. Đổi ghế, thay đối thủ, đổi tab, rời/kick phải thu hồi quyền thật. Media là phụ trợ, không được quyết định thắng/thua hoặc chặn đồng hồ/chat.

Nguồn theo thứ tự:

1. [BA-SCOPE-DECISIONS](BA-SCOPE-DECISIONS.md), Phần0 thắng: 0.3,0.7,0.13–0.16,0.20–0.25; tiếp đến1.8,4.1–4.3,5.1–5.5,10.1.
2. [BACKLOG-P1](BACKLOG-P1.md), EP-07: **27 AC baseline**, gồm14 AC chat và13 AC media. Số14 ở bảng Epic là Story Points, không phải số AC.
3. [BACKLOG-P2](BACKLOG-P2.md): giữ ID nguồn/Jira của các phần đã chuyển; nhãn US-P2 không tự có nghĩa còn P2.
4. [YC1](P1-YC1-TAI-KHOAN-VA-XAC-THUC.md) cho phiên/thiết bị; [YC3](P1-YC3-MOI-VAO-PHONG.md) cho bạn bè/DM; [YC5](P1-YC5-VAN-ONLINE-VA-SU-CO.md) cho ván/sự cố; [YC6](P1-YC6-PHONG-VA-NGUOI-XEM.md) cho vai trò/kick/khóa.
5. [DESIGN §6.9, §8](../design/DESIGN.md), [danh mục panel](../design/DANH-MUC-MAN-HINH-XIANGQI.md), [hợp đồng phòng](../engineering/server/room.md) và [realtime](../engineering/server/realtime.md). Code/mockup không thay quyết định BA.

## 2. Phạm vi và phân kỳ hiện hành

| Hạng mục | Phạm vi P1 | Ranh giới |
|---|---|---|
| Chat phòng | Riêng hai ghế, Chung toàn phòng; WAITING và đang đấu | Không lưu sau CLOSED, không biến thành lịch sử DM |
| Bộ lọc | Server che từ cấm, giới hạn200 ký tự và5 tin/10giây/người | Không tự thêm report, moderator, ban hoặc chặn cá nhân |
| Sticker | Đủ12, cả thành viên/Khách theo vai trò — BA0.24 | Không cấp private cho người xem; sticker không phải lệnh ván |
| Camera/mic | Tắt mặc định, hai nút độc lập, ba mức chia sẻ custom | Người xem tuyệt đối không phát; không ghi/lưu media |
| DM/unread | Accepted friends, lịch sử bền, đọc/badge đồng bộ — BA0.20 | Không DM Khách/người lạ; không xóa DM theo vòng đời phòng |
| Chuyển media giữa tab | Chuyển/Hủy có chủ ý — BA0.21 | Không tự giành quyền khi reconnect, không vượt luật thiết bị khác |
| Casual/Ranked | **P1 theo BA 0.27**, đặc tả ở [YC9](P1-YC9-GHEP-TRAN-CASUAL-RANKED.md) mục 4–5 | Chỉ Kênh Riêng giữa hai người; Ranked mặc định ẨN hình/tiếng đối thủ ở phía người nhận (BA 5.4); không mang policy Ranked áp mặc định cho custom |

Không thêm upload ảnh/file, voice message, gọi riêng ngoài phòng, chia sẻ màn hình, tìm kiếm/xóa/sửa/thu hồi tin hoặc read receipt chat phòng khi chưa có yêu cầu. Không đưa QR trở lại.

## 3. Thuật ngữ và ma trận quyền

**Kênh Riêng** là chat hai người đang ngồi ghế trong cùng phòng (`PLAYERS_PRIVATE`), không phải DM. **Kênh Chung** là chat cho người trong phòng (`ROOM_PUBLIC`). **DM** là hội thoại hai thành viên accepted friends, độc lập room/match.

| Hành động | Host/người chơi còn lại | Người xem | Người ngoài/bị kick | Tab người chơi mất điều khiển |
|---|---|---|---|---|
| Đọc Riêng | Chỉ mốc cặp hiện hành | Không | Không | Theo quyền đọc hiện hành, không mở lịch sử cặp cũ |
| Gửi Riêng | Có, theo phiên/quyền tab | Không | Không | Không vượt trạng thái chỉ đọc |
| Đọc/gửi Chung | Có | Có từ mốc vào | Không | Gửi phải tuân thủ quyền chỉ đọc |
| Sticker phòng | Như chat tương ứng | Chỉ Chung | Không | Không dùng sticker lách quyền gửi |
| Phát camera/mic | Có khi đúng controller và chủ động bật | Không | Không | Không; track cũ phải dừng |
| Nhận media | Theo mức chia sẻ của từng người phát | Chỉ khi người phát chọn cả người xem | Không | Không suy quyền phát từ quyền nhận |
| DM | Chỉ thành viên accepted friends | Vai trò phòng không quyết định DM | Quan hệ bạn bè quyết định DM | Không tự suy quyền DM từ controller của phòng |

Khách có chat/sticker/media phòng theo vai trò như thành viên. Khách không DM. Host không có quyền đọc thêm chat riêng của cặp khác, cưỡng ép bật mic/camera hoặc đổi mức chia sẻ của đối thủ.

## 4. Vòng đời và lịch sử chat phòng

### 4.1 Mốc cặp người chơi

- Quyền Riêng gắn danh tính hai người, không gắn Đỏ/Đen hoặc Match ID.
- Cùng cặp đổi bên, Ready/chơi tiếp, Tái đấu custom: giữ chat riêng; không tạo hội thoại rỗng chỉ vì sang ván mới.
- A–B thành A–C: cả A và C chỉ đọc tin của mốc A–C; C không nhận lịch sử A–B qua HTTP/socket/cache. B xuống xem mất quyền Riêng ngay.
- Không tự khôi phục chat mốc A–B cũ nếu thành phần ghế đã thay rồi quay lại. Mốc cặp mới phải được kiểm bằng trạng thái authoritative.
- Chuyển vai trò phải xóa phần dữ liệu Riêng không còn quyền khỏi UI/cache đang hiển thị, không chỉ ẩn tab. Không thể thu hồi những gì người dùng đã đọc/chụp trước đó; không tuyên bố bảo mật tuyệt đối phía thiết bị.

### 4.2 Mốc Kênh Chung

- Người xem mới chỉ thấy tin từ khi mình vào, không nhận lịch sử trước đó qua phân trang/snapshot/reconnect giả.
- Người chơi đọc/gửi Chung; UI luôn giải thích người chơi cũng đọc được kênh này. Không gọi đây là kênh riêng của người xem.
- Ẩn panel hoặc đổi tab chat không thay đổi quyền, không phải rời phòng.
- Reconnect trong5phút giữ chỗ và còn quyền giữ mốc vào, được đọc bù tin lúc offline; chủ động rời/quá grace vào lại đặt mốc mới theo BA0.25. Kick/đóng/phiên mất quyền không được lách bằng giữ floor cũ.
- PLAYER↔SPECTATOR giữ nguyên mốc Chung của lần ở phòng: lên ghế không mở lịch sử trước lúc vào, xuống xem không đặt lại floor làm mất tin đã có quyền đọc. Riêng vẫn theo mốc cặp và vai trò, không dùng mốc Chung để cấp quyền Riêng.

### 4.3 Phòng chờ, kết thúc và đóng

- WAITING → countdown → ACTIVE → WAITING không xóa chat; cùng cặp giữ Riêng, Chung giữ theo quyền/mốc người đọc.
- CLOSED xóa toàn bộ chat phòng; những đường lịch sử/phân trang/biên lai không được làm lộ lại nội dung đã mất quyền hoặc đã đóng.
- DM không bị xóa khi phòng đóng. Replay/FEN/PGN không có chat hoặc media kèm theo.
- Tin gửi đua với rời/đổi vai/kick/đóng phòng phải được kiểm lại trong transaction; request trước đó không giữ quyền vô thời hạn.

## 5. Gửi, nhận và đồng bộ

1. Người gửi thấy rõ tên kênh; nhập văn bản hoặc chọn sticker, client kiểm cơ bản và khóa thao tác gửi lặp cùng ý định.
2. Server xác thực phiên/danh tính/vai trò/controller khi có yêu cầu; không tin userId/role/channel từ client để cấp quyền.
3. Kiểm nội dung, giới hạn, mốc hội thoại và idempotency; lưu nội dung đã lọc trước khi phát.
4. Ghi và biên lai phải nhất quán; retry cùng ý định không tạo tin mới hoặc ăn quota lần hai. Không bỏ xác thực hiện tại chỉ vì đã có receipt.
5. Chỉ phát cho người vẫn có quyền; client khử trùng theo ID và không ghi đè projection mới bằng response cũ.
6. Timeout không đồng nghĩa chưa ghi: UI có Đang gửi/Đã gửi/Gửi lỗi và Thử lại; không tự đổi command ID để gửi nhân đôi.
7. Reconnect lấy trạng thái mới theo quyền; không phát lại tự động mọi draft hoặc tin lỗi vào một kênh/cặp đã đổi.

Không thêm SLA chat bằng số chưa được BA duyệt. Ngưỡng nước đi <100ms không tự là số đo đã đạt của chat/media.

## 6. Nội dung, lọc và chống spam

- Văn bản thuần; HTML/script, Display Name, tên phòng đều không được thực thi. Không dùng HTML từ người gửi làm nội dung render.
- Mỗi tin tối đa200 Unicode code point theo cách đếm hiện có `Array.from(content).length`, kiểm cả client/server; emoji ghép/dấu tổ hợp có thể tính nhiều đơn vị. Không đổi sang UTF-16 `.length` hoặc số ký tự nhìn thấy riêng ở một đầu; không cắt âm thầm.
- Tin rỗng không phải tin hợp lệ; không dùng trim/chuẩn hóa so khớp để làm biến dạng toàn bộ nội dung hiển thị.
- Từ cấm Việt/Anh: chuẩn hóa so khớp bỏ dấu/hoa thường/khoảng trắng/ký tự chen, các thay thế phổ biến0→o,1→i; chỉ đoạn bị cấm được che `***`, không lộ nguyên bản qua response/log/event/preview.
- Client có thể che trước để phản hồi nhanh; **server là nguồn quyết định**, không chỉ tin client đã lọc.
- Danh sách do nhóm duy trì bằng tệp cấu hình; thay danh sách có hiệu lực sau restart theo AC. Không thêm màn quản trị/DB editor.
- 5 tin được chấp nhận trong10giây; tin thứ6 bị từ chối với “Bạn gửi quá nhanh”. Text/sticker và toàn bộ Riêng/Chung/mọi DM dùng chung quota người gửi theo BA0.25; gửi lỗi không tính thành công, retry không tăng hai lần.
- Không reset hạn bằng tab/socket hoặc đổi kênh để lách policy đã chốt; xử lý đồng thời ở server. Request trùng không tính thành hai tin thành công.
- Không log nội dung chat nguyên bản/đã lọc, token hoặc khóa. Evidence test dùng dữ liệu thử, không sao chép hội thoại thật vào báo cáo.

## 7. Bộ12 sticker P1

| Shortcode | Nhãn người dùng |
|---|---|
| `clap` | Nước cờ hay |
| `heart` | Thả tim |
| `think` | Đang suy nghĩ |
| `sweat` | Toát mồ hôi |
| `cry` | Khóc ròng |
| `tea` | Uống trà |
| `lightning` | Nhanh tay |
| `silent` | Cạn lời |
| `thumbsup` | Đồng ý |
| `handshake` | Giao lưu vui vẻ |
| `flag` | Tâm phục |
| `fire` | Trận đấu kịch tính |

- Một chạm gửi một tin shortcode; dùng SVG đóng gói của ứng dụng, server kiểm allowlist.
- Nội dung shortcode lạ hoặc payload HTML/SVG không trở thành sticker tùy ý. Văn bản chứa dấu hai chấm không được render thành markup không tin cậy.
- `flag` không đầu hàng; `thumbsup`/`handshake` không đồng ý Xin hòa/Undo/Tái đấu. Các lệnh đó có luồng xác nhận riêng.
- Picker có nhãn cho từng nút, dùng bàn phím/chạm, focus rõ; không chỉ dựa màu hoặc hình. Đóng picker không gửi, không che bàn/Đầu hàng.
- Áp dụng Riêng/Chung và DM theo quyền P1; Khách không DM. Giữ3 AC-P2-17.1–3, không tạo Story sticker thứ hai riêng YC7.

## 8. DM và badge — giao điểm YC3

- Chỉ hai thành viên accepted friends đọc/gửi; kiểm HTTP/socket/RLS, không chỉ ẩn nút Nhắn tin.
- Lịch sử bền, không phụ thuộc hai người đang cùng phòng hoặc online. Không giả gửi thành công khi mạng/server lỗi.
- Unfriend thu hồi đọc/gửi ngay, ẩn lịch sử, loại khỏi badge; không xóa lịch sử hoặc reset read state. Refriend hiện lại, chỉ những tin thực sự chưa đọc tính lại.
- Badge là tổng incoming unread từ bạn hiện tại, không tính tin mình gửi; tách chuông lời mời kết bạn.
- Chỉ đánh dấu đọc khi tin nằm trong viewport hội thoại ở tab đang hoạt động. Tải nền, tab ẩn hoặc chỉ mở modal nhưng tin ngoài vùng nhìn không đủ.
- Server lưu và đồng bộ read giữa thiết bị; response đến muộn không làm tin đã đọc trở lại chưa đọc. Không cho người thứ ba cập nhật read hoặc truy lịch sử.
- Cùng filter/length/rate và sticker theo BA; không dùng DM thay Kênh Riêng để cấp quyền chat với người lạ.
- Giữ3 AC-P2-18.1–3 và Task nguồn, không nhân đôi phạm vi/ước lượng vào YC7.

## 9. Media: thiết bị và mức chia sẻ

### 9.1 Trạng thái mặc định và quyền

- Camera **Tắt**, mic **Tắt**, mức chia sẻ **Chỉ đối thủ**. Mức chia sẻ không đồng nghĩa đang phát.
- Hai nút thiết bị độc lập; bật mic không tự bật camera hoặc ngược lại. Chỉ xin quyền phù hợp hành động chủ động.
- Hiện riêng Xin quyền/Đang kết nối/Đang áp dụng/Đã áp dụng/Bị từ chối/Lỗi; không báo đã tắt/phát đúng đối tượng chỉ vì đã sửa state React.
- Không có thiết bị/quyền bị chặn/thiết bị bận: lỗi tiếng Việt có cách xử lý, không lặp popup xin quyền vô hạn; thiết bị còn lại vẫn dùng được nếu hợp lệ.

### 9.2 Ma trận người nhận theo từng người phát

| Mức do người phát chọn | Đối thủ được nhận | Người xem được nhận |
|---|---|---|
| Không chia sẻ | Không | Không |
| Chỉ đối thủ | Có, với thiết bị đang bật | Không |
| Cả đối thủ và người xem | Có, với thiết bị đang bật | Có, với thiết bị đang bật |

- Mỗi người chọn riêng; một mức áp chung camera/mic của chính họ. Không cần đối thủ phê duyệt mức phát, không thay mức của người kia.
- Đổi bật/tắt hoặc mức chia sẻ có hiệu lực tới người nhận trong≤2giây theo AC. Kiểm actual audio/video subscription, không chỉ icon/nhãn/token.
- “Không chia sẻ” dừng capture và phát, camera/mic về Tắt, không giữ preview đang capture. Đổi sang mức khác không tự bật thiết bị, cần thao tác chủ động theo BA0.25.
- Người xem không có nút bật; token `canPublish=false`, `canPublishData=false`. Không chuyển chat ứng dụng sang LiveKit data để mở đường vượt quyền.
- Không có ghi hình/ghi âm/lưu track/egress. Không thể ngăn người nhận tự quay màn hình bên ngoài ứng dụng; thông tin quyền riêng tư không được hứa điều đó.
- Người nhận có nút **Tắt nhận hình/tiếng / Hiện hình/tiếng** tại từng thẻ người phát; mặc định nhận nếu được phép. Áp dụng người chơi và người xem, chỉ tác động tại máy hiện tại, không tắt thiết bị đối thủ/người phát. Hiện lại không vượt quyền chia sẻ hiện hành; không tự bật nhận lại chỉ vì provider reconnect.

## 10. Media qua vòng đời phòng và phiên

| Chuyển trạng thái | Hành vi bắt buộc |
|---|---|
| WAITING → ván mới | Luồng đang hợp lệ không ngắt chỉ vì Ready/countdown/Match ID mới |
| Hết ván → WAITING, cùng cặp | Vẫn theo quyền phòng hiện tại, không bật thiết bị vốn tắt |
| Đổi phe cùng cặp | Không đổi người được nhận hoặc reset tùy ý mức chia sẻ |
| PLAYER → SPECTATOR | Dừng track/thu hồi phát; chỉ nhận phần được chia sẻ với người xem, không còn Riêng |
| SPECTATOR → PLAYER | Cấp quyền theo vai trò/controller mới; không tự mở camera/mic vì lên ghế |
| Thay đối thủ | Tắt camera/mic người còn lại và thu hồi quyền cũ, cần chủ động bật lại cho người mới theo BA0.25; cùng cặp đổi phe/Tái đấu không bị tắt |
| Khóa phòng | Người hiện có vẫn giữ quyền nhận/phát theo vai trò, không revoke chỉ vì LOCKED |
| Kick/rời/đóng/phiên mất quyền | Thu hồi quyền tương ứng thực tế; không chỉ đóng panel hoặc loại khỏi DB |
| Mất media riêng | Báo lỗi riêng, ván/clock/chat hoạt động; không tạo DISCONNECT ván chỉ vì LiveKit lỗi |
| Mất Socket.IO/phiên | Tab nhận biết mất Socket.IO phòng phải dừng capture/phát và ngắt nhận media dù LiveKit còn nối. Nối lại xác thực quyền mới; chỉ tự nhận nguồn chưa Tắt nhận, không tự bật camera/mic. Phiên mất quyền vẫn theo YC1/YC5 |
| Đổi panel Ván/Chat/Camera | Giữ media đang bật, chỉ thay bố cục; luôn có chỉ báo đang phát và đường tắt thiết bị |
| Browser báo trang bị ẩn | Dừng capture/phát, hai nút Tắt; quay lại cần chủ động bật. Không nhầm với ẩn panel trong ứng dụng, không tự đổi trạng thái ghế/ván |

### 10.1 Chuyển giữa tab

- Tiếp quản thông thường: tab cũ chỉ đọc và dừng media, tab mới mặc định Tắt, chủ động bật lại.
- Tab thứ hai cùng thiết bị chủ động bật khi tranh media: mở `MODAL-MEDIA-TAB-SWITCH`, hai hành động **Chuyển thiết bị sang tab này / Hủy bỏ**.
- Chuyển phải thu hồi phát/dừng track cũ trước khi phát hợp lệ ở tab mới; không có hai controller cùng phát do race/retry.
- Hủy không tiếp quản hoặc xin thiết bị ngoài ý muốn. Tab cũ reconnect không tự giành lại; không vòng lặp bật/tắt qua lại.
- Không dùng chuyển tab để né quy tắc đăng nhập thiết bị khác đang ván bị xử thua. Giữ3 AC-P2-24.1–3.

### 10.2 Media reconnect và revoke

- Token hợp lệ không thay quyền hiện hành; API cấp lại phải đọc vai trò/phiên/controller mới nhất.
- Quyền subscribe/publish cần enforce ở server/provider; chỉ hide video/mute phía client không bảo vệ nội dung.
- Revoke-user/revoke-room là tác dụng phụ sau commit, có retry bền; lỗi LiveKit không rollback ván đã commit hoặc chặn worker clock/chat.
- Theo hợp đồng engineering hiện có, revoke và cấp token cùng người–phòng được tuần tự hóa; sự kiện cũ không được kick nhầm token mới.
- Token hết hạn không đồng nghĩa participant đang kết nối đã tự bị ngắt. TTL token cũ và khả năng tái vào provider trong TTL phải được đo/ghi rõ; không tuyên bố DB block đã lập tức vô hiệu mọi JWT.
- Không tự đổi hạ tầng hoặc thêm dịch vụ vì có gap. Khi không kiểm được provider thật, ghi BLOCKED cho quyền thu hồi/độ trễ, không PASS từ mock.

## 11. Hạ tầng và xử lý lỗi

- Dev/demo LAN: LiveKit tự chạy Docker; web HTTPS khi truy cập từ máy khác. `localhost` không đại diện HTTPS hợp lệ trên điện thoại trong LAN.
- Internet/dự phòng: LiveKit Cloud theo BA0.16; hạn mức ghi trong BA là giả định kế hoạch, cần kiểm tại lúc vận hành, không phải số phút còn lại đã đo hôm nay.
- Không chạy LiveKit trên Render; app đổi môi trường bằng cấu hình URL/key/secret, khóa chỉ ở server.
- Không hứa failover tự động self-host→Cloud: chưa là yêu cầu. Chuyển cấu hình có hướng dẫn và kiểm lại phòng/quyền thực.
- Lỗi quyền, autoplay audio bị browser chặn, mất thiết bị, mạng, token, provider/quota phân biệt được bằng thông báo và hành động phù hợp. Không tự gọi tất cả là “Bạn bị mất mạng”.
- Thông báo chung khi dịch vụ không dùng được: “Camera/mic tạm thời không dùng được”; chat và ván vẫn tiếp tục.
- Không nuốt lỗi rồi hiển thị đang phát thành công; lỗi media không tự đầu hàng/đóng phòng/giải phóng ghế.

## 12. Giao diện gọn, đồng bộ và trợ năng

Đây là yêu cầu thiết kế, không phải ảnh giao diện đã xem.

- Desktop: giữ bố cục hiện hành media/người chơi/clock bên trái, bàn giữa, chat/người xem bên phải. Camera không che bàn; mặc định một Kênh Riêng, mở thêm Chung khi cần.
- Nhãn rõ “Kênh riêng người chơi” và “Kênh chung”; Chung có chú thích người chơi cũng đọc/gửi được. Tin người chơi có nhãn Đỏ/Đen; tên/nhãn Khách là text thuần.
- Mobile: tab Ván/Chat/Camera, trong Chat có Riêng/Chung theo vai trò; không xếp hai lịch sử dài nối nhau làm cả trang cuộn. Clock/lượt/hành động ván vẫn truy cập được.
- Panel chat có vùng lịch sử cuộn nội bộ, composer không bị đẩy mất; khi đang đọc tin cũ không tự giật xuống vì tin mới. Khi cần có đường tới tin mới, không đổi thành read receipt phòng ngoài yêu cầu.
- Draft/Thử lại luôn gắn đúng hội thoại/kênh; không gửi draft Riêng sang Chung sau khi mất quyền. Không ép draft dài vượt200 ký tự bằng cắt âm thầm.
- Media card gọn có tên, camera/mic đang bật và đối tượng nhận. Các nút có nhãn hành động, không chỉ màu/icon; trạng thái xin quyền/áp dụng rõ ràng.
- Tái dùng token/component của dự án; kiểm Kỳ Đài Cổ Phong/Giấy Sáng/Theo hệ thống theo quyền. Không tự đổi typography/palette YC7.
- 360px không cuộn ngang; 1366×768 ưu tiên đủ bàn/clock/nút chính; màn thấp, zoom và bàn phím ảo cho phép cuộn dọc thay vì cắt nội dung hoặc khóa body làm mất nút gửi.
- Tab/Enter/Space, focus-visible, nhãn thiết bị/sticker, modal Chuyển/Hủy có focus trả về đúng chỗ. Không đọc lại toàn bộ history bằng screen reader sau mỗi tin, không giành focus khi có tin đến.
- Trạng thái Loading/Empty/Error/Disabled có giải thích và đường khôi phục; không nhầm chưa tải/lỗi thành “Chưa có tin nhắn”.

## 13. Truy vết baseline và kế hoạch kiểm chứng

Bảng dưới là tiêu chí cần chạy, **không phải PASS**.

| AC | Điều phải chứng minh / biến thể |
|---|---|
| AC-07.1.1 | Desktop mặc định Riêng, mở đồng thời Chung, ẩn/mở không đổi quyền |
| AC-07.1.2 | Mobile một khung/tab, mặc định Riêng, bàn phím ảo không làm mất composer |
| AC-07.1.3 | Người xem chỉ Chung; API/socket/history Riêng trực tiếp bị từ chối |
| AC-07.1.4 | A–B→A–C: cả cặp mới không thấy tin cũ, B không đọc thêm Riêng |
| AC-07.1.5 | Viewer mới không nhận tin trước mốc vào; kiểm phân trang/event trễ |
| AC-07.1.6 | Cùng cặp đổi bên/ván tiếp/Tái đấu custom giữ tin riêng, không phụ thuộc màu |
| AC-07.1.7 | CLOSED xóa chat phòng; không xóa DM và không replay receipt lộ tin |
| AC-07.1.8 | Payload HTML/script được hiển thị text, không XSS qua tên/nội dung |
| AC-07.1.9 | Server che `***` trước lưu/phát, không lộ nguyên bản trong response/log |
| AC-07.1.10 | Từ Việt có/không dấu, hoa/thường, ký tự chen/0/1; thêm từ lành tránh lọc quá mức |
| AC-07.1.11 | Biên199/200/201, Unicode theo hợp đồng thống nhất, client và directAPI |
| AC-07.1.12 | Tin1–5 nhận,6 bị chặn, sát biên10giây, nhiều tab/trộn sticker/retry |
| AC-07.1.13 | Đổi tệp từ cấm/restart có hiệu lực, không cần ghi DB |
| AC-07.1.14 | WAITING chat đúng vai trò, chuyển vào/ra ván không mất tin |
| AC-07.2.1 | Vào phòng mới cả camera/mic Tắt, mức Chỉ đối thủ không tự phát |
| AC-07.2.2 | Bật/tắt từng thiết bị độc lập, actual receiver thay đổi≤2giây |
| AC-07.2.3 | Denied/không có/bận thiết bị: lỗi Việt và cách xử lý, ván vẫn đi được |
| AC-07.2.4 | Tiếp quản tab dừng track cũ, tab mới Tắt, không tự giành lại |
| AC-07.2.5 | Cấu hình không record/egress/lưu media, không chỉ không có nút ghi |
| AC-07.2.6 | Rời/xuống xem/kick thu hồi quyền phát/nhận thật, kiểm token cũ |
| AC-07.2.7 | Ba mức đúng nhãn/default, áp chung hai thiết bị nhưng hai nút độc lập |
| AC-07.2.8 | Cả đối thủ và người xem nhận khi người phát chủ động chọn mức tương ứng |
| AC-07.2.9 | Chỉ đối thủ không lọt người xem; Không chia sẻ không ai khác nhận |
| AC-07.2.10 | Người xem không UI phát, token cấm publish/data, gọi thẳng không lách |
| AC-07.2.11 | Đổi mức khi đang phát≤2giây; đo cả audio/video và giảm quyền |
| AC-07.2.12 | WAITING có media, bắt đầu ván không ngắt luồng hợp lệ |
| AC-07.2.13 | Provider/quota/mạng media lỗi không dừng ván/chat/clock, không xử thua |

Bổ sung theo Story đã lên P1, không nhân bản ID:

| AC nguồn | Ca cần kiểm tại giao điểm YC7 |
|---|---|
| AC-P2-17.1–3 | Đủ12 SVG/shortcode, unknown payload, member/guest × player/viewer × kênh, spam chung text/sticker |
| AC-P2-18.1–3 | DM persisted, quyền hai bạn/RLS, unfriend/refriend race, viewport/background/multi-device unread |
| AC-P2-24.1–3 | Hai tab Chuyển/Hủy, actual track và provider grant, reconnect không giành, controller race |

**GATE-MEDIA:** một phòng2 người chơi+5 người xem trên thiết bị LAN khác nhau, kick một người, thử self-host và Cloud; ghi CPU/RAM, thời gian revoke, phút dùng. Gate thu thập số liệu không có ngưỡng PASS tài nguyên; AC≤2giây bật/tắt/chia sẻ vẫn phải kiểm riêng, không bị bỏ vì gate không đặt ngưỡng CPU.

Tải app50 người/10 ván không tự chứng minh tải media; khoảng3 phòng media chỉ đo và báo số theo NFR. Browser Chrome/Edge/Firefox/Safari, thiết bị mic/camera thật, HTTPS, autoplay và quyền OS cần kiểm thực tế. Fixture/SQL/mock không đủ nghiệm thu đường truyền hoặc quyền nhận thật.

## 14. P2 liên quan: đã lên P1 và phần còn lại

> **Lưu ý (rà chéo 31/10/2026):** mục này là đối chiếu lịch sử trước BA 0.27–0.36. Ghép ngẫu nhiên Casual, Ranked và các phần Casual/Ranked đã **P1** (xem [YC9](P1-YC9-GHEP-TRAN-CASUAL-RANKED.md)); mọi câu "giữ P2", "queue 3 phút", "xác nhận 10 giây" hay "vào ván ngay" bên dưới đã bị thay.

| Story / Jira | Quan hệ YC7 | Hiện hành / đề xuất |
|---|---|---|
| US-P2-17 / XIAN-131 | Trực tiếp:12 sticker trong phòng và DM | **Đã P1 BA0.24**, cả Khách đúng vai trò; không cần xin chuyển lần nữa |
| US-P2-18 / XIAN-132 | Trực tiếp:DM, lịch sử bền, badge/read | **Đã P1 BA0.20**, accepted friends; nghiệm thu giao điểm filter/sticker/quyền |
| US-P2-24 / XIAN-138 | Trực tiếp:chuyển thiết bị giữa tab | **Đã P1 BA0.21**, dừng track/quyền thật, không chỉ modal |
| US-P2-05 / XIAN-119 | Trực tiếp:policy người nhận ẩn media và Tắt ngay trong Ranked | **Story Ranked P1 theo BA 0.27**. BA0.25 tách nút tắt nhận custom sang P1, mặc định nhận nếu được phép; không chuyển mặc định ẨN hoặc cả mode Ranked |
| US-P2-04 / XIAN-118 | Quyền/vòng đời Ranked, không spectator/Kênh Chung | **Giữ P2**; không cần để hoàn thành YC7 custom |
| US-P2-07 / XIAN-121 | Casual chỉ Riêng, không người xem, media hai người | **Giữ P2 theo BA0.23**, không hỏi lại việc kéo cả mode |
| US-P2-09 / XIAN-123 | Tái đấu giữ chat cùng cặp/media theo phòng | Custom đã P1, Casual P2; không reset nhầm conversation vì Match ID mới |
| US-P2-23 / XIAN-137 | Demo mạng cần tách mất media với mất game socket | Đã P1 BA0.23, demo-only; không thêm công cụ điều khiển người khác production |
| US-P2-25 / XIAN-139 | Theme tác động contrast/chat/picker/media trạng thái | Đã P1 BA0.21; kiểm UI chứ không mở theme mới cho Khách |
| US-P2-11/13/15 / XIAN-125/127/129 | History/Replay/export sau ván | Custom/AI đã P1; **không lưu chat hoặc media theo ván** |

**Kết luận phân kỳ:** sticker, DM và chuyển tab đã P1; PO bổ sung **tắt nhận media custom mặc định hiện** theo BA0.25 với3 AC riêng tại mục15.1. Ranked/Elo/queue và mặc định ẨN của Ranked P1 theo BA 0.27. Đây là chốt đặc tả, chưa là bằng chứng phần mới đã triển khai.

Không có Story P2 sẵn cho report/admin/ban cá nhân, ghi âm, gọi riêng hoặc upload chat. Không trình bày các mục đó như tính năng chỉ cần chuyển phân kỳ.

### 14.1 Đối chiếu code hiện tại — chỉ đọc, chưa tái hiện runtime

| Hạng mục | Bằng chứng code | Kết luận / phần cần chứng minh |
|---|---|---|
| Chat role/history | `apps/server/src/game/chat/chat-store.ts:66–102`, migration `20261011000010_room_chat.sql` | Có PLAYER/pair_epoch và floor người xem; cần thử event trễ, đổi vai và cache client, không coi query đúng là toàn luồng đã PASS |
| Retry và quota phòng | `chat-store.ts:132–209` | Có command fingerprint/receipt, kiểm lại scope và rate theo actor_id dùng chung các phòng/kênh;200 code point. Không phải quota riêng từng kênh |
| Quota DM | `apps/server/src/account/friend/direct-message.store.ts:67–86` | Bảng rate riêng theo sender_id, chung các bạn nhưng tách chat phòng; khác phương án gộp toàn bộ ở Q1. Cần kiểm gửi đồng thời khác peer vì khóa cặp không tự tuần tự hóa quota người gửi |
| Sticker | `apps/web/src/features/chat/RoomChat.tsx`, `apps/server/src/game/chat/chat-store.ts`, DM UI/store | Khảo sát chưa thấy picker/allowlist/render đủ12; BA0.24 mới chốt không đồng nghĩa đã triển khai. Không cần hỏi lại shortcode/SVG vì BA đã quy định |
| Media policy | `apps/server/src/game/media/media.service.ts:173–230` | Có controller/publish guard, spectator stage subscribe-only, người chơi ALL có stage; quyền actual tracks cần provider thật |
| NONE và trạng thái nút | `apps/web/src/features/media/MediaPanel.tsx:299–336` | `canPublish` false khi NONE nhưng thông báo vẫn có thể nói đã bật thiết bị. Cần làm rõ hiển thị/capture theo Q3, chưa kết luận phần cứng đang capture từ nhãn |
| Reconnect/tab | `MediaPanel.tsx:353–378,470–483` | Có reset Tắt/receive-only và Chuyển/Hủy; xác nhận Chuyển hiện vẫn Tắt. Test actual track dừng và thứ tự cấp quyền mới, không suy chỉ từ state |
| Revoke | `media.service.ts:280–336`, hợp đồng `room.md` mục thu hồi | Có RemoveParticipant/DeleteRoom và tuần tự hóa với token; cần đo token cũ/retry/provider outage, không coi JWT hết hạn tự disconnect participant |
| DM/read | `direct-message.store.ts:107–175`, `DirectChatDialog.tsx:95–124` | Có history/watermark tăng và điều kiện visible/focus/viewport; HTTP polling2giây. Không cần PO chọn socket hay polling khi chưa có SLA mới; kiểm quyền revoke/UI thực tế |
| Tests hiện có | `tests/server/game/chat/`, `tests/web/features/chat/`, `tests/server/game/media/`, `tests/web/features/media/`, `tests/server/account/friend/direct-message*.test.ts`, `tests/web/features/friends/DirectChatDialog.test.ts` | Có coverage cấu phần; chưa chạy lại. Không dùng mock SDK/Twirp làm bằng chứng LAN/Cloud/track thật hoặc kết luận toàn bộ AC đã đạt |

Phần mới cần ưu tiên khi triển khai: sticker đúng BA0.24; quyết định quota liên miền; race quota DM nhiều peer; cache/scope sau đổi vai; NONE và thay đối thủ; revoke/track thật. Đây là danh sách cần kiểm/hoàn thiện, không phải các lỗi đã reproduce.

## 15. Năm quyết định PO đã chốt — BA0.25

| Câu hỏi | PO chọn | Hệ quả |
|---|---|---|
| Q1 — Quota chat | **Gộp toàn người gửi** |5 tin/10giây chung Riêng/Chung/mọi DM/phòng/tab, text+sticker; thành công mới tính, retry không tính hai lần; cần bảo đảm đồng thời khác peer |
| Q2 — Viewer reconnect | **Giữ mốc trong ân hạn** | Trong5phút giữ chỗ/còn quyền được đọc bù; rời thật/quá grace đặt mốc mới |
| Q3 — Không chia sẻ | **Tắt thiết bị và ngừng phát** | Dừng capture, hai nút Tắt; đổi mức không tự bật lại |
| Q4 — Thay đối thủ | **Tắt khi thay cặp** | Người còn lại chủ động bật lại cho người mới; cùng cặp đổi phe/chơi tiếp/Tái đấu không ngắt |
| Q5 — Bảo vệ người nhận | **Thêm nút tắt nhận, mặc định hiện** | Người chơi/người xem ngừng nhận tại máy mình, không tác động người phát/người khác; Ranked P1 theo BA 0.27 |

Không còn câu hỏi chờ cho năm mục này. Chi tiết receiver bên dưới là hợp đồng P1 cho phần tách, không thay mặc định ẩn của Ranked.

### 15.1 AC bổ sung cho tắt nhận media custom

| AC mới | Given / When | Then / cách kiểm |
|---|---|---|
| AC-YC7-RX.1 | Người chơi/người xem vào custom, người phát cho phép và đang bật | Mặc định nhận; có nút Tắt nhận hình/tiếng rõ nhãn trên từng thẻ. Người xem không có nút phát; người không được phép không subscribe kể cả gọi trực tiếp |
| AC-YC7-RX.2 | Đang nhận, bấm Tắt nhận tại một thẻ | Dừng hình và tiếng thực tế của nguồn đó tại máy này, không chỉ ẩn video còn audio; không tắt camera/mic người phát hoặc tác động người nhận khác. Provider reconnect không tự bật lại lựa chọn đã tắt |
| AC-YC7-RX.3 | Đã tắt, bấm Hiện hình/tiếng | Chỉ nhận nếu nguồn vẫn cho phép, không tự mở mic/cam người phát. Đổi mức/rời/đổi vai/kick giữa tắt–hiện phải recheck; không hiển thị frame/âm thanh cũ ngoài quyền |

Lựa chọn nhận là cục bộ, không thêm đồng bộ tài khoản như theme. Khi nguồn rời/thay người, không mang trạng thái hoặc track của danh tính cũ sang thẻ người mới. Tắt nhận không rời phòng hoặc thay quyền chat/ghế.

### 15.2 Biến thể hồi quy sau chốt

- Quota: năm tin trộn room/DM/sticker rồi tin thứ6; sát10giây, nhiều tab/peer, hai request đồng thời khi còn một suất; retry/rollback không tăng sai. Không reset quota bằng đổi phòng/socket.
- Viewer: offline trong grace đọc bù đúng floor; quá grace/rời chủ động đặt floor mới; LOCKED vẫn reconnect thành viên còn quyền, kick/closed không đọc.
- NONE: xác nhận track stop và chỉ báo phần cứng, không giữ preview; đổi mức không tự phát. Thay A–B thành A–C tắt A và B mất quyền, C mặc định Tắt; cùng cặp đổi phe/Tái đấu không tắt.
- Receiver: hai người phát×người chơi/người xem×audio/video; tắt một nguồn không tắt nguồn còn lại; reconnect/provider lỗi/quyền bị giảm không làm nội dung bật lại ngoài ý muốn. Kiểm thiết bị/browser thật, không chỉ mock nhãn.

### 15.3 Ba quyết định làm rõ thêm — Q6–Q8

| Câu hỏi | PO chọn | Hệ quả |
|---|---|---|
| Q6 — Đổi vai và lịch sử Chung | **Giữ mốc xuyên suốt lần ở phòng** | Lên/xuống ghế không mở tin trước lúc vào hoặc làm mất tin Chung đang được đọc; Riêng vẫn theo cặp |
| Q7 — Mất Socket.IO nhưng LiveKit còn nối | **Dừng media, nối lại không tự phát** | Dừng capture/phát và nhận tại tab mất kết nối. Nối lại reauthorize; chỉ nhận nguồn chưa Tắt nhận, phát cần bật lại |
| Q8 — Ẩn panel hoặc xuống nền | **Giữ khi đổi panel, tắt khi xuống nền** | Ván/Chat/Camera nội bộ giữ phát và có chỉ báo; browser báo trang hidden thì dừng capture/phát, trở lại không tự bật |

Không còn câu hỏi chờ cho ba mục này. Không mở rộng thành tự đầu hàng khi ẩn trang, tự nhả ghế hoặc thay ân hạn YC5. Q8 chỉ quyết định capture/phát, không tự thêm chính sách ngắt nhận audio nền.

**Tiêu chí hồi quy bổ sung, dùng AC hiện có:**

- AC-07.1.5/14: viewer vào tạiT, có tin trước/sauT; lên ghế rồi xuống xem vẫn chỉ đọc từT. API/socket/phân trang không mở lịch sử cũ. Reconnect trong grace giữT; rời thật/quá grace đặtT mới; đổi vai không giữ quyền Riêng đã mất.
- AC-07.2.1/4/6/13: ngắt riêng Socket.IO, LiveKit còn kết nối; kiểm capture/track/subscription thực đều dừng tại tab đó. Nối lại không phát, quyền nhận đã bị giảm hoặc Tắt nhận không tự hồi phục. Clock/grace/kết quả ván không bị thay đổi vì thao tác dừng media.
- AC-07.2.1/4/6: chuyển panel nội bộ khi đang phát vẫn giữ track và chỉ báo/nút Tắt truy cập được. Khi browser gửi trạng thái hidden, dừng capture/phát; visible lại không tự bật. Đang xin quyền/kết nối/cấp token mà bị hidden hoặc mất socket thì kết quả đến muộn không được tạo track/phát lại; thao tác bật chỉ thực hiện khi trang visible và quyền hiện hành hợp lệ.
- AC-YC7-RX.2–3: nguồn đã Tắt nhận vẫn tắt qua reconnect; nguồn được phép nhận lại phải recheck role/policy, không mang track/âm thanh cũ ngoài quyền.
- Kiểm chuyển tab browser/thu nhỏ/khóa màn hình trên desktop/mobile thật. Tín hiệu visibility và lịch chạy JS phụ thuộc browser/OS; không tuyên bố bảo đảm tắt đúng lúc OS đã đình chỉ tiến trình. Nếu không xác minh được phần cứng/track thật thì ghi BLOCKED, không PASS bằng state UI.

Giữ cách đếm Unicode code point hiện có; không cần PO chọn token/SQL/SDK hoặc HTTP polling so với socket để trả lời năm câu nghiệp vụ này. Tối ưu transport chỉ khi có yêu cầu độ trễ hoặc số đo thật cho thấy cần.

## 16. Bàn giao

1. Áp dụng BA0.25/mục15 và AC bổ sung; giữ Story/Task/Jira nguồn, không tự đổi lịch/giờ hoặc Done.
2. Khi có nhiệm vụ triển khai: sửa nguyên nhân ở chat/media shared/store và mọi caller/test/schema cần chạm; không tạo quota/filter/sticker thứ hai ở mỗi UI.
3. Nghiệm thu27 AC baseline,9 AC nguồn đã lên P1 và3 AC-YC7-RX.1–3, cùng biến thể mục15.2. Ghi commit/môi trường/dữ liệu/kết quả PASS/FAIL/BLOCKED thực sự quan sát.
4. Revoke/token cũ, thiết bị/tab, LAN/Cloud và actual audio/video phải có evidence thật; không dùng số lượng test hoặc screenshot nút làm bằng chứng.
5. Commit/push/Jira/deploy là thao tác riêng, chỉ khi được yêu cầu.

**Lượt tài liệu:** không sửa code/migration hoặc bật dịch vụ. **Test local: không chạy (không được yêu cầu).** Chưa xem giao diện hoặc kiểm thiết bị/media thật.

## 17. Quyết định PO khi rà soát YC7 — 31/10/2026

**Chưa triển khai**; code và test hiện còn theo trạng thái cũ. Bổ sung cho mục 6, 9, 10, 11, 12.

| # | Quyết định | AC bổ sung |
|---|---|---|
| 1 | **Link trong chat hiển thị như văn bản, không bấm được** (phòng và DM). Không tự biến thành liên kết, không xem trước, không mở trang ngoài từ nội dung chat | AC-YC7-RV-01 |
| 2 | **Kết nối LiveKit theo nhu cầu:** chỉ kết nối khi người đó đang bật camera/mic hoặc khi có người chia sẻ tới họ; không kết nối chỉ vì vào phòng. Người xem không kết nối nếu không ai chia sẻ cho người xem. Ngắt khi không còn cần (tắt hết thiết bị và không còn nguồn nhận) | AC-YC7-RV-02, 03 |
| 3 | **Chất lượng video tự điều chỉnh theo mạng, không đặt trần độ phân giải/khung hình.** Dùng cơ chế thích ứng của LiveKit; băng thông và phút thực tế ghi vào GATE-MEDIA, không đặt ngưỡng đạt | AC-YC7-RV-04 |
| 4 | **Dấu báo tin chưa xem trong phòng:** chấm có số trên nút/tab Chat khi chưa mở khung chat tương ứng, phân biệt Riêng/Chung; chỉ ở máy mình, không gửi biên nhận cho ai, không âm thanh; mất khi mở kênh đó | AC-YC7-RV-05 |

### 17.1 Quy tắc chi tiết

- **Link:** chuỗi dạng URL giữ nguyên là văn bản có thể chọn/sao chép; vẫn qua bộ lọc từ cấm và giới hạn 200 ký tự; không tự thêm thẻ liên kết, không `href`.
- **Kết nối theo nhu cầu:** khi người chơi bật camera/mic lần đầu hoặc người khác bắt đầu chia sẻ tới họ, ứng dụng xin token và kết nối; khi đổi mức chia sẻ sang “Cả đối thủ và người xem”, người xem đủ điều kiện kết nối lúc đó. Mất Socket.IO phòng vẫn ngắt theo mục 10. Thời gian kết nối ban đầu không tính vào “≤ 2 giây” của AC-07.2 (đó là thời gian từ khi đã kết nối); đo riêng và ghi vào GATE-MEDIA — PO xác nhận 31/10.
- **Video thích ứng:** bật cơ chế giảm/tăng chất lượng theo băng thông người nhận (simulcast/adaptive stream). Không đặt trần nên mức tiêu thụ băng thông không dự đoán được; Cloud miễn phí có thể có giới hạn băng thông ngoài số phút, phải kiểm khi chạy GATE-MEDIA. Khi quá giới hạn dịch vụ hoặc chất lượng quá thấp: hiện *“Camera/mic tạm thời không dùng được”* hoặc hạ chất lượng, ván và chat vẫn tiếp tục (BA 0.14).
- **Dấu báo tin chưa xem:** chỉ đếm tin đến của người khác (không tính tin mình gửi, không tính tin trước mốc vào); tối đa hiển thị “99+”; mobile ở tab Ván/Camera thấy chấm trên tab Chat; desktop khi khung chat đang ẩn thấy chấm trên nút mở chat. Mở kênh và tin nằm trong vùng nhìn thì xóa số của kênh đó. Không đổi thành read receipt phòng và không gửi lên máy chủ như trạng thái đọc.

### 17.2 Tiêu chí bổ sung

| Mã | Given / When | Then bắt buộc |
|---|---|---|
| AC-YC7-RV-01 | Gửi tin chứa `https://example.com` ở Riêng, Chung và DM | Hiển thị đúng chuỗi như văn bản, không phải thẻ `a`, không `href`, không xem trước; sao chép được; lọc từ cấm và giới hạn 200 ký tự vẫn áp dụng |
| AC-YC7-RV-02 | Người xem vào phòng khi không ai bật thiết bị hoặc chia sẻ tới người xem | Không có kết nối LiveKit nào của người xem; chat và bàn vẫn bình thường |
| AC-YC7-RV-03 | Người chơi bật camera và chọn “Cả đối thủ và người xem”; sau đó tắt hết | Người xem và đối thủ kết nối khi cần và nhận hình; khi tắt hết và không còn nguồn, kết nối được ngắt; kiểm bằng danh sách participant phía provider, không chỉ giao diện |
| AC-YC7-RV-04 | Hai người chơi bật camera, năm người xem nhận, mạng bị giới hạn | Chất lượng tự hạ thay vì đứt; ván/chat không gián đoạn; ghi băng thông và phút thực vào GATE-MEDIA; không đặt ngưỡng đạt |
| AC-YC7-RV-05 | Khung chat đang ẩn hoặc ở tab khác; có tin Riêng và Chung mới từ người khác | Chấm báo có số riêng cho từng kênh, không âm thanh; không tính tin mình gửi; mở kênh thì mất số; không có biên nhận đọc gửi đi |

**PO xác nhận 31/10/2026:** (a) thời gian kết nối ban đầu không tính vào “≤ 2 giây” của AC-07.2, ghi riêng vào GATE-MEDIA; (b) trạng thái Tắt nhận hình/tiếng của người nhận lưu theo phiên trình duyệt, không đồng bộ giữa thiết bị; (c) người phát thấy hình xem trước của chính mình khi đang phát (lật gương) và không có xem trước khi chọn “Không chia sẻ”.

### 17.3 Tác động triển khai (chưa làm)

- Chat: bỏ tự biến link thành liên kết nếu `RoomChat`/`DirectChatDialog` đang có; kiểm test hiển thị văn bản thuần.
- Media: `MediaPanel`/`media.service.ts` kết nối theo nhu cầu (hiện kết nối khi vào phòng nếu có); thêm ngắt khi không còn cần; bật adaptive stream/dynacast.
- Chat phòng: đếm tin chưa xem phía client theo kênh và hiển thị chấm trên nút/tab Chat.
- Cần số đo thật cho GATE-MEDIA (băng thông, phút, thời gian kết nối); bằng chứng ở mục 13–14 là trước các thay đổi này.
