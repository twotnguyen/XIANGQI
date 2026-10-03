# 04 — Áp dụng Scrum trên Jira và kết quả quan sát thực tế

> Tách ba lớp: [H] cơ chế sản phẩm Jira; [O] quan sát site riêng; [K] quy ước nhóm. Audit riêng thuộc phiên 2026-10-03, không xác minh lại live khi đóng gói ngày 2026-10-04.

## 1. Hierarchy và quan hệ

[H] Mặc định Jira có Epic → Story/Task/Bug → Sub-task. Có thể tùy chỉnh hierarchy theo cấu hình/gói dịch vụ; không suy mẫu này cho mọi site.

Story và Task là cùng cấp trong cấu trúc mặc định. Muốn việc trực tiếp dưới Story, dùng Sub-task. Task dưới Epic và `relates to` Story vẫn là con Epic, không trở thành con Story.

[O] Mẫu XW-203 đã xem có Parent XW-16 và `relates to` XW-71. Đây là ví dụ phân biệt link với hierarchy; không tự kết luận cấu trúc đó là lỗi.

Nguồn: [S13](07-nguon-va-gioi-han.md#s13), [S17](07-nguon-va-gioi-han.md#s17), [O02](07-nguon-va-gioi-han.md#o02).

## 2. Parent, Sprint, Fix versions, Links

| Thông tin | Câu hỏi |
|---|---|
| Parent | Thuộc cấu trúc công việc nào? |
| Sprint | Được chọn cho vòng làm việc nào? |
| Fix versions | Thuộc bản phát hành nào? |
| Linked work items | Liên quan hoặc phụ thuộc việc nào? |

[H] Một version có thể trải qua nhiều Sprint. Link types do admin cấu hình; `blocks`, `is blocked by`, `relates to` là ví dụ từ tài liệu, không cam kết toàn site có mọi option. Không mặc định link tự cưỡng chế thứ tự thực thi.

Nguồn: [S12](07-nguon-va-gioi-han.md#s12), [S17](07-nguon-va-gioi-han.md#s17).

## 3. Trường nhập khác nội dung Description

Business Goal, In Scope, Out of Scope, AC, Business Rules, hướng dẫn test… có thể là heading nhóm viết trong Description. Chúng không mặc định là field Jira riêng.

Tách:

1. **Form tạo:** field và controls khi nhập.
2. **Trang chi tiết:** nhóm hiển thị field, công việc con, activity.
3. **Description:** nội dung do nhóm soạn, có thể khác nhau giữa các ticket.

Bắt buộc khi tạo ≠ đủ sẵn sàng làm ≠ đủ điều kiện Done. Jira có thể cho tạo chỉ với Summary nhưng nhóm vẫn cần thông tin để thực hiện đúng.

## 4. Phạm vi audit riêng

Site: https://xiangqi-web.atlassian.net

- API metadata đã đọc cho XIAN, XW, XWO, TGK; T2 trả lỗi quyền tạo.
- Form tạo browser: XIAN, lần lượt Epic/Story/Task, mở Show more.
- Trang chi tiết: mẫu XW-16, XW-71, XW-161, XW-203; không phải rà mọi ticket.
- XIAN chưa có work item khi khảo sát, nên không suy chi tiết XW thành cấu hình toàn XIAN.
- Không submit Create hay sửa ticket trong audit.

Bản ghi gốc: [metadata API](evidence/jira-issue-field-audit.json), [inventory browser](evidence/jira-browser-components.md). Xem phạm vi [O01](07-nguon-va-gioi-han.md#o01), [O02](07-nguon-va-gioi-han.md#o02).

## 5. API metadata bắt buộc

[O] Epic/Story/Task của XIAN, XW, XWO, TGK đều trả `issuetype`, `project`, `summary` là required trong metadata đã đọc. Chỉ XIAN được inspect toàn bộ optional create fields; các project còn lại không đủ cơ sở kết luận cùng toàn bộ optional fields.

[O] T2 trả: `You cannot create issues in this project.` Đây là lỗi quyền tạo trong ngữ cảnh tài khoản khảo sát, không phải kết luận rằng không đọc được project hoặc tất cả người dùng đều bị cấm tạo.

Không diễn giải required API thành danh sách heading Description bắt buộc.

Nguồn: [O01](07-nguon-va-gioi-han.md#o01).

## 6. Form tạo XIAN đã quan sát

[O] Ba loại có cùng tập trường UI, thứ tự một số trường khác nhau:

| Nhóm | Trường |
|---|---|
| Header | Space, Type |
| Nội dung | Summary, Description |
| Trạng thái/trách nhiệm | Status, Assignee, Team |
| Phân loại | Labels, Priority, Components |
| Quan hệ/kế hoạch | Parent, Sprint, Linked work items, Fix versions |
| Mốc/tệp | Start date, Due date, Attachment |

- Summary có `required=true` và `aria-required=true`.
- Status mặc định To Do; Assignee Automatic; Priority Medium.
- API metadata đã lưu không liệt kê Status, nhưng browser có field này. Không lấy API snapshot thay toàn bộ form UI.
- Show more/Show less, More options, Close, Create… là controls, không phải field.
- Không thấy AC, Epic Name hay Story Points riêng trong form tạo XIAN đã kiểm tra. Không suy thành “toàn site không có”.
- Field keys trong audit: Sprint `customfield_10020`; Team `customfield_10001`; Start date `customfield_10015`. Không dùng các ID này cho site khác.

Nguồn: [O01](07-nguon-va-gioi-han.md#o01), [O02](07-nguon-va-gioi-han.md#o02).

## 7. Trang chi tiết và Description mẫu XW

[O] Các nhóm chung: Description, Attachments, Linked work items, Activity, Details, Development, More fields, Automation, thời điểm Created/Updated. Epic có Child work items; Story/Task có Subtasks.

Story Points, Original estimate, Time tracking xuất hiện trên các trang chi tiết mẫu XW; vị trí Details/More fields thay đổi giữa mẫu. Không xem vị trí UI đó là schema cố định theo type hoặc khẳng định nguyên nhân hiển thị đã được chứng minh.

| Mẫu | Nội dung Description nổi bật |
|---|---|
| [XW-16](https://xiangqi-web.atlassian.net/browse/XW-16), Epic | Tóm tắt, bối cảnh, khái niệm, phạm vi, luật cho Task, đầu vào, Story, tiêu chí Epic, demo |
| [XW-71](https://xiangqi-web.atlassian.net/browse/XW-71), Story | User story, bối cảnh, phạm vi, AC, thứ tự Task, Done, AC ↔ test |
| [XW-203](https://xiangqi-web.atlassian.net/browse/XW-203), BE Task | Mục tiêu, khái niệm, đầu vào, phạm vi, bước làm, bẫy, tự kiểm, bàn giao, blocker, test |
| [XW-161](https://xiangqi-web.atlassian.net/browse/XW-161), QA Task | Mục tiêu, điều kiện bắt đầu, môi trường/dữ liệu, test cases, PASS, evidence, FAIL, blocker |

Đây là template nội dung đã có của dự án, không phải chuẩn Scrum hay field Jira chung. Chi tiết heading được giữ trong evidence browser.

## 8. Sprint Goal, Done và estimation: công cụ không thay framework

[H] Trang Start sprint nói thêm goal “if desired”. [Q] Scrum vẫn yêu cầu Sprint Goal trước khi kết thúc Planning. Nhóm cần thực hành goal dù UI không bắt buộc.

[H] Với board company-managed trong tài liệu Configure columns, Jira xem item ở cột ngoài cùng bên phải là complete. Status không map có thể làm item không hiện ở board/backlog. Điều này chưa xác minh mapping board riêng của bạn.

[K] Không map Blocked vào hoàn thành nếu thực tế chưa xong. Hủy công việc không phải tạo giá trị Done. Chỉ chuyển Done khi đạt quy ước AC/DoD; cột không kiểm chứng chất lượng thay nhóm.

[H] Jira hỗ trợ Story points hoặc Original estimate theo cấu hình board; time tracking khác estimation. Cộng giờ Sub-task không tự tạo Story Points hay velocity đúng nghĩa. Không biến phương pháp Atlassian khuyến nghị thành quy tắc Scrum.

Nguồn: [S01](07-nguon-va-gioi-han.md#s01), [S10](07-nguon-va-gioi-han.md#s10), [S11](07-nguon-va-gioi-han.md#s11), [S16](07-nguon-va-gioi-han.md#s16).

## 9. Kiểm tra trước khi áp dụng cấu hình

[K] Xác minh company-managed/team-managed, hierarchy, quyền, fields/screens, workflow mapping, board filter, estimation statistic và link types của đúng project/board. Tài liệu company-managed không được sao chép nguyên đường dẫn menu sang team-managed. Shared schemes có thể ảnh hưởng nhiều project; không chỉnh chỉ để phù hợp một template mà chưa xem phạm vi.

Tên UI có thể đổi từ project/issue/type sang space/work item/work type theo rollout. Thông tin audit riêng là snapshot có thời điểm, không phải cam kết cấu hình hiện tại.
