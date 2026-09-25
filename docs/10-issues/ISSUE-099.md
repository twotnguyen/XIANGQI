# ISSUE-099 — Camera/mic chỉ một tab

**Nhóm:** E13 · **Phụ thuộc:** 098, 116 · **Trạng thái:** TODO
**⭐ Ngoại lệ DUY NHẤT của `DEC-020`** — theo `DEC-021`

## 1. MỤC TIÊU
Chỉ **một tab** phát camera, **một tab** phát micro — chính sách toàn tài khoản trên mọi tab/trình duyệt/thiết bị, không dựa khả năng chia webcam của phần cứng.

## 2. ĐỌC TRƯỚC
[../05-data-and-realtime/session-state.md](../05-data-and-realtime/session-state.md) **§4 `SS-11..SS-16`** · [../07-decisions/decision-log.md](../07-decisions/decision-log.md) `DEC-021`

## 3. PHẠM VI
**✅ LÀM** — một tab giữ thiết bị · nút chuyển sang tab này
**❌ KHÔNG LÀM** — chính sách media (113)

## 4. FILE TẠO
`apps/web/src/features/media/useDeviceOwnership.ts` · `apps/server/src/modules/media/device-owner.service.ts`

**Hợp đồng đã chốt:** [media-control-contract](../09-technical/media-control-contract.md), DEC-041; phạm vi toàn tài khoản, timeout 30 giây, bằng chứng SFU và giới hạn thiết bị vật lý.

## 5. CÁC BƯỚC
1. **Vì sao có ngoại lệ này** — ghi rõ trong mã nguồn:
   > Khả năng chia camera phụ thuộc hệ điều hành/trình duyệt. Chính sách mỗi tài khoản một nguồn phát tránh vọng âm và nhầm lẫn, kiểm tại server trên mọi thiết bị.
2. **`SS-11`** — tab nào **bật trước** thì **giữ quyền phát**
3. **`SS-12`** — tab khác hiện: *"Camera đang bật ở tab khác"* + nút **"Chuyển sang tab này"**
4. ⭐ **`SS-13`, `SS-16` — THỨ TỰ BẮT BUỘC**:
   ```
   ① yêu cầu tab cũ dừng + thu hồi SFU nguồn tương ứng
   ② CHỜ bằng chứng hạ tầng theo media-control-contract (ACK client riêng lẻ không đủ)
   ③ nguồn tab mới về TẮT (nguồn còn lại giữ nguyên)
   ④ người dùng bật riêng nguồn mới thì MỚI phát
   ```
   ⛔ Bật trước khi tắt sẽ **tranh chấp thiết bị** ở tầng hệ điều hành
5. ⭐ **`SS-14`** — camera và micro **tách riêng**: camera ở tab 1, micro ở tab 2 là **hợp lệ**
6. **`SS-15`** — tab mới **không tự cướp**; phải có **thao tác của người dùng**
7. Dùng bảng `client_controls` (issue 042), khoá theo `(user_id, kind)`
8. **`SS-19`, DEC-033/034** — chỉ nguồn chuyển về Tắt, phải bật lại. Chưa xác nhận ngắt thì chưa cho phát nguồn mới; thao tác lỗi báo rõ + Thử lại, ACK muộn không tự bật

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T099-01` | Tab 1 bật camera → tab 2 hiện *"đang bật ở tab khác"* + nút chuyển |
| `T099-02` | ⭐ **Tab 2 KHÔNG tự phát được** khi tab 1 đang giữ |
| `T099-03` | ⭐ **Bấm chuyển → xác nhận nguồn cũ dừng, nguồn mới TẮT; phải bật riêng mới phát** |
| `T099-04` | ⭐ **Thứ tự sai (bật trước tắt) KHÔNG xảy ra** — kiểm bằng dấu thời gian |
| `T099-05` | ⭐ **Camera ở tab 1 + micro ở tab 2 → HỢP LỆ**, cùng lúc |
| `T099-06` | ⭐ **Hai tab cùng bấm chuyển → ĐÚNG MỘT tab thắng** |
| `T099-07` | ⭐ **Tab mới KHÔNG tự cướp** — phải có thao tác người dùng |
| `T099-08` | Đóng tab đang phát → thiết bị giải phóng, tab khác bật được |
| `T099-09` | ⭐ **Chuyển camera → camera mới Tắt, micro còn truyền đúng quyền**, rồi kiểm đối xứng khi chuyển micro |
| `T099-10` | Tab cũ cố phát sau khi đã chuyển → **bị từ chối** |
| `T099-11` | ⭐ **Đi cờ và chat vẫn hoạt động ở MỌI tab** — ngoại lệ chỉ áp cho media |
| `T099-12` | Mất xác nhận dừng nguồn cũ: không cho tab mới thu/phát kể cả gọi thẳng server; thao tác lỗi có Thử lại; không báo thành công giả |
| `T099-13` | Thử lại/ACK muộn/nhấn lặp không tự bật; thành công vẫn Tắt. Nguồn còn lại có đối chứng luồng thật; từ chối thiết bị mới không tự bật tab cũ |
| `T099-14` | Hai thiết bị/trình duyệt cùng tài khoản tranh nguồn với barrier: đúng một owner/epoch thắng; nguồn kia truyền bình thường. |
| `T099-15` | Tab cũ im lặng, SFU thu hồi xác nhận: chuyển OFF; UI không nói camera vật lý đã tắt khi thiếu ACK. |
| `T099-16` | Deadline 30 giây/ACK giả hoặc muộn/restart sau revoke: giữ fence, retry idempotent, không capture mới trước xác nhận. |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 16 test xanh
- [ ] **`T099-03`** và **`T099-04`** — thứ tự dừng-trước-phát-sau
- [ ] **`T099-05`** camera và micro độc lập
- [ ] **`T099-11`** — ngoại lệ **chỉ** áp cho media
- [ ] `T099-06` với rào đồng bộ

**Các ca có luồng phải dùng media thật**, đối chứng dương cho nguồn không chuyển và kiểm số byte/frame. Không coi thứ tự object mock là chứng minh nguồn cũ ngắt.

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-099.md`

## 9. ⚠ CẠM BẪY
Mở rộng ngoại lệ này sang **đi cờ hay chat** là **mâu thuẫn `DEC-020`**. Ngoại lệ tồn tại **chỉ vì phần cứng** — `T099-11` kiểm nó không lan sang chỗ khác.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-099

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/web/src/features/media/useDeviceOwnership.ts; apps/server/src/modules/media/device-owner.service.ts.
- **File test:** `tests/integration/issue-099.test.ts`, `tests/e2e/issue-099.spec.ts`, `tests/media/issue-099.test.ts`.
- **Nhận từ phụ thuộc:** 042 client_controls; 114 source token binding; 115 durable revoke; 116 UI; 098 game/chat không khoá tab.
- **Bàn giao:** Transfer theo (user_id,kind), command Id,expected Epoch; STOPPING→APPLIED/OFF hoặc ERROR/fence; contract media-control §1–4.
- **Trình tự xử lý tối thiểu:** Ghi operation+old refs/fence trong transaction; gọi SFU ngoài khoá; kiểm operation/epoch/phiên khi commit; cấp owner mới OFF chỉ sau confirmed; cancellation vẫn thu hồi cũ.

### Chuẩn bị và oracle từng nhóm ca

**Given:** A trên 2 browser/thiết bị; camera và micro phát nguồn tổng hợp có sequence; B vàS nhận thật; clock giả cho control deadline.

| ID test (tiền tố T099 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–05,07–11` | Tab 2 mở và yêu cầu chuyển CAMERA; SFU confirmed rồi bấm bật riêng | Không tự cướp/capture; old camera revoked trước owner mới; new camera OFF; micro vẫn byte/frame dương; game/chat cả tab hợp lệ. |
| `06,14` | Hai client cùng expected Epoch/2 DB connection+barrier; đảo thứ tự | Một owner/epoch thắng toàn tài khoản; không 2 publisher camera; không chỉ Broadcast Channel trong một trình duyệt. |
| `12–13,15–16` | Chặn ACK client, lỗi SFU, retry/late ACK/restart; 29999/30000/30001 ms | ACK riêng không đủ; đúng 30 s ERROR/fence; SFU confirmed thiếu device ACK chỉ tuyên bố chặn luồng, không tắt webcam vật lý; retry/late không tự bật. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence099 = { winningOwners: number; newSource: string; captureBeforeConfirmed: number; unmovedSourceBytes: number };

export function assertIssue099KeyCase(actual: Evidence099): void {
  expect(actual).toMatchObject({winningOwners:1,newSource:'OFF',captureBeforeConfirmed:0}); expect(actual.unmovedSourceBytes).toBeGreaterThan(0);
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Cho ACK client thay SFU confirmation hoặc reset mic khi transfer camera; 12/09/15 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-099.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:integration -- tests/integration/issue-099.test.ts
pnpm test:e2e -- tests/e2e/issue-099.spec.ts
pnpm test:media -- tests/media/issue-099.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm test:media
```

**Chặn riêng của issue:** LiveKit local/nguồn tổng hợp hoặc DB không chạy ⇒ BLOCKED; thiếu hai thiết bị/hai mạng ghi CHỜ 137, không suy từ 2 tab.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 117 TS-MED-08/13/15 chứng nhận luồng; 137 hai mạng thật.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
