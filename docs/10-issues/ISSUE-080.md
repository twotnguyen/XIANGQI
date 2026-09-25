# ISSUE-080 — Chọn quân + hiện đích hợp lệ

**Nhóm:** E10 · **Phụ thuộc:** 079, 023 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Thao tác **chạm quân → chạm đích**, có gợi ý nước hợp lệ.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-BOARD.md](../01-requirements/REQ-BOARD.md) §5, §9 `BR-BRD-01/07` · [../03-screens/design-tokens.md](../03-screens/design-tokens.md) §9

## 3. PHẠM VI
**✅ LÀM** — chọn/bỏ chọn · hiện đích · gửi ý định đi
**❌ KHÔNG LÀM** — lật bàn (081) · bàn phím (082)

## 4. FILE SỬA
`apps/web/src/components/board/Board.tsx` · `useBoardSelection.ts`

## 5. CÁC BƯỚC
1. **`BR-BRD-01`** — thao tác chính là **chạm quân → chạm đích**. Kéo thả **tuỳ chọn**, không bắt buộc
2. Chọn quân mình ⇒ làm nổi bật quân + **hiện các đích hợp lệ** (dùng `getLegalMoves` từ package luật)
3. **Bỏ chọn**: chạm lại chính quân đó · chạm ra ngoài · nhấn `Esc`
4. Chạm quân **khác của mình** ⇒ chuyển sang chọn quân đó
5. Chạm quân **đối thủ** hoặc ô trống khi chưa chọn ⇒ **không làm gì**, không báo lỗi ồn ào
6. Chạm đích **không hợp lệ** ⇒ **giữ nguyên** lựa chọn, báo nhẹ
7. **`BR-BRD-07`** — gợi ý phía trình duyệt **chỉ hỗ trợ**; máy chủ **luôn phân xử lại**
8. **Trạng thái "đang gửi"** — hiện chỉ báo nhẹ, **chưa** coi là đã đi (`BR-MAT-16`)

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T080-01` | Chạm quân mình → quân nổi bật + **hiện đúng tập đích hợp lệ** |
| `T080-02` | Chạm đích hợp lệ → gửi ý định đi |
| `T080-03` | Chạm đích **không hợp lệ** → **không** gửi, giữ lựa chọn |
| `T080-04` | Chạm lại chính quân đó → **bỏ chọn** |
| `T080-05` | Nhấn `Esc` → **bỏ chọn** |
| `T080-06` | Chạm ra ngoài bàn → bỏ chọn |
| `T080-07` | Chạm quân khác của mình → **đổi** lựa chọn |
| `T080-08` | Chạm quân **đối thủ** → **không** chọn được |
| `T080-09` | ⭐ **Chưa tới lượt → thao tác VÔ HIỆU** |
| `T080-10` | ⭐ **Người xem → KHÔNG chọn được quân** |
| `T080-11` | ⭐ **Bấm 2 lần nhanh vào cùng đích → gửi ĐÚNG MỘT yêu cầu** |
| `T080-12` | Đang gửi → hiện chỉ báo, **chưa** vẽ nước đi là đã xong |
| `T080-13` | Hoạt động bằng **chạm** ở mobile 360px, không cần kéo thả |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 13 test xanh ở cả 2 kích thước
- [ ] **`T080-11`** không gửi trùng
- [ ] **`T080-09`** và **`T080-10`** vô hiệu đúng vai trò
- [ ] **`T080-13`** dùng được bằng chạm, không phụ thuộc kéo thả
- [ ] `T080-12` phân biệt rõ "đang gửi" và "đã xong"

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-080.md`

## 9. ⚠ CẠM BẪY
Bắt buộc **kéo thả** làm bàn cờ **không dùng được ở 360px** — giao điểm quá nhỏ. `BR-BRD-01` yêu cầu chạm-chạm là thao tác **chính**, kéo thả chỉ là tuỳ chọn.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** useBoardSelection nhận position/turn/actorRole/actorSide/pending và onMoveIntent({from, to}); legal moves 023 làgợiý. Output selectedSquare/legalTargets/pending; giữ position server khi ACK chưa đến. Component fixture có callback ghiintent, không fake API087.

**Tiền điều kiện cụ thể:** InitialRED turn; Tốt RED(0, 6)→(0, 5) hợp lệ, (0, 4)không; BLACKturn/SPECTATOR variants; touchscreen 360.

**File kiểm thử:** `tests/e2e/issue-080.spec.ts` · `tests/unit/issue-080.test.ts`. Giữ tên `T080-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T080-01` | Chọn Tốt RED(0, 6); target duy nhất(0, 5), đối chiếu getLegalMoves. | Chạm quân mình → quân nổi bật + **hiện đúng tập đích hợp lệ** |
| `T080-02` | Chọn(0, 6)rồi chạm(0, 5); callback 1 intentfrom/to logic. | Chạm đích hợp lệ → gửi ý định đi |
| `T080-03` | Chọn(0, 6)chạm(0, 4); 0 intent, selected vẫn cũ và feed back nhẹ. | Chạm đích **không hợp lệ** → **không** gửi, giữ lựa chọn |
| `T080-04` | Chạm quân đang chọn lần 2; selectedNULL, targets rỗng. | Chạm lại chính quân đó → **bỏ chọn** |
| `T080-05` | Chọn quân rồi Esc; clear selected. | Nhấn `Esc` → **bỏ chọn** |
| `T080-06` | Chọn rồi chạm vùng ngoài board; clear selected, không move. | Chạm ra ngoài bàn → bỏ chọn |
| `T080-07` | Chọn Tốt 0, 6 rồi Tốt 2, 6; selected 2, 6 và target mới. | Chạm quân khác của mình → **đổi** lựa chọn |
| `T080-08` | Chạm BLACK quân khi RED actor; 0 selection/intent. | Chạm quân **đối thủ** → **không** chọn được |
| `T080-09` | FixtureturnBLACK actorRED; chạm/Enter không intent. | ⭐ **Chưa tới lượt → thao tác VÔ HIỆU** |
| `T080-10` | ActorSPECTATOR; mọi quân không select, bàn vẫn đọc được. | ⭐ **Người xem → KHÔNG chọn được quân** |
| `T080-11` | Giữ pending callback ACK, double tap cùng target; đúng 1 intent. | ⭐ **Bấm 2 lần nhanh vào cùng đích → gửi ĐÚNG MỘT yêu cầu** |
| `T080-12` | Pendingtrue; quânvẫnởnguồntrongstate confirmed, in di c at or phân biệt. | Đang gửi → hiện chỉ báo, **chưa** vẽ nước đi là đã xong |
| `T080-13` | Touchscreen 360 chạm quân/đích; intent hợp lệ khôngcầndrag. | Hoạt động bằng **chạm** ở mobile 360 px, không cần kéo thả |



### 10.3 Điểm triển khai cần giữ đúng

```ts
export const redPawnIntent = { from: { x: 0, y: 6 }, to: { x: 0, y: 5 } };
// Fixture callback thu intent này; server validation thật được kiểm T087-04/06.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **doubleclick phát 2 intent hoặc optimisticcommitposition**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-080.md`.

```bash
pnpm test:e2e -- tests/e2e/issue-080.spec.ts
pnpm test:unit -- tests/unit/issue-080.test.ts
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
| `AC-BRD-02` | [REQ-BOARD](../01-requirements/REQ-BOARD.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
