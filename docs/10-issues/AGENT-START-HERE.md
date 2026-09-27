# BẮT ĐẦU TRIỂN KHAI — HƯỚNG DẪN CHO AGENT MỚI

> **Cập nhật 2026-09-27:** nhóm làm việc theo **Jira Task** (`TKxx.y.z`). Vòng đời Task trên Jira, nhánh, commit, PR, bằng chứng và Definition of Done theo [AGENTS.md §8](../../AGENTS.md); issue trong thư mục này vẫn là **đặc tả** mà Task truy về.

**Goal:** Xây toàn bộ Cờ Tướng Online đúng quyết định đã thống nhất, đi từ kho đặc tả đến ứng dụng local và Internet đã có bằng chứng nghiệm thu.

**Architecture:** Frontend gửi ý định; backend quyết định quyền, luật cờ, thứ tự và kết quả. PostgreSQL lưu trạng thái, lệnh tranh chấp dùng SQL và khoá; AI ở child process; media có nguồn và thế hệ riêng.

**Tech stack:** TypeScript, Node24, pnpm workspace, React/Vite, NestJS/Socket.IO, Supabase/PostgreSQL, LiveKit, Vitest/Playwright. Bảng đầy đủ và ranh giới tại [tech-stack](../09-technical/tech-stack.md); không tự thay công nghệ.

**Spec:** [Nguồn yêu cầu](../01-requirements/README.md), [decision-log](../07-decisions/decision-log.md), [truy vết](../06-acceptance/traceability-matrix.md). Bộ kế hoạch này cụ thể hoá cách làm, không thay luật sản phẩm.

**Cho agent thực thi:** đọc AGENTS và WORKFLOW trước, sau đó thực hiện một issue theo checklist. Nếu có bộ skill superpowers, dùng `executing-plans` để thực thi trong một agent hoặc `subagent-driven-development` khi người điều phối đã chọn cách giao việc đó; thiếu plugin không làm thay đổi điều kiện PASS.

## 1. Đọc để hiểu đủ dự án

| Thứ tự | Đọc | Điều phải hiểu trước khi tiếp tục |
|---|---|---|
| 1 | [AGENTS](../../AGENTS.md) | Một issue/một nhánh/một PR, bằng chứng thật, không giảm ngưỡng |
| 2 | [Tổng quan](../00-overview/product-overview.md), [scope](../00-overview/scope.md), [glossary](../00-overview/glossary.md) | R01–R19; PLAYER khác SPECTATOR, PLAY khác WATCH |
| 3 | [game-rules §1](../04-business-rules/game-rules.md) | ĐEN y0, ĐỎ y9, ĐỎ đi trước; lật bàn chỉ đổi hiển thị |
| 4 | [architecture](../09-technical/architecture.md), [tech-stack](../09-technical/tech-stack.md) | Server authority, SQL/Prisma, lock order, AI process |
| 5 | [WORKFLOW](WORKFLOW.md), [TEST-CONVENTIONS](TEST-CONVENTIONS.md) | Cổng theo mốc, fixture, oracle và báo cáo |
| 6 | [EXECUTION-ORDER](EXECUTION-ORDER.md), [INDEX](INDEX.md) | Chọn đầu việc đủ phụ thuộc, không suy từ số thứ tự |
| 7 | Issue được giao + đúng phần ĐỌC TRƯỚC | Interface, hành vi, dữ liệu và từng test cụ thể của đầu việc |

Không cần đọc hết138 issue trước mỗi lần sửa. Cần đọc dependency cung cấp interface mình sử dụng, và issue nhận đầu ra trực tiếp để không phá contract.

## 2. Trạng thái ban đầu và chuẩn bị

Kho hiện chứa đặc tả và website tài liệu; chưa có ứng dụng, migration hoặc kết quả test ứng dụng. **TODO trong header là trạng thái thực thi hợp lệ**, không phải nội dung bỏ trống. Không suy PASS từ một báo cáo BA hay snippet trong issue.

Trước001 kiểm Git root, branch và remote thật. Mặc định thực thi trên kho được người dùng giao; nếu thư mục chưa là Git repo hoặc chưa có remote/quyền PR, ghi điều kiện thiếu, xác nhận nơi lưu mã với người điều phối trước bước commit/push/PR. Không đoán URL tổ chức hoặc mua dịch vụ. Việc chuẩn bị tài nguyên thuộc [EXTERNAL-SETUP](EXTERNAL-SETUP.md); thiếu Google/Cloud chỉ chặn đúng053/137, không chặn local.

Không cần thêm câu hỏi sản phẩm hiện tại: phạm vi và lựa chọn đã được PO chấp nhận/uỷ quyền quyết định. Nếu trong lúc viết mã phát hiện mâu thuẫn mới chưa có DEC xử lý, gửi nội dung hai nguồn và tác động cụ thể; không tự đổi yêu cầu hay hạ cổng.

## 3. Cách thực hiện một issue

- [ ] Xác nhận mọi dependency DONE và PR đã merge ở commit đang làm; mở đúng ISSUE-NNN.
- [ ] Đọc source requirement và hợp đồng tiêu thụ/cung cấp; liệt kê file sẽ sửa và phần ngoài phạm vi.
- [ ] Tạo nhánh theo WORKFLOW; ghi issue đang làm và commit nền.
- [ ] Tạo đúng fixture/test file trong issue, đặt tên test có T/TS ID và AC được phân công ở [AC-COVERAGE](AC-COVERAGE.md).
- [ ] Chạy ca trọng tâm trước sửa: phải thất bại vì hành vi thiếu/sai. Lỗi import/cấu hình không thay cho bằng chứng test bắt được lỗi nghiệp vụ.
- [ ] Làm từng bước, chạy lại ca trọng tâm; thêm đầy đủ ca lỗi/quyền/biên/race của issue.
- [ ] Thử làm hỏng đúng invariant trên working tree riêng để chứng minh test đỏ; khôi phục và chạy lại xanh, không commit lỗi chủ động.
- [ ] Chạy mọi cổng có hiệu lực và lane của issue; ghi số pass/fail/skip thực, exit code, môi trường, artifact.
- [ ] Đối chiếu từng ô PASS, từng AC phân công và phần kiểm chứng được chuyển sang đầu việc sau. Scope sớm không được nhận PASS cho transport/chức năng chưa tồn tại.
- [ ] Ghi báo cáo theo [mẫu](TEST-REPORT-TEMPLATE.md), tự review diff và kiểm không có secret.
- [ ] Fetch, mở PR, chờ kiểm tra/review/merge theo quy trình; chỉ sau merge cập nhật DONE và bàn giao.

## 4. Năm trọng tâm review xuyên suốt

| Nguy cơ | Nơi kiểm bắt buộc |
|---|---|
| Gói cũ/lặp sau thay cấu hình, membership, context hoặc version |011/064/086/108/127 và133; kiểm no-op, duplicate và payload khác |
| Sự kiện/timer tới đúng hạn hoặc chờ lock tới khi hết hạn |093/096/101/102/127/128; clock tiêm, trước/đúng/sau1ms |
| Client giả role, tài khoản hoặc đọc lại dữ liệu sau revoke |043/073/075/110/114/117/133; gửi trực tiếp, có/không proof |
| Hạ tầng mất giữa hai bước, restart sau commit trước response |051/085/097/099/115/120/137; retry không nhân bản hoặc tự cấp quyền |
| Kết quả đẹp giả do mock, không có test, buffer media hoặc corpus tự chấm |003/034/044/032/112/117/124/135/136; fail âm và đối chứng dương |

## 5. Bàn giao và điều kiện hoàn thành toàn dự án

Mỗi issue bàn giao: commit/PR, contract đã cung cấp, test và bằng chứng, migration/config cần thiết, phần deferred có issue đích và điều kiện chạy. Agent kế tiếp không cần lịch sử chat để hiểu các phần này.

**Local đạt:** ISSUE-136 đạt phạm vi local, mọi AC local có test/bằng chứng. **Internet đạt:**053 và137 DONE, email/Google/media hai mạng thật, benchmark lại và restart theo profile. **Toàn dự án hoàn thành:** mọi138 issue DONE/đã merge, bảng333AC không còn CHỜ/FAIL, R15/R16 và các tiêu chí GR/quyền/performance có bằng chứng, bàn giao138 được cập nhật với kết quả Internet cuối.138 hoàn thành hồ sơ local sớm không tự làm toàn dự án DONE.

## 6. Prompt giao việc có thể dùng ngay

> Triển khai issue TODO nhỏ nhất đã đủ dependency DONE trong docs/10-issues/INDEX.md của dự án này. Đọc AGENTS.md, docs/10-issues/AGENT-START-HERE.md, WORKFLOW.md, TEST-CONVENTIONS.md, issue được chọn và nguồn ĐỌC TRƯỚC. Chỉ làm scope issue đó; giữ yêu cầu và ngưỡng đã chốt. Viết test trước, dùng dữ liệu/dịch vụ thật theo issue, chứng minh test bắt được lỗi, chạy cổng bắt buộc. Đối chiếu AC-COVERAGE, lưu bằng chứng và bàn giao. Không đánh dấu DONE trước merge, không giả PASS khi thiếu tài nguyên. Nếu bị chặn, báo issue, bằng chứng và điều kiện gỡ chặn cụ thể.
