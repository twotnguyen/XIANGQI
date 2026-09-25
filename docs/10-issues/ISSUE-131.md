# ISSUE-131 — Trợ năng + WCAG AA + DT-21

**Nhóm:** E20 · **Phụ thuộc:** 130 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Đạt **WCAG 2.1 mức AA** và bảo đảm **hai phe phân biệt được không cần màu**.

## 2. ĐỌC TRƯỚC
[../03-screens/design-tokens.md](../03-screens/design-tokens.md) **§2 (bảng số đo), §4, `DT-21`** · [../07-decisions/decision-log.md](../07-decisions/decision-log.md) `DEC-024`

## 3. PHẠM VI
**✅ LÀM** — kiểm tương phản · trợ năng · `DT-21`

## 4. CÁC BƯỚC
1. **Chuẩn WCAG 2.1 AA**: chữ thường **4,5:1** · chữ lớn và đối tượng đồ hoạ **3:1**
2. ⭐ **Bảng màu đã được ĐO và ĐẠT** (`DEC-024`). **Kiểm lại** để bảo đảm không ai đổi màu:
   | Cặp | Đo được | Cần |
   |---|---:|---:|
   | Chữ mực / nền giấy | 12,95:1 | 4,5 |
   | Quân **đỏ** / gỗ | **3,62:1** | 3,0 |
   | Quân đen / gỗ | 7,87:1 | 3,0 |
   | Viền tiêu điểm / gỗ | **3,54:1** | 3,0 |
   ⚠ Hai cặp in đậm **sát ngưỡng** — đổi màu là hỏng
3. ⭐ **`DT-21` — dấu hiệu phân biệt hai phe KHÔNG phụ thuộc màu và chữ**
   Lý do: đỏ so với đen chỉ **2,17:1**, và **3/7 cặp chữ gần giống**: 仕/士 · 傌/馬 · 俥/車
4. **`DT-01`** — ⛔ **không** trạng thái nào chỉ truyền đạt bằng màu
5. **`DT-04`** — mọi quân có nhãn trợ năng tiếng Việt
6. **`DT-06`** — dùng được **hoàn toàn bằng bàn phím**
7. **`DT-09`** — viền tiêu điểm **luôn nhìn thấy**

## 5. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T131-01` | ⭐ **Đo tương phản TOÀN BỘ cặp màu → đạt WCAG AA** |
| `T131-02` | ⭐ **Quân đỏ / gỗ ≥ 3:1** (đang 3,62 — sát ngưỡng) |
| `T131-03` | ⭐ **Viền tiêu điểm / gỗ ≥ 3:1** (đang 3,54 — sát ngưỡng) |
| `T131-04` | ⭐ **Giả lập mù màu đỏ–lục → phân biệt được hai phe** |
| `T131-05` | ⭐ **Giả lập mù màu: phân biệt được Sĩ, Mã, Xe** (3 cặp chữ gần giống) |
| `T131-06` | ⭐ **Không trạng thái nào chỉ dùng màu** — rà toàn bộ |
| `T131-07` | Mọi quân có nhãn trợ năng tiếng Việt đúng |
| `T131-08` | ⭐ **Dùng được hoàn toàn bằng bàn phím** — đi một nước, gửi chat, mở menu |
| `T131-09` | Viền tiêu điểm **luôn thấy** ở mọi phần tử |
| `T131-10` | Trình đọc màn hình đọc được nội dung chính |
| `T131-11` | Tôn trọng `prefers-reduced-motion` |

## 6. ⛔ ĐIỀU KIỆN PASS
- [ ] **`T131-01`** toàn bộ cặp màu đạt AA
- [ ] **`T131-04`, `T131-05`** — `DT-21` có hiệu lực
- [ ] **`T131-06`** không chỉ dùng màu
- [ ] **`T131-08`** bàn phím đầy đủ
- [ ] Báo cáo có **bảng tỉ lệ tương phản đo được**

## 7. BẰNG CHỨNG
`docs/test-reports/ISSUE-131.md` — bảng đo + **ảnh chụp ở chế độ giả lập mù màu**.

## 8. ⚠ CẠM BẪY
Hai cặp màu đang **sát ngưỡng** (3,62 và 3,54 so với 3,0). Bất kỳ ai *"chỉnh màu cho đẹp hơn"* đều có thể làm rớt chuẩn. `T131-02` và `T131-03` là chốt chặn.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-131

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/web/src/styles/tokens.css; apps/web/src/components/board/Piece.tsx; tests/e2e/issue-131.spec.ts.
- **File test:** `tests/e2e/issue-131.spec.ts`.
- **Nhận từ phụ thuộc:** 130 complete UI; DT-01/04/06/09/21; DEC-024 canonical palette.
- **Bàn giao:** WCAG 2.1 AA evidence per rendered color pair; labels Vietnamese; side shape cue ngoài color/chữ; keyboard end-to-end.
- **Trình tự xử lý tối thiểu:** Check actual token usage rather than palette only; keep piece cue structural accessible; keyboard board roving tab index does not create 90 stops; manual screen reader evidence riêng automation semantic.

### Chuẩn bị và oracle từng nhóm ca

**Given:** Computed colors từ thực DOM,all states; 7 piece kinds× 2 sides; normal/red-green deficiency/reduced-motion; keyboard only.

| ID test (tiền tố T131 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–03` | Tính luminance/contrast từ computed foreground/background kể alpha; normal/large/text/graphic | Regular text≥4.5; large/graphic/focus≥3; red/wood và focus/wood đo riêng; report actual values không copy 3.62/3.54 blindly. |
| `04–07` | Color-deficiency capture; Sĩ/Mã/Xe đôi và mọi status; accessibility tree | Hai phe phân biệt bằng dấu ngoài màu/chữ; state có text/icon; mọi quân nhãn đúng kind/side VN. |
| `08–11` | Tab/arrow/Enter move,chat,menu/dial og; screen reader đọc; reduced motion | Complete flows không mouse; focus visible/not trapped; screen reader labels/live updates đúng; motion reduced without breaking state. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from '@playwright/test';

type Evidence131 = { minNormalTextContrast: number; redWoodContrast: number; focusWoodContrast: number; keyboardFlowComplete: boolean };

export function assertIssue131KeyCase(actual: Evidence131): void {
  expect(actual.minNormalTextContrast).toBeGreaterThanOrEqual(4.5); expect(actual.redWoodContrast).toBeGreaterThanOrEqual(3); expect(actual.focusWoodContrast).toBeGreaterThanOrEqual(3); expect(actual.keyboardFlowComplete).toBe(true);
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Xoá non-color cue hoặc focus outline; T131-04/05/09 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-131.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:e2e -- tests/e2e/issue-131.spec.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:e2e
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 132 disabled reason/dial og scope; 136 TS-UI evidence.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-BRD-15` | [REQ-BOARD](../01-requirements/REQ-BOARD.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
