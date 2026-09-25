# REQ-MATCH — VÁN CỜ VÀ ĐỒNG BỘ

**ID yêu cầu:** `R06`, `R07` · **Trạng thái:** Ready · **Cập nhật:** 2026-09-21
**Luật cờ:** [../04-business-rules/game-rules.md](../04-business-rules/game-rules.md)

---

## 1. FEATURE NÀY ĐỂ LÀM GÌ

Quản lý **một ván cờ** từ nước đầu tới khi kết thúc: giữ trạng thái chính thức, phân xử từng nước đi, giữ mọi client đồng bộ, và ghi kết quả.

**Nguyên tắc cốt lõi:** **máy chủ là nguồn sự thật duy nhất.** Client chỉ gửi **ý định**; máy chủ quyết định điều gì thực sự xảy ra.

---

## 2. ACTOR

| Actor | Vai trò |
|---|---|
| **Người chơi** | Gửi nước đi và các thao tác trong ván |
| **Người xem** | Nhận cập nhật, không gửi gì |
| **Máy** | Gửi nước đi trong ván với máy |
| **Máy chủ** | Phân xử, ghi, phát cho mọi người |

## 3. PRECONDITIONS

Ván tồn tại và **đang chơi**. Người gửi là **người chơi của ván đó**, **đúng lượt**, đang ở **tab đang giữ thiết bị**.

## 4. TRIGGER

Hai người sẵn sàng (tạo ván) · người chơi đi nước · thao tác trong ván · thời hạn của hệ thống tới.

---

## 5. MAIN FLOW — MỘT NƯỚC ĐI ĐƯỢC CHẤP NHẬN

| Bước | Ai | Hành động |
|---|---|---|
| 1 | Người chơi | Gửi nước đi, kèm **mã lệnh duy nhất** và **phiên bản** đang thấy |
| 2 | Máy chủ | Xác thực danh tính và quyền phát thiết bị |
| 3 | Máy chủ | **Khoá ván** để không có hai lệnh chạy chồng nhau |
| 4 | Máy chủ | Kiểm **mã lệnh đã xử lý chưa** — nếu rồi thì trả **đúng kết quả cũ**, không làm lại |
| 5 | Máy chủ | Kiểm ván đang chơi · phiên bản khớp |
| 6 | Máy chủ | **Tính lại đồng hồ**; hết giờ ⇒ kết thúc ván ngay, **từ chối** nước đi |
| 7 | Máy chủ | Kiểm đúng lượt · đúng vai trò · **đúng luật cờ** |
| 8 | Máy chủ | Áp dụng nước đi, **tăng phiên bản**, ghi vào lịch sử |
| 9 | Máy chủ | Kiểm **kết thúc ván** (chiếu hết / hết nước / lặp 3 lần) |
| 10 | Máy chủ | Lưu, rồi mới **phát cho cả phòng** |
| 11 | Mọi client | Cập nhật bàn cờ, lượt, đồng hồ |

**`BR-MAT-01`** — Thứ tự bước 5→7 là **bắt buộc**: kiểm đồng hồ **trước** khi kiểm luật cờ. Nếu đã hết giờ thì ván kết thúc do hết giờ, chứ **không** chấp nhận nước đi muộn.

---

## 6. ALTERNATIVE FLOWS

- **ALT-1 — Gửi lại đúng lệnh cũ (mất phản hồi):** cùng **mã lệnh**, cùng nội dung ⇒ máy chủ trả **đúng kết quả lần đầu** kèm trạng thái mới nhất. **Không** đi thành hai nước.
- **ALT-2 — Nước đi kết thúc ván:** áp dụng nước đi **và** kết thúc ván trong **cùng một lần** tăng phiên bản, không tách hai bước.
- **ALT-3 — Đồng bộ chủ động:** client tự xin trạng thái khi vừa kết nối, khi thấy phiên bản nhảy cóc, sau lỗi xung đột, và **định kỳ** trong lúc đang chơi.
- **ALT-4 — Ván với máy:** người chơi đi xong, máy chủ giao việc cho máy tính nước. Kết quả của máy chỉ được nhận nếu **phiên bản vẫn khớp**.

---

## 7. EXCEPTION FLOWS

| Tình huống | Phản hồi |
|---|---|
| **Sai lượt** | Từ chối, **không đổi gì** |
| **Nước đi sai luật** | Từ chối, **không đổi gì** |
| **Phiên bản không khớp** (client cũ) | Trả lỗi xung đột + **trạng thái mới nhất**; client vẽ lại rồi thử lại |
| Cùng **mã lệnh** nhưng **nội dung khác** | Từ chối — nghi ngờ lỗi client |
| Không phải người chơi của ván | Từ chối |
| Không phải tab đang giữ thiết bị | Từ chối |
| Ván **đã kết thúc** | Từ chối |
| Hết giờ trước khi nước đi tới | Ván kết thúc do **hết giờ**; nước đi bị từ chối |
| Lưu thất bại | **Không** áp dụng gì cả — hoặc lưu trọn vẹn, hoặc không có gì |
| Phát tin thất bại sau khi đã lưu | Nước đi **vẫn có hiệu lực**. Client tự đồng bộ lại để bắt kịp |

**`BR-MAT-02`** — Lệnh bị từ chối vì sai luật/sai lượt **không được ghi lại như đã xử lý**, để client sửa rồi gửi lại được.

---

## 8. POSTCONDITION

| Kết cục | Trạng thái |
|---|---|
| Nước đi được chấp nhận | Bàn đổi · phiên bản **+1** · lịch sử +1 · đồng hồ chuyển bên · mọi client đồng bộ |
| Nước đi bị từ chối | **Không gì thay đổi** |
| Ván kết thúc | Ván ở trạng thái **kết thúc** hoặc **gián đoạn**; đồng hồ dừng; ràng buộc tham gia ván ACTIVE được giải phóng, membership phòng còn ở lại được giữ (DEC-032); phòng chuyển **đã xong** |

**`BR-MAT-03`** — Ván đã kết thúc **không bao giờ** quay lại đang chơi.

---

## 9. BUSINESS RULES

| ID | Luật |
|---|---|
| **BR-MAT-01** | Kiểm đồng hồ **trước** kiểm luật cờ |
| **BR-MAT-02** | Lệnh bị từ chối không ghi là đã xử lý |
| **BR-MAT-03** | Ván kết thúc là **vĩnh viễn** |
| **BR-MAT-04** | **Máy chủ là nguồn sự thật duy nhất.** Client không tự quyết kết quả |
| **BR-MAT-05** | **Phiên bản** tăng ở **mỗi** thay đổi được chấp nhận (nước đi, đi lại, đề nghị, kết quả) và **chỉ tăng**, không bao giờ giảm |
| **BR-MAT-06** | Mỗi lệnh có **mã duy nhất**. Gửi lại cùng mã + cùng nội dung ⇒ trả kết quả cũ, **không** làm lại |
| **BR-MAT-07** | Cùng mã nhưng **khác nội dung** ⇒ từ chối |
| **BR-MAT-08** | Mỗi lệnh xử lý **trong một khoá**, không có hai lệnh chạy chồng lên cùng một ván |
| **BR-MAT-09** | Lịch sử nước đi **chỉ thêm, không xoá**. Nước bị đi lại vẫn còn trong lịch sử, chỉ **không nằm trên nhánh hiệu lực** |
| **BR-MAT-10** | Đếm lặp 3 lần **chỉ** tính trên **nhánh hiệu lực** (`GR-END-02`) |
| **BR-MAT-11** | **Một** lần kết thúc ván ⇒ **một** lần tăng phiên bản và **một** bản ghi kết quả. Không kết thúc hai lần |
| **BR-MAT-12** | Nước đi kết thúc ván dùng **chung một** lần tăng phiên bản với chính nước đi đó |
| **BR-MAT-13** | Lưu **xong** rồi mới phát tin. Phát tin lỗi **không** làm huỷ nước đi đã lưu |
| **BR-MAT-14** | Trạng thái gửi cho client **không chứa** mã bí mật, email, phiên đăng nhập, hay dữ liệu đánh giá của máy |
| **BR-MAT-15** | Ván với máy: kết quả của máy chỉ nhận nếu **phiên bản vẫn khớp**. Kết quả tới muộn bị **bỏ** |

> **`BR-MAT-09` + `BR-MAT-10` là bài học từ lần xây dựng trước:** đếm lặp từng tính **cả nhánh đã bỏ** ⇒ báo hoà sai; và mô hình lịch sử không cho đi nước mới sau khi đi lại.

---

## 10. PERMISSIONS

| Hành động | Người xem | Người chơi (sai lượt) | Người chơi (đúng lượt) | Tab khác | Máy |
|---|:---:|:---:|:---:|:---:|:---:|
| Xem trạng thái ván | ✅ | ✅ | ✅ | ✅ | — |
| Xin đồng bộ lại | ✅ | ✅ | ✅ | ✅ | — |
| Đi nước | ❌ | ❌ | ✅ | ❌ | ✅ |
| Đầu hàng | ❌ | ✅ | ✅ | ❌ | ❌ |
| Xin hoà / xin đi lại | ❌ | ✅ | ✅ | ❌ | ❌ |

---

## 11. UI LIÊN QUAN

`SCR-GAME-ROOM` · `SCR-MATCH-RESULT` · `SCR-REPLAY`

**Trạng thái bắt buộc:** đang tải ván · đang gửi nước · **xung đột phiên bản** (tự đồng bộ, báo nhẹ) · mất kết nối (báo + tự nối lại) · ván kết thúc (màn kết quả có nút **Tái đấu** và **Rời phòng**).

**`BR-MAT-16`** — Giao diện **không bao giờ** hiện nước đi là "đã xong" trước khi máy chủ xác nhận. Trạng thái tạm phải phân biệt rõ với trạng thái đã xác nhận.

---

## 12. STATES

```
            (hai người sẵn sàng)
                     │
                     ▼
              ┌─────────────┐
              │  ĐANG CHƠI  │
              └──────┬──────┘
          ┌──────────┴──────────┐
          ▼                     ▼
   ┌─────────────┐       ┌──────────────┐
   │  KẾT THÚC   │       │  GIÁN ĐOẠN   │
   │ (có kết quả)│       │ (không ai    │
   │             │       │   thắng)     │
   └─────────────┘       └──────────────┘
        (không quay lại đang chơi)
```

| Vào **kết thúc** khi | Vào **gián đoạn** khi |
|---|---|
| Chiếu hết · hết nước đi · lặp 3 lần · đồng ý hoà · đầu hàng · hết giờ · **treo ván** · mất mạng quá hạn | Cả hai mất mạng · máy chủ khởi động lại · máy lỗi |

**Chuyển trạng thái KHÔNG hợp lệ:** kết thúc → đang chơi · gián đoạn → đang chơi · kết thúc hai lần · đi nước sau khi kết thúc.

---

## 13. REALTIME BEHAVIOR — LUỒNG DỮ LIỆU MỘT NƯỚC ĐI

```
Người chơi A          Máy chủ                    Người chơi B    Người xem 1..5
     │                   │                            │               │
     │──(ý định đi)─────►│                            │               │
     │                   │ 1. xác thực + quyền        │               │
     │                   │ 2. khoá ván                │               │
     │                   │ 3. lệnh này xử lý chưa?    │               │
     │                   │ 4. phiên bản khớp?         │               │
     │                   │ 5. tính đồng hồ            │               │
     │                   │ 6. đúng lượt? đúng luật?   │               │
     │                   │ 7. áp dụng, phiên bản +1   │               │
     │                   │ 8. kiểm kết thúc ván       │               │
     │                   │ 9. LƯU                     │               │
     │◄──(xác nhận)──────│                            │               │
     │                   │──(trạng thái mới)─────────►│               │
     │                   │──(trạng thái mới)─────────────────────────►│
     ▼                   ▼                            ▼               ▼
  bàn cập nhật      trạng thái chính thức       bàn cập nhật    bàn cập nhật
  đồng hồ chuyển                                đến lượt mình   chỉ xem
```

| Ai nhận gì | Nội dung |
|---|---|
| **Cả hai người chơi** | Bàn cờ · lượt · đồng hồ · lịch sử · kết quả nếu có |
| **Người xem** | **Giống hệt** người chơi, nhưng thao tác bị vô hiệu |
| Không phải thành viên | **Không nhận gì** |

---

## 14. EDGE CASES

| # | Tình huống | Xử lý |
|---|---|---|
| 1 | Cùng lệnh gửi 3 lần do mạng chập chờn | Ghi **một** nước; hai lần sau trả kết quả cũ |
| 2 | Hai người chơi gửi nước **cùng lúc** | Khoá ván xử lý tuần tự; người sai lượt bị từ chối |
| 3 | Đi nước bằng phiên bản cũ | Lỗi xung đột + trạng thái mới; client vẽ lại |
| 4 | Hết giờ và đầu hàng **cùng lúc** | **Đúng một** kết quả được ghi |
| 5 | Nước đi vừa tới thì hết giờ | Ván kết thúc do **hết giờ**, nước đi bị từ chối (`BR-MAT-01`) |
| 6 | Máy chủ chết **giữa lúc** lưu | Hoặc lưu trọn vẹn, hoặc không có gì. **Không** lưu nửa vời |
| 7 | Máy chủ khởi động lại khi đang chơi | Ván chuyển **gián đoạn**, **không ai thắng** |
| 8 | Phát tin lỗi sau khi đã lưu | Nước đi vẫn có hiệu lực; client đồng bộ để bắt kịp |
| 9 | Đi lại rồi đi nước mới | Tạo **nhánh mới**; nước cũ vẫn trong lịch sử nhưng không còn hiệu lực (`BR-MAT-09`) |
| 10 | Lặp 3 lần nhưng có nhánh đã bị đi lại | Đếm **chỉ** trên nhánh hiệu lực (`BR-MAT-10`) |
| 11 | Hết nước đi **và** lặp 3 lần cùng lúc | **Hết nước đi thắng** (`GR-END-03`) |
| 12 | Kết quả của máy về sau khi người chơi đã đi lại | **Bỏ** kết quả đó (`BR-MAT-15`) |
| 13 | Client đoán sai và vẽ trước nước đi | Máy chủ từ chối ⇒ client **hoàn lại** |

---

## 15. ACCEPTANCE CRITERIA

| ID | Tiêu chí |
|---|---|
| **AC-MAT-01** | Hai người sẵn sàng ⇒ tạo **đúng một** ván |
| **AC-MAT-02** | Nước đi hợp lệ ⇒ **đúng một** bản ghi lịch sử và **đúng một** lần tăng phiên bản |
| **AC-MAT-03** | Sai lượt / sai luật / sai vai trò / phiên không hợp lệ ⇒ **không gì thay đổi** trong dữ liệu |
| **AC-MAT-04** | Gửi lại **cùng lệnh** ⇒ trả kết quả lần đầu, **không** đi hai nước |
| **AC-MAT-05** | Cùng mã lệnh **khác nội dung** ⇒ **từ chối** |
| **AC-MAT-06** | Phiên bản cũ ⇒ lỗi xung đột + trạng thái mới nhất |
| **AC-MAT-07** | Phiên bản **chỉ tăng**, kể cả sau khi đi lại |
| **AC-MAT-08** | Hết giờ và đầu hàng tranh nhau ⇒ **đúng một** kết quả |
| **AC-MAT-09** | Hết giờ trước nước đi ⇒ ván kết thúc do hết giờ, nước đi bị từ chối |
| **AC-MAT-10** | Máy chủ khởi động lại ⇒ ván **gián đoạn**, **không ai thắng** |
| **AC-MAT-11** | Đếm lặp **chỉ** trên nhánh hiệu lực sau khi đi lại |
| **AC-MAT-12** | Đi nước mới **sau khi đi lại** thành công, không lỗi |
| **AC-MAT-13** | Kết thúc ván ⇒ giải phóng ràng buộc ván ACTIVE, giữ ghế thành viên phòng còn ở lại (`DEC-032`) và chuyển phòng sang **đã xong**, trong **cùng một** thao tác |
| **AC-MAT-14** | Trạng thái gửi cho client **không chứa** mã bí mật, email hay phiên đăng nhập |
| **AC-MAT-15** | Người xem nhận trạng thái **giống** người chơi nhưng **không** đi được nước |
| **AC-MAT-16** | Đồng bộ lại sau khi mạng ổn định **dưới 5 giây** |
| **AC-MAT-17** | Xử lý lệnh p95 **dưới 100 ms** khi thử tải 10 phòng / 70 kết nối |

---

## 16. DEPENDENCY

[../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) · [REQ-ROOM](REQ-ROOM.md) · [REQ-CLOCK](REQ-CLOCK.md) · [REQ-BOARD](REQ-BOARD.md) · [REQ-GAME-ACTIONS](REQ-GAME-ACTIONS.md) · [REQ-DISCONNECT](REQ-DISCONNECT.md) · [REQ-INACTIVITY](REQ-INACTIVITY.md) · [REQ-AI](REQ-AI.md)

## 17. OPEN QUESTIONS

**Không còn.**
