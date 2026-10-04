# Bốn mẫu Description viết cho người chưa biết dự án

**Ngày:** 2026-10-04 · **Trạng thái:** bản mẫu để PO duyệt. Chưa tạo gì trên Jira.

## Cách đọc

Mỗi mô tả dưới đây viết để một người **chưa từng nghe về dự án** (giáo viên chấm điểm, nhân viên mới) đọc xong vẫn biết: việc này làm để làm gì, cần làm những gì, làm xong thì phải thấy gì, tự kiểm tra thế nào, và khi nào được coi là xong. Mô tả không chứa mã hay trích dẫn tài liệu; liên kết với yêu cầu gốc nằm ở các trường liên kết của Jira (Story liên quan, task phải xong trước).

> **Đã chốt (PO, 04/10/2026):** mỗi phòng có 2 người chơi và **tối đa 5 người xem, mặc định 5**.

## Giải thích nhanh về sản phẩm

Dự án là một **trang web chơi Cờ tướng trực tuyến**. Hai người chơi đối đầu: **bên Đỏ đi trước, bên Đen đi sau**. Người khác có thể vào **xem**. Người chơi tạo một **phòng**, mời bạn bằng **mã phòng** hoặc đường dẫn; khi cả hai bấm **Sẵn sàng** thì ván bắt đầu.

| Từ dùng trong mô tả | Nghĩa |
|---|---|
| **Sảnh** | Trang chính sau khi đăng nhập: có nút tạo phòng, ô nhập mã để vào phòng, danh sách các phòng đang mở |
| **Phòng** | Nơi diễn ra một ván cờ; có 2 **ghế** cho người chơi (Đỏ và Đen) và vài chỗ cho **người xem** |
| **Phòng chờ** | Màn hình trong phòng trước khi ván bắt đầu: hiện ai đang ngồi ghế, nút Sẵn sàng, mã phòng |
| **Chủ phòng** | Người tạo phòng; ngồi bên Đỏ |
| **Mã phòng** | Dãy 8 ký tự (chữ in hoa và số) để người khác nhập vào cùng phòng |
| **Máy chủ** | Phần chạy trên mạng, giữ toàn bộ dữ liệu và quyết định mọi việc; trình duyệt của người dùng chỉ **gửi yêu cầu** và **hiển thị** |
| **Cơ sở dữ liệu** | Nơi lưu thông tin lâu dài (tài khoản, phòng, ván cờ) để tắt máy rồi mở lại vẫn còn |
| **Hợp đồng chung** | Bản mô tả thống nhất cách trình duyệt và máy chủ "nói chuyện" với nhau: gửi gì, nhận lại gì, báo lỗi ra sao |
| **Người kiểm thử** | Người kiểm tra độc lập sau khi người làm đã tự kiểm tra xong |
| **Xem xét mã** | Một đồng đội đọc lại phần mã vừa viết để phát hiện sai sót trước khi nhận |

---

# MẪU 1 — EPIC: Phòng chơi (tạo phòng, mời bạn, ngồi ghế, xem)

## Epic này làm gì

Cho phép người chơi **tạo phòng, mời người khác vào, chọn chỗ ngồi hoặc chỗ xem, và bắt đầu một ván cờ**. Đây là bước ở giữa: sau khi đăng nhập xong và trước khi hai người thật sự đánh cờ với nhau.

## Ai dùng

- **Người tạo phòng** (chủ phòng).
- **Người chơi** vào phòng của bạn bè.
- **Người xem** chỉ ngồi xem, không đánh.

## Gồm những việc lớn nào (mỗi việc là một Story)

1. Tạo phòng.
2. Phòng chờ và hai ghế ngồi.
3. Bấm Sẵn sàng và bắt đầu ván.
4. Chia sẻ phòng bằng đường dẫn và mã.
5. Vào phòng bằng mã, đường dẫn hoặc từ danh sách ở Sảnh.
6. Đổi chỗ giữa ghế ngồi và chỗ xem.
7. Phòng công khai hoặc chỉ vào bằng mã; khoá phòng.
8. Danh sách các phòng công khai ở Sảnh.
9. Đuổi người xem.
10. Chủ phòng rời đi, chuyển quyền hoặc đóng phòng.
11. Sau khi ván kết thúc, quay về phòng chờ.
12. Màn hình báo "không vào được phòng".

## Không làm trong Epic này

Đi quân và luật chơi (thuộc Epic khác), trò chuyện, camera/micro, tìm đối thủ ngẫu nhiên, tính điểm xếp hạng.

## Các quy tắc quan trọng

- Mỗi phòng có **2 ghế** cho người chơi. Mỗi phòng cho phép **tối đa 5 người xem**.
- **Mỗi người chỉ được ngồi ghế ở một phòng hoặc một ván tại một thời điểm.** Đang ngồi ghế ở nơi khác thì không tạo thêm hoặc vào thêm phòng khác.
- Ván bắt đầu khi **cả hai người ngồi ghế bấm Sẵn sàng**; có đếm ngược 3 giây.
- Mọi quyết định (ai được vào, ai ngồi đâu) do **máy chủ** quyết định, giao diện không tự quyết.

## Khi nào Epic được coi là xong

Có thể chạy trọn kịch bản sau trên hai máy khác nhau mà không lỗi:
1. An tạo phòng. An ngồi bên Đỏ ở phòng chờ.
2. Bình nhập mã phòng và vào ngồi bên Đen.
3. Khi tạo phòng, An chọn tối đa **2** người xem để dễ thử. Chi và Dũng vào làm người xem; người thứ ba muốn xem thì bị từ chối vì đã đủ 2 người xem.
4. An khoá phòng. Em dùng mã phòng để vào nhưng **không vào được**.
5. An và Bình cùng bấm Sẵn sàng; sau 3 giây ván bắt đầu.

## Cần xong trước

Khung chạy của ứng dụng, đăng nhập, và luật cờ cơ bản (để ván có thể bắt đầu).

---

# MẪU 2 — STORY: Tạo phòng

## Câu chuyện

**Là** người chơi đã đăng nhập, **tôi muốn** tạo một phòng cờ với thiết lập của mình, **để** mời bạn vào chơi.

## Điều kiện để dùng được

- Người dùng đã đăng nhập bằng tài khoản đã đăng ký đầy đủ và đang ở **Sảnh**.
- Người dùng **chưa ngồi ghế** ở phòng hoặc ván nào khác.

## Các bước người dùng làm và hệ thống phản hồi

1. Người dùng bấm **Tạo phòng**; một biểu mẫu hiện ra.
2. Người dùng điền: **tên phòng**; **thời gian mỗi bên** (5, 10 hoặc 15 phút; mặc định 10 phút); **kiểu phòng** (Công khai: hiện trong danh sách; hoặc Chỉ vào bằng mã); **số người xem tối đa** (không có, 1, 2, 3, 4 hoặc 5; mặc định 5).
3. Người dùng bấm **Tạo**.
4. Hệ thống tạo phòng, người dùng trở thành chủ phòng và ngồi bên Đỏ.
5. Màn hình chuyển vào **phòng chờ**, hiện **mã phòng 8 ký tự** để chia sẻ.

## Các quy tắc

- Tên phòng dài từ 1 đến 60 ký tự và không được chứa từ ngữ bị cấm.
- **Không có kiểu "khoá phòng" lúc tạo** (khoá chỉ bật sau khi phòng đã đủ người).
- **Thời gian mỗi bên và số người xem đã chọn thì không đổi được** sau khi tạo phòng.
- Mỗi người chỉ ngồi ghế ở một phòng/ván tại một thời điểm.
- Phòng chỉ được coi là "đã tạo" khi **máy chủ xác nhận**; giao diện không tự báo thành công.

## Khi có lỗi

- **Tên rỗng, quá dài hoặc có từ cấm:** hiện thông báo dưới ô tên, **không** tạo phòng, giữ nguyên các thông tin đã điền.
- **Đang ngồi ghế ở nơi khác:** nút Tạo phòng bị mờ, rê chuột vào thấy chú thích "Bạn đang ở trong một ván/phòng khác"; nếu vẫn cố gửi yêu cầu thì máy chủ từ chối.
- **Tạo quá nhiều phòng trong thời gian ngắn:** từ chối và báo "Bạn tạo phòng quá nhanh, vui lòng thử lại sau".
- **Mất kết nối hoặc máy chủ lỗi:** hiện thông báo lỗi bằng tiếng Việt, người dùng ở lại Sảnh và có thể bấm thử lại, **không** tạo ra hai phòng.

## Điều kiện chấp nhận

1. Điền đúng và bấm Tạo thì có đúng **một** phòng mới; người tạo ngồi bên Đỏ.
2. Phòng hiện **mã 8 ký tự**, và hai phòng khác nhau luôn có mã khác nhau.
3. Phòng giữ đúng thời gian và số người xem đã chọn, và hai thông số này **không sửa được** sau đó.
4. Người đang ngồi ghế nơi khác **không tạo được** phòng (cả khi giao diện bị bỏ qua).
5. Bấm **Tạo hai lần liên tiếp** hoặc bị mất mạng rồi gửi lại thì **vẫn chỉ có một phòng**.

## Không thuộc Story này

Mời người vào, ngồi ghế, bắt đầu ván, khoá phòng (các Story khác).

## Các việc nhỏ làm nên Story này

- Máy chủ tạo phòng (Mẫu 3).
- Giao diện Sảnh và biểu mẫu tạo phòng (Mẫu 4).
- Việc ghép hai phần trên với nhau và kiểm tra chạy thật.

---

# MẪU 3 — TASK: Máy chủ tạo phòng

*(Task này dành cho người làm phần máy chủ.)*

## Mục tiêu

Xây phần **máy chủ nhận yêu cầu "tạo phòng"** từ trình duyệt và **tạo phòng thật** trong hệ thống, đảm bảo đúng luật và **không bao giờ tạo trùng** dù yêu cầu bị gửi lại. Task giao diện (Mẫu 4) và task vào phòng sẽ dùng kết quả của task này.

## Cần xong trước khi bắt đầu

- **Khung máy chủ** đã chạy và biết người gửi yêu cầu là ai (từ tài khoản đang đăng nhập).
- **Cơ sở dữ liệu** đã có bảng lưu phòng và người ngồi trong phòng.
- **Cơ chế chống tạo trùng** dùng chung đã có (nhận mã yêu cầu, nếu gặp lại thì trả kết quả cũ).
- **Bộ lọc từ cấm** dùng chung đã có.
- **Cơ chế giới hạn tốc độ** dùng chung đã có.
- **Quy tắc "một người chỉ ngồi ghế ở một nơi"** đã có.

Thiếu cái nào thì **báo ngay cho người quản lý**, không tự nghĩ ra cách làm riêng.

## Việc cần làm (làm lần lượt theo thứ tự)

Khi nhận một yêu cầu tạo phòng, máy chủ làm đúng các bước sau:

1. **Xác định người gửi** từ tài khoản đang đăng nhập. Không tin thông tin "tôi là ai" mà trình duyệt gửi kèm.
2. **Xem yêu cầu này đã xử lý chưa:** mỗi lần bấm Tạo, trình duyệt gắn một **mã yêu cầu** ngẫu nhiên duy nhất. Nếu mã này đã được xử lý rồi (ví dụ do mất mạng nên gửi lại), **trả lại đúng kết quả lần trước và dừng**, không tạo thêm.
3. **Kiểm tra giới hạn:** một người **không tạo quá 5 phòng trong 10 phút**. Vượt thì từ chối.
4. **Kiểm tra thông tin nhận được** (bảng bên dưới). Sai ở đâu thì từ chối, không tạo.
5. **Kiểm tra người này có đang ngồi ghế ở phòng/ván khác không** (kể cả ván với máy). Có thì từ chối.
6. **Tạo phòng và chỗ ngồi của chủ phòng trong cùng một lần lưu:** hoặc lưu được cả hai, hoặc không lưu gì cả. Chủ phòng ngồi **bên Đỏ**, trạng thái **chưa Sẵn sàng**, phòng ở trạng thái **đang chờ**.
7. **Sinh mã phòng 8 ký tự** (chữ in hoa và số), **không trùng** mã phòng nào đang mở. Nếu lỡ trùng thì sinh mã khác, không ghi đè phòng cũ.
8. **Chỉ sau khi lưu thành công** mới báo thành công cho trình duyệt và lưu "yêu cầu này đã xử lý".

## Thông tin trình duyệt gửi lên

| Thông tin | Ý nghĩa | Giá trị hợp lệ |
|---|---|---|
| Mã yêu cầu | Mã ngẫu nhiên duy nhất cho mỗi lần bấm Tạo | Bắt buộc |
| Tên phòng | Tên hiển thị | 1 đến 60 ký tự, không có từ cấm |
| Thời gian mỗi bên | Đồng hồ cho mỗi người chơi | 5, 10 hoặc 15 phút (mặc định 10 nếu không gửi) |
| Kiểu phòng | Ai thấy được phòng | Công khai, hoặc Chỉ vào bằng mã. **Không** nhận kiểu "khoá" |
| Số người xem tối đa | Số chỗ xem | 0 đến 5 (mặc định 5 nếu không gửi) |

*Tên cụ thể của các trường này do nhóm chốt khi làm bước "hợp đồng chung"; mô tả này chỉ nêu ý nghĩa và giá trị hợp lệ.*

## Máy chủ trả về

- **Thành công:** thông tin phòng gồm mã phòng 8 ký tự, trạng thái "đang chờ", chủ phòng ngồi bên Đỏ và chưa Sẵn sàng, các thiết lập đã chọn.
- **Thất bại:** lý do ngắn gọn bằng tiếng Việt và nhóm lỗi (thông tin sai, chưa đăng nhập, đang ngồi nơi khác, tạo quá nhanh, lưu lỗi) để giao diện hiển thị đúng.

## Các trường hợp lỗi và kết quả mong đợi

| Tình huống | Kết quả mong đợi |
|---|---|
| Tên phòng rỗng, 61 ký tự trở lên, hoặc có từ cấm | Từ chối, **không** tạo phòng |
| Thời gian, kiểu phòng hoặc số người xem ngoài giá trị cho phép (ví dụ 20 phút, 6 người xem, kiểu "khoá") | Từ chối, **không** tự sửa thành giá trị khác |
| Người gửi chưa đăng nhập hoặc đã hết hạn đăng nhập | Từ chối, không lộ thông tin phòng |
| Người gửi đang ngồi ghế ở nơi khác | Từ chối, **không** để lại phòng hay chỗ ngồi dở dang |
| Gửi lại cùng mã yêu cầu sau khi đã tạo xong | Trả **đúng kết quả cũ**, số phòng **không tăng**, **không** báo "đang ngồi nơi khác" |
| Hai yêu cầu khác mã của cùng một người gửi cùng lúc | Chỉ **một** thành công; người ngồi ghế không quá một nơi |
| Trùng mã phòng khi sinh | Không ghi đè phòng khác; sinh mã khác hoặc báo lỗi an toàn |
| Lưu bị lỗi giữa chừng | **Không** báo thành công, không để lại phòng dở dang |
| Tạo quá 5 phòng trong 10 phút | Từ chối; sau khi hết 10 phút thì được tạo lại |
| Trình duyệt tự khai mình là chủ phòng khác | Bỏ qua; chủ phòng luôn là người đã đăng nhập |

## Cách tự kiểm tra trước khi chuyển cho người kiểm thử

Chuẩn bị: một cơ sở dữ liệu thử sạch, hai tài khoản thử đã đăng nhập đủ. Mỗi trường hợp dưới đây chạy độc lập và dọn dữ liệu sau khi xong. Kiểm bằng bài kiểm tra tự động hoặc công cụ gửi yêu cầu thủ công. **Ghi lại kết quả thật từng dòng** (xem mẫu ghi kết quả ở cuối).

| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Tạo phòng tên "Phòng luyện tập", 10 phút, Công khai, 5 người xem | Có **đúng 1 phòng** mới; chủ phòng ngồi bên Đỏ, chưa Sẵn sàng; mã dài 8 ký tự; thiết lập đúng như đã chọn |
| 2 | Tạo phòng tên đúng 1 ký tự rồi đúng 60 ký tự; sau đó thử tên rỗng và 61 ký tự; thử một từ cấm | Hai tên đầu thành công; ba tên sau bị từ chối và không có phòng mới |
| 3 | Thử lần lượt các thời gian hợp lệ; thử 20 phút, 6 người xem, kiểu "khoá" | Giá trị hợp lệ được nhận; giá trị sai bị từ chối, không bị tự đổi thành giá trị khác |
| 4 | Tạo phòng xong, **giả lập mất mạng** rồi gửi lại cùng mã yêu cầu | Trả cùng một phòng; số phòng và số chỗ ngồi **không tăng** |
| 5 | Hai yêu cầu **khác mã** của cùng người gửi cùng lúc; thêm trường hợp người đó đang ngồi ghế ở ván với máy | Chỉ một yêu cầu thành công; đang ở ván với máy thì bị chặn |
| 6 | Ép trùng mã phòng | Không ghi đè phòng có sẵn |
| 7 | Cố ý làm lỗi ở bước lưu | Không báo thành công, không để lại phòng hoặc chỗ ngồi dở dang |
| 8 | Tạo đủ 5 phòng trong 10 phút rồi tạo phòng thứ 6; chờ hết 10 phút rồi thử lại | Phòng thứ 6 bị từ chối; sau 10 phút tạo lại được |
| 9 | Gửi yêu cầu khi chưa đăng nhập; gửi yêu cầu có khai chủ phòng là người khác | Không tạo được; chủ phòng luôn là người đã đăng nhập |
| 10 | Sau khi tạo phòng, thử gửi yêu cầu **đổi thời gian hoặc số người xem** | Không đổi được thiết lập |

## Khi nào được chuyển cho người kiểm thử

- Mọi dòng trong bảng tự kiểm tra **đạt**, có ghi kết quả thật.
- Cách chạy kiểm tra viết rõ để người khác chạy lại được và ra cùng kết quả.
- Không còn lỗi đã biết mà chưa ghi chú.

## Khi nào task được coi là xong

Đã chuyển kiểm thử, người kiểm thử và người xem xét mã đều đồng ý, các bài kiểm tra tự động chạy xanh, không còn lỗi nghiêm trọng. **Chú ý:** xong task này **chưa có nghĩa** là "Tạo phòng" hoạt động từ đầu đến cuối; còn phải chờ giao diện và việc ghép hai phần.

## Bàn giao cho các task sau

Phần xử lý tạo phòng chạy được, cùng bộ dữ liệu thử "tạo phòng hợp lệ" và "tạo phòng bị lỗi" để task vào phòng và task ghép giao diện dùng lại.

## Không thuộc task này

Giao diện; việc **vào phòng**; đổi chỗ; khoá phòng; cập nhật danh sách phòng ở Sảnh.

## Mẫu ghi kết quả tự kiểm tra (người làm ghi vào phần bình luận của ticket)

```text
Kết quả tự kiểm tra
Người kiểm tra / ngày giờ:
Máy chạy thử: (máy cá nhân hay máy thử chung)
Phiên bản mã đã kiểm tra:
Kết quả từng dòng:
  1. ĐẠT / KHÔNG ĐẠT — đã làm gì, thấy gì thật sự
  2. ...
Lỗi còn lại (nếu có): mô tả và cách tái hiện
Kết luận: SẴN SÀNG CHUYỂN KIỂM THỬ / CHƯA SẴN SÀNG (lý do)
```

---

# MẪU 4 — TASK: Giao diện Sảnh và biểu mẫu tạo phòng

*(Task này dành cho người làm phần giao diện web.)*

## Mục tiêu

Làm **màn hình Sảnh** có nút **Tạo phòng** và ô **Vào phòng bằng mã**, cùng **biểu mẫu tạo phòng**. Người dùng nhìn là biết mình phải bấm gì. Task này **chỉ làm giao diện** và chạy bằng dữ liệu giả; việc nối với máy chủ thật là một task riêng làm sau.

## Cần xong trước khi bắt đầu

- **Khung ứng dụng web** đã chạy (trang trắng, điều hướng giữa các trang).
- **Hợp đồng chung** đã nêu rõ thông tin gửi đi và nhận về khi tạo phòng.
- **Bộ thành phần giao diện nền** đã có (nút, hộp thoại, thông báo, màu và kiểu chữ theo thiết kế).
- **Khung Sảnh** (thanh điều hướng, vùng nội dung) đã có.

## Việc cần làm

1. Trên Sảnh, thêm nút **Tạo phòng** và ô nhập **mã phòng** kèm nút **Vào**.
2. Bấm **Tạo phòng** thì hiện **biểu mẫu** gồm:
   - Ô **Tên phòng** (bắt buộc, 1 đến 60 ký tự).
   - Chọn **Thời gian mỗi bên**: 5, 10 hoặc 15 phút (mặc định 10 phút).
   - Chọn **Kiểu phòng**: Công khai, hoặc Chỉ vào bằng mã (không có kiểu "khoá").
   - Chọn **Số người xem tối đa**: 0 đến 5 (mặc định 5).
   - Nút **Tạo** và nút **Huỷ**.
3. Kiểm tra dữ liệu ngay khi nhập: tên rỗng hoặc quá dài thì hiện thông báo dưới ô tên và **khoá nút Tạo**.
4. Bấm **Tạo** thì gửi yêu cầu (ở task này dùng phản hồi giả): trong lúc chờ, nút **Tạo** bị khoá và có biểu tượng đang xử lý để **không bấm được hai lần**.
5. Khi thành công, chuyển sang **phòng chờ** (ở task này chỉ cần chuyển được sang trang phòng chờ giả).
6. Khi thất bại, **hiện thông báo lỗi bằng tiếng Việt**, **giữ nguyên** những gì đã điền, và người dùng bấm thử lại được.
7. Nếu người dùng đang ngồi ghế ở phòng/ván khác: nút **Tạo phòng** **bị mờ**, rê chuột vào hiện chú thích "Bạn đang ở trong một ván/phòng khác".
8. Ô **Vào bằng mã**: mã không đủ 8 ký tự thì hiện thông báo, **không** gửi đi.

## Màn hình phải có đủ 5 trạng thái

| Trạng thái | Biểu hiện |
|---|---|
| Bình thường | Hiện đầy đủ nút và biểu mẫu |
| Đang xử lý | Nút bị khoá, có biểu tượng chờ |
| Chưa có dữ liệu | Danh sách phòng trống thì hiện câu giải thích rõ ràng, không để màn hình trắng |
| Lỗi | Thông báo bằng tiếng Việt kèm cách xử lý ("thử lại") |
| Bị vô hiệu | Nút mờ kèm chú thích lý do khi rê chuột |

## Quy tắc quan trọng

Giao diện **không tự cho là tạo phòng thành công**; chỉ báo thành công khi nhận kết quả thành công từ máy chủ. Mọi quy tắc (ai được tạo, kiểm tra tên) vẫn do máy chủ kiểm lại; giao diện chỉ giúp người dùng nhập đúng.

## Cách tự kiểm tra trước khi chuyển cho người kiểm thử

Chạy giao diện với phản hồi giả (thành công, lỗi, chậm), kiểm tra trên **trình duyệt thật** ở bốn cỡ màn hình: **360, 390, 1366 và 1920 điểm ảnh rộng**.

| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Mở Sảnh | Thấy nút Tạo phòng, ô nhập mã, nút Vào; không có lỗi trong bảng điều khiển của trình duyệt |
| 2 | Bấm Tạo phòng | Biểu mẫu hiện ra; mặc định đang chọn **10 phút** và **5 người xem** |
| 3 | Để trống tên, rồi nhập 61 ký tự | Hiện thông báo dưới ô tên; nút **Tạo** bị khoá |
| 4 | Nhập tên đúng và bấm **Tạo** với phản hồi giả "chậm" | Nút bị khoá, có biểu tượng chờ; **bấm liên tiếp nhiều lần** vẫn chỉ gửi một lần |
| 5 | Phản hồi giả "thành công" | Chuyển sang trang phòng chờ |
| 6 | Phản hồi giả "lỗi" | Hiện thông báo tiếng Việt; **giữ nguyên** thông tin đã điền; vẫn bấm thử lại được |
| 7 | Giả lập "đang ngồi ghế ở nơi khác" | Nút Tạo phòng mờ; rê chuột thấy chú thích đúng nội dung |
| 8 | Nhập mã 5 ký tự rồi bấm Vào | Hiện thông báo, không gửi đi |
| 9 | Chỉ dùng **bàn phím** (Tab, Enter, Esc) | Điền và gửi được toàn bộ biểu mẫu; Esc đóng biểu mẫu; con trỏ không bị lạc |
| 10 | Thử ở **360, 390, 1366, 1920** điểm ảnh | Không bị tràn, không phải cuộn ngang, nút vẫn đủ lớn để chạm |
| 11 | Kiểm tra từng trạng thái ở bảng 5 trạng thái | Mỗi trạng thái hiện đúng như mô tả |

## Khi nào được chuyển cho người kiểm thử

- Mọi dòng tự kiểm tra **đạt**, có ghi kết quả thật và có ảnh chụp từng trạng thái.
- Ghi rõ **phần nào dùng dữ liệu giả**, để không ai nhầm là đã nối máy chủ thật.
- Giao diện đúng thiết kế, không còn lỗi trong bảng điều khiển trình duyệt.

## Khi nào task được coi là xong

Giao diện chạy đúng với dữ liệu giả ở đủ trạng thái và đủ kích thước màn hình, đã được người kiểm thử và người xem xét mã đồng ý. **Việc nối với máy chủ thật** và kiểm tra "bấm Tạo là có phòng thật" thuộc **task ghép**, không tính ở đây.

## Bàn giao cho task sau

Các màn hình và biểu mẫu sẵn sàng để nối với máy chủ, cùng danh sách các tình huống phản hồi giả đã dùng để kiểm tra.

## Không thuộc task này

Tạo phòng thật trên máy chủ (Mẫu 3), vào phòng, danh sách phòng công khai, khung điều hướng chung.
