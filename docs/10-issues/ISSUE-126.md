# ISSUE-126 — Xem lại theo nhánh hiệu lực

**Nhóm:** E19 · **Phụ thuộc:** 125, 106 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Xem lại từng nước của ván đã kết thúc — **chỉ nhánh hiệu lực**, không hiện nhánh đã bỏ.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-HISTORY-REMATCH.md](../01-requirements/REQ-HISTORY-REMATCH.md) §10 **`BR-HIS-15`, `BR-HIS-16`, `BR-HIS-20`**

## 3. PHẠM VI
**✅ LÀM** — `GET /matches/:id/replay` · logic nhánh hiệu lực
**❌ KHÔNG LÀM** — giao diện (129)

## 4. FILE TẠO
`apps/server/src/modules/history/replay.service.ts`

## 5. CÁC BƯỚC
1. `GET /api/v1/matches/:id/replay` trả: thế cờ ban đầu · **danh sách nước của NHÁNH HIỆU LỰC** · số lần đi lại · kết quả
2. ⭐ **`BR-HIS-15`** — **CHỈ** nhánh hiệu lực cuối cùng. ⛔ Nhánh bị đi lại **KHÔNG** xuất hiện trong phần phát lại
3. ⭐ **`BR-HIS-16`** — ván có đi lại phải có **nhãn ghi rõ**
4. **`BR-HIS-20`** — ⛔ **không** làm trình biên tập cây biến thể. Chỉ một nhánh
5. **Quyền xem**:
   | Ai | Xem được gì |
   |---|---|
   | Người chơi của ván | ván đó, **mọi lúc** |
   | Người xem **đang trong phòng** | **chỉ ván hiện tại** (`BR-HIS-14`) |
   | Người khác | ⛔ **không** |
6. **`BR-HIS-17`** — bàn cờ khi xem lại là **chỉ đọc**

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T126-01` | Ván 20 nước, không đi lại → phát lại đủ **20** nước |
| `T126-02` | ⭐ **Ván CÓ ĐI LẠI → CHỈ nhánh hiệu lực**, nhánh bỏ **không** xuất hiện |
| `T126-03` | ⭐ **Ván có đi lại → có NHÃN ghi rõ** |
| `T126-04` | Số lần đi lại được trả về đúng |
| `T126-05` | ⭐ **Áp dụng tuần tự các nước → ra ĐÚNG thế cờ cuối** |
| `T126-06` | ⭐ **Người khác xem ván không phải của mình → FORBIDDEN** |
| `T126-07` | ⭐ **Người xem trong phòng xem lại ván HIỆN TẠI → được** |
| `T126-08` | ⭐ **Người xem xem ván CŨ HƠN → FORBIDDEN** |
| `T126-09` | Ván gián đoạn → phát lại được, ghi rõ không có người thắng |
| `T126-10` | Đi lại nhiều lần → nhánh hiệu lực **cuối cùng** đúng |
| `T126-11` | Ván với máy → phát lại được |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 11 test xanh
- [ ] **`T126-02`** — chỉ nhánh hiệu lực
- [ ] **`T126-05`** — áp dụng ra đúng thế cờ cuối
- [ ] **`T126-06`, `T126-08`** — kiểm quyền đúng
- [ ] `T126-03` có nhãn

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-126.md`

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| Phát lại hiện **cả nhánh đã bỏ** ⇒ người xem hiểu **sai diễn biến ván** | `T126-02` |

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-126

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/server/src/modules/history/replay.service.ts.
- **File test:** `tests/integration/issue-126.test.ts`.
- **Nhận từ phụ thuộc:** 125 participant authorization; 106 move tree; ROOM-CHAT§6 hai ngữ cảnh replay.
- **Bàn giao:** History replay chỉ Match participant; room replay chỉ FINISHED/current Match/current membership; trả initial Position+active moves+undo Count+outcome.
- **Trình tự xử lý tối thiểu:** Duyệt parent links từ head trong cùng snapshot đọc; reverse một lần; kiểm match thuộc room và current ID thay vì chỉ có membership; trả số undo từ event không suy bằng discarded row count.

### Chuẩn bị và oracle từng nhóm ca

**Given:** Tree có 2 nhánh bỏ và 20 nửa nước hiệu lực; A/B players,S1 current spectator,S2 revoked; current/old/AI/interrupted matches.

| ID test (tiền tố T126 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–05,09–11` | Replay head→root rồi áp dụng tuần tự root→head qua bộ luật; nhiều lần undo | Chỉ 20 active moves, không discarded IDs; áp dụng tái tạo đúng persisted position; undo Count/nhãn đúng; AI/interrupted đọc được theo quyền. |
| `06–08, AC-HIS-22` | S1 mở room replay rồi rematch/revoke/leave/CLOSED; forged old Match và direct history | Mỗi fetch/resume kiểm lại quyền; S1 chỉ ván hiện tại khi FINISHED, không vào history; player vẫn xem history riêng; không leak branch/chat context cũ. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence126 = { activeMoves: number; discardedMovesReturned: number; finalPositionMatches: boolean; oldMatchSpectatorAllowed: boolean };

export function assertIssue126KeyCase(actual: Evidence126): void {
  expect(actual).toMatchObject({activeMoves:20,discardedMovesReturned:0,finalPositionMatches:true,oldMatchSpectatorAllowed:false});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** ORDER BY ply toàn bảng hoặc chỉ kiểm room Id; T126-02/08 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-126.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:integration -- tests/integration/issue-126.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 127 đổi current Match invalidate room replay; 129 clear UI state khi quyền mất.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-HIS-13` | [REQ-HISTORY-REMATCH](../01-requirements/REQ-HISTORY-REMATCH.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
