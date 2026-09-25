# ISSUE-078 — Bàn cờ SVG 90 giao điểm

**Nhóm:** E10 Bàn cờ · **Phụ thuộc:** 012, 004 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Vẽ bàn cờ tướng truyền thống bằng **SVG**, nét ở mọi kích thước.

## 2. ĐỌC TRƯỚC
[../03-screens/design-tokens.md](../03-screens/design-tokens.md) **§2.1 (giao diện đẹp), §2, §9** · [../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) §1

## 3. PHẠM VI
**✅ LÀM** — khung bàn cờ SVG · lưới · sông · cung
**❌ KHÔNG LÀM** — quân cờ (079) · tương tác (080)

## 4. FILE TẠO
`apps/web/src/components/board/Board.tsx` · `board.module.css` · `coordinates.ts`

## 5. CÁC BƯỚC
1. **SVG**, không canvas, không ảnh nền (`tech-stack` §2.1):
   - Nét ở mọi kích thước từ 360 tới 1920 px
   - Mỗi phần tử gắn được nhãn trợ năng
   - Chuyển động bằng `transform`
2. Lưới **9 cột × 10 hàng** = **90 giao điểm**. Quân đặt **tại giao điểm**, không trong ô
3. **Sông** giữa `y=4` và `y=5`, ghi **楚河** / **漢界**
4. **Hai cung** có đường chéo: ĐEN `x 3..5, y 0..2` · ĐỎ `x 3..5, y 7..9`
5. **Mặt gỗ dùng dải màu CSS**, **không** dùng ảnh — nhẹ, không vướng giấy phép
6. Màu lấy **đúng** từ `design-tokens.md` §2: nền giấy `#F5E8CC` · gỗ sáng `#D8AE72` · gỗ viền `#704525`
7. `coordinates.ts` — chuyển đổi giữa toạ độ bàn cờ và toạ độ SVG, **tách riêng** khỏi hiển thị
8. **Vùng chạm mỗi giao điểm không chồng lấn** (`DT-07`)

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T078-01` | SVG có **đúng 90** vị trí giao điểm |
| `T078-02` | ⭐ Sông nằm **giữa y=4 và y=5**, có chữ 楚河 漢界 |
| `T078-03` | ⭐ **Hai cung đúng vị trí**: ĐEN y 0..2, ĐỎ y 7..9 |
| `T078-04` | Màu **khớp** giá trị trong `design-tokens.md` |
| `T078-05` | ⭐ **Vùng chạm các giao điểm KHÔNG chồng lấn** |
| `T078-06` | Render ở **360 · 390 · 1366 · 1920** px đều nét, **không tràn ngang** |
| `T078-07` | ⭐ **Không** dùng ảnh nền — kiểm không có `background-image` với tệp ảnh |
| `T078-08` | `coordinates.ts` chuyển đổi **hai chiều** đúng cho cả 90 ô |
| `T078-09` | Bàn cờ giữ **đúng tỉ lệ** 9:10 ở mọi kích thước |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 9 test xanh
- [ ] **`T078-05`** vùng chạm không chồng lấn
- [ ] **`T078-06`** 4 kích thước đều đạt
- [ ] **`T078-07`** không dùng ảnh nền
- [ ] Màu khớp tokens

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-078.md` — ảnh chụp bàn cờ ở 4 kích thước.

## 9. ⚠ CẠM BẪY
Dùng canvas thay SVG sẽ làm **mất khả năng gắn nhãn trợ năng** cho từng quân (`DT-04`) và khó chuyển động mượt. `tech-stack` §2.1 đã chốt SVG vì lý do này.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** Board SVG9×10 giao điểm, viewBox/responsive; coordinates module độc lập render. LogicalSquare{x 0..8, y 0..9}, screen unit đề xuất sx=x, sy=y trướcflip; metricpadding/scale chỉ view. Sông 4↔5/cungcanonical.

**Tiền điều kiện cụ thể:** Initial 90 square từ 012; viewport 360/390/1366/1920; SVG DOM geometry/BBox, computedCSS/networkresource capture.

**File kiểm thử:** `tests/e2e/issue-078.spec.ts` · `tests/unit/issue-078.test.ts`. Giữ tên `T078-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T078-01` | Đếm 90 hitpoints với 90 cặp(x, y)duy nhất; khôngđếmđườnglưới thànhsquare. | SVG có **đúng 90** vị trí giao điểm |
| `T078-02` | Đọc text 楚河 漢界 vàBBoxcenter nằmgiữaliney 4/y 5. | ⭐ Sông nằm **giữa y=4 và y=5**, có chữ 楚河 漢界 |
| `T078-03` | Inspect 4 đường chéo cung endpoints(3, 0)-(5, 2) và(3, 7)-(5, 9), không đảo bên. | ⭐ **Hai cung đúng vị trí**: ĐEN y 0..2, ĐỎ y 7..9 |
| `T078-04` | Computedfill/border khớp #F5E8CC/#D8AE72/#704525 tokens. | Màu **khớp** giá trị trong `design-tokens.md` |
| `T078-05` | LấyBBox 90 hitregions, so mọi cặp intersectionarea=0; touchcenter mapsđúng 1 square. | ⭐ **Vùng chạm các giao điểm KHÔNG chồng lấn** |
| `T078-06` | Render 4 viewport, screenshotsSVGnét và document không overflow. | Render ở **360 · 390 · 1366 · 1920** px đều nét, **không tràn ngang** |
| `T078-07` | InspectCSScomputed/network; khôngurlimagebackground, CSSgradientđượcphép. | ⭐ **Không** dùng ảnh nền — kiểm không có `background-image` với tệp ảnh |
| `T078-08` | Roundtrip 90 squares qua 2 hàmcoordinate cả biên; squarelogic không đổi. | `coordinates.ts` chuyển đổi **hai chiều** đúng cho cả 90 ô |
| `T078-09` | Đo outerboard aspect 9/10 theo thiết kế, khôngbópSVG khiresize. | Bàn cờ giữ **đúng tỉ lệ** 9:10 ở mọi kích thước |



### 10.3 Điểm triển khai cần giữ đúng

```ts
export type Square = { x: number; y: number };
export const intersections: Square[] = Array.from({ length: 90 }, (_, i) => ({ x: i % 9, y: Math.floor(i / 9) }));
// SVG view chỉ ánh xạ các square này; không thêm hàng/cột để đặt quân giữa ô.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **đảo y hoặc vùnghitbox chồng lấn**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-078.md`.

```bash
pnpm test:e2e -- tests/e2e/issue-078.spec.ts
pnpm test:unit -- tests/unit/issue-078.test.ts
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
