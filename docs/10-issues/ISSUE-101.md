# ISSUE-101 — Xác nhận + gia hạn tối đa 2 lần

**Nhóm:** E14 · **Phụ thuộc:** 100 · **Trạng thái:** TODO
**⭐ `R17`** — `DEC-011`

> **Cập nhật BA 2026-09-22 — DEC-026:** hỏi và đếm ngược bắt đầu đồng thời khi đủ 3 phút. DEC-027 đã chốt gia hạn đủ 3 phút từ xác nhận hợp lệ; DEC-030 chốt reconnect giữ hạn cũ, không cấp thêm 3 phút; không dùng mô tả reset cũ. Xem [question-backlog-2026-09-22.md](../08-ba-review/question-backlog-2026-09-22.md).

## 1. MỤC TIÊU
Người chơi xác nhận *"Tôi còn đây"* để được **+3 phút** — nhưng **tối đa 2 lần liên tiếp**.

## 2. VÌ SAO GIỚI HẠN 2 LẦN

Nếu **không giới hạn**, người chơi bấm xác nhận mỗi 3 phút là ván **vẫn treo vô hạn** — luật **không giải quyết được vấn đề nó sinh ra để giải quyết**.

> A muốn phá B. A bấm xác nhận mỗi 3 phút suốt 2 tiếng, không đi nước nào. B vẫn kẹt y như cũ.

**Chọn "liên tiếp" thay vì "tổng cả ván"** để người chơi **chậm** trong ván dài **không bị phạt oan**.

## 3. ĐỌC TRƯỚC
[../01-requirements/REQ-INACTIVITY.md](../01-requirements/REQ-INACTIVITY.md) §9 **`BR-INA-02..05`** · [../02-flows/FLOW-INACTIVITY.md](../02-flows/FLOW-INACTIVITY.md) §3

## 4. PHẠM VI
**✅ LÀM** — lệnh xác nhận · đếm lượt gia hạn
**❌ LÀM SAU** — đếm ngược 30 giây (102)

## 5. CÁC BƯỚC
1. `POST /matches/:id/commands/confirm-alive` — qua **cùng** đường xử lý lệnh (issue 085)
2. **Luật**:
   | ID | Nội dung |
   |---|---|
   | `BR-INA-02` | Xác nhận thành công ⇒ mốc tiếp theo = **thời điểm xác nhận hợp lệ + 3 phút** (`DEC-027`) |
   | `BR-INA-03` | Tối đa **2 lần liên tiếp** |
   | `BR-INA-04` | **Đi được một nước** ⇒ `extensionsUsed = 0` |
   | `BR-INA-05` | Hết lượt gia hạn ⇒ lần treo sau **vào thẳng đếm ngược**, **không hỏi** |
3. ⭐ **`BR-INA-10`, `BR-INA-14`** — chỉ **bên đến lượt** xác nhận được. **Mọi tab** của người đó đều bấm được (`DEC-020`)
4. **Bấm hai lần** ⇒ chỉ cộng **một lần** 3 phút (nhờ biên lai lệnh)
5. **Timeline theo DEC-027**: hỏi 3:00 → xác nhận 3:29 → hỏi 6:29 → xác nhận 6:58 → đếm cuối 9:58 → thua 10:28. Không reconnect/undo: tổng với hai lần xác nhận = 570 + d1 + d2 giây, 0 ≤ d1,d2 < 30; không giữ trần cố định 9:30.
6. Xác nhận **sau** hạn ⇒ **từ chối**, ván đã kết thúc

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T101-01` | ⭐ **Xác nhận tại 3:29 → cảnh báo tiếp theo 6:29**, chưa cảnh báo ở 6:00 |
| `T101-02` | ⭐ **Gia hạn lần 2 → thành công** |
| `T101-03` | ⭐ **Lần treo thứ 3 → KHÔNG hỏi, vào thẳng đếm ngược** |
| `T101-04` | ⭐ **Gia hạn 2 lần, ĐI MỘT NƯỚC, treo lại → LẠI CÓ ĐỦ 2 lần** |
| `T101-05` | ⭐ **Đối thủ bấm xác nhận → FORBIDDEN** |
| `T101-06` | ⭐ **Người xem bấm xác nhận → FORBIDDEN** |
| `T101-07` | ⭐ **Bấm 2 lần → chỉ cộng MỘT lần 3 phút** |
| `T101-08` | ⭐ **Mọi tab đều xác nhận được** (`DEC-020`) |
| `T101-09` | Xác nhận **sau** hạn → **từ chối** |
| `T101-10` | ⭐ **Đi nước trong lúc đang hỏi → coi như đã xác nhận, KHÔNG tính là gia hạn** |
| `T101-11` | ⭐ **Hai xác nhận đều trễ 29 giây → thua tại 10:28; xác nhận ngay cả hai → 9:30; sát hạn vẫn theo công thức DEC-027** — đồng hồ giả, không reconnect/undo |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 11 test xanh với đồng hồ giả
- [ ] **`T101-03`** hết lượt thì không hỏi nữa
- [ ] **`T101-04`** reset khi đi nước — **điểm mấu chốt của `DEC-011`**
- [ ] **`T101-07`** không cộng trùng
- [ ] **`T101-11`** đạt các timeline DEC-027, không dùng trần cố định 9:30

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-101.md` — dòng thời gian đầy đủ của kịch bản tối đa.

## 9. ⚠ CẠM BẪY
Đếm **tổng cả ván** thay vì **liên tiếp** sẽ **phạt oan** người chơi chậm trong ván dài: họ đi cờ bình thường nhưng vài lần suy nghĩ lâu là hết lượt gia hạn. `T101-04` kiểm đúng điểm này.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-101

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/server/src/modules/matches/inactivity.service.ts.
- **File test:** `tests/integration/issue-101.test.ts`.
- **Nhận từ phụ thuộc:** 100 phase/deadline,085 command receipt,087 move.
- **Bàn giao:** confirm-alive chỉ current PLAYER trước deadline; deadline=accepted At+180000; counter<=2; idempotent.
- **Trình tự xử lý tối thiểu:** Giữ phase/counter/version trong locked command transaction; receipt trước side effect; confirm đòi PROMPTING và remaining extension; move không tính confirm extension.

### Chuẩn bị và oracle từng nhóm ca

**Given:** ONLINE unlimited t 0; 3 tab A; opponent B/S1; set clock 209000 và 418000 cho 2 confirm.

| ID test (tiền tố T101 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–04,10–11` | Confirm 3:29 rồi 6:58; advance 6:00,6:29,9:58; valid move ởfixture khác | Next warning 389000 rồi 598000; third COUNTDOWN deadline 628000; valid move reset 0.101 kiểm deadline này,102/T102-01 kiểm terminal thực 628000. |
| `05–09` | B/S1 forged command; A hai command id/cùng id race; deadline−1/0/+1 | B/S1 FORBIDDEN no mutation; chỉ 1 extension; đúng/sau hạn reject; không tự dời deadline bằng retry. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence101 = { firstNextWarning: number; secondNextWarning: number; finalDeadline: number; extensionsUsed: number };

export function assertIssue101KeyCase(actual: Evidence101): void {
  expect(actual).toMatchObject({firstNextWarning:389000,secondNextWarning:598000,finalDeadline:628000,extensionsUsed:2});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Lấy warning At thay accepted At cho+180000 hoặc tăng counter trên retry; T101-01/07 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-101.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:integration -- tests/integration/issue-101.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 102 dùng deadline 628000 và 570000 (confirm ngay) để chứng minh terminal; 103 copy phase/counter.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-INA-07` | [REQ-INACTIVITY](../01-requirements/REQ-INACTIVITY.md) | LOCAL |
| `AC-INA-11` | [REQ-INACTIVITY](../01-requirements/REQ-INACTIVITY.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
