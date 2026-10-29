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

## Chỉnh giao diện đồng bộ (28/10/2026)

- Giữ token nâu/vàng, phông local và component hiện có; native control trong
  `.xq-ui` dùng color-scheme tối. Không thêm thư viện UI.
- Header chuyển sang menu gọn dưới 1200px; dưới 600px thu gọn tên thương hiệu,
  vẫn giữ tên truy cập cho liên kết. Tên tài khoản dài co lại với ellipsis.
  Escape đóng bảng tài khoản và trả focus về nút mở; chọn liên kết trong menu
  điện thoại đóng hộp thoại điều hướng.
- Dialog giới hạn theo `100dvh`, chia tiêu đề / nội dung cuộn / hành động,
  để nút đóng và Hủy không bị cuộn khỏi màn hình thấp. Chỉ style header/footer
  trực tiếp của Dialog, không tác động header/footer lồng trong nội dung.
- Form tạo phòng trong Dialog không lặp tiêu đề và khung; standalone vẫn giữ
  thẻ riêng. Mã phòng sai tại Sảnh hiển thị lỗi trong luồng, không đè trợ giúp
  hoặc thẻ bên dưới.
- Auth tăng vùng bấm và cỡ chữ trợ giúp; input mobile giữ 16px. Hồ sơ và bạn
  bè cho nội dung dài co/ngắt dòng. Lời mời phòng giữ trong luồng trang, không
  tạo lớp phủ mới che bàn cờ/chat. Media một cột trên mobile; replay giữ chiều
  cao tối thiểu cho bàn cờ và danh sách nước ở màn thấp.

Đã xem `/dev/ui`, `/dev/lobby`, `/dev/login`, `/dev/register`, `/dev/board`
ở 360×800 và 1280×720: không tràn ngang. Đã thao tác focus vòng, Escape và
trả focus của menu; dialog tạo phòng ở 844×390 giữ footer trong màn hình và
cuộn tới nút Tạo phòng bằng focus. Đây là kiểm giao diện preview, không phải
nghiệm thu các trang cần tài khoản, phòng/ván thật hay thiết bị media.

## Cài đặt dạng sidebar (29/10/2026)

`/settings` dùng `features/profile/ProfilePage.tsx`: sidebar chia Hồ sơ cá nhân,
Giao diện và Phiên đăng nhập. Các mục giữ mounted, chỉ ẩn bằng `hidden` để
không mất tên đang nhập dở khi chuyển mục. Dưới 800px, sidebar thành thanh chọn
ba mục phía trên nội dung; nút Đăng xuất vẫn truy cập được.

Hồ sơ giữ API đổi tên và kiểm tra 2–30 ký tự; tên đăng nhập chỉ để xem,
avatar lấy chữ cái đầu theo Unicode. Giao diện có bản xem trước cho ba chủ đề
hiện có, áp dụng ngay và lưu bằng cơ chế theme sẵn có. Token sáng/tối chỉ đổi
trong khung cài đặt, không thay token toàn ứng dụng. Khách chỉ thấy thông tin
phiên và Đăng xuất; không gọi API hồ sơ thành viên. Luồng xác nhận đăng xuất
khi đang đấu giữ nguyên.

Tab Hồ sơ cá nhân (30/10/2026): tiêu đề "Cài đặt" và câu phụ nằm cùng một dòng;
thẻ chia hai cột trên desktop (tên đăng nhập + tên hiển thị | email), bỏ khối avatar
và phụ đề lặp với sidebar. Màn thấp (cao tối đa 800px) ẩn câu nhắc ở chân sidebar.
Đo bằng trình duyệt với API giả: không cuộn trang ở 1280×720, 1366×768, 1440×900,
cả khi có banner thiếu email. Dưới 800px vẫn một cột và cuộn bình thường.

Email là tùy chọn từ 29/10: đăng ký có nút bỏ qua tại bước Email/OTP. `SessionProvider`
tải `GET /account/email` riêng sau khi xác thực thành viên, không chặn quyền vào app.
Banner toàn cục và mục email trong Hồ sơ phân biệt chưa có, đang chờ, đã xác minh và
lỗi tải trạng thái; xác minh/gửi lại dùng API `/account/email/*`, giữ cùng tài khoản.
Email đã xác minh chỉ đọc; không hiển thị email credential kỹ thuật. Lỗi SMTP/OTP
phải hiển thị thật, không coi là thành công hoặc quảng bá khôi phục mật khẩu P2.

Đã xem trang thật bằng phiên thành viên ở desktop 1366×900 và mobile 390×844;
đã chuyển mục, chọn chủ đề sáng/hệ thống/cổ phong. Test riêng
`tests/web/features/profile/ProfilePage.test.ts` đạt 7/7 dưới Node 22, bao gồm
giữ bản nháp khi đổi mục, lưu tên, chọn chủ đề và xác nhận đăng xuất.
Chưa thao tác lưu tên hoặc đăng xuất trên tài khoản thật.

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

Khi tạo Khách thành công, máy chủ xóa cookie thành viên
(`xiangqi_session`, `xiangqi_refresh`) rồi ghi cookie Khách trong cùng phản hồi.
Khi refresh thành viên trả 401, cookie thành viên hết hiệu lực cũng được xóa trước
khi frontend khôi phục Khách; lỗi tạm thời không xóa cookie. Không nới kiểm tra
proof trộn. Nút Khách ở `/login` đã nối luồng thật; `/dev/*` chỉ là preview.

## Tải giao diện theo màn hình

Entry chỉ tải preview khi mở route `/dev/*` tương ứng. Router tải trang đăng nhập,
phòng đấu, AI, bạn bè, hồ sơ, lịch sử và replay bằng `React.lazy`; reload Sảnh
không tải sẵn các trang này hoặc lõi bàn cờ. Chuông thông báo tách khỏi trang
Bạn bè để không kéo cả trang vào shell.

Mở form Tạo phòng đồng thời tải trước module `RoomPage` để chồng thời gian tải
mã lên thao tác nhập form và request tạo phòng. Reload `/rooms/:id` tải module
phòng song song với kiểm tra phiên, nhưng chỉ đọc dữ liệu phòng sau khi phiên
được xác thực. Không tải graph phòng khi chỉ reload Sảnh.

Form Tạo phòng có mục Quyền truy cập: mặc định chọn **Chỉ qua mã/link/lời mời**
(`CODE_ONLY`), được đổi sang **Công khai** (`PUBLIC`) ngay trước khi tạo.
Mô tả theo lựa chọn giải thích phòng có hiện ở Sảnh hay không. Form gửi quyền
truy cập cùng thời gian/số người xem trong một yêu cầu tạo phòng; không có
lựa chọn Khóa phòng lúc tạo.

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

Trang lịch sử dùng effect không chặn paint; GET khởi tạo cũng chờ microtask
và kiểm epoch để bỏ lượt mount đã hủy trong StrictMode. Mỗi dòng dùng
`React.memo` và chung một `Intl.DateTimeFormat("vi-VN")`: tải thêm hoặc đổi
trạng thái chờ/lỗi không render lại dòng cũ khi item và callback giữ nguyên.
Không cache lịch sử; đổi client/bộ lọc vẫn ẩn dữ liệu cũ ngay và bỏ phản hồi trễ.

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

`RoomPage.tsx` và `features/rooms/rooms.css` dùng token Kỳ Đài Cổ Phong.
Desktop dùng toàn bộ chiều ngang, không giới hạn 1440px hay căn giữa; cột
camera sát mép trái màn hình. Bố cục giữ **ba cột**:
- **Trái:** camera đối thủ ở trên, camera của bạn ở dưới (theo người chơi,
  không cố định theo phe); người xem giữ thứ tự Đỏ/Đen. Các điều khiển media
  nằm dưới; cuối cột là mã phòng và hai nút Sao chép mã / Sao chép link.
- **Giữa:** hai ghế Đỏ/Đen xếp dọc, cụm đổi ghế/bên nằm giữa hai ghế;
  danh sách người xem ở cuối cột.
- **Phải:** khung chat chạy suốt chiều cao hai hàng của grid.
Trên desktop, nhãn và mã phòng nằm cùng một hàng; mã dùng số tabular trong ô
nền riêng, hai nút sao chép chia đều chiều rộng. Khối mã phòng gọn khoảng
114px, không giữ khoảng trống cho thông báo thành công đã bỏ.
Sao chép thành công chỉ hiện dấu tích trong đúng nút vừa bấm trong 1,5 giây,
sau đó trở lại nhãn cũ; không hiện dòng thông báo thành công bên dưới.
Hiệu ứng vẽ dấu tích tôn trọng `prefers-reduced-motion`, kích thước nút không đổi.
Lỗi sao chép giữ `role="status"` và hiện nổi ngay phía trên khối mã phòng,
không làm thay đổi chiều cao grid. Trong lúc sao chép, cả hai nút khóa thao tác
nhưng không thêm spinner hay dòng giải thích disabled. Trạng thái khóa không đổi
độ mờ hay màu hover của nút, tránh nhấp nháy khi bấm liên tục.

Grid desktop dùng cột `minmax(260px, 320px) / minmax(320px, 1fr) /
minmax(260px, 320px)`; chat và camera rộng bằng nhau, không lớn dần theo
màn hình rộng. Hàng trên nhận chiều cao còn lại sau hàng mã phòng/người xem.
Grid là size container; hai camera tính kích thước theo chiều cao khả dụng sau
khi chừa chỗ cho nhãn, điều khiển và mã phòng, giữ **16:9** và không lớn hơn
chiều rộng cột. Desktop thấp (≤740px) giảm padding media và chiều cao select.
Ở chiều cao này, ghế người chơi dùng padding/avatar/nút gọn hơn; chữ chờ camera
giới hạn một dòng có ellipsis để không bị cắt dọc trong khung hình nhỏ.
Các khối nằm trong viewport, không đẩy trang cuộn xuống; camera không cuộn riêng.
Không hiện thông báo mặc định
“Camera và mic đang tắt.”; lỗi thiết bị/kết nối vẫn hiển thị.
Nút camera/mic chỉ có icon, không có spinner. Hai nhóm nút của bạn và đối thủ
đều căn giữa bên dưới khung hình tương ứng; trên desktop nút tròn 36px,
icon 18px. Nút đối thủ ẩn/hiện camera và tắt/bật tiếng chỉ trên máy bạn,
không đổi kích thước khung hình. Tắt tiếng áp dụng cả với audio track mới; không gửi lệnh
tắt thiết bị của đối thủ, không thay đổi mức chia sẻ. Người xem không có các
nút dành riêng cho đối thủ. Hai nút luôn hiện ở khung đối diện, kể cả ghế
trống; có thể chọn trước và giữ tùy chọn khi đối thủ vào phòng.
Shell chia một chiều cao `100dvh` cho thanh điều hướng và nội dung phòng;
không cộng thêm một viewport cho trang con. Đã kiểm tra trạng thái phòng chờ
thông thường ở 1728×958, 1366×768, 1280×720 và 1024×640: vùng nội dung không
tràn dọc. Chat/danh sách dài vẫn có cuộn nội bộ; hai kênh chat xếp dọc,
ô nhập và nút gửi nằm cùng hàng.
CSS desktop đặt trong `@media (min-width: 1024px)`, tách khỏi khối mobile
`@media (max-width: 1023px)`. Ưu tiên hoàn thiện desktop; mobile giữ bố cục
cũ với lề ngang và camera co giãn, chưa thiết kế lại theo desktop. Hai giao
diện vẫn dùng chung component, dữ liệu và kết nối, không dựng hai phiên media.
Dưới 1024px, bộ chọn Phòng chờ / Camera / Trò chuyện dùng radio native
(có điều hướng bàn phím), chuyển khu vực trong cùng khung thay vì xếp dài trang.
Dưới 600px, hai ghế nằm cạnh nhau. Khu vực không chọn chỉ ẩn bằng CSS:
chat/media vẫn mounted, không mất bản nháp hay ngắt kết nối khi chuyển mục.
Trên mobile, mã phòng ở trên và hai nút sao chép ở hàng dưới để không đè lên
mã; ẩn đoạn hướng dẫn dài. Các khối phòng chờ xếp sát nhau theo chiều cao
nội dung, không kéo giãn khoảng trống giữa ghế và cụm mời.
Lịch sử chat và danh sách người xem cuộn trong khung; nội dung lỗi dài hoặc
phóng to vẫn truy cập được bằng cuộn nội bộ, không cắt bằng `overflow:hidden`.
Nút Sẵn sàng nằm trong ghế của người đang điều khiển; dữ liệu,
quyền thao tác và trạng thái kết nối vẫn lấy từ luồng phòng hiện có.

CSS phòng chờ giới hạn bằng `.is-waiting`, không đổi bố cục màn đang đấu.
Chat/media giữ cùng vị trí trong cây React khi chuyển sang ván. Metadata
header dùng `.xq-waiting-meta`, tránh trùng selector thẻ phòng ở Sảnh.
Dùng ảnh nền và phông local có sẵn; không thêm dữ liệu mẫu hay tính năng P2.

`RoomInvite` dùng hai nút **Sao chép mã** và **Sao chép link**, không còn liên
kết điều hướng ở cụm chia sẻ. Container sao chép URL mời tuyệt đối
`<origin>/rooms/join?token=<mã được encode>` bằng Clipboard API; chỉ thông
báo thành công sau khi API hoàn tất, lỗi được hiển thị để thử lại/chia sẻ mã.
Hai thao tác bị chặn khi đang sao chép; phòng `LOCKED` vẫn ẩn cả cụm.
Đã kiểm tra lại phòng thật khi tách CSS: desktop 1366×768 giữ ba cột, nội dung
bắt đầu tại x=0, camera đúng 16:9; ở 1023×768 chuyển sang một cột, có lề ngang
và camera dùng kích thước co giãn riêng. Cả hai không tràn ngang. Đây là kiểm
ranh giới bố cục, chưa nghiệm thu thiết kế mobile hay bật camera/mic thật.
Lượt kiểm tra nút Sao chép link trước đó giữ nguyên URL trang và hiện thông
báo thành công; chưa đọc lại clipboard.

`MediaSeats` luôn giữ hai ô camera theo ghế Đỏ/Đen, kể cả khi chưa có track,
ghế trống, đang tải media hoặc chưa có dịch vụ media. Video được gắn theo
identity người chơi, không theo thứ tự track; đổi ghế thì hình đi theo người,
rời ghế thì hình cũ không còn hiển thị. Audio không tạo thêm ô camera.
`MediaPanel` gắn video ở chế độ muted; tiếng đối thủ phát qua track audio riêng.
Nhận hình/tiếng không phụ thuộc việc bật thiết bị của người nhận. Sau khi join,
panel đối chiếu các remote track đã subscribe với sự kiện đến sau, gắn mỗi track
một lần để không bỏ sót track đến trong lúc kết nối hoặc phát tiếng trùng.
Khi mở phòng hoặc kết nối lại, panel chỉ join receive-only
(camera/mic tắt, token không publish); người xem vào phòng stage và không bao
giờ publish. Chỉ khi người chơi bấm bật thiết bị mới publish: phòng riêng khi
mức đã xác nhận khác `NONE`, và phòng stage chỉ khi mức đã xác nhận là `ALL`.
Sau lần cấp quyền phát đầu tiên, bật/tắt thiết bị chỉ cập nhật track tương ứng
trên các kết nối hiện có; không rejoin, không ngắt thiết bị còn lại hoặc luồng
đối thủ. Khi bật một thiết bị thất bại, tắt riêng thiết bị đó trên mọi phòng media,
giữ thiết bị còn lại. Tắt cả hai vẫn giữ kết nối nhận; đổi mức chia sẻ buộc lấy
ticket mới trước khi phát lại, không dùng quyền phát của mức cũ.

Nút camera/mic chỉ hiển thị icon tĩnh 44×44px; `aria-label`, `title` và
`aria-pressed` mô tả thao tác/trạng thái. Không truyền `loading` cho hai nút,
không hiện spinner hay chữ “Đang xử lý”. Khi cập nhật track trên phiên đã sẵn
sàng, mỗi thiết bị có khóa đang xử lý riêng: thao tác camera không chặn mic và
ngược lại; bấm lặp cùng thiết bị bị bỏ qua. Chỉ cập nhật trạng thái thiết bị
được chọn, không ghi đè cờ thiết bị kia khi hai thao tác hoàn tất khác thứ tự.
Đổi mức chia sẻ chờ cả hai thao tác track hoàn tất; việc khởi tạo/kết nối lại
và cấp lại quyền vẫn dùng khóa chung, không chạy song song các lần rejoin.
Đã xem nút icon và xác nhận không có spinner trên phòng thật; chưa bật thiết
bị thật hoặc chạy các ca hồi quy chờ thiết bị/đổi thứ tự hoàn tất.
Đổi mức chia sẻ chỉ áp dụng sau khi máy chủ xác nhận; nếu lưu thất bại, camera
và mic tắt, panel rejoin receive-only ở mức đã xác nhận. Mọi tác vụ join/publish
đang chờ đều bị vô hiệu khi đổi phòng, ngắt kết nối hoặc unmount, và phòng/track
của thế hệ cũ được giải phóng.
