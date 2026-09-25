# ISSUE-119 — Worker thread + cờ huỷ

**Nhóm:** E18 · **Phụ thuộc:** 118 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Chạy tìm kiếm trong **luồng riêng** và **huỷ được ngay** khi người chơi đi lại.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-AI.md](../01-requirements/REQ-AI.md) §10 `BR-AI-14` · [ISSUE-031.md](ISSUE-031.md)

## 3. PHẠM VI
**✅ LÀM** — worker thread · cơ chế huỷ tức thì
**❌ LÀM SAU** — hàng đợi (120)

## 4. FILE TẠO
`apps/ai-worker/src/search-worker.ts` · `cancel-flag.ts`

## 5. CÁC BƯỚC
1. Tiến trình AI dùng **worker thread** để chạy tìm kiếm — **2 luồng song song tối đa**
2. ⭐ **Cờ huỷ dùng BỘ NHỚ DÙNG CHUNG** (`SharedArrayBuffer` + thao tác nguyên tử) để tín hiệu huỷ **tới ngay**, không phải chờ hết vòng lặp
3. Hàm tìm kiếm kiểm cờ huỷ ở **node gốc** và **mỗi 64 node** (đã làm ở issue 031)
4. Huỷ ⇒ worker dừng, trả kết quả **tốt nhất tới lúc đó** hoặc báo đã huỷ
5. **Khi nào huỷ**: người chơi **đi lại** · ván **kết thúc** · **phiên bản đổi**
6. ⭐ Kết quả về **sau khi** phiên bản đã đổi ⇒ **BỎ** (`BR-AI-16`)
7. Worker chết ⇒ giám sát sinh lại, việc đang chạy báo lỗi

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T119-01` | Tìm kiếm chạy trong worker thread, **không** trong luồng chính |
| `T119-02` | ⭐ **Gửi huỷ → worker dừng TRONG VÒNG 100 ms** |
| `T119-03` | ⭐ **Đi lại khi đang tính cấp Khó → việc bị HUỶ** |
| `T119-04` | ⭐ **Kết quả về sau khi phiên bản đổi → BỊ BỎ** |
| `T119-05` | **2 worker chạy song song** được |
| `T119-06` | Worker thứ 3 → **không** được tạo |
| `T119-07` | Worker chết → giám sát sinh lại, việc báo lỗi |
| `T119-08` | Huỷ việc **không** ảnh hưởng việc kia đang chạy |
| `T119-09` | ⭐ **Cờ huỷ dùng bộ nhớ dùng chung**, không phải gửi tin |
| `T119-10` | Ván kết thúc → việc đang chạy **bị huỷ** |
| `T119-11` | Sau khi huỷ, worker **tái sử dụng được** cho việc mới |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 11 test xanh
- [ ] **`T119-02`** huỷ dưới 100 ms
- [ ] **`T119-04`** bỏ kết quả cũ
- [ ] **`T119-09`** cơ chế huỷ tức thì
- [ ] Tối đa 2 worker

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-119.md` — đo **độ trễ huỷ** thực tế.

## 9. ⚠ CẠM BẪY
Gửi tín hiệu huỷ bằng **tin nhắn** giữa các luồng sẽ **không tới được** khi worker đang bận trong vòng lặp tìm kiếm — nó chỉ đọc tin khi rảnh. Bộ nhớ dùng chung là cách duy nhất huỷ **tức thì**.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-119

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/ai-worker/src/search-worker.ts; apps/ai-worker/src/cancel-flag.ts.
- **File test:** `tests/unit/issue-119.test.ts`.
- **Nhận từ phụ thuộc:** 118 child IPC; 031 search checks cancellation root/every 64 nodes.
- **Bàn giao:** Shared Array Buffer Int 32 cancellation flag; at most 2 actual worker threads; job/version correlation.
- **Trình tự xử lý tối thiểu:** Supervisor owns Shared Array Buffer và Atomics.store cancel; search reads Atomics.load ởroot/64 nodes; clear flag chỉ khi worker finished/reassigned đúng job; reuse không reset flag của old job còn chạy.

### Chuẩn bị và oracle từng nhóm ca

**Given:** 2 Hard jobs chạy real worker; barrier xác nhận both started; job 3; record performance.now cancel request/worker stop.

| ID test (tiền tố T119 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–03,05–11` | Cancel job 1 trong CPU search; job 2 tiếp tục; kill worker; job 3 submit | Dừng≤100 ms real monotonic; ≤2 worker; job 2 unaffected; replacement ready; reuse after cancel; Atomics flag không phụ thuộc message event loop. |
| `04,10` | Bump authoritative expected version trong supervisor then inject late RESULT; end job signal | Late job/version discarded, no forward valid move; full PGundo/end tested 122/121, không claim Match commit ở 119. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence119 = { cancelLatencyMs: number; maxWorkers: number; lateResultsForwarded: number };

export function assertIssue119KeyCase(actual: Evidence119): void {
  expect(actual.cancelLatencyMs).toBeLessThanOrEqual(100); expect(actual.maxWorkers).toBeLessThanOrEqual(2); expect(actual.lateResultsForwarded).toBe(0);
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Thay shared flag bằng message hoặc reset flag trước dừng; T119-02/11 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-119.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:unit -- tests/unit/issue-119.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit

```

**Chặn riêng của issue:** Máy đo không đủ CPU/không dừng≤100 ms ⇒ BLOCKED+số thật; không tăng threshold.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 120 queue 2+8; 122 real UNDO integration chặn stale AI.


### Test cờ huỷ đúng cơ chế chia sẻ

Trong `apps/ai-worker/src/cancel-flag.ts` bàn giao `createCancelFlag(): Int32Array`, `requestCancel(flag: Int32Array): void`, `isCancelled(flag: Int32Array): boolean`; cùng buffer được truyền qua worker Data, không clone giá trị boolean. Cài đặt tối thiểu dùng `new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT)`, `Atomics.store(flag,0,1)` và `Atomics.load(flag,0)!==0`.

```ts
import { expect, test } from 'vitest';
import { createCancelFlag, requestCancel, isCancelled } from '../../apps/ai-worker/src/cancel-flag';

test('T119-09 — hai view cùng thấy cờ mà không đợi message loop', () => {
  const supervisorView = createCancelFlag();
  const workerView = new Int32Array(supervisorView.buffer);
  expect(supervisorView.buffer).toBeInstanceOf(SharedArrayBuffer);
  expect(isCancelled(workerView)).toBe(false);
  requestCancel(supervisorView);
  expect(isCancelled(workerView)).toBe(true);
});
```

Ca này chỉ chứng minh shared-memory primitive. T119-02 bắt buộc chạy worker/search thật, ghi mốc cancel→stop bằng monotonic clock và đạt ≤100 ms; không lấy primitive test làm bằng chứng độ trễ.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
