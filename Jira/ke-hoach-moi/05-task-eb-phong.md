# Kế hoạch mới (bản nháp) — 05: Task của Epic EB — Phòng, mời, ghế, người xem

**Ngày:** 2026-10-04 · **Trạng thái:** ĐỀ XUẤT, chờ PO và nhóm duyệt · Chưa tạo gì trên Jira. Khung, phụ thuộc và Sprint: `01-components-epic-khung-task.md`; Description Epic: `02-epic.md`.

Epic gồm **12 task**. Mỗi task: dòng đầu (Epic, thành phần, Sprint, **is blocked by**) lấy từ khung; **Bắt đầu khi (kết quả cần có)** nêu hiện vật cụ thể của từng tiền đề. Chưa có ước lượng giờ và người nhận việc (nhóm điền khi Sprint Planning).

### TB-01 — Máy chủ: máy trạng thái phòng, một vị trí chơi mỗi người
**Epic:** EB · **Thành phần:** Room Management · **Sprint đề xuất:** 1 (04/10–07/10) · **Bắt đầu khi (is blocked by):** `T0-11`, `T0-04`
**Bắt đầu khi (kết quả cần có):** T0-11: gateway định danh và dispatch theo shared; T0-04: rooms/participants/matches và ràng buộc ghế

**Mục tiêu:** Tạo máy trạng thái phòng CASUAL và sổ vị trí chơi dùng chung theo danh tính. Cơ chế bảo vệ ghế và ván AI không bị chiếm đồng thời khi các yêu cầu cạnh tranh.

**Yêu cầu / nguồn:** docs/04 §4.2/§5, docs/07 §5; US-ROOM-01, AC-ROOM-01-03 cấm tạo khi đã có vị trí; US-ROOM-02, AC-ROOM-02-03 thay người reset Ready; BA 1.8/2.3/2.8.

**Kết quả (đầu ra):**
- Mô hình WAITING/PLAYING/FINISHED/CLOSED, trạng thái riêng tư tách biệt.
- Sổ vị trí chơi ROOM/AI và thao tác xin/trả có khóa người dùng; interface cập nhật phòng tuần tự.

**Phạm vi / ngoài phạm vi:** Không RANKED/matchmaking/Guest; không tự quyết nhánh restart PLAYING→FINISHED còn chờ PO.

**Đầu vào cần có:** Contract room/role/match từ shared; điều kiện Host luôn ngồi ghế và client không tự chọn danh tính.

**Cách làm gợi ý:**
1. Tách state phòng, riêng tư, ghế và state ván.
2. Thiết lập thứ tự khóa logic danh tính/phòng không giữ khóa DB qua dịch vụ ngoài.
3. Kiểm rollback xin chỗ khi thao tác sau thất bại, đóng phòng không hồi sinh.

**Kiểm thử:** Vitest đơn vị và tích hợp đồng thời.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-X-12 | AC-ROOM-01-03 | Cùng user tranh chỗ ROOM/AI qua interface sổ | Chỉ một vị trí, thất bại không để chỗ ma. |
| TC-ROOM-02-03 | AC-ROOM-02-03 | Đổi thành phần người ngồi ghế | Ready reset đúng cả hai. |
| Phòng đóng | docs/07 §5 | Gửi lệnh trễ vào CLOSED | Không mở lại hoặc cấp dữ liệu trái quyền. |
| Giả danh | NFR-04 | Client khai user_id khác phiên | Không chiếm vị trí cho người khác. |

**PASS khi:** Mọi chuyển trạng thái/khóa thử đạt, không chỗ ma hoặc ghế trùng. FAIL nếu ràng buộc DB phòng được coi đủ cho AI bộ nhớ.

**Bằng chứng nộp:** Build/commit, môi trường, đồ thị state, log tranh chấp và kết quả ràng buộc; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** Bài sổ ROOM/AI là kiểm interface; TC-X-12 E2E cần TG-02 sau này. Quyền tài khoản hoàn tất còn phụ thuộc guard chưa đủ cạnh khung.

### TB-02 — Máy chủ: tạo phòng, mã 8 ký tự, link mời, mức giờ, riêng tư, người xem
**Epic:** EB · **Thành phần:** Room Management · **Sprint đề xuất:** 2 (08/10–10/10) · **Bắt đầu khi (is blocked by):** `TB-01`, `T0-13`, `T0-14`, `T0-15`
**Bắt đầu khi (kết quả cần có):** TB-01: state phòng WAITING và sổ xin/trả vị trí có khóa; T0-13: primitive biên lai theo danh tính/commandId, retry và ghi-phát nhất quán dùng cho room.create; T0-14: hàm phát hiện từ cấm dùng chung và danh sách nhóm cung cấp, chế độ từ chối tên; T0-15: limiter tạo phòng theo tài khoản, baseline 5 lần trong 10 phút

**Mục tiêu:** Tạo phòng P1 với Host ghế Đỏ và thông tin mời. Gửi lại không tạo thêm phòng hoặc mất kết quả cũ.

**Yêu cầu / nguồn:** US-ROOM-01: AC-ROOM-01-01 tên 1–60/lọc, giờ 5/10/15 mặc định 10, PUBLIC/CODE_ONLY, người xem 0–2 mặc định 2; AC-ROOM-01-02 mã tám ký tự/Host Đỏ; AC-ROOM-01-03 một vị trí; AC-ROOM-01-04 giờ/sức chứa bất biến. US-ROOM-04: AC-ROOM-04-01 chỉ người ngồi ghế chia sẻ cùng quyền; docs/07 §5.

**Kết quả (đầu ra):** - Handler room.create và phản hồi phòng/membership/Host.
- Mã chuẩn tám ký tự unique, link hiện hành và kiểm quyền đọc thông tin mời.

**Phạm vi / ngoài phạm vi:** Không QR, RANKED, giờ không giới hạn; thu hồi link khi khóa ở TB-06 phối hợp AC-ROOM-04-03, không sinh link riêng xem/chơi.

**Đầu vào cần có:** TB-01: state/sổ vị trí; T0-13: tra biên lai và transaction; T0-14: lọc tên; T0-15: hạn tạo phòng 5 lần/10 phút/người. Không dùng dữ liệu client để chọn danh tính.

**Cách làm gợi ý:** 1. Xác thực danh tính, đọc commandId rồi tra biên lai T0-13 trước kiểm vị trí/quyền biến đổi.
2. Có biên lai: trả kết quả cũ, không tạo lại; dữ liệu đọc vẫn lọc theo quyền hiện tại.
3. Chỉ lệnh mới kiểm T0-15, input/quyền/vị trí và T0-14.
4. Ghi phòng/Host/mã unique cùng biên lai rồi ACK/phát sau commit.

**Kiểm thử:** Vitest handler/DB với thời gian điều khiển. Trạng thái: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Tạo P1 | AC-ROOM-01-01/02 | Kiểm mặc định, biên tên/giờ/N, tên cấm và LOCKED lúc tạo | Chỉ cấu hình hợp lệ tạo phòng/mã tám ký tự, Host Đỏ. |
| Mất ACK | docs/07 §3 | Tạo xong đã có ghế, mất ACK rồi retry cùng commandId | Trả kết quả tạo đã lưu, cùng phòng; không báo đang có vị trí như lệnh mới. |
| Lệnh mới | AC-ROOM-01-03 | Đang có ghế/AI gửi commandId mới | Từ chối, không phòng ma. |
| Giới hạn | docs/04 §9 | Tạo/rời theo fixture hợp lệ, thử lần 5/6 trong 10 phút và sau cửa sổ | Tối đa 5; vượt bị chặn; sau hạn xét lại luật phòng. |
| Quyền/ghi lỗi | AC-ROOM-04-01; NFR-04 | Người ngoài xin link; gây lỗi commit | Không dữ liệu trái quyền, không ACK thành công giả. |

**PASS khi:** Mọi ca trên đạt; retry nhận kết quả cũ dù đã chiếm ghế, không bị từ chối như create mới. FAIL nếu sai thứ tự, tạo trùng, sai hạn mức hoặc phát trước ghi.

**Bằng chứng nộp:** Revision/build và môi trường; request/ACK đã che link token, dữ liệu trước/sau và test cạnh tranh. Không chứa bí mật.

**Rủi ro / chưa rõ:** TB-06/TB-11 kiểm thu hồi mã/link AC-ROOM-04-03. Lọc dữ liệu biên lai theo docs/07 §3 còn chờ quyết định, không cho phép lộ dữ liệu.

---

### TB-03 — Máy chủ: vào phòng bằng mã/link/Sảnh, xếp ghế hoặc người xem, sức chứa
**Epic:** EB · **Thành phần:** Room Management · **Sprint đề xuất:** 2 (08/10–10/10) · **Bắt đầu khi (is blocked by):** `TB-02`, `T0-13`, `T0-15`
**Bắt đầu khi (kết quả cần có):** TB-02: phòng WAITING, mã/link hiện hành, cấu hình sức chứa và membership Host; T0-13: primitive nhận diện lệnh lặp theo danh tính/commandId và trả kết quả không tái thi hành; T0-15: limiter mã phòng sai theo phiên: 10 lần/phút, chặn 5 phút

**Mục tiêu:** Kiểm quyền tham gia và xếp người vào ghế hoặc Người xem đúng nguồn vào. Mọi quyết định được thực hiện khi nhận lệnh, không coi link là vé giữ ghế.

**Yêu cầu / nguồn:** US-ROOM-05: AC-ROOM-05-01 link/mã ưu tiên ghế rồi xem nếu còn chỗ; AC-ROOM-05-02 đầy thì từ chối; AC-ROOM-05-03 Sảnh luôn Người xem; AC-ROOM-05-04 chặn bị đuổi/LOCKED. BA 2.8; docs/07 §5.

**Kết quả (đầu ra):** - Handler room.join cho code/inviteToken/roomId từ Sảnh.
- Membership/seat_since/joined_at và snapshot lọc quyền hoặc nguyên nhân truy cập bị từ chối.

**Phạm vi / ngoài phạm vi:** Không tự xuống ghế từ vai xem, không P2 Guest/QR; không sửa mã sai thành mã phòng khác.

**Đầu vào cần có:** TB-02: phòng/mã/link và Host; T0-13: biên lai join; T0-15: limiter mã sai. Membership/quyền dùng fixture có nguồn cho handler chưa có như kick/khóa.

**Cách làm gợi ý:** 1. Xác thực và tra biên lai theo danh tính/commandId; retry không chiếm chỗ lại.
2. Lệnh mới kiểm khóa mã sai T0-15, định dạng/mã đúng contract; ghi lần sai theo phiên.
3. Kiểm quyền/sức chứa/vị trí dưới khóa rồi ghi vai theo nguồn vào.
4. Trả ACK hoặc lỗi không lộ dữ liệu; không tự sửa mã sai thành mã khác.

**Kiểm thử:** Vitest tích hợp cạnh tranh và quyền. Trạng thái kế hoạch: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-ROOM-05-01 | AC-ROOM-05-01 | Vào link/mã khi còn ghế, rồi khi ghế kín còn xem | Vào đúng ghế hoặc Người xem có thông báo. |
| TC-ROOM-05-02 | AC-ROOM-05-02 | Thử N=0/phòng đầy và tranh chỗ cuối | Không vượt trần, phía không được chỗ nhận lỗi thật. |
| TC-ROOM-05-03 | AC-ROOM-05-03 | Vào từ Sảnh lúc còn ghế | Vẫn Người xem. |
| TC-ROOM-05-04 | AC-ROOM-05-04 | Người bị kick/khóa/link thu hồi vào | Không cấp membership hoặc snapshot ngoài quyền. |
| Retry join | docs/07 §3 | Mất ACK, gửi lại cùng user/commandId khi ghế đã kín; sau đó thử mất quyền | Không membership mới; không trả dữ liệu ngoài quyền. |
| Mã sai | docs/04 §9 | Nhập sai tới lần 10 trong một phút; thử trước/sau 5 phút chặn | Chặn theo phiên; phiên khác không dùng lẫn bộ đếm; hết chặn xét lại mã/quyền. |

**PASS khi:** Mọi ca handler với dữ liệu/fixture đã ghi rõ đạt, gồm limiter thật T0-15. FAIL nếu vượt sức chứa, sai vai, sai hạn hoặc retry thêm membership. Chưa nghiệm thu runtime khóa/kick/reconnect đầy đủ.

**Bằng chứng nộp:** Revision/build và môi trường; ma trận nguồn vào/role, log đã che và trạng thái membership trước/sau. Không chứa bí mật.

**Rủi ro / chưa rõ:** Khóa/kick ở đây là fixture state: runtime thật giao TB-11/TA-12 sau TB-06/07; reconnect đầy đủ giao TD-05/11. Lọc biên lai theo quyền còn chờ quyết định, không thi hành lại lệnh cũ.

---

### TB-04 — Máy chủ: ghế, Sẵn sàng, đếm 3 giây, bắt đầu ván
**Epic:** EB · **Thành phần:** Room Management · **Sprint đề xuất:** 2 (08/10–10/10) · **Bắt đầu khi (is blocked by):** `TB-03`, `TC-01`
**Bắt đầu khi (kết quả cần có):** TB-03: membership hợp lệ, ghế trống/đầy và dữ liệu phòng có thẩm quyền; TC-01: mô hình thế cờ, tọa độ gốc và hàm khởi tạo đúng quân/lượt Đỏ

**Mục tiêu:** Chỉ khởi tạo ván khi hai người vẫn đủ điều kiện sau đếm ngược. EB bàn giao Match ID/thế/mốc giờ, không ván ma.

**Yêu cầu / nguồn:** US-ROOM-02: AC-ROOM-02-01 Host một mình đổi Đỏ/Đen, AC-ROOM-02-02 người thứ hai vào ghế trống, AC-ROOM-02-03 đổi người reset Ready. US-ROOM-03: AC-ROOM-03-01 bật/tắt Ready, AC-ROOM-03-02 đếm 3 giây/tạo ván/đồng hồ Đỏ, AC-ROOM-03-03 hủy đếm.

**Kết quả (đầu ra):** - Handler ghế/Ready và đếm 3 giây, hủy timer cũ khi điều kiện đổi.
- Khởi tạo một Match ID, thế TC-01, hai ghế, lượt Đỏ, mức giờ và thời điểm bắt đầu do server ghi; room PLAYING.

**Phạm vi / ngoài phạm vi:** P1 chỉ khởi tạo ván/mốc giờ, chưa chạy đồng hồ hoặc xử nước/TIMEOUT. Không Xin đổi bên/Tái đấu, không lấy giờ client làm chuẩn.

**Đầu vào cần có:** TB-03: membership/ghế có thẩm quyền; TC-01: hàm thế đầu và tọa độ chuẩn. Contract Match ID/mốc thời gian server dùng shared, không tạo thế riêng tại room handler.

**Cách làm gợi ý:** 1. Kiểm quyền Host đổi ghế và hai Ready từ TB-03.
2. Đếm 3 giây, hủy nếu điều kiện đổi; kiểm lại dưới khóa khi tới hạn.
3. Tạo một ván từ TC-01, ghi trước phát, bàn giao mốc giờ/lượt Đỏ; không dùng thời gian client.

**Kiểm thử:** Vitest timer đếm ngược và tích hợp handler phòng; không clock ván thật. Trạng thái: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ghế/Ready | AC-ROOM-02-01/03 | Host một mình đổi ghế; thay người ngồi và bật Ready | Ghế đúng; thay thành phần reset Ready. |
| Khởi tạo | AC-ROOM-03-02 — phần mốc | Hai Ready đủ 3 giây, so dữ liệu với TC-01 | Một Match ID/thế đầu/lượt Đỏ/mức giờ/mốc bắt đầu; không yêu cầu giờ giảm. |
| Hủy/trùng | AC-ROOM-03-03 | Bỏ Ready/rời ngay trước hạn, gọi callback cũ/lặp | Không ván ma hoặc Match ID thứ hai. |
| Quyền/ghi lỗi | docs/07 §3 | Người xem Ready hoặc lỗi ghi khởi tạo | Từ chối/rollback, không phát bắt đầu giả. |

**PASS khi:** Mọi ca khởi tạo/ghế/đếm đạt với handler thật. FAIL nếu ván trùng, sai thế/lượt/mốc hoặc phát khi ghi lỗi. Không chờ TD-03; chưa nghiệm thu đầy đủ AC-ROOM-03-02.

**Bằng chứng nộp:** Revision/build và môi trường; timeline server, Match ID, report timer/ghi lỗi và snapshot. Không chứa bí mật.

**Rủi ro / chưa rõ:** TD-03 nhận mốc qua TD-01/02 để chạy clock; TD-10 nối UI nghiệm thu phần giờ của AC-ROOM-03-02. Tín hiệu bắt đầu chưa chứng minh clock chạy.

---

### TB-05 — Máy chủ: đổi chỗ ghế ↔ người xem, mời xuống ghế
**Epic:** EB · **Thành phần:** Room Management · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `TB-04`
**Bắt đầu khi (kết quả cần có):** TB-04: ghế/Ready/vòng đời bắt đầu ván và hủy timer khi đổi thành phần

**Mục tiêu:** Đổi thành phần ghế/Người xem theo quyền và sức chứa phòng. Mỗi lần đổi phải reset Ready và thông báo thay quyền để không tiếp tục truy cập dữ liệu cũ.

**Yêu cầu / nguồn:** US-ROOM-06: AC-ROOM-06-01 chỉ WAITING/FINISHED, AC-ROOM-06-02 tự xuống xem phải còn chỗ, AC-ROOM-06-03 Host chuyển đối thủ/mời xem xuống ghế, AC-ROOM-06-04 xem không tự ngồi/Host không tự xuống, AC-ROOM-06-05 về WAITING/reset; BA 2.8.

**Kết quả (đầu ra):**
- Handler đổi vai/mời xuống ghế có kiểm điều kiện trong khóa.
- Membership mới, seat_since/Ready cập nhật và tín hiệu quyền cho chat/media.

**Phạm vi / ngoài phạm vi:** Không đổi vai khi PLAYING, không hoán đổi trực tiếp hoặc Xin đổi bên P2; không tự cho Host thành Người xem.

**Đầu vào cần có:** Sổ vị trí, N và quyền Host; interface nhận đổi quyền cho chat/media, phần Cloud thật ở EE.

**Cách làm gợi ý:**
1. Kiểm người gọi/mục tiêu/state và còn chỗ đích.
2. Chuyển vai cùng cập nhật sổ vị trí, seat_since và Ready.
3. Phát snapshot sau commit và thông tin thu/cấp quyền mới.

**Kiểm thử:** Vitest tích hợp quyền/đồng thời.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-ROOM-06-02 | AC-ROOM-06-02 | Người chơi xuống xem ở N=0/đầy/còn chỗ | Chỉ trường hợp còn chỗ được nhận. |
| TC-ROOM-06-03 | AC-ROOM-06-03 | Host mời xem xuống ghế trống rồi thử ghế kín | Đúng quyền/chỗ; không chiếm ghế người khác. |
| TC-ROOM-06-04 | AC-ROOM-06-04 | Host tự xuống hoặc xem tự ngồi | Từ chối ở server. |
| TC-ROOM-06-05 | AC-ROOM-06-05 | Đổi thành phần FINISHED, gửi lặp/đồng thời | WAITING, reset hai Ready; không vượt trần. |

**PASS khi:** Toàn ca state/quyền đạt, không membership/sổ vị trí sai. FAIL nếu PLAYING vẫn đổi hoặc chỉ ẩn nút; tích hợp media phải được kiểm thêm trước Done hành trình.

**Bằng chứng nộp:** Build/commit, môi trường, snapshot trước/sau, log quyền/seat_since và report cạnh tranh; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** TC-X-17 cần chat/media thật; hiện chỉ chứng minh interface thông báo, không tuyên bố đã thu track khi EE chưa có.

### TB-06 — Máy chủ: riêng tư LOCKED/CODE_ONLY/PUBLIC và danh sách phòng công khai
**Epic:** EB · **Thành phần:** Room Management · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `TB-03`
**Bắt đầu khi (kết quả cần có):** TB-03: join kiểm role/quyền, link hiện hành và membership

**Mục tiêu:** Thực thi riêng tư phòng và cung cấp danh sách công khai theo trạng thái thật. Khóa chặn người mới nhưng không đuổi người đang có tư cách hợp lệ.

**Yêu cầu / nguồn:** US-ROOM-07: AC-ROOM-07-01 chỉ Host/đủ ghế mới bật khóa, AC-ROOM-07-02 ẩn Sảnh/chặn mới/giữ cũ, AC-ROOM-07-03 reconnect trong hạn, AC-ROOM-07-04 CODE_ONLY không Sảnh, AC-ROOM-07-05 thiếu ghế vẫn khóa, AC-ROOM-07-06 nội dung xác nhận UI. US-ROOM-08: AC-ROOM-08-01 PUBLIC WAITING/PLAYING, AC-ROOM-08-02 mới nhất/tối đa 50; AC-ROOM-04-03 thu mã/link.

**Kết quả (đầu ra):** - Handler riêng tư/thu hồi mã-link và danh sách PUBLIC tối đa 50 mới nhất.
- Policy phân biệt join mới với tư cách còn hạn giữ chỗ, contract đầu vào thời gian cho reconnect.

**Phạm vi / ngoài phạm vi:** Không mở RANKED/P2; không thu token của người hiện tại chỉ vì LOCKED; UI confirm ở tích hợp.

**Đầu vào cần có:** TB-03: membership/join/mã hiện hành; task tự xuất policy nhận danh tính, mốc giữ chỗ, thời điểm kiểm. Mốc 60 giây/5 phút dùng fixture, không cần runtime TD-05.

**Cách làm gợi ý:** 1. Kiểm Host/đủ hai ghế khi bật khóa; giữ member hiện tại.
2. Khóa làm lời mời chưa dùng vô hiệu; mở lại sinh mã/link mới.
3. Lọc danh sách; kiểm policy giữ chỗ bằng mốc fixture, không mở socket reconnect thật.

**Kiểm thử:** Vitest handler/DB và policy thời gian bằng fixture. Trạng thái: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Khóa | AC-ROOM-07-01/02 | Non-Host hoặc thiếu ghế bật khóa; Host đủ ghế khóa | Sai bị chặn; đúng ẩn Sảnh, không loại member. |
| Giữ khóa/mã | AC-ROOM-07-05; AC-ROOM-04-03 | Đổi fixture còn một ghế; mở lại và dùng mã cũ | Không tự mở; mã cũ vô hiệu, mã mới đúng quyền. |
| Giữ chỗ | AC-ROOM-07-03 — policy | Mốc fixture trước/sau 60 giây người chơi, 5 phút người xem | Trong hạn coi member cũ; quá hạn xét như người mới. |
| Danh sách | AC-ROOM-08-01/02 | Dữ liệu vượt 50 và có CODE_ONLY/LOCKED/CLOSED | Chỉ PUBLIC WAITING/PLAYING, tối đa 50 mới nhất. |

**PASS khi:** Mọi ca handler/policy fixture đạt; FAIL nếu lộ phòng kín, hồi sinh mã cũ hoặc khóa đuổi member. Không cần TD-05 để PASS; chưa nghiệm thu AC-ROOM-07-03 runtime.

**Bằng chứng nộp:** Build/commit, môi trường, danh sách trước/sau, phiên mã đã che, report quyền/reconnect; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** TD-05 nối mốc mất mạng/timer thật; TD-11 dùng TB-11 để kiểm LOCKED reconnect trong hạn. Cách hiểu tại đúng mốc hết hạn cần thống nhất contract thời gian, không tự thêm gia hạn.

---

### TB-07 — Máy chủ: đuổi người xem, Host rời/chuyển quyền/đóng phòng, quay về phòng chờ
**Epic:** EB · **Thành phần:** Room Management · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `TB-05`, `TB-06`
**Bắt đầu khi (kết quả cần có):** TB-05: đổi vai/reset Ready và sổ vị trí nhất quán; TB-06: chế độ riêng tư, mã/link và giữ khóa khi thiếu ghế

**Mục tiêu:** Xử lý kick, Host và vòng đời phòng CASUAL. Bàn giao thay đổi quyền/hook, không nhận kết quả liên miền bằng fixture.

**Yêu cầu / nguồn:** US-ROOM-09: AC-ROOM-09-01 hai người chơi được kick có xác nhận, AC-ROOM-09-02 ngắt/chặn đến đóng, AC-ROOM-09-03 chặn quay lại. US-ROOM-10: AC-ROOM-10-01 chuyển Host, AC-ROOM-10-02 hết ghế đóng, AC-ROOM-10-03 rời PLAYING đầu hàng. US-ROOM-11: AC-ROOM-11-01 hết FINISHED 10 phút, AC-ROOM-11-02 quay WAITING, AC-ROOM-11-03 giữ ghế 60 giây, AC-ROOM-11-04 bắt đầu lại với người mới.

**Kết quả (đầu ra):** - Handler kick/rời/chuyển Host/đóng; room_blocks và vô hiệu timer FINISHED cũ.
- Snapshot quyền phòng, sự kiện/hook thu quyền media/dọn chat và adapter nhận kết quả rời ván; có fixture consumer.

**Phạm vi / ngoài phạm vi:** Phòng CASUAL/hook; không LiveKit/chat cleanup thật. Rời PLAYING dùng adapter kết quả fixture, không tự ghi RESIGN. Restart trung tính chờ quyết định.

**Đầu vào cần có:** TB-05: ghế/Ready/sổ vị trí; TB-06: riêng tư/mã/policy giữ chỗ. Task định nghĩa hook phòng và consumer fixture, không đòi TD-04/05 hoặc TE-01/04 làm tiền đề.

**Cách làm gợi ý:** 1. Kiểm quyền, ghi block rồi ngắt quyền socket phòng; phát sự kiện sau ghi.
2. WAITING/FINISHED xử rời/Host; PLAYING chỉ hoàn tất rời khi adapter kết quả xác nhận, không tự tạo kết quả ván.
3. Đóng/đổi state hủy timer cũ; phát hook CLOSED/đổi quyền cùng danh tính/version.
4. Kiểm consumer fixture nhận hook, không dùng fixture để nhận thu track/dọn chat thật.

**Kiểm thử:** Vitest handler phòng/DB và consumer liên miền fixture. Trạng thái: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Kick/phòng | AC-ROOM-09-02/03 — tầng phòng | Người chơi kick, mục tiêu rejoin; người xem tự gọi kick | Bị kick mất tư cách socket, bị chặn; gọi trái quyền bị từ chối. |
| Host | AC-ROOM-10-01/02 | Host rời WAITING có/không ghế khác | Chuyển Host hoặc CLOSED dù còn xem. |
| PLAYING hook | AC-ROOM-10-03 — contract | Adapter kết quả thử thành công/lỗi/mất ACK | Chỉ sau xác nhận mới chốt rời; không RESIGN thứ hai hoặc báo thành công khi chưa rõ. |
| Timer/hook | AC-ROOM-11-01 | FINISHED→WAITING trước hạn; hoặc giữ FINISHED quá 10 phút | Timer cũ vô hiệu; trường hợp còn FINISHED đóng, consumer fixture nhận CLOSED đúng. |

**PASS khi:** Mọi ca phòng/hook đạt; FAIL nếu quyền phòng còn hiệu lực sau kick, sai Host/timer hoặc tự chốt kết quả ván. Không chờ media/chat/RESIGN runtime; chưa nghiệm thu toàn AC liên miền.

**Bằng chứng nộp:** Build/commit, môi trường, timeline room/match/Host, membership/chặn và test timer/thu quyền; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** TE-04/07 nhận hook thu media; TE-03 nhận CLOSED qua TB-11 kiểm chat; TA-10/TD-11 nối rời-kết quả/reconnect. Các ca đó không chặn PASS TB-07.

---

### TB-08 — Web: Sảnh, hộp thoại tạo phòng, vào bằng mã
**Epic:** EB · **Thành phần:** Frontend · **Sprint đề xuất:** 2 (08/10–10/10) · **Bắt đầu khi (is blocked by):** `T0-10`, `T0-03`, `TH-02`, `TH-01`
**Bắt đầu khi (kết quả cần có):** T0-10: web/router chạy; T0-03: contract tạo/join/danh sách và lỗi P1; TH-02: thanh điều hướng và shell Sảnh có vùng gắn nội dung phòng; TH-01: token, form/nút/modal/thông báo và mẫu năm trạng thái có tooltip

**Mục tiêu:** Dựng Sảnh cùng form tạo/vào phòng theo P1, cho người dùng thấy đúng các lựa chọn hiện hành. UI gửi ý định theo hợp đồng, không tự cấp ghế hay tạo phòng.

**Yêu cầu / nguồn:** US-ROOM-01: AC-ROOM-01-01 form/mặc định, AC-ROOM-01-03 khóa khi có vị trí; US-ROOM-05 theo kết quả join; US-UI-02: AC-UI-02-01 hành động P1/RANKED disabled, AC-UI-02-02 banner quay lại, AC-UI-02-03 Luật chơi; AC-UI-03-01 năm trạng thái.

**Kết quả (đầu ra):**
- SCR-LOBBY, MODAL-CREATE-ROOM và ô mã có adapter.
- Luật chơi thu gọn, trạng thái danh sách/đang tạo/lỗi/quay lại, không điều hướng P2 hoạt động.

**Phạm vi / ngoài phạm vi:** Chỉ nội dung phòng/luật chơi trong shell TH-02; không dựng Sảnh/điều hướng thứ hai. Không QR/ghép ngẫu nhiên/Guest/P2; danh sách thật nối TB-11, setup AI thuộc EG.

**Đầu vào cần có:** T0-10: app/router; T0-03: create/join/list/lỗi; TH-02: shell Sảnh; TH-01: form/modal/token. Giá trị mặc định/mã theo docs/01 và docs/07.

**Cách làm gợi ý:**
1. Gắn nội dung phòng vào TH-02, dùng TH-01 cho form/modal và thông báo.
2. Áp validation/mặc định/trạng thái chờ; giữ dữ liệu nhập không nhạy cảm khi lỗi.
3. Gắn adapter T0-03 và Luật chơi thu gọn; kiểm không lặp điều hướng/shell.

**Kiểm thử:** Playwright với fixture và Vitest form. Trạng thái kế hoạch: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-ROOM-01-01 | AC-ROOM-01-01 | Mở form, đổi giá trị và thử sai biên | Mặc định 10 phút/N=2, chỉ PUBLIC/CODE_ONLY và 5/10/15. |
| TC-UI-02-02 | AC-UI-02-02 | Fixture đang có ghế/ván dở | Banner quay lại, tạo mới disabled có lý do. |
| TC-UI-02-03 | AC-UI-02-03 | Mở/thu Luật chơi bằng bàn phím | Nội dung rút gọn đúng, không trang/modal mới. |
| TC-UISTATE-06-ERROR | AC-UI-03-01 | Fixture tải lỗi và danh sách rỗng | Phân biệt lỗi/empty; có Thử lại/Tạo phòng đúng. |

**PASS khi:** Toàn ca UI đạt và không chuyển P2 thành hoạt động. FAIL nếu dùng thành công fixture như bằng chứng tạo phòng thật.

**Bằng chứng nộp:** Revision/build và môi trường; ảnh form/Sảnh/năm trạng thái, test bàn phím/validation. Không chứa bí mật.

**Rủi ro / chưa rõ:** Phải nhận cả shell TH-02 và nền TH-01 trước khi dựng phần này. Chưa có handler thật thì chỉ test fixture, không tuyên bố tạo/vào phòng đạt E2E.

---

### TB-09 — Web: phòng chờ (ghế, Sẵn sàng, chia sẻ link/mã), màn từ chối truy cập
**Epic:** EB · **Thành phần:** Frontend · **Sprint đề xuất:** 2 (08/10–10/10) · **Bắt đầu khi (is blocked by):** `T0-10`, `T0-03`, `TH-01`
**Bắt đầu khi (kết quả cần có):** T0-10: khung web/router; T0-03: payload room.state/Ready/ACK lỗi và quyền chia sẻ; TH-01: token, nút/modal/thông báo và mẫu năm trạng thái, tooltip và quản lý focus

**Mục tiêu:** Dựng phòng chờ và màn từ chối truy cập đúng snapshot máy chủ. Hai ghế, Ready và chia sẻ phải phản ánh quyền hiện tại chứ không chỉ người đã mở màn.

**Yêu cầu / nguồn:** US-ROOM-02: AC-ROOM-02-01/AC-ROOM-02-02/AC-ROOM-02-03 hiển thị ghế/đổi solo/reset; US-ROOM-03: AC-ROOM-03-01/AC-ROOM-03-02/AC-ROOM-03-03 Ready/đếm/hủy; US-ROOM-04: AC-ROOM-04-01 chỉ ghế chia sẻ, AC-ROOM-04-02 ẩn QR, AC-ROOM-04-03 bỏ mã thu hồi; US-ROOM-12, AC-ROOM-12-01 lý do và về Sảnh.

**Kết quả (đầu ra):**
- SCR-WAITING-ROOM, MODAL-INVITE phần link/mã và SCR-ACCESS-DENIED.
- Adapter Ready/ghế, clipboard có phản hồi lỗi, năm trạng thái từng khung.

**Phạm vi / ngoài phạm vi:** Không Xin đổi bên/QR/Tái đấu; tab mời bạn bè nối EF, không tự tạo hệ bạn bè.

**Đầu vào cần có:** T0-10: app/router; T0-03: room.state/Ready/ACK; TH-01: component nền. Fixture ghế/đếm/thu hồi/quyền và nội dung DANH-MUC.

**Cách làm gợi ý:**
1. Dùng TH-01 render ghế/Host/Ready theo room.state.
2. Gửi ý định qua contract, đếm theo mốc server, hủy khi snapshot đổi.
3. Kiểm clipboard/quyền chia sẻ/denied và focus, không tự chuyển PLAYING.

**Kiểm thử:** Playwright fixture; Vitest trạng thái. Trạng thái kế hoạch: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-ROOM-03-03 | AC-ROOM-03-03 | Đếm rồi snapshot bỏ Ready | Dừng đếm, không tự tạo ván. |
| TC-ROOM-04-01 | AC-ROOM-04-01 | Ngồi ghế rồi mất ghế khi modal mở | Gỡ quyền chia sẻ; link/mã cùng quyền. |
| TC-UISTATE-18-ERROR | Clipboard/lời mời lỗi | Từ chối quyền clipboard | Không báo sao chép thành công; còn cách dùng mã/link. |
| TC-ROOM-12-01 | AC-ROOM-12-01 | Thử lý do đầy/kick/khóa | Đúng thông báo, một hành động về Sảnh. |

**PASS khi:** Các nhánh UI và năm trạng thái đạt, QR/P2 ẩn. FAIL nếu timer client tự chuyển PLAYING hoặc lỗi clipboard báo thành công.

**Bằng chứng nộp:** Revision/build và môi trường; ảnh phòng chờ/denied/modal, report quyền và chuyển trạng thái. Không chứa bí mật.

**Rủi ro / chưa rõ:** Đã có TH-01, không tự dựng bộ modal khác. Settings/đổi vai/danh sách người xem/kick thuộc TB-12; tích hợp phòng thật ở TB-10/11.

---

### TB-10 — Tích hợp phòng cơ bản: tạo, vào, ghế, Sẵn sàng, bắt đầu ván (web ↔ máy chủ)
**Epic:** EB · **Thành phần:** Frontend, Room Management · **Sprint đề xuất:** 2 (08/10–10/10) · **Bắt đầu khi (is blocked by):** `TB-04`, `TB-08`, `TB-09`
**Bắt đầu khi (kết quả cần có):** TB-04: handler ghế/Ready và một Match ID có dữ liệu bắt đầu; TB-08: Sảnh/tạo/vào mã có adapter; TB-09: phòng chờ/chia sẻ/denied có adapter

**Mục tiêu:** Nối luồng phòng cơ bản giữa Sảnh/phòng chờ và máy chủ. Chứng minh hai người vào cùng phòng và bắt đầu ván trên trình duyệt thật, không chỉ test handler riêng.

**Yêu cầu / nguồn:** US-ROOM-01..05: AC-ROOM-01-02 tạo Host/mã, AC-ROOM-01-03 một vị trí, AC-ROOM-02-03 reset Ready, AC-ROOM-03-02/AC-ROOM-03-03 bắt đầu/hủy, AC-ROOM-04-01 cùng quyền link/mã, AC-ROOM-05-01/AC-ROOM-05-02/AC-ROOM-05-03/AC-ROOM-05-04 xếp vai/đầy/Sảnh/khóa. docs/07 §3/§5.

**Kết quả (đầu ra):** - Adapter thật TB-08/TB-09 ↔ TB-02/TB-03/TB-04 qua chuỗi tiền nhiệm.
- Báo cáo multi-client tạo/join/Ready/chuyển ván, cùng dữ liệu có thẩm quyền.

**Phạm vi / ngoài phạm vi:** Tích hợp phòng cơ bản thật, không clock/nước đi. AC-ROOM-03-02 chỉ kiểm đếm/khởi tạo; đồng hồ thật chuyển TD-10, khóa/kick đầy đủ chuyển TB-11.

**Đầu vào cần có:** TB-08/09: adapter web ↔ TB-04 cùng create/join từ chuỗi tiền nhiệm. Task tạo fixture danh tính/dữ liệu thử; guard harness theo contract T0-11, không thay guard sản phẩm TA-06.

**Cách làm gợi ý:** 1. Nối web với handler Socket.IO/DB phòng thật, không mock tạo/join.
2. Dùng danh tính thử và guard fixture có nhãn trong harness cách ly, không bật bypass sản phẩm.
3. Hai người tạo/join/Ready; so Match ID/thế/lượt/mốc bắt đầu, hủy đếm và tranh chỗ.
4. Mất ACK dùng lại commandId, đối chiếu dữ liệu server; không kiểm giờ giảm.

**Kiểm thử:** Playwright nhiều context + Vitest; handler phòng/DB thật, fixture guard cách ly. Trạng thái: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Tạo/vào | AC-ROOM-01-02 | A tạo, B mở link/mã qua UI | Cùng phòng; A Host Đỏ, B ghế còn lại. |
| Khởi tạo | AC-ROOM-03-02 — phần chưa gồm clock | Cả hai Ready đủ 3 giây | Hai phía cùng Match ID/thế đầu/lượt Đỏ/mốc bắt đầu. |
| Hủy | AC-ROOM-03-03 | Một bên bỏ Ready trước hết đếm | Không chuyển ván ma. |
| Tranh chỗ/retry | AC-ROOM-05-02; docs/07 §3 | Tranh chỗ cuối và retry mất ACK | Không vượt trần/nhân membership, phản hồi đúng vai. |

**PASS khi:** Mọi ca phòng thật trên đạt; FAIL nếu handler giả thay server, khác Match ID hoặc nhân tác động. PASS không bao gồm clock, Auth/guard hồ sơ sản phẩm hay mọi nhánh US-ROOM-01..05.

**Bằng chứng nộp:** Build/commit, môi trường, video/lịch sự kiện, snapshot trước/sau và report Playwright có commit; che bí mật, không ghi mật khẩu/OTP/token.

**Rủi ro / chưa rõ:** TD-10 nhận mốc TB-04 qua luồng ván để kiểm clock đầy đủ; TA-12 nhận TA-09/TA-06 qua tiền nhiệm để kiểm Auth→phòng thật. Không dùng fixture guard làm bằng chứng tài khoản dở bị chặn.

---

### TB-11 — Tích hợp phòng nâng cao: đổi chỗ, riêng tư, danh sách công khai, đuổi, Host rời (web ↔ máy chủ)
**Epic:** EB · **Thành phần:** Frontend, Room Management · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `TB-05`, `TB-06`, `TB-07`, `TB-10`, `TB-12`
**Bắt đầu khi (kết quả cần có):** TB-05: handler đổi vai/Ready/seat_since; TB-06: handler riêng tư/list/mã và policy tư cách giữ chỗ, chưa runtime reconnect; TB-07: handler kick/rời/Host/timer phía phòng và hook cho kết quả/chat/media; TB-10: luồng phòng cơ bản chạy thật qua adapter web/server; TB-12: UI settings/đổi vai/danh sách xem/confirm kick có adapter shared và đủ trạng thái

**Mục tiêu:** Nối điều khiển phòng nâng cao với handler đổi vai/riêng tư/vòng đời. Kiểm đúng cho người chơi, Người xem và người mất quyền.

**Yêu cầu / nguồn:** US-ROOM-06..12; AC-ROOM-06-02 chỗ xem, AC-ROOM-06-04 cấm Host tự xuống/xem tự ngồi; AC-ROOM-07-03/AC-ROOM-07-05 giữ chỗ/khóa; AC-ROOM-08-03/AC-ROOM-08-04 nút xem đầy/empty; AC-ROOM-09-02 kick; AC-ROOM-10-03 rời ván đầu hàng; AC-ROOM-11-01/AC-ROOM-11-04 timer/bắt đầu người mới; AC-ROOM-12-01 denied.

**Kết quả (đầu ra):** - Adapter thật TB-12/TB-08/TB-09 ↔ TB-05/TB-06/TB-07, kế thừa kết nối TB-10.
- Báo cáo E2E quyền phòng, thay quyền khi màn mở và timer FINISHED.

**Phạm vi / ngoài phạm vi:** P1 không Tái đấu/QR; không tự viết thêm UI thiếu, vì TB-12 là tiền đề rõ. Không sửa kết quả ván để hoàn tất luồng phòng.

**Đầu vào cần có:** TB-12: control web; TB-05: đổi vai; TB-06: policy/list/mã; TB-07: handler phòng và hook; TB-10: phòng cơ bản thật. Kết quả ván/timer mất mạng dùng fixture nếu chưa thuộc tiền đề.

**Cách làm gợi ý:** 1. Nối UI TB-12 với TB-05/06/07 và Sảnh từ TB-10.
2. Kiểm đổi vai/khóa/kick qua handler phòng thật, gỡ quyền socket/điều khiển.
3. Kiểm FINISHED bằng fixture state và timer phòng thật; hook media/chat chỉ ghi sự kiện, không nhận thu quyền dịch vụ.
4. Bàn giao adapter phòng cho TD-11, TE-03 và TE-07 kiểm tác động liên miền.

**Kiểm thử:** Playwright nhiều người và Socket.IO/DB phòng thật; fixture state ván có nhãn. Trạng thái: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Đổi vai | AC-ROOM-06-02/04 | Còn chỗ rồi thử N=0/đầy/Host tự xuống | Đúng quyền/trần; Ready reset. |
| Khóa | AC-ROOM-07-05 | Khóa, ghế rời ở fixture FINISHED, mời xem cũ xuống | Giữ khóa, đổi vai cũ hợp lệ; người mới bị chặn. |
| Kick | AC-ROOM-09-02 — tầng phòng | Kick qua UI, thử socket/mã join cũ | Ra Sảnh, không nhận dữ liệu phòng/được join; hook thu quyền được phát. |
| Timer | AC-ROOM-11-01 | FINISHED→WAITING trước hạn cũ | Không đóng phòng chờ mới bởi timer cũ. |

**PASS khi:** Mọi ca UI↔phòng thật trên đạt. FAIL nếu chỉ ẩn nút nhưng socket phòng còn quyền, sai state hoặc timer cũ đóng phòng. Không đòi media/RESIGN/reconnect runtime để PASS.

**Bằng chứng nộp:** Revision/build và môi trường; report E2E, video control/quyền, log socket/media đã che và trạng thái phòng. Không chứa bí mật.

**Rủi ro / chưa rõ:** TE-07 nối hook với track thật, TE-03 kiểm chat, TD-11 kiểm mất mạng/rời-kết quả. Chưa nghiệm thu toàn AC kick/đổi vai hoặc US-ROOM-06..12; fixture không phải chứng cứ liên miền.

---

### TB-12 — Web: cài đặt phòng, đổi chỗ ghế ↔ xem, danh sách người xem, xác nhận đuổi
**Epic:** EB · **Thành phần:** Frontend · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `TB-09`, `T0-03`, `TH-01`
**Bắt đầu khi (kết quả cần có):** TB-09: màn phòng chờ, ghế và adapter snapshot/denied; T0-03: contract role/privacy/kick và ACK/lỗi P1 cần thống nhất; TH-01: token, modal/nút/thông báo, tooltip và quản lý focus

**Mục tiêu:** Dựng điều khiển nâng cao trên phòng chờ. UI phản ánh quyền/state và phát ý định cho TB-11 nối máy chủ.

**Yêu cầu / nguồn:** US-ROOM-06: AC-ROOM-06-01 chỉ đổi vai WAITING/FINISHED, AC-ROOM-06-02 còn chỗ xem, AC-ROOM-06-03 Host mời xuống ghế, AC-ROOM-06-04 không tự ngồi/Host tự xuống. US-ROOM-07: AC-ROOM-07-01 chỉ Host và đủ ghế mới khóa, AC-ROOM-07-06 xác nhận giữ người hiện tại. AC-ROOM-09-01 hai người chơi có confirm kick; AC-ROOM-10-01/AC-ROOM-10-03 quyền Host cập nhật từ server. DANH-MUC §3–5.

**Kết quả (đầu ra):**
- MODAL-ROOM-SETTINGS, control đổi vai, danh sách người xem và MODAL-CONFIRM-KICK.
- Adapter shared và fixture quyền/state, đủ SUCCESS/LOADING/EMPTY/ERROR/DISABLED; vô hiệu có tooltip.

**Phạm vi / ngoài phạm vi:** Không viết handler/thu hồi media; không Xin đổi bên/Tái đấu/QR. Danh sách phòng công khai tái dùng Sảnh, không dựng lại; chỉ bổ sung control người xem trong phòng.

**Đầu vào cần có:** TB-09: điểm gắn control/snapshot; T0-03: ý định/ACK; TH-01: UI nền. Fixture bao gồm quyền đổi khi modal mở.

**Cách làm gợi ý:**
1. Gắn control vào TB-09 bằng TH-01, không sao chép modal/ghế.
2. Áp quyền/state, xác nhận khóa/kick; Huỷ không gửi ý định.
3. Chờ ACK rồi phản ánh snapshot; lỗi/đổi quyền gỡ thao tác không còn hợp lệ.
4. Bàn giao adapter cho TB-11, kiểm bàn phím và năm trạng thái.

**Kiểm thử:** Playwright với adapter fixture, Vitest trạng thái. Trạng thái kế hoạch: NOT_RUN.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-ROOM-06-02 | AC-ROOM-06-02/AC-ROOM-06-04 | N=0/đầy, Host tự xuống, Người xem tự ngồi | Vô hiệu có lý do hoặc ẩn đúng luật, không gửi lệnh. |
| TC-ROOM-07-06 | AC-ROOM-07-01/AC-ROOM-07-06 | Thiếu ghế rồi đủ ghế bật khóa; thử Huỷ | Chặn khi thiếu; confirm nói giữ người cũ; Huỷ không gửi. |
| TC-ROOM-09-01 | AC-ROOM-09-01 | Host/người chơi kick, người xem thử cùng thao tác | Hai người chơi được confirm, người xem không có quyền. |
| Quyền/ACK lỗi | AC-UI-03-01; NFR-04 | Mất Host khi modal mở, lỗi ACK, danh sách rỗng | Gỡ quyền; không báo success giả; đúng năm trạng thái. |

**PASS khi:** Mọi ca UI đạt, adapter/tooltip/focus dùng được. FAIL nếu tự cập nhật quyền khi chưa ACK hoặc mở thao tác P2. Test fixture không chứng minh kick/thu hồi thật.

**Bằng chứng nộp:** Revision/build và môi trường; ảnh/video trạng thái và report test quyền/bàn phím, contract adapter. Không chứa bí mật.

**Rủi ro / chưa rõ:** Chốt tên event trong shared trước dựng, không bịa endpoint. TB-11 tích hợp thật; ẩn control không chứng minh thu media.

---
