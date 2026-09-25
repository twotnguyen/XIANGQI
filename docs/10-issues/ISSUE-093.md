# ISSUE-093 — Bộ đếm hết giờ

**Nhóm:** E12 · **Phụ thuộc:** 092, 089 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Ván **tự kết thúc** khi hết giờ — không chờ ai gửi lệnh.

## 2. ĐỌC TRƯỚC
[../09-technical/architecture.md](../09-technical/architecture.md) **§6 (5 bộ đếm), `ARCH-08`, `ARCH-09`**

## 3. PHẠM VI
**✅ LÀM** — bộ đếm chủ động cho hết giờ
**❌ KHÔNG LÀM** — mất kết nối (096) · treo ván (102)

## 4. FILE TẠO
`apps/server/src/modules/matches/deadline-scheduler.ts`

## 5. CÁC BƯỚC
1. ⭐ **Bộ đếm CHỦ ĐỘNG** — máy chủ tự kích hoạt, **không** chờ người dùng gửi lệnh
2. **`ARCH-08`** — bộ đếm dùng **CÙNG đường xử lý lệnh** ở issue 085: có khoá, có ghi bền vững, gọi `finalizeMatch`
3. Đặt hẹn giờ khi ván bắt đầu và sau **mỗi** nước đi. Huỷ hẹn cũ trước khi đặt hẹn mới
4. **`ARCH-09`** — quyết định theo **thời điểm sự kiện**, **không** theo thứ tự đoạn mã nào chạy trước
5. Khi hết giờ: gọi `finalizeMatch` với `TIMEOUT`, người thắng là **đối thủ**
6. Máy chủ khởi động lại ⇒ **đặt lại** hẹn giờ cho các ván còn `ACTIVE`... ⛔ **KHÔNG** — theo `ARCH-10`, ván của lần chạy cũ chuyển **INTERRUPTED**. Xem issue 097
7. Đồng hồ **tiêm vào** để test

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T093-01` | ⭐ **Đồng hồ giả: hết giờ → ván TỰ kết thúc, KHÔNG cần ai gửi lệnh** |
| `T093-02` | Nguyên nhân `TIMEOUT`, người thắng là **đối thủ** |
| `T093-03` | Đi nước → hẹn giờ cũ **bị huỷ**, hẹn mới được đặt |
| `T093-04` | ⭐ **`timeControl = 0` → KHÔNG đặt hẹn giờ nào** |
| `T093-05` | ⭐ **Nước đi tới ĐÚNG mốc hết giờ → BỊ TỪ CHỐI**, ván kết thúc do hết giờ |
| `T093-06` | Nước đi tới **trước** mốc 1 ms → **được chấp nhận** |
| `T093-07` | ⭐ **Hết giờ và đầu hàng ĐỒNG THỜI → ĐÚNG MỘT kết quả** |
| `T093-08` | Ván kết thúc vì lý do khác → hẹn giờ **bị huỷ** |
| `T093-09` | Bộ đếm gọi `finalizeMatch`, **không** tự viết logic kết thúc |
| `T093-10` | Bộ đếm chạy **trong transaction có khoá** |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 10 test xanh trên PostgreSQL thật
- [ ] **`T093-01`** — bộ đếm **chủ động**
- [ ] **`T093-05`** — nước đi muộn bị từ chối
- [ ] **`T093-07`** với rào đồng bộ
- [ ] `T093-09` — dùng finalizer chung

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-093.md`

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| **Không có bộ đếm thời hạn nào** — ván hết giờ vẫn `ACTIVE` mãi cho tới khi có người gửi lệnh (`F-04`) | `T093-01` kiểm **không ai gửi lệnh** mà ván vẫn kết thúc |

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-093

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/server/src/modules/matches/deadline-scheduler.ts.
- **File test:** `tests/integration/issue-093.test.ts`.
- **Nhận từ phụ thuộc:** 085 transaction; 089 finalizer; 092 get Deadline/is Expired; clock và scheduler tiêm.
- **Bàn giao:** schedule/cancel theo match Id+version; callback TIMEOUT dùng command pipeline, không có đường UPDATE terminal riêng.
- **Trình tự xử lý tối thiểu:** Hẹn chỉ giữ identity+version+deadline; callback lấy khoá theo 085, reload state, phân xử hạn thực rồi finalizer. Huỷ handle khi move/terminal. Restart được giao 097, không phục hồi timer ván boot cũ.

### Chuẩn bị và oracle từng nhóm ca

**Given:** PG ACTIVE, RED còn 1000 ms tại t=10000; B online; subscribe hai socket, không gửi lệnh sau seed.

| ID test (tiền tố T093 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–04,08–10` | Advance tới 10999/11000/11001, flush các callback đến hạn; đi nước trước hạn trên fixture riêng | ACTIVE trước hạn; đúng hạn một FINISHED/TIMEOUT/BLACK, active_players rỗng; clock null không timer; timer cũ không kết thúc lượt mới. |
| `05–06` | Gửi move với clock tiêm ở deadline−1/0/+1 | Chỉ−1 ms ghi move; hai mốc còn lại không thêm match_moves, terminal đúng một lần. |
| `07` | Hai connection + barrier giữa timer và lệnh terminal 085/089; đảo thứ tự release | Một outcome/event terminal và một increment terminal; receipt retry giữ kết quả. Endpoint resign thật được chạy lại bắt buộc tại 104/T104-08. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence093 = { status: string; reason: string; winner: string; terminalEvents: number; activePlayers: number };

export function assertIssue093KeyCase(actual: Evidence093): void {
  expect(actual).toMatchObject({status:'FINISHED',reason:'TIMEOUT',winner:'BLACK',terminalEvents:1,activePlayers:0});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Bỏ guard version timer hoặc đổi now>=deadline thành >; T093-03/05 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-093.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:integration -- tests/integration/issue-093.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 104 phải bổ sung race endpoint RESIGN thật; 096 mở rộng disconnect; 097 start up barrier.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-MAT-09` | [REQ-MATCH](../01-requirements/REQ-MATCH.md) | LOCAL |
| `AC-CLK-04` | [REQ-CLOCK](../01-requirements/REQ-CLOCK.md) | LOCAL |
| `AC-CLK-05` | [REQ-CLOCK](../01-requirements/REQ-CLOCK.md) | LOCAL |
| `AC-CLK-06` | [REQ-CLOCK](../01-requirements/REQ-CLOCK.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
