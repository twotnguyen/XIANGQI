# ISSUE-082 — Điều khiển bằng bàn phím

**Nhóm:** E10 · **Phụ thuộc:** 081 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Dùng bàn cờ **hoàn toàn bằng bàn phím** — yêu cầu trợ năng `DT-06`.

## 2. ĐỌC TRƯỚC
[../03-screens/design-tokens.md](../03-screens/design-tokens.md) **§4 `DT-06`, `DT-09`** · [../01-requirements/REQ-BOARD.md](../01-requirements/REQ-BOARD.md) §6 ALT-4

## 3. PHẠM VI
**✅ LÀM** — điều hướng bàn phím · tiêu điểm nhìn thấy được
**❌ KHÔNG LÀM** — chuyển động (083)

## 4. FILE SỬA
`apps/web/src/components/board/Board.tsx` · `useKeyboardNav.ts`

## 5. CÁC BƯỚC
1. **Bảng phím**:
   | Phím | Tác dụng |
   |---|---|
   | Mũi tên | Di chuyển ô đang trỏ |
   | `Enter` / `Space` | Chọn quân, hoặc xác nhận đích |
   | `Esc` | Bỏ chọn |
   | `Tab` | Ra/vào bàn cờ |
2. **Tiêu điểm cuộn (roving tabindex)** — bàn cờ là **một** điểm dừng Tab, bên trong dùng mũi tên
3. ⭐ **`DT-09`** — viền tiêu điểm **luôn nhìn thấy được**, dùng màu `#155E75` (đã đo đạt 5,99:1 và 3,54:1)
4. **Mũi tên theo toạ độ MÀN HÌNH** — khi bàn lật, mũi tên "lên" vẫn đi lên **trên màn hình**
5. Di chuyển ô trỏ **không** vượt ra ngoài bàn
6. Thông báo cho trình đọc màn hình khi đổi ô trỏ (đọc nhãn quân)

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T082-01` | ⭐ **Đi được một nước HOÀN TOÀN bằng bàn phím** |
| `T082-02` | Mũi tên di chuyển ô trỏ đúng 4 hướng |
| `T082-03` | `Enter` chọn quân; `Enter` lần hai ở đích → đi nước |
| `T082-04` | `Esc` bỏ chọn |
| `T082-05` | ⭐ **Viền tiêu điểm LUÔN nhìn thấy được** |
| `T082-06` | ⭐ **Bàn lật → mũi tên "lên" vẫn đi lên TRÊN MÀN HÌNH** |
| `T082-07` | Ô trỏ **không** ra ngoài bàn ở 4 biên |
| `T082-08` | `Tab` vào/ra bàn cờ — bàn cờ là **một** điểm dừng |
| `T082-09` | Chưa tới lượt → `Enter` **không** đi được nước |
| `T082-10` | Trình đọc màn hình đọc được nhãn quân khi đổi ô trỏ |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 10 test xanh
- [ ] **`T082-01`** đi được nước chỉ bằng bàn phím
- [ ] **`T082-05`** tiêu điểm luôn thấy
- [ ] **`T082-06`** mũi tên theo màn hình, không theo logic
- [ ] Màu tiêu điểm đúng token

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-082.md`

## 9. ⚠ CẠM BẪY
Mũi tên đi theo **toạ độ logic** thay vì màn hình sẽ khiến người cầm **quân đen** bấm "lên" mà con trỏ **đi xuống** — rối loạn hoàn toàn. `T082-06` bắt đúng lỗi này.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** useKeyboardNav rovingtabindex 1 stop, Arrowtheoscreen, Enter/Space chọn/xác nhận, Esc bỏ, Tab ra ngoài. Logicalfocus qua 081, không biến phím mũi tên thành tọa độ server trực tiếp.

**Tiền điều kiện cụ thể:** Boardinitial RED turn/BLACK flipped, SPECTATOR; Playwrightkeyboard với Tab only, 4 corners và focus CSS#155E75.

**File kiểm thử:** `tests/e2e/issue-082.spec.ts` · `tests/unit/issue-082.test.ts`. Giữ tên `T082-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T082-01` | Tab vào board, arrowtớiTốt 0, 6, Enter, ArrowUp, Enter; đúng intent 0, 6→0, 5. | ⭐ **Đi được một nước HOÀN TOÀN bằng bàn phím** |
| `T082-02` | Focus giữa bàn, 4 arrowriêng; BBoxdịchđúnghướngscreen. | Mũi tên di chuyển ô trỏ đúng 4 hướng |
| `T082-03` | Enterselect/Entertarget và Space equivalent; khôngsubmitformngoàiboard. | `Enter` chọn quân; `Enter` lần hai ở đích → đi nước |
| `T082-04` | Select rồi Esc; targetsclear, focuscòngiữô. | `Esc` bỏ chọn |
| `T082-05` | Computedfocusring visible/#155E75 cho quân/ôtọađộtrống; screenshotkeyboard. | ⭐ **Viền tiêu điểm LUÔN nhìn thấy được** |
| `T082-06` | BLACK flipped ArrowUp; screenBBoxygiảm trong khi logic a ly tăng. | ⭐ **Bàn lật → mũi tên "lên" vẫn đi lên TRÊN MÀN HÌNH** |
| `T082-07` | 4 biên/corners nhấn ra ngoài nhiều lần; clamp, khôngwrap/outofrange. | Ô trỏ **không** ra ngoài bàn ở 4 biên |
| `T082-08` | Tab vào board chỉ 1 stop; Tab tiếp rangroup, Shift Tab quay lại. | `Tab` vào/ra bàn cờ — bàn cờ là **một** điểm dừng |
| `T082-09` | TurnBLACK actorRED; Enter/Space không move intent, focusnavvẫnđược. | Chưa tới lượt → `Enter` **không** đi được nước |
| `T082-10` | Focus move qua quân/ôtrống; accessible name/liveannouncement đúnglogical labels. | Trình đọc màn hình đọc được nhãn quân khi đổi ô trỏ |



### 10.3 Điểm triển khai cần giữ đúng

```ts
export function clampScreen(sx: number, sy: number) {
  return { sx: Math.max(0, Math.min(8, sx)), sy: Math.max(0, Math.min(9, sy)) };
}
// Áp dụng Arrow vào screen square, clamp, rồi screenToBoard081.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **di chuyểnArrowUp theo logicaly khiBLACKflip**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-082.md`.

```bash
pnpm test:e2e -- tests/e2e/issue-082.spec.ts
pnpm test:unit -- tests/unit/issue-082.test.ts
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

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
