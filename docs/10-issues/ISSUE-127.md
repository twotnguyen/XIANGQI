# ISSUE-127 — Tái đấu + phiếu + đổi bên

**Nhóm:** E19 · **Phụ thuộc:** 126, 065, 040 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Hai người đồng ý ⇒ tạo **ván MỚI, đổi bên**, trong **cùng phòng**.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-HISTORY-REMATCH.md](../01-requirements/REQ-HISTORY-REMATCH.md) **§5.1, §10 `BR-HIS-01..11`**

## 3. PHẠM VI
**✅ LÀM** — phiếu tái đấu · tạo ván mới · đổi bên
**❌ KHÔNG LÀM** — bộ đếm đóng phòng (128)

## 4. FILE TẠO
`apps/server/src/modules/rooms/rematch.service.ts`

## 5. CÁC BƯỚC
1. `POST /rooms/:id/rematch` nhận `{ commandId, expectedMatchId, accept }`
2. **Điều kiện hợp lệ**: phòng **đã xong** · `currentMatchId === expectedMatchId` · `now < finished_at + 10 phút` **sau khi khoá phòng** (đúng hạn close thắng) · đúng hai PLAYER của ván trước vẫn là thành viên chưa rời (DEC-032)
   - Vòng cũ ⇒ `CONFLICT` · Quá hạn ⇒ `ROOM_CLOSED`
3. **Trong cùng transaction — thứ tự khoá**: `phòng → người dùng (theo id) → ván cũ`
4. `accept: true` ⇒ ghi phiếu. `accept: false` ⇒ **xoá cả hai** phiếu vòng này
5. ⭐ **Hai phiếu đồng ý ⇒ tạo ĐÚNG MỘT ván mới**:
   ```
   ① tạo match mới
   ② ĐỔI BÊN           ← nhờ UNIQUE hoãn kiểm ở issue 037
   ③ GIỮ cấu hình thời gian
   ④ bàn cờ về thế ban đầu
   ⑤ claim active_players
   ⑥ cập nhật currentMatchId, status = PLAYING
   ⑦ tăng room_version
   ⑧ XOÁ finished_at        ← huỷ bộ đếm đóng phòng
   ⑨ xoá phiếu vòng này
   ```
6. ⭐ **`BR-HIS-07`** — **giữ lại người xem** nếu họ vẫn đủ quyền
7. ⭐ **`BR-HIS-08`** — **cả hai kênh chat MỚI, trống**; camera/mic **về Tắt**
8. ⭐ **`BR-HIS-10`** — sau khi ván mới đã tạo, lệnh tái đấu cho **vòng cũ** ⇒ **từ chối**
9. **`BR-HIS-11`** — ván **gián đoạn** tái đấu được
10. Dùng biên lai lệnh riêng cho phòng (issue 039)

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T127-01` | ⭐ **Cả hai đồng ý → tạo ĐÚNG MỘT ván mới** |
| `T127-02` | ⭐ **Ván mới ĐỔI BÊN** so với ván trước |
| `T127-03` | ⭐ **GIỮ cấu hình thời gian** |
| `T127-04` | Bàn cờ về **thế ban đầu** |
| `T127-05` | ⭐ **Hai người bấm ĐỒNG THỜI → MỘT ván mới** (rào đồng bộ) |
| `T127-06` | ⭐ **Lệnh tái đấu vòng CŨ sau khi có ván mới → TỪ CHỐI** |
| `T127-07` | ⭐ **Tái đấu XOÁ `finished_at`** — huỷ bộ đếm đóng phòng |
| `T127-08` | ⭐ **Người xem ĐƯỢC GIỮ LẠI** nếu còn quyền |
| `T127-09` | ⭐ **Cả hai kênh chat TRỐNG; camera/mic VỀ TẮT** |
| `T127-10` | Một bên từ chối → **xoá cả hai** phiếu |
| `T127-11` | Đúng hoặc quá 10 phút sau khoá → `ROOM_CLOSED` |
| `T127-12` | Đối thủ đã rời → **từ chối** |
| `T127-13` | ⭐ **Người xem bấm tái đấu → FORBIDDEN** |
| `T127-14` | Ván **gián đoạn** → tái đấu **được** |
| `T127-15` | Gửi lại cùng lệnh → trả kết quả cũ, **không** tạo hai ván |
| `T127-16` | B đã rời FINISHED: B/C xin PLAY hoặc giả mạo phiếu đều không tái đấu được; người chỉ tải lại/nối mạng khi vẫn là thành viên không bị nhầm là đã rời |
| `T127-17` | Clock tiêm: deadline−1ms/đúng deadline/+1ms; request gửi trước nhưng chờ khoá tới hạn từ chối; timer trễ không mở rộng hạn |
| `T127-18` | Rematch seal context cũ, tạo context+segment mới hai PLAYER, hai channel trống; stale send/history context cũ bị từ chối |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 18 test xanh trên PostgreSQL thật
- [ ] **`T127-02`** đổi bên (cần UNIQUE hoãn kiểm)
- [ ] **`T127-05`** với rào đồng bộ
- [ ] **`T127-06`, `T127-07`** — chống tạo nhầm và huỷ bộ đếm
- [ ] **`T127-09`** reset chat và media

### Contract bổ sung bắt buộc

ROOM-CHAT §6 là nguồn deadline; không dùng receivedAt trước lock. Tái đấu giữ membership hai PLAYER gốc chưa leave, giữ WATCH còn quyền, đổi side cùng transaction. Ngữ cảnh chat mới không xoá tin cũ bằng cascade.

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-127.md`

## 9. ⚠ CẠM BẪY
Không xoá `finished_at` khiến bộ đếm 10 phút **vẫn chạy** và **đóng phòng đang đánh ván mới**. `T127-07` và `T128` cùng chặn lỗi này.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-127

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/server/src/modules/rooms/rematch.service.ts.
- **File test:** `tests/integration/issue-127.test.ts`, `tests/unit/issue-127.test.ts`.
- **Nhận từ phụ thuộc:** 126/065 lifecycle; 039 room receipts; 040 contexts; ROOM-CHAT§6.
- **Bàn giao:** POST /rooms/:id/rematch {command Id,expectedMatchId,accept}; one new Match, đổi side, giữ timeControl, fresh chat context, finished_at null.
- **Trình tự xử lý tối thiểu:** Lock room→profiles sorted→old Match; clock sau lock; check receipts/current Match/membership; transaction tạo Match+claim active_players+swap deferred unique+fresh context+clear finished At+room Version; commit rồi notify.

### Chuẩn bị và oracle từng nhóm ca

**Given:** FINISHED room A/B cùng membership gốc,S1–S5 còn quyền; old Match có chat và media policy rows; fake clock finished At+600000.

| ID test (tiền tố T127 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–10,14–15,18` | Hai vote qua 2 connection/barrier; retry cùng id; old round request; reject; INTERRUPTED predecessor | Một new Match, side đổi, initial board, same time; old history nguyên; fresh context+segment, không tin cũ; finished_at null; reject xoá 2 vote; interrupted tái đấu được. |
| `11–13,16–17` | −1/0/+1 ms tới deadline; request trước nhưng chờ lock tới hạn; B đã leave/Cthay; spectator forgery | Chỉ thời điểm sau lock trước hạn được nhận; đúng/sau ROOM_CLOSED; chỉ memberships gốc; no fake Match/vote khi denied. |
| `T062 bàn giao, T127-09 transport` | Rematch thật rồi đọc sảnh và context; inspect OFF policies; final media proof tại 117 | Room PLAYING công khai hiện lại đúng sảnh; policy OFF và context DB mới. Luồng cũ thực dừng/capture không tự bật kiểm TS-MED-07/09/10 ở 117, không giả SFU sẵn ở 127. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence127 = { createdMatches: number; colorsSwapped: boolean; finishedAt: number | null; newContext: boolean; oldHistoryChanged: boolean };

export function assertIssue127KeyCase(actual: Evidence127): void {
  expect(actual).toMatchObject({createdMatches:1,colorsSwapped:true,finishedAt:null,newContext:true,oldHistoryChanged:false});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Không clear finished_at hoặc không expectedMatchId; T127-06/07/17 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-127.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:unit -- tests/unit/issue-127.test.ts
pnpm test:integration -- tests/integration/issue-127.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 128 stale timer guard; 098 multi-tab; 117 chứng minh chat/media rematch thực; 129 UI.


### Điểm kiểm deadline dưới khoá

Đặt điều kiện này ngay sau `SELECT ... FOR UPDATE` trong `rematch.service.ts`; `clock.now()` thuộc clock tiêm của 044/003. Không lấy timestamp request đến trước lock làm căn cứ:

```ts
export function isBeforeRematchDeadline(nowMs: number, finishedAtMs: number): boolean {
  return nowMs < finishedAtMs + 600_000;
}
```

```ts
import { expect, test } from 'vitest';
import { isBeforeRematchDeadline } from '../../apps/server/src/modules/rooms/rematch.service';

test.each([
  [599_999, true], [600_000, false], [600_001, false],
])('T127-17 — offset %i ms, cho phép=%s', (offset, allowed) => {
  expect(isBeforeRematchDeadline(1_000_000 + offset, 1_000_000)).toBe(allowed);
});
```

Thêm test này vào `tests/unit/issue-127.test.ts`. Đây không thay ca integration T127-17: connection 1 giữ khoá room, request connection 2 gửi ởdeadline−1 ms và chờ; tiến clock tới deadline rồi release 1; service 2 phải đọc now sau lock và từ chối. Kiểm không có Match/vote/context mới, room đóng đúng một lần. Khi đảo thứ tự để request lấy lock trước hạn, hai phiếu hợp lệ tạo đúng một Match. Lưu `pg_backend_pid()` và timeline acquired/released để chứng minh race thực.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-CHT-19` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |
| `AC-HIS-01` | [REQ-HISTORY-REMATCH](../01-requirements/REQ-HISTORY-REMATCH.md) | LOCAL |
| `AC-HIS-02` | [REQ-HISTORY-REMATCH](../01-requirements/REQ-HISTORY-REMATCH.md) | LOCAL |
| `AC-HIS-03` | [REQ-HISTORY-REMATCH](../01-requirements/REQ-HISTORY-REMATCH.md) | LOCAL |
| `AC-HIS-04` | [REQ-HISTORY-REMATCH](../01-requirements/REQ-HISTORY-REMATCH.md) | LOCAL |
| `AC-HIS-05` | [REQ-HISTORY-REMATCH](../01-requirements/REQ-HISTORY-REMATCH.md) | LOCAL |
| `AC-HIS-06` | [REQ-HISTORY-REMATCH](../01-requirements/REQ-HISTORY-REMATCH.md) | LOCAL |
| `AC-HIS-09` | [REQ-HISTORY-REMATCH](../01-requirements/REQ-HISTORY-REMATCH.md) | LOCAL |
| `AC-HIS-17` | [REQ-HISTORY-REMATCH](../01-requirements/REQ-HISTORY-REMATCH.md) | LOCAL |
| `AC-HIS-19` | [REQ-HISTORY-REMATCH](../01-requirements/REQ-HISTORY-REMATCH.md) | LOCAL |
| `AC-HIS-20` | [REQ-HISTORY-REMATCH](../01-requirements/REQ-HISTORY-REMATCH.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
