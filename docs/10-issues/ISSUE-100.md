# ISSUE-100 — Bộ đếm treo ván + trạng thái

**Nhóm:** E14 Chống treo ván · **Phụ thuộc:** 096 · **Trạng thái:** TODO
**⭐ Yêu cầu MỚI `R17`** — `DEC-002`, `DEC-010`, `DEC-012`

> **Cập nhật BA 2026-09-22 — DEC-026:** hỏi và đếm ngược bắt đầu đồng thời khi đủ 3 phút. DEC-027 đã chốt gia hạn đủ 3 phút từ xác nhận hợp lệ; DEC-030 chốt reconnect giữ hạn cũ, không cấp thêm 3 phút; không dùng mô tả reset cũ. Xem [question-backlog-2026-09-22.md](../08-ba-review/question-backlog-2026-09-22.md).

## 1. MỤC TIÊU
Phát hiện người chơi **vẫn online nhưng không đi nước** trong **3 phút**.

## 2. VÌ SAO CÓ YÊU CẦU NÀY

Time control **mặc định là không giới hạn**. Ở chế độ đó **không có đồng hồ nào chạy**, và luật mất kết nối chỉ kích hoạt khi mất mạng thật.

⇒ Người ngồi im làm ván treo **vô thời hạn**. Đối thủ chỉ có thể **đầu hàng** hoặc **chờ mãi**, và **bị khoá** không tạo được phòng khác vì *một tài khoản một phòng*.

## 3. ĐỌC TRƯỚC
[../01-requirements/REQ-INACTIVITY.md](../01-requirements/REQ-INACTIVITY.md) **toàn bộ** · [../02-flows/FLOW-INACTIVITY.md](../02-flows/FLOW-INACTIVITY.md)

## 4. PHẠM VI
**✅ LÀM** — bộ đếm 3 phút · trạng thái treo ván
**❌ LÀM SAU** — hộp thoại xác nhận (101) · đếm ngược (102)

## 5. CÁC BƯỚC
1. ⭐ **Điều kiện kích hoạt — PHẢI đủ CẢ BỐN**:
   ```
   ① ván ĐANG CHƠI
   ② ván ONLINE            (KHÔNG áp dụng ván với máy — DEC-012)
   ③ timeControl === 0     (CHỈ ván không giới hạn — DEC-010)
   ④ mốc khởi tạo theo lượt/thao tác hợp lệ; offline KHÔNG huỷ mốc đã có (DEC-030)
   ```
2. **`BR-INA-07`** — mốc **3 phút** tính từ **thời điểm đến lượt**, do **máy chủ** ghi nhận.
   ⛔ **Không** tính từ lần di chuột/gõ phím cuối — sự kiện client **dễ giả mạo**
3. Lưu `InactivityState`: `phase` · `extensionsUsed` · `deadlineMs`
4. **Đi được một nước hợp lệ** ⇒ **reset** mốc và `extensionsUsed = 0` (`BR-INA-04`)
5. Dùng **cùng** đường xử lý lệnh và bộ đếm ở issue 085, 093
6. Đồng hồ **tiêm vào** để test

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T100-01` | ⭐ **Ván không giới hạn, 3 phút không đi → trạng thái ĐANG HỎI có hạn xác nhận 30 giây bắt đầu ngay (`DEC-026`; kết thúc ván triển khai ở 102)** |
| `T100-02` | ⭐ **Ván 5 phút → KHÔNG BAO GIỜ kích hoạt** (`DEC-010`) |
| `T100-03` | ⭐ **Ván 10 và 15 phút → KHÔNG kích hoạt** |
| `T100-04` | ⭐ **Ván với máy → KHÔNG kích hoạt** (`DEC-012`) |
| `T100-05` | ⭐ **Người đến lượt MẤT KẾT NỐI → thêm hạn mất mạng nhưng GIỮ hạn chống treo cũ, phân xử DEC-030** |
| `T100-06` | ⭐ **Đi được một nước → mốc RESET, `extensionsUsed` về 0** |
| `T100-07` | Đi nước ở phút thứ 2 → **không** kích hoạt |
| `T100-08` | ⭐ **Mốc tính từ lúc ĐẾN LƯỢT, không phải từ hoạt động của client** |
| `T100-09` | ⭐ **Di chuột liên tục KHÔNG kéo dài được mốc** |
| `T100-10` | Trạng thái treo ván có trong snapshot |
| `T100-11` | Ván kết thúc → bộ đếm **bị huỷ** |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 11 test xanh với đồng hồ giả
- [ ] **`T100-02`, `T100-03`, `T100-04`** — bốn trường hợp **không** áp dụng
- [ ] **`T100-06`** reset khi đi nước
- [ ] **`T100-09`** không giả mạo được bằng hoạt động client
- [ ] Bộ đếm **chủ động**, không chờ lệnh

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-100.md`

## 9. ⚠ CẠM BẪY
Tính mốc theo **hoạt động chuột/bàn phím của client** sẽ bị vô hiệu hoá chỉ bằng một script rung chuột ⇒ luật **mất tác dụng hoàn toàn**. `BR-INA-07` yêu cầu máy chủ ghi nhận từ lúc **đến lượt** — `T100-09` kiểm điều này.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-100

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/server/src/modules/matches/inactivity.service.ts.
- **File test:** `tests/integration/issue-100.test.ts`.
- **Nhận từ phụ thuộc:** 096 scheduler,008 Inactivity State,087 successful move.
- **Bàn giao:** NORMAL→PROMPTING tại turn Start+180000 và deadline+30000; extensionsUsed 0..2; null cho timed/AI.
- **Trình tự xử lý tối thiểu:** Đăng ký timer theo turn/version; đọc state dưới lock; chuyển phase và emit cùng commit. Seed trạng thái offline không xoá inactivity; kết thúc ở 102, không coi PROMPTING là terminal.

### Chuẩn bị và oracle từng nhóm ca

**Given:** ONLINE ACTIVE clock null đến lượt RED t 0; matrix AI và timeControl 300/600/900; lưu turn start server.

| ID test (tiền tố T100 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–05,10–11` | Advance 179999/180000/180001 không gửi request; offline trước/sau warning | Đúng 180000 PROMPTING deadline 210000; offline không dời mốc; timed/AI không phase/timer; terminal huỷ timer. |
| `06–09` | Move hợp lệ ở 120000; giả mouse/key press/heartbeat liên tục; seed extensions 2 | Move reset mốc và extensions 0; activity client không thay t 0; snapshot có state không tiết lộ nội bộ. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence100 = { phase: string; deadlineMs: number; extensionsUsed: number; clientActivityMovedDeadline: boolean };

export function assertIssue100KeyCase(actual: Evidence100): void {
  expect(actual).toMatchObject({phase:'PROMPTING',deadlineMs:210000,extensionsUsed:0,clientActivityMovedDeadline:false});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Dùng last Activity client hoặc áp cho AI/timed; T100-09/02/04 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-100.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:integration -- tests/integration/issue-100.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 101 xác nhận; 102 deadline terminal; 106 undo reset mốc giữ extensions.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-INA-02` | [REQ-INACTIVITY](../01-requirements/REQ-INACTIVITY.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
