# ISSUE-130 — Responsive 360 · 390 · 1366 · 1920

**Nhóm:** E20 Hoàn thiện · **Phụ thuộc:** 091, 111, 116, 055, 060, 067, 072, 077, 094, 099, 103, 107, 123, 129 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Toàn bộ ứng dụng dùng được ở **bốn kích thước** nghiệm thu.

## 2. ĐỌC TRƯỚC
[../03-screens/design-tokens.md](../03-screens/design-tokens.md) **§6, §7, §8**

## 3. PHẠM VI
**✅ LÀM** — rà soát và sửa responsive **mọi màn hình**

## 4. CÁC BƯỚC
1. Bốn kích thước bắt buộc: **360×800** · **390×844** · **1366×768** · **1920×1080**
2. ⭐ **`DT-15`** — ⛔ **KHÔNG TRÀN NGANG** ở bất kỳ kích thước nào, bất kỳ màn nào
3. **Năm quy tắc bố cục** (`DT` §8) — kiểm từng cái:
   | # | Luật |
   |---|---|
   | 1 | Camera/mic **không đè** bàn cờ |
   | 2 | Thông báo tạm **không che** nút Đầu hàng |
   | 3 | Nhãn khung chat **ghi rõ** kênh nào |
   | 4 | Đồng hồ **luôn nhìn thấy** khi đang chơi |
   | 5 | Ở 360px **không có cuộn ngang** |
4. **Điện thoại**: bàn cờ **toàn chiều ngang** · chat/camera vào **tab riêng** · thanh lượt/đồng hồ **dính**
5. ⭐ **`DT-14`** — bàn phím ảo mở ra **không** ép bàn cờ gây cuộn ngang
6. **`DT-07`** — vùng chạm nút ≥ **44 px**

## 5. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T130-01` | ⭐ **MỌI màn hình ở cả 4 kích thước → KHÔNG tràn ngang** |
| `T130-02` | ⭐ **Media không đè bàn cờ** ở máy tính |
| `T130-03` | ⭐ **Thông báo tạm không che nút Đầu hàng** |
| `T130-04` | Nhãn khung chat rõ ràng |
| `T130-05` | ⭐ **Đồng hồ luôn thấy** khi cuộn ở điện thoại |
| `T130-06` | ⭐ **360px: bàn cờ toàn chiều ngang, dùng được** |
| `T130-07` | Điện thoại: chat và camera ở **tab riêng** |
| `T130-08` | ⭐ **Bàn phím ảo mở → KHÔNG cuộn ngang** |
| `T130-09` | Vùng chạm nút ≥ 44 px |
| `T130-10` | Bàn cờ giữ **đúng tỉ lệ** ở mọi kích thước |
| `T130-11` | Cửa sổ và hộp thoại vừa màn hình ở 360px |

## 6. ⛔ ĐIỀU KIỆN PASS
- [ ] **`T130-01`** — **toàn bộ** màn hình, **cả 4** kích thước
- [ ] Năm quy tắc bố cục đều đạt
- [ ] `T130-08` bàn phím ảo
- [ ] Vùng chạm ≥ 44 px
- [ ] Báo cáo có **ảnh chụp mọi màn ở cả 4 kích thước**

## 7. BẰNG CHỨNG
`docs/test-reports/ISSUE-130.md` — bảng ảnh chụp đầy đủ.

## 8. ⚠ CẠM BẪY
Tràn ngang ở 360px là lỗi phổ biến nhất — thường do bảng dữ liệu hoặc chuỗi dài không ngắt. Test tự động kiểm `scrollWidth > clientWidth` ở **mọi** màn.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-130

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/web/src/styles/tokens.css; CSS Modules của từng màn trong screen-inventory; tests/e2e/issue-130.spec.ts.
- **File test:** `tests/e2e/issue-130.spec.ts`.
- **Nhận từ phụ thuộc:** Tất cả UI dependencies trong header; design-tokens§6–8; 36 screen inventory.
- **Bàn giao:** Responsive matrix 36 screens× 4 viewports + five layout rules; không tự đổi token đã chốt.
- **Trình tự xử lý tối thiểu:** Sửa CSS Module đúng màn gây lỗi, min-width:0/overflow-wrap cho chuỗi dài; không hide nội dung thiết yếu bằng overflow:hidden để qua assert; kiểm 4 sizes sau mỗi sửa layout.

### Chuẩn bị và oracle từng nhóm ca

**Given:** 360 × 800,390 × 844,1366 × 768,1920 × 1080; mỗi màn dùng dữ liệu dài nhất hợp lệ, lỗi/loading/empty và modal liên quan.

| ID test (tiền tố T130 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01,06–07,10–11` | Mở từngmànở 4 sizes; board orientation 2 sides; dial og; dài Unicode | scroll Width≤client Width ởdocument/containers; board 9 × 10 geometry giữ; mobile board full width/chat media tabs; dial og within view port. |
| `02–05,09` | Get bounding box es media/board/toast/resign; scroll mobile; hit-test center of button | No overlap; resign actually receives pointer; clock visible; touch target≥44 px; labels rõ. |
| `08` | Trên thiết bị mobile thật mở bàn phím ảo và focus chat/form | Visual view port ghi được thật; không overflow/reflow ép board; desktop resize riêng không đủ bằng chứng keyboard. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from '@playwright/test';

type Evidence130 = { screensChecked: number; viewportsChecked: number; overflowScreens: number; boardMediaOverlaps: number; smallestTouchTargetPx: number };

export function assertIssue130KeyCase(actual: Evidence130): void {
  expect(actual).toMatchObject({screensChecked:36,viewportsChecked:4,overflowScreens:0,boardMediaOverlaps:0}); expect(actual.smallestTouchTargetPx).toBeGreaterThanOrEqual(44);
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Đặt min-width:400 px cho chat panel; T130-01 mobile phải đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-130.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:e2e -- tests/e2e/issue-130.spec.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:e2e
```

**Chặn riêng của issue:** Thiếu thiết bị/browser mở keyboard thật ⇒ phần keyboard BLOCKED; không đánh đồng screenshot view port với thực nghiệm keyboard.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 131 contrast/keyboard; 13236 × 5 state matrix.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-BRD-12` | [REQ-BOARD](../01-requirements/REQ-BOARD.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
