# ISSUE-013 — Đồng hồ, mất mạng và restart

- Trạng thái: TODO
- Yêu cầu: R08, R09
- Phụ thuộc bắt buộc: [ISSUE-012](ISSUE-012-authoritative-match.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

Clock authoritative và grace 60s có kết quả xác định, không xử thua do server restart.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [03-STATE-MACHINES.md](../specs/03-STATE-MACHINES.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `apps/server/src/modules/matches/clock.ts`
- `apps/server/src/modules/matches/deadlines.ts`
- `apps/server/src/realtime/presence.ts`
- `apps/server/src/main.ts`
- `tests/integration/clocks-reconnect.test.ts`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Match transaction/version; injected now fixture và server boot ID.

**Cung cấp:** settleClock(), deadline scheduler persisted state, presence-disconnect handling, boot recovery→INTERRUPTED.

## Clock DTO và presence

Snapshot trả số dư được chiếu tới serverNowMs và runningSinceEpochMs mới, không sửa clock DB chỉ vì read. Client cùng version vẫn cập nhật sample thời gian mới. Presence lấy từ client_controls, không phụ thuộc có roomId; timer finalization dùng finalizer012 và room→match lock.

## Các bước thực hiện

- [ ] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [ ] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [ ] **Bước 1.** Clock remaining/runningSince semantics spec; on move settle first, exact expiry reject and finalize once.

- [ ] **Bước 2.** Scheduler xét deadline timestamp sớm hơn giữa clock và disconnect; tie TIMEOUT; callbacks cùng lock.

- [ ] **Bước 3.** Disconnect detection/lease, 60s grace, cả hai offline before deadline INTERRUPTED; kể cả no-limit.

- [ ] **Bước 4.** Boot đánh dấu ACTIVE boot cũ INTERRUPTED trước phục vụ command; không dùng old timer quyết định winner.

- [ ] **Bước 5.** Fake clock tests race deadlines, server offline, reconnect snapshot; browser countdown integration ở 015.

- [ ] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [ ] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-013.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| Expiry exact | move tại deadline | TIMEOUT, không thêm move |
| Grace return | offline 59s reconnect | giữ match, đúng remaining |
| Cả hai offline | trước deadline | INTERRUPTED winner null |
| Server restart | ACTIVE persisted | SERVER_RESTART, không winner |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/integration.ts`, không phải API sản phẩm mới.

```ts
const match = await startTimedMatch(300);
testClock.advance(300_000);
await settleMatchDeadlines(match.id);
const s = await readMatch(match.id);
expect(s.outcome).toEqual({winner:'BLACK',reason:'TIMEOUT'});
```

## Lệnh kiểm chứng

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:integration -- tests/integration/clocks-reconnect.test.ts
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
