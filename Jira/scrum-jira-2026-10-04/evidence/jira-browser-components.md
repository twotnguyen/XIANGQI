# Thành phần Epic, Task, Story — xác minh trực tiếp trên browser

## Phạm vi và phương pháp

- Site: https://xiangqi-web.atlassian.net
- Form tạo: XIAN — xiangqi; chuyển từng loại Epic, Story, Task và mở Show more.
- Trang chi tiết: XW — xiangqi-web, vì XIAN chưa có work item.
- Chỉ đọc, đổi lựa chọn trong form trống và mở/đóng nhóm hiển thị; không bấm Create, không sửa ticket.
- Các heading trong Description là nội dung do dự án soạn, không phải trường riêng hay schema chung của Jira.

## Form tạo — trường xuất hiện ở cả ba loại

| Tên trên UI | Ý nghĩa |
|---|---|
| Space | Dự án; header đang chọn XIAN |
| Type | Loại work item; Epic, Story hoặc Task |
| Status | Trạng thái; form hiện mặc định To Do |
| Summary | Tiêu đề; input có required=true và aria-required=true |
| Description | Trình soạn thảo rich text; không có sẵn các heading template trong form trống |
| Assignee | Người được giao; mặc định Automatic |
| Labels | Nhãn phân loại |
| Sprint | Sprint |
| Priority | Mức ưu tiên; mặc định Medium |
| Components | Thành phần/module |
| Parent | Work item cha |
| Linked work items | Quan hệ với work item khác |
| Due date | Hạn hoàn thành |
| Fix versions | Phiên bản phát hành |
| Attachment | Tệp đính kèm; Drop files to attach or browse |
| Team | Nhóm phụ trách |
| Start date | Ngày bắt đầu |

### Thứ tự phần thân của từng form

- **Epic**: Summary → Description → Status → Assignee → Labels → Sprint → Priority → Components → Parent → Linked work items → Due date → Fix versions → Attachment → Team → Start date.
- **Story**: Summary → Description → Status → Assignee → Parent → Sprint → Priority → Components → Labels → Linked work items → Due date → Fix versions → Attachment → Team → Start date.
- **Task**: Summary → Description → Status → Assignee → Parent → Sprint → Priority → Components → Labels → Linked work items → Due date → Fix versions → Attachment → Team → Start date.

### Nút điều khiển, không phải trường nội dung

Minimize, Exit full screen, Show more/Show less, More options, Close, Create another, Create. More options hiển thị Configure fields, Find your field, Hide unused fields, Always open in this view. Không thay đổi các tùy chọn này.

## Trang chi tiết các ticket đã xem

| Phần | Epic XW-16 | Story XW-71 | Task XW-161 / XW-203 |
|---|---|---|---|
| Description | Có | Có | Có |
| Attachments | Có | Có | Có |
| Công việc con | Child work items | Subtasks | Subtasks |
| Linked work items | Có | Có | Có |
| Activity | All, Comments, History, Work log, Approvals | Như Epic | Như Epic |
| Details | Assignee, Reporter, Labels, Due date, Start date, Components, Fix versions, Priority | Thêm Story Points, Sprint, Parent | Thêm Original estimate, Time tracking, Sprint, Parent |
| More fields đã mở | Story Points, Original estimate, Time tracking, Sprint, Team, Parent | Original estimate, Time tracking, Team | Team |
| Development / Automation | Có | Có | Có |

Các trường có dữ liệu được đưa vào Details; trường trống có thể nằm trong More fields. Vị trí này không phải schema cố định của loại ticket.

## Thành phần nội dung bên trong Description của từng mẫu

### Epic — XW-16

EP16 · Hoàn thiện, bảo mật, thử tải, nghiệm thu, triển khai và bàn giao

Nguồn: https://xiangqi-web.atlassian.net/browse/XW-16

- 1. TÓM TẮT (đọc trong 1 phút)
- 2. BỐI CẢNH — VÌ SAO EPIC NÀY TỒN TẠI
- 3. KHÁI NIỆM CẦN HIỂU
- 4. PHẠM VI
- 5. LUẬT BẮT BUỘC CHO MỌI TASK
- 6. ĐẦU VÀO
- 7. DANH SÁCH STORY
- 8. TIÊU CHÍ HOÀN THÀNH EPIC
- 9. KỊCH BẢN DEMO (~10 phút)

### Story — XW-71

ST16.8 · Hạ tầng Internet bản đầu: /healthz, triển khai Vercel + Render, môi trường thử tải

Nguồn: https://xiangqi-web.atlassian.net/browse/XW-71

- 1. CÂU CHUYỆN NGƯỜI DÙNG
- 2. BỐI CẢNH
- 3. PHẠM VI
- 4. TIÊU CHÍ CHẤP NHẬN
- 5. THỨ TỰ TASK
- 6. ĐỊNH NGHĨA DONE
- 7. ĐỐI CHIẾU AC ↔ CA KIỂM THỬ

### Task — XW-161

[QA] TK12.1.4 · Kiểm chứng đầu hàng và đề nghị: quyền qua 2 cổng, tranh chấp, hết hạn chủ động

Nguồn: https://xiangqi-web.atlassian.net/browse/XW-161

- 1. MỤC TIÊU
- 2. ĐIỀU KIỆN BẮT ĐẦU
- 3. MÔI TRƯỜNG VÀ DỮ LIỆU
- 4. CA KIỂM THỬ
  - Nhóm 1 — Quyền qua cổng Socket.IO
    - QA12.1.4-01 · Đầu hàng qua socket hoạt động như HTTP
    - QA12.1.4-02 · Người xem / người ngoài gửi lệnh qua socket bị chặn ⭐
    - QA12.1.4-03 · Trường thừa giả mạo qua socket bị chặn
  - Nhóm 2 — Vòng đời đề nghị (tổng hợp)
    - QA12.1.4-04 · Đầu hàng khi đang có đề nghị chờ ⇒ đề nghị bị đóng
    - QA12.1.4-05 · Đầu hàng và hết giờ cùng lúc ⇒ 1 kết quả ⭐ (Cách T)
    - QA12.1.4-06 · Hai lệnh đầu hàng cùng lúc ⇒ 1 kết quả
    - QA12.1.4-07 · Trộn 2 cổng: xin hoà qua socket, đồng ý qua HTTP
    - QA12.1.4-08 · Xin hoà → từ chối ⇒ bàn không đổi
    - QA12.1.4-09 · Hết hạn chủ động không cần ai gửi lệnh ⭐ (Cách T + Cách M)
    - QA12.1.4-10 · Đề nghị thứ hai bị từ chối
    - QA12.1.4-11 · Tự đồng ý / người xem đồng ý bị chặn qua cả 2 cổng ⭐
    - QA12.1.4-12 · Nước đi mới làm đề nghị mất hiệu lực (qua socket)
    - QA12.1.4-13 · Đồng hồ không dừng khi có đề nghị
    - QA12.1.4-14 · Giới hạn 10 giây, biên chính xác (Cách T)
    - QA12.1.4-15 · Xin đi lại khi chưa đi nước nào
    - QA12.1.4-16 · Đồng ý hoà đúng lúc đối thủ vừa đi nước (Cách T)
  - Nhóm 3 — Test của Dev có bắt được lỗi không
    - QA12.1.4-17 · Thử phá có kiểm soát ⭐
    - QA12.1.4-18 · Chạy toàn bộ test liên quan
- 5. TIÊU CHÍ PASS
- 6. BẰNG CHỨNG PHẢI NỘP
- 7. NẾU FAIL
- 8. KẸT THÌ LÀM GÌ

### Task (BE) — XW-203

[BE] TK16.8.1 · Endpoint /healthz và readiness báo trạng thái DB + tiến trình AI

Nguồn: https://xiangqi-web.atlassian.net/browse/XW-203

- 1. MỤC TIÊU (đọc trong 1 phút)
- 2. KHÁI NIỆM CẦN BIẾT
- 3. ĐẦU VÀO CẦN CÓ
- 4. PHẠM VI
- 5. HƯỚNG DẪN LÀM TỪNG BƯỚC
- 6. BẪY DỄ GẶP
- 7. TỰ KIỂM TRƯỚC KHI CHUYỂN READY FOR TEST
- 8. BÀN GIAO
- 9. KẸT THÌ LÀM GÌ
- 🧪 KIỂM THỬ KHI READY FOR TEST
  - B. Các ca kiểm thử
  - C. Tiêu chí PASS / FAIL
  - D. Bằng chứng
  - E. Nếu FAIL

## Lưu ý phạm vi

- Đây là kiểm tra từng loại trên form tạo XIAN và các mẫu có sẵn trên XW, không phải rà toàn bộ ticket hay mọi dự án.
- Task triển khai và Task QA có cấu trúc Description khác nhau; không có một bố cục nội dung duy nhất cho mọi Task.
- Story Points, Original estimate và Time tracking có trên trang chi tiết XW nhưng không xuất hiện trong form tạo XIAN đã kiểm tra.
- Trang chi tiết có Reporter và Created/Updated; chúng không nằm trong danh sách trường nhập của form tạo XIAN đã kiểm tra.
- Các mẫu Description có dòng dẫn tới file .md nguồn, thông tin đọc lần đầu và tài liệu liên quan. Task còn có người làm/người kiểm; Story có bảng Task thuộc Story.
- Trong mẫu XW-203, Parent là Epic XW-16; quan hệ với Story XW-71 là relates to. Không nhầm liên kết Story với phân cấp cha-con.
