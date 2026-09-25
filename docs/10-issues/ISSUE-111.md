# ISSUE-111 — Giao diện chat 2 khung

**Nhóm:** E16 · **Phụ thuộc:** 110, 091 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Người chơi thấy **hai khung**, người xem thấy **một khung** — nhãn ghi rõ kênh nào.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-CHAT.md](../01-requirements/REQ-CHAT.md) **§13** · [../03-screens/design-tokens.md](../03-screens/design-tokens.md) §8

## 3. PHẠM VI
**✅ LÀM** — giao diện chat cho cả hai vai trò

## 4. FILE TẠO
`apps/web/src/features/chat/{ChatPanel,ChannelBox}.tsx`

## 5. CÁC BƯỚC
1. **Người chơi — hai khung**:
   ```
   💬 Riêng (người chơi)          ← chỉ 2 người chơi
   💬 Chung (người xem)    [👁]   ← công tắc ẩn/hiện RIÊNG
      ℹ️ Người chơi cũng đọc và gửi được ở kênh này
   ```
2. **Người xem — một khung**: chỉ kênh chung, có dòng thông báo
3. ⭐ **`BR-CHT-18`** — nhãn khung ghi **rõ** đang ở kênh nào. Đây là luật bố cục số 3 (`DT` §8)
4. ⭐ Tin của **người chơi** trong kênh chung có **nhãn phân biệt**:
   ```
   Minh Nguyễn (người chơi) 14:33
   ```
5. Khi ẩn: hiện gọn *"Đang ẩn — bấm để hiện"*
6. **Trạng thái bắt buộc**: đang tải · **trống** · đang gửi (tin mờ) · lỗi + thử lại · vô hiệu (kèm lý do) · quá tần suất
7. Trên điện thoại, chat nằm trong **tab riêng** (`DT-12`)
8. Đếm ký tự `0/1000`

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T111-01` | ⭐ **Người chơi thấy HAI khung** |
| `T111-02` | ⭐ **Người xem thấy MỘT khung** |
| `T111-03` | ⭐ **Nhãn khung ghi RÕ kênh nào** |
| `T111-04` | ⭐ **Dòng "Người chơi cũng đọc và gửi được" LUÔN hiện** ở kênh chung |
| `T111-05` | ⭐ **Tin của người chơi có nhãn phân biệt** |
| `T111-06` | ⭐ **Công tắc ẩn/hiện hoạt động**, không ảnh hưởng người kia |
| `T111-07` | Ẩn rồi hiện → thấy **đủ lịch sử** |
| `T111-08` | ⭐ **Trạng thái trống** có lời giải thích |
| `T111-09` | Đang gửi → tin hiện **mờ** cho tới khi xác nhận |
| `T111-10` | Lỗi gửi → có nút **Thử lại** |
| `T111-11` | Quá tần suất → báo rõ |
| `T111-12` | ⭐ **Nội dung HTML hiện DẠNG CHỮ** |
| `T111-13` | Đếm ký tự đúng, chặn ở 1000 |
| `T111-14` | ⭐ **Mobile: chat ở TAB RIÊNG, không che bàn cờ** |
| `T111-15` | Bàn phím ảo mở → **không** gây cuộn ngang |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 15 test xanh ở cả 2 kích thước
- [ ] **`T111-01`, `T111-02`** đúng theo vai trò
- [ ] **`T111-03`, `T111-04`, `T111-05`** — nhãn và minh bạch
- [ ] **`T111-14`, `T111-15`** — điện thoại
- [ ] `T111-12` an toàn nội dung

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-111.md` — ảnh chụp góc nhìn người chơi và người xem.

## 9. ⚠ CẠM BẪY
Nhãn khung **mơ hồ** khiến người chơi gõ nhầm tin riêng tư vào **kênh chung** — cả 5 người xem đọc được. `BR-CHT-18` yêu cầu nhãn rõ ràng.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-111

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/web/src/features/chat/ChatPanel.tsx; apps/web/src/features/chat/ChannelBox.tsx.
- **File test:** `tests/e2e/issue-111.spec.ts`.
- **Nhận từ phụ thuộc:** 108/109 canonical message DTO; 110 tab visibility,paging; 091 layout.
- **Bàn giao:** PLAYER 2 label led frames/SPECTATOR 1; literal text; optimistic pending receipt reconciled by clientMessageId.
- **Trình tự xử lý tối thiểu:** Render React text not dangerously Set Inner HTML; pending message stays bound context+segment; on context change stale intent shown error not auto resent; run query cursor through 110.

### Chuẩn bị và oracle từng nhóm ca

**Given:** A/B/S1; empty then messages with HTML/Vietnamese/emoji; hold actual response then network failure; 360/1366.

| ID test (tiền tố T111 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–08` | Render roles,labels,sender badge,visibility four combinations,empty | Private/public unambiguous; public notice always visible; hidden only own frame; empty explains next action. |
| `09–13` | Delay ACK then lose ACK and Retry same id; submit 6 th; input 1000/1001 code points; HTML | Pending dim until ACK; failure Retry same context/id; no duplicate persisted message; rate limit clear; no HTML execution; count NFCcodepoints matches DB. |
| `14–15` | Mobile chat tab,virtual keyboard actual device or browser view port evidence | Board uncovered; no horizontal overflow; keyboard test not claimed by desktop view portal one. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from '@playwright/test';

type Evidence111 = { playerFrames: number; spectatorFrames: number; executedHtml: number; persistedRetryCopies: number; horizontalOverflow: boolean };

export function assertIssue111KeyCase(actual: Evidence111): void {
  expect(actual).toMatchObject({playerFrames:2,spectatorFrames:1,executedHtml:0,persistedRetryCopies:1,horizontalOverflow:false});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Use inner HTML or new clientMessageId on retry; T111-12/10 red. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-111.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:e2e -- tests/e2e/issue-111.spec.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:e2e
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 1304 view port matrix; 132 state audit; 136 xương sống chat.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-CHT-07` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |
| `AC-CHT-08` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |
| `AC-CHT-09` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |
| `AC-CHT-10` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
