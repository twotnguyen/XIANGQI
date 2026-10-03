# 06 — Vận hành Sprint và checklist kiểm tra kế hoạch

> Phần sự kiện/cam kết là [Q] theo Scrum Guide. Checklist là [K] để nhóm tham khảo, không phải quy tắc bắt mọi backlog item phải đủ mọi ô ngay lúc tạo.

## 1. Chu kỳ Sprint

[Q] Sprint có độ dài cố định, một tháng hoặc ngắn hơn; Sprint mới bắt đầu ngay sau Sprint trước. Planning, Daily, Review và Retrospective diễn ra trong Sprint. Không kéo dài Sprint chỉ để làm nốt ticket hoặc giảm chất lượng để báo Done.

Nguồn: [S01 — The Sprint](07-nguon-va-gioi-han.md#s01).

### Sprint Planning

- Cả Scrum Team cộng tác để xây kế hoạch.
- Why: Sprint mang lại giá trị gì? Chốt Sprint Goal trước khi Planning kết thúc.
- What: Developers chọn PBI qua trao đổi với PO, dựa hiểu biết, capacity và DoD.
- How: Developers lên kế hoạch tạo Increment, có thể chia nhỏ việc thực hiện.
- Đầu ra: Sprint Backlog, không chỉ danh sách ticket đã assigned.

Timebox theo Guide: tối đa tám giờ cho Sprint một tháng; Sprint ngắn hơn thường có Planning ngắn hơn. Không diễn giải quy tắc tỷ lệ giờ trong một bài hướng dẫn thành con số bắt buộc cho mọi Sprint ngắn.

### Daily Scrum

- Sự kiện 15 phút cho Developers mỗi ngày làm việc trong Sprint.
- Kiểm tra tiến độ hướng Sprint Goal và điều chỉnh kế hoạch hành động.
- Không bắt buộc ba câu hỏi cố định; không phải buổi báo cáo cho quản lý.
- Developers có thể trao đổi/replan ngoài Daily; không chờ tới hôm sau mới xử lý blocker.

### Sprint Review

- Nhóm và stakeholder kiểm tra kết quả và tiến độ Product Goal.
- Xem điều gì thay đổi và quyết định điều chỉnh tiếp theo; cập nhật Product Backlog khi cần.
- Là buổi làm việc, không chỉ thuyết trình/demo.
- Không phải cổng bắt buộc để release.
- Timebox tối đa bốn giờ cho Sprint một tháng; Sprint ngắn hơn thường ngắn hơn.

### Sprint Retrospective

- Kiểm tra con người, tương tác, quy trình, công cụ, DoD và giả định.
- Chọn thay đổi hữu ích để tăng chất lượng/hiệu quả; xử lý sớm.
- Có thể đưa cải tiến vào Sprint Backlog tiếp theo, không có quy tắc 2020 bắt mọi Sprint phải thêm một ticket cải tiến.
- Timebox tối đa ba giờ cho Sprint một tháng; Sprint ngắn hơn thường ngắn hơn.

Nguồn: [S01 — Scrum Events](07-nguon-va-gioi-han.md#s01).

## 2. Refinement và chất lượng xuyên suốt

[Q] Refinement liên tục làm rõ, chia nhỏ và bổ sung thứ tự/kích thước. Không bắt buộc một cuộc họp riêng cố định, tỷ lệ thời gian cố định hoặc một “Sprint phân tích”.

[K] Chuẩn bị test từ refinement; review, tích hợp và kiểm thử trong từng lát chức năng. Không dồn mọi QA tới cuối dự án. Có thể dành thời gian để làm rõ việc sắp tới nhưng tránh chi tiết hóa backlog xa đến mức lãng phí.

Nguồn: [S01 — Product Backlog](07-nguon-va-gioi-han.md#s01), [S04](07-nguon-va-gioi-han.md#s04), [S08](07-nguon-va-gioi-han.md#s08).

## 3. Việc chưa Done và phạm vi thay đổi

[Q] PBI không đạt DoD không được release hay trình bày như Increment Done tại Review; quay lại Product Backlog để xem xét tương lai. Có thể minh bạch phần chưa xong và nguyên nhân, không giấu tồn đọng hoặc giả gọi là hoàn thành.

[K] Xem lại giá trị, thứ tự và cách chia nhỏ; không tự đưa tất cả tồn đọng lên đầu Sprint sau. Dùng Retro tìm nguyên nhân: scope quá lớn, đầu vào chưa rõ, thiếu kỹ năng, phụ thuộc, capacity, tích hợp/test chậm.

[Q] Trong Sprint có thể làm rõ và thương lượng lại phạm vi với PO khi học thêm, nhưng không làm tổn hại Sprint Goal và không giảm chất lượng. Nếu goal lỗi thời, chỉ PO có quyền hủy Sprint.

[H] Jira cho chuyển incomplete item sang backlog hoặc Sprint khác khi kết thúc; cơ chế UI không thay quyết định sản phẩm. Thêm/bớt item khi Sprint active là scope change có thể phản ánh trong report.

Nguồn: [S01 — DoD và The Sprint](07-nguon-va-gioi-han.md#s01), [S10 — Start sprint](07-nguon-va-gioi-han.md#s10).

## 4. Checklist trước khi lập backlog

- [ ] Product Goal và người dùng rõ.
- [ ] Scope/out of scope và hạn thật được phân biệt.
- [ ] Có nguồn yêu cầu và cơ chế quản lý thay đổi.
- [ ] Unknown/risk được ghi, không được điền bằng phỏng đoán.
- [ ] Có hiểu biết về đội, kỹ năng và mức tham gia thực tế.
- [ ] Có DoD thích hợp; trách nhiệm PO/SM/Developers rõ.

## 5. Checklist khi refinement mục sắp làm

- [ ] Mục tiêu/giá trị cụ thể, không chỉ tên module.
- [ ] Scope và AC/cách kiểm tra nhất quán.
- [ ] Nhánh lỗi, biên, quyền và yêu cầu chất lượng quan trọng được xét.
- [ ] Có thể Done trong một Sprint hoặc đã chia nhỏ hơn.
- [ ] Dependency chỉ rõ đầu ra/điều kiện; có cách tháo gỡ.
- [ ] Developers hiểu đủ để sizing/forecast phù hợp.
- [ ] Không lập chi tiết how và phân công cả tương lai quá sớm.

## 6. Checklist trước khi bắt đầu Sprint

- [ ] Goal là kết quả có giá trị, không chỉ số ticket.
- [ ] PBI được chọn có đóng góp hợp lý cho goal.
- [ ] Forecast xét capacity, lịch nghỉ, gián đoạn, kỹ năng và DoD.
- [ ] Có kế hoạch bắt đầu, điểm tích hợp, review/test và việc song song.
- [ ] Có cách xử lý blocker, không chỉ gắn nhãn.
- [ ] Jira có hierarchy và links đúng ý nghĩa.
- [ ] Cơ chế board/status/estimation phù hợp đã được kiểm tra trước khi dùng báo cáo.

## 7. Checklist khi xác nhận kết quả

- [ ] Đạt AC áp dụng và DoD chung nếu là phần Increment.
- [ ] Đã tích hợp và kiểm tra tương tác với phần trước.
- [ ] Test thực sự đã chạy; có actual result và evidence.
- [ ] Mock, prototype và test chưa chạy được ghi đúng trạng thái.
- [ ] Bằng chứng có môi trường/build/commit cần thiết và không chứa secrets.
- [ ] Không dùng việc Sub-task đóng hết thay chứng minh Story hoàn thành.
- [ ] Không dùng cột cuối Jira thay chứng minh chất lượng.

## 8. Checklist sau Sprint

- [ ] Review tạo phản hồi/điều chỉnh Product Backlog.
- [ ] Việc chưa Done được minh bạch và xem lại order.
- [ ] Retro chọn cải tiến có thể thực hiện, không chỉ ghi nhận chung chung.
- [ ] Dự báo tương lai được cập nhật theo bằng chứng.

## 9. Dấu hiệu cảnh báo

- Mọi ticket đều High nhưng không biết làm trước gì.
- Sprint chỉ tạo thành phần chưa dùng được, nhiều Sprint liên tiếp không có kết quả kiểm chứng.
- QA/tích hợp luôn phải chờ tới cuối dự án.
- Story Points tự đặt bởi người không thực hiện hoặc đổi thành giờ cố định.
- Ticket Done nhưng test chưa chạy hoặc còn cần công việc chất lượng bắt buộc.
- Sprint Goal được thay bằng danh sách công việc rời rạc.
- Có dependency loop hoặc người làm phải đoán input/output.
- Jira và tài liệu yêu cầu lệch nhau; chưa rõ nguồn chuẩn.

Các dấu hiệu là công cụ chẩn đoán đề xuất, không phải thang điểm/chứng nhận Scrum.
