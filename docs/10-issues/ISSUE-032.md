# ⛔ ISSUE-032 — CỔNG ĐO AI: depth 6 trong 3000 ms

**Nhóm:** E03 · **Phụ thuộc:** 031 · **Trạng thái:** TODO
**LOẠI: CỔNG CHẶN — không đạt thì KHÔNG được làm tiếp E18**

---

## 1. MỤC TIÊU

Trả lời câu hỏi **chưa ai từng đo**: *TypeScript có chạy nổi depth 6 trong 3 giây không?*

## 2. VÌ SAO ĐÂY LÀ CỔNG CHẶN

Lần xây dựng trước tuyên bố hoàn thành, nhưng báo cáo AI **tự ghi rõ**:

| Hạng mục | Thực tế lần trước |
|---|---|
| Benchmark | **Chỉ depth 2** |
| Ngân sách p95 | **Chưa đo** |
| Đấu 60 ván | **Chưa đo** |
| Hành vi hết giờ | Deadline 10.000 ms **chưa lần nào bị chạm** |

⇒ Toàn bộ lựa chọn **TypeScript** (`DEC-025`) dựa trên giả định này. **Phải kiểm chứng trước khi đi tiếp.**

## 3. ĐỌC TRƯỚC

[../09-technical/tech-stack.md](../09-technical/tech-stack.md) **§4 `TECH-08`** — đọc kỹ thứ tự tối ưu · [ai-validation](../09-technical/ai-validation.md) §1–2 (DEC-045).

## 4. PHẠM VI

**✅ LÀM** — đo thời gian thật cho 3 cấp trên 20 thế cờ
**❌ KHÔNG LÀM** — tối ưu trước khi đo (phải biết số thật trước)

## 5. FILE TẠO

`tests/ai/gate-depth.bench.ts` · `tests/fixtures/ai-positions.ts`

## 6. CÁC BƯỚC

1. Dựng **20 thế cờ** đa dạng: 5 khai cuộc · 5 trung cuộc đông quân · 5 tàn cuộc · 5 thế có nhiều nước ăn
2. Với **mỗi cấp**, **mỗi thế cờ**, chạy **5 lần lặp**:
   | Cấp | Độ sâu | Ngân sách |
   |---|---|---|
   | EASY | 2 | 300 ms |
   | MEDIUM | 4 | 1000 ms |
   | HARD | **6** | **3000 ms** |
3. Đo bằng **đồng hồ thật** (`performance.now()`) — đây là benchmark, **không** phải unit test
4. Tính **p50 · p95 · p99 · max** theo protocol ai-validation: mẫu chưa hoàn thành mục tiêu = +∞; nearest-rank trên100 mẫu/cấp; lưu cả thời gian trả thực tế riêng
5. Ghi thêm: số node · `completedDepth` đạt được · tỉ lệ `aborted`
6. Ghi **cấu hình máy chạy**, seed, commit, hash/version corpus, warm-up và mọi mẫu thất bại vào báo cáo. Corpus đóng băng trước đo; không loại outlier; không dùng fallback nhanh thay hoàn thành depth. DEC-045 loại sàn90% yếu hơn cổng p95, không cộng biên độ.

## 7. ⛔ ĐIỀU KIỆN PASS

- [ ] **HARD: p95 hoàn thành depth6 ≤3000 ms**, ít nhất95/100 hoàn thành trong ngân sách
- [ ] **MEDIUM: p95 hoàn thành depth4 ≤1000 ms**, ít nhất95/100 hoàn thành trong ngân sách
- [ ] **EASY: p95 hoàn thành depth2 ≤300 ms**, ít nhất95/100 hoàn thành trong ngân sách
- [ ] **0 lần** trả nước không hợp lệ
- [ ] **0 lần** treo quá 2× ngân sách
- [ ] Báo cáo có đủ p50/p95/p99/max cho cả 3 cấp
- [ ] Báo cáo ghi cấu hình máy

## 8. NẾU KHÔNG ĐẠT — LÀM THEO ĐÚNG THỨ TỰ NÀY

> ⚠ **Không được đảo thứ tự. Không được đổi ngôn ngữ ngay.**

| # | Việc | Đo lại sau mỗi bước |
|---|---|---|
| **1** | Bỏ **mọi cấp phát bộ nhớ** trong vòng lặp sinh nước đi và lượng giá. Dùng mảng số nguyên, tái dùng bộ đệm, **không** `map`/`filter`/object tạm | ✅ |
| **2** | Cải thiện **sắp xếp thứ tự nước đi** — killer move, history heuristic | ✅ |
| **3** | Thêm **bảng ghi nhớ thế cờ** (transposition table) | ✅ |
| **4** | **Chỉ khi cả 3 bước trên vẫn không đủ** → báo người dùng, xét đổi **toàn bộ** backend + AI sang .NET theo `DEC-025` §5 | — |

**Mỗi bước phải chạy lại cổng đo và ghi số vào báo cáo.**

## 9. BẰNG CHỨNG

`docs/test-reports/ISSUE-032.md` — **bắt buộc** có:
- Bảng p50/p95/p99/max cho 3 cấp
- Cấu hình máy (CPU, RAM, hệ điều hành, phiên bản Node)
- Nếu phải tối ưu: **số trước và sau** từng bước

## 10. ⚠ CẠM BẪY

**Tuyệt đối không hạ ngưỡng để báo đạt.** Nếu depth 6 không đạt trong 3000 ms, ghi **số thật** và chuyển sang mục 8. Hạ ngân sách xuống cho vừa số đo là **làm sai lệch chính nội dung học thuật** mà bạn sẽ mang đi bảo vệ.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Tạo runner thật `scripts/run-ai.mjs` và Vitest AI config hoặc benchmarkdispatch hỗ trợ `pnpm test:ai -- tests/ai/gate-depth.bench.ts`; sai pathfail. Parent spawnprocessbenchmark đơn lẻ, watchdog 2 ×budget kếtthúcprocesskhi treo. Đây là runnerđo, không phải production worker 118. Export `completionPercentile(samples,p)` trong tests/ai/gate-statistics.ts, unit test ở tests/unit/issue-032.test.ts.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/ai/gate-depth.bench.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Corpus performance 20 thế:5 opening/5 dense/5 end game/5 capture; manifest SHA256/version/seed/ruleset. Mỗi mẫu {fixture Id, level, repeat, target Depth, budgetMs, actual Elapsed Ms, completedDepth, nodes, move, aborted, terminationReason}; JSON biểu diễn Infinity bằng null + completion Failed:true, không để JSON.stringify tự mất ý nghĩa.

- G032-01: unit 100 samples gồm 95 complete≤budget+5 unfinished → p95 ở sample 95;94 complete+6 unfinished → p95 Infinity fail.
- G032-02: warmup 20 thế/cấp không đếm; xóaTT từng mẫu; exact ly 100 mẫu/cấp,300 tổng.
- G032-03: độ sâu cố định 2/4/6, measureperformance.now ngay trước sau call; incomplete=Infinity cho completionpercentile; báo actual return riêng.
- G032-04: child cố ý treo trongrunner-test bị watchdog 2 ×budget; đó là test harness âm, không đưa vào corpus; realsearchtreolàmBLOCKED.
- G032-05: validate all 300 moves; mỗi levelp95≤budget đúng,0 invalid,0 treo quá 2 ×; thiếu 1 mẫu không PASS.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { completionPercentile } from '../ai/gate-statistics';
// Hàm nhận số completion ms đã ánh xạ unfinished thành +Infinity, nearest-rank.
test('G032-01 không lấy fallback nhanh làm thành công', () => {
  const success=Array.from({length:94}, () => 2999);
  const unfinished=Array.from({length:6}, () => Number.POSITIVE_INFINITY);
  expect(completionPercentile([...success,...unfinished],0.95)).toBe(Infinity);
  expect(completionPercentile([...success,2999,...unfinished.slice(1)],0.95)).toBe(2999);
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Map unfinished sang actual Elapsed thay Infinity; G032-01 đỏ. Giả thiếu mẫu phải runnerfail, không chỉ percentile tự giảm số mẫu.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-032.test.ts
pnpm test:ai -- tests/ai/gate-depth.bench.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:ai
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao raw 300 mẫu, manifest, warmup, hardware, summary và trạng thái cổng. Bấtkỳlevelkhông đạt → BLOCKED, tối ưu TECH08 đúng thứ tự; E18 chưa được bắt đầu. Không tuyên bố chất lượng 033 đạt từspeed.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-AI-04` | [REQ-AI](../01-requirements/REQ-AI.md) | LOCAL+INTERNET |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
