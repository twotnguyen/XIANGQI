# LUẬT CỜ — BỘ LUẬT `xiangqi-simple-v1`

**ID:** `GR` · **Trạng thái:** v1 · **Cập nhật:** 2026-09-21
**Căn cứ:** R05, R07 · `DEC-003` (toạ độ) · Câu 11 phỏng vấn (luật giản lược)

> ⚠ **Đây là bộ luật GIẢN LƯỢC, không tuyên bố tuân thủ đầy đủ luật WXF.** Giao diện **phải** hiển thị tên bộ luật và giải thích điều kiện hoà cho người chơi **trước khi bắt đầu ván**.

---

## 1. HỆ TOẠ ĐỘ — `GR-COORD`

> Phần này là nền tảng của **mọi** luật bên dưới. Đọc kỹ trước khi đọc tiếp.

Bàn cờ là **9 cột × 10 hàng giao điểm** = **90 ô**. Quân đặt **tại giao điểm**, không phải trong ô.

| Mục | Quy ước |
|---|---|
| Ký hiệu | `(x, y)`, đếm từ **0** |
| `x` | 0 → 8, **trái sang phải** (9 cột) |
| `y` | 0 → 9, **trên xuống dưới** (10 hàng) |
| **`y = 0`** | Hàng **trên cùng** = hàng cuối của **ĐEN** |
| **`y = 9`** | Hàng **dưới cùng** = hàng cuối của **ĐỎ** |
| Nửa sân ĐEN | `y` 0 → 4 |
| Nửa sân ĐỎ | `y` 5 → 9 |
| **Sông** | Giữa `y = 4` và `y = 5` |
| Cung ĐEN | `x` 3→5, `y` 0→2 |
| Cung ĐỎ | `x` 3→5, `y` 7→9 |
| Chỉ số mảng | `y * 9 + x`, mảng đúng **90** phần tử |
| Đi trước | **ĐỎ** |

```
        x=0  1   2   3   4   5   6   7   8
      ┌───┬───┬───┬───┬───┬───┬───┬───┬───┐
y=0   │ 車 馬 象 士 將 士 象 馬 車 │  ← ĐEN, hàng cuối
y=1   │   ·   ·   ·  ╲│╱  ·   ·   ·     │     cung ĐEN
y=2   │   · 砲  ·   ·  ╱│╲  ·  砲  ·     │     x3-5, y0-2
y=3   │ 卒  ·  卒  ·  卒  ·  卒  ·  卒 │
y=4   │   ·   ·   ·   ·   ·   ·   ·     │  ← ĐEN qua sông khi y≥5
      ├═══════════ 楚 河   漢 界 ═══════┤  ← SÔNG
y=5   │   ·   ·   ·   ·   ·   ·   ·     │  ← ĐỎ qua sông khi y≤4
y=6   │ 兵  ·  兵  ·  兵  ·  兵  ·  兵 │
y=7   │   · 炮  ·   ·  ╲│╱  ·  炮  ·     │     cung ĐỎ
y=8   │   ·   ·   ·   ·  ╱│╲  ·   ·     │     x3-5, y7-9
y=9   │ 俥 傌 相 仕 帥 仕 相 傌 俥 │  ← ĐỎ, hàng cuối
      └───┴───┴───┴───┴───┴───┴───┴───┴───┘
```

**Cách nhớ:** `y` tăng theo chiều **từ trên xuống dưới màn hình** (giống toạ độ đồ hoạ). **ĐEN ở trên, ĐỎ ở dưới.**

### GR-COORD-01 — Lật bàn không đổi toạ độ

Người chơi cầm quân đen thấy bàn **lật ngược** để quân mình ở phía dưới. Đây **chỉ là cách hiển thị**. Toạ độ gửi lên máy chủ **luôn** theo hệ trên, không đổi theo góc nhìn.

---

## 2. THẾ CỜ BAN ĐẦU — `GR-INIT`

Đúng **32 quân**, mỗi bên **16**.

| Bên | Loại | Số | Vị trí |
|---|---|---|---|
| **ĐEN** | Tướng 將 | 1 | (4,0) |
| | Sĩ 士 | 2 | (3,0) (5,0) |
| | Tượng 象 | 2 | (2,0) (6,0) |
| | Mã 馬 | 2 | (1,0) (7,0) |
| | Xe 車 | 2 | (0,0) (8,0) |
| | Pháo 砲 | 2 | (1,2) (7,2) |
| | Tốt 卒 | 5 | (0,3) (2,3) (4,3) (6,3) (8,3) |
| **ĐỎ** | Tướng 帥 | 1 | (4,9) |
| | Sĩ 仕 | 2 | (3,9) (5,9) |
| | Tượng 相 | 2 | (2,9) (6,9) |
| | Mã 傌 | 2 | (1,9) (7,9) |
| | Xe 俥 | 2 | (0,9) (8,9) |
| | Pháo 炮 | 2 | (1,7) (7,7) |
| | Tốt 兵 | 5 | (0,6) (2,6) (4,6) (6,6) (8,6) |

**`GR-INIT-01`:** Bên đi trước là **ĐỎ**.

---

## 3. LUẬT DI CHUYỂN TỪNG QUÂN

Ký hiệu: `Δx` = thay đổi cột, `Δy` = thay đổi hàng.

### GR-MV-01 — Tướng (將 / 帥)

- Đi **1 ô thẳng**: ngang hoặc dọc. Không đi chéo.
- **Chỉ trong cung** của mình. ĐEN: `x`3-5 `y`0-2. ĐỎ: `x`3-5 `y`7-9.
- Ăn quân địch đứng ở ô đến.

### GR-MV-02 — Sĩ (士 / 仕)

- Đi **1 ô chéo**: `|Δx| = 1` và `|Δy| = 1`.
- **Chỉ trong cung**. Hệ quả: sĩ chỉ có **5 vị trí** khả dĩ (4 góc + tâm cung).

### GR-MV-03 — Tượng (象 / 相)

- Đi **chéo đúng 2 ô**: `|Δx| = 2` và `|Δy| = 2`.
- **Không được qua sông.** ĐEN luôn ở `y` 0-4; ĐỎ luôn ở `y` 5-9.
- **Cản mắt tượng:** ô giữa đường chéo — `((x₁+x₂)/2, (y₁+y₂)/2)` — phải **trống**. Có quân (bất kỳ bên nào) thì không đi được.

### GR-MV-04 — Mã (馬 / 傌)

- Đi hình chữ **日**: (`|Δx|=1` và `|Δy|=2`) **hoặc** (`|Δx|=2` và `|Δy|=1`).
- **Cản chân mã:** ô kề theo hướng đi **dài** (2 ô) phải **trống**.

| Hướng đi | Ô cản chân |
|---|---|
| `Δy = ±2` (dọc trước) | `(x₁, y₁ + Δy/2)` |
| `Δx = ±2` (ngang trước) | `(x₁ + Δx/2, y₁)` |

> Ví dụ: mã ĐỎ ở (1,9) muốn tới (0,7) — `Δx=-1, Δy=-2`, đi dọc trước ⇒ ô cản là **(1,8)**. Nếu (1,8) có quân thì **không đi được**, dù (0,7) trống.

### GR-MV-05 — Xe (車 / 俥)

- Đi **thẳng** ngang hoặc dọc, **không giới hạn** số ô.
- Đường đi phải **hoàn toàn trống**.
- Ăn quân địch **đầu tiên** gặp trên đường.

### GR-MV-06 — Pháo (砲 / 炮)

Quân duy nhất **đi khác cách ăn**:

| Hành động | Điều kiện |
|---|---|
| **Đi** (ô đến trống) | Đường đi **hoàn toàn trống**, như xe |
| **Ăn** (ô đến có quân địch) | Giữa pháo và mục tiêu có **đúng 1 quân** (gọi là **ngòi**), bất kể bên nào |

- **0 ngòi** ⇒ không ăn được.
- **2 ngòi trở lên** ⇒ không ăn được.
- Không ăn quân cùng bên.

### GR-MV-07 — Tốt (卒 / 兵)

Hướng tiến phụ thuộc bên (theo `GR-COORD`):

| Bên | Tiến là | Qua sông khi |
|---|---|---|
| **ĐỎ** (dưới) | `y` **giảm** (`Δy = -1`) | `y ≤ 4` |
| **ĐEN** (trên) | `y` **tăng** (`Δy = +1`) | `y ≥ 5` |

| Trạng thái | Được đi |
|---|---|
| **Chưa qua sông** | **Chỉ tiến thẳng** 1 ô |
| **Đã qua sông** | Tiến thẳng **hoặc** sang ngang 1 ô (`Δx = ±1, Δy = 0`) |

- **Không bao giờ lùi.**
- Không phong cấp. Tốt tới hàng cuối chỉ còn đi ngang.

---

## 4. LUẬT AN TOÀN TƯỚNG

### GR-SAFE-01 — Tướng đối mặt (cấm)

Hai tướng **không được** ở **cùng cột** (`x` giống nhau) mà **giữa chúng không có quân nào**.

Áp dụng cho **mọi nước đi**: nước nào làm hai tướng đối mặt đều **bất hợp lệ** — kể cả khi nước đó chỉ **dời quân đang chắn** đi chỗ khác.

### GR-SAFE-02 — Cấm tự chiếu

Nước đi làm **tướng của chính mình** bị chiếu (hoặc **vẫn** bị chiếu) là **bất hợp lệ**.

**Cách kiểm tra bắt buộc:**
1. Giả lập nước đi.
2. Kiểm tra tướng của bên vừa đi có bị quân địch nào tấn công không.
3. Kiểm tra `GR-SAFE-01`.
4. Bị chiếu hoặc đối mặt ⇒ **loại nước đi**.

### GR-SAFE-03 — Không có nước "ăn tướng"

Vì `GR-SAFE-02` loại mọi nước để tướng bị chiếu, **không bao giờ** tồn tại nước đi thật sự ăn được tướng. Ván kết thúc ở **chiếu hết**, trước khi tướng bị ăn.

### GR-SAFE-04 — Tính "ô bị tấn công" phải độc lập

Việc xác định một ô có bị tấn công không **phải** dùng phép tính hình học riêng, **không** được gọi đệ quy sang hàm sinh nước đi hợp lệ (sẽ lặp vô hạn: sinh nước → kiểm an toàn → sinh nước → …).

---

## 5. KẾT THÚC VÁN

### GR-END-01 — Hết nước đi hợp lệ ⇒ **THUA**

> ⚠ **Đây là điểm khác luật cờ tướng tiêu chuẩn.** Trong bộ luật này, **cả hai** trường hợp đều là **thua** cho bên đến lượt:

| Tình huống | Tên | Kết quả |
|---|---|---|
| Không còn nước hợp lệ **và đang bị chiếu** | `CHECKMATE` (chiếu hết) | Bên đến lượt **THUA** |
| Không còn nước hợp lệ **và không bị chiếu** | `STALEMATE` (hết nước) | Bên đến lượt **THUA** |

**Không có hoà vì hết nước đi.**

### GR-END-02 — Lặp 3 lần ⇒ **HOÀ**

Cùng một **thế cờ** và cùng **bên đến lượt** xuất hiện **lần thứ ba** ⇒ ván **hoà** (`REPETITION`).

**Khoá thế cờ gồm:**

| ✅ Tính vào | ❌ Không tính |
|---|---|
| Loại quân của mọi quân còn trên bàn | Mã định danh riêng của từng quân |
| Bên của mọi quân | Góc nhìn hiển thị |
| Vị trí `(x,y)` của mọi quân | Thời gian |
| **Bên đến lượt** | Số thứ tự nước đi |

**Quy tắc đếm:**
- Thế cờ **ban đầu** tính là lần xuất hiện **thứ 1**.
- Các lần xuất hiện **không cần liên tiếp**.
- Đếm phải **giữ được** qua mất kết nối và khởi động lại máy chủ.
- Sau khi **đi lại** (undo): dựng lại bộ đếm từ **nhánh đang có hiệu lực**, **không** giữ số đếm của nhánh đã bỏ.
- AI **phải** xét lịch sử lặp khi tìm nước.

**Hệ quả cần nhớ:** đổi mã định danh của hai quân cùng loại cùng bên ⇒ **cùng khoá**. Cùng bàn cờ nhưng **khác bên đến lượt** ⇒ **khác khoá**.

### GR-END-03 — Thứ tự ưu tiên khi xét kết thúc

1. **Hết nước đi** trước (`GR-END-01`) — kể cả khi thế cờ cũng đang lặp lần 3.
2. Còn nước đi **và** lặp lần 3 ⇒ hoà (`GR-END-02`).

### GR-END-04 — Không phân xử chiếu dai / đuổi dai

Bộ luật **không** có luật riêng cho chiếu dai hay đuổi dai. Mọi trường hợp lặp đều xử theo `GR-END-02`.

### GR-END-05 — Toàn bộ nguyên nhân kết thúc

| Nguyên nhân | Nghĩa | Trạng thái | Ai thắng |
|---|---|---|---|
| `CHECKMATE` | Chiếu hết | Kết thúc | Bên chiếu |
| `STALEMATE` | Hết nước đi | Kết thúc | Bên **còn** nước |
| `REPETITION` | Lặp 3 lần | Kết thúc | **Hoà** |
| `AGREED_DRAW` | Hai bên đồng ý hoà | Kết thúc | **Hoà** |
| `RESIGN` | Đầu hàng | Kết thúc | Đối thủ |
| `TIMEOUT` | Hết đồng hồ ván | Kết thúc | Đối thủ |
| `INACTIVITY` | Treo ván (`DEC-002`) | Kết thúc | Đối thủ |
| `DISCONNECT` | Mất mạng quá 60 giây | Kết thúc | Đối thủ |
| `BOTH_OFFLINE` | Cả hai mất mạng | **Gián đoạn** | **Không ai** |
| `SERVER_RESTART` | Máy chủ khởi động lại | **Gián đoạn** | **Không ai** |
| `AI_UNAVAILABLE` | Máy lỗi | **Gián đoạn** | **Không ai** |

**Quy tắc:** ván **gián đoạn** **không** chơi tiếp được, nhưng tạo ván mới được. Ván đã kết thúc **không bao giờ** quay lại đang chơi.

---

## 6. FIXTURE KIỂM CHỨNG

Ba thế cờ dưới đây đã được **review tay** (2026-09-21) theo hệ toạ độ `GR-COORD`. Dùng làm **đáp án độc lập** cho kiểm thử — **không** được lấy chính kết quả của hàm sinh nước đi làm đáp án cho chính nó.

### F-MATE — chiếu hết

| Bên | Quân | Vị trí |
|---|---|---|
| ĐEN | Tướng | (4,0) |
| ĐỎ | Tướng | (4,9) |
| ĐỎ | Tốt | (4,5) |
| ĐỎ | Xe | (3,2) · (4,2) · (5,2) |

**ĐEN đến lượt.** Chứng minh:
- Xe (4,2) chiếu tướng đen theo cột 4; ô (4,1) ở giữa **trống**.
- (3,0) bị xe (3,2) khống chế theo cột 3 — (3,1) trống.
- (5,0) bị xe (5,2) khống chế theo cột 5 — (5,1) trống.
- (4,1) bị chính xe (4,2) khống chế.
- ĐEN không còn quân nào khác để chắn hay ăn.
- Tướng đối mặt: cột 4 giữa (4,0) và (4,9) có (4,2) và (4,5) chắn ⇒ không vi phạm.

⇒ `check = true`, **0 nước hợp lệ**, `CHECKMATE`, **ĐỎ thắng**.

### F-STALEMATE — hết nước đi

| Bên | Quân | Vị trí |
|---|---|---|
| ĐEN | Tướng | (4,0) |
| ĐỎ | Tướng | (4,9) |
| ĐỎ | Tốt | (4,5) |
| ĐỎ | Xe | (3,1) · (5,1) |

**ĐEN đến lượt.** Chứng minh:
- Tướng đen (4,0) **không** bị chiếu: không xe nào cùng hàng 0 hay cột 4.
- (3,0) bị xe (3,1) khống chế theo cột 3.
- (5,0) bị xe (5,1) khống chế theo cột 5.
- (4,1) bị **cả hai** xe khống chế theo hàng 1.

⇒ `check = false`, **0 nước hợp lệ**, `STALEMATE`, **ĐỎ thắng** (theo `GR-END-01`).

### F-REPEAT — hoà do lặp

Từ thế cờ ban đầu, lặp chuỗi **2 vòng**:

| Nửa nước | Bên | Nước đi |
|---|---|---|
| 1 | ĐỎ | Mã (1,9) → (2,7) |
| 2 | ĐEN | Mã (1,0) → (2,2) |
| 3 | ĐỎ | Mã (2,7) → (1,9) |
| 4 | ĐEN | Mã (2,2) → (1,0) |

- Sau **4 nửa nước**: thế cờ ban đầu đạt số đếm **2** ⇒ vẫn **đang chơi**.
- Sau **8 nửa nước**: số đếm **3** ⇒ **HOÀ** `REPETITION`.

**Bắt buộc khi kiểm thử:** mỗi nước phải đi qua bước kiểm tra hợp lệ trước khi áp dụng. Cùng bàn cờ nhưng **khác bên đến lượt** thì **không gộp** số đếm. Sau khi đi lại, dựng lại số đếm từ nhánh hiệu lực.

---

## 7. LIÊN QUAN

| Nội dung | Tài liệu |
|---|---|
| Yêu cầu bàn cờ và thao tác | [../01-requirements/REQ-BOARD.md](../01-requirements/REQ-BOARD.md) |
| Vòng đời ván | [../01-requirements/REQ-MATCH.md](../01-requirements/REQ-MATCH.md) |
| Đồng hồ | [../01-requirements/REQ-CLOCK.md](../01-requirements/REQ-CLOCK.md) |
| Chống treo ván | [../01-requirements/REQ-INACTIVITY.md](../01-requirements/REQ-INACTIVITY.md) |
| AI dùng chung luật này | [../01-requirements/REQ-AI.md](../01-requirements/REQ-AI.md) |
