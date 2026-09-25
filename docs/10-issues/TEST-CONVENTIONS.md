# HỢP ĐỒNG KIỂM THỬ VÀ BẰNG CHỨNG

**Phạm vi:** mọi138 issue. Đây là quy ước cần được tạo ở các issue nền tảng, chưa phải công cụ đã tồn tại. Chi tiết mỗi test nằm ở issue sở hữu; không dùng tài liệu chung để bỏ ca cụ thể.

## 1. Lane, thời điểm tồn tại và lệnh

Chạy từ Git root. `-- đường-dẫn` phải được script chuyển tới runner đúng nghĩa; sai đường dẫn/không tìm thấy test phải exit khác0. Chỉ chạy lane được yêu cầu bởi scope hiện tại, nhưng mọi cổng đã có vẫn bắt buộc.

| Lane | Issue tạo | Mẫu lệnh chọn một file | Dịch vụ / bằng chứng |
|---|---|---|---|
| unit |003|`pnpm test:unit -- tests/unit/issue-017.test.ts`| Hàm thật/clock tiêm, không DB/network |
| integration |034 tối thiểu;044 harness|`pnpm test:integration -- tests/integration/issue-061.test.ts`| PostgreSQL/Auth local thật, app_server và hai kết nối khi race |
| e2e |004|`pnpm test:e2e -- tests/e2e/issue-067.spec.ts`| Browser thật, HTTP/socket thật; fixture tạo trạng thái không thay hành vi đang test |
| media |112|`pnpm test:media -- tests/media/issue-117.test.ts`| SFU/browser/media source thật; byte/frame, trace revoke và đối chứng |
| ai |032|`pnpm test:ai -- tests/ai/gate-depth.bench.ts`| Benchmark thật theo ai-validation; oracle thống kê vẫn có unit test |
| load |135|`pnpm test:load -- tests/load/issue-135.test.ts`| Client đồng thời, latency distribution, lỗi, tài nguyên, workload AI/media |

Tên trên là quy ước mặc định cho file mới; nếu issue đã chỉ định tên chuyên biệt (ví dụ `authz-matrix.test.ts`) thì dùng đúng tên trong issue. Không tạo thêm file trống chỉ để khớp ví dụ. E2e dùng Playwright runner và `.spec.ts`; unit/integration/media/load dùng Vitest và `.test.ts`, trừ contract cụ thể của runner được ghi tại issue tạo lane. Media112 dùng Vitest điều khiển browser thật qua Playwright API; không nhầm với Playwright Test runner của e2e.

**Cổng đầy đủ từ003:**

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
```

Sau đó chạy toàn lane liên quan (`pnpm test:integration`, `pnpm test:e2e`, `pnpm test:media`, `pnpm test:ai`, `pnpm test:load`) khi issue yêu cầu. Một file xanh không thay cho kiểm hồi quy của lane.001/002 dùng cổng bootstrap ở WORKFLOW. Trường hợp lệnh âm cố ý thất bại được ghi riêng EXPECTED_FAILURE; không đưa lỗi đó vào cột PASS ứng dụng.

## 2. ID, fixture và assert

Tên test giữ ID TNNN/TS đã có; thêm AC ID mà ca đó thực sự chứng minh. Ví dụ tên `[T061-01][AC-ROOM-01] tạo Host đỏ trong transaction`. Một test chứng minh nhiều AC được nếu từng điều kiện có assert; không gán cả module vào một test smoke. [AC-COVERAGE](AC-COVERAGE.md) phân công từng AC và owner nghiệm thu; đó là kế hoạch, chưa có coverage chạy.

Mỗi ca ghi: dữ liệu ban đầu cụ thể → hành động → response/state DB/sự kiện mong đợi → điều **không được xảy ra**. Negative test phải kiểm trạng thái không đổi, không leak và không phát event ngoài quyền khi phù hợp; chỉ assert HTTP400 là chưa đủ cho lỗi race/idempotency.

Fixture seed trạng thái đã xác thực chỉ dùng cô lập feature khác. Test đăng ký/xác minh/reset phải đi qua provider/email thật; không dùng admin-confirm để tự nhận AC verify đã PASS. Benchmark đo hiệu năng dùng thời gian thực; test deadline nghiệp vụ dùng clock tiêm. Test AI oracle được review độc lập; output từ thuật toán đang test không là đáp án.

## 3. Clock và race

Clock nguồn tại003 (`tests/fixtures/test-clock.ts`), harness thật tại044 (`tests/fixtures/integration.ts`). Dùng đúng chữ ký đã định nghĩa ở hai issue đó; không tạo bản clock/harness riêng cho từng feature.

Biên deadline: `deadline−1ms`, `deadline`, `deadline+1ms`; thêm lệnh gửi trước nhưng chờ khoá tới hạn. Gọi `runDueTasks()` rõ ràng khi muốn chạy scheduler; không chỉ đổi số now rồi cho rằng callback tự chạy nếu contract clock không làm vậy. Lệnh không được tới hạn rồi tự hồi sinh phiên/ghế/đề nghị.

Race: hai PostgreSQL connections khác nhau (ghi backend PID), barrier đặt trước điểm tranh chấp; không chờ barrier sau khi đã giữ cùng row lock gây deadlock. `Promise.all` đơn thuần không chứng minh hai transaction đã tranh nhau. Assert cả kết quả thành công/thất bại, số row/receipt/event và invariant sau commit. Timeout chống test treo có thể dùng đồng hồ thật của runner; không dùng nó thay clock nghiệp vụ.

## 4. Dữ liệu và an toàn môi trường test

Integration chỉ chạy trên host loopback và DB test được khai rõ. Parse/reject URL trước mở kết nối; không reset cloud, không TRUNCATE dùng chung. Seed gắn runId, cleanup chỉ đúng dữ liệu run, theo thứ tự FK và đóng pool/socket kể cả assert fail. Role privileged chỉ bootstrap/migration hoặc helper an toàn được quy định; kiểm hành vi dưới app_server/anon/authenticated thật. Chạy superuser cho test quyền không phải bằng chứng RLS.

Không `.only`, không `.skip`, không passWithNoTests. Thiếu Postgres/Auth/SFU phải fail rõ hoặc issue BLOCKED đúng scope, không biến suite thành xanh rỗng. Browser độc lập nghĩa context/storage riêng; nhiều tab cùng context chỉ dùng khi chủ đích kiểm cùng phiên.

## 5. Media, AI và tải

Media: không assert object thống kê tự tạo. Trước revoke phải có RTP/frame thật; sau revoke phân biệt mẫu mới với buffer cũ theo media-control-contract, kèm bên còn quyền tiếp tục nhận. Lỗi toàn mạng không chứng minh thu hồi thành công. Local generation và Cloud token revocation có oracle riêng; hai tab local không thay hai thiết bị/hai mạng.

AI: dùng manifest/corpus/seed đã đóng băng, báo mọi mẫu. Không hoàn tất target depth tính +∞ theo ai-validation, không bỏ outlier hoặc tăng ngân sách. 60ván deterministic là bài chất lượng riêng với phép đo thời gian production. Không đạt thì BLOCKED với số thật.

Load: khởi động workload đồng thời, warmup/measurement rõ, lưu mẫu thô và percentile, số lỗi và số kết nối thực. Chạy tuần tự70client hoặc chỉ tạo object không phải thử tải. Không đổi tiêu chí để hợp phần cứng yếu.

## 6. Chứng minh test bắt được lỗi

Chọn mutation cụ thể ở issue: bỏ kiểm chân Mã, bỏ membership check, bỏ version check, reset deadline khi reconnect… Chạy ca trọng tâm phải đỏ đúng assert; khôi phục thay đổi rồi chạy lại xanh. Giữ patch/mô tả mutation và log, không commit lỗi chủ động. Nếu test vẫn xanh thì sửa test/fixture để bắt invariant, không ghi PASS.

## 7. Kết quả và deferred gate

PASS đòi code/test/checklist/AC trong scope đều đạt; DONE thêm merge và cập nhật INDEX. Deferred chỉ hợp lệ khi nguồn sớm nêu rõ khả năng chưa xây và đích test bắt buộc có owner/ID. Ví dụ DB revoke066/075 không nhận PASS media;110/117 phải chứng minh transport rồi133/136 đối chiếu. Không “để sau” không có issue đích.

Báo cáo dùng [TEST-REPORT-TEMPLATE](TEST-REPORT-TEMPLATE.md). Với AC nhiều môi trường, tách từng phần local/external, không ghi AC toàn phần PASS trước bằng chứng cuối. Toàn dự án không đạt khi053/137 hoặc bất kỳ AC bắt buộc nào còn CHỜ.
