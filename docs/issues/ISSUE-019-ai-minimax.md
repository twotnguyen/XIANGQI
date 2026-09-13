# ISSUE-019 — AI: minimax baseline đúng luật và lặp

- Trạng thái: DONE
- Evidence: [docs/test-reports/ISSUE-019.md](../test-reports/ISSUE-019.md)
- Yêu cầu: R12, R07
- Phụ thuộc bắt buộc: [ISSUE-018](ISSUE-018-ai-evaluation.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

Baseline minimax/negamax đo nodes và chọn nước hợp lệ, xét hòa theo lịch sử.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [04-CONTRACTS.md](../specs/04-CONTRACTS.md)
- [07-UI-AND-TESTS.md](../specs/07-UI-AND-TESTS.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `packages/ai/src/minimax.ts`
- `packages/ai/src/search.ts`
- `tests/unit/ai-minimax.test.ts`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** evaluate/orderMoves và legal/terminal; SearchInput/SearchResult.

**Cung cấp:** searchBestMove algorithm MINIMAX depth-limited với diagnostics và injected cancellation clock.

## Các bước thực hiện

- [x] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [x] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [x] **Bước 1.** Search terminal trước heuristic, side-to-move negation, mate distance theo ply; initial root no legal trả move null.

- [x] **Bước 2.** Repetition path counts push/pop try/finally; clone hoặc make/unmake có test input nguyên vẹn.

- [x] **Bước 3.** Injected now/isCancelled, có fallback legal ở root trước deep search; deterministic seed contract chưa cần random.

- [x] **Bước 4.** PV/nodes/completedDepth/elapsed ghi chuẩn để 020 so sánh; depth cap nhỏ kiểm bằng exhaustive fixtures.

- [x] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [x] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-019.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| Mate-in-one | fixture giải tay | chọn nước mate thuộc expected set |
| Avoid self-check | vị trí pinned | move luôn validate valid |
| Lặp thứ3 | history count2 + trở lại | score draw0 ở node |
| Root terminal | không legal | move null, không crash |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/integration.ts`, không phải API sản phẩm mới.

```ts
const p = createInitialPosition();
const r = searchBestMove({position:p,repetitionCounts:{[positionKey(p)]:1},maxDepth:1,deadlineMonoMs:1000,algorithm:'MINIMAX',seed:1},()=>0,()=>false);
expect(r.move).not.toBeNull();
expect(validateMove(p,r.move!)).toEqual({valid:true});
```

## Lệnh kiểm chứng

Bắt buộc đối chiếu hàng **ISSUE-019** trong [ma trận test và harness](../specs/08-TEST-EXECUTION.md); ghi từng case `T019-xx` vào báo cáo theo [mẫu evidence](../handoff/EVIDENCE-TEMPLATE.md), ngoài acceptance riêng bên trên.

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:unit -- tests/unit/ai-minimax.test.ts
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
