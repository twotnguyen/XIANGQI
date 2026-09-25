# ISSUE-104 — Đầu hàng

**Nhóm:** E15 Thao tác ván · **Phụ thuộc:** 089, 093, 065 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Đầu hàng **có hiệu lực ngay**, không cần đối thủ đồng ý.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-GAME-ACTIONS.md](../01-requirements/REQ-GAME-ACTIONS.md) §5.1, §10 `BR-ACT-01`

## 3. PHẠM VI
**✅ LÀM** — lệnh đầu hàng · **❌ KHÔNG LÀM** — đề nghị (105)

## 4. FILE TẠO
`apps/server/src/modules/matches/resign.service.ts`

## 5. CÁC BƯỚC
1. `POST /matches/:id/commands/resign` — qua **cùng** đường xử lý lệnh (issue 085)
2. **`BR-ACT-01`** — có hiệu lực **ngay**, **không** cần đồng ý, **không** rút lại được
3. Gọi `finalizeMatch` với `RESIGN`, người thắng là **đối thủ**
4. Chỉ khi ván **đang chơi**. Ván đã kết thúc ⇒ từ chối
5. **Người xem** đầu hàng ⇒ **FORBIDDEN**
6. **Rời phòng khi đang chơi** cũng dùng lệnh này (issue 065)
7. **Mọi tab** đều bấm được (`DEC-020`); gửi trùng chỉ một kết quả

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T104-01` | ⭐ **Đầu hàng → ván kết thúc NGAY**, đối thủ thắng |
| `T104-02` | Nguyên nhân `RESIGN` |
| `T104-03` | ⭐ **Không cần đối thủ đồng ý** |
| `T104-04` | ⭐ **Người xem đầu hàng → FORBIDDEN**, kể cả khi giả mạo |
| `T104-05` | Ván đã kết thúc → từ chối |
| `T104-06` | ⭐ **Gửi 2 lần → ĐÚNG MỘT kết quả** |
| `T104-07` | ⭐ **Hai tab cùng đầu hàng → MỘT kết quả** |
| `T104-08` | ⭐ **Đầu hàng và hết giờ ĐỒNG THỜI → ĐÚNG MỘT kết quả** |
| `T104-09` | Cả phòng nhận thông báo kết thúc |
| `T104-10` | Đầu hàng khi đang có đề nghị chờ → đề nghị bị **xoá** |
| `T104-11` | Dùng `finalizeMatch` chung |
| `T104-12` | Rời phòng ACTIVE qua endpoint065 tạo đúng một RESIGN; kiểm race leave/resign/timeout và lịch sử giữ nguyên |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 12 test xanh
- [ ] **`T104-08`** với rào đồng bộ
- [ ] **`T104-04`** chặn giả mạo
- [ ] `T104-06` và `T104-07` không ghi hai lần
- [ ] Dùng finalizer chung

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-104.md`

## 9. ⚠ CẠM BẪY
Đầu hàng là hành động **không đảo ngược được**. Giao diện **phải** xác nhận rõ trước khi gửi (issue 107) — nhưng máy chủ **không** được dựa vào đó; lệnh tới là thực hiện ngay.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-104

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/server/src/modules/matches/resign.service.ts.
- **File test:** `tests/integration/issue-104.test.ts`.
- **Nhận từ phụ thuộc:** 085/086 locked commands và receipts; 089 finalizer; 093 TIMEOUT arbitration.
- **Bàn giao:** POST /matches/:id/commands/resign dùng authenticated actor; kết quả RESIGN/opponent ngay, không proposal.
- **Trình tự xử lý tối thiểu:** Guard actor PLAYER rồi common pipeline; settle/arbitrate deadlines trước finalizer; no await đối thủ. Receipt trả đúng kết quả cũ nhưng không bỏ kiểm phiên hiện tại.

### Chuẩn bị và oracle từng nhóm ca

**Given:** ACTIVE RED=A BLACK=B,S1 spectator; same-command retry và 2 tab command khác; real PG+socket subscribers.

| ID test (tiền tố T104 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–07,09–11` | A đầu hàng khi B không gửi gì; cùng id retry; S1 forged; terminal fixture; pending proposal | Một FINISHED/RESIGN/BLACK, pending bị xoá,active_players giải phóng; S1/terminal không mutation; broadcast sau commit cho audience đúng. |
| `08, T093-07 endpoint` | Barrier 2 connections timer TIMEOUT và HTTP/socket resign tại deadline−1/0/+1 | Deadline đã tới phân xử trước resign; 1 outcome/1 terminal event/1 version increment, mọi client đồng nhất; đổi thứ tự release không đổi mốc. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence104 = { status: string; reason: string; winner: string; terminalEvents: number; pendingProposals: number; opponentApprovals: number };

export function assertIssue104KeyCase(actual: Evidence104): void {
  expect(actual).toMatchObject({status:'FINISHED',reason:'RESIGN',winner:'BLACK',terminalEvents:1,pendingProposals:0,opponentApprovals:0});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Cho resign UPDATE trực tiếp hoặc yêu cầu opponent ACK; T104-03/08 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-104.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:integration -- tests/integration/issue-104.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 105 dùng terminal cleanup; 107 UI xác nhận; 136 xương sống bước 15.


### Bàn giao từ ISSUE-065: rời phòng ACTIVE

T104-12: Given A/B đang ACTIVE và A là PLAYER; When A gọi endpoint rời phòng 065, không gọi resign trực tiếp; Then cùng finalizer tạo FINISHED/RESIGN, đối thủ thắng, một terminal event, không xoá lịch sử. Race leave/resign/timeout qua hai connection vẫn một kết quả. Host leave tiếp tục close-room theo 065 sau kết quả; PLAYER còn lại leave không được tạo kết quả khác. Đây là bằng chứng tích hợp thực còn thiếu ở 065, phải chạy trước đóng 104.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-ROOM-07` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |
| `AC-MAT-08` | [REQ-MATCH](../01-requirements/REQ-MATCH.md) | LOCAL |
| `AC-CLK-11` | [REQ-CLOCK](../01-requirements/REQ-CLOCK.md) | LOCAL |
| `AC-ACT-01` | [REQ-GAME-ACTIONS](../01-requirements/REQ-GAME-ACTIONS.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
