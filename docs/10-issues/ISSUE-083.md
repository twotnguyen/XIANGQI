# ISSUE-083 — Chuyển động nước đi

**Nhóm:** E10 · **Phụ thuộc:** 082 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Quân di chuyển mượt, và **đánh dấu rõ nước vừa đi**.

## 2. ĐỌC TRƯỚC
[../09-technical/tech-stack.md](../09-technical/tech-stack.md) **§2.1** · [../03-screens/design-tokens.md](../03-screens/design-tokens.md) §9 `DT-19`

## 3. PHẠM VI
**✅ LÀM** — chuyển động · đánh dấu nước vừa đi · báo bị chiếu
**❌ KHÔNG LÀM** — đồng bộ thời gian thực (091)

## 4. FILE SỬA
`apps/web/src/components/board/Piece.tsx` · `board.module.css`

## 5. CÁC BƯỚC
1. Chuyển động bằng `transform: translate()` + `transition`, khoảng **150–200 ms**
   > Đủ để mắt theo kịp, không làm người chơi sốt ruột (`tech-stack` §2.1)
2. ⭐ **Tôn trọng `prefers-reduced-motion`** — người dùng tắt hiệu ứng thì **không** chuyển động
3. **`DT-19`** — đánh dấu rõ **ô đi** và **ô đến** của nước vừa thực hiện
4. **`BR-BRD-13`** — bị chiếu phải báo **bằng chữ**: *"Đang bị chiếu"* + làm nổi bật tướng
   ⛔ **Không** chỉ đổi màu (`DT-01`)
5. Quân bị ăn biến mất có hiệu ứng nhẹ
6. Chuyển động **không** chặn thao tác tiếp theo

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T083-01` | Quân di chuyển có chuyển động, thời lượng **150–200 ms** |
| `T083-02` | ⭐ **Bật `prefers-reduced-motion` → KHÔNG chuyển động**, quân nhảy thẳng |
| `T083-03` | ⭐ **Nước vừa đi được đánh dấu** cả ô đi và ô đến |
| `T083-04` | Nước tiếp theo → dấu cũ **biến mất**, dấu mới hiện |
| `T083-05` | ⭐ **Bị chiếu → có CHỮ báo**, không chỉ đổi màu |
| `T083-06` | Quân bị ăn biến mất đúng |
| `T083-07` | Đang chuyển động vẫn **thao tác tiếp được**, không bị chặn |
| `T083-08` | Chuyển động mượt ở **360px** |
| `T083-09` | Đồng bộ nhiều nước liên tiếp → **không** rối loạn hiển thị |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 9 test xanh
- [ ] **`T083-02`** tôn trọng tuỳ chọn giảm chuyển động
- [ ] **`T083-05`** báo chiếu bằng chữ
- [ ] `T083-03` đánh dấu nước vừa đi
- [ ] `T083-07` không chặn thao tác

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-083.md`

## 9. ⚠ CẠM BẪY
Bỏ qua `prefers-reduced-motion` là lỗi trợ năng — người bị say chuyển động sẽ khó chịu. Đây là tuỳ chọn hệ điều hành, phải tôn trọng.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** Piece render confirmed position bằng transform transition 150–200 ms; reduced motion 0; lastmovefrom/to 2 marker, check có text. Snapshotburst thayrender mới, không queue apply nước đã cũ.

**Tiền điều kiện cụ thể:** Component fixture snapshotsversion 0/1/2 với capture/check; browser reduced motion on/off, 360 viewport; CSScomputedstyle là oracle thời lượng.

**File kiểm thử:** `tests/e2e/issue-083.spec.ts` · `tests/unit/issue-083.test.ts`. Giữ tên `T083-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T083-01` | Applysnapshotmove; computedtransition duration thuộc 150–200 ms và property transform. | Quân di chuyển có chuyển động, thời lượng **150–200 ms** |
| `T083-02` | Emulate reducedMotion=reduce; duration 0/none, pieceđích ngay không chờ. | ⭐ **Bật `prefers-reduced-motion` → KHÔNG chuyển động**, quân nhảy thẳng |
| `T083-03` | Movefrom 0, 6 to 0, 5; đúng 2 marker source/dest. | ⭐ **Nước vừa đi được đánh dấu** cả ô đi và ô đến |
| `T083-04` | Snapshotnextmove; markers chỉ move mới, marker old bị xoá. | Nước tiếp theo → dấu cũ **biến mất**, dấu mới hiện |
| `T083-05` | FixturecheckRED; text Đang bị chiếu vàhighlighttướngRED, không chỉ color. | ⭐ **Bị chiếu → có CHỮ báo**, không chỉ đổi màu |
| `T083-06` | Snapshotcapture; capturedpiecekhôngcònDOM/accessible tree sautransition, count giảm 1. | Quân bị ăn biến mất đúng |
| `T083-07` | Trongtransition, keyboard/tap đích hợp lệ vẫn phản hồi, animationkhônglockinput. | Đang chuyển động vẫn **thao tác tiếp được**, không bị chặn |
| `T083-08` | 360 pxtrace/screenshot; không layout shift/overflow, glyphnét. | Chuyển động mượt ở **360 px** |
| `T083-09` | Dispatchsnapshots 1/2/3 nhanh; final render khớp version 3, không quân ma/marker old. | Đồng bộ nhiều nước liên tiếp → **không** rối loạn hiển thị |



### 10.3 Điểm triển khai cần giữ đúng

```css
.piece { transition: transform 180ms ease-out; }
@media (prefers-reduced-motion: reduce) {
  .piece { transition: none; }
}
```
Áp dụng class CSS module thực của Piece; không đổi state nghiệp vụ theo animationend.

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **bỏ mediaquery reduced motion hoặc giữ marker nước trước**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-083.md`.

```bash
pnpm test:e2e -- tests/e2e/issue-083.spec.ts
pnpm test:unit -- tests/unit/issue-083.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:e2e
```

**Đóng issue:** mọi test trong ma trận và mọi ô PASS phía trên đạt; không `.only`/`.skip`, không thiếu lane. Các gate tích hợp tương lai được nêu đích danh trong issue phải có chủ sở hữu/bằng chứng riêng, không ghi chúng PASS bằng spy/fixture. Chỉ đổi `TODO` sang `DONE` sau PR đã merge theo WORKFLOW.

**BLOCKED và bàn giao:** thiếu capability dependency hoặc invariant trong 10.1 chưa kiểm được ⇒ `BLOCKED`, ghi đúng test/đầu vào/response sai và commit liên quan. PostgreSQL/socket/browser cần cho ma trận không chạy được ⇒ test phải đỏ; không bỏ qua hoặc thay bằng dữ liệu tự dựng để báo đạt. Bàn giao đường dẫn file thực đã sửa, exported interface/DTO, migrations nếu có, các test ID đạt/chưa đạt, bằng chứng fault injection, và tên issue kế tiếp sử dụng hợp đồng ở 10.1; không bàn giao chỉ một câu “đã xong”.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-BRD-05` | [REQ-BOARD](../01-requirements/REQ-BOARD.md) | LOCAL |
| `AC-BRD-13` | [REQ-BOARD](../01-requirements/REQ-BOARD.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
