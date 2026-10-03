# 02 · Luật cờ tướng và máy cờ

> **Bản hoàn thiện 04/10/2026, chờ Product Owner review bản viết.** Nền tảng đã duyệt 03/10 và các quyết định bổ sung đã duyệt 04/10 được giữ nguyên. Nhãn đã duyệt bên dưới ghi lịch sử nền, không có nghĩa toàn bộ câu chữ/thiết kế mới đã được review; không có mã nguồn hay test ứng dụng được chạy trong đợt tài liệu này.

**Giai đoạn 2 · Trạng thái: **nền tảng đã duyệt 03/10/2026; bản viết 04/10/2026 chờ Product Owner review** (các giả định kỹ thuật chưa đo vẫn cần thử nghiệm ở đầu Giai đoạn 4)** · Nguồn luật phạm vi: [BA-SCOPE-DECISIONS.md](../BA-SCOPE-DECISIONS.md) (Quyết định 3.1, 3.3, 3.4, 3.5, 6.1, 6.3). Tài liệu này chi tiết hoá, không được mâu thuẫn BA-SCOPE.

Phạm vi: P1 (luật di chuyển, kết thúc ván, máy cờ 3 cấp) và P2 (FEN/PGN). Tài liệu này chốt các **con số tạm** của Giai đoạn 1 (mục 8).

---

## 1. Bàn cờ và toạ độ

Theo AGENTS §4.3: **Đen ở trên (y = 0), Đỏ ở dưới (y = 9), Đỏ đi trước.** `(x, y)` đếm từ 0; `x` 0→8 trái sang phải; `y` 0→9 trên xuống dưới; chỉ số mảng `y * 9 + x`. Sông nằm giữa `y = 4` và `y = 5`. Máy chủ luôn dùng hệ này; bàn cờ lật khi cầm Đen chỉ là hiển thị.

| Vùng | Đỏ | Đen |
|---|---|---|
| Cung (3×3) | `x 3..5`, `y 7..9` | `x 3..5`, `y 0..2` |
| Phía nhà (chưa qua sông) | `y 5..9` | `y 0..4` |
| Đi tiến | `y` giảm | `y` tăng |

### 1.1 Quân và ký hiệu

| Quân | Đỏ | Đen | Ký tự FEN (Đỏ HOA / Đen thường) | Chữ Hán (Đỏ / Đen) |
|---|---|---|---|---|
| Tướng | Tướng | Tướng | `K` / `k` | 帥 / 將 |
| Sĩ | Sĩ | Sĩ | `A` / `a` | 仕 / 士 |
| Tượng | Tượng | Tượng | `B` / `b` | 相 / 象 |
| Mã | Mã | Mã | `N` / `n` | 傌 / 馬 |
| Xe | Xe | Xe | `R` / `r` | 俥 / 車 |
| Pháo | Pháo | Pháo | `C` / `c` | 炮 / 砲 |
| Tốt | Tốt | Tốt | `P` / `p` | 兵 / 卒 |

### 1.2 Thế cờ khởi đầu

FEN (hàng trên cùng là `y = 0`): `rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1`

| Quân | Đen (`y` trên) | Đỏ (`y` dưới) |
|---|---|---|
| Xe | (0,0) (8,0) | (0,9) (8,9) |
| Mã | (1,0) (7,0) | (1,9) (7,9) |
| Tượng | (2,0) (6,0) | (2,9) (6,9) |
| Sĩ | (3,0) (5,0) | (3,9) (5,9) |
| Tướng | (4,0) | (4,9) |
| Pháo | (1,2) (7,2) | (1,7) (7,7) |
| Tốt | (0,3) (2,3) (4,3) (6,3) (8,3) | (0,6) (2,6) (4,6) (6,6) (8,6) |

Trường `w` = Đỏ đi; hai số cuối là bộ đếm nửa nước không ăn quân và số nước thứ mấy.

---

## 2. Cách đi của từng quân

Mọi nước đi phải nằm trong bàn cờ 9×10 và **không** được đặt quân vào ô có quân cùng màu. Đích có quân đối phương thì ăn quân đó.

| Quân | Quy tắc |
|---|---|
| **Tướng** | Đi 1 ô ngang hoặc dọc, **luôn ở trong cung** của mình. |
| **Sĩ** | Đi 1 ô chéo, **luôn ở trong cung** của mình. |
| **Tượng** | Đi chéo đúng 2 ô (kiểu "điền"). **Chân tượng**: ô chéo ở giữa phải trống, nếu có quân (của bên nào cũng được) thì bị chặn. **Không được qua sông**. |
| **Mã** | Đi 1 ô ngang/dọc rồi 1 ô chéo ra ngoài (hình chữ "nhật", 8 hướng). **Cản chân mã**: ô ngang/dọc đầu tiên phải trống, nếu có quân thì không đi được theo hướng đó. |
| **Xe** | Đi ngang hoặc dọc bao nhiêu ô tuỳ ý, không nhảy qua quân nào; dừng ở ô trống hoặc ăn quân địch đầu tiên gặp. |
| **Pháo** | **Đi** như Xe (không nhảy). **Ăn** bằng cách nhảy qua **đúng một quân** (của bên nào cũng được, gọi là "ngòi") trên cùng đường ngang/dọc, rồi ăn quân địch ngay sau ngòi (quân địch đầu tiên sau ngòi). Không có ngòi hoặc có hơn một quân chắn thì không ăn được. |
| **Tốt** | **Chưa qua sông**: chỉ đi tiến 1 ô. **Đã qua sông**: đi tiến 1 ô hoặc sang ngang 1 ô. **Không bao giờ đi lùi.** Tốt ở hàng cuối vẫn đi ngang được (nếu đã qua sông), không phong cấp. |

### 2.1 Tướng đối mặt ("hai tướng nhìn nhau")

Hai Tướng **không được** đứng cùng một cột mà giữa chúng không có quân nào. **Bất kỳ nước đi nào** (kể cả nước của Tướng) khiến thế này xảy ra đều **không hợp lệ**; bên đi phải chọn nước khác.

---

## 3. Nước đi hợp lệ, chiếu và kết thúc ván

### 3.1 Hợp lệ

Một nước đi **hợp lệ** khi: đúng cách đi của quân (mục 2) **và** sau khi đi, Tướng của chính bên đi **không bị chiếu** **và** hai Tướng không đối mặt (mục 2.1). Máy chủ là nơi duy nhất quyết định (AGENTS §4.4, BA 3.3): client chỉ gửi ý định đi.

### 3.2 Chiếu

Một Tướng bị **chiếu** khi có quân đối phương có thể ăn Tướng đó ở nước kế tiếp theo cách đi ở mục 2 (có tính chân Mã, chân Tượng, ngòi Pháo).

### 3.3 Kết quả ván

| Mã lý do | Điều kiện | Kết quả |
|---|---|---|
| `CHECKMATE` | Bên sắp đi **bị chiếu** và **không có nước hợp lệ** | Bên đó **thua** |
| `STALEMATE` | Bên sắp đi **không bị chiếu** nhưng **không có nước hợp lệ** | Bên đó **thua** (khác cờ vua) |
| `RESIGN` | Một bên đầu hàng | Bên đầu hàng thua ngay |
| `TIMEOUT` | Đồng hồ của bên tới lượt về 0 | Bên đó thua |
| `DISCONNECT` | Quá ân hạn mất kết nối (BA 8.3) | Bên mất kết nối thua |
| `INACTIVITY` | Hết 30 giây sau cảnh báo chống treo ván (BA 3.3 mục 5, **P2**) | Bên đó thua |
| `DRAW_AGREEMENT` | Cả hai đồng ý hoà | Hoà |
| `DRAW_REPETITION` | Lặp thế lần 3 (mục 4) | Hoà |
| `DRAW_NO_CAPTURE` | Đủ 120 nửa nước không ăn quân (mục 5) | Hoà |
| `PERPETUAL_CHECK` | Chiếu liên tục khi lặp thế (mục 4) | Bên chiếu liên tục thua |
| `INTERRUPTED` | Máy chủ sập hoặc mất kết nối cơ sở dữ liệu (BA 8.3) | Không có người thắng, không phải hoà, không đổi Elo |
| `ABANDONED` | Ván với máy bỏ dở quá 30 phút (BA 6.3) | Không tính thắng/thua/hoà |

### 3.4 Thứ tự xử lý khi máy chủ nhận một nước đi

1. Xác thực người gửi; **tra biên lai** theo danh tính và `commandId` (đã có thì trả kết quả cũ, dừng; theo [07](07-hop-dong-nghiep-vu.md) §3). Chỉ **lệnh mới** mới đi tiếp: kiểm phòng/ván, **đúng lượt**, đúng `matchVersion`.
2. **Kiểm đồng hồ trước** (BA `ARCH-04`): nếu đồng hồ bên đi đã về 0 tại thời điểm nhận lệnh → kết thúc `TIMEOUT`, **không** áp dụng nước đi.
3. Kiểm nước đi hợp lệ (mục 3.1). Không hợp lệ → từ chối, trả lý do, không đổi trạng thái.
4. Áp dụng nước đi, cập nhật bộ đếm nửa nước và khoá thế cờ.
5. Xét kết thúc theo **thứ tự ưu tiên** (dừng ở điều kiện đầu tiên thoả): `CHECKMATE`/`STALEMATE` → `PERPETUAL_CHECK` → `DRAW_REPETITION` → `DRAW_NO_CAPTURE`.
6. Ghi nước đi, phát thế cờ mới cho cả phòng.
Ghi chú: phân xử khi hết giờ và hết ân hạn mất kết nối xảy ra gần nhau là việc của **bộ hẹn giờ chung**, không phải bước của danh sách trên; xem [04] mục đồng hồ (mốc sớm hơn quyết định; trùng đúng một mốc thì ưu tiên `TIMEOUT`, PO chốt 04/10/2026).

Chiếu hết luôn thắng mọi kết quả hoà: nếu nước đi vừa chiếu hết vừa tạo lặp lần 3 hoặc chạm 120 nửa nước thì vẫn là `CHECKMATE`.

---

## 4. Lặp thế cờ và chiếu liên tục

**Khoá thế cờ**: chuỗi mô tả vị trí các quân **và bên sắp đi** (tức là một thế chỉ coi là "cùng" khi cùng bên đi). Có thể dùng FEN bỏ hai trường đếm.

Chỉ tính trên **nhánh nước đi hiệu lực** (đã trừ các nước bị đi lại, BA 3.3).

**Khi một khoá thế xuất hiện lần thứ 3:** lấy đoạn các nước đi từ lần xuất hiện thứ 1 đến lần thứ 3 (gọi là *chu kỳ*). Với mỗi bên, xét tất cả nước đi **của bên đó** trong chu kỳ:

| Bên Đỏ: mọi nước là nước chiếu? | Bên Đen: mọi nước là nước chiếu? | Kết quả |
|---|---|---|
| Có | Không | **Đỏ thua** (`PERPETUAL_CHECK`) |
| Không | Có | **Đen thua** (`PERPETUAL_CHECK`) |
| Có | Có | Hoà (`DRAW_REPETITION`) |
| Không | Không | Hoà (`DRAW_REPETITION`) |

Ví dụ (đúng với BA 3.5): Đỏ dùng Xe chiếu Tướng Đen, Đen né, Đỏ lại chiếu, … thế cờ lặp lần 3 và mọi nước của Đỏ trong chu kỳ đều chiếu → **Đỏ thua, Đen thắng**.

### 4.1 Đuổi quân liên tục (perpetual chase) — **không xử riêng ở bản đầu** (đã duyệt)

BA 3.5 để việc này cho Giai đoạn 2. **Đã duyệt:** ở cả P1 và P2, lặp thế do đuổi quân được xử **hoà** theo bảng trên (hàng "Không / Không"). Lý do: luật đuổi quân chính thức có rất nhiều ngoại lệ (quân được bảo vệ, quân tấn công lẫn nhau, Tướng/Tốt chưa qua sông…) và dễ gây lỗi và tranh cãi; nhóm 7 người trong 2 tuần không đủ để làm và kiểm thử đúng.
**Rủi ro đã biết:** một bên có thể dùng đuổi quân để "ép hoà" thế đang thua; ảnh hưởng chủ yếu tới Đánh Hạng (P2). **Khác biệt** so với luật cờ tướng chính thức phải được ghi trong phần **Luật chơi mở rộng/thu gọn ở Sảnh** (BA 10.4); không thêm trang mới.
Luật đuổi quân chi tiết vẫn ngoài phạm vi cả P1/P2; chỉ mở lại nếu Product Owner thay đổi phạm vi, không tự đưa vào kế hoạch P2.

---

## 5. Hoà do không ăn quân (120 nửa nước, đã duyệt)

* Bộ đếm **nửa nước không ăn quân** (halfmove clock) tăng 1 sau mỗi nửa nước và **về 0 khi có nước ăn quân**.
* Đạt **120** (mỗi bên 60 nước) và ván chưa kết thúc theo mục 3.4 bước 5 → `DRAW_NO_CAPTURE`.
* Bộ đếm lưu trên **từng nút nước đi** (xem [03-du-lieu.md](03-du-lieu.md)), nên khi đi lại (undo) thì bộ đếm quay về đúng giá trị của nút đích.
* Giá trị 120 là con số được dùng phổ biến trong bộ luật cờ tướng châu Á; **Product Owner đã duyệt giữ nguyên**.

Không có luật hoà do "không đủ quân" ở bản này (không áp dụng tự động; nếu thế cờ không thể chiếu hết thì ván kết thúc bằng luật 120 nửa nước hoặc đầu hàng/xin hoà).

---

## 6. Đi lại (Undo)

* Dùng **cây nước đi**: lùi con trỏ `current_move_id` về nút đích; không xoá nút bị bỏ (xem [03-du-lieu.md](03-du-lieu.md)). Xem lại ván hiển thị chuỗi nước **hiệu lực** (BA 6.2).
* **Đánh Thường (P2):** lùi về trước nước gần nhất của người xin (1 hoặc 2 nước) theo BA 3.6.
* **Với máy (P2):** lùi 1 cặp nước theo BA 6.3; nếu máy đang nghĩ thì huỷ tìm kiếm.
* Sau undo: khoá thế, bộ đếm 120 và danh sách chiếu liên tục tính lại **từ nhánh hiệu lực**. Đồng hồ **không hoàn lại**.

---

## 7. Ký hiệu nước đi tiếng Việt (bảng nước đi, Replay)

Dạng: `<Quân> <cột> <tiến|lùi|bình> <số>`. Ví dụ nước khai cuộc phổ biến: `Pháo 2 bình 5`, đáp lại `Mã 8 tiến 7`.

### 7.1 Đánh số cột (theo góc nhìn của bên đi)

| Bên | Cột 1 là | Công thức từ `x` |
|---|---|---|
| Đỏ | Bên phải của Đỏ (`x = 8`) | `cột = 9 − x` |
| Đen | Bên phải của Đen (`x = 0`) | `cột = x + 1` |

### 7.2 Động từ và con số cuối

| Quân | Hướng đi | Số cuối |
|---|---|---|
| Xe, Pháo, Tướng, Tốt | `tiến`/`lùi` theo hướng dọc | **Số ô đi** |
| Xe, Pháo, Tướng, Tốt | `bình` (đi ngang) | **Cột đích** |
| Mã, Tượng, Sĩ (đi chéo) | `tiến`/`lùi` theo hướng chiều dọc của nước đi | **Cột đích** |

`tiến` của Đỏ là `y` giảm, của Đen là `y` tăng.

### 7.3 Phân biệt khi nhiều quân cùng loại cùng một cột

**Thuật toán:** sinh ký hiệu cơ bản cho mọi nước hợp lệ của thế; nếu có **hai nước trở lên trùng ký hiệu**, thêm số cột (hoặc `Thứ n`) cho các nước đó cho tới khi duy nhất.

Ký hiệu của **mỗi nước đi hợp lệ trong một thế cờ phải là duy nhất** và đọc ngược lại ra đúng nước đó (dùng làm thuộc tính kiểm thử, mục 3.1 điểm 6 của [05]).

| Trường hợp | Quy tắc | Ví dụ hợp lệ |
|---|---|---|
| Một quân duy nhất trên cột đó | Không cần phân biệt | `Pháo 2 bình 5` |
| Hai quân cùng loại cùng cột (Xe, Pháo, Tốt…) | `Trước` (gần phía đối phương hơn) hoặc `Sau` đặt đầu, **không ghi số cột** | `Trước Xe tiến 3`, `Sau Pháo bình 4` |
| Ba Tốt cùng cột | `Trước`, `Giữa`, `Sau` | `Giữa Tốt tiến 1` |
| Bốn hoặc năm Tốt cùng cột | `Thứ 1` … `Thứ 5` đếm **từ phía đối phương lại** | `Thứ 2 Tốt tiến 1` |
| **Bất kỳ trường hợp nào có hai nước trùng ký hiệu trong cùng một thế** (ví dụ ba Tốt ở một cột và hai Tốt ở cột khác, cả hai cùng cho `Trước Tốt tiến 1`) | Ghi thêm **số cột** sau tên quân cho các nước đó | `Trước Tốt 5 tiến 1` và `Trước Tốt 3 tiến 1` |

Lưu ý: **Mã, Tượng, Sĩ không bao giờ đi "bình"** (đi chéo hoặc chữ nhật), nên không có nước `bình` của các quân này; hai Mã cùng cột phân biệt bằng `Trước`/`Sau` và hướng `tiến`/`lùi` kèm **cột đích** (ví dụ `Trước Mã tiến 7`).

Bộ thế cờ kiểm thử bắt buộc: hai Xe cùng cột, hai Pháo cùng cột, hai Mã cùng cột, ba Tốt, bốn/năm Tốt cùng cột, hai cột cùng có hai Tốt; cho cả Đỏ và Đen.

### 7.4 Xuất khẩu (P2)

* **FEN** của thế cờ hiện tại: định dạng ở mục 1.2, bộ đếm nửa nước và số nước lấy từ nút hiện tại.
* **PGN** (BA 9.1): tệp văn bản gồm các dòng đầu `[Event "…"]`, `[Red "…"]`, `[Black "…"]`, `[Result "1-0" | "0-1" | "1/2-1/2" | "*"]` (`*` dùng cho ván `INTERRUPTED` và `ABANDONED`), rồi danh sách nước đi theo mục 7. Đây là **dạng riêng của dự án** gần với PGN cờ tướng, không cam kết tương thích mọi phần mềm ngoài.
  **Khi làm P2 phải chứng minh** (BA 9.1 nhằm phân tích bằng công cụ ngoài): (a) chọn và ghi rõ ít nhất một công cụ ngoài; (b) **chính tệp PGN do dự án xuất ra phải được công cụ ngoài đó nhập được và khôi phục đúng chuỗi nước**; (c) FEN nhập được vào ít nhất một công cụ ngoài; (d) kiểm xuất rồi nhập lại bằng bộ nhập nội bộ (chỉ là phép thử phụ, **không thay** điều kiện b). Nếu không có công cụ ngoài nào nhập được thì mục đích của BA 9.1 **chưa đạt** và phải báo Product Owner. Đến khi đó, tính tương thích bên ngoài là **chưa được chứng minh**.

---

## 8. Chốt các con số tạm của Giai đoạn 1 (đã duyệt)

| Con số / luật | Giá trị đã duyệt | Cách chứng minh đạt |
|---|---|---|
| Hoà không ăn quân | **120 nửa nước** | Kiểm thử đơn vị đạt 119 → chưa hoà, 120 → hoà; ăn quân thì về 0; undo khôi phục |
| Chiếu liên tục | Xử thua bên chiếu (mục 4) | Bộ thế cờ chiếu liên tục một bên, hai bên, và lặp không chiếu |
| Đuổi quân liên tục | **Không xử riêng**, xử hoà theo lặp 3 lần (mục 4.1) | Ghi là khác biệt đã biết; có thế cờ kiểm thử xác nhận kết quả hoà |
| Máy cờ Dễ / Trung bình / Khó | Độ sâu **2 / 4 / 6**, ngân sách **300 ms / 1 000 ms / 3 000 ms** | Mục 9.5 |
| Quy mô đồng thời | **50 người dùng, 10 ván cùng lúc** | Kiểm thử tải ở [05-kiem-thu.md](05-kiem-thu.md) |

---

## 9. Máy cờ (P1)

Theo BA 6.1, 6.3 và AGENTS §4.4: máy cờ tự viết bằng TypeScript, chạy **tiến trình riêng** (không chung tiến trình với máy chủ). Không gợi ý nước đi cho người chơi.

### 9.1 Thuật toán

* **Negamax + cắt tỉa alpha-beta** với **tìm sâu dần** (iterative deepening): tìm độ sâu 1, 2, … đến độ sâu mục tiêu hoặc hết ngân sách thời gian; trả về nước tốt nhất của độ sâu **hoàn tất gần nhất**.
* **Sắp xếp nước đi**: nước tốt nhất của lần tìm trước → nước ăn quân (quân bị ăn giá trị cao, quân đi giá trị thấp trước) → còn lại.
* **Bảng chuyển vị** (hash Zobrist) cho cấp Khó (và Trung bình nếu cần).
* **Tìm tĩnh** (quiescence) cho cấp Khó để giảm sai ở "chân trời", với các quy tắc bắt buộc: (1) khi **đang bị chiếu** thì xét **mọi nước thoát chiếu** (không chỉ nước ăn quân) và **không được "đứng yên"** (không dùng điểm tĩnh làm cận dưới); (2) khi không bị chiếu thì chỉ xét nước ăn quân, giới hạn độ sâu tìm tĩnh 4; (3) nếu **hết nước đi hợp lệ** tại bất kỳ nút nào, kể cả đúng giới hạn độ sâu, thì trả điểm **thua** (chiếu hết hoặc hết nước đều thua, mục 3.3), không trả điểm tĩnh. Tham chiếu triển khai: mã nguồn tìm kiếm của công cụ cờ tướng mã nguồn mở Pikafish.
* Phát hiện thế hoà/lặp: máy dùng cùng khoá thế như mục 4 để tránh tự đi vào thế thua do chiếu liên tục.

### 9.2 Hàm lượng giá (tính theo "xăng-ti-tốt", 100 = 1 Tốt)

| Thành phần | Giá trị đề xuất |
|---|---|
| Giá quân | Xe 900 · Pháo 450 · Mã 400 · Tượng 200 · Sĩ 200 · Tốt 100 (Tốt đã qua sông 200) · Tướng vô cực |
| Vị trí | Bảng điểm vị trí đơn giản cho từng loại quân (khuyến khích kiểm soát giữa bàn, Tốt qua sông, Pháo/Xe ở cột mở) |
| An toàn Tướng | Cộng/trừ theo số Sĩ, Tượng còn lại |
| Cơ động | Tuỳ chọn, chỉ thêm nếu không làm vượt ngân sách thời gian |

Giá trị trên là **điểm xuất phát**, tinh chỉnh bằng chạy máy đấu máy (mục 9.5).

### 9.3 Ba cấp độ

| Cấp | Độ sâu tối đa | Ngân sách tối đa | Tính chất |
|---|---|---|---|
| **Dễ** | 2 | 300 ms | Có **yếu tố ngẫu nhiên**: với xác suất 20% chọn ngẫu nhiên một nước hợp lệ **không làm mất quân lớn (Xe/Pháo/Mã) ngay**; còn lại chọn ngẫu nhiên trong các nước có điểm trong khoảng 30 điểm so với nước tốt nhất |
| **Trung bình** | 4 | 1 000 ms | Chọn ngẫu nhiên trong các nước điểm trong khoảng 10 điểm so với nước tốt nhất |
| **Khó** | 6 | 3 000 ms | Xác định (không ngẫu nhiên); có bảng chuyển vị và tìm tĩnh |

"Độ sâu tối đa" là **mục tiêu**; nếu hết ngân sách thì trả nước của độ sâu hoàn tất gần nhất (BA 6.1).

### 9.4 Vòng đời một lần suy nghĩ và xử lý lỗi

1. Máy chủ gửi cho tiến trình máy cờ: thế cờ (FEN), lịch sử khoá thế, cấp độ, ngân sách.
2. Tiến trình trả `{ move, depth, nodes, elapsedMs }`.
3. Tiến trình tìm sâu dần và gửi `progress { move, depth }` sau **mỗi độ sâu hoàn tất** (PO chốt hành vi 04/10/2026; chi tiết IPC là thiết kế kỹ thuật). Thời gian chờ cứng của máy chủ = **ngân sách + 2 giây**; quá hạn thì **kết thúc tiến trình** đó: nếu máy chủ đã nhận ít nhất một `progress` thì đi nước đó (**không** phải lỗi); nếu chưa có nước nào thì tính là lỗi theo mục 4.
4. Lỗi tiến trình, chết bất thường, hoặc chưa có nước nào khi quá hạn/không phản hồi quá 10 giây → ván chuyển `Bỏ dở` và hiện *"Máy cờ gặp sự cố"* kèm nút *Thử lại* (BA 6.1). Thử lại sau `ABANDONED` tạo ván mới cùng cấp độ/phe; không phục hồi ván cũ. `ENGINE_BUSY` chỉ xếp lại tìm nước trong ván hiện tại. Kết quả tìm đến sau khi tác vụ bị huỷ không được áp dụng.
5. Người chơi bấm đi lại khi máy đang nghĩ → **huỷ** tìm kiếm hiện tại (BA 6.3).

### 9.5 Tiêu chí đạt của máy cờ (đo trên máy chuẩn, mục 3 của [05-kiem-thu.md](05-kiem-thu.md))

| Tiêu chí | Ngưỡng |
|---|---|
| Sinh nước đi đúng | Số lượng nước đi đúng với giá trị tham chiếu của thế khởi đầu ở độ sâu 1–4 (xem 05) |
| Thời gian tính (p95), từ lúc bắt đầu tìm đến lúc có nước | Dễ ≤ 300 ms · Trung bình ≤ 1 000 ms · Khó ≤ 3 000 ms |
| Thời gian người chơi chờ khi không có hàng đợi (p95) | Bằng thời gian tính cộng truyền; hàng đợi tối đa 3 giây chỉ khi máy bận |
| Độ sâu thực tế của cấp Khó | Trung vị ≥ 6 ở thế khởi đầu và ≥ 5 ở thế trung cuộc; nếu không đạt thì **ghi số thật** và báo Product Owner (AGENTS §4.4), không hạ ngưỡng để báo đạt |
| Phân cấp sức mạnh | Khó thắng Trung bình ≥ 75% và Trung bình thắng Dễ ≥ 75% trên ≥ 40 ván, đổi bên đều nhau |
| Chiếu hết ngắn | Tìm được chiếu hết trong 1 nước và 2 nước trên bộ thế cờ kiểm thử |
| Không có nước sai luật | 0 nước không hợp lệ trên ≥ 1 000 ván máy đấu máy ngẫu nhiên |

### 9.6 Phương án dự phòng nếu không đạt thời gian (giảm độ sâu cần Product Owner đồng ý lại khi xảy ra)

1. Tối ưu (bảng chuyển vị, sắp xếp nước đi, đại diện bàn cờ bằng mảng phẳng `y*9+x`).
2. Nếu cấp Khó vẫn không đạt độ sâu 6 trong 3 giây: **giảm độ sâu mục tiêu xuống 5** và ghi số đo thực tế. Phải có Product Owner đồng ý trước khi đổi con số trong BA 6.1.
3. Nếu thiếu thời gian: báo Product Owner để quyết định thứ tự/dừng phần trong bước lập kế hoạch; không tự chuyển cấp Khó khỏi P1. Ba cấp vẫn là yêu cầu P1 cho đến khi có quyết định thay đổi.

[01]: 01-yeu-cau-chi-tiet.md
[02]: 02-luat-co-tuong.md
[03]: 03-du-lieu.md
[04]: 04-kien-truc.md
[05]: 05-kiem-thu.md
