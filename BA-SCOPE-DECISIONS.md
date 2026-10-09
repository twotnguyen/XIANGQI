# BIÊN BẢN CHỐT YÊU CẦU NGHIỆP VỤ & PHẠM VI SẢN PHẨM (BA SCOPE FREEZE)

> **Dự án:** Cờ Tướng Online (XIANGQI)  
> **Đại diện Product Owner:** Twot  
> **Đại diện Phân tích Nghiệp vụ (BA):** Hermes Agent  
> **Cập nhật lần cuối:** 09/10/2026 (lập lại kế hoạch từ 09/10 theo yêu cầu PO; giữ quyết định sản phẩm 07–08/10. PO chốt sau review BA: lịch đến 05/11, Khách và Xin đổi bên lên P1, quy tắc đăng nhập, Sảnh PUBLIC có "Vào chơi", luật sau ván, SMTP ngoài. Xem **Phần 0**)

Tài liệu này ghi nhận chính thức các quyết định điều chỉnh, bổ sung hoặc giữ nguyên tính năng sau quá trình rà soát giữa BA và Product Owner nhằm chốt cứng phạm vi triển khai (Scope Freeze).

> **Ưu tiên hiện tại — PO chốt lại 05/10/2026:** tập trung đúng tám yêu cầu MVP ở Phần 11. Phòng tự tạo có `PUBLIC` (hiện ở Sảnh để vào xem), `CODE_ONLY` (vào qua mã/link, không hiện ở Sảnh) và `LOCKED` (chặn người mới), tối đa **năm người xem**. PO đính chính giới hạn về năm người xem, tối đa bảy người/phòng; giữ danh sách công khai đã chốt. Ghép ngẫu nhiên, Đánh Hạng, Tái đấu, Quên mật khẩu và các mở rộng giữ P2; câu trả lời P2 được ghi nhận nhưng không đưa vào MVP.

> **Ghi chú rà soát 03/10/2026.** Product Owner uỷ quyền cho agent tự xử lý mâu thuẫn và chỗ mơ hồ của Giai đoạn 1. Các quyết định thêm hoặc sửa trong đợt này đã được Product Owner **duyệt toàn bộ ngày 03/10/2026** (gồm nhóm 1–8 và loạt trả lời nhóm B). Riêng các con số tạm (120 nửa nước không ăn quân, luật đuổi quân liên tục, quy mô 50 người dùng đồng thời) được xác nhận lại ở Giai đoạn 2.
>
> **Tài liệu chi tiết (cập nhật 07/10/2026):** thư mục `docs/` cũ đã bị xoá ngày 07/10/2026 (commit `c4cf29d`, chỉ còn trong lịch sử git). User Story, tiêu chí nghiệm thu (AC), ca kiểm thử (TC), NFR và cổng kiểm chứng của P1 nay nằm ở [BACKLOG-P1.md](BACKLOG-P1.md). Thứ tự ưu tiên khi mâu thuẫn: **Phần 0 của tài liệu này → phần còn lại của tài liệu này → BACKLOG-P1.md → DANH-MUC → DESIGN → mockup**; phát hiện mâu thuẫn phải báo PO.
>
> **Bổ sung 04/10/2026:** hoàn thiện chi tiết cả P1 và P2, giữ nguyên thứ tự ưu tiên. BA là nguồn luật duy nhất; `IDEA.md` chỉ giới thiệu sản phẩm. Không sửa Jira, kế hoạch hiện có hoặc mockup trong đợt này; mockup chỉ tham khảo khi khác đặc tả. Hoàn thiện đặc tả không có nghĩa khả thi kỹ thuật đã được kiểm chứng hay cam kết hoàn thành toàn bộ P1 trong hạn.
>
> **Hai quy ước đọc tài liệu:**
> 1. Các mã như `R06`, `R17`, `DEC-019`, `ARCH-04`, `GR-END-01`, `EC-0x`, `DT-21`… là **nhãn kế thừa** từ bộ tài liệu cũ đã xoá. Chúng không còn là nguồn tra cứu; luật tương ứng đã được viết đầy đủ bằng chữ trong chính mục chứa nhãn.
> 2. Tên công nghệ, tên bảng, tên trường dữ liệu (Socket.IO, LiveKit, Supabase, `room_blocks`, `commandId`…) chỉ là **minh hoạ kế thừa** trong phần mô tả nghiệp vụ. Danh sách công nghệ đã được PO xác nhận 03/10/2026 (README mục Công nghệ); thiết kế dữ liệu/API cụ thể do nhóm chốt khi làm Task.

---

## PHẦN 0: QUYẾT ĐỊNH CHỐT 07/10/2026 — ƯU TIÊN CAO NHẤT

> Product Owner (Twot) duyệt ngày 07/10/2026 (mục 0.1–0.11) và 08/10/2026 (mục 0.12–0.16) sau đợt review BA (Q1–Q10, F1–F5 và câu hỏi bổ sung về đổi bên/đấu lại). Khi phần nào khác trong tài liệu, nhật ký cũ, DANH-MUC, README hoặc mockup mâu thuẫn với Phần 0 thì **Phần 0 thắng**. Các mục bị ảnh hưởng đã được sửa trực tiếp và gắn nhãn **(07/10)**.

### 0.1 Lịch, nguồn lực và Jira
* **Lập lại kế hoạch — PO yêu cầu 09/10/2026:** chưa có tiến độ triển khai; kế hoạch mới bắt đầu **09/10/2026**, không ghi nhận công việc triển khai đã hoàn thành trong 07–08/10. Giữ hạn demo **05/11/2026** và **9 Epic / 27 Story / 71 Task**. Mọi Epic/Story trong kế hoạch mới bắt đầu **09/10**; mốc này thay mốc 07/10 của R1, các quy tắc R1 còn lại giữ nguyên. Ngày **09/10 chỉ dành cho BA/lập kế hoạch**, không tính một ngày phát triển đủ 8 giờ; ngày phát triển đầy đủ đầu tiên là **10/10**. Lịch từng Task theo [KE-HOACH-JIRA.md](KE-HOACH-JIRA.md). Ba điểm review nghiệp vụ đã được PO duyệt riêng tại mục 0.17.
* **Hạn cuối: 05/11/2026** (nộp + demo). Thay toàn bộ lịch cũ (hạn 17–18/10, 4 Sprint 04/10–17/10) ở Quyết định 10.1 và README.
* **Sprint hiện hành (lập lại 09/10):** **S1 10–16/10 · S2 17–23/10 · S3 24–30/10 · S4 31/10–04/11** · 05/11 nộp và demo. Ngày 09/10 là BA/lập kế hoạch, không tạo Sprint riêng; làm cả cuối tuần. Lịch này thay lịch bắt đầu 08/10 trước đó.
* **Công suất lập kế hoạch:** 8 giờ/người/ngày; phần 8 → 12 giờ là **dự phòng**, không đưa vào kế hoạch gốc.
* **Nhóm 7 người:**

| Thành viên | Chuyên môn chính | Ghi chú phân vai |
|---|---|---|
| Tình (Twot) | Full-stack (FE, BE, DevOps, AI) | Scrum Master + PO; nhận **toàn bộ phần khó và quan trọng**, là người làm nhiều việc nhất, tính 100% công suất cho việc kỹ thuật (PO quyết định, không giảm trừ cho vai trò SM) |
| Đông | Backend | |
| Tùng | Backend | |
| Cường | Backend | |
| Nhạn | Frontend | Có thể kiêm Tester khi khối lượng kiểm thử lớn |
| Kỳ | Frontend | Có thể kiêm Tester khi khối lượng kiểm thử lớn |
| Thư | Tester | Phụ trách kiểm thử chính |

* **Nguyên tắc phân công:** phần còn lại chia đều, đúng chuyên môn; 1–2 người được kiêm thêm vai trò khi một mảng quá tải (ví dụ Kỳ hoặc Nhạn kiểm thử cùng Thư). Bảng phân công chi tiết nằm trong kế hoạch Jira.
* **Jira XIAN:** xoá 98 mục cũ, **lập lại từ đầu** theo [BACKLOG-P1.md](BACKLOG-P1.md). **Jira chỉ chứa việc phát triển** (gồm cả kiểm thử, cấu hình, triển khai); không đưa hoạt động quản lý dự án (họp, báo cáo) vào Jira. P1 chi tiết tới Story/Task; P2 chỉ ở mức Epic. **Cấu trúc chốt 07/10:** 9 Epic (EP-01 → EP-08 khớp 8 yêu cầu khách hàng, EP-00 nền tảng), 27 Story; Epic và Story là phần việc BA, xong khi đặc tả được PO duyệt — theo hướng dẫn của giảng viên, Epic/Story có thể xong trước các Task bên trong, chậm nhất ở Task cuối cùng. **Quy tắc R1:** mọi Epic/Story bắt đầu 09/10 (thay mốc 07/10 theo yêu cầu lập lại kế hoạch); Story xong trước khi Task đầu tiên của nó bắt đầu, ngoại lệ US-08.3 (GATE-ENGINE) và US-00.5 (GATE-REALTIME) đóng hồ sơ bằng chứng ở Task cuối; các ngưỡng AC vẫn được duyệt trước thi công, không chờ số đo để hạ tiêu chuẩn; Epic xong theo Story muộn nhất; Epic/Story không đặt vào Sprint, nhập Jira ở trạng thái To Do; Task là loại Task thường (cha là Epic, liên kết tới Story) có Sprint, người làm và hạn riêng; mỗi người một Task tại một thời điểm, Task phụ thuộc chỉ bắt đầu khi Task trước xong, hạn chế tối đa số Task chạy song song (tối đa 7, mỗi Task một người). Kế hoạch: [KE-HOACH-JIRA.md](KE-HOACH-JIRA.md).

### 0.2 Đăng nhập và đăng ký (P1)
* **Ba cách vào ứng dụng ở `SCR-LOGIN`:** (1) Username + Mật khẩu; (2) Đăng nhập bằng Google; (3) **Khách** (xem 0.3).
* **Hai cách đăng ký:** (a) Username + Mật khẩu → Email → OTP email (1.1); (b) Google → đặt Username + Mật khẩu ở `SCR-ONBOARDING`, **không OTP** (1.2). Sau khi đăng ký, người dùng đăng nhập bằng Username + Mật khẩu **hoặc** bấm Đăng nhập bằng Google (tài khoản Google đã đăng ký).
* **Đăng nhập Username + Mật khẩu:** chỉ dùng username (không dùng email làm tên đăng nhập), **không phân biệt hoa thường**. Sai username hoặc mật khẩu luôn báo một câu chung: *"Sai tên đăng nhập hoặc mật khẩu"*.
* **Khoá thử sai:** đếm theo username đã chuẩn hoá chữ thường, **kể cả username không tồn tại**. Sai **5 lần trong 15 phút** → chặn đăng nhập bằng mật khẩu cho username đó **15 phút** tính từ lần sai thứ 5. Trong thời gian chặn, mọi lần thử (kể cả đúng mật khẩu) đều báo: *"Bạn đã thử quá nhiều lần, vui lòng thử lại sau 15 phút"*. Đăng nhập thành công đặt lại bộ đếm. Đăng nhập Google **không** tính vào và không bị chặn bởi bộ đếm này.

### 0.3 Chế độ Khách lên P1
* Khách thuộc **P1**, áp dụng **đúng Quyết định 1.3** cho các tính năng có ở P1: nhập tên tạm qua `MODAL-GUEST-NAME` (2–20 ký tự, qua bộ lọc từ cấm), phiên tối đa 12 giờ (không hết khi đang ngồi ghế/trong ván), nhãn **"(Khách)"** cạnh tên, tối đa **1 phòng đang mở** do mình tạo.
* **Khách được:** tạo phòng; vào phòng bằng mã/link; "Vào chơi"/"Vào xem" từ Sảnh; ngồi ghế đánh online; làm người xem; đánh với máy (không lưu); chat theo vai trò; bật camera/mic khi ngồi ghế.
* **Khách không được:** kết bạn, nhận/gửi lời mời bạn bè (vẫn chia sẻ được link/mã), mở `SCR-FRIENDS`, đổi hồ sơ (`SCR-PROFILE-SETTINGS` chỉ có Đăng xuất), các tính năng P2 (Đánh Hạng…).
* **Link mời khi chưa đăng nhập (2.4):** người dùng có thể chọn Đăng nhập, Đăng ký hoặc **Khách**; xong thì tự vào đúng phòng.
* Giới hạn đã chấp nhận (4.2): người bị đuổi có thể quay lại bằng phiên Khách mới nếu phòng chưa `LOCKED`.

### 0.4 Gửi email OTP qua SMTP ngoài
* Thay quyết định "SMTP mặc định của Supabase" ở 10.1. Lý do: dịch vụ mặc định **chỉ gửi tới địa chỉ đã cấp phép trước (thành viên team Supabase)**, hạn mức **2 thư/giờ**, không cam kết giao thư → người ngoài nhóm (giảng viên, "khách hàng") không đăng ký được.
* Gắn một dịch vụ SMTP có gói miễn phí vào **Custom SMTP** của Supabase Auth. Tiêu chí chọn: gửi được tới Gmail bất kỳ; không bắt buộc tên miền riêng; hạn mức miễn phí đủ cho phát triển và demo. Nhà cung cấp cụ thể chốt trong Task cấu hình (kiểm tra hạn mức tại thời điểm làm). Điều chỉnh giới hạn tốc độ gửi email của Supabase Auth cho phù hợp.

### 0.5 Danh sách phòng PUBLIC tại Sảnh
* **Cột hiển thị:** Tên phòng · Host (Display Name, kèm "(Khách)" nếu là Khách) · Mức giờ · Trạng thái (*Đang chờ* / *Đang đấu*) · Người xem **x/N** (N = trần đã chọn; phòng "Không có người xem" hiện *"Không cho xem"*).
* **Nút:** còn ghế trống → **"Vào chơi"** (vào ghế trống) và **"Vào xem"** (nếu còn chỗ xem); đủ hai ghế → chỉ **"Vào xem"**; hết chỗ xem hoặc N = 0 → không có nút Vào xem.
* **Sắp xếp:** phòng mới mở PUBLIC gần nhất lên đầu. **Cập nhật realtime** (thêm, bớt, đổi trạng thái/số người không cần tải lại). P1 hiển thị tối đa 50 phòng.
* **Kiểm tra tại máy chủ khi bấm:** "Vào chơi" mà ghế vừa có người → nếu còn chỗ xem thì vào làm Người xem kèm thông báo *"Ghế vừa có người, bạn đang xem trận"* (giống 2.6), hết chỗ thì báo phòng đầy. Phòng vừa chuyển khỏi PUBLIC → từ chối và làm mới danh sách.
* `CODE_ONLY`/`LOCKED` không hiện. Thay câu "Vào xem từ Sảnh luôn là Người xem, không vào ghế" ở 2.3/2.8 bằng: **"Vào xem" luôn là Người xem; "Vào chơi" vào ghế trống**.

### 0.6 Xin đổi bên lên P1 (phòng tự tạo)
* Khi phòng ở `WAITING` và **đủ hai người ngồi ghế** — ngay khi người thứ hai vừa vào hoặc sau một ván — cả hai đều có nút **"Xin đổi bên"**.
* Người nhận thấy `MODAL-SIDE-SWAP-PROMPT` (30 giây) với **Đồng ý / Từ chối**. Đồng ý → hoán đổi Đỏ ↔ Đen, **Sẵn sàng của cả hai reset về chưa sẵn sàng**. Từ chối/hết hạn → người gửi chờ **60 giây** mới gửi lại; mỗi người tối đa 1 đề nghị đang chờ, được Rút (3.6).
* Không có nút khi đang đếm 3‑2‑1 hoặc khi ván đang diễn ra. Đề nghị đang chờ tự huỷ khi bắt đầu đếm ngược hoặc khi thành phần ghế thay đổi.
* **Một người ngồi ghế (PO bổ sung 07/10):** khi phòng chỉ có **một người ngồi ghế** (Host), người đó bấm **"Đổi ghế"** để chuyển Đỏ ↔ Đen **tùy thích, không cần ai duyệt** (2.3 mục 1). Ngay khi người thứ hai ngồi vào ghế còn lại, nút "Đổi ghế" biến mất và **bắt buộc dùng "Xin đổi bên"**. Nếu người thứ hai rời ghế và chỉ còn một người ngồi ghế, nút "Đổi ghế" tự do xuất hiện lại. Ghép ngẫu nhiên và Đánh Hạng (P2) không có Xin đổi bên vì không có phòng chờ; dùng lựa chọn phe khi Tái đấu (0.8).

### 0.7 Sau ván trong phòng tự tạo (P1)
1. Ván kết thúc → `MODAL-MATCH-RESULT` với hai nút **"Ở lại phòng"** và **"Rời phòng"**.
2. Ngay khi ván kết thúc, phòng chuyển về **`WAITING`**; Sẵn sàng của cả hai = chưa sẵn sàng. Hộp kết quả chỉ là lớp hiển thị.
3. **Giữ nguyên:** ghế Đỏ/Đen của ván trước, người xem, chế độ PUBLIC/CODE_ONLY/LOCKED, mức giờ (đồng hồ đặt lại đủ cho ván mới), Host, Kênh Riêng (cùng cặp) và Kênh Chung.
4. Muốn đổi phe → **Xin đổi bên** (0.6). Hai người bấm Sẵn sàng → đếm 3‑2‑1 → ván mới, Match ID mới.
5. Một người chơi rời → ghế trống, phòng vẫn `WAITING`, quyền Host chuyển cho người còn lại nếu cần; phòng `LOCKED` vẫn giữ khoá (2.8 mục 6). Người mới vào theo 2.8 và 0.5.
6. **Phòng tự tạo không còn hạn đóng 10 phút sau ván.** Phòng chỉ đóng khi không còn người ngồi ghế; người xem còn lại được đưa về Sảnh kèm thông báo *"Phòng đã đóng"*. Mất kết nối ở `WAITING` giữ ghế 60 giây (8.3).
7. Thay 2.3 mục 8 và phần "giữ FINISHED tối đa 10 phút" của 3.3 mục 7 đối với phòng tự tạo.

### 0.8 Tái đấu có chọn phe (P2 — ghi nhận để không phải hỏi lại)
* **Phòng tự tạo:** thêm nút **Tái đấu** trong `MODAL-MATCH-RESULT`. Người đề nghị chọn **"Giữ phe"** hoặc **"Đổi phe"** (mặc định *Đổi phe*). Người nhận thấy rõ lựa chọn, Đồng ý/Từ chối trong 30 giây. Đồng ý → đếm 3 giây, vào ván mới **không cần Sẵn sàng**. Không dùng Tái đấu thì vẫn theo 0.7 (Sẵn sàng + Xin đổi bên).
* **Đánh Thường ghép ngẫu nhiên:** cùng cơ chế chọn Giữ phe/Đổi phe; mỗi bên đặt lại 15 phút; các luật `FINISHED` khác giữ theo 2.0 (không về `WAITING`, không nhận người mới, đóng khi cả hai rời hoặc sau 10 phút).
* **Đánh Hạng:** không có Tái đấu (7.2).
* Hai đề nghị Tái đấu gửi gần như cùng lúc: máy chủ giữ đề nghị đến trước, đề nghị sau bị huỷ và người gửi sau thấy đề nghị của đối thủ.
* Thay câu "tự động hoán đổi bên" ở 2.0, 2.3 mục 7 và 3.3 mục 7.

### 0.9 Đánh với máy — Ván mới (P1)
* Hộp kết quả ván AI có **"Ván mới"** và **"Về Sảnh"**. "Ván mới" mở `MODAL-AI-SETUP` **điền sẵn cấp độ và lựa chọn phe của ván vừa rồi**; người chơi đổi phe (Đỏ/Đen/Ngẫu nhiên) hoặc cấp độ rồi bấm Bắt đầu. Ván cũ đã kết thúc, ván mới có ID mới.
* Áp dụng cả khi ván kết thúc do Đầu hàng. Ván "Bỏ dở" do sự cố vẫn theo nút *Thử lại* ở 6.1.

### 0.10 Phòng chỉ có Host ngồi chờ
* **Không giới hạn thời gian chờ.** Phòng chỉ đóng theo 2.3 mục 4 (Host rời khi không còn người chơi khác) hoặc Host mất kết nối quá 60 giây (mất ghế → không còn người ngồi ghế → đóng theo 0.7 mục 6).

### 0.11 Hệ quả phân kỳ
* **Lên P1:** Chế độ Khách (1.3, `MODAL-GUEST-NAME`), Xin đổi bên trong phòng tự tạo (`MODAL-SIDE-SWAP-PROMPT`), khoá thử sai đăng nhập, SMTP ngoài, nút "Vào chơi" ở Sảnh, "Ván mới" ở ván AI, "Ở lại phòng" ở hộp kết quả.
* **Thành phần giao diện:** P1 = **26**, P2 = **11** (tổng 37 không đổi).
* **Vẫn P2:** Đánh Hạng, ghép ngẫu nhiên, Tái đấu, Xin đi lại, Quên mật khẩu/khôi phục Username, đổi Username, chat 1-1, Thách đấu, sticker, QR, Lịch sử/Replay/FEN/PGN, mức giờ Không giới hạn + chống treo ván, widget AI, công cụ demo, `MODAL-MEDIA-TAB-SWITCH`, giao diện Giấy Sáng/Theo hệ thống.

### 0.12 Lặp thế và chu kỳ lặp (PO chốt 08/10)
* **Hai thế cờ giống nhau** khi vị trí của mọi quân giống hệt **và** cùng một bên tới lượt đi.
* Chỉ đếm trên **nhánh nước hiệu lực** (nước đã bị đi lại ở P2 không tính).
* Khi một thế xuất hiện **lần thứ 3**: **chu kỳ** = mọi nước từ lần xuất hiện thứ 1 đến lần thứ 3 của thế đó. Bên nào có **mọi** nước của mình trong chu kỳ là nước chiếu thì là chiếu liên tục → bên đó thua (`PERPETUAL_CHECK`); cả hai bên cùng chiếu liên tục → hoà; còn lại → hoà `DRAW_REPETITION`. Chiếu hết luôn được ưu tiên hơn mọi kết quả hoà.
* Thay câu "Giai đoạn 2 chốt chu kỳ lặp" ở 3.5.

### 0.13 Chat và camera/mic ở phòng chờ (PO chốt 08/10)
* Phòng chờ có **hai kênh chat theo vai trò** như trong ván: người chơi có Kênh Riêng và Kênh Chung, người xem chỉ có Kênh Chung. Tin nhắn giữ nguyên khi chuyển từ phòng chờ sang ván và ngược lại (vẫn theo luật mốc cặp người chơi ở 5.3).
* **Camera/mic bật được ngay trong phòng chờ**, cùng luật như trong ván: mặc định tắt, bật/tắt độc lập, ba mức chia sẻ (chọn sẵn Chỉ đối thủ), người xem chỉ nhận. Khi bắt đầu ván, hình và tiếng **không bị ngắt**.

### 0.14 Lỗi camera/mic hoặc hết hạn mức dịch vụ media (PO chốt 08/10)
* Ván và chat **tiếp tục bình thường**; khung media hiện *"Camera/mic tạm thời không dùng được"*; không xử ai thua, không dừng đồng hồ.

### 0.15 Khoá thử sai và đăng nhập Google (PO chốt 08/10)
* Đăng nhập Google thành công **không** xoá bộ đếm sai mật khẩu. Bộ đếm chỉ áp cho đăng nhập bằng mật khẩu và tự hết sau 15 phút; chỉ đăng nhập **bằng mật khẩu** đúng mới đặt lại bộ đếm.

### 0.16 Hạ tầng camera/mic (PO chốt 08/10)
* Dùng **LiveKit mã nguồn mở tự chạy** (Docker) khi dev và khi demo trên cùng mạng LAN: miễn phí, không giới hạn phút.
* Dùng **LiveKit Cloud gói miễn phí** (5.000 phút người tham gia/tháng) khi cần demo qua Internet hoặc làm dự phòng; web + máy chủ ứng dụng khi đó chạy trên Render.
* **Không chạy LiveKit trên Render**: LiveKit cần cổng UDP (50000–60000 hoặc 7882) và TCP 7881, Render chỉ mở một cổng HTTP/HTTPS.
* Code không đổi giữa các môi trường; chỉ đổi `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`.
* Demo LAN phải chạy web qua **HTTPS** (ví dụ chứng chỉ nội bộ mkcert) vì trình duyệt chỉ cho bật camera/mic trên HTTPS hoặc `localhost`.
* Thay quyết định "LiveKit Cloud, không tự dựng LiveKit" ở 10.1. Kiểm chứng ở GATE-MEDIA (Sprint 1).

### 0.17 Ba điểm review đã chốt — PO duyệt 09/10/2026

1. **Username và từ cấm:** từ chối username chứa từ cấm ngay tại bước nhập username trong đăng ký thường và Google onboarding, dùng bộ lọc 5.3; máy chủ kiểm lại trước khi hoàn tất. Giữ `display_name = username`, không tự sinh tên thay thế.
2. **Ưu tiên kết quả:** chiếu hết vẫn ưu tiên cao nhất khi xét kết quả từ một nước hợp lệ. Nếu cùng nước chạm 120 nửa nước không ăn quân, kết quả thắng/thua do hết nước đi (`STALEMATE`) hoặc chiếu liên tục (`PERPETUAL_CHECK`) được ưu tiên trước hoà `DRAW_NO_CAPTURE`. Giữ nguyên định nghĩa lặp thế và các ngưỡng đã duyệt; đồng hồ vẫn được kiểm trước khi duyệt nước đi theo 3.3.
3. **Server khởi động lại:** ván online đang chạy kết thúc `INTERRUPTED`, không có người thắng/thua/hoà. Với **phòng tự tạo**, phòng về `WAITING`, Sẵn sàng reset, hiện **Ở lại phòng / Rời phòng**, không hạn đóng 10 phút; áp dụng vòng đời 0.7. Phòng ghép ngẫu nhiên và Ranked (P2) vẫn theo luật `FINISHED` riêng của từng chế độ. Ván AI P1 vẫn theo 6.3: không còn trạng thái sau restart, không tự khôi phục.

Ba câu hỏi của lượt review đã được giải quyết; không còn điều kiện chờ PO cho ba điểm này. Đồng bộ vào AC/TC và Task hiện có, giữ **9 Epic / 27 Story / 71 Task**.

---

## PHẦN 1: TÀI KHOẢN & ĐĂNG NHẬP (Yêu cầu 1)

### Quyết định 1.1: Luồng Đăng ký tài khoản hệ thống (Wizard 3 bước: Username+Mật khẩu $\rightarrow$ Email $\rightarrow$ OTP xác minh)
* **Lựa chọn đã chốt:** **[REG-FLOW] Đăng ký theo quy trình phân bước trực quan kèm xác minh OTP Email**
* **Mô tả nghiệp vụ:**
  * Tại màn hình Đăng ký (`SCR-REGISTER`), giao diện hiển thị 2 khung nhập liệu ban đầu:
    * `Username:` (Tên đăng nhập: duy nhất toàn hệ thống, 3–20 ký tự, viết liền không dấu `^[a-zA-Z0-9_]{3,20}$`).
    * `Mật khẩu:` (Tối thiểu 8 ký tự, có ô xác nhận lại mật khẩu).
  * **Quy trình 3 bước hoàn tất đăng ký:**
    1. **Bước 1 (Nhập Username & Mật khẩu):** Người dùng điền đầy đủ và bấm nút **"Xác nhận / Tiếp tục"**. Hệ thống kiểm tra tính duy nhất (UNIQUE) của `username` và từ chối tên chứa từ cấm ngay ở bước này (0.17, PO duyệt 09/10).
    2. **Bước 2 (Nhập Email):** Giao diện chuyển tiếp mượt mà sang khung nhập `Email:`. Người dùng điền địa chỉ email chính chủ và bấm **"Xác nhận Email"**.
    3. **Bước 3 (Xác thực Email qua mã OTP):** Hệ thống kích hoạt Supabase Auth gửi mã OTP 6 chữ số đến địa chỉ email vừa nhập, đồng thời hiển thị khung nhập mã OTP. Người dùng kiểm tra hòm thư (check mail), lấy mã và nhập vào hệ thống để xác nhận email vừa nhập là chính xác và đang hoạt động. Xác thực OTP thành công $\rightarrow$ Tài khoản chuyển sang trạng thái `ACTIVE`, tự động đăng nhập và đưa vào sảnh chính.
  * **Thời điểm tạo tài khoản:** Tài khoản **dùng được** (có hồ sơ và đăng nhập được) chỉ có **sau khi OTP xác thực thành công và hoàn tất bước cuối**. Trước đó người dùng chưa có hồ sơ và không đăng nhập được; **hệ thống xác thực (Supabase) có thể giữ tạm một bản ghi xác thực chưa xác nhận** (Product Owner chọn Phương án B ngày 03/10/2026), được dọn sau khoảng 1 giờ (tối đa khoảng 65 phút) để email không bị kẹt; username **không bị giữ chỗ** khi người dùng bỏ dở giữa chừng (đóng tab, hết hạn OTP). Máy chủ kiểm tra lại tính duy nhất của `username` và `email` ở bước cuối; nếu username đã bị người khác lấy trong lúc chờ thì báo lỗi và quay về Bước 1.
  * **Phục hồi đăng ký (duyệt 04/10):** Nếu đã ghi `profiles.completed_at` nhưng còn cờ `PENDING`, tác vụ phục hồi hoàn tất xoá cờ, **không xoá tài khoản đã ghi hoàn tất**; trước khi phục hồi xong vẫn chặn sử dụng. Nếu chưa có `completed_at`, tiếp tục chặn và dọn theo thời hạn hiện có. Đăng ký, phục hồi và dọn cùng danh tính phải tuần tự hoá để tránh xoá nhầm.
  * **Email đã tồn tại:** Ở Bước 2, nếu email đã có tài khoản thì hiển thị ⚠️ *"Email này đã được đăng ký"* (cùng thông báo với luồng Google) và không gửi OTP.

---

### Quyết định 1.2: Đăng ký qua Google OAuth & Thiết lập kép Username + Password (Không cần OTP)
* **Lựa chọn đã chốt:** **[REG-GOOGLE] Nút Google OAuth nằm ngay dưới khung đăng ký; thiết lập Username+Password để đăng nhập kép; miễn xác thực OTP**
* **Mô tả nghiệp vụ:**
  * Ngay bên dưới khung đăng ký bằng `Username / Mật khẩu`, hệ thống bố trí nút bấm nổi bật: **"Đăng ký bằng Google" (Google OAuth)**.
  * **Quy trình đăng ký 1 chạm:**
    1. Người dùng bấm nút và chọn tài khoản Gmail đã có sẵn trên thiết bị/trình duyệt của mình.
    2. Sau khi xác thực danh tính với Google thành công, giao diện chuyển tiếp ngay sang màn hình nhập:
       * `Username:` (Tên tài khoản duy nhất, 3–20 ký tự; từ chối từ cấm ngay tại bước nhập này theo 0.17).
       * `Mật khẩu:` (Mật khẩu cá nhân, tối thiểu 8 ký tự).
    3. **Miễn xác thực Email bằng OTP:** Do địa chỉ email đã được Google xác thực an toàn tuyệt đối, hệ thống **không yêu cầu nhập mã OTP email** trong luồng này.
    4. Người dùng xác nhận $\rightarrow$ Hoàn tất tạo tài khoản thành công.
  * **Mục đích:** Thiết lập sẵn cả 2 phương thức đăng nhập độc lập (người dùng có thể đăng nhập bằng Google OAuth hoặc đăng nhập bằng `Username + Mật khẩu` ở các lần sau nếu không muốn dùng Google).
  * **Quy tắc kiểm tra trùng Email khi Đăng ký Google OA:**
    * Nếu tài khoản Gmail người dùng vừa chọn **ĐÃ ĐƯỢC ĐĂNG KÝ TRƯỚC ĐÓ** trên hệ thống $\rightarrow$ Hệ thống hiển thị thông báo lỗi rõ ràng: ⚠️ *"Email này đã được đăng ký"*. (Người dùng muốn đăng nhập thì quay về màn hình Đăng nhập để đăng nhập).
  * **Bỏ dở giữa chừng (PO duyệt 05/10/2026, phương án A):** Tài khoản ứng dụng chỉ được hoàn tất khi người dùng bấm **"Hoàn tất thiết lập"** ở `SCR-ONBOARDING`; trước đó có thể tồn tại bản xác thực Google tạm nhưng không được dùng ứng dụng. Màn hình `/onboarding` không đóng tuỳ ý được (không có nút X).
  * **Dọn bản Google tạm:** Sau **60 phút chưa hoàn tất**, dọn bản Google mới chưa hoàn tất; kiểm tra mỗi **5 phút khi dịch vụ hoạt động**, tương tự đăng ký email. Không xoá tài khoản đã hoàn tất hoặc tài khoản cũ; kiểm lại trạng thái hoàn tất trước khi dọn để không xoá nhầm khi người dùng vừa hoàn tất thiết lập. Quyết định này không thay đổi luật không tự liên kết email trùng.
  * **Không tự liên kết tài khoản:** Hệ thống **không** tự gộp tài khoản Google với tài khoản Username + Mật khẩu đã có cùng email; trường hợp đó luôn báo "Email này đã được đăng ký". Mọi tài khoản (kể cả tạo bằng Google) đều có mật khẩu, nên luồng Quên mật khẩu (`Quyết định 1.7`) dùng được cho mọi tài khoản.
  * **Đăng nhập Google với email chưa đăng ký (đã duyệt 03/10):** Bấm "Đăng nhập bằng Google" bằng email chưa có tài khoản thì chuyển sang màn hình thiết lập Username + Mật khẩu như luồng đăng ký Google (không báo lỗi).

---

### Quyết định 1.3: Chế độ Khách (Guest Mode) & Cơ chế Nâng cấp tài khoản
* **Phân kỳ (07/10):** Khách thuộc **P1** theo Phần 0 mục 0.3.
* **Lựa chọn đã chốt:** **[GUEST-FLOW] Nút "Guest" riêng biệt tại màn hình Đăng nhập kèm cảnh báo cấm Ranked; Nâng cấp bằng cách Đăng xuất**
* **Mô tả nghiệp vụ:**
  * Tại màn hình Đăng nhập (`SCR-LOGIN`), hệ thống bố trí một nút riêng biệt nổi bật: **"Guest"** (hoặc *"Chơi nhanh với tư cách Khách"*).
  * **Hiển thị ghi chú trực quan (Visual Note):** Ngay dưới nút "Guest", hiển thị dòng chữ cảnh báo rõ ràng:
    > ⚠️ *"Lưu ý: Chế độ Khách (Guest) không được tham gia đánh Xếp hạng để tính điểm Elo và không lưu lịch sử ván cờ."*
  * **Quyền hạn của Khách:** Bấm nút $\rightarrow$ Chỉ cần nhập Tên hiển thị tạm thời (2–20 ký tự) là vào chơi phòng cờ thường (Casual), đánh với AI hoặc làm người xem theo dõi cờ ngay lập tức mà không cần tạo tài khoản.
  * **Cơ chế Nâng cấp lên tài khoản chính thức:** Khi người chơi đang chơi ở chế độ Khách muốn tạo tài khoản chính thức để lưu thành tích và Đánh Hạng $\rightarrow$ Người chơi bấm **"Đăng xuất"** để thoát phiên tạm thời, sau đó quay ra màn hình Đăng ký tạo tài khoản mới bình thường.
  * **Quy tắc chi tiết cho Khách (`GUEST`):**
    * *Phiên:* Phiên Khách tồn tại tối đa **12 giờ** kể từ lúc vào, chỉ trong trình duyệt đang dùng (không có "Ghi nhớ đăng nhập"). **Ngoại lệ (đã duyệt 03/10):** phiên Khách **không hết** khi đang ngồi ghế hoặc đang trong ván, chỉ hết sau khi rời. Khi hết phiên hoặc đăng xuất: xoá tên, chat và dữ liệu cá nhân của Khách; **giữ lại bản ghi ván** cho đối thủ chính thức, hiển thị tên chung là "Khách". Phiên Khách mới là một danh tính mới.
    * *Tên:* Tên hiển thị tạm **không cần duy nhất**. Giao diện luôn gắn nhãn **"(Khách)"** cạnh tên để không thể giả danh người dùng thật. Tên đi qua cùng bộ lọc từ cấm với Display Name (`Quyết định 5.3`).
    * *Được làm:* Đánh Thường (ghép ngẫu nhiên, tạo phòng, vào phòng bằng mã/link/QR), làm Người xem, Đánh Với Máy, chat phòng (cả hai kênh theo vai trò), gửi sticker, bật camera/mic khi ngồi ghế đấu.
    * *Không được làm:* Đánh Hạng; có Elo hoặc lên bảng xếp hạng; kết bạn, nhận/gửi lời mời bạn bè, chat 1-1; đổi username, email, mật khẩu.
    * *Giới hạn chống spam:* Mỗi Khách chỉ có **tối đa 1 phòng đang mở** do mình tạo cùng lúc; chat bị giới hạn tốc độ như người dùng thường (`Quyết định 5.3`). Khách **có tính** vào sức chứa người xem của phòng như mọi người xem khác; mức mở rộng P2 xem Phần 11.
    * *"Không lưu lịch sử" (phần ván có Khách hiện ở lịch sử đối thủ chính thức: đã duyệt 03/10):* Ván có Khách **không xuất hiện trong Lịch sử và không có Replay phía Khách**; ván Đánh Với Máy của Khách không lưu. Nếu đối thủ là tài khoản chính thức thì ván vẫn xuất hiện trong Lịch sử của họ (đối thủ hiển thị là "<Tên> (Khách)"); không ảnh hưởng Elo vì chỉ có ván Casual.

---

### Quyết định 1.4: Phân định rạch ròi Username vs Display Name & Luồng Khởi tạo Tên hiển thị (Phương án C - Đăng ký siêu tốc)
* **Lựa chọn đã chốt:** **[NAME-SPLIT-OPTION-C] Tách riêng Username & Display Name; Mặc định khởi tạo `Display Name = Username`; Đổi tên hiển thị tự do trong Cài đặt hồ sơ không cần OTP**
* **Mô tả nghiệp vụ:**
  1. **Phân định 2 khái niệm định danh:**
     * **`Username` (Tên tài khoản / Tên đăng nhập):**
       * Dùng để đăng nhập vào hệ thống cùng với Mật khẩu.
       * Quy tắc: Bắt buộc duy nhất (UNIQUE) toàn hệ thống, 3–20 ký tự, viết liền không dấu, không khoảng trắng (`^[a-zA-Z0-9_]{3,20}$`). **Không phân biệt hoa thường (đã duyệt 03/10):** `Twot` và `twot` là cùng một tên; lưu đúng chữ người dùng gõ nhưng kiểm tra trùng, đăng nhập và tìm bạn đều so sánh bằng chữ thường.
       * **Từ cấm khi đăng ký (PO duyệt 09/10):** dùng bộ lọc 5.3 để từ chối username chứa từ cấm ngay tại bước nhập trong cả đăng ký thường và Google onboarding; kiểm lại phía máy chủ trước khi hoàn tất. Tên mặc định vẫn bằng username, không sinh tên thay thế (0.17).
       * Bảo mật đổi tên: Bắt buộc phải trải qua quy trình 4 bước xác thực mã OTP gửi về Email (`Quyết định 1.6`).
       * Tần suất: Cho phép đổi liên tục không giới hạn số lần (không cooldown) để thuận lợi cho dev và test.
       * **Giữ chỗ username cũ (đã duyệt 03/10):** Sau khi đổi, username cũ **bị khoá 30 ngày**: không ai đăng ký được, chỉ chủ cũ đổi lại được. Quy tắc này chặn việc chiếm tên cũ để mạo danh. Username đang bị khoá vẫn hiển thị "đã có người dùng" khi kiểm tra trùng.
     * **`Display Name` (Tên hiển thị trong game):**
       * Dùng để hiển thị trên bàn cờ thi đấu, khung webcam đối thủ, danh sách bạn bè, bảng xếp hạng và hồ sơ cá nhân.
       * Quy tắc: Hỗ trợ tiếng Việt có dấu, có khoảng trắng, ký tự đặc biệt thông dụng (VD: *"Nguyễn Ngọc Tình"*), độ dài 2–30 ký tự.
       * Display Name **không cần duy nhất**, nhưng phải qua bộ lọc từ cấm (`Quyết định 5.3`); nếu chứa từ cấm thì từ chối lưu (không che bằng `***` như trong chat). Đã có `@username` hiển thị kèm ở hồ sơ và danh sách bạn bè để phân biệt hai người trùng Display Name.
       * **Ảnh đại diện:** Giai đoạn này **không có tải ảnh lên**. Avatar luôn là hình tự sinh từ chữ cái đầu của Display Name.
  2. **Cơ chế Khởi tạo Tên hiển thị (Phương án C — Tối ưu đăng ký siêu tốc):**
     * **Khi tạo tài khoản mới thành công (cả Đăng ký thường 3 bước lẫn qua Google OAuth):**
       * Hệ thống **tự động gán mặc định `display_name = username`** ở **mọi** luồng (kể cả Google OAuth — không dùng Full Name từ Google, để hai luồng giống nhau).
       * Không bắt người dùng phải qua thêm màn hình nhập liệu rườm rà nào, người dùng được đưa thẳng vào Sảnh chính ngay lập tức để trải nghiệm game.
  3. **Nơi người dùng nhập / thay đổi Display Name:**
     * Khi đã vào game, nếu người dùng muốn đặt tên tiếng Việt có dấu cho trang trọng:
       1. Người dùng bấm vào **Avatar cá nhân** ở góc trên thanh điều hướng $\rightarrow$ Chọn **Cài đặt hồ sơ (`SCR-PROFILE-SETTINGS`)**.
       2. Tại khung **"Thông tin cá nhân"**, tìm ô **`Tên hiển thị (Display Name):`** và gõ tên tiếng Việt mong muốn (VD: *Nguyễn Ngọc Tình*).
       3. Bấm nút **"Lưu thay đổi"** $\rightarrow$ Hệ thống cập nhật tức thì.
       4. **Quy tắc bảo mật:** Việc đổi Display Name là **HOÀN TOÀN TỰ DO VÀ KHÔNG CẦN MÃ OTP**.
  4. **Đối với Chế độ Khách (Guest Mode):**
     * Tại màn hình Đăng nhập, khi bấm nút **"Guest"** $\rightarrow$ Hệ thống mở popup nhỏ yêu cầu nhập: `Tên hiển thị tạm thời:` (2–20 ký tự, hỗ trợ tiếng Việt có dấu) để hiển thị trong phòng cờ giao lưu.

---

### Quyết định 1.5: Quy chuẩn Thời hạn mã OTP & Chống dò mã (Security Rules)
* **Lựa chọn đã chốt:** **[OTP-RULES] Hạn 3 phút; giới hạn nhập sai theo cơ chế của hệ thống xác thực, mục tiêu 5 lần** (Phương án B, Product Owner duyệt 03/10/2026)
* **Mô tả nghiệp vụ:**
  * **Thời hạn hiệu lực của mã OTP:** Mã OTP 6 chữ số chỉ có giá trị trong vòng **3 phút (180 giây)** kể từ khi gửi. Quá 3 phút mã sẽ tự động hết hạn và bị vô hiệu hóa.
  * **Giới hạn số lần nhập sai (Chống dò mã / Anti-Brute-Force):** **Mục tiêu:** tối đa **5 lần** nhập sai cho mỗi lần gửi mã, sau đó phải chờ hoặc bấm "Gửi lại mã mới". **Cách thực thi dựa vào giới hạn tốc độ xác minh của chính hệ thống xác thực (Supabase)**, nên là **gần đúng, không bảo đảm đếm chính xác từng mã** (đây là sai khác đã được Product Owner chấp nhận khi chọn Phương án B). Giao diện vẫn báo rõ khi bị giới hạn và hướng dẫn gửi mã mới.
  * **Đồng hồ đếm lùi gửi lại:** Nút "Gửi lại mã OTP" áp dụng bộ đếm lùi **60 giây** để chống hành vi bấm spam gửi mail liên tục làm nghẽn máy chủ.

---

### Quyết định 1.6: Quy trình 4 bước đổi Username qua OTP & Cố định Email (Immutable Email)
* **Lựa chọn đã chốt:** **[USER-OTP-FLOW] 4 bước đổi Username qua OTP Supabase; Cấm tuyệt đối đổi Email**
* **Mô tả quy trình 4 bước:**
  1. **Bước 1 (Chọn chức năng):** Tại Cài đặt hồ sơ (`SCR-PROFILE-SETTINGS`), người dùng bấm nút **"Đổi Username"** $\rightarrow$ Hệ thống gửi mã OTP 6 số về email và mở modal nhập mã OTP (`MODAL-OTP-USERNAME`).
  2. **Bước 2 (Nhập OTP):** Người dùng kiểm tra email nhận mã, nhập mã OTP vào modal (thời hạn 3 phút, giới hạn nhập sai theo `Quyết định 1.5`).
  3. **Bước 3 (Xác thực & Mở khóa):** Hệ thống xác thực OTP thành công $\rightarrow$ Mở khóa cho phép nhập liệu ô `Username` mới.
  4. **Bước 4 (Đổi & Xác nhận):** Người dùng nhập `username` mới mong muốn (unique, 3–20 ký tự) và bấm **"Xác nhận thay đổi"** $\rightarrow$ Cập nhật thành công.
* **Bảo toàn dữ liệu tuyệt đối (Data Integrity):** Toàn bộ lịch sử ván cờ, điểm Elo, tin nhắn chat và danh sách bạn bè đều gắn với `user_id` (UUID bất biến). Đổi Username bảo toàn nguyên vẹn 100% dữ liệu.
* **Chính sách đối với Email:** Trường `email` hiển thị khóa cứng hoàn toàn (`READONLY` / `DISABLED`), tuyệt đối không cho phép đổi nhằm bảo vệ danh tính gốc Supabase Auth và là đích nhận OTP bất biến.

---

### Quyết định 1.7: Khôi phục Username & Đặt lại mật khẩu (P2)
* **Lựa chọn đã chốt:** **[PWD-RESET] Khôi phục Username và đặt lại mật khẩu bằng OTP gửi về email; áp dụng cho mọi tài khoản, vẫn thuộc P2**
* **Mô tả nghiệp vụ:**
  1. Ở `SCR-FORGOT-PASSWORD` người dùng nhập email. Hệ thống **luôn** trả cùng một thông báo *"Nếu email này đã đăng ký, mã khôi phục đã được gửi"*, không tiết lộ email có tồn tại hay không.
  2. Mã OTP 6 chữ số dùng **đúng quy tắc của `Quyết định 1.5`** (hạn 3 phút, giới hạn nhập sai theo `Quyết định 1.5`, gửi lại sau 60 giây).
  3. Ở `SCR-RESET-PASSWORD` xác minh OTP trước; **chỉ sau OTP hợp lệ** mới hiển thị **Username hiện tại** của tài khoản gắn với email đó (PO duyệt 05/10). Nếu chỉ quên Username, quay về Đăng nhập và dùng mật khẩu hiện tại, không bắt buộc đổi mật khẩu. Nếu quên cả mật khẩu, tiếp tục nhập mật khẩu mới (tối thiểu 8 ký tự) + xác nhận. Dùng lại hai màn hình/URL khôi phục hiện có, không thêm màn hình. Email được chuyển giữa hai màn hình bằng trạng thái của ứng dụng, **không đặt email lên URL**.
  4. Đổi thành công: mọi phiên đăng nhập khác của tài khoản bị đăng xuất; người dùng phải đăng nhập lại bằng mật khẩu mới.
  5. Tài khoản tạo bằng Google cũng có mật khẩu (`Quyết định 1.2`) nên dùng được luồng này.
  6. **PO xác nhận và bổ sung 05/10:** OTP không phải phương thức đăng nhập trực tiếp vào ứng dụng. OTP đăng ký chỉ hoàn tất đăng ký theo 1.1; OTP khôi phục (P2) chỉ cho xác thực, xem Username hiện tại và đặt lại mật khẩu nếu cần, sau đó về màn hình Đăng nhập để đăng nhập lại. Xác minh OTP khôi phục không tự cấp quyền dùng ứng dụng; trước khi xác minh vẫn dùng thông báo chung, không tiết lộ email có tài khoản hay không.

---

### Quyết định 1.8: Phiên đăng nhập & nhiều thiết bị
* **Lựa chọn đã chốt:** **[SESSION] Ghi nhớ 30 ngày hoặc hết khi đóng trình duyệt; một người chỉ ngồi một ghế tại một thời điểm**
* **Mô tả nghiệp vụ:**
  * *Phiên:* Tick **"Ghi nhớ đăng nhập"** (mặc định tick) $\rightarrow$ phiên giữ **30 ngày**. Bỏ tick $\rightarrow$ phiên kết thúc khi đóng trình duyệt hoặc sau **12 giờ**, tuỳ cái nào đến trước. Phiên Khách xem `Quyết định 1.3`.
  * **Mốc tính hạn — PO duyệt 05/10:** thời hạn cố định tính từ lúc đăng nhập thành công; với đăng ký mới, từ lúc hoàn tất đăng ký. Hoạt động, chơi tiếp, chuyển tab hay làm mới token không gia hạn. Đăng nhập lại thực sự tạo hạn mới. Đóng riêng một tab không đồng nghĩa đóng trình duyệt; khi mất kết nối vẫn theo luật ân hạn.
  * **Hết hạn phiên khi đang chơi (PO duyệt 05/10/2026, phương án A):** Khi phiên đăng nhập chính thức hết hạn **12 giờ/30 ngày**, ngắt quyền điều khiển và yêu cầu đăng nhập lại. Ván online giữ ân hạn **60 giây**, đồng hồ vẫn chạy; ván AI được giữ **30 phút**. Đăng nhập lại đúng tài khoản trên cùng thiết bị trong hạn thì tiếp tục; đăng nhập trên thiết bị khác áp dụng luật xử thua bên dưới; quá hạn xử lý theo 8.3/6.3. Đây là hết hạn phiên đăng nhập, không phải mỗi lần làm mới token truy cập; ngoại lệ phiên Khách vẫn theo 1.3. Đăng xuất chủ động vẫn theo xác nhận đầu hàng bên dưới.
  * *Một tài khoản, một vị trí chơi:* Một tài khoản chỉ được **ngồi ghế đấu ở một phòng/ván** tại một thời điểm (kể cả ván với máy). Khi đang trong phòng chờ có ghế, đang trong ván, hoặc đang trong hàng đợi, các nút "Tìm trận", "Tạo phòng", "Ghép ngẫu nhiên", vào ván khác bị `DISABLED` kèm tooltip *"Bạn đang ở trong một ván/phòng khác"*.
  * *Nhiều tab:* Mở thêm tab vào cùng phòng thì tab mới **tiếp quản**, tab cũ nhận thông báo *"Phiên này đã được mở ở tab khác"* và chuyển sang chỉ đọc. **Camera/mic ở P1 (rà soát cuối):** khi tab mới tiếp quản, camera/mic của tab cũ **tự dừng**; tab mới mặc định tắt và người dùng tự bật lại. Hộp thoại chọn thiết bị `MODAL-MEDIA-TAB-SWITCH` là P2.
  * **Tab cũ tự nối lại — PO duyệt 05/10:** tab đã mất quyền điều khiển vẫn chỉ đọc khi tự kết nối lại; chỉ thao tác chủ động tiếp quản mới được lấy quyền điều khiển, không tự giành quyền qua lại giữa các tab.
  * **Đăng nhập thiết bị khác — PO thay đổi 05/10:** khi tài khoản đang trong ván mà đăng nhập thành công ở một phiên mới trên thiết bị khác, **xử thua ngay ván đang chơi**, kết thúc ván và rời vị trí chơi, **đăng xuất thiết bị cũ**; thiết bị mới vào **Sảnh**, không tiếp tục ván cũ và không chờ ân hạn mất mạng. Áp dụng online và AI; không đồng nhất với mở thêm tab trên cùng thiết bị hoặc làm mới token. Mã kỹ thuật cho lý do này còn là đề xuất trong docs; hành vi xử thua đã chốt. Ngoài ván đang chạy không tạo kết quả thua: đăng xuất thiết bị cũ, rời phòng/vị trí cũ theo vòng đời hiện có, thiết bị mới vào Sảnh.
  * *Đang trong hàng đợi:* Người đang tìm trận (Casual hoặc Ranked) hiển thị là 🟠 *"Đang đấu"* (không nhận lời mời hay Thách đấu); nếu mất kết nối quá **30 giây** thì tự rút khỏi hàng đợi.
  * *Ván dở:* Nếu có ván hoặc phòng đang dở, Sảnh hiển thị banner **"Bạn có ván đang chơi dở — Quay lại"**.
  * **Đăng xuất chủ động (duyệt 04/10):** Khi đang đấu online, hiện xác nhận rõ hậu quả đầu hàng; đồng ý thì máy chủ kết thúc ván `RESIGN`, thực hiện rời phòng rồi đăng xuất; Huỷ giữ nguyên ván và phiên. Không được chỉ xoá phiên ở client để thay cho lệnh đầu hàng. Đăng xuất ở `WAITING`/`FINISHED` thực hiện rời phòng theo 2.3, không xử thua. Ván AI theo 6.3. Đóng tab/mất mạng vẫn theo ân hạn, không đồng nhất với Đăng xuất chủ động.

## PHẦN 2: TẠO PHÒNG, PHÒNG CHỜ & MỜI BẠN (Yêu cầu 2 & 3)

### Quyết định 2.0: Bốn lựa chọn chơi tại Màn hình Sảnh chính (Lobby Hub)
* **Lựa chọn đã chốt (PO làm rõ 05/10/2026):** **[LOBBY-MODES] Đánh Thường ghép ngẫu nhiên · Đánh Hạng · Tự tạo phòng · Đánh Với Máy**
* **Mô tả nghiệp vụ:**
  * Tại Màn hình Sảnh chính (`SCR-LOBBY`), tách bốn lựa chọn để người dùng phân biệt ghép ngẫu nhiên và tự tạo phòng. Nhãn `CASUAL` kế thừa dùng chung cho hai luồng không tính Elo, nhưng phải áp dụng quyền và thời gian riêng dưới đây; không suy từ nhãn chung rằng ghép ngẫu nhiên được có người xem hoặc chọn thời gian.
  
  1. **ĐÁNH THƯỜNG — Ghép ngẫu nhiên (P2):**
     * **Ghép trận ngẫu nhiên (Casual Quick Match):** Người dùng bấm nút "Ghép ngẫu nhiên", máy chủ tự động tìm kiếm người chơi khác trong hệ thống cũng đang chọn ghép ngẫu nhiên để tạo phòng giao lưu tức thì (không tính điểm Elo).
       * **Quy tắc ghép:** cố định 15 phút/bên, không cộng giây, không Elo; phe ngẫu nhiên, người vào hàng đợi trước là Host. Ghép được thì mở xác nhận **10 giây**; mỗi bên bấm Sẵn sàng. Cả hai xác nhận trong hạn mới đếm **3…2…1…** để bắt đầu ván, không tự Sẵn sàng.
       * **Tìm tối đa 3 phút — PO trả lời 05/10:** trong lúc tìm có nút Huỷ tìm trận để huỷ bất kỳ lúc nào. Tìm quá 3 phút không có đối thủ thì báo không tìm được và về Sảnh, không ghép máy, không phạt. Hết 10 giây xác nhận: người chưa Sẵn sàng về Sảnh; người đã Sẵn sàng được tự tiếp tục tìm; cả hai chưa xác nhận thì cả hai về Sảnh. Chưa bắt đầu ván không ghi kết quả thua.
       * **Quyền trong ván:** Chỉ hai người đã ghép; không nhận người xem, không chia sẻ phòng để người khác vào, không có Kênh Chung. Chat, camera và mic chỉ giữa hai người chơi. Không có quyền đổi cài đặt phòng để mở người xem. Phòng không được công khai tại Sảnh.
       * **Xin đi lại (PO chốt 05/10, phương án 1A):** Có ở P2; áp dụng cùng luật phòng tự tạo tại `Quyết định 3.2` và `3.6`.
       * **Tái đấu (PO chốt 05/10, phương án 2A; sửa 07/10):** Có ở P2; khi cả hai còn ở phòng và cùng đồng ý, tạo ván mới trong cùng phòng, đặt lại **15 phút mỗi bên**. Người đề nghị chọn **Giữ phe** hoặc **Đổi phe** (mặc định Đổi phe) theo Phần 0 mục 0.8.
       * **Sau ván (PO chốt 05/10, phương án 3A):** Khi một người rời, phòng vẫn ở `FINISHED` để người còn lại xem kết quả; không chuyển về `WAITING`, không ghép thêm người và không nhận người mới qua lời mời/link/mã. Đóng khi cả hai đã rời hoặc hết **10 phút tính từ kết thúc ván**, không đặt lại hạn khi một người rời. Muốn tìm đối thủ mới thì rời về Sảnh.

  2. **ĐÁNH HẠNG (P2) — So tài theo Elo:**
     * **Ghép ngẫu nhiên 100% (Pure Matchmaking):** Dựa trên thuật toán cân bằng điểm Elo FIDE ($\Delta Elo \le 100$). Người chơi bấm "Tìm trận Xếp hạng" là máy chủ tự ghép ngẫu nhiên, **tuyệt đối không cho phép tự chọn đối thủ, không cho mời bạn bè vào đánh rank** để chống gian lận "bơm điểm Elo". Quy tắc hàng đợi và chống gian lận bổ sung xem `Quyết định 7.2`.
     * **TUYỆT ĐỐI KHÔNG CHO NGƯỜI KHÁC VÀO XEM (NO SPECTATORS):** Ván cờ Xếp hạng được khóa kín hoàn toàn giữa 2 người chơi. Phòng cờ Ranked không xuất hiện trong danh sách phòng ở Sảnh, không cho phép bất kỳ ai vào xem làm người xem, bảo đảm sự tập trung và bảo mật chiến thuật tuyệt đối.
     * **TUYỆT ĐỐI CẤM XIN ĐI LẠI (NO UNDO):** "Bút sa gà chết", nút xin đi lại bị vô hiệu hóa/ẩn hoàn toàn.
     * **Quy tắc nghiêm ngặt khác:** Thời gian cố định 10 phút Rapid mỗi bên; xử lý bỏ cuộc (Rage Quit) quá 60s bị xử thua phạt trừ Elo; Khách (Guest) không được tham gia.

  3. **TỰ TẠO PHÒNG (P1) — Mời người vào chơi/xem:**
     * Người dùng tự tạo phòng, chọn mức giờ theo `Quyết định 2.1`, rồi mời nhanh bạn bè online trong danh sách hoặc chia sẻ link/mã 8 ký tự. Người chưa kết bạn, kể cả hai người xa lạ muốn so tài, được vào bằng link/mã; **không bắt buộc kết bạn trước**. Chi tiết quyền và khóa phòng ở `Quyết định 2.7`, vai trò sau khi vào ở `Quyết định 2.8`.
     * Chỉ luồng này có người xem (tối đa 5), Kênh Chung và chia sẻ media cho người xem. Phòng `PUBLIC` xuất hiện trong danh sách tại Sảnh với nút **Vào chơi** (khi còn ghế) và **Vào xem** (07/10, Phần 0 mục 0.5); `CODE_ONLY` và `LOCKED` không xuất hiện. Không thêm kênh chat thế giới. QR vẫn là P2.

  4. **ĐÁNH VỚI MÁY (P1) — Rèn luyện:**
     * Người chơi chọn thi đấu theo từng cấp độ khó: **Dễ (Easy)**, **Trung bình (Medium)**, **Khó (Hard)**.
     * Tự do chọn cầm quân Đỏ hoặc Đen; cho phép Đi lại **tối đa 3 lần/ván, không cần máy đồng ý** (`Quyết định 6.3` là nguồn luật, đã sửa lại chỗ trước đây ghi "tự do"); toàn bộ ván đấu của tài khoản chính thức được lưu vào Lịch sử hồ sơ cá nhân và có thể xem lại (Replay) từng nước. Ván Đánh Với Máy **không tính Elo**.

---

### Quyết định 2.1: Giữ nguyên cơ chế thời gian cố định (Không cộng giây)
* **Lựa chọn đã chốt:** **[3A] Thời gian cố định (Fixed Clock), không áp dụng luật cộng giây (No Increment)**
* **Mô tả nghiệp vụ:**
  * Giữ nguyên 4 chế độ thời gian thi đấu cố định:
    1. *Không giới hạn thời gian (Mặc định)* — Kích hoạt cơ chế chống treo ván `R17` (sau 3 phút hỏi, sau 30s xử thua nếu im lặng).
    2. *5 phút mỗi bên (Chớp nhoáng / Blitz)*.
    3. *10 phút mỗi bên (Nhanh / Rapid)*.
    4. *15 phút mỗi bên (Tiêu chuẩn / Standard)*.
  * **Phân kỳ (xem `Phần 11`):** ở P1 chỉ có 5/10/15 phút (mặc định 10 phút); mức "Không giới hạn" (mặc định ghi ở trên) và cơ chế chống treo ván là P2.
  * **Phạm vi của "4 mức" (PO làm rõ 05/10):** chỉ dành cho **phòng tự tạo**. Đánh Thường ghép ngẫu nhiên cố định 15 phút/bên (`Quyết định 2.0`); Đánh Hạng cố định 10 phút/bên (`Quyết định 8.1`); Đánh Với Máy không giới hạn thời gian (`Quyết định 6.3`).
  * Khi hết giờ (`clock <= 0`), máy chủ tự động kết thúc ván và xử thua bên hết giờ (`TIMEOUT`).
  * **Lý do kỹ thuật & tiến độ:** Giúp logic đồng hồ đếm lùi trên máy chủ và việc bù trừ độ trễ mạng (Network Latency Compensation) ở client luôn đơn giản, chính xác tuyệt đối, tránh tranh cãi về thời gian khi thi đấu.

---

### Quyết định 2.2: Bổ sung Mã QR (QR Code) chia sẻ phòng thi đấu
* **Lựa chọn đã chốt:** **[4B] Thêm Mã QR (QR Code) song song với Link mời và Mã phòng 8 ký tự**
* **Mô tả nghiệp vụ:**
  * Tại Modal mời bạn (`MODAL-INVITE`) và Màn hình phòng chờ (`SCR-WAITING-ROOM`), bổ sung khối hiển thị **Mã QR trực quan**.
  * Mã QR mã hóa đường link mời phòng chứa token bảo mật (URL có dạng `https://domain/rooms/join?token=...`). **Đã duyệt 03/10:** link, Mã 8 ký tự và Mã QR là **ba cách vào cùng một quyền**; không có link riêng cho "xem" hay "chơi" (xem `Quyết định 2.8`).
  * Người chơi có thể dùng camera điện thoại hoặc ứng dụng quét mã (Zalo, Camera native) quét mã QR để mở thẳng trình duyệt web vào phòng cờ.
  * Hỗ trợ nút **"Tải ảnh QR"** hoặc **"Sao chép QR"** để người chơi gửi nhanh vào các nhóm chat.
* **Lợi ích thực tế:** Tăng tính tiện lợi tối đa cho người dùng di động, tăng điểm trải nghiệm người dùng (UX) khi demo đồ án.

---

### Quyết định 2.3: Cơ chế Ghế ngồi, Đổi bên linh hoạt, Bắt đầu 3.. 2.. 1.. & Chuyển quyền Chủ phòng (Host Transfer)
* **Lựa chọn đã chốt:** **[ROOM-FLOW] Quản lý ghế đơn/đôi linh hoạt; Đổi bên reset Ready; Đếm ngược 3s tự động vào ván; Nhượng quyền Host khi Host rời**
* **Phạm vi sau làm rõ 05/10:** các thao tác mời người và quản lý người xem dưới đây chỉ phục vụ **phòng tự tạo**. Tái đấu P2 áp dụng cho cả phòng tự tạo và ghép ngẫu nhiên; quy tắc sau ván ghép ngẫu nhiên ở `Quyết định 2.0`.
* **Mô tả nghiệp vụ:**
  1. **Quy tắc Ghế ngồi khi Tạo phòng:**
     * Khi tạo phòng thành công, Chủ phòng (Host) mặc định tự động ngồi vào **ghế ĐỎ** (cầm quân Đỏ, bên đi trước).
     * **Đổi ghế tự do khi một mình:** Trong thời gian chờ người thứ 2 vào phòng, Chủ phòng có toàn quyền bấm chuyển sang ghế Đen hoặc bấm đổi qua lại giữa 2 ghế Đỏ $\leftrightarrow$ Đen bao nhiêu lần tùy thích.
     * **Người vào bằng mã/link hoặc lời mời khi còn ghế trống:** Hệ thống tự động xếp vào **ghế còn trống** (nếu Host đang ngồi Đỏ thì vào Đen; nếu Host đang ngồi Đen thì vào Đỏ). Nút Vào xem từ Sảnh luôn đưa vào vai trò Người xem; nút **Vào chơi** ở Sảnh vào ghế trống (07/10, Phần 0 mục 0.5).
  2. **Cơ chế Xin đổi bên khi đã đủ 2 người (Side Swap) — P1 từ 07/10:** áp dụng mọi lúc phòng ở `WAITING` có đủ hai người, kể cả sau ván; chi tiết và chống spam ở Phần 0 mục 0.6.
     * Khi cả 2 ghế đã có người, bất kỳ người chơi nào cũng có thể bấm nút **"Xin đổi bên"**.
     * Hệ thống gửi thông báo xác nhận đến đối thủ với thời hạn chờ 30 giây.
     * Nếu đối thủ đồng ý: Hai người chơi hoán đổi ghế Đỏ $\leftrightarrow$ Đen cho nhau.
     * **Quy tắc bảo vệ (Ready Reset):** Ngay khi đổi bên thành công, trạng thái "Sẵn sàng" của cả hai người chơi sẽ **tự động chuyển về trạng thái Chưa sẵn sàng (`ready = false`)**, buộc hai bên phải xác nhận lại phe cờ của mình trước khi bắt đầu.
  3. **Cơ chế Sẵn sàng (Ready) & Đếm ngược tự động vào ván cờ:**
     * Chủ phòng khi vào phòng có thể bấm **"Sẵn sàng"** trước hoặc bấm hủy sẵn sàng để chờ người thứ 2 vào.
     * Người thứ 2 vào phòng có thể trao đổi qua khung chat, bấm xin đổi bên... Khi đã sẵn sàng thi đấu thì bấm nút **"Sẵn sàng"**.
     * **Khi CẢ HAI BÊN CÙNG SẴN SÀNG (`ready_red = true` VÀ `ready_black = true`):**
       * Hệ thống tự động kích hoạt hiệu ứng đếm ngược: **3... 2... 1...** kèm âm thanh cờ gỗ.
       * Hết 3 giây đếm ngược, máy chủ chính thức khởi tạo hiệp đấu mới (`Match ID`), chuyển giao diện sang phòng thi đấu cờ trực tiếp (`SCR-GAME-ROOM`), đồng hồ thi đấu bắt đầu tính giờ cho bên quân Đỏ.
     * **Mất mạng khi đếm bắt đầu ván trong phòng tự tạo — PO duyệt 05/10:** huỷ đếm, reset Sẵn sàng của cả hai về `false`, giữ ghế người mất mạng theo ân hạn 60 giây ở phòng chờ. Khi kết nối lại, cả hai phải bấm Sẵn sàng để đếm lại; chưa khởi tạo ván thì không ghi kết quả thua. Khi hết đếm, máy chủ kiểm lại hai ghế, Sẵn sàng và kết nối trước khi tạo ván.
  4. **Xử lý khi Chủ phòng (Host) rời phòng chờ (`status = WAITING`):**
     * **Chuyển quyền Chủ phòng (Host Transfer):** Nếu trong phòng đang có người chơi thứ 2, máy chủ **tự động nhượng quyền Chủ phòng (Host) cho người chơi thứ 2**. Người chơi thứ 2 trở thành Host mới, giữ nguyên phòng để tiếp tục chờ người chơi khác vào chơi.
     * *Khi nào phòng mới đóng?* Chỉ khi trong phòng không còn người chơi nào khác (hoặc chỉ còn người xem) mà Host rời đi thì phòng mới tự động đóng (`status = CLOSED`).
  5. **Host khi ván đang diễn ra (`status = PLAYING`):** Vai trò Host chỉ liên quan Cài đặt phòng, nên Host mất kết nối tạm thời **không** làm đổi Host. Nếu Host rời phòng hoặc bị xử thua vì quá ân hạn (`Quyết định 8.3`), quyền Host chuyển cho người chơi còn lại. Host rời giữa ván được tính **Đầu hàng** như mọi người chơi.
  6. **Đổi chỗ giữa ghế và người xem (đã duyệt 03/10):** xem `Quyết định 2.8`.
  7. **Tái đấu giữ phòng (P2):** Trong phòng tự tạo hoặc ghép ngẫu nhiên, Tái đấu (`R14`) tạo `Match ID` mới **trong cùng phòng**, phe theo lựa chọn Giữ phe/Đổi phe của đề nghị (07/10, Phần 0 mục 0.8). Phòng tự tạo giữ nguyên danh sách chặn (`room_blocks`), danh sách người xem và chế độ phòng; ghép ngẫu nhiên giữ quyền và thời gian theo 2.0. Ranked không có Tái đấu (`Quyết định 7.2`). **Đã duyệt 03/10:** cả hai bấm Tái đấu thì vào thẳng ván mới sau 3 giây, không cần bấm Sẵn sàng. **PO duyệt 05/10:** nhận đủ hai xác nhận hợp lệ trước hạn đóng phòng 10 phút thì huỷ hẹn giờ cũ và đếm Tái đấu; xác nhận đến sau hạn bị từ chối.
  8. **Sau ván trong phòng tự tạo — ĐÃ THAY bởi Phần 0 mục 0.7 (07/10):** phòng về `WAITING` ngay khi ván kết thúc, không hạn đóng 10 phút. Nội dung cũ giữ để tra cứu: **(đã duyệt 03/10; ngoại lệ RANKED ở 7.2):** Khi một người ngồi ghế rời lúc phòng `FINISHED`, phòng quay về `WAITING`; người còn lại giữ ghế và quyền Host (nếu người rời là Host thì quyền Host chuyển cho người còn lại); người mới vào theo `Quyết định 2.8`. Mất kết nối ở `WAITING`: giữ ghế 60 giây. Phòng ghép ngẫu nhiên không nhận người khác qua lời mời/link/mã (2.0).

---

### Quyết định 2.4: Luồng Tham gia phòng qua Link URL / Mã QR (Redirect tự động sau Đăng nhập / Guest)
* **Lựa chọn đã chốt:** **[JOIN-REDIRECT] Tự động chuyển tiếp vào phòng sau khi Đăng nhập / Chọn Guest**
* **Mô tả nghiệp vụ:**
  * Khi người dùng nhấp vào Link mời hoặc quét Mã QR trên thiết bị:
    * **Trường hợp 1 (Đã đăng nhập):** Hệ thống lập tức đưa thẳng người dùng vào phòng thi đấu (vào ghế chơi nếu phòng còn chỗ, hoặc vào làm người xem theo dõi).
    * **Trường hợp 2 (Chưa đăng nhập):** Hệ thống hiển thị màn hình Đăng nhập / Đăng ký kèm nút **"Guest" (Chơi nhanh)** — nút Khách hoạt động ở P1 (07/10).
    * **Tự động chuyển tiếp (Auto-Redirect):** Ngay sau khi người dùng đăng nhập thành công (hoặc bấm chọn chơi nhanh bằng Guest) $\rightarrow$ Hệ thống tự động điều hướng thẳng vào đúng phòng cờ mục tiêu ban đầu, **tuyệt đối không bắt người dùng phải bấm link hoặc quét lại mã QR lần thứ 2**.
    * **Ưu tiên phiên/vị trí chơi (đồng bộ PO 05/10):** luật 1.8 được kiểm trước chuyển hướng phòng mời. Đăng nhập thiết bị khác khi đang chơi thì xử thua và về Sảnh; đăng nhập lại cùng thiết bị trong ân hạn tiếp tục ván cũ. Tự vào phòng mời chỉ khi không bị ràng buộc bởi vị trí chơi khác, và vẫn kiểm quyền/sức chứa theo 2.8.

---

### Quyết định 2.5: Mời bạn bè trực tiếp trong game (Chỉ mời bạn bè Online)
* **Lựa chọn đã chốt:** **[INVITE-ONLINE-ONLY] Nút "Mời" chỉ kích hoạt với bạn bè đang Online; Pop-up 30s**
* **Mô tả nghiệp vụ:**
  * Tại Modal mời bạn bè (`MODAL-INVITE`, chỉ người ngồi ghế của phòng mới mở được), danh sách bạn bè hiển thị rõ trạng thái:
    * 🟢 **Bạn bè đang Online:** Nút **"Mời"** sáng màu và cho phép bấm gửi lời mời.
    * ⚫ **Bạn bè đang Offline:** **Không cho phép gửi lời mời**, nút "Mời" bị ẩn hoặc ở trạng thái vô hiệu hóa kèm nhãn *"Ngoại tuyến"*.
    * 🟠 **Bạn bè đang trong ván/phòng khác ("Đang đấu"):** coi như không mời được; nút "Mời" `DISABLED` kèm tooltip *"Bạn bè đang trong ván khác"*. Khách không gửi/nhận được lời mời bạn bè (có thể chia sẻ link/QR/mã).
  * **Cơ chế hiển thị lời mời cho người nhận:**
    * Khi được mời, trên màn hình của bạn bè đang online sẽ lập tức xuất hiện một pop-up thông báo nổi ở góc:
      > ✉️ *"Người chơi [Tên Host] mời bạn tham gia phòng cờ [Tên phòng]"* kèm 2 nút: **[Tham gia]** và **[Từ chối]**.
    * Pop-up có thời hạn đếm lùi **30 giây**, nếu người nhận không bấm thì pop-up sẽ tự động biến mất và lời mời hết hiệu lực.

---

### Quyết định 2.6: Tự động chuyển thành Người xem (Fallback to Spectator) khi phòng đã đủ 2 người chơi
* **Lựa chọn đã chốt:** **[AUTO-SPECTATOR] Tự động chuyển vai trò Người xem nếu ghế đấu đã kín (còn chỗ xem, theo số người xem tối đa của phòng)**
* **Phạm vi:** chỉ phòng tự tạo, người vào theo các cách mời của `Quyết định 2.7`; không áp dụng cho ghép ngẫu nhiên, Đánh Hạng hoặc AI.
* **Mô tả nghiệp vụ:**
  * Khi một người dùng truy cập phòng (qua Link mời, Mã phòng hoặc Mã QR):
    * Nếu 2 ghế đấu đã đủ người, nhưng phòng vẫn còn chỗ xem (số người xem hiện tại thấp hơn số người xem tối đa của phòng, `Quyết định 2.8`) $\rightarrow$ Máy chủ tự động cấp quyền vào phòng với vai trò **Người xem (`role = SPECTATOR`)** và hiển thị thông báo nhẹ:
      > ℹ️ *"Ghế đấu đã đủ 2 người, bạn đang tham gia phòng với vai trò Người xem."*
    * Nếu phòng đã đạt sức chứa (**2 người chơi + số người xem tối đa của phòng**, tối đa 7 người; phòng tạo ở chế độ "Không có người xem" thì chỉ 2 người) $\rightarrow$ Máy chủ từ chối tiếp nhận và thông báo lỗi rõ ràng: ⚠️ *"Phòng thi đấu đã đầy người, vui lòng chọn phòng khác!"*.

---

### Quyết định 2.7: Phòng tự tạo — thông số, cách mời và khóa phòng
* **Lựa chọn đã chốt (PO làm rõ 05/10/2026):** **[ROOM-SPEC] Mời nhanh bạn bè online hoặc chia sẻ link/mã cho người chưa kết bạn; phòng có `PUBLIC` / `CODE_ONLY` / `LOCKED`, tối đa năm người xem**
* **Mô tả nghiệp vụ:**
  1. **Trường khi tạo phòng (`MODAL-CREATE-ROOM`):** Tên phòng (1–60 ký tự, qua bộ lọc từ cấm), mức giờ (4 mức, `Quyết định 2.1`; P1 chỉ 5/10/15 phút), số người xem tối đa (**Không có người xem**, hoặc 1–5; **mặc định 5**; không đổi sau khi tạo). Phòng tạo ở `CODE_ONLY`; Host có thể mở `PUBLIC` tại Cài đặt phòng. `LOCKED` chỉ bật sau khi đủ hai người chơi (`Quyết định 2.8`). Phe mặc định của Host là Đỏ (`Quyết định 2.3`). Mức giờ **không đổi được** sau khi tạo phòng. Mã phòng 8 ký tự do máy chủ sinh.
  2. **Quyền vào phòng:**

| Chế độ | Hiện ở Sảnh | Người mới vào bằng | Ghi chú |
|---|:---:|---|---|
| `PUBLIC` | Có | Nút **Vào chơi** (còn ghế) / **Vào xem** tại Sảnh (07/10), hoặc mã/link/lời mời | Chỉ phòng tự tạo; kiểm trạng thái, quyền và số chỗ xem tại máy chủ |
| `CODE_ONLY` | Không | Mã 8 ký tự, link/QR, lời mời bạn bè | Không bắt buộc kết bạn; QR là P2 |
| `LOCKED` | Không | **Không ai mới vào được**, kể cả có mã/link/QR | Chỉ bật được khi đã đủ 2 người chơi; người đang trong phòng giữ nguyên (`Quyết định 4.3`) |

  3. **Hai cách mời (PO chốt 05/10):** (a) mời nhanh bạn bè đang online qua `MODAL-INVITE` trong phòng (`Quyết định 2.5`); (b) gửi link hoặc mã cho bất kỳ người nào muốn chơi/xem, không kiểm tra quan hệ bạn bè khi vào bằng link/mã. **PO chốt lại MVP:** phòng `PUBLIC` được tìm ở danh sách Sảnh và vào xem; `CODE_ONLY` chỉ qua mã/link/lời mời. Không yêu cầu kết bạn để xem phòng công khai hoặc vào bằng mã/link. Mọi cách vào vẫn phải kiểm tra phiên, khóa phòng, danh sách chặn và sức chứa; người chưa đăng nhập chọn Đăng nhập/Đăng ký hoặc **Khách** (P1 từ 07/10) rồi tự chuyển vào phòng (`Quyết định 2.4`).
  4. **Thách đấu bạn bè (P2, duyệt 04/10):** Từ `SCR-FRIENDS` mở lại `MODAL-CREATE-ROOM`; người gửi nhập tên, mặc định **10 phút / CODE_ONLY / 5 người xem**, được đổi trong phạm vi phòng tự tạo của phân kỳ. **Theo biểu mẫu phòng hiện hành:** mặc định đồng nhất với phòng tự tạo; không tạo thêm mức người xem ngoài trần mới. Chỉ khi xác nhận mới tạo phòng rồi gửi lời mời theo 2.5. Huỷ form không tạo phòng/không gửi mời. Nếu bạn vừa bận hoặc từ chối/hết hạn, phòng đã tạo **vẫn tồn tại** để Host tự quản lý; không tự đóng hoặc chuyển sang ván với máy.

---

### Quyết định 2.8 (đã duyệt 03/10): Vào phòng, ghế ngồi và người xem
* **Lựa chọn đã chốt:** **[ROOM-ACCESS] Một lời mời = ba cách vào cùng quyền; ghế trống thì vào ghế, hết ghế thì làm người xem; Host sắp xếp ghế/người xem; `LOCKED` chỉ bật khi đủ 2 người chơi**
* **Mô tả nghiệp vụ:**
  1. **Thiết lập khi tạo phòng — MVP chốt lại 05/10:** chọn *Không có người xem* hoặc tối đa 1–5 người xem (**mặc định 5**). Sức chứa phòng = 2 + số này (tối đa 7). Không đổi sau khi tạo.
  2. **Mời người vào:** Bấm "Chia sẻ phòng" tạo cùng lúc **3 hình thức**: Link, Mã 8 ký tự, Mã QR. Cả ba cho **cùng một quyền**, không phân biệt xem/chơi. Chỉ 2 người chơi thấy nút Chia sẻ.
  3. **Người mới vào đâu:** Trong **phòng tự tạo**, người có link/mã hoặc lời mời được vào theo `Quyết định 2.7`, không bắt buộc kết bạn. Ghế đấu còn trống thì vào **ngay ghế đó**. Hai ghế đã kín thì vào làm **Người xem** nếu còn chỗ (`Quyết định 2.6`); hết chỗ thì báo phòng đầy. Nút **Vào xem** tại Sảnh cho vào với vai trò Người xem ở phòng `PUBLIC`; máy chủ không tự xếp người bấm nút này vào ghế chơi. Nút **Vào chơi** (07/10) xếp vào ghế trống, ghế vừa hết thì xử lý theo Phần 0 mục 0.5. Ghép ngẫu nhiên, Đánh Hạng và AI không nhận người xem.
  4. **Đổi chỗ giữa ghế và người xem trong phòng tự tạo** (chỉ khi phòng `WAITING` hoặc `FINISHED`, **không đổi chỗ khi ván đang diễn ra**):
     * Người ngồi ghế tự bấm *"Chuyển sang người xem"*. **Điều kiện (rà soát cuối):** chỉ khi phòng còn chỗ xem (số người xem hiện tại thấp hơn số người xem tối đa của phòng). Phòng "Không có người xem" hoặc đã đủ người xem thì nút `DISABLED` kèm tooltip *"Phòng không còn chỗ cho người xem"*; không bao giờ vượt trần. Không có thao tác hoán đổi trực tiếp.
     * Host bấm *"Chuyển sang người xem"* cho một người đang ngồi ghế (cùng điều kiện còn chỗ xem), hoặc gửi *"Mời xuống ghế"* cho một người xem khi còn ghế trống. **PO duyệt 05/10:** lời mời xuống ghế cần người xem **Chấp nhận**; Từ chối thì tiếp tục xem. Lời mời không giữ ghế: khi chấp nhận, máy chủ kiểm lại trạng thái phòng, quyền, vị trí chơi và ghế trống; nếu ghế đã có người thì thông báo và giữ vai trò Người xem. Xuống ghế thành công vẫn phải bấm Sẵn sàng theo 2.3.
     * **Đổi người ngồi ghế trong phòng tự tạo (rà soát cuối):** Mỗi khi thành phần người ngồi ghế thay đổi (kể cả khi phòng đang `FINISHED`), phòng chuyển về `WAITING` và trạng thái *Sẵn sàng* của cả hai bên **reset về chưa sẵn sàng**; sau đó theo `Quyết định 2.3` (Sẵn sàng + đếm ngược 3 giây).
     * Người xem không tự ngồi vào ghế trống (tránh tranh ghế).
     * **Host luôn là người đang ngồi ghế**: Host không tự chuyển mình sang người xem (nút bị ẩn). Muốn nhường phòng thì Host rời phòng để quyền Host chuyển cho người còn lại (`Quyết định 2.3` mục 4).
  5. **Khoá phòng (`LOCKED`):** Chỉ bật được khi đã đủ 2 người chơi (trước đó nút `DISABLED` kèm tooltip *"Chỉ khoá được khi đã đủ 2 người chơi"*). Khoá rồi thì **không ai mới vào được**, dù có link, mã hay QR. Người đang có ghế hoặc đang xem mà mất mạng vẫn vào lại được (người chơi trong 60 giây theo `Quyết định 8.3`, người xem trong 5 phút); quá hạn thì coi như người mới.
  6. **Giữ khoá khi thiếu ghế (duyệt 04/10):** Phòng đã `LOCKED` mà mất một người ngồi ghế vẫn giữ `LOCKED`; Host chủ động mở lại để nhận người mới hoặc mời người xem hiện có xuống ghế. Điều kiện đủ hai người chỉ là điều kiện **bật** khoá, không phải tự động mở khoá khi một người rời.
  7. **Ví dụ minh hoạ** (A, B, C, D là người trong nhóm, E là người ngoài; mục tiêu A đấu C): A tạo phòng và gửi link/mã cho nhóm. B vào trước nên được xếp ngay vào ghế đấu, nhưng B chỉ muốn xem nên chọn chuyển sang người xem (hoặc A chuyển B). C vào thì ngồi ghế đấu, hai bên Sẵn sàng và đấu. D vào lúc đang đấu nên làm người xem cùng B. A thấy đủ người thì khoá phòng; E có link hay mã cũng không vào được. Đấu xong, A rời: phòng vẫn mở, C thành Host, C mời B xuống ghế, B chấp nhận rồi hai bên Sẵn sàng để đấu tiếp (`Quyết định 2.3` mục 8).

## PHẦN 3: BÀN CỜ & LUẬT THI ĐẤU (Yêu cầu 4 & 5)

### Quyết định 3.1: Thuần chữ Hán truyền thống cho mặt quân cờ
* **Lựa chọn đã chốt:** **[5A] Giữ nguyên 100% quân cờ chữ Hán truyền thống (No Latin/Vietnamese letters)**
* **Mô tả nghiệp vụ:**
  * Giữ nguyên thiết kế quân cờ gỗ khắc chữ Hán cổ điển theo 7 cặp quân:
    * Đỏ (Red): 帥 (Tướng), 仕 (Sĩ), 相 (Tượng), 俥 (Xe), 傌 (Mã), 炮 (Pháo), 兵 (Binh).
    * Đen (Black): 將 (Tướng), 士 (Sĩ), 象 (Tượng), 車 (Xe), 馬 (Mã), 砲 (Pháo), 卒 (Tốt).
  * Không đưa tùy chọn chữ Tiếng Việt vào mặt quân cờ để giữ vững phong cách thẩm mỹ cổ điển trang nhã và đồng nhất bộ SVG nguyên mẫu.
  * Hỗ trợ chuẩn trợ năng `DT-21` (WCAG 2.1 AA): Đi kèm viền bao quanh phân biệt bên, nhãn văn bản trạng thái hiển thị rõ ràng cho người dùng khiếm thị/mù màu.

---

### Quyết định 3.2: Giới hạn tối đa 3 lần Xin đi lại (Undo) trong một ván
* **Lựa chọn đã chốt:** **[6B] Giới hạn tối đa 3 lần được chấp thuận Undo mỗi bên trong một ván đấu**
* **Phạm vi PO chốt 05/10:** Xin đi lại trong **phòng tự tạo và Đánh Thường ghép ngẫu nhiên** thuộc P2, cùng áp dụng luật dưới đây. Ranked cấm hoàn toàn; ván AI theo `Quyết định 6.3`.
* **Mô tả nghiệp vụ:**
  * Mỗi người chơi có thể gửi đề nghị Xin đi lại; **đối thủ có quyền Chấp nhận hoặc Từ chối, không bị bắt buộc chấp nhận**. Chỉ khi đối thủ chấp nhận thì hệ thống mới lùi nước theo `Quyết định 3.6`; mỗi bên tối đa **3 lần đi lại thành công/ván**.
  * Hệ thống ghi nhận số lần undo thành công trong trạng thái ván (`undo_count_red`, `undo_count_black`).
  * Khi một bên đã dùng hết 3 lần, nút **"Xin đi lại"** của bên đó sẽ chuyển sang trạng thái `DISABLED` kèm tooltip: *"Bạn đã sử dụng hết 3 lượt xin đi lại trong ván này"*.
  * **Trường hợp đề nghị bị từ chối:** Nếu đối phương bấm từ chối hoặc hết thời hạn chờ 30 giây không trả lời, lượt đó **không bị trừ** vào hạn mức 3 lần (chỉ tính khi undo thực sự thành công).
  * **Đã duyệt 03/10:** phạm vi lùi và quy tắc chống spam xem `Quyết định 3.6`.
* **Lợi ích thực tế:**
  * Triệt tiêu hành vi quấy rối, spam đề nghị undo làm gián đoạn tâm lý của đối thủ.
  * Bảo đảm tính nghiêm túc và nhịp độ thi đấu của ván cờ.

---

### Quyết định 3.3: Quy chuẩn vận hành trận đấu Online thời gian thực (Chi tiết Yêu cầu 5)
* **Lựa chọn đã chốt:** **[MATCH-CORE] 7 Trụ cột Vận hành Trận đấu Online qua Socket.IO có Thẩm quyền Máy chủ**
* **Mô tả nghiệp vụ:**
  1. **Thẩm quyền máy chủ tuyệt đối (`R06`):** Client chỉ gửi ý định đi cờ (`commandId`, `matchVersion`). Máy chủ kiểm tra 100% tính hợp lệ: cản chân Mã, mắt Tượng, ngòi Pháo, an toàn Tướng (cấm 2 tướng nhìn nhau, cấm tự chiếu). Lưu biên lai lệnh `room_command_receipts` chống trùng lệnh.
  2. **Bộ luật phân định Thắng / Thua / Hòa (`R07` / `DEC-019`):**
     * *Chiếu hết (`CHECKMATE`):* Thua.
     * *Bị vây khốn / Hết nước đi (`STALEMATE`):* Thua (`GR-END-01`).
     * *Lặp thế cờ 3 lần (`DRAW_REPETITION`):* Hòa tự động (`GR-END-02`, chỉ tính trên nhánh nước đi hiệu lực sau khi undo). Ngoại lệ (đã duyệt 03/10): lặp do chiếu liên tục và hòa do không ăn quân, xem `Quyết định 3.5`.
     * *Đầu hàng (`RESIGN`):* Thua ngay.
     * *Xin hòa (`DRAW_AGREEMENT`):* Đợi đối phương xác nhận trong 30s.
  3. **Đồng hồ thi đấu & Xử lý hết giờ (`R08`):** Chạy trên máy chủ (phòng tự tạo: Không giới hạn, 5p, 10p, 15p theo phân kỳ; ghép ngẫu nhiên Đánh Thường: cố định 15p; Ranked: cố định 10p). Không cộng giây. Hết giờ xử thua (`TIMEOUT`). Ưu tiên tính giờ trước khi xét duyệt nước đi (`ARCH-04`).
  4. **Mất kết nối & Xử lý Rage Quit (`R09` / `EC-03`):** Ân hạn 60s. Quá 60s xử thua (`DISCONNECT`). Trong ván Ranked bị phạt trừ Elo bình thường, đối thủ được cộng Elo. Lỗi sập server toàn cục: ván `INTERRUPTED` (**không có người thắng và không phải hòa**) giữ nguyên Elo (`ARCH-10`; xem `Quyết định 7.3`).
  5. **Chống treo ván (`R17`):** Ván không giới hạn giờ, sau 3 phút không đi cờ $\rightarrow$ hiện prompt hỏi $\rightarrow$ đếm lùi 30 giây $\rightarrow$ xử thua nếu im lặng (`INACTIVITY`). **Đã chốt (rà soát cuối):** mục tiêu là phát hiện người bỏ đi, nên áp dụng cho **bên đang tới lượt**. Bấm *"Tôi còn đây"* đặt lại bộ đếm 3 phút, nhưng **tối đa 2 lần liên tiếp mà chưa có nước đi mới**; lần thứ 3 không còn nút, hết 30 giây là xử thua.
  6. **Thao tác trong ván & Undo (`R13` / `EC-01`):** Ván Ranked **tuyệt đối cấm Undo**. Phòng tự tạo và ghép ngẫu nhiên có Xin đi lại P2 theo 3.2 và 3.6. Dùng cây nước đi `match_moves` lùi con trỏ `current_move_id`, không hoàn lại thời gian đã trôi.
  7. **Tái đấu (`R14`) — sửa 07/10:** phòng tự tạo về `WAITING` ngay sau ván theo Phần 0 mục 0.7; Tái đấu P2 có lựa chọn Giữ phe/Đổi phe theo 0.8. Nội dung cũ dưới đây chỉ còn áp cho ghép ngẫu nhiên và Đánh Hạng: Kết thúc ván, phòng giữ trạng thái `FINISHED` tối đa 10 phút; hết hạn mà vẫn ở `FINISHED` thì đóng phòng và đưa người còn lại về Sảnh (duyệt 04/10). Trong phòng tự tạo và ghép ngẫu nhiên, cả hai cùng đồng ý Tái đấu (P2) $\rightarrow$ tạo ván mới (`new Match ID`) và tự động hoán đổi bên Đỏ $\leftrightarrow$ Đen theo 2.3. Phòng Đánh Hạng không có Tái đấu (`Quyết định 7.2`); quy tắc sau ván ghép ngẫu nhiên theo 2.0.

---

### Quyết định 3.4: Cơ chế tương tác bàn cờ (Click & Drag-Drop), Hiệu ứng thị giác và Âm thanh Web Audio API (Chi tiết Yêu cầu 4)
* **Lựa chọn đã chốt:** **[BOARD-INTERACTION] Hỗ trợ song song 2 cơ chế đi cờ (Click-to-Move & Kéo thả Drag-Drop); Hiệu ứng thị giác chỉ dẫn đầy đủ; Tích hợp âm thanh Web Audio API kèm nút Mute**
* **Mô tả nghiệp vụ:**
  1. **Thao tác điều khiển quân cờ linh hoạt (Hỗ trợ 2 phương thức):**
     * **Phương thức 1 (Click-to-Move):**
       * Click chuột (hoặc chạm cảm ứng) vào quân cờ của mình $\rightarrow$ Quân cờ được chọn hiển thị vòng sáng (Active ring).
       * Bàn cờ lập tức kích hoạt hiển thị các chấm tròn gợi ý (màu và hình dạng theo `DESIGN.md` §7.4) tại tất cả các giao điểm được phép đi tới.
       * Click vào một giao điểm hợp lệ $\rightarrow$ Quân cờ di chuyển và hạ cờ tại ô đích.
       * Hủy chọn: Click lại chính quân cờ đó, hoặc click vào một ô trống bất kỳ không hợp lệ, hoặc bấm phím `Escape`.
     * **Phương thức 2 (Kéo thả Drag & Drop):**
       * Nhấp giữ chuột (hoặc chạm giữ tay trên màn hình điện thoại) để kéo quân cờ bay theo con trỏ chuột/ngón tay.
       * Thả quân cờ vào giao điểm hợp lệ $\rightarrow$ Hạ cờ thành công.
       * Thả vào vị trí không hợp lệ $\rightarrow$ Quân cờ tự động trượt mượt mà (smooth snap-back animation) quay trở về vị trí xuất phát ban đầu.
  2. **Hiệu ứng thị giác chỉ dẫn trên bàn cờ (Visual Guides):**
     * *Gợi ý nước đi hợp lệ:* Khi một quân cờ được chọn, hiển thị các chấm tròn nhỏ tại tất cả các giao điểm mà quân đó ĐƯỢC PHÉP ĐI. Nếu ô đích đang có quân cờ của đối thủ có thể ăn được, hiển thị vòng tròn viền **cố định (không nhấp nháy)** bao quanh quân cờ đối phương đó.
     * *Đánh dấu nước đi vừa diễn ra (Last Move Highlight):* Đánh dấu bằng 4 góc vuông tại ô xuất phát và ô đích của nước cờ vừa đi gần nhất để cả người chơi và người xem dễ dàng theo dõi diễn biến ván đấu.
     * *Cảnh báo Chiếu tướng (Check Highlight):* Khi một bên bị Chiếu tướng, ô của quân Tướng bị chiếu sẽ hiện vòng cảnh báo quanh Tướng kèm dòng chữ "Đang bị chiếu" và biểu tượng cảnh báo. **Quyết định 03/10:** không nhấp nháy, không rung, không lặp vô hạn (theo `DESIGN.md` §4); tối đa một nhịp sáng lên duy nhất khi vừa bị chiếu, và tắt hẳn khi người dùng bật giảm chuyển động. **Màu, hình dạng, độ dày của mọi dấu hiệu trên bàn cờ chỉ định nghĩa ở `DESIGN.md` §7.4**, BA chỉ quy định ý nghĩa.
  3. **Hệ thống Âm thanh cờ tướng (Web Audio API):**
     * Tích hợp bộ âm thanh trực tiếp qua Web Audio API (tạo âm sắc cờ gỗ tự nhiên, nhẹ, không phụ thuộc vào việc tải file MP3 nặng từ server):
       1. 🔊 **Tiếng gõ cờ (`Move sound`):** Âm thanh tiếng gỗ cộp đanh giòn khi hạ quân cờ xuống mặt bàn gỗ.
       2. 💥 **Tiếng ăn quân (`Capture sound`):** Âm thanh va chạm gỗ mạnh mẽ, dứt khoát khi bắt quân đối phương.
       3. ⚠️ **Tiếng chuông Chiếu tướng (`Check alert`):** Âm thanh cảnh báo sắc gọn báo hiệu Tướng đang bị uy hiếp.
       4. 🎺 **Tiếng còi kết thúc ván (`End Game sound`):** Âm hưởng chiến thắng hoặc thất bại khi có kết quả ván đấu.
     * **Nút Bật / Tắt âm thanh (Mute / Unmute Toggle):** Bố trí một biểu tượng loa nhỏ ngay góc trên của bàn cờ thi đấu, cho phép người chơi bật hoặc tắt âm thanh bất kỳ lúc nào với 1 chạm.

---

### Quyết định 3.5 (đã duyệt 03/10): Luật bổ sung — chiếu liên tục, không ăn quân, giới hạn xin hòa
* **Phạm vi bộ luật:** Dự án dùng **bộ luật rút gọn** do chính tài liệu này định nghĩa (luật di chuyển chuẩn cờ tướng + các luật kết thúc ván ở `Quyết định 3.3` và 3.5). Định nghĩa lặp thế, chu kỳ lặp và thứ tự ưu tiên kết quả chốt ở **Phần 0 mục 0.12** (08/10); chiếu hết thắng mọi kết quả hòa. Điểm khác với luật thi đấu chính thức được công bố ở mục Luật chơi (10.4).
* **Lựa chọn đã chốt:** **[RULES-EXTRA] Chiếu liên tục xử thua bên chiếu; hòa khi 120 nửa nước không ăn quân; hạn chế xin hòa lặp**
* **Mô tả nghiệp vụ:**
  1. **Chiếu liên tục (perpetual check):** Khi một thế cờ lặp lần thứ 3 mà **mọi nước đi của một bên trong chu kỳ lặp đều là nước chiếu** (bên kia không chiếu) thì **bên chiếu liên tục bị xử THUA** (lý do `PERPETUAL_CHECK`). Nếu **cả hai bên** cùng chiếu liên tục thì xử Hòa.
  2. **Đuổi quân liên tục (perpetual chase):** **Không xử riêng trong cả P1/P2** (đã duyệt Giai đoạn 2 ngày 03/10). Lặp thế do đuổi quân xử Hoà theo lặp ba lần; khác biệt được công bố theo 10.4. Không tự bổ sung luật đuổi quân vào P2.
  3. **Hòa do không ăn quân:** Sau **120 nửa nước liên tiếp** (mỗi bên 60 nước) không có nước ăn quân thì xử Hòa tự động (`DRAW_NO_CAPTURE`). Con số đã được xác nhận ở Giai đoạn 2 ngày 03/10/2026. **Ưu tiên (PO duyệt 09/10, 0.17):** chiếu hết ưu tiên cao nhất; hết nước đi hoặc chiếu liên tục gây thắng/thua trên cùng nước được ưu tiên trước hoà do đủ 120 nửa nước.
  4. **Xin hòa (`DRAW_AGREEMENT`):** Hạn trả lời 30 giây. Bên bị từ chối **không được xin hòa lại trong 5 nước kế tiếp của chính mình**; nút `DISABLED` kèm tooltip nêu số nước còn phải chờ. Quy tắc riêng cho Đánh Hạng xem `Quyết định 7.2`.
  5. **Lý do kết thúc ván** hiển thị ở `MODAL-MATCH-RESULT` gồm: `CHECKMATE`, `STALEMATE`, `RESIGN`, `TIMEOUT`, `DISCONNECT`, `INACTIVITY`, `DRAW_REPETITION`, `DRAW_AGREEMENT`, `DRAW_NO_CAPTURE`, `PERPETUAL_CHECK`, `INTERRUPTED`.

### Quyết định 3.6 (đã duyệt 03/10): Đề nghị trong ván — phạm vi Xin đi lại và chống spam
* **Lựa chọn đã chốt:** **[PROPOSALS] Lùi về trước nước gần nhất của người xin; mỗi người một đề nghị đang chờ; từ chối/hết hạn thì chờ 3 nước**
* **Mô tả nghiệp vụ:**
  1. **Xin đi lại trong phòng tự tạo và ghép ngẫu nhiên lùi bao nhiêu (P2):** Lùi về **trước nước gần nhất của người xin**. Nếu đối thủ đã đi tiếp thì lùi **2 nước**, nếu chưa thì lùi **1 nước**. Chỉ xin được sau khi người xin đã đi ít nhất 1 nước. Trong lúc chờ trả lời, người xin **không đi được nước mới**. Đồng hồ **không hoàn lại**.
  2. **Một đề nghị đang chờ:** Mỗi người chỉ có **1 đề nghị đang chờ** cùng lúc (Xin hòa, Xin đi lại, Xin đổi bên) và được **rút lại** bất cứ lúc nào.
  3. **Chờ trước khi gửi lại:** Đề nghị bị từ chối hoặc hết hạn 30 giây thì người gửi phải chờ **3 nước của mình** mới gửi lại **cùng loại** (Xin hòa giữ mức 5 nước của `Quyết định 3.5`). Xin đổi bên chờ **60 giây**.
  4. Lượt Xin đi lại chỉ bị trừ khi đối thủ đồng ý (`Quyết định 3.2`).
  5. **Khung đề nghị trong ván (duyệt 04/10):** Xin hòa/Xin đi lại dùng khung **không modal**, không giữ focus và không chặn bàn cờ. Đồng hồ tiếp tục chạy. X/Esc chỉ thu gọn, không từ chối; có nút mở lại và hạn trả lời vẫn chạy. Chỉ nút Từ chối tạo phản hồi từ chối; người gửi có Rút đề nghị. Quyền đi cờ không đổi, riêng người đang xin đi lại vẫn bị chặn đi nước mới theo mục 1. Hết hạn/kết thúc ván đóng đề nghị; phản hồi đến sau không đổi kết quả ván.

---

## PHẦN 4: CHẾ ĐỘ PHÒNG & NGƯỜI XEM (Yêu cầu 6)

### Quyết định 4.1: Quyền hạn Người xem — Tuyệt đối không cấp quyền phát Micro/Camera
* **Lựa chọn đã chốt:** **[7A] Người xem chỉ Xem/Nghe (Subscribe-only) và Chat Text tại Kênh Chung**
* **Mô tả nghiệp vụ:**
  * Người xem (Spectator) khi vào phòng chỉ đóng vai trò người tiêu thụ luồng (Consumer/Subscriber):
    * Được xem Face cam và nghe giọng nói của 2 người chơi (nếu người chơi chọn mức chia sẻ *"Cả đối thủ và người xem"*).
    * Được gửi và nhận tin nhắn văn bản tại **Kênh Chung (`ROOM_PUBLIC`)**.
    * **Tuyệt đối không có tính năng bật Micro hoặc Camera:** Giao diện của Người xem không xuất hiện các nút bật mic/cam, và máy chủ LiveKit không cấp quyền phát (Publish permission) cho token của Người xem (`canPublish: false`, `canPublishData: false`).
  * **Ba mức chia sẻ camera/mic trong phòng tự tạo** (chọn riêng từng người chơi; **một mức chia sẻ áp chung cho camera và mic đang bật**; camera và mic **bật/tắt độc lập** nhau (PO làm rõ 04/10/2026); camera/mic mặc định **Tắt**): **(1) Không chia sẻ** · **(2) Chỉ đối thủ** · **(3) Cả đối thủ và người xem**. **Phòng tự tạo — PO duyệt 05/10:** mức chọn sẵn là **Chỉ đối thủ**, độc lập với trạng thái camera/mic mặc định Tắt; muốn người xem thấy/nghe thì người chơi chủ động chọn mức (3). Ghép ngẫu nhiên Đánh Thường và Ranked không có người xem nên chỉ có mức (1) và (2). Media chỉ được truyền trực tiếp, **không ghi hình, không ghi âm, không lưu**.
* **Lý do nghiệp vụ & kỹ thuật:**
  * Giữ không gian thi đấu tĩnh lặng, tập trung cho 2 người chơi cờ tướng; ngăn chặn triệt để hành vi "nhắc cờ", bình luận khiêu khích hoặc bật tiếng ồn gây rối bằng giọng nói.
  * Tối ưu hóa tối đa băng thông máy chủ LiveKit SFU (chỉ cần chuyển tiếp 2 luồng phát của người chơi tới tối đa 5 người xem).

---

### Quyết định 4.2: Quyền "Đuổi người xem" (Kick Spectator) — Trao quyền cho CẢ HAI NGƯỜI CHƠI
* **Lựa chọn đã chốt:** **[8B] Cả Chủ phòng (Host) và người chơi còn lại (không phải Host) đều có quyền Đuổi người xem; Chặn đến khi phòng đóng**
* **Mô tả nghiệp vụ:**
  * Trong phòng tự tạo, tại Danh sách người xem (`PANEL-SPECTATORS` ở thanh bên), **cả Chủ phòng (Host) và người chơi còn lại (không phải Host)** đều nhìn thấy nút **"Kick"** (hoặc biểu tượng gạch đỏ) bên cạnh tên mỗi người xem.
  * Khi một trong hai người chơi bấm nút "Kick" một người xem quấy rối:
    1. Hệ thống hiển thị modal xác nhận (`MODAL-CONFIRM-KICK`): *"Bạn có chắc chắn muốn đuổi người xem [Tên] ra khỏi phòng thi đấu không?"*.
    2. Sau khi xác nhận: Máy chủ lập tức ngắt kết nối Socket.IO, hủy token LiveKit của người xem đó, đẩy văng ra Sảnh chính kèm thông báo: *"Bạn đã bị đuổi khỏi phòng thi đấu"*.
    3. Ghi nhận bản ghi vào bảng `room_blocks (room_id, blocked_user_id, created_at)`.
    4. **Thời hạn chặn:** Người bị đuổi bị chặn vĩnh viễn không thể quay lại phòng này (kể cả có link mời mới hay mã 8 ký tự) cho đến khi phòng cờ kết thúc chu kỳ sống và đóng hoàn toàn (`status = CLOSED`).
* **Giới hạn (đã duyệt 03/10):** Người bị đuổi có thể quay lại bằng một **phiên Khách mới** (danh tính mới) nếu phòng chưa khoá; không chặn tuyệt đối được. Đây là giới hạn chấp nhận được; khoá phòng (`Quyết định 2.8`) để chặn hẳn.
* **Lợi ích thực tế:** Trao quyền bình đẳng cho cả 2 người chơi tự bảo vệ không gian tập trung của mình trước các hành vi quấy rối, chat toxic của người xem.

---

### Quyết định 4.3: Đổi chế độ phòng trong lúc chơi & Xem cờ Thời gian thực 100% (Không Delay)
* **Lựa chọn đã chốt:** **[ROOM-PRIVACY-REALTIME] Đổi chế độ phòng linh hoạt (giữ người xem cũ, chặn người mới, cho phép kick); Người xem theo dõi thời gian thực 100% không delay**
* **Mô tả nghiệp vụ:**
  1. **Đổi chế độ phòng trong lúc đang chơi (Dynamic Privacy Change):**
     * Trong **phòng tự tạo**, Chủ phòng chuyển giữa `PUBLIC`, `CODE_ONLY` và `LOCKED` bất kỳ lúc nào kể cả khi ván đang diễn ra. `LOCKED` chỉ bật được khi đã đủ hai người chơi (`Quyết định 2.8`). `PUBLIC` hiện trong danh sách Sảnh; `CODE_ONLY` và `LOCKED` không hiện. Chuyển khỏi `PUBLIC` phải cập nhật danh sách; yêu cầu Vào xem đang chờ phải kiểm lại quyền tại máy chủ.
     * Khi Chủ phòng chuyển sang **`LOCKED` (Khóa phòng):** (chỉ bật được khi đã đủ 2 người chơi; người đang có ghế/đang xem mất mạng vẫn vào lại được, xem `Quyết định 2.8` mục 5)
       * Phòng vẫn không xuất hiện trong danh sách công khai tại Sảnh.
       * Máy chủ chặn toàn bộ các yêu cầu tham gia mới từ bên ngoài.
       * **Thu hồi mã/link/QR:** Mọi link, QR, mã 8 ký tự và lời mời bạn bè **chưa được dùng** bị vô hiệu ngay. Khi Host mở lại `CODE_ONLY` hoặc `PUBLIC`, hệ thống **sinh mã và link mới**; bản cũ không dùng lại được. Người đang trong phòng giữ nguyên quyền xem/nghe, nên không bị thu token media. Người đã rời phòng muốn vào lại dùng mã/link mới hoặc Vào xem tại Sảnh nếu phòng đã mở PUBLIC; luôn kiểm quyền và sức chứa hiện tại.
       * **Xử lý người xem hiện tại:** **Người xem đang có sẵn trong phòng vẫn được giữ lại tiếp tục theo dõi ván cờ bình thường**. Nếu người chơi muốn loại bỏ ai thì có thể dùng tính năng "Kick" để đuổi đích danh người đó.
  2. **Người xem theo dõi cờ Thời gian thực 100% (Không áp dụng Spectator Delay):**
     * Nước đi trên bàn cờ được đồng bộ tức thời đến màn hình của người xem qua Socket.IO (độ trễ dưới 100ms).
     * Không áp dụng cơ chế hoãn giờ (delay 5–10s) vì phòng Casual chủ yếu phục vụ giao lưu bạn bè học hỏi; ván Đánh Hạng (Ranked) đã cấm tuyệt đối 100% người xem nên không phát sinh rủi ro gian lận rank.

## PHẦN 5: CHAT & MEDIA (Yêu cầu 7)

### Quyết định 5.1: Bổ sung bộ Sticker / Biểu tượng cảm xúc nhanh trong Chat
* **Lựa chọn đã chốt:** **[9B] Thêm khay Sticker / Emoticon cảm xúc nhanh (12 biểu tượng)**
* **Mô tả nghiệp vụ:**
  * Tại khung chat của cả Kênh Riêng (`PLAYERS_PRIVATE`), Kênh Chung (`ROOM_PUBLIC`) và Chat riêng 1-1, bổ sung nút mở khay **"Cảm xúc nhanh"**.
  * Cung cấp sẵn bộ 12 biểu tượng tương tác tức thì mang tính giải trí và đặc trưng cờ tướng:
    1. 👏 *Nước cờ hay (Vỗ tay)*
    2. ❤️ *Thả tim / Yêu thích*
    3. 🤔 *Đang suy ngẫm kỹ*
    4. 😅 *Toát mồ hôi / Nguy hiểm*
    5. 😭 *Khóc ròng / Mất quân oan*
    6. 🍵 *Uống trà / Bình tĩnh hạ cờ*
    7. ⚡ *Nhanh tay lên nào*
    8. 🤐 *Cạn lời / Đứng hình*
    9. 👍 *Đồng ý / Chấp nhận*
    10. 🤝 *Giao lưu vui vẻ*
    11. 🏳️ *Đầu hàng tâm phục*
    12. 🔥 *Trận đấu kịch tính*
  * Người chơi hoặc người xem chỉ cần bấm 1 chạm để gửi ngay mà không mất thời gian gõ chữ.
* **Cơ chế kỹ thuật:** Tin nhắn dạng shortcode (VD: `:tea:`, `:clap:`), lưu chuỗi trong bảng `chat_messages`, giao diện render icon SVG mượt mà.

---

### Quyết định 5.2: Bổ sung tính năng Chat riêng ngoài phòng thi đấu (Direct Messaging / 1-1 Chat)
* **Lựa chọn đã chốt:** **[9C - Bổ sung / R21] Nhắn tin riêng 1-1 chỉ giữa những người ĐÃ LÀ BẠN BÈ (`status = ACCEPTED`)**
* **Mô tả nghiệp vụ:**
  * Cho phép hai người dùng đã kết bạn chính thức trò chuyện nhắn tin riêng 1-1 mọi lúc ngoài phòng đấu.
  * Hỗ trợ lưu trữ lịch sử tin nhắn, chỉ báo tin nhắn chưa đọc (Unread badge) trên thanh điều hướng, phân quyền RLS an toàn trong CSDL (`direct_conversations`, `direct_messages`).
  * **Đọc và badge (duyệt 04/10):** badge là **tổng số tin đến chưa đọc** từ các bạn hiện tại, không tính tin mình gửi. Tin thành đã đọc khi hiển thị trong **vùng nhìn của hội thoại ở tab đang hoạt động**; chỉ tải ngầm hoặc mở tab nền không đủ. Máy chủ lưu và đồng bộ trạng thái đọc giữa các thiết bị. Huỷ bạn loại hội thoại khỏi badge nhưng giữ trạng thái đọc; kết bạn lại tính lại các tin vẫn chưa đọc, không tự coi đã đọc hoặc làm tin đã đọc thành chưa đọc.

---

### Quyết định 5.3: Quy tắc Tab Chat mặc định & Bộ lọc từ ngữ thô tục (Bad Word Filter)
* **Lựa chọn đã chốt:** **[CHAT-FILTER-TAB] 2 Người chơi mặc định mở Kênh Riêng; Người xem chỉ thấy Kênh Chung; Bộ lọc che từ cấm bằng dấu sao `***`**
* **Mô tả nghiệp vụ:**
  1. **Quy tắc Tab Chat mặc định khi vào phòng thi đấu:**
     * **Đối với 2 Người chơi (Players):** **Kênh Riêng** (`PLAYERS_PRIVATE`) vẫn là kênh mặc định để chào hỏi, giao lưu trực tiếp. **Bố cục phòng tự tạo theo thiết bị (PO chốt 05/10/2026, phương án B):** trên máy tính, **mặc định chỉ mở Kênh Riêng, Kênh Chung chưa mở** (PO chốt 05/10, phương án 5A); người chơi tự mở thêm Kênh Chung để xem đồng thời hai khung `[Kênh Riêng]` và `[Kênh Chung]` (`ROOM_PUBLIC`), hoặc ẩn bớt một trong hai rồi mở lại; trên điện thoại, hai kênh nằm trong một khung và chuyển bằng tab, mặc định chọn `[Kênh Riêng]`. Ẩn khung chỉ thay đổi hiển thị, không thay đổi quyền đọc/gửi. Ghép ngẫu nhiên Đánh Thường và Đánh Hạng chỉ có Kênh Riêng, không Kênh Chung/người xem.
     * **Đối với Người xem (Spectators):** Người xem không có quyền xem hay gửi tin vào Kênh Riêng, nên giao diện khung chat của người xem **chỉ hiển thị duy nhất tab `[Kênh Chung]`**.
  2. **Bộ lọc từ ngữ thô tục / xúc phạm (Bad Word Filter):**
     * Tích hợp bộ lọc từ ngữ nhạy cảm, thô tục và công kích cá nhân phổ biến (tiếng Việt & tiếng Anh).
     * Mọi tin nhắn gửi đi ở bất kỳ kênh nào (Kênh riêng, Kênh chung, Chat 1-1 bạn bè) nếu chứa từ ngữ trong danh sách đen sẽ **tự động được máy chủ và client che bằng các ký tự dấu sao `***`** (ví dụ: *"đánh cờ như ***"*).
     * Bảo đảm không gian văn hóa cờ tướng lành mạnh, văn minh, tránh các sự cố phản cảm khi biểu diễn đồ án trước hội đồng.
     * **Danh sách và cách lọc:** Danh sách từ cấm do **nhóm dự án duy trì** trong một tệp cấu hình riêng (không sửa trực tiếp trong cơ sở dữ liệu). Khi so khớp, hệ thống chuẩn hoá trước: bỏ dấu tiếng Việt, đưa về chữ thường, bỏ khoảng trắng và ký tự đặc biệt chèn giữa chữ, đổi các ký tự thay thế phổ biến (ví dụ `0`→`o`, `1`→`i`). Bộ lọc này dùng chung cho tin nhắn chat, username khi đăng ký (0.17), Display Name, tên Khách và tên phòng (các trường tên chứa từ cấm bị **từ chối** thay vì che `***`).
     * **Giới hạn chat:** Mỗi tin tối đa **200 ký tự**; tối đa **5 tin trong 10 giây** mỗi người, vượt thì báo *"Bạn gửi quá nhanh"*. Chat phòng **xoá khi phòng đóng**, không lưu sau đó. **Đã duyệt 03/10:** Kênh Riêng chỉ hiện cho 2 người đang ngồi ghế, cặp người chơi mới không đọc được tin của cặp cũ; người xem mới chỉ thấy tin Kênh Chung từ lúc vào. Chat 1-1 giữa bạn bè lưu theo `Quyết định 5.5` (huỷ kết bạn thì ẩn, kết bạn lại thì hiện lại).
     * **Chat cùng cặp người chơi — P1 cho Đổi bên và chơi tiếp theo 0.7/0.13; Tái đấu là P2:** cùng hai người chơi chỉ đổi Đỏ/Đen hoặc Tái đấu trong cùng phòng thì vẫn đọc được chat riêng trước đó. Mốc hình thành cặp người chơi tách khỏi mốc đổi màu quân; thay một người trong cặp thì đặt mốc mới, cả cặp mới không đọc được chat của cặp cũ. Phòng đóng vẫn xoá chat theo luật hiện có; không mở quyền đọc cho người xem.

---

### Quyết định 5.4: Camera, Mic & Chat trong Ván Đánh Hạng (Ranked Media Policy)
* **Lựa chọn đã chốt:** **[RANKED-MEDIA] Mở đầy đủ cả Camera, Mic và Chat Text cho 2 người chơi; Tùy 2 bên tự quyết định Bật/Tắt**
* **Mô tả nghiệp vụ:**
  * Trong ván Đánh Hạng (Ranked), do đã khóa kín 100% người xem (không có người xem), ván đấu chỉ có duy nhất 2 người chơi.
  * **Hệ thống cho phép mở cả Camera, Mic và Chat Text:**
    * Hai người chơi được toàn quyền tự do bấm Bật hoặc Tắt Camera và Mic của mình để nhìn mặt giao lưu đối thủ nếu muốn (mặc định vào phòng vẫn là TẮT để bảo đảm quyền riêng tư ban đầu).
    * Khung chat hiển thị Kênh Riêng duy nhất giữa 2 người, hỗ trợ nhắn tin và gửi 12 sticker cảm xúc nhanh kèm bộ lọc từ cấm `***`.

  * **Bảo vệ người nhận (người lạ trong Ranked):** Hình và tiếng của đối thủ ở phía người nhận **mặc định ẨN** trong ván Đánh Hạng cho đến khi người nhận bấm *"Hiện hình/tiếng đối thủ"*; mọi lúc đều có nút **"Tắt ngay"** để ẩn lại tức thì. Ở Đánh Thường mặc định hiện. Đây là cách xử lý nội dung không phù hợp trong phạm vi này, vì **không có chức năng Báo cáo vi phạm hay quản trị viên** (`Phần 10`).

---

### Quyết định 5.5: Hệ thống Bạn bè & Thông báo
* **Lựa chọn đã chốt:** **[FRIENDS] Kết bạn hai chiều theo username; trạng thái online/đang đấu; không có chức năng Chặn riêng**
* **Mô tả nghiệp vụ:**
  1. **Tìm & gửi lời mời:** Chỉ tài khoản chính thức mới có Bạn bè. Tìm theo `username` (tiền tố, không phân biệt hoa thường). Kết bạn là **hai chiều**: gửi lời mời $\rightarrow$ bên kia **Chấp nhận** hoặc **Từ chối**. Người gửi có thể thu hồi lời mời. Lời mời chờ tự hết hạn sau **30 ngày**.
  2. **Giới hạn:** Tối đa **200 bạn** và **50 lời mời đang chờ** mỗi tài khoản; 50 là **tổng gửi + nhận** (duyệt 04/10). Hai yêu cầu ngược chiều đồng thời chỉ giữ **một lời mời**, không tự thành bạn; bên nhận phải Chấp nhận. Nếu một người bị **cùng một người nhận từ chối 2 lần** thì không gửi lại được lời mời cho người đó (chống quấy rối); đây là cách thay cho chức năng Chặn.
  3. **Huỷ kết bạn:** Hai bên mất quyền nhắn tin 1-1 ngay. Lịch sử tin nhắn **được giữ nhưng ẩn**, hiện lại nếu kết bạn lại.
  4. **Trạng thái:** 🟢 Online (có kết nối hoạt động) · 🟠 Đang đấu (đang ngồi ghế trong ván/phòng) · ⚫ Offline. Chỉ trạng thái 🟢 mới nhận được lời mời vào phòng (`Quyết định 2.5`).
  5. **Thông báo:** Icon chuông liệt kê lời mời kết bạn đang chờ; huy hiệu **tin chưa đọc** hiện trên mục Bạn bè. Lời mời vào phòng là pop-up 30 giây, không lưu lại trong chuông.
  6. **Hồ sơ người khác:** Không có trang hồ sơ công khai riêng. Bấm vào tên một người ở bảng xếp hạng, kết quả tìm kiếm hoặc thẻ đối thủ chỉ hiện thẻ tóm tắt (Avatar, Display Name, `@username`, Elo, cấp bậc, thắng/thua/hòa) cùng nút **"Kết bạn"**; nút "Nhắn tin" chỉ hiện khi đã là bạn (`Quyết định 8.2`).

## PHẦN 6: CHƠI VỚI MÁY AI (Yêu cầu 8)

### Quyết định 6.1: Không triển khai tính năng Gợi ý nước đi (No Hint)
* **Lựa chọn đã chốt:** **[10A] Không làm tính năng Gợi ý nước đi (No Move Hinting)**
* **Mô tả nghiệp vụ:**
  * Giữ đúng phạm vi thi đấu đối kháng thuần túy giữa người và máy.
  * Engine AI chỉ tính toán nước đi cho bên quân cờ do máy điều khiển theo 3 cấp độ đã định hình:
    * *Dễ (Easy):* Depth 2, thời gian phản hồi $\le 300$ ms.
    * *Trung bình (Medium):* Depth 4, thời gian phản hồi $\le 1000$ ms.
    * *Khó (Hard):* Depth 6, thời gian phản hồi $\le 3000$ ms.
  * **Lý do:** Giữ kiến trúc giao diện đơn giản, tập trung toàn lực cho AI vượt qua cổng kiểm định chất lượng (cách đo: GATE-ENGINE, US-08.3 trong BACKLOG-P1.md) và chạy ở tiến trình tách biệt khỏi máy chủ chính.
  * **Mục tiêu cảm nhận (không ràng buộc, đo bằng đấu máy với máy ở US-08.3):** Dễ — người mới học cờ thắng được; Trung bình — người chơi phổ thông thắng khoảng một nửa số ván; Khó — người chơi phổ thông hiếm khi thắng.
  * **Khi máy không kịp (đã chốt, rà soát cuối):** Hết ngân sách thời gian mà chưa đạt độ sâu mục tiêu thì máy đi **nước tốt nhất đã tìm được đến lúc đó** (tìm sâu dần, luôn có ít nhất một nước hợp lệ). Nếu tiến trình máy cờ **lỗi hoặc không phản hồi sau 10 giây**: ván chuyển "Bỏ dở", báo *"Máy cờ gặp sự cố"* kèm nút *Thử lại*. Con số đo thực tế theo cổng kiểm chứng GATE-ENGINE ở [BACKLOG-P1.md](BACKLOG-P1.md).
  * **Thử lại (duyệt 04/10):** Nếu chỉ hết thời gian chờ tiến trình (`ENGINE_BUSY`), Thử lại yêu cầu máy tìm nước trên **cùng ván và thế hiện tại**, không gửi lại nước của người chơi. Nếu ván đã `ABANDONED` do sự cố, Thử lại tạo **ván mới, Match ID mới**, cùng cấp độ và phe thực tế của ván cũ (phe Ngẫu nhiên đã bốc không bốc lại); không hồi sinh ván kết thúc. Mỗi lần bấm đang xử lý bị chặn trùng; kiểm lại quyền và một vị trí chơi trước khi tạo ván mới.

---

**Tiêu chí máy cờ bổ sung — PO duyệt và làm rõ 05/10:** **cấp Khó** phải giải đúng **100%** bộ thế chiếu hết 1 và 2 nước bắt buộc, đã xác minh đáp án; bộ mở rộng báo tỷ lệ riêng. Ngưỡng 100% này không áp cho cấp Dễ/Trung bình; hai cấp đó vẫn phải đạt nước đi hợp lệ, thời gian phản hồi và phân cấp sức mạnh đã chốt. Cách đo: GATE-ENGINE ở [BACKLOG-P1.md](BACKLOG-P1.md).

### Quyết định 6.2: Lưu trữ đầy đủ các ván đấu với AI vào Lịch sử người dùng
* **Lựa chọn đã chốt:** **[11B] Lưu ván đấu AI vào Lịch sử & Hỗ trợ Replay xem lại**
* **Mô tả nghiệp vụ:**
  * Khi người dùng có tài khoản thi đấu với máy và kết thúc ván (Thắng, Thua, Hòa, Đầu hàng):
    1. Ván cờ được lưu chính thức vào bảng CSDL `matches` và cây nước đi `match_moves`.
    2. Bổ sung trường đánh dấu `match_type = 'AI'` và `ai_difficulty = 'EASY' | 'MEDIUM' | 'HARD'`.
    3. Tại màn hình Lịch sử ván đấu (`SCR-HISTORY`), ván đấu hiển thị nhãn nổi bật:
       * 🤖 `[Đấu với Máy - Dễ]` / `[Đấu với Máy - Trung bình]` / `[Đấu với Máy - Khó]`.
    4. Người chơi có thể bấm vào xem lại (**Replay**) từng nước cờ, phân tích sai lầm để tự nâng cao trình độ.
* **Lợi ích thực tế:**
  * Giúp người chơi theo dõi được tiến trình rèn luyện cờ của bản thân theo thời gian.
  * Tận dụng tối đa giao diện Replay (`SCR-REPLAY`) đã được thiết kế sẵn.
* **Quyền xem lại, áp dụng mọi chế độ (đã duyệt 03/10):** Chỉ **2 người chơi của ván** xem lại từ Lịch sử; người xem không xem lại được; **không có link chia sẻ**; ván Ranked cũng riêng tư như vậy. Replay hiển thị chuỗi nước đi **hiệu lực**, không hiện các nước đã đi lại.
* **Đường dẫn Replay (PO chốt 05/10/2026, phương án A):** chỉ dùng `/history/:id`; mọi nút Xem lại dẫn tới đường này. Không triển khai đường dẫn thay thế `/rooms/:id/replay/:matchId`. Replay vẫn thuộc P2 và giữ nguyên quyền xem lại ở trên.

---

### Quyết định 6.3: Quy tắc Vận hành Ván cờ Đấu với Máy (Chọn phe, Giới hạn 3 lần Undo lùi 2 nước & Không giới hạn thời gian)
* **Lựa chọn đã chốt:** **[AI-MATCH-RULES] Tự chọn phe Đỏ/Đen/Ngẫu nhiên; Trần tối đa 3 lần Undo lùi 1 cặp nước đi; Không giới hạn thời gian thi đấu**
* **Mô tả nghiệp vụ:**
  1. **Lựa chọn phe cờ khi bắt đầu ván (`SCR-AI-GAME`):**
     * Trước khi vào trận, người chơi được lựa chọn 1 trong 3 phương án:
       * 🔴 **Cầm quân Đỏ:** Đi trước (người chơi đi nước khai cuộc đầu tiên).
       * ⚫ **Cầm quân Đen:** Đi sau (máy cờ cầm Đỏ sẽ tự động tính toán và đi nước cờ đầu tiên ngay khi vào bàn cờ, sau đó lật bàn cờ để Đen ở dưới).
       * 🎲 **Ngẫu nhiên:** Máy chủ tự động bốc thăm ngẫu nhiên tỷ lệ 50/50.
  2. **Cơ chế Xin đi lại (Undo) giới hạn tối đa 3 lần:**
     * Nhằm rèn luyện tính cẩn trọng khi đi cờ và chống lạm dụng "thử lại vô hạn", hệ thống áp dụng trần **tối đa 3 lần Undo trong một ván đấu với máy**.
     * **Cơ chế lùi nước đi chuẩn xác:** Khi người chơi bấm nút "Đi lại":
       * Máy chủ tự động lùi **1 cặp nước đi (2 plies: gồm 1 nước vừa đi của máy + 1 nước vừa đi của người chơi)** để trả lại quyền đi cho người chơi mà không cần máy "đồng ý".
       * (Nếu máy đang suy nghĩ nước đi mà người chơi bấm Undo, máy hủy tác vụ tìm kiếm hiện tại và lùi lại nước đi trước đó của người chơi).
     * Bàn cờ hiển thị bộ đếm trực quan: *"Lượt đi lại: X/3"*. Khi người chơi dùng hết 3 lượt, nút "Đi lại" sẽ chuyển sang trạng thái vô hiệu hóa (`DISABLED`).
     * **Trường hợp chưa có nước nào của người chơi:** Nếu người chơi cầm Đen và máy mới đi đúng 1 nước (hoặc ván chưa có nước nào của người chơi), nút "Đi lại" `DISABLED` kèm tooltip *"Chưa có nước nào của bạn để đi lại"*. Chỉ khi người chơi đã đi ít nhất 1 nước mới bấm được. Không đi lại được sau khi ván đã kết thúc.
     * **Mỗi lần Đi lại thành công mới trừ 1 lượt** (kể cả trường hợp huỷ lúc máy đang nghĩ và chỉ lùi 1 nước của người chơi).
  3. **Đồng hồ thi đấu — Không giới hạn thời gian (Thư thái rèn luyện):**
     * Ván đấu với máy hoàn toàn **không giới hạn thời gian (No Time Limit)** đối với người chơi.
     * Người chơi có thể tự do suy ngẫm từng nước cờ mà không lo bị áp lực đồng hồ đếm lùi, không bị xử thua do hết giờ (`TIMEOUT`) và không áp dụng cơ chế cảnh báo chống treo ván `R17`.
     * *Phía máy cờ:* Vẫn tuân thủ nghiêm ngặt ngân sách thời gian tối đa theo từng cấp độ (Dễ $\le 300$ms, Trung bình $\le 1000$ms, Khó $\le 3000$ms).
  4. **Hòa, đầu hàng, bỏ dở:**
     * Ván với máy **không có nút Xin hòa**; hòa chỉ xảy ra theo `Quyết định 3.5` (lặp thế, 120 nửa nước không ăn quân). Người chơi có nút **Đầu hàng**. **Chủ động Rời ván/Đăng xuất khi ván AI còn chạy (duyệt 04/10)** cần xác nhận đầu hàng; đồng ý thì kết thúc `RESIGN`, huỷ tác vụ máy và giải phóng vị trí chơi; Huỷ giữ nguyên. Đóng tab/mất mạng vẫn giữ ván theo mục tiếp theo.
     * Mất kết nối hoặc đóng tab giữa ván: ván được **giữ 30 phút** để vào lại cùng đường dẫn `/ai/:id` (Sảnh có banner "ván đang chơi dở"). Quá 30 phút: P1 bỏ trạng thái ván trong bộ nhớ; P2 lưu vào Lịch sử với kết quả **"Bỏ dở"** (không tính thắng/thua). Ván của Khách không lưu (`Quyết định 1.3`). **AI P1 chỉ trong bộ nhớ:** máy chủ khởi động lại làm mất trạng thái; thông báo *"Ván không còn trạng thái để tiếp tục"*, cho về Sảnh hoặc chủ động tạo ván mới, không tự lưu Lịch sử/khôi phục giả (PO duyệt 05/10).

---

## PHẦN 7: HỆ THỐNG XẾP HẠNG ELO & GHÉP TRẬN TỰ ĐỘNG (Yêu cầu 9)

### Quyết định 7.1: Hệ thống Xếp Hạng Chuẩn Elo, Hàng Đợi Ghép Trận Tự Động & Bảng Xếp Hạng Leaderboard Top 50
* **Lựa chọn đã chốt:** **[12C - Bổ sung chính thức] Triển khai Hệ thống Điểm Elo Chuẩn FIDE, Hàng Đợi Ghép Trận Ngẫu Nhiên 100%, Leaderboard Top 50 Ghim Thứ Hạng Cá Nhân & Quy Tắc Đầu Hàng Nghiêm Ngặt**
* **Mô tả nghiệp vụ:**
  1. **Hệ thống Điểm Elo Chuẩn Quốc Tế:**
     * Điểm Elo khởi tạo mặc định cho mọi tài khoản mới: `1200 Elo`.
     * Công thức tính điểm Elo sau mỗi ván đấu xếp hạng:
       $$E_A = \frac{1}{1 + 10^{(R_B - R_A)/400}}$$
       $$R'_A = R_A + K \times (S_A - E_A)$$
       Trong đó: $R_A, R_B$ là Elo hiện tại; $S_A \in \{1 \text{ (Thắng)}, 0.5 \text{ (Hòa)}, 0 \text{ (Thua)}\}$.
     * Hệ số $K-factor$: $K = 32$ cho 30 ván đầu tiên (giai đoạn định vị trình độ), $K = 16$ cho các ván tiếp theo. Chỉ **ván Đánh Hạng đã hoàn tất** mới được đếm vào 30 ván; ván Đánh Thường, Đánh Với Máy và ván `INTERRUPTED` không đếm, không đổi Elo. Elo **tối thiểu 100** (không xuống dưới). **Làm tròn (duyệt 04/10):** tính độc lập cho hai bên từ Elo trước ván và số ván hoàn tất **trước ván này**; làm tròn Elo mới tới số nguyên gần nhất, phần .5 lên trên, rồi áp dụng sàn 100. Ván thứ 30 còn dùng K=32, ván thứ 31 dùng K=16. Không điều chỉnh cưỡng bức để tổng biến động bằng 0 khi K hai bên khác nhau hoặc chạm sàn.
     * Cấp bậc danh hiệu người chơi (Rank Tiers):
       * *Người mới (Novice):* < 1200
       * *Sơ cấp (Junior):* 1200 – 1399
       * *Trung cấp (Intermediate):* 1400 – 1599
       * *Cao cấp (Advanced):* 1600 – 1799
       * *Kiện tướng (Master):* 1800 – 1999
       * *Đại sư (Grandmaster):* $\ge 2000$
       * **Chưa xếp hạng:** Tài khoản chưa có ván Đánh Hạng nào hiển thị nhãn *"Chưa xếp hạng"* (Elo 1200 vẫn dùng để ghép trận). Cấp *"Người mới"* chỉ xuất hiện khi Elo giảm xuống dưới 1200.
  2. **Cơ chế Hàng đợi Ghép trận Xếp hạng tự động (Ranked Matchmaking Queue):**
     * Tại Sảnh chính, người chơi bấm nút **"Tìm trận Xếp hạng"**.
     * Hệ thống đưa người chơi vào hàng đợi `MatchmakingQueue` trên máy chủ.
     * Thuật toán tìm kiếm đối thủ cân tài cân sức: Tìm người chơi có chênh lệch $\Delta Elo \le 100$ điểm. Nếu sau mỗi 10 giây chưa tìm thấy, tự động mở rộng biên độ thêm $\pm 50$ điểm.
     * **Cơ chế Hủy tìm trận (Cancel Matchmaking):**
       * *Khi chưa tìm thấy đối thủ:* Người chơi có thể bấm nút **"Hủy tìm trận"** bất kỳ lúc nào $\rightarrow$ Hệ thống lập tức rút người chơi ra khỏi hàng đợi mà không bị trừ điểm Elo hay bất kỳ hình phạt nào.
       * *Khi vừa tìm thấy đối thủ & phòng đang khởi tạo (`MATCH_FOUND`):* Nút Hủy bị khóa/vô hiệu hóa, cả 2 người chơi được đưa thẳng vào bàn cờ thi đấu.
     * Khi ghép thành công: Máy chủ tự động tạo phòng cờ chuyên biệt loại `RANKED`, thời gian mặc định 10 phút mỗi bên, ngẫu nhiên chọn bên Đỏ/Đen và đưa cả 2 người chơi vào thi đấu ngay lập tức.
  3. **Quy tắc Phạt điểm Elo khi ĐẦU HÀNG (Resign) — Xử phạt công bằng:**
     * Bất kể người chơi bấm nút "Đầu hàng" ở nước cờ thứ mấy (kể cả ngay nước 1 hay nước 3), hệ thống lập tức xử bên đầu hàng là **THUA** và **bị trừ điểm Elo bình thường theo công thức FIDE**.
     * Đối thủ được xử là **THẮNG** và **được cộng điểm Elo tương ứng**.
     * *Lý do:* Triệt tiêu hành vi cố tình hủy trận né đối thủ mạnh hoặc phá hoại hàng đợi ghép trận.
  4. **Bảng Xếp Hạng Người Chơi (Leaderboard Top 50 + Dòng Ghim Cá Nhân):**
     * Màn hình `SCR-LEADERBOARD`: Hiển thị danh sách **Top 50 người chơi** có điểm Elo cao nhất toàn server, danh hiệu rank, số trận thắng/thua/hòa và tỷ lệ thắng.
     * **Dòng ghim vị trí cá nhân cố định (Sticky User Row):** Dưới đáy bảng luôn có một hàng cố định hiển thị: *Thứ hạng hiện tại của chính bạn (VD: Hạng #142 - Elo 1280 - Cấp Trung cấp)* giúp người dùng ngay lập tức biết được vị thế của mình trên bảng tổng sắp mà không phải cuộn tìm kiếm.
     * **Điều kiện lên bảng:** Chỉ tài khoản có **ít nhất 5 ván Đánh Hạng hoàn tất** mới được xếp hạng và hiện trong bảng. Người chưa đủ thì dòng ghim ghi *"Chưa xếp hạng — cần thêm X ván"*. Khách không có mặt trên bảng.
     * **Đồng điểm:** Xếp theo Elo giảm dần; bằng Elo thì bên có nhiều ván thắng hơn xếp trước; vẫn bằng thì bên đạt mức Elo đó sớm hơn xếp trước; vẫn bằng nữa thì `user_id` tăng dần làm tiêu chí ổn định (duyệt 04/10). Không có reset theo mùa.
  5. **Quyết định về Giải đấu (Tournaments):**
     * **BỎ HOÀN TOÀN HỆ THỐNG GIẢI ĐẤU (OUT-OF-SCOPE):** Không làm tính năng giải đấu (chia bảng, nhánh đấu Knockout) để giữ phạm vi tập trung cao độ vào thi đấu đối kháng trực tiếp và xếp hạng 1-1 theo Elo.

---

### Quyết định 7.2: Hàng đợi Ranked khi ít người, chống bơm Elo, xin hòa & Tái đấu trong Ranked
* **Lựa chọn đã chốt:** **[RANKED-GUARD] Trần chờ 60 giây; một cặp tối đa 3 ván/24 giờ; xin hòa chỉ sau 20 nước mỗi bên; không Tái đấu**
* **Sau ván RANKED (duyệt 04/10):** giữ màn kết quả `FINISHED`; mỗi người phải **Rời phòng** trước khi tìm trận mới. Một người rời không đưa phòng về `WAITING`; người còn lại giữ ghế để xem kết quả. Đóng khi cả hai đã rời hoặc hết 10 phút tính từ kết thúc ván, không đặt lại hạn khi một người rời. Không Sẵn sàng, Tái đấu, đổi ghế hoặc nhận người mới; nhánh phòng chờ/đổi thành phần ở 2.3/2.8 chỉ áp cho phòng tự tạo; ghép ngẫu nhiên theo 2.0.
* **Mô tả nghiệp vụ:**
  1. **Trần chờ hàng đợi:** Biên độ Elo mở thêm ±50 mỗi 10 giây (`Quyết định 7.1`) và **dừng ở 60 giây** (biên độ cuối ±400). **Tại đúng mốc 60 giây (duyệt 04/10):** thử ghép lần cuối với biên độ ±400 rồi mới hết hạn nếu không có đối thủ. **Khi hai người có biên độ khác nhau**, ghép được nếu chênh lệch Elo nằm trong biên độ **lớn hơn** của hai người (người chờ lâu hơn). Cặp đã chạm trần 3 ván/24 giờ bị bỏ qua âm thầm và hệ thống tiếp tục tìm đối thủ khác, không báo lý do. Quá 60 giây không ghép được thì tự rút khỏi hàng đợi, báo *"Chưa tìm được đối thủ phù hợp, hãy thử lại sau"*, không phạt, **không ghép với máy**.
  2. **Mất hàng đợi:** Hàng đợi chỉ nằm trong bộ nhớ máy chủ. Khi máy chủ khởi động lại, hàng đợi mất; giao diện báo *"Hàng đợi đã bị huỷ, hãy tìm lại"*, không phạt.
  3. **Chống bơm Elo bằng nhiều tài khoản:** Hai tài khoản **không bị ghép với nhau quá 3 ván Đánh Hạng trong 24 giờ**. **Cách đếm (duyệt 04/10):** cửa sổ trượt theo thời điểm bắt đầu ván; tính cả ván đã bắt đầu rồi `INTERRUPTED`, khác với bộ đếm ván hoàn tất dùng tính K và điều kiện lên bảng. Khi kiểm tại thời điểm t, đếm `started_at > t − 24 giờ` và `started_at ≤ t`; ván đúng mốc t − 24 giờ đã ra khỏi cửa sổ. Hệ thống **không** chặn theo địa chỉ IP hay thiết bị vì buổi demo và lớp học dùng chung một mạng.
  4. **Xin hòa trong Ranked (đã duyệt 03/10):** Cho phép (hạn 30 giây), nhưng chỉ bấm được khi **mỗi bên đã đi ít nhất 20 nước**; trước đó nút `DISABLED` kèm tooltip *"Chỉ xin hòa được sau 20 nước mỗi bên"*. Hòa tính Elo theo $S = 0.5$.
  5. **Không Tái đấu trong Ranked (đã duyệt 03/10):** `MODAL-MATCH-RESULT` của ván Ranked **không có nút Tái đấu**. Phòng Ranked đóng khi cả hai rời; muốn đấu tiếp phải "Tìm trận Xếp hạng" lại.
  6. **Rời phòng giữa ván Ranked** được tính **Đầu hàng** (`MODAL-CONFIRM-LEAVE`), thua và trừ Elo như `Quyết định 7.1`.

### Quyết định 7.3 (đã duyệt 03/10): Phân loại kết quả ván và thống kê
* **Lựa chọn đã chốt:** **[RESULT-TYPES] `INTERRUPTED` và "Bỏ dở" hiện trong Lịch sử nhưng không tính thắng/thua/hòa, không đổi Elo**

| Kết quả | Hiện ở Lịch sử | Tính thắng/thua/hòa và tỷ lệ thắng | Đổi Elo | Đếm vào 30 ván đầu và 5 ván lên bảng | Xem lại |
|---|:---:|:---:|:---:|:---:|:---:|
| Thắng / Thua (mọi lý do kết thúc) | Có | Có | Ranked: có; Casual, AI: không | Ranked: có | Có |
| Hòa | Có | Có | Ranked: có ($S = 0.5$) | Ranked: có | Có |
| `INTERRUPTED` (nhãn "Bị gián đoạn") | Có | Không | Không | Không | Có |
| Bỏ dở ván AI (nhãn "Bỏ dở") | Có | Không | Không (AI không tính Elo) | Không | Có |

* **Bảng xếp hạng** và thẻ tóm tắt người dùng chỉ lấy thắng/thua/hòa của **ván Ranked**. Lịch sử cá nhân hiển thị tất cả loại.

---

## PHẦN 8: CÁC QUY TẮC RÀNG BUỘC NGOẠI LỆ (EDGE CASES)

### Quyết định 8.1: Quy tắc chặt chẽ cho Ván Xếp Hạng (Ranked Match)
* **Lựa chọn đã chốt:** **[EC-01] Ván Ranked nghiêm ngặt: Ghép ngẫu nhiên 100%; CẤM XEM (No Spectators); CẤM UNDO; Khách KHÔNG ĐƯỢC tham gia; Thời gian 10 phút Rapid; Cho phép 2 người chơi tự bật Camera/Mic/Chat**
* **Mô tả nghiệp vụ:**
  * **Ghép ngẫu nhiên 100%:** Người chơi không được quyền chọn đối thủ hay mời phòng, máy chủ phân xử ghép ngẫu nhiên theo thuật toán Elo.
  * **Tuyệt đối KHÔNG CHO NGƯỜI KHÁC VÀO XEM (No Spectators):** Khóa hoàn toàn luồng người xem. Không ai có thể vào phòng xem ván Ranked dưới bất kỳ hình thức nào. Phòng không hiển thị ở Sảnh.
  * **Tuyệt đối CẤM XIN ĐI LẠI (No Undo):** Nút "Xin đi lại" bị ẩn hoặc vô hiệu hóa (`DISABLED`) vĩnh viễn. "Bút sa gà chết" nhằm bảo đảm tính công bằng tuyệt đối cho thứ hạng người chơi.
  * **Hỗ trợ Camera, Mic và Chat Text giữa 2 người chơi:** Cho phép 2 người chơi tự quyết định Bật/Tắt Camera và Mic để giao lưu trực tiếp trong lúc so tài (Quyết định 5.4).
  * **Khách (Guest) không được tham gia:** Chỉ các tài khoản chính thức đã đăng ký mới được quyền bấm "Tìm trận Xếp hạng".
  * **Thời gian thi đấu mặc định 10 phút:** Ngân sách thời gian cố định **10 phút mỗi bên (Rapid chuẩn cờ quốc tế)**, không áp dụng luật cộng giây.

---

### Quyết định 8.2: Quy tắc Chat riêng 1-1 ngoài phòng thi đấu
* **Lựa chọn đã chốt:** **[EC-02] Chỉ cho phép nhắn tin 1-1 giữa những người ĐÃ LÀ BẠN BÈ (`status = 'ACCEPTED'`)**
* **Mô tả nghiệp vụ:**
  * Người dùng chỉ có thể mở cuộc hội thoại chat riêng 1-1 với những người chơi đã nằm trong danh sách Bạn bè chính thức.
  * Nếu truy cập hồ sơ của người lạ (chưa kết bạn), giao diện chỉ hiển thị nút **"Kết bạn"**, không hiển thị nút "Nhắn tin". Sau khi đối phương chấp nhận lời mời kết bạn, nút "Nhắn tin" mới được kích hoạt.
  * **Lợi ích:** Ngăn chặn triệt để hành vi spam tin nhắn rác, quấy rối danh tính hoặc gửi tin nhắn khiêu khích ngoài phòng đấu từ các tài khoản lạ.

---

### Quyết định 8.3: Xử lý Ngắt kết nối / Bỏ cuộc (Rage Quit) trong ván Xếp hạng
* **Lựa chọn đã chốt:** **[EC-03] Ân hạn 60 giây; Xử thua và phạt trừ điểm Elo bình thường nếu bỏ chạy**
* **Mô tả nghiệp vụ:**
  * Khi một người chơi trong ván bị ngắt kết nối (mất mạng hoặc cố tình tắt trình duyệt). Quy tắc ân hạn 60 giây dưới đây áp dụng cho **cả Đánh Hạng và Đánh Thường**; khác biệt duy nhất là Đánh Thường không đổi Elo:
    * Hệ thống kích hoạt bộ đếm thời gian ân hạn **60 giây**. Bàn cờ hiển thị chỉ báo: *"Đối thủ đang mất kết nối, thời gian chờ: 60s"*.
    * Nếu trong vòng 60s người chơi kết nối lại: Ván cờ tiếp tục bình thường từ trạng thái hiện tại.
    * Nếu quá 60s không kết nối lại: Máy chủ tự động kết thúc ván đấu, xử thua bên mất kết nối với lý do `DISCONNECT`, trừ điểm Elo như một trận thua và cộng điểm Elo thắng cho đối thủ còn lại.
  * **Hành vi theo vai trò (rà soát cuối):** Ân hạn 60 giây và xử thua chỉ áp dụng cho **người chơi đang trong ván online**. Người chơi ở phòng `WAITING`/`FINISHED` chỉ giữ ghế 60 giây rồi mất ghế (không xử thua). Người xem giữ chỗ 5 phút. Ván với máy giữ 30 phút (`Quyết định 6.3`).
  * **Đồng hồ trong lúc chờ:** Đồng hồ ván **vẫn chạy bình thường** trong 60 giây ân hạn. Nếu bên đang tới lượt là bên mất kết nối và **hết giờ trước** khi hết ân hạn thì xử `TIMEOUT`; nếu ân hạn hết trước thì xử `DISCONNECT`.
  * **Trường hợp lỗi hạ tầng / Server sập:** Ván chuyển sang `INTERRUPTED` (`ARCH-10`) và **giữ nguyên điểm Elo của cả hai bên** **chỉ khi máy chủ tự ghi nhận sự cố của chính nó** (khởi động lại, mất kết nối cơ sở dữ liệu). Nếu máy chủ vẫn chạy bình thường mà hai người chơi cùng mất kết nối thì **không phải `INTERRUPTED`**: mỗi bên có ân hạn 60 giây riêng; nếu cả hai cùng quá hạn thì **bên mất kết nối trước bị xử thua** (`DISCONNECT`), bên còn lại thắng. Cách này chặn việc hai người cùng rút mạng để né mất Elo. **Sau khởi động lại (PO chốt lại 09/10, 0.17):** hiện kết quả trung tính "Ván bị gián đoạn" ở `MODAL-MATCH-RESULT`. Phòng tự tạo về `WAITING`, reset Sẵn sàng và có **Ở lại phòng / Rời phòng**, không hạn đóng 10 phút (0.7). Ghép ngẫu nhiên và RANKED (P2) giữ `FINISHED` theo 2.0/7.2, không về `WAITING`; không đóng ngay.

---

## PHẦN 9: TIỆN ÍCH HỖ TRỢ DEMO BẢO VỆ ĐỒ ÁN & TÍNH NĂNG MỞ RỘNG (STRETCH GOALS / PRIORITY 2)
*(Mục tiêu mở rộng P2; lịch triển khai do bước lập kế hoạch xác định, đặc tả không ấn định Sprint 4.)*

### Quyết định 9.1: Tiện ích Sao chép thế cờ FEN & Tải biên bản ván đấu PGN
* **Lựa chọn đã chốt:** **[13B - Stretch P2] Xuất dữ liệu thế cờ FEN & Tải file PGN tại màn hình Replay**
* **Mô tả nghiệp vụ:** Nút "Sao chép FEN" (Copy FEN chuỗi thế cờ hiện tại) và "Tải biên bản PGN" (Download file `.pgn` danh sách nước đi) phục vụ người chơi cờ chuyên sâu phân tích trên các engine bên ngoài.

---

### Quyết định 9.2: Bảng thông số tính toán AI thời gian thực (AI Debug Metrics Widget)
* **Lựa chọn đã chốt:** **[P2 - Demo Tool] Widget hiển thị chỉ số tính toán của thuật toán AI**
* **Mô tả nghiệp vụ:**
  * Khi người chơi thi đấu với AI, ở góc màn hình có một widget thu nhỏ hiển thị các chỉ số nhảy số trực tiếp:
    * *Số thế cờ đã duyệt (Nodes evaluated):* ví dụ `48,210 nodes`.
    * *Độ sâu tìm kiếm thực tế (Search Depth):* `Depth 4/4` (hoặc `Depth 6/6`).
    * *Thời gian tính toán (Compute Latency):* `320 ms`.
    * *Nước cờ dự tính tối ưu (Principal Variation / PV):* ví dụ `C2.5`.
  * **Ý nghĩa thực tế:** Bằng chứng thuyết phục 100% trước Hội đồng chấm thi rằng nhóm **tự viết thuật toán Minimax / Alpha-Beta thuần túy**, xóa tan hoàn toàn nghi vấn "gọi API dịch vụ cờ bên ngoài".

---

### Quyết định 9.3: Công cụ giả lập kịch bản mạng dành cho Demo (Demo Admin Network Controls)
* **Lựa chọn đã chốt:** **[P2 - Demo Tool] Thanh công cụ phím tắt giả lập rớt mạng và khôi phục ván**
* **Mô tả nghiệp vụ:**
  * Bổ sung phím tắt hoặc panel ẩn dành cho Admin/Tester khi demo đồ án:
    * Nút *"Mô phỏng Người chơi 1 mất mạng"* $\rightarrow$ Ngắt ngay lập tức Socket của Client 1 để kích hoạt bộ đếm ân hạn 60s trên màn hình Client 2.
    * Nút *"Tái kết nối tức thì"* $\rightarrow$ Bật lại kết nối và kích hoạt snapshot đồng bộ bàn cờ.
  * **Ý nghĩa thực tế:** Giúp buổi bảo vệ đồ án diễn ra mượt mà, chủ động biểu diễn được cơ chế chịu lỗi (Fault-tolerance) ngay cả khi Wi-Fi phòng hội đồng chập chờn.
  * **Không có vai trò Admin:** Công cụ này **không gắn với vai trò người dùng**. Nó chỉ xuất hiện khi môi trường chạy được bật cờ "chế độ demo" trong cấu hình; ở môi trường chính thức bị tắt hoàn toàn và máy chủ từ chối các lệnh giả lập.

---

## PHẦN 10: RÀNG BUỘC CHUNG & NGOÀI PHẠM VI

### Quyết định 10.1: Ràng buộc chung của sản phẩm
* **Lựa chọn đã chốt:** **[GLOBAL-CONSTRAINTS] Quy mô đồ án, web responsive, tiếng Việt, không lưu media**
* **Mô tả:**
  * ~~ĐÃ THAY bởi Phần 0 mục 0.1 (07/10)~~ **Nguồn lực và hạn chót (Product Owner cung cấp 03/10/2026):** nhóm **7 người**, hạn nộp/demo khoảng **2 tuần** (đến khoảng 17/10/2026). Vì vậy phạm vi làm trước được giới hạn ở P1 theo `Phần 11`.
  * ~~ĐÃ THAY bởi Phần 0 mục 0.1 (07/10)~~ **Nhóm và thời gian (PO trả lời 04/10/2026):** Product Owner **nằm trong nhóm 7 người**; **Scrum Master là người đại diện PO (Twot)**; mọi thành viên làm **toàn thời gian** cho dự án và nhóm có **đủ các kỹ năng** cần thiết; **bắt đầu ngay 04/10/2026, hoàn thành sau 2 tuần (nộp 18/10/2026; ngày làm việc D1 = 04/10, D14 = 17/10)**; ước lượng bằng **giờ**. Cách đọc "đủ kỹ năng" và "toàn thời gian" là lời của PO, chưa có bảng giờ từng người; con số 17/10 ở dòng trên là theo mốc bắt đầu cũ 03/10, nay lấy mốc 04/10.
  * **Tiêu chí chấm kế hoạch Jira của giáo viên (PO cung cấp 04/10/2026; đồ án môn học):** kế hoạch phải **hợp lý và cụ thể**; **Description** của từng Epic, Story, Task phải đủ chi tiết để người làm hiểu yêu cầu, mục tiêu và kết quả, **cách kiểm thử và điều kiện PASS**; **thứ tự sắp xếp hợp lý**: kết quả của việc này là điểm bắt đầu của việc kia, **tránh hai việc A và B chạy song song trong khi B cần kết quả của A** (lãng phí thời gian). Giáo viên chưa nêu số Sprint tối thiểu.
  * **Số người xem — PO chốt lại MVP 05/10/2026:** phòng tự tạo có **hai người chơi và tối đa năm người xem**, biểu mẫu chọn 0/1/2/3/4/5 (mặc định 5), sức chứa tối đa 7. PO đính chính lại mức năm người xem; bài tải và media theo trần này. Không có mục nâng trần riêng ở P2.
  * ~~ĐÃ THAY bởi Phần 0 mục 0.1 (07/10)~~ **Nhịp Sprint (PO chọn 04/10/2026):** **4 Sprint** theo độ dài 4 + 3 + 4 + 3 ngày: Sprint 1 từ 04/10 đến 07/10, Sprint 2 từ 08/10 đến 10/10, Sprint 3 từ 11/10 đến 14/10, Sprint 4 từ 15/10 đến 17/10; nộp 18/10/2026. Mỗi Sprint phải có Sprint Goal và một Increment dùng được; số Sprint không làm thay đổi phạm vi P1.
  * **Nơi chạy demo (PO quyết định 04/10/2026; hạn demo nay là 05/11/2026; bố trí media xem Phần 0 mục 0.16):** **ưu tiên chạy trên máy cục bộ (local)**; chỉ dùng Render làm phương án dự phòng nếu cần có địa chỉ trên mạng. Hệ quả: không bắt buộc dịch vụ trả phí hay thẻ thanh toán cho phần máy chủ ứng dụng; vẫn dùng Supabase và LiveKit Cloud đã chọn (cần mạng). Kịch bản demo D1–D10 phải chạy được ở môi trường cục bộ.
  * **Chat Kênh Riêng khi đổi người ngồi ghế (PO quyết định 04/10/2026):** khi cặp người ngồi ghế thay đổi (ví dụ A và B đang chat riêng, B xuống xem, C lên ngồi), **người mới ngồi không đọc được tin cũ**, và **không ai** trong cặp mới đọc được tin của cặp cũ. Kênh Riêng chỉ hiển thị tin tạo từ lúc **cặp ngồi ghế hiện tại hình thành** (mốc muộn hơn trong hai mốc bắt đầu ngồi ghế). Người rời ghế mất quyền đọc Kênh Riêng.
  * **Ván bị gián đoạn khi máy chủ khởi động lại (PO chốt lại 09/10, 0.17):** hiện hộp kết quả trung tính **"Ván bị gián đoạn"**: không có bên thắng, thua hay hoà; không đổi Elo. Phòng tự tạo về `WAITING`, reset Sẵn sàng, có *Ở lại phòng* và *Rời phòng*, không hạn đóng 10 phút. Luật P2 của ghép ngẫu nhiên/Ranked giữ theo 2.0/7.2; trạng thái AI P1 theo 6.3.
  * **Yêu cầu phi chức năng NFR-08, NFR-09, NFR-10 (PO duyệt 04/10/2026):** (08) nhật ký vận hành có cấu trúc, điểm kiểm tra sức khoẻ, không ghi mật khẩu/OTP/token/nội dung chat; (09) lưu giữ dữ liệu: ván online và nước đi lưu bền, ván với máy chỉ ở bộ nhớ, chat phòng xoá khi phòng đóng, biên lai lệnh xoá sau 24 giờ, nhật ký giữ tối đa 14 ngày; (10) tin chat, tên hiển thị, tên phòng hiển thị như văn bản thuần. Chi tiết và cách kiểm ở mục NFR của [BACKLOG-P1.md](BACKLOG-P1.md). Từ nay là điều kiện bắt buộc của nghiệm thu P1.
  * **Cổng kiểm chứng (PO duyệt 04/10/2026; chi tiết nay ở mục Cổng kiểm chứng của BACKLOG-P1.md; (a) sửa 07/10 theo SMTP ngoài):** (a) demo đăng ký phải dùng **OTP thật** tới email thật (kể cả email ngoài nhóm), không dùng giả lập làm bằng chứng; (b) GATE-OTP: gọi thẳng chức năng đổi email của hệ thống đăng nhập phải không đổi được (nếu cấu hình không chặn được thì ghi "bị chặn" cho phần đó), và email ngoài nhóm hoặc vượt hạn mức thì báo lỗi thật, không để tài khoản kẹt; (c) GATE-MEDIA: ghi thời gian thu hồi quyền thực tế và mức dùng hạn mức miễn phí của LiveKit, **không đặt ngưỡng đạt**; (d) phần camera/micro của bài tải chạy **quy mô nhỏ (~3 phòng)**, **chỉ ghi số đo**, không nằm trong điều kiện đạt P1.
  * **Google OAuth vào P1 (PO quyết định 04/10/2026):** **đăng ký và đăng nhập bằng Google chạy thật ở P1** (`Quyết định 1.2`, `SCR-ONBOARDING`, tiêu chí hiện hành ở US-01.3 trong BACKLOG-P1.md). Liên kết *Quên mật khẩu?* hiện mờ "Sắp ra mắt"; nút *Guest* (Khách) **hoạt động ở P1 từ 07/10** (Phần 0 mục 0.3). Hệ quả: cần dịch vụ Google OAuth (khoá do nhóm tạo trên Google), thử nghiệm **không tự liên kết cùng email** của Supabase (cổng GATE-GOOGLE chuyển P1) và thêm công việc vào Epic 1.
  * ~~ĐÃ THAY bởi Phần 0 mục 0.1 (07/10)~~ **Quyết định về tiến độ (PO, 04/10/2026):** Product Owner quyết định giữ **đủ P1 trong 14 ngày với nhóm 7 người** (04/10/2026), biết đây là rủi ro rất cao và nhận nhóm sẽ làm được. Ước lượng của agent (128 người-ngày; lịch cơ sở 38,4 ngày) chỉ là tham khảo, không phải cam kết hay căn cứ để cắt phạm vi.
  * ~~ĐÃ THAY bởi Phần 0 mục 0.16 (08/10): LiveKit tự chạy + LiveKit Cloud dự phòng~~ **Hạ tầng media (PO chốt 04/10/2026):** dùng **LiveKit Cloud** (gói miễn phí lúc bắt đầu, không tự dựng LiveKit); hạn mức, chi phí và việc thu hồi quyền kiểm theo GATE-MEDIA ở BACKLOG-P1.md.
  * **Quy mô thiết kế:** Hướng tới tối đa khoảng **50 người dùng đồng thời và 10 phòng/ván cùng lúc**. Đo bằng GATE-REALTIME (US-00.5, BACKLOG-P1.md).
  * **Thiết bị:** Ứng dụng web chạy trên bản mới của Chrome, Edge, Firefox, Safari. Giao diện **responsive từ 360 px** (vì Mã QR hướng tới điện thoại); bàn cờ chơi được bằng cảm ứng.
  * ~~ĐÃ THAY bởi Phần 0 mục 0.4 (07/10): dùng SMTP ngoài~~ **Gửi email OTP (duyệt 04/10/2026):** dùng **SMTP mặc định của Supabase**, không thêm dịch vụ gửi thư. Hệ quả đã được Product Owner chấp nhận: hạn mức khoảng 2 thư/giờ và chỉ gửi được tới địa chỉ thuộc nhóm dự án Supabase (theo tài liệu Supabase), không dành cho production. Vì vậy buổi demo đăng ký bằng email OTP chỉ dùng email của thành viên nhóm và ít lượt đăng ký; chuẩn bị tài khoản demo trước. Muốn mở cho người ngoài nhóm thì phải đổi quyết định này (gắn SMTP bên ngoài).
  * **Ngôn ngữ:** Chỉ tiếng Việt.
  * **Dữ liệu cá nhân:** Chỉ lưu email, username, Display Name, mật khẩu (băm), Elo, lịch sử ván, bạn bè, tin nhắn. Camera/mic **không ghi, không lưu**. Không hỏi tuổi.

### Quyết định 10.2: Cố ý KHÔNG làm trong phạm vi này
* **Lựa chọn đã chốt:** **[OUT-OF-SCOPE] Danh sách loại trừ tường minh**
* **Danh sách:** giải đấu · gợi ý nước đi khi đánh với máy · cộng giây sau mỗi nước · đổi chữ Hán sang chữ Việt · đổi email · **xoá tài khoản** (đã duyệt 03/10; nếu cần, xử lý thủ công theo yêu cầu, chưa có chức năng trong ứng dụng) · **báo cáo vi phạm, quản trị viên, khoá/cấm tài khoản** · **chặn người dùng riêng** (đã có cách thay thế ở `Quyết định 5.5`) · **tải ảnh đại diện** · **trang hồ sơ công khai riêng** · **đa ngôn ngữ** · **điều khoản sử dụng và chính sách quyền riêng tư** (rủi ro đã ghi nhận) · luật đuổi quân liên tục chi tiết (để Giai đoạn 2) · **đổi mật khẩu khi đang đăng nhập** (dùng Quên mật khẩu, `Quyết định 1.7`) · **bảng xếp hạng theo tuần/ngày hoặc theo mùa** (chỉ một bảng toàn thời gian, `Quyết định 7.1`).

---

### Quyết định 10.3: Giao diện theo phân kỳ (duyệt 04/10/2026)
* **P1:** chỉ giao diện **Kỳ Đài Cổ Phong**, không có bộ chọn giao diện.
* **P2:** thêm **Giấy Sáng** và **Theo hệ thống**; Kỳ Đài Cổ Phong vẫn là lựa chọn mặc định khi người dùng chưa chọn. Không đổi màu bàn cờ giữa các giao diện; trợ năng áp dụng cho mọi giao diện được triển khai.

* **Phông chữ (PO chốt 05/10, câu 6):** đồng bộ thiết kế, hướng dẫn Figma/bàn giao và checklist theo bảng phông hiện tại ở `DESIGN.md` §3.1. Bảng này định nghĩa phông giao diện, tiêu đề trang trí, chữ Hán trên quân cờ và monospace cho đồng hồ/mã phòng; không dùng hướng dẫn Inter/Roboto thay cho phông giao diện đã chốt.

### Quyết định 10.4: Công bố luật rút gọn (duyệt 04/10/2026)
* **P1:** phần **Luật chơi** mở rộng/thu gọn trong Sảnh hiện có; không tạo trang hoặc modal mới. Nêu cách kết thúc ván, hết nước đi là thua, chiếu liên tục, lặp thế và không ăn quân; thông báo rõ đuổi quân liên tục không xử riêng. Nội dung theo AC của Story Sảnh trong BACKLOG-P1.md, không tuyên bố tuân thủ toàn bộ luật thi đấu chính thức.

## PHẦN 11: PHÂN KỲ PHẠM VI — P1 (MVP, HẠN 05/11/2026) VÀ P2 (LÀM SAU)

> **Cập nhật 07/10:** Khách, Xin đổi bên, khoá thử sai đăng nhập, nút "Vào chơi" ở Sảnh, "Ở lại phòng"/"Ván mới" sau ván đã lên P1 (Phần 0). Bảng và danh sách dưới đây đã đồng bộ.

> Danh sách P1/P2 do agent đề xuất theo uỷ quyền của Product Owner ngày 03/10/2026 và **đã được Product Owner duyệt cùng ngày**, với một điều chỉnh: **mời bạn bè đang online vào phòng phải có ở P1** (nên hệ thống bạn bè tối thiểu thuộc P1). Product Owner có thể kéo bất kỳ mục nào từ P2 lên P1.
>
> **Tiêu chí hoàn thành P1 (Product Owner, 03/10/2026):** demo chạy được **8 mục tiêu cốt lõi từ đầu đến cuối** (end-to-end).

* **Căn cứ:** Product Owner (03/10/2026) xác định 8 mục tiêu cốt lõi cho nhóm 7 người (lúc đó dự kiến khoảng 2 tuần; hạn hiện hành là 05/11/2026 theo Phần 0), và cho phép agent tự chuyển các mục còn lại xuống P2. **P1** = những gì cần để 8 mục tiêu chạy được trọn vẹn. **P2** = mọi thứ còn lại; vẫn là đặc tả đã duyệt, **các luật P2 giữ nguyên hiệu lực khi được làm**, chỉ chưa làm trong 2 tuần này.
* **8 mục tiêu cốt lõi (nguyên văn ý Product Owner) và nơi định nghĩa:**

| # | Mục tiêu cốt lõi | Quyết định / thành phần phục vụ |
|---|---|---|
| 1 | Giao diện đăng ký / đăng nhập | 1.1 (đăng ký 3 bước OTP), **1.2 (đăng ký và đăng nhập bằng Google, PO kéo lên P1 ngày 04/10/2026)**, đăng nhập Username + Mật khẩu và khoá thử sai (0.2), **Khách (1.3, 0.3 — lên P1 07/10)**, SMTP ngoài (0.4), 1.8 (phiên); `SCR-LOGIN`, `SCR-REGISTER`, `SCR-ONBOARDING`, `MODAL-GUEST-NAME`, `SCR-PROFILE-SETTINGS` (chỉ Display Name và Đăng xuất) |
| 2 | Tạo phòng chơi game | 2.3, 2.7, 2.8, Xin đổi bên (0.6), sau ván (0.7); `MODAL-CREATE-ROOM`, `SCR-WAITING-ROOM`, `MODAL-SIDE-SWAP-PROMPT` |
| 3 | Mời bạn vào phòng (ngay trong game, gửi link, mã phòng) | 2.2 (Link + Mã 8 ký tự), 2.4 (tự chuyển vào phòng sau đăng nhập), 2.5 (**mời bạn bè đang online**), 5.5 (hệ thống bạn bè tối thiểu: tìm theo username, kết bạn hai chiều, trạng thái online/đang đấu, chuông lời mời kết bạn); `MODAL-INVITE`, `SCR-FRIENDS`. Nhắn tin 1-1 và Thách đấu là P2 |
| 4 | Khởi tạo bàn cờ | 3.1, 3.4 (bàn cờ SVG, quân chữ Hán, click/kéo thả, âm thanh) |
| 5 | Hai người đánh cờ qua mạng | 3.3, 3.5, 0.12 (lặp thế, chiếu liên tục), 8.3 (phần mất kết nối), đồng hồ 5/10/15 phút (mặc định 10), Đầu hàng, Xin hòa; `SCR-GAME-ROOM`, `OVERLAY-RECONNECTING`, `MODAL-MATCH-RESULT` |
| 6 | Phòng tự tạo mời qua bạn bè online hoặc link/mã, **tối đa 5 người xem**; công khai ở Sảnh, chỉ qua mã/link hoặc khóa chặn người mới (PO chốt lại MVP 05/10) | 2.7 (`PUBLIC` ở Sảnh với Vào chơi/Vào xem theo 0.5; `CODE_ONLY` qua mã/link; `LOCKED` chặn người mới), 2.8, 4.2 (đuổi), 4.3; `PANEL-SPECTATORS`, `SCR-ACCESS-DENIED` |
| 7 | Chat 2 người + camera + mic; kênh chat người xem tách riêng | 4.1 (3 mức chia sẻ, người xem chỉ nhận), 5.3 (2 kênh, giới hạn chat, bộ lọc từ cấm), 0.13 (chat và camera/mic ở cả phòng chờ), 0.14 (lỗi media không ảnh hưởng ván), 0.16 (hạ tầng LiveKit); `PANEL-CHAT`, `PANEL-MEDIA` |
| 8 | Đánh với máy theo cấp độ | 6.1, 6.3 (3 cấp, chọn phe), Ván mới (0.9); `SCR-AI-GAME`, `MODAL-AI-SETUP` |

* **Làm sau (P2), đã chuyển khỏi P1:** Đánh Hạng toàn bộ (Elo, ghép trận Ranked, bảng xếp hạng, quy tắc Ranked, `Quyết định 7.1`, `7.2`, `8.1`, phần Ranked của `8.3`) · Ghép ngẫu nhiên Casual · Quên/đặt lại mật khẩu (1.7) · Đổi username (1.6) · Chat 1-1 giữa bạn bè và Thách đấu (5.2, 8.2, nút "Nhắn tin"/"Thách đấu" ở `SCR-FRIENDS`) · Sticker (5.1) · Mã QR (2.2 phần QR) · Xin đi lại ở Đánh Thường (3.2, 3.6 phần đi lại) và đi lại với máy (6.3 phần Undo) · Tái đấu (có chọn phe, 0.8) · mức giờ "Không giới hạn" và cảnh báo chống treo ván · Lịch sử ván, Replay, FEN/PGN, lưu ván AI (6.2, 9.1) · widget AI, công cụ demo (9.2, 9.3) · `MODAL-MEDIA-TAB-SWITCH` · lựa chọn Giấy Sáng/Theo hệ thống (10.3).
* **Quy tắc hiển thị tính năng P2 trong màn hình P1:** xem `DANH-MUC` §7 (lối vào điều hướng chính `DISABLED` + "Sắp ra mắt"; chức năng nằm sâu thì ẩn hẳn).
* **Hệ quả cho P1:**
  * Sảnh có bốn lựa chọn theo 2.0: Tự tạo phòng và Đánh với máy hoạt động ở P1; Đánh Thường ghép ngẫu nhiên và Đánh Hạng hiển thị `DISABLED` kèm tooltip *"Sắp ra mắt"*. Có Vào phòng bằng mã và Luật chơi mở rộng/thu gọn (10.4); có danh sách phòng `PUBLIC` với nút Vào chơi/Vào xem (0.5).
  * Đăng nhập bằng Username + Mật khẩu, bằng Google (`Quyết định 1.2`) hoặc **Khách** (0.3); người chưa đăng nhập vào link mời được chọn một trong ba cách rồi tự vào phòng.
  * Ván Đánh Thường **không có Elo** và ván có tài khoản **chưa lưu Lịch sử** ở P1; màn hình Lịch sử, Replay, Bảng xếp hạng chưa làm (màn hình Bạn bè **có** ở P1).
  * `MODAL-MATCH-RESULT` ở P1: ván online có *Ở lại phòng* và *Rời phòng* (0.7); ván AI có *Ván mới* và *Về Sảnh* (0.9). Không Tái đấu, không Xem lại.
* **Bạn bè ở P1 (tối thiểu):** `SCR-FRIENDS` có tìm kiếm, gửi/nhận lời mời, danh sách bạn kèm trạng thái. **Không có nút mời trên trang này**: ở P1 chỉ mời bạn bè online **trong một phòng**, qua `MODAL-INVITE` do người đang ngồi ghế của phòng đó thực hiện (không tự tạo phòng, vì tạo phòng rồi mời là Thách đấu, P2). Nút "Nhắn tin" và "Thách đấu" `DISABLED` kèm tooltip *"Sắp ra mắt"*; huy hiệu tin chưa đọc chưa có.
* **Ưu tiên theo thành phần:** xem cột "Ưu tiên" ở `DANH-MUC` §7 (**26 thành phần P1, 11 thành phần P2** từ 07/10).
* **Rủi ro đã ghi nhận:** 8 mục tiêu này vẫn gồm hai hạng mục khó (camera/mic qua LiveKit và máy cờ tự viết). Với 7 người đến hạn 05/11/2026 (Phần 0) nên chạy song song các nhóm việc từ đầu và có phương án dự phòng (ví dụ máy cờ chỉ làm cấp Dễ trước).

---

## BẢNG TỔNG HỢP TOÀN BỘ QUYẾT ĐỊNH KHÓA PHẠM VI (SCOPE FREEZE MATRIX)

| STT | Nghiệp Vụ Cốt Lõi | Quyết Định Đã Chốt | Phân Loại & Thứ Tự Ưu Tiên |
|:---:|---|---|:---:|
| 1 | **Chế độ Khách (Guest Mode)** | **[1B] Nút "Guest" nổi bật tại Login kèm ghi chú cấm tham gia Ranked Elo** | **P1 (lên P1 07/10, Phần 0 mục 0.3)** |
| 2 | Kích hoạt Email | **[2B] Tài khoản chỉ được tạo/kích hoạt sau khi xác thực OTP email lúc đăng ký** (không có bước kích hoạt thứ hai; Email cũng dùng cho OTP đổi Username và quên mật khẩu) | **P1 — MVP** |
| 3 | **Đổi Username / Cố định Email** | **[1C] Đổi Username không giới hạn tần suất (Quy trình 4 bước qua OTP Supabase); Cấm đổi Email** | **P2 — làm sau MVP** |
| 4 | **Google OAuth Onboarding** | **[1D] Tạo tài khoản qua Google OAuth kết hợp thiết lập Username + Password**; dọn bản Google mới chưa hoàn tất sau 60 phút, kiểm mỗi 5 phút khi dịch vụ hoạt động (1.2) | **P1 — MVP (PO kéo lên 04/10/2026)** |
| 5 | Đồng hồ thi đấu | **[3A] Phòng tự tạo chọn 4 mức giờ; ghép ngẫu nhiên Đánh Thường cố định 15 phút; Ranked cố định 10 phút**, không cộng giây (2.0, 2.1) | **P1** (phòng tự tạo 5/10/15 phút); **P2** ("Không giới hạn", ghép ngẫu nhiên, Ranked) |
| 6 | Chia sẻ phòng đấu | **[4B] Thêm Mã QR (QR Code)** trực quan bên cạnh Link mời và Mã 8 ký tự | **P1** (Link + Mã); **P2** (Mã QR) |
| 7 | Chữ trên quân cờ | **[5A] Giữ nguyên 100% quân chữ Hán** cổ điển, kết hợp viền trợ năng DT-21 | **P1 — MVP** |
| 8 | Giới hạn Xin đi lại phòng tự tạo và ghép ngẫu nhiên | **[6B] Tối đa 3 lần thành công / bên / ván khi đối thủ chấp nhận** (3.2, 3.6; PO chốt 05/10) | **P2 — làm sau MVP** |
| 9 | Quyền Người xem | **[7A] Chỉ trong phòng tự tạo, tối đa năm người xem, vào từ danh sách PUBLIC hoặc cách mời ở 2.7; chỉ Xem/Nghe + Chat Kênh Chung**, không phát Mic/Cam; CODE_ONLY/LOCKED không hiện ở Sảnh | **P1 — MVP** |
| 10 | Đuổi người xem | **[8B] Cả hai người chơi đều được đuổi; chặn cho đến khi phòng đóng** (`status = CLOSED`) (đồng bộ với `Quyết định 4.2`) | **P1 — MVP** |
| 11 | Tương tác Chat | **[9B] Bổ sung khay 12 Sticker cảm xúc nhanh** (vỗ tay 👏, uống trà 🍵, cạn lời 🤐...) | **P2 — làm sau MVP** |
| 12 | **Chat riêng ngoài phòng** | **[9C / EC-02] Nhắn tin 1-1 chỉ giữa những người ĐÃ LÀ BẠN BÈ**, lưu lịch sử, unread badge | **P2 — làm sau MVP** |
| 13 | Gợi ý nước khi đấu AI| **[10A] Không làm gợi ý nước đi (No Hint)**, tập trung chất lượng AI 3 cấp; nghiệm thu cấp Khó giải đúng 100% bộ chiếu hết ngắn bắt buộc (6.1, PO làm rõ 05/10) | **P1 — MVP** |
| 14 | Lưu lịch sử ván AI | **[11B] Lưu đầy đủ ván AI vào Hồ sơ**, hỗ trợ xem lại (Replay) từng nước cờ | **P2 — làm sau MVP** |
| 15 | **Hệ thống Xếp hạng Elo** | **[12C] Điểm Elo chuẩn FIDE, Bảng xếp hạng Top 50 (đồng bộ với `Quyết định 7.1`), Ghép trận tự động Matchmaking** | **P2 — làm sau MVP** |
| 16 | **Quy tắc ván Ranked** | **[EC-01] Ghép ngẫu nhiên 100%; CẤM XEM (No Spectators); CẤM UNDO; Khách không được đấu; 10 phút Rapid** | **P2 — làm sau MVP** |
| 17 | **Rage Quit ván Ranked** | **[EC-03] Ân hạn 60s, quá hạn xử thua trừ Elo bình thường; sập server không đổi Elo** | **P2 — làm sau MVP** |
| 18 | Xuất FEN / PGN | **[13B] Nút Copy FEN và Download PGN** tại màn hình Replay | **Mở rộng (Stretch P2)** |
| 19 | **AI Debug Metrics** | **[P2 - Tool] Widget hiển thị số node, depth, thời gian tính của thuật toán AI** | **Mở rộng (Stretch P2)** |
| 20 | **Demo Admin Controls** | **[P2 - Tool] Phím tắt giả lập rớt mạng 60s và khôi phục phục vụ bảo vệ đồ án** (chỉ bật bằng cờ chế độ demo, không có vai trò Admin) | **Mở rộng (Stretch P2)** |
| 21 | **Khôi phục Username / đặt lại mật khẩu & Phiên đăng nhập** | **[PWD-RESET]**: sau OTP hợp lệ hiện Username, chỉ quên Username thì giữ mật khẩu; cần thì đặt mật khẩu mới, về Đăng nhập (1.7, PO chốt 05/10). **[SESSION]** `Quyết định 1.7, 1.8`; hạn phiên cố định từ đăng nhập; hết phiên trong ván theo ân hạn; đăng nhập thiết bị khác xử thua ván đang chạy, đăng xuất thiết bị cũ, thiết bị mới về Sảnh | **P1** (phiên); **P2** (khôi phục Username/mật khẩu) |
| 22 | **Hệ thống Bạn bè & Thông báo** | **[FRIENDS]** `Quyết định 5.5` (nền cho chat 1-1, mời vào phòng, Thách đấu) | **P1** (kết bạn, trạng thái, mời bạn bè online); **P2** (chat 1-1, Thách đấu) |
| 23 | **Luật cờ bổ sung & Hàng đợi/chống gian lận Ranked** (đã duyệt) | **[RULES-EXTRA] + [RANKED-GUARD] + [ROOM-SPEC]** `Quyết định 3.5, 7.2, 2.7` | **P1** (3.5, 2.7); **P2** (7.2) |
| 24 | **Ràng buộc chung & Danh sách loại trừ** (đã duyệt) | **[GLOBAL-CONSTRAINTS] + [OUT-OF-SCOPE]** `Quyết định 10.1, 10.2` | **P1 — MVP** |
| 25 | **Vào phòng, ghế/người xem, đề nghị trong ván, kết quả ván** (đã duyệt 03/10; bổ sung PO 05/10) | Mất mạng khi đếm bắt đầu ván tự tạo: huỷ/reset Sẵn sàng, giữ ghế 60 giây (2.3); mời xuống ghế cần chấp nhận, không giữ ghế (2.8); camera/mic tắt, chọn sẵn Chỉ đối thủ (4.1). **[ROOM-ACCESS] + [PROPOSALS] + [RESULT-TYPES]** `Quyết định 2.0, 2.3, 2.8, 3.6, 7.3` (sau ván/Tái đấu ghép ngẫu nhiên chốt 05/10; chat riêng giữ khi cùng cặp Đổi bên/chơi tiếp trong cùng phòng ở P1, Tái đấu ở P2; thay người thì đặt mốc mới theo 5.3; kèm sửa 1.2, 1.3, 1.4, 2.3, 4.3, 5.3, 6.2) | **P1** (2.8; Xin hòa và **Xin đổi bên** trong 3.6 — Xin đổi bên lên P1 ngày 07/10, Phần 0 mục 0.6); **P2** (ghép ngẫu nhiên, Tái đấu, 7.3, Xin đi lại) |
| 26 | **Giao diện theo phân kỳ** | Quyết định 10.3: Kỳ Đài Cổ Phong mặc định; đồng bộ phông theo DESIGN §3.1 (PO chốt 05/10); bộ chọn Giấy Sáng/Theo hệ thống | **P1** (giao diện mặc định); **P2** (bộ chọn) |
| 27 | **Công bố luật rút gọn** | Quyết định 10.4: Luật chơi mở rộng/thu gọn trong Sảnh, không thêm màn hình | **P1** |
| 28 | **Chốt 07/10/2026** | Phần 0: lịch đến 05/11, đăng nhập + khoá thử sai, Khách P1, SMTP ngoài, Sảnh PUBLIC Vào chơi/Vào xem, Xin đổi bên P1, sau ván về WAITING, Tái đấu chọn phe (P2), Ván mới AI, Jira lập lại | **P1** (trừ Tái đấu: P2) |
| 29 | **Chốt review và lập lại kế hoạch 09/10/2026** | 0.1: BA/lập kế hoạch 09/10, phát triển từ 10/10, giữ hạn 05/11 và 9/27/71. 0.17: từ chối username chứa từ cấm ngay bước nhập; thắng/thua ưu tiên hơn hoà 120 nửa nước, chiếu hết cao nhất; restart phòng tự tạo về WAITING, Ở lại/Rời | **P1** |

> **Lưu ý đọc nhật ký (07/10):** các nhật ký dưới đây là lịch sử. Mọi tham chiếu `docs/...` trỏ tới bộ tài liệu đã xoá 07/10 (xem trong git tại `c4cf29d^`). Câu "không mở danh sách phòng công khai" ở nhật ký đồng bộ 05/10 đã bị thay bởi lần chốt lại MVP cùng ngày và Phần 0. Các số đếm US/AC trong nhật ký không còn hiệu lực; số hiện hành ở BACKLOG-P1.md.

## Nhật ký hoàn thiện 04/10/2026

Product Owner duyệt trực tiếp trong phiên: phạm vi đặc tả cả P1/P2; tổ chức tài liệu và loại trừ Jira/kế hoạch/mockup; giao diện (10.3); luật ở Sảnh (10.4); Đăng xuất (1.8); phục hồi đăng ký (1.1); đề nghị không modal (3.6); Thử lại AI (6.1); chủ động rời AI (6.3); hết hạn FINISHED và giữ LOCKED (3.3, 2.8); giới hạn/lời mời ngược chiều (5.5); làm tròn Elo, đồng hạng và biên hàng đợi (7.1, 7.2); sau ván RANKED (7.2); cấu hình Thách đấu (2.7); trạng thái đọc và badge 1-1 (5.2). Các mục trên là nguồn định nghĩa, nhật ký này không lặp lại luật. Chi tiết hợp đồng và truy vết nằm ở `docs/07-hop-dong-nghiep-vu.md` và `docs/08-ma-tran-nghiem-thu.md`. SMTP: dùng SMTP mặc định của Supabase, demo chỉ email thành viên nhóm (10.1).

## Nhật ký đồng bộ 05/10/2026 (đợt trước khi chốt lại MVP)

Product Owner xác nhận giữ Google ở P1, tối đa 5 người xem ngay ở P1 và số lượng 24 thành phần P1 / 13 P2; duyệt bố cục chat theo thiết bị ở 5.3 và đường dẫn Replay duy nhất ở 6.2. Bỏ mục nâng trần người xem khỏi danh sách P2.

Product Owner chốt bốn lựa chọn chơi (2.0), Đánh Thường ghép ngẫu nhiên cố định 15 phút mỗi bên và giữ P2. Người xem chỉ phục vụ phòng tự tạo; quyền mời đã chốt ở 2.7: mời nhanh bạn bè online hoặc chia sẻ link/mã cho người chưa kết bạn, không mở danh sách phòng công khai. Thân tài liệu và ma trận đã đồng bộ các điểm này. Product Owner đã trả lời 1A, 2A, 3A, 4A, 5A và đồng ý câu 6: các quyết định tương ứng đã ghi tại 2.0, 2.3, 2.7, 3.2, 3.6, 5.3 và 10.3; không còn điểm chờ trả lời trong bộ sáu câu hỏi này. Bộ `docs/` được đối soát riêng theo các quyết định 05/10; `Jira/` và mockup chưa đối soát trong đợt này.

Làm rõ câu chữ ở 3.2 theo luật hiện hành: đối thủ có quyền chấp nhận hoặc từ chối đề nghị, không bị bắt buộc chấp nhận. Câu hỏi của PO về cách diễn đạt không được coi là quyết định cho phép người chơi tự đi lại khi chưa được chấp nhận.

Product Owner chọn A cho cả hai câu hỏi rà soát `docs/`: dọn bản xác thực Google mới chưa hoàn tất (1.2) và xử lý hết hạn phiên đăng nhập trong ván theo ân hạn (1.8). Quyết định nghiệp vụ đã chốt; cơ chế triển khai và cổng kiểm chứng kỹ thuật vẫn cần review/đo thực tế.

Đối soát `docs/` theo BA ngày 05/10: 79 mục yêu cầu (53 P1, 26 P2), 275 tiêu chí (160 P1, 115 P2), sau khi ngừng áp dụng danh sách/Vào xem công khai và thêm tiêu chí cho quyết định đã chốt. Đây là số lượng lịch sử trước khi chốt lại MVP, không thay phạm vi tám mục tiêu P1 hay 37 thành phần giao diện; số 54/162 ở nhật ký 04/10 là mốc lịch sử.

## Chốt lại MVP và trả lời review — 05/10/2026

PO yêu cầu tập trung tám mục tiêu MVP và xác nhận theo khuyến nghị: PUBLIC xuất hiện tại Sảnh, CODE_ONLY không xuất hiện, LOCKED chặn người mới; trần hai người xem thay mức năm; hạn phiên cố định từ đăng nhập. Câu trả lời đính kèm được ghi tại 1.7/1.8 (OTP và nhiều tab/thiết bị), 2.0 (ghép ngẫu nhiên P2), 2.3 (Tái đấu P2), 6.1/6.3 (chiếu hết 100% và AI P1 sau khởi động lại). Host thua bình thường vẫn giữ Host theo 2.3. P2 giữ riêng, không mở rộng MVP. Câu 9 về mốc chat khi cùng cặp đổi bên chưa có trả lời; giữ là điểm review P2, không tự duyệt đề xuất. Các thiết kế kỹ thuật/cổng thử nghiệm vẫn chưa được kiểm chứng; không coi việc chốt MVP là duyệt toàn bộ đề xuất kỹ thuật.

Sau chốt lại MVP: 80 US (54 P1, 26 P2), 282 AC (167 P1, 115 P2), 282 TC đối ứng; 37 thành phần/185 trạng thái giữ nguyên. Chỉ là độ phủ đặc tả; kiểm thử ứng dụng/cổng kỹ thuật chưa chạy.

## Đính chính giới hạn người xem — 05/10/2026

PO xác nhận mức hai người xem ở lượt chốt MVP trước là nhầm: **tối đa 5 người xem, tổng cộng 7 người/phòng** ngay ở P1. Khôi phục biểu mẫu đã duyệt trước đó: Không có người xem hoặc tối đa 1–5, mặc định 5; sức chứa bằng 2 người chơi cộng trần người xem đã chọn. Mục giới hạn hai người xem trong nhật ký trước đã bị đính chính này thay thế. PUBLIC/CODE_ONLY/LOCKED và các quyết định MVP khác giữ nguyên.


## Chốt bốn điểm review MVP — PO duyệt 05/10/2026

PO chốt theo các đề xuất: huỷ đếm bắt đầu ván khi mất mạng và reset Sẵn sàng cả hai (2.3); người xem chấp nhận lời mời xuống ghế, lời mời không giữ chỗ (2.8); mức chia sẻ chọn sẵn Chỉ đối thủ, camera/mic vẫn tắt khi vào phòng (4.1); tiêu chí chiếu hết ngắn 100% áp cho cấp Khó (6.1). Đồng bộ ngoại lệ chuyển hướng theo 1.8/2.4, bỏ câu cũ cấm Vào xem từ Sảnh và sửa demo thử chat/media ngay khi đang chơi. Đây là duyệt các quyết định nêu trên, không phải duyệt toàn bộ thiết kế kỹ thuật hay xác nhận các cổng thử nghiệm đã đạt. Hai điểm P2 về mốc chat khi cùng cặp đổi bên và hỗ trợ quên username vẫn còn mở.


## Chốt hai điểm P2 còn mở — PO duyệt 05/10/2026

PO trả lời "1 đồng ý, 2 đồng ý": cùng hai người Đổi bên/Tái đấu trong cùng phòng giữ chat riêng, thay người trong cặp thì đặt mốc chat mới (5.3); dùng luồng email + OTP khôi phục hiện có để cung cấp Username hiện tại, chỉ quên Username không bắt buộc đổi mật khẩu, quên cả mật khẩu thì tiếp tục đặt lại rồi về Đăng nhập (1.7). Cả hai vẫn P2, không mở rộng MVP. Hai ghi chú còn mở trong nhật ký trước đã được quyết định này thay thế; thiết kế kỹ thuật mới và cổng thử nghiệm vẫn cần review/kiểm chứng.

Độ phủ sau bổ sung P2: 80 US (54 P1/26 P2), 283 AC (167 P1/116 P2), 283 TC đối ứng; 37 thành phần/185 trạng thái và 37 ca biên. Đây là độ phủ đặc tả, kiểm thử ứng dụng/cổng kỹ thuật vẫn chưa chạy.

## Nhật ký chốt 08/10/2026

PO trả lời Q1A, Q2A (kèm camera/mic bật được ở phòng chờ), Q3A, Q4A: ghi ở Phần 0 mục 0.12–0.15; đồng ý bố trí LiveKit tự chạy + LiveKit Cloud dự phòng (0.16); dọn các câu còn trỏ tới "Giai đoạn 2" và số đếm cũ.

## Nhật ký chốt 07/10/2026

Sau review BA, PO trả lời Q1–Q10, F1–F5 và câu hỏi bổ sung về đổi bên/đấu lại. Toàn bộ quyết định ghi ở **Phần 0**; các mục 1.3, 2.0, 2.3, 2.4, 2.7, 2.8, 3.3, 6.1, 10.1, 10.4, Phần 11 và ma trận đã sửa kèm nhãn (07/10). Bộ US/AC/TC P1 mới viết lại ở `BACKLOG-P1.md`, thay `docs/` đã xoá.
