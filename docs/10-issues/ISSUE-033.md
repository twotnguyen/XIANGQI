# ISSUE-033 — Bộ 20 thế cờ + oracle review tay

**Nhóm:** E03 · **Phụ thuộc:** 032 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Dựng bộ thế cờ chuẩn với **đáp án do người review tay** — để đánh giá chất lượng AI mà **không** lấy chính output AI làm đáp án.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-AI.md](../01-requirements/REQ-AI.md) **§10 `BR-AI-24`, `BR-AI-25`** · [ai-validation](../09-technical/ai-validation.md) §3 (DEC-045)

## 3. PHẠM VI
**✅ LÀM** — 20 thế cờ + đáp án tay · **❌ LÀM SAU** — đấu 60 ván (124)

## 4. FILE TẠO
`tests/fixtures/ai-corpus.json` · `tests/ai/corpus.test.ts` · `docs/test-reports/ai-corpus-review.md`

## 5. CÁC BƯỚC
1. **20 thế cờ chia 4 nhóm, mỗi nhóm 5 thế**:
   | Nhóm | Nội dung |
   |---|---|
   | Bắt quân rõ | Có một nước ăn quân giá trị cao rõ ràng |
   | Thoát chiếu | Đang bị chiếu, chỉ vài cách gỡ |
   | Tàn cuộc / chiếu hết | Có đường chiếu hết trong 1–3 nước |
   | Tránh lặp | Một nước dẫn tới hoà do lặp, nước khác tốt hơn |
2. **Mỗi thế cờ phải có, trong file JSON**:
   ```json
   {
     "id": "corpus-01-bat-xe",
     "pieces": [...],
     "turn": "RED",
     "expectedBestMoves": [{"from":{"x":..},"to":{"x":..}}],
     "reasoning": "Xe đỏ ăn xe đen ở (4,2) vì ...",
     "reviewedBy": "<danh tính người thực sự review>",
     "reviewedAt": "<ngày review>",
     "initialPosition": {...},
     "activeHistory": [...],
     "category": "capture"
   }
   ```
3. **Trường `reasoning` bắt buộc** — giải thích **bằng lời** vì sao nước đó tốt
4. **Dùng đúng tên quân trong contracts**: `ROOK` · `PAWN` · `HORSE` · `CANNON` · `ELEPHANT` · `ADVISOR` · `GENERAL`. **Không** dùng `CHARIOT` hay `SOLDIER`
5. Mỗi thế cờ **phải có đủ hai tướng** — `makePosition` sẽ từ chối nếu thiếu
6. Đóng băng manifest version/hash/seed trước chạy; kiểm schema và replay lịch sử đủ hai tướng. Viết `corpus.test.ts` theo protocol ai-validation; HARD đúng ≥16/20, hợp lệ20/20, tránh lặp5/5. Không tự tick review tay bằng nhãn giả. Không dùng output AI làm oracle.
7. Từng thế tránh lặp phải chứng minh ba lần key từ activeHistory và nước tốt hơn hoà; nhánh bỏ không tính. Ghi thay đổi corpus thành version mới và chạy lại toàn bộ.

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T033-01` | Đúng **20** thế cờ, **5 mỗi nhóm** |
| `T033-02` | **Mọi** thế cờ nạp được bằng `makePosition` **không lỗi** |
| `T033-03` | **Mọi** thế cờ có đủ **hai tướng** |
| `T033-04` | **Mọi** `expectedBestMoves` là nước **hợp lệ** tại thế cờ đó |
| `T033-05` | **Mọi** thế cờ có `reasoning` không rỗng |
| `T033-06` | **Không** tên quân nào ngoài 7 tên chuẩn |
| `T033-07` | AI cấp HARD chọn nước **nằm trong** `expectedBestMoves` ở **≥ 16/20** thế |
| `T033-08` | Thế cờ nhóm "tránh lặp": **Cả5/5** fixture có lịch sử nhánh hiệu lực tái tạo đúng bàn; AI **không** chọn nước dẫn tới hoà |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 8 test xanh
- [ ] 20 thế cờ, mỗi thế có `reasoning` viết tay
- [ ] `T033-06` chứng minh tên quân chuẩn
- [ ] `T033-07` đạt ≥ 16/20
- [ ] File `ai-corpus-review.md` có sơ đồ và lập luận từng thế

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-033.md` + `ai-corpus-review.md` với sơ đồ 20 thế cờ.

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| Corpus dùng **sai tên quân** (`CHARIOT`, `SOLDIER`) ⇒ 12/20 thế cho **điểm vô hạn** (`F-13`) | `T033-06` |
| "Oracle độc lập" thực ra **đối chiếu bằng chính engine** ⇒ không chứng minh được chất lượng | Bước 3 — `reasoning` viết tay bắt buộc |

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Định nghĩa `AiCorpusEntry` trong tests/fixtures/ai-corpus-schema.ts với id/category/pieces/turn/initialPosition/activeHistory/expectedBestMoves/reasoning/reviewedBy/reviewedAt; category là capture/escape/mate/repetition. activeHistory lưu Move và turn After. JSONconcrete phải đúng 90 board hoặc descriptor hợp lệ, không dùng dấu... trong file thực.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/ai/corpus.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

20 qualityfixturesđộclập với 032,5 mỗi nhóm; reviewedBy danh tính thật. Muốn thêm review mới phải có người thực đọc sơ đồ+từng variation; nếu chưa có vẫn viết fixture/test nhưng issue BLOCKED, không ghi reviewedBy human giả.

- T033-01..03/06: schema all 20, category count 5,7 piece types, đúng 2 tướng, makePositionnạp; unknown enum/trùng ô/thiếu tướng âm phải đỏ.
- T033-04/05: all oracle Moves validate; reasoning chỉ rõ phản biện, review metadata thật; không tạo oracle bằng search output.
- T033-07: đóng băng hash trước run, HARD seed cố định 6/3000; mỗi hàng chứa nước chọn/oracle/depth/nodes/elapsed;≥16/20, legal 20/20.
- T033-08:5 trapsreplayactiveHistory đúng position, có key ply 1/2/3 chứngminhtrapdraw, alternativebetterthandraw reviewed; clear history/mixinabandonedbranch phải làm trapassertionfail.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { createInitialPosition, countFromMoves, occurrencesOf } from '@xiangqi/game-rules';
// Ca âm bảo vệ ý nghĩa lịch sử, dùng chuỗi F-REPEAT làm kiểm reader trước corpus20.
test('T033-08 xóa lịch sử làm mất bằng chứng lần thứ ba', () => {
  const p=createInitialPosition();
  const cycle=[{from:{x:1,y:9},to:{x:2,y:7}},{from:{x:1,y:0},to:{x:2,y:2}},
    {from:{x:2,y:7},to:{x:1,y:9}},{from:{x:2,y:2},to:{x:1,y:0}}];
  expect(occurrencesOf(countFromMoves(p,[...cycle,...cycle]),p)).toBe(3);
  expect(occurrencesOf(countFromMoves(p,[]),p)).toBe(1);
});
```
Đây là kiểm reader bổ sung; T033-08 vẫn phải chạy cả năm fixture tránh lặp thật có continuation tốt hơn hoà.

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Cho readerbỏactiveHistory hoặc tínhabandonedbranch; nămtraptestđỏ. Không sửa expectedBestMoves để chữ a search sai.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:ai -- tests/ai/corpus.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:ai
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao 20 sơ đồ, review identity+ngày, hash/raw results; thiếu review tay là BLOCKED nội bộ, không giả DONE.124 dùng manifest đã đóng băng nhưng có protocol 60 ván riêng.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-AI-15` | [REQ-AI](../01-requirements/REQ-AI.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
