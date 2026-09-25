# ISSUE-102 — Đếm ngược 30 giây + kết thúc INACTIVITY

**Nhóm:** E14 · **Phụ thuộc:** 101 · **Trạng thái:** TODO
**⭐ `R17`** — `DEC-002`, `DEC-016`

> **Cập nhật BA 2026-09-22 — DEC-026:** hỏi và đếm ngược bắt đầu đồng thời khi đủ 3 phút. DEC-027 đã chốt gia hạn đủ 3 phút từ xác nhận hợp lệ; DEC-030 chốt reconnect giữ hạn cũ, không cấp thêm 3 phút; không dùng mô tả reset cũ. Xem [question-backlog-2026-09-22.md](../08-ba-review/question-backlog-2026-09-22.md).

## 1. MỤC TIÊU
Không xác nhận ⇒ đếm ngược **30 giây** ⇒ **đối thủ thắng**.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-INACTIVITY.md](../01-requirements/REQ-INACTIVITY.md) §7 EXC-1, §9 **`BR-INA-06`, `BR-INA-11`**

## 3. PHẠM VI
**✅ LÀM** — đếm ngược · kết thúc ván · va chạm với mất kết nối
**❌ KHÔNG LÀM** — giao diện (103)

## 4. FILE SỬA
`apps/server/src/modules/matches/inactivity.service.ts`

## 5. CÁC BƯỚC
1. Đủ **3 phút không đi nước** ⇒ bắt đầu cửa sổ **30 giây ngay cùng lúc hỏi** (`DEC-026`). Còn gia hạn: ĐANG HỎI đã kèm đếm ngược; hết gia hạn: ĐANG ĐẾM NGƯỢC không cho xác nhận gia hạn. Không chờ 30 giây rồi mới bắt đầu một countdown khác.
2. Hết 30 giây ⇒ gọi `finalizeMatch` với:
   ```
   reason: 'INACTIVITY'
   winner: ĐỐI THỦ
   status: FINISHED
   ```
3. ⭐ **`BR-INA-11`** — `INACTIVITY` là nguyên nhân **RIÊNG**.
   ⛔ **Không** gộp vào `TIMEOUT` (hết đồng hồ) hay `DISCONNECT` (mất mạng) — ba nguyên nhân khác nhau, QA phải phân biệt được trong lịch sử ván
4. ⭐ **`BR-INA-06` — DEC-030**: mất/nối mạng giữ mốc cảnh báo/hạn trả lời và `extensionsUsed`. Hạn mất mạng = phát hiện +60 giây không cộng vào hạn cũ. Nối lại nhận thời gian còn lại; kết quả đã đến hạn hợp lệ không bị xoá.
5. **Thời hạn đến trước thắng.** Bằng nhau ⇒ ưu tiên `DISCONNECT`
6. Đi nước hoặc xác nhận trong lúc đếm ⇒ **huỷ**, quay về bình thường
7. Máy chủ khởi động lại khi đang đếm ⇒ **gián đoạn**, không ai thắng

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T102-01` | ⭐ **Từ lúc đến lượt: 3:00 hỏi + bắt đầu đếm; tại 3:30 không xác nhận/đi nước, vẫn online → ván KẾT THÚC** |
| `T102-02` | ⭐ **Nguyên nhân `INACTIVITY`, ĐỐI THỦ thắng** |
| `T102-03` | ⭐ **`INACTIVITY` khác `TIMEOUT` và `DISCONNECT`** trong lịch sử ván |
| `T102-04` | Xác nhận ở **3:29** → **huỷ đếm ngược**, cảnh báo tiếp theo tại **6:29** (`DEC-027`) |
| `T102-05` | Đi nước trong lúc đếm → **huỷ**, reset |
| `T102-06` | ⭐ **Xác nhận ở giây thứ 31 → TỪ CHỐI**, ván đã kết thúc |
| `T102-07` | ⭐ **Mất mạng tại 3:20, hạn cũ 3:30, DISCONNECT 4:20 → INACTIVITY ở 3:30** (đối thủ online, không sự kiện khác) |
| `T102-08` | ⭐ **KHÔNG cộng dồn** hai thời hạn |
| `T102-09` | ⭐ **Mất mạng 2:50, quay lại 3:10 → còn 20 giây tới 3:30; lặp reconnect không dời hạn; `extensionsUsed` giữ nguyên** |
| `T102-10` | Hai thời hạn bằng nhau → ưu tiên `DISCONNECT` |
| `T102-11` | Máy chủ khởi động lại khi đang đếm → **gián đoạn**, không ai thắng |
| `T102-12` | ⭐ **Hết nước đi hợp lệ → ván kết thúc theo LUẬT CỜ trước khi treo ván kích hoạt** |
| `T102-13` | Dùng `finalizeMatch` chung |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 13 test xanh với đồng hồ giả
- [ ] **`T102-02`** và **`T102-03`** — nguyên nhân riêng biệt
- [ ] **`T102-07`, `T102-08`, `T102-09`** — va chạm xử lý đúng
- [ ] **`T102-06`** ranh giới thời gian chính xác
- [ ] Dùng finalizer chung

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-102.md`

## 9. ⚠ CẠM BẪY
Reset 3 phút hoặc cộng 60 giây vào hạn chống treo tạo đường kéo dài lượt. `DEC-030` yêu cầu giữ hạn cũ và chọn hạn hợp lệ đến trước; kiểm cả khi scheduler chạy trễ và reconnect cùng lúc.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-102

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/server/src/modules/matches/inactivity.service.ts; apps/server/src/modules/matches/deadline-scheduler.ts.
- **File test:** `tests/integration/issue-102.test.ts`.
- **Nhận từ phụ thuộc:** 101 phase/counter; 096 DISCONNECT; 097 start up; 089 finalize.
- **Bàn giao:** INACTIVITY terminal riêng; ưu tiên deadline sớm hơn, DISCONNECT khi bằng inactivity.
- **Trình tự xử lý tối thiểu:** Callback xử pending deadline cùng arbitration 093/096; kiểm snapshot current turn trước finalize; deadline hợp lệ đã tới không biến mất vì reconnect đến muộn.

### Chuẩn bị và oracle từng nhóm ca

**Given:** ONLINE unlimited RED t 0,B online; thêm hai confirm delayed 29 s hoặc ngay; advance clock không sleep.

| ID test (tiền tố T102 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–06,12–13` | Advance 209999/210000/210001, confirm/move sát hạn; branch không legal move | 210000 terminal INACTIVITY/BLACK,1 event; late reject; legal move trước hạn reset; checkmate/stalemate finalizer đã thắng trước timer. |
| `07–11` | Offline 200000→disconnect 260000; offline 170000 reconnect 190000; equal deadlines; restart | INACTIVITY 210000; reconnect còn 20000 ms và extensions giữ; equal DISCONNECT; restart SERVER_RESTART/null; không cộng hai hạn. |
| `T101-11 tích hợp` | Confirm 209000/418000 và chạy timer tới 628000; repeat confirm ngay | Terminal 628000 hoặc 570000; không dùng trần cố định 570000 cho cả hai. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence102 = { status: string; reason: string; winner: string; finishedAt: number; terminalEvents: number };

export function assertIssue102KeyCase(actual: Evidence102): void {
  expect(actual).toMatchObject({status:'FINISHED',reason:'INACTIVITY',winner:'BLACK',finishedAt:210000,terminalEvents:1});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Reset 3 phút khi reconnect hoặc thêm 30 s lần hai; T102-01/09 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-102.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:integration -- tests/integration/issue-102.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 103 UI ba phía; 125 lịch sử giữ reason INACTIVITY.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-INA-04` | [REQ-INACTIVITY](../01-requirements/REQ-INACTIVITY.md) | LOCAL |
| `AC-INA-05` | [REQ-INACTIVITY](../01-requirements/REQ-INACTIVITY.md) | LOCAL |
| `AC-INA-06` | [REQ-INACTIVITY](../01-requirements/REQ-INACTIVITY.md) | LOCAL |
| `AC-INA-08` | [REQ-INACTIVITY](../01-requirements/REQ-INACTIVITY.md) | LOCAL |
| `AC-INA-12` | [REQ-INACTIVITY](../01-requirements/REQ-INACTIVITY.md) | LOCAL |
| `AC-INA-13` | [REQ-INACTIVITY](../01-requirements/REQ-INACTIVITY.md) | LOCAL |
| `AC-INA-15` | [REQ-INACTIVITY](../01-requirements/REQ-INACTIVITY.md) | LOCAL |
| `AC-DIS-17` | [REQ-DISCONNECT](../01-requirements/REQ-DISCONNECT.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
