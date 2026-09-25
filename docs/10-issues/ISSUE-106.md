# ISSUE-106 — Đi lại: dựng lại bàn cờ + đếm lặp

**Nhóm:** E15 · **Phụ thuộc:** 105, 088, 025, 100 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Đi lại **lùi đúng số nước**, dựng lại bàn cờ và **bộ đếm lặp từ nhánh mới** — và **không hoàn thời gian**.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-GAME-ACTIONS.md](../01-requirements/REQ-GAME-ACTIONS.md) **§6, §10 `BR-ACT-03`, `BR-ACT-09..12`**

## 3. PHẠM VI
**✅ LÀM** — áp dụng đi lại · dựng lại trạng thái
**❌ KHÔNG LÀM** — giao diện (107) · đi lại với máy (122)

## 4. FILE TẠO
`apps/server/src/modules/matches/undo.service.ts`

## 5. CÁC BƯỚC
1. ⭐ **`BR-ACT-03` — lùi bao nhiêu**: luôn về **ngay trước nước gần nhất của NGƯỜI XIN**
   | Tình huống | Lùi |
   |---|---|
   | Đối thủ **chưa** đáp lại | **1** nửa nước |
   | Đối thủ **đã** đáp lại | **2** nửa nước |
   > Ví dụ: A đi nước 10, B đáp nước 11, A xin đi lại ⇒ lùi **2 nửa nước**, về trước nước 10, đến lượt **A**
2. **Thực hiện** — chỉ **dời `head_move_id`** về nước cha tương ứng. ⛔ **Không xoá** nước nào (`BR-ACT-12`)
3. ⭐ **`BR-ACT-11`** — **dựng lại bộ đếm lặp từ nhánh mới**. Số đếm của nhánh bị bỏ **không** giữ lại
4. ⭐ **`BR-ACT-09`** — **KHÔNG hoàn thời gian**. Tính đủ thời gian đã trôi tới lúc xử lý, giữ số dư còn lại của từng bên, rồi chuyển bên chạy đồng hồ theo **vị trí được khôi phục**
5. ⭐ **`BR-ACT-10`** — **phiên bản vẫn TĂNG**, dù `ply` giảm
6. **`BR-ACT-13`** — ván đã kết thúc **không** đi lại được
7. Ghi sự kiện `UNDO` với: danh sách nước bị bỏ · ply đích · người xin · người duyệt

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T106-01` | ⭐ **Đối thủ chưa đáp → lùi 1 nửa nước** |
| `T106-02` | ⭐ **Đối thủ đã đáp → lùi 2 nửa nước**, đến lượt người xin |
| `T106-03` | ⭐ **Nước bị bỏ VẪN CÒN trong cơ sở dữ liệu** |
| `T106-04` | ⭐ **Đi nước MỚI sau khi đi lại → THÀNH CÔNG** |
| `T106-05` | ⭐ **Bộ đếm lặp DỰNG LẠI từ nhánh mới**, nhánh bỏ không tính |
| `T106-06` | ⭐ **Lặp 3 lần trên nhánh đã bỏ → KHÔNG kích hoạt hoà** |
| `T106-07` | ⭐ **Thời gian KHÔNG được hoàn** — số dư trước và sau **bằng nhau** (trừ thời gian trôi) |
| `T106-08` | ⭐ **Phiên bản TĂNG** dù `ply` giảm |
| `T106-09` | Đồng hồ chuyển bên theo **vị trí khôi phục**, không đổi hai lần |
| `T106-10` | Ván đã kết thúc → **từ chối** đi lại |
| `T106-11` | Đi lại về nước đầu ván → thế cờ **ban đầu** |
| `T106-12` | Đi lại **hai lần liên tiếp** → nhánh đúng |
| `T106-13` | ⭐ **Mốc treo ván bắt đầu lại**, `extensionsUsed` **giữ nguyên** |
| `T106-14` | Sự kiện `UNDO` ghi đủ thông tin |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 14 test xanh trên PostgreSQL thật
- [ ] **`T106-04`** — **lỗi F-01 lần trước**
- [ ] **`T106-05`, `T106-06`** — **lỗi F-02 lần trước**
- [ ] **`T106-07`** không hoàn thời gian
- [ ] **`T106-08`** phiên bản chỉ tăng

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-106.md` — sơ đồ cây trước và sau khi đi lại + đi nước mới.

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| Đi nước mới sau đi lại gây **lỗi trùng khoá → lỗi 500** (`F-01`) | `T106-04` |
| Đếm lặp tính cả nhánh đã bỏ → **báo hoà sai** (`F-02`) | `T106-05`, `T106-06` |

**Hoàn thời gian khi đi lại** tạo lỗ hổng: người sắp hết giờ liên tục xin đi lại để **câu giờ**. `BR-ACT-09` cấm — `T106-07` kiểm.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-106

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/server/src/modules/matches/undo.service.ts.
- **File test:** `tests/integration/issue-106.test.ts`.
- **Nhận từ phụ thuộc:** 105 accepted UNDO; 088 move tree; 025 repetition; 092 clock; 100 inactivity.
- **Bàn giao:** Apply undo dời head về parent nước cuối requester; reconstruct position/counts chỉ active branch; version tăng,clock không hoàn.
- **Trình tự xử lý tối thiểu:** Tìm ancestor trước latest requester move từ head, không ORDER BY ply toàn bộ table; settle clock hiện tại; rebuild counts bằng replay root→target; write head+position+version+event trong transaction.

### Chuẩn bị và oracle từng nhóm ca

**Given:** Seed legal tree root→a→b→c→d; requester A last move c; bỏc,d rồi new e,f; counts branch bỏ có lần thứ 3.

| ID test (tiền tố T106 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–06,11–12,14` | Undo trước/sau opponent reply; new move sau undo; repeated undo; đọc DB tree/events | Lùi 1 hoặc 2; rows c,d còn; new branch không unique conflict; discarded repetition không draw; UNDO event lưu ids/requester/approver. |
| `07–10,13` | Settle tại now khi approve; compare balance; terminal denial; extensionsUsed 2 | Không lấy clock từ historical position; restored Side chạy,version tăng dù ply giảm; inactivity mốc now nhưng counter giữ 2; terminal không write. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence106 = { abandonedRowsRetained: number; newBranchInsertSucceeded: boolean; falseRepetitionDraw: boolean; versionDelta: number; extensionsUsed: number };

export function assertIssue106KeyCase(actual: Evidence106): void {
  expect(actual).toMatchObject({abandonedRowsRetained:2,newBranchInsertSucceeded:true,falseRepetitionDraw:false,versionDelta:1,extensionsUsed:2});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Đếm mọi match_moves hoặc restore clock snapshot cũ; T106-05/06/07 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-106.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:integration -- tests/integration/issue-106.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 122 reuse pure reconstruction; 126 replay chỉ head chain; 127 new game khác undo.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-MAT-07` | [REQ-MATCH](../01-requirements/REQ-MATCH.md) | LOCAL |
| `AC-MAT-11` | [REQ-MATCH](../01-requirements/REQ-MATCH.md) | LOCAL |
| `AC-MAT-12` | [REQ-MATCH](../01-requirements/REQ-MATCH.md) | LOCAL |
| `AC-CLK-09` | [REQ-CLOCK](../01-requirements/REQ-CLOCK.md) | LOCAL |
| `AC-ACT-08` | [REQ-GAME-ACTIONS](../01-requirements/REQ-GAME-ACTIONS.md) | LOCAL |
| `AC-ACT-09` | [REQ-GAME-ACTIONS](../01-requirements/REQ-GAME-ACTIONS.md) | LOCAL |
| `AC-ACT-10` | [REQ-GAME-ACTIONS](../01-requirements/REQ-GAME-ACTIONS.md) | LOCAL |
| `AC-ACT-11` | [REQ-GAME-ACTIONS](../01-requirements/REQ-GAME-ACTIONS.md) | LOCAL |
| `AC-ACT-12` | [REQ-GAME-ACTIONS](../01-requirements/REQ-GAME-ACTIONS.md) | LOCAL |
| `AC-ACT-13` | [REQ-GAME-ACTIONS](../01-requirements/REQ-GAME-ACTIONS.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
