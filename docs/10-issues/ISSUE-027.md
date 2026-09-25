# ISSUE-027 — Lượng giá: độ linh hoạt + an toàn tướng

**Nhóm:** E03 · **Phụ thuộc:** 026 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Bổ sung hai thành phần còn lại của hàm lượng giá theo `BR-AI-23`.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-AI.md](../01-requirements/REQ-AI.md) §10

## 3. PHẠM VI
**✅ LÀM** — độ linh hoạt · an toàn tướng · gộp vào `evaluate()`
**❌ KHÔNG LÀM** — tìm kiếm (029)

## 4. FILE SỬA
`packages/ai/src/evaluate.ts`

## 5. CÁC BƯỚC
1. **Độ linh hoạt** — số nước đi khả dĩ, có trọng số thấp (~2 điểm/nước). Dùng cách đếm **rẻ**, không gọi `getLegalMoves` đầy đủ (quá tốn)
2. **An toàn tướng** — phạt khi:
   - Tướng đang bị chiếu
   - Tướng rời khỏi tâm cung khi chưa cần
   - Thiếu sĩ/tượng bảo vệ
3. Gộp: `evaluate = vậtChất + vịTrí + linhHoạt + anToànTướng`
4. **Giữ nguyên quy ước dấu** và **tính đối xứng** của 026
5. Vẫn **không cấp phát trong vòng lặp**

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T027-01` | **Đối xứng vẫn giữ** sau khi thêm 2 thành phần (`T026-02` lặp lại) |
| `T027-02` | Thế bị chiếu bị **phạt điểm** so với thế tương tự không bị chiếu |
| `T027-03` | Bên nhiều nước đi hơn được **cộng điểm** |
| `T027-04` | **Giá trị terminal thắng giá trị vật chất**: thế sắp bị chiếu hết bị chấm tệ hơn thế thiếu một xe |
| `T027-05` | Mất cả 2 sĩ → điểm an toàn tướng **giảm** |
| `T027-06` | Hàm thuần, không sửa đầu vào |
| `T027-07` | Đo thời gian: 100.000 lần gọi → ghi số ms vào báo cáo |

> `T027-07` **chưa phải cổng chặn**, nhưng là số liệu để biết trước liệu có vượt được **032** hay không.

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 7 test xanh
- [ ] `T027-01` chứng minh **vẫn đối xứng**
- [ ] `T027-04` chứng minh thứ tự ưu tiên đúng
- [ ] Báo cáo có số ms của `T027-07`
- [ ] Không cấp phát trong vòng lặp

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-027.md` — bắt buộc có **số lần gọi/giây**.

## 9. ⚠ CẠM BẪY
Gọi `getLegalMoves` đầy đủ bên trong hàm lượng giá sẽ làm chậm **hàng chục lần**. Dùng cách đếm xấp xỉ rẻ tiền cho độ linh hoạt.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Giữ evaluate(Position):number; tách helpers nội bộ `mobilityScore(board,side):number`, `generalSafetyScore(board,side):number` để đo riêng thành phần, không dùng getLegalMoves trong vòng lặp nóng. Scoreterminal thuộc search 029; test ưu tiên terminal dùng getTerminalOutcome 024 cùng quy ước terminal−100000+ply (không ép heuristic đoán mọi mate 3).

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/issue-027.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Cặp an toàn giữ material/PST giống nhau bằng so riêng helper: RED GENERAL(4,9), BLACK GENERAL(3,0), BLACK ROOK(4,5) chiếu; rook → (2,5) hết chiếu. Mobility rook(0,5) trống so bịquâncùngbênkẹp; dùng helper cô lập khỏi material.

- T027-01/06: mọi fixture và turn đảo, deepfreeze input.
- T027-02: safetyREDcheck ít điểm hơn cặpnoncheck; không suy từ tổng score chứa điểm vị trí khác.
- T027-03: mobility rook trống > blocked theo số tia đếm tay.
- T027-04: F-MATE terminalscore−100000 nhỏ hơn nonterminal thiếu một xe; terminal phải được đánh trước heuristic khi 029 tích hợp.
- T027-05: safety có 2 sĩ >(mất 2 sĩ), kiểm component chứ không chỉ material.
- T027-07: vòng 100000 call với checksum để không bỏ kết quả; performance.now benchmark thật và môi trường, không ngưỡng tự đặt.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { evaluate } from '@xiangqi/ai';
import { createInitialPosition } from '@xiangqi/game-rules';
test('T027-01 không phá đối xứng khi cộng thành phần', () => {
  const p=createInitialPosition(); const board=[...p.board]; board[84]=null;
  expect(evaluate({board,turn:'RED'})).toBe(-evaluate({board,turn:'BLACK'}));
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Cộng safety theo góc nhìn RED mà quên đảo dấu turn; T027-01 đỏ; spy getLegalMoves phải không được gọi trong evaluate.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-027.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giaoweights và 100000 call/ms/checksum; báo BLOCKED nếu chưa có component test;029 chịu trách nhiệm terminalpriority trong search.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
