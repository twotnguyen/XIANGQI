# ISSUE-032 — Báo cáo đồ án, demo và bàn giao hoàn chỉnh

- Trạng thái: DONE
- Evidence: [docs/test-reports/ISSUE-032.md](../test-reports/ISSUE-032.md)
- Yêu cầu: R16, R12
- Phụ thuộc bắt buộc: [ISSUE-030](ISSUE-030-acceptance-load.md), [ISSUE-031](ISSUE-031-deploy-runbook.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

Người dùng chạy lại và trình bày được kiến trúc/AI, hiểu giới hạn, biết cách duy trì sau nộp.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [01-PRODUCT.md](../specs/01-PRODUCT.md)
- [07-UI-AND-TESTS.md](../specs/07-UI-AND-TESTS.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `README.md`
- `docs/handoff/DEFENSE.md`
- `docs/handoff/DEMO.md`
- `docs/handoff/MAINTENANCE.md`
- `docs/test-reports/final-coverage.md`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Evidence local/online,AI corpus/results, issue statuses and no secrets.

**Cung cấp:** README setup/test/deploy, defense outline, demo script2players5viewers, coverage R→tests, maintenance backup/update.

## Gate cuối và tái sử dụng evidence

Có thể dùng lại evidence030/031 ở cùng commit nếu từ đó chỉ sửa tài liệu, kèm kiểm tra diff chứng minh; không chạy lại benchmark tốn thời gian chỉ để ghi số mới khi code không đổi. Nếu có code/config thay đổi, chạy lane bị ảnh hưởng và regression cần thiết. PROJECT_COMPLETE yêu cầu online-smoke và manual media hardware; các lệnh automated dưới đây không thay gate đó.

## Các bước thực hiện

- [x] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [x] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [x] **Bước 1.** Viết giải thích kiến trúc và state machine, SQL transactions, auth/media quyền độc lập; sơ đồ từ implementation thực.

- [x] **Bước 2.** AI report thuật toán pseudocode, complexity, heuristic weights, minimax vs alpha-beta data, limits, original vs library attribution.

- [x] **Bước 3.** Demo sequence có accounts test chuẩn bị, trò chơi kết thúc fixture hợp lệ, undo/replay/media audience và3AI levels.

- [x] **Bước 4.** Rà all issue evidence; thiếu online/resource không được final COMPLETE, có thể bàn giao local milestone nêu đúng phạm vi.

- [x] **Bước 5.** Không commit credentials, không Co-Authored-By Codex; bàn giao commands và cách tạo task tiếp theo xử lý pending thực tế.

- [x] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [x] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-032.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| Fresh clone local | theo README | dựng/test/game hoạt động |
| Defense | đọc report + run benchmark | tái lập số liệu không bịa |
| Coverage | R01..R16 | mọi R có evidence và issue DONE |
| External missing | online smoke chưa chạy | báo pending rõ, không complete toàn bộ |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/integration.ts`, không phải API sản phẩm mới.

```ts
// Completion predicate for handoff audit:
// everyRequiredIssueDone && allRequiredEvidencePresent
// && localAcceptancePassed && onlineSmokePassed
// A missing external credential is a blocker, not a passing test.
```

## Lệnh kiểm chứng

Bắt buộc đối chiếu hàng **ISSUE-032** trong [ma trận test và harness](../specs/08-TEST-EXECUTION.md); ghi từng case `T032-xx` vào báo cáo theo [mẫu evidence](../handoff/EVIDENCE-TEMPLATE.md), ngoài acceptance riêng bên trên.

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm test:ai
pnpm test:load
```

Kỳ vọng: exit 0 và toàn bộ tình huống trong bảng có bằng chứng. Sau code TypeScript chạy thêm `pnpm typecheck` và `pnpm lint`; sau thay đổi bundling/runtime chạy `pnpm build`. Lệnh là mục tiêu sẽ có từ ISSUE-001, chưa phải đã chạy ở giai đoạn lập kế hoạch. Nếu local gate đã qua và chỉ thiếu provider smoke, ghi LOCAL_DONE kèm external pending; nếu thiếu service chặn chính local acceptance thì BLOCKED_EXTERNAL. Không thay actual provider PASS bằng mock. Xem định nghĩa trạng thái trong START-HERE.

## Điều kiện hoàn thành

- [x] Đầu ra đúng hợp đồng, không để implementation placeholder hoặc handler trả success giả.
- [x] Mọi dòng trong bảng nghiệm thu được kiểm chứng, gồm đường thất bại và quyền truy cập liên quan.
- [x] Dependency consumers vẫn tương thích; nếu đổi contract cập nhật spec và test consumer trong cùng thay đổi.
- [x] Evidence có command, exit code, môi trường, số test, artifact; phân biệt automated/mock/manual/external.
- [x] Issue và PROGRESS cập nhật cùng trạng thái; phần chưa xong có bước tiếp theo cụ thể.

## Bàn giao cho issue sau

Ghi API/file thực tế đã tạo, khác biệt có lý do so với đường dẫn dự kiến, test đã chạy và limitation còn tồn tại trong evidence. Không yêu cầu người thực hiện sau đọc lịch sử chat để hiểu kết quả.
