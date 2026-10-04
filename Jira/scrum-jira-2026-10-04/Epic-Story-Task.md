Đã kiểm tra **trực tiếp bằng browser**, chuyển lần lượt Epic, Task, Story trong form tạo và mở các ticket có sẵn. Kết quả cần tách thành **trường nhập**, **các phần của trang chi tiết**, và **nội dung bên trong Description**.

**Phạm vi kiểm tra:**
- Form tạo trên **`XIAN — xiangqi`**, đã mở **Show more**.
- Trang chi tiết trên **`XW — xiangqi-web`**, vì `XIAN` hiện chưa có ticket.
- Không tạo ticket, không chỉnh sửa nội dung.

## 1. Những trường thực sự có trong form tạo

**Epic, Task và Story có cùng tập trường dưới đây.** Điểm khác nhau chủ yếu là thứ tự hiển thị.

| Thành phần trên UI | Nội dung |
|---|---|
| **Space** | Dự án chứa ticket; nằm trên đầu form |
| **Type** | Epic, Task hoặc Story; nằm trên đầu form |
| **Summary** | Tiêu đề ticket — input được đánh dấu **bắt buộc** |
| **Description** | Trình soạn thảo mô tả rich text |
| **Status** | Trạng thái; form hiện mặc định **To Do** |
| **Assignee** | Người được giao; mặc định **Automatic** |
| **Parent** | Work item cha |
| **Sprint** | Sprint của ticket |
| **Priority** | Mức ưu tiên; mặc định **Medium** |
| **Components** | Thành phần/module |
| **Labels** | Nhãn phân loại |
| **Linked work items** | Liên kết với ticket khác |
| **Due date** | Hạn hoàn thành |
| **Fix versions** | Phiên bản phát hành |
| **Attachment** | Tệp đính kèm — kéo thả hoặc **browse** |
| **Team** | Nhóm phụ trách |
| **Start date** | Ngày bắt đầu |

**Đính chính câu trả lời trước:** giao diện tạo thực tế có **Status**, dù metadata API trước đó không liệt kê trường này.

### Thứ tự trên từng form

- **Epic:** Summary → Description → Status → Assignee → Labels → Sprint → Priority → Components → Parent → Linked work items → Due date → Fix versions → Attachment → Team → Start date.
- **Task và Story:** Summary → Description → Status → Assignee → Parent → Sprint → Priority → Components → Labels → Linked work items → Due date → Fix versions → Attachment → Team → Start date.

Các nút **Show more/Show less, Minimize, Exit full screen, More options, Close, Create another, Create** là **điều khiển giao diện**, không phải trường nội dung của ticket.

## 2. Các phần trên trang chi tiết của ticket

Tôi đã mở:
- Epic: [XW-16](https://xiangqi-web.atlassian.net/browse/XW-16)
- Story: [XW-71](https://xiangqi-web.atlassian.net/browse/XW-71)
- Task triển khai Backend: [XW-203](https://xiangqi-web.atlassian.net/browse/XW-203)
- Task QA: [XW-161](https://xiangqi-web.atlassian.net/browse/XW-161)

| Phần giao diện | Epic | Story | Task |
|---|---|---|---|
| **Description** | Có | Có | Có |
| **Attachments** | Có | Có | Có |
| **Công việc con** | **Child work items** | **Subtasks** | **Subtasks** |
| **Linked work items** | Có | Có | Có |
| **Activity** | Có | Có | Có |
| **Details** | Có | Có | Có |
| **Development** | Có | Có | Có |
| **More fields** | Có | Có | Có |
| **Automation** | Có | Có | Có |
| **Created / Updated** | Có | Có | Có |

### Những trường trong Details và More fields

Các mẫu đều có: **Assignee, Reporter, Labels, Due date, Start date, Components, Fix versions, Priority**.

Ngoài ra:

| Mẫu đã xem | Trường bổ sung trong **Details** | Trường trong **More fields**, sau khi mở |
|---|---|---|
| **Epic XW-16** | — | Story Points, Original estimate, Time tracking, Sprint, Team, Parent |
| **Story XW-71** | Story Points, Sprint, Parent | Original estimate, Time tracking, Team |
| **Task XW-203 / XW-161** | Original estimate, Time tracking, Sprint, Parent | Team |

**Vị trí không cố định theo loại:** trường có dữ liệu có thể được đưa vào **Details**, trường trống nằm trong **More fields**.

**Activity** có các tab: **All, Comments, History, Work log, Approvals**.

## 3. Thành phần nội dung bên trong Description

Đây là **cấu trúc mô tả đang được dự án của bạn sử dụng**, không phải các trường riêng do Jira bắt buộc.

### Epic — mẫu XW-16

Description có các mục đúng theo thứ tự:

1. **TÓM TẮT (đọc trong 1 phút)**
2. **BỐI CẢNH — VÌ SAO EPIC NÀY TỒN TẠI**
3. **KHÁI NIỆM CẦN HIỂU**
4. **PHẠM VI**
5. **LUẬT BẮT BUỘC CHO MỌI TASK**
6. **ĐẦU VÀO**
7. **DANH SÁCH STORY**
8. **TIÊU CHÍ HOÀN THÀNH EPIC**
9. **KỊCH BẢN DEMO (~10 phút)**

Phần **DANH SÁCH STORY** có bảng **Story / Tên / Sprint / SP**, kèm sơ đồ phụ thuộc công việc.

### Story — mẫu XW-71

Description có:

1. **CÂU CHUYỆN NGƯỜI DÙNG**
2. **BỐI CẢNH**
3. **PHẠM VI**
4. **TIÊU CHÍ CHẤP NHẬN**
5. **THỨ TỰ TASK**
6. **ĐỊNH NGHĨA DONE**
7. **ĐỐI CHIẾU AC ↔ CA KIỂM THỬ**

Các bảng bên trong gồm:
- **Task thuộc Story:** Task / Key / Người làm / Người kiểm.
- **Tiêu chí chấp nhận:** # / Given / When / Then.
- **Thứ tự Task:** Task / Vai trò / Việc / Bắt đầu khi / Ready for Test (dự kiến) / Done (dự kiến).
- **Đối chiếu kiểm thử:** AC / Ca.

### Task triển khai — mẫu Backend XW-203

Description có:

1. **MỤC TIÊU (đọc trong 1 phút)**
2. **KHÁI NIỆM CẦN BIẾT**
3. **ĐẦU VÀO CẦN CÓ**
4. **PHẠM VI**
5. **HƯỚNG DẪN LÀM TỪNG BƯỚC**
6. **BẪY DỄ GẶP**
7. **TỰ KIỂM TRƯỚC KHI CHUYỂN READY FOR TEST**
8. **BÀN GIAO**
9. **KẸT THÌ LÀM GÌ**
10. **🧪 KIỂM THỬ KHI READY FOR TEST**

Khối kiểm thử cuối có thông tin **người kiểm, thời gian, thời điểm kiểm**, rồi các mục:
- **B. Các ca kiểm thử**
- **C. Tiêu chí PASS / FAIL**
- **D. Bằng chứng**
- **E. Nếu FAIL**

### Task QA — mẫu XW-161

Task QA dùng bố cục khác Task triển khai:

1. **MỤC TIÊU**
2. **ĐIỀU KIỆN BẮT ĐẦU**
3. **MÔI TRƯỜNG VÀ DỮ LIỆU**
4. **CA KIỂM THỬ**
5. **TIÊU CHÍ PASS**
6. **BẰNG CHỨNG PHẢI NỘP**
7. **NẾU FAIL**
8. **KẸT THÌ LÀM GÌ**

Trong **CA KIỂM THỬ**, các ca được chia nhóm, có mã ca, bước thực hiện, kết quả mong đợi và yêu cầu bằng chứng.

---

**Kết luận:** phần khác biệt lớn giữa Epic, Story và Task của bạn nằm ở **cấu trúc Description và cách tổ chức công việc liên quan**, không phải ba bộ trường nhập hoàn toàn khác nhau. **Task triển khai và Task QA cũng không dùng chung một bố cục mô tả.**

Tôi đã lưu bản ghi đầy đủ và cập nhật quy trình kiểm tra vào skill `hermes-browser`.

[File: jira-browser-components.md](#media:%2FUsers%2Ftwot%2F.hermes%2Fcache%2Fscratch%2Fjira-browser-components.md)