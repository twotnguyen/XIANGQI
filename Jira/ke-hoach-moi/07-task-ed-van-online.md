# Kế hoạch mới (bản nháp) — 07: Task của Epic ED — Ván đấu online

**Ngày:** 2026-10-04 · **Trạng thái:** ĐỀ XUẤT, chờ PO và nhóm duyệt · Chưa tạo gì trên Jira. Khung, phụ thuộc và Sprint: `01-components-epic-khung-task.md`; Description Epic: `02-epic.md`.

Epic gồm **11 task**. Mỗi task: dòng đầu (Epic, thành phần, Sprint, **is blocked by**) lấy từ khung; **Bắt đầu khi (kết quả cần có)** nêu hiện vật cụ thể của từng tiền đề. Chưa có ước lượng giờ và người nhận việc (nhóm điền khi Sprint Planning).

### TD-01 — Máy chủ: máy trạng thái ván, hàng đợi lệnh, commandId/matchVersion, biên lai
**Epic:** ED · **Thành phần:** Realtime · **Sprint đề xuất:** 2 (08/10–10/10) · **Bắt đầu khi (is blocked by):** `TB-04`, `TC-04`, `T0-04`, `T0-13`
**Bắt đầu khi (kết quả cần có):** TB-04: Match ID, hai ghế, thế ban đầu/lượt Đỏ và mốc khởi tạo; chưa gồm clock chạy thật. TC-04: hàm luật/kết quả và bộ đếm lặp/không ăn. T0-04: schema matches/match_moves/command_receipts. T0-13: primitive biên lai theo danh tính/commandId ghép vào giao dịch nghiệp vụ.

**Mục tiêu:** Tạo một luồng xử lý có thẩm quyền cho ván online của ED. Các lệnh cạnh tranh và gửi lại phải tạo đúng một tác động, làm nền cho nước đi và kết quả.

**Yêu cầu / nguồn:** US-PLAY-01: AC-PLAY-01-03 — chống lệnh trùng, từ chối phiên bản cũ. US-PLAY-07: AC-PLAY-07-04 — sự cố máy chủ chuyển INTERRUPTED. Nguồn bổ sung: docs/03 §2.6–2.8; docs/04 §4.2; docs/07 §3.

**Kết quả (đầu ra):** Hàng đợi lệnh theo ván, bản nháp state, giao dịch dữ liệu/biên lai, ACK/version; trạng thái tạm dừng ghi và hook/mốc lỗi đầu tiên, hồi phục, INTERRUPTED. Adapter clock fixture kiểm hợp đồng tín hiệu, không phải clock sản phẩm.

**Phạm vi / ngoài phạm vi:** Ván online P1. Không áp ghi bền hoặc PERSIST_FAILED cho AI P1, không làm Elo.

**Đầu vào cần có:** Shared contract qua TB-04, schema T0-04 và primitive T0-13. Task tự tạo callback nghiệp vụ/clock fixture và nguồn thời gian kiểm điều khiển được. Không cần TD-03 hay TD-05 để PASS nền; TD-03 nhận hook/mốc này và nghiệm thu đóng băng clock thật.

**Cách làm gợi ý:**

1. Xác thực rồi tra biên lai T0-13; chỉ lệnh mới kiểm quyền/trạng thái/version.
2. Xếp lệnh tuần tự; bản nháp chỉ công bố sau giao dịch dữ liệu/biên lai thành công, không tách commit.
3. Ghi lỗi bỏ bản nháp, thử tối đa 2 lần cách 200 ms; vẫn lỗi trả PERSIST_FAILED, chuyển tạm dừng ghi và phát hook nội bộ với mốc lỗi đầu tiên, không phát snapshot thành công.
4. Hồi phục khi tiến trình sống: chưa quá 30 giây thì phát tín hiệu tiếp tục; quá 30 giây chuyển INTERRUPTED và chỉ ghi bù ván đã gián đoạn. Kiểm tín hiệu/mốc bằng adapter clock fixture; không trừ giờ thật tại task nền.
5. Bàn giao hook/mốc cho TD-03 kiểm clock thật; TD-05 xử lý restart/quét ONGOING và TD-11 kiểm toàn luồng. Không cần các hậu nhiệm để PASS hàng đợi/giao dịch.

**Kiểm thử:** Vitest tích hợp DB thử, lỗi ghi chủ động và clock adapter fixture; ca nội bộ.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Lặp/cũ | Hai lệnh cùng commandId rồi retry sau đổi version | Một tác động/biên lai; retry trả kết quả cũ trước kiểm version |
| Ca 2 | Lệnh mới sai | CommandId mới, version cũ hoặc sai quyền | Từ chối không đổi dữ liệu |
| Ca 3 | Ghi lỗi | Gây lỗi trước commit, kiểm retry và hook | Bỏ bản nháp, tối đa 2 retry cách 200 ms, trả PERSIST_FAILED; không phát thành công, hook ghi đúng mốc lỗi đầu |
| Ca 4 | Hồi phục/hạn | Clock fixture tiến tới trong hạn, đúng 30 giây, rồi quá 30 giây; hồi phục DB | Chỉ quá 30 giây mới INTERRUPTED; còn trong hạn được tiếp tục; ván đã INTERRUPTED không hồi sinh, ghi bù đúng |
| Ca 5 | Mất ACK | Commit xong rồi mất ACK/khởi tạo lại handler, gửi lại cùng lệnh | Đọc biên lai bền, không thi hành lại hoặc ghi lệch dữ liệu |
| Ca 6 | Dữ liệu sau mất quyền | Đổi vai rồi đọc lại biên lai | Không tác động lần hai, không trả dữ liệu ngoài quyền; hình dạng biên lai theo phương án đã duyệt |

**PASS khi:** Mọi ca hàng đợi/giao dịch/retry/tín hiệu có oracle đã duyệt đạt với DB thật và clock fixture được ghi rõ; không dữ liệu/biên lai lệch hoặc snapshot thành công trước commit. FAIL nếu retry thi hành hai lần, mốc lỗi bị reset trái luật hoặc hồi sinh INTERRUPTED. PASS nền không khẳng định giờ thật đã đóng băng hay restart E2E đã đạt; hai phần đó thuộc TD-03 và TD-05/11.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** Hình dạng biên lai/lọc lại quyền còn đề xuất ở docs/07 §3, chờ quyết định trước chốt thiết kế; không được lộ dữ liệu vì nhánh thiết kế chưa chốt. Hook nội bộ lỗi ghi không phải match.state thành công. Không thêm cạnh TD-03 ngược về nền.

---

### TD-02 — Máy chủ: xử lý nước đi, cập nhật thế cờ, phát trạng thái
**Epic:** ED · **Thành phần:** Match, Realtime · **Sprint đề xuất:** 2 (08/10–10/10) · **Bắt đầu khi (is blocked by):** `TD-01`
**Bắt đầu khi (kết quả cần có):** TD-01: hàng đợi lệnh, kiểm danh tính/version, giao dịch và biên lai.

**Mục tiêu:** Áp dụng nước đi vào ván online theo luật chung. Trạng thái đã lưu được phát cho đúng thành viên để web và người xem đồng bộ.

**Yêu cầu / nguồn:** US-PLAY-01: AC-PLAY-01-01 — đúng ghế/lượt, nước hợp lệ; AC-PLAY-01-02 — nước sai không đổi ván; AC-PLAY-01-03 — lệnh trùng/cũ đúng phản hồi. Nguồn bổ sung: docs/02 §3.4; docs/03 §2.7; docs/04 §4.

**Kết quả (đầu ra):** Bộ nhận match.move, cập nhật bàn/lượt/nước cuối/bộ đếm, ghi match_moves và phát match.state có version.

**Phạm vi / ngoài phạm vi:** Xử lý nước P1; không tin thế cờ client gửi, không thêm undo hay Replay.

**Đầu vào cần có:** Hàm kiểm nước hợp lệ TC-03 và kết quả TC-04 qua TD-01; tọa độ chuẩn và hợp đồng trạng thái.

**Cách làm gợi ý:**

1. Kiểm input và quyền trong hàng đợi của TD-01.
2. Dùng luật chung tạo thế sau nước, ghi tọa độ chuẩn; giữ hook kiểm đồng hồ trước nước.
3. Commit rồi phát snapshot theo quyền; trả nguyên nhân từ chối và trạng thái mới nhất.

**Kiểm thử:** Vitest đơn vị/tích hợp nhiều kết nối. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Đúng luật | Đi hợp lệ ở Đỏ và Đen | Một nước lưu, lượt và version tiến đúng |
| Ca 2 | Quyền | Người xem/người ngoài/sai lượt gửi match.move | Không đổi thế hay ghi nước |
| Ca 3 | Nước sai | Đi gây hai Tướng đối mặt hoặc tự bị chiếu | Bị từ chối, thế giữ nguyên |
| Ca 4 | Lặp/cũ | Gửi lại cùng lệnh và lệnh mới version cũ | Không thêm nước; phản hồi phân biệt đúng |

**PASS khi:** Mọi ca đạt, dữ liệu DB và snapshot khớp; phép đo <100 ms theo AC cần xác nhận toàn luồng ở TD-09/TQ-02. Sai ca bắt buộc: FAIL; chưa kiểm/thiếu điều kiện: NOT_RUN/BLOCKED.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** Đồng hồ đầy đủ thuộc TD-03; TD-02 không tự tuyên bố đạt xử lý TIMEOUT trước khi tích hợp thành phần đó.

### TD-03 — Máy chủ: đồng hồ phía máy chủ và kết thúc TIMEOUT
**Epic:** ED · **Thành phần:** Match · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `TD-02`
**Bắt đầu khi (kết quả cần có):** TD-02: luồng nước đi tuần tự và điểm kiểm trước áp dụng.

**Mục tiêu:** Cho máy chủ quyết định thời gian còn lại và TIMEOUT. Đồng hồ client chỉ trình bày, không thể thay kết quả của ED.

**Yêu cầu / nguồn:** US-PLAY-02: AC-PLAY-02-01 — 5/10/15 phút, không cộng giây; AC-PLAY-02-02 — tính giờ trước nước đi. Phần cảnh báo UI AC-PLAY-02-03 do TD-08/10 nối. Nguồn bổ sung: docs/04 §6; docs/02 §3.4; BA 2.1, 8.3.

**Kết quả (đầu ra):** remainingMs, mốc đơn điệu, bộ hẹn giờ lượt và kết quả TIMEOUT; snapshot giờ cho web.

**Phạm vi / ngoài phạm vi:** CASUAL có giờ P1; không giờ vô hạn/chống treo P2, không hoàn hoặc cộng giờ.

**Đầu vào cần có:** Mốc bắt đầu ván/lượt Đỏ, mức giờ và Match ID từ TB-04 qua TD-01/02; hook trước áp dụng nước TD-02. TD-01 cung cấp tín hiệu lỗi ghi/hồi phục/INTERRUPTED, được kiểm bằng adapter clock fixture ở task nền; TD-03 sở hữu clock thật và nối các tín hiệu đó. Mốc DISCONNECT ở đây là đầu vào giả lập của hàm phân xử, không cần runtime TD-05.

**Cách làm gợi ý:**

1. Khởi động clock Đỏ đúng mốc TB-04, trừ thời gian đơn điệu trước xét nước.
2. Nối tín hiệu lỗi ghi TD-01: đóng băng cả hai bên từ lỗi đầu tiên; hồi phục trong 30 giây mở lại, quá 30 giây INTERRUPTED thì không chạy tiếp.
3. Hẹn hạn tuyệt đối, hủy callback cũ; phân xử TIMEOUT trước/sau/bằng mốc DISCONNECT giả lập. Bằng nhau ưu tiên TIMEOUT.
4. TD-05 nhận ca socket mất mạng thật; TD-10 nhận bắt đầu ván/clock trên web theo AC-ROOM-03-02; TD-11 nhận reconnect toàn luồng.

**Kiểm thử:** Vitest đồng hồ điều khiển được và tích hợp. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Ba mức | Khởi tạo lần lượt 5/10/15 phút; đi nước | Chỉ bên tới lượt giảm, không cộng giây |
| Ca 2 | Biên hết giờ | Nước tới khi remainingMs bằng 0 | TIMEOUT, nước không áp dụng |
| Ca 3 | Timer cũ | Đổi lượt rồi gọi callback lượt trước | Không kết thúc nhầm |
| Ca 4 | Lỗi ghi thật | Gây lỗi DB qua TD-01, hồi phục trong hạn rồi thử quá 30 giây | Cả hai clock đóng băng; chỉ mở lại ván còn tiếp tục, không chạy sau INTERRUPTED |
| Ca 5 | Phân xử fixture | Cấp mốc TIMEOUT trước/sau/bằng mốc DISCONNECT, đảo thứ tự callback | TIMEOUT/DISCONNECT/TIMEOUT tương ứng, một kết quả không phụ thuộc callback |
| Ca 6 | Khởi tạo | Nhận Match ID/mốc giờ TB-04, bắt đầu và đi nước đầu | Chỉ Đỏ chạy trước nước đầu; chuyển lượt không khởi tạo lại giờ |

**PASS khi:** Clock thật, hook lỗi ghi và phân xử bằng mốc giả lập đạt; không phụ thuộc TD-05. Chưa nghiệm thu mất mạng thật/toàn AC-ROOM-03-02 trên web. FAIL nếu sai ưu tiên, chạy giờ trong lúc đóng băng hoặc callback cũ kết thúc lần hai.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** Không dùng giờ client làm oracle. TD-01 chỉ cung cấp hook/mốc (không chạy đồng hồ thật); TD-10 và TD-11 nhận các ca toàn luồng đã chuyển (ghi trong mô tả của hai task đó). Không thêm cạnh ngược.

---

### TD-04 — Máy chủ: kết thúc ván, đầu hàng, xin hoà, lặp thế/chiếu liên tục/không ăn
**Epic:** ED · **Thành phần:** Match · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `TD-02`
**Bắt đầu khi (kết quả cần có):** TD-02: luồng áp dụng nước và bộ đếm luật được ghi nguyên tử.

**Mục tiêu:** Chốt mọi kết quả luật và hành động kết thúc của ván CASUAL. Đề nghị hòa có vòng đời rõ, không ghi đè kết quả đã chốt.

**Yêu cầu / nguồn:** US-PLAY-03, US-PLAY-04, US-PLAY-05, US-PLAY-08. AC-PLAY-03-01 — chiếu hết/hết nước đều thua; AC-PLAY-04-01 — đầu hàng sau xác nhận; AC-PLAY-05-03 — một đề nghị, chờ 5 nước sau từ chối/hết hạn; AC-PLAY-08-02 — chiếu hết ưu tiên hòa. Nguồn bổ sung: docs/02 §3–5; docs/07 §6; BA 3.3, 3.5, 3.6.

**Kết quả (đầu ra):** Bộ kết thúc một lần, lý do/kết quả, vô hiệu lệnh và đề nghị; máy trạng thái xin hòa 30 giây.

**Phạm vi / ngoài phạm vi:** CASUAL P1; không yêu cầu 20 nước của RANKED, không undo/tái đấu.

**Đầu vào cần có:** Hàm TC-04, con trỏ nước, lượt của người xin; sự kiện offer/respond/resign và hủy đề nghị từ shared.

**Cách làm gợi ý:**

1. Xét CHECKMATE/STALEMATE rồi PERPETUAL_CHECK, lặp, 120 nửa nước.
2. Tạo/rút/trả lời đề nghị dưới hàng đợi; đếm cooldown bằng nước của chính người xin.
3. Ghi kết quả một lần, ngừng nước mới và hủy đề nghị; phát ended cho phòng.

**Kiểm thử:** Vitest bộ thế và tích hợp. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Kết quả luật | Dùng bộ thế hết nước, chiếu liên tục, lặp lần ba, 119/120 | Kết quả theo docs/02, ăn quân reset bộ đếm |
| Ca 2 | Xin hòa | Đồng ý/từ chối/rút/hết 30 giây; gửi lại trước đủ 5 nước | Đúng hòa hoặc tiếp tục; chặn cooldown |
| Ca 3 | Đồng thời | Đầu hàng/nước kết thúc và phản hồi hòa cạnh tranh | Chỉ một kết quả, phản hồi muộn vô hiệu |
| Ca 4 | Quyền | Người xem trả lời hoặc đầu hàng thay bên khác | Từ chối không đổi ván |

**PASS khi:** Mọi ca đạt, một lần kết thúc; không tự hòa do thiếu quân hoặc xử đuổi quân bằng luật ngoài phạm vi. Sai ca bắt buộc: FAIL; chưa kiểm/thiếu điều kiện: NOT_RUN/BLOCKED.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** TIMEOUT nối TD-03 và kiểm ở TD-10; hình thức kết quả trung tính INTERRUPTED còn chờ PO.

### TD-05 — Máy chủ: rời phòng giữa ván, mất kết nối, ân hạn 60 giây, kết nối lại, INTERRUPTED
**Epic:** ED · **Thành phần:** Realtime · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `TD-03`, `TD-04`
**Bắt đầu khi (kết quả cần có):** TD-03: đồng hồ và phân xử hạn tuyệt đối; TD-04: kết thúc một lần và vô hiệu đề nghị.

**Mục tiêu:** Phân biệt rời có xác nhận và mất kết nối. Giữ quyền phục hồi đúng thời hạn mà không hồi sinh ván đã kết thúc.

**Yêu cầu / nguồn:** US-PLAY-06, US-PLAY-07: AC-PLAY-06-01 — rời giữa ván là đầu hàng; AC-PLAY-07-01 — ân hạn theo vai, giờ vẫn chạy; AC-PLAY-07-02 — nối lại nhận đầy đủ; AC-PLAY-07-04 — restart thành INTERRUPTED. Nguồn bổ sung: BA 8.3; docs/04 §4.2, §6; docs/07 §4.3, §5.

**Kết quả (đầu ra):** Bộ hẹn ân hạn, xử lý reconnect/sync, phục hồi restart và bản ghi INTERRUPTED.

**Phạm vi / ngoài phạm vi:** Người đấu 60 giây, ghế WAITING/FINISHED 60 giây không thua, người xem 5 phút. AI 30 phút thuộc TG.

**Đầu vào cần có:** Danh tính/chỗ giữ và snapshot qua chuỗi tiền đề; clock TD-03 và kết thúc một lần TD-04. Task tự tạo runtime ngắt/nối Socket.IO và ân hạn. Fixture membership WAITING/FINISHED/người xem kiểm runtime; policy LOCKED/mã/link TB-06 chưa là tiền đề nên nối toàn luồng ở TD-11 sau TB-11.

**Cách làm gợi ý:**

1. Ghi mốc mất kết nối ở máy chủ; reconnect theo danh tính chỗ giữ.
2. Phân xử TIMEOUT/DISCONNECT theo mốc; cả hai quá hạn thì người rớt trước thua.
3. Restart quét ONGOING sang INTERRUPTED; tách phục hồi DB lúc tiến trình còn sống.

**Kiểm thử:** Vitest tích hợp, ngắt kết nối và restart tiến trình thử. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Ân hạn | Nối lại trước/sau hạn theo ba vai | Trong hạn giữ tư cách; quá hạn đúng mất ghế/chỗ hoặc thua |
| Ca 2 | Hai bên rớt | Rớt lệch thời điểm và chờ cả hai quá hạn | Người rớt trước thua, TIMEOUT sớm hơn vẫn ưu tiên |
| Ca 3 | Rời chủ động | Xác nhận rời khi đang đấu | RESIGN ngay, không chờ 60 giây |
| Ca 4 | Restart | Khởi động lại khi có ván và nước đã lưu | INTERRUPTED, không ghi đè nước cũ hoặc tiếp tục ván |
| Ca 5 | Hạn cạnh tranh thật | Ngắt socket đang đấu, đặt hạn TIMEOUT trước/sau/bằng hạn 60 giây; đảo callback | TIMEOUT/DISCONNECT/TIMEOUT tương ứng, một kết quả; mất mạng thông thường clock vẫn chạy |
| Ca 6 | Runtime và fixture vai | Ngắt/nối socket trước/sau hạn với fixture ghế WAITING/FINISHED/người xem | Trong hạn giữ tư cách; quá 60 giây mất ghế không thua ở WAITING/FINISHED, quá 5 phút mất chỗ xem |

**PASS khi:** Các ca runtime server và nhánh đã duyệt đạt với clock/kết thúc thật. Fixture vai ghi rõ phạm vi; không nhận AC-ROOM-07-03 toàn luồng LOCKED đã đạt trước TD-11 nối TB-06 qua TB-11. FAIL nếu nhân ván/nước, reset ân hạn trái luật hoặc phân xử phụ thuộc thứ tự callback.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** Phòng PLAYING→FINISHED sau restart và UI trung tính đang chờ PO; ghi riêng không tự chọn CLOSED hay nghiệm thu nhánh đó.

---

### TD-06 — Máy chủ: người xem theo dõi trực tiếp, lọc dữ liệu theo vai trò
**Epic:** ED · **Thành phần:** Realtime · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `TD-02`, `TB-03`, `TD-03`
**Bắt đầu khi (kết quả cần có):** TD-02: snapshot ván đã commit và luồng phát; TB-03: tư cách người xem đã kiểm sức chứa và quyền vào; TD-03: snapshot remainingMs/mốc lượt và bộ tính đồng hồ có thẩm quyền.

**Mục tiêu:** Cấp luồng trạng thái chỉ đọc cho người xem hợp lệ. ED dùng cùng trạng thái ván cho mọi người nhưng lọc dữ liệu trước khi truyền.

**Yêu cầu / nguồn:** US-PLAY-09: AC-PLAY-09-01 — bàn/giờ/nước trực tiếp chỉ đọc; AC-PLAY-09-02 — không Kênh Riêng/phát media; AC-PLAY-09-03 — số X/N. Nguồn bổ sung: BA 4.1, 4.3; docs/07 §2; docs/03 §3.

**Kết quả (đầu ra):** Bộ lọc payload và đăng ký nhận theo phòng/vai; thông tin X/N, kết quả cho người xem.

**Phạm vi / ngoài phạm vi:** CASUAL tối đa 2 người xem P1, không Replay hoặc phát media.

**Đầu vào cần có:** Danh sách thành viên và max_spectators, thế/lượt/giờ/nước cuối đã xác nhận; không dùng user_id client tự khai. Đầu vào mới bắt buộc: TD-03: snapshot remainingMs/mốc lượt và bộ tính đồng hồ có thẩm quyền.

**Cách làm gợi ý:**

1. Xác thực tư cách trước join luồng trạng thái.
2. Chọn trường được phép, không gửi chat riêng rồi ẩn.
3. Gỡ đăng ký khi hết quyền và đồng bộ lại khi reconnect hợp lệ.
4. Lấy remainingMs và mốc lượt từ TD-03 cho snapshot người xem; không khởi tạo đồng hồ có thẩm quyền riêng ở client.

**Kiểm thử:** Vitest tích hợp kiểm payload thô. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Được xem | Người xem hợp lệ nhận nước/kết quả | Nhận trực tiếp không tạo trễ cố ý |
| Ca 2 | Chỉ đọc | Người xem gửi move/resign | Bị từ chối |
| Ca 3 | Rò dữ liệu | So payload của người xem/người ngoài | Không chat riêng/email; ngoài phòng không nhận |
| Ca 4 | Quyền đổi | Đuổi hoặc hết chỗ giữ rồi xin sync | Không tiếp tục nhận dữ liệu |
| Ca 5 | Giờ người xem | Cho người xem vào giữa lượt, đồng bộ lại sau nước đi | Giờ/lượt khớp snapshot TD-03; chỉ hiển thị, không điều khiển |

**PASS khi:** Mọi ca đạt; không payload trái quyền; độ trễ người xem đo ở TQ-02, không chỉ đo thời gian server. Sai ca bắt buộc: FAIL; chưa kiểm/thiếu điều kiện: NOT_RUN/BLOCKED.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** Ca đuổi/đổi vai thực tế cần vòng đời phòng nâng cao; TD-06 kiểm bộ lọc bằng fixture, TD-11 đã chờ TB-11 để kiểm toàn luồng. NFR-01 đo ở TQ-02.

### TD-07 — Máy chủ và Web: bảng nước đi (ký hiệu tiếng Việt)
**Epic:** ED · **Thành phần:** Frontend · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `TC-05`, `TD-02`, `T0-10`
**Bắt đầu khi (kết quả cần có):** TC-05: hàm ký hiệu theo phe, phân biệt quân trùng; TD-02: chuỗi nước có thứ tự/version đã commit; T0-10: ứng dụng React/Vite với router và kết nối shared chạy được.

**Mục tiêu:** Nối nước đi đã xác nhận với ký hiệu tiếng Việt và danh sách trên web. Người chơi/người xem theo dõi ván hiện tại, không biến danh sách thành Replay.

**Yêu cầu / nguồn:** US-PLAY-10: AC-PLAY-10-01 — ký hiệu tiếng Việt, tự cuộn tới nước mới nhất. Nguồn bổ sung: docs/02 §7; docs/03 §2.7; DESIGN §6.7.

**Kết quả (đầu ra):** Dữ liệu notation cho nước, danh sách web tự cuộn và đồng bộ lại không trùng dòng.

**Phạm vi / ngoài phạm vi:** Danh sách ván đang xem P1; không tua nước, xuất FEN/PGN hoặc lịch sử P2.

**Đầu vào cần có:** Cặp nối: hàm notation/chuỗi nước máy chủ với thành phần danh sách nhận snapshot trên web. Đầu vào mới bắt buộc: T0-10: ứng dụng React/Vite với router và kết nối shared chạy được.

**Cách làm gợi ý:**

1. Sinh notation từ thế trước nước và bên đi.
2. Gửi định danh/thứ tự/notation, dựng danh sách có trạng thái rỗng/lỗi.
3. Sau sync thay dữ liệu theo snapshot, tự cuộn khi nhận nước hợp lệ mới.
4. Ghép thành phần bảng nước vào ứng dụng T0-10, nối subscription/snapshot với TD-02 và hàm ký hiệu TC-05; kiểm cả build web và máy chủ.

**Kiểm thử:** Vitest ký hiệu, Playwright danh sách. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Hai phe | Đi Pháo/Mã ở hai phía bàn lật | Cột theo bên đi, không theo góc màn hình |
| Ca 2 | Trùng quân | Dùng bộ hai Xe/Pháo/Mã, nhiều Tốt | Ký hiệu duy nhất theo TC-05 |
| Ca 3 | Sync | Ngắt rồi nối lại, phát lại snapshot | Không thiếu/trùng dòng, đúng thứ tự |
| Ca 4 | Rỗng/lỗi | Ván chưa có nước hoặc tải thất bại | EMPTY/ERROR đúng, không bịa nước |
| Ca 5 | Ghép web thật | Mở trang trong khung T0-10, nhận nước đã commit và snapshot gửi lại | Danh sách dựng được, không trùng dòng hoặc dùng ký hiệu giả |

**PASS khi:** Mọi ca đạt, mỗi nước hiệu lực có một dòng khớp máy chủ; người xem không có thao tác thay thế cờ. Sai ca bắt buộc: FAIL; chưa kiểm/thiếu điều kiện: NOT_RUN/BLOCKED.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** Ký hiệu lấy docs/02 §7; không dùng §8 đang còn trong dòng nguồn TC-05 của khung. Reconnect toàn luồng được nghiệm thu ở TD-11.

### TD-08 — Web: giao diện ván (bàn cờ nối mạng, đồng hồ, nút, hộp kết quả, khung đề nghị)
**Epic:** ED · **Thành phần:** Frontend · **Sprint đề xuất:** 2 (08/10–10/10) · **Bắt đầu khi (is blocked by):** `TC-10`, `T0-03`, `T0-10`, `TC-09`
**Bắt đầu khi (kết quả cần có):** TC-10: bàn cờ, nước cuối, cảnh báo chiếu và âm thanh; T0-03: hợp đồng snapshot/ack/kết quả/đề nghị; T0-10: ứng dụng React/Vite với router và kết nối shared chạy được; TC-09: tương tác kéo thả dùng cùng tọa độ/nước hợp lệ với click, thả sai trượt về.

**Mục tiêu:** Dựng giao diện ván theo hợp đồng ED để nối với máy chủ sau. Người dùng nhận rõ trạng thái chờ, giờ, đề nghị và kết quả.

**Yêu cầu / nguồn:** US-PLAY-01, US-PLAY-02, US-PLAY-03, US-PLAY-04, US-PLAY-05. AC-PLAY-01-04 — quân mờ khi chờ ack; AC-PLAY-02-03 — cảnh báo dưới 30 giây; AC-PLAY-05-04 — đề nghị không modal, X/Esc chỉ thu gọn; AC-PLAY-03-02 — kết quả chỉ Rời phòng ở P1. Nguồn bổ sung: DANH-MUC §2, SCR-GAME-ROOM; DESIGN §6.6–6.8, §7.4. US-BOARD-03: AC-BOARD-03-01 — kéo đúng đi nước, kéo sai trượt về; AC-BOARD-03-02 — click/kéo và cảm ứng cho cùng kết quả.

**Kết quả (đầu ra):** Màn ván, đồng hồ, xác nhận đầu hàng, hộp kết quả và khung hòa; adapter hợp đồng có dữ liệu kiểm.

**Phạm vi / ngoài phạm vi:** UI P1; không tái đấu/Replay/undo; mock chỉ để dựng, không bằng chứng tích hợp.

**Đầu vào cần có:** Bàn cờ của TC và kiểu sự kiện shared; dữ liệu kiểm theo AC và docs/08. Đầu vào mới bắt buộc: TC-09: tương tác kéo thả dùng cùng tọa độ/nước hợp lệ với click, thả sai trượt về.

**Cách làm gợi ý:**

1. Dựng năm trạng thái và quyền PLAYER/SPECTATOR.
2. Gắn chờ ack, lỗi nước và đồng hồ hiển thị theo snapshot.
3. Đầu hàng focus Huỷ; hòa không giữ focus, thu gọn không từ chối.
4. Ghép kéo thả TC-09 vào cùng adapter ý định nước của click; kiểm thả sai, chờ ack và phản hồi lỗi trên cả hai góc bàn.

**Kiểm thử:** Playwright thành phần và kiểm bàn phím. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Ack | Gửi nước, trì hoãn rồi từ chối ack | Mờ lúc chờ; sai về chỗ cũ |
| Ca 2 | Giờ | Hiện 30 giây rồi thấp hơn | Cảnh báo dưới ngưỡng có chữ/biểu tượng |
| Ca 3 | Hòa | Esc/X rồi mở lại trong thời hạn | Hạn vẫn chạy, không gửi từ chối |
| Ca 4 | Kết quả/quyền | Kết thúc ván và vào vai người xem | Chỉ đọc; chỉ Rời phòng, không nút P2 |
| Ca 5 | Kéo thả | Kéo/thả hợp lệ và sai, trì hoãn ack; lặp trên bàn lật Đen | Đúng tọa độ; sai trượt về; cùng trạng thái chờ như click |

**PASS khi:** Mọi ca UI đạt và đủ năm trạng thái áp dụng; không báo luồng online đã chạy trước TD-09/10. Sai ca bắt buộc: FAIL; chưa kiểm/thiếu điều kiện: NOT_RUN/BLOCKED.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** Trung tính INTERRUPTED còn chờ PO. TC-09 đã là tiền đề; không tuyên bố UI tích hợp mạng thật trước TD-09/10.

### TD-09 — Tích hợp nước đi: đi nước, đồng bộ thế cờ hai trình duyệt (web ↔ máy chủ)
**Epic:** ED · **Thành phần:** Frontend, Realtime · **Sprint đề xuất:** 2 (08/10–10/10) · **Bắt đầu khi (is blocked by):** `TD-02`, `TD-08`, `TB-10`
**Bắt đầu khi (kết quả cần có):** TD-02: match.move/match.state thực cùng ghi DB; TD-08: UI ván và adapter ack/snapshot; TB-10: hai người tạo/vào phòng và bắt đầu ván thật.

**Mục tiêu:** Nối giao diện TD-08 với xử lý nước TD-02 qua phòng thật. Hai trình duyệt phải nhìn cùng một ván và cùng phiên bản sau từng nước.

**Yêu cầu / nguồn:** US-PLAY-01: AC-PLAY-01-01 — đúng quyền và đồng bộ; AC-PLAY-01-02 — nước sai trở về; AC-PLAY-01-03 — chống trùng/cũ; AC-PLAY-01-04 — mờ chờ xác nhận. Nguồn bổ sung: docs/04 §4; docs/07 §3; docs/08 nhóm D.

**Kết quả (đầu ra):** Adapter hai chiều chạy thật; kịch bản hai trình duyệt với DB và nhật ký lệnh.

**Phạm vi / ngoài phạm vi:** Lát nước đi P1; chưa thay nghiệm thu đồng hồ/kết thúc ở TD-10.

**Đầu vào cần có:** Cặp nối rõ: adapter bàn cờ/ack của TD-08 ↔ match.move/match.state của TD-02, từ Match ID TB-10.

**Cách làm gợi ý:**

1. Đi qua đăng nhập/phòng tới ván, không ghép hai mock.
2. Kiểm tọa độ khi Đen lật bàn và version trên cả hai client.
3. Gây mất ack, sai nước và phiên bản cũ rồi đối chiếu DB/snapshot.

**Kiểm thử:** Playwright hai trình duyệt và Vitest tích hợp. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Nước thật | Hai người luân phiên click/kéo | Cùng thế/lượt/nước cuối sau ack |
| Ca 2 | Cạnh tranh | Gửi trùng khi mất ack | Chỉ một nước trong DB |
| Ca 3 | Sai | Gửi nước sai hoặc version cũ | Thông báo đúng, thế trở lại máy chủ |
| Ca 4 | Quyền | Tab chỉ đọc/người ngoài gửi lệnh | Không thay ván |

**PASS khi:** Mọi ca đạt trên máy chủ/DB thật; một nguồn thế cờ, không divergence sau đồng bộ. Sai ca bắt buộc: FAIL; chưa kiểm/thiếu điều kiện: NOT_RUN/BLOCKED.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** NFR-01 cần người xem và phép đo chung ở TQ-02; không dùng độ trễ mạng cloud thay phép đo LAN.

### TD-10 — Tích hợp đồng hồ, kết thúc ván, đầu hàng, xin hoà (web ↔ máy chủ)
**Epic:** ED · **Thành phần:** Frontend, Realtime · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `TD-03`, `TD-04`, `TD-09`
**Bắt đầu khi (kết quả cần có):** TD-03: clock thật, khởi động bên Đỏ, TIMEOUT và hook đóng băng/hồi phục; TD-04: kết thúc một lần, đầu hàng/vòng đời xin hòa; TD-09: đường hai trình duyệt vào ván/đi nước thật, gồm TB-10 và TB-04 trong tổ tiên.

**Mục tiêu:** Nối đồng hồ và các cách kết thúc vào ván đã đi nước thật. Kết quả cuối trên hai máy khách phải thống nhất với máy chủ.

**Yêu cầu / nguồn:** US-ROOM-03: AC-ROOM-03-02 — hai người Sẵn sàng, đếm 3…2…1 có âm thanh gỗ, tạo ván/chuyển SCR-GAME-ROOM và clock Đỏ chạy; AC-ROOM-03-03 — bỏ Ready hủy đếm. US-PLAY-02..05: AC-PLAY-02-02 — TIMEOUT trước nước; AC-PLAY-03-03 — ngừng nước sau kết thúc; AC-PLAY-04-01 — xác nhận đầu hàng; AC-PLAY-05-02 — đồng ý hòa hoặc tiếp tục. docs/02 §3.4; docs/07 §6; docs/08 nhóm B/D.

**Kết quả (đầu ra):** Luồng web ↔ giờ/kết quả/đề nghị; E2E chơi đến từng kết quả và kiểm DB.

**Phạm vi / ngoài phạm vi:** CASUAL P1, không điều kiện xin hòa RANKED và không tái đấu.

**Đầu vào cần có:** Phòng chờ/Ready/bắt đầu thật TB-10/04 qua TD-09 ↔ clock TD-03; UI đồng hồ/nút/kết quả TD-08 qua TD-09 ↔ offer/respond/ended TD-04. Ca khởi đầu nhận từ TB-04/TB-10 để nghiệm thu đủ AC, không chỉ kiểm mốc giờ.

**Cách làm gợi ý:**

1. Cập nhật giờ và ended theo sự kiện server.
2. Nối xác nhận đầu hàng, rút/thu gọn/trả lời hòa.
3. Đối chiếu timer và đề nghị khi nước đi kết thúc ván cùng lúc.

**Kiểm thử:** Playwright hai client, Vitest timer. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | TIMEOUT | Đợi hết giờ rồi gửi nước | Cùng kết quả thua, nước muộn không lưu |
| Ca 2 | Đầu hàng | Huỷ rồi đồng ý xác nhận | Huỷ không tác động; đồng ý cùng kết quả |
| Ca 3 | Hòa | Đồng ý/từ chối/hết hạn/rút, kiểm chờ 5 nước | Đúng trạng thái và tooltip |
| Ca 4 | Tranh chấp | Trả lời hòa sau chiếu hết | Không ghi đè kết quả |
| Ca 5 | AC-ROOM-03-02 toàn luồng | Hai người vào phòng, cùng Ready; theo dõi 3…2…1, âm gỗ, chuyển màn và giờ | Một Match ID/thế đầu, hai UI cùng SCR-GAME-ROOM; clock thật chỉ Đỏ chạy trước nước đầu, Đen chưa giảm |
| Ca 6 | Hủy đếm | Một bên bỏ Ready trước hết đếm, rồi Ready lại | Đếm cũ dừng, không tạo ván/clock ma; đợt hợp lệ chỉ tạo một ván và một clock Đỏ |
| Ca 7 | Clock và lỗi ghi | Gây lỗi DB theo TD-01 qua luồng thật, hồi phục trong hạn | Server đóng băng cả hai clock, UI theo snapshot hợp lệ, không mất giờ vì lỗi ghi; không coi mất ACK là nước mới |

**PASS khi:** Mọi ca đã duyệt gồm AC-ROOM-03-02 đầy đủ đạt với phòng/clock/hai trình duyệt thật; DB và UI cùng kết quả, giờ dừng sau kết thúc. FAIL nếu chỉ mốc khởi tạo/fixture mà nhận clock đạt, âm/đếm/chuyển màn sai, nước sau hết giờ được lưu hoặc timer cũ tạo ván lần hai. Nhánh trình bày INTERRUPTED chưa duyệt ghi riêng.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** Mạng trễ không được dùng để kéo dài hạn hòa hoặc hồi sinh ván; nhánh INTERRUPTED trung tính chờ PO.

---

### TD-11 — Tích hợp ván nâng cao: mất kết nối, kết nối lại, người xem, bảng nước đi (web ↔ máy chủ)
**Epic:** ED · **Thành phần:** Frontend, Realtime · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `TD-05`, `TD-06`, `TD-07`, `TD-10`, `TB-11`
**Bắt đầu khi (kết quả cần có):** TD-05: runtime ngắt/nối, ân hạn theo vai và restart; TD-06: snapshot người xem lọc quyền; TD-07: ký hiệu/bảng nước; TD-10: clock/kết thúc web thật; TB-11: UI/API đổi vai/khóa/kick/rời phòng đã tích hợp, bao gồm policy/mã/link TB-06 và giữ trạng thái khóa.

**Mục tiêu:** Hoàn thiện tích hợp mất kết nối, theo dõi và danh sách nước của ED. Kiểm quyền và khả năng phục hồi trên ván đã kết thúc hoặc đang chơi.

**Yêu cầu / nguồn:** US-PLAY-06..10: AC-PLAY-07-01 — overlay/ân hạn theo vai; AC-PLAY-07-02 — snapshot đủ; AC-PLAY-09-01 — người xem chỉ đọc; AC-PLAY-10-01 — bảng nước. US-ROOM-07: AC-ROOM-07-02 — giữ người cũ/chặn người mới khi LOCKED; AC-ROOM-07-03 — reconnect giữ tư cách trong hạn; AC-ROOM-07-05 — mất ghế không tự mở khóa. BA 8.3/2.8; docs/07 §5; docs/08 nhóm B/D.

**Kết quả (đầu ra):** Overlay theo vai, nối lại toàn trạng thái, bảng nước/người xem trong UI thật; E2E mất mạng.

**Phạm vi / ngoài phạm vi:** P1 tối đa 2 người xem, không Replay hay công cụ giả lập mạng trong sản phẩm P2.

**Đầu vào cần có:** Overlay/bảng nước/người xem web ↔ sync/timer TD-05, snapshot TD-06, notation TD-07; TB-11/TB-06 cung cấp thao tác LOCKED/membership/mã hiện hành. Task nối policy giữ chỗ của TB-06 với runtime ân hạn TD-05, không còn chỉ kiểm hai phần bằng fixture.

**Cách làm gợi ý:**

1. Gắn overlay không đóng bằng Esc với timer server.
2. Nối snapshot đầy đủ và xóa dữ liệu đã mất quyền.
3. Kiểm rời, reconnect sau kết thúc, người xem và hai người cùng rớt.
4. Dùng UI/API phòng nâng cao TB-11 để đổi ghế, đuổi và chuyển riêng tư trong các ca phục hồi; đối chiếu quyền nhận snapshot trước/sau.

**Kiểm thử:** Playwright nhiều client, thao tác mạng thử và restart. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Reconnect | Rớt rồi về trước hạn | Đúng thế/giờ/phiên bản, overlay tự tắt |
| Ca 2 | Hết hạn | Đang đấu/WAITING/FINISHED/người xem quá hạn | Đúng thua hoặc mất ghế/chỗ, không áp nhầm |
| Ca 3 | Người xem | Đi nước, kết thúc, đuổi người xem | Bảng đồng bộ; sau đuổi không dữ liệu mới |
| Ca 4 | Restart | Restart giữa ván | INTERRUPTED; nhánh trình bày chờ PO ghi riêng |
| Ca 5 | Phòng nâng cao | Đuổi người xem qua TB-11 rồi dùng kết nối cũ xin sync; LOCKED reconnect thành viên cũ trong hạn | Người bị đuổi không nhận mới; người cũ hợp lệ được phục hồi |
| Ca 6 | AC-ROOM-07-03 — ghế LOCKED | Khóa phòng đủ hai ghế; ngắt socket người có ghế ở WAITING/PLAYING/FINISHED và nối lại trước/sau hạn 60 giây | Trong hạn giữ tư cách/snapshot; quá hạn coi người mới, không vượt khóa. PLAYING phân xử thua theo timer, WAITING/FINISHED chỉ mất ghế |
| Ca 7 | AC-ROOM-07-03 — xem LOCKED | Người xem hiện tại ngắt/nối trước/sau 5 phút; đối chiếu một người mới dùng link/mã | Trong hạn người cũ phục hồi; quá hạn/người mới không vào được bằng mã/link |
| Ca 8 | Khóa không tự mở | Khóa rồi một ghế rời; thành viên còn quyền reconnect, người mới thử join | Phòng vẫn LOCKED; không biến người mới thành thành viên cũ hay tự mở vì thiếu ghế |

**PASS khi:** Mọi ca đã duyệt đạt trên phòng/policy LOCKED/runtime thật; trước/sau hạn xử đúng vai, không rò snapshot và không lệnh cũ hồi sinh ván. FAIL nếu fixture thay reconnect toàn luồng, quá hạn vẫn vượt khóa, khóa đuổi người hiện tại hoặc tự mở khi mất ghế. UI trung tính/trạng thái phòng sau restart còn chờ quyết định không được tự chọn.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** TB-11 đã là tiền đề. Nhánh trạng thái phòng sau restart và UI trung tính còn chờ PO; không tự chọn CLOSED/FINISHED khác nguồn.

---
