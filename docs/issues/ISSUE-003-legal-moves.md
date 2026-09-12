# ISSUE-003 — Luật di chuyển và an toàn tướng

- Trạng thái: TODO
- Yêu cầu: R05
- Phụ thuộc bắt buộc: [ISSUE-002](ISSUE-002-contracts-position.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

Server và AI có chung bộ sinh nước hợp lệ, không cho tự chiếu hoặc hai tướng đối mặt.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [01-PRODUCT.md](../specs/01-PRODUCT.md)
- [04-CONTRACTS.md](../specs/04-CONTRACTS.md)
- [07-UI-AND-TESTS.md](../specs/07-UI-AND-TESTS.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `packages/game-rules/src/attacks.ts`
- `packages/game-rules/src/moves.ts`
- `packages/game-rules/src/index.ts`
- `tests/unit/moves.test.ts`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Position/Move/createInitialPosition từ ISSUE-002, fixture makePosition.

**Cung cấp:** getLegalMoves(), isInCheck(), validateMove(), applyMove() có signatures đúng contracts.

## Các bước thực hiện

- [ ] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [ ] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [ ] **Bước 1.** Viết table tests riêng từng quân, cản mã/mắt tượng/ngòi pháo/cung/sông; dùng đủ hai tướng trong fixture.

- [ ] **Bước 2.** Tách pseudo-legal movement và attack geometry. isInCheck không gọi getLegalMoves bên kia gây recursion.

- [ ] **Bước 3.** Với mỗi candidate, apply trên board copy rồi kiểm an toàn tướng; cấm capture tướng như move thường.

- [ ] **Bước 4.** applyMove thuần, thay turn, giữ piece id; illegal input lỗi rõ trong API nội bộ, server validate trước gọi.

- [ ] **Bước 5.** Kiểm symmetry đỏ/đen và lật UI không can thiệp logic; không dùng thư viện cờ hoặc engine để thay luật.

- [ ] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [ ] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-003.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| Tướng đối mặt | tốt chắn (4,5) sang (3,5) | INVALID_MOVE |
| Pháo ăn | 0/1/2 ngòi | chỉ 1 ngòi hợp lệ |
| Tốt đỏ qua sông | y<=4 đi ngang | được, đi lùi không được |
| Bàn đầu | RED pawn (0,6)→(0,5) | hợp lệ, turn BLACK, input giữ nguyên |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/positions.ts`, không phải API sản phẩm mới.

```ts
const p = createInitialPosition();
const move = { from: {x:0,y:6}, to: {x:0,y:5} };
expect(validateMove(p, move)).toEqual({valid:true});
expect(applyMove(p, move).turn).toBe('BLACK');
expect(p.board[6*9]).not.toBeNull();
```

## Lệnh kiểm chứng

Bắt buộc đối chiếu hàng **ISSUE-003** trong [ma trận test và harness](../specs/08-TEST-EXECUTION.md); ghi từng case `T003-xx` vào báo cáo theo [mẫu evidence](../handoff/EVIDENCE-TEMPLATE.md), ngoài acceptance riêng bên trên.

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:unit -- tests/unit/moves.test.ts
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
