# ISSUE-002 — Contracts, tọa độ và vị trí khởi đầu

- Trạng thái: TODO
- Yêu cầu: R05, R06
- Phụ thuộc bắt buộc: [ISSUE-001](ISSUE-001-foundation.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

Khóa tên kiểu dùng chung, tạo đúng 32 quân và khóa vị trí chuẩn cho luật lặp.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [04-CONTRACTS.md](../specs/04-CONTRACTS.md)
- [07-UI-AND-TESTS.md](../specs/07-UI-AND-TESTS.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `packages/contracts/src/game.ts`
- `packages/contracts/src/api.ts`
- `packages/contracts/src/room.ts`
- `packages/contracts/src/media.ts`
- `packages/contracts/src/ai.ts`
- `packages/contracts/src/index.ts`
- `packages/game-rules/src/initial.ts`
- `packages/game-rules/src/position-key.ts`
- `packages/game-rules/src/index.ts`
- `tests/fixtures/positions.ts`
- `tests/unit/initial.test.ts`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Kiểu và schema ở contracts; board index y*9+x. Fixture không tự thêm tướng.

**Cung cấp:** createInitialPosition(), positionKey(), Zod schemas và makePosition(pieces,turn) theo spec; immutable inputs.

## Các bước thực hiện

- [ ] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [ ] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [ ] **Bước 1.** Tạo types/schema 04, UUID và enum, reject ngoài bàn/số thực/unknown mutation fields; export không có vòng import.

- [ ] **Bước 2.** Tạo bàn 90 phần tử, đỏ dưới/đen trên, quân đúng hàng pháo/tốt, ID ổn định.

- [ ] **Bước 3.** Khóa vị trí chỉ encode type+side+square+turn; loại ID, thời gian, ply khỏi key.

- [ ] **Bước 4.** Tạo fixture helper có kiểm tra trùng ô và bảng test màu/hướng; unit khởi đầu không phụ thuộc DB.

- [ ] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [ ] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-002.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| Bàn ban đầu | createInitialPosition | 90 ô, 32 quân, 16/side, RED turn |
| ID quân thay | clone board đổi IDs | key không đổi |
| Lượt thay | giữ board, BLACK turn | key khác |
| Tọa độ lỗi | x=9,y=-1,x=1.5 | schema reject |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/positions.ts`, không phải API sản phẩm mới.

```ts
const p = createInitialPosition();
expect(p.board).toHaveLength(90);
expect(p.board.filter(Boolean)).toHaveLength(32);
expect(p.turn).toBe('RED');
expect(positionKey({ ...p, turn: 'BLACK' })).not.toBe(positionKey(p));
```

## Lệnh kiểm chứng

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:unit -- tests/unit/initial.test.ts
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
