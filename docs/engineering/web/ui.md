# Khung giao diện — XIAN-39 / T03

Biến giao diện Kỳ Đài Cổ Phong ở `../styles/tokens.css`. Phông được self-host
với giấy phép tại `public/fonts/UI-FONTS.md`; giao diện không tải phông từ CDN.
`primitives.tsx` cung cấp nút, trường nhập, dialog, tooltip, toast, tab, badge,
trạng thái chờ, trống và lỗi. `AppShell` dùng cùng thành phần cho điều hướng
máy tính/điện thoại; liên kết giữ được thao tác Back/Forward và mở tab mới.

Chạy `pnpm --filter @xiangqi/web dev`, mở `/dev/ui` để kiểm thành phần và
`/dev/lobby` để xem vị trí tích hợp Sảnh. Danh sách phòng trong preview có
nhãn dữ liệu minh họa; preview không cấp quyền vào phòng hoặc chơi cờ.

Sảnh PR #152 giữ bốn thẻ chế độ và ảnh minh họa local; subgrid căn hàng nút
giữa các thẻ, kể cả khi nút P2 có lý do vô hiệu hóa. Bộ lọc thời gian mỗi bên
dùng các mức thật 5/10/15 phút và Tất cả, công bố trạng thái qua `aria-pressed`,
giữ thứ tự snapshot máy chủ. Không hiển thị số online/Elo khi chưa có dữ liệu.
Ô mã phòng dùng `TextField` chung để nối nhãn/lỗi; tên chủ Khách giữ `(Khách)`.
Nút Luật chơi mở disclosure hiện có và chuyển focus tới summary; summary giữ
vùng chạm tối thiểu 44px. Sảnh dùng token theo chủ đề, giữ nhãn “Không giới hạn”
cho phòng có `timeMinutes = 0`.

Đã kiểm preview ở 360×800, 390×844 và 1366×900: không tràn ngang, ảnh tải đủ,
control Sảnh cao tối thiểu 44px; mã sai/Enter, bộ lọc, mở luật và dialog tạo
phòng/Escape hoạt động. Giảm chuyển động tắt animation. Chưa nghiệm thu
phòng/ván thật với server trong lần kiểm này.

Sau tích hợp develop, đã xem Sảnh ở 390×844 (tối) và 1366×900 (Giấy Sáng):
không tràn ngang; summary đo được 44px, mở/đóng và chuyển focus đúng.
Đã thao tác lọc 5 phút/Tất cả và gửi mã sai bằng Enter để kiểm tra báo lỗi.
PR #153 giữ hiệu ứng và bố cục mới nhưng dùng token theo chủ đề cho shell,
auth, Sảnh, phòng và đồng hồ. Chấm đích ô trống kế thừa `--board-hint`
(`#3a2a1a`), tương phản tính từ các stop nền gỗ đạt 6,70–9,68:1.
Đã xem bàn cờ tương tác ở 390×844, chọn Tốt hiện đúng chấm đích; auth ở
390×844 giữ input 16px và không tràn ngang. Đã xem auth và đồng hồ thật
với dữ liệu minh họa ở 1366×900 dưới chủ đề Giấy Sáng. Chưa nghiệm thu ván online.

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
  bè cho nội dung dài co/ngắt dòng. YC3 bổ sung popup lời mời không modal ở góc
  màn hình, nhiều lời mời độc lập; chi tiết và kiểm chứng ở mục YC3 dưới đây.
  Media một cột trên mobile; replay giữ chiều cao tối thiểu ở màn thấp.

Đã xem `/dev/ui`, `/dev/lobby`, `/dev/login`, `/dev/register`, `/dev/board`
ở 360×800 và 1280×720: không tràn ngang. Đã thao tác focus vòng, Escape và
trả focus của menu; dialog tạo phòng ở 844×390 giữ footer trong màn hình và
cuộn tới nút Tạo phòng bằng focus. Đây là kiểm giao diện preview, không phải
nghiệm thu các trang cần tài khoản, phòng/ván thật hay thiết bị media.

## YC3: chia sẻ phòng và bạn bè (30/10/2026)

- Trang Bạn bè hai cột trên desktop, một cột dưới 800px; danh sách/kết quả tìm kiếm cuộn riêng. Giữ token/phông/component sẵn có, không thêm thư viện. Tìm kiếm bỏ phản hồi cũ khi đổi input; quan hệ đã là bạn/pending đổi hành động, không tạo lời mời trùng.
- Chuông mở `/friends?tab=requests`; `Tabs.defaultId` chọn danh sách Lời mời dùng chung, kể cả bấm lại chuông khi đang ở Bạn bè. Poll 2 giây cập nhật quan hệ, presence và số đếm; lỗi cập nhật giữ danh sách cũ kèm cảnh báo, không giả thành rỗng.
- Người ngồi ghế mở Dialog **Mời vào phòng**: mã/link có thể chọn, hai nút clipboard chỉ báo thành công sau ghi thật. Thành viên có tab Bạn bè; Khách không có; người xem không có nút mở. `RoomPage` nhận slot `renderInviteFriends` từ app, không import chéo feature.
- Popup xếp cùng lúc ở góc màn hình trong vùng tối đa 50dvh có cuộn; không giành focus hoặc bẫy focus, bàn cờ/chat vẫn hoạt động. Esc/X trên popup đang tương tác = Từ chối đúng invite. Deadline tuyệt đối từ server, không reset khi reload. API accept trả chỗ đã cấp thật; lỗi B giữ route/phòng A và báo ngay trong popup.
- Phản hồi từ chối hiện cả khi người gửi đã rời phòng; trong Dialog đang mở, tab Bạn bè cũng hiển thị phản hồi và cooldown toàn tài khoản. Thông báo có ack, không trộn vào chuông kết bạn.
- Khung `xq-main` phòng chờ xếp dọc banner email và phòng, tránh banner ép phòng về chiều rộng 0 trên mobile. Nút chia sẻ giữ wrapper/grid-slot cũ khi chuyển nội dung sang Dialog, không bị thanh chọn phòng/camera/chat che.
- Nhắn tin bạn bè mở `DirectChatDialog` (Dialog chuẩn): log cuộn nội bộ `role="log"` có thể focus, composer có nhãn ẩn và bộ đếm 200 ký tự; poll HTTP 2 giây. Nút "Tải tin cũ" lấy 50 tin trước tin cũ nhất đã tải. Đánh dấu đã đọc theo tin đến có ít nhất 50% hiển thị trong log (IntersectionObserver), chỉ khi tab hiển thị và cửa sổ có focus; mốc đọc không giảm. Bạn đã hủy: dialog xóa lịch sử ngay ở lần poll/gửi đầu tiên nhận `DM_NOT_FRIENDS`, hiện trạng thái thu hồi và khóa composer. `DirectChatHub` (tách khỏi chuông lời mời) hiện badge tổng tin chưa đọc ở mọi route, poll 2 giây, không render khi chưa đăng nhập hoặc là Khách.

Kiểm local: trình duyệt thật với Nest/Socket.IO, PostgreSQL 17 riêng; chỉ provider Auth là synthetic. Đã đi qua login, đăng ký bỏ email và Khách từ link; mã có số 0 đầu giữ nguyên; clipboard thật, Escape trả focus; nhận nhiều popup, Esc chỉ từ chối một popup, chuyển A→B thất bại/thành công. Đã xem 1366×768 và 360×800; modal không tràn ngang, phòng chờ mobile không cuộn toàn trang. Không thay bằng chứng này cho Google/SMTP/LiveKit production hoặc nghiệm thu PO.

## Cài đặt dạng sidebar (29/10/2026)

`/settings` dùng `features/profile/ProfilePage.tsx`: sidebar chia Hồ sơ cá nhân,
Giao diện, Đổi mật khẩu và Phiên đăng nhập. Các mục giữ mounted, chỉ ẩn bằng
`hidden` để không mất tên đang nhập dở khi chuyển mục. Dưới 800px, sidebar thành
thanh chọn phía trên nội dung; nút Đăng xuất vẫn truy cập được.

Hồ sơ giữ API đổi tên và kiểm tra 2–30 ký tự; tên đăng nhập chỉ để xem,
avatar lấy chữ cái đầu theo Unicode. Chủ đề lưu theo tài khoản qua `GET/PUT /profile/theme`
(`ThemeSettings`, chỉ thành viên), không dùng localStorage. Ba lựa chọn: Kỳ Đài Cổ Phong
(mặc định khi chưa đặt), Giấy Sáng và Theo hệ thống (theo `prefers-color-scheme` của từng thiết
bị). Giao diện chỉ đổi sau khi server xác nhận; lỗi giữ chủ đề hiện tại. `AccountThemeSync`
đặt lại mặc định khi khách/đăng xuất/đổi tài khoản rồi đọc lựa chọn của tài khoản mới. Khi đang đăng nhập, `AccountThemeSync` đọc lại mỗi 5 giây khi tab hiển thị và khi cửa sổ lấy focus, không chồng request; kết quả cũ không ghi đè lần lưu cục bộ xảy ra trong lúc chờ, và chỉ áp khi khác chủ đề hiện tại.
Màu nằm ở token `:root` và `:root[data-theme="paper-light"]` trong `../styles/tokens.css`; bàn
cờ ghim palette riêng trong `.xq-board` nên không đổi theo chủ đề. Khách chỉ thấy thông tin
phiên và Đăng xuất; không gọi API hồ sơ thành viên. Luồng xác nhận đăng xuất
khi đang đấu giữ nguyên.

Tab Hồ sơ cá nhân (30/10/2026): tên đăng nhập/email chỉ đọc nằm cùng hàng trên
desktop, form tên hiển thị ở dưới; mobile xếp một cột. Nút sao chép chỉ báo thành
công sau khi clipboard hoàn tất, lỗi cho phép chọn tên để sao chép thủ công.
Form dùng `TextField` chung, giữ trợ giúp/lỗi truy cập và giới hạn 2–30 điểm mã
Unicode (không dùng `maxLength` UTF-16). Khi có `emailSection`, chỉ luồng email
tài khoản hiển thị trạng thái để không lặp email hoặc khẳng định đã xác minh sai.

Giao diện có ba kiểu quân Ngọc Bích Cổ, Gỗ Mun Khảm và Truyền Thống. Lựa chọn
được áp dụng lên SVG dùng chung ở online, AI và replay, khôi phục lúc khởi động.
`shared/preferences.ts` giữ lựa chọn trên trình duyệt; storage bị chặn/đầy thì
chỉ giữ trong phiên. SFX và nút tắt tiếng trong phòng dùng cùng tùy chọn.
Click và nhạc nền ngũ cung được tổng hợp bằng Web Audio, không tải audio bên
thứ ba. Nhạc mặc định tắt, chỉ khởi động sau tương tác; runtime ở gốc ứng dụng
không bị tháo khi đổi route, dispose hủy cả lượt resume đang chờ.

Email là tùy chọn từ 29/10: đăng ký có nút bỏ qua tại bước Email/OTP. `SessionProvider`
tải `GET /account/email` riêng sau khi xác thực thành viên, không chặn quyền vào app.
Banner toàn cục và mục email trong Hồ sơ phân biệt chưa có, đang chờ, đã xác minh và
lỗi tải trạng thái; xác minh/gửi lại dùng API `/account/email/*`, giữ cùng tài khoản.
Email đã xác minh chỉ đọc; không hiển thị email credential kỹ thuật. Lỗi SMTP/OTP
phải hiển thị thật, không coi là thành công hoặc quảng bá khôi phục mật khẩu P2.

Kiểm chứng PR #150: đã xem component hồ sơ thật với client dữ liệu minh họa ở
1366×900 và 390×844, chọn chủ đề sáng, không tràn ngang; nút hiển thị đạt 44px.
Đã chọn cả ba kiểu và tải lại `/dev/board`: màu mặt SVG khớp lựa chọn đã lưu.
Web Audio thật lên lịch nhạc sau bật và tiếp tục qua đổi mục; tắt thì ngừng
lên lịch nốt mới. Dưới Node 22, unit ngoài core đạt 1.012/1.012; lint file đổi,
typecheck web/test và build web thành công. Chưa nghe loa thực hoặc nghiệm thu
phiên thành viên/online/AI/replay với server thật trong lần kiểm này.

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
Tab không giữ quyền điều khiển (`writable=false`) không publish: bấm bật camera/mic mở hộp thoại `MODAL-MEDIA-TAB-SWITCH` (“Chuyển thiết bị sang tab này” / “Hủy bỏ”, Esc đóng, focus trap). Chỉ xác nhận mới gọi `onTakeover`; hủy, Esc, kết nối lại hoặc mất phiên không chuyển quyền. Khi quyền chuyển đi, panel dừng camera/mic và rejoin receive-only; tab mới luôn bắt đầu với thiết bị tắt. Lỗi thiết bị không dừng ván.

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

## Đổi bên trong phòng chờ (YC2 P1)

Người được mời đổi bên nhận hộp thoại `SwapPrompt` (Dialog, giữ focus, đếm ngược
theo `expiresAt` của server). Esc, X và "Thu gọn" chỉ thu hộp thoại, không từ chối;
khi thu, nút "Xem đề nghị đổi bên (N giây)" trong phòng chờ mở lại trong cùng deadline.
Hết giờ thì server coi là từ chối. "Xin đổi bên" của người đề nghị bị khóa kèm lý do
đếm ngược theo `swapCooldownUntil` (chỉ người đề nghị nhận giá trị này).

Kết quả ván chỉ hiện khi phòng vừa chuyển sang PLAYING trong phiên hiện tại; tải lại
phòng đã kết thúc giữ bố cục chờ và không mở lại kết quả. Esc trên kết quả ván = Ở lại phòng.
Khi Rời phòng đang chờ, nút Ở lại và Escape không đóng kết quả. Rời thất bại giữ
hộp thoại, hiện lỗi đã làm sạch và cho gửi lại; chỉ điều hướng sau khi rời thành công.

## Banner chống treo ván (US-P2-10)

`features/rooms/match/InactivityBanner.tsx` chỉ hiện cho bên đang đến lượt khi snapshot có `match.inactivity`. Banner không modal, không khóa focus, không che bàn cờ hay nút Đầu hàng; có `role="status"`. Đếm lùi lấy từ `expiresAt` của server. Khi `confirmsLeft` = 0 thì ẩn nút "Tôi còn đây". Ván không giới hạn không có đồng hồ từng bên (snapshot không gửi `clocks`).

## Nâng cấp giao diện kỳ đài (31/10/2026)

- Đồng bộ nền nâu trầm, viền mảnh và vàng dịu bằng token hiện có; giữ hai chủ đề, phông/ảnh local và palette bàn cờ. Không thêm dependency UI.
- Shell có thương hiệu hai dòng, biểu tượng SVG nét, điều hướng active, menu mobile và footer gọn. Footer ẩn trong phòng để không lấy diện tích bố cục khóa theo viewport. Avatar shell lấy ký tự Unicode đầu tiên.
- Sảnh có hero với thao tác tạo phòng/đấu máy, bốn thẻ chế độ, khối vào bằng mã và danh sách phòng phân cấp rõ. Nút các thẻ căn cùng hàng cả khi có dòng giải thích vô hiệu hóa. Giữ đủ bộ lọc Tất cả/5/10/15 phút, mã 8 chữ số, trạng thái tải/trống/lỗi và quyền vào chơi/xem. Chế độ chưa mở vẫn có nhãn Sắp ra mắt; không hiển thị số online/Elo giả.
- Auth có panel giới thiệu và bàn cờ SVG trang trí, form chữ 16px/cao 48px; nút hiện mật khẩu có khoảng trống riêng. Bỏ tuyên bố WCAG chưa được nghiệm thu.
- Bàn online mobile lấy chiều rộng khả dụng thay vì co theo chiều cao; desktop giữ kích thước tối thiểu 320px. Sidebar chat xếp dọc, nút phòng/media trở lại 44px. Đồng hồ, AI, bạn bè, hồ sơ, lịch sử và replay dùng panel/spacing nhất quán; sửa tương phản avatar/tin nhắn/nút lưu dưới Giấy Sáng.
- SVG có focus bàn phím rõ, giảm chuyển động bao phủ vòng nước đi; nhãn Lượt/Chú giải có nền tối riêng để đọc được dưới mọi theme.

Đã chạy web Vite và server NestJS local dưới Node 22.23.3. Đã kiểm trực tiếp /dev/lobby, /dev/login, /dev/register và /dev/board ở desktop 1366/1440px và mobile 360/390px: không tràn ngang, ảnh tải đầy đủ, input auth 16px/cao48px và nút Sảnh tối thiểu44px. Đã thao tác lọc 5 phút/Tất cả, mã sai, dialog tạo phòng ở 844×390, menu/Escape/trả focus, đổi góc nhìn/thế cờ và chú giải. Đã xem Sảnh và auth dưới Giấy Sáng bằng thuộc tính HTML local tạm thời, đã khôi phục trước commit.

Typecheck web, ESLint các TSX đổi và git diff --check đạt. Test local: không chạy (không được yêu cầu); không chạy build theo quy ước repository. Chưa nghiệm thu phòng/ván thật, trang cần tài khoản, Google/SMTP/LiveKit hoặc thiết bị camera/mic; các preview là dữ liệu minh họa, không thay bằng chứng nghiệp vụ.
