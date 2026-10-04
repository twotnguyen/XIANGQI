# Story của các Epic: "Hai người đánh cờ qua mạng"; "Phòng công khai, khoá phòng và người xem"; "Chat, camera và micro"; "Đánh với máy theo cấp độ" (12 Story)

**Ngày:** 2026-10-04 · **Trạng thái:** đề xuất, chờ PO duyệt · Chưa tạo gì trên Jira · Viết theo `00-chuan-description.md` và mẫu `00b`.

**Cách đọc:** mỗi Story là một việc người dùng muốn làm, viết theo mẫu Story đầy đủ: câu chuyện; nguồn (mã đặc tả); phạm vi có/không; điều kiện để dùng; bắt đầu khi; các bước; quy tắc; khi có lỗi; năm trạng thái giao diện; **bảng tiêu chí chấp nhận đối chiếu từng tiêu chí của đặc tả (có cách kiểm và Task kiểm)**; điều kiện hoàn thành; điểm còn mở; bằng chứng; liên kết. Task nằm dưới Epic và được liên kết với Story bằng quan hệ "liên quan". Mã `AC-…`, `US-…` chỉ là mã đặc tả để truy vết, không phải số Jira.

---

### Story 15 — Đi nước qua mạng và bảng nước đi
**Thuộc Epic:** Hai người đánh cờ qua mạng · **Thành phần:** Frontend, Game Server
**Nhãn:** `P1`, `US-PLAY-01`, `US-PLAY-10` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống (nhóm tự nhận khi kéo việc) · **Sprint:** chưa gán (Task của Story nằm ở Sprint 2, 3)

**Câu chuyện:** Là người chơi, tôi muốn **đi nước và thấy đối thủ cùng người xem thấy ngay**, kèm bảng các nước đã đi.

**Nguồn (đặc tả)**
- US-PLAY-01 — Đi nước qua mạng (BA 3.3; [04] mục 4)
- US-PLAY-10 — Bảng nước đi ([02] mục 7)
- Tiêu chí gốc ở `docs/01-yeu-cau-chi-tiet.md`: AC-PLAY-01-01, AC-PLAY-01-02, AC-PLAY-01-03, AC-PLAY-01-04, AC-PLAY-10-01.
- Màn hình và thành phần giao diện (`DANH-MUC-MAN-HINH-XIANGQI.md`): Màn hình Ván đấu (`SCR-GAME-ROOM`).

**Nhu cầu và phạm vi**
- **Có:** Đi nước qua mạng; Bảng nước đi.
- **Không:** đồng hồ (Story 16); kết thúc ván (Story 17); tua lại nước đi; xuất ván cờ.

**Điều kiện để dùng:** ván đã bắt đầu; đến lượt mình.

**Bắt đầu khi (phụ thuộc)**
- Cần có kết quả của các Task sau (nằm ngoài Story này), vì chúng cho ra đầu vào của các Task của Story:
  - T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ
  - T-04 — Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập
  - T-08 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)
  - T-09 — Luật cờ: nước hợp lệ, chiếu, chiếu hết, hết nước, lặp thế, 120 nửa nước
  - T-10 — Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ
  - T-22 — Giao diện: kéo thả quân, đánh dấu nước vừa đi, cảnh báo chiếu, âm thanh
  - T-25 — Máy chủ: chọn ghế, Sẵn sàng, đếm 3 giây, bắt đầu ván
  - T-29 — Nối web với máy chủ: tạo phòng, vào phòng, ghế, Sẵn sàng, bắt đầu ván

**Các bước người dùng làm và hệ thống phản hồi**
1. Người chơi đi một nước (bấm hoặc kéo); quân hiển thị **mờ** chờ xác nhận.
2. Máy chủ kiểm tra: đúng ghế, đúng lượt, nước hợp lệ.
3. Máy chủ xác nhận và phát thế cờ mới cho cả phòng; quân hết mờ.
4. **Bảng nước đi** thêm một dòng bằng **ký hiệu tiếng Việt** (ví dụ "Pháo 2 bình 5", "Mã 8 tiến 7") và tự cuộn tới nước mới nhất.

**Các quy tắc**
- **Máy chủ quyết định**, không tin thế cờ do trình duyệt gửi. Người xem nhận thế mới trong **dưới 100 ms** trên mạng nội bộ.
- Lệnh gửi trùng (cùng mã yêu cầu) chỉ có một tác dụng; lệnh dựa trên bản ván cũ bị từ chối kèm thế mới.
- Ký hiệu tính theo **phe người đi**, không theo bàn đang lật; mỗi nước một dòng, không thiếu không trùng khi nối lại.

**Khi có lỗi**
nước không hợp lệ → quân về chỗ cũ, ván không đổi; mất phản hồi → gửi lại không đi hai nước; lỗi ghi dữ liệu → thử lại, vẫn lỗi thì tạm dừng ghi và đóng băng đồng hồ; ván chưa có nước → bảng hiện trạng thái trống đúng.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**
| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
|---|---|---|---|---|---|
| Màn hình Ván đấu | Thế/giờ/lượt đồng bộ máy chủ | Đợi snapshot hoặc ACK nước đi | Chưa có nước: thế đầu và hướng dẫn, không bàn trắng | Mất kết nối/ghi lỗi: không phát nước giả, phục hồi theo [07] | Ngoài lượt, chỉ xem, phiên cũ hoặc ván đã kết thúc |

**Tiêu chí chấp nhận và cách kiểm (đối chiếu từng tiêu chí của đặc tả)**
| Mã tiêu chí | Điều kiện đạt | Cách kiểm | Task kiểm |
|---|---|---|---|
| `AC-PLAY-01-01` | Chỉ người ngồi ghế, đúng lượt, gửi được nước đi; máy chủ kiểm hợp lệ và phát thế mới cho cả phòng (người chơi và người xem) trong dưới 100 ms trên mạng nội bộ. | Hai trình duyệt luân phiên đi; người xem và người sai lượt thử; đo ở bài tải. | T-28, T-30, T-61 |
| `AC-PLAY-01-02` | Nước không hợp lệ bị từ chối và quân về chỗ cũ; trạng thái ván không đổi. | Gửi nước tự chiếu, lộ Tướng. | T-09, T-28, T-30 |
| `AC-PLAY-01-03` | Lệnh gửi trùng (cùng mã yêu cầu) không làm đi hai lần; lệnh dựa trên bản ván cũ bị từ chối kèm thế mới. | Gửi trùng khi mất phản hồi; gửi với phiên bản cũ. | T-10, T-28, T-30 |
| `AC-PLAY-01-04` | Quân vừa gửi hiển thị mờ chờ xác nhận, rồi cố định khi máy chủ xác nhận. | Làm chậm phản hồi; quan sát. | T-26, T-30 |
| `AC-PLAY-10-01` | Hiển thị danh sách nước đi theo ký hiệu tiếng Việt (ví dụ Pháo 2 bình 5), tự cuộn tới nước mới nhất. | Hai phe, quân trùng cột, nối lại. | T-42, T-50 |

**Điều kiện hoàn thành (PASS khi)**
- Mọi dòng trong bảng tiêu chí ở trên đều **đạt**, có bằng chứng; dòng nào không đạt thì Story chưa xong.
- Mọi màn hình ở bảng 5 trạng thái đều hiện đúng cả 5 trạng thái (thành công, đang tải, trống, lỗi, bị khoá có chú thích).
- Các Task liên kết đều đã xong và đã được người kiểm thử và người xem lại mã đồng ý; các điều kiện chấp nhận được kiểm ở máy chủ, không chỉ ở giao diện.
- Không có lỗi mức Cao hoặc Nghiêm trọng còn mở thuộc Story này.

**Còn mở / chờ quyết định:** Yêu cầu dưới 100 ms chỉ đo được ở bài tải khi cả luồng đã nối thật.

**Bằng chứng nộp:** trạng thái ban đầu là NOT_RUN (chưa chạy). Khi chạy, ghi bản dựng, môi trường, kết quả từng dòng (đạt / không đạt / bị chặn), ảnh hoặc nhật ký đã che bí mật.

**Liên kết Jira (khi được phép tạo):** Epic: Hai người đánh cờ qua mạng; liên quan tới (relates to) các Task: T-26 (Giao diện ván: bàn cờ nối mạng, đồng hồ, nút, hộp kết quả, khung xin hoà); T-28 (Máy chủ: bộ xử lý lệnh của ván và xử lý nước đi); T-30 (Nối web với máy chủ: đi nước, đồng bộ thế cờ giữa hai trình duyệt); T-42 (Bảng nước đi: ký hiệu tiếng Việt và hiển thị).

---

### Story 16 — Đồng hồ ván
**Thuộc Epic:** Hai người đánh cờ qua mạng · **Thành phần:** Frontend, Game Server
**Nhãn:** `P1`, `US-PLAY-02` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống (nhóm tự nhận khi kéo việc) · **Sprint:** chưa gán (Task của Story nằm ở Sprint 2, 3)

**Câu chuyện:** Là người chơi, tôi muốn **đồng hồ chạy công bằng** và thua nếu hết giờ.

**Nguồn (đặc tả)**
- US-PLAY-02 — Đồng hồ (BA 2.1, 3.3)
- Tiêu chí gốc ở `docs/01-yeu-cau-chi-tiet.md`: AC-PLAY-02-01, AC-PLAY-02-02, AC-PLAY-02-03.
- Màn hình và thành phần giao diện (`DANH-MUC-MAN-HINH-XIANGQI.md`): Màn hình Ván đấu (`SCR-GAME-ROOM`).

**Nhu cầu và phạm vi**
- **Có:** Đồng hồ.
- **Không:** giờ "không giới hạn", hoàn hay cộng giờ.

**Điều kiện để dùng:** ván đang diễn ra.

**Bắt đầu khi (phụ thuộc)**
- Cần có kết quả của các Task sau (nằm ngoài Story này), vì chúng cho ra đầu vào của các Task của Story:
  - T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ
  - T-08 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)
  - T-22 — Giao diện: kéo thả quân, đánh dấu nước vừa đi, cảnh báo chiếu, âm thanh
  - T-28 — Máy chủ: bộ xử lý lệnh của ván và xử lý nước đi
  - T-30 — Nối web với máy chủ: đi nước, đồng bộ thế cờ giữa hai trình duyệt
  - T-40 — Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời
  - T-42 — Bảng nước đi: ký hiệu tiếng Việt và hiển thị
  - T-44 — Máy chủ: người xem theo dõi trực tiếp, lọc dữ liệu theo vai trò
  - T-45 — Máy chủ: rời phòng giữa ván, mất kết nối, giữ chỗ, kết nối lại, ván gián đoạn

**Các bước người dùng làm và hệ thống phản hồi**
1. Mỗi bên có 5, 10 hoặc 15 phút (theo phòng); **không cộng giây**.
2. Đồng hồ của bên đang đi chạy, bên kia dừng.
3. Còn dưới **30 giây** thì hiện cảnh báo (chữ, biểu tượng và đổi màu).
4. Hết giờ thì ván kết thúc, bên hết giờ thua.

**Các quy tắc**
**máy chủ tính giờ**; trừ giờ trước khi xét nước đi; đồng hồ trên trình duyệt chỉ để hiển thị.

**Khi có lỗi**
lỗi ghi dữ liệu thì **đóng băng cả hai đồng hồ**; quá 30 giây không hồi phục thì ván gián đoạn.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**
| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
|---|---|---|---|---|---|
| Màn hình Ván đấu | Thế/giờ/lượt đồng bộ máy chủ | Đợi snapshot hoặc ACK nước đi | Chưa có nước: thế đầu và hướng dẫn, không bàn trắng | Mất kết nối/ghi lỗi: không phát nước giả, phục hồi theo [07] | Ngoài lượt, chỉ xem, phiên cũ hoặc ván đã kết thúc |

**Tiêu chí chấp nhận và cách kiểm (đối chiếu từng tiêu chí của đặc tả)**
| Mã tiêu chí | Điều kiện đạt | Cách kiểm | Task kiểm |
|---|---|---|---|
| `AC-PLAY-02-01` | Mỗi bên có 5/10/15 phút, không cộng giây; đồng hồ bên tới lượt chạy, bên kia dừng. | Khởi tạo ba mức; đi nước. | T-39 |
| `AC-PLAY-02-02` | Hết giờ thì ván kết thúc do hết giờ và bên đó thua; máy chủ tính giờ trước khi xét nước đi. | Gửi nước khi giờ còn đúng 0. | T-39, T-50 |
| `AC-PLAY-02-03` | Dưới 30 giây đồng hồ hiện biểu tượng cảnh báo và đổi màu kèm chữ hoặc biểu tượng. | Cho giờ xuống dưới 30 giây. | T-26, T-50 |

**Điều kiện hoàn thành (PASS khi)**
- Mọi dòng trong bảng tiêu chí ở trên đều **đạt**, có bằng chứng; dòng nào không đạt thì Story chưa xong.
- Mọi màn hình ở bảng 5 trạng thái đều hiện đúng cả 5 trạng thái (thành công, đang tải, trống, lỗi, bị khoá có chú thích).
- Các Task liên kết đều đã xong và đã được người kiểm thử và người xem lại mã đồng ý; các điều kiện chấp nhận được kiểm ở máy chủ, không chỉ ở giao diện.
- Không có lỗi mức Cao hoặc Nghiêm trọng còn mở thuộc Story này.

**Còn mở / chờ quyết định:** Không có điểm chờ quyết định.

**Bằng chứng nộp:** trạng thái ban đầu là NOT_RUN (chưa chạy). Khi chạy, ghi bản dựng, môi trường, kết quả từng dòng (đạt / không đạt / bị chặn), ảnh hoặc nhật ký đã che bí mật.

**Liên kết Jira (khi được phép tạo):** Epic: Hai người đánh cờ qua mạng; liên quan tới (relates to) các Task: T-26 (Giao diện ván: bàn cờ nối mạng, đồng hồ, nút, hộp kết quả, khung xin hoà); T-39 (Máy chủ: đồng hồ ván, kết thúc ván, đầu hàng, xin hoà); T-50 (Nối web với máy chủ: đồng hồ, kết thúc ván, mất kết nối, người xem, bảng nước đi).

---

### Story 17 — Kết thúc ván: kết quả, đầu hàng, xin hoà, lặp thế
**Thuộc Epic:** Hai người đánh cờ qua mạng · **Thành phần:** Game Engine, Frontend
**Nhãn:** `P1`, `US-PLAY-03`, `US-PLAY-04`, `US-PLAY-05`, `US-PLAY-08` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống (nhóm tự nhận khi kéo việc) · **Sprint:** chưa gán (Task của Story nằm ở Sprint 1, 2, 3)

**Câu chuyện:** Là người chơi hay người xem, tôi muốn **ván kết thúc đúng luật và biết kết quả**, kể cả khi đầu hàng, xin hoà hoặc đi lặp thế.

**Nguồn (đặc tả)**
- US-PLAY-03 — Kết thúc ván và kết quả (BA 3.3; [02] mục 3.3)
- US-PLAY-04 — Đầu hàng (BA 3.3)
- US-PLAY-05 — Xin hoà (BA 3.3, 3.5, 3.6)
- US-PLAY-08 — Lặp thế, chiếu liên tục, không ăn quân (BA 3.5; [02] mục 4, 5)
- Tiêu chí gốc ở `docs/01-yeu-cau-chi-tiet.md`: AC-PLAY-03-01, AC-PLAY-03-02, AC-PLAY-03-03, AC-PLAY-04-01, AC-PLAY-05-01, AC-PLAY-05-02, AC-PLAY-05-03, AC-PLAY-05-04, AC-PLAY-08-01, AC-PLAY-08-02.
- Màn hình và thành phần giao diện (`DANH-MUC-MAN-HINH-XIANGQI.md`): Màn hình Ván đấu (`SCR-GAME-ROOM`), Khung Đề nghị hoà (`MODAL-DRAW-PROMPT`), Hộp xác nhận Đầu hàng (`MODAL-CONFIRM-RESIGN`), Hộp Kết quả ván (`MODAL-MATCH-RESULT`).

**Nhu cầu và phạm vi**
- **Có:** Kết thúc ván và kết quả; Đầu hàng; Xin hoà; Lặp thế, chiếu liên tục, không ăn quân.
- **Không:** tái đấu; xem lại ván; đầu hàng khi đăng xuất hoặc rời phòng (Story 3, Story 18); điều kiện đi tối thiểu 20 nước của đánh hạng; luật đuổi quân riêng; hoà do thiếu quân.

**Điều kiện để dùng:** ván đang diễn ra.

**Bắt đầu khi (phụ thuộc)**
- Cần có kết quả của các Task sau (nằm ngoài Story này), vì chúng cho ra đầu vào của các Task của Story:
  - T-01 — Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động
  - T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ
  - T-05 — Luật cờ: mô hình bàn cờ, thế khởi đầu, nước đi của từng loại quân
  - T-08 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)
  - T-22 — Giao diện: kéo thả quân, đánh dấu nước vừa đi, cảnh báo chiếu, âm thanh
  - T-28 — Máy chủ: bộ xử lý lệnh của ván và xử lý nước đi
  - T-30 — Nối web với máy chủ: đi nước, đồng bộ thế cờ giữa hai trình duyệt
  - T-40 — Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời
  - T-42 — Bảng nước đi: ký hiệu tiếng Việt và hiển thị
  - T-44 — Máy chủ: người xem theo dõi trực tiếp, lọc dữ liệu theo vai trò
  - T-45 — Máy chủ: rời phòng giữa ván, mất kết nối, giữ chỗ, kết nối lại, ván gián đoạn

**Các bước người dùng làm và hệ thống phản hồi**
1. Khi chiếu hết, hết nước đi, hết giờ, đầu hàng hay hoà, ván **ngừng nhận nước**; hiện hộp kết quả (thắng, thua hoặc hoà, kèm lý do) chỉ có nút **Rời phòng**; người xem cũng thấy kết quả.
2. **Đầu hàng:** người chơi bấm **Đầu hàng**; hiện xác nhận "Bạn sẽ thua ván này ngay lập tức." (focus mặc định ở **Huỷ**); đồng ý thì thua ngay, đối thủ thắng.
3. **Xin hoà:** người chơi bấm xin hoà; đối thủ thấy khung đề nghị **đếm lùi 30 giây**; người xin thấy "Đang chờ đối thủ trả lời…" và nút **Rút đề nghị**. Đồng ý → hoà; từ chối hoặc hết hạn → ván tiếp tục.
4. Ván đi vòng vòng cũng được kết thúc: thế cờ lặp lần thứ ba, hoặc 120 nửa nước liên tiếp không ăn quân.

**Các quy tắc**
- Chiếu hết là thua; **hết nước đi cũng là thua** (không có "hoà vì hết nước"). Thứ tự xét: chiếu hết/hết nước → chiếu liên tục → lặp thế → 120 nửa nước; **chiếu hết luôn được xét trước** các kết quả hoà.
- Thế cờ lặp lần ba: nếu một bên chiếu liên tục thì bên đó **thua**, còn lại **hoà**. 120 nửa nước không ăn quân thì **hoà**; mỗi lần ăn quân đưa bộ đếm về 0. Thế cờ tính cả bên sắp đi.
- Xin hoà: mỗi người chỉ **một đề nghị đang chờ**; sau khi bị từ chối hoặc hết hạn, phải **đi thêm 5 nước của mình** mới xin lại (nút mờ có chú thích số nước còn lại). Khung đề nghị **không chặn bàn cờ**, không giữ focus; Esc hoặc nút X chỉ **thu gọn** (không phải từ chối), có nút mở lại, hạn vẫn chạy.
- Ván kết thúc thì đề nghị hoà hết hiệu lực. Kết quả chỉ chốt **một lần**.
- Ván bị gián đoạn do máy chủ khởi động lại hiện kết quả trung tính "Ván bị gián đoạn": không thắng, thua hay hoà; không đổi điểm; chỉ nút Rời phòng (đã chốt 04/10/2026).

**Khi có lỗi**
người xem không đầu hàng hay trả lời hoà thay người chơi được; đầu hàng cùng lúc với phản hồi hoà chỉ có một kết quả; trả lời hoà đến muộn không ghi đè kết quả.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**
| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
|---|---|---|---|---|---|
| Màn hình Ván đấu | Thế/giờ/lượt đồng bộ máy chủ | Đợi snapshot hoặc ACK nước đi | Chưa có nước: thế đầu và hướng dẫn, không bàn trắng | Mất kết nối/ghi lỗi: không phát nước giả, phục hồi theo [07] | Ngoài lượt, chỉ xem, phiên cũ hoặc ván đã kết thúc |
| Khung Đề nghị hoà | Đề nghị còn hạn, trả lời đúng tác động | Đang gửi/rút/trả lời; không dừng đồng hồ | Không còn đề nghị: gỡ khung/nút mở lại | Phản hồi lỗi: đối soát hạn/trạng thái, không hoà giả | Hết hạn/đã rút/đã kết thúc hoặc không phải người nhận |
| Hộp xác nhận Đầu hàng | Xác nhận: RESIGN; Huỷ không đổi ván | Đợi ACK; chặn xác nhận trùng | Không còn ván đang chơi: đóng, hiện kết quả thật | Mất ACK: đối soát, không báo thua giả | Ván kết thúc/phiên cũ/không phải người chơi |
| Hộp Kết quả ván | Kết quả/lý do đúng; nút theo phân kỳ | Đợi kết quả có thẩm quyền | Chưa có kết quả: đợi/đối soát, không đoán thắng | Tải kết quả lỗi: Thử lại, không cho đi thêm | Tái đấu/Replay sai chế độ, P1 ẩn |

**Tiêu chí chấp nhận và cách kiểm (đối chiếu từng tiêu chí của đặc tả)**
| Mã tiêu chí | Điều kiện đạt | Cách kiểm | Task kiểm |
|---|---|---|---|
| `AC-PLAY-03-01` | Chiếu hết thua; hết nước đi (không bị chiếu) cũng thua; xử đúng thứ tự ưu tiên của luật. | Thế chiếu hết, hết nước. | T-09, T-39, T-46 |
| `AC-PLAY-03-02` | Hộp kết quả hiện thắng/thua/hoà, lý do, chỉ nút Rời phòng (không Tái đấu, không Xem lại). Ván gián đoạn do máy chủ khởi động lại hiện kết quả trung tính "Ván bị gián đoạn": không thắng thua hoà, không đổi điểm, chỉ nút Rời phòng (đã chốt 04/10/2026). | Kết thúc bằng từng cách; khởi động lại máy chủ giữa ván. | T-26, T-39, T-45, T-50 |
| `AC-PLAY-03-03` | Ván ngừng nhận nước; người xem thấy kết quả. | Gửi nước sau khi kết thúc; xem bên người xem. | T-39, T-44 |
| `AC-PLAY-04-01` | Bấm Đầu hàng mở xác nhận "Bạn sẽ thua ván này ngay lập tức." (focus mặc định ở Huỷ); đồng ý thì thua ngay, đối thủ thắng. | Huỷ rồi đồng ý; xem hai máy. | T-26, T-39, T-50 |
| `AC-PLAY-05-01` | Gửi đề nghị hoà: người nhận thấy khung đề nghị đếm lùi 30 giây; người gửi thấy "Đang chờ đối thủ trả lời…" và nút Rút đề nghị. | Gửi đề nghị; quan sát hai bên; rút. | T-26, T-39, T-50 |
| `AC-PLAY-05-02` | Đồng ý thì ván hoà; từ chối hoặc hết hạn thì ván tiếp tục. | Thử cả ba nhánh. | T-39, T-50 |
| `AC-PLAY-05-03` | Mỗi người chỉ có 1 đề nghị đang chờ; bị từ chối hoặc hết hạn thì phải đi thêm 5 nước của mình mới xin lại (nút mờ kèm chú thích số nước còn lại). | Xin lại sớm hơn 5 nước. | T-39, T-26 |
| `AC-PLAY-05-04` | Khung đề nghị không chặn bàn cờ, không giữ focus, đồng hồ chạy; Esc hoặc X chỉ thu gọn và có nút mở lại, hạn vẫn chạy; chỉ Từ chối mới gửi phản hồi từ chối. Ván kết thúc thì đề nghị hết hiệu lực, trả lời muộn không đổi kết quả. | Thu gọn rồi mở lại; trả lời sau chiếu hết. | T-26, T-39, T-50 |
| `AC-PLAY-08-01` | Thế lặp lần thứ 3 xử theo luật (chiếu liên tục thì bên chiếu thua; còn lại hoà); 120 nửa nước không ăn quân thì hoà. | Các chu kỳ chiếu; mốc 119 và 120. | T-09, T-39, T-46 |
| `AC-PLAY-08-02` | Chiếu hết luôn ưu tiên hơn các kết quả hoà. | Nước chiếu hết trùng điều kiện hoà. | T-09, T-39, T-46 |

**Điều kiện hoàn thành (PASS khi)**
- Mọi dòng trong bảng tiêu chí ở trên đều **đạt**, có bằng chứng; dòng nào không đạt thì Story chưa xong.
- Mọi màn hình ở bảng 5 trạng thái đều hiện đúng cả 5 trạng thái (thành công, đang tải, trống, lỗi, bị khoá có chú thích).
- Các Task liên kết đều đã xong và đã được người kiểm thử và người xem lại mã đồng ý; các điều kiện chấp nhận được kiểm ở máy chủ, không chỉ ở giao diện.
- Không có lỗi mức Cao hoặc Nghiêm trọng còn mở thuộc Story này.

**Còn mở / chờ quyết định:** Cách hiển thị ván gián đoạn đã chốt (kết quả trung tính).

**Bằng chứng nộp:** trạng thái ban đầu là NOT_RUN (chưa chạy). Khi chạy, ghi bản dựng, môi trường, kết quả từng dòng (đạt / không đạt / bị chặn), ảnh hoặc nhật ký đã che bí mật.

**Liên kết Jira (khi được phép tạo):** Epic: Hai người đánh cờ qua mạng; liên quan tới (relates to) các Task: T-09 (Luật cờ: nước hợp lệ, chiếu, chiếu hết, hết nước, lặp thế, 120 nửa nước); T-26 (Giao diện ván: bàn cờ nối mạng, đồng hồ, nút, hộp kết quả, khung xin hoà); T-39 (Máy chủ: đồng hồ ván, kết thúc ván, đầu hàng, xin hoà); T-46 (Kiểm thử luật cờ: đếm nước đi độc lập và bộ kiểm thử chạy tự động); T-50 (Nối web với máy chủ: đồng hồ, kết thúc ván, mất kết nối, người xem, bảng nước đi).

---

### Story 18 — Rời phòng giữa ván, mất kết nối và kết nối lại
**Thuộc Epic:** Hai người đánh cờ qua mạng · **Thành phần:** Frontend, Game Server
**Nhãn:** `P1`, `US-PLAY-06`, `US-PLAY-07` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống (nhóm tự nhận khi kéo việc) · **Sprint:** chưa gán (Task của Story nằm ở Sprint 2, 3)

**Câu chuyện:** Là người chơi, khi **rời phòng hoặc rớt mạng**, tôi muốn biết rõ hậu quả và **được quay lại ván** nếu nối lại kịp.

**Nguồn (đặc tả)**
- US-PLAY-06 — Rời phòng giữa ván (BA 2.3, DANH-MUC modal 13)
- US-PLAY-07 — Mất kết nối và kết nối lại (BA 8.3; DANH-MUC overlay 2)
- Tiêu chí gốc ở `docs/01-yeu-cau-chi-tiet.md`: AC-PLAY-06-01, AC-PLAY-07-01, AC-PLAY-07-02, AC-PLAY-07-03, AC-PLAY-07-04.
- Màn hình và thành phần giao diện (`DANH-MUC-MAN-HINH-XIANGQI.md`): Màn hình Ván đấu (`SCR-GAME-ROOM`), Hộp xác nhận Rời phòng khi đang đấu (`MODAL-CONFIRM-LEAVE`), Lớp phủ Mất kết nối (`OVERLAY-RECONNECTING`).

**Nhu cầu và phạm vi**
- **Có:** Rời phòng giữa ván; Mất kết nối và kết nối lại.
- **Không:** ván với máy (có thời hạn 30 phút riêng, Story 26).

**Điều kiện để dùng:** đang trong phòng hoặc ván.

**Bắt đầu khi (phụ thuộc)**
- Cần có kết quả của các Task sau (nằm ngoài Story này), vì chúng cho ra đầu vào của các Task của Story:
  - T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ
  - T-08 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)
  - T-22 — Giao diện: kéo thả quân, đánh dấu nước vừa đi, cảnh báo chiếu, âm thanh
  - T-30 — Nối web với máy chủ: đi nước, đồng bộ thế cờ giữa hai trình duyệt
  - T-39 — Máy chủ: đồng hồ ván, kết thúc ván, đầu hàng, xin hoà
  - T-40 — Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời
  - T-42 — Bảng nước đi: ký hiệu tiếng Việt và hiển thị
  - T-44 — Máy chủ: người xem theo dõi trực tiếp, lọc dữ liệu theo vai trò

**Các bước người dùng làm và hệ thống phản hồi**
1. **Rời phòng có chủ ý giữa ván:** người dùng bấm **Rời phòng**; hiện xác nhận "Rời lúc này được tính là đầu hàng."; đồng ý thì thua ngay và rời phòng (không chờ 60 giây); huỷ thì giữ nguyên.
2. **Mất kết nối:** xuất hiện lớp phủ **không tắt được bằng Esc** với đồng hồ giữ chỗ do máy chủ tính.
3. Người **đang đấu**: đếm lùi **60 giây**; nối lại thì tự tắt; quá hạn thì thua; **đồng hồ ván vẫn chạy** (hết giờ trước thì thua do hết giờ).
4. Người ngồi ghế ở phòng chờ hoặc phòng đã kết thúc: giữ ghế **60 giây** rồi mất ghế (không thua). Người xem: giữ chỗ **5 phút**.
5. **Nối lại thành công:** nhận **đủ thế cờ và đồng hồ chính xác**; dữ liệu mà người đó không còn quyền xem bị xoá.

**Các quy tắc**
- **Rời có chủ ý** khác hẳn **mất kết nối**: rời có xác nhận xử ngay.
- Nếu **cả hai** cùng rớt và cùng quá hạn thì **bên rớt trước thua**; hết giờ sớm hơn vẫn được ưu tiên. Mỗi tình huống chỉ ra **một** kết quả, không phụ thuộc thứ tự các bộ hẹn giờ.
- Máy chủ khởi động lại thì ván thành **gián đoạn** (không thắng thua), nước đã lưu không bị ghi đè.

**Khi có lỗi**
việc xác nhận đầu hàng chưa rõ thì không báo rời xong; lỗi ghi dữ liệu thì đóng băng đồng hồ, không mất giờ vì lỗi.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**
| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
|---|---|---|---|---|---|
| Màn hình Ván đấu | Thế/giờ/lượt đồng bộ máy chủ | Đợi snapshot hoặc ACK nước đi | Chưa có nước: thế đầu và hướng dẫn, không bàn trắng | Mất kết nối/ghi lỗi: không phát nước giả, phục hồi theo [07] | Ngoài lượt, chỉ xem, phiên cũ hoặc ván đã kết thúc |
| Hộp xác nhận Rời phòng khi đang đấu | Rời/Đăng xuất giữa ván xác nhận hậu quả | Đợi xử lý rời/đầu hàng | Không còn mục tiêu: đóng, về trạng thái hiện tại | Lỗi xử lý: giữ thông báo và đối soát | Đã xử lý hoặc không còn quyền điều khiển |
| Lớp phủ Mất kết nối | Đã nối lại nhận snapshot rồi tự tắt | Nối lại kèm thời hạn đúng vai trò | Không mất kết nối: overlay không hiện | Quá hạn: kết quả/mất ghế/về Sảnh đúng loại | Không Esc/bấm ngoài; chặn lệnh cần kết nối |

**Tiêu chí chấp nhận và cách kiểm (đối chiếu từng tiêu chí của đặc tả)**
| Mã tiêu chí | Điều kiện đạt | Cách kiểm | Task kiểm |
|---|---|---|---|
| `AC-PLAY-06-01` | Bấm Rời phòng khi đang đấu hiện xác nhận "Rời lúc này được tính là đầu hàng."; đồng ý thì thua ngay. | Huỷ rồi đồng ý. | T-26, T-45, T-50 |
| `AC-PLAY-07-01` | Mất kết nối: lớp phủ không đóng bằng Esc. Người đang đấu: đếm lùi 60 giây, nối lại thì tự tắt, quá hạn thì thua, đồng hồ ván vẫn chạy (hết giờ trước thì thua do hết giờ). Người ở phòng chờ hoặc phòng kết thúc: giữ ghế 60 giây rồi mất ghế (không thua). Người xem: giữ chỗ 5 phút. | Ngắt mạng ba loại người ở các mốc trước và sau hạn. | T-45, T-50 |
| `AC-PLAY-07-02` | Nối lại thành công nhận lại thế cờ đầy đủ và đồng hồ chính xác. | Nối lại và so với máy chủ. | T-45, T-50 |
| `AC-PLAY-07-03` | Cả hai cùng mất kết nối nhưng máy chủ vẫn chạy: bên mất kết nối trước thua nếu cả hai cùng quá hạn. | Hai bên rớt lệch nhau. | T-45 |
| `AC-PLAY-07-04` | Máy chủ tự ghi nhận sự cố của chính nó (khởi động lại) thì ván thành gián đoạn. | Khởi động lại máy chủ giữa ván. | T-28, T-45, T-50 |

**Điều kiện hoàn thành (PASS khi)**
- Mọi dòng trong bảng tiêu chí ở trên đều **đạt**, có bằng chứng; dòng nào không đạt thì Story chưa xong.
- Mọi màn hình ở bảng 5 trạng thái đều hiện đúng cả 5 trạng thái (thành công, đang tải, trống, lỗi, bị khoá có chú thích).
- Các Task liên kết đều đã xong và đã được người kiểm thử và người xem lại mã đồng ý; các điều kiện chấp nhận được kiểm ở máy chủ, không chỉ ở giao diện.
- Không có lỗi mức Cao hoặc Nghiêm trọng còn mở thuộc Story này.

**Còn mở / chờ quyết định:** Cách hiển thị ván gián đoạn đã chốt (kết quả trung tính).

**Bằng chứng nộp:** trạng thái ban đầu là NOT_RUN (chưa chạy). Khi chạy, ghi bản dựng, môi trường, kết quả từng dòng (đạt / không đạt / bị chặn), ảnh hoặc nhật ký đã che bí mật.

**Liên kết Jira (khi được phép tạo):** Epic: Hai người đánh cờ qua mạng; liên quan tới (relates to) các Task: T-26 (Giao diện ván: bàn cờ nối mạng, đồng hồ, nút, hộp kết quả, khung xin hoà); T-45 (Máy chủ: rời phòng giữa ván, mất kết nối, giữ chỗ, kết nối lại, ván gián đoạn); T-50 (Nối web với máy chủ: đồng hồ, kết thúc ván, mất kết nối, người xem, bảng nước đi).

---

### Story 19 — Kiểu phòng, khoá phòng và danh sách phòng công khai
**Thuộc Epic:** Phòng công khai, khoá phòng và người xem · **Thành phần:** Frontend, Room & Social
**Nhãn:** `P1`, `US-ROOM-07`, `US-ROOM-08` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống (nhóm tự nhận khi kéo việc) · **Sprint:** chưa gán (Task của Story nằm ở Sprint 2, 3)

**Câu chuyện:** Là chủ phòng, tôi muốn **chọn ai được thấy và được vào phòng** (công khai, chỉ vào bằng mã, khoá); và là người chơi, tôi muốn **thấy các phòng công khai đang mở** để vào xem.

**Nguồn (đặc tả)**
- US-ROOM-07 — Chế độ riêng tư và khoá phòng (BA 2.7, 4.3)
- US-ROOM-08 — Danh sách phòng công khai ở Sảnh (BA 2.0, 2.7)
- Tiêu chí gốc ở `docs/01-yeu-cau-chi-tiet.md`: AC-ROOM-07-01, AC-ROOM-07-02, AC-ROOM-07-03, AC-ROOM-07-04, AC-ROOM-07-05, AC-ROOM-07-06, AC-ROOM-08-01, AC-ROOM-08-02, AC-ROOM-08-03, AC-ROOM-08-04.
- Màn hình và thành phần giao diện (`DANH-MUC-MAN-HINH-XIANGQI.md`): Sảnh (`SCR-LOBBY`), Hộp Cài đặt phòng (`MODAL-ROOM-SETTINGS`).

**Nhu cầu và phạm vi**
- **Có:** Chế độ riêng tư và khoá phòng; Danh sách phòng công khai ở Sảnh.
- **Không:** đuổi người xem (Story 20); đánh hạng; lọc và tìm kiếm phòng.

**Điều kiện để dùng:** là chủ phòng (khi đổi kiểu phòng); đã đăng nhập (khi xem danh sách).

**Bắt đầu khi (phụ thuộc)**
- Cần có kết quả của các Task sau (nằm ngoài Story này), vì chúng cho ra đầu vào của các Task của Story:
  - T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ
  - T-08 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)
  - T-15 — Giao diện: phòng chờ và màn từ chối vào phòng
  - T-21 — Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh
  - T-29 — Nối web với máy chủ: tạo phòng, vào phòng, ghế, Sẵn sàng, bắt đầu ván
  - T-38 — Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng

**Các bước người dùng làm và hệ thống phản hồi**
1. Chủ phòng đổi giữa **công khai**, **chỉ vào bằng mã** và **khoá**, kể cả khi đang đấu. Khi bật khoá hiện xác nhận "Người mới sẽ không vào được. Người xem đang có vẫn được giữ lại."
2. Ở Sảnh, danh sách hiện các phòng công khai đang chờ hoặc đang chơi; mỗi dòng: tên phòng, chủ phòng, mức giờ, số người (X/Y), nút **Vào xem**. Danh sách tự làm mới.

**Các quy tắc**
- **Khoá** chỉ bật được khi **đủ 2 người chơi**; chưa đủ thì nút mờ "Chỉ khoá được khi đã đủ 2 người chơi".
- Phòng khoá: biến khỏi Sảnh, **không ai mới vào được** dù có mã hay đường dẫn; người đang có ghế hoặc đang xem **giữ nguyên**. Phòng khoá mà một người rời đi **vẫn giữ khoá**; chủ phòng mở lại hoặc mời người xem xuống ghế, phòng không tự mở.
- Người đang có mặt mất mạng vẫn vào lại được: người chơi trong **60 giây**, người xem trong **5 phút**; quá hạn coi như người mới.
- Phòng chỉ-mã không hiện ở Sảnh. Danh sách: mới nhất trước, **tối đa 50 phòng**; phòng đã đủ người xem thì nút Vào xem mờ có chú thích.

**Khi có lỗi**
không phải chủ hoặc thiếu người mà bật khoá → từ chối; danh sách rỗng → giải thích và nút "Tạo phòng"; tải lỗi → thông báo và "Thử lại".

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**
| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
|---|---|---|---|---|---|
| Sảnh | Danh sách và hành động đúng phân kỳ, có Luật chơi | Tải phòng/bạn/phiên, khung xương từng vùng | Chưa có phòng: giải thích + Tạo phòng | Không tải danh sách: Thử lại, không giả danh sách rỗng | Đang có vị trí chơi hoặc tính năng P2 chưa mở |
| Hộp Cài đặt phòng | Host đổi riêng tư, thu hồi mã đúng | Đang thay đổi | Chưa có snapshot: hướng dẫn đợi, không chọn giá trị giả | Không còn quyền/ghi lỗi: tải trạng thái thật | Không Host; bật LOCKED chưa đủ hai ghế |

**Tiêu chí chấp nhận và cách kiểm (đối chiếu từng tiêu chí của đặc tả)**
| Mã tiêu chí | Điều kiện đạt | Cách kiểm | Task kiểm |
|---|---|---|---|
| `AC-ROOM-07-01` | Chủ phòng đổi giữa công khai, chỉ-mã, khoá bất kỳ lúc nào (kể cả khi đang đấu); riêng khoá chỉ bật được khi đủ 2 người chơi (chưa đủ thì nút mờ "Chỉ khoá được khi đã đủ 2 người chơi"). | Bật khoá khi thiếu người, khi đủ người, bằng người không phải chủ. | T-36, T-32, T-40 |
| `AC-ROOM-07-02` | Khoá: phòng biến mất khỏi Sảnh; không ai mới vào được dù có đường dẫn hay mã; người đang có ghế hoặc đang xem giữ nguyên và vẫn xem được. | Khoá rồi người mới thử vào; người cũ vẫn xem. | T-36, T-40 |
| `AC-ROOM-07-03` | Người đang có ghế hoặc đang xem mất mạng vẫn vào lại được (người chơi 60 giây, người xem 5 phút); quá hạn coi như người mới. | Ngắt và nối lại ở các mốc 59/61 giây và 4:59/5:01. | T-36, T-45, T-50 |
| `AC-ROOM-07-04` | Phòng chỉ-mã không hiện ở Sảnh; vào bằng mã hoặc đường dẫn. | Đặt chỉ-mã; xem Sảnh; vào bằng mã. | T-36 |
| `AC-ROOM-07-05` | Phòng đã khoá mà một người ngồi ghế rời thì vẫn giữ khoá; chủ phòng mở lại hoặc mời người xem xuống ghế, không tự mở vì mất ghế. | Khoá, một ghế rời, người mới thử vào. | T-36, T-40, T-50 |
| `AC-ROOM-07-06` | Hộp xác nhận khi bật khoá nói rõ: "Người mới sẽ không vào được. Người xem đang có vẫn được giữ lại." | Bật khoá; đọc hộp xác nhận; bấm Huỷ. | T-32 |
| `AC-ROOM-08-01` | Danh sách Sảnh chỉ hiện phòng công khai đang chờ hoặc đang chơi; mỗi dòng có tên phòng, chủ phòng, mức giờ, số người X/Y, nút Vào xem. | Dữ liệu mẫu đủ loại phòng. | T-36, T-14 |
| `AC-ROOM-08-02` | Mới nhất lên đầu, tối đa 50 phòng, tự làm mới. | Dữ liệu hơn 50 phòng; tạo phòng mới. | T-36, T-14 |
| `AC-ROOM-08-03` | Phòng đã đủ người xem thì nút Vào xem mờ kèm chú thích lý do. | Phòng đầy người xem. | T-14, T-40 |
| `AC-ROOM-08-04` | Danh sách trống thì hiện lời giải thích và nút Tạo phòng. | Không có phòng nào. | T-14, T-58 |

**Điều kiện hoàn thành (PASS khi)**
- Mọi dòng trong bảng tiêu chí ở trên đều **đạt**, có bằng chứng; dòng nào không đạt thì Story chưa xong.
- Mọi màn hình ở bảng 5 trạng thái đều hiện đúng cả 5 trạng thái (thành công, đang tải, trống, lỗi, bị khoá có chú thích).
- Các Task liên kết đều đã xong và đã được người kiểm thử và người xem lại mã đồng ý; các điều kiện chấp nhận được kiểm ở máy chủ, không chỉ ở giao diện.
- Không có lỗi mức Cao hoặc Nghiêm trọng còn mở thuộc Story này.

**Còn mở / chờ quyết định:** Không có điểm chờ quyết định.

**Bằng chứng nộp:** trạng thái ban đầu là NOT_RUN (chưa chạy). Khi chạy, ghi bản dựng, môi trường, kết quả từng dòng (đạt / không đạt / bị chặn), ảnh hoặc nhật ký đã che bí mật.

**Liên kết Jira (khi được phép tạo):** Epic: Phòng công khai, khoá phòng và người xem; liên quan tới (relates to) các Task: T-14 (Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng); T-32 (Giao diện: cài đặt phòng, đổi chỗ ghế/xem, danh sách người xem, xác nhận đuổi); T-36 (Máy chủ: kiểu phòng (công khai, chỉ mã, khoá) và danh sách phòng ở Sảnh); T-40 (Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời).

---

### Story 20 — Quản lý phòng: đổi chỗ, đuổi người xem, chủ phòng rời, sau ván
**Thuộc Epic:** Phòng công khai, khoá phòng và người xem · **Thành phần:** Frontend, Room & Social
**Nhãn:** `P1`, `US-ROOM-06`, `US-ROOM-09`, `US-ROOM-10`, `US-ROOM-11` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống (nhóm tự nhận khi kéo việc) · **Sprint:** chưa gán (Task của Story nằm ở Sprint 3)

**Câu chuyện:** Là người trong phòng, tôi muốn **đổi giữa ghế và chỗ xem, đuổi người xem gây phiền, và phòng vẫn hợp lý** khi chủ phòng rời đi hoặc sau khi ván kết thúc.

**Nguồn (đặc tả)**
- US-ROOM-06 — Đổi chỗ giữa ghế và người xem (BA 2.8)
- US-ROOM-09 — Đuổi người xem (BA 4.2)
- US-ROOM-10 — Host rời, chuyển quyền, đóng phòng (BA 2.3)
- US-ROOM-11 — Sau ván CASUAL: quay về phòng chờ (BA 2.3 mục 8)
- Tiêu chí gốc ở `docs/01-yeu-cau-chi-tiet.md`: AC-ROOM-06-01, AC-ROOM-06-02, AC-ROOM-06-03, AC-ROOM-06-04, AC-ROOM-06-05, AC-ROOM-09-01, AC-ROOM-09-02, AC-ROOM-09-03, AC-ROOM-10-01, AC-ROOM-10-02, AC-ROOM-10-03, AC-ROOM-11-01, AC-ROOM-11-02, AC-ROOM-11-03, AC-ROOM-11-04.
- Màn hình và thành phần giao diện (`DANH-MUC-MAN-HINH-XIANGQI.md`): Màn hình Phòng chờ (`SCR-WAITING-ROOM`), Hộp xác nhận Đuổi người xem (`MODAL-CONFIRM-KICK`), Danh sách Người xem (`PANEL-SPECTATORS`).

**Nhu cầu và phạm vi**
- **Có:** Đổi chỗ giữa ghế và người xem; Đuổi người xem; Host rời, chuyển quyền, đóng phòng; Sau ván CASUAL: quay về phòng chờ.
- **Không:** xin đổi bên (Đỏ/Đen); hoán đổi trực tiếp hai người; chặn người dùng toàn hệ thống; nút Tái đấu.

**Điều kiện để dùng:** đang ở trong phòng.

**Bắt đầu khi (phụ thuộc)**
- Cần có kết quả của các Task sau (nằm ngoài Story này), vì chúng cho ra đầu vào của các Task của Story:
  - T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ
  - T-08 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)
  - T-15 — Giao diện: phòng chờ và màn từ chối vào phòng
  - T-25 — Máy chủ: chọn ghế, Sẵn sàng, đếm 3 giây, bắt đầu ván
  - T-29 — Nối web với máy chủ: tạo phòng, vào phòng, ghế, Sẵn sàng, bắt đầu ván
  - T-36 — Máy chủ: kiểu phòng (công khai, chỉ mã, khoá) và danh sách phòng ở Sảnh

**Các bước người dùng làm và hệ thống phản hồi**
1. **Đổi chỗ** (khi phòng "đang chờ" hoặc "đã kết thúc"): người ngồi ghế bấm "Chuyển sang người xem"; hoặc chủ phòng chuyển người còn lại xuống xem, hoặc **mời một người xem lên ghế trống**. Phòng về "Đang chờ", "Sẵn sàng" của cả hai về chưa sẵn sàng.
2. **Đuổi người xem:** cả chủ phòng và người chơi còn lại thấy nút **Đuổi** cạnh mỗi người xem; bấm thì hiện xác nhận "Người này sẽ không vào lại được phòng này."; sau xác nhận người xem bị ngắt, đưa ra Sảnh với thông báo "Bạn đã bị đuổi khỏi phòng thi đấu".
3. **Chủ phòng rời** khi phòng đang chờ: nếu còn người ngồi ghế thì người đó thành chủ phòng; không còn ai ngồi ghế thì **đóng phòng** dù còn người xem. Đang đấu: rời giữa ván là **đầu hàng**; chủ phòng mất kết nối tạm thời không đổi chủ phòng.
4. **Sau ván:** phòng ở "đã kết thúc" tối đa **10 phút** rồi đóng; ai đổi thành phần ghế thì phòng về "đang chờ", người còn lại giữ ghế (và quyền chủ phòng); người mới vào theo quy tắc vào phòng; mất kết nối ở phòng chờ giữ ghế **60 giây**.

**Các quy tắc**
- Không đổi chỗ khi đang đấu. Chuyển xuống xem chỉ được khi **còn chỗ xem** (hết chỗ thì nút mờ "Phòng không còn chỗ cho người xem"). Người xem **không tự ngồi** vào ghế trống; chủ phòng **không tự xuống** làm người xem.
- Người bị đuổi bị chặn **đến khi phòng đóng**; vào lại bằng mã hay đường dẫn thì thấy "Bạn đã bị đuổi và chặn tham gia phòng cờ này!"; người xem không có quyền đuổi.
- Đồng hồ 10 phút của phòng đã kết thúc bị huỷ khi phòng về "đang chờ" (không đóng nhầm phòng mới).

**Khi có lỗi**
hết chỗ xem → từ chối; gửi trùng → không vượt sức chứa; xác nhận đầu hàng chưa rõ → không báo rời xong.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**
| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
|---|---|---|---|---|---|
| Màn hình Phòng chờ | Ghế/Host/Sẵn sàng đúng trạng thái | Đang nhận snapshot/chuyển ghế | Ghế còn trống: mời bạn hoặc chia sẻ mã | Lệnh lỗi/phiên bản cũ: nhận lại trạng thái | Chưa đủ hai ghế; khoá/chuyển vai không hợp lệ |
| Hộp xác nhận Đuổi người xem | Chặn đến đóng phòng, người xem về Sảnh | Đang đuổi/chặn | Mục tiêu đã rời: cập nhật danh sách | Mất quyền/lỗi lệnh: không báo đã đuổi | Mục tiêu không là người xem/người gọi mất ghế |
| Danh sách Người xem | Danh sách/số X/N đúng; Kick cho hai người | Tải/cập nhật danh sách | Chưa ai xem: giải thích; không dựng tài khoản giả | Tải/đuổi lỗi: tải lại danh sách thật | N=0/đã đủ; không ghế thì không quyền Kick |

**Tiêu chí chấp nhận và cách kiểm (đối chiếu từng tiêu chí của đặc tả)**
| Mã tiêu chí | Điều kiện đạt | Cách kiểm | Task kiểm |
|---|---|---|---|
| `AC-ROOM-06-01` | Chỉ đổi chỗ khi phòng đang chờ hoặc đã kết thúc; khi đang đấu thì không đổi. | Thử đổi trong ván. | T-38, T-32 |
| `AC-ROOM-06-02` | Người ngồi ghế bấm Chuyển sang người xem chỉ được khi còn chỗ xem; phòng không người xem hoặc đã đầy thì nút mờ "Phòng không còn chỗ cho người xem"; không vượt trần. | Thử ở phòng 0 người xem, đầy, còn chỗ. | T-38, T-32, T-40 |
| `AC-ROOM-06-03` | Chủ phòng chuyển người đang ngồi ghế xuống xem (cùng điều kiện còn chỗ), hoặc mời một người xem lên ghế trống. | Chủ phòng mời lên ghế trống rồi ghế kín. | T-38, T-32, T-40 |
| `AC-ROOM-06-04` | Người xem không tự ngồi vào ghế trống; chủ phòng không tự chuyển mình sang người xem (nút ẩn). | Thử cả hai ở máy chủ. | T-38, T-32 |
| `AC-ROOM-06-05` | Mỗi lần đổi thành phần người ngồi ghế thì phòng về trạng thái đang chờ và "Sẵn sàng" reset. | Đổi lúc phòng đã kết thúc. | T-38, T-40 |
| `AC-ROOM-09-01` | Chủ phòng và người chơi còn lại đều thấy nút Đuổi cạnh mỗi người xem; bấm thì hiện xác nhận "Người này sẽ không vào lại được phòng này." | Người chơi đuổi; người xem tìm nút (không có). | T-32, T-40 |
| `AC-ROOM-09-02` | Sau xác nhận người xem bị ngắt kết nối, đưa ra Sảnh kèm "Bạn đã bị đuổi khỏi phòng thi đấu", bị chặn đến khi phòng đóng. | Đuổi; người bị đuổi gửi lệnh bằng kết nối cũ. | T-38, T-40 |
| `AC-ROOM-09-03` | Người bị đuổi quay lại bằng đường dẫn hoặc mã thì thấy "Bạn đã bị đuổi và chặn tham gia phòng cờ này!" | Vào lại bằng mã cũ. | T-21, T-15 |
| `AC-ROOM-10-01` | Chủ phòng rời khi phòng đang chờ: nếu còn người chơi thứ hai thì họ thành chủ phòng, phòng vẫn mở. | Chủ phòng rời khi có người thứ hai. | T-38, T-40 |
| `AC-ROOM-10-02` | Không còn người ngồi ghế sau khi chủ phòng rời thì đóng phòng dù còn người xem; họ về Sảnh. Phòng cũng đóng khi hết hạn ở trạng thái đã kết thúc. | Chủ phòng rời khi còn người xem. | T-38, T-40 |
| `AC-ROOM-10-03` | Đang đấu: chủ phòng mất kết nối tạm thời không đổi chủ phòng; chủ phòng rời hoặc bị xử thua thì quyền chuyển cho người còn lại; rời giữa ván là đầu hàng. | Ngắt mạng chủ phòng; rời giữa ván. | T-38, T-45 |
| `AC-ROOM-11-01` | Ván kết thúc thì phòng ở trạng thái đã kết thúc tối đa 10 phút; hết hạn mà vẫn vậy thì đóng và đưa mọi người về Sảnh. Đã về trạng thái đang chờ thì hẹn giờ cũ không đóng phòng. | Đồng hồ giả: để hết 10 phút; đổi ghế trước hạn. | T-38, T-40 |
| `AC-ROOM-11-02` | Một người ngồi ghế rời, hoặc thành phần ngồi ghế đổi, thì phòng về đang chờ; người còn lại giữ ghế và quyền chủ phòng (nếu người rời là chủ thì chuyển quyền). | Người rời là chủ và không phải chủ. | T-38 |
| `AC-ROOM-11-03` | Người mới vào theo quy tắc vào phòng; mất kết nối ở phòng chờ giữ ghế 60 giây. | Ngắt kết nối ở phòng chờ. | T-21, T-45 |
| `AC-ROOM-11-04` | Ví dụ nghiệm thu: A và C đánh xong, A rời, C thành chủ phòng, C mời B xuống ghế, B và C bấm Sẵn sàng thì đếm ngược và đấu tiếp. | Chạy đúng kịch bản trên ba trình duyệt. | T-40, T-60 |

**Điều kiện hoàn thành (PASS khi)**
- Mọi dòng trong bảng tiêu chí ở trên đều **đạt**, có bằng chứng; dòng nào không đạt thì Story chưa xong.
- Mọi màn hình ở bảng 5 trạng thái đều hiện đúng cả 5 trạng thái (thành công, đang tải, trống, lỗi, bị khoá có chú thích).
- Các Task liên kết đều đã xong và đã được người kiểm thử và người xem lại mã đồng ý; các điều kiện chấp nhận được kiểm ở máy chủ, không chỉ ở giao diện.
- Không có lỗi mức Cao hoặc Nghiêm trọng còn mở thuộc Story này.

**Còn mở / chờ quyết định:** Không có điểm chờ quyết định.

**Bằng chứng nộp:** trạng thái ban đầu là NOT_RUN (chưa chạy). Khi chạy, ghi bản dựng, môi trường, kết quả từng dòng (đạt / không đạt / bị chặn), ảnh hoặc nhật ký đã che bí mật.

**Liên kết Jira (khi được phép tạo):** Epic: Phòng công khai, khoá phòng và người xem; liên quan tới (relates to) các Task: T-32 (Giao diện: cài đặt phòng, đổi chỗ ghế/xem, danh sách người xem, xác nhận đuổi); T-38 (Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng); T-40 (Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời).

---

### Story 21 — Người xem theo dõi trực tiếp
**Thuộc Epic:** Phòng công khai, khoá phòng và người xem · **Thành phần:** Game Server, Frontend
**Nhãn:** `P1`, `US-PLAY-09` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống (nhóm tự nhận khi kéo việc) · **Sprint:** chưa gán (Task của Story nằm ở Sprint 3)

**Câu chuyện:** Là người xem, tôi muốn **xem ván đang diễn ra** như người trong cuộc (chỉ xem).

**Nguồn (đặc tả)**
- US-PLAY-09 — Người xem theo dõi trực tiếp (BA 4.1, 4.3)
- Tiêu chí gốc ở `docs/01-yeu-cau-chi-tiet.md`: AC-PLAY-09-01, AC-PLAY-09-02, AC-PLAY-09-03.
- Màn hình và thành phần giao diện (`DANH-MUC-MAN-HINH-XIANGQI.md`): Màn hình Ván đấu (`SCR-GAME-ROOM`), Danh sách Người xem (`PANEL-SPECTATORS`).

**Nhu cầu và phạm vi**
- **Có:** Người xem theo dõi trực tiếp.
- **Không:** xem lại ván, phát camera cho người xem.

**Điều kiện để dùng:** đã vào phòng làm người xem.

**Bắt đầu khi (phụ thuộc)**
- Cần có kết quả của các Task sau (nằm ngoài Story này), vì chúng cho ra đầu vào của các Task của Story:
  - T-21 — Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh
  - T-28 — Máy chủ: bộ xử lý lệnh của ván và xử lý nước đi
  - T-30 — Nối web với máy chủ: đi nước, đồng bộ thế cờ giữa hai trình duyệt
  - T-39 — Máy chủ: đồng hồ ván, kết thúc ván, đầu hàng, xin hoà
  - T-40 — Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời
  - T-42 — Bảng nước đi: ký hiệu tiếng Việt và hiển thị
  - T-45 — Máy chủ: rời phòng giữa ván, mất kết nối, giữ chỗ, kết nối lại, ván gián đoạn

**Các bước người dùng làm và hệ thống phản hồi**
1. Người xem thấy bàn cờ, đồng hồ, nước đi **theo thời gian thực** (không chậm cố ý), **chỉ đọc**.
2. Thấy số người xem hiện tại và tối đa (ví dụ 3/5).

**Các quy tắc**
người xem **không thấy Kênh Riêng**, không có nút bật camera/micro, không gửi được lệnh; dữ liệu được **lọc ở máy chủ** trước khi gửi; bị đuổi hoặc hết hạn giữ chỗ thì ngừng nhận.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**
| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
|---|---|---|---|---|---|
| Màn hình Ván đấu | Thế/giờ/lượt đồng bộ máy chủ | Đợi snapshot hoặc ACK nước đi | Chưa có nước: thế đầu và hướng dẫn, không bàn trắng | Mất kết nối/ghi lỗi: không phát nước giả, phục hồi theo [07] | Ngoài lượt, chỉ xem, phiên cũ hoặc ván đã kết thúc |
| Danh sách Người xem | Danh sách/số X/N đúng; Kick cho hai người | Tải/cập nhật danh sách | Chưa ai xem: giải thích; không dựng tài khoản giả | Tải/đuổi lỗi: tải lại danh sách thật | N=0/đã đủ; không ghế thì không quyền Kick |

**Tiêu chí chấp nhận và cách kiểm (đối chiếu từng tiêu chí của đặc tả)**
| Mã tiêu chí | Điều kiện đạt | Cách kiểm | Task kiểm |
|---|---|---|---|
| `AC-PLAY-09-01` | Người xem thấy bàn cờ, đồng hồ, nước đi theo thời gian thực (không trễ cố ý), chỉ đọc. | Người xem xem một ván có nước và kết quả; gửi lệnh bị từ chối. | T-44, T-50 |
| `AC-PLAY-09-02` | Người xem không thấy Kênh Riêng; không có nút bật camera hay micro. | So dữ liệu người xem với người ngoài. | T-44, T-49, T-51 |
| `AC-PLAY-09-03` | Ngoài danh sách chung, người xem thấy số người xem hiện tại (X/N). | Thêm và bớt người xem. | T-32, T-44 |

**Điều kiện hoàn thành (PASS khi)**
- Mọi dòng trong bảng tiêu chí ở trên đều **đạt**, có bằng chứng; dòng nào không đạt thì Story chưa xong.
- Mọi màn hình ở bảng 5 trạng thái đều hiện đúng cả 5 trạng thái (thành công, đang tải, trống, lỗi, bị khoá có chú thích).
- Các Task liên kết đều đã xong và đã được người kiểm thử và người xem lại mã đồng ý; các điều kiện chấp nhận được kiểm ở máy chủ, không chỉ ở giao diện.
- Không có lỗi mức Cao hoặc Nghiêm trọng còn mở thuộc Story này.

**Còn mở / chờ quyết định:** Độ trễ người xem đo ở bài tải (nghiệm thu phi chức năng).

**Bằng chứng nộp:** trạng thái ban đầu là NOT_RUN (chưa chạy). Khi chạy, ghi bản dựng, môi trường, kết quả từng dòng (đạt / không đạt / bị chặn), ảnh hoặc nhật ký đã che bí mật.

**Liên kết Jira (khi được phép tạo):** Epic: Phòng công khai, khoá phòng và người xem; liên quan tới (relates to) các Task: T-44 (Máy chủ: người xem theo dõi trực tiếp, lọc dữ liệu theo vai trò); T-50 (Nối web với máy chủ: đồng hồ, kết thúc ván, mất kết nối, người xem, bảng nước đi).

---

### Story 22 — Chat hai kênh, giới hạn tin nhắn và lọc từ cấm
**Thuộc Epic:** Chat, camera và micro · **Thành phần:** Communication, Backend
**Nhãn:** `P1`, `US-CHAT-01`, `US-CHAT-02` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống (nhóm tự nhận khi kéo việc) · **Sprint:** chưa gán (Task của Story nằm ở Sprint 1, 3)

**Câu chuyện:** Là người trong phòng, tôi muốn **nhắn tin** với đối thủ (kênh riêng) hoặc với cả phòng (kênh chung), không bị quấy rối.

**Nguồn (đặc tả)**
- US-CHAT-01 — Hai kênh chat (BA 5.3)
- US-CHAT-02 — Giới hạn và bộ lọc từ cấm (BA 5.3)
- Tiêu chí gốc ở `docs/01-yeu-cau-chi-tiet.md`: AC-CHAT-01-01, AC-CHAT-01-02, AC-CHAT-01-03, AC-CHAT-02-01, AC-CHAT-02-02, AC-CHAT-02-03.
- Màn hình và thành phần giao diện (`DANH-MUC-MAN-HINH-XIANGQI.md`): Khung Chat (`PANEL-CHAT`).

**Nhu cầu và phạm vi**
- **Có:** Hai kênh chat; Giới hạn và bộ lọc từ cấm.
- **Không:** nhắn tin riêng giữa bạn bè; sticker; báo cáo vi phạm; cấm người dùng.

**Điều kiện để dùng:** đang ở trong phòng.

**Bắt đầu khi (phụ thuộc)**
- Cần có kết quả của các Task sau (nằm ngoài Story này), vì chúng cho ra đầu vào của các Task của Story:
  - T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ
  - T-04 — Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập
  - T-07 — Dựng khung máy chủ: nhận kết nối có xác thực và chuyển lệnh
  - T-08 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)
  - T-21 — Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh
  - T-38 — Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng
  - T-40 — Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời
  - T-44 — Máy chủ: người xem theo dõi trực tiếp, lọc dữ liệu theo vai trò

**Các bước người dùng làm và hệ thống phản hồi**
1. **Người chơi** thấy cả **Kênh Riêng** (mặc định mở, chỉ hai người ngồi ghế) và **Kênh Chung** (cả phòng), có công tắc ẩn Kênh Chung. **Người xem** chỉ thấy **Kênh Chung**.
2. Người dùng gõ tin và bấm gửi; tin hiện "đang gửi" cho đến khi máy chủ xác nhận.
3. Tin quá dài hoặc gửi quá nhanh bị chặn kèm thông báo "Bạn gửi quá nhanh". Từ cấm được che bằng `***`.

**Các quy tắc**
- Tin ở Kênh Riêng chỉ hai người **đang ngồi ghế** nhận; **người đổi chỗ sau không đọc được tin cũ**; người xem mới vào chỉ thấy tin Kênh Chung **từ lúc họ vào**. Khi **cả cặp** ngồi ghế đổi (A và B chat riêng, B xuống xem, C lên ngồi), người mới và cả cặp mới **không đọc** tin của cặp cũ (PO chốt 04/10/2026).
- Tin chat của phòng **xoá khi phòng đóng**.
- Mỗi tin tối đa **200 ký tự**; mỗi người tối đa **5 tin trong 10 giây**.
- Từ cấm (tiếng Việt, tiếng Anh) bị che **ở cả máy chủ và trình duyệt**, có xử lý bỏ dấu, khoảng trắng, ký tự chèn thêm, ký tự thay thế (số 0 thay chữ o, số 1 thay chữ i). Máy chủ là nơi quyết định; việc che ở trình duyệt chỉ để người dùng thấy trước. Không có sticker (khay ẩn).

**Khi có lỗi**
máy chủ từ chối hoặc mất phản hồi → không báo "đã gửi", không tự tạo tin mới; mất ghế → gỡ ngay dữ liệu kênh riêng khỏi màn hình.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**
| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
|---|---|---|---|---|---|
| Khung Chat | Tin đúng quyền/kênh sau bộ lọc | Tải/gửi tin | Chưa có tin: lời nhắc viết theo kênh | Gửi lỗi: đánh dấu chưa gửi, đối soát trước thử | Vượt giới hạn, mất quyền kênh, ô trống |

**Tiêu chí chấp nhận và cách kiểm (đối chiếu từng tiêu chí của đặc tả)**
| Mã tiêu chí | Điều kiện đạt | Cách kiểm | Task kiểm |
|---|---|---|---|
| `AC-CHAT-01-01` | Người chơi thấy cả Kênh Riêng (mặc định mở) và Kênh Chung, có công tắc ẩn Kênh Chung. Người xem chỉ thấy Kênh Chung. | Vào bằng hai vai; ẩn và hiện Kênh Chung. | T-41, T-49 |
| `AC-CHAT-01-02` | Tin ở Kênh Riêng chỉ hai người đang ngồi ghế nhận; người đổi chỗ sau không đọc tin cũ; người xem mới chỉ thấy tin Kênh Chung từ lúc vào. Đổi cặp ngồi ghế thì người mới (và cả cặp mới) không đọc tin của cặp cũ. | Người xem vào muộn; người xuống ghế; đổi cặp A/B thành A/C. | T-41, T-49 |
| `AC-CHAT-01-03` | Tin chat của phòng bị xoá khi phòng đóng. | Đóng phòng; kiểm dữ liệu. | T-41, T-49 |
| `AC-CHAT-02-01` | Mỗi tin tối đa 200 ký tự; mỗi người tối đa 5 tin trong 10 giây; vượt thì báo "Bạn gửi quá nhanh". | Gửi 200 và 201 ký tự; 5 và 6 tin trong 10 giây. | T-41, T-10 |
| `AC-CHAT-02-02` | Từ cấm (tiếng Việt, tiếng Anh) bị che bằng *** ở máy chủ và trình duyệt, có xử lý bỏ dấu, khoảng trắng, ký tự chèn, ký tự thay thế (0 thành o, 1 thành i). | Chạy bộ ví dụ ở hai phía; so kết quả. | T-10, T-41, T-49 |
| `AC-CHAT-02-03` | Sticker chưa có ở giai đoạn này (khay ẩn). | Tìm khay sticker (không có). | T-49, T-58 |

**Điều kiện hoàn thành (PASS khi)**
- Mọi dòng trong bảng tiêu chí ở trên đều **đạt**, có bằng chứng; dòng nào không đạt thì Story chưa xong.
- Mọi màn hình ở bảng 5 trạng thái đều hiện đúng cả 5 trạng thái (thành công, đang tải, trống, lỗi, bị khoá có chú thích).
- Các Task liên kết đều đã xong và đã được người kiểm thử và người xem lại mã đồng ý; các điều kiện chấp nhận được kiểm ở máy chủ, không chỉ ở giao diện.
- Không có lỗi mức Cao hoặc Nghiêm trọng còn mở thuộc Story này.

**Còn mở / chờ quyết định:** Đã chốt: đổi cặp ngồi ghế thì không đọc tin cũ (04/10/2026). Danh sách từ cấm do nhóm cung cấp.

**Bằng chứng nộp:** trạng thái ban đầu là NOT_RUN (chưa chạy). Khi chạy, ghi bản dựng, môi trường, kết quả từng dòng (đạt / không đạt / bị chặn), ảnh hoặc nhật ký đã che bí mật.

**Liên kết Jira (khi được phép tạo):** Epic: Chat, camera và micro; liên quan tới (relates to) các Task: T-10 (Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ); T-41 (Máy chủ: chat hai kênh, quyền đọc, giới hạn tin, lọc từ cấm); T-49 (Giao diện chat hai kênh và nối web với máy chủ).

---

### Story 23 — Camera và micro: người chơi bật, người xem chỉ xem
**Thuộc Epic:** Chat, camera và micro · **Thành phần:** Communication, Frontend
**Nhãn:** `P1`, `US-MEDIA-01`, `US-MEDIA-02` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống (nhóm tự nhận khi kéo việc) · **Sprint:** chưa gán (Task của Story nằm ở Sprint 1, 4)

**Câu chuyện:** Là người chơi, tôi muốn **bật camera và micro** để đối thủ thấy mặt và nghe tiếng tôi; và là người xem, tôi chỉ **xem và nghe** những gì người chơi cho phép.

**Nguồn (đặc tả)**
- US-MEDIA-01 — Camera và micro cho hai người chơi (BA 4.1, 5.4)
- US-MEDIA-02 — Người xem chỉ xem/nghe (BA 4.1)
- Tiêu chí gốc ở `docs/01-yeu-cau-chi-tiet.md`: AC-MEDIA-01-01, AC-MEDIA-01-02, AC-MEDIA-01-03, AC-MEDIA-01-04, AC-MEDIA-02-01, AC-MEDIA-02-02.
- Màn hình và thành phần giao diện (`DANH-MUC-MAN-HINH-XIANGQI.md`): Khung Camera và Micro (`PANEL-MEDIA`).

**Nhu cầu và phạm vi**
- **Có:** Camera và micro cho hai người chơi; Người xem chỉ xem/nghe.
- **Không:** mở nhiều tab (Story 24); chat (Story 22).

**Điều kiện để dùng:** đang trong phòng (ngồi ghế để phát, hoặc làm người xem để xem).

**Bắt đầu khi (phụ thuộc)**
- Cần có kết quả của các Task sau (nằm ngoài Story này), vì chúng cho ra đầu vào của các Task của Story:
  - T-01 — Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động
  - T-08 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)
  - T-20 — Máy chủ: đăng nhập, quản lý phiên và hồ sơ
  - T-30 — Nối web với máy chủ: đi nước, đồng bộ thế cờ giữa hai trình duyệt
  - T-38 — Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng
  - T-49 — Giao diện chat hai kênh và nối web với máy chủ

**Các bước người dùng làm và hệ thống phản hồi**
1. Khi vào phòng, camera và micro **TẮT**. Người chơi tự bật từng thiết bị (độc lập nhau); lúc đó trình duyệt mới hỏi quyền.
2. Người chơi chọn **mức chia sẻ**: *Không chia sẻ*, *Chỉ đối thủ*, hoặc *Cả đối thủ và người xem* (mức ba chỉ chọn được khi phòng có người xem).
3. Khi cả hai bật và chọn từ "Chỉ đối thủ" trở lên thì thấy mặt và nghe tiếng nhau.
4. **Người xem** không có nút bật camera hay micro và không bị hỏi quyền thiết bị; chỉ thấy và nghe luồng của người chơi chọn "Cả đối thủ và người xem".

**Các quy tắc**
- Mức chia sẻ chọn **riêng từng người chơi**, áp **chung** cho camera và micro đang bật. **Không ghi hình, ghi âm hay lưu.**
- Máy chủ **không cấp quyền phát** cho người xem. Đổi vai, bị đuổi, phòng đóng thì **thu hồi quyền ngay**; token cũ không lấy lại được quyền đã mất.
- Lỗi camera/micro **không** làm hỏng việc đi cờ và chat.

**Khi có lỗi**
từ chối quyền hoặc không có thiết bị → báo lỗi rõ, bàn cờ và chat vẫn dùng.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**
| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
|---|---|---|---|---|---|
| Khung Camera và Micro | Luồng chỉ người được phép nhận | Xin quyền thiết bị/kết nối media | Mặc định tắt/chưa chia sẻ: placeholder không bịa video | Từ chối quyền/lỗi thiết bị: hướng dẫn cấp quyền/thử lại | Người xem không phát; mất ghế/phiên cũ |

**Tiêu chí chấp nhận và cách kiểm (đối chiếu từng tiêu chí của đặc tả)**
| Mã tiêu chí | Điều kiện đạt | Cách kiểm | Task kiểm |
|---|---|---|---|
| `AC-MEDIA-01-01` | Mỗi người chơi bật/tắt camera và micro độc lập; mặc định TẮT khi vào phòng. | Vào phòng rồi bật riêng từng thiết bị. | T-51, T-57 |
| `AC-MEDIA-01-02` | Có 3 mức chia sẻ chọn riêng từng người chơi, áp chung cho camera và micro đang bật: Không chia sẻ / Chỉ đối thủ / Cả đối thủ và người xem (mức ba chỉ chọn được khi phòng có người xem). | Thử từng mức với đối thủ và người xem. | T-06, T-53, T-57 |
| `AC-MEDIA-01-03` | Hai người chơi thấy mặt và nghe tiếng nhau khi cả hai bật ở mức từ 2 trở lên. | Hai người bật camera và micro. | T-57 |
| `AC-MEDIA-01-04` | Không ghi hình, ghi âm hay lưu trữ. | Rà cấu hình và sản phẩm kiểm thử; không có ghi hay lưu. | T-53, T-61 |
| `AC-MEDIA-02-01` | Người xem không có nút bật camera hay micro; máy chủ không cấp quyền phát. | Người xem gọi thẳng công cụ phát. | T-51, T-53, T-61 |
| `AC-MEDIA-02-02` | Người xem chỉ thấy/nghe luồng của người chơi chọn mức Cả đối thủ và người xem. | Đổi mức chia sẻ; xem bên người xem. | T-53, T-57, T-61 |

**Điều kiện hoàn thành (PASS khi)**
- Mọi dòng trong bảng tiêu chí ở trên đều **đạt**, có bằng chứng; dòng nào không đạt thì Story chưa xong.
- Mọi màn hình ở bảng 5 trạng thái đều hiện đúng cả 5 trạng thái (thành công, đang tải, trống, lỗi, bị khoá có chú thích).
- Các Task liên kết đều đã xong và đã được người kiểm thử và người xem lại mã đồng ý; các điều kiện chấp nhận được kiểm ở máy chủ, không chỉ ở giao diện.
- Không có lỗi mức Cao hoặc Nghiêm trọng còn mở thuộc Story này.

**Còn mở / chờ quyết định:** Có thể vượt hạn mức miễn phí của dịch vụ camera/micro nếu chạy tải lớn; phần tải chỉ ghi số đo.

**Bằng chứng nộp:** trạng thái ban đầu là NOT_RUN (chưa chạy). Khi chạy, ghi bản dựng, môi trường, kết quả từng dòng (đạt / không đạt / bị chặn), ảnh hoặc nhật ký đã che bí mật.

**Liên kết Jira (khi được phép tạo):** Epic: Chat, camera và micro; liên quan tới (relates to) các Task: T-06 (Thử nghiệm LiveKit Cloud: camera/micro theo từng người, thu hồi quyền); T-51 (Giao diện: camera/micro, bật tắt độc lập, mức chia sẻ, thông báo quyền và lỗi); T-53 (Máy chủ: cấp quyền camera/micro theo vai và mở nhiều tab (tab mới tiếp quản)); T-57 (Nối camera/micro thật: theo đối tượng nhận, đổi vai, đuổi, tab (web, máy chủ, LiveKit)).

---

### Story 24 — Mở nhiều tab: tab mới tiếp quản
**Thuộc Epic:** Chat, camera và micro · **Thành phần:** Communication, Game Server
**Nhãn:** `P1`, `US-MEDIA-03` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống (nhóm tự nhận khi kéo việc) · **Sprint:** chưa gán (Task của Story nằm ở Sprint 4)

**Câu chuyện:** Là người dùng, khi **mở thêm tab** vào cùng phòng, tôi muốn **chỉ một tab điều khiển** để không bị lộn xộn.

**Nguồn (đặc tả)**
- US-MEDIA-03 — Mở nhiều tab (BA 1.8)
- Tiêu chí gốc ở `docs/01-yeu-cau-chi-tiet.md`: AC-MEDIA-03-01.
- Màn hình và thành phần giao diện (`DANH-MUC-MAN-HINH-XIANGQI.md`): Khung Camera và Micro (`PANEL-MEDIA`).

**Nhu cầu và phạm vi**
- **Có:** Mở nhiều tab.
- **Không:** hộp thoại chọn tab phụ (giai đoạn sau).

**Điều kiện để dùng:** đang ở trong phòng ở một tab.

**Bắt đầu khi (phụ thuộc)**
- Cần có kết quả của các Task sau (nằm ngoài Story này), vì chúng cho ra đầu vào của các Task của Story:
  - T-06 — Thử nghiệm LiveKit Cloud: camera/micro theo từng người, thu hồi quyền
  - T-20 — Máy chủ: đăng nhập, quản lý phiên và hồ sơ
  - T-30 — Nối web với máy chủ: đi nước, đồng bộ thế cờ giữa hai trình duyệt
  - T-38 — Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng
  - T-49 — Giao diện chat hai kênh và nối web với máy chủ
  - T-51 — Giao diện: camera/micro, bật tắt độc lập, mức chia sẻ, thông báo quyền và lỗi

**Các bước người dùng làm và hệ thống phản hồi**
1. Mở thêm một tab vào cùng phòng: **tab mới tiếp quản**.
2. Tab cũ hiện "Phiên này đã được mở ở tab khác", chuyển **chỉ đọc**; camera và micro của tab cũ **tự dừng**.
3. Tab mới mặc định **tắt** camera và micro.

**Các quy tắc**
máy chủ **chặn mọi lệnh làm thay đổi** từ tab cũ; phiên hết hạn hoặc sai thì không chiếm được quyền điều khiển.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**
| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
|---|---|---|---|---|---|
| Khung Camera và Micro | Luồng chỉ người được phép nhận | Xin quyền thiết bị/kết nối media | Mặc định tắt/chưa chia sẻ: placeholder không bịa video | Từ chối quyền/lỗi thiết bị: hướng dẫn cấp quyền/thử lại | Người xem không phát; mất ghế/phiên cũ |

**Tiêu chí chấp nhận và cách kiểm (đối chiếu từng tiêu chí của đặc tả)**
| Mã tiêu chí | Điều kiện đạt | Cách kiểm | Task kiểm |
|---|---|---|---|
| `AC-MEDIA-03-01` | Mở thêm tab vào cùng phòng thì tab mới tiếp quản; tab cũ nhận "Phiên này đã được mở ở tab khác", chuyển chỉ đọc; camera/micro tab cũ tự dừng; tab mới mặc định tắt. | Mở hai tab; tab cũ gửi nước. | T-53, T-57 |

**Điều kiện hoàn thành (PASS khi)**
- Mọi dòng trong bảng tiêu chí ở trên đều **đạt**, có bằng chứng; dòng nào không đạt thì Story chưa xong.
- Mọi màn hình ở bảng 5 trạng thái đều hiện đúng cả 5 trạng thái (thành công, đang tải, trống, lỗi, bị khoá có chú thích).
- Các Task liên kết đều đã xong và đã được người kiểm thử và người xem lại mã đồng ý; các điều kiện chấp nhận được kiểm ở máy chủ, không chỉ ở giao diện.
- Không có lỗi mức Cao hoặc Nghiêm trọng còn mở thuộc Story này.

**Còn mở / chờ quyết định:** Không có điểm chờ quyết định.

**Bằng chứng nộp:** trạng thái ban đầu là NOT_RUN (chưa chạy). Khi chạy, ghi bản dựng, môi trường, kết quả từng dòng (đạt / không đạt / bị chặn), ảnh hoặc nhật ký đã che bí mật.

**Liên kết Jira (khi được phép tạo):** Epic: Chat, camera và micro; liên quan tới (relates to) các Task: T-53 (Máy chủ: cấp quyền camera/micro theo vai và mở nhiều tab (tab mới tiếp quản)); T-57 (Nối camera/micro thật: theo đối tượng nhận, đổi vai, đuổi, tab (web, máy chủ, LiveKit)).

---

### Story 25 — Chọn cấp độ, chọn phe và máy đi nước đúng luật
**Thuộc Epic:** Đánh với máy theo cấp độ · **Thành phần:** AI, Frontend
**Nhãn:** `P1`, `US-AI-01`, `US-AI-02` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống (nhóm tự nhận khi kéo việc) · **Sprint:** chưa gán (Task của Story nằm ở Sprint 3, 4)

**Câu chuyện:** Là người chơi, tôi muốn **chọn cấp độ và phe rồi đánh với máy**, máy đáp lại nhanh và không bao giờ đi sai luật.

**Nguồn (đặc tả)**
- US-AI-01 — Chọn cấp độ và phe (BA 6.1, 6.3)
- US-AI-02 — Chơi với máy (BA 6.1, 6.3; [02] mục 9)
- Tiêu chí gốc ở `docs/01-yeu-cau-chi-tiet.md`: AC-AI-01-01, AC-AI-01-02, AC-AI-01-03, AC-AI-02-01, AC-AI-02-02, AC-AI-02-03, AC-AI-02-04.
- Màn hình và thành phần giao diện (`DANH-MUC-MAN-HINH-XIANGQI.md`): Màn hình Đánh với máy (`SCR-AI-GAME`), Hộp chọn Cấp độ và Phe (đánh với máy) (`MODAL-AI-SETUP`).

**Nhu cầu và phạm vi**
- **Có:** Chọn cấp độ và phe; Chơi với máy.
- **Không:** kết thúc và vào lại ván (Story 26); gợi ý nước; đi lại.

**Điều kiện để dùng:** đã đăng nhập, chưa có chỗ chơi khác.

**Bắt đầu khi (phụ thuộc)**
- Cần có kết quả của các Task sau (nằm ngoài Story này), vì chúng cho ra đầu vào của các Task của Story:
  - T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ
  - T-08 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)
  - T-09 — Luật cờ: nước hợp lệ, chiếu, chiếu hết, hết nước, lặp thế, 120 nửa nước
  - T-14 — Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng
  - T-17 — Máy chủ: trạng thái phòng, mỗi người một chỗ chơi và tạo phòng
  - T-22 — Giao diện: kéo thả quân, đánh dấu nước vừa đi, cảnh báo chiếu, âm thanh
  - T-28 — Máy chủ: bộ xử lý lệnh của ván và xử lý nước đi
  - T-46 — Kiểm thử luật cờ: đếm nước đi độc lập và bộ kiểm thử chạy tự động

**Các bước người dùng làm và hệ thống phản hồi**
1. Ở Sảnh có ba thẻ **Dễ**, **Trung bình**, **Khó**; bấm một thẻ thì chọn phe **Đỏ**, **Đen** hoặc **Ngẫu nhiên** (máy chủ bốc 50/50).
2. Nếu người chơi cầm Đen thì **máy (Đỏ) tự đi nước đầu** và bàn lật cho Đen ở dưới.
3. Người chơi đi, máy tìm nước trong thời gian của cấp: **Dễ 300 ms, Trung bình 1.000 ms, Khó 3.000 ms**; hết thời gian thì đi nước tốt nhất đã tìm được. Nếu máy đang bận, chờ tối đa 3 giây (không tính vào thời gian nghĩ), quá thì báo "Thử lại".

**Các quy tắc**
- Mỗi người một chỗ chơi cùng lúc; phe do máy chủ bốc và lưu.
- Ván với máy **không giới hạn thời gian** cho người chơi, không tính Elo, **không có nút xin hoà** (chỉ có Đầu hàng), **không có nút gợi ý nước**; **máy không bao giờ đi nước không hợp lệ**; máy bận thì giữ nguyên ván và lượt.

**Khi có lỗi**
vào ghế phòng và bắt đầu ván máy cùng lúc thì chỉ một chỗ thành công.

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**
| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
|---|---|---|---|---|---|
| Màn hình Đánh với máy | Máy đi hợp lệ, đúng cấp/phe | Đang tìm/đợi tiến trình | Chưa có nước: thế đầu, máy khai cuộc nếu người cầm Đen | ENGINE_BUSY thử cùng ván; ABANDONED tạo ván mới | Lượt máy/phiên cũ; đi lại hết lượt hoặc P1 chưa có |
| Hộp chọn Cấp độ và Phe (đánh với máy) | Tạo ván đúng cấp/phe | Đang tạo/bốc phe | Chưa chọn đủ: hướng dẫn chọn | Tạo lỗi: đối soát, không ván kép | Đang có vị trí chơi hoặc đang gửi |

**Tiêu chí chấp nhận và cách kiểm (đối chiếu từng tiêu chí của đặc tả)**
| Mã tiêu chí | Điều kiện đạt | Cách kiểm | Task kiểm |
|---|---|---|---|
| `AC-AI-01-01` | Ở Sảnh có 3 thẻ Dễ / Trung bình / Khó; bấm mở hộp chọn phe Đỏ / Đen / Ngẫu nhiên (máy chủ bốc 50/50). | Bắt đầu với từng tổ hợp; kiểm phe được lưu. | T-37, T-43, T-55 |
| `AC-AI-01-02` | Cầm Đen thì máy (cầm Đỏ) tự đi nước đầu và bàn cờ lật cho Đen ở dưới. | Chọn Đen. | T-37, T-43 |
| `AC-AI-01-03` | Không có nút gợi ý nước đi. | Tìm nút gợi ý (không có). | T-37, T-58 |
| `AC-AI-02-01` | Máy đáp lại trong thời gian của cấp: Dễ ≤ 300 ms, Trung bình ≤ 1.000 ms, Khó ≤ 3.000 ms; hàng đợi chờ tối đa 3 giây (không tính vào thời gian nghĩ), quá thì báo Thử lại; hết ngân sách thì đi nước tốt nhất đã tìm được. | Đo 200 thế mỗi cấp; giữ mọi tiến trình bận. | T-31, T-43, T-56 |
| `AC-AI-02-02` | Ván với máy không giới hạn thời gian cho người chơi, không cảnh báo chống treo, không tính Elo, không có nút Xin hoà (chỉ có Đầu hàng). | Xem màn ván máy; tìm đồng hồ người chơi và nút xin hoà (không có). | T-37, T-43 |
| `AC-AI-02-03` | Máy không bao giờ đi nước không hợp lệ. | Chạy 1.000 ván; mọi nước hợp lệ. | T-31, T-56 |
| `AC-AI-02-04` | Máy bận: giữ cùng ván, thế và lượt; Thử lại chỉ yêu cầu tìm nước, không gửi lại nước của người chơi; kết quả tác vụ cũ bị bỏ. | Giữ máy bận quá 3 giây rồi Thử lại; gửi kết quả cũ. | T-43, T-37, T-55 |

**Điều kiện hoàn thành (PASS khi)**
- Mọi dòng trong bảng tiêu chí ở trên đều **đạt**, có bằng chứng; dòng nào không đạt thì Story chưa xong.
- Mọi màn hình ở bảng 5 trạng thái đều hiện đúng cả 5 trạng thái (thành công, đang tải, trống, lỗi, bị khoá có chú thích).
- Các Task liên kết đều đã xong và đã được người kiểm thử và người xem lại mã đồng ý; các điều kiện chấp nhận được kiểm ở máy chủ, không chỉ ở giao diện.
- Không có lỗi mức Cao hoặc Nghiêm trọng còn mở thuộc Story này.

**Còn mở / chờ quyết định:** Chất lượng máy cờ chỉ kết luận sau bài đo đầy đủ (cổng GATE-AI); không đạt thì ghi số thật và báo PO.

**Bằng chứng nộp:** trạng thái ban đầu là NOT_RUN (chưa chạy). Khi chạy, ghi bản dựng, môi trường, kết quả từng dòng (đạt / không đạt / bị chặn), ảnh hoặc nhật ký đã che bí mật.

**Liên kết Jira (khi được phép tạo):** Epic: Đánh với máy theo cấp độ; liên quan tới (relates to) các Task: T-31 (Máy cờ: chương trình chạy riêng, ba cấp độ, thử nghiệm sơ bộ tốc độ); T-37 (Giao diện: chọn cấp và phe, màn ván với máy, thông báo sự cố); T-43 (Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ); T-55 (Nối web, máy chủ và máy cờ thật: ván với máy); T-56 (Đo máy cờ đầy đủ (GATE-AI): tốc độ, độ sâu, sức mạnh, độ ổn định).

---

### Story 26 — Kết thúc ván với máy, vào lại ván và sự cố máy cờ
**Thuộc Epic:** Đánh với máy theo cấp độ · **Thành phần:** Frontend, AI
**Nhãn:** `P1`, `US-AI-03`, `US-AI-04` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống (nhóm tự nhận khi kéo việc) · **Sprint:** chưa gán (Task của Story nằm ở Sprint 3, 4)

**Câu chuyện:** Là người chơi, tôi muốn **biết ván với máy kết thúc ra sao, quay lại nếu rớt mạng và thử lại khi máy gặp sự cố**.

**Nguồn (đặc tả)**
- US-AI-03 — Kết thúc, bỏ dở và vào lại (BA 6.3)
- US-AI-04 — Sự cố máy cờ (BA 6.1)
- Tiêu chí gốc ở `docs/01-yeu-cau-chi-tiet.md`: AC-AI-03-01, AC-AI-03-02, AC-AI-03-03, AC-AI-03-04, AC-AI-04-01, AC-AI-04-02.
- Màn hình và thành phần giao diện (`DANH-MUC-MAN-HINH-XIANGQI.md`): Màn hình Đánh với máy (`SCR-AI-GAME`), Hộp xác nhận Đầu hàng (`MODAL-CONFIRM-RESIGN`), Hộp xác nhận Rời phòng khi đang đấu (`MODAL-CONFIRM-LEAVE`), Hộp Kết quả ván (`MODAL-MATCH-RESULT`), Lớp phủ Mất kết nối (`OVERLAY-RECONNECTING`).

**Nhu cầu và phạm vi**
- **Có:** Kết thúc, bỏ dở và vào lại; Sự cố máy cờ.
- **Không:** lưu lịch sử bền; tự hạ cấp máy.

**Điều kiện để dùng:** đang chơi với máy.

**Bắt đầu khi (phụ thuộc)**
- Cần có kết quả của các Task sau (nằm ngoài Story này), vì chúng cho ra đầu vào của các Task của Story:
  - T-02 — Soạn "hợp đồng chung" giữa trình duyệt và máy chủ
  - T-08 — Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo)
  - T-14 — Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng
  - T-17 — Máy chủ: trạng thái phòng, mỗi người một chỗ chơi và tạo phòng
  - T-22 — Giao diện: kéo thả quân, đánh dấu nước vừa đi, cảnh báo chiếu, âm thanh
  - T-28 — Máy chủ: bộ xử lý lệnh của ván và xử lý nước đi
  - T-31 — Máy cờ: chương trình chạy riêng, ba cấp độ, thử nghiệm sơ bộ tốc độ

**Các bước người dùng làm và hệ thống phản hồi**
1. Ván kết thúc khi chiếu hết, hết nước đi, đầu hàng hoặc hoà; hiện hộp kết quả chỉ có **Rời phòng**.
2. Đóng tab hoặc mất mạng: ván **giữ 30 phút** để vào lại cùng đường dẫn; Sảnh hiện băng "Bạn có ván đang chơi dở — Quay lại". Quá 30 phút ván là **Bỏ dở**. **Chủ động rời hoặc đăng xuất** (có xác nhận) thì **đầu hàng ngay**, không có ân hạn.
3. Nếu máy lỗi hoặc không trả lời quá 10 giây: ván thành **Bỏ dở**, báo "Máy cờ gặp sự cố" kèm nút **Thử lại**; thử lại tạo **ván mới** cùng cấp và cùng phe thực tế.
4. Nếu máy chỉ **đang bận**: nút Thử lại chỉ yêu cầu máy tìm lại nước, **không gửi lại nước của người chơi**.

**Các quy tắc**
không có đi lại và lịch sử ở giai đoạn này; bấm Thử lại trùng chỉ có một tác dụng; kết quả đến muộn bị bỏ, không đổi thế cờ.

**Khi có lỗi**
máy bận và máy hỏng cho hai nút Thử lại khác nhau; thất bại khi tạo ván mới thì không thông báo "đã tạo".

**Năm trạng thái cần nghiệm thu (theo ma trận nghiệm thu)**
| Màn hình / thành phần | Thành công | Đang tải | Trống | Lỗi | Bị khoá |
|---|---|---|---|---|---|
| Màn hình Đánh với máy | Máy đi hợp lệ, đúng cấp/phe | Đang tìm/đợi tiến trình | Chưa có nước: thế đầu, máy khai cuộc nếu người cầm Đen | ENGINE_BUSY thử cùng ván; ABANDONED tạo ván mới | Lượt máy/phiên cũ; đi lại hết lượt hoặc P1 chưa có |
| Hộp xác nhận Đầu hàng | Xác nhận: RESIGN; Huỷ không đổi ván | Đợi ACK; chặn xác nhận trùng | Không còn ván đang chơi: đóng, hiện kết quả thật | Mất ACK: đối soát, không báo thua giả | Ván kết thúc/phiên cũ/không phải người chơi |
| Hộp xác nhận Rời phòng khi đang đấu | Rời/Đăng xuất giữa ván xác nhận hậu quả | Đợi xử lý rời/đầu hàng | Không còn mục tiêu: đóng, về trạng thái hiện tại | Lỗi xử lý: giữ thông báo và đối soát | Đã xử lý hoặc không còn quyền điều khiển |
| Hộp Kết quả ván | Kết quả/lý do đúng; nút theo phân kỳ | Đợi kết quả có thẩm quyền | Chưa có kết quả: đợi/đối soát, không đoán thắng | Tải kết quả lỗi: Thử lại, không cho đi thêm | Tái đấu/Replay sai chế độ, P1 ẩn |
| Lớp phủ Mất kết nối | Đã nối lại nhận snapshot rồi tự tắt | Nối lại kèm thời hạn đúng vai trò | Không mất kết nối: overlay không hiện | Quá hạn: kết quả/mất ghế/về Sảnh đúng loại | Không Esc/bấm ngoài; chặn lệnh cần kết nối |

**Tiêu chí chấp nhận và cách kiểm (đối chiếu từng tiêu chí của đặc tả)**
| Mã tiêu chí | Điều kiện đạt | Cách kiểm | Task kiểm |
|---|---|---|---|
| `AC-AI-03-01` | Ván kết thúc khi chiếu hết, hết nước đi, đầu hàng hoặc hoà theo luật; hộp kết quả chỉ có Rời phòng. | Gây từng kiểu kết thúc. | T-43, T-37, T-55 |
| `AC-AI-03-02` | Đóng tab hoặc mất kết nối: ván giữ 30 phút để vào lại cùng đường dẫn; Sảnh hiện băng "Bạn có ván đang chơi dở — Quay lại"; quá 30 phút thì Bỏ dở. | Vào lại trước và sau 30 phút. | T-43, T-37, T-55, T-14 |
| `AC-AI-03-03` | Đi lại và lưu lịch sử là giai đoạn sau, không hiện. | Tìm hai chức năng (không có). | T-37, T-58 |
| `AC-AI-03-04` | Chủ động Rời ván hoặc Đăng xuất khi đang chơi với máy: xác nhận đầu hàng; đồng ý thì kết thúc, huỷ tìm kiếm, giải phóng chỗ chơi; Huỷ giữ ván; không áp ân hạn 30 phút. | Huỷ và đồng ý; kiểm chỗ chơi được giải phóng. | T-43, T-48, T-55 |
| `AC-AI-04-01` | Máy lỗi hoặc không phản hồi quá 10 giây thì ván Bỏ dở, báo "Máy cờ gặp sự cố" kèm nút Thử lại. | Giết tiến trình máy. | T-43, T-37, T-55 |
| `AC-AI-04-02` | Thử lại sau Bỏ dở tạo ván mới cùng cấp và phe thực tế (phe Ngẫu nhiên giữ kết quả đã bốc); không hồi sinh ván cũ; kiểm một chỗ chơi và chặn bấm trùng; thất bại không báo đã tạo. | Bấm Thử lại nhiều lần. | T-43, T-55 |

**Điều kiện hoàn thành (PASS khi)**
- Mọi dòng trong bảng tiêu chí ở trên đều **đạt**, có bằng chứng; dòng nào không đạt thì Story chưa xong.
- Mọi màn hình ở bảng 5 trạng thái đều hiện đúng cả 5 trạng thái (thành công, đang tải, trống, lỗi, bị khoá có chú thích).
- Các Task liên kết đều đã xong và đã được người kiểm thử và người xem lại mã đồng ý; các điều kiện chấp nhận được kiểm ở máy chủ, không chỉ ở giao diện.
- Không có lỗi mức Cao hoặc Nghiêm trọng còn mở thuộc Story này.

**Còn mở / chờ quyết định:** Không có điểm chờ quyết định.

**Bằng chứng nộp:** trạng thái ban đầu là NOT_RUN (chưa chạy). Khi chạy, ghi bản dựng, môi trường, kết quả từng dòng (đạt / không đạt / bị chặn), ảnh hoặc nhật ký đã che bí mật.

**Liên kết Jira (khi được phép tạo):** Epic: Đánh với máy theo cấp độ; liên quan tới (relates to) các Task: T-37 (Giao diện: chọn cấp và phe, màn ván với máy, thông báo sự cố); T-43 (Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ); T-55 (Nối web, máy chủ và máy cờ thật: ván với máy).
