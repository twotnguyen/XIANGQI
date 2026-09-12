# ISSUE-018 — AI: hàm đánh giá và thứ tự nước

- Trạng thái: TODO
- Yêu cầu: R12
- Phụ thuộc bắt buộc: [ISSUE-004](ISSUE-004-terminal-repetition.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

Hàm lượng giá có giải thích và kiểm thử, làm nền so thuật toán khi bảo vệ.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [01-PRODUCT.md](../specs/01-PRODUCT.md)
- [04-CONTRACTS.md](../specs/04-CONTRACTS.md)
- [07-UI-AND-TESTS.md](../specs/07-UI-AND-TESTS.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `packages/ai/src/evaluate.ts`
- `packages/ai/src/ordering.ts`
- `packages/ai/src/index.ts`
- `tests/unit/ai-evaluate.test.ts`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Position/legal generator, side-to-move scoring contract.

**Cung cấp:** evaluate(position):number, orderMoves(position,moves):Move[] stable; weights config source module.

## Các bước thực hiện

- [ ] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [ ] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [ ] **Bước 1.** Giá trị khởi đầu pawn100/advisor200/elephant200/horse400/cannon450/rook900; general xử terminal không cộng vật chất.

- [ ] **Bước 2.** Tính pawn advancement/crossed river, center/mobility và king safety bằng các term riêng dễ giải thích; mỗi weight xuất module để báo cáo.

- [ ] **Bước 3.** Eval antisymmetry khi đảo side/hướng đúng; terminal không ở heuristic mà search xử trước.

- [ ] **Bước 4.** Ordering captures ưu tiên capturedValue-mover nhỏ và checking nếu đo chi phí hợp lý; tie canonical square order, không random mặc định.

- [ ] **Bước 5.** Tạo test thế ăn xe tốt hơn ăn tốt, mirror symmetry, không mutate input; không tự viết neural network.

- [ ] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [ ] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-018.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| Vật chất | thêm xe RED vào fixture hợp lệ | eval RED tăng |
| Mirror | đảo màu/hàng/lượt | score side-to-move tương đương |
| Order | cùng input nhiều lần | same move order, đủ move không duplicate |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/integration.ts`, không phải API sản phẩm mới.

```ts
const p = createInitialPosition();
const moves = getLegalMoves(p);
expect(orderMoves(p,moves)).toEqual(orderMoves(p,moves));
expect(orderMoves(p,moves)).toHaveLength(moves.length);
```

## Lệnh kiểm chứng

Bắt buộc đối chiếu hàng **ISSUE-018** trong [ma trận test và harness](../specs/08-TEST-EXECUTION.md); ghi từng case `T018-xx` vào báo cáo theo [mẫu evidence](../handoff/EVIDENCE-TEMPLATE.md), ngoài acceptance riêng bên trên.

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:unit -- tests/unit/ai-evaluate.test.ts
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
