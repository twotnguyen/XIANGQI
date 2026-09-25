# REQ-CLOCK — ĐỒNG HỒ VÁN CỜ

**ID yêu cầu:** `R08` · **Trạng thái:** Ready · **Cập nhật:** 2026-09-21
**Căn cứ:** Câu 12, 18 phỏng vấn · `DEC-010`

---

## 1. FEATURE NÀY ĐỂ LÀM GÌ

Giới hạn thời gian suy nghĩ của mỗi bên trong một ván, và xử thua bên hết giờ.

---

## 2. ACTOR

| Actor | Vai trò |
|---|---|
| **Chủ phòng** | Chọn cấu hình thời gian khi tạo phòng / lúc đang chờ |
| **Người chơi** | Bị trừ thời gian khi đến lượt mình |
| **Người xem** | Chỉ nhìn |
| **Hệ thống** | Đếm, phát hiện hết giờ, kết thúc ván |

## 3. PRECONDITIONS

Ván **đang chơi** và cấu hình thời gian **khác** "không giới hạn".

## 4. TRIGGER

Ván bắt đầu · lượt chuyển bên · đồng hồ về 0.

---

## 5. MAIN FLOW

| Bước | Hành động |
|---|---|
| 1 | Chủ phòng chọn cấu hình khi tạo phòng (**mặc định: không giới hạn**) |
| 2 | Ván bắt đầu ⇒ cấu hình **khoá cứng** |
| 3 | Đồng hồ của bên đến lượt (**ĐỎ trước**) bắt đầu chạy |
| 4 | Người chơi đi nước ⇒ đồng hồ của họ **dừng**, đồng hồ đối thủ **chạy** |
| 5 | Lặp tới khi ván kết thúc |
| 6 | Đồng hồ của bên đến lượt về **0** ⇒ ván kết thúc, **đối thủ thắng** |

### 5.1 Bốn cấu hình

| Cấu hình | Giá trị | Ghi chú |
|---|---|---|
| **Không giới hạn** | — | **Mặc định.** Không có đồng hồ. Ván online áp dụng [REQ-INACTIVITY](REQ-INACTIVITY.md); ván máy không áp dụng |
| 5 phút | 5 phút **mỗi bên** | |
| 10 phút | 10 phút mỗi bên | |
| 15 phút | 15 phút mỗi bên | |

**`BR-CLK-01`** — Thời gian là **ngân sách cho cả ván** của mỗi bên, **không phải** giới hạn mỗi nước.
**`BR-CLK-02`** — **Không cộng giây** sau mỗi nước đi.

---

## 6. ALTERNATIVE FLOWS

- **ALT-1 — Không giới hạn:** không có đồng hồ đếm ngược nào. Giao diện ghi *"Không giới hạn"*. Luật chống treo ván áp dụng cho ván online; ván với máy được miễn (`DEC-010`, `DEC-012`).
- **ALT-2 — Đang có đề nghị chờ:** đồng hồ của bên đến lượt **vẫn chạy bình thường**. Xin hoà/xin đi lại **không** tạm dừng đồng hồ.
- **ALT-3 — Mất kết nối:** đồng hồ bên đến lượt **vẫn chạy** (`R09`). Có thể hết giờ trong lúc đang mất mạng, **kể cả ván với máy**. Đồng hồ hết ở hoặc trước mốc ân hạn 60 giây ⇒ `TIMEOUT`; AI chỉ `INTERRUPTED` tại giây 60 nếu chưa có kết quả sớm hơn (`BR-AI-11`, DEC-045).
- **ALT-4 — Đi lại được chấp nhận:** **không hoàn lại** thời gian đã dùng. Chỉ khôi phục bàn cờ và lượt, rồi đồng hồ của bên đến lượt mới bắt đầu chạy.
- **ALT-5 — Ván với máy:** đồng hồ áp dụng **cho cả hai**. Thời gian máy suy nghĩ và **thời gian chờ đến lượt máy** đều tính vào đồng hồ của máy.

---

## 7. EXCEPTION FLOWS

| Tình huống | Xử lý |
|---|---|
| Nước đi tới **đúng hoặc sau** thời điểm hết giờ | **Từ chối** nước đi; ván kết thúc do hết giờ |
| Hết giờ **và** đầu hàng cùng lúc | **Đúng một** kết quả được ghi |
| Hết giờ **và** hết hạn mất mạng cùng lúc | Thời hạn nào **đến trước** thì thắng; **bằng nhau ⇒ ưu tiên hết giờ** |
| Đổi cấu hình khi đang chơi | **Từ chối** — đã khoá |
| Máy chủ khởi động lại | Ván **gián đoạn**. **Không** tính thời gian máy chủ nghỉ để xử thua ai |
| Đồng hồ client lệch giờ máy chủ | Hiển thị theo **máy chủ**; client chỉ đếm tiếp cục bộ |

---

## 8. POSTCONDITION

| Kết cục | Trạng thái |
|---|---|
| Đi được nước | Đồng hồ mình dừng, đồng hồ đối thủ chạy |
| Hết giờ | Ván **kết thúc**, nguyên nhân **hết giờ**, đối thủ thắng, mọi đồng hồ dừng |
| Ván kết thúc vì lý do khác | Đồng hồ dừng, giữ nguyên số dư cuối |

---

## 9. BUSINESS RULES

| ID | Luật |
|---|---|
| **BR-CLK-01** | Thời gian là ngân sách **cả ván** mỗi bên, không phải mỗi nước |
| **BR-CLK-02** | **Không cộng giây** sau nước đi |
| **BR-CLK-03** | Bốn cấu hình: không giới hạn (**mặc định**) · 5 · 10 · 15 phút |
| **BR-CLK-04** | Cấu hình **khoá cứng** khi ván bắt đầu |
| **BR-CLK-05** | Chỉ đồng hồ của **bên đến lượt** chạy |
| **BR-CLK-06** | **Máy chủ** là nguồn thời gian chính thức. Client chỉ hiển thị |
| **BR-CLK-07** | Nước đi tới **đúng hạn hoặc sau** ⇒ từ chối |
| **BR-CLK-08** | Đề nghị đang chờ **không** tạm dừng đồng hồ |
| **BR-CLK-09** | Mất kết nối **không** tạm dừng đồng hồ |
| **BR-CLK-10** | Đi lại **không hoàn lại** thời gian đã dùng |
| **BR-CLK-11** | Hết giờ và hết hạn mất mạng bằng nhau ⇒ **ưu tiên hết giờ** |
| **BR-CLK-12** | Ván với máy: thời gian máy suy nghĩ **và** thời gian chờ đều tính vào đồng hồ máy |
| **BR-CLK-13** | Ngân sách suy nghĩ của máy **không được vượt quá** thời gian còn lại của máy |
| **BR-CLK-14** | Đồng hồ **không xuống dưới 0**; hiển thị 00:00 |
| **BR-CLK-15** | Chỉ đọc trạng thái ván **không** làm thay đổi đồng hồ đã lưu |

---

## 10. PERMISSIONS

| Hành động | Người xem | Người chơi | Chủ phòng (đang chờ) | Chủ phòng (đang chơi) |
|---|:---:|:---:|:---:|:---:|
| Xem đồng hồ | ✅ | ✅ | ✅ | ✅ |
| Chọn cấu hình thời gian | ❌ | ❌ | ✅ | ❌ |
| Tạm dừng / sửa đồng hồ | ❌ | ❌ | ❌ | ❌ |

**`BR-CLK-16`** — **Không ai** tạm dừng hay sửa được đồng hồ. Không có chức năng tạm dừng ván.

---

## 11. UI LIÊN QUAN

`SCR-CREATE-ROOM` (chọn cấu hình) · `SCR-WAITING-ROOM` (chủ phòng đổi được) · `SCR-GAME-ROOM` (hai đồng hồ)

```
┌──────────────────────────┐
│ ⚫ Lan Trần      07:42    │  ← đối thủ (dừng)
├──────────────────────────┤
│        [ BÀN CỜ ]        │
├──────────────────────────┤
│ 🔴 Minh Nguyễn   ▶ 06:15 │  ← đến lượt (đang chạy)
└──────────────────────────┘
```

**Quy tắc hiển thị:**
- Đồng hồ đang chạy có dấu hiệu rõ (**không chỉ bằng màu**).
- Dưới **1 phút** phải cảnh báo rõ ràng bằng chữ và/hoặc biểu tượng.
- Cấu hình không giới hạn hiện chữ **"Không giới hạn"**, không hiện số.
- Trên điện thoại, đồng hồ nằm ở thanh **dính** luôn thấy được.

---

## 12. STATES

```
CHƯA CHẠY ──(ván bắt đầu)──► ĐỎ CHẠY ⇄ ĐEN CHẠY ──(về 0)──► HẾT GIỜ
                                 │         │                    │
                                 └─────────┴──(ván kết thúc)────►  DỪNG
```

---

## 13. REALTIME BEHAVIOR

| Sự kiện | Ai tạo | Ai nhận | UI đổi gì |
|---|---|---|---|
| Ván bắt đầu | Hệ thống | Cả phòng | Hai đồng hồ hiện; đồng hồ ĐỎ chạy |
| Nước đi được chấp nhận | Người chơi | Cả phòng | Đồng hồ chuyển bên |
| **Hết giờ** | **Hệ thống** | Cả phòng | Ván kết thúc, màn kết quả |
| Đồng bộ lại | Client | Client đó | Đồng hồ nhảy về đúng số máy chủ |

**`BR-CLK-17`** — Client hiển thị = **số dư máy chủ gửi** trừ đi thời gian trôi qua cục bộ từ lúc nhận. Client **không bao giờ** tự kết luận ván đã hết giờ — chỉ **máy chủ** kết thúc ván.

---

## 14. EDGE CASES

| # | Tình huống | Xử lý |
|---|---|---|
| 1 | Đi nước đúng mili-giây hết giờ | Máy chủ so mốc; đến **trước** hạn thì hợp lệ |
| 2 | Cả hai gần hết giờ cùng lúc | Chỉ bên **đến lượt** bị trừ, nên chỉ một bên hết |
| 3 | Mất mạng 70 giây với đồng hồ còn 30 giây | **Hết giờ trước** (30 giây < 60 giây ân hạn) ⇒ thua do hết giờ |
| 4 | Mất mạng 70 giây với đồng hồ còn 5 phút | **Hết hạn mất mạng trước** ⇒ online xử theo REQ-DISCONNECT; ván AI ⇒ `INTERRUPTED` tại giây 60 nếu chưa có kết quả |
| 5 | Đề nghị hoà chờ 30 giây | Đồng hồ **vẫn chạy** suốt (`BR-CLK-08`) |
| 6 | Đi lại được chấp nhận khi còn 2 phút | Vẫn **2 phút**, không hoàn lại (`BR-CLK-10`) |
| 7 | Máy chủ khởi động lại khi còn 1 phút | Ván **gián đoạn**; không xử thua ai |
| 8 | Đồng hồ máy người dùng sai giờ | Không ảnh hưởng — máy chủ quyết định |
| 9 | Tab bị trình duyệt tạm ngưng | Nối lại thì đồng bộ về số máy chủ |
| 10 | Máy tính lâu hơn thời gian còn lại | Ngân sách bị cắt theo thời gian còn lại (`BR-CLK-13`) |
| 11 | Ván không giới hạn | **Không** có hết giờ; online áp dụng luật treo ván, AI được miễn |

---

## 15. ACCEPTANCE CRITERIA

| ID | Tiêu chí |
|---|---|
| **AC-CLK-01** | Bốn cấu hình chọn được; **mặc định là không giới hạn** |
| **AC-CLK-02** | Cấu hình **không đổi được** sau khi ván bắt đầu |
| **AC-CLK-03** | Chỉ đồng hồ **bên đến lượt** giảm |
| **AC-CLK-04** | Hết giờ ⇒ ván kết thúc, nguyên nhân **hết giờ**, đối thủ thắng |
| **AC-CLK-05** | **Không giới hạn** ⇒ **không bao giờ** hết giờ |
| **AC-CLK-06** | Nước đi tới **sau** hạn ⇒ bị từ chối |
| **AC-CLK-07** | Đề nghị chờ **không** dừng đồng hồ |
| **AC-CLK-08** | Mất kết nối **không** dừng đồng hồ |
| **AC-CLK-09** | Đi lại **không hoàn** thời gian |
| **AC-CLK-10** | Hết giờ và hết hạn mất mạng bằng nhau ⇒ **hết giờ thắng** |
| **AC-CLK-11** | Hết giờ và đầu hàng tranh nhau ⇒ **đúng một** kết quả |
| **AC-CLK-12** | Ngân sách máy **không vượt** thời gian còn lại của máy |
| **AC-CLK-13** | Hai client hiện đồng hồ lệch nhau **không quá 1 giây** |
| **AC-CLK-14** | Đọc trạng thái ván **không** làm đổi đồng hồ đã lưu |
| **AC-CLK-15** | Toàn bộ test thời gian dùng **đồng hồ giả tiêm vào**, không chờ thật |

---

## 16. DEPENDENCY

[REQ-MATCH](REQ-MATCH.md) · [REQ-ROOM](REQ-ROOM.md) · [REQ-DISCONNECT](REQ-DISCONNECT.md) · [REQ-INACTIVITY](REQ-INACTIVITY.md) · [REQ-GAME-ACTIONS](REQ-GAME-ACTIONS.md) · [REQ-AI](REQ-AI.md)

## 17. OPEN QUESTIONS

**Không còn.**
