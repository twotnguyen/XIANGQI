# ISSUE-107 — Giao diện thao tác trong ván

**Nhóm:** E15 · **Phụ thuộc:** 106, 091 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Ba nút thao tác + khung đề nghị, với **xác nhận rõ ràng** cho hành động không đảo ngược.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-GAME-ACTIONS.md](../01-requirements/REQ-GAME-ACTIONS.md) §12 · [../03-screens/screen-inventory.md](../03-screens/screen-inventory.md) §6

## 3. PHẠM VI
**✅ LÀM** — 3 nút · khung đề nghị · xác nhận đầu hàng

## 4. FILE TẠO
`apps/web/src/features/match/{ActionBar,ProposalPrompt,ConfirmResignModal}.tsx`

## 5. CÁC BƯỚC
1. Ba nút: **Đầu hàng** · **Xin hoà** · **Xin đi lại**
2. ⭐ **Xác nhận đầu hàng bắt buộc** (`screen-inventory` §6):
   ```
   Bạn sẽ THUA ván này ngay lập tức.
   [Huỷ]  [Đầu hàng]
   ```
3. **Khung đề nghị** hiện **thời gian còn lại**:
   ```
   ┌──────────────────────────────────────┐
   │ Đối thủ xin hoà                      │
   │ Còn 00:23                            │
   │        [ Từ chối ]  [ Đồng ý ]       │
   └──────────────────────────────────────┘
   ```
4. **Trạng thái vô hiệu — bắt buộc có giải thích**:
   | Nút | Vô hiệu khi | Giải thích |
   |---|---|---|
   | Xin đi lại | chưa đi nước nào | *"Bạn chưa đi nước nào"* |
   | Xin hoà | ván với máy | **không hiện nút** |
   | Tạo đề nghị | đã có đề nghị chờ | *"Đang chờ trả lời đề nghị trước"* |
5. ⭐ **`SCR-RULE-05`** — thông báo tạm **không được che** nút Đầu hàng
6. Người xem và người không phải người chơi: **không thấy** ba nút này
7. Đi lại được đồng ý ⇒ bàn cờ **lùi lại** ở mọi client, có chuyển động

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T107-01` | ⭐ **Xác nhận đầu hàng ghi rõ "sẽ THUA ngay lập tức"** |
| `T107-02` | Bấm Huỷ → không đầu hàng |
| `T107-03` | Khung đề nghị hiện **thời gian còn lại**, đếm ngược |
| `T107-04` | Đồng ý / Từ chối hoạt động đúng |
| `T107-05` | ⭐ **Chưa đi nước nào → nút Xin đi lại VÔ HIỆU, có giải thích** |
| `T107-06` | ⭐ **Ván với máy → KHÔNG hiện nút Xin hoà** |
| `T107-07` | ⭐ **Đã có đề nghị chờ → nút tạo đề nghị VÔ HIỆU, có giải thích** |
| `T107-08` | ⭐ **Thông báo tạm KHÔNG che nút Đầu hàng** |
| `T107-09` | ⭐ **Người xem KHÔNG thấy ba nút** |
| `T107-10` | Đi lại được đồng ý → bàn cờ **lùi ở mọi client** |
| `T107-11` | Hết hạn 30 giây → khung đề nghị **tự biến mất** |
| `T107-12` | Mobile 360px → ba nút vẫn bấm được, không tràn |
| `T107-13` | Cửa sổ xác nhận đóng được bằng X, Esc, bấm ra ngoài |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 13 test xanh ở cả 2 kích thước
- [ ] **`T107-01`** cảnh báo đúng chữ
- [ ] **`T107-08`** không che nút Đầu hàng
- [ ] **`T107-05`, `T107-07`** vô hiệu **có giải thích**
- [ ] `T107-09` người xem không thấy

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-107.md`

## 9. ⚠ CẠM BẪY
Thông báo tạm che nút Đầu hàng khiến người chơi **không bấm được** đúng lúc cần — đặc biệt khi họ muốn thoát nhanh. `SCR-RULE-05` là luật bố cục bắt buộc.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-107

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/web/src/features/match/ActionBar.tsx; apps/web/src/features/match/ProposalPrompt.tsx; apps/web/src/features/match/ConfirmResignModal.tsx.
- **File test:** `tests/e2e/issue-107.spec.ts`.
- **Nhận từ phụ thuộc:** 104/105/106 services,091 store; REQUIREMENTS spectator read-only proposal.
- **Bàn giao:** Three PLAYER actions,confirm RESIGN; proposal request/accept/reject/withdraw UI, deadline server; collapse không cancel.
- **Trình tự xử lý tối thiểu:** Disable duplicate submit khi đang xử lý; giữ command Id khi network retry; gặp CONFLICT nhận snapshot và yêu cầu ýđịnhmới,không auto replay.

### Chuẩn bị và oracle từng nhóm ca

**Given:** A/B/S1 browser; ACTIVE online and AI; unplayed,proposal pending,undo accepted states; desktop/mobile.

| ID test (tiền tố T107 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–04,13` | Bấm resign→cancel/confirm; X/Esc/backdrop; proposer withdraw; opponent respond | Cancel không request; confirm ghi rõ thua ngay; normal modal đóng được; withdraw gửi intent riêng; reply phản ánh commit. |
| `05–09,11–12` | Chưa đi nước,AI,pending,S1; show toast; clock expiry 30000 | Disabled có lý do; AI không DRAW; S1 không action nhưng thấy proposal status; toast không che; expiry hide khi state mới. |
| `10,bổsungcollapse` | Accept undo; thu gọn proposal rồi mở lại trước hạn | Mọi client cùng head; collapse không huỷ pending/không reset deadline; đếm tiếp. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from '@playwright/test';

type Evidence107 = { requestsAfterCancel: number; proposalStillPendingAfterCollapse: boolean; spectatorMutationButtons: number; resignHitTargetVisible: boolean };

export function assertIssue107KeyCase(actual: Evidence107): void {
  expect(actual).toMatchObject({requestsAfterCancel:0,proposalStillPendingAfterCollapse:true,spectatorMutationButtons:0,resignHitTargetVisible:true});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Bấm Huỷ vẫn resign hoặc Esc proposal gửi withdraw; T107-02 và collapse đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-107.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:e2e -- tests/e2e/issue-107.spec.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:e2e
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 132 audit 6 confirmations; 130 toast hit-testing.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-SPEC-24` | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) | LOCAL |
| `AC-ACT-16` | [REQ-GAME-ACTIONS](../01-requirements/REQ-GAME-ACTIONS.md) | LOCAL |
| `AC-ACT-17` | [REQ-GAME-ACTIONS](../01-requirements/REQ-GAME-ACTIONS.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
