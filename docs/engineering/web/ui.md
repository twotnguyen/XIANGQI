# Khung giao diện — XIAN-39 / T03

Biến giao diện Kỳ Đài Cổ Phong ở `../styles/tokens.css`. Phông được self-host
với giấy phép tại `public/fonts/UI-FONTS.md`; giao diện không tải phông từ CDN.
`primitives.tsx` cung cấp nút, trường nhập, dialog, tooltip, toast, tab, badge,
trạng thái chờ, trống và lỗi. `AppShell` dùng cùng thành phần cho điều hướng
máy tính/điện thoại; liên kết giữ được thao tác Back/Forward và mở tab mới.

Chạy `pnpm --filter @xiangqi/web dev`, mở `/dev/ui` để kiểm thành phần và
`/dev/lobby` để xem vị trí tích hợp Sảnh. Danh sách phòng trong preview có
nhãn dữ liệu minh họa; preview không cấp quyền vào phòng hoặc chơi cờ.

Ưu tiên desktop/laptop: 1280×720, 1366×768, 1440×900, 1536×864,
1920×1080; sau đó mobile 360×800 và 390×844. Các kiểm trình duyệt đã kiểm
tràn ngang, vùng thao tác tối thiểu 44px, dialog bằng bàn phím và font local.
Dialog giữ focus, Escape/backdrop đóng và trả focus; tooltip giữ hiển thị khi
focus hoặc hover, có cầu hover và Escape để bỏ qua.

Các route/guard thuần ở `../routing` phân biệt phiên đang kiểm, ẩn danh,
thành viên, Khách và onboarding; không thay thế xác thực/quyền vào phòng tại
máy chủ. Luồng đăng nhập, danh sách phòng và ván thật được nối trong Task
của từng tính năng. Không coi preview hoặc guard phía client là nghiệm thu
phân quyền. Phóng to 200%, screen reader và đánh giá không phân biệt màu
vẫn cần được kiểm xuyên suốt trước bàn giao đầy đủ.

## Chế độ Khách

Đăng nhập có nút "Chơi nhanh với tư cách Khách (Guest)", mở hộp thoại
"Chơi với tư cách Khách" nhập "Tên hiển thị" (2–20 ký tự). Tên được chuẩn hóa
NFC, cắt khoảng trắng và kiểm tra trước khi gửi; máy chủ kiểm tra lại. Hủy hộp
thoại khi đang chờ thì phiên Khách đến muộn không được cài (máy chủ bị thu hồi
ngay). Phiên Khách chỉ có trong bộ nhớ và cookie HttpOnly của máy chủ; capability
không được lưu trong storage, URL hoặc log. Cookie được khôi phục khi tải lại;
401 xóa phiên Khách, còn lỗi tạm thời (ví dụ 503) hiện lỗi có thể thử lại, không
coi là ẩn danh. Khi đến hạn, phiên được kiểm lại với máy chủ: máy chủ là nguồn sự
thật, client không tự gia hạn hay tự xóa phiên. Khách vào Sảnh, phòng (chơi, xem,
chat, media), ván với máy và `/rooms/join` như thành viên, hiển thị "(Khách)" ở
mọi nơi có tên người dùng. Khách không thấy bạn bè, lịch sử, replay hay bảng xếp
hạng; trang Hồ sơ chỉ còn đăng xuất và không gọi API hồ sơ/vị trí của thành viên.
Đăng xuất (từ Sảnh hoặc Hồ sơ) đi qua cùng luồng với thành viên: nếu đang có ván
AI thì hỏi xác nhận đầu hàng trước; nếu đang có ván phòng thì hỏi xác nhận xin thua
(409 `GUEST_RESIGN_CONFIRM_REQUIRED`). Đăng xuất lỗi giữ phiên Khách và kiểm lại
sau. Kết nối phòng và AI dùng `getRealtimeProof()`; HTTP dùng `sessionFetch`, còn
route thành viên giữ `authorizedFetch`.

## Tải giao diện theo màn hình

Entry chỉ tải preview khi mở route `/dev/*` tương ứng. Router tải trang đăng nhập,
phòng đấu, AI, bạn bè, hồ sơ, lịch sử và replay bằng `React.lazy`; reload Sảnh
không tải sẵn các trang này hoặc lõi bàn cờ. Chuông thông báo tách khỏi trang
Bạn bè để không kéo cả trang vào shell.

Mở form Tạo phòng đồng thời tải trước module `RoomPage` để chồng thời gian tải
mã lên thao tác nhập form và request tạo phòng. Reload `/rooms/:id` tải module
phòng song song với kiểm tra phiên, nhưng chỉ đọc dữ liệu phòng sau khi phiên
được xác thực. Không tải graph phòng khi chỉ reload Sảnh.

Socket là đường tải phòng chính; chỉ đọc HTTP dự phòng khi socket báo mất
kết nối. HTTP chỉ giúp hiển thị, không cấp quyền điều khiển. Phản hồi HTTP
trễ không ghi đè snapshot realtime hoặc kết nối thuộc thế hệ mới hơn.
Lỗi `ROOM_FORBIDDEN` khi đọc dự phòng hoặc rời phòng đưa về Sảnh; lỗi xác
thực không được coi là rời phòng thành công. Khi admission thất bại, nút
Thử lại dựng lại kết nối; phải nhận snapshot realtime mới trước khi thao tác.
Refresh khi quay lại tab chỉ chạy cho ván đang ACTIVE, không đọc lại phòng
WAITING mỗi lần focus. Phản hồi refresh cũ bị bỏ qua khi bắt đầu rời phòng.

`features/rooms/useRoomConnection.ts` giữ vòng đời socket, fallback HTTP và các
epoch/ref đồng bộ; `RoomPage` giữ lệnh và điều phối giao diện. Nút Thử lại đóng
kết nối cũ rồi chờ snapshot realtime mới; HTTP không cấp lại quyền điều khiển.

Chat không tải lại lịch sử sau một nước đi ACTIVE được xác nhận: room version và
match version cùng tăng đúng 1, `lastMove.eventVersion` khớp match version, ván,
ghế, vai trò và quyền tab không đổi. `shared/room-snapshot.ts` giữ điều kiện này
cho cả hook chat và bộ đọc Socket.IO. Phản hồi chat đang bay được so với mốc
thay đổi phạm vi chat, không phải mốc nước đi mới nhất; notice chat vẫn có mốc
riêng. Nhảy phiên bản, đổi ghế/quyền, kết thúc ván hoặc reconnect vẫn kiểm lại
phạm vi và xóa lịch sử riêng khi cần. Không cache quyền phía server.

`Suspense` giữ shell khi trang đang tải; boundary đổi theo route để dọn socket
và effect của trang cũ ngay khi rời trang, kể cả trang mới chưa tải xong.
Dialog Tạo phòng/Thiết lập máy tải khi mở, không thay cả Sảnh bằng màn chờ.
Sau khi trang tải xong, focus chuyển tới heading để giữ điều hướng bàn phím.
Heading `h1[tabindex="-1"]` nhận focus lập trình không vẽ viền như control;
nút, liên kết và ô nhập vẫn giữ chỉ báo `:focus-visible` khi dùng bàn phím.
Các GET khởi tạo Sảnh/thông báo chờ một
microtask và kiểm lifecycle, bỏ lượt mount bị hủy của StrictMode; không tắt
StrictMode hoặc thêm cache dữ liệu.

Phiên đăng nhập vẫn được kiểm thật tại backend trước khi hiện Sảnh. Việc tách
mã tải không thay thế kiểm quyền, không lưu token vào localStorage và không
loại bỏ trạng thái chờ/lỗi khi dịch vụ xác thực chưa trả lời.

Màn kiểm tra phiên dùng khung giữa màn hình, nền nâu và quân cờ đỏ/viền vàng
theo token Kỳ Đài Cổ Phong. Vòng chờ bằng CSS dừng khi bật giảm chuyển động;
nội dung chờ giữ `role="status"`. Không tải thêm ảnh, không thêm thời gian chờ
giả hoặc thay đổi luồng xác thực.
`LoadingScreen` được dùng chung cho fallback entry và kiểm tra phiên. Entry
import trực tiếp component cùng CSS/token trước khi tải router bất đồng bộ,
để giai đoạn đầu cũng có khung chờ đầy đủ, không hiện dòng chữ ở góc trang.

## Đánh với máy và phạm vi route

AI dùng `makeAiClient` và `connectAi` tới runtime server; web không chạy engine
tìm nước hoặc lưu bản ván chính thức trong sessionStorage. Thiết lập phe/mức
được gửi tới server, URL dùng ID server cấp. Snapshot chứa số lần đi lại đã dùng;
đi lại khi máy đang nghĩ phải hủy tác vụ cũ, phản hồi trễ không được ghi đè ván.
Mất trạng thái sau restart/hết ân hạn hiển thị lỗi thật, không tự dựng ván thay thế.
Rời ván/đăng xuất chủ động chỉ điều hướng sau khi người dùng xác nhận và server
đã nhận đầu hàng; hủy xác nhận hoặc lỗi server giữ phiên/giao diện hiện tại.
Đăng xuất khi đang mở ván AI (route `/ai/:id` hoặc vị trí đang chơi) hỏi xác nhận
và đầu hàng ván đó trước, cho cả Khách lẫn thành viên.

`/forgot-password`, `/reset-password` và `/leaderboard` dùng `P2ScopePage` để
phân định tính năng P2 chưa mở, giữ guard phiên và đường quay lại phù hợp.
Không gửi OTP giả, không hiển thị Elo mẫu hoặc coi route có tên là tính năng
đã triển khai.

## Phòng chờ thi đấu

`RoomPage.tsx` và `features/rooms/rooms.css` dùng token Kỳ Đài Cổ Phong:
hai ghế nền gỗ trầm với quân Đỏ/Đen mặt ngà, VS và đổi bên ở giữa;
camera/mic dưới ghế, chat bên phải, mã mời/người xem ở hàng cuối.
Hai kênh chat khi cùng mở xếp dọc để giữ đủ chỗ soạn tin.
Dưới 1024px các khối xếp một cột; dưới 541px hai ghế cũng xếp dọc.
Trang cuộn tự nhiên, không khoá chiều cao làm mất nội dung trên laptop.
Nút Sẵn sàng nằm trong ghế của người đang điều khiển; dữ liệu,
quyền thao tác và trạng thái kết nối vẫn lấy từ luồng phòng hiện có.

CSS phòng chờ giới hạn bằng `.is-waiting`, không đổi màu màn đang đấu.
Chat/media giữ cùng vị trí trong cây React khi chuyển sang ván để tránh
ngắt kết nối do thay bố cục. Dùng ảnh nền và phông local có sẵn; không thêm
nút demo, Elo mẫu, QR hoặc chức năng P2 từ mockup.

`MediaSeats` luôn giữ hai ô camera theo ghế Đỏ/Đen, kể cả khi chưa có track,
ghế trống, đang tải media hoặc chưa có dịch vụ media. Video được gắn theo
identity người chơi, không theo thứ tự track; đổi ghế thì hình đi theo người,
rời ghế thì hình cũ không còn hiển thị. Audio không tạo thêm ô camera.
`MediaPanel` gắn preview camera của chính mình ở chế độ muted để không phát
lại tiếng của mình. Khi mở phòng hoặc kết nối lại, panel chỉ join receive-only
(camera/mic tắt, token không publish); người xem vào phòng stage và không bao
giờ publish. Chỉ khi người chơi bấm bật thiết bị mới publish: phòng riêng khi
mức đã xác nhận khác `NONE`, và phòng stage chỉ khi mức đã xác nhận là `ALL`.
Đổi mức chia sẻ chỉ áp dụng sau khi máy chủ xác nhận; nếu lưu thất bại, camera
và mic tắt, panel rejoin receive-only ở mức đã xác nhận. Mọi tác vụ join/publish
đang chờ đều bị vô hiệu khi đổi phòng, ngắt kết nối hoặc unmount, và phòng/track
của thế hệ cũ được giải phóng.
