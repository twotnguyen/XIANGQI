# ISSUE-123 — Giao diện chơi với máy

**Nhóm:** E18 · **Phụ thuộc:** 122, 091 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Màn chọn cấp độ và màn chơi với máy — phân biệt rõ **đang xếp hàng** và **đang tính**.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-AI.md](../01-requirements/REQ-AI.md) **§12** · [../02-flows/FLOW-AI.md](../02-flows/FLOW-AI.md)

## 3. PHẠM VI
**✅ LÀM** — màn chọn cấp · màn chơi với máy

## 4. FILE TẠO
`apps/web/src/features/ai/{AiSetupPage,AiGamePage}.tsx`

## 5. CÁC BƯỚC
1. **Màn chọn**: cấp độ (Dễ/Trung bình/Khó) · bên (Đỏ đi trước / Đen) · thời gian
2. ⭐ **`BR-AI-17`** — hai trạng thái **PHÂN BIỆT RÕ**:
   | Trạng thái | Hiển thị |
   |---|---|
   | Đang xếp hàng | *"Đang chờ đến lượt xử lý…"* |
   | Đang tính | *"Máy đang suy nghĩ…"* |
3. ⭐ **`BR-AI-31`** — ⛔ **KHÔNG hiện** điểm đánh giá hay đường tính của máy khi đang chơi. Đó là **mách nước**
4. **Không có** ở màn này: nút xin hoà · khung chat · khung media · danh sách người xem
5. **Trạng thái bắt buộc**: máy lỗi (báo + đang thử lại) · ván gián đoạn (*"không có người thắng"* + nút Ván mới) · ván kết thúc (+ nút **Chơi lại**)
6. Nút **Chơi lại** giữ cấp độ và thời gian, đổi bên theo lựa chọn
7. Nút **Xin đi lại** hoạt động **ngay**, không chờ đồng ý

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T123-01` | Chọn được cả 3 cấp, 2 bên, 4 cấu hình thời gian |
| `T123-02` | Chọn **đen** → máy đi trước, giao diện hiện đúng |
| `T123-03` | ⭐ **"Đang xếp hàng" và "Máy đang suy nghĩ" HIỂN THỊ KHÁC NHAU** |
| `T123-04` | ⭐ **KHÔNG hiện điểm đánh giá hay đường tính của máy** |
| `T123-05` | ⭐ **KHÔNG có nút xin hoà** |
| `T123-06` | ⭐ **KHÔNG có chat, media, danh sách người xem** |
| `T123-07` | Máy lỗi → báo rõ + đang thử lại |
| `T123-08` | Ván gián đoạn → *"không có người thắng"* + nút Ván mới |
| `T123-09` | Nút **Chơi lại** giữ cấp độ và thời gian |
| `T123-10` | Xin đi lại → **hiệu lực ngay**, không hộp thoại chờ |
| `T123-11` | Mobile 360px → không tràn ngang |
| `T123-12` | Tải lại trang → ván **vẫn còn** |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 12 test xanh ở cả 2 kích thước
- [ ] **`T123-03`** hai trạng thái phân biệt
- [ ] **`T123-04`** không mách nước
- [ ] **`T123-05`, `T123-06`** không có chức năng thừa
- [ ] `T123-10` đi lại ngay

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-123.md` — ảnh chụp cả hai trạng thái chờ.

## 9. ⚠ CẠM BẪY
Hiện điểm đánh giá *"để người dùng thấy máy nghĩ gì"* là **mách nước** — người chơi biết nước nào tốt. `BR-AI-31` cấm điều này trong lúc ván đang diễn ra.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-123

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/web/src/features/ai/AiSetupPage.tsx; apps/web/src/features/ai/AiGamePage.tsx.
- **File test:** `tests/e2e/issue-123.spec.ts`.
- **Nhận từ phụ thuộc:** 121 create/state; 122 undo; 120 job State; 091 board UI.
- **Bàn giao:** Setup 24 choices; state QUEUED/THINKING labels; no scores/PV in UI or public state; replay controls preserve level/time.
- **Trình tự xử lý tối thiểu:** Use separate jobVersion and match version gates in client store; discard older job updates even if arrive after new state; buttons request server facts not client game outcomes.

### Chuẩn bị và oracle từng nhóm ca

**Given:** Real AI game; hold 2 workers to create queue deterministic ally; induce first/second worker failure; 360/1366.

| ID test (tiền tố T123 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–06` | Select each config,BLACK human; queued then running; inspect DOM/accessibility/network DTO | Machine RED first; distinct text; no DRAW/chat/media/SPECTATOR panel; neither eval nor PV exposed. |
| `07–12` | Retry failure→interrupt,play again,undo during search,reload/mobile | First retry visible; second no human winner+Ván mới; play again default level/time preserved; undo immediate; no pending approval; reload same Match; no overflow. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from '@playwright/test';

type Evidence123 = { queueLabel: string; thinkingLabel: string; visibleScores: number; visiblePrincipalVariations: number };

export function assertIssue123KeyCase(actual: Evidence123): void {
  expect(actual).toMatchObject({queueLabel:'Đang chờ đến lượt xử lý…',thinkingLabel:'Máy đang suy nghĩ…',visibleScores:0,visiblePrincipalVariations:0});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Render result.score or reuse QUEUED text for THINKING; T123-04/03 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-123.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:e2e -- tests/e2e/issue-123.spec.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:e2e
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 124 experiment separate from UI; 130 all 4 sizes.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-INA-03` | [REQ-INACTIVITY](../01-requirements/REQ-INACTIVITY.md) | LOCAL |
| `AC-ACT-15` | [REQ-GAME-ACTIONS](../01-requirements/REQ-GAME-ACTIONS.md) | LOCAL |
| `AC-MED-16` | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) | LOCAL |
| `AC-AI-01` | [REQ-AI](../01-requirements/REQ-AI.md) | LOCAL |
| `AC-AI-02` | [REQ-AI](../01-requirements/REQ-AI.md) | LOCAL |
| `AC-AI-09` | [REQ-AI](../01-requirements/REQ-AI.md) | LOCAL |
| `AC-AI-10` | [REQ-AI](../01-requirements/REQ-AI.md) | LOCAL |
| `AC-AI-11` | [REQ-AI](../01-requirements/REQ-AI.md) | LOCAL |
| `AC-AI-12` | [REQ-AI](../01-requirements/REQ-AI.md) | LOCAL |
| `AC-AI-19` | [REQ-AI](../01-requirements/REQ-AI.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
