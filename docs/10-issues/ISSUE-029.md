# ISSUE-029 — Minimax / negamax cơ sở

**Nhóm:** E03 · **Phụ thuộc:** 027, 028, 010 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Thuật toán tìm kiếm **cơ sở**, không cắt tỉa — làm mốc so sánh cho alpha-beta ở issue 030.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-AI.md](../01-requirements/REQ-AI.md) §10 `BR-AI-21`, `BR-AI-29`

## 3. PHẠM VI
**✅ LÀM** — `searchMinimax()` độ sâu cố định · đếm node
**❌ KHÔNG LÀM** — cắt tỉa (030) · deadline (031)

## 4. FILE TẠO
`packages/ai/src/minimax.ts`

## 5. CÁC BƯỚC
1. ```ts
   searchMinimax(position, depth, counts: RepetitionCounts): SearchResult
   ```
2. Dùng dạng **negamax** — một hàm duy nhất, đảo dấu mỗi tầng. Ghi chú trong mã giải thích nó **tương đương** minimax (cần cho bảo vệ đồ án)
3. **Giá trị terminal**:
   | Tình huống | Điểm |
   |---|---|
   | Thua (chiếu hết / hết nước) | `-100000 + plyFromRoot` |
   | Hoà (lặp 3 lần) | `0` |
   | Hết độ sâu | `evaluate(position)` |
4. `plyFromRoot` khiến AI **chọn đường thắng nhanh nhất** và **kéo dài đường thua**
5. **Đếm node**: tăng **1** cho **mỗi thế cờ được thăm**, kể cả node gốc và node terminal (`BR-AI-20`)
6. Node gốc không có nước đi hợp lệ → trả `move: null`
7. Phải **xét lịch sử lặp** khi tìm kiếm (`BR-AI-07`)

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T029-01` | Thế **chiếu hết sau 1 nước** → tìm ra đúng nước chiếu hết |
| `T029-02` | Thế **ăn quân rõ ràng** → chọn nước ăn quân giá trị cao nhất |
| `T029-03` | Node gốc không có nước → `move: null`, không ném lỗi |
| `T029-04` | `nodes > 0` và tăng theo độ sâu |
| `T029-05` | **Tất định**: cùng thế + cùng độ sâu → **cùng nước, cùng điểm, cùng số node** |
| `T029-06` | Thế dẫn tới lặp 3 lần → tính là **hoà (0 điểm)**, không phải thắng |
| `T029-07` | Mate distance: thắng ở độ sâu 1 **điểm cao hơn** thắng ở độ sâu 3 |
| `T029-08` | Hàm **không sửa** `position` hay `counts` |
| `T029-09` | Nước trả về **luôn hợp lệ** — kiểm bằng `validateMove` |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 9 test xanh
- [ ] `T029-05` chứng minh **tất định**
- [ ] `T029-09` chứng minh **không bao giờ trả nước sai luật**
- [ ] Cách đếm node có **chú thích rõ** trong mã
- [ ] Có chú thích giải thích negamax ≡ minimax

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-029.md` — ghi số node ở depth 1, 2, 3 từ thế cờ ban đầu.

## 9. ⚠ CẠM BẪY
| Lỗi hay gặp | Phòng |
|---|---|
| Đếm node không nhất quán ⇒ so sánh với alpha-beta **vô nghĩa** | Bước 5, chú thích bắt buộc |
| Quên `plyFromRoot` ⇒ AI chọn đường thắng **dài** thay vì ngắn | `T029-07` |
| Trả nước không hợp lệ ⇒ máy chủ từ chối, ván hỏng | `T029-09` |

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

`searchMinimax(position:Position,depth:number,counts:RepetitionCounts):SearchResult`; dependency 010 cho SearchResult và 028 cho ordering so 030. depth nguyên>=0. Depth 0: move:null, pv:[], score heuristic hoặc terminal, nodes 1, completedDepth 0, aborted false. Search độ sâu cố định không deadline; elapsedMs được đo monotonic thật ở wrapper, không tham gia tất định.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/issue-029.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Tạo `tests/fixtures/search-positions.ts`: `mateInOne` BLACK GENERAL(4,0), RED GENERAL(4,9), RED PAWN(4,5), RED ROOK(3,1),(5,1),(0,2), RED turn; nước (0,2) → (4,2) chiếu hết. Hai xe (3,1)/(5,1) khống chế (3,0), (5,0), (4,1); xe mới tới (4,2) chiếu theo cột 4. Thêm capture fixture 028; F-MATE/F-STALEMATE 024; initial và F-REPEAT 025 counts.

- T029-01: search depth 1 chọn một nước trong tập mate-in-one đã review tay, apply+terminal CHECKMATE; không bắt duy nhất nước nếu tồn tại nước đồng điểm.
- T029-02: fixture ăn xe không bị bảo vệ, score tốt nhất so các quân rẻ hơn.
- T029-03/04: root terminal nodes 1/move null; initial depth 0 nodes 1, depth 1 nodes 45, depth 2>45.
- T029-05/08/09: cùng input depth counts →move/score/nodes/PV giống, không so elapsedMs; freeze input/counts; validate mỗi move.
- T029-06: counts rootkey 3 → score 0/move null dù còn nước hợp lệ; counts branch cập nhật trước terminal không ảnh hưởng nhánh anh em.
- T029-07: scorer terminal tại ply 1=-99999, ply 3=-99997 từ bên thua; đổi dấu root thích mate 1; fixture có cả đường nhanh/chậm và kiểm PV.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { searchMinimax } from '@xiangqi/ai';
import { createInitialPosition, countFromMoves } from '@xiangqi/game-rules';
test('T029-04 node gốc cũng được đếm', () => {
  const p=createInitialPosition(); const counts=countFromMoves(p,[]);
  expect(searchMinimax(p,0,counts).nodes).toBe(1);
  expect(searchMinimax(p,1,counts).nodes).toBe(45);
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Không cộng rootnode hoặc quên undo repetition count sau nhánh; T029-04/06/08 đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-029.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao độ sâu cố định reference/node convention;030 không được dùng cùng hàm search cho cả hai oracle.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
