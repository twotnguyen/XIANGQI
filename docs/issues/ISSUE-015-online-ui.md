# ISSUE-015 — Màn chơi online và trạng thái kết nối

- Trạng thái: TODO
- Yêu cầu: R05, R06, R08, R09, R13, R15
- Phụ thuộc bắt buộc: [ISSUE-005](ISSUE-005-board-ui.md), [ISSUE-014](ISSUE-014-draw-undo-resign.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

Hai browser chơi hết ván với clock, controls, lỗi/resync và kết quả đúng.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [07-UI-AND-TESTS.md](../specs/07-UI-AND-TESTS.md)
- [04-CONTRACTS.md](../specs/04-CONTRACTS.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `apps/web/src/features/match/MatchPage.tsx`
- `apps/web/src/features/match/useMatch.ts`
- `apps/web/src/features/match/Clock.tsx`
- `apps/web/src/features/match/Controls.tsx`
- `apps/web/src/lib/socket.ts`
- `tests/e2e/online-match.spec.ts`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Board controlled 005, snapshot/events/HTTP/socket commands 012–014.

**Cung cấp:** MatchPage role-aware, command ID retry handler, clock UI, proposal dialog, takeover UX.

## Consumer CommandResult

HTTP/socket mutation trả data.snapshot và data.appliedVersion; useMatch áp snapshot theo board version và time sample serverNowMs riêng. Không dùng receipt cũ làm clock reset. Presence badges đọc snapshot.presence và presence:changed; subscribe room/match theo context.

## Các bước thực hiện

- [ ] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [ ] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [ ] **Bước 1.** Render board orientation theo own side, viewer orientation RED mặc định; hints current side only nếu interactive.

- [ ] **Bước 2.** Pending move không cập nhật state authoritative trước ack; retry giữ ID, version gap/401/409 sync hoặc login.

- [ ] **Bước 3.** Clock derives monotonic elapsed from serverNow, không tự set winner; disconnect badge/deadline.

- [ ] **Bước 4.** Dialogs resign/draw/undo/takeover, disable không hợp lệ; terminal modal và link history khi 027 xong.

- [ ] **Bước 5.** E2E two contexts network offline/refresh/stale commands; screenshots mobile basic.

- [ ] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [ ] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-015.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| 2 người | A pawn move | B nhận board/turn đồng nhất |
| Refresh | B reload sau move | không reset initial |
| Pending offline | A click mất ack | retry không double move |
| Observer tab | click board | control required UI, no mutation |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/integration.ts`, không phải API sản phẩm mới.

```ts
await playRedPawn(pageA,0);
await expect(pageB.getByTestId('match-turn')).toHaveText('Lượt Đen');
await pageB.reload();
await expect(pageB.getByTestId('piece-0-5')).toBeVisible();
```

## Lệnh kiểm chứng

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:e2e -- tests/e2e/online-match.spec.ts
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
