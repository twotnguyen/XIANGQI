# ISSUE-023 — Thí nghiệm AI và số liệu bảo vệ

- Trạng thái: TODO
- Yêu cầu: R12, R16
- Phụ thuộc bắt buộc: [ISSUE-020](ISSUE-020-ai-alpha-beta.md), [ISSUE-021](ISSUE-021-ai-worker-server.md), [ISSUE-022](ISSUE-022-ai-ui.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

Có corpus kiểm chứng độc lập, so baseline/cải tiến và dữ liệu cấp độ có thể tái lập.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [07-UI-AND-TESTS.md](../specs/07-UI-AND-TESTS.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `tests/fixtures/ai-corpus.json`
- `tests/ai/benchmark.ts`
- `tests/ai/tournament.ts`
- `docs/test-reports/ai/`
- `docs/handoff/AI-EXPLANATION.md`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Các thuật toán cùng SearchInput/result; thời gian/best move kỳ vọng từ spec tests.

**Cung cấp:** pnpm test:ai export JSON/CSV report, bảng nodes/time/score, giải thích minimax/alpha-beta/evaluation/limitations.

## Gate định lượng

Benchmark tối thiểu5 repeats/position/level trên cùng hardware đã ghi, một search tại một thời điểm. p95 elapsed search <= budget + max(50ms,10% budget); thời gian IPC/network báo riêng. Fake clock tests vẫn phải chặn đúng deadline/cancel logic. Node count tăng1 mỗi vị trí thực sự được vào search (kể root và terminal), không tính heuristic phụ lại là node. Ván cap200ply trong tournament ghi ADJUDICATED_DRAW, mỗi bên0.5 điểm; game crash/illegal move là lỗi thí nghiệm không chấm thua để che bug, run fail. Mỗi pair20ván = tổng60ván; lưu seeds/openings/results/config. Gate cấp cao>50% điểm được tính cả draw cap, báo số draw cap để biết hạn chế.

## Các bước thực hiện

- [ ] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [ ] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [ ] **Bước 1.** Tạo20 positions có đáp án/constraint giải tay và expected acceptable moves; không tự lấy AI output làm đáp án.

- [ ] **Bước 2.** So cùng fixed depth baseline với alpha-beta để tách tác dụng pruning khỏi time budget.

- [ ] **Bước 3.** Đo budget thực hardware ghi CPU/RAM/runtime, repeats và p50/p95, deadline overshoot; tune caps/weights nếu cần trong budget.

- [ ] **Bước 4.** Đấu20 ván mỗi pair từ10 openings đảo màu, seed cố định, giới hạn200 ply chỉ ở harness; báo adjudication riêng.

- [ ] **Bước 5.** Gate cấp cao >50% điểm trên pair corpus và tactical score không giảm; nếu fail tune+retest, báo không suy Elo.

- [ ] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [ ] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-023.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| Reproduce | same seed/depth | same score/move set |
| Pruning | fixed depth corpus | equivalent scores, total nodes giảm |
| Budgets | wall time | report gồm overhead, không fake số |
| Levels | pair tournament | gate >50% hoặc issue còn IN_PROGRESS |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/integration.ts`, không phải API sản phẩm mới.

```ts
for (const c of corpus) {
  const a = runFixedDepth(c,'MINIMAX');
  const b = runFixedDepth(c,'ALPHA_BETA');
  expect(b.score).toBe(a.score);
  expect(b.nodes).toBeLessThanOrEqual(a.nodes);
}
```

## Lệnh kiểm chứng

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:ai
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
