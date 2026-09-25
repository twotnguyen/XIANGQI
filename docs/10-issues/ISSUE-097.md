# ISSUE-097 — Cả hai offline + khởi động lại máy chủ

**Nhóm:** E13 · **Phụ thuộc:** 096 · **Trạng thái:** TODO

## 1. MỤC TIÊU
**Không ai thua oan vì lỗi hệ thống.**

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-DISCONNECT.md](../01-requirements/REQ-DISCONNECT.md) §7 EXC-2, EXC-3 · [../09-technical/architecture.md](../09-technical/architecture.md) **§7, `ARCH-10`**

## 3. PHẠM VI
**✅ LÀM** — cả hai offline · khởi động lại máy chủ
**❌ KHÔNG LÀM** — nhiều tab (098)

## 4. FILE TẠO
`apps/server/src/modules/matches/recovery.service.ts`

## 5. CÁC BƯỚC
1. ⭐ **Cả hai ngoại tuyến** ⇒ **ngay khi máy chủ xác định cả hai đều mất**, chuyển **`BOTH_OFFLINE`** / `INTERRUPTED`.
   **Không** chờ hết 60 giây của người đầu tiên
2. ⭐ **Khởi động lại máy chủ — `ARCH-10`**:
   ```
   TRƯỚC khi nhận bất kỳ lệnh nào:
     ① tìm mọi ván ACTIVE thuộc lần chạy CŨ (theo bootId)
     ② chuyển INTERRUPTED / SERVER_RESTART
     ③ KHÔNG AI thắng
     ④ GIỮ nguyên lịch sử ván
   ```
3. ⛔ **Tuyệt đối không** dùng thời gian máy chủ nghỉ để xử thua ai
4. ⛔ **Không** giả phục hồi thắng/thua bằng cách suy đoán
5. Mỗi lần khởi động sinh `bootId` mới, ghi vào ván khi tạo
6. Ván `INTERRUPTED` **không** chơi tiếp được, nhưng **tái đấu được**

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T097-01` | ⭐ **Cả hai mất mạng → `BOTH_OFFLINE`, KHÔNG AI thắng** |
| `T097-02` | ⭐ **A rớt, 30 giây sau B cũng rớt → GIÁN ĐOẠN NGAY**, không chờ hết 60 giây của A |
| `T097-03` | ⭐ **Khởi động lại máy chủ → mọi ván ACTIVE thành `SERVER_RESTART`/INTERRUPTED** |
| `T097-04` | ⭐ **Không ai thắng** sau khởi động lại |
| `T097-05` | ⭐ **Lịch sử ván được GIỮ** sau khởi động lại |
| `T097-06` | ⭐ **Xử lý TRƯỚC khi nhận lệnh mới** — lệnh gửi ngay sau khi khởi động bị từ chối đúng cách |
| `T097-07` | Ván của lần chạy **mới** không bị ảnh hưởng |
| `T097-08` | Ván `INTERRUPTED` → **không** chơi tiếp được |
| `T097-09` | Ván `INTERRUPTED` → **tái đấu được** |
| `T097-10` | ⭐ **Thời gian máy chủ nghỉ KHÔNG được dùng để xử thua** |
| `T097-11` | `active_players` được giải phóng → tạo ván mới được |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 11 test xanh trên PostgreSQL thật
- [ ] **`T097-01`** đến **`T097-05`** — không ai thua oan
- [ ] **`T097-06`** xử lý trước khi nhận lệnh
- [ ] **`T097-02`** gián đoạn ngay, không chờ
- [ ] Dùng `finalizeMatch` chung

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-097.md` — output khi **khởi động lại máy chủ thật**.

## 9. ⚠ CẠM BẪY
Đặt lại hẹn giờ cho ván cũ sau khi khởi động lại sẽ khiến ván **tiếp tục đếm ngược** dù đã mất toàn bộ trạng thái kết nối ⇒ xử thua người vô tội. `ARCH-10` chọn cách an toàn: **gián đoạn, không ai thắng**.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-097

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/server/src/modules/matches/recovery.service.ts; apps/server/src/main.ts.
- **File test:** `tests/integration/issue-097.test.ts`.
- **Nhận từ phụ thuộc:** 096 phân xử hạn; 089 finalizer; boot Id trong Match schema.
- **Bàn giao:** recover Previous Boot(new Boot Id) hoàn thành trước listen/accept; BOTH_OFFLINE tức thì sau phân xử deadline hợp lệ.
- **Trình tự xử lý tối thiểu:** Admission barrier đóng trước recovery; transaction finalizer idempotent từng ván boot cũ; recovery fail ⇒ không listen; sau commit mới mở readiness và sinh state boot mới.

### Chuẩn bị và oracle từng nhóm ca

**Given:** PG có 2 ACTIVE boot cũ,1 terminal cũ; lưu move/event ids; khởi động process backend mới thật.

| ID test (tiền tố T097 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–02,10` | A rớt t 0, B rớt 30 s; riêng fixture A deadline đã hợp lệ trước B | Không deadline trước ⇒ INTERRUPTED/BOTH_OFFLINE ngay 30 s; có kết quả trước thì giữ kết quả. |
| `03–08,11` | Restart backend, gửi command khi readiness chưa mở; đọc DB và lịch sử sau ready | Chỉ ACTIVE boot cũ INTERRUPTED/SERVER_RESTART winner null; lịch sử giữ, active_players giải phóng, không nhận lệnh mutation trước recovery; new boot match giữ nguyên. |
| `09` | Kiểm state INTERRUPTED giữ room/membership để còn đủ điều kiện tái đấu | 097 không tuyên bố endpoint 127 đã chạy; 127/T127-14 bắt buộc tạo Match mới thật từ trạng thái này,136 kết luận AC đầy đủ. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence097 = { oldActive: number; restartOutcomes: number; winners: number; historyRowsLost: number; acceptedBeforeRecovery: number };

export function assertIssue097KeyCase(actual: Evidence097): void {
  expect(actual).toMatchObject({oldActive:0,restartOutcomes:2,winners:0,historyRowsLost:0,acceptedBeforeRecovery:0});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Mở listen trước recover hoặc chạy lại timer cũ; T097-06/10 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-097.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:integration -- tests/integration/issue-097.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 127 xác nhận rematch thực; 137 stop/start/idle cùng semantics.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-MAT-10` | [REQ-MATCH](../01-requirements/REQ-MATCH.md) | LOCAL |
| `AC-DIS-03` | [REQ-DISCONNECT](../01-requirements/REQ-DISCONNECT.md) | LOCAL |
| `AC-DIS-04` | [REQ-DISCONNECT](../01-requirements/REQ-DISCONNECT.md) | LOCAL |
| `AC-DIS-07` | [REQ-DISCONNECT](../01-requirements/REQ-DISCONNECT.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
