# 03 — Sắp thứ tự triển khai dự án

> Đây là [K] quy trình đề xuất dựa trên Scrum Guide và tài liệu thực hành. Không có công thức sắp thứ tự bắt buộc cho mọi dự án.

## 1. Ba loại thứ tự khác nhau

| Loại | Câu hỏi | Trách nhiệm |
|---|---|---|
| Product Backlog | Kết quả nào nên được tạo ra trước? | PO chịu trách nhiệm; tham khảo Developers/stakeholder |
| Lựa chọn Sprint | Mục tiêu gì và có thể Done những gì? | Nhóm thống nhất Sprint Goal; Developers chọn việc qua trao đổi với PO |
| Thực hiện trong Sprint | Việc nào trước, việc nào song song? | Developers lập và cập nhật kế hoạch |

Nguồn: [S01 — PO, Planning, Sprint Backlog](07-nguon-va-gioi-han.md#s01).

## 2. Bắt đầu từ kết quả đầu tiên có ý nghĩa

Hỏi: “Phần sản phẩm nhỏ nhất nào giúp người dùng làm được việc có ý nghĩa và giúp nhóm kiểm chứng hướng đi?”

Không xếp theo số thứ tự Epic hoặc mặc định làm xong toàn Epic trước khi mở Epic tiếp theo. Một lát chức năng có thể cần phần nhỏ từ nhiều Epic.

[V] Cờ tướng: “Hai người vào cùng phòng và thực hiện được lượt đi hợp lệ được đồng bộ” rõ giá trị hơn “xong database”. Có thể cần nhận diện người chơi tối thiểu, phòng, UI, realtime và luật server; không mặc nhiên cần toàn bộ quản lý tài khoản nâng cao.

Nguồn thực hành: [S03](07-nguon-va-gioi-han.md#s03).

## 3. Tiêu chí đặt việc lên trước

| Tiêu chí | Câu hỏi |
|---|---|
| Đóng góp mục tiêu | Thiếu việc này, mục tiêu gần nhất có đạt được không? |
| Giá trị | User/stakeholder làm được gì sau khi hoàn thành? |
| Phụ thuộc/mở đường | Việc này cần gì, hoặc mở đường cho việc quan trọng nào? |
| Rủi ro/học hỏi | Có giả định sai nào sẽ khiến đổi kiến trúc hoặc scope? |
| Hạn thật | Có ràng buộc bên ngoài, thời điểm thị trường hoặc hạn demo đã xác nhận? |
| Kích thước | Có lát nhỏ hơn giúp giao giá trị và phản hồi sớm? |

Ghi lý do cụ thể: A trước B vì B cần đầu ra A; C trước D vì cần kiểm chứng giả định có thể làm D thay đổi. Không dùng “tất cả High” thay cho quyết định thứ tự.

Một phương pháp chấm điểm chỉ là đầu vào thảo luận, không thay phán đoán sản phẩm. Không tạo số giả cho impact, effort hoặc confidence.

Nguồn: [S14 — Ordered Not Prioritized](07-nguon-va-gioi-han.md#s14), [S15 — phụ thuộc ảnh hưởng order](07-nguon-va-gioi-han.md#s15). S14 là bài giải thích lịch sử; trách nhiệm và cách chọn Sprint vẫn đối chiếu Guide 2020.

## 4. Xác định phụ thuộc thực sự

### Bắt buộc

B không thể hoàn tất nếu thiếu đầu ra A. Ghi rõ điều kiện: artifact, endpoint, schema, quyền truy cập, dữ liệu hoặc quyết định cần có.

### Có thể giảm hoặc tháo gỡ

FE không nhất thiết chờ BE hoàn thành toàn bộ. Thống nhất contract, FE dùng mock phù hợp, BE triển khai theo contract, sau đó tích hợp và kiểm thử thật. Mock không thay bằng chứng vận hành hệ thống thật.

### Chỉ là thói quen

“Làm hết DB → hết API → hết UI → hết QA” thường là tổ chức theo silo, không phải phụ thuộc bắt buộc của toàn dự án.

[K] Vẽ đồ thị phụ thuộc và kiểm tra vòng chờ. Nếu A chờ B và B chờ A, phải chia lại phạm vi, làm rõ contract hoặc giải quyết quyết định trước. Liên kết `blocks` chỉ biểu diễn quan hệ; không mặc định Jira tự khóa thao tác nếu chưa có cấu hình tương ứng.

Nguồn: [S15](07-nguon-va-gioi-han.md#s15), [S17 — links Jira](07-nguon-va-gioi-han.md#s17).

## 5. Giảm rủi ro sớm và chọn phạm vi vừa đủ

Nếu sản phẩm phụ thuộc realtime/đồng thời/luật server, kiểm chứng sớm thay vì làm hết màn hình dễ rồi mới thử phần cốt lõi.

Spike cần câu hỏi, timebox, phương pháp, bằng chứng và quyết định. Không nghiên cứu vô hạn. Spike có thể hỗ trợ giảm rủi ro nhưng không tự động là Increment dùng được; kết hợp với lát sản phẩm khi khả thi.

Không xây toàn bộ nền tảng cho tương lai chưa xác nhận. Làm đủ phần nền tảng để tạo lát chức năng gần nhất và đáp ứng chuẩn chất lượng hiện tại.

## 6. Quy trình lựa chọn Sprint

1. Xác định giá trị và xây Sprint Goal.
2. Xem các mục cao trong backlog đóng góp cho goal.
3. Kiểm tra phụ thuộc, mức rõ và khả năng Done trong Sprint.
4. Đối chiếu capacity, kỹ năng và kết quả quá khứ.
5. Lập kế hoạch đủ để bắt đầu; tính cả review, tích hợp, kiểm thử.
6. Xác định việc song song và điểm tích hợp.
7. Cập nhật kế hoạch theo thông tin mới, bảo vệ Sprint Goal và chất lượng.

Không lấy ticket ngẫu nhiên để mỗi người “có đủ việc”. Không để toàn bộ QA ở Sprint cuối. Không dùng estimate code đơn lẻ làm forecast toàn bộ giao hàng.

Nguồn: [S01 — Planning và The Sprint](07-nguon-va-gioi-han.md#s01), [S09](07-nguon-va-gioi-han.md#s09).

## 7. Ví dụ định hướng cho cờ tướng

| Nhóm kết quả | Lý do |
|---|---|
| Môi trường chạy tối thiểu, nhận diện người chơi, kiểm chứng rủi ro realtime/luật trọng yếu | Tránh phát hiện sai nền tảng muộn |
| Luồng tạo/tham gia phòng và trạng thái hai bên | Lát sử dụng xuyên suốt đầu tiên |
| Lượt đi hợp lệ và đồng bộ | Kiểm chứng giá trị chơi cờ |
| Kết thúc ván và kết quả | Hoàn chỉnh hành trình cốt lõi |
| Mở rộng phục hồi/lịch sử theo yêu cầu | Tăng độ bền vững và trải nghiệm |
| Khán giả/chat/AI/thông báo theo mục tiêu | Không để mở rộng lấn át giá trị cốt lõi |

[V] Đây không phải lịch Sprint, không gán points hoặc hạn. Bảo mật, quyền thao tác, xử lý đồng thời và kiểm thử cần thiết phải nằm trong từng lát từ đầu, không trì hoãn chuẩn chất lượng tới cuối. Nếu bắt buộc đăng nhập, nhận diện tối thiểu phải đáp ứng; nếu cho khách, không tự đặt tài khoản đầy đủ thành blocker.

## 8. Biểu diễn trên Jira và điều chỉnh

- Thứ tự/rank Backlog: thứ tự xem xét giao kết quả.
- Priority: quan trọng/khẩn cấp, không thay order.
- Parent: hierarchy, không phải thời gian.
- Sprint: vòng làm việc được chọn/dự kiến.
- Fix versions: nhóm phát hành, không đồng nghĩa Sprint.
- Links: phụ thuộc/liên quan; ghi điều kiện tháo gỡ trong nội dung.

Không thay liên kết bằng tên ticket “BE bước 1”, “FE bước 2”. Sau Review hoặc thay đổi quan trọng, PO xem lại order; trong Sprint, Developers điều chỉnh kế hoạch cùng PO khi cần mà không phá goal.

Nguồn: [S10](07-nguon-va-gioi-han.md#s10), [S12](07-nguon-va-gioi-han.md#s12), [S13](07-nguon-va-gioi-han.md#s13), [S17](07-nguon-va-gioi-han.md#s17).
