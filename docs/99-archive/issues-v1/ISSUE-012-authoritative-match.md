# ISSUE-012 — Ván online, transaction nước đi và resync

- Trạng thái: DONE
- Evidence: [docs/test-reports/ISSUE-012.md](../test-reports/ISSUE-012.md)
- Yêu cầu: R06, R07
- Phụ thuộc bắt buộc: [ISSUE-004](ISSUE-004-terminal-repetition.md), [ISSUE-010](ISSUE-010-rooms-lobby.md), [ISSUE-011](ISSUE-011-invitations.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

Hai người đi đúng luật, server lưu nguyên tử và retry không lặp nước.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [09-DATABASE-DESIGN](../specs/09-DATABASE-DESIGN.md): schema/transactions và acceptance DB liên quan.

- [03-STATE-MACHINES.md](../specs/03-STATE-MACHINES.md)
- [04-CONTRACTS.md](../specs/04-CONTRACTS.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `apps/server/src/modules/matches/service.ts`
- `apps/server/src/modules/matches/repository.ts`
- `apps/server/src/modules/matches/routes.ts`
- `apps/server/src/realtime/gateway.ts`
- `apps/server/src/realtime/broadcast.ts`
- `tests/integration/match-moves.test.ts`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Luật 004; room prepareStart và contracts; time control tồn tại nhưng clock settling hoàn thiện ISSUE-013 trước nghiệm thu timed.

**Cung cấp:** MatchSnapshot, move HTTP/socket cùng submitMove service, ready creates match, receipt/events/moves, sync.

## Finalizer và receipt chuẩn

Sở hữu finalizeMatch(tx,match,outcome,nowMs,terminalEvent) theo state spec: online luôn room→match lock; kết quả đặt ended_at/outcome, clear proposal, release active_players, room FINISHED/finished_at và event cùng transaction. Move terminal chỉ tăng version một lần. Canonical hash gồm command type, expectedVersion và payload. Return ApiResult<CommandResult>, gồm appliedVersion gốc và snapshot hiện tại với clock projection mới. Snapshot retry không lấy serverNowMs cũ từ receipt. Cung cấp match:subscribe cho cả loại match; AI auth handler nối ở021.

## Các bước thực hiện

- [x] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [x] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [x] **Bước 1.** Both-ready transaction tạo ACTIVE match version0/initial key count1, active_players constraints và room PLAYING.

- [x] **Bước 2.** Implement pipeline 03: lock, receipt lookup+payload hash, version/turn/role, validate/apply, terminal, event/snapshot, commit rồi emit.

- [x] **Bước 3.** Socket auth/Origin kiểm trước subscribe, mỗi command kiểm session/member/controller; payload identity không tin.

- [x] **Bước 4.** Client sync contract snapshot by version, server periodic sync request support; drop/dup events fixture.

- [x] **Bước 5.** Rollback test DB failure: không ack/broadcast accepted. Không hold lock khi network emit.

- [x] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [x] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-012.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| Retry ack mất | cùng commandId payload/version | 1 move/event; trả receipt cũ |
| Reuse ID khác | đổi to với cùng ID | COMMAND_ID_REUSED |
| Race version | 2 commands version0 | chỉ một commit |
| Restart sau commit | broadcast thiếu | GET snapshot có nước đã lưu |

| Retry sau5s | mất ack rồi fake clock+5000 retry | appliedVersion không đổi, snapshot clock giảm5s cho bên đang chạy |
| Command type collision | cùng ID {} RESIGN và UNDO_AI | COMMAND_ID_REUSED |
| Repetition persisted | chuỗi legal quay về initial lần3 | hòa REPETITION; DB counts/key và outcome đúng |
| Terminal atomic | move mate rồi query room/active_players | room FINISHED, slot release, một version/event |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/integration.ts`, không phải API sản phẩm mới.

```ts
const c = makeMoveCommand({from:{x:0,y:6},to:{x:0,y:5}},0);
const first = await moveAs('A',c);
const retry = await moveAs('A',c);
expect(retry.data.appliedVersion).toBe(first.data.appliedVersion);
expect(await countMoves(first.data.snapshot.id)).toBe(1);
```

## Lệnh kiểm chứng

Bắt buộc đối chiếu hàng **ISSUE-012** trong [ma trận test và harness](../specs/08-TEST-EXECUTION.md); ghi từng case `T012-xx` vào báo cáo theo [mẫu evidence](../handoff/EVIDENCE-TEMPLATE.md), ngoài acceptance riêng bên trên.

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:integration -- tests/integration/match-moves.test.ts
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
