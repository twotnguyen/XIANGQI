# ISSUE-030 — Alpha-beta pruning

**Nhóm:** E03 · **Phụ thuộc:** 028, 029 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Thêm cắt tỉa alpha-beta, và **chứng minh bằng số** rằng nó cho **cùng kết quả** với bản cơ sở nhưng duyệt **ít node hơn**.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-AI.md](../01-requirements/REQ-AI.md) **§10 `BR-AI-26`, `BR-AI-30`**

## 3. PHẠM VI
**✅ LÀM** — `searchAlphaBeta()` · so sánh với bản cơ sở
**❌ KHÔNG LÀM** — đào sâu dần (031)

## 4. FILE TẠO
`packages/ai/src/alpha-beta.ts`

## 5. CÁC BƯỚC
1. ```ts
   searchAlphaBeta(position, depth, counts, alpha?, beta?): SearchResult
   ```
2. Dùng `orderMoves()` từ issue 028 ở **mọi node**
3. Cắt nhánh khi `alpha >= beta`
4. **Giữ nguyên** cách tính điểm terminal và cách đếm node của issue 029
5. Viết hàm so sánh dùng cho test:
   ```ts
   compareSearches(position, depth, counts): {
     sameScore: boolean; sameBestMoveSet: boolean;
     minimaxNodes: number; alphaBetaNodes: number;
   }
   ```
6. **`BR-AI-30` — trung thực:** nếu có thế cờ mà alpha-beta duyệt **nhiều node hơn**, phải **ghi rõ trong báo cáo**, không giấu

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T030-01` | Trên **≥10 thế cờ**, cùng độ sâu: alpha-beta và cơ sở cho **cùng điểm** |
| `T030-02` | Cùng **tập nước tốt nhất** (điểm bằng nhau thì tập nước phải trùng) |
| `T030-03` | Mỗi thế: alpha-beta **không nhiều node hơn** cơ sở; **tổng số node** trên toàn bộ tập **ÍT HƠN** cơ sở |
| `T030-04` | **Tất định**: chạy 2 lần → số node **giống hệt** |
| `T030-05` | Cắt tỉa **không** đổi kết quả: `T029-01`, `T029-02`, `T029-06`, `T029-07` lặp lại vẫn đúng |
| `T030-06` | Nước trả về **luôn hợp lệ** |
| `T030-07` | Báo cáo **liệt kê rõ** thế cờ nào alpha-beta duyệt nhiều node hơn (nếu có) |

> **`T030-03` kiểm cả từng thế và tổng**, theo `BR-AI-26` và [ai-validation §4](../09-technical/ai-validation.md). Cùng độ sâu, cùng ordering và lịch sử: từng thế không tăng node, tổng phải giảm. Ngoại lệ phải ghi rõ và issue **BLOCKED**, không loại mẫu để đạt.

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 7 test xanh
- [ ] `T030-01` và `T030-02` trên **≥10** thế cờ
- [ ] `T030-03` từng thế không tăng node và tổng node **giảm thật**
- [ ] Báo cáo ghi **tỉ lệ cắt tỉa** và **danh sách thế cờ ngoại lệ**
- [ ] Từng thế cho phép bằng node, không cho phép tăng; chỉ tổng phải giảm nghiêm ngặt

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-030.md` — bảng từng thế cờ: node cơ sở · node alpha-beta · chênh lệch · điểm có khớp không.

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| Báo cáo ghi "78,86% cắt tỉa" mà **giấu** 6/20 thế cờ alpha-beta duyệt **nhiều hơn** (`F-25`) | `T030-07` bắt buộc liệt kê |
| Tỉ lệ cắt tỉa âm ở một thế dù đã dùng cùng protocol | Ghi ngoại lệ, giữ **BLOCKED**, kiểm lỗi ordering/bound/cách đếm; không giấu mẫu |

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

`searchAlphaBeta(position:Position,depth:number,counts:RepetitionCounts,alpha?:number,beta?:number):SearchResult`; mặc định window(-Infinity,+Infinity). `compareSearches` trong tests/fixtures/search-comparison.ts trả schema §5. Tập best moves xác định bằng chấm từng root child với full window, không dùng bound từ cutoff như exact score; số nodes so sánh lấy search root chuẩn riêng, không cộng oracle enumeration.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử:** `tests/unit/issue-030.test.ts`; helper `tests/fixtures/search-comparison.ts`.

Đóng băng manifest ít nhất 10 thế trước khi chạy: initial, các prefix hợp lệ của F-REPEAT, thế bắt quân, chiếu hết và gỡ chiếu. Mỗi hàng ghi ID, position, active history và depth 2 hoặc 3. Hai thuật toán dùng cùng ordering và counts.

- T030-01/02: trên từng thế, điểm bằng nhau và tập mọi nước tối ưu bằng nhau. Chấm từng root child với full window để xác định exact score; không dùng bound sau cutoff làm oracle.
- T030-03: số node của alpha-beta không vượt minimax ở từng thế; tổng trên tập phải giảm nghiêm ngặt. Không cộng các lần chạy bổ sung để dựng oracle vào số node đo.
- T030-04/06: chạy lại cùng input cho cùng node count; mọi nước trả về qua validateMove. Terminal được phép trả null.
- T030-05: chạy lại T029-01/02/06/07 trên alpha-beta.
- T030-07: lưu chênh lệch từng hàng, phần trăm giảm tổng và mọi ngoại lệ. Có ngoại lệ tăng node thì BLOCKED, không bỏ mẫu.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { searchMinimax, searchAlphaBeta } from '@xiangqi/ai';
import { createInitialPosition, countFromMoves } from '@xiangqi/game-rules';
test('T030-01/03 cùng điểm, không tăng node', () => {
  const p=createInitialPosition(); const counts=countFromMoves(p,[]);
  const base=searchMinimax(p,2,counts); const fast=searchAlphaBeta(p,2,counts);
  expect(fast.score).toBe(base.score);
  expect(fast.nodes).toBeLessThanOrEqual(base.nodes);
});
```
Bổ sung oracle root-child enumeration đã mô tả cho T030-02; chỉ so move được chọn chưa chứng minh tập đồng điểm.

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Cắt khi alpha<beta hoặc lưu bound thành điểm chính xác của node con ở gốc; T030-01/02 đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-030.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao bảng>=10 thế và tập nước tốt nhất; sửa ghi chú cũ cho phép node tăng: canonical BR-AI-26 yêu cầu mỗi thế không tăng, tổng giảm. Báo cáo trung thực không biến fail thành pass.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-AI-14` | [REQ-AI](../01-requirements/REQ-AI.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
