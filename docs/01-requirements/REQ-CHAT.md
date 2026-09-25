# REQ-CHAT — CHAT HAI KÊNH

**ID yêu cầu:** `R10` · **Trạng thái:** Ready · **Cập nhật:** 2026-09-22
**Căn cứ:** `DEC-029` (lịch sử và thay người) · `DEC-028` (chat trong phòng chờ) · Câu 8 phỏng vấn · **`DEC-018`** (mô hình mới — thay thế thiết kế tách tuyệt đối)

---

## 1. FEATURE NÀY ĐỂ LÀM GÌ

Hai kênh chat trong một phòng:

| Kênh | Ai đọc | Ai gửi |
|---|---|---|
| **Kênh riêng người chơi** | **Chỉ** 2 người chơi | **Chỉ** 2 người chơi |
| **Kênh chung** | 5 người xem **+ cả 2 người chơi** | 5 người xem **+ cả 2 người chơi** |

**Mục đích từng kênh:**
- **Kênh riêng** — hai người chơi nói với nhau mà người xem không đọc được.
- **Kênh chung** — người xem bàn luận; hai người chơi **tuỳ ý** mở ra đọc và tham gia, hoặc **ẩn đi** để khỏi bị phân tâm.

> Kênh `ROOM` là kênh chung cho mọi thành viên; kênh `PLAYERS` riêng cho người chơi đúng phạm vi người đọc (`DEC-018/044`).

---

## 2. ACTOR

| Actor | Kênh riêng người chơi | Kênh chung |
|---|---|---|
| **Người chơi** (gồm chủ phòng) | Đọc + gửi | Đọc + gửi · **có công tắc ẩn/hiện riêng** |
| **Người xem** | ❌ Không thấy | Đọc + gửi |
| **Tab khác của cùng người** | Đọc + gửi | Đọc + gửi |
| **Hệ thống** | Chọn kênh theo vai trò · kiểm quyền | |

---

## 3. PRECONDITIONS

Là thành viên phòng · phòng chưa đóng. **Được chat ngay trong WAITING**, không cần Sẵn sàng hay có Match (`DEC-028`). Quyền theo kênh giữ như §12; BR-CHT-17 áp dụng cho mọi tab.

## 4. TRIGGER

Vào phòng (tải lịch sử) · gõ tin và gửi · nhận tin mới · **bật/tắt công tắc ẩn hiện kênh chung**.

---

## 5. MAIN FLOW

| Bước | Hành động |
|---|---|
| 1 | Người dùng vào phòng, có thể chat ngay cả khi phòng đang WAITING và chưa có ván (`DEC-028`) |
| 2 | **Máy chủ xác định vai trò** và quyết định người đó thấy kênh nào |
| 3 | **Người chơi** ⇒ nhận phần lịch sử được phép của **cả hai** kênh; người vào thay không nhận tin riêng của cặp trước (`BR-CHT-25`). **Người xem** ⇒ nhận lịch sử **kênh chung** |
| 4 | Mỗi trang tối đa **50 tin**, mới nhất trước |
| 5 | Người dùng gõ tin, chọn kênh (người xem **chỉ có** kênh chung), gửi |
| 6 | Máy chủ kiểm: là thành viên · phiên đăng nhập hợp lệ · **được phép gửi vào kênh đó** · nội dung hợp lệ · chưa quá tần suất |
| 7 | Lưu tin, phát tới **đúng nhóm** của kênh đó |

**`BR-CHT-01`** — Client chọn kênh muốn gửi; **máy chủ** kiểm vai trò và phạm vi người đọc, không tin quyền/người gửi do client khai.

---

## 6. CÔNG TẮC ẨN/HIỆN KÊNH CHUNG

Mỗi người chơi có **một công tắc riêng**, **hoàn toàn độc lập** với người kia:

| Người chơi A | Người chơi B | Hợp lệ? |
|---|---|:---:|
| Hiện | Hiện | ✅ |
| Hiện | Ẩn | ✅ |
| Ẩn | Hiện | ✅ |
| Ẩn | Ẩn | ✅ |

**`BR-CHT-19`** — Công tắc là **tuỳ chọn hiển thị của riêng máy đó**, **không phải** phân quyền. Máy chủ **vẫn gửi** tin bình thường; bật lại là thấy **đủ lịch sử**, không có khoảng trống.

**`BR-CHT-20`** — Công tắc của A **không ảnh hưởng gì** tới B, tới người xem, hay tới việc A có gửi được tin hay không.

**`BR-CHT-21`** — Công tắc **không** đồng bộ giữa các tab của cùng một người — là tuỳ chọn hiển thị từng máy.

---

## 7. NGƯỜI XEM PHẢI BIẾT ĐIỀU NÀY

**`BR-CHT-22`** — Khung chat chung **luôn hiển thị** dòng thông báo:

```
ℹ️ Người chơi cũng đọc và gửi được ở kênh này
```

**Vì sao bắt buộc:** người xem cần biết **trước khi nói**. Đây là biện pháp minh bạch thay cho việc cấm đoán bằng kỹ thuật (`DEC-018`).

---

## 8. ALTERNATIVE FLOWS

- **ALT-1 — Người xem mới vào:** đọc được **lịch sử kênh chung** của ván đang diễn ra.
- **ALT-2 — Gửi lại tin do mạng chập chờn:** cùng mã tin ⇒ chỉ lưu **một** tin.
- **ALT-3 — Người chơi ẩn kênh chung rồi bật lại:** thấy **toàn bộ** tin đã trôi qua.
- **ALT-4 — Ván mới (tái đấu):** **cả hai** kênh bắt đầu **trống**.
- **ALT-5 — Người chơi gửi vào kênh chung:** tin hiện cho **người xem và cả người chơi kia** — kể cả người kia đang ẩn khung (họ sẽ thấy khi mở lại).
- **ALT-6 — Bắt đầu ván đầu:** giữ tin phòng chờ trong từng kênh theo quyền, không làm trống khung (`BR-CHT-26`).
- **ALT-7 — C vào thay B:** C dùng kênh riêng để chat với A, nhưng không nhận các tin riêng A–B trước đó (`BR-CHT-25`).

---

## 9. EXCEPTION FLOWS

| Tình huống | Phản hồi |
|---|---|
| Tin **rỗng** | Nút gửi **vô hiệu** |
| Tin **quá 1000 ký tự** | Chặn nhập thêm, báo giới hạn |
| Gửi **quá nhanh** | Chặn theo tần suất, báo thử lại sau |
| **Người xem** gửi vào kênh **riêng người chơi** | **Từ chối** |
| **Người xem** đọc kênh **riêng người chơi** | **Từ chối** |
| Tab khác gửi tin | Cho phép theo cùng quyền tài khoản; chống trùng và tần suất tính chung |
| Đã **bị đuổi** / bị thu hồi quyền | Từ chối gửi **và** cắt quyền đọc, kể cả lịch sử |
| Phòng **đã đóng** | Không gửi được |
| Mất mạng khi đang gửi | Hiện đang gửi; nối lại thì thử lại **cùng mã tin** |

---

## 10. POSTCONDITION

| Kết cục | Trạng thái |
|---|---|
| Gửi kênh riêng | Tin hiện ở **2 người chơi** |
| Gửi kênh chung | Tin hiện ở **5 người xem + 2 người chơi** |
| Bị từ chối | **Không** lưu, không ai thấy |
| Ẩn kênh chung | **Chỉ** giao diện người đó đổi; không ảnh hưởng ai |
| Bị thu hồi quyền | Mất **cả** gửi **và** đọc lịch sử |

---

## 11. BUSINESS RULES

| ID | Luật |
|---|---|
| **BR-CHT-01** | **Máy chủ** kiểm quyền theo vai trò + phạm vi người đọc; client chỉ chọn kênh, không tự khai quyền/người gửi |
| **BR-CHT-02** | **Người xem không bao giờ** đọc hay gửi được kênh **riêng người chơi** — cả tin mới lẫn lịch sử |
| **BR-CHT-03** | **Người chơi đọc và gửi được kênh chung** (`DEC-018`) |
| **BR-CHT-04** | Tin **1–1000 ký tự**, cho phép Unicode (tiếng Việt, emoji gõ tay) |
| **BR-CHT-05** | Giới hạn **5 tin / 10 giây** mỗi người, **tính chung cả hai kênh** |
| **BR-CHT-06** | Mỗi trang tối đa **50 tin** |
| **BR-CHT-07** | Tin lưu **30 ngày**, sau đó tự xoá |
| **BR-CHT-08** | Mỗi tin có **tên người gửi** và **thời điểm** |
| **BR-CHT-09** | Tin hiện theo **đúng thứ tự** máy chủ ghi nhận |
| **BR-CHT-10** | Gửi lại **cùng mã tin** ⇒ chỉ **một** tin được lưu |
| **BR-CHT-11** | **Không** sửa tin, **không** xoá tin sau khi gửi |
| **BR-CHT-12** | **Không** có gửi tệp hay bảng chọn emoji riêng |
| **BR-CHT-13** | Nội dung hiển thị **dạng chữ thuần**, **không** thực thi mã hay HTML |
| **BR-CHT-14** | Bị thu hồi quyền ⇒ mất **cả** đọc lẫn gửi, kể cả lịch sử |
| **BR-CHT-15** | Trong giai đoạn có ván, mỗi **ván** có hai kênh riêng; tái đấu bắt đầu **cả hai kênh mới, trống**. Chat trước ván được phép theo BR-CHT-24; bắt đầu **ván đầu tiên** giữ tin theo quyền đọc (BR-CHT-26) |
| **BR-CHT-16** | Máy chủ **không bao giờ** phát tin kênh **riêng người chơi** ra nhóm có người xem |
| **BR-CHT-17** | **Mọi tab** của cùng người **đọc và gửi được** (`DEC-020`) |
| **BR-CHT-18** | Nhãn khung chat ghi **rõ** đang ở kênh nào |
| **BR-CHT-19** | Công tắc ẩn/hiện là **tuỳ chọn giao diện**, không phải phân quyền; máy chủ vẫn gửi |
| **BR-CHT-20** | Công tắc của một người **không ảnh hưởng** người kia |
| **BR-CHT-21** | Công tắc **không đồng bộ** giữa các tab |
| **BR-CHT-22** | Kênh chung **luôn hiện** dòng báo người chơi cũng đọc và gửi được |
| **BR-CHT-24** | Thành viên được chat ngay trong **WAITING**, theo quyền hai kênh hiện có; chưa tạo Match không phải lý do từ chối gửi (`DEC-028`). Quyền lịch sử khi thay người và chuyển sang ván đầu theo BR-CHT-25/26 |
| **BR-CHT-25** | C vào thay B **không được đọc tin riêng A–B trước đó**, kể cả sau khi bắt đầu ván; máy chủ lọc/kiểm quyền trên mọi đường đọc, không chỉ dựa vào vai trò PLAYER hiện tại (`DEC-029`) |
| **BR-CHT-26** | WAITING → **ván đầu tiên**: giữ tin phòng chờ của từng kênh theo quyền đọc, không làm trống; không áp dụng cho tái đấu (`DEC-029`) |

> ⚠ **Luật còn lại tuyệt đối:** `BR-CHT-02` — **người xem không bao giờ** thấy kênh riêng của hai người chơi. Chiều ngược lại đã được mở theo `DEC-018`.

---

### Phạm vi tin khi thay người (`DEC-044`)

**BR-CHT-27** — Mỗi lần nhận ghế là một tư cách thành viên riêng. Tin riêng chỉ dành cho các PLAYER thuộc nhóm người đọc lúc gửi và vẫn giữ tư cách PLAYER đó. A còn ở phòng đọc tin A–B và A–C; C không đọc A–B. B rời rồi vào lại WAITING là lần nhận ghế mới, không tự khôi phục lịch sử A–B. Khi Host một mình, Host vẫn nhắn được; tin riêng gửi một mình chỉ Host đọc, người đến sau không được cấp quyền ngược thời gian. Đổi bên không đổi nhóm người đọc.

**BR-CHT-28** — Kênh chung cho thành viên hiện hành đọc toàn bộ tin còn lưu của vòng chat hiện tại, kể cả trước lúc vào. Bắt đầu ván đầu giữ nguyên vòng; tái đấu mở vòng mới, không có đường đọc vòng chat cũ qua lịch sử ván. Rời/bị thu hồi/đóng phòng cắt mọi lần truy cập tiếp theo.

**BR-CHT-29** — Client chọn kênh, máy chủ kiểm quyền; không tự chuyển tin sang kênh khác khi chọn sai. Cùng mã tin khác nội dung hoặc khác kênh bị từ chối, không báo gửi thành công tin sai. Tin đang gửi theo vòng/cặp cũ không tự chuyển sang vòng/cặp mới.

## 12. PERMISSIONS

| Hành động | Người ngoài | Người xem | Người chơi | Chủ phòng | Tab khác |
|---|:---:|:---:|:---:|:---:|:---:|
| Đọc **kênh riêng người chơi** | ❌ | ❌ | ✅ theo BR-CHT-25 | ✅ theo BR-CHT-25 | ⚠ cùng quyền của tài khoản |
| Gửi **kênh riêng người chơi** | ❌ | ❌ | ✅ | ✅ | ⚠ nếu là người chơi |
| Đọc **kênh chung** | ❌ | ✅ | ✅ | ✅ | ✅ |
| Gửi **kênh chung** | ❌ | ✅ | ✅ | ✅ | ✅ |
| Ẩn/hiện kênh chung | ❌ | ❌ | ✅ | ✅ | ✅ (riêng tab đó) |
| Sửa / xoá tin đã gửi | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 13. UI LIÊN QUAN

`SCR-CHAT-PANEL` có ngay trong **SCR-WAITING-ROOM**, chưa bắt đầu ván vẫn gửi được theo quyền (`DEC-028`); trên điện thoại nằm trong **tab riêng**.

### Giao diện người chơi — hai khung

```
┌──────────────────────────────┐
│ 💬 Riêng (người chơi)        │
├──────────────────────────────┤
│ Minh Nguyễn        14:32     │
│ Nước đó hay đấy!             │
├──────────────────────────────┤
│ [Nhập tin nhắn...]    [Gửi]  │
└──────────────────────────────┘

┌──────────────────────────────┐
│ 💬 Chung (người xem)    [👁] │ ← công tắc ẩn/hiện RIÊNG của bạn
├──────────────────────────────┤
│ ℹ️ Người chơi cũng đọc và    │
│    gửi được ở kênh này       │
├──────────────────────────────┤
│ hoang99            14:31     │
│ Ván này căng quá!            │
├──────────────────────────────┤
│ [Nhập tin nhắn...]    [Gửi]  │
└──────────────────────────────┘
```

Khi **ẩn**:
```
┌──────────────────────────────┐
│ 💬 Chung (người xem)    [👁‍🗨] │
│    Đang ẩn — bấm để hiện     │
└──────────────────────────────┘
```

### Giao diện người xem — một khung

```
┌──────────────────────────────┐
│ 💬 Chung                     │
├──────────────────────────────┤
│ ℹ️ Người chơi cũng đọc và    │
│    gửi được ở kênh này       │
├──────────────────────────────┤
│ hoang99            14:31     │
│ Ván này căng quá!            │
│                              │
│ Minh Nguyễn (người chơi) 14:33│ ← ghi RÕ là người chơi
│ Cảm ơn mọi người             │
├──────────────────────────────┤
│ [Nhập tin nhắn...]    [Gửi]  │
│                    0/1000    │
└──────────────────────────────┘
```

**`BR-CHT-23`** — Tin do **người chơi** gửi vào kênh chung phải có **nhãn phân biệt**, để người xem biết ai là người đang đánh.

**Trạng thái bắt buộc:** đang tải · **trống** · đang gửi (tin mờ) · lỗi + thử lại · vô hiệu (kèm lý do) · quá tần suất.

---

## 14. STATES

```
ĐANG SOẠN ──(gửi)──► ĐANG GỬI ──(máy chủ nhận)──► ĐÃ GỬI
                         └──(lỗi)──► LỖI ──(thử lại cùng mã tin)──► ĐANG GỬI

Công tắc kênh chung (riêng từng người chơi, từng tab):
   HIỆN ⇄ ẨN     ← chỉ đổi giao diện, không đổi quyền
```

---

## 15. REALTIME BEHAVIOR

### Kênh riêng người chơi

```
Người chơi A ──► Máy chủ ──► Người chơi B          ✅
                    │
                    ╳────► Người xem 1-5           ❌ KHÔNG BAO GIỜ
```

### Kênh chung

```
Người xem 1 ──► Máy chủ ──┬──► Người xem 2,3,4,5   ✅
                          └──► Người chơi A, B     ✅ (DEC-018)

Người chơi A ──► Máy chủ ──┬──► Người xem 1-5      ✅
                           └──► Người chơi B       ✅
```

| Sự kiện | Máy chủ kiểm gì | Ai nhận |
|---|---|---|
| Gửi kênh riêng | Là **người chơi** · mọi tab hợp lệ · nội dung · tần suất | **Chỉ 2 người chơi** |
| Gửi kênh chung | Là **thành viên** · mọi tab hợp lệ · nội dung · tần suất | **Toàn bộ 7 thành viên** |
| Ẩn/hiện kênh chung | — | **Không ai** — thuần giao diện (`BR-CHT-19`) |

---

## 16. EDGE CASES

| # | Tình huống | Xử lý |
|---|---|---|
| 1 | Người xem gửi tin giả mạo nhãn kênh riêng | **Từ chối** (`BR-CHT-01`) |
| 2 | Người xem xin đọc lịch sử kênh riêng | **Từ chối** (`BR-CHT-02`) |
| 3 | A ẩn kênh chung, người xem gửi tin | Tin **vẫn được lưu và gửi**; A thấy khi mở lại (`BR-CHT-19`) |
| 4 | A ẩn, B hiện | Hoàn toàn hợp lệ, độc lập (`BR-CHT-20`) |
| 5 | Cả A và B cùng ẩn | Hợp lệ. Người xem **vẫn chat bình thường** với nhau |
| 6 | A ẩn nhưng vẫn gửi tin vào kênh chung | **Được phép** — ẩn chỉ là hiển thị |
| 7 | A mở 2 tab, ẩn ở tab 1 | Tab 2 **không bị ẩn theo**; cả hai vẫn gửi được (`BR-CHT-21`) |
| 8 | Gửi cùng một tin 3 lần do mạng | Lưu **một** tin |
| 9 | Tin chứa mã HTML | Hiện **dạng chữ** |
| 10 | Gửi 6 tin/10 giây, chia hai kênh | Tin thứ 6 **bị chặn** — tần suất tính chung (`BR-CHT-05`) |
| 11 | Bị đuổi ngay sau khi gửi | Tin đã gửi **vẫn còn** với người khác |
| 12 | Người xem rời rồi vào lại làm **người chơi** | Có quyền dùng **cả hai** kênh; không đọc tin riêng của cặp trước khi vào thay (`BR-CHT-25`) |
| 13 | Tái đấu | **Cả hai** kênh trống lại |
| 14 | Tin cũ hơn 30 ngày | Đã tự xoá |
| 15 | C thay B rồi cùng A bắt đầu ván đầu | Giữ lịch sử C được phép đọc; không đưa tin riêng A–B cũ vào phản hồi cho C |

---

## 17. ACCEPTANCE CRITERIA

| ID | Tiêu chí |
|---|---|
| **AC-CHT-01** | Người chơi gửi **kênh riêng** ⇒ người xem **không nhận** |
| **AC-CHT-02** | Người xem **không đọc được lịch sử** kênh riêng |
| **AC-CHT-03** | Người xem gửi kênh chung ⇒ **cả người xem khác và cả 2 người chơi** đều nhận |
| **AC-CHT-04** | Người chơi gửi kênh chung ⇒ **người xem nhận được**, có **nhãn phân biệt** |
| **AC-CHT-05** | Người chơi **đọc được lịch sử** kênh chung |
| **AC-CHT-06** | Gửi sai kênh (giả mạo dữ liệu) ⇒ **từ chối** |
| **AC-CHT-07** | **Bốn tổ hợp** ẩn/hiện của A và B đều hoạt động đúng, **độc lập nhau** |
| **AC-CHT-08** | Ẩn rồi bật lại ⇒ thấy **đủ lịch sử**, không mất tin |
| **AC-CHT-09** | Công tắc của A **không ảnh hưởng** B và người xem |
| **AC-CHT-10** | Công tắc **không đồng bộ** giữa 2 tab của cùng người |
| **AC-CHT-11** | Dòng *"Người chơi cũng đọc và gửi được"* **luôn hiện** ở kênh chung |
| **AC-CHT-12** | Cùng mã tin gửi nhiều lần ⇒ lưu **một** tin |
| **AC-CHT-13** | Tin 0 và 1001 ký tự ⇒ từ chối; 1 và 1000 ⇒ chấp nhận |
| **AC-CHT-14** | Quá **5 tin/10 giây** (tính chung 2 kênh) ⇒ bị chặn |
| **AC-CHT-15** | Nội dung HTML hiện **dạng chữ**, không thực thi |
| **AC-CHT-16** | Phân trang **50 tin**, thứ tự đúng |
| **AC-CHT-17** | Bị thu hồi quyền ⇒ **không** nhận tin mới **và không** đọc lịch sử |
| **AC-CHT-18** | **Mọi tab** đều gửi được; hai tab gửi cùng lúc ⇒ **hai tin hợp lệ** |
| **AC-CHT-19** | Tái đấu ⇒ **cả hai** kênh trống |
| **AC-CHT-20** | Tin quá 30 ngày **không** còn trong lịch sử |
| **AC-CHT-21** | A và B đã vào phòng WAITING, chưa Sẵn sàng, chưa có Match: A gửi tin riêng hợp lệ ⇒ B nhận được; người xem không nhận; không từ chối chỉ vì chưa bắt đầu ván |
| **AC-CHT-22** | A–B nhắn riêng, B rời, C vào thay: lịch sử/tải thêm/đồng bộ cho C không chứa tin A–B; C gửi yêu cầu trực tiếp với mã tin/ngữ cảnh cũ vẫn không nhận nội dung; chỉ kiểm UI ẩn là chưa đủ |
| **AC-CHT-23** | A–B nhắn lúc chờ rồi bắt đầu ván đầu: tin hợp lệ của cả hai kênh vẫn hiển thị đúng thứ tự, không mất/nhân đôi chỉ vì chuyển trạng thái |
| **AC-CHT-24** | C thay B, A–C nhắn rồi bắt đầu ván đầu: C thấy tin A–C, không thấy tin A–B cũ, kể cả tải lại trang và gọi trực tiếp máy chủ |

---

### Nghiệm thu phạm vi và chống trùng bổ sung

| ID | Tiêu chí |
|---|---|
| **AC-CHT-25** | Host nhắn riêng một mình, B vào: B không đọc tin một người; A–B nhắn, B rời rồi quay lại: B không lấy lại tin cũ bằng mã tin/lịch sử/đồng bộ |
| **AC-CHT-26** | Cùng mã tin xuyên WAITING→ván đầu chỉ lưu một; cùng mã khác nội dung/kênh bị từ chối; tái đấu dùng vòng mới, gửi theo vòng cũ bị từ chối |
| **AC-CHT-27** | Gửi tin tranh chấp thu hồi: thu hồi trước ⇒ không lưu/phát; gửi trước ⇒ tin đã ghi còn với người đủ quyền, người bị thu hồi không nhận delivery muộn |
| **AC-CHT-28** | Người mới đọc kênh chung hiện tại, không đọc vòng trước sau tái đấu; mọi tab cộng chung tần suất 5 tin/10 giây |

## 18. DEPENDENCY

[REQ-ROOM](REQ-ROOM.md) · [REQ-SPECTATOR](REQ-SPECTATOR.md) · [REQ-MATCH](REQ-MATCH.md) · [REQ-DISCONNECT](REQ-DISCONNECT.md) · [REQ-HISTORY-REMATCH](REQ-HISTORY-REMATCH.md)

## 19. OPEN QUESTIONS

**Đã chốt** theo DEC-028/029/044. Thiết kế và kiểm thử được giao tại ISSUE-040/108–110 và [hợp đồng kỹ thuật](../09-technical/room-chat-contract.md) §4–5. Ready là trạng thái đặc tả, không phải đã triển khai.
