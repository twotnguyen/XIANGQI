# TÀI LIỆU DỰ ÁN — CỜ TƯỚNG ONLINE

**Trạng thái:** `SPEC_REVIEWED` · **Cập nhật:** 2026-09-22. Đã rà soát đặc tả theo [báo cáo hiện hành](08-ba-review/final-audit-2026-09-22.md); chưa triển khai ứng dụng hay nghiệm thu runtime.

## Đọc từ đầu tới cuối

1. [Tổng quan sản phẩm](00-overview/product-overview.md), [phạm vi](00-overview/scope.md), [thuật ngữ](00-overview/glossary.md), [vai trò](00-overview/actors.md).
2. [Yêu cầu R01–R19](01-requirements/README.md): hệ thống phải làm gì.
3. [Luồng người dùng](02-flows/README.md): bước chính, nhánh thay thế và lỗi.
4. [Màn hình và trạng thái](03-screens/README.md): route, hành động và phản hồi UI.
5. [Luật cờ](04-business-rules/game-rules.md), [chỉ mục nghiệp vụ](04-business-rules/business-rules.md), [quyền](04-business-rules/permissions.md).
6. [Dữ liệu và realtime](05-data-and-realtime/README.md): dữ liệu, phiên, chuyển trạng thái và thứ tự sự kiện.
7. [Nghiệm thu và truy vết](06-acceptance/README.md): từng BR/AC có nguồn, tiêu chí cần chứng minh.
8. [Nhật ký quyết định](07-decisions/decision-log.md): lý do, quyết định thay thế và thẩm quyền PO/BA.
9. [Kiến trúc](09-technical/architecture.md), [công nghệ](09-technical/tech-stack.md), [triển khai](09-technical/deployment.md), các contract kỹ thuật liên quan.
10. [Hướng dẫn giao agent](10-issues/AGENT-START-HERE.md), [kế hoạch 138 đầu việc](10-issues/README.md), [các mốc thực thi](10-issues/execution-milestones.md), [INDEX](10-issues/INDEX.md) và [WORKFLOW](10-issues/WORKFLOW.md).

Đọc theo vai trò: [ONBOARDING](ONBOARDING.md). Đọc trên web: [site/index.html](../site/index.html).

## Nguồn chuẩn và cách xử lý mâu thuẫn

| Loại nội dung | Nguồn định nghĩa |
|---|---|
| BR/AC nghiệp vụ | REQ tương ứng trong01; phiên/AC-SS ở05/session-state |
| Luật di chuyển và kết thúc cờ |04/game-rules; bộ luật dự án giản lược theo DEC-019 |
| Quyền |04/permissions dẫn tới BR; backend phải kiểm trên mọi đường vào |
| UI, route, trạng thái |03/screen-inventory và screen-states; quyền không do UI quyết định |
| Contract/schema/cơ chế kỹ thuật |05/data-model và09; công nghệ không biến thành nhu cầu sản phẩm |
| Lý do hoặc thay đổi một quyết định |07/decision-log; đọc ghi chú Superseded |
| Tiến độ thực thi |10/INDEX + bằng chứng test/PR; Ready của tài liệu không phải DONE issue |

[Requirement register](06-acceptance/requirement-register.md) lập chỉ mục ID và nguồn, không định nghĩa luật lần hai. Các bảng tóm tắt, flow và issue diễn giải cùng nguồn. Mâu thuẫn mới chưa được DEC giải quyết phải được báo, không chọn ngầm bản thuận tiện nhất.

## Tài liệu hiện hành và lịch sử

- [Báo cáo audit hiện hành](08-ba-review/final-audit-2026-09-22.md) và [backlog hiện hành](08-ba-review/question-backlog-2026-09-22.md) ghi các quyết định, giới hạn kiểm chứng.
- [Mục lục audit](08-ba-review/README.md) chỉ rõ snapshot cũ. Các số đếm/readiness trong báo cáo cũ không đại diện trạng thái hiện tại.
- `99-archive/` giữ nguyên để tra bài học. Không dùng toạ độ, điều kiện PASS hoặc lựa chọn cũ trong archive thay đặc tả hiện hành; không xoá.
- Supabase/Auth/Google/SMTP/LiveKit/hosting và benchmark vẫn cần cấu hình, chạy thực tế, ghi bằng chứng ở các issue tương ứng. Không có runtime PASS từ việc sửa Markdown.

Bộ issue đã được cụ thể hoá sau vòng audit BA: xem [PLAN-REVIEW](10-issues/PLAN-REVIEW.md), [thứ tự thực thi](10-issues/EXECUTION-ORDER.md), [phân công 333 AC](10-issues/AC-COVERAGE.md). Báo cáo BA trước đó là snapshot của vòng audit yêu cầu, không phải kết quả chạy bộ test này.
