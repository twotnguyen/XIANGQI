# ISSUE-137 — Triển khai Render + Vercel

**Nhóm:** E20 · **Phụ thuộc:** 136, 053 · **Trạng thái:** TODO
**⚠ Có thể `BLOCKED_EXTERNAL`** — cần tài khoản Render + Vercel. Xem [EXTERNAL-SETUP.md](EXTERNAL-SETUP.md) §4, §5

## 1. MỤC TIÊU
Đưa hệ thống lên môi trường thật và **chứng minh nó chạy được ở đó**, không chỉ trên máy cá nhân.

## 2. ĐỌC TRƯỚC
[../09-technical/deployment.md](../09-technical/deployment.md) **toàn bộ** · [../09-technical/tech-stack.md](../09-technical/tech-stack.md) `TECH-11`

## 3. PHẠM VI
**✅ LÀM** — triển khai giao diện · máy chủ · tiến trình máy cờ · biến môi trường · kiểm tra sau triển khai
**❌ KHÔNG LÀM** — tự động hoá đường ống CI (ngoài phạm vi) · tên miền riêng

## 4. FILE TẠO
`render.yaml` · `vercel.json` · `.env.example` · `docs/runbook.md`

## 5. CÁC BƯỚC
1. **Bản đồ triển khai**:
   | Thành phần | Nơi chạy |
   |---|---|
   | Giao diện | **Vercel** (tĩnh) |
   | Máy chủ + thời gian thực | **Một Render Web Service**, hồ sơ DEMO_SLEEP_ALLOWED |
   | Tiến trình máy cờ | AI child do backend spawn qua IPC trong **cùng service**, PID riêng, tối đa hai search worker |
   | Cơ sở dữ liệu | **Supabase** |
   | Media | **LiveKit Cloud** |
2. Áp dụng **DEMO_SLEEP_ALLOWED** (DEC-046), không yêu cầu always-on và không tự mua dịch vụ. Kiểm giới hạn gói hiện có khi triển khai; công bố ngủ/restart làm ván cũ INTERRUPTED trong runbook/UI; không dùng ping chống ngủ.
3. **Biến môi trường** — chép từ `.env.example`, điền giá trị thật **trên bảng điều khiển**, ⛔ **không** commit
   ⭐ Khoá bí mật **tuyệt đối không** mang tiền tố dành cho giao diện (`VITE_*`)
4. **Kiểm tra sức khoẻ**: `/healthz` trả về trạng thái **cơ sở dữ liệu + tiến trình máy cờ**, không phải chỉ `ok`
5. **Đường quay về** cho Google và email phải khai **đúng địa chỉ thật**, không phải `localhost`
6. **Danh sách nguồn gốc được phép** trên máy chủ = đúng địa chỉ Vercel
7. **Kiểm tra sau triển khai** — chạy trên môi trường thật, ⛔ **không** trên máy cá nhân
8. `docs/runbook.md` — cách xem log · cách khởi động lại · cách quay về bản trước · 5 sự cố thường gặp

## 6. TEST BẮT BUỘC (chạy trên môi trường THẬT)
| Tên | Kiểm gì |
|---|---|
| `T137-01` | ⭐ **`/healthz` báo đủ: cơ sở dữ liệu ✓ + tiến trình máy cờ ✓** |
| `T137-02` | Giao diện tải được, không lỗi console |
| `T137-03` | ⭐ **Kết nối thời gian thực từ Vercel → Render THÀNH CÔNG** (nguồn gốc hợp lệ) |
| `T137-04` | Đăng ký → email xác minh → link trỏ về **địa chỉ thật** |
| `T137-05` | Đăng nhập Google → quay về **địa chỉ thật** |
| `T137-06` | ⭐ **Ván đầy đủ trên môi trường thật**: tạo phòng → 2 người → chiếu bí → lưu lịch sử |
| `T137-07` | ⭐ **Chạy lại toàn bộ protocol ai-validation §2 trên máy chủ THẬT:20×5 mỗi cấp, depth2/4/6 p95≤300/1000/3000ms; không cộng biên độ** |
| `T137-08` | Media kết nối được từ 2 mạng khác nhau |
| `T137-09` | ⭐ **Không khoá bí mật nào trong gói giao diện** — quét file đã build |
| `T137-10` | Khởi động lại máy chủ → trước nhận lệnh mới mọi ván cũ ACTIVE thành **INTERRUPTED**, giữ lịch sử, không dùng downtime tạo thua; child cũ dừng và child mới sẵn sàng |
| `T137-11` | ⭐ **DEMO_SLEEP_ALLOWED**: quan sát idle20phút, ghi socket/process; nếu chưa ngủ thì ép stop/start. Reconnect hiển thị rõ; ván cũ INTERRUPTED, lịch sử giữ, không replay lệnh cũ hay xử thua vì downtime |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 11 test xanh **trên môi trường thật**
- [ ] ⭐ **`T137-06`** ván đầy đủ chạy được
- [ ] ⭐ **`T137-07`** máy cờ đạt ngưỡng trên phần cứng thật
- [ ] **`T137-09`** không rò khoá
- [ ] **`T137-11`** đạt interruption/recovery theo profile; runbook không thay thế bằng chứng chạy thật
- [ ] `docs/runbook.md` có đủ: log · khởi động lại · quay về bản trước

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-137.md` — địa chỉ thật + ảnh chụp + log `/healthz`, PID backend/child, profile đã chọn, thời điểm stop/start/idle, raw AI100 mẫu/cấp và mọi giới hạn chưa kiểm.

## 9. ⚠ CẠM BẪY
| Rủi ro | Phòng |
|---|---|
| **Máy chủ ngủ làm đứt kết nối** | `T137-11` |
| **Máy cờ chạy chung tiến trình máy chủ → chặn toàn bộ người chơi** | Bước 1 — tiến trình riêng |
| **Máy chủ thật yếu hơn máy cá nhân → máy cờ quá ngưỡng** | `T137-07` — đo lại, ⛔ không tin số đo trên máy cá nhân |
| **Khoá bí mật lọt vào gói giao diện** | `T137-09` |

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-137

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** render.yaml; vercel.json; .env.example; docs/runbook.md; tests/e2e/issue-137.spec.ts; tests/media/issue-137.test.ts; tests/ai/benchmark.ts.
- **File test:** `tests/e2e/issue-137.spec.ts`, `tests/media/issue-137.test.ts`.
- **Nhận từ phụ thuộc:** 136 nghiệm thu local và053 Google thật; DEP, TECH-11, DEMO_SLEEP_ALLOWED; tài khoản cloud người dùng cấp.
- **Bàn giao:** Một backend Render sinh AI child PID riêng, frontend Vercel, Supabase và LiveKit Cloud; health kiểm DB+IPC; bằng chứng nghiệm thu Internet từ deployment thật.
- **Trình tự xử lý tối thiểu:** Kiểm cấu hình bắt buộc trước boot, không in secret. Triển khai cùng SHA đã nghiệm thu; cấu hình chính xác origin và callback. Health phải kiểm IPC heartbeat; ca thiết bị vật lý lưu quan sát có thời điểm, không thay bằng assertion dựng sẵn. Kiểm runbook quay lui trên deployment kiểm thử.

### Chuẩn bị và oracle từng nhóm ca

**Given:** Tài khoản/secret do người dùng cấp qua môi trường, dữ liệu kiểm thử riêng; hai thiết bị vật lý trên hai mạng; ghi revision, URL, PID và thời điểm, không ghi giá trị secret.

| ID test | When — tác động thật | Then — kết quả bắt buộc |
|---|---|---|
| `01–06,09` | Mở URL triển khai thật; gọi health; đăng ký/xác minh/khôi phục email; đăng nhập Google; chơi ván chiếu hết và đọc lịch sử; quét bundle | DB+AI thực sự healthy; socket qua origin đúng hoạt động; callback không localhost; không lỗi console; ván được lưu; không secret trong frontend/log. |
| `07` | Chạy lại protocol ai-validation20 thế×5 lần mỗi cấp trên máy chủ triển khai | Đúng100 mẫu/cấp, depth2/4/6; chưa xong depth tính Infinity; p95 nearest-rank≤300/1000/3000ms, không cộng biên; ghi giới hạn phần cứng thật. |
| `08,10–11` | Media giữa hai thiết bị/hai mạng; chuyển/thu hồi nguồn; quan sát idle20 phút; nếu không ngủ thì stop/start có kiểm soát | Có RTP/frame thật và đối chứng dương. Ván ACTIVE boot cũ thành INTERRUPTED trước nhận lệnh; lịch sử còn; không xử thua vì downtime, không phát lại lệnh cũ; child cũ dừng và child mới ready. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from '@playwright/test';

type Evidence137 = { databaseHealthy: boolean; aiIpcHealthy: boolean; oldBootActiveAfterReady: number; downtimeLosses: number; secretLeaks: number; twoPhysicalDevices: boolean; twoNetworks: boolean };

export function assertIssue137KeyCase(actual: Evidence137): void {
  expect(actual).toMatchObject({databaseHealthy:true,aiIpcHealthy:true,oldBootActiveAfterReady:0,downtimeLosses:0,secretLeaks:0,twoPhysicalDevices:true,twoNetworks:true});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Health always ok with child killed or frontend canary secret; T137-01/09 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-137.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
E2E_BASE_URL="$DEPLOYED_WEB_URL" API_BASE_URL="$DEPLOYED_API_URL" pnpm test:e2e -- tests/e2e/issue-137.spec.ts
API_BASE_URL="$DEPLOYED_API_URL" LIVEKIT_URL="$DEPLOYED_LIVEKIT_URL" pnpm test:media -- tests/media/issue-137.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:e2e
pnpm test:media
```

**Chặn riêng của issue:** Thiếu Render/Vercel/Supabase/LiveKit Cloud/OAuth/SMTP hoặc 2 thiết bị 2 mạng ⇒ BLOCKED_EXTERNAL rõ từng ca; không tự mua gói, không dùng local/mock làm PASS. Server performance rớt⇒BLOCKED giữ ngưỡng.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 138 updates actual URL/limits; full project final gate all 138 including 053/137 and 333 AC evidence.


### Bằng chứng thủ công có đường dẫn cụ thể

- `docs/test-reports/ISSUE-137.md`: URL thật, deployment SHA, bảng T137-01..11 và trạng thái từng ca.
- `artifacts/issue-137/health-and-process.json`: thời điểm UTC, backend/child PID, DB health và IPC readiness; không token.
- `artifacts/issue-137/two-network-media.json`: hai thiết bị, hai mạng, source/recipient/generation, RTP/frame trước/sau và đối chứng dương. Ảnh quan sát ở cùng thư mục, không lưu hình/tiếng riêng tư.
- `artifacts/issue-137/restart-timeline.json`: idle 20 phút, stop/start nếu cần, readiness, old Match outcomes, lịch sử trước/sau, stale command bị từ chối.
- `artifacts/issue-137/ai-raw.json`: đúng 100 mẫu mỗi cấp theo protocol; runtime benchmark thực qua `tests/ai/benchmark.ts`, không lấy test assertion làm mẫu đo.

Test automation chỉ đánh dấu phần nó thực sự đo. Hai thiết bị/hai mạng và quan sát idle có người thực hiện ký nhận bằng chứng; thiếu thì T137 tương ứng CHỜ, không tạo `.skip` rồi báo 11/11.


Các fixture riêng của137 đọc `DEPLOYED_WEB_URL`, `DEPLOYED_API_URL`, `DEPLOYED_LIVEKIT_URL` do người triển khai cấp; truyền chúng qua các biến runner ở trên. Từ chối chạy nếu URL thiếu hoặc trỏ localhost/loopback. Không khởi động `createTestApp` local trong test nghiệm thu deployment. Bí mật SFU chỉ ở môi trường server/test được bảo vệ, không in trong artifact. Bốn cổng lint/typecheck/build/unit vẫn chạy trên checkout cùng SHA; chúng không thay các ca deployment thật.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-MED-17` | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) | EXTERNAL |
| `AC-MED-22` | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) | EXTERNAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
