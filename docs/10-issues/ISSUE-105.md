# ISSUE-105 — Đề nghị hoà / đi lại + hết hạn 30 giây

**Nhóm:** E15 · **Phụ thuộc:** 104 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Cơ chế đề nghị dùng chung cho **xin hoà** và **xin đi lại** — tối đa **một** đề nghị chờ mỗi ván.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-GAME-ACTIONS.md](../01-requirements/REQ-GAME-ACTIONS.md) §5.2, §5.3, §10 · [../05-data-and-realtime/state-machines.md](../05-data-and-realtime/state-machines.md) §3

## 3. PHẠM VI
**✅ LÀM** — tạo · trả lời · hết hạn · vô hiệu hoá
**❌ LÀM SAU** — dựng lại bàn cờ khi đi lại (106)

## 4. FILE TẠO
`apps/server/src/modules/matches/proposal.service.ts`

## 5. CÁC BƯỚC
1. Hai lệnh: `propose` (`{kind: DRAW|UNDO}`) và `respond` (`{proposalId, accept}`)
2. **Luật**:
   | ID | Nội dung |
   |---|---|
   | `BR-ACT-04` | Tối đa **một** đề nghị chờ mỗi ván (dùng chung cho cả hai loại) |
   | `BR-ACT-05` | Hết hạn **30 giây** |
   | `BR-ACT-06` | Giới hạn **1 đề nghị / 10 giây / người** |
   | `BR-ACT-07` | **Không tự chấp nhận** đề nghị của chính mình |
   | `BR-ACT-08` | **Nước đi mới** làm đề nghị **mất hiệu lực** |
   | `BR-ACT-14` | Xin đi lại: người xin **phải đã đi ít nhất một nước** trên nhánh hiện tại |
   | `BR-ACT-16` | Đề nghị chờ **KHÔNG** tạm dừng đồng hồ |
3. **`BR-ACT-02`** — xin hoà **chỉ có ở ván online**. Ván với máy **không có** chức năng này
4. Tạo đề nghị ⇒ **tăng phiên bản**, ghi sự kiện
5. **Bộ đếm hết hạn chủ động** (`ARCH-08`) — hết 30 giây tự chuyển `EXPIRED`, tăng phiên bản, phát trạng thái
6. Đồng ý hoà ⇒ `finalizeMatch` với `AGREED_DRAW`, winner **null**
7. **`BR-ACT-17`** — trả lời lặp lại chỉ cho **một** kết quả

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T105-01` | Xin hoà → đồng ý → ván **hoà** (`AGREED_DRAW`, winner null) |
| `T105-02` | Xin hoà → từ chối → ván **tiếp tục**, bàn cờ không đổi |
| `T105-03` | ⭐ **Hết 30 giây → đề nghị TỰ hết hạn** (đồng hồ giả) |
| `T105-04` | ⭐ **Đã có đề nghị chờ → tạo đề nghị thứ hai BỊ TỪ CHỐI** |
| `T105-05` | ⭐ **Tự chấp nhận đề nghị của mình → FORBIDDEN** |
| `T105-06` | ⭐ **Nước đi mới → đề nghị MẤT HIỆU LỰC** |
| `T105-07` | ⭐ **Đồng hồ VẪN CHẠY suốt lúc chờ** |
| `T105-08` | Giới hạn 1 đề nghị/10 giây có hiệu lực |
| `T105-09` | ⭐ **Xin đi lại khi CHƯA đi nước nào → TỪ CHỐI** |
| `T105-10` | ⭐ **Ván với máy: KHÔNG có chức năng xin hoà** |
| `T105-11` | ⭐ **Trả lời 2 lần → MỘT kết quả** |
| `T105-12` | Người xem tạo/trả lời đề nghị → **FORBIDDEN** |
| `T105-13` | Đồng ý hoà đúng lúc đối thủ đi nước → đồng ý **bị từ chối** |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 13 test xanh với đồng hồ giả
- [ ] **`T105-04`** một đề nghị chờ
- [ ] **`T105-05`** không tự chấp nhận
- [ ] **`T105-07`** đồng hồ không dừng
- [ ] **`T105-03`** bộ đếm **chủ động**

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-105.md`

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| **Không có bộ đếm hết hạn đề nghị 30 giây** (`F-20`) | `T105-03` — tự hết hạn, không chờ ai gửi lệnh |

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-105

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/server/src/modules/matches/proposal.service.ts.
- **File test:** `tests/integration/issue-105.test.ts`.
- **Nhận từ phụ thuộc:** 104 resign; 085/086 receipt; 093 scheduler; 008 Proposal; canonical GAME-ACTIONS withdrawal.
- **Bàn giao:** propose {kind:DRAW|UNDO}; respond {proposal Id,accept}; withdraw của requester,30 s expiry chủ động; server version tăng mỗi state mutation.
- **Trình tự xử lý tối thiểu:** Tạo partial unique pending; transaction chốt base Ply/version và expires At; expire/withdraw dùng pipeline; với UNDO chỉ giao acceptance cho 106, không giả board đã restore.

### Chuẩn bị và oracle từng nhóm ca

**Given:** A/B ONLINE ACTIVE, cả hai có nước trên current branch; thêm AI và chưa đi nước fixture; clock fake.

| ID test (tiền tố T105 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–07,09–12` | Propose/accept/reject/withdraw; self/S1 respond; move sau proposal; đồng hồ trôi 30 s | Draw accept terminal null winner; reject/withdraw/expiry không đổi board; max 1 PENDING; self/S1 forbidden; move invalidate; AI draw deny; clock không pause. |
| `03,08,11` | Proposal expires 30000:29999/30000/30001; rate limit 9999/10000/10001; retry receipt | Đúng hạn EXPIRED tự động,late accept không terminal; một proposal/10 s; retry không state event lặp lại. |
| `13` | 2 connections barrier: commit move trước responder lấy lock; riêng accept trước move | Move-trước ⇒ proposal vô hiệu/response deny; accept-trước ⇒terminal,move bị chặn. Không assert A luôn thắng do scheduling. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence105 = { pendingAt29999: number; pendingAt30000: number; statusAt30000: string; selfAcceptWrites: number };

export function assertIssue105KeyCase(actual: Evidence105): void {
  expect(actual).toMatchObject({pendingAt29999:1,pendingAt30000:0,statusAt30000:'EXPIRED',selfAcceptWrites:0});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Bỏ expire timer hoặc cho self accept; T105-03/05 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-105.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:integration -- tests/integration/issue-105.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 106 thực thi UNDO; 107 người xem thấy proposal nhưng không respond; 133 forged guard.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-CLK-07` | [REQ-CLOCK](../01-requirements/REQ-CLOCK.md) | LOCAL |
| `AC-ACT-02` | [REQ-GAME-ACTIONS](../01-requirements/REQ-GAME-ACTIONS.md) | LOCAL |
| `AC-ACT-03` | [REQ-GAME-ACTIONS](../01-requirements/REQ-GAME-ACTIONS.md) | LOCAL |
| `AC-ACT-04` | [REQ-GAME-ACTIONS](../01-requirements/REQ-GAME-ACTIONS.md) | LOCAL |
| `AC-ACT-05` | [REQ-GAME-ACTIONS](../01-requirements/REQ-GAME-ACTIONS.md) | LOCAL |
| `AC-ACT-06` | [REQ-GAME-ACTIONS](../01-requirements/REQ-GAME-ACTIONS.md) | LOCAL |
| `AC-ACT-07` | [REQ-GAME-ACTIONS](../01-requirements/REQ-GAME-ACTIONS.md) | LOCAL |
| `AC-ACT-18` | [REQ-GAME-ACTIONS](../01-requirements/REQ-GAME-ACTIONS.md) | LOCAL |
| `AC-ACT-20` | [REQ-GAME-ACTIONS](../01-requirements/REQ-GAME-ACTIONS.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
