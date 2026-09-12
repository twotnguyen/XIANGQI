# ISSUE-005 — Bàn gỗ và quân Hán thao tác được

- Trạng thái: TODO
- Yêu cầu: R05, R15
- Phụ thuộc bắt buộc: [ISSUE-003](ISSUE-003-legal-moves.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

Board component controlled render đúng tọa độ và phát ý định đi bằng chuột/cảm ứng/phím.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [07-UI-AND-TESTS.md](../specs/07-UI-AND-TESTS.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `apps/web/src/components/board/Board.tsx`
- `apps/web/src/components/board/Piece.tsx`
- `apps/web/src/components/board/coordinates.ts`
- `apps/web/src/components/board/board.module.css`
- `apps/web/src/styles/tokens.css`
- `tests/e2e/board.spec.ts`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Position/Move và legal move hints; UI tokens, glyph mapping trong spec.

**Cung cấp:** Board props {position,orientation:Side,interactive:boolean,legalMoves:Move[],onMove:(move:Move)=>void}; không gọi API hoặc mutate state bên trong Board.

## Các bước thực hiện

- [ ] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [ ] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [ ] **Bước 1.** Vẽ SVG 9x10 giao điểm, cung và sông, quân Hán; gỗ bằng CSS/SVG local không phụ thuộc ảnh ngoài.

- [ ] **Bước 2.** Implement view↔canonical coordinate mapping và unit tests roundtrip ở cả orientation.

- [ ] **Bước 3.** Click/tap quân rồi đích, clear selection/Escape; focus keyboard arrows/Enter, aria labels tên quân Việt.

- [ ] **Bước 4.** Tách highlight chọn/nước cuối/chiếu; interactive=false không emit move. Tạo dev fixture route chỉ ở test/dev.

- [ ] **Bước 5.** Kiểm 360x800 và desktop screenshot; không để control che giao điểm.

- [ ] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [ ] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-005.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| Lật bàn | BLACK orientation chọn tốt đen | emit canonical coordinates không đảo server |
| Viewer | interactive=false click đích | không gọi onMove |
| Mobile | 360px viewport | không scroll ngang, quân trên giao điểm |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/positions.ts`, không phải API sản phẩm mới.

```ts
await page.goto('/dev/board');
await expect(page.getByRole('button', {name:/Tốt đỏ, cột 1 hàng 7/})).toBeVisible();
await page.getByRole('button', {name:/Tốt đỏ, cột 1 hàng 7/}).click();
await expect(page.getByTestId('legal-target-0-5')).toBeVisible();
```

## Lệnh kiểm chứng

Bắt buộc đối chiếu hàng **ISSUE-005** trong [ma trận test và harness](../specs/08-TEST-EXECUTION.md); ghi từng case `T005-xx` vào báo cáo theo [mẫu evidence](../handoff/EVIDENCE-TEMPLATE.md), ngoài acceptance riêng bên trên.

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:e2e -- tests/e2e/board.spec.ts
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
