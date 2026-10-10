# Danh sách mục Jira XIAN — đồng bộ 10/10/2026

> **9 Epic · 27 Story · 71 Task = 107 mục.** Sinh từ `plan-data.json`, `descriptions.json`, BACKLOG-P1 và AC-TASK-MAP; đồng bộ snapshot Jira hiện tại: 36 mục BA Done, 71 Task To Do, 880 giờ, hạn 04/11; cả bốn Sprint chưa bắt đầu.

Epic/Story là việc BA, không có Sprint/ước lượng ở trường Jira. Story và Task đều có cha Epic; Task liên kết *relates to* Story. Một Story có thể có Task ở nhiều Sprint. Ngày Epic/Story lấy nguyên giá trị Jira; Epic bắt đầu trước Story, Story trước Task. BA Done nghĩa là đặc tả đã chốt, không phải phần mềm đã nghiệm thu. BA không gắn Release triển khai.

**Cơ sở nội dung:** Toàn bộ 107 Description đã được đối chiếu với [BA-SCOPE-DECISIONS.md](../../BA-SCOPE-DECISIONS.md). Quyết định và đặc tả sản phẩm đã được duyệt; Epic/Story diễn đạt nội dung bàn giao, đối chiếu và truy vết theo bản đã chốt, không yêu cầu duyệt lại. Task giữ bảy phần Description, cụ thể hóa việc triển khai và kiểm chứng. Ưu tiên Phần 0 khi có nội dung cũ khác nhau; chức năng dành cho P2 không đưa vào P1. Thiết kế kỹ thuật cụ thể, lựa chọn dịch vụ được giao cho đội phát triển và bằng chứng kiểm thử vẫn cần thực hiện; đặc tả đã duyệt không có nghĩa phần mềm đã đạt nghiệm thu.

Mỗi mục ghi các phần quyết định BA liên quan và mục nghiệm thu bổ sung trong BACKLOG-P1 khi cần; nhật ký đối chiếu nằm trong [description-source-audit.json](../data/description-source-audit.json). Lịch, phân công, giờ, điểm và trạng thái lấy từ current-jira-snapshot.json; nhãn sprint cũ không thay thế trường Sprint.

<a id="ep-00"></a>

## EP-00 · Nền tảng kỹ thuật và chất lượng

| Trường | Giá trị |
|---|---|
| Issue Id | 1 |
| Issue Type | Epic |
| Parent | — |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-1 |
| Start date | 06/10/2026 |
| Due date | 13/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Component chính | Tổng hợp phạm vi các Task |
| Components | BE, Camera và mic, FE, Luật cờ, Máy cờ, Nền tảng, QA & DevOps, Ván trực tuyến |
| Labels | EP-00, camera-va-mic, dac-ta, luat-co, may-co, nen-tang, p1, van-truc-tuyen |
| Nguồn đặc tả (BA / AC) | 0.1, 0.4, 0.16, 10.1, 11 |


**Description**

**Mục tiêu**

Bàn giao bộ đặc tả đã duyệt về nền tảng, quyền dữ liệu, truyền tin và bằng chứng chất lượng; bảo đảm các đặc tả thành phần nhất quán khi triển khai.

**Bối cảnh công việc**

Các tính năng tài khoản, phòng, ván, trò chuyện và máy cờ phải dùng chung một nền, không tự xây những quy tắc hạ tầng khác nhau. Các quyết định sản phẩm đã có hiệu lực; nhóm chức năng này tổng hợp và truy vết yêu cầu, không mở một vòng quyết định hoặc duyệt lại phạm vi.

**Yêu cầu cần đáp ứng**

- Dùng chung nền tảng cho tài khoản, phòng, ván, chat và máy cờ; máy chủ thực thi quyền, luật, giờ và kết quả; cấu hình bí mật không lộ trên trình duyệt.
- Đối soát kế hoạch kiểm thử và chỉ tiêu đã duyệt: tải 50 người dùng/10 ván, truyền nước dưới 100 mili giây ở phân vị 95, thời gian máy cờ theo cấp và mười chuỗi trình diễn.
- Giữ lựa chọn email qua dịch vụ ngoài, LiveKit tự chạy cho mạng nội bộ và LiveKit Cloud dự phòng; nhà cung cấp email, dữ liệu/giao diện lập trình chi tiết và bằng chứng khả thi thuộc công việc kỹ thuật.

**Việc cần làm**

- Đối chiếu các đặc tả thành phần về nền tảng, quyền dữ liệu, truyền tin và bằng chứng chất lượng với quyết định hiện hành; kiểm đầy đủ luồng, quyền, giới hạn và ngoại lệ nêu trên.
- Rà các điểm giao với nhóm chức năng khác, gắn yêu cầu với công việc triển khai và tình huống kiểm thử; sửa sai lệch theo nguồn nghiệp vụ ưu tiên.
- Theo dõi độ đầy đủ của hồ sơ thành phần và bằng chứng phải bổ sung; mâu thuẫn chưa giải được theo thứ tự ưu tiên nguồn cần báo người phụ trách sản phẩm, không tự sửa quyết định đã duyệt.

**Kết quả bàn giao**

- Bản tổng hợp đối soát nền tảng, quyền dữ liệu, truyền tin và bằng chứng chất lượng, kèm truy vết tới đặc tả thành phần và quyết định nguồn.
- Danh sách điểm giao, tình huống nghiệm thu và sai lệch cần xử lý; bằng chứng kỹ thuật được quản lý tại công việc triển khai/kiểm chứng liên quan.

**Điều kiện hoàn thành**

- Các đặc tả thành phần phản ánh đúng nền tảng, quyền dữ liệu, truyền tin và bằng chứng chất lượng theo yêu cầu bên trên và thống nhất tại các điểm giao.
- Hồ sơ hoàn tất theo đặc tả thành phần cuối cùng, không yêu cầu người phụ trách sản phẩm duyệt lại quy tắc đã chốt. Kết quả chạy phần mềm và kiểm thử chỉ được ghi nhận khi có bằng chứng riêng.

**Phạm vi và phối hợp**

Không coi chạy nguyên mẫu hoặc hoàn thành tài liệu là bằng chứng phần mềm đã nghiệm thu.

---

<a id="us-00.1"></a>

### US-00.1 · Khung dự án, CI và nhật ký vận hành

| Trường | Giá trị |
|---|---|
| Issue Id | 10 |
| Issue Type | Story |
| Parent | EP-00 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-10 |
| Start date | 08/10/2026 |
| Due date | 11/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T01, T03 |
| Sprint thi công | S1, S2 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | FE, Nền tảng, QA & DevOps |
| Labels | EP-00, dac-ta, nen-tang, p1 |
| Nguồn đặc tả (BA / AC) | 10.1 |


**Description**

**Mục tiêu**

Bàn giao đặc tả khung dự án, kiểm tra mã tự động và nhật ký vận hành theo các ràng buộc đã duyệt.

**Bối cảnh công việc**

Ứng dụng gồm giao diện trên trình duyệt, máy chủ điều phối phòng và ván đấu, thư viện luật cờ dùng chung và chương trình chọn nước đi cho máy. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Trên máy phát triển mới sao chép kho mã nguồn, đã có Node.js (môi trường chạy ứng dụng) và pnpm (công cụ cài thư viện), chạy pnpm install để cài các thư viện rồi pnpm dev để khởi động. Giao diện web và máy chủ phải cùng chạy; địa chỉ /health dùng để kiểm tình trạng máy chủ phải trả mã 200, nghĩa là yêu cầu được xử lý thành công.
- Khi có đề nghị đưa thay đổi mã nguồn vào nhánh develop, tức nhánh mã dùng chung của nhóm, hệ thống tự kiểm quy tắc viết mã, kiểu dữ liệu và các phần xử lý nhỏ. Nếu bất kỳ bước nào lỗi, không cho gộp thay đổi vào nhánh chung.
- Kho mã nguồn phải có .env.example, là tệp mẫu liệt kê toàn bộ cấu hình môi trường cần cấp. Không lưu khoá bí mật trong lịch sử mã nguồn; các biến bắt đầu bằng VITE\_ được đưa tới trình duyệt nên không được chứa bí mật.
- Khi máy chủ hoạt động, gọi /health, là địa chỉ kiểm tra tình trạng hệ thống, phải nhận được trạng thái máy chủ, kết nối cơ sở dữ liệu và máy cờ.
- Sau khi chạy đăng nhập, gửi mã email và chat, kiểm nhật ký vận hành. Mỗi bản ghi dùng JSON, một dạng dữ liệu chia thành các trường rõ ràng, gồm thời gian, mức độ và mã sự kiện. Không ghi mật khẩu, mã xác minh, thông tin chứng minh quyền truy cập hoặc nội dung chat.
- Biên lai lệnh, tức bản ghi giúp nhận ra một yêu cầu đã được xử lý, phải bị xoá sau 24 giờ. Nhật ký vận hành được giữ tối đa 14 ngày; khi quá hạn phải được dọn.

**Việc cần làm**

- Đối soát hướng dẫn khởi chạy, cấu hình mẫu, kiểm tra tự động và dữ liệu nhật ký với các ràng buộc vận hành đã có.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát khởi chạy các thành phần, kiểm tra trước khi gộp mã, bảo vệ bí mật và thời hạn lưu nhật ký bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ khởi chạy các thành phần, kiểm tra trước khi gộp mã, bảo vệ bí mật và thời hạn lưu nhật ký; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.

**Phạm vi và phối hợp**

Không làm các màn hình nghiệp vụ hay triển khai luật cờ trong phần việc đặc tả nền tảng.

---

<a id="t01"></a>

#### T01 · Dựng monorepo, CI, nhật ký và /health

| Trường | Giá trị |
|---|---|
| Issue Id | 37 |
| Issue Type | Task |
| Parent | EP-00 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-37 |
| Start date | 10/10/2026 |
| Due date | 10/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-00.1 |
| Is blocked by | — |
| Component chính | QA & DevOps |
| Components | Nền tảng, QA & DevOps |
| Labels | chinh-qa-devops, ha-tang, nen-tang, p1, sprint-1 |
| Nguồn đặc tả (BA / AC) | 10.1, 0.16 |


**Description**

**Mục tiêu**

Dựng bộ khung để nhóm cùng phát triển, chạy và kiểm tra ứng dụng Cờ Tướng Online theo một cách thống nhất.

**Bối cảnh công việc**

Ứng dụng gồm giao diện trình duyệt, máy chủ phòng/ván, bộ luật và máy cờ. Bộ khung giúp các phần này dùng chung cách chạy và kiểm mã.

**Yêu cầu cần đáp ứng**

- Tổ chức một kho mã dùng pnpm, công cụ quản lý các gói phụ thuộc và chạy nhiều phần trong cùng dự án. Các thư mục gồm apps/web cho giao diện, apps/server cho máy chủ, packages/shared cho dữ liệu dùng chung, packages/xiangqi-core cho luật cờ và packages/engine cho máy chọn nước.
- Giao diện dùng React để tạo thành phần màn hình, Vite để chạy và đóng gói giao diện, TypeScript để kiểm tra kiểu dữ liệu; máy chủ dùng NestJS để tổ chức xử lý các yêu cầu. Bật kiểm tra kiểu nghiêm ngặt để phát hiện dữ liệu dùng sai.
- Mỗi đề nghị gộp mã vào nhánh develop phải tự kiểm quy cách mã, kiểu dữ liệu và kiểm thử; một bước lỗi thì không được gộp.
- Nhật ký máy chủ có thời gian, mức lỗi và tên sự kiện, không ghi mật khẩu, mã xác minh email, khoá phiên hoặc nội dung chat. Giữ nhật ký tối đa 14 ngày. Nhật ký dùng dạng JSON, tức bản ghi có các trường tên và giá trị để máy và người có thể tra cứu thống nhất.
- Có địa chỉ /health để kiểm tra tình trạng máy chủ; chuẩn bị chỗ bổ sung trạng thái cơ sở dữ liệu và máy cờ khi chúng được nối vào.
- Tệp .env.example chỉ liệt kê biến cấu hình mẫu; khoá bí mật không vào kho mã, không đưa vào biến bắt đầu bằng VITE\_ vì trình duyệt đọc được chúng.

**Việc cần làm**

- Tạo cấu trúc thư mục và lệnh chạy đồng thời giao diện với máy chủ.
- Cấu hình ESLint để kiểm quy cách mã, Prettier để định dạng, bộ kiểm kiểu TypeScript và Vitest để chạy kiểm thử tự động.
- Cấu hình GitHub Actions, dịch vụ tự chạy các bước kiểm khi gửi đề nghị gộp mã, và quy tắc bảo vệ nhánh; thử một thay đổi đúng và một thay đổi cố ý gây lỗi.
- Tạo nhật ký có bộ lọc dữ liệu nhạy cảm và địa chỉ kiểm tra sức khoẻ.
- Viết hướng dẫn cài đặt, chạy dự án và khai báo cấu hình camera/mic giữa môi trường tự chạy và dịch vụ đám mây.
- Ghi rõ phản hồi kiểm sức khoẻ cho máy chủ đang chạy và trạng thái các dịch vụ chưa kết nối; chỉ bổ sung kiểm cơ sở dữ liệu/máy cờ khi có kết nối thật.

**Kết quả bàn giao**

- Kho mã khởi động được bằng pnpm dev.
- Hướng dẫn cho người mới và tệp cấu hình mẫu.
- Bằng chứng bước kiểm tự động chấp nhận mã đúng, chặn mã lỗi.

**Điều kiện hoàn thành**

- Từ bản sao mới, pnpm install rồi pnpm dev khởi động được hai phần ứng dụng; gọi /health nhận phản hồi thành công.
- Thử đưa bí mật giả vào dữ liệu ghi nhật ký: không xuất hiện nguyên giá trị trong bản ghi.
- Không có khoá thật trong tệp được theo dõi; lỗi kiểm kiểu làm bước kiểm tự động thất bại.
- Cấu hình trình duyệt và gói giao diện đã đóng gói không chứa khoá dịch vụ; hướng dẫn nêu cách đổi địa chỉ/khoá camera và mic giữa mạng nội bộ với đám mây.

**Phạm vi và phối hợp**

Bàn giao bộ khung cho các chức năng đăng nhập, phòng và bàn cờ. Kết quả kiểm sức khoẻ đầy đủ cần được kiểm lại sau khi nối cơ sở dữ liệu và máy cờ thật.

---

<a id="t03"></a>

#### T03 · Khung giao diện chung: theme, layout, router, thành phần 5 trạng thái

| Trường | Giá trị |
|---|---|
| Issue Id | 39 |
| Issue Type | Task |
| Parent | EP-00 |
| Assignee | Kỳ |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-39 |
| Start date | 18/10/2026 |
| Due date | 19/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 12 giờ |
| Remaining Estimate | 12 giờ |
| Story Points | 3 |
| Story (relates to) | US-00.1 |
| Is blocked by | T01 |
| Component chính | FE |
| Components | FE, Nền tảng |
| Labels | chinh-fe, nen-tang, p1, phat-trien, sprint-2 |
| Nguồn đặc tả (BA / AC) | 10.1, 10.3, 0.3, 0.5 |


**Description**

**Mục tiêu**

Tạo bộ khung giao diện tiếng Việt và các thành phần dùng chung để mọi màn hình có hình thức, cách báo lỗi và cách thao tác nhất quán.

**Bối cảnh công việc**

Người dùng bắt đầu từ màn đăng nhập hoặc Sảnh, rồi chuyển tới phòng online hay ván với máy. Các phần giao diện cần dùng cùng nút, ô nhập, hộp thoại và cách hiển thị khi đang tải hoặc không có dữ liệu.

**Yêu cầu cần đáp ứng**

- Dùng giao diện Kỳ Đài Cổ Phong: nền nâu trầm, viền đồng thau, chữ vàng ngà và bàn cờ màu gỗ; thống nhất màu, phông chữ, khoảng cách theo thiết kế chung. Bản này chỉ có giao diện đó, không có bộ chọn giao diện khác.
- Khung trang hỗ trợ màn hình rộng từ 360 pixel, có thanh điều hướng và vùng nội dung phù hợp. Pixel là đơn vị điểm ảnh dùng để xác định kích thước hiển thị.
- Tạo nút, ô nhập, hộp thoại, thông báo ngắn, chú thích nút, khung chờ tải, khung trống và khung lỗi dùng lại được.
- Thành phần thể hiện được trạng thái bình thường, đang tải, trống, lỗi và bị vô hiệu khi phù hợp.
- Sảnh có vị trí cho Tự tạo phòng, Vào phòng bằng mã và Đánh với máy; chức năng làm sau được thể hiện đúng bằng “Sắp ra mắt” hoặc ẩn ở thao tác sâu.
- Các thao tác có nhãn rõ ràng, sử dụng bàn phím được và không chỉ dùng màu để truyền đạt trạng thái. Kiểm tương phản và khả năng truy cập theo mức AA cơ bản của chuẩn trợ năng cho web, tức chữ dễ phân biệt với nền, trường nhập có nhãn và thông tin vẫn hiểu được khi không phân biệt màu.
- Khung điều hướng dành chỗ cho danh sách phòng công khai với Vào chơi/Vào xem và nhãn Khách; đây là vị trí tích hợp, chưa coi dữ liệu mẫu là danh sách phòng trực tiếp.

**Việc cần làm**

- Chuyển bảng màu, phông và khoảng cách thành biến giao diện dùng chung.
- Tạo khung bố cục cho máy tính và điện thoại, cùng cơ chế chuyển trang.
- Xây dựng từng thành phần với ví dụ hiển thị đủ trạng thái.
- Gắn khung Sảnh và thanh điều hướng, để phần chức năng thật được nối vào sau.
- Kiểm độ rộng 360 và 1440 pixel, phóng to chữ, di chuyển bằng bàn phím và thông báo lỗi.

**Kết quả bàn giao**

- Bộ thành phần giao diện có ví dụ sử dụng.
- Khung trang và thanh điều hướng.
- Bảng kiểm các trạng thái và kích thước đã kiểm tra.

**Điều kiện hoàn thành**

- Khung trang không gây cuộn ngang ngoài ý muốn ở độ rộng 360 pixel.
- Nút bị vô hiệu không thực hiện hành động, kèm lời giải thích thích hợp.
- Lỗi tải có lời báo và cách thử lại; dữ liệu trống không giống một màn hình bị hỏng.
- Các màn hình mẫu dùng cùng thành phần thay vì tự tạo nhiều kiểu nút và hộp thoại khác nhau.
- Mỗi thành phần có ví dụ để kiểm trạng thái đang tải, trống, lỗi và vô hiệu nếu có áp dụng; thao tác bằng bàn phím mở/đóng được hộp thoại và xác định được nút đang được chọn.

**Phạm vi và phối hợp**

Bàn giao phần trình bày chung. Luồng đăng ký, quản lý phòng, danh sách phòng và ván với máy sẽ được nối với máy chủ trong phần việc tương ứng.

---

<a id="us-00.2"></a>

### US-00.2 · Cơ sở dữ liệu và phân quyền P1

| Trường | Giá trị |
|---|---|
| Issue Id | 11 |
| Issue Type | Story |
| Parent | EP-00 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-11 |
| Start date | 12/10/2026 |
| Due date | 15/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T14 |
| Sprint thi công | S1 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | BE, Nền tảng |
| Labels | EP-00, dac-ta, nen-tang, p1 |
| Nguồn đặc tả (BA / AC) | 0.2, 1.4, 10.1 |


**Description**

**Mục tiêu**

Bàn giao đặc tả dữ liệu và quyền truy cập của bản đầu theo quy tắc tài khoản, phòng và ván đã duyệt.

**Bối cảnh công việc**

Dữ liệu gồm hồ sơ tài khoản, quan hệ và lời mời bạn bè, phòng, danh sách bị chặn khỏi phòng, ván đấu, nước đi và lần đăng nhập sai. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Từ cơ sở dữ liệu trống, chạy đầy đủ các lệnh tạo và nâng cấp dữ liệu phải tạo được các bảng, liên kết giữa bảng và chỉ mục giúp tra cứu. Xoá dữ liệu thử rồi dựng lại từ đầu phải chạy được mà không báo lỗi.
- Người dùng dùng khoá công khai dành cho trình duyệt không được đọc hoặc sửa dữ liệu người khác và dữ liệu phòng/ván trái quyền. Quy tắc phân quyền phải được thực thi ngay tại cơ sở dữ liệu; chỉ máy chủ dùng khoá quản trị mới được ghi phòng, ván và kết quả.
- Lưu tên đăng nhập đúng chữ người dùng nhập, nhưng kiểm trùng bằng chữ thường: Twot và twot phải được coi là cùng một tên, không thể tạo hai tài khoản khác nhau.

**Việc cần làm**

- Đối chiếu danh mục dữ liệu và ma trận quyền với quy tắc tài khoản, phòng và ván; thiết kế bảng, chỉ mục và lệnh nâng cấp thuộc công việc kỹ thuật.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát quyền đọc/ghi dữ liệu, tính duy nhất của tên đăng nhập và dữ liệu phòng/ván bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ quyền đọc/ghi dữ liệu, tính duy nhất của tên đăng nhập và dữ liệu phòng/ván; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.

**Phạm vi và phối hợp**

Không mở rộng sang bảng xếp hạng, tính điểm hay giao diện xem lịch sử ván.

---

<a id="t14"></a>

#### T14 · Lược đồ CSDL P1, RLS, migration, dữ liệu mẫu

| Trường | Giá trị |
|---|---|
| Issue Id | 50 |
| Issue Type | Task |
| Parent | EP-00 |
| Assignee | Đông |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-50 |
| Start date | 14/10/2026 |
| Due date | 15/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 12 giờ |
| Remaining Estimate | 12 giờ |
| Story Points | 3 |
| Story (relates to) | US-00.2 |
| Is blocked by | T04 |
| Component chính | BE |
| Components | BE, Nền tảng |
| Labels | chinh-be, nen-tang, p1, phat-trien, sprint-1 |
| Nguồn đặc tả (BA / AC) | 1.4, 3.3, 5.5, 10.1 |


**Description**

**Mục tiêu**

Tạo cấu trúc dữ liệu và quyền truy cập để lưu phòng, người tham gia, ván cờ và quan hệ bạn bè một cách nhất quán.

**Bối cảnh công việc**

Dữ liệu trên trình duyệt có thể bị sửa, vì vậy người dùng không được tự ghi kết quả ván hoặc đọc dữ liệu riêng của người khác. Supabase cung cấp cơ sở dữ liệu PostgreSQL; quyền truy cập cần được kiểm cả khi gọi trực tiếp, không chỉ qua giao diện.

**Yêu cầu cần đáp ứng**

- Tạo dữ liệu lời mời kết bạn, quan hệ bạn bè, phòng, thành viên phòng, danh sách người bị chặn, ván và nước đi.
- Tích hợp theo cấu trúc thống nhất với bảng hồ sơ, bộ đếm đăng nhập và biên lai lệnh của các phần đăng ký, đăng nhập và kết nối. Ghép các tệp tạo bảng đã bàn giao; bảng chưa bàn giao phải ghi rõ phần phụ thuộc, không tự tạo bản trùng khác cấu trúc.
- Dùng khoá tham chiếu và ràng buộc để tránh người tham gia hoặc nước đi trỏ tới bản ghi không hợp lệ.
- Tên tài khoản lưu đúng chữ người nhập nhưng ràng buộc duy nhất so sánh không phân biệt hoa thường.
- Phân quyền theo từng dòng dữ liệu: trình duyệt chỉ đọc dữ liệu được phép; máy chủ có quyền dịch vụ mới ghi dữ liệu phòng, ván và kết quả.
- Tệp tạo/cập nhật cấu trúc dữ liệu phải chạy được từ cơ sở dữ liệu trống; có dữ liệu mẫu phục vụ demo, không chứa bí mật thật.

**Việc cần làm**

- Vẽ quan hệ các bảng và chỉ rõ nguồn sở hữu của từng nhóm dữ liệu.
- Viết tệp tạo bảng, khoá, chỉ mục và ràng buộc; ghép với các tệp đã có.
- Thiết lập chính sách quyền đọc/ghi cho tài khoản, người ngoài và máy chủ.
- Tạo dữ liệu mẫu có phòng, hai người chơi và người xem để dùng kiểm quyền.
- Dựng lại cơ sở dữ liệu thử từ đầu, kiểm các quan hệ và tên khác hoa thường.
- Gọi trực tiếp bằng quyền trình duyệt để thử ghi kết quả và đọc dữ liệu không thuộc quyền.
- Lập bảng cho từng loại dữ liệu: chủ sở hữu, ai đọc, ai ghi, ràng buộc và nơi kiểm nghiệp vụ; ghi rõ quyền của tài khoản, Khách, người ngoài phòng và quyền dịch vụ.

**Kết quả bàn giao**

- Tệp tạo/cập nhật cơ sở dữ liệu dùng được từ đầu.
- Sơ đồ dữ liệu và mô tả quyền.
- Dữ liệu mẫu cùng kết quả kiểm quyền trực tiếp.
- Bộ lệnh kiểm quyền trực tiếp cùng dữ liệu đầu vào và kết quả cho phép/từ chối; danh sách tệp cấu trúc dữ liệu đã tích hợp và phần còn phụ thuộc.

**Điều kiện hoàn thành**

- Tạo mới từ cơ sở dữ liệu trống không lỗi đối với các bảng do công việc này sở hữu và các tệp đã bàn giao; đủ quan hệ trong phạm vi đó. Việc dựng lại toàn bộ cấu trúc và kiểm quyền tất cả bảng được xác minh khi hồi quy bản tích hợp đầy đủ.
- Không tạo đồng thời được hai tên như Twot và twot.
- Người dùng không tự sửa phòng/ván/kết quả qua quyền công khai của trình duyệt.
- Máy chủ ghi được dữ liệu hợp lệ; truy cập ngoài quyền bị từ chối.

**Phạm vi và phối hợp**

Bàn giao nơi lưu và bảo vệ dữ liệu. Quyết định ai thắng, ai ngồi ghế hay có thể kết bạn vẫn nằm trong chức năng nghiệp vụ của máy chủ. Bằng chứng cục bộ không xác nhận các tệp tạo bảng chưa bàn giao; bàn giao danh sách tệp và phạm vi kiểm cho người hồi quy toàn hệ thống.

---

<a id="us-00.3"></a>

### US-00.3 · Khung realtime

| Trường | Giá trị |
|---|---|
| Issue Id | 12 |
| Issue Type | Story |
| Parent | EP-00 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-12 |
| Start date | 09/10/2026 |
| Due date | 12/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T12 |
| Sprint thi công | S1 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | BE, Nền tảng, Ván trực tuyến |
| Labels | EP-00, dac-ta, nen-tang, p1, van-truc-tuyen |
| Nguồn đặc tả (BA / AC) | 1.8, 3.3, 8.3, 10.1 |


**Description**

**Mục tiêu**

Bàn giao đặc tả kết nối và đồng bộ trạng thái dùng chung theo quy tắc phiên và điều khiển đã duyệt.

**Bối cảnh công việc**

Phòng, ván đấu và trò chuyện cùng dùng một cơ chế kết nối. Máy chủ giữ trạng thái đúng; trình duyệt phải đồng bộ theo trạng thái đó khi gửi trùng hoặc nối lại. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Bối cảnh: Kết nối không có thông tin chứng minh quyền truy cập hợp lệ (người dùng hoặc Khách). Thao tác hoặc sự kiện: Mở kết nối truyền tin tức thời. Kết quả cần có: Bị từ chối kết nối.
- Bối cảnh: trình duyệt gửi cùng một mã duy nhất của lệnh hai lần. Thao tác hoặc sự kiện: Máy chủ xử lý. Kết quả cần có: Lệnh chỉ có hiệu lực một lần; lần hai trả lại kết quả cũ.
- Khi trình duyệt gửi một lệnh dựa trên trạng thái đã cũ, máy chủ phải từ chối và gửi lại toàn bộ trạng thái hiện tại để trình duyệt cập nhật đúng.
- Sau mất kết nối rồi nối lại thành công, trình duyệt nhận đủ dữ liệu hiện tại của phòng, ván, đồng hồ và vai trò; màn hình phải khớp máy chủ.
- Cùng tài khoản mở thẻ trình duyệt thứ hai vào cùng phòng thì thẻ mới tiếp quản. Thẻ cũ nhận “Phiên này đã được mở ở tab khác” và chỉ được xem; tự nối lại cũng không được giành quyền điều khiển. Trong câu thông báo, tab là thẻ của trình duyệt.

**Việc cần làm**

- Đối soát hợp đồng truyền tin với quy tắc một vị trí chơi, quyền điều khiển và trạng thái máy chủ; cách tổ chức thông điệp cụ thể thuộc công việc triển khai.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát xác thực kết nối, lệnh trùng, trạng thái cũ, nối lại và tiếp quản thẻ trình duyệt bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ xác thực kết nối, lệnh trùng, trạng thái cũ, nối lại và tiếp quản thẻ trình duyệt; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.

**Phạm vi và phối hợp**

Chỉ đặc tả cơ chế dùng chung; luật đi cờ, vòng đời phòng và nội dung trò chuyện được triển khai ở các công việc tính năng tương ứng.

---

<a id="t12"></a>

#### T12 · Khung realtime Socket.IO

| Trường | Giá trị |
|---|---|
| Issue Id | 48 |
| Issue Type | Task |
| Parent | EP-00 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-48 |
| Start date | 11/10/2026 |
| Due date | 13/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 24 giờ |
| Remaining Estimate | 24 giờ |
| Story Points | 5 |
| Story (relates to) | US-00.3 |
| Is blocked by | T01 |
| Component chính | BE |
| Components | BE, Nền tảng, Ván trực tuyến |
| Labels | chinh-be, nen-tang, p1, phat-trien, sprint-1, van-truc-tuyen |
| Nguồn đặc tả (BA / AC) | 1.8, 3.3, 10.1 |


**Description**

**Mục tiêu**

Tạo đường kết nối thời gian thực đáng tin cậy giữa trình duyệt và máy chủ để phòng, nước đi và quyền điều khiển luôn thống nhất.

**Bối cảnh công việc**

Khi mạng chập chờn, cùng một thao tác có thể gửi lại hoặc đến từ thẻ cũ. Máy chủ cần biết ai gửi, lệnh đã chạy chưa và người gửi đang nhìn phiên bản trạng thái nào trước khi chấp nhận. Thẻ trình duyệt là một trang đang mở trong cùng cửa sổ hoặc trình duyệt. “Ảnh chụp trạng thái” ở đây là gói dữ liệu hiện tại của phòng, không phải ảnh chụp màn hình; “biên lai” là bản ghi để nhận ra lệnh đã xử lý và trả lại đúng kết quả cũ.

**Yêu cầu cần đáp ứng**

- Dùng Socket.IO, thư viện truyền sự kiện hai chiều, trong NestJS, bộ khung tổ chức máy chủ; kiểm thông tin xác thực phiên do Supabase, dịch vụ tài khoản, cấp cho tài khoản thường và Khách.
- Kết nối không có khoá hợp lệ bị từ chối; chỉ nhận sự kiện của phòng mà danh tính có quyền tham gia.
- Mỗi lệnh có mã nhận diện và phiên bản trạng thái. Gửi trùng cùng mã chỉ có hiệu lực một lần và trả kết quả cũ.
- Lệnh dựa trên phiên bản cũ bị từ chối kèm trạng thái mới nhất.
- Khi nối lại, có ảnh chụp trạng thái đầy đủ để ứng dụng khôi phục phòng, ván, đồng hồ và vai trò khi các phần này được nối vào.
- Thẻ trình duyệt mới cùng phòng tiếp quản, thẻ trình duyệt cũ chỉ đọc và được thông báo; thẻ trình duyệt cũ tự nối lại không giành quyền trở lại. Biên lai lệnh được lưu và xoá sau 24 giờ.

**Việc cần làm**

- Tạo cổng kết nối và bước xác thực trước khi nhận sự kiện.
- Thiết kế cấu trúc lệnh, phản hồi, lỗi và ảnh chụp trạng thái trong packages/shared để các phần dùng chung. Gói packages/shared là nơi lưu các định nghĩa dữ liệu mà nhiều phần ứng dụng cùng sử dụng.
- Tạo lưu biên lai, xử lý gửi trùng và phiên bản cũ.
- Thêm quản lý thẻ trình duyệt điều khiển và sự kiện báo thẻ trình duyệt mất quyền.
- Viết ví dụ sự kiện phòng/ván, phiên, hình tiếng và lỗi máy cờ; giải thích trách nhiệm mỗi bên.
- Thử nối lại, gửi lặp và 50 kết nối mẫu để phát hiện lỗi khung.

**Kết quả bàn giao**

- Khung kết nối thời gian thực có xác thực và chống lệnh trùng.
- Tài liệu sự kiện và mẫu dữ liệu.
- Kiểm thử kết nối, thẻ trình duyệt, biên lai và báo cáo thử tải sơ bộ.
- Ví dụ dữ liệu lệnh mới, gửi lại, phiên bản cũ và nối lại; phản hồi nêu kết quả xử lý, phiên bản và trạng thái chính thức để các chức năng ghép đúng.

**Điều kiện hoàn thành**

- Khoá phiên sai không mở được kết nối có quyền.
- Gửi một lệnh hai lần chỉ thay đổi trạng thái một lần.
- Lệnh cũ nhận lại trạng thái mới, không ghi đè dữ liệu hiện tại.
- Tab mất quyền tự nối lại vẫn không điều khiển được; biên lai quá hạn được dọn.
- Danh tính hợp lệ nhưng không thuộc phòng không nhận sự kiện riêng của phòng; tab đã mất quyền gửi trực tiếp lệnh thay đổi vẫn bị từ chối.
- Hai yêu cầu trùng đến đồng thời nhận cùng kết quả, chỉ có một thay đổi và một biên lai có hiệu lực.

**Phạm vi và phối hợp**

Bàn giao hợp đồng giao tiếp cho phòng, ván, phiên và hình tiếng. Số đo kết nối mẫu không thay phép đo ứng dụng thật khi đồng thời có ván online, máy cờ và người xem.

---

<a id="us-00.4"></a>

### US-00.4 · Kế hoạch kiểm thử và kiểm chứng sớm

| Trường | Giá trị |
|---|---|
| Issue Id | 13 |
| Issue Type | Story |
| Parent | EP-00 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-13 |
| Start date | 09/10/2026 |
| Due date | 12/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T02, T06 |
| Sprint thi công | S1, S2 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | Camera và mic, Luật cờ, Máy cờ, Nền tảng, QA & DevOps |
| Labels | EP-00, camera-va-mic, dac-ta, luat-co, may-co, nen-tang, p1 |
| Nguồn đặc tả (BA / AC) | 0.1, 0.4, 0.16, 10.1 |


**Description**

**Mục tiêu**

Bàn giao kế hoạch kiểm thử có đủ tình huống, dữ liệu và kết quả mong đợi cho các yêu cầu đã duyệt.

**Bối cảnh công việc**

Một yêu cầu có thể có nhiều nhánh đúng, sai và biên. Thử nguyên mẫu để phát hiện rủi ro sớm không thay cho kiểm thử tính năng thật sau tích hợp. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Kế hoạch kiểm thử cho bản bàn giao đầu tiên phải có phạm vi, môi trường, dữ liệu thử, điều kiện bắt đầu và kết thúc kiểm thử, cùng quy trình ghi lỗi trên Jira (công cụ theo dõi công việc). Mức lỗi gồm Nghiêm trọng, Cao, Trung bình và Thấp.
- Mỗi tiêu chí nghiệm thu phải có tình huống kiểm thử tương ứng, ghi điều kiện ban đầu, bước thao tác, dữ liệu và kết quả mong đợi. Tiêu chí có nhiều nhánh phải có các trường hợp con để không bỏ sót.
- Cuối mỗi đợt phát triển, kiểm lại các chức năng đã có để phát hiện việc sửa mới làm hỏng phần cũ. Báo cáo từng tình huống Đạt, Không đạt hoặc Chưa thể nghiệm thu; mọi lỗi còn mở phải được ghi trên công cụ theo dõi công việc.

**Việc cần làm**

- Đối chiếu kế hoạch kiểm thử với từng nhánh yêu cầu đã duyệt; chuẩn bị dữ liệu tài khoản, phiên, luật cờ, camera và mic cùng kết quả mong đợi.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát độ phủ yêu cầu, dữ liệu thử, đáp án độc lập và kiểm chứng rủi ro sớm bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ độ phủ yêu cầu, dữ liệu thử, đáp án độc lập và kiểm chứng rủi ro sớm; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.

**Phạm vi và phối hợp**

Không ghi đạt trước khi thực hiện; không dùng kết quả nguyên mẫu để kết luận bản tích hợp đã đạt.

---

<a id="t02"></a>

#### T02 · Kế hoạch kiểm thử, TC nền tảng và dữ liệu chuẩn luật/máy cờ

| Trường | Giá trị |
|---|---|
| Issue Id | 38 |
| Issue Type | Task |
| Parent | EP-00 |
| Assignee | Thư |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-38 |
| Start date | 14/10/2026 |
| Due date | 17/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.2 |
| Original Estimate | 32 giờ |
| Remaining Estimate | 32 giờ |
| Story Points | 5 |
| Story (relates to) | US-00.4 |
| Is blocked by | — |
| Component chính | QA & DevOps |
| Components | Luật cờ, Máy cờ, Nền tảng, QA & DevOps |
| Labels | chinh-qa-devops, chuan-bi-kiem-thu, luat-co, may-co, nen-tang, p1, sprint-1 |
| Nguồn đặc tả (BA / AC) | 0.12, 0.17, 3.5, 6.1, 10.1 |


**Description**

**Mục tiêu**

Chuẩn bị cách kiểm thử và dữ liệu chuẩn để cả nhóm đánh giá ứng dụng bằng kết quả quan sát được.

**Bối cảnh công việc**

Người kiểm thử cần dữ liệu, thao tác và kết quả đúng. Riêng luật cờ/máy cờ cần đáp án độc lập, tránh lấy kết quả chương trình làm chuẩn kiểm chính nó.

**Yêu cầu cần đáp ứng**

- Kế hoạch ghi rõ phạm vi kiểm, môi trường, thiết bị, dữ liệu thử, điều kiện bắt đầu và điều kiện kết thúc kiểm thử.
- Mỗi ca có tiền điều kiện, dữ liệu, từng bước thực hiện, kết quả mong đợi và chỗ lưu bằng chứng; yêu cầu có nhiều nhánh phải có nhiều biến thể.
- Quy định ghi lỗi theo mức Nghiêm trọng, Cao, Trung bình, Thấp; bản ghi lỗi phải có cách tái hiện và ảnh hoặc nhật ký phù hợp.
- Chuẩn bị thế cờ bao phủ luật bảy loại quân, chiếu, chiếu hết, hết nước đi, lặp thế và không ăn quân.
- Chuẩn bị bộ chiếu hết một và hai nước bắt buộc có đáp án được xác minh riêng, cùng 50 thế giữa ván phục vụ đo máy cờ.
- Phân biệt ca đã viết với ca đã chạy; kết quả được ghi là đạt, không đạt hoặc bị chặn kèm lý do.
- Bộ thế phải có cùng vị trí nhưng khác lượt, lần lặp thứ ba, một bên/cả hai bên chiếu liên tục và nước thứ 120 đồng thời chiếu hết hoặc gây hết nước đi.

**Việc cần làm**

- Lập danh sách các nhóm tính năng và cách kiểm bằng giao diện, gọi máy chủ trực tiếp hoặc chạy bộ luật.
- Soạn mẫu ca kiểm thử và mẫu báo lỗi dùng thống nhất.
- Viết các ca nền tảng: khởi động, cấu hình, quyền dữ liệu, kết nối và bảo vệ thông tin trong nhật ký.
- Tạo tệp thế cờ, lời giải và nguồn đối chiếu; nhờ người kiểm tra độc lập rà lại các đáp án bắt buộc.
- Xác định cách ghi môi trường và số đo để người khác lặp lại phép thử.
- Bàn giao dữ liệu và hướng dẫn cho người viết máy cờ và các phần kiểm thử chức năng.
- Chuyển từng yêu cầu đã duyệt thành các ca có đầu vào và kết quả cố định; không yêu cầu duyệt lại luật hoặc thay ngưỡng theo số đo triển khai.

**Kết quả bàn giao**

- Kế hoạch kiểm thử và mẫu ca/mẫu lỗi.
- Bộ ca nền tảng.
- Bộ thế luật, chiếu hết và thế giữa ván có đáp án, nguồn và hướng dẫn sử dụng.
- Bảng đối chiếu yêu cầu với tên ca, tệp dữ liệu và nơi ghi kết quả; tách bằng chứng chuẩn bị dữ liệu khỏi bằng chứng chạy trên ứng dụng.

**Điều kiện hoàn thành**

- Một người khác đọc mẫu có thể thực hiện ca mà không phải hỏi lại dữ liệu đầu vào hoặc kết quả đúng.
- Mỗi thế chiếu hết bắt buộc có lời giải kiểm lại được và không dùng kết quả máy cờ đang phát triển làm đáp án duy nhất.
- Báo cáo không ghi đạt cho ca chưa thực hiện.

**Phạm vi và phối hợp**

Ước lượng lại 32 giờ: kế hoạch và mẫu ca/lỗi 8 giờ; chuẩn bị và xác minh bộ thế luật/máy cờ 16 giờ; đối chiếu yêu cầu, hướng dẫn và bàn giao dữ liệu 8 giờ. Đây là công việc chuẩn bị/kiểm chứng kỹ thuật theo đặc tả đã duyệt.

Công việc này chuẩn bị phương pháp và dữ liệu. Người phụ trách từng nhóm chức năng tiếp tục viết biến thể, chạy thử và lưu bằng chứng của nhóm đó.

---

<a id="t06"></a>

#### T06 · Spike media LAN/Cloud/HTTPS và thử mô hình phiên

| Trường | Giá trị |
|---|---|
| Issue Id | 42 |
| Issue Type | Task |
| Parent | EP-00 |
| Assignee | Cường |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-42 |
| Start date | 11/10/2026 |
| Due date | 13/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 24 giờ |
| Remaining Estimate | 24 giờ |
| Story Points | 5 |
| Story (relates to) | US-00.4 |
| Is blocked by | T01 |
| Component chính | QA & DevOps |
| Components | Camera và mic, Nền tảng, QA & DevOps |
| Labels | camera-va-mic, chinh-qa-devops, nen-tang, p1, sprint-1, thu-nghiem-ky-thuat |
| Nguồn đặc tả (BA / AC) | 0.14, 0.16, 1.8, 4.1 |


**Description**

**Mục tiêu**

Thử sớm hạ tầng camera/mic và cơ chế phiên đăng nhập để xác định cách triển khai được trên máy phát triển, mạng nội bộ và Internet.

**Bối cảnh công việc**

Camera/mic dùng LiveKit, một dịch vụ chuyển tiếp hình và tiếng giữa người tham gia. Việc thử được thực hiện bằng phòng và tài khoản mẫu để phát hiện hạn chế trước khi ghép vào ván cờ thật.

**Yêu cầu cần đáp ứng**

- Chạy LiveKit bằng Docker, công cụ khởi động dịch vụ từ cấu hình có sẵn, trên mạng nội bộ; có cấu hình dùng LiveKit Cloud, phiên bản dịch vụ đám mây, khi cần qua Internet.
- Trình duyệt trên nhiều máy phải mở web qua kết nối HTTPS bảo mật để được xin quyền camera/mic; không chạy máy chủ LiveKit trên Render. Render là nơi chạy giao diện và máy chủ ứng dụng dự phòng; máy chủ LiveKit cần các loại cổng mạng riêng mà môi trường Render đã chọn không cung cấp.
- Thử hai người có quyền phát và năm người chỉ nhận; người xem không được phát kể cả gọi trực tiếp.
- Đổi môi trường bằng địa chỉ và khoá cấu hình; không đưa khoá thật vào kho mã.
- Đo thời gian thu hồi quyền, mức dùng tài nguyên máy và hạn mức dịch vụ. Ghi số đo thực tế, không tự đặt ngưỡng đạt cho thời gian thu hồi.
- Thử phiên 30 ngày hoặc 12 giờ/đóng trình duyệt, hạn tính cố định từ đăng nhập; thử danh tính Khách và thu hồi phiên bằng hai trình duyệt.

**Việc cần làm**

- Tạo cấu hình Docker, cấu hình mẫu đám mây và hướng dẫn chứng chỉ HTTPS nội bộ.
- Mở trang thử trên nhiều máy, kiểm gửi/nhận hình tiếng giữa hai người phát với năm người nhận.
- Thử đổi quyền và thu hồi quyền, ghi thời điểm yêu cầu và thời điểm luồng thực sự ngừng.
- Theo dõi tài nguyên và hạn mức trong một phiên thử có ghi thời lượng.
- Tạo tài khoản thử, kiểm hạn phiên cố định và việc đăng nhập/thu hồi trên hai trình duyệt.
- Tổng hợp giới hạn, lỗi cấu hình và hướng xử lý để nhóm thời gian thực và phiên dùng được.
- Lập bảng thử mạng nội bộ/đám mây gồm địa chỉ kết nối, cách cấp HTTPS, vai trò từng trình duyệt và kết quả phát/nhận; thử cấu hình thiếu hoặc sai khoá để có hướng dẫn chẩn đoán.

**Kết quả bàn giao**

- Tệp docker-compose, bản cấu hình để Docker khởi động dịch vụ, và cấu hình mẫu không chứa bí mật.
- Hướng dẫn chạy mạng nội bộ, HTTPS và dịch vụ đám mây.
- Báo cáo có thiết bị, môi trường, cách thử, số đo và hạn chế.

**Điều kiện hoàn thành**

- Người khác làm theo hướng dẫn mở được trang thử có camera/mic trên máy thứ hai trong mạng.
- Người xem bị từ chối phát; thu hồi quyền có bằng chứng thời gian thực tế.
- Đổi hoạt động hoặc làm mới khoá phiên không tự dời hạn đăng nhập.
- Báo cáo phân biệt thử kỹ thuật với luồng chưa có ván thật.
- Báo cáo ghi riêng kết quả hai người phát/năm người nhận cho môi trường đã chạy; môi trường chưa chạy ghi bị chặn, không suy từ mạng nội bộ rằng Internet đã đạt.

**Phạm vi và phối hợp**

Đây là thử khả thi hạ tầng. Xử thua khi đăng nhập thiết bị khác, quyền hình tiếng theo ghế và sự liên tục của ván phải được kiểm lại trên ứng dụng đã tích hợp.

---

<a id="us-00.5"></a>

### US-00.5 · Nghiệm thu tổng, NFR và đóng gói demo

| Trường | Giá trị |
|---|---|
| Issue Id | 14 |
| Issue Type | Story |
| Parent | EP-00 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-14 |
| Start date | 29/10/2026 |
| Due date | 01/11/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T51, T66, T70, T71 |
| Sprint thi công | S4 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | Nền tảng, QA & DevOps |
| Labels | EP-00, dac-ta, nen-tang, p1 |
| Nguồn đặc tả (BA / AC) | 0.1, 0.4, 0.16, 10.1, 11 |


**Description**

**Mục tiêu**

Bàn giao hồ sơ nghiệm thu tổng và trình diễn theo chỉ tiêu đã duyệt; bổ sung bằng chứng từ công việc kiểm chứng thực tế.

**Bối cảnh công việc**

Hồ sơ nghiệm thu tổng sử dụng các ngưỡng chất lượng đã duyệt; phương pháp đo cần được chuẩn bị trước triển khai, kết quả thực đo và lỗi còn mở được bổ sung từ công việc kiểm chứng và bàn giao. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Chạy đầy đủ mười chuỗi trình diễn nêu dưới đây trên môi trường trình diễn tại chỗ; tất cả phải đạt. Chuỗi có thể tự động hoá cần có bài kiểm bằng Playwright, công cụ điều khiển trình duyệt để lặp lại thao tác thử.
- Chạy lại đủ mười chuỗi trình diễn trên máy sẽ dùng bàn giao với bản phát hành cuối; tất cả phải đạt và có video bằng chứng.
- Đối soát từng chỉ tiêu chất lượng và phép kiểm chứng kỹ thuật nêu dưới đây; ghi môi trường, ngày đo, người đo và kết quả. Chỉ tiêu không đạt phải ghi Chưa thể nghiệm thu kèm lý do; không tự hạ ngưỡng.
- Chạy bài thử 50 người dùng và 10 ván đồng thời; báo cáo lỗi, mức sử dụng bộ xử lý, bộ nhớ và độ trễ nước đi ở phân vị 95. Phân vị 95 là mốc thời gian mà ít nhất 95% mẫu đo không vượt quá.
- Trên máy sạch đã có Node.js để chạy ứng dụng, pnpm để cài thư viện và tệp .env chứa cấu hình được cấp, người dùng làm theo hướng dẫn chạy dự án phải khởi động được toàn bộ ứng dụng trong không quá 15 phút.
- Trước buổi trình diễn phải chuẩn bị tài khoản, phòng mẫu và phương án dự phòng khi mạng tại chỗ lỗi. Phương án dự phòng dùng Render, dịch vụ chạy ứng dụng trên Internet.
- Mười chuỗi trình diễn: (1) đăng ký bằng email ngoài nhóm, nhận mã thật, đổi tên hiển thị; (2) tạo tài khoản Google, hoàn tất thiết lập, đăng xuất rồi đăng nhập bằng cả mật khẩu và Google; (3) sai mật khẩu năm lần, bị chặn 15 phút nhưng Google vẫn vào được; (4) tạo phòng 10 phút, năm chỗ xem, mời bạn đang trực tuyến, thêm người bằng mã và thêm Khách bằng đường dẫn; (5) đổi phe, sẵn sàng, đếm ngược, đi quân bằng bấm và kéo, từ chối hòa, trò chuyện hai kênh, bật hình/tiếng, chia sẻ cho người xem và kết thúc chiếu hết; (6) mở công khai, người lạ vào xem, khóa phòng, chặn mã cũ, đuổi người xem và chặn quay lại; (7) ở lại sau ván, đổi phe, chơi ván hai, một người rời và chuyển chủ; (8) mất mạng 30 giây rồi tiếp tục, sau đó mất quá 60 giây và bị xử thua; (9) chơi với máy Dễ cầm Đỏ, đầu hàng, đổi sang Khó cầm Đen, máy đi trước và giải thế chiếu hết; (10) đang chơi trên máy tính thì đăng nhập cùng tài khoản trên điện thoại, ván xử thua, máy tính đăng xuất và điện thoại về Sảnh.
- Chất lượng phải kiểm: 50 người dùng và 10 ván đồng thời không lỗi; thời gian gửi nước tới đối thủ/người xem dưới 100 mili giây ở phân vị 95, tức ít nhất 95% mẫu nhanh hơn ngưỡng; máy cờ Dễ/Trung bình/Khó lần lượt không quá 300/1.000/3.000 mili giây theo cùng cách đo và cấp Khó giải đúng toàn bộ bộ thế chiếu hết ngắn đã xác minh. Camera/mic khoảng ba phòng chỉ ghi số đo, không tự đặt ngưỡng tải.
- Kiểm trên Chrome, Edge, Firefox, Safari bản mới và màn hình từ 360 điểm ảnh, có cảm ứng; giao diện tiếng Việt, đủ tương phản, có nhãn và thao tác bàn phím ở biểu mẫu/hộp thoại, tôn trọng giảm chuyển động. Máy chủ quyết định luật và quyền dữ liệu, mật khẩu được băm, khóa bí mật không lộ ra trình duyệt, đăng nhập và trò chuyện có giới hạn.
- Kiểm lưu giữ và riêng tư: ván trực tuyến/nước đi lưu bền; ván với máy chỉ trong bộ nhớ; xóa trò chuyện khi đóng phòng, biên lai chống lệnh trùng sau 24 giờ và nhật ký sau tối đa 14 ngày. Nhật ký có cấu trúc và địa chỉ kiểm tra tình trạng, không chứa mật khẩu, mã xác minh, thông tin quyền truy cập hoặc nội dung trò chuyện. Tên và tin nhắn hiển thị như văn bản, không thực thi mã. Camera/mic mặc định tắt, không ghi/lưu. Chỉ thu thập email, tên đăng nhập, tên hiển thị, mật khẩu băm, quan hệ bạn bè và ván; không hỏi tuổi.
- Đối soát chín phép kiểm kỹ thuật: gửi thư thật tới ba Gmail ngoài nhóm và năm thư/giờ; Google không tự gộp email đã đăng ký; gọi trực tiếp dịch vụ xác thực cũng không đổi được email; đăng nhập bằng tên không lộ email hay sự tồn tại tài khoản; đăng nhập thiết bị khác xử đúng phiên/vị trí chơi; danh tính Khách tạo/hủy và hết hạn đúng 12 giờ; camera/mic với hai người chơi và năm người xem trên các máy cùng mạng có kết nối bảo mật, thử đuổi và chuyển giữa dịch vụ tự chạy/dự phòng, ghi tài nguyên và thời gian thu hồi quyền; máy cờ chạy 50 thế giữa ván mỗi cấp, ghi độ sâu/tốc độ/đáp án; truyền tin tức thời ở tải 50 người và 10 ván. Phép đo truyền hình/tiếng ghi lượng sử dụng dịch vụ dự phòng, không tự đặt ngưỡng đạt cho tài nguyên hoặc thời gian thu hồi.

**Việc cần làm**

- Đối soát kịch bản trình diễn, chỉ tiêu đã duyệt và phương pháp đo; sau triển khai tổng hợp bằng chứng thực đo, lỗi còn mở và hướng dẫn chạy bản bàn giao.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát mười chuỗi trình diễn, tải 50 người/10 ván, tốc độ nước đi và hồ sơ bàn giao bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.
- Hồ sơ bằng chứng được bổ sung từ công việc kiểm chứng cuối cùng: môi trường, ngày đo, người đo, kết quả thực tế, lỗi và các chỉ tiêu chưa đạt.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ mười chuỗi trình diễn, tải 50 người/10 ván, tốc độ nước đi và hồ sơ bàn giao; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.
- Ngưỡng nghiệm thu giữ nguyên trước thi công; hồ sơ bằng chứng chỉ đóng khi công việc kiểm chứng cuối cùng cung cấp đủ kết quả, chỉ tiêu chưa đạt ghi rõ Chưa thể nghiệm thu, không hạ ngưỡng để đóng hồ sơ.

**Phạm vi và phối hợp**

Không tự giảm ngưỡng hay cắt tính năng để ghi đạt; đóng hồ sơ đặc tả không đồng nghĩa phần mềm đã qua nghiệm thu.

---

<a id="t51"></a>

#### T51 · Hồi quy tích hợp toàn bộ chức năng và D1–D10 vòng đầy đủ

| Trường | Giá trị |
|---|---|
| Issue Id | 87 |
| Issue Type | Task |
| Parent | EP-00 |
| Assignee | Thư |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-87 |
| Start date | 31/10/2026 |
| Due date | 02/11/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 24 giờ |
| Remaining Estimate | 24 giờ |
| Story Points | 5 |
| Story (relates to) | US-00.5 |
| Is blocked by | T08, T26, T36, T38, T40, T42, T44, T46, T52, T58, T59, T61, T65 |
| Component chính | QA & DevOps |
| Components | Nền tảng, QA & DevOps |
| Labels | chinh-qa-devops, kiem-thu-tich-hop, nen-tang, p1, sprint-4 |
| Nguồn đặc tả (BA / AC) | 0.6, 0.7, 0.12, 0.13, 0.14, 0.17, 10.1, BACKLOG-P1.md §8 |


**Description**

**Mục tiêu**

Kiểm tra toàn bộ sản phẩm sau khi ghép các chức năng để phát hiện lỗi xuất hiện giữa các phần.

**Bối cảnh công việc**

Chỉ dùng bản đã hoàn tất mọi phần triển khai. Việc kiểm chuyên đề có thể diễn ra song song nhưng dùng tài khoản và phòng thử riêng; báo cáo tổng hợp không được coi phần chưa kiểm hoặc chưa đo là đã đạt.

**Yêu cầu cần đáp ứng**

- Đăng ký bằng Tên đăng nhập, mật khẩu và Gmail ngoài nhóm; nhận mã xác minh thật, vào Sảnh rồi đổi sang Tên hiển thị tiếng Việt. Kết quả: tài khoản dùng được, tên mới lưu đúng.
- Đăng ký bằng Google, hoàn tất đặt Tên đăng nhập và mật khẩu; đăng xuất rồi lần lượt vào lại bằng mật khẩu và Google. Kết quả: cả hai cách vào đúng tài khoản, không tạo tài khoản trùng.
- Nhập sai mật khẩu năm lần để bị khoá 15 phút; thử cả mật khẩu đúng trong thời gian khoá và thử đăng nhập Google. Kết quả: mật khẩu vẫn bị chặn, Google vào được và không xoá bộ đếm sai.
- Tạo phòng 10 phút, năm chỗ xem; mời một bạn đang trực tuyến vào ghế qua thông báo, đưa mã cho người chưa kết bạn vào xem, rồi dùng đường dẫn mời bằng phiên Khách chưa đăng nhập. Kết quả: mỗi người vào đúng phòng và đúng vai trò, Khách không phải mở đường dẫn lần hai.
- Xin đổi bên, cùng Sẵn sàng, đếm 3–2–1 rồi đi quân bằng bấm và kéo thả; gửi xin hoà và từ chối, chat riêng giữa hai người chơi và chat chung với người xem; bật camera, mic và chia sẻ cho người xem, kết thúc bằng chiếu hết. Kết quả: bàn cờ, đồng hồ, quyền chat, hình tiếng và kết quả thống nhất.
- Mở Công khai để người lạ thấy phòng ở Sảnh và vào xem; khoá phòng rồi dùng mã cũ thử vào; người chơi đuổi một người xem và người đó thử quay lại. Kết quả: người mới không vượt khoá, người bị đuổi bị chặn và mất hình tiếng.
- Sau ván chọn Ở lại phòng, xin đổi bên và bắt đầu ván thứ hai; sau đó chủ phòng rời. Kết quả: mã ván mới, đồng hồ đặt lại, người còn lại nhận quyền chủ phòng và phòng tiếp tục chờ.
- Ngắt mạng một người chơi 30 giây rồi nối lại, sau đó thử mất mạng quá 60 giây. Kết quả: lần đầu tiếp tục đúng thế và thời gian, lần sau xử thua do mất kết nối nếu đồng hồ chưa hết trước.
- Chơi với máy Dễ cầm Đỏ, đầu hàng rồi chọn Ván mới, đổi sang Đen ở cấp Khó. Kết quả: máy đi trước, đúng cấp và phe; trình diễn cấp Khó giải thế chiếu hết có đáp án đã xác minh.
- Đang đấu online trên máy tính, đăng nhập cùng tài khoản ở điện thoại. Kết quả: ván cũ bị xử thua, máy tính bị đăng xuất và điện thoại vào Sảnh.
- Kiểm thêm: tình trạng máy chủ, kết nối dữ liệu và máy cờ được báo đúng; nhật ký có thời gian, mức lỗi và sự kiện nhưng không chứa mật khẩu, mã xác minh, thông tin đăng nhập bí mật hoặc nội dung chat. Biên lai chống lặp lệnh bị xoá sau 24 giờ, nhật ký giữ tối đa 14 ngày.
- Mở thêm thẻ cùng tài khoản: thẻ mới tiếp quản, thẻ cũ chỉ đọc kể cả khi tự nối lại. Nối lại phải nhận đủ phòng, ván, đồng hồ và vai trò; không được thao tác bằng quyền cũ.
- Khách đủ 12 giờ khi còn ngồi ghế không bị ngắt giữa ván; sau khi rời và hết phiên thì dữ liệu cá nhân bị xoá. Mất mạng khi đang đếm bắt đầu phải huỷ đếm, giữ ghế 60 giây, không tạo ván hoặc xử thua.
- Người ngồi ghế cuối rời thì phòng đóng, người xem về Sảnh và chat bị xoá. Sau ván giữ đúng ghế, người xem, chế độ, mức giờ và chat; đổi người trong cặp chat riêng không làm người mới đọc được nội dung cũ. Rời ghế thu hồi quyền phát hình tiếng.
- Hộp kết quả có đúng lý do: chiếu hết, hết nước, đầu hàng, hết giờ, mất mạng, lặp thế, thoả thuận hoà, 120 nửa nước không ăn quân, chiếu liên tục hoặc bị gián đoạn. Gián đoạn không ghi thắng, thua hay hoà.
- Dựng cơ sở dữ liệu thử từ trống bằng toàn bộ tệp tạo/cập nhật đã tích hợp, gồm hồ sơ, bộ đếm đăng nhập và biên lai lệnh; kiểm đủ bảng, quan hệ, chỉ mục và quyền bằng yêu cầu trực tiếp. Người dùng không đọc hoặc ghi dữ liệu ngoài quyền; chỉ máy chủ ghi phòng, ván và kết quả.
- Kiểm riêng hai đường kết thúc phiên Khách: hết hạn khi không còn giữ vị trí và chủ động Đăng xuất. Cả hai phải về màn Đăng nhập, xoá tên/dữ liệu cá nhân Khách; vào lại tạo danh tính mới. Kiểm không xoá nhầm dữ liệu của người khác.

**Việc cần làm**

- Lập bảng nối mỗi luồng tích hợp với dữ liệu ban đầu, các phía quan sát và bằng chứng kết thúc; chuẩn bị riêng bộ thế lặp có cùng vị trí nhưng khác lượt, chu kỳ chiếu liên tục và nước chạm mốc 120 nửa nước để kiểm kết quả thống nhất từ luật đến hộp kết quả.
- Chuẩn bị tài khoản, phòng và thế cờ cho từng luồng; ghi phiên bản bản dựng và môi trường. Chạy từ giao diện thật, quan sát đồng thời ở người chơi và người xem, không thay luồng thật bằng dữ liệu giả.
- Tự động hoá những đoạn lặp được bằng công cụ điều khiển trình duyệt; các đoạn cần email, thiết bị, camera hoặc thao tác mạng thật ghi rõ cách thực hiện thủ công.
- Lưu kết quả từng bước, ghi lỗi với cách tái hiện và ảnh hoặc video. Sau khi sửa, chạy lại tình huống lỗi và luồng liên quan; tránh trộn kết quả từ hai bản phần mềm mà không ghi chú.

**Kết quả bàn giao**

- Báo cáo kiểm tra toàn bộ mười luồng cùng các tình huống tích hợp bổ sung; bộ kiểm tự động cho phần tự động hoá được.
- Danh sách lỗi, kết quả kiểm lại và bằng chứng để người khác tái hiện.

**Điều kiện hoàn thành**

- Mười luồng và các tình huống tích hợp được giao đều có kết quả đạt, không còn lỗi Nghiêm trọng hoặc Cao mở trong phạm vi kiểm.
- Báo cáo phân biệt Đạt, Không đạt và Chưa kiểm được; dữ liệu đo chất lượng, bản đóng gói và lần tổng duyệt cuối vẫn cần kết quả riêng.
- Nước hợp lệ gây chiếu hết phải kết thúc thắng/thua trước hòa; hết nước hoặc chiếu liên tục gây thắng/thua phải ưu tiên trước hòa 120 nửa nước. Lỗi media không đổi kết quả hoặc dừng đồng hồ.

**Phạm vi và phối hợp**

Không thay báo cáo đo tải hoặc kiểm chứng máy cờ bằng việc chơi thử thành công. Hoàn tất công việc này chưa tự cho phép phát hành nếu các kiểm tra chuyên đề hoặc đo chất lượng còn chưa đạt.

---

<a id="t66"></a>

#### T66 · Đo tải, NFR và đối soát bằng chứng chín cổng kỹ thuật

| Trường | Giá trị |
|---|---|
| Issue Id | 102 |
| Issue Type | Task |
| Parent | EP-00 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-102 |
| Start date | 31/10/2026 |
| Due date | 01/11/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 16 giờ |
| Remaining Estimate | 16 giờ |
| Story Points | 3 |
| Story (relates to) | US-00.5 |
| Is blocked by | T08, T26, T36, T38, T40, T42, T44, T46, T52, T58, T59, T61, T65 |
| Component chính | QA & DevOps |
| Components | Nền tảng, QA & DevOps |
| Labels | chinh-qa-devops, do-chat-luong, nen-tang, p1, sprint-4 |
| Nguồn đặc tả (BA / AC) | 0.2, 0.3, 0.4, 0.15, 0.16, 0.17, 6.1, 10.1, BACKLOG-P1.md §6, BACKLOG-P1.md §7 |


**Description**

**Mục tiêu**

Đo chất lượng vận hành và kiểm chứng các ràng buộc kỹ thuật trên bản tích hợp trước khi phát hành.

**Bối cảnh công việc**

Mỗi kết quả phải gắn với máy, mạng, trình duyệt, bản phần mềm, bộ dữ liệu, ngày và người đo. Có thể tổng hợp bằng chứng đã thực hiện ở phần chuyên môn nhưng phải kiểm tính đầy đủ, cùng phạm vi và khả năng lặp lại; nguyên mẫu không thay được bằng chứng trên sản phẩm thật.

**Yêu cầu cần đáp ứng**

- Tải đồng thời 50 người dùng giả lập và 10 ván: ghi số yêu cầu, lỗi, thời gian nước đi tới đối thủ và người xem, mức dùng bộ xử lý và bộ nhớ. Mục tiêu độ trễ dưới 100 mili giây tại mốc mà ít nhất 95% mẫu không vượt quá; 10 ván chạy cùng lúc không lỗi.
- Máy cờ: bộ 50 thế giữa ván cho mỗi cấp, ghi độ sâu và thời gian; Dễ, Trung bình, Khó lần lượt trong 300, 1.000, 3.000 mili giây ở mốc 95%. Đối chiếu cấp Khó giải đúng toàn bộ bộ chiếu hết ngắn và kết quả đấu máy phân biệt sức chơi.
- Gửi mã xác minh thật đến ba Gmail ngoài nhóm, thử năm thư trong một giờ; ghi thời gian nhận, thư rác và hạn mức. Thử Google với email đã đăng ký bằng mật khẩu phải bị từ chối gộp tài khoản. Gửi trực tiếp yêu cầu đổi email đến dịch vụ xác thực phải bị chặn; chỉ khoá ô email trên màn hình là chưa đạt.
- Kiểm đăng nhập bằng Tên đăng nhập không làm lộ email hoặc việc tên có tồn tại; khoá sau năm lần sai trong 15 phút. Kiểm đăng nhập hai thiết bị xử thua đúng, thu hồi phiên cũ, tạo và huỷ phiên Khách với hạn 12 giờ cùng ngoại lệ đang ngồi ghế.
- Hình tiếng: một phòng hai người phát, năm người chỉ nhận, thử đuổi và thu hồi quyền; thử dịch vụ LiveKit tự chạy và dịch vụ đám mây của cùng nhà cung cấp, chuyển bằng cấu hình. LiveKit là dịch vụ truyền camera và mic. Các máy cùng mạng dùng kết nối web được mã hoá; ghi tài nguyên, thời gian thu hồi và phút sử dụng. Thử tải hình tiếng khoảng ba phòng chỉ ghi số đo, không tự đặt ngưỡng đạt.
- Bảo mật và dữ liệu: máy chủ phân xử luật; người dùng không đọc hoặc ghi trái phép dữ liệu người khác; mật khẩu được băm; khoá bí mật không nằm trong mã gửi trình duyệt; chat có giới hạn tốc độ. Ván online và nước đi lưu bền, ván với máy chỉ trong bộ nhớ; chat xoá khi phòng đóng, biên lai lệnh xoá sau 24 giờ, nhật ký tối đa 14 ngày.
- Thiết bị và giao diện: bản mới Chrome, Edge, Firefox, Safari; rộng từ 360 điểm ảnh và bàn cờ dùng bằng cảm ứng. Kiểm mức cơ bản của WCAG 2.1 AA, tức hướng dẫn trợ năng nội dung web phiên bản 2.1 ở cấp AA: tương phản dễ đọc, nhãn cho điều khiển, dùng bàn phím ở biểu mẫu/hộp thoại và tôn trọng lựa chọn giảm chuyển động. Toàn bộ giao diện tiếng Việt; chat và các tên hiển thị như văn bản, không thực thi mã chèn vào.
- Nhật ký có cấu trúc và báo sức khoẻ dịch vụ, không ghi mật khẩu, mã xác minh, thông tin đăng nhập bí mật hoặc nội dung chat. Camera, mic mặc định tắt, không ghi hoặc lưu; chỉ thu thập email, Tên đăng nhập, Tên hiển thị, mật khẩu băm, bạn bè và ván, không hỏi tuổi.

**Việc cần làm**

- Chuẩn bị bộ lệnh đo và nơi lưu mẫu gốc trước khi chạy; tách bảng điều kiện bắt buộc khỏi bảng số đo media chỉ ghi nhận. Ghi mốc nhận nước đi ở máy chủ, đối thủ và người xem để phép đo độ trễ có điểm bắt đầu/kết thúc rõ ràng.
- Ghi máy, mạng, trình duyệt, bản phần mềm, người đo, ngày đo và số lượt; kiểm đủ 12 nhóm chất lượng vận hành và 9 nhóm thử khả thi nêu trong các yêu cầu trên.
- Chạy 50 kết nối/10 ván; lưu thời gian từng nước tới đối thủ và người xem, lỗi, tài nguyên. Tính mốc 95% từ dữ liệu thô, không thay bằng trung bình.
- Đối chiếu bộ 50 thế mỗi cấp, chiếu hết và đấu máy; kiểm độc lập báo cáo gửi thư, Google, đổi email trực tiếp, tên đăng nhập, phiên/Khách và media trên môi trường thật.
- Thử giao diện/trợ năng trên trình duyệt và kích thước yêu cầu, kiểm quyền dữ liệu, thời hạn xoá và nhật ký chứa dữ liệu nhạy cảm.
- Tổng hợp bằng chứng theo từng điều kiện; phần chưa đạt giữ nguyên Không đạt/Chưa kiểm được và chặn phát hành. Số đo media chỉ yêu cầu ghi nhận không tự thêm ngưỡng.

**Kết quả bàn giao**

- Kịch bản đo cùng dữ liệu thô, bảng chỉ số, cấu hình và bằng chứng kiểm chứng từng nhóm yêu cầu.
- Danh sách điểm Đạt, Không đạt, Chưa kiểm được và ảnh hưởng tới phát hành.

**Điều kiện hoàn thành**

- Mọi nhóm yêu cầu có bằng chứng đúng phạm vi; tiêu chí bắt buộc chưa đạt phải giữ trạng thái chưa đạt và chặn phát hành.
- Các phép đo chỉ yêu cầu ghi số liệu được báo đầy đủ, không tự biến thành ngưỡng cam kết mới.
- Đăng nhập Google trong lúc khoá không xoá bộ đếm mật khẩu; thử sai cả username không tồn tại. Báo cáo thư ghi kết quả thực tế tới Gmail ngoài nhóm; báo cáo media ghi cấu hình chuyển môi trường và số đo mà không tự đặt ngưỡng thu hồi.

**Phạm vi và phối hợp**

Không tuyên bố hệ thống đạt chỉ vì đã viết xong báo cáo. Đây là đo và xác minh; phần sửa lỗi vẫn do công việc sở hữu chức năng thực hiện.

---

<a id="t70"></a>

#### T70 · Kiểm cổng phát hành, đóng gói v1.0 và hướng dẫn demo

| Trường | Giá trị |
|---|---|
| Issue Id | 106 |
| Issue Type | Task |
| Parent | EP-00 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-106 |
| Start date | 03/11/2026 |
| Due date | 03/11/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 4 giờ |
| Remaining Estimate | 4 giờ |
| Story Points | 1 |
| Story (relates to) | US-00.5 |
| Is blocked by | T13, T16, T17, T27, T28, T29, T30, T39, T43, T45, T47, T48, T49, T50, T51, T60, T62, T64, T66, T67, T68, T69 |
| Component chính | QA & DevOps |
| Components | Nền tảng, QA & DevOps |
| Labels | chinh-qa-devops, dong-goi-phat-hanh, nen-tang, p1, sprint-4 |
| Nguồn đặc tả (BA / AC) | 0.4, 0.16, 10.1, BACKLOG-P1.md §8 |


**Description**

**Mục tiêu**

Kiểm điều kiện phát hành và chuẩn bị bộ chạy trình diễn mà thành viên khác có thể tự khởi động.

**Bối cảnh công việc**

Chỉ bắt đầu khi kiểm tích hợp, kiểm chuyên đề và đo chất lượng đã hoàn tất với mọi điều kiện bắt buộc đạt, không còn lỗi Nghiêm trọng hoặc Cao. Bản bàn giao phải có thể chạy lại được, có tài khoản và dữ liệu minh hoạ, không phụ thuộc trí nhớ của người đóng gói.

**Yêu cầu cần đáp ứng**

- Kiểm đủ danh sách điều kiện nghiệm thu và các ca kiểm có tiền điều kiện, thao tác, dữ liệu, kết quả mong đợi; tiêu chí có nhiều nhánh phải có trường hợp tương ứng. Có báo cáo kiểm lại cuối từng đợt phát triển và danh sách lỗi còn mở.
- Bộ chạy tại máy trình diễn gồm giao diện web, máy chủ ứng dụng và LiveKit tự chạy bằng Docker (công cụ khởi động dịch vụ theo cấu hình). Hướng dẫn ghi rõ cách khởi động từng thành phần. Các máy trong cùng mạng truy cập web qua HTTPS, kết nối được mã hoá với chứng chỉ hợp lệ trên thiết bị thử, để trình duyệt cho dùng camera và mic.
- Viết hướng dẫn cho máy đã có Node, môi trường chạy ứng dụng, và pnpm, công cụ cài các gói phụ thuộc, cùng tệp cấu hình được cấp riêng. Người không tham gia đóng gói phải chạy toàn bộ ứng dụng trong không quá 15 phút.
- Chuẩn bị tài khoản chính thức, tài khoản Google, email nhận mã thật, phiên Khách, phòng mẫu và thế cờ phục vụ trình diễn. Có đường chạy dự phòng: giao diện và máy chủ ứng dụng trên Render, dịch vụ lưu trữ ứng dụng; camera và mic trên LiveKit Cloud, dịch vụ hình tiếng đám mây.
- Hướng dẫn nêu cách chọn môi trường, khởi động, mở địa chỉ truy cập, kiểm dịch vụ chạy và dừng. Không để khoá bí mật hoặc mật khẩu thật trong mã nguồn, ảnh chụp hoặc tài liệu phát công khai.

**Việc cần làm**

- Khoá danh sách phiên bản mã nguồn, gói phụ thuộc, cấu hình và dữ liệu trình diễn đúng với báo cáo đạt; lập bảng nơi lấy từng bí mật qua kênh riêng. Kiểm máy chạy, Node, pnpm, Docker và chứng chỉ đã đủ trước khi bấm giờ khởi động.
- Đối chiếu báo cáo chức năng, kiểm thử và số đo; thiếu bằng chứng hoặc còn điều kiện chưa đạt thì giữ việc phát hành ở trạng thái Chưa thể thực hiện và nêu rõ nguyên nhân.
- Đóng gói đúng bản đã kiểm, ghi phiên bản và cấu hình; tạo dữ liệu mẫu có thể lập lại. Đưa hướng dẫn cho thành viên khác thao tác trên máy sạch đủ điều kiện và bấm giờ, ghi lại chỗ phải hỏi thêm để sửa tài liệu.
- Thử cấu hình dự phòng và chuẩn bị trình tự minh hoạ mười luồng dưới đây để người chạy cuối không phải tra mã kịch bản.
- Đăng ký bằng Tên đăng nhập, mật khẩu và Gmail ngoài nhóm; nhận mã xác minh thật, vào Sảnh rồi đổi sang Tên hiển thị tiếng Việt. Kết quả: tài khoản dùng được, tên mới lưu đúng.
- Đăng ký bằng Google, hoàn tất đặt Tên đăng nhập và mật khẩu; đăng xuất rồi lần lượt vào lại bằng mật khẩu và Google. Kết quả: cả hai cách vào đúng tài khoản, không tạo tài khoản trùng.
- Nhập sai mật khẩu năm lần để bị khoá 15 phút; thử cả mật khẩu đúng trong thời gian khoá và thử đăng nhập Google. Kết quả: mật khẩu vẫn bị chặn, Google vào được và không xoá bộ đếm sai.
- Tạo phòng 10 phút, năm chỗ xem; mời một bạn đang trực tuyến vào ghế qua thông báo, đưa mã cho người chưa kết bạn vào xem, rồi dùng đường dẫn mời bằng phiên Khách chưa đăng nhập. Kết quả: mỗi người vào đúng phòng và đúng vai trò, Khách không phải mở đường dẫn lần hai.
- Xin đổi bên, cùng Sẵn sàng, đếm 3–2–1 rồi đi quân bằng bấm và kéo thả; gửi xin hoà và từ chối, chat riêng giữa hai người chơi và chat chung với người xem; bật camera, mic và chia sẻ cho người xem, kết thúc bằng chiếu hết. Kết quả: bàn cờ, đồng hồ, quyền chat, hình tiếng và kết quả thống nhất.
- Mở Công khai để người lạ thấy phòng ở Sảnh và vào xem; khoá phòng rồi dùng mã cũ thử vào; người chơi đuổi một người xem và người đó thử quay lại. Kết quả: người mới không vượt khoá, người bị đuổi bị chặn và mất hình tiếng.
- Sau ván chọn Ở lại phòng, xin đổi bên và bắt đầu ván thứ hai; sau đó chủ phòng rời. Kết quả: mã ván mới, đồng hồ đặt lại, người còn lại nhận quyền chủ phòng và phòng tiếp tục chờ.
- Ngắt mạng một người chơi 30 giây rồi nối lại, sau đó thử mất mạng quá 60 giây. Kết quả: lần đầu tiếp tục đúng thế và thời gian, lần sau xử thua do mất kết nối nếu đồng hồ chưa hết trước.
- Chơi với máy Dễ cầm Đỏ, đầu hàng rồi chọn Ván mới, đổi sang Đen ở cấp Khó. Kết quả: máy đi trước, đúng cấp và phe; trình diễn cấp Khó giải thế chiếu hết có đáp án đã xác minh.
- Đang đấu online trên máy tính, đăng nhập cùng tài khoản ở điện thoại. Kết quả: ván cũ bị xử thua, máy tính bị đăng xuất và điện thoại vào Sảnh.

**Kết quả bàn giao**

- Bản phát hành cùng hướng dẫn chạy, cấu hình mẫu không có bí mật, tài khoản và dữ liệu trình diễn được bàn giao phù hợp.
- Biên bản đủ điều kiện phát hành và bằng chứng người khác khởi động trong 15 phút; hướng dẫn chuyển sang phương án dự phòng.

**Điều kiện hoàn thành**

- Mọi điều kiện bắt buộc đã đạt; bản đóng gói khớp bản đã kiểm và người thử độc lập khởi động thành công trong thời gian yêu cầu.
- Có dữ liệu cho mười luồng: đăng ký email thật và sửa tên; đăng ký Google rồi đăng nhập hai cách; khoá mật khẩu; tạo phòng và mời bạn hoặc Khách; đổi bên, chơi, chat, camera; công khai, khoá và đuổi người xem; chơi ván tiếp; rớt mạng; chơi với máy và đổi phe; đăng nhập thiết bị khác.
- Gói dự phòng chỉ đổi cấu hình LiveKit giữa tự chạy và Cloud, không đặt LiveKit trên Render. Hướng dẫn có cách nhận biết ứng dụng/dữ liệu/media sẵn sàng và dừng dịch vụ; bản đã sửa sau nghiệm thu phải được kiểm lại phần bị ảnh hưởng trước bàn giao.

**Phạm vi và phối hợp**

Công việc này đóng gói và xác nhận điều kiện phát hành. Tổng duyệt đầy đủ có ghi hình trên máy trình diễn là bước riêng; không coi bản đóng gói chạy được là bằng chứng mọi chức năng đạt.

---

<a id="t71"></a>

#### T71 · Tổng duyệt D1–D10 trên bản phát hành và ghi hình

| Trường | Giá trị |
|---|---|
| Issue Id | 107 |
| Issue Type | Task |
| Parent | EP-00 |
| Assignee | Thư |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-107 |
| Start date | 04/11/2026 |
| Due date | 04/11/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 1 |
| Story (relates to) | US-00.5 |
| Is blocked by | T70 |
| Component chính | QA & DevOps |
| Components | Nền tảng, QA & DevOps |
| Labels | chinh-qa-devops, nen-tang, p1, sprint-4, tong-duyet |
| Nguồn đặc tả (BA / AC) | 0.4, 0.6, 0.7, 0.9, 0.15, 0.16, 10.1, BACKLOG-P1.md §8 |


**Description**

**Mục tiêu**

Tổng duyệt đủ mười luồng sử dụng trên bản phát hành và ghi hình làm bằng chứng bàn giao.

**Bối cảnh công việc**

Sử dụng đúng máy, mạng và bản phần mềm dự kiến trình diễn, sau khi đã đủ điều kiện phát hành. Chuẩn bị các tài khoản, phòng và thế cờ đã đóng gói; người thực hiện ghi rõ phiên bản để người xem biết video tương ứng với bản nào.

**Yêu cầu cần đáp ứng**

- Đăng ký bằng Tên đăng nhập, mật khẩu và Gmail ngoài nhóm; nhận mã xác minh thật, vào Sảnh rồi đổi sang Tên hiển thị tiếng Việt. Kết quả: tài khoản dùng được, tên mới lưu đúng.
- Đăng ký bằng Google, hoàn tất đặt Tên đăng nhập và mật khẩu; đăng xuất rồi lần lượt vào lại bằng mật khẩu và Google. Kết quả: cả hai cách vào đúng tài khoản, không tạo tài khoản trùng.
- Nhập sai mật khẩu năm lần để bị khoá 15 phút; thử cả mật khẩu đúng trong thời gian khoá và thử đăng nhập Google. Kết quả: mật khẩu vẫn bị chặn, Google vào được và không xoá bộ đếm sai.
- Tạo phòng 10 phút, năm chỗ xem; mời một bạn đang trực tuyến vào ghế qua thông báo, đưa mã cho người chưa kết bạn vào xem, rồi dùng đường dẫn mời bằng phiên Khách chưa đăng nhập. Kết quả: mỗi người vào đúng phòng và đúng vai trò, Khách không phải mở đường dẫn lần hai.
- Xin đổi bên, cùng Sẵn sàng, đếm 3–2–1 rồi đi quân bằng bấm và kéo thả; gửi xin hoà và từ chối, chat riêng giữa hai người chơi và chat chung với người xem; bật camera, mic và chia sẻ cho người xem, kết thúc bằng chiếu hết. Kết quả: bàn cờ, đồng hồ, quyền chat, hình tiếng và kết quả thống nhất.
- Mở Công khai để người lạ thấy phòng ở Sảnh và vào xem; khoá phòng rồi dùng mã cũ thử vào; người chơi đuổi một người xem và người đó thử quay lại. Kết quả: người mới không vượt khoá, người bị đuổi bị chặn và mất hình tiếng.
- Sau ván chọn Ở lại phòng, xin đổi bên và bắt đầu ván thứ hai; sau đó chủ phòng rời. Kết quả: mã ván mới, đồng hồ đặt lại, người còn lại nhận quyền chủ phòng và phòng tiếp tục chờ.
- Ngắt mạng một người chơi 30 giây rồi nối lại, sau đó thử mất mạng quá 60 giây. Kết quả: lần đầu tiếp tục đúng thế và thời gian, lần sau xử thua do mất kết nối nếu đồng hồ chưa hết trước.
- Chơi với máy Dễ cầm Đỏ, đầu hàng rồi chọn Ván mới, đổi sang Đen ở cấp Khó. Kết quả: máy đi trước, đúng cấp và phe; trình diễn cấp Khó giải thế chiếu hết có đáp án đã xác minh.
- Đang đấu online trên máy tính, đăng nhập cùng tài khoản ở điện thoại. Kết quả: ván cũ bị xử thua, máy tính bị đăng xuất và điện thoại vào Sảnh.

**Việc cần làm**

- Lập danh sách mười luồng với tài khoản/thiết bị tham gia và trạng thái phòng cần có; kiểm dữ liệu mẫu trước ghi hình, giữ nguyên số phiên bản bản phát hành trong tên báo cáo và thông tin video.
- Kiểm môi trường, thiết bị thu hình tiếng và cách ghi màn hình trước khi chạy. Dùng dữ liệu trình diễn thay cho tài khoản cá nhân; tránh quay khoá bí mật, mật khẩu hoặc mã xác minh còn hiệu lực.
- Chạy từng luồng từ bước đầu đến kết quả cuối, quan sát các phía liên quan chứ không chỉ máy của chủ phòng. Ghi hình đủ thao tác và trạng thái kết quả để giảng viên hoặc thành viên mới hiểu điều được chứng minh.
- Ghi bảng kết quả từng luồng, thời điểm tương ứng trong video và điểm còn thiếu. Nếu gặp lỗi, ghi cách tái hiện, chuyển cho người phụ trách phần đó sửa, rồi kiểm lại trên bản đã sửa; ghi rõ video nào đã được thay thế.

**Kết quả bàn giao**

- Video hoặc các đoạn video có chỉ dẫn thứ tự, kèm báo cáo kết quả của cả mười luồng trên máy trình diễn.
- Danh sách lỗi và kết quả chạy lại nếu có, cùng thông tin phiên bản phần mềm và môi trường.

**Điều kiện hoàn thành**

- Cả mười luồng phải chạy đạt và có bằng chứng xem được; không dùng video cũ để chứng minh một bản mới chưa chạy.
- Luồng không chạy được vì lỗi, thiếu thiết bị hoặc dịch vụ ngoài phải được ghi Không đạt hoặc Chưa kiểm được, không đổi thành Đạt để kịp bàn giao.
- Mỗi luồng có mốc video và kết quả cuối của các phía liên quan; lỗi được sửa phải quay lại đoạn có đủ bước gây lỗi và kết quả mới trên bản sửa. Video không lộ bí mật hay mã xác minh còn hiệu lực.

**Phạm vi và phối hợp**

Ước lượng lại 8 giờ cho tổng duyệt D1–D10, chuẩn bị/reset dữ liệu giữa các lượt, ghi hình và kiểm tra đầy đủ bằng chứng bàn giao theo phạm vi hiện có.

Đây là tổng duyệt và ghi bằng chứng trên bản phát hành. Không thay các phép đo tải, kiểm bảo mật hay kiểm sức chơi bằng việc video trình diễn chạy thành công.

---

<a id="ep-01"></a>

## EP-01 · Đăng ký và đăng nhập

| Trường | Giá trị |
|---|---|
| Issue Id | 2 |
| Issue Type | Epic |
| Parent | — |
| Assignee | Tình |
| Reporter | Tình |
| Priority | Medium |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-2 |
| Start date | 07/10/2026 |
| Due date | 14/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Component chính | Tổng hợp phạm vi các Task |
| Components | BE, FE, QA & DevOps, Tài khoản, Ván trực tuyến |
| Labels | EP-01, dac-ta, p1, tai-khoan, van-truc-tuyen |
| Nguồn đặc tả (BA / AC) | 0.2, 0.3, 0.4, 0.15, 0.17, 1.1, 1.2, 1.3, 1.4, 1.5, 1.8 |


**Description**

**Mục tiêu**

Bàn giao bộ đặc tả đã duyệt về đăng ký, đăng nhập, Khách và phiên; bảo đảm các đặc tả thành phần nhất quán khi triển khai.

**Bối cảnh công việc**

Bản đầu có đăng ký bằng tên/mật khẩu/email xác minh, tài khoản Google và Khách. Phiên đăng nhập phải kiểm soát một vị trí chơi và hậu quả khi chuyển thiết bị. Các quyết định sản phẩm đã có hiệu lực; nhóm chức năng này tổng hợp và truy vết yêu cầu, không mở một vòng quyết định hoặc duyệt lại phạm vi.

**Yêu cầu cần đáp ứng**

- Đăng ký thường gồm tên/mật khẩu, email và mã xác minh; tên cấm bị từ chối ngay khi nhập, tên hiển thị mặc định bằng tên đăng nhập. Google mới phải đặt tên/mật khẩu, không mã xác minh và không tự gộp tài khoản trùng email.
- Đăng nhập chỉ bằng tên không phân biệt hoa thường; sai năm lần trong 15 phút chặn mật khẩu 15 phút kể cả tên không tồn tại. Google không bị chặn và đăng nhập Google thành công không đặt lại bộ đếm.
- Khách thuộc bản đầu, phiên hết sau 12 giờ kể từ lúc vào; nếu đang ngồi ghế/trong ván thì chỉ hoãn hết hạn đến khi rời, không tạo thêm một hạn 12 giờ. Khách tối đa một phòng mở, không có chức năng bạn bè. Giữ một vị trí chơi, hậu quả chuyển thiết bị, tên hiển thị và đăng xuất theo trạng thái.

**Việc cần làm**

- Đối chiếu các đặc tả thành phần về đăng ký, đăng nhập, Khách và phiên với quyết định hiện hành; kiểm đầy đủ luồng, quyền, giới hạn và ngoại lệ nêu trên.
- Rà các điểm giao với nhóm chức năng khác, gắn yêu cầu với công việc triển khai và tình huống kiểm thử; sửa sai lệch theo nguồn nghiệp vụ ưu tiên.
- Theo dõi độ đầy đủ của hồ sơ thành phần và bằng chứng phải bổ sung; mâu thuẫn chưa giải được theo thứ tự ưu tiên nguồn cần báo người phụ trách sản phẩm, không tự sửa quyết định đã duyệt.

**Kết quả bàn giao**

- Bản tổng hợp đối soát đăng ký, đăng nhập, Khách và phiên, kèm truy vết tới đặc tả thành phần và quyết định nguồn.
- Danh sách điểm giao, tình huống nghiệm thu và sai lệch cần xử lý; bằng chứng kỹ thuật được quản lý tại công việc triển khai/kiểm chứng liên quan.

**Điều kiện hoàn thành**

- Các đặc tả thành phần phản ánh đúng đăng ký, đăng nhập, Khách và phiên theo yêu cầu bên trên và thống nhất tại các điểm giao.
- Hồ sơ hoàn tất theo đặc tả thành phần cuối cùng, không yêu cầu người phụ trách sản phẩm duyệt lại quy tắc đã chốt. Kết quả chạy phần mềm và kiểm thử chỉ được ghi nhận khi có bằng chứng riêng.

**Phạm vi và phối hợp**

Không làm quên mật khẩu, đổi tên đăng nhập, đổi email hay đánh hạng.

---

<a id="us-01.1"></a>

### US-01.1 · Đăng ký bằng Username + Mật khẩu + OTP email

| Trường | Giá trị |
|---|---|
| Issue Id | 15 |
| Issue Type | Story |
| Parent | EP-01 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-15 |
| Start date | 09/10/2026 |
| Due date | 12/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T04, T08, T13 |
| Sprint thi công | S1, S2 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | BE, FE, QA & DevOps, Tài khoản |
| Labels | EP-01, dac-ta, p1, tai-khoan |
| Nguồn đặc tả (BA / AC) | 0.2, 0.4, 0.17, 1.1, 1.4, 1.5 |


**Description**

**Mục tiêu**

Bàn giao đặc tả việc tạo tài khoản bằng tên đăng nhập, mật khẩu và mã xác minh gửi tới email thật theo quy tắc đã duyệt.

**Bối cảnh công việc**

Người chưa có tài khoản đi qua ba bước: nhập thông tin đăng nhập, cung cấp email, xác nhận mã sáu chữ số. Tên hiển thị ban đầu bằng tên đăng nhập. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Bối cảnh: Bước 1. Thao tác hoặc sự kiện: Nhập tên đăng nhập sai định dạng (không khớp quy tắc 3–20 ký tự, chỉ gồm chữ cái Latin không dấu, chữ số và dấu gạch dưới) hoặc chứa từ cấm. Kết quả cần có: Báo lỗi tại ô ngay bước nhập, không sang bước 2; máy chủ kiểm lại trước khi hoàn tất.
- Ở bước nhập tên đăng nhập, tên đã tồn tại phải báo “Username đã có người dùng”; Username là tên dùng để đăng nhập. Kiểm trùng không phân biệt chữ hoa và chữ thường.
- Bối cảnh: Bước 1. Thao tác hoặc sự kiện: Mật khẩu < 8 ký tự hoặc ô xác nhận không khớp. Kết quả cần có: Báo lỗi, không sang bước 2.
- Bối cảnh: Bước 2. Thao tác hoặc sự kiện: Nhập email đã có tài khoản. Kết quả cần có: Báo "Email này đã được đăng ký", không gửi mã xác minh.
- Bối cảnh: Bước 2, email hợp lệ bất kỳ (kể cả Gmail ngoài nhóm). Thao tác hoặc sự kiện: Bấm "Xác nhận Email". Kết quả cần có: Gửi mã xác minh 6 số qua dịch vụ gửi email ngoài; hiện ô nhập mã xác minh và đồng hồ 3 phút.
- Bối cảnh: Bước 3. Thao tác hoặc sự kiện: Nhập đúng mã xác minh trong 3 phút. Kết quả cần có: Tài khoản đã kích hoạt, tên hiển thị bằng tên đăng nhập, tự đăng nhập và vào Sảnh (hoặc phòng mời đang chờ).
- Bối cảnh: Bước 3. Thao tác hoặc sự kiện: Nhập sai, mã hết hạn, hoặc bị giới hạn số lần thử. Kết quả cần có: Báo lỗi rõ ràng và hướng dẫn gửi mã mới.
- Sau khi vừa gửi mã, nút “Gửi lại mã OTP” bị khoá trong 60 giây và hiển thị đếm lùi. OTP là mã xác minh dùng một lần được gửi qua email.
- Nếu đăng ký chưa hoàn tất và chưa có hồ sơ hoàn tất, không giữ chỗ tên đăng nhập và dọn bản tạm trong khoảng 60–65 phút. Nếu đã ghi hồ sơ hoàn tất nhưng chưa xoá dấu đang chờ, phải phục hồi thay vì xoá tài khoản; chặn sử dụng cho tới khi phục hồi xong. Đăng ký, dọn và phục hồi cùng danh tính phải được xử lý lần lượt để không xoá nhầm.
- Bối cảnh: tên đăng nhập bị người khác lấy trong lúc chờ mã xác minh. Thao tác hoặc sự kiện: Xác nhận mã xác minh đúng. Kết quả cần có: Báo lỗi và quay về Bước 1, không tạo tài khoản trùng.
- Khi đã cấu hình dịch vụ gửi email ngoài, đăng ký bằng Gmail không thuộc nhóm vẫn phải nhận thư xác minh thật, mục tiêu trong không quá 1 phút. Tên người gửi là “Cờ Tướng Online”, nội dung thư bằng tiếng Việt.
- Bối cảnh: Đăng ký liên tiếp 5 lần trong 1 giờ bằng 5 email khác nhau. Thao tác hoặc sự kiện: Gửi mã xác minh. Kết quả cần có: Cả 5 thư đều gửi được (không còn giới hạn 2 thư/giờ của dịch vụ gửi email mặc định).
- Bối cảnh: Dịch vụ gửi email lỗi hoặc hết hạn mức. Thao tác hoặc sự kiện: Gửi mã xác minh. Kết quả cần có: Giao diện báo lỗi thật "Không gửi được mã, vui lòng thử lại sau"; tài khoản không bị kẹt.
- Giới hạn nhập sai mã xác minh có mục tiêu năm lần mỗi lần gửi, thực thi gần đúng qua giới hạn của hệ thống xác thực; không hứa bộ đếm chính xác từng mã. Nhà cung cấp gửi email cụ thể được lựa chọn và kiểm hạn mức trong công việc cấu hình, theo yêu cầu gửi được tới Gmail ngoài nhóm.

**Việc cần làm**

- Đối soát từng bước nhập tên/mật khẩu, email và mã xác minh; giữ đúng kiểm trùng, hạn mã, gửi lại, dọn bản tạm và phục hồi hồ sơ đã hoàn tất.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát đăng ký ba bước, từ chối tên cấm, thư xác minh thật và phục hồi đăng ký dở dang bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ đăng ký ba bước, từ chối tên cấm, thư xác minh thật và phục hồi đăng ký dở dang; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.

**Phạm vi và phối hợp**

Không bổ sung chức năng quên mật khẩu hoặc thay đổi email.

---

<a id="t04"></a>

#### T04 · BE đăng ký, SMTP, phục hồi tài khoản và thử xác thực sớm

| Trường | Giá trị |
|---|---|
| Issue Id | 40 |
| Issue Type | Task |
| Parent | EP-01 |
| Assignee | Đông |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-40 |
| Start date | 11/10/2026 |
| Due date | 13/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 24 giờ |
| Remaining Estimate | 24 giờ |
| Story Points | 5 |
| Story (relates to) | US-01.1 |
| Is blocked by | T01 |
| Component chính | BE |
| Components | BE, Tài khoản |
| Labels | chinh-be, p1, phat-trien, sprint-1, tai-khoan |
| Nguồn đặc tả (BA / AC) | 0.2, 0.4, 0.17, 1.1, 1.4, 1.5, 1.6, 5.3 |


**Description**

**Mục tiêu**

Xây dựng xử lý đăng ký bằng tên tài khoản, mật khẩu và mã xác minh email để người ngoài nhóm cũng đăng ký được tài khoản dùng thật.

**Bối cảnh công việc**

Chỉ tài khoản đã xác minh email và hoàn tất hồ sơ mới được dùng. Lỗi không được xoá tài khoản hoàn tất.

**Yêu cầu cần đáp ứng**

- Tên tài khoản 3–20 ký tự: chữ Latin không dấu, số, gạch dưới; duy nhất không phân biệt hoa thường, từ chối từ cấm ngay bước nhập.
- Mật khẩu tối thiểu 8 ký tự, ô xác nhận phải khớp. Email đã đăng ký báo “Email này đã được đăng ký” và không gửi mã.
- Gắn dịch vụ thư ngoài vào Supabase Auth, hệ thống xác thực. Mã 6 số hiệu lực 3 phút, gửi lại sau 60 giây; giới hạn thử sai gần đúng 5 lần theo dịch vụ, không bảo đảm đếm chính xác từng mã.
- Mã đúng: kiểm lại trùng tên/email, hoàn tất hồ sơ, tên hiển thị bằng tên tài khoản, tự đăng nhập. Tên vừa bị chiếm: quay bước đầu.
- Bản xác thực chưa hoàn tất được dọn khoảng 60–65 phút, không giữ chỗ tên. Đã ghi hồ sơ hoàn tất thì phục hồi, không xoá; chặn sử dụng đến khi phục hồi xong.
- Cấm đổi email qua gọi trực tiếp dịch vụ xác thực. Thử Google không gộp email trùng và thử danh tính Khách, ghi giới hạn.

**Việc cần làm**

- Tạo xử lý ba bước đăng ký và bộ lọc tên dùng chung.
- Cấu hình thư thật với tên người gửi “Cờ Tướng Online”, nội dung tiếng Việt.
- Tạo bảng hồ sơ và xử lý hoàn tất, phục hồi, dọn theo thứ tự an toàn cho cùng danh tính.
- Thử thư tới ba địa chỉ Gmail không thuộc nhóm phát triển và thử gửi năm thư tới năm email khác nhau trong một giờ; lưu thời gian nhận, việc vào thư rác và hạn mức dịch vụ.
- Thử lỗi dịch vụ thư và gọi trực tiếp chức năng đổi email để kiểm quyền ở máy chủ.
- Ghi kết quả thử Google/Khách và giới hạn; chưa coi là nghiệm thu toàn bộ luồng.
- So sánh hạn mức tại thời điểm cấu hình rồi chọn dịch vụ thư miễn phí gửi được tới Gmail bất kỳ, không bắt buộc tên miền riêng; ghi lựa chọn, hạn mức và cấu hình gửi của Supabase phù hợp.
- Thử tranh chấp tên ở bước cuối và lỗi giữa ghi hồ sơ hoàn tất với xoá cờ chờ; kiểm lại quyền sử dụng và dữ liệu sau khi tác vụ phục hồi/dọn chạy.

**Kết quả bàn giao**

- Chức năng đăng ký phía máy chủ, bảng hồ sơ và tác vụ phục hồi/dọn.
- Bộ lọc tên dùng lại được.
- Báo cáo gửi thư thật, chặn đổi email và thử cấu hình xác thực.

**Điều kiện hoàn thành**

- Tài khoản chưa xác minh không vào ứng dụng; tên khác hoa thường không tạo được hai tài khoản.
- Năm thư gửi được; ghi thời gian nhận thư, mục tiêu không quá một phút.
- Lỗi gửi thư báo “Không gửi được mã, vui lòng thử lại sau”; thử lại không làm tài khoản bị kẹt.
- Chạy đồng thời hoàn tất và dọn không xoá hồ sơ đã hoàn tất.
- Email không đổi được kể cả khi người dùng gửi yêu cầu trực tiếp đến dịch vụ xác thực. Nếu chỉ chặn được ở màn hình mà đường gọi trực tiếp vẫn đổi email, ghi Chưa đạt và nêu giới hạn, không coi là hoàn tất.
- Tên bị chiếm trong lúc chờ mã trả người dùng về bước đầu; dọn bản chưa hoàn tất giải phóng email nhưng không giữ chỗ tên và không xoá hồ sơ đã ghi hoàn tất.

**Phạm vi và phối hợp**

Bàn giao cho màn đăng ký; Google và Khách đầy đủ triển khai riêng.

---

<a id="t08"></a>

#### T08 · FE màn Đăng ký 3 bước

| Trường | Giá trị |
|---|---|
| Issue Id | 44 |
| Issue Type | Task |
| Parent | EP-01 |
| Assignee | Kỳ |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-44 |
| Start date | 21/10/2026 |
| Due date | 21/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-01.1 |
| Is blocked by | T03, T04 |
| Component chính | FE |
| Components | FE, Tài khoản |
| Labels | chinh-fe, p1, phat-trien, sprint-2, tai-khoan |
| Nguồn đặc tả (BA / AC) | 0.17, 1.1, 1.5, 5.3 |


**Description**

**Mục tiêu**

Xây dựng màn đăng ký ba bước để người mới tạo tài khoản bằng email thật mà hiểu rõ mình đang ở bước nào và cần sửa lỗi gì.

**Bối cảnh công việc**

Người dùng nhập tên tài khoản và mật khẩu, sau đó email, cuối cùng mã xác minh 6 số nhận qua thư. Giao diện phải phản ánh kết quả máy chủ, không tự báo đăng ký thành công khi email chưa xác minh.

**Yêu cầu cần đáp ứng**

- Bước đầu có tên tài khoản, mật khẩu và xác nhận mật khẩu. Tên dài 3–20 ký tự, chỉ chữ không dấu/số/gạch dưới, không trùng khác hoa thường và không chứa từ cấm; mật khẩu ít nhất 8 ký tự.
- Bước email báo trùng bằng “Email này đã được đăng ký” và không chuyển giả sang nhập mã.
- Bước xác minh có sáu ô nhập mã, đồng hồ 3 phút và nút gửi lại bị khoá 60 giây sau lần gửi.
- Mã sai, hết hạn hoặc bị giới hạn thử phải có lời giải thích và hướng dẫn gửi mã mới.
- Gửi thư lỗi hiện “Không gửi được mã, vui lòng thử lại sau”; trạng thái đang xử lý không cho bấm gửi trùng.
- Hoàn tất thật thì tự đăng nhập, tên hiển thị bằng tên tài khoản; vào Sảnh hoặc tiếp tục đích phòng mời còn chờ khi phần tham gia phòng được nối vào.

**Việc cần làm**

- Dựng ba bước bằng bộ ô nhập, nút và thông báo chung, giữ dữ liệu cần thiết giữa các bước.
- Nối các bước với xử lý đăng ký thật, hiển thị lỗi ngay tại ô có vấn đề.
- Tạo nhập/dán mã sáu số và các bộ đếm dựa trên hạn máy chủ trả về.
- Xử lý tên bị người khác lấy trong lúc chờ mã bằng cách quay về bước tên tài khoản.
- Kiểm đường thành công, sai tên/mật khẩu, email trùng, mã sai/hết hạn và thư lỗi.
- Kiểm trình bày trên điện thoại và cách dùng bàn phím.

**Kết quả bàn giao**

- Màn đăng ký hoàn chỉnh nối máy chủ.
- Thông báo và trạng thái chờ/lỗi/thành công.
- Bằng chứng luồng đăng ký thật.

**Điều kiện hoàn thành**

- Tên chứa từ cấm hoặc mật khẩu không khớp không qua được bước đầu.
- Không thể gửi lại trước 60 giây bằng cách bấm nhanh trên giao diện.
- Mã hợp lệ hoàn tất tài khoản và vào Sảnh; mã sai không được coi là đăng nhập.
- Mất dịch vụ thư không hiện thông báo thành công giả, người dùng có đường thử lại.
- Dán đủ sáu chữ số vào ô mã dùng được; hết hạn mã hoặc đang trong 60 giây chờ gửi lại hiển thị đúng mốc máy chủ, không đặt lại chỉ vì chuyển bước.
- Tên vừa bị chiếm sau khi nhập mã đúng được báo và quay về bước đầu; giao diện không điều hướng vào ứng dụng trước khi máy chủ xác nhận hoàn tất hồ sơ.

**Phạm vi và phối hợp**

Bàn giao màn đăng ký. Luồng mở đường dẫn mời rồi đăng ký cần được kiểm lại cùng chức năng chuyển hướng vào phòng khi chức năng đó hoàn tất.

---

<a id="t13"></a>

#### T13 · Kiểm thử US-01.1

| Trường | Giá trị |
|---|---|
| Issue Id | 49 |
| Issue Type | Task |
| Parent | EP-01 |
| Assignee | Thư |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-49 |
| Start date | 22/10/2026 |
| Due date | 22/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-01.1 |
| Is blocked by | T08 |
| Component chính | QA & DevOps |
| Components | QA & DevOps, Tài khoản |
| Labels | chinh-qa-devops, kiem-thu, p1, sprint-2, tai-khoan |
| Nguồn đặc tả (BA / AC) | 0.4, 0.17, 1.1, 1.5, 1.6, 5.3 |


**Description**

**Mục tiêu**

Kiểm chứng người dùng đăng ký bằng email thật được, đồng thời các lỗi nhập liệu, gửi thư và phục hồi tài khoản không tạo dữ liệu sai.

**Bối cảnh công việc**

Kiểm đăng ký qua giao diện và máy chủ thật; dùng kiểm dữ liệu và gọi máy chủ trực tiếp cho nhánh không tạo được bằng thao tác thường.

**Yêu cầu cần đáp ứng**

- Thử tên dưới 3 hoặc trên 20 ký tự, ký tự không hợp lệ, từ cấm và tên trùng khác hoa thường; không qua bước đầu. Tên trùng phải báo “Username đã có người dùng”, tức tên đăng nhập đã được sử dụng; lỗi xuất hiện ngay tại ô nhập.
- Thử mật khẩu dưới 8 ký tự, xác nhận không khớp và email đã có tài khoản; email trùng không được gửi mã.
- Thử thư đến Gmail ngoài nhóm, nội dung tiếng Việt, tên gửi “Cờ Tướng Online”; ghi thời gian nhận, mục tiêu không quá một phút. Gửi năm thư tới năm email trong một giờ.
- Kiểm mã đúng, sai, hết 3 phút, giới hạn thử sai và gửi lại trước/sau 60 giây. Cơ chế giới hạn thử sai là gần đúng theo dịch vụ xác thực, không ép đếm đúng từng mã.
- Kiểm bỏ dở được dọn khoảng 60–65 phút; lỗi sau khi hồ sơ hoàn tất phải phục hồi thay vì xoá tài khoản. Khi bản ghi xác thực đang chờ phục hồi, người dùng chưa được vào ứng dụng. Chạy đồng thời hoàn tất, phục hồi và dọn cho cùng tài khoản để xác nhận không xoá nhầm.
- Kiểm tên bị chiếm trong thời gian chờ mã, dịch vụ thư lỗi/hết hạn mức và gọi trực tiếp đổi email. Tên bị chiếm phải báo lỗi và quay về bước nhập tên; lỗi thư báo “Không gửi được mã, vui lòng thử lại sau”. Đổi email bằng yêu cầu trực tiếp phải bị từ chối, không chỉ bị khoá ở giao diện.

**Việc cần làm**

- Chuẩn bị tài khoản có sẵn, email chưa dùng, tên có từ cấm và dữ liệu gây lỗi có thể lặp lại.
- Viết từng ca với thời điểm, đầu vào và kết quả mong đợi, kể cả các mốc biên thời gian.
- Chạy các nhánh từ giao diện; đối chiếu hộp thư và dữ liệu máy chủ.
- Dùng môi trường thử để tạo lỗi giữa ghi hồ sơ và dọn/phục hồi, kiểm không xoá nhầm.
- Ghi đạt/không đạt/bị chặn cùng ảnh, thư nhận và dữ liệu đã che bí mật.
- Gửi lỗi cho người triển khai, kiểm lại đúng nhánh lỗi sau sửa.
- Chạy riêng lỗi sau khi ghi dấu hoàn tất, tác vụ dọn chạy gần lúc xác nhận mã và tên bị người khác lấy khi đang chờ; chụp trạng thái hồ sơ đã che dữ liệu nhạy cảm trước/sau.

**Kết quả bàn giao**

- Bộ ca đăng ký có các biến thể lỗi và biên.
- Báo cáo từng ca cùng bằng chứng.
- Danh sách lỗi và kết quả kiểm lại.

**Điều kiện hoàn thành**

- Luồng đúng tạo hồ sơ hoàn tất, tên hiển thị bằng tên tài khoản, tự đăng nhập vào Sảnh.
- Không có tài khoản trùng tên/email hoặc tài khoản chưa xác minh sử dụng được.
- Lỗi gửi thư được báo thật, gửi lại có thể phục hồi; tài khoản hoàn tất không bị xoá.
- Không đánh dấu đạt nếu không nhận được thư thật hoặc không kiểm được nhánh bắt buộc.
- Yêu cầu đổi email trực tiếp không thành công; nếu đường dịch vụ vẫn cho đổi thì báo không đạt dù màn hình đã khoá trường email.

**Phạm vi và phối hợp**

Tự vào phòng mời sau đăng ký được kiểm khi chức năng tham gia phòng hoàn tất; kết quả cục bộ không thay bằng chứng tích hợp.

---

<a id="us-01.2"></a>

### US-01.2 · Đăng nhập bằng Username + Mật khẩu và khoá thử sai

| Trường | Giá trị |
|---|---|
| Issue Id | 16 |
| Issue Type | Story |
| Parent | EP-01 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-16 |
| Start date | 12/10/2026 |
| Due date | 15/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T09, T15, T17 |
| Sprint thi công | S1, S2 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | BE, FE, QA & DevOps, Tài khoản |
| Labels | EP-01, dac-ta, p1, tai-khoan |
| Nguồn đặc tả (BA / AC) | 0.2, 0.15, 1.8 |


**Description**

**Mục tiêu**

Bàn giao đặc tả đăng nhập bằng tên và mật khẩu, bao gồm chống đoán mật khẩu và thời hạn đăng nhập rõ ràng theo quy tắc đã duyệt.

**Bối cảnh công việc**

Người dùng nhập tên đăng nhập; việc tra email cần cho dịch vụ xác thực diễn ra ở máy chủ, không tiết lộ email hoặc tài khoản có tồn tại hay không cho người thử sai. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Bối cảnh: Tài khoản twot tồn tại. Thao tác hoặc sự kiện: Đăng nhập bằng TWOT + mật khẩu đúng. Kết quả cần có: Thành công, vào Sảnh (hoặc phòng mời đang chờ).
- Bối cảnh: Bất kỳ. Thao tác hoặc sự kiện: Sai mật khẩu hoặc tên đăng nhập không tồn tại. Kết quả cần có: Cùng một câu "Sai tên đăng nhập hoặc mật khẩu", thời gian phản hồi không lộ khác biệt rõ rệt.
- Bối cảnh: Cùng tên đăng nhập đã sai 4 lần trong 15 phút. Thao tác hoặc sự kiện: Sai lần thứ 5. Kết quả cần có: tên đăng nhập bị chặn đăng nhập mật khẩu 15 phút tính từ lần sai thứ 5.
- Bối cảnh: tên đăng nhập đang bị chặn. Thao tác hoặc sự kiện: Thử đăng nhập, kể cả đúng mật khẩu. Kết quả cần có: Báo "Bạn đã thử quá nhiều lần, vui lòng thử lại sau 15 phút", không đăng nhập.
- Bối cảnh: tên đăng nhập không tồn tại sai 5 lần. Thao tác hoặc sự kiện: Thử lần 6. Kết quả cần có: Hành vi giống hệt tên đăng nhập có thật (cũng bị chặn, cùng câu báo).
- Bối cảnh: Đã sai 3 lần. Thao tác hoặc sự kiện: Đăng nhập đúng. Kết quả cần có: Thành công, bộ đếm về 0.
- Bối cảnh: Ô "Ghi nhớ đăng nhập" mặc định được chọn. Thao tác hoặc sự kiện: Đăng nhập. Kết quả cần có: Phiên hết hạn cố định sau 30 ngày; bỏ chọn thì hết khi đóng trình duyệt hoặc sau 12 giờ, tuỳ cái nào trước.
- Bối cảnh: Đã đăng nhập. Thao tác hoặc sự kiện: Mở trang Đăng nhập hoặc trang Đăng ký. Kết quả cần có: Tự chuyển về Sảnh.
- Bối cảnh: tên đăng nhập đang bị chặn do sai mật khẩu 5 lần. Thao tác hoặc sự kiện: Chủ tài khoản đăng nhập thành công bằng Google. Kết quả cần có: Vẫn vào được bằng Google; bộ đếm sai mật khẩu không bị xoá, đăng nhập bằng mật khẩu vẫn bị chặn tới hết 15 phút.

**Việc cần làm**

- Đối chiếu lỗi đăng nhập chung, cửa sổ đếm và thời hạn chặn với luồng Google; giữ bộ đếm khi Google đăng nhập thành công và chỉ đặt lại khi mật khẩu đúng.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát đăng nhập bằng tên, khóa thử sai, thời hạn phiên và bộ đếm độc lập với Google bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ đăng nhập bằng tên, khóa thử sai, thời hạn phiên và bộ đếm độc lập với Google; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.

**Phạm vi và phối hợp**

Không bổ sung chức năng khôi phục mật khẩu; không áp dụng bộ đếm sai mật khẩu cho phương thức Google.

---

<a id="t09"></a>

#### T09 · BE đăng nhập username, khoá thử sai, ghi nhớ đăng nhập

| Trường | Giá trị |
|---|---|
| Issue Id | 45 |
| Issue Type | Task |
| Parent | EP-01 |
| Assignee | Tùng |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-45 |
| Start date | 14/10/2026 |
| Due date | 15/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 16 giờ |
| Remaining Estimate | 16 giờ |
| Story Points | 3 |
| Story (relates to) | US-01.2 |
| Is blocked by | T04 |
| Component chính | BE |
| Components | BE, Tài khoản |
| Labels | chinh-be, p1, phat-trien, sprint-1, tai-khoan |
| Nguồn đặc tả (BA / AC) | 0.2, 0.15, 1.8 |


**Description**

**Mục tiêu**

Cho người có tài khoản đăng nhập bằng tên tài khoản và mật khẩu, đồng thời kiểm soát thử sai và thời hạn phiên.

**Bối cảnh công việc**

Người dùng đăng nhập bằng tên. Máy chủ tra email nội bộ, không tiết lộ email hoặc phân biệt rõ tên không tồn tại qua thông báo.

**Yêu cầu cần đáp ứng**

- Chấp nhận tên tài khoản không phân biệt hoa thường; không nhận email làm tên đăng nhập và không trả email tra cứu về trình duyệt.
- Sai tên hoặc mật khẩu đều báo “Sai tên đăng nhập hoặc mật khẩu”, tránh khác biệt phản hồi rõ rệt làm lộ tên tồn tại.
- Đếm thử sai theo tên chuẩn hoá chữ thường, kể cả tên không có thật. Sai 5 lần trong 15 phút thì chặn đăng nhập bằng mật khẩu 15 phút tính từ lần sai thứ năm.
- Trong thời gian chặn, cả mật khẩu đúng cũng bị từ chối và báo “Bạn đã thử quá nhiều lần, vui lòng thử lại sau 15 phút”.
- Đăng nhập mật khẩu đúng đặt lại bộ đếm. Google không tính vào, không bị chặn bởi bộ đếm và đăng nhập Google không xoá bộ đếm.
- Ghi nhớ đăng nhập giữ phiên 30 ngày; không ghi nhớ thì hết khi đóng trình duyệt hoặc đủ 12 giờ, tuỳ mốc tới trước. Hạn cố định từ đăng nhập, không gia hạn vì hoạt động hay làm mới khoá phiên.

**Việc cần làm**

- Tạo cách tra tài khoản phía máy chủ và gọi xác thực bằng mật khẩu.
- Tạo nơi lưu lần thử sai, kiểm cửa sổ thời gian và thời điểm hết chặn.
- Kết hợp kiểm chặn với xử lý thành công/thất bại, bảo đảm các lần gửi đồng thời không bỏ qua giới hạn.
- Gắn lựa chọn ghi nhớ với hạn phiên cố định.
- Thử tên khác hoa thường, tên giả, sai liên tiếp, đúng khi còn bị chặn và đúng sau hết chặn.
- Ghi kết quả kiểm, không đưa mật khẩu hoặc khoá phiên vào nhật ký.

**Kết quả bàn giao**

- Xử lý đăng nhập và dữ liệu bộ đếm thử sai.
- Cách quản lý hạn phiên.
- Kiểm thử chứng minh tra tên và khoá thử sai đúng.
- Hợp đồng đăng nhập nêu dữ liệu tên/mật khẩu/lựa chọn ghi nhớ, phản hồi thành công cùng hạn phiên và phản hồi sai hoặc bị chặn; không trả email tra cứu nội bộ.

**Điều kiện hoàn thành**

- Twot và twot dùng cùng tài khoản và cùng bộ đếm.
- Lần sai thứ năm kích hoạt chặn; lần thứ sáu với tên giả có hành vi giống tên thật.
- Đăng nhập đúng sau ba lần sai xoá số lần sai.
- Hoạt động trong ứng dụng không làm hạn 12 giờ/30 ngày trôi về sau.
- Các yêu cầu đồng thời với cùng tên khác hoa/thường dùng chung bộ đếm; hạn chặn tính từ lần sai thứ năm, không bị kéo dài bởi thử thêm trong lúc đang bị chặn.

**Phạm vi và phối hợp**

Bàn giao đăng nhập mật khẩu cho giao diện; kiểm chung với Google và xử lý phiên khi đang chơi được thực hiện khi các luồng đó hoàn tất.

---

<a id="t15"></a>

#### T15 · FE màn Đăng nhập

| Trường | Giá trị |
|---|---|
| Issue Id | 51 |
| Issue Type | Task |
| Parent | EP-01 |
| Assignee | Kỳ |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-51 |
| Start date | 20/10/2026 |
| Due date | 20/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-01.2 |
| Is blocked by | T03, T09 |
| Component chính | FE |
| Components | FE, Tài khoản |
| Labels | chinh-fe, p1, phat-trien, sprint-2, tai-khoan |
| Nguồn đặc tả (BA / AC) | 0.2, 0.3, 0.15, 1.8 |


**Description**

**Mục tiêu**

Xây dựng màn đăng nhập để người có tài khoản vào ứng dụng bằng tên tài khoản và mật khẩu, hiểu rõ lỗi hoặc thời gian bị chặn.

**Bối cảnh công việc**

Màn này cũng là cửa vào cho người mở đường dẫn mời nhưng chưa đăng nhập. Nó phải nối xử lý đăng nhập thật, giữ lựa chọn ghi nhớ và có vị trí rõ ràng cho Google và chế độ Khách.

**Yêu cầu cần đáp ứng**

- Có ô tên tài khoản, ô mật khẩu với nút hiện/ẩn và lựa chọn “Ghi nhớ đăng nhập” mặc định được chọn.
- Đăng nhập bằng tên, không dùng email thay tên. Sai tên hoặc mật khẩu hiển thị cùng câu “Sai tên đăng nhập hoặc mật khẩu”.
- Khi máy chủ chặn thử sai, hiện “Bạn đã thử quá nhiều lần, vui lòng thử lại sau 15 phút”; không tự cho vào dù mật khẩu đúng.
- Ghi nhớ tạo phiên 30 ngày; bỏ chọn tạo phiên hết khi đóng trình duyệt hoặc đủ 12 giờ, tuỳ mốc tới trước.
- Có lối vào Google và Khách để nối chức năng tương ứng; liên kết “Quên mật khẩu?” bị vô hiệu kèm “Sắp ra mắt”.
- Người đã đăng nhập mở trang đăng nhập hoặc đăng ký được chuyển về Sảnh. Người vừa đăng nhập thành công giữ đích phòng mời chờ xử lý khi phần vào phòng được nối vào.

**Việc cần làm**

- Tạo bố cục và các ô nhập từ thành phần giao diện chung.
- Nối nút đăng nhập với máy chủ, gửi lựa chọn ghi nhớ và xử lý phản hồi.
- Hiển thị trạng thái đang gửi, lỗi sai thông tin, lỗi bị chặn và lỗi kết nối; chặn bấm gửi trùng trong lúc xử lý.
- Thêm điều hướng người đã đăng nhập và chỗ tích hợp Google/Khách.
- Kiểm mật khẩu hiện/ẩn, thao tác bàn phím, màn hình 360 pixel và thông báo lỗi.
- Thử tên khác hoa thường, bỏ chọn ghi nhớ và truy cập lại trang khi đã có phiên.

**Kết quả bàn giao**

- Màn đăng nhập hoạt động bằng tài khoản thật.
- Thông báo và điều hướng sau đăng nhập.
- Bằng chứng các nhánh chính và trạng thái giao diện.

**Điều kiện hoàn thành**

- Đăng nhập đúng vào Sảnh; sai tên và sai mật khẩu không tạo hai thông báo khác nhau.
- Bị chặn thì giao diện không tự coi đăng nhập thành công.
- Ô ghi nhớ mặc định được chọn và gửi đúng lựa chọn khi bỏ chọn.
- Quên mật khẩu không mở chức năng chưa làm; người đã đăng nhập không mắc ở màn đăng nhập.
- Mất kết nối trong lúc gửi có báo lỗi và cho thử lại; không tự tạo trạng thái đăng nhập thành công khi chưa nhận xác nhận.
- Đích phòng mời được giữ qua thao tác nhập sai rồi đăng nhập lại đúng; điều hướng sau đó vẫn nhận kết quả kiểm phòng từ máy chủ.

**Phạm vi và phối hợp**

Bàn giao giao diện đăng nhập mật khẩu và vị trí nối Google/Khách. Hoạt động đầy đủ của hai lối vào đó được hoàn thiện ở phần xác thực tương ứng.

---

<a id="t17"></a>

#### T17 · Kiểm thử US-01.2

| Trường | Giá trị |
|---|---|
| Issue Id | 53 |
| Issue Type | Task |
| Parent | EP-01 |
| Assignee | Nhạn |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-53 |
| Start date | 21/10/2026 |
| Due date | 21/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-01.2 |
| Is blocked by | T15 |
| Component chính | QA & DevOps |
| Components | QA & DevOps, Tài khoản |
| Labels | chinh-qa-devops, kiem-thu, p1, sprint-2, tai-khoan |
| Nguồn đặc tả (BA / AC) | 0.2, 0.15, 1.8 |


**Description**

**Mục tiêu**

Kiểm chứng đăng nhập bằng mật khẩu, giới hạn thử sai và hạn phiên để người dùng vào đúng tài khoản mà không vượt được các ràng buộc đăng nhập.

**Bối cảnh công việc**

Chạy qua giao diện thật và xử lý máy chủ, đồng thời kiểm các mốc thời gian bằng môi trường thử có kiểm soát. Các trường hợp tên không tồn tại phải có hành vi giống sai mật khẩu của tên có thật.

**Yêu cầu cần đáp ứng**

- Tài khoản viết thường đăng nhập được bằng tên viết hoa cùng mật khẩu đúng; kiểm vào Sảnh ở luồng không có lời mời.
- Sai mật khẩu và tên không tồn tại đều có cùng thông báo, không lộ khác biệt phản hồi rõ rệt. Câu cần đối chiếu là “Sai tên đăng nhập hoặc mật khẩu”.
- Sai lần thứ năm trong 15 phút kích hoạt chặn 15 phút tính từ lần thứ năm; thử đúng mật khẩu trong thời gian chặn vẫn bị từ chối. Thông báo phải là “Bạn đã thử quá nhiều lần, vui lòng thử lại sau 15 phút”.
- Tên không tồn tại cũng bị đếm và chặn; đổi hoa/thường không làm tách bộ đếm.
- Đăng nhập đúng sau ba lần sai đặt bộ đếm về không; hết thời gian chặn thì có thể đăng nhập đúng.
- Ghi nhớ mặc định chọn: hạn cố định 30 ngày. Bỏ chọn: hết khi đóng trình duyệt hoặc 12 giờ; hoạt động không kéo dài hạn.
- Người đã có phiên mở trang đăng nhập hoặc đăng ký được về Sảnh.
- Gửi gần đồng thời các lần thử sai với tên khác hoa/thường; đếm chung và không vượt khoá. Thử thêm trong lúc khoá không làm đổi mốc hết chặn vốn tính từ lần sai thứ năm.

**Việc cần làm**

- Chuẩn bị tài khoản thật, tên giả và bộ dữ liệu tên khác hoa thường.
- Viết ca theo thứ tự có ghi rõ thời điểm sai lần đầu, lần thứ năm và hết chặn.
- Chạy sai/đúng và gọi máy chủ trực tiếp để xác minh không chỉ giao diện chặn.
- Kiểm mốc ngay trước/sau hết chặn, mốc phiên 12 giờ/30 ngày và đóng toàn trình duyệt.
- Kiểm tự chuyển Sảnh khi đã đăng nhập; kiểm việc làm mới khoá phiên không gia hạn.
- Ghi bằng chứng đã che mật khẩu/khoá phiên, báo lỗi và chạy lại sau sửa.

**Kết quả bàn giao**

- Bộ ca đăng nhập, khoá thử sai và hạn phiên.
- Báo cáo có thời điểm thử và kết quả thực tế.
- Lỗi có cách tái hiện và kết quả kiểm lại.
- Bảng mốc thời gian thử, phản hồi, bộ đếm và hạn phiên đã che thông tin nhạy cảm để kiểm lại ranh giới ngay trước/bằng/sau hạn.

**Điều kiện hoàn thành**

- Tên giả và tên thật cùng bị chặn sau đúng điều kiện; không đăng nhập được bằng mật khẩu đúng trước hết chặn.
- Lần đăng nhập đúng hợp lệ xoá bộ đếm.
- Hạn phiên không trôi theo hoạt động.
- Mọi ca chưa thể chạy phải ghi bị chặn với nguyên nhân, không ghi đạt.

**Phạm vi và phối hợp**

Việc Google vẫn vào được mà không xoá bộ đếm và việc đăng nhập xong tự vào phòng mời được kiểm bổ sung khi các luồng liên quan đã tích hợp.

---

<a id="us-01.3"></a>

### US-01.3 · Đăng ký/đăng nhập bằng Google và chế độ Khách

| Trường | Giá trị |
|---|---|
| Issue Id | 17 |
| Issue Type | Story |
| Parent | EP-01 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-17 |
| Start date | 14/10/2026 |
| Due date | 17/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T35, T44, T48 |
| Sprint thi công | S1, S2, S3 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | BE, FE, QA & DevOps, Tài khoản |
| Labels | EP-01, dac-ta, p1, tai-khoan |
| Nguồn đặc tả (BA / AC) | 0.2, 0.3, 0.15, 0.17, 1.2, 1.3, 1.4 |


**Description**

**Mục tiêu**

Bàn giao đặc tả hai cách vào ứng dụng nhanh: tài khoản Google và danh tính Khách dùng tạm theo quy tắc đã duyệt.

**Bối cảnh công việc**

Tài khoản Google mới vẫn phải chọn tên đăng nhập và mật khẩu. Khách chỉ nhập tên tạm, được chơi hoặc xem nhưng không có chức năng bạn bè và hồ sơ như tài khoản chính thức. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Bối cảnh: Email Google chưa có tài khoản. Thao tác hoặc sự kiện: Bấm "Đăng ký bằng Google" hoặc "Đăng nhập bằng Google". Kết quả cần có: Chuyển tới trang hoàn tất thiết lập tài khoản: email chỉ đọc, ô tên đăng nhập và Mật khẩu; không yêu cầu mã xác minh.
- Tại bước thiết lập tài khoản Google, yêu cầu tên đăng nhập duy nhất, dài 3–20 ký tự gồm chữ cái Latin không dấu, chữ số hoặc dấu gạch dưới; mật khẩu ít nhất 8 ký tự. Tên chứa từ cấm bị từ chối ngay bước nhập, máy chủ kiểm lại trước khi hoàn tất. Dữ liệu hợp lệ tạo tài khoản với tên hiển thị bằng tên đăng nhập, không lấy họ tên Google, rồi vào Sảnh.
- Bối cảnh: Email Google đã thuộc tài khoản tên đăng nhập + Mật khẩu. Thao tác hoặc sự kiện: Bấm đăng ký/đăng nhập Google. Kết quả cần có: Báo "Email này đã được đăng ký", không tự liên kết hai tài khoản.
- Bối cảnh: Tài khoản tạo bằng Google đã hoàn tất. Thao tác hoặc sự kiện: Bấm "Đăng nhập bằng Google". Kết quả cần có: Vào Sảnh ngay.
- Bối cảnh: Tài khoản tạo bằng Google đã hoàn tất. Thao tác hoặc sự kiện: Đăng nhập bằng tên đăng nhập + mật khẩu đã đặt. Kết quả cần có: Đăng nhập thành công.
- Bối cảnh: Ở trang hoàn tất thiết lập tài khoản. Thao tác hoặc sự kiện: Thử đóng/thoát hoặc vào địa chỉ trang khác của ứng dụng. Kết quả cần có: Không có nút X; chưa hoàn tất thì không dùng được ứng dụng.
- Bối cảnh: Bản Google tạm chưa hoàn tất quá 60 phút. Thao tác hoặc sự kiện: Tác vụ dọn chạy (mỗi 5 phút). Kết quả cần có: Bản tạm bị xoá; tài khoản đã hoàn tất hoặc vừa hoàn tất không bị xoá.
- Ngay dưới nút Guest, tức chơi với danh tính Khách, phải có ghi chú: “Lưu ý: Chế độ Khách (Guest) không được tham gia đánh Xếp hạng để tính điểm Elo và không lưu lịch sử ván cờ.” Elo là điểm xếp hạng thi đấu.
- Bối cảnh: Bấm "Guest". Thao tác hoặc sự kiện: Nhập tên 2–20 ký tự (có dấu), không chứa từ cấm, bấm "Vào chơi". Kết quả cần có: Vào Sảnh; tên hiển thị kèm "(Khách)" ở mọi nơi.
- Bối cảnh: hộp nhập tên Khách. Thao tác hoặc sự kiện: Tên < 2, > 20 ký tự hoặc chứa từ cấm. Kết quả cần có: Từ chối với thông báo lỗi tại ô.
- Bối cảnh: Khách đang có 1 phòng mở do mình tạo. Thao tác hoặc sự kiện: Tạo phòng thứ hai. Kết quả cần có: Bị chặn kèm chú thích "Khách chỉ được mở 1 phòng cùng lúc".
- Bối cảnh: Phiên Khách đủ 12 giờ khi đang ngồi ghế hoặc trong ván. Thao tác hoặc sự kiện: Hết 12 giờ. Kết quả cần có: Phiên chưa hết cho đến khi Khách rời ghế/ván.
- Bối cảnh: Phiên Khách hết hạn hoặc Khách bấm Đăng xuất. Thao tác hoặc sự kiện: Hệ thống xử lý. Kết quả cần có: Về màn hình Đăng nhập; tên và dữ liệu cá nhân của Khách bị xoá; vào lại là danh tính Khách mới.
- Bối cảnh: tên đăng nhập đang bị chặn. Thao tác hoặc sự kiện: Đăng nhập bằng Google của chính tài khoản đó. Kết quả cần có: Vẫn đăng nhập được (bộ đếm không áp cho Google).
- Bối cảnh: Chưa đăng nhập, mở đường dẫn mời phòng. Thao tác hoặc sự kiện: Chọn "Guest", nhập tên hợp lệ. Kết quả cần có: Tự vào đúng phòng (ghế trống hoặc người xem theo sức chứa), không phải mở đường dẫn lần hai.
- Khách chỉ dùng các chức năng của bản bàn giao đầu tiên: tạo/vào phòng, chơi hoặc xem, chơi với máy, chat theo vai trò và camera/mic khi ngồi ghế; không kết bạn hoặc nhận/gửi lời mời bạn bè. Khi danh tính Khách hết hạn, giữ bản ghi ván của đối thủ chính thức với tên chung “Khách”, nhưng chưa cung cấp giao diện Lịch sử ở bản đầu.

**Việc cần làm**

- Đối soát các nhánh Google, dọn bản tạm và tên mặc định; kiểm tính nhất quán của phiên Khách, nhãn tên, giới hạn phòng và đường dẫn mời đang chờ.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát Google mới/cũ/trùng email, thiết lập bắt buộc và quyền của Khách bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ Google mới/cũ/trùng email, thiết lập bắt buộc và quyền của Khách; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.

**Phạm vi và phối hợp**

Không tự gộp tài khoản trùng email và không triển khai xếp hạng hay lịch sử cho Khách.

---

<a id="t35"></a>

#### T35 · BE đăng ký/đăng nhập Google, onboarding, phiên Khách

| Trường | Giá trị |
|---|---|
| Issue Id | 71 |
| Issue Type | Task |
| Parent | EP-01 |
| Assignee | Cường |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-71 |
| Start date | 16/10/2026 |
| Due date | 18/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.2 |
| Original Estimate | 24 giờ |
| Remaining Estimate | 24 giờ |
| Story Points | 5 |
| Story (relates to) | US-01.3 |
| Is blocked by | T09, T14 |
| Component chính | BE |
| Components | BE, Tài khoản |
| Labels | chinh-be, p1, phat-trien, sprint-1, tai-khoan |
| Nguồn đặc tả (BA / AC) | 0.3, 0.15, 0.17, 1.1, 1.2, 1.3, 5.3 |


**Description**

**Mục tiêu**

Cho phép đăng ký, đăng nhập bằng Google và tạo phiên chơi Khách có quyền hạn rõ ràng.

**Bối cảnh công việc**

Supabase là dịch vụ quản lý đăng nhập của dự án. Xác thực Google chứng minh người dùng sở hữu email; ứng dụng vẫn yêu cầu hoàn tất tên đăng nhập và mật khẩu trước khi sử dụng tài khoản.

**Yêu cầu cần đáp ứng**

- Email Google chưa có tài khoản phải vào bước thiết lập tên đăng nhập và mật khẩu, không cần mã email. Tên đăng nhập dài 3–20 ký tự, gồm chữ cái Latin không dấu (a–z, A–Z), chữ số hoặc dấu gạch dưới, không phân biệt hoa thường khi kiểm trùng và không chứa từ cấm; mật khẩu ít nhất 8 ký tự.
- Hoàn tất hợp lệ thì tên hiển thị bằng tên đăng nhập, không lấy họ tên Google. Người dùng sau đó đăng nhập được bằng Google hoặc tên đăng nhập/mật khẩu đã đặt.
- Email đã thuộc tài khoản đăng ký bằng mật khẩu thì báo “Email này đã được đăng ký”, không tự gộp tài khoản. Tài khoản Google đã hoàn tất được đăng nhập thẳng vào ứng dụng.
- Bản Google tạm chưa hoàn tất quá 60 phút được dọn bằng kiểm tra mỗi 5 phút; không xoá tài khoản cũ, đã hoàn tất hoặc vừa hoàn tất. Chưa hoàn tất phải bị chặn sử dụng ứng dụng.
- Khách nhập tên 2–20 ký tự có dấu, không cần duy nhất, không chứa từ cấm; luôn có nhãn “(Khách)”. Phiên kéo dài tối đa 12 giờ nhưng không hết trong lúc đang ngồi ghế hoặc trong ván; chỉ được tạo một phòng đang mở.
- Google không bị chặn bởi khoá thử sai mật khẩu và đăng nhập Google thành công không xoá bộ đếm đó. Khách không có quyền kết bạn, nhận/gửi lời mời bạn bè hoặc sửa hồ sơ.
- Khách được tạo/vào phòng, ngồi ghế hoặc xem, đánh máy, chat theo vai trò và dùng camera/mic khi ngồi ghế. Khi hết phiên hoặc đăng xuất phải xoá tên, chat và dữ liệu cá nhân; giữ bản ghi ván cho đối thủ chính thức với tên chung Khách.

**Việc cần làm**

- Tích hợp Google thật và tạo phiên Khách; kiểm quyền tại máy chủ, dùng bộ lọc tên chung.
- Xây bước hoàn tất tài khoản, dọn bản tạm an toàn và dữ liệu hạn phiên Khách.
- Viết kiểm thử email trùng, tài khoản chưa hoàn tất, thời hạn dọn, tên cấm, đăng nhập kép và bộ đếm sai mật khẩu.
- Thử tài khoản Google vừa hoàn tất trong cùng lượt tác vụ dọn và lỗi giữa các bước hoàn tất; xác minh hồ sơ đã hoàn tất được giữ/phục hồi còn hồ sơ tạm vẫn bị chặn.

**Kết quả bàn giao**

- Dịch vụ Google/Khách và bằng chứng thử với tài khoản thật.
- Dữ liệu hạn phiên và sự kiện kết thúc phiên Khách cho quản lý phòng/chat xử lý xoá dữ liệu; bảng quyền Khách để các chức năng kiểm thống nhất.

**Điều kiện hoàn thành**

- Không gộp tài khoản trùng email; Google không xoá khoá mật khẩu; tài khoản chưa hoàn tất không dùng ứng dụng được.
- Danh tính Khách trả đúng hạn 12 giờ và thông tin ngoại lệ để quản lý phiên không làm hết phiên khi đang ngồi ghế/trong ván; kiểm tích hợp áp hết hạn sau khi rời. Phiên mới là danh tính mới và chỉ được có một phòng tự tạo đang mở.

**Phạm vi và phối hợp**

Bàn giao xác thực, dữ liệu hạn và quyền Khách; quản lý phiên, phòng và chat dùng các dữ liệu/sự kiện này để thực hiện ngoại lệ khi đang chơi và xoá dữ liệu khi kết thúc phiên. Kiểm tích hợp các nhánh đó khi chức năng liên quan sẵn sàng; giao diện được làm riêng.

---

<a id="t44"></a>

#### T44 · FE nút Google, Onboarding, hộp tên Khách, ẩn chức năng cho Khách

| Trường | Giá trị |
|---|---|
| Issue Id | 80 |
| Issue Type | Task |
| Parent | EP-01 |
| Assignee | Kỳ |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-80 |
| Start date | 24/10/2026 |
| Due date | 24/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-01.3 |
| Is blocked by | T15, T35 |
| Component chính | FE |
| Components | FE, Tài khoản |
| Labels | chinh-fe, p1, phat-trien, sprint-3, tai-khoan |
| Nguồn đặc tả (BA / AC) | 0.2, 0.3, 0.17, 1.2, 1.3 |


**Description**

**Mục tiêu**

Dựng luồng đăng nhập Google và chơi Khách để người mới hoàn tất thiết lập hoặc vào chơi nhanh.

**Bối cảnh công việc**

Người chọn Google lần đầu vẫn cần đặt tên đăng nhập và mật khẩu. Người chọn Khách chỉ đặt tên tạm, được chơi nhưng không có quyền xã hội và hồ sơ như tài khoản chính thức.

**Yêu cầu cần đáp ứng**

- Đăng nhập và Đăng ký đều có nút Google. Khi máy chủ yêu cầu thiết lập lần đầu, hiện email chỉ đọc, tên đăng nhập và mật khẩu; không có mã xác nhận email và không có nút đóng bỏ qua thiết lập.
- Tên đăng nhập dài 3–20 ký tự gồm chữ cái Latin không dấu (a–z, A–Z), chữ số, dấu gạch dưới; mật khẩu ít nhất 8 ký tự. Hiện lỗi trùng tên hoặc từ cấm tại ô; máy chủ vẫn kiểm lại trước khi hoàn tất.
- Hoàn tất dùng tên hiển thị bằng tên đăng nhập. Email Google đã thuộc tài khoản mật khẩu phải hiện “Email này đã được đăng ký”; không hiển thị như đã tự liên kết thành công.
- Nút Guest mở hộp tên tạm 2–20 ký tự, cho phép dấu tiếng Việt, không cần duy nhất và không chứa từ cấm. Có Vào chơi/Huỷ; vào thành công luôn gắn “(Khách)” cạnh tên.
- Dưới nút Guest có ghi chú “Lưu ý: Chế độ Khách (Guest) không được tham gia đánh Xếp hạng để tính điểm Elo và không lưu lịch sử ván cờ.” Elo là điểm xếp hạng thi đấu.
- Khi chọn Khách từ đường dẫn mời phòng, nhập tên xong tự vào đúng phòng theo ghế/chỗ xem còn lại. Bạn bè bị vô hiệu với giải thích đăng ký để kết bạn; ẩn thẻ Mời bạn bè và chức năng sửa hồ sơ không dành cho Khách.

**Việc cần làm**

- Tích hợp riêng ba kết quả Google: đã có tài khoản, cần hoàn tất thiết lập, email trùng tài khoản mật khẩu; lưu đích phòng đang chờ qua các màn xác thực và chỉ chuyển tiếp sau khi máy chủ xác nhận hoàn tất.
- Dựng nút Google, màn hoàn tất thiết lập và hộp tên Khách, gồm trạng thái xử lý và lỗi.
- Nối phản hồi xác thực, điều hướng tới Sảnh hoặc phòng đang chờ và quy tắc ẩn chức năng theo vai trò.
- Thử tên biên, từ cấm, email trùng, đóng giữa thiết lập và mở lời mời trước đăng nhập.

**Kết quả bàn giao**

- Giao diện Google và Khách nối dịch vụ xác thực thật.
- Bằng chứng Google thật cho tài khoản mới/cũ/trùng email và Khách đi qua link mời.

**Điều kiện hoàn thành**

- Không bỏ qua thiết lập Google; Khách có nhãn đúng và vào phòng mời không cần mở lại đường dẫn.
- Lỗi từ cấm phải được báo trước khi gửi hoàn tất và vẫn hiển thị khi máy chủ từ chối; tên hiển thị sau Google đúng tên đăng nhập đã chọn. Huỷ hộp tên Khách không tạo phiên chơi thành công trên giao diện.

**Phạm vi và phối hợp**

Phần này không quyết định thời hạn phiên hoặc quyền trên máy chủ; không làm nâng cấp Khách trực tiếp thành tài khoản chính thức.

---

<a id="t48"></a>

#### T48 · Kiểm thử US-01.3

| Trường | Giá trị |
|---|---|
| Issue Id | 84 |
| Issue Type | Task |
| Parent | EP-01 |
| Assignee | Thư |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-84 |
| Start date | 26/10/2026 |
| Due date | 26/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-01.3 |
| Is blocked by | T26, T37, T44 |
| Component chính | QA & DevOps |
| Components | QA & DevOps, Tài khoản |
| Labels | chinh-qa-devops, kiem-thu, p1, sprint-3, tai-khoan |
| Nguồn đặc tả (BA / AC) | 0.2, 0.3, 0.15, 0.17, 1.2, 1.3 |


**Description**

**Mục tiêu**

Kiểm chứng đăng ký/đăng nhập Google và chơi Khách thật, bao gồm giới hạn tên và khoá thử sai mật khẩu.

**Bối cảnh công việc**

Chuẩn bị Google chưa đăng ký, Google đã hoàn tất và email đã tạo tài khoản bằng mật khẩu. Dùng nhiều trình duyệt và tài khoản thử riêng để tránh nhầm dữ liệu giữa các trường hợp.

**Yêu cầu cần đáp ứng**

- Google lần đầu phải tới thiết lập email chỉ đọc, tên đăng nhập và mật khẩu, không yêu cầu mã email. Thử tên trùng, sai định dạng và chứa từ cấm; tên cấm bị từ chối ngay ô nhập và khi gửi trực tiếp lên máy chủ.
- Hoàn tất hợp lệ thì tên hiển thị bằng tên đăng nhập, không lấy họ tên Google. Đăng xuất rồi vào lại bằng Google phải vào ngay; dùng tên đăng nhập/mật khẩu đã đặt cũng phải thành công.
- Google có email thuộc tài khoản mật khẩu phải báo “Email này đã được đăng ký”, không tự gộp. Bỏ dở thiết lập không có cách dùng ứng dụng qua đường dẫn khác; bản tạm quá 60 phút được dọn theo nhịp 5 phút, không xoá người vừa hoàn tất.
- Sai mật khẩu 5 lần làm khoá 15 phút; trong lúc khoá, Google vẫn đăng nhập được nhưng không xoá bộ đếm, mật khẩu đúng vẫn bị chặn đến hết hạn.
- Khách phải có ghi chú không được đánh Xếp hạng và không lưu lịch sử. Thử tên 2–20 ký tự có dấu, tên trùng được phép, tên ngoài độ dài hoặc chứa từ cấm bị từ chối. Tên luôn kèm “(Khách)”.
- Khách đang có một phòng mở không được tạo phòng thứ hai. Mở lời mời lúc chưa đăng nhập rồi chọn Khách phải tự vào đúng phòng theo ghế/chỗ xem còn lại, không mở đường dẫn lần hai.

**Việc cần làm**

- Lưu trạng thái tài khoản và bộ đếm sai trước mỗi lần đăng nhập; chuẩn bị Google trùng email bằng mật khẩu và hồ sơ thiết lập dở gần 60 phút để kiểm không tự gộp và dọn bản tạm đúng đối tượng.
- Viết tình huống với dữ liệu email/tên rõ ràng và kết quả mong đợi; không dùng xác thực Google giả làm bằng chứng.
- Chạy luồng thật, kiểm bản tạm và thử yêu cầu vượt giao diện; dùng thời gian kiểm soát được cho bài hết hạn.
- Ghi bằng chứng, lỗi và kết quả kiểm lại sau sửa.

**Kết quả bàn giao**

- Báo cáo kiểm Google, tên Khách, giới hạn tạo phòng và giữ đích lời mời.

**Điều kiện hoàn thành**

- Không tự gộp tài khoản; không vượt bước thiết lập; Google không xoá khoá mật khẩu; tên cấm bị máy chủ chặn.
- Trong cùng khoảng khoá, đăng nhập Google xong rồi dùng mật khẩu đúng vẫn bị từ chối; chỉ sau hết hạn mới đăng nhập bằng mật khẩu được. Tài khoản vừa hoàn tất không bị đợt dọn hồ sơ tạm xoá nhầm.

**Phạm vi và phối hợp**

Ngoại lệ giữ phiên Khách khi đang chơi và xoá dữ liệu khi phiên kết thúc được nghiệm thu sau khi quản lý phiên, phòng và chat tích hợp đầy đủ.

---

<a id="us-01.4"></a>

### US-01.4 · Phiên đăng nhập, hồ sơ và Đăng xuất

| Trường | Giá trị |
|---|---|
| Issue Id | 18 |
| Issue Type | Story |
| Parent | EP-01 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-18 |
| Start date | 20/10/2026 |
| Due date | 23/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T56, T65, T69 |
| Sprint thi công | S2, S3, S4 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | BE, FE, QA & DevOps, Tài khoản, Ván trực tuyến |
| Labels | EP-01, dac-ta, p1, tai-khoan, van-truc-tuyen |
| Nguồn đặc tả (BA / AC) | 0.3, 0.7, 1.4, 1.8, 6.3 |


**Description**

**Mục tiêu**

Bàn giao đặc tả quản lý phiên, một vị trí chơi tại một thời điểm, hồ sơ cá nhân và đăng xuất để tránh chiếm nhiều ghế hoặc xử lý kết quả không nhất quán theo quy tắc đã duyệt.

**Bối cảnh công việc**

Một vị trí chơi là ghế đang ngồi trong phòng hoặc một ván với máy. Đăng nhập ở thiết bị khác có hậu quả khác với mở thêm thẻ trên cùng trình duyệt. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Bối cảnh: Đang đăng nhập. Thao tác hoặc sự kiện: Dùng ứng dụng liên tục, làm mới thông tin chứng minh quyền truy cập. Kết quả cần có: Hạn phiên không được gia hạn; chỉ đăng nhập lại mới tạo hạn mới.
- Bối cảnh: Phiên chính thức hết hạn khi đang trong ván qua mạng. Thao tác hoặc sự kiện: Hết hạn. Kết quả cần có: Mất quyền điều khiển, yêu cầu đăng nhập lại; ván giữ ân hạn 60 giây, đồng hồ vẫn chạy; đăng nhập lại cùng thiết bị trong hạn thì tiếp tục.
- Bối cảnh: Phiên hết hạn khi đang đánh với máy. Thao tác hoặc sự kiện: Hết hạn. Kết quả cần có: Ván với máy được giữ 30 phút; đăng nhập lại cùng thiết bị trong hạn thì tiếp tục.
- Bối cảnh: Tài khoản đang trong ván (qua mạng hoặc với máy) ở thiết bị A. Thao tác hoặc sự kiện: Đăng nhập thành công ở thiết bị B. Kết quả cần có: Ván bị xử thua ngay và kết thúc; thiết bị A bị đăng xuất; thiết bị B vào Sảnh.
- Bối cảnh: Tài khoản đang ngồi ghế ở phòng đang chờ (không có ván) ở thiết bị A. Thao tác hoặc sự kiện: Đăng nhập ở thiết bị B. Kết quả cần có: Không tạo kết quả thua; A bị đăng xuất, rời ghế theo vòng đời phòng; B vào Sảnh.
- Bối cảnh: Đang ngồi ghế ở một phòng hoặc đang trong ván với máy. Thao tác hoặc sự kiện: Bấm Tạo phòng / Vào chơi / Đánh với máy / mở mã phòng khác để ngồi ghế. Kết quả cần có: Nút không bấm được kèm chú thích "Bạn đang ở trong một ván/phòng khác"; máy chủ cũng từ chối.
- Bối cảnh: Có phòng/ván đang dở. Thao tác hoặc sự kiện: Vào Sảnh. Kết quả cần có: Hiện thông báo cố định "Bạn có ván đang chơi dở — Quay lại" dẫn về đúng phòng/ván.
- Bối cảnh: Đang trong ván qua mạng. Thao tác hoặc sự kiện: Bấm Đăng xuất. Kết quả cần có: Hiện xác nhận hậu quả đầu hàng; Đồng ý → ván kết thúc đầu hàng, rời phòng, đăng xuất; Huỷ → giữ nguyên.
- Ở phòng chờ, bấm Đăng xuất sẽ rời ghế rồi đăng xuất, không xử thua. Nếu chủ phòng rời thì chuyển quyền cho người ngồi ghế còn lại; không còn ai ngồi ghế thì đóng phòng và đưa người xem về Sảnh.
- Bối cảnh: Ở Cài đặt hồ sơ. Thao tác hoặc sự kiện: Nhập tên hiển thị 2–30 ký tự hợp lệ, bấm "Lưu thay đổi". Kết quả cần có: Lưu ngay, không cần mã xác minh; tên mới hiện ở thanh điều hướng và trong phòng ở lần cập nhật kế tiếp.
- Trong Cài đặt hồ sơ, tên hiển thị chứa từ cấm hoặc sai độ dài phải bị từ chối lưu và báo lỗi tại ô. Không thay từ cấm bằng ba dấu sao (\*\*\*) rồi lưu như cách xử lý tin chat.
- Bối cảnh: Ở Cài đặt hồ sơ. Thao tác hoặc sự kiện: Xem thông tin. Kết quả cần có: Thấy ảnh đại diện chữ cái đầu, @tên đăng nhập, email chỉ đọc; không có nút đổi tên đăng nhập (giai đoạn sau), không có bộ chọn giao diện.
- Nút Đăng xuất trong Cài đặt hồ sơ phải dùng cùng quy tắc: trong ván trực tuyến cần xác nhận đầu hàng; ở phòng chờ thì rời phòng không xử thua; trong ván với máy cần xác nhận đầu hàng và hủy tác vụ máy cờ.
- Bối cảnh: Khách. Thao tác hoặc sự kiện: Mở mục Bạn bè, thẻ mời bạn bè trong hộp Chia sẻ phòng, hoặc Cài đặt hồ sơ. Kết quả cần có: Bạn bè ở thanh điều hướng không bấm được kèm chú thích "Đăng ký tài khoản để kết bạn"; thẻ mời bạn bè ẩn (vẫn có đường dẫn/mã); Cài đặt chỉ có Đăng xuất.
- Bối cảnh: Khách. Thao tác hoặc sự kiện: Người dùng khác tìm tên đăng nhập hoặc mời Khách. Kết quả cần có: Khách không xuất hiện trong tìm kiếm bạn bè, không nhận được lời mời bạn bè.
- Người đang có ván hoặc đang ngồi ghế mở lời mời phòng khác: phải kiểm tra vị trí chơi hiện tại trước khi nhận ghế; không tự xếp người đó vào ghế thứ hai.
- Người đang ngồi ghế phòng trực tuyến không bấm được Đánh với máy; hiển thị “Bạn đang ở trong một ván/phòng khác”; máy chủ cũng từ chối yêu cầu vượt quy định.

**Việc cần làm**

- Đối soát hậu quả đối với ghế, ván và màn hình theo tài khoản/Khách, thiết bị cũ/mới, phòng chờ/ván đang chơi và hết phiên/đăng xuất.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát một vị trí chơi, hết phiên, chuyển thiết bị, hồ sơ và đăng xuất bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ một vị trí chơi, hết phiên, chuyển thiết bị, hồ sơ và đăng xuất; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.

**Phạm vi và phối hợp**

Không triển khai đổi tên đăng nhập, đổi email hay bộ chọn giao diện.

---

<a id="t56"></a>

#### T56 · BE phiên cố định, một vị trí chơi, thiết bị khác xử thua, đăng xuất

| Trường | Giá trị |
|---|---|
| Issue Id | 92 |
| Issue Type | Task |
| Parent | EP-01 |
| Assignee | Đông |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-92 |
| Start date | 22/10/2026 |
| Due date | 24/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.3 |
| Original Estimate | 24 giờ |
| Remaining Estimate | 24 giờ |
| Story Points | 5 |
| Story (relates to) | US-01.4 |
| Is blocked by | T18, T20, T35 |
| Component chính | BE |
| Components | BE, Tài khoản, Ván trực tuyến |
| Labels | chinh-be, p1, phat-trien, sprint-2, tai-khoan, van-truc-tuyen |
| Nguồn đặc tả (BA / AC) | 0.3, 1.3, 1.4, 1.8 |


**Description**

**Mục tiêu**

Thực thi thời hạn đăng nhập, một vị trí chơi và việc cập nhật hồ sơ tại máy chủ.

**Bối cảnh công việc**

Một tài khoản có thể có nhiều cửa sổ hiển thị nhưng chỉ được chiếm một vị trí chơi. Máy chủ quyết định quyền điều khiển, hạn đăng nhập và hậu quả khi đổi thiết bị; không dựa riêng vào việc nút trên giao diện bị khoá.

**Yêu cầu cần đáp ứng**

- Phiên có Ghi nhớ đăng nhập hết hạn cố định sau 30 ngày; không ghi nhớ thì khi đóng trình duyệt hoặc sau 12 giờ, tuỳ điều kiện nào đến trước. Mốc tính từ đăng nhập thành công hoặc hoàn tất đăng ký mới. Làm mới thông tin xác thực không gia hạn mốc đã tạo.
- Hết phiên trong ván online: mất quyền điều khiển, yêu cầu đăng nhập lại và giữ ván 60 giây trong khi đồng hồ vẫn chạy. Ván với máy được giữ 30 phút để cùng thiết bị quay lại.
- Đăng nhập từ thiết bị khác khi đang đấu làm ván hiện tại bị xử thua, thiết bị cũ bị đăng xuất, thiết bị mới vào Sảnh. Nếu chỉ ngồi phòng chờ thì rời ghế theo vòng đời phòng, không ghi kết quả thua.
- Chặn ngồi ghế hoặc mở ván với máy thứ hai; mở lời mời không được vượt kiểm tra này. Đăng xuất khi đang đấu phải xác nhận đầu hàng, còn ở phòng chờ thì rời phòng rồi đăng xuất.
- Khách không xuất hiện trong tìm kiếm bạn bè và không nhận lời mời kết bạn. Hồ sơ chính thức cho đổi Tên hiển thị dài 2–30 ký tự, từ chối từ cấm; email chỉ đọc. Hồ sơ Khách chỉ có Đăng xuất.
- Phiên Khách có hạn tối đa 12 giờ nhưng không kết thúc tự động khi còn ngồi ghế hoặc trong ván. Khi đủ điều kiện hết phiên hoặc Khách chủ động Đăng xuất, điều phối rời vị trí/kết thúc ván theo quy tắc hiện có, thu hồi phiên, xoá tên và dữ liệu cá nhân Khách, trả thông tin để về màn Đăng nhập. Vào Khách lần sau tạo danh tính mới; không khôi phục danh tính cũ.

**Việc cần làm**

- Phân biệt đăng nhập thật, làm mới thông tin xác thực, mở thẻ cùng thiết bị và đăng nhập thiết bị khác bằng dữ liệu phiên; mốc hạn lấy từ lúc đăng nhập thành công hoặc hoàn tất đăng ký, không từ lần hoạt động cuối.
- Lưu mốc hết hạn, thiết bị và vị trí chơi đang giữ; xử lý đăng nhập, hết hạn, rời ghế và kết thúc ván nhất quán.
- Cung cấp trạng thái ván đang dở và lý do không được vào chỗ mới để giao diện hiển thị; cập nhật Tên hiển thị phải kiểm lại dữ liệu ở máy chủ.
- Viết kiểm thử thời hạn cố định, đổi thiết bị khi chờ hoặc đang đấu, vào chỗ thứ hai và sửa hồ sơ bằng yêu cầu gửi trực tiếp.
- Nối sự kiện kết thúc phiên Khách với quản lý phòng, ván với máy và chat; kiểm dọn dữ liệu sau hết hạn lẫn đăng xuất chủ động, không xoá nhầm dữ liệu người khác hoặc làm mất kết quả ván online phải lưu.

**Kết quả bàn giao**

- Dịch vụ quản lý phiên, vị trí chơi và cập nhật hồ sơ; kiểm thử tự động và kết quả thử hai thiết bị.
- Dữ liệu mốc phiên, thiết bị và vị trí chơi bàn giao cho giao diện; bằng chứng dọn riêng dữ liệu Khách.

**Điều kiện hoàn thành**

- Không có hai vị trí chơi có quyền điều khiển đồng thời; kết quả thua chỉ phát sinh đúng trường hợp đã quy định.
- Hạn phiên không trượt theo hoạt động; dữ liệu hồ sơ sai bị từ chối cả khi bỏ qua giao diện.
- Khách hết hạn nhưng còn ngồi ghế/trong ván không bị ngắt giữa chừng; khi phiên thực sự kết thúc, cả hết hạn và đăng xuất đều xoá tên/dữ liệu cá nhân theo phạm vi đã chốt và lần vào sau dùng danh tính mới.
- Mở thẻ cùng thiết bị không xử thua: thẻ mới tiếp quản, thẻ cũ chỉ đọc kể cả tự nối lại; camera/mic thẻ cũ dừng, thẻ mới mặc định tắt. Đóng riêng một thẻ không bị coi là đóng cả trình duyệt.

**Phạm vi và phối hợp**

Công việc xử lý phía máy chủ. Thông báo, hộp xác nhận và màn hồ sơ được giao cho phần giao diện; phần giữ trạng thái ván phối hợp với xử lý nối lại và ván với máy.

---

<a id="t65"></a>

#### T65 · FE Cài đặt hồ sơ, Đăng xuất, banner ván dở

| Trường | Giá trị |
|---|---|
| Issue Id | 101 |
| Issue Type | Task |
| Parent | EP-01 |
| Assignee | Cường |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-101 |
| Start date | 28/10/2026 |
| Due date | 28/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v1.0 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-01.4 |
| Is blocked by | T56, T63 |
| Component chính | FE |
| Components | FE, Tài khoản |
| Labels | chinh-fe, p1, phat-trien, sprint-3, tai-khoan |
| Nguồn đặc tả (BA / AC) | 0.3, 1.4, 1.8, 6.3 |


**Description**

**Mục tiêu**

Tạo màn hồ sơ, thao tác đăng xuất và lối quay lại ván đang dở.

**Bối cảnh công việc**

Người dùng cần phân biệt Tên đăng nhập dùng để vào tài khoản với Tên hiển thị người khác nhìn thấy. Giao diện sử dụng thông tin phiên và hồ sơ từ máy chủ, đồng thời giải thích vì sao không được mở thêm một ván khác.

**Yêu cầu cần đáp ứng**

- Hồ sơ chính thức hiển thị ảnh đại diện bằng chữ cái đầu, Tên đăng nhập, email chỉ đọc và ô Tên hiển thị. Cho lưu tên dài 2–30 ký tự hợp lệ, từ chối từ cấm với lỗi tại ô; không yêu cầu mã xác minh.
- Không có đổi Tên đăng nhập, đổi email, tải ảnh đại diện hoặc bộ chọn giao diện trong màn này. Tên mới hiển thị trên thanh điều hướng và cập nhật trong phòng theo dữ liệu máy chủ.
- Nếu đang có phòng hoặc ván chưa kết thúc, Sảnh hiện “Bạn có ván đang chơi dở — Quay lại” dẫn về đúng nơi. Nút mở chỗ chơi khác không bấm được, có chú thích “Bạn đang ở trong một ván/phòng khác”.
- Đăng xuất khi đang đấu phải nêu hậu quả đầu hàng và có Đồng ý, Huỷ. Huỷ giữ nguyên ván; đồng ý chờ máy chủ xử lý rồi về Đăng nhập. Ở phòng chờ thì rời phòng theo đúng vòng đời và đăng xuất.
- Khách không có phần sửa hồ sơ: Cài đặt chỉ có Đăng xuất; Bạn bè không bấm được với lời nhắc đăng ký tài khoản, mục mời bạn bè bị ẩn nhưng chia sẻ mã và đường dẫn vẫn còn.

**Việc cần làm**

- Lấy hồ sơ, vị trí đang giữ và đường dẫn quay lại từ máy chủ; phân biệt đang chờ, đang đấu online, đang đấu với máy và không giữ chỗ để gửi đúng thao tác đăng xuất sau xác nhận.
- Xây màn hồ sơ và thông báo ván dở, gồm trạng thái đang tải, đang lưu, thành công và thất bại. Không ghi tên mới như đã lưu nếu máy chủ từ chối.
- Nối thao tác lưu, quay lại và đăng xuất với máy chủ; giữ đúng đường dẫn ván thay vì mở một ván mới.
- Kiểm tên có dấu, độ dài biên, tên bị cấm, lỗi mạng lúc lưu và các hoàn cảnh đăng xuất bằng tài khoản chính thức lẫn Khách.

**Kết quả bàn giao**

- Màn Cài đặt hồ sơ, thông báo quay lại ván và hộp xác nhận đăng xuất tích hợp thật.
- Bằng chứng lưu tên thành công/thất bại và đăng xuất khi chờ, đấu online, đấu máy.

**Điều kiện hoàn thành**

- Tên hợp lệ được lưu và hiển thị nhất quán; tên không hợp lệ có thông báo rõ, email không sửa được.
- Quay lại đúng ván; huỷ đăng xuất không làm thay đổi kết quả hoặc mất chỗ chơi.
- Đăng xuất trong ván với máy cũng có xác nhận đầu hàng; khi máy chủ báo hết phiên, giao diện yêu cầu đăng nhập lại và không tiếp tục gửi nước đi bằng phiên cũ. Lưu tên lỗi không ghi đè tên đã được xác nhận.

**Phạm vi và phối hợp**

Máy chủ vẫn kiểm quyền, dữ liệu và thời hạn phiên; giao diện không tự quyết định đầu hàng hay giải phóng vị trí chơi.

---

<a id="t69"></a>

#### T69 · Kiểm thử US-01.4

| Trường | Giá trị |
|---|---|
| Issue Id | 105 |
| Issue Type | Task |
| Parent | EP-01 |
| Assignee | Nhạn |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-105 |
| Start date | 01/11/2026 |
| Due date | 01/11/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-01.4 |
| Is blocked by | T23, T26, T32, T37, T38, T40, T44, T52, T61, T65 |
| Component chính | QA & DevOps |
| Components | QA & DevOps, Tài khoản, Ván trực tuyến |
| Labels | chinh-qa-devops, kiem-thu, p1, sprint-4, tai-khoan, van-truc-tuyen |
| Nguồn đặc tả (BA / AC) | 0.3, 1.3, 1.4, 1.8, 6.3 |


**Description**

**Mục tiêu**

Kiểm chứng phiên đăng nhập, giới hạn một vị trí chơi và hồ sơ cá nhân.

**Bối cảnh công việc**

Chuẩn bị cùng một tài khoản trên hai thiết bị, tài khoản đối thủ, phiên Khách và ván với máy. Phân biệt mở thêm thẻ trong cùng trình duyệt với đăng nhập từ thiết bị khác. Có dữ liệu thử gần hạn phiên để kiểm thời hạn mà không phải chờ nhiều ngày.

**Yêu cầu cần đáp ứng**

- Có Ghi nhớ: hạn cố định 30 ngày; không Ghi nhớ: đóng cả trình duyệt hoặc đủ 12 giờ, điều kiện nào đến trước. Hoạt động hoặc làm mới khoá phiên không gia hạn đăng nhập. Hết phiên khi online ngắt quyền, yêu cầu đăng nhập lại, giữ 60 giây và đồng hồ chạy; với máy giữ 30 phút. Đăng nhập lại cùng thiết bị trong hạn tiếp tục được.
- Đăng nhập thiết bị khác trong ván online hoặc với máy: xử thua ngay, thiết bị cũ đăng xuất, thiết bị mới vào Sảnh. Đang phòng chờ thì rời ghế/chuyển chủ theo vòng đời, không tạo thua.
- Đang giữ ghế hoặc ván với máy thì không mở thêm vị trí; Tạo phòng/Vào chơi/Đánh với máy/mã/link khác đều bị máy chủ kiểm. Nút bị vô hiệu báo “Bạn đang ở trong một ván/phòng khác”.
- Sảnh có “Bạn có ván đang chơi dở — Quay lại”, dẫn đúng phòng/ván. Đăng xuất trong ván online có xác nhận đầu hàng: đồng ý kết thúc/rời/đăng xuất, huỷ giữ nguyên; phòng chờ rời rồi đăng xuất, không xử thua.
- Tên hiển thị 2–30 ký tự hợp lệ được lưu không cần mã xác minh, hiện trên thanh điều hướng và trong phòng lần cập nhật kế tiếp. Sai độ dài hoặc từ cấm bị từ chối tại ô, không che bằng dấu sao rồi lưu.
- Hồ sơ có ảnh chữ cái đầu, tên đăng nhập và email chỉ đọc; không đổi tên đăng nhập hoặc chọn giao diện. Đăng xuất tại hồ sơ vẫn theo hậu quả đang đấu/chờ.
- Khách: Bạn bè vô hiệu với “Đăng ký tài khoản để kết bạn”; mục mời bạn ẩn nhưng link/mã còn; cài đặt chỉ Đăng xuất. Khách không xuất hiện khi tìm bạn và không nhận lời mời bạn bè.

**Việc cần làm**

- Tạo riêng phiên có Ghi nhớ và không Ghi nhớ; ghi mốc đăng nhập hoặc hoàn tất đăng ký, rồi mô phỏng hoạt động/làm mới thông tin xác thực sát hạn để kiểm mốc cố định 30 ngày hoặc 12 giờ.
- Chuẩn bị tài khoản trên hai thiết bị, đối thủ và ván với máy; đặt hạn phiên thử gần hết để kiểm các mốc có thể lặp lại.
- Thử hoạt động/làm mới khoá phiên và hết hạn ở online/với máy; đăng nhập lại cùng thiết bị rồi thử thiết bị khác.
- Thử mở vị trí thứ hai bằng mọi đường vào; từ Sảnh bấm Quay lại và kiểm đăng xuất đồng ý/huỷ ở phòng chờ và trong ván.
- Thử tên hiển thị dài 1/2/30/31 ký tự, từ cấm, tài khoản Khách và gọi sửa hồ sơ trực tiếp.
- Ghi từng ca là Đạt, Không đạt hoặc Chưa kiểm được cùng dữ liệu, thời điểm và bằng chứng đã che bí mật. Báo lỗi có cách tái hiện; sau sửa chạy lại ca lỗi và các nhánh liên quan.

**Kết quả bàn giao**

- Bộ ca kiểm có bước chạy, dữ liệu và kết quả mong đợi để thành viên khác thực hiện lại được.
- Bảng kết quả thực tế cùng bằng chứng và danh sách lỗi còn mở; các lượt kiểm lại giữ được liên hệ với lỗi ban đầu.

**Điều kiện hoàn thành**

- Mọi tình huống nêu trên có kết quả đúng và bằng chứng lặp lại được; sai quyền, sai kết quả hoặc sai hạn thời gian phải ghi Không đạt, chưa được kết luận hoàn tất.
- Thiếu thiết bị, thiếu dữ liệu hoặc lỗi của phần tích hợp phải ghi rõ là Chưa kiểm được; việc người phụ trách biết vấn đề không thay thế kết quả đạt.
- Không Ghi nhớ kết thúc khi đóng cả trình duyệt hoặc đủ 12 giờ, điều kiện nào đến trước; đóng một thẻ không đồng nghĩa đóng trình duyệt. Cùng thiết bị đăng nhập lại trong hạn giữ ván được tiếp tục, thiết bị khác xử thua đúng quy tắc.

**Phạm vi và phối hợp**

Công việc này chuẩn bị và thực hiện kiểm thử cho phạm vi trên. Người triển khai chức năng chịu trách nhiệm sửa lỗi; kết quả kiểm cục bộ không thay thế việc nghiệm thu toàn bộ sản phẩm.

---

<a id="ep-02"></a>

## EP-02 · Tạo phòng

| Trường | Giá trị |
|---|---|
| Issue Id | 3 |
| Issue Type | Epic |
| Parent | — |
| Assignee | Tình |
| Reporter | Tình |
| Priority | Medium |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-3 |
| Start date | 15/10/2026 |
| Due date | 22/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Component chính | Tổng hợp phạm vi các Task |
| Components | BE, FE, Phòng chơi, QA & DevOps, Ván trực tuyến |
| Labels | EP-02, dac-ta, p1, phong-choi, van-truc-tuyen |
| Nguồn đặc tả (BA / AC) | 0.6, 0.7, 0.10, 2.1, 2.3, 2.7, 3.6 |


**Description**

**Mục tiêu**

Bàn giao bộ đặc tả đã duyệt về tạo phòng, sẵn sàng, đổi bên và chơi tiếp; bảo đảm các đặc tả thành phần nhất quán khi triển khai.

**Bối cảnh công việc**

Phòng và ván là hai đối tượng khác nhau: phòng có thể còn tồn tại khi một ván kết thúc; ván mới có mã định danh và đồng hồ mới. Các quyết định sản phẩm đã có hiệu lực; nhóm chức năng này tổng hợp và truy vết yêu cầu, không mở một vòng quyết định hoặc duyệt lại phạm vi.

**Yêu cầu cần đáp ứng**

- Phòng mới mặc định chỉ vào bằng mã, chủ phòng ngồi Đỏ; chọn 5/10/15 phút mặc định 10, chỗ xem 0–5 mặc định 5, không đổi mức giờ hoặc sức chứa sau tạo.
- Một người ngồi ghế được đổi ghế tự do; đủ hai người dùng Xin đổi bên, hạn trả lời 30 giây, từ chối/hết hạn thì chờ 60 giây. Cả hai Sẵn sàng mới đếm 3–2–1 và tạo ván.
- Sau ván phòng về chờ, đặt lại Sẵn sàng, giữ ghế/chế độ/chủ phòng/chat, hiển thị Ở lại phòng/Rời phòng. Chơi tiếp tạo mã ván mới và đồng hồ đầy; không đóng vì chờ lâu, chỉ đóng khi không còn người ngồi ghế.

**Việc cần làm**

- Đối chiếu các đặc tả thành phần về tạo phòng, sẵn sàng, đổi bên và chơi tiếp với quyết định hiện hành; kiểm đầy đủ luồng, quyền, giới hạn và ngoại lệ nêu trên.
- Rà các điểm giao với nhóm chức năng khác, gắn yêu cầu với công việc triển khai và tình huống kiểm thử; sửa sai lệch theo nguồn nghiệp vụ ưu tiên.
- Theo dõi độ đầy đủ của hồ sơ thành phần và bằng chứng phải bổ sung; mâu thuẫn chưa giải được theo thứ tự ưu tiên nguồn cần báo người phụ trách sản phẩm, không tự sửa quyết định đã duyệt.

**Kết quả bàn giao**

- Bản tổng hợp đối soát tạo phòng, sẵn sàng, đổi bên và chơi tiếp, kèm truy vết tới đặc tả thành phần và quyết định nguồn.
- Danh sách điểm giao, tình huống nghiệm thu và sai lệch cần xử lý; bằng chứng kỹ thuật được quản lý tại công việc triển khai/kiểm chứng liên quan.

**Điều kiện hoàn thành**

- Các đặc tả thành phần phản ánh đúng tạo phòng, sẵn sàng, đổi bên và chơi tiếp theo yêu cầu bên trên và thống nhất tại các điểm giao.
- Hồ sơ hoàn tất theo đặc tả thành phần cuối cùng, không yêu cầu người phụ trách sản phẩm duyệt lại quy tắc đã chốt. Kết quả chạy phần mềm và kiểm thử chỉ được ghi nhận khi có bằng chứng riêng.

**Phạm vi và phối hợp**

Không thêm đổi cấu hình mức giờ/sức chứa sau tạo, tái đấu trực tiếp hay đóng phòng vì chờ lâu.

---

<a id="us-02.1"></a>

### US-02.1 · Tạo phòng, ghế và bắt đầu ván

| Trường | Giá trị |
|---|---|
| Issue Id | 19 |
| Issue Type | Story |
| Parent | EP-02 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-19 |
| Start date | 17/10/2026 |
| Due date | 20/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T18, T21, T28 |
| Sprint thi công | S2, S3 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | BE, FE, Phòng chơi, QA & DevOps |
| Labels | EP-02, dac-ta, p1, phong-choi |
| Nguồn đặc tả (BA / AC) | 0.6, 0.7, 0.10, 2.1, 2.3, 2.7 |


**Description**

**Mục tiêu**

Bàn giao đặc tả cách tạo phòng, bố trí hai ghế và bắt đầu ván khi cả hai người chơi thực sự sẵn sàng theo quy tắc đã duyệt.

**Bối cảnh công việc**

Mỗi phòng có chủ phòng, ghế Đỏ, ghế Đen và số chỗ xem đã chọn. Phòng chờ chưa phải ván đang diễn ra; rời phòng chờ không gây thua. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Bối cảnh: Ở Sảnh, không ngồi ghế nơi khác. Thao tác hoặc sự kiện: Bấm "Tạo phòng". Kết quả cần có: Mở biểu mẫu: Tên phòng (1–60 ký tự), Mức giờ 5/10/15 phút (mặc định 10), Người xem Không có người xem hoặc 1–5 (mặc định 5).
- Bối cảnh: Biểu mẫu tạo phòng. Thao tác hoặc sự kiện: Tên phòng rỗng, > 60 ký tự hoặc chứa từ cấm. Kết quả cần có: Từ chối, báo lỗi tại ô.
- Bối cảnh: Biểu mẫu hợp lệ. Thao tác hoặc sự kiện: Bấm Tạo. Kết quả cần có: Phòng tạo ở Chỉ vào bằng mã, có mã 8 ký tự do máy chủ sinh và đường dẫn mời; người tạo là chủ phòng, ngồi ghế Đỏ; vào trang của phòng vừa tạo trạng thái Đang chờ.
- Bối cảnh: Phòng đã tạo. Thao tác hoặc sự kiện: Tìm cách đổi mức giờ hoặc số người xem. Kết quả cần có: Không có chức năng đổi.
- Tổng sức chứa của phòng bằng hai ghế chơi cộng số chỗ xem đã chọn, tối đa 7 người.
- Bối cảnh: Chỉ có một người ngồi ghế (chủ phòng). Thao tác hoặc sự kiện: Bấm "Đổi ghế". Kết quả cần có: Chuyển Đỏ ↔ Đen tùy thích, không cần ai duyệt.
- Bối cảnh: Đủ hai người. Thao tác hoặc sự kiện: Mỗi người bấm "Sẵn sàng"/huỷ Sẵn sàng. Kết quả cần có: Trạng thái hiển thị tức thời cho cả phòng.
- Khi cả hai người chơi Sẵn sàng, đếm 3…2…1 kèm âm thanh. Hết đếm, máy chủ kiểm lại hai ghế, trạng thái sẵn sàng và kết nối; đủ điều kiện mới tạo ván có mã mới, chuyển sang màn đấu và cho đồng hồ Đỏ chạy.
- Bối cảnh: Đang đếm. Thao tác hoặc sự kiện: Một người mất kết nối. Kết quả cần có: Huỷ đếm, Sẵn sàng của cả hai về chưa sẵn sàng, giữ ghế người mất kết nối 60 giây; không tạo ván, không xử thua.
- Bối cảnh: Phòng đang chờ. Thao tác hoặc sự kiện: Thành phần người ngồi ghế thay đổi. Kết quả cần có: Sẵn sàng của cả hai đặt lại về chưa sẵn sàng.
- Bối cảnh: chủ phòng rời phòng đang chờ khi còn người chơi thứ hai. Thao tác hoặc sự kiện: chủ phòng rời. Kết quả cần có: Quyền chủ phòng chuyển cho người chơi còn lại.
- Bối cảnh: Không còn người ngồi ghế (chủ phòng rời khi chỉ một mình, hoặc người cuối mất ghế sau 60 giây). Thao tác hoặc sự kiện: Hệ thống. Kết quả cần có: Phòng đã đóng; người xem về Sảnh với thông báo "Phòng đã đóng"; chat phòng bị xoá.
- Bối cảnh: chủ phòng chỉ ngồi một mình rất lâu. Thao tác hoặc sự kiện: Không ai vào. Kết quả cần có: Phòng không tự đóng do chờ lâu.

**Việc cần làm**

- Đối chiếu biểu mẫu và vòng đời phòng với mức giờ, sức chứa đã duyệt; kiểm nhánh mất mạng khi đếm, chuyển chủ, đóng khi hết ghế và không đóng do chờ lâu.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát mặc định tạo phòng, đổi ghế khi một người, sẵn sàng, đếm ngược và chuyển chủ bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ mặc định tạo phòng, đổi ghế khi một người, sẵn sàng, đếm ngược và chuyển chủ; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.

**Phạm vi và phối hợp**

Không thêm khả năng thay đổi mức giờ hoặc sức chứa sau khi đã tạo phòng.

---

<a id="t18"></a>

#### T18 · BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host

| Trường | Giá trị |
|---|---|
| Issue Id | 54 |
| Issue Type | Task |
| Parent | EP-02 |
| Assignee | Tùng |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-54 |
| Start date | 19/10/2026 |
| Due date | 21/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 24 giờ |
| Remaining Estimate | 24 giờ |
| Story Points | 5 |
| Story (relates to) | US-02.1 |
| Is blocked by | T12, T14 |
| Component chính | BE |
| Components | BE, Phòng chơi |
| Labels | chinh-be, p1, phat-trien, phong-choi, sprint-2 |
| Nguồn đặc tả (BA / AC) | 0.6, 0.7, 0.10, 2.1, 2.3, 2.7, 2.8, 8.3, 5.3 |


**Description**

**Mục tiêu**

Xây dựng xử lý phòng chờ để người dùng tạo phòng, chọn ghế, cùng sẵn sàng và bắt đầu một ván mới một cách nhất quán.

**Bối cảnh công việc**

Phòng gồm hai ghế và tối đa năm người xem. Người tạo là chủ; máy chủ quản lý ghế và bắt đầu ván.

**Yêu cầu cần đáp ứng**

- Form tạo nhận tên 1–60 ký tự qua lọc từ cấm, mức giờ 5/10/15 phút mặc định 10, số người xem 0–5 mặc định 5. Không đổi mức giờ hoặc trần người xem sau tạo.
- Phòng mới mặc định chỉ vào bằng mã/đường dẫn, chưa công khai; máy chủ sinh mã 8 ký tự và đường dẫn, người tạo ngồi Đỏ.
- Chỉ một người ngồi ghế thì chủ phòng đổi Đỏ/Đen tự do. Khi đủ hai người, đổi phe phải qua chức năng xin đổi bên riêng.
- Mỗi người bật/tắt Sẵn sàng. Hai người cùng sẵn sàng mới đếm 3–2–1; trước tạo ván phải kiểm lại ghế, kết nối và trạng thái sẵn sàng.
- Mất mạng khi đếm thì huỷ, đặt lại sẵn sàng hai bên, giữ ghế 60 giây, không tạo ván hoặc xử thua. Thay người ngồi cũng đặt lại sẵn sàng.
- Chủ phòng rời khi còn người chơi thì chuyển quyền; không còn người ngồi ghế thì đóng phòng, thông báo “Phòng đã đóng” cho người xem. Một chủ phòng ngồi lâu không tự bị đóng. Nếu chủ phòng mất kết nối ở phòng chờ thì giữ ghế 60 giây; hết hạn làm mất ghế, và phòng đóng nếu không còn ai ngồi ghế. Đóng phòng phải phát thông tin để xoá chat và thu hồi quyền hình tiếng.
- Một người không được ngồi ghế ở nhiều nơi; Khách chỉ tạo tối đa một phòng đang mở.

**Việc cần làm**

- Tạo xử lý tạo phòng, mã/đường dẫn và dữ liệu ghế.
- Kiểm dữ liệu đầu vào và vị trí chơi hiện có ở máy chủ.
- Thực hiện đổi ghế đơn, sẵn sàng, đếm ngược và sự kiện bắt đầu ván mới.
- Xử lý thay người, rời phòng, chuyển chủ và đóng phòng.
- Thử hai người gửi sẵn sàng/rời gần nhau, mất mạng trong đếm và thời gian chờ dài.
- Bàn giao sự kiện cho giao diện, ván, chat và thu hồi hình tiếng khi rời ghế.

**Kết quả bàn giao**

- Dịch vụ phòng chờ và sự kiện thay đổi trạng thái.
- Kiểm thử tích hợp các nhánh ghế, đếm và đóng phòng.
- Mẫu trạng thái phòng gồm chủ, hai ghế, sẵn sàng, thông số cố định, giai đoạn đếm và danh tính ván mới; sự kiện rời/đóng để chat và quyền camera/mic xử lý.

**Điều kiện hoàn thành**

- Phòng mới có thông số đúng và chủ ngồi Đỏ; không vượt sức chứa 2 cộng trần người xem.
- Không tạo ván khi thiếu người hoặc mất kết nối trong đếm.
- Chuyển chủ đúng, phòng cuối cùng không còn người chơi được đóng.
- Yêu cầu tạo thêm vị trí chơi hoặc phòng Khách trái giới hạn bị từ chối.
- Hai người cùng bấm sẵn sàng hoặc gửi lại lệnh không sinh hai ván; đổi thành phần ghế trong lúc đếm huỷ lượt bắt đầu cũ và đặt lại sẵn sàng.
- Người xem nhận Phòng đã đóng và về Sảnh khi ghế cuối mất; giữ phòng chờ không đặt hạn đóng vì chủ chờ lâu.

**Phạm vi và phối hợp**

Bàn giao phòng chờ và tín hiệu bắt đầu ván. Xin đổi bên hai người, chế độ công khai/khóa, chat và hình tiếng dùng sự kiện này để bổ sung hành vi của mình.

---

<a id="t21"></a>

#### T21 · FE hộp Tạo phòng và phòng chờ: ghế, Sẵn sàng, đếm ngược

| Trường | Giá trị |
|---|---|
| Issue Id | 57 |
| Issue Type | Task |
| Parent | EP-02 |
| Assignee | Nhạn |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-57 |
| Start date | 22/10/2026 |
| Due date | 23/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 16 giờ |
| Remaining Estimate | 16 giờ |
| Story Points | 3 |
| Story (relates to) | US-02.1 |
| Is blocked by | T03, T18 |
| Component chính | FE |
| Components | FE, Phòng chơi |
| Labels | chinh-fe, p1, phat-trien, phong-choi, sprint-2 |
| Nguồn đặc tả (BA / AC) | 0.6, 0.10, 0.13, 2.1, 2.3, 2.7, 5.3 |


**Description**

**Mục tiêu**

Tạo hộp tạo phòng và màn phòng chờ để người chơi hiểu ai đang ngồi ghế, chọn phe khi một mình và cùng xác nhận bắt đầu.

**Bối cảnh công việc**

Phòng chờ dùng chung địa chỉ phòng với lúc thi đấu nhưng có trạng thái và thao tác khác. Các thay đổi phải hiển thị theo máy chủ cho cả hai người, không tự bắt đầu ván chỉ vì bộ đếm trên trình duyệt hết.

**Yêu cầu cần đáp ứng**

- Hộp tạo có tên phòng, mức giờ 5/10/15 phút mặc định 10 và số người xem 0–5 mặc định 5.
- Tên rỗng, hơn 60 ký tự hoặc chứa từ cấm báo lỗi tại ô, không tạo phòng.
- Tạo thành công vào phòng chờ, hiện chủ phòng ngồi Đỏ, ghế còn lại, mã/đường dẫn và thông số đã chọn.
- Chỉ có một người ngồi ghế thì hiện “Đổi ghế”; đủ hai người thì ẩn thao tác đổi tự do để dùng đề nghị đổi bên riêng.
- Mỗi người thấy trạng thái Sẵn sàng của hai bên theo thời gian thực, có thể bật/tắt của mình.
- Cả hai sẵn sàng hiện 3–2–1 có âm thanh; mất kết nối hoặc thay ghế cập nhật huỷ/đặt lại theo máy chủ.
- Khung chờ tải, lỗi, trống và nút bị vô hiệu phải có lời giải thích; thông số giờ/trần người xem không có chức năng sửa sau tạo.

**Việc cần làm**

- Dựng biểu mẫu bằng thành phần chung và nối xử lý tạo phòng.
- Hiển thị ghế, phe, chủ phòng, thông số và các nút điều khiển theo vai trò.
- Nối sự kiện người vào/rời, đổi ghế và sẵn sàng; không cho giao diện tự cấp ghế.
- Thêm đếm ngược và chỉ chuyển sang bàn đấu khi máy chủ xác nhận ván mới.
- Bố trí vùng gắn chat/hình tiếng ở phòng chờ để các phần đó hoạt động liên tục khi vào ván.
- Kiểm hai cửa sổ với thao tác sẵn sàng, huỷ, đổi ghế và rời.

**Kết quả bàn giao**

- Hộp tạo phòng và màn phòng chờ nối máy chủ thật.
- Các trạng thái giao diện và đếm ngược.
- Bằng chứng thử bằng hai người.

**Điều kiện hoàn thành**

- Form mặc định đúng; dữ liệu sai hiện lỗi và không tạo phòng.
- Hai người thấy cùng ghế và trạng thái sẵn sàng.
- Chủ ở một mình đổi được phe, có người thứ hai thì không còn nút đổi tự do.
- Huỷ đếm không tạo màn ván giả; chuyển chủ hiện đúng sau khi chủ cũ rời.
- Người xem thấy ghế và sẵn sàng nhưng không có quyền đổi ghế hoặc bật sẵn sàng; chuyển chủ theo dữ liệu máy chủ không cần tải lại.
- Ghế thay người hoặc mất mạng trong đếm xoá hiển thị đếm cũ, trở về chưa sẵn sàng; không điều hướng theo bộ đếm cục bộ.

**Phạm vi và phối hợp**

Bổ sung 4 giờ trong ước lượng cho kiểm tra đồng bộ ghế, Sẵn sàng và đếm ngược trên nhiều phiên theo yêu cầu hiện có.

Bàn giao giao diện nền của phòng chờ. Đề nghị đổi bên, khung chat/hình tiếng và điều khiển người xem được nối ở phần chức năng tương ứng, không dựng giả để coi đã hoàn tất.

---

<a id="t28"></a>

#### T28 · Kiểm thử US-02.1

| Trường | Giá trị |
|---|---|
| Issue Id | 64 |
| Issue Type | Task |
| Parent | EP-02 |
| Assignee | Thư |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-64 |
| Start date | 25/10/2026 |
| Due date | 25/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-02.1 |
| Is blocked by | T25, T26, T37 |
| Component chính | QA & DevOps |
| Components | Phòng chơi, QA & DevOps |
| Labels | chinh-qa-devops, kiem-thu, p1, phong-choi, sprint-3 |
| Nguồn đặc tả (BA / AC) | 0.6, 0.10, 2.1, 2.3, 2.7, 2.8, 5.3 |


**Description**

**Mục tiêu**

Kiểm chứng tạo phòng, chọn ghế và bắt đầu ván đúng quy tắc trước khi người dùng chơi trực tuyến.

**Bối cảnh công việc**

Chuẩn bị người tạo phòng, người chơi thứ hai và người xem. Thực hiện qua giao diện thật và đối chiếu trạng thái máy chủ, tránh chỉ thử bằng dữ liệu dựng sẵn.

**Yêu cầu cần đáp ứng**

- Biểu mẫu tạo phòng nhận tên dài 1–60 ký tự, mức giờ 5/10/15 phút mặc định 10, số người xem từ không có đến 5 mặc định 5. Thử tên rỗng, quá dài và chứa từ cấm; các giá trị sai phải bị từ chối tại ô nhập.
- Phòng mới chỉ cho vào bằng mã hoặc đường dẫn, có mã 8 ký tự, người tạo làm chủ và ngồi Đỏ. Tổng sức chứa bằng 2 cộng số chỗ xem, tối đa 7. Sau khi tạo không có chức năng đổi mức giờ hoặc trần người xem.
- Khi chỉ chủ phòng ngồi ghế, đổi Đỏ/Đen tự do. Khi đủ hai người, trạng thái Sẵn sàng hoặc huỷ Sẵn sàng phải cập nhật cho cả phòng; thay người ngồi ghế làm cả hai trở về chưa sẵn sàng.
- Cả hai sẵn sàng thì đếm 3…2…1 kèm âm thanh. Máy chủ kiểm lại ghế, kết nối và trạng thái sẵn sàng rồi mới tạo ván mới; giao diện chuyển sang bàn đấu và đồng hồ Đỏ bắt đầu.
- Chủ phòng rời lúc còn người chơi thứ hai thì người đó nhận quyền chủ phòng. Chủ phòng ngồi chờ lâu một mình không bị tự đóng phòng.
- Người thứ hai rời ghế khi đang chờ thì người còn lại thấy Đổi ghế tự do trở lại; người xem không được bấm Sẵn sàng hoặc Đổi ghế.

**Việc cần làm**

- Viết tình huống tại các ranh giới độ dài tên, số chỗ xem và hai trường hợp đổi ghế.
- Chạy tạo phòng và bắt đầu ván nhiều lần; đối chiếu mã ván mới và đồng hồ.
- Ghi lỗi cùng dữ liệu tái hiện; kiểm lại sau sửa và phân biệt rõ trường hợp chưa có điều kiện kiểm.
- Gửi gần đồng thời Sẵn sàng, huỷ Sẵn sàng và rời ghế; ghi thứ tự máy chủ nhận, trạng thái cuối và số ván được tạo.

**Kết quả bàn giao**

- Báo cáo kiểm tạo phòng, sức chứa, ghế, sẵn sàng và chuyển chủ phòng.

**Điều kiện hoàn thành**

- Các nhánh nêu trên đạt với máy chủ và giao diện thật, gồm kiểm tên bằng bộ lọc chung.
- Một lượt bắt đầu hợp lệ chỉ tạo một mã ván mới; dữ liệu giờ/trần người xem không bị sửa qua yêu cầu trực tiếp sau tạo.

**Phạm vi và phối hợp**

Nhánh rớt mạng khi đếm và đóng phòng phải xoá chat được kiểm hoàn chỉnh trong đợt hồi quy sau khi chức năng kết nối và chat sẵn sàng.

---

<a id="us-02.2"></a>

### US-02.2 · Xin đổi bên và ở lại phòng sau ván

| Trường | Giá trị |
|---|---|
| Issue Id | 20 |
| Issue Type | Story |
| Parent | EP-02 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-20 |
| Start date | 23/10/2026 |
| Due date | 26/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T41, T46, T50 |
| Sprint thi công | S3, S4 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | BE, FE, Phòng chơi, QA & DevOps, Ván trực tuyến |
| Labels | EP-02, dac-ta, p1, phong-choi, van-truc-tuyen |
| Nguồn đặc tả (BA / AC) | 0.6, 0.7, 2.3, 3.6 |


**Description**

**Mục tiêu**

Bàn giao đặc tả việc xin đổi phe khi có hai người và tiếp tục dùng cùng phòng sau khi một ván kết thúc theo quy tắc đã duyệt.

**Bối cảnh công việc**

Đổi phe cần người kia đồng ý; ở lại sau ván giữ phòng và ghế, nhưng ván tiếp theo phải được bắt đầu lại bằng thao tác Sẵn sàng của cả hai. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Bối cảnh: Phòng đang chờ đủ hai người (vừa vào hoặc sau ván). Thao tác hoặc sự kiện: Xem cụm nút. Kết quả cần có: Cả hai người chơi có nút "Xin đổi bên"; người xem không có.
- Bối cảnh: A bấm "Xin đổi bên". Thao tác hoặc sự kiện: B nhận. Kết quả cần có: B thấy hộp đề nghị đổi phe đếm 30 giây với "Đồng ý"/"Từ chối"; A thấy trạng thái chờ và nút "Rút đề nghị".
- Bối cảnh: B bấm "Đồng ý". Thao tác hoặc sự kiện: Hệ thống. Kết quả cần có: Hai người hoán đổi Đỏ ↔ Đen; Sẵn sàng của cả hai về chưa sẵn sàng.
- Nếu người nhận từ chối hoặc hết 30 giây chưa trả lời, người gửi phải chờ 60 giây mới gửi lại được. Trong thời gian chờ, nút bị vô hiệu và chú thích hiển thị số giây còn lại.
- Bối cảnh: A đang có đề nghị chờ. Thao tác hoặc sự kiện: A bấm lại. Kết quả cần có: Không gửi được đề nghị thứ hai (tối đa 1 đề nghị chờ).
- Bối cảnh: Đề nghị đang chờ. Thao tác hoặc sự kiện: Cả hai Sẵn sàng và bắt đầu đếm, hoặc một người rời ghế. Kết quả cần có: Đề nghị tự huỷ.
- Bối cảnh: Đang đếm 3-2-1 hoặc đang ván. Thao tác hoặc sự kiện: Xem cụm nút. Kết quả cần có: Không có nút "Xin đổi bên".
- Ngay khi ván kết thúc, phòng về trạng thái chờ, cả hai trở về chưa sẵn sàng. Hộp kết quả có “Ở lại phòng” và “Rời phòng”.
- Bối cảnh: Bấm "Ở lại phòng". Thao tác hoặc sự kiện: Hệ thống. Kết quả cần có: Về phòng chờ; giữ nguyên ghế/phe, người xem, chế độ phòng, mức giờ, chủ phòng, Kênh Riêng và Kênh Chung.
- Khi cả hai sẵn sàng để chơi tiếp, tạo ván có mã mới và đặt hai đồng hồ lại đầy đủ theo mức giờ của phòng.
- Một người chơi bấm Rời phòng thì ghế đó trống và phòng vẫn chờ. Nếu người rời là chủ phòng, chuyển quyền cho người còn lại; phòng đang khoá vẫn giữ khoá.
- Bối cảnh: Sau ván, không ai rời. Thao tác hoặc sự kiện: 10 phút trôi qua. Kết quả cần có: Phòng không tự đóng.
- Bối cảnh: Người thứ hai vừa ngồi vào ghế còn lại. Thao tác hoặc sự kiện: Xem cụm nút. Kết quả cần có: Nút "Đổi ghế" biến mất, chỉ còn "Xin đổi bên"; người thứ hai rời ghế thì "Đổi ghế" xuất hiện lại.
- Bối cảnh: Hộp kết quả. Thao tác hoặc sự kiện: Nút. Kết quả cần có: Chỉ có "Ở lại phòng" và "Rời phòng" (không Tái đấu, không Xem lại).

**Việc cần làm**

- Đối soát gửi/rút/chấp nhận/từ chối/hết hạn đổi bên; đối chiếu bảng dữ liệu giữ lại hoặc đặt lại khi kết thúc ván, chơi tiếp và rời phòng.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát xin đổi bên 30 giây, chờ gửi lại 60 giây và ở lại phòng sau ván bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ xin đổi bên 30 giây, chờ gửi lại 60 giây và ở lại phòng sau ván; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.

**Phạm vi và phối hợp**

Không thêm nút tái đấu trực tiếp hoặc xem lại ván; không đóng phòng chỉ vì chờ lâu.

---

<a id="t41"></a>

#### T41 · BE Xin đổi bên và phòng về chờ sau ván

| Trường | Giá trị |
|---|---|
| Issue Id | 77 |
| Issue Type | Task |
| Parent | EP-02 |
| Assignee | Cường |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-77 |
| Start date | 25/10/2026 |
| Due date | 26/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 12 giờ |
| Remaining Estimate | 12 giờ |
| Story Points | 3 |
| Story (relates to) | US-02.2 |
| Is blocked by | T20, T37 |
| Component chính | BE |
| Components | BE, Phòng chơi, Ván trực tuyến |
| Labels | chinh-be, p1, phat-trien, phong-choi, sprint-3, van-truc-tuyen |
| Nguồn đặc tả (BA / AC) | 0.6, 0.7, 0.10, 0.17, 3.6 |


**Description**

**Mục tiêu**

Xử lý xin đổi bên và vòng đời phòng sau ván để hai người có thể tiếp tục chơi mà không tạo phòng mới.

**Bối cảnh công việc**

Phòng tự tạo có chủ phòng và hai ghế Đỏ/Đen. Khi ván đã kết thúc, phòng trở về chờ ngay; hộp kết quả chỉ là phần hiển thị, không phải trạng thái giữ phòng riêng.

**Yêu cầu cần đáp ứng**

- Khi đang chờ và đủ hai người ngồi ghế, mỗi người được gửi đề nghị đổi bên. Người nhận có 30 giây Đồng ý/Từ chối; người gửi được Rút đề nghị và chỉ có tối đa một đề nghị chờ.
- Đồng ý thì hoán đổi hai ghế và đưa cả hai về chưa sẵn sàng. Từ chối hoặc hết hạn buộc người gửi chờ 60 giây mới gửi lại. Bắt đầu đếm vào ván hoặc thay đổi người ngồi ghế phải huỷ đề nghị chờ.
- Không cho xin đổi bên khi đang đếm 3…2…1 hoặc đang đấu. Khi chỉ còn một người ngồi ghế, dùng đổi ghế tự do; không cần đối thủ duyệt.
- Kết thúc ván, kể cả ván bị gián đoạn do máy chủ khởi động lại, phòng về chờ và xoá trạng thái sẵn sàng. Giữ nguyên ghế/phe, chủ phòng, người xem, chế độ phòng, mức giờ và chat theo cặp hiện tại.
- Hai người sẵn sàng lại thì tạo ván có mã mới và đặt đồng hồ đầy đủ. Một người rời làm trống ghế; nếu là chủ phòng thì chuyển chủ cho người còn lại. Phòng đang khoá vẫn giữ khoá.
- Không tự đóng phòng sau 10 phút hoặc do chờ lâu; chỉ đóng khi không còn người ngồi ghế, đưa người xem về Sảnh và xoá chat phòng.

**Việc cần làm**

- Mỗi đề nghị lưu người gửi, người nhận, phòng, hạn trả lời và trạng thái xử lý; khi nhận Đồng ý, kiểm lại đúng đề nghị còn hạn, phòng đang chờ và vẫn cùng hai người ngồi ghế rồi mới hoán đổi ghế và phát trạng thái mới.
- Xây các thao tác gửi/rút/trả lời đổi bên và bộ đếm thời hạn phía máy chủ.
- Kết nối sự kiện kết thúc ván với trạng thái phòng chờ, bảo toàn dữ liệu cần giữ.
- Kiểm đề nghị quá hạn, đổi ghế, đếm bắt đầu, người rời và hai ván liên tiếp.

**Kết quả bàn giao**

- Xử lý đổi bên và phòng sau ván, kèm kiểm thử vòng đời.
- Mẫu sự kiện đề nghị và trạng thái phòng sau kết thúc, đủ cho giao diện cập nhật ghế/sẵn sàng.

**Điều kiện hoàn thành**

- Không còn đề nghị cũ sau đổi thành phần ghế; ván tiếp theo có mã mới; phòng không tự đóng khi còn người chơi.
- Phản hồi trùng, đến muộn hoặc gửi sau đổi người không hoán đổi thêm lần nữa. Kết thúc ván không xoá chat của cùng cặp và không tạo ván tiếp trước khi cả hai sẵn sàng.

**Phạm vi và phối hợp**

Không thêm nút tái đấu nhanh; người chơi dùng Sẵn sàng và Xin đổi bên để bắt đầu ván tiếp theo.

---

<a id="t46"></a>

#### T46 · FE hộp Xin đổi bên, Ở lại phòng / Rời phòng

| Trường | Giá trị |
|---|---|
| Issue Id | 82 |
| Issue Type | Task |
| Parent | EP-02 |
| Assignee | Nhạn |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-82 |
| Start date | 27/10/2026 |
| Due date | 27/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-02.2 |
| Is blocked by | T25, T41 |
| Component chính | FE |
| Components | FE, Phòng chơi, Ván trực tuyến |
| Labels | chinh-fe, p1, phat-trien, phong-choi, sprint-3, van-truc-tuyen |
| Nguồn đặc tả (BA / AC) | 0.6, 0.7, 0.17 |


**Description**

**Mục tiêu**

Dựng thao tác Xin đổi bên và lựa chọn sau ván để người chơi tiếp tục trong cùng phòng.

**Bối cảnh công việc**

Phòng đang chờ có thể có một hoặc hai người ngồi ghế. Sau khi kết thúc ván, phòng đã trở lại chờ; hộp kết quả giúp người chơi chọn ở lại hay rời đi.

**Yêu cầu cần đáp ứng**

- Chỉ một người ngồi ghế thì có Đổi ghế tự do. Khi đủ hai người, ẩn Đổi ghế và hiện Xin đổi bên cho hai người chơi; người xem không có các thao tác này.
- Người nhận đề nghị đổi bên thấy Đồng ý/Từ chối và đếm 30 giây. Người gửi thấy đang chờ và Rút đề nghị; không gửi thêm đề nghị khi đang chờ.
- Đồng ý làm đổi ghế và cả hai trở về chưa sẵn sàng theo dữ liệu máy chủ. Từ chối hoặc hết hạn làm nút xin lại bị vô hiệu trong 60 giây, giải thích thời gian còn chờ.
- Ẩn Xin đổi bên trong lúc đếm 3…2…1 hoặc đang đấu. Khi máy chủ huỷ đề nghị vì bắt đầu đếm hay đổi người ngồi ghế, đóng trạng thái chờ ở cả hai phía.
- Hộp kết quả trực tuyến có đúng Ở lại phòng/Rời phòng, kể cả ván bị gián đoạn do máy chủ khởi động lại. Không có Tái đấu/Xem lại và không hiển thị đếm đóng phòng sau 10 phút.
- Ở lại phòng đưa người chơi về giao diện chờ, giữ phe và các thông tin phòng. Rời phòng cập nhật ghế trống và chủ phòng theo phản hồi máy chủ; không tự đổi chế độ khoá.

**Việc cần làm**

- Dùng trạng thái phòng, thành phần ghế, người gửi/nhận và thời hạn từ máy chủ để dựng nút và hộp đổi bên; tính phần thời gian còn lại từ hạn đã nhận, không bắt đầu lại 30 hoặc 60 giây khi đóng/mở giao diện.
- Dựng nút theo số người, hộp nhận đề nghị, trạng thái phía gửi và đồng hồ chờ.
- Nối kết quả đổi bên và lựa chọn sau ván; xử lý cập nhật máy chủ đến trong khi hộp đang mở.
- Thử bằng hai trình duyệt: đồng ý, từ chối, hết hạn, rút, bắt đầu đếm và một người rời.

**Kết quả bàn giao**

- Giao diện đổi bên và kết quả sau ván tích hợp với phòng chờ.
- Bằng chứng hộp kết quả gián đoạn, bộ đếm đề nghị và dữ liệu ghế sau Đồng ý/Từ chối.

**Điều kiện hoàn thành**

- Hai bên thấy cùng trạng thái ghế/sẵn sàng; không còn đề nghị cũ khi máy chủ đã huỷ; lựa chọn sau ván đúng.
- Ở lại phòng chỉ đóng lớp kết quả để thấy phòng đang chờ; không gửi tạo ván hoặc đổi phe. Ván bị gián đoạn có nội dung trung tính, không gán thắng/thua/hoà cho người chơi.

**Phạm vi và phối hợp**

Phần này không tạo cơ chế tái đấu mới và không tự xử thời hạn; máy chủ quản lý đổi ghế, mã ván và vòng đời phòng.

---

<a id="t50"></a>

#### T50 · Kiểm thử US-02.2

| Trường | Giá trị |
|---|---|
| Issue Id | 86 |
| Issue Type | Task |
| Parent | EP-02 |
| Assignee | Kỳ |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-86 |
| Start date | 31/10/2026 |
| Due date | 31/10/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 4 giờ |
| Remaining Estimate | 4 giờ |
| Story Points | 1 |
| Story (relates to) | US-02.2 |
| Is blocked by | T46 |
| Component chính | QA & DevOps |
| Components | Phòng chơi, QA & DevOps, Ván trực tuyến |
| Labels | chinh-qa-devops, kiem-thu, p1, phong-choi, sprint-4, van-truc-tuyen |
| Nguồn đặc tả (BA / AC) | 0.6, 0.7, 0.10, 0.17 |


**Description**

**Mục tiêu**

Kiểm chứng xin đổi phe và bắt đầu ván tiếp theo trong cùng phòng.

**Bối cảnh công việc**

Chuẩn bị hai người chơi cùng một người xem trong phòng tự tạo. Có thế cờ gần kết thúc để chuyển nhanh từ đang đấu sang chờ; giữ lại thông tin ghế, đồng hồ và người xem nhằm đối chiếu trước và sau thao tác.

**Yêu cầu cần đáp ứng**

- Khi phòng chờ đủ hai người, kể cả sau ván, cả hai có Xin đổi bên; người xem không có. Chỉ một chủ ngồi thì có Đổi ghế tự do; người thứ hai vào thì thay bằng Xin đổi bên, rời thì Đổi ghế xuất hiện lại.
- Gửi đề nghị: người nhận có Đồng ý/Từ chối và hạn 30 giây; người gửi thấy đang chờ và Rút đề nghị. Người gửi không tạo được đề nghị chờ thứ hai.
- Đồng ý hoán đổi Đỏ/Đen, đặt lại Sẵn sàng của cả hai. Từ chối hoặc hết 30 giây thì người gửi phải chờ 60 giây mới gửi lại, giao diện nêu thời gian còn lại.
- Bắt đầu đếm hoặc đổi thành phần ghế tự huỷ đề nghị. Trong đếm 3–2–1 và trong ván không có Xin đổi bên.
- Kết thúc ván phòng tự tạo về chờ ngay, đặt lại Sẵn sàng; kết quả chỉ có Ở lại phòng/Rời phòng, không Tái đấu hoặc Xem lại.
- Hai người Sẵn sàng tạo ván mới với mã mới và đồng hồ đầy đủ theo phòng. Không ai rời sau ván thì quá 10 phút phòng vẫn tồn tại.

**Việc cần làm**

- Chụp trạng thái hai ghế, chủ phòng, người xem, chế độ, mức giờ và tin hai kênh trước khi kết thúc ván; dùng cùng phòng để kiểm giữ dữ liệu qua kết quả, đổi bên và ván kế tiếp.
- Tạo phòng có hai người chơi, một người xem; thử trạng thái một ghế rồi đủ hai ghế để đối chiếu hai nút đổi phe.
- Chạy riêng đồng ý, từ chối, hết hạn, rút và bấm trùng; ghi thời điểm 30 giây và 60 giây cùng trạng thái sẵn sàng.
- Gửi đề nghị rồi bắt đầu đếm hoặc cho một người rời, kiểm đề nghị bị huỷ cả hai phía.
- Kết thúc ván, ở lại hơn 10 phút rồi sẵn sàng vào ván mới; đối chiếu mã ván, đồng hồ, ghế và các nút kết quả.
- Ghi từng ca là Đạt, Không đạt hoặc Chưa kiểm được cùng dữ liệu, thời điểm và bằng chứng đã che bí mật. Báo lỗi có cách tái hiện; sau sửa chạy lại ca lỗi và các nhánh liên quan.

**Kết quả bàn giao**

- Bộ ca kiểm có bước chạy, dữ liệu và kết quả mong đợi để thành viên khác thực hiện lại được.
- Bảng kết quả thực tế cùng bằng chứng và danh sách lỗi còn mở; các lượt kiểm lại giữ được liên hệ với lỗi ban đầu.

**Điều kiện hoàn thành**

- Mọi tình huống nêu trên có kết quả đúng và bằng chứng lặp lại được; sai quyền, sai kết quả hoặc sai hạn thời gian phải ghi Không đạt, chưa được kết luận hoàn tất.
- Thiếu thiết bị, thiếu dữ liệu hoặc lỗi của phần tích hợp phải ghi rõ là Chưa kiểm được; việc người phụ trách biết vấn đề không thay thế kết quả đạt.
- Sau ván và sau đổi bên cùng cặp, chat riêng còn nguyên; thay người thì tin cặp cũ không xuất hiện. Một người rời chuyển chủ nếu cần, người cuối rời đóng phòng và đưa người xem về Sảnh.

**Phạm vi và phối hợp**

Công việc này chuẩn bị và thực hiện kiểm thử cho phạm vi trên. Người triển khai chức năng chịu trách nhiệm sửa lỗi; kết quả kiểm cục bộ không thay thế việc nghiệm thu toàn bộ sản phẩm.

---

<a id="ep-03"></a>

## EP-03 · Mời vào phòng

| Trường | Giá trị |
|---|---|
| Issue Id | 4 |
| Issue Type | Epic |
| Parent | — |
| Assignee | Tình |
| Reporter | Tình |
| Priority | Medium |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-4 |
| Start date | 18/10/2026 |
| Due date | 25/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Component chính | Tổng hợp phạm vi các Task |
| Components | Bạn bè, BE, FE, Phòng chơi, QA & DevOps |
| Labels | EP-03, ban-be, dac-ta, p1, phong-choi |
| Nguồn đặc tả (BA / AC) | 0.3, 2.2, 2.4, 2.5, 2.6, 2.7, 2.8, 5.5, 11 |


**Description**

**Mục tiêu**

Bàn giao bộ đặc tả đã duyệt về lời mời phòng và quan hệ bạn bè; bảo đảm các đặc tả thành phần nhất quán khi triển khai.

**Bối cảnh công việc**

Người được mời không cần kết bạn nếu dùng mã/đường dẫn. Quan hệ bạn bè và lời mời vào phòng có vòng đời, giới hạn và giao diện riêng. Các quyết định sản phẩm đã có hiệu lực; nhóm chức năng này tổng hợp và truy vết yêu cầu, không mở một vòng quyết định hoặc duyệt lại phạm vi.

**Yêu cầu cần đáp ứng**

- Người ngồi ghế chia sẻ mã tám ký tự/đường dẫn; người chưa đăng nhập được đăng nhập, đăng ký hoặc vào bằng Khách rồi tự tiếp tục tới phòng. Máy chủ kiểm lại quyền và sức chứa, xếp ghế trống hoặc chỗ xem.
- Tìm bạn theo tên đăng nhập không phân biệt hoa thường, kết bạn hai chiều; tối đa 200 bạn và 50 lời mời chờ, hết hạn 30 ngày, bị từ chối hai lần thì không gửi lại được.
- Chỉ mời bạn trực tuyến từ một phòng, lời mời 30 giây không giữ chỗ và không lưu trong chuông. Trang Bạn bè không có nút mời phòng; Khách không tham gia quan hệ bạn bè.

**Việc cần làm**

- Đối chiếu các đặc tả thành phần về lời mời phòng và quan hệ bạn bè với quyết định hiện hành; kiểm đầy đủ luồng, quyền, giới hạn và ngoại lệ nêu trên.
- Rà các điểm giao với nhóm chức năng khác, gắn yêu cầu với công việc triển khai và tình huống kiểm thử; sửa sai lệch theo nguồn nghiệp vụ ưu tiên.
- Theo dõi độ đầy đủ của hồ sơ thành phần và bằng chứng phải bổ sung; mâu thuẫn chưa giải được theo thứ tự ưu tiên nguồn cần báo người phụ trách sản phẩm, không tự sửa quyết định đã duyệt.

**Kết quả bàn giao**

- Bản tổng hợp đối soát lời mời phòng và quan hệ bạn bè, kèm truy vết tới đặc tả thành phần và quyết định nguồn.
- Danh sách điểm giao, tình huống nghiệm thu và sai lệch cần xử lý; bằng chứng kỹ thuật được quản lý tại công việc triển khai/kiểm chứng liên quan.

**Điều kiện hoàn thành**

- Các đặc tả thành phần phản ánh đúng lời mời phòng và quan hệ bạn bè theo yêu cầu bên trên và thống nhất tại các điểm giao.
- Hồ sơ hoàn tất theo đặc tả thành phần cuối cùng, không yêu cầu người phụ trách sản phẩm duyệt lại quy tắc đã chốt. Kết quả chạy phần mềm và kiểm thử chỉ được ghi nhận khi có bằng chứng riêng.

**Phạm vi và phối hợp**

Không làm nhắn tin riêng, thách đấu hoặc mời qua mã ảnh để quét.

---

<a id="us-03.1"></a>

### US-03.1 · Mời bằng link/mã và vào phòng

| Trường | Giá trị |
|---|---|
| Issue Id | 21 |
| Issue Type | Story |
| Parent | EP-03 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-21 |
| Start date | 20/10/2026 |
| Due date | 23/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T22, T26, T29 |
| Sprint thi công | S2, S3 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | BE, FE, Phòng chơi, QA & DevOps |
| Labels | EP-03, dac-ta, p1, phong-choi |
| Nguồn đặc tả (BA / AC) | 0.3, 2.2, 2.4, 2.6, 2.8 |


**Description**

**Mục tiêu**

Bàn giao đặc tả cách chia sẻ và vào phòng bằng đường dẫn hoặc mã để người chưa kết bạn vẫn có thể tham gia theo quy tắc đã duyệt.

**Bối cảnh công việc**

Người vào phòng được xếp ghế còn trống hoặc làm người xem nếu hai ghế đã đủ. Người chưa đăng nhập phải quay lại đúng phòng sau khi xác thực. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Bối cảnh: Người chơi trong phòng. Thao tác hoặc sự kiện: Mở "Chia sẻ phòng". Kết quả cần có: Thấy đường dẫn và mã 8 ký tự (chữ có các ký tự rộng bằng nhau) với nút Sao chép; bản bàn giao đầu tiên không có mã ảnh để quét.
- Bối cảnh: Đã đăng nhập. Thao tác hoặc sự kiện: Mở đường dẫn mời hoặc nhập mã ở Sảnh. Kết quả cần có: Vào phòng ngay, không cần kết bạn với chủ phòng.
- Người chưa đăng nhập mở đường dẫn mời sẽ tới màn hình Đăng nhập/Đăng ký. Sau khi đăng nhập, đăng ký hoặc vào bằng Khách thành công, tự tiếp tục vào đúng phòng được mời, không yêu cầu mở đường dẫn lần hai.
- Bối cảnh: Vào phòng. Thao tác hoặc sự kiện: Còn ghế trống. Kết quả cần có: Được xếp vào ghế trống (chủ phòng Đỏ → vào Đen và ngược lại).
- Bối cảnh: Vào phòng. Thao tác hoặc sự kiện: Hai ghế đã kín, còn chỗ xem. Kết quả cần có: Vào làm Người xem, thông báo "Ghế đấu đã đủ 2 người, bạn đang tham gia phòng với vai trò Người xem.".
- Bối cảnh: Vào phòng. Thao tác hoặc sự kiện: Phòng đã đủ sức chứa (hoặc "Không có người xem" và đủ 2 ghế). Kết quả cần có: màn hình thông báo không được vào phòng: "Phòng thi đấu đã đầy người, vui lòng chọn phòng khác!" + nút "Quay về Sảnh chính".
- Bối cảnh: Mã sai hoặc phòng đã đóng. Thao tác hoặc sự kiện: Nhập mã. Kết quả cần có: Báo "Mã phòng không tồn tại hoặc phòng đã đóng".

**Việc cần làm**

- Đối chiếu sao chép lời mời, nhập mã và điểm đến sau đăng nhập/đăng ký/Khách; giữ đúng các nhánh ghế trống, chỗ xem, phòng đầy, phòng đóng và mã sai.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát mã tám ký tự, đường dẫn mời, quay lại sau xác thực và xếp ghế theo sức chứa bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ mã tám ký tự, đường dẫn mời, quay lại sau xác thực và xếp ghế theo sức chứa; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.

**Phạm vi và phối hợp**

Không tạo mã ảnh để quét; quyền vào vẫn phụ thuộc trạng thái phòng và vị trí chơi hiện tại.

---

<a id="t22"></a>

#### T22 · BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập

| Trường | Giá trị |
|---|---|
| Issue Id | 58 |
| Issue Type | Task |
| Parent | EP-03 |
| Assignee | Tùng |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-58 |
| Start date | 22/10/2026 |
| Due date | 23/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 12 giờ |
| Remaining Estimate | 12 giờ |
| Story Points | 3 |
| Story (relates to) | US-03.1 |
| Is blocked by | T09, T18 |
| Component chính | BE |
| Components | BE, Phòng chơi |
| Labels | chinh-be, p1, phat-trien, phong-choi, sprint-2 |
| Nguồn đặc tả (BA / AC) | 0.3, 1.8, 2.4, 2.6, 2.7, 2.8 |


**Description**

**Mục tiêu**

Cho người dùng vào đúng phòng bằng mã hoặc đường dẫn và tự tiếp tục sau đăng nhập, đồng thời máy chủ xếp vai trò theo chỗ còn trống.

**Bối cảnh công việc**

Người nhận đường dẫn không cần kết bạn với chủ. Giữ đích phòng qua đăng nhập, đăng ký hoặc vào Khách.

**Yêu cầu cần đáp ứng**

- Mã 8 ký tự và đường dẫn cho cùng quyền tham gia; kiểm mã/phòng còn hiệu lực trên máy chủ.
- Còn ghế thì xếp ngay vào ghế trống đúng phe đối diện người đang ngồi.
- Hai ghế kín thì vào làm người xem nếu còn chỗ, báo “Ghế đấu đã đủ 2 người, bạn đang tham gia phòng với vai trò Người xem.”
- Đủ sức chứa hoặc không cho xem và đã kín ghế thì từ chối, báo “Phòng thi đấu đã đầy người, vui lòng chọn phòng khác!”.
- Mã sai hoặc phòng đóng báo “Mã phòng không tồn tại hoặc phòng đã đóng”.
- Chưa đăng nhập thì giữ đích phòng; sau xác thực thành công tự thử vào, không yêu cầu bấm đường dẫn lần nữa.
- Trước khi vào phải kiểm vị trí chơi hiện có, khoá phòng và danh sách người bị chặn; người đang chơi không được tạo thêm vị trí. Khi các chức năng khoá/chặn được nối vào, chúng phải áp dụng cho cả mã và đường dẫn.

**Việc cần làm**

- Tạo xử lý tra mã/đường dẫn về phòng và kiểm hiệu lực.
- Xếp ghế hoặc vai trò xem trong một thao tác nhất quán để hai yêu cầu gần nhau không chiếm cùng chỗ.
- Trả vai trò, trạng thái và lời báo phù hợp cho giao diện.
- Thiết kế dữ liệu giữ đích qua đăng nhập/đăng ký/Khách mà không bỏ qua kiểm quyền lúc quay lại.
- Viết thử ghế trống, ghế kín còn xem, đầy, phòng không cho xem và mã sai.
- Thử hai yêu cầu cùng ghế và tình huống phòng đổi trạng thái trong lúc người dùng đăng nhập.

**Kết quả bàn giao**

- Xử lý tham gia bằng mã/đường dẫn.
- Cơ chế giữ đích sau xác thực.
- Kiểm tích hợp phân vai và sức chứa.
- Hợp đồng tham gia nhận mã/đích phòng và danh tính đã xác thực, trả ghế/phe hoặc vai trò xem, trạng thái mới và lý do từ chối; không dùng dữ liệu đích chờ để cấp quyền.

**Điều kiện hoàn thành**

- Người chưa kết bạn vẫn vào phòng hợp lệ.
- Chỉ một người nhận ghế cuối khi yêu cầu gần nhau; người còn lại được xếp xem hoặc từ chối đúng sức chứa.
- Hoàn tất đăng nhập quay lại đúng phòng nhưng vẫn kiểm lại phòng/quyền hiện thời.
- Luật phiên được ưu tiên: đăng nhập thiết bị khác đang có ván không bị chuyển thẳng vào phòng mời bỏ qua xử lý ván cũ.
- Phòng chuyển khoá hoặc đóng trong lúc xác thực không được vào theo dữ liệu cũ; phòng đầy khi quay lại báo đầy thay vì giữ ghế ảo.

**Phạm vi và phối hợp**

Bàn giao xử lý cho giao diện nhập mã/chia sẻ và lối vào Sảnh. Công khai, khóa và chặn người xem có phần triển khai riêng nhưng phải dùng cùng kiểm quyền tham gia.

---

<a id="t26"></a>

#### T26 · FE Chia sẻ phòng, nhập mã ở Sảnh, tự vào phòng sau đăng nhập

| Trường | Giá trị |
|---|---|
| Issue Id | 62 |
| Issue Type | Task |
| Parent | EP-03 |
| Assignee | Cường |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-62 |
| Start date | 24/10/2026 |
| Due date | 24/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-03.1 |
| Is blocked by | T21, T22 |
| Component chính | FE |
| Components | FE, Phòng chơi |
| Labels | chinh-fe, p1, phat-trien, phong-choi, sprint-3 |
| Nguồn đặc tả (BA / AC) | 0.3, 2.4, 2.6, 2.7, 2.8 |


**Description**

**Mục tiêu**

Cho người dùng chia sẻ phòng bằng đường dẫn hoặc mã và vào đúng phòng sau đăng nhập.

**Bối cảnh công việc**

Người được mời không bắt buộc là bạn của chủ phòng. Hai người ngồi ghế mới thấy nút Chia sẻ phòng; người xem chỉ theo dõi và không có nút này.

**Yêu cầu cần đáp ứng**

- Hộp Chia sẻ phòng hiển thị đường dẫn, mã 8 ký tự và nút Sao chép cho từng nội dung. Mã dùng kiểu chữ có các ký tự rộng bằng nhau để dễ đọc; chưa có mã quét bằng camera.
- Sảnh có ô nhập mã. Khi mở đường dẫn lúc chưa đăng nhập, giữ lại đích đến trong quá trình đăng nhập hoặc đăng ký để tự vào phòng, không bắt mở lời mời lần nữa.
- Dùng kết quả phân chỗ từ máy chủ: còn ghế thì ngồi ghế trống; đủ hai ghế và còn chỗ xem thì vào xem; phòng đầy thì từ chối. Không tự quyết định vai trò dựa vào thông tin cũ trên trình duyệt.
- Khi chuyển sang người xem, báo “Ghế đấu đã đủ 2 người, bạn đang tham gia phòng với vai trò Người xem.” Phòng đầy báo “Phòng thi đấu đã đầy người, vui lòng chọn phòng khác!” và có nút “Quay về Sảnh chính”. Mã sai hoặc phòng đóng báo “Mã phòng không tồn tại hoặc phòng đã đóng”.
- Người mở lời mời chưa đăng nhập có thể chọn Khách rồi tự tiếp tục vào phòng; giữ cùng đích chờ cho cả đăng nhập, đăng ký và Khách.

**Việc cần làm**

- Dựng hộp chia sẻ, thao tác sao chép và ô nhập mã; có phản hồi thành công hoặc lỗi dễ hiểu.
- Nối luồng vào phòng và chuyển hướng sau xác thực; khoá thao tác lặp khi đang xử lý.
- Kiểm đường dẫn trên hai trình duyệt, gồm đăng ký mới, đăng nhập lại, ghế vừa được người khác lấy và phòng không còn mở.

**Kết quả bàn giao**

- Giao diện chia sẻ và vào phòng nối máy chủ thật, xử lý đầy đủ thông báo và đường quay về Sảnh.

**Điều kiện hoàn thành**

- Người chưa kết bạn vào được bằng mã hoặc đường dẫn hợp lệ; vai trò và thông báo khớp sức chứa thực tế.
- Thử sao chép thành công và khi trình duyệt từ chối; lỗi không báo đã sao chép.
- Sau đăng ký hoặc vào Khách, không phải mở lại lời mời; máy chủ báo đầy/đóng thì hiện đúng thông báo và đường về Sảnh.

**Phạm vi và phối hợp**

Phần này phụ trách giao diện đường dẫn và mã; danh sách bạn bè để gửi lời mời trong ứng dụng là phần việc riêng.

---

<a id="t29"></a>

#### T29 · Kiểm thử US-03.1

| Trường | Giá trị |
|---|---|
| Issue Id | 65 |
| Issue Type | Task |
| Parent | EP-03 |
| Assignee | Nhạn |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-65 |
| Start date | 25/10/2026 |
| Due date | 25/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-03.1 |
| Is blocked by | T08, T15, T26, T35 |
| Component chính | QA & DevOps |
| Components | Phòng chơi, QA & DevOps |
| Labels | chinh-qa-devops, kiem-thu, p1, phong-choi, sprint-3 |
| Nguồn đặc tả (BA / AC) | 0.3, 1.8, 2.4, 2.6, 2.7, 2.8 |


**Description**

**Mục tiêu**

Kiểm chứng lời mời bằng đường dẫn hoặc mã đưa người dùng vào đúng phòng, đúng vai trò.

**Bối cảnh công việc**

Dùng ít nhất hai tài khoản chưa kết bạn và nhiều cửa sổ trình duyệt. Chuẩn bị phòng còn ghế, phòng đủ ghế còn chỗ xem, phòng đầy, phòng không cho xem và phòng đã đóng.

**Yêu cầu cần đáp ứng**

- Người ngồi ghế mở Chia sẻ phòng phải thấy đường dẫn và mã 8 ký tự cùng nút sao chép. Nội dung sao chép phải dùng được; không có chức năng mã quét bằng camera.
- Người đã đăng nhập mở đường dẫn hoặc nhập mã phải vào được, không bị yêu cầu kết bạn. Khi chủ phòng ngồi Đỏ, người mới vào ghế Đen; đổi chủ phòng sang ghế Đen rồi thử lại để kiểm chiều ngược lại.
- Người chưa đăng nhập mở lời mời phải được dẫn tới đăng nhập hoặc đăng ký; hoàn tất xong tự vào phòng ban đầu. Thử cả người có tài khoản và người tạo tài khoản bằng email mới.
- Đủ hai người chơi nhưng còn chỗ xem thì người mới thành người xem, có thông báo “Ghế đấu đã đủ 2 người, bạn đang tham gia phòng với vai trò Người xem.”
- Phòng đầy hoặc không cho xem mà đã đủ hai ghế phải hiện “Phòng thi đấu đã đầy người, vui lòng chọn phòng khác!” và nút “Quay về Sảnh chính”. Mã sai hoặc phòng đã đóng phải báo “Mã phòng không tồn tại hoặc phòng đã đóng”.

**Việc cần làm**

- Ghi tiền điều kiện, cách tạo phòng và sức chứa cho từng trường hợp để người khác chạy lại được.
- Thử vào bằng cả đường dẫn và mã, gồm việc phòng đổi số người trong lúc người được mời đang đăng nhập.
- Lưu kết quả, ảnh thông báo và lỗi chuyển hướng; kiểm lại mọi lỗi đã sửa.
- Cho hai người cùng vào ghế cuối bằng mã và đường dẫn; đối chiếu người nhận ghế, người được xếp xem hoặc báo đầy, không chấp nhận kết quả chỉ nhìn ở một trình duyệt.
- Kiểm phòng đóng hoặc chuyển khoá trong lúc người nhận xác thực; xác minh đích chờ không bỏ qua trạng thái mới.

**Kết quả bàn giao**

- Bộ tình huống mời bằng đường dẫn/mã và báo cáo kết quả theo từng vai trò.

**Điều kiện hoàn thành**

- Không cần mở lời mời lần hai sau xác thực; máy chủ quyết định ghế hoặc chỗ xem theo trạng thái hiện tại.
- Mã sai, phòng đóng, đầy ghế còn chỗ xem và đầy toàn phòng có đúng vai trò/thông báo đã nêu; lưu bằng chứng riêng từng nhánh.

**Phạm vi và phối hợp**

Luồng chọn chế độ Khách từ lời mời được kiểm chuyên biệt trong phần kiểm Google và Khách; kiểm lời mời bạn bè trong ứng dụng là phần riêng.

---

<a id="us-03.2"></a>

### US-03.2 · Bạn bè và mời bạn online

| Trường | Giá trị |
|---|---|
| Issue Id | 22 |
| Issue Type | Story |
| Parent | EP-03 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-22 |
| Start date | 24/10/2026 |
| Due date | 27/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T31, T40, T49 |
| Sprint thi công | S3, S4 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | Bạn bè, BE, FE, QA & DevOps |
| Labels | EP-03, ban-be, dac-ta, p1 |
| Nguồn đặc tả (BA / AC) | 0.3, 2.5, 2.7, 5.5, 11 |


**Description**

**Mục tiêu**

Bàn giao đặc tả kết bạn và mời bạn đang trực tuyến vào phòng, với giới hạn rõ ràng và trạng thái cập nhật tự động theo quy tắc đã duyệt.

**Bối cảnh công việc**

Kết bạn là quan hệ lâu dài; lời mời vào phòng chỉ có hiệu lực ngắn và không nằm trong chuông thông báo. Hai loại lời mời phải được phân biệt. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Bối cảnh: Ở trang Bạn bè. Thao tác hoặc sự kiện: Gõ phần đầu tên đăng nhập (không phân biệt hoa thường). Kết quả cần có: Hiện kết quả gồm ảnh đại diện, tên hiển thị, @tên đăng nhập, nút "Kết bạn"; không hiện Khách.
- Bối cảnh: Chưa là bạn. Thao tác hoặc sự kiện: Bấm "Kết bạn". Kết quả cần có: Bên kia thấy lời mời ở thẻ "Lời mời kết bạn đang chờ" và ở chuông.
- Bối cảnh: Có lời mời đến. Thao tác hoặc sự kiện: Bấm "Chấp nhận" / "Từ chối". Kết quả cần có: Chấp nhận → cả hai thấy nhau trong danh sách bạn; Từ chối → lời mời biến mất.
- Bối cảnh: Đã gửi lời mời. Thao tác hoặc sự kiện: Bấm thu hồi. Kết quả cần có: Lời mời bị huỷ ở cả hai phía.
- Bối cảnh: Lời mời chờ quá 30 ngày. Thao tác hoặc sự kiện: Hệ thống kiểm. Kết quả cần có: Lời mời tự hết hạn.
- Bối cảnh: Đã có 200 bạn hoặc tổng lời mời chờ (gửi + nhận) = 50. Thao tác hoặc sự kiện: Gửi lời mời mới. Kết quả cần có: Bị chặn kèm lý do.
- Bối cảnh: A đã bị B từ chối 2 lần. Thao tác hoặc sự kiện: A gửi lại cho B. Kết quả cần có: Không gửi được.
- Bối cảnh: A và B gửi lời mời cho nhau gần như cùng lúc. Thao tác hoặc sự kiện: Máy chủ xử lý. Kết quả cần có: Chỉ giữ một lời mời, không tự thành bạn; bên nhận phải Chấp nhận.
- Bối cảnh: Danh sách bạn. Thao tác hoặc sự kiện: Bấm "Huỷ kết bạn". Kết quả cần có: Hai bên không còn trong danh sách của nhau.
- Bối cảnh: Bạn B mở ứng dụng (có kết nối). Thao tác hoặc sự kiện: A xem danh sách. Kết quả cần có: B hiện 🟢 Trực tuyến trong ≤ 5 giây, không cần tải lại.
- Bối cảnh: B ngồi ghế trong một phòng. Thao tác hoặc sự kiện: A xem danh sách. Kết quả cần có: B hiện 🟠 Đang đấu.
- Bối cảnh: B đóng mọi thẻ trình duyệt. Thao tác hoặc sự kiện: A xem danh sách. Kết quả cần có: B chuyển ⚫ Ngoại tuyến (sau khi hết thời gian nhận biết mất kết nối).
- Bối cảnh: Có lời mời kết bạn đang chờ. Thao tác hoặc sự kiện: Bấm chuông ở thanh điều hướng. Kết quả cần có: Liệt kê lời mời, có số đếm.
- Bối cảnh: Ở trang Bạn bè. Thao tác hoặc sự kiện: Nhìn nút "Nhắn tin", "Thách đấu". Kết quả cần có: không bấm được kèm chú thích "Sắp ra mắt"; trang không có nút mời vào phòng.
- Bối cảnh: Người dùng đang ngồi ghế phòng tự tạo. Thao tác hoặc sự kiện: Mở "Chia sẻ phòng". Kết quả cần có: Có thẻ bạn bè; người xem không thấy nút Chia sẻ.
- Bối cảnh: Danh sách bạn trong thẻ. Thao tác hoặc sự kiện: Xem nút "Mời". Kết quả cần có: 🟢 bấm được; ⚫ không bấm được nhãn "Ngoại tuyến"; 🟠 không bấm được chú thích "Bạn bè đang trong ván khác".
- Bối cảnh: Gửi mời cho bạn 🟢. Thao tác hoặc sự kiện: Bạn nhận. Kết quả cần có: thông báo nổi góc màn hình "Người chơi \[Tên\] mời bạn tham gia phòng cờ \[Tên phòng\]" với \[Tham gia\] \[Từ chối\], đếm lùi 30 giây.
- Người nhận bấm Tham gia trong thời hạn lời mời: máy chủ kiểm lại quyền vào và sức chứa; nhận ghế trống, hoặc làm người xem nếu hai ghế đã kín mà còn chỗ xem; nếu đầy thì hiện màn hình từ chối vào phòng.
- Bối cảnh: thông báo nổi. Thao tác hoặc sự kiện: Không bấm trong 30 giây hoặc bấm "Từ chối". Kết quả cần có: thông báo nổi biến mất, lời mời hết hiệu lực; không lưu vào chuông.
- Bối cảnh: Lời mời đã gửi, sau đó phòng chuyển sang khoá. Thao tác hoặc sự kiện: Người nhận bấm Tham gia. Kết quả cần có: Bị từ chối (lời mời chưa dùng đã bị thu hồi).
- Người nhận đang ngồi ghế phòng khác bấm Tham gia: từ chối chiếm ghế thứ hai và báo “Bạn đang ở trong một ván/phòng khác”.

**Việc cần làm**

- Đối soát tìm theo tên đăng nhập, kết bạn hai chiều, từ chối/thu hồi/hết hạn và trạng thái bạn; phân biệt lời mời phòng với chuông lời mời kết bạn.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát quan hệ bạn bè, giới hạn lời mời, trạng thái trực tuyến và mời vào phòng 30 giây bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ quan hệ bạn bè, giới hạn lời mời, trạng thái trực tuyến và mời vào phòng 30 giây; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.

**Phạm vi và phối hợp**

Không làm nhắn tin riêng hay thách đấu; không cho Khách tham gia quan hệ bạn bè.

---

<a id="t31"></a>

#### T31 · BE bạn bè, trạng thái online, mời bạn online vào phòng

| Trường | Giá trị |
|---|---|
| Issue Id | 67 |
| Issue Type | Task |
| Parent | EP-03 |
| Assignee | Tùng |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-67 |
| Start date | 26/10/2026 |
| Due date | 28/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 20 giờ |
| Remaining Estimate | 20 giờ |
| Story Points | 5 |
| Story (relates to) | US-03.2 |
| Is blocked by | T22, T35 |
| Component chính | BE |
| Components | Bạn bè, BE |
| Labels | ban-be, chinh-be, p1, phat-trien, sprint-3 |
| Nguồn đặc tả (BA / AC) | 0.3, 1.8, 2.5, 2.7, 2.8, 5.5 |


**Description**

**Mục tiêu**

Xây dựng xử lý phía máy chủ cho kết bạn, trạng thái hoạt động và mời bạn vào phòng.

**Bối cảnh công việc**

Tài khoản chính thức có tên đăng nhập để tìm nhau; Khách không dùng chức năng bạn bè. Lời mời kết bạn và lời mời vào phòng là hai loại khác nhau, có thời hạn và cách lưu riêng.

**Yêu cầu cần đáp ứng**

- Tìm theo phần đầu tên đăng nhập, không phân biệt hoa thường, không trả về Khách. Hỗ trợ gửi, chấp nhận, từ chối, thu hồi lời mời và huỷ kết bạn. Lời mời kết bạn hết hạn sau 30 ngày; giới hạn 200 bạn và 50 lời mời đang chờ gồm gửi và nhận.
- Bị cùng một người từ chối hai lần thì không được gửi lại cho người đó. Hai người gửi lời mời gần như đồng thời chỉ giữ một lời mời; không tự trở thành bạn khi chưa chấp nhận.
- Cung cấp trạng thái Trực tuyến, Đang đấu và Ngoại tuyến. Bạn vừa có kết nối phải hiện Trực tuyến trong không quá 5 giây; có vị trí chơi thì hiện Đang đấu; đóng mọi thẻ trình duyệt thì chuyển Ngoại tuyến sau thời gian nhận biết mất kết nối.
- Người ngồi ghế gửi lời mời phòng cho bạn Trực tuyến. Lời mời tồn tại 30 giây, có Tham gia/Từ chối, không lưu vào chuông thông báo sau hết hạn. Tham gia phải kiểm lại sức chứa, quyền vào phòng và việc người đó đã có vị trí chơi khác.
- Khoá phòng làm lời mời chưa dùng mất hiệu lực. Lời mời kết bạn đang chờ được cung cấp cho danh sách và chuông thông báo.

**Việc cần làm**

- Tạo các thao tác dữ liệu và kiểm quyền tại máy chủ; xử lý yêu cầu đồng thời để không vượt giới hạn hoặc nhân đôi lời mời.
- Phát thay đổi cho các trình duyệt liên quan và cung cấp dữ liệu cho màn Bạn bè, chuông và hộp mời phòng.
- Viết kiểm thử quyền Khách, giới hạn, thời hạn, từ chối lặp, gửi chéo và thu hồi lời mời phòng.

**Kết quả bàn giao**

- Dịch vụ bạn bè, trạng thái hoạt động và lời mời phòng; kiểm thử tự động kèm dữ liệu mẫu.
- Hợp đồng tìm kiếm, lời mời kết bạn và lời mời phòng: dữ liệu vào/ra, quyền gọi, thời điểm hết hạn, phản hồi bị giới hạn; mẫu sự kiện để danh sách, chuông và hộp mời cập nhật.

**Điều kiện hoàn thành**

- Không thể gửi lời mời trái quyền qua yêu cầu trực tiếp; trạng thái hai phía và thời hạn nhất quán.
- Gửi chéo chỉ có một lời mời chờ; từ chối hai lần, hết 30 ngày và giới hạn 200 bạn/50 lời mời được kiểm tại máy chủ.
- Lời mời phòng hết 30 giây hoặc bị thu hồi do khoá không dùng được; không lưu lời mời phòng đã hết hạn vào chuông.
- Một bạn vừa kết nối hiện Trực tuyến trong không quá 5 giây; ngồi ghế chuyển Đang đấu, đóng hết tab mới chuyển Ngoại tuyến sau nhận biết mất kết nối.

**Phạm vi và phối hợp**

Không làm nhắn tin riêng giữa bạn bè hoặc thách đấu từ màn Bạn bè trong phiên bản này; giao diện do phần việc khác thực hiện.

---

<a id="t40"></a>

#### T40 · FE màn Bạn bè, chuông, tab mời bạn bè, pop-up lời mời

| Trường | Giá trị |
|---|---|
| Issue Id | 76 |
| Issue Type | Task |
| Parent | EP-03 |
| Assignee | Cường |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-76 |
| Start date | 29/10/2026 |
| Due date | 30/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 12 giờ |
| Remaining Estimate | 12 giờ |
| Story Points | 3 |
| Story (relates to) | US-03.2 |
| Is blocked by | T31 |
| Component chính | FE |
| Components | Bạn bè, FE |
| Labels | ban-be, chinh-fe, p1, phat-trien, sprint-3 |
| Nguồn đặc tả (BA / AC) | 0.3, 2.5, 5.5 |


**Description**

**Mục tiêu**

Dựng màn Bạn bè và lời mời phòng để người dùng tìm bạn, thấy trạng thái và rủ bạn vào chơi.

**Bối cảnh công việc**

Tài khoản chính thức được kết bạn; Khách không có quyền này. Mời vào phòng xuất phát từ hộp Chia sẻ phòng của người đang ngồi ghế, không phải từ màn Bạn bè.

**Yêu cầu cần đáp ứng**

- Màn Bạn bè có tìm theo phần đầu tên đăng nhập, không phân biệt hoa thường; kết quả hiện ảnh đại diện chữ cái, tên hiển thị và tên đăng nhập để phân biệt người trùng tên. Có thao tác gửi lời mời và thu hồi lời mời đã gửi.
- Danh sách bạn hiện Trực tuyến, Đang đấu hoặc Ngoại tuyến bằng cả chữ và dấu nhận biết. Có huỷ kết bạn; thẻ Lời mời đang chờ có Chấp nhận/Từ chối. Chuông điều hướng hiển thị lời mời kết bạn và số đếm.
- Nhắn tin và Thách đấu hiện vô hiệu, giải thích “Sắp ra mắt”. Màn Bạn bè không có nút mời vào phòng.
- Trong hộp Chia sẻ phòng, thẻ Bạn bè chỉ dành cho tài khoản chính thức ngồi ghế. Bạn Trực tuyến có nút Mời; Ngoại tuyến không bấm được và ghi “Ngoại tuyến”; Đang đấu không bấm được, giải thích “Bạn bè đang trong ván khác”.
- Người nhận thấy thông báo “Người chơi \[Tên\] mời bạn tham gia phòng cờ \[Tên phòng\]” với Tham gia/Từ chối và đếm 30 giây. Hết hạn hoặc từ chối thì thông báo biến mất, không lưu vào chuông.
- Bấm Tham gia phải dùng kết quả kiểm phòng hiện tại của máy chủ; hiện thông báo phù hợp khi phòng đầy, bị khoá hoặc người nhận đang chơi nơi khác.

**Việc cần làm**

- Ánh xạ dữ liệu bạn bè, lời mời kết bạn, trạng thái hoạt động và lời mời phòng vào các vùng hiển thị riêng; dùng hạn trả lời do máy chủ cung cấp cho thông báo phòng, cập nhật danh sách và chuông sau mỗi phản hồi thành công.
- Dựng danh sách, tìm kiếm, các thao tác và trạng thái tải/rỗng/lỗi; cập nhật khi nhận thay đổi từ máy chủ.
- Nối chuông, thẻ Mời vào phòng và thông báo phía người nhận; ẩn phần bạn bè không dành cho Khách.
- Kiểm hai tài khoản thao tác qua lại, lời mời hết hạn và trạng thái nút theo bạn bè.

**Kết quả bàn giao**

- Giao diện quản lý bạn bè, chuông và mời bạn vào phòng.
- Bằng chứng giới hạn kết bạn, thông báo hết hạn và cập nhật đồng thời hai tài khoản.

**Điều kiện hoàn thành**

- Hai bên thấy kết quả nhất quán, lời mời phòng tự hết sau 30 giây, không có nút hoạt động sai quyền.
- Lỗi đạt 200 bạn, tổng 50 lời mời đang chờ hoặc đã bị cùng người từ chối hai lần phải hiện lý do từ máy chủ; không thêm bạn hay tăng số chuông trước khi thao tác được chấp nhận.

**Phạm vi và phối hợp**

Không xây dịch vụ dữ liệu bạn bè, chat riêng hoặc thách đấu; các quyết định quyền và sức chứa lấy từ máy chủ.

---

<a id="t49"></a>

#### T49 · Kiểm thử US-03.2

| Trường | Giá trị |
|---|---|
| Issue Id | 85 |
| Issue Type | Task |
| Parent | EP-03 |
| Assignee | Kỳ |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-85 |
| Start date | 01/11/2026 |
| Due date | 01/11/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-03.2 |
| Is blocked by | T34, T40, T53, T56 |
| Component chính | QA & DevOps |
| Components | Bạn bè, QA & DevOps |
| Labels | ban-be, chinh-qa-devops, kiem-thu, p1, sprint-4 |
| Nguồn đặc tả (BA / AC) | 0.3, 2.5, 5.5 |


**Description**

**Mục tiêu**

Kiểm chứng việc kết bạn, trạng thái hoạt động và mời bạn vào phòng.

**Bối cảnh công việc**

Chuẩn bị ít nhất ba tài khoản chính thức, một phiên Khách, phòng còn ghế và phòng đầy. Dùng nhiều trình duyệt để quan sát cả người gửi, người nhận và chủ phòng; dữ liệu giới hạn phải được tạo trước để có thể thử đúng điểm biên.

**Yêu cầu cần đáp ứng**

- Tìm bằng tiền tố tên đăng nhập, không phân biệt hoa thường: kết quả có ảnh đại diện, tên hiển thị, tên đăng nhập và Kết bạn; không có Khách. Gửi lời mời xuất hiện ở mục lời mời và chuông bên nhận.
- Chấp nhận tạo quan hệ ở cả hai phía; từ chối hoặc thu hồi xoá lời mời hai phía; quá 30 ngày tự hết hạn. Huỷ bạn loại nhau khỏi danh sách.
- Kiểm giới hạn 200 bạn và tổng 50 lời mời gửi/nhận đang chờ; vượt giới hạn bị chặn có lý do. Bị cùng một người từ chối hai lần thì không gửi lại được cho người đó.
- Hai người gửi cho nhau gần cùng lúc chỉ tạo một lời mời, không tự thành bạn. Người nhận phải chấp nhận.
- Bạn mở ứng dụng hiện Trực tuyến trong không quá 5 giây; ngồi ghế hiện Đang đấu; đóng mọi thẻ trình duyệt hiện Ngoại tuyến sau thời gian nhận biết mất kết nối. Chuông có số lời mời kết bạn đang chờ.
- Chỉ người ngồi ghế thấy Chia sẻ phòng và mời bạn Trực tuyến; Ngoại tuyến hoặc Đang đấu không mời được, có lý do. Trang Bạn bè không có nút mời vào phòng; Nhắn tin/Thách đấu bị vô hiệu kèm “Sắp ra mắt”.
- Lời mời phòng có tên người gửi/phòng, Tham gia/Từ chối, hạn 30 giây. Đồng ý thì kiểm lại ghế và chỗ xem; hết chỗ báo đầy. Từ chối/hết hạn đóng thông báo, không lưu trong chuông.
- Lời mời gửi trước lúc phòng khoá phải bị từ chối khi dùng sau khoá. Người đang giữ ghế nơi khác không chiếm ghế thứ hai; máy chủ báo “Bạn đang ở trong một ván/phòng khác”.

**Việc cần làm**

- Ghi trạng thái quan hệ và số bạn/lời mời của cả hai bên trước ca biên; tách lời mời kết bạn có hạn 30 ngày khỏi thông báo mời phòng có hạn 30 giây trong dữ liệu và báo cáo.
- Tạo dữ liệu 199/200 bạn và 49/50 lời mời tổng gửi/nhận, cùng lời mời gần hạn 30 ngày; ghi trạng thái ban đầu để thử đúng biên.
- Dùng hai trình duyệt lần lượt gửi, nhận, từ chối hai lần, thu hồi, gửi ngược chiều đồng thời và huỷ bạn; kiểm dữ liệu cả hai phía.
- Đo đổi trạng thái bạn; từ phòng gửi lời mời rồi chấp nhận, từ chối, để hết 30 giây và thử dùng sau khi khoá phòng.
- Thử tài khoản đang chơi nơi khác, Khách và người xem để kiểm quyền bằng giao diện lẫn yêu cầu máy chủ.
- Ghi từng ca là Đạt, Không đạt hoặc Chưa kiểm được cùng dữ liệu, thời điểm và bằng chứng đã che bí mật. Báo lỗi có cách tái hiện; sau sửa chạy lại ca lỗi và các nhánh liên quan.

**Kết quả bàn giao**

- Bộ ca kiểm có bước chạy, dữ liệu và kết quả mong đợi để thành viên khác thực hiện lại được.
- Bảng kết quả thực tế cùng bằng chứng và danh sách lỗi còn mở; các lượt kiểm lại giữ được liên hệ với lỗi ban đầu.

**Điều kiện hoàn thành**

- Mọi tình huống nêu trên có kết quả đúng và bằng chứng lặp lại được; sai quyền, sai kết quả hoặc sai hạn thời gian phải ghi Không đạt, chưa được kết luận hoàn tất.
- Thiếu thiết bị, thiếu dữ liệu hoặc lỗi của phần tích hợp phải ghi rõ là Chưa kiểm được; việc người phụ trách biết vấn đề không thay thế kết quả đạt.
- Hai yêu cầu kết bạn ngược chiều không tự tạo quan hệ; ca tổng 50 lời mời phải tính cả gửi và nhận. Thông báo phòng hết hạn không làm tăng số lời mời trong chuông.

**Phạm vi và phối hợp**

Công việc này chuẩn bị và thực hiện kiểm thử cho phạm vi trên. Người triển khai chức năng chịu trách nhiệm sửa lỗi; kết quả kiểm cục bộ không thay thế việc nghiệm thu toàn bộ sản phẩm.

---

<a id="ep-04"></a>

## EP-04 · Khởi tạo bàn cờ

| Trường | Giá trị |
|---|---|
| Issue Id | 5 |
| Issue Type | Epic |
| Parent | — |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-5 |
| Start date | 07/10/2026 |
| Due date | 14/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Component chính | Tổng hợp phạm vi các Task |
| Components | Bàn cờ, BE, FE, Luật cờ, QA & DevOps |
| Labels | EP-04, ban-co, dac-ta, luat-co, p1 |
| Nguồn đặc tả (BA / AC) | 0.12, 0.17, 3.1, 3.4, 3.5, 10.1, 10.3 |


**Description**

**Mục tiêu**

Bàn giao bộ đặc tả đã duyệt về luật cờ dùng chung và thao tác bàn cờ; bảo đảm các đặc tả thành phần nhất quán khi triển khai.

**Bối cảnh công việc**

Bộ luật dùng chung quyết định nước hợp lệ; giao diện biểu diễn bàn 9×10, quân chữ Hán, chọn/kéo quân, cảnh báo và âm thanh. Các quyết định sản phẩm đã có hiệu lực; nhóm chức năng này tổng hợp và truy vết yêu cầu, không mở một vòng quyết định hoặc duyệt lại phạm vi.

**Yêu cầu cần đáp ứng**

- Bộ luật chung xác định nước hợp lệ, chiếu hết, hết nước đi, lặp thế ba lần và 120 nửa nước không ăn quân. Cùng thế gồm vị trí quân và bên tới lượt; chu kỳ từ lần một đến lần ba, bên chiếu mọi nước của mình thua, cả hai cùng chiếu thì hòa.
- Chiếu hết ưu tiên cao nhất; hết nước đi/chiếu liên tục ưu tiên trước hòa 120 nửa nước; đồng hồ được kiểm trước khi duyệt nước. Đuổi quân liên tục không có luật xử riêng.
- Bàn 9×10 có 32 quân chữ Hán, hỗ trợ bấm/kéo, lật theo phe, màn hình 360 điểm ảnh, dấu nước gần nhất, cảnh báo chiếu và âm thanh; quyền thao tác theo lượt/vai trò.

**Việc cần làm**

- Đối chiếu các đặc tả thành phần về luật cờ dùng chung và thao tác bàn cờ với quyết định hiện hành; kiểm đầy đủ luồng, quyền, giới hạn và ngoại lệ nêu trên.
- Rà các điểm giao với nhóm chức năng khác, gắn yêu cầu với công việc triển khai và tình huống kiểm thử; sửa sai lệch theo nguồn nghiệp vụ ưu tiên.
- Theo dõi độ đầy đủ của hồ sơ thành phần và bằng chứng phải bổ sung; mâu thuẫn chưa giải được theo thứ tự ưu tiên nguồn cần báo người phụ trách sản phẩm, không tự sửa quyết định đã duyệt.

**Kết quả bàn giao**

- Bản tổng hợp đối soát luật cờ dùng chung và thao tác bàn cờ, kèm truy vết tới đặc tả thành phần và quyết định nguồn.
- Danh sách điểm giao, tình huống nghiệm thu và sai lệch cần xử lý; bằng chứng kỹ thuật được quản lý tại công việc triển khai/kiểm chứng liên quan.

**Điều kiện hoàn thành**

- Các đặc tả thành phần phản ánh đúng luật cờ dùng chung và thao tác bàn cờ theo yêu cầu bên trên và thống nhất tại các điểm giao.
- Hồ sơ hoàn tất theo đặc tả thành phần cuối cùng, không yêu cầu người phụ trách sản phẩm duyệt lại quy tắc đã chốt. Kết quả chạy phần mềm và kiểm thử chỉ được ghi nhận khi có bằng chứng riêng.

**Phạm vi và phối hợp**

Dùng luật rút gọn của ứng dụng, không bổ sung toàn bộ luật giải đấu hoặc gợi ý chiến thuật.

---

<a id="us-04.1"></a>

### US-04.1 · Lõi luật cờ dùng chung

| Trường | Giá trị |
|---|---|
| Issue Id | 23 |
| Issue Type | Story |
| Parent | EP-04 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-23 |
| Start date | 09/10/2026 |
| Due date | 12/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T05, T07, T10 |
| Sprint thi công | S1 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | BE, Luật cờ |
| Labels | EP-04, dac-ta, luat-co, p1 |
| Nguồn đặc tả (BA / AC) | 0.12, 0.17, 3.1, 3.3, 3.5 |


**Description**

**Mục tiêu**

Bàn giao đặc tả một bộ luật cờ tướng dùng chung để máy chủ, bàn cờ và máy cờ cùng xác định nước đi và kết quả theo quy tắc đã duyệt.

**Bối cảnh công việc**

Ứng dụng dùng bộ luật rút gọn đã thống nhất. Một nửa nước là một lần đi quân của một bên; một thế gồm vị trí quân và bên tới lượt. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Từ thế khai cuộc, phải có đúng 44 nước hợp lệ. Đếm tất cả chuỗi hai nửa nước liên tiếp được 1.920 và ba nửa nước được 79.666; một nửa nước là một lượt đi của một bên. Phải đối chiếu số đếm đã được công bố trước khi dùng chúng làm đáp án kiểm thử.
- Bối cảnh: Bộ thế kiểm thử. Thao tác hoặc sự kiện: Sinh nước. Kết quả cần có: Đúng luật: cản chân Mã, chặn mắt Tượng, Tượng không qua sông, Sĩ/Tướng trong cung, Pháo cần đúng một ngòi khi ăn, Tốt qua sông được đi ngang và không lùi.
- Bối cảnh: Nước làm hai Tướng đối mặt không có quân chắn, hoặc để Tướng mình bị chiếu. Thao tác hoặc sự kiện: Kiểm tra. Kết quả cần có: Bị loại khỏi nước hợp lệ.
- Đến lượt một bên đang bị chiếu mà không còn nước hợp lệ, ván kết thúc: bên đó thua do chiếu hết.
- Đến lượt một bên không bị chiếu nhưng không còn nước hợp lệ, ván vẫn kết thúc với bên đó thua do hết nước đi.
- Bối cảnh: Một thế lặp lần thứ 3 trên nhánh nước hiệu lực. Thao tác hoặc sự kiện: Kiểm kết thúc. Kết quả cần có: hòa do lặp thế, trừ khi mọi nước của một bên trong chu kỳ đều là nước chiếu → thua do chiếu liên tục, bên chiếu thua; cả hai cùng chiếu liên tục → hoà.
- Bối cảnh: 120 nửa nước liên tiếp không ăn quân. Thao tác hoặc sự kiện: Kiểm kết thúc. Kết quả cần có: hòa do 120 nửa nước không ăn quân.
- Bối cảnh: Nước hợp lệ cuối đồng thời thoả điều kiện thắng/thua và hoà 120 nửa nước. Thao tác hoặc sự kiện: Kiểm kết thúc. Kết quả cần có: Chiếu hết ưu tiên cao nhất; hết nước đi và chiếu liên tục ưu tiên trước hoà 120 nửa nước. Đồng hồ được kiểm trước khi duyệt nước.
- Lưu một thế cờ thành chuỗi dữ liệu rồi đọc lại phải thu được đúng vị trí quân, bên tới lượt và các bộ đếm phục vụ xét kết quả.
- Bối cảnh: Hai thế có cùng vị trí mọi quân nhưng khác bên tới lượt. Thao tác hoặc sự kiện: Kiểm lặp thế. Kết quả cần có: Không tính là cùng một thế.
- Bối cảnh: Một thế xuất hiện lần thứ 3 trên nhánh nước hiệu lực. Thao tác hoặc sự kiện: Xác định chu kỳ để xét chiếu liên tục. Kết quả cần có: Chu kỳ gồm mọi nước từ lần xuất hiện thứ 1 đến lần thứ 3 của thế đó; bên chiếu ở mọi nước của mình trong chu kỳ là chiếu liên tục.

**Việc cần làm**

- Đối chiếu bộ thế và đáp án độc lập với luật đã duyệt, đặc biệt định nghĩa cùng thế, chu kỳ từ lần một đến lần ba và thắng/thua ưu tiên trước hòa 120 nửa nước.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát nước hợp lệ, chiếu hết, hết nước đi, chu kỳ lặp và ưu tiên kết quả bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ nước hợp lệ, chiếu hết, hết nước đi, chu kỳ lặp và ưu tiên kết quả; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.

**Phạm vi và phối hợp**

Không bổ sung luật xử riêng việc đuổi quân liên tục; không tuyên bố đây là toàn bộ luật thi đấu chính thức.

---

<a id="t05"></a>

#### T05 · Lõi luật cờ (1/3): bàn cờ và nước đi, ăn quân của 7 loại quân

| Trường | Giá trị |
|---|---|
| Issue Id | 41 |
| Issue Type | Task |
| Parent | EP-04 |
| Assignee | Tùng |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-41 |
| Start date | 11/10/2026 |
| Due date | 11/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-04.1 |
| Is blocked by | T01 |
| Component chính | BE |
| Components | BE, Luật cờ |
| Labels | chinh-be, luat-co, p1, phat-trien, sprint-1 |
| Nguồn đặc tả (BA / AC) | 3.1, 3.4, 3.5 |


**Description**

**Mục tiêu**

Biểu diễn bàn cờ và sinh nước đi cơ bản của cả bảy loại quân để làm nền cho bộ luật của máy chủ và máy cờ.

**Bối cảnh công việc**

Bàn cờ tướng có 9 cột, 10 hàng giao điểm và hai bên Đỏ/Đen. Bộ phận này xác định quân đi và ăn như thế nào; việc loại nước khiến Tướng mình bị chiếu được hoàn thiện ở phần kiểm an toàn Tướng. Cung là vùng ba cột, ba hàng quanh vị trí xuất phát của Tướng mỗi bên; sông chia hai nửa bàn. Chiếu nghĩa là Tướng đang bị quân đối phương đe doạ ăn theo cách đi của quân đó.

**Yêu cầu cần đáp ứng**

- Biểu diễn vị trí quân, bên tới lượt và dữ liệu cần giữ của một thế cờ; đọc và ghi lại phải không làm đổi thế. Dữ liệu cần giữ gồm cả bộ đếm phục vụ luật kết thúc ván; chuỗi ghi lại phải bảo toàn chúng.
- Tướng đi ngang hoặc dọc đúng một ô trong cung; Sĩ đi chéo đúng một ô trong cung. Không sinh nước ra ngoài bàn hoặc ăn quân cùng bên.
- Tượng đi chéo hai ô, không qua sông; mắt Tượng là giao điểm ở giữa đường chéo, có quân chắn tại đó thì không đi được.
- Xe đi thẳng ngang hoặc dọc qua các ô trống, dừng ở quân đầu tiên. Mã đi hai ô theo một hướng ngang hoặc dọc rồi một ô vuông góc, thành hình chữ L; chân Mã là ô liền kề theo hướng đi hai ô, có quân tại đó thì nước bị chặn.
- Pháo đi không ăn như Xe; khi ăn phải có đúng một quân làm ngòi giữa điểm đầu và mục tiêu.
- Tốt trước khi qua sông chỉ tiến một ô; sau khi qua sông được tiến hoặc đi ngang một ô, không bao giờ đi lùi.

**Việc cần làm**

- Chọn quy ước hàng/cột và biểu diễn bên Đỏ/Đen, viết rõ để giao diện dùng đúng.
- Tạo thế khai cuộc và hàm đọc/ghi chuỗi thế cờ nội bộ.
- Viết riêng hàm sinh nước cho từng loại quân, dùng kiểm tra biên và quân chắn chung.
- Chuẩn bị thế trống, thế bị chắn và thế ăn quân cho từng loại.
- Kiểm quân ở sát biên, sát sông và mép cung để phát hiện sai hướng.
- Bàn giao danh sách nước cơ bản cùng mô tả đầu vào/đầu ra cho phần kiểm Tướng an toàn.
- Ghi kiểu dữ liệu đầu vào/đầu ra cho thế cờ và nước đi, cách báo dữ liệu thế không hợp lệ; phân biệt hàm sinh nước cơ bản với hàm kiểm an toàn Tướng để nơi gọi không dùng nhầm.

**Kết quả bàn giao**

- Phần biểu diễn bàn cờ và bộ sinh nước cơ bản trong packages/xiangqi-core.
- Kiểm thử tự động cho bảy loại quân.
- Mô tả quy ước toạ độ và chuỗi thế cờ.

**Điều kiện hoàn thành**

- Mỗi loại quân có ít nhất một phép thử quân chắn và một phép thử ăn quân thích hợp.
- Pháo có không ngòi hoặc hai ngòi không ăn được; Mã bị chặn chân và Tượng bị chặn mắt không đi xuyên.
- Đọc lại thế đã ghi khôi phục đúng quân và lượt đi.
- Không sinh nước ra ngoài 90 giao điểm hoặc ăn quân cùng bên.
- Ghi rồi đọc lại một thế giữa ván giữ đủ quân, bên tới lượt và bộ đếm; việc sinh nước không thay đổi thế đầu vào.

**Phạm vi và phối hợp**

Kết quả là nước cơ bản theo cách đi của quân, chưa được gọi là toàn bộ nước hợp lệ cho ván thật cho đến khi có bước kiểm tự chiếu và hai Tướng đối mặt.

---

<a id="t07"></a>

#### T07 · Lõi luật cờ (2/3): nước hợp lệ, chiếu, chiếu hết, hết nước

| Trường | Giá trị |
|---|---|
| Issue Id | 43 |
| Issue Type | Task |
| Parent | EP-04 |
| Assignee | Tùng |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-43 |
| Start date | 12/10/2026 |
| Due date | 12/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-04.1 |
| Is blocked by | T05 |
| Component chính | BE |
| Components | BE, Luật cờ |
| Labels | chinh-be, luat-co, p1, phat-trien, sprint-1 |
| Nguồn đặc tả (BA / AC) | 3.4, 3.5 |


**Description**

**Mục tiêu**

Hoàn thiện nước đi hợp lệ và phát hiện chiếu, chiếu hết, hết nước đi để bộ luật quyết định đúng việc một bên có được đi hay đã thua.

**Bối cảnh công việc**

Biết cách đi của từng quân chưa đủ: một nước nhìn đúng hình vẫn có thể làm Tướng mình bị chiếu hoặc để hai Tướng nhìn thẳng nhau. Máy chủ, giao diện và máy cờ cần dùng chung một cách phân xử. Chiếu là Tướng đang bị đe doạ ăn; chiếu hết là không có nước hợp lệ để thoát nguy cơ đó. Quân bị ghim là quân không thể rời chỗ theo một số hướng vì sẽ để lộ Tướng bị chiếu.

**Yêu cầu cần đáp ứng**

- Loại mọi nước khiến hai Tướng cùng cột không có quân chắn.
- Loại mọi nước khiến Tướng của bên vừa đi bị quân đối phương chiếu, kể cả khi di chuyển quân đang che chắn.
- Nhận biết bên tới lượt hiện bị chiếu hay không.
- Bên đang bị chiếu và không có nước hợp lệ bị xử thua vì chiếu hết.
- Bên không bị chiếu nhưng không còn nước hợp lệ cũng bị xử thua; trong dự án cờ tướng này hết nước đi không được tính hoà.
- Cung cấp các hàm dùng chung để lấy nước hợp lệ, kiểm chiếu và áp dụng nước vào một thế cờ.

**Việc cần làm**

- Dùng bộ sinh nước cơ bản để dựng danh sách ứng viên.
- Thử từng nước trên bản trạng thái phù hợp rồi kiểm an toàn Tướng và hai Tướng đối mặt.
- Viết nhận biết chiếu dựa trên quân thực sự tấn công được, có xét quân chắn.
- Kết hợp tình trạng chiếu và số nước hợp lệ để phân biệt chiếu hết với hết nước đi.
- Viết các thế kiểm: bỏ quân chắn trước Tướng, chặn chiếu, ăn quân chiếu, Tướng thoát chiếu và không có lối thoát.
- Mô tả cách gọi legalMoves để lấy nước hợp lệ, isCheck để hỏi bên tới lượt có bị chiếu không, applyMove để áp dụng nước vào thế cờ, cùng đầu vào và dữ liệu trả về.
- Chạy cùng thế qua hàm lấy nước hợp lệ và hàm áp dụng nước; đối chiếu kết quả trước/sau để chứng minh nước bị từ chối không làm mất quân hoặc đổi lượt.

**Kết quả bàn giao**

- Bộ lấy nước hợp lệ và phát hiện ba trạng thái chiếu/chiếu hết/hết nước đi.
- Các thế kiểm tự động và giải thích kết quả.
- Giao diện hàm để máy chủ, bàn cờ và máy cờ gọi chung.

**Điều kiện hoàn thành**

- Nước làm hai Tướng đối mặt không xuất hiện trong danh sách hợp lệ.
- Quân bị ghim không được đi để lộ Tướng bị chiếu; nước chặn hoặc ăn quân chiếu được chấp nhận nếu Tướng an toàn.
- Hai thế hết nước đi có và không có chiếu đều cho kết quả thua, với lý do khác nhau.
- Áp dụng một nước không làm sai vị trí các quân còn lại.
- Một nước thuộc danh sách hợp lệ áp dụng được với cùng đầu vào; nước tự chiếu hoặc làm hai Tướng đối mặt bị từ chối và giữ nguyên thế.

**Phạm vi và phối hợp**

Bàn giao phân xử từng thế cờ. Lặp thế, 120 nửa nước không ăn quân và ưu tiên các kết quả được ghép ở phần hoàn thiện luật kết thúc ván. Một nửa nước là một lần đi của một bên; hai bên mỗi bên đi một lần tương đương hai nửa nước.

---

<a id="t10"></a>

#### T10 · Lõi luật cờ (3/3): luật kết thúc ván, perft, độ phủ kiểm thử

| Trường | Giá trị |
|---|---|
| Issue Id | 46 |
| Issue Type | Task |
| Parent | EP-04 |
| Assignee | Tùng |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-46 |
| Start date | 13/10/2026 |
| Due date | 13/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-04.1 |
| Is blocked by | T07 |
| Component chính | BE |
| Components | BE, Luật cờ |
| Labels | chinh-be, luat-co, p1, phat-trien, sprint-1 |
| Nguồn đặc tả (BA / AC) | 0.12, 0.17, 3.5 |


**Description**

**Mục tiêu**

Hoàn chỉnh bộ luật kết thúc ván và kiểm chứng bộ sinh nước để máy chủ và máy cờ dùng được một nguồn luật thống nhất.

**Bối cảnh công việc**

Dự án dùng luật cờ tướng rút gọn: hết nước đi là thua, lặp thế có ngoại lệ chiếu liên tục, và đủ 120 nửa nước không ăn quân có thể hoà. Áp dụng thứ tự ưu tiên đã chốt khi nhiều điều kiện xuất hiện cùng lúc. Một nửa nước là một lần đi của một bên; 120 nửa nước tương đương 60 lượt mà mỗi bên đều đã đi một lần. Chiếu là Tướng bị đe doạ ăn; chiếu liên tục là một bên thực hiện nước chiếu trong mọi lần đi của mình thuộc chu kỳ xét.

**Yêu cầu cần đáp ứng**

- Hai thế chỉ giống nhau khi toàn bộ vị trí quân và bên tới lượt giống nhau; chỉ đếm trên nhánh nước đang có hiệu lực.
- Lần xuất hiện thứ ba tạo chu kỳ gồm các nước từ lần xuất hiện thứ nhất đến thứ ba. Một bên chiếu ở mọi nước của mình trong chu kỳ thì bên đó thua; cả hai cùng chiếu liên tục thì hoà; còn lại hoà do lặp thế.
- Đủ 120 nửa nước liên tiếp không ăn quân thì hoà. Chiếu hết ưu tiên cao nhất; hết nước đi và chiếu liên tục gây thắng/thua ưu tiên trước hoà 120 nửa nước.
- Không thêm luật xử riêng đuổi quân liên tục; trường hợp đó dùng luật lặp thế.
- Kiểm số nhánh nước hợp lệ từ khai cuộc: 44 nước đầu, 1.920 chuỗi hai nước, 79.666 chuỗi ba nước; xác minh nguồn chuẩn trước khi dùng. Việc đếm chuỗi là đếm tất cả cách đi hợp lệ liên tiếp của hai bên theo từng độ sâu, không phải cho máy chọn một nước tốt nhất.
- Gói luật có tài liệu cách gọi và độ phủ kiểm thử dòng ít nhất 90%, nghĩa là kiểm thử đã thực thi ít nhất 90% số dòng mã có thể chạy trong gói; tỷ lệ này không tự chứng minh mọi tình huống đều đúng.

**Việc cần làm**

- Thêm lịch sử thế, dấu hiệu nước chiếu và bộ đếm không ăn quân.
- Viết xét lặp thế và xác định bên chiếu trong toàn chu kỳ.
- Ghép thứ tự xét kết thúc, tạo ca cùng lúc chạm mốc không ăn quân với chiếu hết/hết nước/chiếu liên tục.
- Viết phép đếm nhánh nước theo độ sâu để phát hiện sai lệch bộ sinh nước.
- Đối chiếu chuẩn từ nguồn đã xác minh, kiểm việc ghi/đọc thế giữ đúng lượt và bộ đếm.
- Chạy toàn bộ kiểm thử gói, đo độ phủ và ghi cách tái hiện.

**Kết quả bàn giao**

- Gói luật hoàn chỉnh và tài liệu gọi hàm.
- Bộ thế kiểm kết thúc ván và nguồn chuẩn số nhánh.
- Báo cáo kiểm thử, độ phủ.

**Điều kiện hoàn thành**

- Cùng vị trí nhưng khác bên tới lượt không được tính lặp.
- Chu kỳ có một nước không chiếu không bị gán là chiếu liên tục của bên đó.
- Ca nửa nước thứ 120 gây hết nước đi cho kết quả thua, không bị ghi hoà.
- Số nhánh khớp chuẩn đã xác minh và độ phủ các dòng mã được kiểm thử thực thi đạt ít nhất 90%.
- Hai bên cùng chiếu ở mọi nước của mình trong chu kỳ cho kết quả hoà; ăn quân đặt lại số nửa nước không ăn quân và mốc 119 chưa tự gây hoà.
- Bộ dữ liệu kiểm riêng một bên chiếu liên tục gây thua cùng lúc chạm mốc 120; kết quả thắng/thua không bị thay bằng hoà không ăn quân.

**Phạm vi và phối hợp**

Bộ luật phân xử một nước hợp lệ. Máy chủ vẫn phải kiểm đồng hồ trước khi chấp nhận nước; công việc này không thay thế xử lý hết giờ và mạng.

---

<a id="us-04.2"></a>

### US-04.2 · Khởi tạo và hiển thị bàn cờ

| Trường | Giá trị |
|---|---|
| Issue Id | 24 |
| Issue Type | Story |
| Parent | EP-04 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-24 |
| Start date | 09/10/2026 |
| Due date | 12/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T11, T16 |
| Sprint thi công | S1, S2 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | Bàn cờ, FE, QA & DevOps |
| Labels | EP-04, ban-co, dac-ta, p1 |
| Nguồn đặc tả (BA / AC) | 3.1, 3.4, 10.1, 10.3 |


**Description**

**Mục tiêu**

Bàn giao đặc tả bàn cờ dễ đọc trên máy tính và điện thoại, đúng vị trí quân và hướng nhìn của người chơi theo quy tắc đã duyệt.

**Bối cảnh công việc**

Bàn cờ có 9 cột và 10 hàng giao điểm, 32 quân, sông và hai cung. Hướng nhìn thay đổi theo phe của người chơi. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Ván mới hiển thị bàn 9×10 giao điểm, sông, hai cung và 32 quân đúng vị trí. Vẽ bằng SVG, tức hình vector co giãn vẫn sắc nét. Quân Đỏ dùng 帥仕相俥傌炮兵; quân Đen dùng 將士象車馬砲卒.
- Bối cảnh: Người chơi cầm Đen. Thao tác hoặc sự kiện: Bàn cờ hiện. Kết quả cần có: Tự lật để Đen ở phía dưới.
- Bối cảnh: Màn hình rộng 360 điểm ảnh và màn hình máy tính. Thao tác hoặc sự kiện: Xem bàn cờ. Kết quả cần có: Toàn bộ bàn cờ hiển thị không cuộn ngang, quân đủ lớn để chạm.
- Bối cảnh: Trình đọc màn hình / người mù màu. Thao tác hoặc sự kiện: Tương tác. Kết quả cần có: Quân có viền phân biệt bên; có nhãn văn bản cho quân và trạng thái lượt (mức hỗ trợ tiếp cận cơ bản WCAG 2.1 AA: nhãn dễ đọc, đủ tương phản và không chỉ dựa vào màu).

**Việc cần làm**

- Đối soát hình bàn cờ, vị trí quân, hướng nhìn, nhãn và viền trợ năng trên màn hình 360 điểm ảnh và máy tính theo đặc tả hiện hành.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát bàn 9×10, quân chữ Hán, hướng Đen và khả năng đọc/chạm bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ bàn 9×10, quân chữ Hán, hướng Đen và khả năng đọc/chạm; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.

**Phạm vi và phối hợp**

Chỉ đặc tả hiển thị; thao tác đi quân và phân xử luật nằm ở phần việc riêng.

---

<a id="t11"></a>

#### T11 · FE bàn cờ SVG: vẽ, quân, lật bàn, responsive, nhãn trợ năng

| Trường | Giá trị |
|---|---|
| Issue Id | 47 |
| Issue Type | Task |
| Parent | EP-04 |
| Assignee | Nhạn |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-47 |
| Start date | 11/10/2026 |
| Due date | 12/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 16 giờ |
| Remaining Estimate | 16 giờ |
| Story Points | 3 |
| Story (relates to) | US-04.2 |
| Is blocked by | T01 |
| Component chính | FE |
| Components | Bàn cờ, FE |
| Labels | ban-co, chinh-fe, p1, phat-trien, sprint-1 |
| Nguồn đặc tả (BA / AC) | 3.1, 3.4, 10.1 |


**Description**

**Mục tiêu**

Vẽ bàn cờ rõ ràng, đúng quân và tự xoay theo phe để người chơi dùng được trên máy tính và điện thoại.

**Bối cảnh công việc**

Bàn cờ là thành phần hiển thị dùng lại cho phòng online và ván với máy. Nó nhận một thế cờ từ ứng dụng rồi vẽ lại, không tự quyết định nước đi hoặc kết quả.

**Yêu cầu cần đáp ứng**

- Vẽ bằng SVG, dạng hình có thể co giãn: 9 cột và 10 hàng giao điểm, sông và hai cung đầy đủ.
- Thế khai cuộc có đủ 32 quân đúng vị trí; quân Đỏ dùng 帥仕相俥傌炮兵, quân Đen dùng 將士象車馬砲卒.
- Khai cuộc mỗi bên có hàng cuối từ trái sang phải là Xe, Mã, Tượng, Sĩ, Tướng, Sĩ, Tượng, Mã, Xe; hai Pháo ở cột thứ hai và thứ tám trên hàng thứ ba tính từ cuối bên đó; năm Tốt ở các cột một, ba, năm, bảy, chín trên hàng thứ tư. Hai bên bố trí đối xứng qua sông.
- Giữ chữ Hán trên mặt quân, không thêm lựa chọn chữ Việt.
- Người cầm Đỏ thấy Đỏ phía dưới, người cầm Đen thấy Đen phía dưới; hướng nhìn không làm đổi dữ liệu toạ độ của thế cờ.
- Từ chiều rộng 360 pixel, toàn bộ bàn cờ không gây cuộn ngang, quân đủ lớn để chạm.
- Có viền phân biệt phe, nhãn văn bản cho quân và lượt đi để người mù màu hoặc dùng trình đọc màn hình hiểu được.

**Việc cần làm**

- Xác định cách chuyển toạ độ thế cờ thành vị trí vẽ trên bàn.
- Vẽ lưới, cung, sông và quân bằng thành phần nhận dữ liệu đầu vào.
- Thêm biến hướng nhìn để xoay bàn cho người cầm Đen.
- Áp dụng phông chữ Hán, màu và viền theo giao diện chung.
- Thêm tên quân, phe và lượt đi dưới dạng nhãn trợ năng.
- Kiểm khai cuộc và một thế giữa ván trên màn hình nhỏ và lớn.
- Nhận thế, lượt và hướng nhìn qua dữ liệu thành phần; dùng cùng phép chuyển toạ độ cho quân, nhãn và vị trí bàn ở hai hướng, không xoay dữ liệu gốc.

**Kết quả bàn giao**

- Thành phần bàn cờ nhận thế cờ và hướng nhìn.
- Ví dụ khai cuộc, giữa ván, Đỏ/Đen phía dưới.
- Bằng chứng kiểm kích thước và nhãn trợ năng.

**Điều kiện hoàn thành**

- Đếm được 32 quân khai cuộc, đúng chữ và đúng vị trí.
- Đổi hướng nhìn không đổi thế cờ gốc; quân Đen ở dưới khi chọn phe Đen.
- Độ rộng 360 pixel hiển thị trọn bàn; phông quân tải được.
- Trình đọc màn hình đọc được phe/tên quân và trạng thái lượt; không chỉ dựa màu đỏ/đen.
- Đầu vào dành cho người xem hiển thị Đỏ ở dưới; đổi từ khai cuộc sang thế giữa ván cập nhật đúng quân mà không giữ quân đã bị ăn.

**Phạm vi và phối hợp**

Bổ sung 4 giờ trong ước lượng cho kiểm tra SVG, lật bàn, kích thước màn hình và nhãn trợ năng theo các yêu cầu hiện có.

Bàn giao phần hiển thị. Bấm chuột, kéo thả, dấu ô hợp lệ, âm thanh và giao tiếp máy chủ được bổ sung trong các phần thao tác bàn cờ và ván online.

---

<a id="t16"></a>

#### T16 · Kiểm thử US-04.2

| Trường | Giá trị |
|---|---|
| Issue Id | 52 |
| Issue Type | Task |
| Parent | EP-04 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-52 |
| Start date | 20/10/2026 |
| Due date | 20/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 4 giờ |
| Remaining Estimate | 4 giờ |
| Story Points | 1 |
| Story (relates to) | US-04.2 |
| Is blocked by | T11 |
| Component chính | QA & DevOps |
| Components | Bàn cờ, QA & DevOps |
| Labels | ban-co, chinh-qa-devops, kiem-thu, p1, sprint-2 |
| Nguồn đặc tả (BA / AC) | 3.1, 3.4, 10.1 |


**Description**

**Mục tiêu**

Kiểm chứng bàn cờ được vẽ đúng, xoay đúng phe và đọc được trên điện thoại cũng như với công cụ trợ năng.

**Bối cảnh công việc**

Đây là kiểm tra thành phần hiển thị bàn cờ. Dùng các thế đầu vào cố định để biết chính xác quân nào phải nằm ở đâu; chưa dùng kết quả thao tác đi cờ làm bằng chứng cho chất lượng hiển thị.

**Yêu cầu cần đáp ứng**

- Đối chiếu lưới 9×10 giao điểm, sông, hai cung và đủ 32 quân khai cuộc.
- Kiểm chữ quân Đỏ 帥仕相俥傌炮兵 và Đen 將士象車馬砲卒, đúng loại và đúng vị trí.
- Khai cuộc mỗi bên có hàng cuối từ trái sang phải là Xe, Mã, Tượng, Sĩ, Tướng, Sĩ, Tượng, Mã, Xe; hai Pháo ở cột thứ hai và thứ tám trên hàng thứ ba tính từ cuối bên đó; năm Tốt ở các cột một, ba, năm, bảy, chín trên hàng thứ tư. Hai bên bố trí đối xứng qua sông.
- Kiểm hướng Đỏ phía dưới khi cầm Đỏ, Đen phía dưới khi cầm Đen; đảo hướng chỉ đổi cách nhìn, không đổi dữ liệu thế.
- Ở độ rộng 360 pixel và màn hình máy tính, toàn bàn không cuộn ngang, quân đủ lớn để thao tác chạm.
- Quân có viền phân biệt phe; trình đọc màn hình đọc được tên/phe quân và trạng thái lượt, không phải suy luận bằng màu.
- Lưu bằng chứng theo từng kích thước, hướng nhìn và cách đọc bằng công cụ trợ năng.
- Thử trên Chrome, Firefox, Safari và ít nhất một điện thoại thật; ghi phiên bản trình duyệt, thiết bị và kích thước cho từng lượt, không chỉ thu nhỏ cửa sổ máy tính rồi coi đã kiểm cảm ứng.

**Việc cần làm**

- Tạo ca khai cuộc cùng một thế giữa ván có quân ở bốn góc, mép cung và sát sông.
- Mở thành phần với phe Đỏ rồi Đen, đối chiếu từng giao điểm với thế gốc.
- Chụp toàn bàn ở 360 pixel và màn hình máy tính; kiểm tràn ngang và chữ bị cắt.
- Dùng trình đọc màn hình để duyệt tên quân, phe và lượt đi; xem khi không phân biệt được màu.
- Ghi lỗi sai chữ, sai vị trí, sai hướng hoặc thiếu nhãn kèm thế đầu vào và kích thước.
- Sau sửa, chạy lại ca lỗi và cả hai hướng nhìn để tránh sửa một phe làm hỏng phe kia.
- Kiểm thêm hướng nhìn người xem luôn Đỏ phía dưới; lưu thế đầu vào cùng ảnh mỗi hướng để đối chiếu đúng giao điểm thay vì chỉ nhận xét hình thức.

**Kết quả bàn giao**

- Bộ ca kiểm hiển thị bàn cờ.
- Ảnh và ghi nhận kiểm trợ năng.
- Báo cáo đạt/không đạt/bị chặn, lỗi và kiểm lại.
- Bảng trình duyệt/thiết bị/hướng nhìn/thế đã chạy, kết quả và đường dẫn bằng chứng; nêu rõ môi trường còn thiếu.

**Điều kiện hoàn thành**

- Tất cả quân khai cuộc đúng vị trí và chữ Hán; không mất chữ vì phông không tải.
- Cầm Đen thấy đúng hướng, dữ liệu không đổi sau xoay.
- Không cuộn ngang tại 360 pixel và không che mất cung/sông/quân.
- Nhãn và viền giúp xác định quân, phe, lượt mà không chỉ nhìn màu.

**Phạm vi và phối hợp**

Không dùng kết quả này để kết luận bấm chuột, kéo thả, nước hợp lệ hoặc đồng bộ mạng đã đúng; những hành vi đó có phần kiểm riêng.

---

<a id="us-04.3"></a>

### US-04.3 · Đi cờ bằng click/kéo thả và âm thanh

| Trường | Giá trị |
|---|---|
| Issue Id | 25 |
| Issue Type | Story |
| Parent | EP-04 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-25 |
| Start date | 12/10/2026 |
| Due date | 15/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T19, T27 |
| Sprint thi công | S1, S3 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | Bàn cờ, FE, QA & DevOps |
| Labels | EP-04, ban-co, dac-ta, p1 |
| Nguồn đặc tả (BA / AC) | 3.4, 10.1 |


**Description**

**Mục tiêu**

Bàn giao đặc tả thao tác đi quân bằng chuột hoặc chạm và phản hồi hình ảnh, âm thanh dễ hiểu theo quy tắc đã duyệt.

**Bối cảnh công việc**

Người tới lượt mới được chọn quân. Gợi ý chỉ thể hiện nước hợp lệ của quân đang chọn; người xem không điều khiển bàn cờ. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Bối cảnh: Tới lượt mình. Thao tác hoặc sự kiện: Bấm/chạm vào quân mình. Kết quả cần có: Quân có vòng chọn; chấm tròn ở mọi ô được đi; vòng cố định (không nhấp nháy) quanh quân đối phương ăn được.
- Bối cảnh: Đã chọn quân. Thao tác hoặc sự kiện: Bấm ô hợp lệ. Kết quả cần có: Quân đi tới ô đó.
- Khi đã chọn quân, bấm lại quân đó, bấm ô không hợp lệ hoặc nhấn phím Esc để thoát lựa chọn thì phải bỏ chọn quân.
- Bối cảnh: Tới lượt mình. Thao tác hoặc sự kiện: Kéo thả (chuột hoặc chạm giữ) vào ô hợp lệ. Kết quả cần có: Hạ quân thành công.
- Bối cảnh: Kéo thả. Thao tác hoặc sự kiện: Thả vào ô không hợp lệ. Kết quả cần có: Quân trượt mượt về chỗ cũ.
- Bối cảnh: Không phải lượt mình, hoặc là người xem. Thao tác hoặc sự kiện: Bấm/kéo quân. Kết quả cần có: Không chọn được quân.
- Bối cảnh: Vừa có nước đi. Thao tác hoặc sự kiện: Bàn cờ. Kết quả cần có: 4 góc vuông đánh dấu ô đi và ô đến của nước gần nhất (cả người chơi lẫn người xem thấy).
- Bối cảnh: Một bên bị chiếu. Thao tác hoặc sự kiện: Bàn cờ. Kết quả cần có: Vòng cảnh báo quanh Tướng + chữ "Đang bị chiếu" + biểu tượng; tối đa một nhịp sáng, không nhấp nháy/rung; bật giảm chuyển động thì không có hiệu ứng.
- Khi bật âm thanh, đi quân, ăn quân, chiếu và kết thúc ván phải phát bốn âm khác nhau. Tạo âm trực tiếp bằng khả năng xử lý âm thanh sẵn trong trình duyệt, không tải tệp âm thanh ngoài.
- Bối cảnh: Góc trên bàn cờ. Thao tác hoặc sự kiện: Bấm biểu tượng loa. Kết quả cần có: Tắt/bật tất cả âm thanh bàn cờ ngay; lựa chọn giữ khi chuyển ván trong cùng phiên trình duyệt.

**Việc cần làm**

- Đối chiếu thao tác chuột/cảm ứng, bỏ chọn và nước không hợp lệ; giữ dấu nước gần nhất, cảnh báo chiếu, giảm chuyển động và lựa chọn âm thanh trong phiên.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát bấm/kéo quân, giới hạn theo lượt/vai trò, cảnh báo và âm thanh bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ bấm/kéo quân, giới hạn theo lượt/vai trò, cảnh báo và âm thanh; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.

**Phạm vi và phối hợp**

Không thêm chức năng gợi ý chiến thuật hoặc chọn nước tốt nhất cho người chơi.

---

<a id="t19"></a>

#### T19 · FE đi cờ click/kéo thả, gợi ý ô, đánh dấu, âm thanh

| Trường | Giá trị |
|---|---|
| Issue Id | 55 |
| Issue Type | Task |
| Parent | EP-04 |
| Assignee | Nhạn |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-55 |
| Start date | 14/10/2026 |
| Due date | 16/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.1 |
| Original Estimate | 24 giờ |
| Remaining Estimate | 24 giờ |
| Story Points | 5 |
| Story (relates to) | US-04.3 |
| Is blocked by | T10, T11 |
| Component chính | FE |
| Components | Bàn cờ, FE |
| Labels | ban-co, chinh-fe, p1, phat-trien, sprint-1 |
| Nguồn đặc tả (BA / AC) | 3.4, 10.1 |


**Description**

**Mục tiêu**

Cho người chơi chọn quân và đi bằng bấm chuột/chạm hoặc kéo thả, đồng thời thấy nước hợp lệ và các dấu hiệu diễn biến ván.

**Bối cảnh công việc**

Phần hiển thị bàn cờ đã có. Công việc này nối thao tác với bộ luật dùng chung và phản hồi hình/âm thanh; máy chủ vẫn là nơi quyết định cuối cùng khi chơi online. Chiếu nghĩa là Tướng đang bị đe doạ ăn; cảnh báo giúp người chơi nhận ra mình cần đưa Tướng về trạng thái an toàn.

**Yêu cầu cần đáp ứng**

- Chỉ bên tới lượt được chọn quân của mình; người xem không chọn/kéo được quân.
- Chọn quân hiện vòng chọn, chấm ở ô hợp lệ và vòng cố định quanh quân đối phương ăn được.
- Bấm chuột lại quân, bấm chuột ô không hợp lệ hoặc nhấn Escape huỷ chọn. Bấm chuột ô hợp lệ gửi thao tác đi.
- Kéo thả dùng được cả chuột và cảm ứng; thả sai thì quân trượt về chỗ cũ, không đổi thế.
- Nước gần nhất đánh dấu bốn góc tại ô đầu và ô cuối; người chơi và người xem đều thấy.
- Bị chiếu hiện vòng quanh Tướng, chữ “Đang bị chiếu” và biểu tượng; không nhấp nháy/rung, tối đa một nhịp sáng, bật giảm chuyển động thì bỏ hiệu ứng.
- Có bốn âm khác nhau cho đi, ăn, chiếu, kết thúc, tạo bằng khả năng tổng hợp âm của trình duyệt; nút loa tắt/bật ngay và giữ lựa chọn trong phiên.

**Việc cần làm**

- Thêm trạng thái chọn quân và lấy các ô hợp lệ từ bộ luật.
- Nối thao tác bấm chuột/chạm, huỷ chọn và gửi nước.
- Thêm kéo thả, chuyển toạ độ con trỏ về giao điểm, xử lý thả sai.
- Vẽ dấu nước gần nhất và cảnh báo chiếu với lựa chọn giảm chuyển động.
- Tạo bốn âm bằng Web Audio, là công cụ âm thanh có sẵn trong trình duyệt, và điều khiển loa.
- Dựng chế độ thử hai bên trên một máy, kiểm chuột/cảm ứng và hướng bàn Đen.
- Đối chiếu điểm bấm/kéo trên bàn hướng Đen với toạ độ gửi đi; phân biệt quân đang được kéo và nước đã được chấp nhận để có thể trả về trạng thái máy chủ khi tích hợp.

**Kết quả bàn giao**

- Bàn cờ tương tác và chế độ thử cục bộ.
- Dấu trạng thái, âm thanh và điều khiển loa.
- Bộ kiểm thao tác hợp lệ, sai và ngoài lượt.

**Điều kiện hoàn thành**

- Các ô được gợi ý đúng bộ luật; người xem/ngoài lượt không đi được.
- Thả ngoài ô hợp lệ không làm đổi quân; Escape huỷ chọn.
- Bật giảm chuyển động loại hiệu ứng chiếu, không mất chữ cảnh báo.
- Tắt loa ngừng toàn bộ âm bàn cờ và chuyển ván trong cùng phiên vẫn giữ lựa chọn.
- Cùng một nước được chọn bằng chuột hoặc chạm ở hướng Đỏ/Đen tạo cùng toạ độ thế cờ; kéo ngoài bàn không tạo nước.

**Phạm vi và phối hợp**

Bổ sung 4 giờ trong ước lượng cho đối chiếu click/kéo thả, gợi ý ô, đánh dấu và âm thanh ở các nhánh thao tác đã đặc tả.

Bàn giao thao tác và phản hồi. Khi nối online, nước bị máy chủ từ chối phải được đồng bộ lại, không coi thao tác cục bộ là nước đã được chấp nhận.

---

<a id="t27"></a>

#### T27 · Kiểm thử US-04.3

| Trường | Giá trị |
|---|---|
| Issue Id | 63 |
| Issue Type | Task |
| Parent | EP-04 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-63 |
| Start date | 30/10/2026 |
| Due date | 30/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v1.0 |
| Original Estimate | 4 giờ |
| Remaining Estimate | 4 giờ |
| Story Points | 1 |
| Story (relates to) | US-04.3 |
| Is blocked by | T22, T25 |
| Component chính | QA & DevOps |
| Components | Bàn cờ, QA & DevOps |
| Labels | ban-co, chinh-qa-devops, kiem-thu, p1, sprint-3 |
| Nguồn đặc tả (BA / AC) | 3.4, 10.1 |


**Description**

**Mục tiêu**

Kiểm chứng người chơi đi cờ bằng chuột hoặc cảm ứng đúng quyền, dễ nhận biết và có âm thanh phù hợp.

**Bối cảnh công việc**

Chuẩn bị hai người chơi và ít nhất một người xem trong phòng thật. Dùng thế cờ có nước đi thường, nước ăn quân và nước chiếu để quan sát đủ các dấu hiệu trên bàn.

**Yêu cầu cần đáp ứng**

- Kiểm chọn quân khi tới lượt: quân có vòng chọn, ô trống hợp lệ có chấm tròn, quân đối phương ăn được có vòng cố định không nhấp nháy. Bấm đích hợp lệ phải đi được.
- Bấm lại quân đang chọn, bấm ô không hợp lệ hoặc nhấn Escape phải bỏ chọn. Kéo thả bằng chuột và chạm giữ trên điện thoại đều hoạt động; thả sai ô thì quân trở về chỗ cũ.
- Khi chưa tới lượt hoặc đang làm người xem, không chọn hay kéo quân được. Cả người chơi và người xem đều thấy bốn góc đánh dấu ô đi và ô đến của nước gần nhất.
- Khi bị chiếu, có vòng quanh Tướng, chữ “Đang bị chiếu” và biểu tượng. Chỉ cho tối đa một nhịp sáng; cảnh báo không rung hay nhấp nháy liên tục; bật giảm chuyển động thì hiệu ứng tắt.
- Đi quân, ăn quân, chiếu và kết thúc ván có bốn âm khác nhau được tạo trong trình duyệt. Nút loa tắt hoặc bật ngay tất cả âm bàn cờ và giữ lựa chọn khi sang ván khác trong cùng phiên trình duyệt.

**Việc cần làm**

- Viết từng tình huống thử với thế cờ ban đầu, người đang tới lượt, thao tác và kết quả mong đợi; tách thao tác chuột và cảm ứng.
- Chạy trên màn hình nhỏ và máy tính, đồng thời quan sát trình duyệt đối thủ và người xem.
- Ghi kết quả đạt, không đạt hoặc chưa thể kiểm; lưu ảnh hoặc video lỗi và kiểm lại sau khi sửa.
- Lặp ca bấm và kéo trên cả hướng Đỏ phía dưới và Đen phía dưới; ghi toạ độ nước mong đợi để phát hiện lỗi xoay bàn.
- Kiểm riêng bốn âm, tắt loa rồi sang ván khác trong cùng phiên; kiểm giảm chuyển động vẫn giữ chữ và biểu tượng cảnh báo.

**Kết quả bàn giao**

- Bộ tình huống thao tác bàn cờ và kết quả có bằng chứng tái hiện.

**Điều kiện hoàn thành**

- Tất cả tình huống được giao đạt trên phòng tích hợp thật; không bỏ qua nhánh sai quyền hoặc thiết bị cảm ứng.
- Gửi thao tác sai hoặc ngoài lượt giữ nguyên thế ở người chơi, đối thủ và người xem; không chỉ kiểm rằng nút đã bị ẩn.

**Phạm vi và phối hợp**

Kiểm cách tương tác và hiển thị; không thay việc chứng minh toàn bộ luật đi của bảy loại quân trong thư viện luật cờ.

---

<a id="ep-05"></a>

## EP-05 · Hai người đánh cờ online

| Trường | Giá trị |
|---|---|
| Issue Id | 6 |
| Issue Type | Epic |
| Parent | — |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-6 |
| Start date | 12/10/2026 |
| Due date | 19/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Component chính | Tổng hợp phạm vi các Task |
| Components | Bàn cờ, BE, FE, Luật cờ, Phòng chơi, QA & DevOps, Ván trực tuyến |
| Labels | EP-05, ban-co, dac-ta, luat-co, p1, phong-choi, van-truc-tuyen |
| Nguồn đặc tả (BA / AC) | 0.7, 0.12, 0.17, 2.1, 3.3, 3.5, 3.6, 8.3 |


**Description**

**Mục tiêu**

Bàn giao bộ đặc tả đã duyệt về ván online, đồng hồ, kết quả và mất kết nối; bảo đảm các đặc tả thành phần nhất quán khi triển khai.

**Bối cảnh công việc**

Máy chủ là nơi quyết định luật, giờ, quyền điều khiển và kết quả; cả hai người chơi và người xem phải nhìn thấy trạng thái nhất quán. Các quyết định sản phẩm đã có hiệu lực; nhóm chức năng này tổng hợp và truy vết yêu cầu, không mở một vòng quyết định hoặc duyệt lại phạm vi.

**Yêu cầu cần đáp ứng**

- Máy chủ phân xử nước, chống xử lý trùng, lưu bền nước/kết quả; đồng hồ 5/10/15 phút không cộng giây, hết giờ trước khi nhận nước thì xử thua.
- Đầu hàng/rời giữa ván có xác nhận; xin hòa hạn 30 giây không chặn bàn cờ, bị từ chối/hết hạn thì người gửi đi thêm năm nước mới xin lại.
- Mất mạng giữ ân hạn 60 giây nhưng đồng hồ vẫn chạy; hết giờ sớm hơn thì thua hết giờ. Máy chủ khởi động lại làm ván bị gián đoạn, không thắng/thua/hòa; phòng tự tạo về chờ với Ở lại phòng/Rời phòng, không hạn đóng 10 phút.

**Việc cần làm**

- Đối chiếu các đặc tả thành phần về ván online, đồng hồ, kết quả và mất kết nối với quyết định hiện hành; kiểm đầy đủ luồng, quyền, giới hạn và ngoại lệ nêu trên.
- Rà các điểm giao với nhóm chức năng khác, gắn yêu cầu với công việc triển khai và tình huống kiểm thử; sửa sai lệch theo nguồn nghiệp vụ ưu tiên.
- Theo dõi độ đầy đủ của hồ sơ thành phần và bằng chứng phải bổ sung; mâu thuẫn chưa giải được theo thứ tự ưu tiên nguồn cần báo người phụ trách sản phẩm, không tự sửa quyết định đã duyệt.

**Kết quả bàn giao**

- Bản tổng hợp đối soát ván online, đồng hồ, kết quả và mất kết nối, kèm truy vết tới đặc tả thành phần và quyết định nguồn.
- Danh sách điểm giao, tình huống nghiệm thu và sai lệch cần xử lý; bằng chứng kỹ thuật được quản lý tại công việc triển khai/kiểm chứng liên quan.

**Điều kiện hoàn thành**

- Các đặc tả thành phần phản ánh đúng ván online, đồng hồ, kết quả và mất kết nối theo yêu cầu bên trên và thống nhất tại các điểm giao.
- Hồ sơ hoàn tất theo đặc tả thành phần cuối cùng, không yêu cầu người phụ trách sản phẩm duyệt lại quy tắc đã chốt. Kết quả chạy phần mềm và kiểm thử chỉ được ghi nhận khi có bằng chứng riêng.

**Phạm vi và phối hợp**

Không cộng thời gian sau nước đi, xin đi lại hoặc khôi phục giả ván bị gián đoạn do khởi động lại máy chủ.

---

<a id="us-05.1"></a>

### US-05.1 · Ván online: đi cờ, đồng hồ và kết thúc ván

| Trường | Giá trị |
|---|---|
| Issue Id | 26 |
| Issue Type | Story |
| Parent | EP-05 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-26 |
| Start date | 14/10/2026 |
| Due date | 17/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T20, T23, T25, T30 |
| Sprint thi công | S1, S2, S3 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | Bàn cờ, BE, FE, Luật cờ, QA & DevOps, Ván trực tuyến |
| Labels | EP-05, ban-co, dac-ta, luat-co, p1, van-truc-tuyen |
| Nguồn đặc tả (BA / AC) | 0.7, 0.12, 0.17, 2.1, 3.3, 3.5, 10.1 |


**Description**

**Mục tiêu**

Bàn giao đặc tả ván giữa hai người qua mạng với máy chủ phân xử nước đi, đồng hồ và kết quả cuối cùng theo quy tắc đã duyệt.

**Bối cảnh công việc**

Trình duyệt gửi yêu cầu đi quân; máy chủ kiểm tra giờ và luật trước khi chấp nhận, lưu nước đi và gửi trạng thái cho đối thủ cùng người xem. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Khi tới lượt A và A đi nước hợp lệ, máy chủ chấp nhận; đối thủ B và mọi người xem cùng thấy nước đó. Mục tiêu truyền nước dưới 100 mili giây ở môi trường trình diễn, đo ở phân vị 95, tức ít nhất 95% mẫu đo phải nhanh hơn ngưỡng này.
- Bối cảnh: trình duyệt bị sửa để gửi nước sai luật hoặc đi khi không tới lượt. Thao tác hoặc sự kiện: Máy chủ nhận. Kết quả cần có: Từ chối; bàn cờ trình duyệt đồng bộ lại theo máy chủ.
- Bối cảnh: Mạng chập chờn gửi trùng lệnh. Thao tác hoặc sự kiện: Máy chủ nhận. Kết quả cần có: Nước đi chỉ áp dụng một lần.
- Bối cảnh: Ván đang diễn ra. Thao tác hoặc sự kiện: Mỗi nước. Kết quả cần có: Nước đi được lưu bền (bảng lưu nước đi) để không mất dữ liệu khi tiến trình dừng.
- Bối cảnh: Ván bắt đầu. Thao tác hoặc sự kiện: Hệ thống. Kết quả cần có: Hai đồng hồ theo mức giờ phòng (5/10/15 phút), chỉ đồng hồ bên tới lượt chạy, không cộng giây.
- Đồng hồ của một bên về 0 thì máy chủ kết thúc ván, xử bên đó thua do hết giờ.
- Bối cảnh: Nước đi tới máy chủ khi đồng hồ người đi đã về 0. Thao tác hoặc sự kiện: Máy chủ xử lý. Kết quả cần có: Tính giờ trước: xử thua do hết giờ, không chấp nhận nước.
- Bối cảnh: trình duyệt bị lệch đồng hồ hoặc thẻ bị ẩn. Thao tác hoặc sự kiện: Quay lại. Kết quả cần có: Đồng hồ hiển thị khớp máy chủ (sai số ≤ 1 giây).
- Máy chủ tự kết thúc khi xuất hiện chiếu hết, hết nước đi, lặp thế ba lần, chiếu liên tục hoặc 120 nửa nước không ăn quân. Kiểm đồng hồ trước nước đi; chiếu hết ưu tiên cao nhất trong kết quả của nước đi, các kết quả thắng/thua ưu tiên trước hòa 120 nửa nước.
- Bối cảnh: Ván kết thúc. Thao tác hoặc sự kiện: Hai người chơi. Kết quả cần có: Hộp kết quả: Thắng/Thua/Hoà + lý do tiếng Việt cho mọi lý do bản bàn giao đầu tiên: chiếu hết, hết nước đi, đầu hàng, hết giờ, mất kết nối, lặp thế, thoả thuận hoà, không ăn quân 120 nửa nước, chiếu liên tục, bị gián đoạn.
- Bối cảnh: Ván kết thúc. Thao tác hoặc sự kiện: Người xem. Kết quả cần có: Thấy kết quả và lý do (không có nút của người chơi).
- Bối cảnh: Ván kết thúc. Thao tác hoặc sự kiện: Dữ liệu. Kết quả cần có: Kết quả, lý do, thời điểm lưu bền ở bảng lưu kết quả ván.
- Bối cảnh: Người xem. Thao tác hoặc sự kiện: Mở phòng. Kết quả cần có: Thấy bàn cờ cùng hướng Đỏ ở dưới, không thao tác được quân.

**Việc cần làm**

- Đối soát nước sai/trùng, tính giờ trước duyệt nước, các lý do kết thúc và quyền quan sát; giữ mục tiêu truyền nước và sai số đồng hồ đã quy định.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát máy chủ phân xử nước, đồng hồ, lưu bền và kết quả bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ máy chủ phân xử nước, đồng hồ, lưu bền và kết quả; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.

**Phạm vi và phối hợp**

Không cộng thêm thời gian sau nước đi và không triển khai giao diện lịch sử ván.

---

<a id="t20"></a>

#### T20 · BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván

| Trường | Giá trị |
|---|---|
| Issue Id | 56 |
| Issue Type | Task |
| Parent | EP-05 |
| Assignee | Tùng |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-56 |
| Start date | 16/10/2026 |
| Due date | 18/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.2 |
| Original Estimate | 24 giờ |
| Remaining Estimate | 24 giờ |
| Story Points | 5 |
| Story (relates to) | US-05.1 |
| Is blocked by | T10, T12, T14 |
| Component chính | BE |
| Components | BE, Luật cờ, Ván trực tuyến |
| Labels | chinh-be, luat-co, p1, phat-trien, sprint-1, van-truc-tuyen |
| Nguồn đặc tả (BA / AC) | 0.7, 0.12, 0.17, 3.3, 3.5 |


**Description**

**Mục tiêu**

Xây dựng xử lý một ván online để máy chủ nhận nước đi, phân xử đúng luật, phát trạng thái và lưu diễn biến cùng kết quả.

**Bối cảnh công việc**

Khi hai người trong phòng đã sẵn sàng, phòng gửi tín hiệu bắt đầu. Máy chủ tạo ván mới và là nguồn kết quả duy nhất; không tin nước đi hoặc tuyên bố thắng do trình duyệt tự gửi.

**Yêu cầu cần đáp ứng**

- Mỗi lần bắt đầu hợp lệ tạo mã ván mới gắn đúng phòng và hai phe.
- Người gửi phải là người đang có quyền điều khiển, đi đúng lượt và đúng quân; nước phải qua bộ luật chung.
- Từ chối nước sai, ngoài lượt, từ người xem hoặc trạng thái cũ; trả trạng thái máy chủ để giao diện sửa lại.
- Lệnh gửi trùng chỉ áp dụng một lần, dùng cơ chế biên lai của đường kết nối thời gian thực.
- Nước được chấp nhận phải lưu bền và phát cho cả hai người chơi cùng người xem.
- Tự kết thúc khi có chiếu hết, hết nước đi, lặp thế, chiếu liên tục hoặc đủ 120 nửa nước không ăn quân. Một nửa nước là một lần đi của một bên. Chiếu hết ưu tiên cao nhất; hết nước đi và chiếu liên tục gây thắng/thua được xét trước hoà do 120 nửa nước không ăn quân.
- Lưu kết quả, lý do và thời điểm kết thúc; phát sự kiện cho phòng về chờ và giao diện hiện kết quả. Không xử lại kết quả vì phản hồi cũ đến muộn.
- Chiếu là Tướng bị đe doạ ăn; chiếu hết và hết nước hợp lệ đều làm bên tới lượt thua. Lặp cùng thế và cùng bên tới lượt lần thứ ba: bên nào chiếu ở mọi nước của mình từ lần xuất hiện thứ nhất đến thứ ba thì bên đó thua; cả hai cùng chiếu liên tục thì hoà, còn lại hoà do lặp thế.

**Việc cần làm**

- Nhận sự kiện phòng bắt đầu, tạo thế khai cuộc và bản ghi ván.
- Nối xác thực người gửi, phiên bản và chống trùng với hàm phân xử nước.
- Áp dụng nước hợp lệ, ghi dữ liệu và phát trạng thái cho các vai trò trong phòng.
- Nối xét kết thúc tự động và chỗ ghép đồng hồ, đầu hàng, xin hoà, mất kết nối.
- Viết kiểm tích hợp hai người và người xem, gồm gửi nước giả và gửi lặp.
- Đối chiếu dữ liệu lưu với trạng thái đã phát, kiểm ván kết thúc không nhận nước mới.
- Khi ghép đồng hồ, đặt kiểm thời gian trước hàm áp dụng nước; sau nước hợp lệ mới xét kết thúc theo ưu tiên, lưu nước/kết quả rồi phát trạng thái chính thức.
- Mô tả đường báo lỗi ghi dữ liệu và kiểm đối chiếu để không phát một kết quả thành công không có bản ghi bền tương ứng.

**Kết quả bàn giao**

- Dịch vụ ván online và sự kiện nước/kết quả.
- Lưu ván, nước đi và kết quả.
- Kiểm thử tích hợp luồng hợp lệ và từ chối.

**Điều kiện hoàn thành**

- Một nước đúng xuất hiện giống nhau ở hai người và người xem, có bản ghi lưu bền.
- Sửa trình duyệt để đi sai hoặc đi hộ đối thủ bị từ chối.
- Gửi cùng lệnh hai lần chỉ có một nước lưu.
- Thế chiếu hết/hết nước tự kết thúc, lý do đúng và không nhận nước tiếp.
- Lặp thế, chiếu liên tục và mốc 120 được kiểm bằng lịch sử nước thật; lý do lưu bền trùng lý do phát cho cả phòng.

**Phạm vi và phối hợp**

Bàn giao lõi ván để nối đồng hồ, các nút đề nghị và phục hồi mạng. Độ trễ thực tế và toàn bộ lý do kết thúc phải được kiểm lại trên ứng dụng đủ các phần này.

---

<a id="t23"></a>

#### T23 · BE đồng hồ thi đấu và hết giờ

| Trường | Giá trị |
|---|---|
| Issue Id | 59 |
| Issue Type | Task |
| Parent | EP-05 |
| Assignee | Cường |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-59 |
| Start date | 19/10/2026 |
| Due date | 19/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-05.1 |
| Is blocked by | T20 |
| Component chính | BE |
| Components | BE, Ván trực tuyến |
| Labels | chinh-be, p1, phat-trien, sprint-2, van-truc-tuyen |
| Nguồn đặc tả (BA / AC) | 0.7, 0.17, 2.1, 3.3, 8.3 |


**Description**

**Mục tiêu**

Quản lý đồng hồ trên máy chủ để ván online xử thua đúng người hết giờ, kể cả khi trình duyệt chậm hoặc mất mạng.

**Bối cảnh công việc**

Mỗi phòng chọn 5, 10 hoặc 15 phút cho mỗi bên và không cộng giây sau nước đi. Đồng hồ trong trình duyệt chỉ là phần hiển thị; thời gian máy chủ mới quyết định nước còn được đi hay ván đã kết thúc. Ân hạn mất mạng là khoảng 60 giây giữ chỗ cho người mất kết nối quay lại; khoảng này không cộng thêm vào thời gian thi đấu.

**Yêu cầu cần đáp ứng**

- Khởi tạo đủ thời gian cho hai bên theo phòng; khi ván bắt đầu, Đỏ tới lượt và đồng hồ Đỏ chạy.
- Chỉ trừ thời gian bên tới lượt; nước hợp lệ chuyển lượt sang bên kia, không cộng thêm giây.
- Trước xét một nước gửi tới phải tính thời gian đã trôi. Nếu thời gian còn lại bằng 0 hoặc âm thì xử thua do hết giờ, không nhận nước dù nước đó có thể chiếu hết.
- Máy chủ tự kết thúc khi hết giờ, không chờ người chơi gửi thao tác.
- Mất mạng không dừng đồng hồ. Hết giờ trước khi hết ân hạn mất mạng thì kết quả là hết giờ.
- Ảnh chụp trạng thái chứa thời gian còn lại và dữ liệu đủ để giao diện đồng bộ sau nối lại hoặc trở lại thẻ trình duyệt.
- Mỗi ván mới dùng thời gian đầy đủ; không dùng phần còn dư của ván trước.

**Việc cần làm**

- Thêm trạng thái thời gian và mốc tính trên máy chủ cho mỗi ván.
- Nối bước cập nhật thời gian trước xử lý nước và bước đổi lượt sau nước hợp lệ.
- Tạo xử lý tự hết giờ và bảo vệ để kết thúc chỉ có hiệu lực một lần.
- Đưa dữ liệu đồng hồ vào phản hồi và ảnh chụp trạng thái.
- Viết phép thử có đồng hồ kiểm soát cho mốc ngay trước/bằng/sau hết giờ.
- Thử ghép với mất kết nối, gửi trùng nước và tạo ván tiếp theo.

**Kết quả bàn giao**

- Đồng hồ máy chủ tích hợp với ván.
- Dữ liệu đồng bộ cho giao diện.
- Kiểm thử mốc thời gian, đổi lượt và kết thúc.

**Điều kiện hoàn thành**

- Cả ba mức giờ khởi tạo đúng, chỉ một bên bị trừ theo lượt.
- Nước đến khi thời gian còn lại đã bằng không hoặc âm phải bị từ chối; chỉ tạo một kết quả thua do hết giờ.
- Đồng hồ tiếp tục giảm khi người tới lượt mất mạng.
- Giao diện tích hợp lấy lại mốc máy chủ sau thẻ trình duyệt ẩn/nối lại; kiểm sai số hiển thị không quá một giây khi phần giao diện được nối.
- Nước sai luật, ngoài lượt hoặc gửi trùng không chuyển đồng hồ sang đối thủ và không hoàn lại thời gian đã trôi.
- Hết giờ và yêu cầu đầu hàng/hoà gần nhau chỉ chốt một kết quả; phép thử ghi mốc sự kiện và kết quả từ máy chủ để đối chiếu.

**Phạm vi và phối hợp**

Bàn giao thời gian và kết quả hết giờ cho giao diện và xử lý mất mạng. Công việc không thêm cộng giây hay mức giờ không giới hạn cho phòng online.

---

<a id="t25"></a>

#### T25 · FE phòng đấu, đồng hồ, kết quả và lớp phủ nối lại

| Trường | Giá trị |
|---|---|
| Issue Id | 61 |
| Issue Type | Task |
| Parent | EP-05 |
| Assignee | Kỳ |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-61 |
| Start date | 22/10/2026 |
| Due date | 23/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 16 giờ |
| Remaining Estimate | 16 giờ |
| Story Points | 3 |
| Story (relates to) | US-05.1 |
| Is blocked by | T19, T23 |
| Component chính | FE |
| Components | Bàn cờ, FE, Ván trực tuyến |
| Labels | ban-co, chinh-fe, p1, phat-trien, sprint-2, van-truc-tuyen |
| Nguồn đặc tả (BA / AC) | 0.7, 0.17, 3.3, 8.3 |


**Description**

**Mục tiêu**

Hoàn thiện màn hình thi đấu để hai người chơi và người xem nhìn cùng một thế cờ, đồng hồ và kết quả.

**Bối cảnh công việc**

Người chơi ngồi ghế Đỏ hoặc Đen; người xem chỉ theo dõi. Máy chủ giữ trạng thái chính thức, trình duyệt có nhiệm vụ hiển thị và gửi thao tác, không tự quyết định nước đi hay kết quả. Một nửa nước là một lần đi quân của một bên; 120 nửa nước là tổng 120 lần đi liên tiếp của hai bên.

**Yêu cầu cần đáp ứng**

- Kết nối bàn cờ với nước đi được máy chủ chấp nhận. Nếu nước bị từ chối, đưa bàn cờ về trạng thái đúng. Người cầm Đen thấy Đen ở dưới; người xem thấy Đỏ ở dưới và không điều khiển quân.
- Hiển thị hai đồng hồ theo mức 5, 10 hoặc 15 phút của phòng; chỉ đồng hồ bên tới lượt chạy, không cộng giây. Khi chuyển lại từ thẻ trình duyệt bị ẩn, đồng hồ lệch máy chủ không quá 1 giây.
- Hiển thị kết quả và lý do bằng tiếng Việt: chiếu hết, hết nước, đầu hàng, hết giờ, mất kết nối, lặp thế, thoả thuận hoà, 120 nửa nước không ăn quân, chiếu liên tục hoặc bị gián đoạn. Gián đoạn do máy chủ khởi động lại không có người thắng, thua hay hoà.
- Sau ván, người chơi có “Ở lại phòng” và “Rời phòng”; người xem không có nút dành cho người chơi. Khi người chơi mất mạng, hiện lớp phủ đếm hạn 60 giây, không đóng được bằng phím Escape; phía đối thủ thấy thời gian chờ còn lại và đồng hồ ván vẫn chạy. Nối lại thành công thì bỏ lớp phủ và đồng bộ bàn cờ, đồng hồ, trò chuyện theo máy chủ.
- Máy chủ khởi động lại: hiển thị “Ván bị gián đoạn” với Ở lại phòng/Rời phòng; phòng về Đang chờ, cả hai chưa sẵn sàng, không có đếm tự đóng phòng sau 10 phút.

**Việc cần làm**

- Nối dữ liệu nước đi, lượt, đồng hồ và kết quả từ máy chủ; xử lý cập nhật mới thay cho trạng thái cũ.
- Dựng lớp phủ nối lại theo thời gian máy chủ cung cấp; phân biệt đang đấu, đang chờ và người xem.
- Kiểm trên màn hình điện thoại rộng 360 điểm ảnh và máy tính; bảo đảm bàn cờ không cuộn ngang, thông báo không che nút Đầu hàng.
- Tạo dữ liệu thử cho từng lý do kết thúc, ngắt kết nối rồi nối lại và khởi động lại máy chủ; đối chiếu bảng cờ, đồng hồ, vai trò và nút theo trạng thái chính thức.

**Kết quả bàn giao**

- Màn hình phòng đấu đã nối dịch vụ thật, có trạng thái chờ tải, lỗi và mất kết nối.

**Điều kiện hoàn thành**

- Hai trình duyệt thấy cùng thế cờ và lượt; người xem không đi được quân; nhãn kết quả đúng với dữ liệu máy chủ.
- Trở lại tab ẩn hoặc nối lại hiển thị giờ lệch không quá một giây; trong khi chờ 60 giây đồng hồ vẫn chạy, Escape không bỏ lớp phủ.
- Ở lại phòng chỉ đóng lớp kết quả và trở về phòng chờ đã reset sẵn sàng; giữ ghế/phe và không khởi tạo ván mới trước khi cả hai sẵn sàng.
- Ván bị gián đoạn không được ghi nhãn Thắng, Thua hay Hoà; có đúng lựa chọn Ở lại phòng/Rời phòng, không đếm đóng sau 10 phút.

**Phạm vi và phối hợp**

Phần này làm giao diện. Việc máy chủ giữ ghế, xử thua sau mất mạng và phục hồi kết nối được kiểm bằng tình huống mất mạng thật trong công việc kiểm thử kết nối.

---

<a id="t30"></a>

#### T30 · Kiểm thử US-05.1

| Trường | Giá trị |
|---|---|
| Issue Id | 66 |
| Issue Type | Task |
| Parent | EP-05 |
| Assignee | Thư |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-66 |
| Start date | 27/10/2026 |
| Due date | 27/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-05.1 |
| Is blocked by | T25, T26 |
| Component chính | QA & DevOps |
| Components | Luật cờ, QA & DevOps, Ván trực tuyến |
| Labels | chinh-qa-devops, kiem-thu, luat-co, p1, sprint-3, van-truc-tuyen |
| Nguồn đặc tả (BA / AC) | 0.12, 0.17, 2.1, 3.3, 3.5 |


**Description**

**Mục tiêu**

Kiểm chứng ván trực tuyến được máy chủ phân xử, tính giờ và lưu kết quả chính xác.

**Bối cảnh công việc**

Dùng hai người chơi thật và một người xem. Chuẩn bị các thế cờ sát kết thúc và công cụ thử gửi yêu cầu sai hoặc lặp để kiểm cả hành vi mà giao diện bình thường không cho phép. Một nửa nước là một lần đi quân của một bên; 120 nửa nước là tổng 120 lần đi liên tiếp của hai bên.

**Yêu cầu cần đáp ứng**

- Gửi nước sai luật hoặc khi chưa tới lượt phải bị từ chối; bàn cờ trở về trạng thái máy chủ. Gửi lại cùng yêu cầu đi cờ không được làm quân đi hai lần.
- Mỗi nước được chấp nhận phải lưu trong cơ sở dữ liệu. Khi ván kết thúc, kết quả, lý do và thời điểm cũng được lưu bền, không chỉ hiện trên màn hình.
- Thử cả mức 5, 10 và 15 phút mỗi bên. Chỉ đồng hồ bên tới lượt chạy, không cộng giây; hết giờ thì bên đó thua. Nước đến máy chủ sau khi hết giờ bị từ chối, kể cả là nước có thể thắng.
- Ẩn thẻ trình duyệt hoặc tạo lệch giờ trên thiết bị rồi quay lại; đồng hồ hiển thị phải khớp máy chủ với sai số không quá 1 giây.
- Các thế kết thúc phải tự kết thúc ván: chiếu hết, hết nước, lặp thế, chiếu liên tục và 120 nửa nước không ăn quân. Kiểm ưu tiên thắng/thua trước hoà khi cùng xuất hiện; chiếu hết được ưu tiên cao nhất sau khi nước đã hợp lệ.
- Người xem thấy Đỏ ở dưới, không thao tác quân; khi hết ván thấy kết quả và lý do nhưng không có nút dành riêng cho người chơi.

**Việc cần làm**

- Tạo bộ thế và dữ liệu đồng hồ xác định, ghi rõ kết quả mong đợi trước khi chạy.
- Đối chiếu ba trình duyệt, phản hồi máy chủ và bản ghi nước đi/kết quả.
- Ghi bằng chứng cho lỗi luật, sai thời điểm hoặc dữ liệu thiếu; kiểm lại sau sửa.
- Lặp cùng vị trí khác lượt, lặp lần thứ ba với một bên/cả hai bên luôn chiếu và chu kỳ có nước không chiếu; đối chiếu kết quả với đáp án đã xác minh độc lập.
- Truy vấn bản ghi ván/nước sau khi nhận kết quả, kiểm lý do và thời điểm thay vì chỉ chụp hộp kết quả.

**Kết quả bàn giao**

- Báo cáo kiểm tính đúng đắn ván trực tuyến, đồng hồ, lưu nước và kết quả.

**Điều kiện hoàn thành**

- Tất cả tình huống được giao đạt và không có kết quả trùng hoặc nước đi sau hết giờ.
- Mốc 120 đồng thời hết nước hoặc một bên chiếu liên tục tạo kết quả thắng/thua; đồng thời chiếu hết vẫn là chiếu hết. Nước đến khi giờ bằng không bị từ chối trước khi xét các lý do này.

**Phạm vi và phối hợp**

Đo độ trễ dưới tải và kiểm đủ mọi lý do do mất mạng, đầu hàng, xin hoà thuộc các đợt kiểm chuyên biệt và hồi quy tổng.

---

<a id="us-05.2"></a>

### US-05.2 · Đầu hàng và xin hoà

| Trường | Giá trị |
|---|---|
| Issue Id | 27 |
| Issue Type | Story |
| Parent | EP-05 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-27 |
| Start date | 18/10/2026 |
| Due date | 21/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T32, T36, T39 |
| Sprint thi công | S2, S3 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | BE, FE, QA & DevOps, Ván trực tuyến |
| Labels | EP-05, dac-ta, p1, van-truc-tuyen |
| Nguồn đặc tả (BA / AC) | 2.3, 3.3, 3.5, 3.6 |


**Description**

**Mục tiêu**

Bàn giao đặc tả đầu hàng, rời phòng giữa ván và xin hòa để người chơi biết rõ hậu quả trước khi xác nhận theo quy tắc đã duyệt.

**Bối cảnh công việc**

Đầu hàng hoặc chủ động rời ván là thua. Đề nghị hòa không dừng ván và không ngăn người nhận đi quân. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Bối cảnh: Đang ván. Thao tác hoặc sự kiện: Bấm "Đầu hàng". Kết quả cần có: Xác nhận "Bạn có chắc chắn muốn đầu hàng? Bạn sẽ bị xử THUA ngay lập tức…", vị trí chọn ban đầu ở Huỷ; Đồng ý → đầu hàng, đối thủ thắng.
- Bối cảnh: Đang ván. Thao tác hoặc sự kiện: Bấm "Rời phòng". Kết quả cần có: Cảnh báo rời phòng = đầu hàng; "Rời phòng" → thua do đầu hàng rồi rời; "Ở lại" → giữ nguyên.
- Bối cảnh: chủ phòng rời giữa ván. Thao tác hoặc sự kiện: Hệ thống. Kết quả cần có: chủ phòng thua do đầu hàng, quyền chủ phòng chuyển cho người còn lại.
- Bối cảnh: Có thông báo nổi/thông báo đang hiện. Thao tác hoặc sự kiện: Nhìn nút Đầu hàng. Kết quả cần có: thông báo nổi không che nút Đầu hàng.
- Khi A xin hoà trong ván, B thấy khung đếm 30 giây với Chấp nhận Hoà/Từ chối. Khung không giữ tiêu điểm bàn phím và không chặn bàn cờ; đồng hồ tiếp tục chạy. Bấm nút X hoặc phím Esc chỉ thu gọn, có nút mở lại và không làm thay đổi thời hạn.
- Bối cảnh: B bấm "Chấp nhận Hoà". Thao tác hoặc sự kiện: Hệ thống. Kết quả cần có: Ván kết thúc hòa do hai bên đồng ý.
- Bối cảnh: B từ chối hoặc hết 30 giây. Thao tác hoặc sự kiện: A muốn xin lại. Kết quả cần có: Nút không bấm được cho tới khi A đi thêm 5 nước, chú thích nêu số nước còn chờ.
- Bối cảnh: A có đề nghị đang chờ. Thao tác hoặc sự kiện: A bấm "Rút đề nghị". Kết quả cần có: Đề nghị bị huỷ ở phía B.
- Bối cảnh: Đề nghị đang chờ. Thao tác hoặc sự kiện: Ván kết thúc vì lý do khác. Kết quả cần có: Đề nghị đóng; phản hồi đến sau không đổi kết quả.

**Việc cần làm**

- Đối chiếu xác nhận hậu quả, chuyển chủ, đề nghị hòa 30 giây, chờ thêm năm nước và phản hồi đến sau khi ván đã kết thúc.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát đầu hàng, rời phòng và đề nghị hòa không chặn bàn cờ bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ đầu hàng, rời phòng và đề nghị hòa không chặn bàn cờ; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.

**Phạm vi và phối hợp**

Không thêm xin đi lại; phản hồi đề nghị cũ không được thay đổi kết quả một ván đã kết thúc.

---

<a id="t32"></a>

#### T32 · BE đầu hàng, rời phòng giữa ván, xin hoà

| Trường | Giá trị |
|---|---|
| Issue Id | 68 |
| Issue Type | Task |
| Parent | EP-05 |
| Assignee | Cường |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-68 |
| Start date | 20/10/2026 |
| Due date | 21/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 12 giờ |
| Remaining Estimate | 12 giờ |
| Story Points | 3 |
| Story (relates to) | US-05.2 |
| Is blocked by | T20 |
| Component chính | BE |
| Components | BE, Ván trực tuyến |
| Labels | chinh-be, p1, phat-trien, sprint-2, van-truc-tuyen |
| Nguồn đặc tả (BA / AC) | 0.7, 3.3, 3.5, 3.6 |


**Description**

**Mục tiêu**

Xử lý đầu hàng, rời phòng giữa ván và đề nghị hoà trên máy chủ.

**Bối cảnh công việc**

Máy chủ là nơi quyết định kết quả cuối cùng. Người chơi có thể chủ động kết thúc ván, nhưng yêu cầu đến muộn hoặc gửi nhiều lần không được thay đổi kết quả đã chốt.

**Yêu cầu cần đáp ứng**

- Đầu hàng làm người yêu cầu thua và đối thủ thắng. Rời phòng trong lúc đang đấu cũng được tính là đầu hàng rồi mới rời; nếu người rời là chủ phòng, chuyển quyền cho người chơi còn lại.
- Người chơi gửi đề nghị hoà cho đối thủ trong ván. Người nhận có 30 giây để chấp nhận hoặc từ chối; trong khi chờ, bàn cờ và đồng hồ tiếp tục hoạt động.
- Chấp nhận hợp lệ kết thúc ván với lý do thoả thuận hoà. Từ chối hoặc hết hạn buộc người gửi đi thêm 5 nước của chính mình mới được đề nghị lại; cung cấp số nước còn chờ cho giao diện.
- Người gửi được rút đề nghị đang chờ; phía nhận phải nhận thông báo đóng đề nghị. Nếu ván đã kết thúc vì lý do khác, đề nghị tự đóng và phản hồi đến sau không được sửa kết quả.
- Chỉ người đang chơi trong ván có quyền đầu hàng hoặc gửi, rút, trả lời đề nghị tương ứng; người xem không được thực hiện các thao tác này.
- Mỗi người chỉ có một đề nghị đang chờ; gửi thêm khi đã có đề nghị chưa xử lý bị từ chối, không tạo nhiều hạn trả lời độc lập.

**Việc cần làm**

- Tạo các thao tác máy chủ và sự kiện phản hồi cho đầu hàng, rời phòng, gửi/rút/trả lời đề nghị hoà.
- Dùng cùng cơ chế kết thúc và lưu ván hiện có; xử lý tuần tự khi hết giờ, nước kết thúc ván và chấp nhận hoà đến gần nhau.
- Viết kiểm thử từ chối, hết 30 giây, đếm 5 nước, rút đề nghị, quyền người xem và phản hồi sau khi ván đã kết thúc.
- Lưu người gửi/nhận, hạn 30 giây và mốc số nước người gửi sau từ chối/hết hạn; chỉ tăng số nước đã đi khi máy chủ chấp nhận nước của chính người đó.

**Kết quả bàn giao**

- Xử lý đề nghị trong ván và kiểm thử tự động chứng minh kết quả chỉ được chốt một lần.

**Điều kiện hoàn thành**

- Rời giữa ván có kết quả thua đúng; đề nghị không dừng đồng hồ; yêu cầu muộn không thay đổi kết quả.
- Bốn nước của người gửi chưa mở lại Xin hoà, nước thứ năm mở lại; nước đối thủ và lệnh gửi trùng không làm giảm số nước phải chờ.
- Chấp nhận sau hạn, người xem trả lời hoặc người không phải bên nhận đều không tạo hoà; đầu hàng lặp chỉ lưu một kết quả.

**Phạm vi và phối hợp**

Phần này không dựng hộp xác nhận hay khung đề nghị trên màn hình; không thêm xin đi lại hoặc tái đấu.

---

<a id="t36"></a>

#### T36 · FE nút Đầu hàng, Xin hoà và khung đề nghị

| Trường | Giá trị |
|---|---|
| Issue Id | 72 |
| Issue Type | Task |
| Parent | EP-05 |
| Assignee | Nhạn |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-72 |
| Start date | 24/10/2026 |
| Due date | 24/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-05.2 |
| Is blocked by | T25, T32 |
| Component chính | FE |
| Components | FE, Ván trực tuyến |
| Labels | chinh-fe, p1, phat-trien, sprint-3, van-truc-tuyen |
| Nguồn đặc tả (BA / AC) | 3.3, 3.5, 3.6 |


**Description**

**Mục tiêu**

Dựng thao tác đầu hàng và xin hoà rõ hậu quả, không gây bấm nhầm hoặc che bàn cờ.

**Bối cảnh công việc**

Người chơi cần xác nhận trước khi tự nhận thua. Đề nghị hoà là cuộc trao đổi giữa hai người đang đấu, trong lúc đó lượt đi và đồng hồ vẫn tiếp tục.

**Yêu cầu cần đáp ứng**

- Nút Đầu hàng mở hộp xác nhận cảnh báo “Bạn có chắc chắn muốn đầu hàng? Bạn sẽ bị xử THUA ngay lập tức…”. Đặt tiêu điểm bàn phím ban đầu ở Huỷ; chỉ gửi lệnh khi người chơi đồng ý.
- Rời phòng giữa ván phải cảnh báo được tính là đầu hàng; có Rời phòng và Ở lại. Huỷ hoặc Ở lại không làm thay đổi ván.
- Người gửi Xin hoà thấy trạng thái đang chờ và nút Rút đề nghị. Người nhận thấy Chấp nhận Hoà/Từ chối và đếm lùi 30 giây; khung này không giữ bàn phím hay chặn thao tác trên bàn cờ.
- Bấm dấu đóng hoặc Escape chỉ thu gọn đề nghị, có cách mở lại. Thu gọn không gửi từ chối, không dừng đồng hồ và không kéo dài hạn trả lời.
- Sau từ chối hoặc hết hạn, nút xin lại bị vô hiệu tới khi người gửi đi thêm 5 nước; phần giải thích phải nêu số nước còn chờ. Khi ván kết thúc, đóng đề nghị và bỏ phản hồi muộn.
- Thông báo tạm không được che nút Đầu hàng; người xem không có các thao tác dành cho người chơi.

**Việc cần làm**

- Dựng hộp xác nhận và hai trạng thái người gửi/người nhận; nối với kết quả máy chủ.
- Chặn bấm lặp khi đang gửi; giữ số giây và số nước chờ đồng bộ với trạng thái nhận được.
- Thử bằng bàn phím, điện thoại và hai trình duyệt để kiểm thu gọn, mở lại, huỷ và kết thúc ván.

**Kết quả bàn giao**

- Giao diện đầu hàng, rời phòng và đề nghị hoà đã nối máy chủ.

**Điều kiện hoàn thành**

- Không đầu hàng khi Huỷ; đề nghị không làm ngừng ván; hai bên thấy cùng kết quả xử lý.
- Thu gọn rồi mở lại giữ nguyên hạn 30 giây, không tạo đề nghị mới; đối thủ vẫn đi được quân và đồng hồ tiếp tục.
- Từ chối/hết hạn hiển thị số nước còn chờ từ máy chủ; nước đối thủ không làm nút Xin hoà mở sớm.
- Lỗi gửi lệnh giữ thông báo lỗi và cho thử lại theo trạng thái máy chủ; bấm nhanh không tạo nhiều đề nghị hoặc tự hiện kết quả khi chưa được chấp nhận.

**Phạm vi và phối hợp**

Máy chủ quyết định kết quả, hạn và quyền; phần giao diện không tự xử hoà hoặc tự thay đổi bộ đếm nước.

---

<a id="t39"></a>

#### T39 · Kiểm thử US-05.2

| Trường | Giá trị |
|---|---|
| Issue Id | 75 |
| Issue Type | Task |
| Parent | EP-05 |
| Assignee | Kỳ |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-75 |
| Start date | 25/10/2026 |
| Due date | 25/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 4 giờ |
| Remaining Estimate | 4 giờ |
| Story Points | 1 |
| Story (relates to) | US-05.2 |
| Is blocked by | T18, T36 |
| Component chính | QA & DevOps |
| Components | QA & DevOps, Ván trực tuyến |
| Labels | chinh-qa-devops, kiem-thu, p1, sprint-3, van-truc-tuyen |
| Nguồn đặc tả (BA / AC) | 3.3, 3.5, 3.6 |


**Description**

**Mục tiêu**

Kiểm chứng đầu hàng, rời phòng và xin hoà đúng ý người chơi, không làm thay đổi kết quả ngoài ý muốn.

**Bối cảnh công việc**

Dùng hai người đang đấu và một người xem; chuẩn bị ván gần hết giờ hoặc gần kết thúc để kiểm đề nghị còn đang chờ khi ván chấm dứt.

**Yêu cầu cần đáp ứng**

- Bấm Đầu hàng phải có cảnh báo thua ngay và tiêu điểm ban đầu ở Huỷ. Huỷ giữ ván; Đồng ý làm người đó thua, đối thủ thắng. Rời phòng phải cảnh báo đầu hàng; Rời phòng nhận thua rồi rời, Ở lại giữ nguyên.
- Chủ phòng rời giữa ván phải thua do đầu hàng và chuyển quyền chủ phòng cho người chơi còn lại. Thông báo tạm không che nút Đầu hàng.
- Gửi Xin hoà làm đối thủ thấy khung đếm 30 giây với Chấp nhận Hoà/Từ chối. Thử tiếp tục đi quân và quan sát đồng hồ để chứng minh khung không chặn ván.
- Bấm dấu đóng hoặc Escape chỉ thu gọn khung; mở lại vẫn cùng đề nghị và thời hạn còn lại. Chấp nhận kết thúc hoà; từ chối hoặc hết hạn làm người gửi chờ đúng 5 nước của mình trước lần xin tiếp.
- Kiểm phần giải thích số nước còn chờ ở nút bị vô hiệu. Người gửi rút đề nghị phải làm phía nhận đóng đề nghị.
- Khi ván kết thúc vì lý do khác, đề nghị đang chờ đóng; cố gửi phản hồi cũ sau đó không được đổi kết quả. Người xem không được gửi hay trả lời thay người chơi.

**Việc cần làm**

- Ghi mã ván, kết quả và số nước của người gửi trước từng ca; chuẩn bị đề nghị gần hết 30 giây và ván gần hết giờ để kiểm phản hồi đến sau kết thúc mà không nhầm với một ván mới.
- Viết từng trường hợp Đồng ý/Huỷ/Từ chối/hết hạn/rút với kết quả mong đợi.
- Thử bằng chuột và bàn phím, quan sát cả hai trình duyệt và kết quả máy chủ.
- Lưu bằng chứng cho thời hạn, số nước chờ và phản hồi muộn; lập lỗi và kiểm lại khi sửa.

**Kết quả bàn giao**

- Bộ tình huống và báo cáo kiểm đầu hàng, rời phòng, xin hoà.

**Điều kiện hoàn thành**

- Mọi nhánh được giao đạt; không có xử thua khi huỷ hoặc sửa kết quả sau khi ván đã kết thúc.
- Đếm đủ năm nước tiếp theo của chính người gửi sau từ chối/hết hạn mới cho xin hoà lại; nước đối thủ không giảm số chờ. Rút/thu gọn đề nghị không được bị xử lý thành chấp nhận hoà.

**Phạm vi và phối hợp**

Không kiểm xin đi lại, tái đấu hoặc luật riêng của chế độ xếp hạng vì chưa thuộc phiên bản đang làm.

---

<a id="us-05.3"></a>

### US-05.3 · Mất kết nối và nối lại

| Trường | Giá trị |
|---|---|
| Issue Id | 28 |
| Issue Type | Story |
| Parent | EP-05 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-28 |
| Start date | 27/10/2026 |
| Due date | 30/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T52, T60 |
| Sprint thi công | S3, S4 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | BE, Phòng chơi, QA & DevOps, Ván trực tuyến |
| Labels | EP-05, dac-ta, p1, phong-choi, van-truc-tuyen |
| Nguồn đặc tả (BA / AC) | 0.7, 0.17, 3.3, 8.3 |


**Description**

**Mục tiêu**

Bàn giao đặc tả khả năng quay lại ván sau sự cố mạng và xử lý minh bạch khi không thể tiếp tục theo quy tắc đã duyệt.

**Bối cảnh công việc**

Người chơi có 60 giây để nối lại, nhưng đồng hồ ván vẫn chạy. Máy chủ khởi động lại được coi là gián đoạn hệ thống, khác với một người chơi mất mạng. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Bối cảnh: A mất kết nối trong ván. Thao tác hoặc sự kiện: Hệ thống. Kết quả cần có: A thấy lớp phủ đếm 60 giây (không đóng bằng Esc); B thấy "Đối thủ đang mất kết nối, thời gian chờ: 60s"; đồng hồ ván vẫn chạy.
- Bối cảnh: A nối lại trong 60 giây. Thao tác hoặc sự kiện: Hệ thống. Kết quả cần có: Lớp phủ tắt, bàn cờ/đồng hồ/chat đồng bộ lại, ván tiếp tục.
- Bối cảnh: Quá 60 giây. Thao tác hoặc sự kiện: Máy chủ. Kết quả cần có: A thua do quá hạn mất kết nối.
- Bối cảnh: A mất kết nối khi tới lượt A, đồng hồ A về 0 trước khi hết ân hạn. Thao tác hoặc sự kiện: Máy chủ. Kết quả cần có: Xử thua do hết giờ.
- Bối cảnh: Cả hai cùng mất kết nối, máy chủ vẫn chạy. Thao tác hoặc sự kiện: Cả hai quá ân hạn. Kết quả cần có: Bên mất kết nối trước thua do quá hạn mất kết nối.
- Máy chủ khởi động lại giữa ván online trong phòng tự tạo thì ván bị gián đoạn, không có người thắng, thua hay hoà. Khi nối lại, phòng về chờ, cả hai chưa sẵn sàng; hộp “Ván bị gián đoạn” có Ở lại phòng/Rời phòng. Không áp hạn tự đóng phòng sau 10 phút.

**Việc cần làm**

- Đối soát mất mạng một/hai phía, trở lại trước hạn và hết giờ trước hạn; giữ kết quả bị gián đoạn và phòng về chờ khi máy chủ khởi động lại.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát ân hạn mất kết nối, đồng hồ tiếp tục và khởi động lại máy chủ bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ ân hạn mất kết nối, đồng hồ tiếp tục và khởi động lại máy chủ; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.

**Phạm vi và phối hợp**

Không tạo thắng/thua/hòa cho ván bị gián đoạn do máy chủ khởi động lại.

---

<a id="t52"></a>

#### T52 · BE mất kết nối, ân hạn, đồng bộ lại và server restart

| Trường | Giá trị |
|---|---|
| Issue Id | 88 |
| Issue Type | Task |
| Parent | EP-05 |
| Assignee | Đông |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-88 |
| Start date | 29/10/2026 |
| Due date | 30/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v1.0 |
| Original Estimate | 12 giờ |
| Remaining Estimate | 12 giờ |
| Story Points | 3 |
| Story (relates to) | US-05.3 |
| Is blocked by | T56 |
| Component chính | BE |
| Components | BE, Phòng chơi, Ván trực tuyến |
| Labels | chinh-be, p1, phat-trien, phong-choi, sprint-3, van-truc-tuyen |
| Nguồn đặc tả (BA / AC) | 0.7, 0.10, 0.17, 2.8, 3.3, 8.3 |


**Description**

**Mục tiêu**

Xử lý mất kết nối ở máy chủ để người chơi có cơ hội quay lại và ván kết thúc đúng lý do.

**Bối cảnh công việc**

Máy chủ giữ trạng thái ván và là nơi quyết định thời gian, lượt đi, kết quả. Giao diện thông báo nối lại đã có phần việc riêng; phần này cung cấp trạng thái chính xác để giao diện hiển thị và phối hợp với quản lý phiên đăng nhập.

**Yêu cầu cần đáp ứng**

- Người chơi mất kết nối trong ván online được ân hạn 60 giây; đồng hồ vẫn chạy. Ở phòng chờ chỉ giữ ghế 60 giây rồi mất ghế, không xử thua. Quay lại trong hạn nhận đúng thế, đồng hồ, vai trò và dữ liệu hiển thị.
- Trong ván đang diễn ra, nếu đồng hồ về 0 trước khi hết ân hạn mất kết nối thì xử thua do hết giờ; nếu ân hạn hết trước thì xử thua do mất kết nối. Cả hai mất mạng thì bên mất kết nối trước thua khi quá hạn. Quy tắc xử thua này không áp dụng cho phòng đang chờ chưa có ván.
- Người xem được giữ chỗ tối đa 5 phút khi mất mạng; quay lại đúng hạn được tiếp tục xem, quá hạn mất chỗ mà không bị xử phạt.
- Máy chủ khởi động lại giữa ván online: ghi nhận ván bị gián đoạn, không thắng, thua hay hoà. Phòng tự tạo trở về chờ, cả hai chưa Sẵn sàng; cho phép Ở lại phòng hoặc Rời phòng và không tự đóng sau 10 phút.

**Việc cần làm**

- Phân biệt mất kết nối của người đang đấu, người ngồi phòng chờ và người xem; lưu hạn giữ chỗ tương ứng. Khi nối lại, tra danh tính, ghế giữ và trạng thái ván hiện tại trước khi cấp quyền hoặc trả kết quả đã kết thúc.
- Lưu thời điểm mất kết nối, hạn giữ ghế và thời gian còn lại từ cùng nguồn thời gian phía máy chủ. Xử lý đồng hồ hết giờ và sự kiện nối lại theo thứ tự xác định để không kết thúc một ván hai lần.
- Kiểm danh tính và quyền trước khi khôi phục quyền điều khiển; gửi lại toàn bộ trạng thái cần thiết, không chỉ những nước đi bị thiếu. Phối hợp với giới hạn phiên để người đã hết quyền không tiếp tục điều khiển.
- Tạo kiểm thử tự động cho mất mạng ngắn, quá hạn, hết giờ trước, cả hai cùng mất mạng và khởi động lại; lưu kết quả để nhóm kiểm thử chạy lại với thiết bị thật.

**Kết quả bàn giao**

- Mã xử lý mất kết nối, nối lại và gián đoạn phía máy chủ; mô tả dữ liệu bàn giao cho giao diện.
- Các kiểm thử tự động và bằng chứng về thứ tự xử lý thời gian, quyền điều khiển, kết quả ván.
- Bảng chuyển trạng thái theo người đang đấu, phòng chờ, người xem; dữ liệu đồng bộ lại và kết quả sau restart.

**Điều kiện hoàn thành**

- Chạy thử các tình huống trên cho kết quả duy nhất, đúng hạn và đồng nhất ở mọi người tham gia; không có nước đi được chấp nhận từ người đã mất quyền.
- Dữ liệu nối lại đủ để giao diện tiếp tục ván; gián đoạn máy chủ không bị biến thành chiến thắng hoặc khôi phục một thế cờ không còn lưu.
- Mất mạng trong đếm bắt đầu huỷ đếm và giữ ghế 60 giây, không tạo ván hay ghi thua. Người cuối mất ghế ở phòng chờ làm đóng phòng; nếu còn người ngồi thì chuyển chủ khi cần.

**Phạm vi và phối hợp**

Chỉ thực hiện xử lý phía máy chủ và dữ liệu đồng bộ. Không xây lại lớp phủ thông báo mất mạng; kiểm nghiệm đầu-cuối trên giao diện thật được thực hiện ở công việc kiểm thử mất kết nối.

---

<a id="t60"></a>

#### T60 · Kiểm thử US-05.3

| Trường | Giá trị |
|---|---|
| Issue Id | 96 |
| Issue Type | Task |
| Parent | EP-05 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-96 |
| Start date | 02/11/2026 |
| Due date | 02/11/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 4 giờ |
| Remaining Estimate | 4 giờ |
| Story Points | 1 |
| Story (relates to) | US-05.3 |
| Is blocked by | T25, T52 |
| Component chính | QA & DevOps |
| Components | Phòng chơi, QA & DevOps, Ván trực tuyến |
| Labels | chinh-qa-devops, kiem-thu, p1, phong-choi, sprint-4, van-truc-tuyen |
| Nguồn đặc tả (BA / AC) | 0.7, 0.10, 0.17, 2.8, 3.3, 8.3 |


**Description**

**Mục tiêu**

Kiểm chứng cách xử lý mất mạng và gián đoạn để kết quả ván không sai.

**Bối cảnh công việc**

Dùng hai thiết bị chơi một ván có đồng hồ và ít nhất một người quan sát. Chuẩn bị cách ngắt kết nối từng thiết bị độc lập, đồng hồ ghi thời điểm và quyền khởi động lại máy chủ thử nghiệm; thao tác trên môi trường thử riêng.

**Yêu cầu cần đáp ứng**

- Ngắt mạng một người trong ván: phía đó có lớp phủ nối lại và ân hạn 60 giây, Escape không đóng; đối thủ thấy “Đối thủ đang mất kết nối, thời gian chờ: 60s”. Đồng hồ vẫn chạy.
- Nối lại trong 60 giây: lớp phủ tắt, bàn cờ, đồng hồ và chat khớp máy chủ, ván tiếp tục. Quá hạn: bên mất mạng thua vì mất kết nối.
- Ngắt khi bên đó gần hết giờ: nếu hết giờ trước ân hạn thì lý do thua là hết giờ. Nếu hai người cùng mất mạng nhưng máy chủ vẫn chạy, bên mất kết nối trước thua khi cả hai quá hạn.
- Khởi động lại máy chủ giữa ván: kết quả “Ván bị gián đoạn”, không thắng/thua/hoà; phòng tự tạo về chờ, đặt lại Sẵn sàng, có Ở lại phòng/Rời phòng và không hạn đóng 10 phút.

**Việc cần làm**

- Chuẩn bị thêm phòng chỉ có chủ và phòng đang đếm vào ván; lưu mốc mất mạng, hết giờ, hết giữ ghế và nối lại để xác định nguyên nhân kết thúc bằng dữ liệu máy chủ, không chỉ theo đồng hồ màn hình.
- Tạo ván có đủ thời gian; ngắt mạng một người 30 giây rồi nối lại, đối chiếu trạng thái trước và sau.
- Lặp với hơn 60 giây; tạo ván khác có đồng hồ sắp hết để kiểm hết giờ trước ân hạn.
- Ngắt hai người ở hai mốc khác nhau trong khi máy chủ vẫn hoạt động, kiểm chỉ bên mất trước bị xử thua.
- Khởi động lại máy chủ giữa ván, nối lại và thử Ở lại phòng, Sẵn sàng vào ván mới; kết quả cũ phải trung tính.
- Ghi từng ca là Đạt, Không đạt hoặc Chưa kiểm được cùng dữ liệu, thời điểm và bằng chứng đã che bí mật. Báo lỗi có cách tái hiện; sau sửa chạy lại ca lỗi và các nhánh liên quan.

**Kết quả bàn giao**

- Bộ ca kiểm có bước chạy, dữ liệu và kết quả mong đợi để thành viên khác thực hiện lại được.
- Bảng kết quả thực tế cùng bằng chứng và danh sách lỗi còn mở; các lượt kiểm lại giữ được liên hệ với lỗi ban đầu.

**Điều kiện hoàn thành**

- Mọi tình huống nêu trên có kết quả đúng và bằng chứng lặp lại được; sai quyền, sai kết quả hoặc sai hạn thời gian phải ghi Không đạt, chưa được kết luận hoàn tất.
- Thiếu thiết bị, thiếu dữ liệu hoặc lỗi của phần tích hợp phải ghi rõ là Chưa kiểm được; việc người phụ trách biết vấn đề không thay thế kết quả đạt.
- Mất mạng lúc chờ/đếm không ghi thua; hết 60 giây mất ghế, đóng phòng nếu không còn ai ngồi và báo người xem. Người xem nối lại trước/sau 5 phút được xử lý đúng chỗ giữ.

**Phạm vi và phối hợp**

Công việc này chuẩn bị và thực hiện kiểm thử cho phạm vi trên. Người triển khai chức năng chịu trách nhiệm sửa lỗi; kết quả kiểm cục bộ không thay thế việc nghiệm thu toàn bộ sản phẩm.

---

<a id="ep-06"></a>

## EP-06 · Chế độ phòng và người xem

| Trường | Giá trị |
|---|---|
| Issue Id | 7 |
| Issue Type | Epic |
| Parent | — |
| Assignee | Tình |
| Reporter | Tình |
| Priority | Medium |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-7 |
| Start date | 20/10/2026 |
| Due date | 27/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Component chính | Tổng hợp phạm vi các Task |
| Components | BE, Camera và mic, FE, Phòng chơi, QA & DevOps |
| Labels | EP-06, camera-va-mic, dac-ta, p1, phong-choi |
| Nguồn đặc tả (BA / AC) | 0.3, 0.5, 0.7, 2.7, 2.8, 4.1, 4.2, 4.3, 10.4, 11 |


**Description**

**Mục tiêu**

Bàn giao bộ đặc tả đã duyệt về chế độ phòng, Sảnh và người xem; bảo đảm các đặc tả thành phần nhất quán khi triển khai.

**Bối cảnh công việc**

Có ba chế độ: Công khai, Chỉ vào bằng mã và Khóa phòng. Mỗi phòng có hai ghế và tối đa năm người xem; quyền thay đổi theo vai trò và trạng thái ván. Các quyết định sản phẩm đã có hiệu lực; nhóm chức năng này tổng hợp và truy vết yêu cầu, không mở một vòng quyết định hoặc duyệt lại phạm vi.

**Yêu cầu cần đáp ứng**

- Phòng công khai xuất hiện ở Sảnh, phòng chỉ bằng mã hoặc khóa không xuất hiện. Sảnh tối đa 50 phòng, mới mở công khai lên trước, cập nhật tức thời; Vào chơi nhận ghế còn trống, Vào xem luôn là người xem.
- Mỗi phòng hai ghế cộng tối đa năm chỗ xem; máy chủ kiểm lại sức chứa và quyền khi tham gia. Chỉ chủ phòng đổi chế độ, chỉ khóa khi đủ hai ghế; mở khóa sinh mã/đường dẫn mới.
- Người xem không tự xuống ghế hoặc phát hình/tiếng; mời xuống ghế phải được chấp nhận, không giữ ghế. Cả hai người chơi được đuổi/chặn người xem tới khi phòng đóng; danh tính Khách mới vẫn có thể vào nếu phòng chưa khóa.

**Việc cần làm**

- Đối chiếu các đặc tả thành phần về chế độ phòng, Sảnh và người xem với quyết định hiện hành; kiểm đầy đủ luồng, quyền, giới hạn và ngoại lệ nêu trên.
- Rà các điểm giao với nhóm chức năng khác, gắn yêu cầu với công việc triển khai và tình huống kiểm thử; sửa sai lệch theo nguồn nghiệp vụ ưu tiên.
- Theo dõi độ đầy đủ của hồ sơ thành phần và bằng chứng phải bổ sung; mâu thuẫn chưa giải được theo thứ tự ưu tiên nguồn cần báo người phụ trách sản phẩm, không tự sửa quyết định đã duyệt.

**Kết quả bàn giao**

- Bản tổng hợp đối soát chế độ phòng, Sảnh và người xem, kèm truy vết tới đặc tả thành phần và quyết định nguồn.
- Danh sách điểm giao, tình huống nghiệm thu và sai lệch cần xử lý; bằng chứng kỹ thuật được quản lý tại công việc triển khai/kiểm chứng liên quan.

**Điều kiện hoàn thành**

- Các đặc tả thành phần phản ánh đúng chế độ phòng, Sảnh và người xem theo yêu cầu bên trên và thống nhất tại các điểm giao.
- Hồ sơ hoàn tất theo đặc tả thành phần cuối cùng, không yêu cầu người phụ trách sản phẩm duyệt lại quy tắc đã chốt. Kết quả chạy phần mềm và kiểm thử chỉ được ghi nhận khi có bằng chứng riêng.

**Phạm vi và phối hợp**

Không để người xem tự chiếm ghế hoặc phát camera/mic; không triển khai ghép trận và bảng xếp hạng.

---

<a id="us-06.1"></a>

### US-06.1 · Cài đặt phòng: PUBLIC / CODE_ONLY / LOCKED

| Trường | Giá trị |
|---|---|
| Issue Id | 29 |
| Issue Type | Story |
| Parent | EP-06 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-29 |
| Start date | 22/10/2026 |
| Due date | 25/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T53, T57, T62 |
| Sprint thi công | S3, S4 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | BE, FE, Phòng chơi, QA & DevOps |
| Labels | EP-06, dac-ta, p1, phong-choi |
| Nguồn đặc tả (BA / AC) | 0.5, 0.7, 2.7, 2.8, 4.3 |


**Description**

**Mục tiêu**

Bàn giao đặc tả quyền của chủ phòng khi cho phép vào công khai, chỉ vào bằng mã hoặc khóa người mới theo quy tắc đã duyệt.

**Bối cảnh công việc**

Phòng công khai xuất hiện ở Sảnh; phòng chỉ vào bằng mã không xuất hiện ở đó; phòng khóa chặn người mới nhưng giữ thành viên đang có quyền. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Bối cảnh: Trong phòng. Thao tác hoặc sự kiện: Người không phải chủ phòng. Kết quả cần có: Không thấy nút "Cài đặt phòng".
- Bối cảnh: Chưa đủ hai người chơi. Thao tác hoặc sự kiện: chủ phòng mở Cài đặt. Kết quả cần có: Lựa chọn Khóa phòng không bấm được kèm chú thích "Chỉ khoá được khi đã đủ 2 người chơi".
- Bối cảnh: Đủ hai người chơi. Thao tác hoặc sự kiện: chủ phòng chọn Khóa phòng (kể cả đang ván). Kết quả cần có: Không ai mới vào được; mọi đường dẫn/mã/lời mời chưa dùng bị vô hiệu; người xem hiện có vẫn ở lại, không mất hình/tiếng.
- Bối cảnh: Phòng đang khoá. Thao tác hoặc sự kiện: Người chơi mất mạng rồi nối lại trong 60 giây, người xem trong 5 phút. Kết quả cần có: Vào lại được; quá hạn thì bị coi là người mới (bị chặn).
- Khi chủ phòng mở lại phòng đang khoá sang chế độ vào bằng mã/đường dẫn hoặc công khai, phải sinh mã và đường dẫn mới; bản cũ không dùng lại được.
- Nếu một người ngồi ghế rời phòng đang khoá, phòng vẫn giữ khoá cho tới khi chủ phòng tự mở.
- Bối cảnh: Phòng đang khoá. Thao tác hoặc sự kiện: Người mới mở đường dẫn/mã. Kết quả cần có: Bị từ chối dù có đường dẫn/mã.

**Việc cần làm**

- Đối chiếu quyền chủ phòng, điều kiện đủ hai ghế để khóa, vô hiệu lời mời cũ và ngoại lệ nối lại; phòng vẫn khóa khi một người rời.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát ba chế độ phòng, khóa người mới, nối lại và thay mã khi mở khóa bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ ba chế độ phòng, khóa người mới, nối lại và thay mã khi mở khóa; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.

**Phạm vi và phối hợp**

Không đổi số chỗ xem hoặc mức giờ trong cài đặt phòng.

---

<a id="t53"></a>

#### T53 · BE chế độ PUBLIC / CODE_ONLY / LOCKED, thu hồi mã

| Trường | Giá trị |
|---|---|
| Issue Id | 89 |
| Issue Type | Task |
| Parent | EP-06 |
| Assignee | Tùng |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-89 |
| Start date | 24/10/2026 |
| Due date | 25/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 12 giờ |
| Remaining Estimate | 12 giờ |
| Story Points | 3 |
| Story (relates to) | US-06.1 |
| Is blocked by | T22 |
| Component chính | BE |
| Components | BE, Phòng chơi |
| Labels | chinh-be, p1, phat-trien, phong-choi, sprint-3 |
| Nguồn đặc tả (BA / AC) | 0.5, 0.7, 2.8, 4.3 |


**Description**

**Mục tiêu**

Cho chủ phòng kiểm soát người mới vào bằng ba chế độ và bảo đảm mã mời cũ mất hiệu lực khi cần.

**Bối cảnh công việc**

Phòng có thể Công khai để xuất hiện ở Sảnh, Chỉ vào bằng mã hoặc đường dẫn để mời riêng, hoặc Khoá phòng để chặn người mới. Máy chủ phải thực thi quyền này ở mọi đường vào, kể cả yêu cầu gửi trực tiếp.

**Yêu cầu cần đáp ứng**

- Chỉ chủ phòng được thay đổi chế độ. Chỉ được bật Khoá phòng khi có đủ hai người ngồi ghế; được khoá cả khi đang đấu.
- Khoá phòng chặn người mới và vô hiệu mã, đường dẫn, lời mời chưa dùng. Người đã ở trong phòng vẫn ở lại; người xem hiện có không mất hình tiếng chỉ vì đổi chế độ.
- Người chơi nối lại trong 60 giây và người xem nối lại trong 5 phút vẫn được nhận lại chỗ đã giữ. Quá hạn, họ được xét như người mới và bị chặn nếu phòng còn khoá.
- Mở lại từ Khoá phòng sang Công khai hoặc Chỉ vào bằng mã phải sinh mã và đường dẫn mới; thông tin mời cũ không dùng được. Một người rời ghế không tự mở khoá.

**Việc cần làm**

- Nhận lệnh đổi chế độ kèm phòng và danh tính đã xác thực; trả chế độ thực tế, mã/link còn hiệu lực và lỗi nếu không đủ quyền/ghế. Cập nhật hiệu lực lời mời cùng chế độ trước khi chấp nhận lượt vào kế tiếp.
- Xây thao tác đổi chế độ có kiểm quyền chủ phòng và kiểm lại số người ngồi ghế ngay khi xử lý; không dựa riêng vào điều kiện đã kiểm ở giao diện.
- Cập nhật trạng thái phòng, hiệu lực thông tin mời và thông báo thay đổi cho người trong phòng cùng danh sách Sảnh. Giữ nhất quán khi có người vào cùng lúc với thao tác khoá.
- Viết kiểm thử cho người không có quyền, thiếu ghế, khoá giữa ván, mở lại, dùng mã cũ và nối lại trong hoặc quá hạn.

**Kết quả bàn giao**

- Chức năng đổi chế độ phía máy chủ, thu hồi thông tin mời và dữ liệu cập nhật cho giao diện.
- Bộ kiểm thử tự động với bằng chứng các đường vào đều tuân thủ chế độ.

**Điều kiện hoàn thành**

- Người mới không thể vượt khoá bằng mã, đường dẫn hoặc lời mời cũ; người có quyền nối lại không bị nhầm thành người mới.
- Mở khoá sinh thông tin mời mới và không làm mất trạng thái người đang chơi, đang xem.
- Hai đường Công khai và Chỉ vào bằng mã đều nhận mã mới khi mở khoá; đổi chế độ không ngắt người xem cũ hoặc thay đổi mức chia sẻ media đã chọn.

**Phạm vi và phối hợp**

Phần này thực thi quy tắc phía máy chủ; hộp cài đặt và danh sách Sảnh do các công việc giao diện sử dụng kết quả bàn giao.

---

<a id="t57"></a>

#### T57 · FE Cài đặt phòng

| Trường | Giá trị |
|---|---|
| Issue Id | 93 |
| Issue Type | Task |
| Parent | EP-06 |
| Assignee | Cường |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-93 |
| Start date | 27/10/2026 |
| Due date | 27/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 4 giờ |
| Remaining Estimate | 4 giờ |
| Story Points | 1 |
| Story (relates to) | US-06.1 |
| Is blocked by | T53 |
| Component chính | FE |
| Components | FE, Phòng chơi |
| Labels | chinh-fe, p1, phat-trien, phong-choi, sprint-3 |
| Nguồn đặc tả (BA / AC) | 0.7, 2.8, 4.3 |


**Description**

**Mục tiêu**

Tạo hộp Cài đặt phòng để chủ phòng chọn cách cho người khác tham gia.

**Bối cảnh công việc**

Người chủ cần hiểu khác nhau giữa công khai, mời bằng mã và khoá phòng. Giao diện phải phản ánh quyết định thật từ máy chủ; việc chọn trên màn hình chưa có nghĩa thay đổi đã thành công.

**Yêu cầu cần đáp ứng**

- Chỉ chủ phòng thấy nút Cài đặt phòng. Hộp có ba lựa chọn: Công khai để xuất hiện ở Sảnh; Chỉ vào bằng mã hoặc đường dẫn; Khoá phòng để chặn người mới.
- Khi chưa đủ hai người ngồi ghế, Khoá phòng không bấm được và có chú thích “Chỉ khoá được khi đã đủ 2 người chơi”. Khi đủ hai người, chủ phòng có thể chọn kể cả trong ván.
- Sau khi mở lại từ trạng thái khoá, hiển thị mã và đường dẫn mới do máy chủ trả về; không tiếp tục đưa mã cũ cho người dùng sao chép.
- Nếu một người rời ghế khi phòng đang khoá, giao diện vẫn hiển thị khoá; không tự chọn chế độ mở. Người xem hiện có vẫn ở phòng.

**Việc cần làm**

- Nhận chế độ hiện tại, chủ phòng và số ghế từ trạng thái phòng; cập nhật hộp đang mở khi chủ chuyển hoặc ghế thay đổi, để thao tác gửi đi luôn được máy chủ kiểm trên dữ liệu mới.
- Xây hộp chọn với tên và giải thích ngắn bằng tiếng Việt. Hiển thị lựa chọn hiện tại, trạng thái đang gửi, thành công và lỗi; tránh thao tác lặp khi chưa có phản hồi.
- Nối thao tác chọn với dịch vụ đổi chế độ. Khi bị từ chối do quyền hoặc số ghế vừa thay đổi, giữ trạng thái máy chủ xác nhận và hiển thị lý do.
- Cập nhật thông tin chia sẻ phòng từ phản hồi mới. Kiểm sử dụng bằng chuột, bàn phím và màn hình điện thoại, gồm mở, đóng và vị trí chọn trong hộp.
- Chạy thử bằng tài khoản chủ phòng, người chơi còn lại và người xem; thử khoá lúc thiếu ghế, khi đủ ghế, rồi mở lại và đối chiếu mã.

**Kết quả bàn giao**

- Hộp Cài đặt phòng sử dụng dữ liệu thật và các trạng thái chờ, lỗi, không được thao tác.
- Bằng chứng chạy các tình huống đổi chế độ và hiển thị thông tin mời mới.

**Điều kiện hoàn thành**

- Chỉ đúng người có quyền thấy thao tác; chế độ hiển thị luôn khớp phản hồi máy chủ, không báo thành công giả.
- Có thể thao tác trên điện thoại và bằng bàn phím; chú thích giải thích rõ lý do lựa chọn bị khoá.
- Hộp đang mở không tiếp tục cho người đã mất quyền chủ đổi chế độ; khi khoá/mở khoá thất bại, cả nhãn chế độ và thông tin chia sẻ vẫn phản ánh trạng thái được xác nhận.

**Phạm vi và phối hợp**

Phần giao diện không tự sinh mã, thu hồi lời mời hoặc quyết định quyền vào phòng. Những việc đó do máy chủ thực thi.

---

<a id="t62"></a>

#### T62 · Kiểm thử US-06.1

| Trường | Giá trị |
|---|---|
| Issue Id | 98 |
| Issue Type | Task |
| Parent | EP-06 |
| Assignee | Nhạn |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-98 |
| Start date | 02/11/2026 |
| Due date | 02/11/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 1 |
| Story (relates to) | US-06.1 |
| Is blocked by | T31, T33, T52, T55, T57 |
| Component chính | QA & DevOps |
| Components | Phòng chơi, QA & DevOps |
| Labels | chinh-qa-devops, kiem-thu, p1, phong-choi, sprint-4 |
| Nguồn đặc tả (BA / AC) | 0.5, 0.7, 2.8, 4.3 |


**Description**

**Mục tiêu**

Kiểm chứng ba chế độ vào phòng và hiệu lực của mã mời.

**Bối cảnh công việc**

Chuẩn bị chủ phòng, người chơi thứ hai, người xem đang ở trong phòng và một người bên ngoài. Ghi mã cùng đường dẫn mời trước khi đổi chế độ để thử lại sau khi khoá và mở khoá; không chỉ quan sát giao diện của chủ phòng.

**Yêu cầu cần đáp ứng**

- Người không phải chủ không thấy Cài đặt phòng và gọi trực tiếp đổi chế độ cũng bị từ chối.
- Chưa đủ hai người chơi: Khoá phòng bị vô hiệu, có “Chỉ khoá được khi đã đủ 2 người chơi”. Đủ hai người thì chủ khoá được cả trong ván.
- Khoá chặn mọi người mới, vô hiệu mã/link/lời mời chưa dùng; người xem đang có vẫn ở lại và giữ hình tiếng.
- Người chơi nối lại trong 60 giây, người xem trong 5 phút nhận lại chỗ; quá hạn coi là người mới và bị chặn nếu còn khoá.
- Mở lại sang Công khai hoặc Chỉ vào bằng mã/đường dẫn sinh mã và link mới; bản cũ không dùng được.
- Một người ngồi ghế rời không tự mở khoá. Người mới có mã/link vẫn bị từ chối đến khi chủ mở lại.

**Việc cần làm**

- Lập bảng các lối vào mã, đường dẫn, thông báo mời và nút Sảnh; thử khi đang mở, sau khoá và sau mở khoá. Ghi vai trò và chỗ giữ để phân biệt người mới với người nối lại.
- Ghi mã/link ban đầu và vai trò từng người; thử gọi đổi chế độ bằng người không phải chủ.
- Thử khoá lúc thiếu ghế, đủ ghế và đang ván; dùng thông tin mời cũ từ trình duyệt ngoài phòng.
- Trong phòng khoá, thử nối lại trước/sau hạn 60 giây và 5 phút với đúng vai trò.
- Cho một người rời rồi mở lại; đối chiếu mã mới và thử cả mã cũ lẫn mới.
- Ghi từng ca là Đạt, Không đạt hoặc Chưa kiểm được cùng dữ liệu, thời điểm và bằng chứng đã che bí mật. Báo lỗi có cách tái hiện; sau sửa chạy lại ca lỗi và các nhánh liên quan.

**Kết quả bàn giao**

- Bộ ca kiểm có bước chạy, dữ liệu và kết quả mong đợi để thành viên khác thực hiện lại được.
- Bảng kết quả thực tế cùng bằng chứng và danh sách lỗi còn mở; các lượt kiểm lại giữ được liên hệ với lỗi ban đầu.

**Điều kiện hoàn thành**

- Mọi tình huống nêu trên có kết quả đúng và bằng chứng lặp lại được; sai quyền, sai kết quả hoặc sai hạn thời gian phải ghi Không đạt, chưa được kết luận hoàn tất.
- Thiếu thiết bị, thiếu dữ liệu hoặc lỗi của phần tích hợp phải ghi rõ là Chưa kiểm được; việc người phụ trách biết vấn đề không thay thế kết quả đạt.
- Mở khoá ở cả hai chế độ đều sinh mã/link mới, mọi bản cũ bị từ chối. Thay đổi chế độ phản ánh trên Sảnh nhưng không đẩy người xem hiện hữu ra khỏi phòng hoặc cắt media của họ.

**Phạm vi và phối hợp**

Bổ sung 4 giờ trong ước lượng cho ma trận quyền vào phòng PUBLIC/CODE_ONLY/LOCKED, kiểm lại và lưu bằng chứng theo phạm vi đã đặc tả.

Công việc này chuẩn bị và thực hiện kiểm thử cho phạm vi trên. Người triển khai chức năng chịu trách nhiệm sửa lỗi; kết quả kiểm cục bộ không thay thế việc nghiệm thu toàn bộ sản phẩm.

---

<a id="us-06.2"></a>

### US-06.2 · Sảnh và danh sách phòng công khai

| Trường | Giá trị |
|---|---|
| Issue Id | 30 |
| Issue Type | Story |
| Parent | EP-06 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-30 |
| Start date | 25/10/2026 |
| Due date | 28/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T54, T61, T67 |
| Sprint thi công | S3, S4 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | BE, FE, Phòng chơi, QA & DevOps |
| Labels | EP-06, dac-ta, p1, phong-choi |
| Nguồn đặc tả (BA / AC) | 0.3, 0.5, 0.11, 0.12, 0.17, 2.0, 10.4, 11 |


**Description**

**Mục tiêu**

Bàn giao đặc tả Sảnh để người chơi tìm phòng công khai, vào chơi hoặc xem, đọc luật và đi đến các chức năng đã có theo quy tắc đã duyệt.

**Bối cảnh công việc**

Sảnh là trang chính sau đăng nhập. Danh sách phòng cần phản ánh thay đổi thực tế và xử lý trường hợp ghế bị người khác lấy trước. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Mỗi phòng công khai ở Sảnh hiển thị tên phòng, tên chủ phòng (kèm “(Khách)” nếu có), mức giờ, trạng thái Đang chờ/Đang đấu và số người xem x/N. x là số đang xem, N là số chỗ xem tối đa của phòng; N bằng 0 thì hiện “Không cho xem”.
- Bối cảnh: Danh sách. Thao tác hoặc sự kiện: Sắp xếp. Kết quả cần có: Phòng mở Công khai gần nhất lên đầu; tối đa 50 phòng.
- Bối cảnh: Đang mở Sảnh. Thao tác hoặc sự kiện: Phòng mới mở Công khai, đổi trạng thái, đổi số người, đóng hoặc rời Công khai. Kết quả cần có: Danh sách tự cập nhật trong ≤ 2 giây, không cần tải lại.
- Bối cảnh: Phòng còn ghế trống. Thao tác hoặc sự kiện: Xem dòng. Kết quả cần có: Có nút "Vào chơi"; có thêm "Vào xem" nếu còn chỗ xem.
- Bối cảnh: Phòng đủ hai ghế. Thao tác hoặc sự kiện: Xem dòng. Kết quả cần có: Chỉ có "Vào xem" (nếu còn chỗ xem); hết chỗ hoặc N = 0 thì không có nút vào.
- Bối cảnh: Bấm "Vào chơi". Thao tác hoặc sự kiện: Ghế vừa bị người khác lấy. Kết quả cần có: Còn chỗ xem → vào làm Người xem kèm "Ghế vừa có người, bạn đang xem trận"; hết chỗ → báo phòng đầy.
- Bối cảnh: Bấm "Vào xem". Thao tác hoặc sự kiện: Còn chỗ. Kết quả cần có: Vào làm Người xem, không tự chiếm ghế dù ghế trống.
- Bối cảnh: Không có phòng Công khai. Thao tác hoặc sự kiện: Mở Sảnh. Kết quả cần có: Trạng thái danh sách trống có lời giải thích và nút "Tạo phòng".
- Bối cảnh: Phòng Chỉ vào bằng mã/Khóa phòng. Thao tác hoặc sự kiện: Mở Sảnh. Kết quả cần có: Không xuất hiện.
- Bối cảnh: Mở Sảnh. Thao tác hoặc sự kiện: Xem bốn lựa chọn. Kết quả cần có: "Đánh Thường – Ghép ngẫu nhiên" và "Đánh Hạng" không bấm được kèm "Sắp ra mắt"; "Tự tạo phòng" và "Đánh với máy" hoạt động; có ô "Vào phòng bằng mã".
- Mục Luật chơi mở rộng hoặc thu gọn ngay trong Sảnh, không mở trang hoặc hộp thoại mới, dùng được bằng bàn phím. Nội dung gồm cách đi của 7 loại quân; chiếu hết và hết nước đi đều thua; lặp thế 3 lần hoà; bên chiếu liên tục thua, cả hai cùng chiếu thì hoà; 120 nửa nước không ăn quân hoà; xin hoà, đầu hàng, hết giờ và ân hạn mất kết nối 60 giây. Một nửa nước là một lượt đi của một bên. Đuổi quân liên tục không xử riêng mà xét hoà theo lặp thế. Có câu “Đây là bộ luật rút gọn của ứng dụng, không phải toàn bộ luật thi đấu chính thức”.
- Bối cảnh: Thanh điều hướng. Thao tác hoặc sự kiện: Xem mục. Kết quả cần có: Sảnh, Bạn bè hoạt động (Khách: Bạn bè không bấm được); Lịch sử, Bảng xếp hạng không bấm được "Sắp ra mắt"; chuông lời mời kết bạn; ảnh đại diện + tên hiển thị mở menu Cài đặt hồ sơ.
- Bối cảnh: Màn hình Đăng nhập. Thao tác hoặc sự kiện: Xem liên kết "Quên mật khẩu?". Kết quả cần có: không bấm được kèm "Sắp ra mắt".
- Bối cảnh: Khách. Thao tác hoặc sự kiện: Vào phòng bằng mã/đường dẫn, Vào chơi/Vào xem ở Sảnh, Đánh với máy. Kết quả cần có: Đều được phép theo luật phòng.
- Bối cảnh: chủ phòng. Thao tác hoặc sự kiện: Chuyển sang Công khai. Kết quả cần có: Phòng xuất hiện ở danh sách Sảnh trong ≤ 2 giây.
- Bối cảnh: Phòng Công khai. Thao tác hoặc sự kiện: chủ phòng chuyển sang Chỉ vào bằng mã hoặc Khóa phòng. Kết quả cần có: Phòng biến khỏi danh sách Sảnh; yêu cầu vào từ danh sách cũ bị máy chủ từ chối.
- Nội dung luật rút gọn phải nhất quán với ưu tiên kết quả: kiểm đồng hồ trước khi duyệt nước, chiếu hết cao nhất, hết nước đi hoặc chiếu liên tục ưu tiên trước hòa 120 nửa nước.

**Việc cần làm**

- Đối soát cột, thứ tự, trần 50 phòng và cập nhật tức thời; kiểm ghế bị chiếm trước, danh sách cũ, Khách và các lối vào chưa phát triển.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát danh sách công khai, Vào chơi/Vào xem, luật rút gọn và điều hướng theo phạm vi bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ danh sách công khai, Vào chơi/Vào xem, luật rút gọn và điều hướng theo phạm vi; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.

**Phạm vi và phối hợp**

Lối vào điều hướng chính của tính năng để sau hiển thị Sắp ra mắt và không bấm được; chức năng nằm sâu được ẩn. Không triển khai ghép trận hay đánh hạng.

---

<a id="t54"></a>

#### T54 · BE danh sách phòng PUBLIC realtime, Vào chơi/Vào xem

| Trường | Giá trị |
|---|---|
| Issue Id | 90 |
| Issue Type | Task |
| Parent | EP-06 |
| Assignee | Đông |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-90 |
| Start date | 27/10/2026 |
| Due date | 27/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-06.2 |
| Is blocked by | T53 |
| Component chính | BE |
| Components | BE, Phòng chơi |
| Labels | chinh-be, p1, phat-trien, phong-choi, sprint-3 |
| Nguồn đặc tả (BA / AC) | 0.3, 0.5, 2.8 |


**Description**

**Mục tiêu**

Cung cấp danh sách phòng công khai và quyết định đúng vai trò khi người dùng vào từ Sảnh.

**Bối cảnh công việc**

Sảnh giúp người chưa được mời tìm phòng để chơi hoặc xem. Danh sách là ảnh chụp có thể đã cũ khi người dùng bấm, nên máy chủ phải kiểm lại chế độ, ghế và sức chứa tại thời điểm nhận yêu cầu.

**Yêu cầu cần đáp ứng**

- Chỉ liệt kê phòng Công khai, tối đa 50 phòng, sắp phòng vừa mở công khai gần nhất lên đầu. Phòng chỉ vào bằng mã hoặc đang khoá không được xuất hiện.
- Mỗi dòng có tên phòng, chủ phòng và nhãn Khách nếu có, mức giờ, trạng thái đang chờ hoặc đang đấu, số người xem hiện tại và giới hạn. Phòng không cho xem phải thể hiện rõ.
- Phát cập nhật khi phòng mở hoặc rời công khai, đóng, đổi trạng thái hoặc số người; danh sách phía người dùng cập nhật trong không quá 2 giây.
- Vào chơi ưu tiên ghế trống; ghế vừa bị lấy thì chuyển thành người xem nếu còn chỗ và báo “Ghế vừa có người, bạn đang xem trận”. Hết chỗ thì từ chối. Vào xem luôn là người xem, không tự chiếm ghế.
- Khách được sử dụng cả hai lối vào theo cùng quy tắc. Phòng vừa rời Công khai phải từ chối yêu cầu từ danh sách cũ.

**Việc cần làm**

- Dùng mốc mở Công khai để lấy tối đa 50 phòng gần nhất; trả đủ dữ liệu ghế/chỗ xem cho hai nút và nhãn Không cho xem. Khi một phòng rời danh sách, tính lại tập hiển thị để phòng hợp lệ kế tiếp có thể xuất hiện.
- Tạo dữ liệu danh sách và sự kiện cập nhật dùng chung cho các trình duyệt đang mở Sảnh; chỉ trả dữ liệu cần hiển thị.
- Xử lý yêu cầu vào phòng bằng cách kiểm lại quyền và sức chứa cùng lúc xếp chỗ, tránh hai yêu cầu cùng chiếm ghế hoặc vượt số người xem.
- Viết kiểm thử danh sách rỗng, đủ 50 phòng, đổi chế độ, phòng đóng và tranh chấp ghế; đo thời gian cập nhật trong môi trường trình diễn.

**Kết quả bàn giao**

- Dịch vụ danh sách công khai và thao tác vào chơi, vào xem phía máy chủ.
- Mô tả dữ liệu cùng kiểm thử và số đo thời gian cập nhật.

**Điều kiện hoàn thành**

- Danh sách không lộ phòng riêng hoặc phòng khoá; thứ tự và các cột đúng với trạng thái thật.
- Không vượt sức chứa khi người dùng bấm trên dữ liệu cũ; thông báo và vai trò cuối đúng từng nhánh.
- Ca có 51 phòng công khai vẫn chỉ trả 50 phòng đúng thứ tự; ghế và chỗ xem được kiểm lại trước xếp vai trò. Yêu cầu từ dòng đã chuyển riêng bị từ chối và yêu cầu làm mới danh sách.

**Phạm vi và phối hợp**

Không xây trang Sảnh trong công việc này. Kết quả là dữ liệu, sự kiện và xử lý vào phòng để giao diện dùng.

---

<a id="t61"></a>

#### T61 · FE Sảnh: bốn lựa chọn, Luật chơi, danh sách phòng, thanh điều hướng

| Trường | Giá trị |
|---|---|
| Issue Id | 97 |
| Issue Type | Task |
| Parent | EP-06 |
| Assignee | Kỳ |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-97 |
| Start date | 29/10/2026 |
| Due date | 30/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v1.0 |
| Original Estimate | 12 giờ |
| Remaining Estimate | 12 giờ |
| Story Points | 3 |
| Story (relates to) | US-06.2 |
| Is blocked by | T54, T57 |
| Component chính | FE |
| Components | FE, Phòng chơi |
| Labels | chinh-fe, p1, phat-trien, phong-choi, sprint-3 |
| Nguồn đặc tả (BA / AC) | 0.3, 0.5, 0.12, 0.17, 2.0, 10.4 |


**Description**

**Mục tiêu**

Hoàn thiện Sảnh để người dùng hiểu cách bắt đầu chơi, tìm phòng và xem luật.

**Bối cảnh công việc**

Sảnh là màn hình sau đăng nhập và nơi người chơi trở về từ phòng. Dữ liệu phòng công khai đã do máy chủ cung cấp; giao diện cần giải thích rõ phòng nào vào chơi được, phòng nào chỉ xem được và những tính năng chưa triển khai.

**Yêu cầu cần đáp ứng**

- Có bốn lựa chọn: Tự tạo phòng và Đánh với máy hoạt động; Đánh Thường – Ghép ngẫu nhiên và Đánh Hạng không bấm được, có “Sắp ra mắt”. Có ô Vào phòng bằng mã.
- Danh sách công khai hiển thị tên phòng, chủ phòng kèm nhãn Khách nếu có, mức giờ, đang chờ hoặc đang đấu, số người xem trên giới hạn. Không có phòng thì có lời giải thích và nút Tạo phòng.
- Còn ghế thì có Vào chơi; còn chỗ xem thì có Vào xem. Đủ ghế chỉ còn Vào xem nếu được; không cho xem hoặc hết chỗ thì không hiện nút vào xem. Danh sách cập nhật theo máy chủ trong không quá 2 giây.
- Thanh điều hướng có Sảnh, Bạn bè, chuông lời mời và ảnh chữ cái cùng Tên hiển thị mở Cài đặt. Lịch sử, Bảng xếp hạng chưa bấm được; Khách không mở Bạn bè.
- Luật chơi mở rộng hoặc thu gọn ngay tại Sảnh, dùng được bằng bàn phím. Nêu cách đi bảy loại quân, chiếu hết và hết nước đều thua; lặp ba lần hoà, chiếu liên tục bên chiếu thua, cả hai cùng chiếu thì hoà; 120 nửa nước không ăn quân thì hoà. Nêu xin hoà, đầu hàng, hết giờ, mất mạng 60 giây và đuổi quân liên tục xử theo lặp thế; nói rõ đây là bộ luật rút gọn của ứng dụng.
- Cách đi cần giải thích: Tướng đi ngang hoặc dọc một ô trong cung và không đối mặt Tướng kia khi không có quân chắn; Sĩ chéo một ô trong cung; Tượng chéo hai ô, không qua sông và bị chặn mắt; Xe đi thẳng; Mã đi hình chữ L và bị cản chân; Pháo đi như Xe nhưng ăn phải nhảy qua đúng một quân; Tốt trước sông chỉ tiến, qua sông được đi ngang, không lùi.

**Việc cần làm**

- Dùng danh sách máy chủ đã sắp theo mốc mở Công khai; duy trì tối đa 50 dòng khi nhận thêm/bớt/đổi phòng. Nối phản hồi chuyển sang xem với thông báo “Ghế vừa có người, bạn đang xem trận” và cập nhật lại danh sách khi phòng vừa chuyển riêng.
- Xây danh sách và trạng thái chờ, trống, lỗi; nối các lối tạo phòng, nhập mã, vào chơi, vào xem và chơi với máy.
- Xử lý phản hồi khi ghế vừa bị lấy, phòng đầy hoặc không còn công khai; không dựa vào dòng cũ để khẳng định đã vào được.
- Kiểm giao diện điện thoại, bàn phím, tài khoản chính thức và Khách; đối chiếu nội dung luật bằng từng tình huống minh hoạ.

**Kết quả bàn giao**

- Sảnh và thanh điều hướng hoàn chỉnh, kết nối dữ liệu thật và phần luật đọc được ngay tại màn hình.
- Bằng chứng danh sách giới hạn 50 phòng, phản hồi dòng cũ và nội dung Luật chơi đã đối chiếu.

**Điều kiện hoàn thành**

- Mọi lối vào đang hỗ trợ dẫn đúng chức năng; phần chưa làm được ghi rõ, không cho thao tác giả.
- Danh sách, quyền vào và thông báo khớp phản hồi máy chủ; nội dung luật không đánh đồng hết nước với hoà.
- Phần Luật chơi giải thích lặp thế phải cùng vị trí quân và cùng bên đến lượt; chu kỳ tính từ lần xuất hiện thứ nhất đến thứ ba, mỗi nước của bên chiếu trong chu kỳ đều phải là nước chiếu. Nêu chiếu hết ưu tiên cao nhất, hết nước/chiếu liên tục gây thắng thua trước hòa 120 nửa nước.

**Phạm vi và phối hợp**

Không triển khai ghép ngẫu nhiên, xếp hạng, lịch sử hoặc bảng xếp hạng trong phần việc này.

---

<a id="t67"></a>

#### T67 · Kiểm thử US-06.2

| Trường | Giá trị |
|---|---|
| Issue Id | 103 |
| Issue Type | Task |
| Parent | EP-06 |
| Assignee | Nhạn |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-103 |
| Start date | 31/10/2026 |
| Due date | 31/10/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-06.2 |
| Is blocked by | T26, T38, T40, T44, T55, T61, T65 |
| Component chính | QA & DevOps |
| Components | Phòng chơi, QA & DevOps |
| Labels | chinh-qa-devops, kiem-thu, p1, phong-choi, sprint-4 |
| Nguồn đặc tả (BA / AC) | 0.3, 0.5, 0.12, 0.17, 10.4 |


**Description**

**Mục tiêu**

Kiểm chứng Sảnh, danh sách phòng công khai và các lối vào chơi.

**Bối cảnh công việc**

Chuẩn bị tài khoản chính thức, phiên Khách và các phòng công khai, chỉ vào bằng mã, khoá, đầy người xem và không cho xem. Quan sát Sảnh trên hai cửa sổ để đo cập nhật từ thay đổi phía chủ phòng đến danh sách phía người khác.

**Yêu cầu cần đáp ứng**

- Phòng công khai có tên, chủ kèm “(Khách)” nếu có, mức giờ, Đang chờ/Đang đấu và người xem x/N; N bằng không hiện “Không cho xem”. Mới mở công khai gần nhất lên đầu, tối đa 50 phòng.
- Mở/rời công khai, đóng phòng, đổi trạng thái hoặc số người cập nhật danh sách trong không quá 2 giây, không tải lại. Phòng chỉ mã/link hoặc khoá không xuất hiện; không có phòng thì giải thích và có Tạo phòng.
- Còn ghế có Vào chơi; còn chỗ xem có Vào xem. Đủ ghế chỉ còn Vào xem nếu còn chỗ; không cho xem hoặc hết chỗ thì không hiện nút xem.
- Ghế vừa bị lấy khi Vào chơi: còn chỗ thì vào xem và báo “Ghế vừa có người, bạn đang xem trận”; hết chỗ báo đầy. Vào xem không chiếm ghế trống. Phòng vừa rời công khai từ chối yêu cầu từ dòng cũ.
- Tự tạo phòng, Đánh với máy, Vào phòng bằng mã hoạt động; Ghép ngẫu nhiên và Đánh Hạng vô hiệu, ghi “Sắp ra mắt”. Khách dùng được mã/link, Vào chơi/Vào xem và chơi với máy theo luật quyền/sức chứa.
- Thanh điều hướng có Sảnh, Bạn bè, chuông lời mời và ảnh/tên mở cài đặt; Khách không dùng Bạn bè. Lịch sử/Bảng xếp hạng và Quên mật khẩu trên màn đăng nhập vô hiệu, ghi “Sắp ra mắt”.
- Luật chơi mở rộng/thu gọn tại Sảnh bằng bàn phím, không mở trang/hộp mới. Nội dung có cách đi bảy quân; chiếu hết/hết nước đều thua; lặp ba lần hoà trừ chiếu liên tục, một bên chiếu liên tục thua, cả hai chiếu thì hoà; 120 nửa nước không ăn quân hoà.
- Luật còn phải nêu xin hoà, đầu hàng, hết giờ, mất mạng 60 giây, đuổi quân xử theo lặp thế và câu “Đây là bộ luật rút gọn của ứng dụng, không phải toàn bộ luật thi đấu chính thức”.

**Việc cần làm**

- Ghi danh sách phòng và mốc mở Công khai trước từng lần đổi; dùng phòng đã tồn tại rồi mới mở công khai để kiểm thứ tự dựa trên lần mở công khai, không nhầm với ngày tạo phòng.
- Chuẩn bị các loại phòng, gồm không cho xem, đầy ghế, đầy người xem; kiểm từng cột và nút trên Sảnh của tài khoản thường và Khách.
- Mở 51 phòng mẫu để kiểm giới hạn và thứ tự; đổi công khai, đóng và thay số người, đo cập nhật trên trình duyệt khác.
- Cho hai người tranh ghế cuối; bấm Vào xem lúc ghế trống và dùng dòng cũ sau khi phòng chuyển riêng, kiểm vai trò cuối.
- Kiểm các lối điều hướng, phần chưa làm, trạng thái rỗng và mục luật bằng bàn phím trên màn hình nhỏ.
- Ghi từng ca là Đạt, Không đạt hoặc Chưa kiểm được cùng dữ liệu, thời điểm và bằng chứng đã che bí mật. Báo lỗi có cách tái hiện; sau sửa chạy lại ca lỗi và các nhánh liên quan.

**Kết quả bàn giao**

- Bộ ca kiểm có bước chạy, dữ liệu và kết quả mong đợi để thành viên khác thực hiện lại được.
- Bảng kết quả thực tế cùng bằng chứng và danh sách lỗi còn mở; các lượt kiểm lại giữ được liên hệ với lỗi ban đầu.

**Điều kiện hoàn thành**

- Mọi tình huống nêu trên có kết quả đúng và bằng chứng lặp lại được; sai quyền, sai kết quả hoặc sai hạn thời gian phải ghi Không đạt, chưa được kết luận hoàn tất.
- Thiếu thiết bị, thiếu dữ liệu hoặc lỗi của phần tích hợp phải ghi rõ là Chưa kiểm được; việc người phụ trách biết vấn đề không thay thế kết quả đạt.
- Bài đọc Luật chơi phải đối chiếu định nghĩa cùng vị trí/cùng lượt và chu kỳ lần thứ nhất đến thứ ba; nội dung không được tuyên bố hoà 120 nửa nước nếu cùng nước đã gây chiếu hết, hết nước hoặc chiếu liên tục xử thua.

**Phạm vi và phối hợp**

Công việc này chuẩn bị và thực hiện kiểm thử cho phạm vi trên. Người triển khai chức năng chịu trách nhiệm sửa lỗi; kết quả kiểm cục bộ không thay thế việc nghiệm thu toàn bộ sản phẩm.

---

<a id="us-06.3"></a>

### US-06.3 · Người xem và đuổi người xem

| Trường | Giá trị |
|---|---|
| Issue Id | 31 |
| Issue Type | Story |
| Parent | EP-06 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-31 |
| Start date | 23/10/2026 |
| Due date | 26/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T55, T58, T64 |
| Sprint thi công | S3, S4 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | BE, Camera và mic, FE, Phòng chơi, QA & DevOps |
| Labels | EP-06, camera-va-mic, dac-ta, p1, phong-choi |
| Nguồn đặc tả (BA / AC) | 0.3, 0.7, 2.8, 4.1, 4.2 |


**Description**

**Mục tiêu**

Bàn giao đặc tả quyền của người xem, chuyển giữa ghế và chỗ xem, cùng việc đuổi người xem gây rối theo quy tắc đã duyệt.

**Bối cảnh công việc**

Mỗi phòng có tối đa hai người chơi và năm người xem. Chuyển chỗ chỉ được thực hiện khi không có ván đang diễn ra. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Danh sách người xem có tiêu đề “Người xem (X / N)”, trong đó X là số đang xem và N là trần chỗ xem của phòng. Tên và số lượng phải cập nhật ngay khi có thay đổi.
- Bối cảnh: Phòng đang chờ/sau ván, còn chỗ xem. Thao tác hoặc sự kiện: Người chơi bấm "Chuyển sang người xem". Kết quả cần có: Rời ghế thành Người xem; Sẵn sàng đặt lại về chưa sẵn sàng.
- Bối cảnh: Không còn chỗ xem hoặc phòng "Không có người xem". Thao tác hoặc sự kiện: Xem nút "Chuyển sang người xem". Kết quả cần có: không bấm được kèm chú thích "Phòng không còn chỗ cho người xem".
- Bối cảnh: chủ phòng. Thao tác hoặc sự kiện: Bấm "Chuyển sang người xem" cho người chơi kia (còn chỗ xem). Kết quả cần có: Người đó thành Người xem.
- Bối cảnh: chủ phòng, còn ghế trống. Thao tác hoặc sự kiện: Gửi "Mời xuống ghế" cho một người xem. Kết quả cần có: Người xem thấy lời mời Chấp nhận/Từ chối; Chấp nhận → máy chủ kiểm lại ghế trống, quyền, vị trí chơi rồi xếp vào ghế (vẫn phải Sẵn sàng); ghế đã có người → thông báo và giữ vai trò xem; Từ chối → tiếp tục xem.
- Bối cảnh: Người xem. Thao tác hoặc sự kiện: Tìm cách tự ngồi vào ghế trống. Kết quả cần có: Không có thao tác này.
- Bối cảnh: chủ phòng. Thao tác hoặc sự kiện: Tìm nút tự chuyển mình sang người xem. Kết quả cần có: Nút bị ẩn.
- Bối cảnh: Ván đang diễn ra. Thao tác hoặc sự kiện: Mọi thao tác đổi chỗ ghế ↔ xem. Kết quả cần có: Không khả dụng.
- Bối cảnh: Người xem mất kết nối. Thao tác hoặc sự kiện: Nối lại trong 5 phút. Kết quả cần có: Giữ chỗ xem; quá 5 phút mất chỗ (không xử phạt).
- Cả hai người chơi đều thấy nút Kick, nghĩa là đuổi khỏi phòng, cạnh từng người xem. Người xem không có nút này.
- Bấm Kick để đuổi một người xem phải mở xác nhận “Bạn có chắc chắn muốn đuổi người xem \[Tên\] ra khỏi phòng thi đấu không?”. Vị trí chọn ban đầu của bàn phím đặt ở Huỷ.
- Khi xác nhận đuổi người xem, đưa người đó về Sảnh với thông báo “Bạn đã bị đuổi khỏi phòng thi đấu”, thu hồi ngay quyền nhận hình và tiếng. Ghi lại thời gian thu hồi thực tế trong phép kiểm truyền hình/tiếng.
- Bối cảnh: Người đã bị đuổi. Thao tác hoặc sự kiện: Vào lại bằng đường dẫn/mã mới, lời mời hoặc từ Sảnh. Kết quả cần có: Bị chặn đến khi phòng đã đóng.
- Bối cảnh: Người đã bị đuổi khỏi phòng. Thao tác hoặc sự kiện: Vào lại bằng bất kỳ cách nào. Kết quả cần có: màn hình thông báo không được vào phòng: "Bạn đã bị đuổi và chặn tham gia phòng cờ này!".
- Giới hạn đã được chấp nhận: người bị đuổi có thể quay lại bằng một danh tính Khách mới nếu phòng chưa khóa; không hứa chặn được người thật qua mọi phiên Khách.

**Việc cần làm**

- Đối chiếu ma trận vai trò và chuyển ghế/chỗ xem; giữ việc chấp nhận lời mời không giữ ghế, chặn tự xuống ghế, ân hạn xem và thu hồi hình/tiếng khi đuổi.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát quyền người xem, mời xuống ghế, giữ chỗ và đuổi/chặn bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ quyền người xem, mời xuống ghế, giữ chỗ và đuổi/chặn; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.

**Phạm vi và phối hợp**

Người xem không được tự chiếm ghế; chủ phòng không tự xuống xem; không chuyển vai trò giữa ván.

---

<a id="t55"></a>

#### T55 · BE người xem, chuyển ghế ↔ xem, mời xuống ghế, đuổi và chặn

| Trường | Giá trị |
|---|---|
| Issue Id | 91 |
| Issue Type | Task |
| Parent | EP-06 |
| Assignee | Đông |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-91 |
| Start date | 25/10/2026 |
| Due date | 26/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 16 giờ |
| Remaining Estimate | 16 giờ |
| Story Points | 3 |
| Story (relates to) | US-06.3 |
| Is blocked by | T22 |
| Component chính | BE |
| Components | BE, Phòng chơi |
| Labels | chinh-be, p1, phat-trien, phong-choi, sprint-3 |
| Nguồn đặc tả (BA / AC) | 0.6, 0.7, 2.8, 4.1, 4.2, 5.3 |


**Description**

**Mục tiêu**

Quản lý người xem và chuyển chỗ an toàn, đồng thời cho người chơi đuổi người xem gây phiền.

**Bối cảnh công việc**

Một phòng có hai ghế chơi và số chỗ xem đã chọn khi tạo, tối đa năm người xem. Quyền ngồi ghế, xem, phát và nhận hình tiếng phải thay đổi thống nhất, kể cả khi có nhiều thao tác diễn ra gần nhau.

**Yêu cầu cần đáp ứng**

- Theo dõi số người xem hiện tại trên giới hạn đã chọn; người xem mất mạng được giữ chỗ 5 phút, quá hạn mất chỗ nhưng không bị xử thua.
- Chỉ chuyển ghế sang xem hoặc mời người xem xuống ghế khi phòng đang chờ. Người chơi không phải chủ phòng có thể chuyển sang xem nếu còn chỗ; chủ phòng không tự chuyển mình sang xem nhưng được chuyển người chơi kia.
- Chủ phòng mời người xem xuống ghế; người nhận có quyền chấp nhận hoặc từ chối. Lời mời không giữ trước ghế: khi chấp nhận phải kiểm lại ghế, quyền và việc người đó đã chơi ở nơi khác. Người xem không tự ngồi vào ghế trống.
- Thay đổi người ngồi ghế làm mất trạng thái Sẵn sàng. Trong ván đang diễn ra, không cho chuyển chỗ.
- Cả hai người chơi được đuổi người xem; người xem không có quyền đuổi. Người bị đuổi mất chỗ và quyền nhận hình tiếng, bị chặn quay lại đến khi phòng đóng.

**Việc cần làm**

- Với mỗi thao tác, nhận phòng, người thao tác và người được chuyển/mời/đuổi; kiểm trạng thái chờ, quyền, ghế/chỗ xem hiện tại rồi mới cập nhật vai trò. Sau đổi ghế, gửi sự kiện để chat đổi mốc cặp, media đổi quyền và đề nghị đổi bên cũ bị huỷ.
- Xây thao tác đổi vai trò, mời xuống ghế và đuổi có kiểm quyền tại máy chủ. Kiểm sức chứa ngay lúc xử lý, không chỉ lúc tạo lời mời.
- Phát thay đổi danh sách, ghế và quyền cho những phần xử lý chat, camera và mic; gửi thông báo đưa người bị đuổi về Sảnh.
- Kiểm thử phòng đầy, không cho xem, ghế bị lấy trước khi nhận lời, đổi vai trò giữa ván và vào lại sau khi bị đuổi.

**Kết quả bàn giao**

- Chức năng người xem phía máy chủ cùng dữ liệu thông báo cho giao diện và phần camera, mic.
- Kiểm thử tự động về sức chứa, quyền thao tác và hiệu lực chặn.
- Bảng quyền theo vai trò cùng dữ liệu đổi ghế/đuổi để chat và media cập nhật quyền.

**Điều kiện hoàn thành**

- Không có thao tác làm vượt số chỗ, tự chiếm ghế hoặc đổi vai trò trái phép; dữ liệu mọi người nhìn thấy thống nhất.
- Người bị đuổi không vào lại bằng mã, đường dẫn, lời mời hoặc Sảnh trong cùng danh tính khi phòng chưa đóng.
- Người rời ghế không còn quyền phát media hoặc đọc kênh riêng; xuống ghế thành công vẫn chưa sẵn sàng. Đuổi thu hồi cả kết nối nhận media hiện hữu, không chỉ ngừng cấp giấy phép mới.

**Phạm vi và phối hợp**

Không xây khung danh sách người xem trong phần việc này. Giới hạn đã chấp nhận: một phiên Khách mới là danh tính mới, nên không cam kết chặn tuyệt đối người dùng tạo lại phiên Khách.

---

<a id="t58"></a>

#### T58 · FE danh sách người xem, thao tác ghế và khung camera/mic

| Trường | Giá trị |
|---|---|
| Issue Id | 94 |
| Issue Type | Task |
| Parent | EP-06 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-94 |
| Start date | 27/10/2026 |
| Due date | 29/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 20 giờ |
| Remaining Estimate | 20 giờ |
| Story Points | 5 |
| Story (relates to) | US-06.3 |
| Is blocked by | T33, T55 |
| Component chính | FE |
| Components | Camera và mic, FE, Phòng chơi |
| Labels | camera-va-mic, chinh-fe, p1, phat-trien, phong-choi, sprint-3 |
| Nguồn đặc tả (BA / AC) | 0.13, 0.14, 1.8, 2.8, 4.1, 4.2 |


**Description**

**Mục tiêu**

Hoàn thiện giao diện người xem và camera, mic trong cả phòng chờ lẫn phòng đang đấu.

**Bối cảnh công việc**

Màn phòng dùng chung thông tin ghế, danh sách người xem và phần hình tiếng. Giao diện phải giúp mỗi vai trò thấy đúng thao tác, đồng thời giữ kết nối hình tiếng khi chuyển từ chờ sang ván.

**Yêu cầu cần đáp ứng**

- Hiển thị Người xem với số hiện có trên sức chứa, tên và thay đổi ngay theo máy chủ. Chỉ hiện thao tác chuyển sang xem, mời xuống ghế hoặc đuổi khi vai trò và trạng thái phòng cho phép.
- Người xem không tự ngồi xuống ghế. Lời mời có Chấp nhận và Từ chối; chấp nhận vẫn có thể thất bại nếu ghế đã bị lấy. Chủ phòng không thấy nút tự chuyển mình sang người xem. Trong ván không cho đổi chỗ.
- Đuổi người xem phải có hộp xác nhận nêu tên, chọn sẵn Huỷ khi thao tác bằng bàn phím. Người bị đuổi được đưa về Sảnh và thấy thông báo rõ.
- Camera và mic mặc định tắt, có hai nút độc lập; mức chia sẻ gồm Không chia sẻ, Chỉ đối thủ, Cả đối thủ và người xem, chọn sẵn Chỉ đối thủ. Một mức áp cho cả hình và tiếng đang bật. Bật, tắt và thay đổi chia sẻ phải có hiệu lực phía người nhận trong không quá 2 giây.
- Người xem chỉ nhận hình tiếng, không có nút phát. Báo lỗi tiếng Việt khi thiết bị thiếu, quyền bị từ chối hoặc dịch vụ lỗi. Ván và chat vẫn tiếp tục; không ghi hoặc lưu hình tiếng.

**Việc cần làm**

- Lập trạng thái thao tác theo chủ phòng/người chơi còn lại/người xem và phòng chờ/đang đấu; nối phản hồi ghế đã có người hoặc hết chỗ xem vào đúng lời mời/nút đang xử lý, giữ vai trò cũ nếu bị từ chối.
- Nối danh sách, thao tác ghế và hộp xác nhận với dịch vụ người xem thật; cập nhật theo phản hồi thay vì tự nhận thao tác đã thành công.
- Nối khung camera, mic với bộ xử lý hình tiếng đã có. Dùng chung khung cho phòng chờ và đang đấu để chuyển màn không cắt luồng.
- Kiểm hai máy phát cùng người xem: đổi mức chia sẻ, tắt riêng mic, đổi vai trò, bị đuổi, mở thẻ khác và làm dịch vụ lỗi; quan sát trạng thái mỗi phía.

**Kết quả bàn giao**

- Khung danh sách người xem và khung camera, mic tích hợp thật, đầy đủ thông báo và trạng thái quyền.
- Bằng chứng thao tác đa thiết bị và dữ liệu bàn giao cho người kiểm thử.

**Điều kiện hoàn thành**

- Giao diện không cung cấp thao tác trái quyền; lỗi được thông báo thật, không làm mất ván hoặc chat.
- Người xem nhận đúng phạm vi chia sẻ; hình tiếng không bị ngắt chỉ vì bắt đầu ván.
- Khi dịch vụ media lỗi hoặc hết hạn mức phải hiện “Camera/mic tạm thời không dùng được”; đổi thẻ dừng thiết bị ở thẻ cũ, thẻ mới không tự bật. Chuyển người chơi xuống xem phải bỏ các nút phát.

**Phạm vi và phối hợp**

Không viết lại dịch vụ cấp quyền camera, mic hay quy tắc xếp chỗ. Phần việc này kết nối và hiển thị các dịch vụ đã bàn giao.

---

<a id="t64"></a>

#### T64 · Kiểm thử US-06.3

| Trường | Giá trị |
|---|---|
| Issue Id | 100 |
| Issue Type | Task |
| Parent | EP-06 |
| Assignee | Kỳ |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-100 |
| Start date | 02/11/2026 |
| Due date | 02/11/2026 |
| Sprint | XIAN Sprint 4 |
| Fix version | v1.0 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-06.3 |
| Is blocked by | T31, T52, T54, T58 |
| Component chính | QA & DevOps |
| Components | Camera và mic, Phòng chơi, QA & DevOps |
| Labels | camera-va-mic, chinh-qa-devops, kiem-thu, p1, phong-choi, sprint-4 |
| Nguồn đặc tả (BA / AC) | 0.3, 2.8, 4.1, 4.2, 5.3 |


**Description**

**Mục tiêu**

Kiểm chứng chuyển vai trò người xem, đuổi người xem và thu hồi hình tiếng.

**Bối cảnh công việc**

Chuẩn bị phòng có hai người chơi cùng những người xem, gồm một trường hợp chạm sức chứa. Dùng thiết bị thật có camera và mic để quan sát người bị đuổi có thực sự mất quyền nhận hình tiếng, kể cả khi họ vẫn giữ trang cũ.

**Yêu cầu cần đáp ứng**

- Danh sách hiện “Người xem (x/N)”, trong đó x là số hiện có và N là trần phòng; tên/số cập nhật khi người vào/rời.
- Ở phòng chờ, người chơi không phải chủ tự chuyển sang xem hoặc chủ chuyển người chơi kia nếu còn chỗ. Hết chỗ hoặc không cho xem thì nút vô hiệu với “Phòng không còn chỗ cho người xem”. Đổi thành phần ghế đặt lại Sẵn sàng.
- Chủ mời người xem xuống ghế: Chấp nhận/Từ chối. Chấp nhận phải kiểm ghế, quyền và vị trí chơi hiện tại; ghế đã bị lấy thì giữ người xem, báo lý do. Xuống ghế thành công vẫn phải Sẵn sàng.
- Người xem không tự chiếm ghế; chủ không tự chuyển mình sang xem. Trong ván, mọi đổi ghế/xem đều bị chặn cả khi gửi yêu cầu trực tiếp.
- Người xem mất mạng được giữ chỗ 5 phút; nối lại đúng hạn giữ vai trò, quá hạn mất chỗ và không bị xử thua.
- Cả hai người chơi có quyền đuổi, người xem không có. Hộp xác nhận nêu đúng tên và chọn sẵn Huỷ khi dùng bàn phím; huỷ không đuổi.
- Xác nhận đuổi đưa người đó về Sảnh, báo “Bạn đã bị đuổi khỏi phòng thi đấu”, thu hồi hình tiếng. Đo thời gian thu hồi thực tế, không tự đặt ngưỡng mới.
- Cùng danh tính bị chặn đến khi phòng đóng, kể cả mã/link mới, lời mời hoặc Sảnh; hiện “Bạn đã bị đuổi và chặn tham gia phòng cờ này!”.

**Việc cần làm**

- Chuẩn bị tin riêng của cặp ban đầu và bật camera/mic trước khi chuyển người chơi xuống xem; đối chiếu ghế, Sẵn sàng, quyền đọc chat và quyền media sau cùng một thao tác đổi vai trò.
- Tạo phòng còn chỗ, đầy chỗ và không cho xem; kiểm chuyển ghế/xem theo từng vai trò.
- Mời người xem xuống ghế, thử đồng ý/từ chối và cho người khác lấy ghế trước khi đồng ý; kiểm không vượt sức chứa.
- Trong ván gửi yêu cầu đổi chỗ trực tiếp; thử người xem tự ngồi hoặc tự đuổi để kiểm máy chủ chặn.
- Bật hình tiếng, thử huỷ rồi xác nhận đuổi; ghi thời gian mất luồng và thử quay lại bằng mọi lối vào cùng danh tính.
- Ghi từng ca là Đạt, Không đạt hoặc Chưa kiểm được cùng dữ liệu, thời điểm và bằng chứng đã che bí mật. Báo lỗi có cách tái hiện; sau sửa chạy lại ca lỗi và các nhánh liên quan.

**Kết quả bàn giao**

- Bộ ca kiểm có bước chạy, dữ liệu và kết quả mong đợi để thành viên khác thực hiện lại được.
- Bảng kết quả thực tế cùng bằng chứng và danh sách lỗi còn mở; các lượt kiểm lại giữ được liên hệ với lỗi ban đầu.

**Điều kiện hoàn thành**

- Mọi tình huống nêu trên có kết quả đúng và bằng chứng lặp lại được; sai quyền, sai kết quả hoặc sai hạn thời gian phải ghi Không đạt, chưa được kết luận hoàn tất.
- Thiếu thiết bị, thiếu dữ liệu hoặc lỗi của phần tích hợp phải ghi rõ là Chưa kiểm được; việc người phụ trách biết vấn đề không thay thế kết quả đạt.
- Cặp mới không đọc tin riêng cặp cũ; người xuống xem mất quyền phát. Phiên Khách mới có danh tính mới chỉ bị chặn bởi khoá/quyền vào hiện tại, không ghi thành lỗi vì không chặn tuyệt đối theo người thật.

**Phạm vi và phối hợp**

Công việc này chuẩn bị và thực hiện kiểm thử cho phạm vi trên. Người triển khai chức năng chịu trách nhiệm sửa lỗi; kết quả kiểm cục bộ không thay thế việc nghiệm thu toàn bộ sản phẩm.

---

<a id="ep-07"></a>

## EP-07 · Chat, camera và mic

| Trường | Giá trị |
|---|---|
| Issue Id | 8 |
| Issue Type | Epic |
| Parent | — |
| Assignee | Tình |
| Reporter | Tình |
| Priority | Medium |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-8 |
| Start date | 18/10/2026 |
| Due date | 25/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Component chính | Tổng hợp phạm vi các Task |
| Components | BE, Camera và mic, FE, QA & DevOps, Trò chuyện |
| Labels | EP-07, camera-va-mic, dac-ta, p1, tro-chuyen |
| Nguồn đặc tả (BA / AC) | 0.13, 0.14, 0.16, 4.1, 4.2, 5.3 |


**Description**

**Mục tiêu**

Bàn giao bộ đặc tả đã duyệt về hai kênh chat, camera/mic và quyền riêng tư; bảo đảm các đặc tả thành phần nhất quán khi triển khai.

**Bối cảnh công việc**

Hai người chơi có kênh trò chuyện riêng; cả phòng có kênh chung. Người chơi bật camera/mic riêng từng nút và chọn Không chia sẻ, Chỉ đối thủ hoặc Cả đối thủ và người xem. Các quyết định sản phẩm đã có hiệu lực; nhóm chức năng này tổng hợp và truy vết yêu cầu, không mở một vòng quyết định hoặc duyệt lại phạm vi.

**Yêu cầu cần đáp ứng**

- Phòng chờ và trong ván cùng có Kênh Riêng cho cặp người chơi và Kênh Chung cho cả phòng; cùng cặp đổi bên/chơi tiếp giữ chat, thay cặp đặt mốc mới, người mới chỉ thấy tin từ khi vào, đóng phòng xóa chat.
- Tin tối đa 200 ký tự, năm tin/10 giây, lọc từ cấm ở máy chủ và hiển thị văn bản thuần. Camera/mic mặc định tắt, bật độc lập, mức chia sẻ mặc định Chỉ đối thủ, có thêm Không chia sẻ và Cả đối thủ và người xem.
- Người xem chỉ nhận, không phát; thu hồi quyền khi rời ghế/phòng hoặc bị đuổi. Lỗi camera/mic không ngắt ván/chat hoặc dừng đồng hồ, không xử ai thua. Giữ hạ tầng LiveKit tự chạy và dịch vụ đám mây dự phòng đã chọn.

**Việc cần làm**

- Đối chiếu các đặc tả thành phần về hai kênh chat, camera/mic và quyền riêng tư với quyết định hiện hành; kiểm đầy đủ luồng, quyền, giới hạn và ngoại lệ nêu trên.
- Rà các điểm giao với nhóm chức năng khác, gắn yêu cầu với công việc triển khai và tình huống kiểm thử; sửa sai lệch theo nguồn nghiệp vụ ưu tiên.
- Theo dõi độ đầy đủ của hồ sơ thành phần và bằng chứng phải bổ sung; mâu thuẫn chưa giải được theo thứ tự ưu tiên nguồn cần báo người phụ trách sản phẩm, không tự sửa quyết định đã duyệt.

**Kết quả bàn giao**

- Bản tổng hợp đối soát hai kênh chat, camera/mic và quyền riêng tư, kèm truy vết tới đặc tả thành phần và quyết định nguồn.
- Danh sách điểm giao, tình huống nghiệm thu và sai lệch cần xử lý; bằng chứng kỹ thuật được quản lý tại công việc triển khai/kiểm chứng liên quan.

**Điều kiện hoàn thành**

- Các đặc tả thành phần phản ánh đúng hai kênh chat, camera/mic và quyền riêng tư theo yêu cầu bên trên và thống nhất tại các điểm giao.
- Hồ sơ hoàn tất theo đặc tả thành phần cuối cùng, không yêu cầu người phụ trách sản phẩm duyệt lại quy tắc đã chốt. Kết quả chạy phần mềm và kiểm thử chỉ được ghi nhận khi có bằng chứng riêng.

**Phạm vi và phối hợp**

Không ghi/lưu hình tiếng, không lưu trò chuyện sau khi phòng đóng và không mở tin nhắn ngoài phòng.

---

<a id="us-07.1"></a>

### US-07.1 · Hai kênh chat và bộ lọc

| Trường | Giá trị |
|---|---|
| Issue Id | 32 |
| Issue Type | Story |
| Parent | EP-07 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-32 |
| Start date | 20/10/2026 |
| Due date | 23/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T37, T42, T47 |
| Sprint thi công | S2, S3 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | BE, FE, QA & DevOps, Trò chuyện |
| Labels | EP-07, dac-ta, p1, tro-chuyen |
| Nguồn đặc tả (BA / AC) | 0.13, 5.3 |


**Description**

**Mục tiêu**

Bàn giao đặc tả trò chuyện đúng đối tượng, có lọc từ cấm và chống gửi quá nhanh theo quy tắc đã duyệt.

**Bối cảnh công việc**

Kênh Riêng dành cho cặp người đang ngồi hai ghế; Kênh Chung có người chơi và người xem. Quyền đọc phải được kiểm tra ở máy chủ. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Bối cảnh: Người chơi trên máy tính vào phòng. Thao tác hoặc sự kiện: Khung chat. Kết quả cần có: Mặc định chỉ mở Kênh Riêng; có thể mở thêm Kênh Chung để xem song song, ẩn/hiện từng khung.
- Bối cảnh: Người chơi trên điện thoại. Thao tác hoặc sự kiện: Khung chat. Kết quả cần có: Hai kênh trong một khung, chuyển bằng thẻ, mặc định Kênh Riêng.
- Bối cảnh: Người xem. Thao tác hoặc sự kiện: Khung chat. Kết quả cần có: Chỉ có thẻ Kênh Chung; máy chủ từ chối mọi yêu cầu đọc/gửi Kênh Riêng từ người xem.
- Bối cảnh: A–B đang chat riêng; B xuống xem, C lên ghế. Thao tác hoặc sự kiện: C và A mở Kênh Riêng. Kết quả cần có: Chỉ thấy tin từ khi cặp A–C hình thành; B mất quyền đọc Kênh Riêng.
- Bối cảnh: Người xem mới vào. Thao tác hoặc sự kiện: Mở Kênh Chung. Kết quả cần có: Chỉ thấy tin từ lúc mình vào.
- Bối cảnh: Cùng cặp A–B Xin đổi bên hoặc đánh ván tiếp. Thao tác hoặc sự kiện: Mở Kênh Riêng. Kết quả cần có: Vẫn thấy tin cũ của cặp.
- Bối cảnh: Phòng đóng. Thao tác hoặc sự kiện: Dữ liệu. Kết quả cần có: Toàn bộ chat phòng bị xoá.
- Bối cảnh: Tin có thẻ mã đánh dấu hoặc mã lệnh có thể thực thi. Thao tác hoặc sự kiện: Hiển thị. Kết quả cần có: Hiện như văn bản thuần.
- Tin chứa từ trong danh sách cấm phải được máy chủ thay từ đó bằng ba dấu sao (\*\*\*) trước khi gửi tới mọi người.
- Bộ lọc vẫn phải che từ cấm bằng ba dấu sao (\*\*\*) khi người gửi dùng biến thể có dấu/không dấu, hoa/thường, chèn khoảng trắng hoặc ký tự đặc biệt, dùng số 0 thay chữ o hoặc số 1 thay chữ i.
- Bối cảnh: Tin > 200 ký tự. Thao tác hoặc sự kiện: Gửi. Kết quả cần có: Bị chặn ở trình duyệt và máy chủ.
- Bối cảnh: Đã gửi 5 tin trong 10 giây. Thao tác hoặc sự kiện: Gửi tin thứ 6. Kết quả cần có: Báo "Bạn gửi quá nhanh", tin không được gửi.
- Bối cảnh: Nhóm cần thêm từ cấm. Thao tác hoặc sự kiện: Sửa tệp cấu hình danh sách. Kết quả cần có: Áp dụng sau khi khởi động lại máy chủ, không sửa cơ sở dữ liệu.
- Bối cảnh: Phòng đang ở trạng thái chờ (Đang chờ). Thao tác hoặc sự kiện: Người chơi và người xem mở khung chat. Kết quả cần có: Có hai kênh theo vai trò như trong ván: người chơi có Kênh Riêng và Kênh Chung, người xem chỉ Kênh Chung; tin nhắn giữ nguyên khi chuyển sang ván.

**Việc cần làm**

- Đối soát chat trên máy tính/điện thoại ở phòng chờ và trong ván; giữ mốc tin khi cùng cặp đổi bên/chơi tiếp, thay cặp, người mới vào và đóng phòng.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát hai kênh theo vai trò, mốc lịch sử chat, lọc từ và giới hạn gửi bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ hai kênh theo vai trò, mốc lịch sử chat, lọc từ và giới hạn gửi; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.

**Phạm vi và phối hợp**

Không thêm tin nhắn riêng ngoài phòng hoặc lưu lịch sử trò chuyện sau khi phòng đóng.

---

<a id="t37"></a>

#### T37 · BE hai kênh chat, bộ lọc từ cấm, giới hạn tốc độ

| Trường | Giá trị |
|---|---|
| Issue Id | 73 |
| Issue Type | Task |
| Parent | EP-07 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-73 |
| Start date | 22/10/2026 |
| Due date | 23/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.3 |
| Original Estimate | 16 giờ |
| Remaining Estimate | 16 giờ |
| Story Points | 3 |
| Story (relates to) | US-07.1 |
| Is blocked by | T18, T35 |
| Component chính | BE |
| Components | BE, Trò chuyện |
| Labels | chinh-be, p1, phat-trien, sprint-2, tro-chuyen |
| Nguồn đặc tả (BA / AC) | 0.13, 5.3, 10.1 |


**Description**

**Mục tiêu**

Xây chat phòng có kênh riêng cho hai người chơi và kênh chung, bảo vệ nội dung theo vai trò.

**Bối cảnh công việc**

Chat tồn tại cả khi chờ và khi đang đấu. Một phòng có thể đổi người ngồi ghế; quyền đọc tin phải theo đúng cặp người chơi hiện tại, không chỉ dựa vào việc từng tham gia phòng.

**Yêu cầu cần đáp ứng**

- Hai người ngồi ghế được đọc/gửi Kênh Riêng và Kênh Chung; người xem chỉ được đọc/gửi Kênh Chung. Máy chủ từ chối mọi yêu cầu của người xem tới Kênh Riêng, kể cả yêu cầu gửi trực tiếp.
- Khi thay một người trong cặp ngồi ghế, cả cặp mới chỉ thấy tin riêng từ khi cặp đó hình thành; người rời ghế mất quyền đọc. Cùng hai người đổi phe hoặc chơi ván tiếp vẫn giữ tin riêng.
- Người xem mới vào chỉ thấy tin Kênh Chung từ lúc vào. Chuyển giữa phòng chờ và ván không xoá tin; đóng phòng thì xoá toàn bộ chat phòng.
- Tin nhắn dài tối đa 200 ký tự. Mỗi người gửi tối đa 5 tin trong 10 giây; tin thứ 6 bị chặn với thông báo “Bạn gửi quá nhanh”.
- Thay từ cấm bằng \*\*\* trước khi phát cho người nhận. Bộ lọc xử lý chữ hoa/thường, có dấu/không dấu, khoảng trắng/ký tự chen vào và cách thay số 0 cho o, số 1 cho i. Danh sách từ nằm trong tệp cấu hình, áp dụng sau khởi động lại.
- Nội dung phải được hiển thị như văn bản thường, không chạy đoạn mã do người gửi chèn; không ghi nội dung chat vào nhật ký vận hành.
- Bộ lọc chung phục vụ tên đăng nhập, Tên hiển thị, tên Khách và tên phòng: các trường tên chứa từ cấm bị từ chối, không che bằng \*\*\* rồi lưu. Không ghi nội dung tin chưa lọc vào nhật ký.

**Việc cần làm**

- Nhận danh tính người gửi từ phiên đã xác thực; mỗi lệnh gửi/đọc mang phòng và kênh. Kiểm người còn ở phòng, vai trò hiện tại và mốc được đọc trước khi lấy hoặc phát tin; trả nội dung đã lọc hoặc lỗi quyền/độ dài/tốc độ để giao diện xử lý.
- Tạo lưu trữ tin theo phòng, kênh và mốc cặp người chơi; cập nhật quyền khi đổi vai trò.
- Tích hợp bộ lọc chung, kiểm độ dài và giới hạn gửi tại máy chủ.
- Viết kiểm thử giả yêu cầu trái quyền, thay người, đổi phe, đóng phòng và các biến thể né bộ lọc.

**Kết quả bàn giao**

- Dịch vụ hai kênh chat, bộ lọc và kiểm thử tự động.
- Hợp đồng gửi/đọc tin và lỗi quyền, độ dài, tốc độ; dữ liệu mẫu trước/sau đổi cặp.

**Điều kiện hoàn thành**

- Người xem không đọc tin riêng; cặp mới không đọc tin cũ; tin quá dài hoặc quá nhanh bị chặn.
- Đổi cặp phải cắt quyền đọc của người rời ghế và tin cặp cũ của cả hai người trong cặp mới; bộ lọc dùng chung che tin chat nhưng từ chối tên chứa từ cấm.

**Phạm vi và phối hợp**

Không làm chat riêng giữa bạn bè hay nhãn dán; khung hiển thị chat được thực hiện trong phần giao diện.

---

<a id="t42"></a>

#### T42 · FE khung chat hai kênh

| Trường | Giá trị |
|---|---|
| Issue Id | 78 |
| Issue Type | Task |
| Parent | EP-07 |
| Assignee | Kỳ |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-78 |
| Start date | 26/10/2026 |
| Due date | 26/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-07.1 |
| Is blocked by | T25, T37 |
| Component chính | FE |
| Components | FE, Trò chuyện |
| Labels | chinh-fe, p1, phat-trien, sprint-3, tro-chuyen |
| Nguồn đặc tả (BA / AC) | 0.13, 5.3, 10.1 |


**Description**

**Mục tiêu**

Dựng khung chat để người chơi phân biệt rõ kênh riêng và kênh chung, người xem chỉ thấy phần được phép.

**Bối cảnh công việc**

Cùng một khung chức năng được dùng ở phòng chờ và phòng đang đấu. Máy chủ lọc nội dung và quyết định quyền; giao diện phải phản ánh đúng vai trò và tránh để tin cũ còn hiện sau thay người.

**Yêu cầu cần đáp ứng**

- Trên máy tính, người chơi mặc định chỉ mở Kênh Riêng; có thể mở thêm Kênh Chung để xem hai khung song song hoặc ẩn/hiện từng khung. Ẩn khung không làm thay đổi quyền đọc và gửi.
- Trên điện thoại, hai kênh nằm trong một khung chuyển bằng thẻ chọn kênh, mặc định Kênh Riêng. Người xem chỉ có Kênh Chung, không có lối mở Kênh Riêng.
- Nhãn phải rõ kênh riêng giữa hai người chơi và kênh chung của phòng. Kênh Chung nhắc rằng người chơi cũng đọc và gửi được; tin người chơi có dấu nhận biết vai trò và phe.
- Hiển thị tin như văn bản thường, không chạy thẻ hoặc mã được gửi. Có trạng thái đang gửi, đã gửi, gửi lỗi và Thử lại; chặn nội dung quá 200 ký tự và hiện lỗi gửi quá nhanh từ máy chủ.
- Chuyển từ chờ sang ván không làm mất tin. Cùng cặp đổi phe hoặc chơi tiếp giữ tin riêng; khi đổi cặp, thay tập tin hiển thị theo mốc mới do máy chủ gửi, không giữ lại tin riêng của cặp cũ.
- Người xem mới chỉ thấy tin từ lúc vào. Phòng đóng thì khung không giữ nội dung chat của phòng đã đóng.

**Việc cần làm**

- Dùng dữ liệu quyền/kênh/mốc cặp từ máy chủ làm nguồn hiển thị; khi đổi vai trò hoặc đổi cặp, xoá phần tin không còn quyền khỏi trạng thái giao diện trước khi nạp tập tin được phép.
- Dựng bố cục hai khung ở máy tính và hai thẻ chọn kênh trên điện thoại, với trạng thái tải, rỗng và lỗi.
- Nối gửi/nhận tin, quyền theo vai trò và việc thay tập tin khi đổi phòng hoặc đổi cặp.
- Thử bằng người chơi và người xem, tin chứa thẻ mã, gửi lỗi rồi thử lại và chuyển trạng thái phòng.

**Kết quả bàn giao**

- Khung chat dùng chung trong phòng chờ và bàn đấu, nối máy chủ thật.
- Bằng chứng giao diện đổi cặp, đổi vai trò và gửi lỗi/Thử lại trên máy tính lẫn điện thoại.

**Điều kiện hoàn thành**

- Người xem không thấy kênh riêng; bố cục mặc định đúng thiết bị; nội dung không chạy mã và không rò tin cặp cũ.
- Thử lại tin lỗi không hiện hai bản tin đã gửi thành công; tin của cặp cũ biến mất ở cả người ở lại lẫn người mới, không chỉ ẩn thẻ Kênh Riêng.

**Phạm vi và phối hợp**

Không làm nhãn dán hay chat riêng giữa bạn bè; lọc từ cấm và giới hạn gửi cuối cùng vẫn được máy chủ thực thi.

---

<a id="t47"></a>

#### T47 · Kiểm thử US-07.1

| Trường | Giá trị |
|---|---|
| Issue Id | 83 |
| Issue Type | Task |
| Parent | EP-07 |
| Assignee | Thư |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-83 |
| Start date | 28/10/2026 |
| Due date | 28/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-07.1 |
| Is blocked by | T21, T42, T46 |
| Component chính | QA & DevOps |
| Components | QA & DevOps, Trò chuyện |
| Labels | chinh-qa-devops, kiem-thu, p1, sprint-3, tro-chuyen |
| Nguồn đặc tả (BA / AC) | 0.13, 5.3, 10.1 |


**Description**

**Mục tiêu**

Kiểm chứng chat đúng kênh, đúng nội dung được phép và có giới hạn chống gửi quá nhanh.

**Bối cảnh công việc**

Chuẩn bị hai người chơi và người xem; dùng cả máy tính và điện thoại. Mỗi tình huống ghi rõ ai gửi, ai được đọc và thời điểm người xem tham gia.

**Yêu cầu cần đáp ứng**

- Máy tính của người chơi mặc định chỉ Kênh Riêng, mở thêm được Kênh Chung song song và ẩn/hiện từng khung. Điện thoại dùng hai thẻ chọn kênh, mặc định Riêng. Người xem chỉ có Chung; gửi yêu cầu trực tiếp tới kênh riêng cũng phải bị từ chối.
- Người xem mới vào không đọc được tin chung gửi trước lúc vào. Cùng cặp đổi bên hoặc chơi ván tiếp vẫn đọc tin riêng cũ; chuyển giữa chờ và đấu giữ tin và quyền kênh.
- Đóng phòng phải xoá chat phòng. Thử nội dung chứa thẻ hoặc đoạn mã; trên màn hình chỉ là chữ, không được chạy.
- Tin chứa từ cấm bị thay bằng \*\*\* trước khi phát. Thử chữ hoa/thường, có dấu/không dấu, chèn khoảng trắng/ký tự và thay 0 cho o, 1 cho i để tránh bỏ sót biến thể.
- Tin đúng 200 ký tự được xử lý; trên 200 bị chặn cả ở giao diện và máy chủ. Gửi 5 tin trong 10 giây rồi gửi tin thứ 6 phải báo “Bạn gửi quá nhanh” và không phát tin đó.
- Thêm từ vào tệp cấu hình rồi khởi động lại dịch vụ để kiểm áp dụng danh sách mới, không cần sửa cơ sở dữ liệu.

**Việc cần làm**

- Ghi thời điểm tham gia phòng và mốc cặp ngồi ghế cho bộ tin mẫu; tạo tin trước/sau từng mốc để đối chiếu cả dữ liệu máy chủ trả về lẫn nội dung trên màn hình.
- Viết bộ dữ liệu tin nhắn hợp lệ, biên, từ cấm và nội dung có thể gây chạy mã; xác định người được đọc cho từng tin.
- Chạy đa trình duyệt, thử yêu cầu vượt quyền và đối chiếu dữ liệu sau đóng phòng.
- Lưu kết quả theo từng biến thể, bằng chứng và lỗi; kiểm lại sau khi sửa.

**Kết quả bàn giao**

- Bộ tình huống cùng báo cáo kiểm hai kênh, lọc nội dung và giới hạn gửi.

**Điều kiện hoàn thành**

- Không rò kênh riêng, không chạy mã từ tin nhắn, không phát tin vượt giới hạn.
- Tin thứ sáu trong 10 giây không tới bất kỳ người nhận nào; sau đóng phòng, truy vấn bằng quyền cũ không lấy lại được chat. Báo tách những nhánh đổi vai trò đang chờ kiểm tích hợp, không ghi đã đạt.

**Phạm vi và phối hợp**

Nhánh đổi người từ ghế xuống xem và đưa người khác lên ghế được kiểm đầy đủ khi chức năng đổi vai trò hoàn tất trong hồi quy tổng.

---

<a id="us-07.2"></a>

### US-07.2 · Camera, mic và mức chia sẻ

| Trường | Giá trị |
|---|---|
| Issue Id | 33 |
| Issue Type | Story |
| Parent | EP-07 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-33 |
| Start date | 22/10/2026 |
| Due date | 25/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T33, T45 |
| Sprint thi công | S3 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | BE, Camera và mic, QA & DevOps |
| Labels | EP-07, camera-va-mic, dac-ta, p1 |
| Nguồn đặc tả (BA / AC) | 0.13, 0.14, 0.16, 4.1, 4.2 |


**Description**

**Mục tiêu**

Bàn giao đặc tả camera và mic do người chơi chủ động bật, chọn đối tượng nhận và có thể thu hồi quyền thực sự theo quy tắc đã duyệt.

**Bối cảnh công việc**

Hình và tiếng dùng chung mức chia sẻ nhưng có nút bật/tắt độc lập. Dịch vụ truyền hình/tiếng bị lỗi không được làm gián đoạn ván hoặc trò chuyện bằng chữ. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Bối cảnh: Người chơi vào phòng. Thao tác hoặc sự kiện: Khung hình/tiếng. Kết quả cần có: Camera và mic mặc định Tắt.
- Bối cảnh: Người chơi. Thao tác hoặc sự kiện: Bật/tắt camera, bật/tắt mic. Kết quả cần có: Hai nút độc lập; đối thủ thấy/nghe hoặc ngừng thấy/nghe trong ≤ 2 giây.
- Bối cảnh: Trình duyệt bị từ chối quyền camera/mic hoặc không có thiết bị. Thao tác hoặc sự kiện: Bấm bật. Kết quả cần có: Báo lỗi tiếng Việt dễ hiểu kèm cách cấp quyền; ván không bị ảnh hưởng.
- Bối cảnh: Thẻ trình duyệt mới tiếp quản phiên. Thao tác hoặc sự kiện: Hệ thống. Kết quả cần có: Camera/mic ở thẻ cũ tự dừng; thẻ mới mặc định tắt.
- Bối cảnh: Bất kỳ. Thao tác hoặc sự kiện: Kiểm tra cấu hình. Kết quả cần có: Không bật ghi hình/ghi âm; không lưu hình/tiếng.
- Bối cảnh: Người chơi rời ghế/rời phòng. Thao tác hoặc sự kiện: Hệ thống. Kết quả cần có: Luồng hình/tiếng của người đó dừng, quyền phát bị thu hồi.
- Bối cảnh: Người chơi trong phòng tự tạo. Thao tác hoặc sự kiện: Xem mức chia sẻ. Kết quả cần có: Ba mức: Không chia sẻ · Chỉ đối thủ · Cả đối thủ và người xem; chọn sẵn Chỉ đối thủ; một mức áp chung cho camera và mic đang bật.
- Bối cảnh: Chọn "Cả đối thủ và người xem". Thao tác hoặc sự kiện: Người xem. Kết quả cần có: Thấy hình/nghe tiếng của người chơi đó.
- Bối cảnh: Chọn "Chỉ đối thủ" hoặc "Không chia sẻ". Thao tác hoặc sự kiện: Người xem / đối thủ. Kết quả cần có: Người xem không nhận; "Không chia sẻ" thì đối thủ cũng không nhận.
- Người xem không có nút bật camera/mic. Giấy phép kết nối do máy chủ cấp cho người xem cũng phải cấm phát hình, tiếng và dữ liệu, để không thể vượt quyền bằng cách gọi trực tiếp dịch vụ.
- Bối cảnh: Đổi mức chia sẻ giữa ván. Thao tác hoặc sự kiện: Hệ thống. Kết quả cần có: Có hiệu lực ngay (≤ 2 giây).
- Bối cảnh: Hai người chơi đang ở phòng chờ. Thao tác hoặc sự kiện: Bật camera/mic. Kết quả cần có: Đối thủ (và người xem nếu chọn mức "Cả đối thủ và người xem") thấy/nghe ngay trong phòng chờ; khi bắt đầu ván, hình và tiếng không bị ngắt.
- Bối cảnh: Dịch vụ camera/mic lỗi, mất kết nối hoặc hết hạn mức. Thao tác hoặc sự kiện: Đang ở phòng chờ hoặc đang ván. Kết quả cần có: Ván tiếp tục bình thường, chat vẫn hoạt động, khung hình/tiếng hiện "Camera/mic tạm thời không dùng được", không xử ai thua.
- Hạ tầng đã chọn: LiveKit mã nguồn mở tự chạy bằng Docker cho phát triển và trình diễn cùng mạng; LiveKit Cloud gói miễn phí dự phòng khi trình diễn qua Internet, web và máy chủ ứng dụng chạy Render. Không chạy LiveKit trên Render; trình diễn cùng mạng cần web qua HTTPS, đổi môi trường bằng cấu hình và kiểm chứng thực tế.

**Việc cần làm**

- Đối chiếu quyền phát/nhận với vai trò và mức chia sẻ, chuyển thẻ/rời ghế, lỗi thiết bị và lỗi dịch vụ; chuẩn bị kiểm chứng hạ tầng tự chạy và phương án dự phòng đã chọn.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát camera/mic mặc định tắt, ba mức chia sẻ, thu hồi quyền và lỗi độc lập bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ camera/mic mặc định tắt, ba mức chia sẻ, thu hồi quyền và lỗi độc lập; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.

**Phạm vi và phối hợp**

Không ghi hình, ghi âm hoặc lưu nội dung truyền; người xem chỉ nhận, không phát camera/mic.

---

<a id="t33"></a>

#### T33 · BE LiveKit: token, quyền phát/nhận, thu hồi và mức chia sẻ

| Trường | Giá trị |
|---|---|
| Issue Id | 69 |
| Issue Type | Task |
| Parent | EP-07 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-69 |
| Start date | 24/10/2026 |
| Due date | 26/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 24 giờ |
| Remaining Estimate | 24 giờ |
| Story Points | 5 |
| Story (relates to) | US-07.2 |
| Is blocked by | T06, T22, T35 |
| Component chính | BE |
| Components | BE, Camera và mic |
| Labels | camera-va-mic, chinh-be, p1, phat-trien, sprint-3 |
| Nguồn đặc tả (BA / AC) | 0.13, 0.14, 0.16, 1.8, 4.1, 4.2 |


**Description**

**Mục tiêu**

Bảo đảm camera và micro chỉ truyền cho đúng người được phép, và thu hồi quyền khi người dùng mất vai trò.

**Bối cảnh công việc**

LiveKit là dịch vụ chuyển âm thanh và hình ảnh trực tiếp giữa các trình duyệt. Phần việc này xây xử lý phía máy chủ và giấy phép kết nối có giới hạn quyền; giao diện camera và micro được thực hiện riêng.

**Yêu cầu cần đáp ứng**

- Camera và micro mặc định tắt. Người chơi chọn một mức chia sẻ chung cho cả hai thiết bị đang bật: Không chia sẻ, Chỉ đối thủ, hoặc Cả đối thủ và người xem; mặc định Chỉ đối thủ.
- Bật/tắt hai thiết bị độc lập. Thay đổi chia sẻ phải có hiệu lực trong không quá 2 giây; người không được phép không nhận luồng hình hoặc tiếng, kể cả cố kết nối ngoài giao diện.
- Người xem chỉ được nhận theo lựa chọn của người chơi; giấy phép không được cho phát âm thanh, hình ảnh hoặc dữ liệu riêng. Thu hồi quyền phát/nhận tương ứng khi rời ghế, rời phòng, bị đuổi hoặc thẻ trình duyệt mới tiếp quản.
- Camera và micro dùng được ngay trong phòng chờ, tiếp tục không bị ngắt khi bắt đầu ván. Tab cũ bị tiếp quản phải dừng thiết bị; thẻ trình duyệt mới mặc định tắt.
- Không ghi hình, ghi âm hoặc lưu luồng truyền. Khi dịch vụ lỗi hay hết hạn mức, ván, chat và đồng hồ vẫn tiếp tục, không xử ai thua.
- Hỗ trợ LiveKit tự chạy trong mạng nội bộ và LiveKit Cloud qua cấu hình kết nối; giữ cùng cách kiểm quyền cho cả hai môi trường.

**Việc cần làm**

- Tích hợp cấp giấy phép theo tài khoản, phòng và vai trò hiện tại; kiểm quyền lại khi trạng thái thay đổi.
- Cung cấp thao tác cho giao diện bật/tắt, đổi chia sẻ và nhận lỗi rõ ràng.
- Kiểm máy chủ bằng người chơi/người xem thật, gồm giả yêu cầu phát trái quyền, rời phòng, đổi vai và đổi thẻ trình duyệt.
- Lập và chạy bảng người phát/người nhận cho ba mức chia sẻ, hai thiết bị bật/tắt độc lập và vai trò trước/sau rời ghế; đo từ thao tác tới khi phía nhận thực sự đổi luồng.

**Kết quả bàn giao**

- Dịch vụ quyền camera/micro, cách kết nối cho giao diện và bằng chứng kiểm quyền.

**Điều kiện hoàn thành**

- Người không được phép không nhận hoặc phát được luồng; lỗi truyền hình/tiếng không kết thúc ván.
- Không chia sẻ chặn cả đối thủ và người xem; Chỉ đối thủ chặn người xem; Cả đối thủ và người xem nhận được đúng người chơi đã bật thiết bị.
- Chuyển mức chia sẻ và bật/tắt có hiệu lực không quá 2 giây; chuyển từ phòng chờ vào ván không ngắt luồng đang hợp lệ.
- Dịch vụ lỗi trả trạng thái Camera/mic tạm thời không dùng được cho giao diện, trong khi nước đi, đồng hồ và chat vẫn hoạt động.

**Phạm vi và phối hợp**

Không dựng khung video hoặc nút giao diện. Thử đầu-cuối trên màn hình thật được thực hiện sau khi phần giao diện hoàn tất.

---

<a id="t45"></a>

#### T45 · Kiểm thử US-07.2

| Trường | Giá trị |
|---|---|
| Issue Id | 81 |
| Issue Type | Task |
| Parent | EP-07 |
| Assignee | Thư |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-81 |
| Start date | 30/10/2026 |
| Due date | 30/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-07.2 |
| Is blocked by | T21, T42, T58 |
| Component chính | QA & DevOps |
| Components | Camera và mic, QA & DevOps |
| Labels | camera-va-mic, chinh-qa-devops, kiem-thu, p1, sprint-3 |
| Nguồn đặc tả (BA / AC) | 0.13, 0.14, 0.16, 1.8, 4.1 |


**Description**

**Mục tiêu**

Kiểm chứng camera và micro hoạt động đúng quyền, đúng mức chia sẻ và không gây gián đoạn ván.

**Bối cảnh công việc**

Dùng hai máy cho hai người chơi và thêm điện thoại hoặc máy khác làm người xem. Thử trên môi trường cho phép camera/micro, gồm trang web dùng kết nối bảo mật khi truy cập qua mạng nội bộ.

**Yêu cầu cần đáp ứng**

- Vào phòng mới phải thấy camera/micro đều tắt, mức chia sẻ mặc định Chỉ đối thủ. Bật/tắt từng thiết bị độc lập; đối thủ bắt đầu hoặc ngừng nhận trong không quá 2 giây.
- Thử Không chia sẻ, Chỉ đối thủ và Cả đối thủ và người xem. Một mức áp cho cả hai thiết bị đang bật; đổi mức trong ván có hiệu lực không quá 2 giây. Người xem không nhận khi không được cho phép.
- Người xem không có nút phát camera/micro; kiểm cả giấy phép kết nối do máy chủ cấp để chứng minh không được phát hình, tiếng hoặc dữ liệu riêng, không chỉ nhìn nút bị ẩn.
- Từ chối quyền thiết bị hoặc dùng máy không có thiết bị phải có lỗi tiếng Việt và hướng dẫn cấp quyền; ván vẫn tiếp tục. Mở thẻ trình duyệt mới tiếp quản thì thiết bị thẻ trình duyệt cũ tự dừng, thẻ trình duyệt mới mặc định tắt.
- Bật camera/micro ngay trong phòng chờ rồi bắt đầu ván; hình và tiếng không bị ngắt. Kiểm cấu hình không ghi hình, ghi âm hoặc lưu luồng.
- Chủ động làm dịch vụ truyền hình/tiếng lỗi hoặc mất kết nối; phải hiện “Camera/mic tạm thời không dùng được”, chat vẫn gửi được, đồng hồ vẫn chạy, không ai bị xử thua.

**Việc cần làm**

- Lập bảng cho mỗi người phát, trạng thái camera/mic và ba mức chia sẻ; ghi người phải nhận/không được nhận cùng thời điểm thao tác và thời điểm bên nhận đổi trạng thái để đo trên hai phía.
- Viết tình huống cho từng người nhận, mức chia sẻ và trạng thái thiết bị; ghi mốc đổi để đo thời gian.
- Thử giao diện thật và kiểm quyền phía máy chủ; lưu ảnh/video cùng số đo.
- Ghi rõ môi trường, thiết bị và trường hợp chưa thể thử; kiểm lại lỗi sau sửa.

**Kết quả bàn giao**

- Báo cáo kiểm hình/tiếng với số đo, quyền từng vai trò và bằng chứng không ảnh hưởng ván.

**Điều kiện hoàn thành**

- Các nhánh được giao đều đạt; không đánh dấu đạt nếu chỉ thử một người chơi hoặc chỉ kiểm nút giao diện.
- Có bằng chứng riêng cho từng nút camera/mic và đổi mức chia sẻ trong 2 giây; lỗi hoặc hết hạn mức media giữ nguyên kết quả ván, đồng hồ và chat. Không dùng ngưỡng 2 giây này làm ngưỡng thu hồi sau đuổi.

**Phạm vi và phối hợp**

Thu hồi luồng khi bị đuổi hoặc đổi từ ghế xuống xem được kiểm thêm cùng chức năng quản lý người xem và hồi quy tổng.

---

<a id="ep-08"></a>

## EP-08 · Đánh với máy theo cấp độ

| Trường | Giá trị |
|---|---|
| Issue Id | 9 |
| Issue Type | Epic |
| Parent | — |
| Assignee | Tình |
| Reporter | Tình |
| Priority | Medium |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-9 |
| Start date | 10/10/2026 |
| Due date | 17/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Component chính | Tổng hợp phạm vi các Task |
| Components | Bàn cờ, BE, FE, Luật cờ, Máy cờ, QA & DevOps |
| Labels | EP-08, ban-co, dac-ta, luat-co, may-co, p1 |
| Nguồn đặc tả (BA / AC) | 0.1, 0.9, 0.17, 6.1, 6.3, 10.1 |


**Description**

**Mục tiêu**

Bàn giao bộ đặc tả đã duyệt về ván với máy, ba cấp độ và hồ sơ chất lượng; bảo đảm các đặc tả thành phần nhất quán khi triển khai.

**Bối cảnh công việc**

Người chơi chọn phe Đỏ, Đen hoặc Ngẫu nhiên; ván không có đồng hồ. Máy dùng cùng luật với ván trực tuyến, có giới hạn suy nghĩ và cách xử lý sự cố rõ ràng. Các quyết định sản phẩm đã có hiệu lực; nhóm chức năng này tổng hợp và truy vết yêu cầu, không mở một vòng quyết định hoặc duyệt lại phạm vi.

**Yêu cầu cần đáp ứng**

- Ba cấp Dễ/Trung bình/Khó, chọn Đỏ/Đen/Ngẫu nhiên, Đỏ đi trước, không đồng hồ. Kết thúc kể cả đầu hàng có Ván mới/Về Sảnh; Ván mới mở thiết lập điền sẵn cấp và lựa chọn phe trước đó.
- Máy dùng luật chung, tách tính toán khỏi điều phối ván online; mục tiêu sâu 2/4/6 nửa nước, ngân sách 300/1.000/3.000 mili giây, hết ngân sách trả nước tốt nhất đã tìm được.
- Ván với máy chỉ giữ trong bộ nhớ; sau mất kết nối/đóng thẻ, quay lại trong 30 phút thì tiếp tục đúng thế cũ, quá hạn thì bỏ trạng thái. Chờ máy quá 10 giây vẫn giữ ván/thế để Thử lại. Máy chủ khởi động lại không khôi phục giả. Cấp Khó giải đúng 100% bộ chiếu hết ngắn, đo tốc độ và đấu 20 ván mỗi cặp cấp; bằng chứng được thu thập ở công việc kiểm chứng.

**Việc cần làm**

- Đối chiếu các đặc tả thành phần về ván với máy, ba cấp độ và hồ sơ chất lượng với quyết định hiện hành; kiểm đầy đủ luồng, quyền, giới hạn và ngoại lệ nêu trên.
- Rà các điểm giao với nhóm chức năng khác, gắn yêu cầu với công việc triển khai và tình huống kiểm thử; sửa sai lệch theo nguồn nghiệp vụ ưu tiên.
- Theo dõi độ đầy đủ của hồ sơ thành phần và bằng chứng phải bổ sung; mâu thuẫn chưa giải được theo thứ tự ưu tiên nguồn cần báo người phụ trách sản phẩm, không tự sửa quyết định đã duyệt.

**Kết quả bàn giao**

- Bản tổng hợp đối soát ván với máy, ba cấp độ và hồ sơ chất lượng, kèm truy vết tới đặc tả thành phần và quyết định nguồn.
- Danh sách điểm giao, tình huống nghiệm thu và sai lệch cần xử lý; bằng chứng kỹ thuật được quản lý tại công việc triển khai/kiểm chứng liên quan.

**Điều kiện hoàn thành**

- Các đặc tả thành phần phản ánh đúng ván với máy, ba cấp độ và hồ sơ chất lượng theo yêu cầu bên trên và thống nhất tại các điểm giao.
- Hồ sơ hoàn tất theo đặc tả thành phần cuối cùng, không yêu cầu người phụ trách sản phẩm duyệt lại quy tắc đã chốt. Kết quả chạy phần mềm và kiểm thử chỉ được ghi nhận khi có bằng chứng riêng.

**Phạm vi và phối hợp**

Không thêm xin hòa, đi lại, gợi ý nước, lịch sử ván với máy hoặc khôi phục sau khi bộ nhớ máy chủ đã mất.

---

<a id="us-08.1"></a>

### US-08.1 · Thiết lập và chơi ván với máy

| Trường | Giá trị |
|---|---|
| Issue Id | 34 |
| Issue Type | Story |
| Parent | EP-08 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-34 |
| Start date | 18/10/2026 |
| Due date | 21/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T34, T38, T43 |
| Sprint thi công | S2, S3 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | Bàn cờ, BE, FE, Máy cờ, QA & DevOps |
| Labels | EP-08, ban-co, dac-ta, may-co, p1 |
| Nguồn đặc tả (BA / AC) | 0.9, 6.1, 6.3 |


**Description**

**Mục tiêu**

Bàn giao đặc tả thiết lập và thao tác ván luyện tập với máy ở ba cấp độ, có lựa chọn phe theo quy tắc đã duyệt.

**Bối cảnh công việc**

Ván với máy không giới hạn thời gian. Đỏ đi trước; người chọn Đen nhìn bàn cờ lật và chờ máy đi nước đầu. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Bối cảnh: Ở Sảnh. Thao tác hoặc sự kiện: Bấm "Đánh với máy". Kết quả cần có: Mở hộp chọn cấp Dễ / Trung bình / Khó và phe Đỏ / Đen / Ngẫu nhiên.
- Bối cảnh: Chọn Đỏ. Thao tác hoặc sự kiện: Bắt đầu. Kết quả cần có: Vào trang ván với máy đang chơi, người chơi đi trước.
- Bối cảnh: Chọn Đen. Thao tác hoặc sự kiện: Bắt đầu. Kết quả cần có: Máy đi nước đầu ngay; bàn cờ lật để Đen ở dưới.
- Bối cảnh: Chọn Ngẫu nhiên. Thao tác hoặc sự kiện: Bắt đầu (lặp nhiều lần). Kết quả cần có: Máy chủ bốc phe; tỷ lệ xấp xỉ 50/50.
- Bối cảnh: Đang ván với máy. Thao tác hoặc sự kiện: Màn hình. Kết quả cần có: Không có đồng hồ, không có nút Xin hoà, không gợi ý nước đi, không có nút Đi lại (giai đoạn sau); có nút Đầu hàng.
- Bối cảnh: Ván với máy kết thúc (kể cả đầu hàng). Thao tác hoặc sự kiện: Hộp kết quả. Kết quả cần có: Có "Ván mới" và "Về Sảnh".
- Bối cảnh: Bấm "Ván mới". Thao tác hoặc sự kiện: Hệ thống. Kết quả cần có: Mở hộp thiết lập ván với máy điền sẵn cấp độ và lựa chọn phe ván trước; người chơi đổi phe/cấp rồi Bắt đầu → ván mới có mã định danh mới.

**Việc cần làm**

- Đối soát thiết lập, lượt đầu của Đỏ, hướng bàn khi cầm Đen, đầu hàng và hộp kết quả; giữ lựa chọn cấp/phe cũ khi mở Ván mới.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát ba cấp, chọn phe, không đồng hồ và Ván mới sau kết thúc bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ ba cấp, chọn phe, không đồng hồ và Ván mới sau kết thúc; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.

**Phạm vi và phối hợp**

Không thêm xin hòa, đi lại, gợi ý nước đi hoặc lưu lịch sử ván với máy.

---

<a id="t34"></a>

#### T34 · BE ván với máy: tạo ván, chọn phe, đầu hàng, Ván mới

| Trường | Giá trị |
|---|---|
| Issue Id | 70 |
| Issue Type | Task |
| Parent | EP-08 |
| Assignee | Đông |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-70 |
| Start date | 20/10/2026 |
| Due date | 21/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 12 giờ |
| Remaining Estimate | 12 giờ |
| Story Points | 3 |
| Story (relates to) | US-08.1 |
| Is blocked by | T20, T24 |
| Component chính | BE |
| Components | BE, Máy cờ |
| Labels | chinh-be, may-co, p1, phat-trien, sprint-2 |
| Nguồn đặc tả (BA / AC) | 0.9, 0.11, 1.8, 6.1, 6.3, 10.1 |


**Description**

**Mục tiêu**

Xây dựng quản lý ván đấu với máy để người dùng chọn cấp độ, chọn phe và bắt đầu ván mới.

**Bối cảnh công việc**

Người dùng luyện cờ một mình với máy. Thư viện luật và bộ máy chọn nước đã có; phần việc này ghép chúng thành một ván có danh tính, lượt đi và kết quả do máy chủ quản lý.

**Yêu cầu cần đáp ứng**

- Nhận cấp Dễ, Trung bình hoặc Khó và lựa chọn phe Đỏ, Đen hoặc Ngẫu nhiên. Nếu ngẫu nhiên, máy chủ bốc phe với tỷ lệ xấp xỉ 50/50, không tin phe do trình duyệt tự chọn ngoài yêu cầu hợp lệ.
- Người cầm Đỏ đi trước. Người cầm Đen thì máy phải tự đi nước đầu ngay khi ván bắt đầu. Mỗi nước của người và máy đều qua cùng thư viện kiểm luật.
- Không áp đồng hồ thi đấu cho người chơi và không có chức năng xin hoà. Có đầu hàng; đầu hàng kết thúc ván với người chơi thua. Điều kiện kết thúc theo luật cờ chung vẫn được áp dụng.
- Khi ván kết thúc, cung cấp dữ liệu để giao diện hiện Ván mới hoặc Về Sảnh. Ván mới mở lại lựa chọn cấp độ và lựa chọn phe trước đó, cho phép đổi trước khi bắt đầu; tạo mã ván mới, không hồi sinh ván đã xong.
- Giữ riêng lựa chọn Ngẫu nhiên ban đầu và phe thực tế đã bốc để điền đúng khi tạo ván tiếp theo. Trạng thái ván đấu với máy trong phiên bản này chỉ giữ trong bộ nhớ máy chủ, không có lịch sử ván dành cho người dùng.
- Trước tạo ván kiểm danh tính và vị trí chơi hiện có, không cho người đang ngồi ghế online hoặc có ván máy khác tạo vị trí thứ hai.

**Việc cần làm**

- Tạo thao tác bắt đầu ván, nhận nước người, yêu cầu máy tìm nước và chốt kết quả.
- Kết nối việc đầu hàng và tạo ván mới, bảo đảm không gửi nước máy vào ván đã kết thúc.
- Viết kiểm thử cả ba lựa chọn phe, nước đầu của máy, kết thúc và tạo lại ván có mã khác.
- Gắn kết quả tìm nước với đúng ván và trạng thái đang chờ máy; huỷ tác vụ khi đầu hàng, bỏ kết quả đến muộn để không áp nước vào ván đã kết thúc hoặc ván mới.

**Kết quả bàn giao**

- Dịch vụ ván đấu với máy và kiểm thử tích hợp với thư viện luật, bộ máy chọn nước.

**Điều kiện hoàn thành**

- Đúng lượt đầu theo phe; ván mới có danh tính mới; người dùng không thể điều khiển ván của người khác.
- Đầu hàng khi máy đang tính cho người chơi thua, giải phóng vị trí chơi và không nhận nước máy muộn.
- Lựa chọn Ngẫu nhiên được giữ để điền thiết lập ván tiếp theo dù phe thực tế ván trước là Đỏ hoặc Đen; bắt đầu lại tạo mã mới.

**Phạm vi và phối hợp**

Giữ ván khi mất mạng và xử lý Thử lại sau lỗi máy được thực hiện trong phần ổn định ván đấu với máy; không bổ sung đi lại hoặc gợi ý nước.

---

<a id="t38"></a>

#### T38 · FE thiết lập/chơi AI và giao diện sự cố máy cờ

| Trường | Giá trị |
|---|---|
| Issue Id | 74 |
| Issue Type | Task |
| Parent | EP-08 |
| Assignee | Kỳ |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-74 |
| Start date | 27/10/2026 |
| Due date | 28/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 12 giờ |
| Remaining Estimate | 12 giờ |
| Story Points | 3 |
| Story (relates to) | US-08.1 |
| Is blocked by | T19, T34 |
| Component chính | FE |
| Components | Bàn cờ, FE, Máy cờ |
| Labels | ban-co, chinh-fe, may-co, p1, phat-trien, sprint-3 |
| Nguồn đặc tả (BA / AC) | 0.9, 0.17, 6.1, 6.3 |


**Description**

**Mục tiêu**

Dựng giao diện chọn cấp độ, chọn phe và chơi với máy, gồm cách xử lý khi máy cờ gặp sự cố.

**Bối cảnh công việc**

Người chơi luyện cờ một mình. Máy chủ quyết định phe ngẫu nhiên, lượt và trạng thái ván; màn hình cần làm rõ lúc đến lượt người, lúc máy đang suy nghĩ và lúc cần người dùng xử lý lỗi.

**Yêu cầu cần đáp ứng**

- Hộp thiết lập có Dễ/Trung bình/Khó và Đỏ/Đen/Ngẫu nhiên. Cầm Đỏ thì người đi trước; cầm Đen thì máy đi đầu và bàn cờ lật để Đen ở dưới.
- Màn chơi không có đồng hồ thi đấu, Xin hoà, gợi ý nước hay Đi lại. Có Đầu hàng; khi máy suy nghĩ hoặc chưa tới lượt người thì không cho đi quân.
- Kết thúc ván, kể cả đầu hàng, hiện Ván mới và Về Sảnh. Ván mới mở thiết lập điền lại cấp độ và lựa chọn phe trước đó, cho phép đổi rồi bắt đầu ván có mã mới.
- Khi máy cờ không phản hồi quá 10 giây, hiện “Máy cờ gặp sự cố” và Thử lại; giữ nguyên mã ván, bàn cờ, lượt và phe, không chuyển Bỏ dở chỉ vì hết thời gian chờ. Thử lại yêu cầu máy tính nước trên cùng thế, không gửi lại nước người chơi. Nếu lỗi thực sự đã làm ván Bỏ dở thì Thử lại tạo ván mới cùng cấp và phe thực tế, không bốc lại phe ngẫu nhiên.
- Không gửi lại nước của người chơi khi thử lại. Chặn bấm trùng lúc đang xử lý. Khi máy chủ khởi động lại làm mất trạng thái ván, hiện “Ván không còn trạng thái để tiếp tục”, cho về Sảnh hoặc chủ động tạo ván mới.

**Việc cần làm**

- Nhận dữ liệu cấp độ, lựa chọn phe, phe thực tế, mã ván, lượt, trạng thái và lỗi từ dịch vụ ván máy; lưu riêng lựa chọn Ngẫu nhiên để điền lại khi bấm Ván mới, không suy ngược lựa chọn từ phe đã bốc.
- Dựng hộp chọn và màn bàn cờ tinh gọn, nối thao tác người chơi với dịch vụ ván máy.
- Dựng các trạng thái đang nghĩ, lỗi, thử lại, kết quả và quay về Sảnh; giữ nhãn lượt và thao tác rõ trên điện thoại.
- Kiểm luồng bình thường bằng máy cờ thật; kiểm hình thức trạng thái lỗi theo dữ liệu phản hồi trước khi thử sự cố thật.

**Kết quả bàn giao**

- Giao diện đấu máy đầy đủ, gồm kết quả và sự cố/Thử lại.
- Bảng ánh xạ phản hồi ván máy sang trạng thái giao diện và bằng chứng ba nhánh sự cố.

**Điều kiện hoàn thành**

- Đúng người đi đầu và hướng bàn; ván mới dùng lựa chọn được xác nhận; thử lại không nhân đôi nước người.
- Cùng một ca quá 10 giây phải giữ mã ván/thế/lượt khi Thử lại; ca đã Bỏ dở phải tạo mã mới và giữ phe thực tế. Máy chủ mất trạng thái phải hiện đúng thông báo, không dựng lại ván từ màn hình cũ.

**Phạm vi và phối hợp**

Giao diện không tự quyết định phục hồi ván. Hành vi sự cố thật được nghiệm thu sau khi phần giữ ván và xử lý lỗi phía máy chủ hoàn tất.

---

<a id="t43"></a>

#### T43 · Kiểm thử US-08.1

| Trường | Giá trị |
|---|---|
| Issue Id | 79 |
| Issue Type | Task |
| Parent | EP-08 |
| Assignee | Thư |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-79 |
| Start date | 29/10/2026 |
| Due date | 29/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v0.3 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-08.1 |
| Is blocked by | T38, T63 |
| Component chính | QA & DevOps |
| Components | Bàn cờ, Máy cờ, QA & DevOps |
| Labels | ban-co, chinh-qa-devops, kiem-thu, may-co, p1, sprint-3 |
| Nguồn đặc tả (BA / AC) | 0.9, 6.1, 6.3 |


**Description**

**Mục tiêu**

Kiểm chứng người dùng chọn cấp độ, chọn phe và chơi ván mới với máy đúng lựa chọn.

**Bối cảnh công việc**

Chuẩn bị tài khoản chính thức và phiên Khách, dùng máy cờ thật với các cấp đã cung cấp. Mỗi trường hợp ghi lựa chọn ban đầu, phe thực tế và danh tính ván để đối chiếu.

**Yêu cầu cần đáp ứng**

- Từ Sảnh mở thiết lập phải có ba cấp Dễ/Trung bình/Khó và ba lựa chọn Đỏ/Đen/Ngẫu nhiên. Thử từng cấp và từng phe, không chỉ giá trị mặc định.
- Chọn Đỏ thì người đi trước. Chọn Đen thì máy tự đi đầu và bàn cờ hiển thị Đen phía dưới. Không cho người đi quân trong lúc chưa tới lượt.
- Chọn Ngẫu nhiên nhiều lần; ghi số lần Đỏ/Đen để kiểm tỷ lệ xấp xỉ 50/50 và xác minh máy chủ là nơi bốc phe. Nêu trước số lần thử và cách đánh giá để kết quả đo có thể lặp lại.
- Màn đấu máy không có đồng hồ, Xin hoà, gợi ý nước đi hoặc Đi lại; có Đầu hàng. Kết thúc tự nhiên và kết thúc do đầu hàng đều có Ván mới/Về Sảnh.
- Ván mới mở hộp thiết lập điền sẵn cấp và lựa chọn phe ván trước, kể cả lựa chọn Ngẫu nhiên. Thử đổi cấp, đổi phe rồi bắt đầu; ván mới phải có mã khác và đúng người đi trước.
- Về Sảnh phải kết thúc luồng kết quả rõ ràng, không tự khôi phục ván đã kết thúc hoặc làm xuất hiện chức năng ngoài phạm vi.

**Việc cần làm**

- Lập bảng chín tổ hợp cấp độ và lựa chọn phe, kèm mã ván, phe thực tế, lượt đầu và hướng bàn; tách ca Ván mới sau đầu hàng khỏi ca Thử lại sau lỗi để dùng đúng kỳ vọng.
- Viết các tình huống cho cả ba cấp và ba lựa chọn phe, thêm kết thúc do đầu hàng và kết thúc theo luật.
- Quan sát giao diện và phản hồi máy chủ để xác minh lượt, phe và mã ván; ghi dữ liệu các lần bốc ngẫu nhiên.
- Lưu bằng chứng, phân loại đạt/không đạt/chưa thể kiểm và kiểm lại lỗi sau sửa.

**Kết quả bàn giao**

- Bộ tình huống cùng báo cáo luồng thiết lập, chơi và tạo ván máy mới.

**Điều kiện hoàn thành**

- Đúng lượt đầu, hướng bàn và giá trị điền lại; mỗi ván mới có danh tính riêng.
- Giá trị Ngẫu nhiên vẫn được điền lại là Ngẫu nhiên sau ván, không thành Đỏ/Đen theo kết quả bốc trước. Báo số lần thử và phân bố phe thực tế, không tự đặt ngưỡng thống kê mới ngoài yêu cầu 50/50.

**Phạm vi và phối hợp**

Không dùng kết quả này để khẳng định máy cấp Khó đủ mạnh hoặc đủ nhanh; chất lượng tìm nước và khôi phục sau sự cố có phần kiểm riêng.

---

<a id="us-08.2"></a>

### US-08.2 · Máy cờ ba cấp độ

| Trường | Giá trị |
|---|---|
| Issue Id | 35 |
| Issue Type | Story |
| Parent | EP-08 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-35 |
| Start date | 12/10/2026 |
| Due date | 15/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T24 |
| Sprint thi công | S1, S2 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | BE, Luật cờ, Máy cờ |
| Labels | EP-08, dac-ta, luat-co, may-co, p1 |
| Nguồn đặc tả (BA / AC) | 6.1, 6.3, 10.1 |


**Description**

**Mục tiêu**

Bàn giao đặc tả máy cờ ba mức khó luôn chọn nước hợp lệ và không làm chậm các ván giữa người với người theo quy tắc đã duyệt.

**Bối cảnh công việc**

Máy dùng cùng thư viện luật cờ với hệ thống, tăng dần độ sâu tìm kiếm và có giới hạn thời gian theo cấp. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Bối cảnh: Mọi cấp, mọi thế. Thao tác hoặc sự kiện: Máy chọn nước. Kết quả cần có: Luôn là nước hợp lệ theo thư viện luật cờ dùng chung.
- Bối cảnh: Hết ngân sách thời gian khi chưa đạt độ sâu mục tiêu. Thao tác hoặc sự kiện: Máy chọn nước. Kết quả cần có: Đi nước tốt nhất đã tìm được đến lúc đó.
- Khi máy cờ đang tìm nước, các phòng online vẫn phải được máy chủ chính xử lý bình thường, không bị chậm do tính toán máy cờ. Việc tìm nước chạy trong tiến trình riêng, nghĩa là một phần thực thi tách khỏi công việc điều phối phòng.
- Ba cấp Dễ/Trung bình/Khó có mục tiêu tìm sâu 2/4/6 nửa nước và ngân sách 300/1.000/3.000 mili giây. Hết ngân sách thì trả nước tốt nhất đã tìm được, không cố tìm đủ độ sâu làm quá thời gian. Chạy tìm kiếm trong tiến trình hoặc luồng xử lý riêng; đo kết quả ban đầu để phần tinh chỉnh tiếp tục.

**Việc cần làm**

- Đối chiếu cách chọn nước và phương án trả nước khi hết ngân sách với luật dùng chung; giữ mục tiêu 2/4/6 nửa nước và 300/1.000/3.000 mili giây để triển khai và đo thực tế.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát máy đi hợp lệ, độ sâu/ngân sách ba cấp và tách xử lý khỏi ván online bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ máy đi hợp lệ, độ sâu/ngân sách ba cấp và tách xử lý khỏi ván online; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.

**Phạm vi và phối hợp**

Chất lượng cấp Khó và khả năng khôi phục sau lỗi được xác nhận trong phần việc ổn định ván với máy.

---

<a id="t24"></a>

#### T24 · Máy cờ 3 cấp: negamax + alpha-beta, tìm sâu dần, tiến trình riêng

| Trường | Giá trị |
|---|---|
| Issue Id | 60 |
| Issue Type | Task |
| Parent | EP-08 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-60 |
| Start date | 14/10/2026 |
| Due date | 17/10/2026 |
| Sprint | XIAN Sprint 1 |
| Fix version | v0.2 |
| Original Estimate | 32 giờ |
| Remaining Estimate | 32 giờ |
| Story Points | 8 |
| Story (relates to) | US-08.2 |
| Is blocked by | T10 |
| Component chính | BE |
| Components | BE, Luật cờ, Máy cờ |
| Labels | chinh-be, luat-co, may-co, p1, phat-trien, sprint-1 |
| Nguồn đặc tả (BA / AC) | 6.1, 6.3, 10.1 |


**Description**

**Mục tiêu**

Xây dựng máy cờ ba cấp có thể trả nước hợp lệ trong ngân sách thời gian và chạy tách khỏi máy chủ phục vụ người chơi online.

**Bối cảnh công việc**

Máy cờ tự viết dùng chung bộ luật với online. Tìm kiếm chạy riêng để không chiếm đường xử lý các phòng khác.

**Yêu cầu cần đáp ứng**

- Ba cấp Dễ/Trung bình/Khó có mục tiêu độ sâu 2/4/6, ngân sách phản hồi tương ứng 300/1.000/3.000 mili giây. Độ sâu tính theo nửa nước, mỗi nửa nước là một lần đi của một bên. Ngân sách là thời gian được phép tìm nước, không phải thời gian thi đấu của người chơi.
- Dùng thuật toán tìm đối kháng negamax kết hợp cắt tỉa alpha-beta: duyệt nước có lợi và bỏ nhánh đã biết không cần xét. Tìm sâu dần để luôn giữ được kết quả tốt của vòng đã hoàn tất.
- Lượng giá dựa trên giá trị quân và vị trí; sắp xếp nước để tìm hiệu quả, dùng bảng ghi thế đã tính để tránh lặp tính không cần thiết.
- Chạy trong tiến trình hoặc luồng làm việc riêng; máy chủ gọi tìm nước mà vẫn xử lý kết nối và phòng khác.
- Mọi nước trả về phải hợp lệ theo bộ luật. Hết ngân sách trước độ sâu mục tiêu thì dùng nước tốt nhất đã tìm được, không trả nước bịa hoặc chờ vô hạn.
- Đo bản đầu tiên trên bộ thế chuẩn, ghi thời gian, độ sâu thực tế, nước đi, thiết bị và cách chạy; thấy nguy cơ không đạt phải báo người phụ trách, không tự giảm mục tiêu.

**Việc cần làm**

- Tạo giao diện nhận thế, phe và cấp độ, trả nước cùng thông tin đo.
- Viết lượng giá và tìm kiếm, dùng bộ sinh nước hợp lệ.
- Thêm tìm sâu dần, giới hạn thời gian, sắp xếp nước và bảng ghi thế.
- Tách xử lý tìm kiếm khỏi máy chủ chính, nối trạng thái hoạt động cho kiểm sức khoẻ.
- Chạy cùng bộ 50 thế giữa ván đã chuẩn bị ở cả ba cấp và các thế có đáp án bắt buộc để lập số đo ban đầu; lưu cả thời gian từng thế, độ sâu thực tế và nước trả về.
- Kiểm hết thời gian, hết nước, tác vụ lỗi; bàn giao cách gọi và chẩn đoán.

**Kết quả bàn giao**

- Gói máy cờ trong packages/engine gọi được từ máy chủ.
- Bộ kiểm nước hợp lệ và giới hạn thời gian.
- Báo cáo đo đầu tiên phục vụ tối ưu.
- Bảng từng thế/cấp với nước hợp lệ, độ sâu hoàn tất, thời gian phản hồi; tổng hợp thời gian mà 95% lượt đo không vượt quá, đối chiếu mục tiêu 300/1.000/3.000 mili giây.

**Điều kiện hoàn thành**

- Cả ba cấp chỉ trả nước có trong danh sách hợp lệ.
- Ép ngân sách ngắn vẫn lấy được nước hợp lệ tốt nhất đã lưu khi có nước để đi.
- Tìm kiếm chạy riêng, không khóa đường xử lý chính.
- Báo cáo có thời gian và độ sâu thực, không ghi đạt chỉ vì đã cấu hình độ sâu 6.
- Thế đã kết thúc hoặc không có nước hợp lệ trả trạng thái kết thúc rõ ràng thay vì nước giả; lỗi tác vụ được trả cho máy chủ để luồng ván xử lý.

**Phạm vi và phối hợp**

Bàn giao máy cờ và số đo đầu cho phần tích hợp, tối ưu và kiểm độc lập. Sức mạnh cấp Khó và ảnh hưởng dưới tải cần được đo đầy đủ sau đó.

---

<a id="us-08.3"></a>

### US-08.3 · Ổn định ván với máy và hoàn thiện cấp Khó

| Trường | Giá trị |
|---|---|
| Issue Id | 36 |
| Issue Type | Story |
| Parent | EP-08 |
| Assignee | Tình |
| Reporter | Tình |
| Priority | High |
| Status | Done |
| Resolution | Done |
| Jira Key | XIAN-36 |
| Start date | 16/10/2026 |
| Due date | 19/10/2026 |
| Sprint | — |
| Fix version |  |
| Original Estimate | — |
| Remaining Estimate | — |
| Story Points | — |
| Task thực hiện | T59, T63, T68 |
| Sprint thi công | S2, S3 |
| Component chính | Tổng hợp phạm vi các Task |
| Components | BE, Luật cờ, Máy cờ, QA & DevOps |
| Labels | EP-08, dac-ta, luat-co, may-co, p1 |
| Nguồn đặc tả (BA / AC) | 0.1, 0.17, 6.1, 6.3 |


**Description**

**Mục tiêu**

Bàn giao đặc tả việc tiếp tục ván với máy sau mất kết nối, xử lý máy cờ lỗi và chứng minh khác biệt chất lượng ba cấp theo quy tắc đã duyệt.

**Bối cảnh công việc**

Trạng thái ván với máy chỉ giữ trong bộ nhớ. Việc chờ máy quá lâu khác với ván đã mất trạng thái hoặc đã bị bỏ dở. Quy tắc và tiêu chí dưới đây là đầu vào đã được duyệt; phần việc này duy trì truy vết và kiểm tính nhất quán khi bàn giao triển khai.

**Yêu cầu cần đáp ứng**

- Bối cảnh: Đang ván với máy. Thao tác hoặc sự kiện: Đóng thẻ trình duyệt hoặc mất mạng, quay lại trong 30 phút. Kết quả cần có: Vào lại trang ván với máy đang chơi (hoặc thông báo cố định ở Sảnh) và chơi tiếp đúng thế cũ.
- Bối cảnh: Quá 30 phút. Thao tác hoặc sự kiện: Hệ thống. Kết quả cần có: Bỏ trạng thái ván trong bộ nhớ; không lưu lịch sử (bản bàn giao đầu tiên).
- Khi máy cờ không phản hồi quá 10 giây, hiện “Máy cờ gặp sự cố” và Thử lại; giữ nguyên mã ván, bàn cờ, lượt và phe, không chuyển Bỏ dở chỉ vì hết thời gian chờ. Thử lại yêu cầu máy tính nước trên cùng thế, không gửi lại nước người chơi. Nếu lỗi thực sự đã làm ván Bỏ dở thì Thử lại tạo ván mới cùng cấp và phe thực tế, không bốc lại phe ngẫu nhiên.
- Bối cảnh: Bấm "Thử lại" nhiều lần liên tiếp. Thao tác hoặc sự kiện: Hệ thống. Kết quả cần có: Chỉ xử lý một lần (chặn bấm trùng).
- Bối cảnh: Máy chủ khởi động lại. Thao tác hoặc sự kiện: Người chơi quay lại. Kết quả cần có: "Ván không còn trạng thái để tiếp tục", về Sảnh hoặc tạo ván mới; không khôi phục giả.
- Bối cảnh: Đang ván với máy. Thao tác hoặc sự kiện: Chủ động Rời ván hoặc Đăng xuất. Kết quả cần có: Xác nhận đầu hàng; Đồng ý → đầu hàng, huỷ tác vụ máy, giải phóng vị trí chơi; Huỷ → giữ nguyên.
- Cấp Dễ/Trung bình/Khó có mục tiêu tìm sâu lần lượt 2/4/6 nửa nước, tức số lượt đi đơn của các bên được xét trước. Thời gian phản hồi tương ứng không quá 300/1.000/3.000 mili giây, đo trên máy trình diễn ở phân vị 95: ít nhất 95% mẫu không vượt ngưỡng. Ghi kết quả vào báo cáo kiểm chất lượng máy cờ.
- Bối cảnh: Bộ thế chiếu hết 1 nước và 2 nước bắt buộc (đáp án đã xác minh). Thao tác hoặc sự kiện: Cấp Khó giải. Kết quả cần có: Đúng 100%.
- Bối cảnh: Đấu máy với máy 20 ván mỗi cặp cấp. Thao tác hoặc sự kiện: Ghi kết quả. Kết quả cần có: Khó thắng Trung bình và Trung bình thắng Dễ ở đa số ván (báo cáo tỷ lệ).

**Việc cần làm**

- Đối soát tiếp tục/thử lại/tạo mới và rời ván; chuẩn bị bộ thế có đáp án độc lập cùng quy trình đo tốc độ, giải chiếu hết và đấu 20 ván mỗi cặp cấp theo ngưỡng đã duyệt.
- Gắn từng yêu cầu với tình huống kiểm thử và công việc triển khai tương ứng; đối chiếu thiết kế màn hình với đặc tả nghiệp vụ, ưu tiên quyết định hiện hành khi tài liệu cũ khác nhau.
- Ghi nhận sai lệch và chuyển về đúng quyết định đã duyệt; nếu phát hiện mâu thuẫn chưa thể giải quyết bằng thứ tự ưu tiên tài liệu thì báo người phụ trách sản phẩm, không tự đổi phạm vi hoặc ngưỡng nghiệm thu.

**Kết quả bàn giao**

- Hồ sơ đối soát giữ ván 30 phút, Thử lại cùng thế, lỗi mất trạng thái và chất lượng cấp Khó bám đặc tả đã duyệt, kèm thông báo, ngoại lệ và nguồn truy vết.
- Danh sách tình huống nghiệm thu tương ứng và các sai lệch cần sửa trong tài liệu hoặc công việc triển khai.
- Hồ sơ bằng chứng được bổ sung từ công việc kiểm chứng cuối cùng: môi trường, ngày đo, người đo, kết quả thực tế, lỗi và các chỉ tiêu chưa đạt.

**Điều kiện hoàn thành**

- Hồ sơ phản ánh đầy đủ giữ ván 30 phút, Thử lại cùng thế, lỗi mất trạng thái và chất lượng cấp Khó; mọi yêu cầu bên trên truy được tới quy tắc đã duyệt và tình huống kiểm thử tương ứng.
- Các phần giao nhau với chức năng liên quan nhất quán; việc hoàn tất hồ sơ không yêu cầu duyệt lại quyết định nghiệp vụ và không chứng minh phần mềm đã chạy đạt.
- Ngưỡng nghiệm thu giữ nguyên trước thi công; hồ sơ bằng chứng chỉ đóng khi công việc kiểm chứng cuối cùng cung cấp đủ kết quả, chỉ tiêu chưa đạt ghi rõ Chưa thể nghiệm thu, không hạ ngưỡng để đóng hồ sơ.

**Phạm vi và phối hợp**

Không khôi phục giả sau máy chủ khởi động lại và không dùng tự nhận xét “máy mạnh” thay cho số đo hoặc đáp án đã xác minh.

---

<a id="t59"></a>

#### T59 · Tinh chỉnh máy cờ và đo GATE-ENGINE trên dữ liệu đã xác minh

| Trường | Giá trị |
|---|---|
| Issue Id | 95 |
| Issue Type | Task |
| Parent | EP-08 |
| Assignee | Đông |
| Reporter | Tình |
| Priority | High |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-95 |
| Start date | 18/10/2026 |
| Due date | 19/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 12 giờ |
| Remaining Estimate | 12 giờ |
| Story Points | 3 |
| Story (relates to) | US-08.3 |
| Is blocked by | T02, T24 |
| Component chính | BE |
| Components | BE, Luật cờ, Máy cờ |
| Labels | chinh-be, luat-co, may-co, p1, phat-trien, sprint-2 |
| Nguồn đặc tả (BA / AC) | 6.1, 6.3, BACKLOG-P1.md §6, BACKLOG-P1.md §7 |


**Description**

**Mục tiêu**

Tinh chỉnh sức chơi và đo tốc độ máy cờ để ba cấp có chất lượng kiểm chứng được.

**Bối cảnh công việc**

Bộ máy chọn nước đã có; bộ 50 thế giữa ván và bộ chiếu hết một hoặc hai nước đã có đáp án độc lập. Công việc tập trung vào cách đánh giá thế cờ, lựa chọn nhánh tìm kiếm và đo kết quả trên máy dùng để trình diễn.

**Yêu cầu cần đáp ứng**

- Ba cấp Dễ, Trung bình, Khó có mục tiêu độ sâu tìm kiếm tương ứng 2, 4, 6 nửa nước, mỗi nửa nước là một lần đi của một bên và ngân sách phản hồi 300, 1.000, 3.000 mili giây. Báo cả độ sâu thực tế và thời gian, không chỉ độ sâu đặt trong cấu hình.
- Khi hết thời gian mà chưa đạt độ sâu mục tiêu, trả nước hợp lệ tốt nhất đã tìm được. Máy không được trả nước sai luật hoặc làm luồng xử lý ván online bị chậm do chiếm tài nguyên.
- Cấp Khó phải giải đúng toàn bộ bộ chiếu hết một hoặc hai nước bắt buộc. Đấu tự động 20 ván cho mỗi cặp cấp liền nhau, báo riêng số thắng, hoà, thua; Khó thắng Trung bình và Trung bình thắng Dễ ở đa số ván.

**Việc cần làm**

- Đọc kết quả đo nền và cấu hình bộ máy hiện có; chạy lại cùng bộ thế trước khi chỉnh để xác định thế chậm/sai. Gắn mỗi thay đổi với kết quả trước/sau trên cùng dữ liệu và máy, giữ đáp án độc lập của bộ chiếu hết.
- Điều chỉnh cách chấm điểm thế cờ, thứ tự thử nước và loại nhánh không cần thiết; giữ các kiểm thử luật để việc tăng tốc không làm sai nước.
- Chạy cùng bộ 50 thế ở mỗi cấp trên máy trình diễn. Lưu thời gian từng lần, độ sâu đạt được, nước trả về, cấu hình máy và phiên bản phần mềm.
- Tính mốc thời gian mà ít nhất 95% lượt đo không vượt quá, đối chiếu lần lượt 300, 1.000 và 3.000 mili giây. Chạy lại bộ chiếu hết và các cặp đấu máy, giữ dữ liệu thô để người kiểm thử đối chiếu.

**Kết quả bàn giao**

- Bộ máy cờ đã tinh chỉnh, cấu hình ba cấp và báo cáo tốc độ, độ sâu, độ đúng, sức chơi tương đối.
- Dữ liệu đo từng thế cùng kết quả từng ván đấu máy, đủ để lặp lại trên cùng máy.

**Điều kiện hoàn thành**

- Ngưỡng thời gian, tính hợp lệ, bộ chiếu hết và phân biệt sức chơi có bằng chứng đáp ứng; không chỉ nêu “cảm giác nhanh hơn”.
- Nếu chưa đạt, ghi đúng điểm chưa đạt và tác động để người phụ trách sản phẩm xử lý, không tự hạ mục tiêu hoặc tuyên bố hoàn tất.
- Báo cáo liệt kê riêng số thế chiếu hết bắt buộc đúng/tổng và bộ mở rộng nếu có; không áp yêu cầu 100% chiếu hết của cấp Khó cho cấp Dễ/Trung bình.

**Phạm vi và phối hợp**

Không xây giao diện báo lỗi hoặc tự tạo đáp án để chấm chính mình. Dùng bộ dữ liệu đã chuẩn bị, bàn giao số đo cho kiểm thử độc lập.

---

<a id="t63"></a>

#### T63 · BE giữ ván AI 30 phút, Thử lại, khởi động lại

| Trường | Giá trị |
|---|---|
| Issue Id | 99 |
| Issue Type | Task |
| Parent | EP-08 |
| Assignee | Cường |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-99 |
| Start date | 22/10/2026 |
| Due date | 23/10/2026 |
| Sprint | XIAN Sprint 2 |
| Fix version | v0.2 |
| Original Estimate | 12 giờ |
| Remaining Estimate | 12 giờ |
| Story Points | 3 |
| Story (relates to) | US-08.3 |
| Is blocked by | T34, T35 |
| Component chính | BE |
| Components | BE, Máy cờ |
| Labels | chinh-be, may-co, p1, phat-trien, sprint-2 |
| Nguồn đặc tả (BA / AC) | 0.9, 0.17, 6.1, 6.3 |


**Description**

**Mục tiêu**

Giữ và phục hồi trạng thái ván với máy khi người chơi mất kết nối hoặc bộ máy tính nước gặp sự cố.

**Bối cảnh công việc**

Ván với máy chỉ lưu trạng thái đang chơi trong bộ nhớ máy chủ, không tạo lịch sử ván ở phiên bản này. Người chơi cần biết trường hợp nào còn tiếp tục được và trường hợp nào phải bắt đầu ván mới.

**Yêu cầu cần đáp ứng**

- Sau khi mất kết nối hoặc đóng thẻ, giữ ván tối đa 30 phút để người chơi quay lại đúng đường dẫn và thế cờ. Quá hạn thì bỏ trạng thái khỏi bộ nhớ.
- Khi máy cờ không phản hồi quá 10 giây, hiện “Máy cờ gặp sự cố” và Thử lại; giữ nguyên mã ván, bàn cờ, lượt và phe, không chuyển Bỏ dở chỉ vì hết thời gian chờ. Thử lại yêu cầu máy tính nước trên cùng thế, không gửi lại nước người chơi. Nếu lỗi thực sự đã làm ván Bỏ dở thì Thử lại tạo ván mới cùng cấp và phe thực tế, không bốc lại phe ngẫu nhiên.
- Bấm Thử lại liên tiếp chỉ được xử lý một lần; không khởi chạy nhiều lượt tính nước hoặc áp hai nước cho cùng lượt.
- Sau khi máy chủ khởi động lại, nếu trạng thái không còn thì báo “Ván không còn trạng thái để tiếp tục”, cho về Sảnh hoặc tạo ván mới; không giả khôi phục.
- Chủ động Rời ván hoặc Đăng xuất cần xác nhận đầu hàng. Đồng ý thì kết thúc, huỷ việc tính nước và giải phóng vị trí chơi; Huỷ thì giữ nguyên.

**Việc cần làm**

- Lưu mã ván, cấp độ, lựa chọn phe, phe thực tế, thế/lượt và mã tác vụ máy trong bộ nhớ; khi nhận tiếp tục/Thử lại, trả trạng thái đủ để giao diện phân biệt còn ván, đang tính, quá thời gian chờ, đã Bỏ dở hoặc mất trạng thái.
- Quản lý thời hạn giữ ván và tác vụ tính nước cùng danh tính người chơi. Kiểm quyền mỗi yêu cầu tiếp tục hoặc thử lại, không chỉ kiểm đường dẫn ván.
- Phân biệt quá thời gian chờ, lỗi tác vụ và ván đã bỏ dở để trả kết quả đủ cho giao diện báo đúng hậu quả.
- Viết kiểm thử ngắt mạng trước, trong và sau lượt máy; quay lại trong hoặc quá hạn; gửi thử lại trùng; rời ván lúc máy đang nghĩ; máy chủ khởi động lại.
- Khi Thử lại sau quá 10 giây, huỷ hoặc vô hiệu kết quả tác vụ cũ; kết quả cũ đến muộn không được áp thêm nước sau tác vụ mới. Kiểm nhiều lần Thử lại vẫn chỉ có một nước máy được chấp nhận.

**Kết quả bàn giao**

- Xử lý phía máy chủ về giữ ván, thử lại, huỷ tác vụ và giải phóng chỗ chơi.
- Bộ kiểm thử cùng dữ liệu phản hồi cho giao diện sự cố.
- Dữ liệu mẫu ba nhánh sự cố và bằng chứng kết quả tác vụ cũ đến muộn bị bỏ qua.

**Điều kiện hoàn thành**

- Ván còn hạn được tiếp tục đúng thế; ván mất trạng thái không được tiếp tục bằng dữ liệu đoán.
- Không áp nước trùng, không giữ vị trí chơi sau khi đã đầu hàng; thông báo thử lại phân biệt đúng tiếp tục ván cũ và tạo ván mới.
- Thử lại ván đã Bỏ dở kiểm lại quyền và một vị trí chơi trước tạo mã mới; không bốc lại phe thực tế. Về Sảnh hoặc tạo ván mới sau restart không tự tạo lịch sử ván với máy.

**Phạm vi và phối hợp**

Không làm lại giao diện thông báo hoặc điều chỉnh sức chơi của máy cờ. Công việc này quản lý vòng đời ván và tác vụ phía máy chủ.

---

<a id="t68"></a>

#### T68 · Kiểm thử US-08.3

| Trường | Giá trị |
|---|---|
| Issue Id | 104 |
| Issue Type | Task |
| Parent | EP-08 |
| Assignee | Nhạn |
| Reporter | Tình |
| Priority | Medium |
| Status | To Do |
| Resolution | — |
| Jira Key | XIAN-104 |
| Start date | 30/10/2026 |
| Due date | 30/10/2026 |
| Sprint | XIAN Sprint 3 |
| Fix version | v1.0 |
| Original Estimate | 8 giờ |
| Remaining Estimate | 8 giờ |
| Story Points | 2 |
| Story (relates to) | US-08.3 |
| Is blocked by | T38, T59, T65 |
| Component chính | QA & DevOps |
| Components | Luật cờ, Máy cờ, QA & DevOps |
| Labels | chinh-qa-devops, kiem-thu, luat-co, may-co, p1, sprint-3 |
| Nguồn đặc tả (BA / AC) | 0.9, 0.17, 6.1, 6.3, BACKLOG-P1.md §6, BACKLOG-P1.md §7 |


**Description**

**Mục tiêu**

Kiểm chứng phục hồi ván với máy và chất lượng ba mức chơi.

**Bối cảnh công việc**

Dùng máy dự kiến trình diễn, bộ 50 thế giữa ván và bộ chiếu hết một hoặc hai nước đã có đáp án kiểm chứng. Chuẩn bị cách ngắt mạng, gây lỗi hoặc trì hoãn bộ máy tính nước, khởi động lại máy chủ; ghi cấu hình máy và bản phần mềm khi đo.

**Yêu cầu cần đáp ứng**

- Đóng thẻ trình duyệt/mất mạng rồi về trong 30 phút: mở đúng ván hoặc nút Quay lại ở Sảnh và tiếp tục thế cũ. Quá hạn xoá trạng thái bộ nhớ, không lưu lịch sử.
- Khi máy cờ không phản hồi quá 10 giây, hiện “Máy cờ gặp sự cố” và Thử lại; giữ nguyên mã ván, bàn cờ, lượt và phe, không chuyển Bỏ dở chỉ vì hết thời gian chờ. Thử lại yêu cầu máy tính nước trên cùng thế, không gửi lại nước người chơi. Nếu lỗi thực sự đã làm ván Bỏ dở thì Thử lại tạo ván mới cùng cấp và phe thực tế, không bốc lại phe ngẫu nhiên.
- Bấm Thử lại liên tiếp chỉ xử lý một lần. Khởi động lại máy chủ thì hiện “Ván không còn trạng thái để tiếp tục”, cho về Sảnh hoặc tạo ván mới, không khôi phục giả.
- Rời ván/Đăng xuất chủ động phải xác nhận đầu hàng; Đồng ý kết thúc, huỷ tác vụ máy và giải phóng vị trí; Huỷ giữ nguyên.
- Đo 50 thế giữa ván ở mỗi cấp trên máy demo: độ sâu mục tiêu Dễ/Trung bình/Khó là 2/4/6; mốc thời gian mà ít nhất 95% mẫu không vượt quá phải không quá 300/1.000/3.000 mili giây tương ứng. Ghi độ sâu thực, không chỉ cấu hình.
- Cấp Khó giải đúng 100% bộ chiếu hết một và hai nước bắt buộc có đáp án độc lập. Đấu 20 ván mỗi cặp cấp liền nhau: Khó thắng Trung bình và Trung bình thắng Dễ ở đa số ván, ghi thắng/hoà/thua.

**Việc cần làm**

- Lập bảng ba lỗi độc lập: quá 10 giây nhưng còn ván, lỗi thực sự đã Bỏ dở và máy chủ khởi động lại mất ván; ghi mã ván/cấp/phe/thế/lượt trước và sau Thử lại, đồng thời cho tác vụ cũ trả kết quả muộn.
- Chuẩn bị máy demo và bộ thế có đáp án độc lập; ghi bản phần mềm, thiết bị và cấu hình cho mọi phép đo.
- Kiểm mất mạng trước/trong/sau lượt máy, quay lại trước/sau 30 phút; gây lỗi tìm nước và thử bấm Thử lại nhiều lần.
- Khởi động lại máy chủ, rời hoặc đăng xuất khi máy đang nghĩ; kiểm không áp nước cũ hay giữ vị trí sau đầu hàng.
- Chạy 50 thế mỗi cấp, lưu từng thời gian và độ sâu; tính mốc 95%, kiểm chiếu hết bắt buộc và 20 ván mỗi cặp cấp.
- Ghi từng ca là Đạt, Không đạt hoặc Chưa kiểm được cùng dữ liệu, thời điểm và bằng chứng đã che bí mật. Báo lỗi có cách tái hiện; sau sửa chạy lại ca lỗi và các nhánh liên quan.
- Cố ý trì hoãn máy quá 10 giây rồi Thử lại: đối chiếu mã ván, thế, lượt và phe không đổi trước nước máy mới; cho kết quả tác vụ cũ về muộn để kiểm không đi hai lần.

**Kết quả bàn giao**

- Bộ ca kiểm có bước chạy, dữ liệu và kết quả mong đợi để thành viên khác thực hiện lại được.
- Bảng kết quả thực tế cùng bằng chứng và danh sách lỗi còn mở; các lượt kiểm lại giữ được liên hệ với lỗi ban đầu.

**Điều kiện hoàn thành**

- Mọi tình huống nêu trên có kết quả đúng và bằng chứng lặp lại được; sai quyền, sai kết quả hoặc sai hạn thời gian phải ghi Không đạt, chưa được kết luận hoàn tất.
- Thiếu thiết bị, thiếu dữ liệu hoặc lỗi của phần tích hợp phải ghi rõ là Chưa kiểm được; việc người phụ trách biết vấn đề không thay thế kết quả đạt.
- Không đổi ván khi chỉ quá thời gian chờ; tạo mã mới giữ phe thực tế khi đã Bỏ dở; restart không khôi phục giả. Báo đủ thời gian từng mẫu và độ sâu thực, kết quả chiếu hết bắt buộc cùng số thắng/hoà/thua của 20 ván mỗi cặp.

**Phạm vi và phối hợp**

Công việc này chuẩn bị và thực hiện kiểm thử cho phạm vi trên. Người triển khai chức năng chịu trách nhiệm sửa lỗi; kết quả kiểm cục bộ không thay thế việc nghiệm thu toàn bộ sản phẩm.

---
