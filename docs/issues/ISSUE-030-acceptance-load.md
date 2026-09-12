# ISSUE-030 — Nghiệm thu xuyên suốt, lỗi mạng và thử tải

- Trạng thái: TODO
- Yêu cầu: R01, R02, R03, R04, R05, R06, R07, R08, R09, R10, R11, R12, R13, R14, R15, R16
- Phụ thuộc bắt buộc: [ISSUE-023](ISSUE-023-ai-experiments.md), [ISSUE-028](ISSUE-028-responsive-polish.md), [ISSUE-029](ISSUE-029-security-hardening.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

Có bằng chứng toàn bộ sản phẩm local hoạt động cùng nhau, tải mục tiêu và các failure paths.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [07-UI-AND-TESTS.md](../specs/07-UI-AND-TESTS.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `tests/e2e/full-demo.spec.ts`
- `tests/load/socket-load.ts`
- `tests/integration/faults.test.ts`
- `docs/test-reports/acceptance.md`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Tất cả feature local; Google/media external credentials nếu có, pending gate phải nêu rõ.

**Cung cấp:** Full regression,10 rooms70 clients+2 AI report, media7 peers riêng, trace/screens/video test UI (không ghi media cuộc gọi thật).

## Lệnh acceptance đầy đủ

Chạy tất cả lane dưới đây, không chỉ E2E một kịch bản. Media spike dùng SFU local thật; E2E media dùng synthetic tracks đo subscription; manual hardware/provider theo external gate. Mỗi báo cáo ghi cùng commit hoặc xác nhận diff không chạm lane đã có evidence.

## Các bước thực hiện

- [ ] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [ ] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [ ] **Bước 1.** E2E8 contexts gồm2players5viewers+rejected6th; tạo/mời/ready/move/chat/media/undo/end/replay/rematch.

- [ ] **Bước 2.** Fault injection lost ack, duplicate command, DB failure rollback, restart after commit, both offline, token expiry.

- [ ] **Bước 3.** Load client Socket.IO đúng giao thức, request latency CPU/RAM/event-loop metrics; no raw WebSocket giả protocol.

- [ ] **Bước 4.** Chạy media2players5viewers riêng và measured tracks, không coi70 clients nghĩa70 camera.

- [ ] **Bước 5.** Chỉ PASS khi các R covered; failures sửa issue tương ứng rồi rerun suite liên quan và regression, không giảm thresholds lặng lẽ.

- [ ] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [ ] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-030.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| Load | 10rooms70clients+2AI | p95server<100ms,RTT controlled roundtrip<500ms |
| Resync | network restore | <5s snapshot same |
| Duplicate | retry many | no duplicate commit |
| Media7 | source matrix | no unauthorized tracks |

| Persisted repetition/resync | chuỗi thực qua HTTP/socket rồi reconnect | counts/outcome thống nhất |
| Undo branch recovery | undo rồi snapshot/replay/repetition | không dùng nhánh bị bỏ |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/integration.ts`, không phải API sản phẩm mới.

```ts
await runFullLocalScenario();
expect(await spectatorCount(room.id)).toBe(5);
expect(await snapshotsAgree(['A','B','S1','S2','S3','S4','S5'])).toBe(true);
```

## Lệnh kiểm chứng

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm test:ai
pnpm test:load
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
