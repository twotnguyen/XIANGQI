# ISSUE-027 — Lịch sử, replay và tái đấu đổi bên

- Trạng thái: TODO
- Yêu cầu: R14, R13
- Phụ thuộc bắt buộc: [ISSUE-014](ISSUE-014-draw-undo-resign.md), [ISSUE-017](ISSUE-017-private-chat.md), [ISSUE-021](ISSUE-021-ai-worker-server.md), [ISSUE-022](ISSUE-022-ai-ui.md), [ISSUE-026](ISSUE-026-media-ui.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

Replay đúng nhánh đã undo, tái đấu tạo match mới và reset media/chat.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [01-PRODUCT.md](../specs/01-PRODUCT.md)
- [03-STATE-MACHINES.md](../specs/03-STATE-MACHINES.md)
- [04-CONTRACTS.md](../specs/04-CONTRACTS.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `apps/server/src/modules/history/service.ts`
- `apps/server/src/modules/history/routes.ts`
- `apps/server/src/modules/rooms/rematch.ts`
- `apps/web/src/features/history/`
- `tests/integration/history-rematch.test.ts`
- `tests/e2e/replay.spec.ts`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Move ancestry/audit logs, finish outcomes, active_players release, media OFF hooks.

**Cung cấp:** /history,/matches/:id/replay,/rooms/:id/rematch and AI play-again; participant-only history.

## Scheduler room sau ván

Issue này sở hữu room FINISHED→CLOSED sau10phút từ finished_at. Dùng room lock kiểm currentMatchId/status; tái đấu trước expiry reset finished_at và không bị timer cũ đóng. Close thu hồi invitations/memberships/chat socket/media, giữ lịch sử. AI play-again UI tiếp tục file của ISSUE-022, không chỉ API backend.

## Các bước thực hiện

- [ ] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [ ] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [ ] **Bước 1.** Query own matches paginate20; viewer chỉ replay current match khi còn membership, không xem private history.

- [ ] **Bước 2.** Build effective sequence từ activeMoveIds; next/prev/start/end controls, nhãn undoCount, không edit ended.

- [ ] **Bước 3.** Online rematch both accept trong10m FINISHED, transaction lock room, new match ID đổi sides/keep time, reset ready proposal state.

- [ ] **Bước 4.** New chat matchId, media OFF/delete old generations; keep valid viewers và policy room hiện tại.

- [ ] **Bước 5.** AI replay/new match giữ level/time, side chọn lại; closed room token old reject.

- [ ] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [ ] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-027.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| Undo replay | đã lùi2 rồi nhánh mới | chỉ effective moves |
| Rematch race | 2 accepts/retries | 1 new match, sides swapped |
| Media rematch | public trước đó | new OFF |
| History stranger | S6 fetch ended A/B | 403/404 |

| Auto close | fake clock10phút sau end | CLOSED, membership/invite revoked, history giữ |
| Rematch race close | accept before expiry rồi old timer | match mới không bị đóng |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/integration.ts`, không phải API sản phẩm mới.

```ts
const old = await finishOnlineMatch();
const next = await acceptRematchBoth();
expect(next.id).not.toBe(old.id);
expect(next.redUserId).toBe(old.blackUserId);
expect(next.version).toBe(0);
```

## Lệnh kiểm chứng

Bắt buộc đối chiếu hàng **ISSUE-027** trong [ma trận test và harness](../specs/08-TEST-EXECUTION.md); ghi từng case `T027-xx` vào báo cáo theo [mẫu evidence](../handoff/EVIDENCE-TEMPLATE.md), ngoài acceptance riêng bên trên.

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:integration -- tests/integration/history-rematch.test.ts
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
