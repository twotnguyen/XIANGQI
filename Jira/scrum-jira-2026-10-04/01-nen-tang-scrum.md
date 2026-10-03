# 01 — Nền tảng Scrum và các khái niệm cần phân biệt

> Phân loại: [Q] quy tắc; [H] hướng dẫn; [K] khuyến nghị; [V] ví dụ. Xem [quy ước](README.md).

## 1. Scrum không phải kế hoạch waterfall chia thành nhiều Sprint

[Q] Scrum là framework tinh gọn để tạo giá trị qua giải pháp thích ứng cho vấn đề phức tạp. Cơ sở là thực nghiệm và tư duy tinh gọn; ba trụ cột là minh bạch, kiểm tra và thích ứng.

Chu trình: Product Owner sắp công việc vào Product Backlog → nhóm tạo Increment trong Sprint → nhóm và stakeholder kiểm tra kết quả, điều chỉnh → lặp lại.

Chỉ đặt tên các giai đoạn “phân tích”, “backend”, “frontend”, “QA” thành Sprint chưa bảo đảm Scrum. Nhóm chịu trách nhiệm tạo một Increment có giá trị, hữu dụng mỗi Sprint.

Nguồn: [S01 — Scrum Definition, Scrum Theory, Scrum Team](07-nguon-va-gioi-han.md#s01).

## 2. Trách nhiệm trong Scrum Team

| Trách nhiệm | Nội dung cốt lõi |
|---|---|
| Product Owner | Tối đa hóa giá trị; phát triển/truyền đạt Product Goal; quản lý và sắp thứ tự Product Backlog |
| Developers | Tạo Sprint Backlog; tuân thủ DoD; điều chỉnh kế hoạch hằng ngày; chịu trách nhiệm chuyên nghiệp với nhau |
| Scrum Master | Thiết lập Scrum; giúp nhóm cải thiện hiệu quả, tự quản và tháo gỡ trở ngại |

[Q] Scrum Team tự quản, có tổng hợp kỹ năng cần thiết và không có đội con/phân cấp bên trong. “Developers” không chỉ có nghĩa lập trình viên; người kiểm thử, thiết kế hoặc chuyên gia khác có thể thuộc trách nhiệm này khi tạo Increment. Cross-functional không có nghĩa từng cá nhân phải biết mọi chuyên môn.

Nguồn: [S01 — Scrum Team và các accountabilities](07-nguon-va-gioi-han.md#s01).

## 3. Tạo phẩm và cam kết

| Tạo phẩm | Cam kết | Ý nghĩa |
|---|---|---|
| Product Backlog | Product Goal | Công việc cần để cải thiện sản phẩm, hướng tới trạng thái tương lai |
| Sprint Backlog | Sprint Goal | Vì sao Sprint có giá trị, việc được chọn và kế hoạch thực hiện |
| Increment | Definition of Done | Bước tiến cụ thể, đã kiểm chứng và dùng được |

[Q] Product Goal là mục tiêu dài hạn; nhóm hoàn thành hoặc từ bỏ một mục tiêu trước khi nhận mục tiêu tiếp theo. Product Backlog là danh sách có thứ tự, phát triển theo thông tin mới và là nguồn công việc duy nhất của Scrum Team.

[Q] Sprint Backlog = Sprint Goal (why) + các PBI được chọn (what) + kế hoạch hành động (how). Nó thuộc về Developers và được cập nhật xuyên suốt Sprint.

[Q] Increment phải tích hợp tốt với phần trước và dùng được. Có thể tạo nhiều Increment trong Sprint và giao giá trị trước Sprint Review; Review không phải cổng phê duyệt phát hành.

Nguồn: [S01 — Scrum Artifacts](07-nguon-va-gioi-han.md#s01).

## 4. Quy tắc và thực hành tùy chọn

| Nội dung | Phân loại |
|---|---|
| Sprint, Planning, Daily, Review, Retrospective | [Q] Sự kiện Scrum |
| Sprint cố định, một tháng hoặc ngắn hơn | [Q] |
| Refinement | [Q] Hoạt động liên tục, không phải sự kiện chính thức riêng |
| Epic/Story/Task/Sub-task | Cách tổ chức công việc trên công cụ, không do Scrum quy định |
| User Story “As a… I want… So that…” | [H] Kỹ thuật bổ sung |
| Acceptance Criteria, Given–When–Then, INVEST | [H] Thực hành bổ sung |
| Story Points, Fibonacci, Planning Poker | [H] Kỹ thuật ước lượng tùy chọn |
| Definition of Ready | [H] Quy ước bổ sung |
| Sprint hai tuần | [K] Lựa chọn của nhóm, không phải độ dài bắt buộc |

Sizing là trách nhiệm của Developers thực hiện công việc; Scrum Guide không quy định phải dùng Story Points. Không có công thức chung “một point bằng một số giờ”.

Nguồn: [S01](07-nguon-va-gioi-han.md#s01), [S07 — DoR](07-nguon-va-gioi-han.md#s07), [S08 — Story Points tùy chọn](07-nguon-va-gioi-han.md#s08).

## 5. Acceptance Criteria, Definition of Done và Definition of Ready

### Acceptance Criteria (AC)

[H] Điều kiện kiểm chứng riêng cho một backlog item: chức năng phải hành xử và tạo kết quả như thế nào. Nó giúp nhóm hiểu phạm vi và viết kiểm thử. Không nhất thiết phải dùng Given–When–Then, nhưng điều kiện phải rõ.

[V] Story tham gia phòng: mã hợp lệ/phòng còn chỗ → tham gia; phòng đầy → từ chối mà không vượt giới hạn; mã không tồn tại → lỗi đã thống nhất.

### Definition of Done (DoD)

[Q] Mô tả chính thức trạng thái Increment khi đáp ứng các chuẩn chất lượng của sản phẩm. Chuẩn tổ chức, nếu có, là yêu cầu tối thiểu. Các nhóm cùng làm một sản phẩm phải thống nhất và tuân thủ cùng DoD.

[K] Với phần mềm, có thể yêu cầu review, test đạt, tích hợp, cập nhật tài liệu và dữ liệu cần thiết. Đây là ví dụ checklist theo bối cảnh, không phải danh sách bắt buộc nguyên văn của Scrum.

**Đạt AC nhưng chưa đạt DoD chưa đủ để là phần Increment Done.** Không tạo một DoD riêng yếu hơn cho mỗi Story để né chuẩn chung; có thể thêm checklist đặc thù bên cạnh DoD chung.

### Definition of Ready (DoR)

[H] Công cụ tùy chọn để diễn đạt mức độ hiểu đủ trước khi lựa chọn công việc. [Q] Guide coi PBI có thể Done trong một Sprint là sẵn sàng để chọn. Điều này không bắt buộc một tài liệu DoR hay chữ ký phê duyệt.

[K] Nếu dùng DoR: hiểu mục tiêu/phạm vi, biết cách kiểm tra, đủ nhỏ, nhận diện phụ thuộc/bất định. Không đòi thiết kế hoàn hảo và không còn bất định mới cho bắt đầu.

Nguồn: [S01 — Definition of Done](07-nguon-va-gioi-han.md#s01), [S06 — AC so với DoD](07-nguon-va-gioi-han.md#s06), [S07](07-nguon-va-gioi-han.md#s07).

## 6. Hiểu đúng cam kết

[Q] Sprint Goal là cam kết của Developers; danh sách PBI được chọn không phải phạm vi bất biến. Khi có thông tin mới, Developers cùng PO thương lượng phạm vi mà không làm tổn hại Sprint Goal; chất lượng không giảm.

Không dùng velocity hoặc số thẻ Done để tự chứng minh giá trị. Một phần sản phẩm được dùng và kiểm chứng quan trọng hơn báo cáo “đã code xong”.

Nguồn: [S01 — The Sprint, Sprint Planning, Sprint Goal](07-nguon-va-gioi-han.md#s01).
