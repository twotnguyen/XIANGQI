# ISSUE-132 — Trạng thái màn hình đầy đủ

**Nhóm:** E20 · **Phụ thuộc:** 131 · **Trạng thái:** TODO

## 1. MỤC TIÊU
**Mọi** màn hình được đối chiếu **5 trạng thái** theo [screen-states](../03-screens/screen-states.md), và mọi nút vô hiệu **có giải thích**.

## 2. ĐỌC TRƯỚC
[../03-screens/screen-inventory.md](../03-screens/screen-inventory.md) **§3, §4, §5, §6**

## 3. PHẠM VI
**✅ LÀM** — rà soát 36 màn hình, bổ sung trạng thái thiếu

## 4. CÁC BƯỚC
1. Đối chiếu **năm trạng thái** cho từng màn theo screen-inventory; chỉ ghi N/A khi canonical xác định không áp dụng và có lý do cụ thể (không tạo UI giả chỉ để đủ ô):
   | Trạng thái | Yêu cầu |
   |---|---|
   | Đang tải | khung xương, ⛔ **không** để trắng trơn |
   | **Trống** | giải thích **vì sao** + gợi ý hành động tiếp |
   | Lỗi | nói rõ lỗi + nút **Thử lại** |
   | **Vô hiệu** | ⭐ **BẮT BUỘC giải thích vì sao** |
   | Thành công | dữ liệu bình thường |
2. ⭐ **`SCR-RULE-01`** — trạng thái **vô hiệu không giải thích** là **lỗi sản phẩm**
3. **`SCR-RULE-02`** — mọi cửa sổ đóng được bằng **X · Esc · bấm ra ngoài**, **trừ bốn trạng thái không đóng tuỳ ý**:
   `SCR-INACTIVITY-PROMPT` · `SCR-RECONNECTING` · `SCR-VERIFY-NOTICE` · `SCR-ONBOARDING`
4. **`SCR-RULE-03`** — xác nhận việc **không đảo ngược được** phải ghi rõ hậu quả
5. **`SCR-RULE-04`** — nút gửi **vô hiệu khi đang xử lý**
6. Rà **đủ 36 màn hình** theo `screen-inventory` + `screen-states`; X/Esc khung đề nghị chỉ thu gọn UI, không huỷ pending; kiểm mở lại được và deadline vẫn chạy (SCR-RULE-06/07).

## 5. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T132-01` | ⭐ **MỌI màn có tải bất đồng bộ có trạng thái đang tải; ô khác N/A đúng canonical** |
| `T132-02` | ⭐ **MỌI màn có danh sách có trạng thái TRỐNG + giải thích** |
| `T132-03` | ⭐ **MỌI màn có lỗi phục hồi được có hành động thử lại; lỗi terminal chỉ đường ra hợp lệ theo canonical** |
| `T132-04` | ⭐ **MỌI nút vô hiệu CÓ GIẢI THÍCH** |
| `T132-05` | ⭐ **Mọi cửa sổ (trừ 4) đóng được bằng X, Esc, bấm ra ngoài** |
| `T132-06` | ⭐ **Đúng bốn trạng thái không đóng tuỳ ý; cảnh báo chống treo không modal, vẫn đi nước/đầu hàng và truy cập bàn phím được** |
| `T132-07` | ⭐ **6 xác nhận bắt buộc ghi rõ hậu quả** (`screen-inventory` §6) |
| `T132-08` | Nút gửi vô hiệu khi đang xử lý, bấm 2 lần chỉ gửi 1 |
| `T132-09` | Thông báo lỗi bằng **tiếng Việt**, nêu **cách sửa** |
| `T132-10` | Rà đủ **36 màn hình** |

## 6. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 10 test xanh
- [ ] **`T132-04`** — **không** nút vô hiệu nào thiếu giải thích
- [ ] **`T132-06`** đúng bốn trạng thái không đóng tuỳ ý
- [ ] **`T132-07`** đủ 6 xác nhận
- [ ] Báo cáo có **bảng 36 màn × 5 trạng thái**

## 7. BẰNG CHỨNG
`docs/test-reports/ISSUE-132.md` — bảng đối chiếu đầy đủ.

## 8. ⚠ CẠM BẪY
Nút vô hiệu **không giải thích** là lỗi hay bị bỏ qua nhất — người dùng bấm không được mà không biết phải làm gì. `SCR-RULE-01` coi đây là **lỗi sản phẩm**, không phải chi tiết nhỏ.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-132

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** tests/e2e/issue-132.spec.ts; apps/web/src/features/* CSS Modules và màn thiếu trạng thái được định danh trong report.
- **File test:** `tests/e2e/issue-132.spec.ts`.
- **Nhận từ phụ thuộc:** 131 full UI; screen-states canonical 36 × 5; screen-inventory§3–6.
- **Bàn giao:** Trace 36 screens×loading/empty/error/disabled/success; đúng 4 non dismissible states và 6 irreversible confirmations.
- **Trình tự xử lý tối thiểu:** Bảng fixtures có screen ID/state/entry/action/assertion/evidence; N/A phải cite canonical và reason; không tạo fake loading/empty ởmàn tĩnh chỉ để đủ bảng; test IDs có parameter name từng màn.

### Chuẩn bị và oracle từng nhóm ca

**Given:** Danh mục 36 screen IDs lấy canonical; map mỗi trạng thái tới fixture thực; lỗi phục hồi và terminal riêng; no invented N/A.

| ID test (tiền tố T132 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–04,09–10` | Visit từng state có áp dụng; delay response/error response control led; empty real data; disable by business rule | Skeleton không trắng; empty có next step; recoverable Retry đúng; terminal đường ra; disabled reason liên kết control, không chỉ tool tip vô hình; Vietnamese. |
| `05–08` | X/Esc/backdrop mỗi dial og; 4 exceptions; proposal collapse; 6 confirmations; rapid 2 click | Only 4 exceptions không dismiss; inactivity non-modal vẫn board/resign; collapse không withdraw; consequence explicit; 1 request while sub mitting. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from '@playwright/test';

type Evidence132 = { screenRows: number; missingApplicableStates: number; unexplainedDisabledControls: number; nonDismissibleStates: number; explicitConfirmations: number };

export function assertIssue132KeyCase(actual: Evidence132): void {
  expect(actual).toMatchObject({screenRows:36,missingApplicableStates:0,unexplainedDisabledControls:0,nonDismissibleStates:4,explicitConfirmations:6});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Bỏ reason của 1 disabled control hoặc Esc inactivity dismiss; T132-04/06 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-132.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:e2e -- tests/e2e/issue-132.spec.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:e2e
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 133 authz direct API không dùng UI matrix thay proof; 136 complete 36 screens.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
