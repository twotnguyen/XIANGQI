# ISSUE-122 — Đi lại với máy

**Nhóm:** E18 · **Phụ thuộc:** 121, 106 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Đi lại với máy **có hiệu lực ngay**, không cần đồng ý — và **huỷ việc đang tính**.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-AI.md](../01-requirements/REQ-AI.md) §6 ALT-1 · [../01-requirements/REQ-GAME-ACTIONS.md](../01-requirements/REQ-GAME-ACTIONS.md) §5.4, §10 `BR-ACT-15`

## 3. PHẠM VI
**✅ LÀM** — lệnh đi lại với máy · huỷ việc
**❌ KHÔNG LÀM** — giao diện (123)

## 4. FILE TẠO
`apps/server/src/modules/ai/undo-ai.service.ts`

## 5. CÁC BƯỚC
1. `POST /matches/:id/commands/undo-ai` — qua **cùng** đường xử lý lệnh
2. ⭐ **`BR-ACT-15`** — có hiệu lực **NGAY**, ⛔ **không** cần đề nghị, **không** cần đồng ý
3. ⭐ **Huỷ việc máy đang tính** trước khi áp dụng
4. Lùi về **ngay trước nước gần nhất của người chơi** — cùng luật `BR-ACT-03` (1 hoặc 2 nửa nước)
5. ⭐ Kết quả của máy về **sau khi** phiên bản đã đổi ⇒ **BỎ** (`BR-AI-16`)
6. Người chơi **chưa đi nước nào** ⇒ nút **vô hiệu**, lệnh bị từ chối
7. Dùng lại logic dựng lại bàn cờ và đếm lặp ở issue 106
8. **Không hoàn thời gian** (`BR-ACT-09`)

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T122-01` | ⭐ **Đi lại với máy có hiệu lực NGAY**, không cần đồng ý |
| `T122-02` | ⭐ **Đi lại KHI MÁY ĐANG TÍNH → việc bị HUỶ** |
| `T122-03` | ⭐ **Kết quả máy về sau khi đi lại → BỊ BỎ** |
| `T122-04` | Lùi đúng 1 hoặc 2 nửa nước theo `BR-ACT-03` |
| `T122-05` | ⭐ **Đếm lặp dựng lại từ nhánh mới** |
| `T122-06` | ⭐ **Đi nước MỚI sau khi đi lại → THÀNH CÔNG** |
| `T122-07` | ⭐ **Thời gian KHÔNG được hoàn** |
| `T122-08` | Chưa đi nước nào → **từ chối** |
| `T122-09` | Ván đã kết thúc → **từ chối** |
| `T122-10` | Phiên bản **tăng** |
| `T122-11` | Đi lại nhiều lần liên tiếp → nhánh đúng |
| `T122-12` | ⭐ **Sau khi đi lại, máy tính LẠI từ thế cờ mới** |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 12 test xanh
- [ ] **`T122-02`, `T122-03`** — huỷ và bỏ kết quả cũ
- [ ] **`T122-06`** đi nước mới được
- [ ] **`T122-07`** không hoàn thời gian
- [ ] `T122-01` không cần đồng ý

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-122.md`

## 9. ⚠ CẠM BẪY
Không huỷ việc đang tính ⇒ máy trả nước cho thế cờ **đã bị lùi** ⇒ áp dụng nước **sai hoàn toàn**. `T122-02` và `T122-03` là hai chốt chặn.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-122

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/server/src/modules/ai/undo-ai.service.ts.
- **File test:** `tests/integration/issue-122.test.ts`.
- **Nhận từ phụ thuộc:** 121 AI Match; 119 cancel; 106 undo reconstruct; 085 receipt.
- **Bàn giao:** POST /matches/:id/commands/undo-ai immediate; fenced job/version before restored head; one/two ply; no proposal.
- **Trình tự xử lý tối thiểu:** Underlock invalidate job/version and settle clock,commit restored head using 106; signal cancel without waiting under DB lock; job result common pipeline checks new version; subsequent human move schedules fresh job.

### Chuẩn bị và oracle từng nhóm ca

**Given:** Human A makes legal move,Hard job starts and pause result delivery; save clock/version/tree; branch after human move 1 or 2 ply.

| ID test (tiền tố T122 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–04,08–12` | UNDO while THINKING, after machine reply, before human first move, after terminal; late old RESULT | Immediate no approval; 1/2 ply; not played/terminal deny; job canceled; late version ignored; new job uses restored position only when A next move gives AI turn. |
| `05–07` | Abandoned branch has third repetition; new move after undo; compare clock settled | No false DRAW; new branch insert works,old rows retained; time not refunded; version+1; repeated undos preserve tree. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence122 = { approvalRequests: number; lateResultMoves: number; newBranchInsertSucceeded: boolean; refundedMs: number; versionDelta: number };

export function assertIssue122KeyCase(actual: Evidence122): void {
  expect(actual).toMatchObject({approvalRequests:0,lateResultMoves:0,newBranchInsertSucceeded:true,refundedMs:0,versionDelta:1});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Accept late RESULT or restore historical clock; T122-03/07 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-122.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:integration -- tests/integration/issue-122.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 123 UI immediate undo; 124 never include experimental 200 ply rule in product.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-LOB-07` | [REQ-LOBBY](../01-requirements/REQ-LOBBY.md) | LOCAL |
| `AC-ACT-14` | [REQ-GAME-ACTIONS](../01-requirements/REQ-GAME-ACTIONS.md) | LOCAL |
| `AC-AI-06` | [REQ-AI](../01-requirements/REQ-AI.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
