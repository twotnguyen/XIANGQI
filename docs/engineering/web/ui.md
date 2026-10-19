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
mã lên thao tác nhập form và request tạo phòng. Không tải graph phòng khi chỉ
reload Sảnh. Kết nối socket đầu tiên chờ microtask và kiểm đã đóng hay chưa,
bỏ handshake của lượt mount StrictMode bị hủy. Phòng vẫn dùng snapshot thật;
HTTP fallback khi realtime chậm và điều kiện cấp quyền điều khiển được giữ nguyên.

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
