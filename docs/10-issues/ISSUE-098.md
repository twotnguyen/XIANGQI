# ISSUE-098 — Nhiều tab đồng bộ

**Nhóm:** E13 · **Phụ thuộc:** 097, 101, 106, 110, 127 · **Trạng thái:** TODO
**⭐ Mô hình MỚI theo `DEC-020`** — khác hẳn thiết kế cũ

## 1. MỤC TIÊU
Mở **bao nhiêu tab cũng được**, **tất cả đồng bộ và tất cả thao tác được**.

## 2. VÌ SAO ĐỔI MÔ HÌNH

Thiết kế cũ: **một tab thao tác**, tab khác **chỉ đọc**, có nút *Tiếp quản*.
`DEC-020` **bỏ hẳn** — vì máy chủ **đã** chống hai nước bằng **kiểm lượt + phiên bản + mã lệnh**. Khoá tab là lớp bảo vệ **trùng lặp**.

## 3. ĐỌC TRƯỚC
[../05-data-and-realtime/session-state.md](../05-data-and-realtime/session-state.md) **§3 toàn bộ** · [../07-decisions/decision-log.md](../07-decisions/decision-log.md) `DEC-020`

## 4. PHẠM VI
**✅ LÀM** — mọi tab thao tác được · chống xung đột
**❌ KHÔNG LÀM** — camera/mic một tab (099)

## 5. CÁC BƯỚC
1. ⛔ **Bỏ hẳn** khái niệm *tab chỉ đọc*, *quyền điều khiển*, nút *Tiếp quản* cho phần **chơi cờ và chat**
2. **Mọi tab** gửi được: đi cờ · chat cả hai kênh · đầu hàng · xin hoà · xin đi lại · sẵn sàng · xác nhận treo ván · tái đấu · đuổi người xem
3. **Ba cơ chế chống xung đột** (đã có sẵn):
   | Cơ chế | Chặn gì |
   |---|---|
   | Kiểm lượt | Hai nước trong cùng một lượt |
   | Kiểm phiên bản | Thao tác dựa trên trạng thái cũ |
   | Mã lệnh duy nhất | Cùng lệnh gửi nhiều lần |
4. **`SS-08`** — mở nhiều tab **không** tạo thêm ghế trong phòng
5. Mọi tab nhận **cùng** luồng cập nhật thời gian thực

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T098-01` | ⭐ **Mở 3 tab → CẢ BA đồng bộ**; đi cờ ở tab bất kỳ, hai tab kia thấy **ngay** |
| `T098-02` | ⭐ **MỌI tab đều đi cờ được** |
| `T098-03` | ⭐ **Hai tab đi cờ ĐỒNG THỜI → ĐÚNG MỘT nước được ghi**, tab kia nhận lỗi |
| `T098-04` | ⭐ **Hai tab đầu hàng đồng thời → ĐÚNG MỘT kết quả** |
| `T098-05` | Hai tab xin hoà đồng thời → **một** đề nghị |
| `T098-06` | Hai tab xác nhận treo ván → chỉ cộng **một lần** 3 phút |
| `T098-07` | Hai tab gửi chat → **hai tin hợp lệ** (đó là hai tin người dùng thật sự gõ) |
| `T098-08` | Hai tab bấm tái đấu → tạo **một** ván mới |
| `T098-09` | ⭐ **Mở 5 tab → vẫn chiếm ĐÚNG MỘT ghế** |
| `T098-10` | ⭐ **KHÔNG còn** nút *Tiếp quản* ở phần chơi cờ |
| `T098-11` | Mọi tab nhận cùng luồng cập nhật |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 11 test xanh
- [ ] **`T098-02`** mọi tab thao tác được
- [ ] **`T098-03`** đến **`T098-08`** — mọi loại lệnh chống xung đột đúng
- [ ] **`T098-09`** không tạo thêm ghế
- [ ] **`T098-10`** đã bỏ nút tiếp quản

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-098.md` — bảng kiểm chứng **từng loại lệnh** khi hai tab gửi đồng thời.

## 9. ⚠ CẠM BẪY
Đừng cài lại khoá tab *"cho chắc"* — nó sẽ **chặn oan** tab hợp lệ và mâu thuẫn `DEC-020`. Ba cơ chế ở bước 3 đã đủ. Nếu phát hiện một loại lệnh **chưa** được ba cơ chế đó bảo vệ, **báo người dùng** chứ không tự thêm khoá.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-098

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/web/src/features/match/match-store.ts; tests/e2e/issue-098.spec.ts.
- **File test:** `tests/integration/issue-098.test.ts`, `tests/e2e/issue-098.spec.ts`.
- **Nhận từ phụ thuộc:** 097 presence/recovery; 101 confirm,106 undo,110 chat,127 rematch.
- **Bàn giao:** Mọi tab authenticated có cùng quyền game/chat; không thêm owner lock ngoài media.
- **Trình tự xử lý tối thiểu:** Xoá mọi điều kiện tab owner khỏi game/chat action; handler dùng turn/version/id; resync conflict nhưng không tự gửi lại ý định cũ bằng version mới.

### Chuẩn bị và oracle từng nhóm ca

**Given:** 3 tab cùng A,1 B vàS 1; khởi tạo 5 tab để đếm membership; barrier backend hai DB connection.

| ID test (tiền tố T098 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–03,09–11` | Đi nước từ từng tab qua các lượt; hai tab cùng expected Version với command Id khác | Mọi tab cùng snapshot; race chỉ 1 move/version; 5 tab chỉ 1 membership; không Tiếp quản trên game/chat. |
| `04–08` | Lần lượt race resign/propose/confirm/rematch trên fixture riêng; chat 2 id khác | 1 terminal/1 pending/1 extension/1 new Match; chat 2 tin là đúng. Lặp cùng command Id trả receipt, không mutation thêm. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence098 = { memberships: number; acceptedMoves: number; chatMessages: number; extraExtensions: number; newMatches: number };

export function assertIssue098KeyCase(actual: Evidence098): void {
  expect(actual).toMatchObject({memberships:1,acceptedMoves:1,chatMessages:2,extraExtensions:0,newMatches:1});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Cho tab 2 readonly hoặc bỏ expected Version; T098-02/03 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-098.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:integration -- tests/integration/issue-098.test.ts
pnpm test:e2e -- tests/e2e/issue-098.spec.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
pnpm test:e2e
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 099 chỉ media có ownership; 133 dùng forged multi-tab commands.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-ROOM-16` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |
| `AC-INA-10` | [REQ-INACTIVITY](../01-requirements/REQ-INACTIVITY.md) | LOCAL |
| `AC-DIS-08` | [REQ-DISCONNECT](../01-requirements/REQ-DISCONNECT.md) | LOCAL |
| `AC-DIS-10` | [REQ-DISCONNECT](../01-requirements/REQ-DISCONNECT.md) | LOCAL |
| `AC-DIS-13` | [REQ-DISCONNECT](../01-requirements/REQ-DISCONNECT.md) | LOCAL |
| `AC-ACT-19` | [REQ-GAME-ACTIONS](../01-requirements/REQ-GAME-ACTIONS.md) | LOCAL |
| `AC-CHT-18` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |
| `AC-SS-01` | [session-state](../05-data-and-realtime/session-state.md) | LOCAL |
| `AC-SS-02` | [session-state](../05-data-and-realtime/session-state.md) | LOCAL |
| `AC-SS-03` | [session-state](../05-data-and-realtime/session-state.md) | LOCAL |
| `AC-SS-04` | [session-state](../05-data-and-realtime/session-state.md) | LOCAL |
| `AC-SS-09` | [session-state](../05-data-and-realtime/session-state.md) | LOCAL |
| `AC-SS-10` | [session-state](../05-data-and-realtime/session-state.md) | LOCAL |
| `AC-SS-17` | [session-state](../05-data-and-realtime/session-state.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
