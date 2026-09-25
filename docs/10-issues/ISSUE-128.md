# ISSUE-128 — Bộ đếm đóng phòng 10 phút

**Nhóm:** E19 · **Phụ thuộc:** 127 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Phòng đã xong ván **tự đóng sau 10 phút** — nhưng **không đóng nhầm** phòng đã tái đấu.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-ROOM.md](../01-requirements/REQ-ROOM.md) §9 `BR-ROOM-12/13` · [../09-technical/architecture.md](../09-technical/architecture.md) §6

## 3. PHẠM VI
**✅ LÀM** — bộ đếm đóng phòng · dọn dẹp
**❌ KHÔNG LÀM** — giao diện (129)

## 4. FILE SỬA
`apps/server/src/modules/rooms/cleanup.service.ts`

## 5. CÁC BƯỚC
1. Ván kết thúc ⇒ ghi `finished_at`, đặt hẹn **+10 phút**
2. ⭐ **Khi tới hạn — kiểm LẠI dưới khoá phòng**:
   ```
   ① khoá phòng FOR UPDATE
   ② kiểm status VẪN LÀ "đã xong"
   ③ kiểm currentMatchId KHÔNG ĐỔI
   ④ kiểm finished_at VẪN CÒN (chưa bị tái đấu xoá)
   ⑤ đủ cả 4 ⇒ ĐÓNG PHÒNG
   ```
   ⛔ Thiếu bước ②③④ sẽ **đóng nhầm** phòng đang đánh ván mới
3. Đóng phòng ⇒ thu hồi **đồng thời**: lời mời · thành viên · chat · camera/mic · `user_active_room` · `room_blocks`
4. ⭐ **Giữ** `matches` · `match_moves` · `match_events` — lịch sử **không bị xoá**
5. **Tái đấu đúng phút thứ 9** ⇒ bộ đếm **bị huỷ**
6. Đọc thời gian máy chủ sau khi khoá phòng: chỉ tái đấu nếu `now < finished_at + 10 phút`. **Bằng hoặc quá hạn thì đóng phòng thắng** (DEC-042), không phụ thuộc timer có chạy trước request hay không.

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T128-01` | ⭐ **Đồng hồ giả: hết 10 phút → phòng TỰ ĐÓNG** |
| `T128-02` | ⭐ **Tái đấu ở phút 9 → bộ đếm BỊ HUỶ, phòng KHÔNG đóng** |
| `T128-03` | ⭐ **Ván mới đang đánh khi bộ đếm cũ tới hạn → KHÔNG đóng nhầm** |
| `T128-04` | Đồng hồ giả + hai kết nối: trước hạn hợp lệ được tái đấu; **đúng hạn hoặc sau hạn đóng phòng thắng**, dù callback timer chưa chạy |
| `T128-05` | Đóng phòng → thu hồi **đủ 6 loại** tài nguyên |
| `T128-06` | ⭐ **Lịch sử ván ĐƯỢC GIỮ** sau khi đóng phòng |
| `T128-07` | ⭐ **`room_blocks` bị XOÁ** khi đóng phòng |
| `T128-08` | `user_active_room` xoá → tạo phòng mới được ngay |
| `T128-09` | Chủ phòng rời trước 10 phút → đóng ngay, bộ đếm huỷ |
| `T128-10` | Bộ đếm chạy **trong transaction có khoá** |
| `T128-11` | Mọi thành viên nhận thông báo và về sảnh |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 11 test xanh với đồng hồ giả
- [ ] **`T128-02`, `T128-03`, `T128-04`** — không đóng nhầm
- [ ] **`T128-06`** giữ lịch sử
- [ ] **`T128-05`** thu hồi đủ 6 loại
- [ ] Bộ đếm **chủ động**

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-128.md`

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| **Không có bộ đếm đóng phòng 10 phút / reset `finished_at`** (`F-20`) | `T128-01`, `T128-02` |

Đóng nhầm phòng đang đánh ván tái đấu là lỗi **rất tệ** — hai người đang chơi bị đá ra giữa chừng. Bốn bước kiểm ở bước 2 là bắt buộc.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-128

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/server/src/modules/rooms/cleanup.service.ts.
- **File test:** `tests/integration/issue-128.test.ts`.
- **Nhận từ phụ thuộc:** 127 rematch; 065 close-room transaction; ROOM-CHAT§6 deadline; 115 durable media jobs nếu đã có, otherwise job schema 041.
- **Bàn giao:** Auto close finished At+600000, guard status/current Match/finished At dưới lock; close idempotent, giữ match history.
- **Trình tự xử lý tối thiểu:** Compare captured currentMatchId/finished At dưới khoá, đọc now tại đó; gọi cùng close service không bản sao cleanup; commit trước external SFU; timer cancellation là tối ưu, guard vẫn bắt buộc.

### Chuẩn bị và oracle từng nhóm ca

**Given:** FINISHED A/B/S1; pending grants/room_blocks/user_active_room; ghi move/event check sums; captured old timer identity.

| ID test (tiền tố T128 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–04,10` | Advance 599999/600000/600001; rematch ở 540000; chạy stale callback; race close/rematch | Auto close không request; new Match PLAYING không đóng; đúng hạn close thắng dù callback chưa chạy; retry không double-close. |
| `05–09,11` | Host leave trước hạn và timer đúng hạn; fetch lại grants/chat/room, tạo phòng mới | Membership/grant/chat access/user_active_room/blocks bị thu hồi; media job persisted; match/move/event giữ; audience nhận close rồi về sảnh; full media teardown chứng minh 117/136. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence128 = { staleTimerClosedNewMatch: boolean; roomClosedAt600000: boolean; historyRowsLost: number; activeRoomRows: number };

export function assertIssue128KeyCase(actual: Evidence128): void {
  expect(actual).toMatchObject({staleTimerClosedNewMatch:false,roomClosedAt600000:true,historyRowsLost:0,activeRoomRows:0});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Bỏ compare current Match hoặc xoá history cascade; T128-03/06 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-128.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:integration -- tests/integration/issue-128.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 129 countdown từ deadline server; 136 full close/replay/transport integration.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-LOB-12` | [REQ-LOBBY](../01-requirements/REQ-LOBBY.md) | LOCAL |
| `AC-ROOM-13` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |
| `AC-ROOM-14` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |
| `AC-HIS-07` | [REQ-HISTORY-REMATCH](../01-requirements/REQ-HISTORY-REMATCH.md) | LOCAL |
| `AC-HIS-08` | [REQ-HISTORY-REMATCH](../01-requirements/REQ-HISTORY-REMATCH.md) | LOCAL |
| `AC-HIS-21` | [REQ-HISTORY-REMATCH](../01-requirements/REQ-HISTORY-REMATCH.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
