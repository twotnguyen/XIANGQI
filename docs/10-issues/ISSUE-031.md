# ISSUE-031 — Đào sâu dần + deadline + huỷ

**Nhóm:** E03 · **Phụ thuộc:** 030 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Tìm kiếm theo **ngân sách thời gian**: đào sâu dần từng mức, dừng khi hết giờ hoặc bị huỷ, và **luôn có nước dự phòng**.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-AI.md](../01-requirements/REQ-AI.md) §7, §10 `BR-AI-09`

## 3. PHẠM VI
**✅ LÀM** — `searchBestMove()` với deadline và cờ huỷ
**❌ KHÔNG LÀM** — tiến trình riêng (118) · worker thread (119)

## 4. FILE TẠO
`packages/ai/src/search.ts` · `packages/ai/src/levels.ts`

## 5. CÁC BƯỚC
1. ```ts
   type SearchInput = {
     position: Position; repetitionCounts: RepetitionCounts;
     maxDepth: number; deadlineMonoMs: number;
     algorithm: 'MINIMAX' | 'ALPHA_BETA'; seed: number;
   };
   searchBestMove(
     input: SearchInput,
     now: () => number,          // TIÊM VÀO — để test bằng đồng hồ giả
     isCancelled: () => boolean, // TIÊM VÀO
   ): SearchResult;
   ```
2. **Đào sâu dần**: chạy depth 1, 2, 3… tới `maxDepth`. Sau mỗi mức **hoàn tất**, lưu nước tốt nhất và dùng làm `pvMove` cho mức sau
3. **Kiểm deadline và cờ huỷ**: ở **node gốc** và **mỗi 64 node** ở tầng sâu
4. Hết giờ giữa chừng một mức ⇒ **bỏ kết quả mức đó**, trả kết quả mức **hoàn tất cuối cùng**, đặt `aborted: true`
5. **Hết giờ trước khi xong cả depth 1** ⇒ trả **nước đầu tiên theo `orderMoves`** — **không bao giờ** trả `null` khi còn nước hợp lệ
6. `levels.ts` xuất cấu hình 3 cấp từ `AI_LEVELS` (issue 010)
7. Bộ đếm độ sâu tăng/giảm trong `try/finally` để không lệch khi thoát sớm

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T031-01` | Ngân sách rộng rãi → `completedDepth === maxDepth`, `aborted === false` |
| `T031-02` | **Đồng hồ giả**: hết giờ sau depth 2 → trả kết quả **depth 2**, `aborted === true` |
| `T031-03` | **Hết giờ trước depth 1** → vẫn trả **nước hợp lệ**, `move !== null` |
| `T031-04` | `isCancelled()` trả true giữa chừng → dừng **ngay**, trả kết quả gần nhất |
| `T031-05` | `pvMove` từ mức trước được dùng ở mức sau (số node **giảm** so với không dùng) |
| `T031-06` | Nước trả về **luôn hợp lệ** ở mọi tình huống hết giờ |
| `T031-07` | Ba cấp có đúng `depthCap` và `budgetMs` theo `AI_LEVELS` |
| `T031-08` | **Không** dùng `Date.now()` trực tiếp — chỉ dùng `now()` được tiêm |
| `T031-09` | Tất định với cùng `seed` và cùng ngân sách |

> Toàn bộ test thời gian dùng **đồng hồ giả**, **không** chờ thật (`WORKFLOW` §4 luật 1).

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 9 test xanh
- [ ] `T031-03` chứng minh **luôn có nước dự phòng**
- [ ] `T031-08` chứng minh đồng hồ được **tiêm vào**
- [ ] `T031-04` chứng minh huỷ có tác dụng
- [ ] Không test nào chờ thật

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-031.md`

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| Deadline **chưa bao giờ bị chạm** trong benchmark ⇒ hành vi hết giờ **không được kiểm chứng** | `T031-02`, `T031-03`, `T031-04` dùng đồng hồ giả để **ép** chạm deadline |
| Dùng `Date.now()` trực tiếp ⇒ không test được | `T031-08` |

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Giữ Search Input/searchBestMove chữ ký§5, export Search Input. Đồng hồ monotonic now vàcancellation tiêm vào; count check tại root/mỗi 64 nodes. Thêm test-only observer tùychọn ở searchcore `onDepthComplete(depth,result)` (không export network), dùng test đổi clock sau depth 2; không mock thuật toán.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/issue-031.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Clock 003 start 0, deadline 1000; observer depth 2 clock.set(1000), vòng depth 3 gặp deadline. isCancelled flag đổi tại checkpoint đo được; không set Timeout. Baseline depth 2 của 030 là oracle kết quả last complete.

- T031-01: clock now 0 mọi lúc, maxDepth 3 → completed 3, aborted false.
- T031-02: observer sau complete 2 đẩy clock đúng deadline → completed 2, move/score/PV bằng result đã lưu depth 2, aborted true.
- T031-03/06: now=deadline ở root, cònlegal → orderedfallbacknonnull, completed 0; root terminal move null đúng.
- T031-04: flipcancel khi now/check observer tới checkpoint; thăm thêm không quá 64 nodes đến check kế, không đòi dừng giữa 1 node.
- T031-05: corpus đã chọn có lợi từ PV chạyusePV/noPV controlled internal option, cùng score, tổng nodes giảm; không đổi fixture sau đo.
- T031-07..09: levels exact; staticsearchcore không Date.now; seed+clock trace giống → kết quả giống.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { searchBestMove } from '@xiangqi/ai';
import { createInitialPosition, countFromMoves, validateMove } from '@xiangqi/game-rules';
test('T031-03 hết giờ tại root vẫn có fallback', () => {
  const position=createInitialPosition();
  const result=searchBestMove({position,repetitionCounts:countFromMoves(position,[]),
    maxDepth:6,deadlineMonoMs:1000,algorithm:'ALPHA_BETA',seed:1}, () => 1000, () => false);
  expect(result.aborted).toBe(true); expect(result.completedDepth).toBe(0);
  expect(result.move).not.toBeNull();
  if (!result.move) throw new Error('Thiếu fallback');
  expect(validateMove(position,result.move)).toEqual({valid:true});
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Đổi deadline>= thành> hoặc cập nhật best từ depth đang dở; T031-02/03 đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-031.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao observer/clock trace và fallback;032 benchmark độ sâu cố định riêng không lấy fallback nhanh làm đạt depth.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
