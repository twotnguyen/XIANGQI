# 02 — Lập kế hoạch dự án và chuyển yêu cầu thành backlog

> Các bước dưới đây là [K] cách tổ chức đề xuất, không phải quy trình stage-gate bắt buộc của Scrum. Chúng có thể lặp lại và diễn ra song song.

## 1. Đầu vào cần có

Trước khi tạo hàng loạt ticket, làm rõ:

- Người dùng, vấn đề và Product Goal.
- Phạm vi ban đầu; phạm vi chưa làm; ranh giới sản phẩm.
- Yêu cầu chức năng và các luồng chính, lỗi, ngoại lệ.
- Yêu cầu phi chức năng có cách đo: bảo mật, hiệu năng, độ tin cậy, khả năng truy cập… theo bối cảnh.
- Hiện trạng code, hạ tầng, dữ liệu và tài liệu.
- Ràng buộc công nghệ, ngân sách, mốc thật và hệ thống bên ngoài.
- Thành viên, kỹ năng, mức tham gia và capacity thực tế; không suy từ số người thành năng lực giao việc.
- Stakeholder, cách lấy phản hồi và các trách nhiệm kiểm tra kết quả.
- Giả định, câu hỏi chưa giải quyết và rủi ro.

Không biết thì ghi “chưa xác định” cùng cách làm rõ. Nếu tạo Task nghiên cứu, phải có câu hỏi, giới hạn và đầu ra; không dùng tên “Research” cho công việc vô thời hạn.

Cơ sở: [S01 — Product Goal, Scrum Team, Planning](07-nguon-va-gioi-han.md#s01); cách kiểm soát unknown tham khảo [S09](07-nguon-va-gioi-han.md#s09).

## 2. Xác định nguồn chuẩn và truy vết

[K] Đặt tài liệu yêu cầu, quyết định và hợp đồng kỹ thuật trong repository hoặc Confluence. Jira quản lý công việc và bằng chứng; quy định rõ thông tin nào có nguồn chuẩn ở đâu.

Ví dụ ánh xạ:

```text
Yêu cầu R-ROOM-JOIN
  → Story triển khai
  → Sub-task hoặc Task liên quan
  → AC của Story
  → Test case / automated test
  → PR / commit / test run / demo
```

Mã yêu cầu trong ví dụ chỉ là định danh do nhóm lựa chọn, không phải key Jira có thật.

Quy ước tối thiểu:

- Ticket dẫn tới phiên bản/section yêu cầu liên quan.
- Khi đổi yêu cầu, cập nhật AC, tests và ticket chịu ảnh hưởng.
- Ghi lý do và quyết định; không sửa một nguồn rồi để nguồn khác lệch.
- Bằng chứng thực thi nêu môi trường, phiên bản, kết quả; phân biệt mô phỏng với tích hợp thật.

Đây là khuyến nghị quản trị, không phải requirement field do Scrum Guide quy định.

## 3. Ba mức độ chi tiết của kế hoạch

| Mức | Nội dung | Mức chi tiết |
|---|---|---|
| Định hướng / roadmap | Mục tiêu, kết quả mong muốn, mốc và giả định | Đủ để định hướng; là dự báo, không khóa mọi Sprint |
| Product Backlog | Công việc được sắp thứ tự | Mục gần rõ hơn, mục xa có thể sơ bộ |
| Sprint Backlog | Mục tiêu Sprint, PBI được chọn, kế hoạch hành động | Đủ để bắt đầu và kiểm tra/điều chỉnh hằng ngày |

Không nhầm ba mức tổ chức này với ba tạo phẩm chính thức: Product Backlog, Sprint Backlog, Increment.

[Q] Refinement là hoạt động liên tục. [H] Tránh làm rõ quá xa; tránh phân công từng Task cho cả dự án trước khi biết những PBI nào sẽ được chọn cùng nhau.

Nguồn: [S01](07-nguon-va-gioi-han.md#s01), [S04 — độ xa refinement](07-nguon-va-gioi-han.md#s04), [S05 — tránh kế hoạch how quá sớm](07-nguon-va-gioi-han.md#s05).

## 4. Phân rã theo kết quả

[K] Epic nhóm một mục tiêu/capability lớn. Story mô tả nhu cầu hoặc kết quả cụ thể. Task có thể mô tả kỹ thuật, vận hành, nghiên cứu hoặc tài liệu. Sub-task chia việc thực hiện dưới một work item chuẩn.

Cấu trúc Jira mặc định:

```text
Epic
├── Story
│   ├── Sub-task FE
│   ├── Sub-task BE
│   └── Sub-task kiểm thử
└── Task kỹ thuật độc lập
```

[H] Ưu tiên lát chức năng xuyên suốt UI/API/data/test thay vì chia Product Backlog chỉ theo tầng kỹ thuật. Task kỹ thuật vẫn cần thiết, nhưng “xong API” không tự chứng minh Story đã Done.

Nguồn: [S03 — chia PBI thành phần giá trị](07-nguon-va-gioi-han.md#s03), [S13 — hierarchy Jira](07-nguon-va-gioi-han.md#s13).

## 5. Ticket rõ tới mức nào?

| Thời điểm | Nội dung nên có theo quy ước nhóm |
|---|---|
| Ghi nhận ý tưởng | Tên, vấn đề/kết quả, nguồn; có thể chưa giao người hoặc ước lượng |
| Refinement | Phạm vi, AC/cách kiểm tra, sizing phù hợp, phụ thuộc và bất định |
| Chọn vào Sprint | Đóng góp Sprint Goal, khả năng Done trong Sprint, kế hoạch đủ hành động |
| Thực hiện | Trạng thái thật, đầu ra trung gian, blocker, thay đổi và bằng chứng |
| Hoàn thành | Kết quả đúng AC, đạt DoD khi là phần Increment, liên kết bằng chứng |

Không áp dụng checklist đầy đủ ngay lúc tạo mọi ticket. Tạo được ticket, đủ sẵn sàng để làm và đủ điều kiện đóng là ba việc khác nhau.

## 6. Thứ tự triển khai và ước lượng

[K] Sau khi có backlog ban đầu, sắp thứ tự bằng mục tiêu, giá trị, rủi ro, phụ thuộc, hạn thật và kích thước. Chi tiết tại [03 — Thứ tự triển khai](03-thu-tu-trien-khai.md).

[Q] Developers chịu trách nhiệm sizing. Forecast Sprint dựa capacity sắp tới, kết quả quá khứ và DoD. Với nhóm mới chưa có lịch sử, ghi rõ forecast có độ bất định cao, chọn phạm vi thận trọng và học từ kết quả thực tế.

Không tự điền Story Points hoặc capacity chỉ để kế hoạch trông hoàn chỉnh. Không cố định quy đổi points thành giờ; không coi tổng giờ code là toàn bộ công sức vì còn review, tích hợp, kiểm thử và gián đoạn.

Nguồn: [S01 — Planning và Refinement](07-nguon-va-gioi-han.md#s01), [S08](07-nguon-va-gioi-han.md#s08), [S16 — cơ chế estimation Jira](07-nguon-va-gioi-han.md#s16).

## 7. Đánh giá chất lượng kế hoạch

[K] Một kế hoạch tốt phải:

- Đủ phạm vi cho mục tiêu, không nhất thiết mô tả hết tương lai.
- Rõ đầu vào → công việc → đầu ra → cách kiểm tra.
- Nhất quán giữa scope, AC, phụ thuộc và tiêu chí hoàn thành Epic.
- Khả thi với capacity, kỹ năng và điều kiện tích hợp.
- Có thứ tự thực sự, không chỉ nhiều ticket cùng High.
- Có trách nhiệm phù hợp thời điểm, không mặc định mọi ý tưởng phải assigned ngay.
- Truy vết được từ yêu cầu tới bằng chứng.
- Nhận diện unknown/risk và có cơ chế thay đổi.

## 8. Những điểm đã đính chính trong bình luận kế hoạch trước

- “Epic → Story → Task” không đúng hierarchy mặc định; trực tiếp dưới Story là Sub-task.
- Business Goal, In Scope, AC… là thông tin nên viết, không mặc định là field Jira riêng.
- UI đã quan sát dùng Parent; không bắt nhóm dùng tên cũ Epic Link.
- Không mặc định Task phải có Story Points hoặc mọi backlog item phải có Assignee ngay từ lúc ghi nhận.
- AC Create Room không nên âm thầm nhận cả scope Join Room. Nếu muốn kiểm tra toàn hành trình, viết rõ ở cấp phù hợp.
- “Message phù hợp” chưa kiểm thử rõ; ghi hành vi/thông báo theo yêu cầu đã thống nhất.
- Preconditions của nhánh thành công không được loại bỏ nhánh lỗi “phòng không tồn tại”.
- Tiêu chí Epic phải bao phủ scope đã nhận; nếu scope rộng hơn tiêu chí, thu hẹp scope hoặc bổ sung tiêu chí.

Đây là kết luận phân tích trong trao đổi, không phải trích dẫn trực tiếp của một tiêu chuẩn bên ngoài. Căn cứ hierarchy và AC: [S13](07-nguon-va-gioi-han.md#s13), [S06](07-nguon-va-gioi-han.md#s06).
