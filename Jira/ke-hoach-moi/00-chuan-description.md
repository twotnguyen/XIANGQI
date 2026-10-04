# Kế hoạch mới (bản nháp) — 00: Chuẩn viết Description chi tiết cho Epic, Story, Task

**Ngày:** 2026-10-04 · **Trạng thái:** ĐỀ XUẤT, chờ PO duyệt · **Chưa tạo gì trên Jira.**
**Căn cứ:** hướng dẫn của PO (`Jira/scrum-jira-2026-10-04/Description.md`), nghiên cứu độc lập của Codex và Hermes (đã đối chiếu), tiêu chí chấm của giáo viên (BA 10.1), `08-tong-hop-nghien-cuu-3-agent.md` mục 12, `Components-guide.md`. Bốn mẫu hoàn chỉnh: `00b-mau-description-chi-tiet.md`.

## 1. Vì sao Description hiện có "chưa đủ chi tiết"

So với hướng dẫn của PO, mẫu của 91 task hiện tại còn thiếu:
- **Yêu cầu đánh số (`REQ-xx`) và luật (`BR-xx`)** nên người làm khó biết từng việc cụ thể phải làm; "Kết quả" chỉ liệt kê vài gạch đầu dòng.
- **Hợp đồng vào/ra** (sự kiện, trường dữ liệu, bảng/cột, mã lỗi, thứ tự kiểm) chưa nêu đủ; người làm vẫn phải đoán.
- **Bảng lỗi và trường hợp biên** có kết quả mong đợi chưa tách riêng.
- **Danh sách Developer Self-Test** (người làm tự kiểm trước khi chuyển tester) chưa có, chỉ có "ca kiểm thử" chung chung.
- **Mẫu ghi kết quả tự kiểm**, **điều kiện chuyển QA (Ready for QA)** và **Definition of Done** chưa có.
- Chưa trả lời đủ **bảy câu hỏi** của người nhận việc (mục 5.4).
- Story chưa có Description riêng; Epic mới ở mức tóm tắt.

## 2. Nguyên tắc chung

1. **Một luật chỉ định nghĩa ở một nơi:** BA/`docs/` là nguồn luật. Description **trích tóm tắt có nguồn** để thi hành, không chép lại cả tài liệu; đổi luật thì sửa nguồn rồi đồng bộ ticket.
2. **Cụ thể nhưng không bịa:** repo chưa có mã, nên **không** viết tên tệp, lệnh, đường dẫn như thể đã tồn tại. Được cụ thể bằng: hành vi từng bước, dữ liệu mẫu, kết quả mong đợi, điều kiện lỗi. Chỗ chưa chốt (tên trường, mã lỗi, payload) ghi **"đề xuất thiết kế, chờ nhóm chốt"**, kèm phần hành vi đã chắc chắn và điểm chặn.
3. **Mã US, AC, TC, GATE giữ nguyên nguồn** (`docs/01`, `docs/05`, `docs/08`). `REQ-xx`, `BR-xx`, `ST-xx` là **nhãn cục bộ trong từng ticket**, tham chiếu đầy đủ dạng `TB-02/REQ-03`; không tạo bộ mã nghiệp vụ mới cạnh AC.
4. **Trạng thái trung thực:** mọi ca kiểm ở trạng thái `NOT_RUN` cho tới khi chạy thật; nhánh chờ PO ghi "chờ quyết định"; P2 không lẫn vào P1.
5. **Mock không thay sản phẩm thật:** phân biệt kiểm bằng giả lập (fixture), tích hợp thật và E2E; ca cần hiện vật của task sau phải **chuyển cho task đó** (quy tắc thứ tự của giáo viên).
6. **Description lưu cái ổn định** (yêu cầu, luật, checklist); **comment lưu kết quả từng lần chạy**; **tệp đính kèm/đường dẫn** lưu log dài, kết quả đo, dữ liệu thử lớn.

## 3. Epic

**Epic trả lời:** xây năng lực gì, cho ai, vì sao; trong và ngoài phạm vi; gồm những Story nào; luật xuyên Story nào quan trọng; cần gì để bắt đầu; hội tụ thế nào mới coi là xong; bằng chứng gì; rủi ro/chờ quyết định.

**Mục bắt buộc:** (1) Tên, mục tiêu, nguồn; (2) Người dùng/vai trò; (3) Phạm vi P1 và **ngoài phạm vi** (kể cả P2); (4) Danh sách Story; (5) Luật xuyên Story (quyền, trạng thái, giới hạn, vòng đời; trích nguồn); (6) Bắt đầu khi (hiện vật và quyết định bên ngoài, không "đợi cả Epic khác"); (7) Hành trình nghiệm thu xuyên Story (kịch bản demo D#) và điều kiện thành công đo được; (8) Bằng chứng; (9) Rủi ro/chờ quyết định.

**Không có:** payload, tên hàm, test đơn vị. "Mọi task Done" không đủ để nghiệm thu Epic.

## 4. Story

**Story trả lời:** ai cần gì để làm gì; điều kiện trước; luồng chính; luật; lỗi và luồng thay thế; thế nào là chấp nhận; ngoài phạm vi; phụ thuộc.

**Mục bắt buộc:** (1) Câu chuyện người dùng ("Là …, tôi muốn …, để …"), mã US, Epic, nguồn; (2) **Điều kiện trước** (phiên, vai trò, trạng thái, dữ liệu; không mặc định "đã đăng nhập" là tài khoản hoàn tất); (3) **Luồng chính** (thao tác của người dùng ↔ phản hồi hệ thống, từ điểm vào đến kết quả quan sát được); (4) **Luật nghiệp vụ** có nguồn (`BR-xx`); (5) **Lỗi và luồng thay thế** (điều kiện ⟶ phản hồi giao diện/máy chủ ⟶ dữ liệu giữ hay đổi ⟶ cách tiếp tục); (6) **Tiêu chí chấp nhận: giữ mã AC của `docs/01`**, diễn giải Given–When–Then không đổi nghĩa, không sinh AC mới; (7) Ngoài phạm vi; (8) **Task phục vụ từng nhánh AC** và thành phần; (9) Điểm chưa rõ/chờ PO.

**Story mô tả hành vi, không mô tả cài đặt** (không viết `POST /rooms`; đó là việc của Task). Story chỉ Done khi hành trình thật đạt, không phải khi một Task xong.

## 5. Task (quan trọng nhất)

### 5.1 Mục của một Task đủ chi tiết

Thứ tự đề xuất (Task đơn giản được gộp mục, nhưng không bỏ nội dung thiết yếu):

| # | Mục | Trả lời |
|---|---|---|
| 1 | **Metadata** | Epic, thành phần, Sprint, **bắt đầu khi** (hiện vật cụ thể của từng tiền đề) |
| 2 | **Mục tiêu và bối cảnh** | Việc này tạo ra gì, phục vụ Story/AC nào, ai dùng đầu ra (task sau) |
| 3 | **Phạm vi / ngoài phạm vi** | Làm gì, **không** làm gì (để người làm không làm lan) |
| 4 | **Đầu vào cần có** | Hiện vật chính xác của task trước, quyền truy cập, dữ liệu |
| 5 | **Yêu cầu `REQ-xx`** | Từng việc phải làm, mỗi REQ một trách nhiệm quan sát được |
| 6 | **Luật nghiệp vụ `BR-xx`** | Luật tóm tắt có nguồn (BA/docs) |
| 7 | **Hợp đồng vào/ra** | Đầu vào, đầu ra, trường dữ liệu, mã lỗi, thứ tự kiểm, danh tính lấy từ đâu (đề xuất thiết kế nếu chưa chốt) |
| 8 | **Kết quả mong đợi** | Hệ thống/giao diện/dữ liệu ra sao khi xong |
| 9 | **Lỗi và trường hợp biên** | Bảng: điều kiện ⟶ kết quả mong đợi (quyền, retry, cạnh tranh, lỗi ghi, vượt giới hạn) |
| 10 | **Tiêu chí nghiệm thu của task (GWT)** | Given–When–Then gắn REQ và AC/nhánh nguồn |
| 11 | **Developer Self-Test `ST-xx`** | Bảng: dữ liệu/bước ⟶ kết quả phải thấy; môi trường và fixture |
| 12 | **Ready for QA** | Điều kiện được chuyển cho tester |
| 13 | **Definition of Done** | Điều kiện hoàn tất task |
| 14 | **Bàn giao / bằng chứng** | Hiện vật bàn giao cho task sau; bằng chứng cần nộp; **ca giao hậu nhiệm** (task nào nhận, hiện vật nào) |
| 15 | **Rủi ro / chờ quyết định / tham khảo** | Nhánh chờ PO, giả định, điều kiện tháo chặn, nguồn |

### 5.2 Viết `REQ`, `BR` và hợp đồng cho đủ cụ thể

- **Mỗi `REQ` nói một trách nhiệm quan sát được**: đầu vào hợp lệ là gì, kiểm cái gì, theo thứ tự nào, tác động nào, đầu ra nào. Ví dụ tốt: "xác thực danh tính ⟶ tra biên lai theo (user_id, command_id) ⟶ nếu lặp trả kết quả cũ ⟶ chỉ lệnh mới kiểm vị trí và giới hạn ⟶ ghi phòng, Host, biên lai ⟶ ACK". Ví dụ chưa đạt: "xử lý tạo phòng an toàn".
- **Sự kiện thời gian thực (Socket.IO):** nêu tên sự kiện (đã có ở `docs/04` §4.1), danh tính lấy từ đâu (không tin `user_id` client gửi), `commandId`, các trường và miền giá trị/mặc định, ACK/snapshot, nhóm lỗi, retry, thứ tự kiểm. **Không** dùng mã HTTP (201/401) cho ACK Socket.IO.
- **Dữ liệu:** bảng/cột đã có ở `docs/03`; khoá và ràng buộc; trạng thái ở bộ nhớ hay bền; ai đọc/ghi. Không phát minh schema như đã có.
- **Giao diện:** màn/khung, điểm gắn vào shell, dữ liệu vào, sự kiện ra, năm trạng thái và chuyển trạng thái, bàn phím, responsive, nội dung lỗi, điều hướng; thay "khớp Figma" bằng `DESIGN.md` và `DANH-MUC`.
- **Luật cờ/máy cờ:** mô hình vào/ra, bất biến không sửa đầu vào, toạ độ, thế mẫu cụ thể (FEN) và kết quả mong đợi **có nguồn độc lập**; không dùng chính hàm đang kiểm để sinh kết quả mong đợi.

### 5.3 Developer Self-Test: người làm tự chứng minh trước khi chuyển tester

- Mỗi `ST-xx` có **dữ liệu/bước cụ thể ⟶ kết quả phải thấy ⟶ gắn REQ/AC**. Chỉ ghi "đã test" hoặc "chạy test" là không đạt.
- Bỏ mục không áp dụng bằng `N/A` kèm lý do được review; không bỏ im lặng.
- Self-Test là **phép kiểm của người làm** (đúng build, đúng dữ liệu), **không thay** ca kiểm độc lập của tester.

**Danh sách phép tự kiểm theo loại task** (chọn mục liên quan; đây là checklist đề xuất, chưa chạy):

| Loại | Các phép tự kiểm cần có |
|---|---|
| Máy chủ / sự kiện | Đầu vào đúng, sai kiểu, biên; gọi trực tiếp sai vai; **retry cùng `commandId` sau mất ACK**; lệnh mới với version cũ; hai lệnh cạnh tranh một tài nguyên; lỗi trước/sau ghi; payload thô không chứa dữ liệu trái quyền |
| Giao diện web | Mở đúng màn; validate từng biên; **đủ năm trạng thái** kèm tooltip; bấm kép/mất ACK; không điều hướng khi lỗi; bàn phím, focus; bốn kích thước (360/390/1366/1920 px); ghi rõ dữ liệu thật hay fixture |
| Bàn cờ / luật thuần | Thế cụ thể + bên đi; hợp lệ, bị ghim, lộ Tướng; chặn chân/ngòi; hai phe; chiếu hết/hết nước; lặp thế, 120 nửa nước nếu thuộc task; đối chiếu perft khi đã có oracle |
| CSDL / migration | Chạy trên DB thử sạch; kiểm cột, khoá chính/ngoại, unique, not null; thao tác trái quyền bằng client; dữ liệu trước–sau; lỗi và khôi phục |
| Máy cờ / tiến trình | Tiến trình riêng, IPC thật; nước đúng thế; hết ngân sách thì lấy độ sâu hoàn tất; crash/watchdog có/không `progress`; kết quả cũ bị bỏ; tìm tĩnh khi bị chiếu |
| Media / LiveKit | Mặc định tắt; camera và mic độc lập; mọi mức chia sẻ; người xem gọi publish trực tiếp; đuổi/đổi vai/tab/token cũ; quyền thiết bị lỗi; không ghi media |
| Tích hợp web ↔ máy chủ | Nêu cặp hiện vật hai phía và build; chạy qua hai phía thật; hai danh tính; mất ACK/đổi quyền/lỗi dữ liệu; đối chiếu giao diện với trạng thái bền |
| QA / PoC / Spike | QA: chạy đủ phạm vi, ghi cả FAIL/BLOCKED; PoC: câu hỏi, timebox nhóm đặt, kết quả thô, kết luận đạt/không đạt/chưa kết luận; ghi mọi hạn chế |
| DevOps | Cài/build/triển khai theo cơ chế khai báo; kiểm kết nối thật; gây lỗi có kiểm soát; không lộ bí mật; khởi động lại; CI bắt test cố ý sai |

### 5.4 Bảy câu hỏi mà Task phải trả lời

| Câu hỏi | Tìm thấy ở mục | Dấu hiệu chưa đạt |
|---|---|---|
| **WHY** vì sao làm | Mục tiêu, bối cảnh | Chỉ lặp lại tên task |
| **WHAT** làm gì | `REQ`, kết quả | "Làm API" mà không rõ tác động |
| **WHERE** ở phần nào | Thành phần, phạm vi, hợp đồng | Bịa tên tệp, hoặc chỉ ghi "backend" |
| **HOW BEHAVE** hệ thống ra sao | `BR`, hợp đồng, GWT | Chỉ đường thuận, bỏ quyền/retry |
| **WHAT CAN GO WRONG** lỗi gì | Bảng lỗi và biên | "Xử lý lỗi phù hợp" không có kết quả mong đợi |
| **HOW VERIFY** tự kiểm thế nào | `ST-xx` | "Chạy test" không nói test gì |
| **WHEN DONE** khi nào xong | Nghiệm thu, Ready for QA, DoD | Coi Ready for QA là Done |

### 5.5 Mẫu comment "Developer Self-Test Result" (điền khi chạy thật)

```text
Developer Self-Test Result
Task / phiên bản Description: <ID, ngày chốt hợp đồng>
Người kiểm / thời điểm: <thực tế>
Môi trường: <local/test, DB hoặc Cloud thử; không bí mật>
Nhánh / commit / build: <giá trị thật; cây làm việc sạch hay có thay đổi>
Phạm vi: <hiện vật tự kiểm; chỗ nào fixture, chỗ nào dịch vụ thật>
Thiết lập / fixture: <cách tạo, dữ liệu vào, cách dọn>
Cách chạy: <lệnh thật vừa chạy hoặc thao tác tay tái lập>
Kết quả từng mục:
- <ST-01; REQ; AC/nhánh> — PASS / FAIL / BLOCKED / NOT_RUN / N/A
  Input / expected / actual: <ghi đủ, không chỉ "OK">
  Bằng chứng: <log, ảnh, trace đúng build; đã che bí mật>
Tổng hợp: <số mục theo trạng thái, đếm bằng công cụ>
Lỗi còn lại: <lỗi, bước tái lập, ảnh hưởng, nơi theo dõi>
Ca chưa nghiệm thu ở task này: <AC/nhánh ⟶ task nhận + hiện vật>
Kết luận: READY FOR QA hoặc NOT READY (lý do)
```
Khi chưa có mã, mọi mục là `NOT_RUN`; không dán ví dụ PASS vào Jira như bằng chứng. Sửa mã sau khi tự kiểm thì **kiểm lại phần bị ảnh hưởng trên build mới**.

### 5.6 Phân biệt các khái niệm hay nhầm

| Khái niệm | Câu hỏi | Ai | Ở đâu |
|---|---|---|---|
| **Acceptance Criteria (AC)** nguồn | Hành vi nào phải đúng? | PO/nhóm | `docs/01` (giữ mã) |
| Tiêu chí nghiệm thu của task (GWT) | Hiện vật này phải chứng minh gì? | Tác giả task | Description, gắn REQ và AC |
| **Developer Self-Test** | Người làm đã tự kiểm gì trên build nào? | Người làm | Checklist trong Description + comment kết quả |
| **Ca của tester (TC)** | Xác minh độc lập bằng trường hợp nào? | Tester | `docs/08`; tester mở rộng thêm |
| **Ready for QA** | Đủ điều kiện bàn giao kiểm chưa? | Người làm | Điều kiện trong Description |
| **Done (task)** | Đủ chất lượng để nhận chưa? | Nhóm | DoD |
| **Done (Story/Increment)** | Hành trình thật đạt chưa? | Nhóm + PO | AC thật + DoD sản phẩm |

**Ready for QA khác Done.** Task nền có thể hoàn tất phần của mình khi Story chưa Done. Tester thiết kế ca từ AC **song song** với người làm, không đợi tự kiểm xong.

## 6. Quy trình Jira liên quan [CHƯA KIỂM cấu hình XIAN]

- **Nên bắt buộc bằng chứng tự kiểm trước khi bàn giao**, không nhất thiết thêm trạng thái. Luồng đề xuất: To Do ⟶ In Progress (viết mã và tự kiểm lặp lại) ⟶ In Review ⟶ **Ready for QA** ⟶ QA ⟶ Done; QA lỗi quay về In Progress. Thêm "Dev Testing" chỉ khi cần thấy hàng đợi riêng.
- Nếu XIAN chưa có trạng thái: giữ trạng thái hiện có, đưa mục bàn giao và comment chuẩn vào ticket; có thể dùng nhãn `ready-for-qa`, `qa-failed`. Nhãn và checklist **không tự cưỡng chế** chuyển trạng thái.
- **Cấp bậc (cần PO chọn trước khi nhập):** Story và Task chuẩn của Jira là **cùng cấp dưới Epic**; Sub-task mới là con trực tiếp của Story. Hai cách: **(a)** Task chuẩn dưới Epic, liên kết `relates to` Story (bản kế hoạch hiện theo cách này); **(b)** việc dưới Story dùng Sub-task (cần kiểm loại này có trên XIAN). Chọn một quy ước chủ đạo.

## 7. Độ dài và định dạng

- **Jira Cloud giới hạn trường Description và comment ở 32.767 ký tự** (ĐÃ ĐỌC; là ký tự, không phải từ; chưa đo cách XIAN tính độ dài khi lưu định dạng nâng cao). Không nhắm sát giới hạn.
- **Khoảng đề xuất (tham khảo biên tập, không phải chuẩn Atlassian):** Epic 3.000–6.000 ký tự; Story 4.000–9.000; **Task 5.000–12.000** (task rủi ro cao tối đa khoảng 18.000); **cảnh báo nội bộ ở 20.000 ký tự**. Task quá dài thường là Task ôm nhiều trách nhiệm, nên xem xét tách.
- Bảng ít cột, mỗi hàng một tình huống; ca nhiều bước dùng danh sách đánh số. Checkbox tick được không đồng nghĩa đã kiểm.
- Nhập qua REST dùng định dạng ADF, không gửi Markdown rồi tin nó tự thành bảng: **pilot một ticket** có tiếng Việt, bảng, checkbox rồi đọc lại trước khi nhập hàng loạt.
- Log dài, kết quả đo, bộ dữ liệu thử lớn: đính kèm hoặc dẫn đường dẫn có phiên bản, không dán vào Description.

## 8. Điểm khác với `Description.md` của PO (cần điều chỉnh khi áp dụng)

| Trong hướng dẫn mẫu | Với XIANGQI |
|---|---|
| `POST /api/rooms`, mã `201/401`, Bearer token | Dự án dùng **sự kiện Socket.IO** (`room.create`…) và Supabase Auth; ACK có `ok`/`error{code}`, không dùng mã HTTP cho ACK |
| Mã phòng 6 ký tự, chủ phòng "OWNER", chỉ chủ phòng được bắt đầu ván | BA: mã phòng **8 ký tự**, Host ngồi ghế Đỏ, ván bắt đầu khi **hai người Sẵn sàng** |
| "Khớp Figma", "coding standards" | Dùng `DESIGN.md`, `DANH-MUC`, quy ước nhóm khi có |
| "Tester ánh xạ TC ↔ REQ" | Giữ mã TC của `docs/08`; `REQ` là nhãn cục bộ, truy vết `US ⟶ AC ⟶ REQ ⟶ ST ⟶ TC` |
| Task là con trực tiếp của Story | Jira chuẩn: Task cùng cấp Story (xem mục 6) |
| Ví dụ đường thuận | Bổ sung quyền, retry, cạnh tranh, giới hạn, mất kết nối theo `docs/07` |

## 9. Checklist duyệt một Description (14 dòng)

1. Có mục tiêu và nêu ai/việc nào dùng đầu ra.
2. Phạm vi P1, ngoài phạm vi (kể cả P2) rõ; không tự thêm yêu cầu.
3. Mã US/AC/TC/GATE dùng đúng và tồn tại; luật có nguồn cụ thể.
4. Mỗi tiền đề chỉ ra **hiện vật cụ thể** task thật sự cần.
5. Đầu vào, đầu ra và điểm tích hợp đủ rõ để bắt đầu.
6. Mỗi `REQ` có hành vi và kết quả quan sát được; `BR` không chép sai nguồn.
7. Quyền, biên, lỗi, retry, cạnh tranh liên quan đều có kết quả mong đợi.
8. Payload, mã lỗi, schema đã chốt hoặc ghi rõ "đề xuất, chờ nhóm chốt" và người chốt.
9. GWT gắn với yêu cầu nguồn, không sinh mã AC chính thức tuỳ ý.
10. Self-Test có dữ liệu, bước, kết quả mong đợi, môi trường, bằng chứng cần thu.
11. Phân biệt fixture, tích hợp thật và E2E; không nhận giả lập thay sản phẩm thật.
12. Ready for QA khác Done; PASS của task chỉ dựa trên hiện vật của task và tiền đề; ca cần task sau đã chuyển sang task đó.
13. Không bịa tệp, lệnh, build, PASS; nhánh chờ PO ghi "chờ quyết định".
14. Đọc được, không chép cả tài liệu nguồn, đủ để người sau tái lập kết quả.

## 10. Câu hỏi cho PO (cần trả lời trước khi viết lại hàng loạt)

1. **Duyệt chuẩn này và bốn mẫu ở `00b`?** Nếu cần mức chi tiết khác (nhiều hơn hay ít hơn) thì nêu rõ.
2. **Cấp bậc Jira:** (a) Task chuẩn dưới Epic liên kết Story, hay (b) Sub-task dưới Story?
3. **Trạng thái Jira:** có tạo "Ready for QA" (và "Dev Testing") không, hay dùng nhãn và comment chuẩn?
4. **Mức độ cụ thể của hợp đồng:** các payload/mã lỗi chưa chốt sẽ do task `T0-03` quyết; trong Description của task khác ghi "đề xuất, chờ chốt ở `T0-03`". Đồng ý?
5. Sau khi duyệt, ưu tiên viết lại **91 Task trước**, rồi **53 Story**, rồi **10 Epic** (nhóm sẽ chéo kiểm từng lô). Đồng ý thứ tự này?
