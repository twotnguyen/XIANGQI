# ISSUE-081 — Lật bàn theo phe

**Nhóm:** E10 · **Phụ thuộc:** 080 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Người cầm **quân đen** thấy bàn lật để quân mình ở phía dưới — nhưng **toạ độ gửi lên máy chủ không đổi**.

## 2. ĐỌC TRƯỚC
[../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) **§1 `GR-COORD-01`** · [../01-requirements/REQ-BOARD.md](../01-requirements/REQ-BOARD.md) §9 `BR-BRD-06`

## 3. PHẠM VI
**✅ LÀM** — lật hiển thị · **❌ KHÔNG LÀM** — đổi toạ độ logic

## 4. FILE SỬA
`apps/web/src/components/board/Board.tsx` · `coordinates.ts`

## 5. CÁC BƯỚC
1. **Lật CHỈ Ở TẦNG HIỂN THỊ**. Toạ độ logic `(x, y)` **không bao giờ** đổi
2. Tách rõ hai hàm trong `coordinates.ts`:
   ```ts
   boardToScreen(sq: Square, flipped: boolean): { sx, sy }   // chỉ dùng để VẼ
   screenToBoard(px, py, flipped: boolean): Square           // chỉ dùng để ĐỌC thao tác
   ```
   ⛔ **Không** hàm nào khác được biết tới `flipped`
3. Người cầm **đen** ⇒ `flipped = true`. Người xem ⇒ mặc định **không lật**
4. Nhãn trợ năng dùng **toạ độ logic**, **không** đổi theo góc nhìn
5. Có nút lật thủ công cho người xem (tuỳ chọn)

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T081-01` | Người cầm **đen** → bàn lật, quân đen ở **phía dưới màn hình** |
| `T081-02` | Người cầm **đỏ** → bàn **không** lật |
| `T081-03` | ⭐ **Lật bàn → toạ độ gửi lên máy chủ KHÔNG ĐỔI** |
| `T081-04` | ⭐ Chạm cùng **vị trí màn hình** ở hai chế độ lật → ra **hai toạ độ logic khác nhau** |
| `T081-05` | `boardToScreen` và `screenToBoard` là **nghịch đảo** ở cả 2 chế độ, cho cả 90 ô |
| `T081-06` | ⭐ **Nhãn trợ năng dùng toạ độ LOGIC**, không đổi theo lật |
| `T081-07` | Lật giữa ván → **không** ảnh hưởng ván |
| `T081-08` | Người xem mặc định không lật |
| `T081-09` | ⭐ **Không** hàm nghiệp vụ nào ngoài 2 hàm chuyển đổi biết tới `flipped` |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 9 test xanh
- [ ] **`T081-03`** — toạ độ gửi lên không đổi
- [ ] **`T081-09`** — `flipped` không rò vào logic
- [ ] `T081-05` — chuyển đổi hai chiều đúng cả 90 ô
- [ ] `T081-06` — nhãn theo toạ độ logic

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-081.md`

## 9. ⚠ CẠM BẪY
Để `flipped` rò vào logic nghiệp vụ là lỗi rất khó tìm: người cầm đen sẽ gửi **toạ độ lật** lên máy chủ ⇒ mọi nước đi của họ **sai vị trí**. `T081-03` và `T081-09` chặn việc này.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** coordinates.ts boardToScreen(sq, flipped)→{sx, sy} và screenToBoard(sx, sy, flipped)→Square trongđơnvịlưới; pointerpixel đổi quaSVG CTM trước. flip 180:(8−x, 9−y), labelslogic giữ.

**Tiền điều kiện cụ thể:** 90 squares×2 flip; BLACK actor và RED actor, SPECTATOR default; getLegalMoves 023 khôngnhậnflipped.

**File kiểm thử:** `tests/e2e/issue-081.spec.ts` · `tests/unit/issue-081.test.ts`. Giữ tên `T081-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T081-01` | BLACK actor render; quân BLACK y 0 ởbottomscreen, glyphđọcđúngchiều. | Người cầm **đen** → bàn lật, quân đen ở **phía dưới màn hình** |
| `T081-02` | REDactor render; REDy 9 ởbottom, flipfalse. | Người cầm **đỏ** → bàn **không** lật |
| `T081-03` | BLACK Tốt(0, 3)→(0, 4): chạmvisual(8, 6)→(8, 5); intent vẫn 0, 3→0, 4. | ⭐ **Lật bàn → toạ độ gửi lên máy chủ KHÔNG ĐỔI** |
| `T081-04` | Cùng screen(0, 0): nonflip→0, 0; flip→8, 9. | ⭐ Chạm cùng **vị trí màn hình** ở hai chế độ lật → ra **hai toạ độ logic khác nhau** |
| `T081-05` | Loop 90×2 mode; inverse equality từngsquare gồm 4 corners. | `boardToScreen` và `screenToBoard` là **nghịch đảo** ở cả 2 chế độ, cho cả 90 ô |
| `T081-06` | Label Mã RED(1, 9)giống nhau trước/sauflip, không đổi thành 8/1. | ⭐ **Nhãn trợ năng dùng toạ độ LOGIC**, không đổi theo lật |
| `T081-07` | Fliprender giữa snapshot; position/version/turn/selectionlogical không đổi. | Lật giữa ván → **không** ảnh hưởng ván |
| `T081-08` | SPECTATOR default topBLACK/bottomRED. | Người xem mặc định không lật |
| `T081-09` | rgflipped trongpackages/game-rules và server phải 0; UI chỉ hai hàm ánh xạ dùngflip cho tọa độ, không payload field. | ⭐ **Không** hàm nghiệp vụ nào ngoài 2 hàm chuyển đổi biết tới `flipped` |



### 10.3 Điểm triển khai cần giữ đúng

```ts
export type Square = { x: number; y: number };
export const boardToScreen = ({x,y}: Square, flipped: boolean) => ({sx: flipped ? 8-x : x, sy: flipped ? 9-y : y});
export const screenToBoard = (sx: number, sy: number, flipped: boolean): Square => ({x: flipped ? 8-sx : sx, y: flipped ? 9-sy : sy});
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **gửi screen coordinate thay logical coordinate**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-081.md`.

```bash
pnpm test:e2e -- tests/e2e/issue-081.spec.ts
pnpm test:unit -- tests/unit/issue-081.test.ts
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
| `AC-BRD-10` | [REQ-BOARD](../01-requirements/REQ-BOARD.md) | LOCAL |
| `AC-BRD-11` | [REQ-BOARD](../01-requirements/REQ-BOARD.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
