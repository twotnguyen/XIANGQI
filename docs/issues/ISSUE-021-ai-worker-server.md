# ISSUE-021 — AI worker và ván người–máy authoritative

- Trạng thái: TODO
- Yêu cầu: R12, R08, R09, R13
- Phụ thuộc bắt buộc: [ISSUE-013](ISSUE-013-clocks-reconnect.md), [ISSUE-014](ISSUE-014-draw-undo-resign.md), [ISSUE-020](ISSUE-020-ai-alpha-beta.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

AI tính ngoài event loop, trả move qua cùng transaction; undo/end loại kết quả cũ.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [02-ARCHITECTURE.md](../specs/02-ARCHITECTURE.md)
- [03-STATE-MACHINES.md](../specs/03-STATE-MACHINES.md)
- [04-CONTRACTS.md](../specs/04-CONTRACTS.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `apps/ai-worker/src/main.ts`
- `apps/ai-worker/src/supervisor.ts`
- `apps/ai-worker/src/search-worker.ts`
- `apps/ai-worker/src/protocol.ts`
- `apps/server/src/modules/ai/service.ts`
- `apps/server/src/modules/ai/routes.ts`
- `tests/integration/ai-match.test.ts`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Match pipeline/clock, searchBestMove, SearchResult; no media room for AI.

**Cung cấp:** POST /ai/matches, undo-ai; bounded process/worker pool2 queue8, IPC messages tagged jobId/matchId/version.

## AI subscription, control và job status

Dùng client_controls và POST /control/takeover cho human AI; match:subscribe kiểm participant mà không yêu cầu room membership. Persist ai_jobs/jobVersion, emit ai:status QUEUED/THINKING/IDLE/FAILED, snapshot có aiState để refresh khôi phục UI. Grace human offline lưu client_controls.disconnected_at; 60s→INTERRUPTED nếu không có clock deadline trước. Mọi finalization dùng finalizeMatch012, undo dùng rebuildActiveBranch014. Create AI từ chối khi user còn room membership hoặc active_players record; kết thúc AI giải phóng active_players để tạo phòng online. Giữ capacity reservation theo job token trong supervisor trước commit create; nếu DB rollback thì trả reservation, nếu process crash boot finalizer xử lý. Job chỉ dispatch sau commit.

## Các bước thực hiện

- [ ] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [ ] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [ ] **Bước 1.** Child supervisor owns2 worker threads; typed IPC request/result/error/cancel, shared cancel flag để worker đang CPU đọc được.

- [ ] **Bước 2.** Create AI match one active player, side/time/level; AI RED queue first, clock runs through queue.

- [ ] **Bước 3.** Budget min(level budget,remainingMs-50), floor0 fallback; parent translate wall deadline to worker monotonic duration, không so hai monotonic origins.

- [ ] **Bước 4.** On result lock match check version/status/current AI side, validate move, apply receipt with actor AI; stale discard.

- [ ] **Bước 5.** Undo human turn prefix rebuild, cancel job; crash one retry bounded, final INTERRUPTED AI_UNAVAILABLE; shutdown kill children gracefully.

- [ ] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [ ] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-021.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| Human BLACK | create AI RED | máy đi đầu |
| Stale result | undo khi worker đang chạy | không áp nước cũ |
| Load | 2 running+8 queued | next new request AI_BUSY |
| Worker crash | second fail | INTERRUPTED không human loss |

| AI human offline | 60s no clock expiry | INTERRUPTED, không xử người thua vì AI online |
| Clock còn<=50ms | enqueue/find fallback | không budget âm; đến hạn TIMEOUT theo server |
| Capacity/DB race | queue slot reserved rồi transaction fail | trả slot, không orphan job |
| History vào search | position có repetition count2 | worker input đúng counts và path draws |
| AI refresh/takeover | roomId null | subscribe/lease mới hợp lệ, lease cũ bị từ chối |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/integration.ts`, không phải API sản phẩm mới.

```ts
const job = await startBlockedAiJob();
await undoAiAsHuman(job.matchId);
await deliverWorkerResult(job);
expect((await readMatch(job.matchId)).version).toBeGreaterThan(job.expectedVersion);
expect(await wasJobApplied(job.id)).toBe(false);
```

## Lệnh kiểm chứng

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:integration -- tests/integration/ai-match.test.ts
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
