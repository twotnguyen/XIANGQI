# ISSUE-022 — Màn chọn cấp độ và chơi với AI

- Trạng thái: TODO
- Yêu cầu: R12, R13, R15
- Phụ thuộc bắt buộc: [ISSUE-015](ISSUE-015-online-ui.md), [ISSUE-021](ISSUE-021-ai-worker-server.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

Người dùng chọn side/level/time, chơi/undo/đầu hàng với AI và thấy trạng thái worker rõ.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [01-PRODUCT.md](../specs/01-PRODUCT.md)
- [07-UI-AND-TESTS.md](../specs/07-UI-AND-TESTS.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `apps/web/src/features/ai/NewAiMatch.tsx`
- `apps/web/src/features/ai/AiMatchPage.tsx`
- `apps/web/src/features/match/Controls.tsx`
- `tests/e2e/ai-match.spec.ts`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Board/clock/reconnect UI reuse 015; AI routes/server21.

**Cung cấp:** /ai/new,/matches/:id mode AI, queued/thinking/error states, no spectator/media/friend room controls.

## Nguồn trạng thái UI

Đọc snapshot.aiState và event ai:status theo jobVersion; không suy THINKING từ việc đến lượt máy. Dùng match:subscribe và POST /control/takeover cho AI không có room. Presence countdown từ snapshot; queued không coi là máy đang search. Default form MEDIUM/RED/không giới hạn là quyết định cố định của thiết kế.

## Các bước thực hiện

- [ ] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [ ] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [ ] **Bước 1.** Form3 levels/time selections default EASY? Chốt UI default MEDIUM, RED, unlimited; server receives explicit values.

- [ ] **Bước 2.** Reuse board/clock controller; queued khác thinking, disable move sai turn nhưng giữ resign/undo theo điều kiện.

- [ ] **Bước 3.** Undo trước own last turn, cả đang thinking; không thêm xin hòa button AI.

- [ ] **Bước 4.** Handle AI_BUSY trước creation, runtime fault INTERRUPTED, replay/history links và play again khi 027.

- [ ] **Bước 5.** Responsive screenshots và người chọn BLACK không bị board đen đi trước sai luật.

- [ ] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [ ] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-022.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| BLACK human | chọn đen | AI RED đi đầu |
| Undo AI | human move + response | về trước human move, clock không tăng |
| Fault | worker unavailable | thông báo gián đoạn, không ghi thua người |
| No own move | human BLACK trước move đầu | undo disabled |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/integration.ts`, không phải API sản phẩm mới.

```ts
await page.goto('/ai/new');
await page.getByLabel('Bên chơi').selectOption('BLACK');
await page.getByRole('button',{name:'Bắt đầu'}).click();
await expect(page.getByTestId('ai-status')).toContainText(/Đang chờ|Đang suy nghĩ/);
```

## Lệnh kiểm chứng

Bắt buộc đối chiếu hàng **ISSUE-022** trong [ma trận test và harness](../specs/08-TEST-EXECUTION.md); ghi từng case `T022-xx` vào báo cáo theo [mẫu evidence](../handoff/EVIDENCE-TEMPLATE.md), ngoài acceptance riêng bên trên.

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:e2e -- tests/e2e/ai-match.spec.ts
```

Kỳ vọng: exit 0 và toàn bộ tình huống trong bảng có bằng chứng. Sau code TypeScript chạy thêm `pnpm typecheck` và `pnpm lint`; sau thay đổi bundling/runtime chạy `pnpm build`. Lệnh là mục tiêu sẽ có từ ISSUE-001, chưa phải đã chạy ở giai đoạn lập kế hoạch. Nếu local gate đã qua và chỉ thiếu provider smoke, ghi LOCAL_DONE kèm external pending; nếu thiếu service chặn chính local acceptance thì BLOCKED_EXTERNAL. Không thay actual provider PASS bằng mock. Xem định nghĩa trạng thái trong START-HERE.

## Điều kiện hoàn thành

- [ ] Đầu ra đúng hợp đồng, không để implementation placeholder hoặc handler trả success giả.
- [ ] Mọi dòng trong bảng nghiệm thu được kiểm chứng, gồm đường thất bại và quyền truy cập liên quan.
- [ ] Dependency consumers vẫn tương thích; nếu đổi contract cập nhật spec và test consumer trong cùng thay đổi.
- [ ] Evidence có command, exit code, môi trường, số test, artifact; phân biệt automated/mock/manual/external.
- [ ] Issue và PROGRESS cập nhật cùng trạng thái; phần chưa xong có bước tiếp theo cụ thể.

## Bàn giao cho issue sau

Ghi API/file thực tế đã tạo, khác biệt có lý do so với đường dẫn dự kiến, test đã chạy và limitation còn tồn tại trong evidence. Không yêu cầu người thực hiện sau đọc lịch sử chat để hiểu kết quả.
