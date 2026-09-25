# ISSUE-118 — Tiến trình AI riêng + IPC

**Nhóm:** E18 AI hoàn thiện · **Phụ thuộc:** 032 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Chạy AI ở **tiến trình riêng** — để việc tính toán **không làm treo** máy chủ.

## 2. VÌ SAO BẮT BUỘC

Node.js chạy **một luồng**. Để AI trong tiến trình chính ⇒ cấp Khó tính 3 giây ⇒ **mọi ván của mọi người đứng im 3 giây** (`TECH-09`, `ARCH-16`).

## 3. ĐỌC TRƯỚC
[../09-technical/tech-stack.md](../09-technical/tech-stack.md) §2.2 `TECH-09` · [../01-requirements/REQ-AI.md](../01-requirements/REQ-AI.md) §10 `BR-AI-19`

## 4. PHẠM VI
**✅ LÀM** — tiến trình con · giao thức liên lạc · giám sát
**❌ LÀM SAU** — worker thread (119) · hàng đợi (120)

## 5. FILE TẠO
`apps/ai-worker/src/{main,supervisor,protocol}.ts`

## 6. CÁC BƯỚC
1. Máy chủ khởi động ⇒ sinh **tiến trình con** chạy AI
2. **Giao thức liên lạc** — định nghĩa rõ bằng kiểu:
   ```
   Máy chủ → AI:  { type:'SEARCH',  jobId, position, counts, maxDepth, budgetMs }
                  { type:'CANCEL',  jobId }
   AI → Máy chủ:  { type:'RESULT',  jobId, result: SearchResult }
                  { type:'ERROR',   jobId, message }
                  { type:'READY' }
   ```
3. ⭐ **Đường truyền kết quả KHÔNG được nuốt tin** — mọi `RESULT` phải tới được máy chủ
4. **Giám sát**: tiến trình chết ⇒ sinh lại; ghi nhận số lần chết
5. Máy chủ tắt ⇒ đóng tiến trình con **sạch sẽ**
6. **Mặc định BẬT** — ⛔ không để cờ tắt khiến AI chạy trong tiến trình chính

## 7. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T118-01` | Tiến trình con sinh ra khi máy chủ khởi động |
| `T118-02` | Gửi việc → **nhận được kết quả** |
| `T118-03` | ⭐ **`RESULT` KHÔNG bị nuốt** — gửi 50 việc, nhận đủ 50 kết quả |
| `T118-04` | ⭐ **Tiến trình con chết → tự sinh lại** |
| `T118-05` | ⭐ **KHI AI TÍNH CẤP KHÓ, máy chủ VẪN phản hồi dưới 500 ms** |
| `T118-06` | Máy chủ tắt → tiến trình con đóng sạch, **không** để lại tiến trình mồ côi |
| `T118-07` | Gửi `CANCEL` → việc dừng |
| `T118-08` | ⭐ **Mặc định BẬT**, không có cờ tắt |
| `T118-09` | Lỗi trong AI → gửi `ERROR`, **không** làm chết máy chủ |
| `T118-10` | Giao thức có kiểu rõ ràng, sai kiểu bị từ chối |

> **`T118-05` là test quan trọng nhất** — chứng minh đúng mục tiêu của issue này.

## 8. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 10 test xanh
- [ ] **`T118-05`** — máy chủ không bị nghẽn
- [ ] **`T118-03`** — không nuốt kết quả
- [ ] **`T118-08`** — mặc định bật
- [ ] Không để lại tiến trình mồ côi

## 9. BẰNG CHỨNG
`docs/test-reports/ISSUE-118.md` — số đo độ trễ máy chủ **trong lúc** AI tính cấp Khó.

## 10. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| **Nhóm worker TẮT MẶC ĐỊNH**; đường truyền kết quả **nuốt `RESULT`** (`F-08`) | `T118-03`, `T118-08` |

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-118

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/ai-worker/src/main.ts; apps/ai-worker/src/supervisor.ts; apps/ai-worker/src/protocol.ts; apps/server/src/modules/ai/process.service.ts.
- **File test:** `tests/unit/issue-118.test.ts`.
- **Nhận từ phụ thuộc:** 032 measured AI gate; Search Result/position/counts từ contracts; ARCH-16.
- **Bàn giao:** IPC SEARCH/CANCEL→RESULT/ERROR/READY với job Id; backend spawn child mặc định; child không DB credential.
- **Trình tự xử lý tối thiểu:** Gắn listener trước send; map job Id→resolver và single terminal reply; exit reject in flight; spawn replacement với READY handshake; shutdown reject jobs và await child exit.118 dùng cơ chế cancel tối thiểu thực,119 shared flag graceful.

### Chuẩn bị và oracle từng nhóm ca

**Given:** Backend process thật+child PIDkhác; 50 jobs legal fixture; Hard job trong khi HTTP health/read request; IPC ready barrier.

| ID test (tiền tố T118 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–03,08,10` | Boot default,gửi 50 jobs định danh unique; invalid IPC shape | 50 results ghép đúng id không drop/duplicate; no flag chạy AI trong backend; invalid message rejected không crash. |
| `04–07,09` | Kill child lúc busy,restart,shutdown backend; CANCEL current job; throw search error | Supervisor responde ERROR cho job,sinh child READY; backend healthy; shutdown không orphan; cancel nhận được trước blocked search kết thúc. |
| `05` | Đo HTTP monotonic khi Hard search thực đang CPU | Mỗi request đo <500 ms; log overlap PID/time; không đo sau job xong hoặc dùng search stub để claim. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence118 = { submitted: number; uniqueResults: number; orphanProcesses: number; backendPid: number; aiPid: number; maxHttpMs: number };

export function assertIssue118KeyCase(actual: Evidence118): void {
  expect(actual).toMatchObject({submitted:50,uniqueResults:50,orphanProcesses:0}); expect(actual.backendPid).not.toBe(actual.aiPid); expect(actual.maxHttpMs).toBeLessThan(500);
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Nuốt RESULT hoặc chạy search sync trong backend; T118-03/05 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-118.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:unit -- tests/unit/issue-118.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit

```

**Chặn riêng của issue:** Cổng 032 chưa DONE hoặc child không spawn được ⇒ BLOCKED; không thay search Hard bằng timer giả.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 119 worker threads; 120 queue; 137 same Render service distinct PIDs.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
