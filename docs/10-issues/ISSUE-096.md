# ISSUE-096 — Ân hạn 60 giây + kết quả

**Nhóm:** E13 · **Phụ thuộc:** 095, 093 · **Trạng thái:** TODO

> **DEC-030/031:** giữ hạn chống treo cũ, chỉ huỷ deadline DISCONNECT khi nối lại hợp lệ. Bổ sung timer giữ ghế WAITING 60 giây: Host đóng phòng; PLAYER còn lại mất ghế/reset ready; không gọi finalizer Match khi chưa có ván.

## 1. MỤC TIÊU
Mất kết nối quá **60 giây** ⇒ thua — nhưng **chỉ khi đối thủ còn online**.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-DISCONNECT.md](../01-requirements/REQ-DISCONNECT.md) **§5, §7, §9** · [../02-flows/FLOW-DISCONNECT.md](../02-flows/FLOW-DISCONNECT.md) §1, §2

## 3. PHẠM VI
**✅ LÀM** — bộ đếm ân hạn · va chạm với đồng hồ/chống treo · giữ ghế WAITING 60 giây
**❌ KHÔNG LÀM** — cả hai offline (097)

## 4. FILE SỬA
`apps/server/src/modules/matches/deadline-scheduler.ts`

## 5. CÁC BƯỚC
1. Phát hiện ngoại tuyến ⇒ lưu `disconnectedAt` và **thời hạn = +60 giây**
2. ⭐ **Đồng hồ ván VẪN CHẠY** trong lúc mất kết nối (`BR-DIS-02`)
3. Hết 60 giây ⇒ kiểm **đối thủ**:
   | Đối thủ | Kết quả |
   |---|---|
   | **Còn online** | Người mất kết nối **THUA** (`DISCONNECT`) |
   | **Cũng ngoại tuyến** | Cơ chế 097 kết thúc ngay khi phát hiện người thứ hai offline, sau khi phân xử hạn đã tới; scheduler không ghi kết quả lần hai |
4. ⭐ **`BR-DIS-07`** — **thời hạn nào đến TRƯỚC thì có hiệu lực**. Bằng nhau ⇒ **ưu tiên hết giờ** (`TIMEOUT`)
5. ⭐ **`BR-DIS-08`** — một thời hạn **đã tới hạn hợp lệ** thì **KHÔNG bị xoá** bởi sự kiện mất kết nối phát hiện **sau đó**
6. Nối lại kịp và chưa kết thúc ⇒ huỷ **deadline DISCONNECT**, giữ hạn chống treo; kiểm lại quyền, gửi trạng thái đầy đủ
7. Dùng `finalizeMatch` chung

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T096-01` | Mất mạng **59 giây** rồi quay lại, chưa có hạn hợp lệ khác → ván **tiếp tục** |
| `T096-02` | ⭐ **Mất mạng 61 giây, đối thủ online → THUA** (`DISCONNECT`) |
| `T096-03` | ⭐ **Đồng hồ VẪN CHẠY trong lúc mất mạng** |
| `T096-04` | ⭐ **Đồng hồ còn 30 giây, mất mạng 70 giây → thua do HẾT GIỜ** (đến trước) |
| `T096-05` | ⭐ **Đồng hồ còn 5 phút, mất mạng 70 giây → thua do MẤT MẠNG** (đến trước) |
| `T096-06` | ⭐ **Hai thời hạn BẰNG NHAU → ưu tiên `TIMEOUT`** |
| `T096-07` | ⭐ **A hết 60 giây khi B online → A thua. Sau đó phát hiện B cũng đã rớt → KẾT QUẢ VẪN GIỮ** |
| `T096-08` | Nối lại → bộ đếm **bị huỷ**, nhận trạng thái đầy đủ |
| `T096-09` | ⭐ **Nối lại phải KIỂM TRA LẠI QUYỀN** |
| `T096-10` | Đối thủ và người xem thấy **đếm ngược** |
| `T096-11` | Dùng `finalizeMatch` chung **cho ván đang chơi**, không tạo kết quả khi hết hạn WAITING |
| `T096-12` | WAITING: Host offline tới 60 giây ⇒ đóng phòng, quyền thu hồi; chưa có Match/kết quả giả |
| `T096-13` | WAITING: PLAYER còn lại offline tới 60 giây ⇒ mất ghế/reset ready cả hai; phòng còn mở nếu Host hợp lệ |
| `T096-14` | WAITING: quay lại trước hạn giữ ghế nhưng phải ready lại; đúng/sau hạn không tự khôi phục ghế. Tranh chấp timer/join/ready dùng đồng hồ giả, rào và hai kết nối DB |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 14 test xanh với đồng hồ giả
- [ ] **`T096-04`, `T096-05`, `T096-06`** — ba trường hợp va chạm thời hạn
- [ ] **`T096-07`** — kết quả đã tới hạn không bị xoá
- [ ] **`T096-03`** đồng hồ vẫn chạy
- [ ] `T096-09` kiểm lại quyền

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-096.md` — bảng 3 kịch bản va chạm thời hạn.

## 9. ⚠ CẠM BẪY
Xoá kết quả **đã tới hạn hợp lệ** vì phát hiện muộn rằng đối thủ cũng đã rớt là lỗi logic nguy hiểm — người thắng bị **tước mất** chiến thắng. `BR-DIS-08` và `T096-07` chặn điều này.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-096

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/server/src/modules/matches/deadline-scheduler.ts; apps/server/src/modules/rooms/cleanup.service.ts.
- **File test:** `tests/integration/issue-096.test.ts`.
- **Nhận từ phụ thuộc:** 095 durable presence,093 clock timer,089 finalizer và 064/065 WAITING lifecycle.
- **Bàn giao:** Deadline DISCONNECT detected At+60000; WAITING expiry không gọi Match finalizer; reconnect chỉ xoá deadline disconnect.
- **Trình tự xử lý tối thiểu:** Gom deadline hợp lệ, sắp theo timestamp và priority; kiểm online/membership dưới khoá; finalize hoặc cleanup WAITING đúng state; callback stale no-op.

### Chuẩn bị và oracle từng nhóm ca

**Given:** A offline t 0; B online; seed clock 30 s/60 s/300 s/null; WAITING Host/B fixture riêng.

| ID test (tiền tố T096 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–08,11` | Advance 59999/60000/60001; delay scheduler tới 70 s; mất B sau deadline A | Chọn mốc 30 s TIMEOUT hoặc 60 s DISCONNECT; bằng nhau TIMEOUT; kết quả đã hợp lệ không bị xoá; retry không event mới. |
| `09–10` | Reconnect trước hạn với JWT/membership đúng hoặc bị revoke | Đúng nhận snapshot và thời gian còn lại; sai không nhận board/chat, không cancel hạn; đối thủ/SPECTATOR thấy countdown. |
| `12–14` | WAITING Host/B rớt; race timer/join/ready trên 2 connection tại−1/0/+1 ms | Host expiry đóng; B expiry mất ghế/reset ready cả hai; không Match/outcome; trước hạn giữ membership nhưng ready lại; sau hạn không resurrect. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence096 = { reason: string; terminalEvents: number; deadlineMs: number; waitingFakeMatches: number };

export function assertIssue096KeyCase(actual: Evidence096): void {
  expect(actual).toMatchObject({reason:'TIMEOUT',terminalEvents:1,deadlineMs:30000,waitingFakeMatches:0});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Reconnect reset mọi deadline; T096-08 với inactivity deadline seed phải đỏ; bỏ equality TIMEOUT ưu tiên thì 06 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-096.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:integration -- tests/integration/issue-096.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 097 xử cả hai offline; 100–102 tích hợp inactivity; 121 AI offline riêng.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-ROOM-18` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |
| `AC-ROOM-19` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |
| `AC-ROOM-20` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |
| `AC-CLK-08` | [REQ-CLOCK](../01-requirements/REQ-CLOCK.md) | LOCAL |
| `AC-CLK-10` | [REQ-CLOCK](../01-requirements/REQ-CLOCK.md) | LOCAL |
| `AC-DIS-01` | [REQ-DISCONNECT](../01-requirements/REQ-DISCONNECT.md) | LOCAL |
| `AC-DIS-02` | [REQ-DISCONNECT](../01-requirements/REQ-DISCONNECT.md) | LOCAL |
| `AC-DIS-05` | [REQ-DISCONNECT](../01-requirements/REQ-DISCONNECT.md) | LOCAL |
| `AC-DIS-06` | [REQ-DISCONNECT](../01-requirements/REQ-DISCONNECT.md) | LOCAL |
| `AC-DIS-14` | [REQ-DISCONNECT](../01-requirements/REQ-DISCONNECT.md) | LOCAL |
| `AC-DIS-18` | [REQ-DISCONNECT](../01-requirements/REQ-DISCONNECT.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
