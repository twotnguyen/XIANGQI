# ISSUE-110 — Công tắc ẩn/hiện + lịch sử + phân trang

**Nhóm:** E16 · **Phụ thuộc:** 109, 075, 076, 090 · **Trạng thái:** TODO
**⭐ `DEC-018`**

## 1. MỤC TIÊU
Mỗi người chơi **tự ẩn/hiện** kênh chung — **độc lập** với người kia.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-CHAT.md](../01-requirements/REQ-CHAT.md) **§6, §11 `BR-CHT-19..21`**

## 3. PHẠM VI
**✅ LÀM** — công tắc · phân trang lịch sử · dọn tin cũ
**❌ KHÔNG LÀM** — giao diện (111)

## 4. FILE TẠO
`apps/web/src/features/chat/useChannelVisibility.ts` · `apps/server/src/modules/chat/cleanup.ts`

## 5. CÁC BƯỚC
1. ⭐ **`BR-CHT-19` — CÔNG TẮC LÀ TUỲ CHỌN GIAO DIỆN, KHÔNG PHẢI PHÂN QUYỀN**
   - Máy chủ **vẫn gửi** tin bình thường
   - Bật lại ⇒ thấy **đủ lịch sử**, **không** có khoảng trống
   - ⛔ **Không** có endpoint nào cho việc này — hoàn toàn ở phía trình duyệt
2. **`BR-CHT-20`** — công tắc của A **không ảnh hưởng gì** tới B, tới người xem, hay tới việc A có gửi được tin hay không
3. **`BR-CHT-21`** — công tắc **không đồng bộ** giữa các tab; lưu theo **từng tab**
4. **Bốn tổ hợp đều hợp lệ**: cả hai hiện · A hiện B ẩn · A ẩn B hiện · cả hai ẩn
5. Phân trang **50 tin** bằng con trỏ, dùng index `(context_id, channel, sequence DESC)` theo ROOM-CHAT §4
6. **Dọn tin quá 30 ngày** — công việc định kỳ

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T110-01` | ⭐ **Bốn tổ hợp ẩn/hiện của A và B đều hoạt động đúng** |
| `T110-02` | ⭐ **A ẩn → máy chủ VẪN GỬI tin cho A** |
| `T110-03` | ⭐ **A ẩn rồi bật lại → thấy ĐỦ lịch sử, không mất tin** |
| `T110-04` | ⭐ **Công tắc của A KHÔNG ảnh hưởng B và người xem** |
| `T110-05` | ⭐ **A ẩn nhưng VẪN GỬI được tin vào kênh chung** |
| `T110-06` | ⭐ **A mở 2 tab, ẩn ở tab 1 → tab 2 KHÔNG bị ẩn theo** |
| `T110-07` | ⭐ **Không có endpoint nào cho công tắc** — thuần giao diện |
| `T110-08` | Cả A và B cùng ẩn → người xem **vẫn chat bình thường** với nhau |
| `T110-09` | Phân trang 50 tin, con trỏ đúng, không trùng không sót |
| `T110-10` | Tin quá 30 ngày **không** còn trong lịch sử |
| `T110-11` | Truy vấn phân trang dùng index — có `EXPLAIN` |
| `T110-12` | Tin cặp cũ không hiển thị khi membership thay; stale send không tự retry vào cặp/vòng mới |
| `T110-13` | Cleanup clock tiêm xoá đúng tin created_at <= now−30 ngày, không xoá tin trẻ hơn hay participant/context đang được tham chiếu |
| `T110-14` | Tích hợp066/075: cả3privacy chuyển kín hơn vàrotateWATCH, từ5SPECTATOR đang nhận board/chat thực → thu hồi. Actor cũ không nhận board/chat mới và HTTP history bị từ chối; đối chứng người còn quyền nhận được. Hai DB connection+barrier kiểm revoke/join/send/history cả hai thứ tự; reconnect/lost-ack không vượt epoch mới. Không mock delivery |
| `T110-15` | Người xem vào giữa ván theo073 nhận lịch sử ROOM current context, không nhận PLAYERS qua HTTP/socket/resync |
| `T110-16` | Hai PLAYER đuổi cùng người xem theo076: đúng một thu hồi; chặn board/chat/history thực, có đối chứng người còn quyền |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 16 test xanh
- [ ] **`T110-01`** đủ 4 tổ hợp
- [ ] **`T110-02`, `T110-03`** — công tắc không làm mất tin
- [ ] **`T110-06`** không đồng bộ giữa tab
- [ ] **`T110-07`** thuần giao diện
- [ ] **`T110-14`** có bằng chứng board/socket/chat/history thật cho scope hoãn từ066/075

### Contract bổ sung bắt buộc

Triển khai retention job 30 ngày cùng index created_at và FK an toàn theo ROOM-CHAT §5; báo bằng chứng PostgreSQL thật. UI chỉ hiển thị quyền server cấp, không dùng lọc UI thay guard.

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-110.md`

## 9. ⚠ CẠM BẪY
Làm công tắc thành **phân quyền ở máy chủ** (ngừng gửi tin) sẽ tạo **khoảng trống lịch sử** — bật lại thì mất những tin đã trôi qua. `BR-CHT-19` chọn cách đơn giản và không có tình huống lỗi: **thuần giao diện**.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-110

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/web/src/features/chat/useChannelVisibility.ts; apps/server/src/modules/chat/cleanup.ts.
- **File test:** `tests/integration/issue-110.test.ts`, `tests/e2e/issue-110.spec.ts`.
- **Nhận từ phụ thuộc:** 109 ROOM delivery; 066/075 revoke epoch; 040 created_at index; current context cursor.
- **Bàn giao:** Per-tab visibility state no endpoint; cursor 50; cleanup created_at<=now−30 days; full transport privacy gate T110-14.
- **Trình tự xử lý tối thiểu:** Keep visibility in component/store scoped tab (not cross-tab storage); pagination filter before limit; cleanup transaction chunk by created_at with reference-safe deletion; recheck audience before queue delivery.

### Chuẩn bị và oracle từng nhóm ca

**Given:** A 2 tabs,B 1,S1–S5; 105 messages with sequence; age cutoff−1/0/+1 ms; 3 privacy transitions+rotate separate fixtures.

| ID test (tiền tố T110 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–08` | Four A/B visibility combinations; Ah id den sends/receives; unhide; A-tab 2 | Server events unchanged; all permitted history visible; tab 2 state unchanged; no network request for switch. |
| `09–13` | Page 105 messages while new messages arrive; replace Bwith C; cleanup cutoff and EXPLAIN | 50/50/5 unique ordered messages; cursor includes context/channel; Cnever A–B; delete equal/older only; FK live refs retained; index actual plan. |
| `14` | 5 Sreceivingboard/chat; privacy tighten 3 ways/rotate; barrier revoke/join/send/history both orders; reconnect old token/lost ACK | After commit old actor 0 new board/chat,HTTP history denied; still authorized A/B receive actual events; watch_epoch not rolled back. Media full proof owned 117 TS-MED-06. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence110 = { hiddenTabReceivedMessages: number; otherTabHidden: boolean; revokedBoardEvents: number; revokedChatEvents: number; deletedAtCutoff: boolean; youngerDeleted: boolean };

export function assertIssue110KeyCase(actual: Evidence110): void {
  expect(actual).toMatchObject({hiddenTabReceivedMessages:1,otherTabHidden:false,revokedBoardEvents:0,revokedChatEvents:0,deletedAtCutoff:true,youngerDeleted:false});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Visibility call sun subscribe orchat read filters role only; T110-02/03/12/14 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-110.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:integration -- tests/integration/issue-110.test.ts
pnpm test:e2e -- tests/e2e/issue-110.spec.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
pnpm test:e2e
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 111 render switch; 133 cites 14 for 066/075; 117 media separate proof.


### Bàn giao từ 073/076: người mới vào và người bị đuổi

T110-15: SPECTATOR mới vào giữa ván đọc lịch sử ROOM của current context theo 073; tin PLAYERS không có trong HTTP/socket/resync. T110-16: hai PLAYER đuổi cùng SPECTATOR đang nhận board/chat thật theo 076, có barrier và hai DB connection; đúng một thu hồi, actor bị đuổi không nhận thêm board/chat và mọi lần đọc history bị chặn, người còn quyền có đối chứng nhận được. Media transport của cùng thao tác thuộc 117/TS-MED-06. Hai test là phần bổ sung bắt buộc, không thay T110-14.

T110-12 kiểm UI nhận context/segment mới và không tự retry ý định cũ; nếu setup chuyển context qua fixture040, report chỉ chứng nhận phản ứng đó. Endpoint127 và toàn chuỗi tái đấu thật vẫn có gate T127-18, không được suy từ fixture chuyển context.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-INV-20` | [REQ-INVITE](../01-requirements/REQ-INVITE.md) | LOCAL |
| `AC-SPEC-05` | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) | LOCAL |
| `AC-SPEC-06` | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) | LOCAL |
| `AC-SPEC-23` | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) | LOCAL |
| `AC-CHT-01` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |
| `AC-CHT-03` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |
| `AC-CHT-04` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |
| `AC-CHT-11` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |
| `AC-CHT-15` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |
| `AC-CHT-17` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |
| `AC-CHT-20` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |
| `AC-CHT-21` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |
| `AC-CHT-23` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |
| `AC-CHT-24` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |
| `AC-CHT-27` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |
| `AC-CHT-28` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
