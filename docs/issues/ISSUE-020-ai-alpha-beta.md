# ISSUE-020 — AI: alpha-beta, iterative deepening và cấp độ

- Trạng thái: TODO
- Yêu cầu: R12
- Phụ thuộc bắt buộc: [ISSUE-019](ISSUE-019-ai-minimax.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

Cải tiến tìm kiếm trong ngân sách 300/1000/3000ms mà vẫn có nước hợp lệ khi bị ngắt.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [04-CONTRACTS.md](../specs/04-CONTRACTS.md)
- [07-UI-AND-TESTS.md](../specs/07-UI-AND-TESTS.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `packages/ai/src/search.ts`
- `packages/ai/src/levels.ts`
- `tests/unit/ai-search.test.ts`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Baseline minimax/output contract; level caps2/4/6 từ product.

**Cung cấp:** ALPHA_BETA search, iterative deepening PV ordering, level configs, deterministic benchmark hooks.

## Các bước thực hiện

- [ ] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [ ] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [ ] **Bước 1.** Alpha-beta đúng negamax bounds; giữ minimax baseline selectable, không xóa để báo cáo.

- [ ] **Bước 2.** Iterate depth1..cap; chỉ commit PV/score từ iteration hoàn tất, fallback root move nếu hết ngay.

- [ ] **Bước 3.** Check cancel/deadline mỗi64 nodes tối đa và ở root; no asynchronous timer-only cancellation vì CPU loop chặn thread.

- [ ] **Bước 4.** Không thêm transposition table path-unsafe với repetition; nếu optimization mới phải test equivalence riêng.

- [ ] **Bước 5.** Unit compare cùng depth/eval/ordering, tie acceptable best-move set, nodes alpha-beta không hơn baseline.

- [ ] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [ ] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-020.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| Equivalence | cùng depth2 seed/position | score bằng minimax |
| Deadline | fake clock vượt giữa depth | return completed iteration/fallback |
| Cancel | flag true | return nhanh, input counts nguyên vẹn |
| Level | EASY/MEDIUM/HARD | budget300/1000/3000 |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/integration.ts`, không phải API sản phẩm mới.

```ts
const base = searchBestMove({...input,algorithm:'MINIMAX'},()=>0,()=>false);
const fast = searchBestMove({...input,algorithm:'ALPHA_BETA'},()=>0,()=>false);
expect(fast.score).toBe(base.score);
expect(fast.nodes).toBeLessThanOrEqual(base.nodes);
```

## Lệnh kiểm chứng

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:unit -- tests/unit/ai-search.test.ts
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
