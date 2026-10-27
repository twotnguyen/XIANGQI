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
lại tiếng của mình; không tự bật camera/mic khi mở phòng.
