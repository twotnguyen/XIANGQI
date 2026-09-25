# ISSUE-092 — Đồng hồ: cấu hình + tính toán

**Nhóm:** E12 Đồng hồ · **Phụ thuộc:** 087 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Tính thời gian còn lại của mỗi bên — **máy chủ là nguồn duy nhất**.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-CLOCK.md](../01-requirements/REQ-CLOCK.md) §5, §9

## 3. PHẠM VI
**✅ LÀM** — hàm tính đồng hồ thuần · tích hợp vào đường xử lý lệnh
**❌ KHÔNG LÀM** — bộ đếm hết giờ (093) · hiển thị (094)

## 4. FILE TẠO
`apps/server/src/modules/matches/clock.ts`

## 5. CÁC BƯỚC
1. **Hàm thuần**, nhận `nowMs` — **không** gọi `Date.now()` bên trong:
   ```ts
   settleClock(clock: ClockState, turn: Side, nowMs: number): ClockState
   getDeadline(clock: ClockState, turn: Side): number | null
   isExpired(clock: ClockState, turn: Side, nowMs: number): boolean
   ```
2. **Công thức**:
   ```
   elapsed = max(0, nowMs - runningSinceEpochMs)
   trừ elapsed vào bên ĐẾN LƯỢT, kẹp tối thiểu 0
   sau nước đi: chuyển sang đối phương, runningSince = nowMs
   sau đi lại: lấy lượt từ vị trí được khôi phục (KHÔNG đổi lượt lần nữa)
   ```
3. **Thời hạn** = `runningSinceEpochMs + số dư của bên đến lượt`
4. `timeControl = 0` ⇒ `clock = null`, **không bao giờ** hết giờ
5. **`BR-CLK-08/09`** — đề nghị đang chờ và mất kết nối **KHÔNG** tạm dừng đồng hồ
6. **`BR-CLK-10`** — đi lại **không hoàn** thời gian đã dùng
7. **`BR-CLK-15`** — chỉ **đọc** trạng thái **không** được ghi thay đổi vào cơ sở dữ liệu

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T092-01` | Đồng hồ giả: trôi 5 giây → bên đến lượt **giảm đúng 5000 ms** |
| `T092-02` | Bên **không** đến lượt **không** bị trừ |
| `T092-03` | Đi nước → đồng hồ **chuyển bên**, `runningSince` cập nhật |
| `T092-04` | ⭐ **`timeControl = 0` → `clock = null`, KHÔNG BAO GIỜ hết giờ** |
| `T092-05` | Số dư **kẹp tối thiểu 0**, không âm |
| `T092-06` | ⭐ **Đề nghị chờ 30 giây → đồng hồ VẪN chạy** |
| `T092-07` | ⭐ **Mất kết nối 60 giây → đồng hồ VẪN chạy** |
| `T092-08` | ⭐ **Đi lại → thời gian KHÔNG được hoàn** |
| `T092-09` | Đi lại → lượt lấy **từ vị trí khôi phục**, không đổi hai lần |
| `T092-10` | `getDeadline` tính đúng |
| `T092-11` | ⭐ **Hàm KHÔNG gọi `Date.now()`** — kiểm bằng phân tích mã |
| `T092-12` | Hàm thuần, không sửa đầu vào |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 12 test xanh
- [ ] **`T092-11`** đồng hồ được tiêm vào
- [ ] **`T092-06`, `T092-07`, `T092-08`** — ba luật không tạm dừng/không hoàn
- [ ] `T092-04` không giới hạn thì không hết giờ
- [ ] Test dùng **đồng hồ giả**

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-092.md`

## 9. ⚠ CẠM BẪY
Tạm dừng đồng hồ khi có đề nghị hoà đang chờ tạo lỗ hổng: người sắp hết giờ **liên tục xin hoà** để câu giờ. `BR-CLK-08` cấm điều này — `T092-06` kiểm.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-092

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/server/src/modules/matches/clock.ts.
- **File test:** `tests/unit/issue-092.test.ts`, `tests/integration/issue-092.test.ts`.
- **Nhận từ phụ thuộc:** Clock State, Side từ 008/006; snapshot và command transaction 087.
- **Bàn giao:** settle Clock(clock, turn, now Ms), get Deadline(clock, turn), is Expired(clock, turn, now Ms) đúng chữ ký ở §5; không ghi DB trong projection.
- **Trình tự xử lý tối thiểu:** Kiểm null trước; elapsed=Math.max(0,now Ms-runningSince Epoch Ms); tạo object mới, trừ đúng side và cập nhật mốc settle. Caller settle đúng một lần trước mutation, rồi lấy side từ position mới.

### Chuẩn bị và oracle từng nhóm ca

**Given:** Clock {red Ms:300000,black Ms:300000,runningSince Epoch Ms:1000}; chạy RED, rồi BLACK; freeze sâu đầu vào.

| ID test (tiền tố T092 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–05,10,12` | Settle tại 6000; đối chiếu hạn 301000 ở 301000−1/0/+1 và clock null | RED 295000/BLACK 300000; đúng hạn hết giờ; null không hết hạn; số dư không âm; đầu vào không đổi. |
| `06–09` | Tiến clock 30 s có proposal và 60 s offline; settle trước đổi lượt/khôi phục head | Không pause/hoàn; restored Side là đầu vào lượt tiếp theo, không đảo thêm lần nữa. |
| `11, bổ sung đọc` | Đặt spy Date.now ném lỗi khi gọi hàm; đọc snapshot hai lần trên PG | Hàm vẫn chạy; persisted clock/version/row count không đổi sau read. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';
import type { ClockState } from '../../packages/contracts/src/match';

type Evidence092 = ClockState;

export function assertIssue092KeyCase(actual: Evidence092): void {
  expect(actual).toEqual({redMs:295000,blackMs:300000,runningSinceEpochMs:6000});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Đổi side bị trừ hoặc hoàn clock từ history; T092-01/02/08 phải đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-092.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:unit -- tests/unit/issue-092.test.ts
pnpm test:integration -- tests/integration/issue-092.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 093 nhận deadline tuyệt đối; 094 nhận projection; 106 giữ số dư sau settle.


### Ví dụ test gọi trực tiếp hàm sản phẩm

```ts
import { expect, test } from 'vitest';
import { settleClock, getDeadline, isExpired } from '../../apps/server/src/modules/matches/clock';

test('T092-01/02/10/12 — trừ đúng phía, không sửa đầu vào', () => {
  const clock = Object.freeze({ redMs: 300000, blackMs: 300000, runningSinceEpochMs: 1000 });
  expect(settleClock(clock, 'RED', 6000)).toEqual({
    redMs: 295000, blackMs: 300000, runningSinceEpochMs: 6000,
  });
  expect(clock.redMs).toBe(300000);
  expect(getDeadline(clock, 'RED')).toBe(301000);
  expect(isExpired(clock, 'RED', 300999)).toBe(false);
  expect(isExpired(clock, 'RED', 301000)).toBe(true);
  expect(isExpired(clock, 'RED', 301001)).toBe(true);
  expect(isExpired(null, 'RED', Number.MAX_SAFE_INTEGER)).toBe(false);
});
```

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-CLK-03` | [REQ-CLOCK](../01-requirements/REQ-CLOCK.md) | LOCAL |
| `AC-CLK-14` | [REQ-CLOCK](../01-requirements/REQ-CLOCK.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
