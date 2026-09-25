# ISSUE-094 — Hiển thị đồng hồ

**Nhóm:** E12 · **Phụ thuộc:** 093, 091 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Đồng hồ đếm ngược mượt ở trình duyệt, **đồng bộ với máy chủ**, và **client không bao giờ tự quyết ván kết thúc**.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-CLOCK.md](../01-requirements/REQ-CLOCK.md) §11, §13 `BR-CLK-17`

## 3. PHẠM VI
**✅ LÀM** — hiển thị đồng hồ · đếm ngược cục bộ
**❌ KHÔNG LÀM** — logic hết giờ (đã ở 093)

## 4. FILE TẠO
`apps/web/src/features/match/Clock.tsx` · `useClock.ts`

## 5. CÁC BƯỚC
1. ⭐ **`BR-CLK-17` — công thức hiển thị**:
   ```
   hiển thị = số dư máy chủ gửi − thời gian trôi qua CỤC BỘ từ lúc nhận
   ```
   Dùng đồng hồ **đơn điệu** của trình duyệt, **không** dùng giờ hệ thống (người dùng đổi được)
2. ⛔ **Client TUYỆT ĐỐI KHÔNG tự kết luận ván đã hết giờ.** Chỉ **máy chủ** kết thúc ván
3. Đồng hồ **đang chạy** có dấu hiệu rõ — **không chỉ bằng màu** (`DT-01`)
4. Dưới **1 phút** phải cảnh báo rõ bằng **chữ và/hoặc biểu tượng**
5. `timeControl = 0` ⇒ hiện chữ **"Không giới hạn"**, **không** hiện số
6. Trên điện thoại, đồng hồ ở thanh **dính**, luôn nhìn thấy (`DT-13`)
7. Nhận snapshot mới ⇒ **nhảy về** số của máy chủ

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T094-01` | Đồng hồ đếm ngược mượt, khớp số máy chủ |
| `T094-02` | ⭐ **Hai client hiện lệch nhau KHÔNG QUÁ 1 giây** |
| `T094-03` | ⭐ **Client KHÔNG tự kết thúc ván** khi đồng hồ về 0 — chờ máy chủ |
| `T094-04` | ⭐ **Đổi giờ hệ thống máy người dùng → đồng hồ KHÔNG bị ảnh hưởng** |
| `T094-05` | Nhận snapshot → nhảy về số máy chủ |
| `T094-06` | ⭐ **Không giới hạn → hiện chữ "Không giới hạn"**, không có số |
| `T094-07` | ⭐ **Dưới 1 phút → cảnh báo bằng CHỮ**, không chỉ màu |
| `T094-08` | Đồng hồ đang chạy có dấu hiệu **không phải màu** |
| `T094-09` | Mobile: đồng hồ ở thanh dính, **luôn thấy** khi cuộn |
| `T094-10` | Ván kết thúc → đồng hồ **dừng**, giữ số dư cuối |
| `T094-11` | Tab bị trình duyệt tạm ngưng → khi quay lại **đồng bộ lại** đúng |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 11 test xanh ở cả 2 kích thước
- [ ] **`T094-03`** — client không tự quyết
- [ ] **`T094-04`** — dùng đồng hồ đơn điệu
- [ ] **`T094-02`** — lệch dưới 1 giây
- [ ] **`T094-07`** — không chỉ dùng màu

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-094.md`

## 9. ⚠ CẠM BẪY
Dùng **giờ hệ thống** thay vì đồng hồ đơn điệu cho phép người chơi **đổi giờ máy** để làm đồng hồ chạy chậm. Dù máy chủ vẫn đúng, hiển thị sai gây rối. `T094-04` bắt lỗi này.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-094

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/web/src/features/match/Clock.tsx; apps/web/src/features/match/useClock.ts.
- **File test:** `tests/unit/issue-094.test.ts`, `tests/e2e/issue-094.spec.ts`.
- **Nhận từ phụ thuộc:** Match Snapshot 008 và live store 090; server Now Ms/clock đã projected từ 092.
- **Bàn giao:** use Clock dựa monotonic received At; Clock hiển thị side đang chạy, Không giới hạn và cảnh báo.
- **Trình tự xử lý tối thiểu:** Lưu performance.now tại lúc nhận snapshot, derive max(0,balance−elapsed) chỉ bên running; cleanup animation khi terminal/unmount; visibility change yêu cầu snapshot quyền hiện hành.

### Chuẩn bị và oracle từng nhóm ca

**Given:** Hai browser context cùng nhận snapshot; desktop 1366 × 768/mobile 360 × 800; injected monotonic clock độc lập.

| ID test (tiền tố T094 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–05,10–11` | Advance cục bộ 5 s; đổi Date wall clock±1 ngày; snapshot mới; hide/show tab | Giảm 5000 ms; wall clock không ảnh hưởng; sai lệch hai client≤1000 ms; resume resync; terminal giữ số cuối. |
| `03,06–09` | Cho local số dư 0 nhưng chưa nhận terminal; kiểm null/59999/60000 ms và cuộn mobile | Không POST kết thúc/không outcome local; null hiện chữ; dưới 60000 có chữ/biểu tượng; thanh clock còn trong view port. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from '@playwright/test';

type Evidence094 = { clientSkewMs: number; terminalRequests: number; endedLocally: boolean };

export function assertIssue094KeyCase(actual: Evidence094): void {
  expect(actual.clientSkewMs).toBeLessThanOrEqual(1000); expect(actual.terminalRequests).toBe(0); expect(actual.endedLocally).toBe(false);
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Thay performance.now bằng Date.now; T094-04 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-094.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:unit -- tests/unit/issue-094.test.ts
pnpm test:e2e -- tests/e2e/issue-094.spec.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:e2e
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 130 kiểm cả 4 view port; 136 so hai client từ backend thật.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-CLK-13` | [REQ-CLOCK](../01-requirements/REQ-CLOCK.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
