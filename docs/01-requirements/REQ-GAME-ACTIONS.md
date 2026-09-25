# REQ-GAME-ACTIONS — ĐẦU HÀNG, XIN HOÀ, XIN ĐI LẠI

**ID yêu cầu:** `R13` · **Trạng thái:** Ready · **Cập nhật:** 2026-09-21
**Căn cứ:** Câu 17, 18 phỏng vấn

---

## 1. FEATURE NÀY ĐỂ LÀM GÌ

Ba thao tác người chơi dùng trong lúc ván đang diễn ra:

| Thao tác | Cần đối thủ đồng ý? |
|---|---|
| **Đầu hàng** | ❌ Có hiệu lực ngay |
| **Xin hoà** | ✅ Cần đồng ý (chỉ ván online) |
| **Xin đi lại** | ✅ Cần đồng ý khi chơi với người · ❌ với máy thì không cần |

---

## 2. ACTOR

| Actor | Vai trò |
|---|---|
| **Người đề nghị** | Bấm đầu hàng / xin hoà / xin đi lại |
| **Đối thủ** | Chấp nhận hoặc từ chối đề nghị |
| **Hệ thống** | Hết hạn đề nghị, tính lại bàn cờ khi đi lại |

## 3. PRECONDITIONS

Ván **đang chơi** · người thao tác là **người chơi của ván** · tab đã xác thực; mọi tab thao tác được (DEC-020).

Riêng **xin đi lại**: người xin phải **đã đi ít nhất một nước** trên nhánh hiện tại.

## 4. TRIGGER

Bấm **Đầu hàng** / **Xin hoà** / **Xin đi lại** · đối thủ phản hồi · đề nghị hết hạn.

---

## 5. MAIN FLOWS

### 5.1 Đầu hàng

| Bước | Hành động |
|---|---|
| 1 | Người chơi bấm **Đầu hàng** |
| 2 | Giao diện yêu cầu **xác nhận** (nêu rõ sẽ thua ngay) |
| 3 | Xác nhận ⇒ ván **kết thúc ngay**, đối thủ thắng |

**`BR-ACT-01`** — Đầu hàng **không cần** đối thủ đồng ý và **không thể rút lại**.

### 5.2 Xin hoà

| Bước | Hành động |
|---|---|
| 1 | Người chơi bấm **Xin hoà** |
| 2 | Tạo đề nghị, hạn **30 giây** |
| 3 | Đối thủ thấy đề nghị, có nút **Đồng ý** / **Từ chối** |
| 4 | **Đồng ý** ⇒ ván kết thúc **hoà**. **Từ chối** hoặc **hết hạn** ⇒ ván tiếp tục |

**`BR-ACT-02`** — Xin hoà **chỉ có ở ván online**. Với máy **không có** nút xin hoà — máy chỉ hoà theo luật lặp 3 lần.

### 5.3 Xin đi lại (chơi với người)

| Bước | Hành động |
|---|---|
| 1 | Người chơi bấm **Xin đi lại** |
| 2 | Tạo đề nghị, hạn **30 giây** |
| 3 | Đối thủ **Đồng ý** ⇒ bàn cờ lùi về **ngay trước nước gần nhất của người xin** |
| 4 | Hệ thống **dựng lại** bàn cờ và bộ đếm lặp từ nhánh mới |
| 5 | **Không hoàn lại** thời gian đã dùng |

### 5.4 Đi lại với máy

Bấm là **có hiệu lực ngay**, không cần đồng ý. Hệ thống **huỷ** việc máy đang tính (nếu có).

---

## 6. LÙI BAO NHIÊU NƯỚC?

**`BR-ACT-03`** — Luôn lùi về **ngay trước nước gần nhất của người xin**:

| Tình huống | Lùi |
|---|---|
| Đối thủ **chưa** đáp lại | **1 nửa nước** |
| Đối thủ **đã** đáp lại | **2 nửa nước** |

> Ví dụ: A đi nước 10, B đáp nước 11, A xin đi lại ⇒ lùi **2 nửa nước**, về trước nước 10, đến lượt **A**.

---

## 7. ALTERNATIVE FLOWS

- **ALT-1** — Đi một nước trong lúc có đề nghị chờ ⇒ đề nghị **mất hiệu lực** ngay.
- **ALT-2** — Người xin **rút lại** đề nghị trước khi đối thủ trả lời ⇒ đề nghị huỷ.
- **ALT-3** — Chưa đi nước nào mà xin đi lại ⇒ nút **vô hiệu** kèm giải thích.

---

## 8. EXCEPTION FLOWS

| Tình huống | Phản hồi |
|---|---|
| Đã có **một** đề nghị đang chờ | Từ chối — mỗi ván chỉ **một** đề nghị chờ tại một thời điểm |
| **Tự chấp nhận** đề nghị của chính mình | **Từ chối** |
| Trả lời đề nghị **đã hết hạn** | *"Đề nghị đã hết hiệu lực"* |
| Xin đi lại khi **chưa đi nước nào** | Từ chối |
| Xin hoà ở ván **với máy** | Không có chức năng |
| Thao tác khi ván **đã kết thúc** | **Từ chối** — ván kết thúc không hồi sinh |
| Hết giờ trước khi đề nghị được chấp nhận | Ván kết thúc do **hết giờ**; đề nghị vô hiệu |
| Xin đề nghị quá nhanh liên tục | Giới hạn: **một đề nghị / 10 giây / người** |
| **Người xem** gửi đề nghị | **Từ chối** |
| Tab có phiên không hợp lệ gửi đề nghị | **Từ chối**; mọi tab có phiên hợp lệ của PLAYER đều được thao tác (DEC-020) |

---

## 9. POSTCONDITION

| Kết cục | Trạng thái |
|---|---|
| Đầu hàng | Ván **kết thúc**, đối thủ thắng |
| Hoà được đồng ý | Ván **kết thúc**, **hoà** |
| Hoà bị từ chối / hết hạn | Ván **tiếp tục**, không đổi bàn cờ |
| Đi lại được đồng ý | Bàn cờ lùi lại · lượt đổi · bộ đếm lặp dựng lại · **thời gian giữ nguyên** · phiên bản **vẫn tăng** |
| Đi lại bị từ chối / hết hạn | Ván tiếp tục, không đổi |

---

## 10. BUSINESS RULES

| ID | Luật |
|---|---|
| **BR-ACT-01** | Đầu hàng **ngay lập tức**, không cần đồng ý, không rút lại được |
| **BR-ACT-02** | Xin hoà **chỉ có ở ván online** |
| **BR-ACT-03** | Đi lại lùi về **ngay trước nước gần nhất của người xin**: 1 hoặc 2 nửa nước |
| **BR-ACT-04** | Mỗi ván chỉ **một** đề nghị đang chờ tại một thời điểm (dùng chung cho hoà và đi lại) |
| **BR-ACT-05** | Đề nghị hết hạn sau **30 giây** |
| **BR-ACT-06** | Giới hạn **một đề nghị / 10 giây / người** |
| **BR-ACT-07** | **Không tự chấp nhận** đề nghị của chính mình |
| **BR-ACT-08** | Một **nước đi mới** làm đề nghị đang chờ **mất hiệu lực** |
| **BR-ACT-09** | Đi lại **không hoàn lại thời gian** đã dùng |
| **BR-ACT-10** | Đi lại làm **phiên bản tăng**, không bao giờ giảm |
| **BR-ACT-11** | Đi lại **dựng lại bộ đếm lặp** từ nhánh mới; **không** giữ số đếm của nhánh bị bỏ |
| **BR-ACT-12** | Nước bị đi lại **vẫn còn** trong lịch sử, chỉ không nằm trên nhánh hiệu lực |
| **BR-ACT-13** | **Ván đã kết thúc không đi lại được** |
| **BR-ACT-14** | Người xin phải **đã đi ít nhất một nước** trên nhánh hiện tại |
| **BR-ACT-15** | Đi lại với **máy** không cần đồng ý và **huỷ** việc máy đang tính |
| **BR-ACT-16** | Đề nghị đang chờ **không** tạm dừng đồng hồ |
| **BR-ACT-17** | Trả lời lặp lại cùng một đề nghị chỉ cho **một** kết quả |

---

## 11. PERMISSIONS

| Hành động | Người xem | Người chơi | Tab khác đã xác thực | Máy |
|---|:---:|:---:|:---:|:---:|
| Đầu hàng | ❌ | ✅ | ✅ | ❌ |
| Xin hoà (online) | ❌ | ✅ | ✅ | ❌ |
| Xin hoà (với máy) | ❌ | ❌ | ❌ | ❌ |
| Xin đi lại (online) | ❌ | ✅ | ✅ | ❌ |
| Đi lại (với máy) | ❌ | ✅ | ✅ | — |
| Trả lời đề nghị | ❌ | ✅ (đối thủ) | ✅ (cùng đối thủ) | ❌ |
| Thấy đề nghị | ✅ (chỉ xem) | ✅ | ✅ | — |

---

## 12. UI LIÊN QUAN

`SCR-GAME-ROOM` (ba nút + khung đề nghị) · `SCR-CONFIRM-RESIGN` · `SCR-PROPOSAL-PROMPT`

```
┌──────────────────────────────────────┐
│ Đối thủ xin hoà                      │
│ Còn 00:23                            │
│        [ Từ chối ]  [ Đồng ý ]       │
└──────────────────────────────────────┘
```

**Quy tắc giao diện:**
- Xác nhận đầu hàng nêu rõ: *"Bạn sẽ **thua** ván này ngay lập tức."*
- Nút **Xin đi lại** **vô hiệu** khi chưa đi nước nào, kèm lời giải thích.
- Nút **Xin hoà** **không xuất hiện** ở ván với máy.
- Đang có đề nghị chờ ⇒ nút tạo đề nghị mới **vô hiệu**.
- Thông báo tạm **không che** nút Đầu hàng.
- Đề nghị hiện **thời gian còn lại**.

---

## 13. STATES

```
KHÔNG CÓ ĐỀ NGHỊ ──(xin hoà / xin đi lại)──► ĐANG CHỜ
        ▲                                        │
        │◄──(từ chối)────────────────────────────┤
        │◄──(hết hạn 30 giây)────────────────────┤
        │◄──(có nước đi mới)─────────────────────┤
        │◄──(người xin rút lại)──────────────────┤
        │                                        │ (đồng ý)
        │                                        ▼
        │                              ┌──────────────────┐
        └──(đi lại: ván tiếp tục)◄─────┤ ÁP DỤNG ĐỀ NGHỊ  │
                                       └────────┬─────────┘
                                                │ (hoà: ván kết thúc)
                                                ▼
                                          VÁN KẾT THÚC
```

---

## 14. REALTIME BEHAVIOR

| Sự kiện | Ai tạo | Máy chủ kiểm gì | Ai nhận | UI đổi gì |
|---|---|---|---|---|
| Đầu hàng | Người chơi | Là PLAYER của ván · ván đang chơi · phiên hợp lệ ở bất kỳ tab nào | Cả phòng | Ván kết thúc ngay, màn kết quả |
| Tạo đề nghị | Người chơi | Chưa có đề nghị chờ · chưa quá tần suất · (đi lại) đã đi nước | Cả phòng | Đối thủ thấy khung đề nghị; người xin thấy đang chờ |
| Đồng ý hoà | Đối thủ | Không tự chấp nhận · đề nghị còn hạn | Cả phòng | Ván kết thúc **hoà** |
| Đồng ý đi lại | Đối thủ | Như trên | Cả phòng | Bàn cờ **lùi lại** ở mọi client; lượt đổi; thời gian **giữ nguyên** |
| Từ chối / hết hạn | Đối thủ / hệ thống | — | Cả phòng | Khung đề nghị biến mất |
| Đi lại với máy | Người chơi | Là ván với máy · đã đi nước | Người chơi | Bàn lùi ngay; việc máy đang tính bị **huỷ** |

**`BR-ACT-18`** — Người xem thấy đề nghị và kết quả của nó, nhưng **không** trả lời được.

---

## 15. EDGE CASES

| # | Tình huống | Xử lý |
|---|---|---|
| 1 | Hai người **cùng lúc** xin hoà | **Đúng một** đề nghị được tạo; người kia bị báo đã có đề nghị chờ |
| 2 | Đồng ý hoà đúng lúc đối thủ đi nước | Nước đi làm đề nghị vô hiệu ⇒ đồng ý bị từ chối |
| 3 | Đồng ý hoà đúng lúc hết giờ | Ván kết thúc do **hết giờ** |
| 4 | Đầu hàng và hết giờ cùng lúc | **Đúng một** kết quả được ghi |
| 5 | Gửi lệnh đồng ý hai lần | Chỉ **một** kết quả (`BR-ACT-17`) |
| 6 | Xin đi lại rồi đối thủ đi nước trước khi trả lời | Đề nghị vô hiệu |
| 7 | Đi lại được đồng ý đúng lúc còn 3 giây đồng hồ | Vẫn **3 giây**, không hoàn (`BR-ACT-09`) |
| 8 | Đi lại rồi lặp lại đúng thế cờ cũ | Đếm lặp **dựng lại** từ nhánh mới (`BR-ACT-11`) |
| 9 | Đi lại với máy khi máy **đang tính** | Huỷ việc đang tính; kết quả tới muộn bị **bỏ** |
| 10 | Đi lại khi người xin chưa đi nước nào | Nút **vô hiệu**; lệnh giả mạo bị từ chối |
| 11 | Đi lại lùi về đúng nước đầu ván | Cho phép; về thế cờ ban đầu |
| 12 | Tự chấp nhận đề nghị của mình | **Từ chối** (`BR-ACT-07`) |
| 13 | Người xem gửi lệnh đầu hàng giả mạo | **Từ chối** |
| 14 | Đề nghị hết hạn đúng lúc đang bấm đồng ý | So mốc máy chủ; đến sau hạn thì từ chối |
| 15 | Đi lại nhiều lần liên tiếp | Mỗi lần cần một đề nghị mới, chịu giới hạn tần suất |

---

## 16. ACCEPTANCE CRITERIA

| ID | Tiêu chí |
|---|---|
| **AC-ACT-01** | Đầu hàng ⇒ ván kết thúc **ngay**, đối thủ thắng |
| **AC-ACT-02** | Xin hoà → đồng ý ⇒ ván **hoà** |
| **AC-ACT-03** | Xin hoà → từ chối ⇒ ván **tiếp tục**, không đổi bàn cờ |
| **AC-ACT-04** | Đề nghị **hết hạn đúng 30 giây** |
| **AC-ACT-05** | Chỉ **một** đề nghị chờ mỗi ván |
| **AC-ACT-06** | **Không tự chấp nhận** đề nghị của chính mình |
| **AC-ACT-07** | Nước đi mới làm đề nghị **mất hiệu lực** |
| **AC-ACT-08** | Đi lại **1 nửa nước** khi đối thủ chưa đáp |
| **AC-ACT-09** | Đi lại **2 nửa nước** khi đối thủ đã đáp |
| **AC-ACT-10** | Đi lại **không hoàn** thời gian |
| **AC-ACT-11** | Đi lại làm **phiên bản tăng** |
| **AC-ACT-12** | Đếm lặp **dựng lại** theo nhánh mới sau khi đi lại |
| **AC-ACT-13** | **Đi được nước mới** sau khi đi lại, không lỗi |
| **AC-ACT-14** | Đi lại với máy **không cần đồng ý** và **huỷ** việc máy đang tính |
| **AC-ACT-15** | Ván với máy **không có** nút xin hoà |
| **AC-ACT-16** | Ván đã kết thúc ⇒ mọi thao tác bị **từ chối** |
| **AC-ACT-17** | Đầu hàng / hết giờ / đồng ý hoà tranh nhau ⇒ **đúng một** kết quả |
| **AC-ACT-18** | Gửi lệnh trả lời lặp ⇒ **một** kết quả |
| **AC-ACT-19** | SPECTATOR không thực hiện thao tác PLAYER; mọi tab của PLAYER có phiên hợp lệ đều thao tác được theo DEC-020, không đòi giữ camera/mic |
| **AC-ACT-20** | Giới hạn **một đề nghị / 10 giây / người** có hiệu lực |

---

## 17. DEPENDENCY

[REQ-MATCH](REQ-MATCH.md) · [REQ-CLOCK](REQ-CLOCK.md) · [REQ-BOARD](REQ-BOARD.md) · [REQ-AI](REQ-AI.md) · [../04-business-rules/game-rules.md](../04-business-rules/game-rules.md)

## 18. OPEN QUESTIONS

**Không còn.**
