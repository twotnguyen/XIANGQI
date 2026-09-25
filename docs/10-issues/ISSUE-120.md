# ISSUE-120 — Hàng đợi 2 chạy / 8 chờ

**Nhóm:** E18 · **Phụ thuộc:** 119 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Giới hạn tài nguyên AI — **2 việc chạy**, **8 việc chờ**, quá tải thì từ chối ván **mới**.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-AI.md](../01-requirements/REQ-AI.md) §7, §10 `BR-AI-03`

## 3. PHẠM VI
**✅ LÀM** — hàng đợi · trạng thái việc · xử lý lỗi ở supervisor/queue thật. T120-04/06/09/10 chứng minh output/quyết định và ngân sách queue, chưa khẳng định Match đã commit; T121-12/14 và bộ deadline T121-07 kiểm tích hợp PostgreSQL thật.
**❌ KHÔNG LÀM** — tích hợp ván (121)

## 4. FILE SỬA
`apps/ai-worker/src/supervisor.ts` · `apps/server/src/modules/ai/queue.service.ts`

## 5. CÁC BƯỚC
1. **Giới hạn**: **2 chạy song song**, **8 chờ** (từ `AI_MAX_RUNNING`, `AI_MAX_QUEUED`)
2. Admission có **10 reservation** (=2 chạy+8chờ), mỗi ván AI ACTIVE giữ1 kể cả lúc người chơi đang nghĩ. Một ván tối đa1 job chưa xong; retry/undo thay job trong reservation cũ, không nhân đôi. Tạo ván mới phải đặt reservation trước commit; lỗi tạo thì trả lại, terminal mới giải phóng. Đủ10 ⇒ `AI_BUSY`. Vì vậy mọi ván đã nhận luôn có chỗ khi đến lượt; không từ chối/hủy ván đang chạy do admission quá tải. Sau restart tất cả ván cũ INTERRUPTED rồi khởi tạo pool rỗng.
3. **Trạng thái việc** (`ai_jobs`): `IDLE` → `QUEUED` → `THINKING` → xong
   ⭐ `jobVersion` **tăng xuyên suốt ván**; client bỏ kết quả có `jobVersion` cũ
4. ⭐ **`BR-AI-17`** — trạng thái **đang xếp hàng** và **đang tính** phải phân biệt được ở giao diện
5. **Xử lý lỗi**:
   | Tình huống | Xử lý |
   |---|---|
   | Worker lỗi lần 1 | **Thử lại 1 lần** nếu còn thời gian và còn chỗ |
   | Lỗi lần 2 | Ván **GIÁN ĐOẠN** (`AI_UNAVAILABLE`), người chơi **KHÔNG thua** |
   | Hết ngân sách chưa xong | Dùng **nước dự phòng** |
   | Nước trả về **không hợp lệ** | Từ chối, coi là **lỗi máy** |
6. ⭐ **`BR-CLK-13`** — ngân sách **không được vượt** thời gian còn lại trên đồng hồ của máy
7. ⭐ **Đồng hồ máy hết giờ ⇒ `TIMEOUT` ưu tiên hơn lỗi máy**

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T120-01` | ⭐ **Tối đa 2 việc chạy song song** |
| `T120-02` | ⭐ **Việc thứ 3 vào hàng đợi**, tối đa 8 |
| `T120-03` | ⭐ **Hàng đợi đầy → ván MỚI nhận `AI_BUSY`** |
| `T120-04` | ⭐ 10 ván đã nhận cùng phát job:2chạy/8chờ, không job rơi; ván11 AI_BUSY kể cả10 ván đang ở lượt người. Retry/undo không nhân reservation; terminal giải phóng đúng1 |
| `T120-05` | ⭐ **Worker lỗi lần 1 → THỬ LẠI** |
| `T120-06` | ⭐ **Lỗi lần 2 → ván GIÁN ĐOẠN, người chơi KHÔNG THUA** |
| `T120-07` | Hết ngân sách → dùng **nước dự phòng hợp lệ** |
| `T120-08` | ⭐ **Nước không hợp lệ → TỪ CHỐI**, coi là lỗi máy |
| `T120-09` | ⭐ **Đồng hồ máy còn 200 ms ở cấp Khó → ngân sách CẮT xuống 200 ms** |
| `T120-10` | ⭐ **Đồng hồ máy về 0 → `TIMEOUT`, ưu tiên hơn lỗi máy** |
| `T120-11` | `jobVersion` tăng xuyên suốt ván |
| `T120-12` | Trạng thái `QUEUED` và `THINKING` **phân biệt được** |
| `T120-13` | Trạng thái việc **không** làm tăng phiên bản ván |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 13 test xanh
- [ ] **`T120-06`** — không xử người chơi thua vì lỗi máy
- [ ] **`T120-09`** — ngân sách không vượt đồng hồ
- [ ] **`T120-04`** — quá tải không ảnh hưởng ván đang chạy
- [ ] **`T120-10`** — thứ tự ưu tiên đúng

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-120.md`

## 9. ⚠ CẠM BẪY
Xử người chơi **thua** khi máy lỗi là lỗi nghiêm trọng — họ không làm gì sai. `BR-AI-03` bắt buộc chuyển **gián đoạn**, không ai thắng.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-120

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/ai-worker/src/supervisor.ts; apps/server/src/modules/ai/queue.service.ts.
- **File test:** `tests/unit/issue-120.test.ts`.
- **Nhận từ phụ thuộc:** 119 workers,031 fallback và 032 budgets; ai-validation§6 admission.
- **Bàn giao:** 10 reservations ACTIVE kể cả human turn; 1 outstanding job/match; 2 running+8 queued; retry 1 lần; jobVersion monotonic.
- **Trình tự xử lý tối thiểu:** Admission reserve trước create transaction,rollback release; active reservation không release khi job hoàn thành; queue checks remaining clock khi de queue,không giữ budget lúc en queue; terminal release idempotent.

### Chuẩn bị và oracle từng nhóm ca

**Given:** 10 reserved matches; all release jobs at barrier; 11 th new match; deterministic fake clock queue policy,real workers riêng.

| ID test (tiền tố T120 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–04,11–13` | 10 jobs đến cùng lúc; 11 th reservation; cancel/undo/retry replacement; terminal double release | 2 running/8 queued,no job lost; 11 AI_BUSY kểcả 10 human turn; one outstanding,jobVersion tăng; job state không match version. |
| `05–10` | Worker fail twice,invalid move,budget expired; Hard clock 200 ms rồi 0 | Retry tối đa 1,capped 200 ms gồm queue elapsed; fallback legal; 0 ms quyết TIMEOUT ưu tiên; unavailable decision không human loss. PGoutcome thực chứng minh 121-14. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence120 = { running: number; queued: number; reservations: number; eleventh: string; lostJobs: number; maxBudgetMs: number };

export function assertIssue120KeyCase(actual: Evidence120): void {
  expect(actual).toMatchObject({running:2,queued:8,reservations:10,eleventh:'AI_BUSY',lostJobs:0,maxBudgetMs:200});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Release reservation mỗi human turn hoặc retry nhận slot mới; T120-04 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-120.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:unit -- tests/unit/issue-120.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit

```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 121 atomic create+finalizer dùng decision; 123 QUEUED/THINKING labels.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
