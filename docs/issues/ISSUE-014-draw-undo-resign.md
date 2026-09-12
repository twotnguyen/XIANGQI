# ISSUE-014 — Đầu hàng, xin hòa và đi lại online

- Trạng thái: TODO
- Yêu cầu: R13
- Phụ thuộc bắt buộc: [ISSUE-013](ISSUE-013-clocks-reconnect.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

Các thao tác ván atomic, undo không hoàn thời gian hoặc làm giảm version.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [01-PRODUCT.md](../specs/01-PRODUCT.md)
- [03-STATE-MACHINES.md](../specs/03-STATE-MACHINES.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `apps/server/src/modules/matches/proposals.ts`
- `apps/server/src/modules/matches/undo.ts`
- `apps/server/src/modules/matches/routes.ts`
- `tests/integration/match-controls.test.ts`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Immutable events/move ancestry, clock settle, proposal type.

**Cung cấp:** Resign/propose/respond commands; rebuildActiveBranch() nội bộ trả position/counts/activeMoveIds.

## Proposal scheduler và hạn gửi

Issue này sở hữu timer proposal expiry30s: lock room→match, nếu pending đúng id/version thì expire, tăng version, broadcast sau commit. Giới hạn gửi một proposal/10s/người bằng timestamp persisted hoặc limiter server; apply cho cả DRAW/UNDO để không lách bằng đổi loại. Từ chối clear proposal+tăng version, không hoàn thời gian. Undo lấy turn của reconstructed position, không toggle thêm.

## Các bước thực hiện

- [ ] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [ ] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [ ] **Bước 1.** Resign ACTIVE/controller, record outcome winner opponent and release active_players.

- [ ] **Bước 2.** Proposal DRAW/UNDO one pending, 30s TTL, requester cannot approve; new move invalidates pending.

- [ ] **Bước 3.** Undo target trước own last move: lùi1 hoặc2 ply, counts rebuild theo prefix, audit removed IDs.

- [ ] **Bước 4.** Settle clock trước undo, preserve remaining sides, version++, running side restored; never resurrect ended match.

- [ ] **Bước 5.** Test simultaneous approve/move/timeout; response retries receipt consistent.

- [ ] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [ ] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-014.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| Self approve | A approve own draw | FORBIDDEN |
| Undo sau response | A move B move A xin/B accept | ply về0, version tăng, times không tăng |
| Pending move | đối thủ đi trước accept | proposal expired |
| Timeout trước approve | đồng hồ hết | result giữ TIMEOUT |

| Undo1ply | A vừa đi B chưa đi, B accept | về trước A move, lượt A |
| Proposal reject | B từ chối A | proposal clear, board giữ |
| Proposal expired | fake clock+30000 không nước mới | version tăng, proposal clear và broadcast |
| Rate limit | A đề nghị lần2 trong10s | RATE_LIMITED |
| Repetition sau undo | nhánh cũ có counts2 rồi bỏ move | chỉ counts nhánh hiệu lực, không hòa sớm |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/integration.ts`, không phải API sản phẩm mới.

```ts
const before = await snapshotAfterTwoMoves();
const after = await requestAndAcceptUndo('A','B');
expect(after.ply).toBe(0);
expect(after.version).toBeGreaterThan(before.version);
expect(after.clock.redMs).toBeLessThanOrEqual(before.clock.redMs);
```

## Lệnh kiểm chứng

Bắt buộc đối chiếu hàng **ISSUE-014** trong [ma trận test và harness](../specs/08-TEST-EXECUTION.md); ghi từng case `T014-xx` vào báo cáo theo [mẫu evidence](../handoff/EVIDENCE-TEMPLATE.md), ngoài acceptance riêng bên trên.

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:integration -- tests/integration/match-controls.test.ts
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
