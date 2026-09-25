# ISSUE-079 — Quân cờ + chữ Hán + nhãn trợ năng

**Nhóm:** E10 · **Phụ thuộc:** 078 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Vẽ 32 quân bằng **chữ Hán**, mỗi quân có **nhãn trợ năng tiếng Việt đầy đủ**.

## 2. ĐỌC TRƯỚC
[../03-screens/design-tokens.md](../03-screens/design-tokens.md) **§3 (chữ), §4 (trợ năng), `DT-21`**

## 3. PHẠM VI
**✅ LÀM** — hiển thị quân · chữ Hán · nhãn trợ năng · dấu hiệu phân biệt hai phe
**❌ KHÔNG LÀM** — tương tác (080)

## 4. FILE TẠO
`apps/web/src/components/board/Piece.tsx` · `piece-labels.ts`

## 5. CÁC BƯỚC
1. **Chữ Hán theo bên** — chép đúng `DT` §3:
   | Bên | Chữ |
   |---|---|
   | **Đỏ** | 帥 仕 相 傌 俥 炮 兵 |
   | **Đen** | 將 士 象 馬 車 砲 卒 |
2. Font chữ Hán **tự host**, đã kiểm giấy phép. **Không** tải từ dịch vụ ngoài (`DT-02`)
3. **Nhãn trợ năng tiếng Việt đầy đủ** (`DT-04`): `"Mã đỏ, cột 2 hàng 10"`
   - Cột 1-based từ trái: `x + 1`
   - Hàng 1-based từ trên: `y + 1`
4. ⭐ **`DT-21` — dấu hiệu phân biệt hai phe KHÔNG phụ thuộc màu và KHÔNG phụ thuộc chữ**

   Lý do: quân đỏ so với quân đen chỉ đạt **2,17:1**. Và **3/7 cặp chữ gần giống nhau**:
   | Rõ ràng | **Gần giống** |
   |---|---|
   | 帥/將 · 相/象 · 炮/砲 · 兵/卒 | **仕/士 · 傌/馬 · 俥/車** |

   ⇒ Thêm **dấu hiệu hình dạng**: viền quân **nét liền** cho một phe, **nét đôi** cho phe kia (hoặc nền quân khác sắc độ rõ rệt)
5. Chú giải hiện **tên tiếng Việt** của quân (`DT-05`)
6. **Không** có tuỳ chọn đổi sang chữ Việt (`DT-03`)

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T079-01` | 32 quân hiện đúng chữ Hán theo bên |
| `T079-02` | ⭐ Mỗi quân có **nhãn trợ năng tiếng Việt** đúng vị trí |
| `T079-03` | Nhãn dùng cột/hàng **1-based** đúng công thức |
| `T079-04` | ⭐ **`DT-21`: hai phe phân biệt được bằng HÌNH DẠNG**, không chỉ màu và chữ |
| `T079-05` | ⭐ **Giả lập mù màu đỏ–lục → vẫn phân biệt được**, kể cả **Sĩ, Mã, Xe** |
| `T079-06` | Font tự host — **không** có yêu cầu mạng tới dịch vụ font ngoài |
| `T079-07` | Chú giải hiện tên tiếng Việt |
| `T079-08` | Quân render **tại giao điểm**, không lệch |
| `T079-09` | Chữ đọc được ở **360px** |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 9 test xanh
- [ ] **`T079-04`** và **`T079-05`** — `DT-21` có hiệu lực
- [ ] **`T079-02`** nhãn trợ năng đủ 32 quân
- [ ] `T079-06` font tự host
- [ ] Chữ Hán **đúng** bảng

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-079.md` — ảnh chụp bàn cờ **ở chế độ giả lập mù màu**.

## 9. ⚠ CẠM BẪY
Dựa hoàn toàn vào **màu** để phân biệt hai phe là lỗi trợ năng nghiêm trọng — người mù màu đỏ–lục (~8% nam giới) sẽ nhầm **Sĩ/Mã/Xe** vì chữ cũng gần giống. `DT-21` bắt buộc có dấu hiệu thứ ba.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** Piece nhận side/type/logicalSquare; label tiếng Việt cột=x+1/hàng=y+1, chữ Hán đúng DT§3. Font local cólicense, hình dạng bên khác ngay grayscale; không option chữ Việt.

**Tiền điều kiện cụ thể:** Positioninitial 01232 pieces, solo Sĩ/Mã/Xe hai bên; screenshotsnormal/grayscale và kiểm thủ công mô phỏng mù màu theoDT21.

**File kiểm thử:** `tests/e2e/issue-079.spec.ts` · `tests/unit/issue-079.test.ts`. Giữ tên `T079-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T079-01` | Renderinitial; 32 quân, multisetglyph đúng bảng RED/BLACK. | 32 quân hiện đúng chữ Hán theo bên |
| `T079-02` | Queryaccessible name từng quân; tên Việt/bên/vị trí đủ 32, khôngchỉglyph. | ⭐ Mỗi quân có **nhãn trợ năng tiếng Việt** đúng vị trí |
| `T079-03` | Quân(0, 0), (8, 9), (1, 9); labels 1/1, 9/10, 2/10. | Nhãn dùng cột/hàng **1-based** đúng công thức |
| `T079-04` | Hideglyph và grayscale screenshot; outline/nền hình dạng vẫn phân biệt 2 bên. | ⭐ **`DT-21`: hai phe phân biệt được bằng HÌNH DẠNG**, không chỉ màu và chữ |
| `T079-05` | Mô phỏng đỏ–lục thực hoặc công cụ kiểm ảnh đã chốt; reviewerphânbiệtSĩ/Mã/Xe bằng shape, lưu minh chứng. | ⭐ **Giả lập mù màu đỏ–lục → vẫn phân biệt được**, kể cả **Sĩ, Mã, Xe** |
| `T079-06` | Captureall network fontrequests; chỉ same origin, licensefile có nguồn. | Font tự host — **không** có yêu cầu mạng tới dịch vụ font ngoài |
| `T079-07` | Hover/focus quân; tooltip có tên Việt, keyboard thấy được. | Chú giải hiện tên tiếng Việt |
| `T079-08` | SoPiececenter vớiintersectionSVG cho 32 quân; sai sốrenderkhônglệchsangô. | Quân render **tại giao điểm**, không lệch |
| `T079-09` | 360 px tự kiểm ảnh 32 quân vàglyph khôngtofu/cắt chữ. | Chữ đọc được ở **360 px** |



### 10.3 Điểm triển khai cần giữ đúng

```ts
export const pieceAriaLabel = (name: string, side: 'RED' | 'BLACK', x: number, y: number) =>
  `${name} ${side === 'RED' ? 'đỏ' : 'đen'}, cột ${x + 1} hàng ${y + 1}`;
// pieceAriaLabel('Mã','RED',1,9) = 'Mã đỏ, cột 2 hàng 10'
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **cả hai bêncùngoutline và chỉ khác màu**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-079.md`.

```bash
pnpm test:e2e -- tests/e2e/issue-079.spec.ts
pnpm test:unit -- tests/unit/issue-079.test.ts
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
| `AC-BRD-01` | [REQ-BOARD](../01-requirements/REQ-BOARD.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
