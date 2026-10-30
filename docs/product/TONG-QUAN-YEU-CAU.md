# XIANGQI — Tổng quan chi tiết yêu cầu P1 + P2 và sổ đánh giá sản phẩm

Ngày lập: **30/10/2026**. Trạng thái: **tổng quan phục vụ review; đã ghi quyết định PO về mục tiêu, thứ tự P1 trước P2 và hai chức năng mật khẩu lên P1**. Không phải báo cáo đã triển khai/nghiệm thu.

**PO cập nhật theo BA 0.20:** bỏ QR khỏi cả P1/P2; đưa Thách đấu (`US-P2-19`/XIAN-133), DM/unread (`US-P2-18`/XIAN-132), Không giới hạn/chống treo (`US-P2-10`/XIAN-124), Tái đấu **phòng tự tạo** (phần custom `US-P2-09`/XIAN-123) lên **P1**. Tái đấu Casual/ghép ngẫu nhiên và Ranked vẫn P2. Mục 13 giữ số/mã cũ để tra cứu; bảng giờ/Epic là baseline lịch sử chưa tái ước lượng, không phải tổng P2 còn lại hoặc bằng chứng triển khai.

**PO bổ sung BA 0.21:** toàn bộ Đổi Username (`US-P2-20`/XIAN-134), Khôi phục Username (`US-P2-21`/XIAN-135), media giữa tab (`US-P2-24`/XIAN-138), Giấy Sáng/Theo hệ thống (`US-P2-25`/XIAN-139) thuộc P1, đã có mã và bằng chứng local tại YC1 mục 19; chưa nghiệm thu Cloud/PO. Giữ phiên hợp lệ/hạn cũ khi đổi tên; theme lưu tài khoản/đồng bộ lựa chọn, OS theo từng thiết bị; Khách được chơi/xem phòng Không giới hạn do thành viên tạo và chịu chống treo, không tự tạo mức này.

> **Đối chiếu mã 31/10/2026:** các câu “chưa triển khai” trong sổ review 30/10 là snapshot lịch sử. BA 0.20/0.21 và bằng chứng YC1 mục 19, YC2 mục 20, YC3 mục 16 xác nhận đã có mã và kiểm chứng local cho các bổ sung P1. Kết quả sửa các khoảng trống tìm được, kiểm tra mới và phần còn lại nằm ở mục 16; chưa có xác nhận nghiệm thu toàn bộ P1 hoặc cập nhật Jira.

## 1. Mục đích, nguồn và cách sử dụng

Tài liệu này gom toàn bộ phạm vi chức năng **P1 và 25 mục P2**, yêu cầu chất lượng, dữ liệu, ngoại lệ và nghiệm thu để đọc, đánh giá, bổ sung, cải thiện hoặc thiết kế lại. Nội dung chi tiết theo chức năng; không sao chép mọi hàng AC/TC hoặc lịch Task từ backlog. Đây không phải báo cáo nghiệm thu, không xác nhận phần mềm đã đáp ứng yêu cầu và không thay thế BA/backlog.

### 1.1 Nguồn có hiệu lực

- [Quyết định BA](BA-SCOPE-DECISIONS.md): nguồn nghiệp vụ, **Phần 0 ưu tiên cao nhất**; bao gồm cập nhật đăng ký 29/10 và biểu mẫu phòng 19–28/10.
- [Backlog P1](BACKLOG-P1.md): Story, AC, NFR, cổng kiểm chứng và kịch bản D1–D10.
- [Backlog P2](BACKLOG-P2.md): phân rã mở rộng. Nghiệp vụ dẫn về BA; bản phân rã và ước lượng kỹ thuật chưa có xác nhận riêng của PO theo phần mở đầu tài liệu.
- [Danh mục màn hình](../design/DANH-MUC-MAN-HINH-XIANGQI.md), [thiết kế](../design/DESIGN.md): đặc tả giao diện, dưới BA/backlog khi có mâu thuẫn.
- [Ý tưởng](IDEA.md), [README](../../README.md), [kế hoạch](../planning/KE-HOACH-JIRA.md): thông tin giới thiệu, kỹ thuật và kế hoạch; không tự tạo luật mới.

Thứ tự khi mâu thuẫn: **BA Phần 0 → BA còn lại → Backlog P1 → Danh mục màn hình → Design → mockup**. Tài liệu tổng hợp này không bổ sung một tầng ưu tiên mới.

### 1.2 Quy ước đánh giá

- **Hiện hành:** yêu cầu đã có trong nguồn. Giữ nguyên hiệu lực cho đến khi PO duyệt thay đổi.
- **Cần đánh giá:** câu hỏi hoặc rủi ro, không có nghĩa yêu cầu hiện tại sai hay đã bị bỏ.
- **Đề xuất:** phương án chưa duyệt; không tự đưa vào code, Sprint hay tiêu chí nghiệm thu.
- **Đã chốt trong vòng đánh giá:** quyết định PO đồng ý rõ trong cuộc trao đổi; ghi tại mục 15 và đồng bộ nguồn liên quan trước khi triển khai.
- Tách ba việc: **duyệt yêu cầu**, **có mã triển khai**, **nghiệm thu đạt**. Không suy việc sau từ việc trước.

Mỗi phần được xem theo sáu câu hỏi: phục vụ ai; giải quyết việc gì; luồng chính ra sao; lỗi/ngoại lệ nào phải xử lý; có đáng giữ trong đợt phát hành không; dùng bằng chứng nào để nghiệm thu.

### 1.3 Bản đồ đọc tài liệu

| Nội dung | Vị trí |
|---|---|
| Mục tiêu, phạm vi, vai trò | Mục 2–3 |
| Tài khoản và toàn bộ nhóm chức năng P1 | Mục 4–11 |
| Nền tảng, chất lượng và truy vết 27 Story P1 | Mục 12 |
| P2: 7 nhóm Epic và 25 yêu cầu chi tiết | Mục 13.1–13.26 |
| Ràng buộc liên chức năng, phụ thuộc và quyền P2 | Mục 13.27–13.28 |
| Loại trừ rõ ràng, không mặc định chuyển thành P2 | Mục 13.29 |
| Nghiệm thu P1/P2 và các mâu thuẫn cần giải quyết | Mục 14 |
| Thứ tự review và quyết định PO | Mục 15 |

## 2. Mục tiêu sản phẩm và ranh giới phạm vi

### 2.1 Hiện hành

Ứng dụng web cờ tướng tiếng Việt cho người muốn giao lưu qua phòng online và luyện với máy. Trải nghiệm kết hợp bàn cờ, người xem, chat và camera/mic tự chọn. Đây đồng thời là đồ án môn Quản trị Dự án CNTT: phải chứng minh cả sản phẩm chạy được và kế hoạch triển khai có truy vết.

P1 tập trung **tám mục tiêu khách hàng**, không phải nền tảng thi đấu chuyên nghiệp đầy đủ. P2 là mở rộng có đặc tả nhưng không mặc định cùng hạn P1.

| Mã gốc | Mục tiêu P1 | Epic / Story |
|---|---|---|
| YC1 | Tài khoản, đăng nhập, Google, Khách | EP-01 / US-01.1–01.4 |
| YC2 | Tạo phòng, ghế, Sẵn sàng, đổi bên, ở lại phòng | EP-02 / US-02.1–02.2 |
| YC3 | Link/mã và mời bạn online | EP-03 / US-03.1–03.2 |
| YC4 | Lõi luật và bàn cờ tương tác | EP-04 / US-04.1–04.3 |
| YC5 | Hai người đấu online, đồng hồ, kết quả, reconnect | EP-05 / US-05.1–05.3 |
| YC6 | Quyền phòng, Sảnh, người xem | EP-06 / US-06.1–06.3 |
| YC7 | Chat, camera và mic | EP-07 / US-07.1–07.2 |
| YC8 | Đánh với máy theo cấp độ | EP-08 / US-08.1–08.3 |
| Nền tảng | Khung kỹ thuật, dữ liệu, realtime, chất lượng, demo | EP-00 / US-00.1–00.5 |

Baseline kế hoạch: **9 Epic, 27 Story, 71 Task, 268 AC, 880 giờ, hạn 04/11/2026**. Đây là số liệu kế hoạch trong tài liệu, không phải số giờ thực tế hoặc kết quả đạt hiện tại.

**Ngoại lệ PO chốt 30/10:** Đổi mật khẩu trong Hồ sơ và Quên mật khẩu bằng username/OTP thuộc P1. Giữ hạn 04/11; số giờ/Task/AC phía trên là baseline trước bổ sung, không tự coi đã chứa khối lượng mới. Đặc tả riêng và 20 tiêu chí bổ sung tại [YC1 P1](P1-YC1-TAI-KHOAN-VA-XAC-THUC.md).

### 2.2 Mục tiêu và thứ tự ưu tiên đã được PO xác nhận

**Mục tiêu:** XIANGQI là ứng dụng web cờ tướng tiếng Việt, giúp người dùng dễ dàng chơi cùng bạn bè, luyện tập với máy và thi đấu xếp hạng. Trải nghiệm ưu tiên bàn cờ dễ dùng, luật và đồng hồ nhất quán, kết nối ổn định; chat, camera và mic là tiện ích giao lưu tự chọn.

**Ưu tiên sản phẩm:** hoàn thiện chơi cùng bạn bè và luyện máy trước, sau đó thi đấu cộng đồng. Giữ cả ba trong tầm nhìn, không đưa Ranked hoặc tính năng P2 khác lên P1 chỉ vì có trong mục tiêu dài hạn.

**Ràng buộc PO xác nhận:** giữ hạn **04/11/2026** và phân kỳ P1/P2 hiện hành. Đánh giá và xử lý lần lượt **YC1 → YC8 của P1**; P1 ổn hết mới chuyển P2. Phân quyền và chất lượng nền tảng được rà trong từng yêu cầu liên quan, không đợi cuối mới xử lý.

“Ổn” không đồng nghĩa chỉ chốt đặc tả: khi triển khai/nghiệm thu vẫn phải có bằng chứng theo AC, NFR/gate liên quan và hồi quy tích hợp; chưa có bằng chứng thì không tuyên bố đạt. Không tự giảm phạm vi hoặc hạ ngưỡng để giữ hạn; thay đổi ảnh hưởng hạn phải báo PO.

Nguồn: BA 0.1, 10.1, 11; Backlog P1 mục 4, 10.

## 3. Người dùng và phân quyền

| Vai trò | Quyền hiện hành trong P1 | Giới hạn quan trọng |
|---|---|---|
| Thành viên | Tạo/vào phòng, đánh online/AI, kết bạn, mời bạn, hồ sơ, chat/media theo vai trò | Một vị trí ngồi chơi tại một thời điểm; không tự quyết luật/kết quả |
| Khách | Tạo một phòng đang mở, vào chơi/xem, chia sẻ link/mã, đánh AI, chat/media khi có quyền | Không kết bạn, không gửi/nhận lời mời bạn bè, không dùng P2, không sửa hồ sơ ngoài Đăng xuất |
| Host | Cài đặt quyền phòng, quản lý ghế/người xem theo trạng thái | Phải đang ngồi ghế; không được sửa luật hay kết quả |
| Người chơi không phải Host | Đi cờ, Sẵn sàng, đề nghị đổi bên/hòa, chat/media, đuổi người xem | Không có toàn bộ quyền cài đặt của Host |
| Người xem | Xem realtime, chat Kênh Chung, nhận media được chia sẻ | Không đi cờ, không đọc Kênh Riêng, không phát camera/mic |

Host/người chơi/người xem là vai trò trong phòng, không phải loại tài khoản riêng. Một thành viên hoặc Khách có thể mang vai trò tương ứng.

**Cần đánh giá:** giới hạn Khách có đủ dễ hiểu không; chuyển ghế/người xem có quá nhiều thao tác không; quyền đuổi của cả hai người chơi có phù hợp trải nghiệm mong muốn không.

Nguồn: BA 0.3, 2.8, 4.1–4.2, 11.

## 4. Tài khoản, hồ sơ và phiên — YC1

### 4.1 Đăng ký và đăng nhập

- Đăng ký thường: username + mật khẩu + xác nhận mật khẩu; sau đó email và OTP **tùy chọn**. Được bỏ qua tại bước email hoặc OTP để hoàn tất tài khoản và vào Sảnh.
- Username duy nhất, không phân biệt hoa thường; 3–20 ký tự theo `^[a-zA-Z0-9_]{3,20}$`; từ chối từ cấm tại bước nhập và kiểm lại khi hoàn tất.
- Mật khẩu tối thiểu 8 ký tự. Đóng tab khi chưa hoàn tất không được coi là chủ động bỏ qua email/OTP.
- Google: OAuth thật → onboarding đặt username và mật khẩu, không OTP; không tự gộp tài khoản cùng email.
- Đăng nhập bằng username, không dùng email làm tên đăng nhập. Sai username/mật khẩu trả thông báo chung.
- Sai 5 lần trong 15 phút, kể cả username không tồn tại → chặn đăng nhập bằng mật khẩu cho username chuẩn hóa trong 15 phút từ lần sai thứ năm.
- Google không bị bộ đếm khóa mật khẩu chặn và không xóa bộ đếm. Mật khẩu đúng chỉ reset sau khi đăng nhập bằng mật khẩu thành công, không vượt qua thời gian đang khóa.

### 4.2 Email và hồ sơ

- Tài khoản chưa có email vẫn dùng chức năng thành viên P1; cảnh báo rõ chưa có địa chỉ khôi phục.
- Thêm/xác minh email sau trong Hồ sơ phải cập nhật **cùng user_id**, giữ phiên và dữ liệu, không tạo tài khoản mới hay tự gộp.
- OTP 6 số, hạn 180 giây, gửi lại sau 60 giây. OTP đăng ký dùng giới hạn xác minh của Supabase với mục tiêu 5 lần sai, không cam kết đếm chính xác từng mã; OTP thêm email có tối đa 5 lần sai cho yêu cầu đó.
- Email chưa xác minh không được xem là email đã gắn thành công. Kiểm trùng cả khi gửi và khi hoàn tất; thiếu SMTP/lỗi gửi phải báo lỗi thật.
- Display Name mặc định bằng username, kể cả Google; được đổi trong Hồ sơ, 2–30 ký tự, hỗ trợ tiếng Việt, không cần duy nhất/OTP nhưng phải qua bộ lọc.
- Avatar chữ cái đầu, không tải ảnh lên. Đổi/khôi phục Username, Đổi/Quên mật khẩu đều P1 theo 0.18/0.21. Đổi/xóa email đã xác minh vẫn ngoài phạm vi; không tự gộp danh tính.

### 4.3 Khách, phiên và nhiều thiết bị

- Khách nhập tên tạm 2–20 ký tự, có nhãn “(Khách)”, qua bộ lọc; phiên tối đa 12 giờ, ngoại lệ không hết khi đang ngồi ghế/trong ván.
- Thành viên: Ghi nhớ đăng nhập mặc định bật, giữ 30 ngày; bỏ chọn thì hết khi đóng trình duyệt hoặc sau 12 giờ, tùy mốc nào trước. Hạn cố định từ đăng nhập/hoàn tất đăng ký, không kéo dài do hoạt động hoặc refresh token.
- Một tài khoản chỉ được có một vị trí ngồi chơi, kể cả AI.
- Tab mới cùng phòng tiếp quản; tab cũ chỉ đọc, dừng media; tab mới mặc định tắt media. Tab cũ reconnect không tự giành lại quyền.
- Đăng nhập thành công trên thiết bị khác khi đang đấu → xử thua ngay, đăng xuất thiết bị cũ, thiết bị mới về Sảnh. Không đồng nhất với mở tab cùng thiết bị.
- Hết hạn phiên thành viên giữa ván → yêu cầu đăng nhập lại; online giữ ân hạn 60 giây, AI giữ 30 phút theo luật tương ứng.
- Đăng xuất/rời ván chủ động phải xác nhận hậu quả đầu hàng; đóng tab hoặc mất mạng theo ân hạn, không tự coi là đầu hàng chủ động.

**Trạng thái review:** PO giữ đăng ký thường ba bước, email/OTP tùy chọn; đã chốt hai chức năng mật khẩu tại 4.4. Google onboarding, khóa thử sai, quyền Khách, hồ sơ/email và chính sách thiết bị kế thừa BA, chưa được đánh giá lại từng phần trong vòng hiện tại.

**Bằng chứng cần có:** đăng ký qua cả nhánh bỏ qua email, bỏ qua OTP và OTP đúng; xác minh sau không đổi danh tính; Google thật; username trùng/khác hoa thường; khóa đăng nhập; hết hạn phiên; tiếp quản tab và đổi thiết bị.

Nguồn: BA 0.2–0.4, 0.15, 0.17, 1.1–1.8; US-01.1–01.4.

Đặc tả YC1 đầy đủ: [P1-YC1-TAI-KHOAN-VA-XAC-THUC.md](P1-YC1-TAI-KHOAN-VA-XAC-THUC.md), gồm luồng, lỗi, quyền, phiên và 20 tiêu chí mật khẩu bổ sung.

### 4.4 Yêu cầu mật khẩu PO bổ sung trong vòng review

**Đã chốt ngày 30/10 — cả hai chức năng thuộc P1:**

- **Đổi mật khẩu chủ động:** thành viên đăng nhập → Hồ sơ → mật khẩu cũ + mới + xác nhận. Cũ đúng, mới tối thiểu 8 ký tự và khớp mới được đổi; không cần email/OTP. Thành công **giữ phiên thực hiện với hạn cũ**, đăng xuất các phiên khác.
- **Quên mật khẩu:** ở Đăng nhập chọn chức năng, nhập **username**; server chỉ gửi OTP tới email liên hệ đã xác minh của tài khoản. OTP đúng mới cho đặt mật khẩu mới/xác nhận; thành công thu hồi phiên cũ và về Login, không tự đăng nhập.
- **Thiếu email:** hiện "Tài khoản không có Gmail đã xác minh nên không thể khôi phục mật khẩu." Pending không đủ điều kiện; không dùng email kỹ thuật. Username không tồn tại cùng phản hồi thiếu điều kiện để không bổ sung một câu dò tồn tại riêng.
- PO đã được nêu rủi ro dò trạng thái trước khi chọn username/phản hồi cụ thể; không trả email đích đầy đủ. Tiếp tục hỗ trợ email hợp lệ theo BA, không tự giới hạn @gmail.com.
- Đăng ký ba bước/email tùy chọn giữ nguyên; Quên/Đổi mật khẩu thuộc P1 theo 0.18, Khôi phục/Đổi Username thuộc P1 theo 0.21, có mục đích OTP tách biệt.
- BA 0.18/1.7/1.9, backlog và danh mục màn hình được đồng bộ; chưa triển khai code hoặc cập nhật Jira/giờ. Chi tiết và nghiệm thu tại đặc tả YC1.

## 5. Sảnh, tạo phòng và vòng đời — YC2, YC6

### 5.1 Sảnh và tạo phòng

- P1 hoạt động: Tự tạo phòng, Đánh với máy, Vào phòng bằng mã, danh sách PUBLIC và Luật chơi mở rộng/thu gọn.
- Ghép ngẫu nhiên và Ranked là P2; lối vào chính ở P1 bị vô hiệu hóa kèm “Sắp ra mắt”.
- Không nhập tên phòng. Server tự sinh ID, mã **8 chữ số**, tên “Phòng <mã>”. Một số đoạn cũ vẫn gọi mã 8 ký tự; khi review dùng quy định cụ thể tại BA 2.7.
- Thành viên tạo phòng có Không giới hạn/5/10/15 phút, **mặc định Không giới hạn** theo BA 0.20; Khách giữ 5/10/15, mặc định 10; Thách đấu mặc định 10. Không cộng giây. Chống treo cho ván online Không giới hạn thuộc P1 (mục 13.11), không áp AI.
- Chọn 0–5 người xem, mặc định 5, không đổi sau khi tạo; tối đa 7 người trong phòng.
- Chọn PUBLIC hoặc CODE_ONLY ngay tại form; mặc định CODE_ONLY. Không tạo trực tiếp LOCKED.

### 5.2 Quyền truy cập

| Chế độ | Hiện tại Sảnh | Người mới vào | Người đang có mặt |
|---|---|---|---|
| PUBLIC | Có | Vào chơi/Vào xem hoặc mã/link/lời mời, còn chỗ và đủ quyền | Giữ vai trò theo luật ghế |
| CODE_ONLY | Không | Mã/link/lời mời, còn chỗ và đủ quyền | Không bị đẩy ra chỉ vì đổi chế độ |
| LOCKED | Không | Bị chặn kể cả có mã/link | Giữ chỗ; reconnect còn hạn được quay lại |

Chỉ bật LOCKED khi đủ hai ghế. Sau đó một người rời không tự mở khóa; Host chủ động mở lại hoặc mời người xem hiện có xuống ghế.

Danh sách PUBLIC tối đa 50 phòng, sắp theo lần mở PUBLIC gần nhất; cập nhật không cần tải lại. Mục tiêu cập nhật danh sách trong 2 giây. Server kiểm lại quyền, trạng thái và sức chứa khi người dùng bấm, không tin danh sách đã hiển thị trước đó.

### 5.3 Ghế, Sẵn sàng và sau ván

- Host khởi đầu ghế Đỏ; một mình thì đổi Đỏ/Đen tự do. Có hai người phải Xin đổi bên, hạn 30 giây; đồng ý reset Sẵn sàng cả hai.
- Từ chối/hết hạn đổi bên → người gửi chờ 60 giây; đề nghị bị hủy khi bắt đầu đếm hoặc thành phần ghế đổi.
- Hai người Sẵn sàng → đếm 3 giây → server kiểm lại ghế/kết nối/Sẵn sàng trước khi tạo ván.
- Mất mạng trong đếm ngược → hủy đếm, reset Sẵn sàng, giữ ghế theo ân hạn; chưa tạo ván thì không ghi thua.
- Kết thúc ván tự tạo → WAITING ngay, giữ ghế, Host, người xem, chế độ và chat theo luật; đồng hồ reset cho ván mới. Kết quả có “Ở lại phòng”/“Rời phòng”.
- P1 thêm **Tái đấu custom chọn Giữ/Đổi phe**: đối thủ đồng ý trong 30 giây → kiểm lại → đếm 3 giây → ván mới không Ready lại. Không dùng thì vẫn Ở lại → Xin đổi bên nếu muốn → cả hai Ready. Khách không gửi/nhận Tái đấu theo quyền nguồn.
- Host rời thì chuyển cho người chơi còn lại. Không còn người ngồi ghế thì đóng phòng, đưa người xem về Sảnh. Host ngồi chờ một mình không có hạn chờ cố định.

**Cần đánh giá:** mặc định CODE_ONLY; mức giờ; giới hạn và quyền đổi trần người xem; thao tác chơi tiếp; cách báo phòng đầy/khóa/ghế vừa bị lấy; tính dễ hiểu giữa Đổi ghế, Xin đổi bên và Tái đấu.

**Bằng chứng cần có:** tạo PUBLIC/CODE_ONLY trực tiếp; tranh ghế không vượt sức chứa; khóa và reconnect; đổi bên reset Ready; hủy đếm khi mất mạng; chơi ván hai trong cùng phòng; chuyển Host và đóng phòng.

Nguồn: BA 0.5–0.7, 0.10, 2.1, 2.3, 2.7–2.8; US-02.x, US-06.1–06.2.

## 6. Bạn bè và mời vào phòng — YC3

- Thành viên tìm bạn bằng tiền tố username, không phân biệt hoa thường; kết bạn hai chiều qua Chấp nhận/Từ chối, người gửi được thu hồi.
- Tối đa 200 bạn, tổng 50 lời mời kết bạn chờ gửi + nhận; lời mời hết hạn sau 30 ngày.
- Hai lời mời kết bạn ngược chiều chỉ giữ một đề nghị, không tự thành bạn. B từ chối A hai lần thì chặn A→B, không chặn chiều ngược; kết bạn thành công reset bộ đếm cặp về 0, hủy kết bạn không phục hồi bộ đếm cũ (PO chốt 30/10, BA 0.19 Q1).
- Online/Đang đấu/Offline; Online cập nhật trong ≤5 giây. Mất mọi kết nối đã được server nhận biết thì hiện Offline kể cả còn giữ ghế/vị trí; vẫn chặn nhận mời sang ghế khác. Bấm chuông chuyển `/friends` và tự mở tab Lời mời kết bạn đang chờ, dùng chung danh sách/số đếm (0.19 Q7–Q8).
- Mời phòng chỉ dành cho người ngồi ghế; cooldown **10 giây theo toàn người gửi**, dùng chung người nhận/phòng/tab. **Nhiều popup đồng thời**, mỗi popup có tên người thực sự gửi, Tham gia/Từ chối, deadline gốc **30 giây**. Từ chối/X/Esc kết thúc popup đó, thông báo người gửi và chờ ít nhất 10 giây từ phản hồi trước khi gửi lại; hết hạn tự nhiên không báo giả là Từ chối. Không lưu vào chuông. Người gửi rời ghế/hủy kết bạn không tự thu hồi invite đã cấp, vẫn kiểm quyền/phòng/chỗ khi nhận (0.19 Q2–Q4, Q6).
- Link/mã dùng được cho người chưa kết bạn. Chưa đăng nhập thì chọn đăng nhập/đăng ký/Khách rồi tự vào đúng phòng, nhưng kiểm ràng buộc vị trí chơi trước.
- Vào bằng mã/link/lời mời: còn ghế thì ngồi ghế; đủ ghế thì làm người xem nếu còn chỗ. “Vào xem” tại Sảnh không tự xếp vào ghế; “Vào chơi” gặp ghế vừa kín thì có thể chuyển sang xem kèm thông báo nếu còn chỗ.
- Đang xem A mà vào B: chỉ rời chỗ xem A khi chuyển nguyên tử/nhận chỗ B thành công; B đầy/khóa/lỗi thì giữ A và báo lỗi tại chỗ. Precheck slot không bảo đảm chỗ; không tự rời ghế/ván chơi khác (0.19 Q5).
- **P1 theo BA 0.20:** Friends có Thách đấu → form không tên → xác nhận tạo phòng rồi mời bạn đã chọn; có Nhắn tin/DM bền và unread đồng bộ thiết bị, thu hồi quyền ngay khi hủy bạn. Chia sẻ chỉ Sao chép link/Sao chép mã; QR bỏ hẳn. Chi tiết ở YC3 mục 15.

**Đã chốt 30/10:** Q1–Q8 và tên người gửi ở [đặc tả YC3](P1-YC3-MOI-VAO-PHONG.md), BA 0.19; không còn câu hỏi PO mở trong nhóm này. Chốt đặc tả không phải nghiệm thu triển khai.

**Bằng chứng cần có:** 28 AC YC3 cùng reset bộ đếm, nhiều popup trên 360px, cooldown dùng chung mọi tab/người nhận, phản hồi Từ chối không trùng/không giả từ hết hạn, giữ invite khi người gửi rời, chuyển phòng thất bại vẫn giữ A, Offline không mất vị trí và chuông mở đúng tab.

Nguồn: BA 0.3, **0.19**, 2.4–2.8, 5.5, 11; US-03.1–03.2.

## 7. Bàn cờ và bộ luật — YC4

- Bàn cờ chuẩn 9 cột × 10 hàng, 32 quân ban đầu, quân chữ Hán; không chuyển sang chữ Việt/Latin.
- Hỗ trợ click chọn quân rồi chọn đích và kéo thả; chỉ dẫn ô hợp lệ, nước vừa đi, trạng thái chiếu, âm thanh và tắt tiếng theo đặc tả giao diện.
- Góc nhìn theo phe, người cầm Đen nhìn Đen ở dưới; thao tác được bằng cảm ứng.
- Lõi luật dùng chung cho server, client và engine; client hiển thị nước hợp lệ không thay thế kiểm tra ở server.
- Luật di chuyển gồm cản Mã, mắt Tượng, ngòi Pháo, cung/sông, an toàn Tướng; cấm tự chiếu và hai Tướng nhìn nhau.
- Bộ luật là **rút gọn của dự án**, không tuyên bố đạt toàn bộ luật giải đấu chính thức.

| Tình huống kết thúc | Kết quả hiện hành |
|---|---|
| Chiếu hết | Bên bị chiếu hết thua |
| Hết nước hợp lệ dù không bị chiếu | Bên hết nước thua, không phải hòa |
| Thế xuất hiện lần thứ ba, cùng bên tới lượt | Hòa, trừ ngoại lệ chiếu liên tục |
| Mọi nước của một bên trong chu kỳ lặp đều chiếu, bên kia không như vậy | Bên chiếu liên tục thua; cả hai cùng như vậy thì hòa |
| 120 nửa nước liên tiếp không ăn quân | Hòa nếu không có kết quả ưu tiên cao hơn |
| Đuổi quân liên tục | Không xử riêng; lặp thế áp luật lặp |

Chu kỳ lặp tính từ lần xuất hiện thứ nhất đến thứ ba của thế; chỉ đếm nhánh nước hiệu lực. Server kiểm hết giờ trước khi duyệt nước. Khi xét nước hợp lệ, chiếu hết ưu tiên cao nhất; hết nước đi/chiếu liên tục gây thắng thua ưu tiên trước hòa 120 nửa nước.

**Cần đánh giá:** giữ luật rút gọn hay thay chuẩn luật là thay đổi lớn; cách giải thích luật trong Sảnh; thao tác bàn cờ trên điện thoại; phân biệt chỉ dẫn nước hợp lệ với gợi ý nước tốt của AI (không thuộc phạm vi).

**Bằng chứng cần có:** thế luật có đáp án độc lập, biên cung/sông, tự chiếu, lặp/chu kỳ, ưu tiên kết quả; click/kéo thả/cảm ứng cùng cho kết quả hợp lệ.

Nguồn: BA 0.12, 0.17, 3.1, 3.3–3.5, 10.4; US-04.1–04.3.

## 8. Vận hành ván online và sự cố — YC5

- Server quyết định lượt đi, nước hợp lệ, đồng hồ và kết quả; lệnh có định danh chống trùng và phiên bản trạng thái theo hợp đồng realtime.
- Nước sai lượt, sai quyền, trùng hoặc dựa trên phiên bản cũ không được làm hỏng trạng thái hay tính giờ hai lần.
- Hết giờ xử thua. Đầu hàng/rời ván chủ động có xác nhận; Xin hòa có hạn trả lời 30 giây, bị từ chối thì phải chờ 5 nước tiếp theo của chính người xin.
- Người chơi online mất mạng có ân hạn 60 giây, đồng hồ vẫn chạy. Hết giờ trước thì TIMEOUT; hết ân hạn trước thì DISCONNECT.
- Cả hai mất mạng không tự coi là lỗi server: khi cả hai cùng quá hạn, bên mất mạng trước thua theo BA.
- Phòng chờ giữ ghế người mất mạng 60 giây, không xử thua; người xem giữ chỗ 5 phút.
- Restart/sự cố hạ tầng do server ghi nhận → INTERRUPTED, không thắng/thua/hòa; phòng tự tạo về WAITING, reset Ready. Ván online và nước đi phải lưu bền, không khôi phục giả một ván đã kết thúc.

**Cần đánh giá:** thời gian ân hạn; chính sách đổi thiết bị ở mục 4; thông báo phân biệt lỗi mạng và lỗi server; kỳ vọng tiếp tục ván sau restart so với luật hiện hành kết thúc trung tính.

**Bằng chứng cần có:** nước trùng/cũ; đồng hồ sát biên; mất mạng ngắn/dài/cả hai; hết giờ trong ân hạn; restart; kết quả nhất quán trên người chơi và người xem.

Nguồn: BA 0.17, 1.8, 3.3, 3.5–3.6, 8.3; US-05.1–05.3.

## 9. Người xem và kiểm soát phòng — YC6

- Người xem theo dõi cùng trạng thái realtime, không có độ trễ cố ý.
- Trong WAITING, người chơi không phải Host có thể xuống xem nếu còn chỗ; Host không tự xuống xem. Host được chuyển người chơi khác xuống xem hoặc mời người xem lên ghế.
- Người xem phải đồng ý lời mời xuống ghế; lời mời không giữ chỗ. Server kiểm lại khi chấp nhận; người xem không tự chiếm ghế trống.
- Đổi thành phần ghế reset Sẵn sàng; không đổi người ngồi ghế khi ván đang diễn ra.
- Cả hai người chơi đều có quyền đuổi người xem sau xác nhận. Thu hồi truy cập phòng và media; danh tính bị chặn đến khi phòng đóng, không chỉ đến hết ván.
- Giới hạn đã chấp nhận: người bị đuổi có thể quay lại bằng phiên Khách mới nếu phòng chưa LOCKED.

**Cần đánh giá:** có cần quyền đuổi chỉ dành Host không; giới hạn chống quay lại có chấp nhận được không; ưu tiên giữa sức chứa người xem và chuyển vai trò; sự rõ ràng của lời mời lên ghế.

**Bằng chứng cần có:** không vượt trần khi chuyển vai trò đồng thời; chặn người đã bị đuổi qua mọi lối vào; thu hồi media thật; reconnect trong/phía ngoài hạn; người xem không gửi được lệnh chơi bằng API/socket trực tiếp.

Nguồn: BA 2.8, 4.1–4.3, 8.3; US-06.3.

## 10. Chat, camera và mic — YC7

### 10.1 Chat

- Hai người chơi đọc/gửi Kênh Riêng và Kênh Chung; người xem chỉ có Kênh Chung. Quyền phải được bảo vệ phía server, không chỉ ẩn tab.
- Desktop mặc định mở Kênh Riêng, có thể mở thêm Kênh Chung; điện thoại chuyển bằng tab. Phòng chờ và trong ván cùng chính sách.
- Cùng cặp người chơi đổi phe/chơi tiếp giữ chat riêng. Thay một người thì cả cặp mới không đọc tin riêng của cặp cũ. Người mới xem chỉ thấy tin chung từ lúc vào.
- Mỗi tin tối đa 200 ký tự, tối đa 5 tin/10 giây/người; vượt báo lỗi. Từ cấm bị che; trường tên chứa từ cấm bị từ chối, không che rồi lưu.
- Bộ lọc dùng chung, chuẩn hóa tiếng Việt, hoa thường, ký tự chen và thay thế phổ biến; danh sách do nhóm duy trì. Chat phòng xóa khi phòng đóng.

### 10.2 Media

- Camera và mic mặc định tắt, điều khiển độc lập, bật được từ phòng chờ và không bị ngắt chỉ vì bắt đầu ván.
- Ba mức chia sẻ áp chung cho media đang bật: Không chia sẻ / Chỉ đối thủ / Cả đối thủ và người xem; mặc định Chỉ đối thủ nhưng thiết bị vẫn tắt.
- Người xem chỉ nhận media, không có quyền phát camera/mic hoặc dữ liệu LiveKit theo BA.
- Không ghi hình/ghi âm/lưu media. Đuổi/rời/chuyển quyền phải cập nhật quyền nhận/phát thực tế.
- Camera/mic lỗi hoặc hết hạn mức thì báo lỗi riêng; ván, đồng hồ và chat tiếp tục bình thường.
- LAN/dev: LiveKit tự chạy, web HTTPS khi truy cập từ máy khác. Internet/dự phòng: LiveKit Cloud; không chạy LiveKit trên Render.

**Cần đánh giá:** có cần cả hai kênh chat không; ba mức chia sẻ có dễ hiểu không; sự nổi bật của trạng thái đang phát; chi phí vận hành Internet; quyền riêng tư trước khi mở cho người ngoài nhóm.

**Bằng chứng cần có:** thử đọc chat trái quyền trực tiếp; đổi cặp không lộ tin; bộ lọc/rate limit; media nhiều thiết bị; đổi mức chia sẻ/đuổi thu hồi thật; từ chối quyền thiết bị và lỗi media không phá ván.

Nguồn: BA 0.13–0.16, 4.1–4.2, 5.3, 10.1; US-07.1–07.2.

## 11. Đánh với máy — YC8

- Chọn Đỏ/Đen/Ngẫu nhiên; Đỏ đi trước. Cầm Đen thì máy đi trước, bàn cờ xoay theo phe.
- Người chơi không có đồng hồ đếm thua và không áp chống treo ván online. Không có nút Xin hòa; hòa theo luật, có Đầu hàng.
- Engine dùng lõi luật chung, negamax/alpha-beta và tìm sâu dần, chạy tiến trình/worker riêng.

| Cấp | Độ sâu mục tiêu | Ngân sách phản hồi, đo p95 trên máy demo |
|---|---|---|
| Dễ | 2 | ≤ 300 ms |
| Trung bình | 4 | ≤ 1.000 ms |
| Khó | 6 | ≤ 3.000 ms |

- Hết ngân sách trước độ sâu mục tiêu thì chọn nước tốt nhất đã tìm được, luôn hợp lệ.
- Cấp Khó giải đúng 100% bộ thế chiếu hết 1 và 2 nước bắt buộc đã xác minh; đấu máy 20 ván mỗi cặp cấp để ghi tỷ lệ phân cấp. Không suy sức mạnh từ tên cấp.
- Không phản hồi quá 10 giây: giữ ván/thế, cho Thử lại trên cùng thế, không gửi lại nước người. Nếu lỗi thực sự đã làm ván Bỏ dở thì Thử lại tạo ván mới cùng cấp/phe thực tế.
- Mất mạng giữ ván 30 phút. P1 lưu bộ nhớ, restart mất trạng thái, phải thông báo đúng; không giả phục hồi.
- Sau ván: Ván mới mở lại thiết lập điền sẵn cấp/lựa chọn phe trước, được đổi rồi bắt đầu với ID mới; hoặc Về Sảnh.
- Không có gợi ý nước tốt. Undo AI và lưu lịch sử AI là P2, dù phần luật chi tiết đã mô tả.

**Cần đánh giá:** mục tiêu độ sâu so với thời gian/sức mạnh thực tế; mất ván sau restart; mức cần thiết của Undo; các phương án cải thiện AI phải được đánh giá riêng, không tự thêm dependency hay đổi engine.

**Bằng chứng cần có:** 50 thế giữa ván mỗi cấp trên máy demo, bộ chiếu hết có đáp án, phân cấp sức mạnh, chọn phe, lỗi/timeout engine, reconnect, không làm chậm online.

Nguồn: BA 0.9, 0.17, 6.1–6.3, 11; US-08.1–08.3.

## 12. Chất lượng, dữ liệu và nền tảng — EP-00

| Nhóm | Yêu cầu hiện hành / điều kiện đo |
|---|---|
| NFR-01 Realtime | Mục tiêu p95 truyền nước đi đến đối thủ/người xem < 100 ms trong môi trường demo |
| NFR-02 Quy mô | 50 người đồng thời, 10 phòng/ván không lỗi; tải media khoảng 3 phòng chỉ ghi số, không phải ngưỡng PASS P1 |
| NFR-03 Máy cờ | Thời gian và bộ chiếu hết theo mục 11 |
| NFR-04 Bảo mật | Server phân xử, RLS, mật khẩu băm qua Supabase, secret không ra VITE_*, khóa đăng nhập và giới hạn chat |
| NFR-05 Thiết bị | Chrome/Edge/Firefox/Safari bản mới, responsive từ 360 px, cảm ứng |
| NFR-06 Trợ năng | WCAG 2.1 AA cơ bản: tương phản, nhãn, bàn phím form/modal, giảm chuyển động |
| NFR-07 Ngôn ngữ | Giao diện tiếng Việt |
| NFR-08 Vận hành | Log có cấu trúc, /health; không log mật khẩu/OTP/token/chat |
| NFR-09 Lưu giữ | Online/nước đi lưu bền; AI P1 trong bộ nhớ; chat xóa khi phòng đóng; biên lai lệnh xóa sau 24 giờ; log tối đa 14 ngày |
| NFR-10 Hiển thị an toàn | Nội dung người dùng được hiển thị dạng văn bản thuần |
| NFR-11 Media | Mặc định tắt; không ghi/lưu |
| NFR-12 Dữ liệu cá nhân | P1 chỉ thu thập dữ liệu cần cho tài khoản, bạn bè và ván; không hỏi tuổi |

P1 có ba lựa chọn Kỳ Đài Cổ Phong/Giấy Sáng/Theo hệ thống trong Hồ sơ thành viên theo BA 0.21; mặc định vẫn là Cổ Phong, lựa chọn lưu tài khoản và đồng bộ thiết bị. Mỗi màn hình có trạng thái thành công, tải, rỗng, lỗi, vô hiệu hóa có giải thích phù hợp.

Công nghệ đã chọn: TypeScript, Node 22.13 đến trước 23, pnpm; React/Vite/SVG; NestJS/Socket.IO; Supabase PostgreSQL/Auth, Google OAuth và SMTP ngoài; LiveKit; engine TypeScript riêng. Cấu trúc monorepo: apps/web, apps/server, packages/shared, packages/xiangqi-core, packages/engine, tests, supabase, infra.

Kế hoạch đồ án phải có người nhận, ước lượng, phụ thuộc, đầu ra, cách kiểm và điều kiện PASS. Không lấy BA Done làm bằng chứng triển khai; không suy giờ thực làm từ giờ kế hoạch.

**Cần đánh giá:** môi trường nào là chuẩn nghiệm thu; cách đo p95 và tải có phản ánh mạng người dùng thật không; dữ liệu được xóa/giữ thế nào khi vận hành dài hạn; thiếu chính sách riêng tư có phù hợp nếu phát hành công khai không.

Nguồn: Backlog P1 mục 2, 6–7; BA 10.1, 10.3; package.json và README mục Công nghệ.

### 12.1 Đầu ra nền tảng và truy vết P1

- Khung dự án phải chạy được web/server theo hướng dẫn; có cấu hình mẫu, health check và log an toàn. Không coi tên công nghệ là bằng chứng dịch vụ đang hoạt động.
- Schema có migration, khóa ngoại, chỉ mục, ràng buộc username và RLS; thử đọc/ghi trực tiếp không vượt quyền. Migration cần có phương án rollback theo quy ước repo.
- Realtime xác thực cả thành viên/Khách; lệnh trùng trả kết quả cũ, lệnh phiên bản cũ trả snapshot mới; reconnect đồng bộ đủ phòng/ván/đồng hồ/vai trò.
- Kế hoạch kiểm thử có môi trường, dữ liệu, tiêu chí vào/ra, mức độ lỗi và TC truy vết từng AC; báo cáo PASS/FAIL/BLOCKED và hồi quy phần bị ảnh hưởng.
- Gói demo có hướng dẫn máy sạch, cấu hình được cấp, tài khoản/phòng mẫu và phương án dự phòng. Backlog đặt mục tiêu chạy theo README trong 15 phút; đó là tiêu chí cần kiểm, không phải kết quả đã đạt.

| Story P1 | Đầu ra cần có | Mục mô tả |
|---|---|---|
| US-00.1 | Khung dự án, CI, health, log | 12, 14 |
| US-00.2 | Schema, migration, RLS | 12 |
| US-00.3 | Xác thực socket, chống trùng, snapshot, tiếp quản tab | 4, 8, 12 |
| US-00.4 | Kế hoạch kiểm thử, dữ liệu có đáp án và spike sớm | 12, 14 |
| US-00.5 | NFR/gate, nghiệm thu tổng và gói demo | 12, 14 |
| US-01.1 | Đăng ký, email/OTP tùy chọn, xác minh sau | 4 |
| US-01.2 | Đăng nhập username và khóa thử sai | 4 |
| US-01.3 | Google và Khách | 3–4 |
| US-01.4 | Phiên, hồ sơ, nhiều tab/thiết bị, đăng xuất | 4 |
| US-02.1 | Tạo phòng, ghế, Sẵn sàng và bắt đầu | 5 |
| US-02.2 | Xin đổi bên, ở lại phòng sau ván | 5 |
| US-03.1 | Link/mã và vào phòng | 5–6 |
| US-03.2 | Bạn bè, lời mời và trạng thái online | 6 |
| US-04.1 | Lõi luật dùng chung | 7 |
| US-04.2 | Khởi tạo, chữ Hán, góc nhìn và bàn cờ | 7 |
| US-04.3 | Click/kéo thả, chỉ dẫn, âm thanh | 7 |
| US-05.1 | Đi cờ, đồng hồ và kết thúc | 7–8 |
| US-05.2 | Đầu hàng, xin hòa | 8 |
| US-05.3 | Mất kết nối, nối lại, gián đoạn | 8 |
| US-06.1 | Cài đặt PUBLIC/CODE_ONLY/LOCKED | 5 |
| US-06.2 | Sảnh, phòng công khai, luật chơi, điều hướng | 5, 7 |
| US-06.3 | Người xem, chuyển vai trò, đuổi | 9 |
| US-07.1 | Hai kênh chat, bộ lọc, chống spam | 10 |
| US-07.2 | Camera/mic, mức chia sẻ và thu hồi | 10 |
| US-08.1 | Thiết lập và chơi AI | 11 |
| US-08.2 | Máy cờ ba cấp | 11 |
| US-08.3 | Ổn định AI, lỗi/retry, chất lượng Khó | 11 |

Đối chiếu AC chi tiết tại Backlog P1; bảng này bảo đảm không bỏ sót Story khi review, không đánh dấu Story đã nghiệm thu.

## 13. Toàn bộ yêu cầu P2 và những gì cố ý không làm

### 13.1 Phân nhóm, tình trạng và nguyên tắc chung

P2 không chỉ có Ranked. P2 gồm thi đấu ngẫu nhiên, tiện ích ván, lịch sử/replay, giao tiếp xã hội, tài khoản và công cụ mở rộng. **Không yêu cầu phải chọn một hướng sản phẩm mới được đọc hoặc đánh giá đầy đủ P2.**

Nghiệp vụ dẫn về BA đã duyệt; 25 Story và ước lượng dưới đây được tổng hợp từ Backlog P2, bản phân rã chưa có xác nhận riêng của PO. Các tiêu chí được ghi để đánh giá/kiểm chứng, không phải bằng chứng PASS hoặc quyết định mới trong vòng review.

**Phân kỳ mới theo BA 0.20:** các mục 13.10 (custom), 13.11, 13.19, 13.20 đã thuộc **P1**; 13.17 (QR) đã bị loại bỏ. Tên mã/file `P2` và giờ dưới đây giữ truy vết gốc, không coi là công việc P2 còn chờ hoặc ước lượng mới.
**Bổ sung 0.21:** mục 13.21, 13.22, 13.25, 13.26 cũng đã chuyển toàn bộ P1; giữ mã/Epic/giờ cũ để truy vết, không dùng chúng tính tổng P2 còn lại.

| Epic P2 | Phạm vi yêu cầu | Giờ đề xuất trong backlog |
|---|---|---|
| EP-P2-01 | P2-01–06: Elo, Ranked, bảo vệ người nhận, bảng xếp hạng | 212 |
| EP-P2-02 | P2-07: ghép ngẫu nhiên Casual | 44 |
| EP-P2-03 | P2-08–10: Undo online, Tái đấu, Không giới hạn giờ | 108 |
| EP-P2-04 | P2-11–15: lịch sử, lưu AI, replay, Undo AI, FEN/PGN | 148 |
| EP-P2-05 | P2-16–19: QR, sticker, DM, Thách đấu | 104 |
| EP-P2-06 | P2-20–21: đổi username, khôi phục tài khoản | 64 |
| EP-P2-07 | P2-22–25: widget AI, demo mạng, chuyển media, theme | 88 |

Baseline P2: **7 Epic, 25 Story, 50 Task, 75 AC/TC, 768 giờ đề xuất**. Không cộng giờ P2 vào cam kết P1; chưa tự gán lịch/phát hành. Mỗi mục có Task triển khai và Task kiểm chứng trong nguồn; không nhân bản lịch Task tại đây.

**Quyền mặc định:** thành viên đủ điều kiện mới dùng P2; Khách giữ quyền P1 nhưng không được gửi lệnh P2 theo BA 0.3. Quyền phải kiểm ở API/socket/RLS phù hợp, không chỉ ẩn nút. Các tương tác giữa thành viên và đối thủ Khách cần được làm rõ riêng, xem 13.27.

Trong mỗi mục dưới đây, “Nghiệm thu” là kết quả bắt buộc cần quan sát; “Cần đánh giá” là câu hỏi mở, chưa sửa luật. Mã US-P2-xx dẫn tới mục cùng mã trong [Backlog P2](BACKLOG-P2.md); ba AC tương ứng là AC-P2-xx.1, .2 và .3.

### 13.2 P2-01 — Tính Elo và số ván Ranked

**Mục đích:** phản ánh kết quả thi đấu xếp hạng; không tính điểm cho giao lưu hoặc luyện máy.

- Elo ban đầu 1200. Với mỗi bên A: `E_A = 1 / (1 + 10^((R_B - R_A)/400))`; `R'_A = R_A + K_A × (S_A - E_A)`, trong đó S là 1/0,5/0 cho thắng/hòa/thua.
- Dùng Elo và số ván hoàn tất **trước trận**; K=32 cho ván 1–30, K=16 từ ván 31. Tính độc lập hai bên.
- Làm tròn Elo mới tới số nguyên gần nhất, phần 0,5 lên; sau đó áp sàn 100. Không ép tổng tăng/giảm bằng 0 khi K khác nhau hoặc chạm sàn.
- Chỉ Ranked hoàn tất cập nhật Elo và bộ đếm, đúng một lần. Casual, AI, INTERRUPTED không đổi; đầu hàng ngay nước đầu vẫn tính.

**Nghiệm thu:** bảng đáp án tính độc lập; kiểm biên ván 30/31, K khác nhau, sàn/làm tròn và hoàn tất trùng không cộng hai lần.

**Cần đánh giá:** Elo có phù hợp quy mô người chơi thực tế không; cần giải thích định vị 30 ván thế nào; không tự tuyên bố tuân thủ mọi quy định FIDE chỉ vì dùng công thức Elo.

**Truy vết:** US-P2-01; BA 7.1. Phụ thuộc: kết quả ván bền và chống trùng của P1.

### 13.3 P2-02 — Hàng đợi Ranked

**Mục đích:** tìm đối thủ theo Elo, không tự chọn người để đánh hạng.

- Chỉ thành viên chưa có vị trí chơi khác được tìm. Biên đầu ±100 Elo, mở thêm 50 mỗi 10 giây; dùng biên lớn hơn của hai người.
- Đúng 60 giây thử lần cuối với ±400 rồi mới timeout. Không tìm thấy thì về thông báo thử lại, không phạt và không ghép bot.
- Trước MATCH_FOUND được hủy không phạt; sau mốc đó không hủy tìm. Ghép phải nguyên tử, không đưa một người vào hai ván.
- Ghép được thì phe ngẫu nhiên, 10 phút/bên, vào ván ngay; không dùng xác nhận Ready 10 giây của Casual.
- Mất mạng quá 30 giây rút hàng đợi. Restart làm mất queue và báo tìm lại; đang queue không nhận mời phòng/Thách đấu.

**Nghiệm thu:** biên thời gian 10/60 giây, hủy đúng lúc tìm thấy, reconnect/restart, hai lượt ghép đồng thời và một vị trí chơi.

**Cần đánh giá:** với ít người, 60 giây/biên Elo có đủ cơ hội ghép không; phản hồi giao diện khi không có đối thủ.

**Truy vết:** US-P2-02; BA 7.1–7.2, 1.8. Phụ thuộc: P2-01, P2-03 và realtime/phiên P1.

### 13.4 P2-03 — Giới hạn một cặp Ranked trong 24 giờ

**Mục đích:** hạn chế hai tài khoản liên tục đấu nhau để bơm Elo.

- Một cặp chỉ được bắt đầu tối đa 3 ván Ranked trong cửa sổ trượt 24 giờ; tính cả ván bắt đầu rồi INTERRUPTED.
- Tại thời điểm t chỉ đếm `started_at > t − 24 giờ` và `started_at ≤ t`. Ván đúng mốc đầu cửa sổ đã hết hạn đếm.
- Cặp chạm trần bị bỏ qua âm thầm, tiếp tục tìm người khác. Không tự ghép cùng tài khoản, không chặn theo IP/thiết bị.
- Kiểm và ghi bắt đầu phải chống race, không để hai tiến trình ghép vượt giới hạn.

**Nghiệm thu:** ván thứ tư bị bỏ qua; đúng biên 24 giờ; INTERRUPTED vẫn đếm; dùng chung mạng không bị cấm; ghép đồng thời không vượt ba.

**Cần đánh giá:** giới hạn có gây khó ghép trong cộng đồng nhỏ không; đây chỉ là một biện pháp chống bơm điểm, không phải hệ thống chống gian lận đầy đủ.

**Truy vết:** US-P2-03; BA 7.2. Phụ thuộc: bản ghi bắt đầu ván, không dùng nhầm bộ đếm ván hoàn tất của Elo.

### 13.5 P2-04 — Quyền và vòng đời ván Ranked

- Chỉ hai thành viên được ghép có quyền; không Khách, người xem, PUBLIC, mời/chia sẻ để vào, Undo, đổi ghế hay Tái đấu. Cấm cả yêu cầu trực tiếp, không chỉ UI.
- Thời gian cố định 10 phút/bên, không cộng giây. Đầu hàng/rời giữa ván xử thua và tính Elo.
- Xin hòa chỉ khi **mỗi bên đã đi ít nhất 20 nước**, hạn trả lời 30 giây; bị từ chối chờ 5 nước tiếp theo của chính mình.
- Disconnect theo ân hạn 60 giây; hết giờ sớm hơn ưu tiên TIMEOUT. Server INTERRUPTED không đổi Elo.
- Sau ván giữ FINISHED; người chơi phải rời trước khi tìm mới. Không về WAITING/Ready hoặc nhận người mới. Đóng khi cả hai rời hoặc sau 10 phút từ kết thúc, không reset hạn khi một người rời.

**Nghiệm thu:** người ngoài/Khách và lệnh cấm bị từ chối; xin hòa tại biên 19/20 nước mỗi bên; kết quả/Elo nhất quán; đóng phòng đúng hạn.

**Cần đánh giá:** có cần điều kiện 20 nước để xin hòa không; thông báo đầu hàng và bỏ cuộc; không áp vòng đời phòng tự tạo sang Ranked.

**Truy vết:** US-P2-04; BA 2.0, 7.2, 8.1, 8.3. Phụ thuộc: P2-01–02 và lõi ván/đồng hồ P1.

### 13.6 P2-05 — Chat và bảo vệ người nhận media Ranked

- Hai người có Kênh Riêng; không Kênh Chung/người xem. Chat/sticker giữ bộ lọc và giới hạn tốc độ.
- Camera/mic mặc định tắt, chỉ có Không chia sẻ hoặc Chỉ đối thủ.
- **Phía người nhận mặc định ẩn cả hình và tiếng đối thủ**, dù đối thủ đang phát. Chủ động bấm Hiện mới nhận; luôn có Tắt ngay để dừng nhận.
- Reconnect không tự hiện lại media đang bị ẩn. Không ghi hình/âm, không cấp quyền cho người ngoài.

**Nghiệm thu:** quan sát track/audio thực ở người nhận trước/sau Hiện, Tắt ngay và reconnect; không chỉ kiểm trạng thái nút.

**Cần đánh giá:** cơ chế tự bảo vệ đã đủ cho người chơi lạ chưa khi report/admin đang ngoài phạm vi; tương tác giữa quyền chia sẻ bên gửi và quyền nhận bên nhận.

**Truy vết:** US-P2-05; BA 4.1, 5.4. Phụ thuộc: P2-04, media/chat P1; sticker qua P2-17.

### 13.7 P2-06 — Bảng xếp hạng và thẻ tóm tắt

- Top 50, có dòng ghim cá nhân kể cả ngoài Top 50. Chỉ xếp hạng sau ít nhất 5 Ranked hoàn tất; chưa đủ ghi cần thêm X ván, Khách không có bảng.
- Thứ tự: Elo giảm → số thắng Ranked giảm → thời điểm đạt Elo sớm hơn → user_id tăng. Không reset mùa.
- Thống kê W/D/L và tỷ lệ thắng của bảng/thẻ chỉ lấy Ranked hoàn tất; không tính INTERRUPTED hoặc AI Bỏ dở.
- Thẻ có avatar, Display Name, @username, Elo, cấp và W/D/L; không tạo trang hồ sơ công khai. DM chỉ cho bạn đã chấp nhận.

| Cấp | Elo |
|---|---|
| Người mới | < 1200 |
| Sơ cấp | 1200–1399 |
| Trung cấp | 1400–1599 |
| Cao cấp | 1600–1799 |
| Kiện tướng | 1800–1999 |
| Đại sư | ≥ 2000 |

Chưa có ván Ranked nào thì nhãn Chưa xếp hạng dù Elo khởi tạo 1200. Nhãn cấp sau khi có ván và điều kiện đủ 5 ván để lên bảng là hai điều kiện khác nhau.

**Nghiệm thu:** biên 0/4/5 ván, mọi biên cấp, đồng điểm, ngoài Top 50, dữ liệu rỗng/lỗi và quyền Khách.

**Cần đánh giá:** cấp bậc có gây nhầm khi chưa đủ 5 ván không; các chỉ số công khai cần giữ ở mức nào.

**Truy vết:** US-P2-06; BA 7.1, 7.3, 5.5. Phụ thuộc: P2-01, P2-11 và bạn bè P1.

### 13.8 P2-07 — Ghép ngẫu nhiên Casual

- Thành viên chưa có vị trí chơi tìm tối đa 3 phút, hủy khi đang tìm không phạt. Hết hạn báo không tìm được, không thay bằng máy.
- Khách bị từ chối theo BA 0.3. Mất mạng quá 30 giây rút queue.
- Ghép được: người chờ trước là Host, phe ngẫu nhiên, 15 phút/bên không cộng giây.
- Hai người xác nhận Sẵn sàng trong 10 giây rồi mới đếm 3 giây. Người không xác nhận về Sảnh; người đã xác nhận tự tìm tiếp; cả hai không xác nhận thì cùng về Sảnh. Chưa bắt đầu không ghi thua.
- Không Elo, PUBLIC, người xem, chia sẻ hoặc Kênh Chung; không được dùng settings mở người xem. Có chat/media riêng, Undo/Tái đấu theo P2-08–09.
- Sau ván FINISHED đến khi cả hai rời hoặc 10 phút từ kết thúc; không về WAITING, không nhận người mới.

**Nghiệm thu:** hủy/ghép/xác nhận cùng lúc, xác nhận một hoặc hai bên, timeout, disconnect và không mở được quyền phòng tự tạo.

**Cần đánh giá:** có cần đồng thời Casual ngẫu nhiên và Ranked ở quy mô nhỏ không; xác nhận 10 giây có phù hợp trên điện thoại không.

**Truy vết:** US-P2-07; BA 2.0, 1.8. Phụ thuộc: phòng/ván/phiên P1; nghiệm thu tiện ích liên quan P2-08–09.

### 13.9 P2-08 — Xin đi lại online

- Chỉ phòng tự tạo hoặc Casual ngẫu nhiên; Ranked cấm. Khách không có quyền P2.
- Người xin đã đi ít nhất một nước; mỗi người chỉ một đề nghị đang chờ, hạn 30 giây, được rút. Trong lúc chờ người xin không đi nước mới.
- Đồng ý thì lùi tới **trước nước gần nhất của người xin**: lùi một nước nếu đối thủ chưa đi tiếp, hai nước nếu đã đi tiếp.
- Tối đa 3 lần thành công/bên/ván; chỉ thành công mới trừ lượt. Từ chối/hết hạn chờ 3 nước tiếp theo của chính người xin.
- Đồng hồ vẫn chạy và không hoàn thời gian. Nhánh bị Undo không được tính trong lặp thế, không ăn quân hoặc replay hiệu lực.
- Đề nghị dạng không khóa bàn cờ; X/Esc thu gọn chứ không từ chối. Chấp nhận muộn/phiên bản cũ không hồi sinh ván kết thúc.

**Nghiệm thu:** lùi 1/2 nước, lượt thứ tư, nhánh lặp, bảo toàn giờ, kết thúc ván đồng thời accept, quyền Ranked/Khách.

**Cần đánh giá:** lợi ích so với phức tạp của nhánh nước và tranh chấp; hành vi khi đối thủ là Khách chưa được quyền P2 cần chốt rõ.

**Truy vết:** US-P2-08; BA 3.2, 3.6, 0.12. Phụ thuộc: lõi/cây nước/lệnh P1 và Casual P2-07.

### 13.10 P2-09 — Tái đấu có chọn phe: custom P1 / Casual P2

- Phòng tự tạo/Casual sau ván; không Ranked hoặc Khách. Chọn Giữ phe/Đổi phe, mặc định Đổi; người nhận thấy lựa chọn và có 30 giây.
- Đồng ý → đếm 3 giây, tạo Match ID mới trong cùng phòng, không cần Sẵn sàng lại.
- Giữ danh sách chặn, chế độ, người xem của phòng tự tạo và chat cùng cặp. Casual reset 15 phút/bên.
- Không dùng Tái đấu thì phòng tự tạo vẫn theo P1: WAITING → Xin đổi bên nếu muốn → Ready.
- Hai đề nghị đồng thời giữ đề nghị tới trước, hủy đề nghị sau và hiện đề nghị đối thủ.
- Casual chỉ accept trước hạn đóng 10 phút mới hủy timer cũ; quá hạn/thay ghế không được hồi sinh ván/phòng cũ.

**Nghiệm thu:** hai lựa chọn phe, đề nghị chéo, đổi thành phần ghế, sát hạn đóng phòng và giữ chat đúng cặp.

**Đã chốt:** giữ cả Tái đấu custom và đường Ready/Xin đổi bên; Khách không gửi/nhận Tái đấu theo quyền nguồn. Kiểm tránh hai luồng cùng khởi tạo ván.

**Truy vết:** US-P2-09; BA 0.8/0.20, 2.3, 5.3. Custom P1 phụ thuộc chơi tiếp/đổi bên P1, không chờ P2-07; chỉ phần Casual chờ ghép ngẫu nhiên P2.

### 13.11 P2-10 — Không giới hạn giờ và chống treo ván: P1

- Thành viên tạo phòng có Không giới hạn mặc định; 5/10/15 vẫn có, không cộng giây; Thách đấu mặc định 10. Khách không tự tạo mức Không giới hạn nhưng được chơi/xem phòng mức này do thành viên tạo, theo quyền/chỗ trống và cùng chống treo (PO 0.21).
- Chỉ bên **đang tới lượt** không đi 3 phút mới bị hỏi; banner đếm 30 giây, không modal, không che bàn/Đầu hàng hay giữ focus.
- Im lặng hết 30 giây → thua INACTIVITY. “Tôi còn đây” reset 3 phút tối đa hai lần liên tiếp chưa có nước mới.
- Lần nhắc thứ ba không có nút xác nhận; hết hạn thua. Có nước mới reset chuỗi nhắc.
- Không áp cơ chế này cho AI, Ranked hoặc Casual vốn có thời gian cố định riêng.

**Nghiệm thu:** biên 3 phút/30 giây, hai lần xác nhận và lần ba, reset sau nước mới, không hỏi nhầm bên chưa tới lượt.

**Đã chốt:** Khách được chơi/xem phòng Không giới hạn do thành viên tạo theo BA 0.21; không tự tạo mức này. Mặc định thành viên Không giới hạn không đổi phòng đang có; mức giờ cố định sau tạo.

**Truy vết:** US-P2-10; BA 2.1, 3.3 mục 5. Phụ thuộc: form phòng, đồng hồ và kết quả P1.

### 13.12 P2-11 — Lịch sử cá nhân và phân loại kết quả

- Thành viên xem/lọc tất cả, Ranked, Casual, AI; từng ván có phe, đối thủ, loại, kết quả/lý do, biến động Elo nếu có; AI ghi cấp độ.
- Chỉ người chơi của ván được đọc theo quyền; người xem/người ngoài/Khách không có History/Replay. Thành viên đấu với Khách vẫn có lịch sử của mình.
- Khi phiên Khách hết hạn, tên trong lịch sử chuyển thành tên chung “Khách” theo backlog.
- INTERRUPTED và AI Bỏ dở vẫn có lịch sử/replay nhưng không tính W/D/L, tỷ lệ thắng, Elo hoặc bộ đếm xếp hạng.
- Bảng/thẻ thống kê chỉ Ranked; danh sách lịch sử hiển thị mọi loại. Không dùng kết quả trung tính làm hòa.

**Nghiệm thu:** lọc và nhãn đúng, ma trận kết quả, ẩn danh Khách hết phiên; đoán ID/gọi trực tiếp API/RLS không đọc được ván người khác.

**Cần đánh giá:** lưu lịch sử bao lâu, phân trang/tìm kiếm cần đến mức nào, cách giải thích thống kê Ranked so với lịch sử mọi ván; chưa tự đặt chính sách lưu giữ mới.

**Truy vết:** US-P2-11; BA 6.2, 7.3, 1.3 với quyền Khách ưu tiên 0.3. Phụ thuộc: dữ liệu online P1, P2-12 cho AI.

### 13.13 P2-12 — Lưu ván AI và kết quả Bỏ dở

- Thành viên kết thúc AI thắng/thua/hòa/đầu hàng → lưu loại AI, cấp EASY/MEDIUM/HARD và nhánh nước hiệu lực, chống ghi trùng.
- Trong 30 phút mất mạng/đóng tab vẫn quay lại cùng URL; quá hạn lưu Bỏ dở, không tính W/D/L/Elo. Ván Khách không lưu.
- Engine chỉ chậm quá 10 giây không tự chuyển Bỏ dở; giữ thế để tính lại. Lỗi thật đã làm ABANDONED thì lưu đúng, Retry tạo ID mới.
- Không giả khôi phục một ván P1 trong bộ nhớ đã mất sau restart; chính sách độ bền trạng thái đang chơi cần phân biệt với lưu lịch sử kết thúc.

**Nghiệm thu:** kết thúc/expiry/lỗi ghi đúng một record, replay đúng nhánh; không lưu ván Khách; timeout không tạo Bỏ dở giả.

**Cần đánh giá:** có cần phục hồi ván AI đang chơi sau restart không; xử lý bản lưu một phần; không suy từ “lưu lịch sử” rằng đã cam kết khôi phục toàn bộ ván.

**Truy vết:** US-P2-12; BA 6.1–6.3. Phụ thuộc: AI P1, P2-11.

### 13.14 P2-13 — Replay riêng tư

- Chỉ người chơi của ván, kể cả chủ ván AI có quyền, mở `/history/:id`; không người xem, link chia sẻ công khai hoặc route replay thay thế.
- Chỉ dựng nhánh nước hiệu lực, không lộ nước bị Undo. Biên bản tiếng Việt; có về đầu, trước, sau, cuối và chọn dòng nước.
- Tự chạy mỗi 1,5 giây/nước, đúng thứ tự và dừng ở cuối; controls biên không đi ngoài danh sách.
- Replay chỉ đọc, không gửi lệnh thay đổi ván live.

**Nghiệm thu:** so từng thế/lượt với đáp án độc lập; biên đầu/cuối, autoplay, Undo, quyền API/RLS/URL.

**Cần đánh giá:** chỉ cần xem lại hay muốn thêm phân tích; phân tích/hint không tự nằm trong yêu cầu Replay hiện tại.

**Truy vết:** US-P2-13; BA 6.2, danh mục SCR-REPLAY. Phụ thuộc: P2-11, lõi/cây nước; hồi quy Undo P2-08/14.

### 13.15 P2-14 — Đi lại với máy

- Thành viên đã có ít nhất một nước của mình được Undo, không cần máy đồng ý; Khách bị từ chối theo BA 0.3.
- Thông thường lùi hai nửa nước (người + máy) để trả lượt người. Nếu máy đang nghĩ, hủy tác vụ và lùi một nước vừa đi của người.
- Tối đa 3 lần thành công/ván, hiển thị X/3; không trừ lượt nếu thất bại. Chưa có nước mình, đã kết thúc hoặc hết lượt thì disabled/từ chối có lý do.
- Cầm Đen và mới có một nước mở đầu của máy chưa được Undo. Kết quả worker cũ trả sau khi hủy không được áp vào thế mới.
- Lịch sử/replay/lặp thế chỉ theo nhánh hiệu lực.

**Nghiệm thu:** Undo lúc đang nghĩ/đã trả nước, nước mở đầu Đen, lần thứ tư, kết quả worker muộn, ván kết thúc và nhánh lịch sử.

**Cần đánh giá:** Undo có nên thành tiện ích luyện tập sớm hơn không; giới hạn 3 lần có phù hợp mục tiêu luyện tập; chưa thay quyền Khách.

**Truy vết:** US-P2-14; BA 6.3. Phụ thuộc: AI/engine P1, lưu/replay liên quan P2-12–13.

### 13.16 P2-15 — Copy FEN và tải PGN

- Người có quyền Replay được copy FEN của **thế đang xem**, gồm quân và bên tới lượt.
- Tải `.pgn` của đúng ván, biên bản/kết quả và nhánh hiệu lực; không xuất nhánh đã Undo hoặc gọi dịch vụ cờ ngoài.
- Quyền xuất giống Replay; Khách, người xem và người ngoài đoán ID bị từ chối.

**Nghiệm thu:** dữ liệu mẫu có đáp án, đọc lại FEN/PGN đúng thế/lượt/kết quả; clipboard/download thật; API không vượt quyền.

**Cần đánh giá:** định dạng/ký pháp cờ tướng và công cụ đích cần tương thích phải được chỉ rõ trước khi chốt tiêu chí liên thông; không mặc định PGN cờ vua là đủ.

**Truy vết:** US-P2-15; BA 9.1. Phụ thuộc: P2-13 và ký pháp/lõi luật.

### 13.17 P2-16 — QR mời phòng: ĐÃ LOẠI KHỎI PHẠM VI

PO bỏ theo BA 0.20: không QR/ảnh/nút tải hoặc copy QR ở P1/P2; chỉ **Sao chép link / Sao chép mã**, vẫn giữ tab mời bạn bè. `US-P2-16`/XIAN-130 và các AC/Task QR chỉ giữ lịch sử, không còn yêu cầu triển khai hoặc quét/giải mã để nghiệm thu. Không tự sửa/xóa issue Jira.


### 13.18 P2-17 — Bộ 12 sticker

- Khay cảm xúc gửi một chạm, lưu shortcode, hiển thị SVG; không nhận HTML/SVG tùy ý từ người dùng.
- Danh sách: `clap` (vỗ tay), `heart` (tim), `think` (suy nghĩ), `sweat` (toát mồ hôi), `cry` (khóc), `tea` (trà), `lightning` (nhanh), `silent` (cạn lời), `thumbsup` (đồng ý), `handshake` (giao lưu), `flag` (đầu hàng tâm phục), `fire` (kịch tính).
- Theo quyền chat: người xem chỉ Chung, Ranked chỉ Riêng, DM chỉ bạn accepted; Khách không gửi sticker P2.
- Server kiểm allowlist, quyền, giới hạn tốc độ/độ dài phù hợp; không dùng shortcode để vượt bộ lọc hoặc XSS.

**Nghiệm thu:** đủ 12 biểu tượng, render đúng, shortcode lạ/quyền giả bị từ chối, không bypass chống spam, hoạt động ở từng kênh có quyền.

**Cần đánh giá:** có đáng giữ đủ bộ không; nhận sticker từ thành viên trong kênh có Khách cần phân biệt với quyền gửi của Khách.

**Truy vết:** US-P2-17; BA 5.1, 5.3–5.4. Phụ thuộc: chat P1, P2-18 cho DM.

### 13.19 P2-18 — Chat trực tiếp và tin chưa đọc: P1

- Chỉ hai tài khoản đã là bạn accepted được đọc/gửi DM; API/socket/RLS từ chối người lạ, bên thứ ba và Khách.
- Lịch sử DM lưu bền. Hủy kết bạn thu hồi quyền ngay và ẩn lịch sử, không xóa; kết bạn lại hiện lại.
- Badge là tổng **tin đến chưa đọc từ bạn hiện tại**, không đếm tin mình gửi.
- Chỉ đánh dấu đọc khi tin thực sự hiển thị trong viewport hội thoại ở tab đang hoạt động. Tải ngầm/tab nền không đánh dấu đọc.
- Server lưu/đồng bộ read giữa thiết bị. Unfriend bỏ hội thoại khỏi badge nhưng giữ read state; refriend chỉ tính lại tin còn unread.
- Bộ lọc và giới hạn chat vẫn áp dụng; không có chat thế giới.

**Nghiệm thu:** đọc trái quyền bị chặn; tab nền/cuộn chưa tới không read; đồng bộ thiết bị; unfriend/refriend và tin đến đồng thời không sai badge.

**Cần đánh giá:** chính sách giữ/xóa DM, nhu cầu chặn/quấy rối khi không có report/admin; không tự thêm tính năng quản trị ngoài phạm vi.

**Truy vết:** US-P2-18; BA 5.2, 5.5, 8.2. Phụ thuộc: bạn bè/xác thực/chat P1.

### 13.20 P2-19 — Thách đấu bạn bè: P1

- Từ bạn accepted đang Online mở lại form tạo phòng; mặc định **10 phút / CODE_ONLY / 5 người xem**, được chỉnh trong phạm vi mức giờ/quyền hợp lệ.
- Không nhập tên phòng theo BA 2.7 cập nhật; tên/mã tự sinh. Hủy form không tạo phòng hoặc gửi lời mời.
- Chỉ xác nhận mới tạo phòng rồi mời đúng bạn đích; server kiểm một vị trí, friendship/Online/BUSY và cooldown 10 giây toàn người gửi theo BA 0.19. Retry không tạo trùng; popup/expiry/reply dùng lại YC3.
- Không mời người bận/offline, không cấp quyền cho Khách. Nếu đã tạo phòng rồi bạn vừa bận/từ chối/hết hạn, phòng vẫn tồn tại cho Host quản lý.
- Không tự đóng phòng/chuyển AI/giả thành công nếu gửi thất bại hoặc không được nhận. Đây là đường tắt tạo phòng + mời P1, không phải mời vào phòng hiện có.

**Nghiệm thu:** hủy không có tác dụng phụ, confirm đúng một lần, race bạn vừa bận, từ chối/hết hạn giữ phòng, không vượt một vị trí chơi.

**Đã chốt:** Thách đấu thuộc P1 theo BA 0.20, dùng chung tạo phòng/lời mời; UI báo rõ phòng đã tạo khi bạn không vào hoặc gửi thất bại.

**Truy vết:** US-P2-19; BA 0.20, 2.7 mục 4, 2.5. AC-P2-19.1 đã đồng bộ **không nhập tên**, mặc định 10 phút/CODE_ONLY/5 người xem.

### 13.21 P2-20 — Đổi username qua OTP: P1

- Luồng: yêu cầu đổi → gửi OTP tới email → xác minh → nhập và xác nhận username mới.
- OTP 6 số/180 giây, resend 60 giây; giới hạn gần đúng 5 lần sai theo BA 1.5. Chỉ OTP đúng mới mở quyền đổi.
- Username mới 3–20 ký tự, đúng mẫu/từ cấm và unique không phân biệt hoa thường; không cooldown đổi.
- Tên cũ giữ 30 ngày chỉ chủ cũ lấy lại được; người khác thấy đã có người dùng, đúng 30 ngày hết giữ chỗ.
- Giữ user_id, bạn bè, DM, ván và Elo; không tự đổi Display Name. Email đã xác minh vẫn bất biến.

**Nghiệm thu:** trùng tên/race, OTP sai/hết hạn, chủ cũ lấy lại/biên 30 ngày, dữ liệu trước/sau nguyên vẹn, API không vượt xác minh.

**Đã chốt 0.21:** thiếu email verified dẫn thêm/xác minh, không OTP tới email tùy ý/kỹ thuật; giữ mọi phiên hợp lệ/hạn cũ, không gián đoạn ván. Đăng nhập mới dùng Username mới; không cooldown đổi theo BA nguồn.

**Truy vết:** US-P2-20; BA 1.4–1.6, 0.2. Phụ thuộc: email/OTP, hồ sơ/phiên P1 và dữ liệu định danh bền.

### 13.22 P2-21 — Khôi phục username (không gồm đặt lại mật khẩu): P1

- Người quên username nhập email, phản hồi chung "Nếu email này đã đăng ký, mã khôi phục đã được gửi".
- OTP đúng mới hiện username hiện tại; OTP 6 số/180 giây, resend 60 giây, giới hạn theo BA 1.5. Email không lên URL.
- Sau khi biết username, về Login dùng mật khẩu hiện có; không tự reset hoặc cấp phiên ứng dụng. Nếu cũng quên mật khẩu thì chủ động dùng luồng username/OTP **P1**.
- Tài khoản chưa có email đã xác minh không có địa chỉ dùng cho luồng này. Không thêm khôi phục qua admin.

**Nghiệm thu:** không lộ username trước OTP; phản hồi email có/không cùng dạng; OTP sai/hết hạn/khác mục đích không có quyền; khôi phục username không tự đổi mật khẩu.

**Cần đánh giá:** trải nghiệm nối tiếp sang Quên mật khẩu P1; ranh giới quyền của hai mục đích OTP.

**Truy vết:** US-P2-21, BA 0.21/1.7/1.5; cùng P1 với reset theo 0.18 nhưng quyền OTP tách biệt. Giờ/Task chưa tái lập kế hoạch.

### 13.23 P2-22 — Widget thông số AI

- Hiển thị nodes, độ sâu thực, thời gian tính và PV từ worker thật, đúng ván/tác vụ; không số giả hoặc dịch vụ cờ ngoài.
- Khi hết budget phải phản ánh độ sâu thực đạt, không gắn nhãn depth mục tiêu như đã hoàn thành.
- Kết quả/tác vụ đã hủy không cập nhật nhầm widget của thế/ván mới. Không làm mất ngưỡng phản hồi P1.
- PV chỉ là đầu ra máy đang tính cho bên máy, không tính hint cho bên người.

**Nghiệm thu:** đối chiếu widget với trace worker thực, timeout/cancel và budget; không có gợi ý nước người hoặc dữ liệu tác vụ cũ.

**Cần đánh giá:** đây là công cụ chứng minh thuật toán hay tính năng người dùng; PV có làm lộ ý đồ máy và ảnh hưởng trải nghiệm không; điều kiện hiển thị cần chốt riêng.

**Truy vết:** US-P2-22; BA 9.2, 6.1. Phụ thuộc: engine/telemetry/AI P1.

### 13.24 P2-23 — Công cụ demo mạng

- Chỉ môi trường bật cờ demo; không tạo vai trò Admin mới.
- Mô phỏng mất mạng bằng ngắt socket thật để bên kia nhận ân hạn 60 giây; reconnect nhận snapshot bàn cờ/đồng hồ/vai trò từ server thật.
- Môi trường chính thức tắt: UI không xuất hiện và server từ chối API/socket giả lập, không chỉ giấu nút.
- Không cho người ngoài phòng điều khiển; mô phỏng không thay bằng chứng rút mạng/LAN thiết bị thật.

**Nghiệm thu:** positive khi bật flag, negative trực tiếp khi tắt, snapshot đúng sau nối lại, không mở quyền điều khiển ngoài phạm vi.

**Cần đánh giá:** có cần đưa công cụ vào bản phân phối hay chỉ dùng khi bảo vệ; cách tránh bật nhầm cờ demo.

**Truy vết:** US-P2-23; BA 9.3. Phụ thuộc: realtime/reconnect P1.

### 13.25 P2-24 — Chuyển thiết bị media giữa tab: P1

- Khi tab thứ hai cùng thiết bị tranh camera/mic, hiện hộp Chuyển thiết bị sang tab này / Hủy bỏ.
- Chọn Chuyển: dừng track/thu hồi phát ở tab cũ, tab cũ chỉ đọc; tab mới bật thiết bị theo quyền và thao tác được chấp thuận.
- Hủy không tự chiếm thiết bị. Tab cũ reconnect không tự giành lại control/media.
- Không thay luật P1: tiếp quản tab bình thường dừng media cũ, tab mới mặc định tắt; chuyển media là hành động chủ động thêm.
- Không áp cơ chế tab để lách luật đăng nhập thiết bị khác xử thua.

**Nghiệm thu:** hai tab thật, Chuyển/Hủy/reconnect; quan sát track và quyền phát cũ dừng, chỉ đúng tab giữ điều khiển.

**Cần đánh giá:** phân biệt lời nhắc trình duyệt cấp thiết bị với modal của app; rủi ro hai luồng tiếp quản làm người dùng khó hiểu.

**Truy vết:** US-P2-24; BA 1.8, danh mục MODAL-MEDIA-TAB-SWITCH. Phụ thuộc: phiên và media P1.

### 13.26 P2-25 — Giấy Sáng và Theo hệ thống: P1

- Bộ chọn Hồ sơ P1 có Kỳ Đài Cổ Phong/Giấy Sáng/Theo hệ thống; chưa chọn mặc định Kỳ Đài Cổ Phong. Lưu lựa chọn theo tài khoản/đồng bộ thiết bị; Khách giữ hạn chế chọn theme bổ sung.
- Theo hệ thống dùng OS từng thiết bị, không đồng bộ màu thực tế; explicit không bị OS ghi đè.
- Không đổi màu bàn cờ giữa theme; phông theo Design 3.1.
- Mọi theme giữ tương phản, bàn phím, reduced motion và đủ trạng thái UI; responsive không cuộn ngang hoặc che bàn/Đầu hàng/đồng hồ.
- Backlog yêu cầu kiểm bốn kích thước; ma trận kích thước cụ thể theo đặc tả giao diện, không suy đã đạt từ một ảnh desktop.

**Nghiệm thu:** OS đổi sáng/tối, theme explicit giữ nguyên, mọi trạng thái và bốn kích thước theo nguồn; kiểm màu bàn cờ/contrast thực.

**Đã chốt 0.21:** theme thuộc P1, lưu theo tài khoản/đồng bộ lựa chọn giữa thiết bị. Cần bằng chứng lưu/reload/cách ly tài khoản/OS/thiết bị, không suy từ token.

**Truy vết:** US-P2-25; BA 10.3, Design 2.3/3.1. Phụ thuộc: tokens, settings và bàn cờ P1.

### 13.27 Quyền, dữ liệu và hành vi liên chức năng

**Những quy tắc đã có cần giữ đồng nhất:**

- Link/mã không vượt LOCKED, danh sách chặn, ghế hoặc sức chứa. QR đã loại bỏ theo BA 0.20.
- Khóa rồi mở phòng thu hồi lời mời cũ, không thu quyền media của người đang ở lại chỉ vì khóa phòng. Mã/link mới không được nhầm với ID phòng/ván.
- Mức giờ không đổi sau tạo. Mặc định Không giới hạn áp form tạo phòng thành viên P1 theo 0.20, không sửa phòng đang tồn tại hoặc mặc định 10 phút của Thách đấu.
- Elo chỉ Ranked hoàn tất; giới hạn cặp Ranked đếm **bắt đầu**, kể cả INTERRUPTED; hai bộ đếm không dùng thay nhau.
- Undo thay nhánh hiệu lực; replay, FEN/PGN, lặp thế và không ăn quân phải đi theo nhánh mới. Không xóa/ghi đè lịch sử trái quy định để giả Undo.
- Khôi phục/đổi username phải giữ cùng danh tính và quyền dữ liệu. Thêm email đầu tiên không đồng nghĩa cho đổi email đã xác minh.
- Chat phòng xóa khi phòng đóng; DM giữ khi unfriend nhưng ẩn; lịch sử/replay riêng người chơi. Không áp một chính sách xóa cho cả ba.

**Các khoảng trống/mâu thuẫn cần PO đánh giá, chưa có luật mới:**

| Điểm | Vì sao cần chốt |
|---|---|
| Thành viên dùng Undo/Tái đấu với đối thủ Khách | Undo vẫn P2; Tái đấu custom lên P1 nhưng giữ quyền nguồn không cho Khách gửi/nhận; không tự đồng ý thay họ |
| Khách trong phòng Không giới hạn — đã chốt 0.21 | Được chơi/xem theo quyền/chỗ trống, chịu chống treo; vẫn không tự tạo mức này |
| Sticker trong kênh có Khách | Quyền gửi bị cấm không tự suy thành cấm đọc/render tin hợp lệ của thành viên |
| Đổi/tìm Username thiếu email — đã chốt 0.21 | Đổi tên cần bổ sung/xác minh trước; tìm tên không có đường recovery nếu thiếu email verified. Không dùng email kỹ thuật |
| Lịch sử AI sau restart | Lưu ván kết thúc không tự bảo đảm khôi phục thế đang chơi; cần quy định mất trạng thái/bản lưu một phần rõ |
| Chuẩn FEN/PGN cờ tướng | Cần chỉ rõ ký pháp và tương thích mong muốn trước khi nghiệm thu xuất/nhập với công cụ khác |

Không mở rộng quyền Khách hoặc giảm nghiệm thu để lấp các khoảng trống trên. Khi chưa rõ, ghi cần quyết định; BA nguồn vẫn giữ hiệu lực.

### 13.28 Phụ thuộc, chất lượng và trình tự xem xét P2

Đây là phụ thuộc chức năng, không phải lịch Sprint mới:

- Kết quả/lệnh bền P1 → Elo P2-01 và giới hạn cặp P2-03 → queue P2-02 → quyền Ranked P2-04 → trải nghiệm media Ranked P2-05.
- Dữ liệu lịch sử P2-11 + Elo → bảng P2-06. AI P1 + lưu P2-12 + Undo P2-14 phải được nghiệm thu nhất quán với Replay P2-13 → xuất P2-15.
- Bạn bè/chat P1 → DM/unread P1 → sticker DM P2. Phòng/lời mời P1 → Thách đấu P1; QR bị loại bỏ, không là dependency.
- Cây nước/phiên bản/đồng hồ P1 → Undo online P2-08. Vòng đời custom → Tái đấu custom P1; chỉ Tái đấu Casual chờ P2-07.
- OTP/email/phiên P1 → Đổi/Khôi phục Username P1; media/ownership P1 → chuyển media tab P1; Hồ sơ/token UI → theme đồng bộ tài khoản P1. Chưa triển khai các phần bổ sung này.
- Widget, demo mạng và theme không thay thế chất lượng AI, reconnect hoặc trợ năng nền.

Một Task có thể làm khi đủ đầu vào; không suy mọi P2 phải chờ toàn bộ P1 xong. Ngược lại, có UI/worker riêng không đủ để đóng chức năng chưa tích hợp. Chi tiết phụ thuộc Task triển khai/QA giữ ở Backlog P2.

**Thứ tự PO đã chốt:** YC1–YC8 P1 trước, P1 ổn mới P2. Ngoại lệ phân kỳ được duyệt là hai chức năng mật khẩu lên P1; phần P2 còn lại giữ nguyên. Không ưu tiên chỉ vì module đã có code.

### 13.29 Ngoài phạm vi hiện hành

Giải đấu; hint AI; cộng giây; đổi chữ Hán sang chữ Việt; đổi email đã xác minh; xóa tài khoản trong ứng dụng; report/admin/ban; chặn người dùng riêng; tải avatar; trang hồ sơ công khai; đa ngôn ngữ; điều khoản/chính sách riêng tư; luật đuổi quân chi tiết; bảng xếp hạng theo ngày/tuần/mùa. **Đổi mật khẩu trong Hồ sơ không còn ngoài phạm vi, thuộc P1 từ 30/10.**

Loại trừ không có nghĩa các mục đó không bao giờ cần, và không có nghĩa tự chuyển sang P2. Nếu PO muốn mở lại, ghi quyết định mới, tác động dữ liệu/bảo mật/chi phí và cập nhật nguồn. Ví dụ chính sách riêng tư/khôi phục có thể quan trọng cho phát hành công khai nhưng chưa được tự thêm bằng tài liệu này.

Nguồn tổng của mục 13: BA 0.3, 0.8, 0.11, 1.4–1.8, 2.0–2.8, 3.2–3.6, 4.1–4.3, 5.1–5.5, 6.1–6.3, 7.1–7.3, 8.1–8.3, 9, 10–11; Backlog P2 đủ US-P2-01–25.

## 14. Nghiệm thu và các điểm cần làm rõ

### 14.1 Điều kiện hoàn thành hiện hành

Mọi AC có kết quả và bằng chứng; code được review/tích hợp theo quy trình nhóm; đủ trạng thái UI; chạy trên môi trường demo; không còn lỗi Nghiêm trọng/Cao; không lộ dữ liệu; tài liệu chạy/cấu hình được cập nhật. Phân biệt PASS, FAIL và BLOCKED, không hạ ngưỡng để báo xong.

| Demo | Nội dung đầu-cuối hiện hành |
|---|---|
| D1 | Đăng ký với OTP thật tới Gmail ngoài nhóm, vào Sảnh, đổi Display Name |
| D2 | Google onboarding, đăng xuất, đăng nhập bằng mật khẩu rồi Google |
| D3 | Sai mật khẩu 5 lần, khóa 15 phút, Google vẫn đăng nhập được |
| D4 | Tạo phòng, mời bạn online, người khác vào bằng mã/link và Khách |
| D5 | Đổi bên, Sẵn sàng, đấu click/kéo thả, xin hòa, chat, media, chiếu hết |
| D6 | PUBLIC ở Sảnh, khóa phòng, chặn mã cũ, đuổi và ngăn danh tính quay lại |
| D7 | Ở lại phòng, đổi bên, ván hai, chuyển Host khi một người rời |
| D8 | Mất mạng 30 giây quay lại, quá 60 giây xử thua |
| D9 | AI Dễ cầm Đỏ, đầu hàng, ván mới cầm Đen cấp Khó, giải thế chiếu hết |
| D10 | Đăng nhập thiết bị khác giữa ván, thiết bị cũ thua/bị đăng xuất |

Chín cổng kiểm chứng: SMTP, Google, email bất biến, đăng nhập username, phiên, Khách, media, engine, realtime. SMTP/OAuth/LiveKit/RLS thật và máy demo thật không được thay bằng mock/unit. Media ghi số đo thu hồi quyền/tài nguyên/hạn mức theo gate, không tự đặt ngưỡng mới.

**Điểm cần rà độ phủ, không phải yêu cầu mới:** D1 vẫn có giá trị cho nhánh OTP; sau cập nhật 29/10 cần đối chiếu bằng chứng cho cả bỏ qua email/OTP và thêm email sau, không dùng riêng D1 để tuyên bố toàn bộ đăng ký đạt.

### 14.1.1 Nghiệm thu P2 và hồi quy P1

- Phủ đủ 75 AC/TC và các biến thể của 25 Story, không coi ba hàng AC của mỗi Story là chỉ ba tình huống cần kiểm.
- Kiểm dữ liệu Elo bằng đáp án độc lập, thời gian sát biên, tranh chấp lệnh/ghép, cây nước Undo và từng thế Replay; đối chiếu dữ liệu lưu bền.
- Kiểm API/socket/RLS trực tiếp bên cạnh UI: giả quyền, đoán ID, lệnh cũ/trùng, OTP recovery không có quyền app, chức năng demo bị tắt.
- Dịch vụ thật: SMTP/Google/RLS trên môi trường được phép; track media Ranked/chuyển tab quan sát thật. QR bị loại, không còn gate quét điện thoại. Mock không thay bằng chứng dịch vụ thật.
- Hồi quy D1–D10, 12 NFR và 9 gate; mỗi phần ghi PASS/FAIL/BLOCKED, bản dựng, môi trường, dữ liệu, ngày và bằng chứng. Không coi mô phỏng mất mạng là đã thử LAN thật.
- Kiểm bản sao mới, migration, hướng dẫn chạy, dữ liệu thử và bí mật trong Git/bundle/bằng chứng. Không đóng triển khai khi chỉ có mock, placeholder hoặc màn hình không nối backend.

**Ma trận đánh giá kết quả dùng cho lịch sử/thống kê:**

| Loại kết quả | History/Replay khi đã triển khai P2 và có quyền | W/D/L, tỷ lệ thắng trên bảng/thẻ | Đổi Elo / đếm ván xếp hạng |
|---|---|---|---|
| Ranked thắng/thua/hòa | Có | Có | Có |
| Casual thắng/thua/hòa | Có | Không | Không |
| AI thắng/thua/hòa/đầu hàng | Có, thành viên | Không | Không |
| INTERRUPTED | Có phần nước đã lưu | Không | Không; riêng giới hạn cặp vẫn tính lần bắt đầu Ranked |
| AI Bỏ dở | Có phần nước hiệu lực đã lưu | Không | Không |

Replay không khôi phục ván chơi; quyền chủ ván không đồng nghĩa quyền của người xem hoặc người có link.

### 14.2 Các lệch tài liệu đã quan sát

| Điểm | Quan sát | Cách xử lý trong vòng review |
|---|---|---|
| Tiến độ | IDEA còn ghi chưa triển khai; README ghi nhiều tính năng đã tích hợp | Không dùng hai đoạn đó để kết luận tiến độ; đánh giá theo bằng chứng từng AC |
| Đăng ký | README và một số mô tả tổng quát còn nhấn OTP, BA 0.2/1.1 cho bỏ qua từ 29/10 | Dùng BA mới; đồng bộ phần giới thiệu khi chốt chỉnh tài liệu |
| Phòng | Có đoạn cũ gọi mã 8 ký tự; BA 2.7 quy định cụ thể 8 chữ số, không nhập tên, chọn quyền ngay khi tạo | Dùng BA 2.7; rà lại mô tả và trường giao diện liên quan khi review phòng |
| P2 | BA/backlog P1 còn câu chỉ ở mức Epic; đã tồn tại backlog P2 có phân rã chi tiết | Phân biệt baseline kế hoạch P1 với phân rã P2, chưa coi phân rã là PO duyệt riêng |
| Luật đuổi quân | BA 10.2 còn cụm để Giai đoạn 2; BA 3.5 ghi không xử riêng cả P1/P2 | Theo quy định rõ tại BA 3.5; báo PO trước khi đồng bộ câu cũ |
| Thách đấu đã lên P1 | AC-P2-19.1 từng ghi tên phòng trái BA 2.7 | Đã đồng bộ backlog/YC3/Danh mục theo BA 0.20: không tên, mặc định 10 phút/CODE_ONLY/5 người xem; chưa là bằng chứng code |
| Tài khoản/email tùy chọn | Đổi/Quên mật khẩu và Đổi/Khôi phục Username đều P1 theo 0.18/0.21 | Giữ mục đích OTP riêng; thiếu email không bypass bằng địa chỉ tùy ý hoặc email kỹ thuật |

Nguồn mật khẩu đã được đồng bộ theo quyết định 30/10; các lệch không liên quan trong bảng vẫn chờ review. Những lệch tài liệu không phải bằng chứng code sai; chưa kiểm runtime/Jira hoặc kết quả đo hiện tại.

Nguồn: Backlog P1 mục 2, 7–8; BA 0.2, 2.7, 3.5, 10.2; IDEA mục 5; README phần mở đầu.

## 15. Sổ đánh giá và quyết định cùng PO

### 15.1 Thứ tự thảo luận

Thứ tự dưới đây theo PO: **P1 trước, đúng thứ tự YC1–YC8; chỉ sang P2 sau khi P1 ổn**. Đây là thứ tự review/xử lý yêu cầu, không sửa lịch phụ thuộc kỹ thuật đã có; nền tảng, bảo mật và phân quyền cần cho một yêu cầu phải được xử lý cùng yêu cầu đó.

| Vòng | Phần đánh giá | Trạng thái vòng review này |
|---|---|---|
| 1 | Mục tiêu sản phẩm và phạm vi — mục 2 | PO đã xác nhận mục tiêu, ưu tiên, hạn và phân kỳ |
| 2 | YC1: tài khoản, email, Khách, hồ sơ, phiên — mục 3–4 | Đang đánh giá; bắt đầu từ đăng ký thường |
| 3 | YC2: tạo phòng, ghế, vòng đời — phần tương ứng mục 5 | Chưa đánh giá |
| 4 | YC3: bạn bè và mời bằng link/mã — mục 6 | Chưa đánh giá |
| 5 | YC4: bàn cờ và luật — mục 7 | Chưa đánh giá |
| 6 | YC5: online, đồng hồ và sự cố — mục 8 | Chưa đánh giá |
| 7 | YC6: quyền phòng, Sảnh, người xem — phần tương ứng mục 5, 9 | Chưa đánh giá |
| 8 | YC7: chat và media — mục 10 | Chưa đánh giá |
| 9 | YC8: máy cờ — mục 11 | Chưa đánh giá |
| 10 | Cổng tổng P1: nền tảng, chất lượng, nghiệm thu và hồi quy — mục 12, 14 | Chưa nghiệm thu; các phần liên quan được rà cùng từng YC |
| 11 | Ranked/Elo/media Ranked/bảng — P2-01–06 | Chờ P1 ổn |
| 12 | Ghép Casual — P2-07 | Chờ P1 ổn |
| 13 | Undo online P2; Tái đấu custom và Không giới hạn/chống treo P1; Tái đấu Casual P2 | P1 bổ sung theo BA 0.20, chưa triển khai/nghiệm thu |
| 14 | Lịch sử, lưu AI, Replay, Undo AI, xuất — P2-11–15 | Chờ P1 ổn |
| 15 | QR bị loại; sticker P2; DM/unread và Thách đấu P1 | Hai chức năng P1 bổ sung chưa triển khai/nghiệm thu |
| 16 | Đổi/Khôi phục Username — mã nguồn P2-20–21, **P1** | Chốt 0.21; chưa triển khai/nghiệm thu |
| 17 | Widget/demo còn P2; media giữa tab/theme — mã nguồn P2-24–25, **P1** | Hai bổ sung P1 chốt 0.21, chưa triển khai/nghiệm thu |
| 18 | Quyền liên chức năng, loại trừ và nghiệm thu toàn bộ P1/P2 | Chưa đánh giá |

### 15.2 Cách chốt mỗi phần

1. Đọc lại yêu cầu hiện hành, nêu vấn đề người dùng và bằng chứng nếu đã có.
2. Chọn **giữ nguyên / bổ sung / cải thiện / làm lại / loại bỏ hoặc đổi phân kỳ**; có thể khác nhau giữa các yêu cầu con.
3. Chốt hành vi quan sát được: đầu vào, luồng chính, quyền, lỗi, giới hạn, trạng thái và dữ liệu.
4. Ghi tác động tới caller, API/socket, schema/migration, UI, test/fixture, tài liệu, hạ tầng, bảo mật và lịch nếu liên quan. Chỉ ghi nơi thật sự bị ảnh hưởng, không mặc định sửa tất cả.
5. Ghi điều kiện nghiệm thu cụ thể và phần chưa quyết định. Không biến câu hỏi thành quyết định.
6. Sau PO duyệt, đồng bộ BA/backlog và tài liệu bị ảnh hưởng; chỉ triển khai, cập nhật Jira hoặc thay lịch khi có phạm vi giao tương ứng. Thay đổi gây mất dữ liệu phải được nêu riêng trước khi thực hiện.

### 15.3 Quyết định của vòng đánh giá

**30/10/2026 — PO chọn “Đánh giá lại toàn bộ yêu cầu”.** Lấy yêu cầu hiện hành làm baseline đối chiếu; được xem xét giữ, bổ sung, cải thiện, bỏ hoặc làm lại từng phần. Mọi thay đổi nghiệp vụ/phân kỳ/lịch phải được chốt riêng; lựa chọn này không tự hủy tám mục tiêu P1, không thay hạn phát hành và không cho phép xóa mã hay dữ liệu.

**30/10/2026 — PO xác nhận mục tiêu và ưu tiên:** chơi cùng bạn bè, luyện máy trước, thi đấu cộng đồng sau; giữ hạn 04/11/2026 và phân kỳ P1/P2 cũ. Làm lần lượt YC1–YC8, P1 ổn hết mới sang P2. Không kéo tính năng P2 lên P1, chưa thay luật chức năng cụ thể, chưa giao sửa code hoặc dữ liệu trong bước xác nhận này.

**30/10/2026 — PO chốt YC1 mật khẩu:** giữ đăng ký ba bước; cả Đổi mật khẩu Hồ sơ và Quên mật khẩu thuộc P1. Đổi chủ động kiểm mật khẩu cũ/mới/xác nhận, giữ phiên hiện tại và đăng xuất phiên khác. Quên mật khẩu nhập username, OTP tới email đã xác minh, thiếu email báo không khôi phục được; reset xong về Login. Đặc tả riêng: [YC1 P1](P1-YC1-TAI-KHOAN-VA-XAC-THUC.md). Khôi phục username còn P2; chưa có code hoặc nghiệm thu cho thay đổi trong tác vụ tài liệu.

Khi có quyết định, ghi: ngày; phần; nội dung trước/sau; lý do; phạm vi P1/P2; tác động/rủi ro; điều kiện nghiệm thu; nguồn cần đồng bộ; trạng thái triển khai và bằng chứng. Không tự gán mã Jira hay đánh dấu hoàn thành.


## 16. Đối chiếu tài liệu và hoàn thiện mã P1 — 31/10/2026

Đã đọc tám tài liệu trong thư mục product và đối chiếu các nhóm YC1–YC8 với mã/caller/test. Phần 0 của BA là nguồn ưu tiên: giữ P1 trước P2, không tạo QR, không sửa lịch/giờ/trạng thái Jira. Nhánh triển khai: feat/product-p1-completion từ develop; PR giao diện #156 được giữ riêng.

### 16.1 Những khoảng trống đã sửa

| Yêu cầu / truy vết | Thay đổi thực tế |
|---|---|
| YC1, AC-P2-20.1 / XIAN-178 | Đổi Username có hạn OTP/resend theo deadline máy chủ; chặn mã hết hạn và phản hồi muộn sau đóng/reset/rời. |
| YC1, AC-P2-21.1–2 / XIAN-180 | Khôi phục Username có đếm ngược, hướng dẫn gửi mã mới, không để response cũ ghi đè email/luồng mới. |
| YC1, AC-YC1-MK-18/20 | Quên/Reset mật khẩu bỏ phản hồi cũ sau chuyển mode, đổi đầu vào, thay request hoặc rời trang; không tự điều hướng ghi đè luồng mới. Chưa gán Jira Task không xác định. |
| YC2, AC-02.1.3 / XIAN-54 | Tạo phòng giữ input và commandId khi mất phản hồi; replay cùng biên lai, kể cả retry bị chặn bởi auth/rate limit; khóa lựa chọn khi đang khôi phục. |
| YC3, AC-P2-19.3 / XIAN-176 | Thách đấu lấy lại phòng đã tạo khi response mất dù bạn đổi trạng thái/quan hệ/cooldown; không gửi invite từ response đến sau rời trang. |
| YC3, AC-P2-18.2 / XIAN-174 | Lỗi markRead được thử lại theo nhịp poll, không chồng request hoặc đánh dấu đọc nền/sau thu hồi. Danh sách hội thoại có lỗi/Thử lại và giữ dữ liệu cũ. |
| YC4, AC-04.3.1/.7 / XIAN-55 | Dấu quân ăn được cố định; nước gần nhất dùng bốn góc ở cả ô đi và ô đến theo đặc tả. |
| YC2/YC5, AC-P2-09.1–3 / XIAN-156 | Tái đấu thao tác ngay trong hộp kết quả, chỉ một panel, giữ focus/lỗi/countdown; vẫn dùng được trong custom LOCKED. |
| YC2/YC5, BA 0.20.3 / XIAN-156 | Server kiểm cặp người hiện tại đúng cặp của ván kết thúc ở cả propose/accept; cặp A–C không dùng kết quả A–B để bỏ bước Sẵn sàng. |
| YC5, AC-P2-10.2–3 / XIAN-158 | Banner chống treo dùng thời gian đơn điệu từ snapshot; tự xuất hiện sau ba phút, đếm 30 giây và cập nhật khi trở lại tab. |
| YC6, AC-06.2.1 / XIAN-97 | Sảnh hiện x/N người xem; phòng không cho xem có nhãn rõ ràng thay vì bỏ trống. |
| YC6, AC-06.3.3 / XIAN-94 | Khi hàng xem đầy/không cho xem, người chơi đủ quyền vẫn thấy nút xuống xem bị vô hiệu hóa kèm lý do. |
| Ranh giới P1/P2, BA 0.3, AC-P2-14.1 / XIAN-166 | Khách không dùng Undo AI: ẩn nút/quota ở web và kiểm principal thành viên ở service trước mutation; các thao tác AI P1 được giữ. |

Riêng lượt đầu ở mục 16.1 không mở thêm phạm vi BA, không đổi luật kết quả, không thêm migration hoặc dependency. SQL bổ sung chỉ trong store; ghi phòng vẫn qua transaction/biên lai/outbox hiện có.

### 16.2 Kiểm chứng và giới hạn

- Đã chạy hồi quy tập trung: 19 file / 221 test đạt (18 file web và một file service AI), gồm tạo phòng, Sảnh, OTP/mật khẩu, DM, Thách đấu, kết quả/Tái đấu, người xem, bàn cờ và chống treo. Bao gồm hồi quy tích hợp Router/AI; không coi test service giả biên xác thực là nghiệm thu API/PostgreSQL thật.
- TypeScript web/server/tests, ESLint các file TS/TSX đổi, Prettier code/CSS và git diff --check đạt. Không chạy build trong phiên này.
- Đã xem Sảnh local: nhãn 2/5, 1/5 và Không cho xem cập nhật đúng; không tràn ngang. Preview dùng dữ liệu minh họa, không thay nghiệm thu tài khoản/phòng thật.
- Hồi quy PostgreSQL cho cặp Tái đấu bị thay người, custom LOCKED và API Khách Undo AI đã được chạy ở lượt tiếp: 12 ca Tái đấu và 9 ca Khách đạt. Dùng PostgreSQL 17 tạm, dữ liệu tổng hợp riêng trên loopback; không trỏ fixture vào Supabase/production.
- Chưa nghiệm thu SMTP/Google/LiveKit thiết bị thật, Cloud migrations, p95/tải 50 người, toàn bộ D1–D10 hoặc PO. Không coi unit/component xanh là PASS cho các cổng này.

### 16.3 Phần còn lại sau lượt này

P2 còn thiếu mã hoặc cần hoàn thiện: Ranked 01–06, Casual queue 07 và phần Tái đấu Casual 09, Undo online 08, sticker 17, widget AI 22, công cụ demo mạng 23. Đường P2-12 hết hạn 30 phút của chức năng lưu AI đã được sửa ở mục 16.4; chưa coi một đường sửa này là nghiệm thu toàn Story. History/Replay/FEN/PGN và Undo AI đã có mã, không mặc định cần viết lại.

Các cổng nghiệm thu P1 còn thiếu bằng chứng hiện tại vẫn phải hoàn tất trước khi tuyên bố P1 ổn và chuyển triển khai P2. Không tự đánh dấu Jira Done hoặc áp kết quả đo cũ cho bản sửa mới.


### 16.4 Lượt rà soát tiếp theo — 31/10/2026

Tiếp tục trên cùng nhánh/PR #157. Sửa các đường đã triển khai theo yêu cầu hiện hành; không thay phân kỳ, không mở Ranked/Casual/Undo online hoặc tự đánh dấu Jira Done.

| Yêu cầu / truy vết | Lỗi và kết quả sửa |
|---|---|
| YC1, BA 1.5, AC-P2-20.1/21.2 — XIAN-178, XIAN-180 | Gửi mã mới thành công cấp lại năm lượt thử. SMTP lỗi giữ mã/capability/số lần sai cũ và cooldown; callback gửi muộn được đối chiếu marker, request, hash, thời điểm và capability để không ghi đè lần gửi hoặc xác minh mới. Không tuyên bố quản lý quota của nhà cung cấp. |
| YC1, US-01.4 / T65 — XIAN-101 | Hồ sơ bỏ kết quả sau unmount/đổi tài khoản và giữ draft mới khi save cũ về. Header/vị trí/hộp xác nhận đăng xuất gắn actor; phản hồi A không tác động B. Lookup tên cũ cùng actor không đè tên vừa lưu; trang AI remount khi đổi actor cùng URL. |
| YC6, AC-06.3 — XIAN-91 | Xuống xem hoặc Host chuyển đối thủ xuống xem phát outbox thu hồi media trong cùng transaction. Mời/chấp nhận xuống ghế kiểm cả reservation AI có room_id NULL; lỗi không làm mất ghế hoặc thay roster. |
| YC6, AC-06.3.4 — XIAN-94 | Host có nút chuyển đối thủ sang người xem tại ghế đối thủ, kèm trạng thái thiếu quyền/đầy hàng xem; dùng version và API hiện hành. |
| AC-00.3.5, BA 1.8 — XIAN-48, XIAN-57, XIAN-61 | Cả 13 HTTP mutation phòng bắt buộc proof tab/kết nối/generation. Store đối chiếu controller và presence connected dưới withRoom. Thiếu/sai proof không ghi; FE khóa thao tác và đóng xác nhận cũ khi mất quyền. Spectator sở hữu kết nối vẫn được trả lời lời mời/rời; create/join/read và cleanup tin cậy giữ ngoại lệ. |
| YC7, AC-P2-24.2–3 — XIAN-186 | Đổi mức chia sẻ camera/mic cũng yêu cầu proof kết nối hiện hành dưới actor lock; tab cũ/mất kết nối không đổi cấu hình chia sẻ. |
| YC7, AC-07.2 — XIAN-94 | LiveKit ngắt cuối phiên dừng mọi track private/stage, hiện Camera/mic tạm thời không dùng được và cho thử lại chỉ nhận; không phát lệnh phòng/ván hoặc tự bật lại thiết bị. |
| Chức năng AI đã có, AC-P2-12.2 — XIAN-162 | Hết ân hạn 30 phút kiểm lại đúng reservation/boot/presence dưới khóa; lưu phần nước hiệu lực và Bỏ dở trung lập cho thành viên trước COMMIT rồi mới hủy job/xóa RAM. Rollback giữ RAM/ghế, candidate cũ không đụng ván mới, terminal thật được giữ; Khách không lưu history. Metadata phân biệt mất kết nối với lỗi engine/restart. |
| Chức năng xuất đã có, AC-P2-15 — XIAN-168 | Response FEN/PGN sau rời replay, đổi biên bản hoặc mất quyền không còn ghi clipboard/tải tệp/ghi đè trạng thái mới. |
| Hạ tầng kiểm chứng Windows | Chuẩn hóa CRLF thành LF khi nạp SQL test để checksum function khớp migration đã audit; không sửa migration cũ hoặc giá trị checksum. |

**Kiểm chứng quan sát được:** 69 file / 763 test đạt, không skip (24 file server, 45 file web; lấy kết quả mới nhất từng file sau khi sửa fixture). Có 45 ca runtime HTTP/Socket.IO/PostgreSQL cho rời phòng, đổi ghế/quyền, tái đấu và vòng đời Khách; fixture lấy proof từ socket đang điều khiển thật. Có API/session/coordinator/RealtimeStore/presence/PostgreSQL thật cho quyền phòng; PostgreSQL cho OTP, AI expiry/concurrency/rollback, media và ma trận RLS. Các provider/engine được thay bằng biên tổng hợp theo fixture, không xem là E2E dịch vụ thật. Cặp Tái đấu và API Khách của lượt đầu cũng đã chạy trên DB như mục 16.2.

TypeScript web/server/tests, ESLint các file đổi, Prettier code/CSS và diff check đạt. Preview /dev/ui tải được, console không có lỗi; đây là trang minh họa. Không chạy build local hoặc đo lại tải/độ trễ production.

**Migration bắt buộc trước backend mới:** 20261103000001_username_otp_delivery (ba cột marker/cooldown), có rollback cùng tên. Đã áp, rollback và áp lại trên DB test; FORCE RLS và quyền cột được giữ. Chưa áp Cloud hoặc cấu hình SMTP/Google/LiveKit thật. Các cổng D1–D10, thiết bị/dịch vụ thật và PO vẫn chưa nghiệm thu; không kết luận toàn bộ P1 đã hoàn tất.
