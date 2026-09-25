# ISSUE-124 — Thí nghiệm 60 ván + báo cáo

**Nhóm:** E18 · **Phụ thuộc:** 123, 033 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Chứng minh **cấp cao mạnh hơn cấp thấp** bằng số liệu **tái lập được** — nội dung chính khi bảo vệ đồ án.

## 2. VÌ SAO QUAN TRỌNG

Lần trước thí nghiệm này **chưa bao giờ được chạy** (`T023-04` không có bằng chứng). Đây là **nội dung học thuật chính** của đồ án.

## 3. ĐỌC TRƯỚC
[../01-requirements/REQ-AI.md](../01-requirements/REQ-AI.md) **§10 `BR-AI-24..30`** · [../06-acceptance/test-scenarios.md](../06-acceptance/test-scenarios.md) §8 · [ai-validation](../09-technical/ai-validation.md) §4

## 4. PHẠM VI
**✅ LÀM** — đấu 60 ván · so sánh thuật toán · báo cáo tái lập được

## 5. FILE TẠO
`tests/ai/tournament.ts` · `tests/ai/benchmark.ts` · `docs/test-reports/ai/`

## 6. CÁC BƯỚC
1. ⭐ **`BR-AI-27` — đấu đối kháng**: mỗi cặp cấp độ **20 ván**, **đổi màu**, tổng **60 ván**
   - Xuất phát từ **10 khai cuộc hợp lệ** khác nhau
   - **Giới hạn 200 nửa nước** — chỉ là giới hạn thí nghiệm, ⛔ **không** thêm luật hoà vào sản phẩm
   - Ván chạm giới hạn ⇒ chấm **0,5 điểm mỗi bên**
2. ⭐ **`BR-AI-26` — so sánh thuật toán**: cùng độ sâu, cùng thứ tự nước
   - Điểm và tập nước tốt **tương đương**
   - Bản cắt tỉa **không nhiều node hơn**, **giảm tổng** trên toàn tập
3. ⭐ **`BR-AI-28` — tái lập được**: ghi **seed · số node · độ sâu · điểm · môi trường**, hash/version manifest. Dùng mode thí nghiệm deterministic depth2/4/6, ordering cố định; không dùng jitter deadline để quyết depth. Cổng032 đo thời gian production độc lập, không lấy mode thí nghiệm làm bằng chứng ngân sách.
4. ⭐ **`BR-AI-29`** — máy đi **nước không hợp lệ** hoặc **treo** ⇒ **lần chạy HỎNG**, ⛔ **không** chấm thua để tô hồng sức mạnh
5. ⭐ **`BR-AI-30` — TRUNG THỰC**: thế cờ nào bản cắt tỉa duyệt **nhiều node hơn** phải **ghi rõ**, không giấu
6. Kèm số đo cổng 032: p50/p95/p99 cho 3 cấp
7. ⭐ **`BR-AI-02`** — ⛔ **không** quy đổi ra Elo
8. Xuất kết quả ra `artifacts/` (bị bỏ qua trong git); báo cáo chọn lọc vào kho mã

## 7. ⛔ ĐIỀU KIỆN PASS

- [ ] ⭐ **Đủ 60 ván** (3 cặp × 20), đổi màu
- [ ] ⭐ **Cấp cao đạt > 50% điểm** trước cấp thấp, **cả 3 cặp**
- [ ] ⭐ **0 ván có nước không hợp lệ**
- [ ] ⭐ **0 ván bị treo**
- [ ] So sánh thuật toán: điểm **khớp**, tổng node **giảm**
- [ ] ⭐ **Báo cáo LIỆT KÊ thế cờ mà cắt tỉa duyệt nhiều node hơn** (nếu có)
- [ ] Báo cáo có **seed · node · độ sâu · điểm · cấu hình máy**
- [ ] ⭐ **Chạy lại với cùng seed → CÙNG kết quả**
- [ ] ⛔ **Không** có tuyên bố Elo nào
- [ ] Bộ 20 thế cờ (issue 033) đạt ≥ 16/20

## 8. BẰNG CHỨNG

`docs/test-reports/ISSUE-124.md` + `docs/test-reports/ai/` — **bắt buộc**:
- Bảng 60 ván: khai cuộc · cấp · màu · kết quả · số nửa nước
- Bảng so sánh thuật toán từng thế cờ
- Bảng p50/p95/p99 ba cấp
- **Danh sách thế cờ ngoại lệ** (cắt tỉa duyệt nhiều hơn)
- Cấu hình máy chạy

## 9. ⚠ CẠM BẪY

| Lỗi lần trước | Phòng |
|---|---|
| **Đấu 60 ván chưa bao giờ chạy** — không có bằng chứng | Điều kiện PASS bắt buộc đủ 60 ván |
| Tuyên bố "78,86% cắt tỉa" mà **giấu 6/20 thế cờ ngược lại** (`F-25`) | `BR-AI-30` — bắt buộc liệt kê |
| Corpus **sai tên quân** ⇒ điểm vô hạn (`F-13`) | Đã chặn ở issue 033 |

⛔ **Không đạt thì ghi số thật + `BLOCKED`.** Tuyệt đối không hạ ngưỡng 50% để báo đạt — đó là **làm sai lệch chính nội dung học thuật** bạn mang đi bảo vệ.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-124

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** tests/ai/tournament.ts; tests/ai/benchmark.ts; tests/unit/issue-124.test.ts; docs/test-reports/ai/.
- **File test:** `tests/unit/issue-124.test.ts`.
- **Nhận từ phụ thuộc:** 033 reviewed quality manifest; 032 strict production benchmark; 123 complete AI; ai-validation§1–4.
- **Bàn giao:** Deterministic 60 games and algorithm comparison artifacts per manifest hash/seed; no Elo; experimental cap never product rule.
- **Trình tự xử lý tối thiểu:** Write full move logs and summary before calculating pass; scoring cap 0.5 only runner; compare manifest and results hash es rerun; bad move throws invalid run,not machine loss.

### Chuẩn bị và oracle từng nhóm ca

**Given:** Freeze 10 legal openings,colors,ordering,seed,watchdog before first score; 20 quality fixtures reviewed independently.

| ID test (tiền tố T124 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `60ván vàlặp` | 3 level pairs× 10 openings× 2 colors run depth 2/4/6, rerun same manifest | Exactly 60 complete or 200 ply capped games; each higher level>10 points/20; same moves/results rerun; illegal/han gin validates whole experiment. |
| `So sánh/quality` | Run minimax/alpha beta same position/history/depth/order; quality HARD | Same score+set best moves; nodes each fixture≤baseline,total strict less; report every exception as failure; ≥16/20 correct+5/5 repetition,20/20 legal. |
| `Hiệu năng evidence` | Attach 032 raw 100 samples/level,unfinished depth as Infinity nearest-rank | p 50 index 49,p 95 index 94,p 99 index 98; production budgets 300/1000/3000 unrelaxed; notusing deterministic tournament as deadline proof. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence124 = { games: number; invalidGames: number; pointsPerHigherLevel: number[]; replayHash: string; originalHash: string };

export function assertIssue124KeyCase(actual: Evidence124): void {
  expect(actual.games).toBe(60); expect(actual.invalidGames).toBe(0); expect(actual.pointsPerHigherLevel.every(p => p > 10)).toBe(true); expect(actual.replayHash).toBe(actual.originalHash);
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Count illegal as loss or shuffle ordering by wall clock; rerun hash/validity gate đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-124.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:unit -- tests/unit/issue-124.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit

```

**Chặn riêng của issue:** Thiếu independent human review/corpus freeze hoặc quality/speed/strength fail ⇒ BLOCKED; không đổi seed/fixture/threshold sau đo.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 135 run AI underload; 137 rerun strict benchmark hardware; 138 honest limitations.


### Dùng cùng oracle percentile của ISSUE-032

Không tạo công thức percentile thứ hai. Import `completionPercentile(values, p)` từ `tests/ai/gate-statistics.ts` của032, với `p=0.95`; đầu vào là thời gian hoàn thành đã ánh xạ thiếu depth sang `Infinity`.

```ts
import { expect, test } from 'vitest';
import { completionPercentile } from '../ai/gate-statistics';

test('p95 không che 6 mẫu thiếu depth6 bằng fallback nhanh', () => {
  const samples = Array.from({ length: 94 }, () => 2999);
  const incomplete = Array.from({ length: 6 }, () => Infinity);
  expect(completionPercentile([...samples, ...incomplete], 0.95)).toBe(Infinity);
  expect(completionPercentile([...samples, 3000, ...incomplete.slice(1)], 0.95)).toBe(3000);
});
```

Đây chỉ kiểm hàm thống kê. Bằng chứng hiệu năng dùng100 mẫu search thực/cấp từ032; chứng minh sức mạnh dùng đủ60 ván thực với manifest đã đóng băng. Mở rộng dispatcher `scripts/run-ai.mjs` của032 để chạy đúng hai entry dưới, trả nonzero nếu path sai hoặc không đủ ván/mẫu:

```bash
pnpm test:ai -- tests/ai/tournament.ts
pnpm test:ai -- tests/ai/benchmark.ts
pnpm test:ai
```

`tests/ai/tournament.ts` chạy toàn bộ60 ván và lần lặp cùng seed; `tests/ai/benchmark.ts` chạy so sánh minimax/alpha-beta cùng depth/order/history và tổng hợp số đo032. Không chỉ chạy test oracle rồi gọi thí nghiệm hoàn thành.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-AI-03` | [REQ-AI](../01-requirements/REQ-AI.md) | LOCAL |
| `AC-AI-16` | [REQ-AI](../01-requirements/REQ-AI.md) | LOCAL |
| `AC-AI-17` | [REQ-AI](../01-requirements/REQ-AI.md) | LOCAL |
| `AC-AI-18` | [REQ-AI](../01-requirements/REQ-AI.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
