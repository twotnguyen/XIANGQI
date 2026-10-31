# P1 · YC1 — Tài khoản, đăng nhập, hồ sơ và mật khẩu

> **BA 0.27 — PO chốt 31/10/2026:** toàn bộ nội dung từng thuộc P2 (Ranked/Elo/bảng xếp hạng, ghép ngẫu nhiên Casual, Xin đi lại/Tái đấu Casual, phần Ranked của lịch sử/thống kê) nay thuộc **P1**. Mọi câu "vẫn P2 / giữ P2 / làm sau / Sắp ra mắt" còn lại trong tài liệu này là lịch sử và bị thay bởi [BA mục 0.27](BA-SCOPE-DECISIONS.md#027-đưa-toàn-bộ-phần-còn-lại-của-p2-lên-p1--po-chốt-31102026); QR vẫn bị loại. Chưa tái ước lượng giờ/Jira; chưa phải bằng chứng triển khai.

**Ngày cập nhật:** 30/10/2026. **Phạm vi:** YC1 P1 gồm baseline, hai chức năng mật khẩu theo BA 0.18 và bốn bổ sung theo **BA 0.21** (mục 18). Hạn P1 giữ 04/11/2026.

**Rà soát 31/10/2026:** PO chốt thêm chín điểm tại mục 20 (thiết bị = trình duyệt, reset xóa khóa, đổi Username 1 lần/7 ngày, cảnh báo bỏ qua email, lối vào Quên tên đăng nhập, trần OTP, ký tự tên, chữ "email"); **đã có mã local trong lượt triển khai 31/10 nhưng chưa có bằng chứng nghiệm thu** (chưa áp migration, chưa kiểm dịch vụ thật; xem mục 20.2), các mục 9–11, 13, 18 dưới đây đã sửa theo.

**Trạng thái:** baseline tại mục 17; bổ sung BA 0.21 đã triển khai và kiểm chứng local tại mục 19. Cloud: đã áp hai migration `20261030000001_password_recovery` và `20261031000001_session_devices` (PO chọn, mục 17); đã áp ngày 31/10/2026 (PO yêu cầu) các migration còn lại `20261019060000`, `20261101000001`–`20261102000005`, `20261103000001`, sổ khớp local (BACKLOG-P1 mục 11 dòng 8); chưa xác nhận CI hoặc nghiệm thu PO; không tự Jira Done.

## 1. Mục tiêu, nguồn và quyết định đã chốt

YC1 giúp người dùng tạo danh tính, vào ứng dụng, quản lý thông tin cá nhân và lấy lại quyền truy cập bằng bằng chứng xác thực phù hợp. Không tạo tài khoản mới khi đổi mật khẩu hoặc thêm email.

Nguồn: [BA Phần 0 và Phần 1](BA-SCOPE-DECISIONS.md), [Backlog P1 — EP-01](BACKLOG-P1.md), [Tổng quan P1/P2](TONG-QUAN-YEU-CAU.md). BA vẫn là nguồn luật ưu tiên; tài liệu này triển khai chi tiết YC1 để PO/dev/QA cùng sử dụng, không tự thay quy trình ván hoặc quyền miền khác.

| Quyết định PO ngày 30/10 | Nội dung |
|---|---|
| Đăng ký | Giữ ba bước Tài khoản → Email tùy chọn → OTP tùy chọn; được bỏ qua email/OTP |
| Đổi mật khẩu chủ động | Thuộc P1; ở Hồ sơ; bắt buộc mật khẩu cũ + mật khẩu mới + xác nhận mới |
| Phiên sau đổi chủ động | Giữ phiên hiện tại, đăng xuất các phiên khác |
| Quên mật khẩu | Thuộc P1; người dùng nhập username; OTP chỉ gửi tới email đã xác minh của đúng tài khoản |
| Thiếu email đã xác minh | Thông báo rõ không khôi phục được; email đang chờ xác minh không đủ điều kiện |
| Reset thành công | Đặt mật khẩu mới, quay về đăng nhập; không tự đăng nhập bằng OTP; thu hồi phiên cũ |
| Phạm vi bổ sung 0.21 | Khôi phục/đổi Username, chuyển camera/mic giữa tab, Giấy Sáng/Theo hệ thống đều P1; chi tiết mục 18, bằng chứng mới tại mục 19 |

**Thuật ngữ email/Gmail:** “Gmail đã xác thực” trong trao đổi được hiểu là email liên hệ đã xác minh của tài khoản. Giữ hỗ trợ email hợp lệ theo BA, không tự thêm điều kiện chỉ nhận đuôi `@gmail.com`. Email kỹ thuật của nhà cung cấp Auth không phải email khôi phục.

**Quy ước an toàn cho trường hợp chưa có câu chữ riêng:** username không tồn tại nhận cùng phản hồi không đủ điều kiện khôi phục như tài khoản chưa có email, không trả email hoặc danh sách tài khoản. Username có email đã xác minh vẫn có phản hồi gửi OTP khác; rủi ro dò trạng thái này được nêu rõ ở mục 12, không tuyên bố luồng hoàn toàn chống dò tài khoản.

## 2. Phạm vi và quyền

### 2.1 Chức năng thuộc YC1 P1

1. Đăng ký thường ba bước, có thể không cung cấp email.
2. Đăng ký/đăng nhập Google và hoàn tất onboarding.
3. Đăng nhập username/mật khẩu, ghi nhớ phiên và khóa thử sai.
4. Chơi nhanh dưới danh tính Khách.
5. Hồ sơ: tên hiển thị, trạng thái email, bổ sung/xác minh email đầu tiên, đổi mật khẩu, đăng xuất.
6. Quên mật khẩu bằng username và OTP email đã xác minh.
7. Một vị trí chơi, tiếp quản tab, đổi thiết bị, hết hạn và thu hồi phiên.
8. Giữ đích lời mời khi xác thực, nhưng không vượt luật phiên/vị trí chơi.
9. Khôi phục Username qua email/OTP, đổi Username qua OTP; giữ mọi phiên hợp lệ/hạn cũ khi đổi.
10. Chuyển/Hủy camera/mic giữa tab (giao YC7); lựa chọn theme ở Hồ sơ lưu theo tài khoản/đồng bộ thiết bị (giao UI toàn ứng dụng).

### 2.2 Không thuộc lần đặc tả này

Đổi/xóa email đã xác minh, tải avatar, xóa tài khoản, khôi phục thủ công qua admin vẫn ngoài phạm vi. Không thêm đăng nhập bằng email/SMS/OTP hoặc tự gộp danh tính. Khôi phục/đổi Username đã lên P1 theo 0.21, không còn trong loại trừ.

| Chủ thể | Quyền trong YC1 |
|---|---|
| Chưa đăng nhập | Đăng ký/đăng nhập/Google/Khách; Quên mật khẩu bằng Username hoặc tìm Username qua email đã xác minh/OTP theo mục đích riêng |
| Thành viên hợp lệ | Hồ sơ/email/mật khẩu, Đổi Username qua OTP, bộ chọn theme P1; media giữa tab chỉ khi có quyền điều khiển/thiết bị hợp lệ |
| Tài khoản Google đã hoàn tất | Có cả Google và mật khẩu đã đặt; dùng hai luồng mật khẩu như thành viên khác |
| Khách | Có tên tạm và phiên riêng; Hồ sơ chỉ có Đăng xuất; không có đổi/khôi phục mật khẩu cho danh tính Khách |
| Đăng ký/onboarding chưa hoàn tất | Không có quyền sử dụng chức năng thành viên |
| Người đang xác minh OTP khôi phục | Chỉ có quyền giới hạn cho yêu cầu khôi phục đó, không có phiên ứng dụng |

## 3. Quy tắc dữ liệu và xác thực dùng chung

| Trường | Quy tắc |
|---|---|
| Username | 3–20 ký tự, `^[a-zA-Z0-9_]{3,20}$`, duy nhất không phân biệt hoa thường; từ chối từ cấm; giữ cách viết hiển thị đã nhập |
| Mật khẩu | tối thiểu 8 ký tự, tối đa 72 byte UTF-8 (khớp giới hạn bcrypt, không bị cắt ngầm; chữ có dấu và biểu tượng chiếm nhiều byte; PO làm rõ 31/10); mọi ô xác nhận phải khớp; không tự trim hoặc đổi hoa/thường mật khẩu. Auth có giới hạn riêng thì báo lỗi thật đã làm sạch, không giả thành công |
| Display Name | Mặc định bằng username, kể cả Google; 2–30 ký tự; chỉ chữ (kể cả tiếng Việt có dấu), số, khoảng trắng và `. - _ '`; tự bỏ khoảng trắng đầu/cuối và gộp khoảng trắng liên tiếp; không emoji, không ký tự điều khiển; không cần duy nhất; từ cấm bị từ chối |
| Tên Khách | 2–20 ký tự, cùng bộ ký tự như Display Name (PO xác nhận 31/10), không cần duy nhất, qua bộ lọc; luôn kèm nhãn “(Khách)” |
| Email | Phân biệt chưa có, đang chờ xác minh, đã xác minh; chỉ trạng thái cuối được dùng khôi phục |
| OTP | 6 chữ số, hạn 180 giây; gửi lại sau 60 giây; tối đa 5 lần bắt đầu gửi trong cửa sổ trượt 60 phút, chung mỗi email chuẩn hóa và UUID tài khoản, kể cả SMTP lỗi; đăng ký ba bước theo nhà cung cấp Auth. Kiểm hạn/quota nguyên tử ở server, không tin đồng hồ client |
| user_id | Bất biến khi đổi mật khẩu, thêm email hoặc đổi Display Name; quan hệ bạn bè/phòng/ván không được tạo lại |

Kiểm tra tại client giúp nhập liệu; máy chủ vẫn kiểm lại mọi quyền, giá trị và trạng thái. Không nhận user_id/email khôi phục do client tự chọn thay cho danh tính đã xác minh.

Không thêm yêu cầu mật khẩu có chữ hoa/số/ký tự đặc biệt hoặc cấm trùng mật khẩu cũ trong tài liệu này. Nếu nhà cung cấp Auth có ràng buộc thực tế khác phải nêu rõ khi tích hợp, không âm thầm báo thành công.

## 4. Đăng ký thường ba bước

### 4.1 Bước 1 — Tài khoản

- Nhập username, mật khẩu, xác nhận mật khẩu; bấm Tiếp tục.
- Sai định dạng, thiếu dữ liệu, mật khẩu ngắn/không khớp hoặc từ cấm: báo tại trường, không đi tiếp.
- Username đã có người dùng, kể cả khác hoa thường: báo “Username đã có người dùng”.
- Kiểm khả dụng ở bước này không giữ chỗ tên; server kiểm lại lúc hoàn tất.

### 4.2 Bước 2 — Email tùy chọn

- Nhập email và Xác nhận Email để gửi OTP; hoặc “Bỏ qua email, vào Sảnh”.
- **Cảnh báo khi bỏ qua (PO 31/10):** bấm “Bỏ qua” (email hoặc OTP) mở khung xác nhận ngay tại bước: “Nếu không có email đã xác minh, bạn sẽ không thể khôi phục mật khẩu.” với hai nút **Vẫn bỏ qua** và **Thêm email**. Không chặn bỏ qua; khung xác nhận này là cách hiểu của cụm "cảnh báo khi bấm Bỏ qua".
- Bỏ qua: hoàn tất tài khoản thành viên bằng credentials hợp lệ, tạo Display Name mặc định, tự đăng nhập; trạng thái chưa có email đã xác minh.
- Email đã thuộc tài khoản khác: “Email này đã được đăng ký”, không gửi OTP và không gộp tài khoản.
- SMTP lỗi/hết hạn mức: báo lỗi thật, được thử lại hoặc bỏ qua; không tạo trạng thái kẹt bắt buộc chờ email.

### 4.3 Bước 3 — OTP tùy chọn

- Hiển thị nhập OTP, hạn 3 phút và gửi lại sau 60 giây.
- OTP đúng, còn hạn và đúng yêu cầu: hoàn tất tài khoản với email đã xác minh, tự đăng nhập.
- OTP sai/hết hạn/bị giới hạn: báo lỗi, hướng dẫn gửi lại khi đủ điều kiện; không gắn email chưa xác minh.
- Chủ động bỏ qua OTP: hoàn tất thành viên không có email đã xác minh, hủy bản đăng ký email tạm an toàn.
- Tên bị người khác lấy trong lúc chờ: từ chối hoàn tất và quay về bước 1; không ghi username trùng.

### 4.4 Hoàn tất, bỏ dở và phục hồi

- Chỉ hoàn tất qua OTP đúng hoặc hành động bỏ qua rõ ràng; đóng tab không phải bỏ qua.
- Bản chưa hoàn tất không dùng được ứng dụng, không giữ username; được dọn khoảng 60–65 phút theo BA.
- Nếu hồ sơ đã ghi hoàn tất nhưng cờ PENDING chưa xóa: phục hồi hoàn tất, không xóa tài khoản; trước phục hồi vẫn chặn dùng sai trạng thái.
- Hoàn tất, phục hồi và dọn cùng danh tính phải được tuần tự hóa để không xóa nhầm khi có race.
- Tài khoản hoàn tất qua bỏ qua không thuộc diện dọn đăng ký tạm; đăng xuất rồi đăng nhập lại vẫn cùng user_id.
- Sau đăng ký đi Sảnh hoặc đích phòng mời hợp lệ theo thứ tự ưu tiên tại mục 11.

## 5. Google và onboarding

- Google có ở Đăng ký/Đăng nhập. Email Google mới đi `/onboarding`, đặt username và mật khẩu; không OTP.
- Email chỉ đọc, username/mật khẩu kiểm theo mục 3; Display Name bằng username, không tự lấy họ tên Google.
- Chỉ “Hoàn tất thiết lập” mới tạo trạng thái thành viên dùng được; onboarding không có nút X, không vượt bằng URL khác.
- Google chưa hoàn tất quá 60 phút được dọn, kiểm mỗi 5 phút khi dịch vụ hoạt động. Không xóa tài khoản cũ/đã hoàn tất/vừa hoàn tất.
- Google đã hoàn tất được đăng nhập bằng Google hoặc username/mật khẩu đã đặt.
- Google trùng email tài khoản đăng ký thường: báo “Email này đã được đăng ký”, không tự liên kết/gộp. Google đăng nhập bằng email mới đi onboarding chứ không báo chưa có tài khoản.
- OAuth bị hủy/lỗi không được báo đã đăng nhập hoặc tạo tài khoản hoàn tất giả.
- Hai luồng đổi/reset mật khẩu chỉ đổi mật khẩu ứng dụng; không thay mật khẩu Google hoặc vô hiệu phương thức Google hợp lệ.

## 6. Đăng nhập username/mật khẩu

- Chỉ nhận username làm tên đăng nhập, không dùng Display Name/email. So username không phân biệt hoa thường; mật khẩu giữ nguyên.
- Sai username hoặc mật khẩu đều báo “Sai tên đăng nhập hoặc mật khẩu”; không trả email hay trạng thái tồn tại qua endpoint đăng nhập.
- Đếm sai theo username chuẩn hóa chữ thường, cả tên không tồn tại. Sai 5 lần trong 15 phút → khóa đăng nhập mật khẩu 15 phút từ lần thứ năm.
- Đang khóa: cả mật khẩu đúng cũng không đăng nhập; báo “Bạn đã thử quá nhiều lần, vui lòng thử lại sau 15 phút”.
- Mật khẩu đúng sau khi đủ điều kiện đăng nhập thành công reset bộ đếm. Google không bị bộ đếm chặn và thành công Google không xóa bộ đếm.
- Ghi nhớ đăng nhập mặc định bật: 30 ngày; bỏ chọn: hết khi đóng trình duyệt hoặc sau 12 giờ, tùy mốc nào trước.
- Đã đăng nhập thành viên vào `/login` hoặc `/register` chuyển về Sảnh; không tạo thêm danh tính.
- Reset mật khẩu thành công (mục 10) **xóa khóa thử sai** của username đó (PO 31/10), nhưng không tự đăng nhập. Đăng nhập Google vẫn không xóa khóa.

## 7. Chế độ Khách

- Chọn Khách, nhập tên tạm hợp lệ → Sảnh hoặc phòng mời đủ điều kiện.
- Cảnh báo không có Ranked/Elo/lịch sử; không giả danh thành viên dù trùng tên.
- Quyền P1: tạo tối đa một phòng đang mở, vào bằng link/mã hoặc Sảnh, chơi online/AI, xem, chat theo vai trò; media chỉ khi ngồi ghế.
- Không kết bạn, không nhận/gửi lời mời bạn bè, không P2, không đổi tên hồ sơ/email/mật khẩu của tài khoản thành viên.
- Phiên 12 giờ trong trình duyệt đang dùng, không Ghi nhớ; chưa hết khi đang ngồi ghế/trong ván, hết sau khi rời nếu đã quá hạn.
- Hết phiên/đăng xuất xóa tên và dữ liệu cá nhân của Khách theo BA; bản ghi ván của đối thủ chính thức giữ danh tính chung “Khách”.
- Đăng xuất rồi đăng ký tạo thành viên mới; không tự chuyển lịch sử hoặc gộp danh tính Khách.

## 8. Hồ sơ và xác minh email sau

- Hiện avatar chữ cái đầu, Display Name, @username và trạng thái email thực; không hiển thị email kỹ thuật.
- Đổi Display Name hợp lệ không cần OTP; sai độ dài/từ cấm không lưu. Đổi tên hiển thị không đổi username.
- Chưa có email hoặc đang chờ xác minh: cảnh báo không modal, liên kết đến Hồ sơ; không chặn chơi hoặc hạ quyền thành viên.
- Nhập/gửi/xác minh email đầu tiên ngay trong Hồ sơ; yêu cầu thuộc danh tính phiên hiện hành.
- OTP thêm email: 180 giây, resend 60 giây, tối đa 5 lần sai/yêu cầu. Mã sai/hết hạn/đã dùng/thuộc yêu cầu khác không gắn email.
- Kiểm trùng khi gửi và hoàn tất. Email đang chờ có thể sửa đích trước xác minh theo BA; không coi pending là địa chỉ khôi phục.
- Xác minh thành công giữ user_id, phiên, ghế/ván và dữ liệu; bỏ cảnh báo sau phản hồi thành công server.
- Email đã xác minh chỉ đọc, không đổi/xóa; thêm email không tạo tài khoản ứng dụng mới hoặc tự gộp với tài khoản khác.
- Đổi mật khẩu mục 9, **Đổi Username và theme mục 18** đều P1. Khách không có các quyền tài khoản/theme bổ sung theo nguồn. Đổi Username không tự đổi Display Name/email, không gia hạn hoặc thu hồi phiên đang hợp lệ.

## 9. Đổi mật khẩu chủ động trong Hồ sơ — P1

### 9.1 Điều kiện và form

Chỉ thành viên có phiên hợp lệ, thao tác trên tài khoản của chính mình. Không bắt buộc có email vì bằng chứng là phiên + mật khẩu cũ. Tài khoản Google dùng mật khẩu ứng dụng đã thiết lập.

Form gồm **Mật khẩu hiện tại**, **Mật khẩu mới**, **Xác nhận mật khẩu mới**, nút **Đổi mật khẩu** và cách hủy/quay lại. Mật khẩu được che; nhãn rõ, cho phép ẩn/hiện theo mẫu form sẵn có. Không hỏi OTP cho luồng này.

### 9.2 Luồng thành công

1. Người dùng đăng nhập → Hồ sơ → Đổi mật khẩu.
2. Nhập đủ ba trường; client kiểm độ dài và hai ô mới khớp.
3. Server xác thực phiên, tài khoản và mật khẩu hiện tại; kiểm lại mật khẩu mới/xác nhận.
4. Đổi mật khẩu cùng danh tính, thu hồi mọi **phiên khác**, giữ **phiên hiện tại**.
5. Báo thành công, xóa giá trị mật khẩu khỏi form; không bắt phiên hiện tại đăng nhập lại.

“Giữ phiên hiện tại” không cấp thêm một hạn 30 ngày/12 giờ mới và không phải đăng nhập từ thiết bị khác. Không tự làm ván của phiên đang giữ bị đầu hàng vì chính thao tác đổi mật khẩu. Tab dùng chung phiên vẫn tuân thủ quyền điều khiển một tab; không nhân bản quyền chơi.

### 9.3 Lỗi và bảo toàn

- Mật khẩu cũ sai: “Mật khẩu hiện tại không đúng”; không đổi mật khẩu, không thu hồi các phiên như thể đã thành công.
- Mật khẩu mới dưới 8 ký tự hoặc xác nhận lệch: lỗi tại trường, không đổi.
- Phiên hết hạn/bị thu hồi hoặc yêu cầu mạo danh user_id: từ chối; không chỉ dựa trên form đang mở.
- Mất mạng/lỗi nhà cung cấp khi đổi hoặc thu hồi phiên: không báo hoàn tất nếu chưa chứng minh đủ hậu điều kiện; không giả rollback hoặc thành công. Khi trạng thái không rõ phải đối soát trước khi xử lý lại.
- Khóa nút khi đang xử lý; lệnh trùng không tạo phiên mới, không kéo dài hạn hoặc làm mất phiên cần giữ.
- Mật khẩu cũ không đăng nhập mới được sau thành công; mật khẩu mới dùng được, vẫn chịu khóa thử sai còn hiệu lực.
- Không đổi user_id, email, username, Display Name, phương thức Google, bạn bè hay dữ liệu ván.

## 10. Quên mật khẩu bằng username và OTP — P1

### 10.1 Yêu cầu mã

1. Tại Đăng nhập chọn **Quên mật khẩu?**, vào `/forgot-password`.
2. Nhập **username**, bấm **Gửi mã khôi phục**; server chuẩn hóa tên giống đăng nhập.
3. Server tra đúng tài khoản, chỉ lấy **email liên hệ đã xác minh đang gắn với tài khoản**. Không cho nhập địa chỉ khác để chuyển hướng mã.
4. Có địa chỉ hợp lệ: gửi OTP thật; chỉ sau khi gửi thành công mới báo đã gửi và chuyển bước nhập mã.
5. Không có/chỉ pending email: **“Tài khoản không có email đã xác minh nên không thể khôi phục mật khẩu.”** Không gửi mã, không tự tạo email hoặc tài khoản mới.
6. Username không tồn tại: dùng cùng thông báo ở bước 5 theo quy ước an toàn mục 1. Định danh Khách không đủ điều kiện.
7. SMTP lỗi/hết hạn mức: **“Không gửi được mã, vui lòng thử lại sau.”** Không giả đã gửi, không đưa lỗi hạ tầng thành kết luận tài khoản thiếu email.

Không trả địa chỉ email đầy đủ cho người chưa xác minh. Mọi dữ liệu yêu cầu đi qua state/trao đổi bảo mật, không đưa mật khẩu, OTP, email hoặc quyền reset lên URL/log.

### 10.2 Xác minh và đặt mật khẩu mới

- `/reset-password` dùng ngữ cảnh yêu cầu khôi phục đã tạo, không tin chỉ username/ID client gửi.
- OTP 6 số/180 giây, gửi lại sau 60 giây; giới hạn xác minh theo BA 1.5 (mục tiêu 5 lần sai qua Supabase, gần đúng, không hứa chính xác từng mã).
- Mã đúng và còn hiệu lực chỉ cho quyền đổi mật khẩu của **tài khoản, yêu cầu và mục đích đó**. Mã đăng ký/thêm email không được dùng thay mã recovery.
- Quyền reset có hạn **10 phút mới tính từ xác minh OTP thành công**, độc lập với hạn OTP gốc 180 giây; dùng một lần, dữ liệu mật khẩu không hợp lệ không tiêu thụ quyền, bước ghi cuối kiểm hạn lại (PO chốt trong lượt triển khai 31/10).
- Chưa xác minh OTP không đổi mật khẩu dù gọi API trực tiếp; mở URL reset không tự có quyền.
- Sau xác minh, nhập **Mật khẩu mới** + **Xác nhận mật khẩu mới**, tối thiểu 8 ký tự và tối đa 72 byte UTF-8 (mục 3), khớp nhau. Không yêu cầu mật khẩu cũ.
- Thành công: đổi mật khẩu cùng user_id, vô hiệu quyền reset đã dùng, thu hồi các phiên đăng nhập cũ, **xóa khóa thử sai của username**, thông báo và về `/login`; phải đăng nhập bằng mật khẩu mới.
- Không tạo phiên ứng dụng từ OTP hoặc tự vào Sảnh/phòng mời. Đăng nhập thực sự tiếp theo mới áp luật thiết bị/vị trí chơi.

### 10.3 Sai mã, hết hạn và tranh chấp

- OTP sai/hết hạn/đã dùng hoặc thuộc yêu cầu khác: không reset, báo lỗi và hướng dẫn gửi lại khi đủ điều kiện.
- Gửi lại không được biến mã cũ đã vô hiệu thành hợp lệ; xác minh/đổi cuối phải kiểm trạng thái hiện tại ở server.
- Đổi username trên client, trộn mã của tài khoản khác hoặc tái dùng quyền reset không đổi được tài khoản đích.
- Hủy/đóng trang hoặc lỗi xác nhận mật khẩu trước khi hoàn tất không đổi mật khẩu/thu hồi phiên như thành công.
- Reset cuối cùng trùng hoặc đồng thời không tạo thêm quyền/phiên; không để hai yêu cầu cũ tiếp tục đổi mật khẩu sau khi quyền đã dùng/hết hiệu lực.
- Cập nhật credentials và thu hồi phiên có thể qua nhiều hệ thống; lỗi một phần phải được xử lý/đối soát và báo đúng, không cam kết transaction DB đơn lẻ thay thế toàn bộ Auth.
- Thu hồi phiên cũ phải có hiệu lực ở server/API/socket và refresh, không chỉ xóa localStorage của trình duyệt đang recovery. Hậu quả tới phòng/ván theo luật phiên/mất kết nối hiện hành, không tự ghi RESIGN do người dùng chưa bấm đầu hàng.

## 11. Phiên, điều hướng và đăng xuất

| Sự kiện | Kết quả bắt buộc |
|---|---|
| Dùng app/refresh token | Không gia hạn mốc phiên cố định |
| Hết phiên giữa ván online | Mất quyền điều khiển; ân hạn 60 giây, đồng hồ chạy; đúng tài khoản/cùng thiết bị quay lại trong hạn được tiếp tục |
| Hết phiên giữa AI | Giữ ván theo hạn 30 phút hiện hành |
| Tab mới cùng phòng | Tiếp quản; tab cũ chỉ đọc, media dừng; tab mới media mặc định tắt |
| Tab cũ reconnect | Không tự giành quyền |
| Đăng nhập thành công thiết bị khác giữa ván | Xử thua ngay ván cũ, đăng xuất thiết bị cũ; thiết bị mới về Sảnh. **Luật tạm tắt khi phát triển (mục 20.3).** **Thiết bị = mỗi trình duyệt** (kể cả hồ sơ trình duyệt khác và cửa sổ ẩn danh), xem mục 20 |
| Thiết bị khác khi chỉ ở phòng chờ | Rời ghế/đăng xuất thiết bị cũ, không ghi thua; thiết bị mới về Sảnh |
| Đổi mật khẩu Hồ sơ | Giữ phiên thực hiện, thu hồi phiên khác; không tự gia hạn/đăng nhập khác thiết bị |
| Reset mật khẩu | Thu hồi phiên cũ; recovery không có quyền chơi, về Login |
| Đổi Username qua OTP | Giữ mọi phiên hợp lệ/hạn cũ, không gián đoạn ván; đăng nhập mới dùng Username mới, không dùng tên cũ vì đang giữ chỗ |
| Chủ động chuyển media giữa tab | Hộp Chuyển/Hủy P1 theo mục 18; không tự giành quyền khi hủy/reconnect |
| Đăng xuất chủ động giữa ván | Xác nhận đầu hàng; đồng ý mới RESIGN/rời/đăng xuất; hủy giữ nguyên |
| Đăng xuất phòng chờ | Rời theo vòng đời phòng, không ghi thua |

Một tài khoản chỉ có một vị trí ngồi chơi, kể cả AI; server từ chối vào vị trí thứ hai, không chỉ disabled UI. Banner Sảnh cho quay lại phòng/ván dở.

Link mời qua đăng ký/đăng nhập/Khách phải giữ đích. Tuy nhiên luật phiên/vị trí chơi kiểm trước: khác thiết bị đang đấu thì về Sảnh theo luật, không tự tiếp tục vào phòng mời. Recovery OTP không tự thực hiện chuyển hướng như đăng nhập thành công.

## 12. Bảo mật, dữ liệu và giới hạn đã biết

- Không log/lưu mật khẩu thô, OTP, token hoặc nội dung nhạy cảm trong URL, thông báo lỗi, bằng chứng và analytics. Hash/xác thực mật khẩu theo nhà cung cấp Auth, không tự tạo bảng mật khẩu thô.
- Rate limit gửi/xác minh OTP và đăng nhập phải thực thi phía server/nhà cung cấp; nút đếm ngược không thay thế giới hạn thật. Không tự áp bộ đếm khóa đăng nhập sang đổi mật khẩu nếu chưa có thiết kế tương ứng.
- Quyền đổi/reset phải bị giới hạn mục đích và danh tính, không dùng token recovery như phiên thường; recheck ở thao tác ghi cuối.
- Sai mật khẩu/OTP hoặc lỗi mạng không xóa dữ liệu người dùng, không tự gộp tài khoản hoặc sửa email.
- Thông báo cụ thể thiếu email đã xác minh là lựa chọn PO sau khi được cảnh báo: có thể phân biệt nhóm username đủ điều kiện gửi OTP với nhóm không đủ điều kiện. Không dùng điều đó để nới thông báo đăng nhập hoặc trả email đích; cần đo/giới hạn lạm dụng thực tế.
- Không có email đã xác minh và quên mật khẩu: không có luồng khôi phục bằng email. Nếu còn phương thức Google hợp lệ có thể đăng nhập Google theo chức năng hiện hành; tài liệu không hứa khôi phục được tài khoản mất mọi bằng chứng.
- Hạn P1 không đổi dù tăng phạm vi. 880 giờ/71 Task/268 AC và ma trận màn hình cũ là baseline kế hoạch; chưa cập nhật Jira/ước lượng, không báo các chức năng mới đã nằm sẵn trong công suất đó.

## 13. Giao diện và thông báo

| Bề mặt | Nội dung YC1 P1 |
|---|---|
| SCR-LOGIN `/login` | Username, mật khẩu, ghi nhớ, Google, Khách, Đăng ký, **Quên mật khẩu hoạt động**, link **Quên tên đăng nhập?** |
| SCR-REGISTER `/register` | Wizard ba bước, bỏ qua tại bước email/OTP |
| SCR-ONBOARDING `/onboarding` | Email Google chỉ đọc, username/mật khẩu, Hoàn tất thiết lập |
| MODAL-GUEST-NAME | Tên Khách và cảnh báo quyền |
| SCR-PROFILE-SETTINGS `/settings` | Display Name, @username, email/xác minh, Đổi mật khẩu, **Đổi Username qua OTP**, **bộ chọn theme** và Đăng xuất |
| SCR-FORGOT-PASSWORD `/forgot-password` | Hai tab: **Quên mật khẩu** (username, Gửi mã, trạng thái lỗi/thiếu email/gửi thành công) và **Quên tên đăng nhập** (email, OTP, hiện Username) |
| SCR-RESET-PASSWORD `/reset-password` | OTP → mật khẩu mới/xác nhận → về đăng nhập |

**Khôi phục Username bằng email cũng thuộc P1** theo 0.21, nhưng là luồng/mục đích riêng, không thay ô Username của Quên mật khẩu. OTP tìm tên không cấp quyền reset hoặc đăng nhập.

Tất cả form có nhãn, lỗi tiếng Việt gắn trường, focus/bàn phím và reduced motion phù hợp; responsive từ 360 px. Loading khóa gửi trùng nhưng không để mất đường xử lý lỗi. Trạng thái rỗng/chưa có email phải có giải thích, không nhầm là lỗi tải dữ liệu. Không dùng “Sắp ra mắt” cho hai chức năng mật khẩu P1 đã được duyệt.

Thông báo câu chữ trong mục 9–10 là bản chuẩn hóa chính tả từ yêu cầu PO, không thay nội dung nghiệp vụ. Không tự tiết lộ email đầy đủ ở form khôi phục.

## 14. Truy vết nghiệm thu YC1

### 14.1 Yêu cầu nền đã có

| Nhóm | AC nguồn | Kịch bản bắt buộc |
|---|---|---|
| Đăng ký | AC-01.1.1–15 | Định dạng/trùng/từ cấm, mật khẩu, OTP, SMTP thật/lỗi, bỏ qua cả hai bước, race tên, dọn/phục hồi không xóa nhầm |
| Đăng nhập | AC-01.2.1–9 | Hoa thường username, thông báo chung, khóa lần thứ năm, tên không tồn tại, thời hạn phiên, Google không reset khóa |
| Google/Khách | AC-01.3.1–15 | Google thật, onboarding/dọn, không gộp, hai cách đăng nhập, tên/phiên/quyền Khách và link mời |
| Hồ sơ/phiên | AC-01.4.1–21 | Một vị trí, tab/thiết bị, expiry, logout/đầu hàng, Display Name, thêm email giữ user_id và ghế |

Các mã nguồn giữ nguyên; yêu cầu mật khẩu dưới đây bổ sung, không tái sử dụng mã cũ để thay nghĩa. Thông báo đăng nhập chống dò và phản hồi quên mật khẩu cụ thể là hai chính sách khác nhau.

### 14.2 Tiêu chí bổ sung mật khẩu

Mã `AC-YC1-MK-*` dùng cho tài liệu đặc tả và bổ sung backlog P1; không phải mã Jira hoặc chứng nhận PASS.

| Mã | Given / When | Then bắt buộc |
|---|---|---|
| AC-YC1-MK-01 | Thành viên có phiên hợp lệ mở Hồ sơ | Có Đổi mật khẩu với ba trường cũ/mới/xác nhận; không bắt có email/OTP |
| AC-YC1-MK-02 | Chưa đăng nhập, Khách hoặc mạo danh người khác gọi đổi mật khẩu | Server từ chối, credentials và phiên chủ tài khoản không bị đổi |
| AC-YC1-MK-03 | Nhập sai mật khẩu cũ | Báo lỗi; không đổi và không thu hồi phiên như thành công |
| AC-YC1-MK-04 | Mật khẩu mới dưới 8 ký tự hoặc xác nhận lệch | Từ chối ở client và server; không đổi |
| AC-YC1-MK-05 | Đổi chủ động hợp lệ | Mật khẩu mới có hiệu lực, cũ không dùng đăng nhập mới; user_id và dữ liệu không đổi |
| AC-YC1-MK-06 | Đổi chủ động có nhiều phiên | Phiên thực hiện còn dùng được với hạn cũ; các phiên khác mất quyền API/socket/refresh, không chỉ UI |
| AC-YC1-MK-07 | Đổi chủ động khi phiên hiện tại đang có ván | Không tự gia hạn phiên, không tạo đăng nhập thiết bị khác hoặc tự RESIGN ván hiện tại |
| AC-YC1-MK-08 | Auth lỗi hoặc thu hồi phiên chưa hoàn tất | Không báo hoàn tất giả; đối soát được kết quả, retry không tạo danh tính/phiên mới |
| AC-YC1-MK-09 | Mở Quên mật khẩu và nhập username khác hoa thường | Tra cùng tài khoản; không yêu cầu nhập email đích |
| AC-YC1-MK-10 | Username không có email, email pending hoặc không tồn tại | Không gửi OTP, không đổi; hiện thông báo không khôi phục được theo mục 10.1 |
| AC-YC1-MK-11 | Tài khoản có email đã xác minh, yêu cầu hợp lệ | OTP thật tới đúng email đó; không lộ email đầy đủ và không gửi theo địa chỉ client giả |
| AC-YC1-MK-12 | SMTP lỗi/hết hạn mức hoặc gửi lại trước 60 giây | Báo lỗi/giới hạn thật; không giả đã gửi hoặc gắn email; không reset mật khẩu |
| AC-YC1-MK-13 | OTP sai, hết 180 giây, dùng rồi, khác tài khoản/mục đích | Không reset, không cấp quyền app; báo lỗi và giới hạn theo BA 1.5 |
| AC-YC1-MK-14 | Chưa xác minh OTP nhưng gọi trực tiếp bước đặt mật khẩu | Bị từ chối dù biết username/URL hoặc sửa request |
| AC-YC1-MK-15 | OTP đúng nhưng mật khẩu mới ngắn/không khớp | Không đổi, không coi hoàn tất; chỉ tiếp tục trong ngữ cảnh reset hợp lệ |
| AC-YC1-MK-16 | Reset hợp lệ tới bước cuối | Cập nhật cùng tài khoản, thu hồi phiên cũ, vô hiệu quyền reset, về Login; không tự vào app |
| AC-YC1-MK-17 | Sau reset, dùng mật khẩu cũ/mới và phiên cũ | Cũ thất bại; mới đăng nhập được vì khóa thử sai đã được xóa (mục 20); phiên cũ không dùng lại qua refresh/socket |
| AC-YC1-MK-18 | Gửi lặp/chấp nhận muộn hoặc trộn yêu cầu sau hoàn tất | Không reset lại bằng quyền đã dùng và không tác động tài khoản khác |
| AC-YC1-MK-19 | Tài khoản Google hoàn tất đổi/reset mật khẩu ứng dụng | Cùng user_id; không đổi mật khẩu Google hoặc tự gộp, Google hợp lệ vẫn đăng nhập được |
| AC-YC1-MK-20 | Thao tác cả hai luồng, quan sát form/URL/log/dữ liệu | Không lộ secret; lỗi không làm mất dữ liệu; UI bàn phím/360 px và thông báo phù hợp |

### 14.3 Bằng chứng hoàn thành

- Kiểm code/server thật cho các nhánh quyền, hạn, race, trùng và thu hồi phiên; không chỉ test form hoặc mock lời đáp.
- SMTP tới email ngoài nhóm, OTP thật; Google thật; kiểm API/socket/refresh/RLS trên môi trường được phép.
- Đối chiếu dữ liệu trước/sau: danh tính, email, bạn bè, ván và phiên không bị hỏng; đặc biệt đăng ký bỏ qua và thêm email sau.
- Ghi PASS/FAIL/BLOCKED từng ca với môi trường, bản dựng, ngày và bằng chứng; chưa chạy thì ghi chưa chạy, không dùng sự tồn tại của tài liệu để đóng Task.
- Hồi quy D1–D4 và D10 cùng các luồng phiên/phòng bị ảnh hưởng; nghiệm thu P1 tổng vẫn cần D1–D14 và NFR/gate liên quan.

## 15. Phạm vi tác động triển khai

Danh sách dưới đây là ranh giới cần đối chiếu khi triển khai; trạng thái kiểm chứng thực tế nằm ở mục 17, không suy PASS chỉ từ sự tồn tại của code.

| Khu vực | Công việc liên quan |
|---|---|
| Web auth/profile/router | Form và điều hướng hai luồng, trạng thái lỗi/OTP, giữ đúng phiên hiện tại |
| Server auth/login/profile/session | Kiểm mật khẩu cũ, lookup username, điều kiện email, quyền reset hạn chế, thu hồi phiên đúng phạm vi |
| Auth/SMTP | Đổi credentials thật, gửi mã thật, không biến OTP recovery thành phiên app |
| Shared contracts | Request/response/error dùng chung, không để client quyết tài khoản hoặc email đích |
| Database/store/realtime | Chỉ thêm schema nếu hiện trạng cần; giữ user_id, xử lý concurrency và socket/refresh của phiên thu hồi |
| Test/fixture | Bổ sung 20 tiêu chí mật khẩu, hồi quy đăng ký/Google/phiên; dữ liệu cô lập, không trỏ test xóa schema vào Supabase thật |
| Docs/design/backlog | Đồng bộ BA 0.21/P1, giữ mã AC nguồn; tách OTP tìm Username/đổi Username/reset mật khẩu, bằng chứng và kế hoạch |

Không thêm abstraction, hàng đợi, logging hoặc dependency chỉ để “chuẩn bị tương lai”. Không giả có API/endpoint/migration hoặc kết quả chạy thật trong tài liệu yêu cầu.

## 16. Trạng thái review và bước tiếp theo

- Đã chốt: đăng ký ba bước; hai chức năng mật khẩu thuộc P1; recovery nhập username; thông báo thiếu email; đổi chủ động giữ phiên hiện tại/thu hồi phiên khác; recovery về Login.
- Đã đối chiếu baseline Google/onboarding, khóa đăng nhập, Khách và Hồ sơ/email; phiên/thiết bị có kiểm thử API/socket và ván online/AI trên PostgreSQL local. Khách quá 12 giờ còn ghế PLAYER được ở lại cả WAITING lẫn PLAYING; rời ghế mới kết thúc phiên deferred.
- Quy ước xử lý an toàn đã nêu công khai: username không tồn tại cùng phản hồi thiếu email; không giới hạn nhà cung cấp email vào riêng Gmail; đổi chủ động không kéo dài hạn phiên.
- Đã triển khai và commit từng bước theo yêu cầu PO. Sau khi PO chọn chạy trên Supabase XIANGQI hiện tại, đã áp đúng hai migration mật khẩu/thiết bị bằng CLI; không chạy fixture/reset trên Cloud, chưa push.
- Chưa nghiệm thu toàn bộ YC1 trên dịch vụ thật: còn Google OAuth và nhận OTP qua hộp thư được phép; GoTrue tự host đã kiểm chứng luồng mật khẩu nhưng chưa thay nghiệm thu bản triển khai Supabase Cloud. Chỉ chuyển YC2 sau khi YC1 được đánh giá và xử lý theo phạm vi giao; chỉ sang P2 khi P1 ổn.

## 17. Bằng chứng triển khai và kiểm chứng local

### 17.1 Môi trường và phạm vi bằng chứng

- Node 22.22.3; PostgreSQL 17 cô lập theo `tests/server/db.sh`. Auth HTTP fixture dùng JWT ES256/JWKS và adapter `SupabaseAuth` thật; không gọi fixture này là GoTrue thật.
- Hồi quy cuối: **158/158 file, 1.917/1.917 test đạt** bằng lệnh `fnm exec --using 22 bash tests/server/db.sh test tests/server/game tests/server/account tests/server/core/layering.test.ts tests/web/features/auth tests/web/features/profile tests/web/features/lobby tests/web/features/media tests/web/app tests/web/shared/navigation`. Phạm vi gồm cả hồi quy game liên quan, không phải 1.917 yêu cầu YC1.
- Typecheck toàn monorepo và ESLint toàn bộ file TypeScript thay đổi đạt.
- Trình duyệt 360 px, Vite + Nest + PostgreSQL local: username không đủ điều kiện báo đúng câu; OTP → nhập mật khẩu mới → xác nhận lệch bị chặn → reset thành công về Login có thông báo. Hồ sơ: mật khẩu cũ sai bị chặn; đổi thành công xóa ba ô; reload vẫn đăng nhập; không tràn ngang.
- SMTP thật: xác thực kết nối thành công, **không gửi thư**. Chưa có bằng chứng thời gian thư tới hộp thư, spam hoặc hạn mức năm địa chỉ/giờ.
- Sau khi PO chọn tiếp tục trên môi trường thử, đã khởi động Docker và chạy **GoTrue v2.197.0 thật + PostgreSQL 17 riêng**, áp baseline và toàn bộ migration repo. Adapter `SupabaseAuth` xác minh ES256/JWKS thật; đổi mật khẩu giữ capability/hạn, mật khẩu cũ bị từ chối, refresh token thay thế dùng được. Recovery qua service thu hồi capability cũ; mật khẩu mới đăng nhập và refresh thành công. Mailer ở smoke này chỉ thu OTP, **không gửi thư ngoài**; chưa chạy Google hoặc ghi Supabase Cloud.
- Smoke ngoài vitest: Nest/PostgreSQL/Socket.IO + Auth HTTP fixture; login thiết bị khác kết thúc phòng chờ cũ, API cũ 401, API mới 200, socket cũ đóng; logout xong API mới 401. Kiểm thử DB trong `session-seat.test.ts` xác nhận rollback migration thiết bị giữ tài khoản, capability và ghế; áp lại không mất phiên.
- Lượt hồi quy xanh vẫn phát log `realtime_disconnect_failed`, `realtime_maintenance_failed`, `registration_maintenance_failed` và cảnh báo navigation của jsdom. Không che log, không tính việc test xanh là bằng chứng vận hành production không lỗi.
- Đã áp `20261030000001_password_recovery.sql` và `20261031000001_session_devices.sql` trên project XIANGQI `snsnkoicxmubuotcdafi` sau xác nhận riêng của PO. Đã kiểm tra lại ba thành phần schema và lịch sử migration; không repair lịch sử cũ. Web chạy `http://localhost:5173`; `/api/health` trả 200/database ok, `/api/ready` trả 200/runtime ok. Việc chạy được không thay nghiệm thu OTP/Google. Có rollback tương ứng; chưa push hoặc chuyển Jira Done.

### 17.2 Truy vết hai luồng mật khẩu

| AC | Bằng chứng local | Giới hạn |
|---|---|---|
| MK-01–04 | `password-change.test.ts`, `password-recovery.test.ts` phía web; quyền, mật khẩu cũ, validation; Hồ sơ trên trình duyệt | Không thay cho screen reader thực tế |
| MK-05–06 | `password-change.test.ts`: giữ profile/user_id/capability/hạn, thay refresh cookie, thu hồi phiên khác; smoke GoTrue thật xác nhận mật khẩu cũ bị từ chối, refresh mới dùng được và hạn không đổi | Chưa nghiệm thu bản triển khai Supabase Cloud |
| MK-07 | `game/account-session.test.ts`: đổi mật khẩu trong ván online giữ ACTIVE/outcome null, socket, capability và hạn cũ | Provider là synthetic; không suy đã nghiệm thu Auth thật |
| MK-08 | Lỗi ghi trước/sau commit; đối soát; checkpoint HMAC cho retry khi credentials đã đổi nhưng cấp token lỗi | Không cam kết transaction phân tán Auth/Postgres |
| MK-09–10 | Username hoa thường, không tồn tại/thiếu email/pending, địa chỉ kỹ thuật bị loại | Chính sách phản hồi có rủi ro dò điều kiện khôi phục đã được PO chấp nhận |
| MK-11–14 | Contact đúng tài khoản, không nhận email/user_id giả, hash/HMAC, cooldown, 5 lần sai, 180 giây, không dùng OTP làm phiên app | Giao OTP tới hộp thư ngoài nhóm: **BLOCKED** chờ email thử được phép và quan sát hộp thư |
| MK-15–18 | Validation không tiêu thụ quyền; reset một lần, replay/trộn tài khoản/concurrent bị chặn, thu hồi phiên và lỗi Auth không báo thành công giả; GoTrue thật xác nhận mật khẩu mới đăng nhập/refresh được, capability cũ mất quyền | OTP trong smoke GoTrue được thu ở mailer boundary, không thay nghiệm thu nhận thư |
| MK-19 | Đổi/reset giữ `account_origins` của Google và cùng user_id; username/password mới dùng được qua Auth fixture | Google OAuth thật sau đổi/reset: **BLOCKED** chờ phiên Google được phép |
| MK-20 | Secret staged không khớp các giá trị bí mật môi trường; API không trả email; UI 360 px, form có nhãn/focus/lỗi và không lưu capability lên URL/storage | Chưa kiểm screen reader hoặc hai thiết bị vật lý |

Các đường dẫn kiểm thử backend ở `tests/server/account/password/`, frontend ở
`tests/web/features/auth/password-recovery.test.ts`; chi tiết thiết kế và hậu quả
lỗi một phần ở [tài liệu đăng nhập](../engineering/server/login.md).

### 17.3 Truy vết 60 AC nền

Đường dẫn rút gọn: `account/` = `tests/server/account/`, `game/` =
`tests/server/game/`, `web/` = `tests/web/`. Có kiểm thử không đồng nghĩa đã PASS
gate môi trường thật; cột cuối nêu phần chưa được local chứng minh.

| AC | Bộ kiểm thử / kịch bản local | Giới hạn nghiệm thu |
|---|---|---|
| 01.1.1 | `account/auth/registration.service.test.ts`, `web/features/auth/RegistrationPage.test.ts`: định dạng/từ cấm | — |
| 01.1.2 | Cùng hai bộ: trùng tên, kiểm availability, hoa thường | — |
| 01.1.3 | `RegistrationPage.test.ts`: ngắn/xác nhận lệch không sang bước | — |
| 01.1.4 | `registration.service.test.ts`, `RegistrationPage.test.ts`: email đã dùng không gửi OTP | — |
| 01.1.5 | HTTP Auth fixture + đồng hồ OTP trên form | Giao OTP tới Gmail ngoài nhóm chưa kiểm |
| 01.1.6 | `account/auth/schema.test.ts`: kích hoạt/profile/user_id; router giữ đích | Auth/SMTP thật chưa kiểm |
| 01.1.7 | `registration.service.test.ts`, `RegistrationPage.test.ts`: sai/hết hạn/giới hạn | Ngưỡng provider thật chưa đo |
| 01.1.8 | `RegistrationPage.test.ts`: resend 60 giây; server kiểm lại | — |
| 01.1.9 | `schema.test.ts`, `registration.service.test.ts`: phục hồi completed-pending, dọn 60–65 phút, race | — |
| 01.1.10 | `registration.service.test.ts`, `RegistrationPage.test.ts`: tên bị lấy lúc chờ OTP | — |
| 01.1.11 | Template/cấu hình có sẵn; SMTP verify kết nối đạt | **BLOCKED:** chưa quan sát inbox, spam, tên/nội dung thư và thời gian nhận |
| 01.1.12 | Không dùng synthetic count để thay bằng chứng gửi thật | **BLOCKED:** chưa có năm địa chỉ thử được phép/hộp thư quan sát |
| 01.1.13 | `registration.service.test.ts`, `RegistrationPage.test.ts`: provider lỗi, báo lỗi an toàn | — |
| 01.1.14 | `account/email/username-registration.test.ts`, `RegistrationPage.optional-email.test.ts`: skip hai bước, không contact verified | — |
| 01.1.15 | `username-registration.test.ts`: đăng nhập lại cùng user_id; smoke trình duyệt skip đã ghi tại tài liệu login | Provider thật chưa kiểm trong lượt này |
| 01.2.1 | `account/login/login.test.ts`: username hoa thường | — |
| 01.2.2 | `login.test.ts`, `timing.test.ts`: cùng lỗi và sàn thời gian | Không suy độ trễ GoTrue thật từ fixture |
| 01.2.3 | `login.test.ts`: lần sai thứ năm khóa 15 phút | — |
| 01.2.4 | `login.test.ts`: đúng mật khẩu trong khóa vẫn bị chặn | — |
| 01.2.5 | `login.test.ts`: username không tồn tại cũng bị khóa | — |
| 01.2.6 | `login.test.ts`: thành công xóa failures | — |
| 01.2.7 | `login.test.ts`, `login-cookies.test.ts`, `account/session/cookies.test.ts`: 30 ngày/12 giờ, cookie không ghi nhớ | Đóng/mở trình duyệt có bật session restore chưa nghiệm thu |
| 01.2.8 | `web/shared/navigation/routes.test.ts`: thành viên mở Login/Register về Sảnh | — |
| 01.2.9 | `account/google/google.test-cases.ts`: Google qua khóa, failures không đổi | Google OAuth thật chưa kiểm |
| 01.3.1 | `account/google/google-http.test.ts`, `web/features/auth/GoogleOnboardingPage.test.ts`: pending/email chỉ đọc/không OTP | Google popup/token thật chưa kiểm |
| 01.3.2 | `google.test-cases.ts`, `GoogleOnboardingPage.test.ts`: username/password, từ cấm, Display Name | — |
| 01.3.3 | `google.test-cases.ts`: email-origin collision, identity rollback | Không gọi provider tự liên kết thật để thử trên dữ liệu người dùng |
| 01.3.4 | `google.test-cases.ts`: completed member đăng nhập Google | Google OAuth thật chưa kiểm |
| 01.3.5 | `google.test-cases.ts`: onboarding rồi LoginService username/password cùng user_id | Boundary Google/password provider là synthetic |
| 01.3.6 | `GoogleOnboardingPage.test.ts`, `routes.test.ts`: pending không vào app | — |
| 01.3.7 | `google.test-cases.ts`: expiry, cleanup race, không xóa completed | — |
| 01.3.8 | Nội dung dưới nút Khách trong `LoginPage.tsx`; không tạo test pin nguyên câu chữ | Kiểm thị giác độc lập vẫn cần khi nghiệm thu tổng |
| 01.3.9 | `account/guest/guest.test-cases.ts`, `account/guest/guest-http.test.ts`, `GuestNameDialog.test.ts` | Nhãn mọi bề mặt cần tổng duyệt P1 |
| 01.3.10 | `guest.test-cases.ts`, `GuestNameDialog.test.ts`: độ dài/từ cấm, lỗi tại ô | — |
| 01.3.11 | `game/guest-runtime.test.ts`, `game/room/guest-room-auth.test.ts`: giới hạn phòng Khách | Tooltip/nhãn giữ theo mẫu Sảnh |
| 01.3.12 | `guest.test-cases.ts`, `guest-http.test.ts`, `game/guest-runtime.test.ts`: 12 giờ deferred khi giữ ghế, cả WAITING ban đầu và WAITING sau ván; logout rời ghế mới dọn | — |
| 01.3.13 | `guest-http.test.ts`, `game/guest-runtime.test.ts`: logout/expiry dọn PII | — |
| 01.3.14 | Cùng ca Google qua khóa ở 01.2.9 | Google OAuth thật chưa kiểm |
| 01.3.15 | `web/app/AppRouter.test.ts`: Khách tiếp tục lời mời đúng một lần | — |
| 01.4.1 | `login.test.ts`, `web/features/auth/SessionProvider.test.ts`: refresh giữ hạn | — |
| 01.4.2 | `game/account-session.test.ts`: PLAYING hết phiên, socket đóng, clock không reset, cùng thiết bị tiếp tục | Không phải hai thiết bị vật lý |
| 01.4.3 | `game/account-session.test.ts`, `game/ai/ai-presence.test.ts`: AI giữ 30 phút/cùng thiết bị tiếp tục | — |
| 01.4.4 | `game/account-session.test.ts`: online/AI RESIGN, thu hồi socket/API; `AppRouter.test.ts`: displaced về Sảnh | Socket idle đóng theo nhịp kiểm, quyền lệnh bị từ chối ngay qua DB |
| 01.4.5 | `game/room/session-seat.test.ts`: WAITING rời ghế, không kết quả thua | — |
| 01.4.6 | `game/room/room.test.ts`, `game/ai/ai-reservations.test.ts`; `web/features/lobby/LobbyShell.test.ts` | Hồi quy liên miền, không chỉ disabled UI |
| 01.4.7 | `web/app/AppRouter.test.ts`, `LobbyShell.test.ts`: banner trở lại phòng/AI | — |
| 01.4.8 | `game/account-session.test.ts`: server 409/hủy giữ nguyên/đồng ý RESIGN; `AppRouter.test.ts` | — |
| 01.4.9 | `game/room/session-seat.test.ts`: WAITING logout không ghi thua | — |
| 01.4.10 | `account/profile/profile.test.ts`, `ProfilePage.test.ts`: cập nhật Display Name | — |
| 01.4.11 | Cùng hai bộ: giới hạn/từ cấm không ghi | — |
| 01.4.12 | `ProfilePage.test.ts`, `EmailVerification.test.ts`; Hồ sơ trình duyệt đã xem | — |
| 01.4.13 | `AppRouter.test.ts`, `account-session.test.ts`: logout từ Hồ sơ dùng cùng gate | — |
| 01.4.14 | `AppRouter.test.ts`, `ProfilePage.test.ts`: Khách không Bạn bè/settings thành viên | — |
| 01.4.15 | `account/friend/friend.test.ts`: loại Khách khỏi tìm kiếm/từ chối lời mời đích Khách | — |
| 01.4.16 | `AppRouter.test.ts`, `room.test.ts`: vị trí đang giữ ưu tiên hơn phòng mời | — |
| 01.4.17 | `LobbyShell.test.ts`, `game/ai/ai-reservations.test.ts`: đang ngồi online không tạo AI | — |
| 01.4.18 | `SessionProvider.test.ts`, `ProfilePage.test.ts`: thiếu/pending email không hạ quyền, không hiện credential kỹ thuật | — |
| 01.4.19 | `account/email/email.test.ts`, `EmailVerification.test.ts`: cooldown/hạn/SMTP lỗi | Thư thực tới inbox chưa kiểm |
| 01.4.20 | `email.test.ts`: cùng user_id/credential; `game/account-session.test.ts`: xác minh contact khi đang đấu giữ credential kỹ thuật, capability/hạn, ghế, ván và socket; UI reload bỏ cảnh báo | Giao OTP qua SMTP thật chưa nghiệm thu |
| 01.4.21 | `email.test.ts`: sai/hết hạn/dùng lại/khác user/5 lần sai/trùng | — |

## 18. Bổ sung P1 theo BA 0.21

**Đã triển khai và kiểm chứng local; bằng chứng tại mục 19.** Giữ mã Story/Jira/AC cũ tại [BACKLOG-P2.md](BACKLOG-P2.md); bốn phần đã chuyển vào [Backlog P1](BACKLOG-P1.md), tên `P2` trong mã không còn chỉ phân kỳ. Không tự đổi lịch/giờ/Jira hoặc coi bằng chứng baseline mục 17 bao gồm các phần này.

### 18.1 Khôi phục Username — US-P2-21 / XIAN-135

- Tại `/login` chọn link “Quên tên đăng nhập?” (mở tab thứ hai của `/forgot-password`, không thêm route), nhập email liên hệ đã xác minh. Phản hồi chung có/không tài khoản: “Nếu email này đã đăng ký, mã khôi phục đã được gửi”; không lộ Username/presence trước xác minh.
- OTP 6 số/180 giây, resend 60 giây, giới hạn theo BA 1.5. Sai/hết hạn/khác tài khoản/mục đích/đã dùng không mở quyền. Email/OTP/capability không nằm trên URL/log.
- PO làm rõ 31/10: luôn giữ phản hồi chung cả khi SMTP lỗi hoặc quota bị chặn; máy chủ vẫn giới hạn thật, không dùng phản hồi để xác nhận email có tài khoản.
- Mã đúng chỉ hiện **Username hiện tại**, không tự đổi mật khẩu/cấp phiên app. Về Login dùng mật khẩu hiện có; muốn reset phải chủ động vào Quên mật khẩu P1 bằng Username vừa tìm, dùng quyền riêng. Tài khoản Google có email hợp lệ cũng dùng được; Khách/không email verified không có đường này.
- Nghiệm thu **AC-P2-21.1–3**: phản hồi không dò email, OTP thật/giới hạn/lỗi SMTP, đổi tên trong khi recovery chờ, không lộ tên trước OTP, không nâng quyền thành login/reset.

### 18.2 Đổi Username qua OTP — US-P2-20 / XIAN-134

- Hồ sơ → Đổi Username → gửi mã tới **email đã xác minh của chính tài khoản** → xác minh → nhập/xác nhận tên mới. Không có email hợp lệ dẫn đến thêm/xác minh; không cho nhập email tùy ý để nhận OTP đổi tên.
- Tên mới 3–20 ký tự, mẫu/từ cấm/unique không phân biệt hoa thường như đăng ký; recheck khi ghi, không coi kiểm trước là giữ chỗ. **Tối đa 1 lần đổi mỗi 7 ngày (PO 31/10):** tính từ lần đổi thành công gần nhất; lấy lại tên cũ trong 30 ngày cũng tính một lần đổi. Vượt giới hạn: “Bạn vừa đổi Username, vui lòng thử lại sau {n} ngày”, không gửi OTP.
- Tên cũ giữ **30 ngày** chỉ chủ cũ lấy lại; người khác thấy đã có người dùng; đúng hạn mới giải phóng. Giữ chỗ không phải alias đăng nhập; đăng nhập mới dùng Username hiện tại.
- Sau OTP đúng, quyền đổi tên có hạn **10 phút tính từ xác minh thành công**, cùng hạn với quyền reset mật khẩu nhưng khác mục đích; tên trùng/không hợp lệ không tiêu thụ quyền, ghi cuối kiểm hạn/cooldown lại (PO làm rõ 31/10).
- Giữ UUID/bạn bè/DM/phòng/ván/dữ liệu khác; không tự sửa Display Name/email/mật khẩu. **PO chốt giữ mọi phiên hợp lệ và hạn cũ**, không tự thu hồi/gia hạn/đầu hàng ván.
- Nghiệm thu **AC-P2-20.1–3**: OTP thật/quyền, thiếu email, race đăng ký/đổi tên/lấy lại, biên 30 ngày, login/tìm bạn tên mới, bảo toàn dữ liệu và API/socket/refresh/ghế/ván trên phiên đang có.

### 18.3 Camera/mic giữa tab — US-P2-24 / XIAN-138

- Tab thứ hai cùng thiết bị chủ động bật khi tranh media → `MODAL-MEDIA-TAB-SWITCH` với Chuyển thiết bị sang tab này / Hủy bỏ.
- Chuyển dừng track/thu hồi phát cũ, tab cũ chỉ đọc; tab mới bật theo quyền hiện tại. Hủy không chiếm; reconnect tab cũ không tự giành control/media.
- Không thay luồng tiếp quản thường (media cũ dừng, tab mới mặc định Tắt) hoặc luật đăng nhập thiết bị khác. Không cấp media cho người xem/phiên thiếu quyền; lỗi media không làm gián đoạn ván.
- Nghiệm thu **AC-P2-24.1–3** bằng hai tab/track thật, Chuyển/Hủy/reconnect, quyền phát cũ dừng và chỉ đúng tab có điều khiển; không lấy mock làm bằng chứng thiết bị.

### 18.4 Giấy Sáng và Theo hệ thống — US-P2-25 / XIAN-139

- Bộ chọn ở Hồ sơ: Kỳ Đài Cổ Phong / Giấy Sáng / Theo hệ thống. Chưa chọn mặc định Kỳ Đài Cổ Phong; Khách giữ hạn chế theme bổ sung theo quyền nguồn.
- **PO chốt lưu lựa chọn theo tài khoản, đồng bộ giữa thiết bị.** Với Theo hệ thống, màu thực tế theo OS từng thiết bị, không ép các thiết bị cùng màu. Lựa chọn explicit không bị OS ghi đè.
- Giữ màu bàn cờ/phông; mọi trạng thái, bàn phím/reduced motion/contrast/responsive, không che bàn/Đầu hàng/đồng hồ hoặc tràn ngang. Lưu thất bại báo thật, không giả đã đồng bộ.
- Nghiệm thu **AC-P2-25.1–3**: lưu/reload/đăng nhập thiết bị khác/cách ly tài khoản, OS sáng/tối và explicit, bốn kích thước theo DESIGN, tương phản thực; bộ token chưa phải bằng chứng đạt.

### 18.5 Quyền Khách với phòng Không giới hạn — giao YC2/YC5

PO chốt Khách được chơi hoặc xem phòng Không giới hạn **do thành viên tạo**, theo ghế/chỗ trống, phiên/khóa/chặn hiện hành. Khi chơi chịu cùng luật chống treo/INACTIVITY. Khách vẫn không tự tạo mức Không giới hạn; không suy quyền tham gia thành quyền chọn mức khi tạo. Ca nghiệm thu bổ sung tại **AC-P2-10.1**.

## 19. Bằng chứng local cho bổ sung BA 0.21

- Node 22, PostgreSQL 17 cô lập: suite tích hợp 247 file/2.873 test PASS; có kiểm OTP khác mục đích, reservation tên cũ, giữ phiên/hạn cũ, quyền media và theme theo tài khoản. Các regression bổ sung sau lượt này được kiểm riêng trước commit.
- UI production với GoTrue ES256, SMTP TLS và LiveKit cục bộ thật: đổi tên sau OTP; tên trùng bị từ chối rồi nhập tên khác không gửi lại OTP; UUID/Display Name/capability và hạn phiên không đổi. Khôi phục chỉ hiện tên mới sau OTP, không cấp phiên.
- Hai target Chrome riêng: tab mới dừng camera tab cũ; tab chỉ đọc mở xác nhận lấy quyền; Esc không lấy quyền; Chuyển làm tab kia chỉ đọc và tab được cấp quyền bật camera được.
- Giấy Sáng lưu server, xuất hiện ở tab cùng tài khoản; Theo hệ thống lưu bền và phân giải theo OS từng tab. Hồ sơ desktop và recovery 360 px được kiểm trực quan; không thay palette bàn cờ.
- Regression cuối: 5 file/77 test PASS; typecheck, lint các file sửa và build workspace PASS. Settings production đo đúng viewport 1366×768 và 360×800, không cuộn toàn trang; card dài cuộn nội bộ. Contrast token văn bản chính/phụ/tiêu đề trên nền panel đo được tối thiểu 5,92:1 ở Giấy Sáng và 8,91:1 ở Cổ Phong; không coi phép đo này thay kiểm mọi pixel/trạng thái.
- Năm migration bổ sung có rollback; đã rollback/apply trên DB smoke riêng. Chưa áp lên Cloud, chưa xác minh CI/PO hoặc thiết bị camera vật lý. Token LiveKit đã phát có TTL 600 giây; thu hồi điều khiển không phải vô hiệu mật mã tức thời mọi bản sao JWT.

## 20. Quyết định PO khi rà soát YC1 — 31/10/2026

Các quyết định dưới đây sửa hoặc làm rõ mục 4, 6, 10, 11, 13, 18. Đã có mã local (xem 20.2), chưa nghiệm thu.

| # | Quyết định | AC bổ sung |
|---|---|---|
| 1 | **Thiết bị = mỗi trình duyệt** (hồ sơ trình duyệt hoặc cửa sổ ẩn danh có mã thiết bị riêng). Khi luật bật: đăng nhập thành công ở trình duyệt khác lúc tài khoản đang trong ván xử thua ngay ván cũ và đăng xuất trình duyệt cũ (BA 1.8); đăng nhập lại trên cùng trình duyệt không bị coi là thiết bị khác. **Luật này TẠM TẮT trong giai đoạn phát triển** (xem 20.3): cùng một hồ sơ trình duyệt, mỗi tab đăng nhập được một tài khoản riêng. Bật lại khi hoàn thiện dự án (bắt buộc trước nghiệm thu D10 và GATE-SESSION) hoặc khi PO yêu cầu | AC-YC1-RV-01 (khi luật bật), AC-YC1-RV-10 (khi luật tắt) |
| 2 | **Reset mật khẩu thành công xóa khóa thử sai** của username đó. Đăng nhập Google vẫn không xóa khóa (BA 0.15 giữ cho Google) | AC-YC1-RV-02 |
| 3 | **Đổi Username tối đa 1 lần mỗi 7 ngày**, tính từ lần đổi thành công gần nhất; lấy lại tên cũ cũng tính. Thay "không cooldown" của BA 1.4 và 0.21 | AC-YC1-RV-03 |
| 4 | **Cảnh báo khi bấm Bỏ qua email/OTP lúc đăng ký:** khung xác nhận “Vẫn bỏ qua / Thêm email” (mục 4.2) | AC-YC1-RV-04 |
| 5 | **Lối vào Khôi phục Username:** link “Quên tên đăng nhập?” ở `/login`, mở tab thứ hai của `/forgot-password`; không route mới | AC-YC1-RV-05 |
| 6 | **Trần gửi OTP:** tối đa 5 lần bắt đầu gửi trong cửa sổ trượt 60 phút cho mỗi email chuẩn hóa và UUID tài khoản bất biến, tính chung khôi phục mật khẩu, khôi phục Username, thêm email và đổi Username. Lần gọi SMTP lỗi vẫn tính; yêu cầu bị từ chối trước gửi không tính. Vượt trần báo “Bạn đã yêu cầu quá nhiều mã, vui lòng thử lại sau” và không gửi, **trừ Khôi phục Username giữ phản hồi chung để bảo vệ danh tính**. Đăng ký ba bước theo nhà cung cấp Auth | AC-YC1-RV-06 |
| 7 | **Ký tự tên:** Display Name chỉ chữ (có dấu), số, khoảng trắng và `. - _ '`, bỏ khoảng trắng đầu/cuối, gộp khoảng trắng liên tiếp, không emoji hay ký tự điều khiển, 2–30 ký tự | AC-YC1-RV-07 |
| 8 | **Thông báo thiếu email dùng chữ “email”**, không “Gmail”: “Tài khoản không có email đã xác minh nên không thể khôi phục mật khẩu.” | AC-YC1-RV-08 |
| — | PO không chọn thêm: điều khoản/chính sách quyền riêng tư, giới hạn tạo Khách/đăng ký theo địa chỉ mạng. Giữ BA 10.2 (loại trừ) và không giới hạn theo IP | — |

**PO xác nhận 31/10/2026:** mật khẩu tối đa 72 byte UTF-8 (AC-YC1-RV-09, làm rõ từ “72 ký tự”); tên Khách dùng cùng bộ ký tự như Display Name; khi luật thiết bị tắt, cùng tài khoản đăng nhập nơi khác lúc đang ván được xử như mở tab mới (tiếp quản, không xử thua).

### 20.1 Tiêu chí bổ sung

| Mã | Given / When | Then bắt buộc |
|---|---|---|
| AC-YC1-RV-01 (chỉ kiểm khi luật thiết bị đang BẬT) | Tài khoản đang trong ván online ở trình duyệt A; đăng nhập thành công ở trình duyệt B (cùng máy hoặc khác máy) | Ván xử thua ngay, A bị đăng xuất, B vào Sảnh. Đăng nhập lại ở A không tạo ván thua thứ hai |
| AC-YC1-RV-02 | Username bị khóa (5 lần sai); chủ tài khoản reset mật khẩu thành công | Đăng nhập bằng mật khẩu mới được ngay; bộ đếm về 0. Đăng nhập Google không xóa khóa |
| AC-YC1-RV-03 | Thành viên vừa đổi Username thành công; yêu cầu đổi tiếp (kể cả lấy lại tên cũ) trong 7 ngày | Từ chối ngay, không gửi OTP, báo số ngày còn lại; đủ 7 ngày thì đổi được. Biên 6 ngày 23:59 và 7 ngày kiểm tại server |
| AC-YC1-RV-04 | Đăng ký, bước Email hoặc OTP, bấm Bỏ qua | Hiện khung cảnh báo với **Vẫn bỏ qua** (hoàn tất không email) và **Thêm email** (quay lại bước email); đóng khung không hoàn tất tài khoản |
| AC-YC1-RV-05 | Ở `/login` bấm “Quên tên đăng nhập?” | Mở tab Quên tên đăng nhập của `/forgot-password`; luồng OTP riêng, không gộp với đặt lại mật khẩu |
| AC-YC1-RV-06 | Yêu cầu lần thứ sáu trong cửa sổ trượt 60 phút cho cùng email chuẩn hóa hoặc cùng tài khoản, qua các luồng OTP ứng dụng; gồm gửi đồng thời, đổi username và SMTP lỗi | Không gửi; hai bộ đếm email/UUID độc lập, đổi username không reset; đúng mốc 60 phút lần cũ ra khỏi cửa sổ. Báo quá nhiều mã, riêng Khôi phục Username vẫn phản hồi chung; không lộ tài khoản |
| AC-YC1-RV-07 | Lưu Display Name có emoji, ký tự điều khiển, 1 ký tự, 31 ký tự hoặc nhiều khoảng trắng liên tiếp | Từ chối hoặc chuẩn hóa đúng mục 3; tên tiếng Việt có dấu, `O'Brien`, `A.B` hợp lệ; kiểm lại ở server |
| AC-YC1-RV-08 | Username không có email đã xác minh bấm Gửi mã khôi phục | Hiện đúng câu có chữ “email”; không còn chữ “Gmail” ở giao diện, API và test |
| AC-YC1-RV-09 | Mật khẩu mới 73 byte UTF-8 (ví dụ 25 chữ “ế” = 75 byte); chuỗi đúng 72 byte (72 chữ ASCII hoặc 24 chữ “ế”) | Client/server từ chối >72 byte với “Mật khẩu tối đa 72 byte (chữ có dấu tính nhiều byte)”; đúng 72 byte qua validation độ dài, giữ nguyên chuỗi. Nếu Auth từ chối do giới hạn riêng thì báo lỗi thật đã làm sạch, không giả thành công |

### 20.2 Tác động triển khai (đã có mã local 31/10, chưa nghiệm thu)

- Đã có mã và ca kiểm viết sẵn: bỏ chữ “Gmail” (RV-08), xóa bộ đếm khóa khi reset (RV-02), cột `username_changed_at` và cooldown 7 ngày (RV-03), quota OTP chung theo email và UUID (RV-06), kiểm ký tự tên và mật khẩu (tối thiểu 8 ký tự, tối đa 72 byte) ở `packages/shared/src/auth-validation.ts` (RV-07, RV-09), Dialog bỏ qua email (RV-04), tab Quên tên đăng nhập (RV-05), phiên theo tab và cờ `SESSION_DEVICE_ENFORCEMENT_ENABLED` (RV-10, RV-11). Chi tiết ở [login.md](../engineering/server/login.md) và [ui.md](../engineering/web/ui.md).
- Mã thiết bị (RV-01) là cookie `xiangqi_device`: mỗi hồ sơ trình duyệt hoặc cửa sổ ẩn danh có kho cookie riêng nên đã là một thiết bị theo định nghĩa PO; luật bật mặc định khi `NODE_ENV=production` (`render.yaml`). Placeholder email ở bước đăng ký đã đổi từ Gmail sang `ten@example.com` (RV-08).
- Hai migration `20261103000002`, `20261103000003` đã áp lên Cloud ngày 31/10/2026 theo yêu cầu PO (từng file bằng `psql` rồi `migration repair --status applied`; `db push` vẫn bị chặn bởi lịch sử tháng 9); sổ khớp local, đã kiểm cột/bảng mới tồn tại, chưa kiểm hành vi ứng dụng trên Cloud.
- Chưa làm hoặc chưa kiểm: chưa chạy test, chưa kiểm dịch vụ thật, chưa xem giao diện.
- Bằng chứng ở mục 17 và 19 là trước các thay đổi này; không kế thừa PASS.
- Luật thiết bị tắt/bật: theo mã nguồn hiện tại mã thiết bị (`xiangqi_device`) và phiên đều lưu bằng cookie dùng chung cả hồ sơ trình duyệt, nên chỉ tắt luật xử thua thì hai tab vẫn ghi đè phiên của nhau; cần tách phiên theo tab (mục 20.3).

### 20.3 Chế độ phát triển: nhiều tài khoản trong một hồ sơ trình duyệt — PO chốt 31/10/2026

- **Mục đích:** cho dev mở hai tab cùng một hồ sơ Chrome và đăng nhập hai tài khoản khác nhau để thử phòng, mời, chơi, chat mà không cần hai trình duyệt.
- **Trạng thái mặc định hiện tại: luật thiết bị TẮT.** Khi tắt: không xử thua và không đăng xuất tài khoản khác khi đăng nhập ở tab khác; mỗi tab giữ phiên độc lập theo tài khoản (cần tách phiên theo tab, không dùng một cookie phiên chung). Đăng xuất ở tab này không đăng xuất tab kia.
- **Không đổi khi luật tắt:** một tài khoản chỉ ngồi một vị trí chơi (kể cả AI); cùng một tài khoản mở thêm tab thì tab mới tiếp quản, tab cũ chỉ đọc (BA 1.8). Đăng nhập cùng tài khoản ở nơi khác khi đang ván được xử như mở tab mới (tiếp quản), **không** xử thua (PO xác nhận 31/10).
- **Bật lại:** bằng cờ cấu hình (tên do dev đặt khi triển khai). Điều kiện bật: PO yêu cầu, hoặc hoàn thiện dự án trước nghiệm thu. **Trước D10 và GATE-SESSION luật phải BẬT**; D10 và AC-01.4 về thiết bị khác không được ghi PASS khi luật đang tắt.
- **Release:** cờ phải mặc định BẬT ở môi trường demo/phát hành; chế độ nhiều tài khoản chỉ dành cho phát triển. Khi cờ BẬT, máy chủ bỏ qua header tab và dùng cookie phiên chung như cũ; cơ chế cookie theo tab chỉ chạy khi cờ TẮT.

| Mã | Given / When | Then bắt buộc |
|---|---|---|
| AC-YC1-RV-10 (luật tắt) | Cùng một hồ sơ Chrome; tab A đăng nhập tài khoản X, tab B đăng nhập tài khoản Y | Hai phiên độc lập: tải lại, gọi API, socket ở mỗi tab đều đúng tài khoản; đăng xuất tab A không ảnh hưởng tab B; không xử thua, không đăng xuất chéo |
| AC-YC1-RV-11 (luật bật) | Cờ bật, tab A trong ván của X; đăng nhập tài khoản X ở trình duyệt khác | Xử thua và đăng xuất như AC-YC1-RV-01; chuyển cờ tắt→bật không làm hỏng phiên đang có |
