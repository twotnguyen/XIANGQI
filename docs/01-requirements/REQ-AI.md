# REQ-AI — CHƠI VỚI MÁY

**ID yêu cầu:** `R12` · **Trạng thái:** Ready · **Cập nhật:** 2026-09-21
**Căn cứ:** Câu 4, 5, 23 phỏng vấn · `DEC-012` (không áp dụng luật treo ván)

---

## 1. FEATURE NÀY ĐỂ LÀM GÌ

Cho người dùng đánh cờ **một mình với máy**, ở **ba cấp độ**, bất cứ lúc nào không có đối thủ người.

**Bối cảnh học thuật:** phần trí tuệ nhân tạo là **nội dung chính khi bảo vệ đồ án**. Máy phải **tự viết**, giải thích được thuật toán, và có **số đo thực nghiệm tái lập được**. **Không** dùng engine cờ có sẵn.

---

## 2. ACTOR

| Actor | Vai trò |
|---|---|
| **Người chơi** | Chọn cấp độ, bên, cấu hình thời gian; đi cờ |
| **Máy** | Tính và đi nước khi tới lượt. **Không phải** tài khoản |
| **Hệ thống** | Giao việc cho máy, giới hạn thời gian, huỷ việc khi cần |

## 3. PRECONDITIONS

Đã đăng nhập · **đã rời** mọi phòng online · **không** có ván với máy nào đang chạy.

## 4. TRIGGER

Bấm **Chơi với máy** · người chơi đi xong một nước (tới lượt máy).

---

## 5. MAIN FLOW

| Bước | Hành động |
|---|---|
| 1 | Người chơi bấm **Chơi với máy** |
| 2 | Chọn **cấp độ** (Dễ / Trung bình / Khó), **bên** (Đỏ / Đen), **cấu hình thời gian** |
| 3 | Hệ thống tạo ván; bàn cờ ở thế ban đầu |
| 4 | Người chơi cầm **đen** ⇒ máy (đỏ) **đi trước** |
| 5 | Tới lượt máy ⇒ hiện trạng thái **"Máy đang suy nghĩ…"** |
| 6 | Máy tính trong **ngân sách thời gian** của cấp đó |
| 7 | Máy trả nước đi; **máy chủ kiểm tra hợp lệ** rồi áp dụng |
| 8 | Tới lượt người chơi |

### 5.1 Ba cấp độ

| Cấp | Ngân sách suy nghĩ | Độ sâu tối đa |
|---|---|---|
| **Dễ** | 300 ms | 2 |
| **Trung bình** | 1000 ms | 4 |
| **Khó** | 3000 ms | 6 |

**`BR-AI-01`** — Ngân sách là **thời gian tính toán**, **không phải** tổng độ trễ người dùng cảm nhận.
**`BR-AI-02`** — **Không** quy đổi cấp độ ra Elo hay tuyên bố mạnh ngang engine chuyên dụng.

---

## 6. ALTERNATIVE FLOWS

- **ALT-1 — Đi lại với máy:** có hiệu lực **ngay**, không cần đồng ý. Hệ thống **huỷ** việc máy đang tính. Xem [REQ-GAME-ACTIONS](REQ-GAME-ACTIONS.md).
- **ALT-2 — Đầu hàng:** người chơi đầu hàng bất cứ lúc nào.
- **ALT-3 — Chơi lại:** ván kết thúc ⇒ nút **Chơi lại** tạo ván mới, **giữ** cấp độ và cấu hình thời gian, **đổi bên** theo lựa chọn.
- **ALT-4 — Ván bị gián đoạn:** **không** chơi tiếp được, nhưng tạo ván mới được.
- **ALT-5 — Tải lại trang:** ván **vẫn còn**, quay lại chơi tiếp.

---

## 7. EXCEPTION FLOWS

| Tình huống | Xử lý |
|---|---|
| Đang ở phòng online | Từ chối; yêu cầu rời phòng trước |
| Đã có ván với máy đang chạy | Từ chối; yêu cầu kết thúc ván cũ |
| Hệ thống **quá tải** | Từ chối tạo ván mới, báo thử lại sau. **Không** làm hỏng ván đang có. Tiếp nhận tối đa10ván ACTIVE, giữ chỗ xử lý suốt ván theo DEC-045 |
| Máy tính bị **lỗi** | **Thử lại một lần** nếu còn thời gian và còn chỗ |
| Thử lại vẫn lỗi | Ván **gián đoạn**, **không ai thắng**. **Không** xử người chơi thua vì lỗi máy |
| Máy **hết ngân sách** trước khi xong | Dùng **nước hợp lệ dự phòng** đã chọn sẵn |
| Kết quả của máy về **muộn** sau khi bàn cờ đã đổi | **Bỏ** kết quả đó |
| Máy trả nước **không hợp lệ** | **Từ chối**; coi là lỗi máy |
| Người chơi ngoại tuyến đủ **60 giây** | Chỉ ván chưa có kết quả/deadline sớm hơn mới **gián đoạn** (`BR-AI-11`) |

**`BR-AI-03`** — **Không bao giờ** xử người chơi thua vì lỗi của máy hay của hệ thống.

---

## 8. POSTCONDITION

| Kết cục | Trạng thái |
|---|---|
| Tạo ván | Ván với máy **đang chơi**; người chơi bị khoá không tạo phòng online |
| Máy đi xong | Bàn đổi, tới lượt người chơi, đồng hồ chuyển bên |
| Ván kết thúc | Kết quả được ghi; có nút **Chơi lại** |
| Ván gián đoạn | Không có người thắng; tạo ván mới được |

---

## 9. BUSINESS RULES

| ID | Luật |
|---|---|
| **BR-AI-01** | Ngân sách là thời gian **tính toán**, không phải độ trễ cảm nhận |
| **BR-AI-02** | **Không** quy đổi ra Elo |
| **BR-AI-03** | **Không** xử người chơi thua vì lỗi máy/hệ thống |
| **BR-AI-04** | Ba cấp: **Dễ 300 ms / độ sâu 2** · **Trung bình 1000 ms / 4** · **Khó 3000 ms / 6** |
| **BR-AI-05** | Người chơi **chọn bên**. **ĐỎ luôn đi trước** — chọn đen thì máy đi trước |
| **BR-AI-06** | Máy dùng **cùng bộ luật** với ván online (`xiangqi-simple-v1`) |
| **BR-AI-07** | Máy **phải xét lịch sử lặp** khi tìm nước |
| **BR-AI-08** | Nước đi của máy **vẫn bị máy chủ kiểm tra hợp lệ** như nước của người |
| **BR-AI-09** | Ngân sách suy nghĩ **không được vượt** thời gian còn lại trên đồng hồ của máy |
| **BR-AI-10** | Ván với máy: **không có phòng, không có người xem, không có chat, không có media** |
| **BR-AI-11** | Người chơi ngoại tuyến đủ **60 giây** ⇒ nếu chưa có kết quả/deadline kết thúc sớm hơn, ván **gián đoạn**, không ai thắng. Đồng hồ bên đến lượt vẫn chạy; `TIMEOUT` đến trước hoặc đúng mốc 60 giây vẫn xử thua bên hết giờ (DEC-045) |
| **BR-AI-12** | **Không** áp dụng luật chống treo ván cho ván với máy (`DEC-012`) |
| **BR-AI-13** | Máy **không** xin hoà và **không** đầu hàng. Máy chỉ hoà theo **luật lặp 3 lần** |
| **BR-AI-14** | Đi lại với máy **không cần đồng ý** và **huỷ** việc đang tính |
| **BR-AI-15** | Một tài khoản chỉ có **một** ván với máy tại một thời điểm |
| **BR-AI-16** | Kết quả máy tới muộn (bàn cờ đã đổi) ⇒ **bỏ** |
| **BR-AI-17** | Trạng thái **"đang xếp hàng"** và **"đang suy nghĩ"** phải hiển thị **khác nhau** |
| **BR-AI-18** | Máy **tự viết**. **Không** dùng engine sinh nước đi có sẵn hay thư viện luật thay phần thuật toán |
| **BR-AI-19** | Tính toán của máy **không được làm nghẽn** việc phục vụ các ván khác |
| **BR-AI-20** | Mỗi kết quả tìm kiếm ghi lại: **nước chọn · số nút duyệt · độ sâu hoàn thành · thời gian · điểm · đường đi chính · có bị cắt giữa chừng không** |

---

## 10. YÊU CẦU HỌC THUẬT (phục vụ bảo vệ)

| ID | Yêu cầu |
|---|---|
| **BR-AI-21** | Có **bản cơ sở minimax** và **bản cải tiến cắt tỉa alpha-beta** để so sánh được |
| **BR-AI-22** | Cải tiến gồm: **cắt tỉa alpha-beta**, **sắp xếp thứ tự nước đi**, **đào sâu dần** |
| **BR-AI-23** | Hàm lượng giá xét: **giá trị quân · vị trí · độ linh hoạt · an toàn tướng** |
| **BR-AI-24** | Bộ thế cờ thử **ít nhất 20 thế**: 5 bắt quân rõ · 5 thoát chiếu · 5 tàn cuộc/chiếu hết · 5 tránh lặp |
| **BR-AI-25** | Mỗi thế có **đáp án do người review tay**, **không** lấy chính kết quả của máy làm đáp án |
| **BR-AI-26** | So sánh cùng độ sâu và cùng thứ tự nước: hai bản cho **điểm và tập nước tốt tương đương**; bản cắt tỉa duyệt **không nhiều nút hơn** và **giảm tổng số nút** trên toàn bộ tập |
| **BR-AI-27** | Đấu đối kháng **mỗi cặp cấp độ 20 ván**, đổi màu, tổng **60 ván**. Cấp cao phải đạt **trên 50%** điểm |
| **BR-AI-28** | Báo cáo ghi **seed, số nút, độ sâu, điểm, môi trường** để **tái lập được** |
| **BR-AI-29** | Máy đi **nước không hợp lệ** hoặc **treo** ⇒ **lần chạy thử hỏng**, **không** tính là thua để tô hồng sức mạnh |
| **BR-AI-30** | Báo cáo phải **trung thực**: nếu có thế cờ mà bản cắt tỉa duyệt nhiều nút hơn thì **ghi rõ**, không giấu |

---

**Định nghĩa nghiệm thu (DEC-045):** [ai-validation](../09-technical/ai-validation.md) là nguồn chuẩn của phép đo, oracle, lịch sử nhánh hiệu lực và tái lập. Ngưỡng 16/20 là sàn chất lượng học thuật của bộ 20 cố định, không suy ra Elo; không thay đáp án sau khi thấy output để đạt ngưỡng.

## 11. PERMISSIONS

| Hành động | Người dùng | Người dùng đang ở phòng online | Máy |
|---|:---:|:---:|:---:|
| Tạo ván với máy | ✅ | ❌ | — |
| Đi cờ | ✅ | — | ✅ |
| Đi lại (không cần đồng ý) | ✅ | — | ❌ |
| Đầu hàng | ✅ | — | ❌ |
| Xin hoà | ❌ (không có chức năng) | — | ❌ |
| Chơi lại | ✅ | — | — |
| Người khác xem ván với máy | ❌ | ❌ | — |

---

## 12. UI LIÊN QUAN

`SCR-AI-SETUP` · `SCR-AI-GAME` · `SCR-MATCH-RESULT`

```
┌────────────────────────────────┐
│ Chơi với máy                   │
├────────────────────────────────┤
│ Cấp độ                         │
│  ( ) Dễ         ( ) Trung bình │
│  (•) Khó                       │
│                                │
│ Bạn cầm quân                   │
│  (•) Đỏ (đi trước)   ( ) Đen   │
│                                │
│ Thời gian                      │
│  [ Không giới hạn ▾ ]          │
│                                │
│         [ Bắt đầu ]            │
└────────────────────────────────┘
```

**Trạng thái bắt buộc:**

| Trạng thái | Hiển thị |
|---|---|
| Đang xếp hàng | *"Đang chờ đến lượt xử lý…"* |
| Máy đang suy nghĩ | *"Máy đang suy nghĩ…"* (**khác** với đang xếp hàng) |
| Máy lỗi | Báo rõ + đang thử lại |
| Ván gián đoạn | *"Ván bị gián đoạn — không có người thắng"* + nút **Ván mới** |
| Ván kết thúc | Kết quả + nút **Chơi lại** |

**`BR-AI-31`** — Giao diện **không** hiện điểm đánh giá hay đường tính toán của máy trong lúc đang chơi — đó là **mách nước**.

---

## 13. STATES

```
Ván:     ĐANG CHƠI ──► KẾT THÚC  (có kết quả)
                  └──► GIÁN ĐOẠN (máy lỗi · người chơi ngoại tuyến quá hạn)

Việc của máy:  RỖI ──► ĐANG XẾP HÀNG ──► ĐANG TÍNH ──► XONG
                 ▲            │               │
                 │            └───────────────┴──(bị huỷ: đi lại/
                 └──────────────────────────────── ván kết thúc/lỗi)
```

---

## 14. REALTIME BEHAVIOR

| Sự kiện | Ai tạo | Máy chủ kiểm gì | Ai nhận | UI đổi gì |
|---|---|---|---|---|
| Tạo ván | Người chơi | Không ở phòng online · không có ván máy khác | Người chơi | Bàn cờ hiện |
| Người chơi đi nước | Người chơi | Đúng lượt · đúng luật · đồng hồ | Người chơi | Bàn đổi; giao việc cho máy |
| Máy bắt đầu tính | Hệ thống | Còn chỗ xử lý | Người chơi | *"Máy đang suy nghĩ…"* |
| Máy trả nước | Máy | **Phiên bản còn khớp** · **nước hợp lệ** | Người chơi | Bàn đổi; tới lượt người chơi |
| Đi lại | Người chơi | Đã đi ít nhất một nước | Người chơi | Bàn lùi; **huỷ** việc máy đang tính |
| Máy lỗi quá số lần thử | Hệ thống | — | Người chơi | Ván **gián đoạn** |

---

## 15. EDGE CASES

| # | Tình huống | Xử lý |
|---|---|---|
| 1 | Đi lại **giữa lúc máy đang tính** | Huỷ việc; kết quả tới muộn bị **bỏ** (`BR-AI-16`) |
| 2 | Người chơi đầu hàng khi máy đang tính | Ván kết thúc; huỷ việc |
| 3 | Máy hết ngân sách chưa xong độ sâu 1 | Dùng **nước dự phòng** theo thứ tự cố định |
| 4 | Máy trả nước không hợp lệ | **Từ chối**, coi là lỗi máy, thử lại |
| 5 | Máy lỗi 2 lần liên tiếp | Ván **gián đoạn**, người chơi **không thua** |
| 6 | Đồng hồ máy còn 200 ms ở cấp Khó | Ngân sách bị **cắt** xuống 200 ms (`BR-AI-09`) |
| 7 | Đồng hồ máy về 0 | Máy **thua do hết giờ** — ưu tiên hơn lỗi máy |
| 8 | Người chơi tải lại trang | Ván **vẫn còn**, chơi tiếp được |
| 9 | Người chơi ngoại tuyến 70 giây | Xét `BR-AI-11`: đồng hồ người chơi còn 20 giây ⇒ `TIMEOUT` tại giây 20; còn hơn 60 giây hoặc không giới hạn ⇒ `INTERRUPTED` tại giây 60 nếu chưa có kết quả |
| 10 | Người chơi mở 2 tab | **Cả hai đồng bộ và thao tác được** (`DEC-020`) |
| 11 | Người chơi treo máy không đi nước | **Không có** luật treo ván cho ván máy (`BR-AI-12`) |
| 12 | Lặp lại thế cờ 3 lần khi chơi với máy | **Hoà**, giống ván online |
| 13 | Cố tạo ván máy thứ hai | Từ chối (`BR-AI-15`) |
| 14 | Cố tạo phòng online khi đang có ván máy | Từ chối |
| 15 | Hệ thống quá tải | Từ chối ván **mới**; ván đang chạy **không bị ảnh hưởng** |
| 16 | Máy tính ở cấp Khó | **Không** làm nghẽn ván của người khác (`BR-AI-19`) |

---

## 16. ACCEPTANCE CRITERIA

| ID | Tiêu chí |
|---|---|
| **AC-AI-01** | Chọn được cả 3 cấp, cả 2 bên, cả 4 cấu hình thời gian |
| **AC-AI-02** | Người chơi cầm **đen** ⇒ máy **đi trước** |
| **AC-AI-03** | Máy đi **nước hợp lệ** ở mọi thế cờ trong bộ thử |
| **AC-AI-04** | Máy đạt p95 hoàn thành độ sâu mục tiêu **≤ 300/1000/3000 ms** tương ứng 2/4/6, **20 thế × 5 lần mỗi cấp**, không cộng biên độ; phép đo chuẩn ở [ai-validation](../09-technical/ai-validation.md) (DEC-045) |
| **AC-AI-05** | Ngân sách **không vượt** thời gian còn lại của máy |
| **AC-AI-06** | Đi lại **huỷ** việc đang tính; kết quả muộn bị **bỏ** |
| **AC-AI-07** | Máy lỗi/treo ⇒ ván **gián đoạn**, người chơi **không thua** |
| **AC-AI-08** | Ngoại tuyến đủ 60 giây ⇒ **gián đoạn** chỉ khi chưa có kết quả sớm hơn; còn 20 giây ⇒ thua `TIMEOUT` tại giây 20; hết giờ đúng giây 60 ⇒ `TIMEOUT` ưu tiên |
| **AC-AI-09** | Ván máy **không có** phòng, người xem, chat, media |
| **AC-AI-10** | Luật treo ván **không** áp dụng cho ván máy |
| **AC-AI-11** | Máy **không có** nút xin hoà; hoà chỉ theo luật lặp |
| **AC-AI-12** | Trạng thái **xếp hàng** và **đang suy nghĩ** hiện **khác nhau** |
| **AC-AI-13** | Tính toán cấp Khó **không** làm nghẽn phục vụ các ván khác |
| **AC-AI-14** | **So sánh cơ sở và cắt tỉa**: cùng điểm và tập nước tốt; cắt tỉa **không nhiều nút hơn**, **giảm tổng nút** trên toàn tập |
| **AC-AI-15** | Bộ **20 thế cờ** có đáp án review tay độc lập, đóng băng trước đo; HARD đúng **≥16/20**, cả **5/5** thế tránh lặp đúng, theo [ai-validation](../09-technical/ai-validation.md) (DEC-045) |
| **AC-AI-16** | **60 ván** đối kháng: cấp cao đạt **trên 50%** điểm trước cấp thấp |
| **AC-AI-17** | Báo cáo đủ **seed / nút / độ sâu / điểm / môi trường**, **tái lập được** |
| **AC-AI-18** | Máy đi nước không hợp lệ hoặc treo ⇒ **lần chạy hỏng**, không tính thành thắng |
| **AC-AI-19** | Giao diện **không lộ** điểm đánh giá hay đường tính của máy khi đang chơi |

---

## 17. DEPENDENCY

[../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) — dùng **cùng** bộ luật · [REQ-MATCH](REQ-MATCH.md) · [REQ-CLOCK](REQ-CLOCK.md) · [REQ-GAME-ACTIONS](REQ-GAME-ACTIONS.md) · [REQ-BOARD](REQ-BOARD.md) · [REQ-LOBBY](REQ-LOBBY.md)

## 18. OPEN QUESTIONS

**Không còn.**
