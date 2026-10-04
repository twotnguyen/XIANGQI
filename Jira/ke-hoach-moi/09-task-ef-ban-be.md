# Kế hoạch mới (bản nháp) — 09: Task của Epic EF — Bạn bè

**Ngày:** 2026-10-04 · **Trạng thái:** ĐỀ XUẤT, chờ PO và nhóm duyệt · Chưa tạo gì trên Jira. Khung, phụ thuộc và Sprint: `01-components-epic-khung-task.md`; Description Epic: `02-epic.md`.

Epic gồm **5 task**. Mỗi task: dòng đầu (Epic, thành phần, Sprint, **is blocked by**) lấy từ khung; **Bắt đầu khi (kết quả cần có)** nêu hiện vật cụ thể của từng tiền đề. Chưa có ước lượng giờ và người nhận việc (nhóm điền khi Sprint Planning).

### TF-01 — Máy chủ: tìm người, gửi/nhận lời mời, giới hạn bạn bè
**Epic:** EF · **Thành phần:** Social · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `T0-11`, `T0-04`, `T0-13`
**Bắt đầu khi (kết quả cần có):** T0-11: gateway xác thực/danh tính và dispatch; T0-04: profiles, friendships, friend_declines và ràng buộc cặp; T0-13: primitive tra/lưu biên lai theo danh tính + commandId, callback chỉ chạy cho lệnh mới và ghép giao dịch DB.

**Mục tiêu:** Thực hiện vòng đời kết bạn với giới hạn ở cả hai tài khoản. EF có quan hệ hai chiều nhất quán để mời online.

**Yêu cầu / nguồn:** US-FRIEND-01, US-FRIEND-02, US-FRIEND-05: AC-FRIEND-01-01 — tìm tiền tố không phân biệt hoa thường; AC-FRIEND-01-02 — thu hồi/hết hạn 30 ngày; AC-FRIEND-02-02 — từ chối hai lần có hướng; AC-FRIEND-05-01 — trần 200 bạn/50 chờ cả hai đầu. Nguồn bổ sung: BA 5.5; docs/03 §2.10; docs/07 §9.

**Kết quả (đầu ra):** friend.search/request/respond/thu hồi, bộ đếm từ chối bền và dọn lời mời hết hạn.

**Phạm vi / ngoài phạm vi:** Kết bạn P1, không chat 1-1/Thách đấu/Khách.

**Đầu vào cần có:** Danh tính từ phiên, hồ sơ công khai và thời gian server; bảng/ràng buộc T0-04. T0-13 cấp primitive dùng chung cho gửi/respond/thu hồi; match_id có thể rỗng, không tạo ván giả để lưu biên lai.

**Cách làm gợi ý:**

1. Tìm username tiền tố không phân biệt hoa thường, chỉ trường công khai; không tự mời.
2. Với lệnh thay đổi, xác thực rồi tra biên lai T0-13 trước điều kiện trạng thái biến đổi; chỉ lệnh mới mới kiểm quyền/trần/trạng thái. Chỉ người nhận respond, chỉ người gửi thu hồi.
3. Tuần tự hoá theo cặp/danh tính; ghi quan hệ, bộ đếm từ chối và biên lai trong cùng giao dịch. Chỉ ACK/phát sau commit.
4. Kiểm trần 200 bạn/50 lời mời chờ tổng gửi+nhận ở cả hai đầu; gửi chéo chỉ một PENDING, không tự ACCEPTED.
5. Từ chối chủ động tăng có hướng một lần; retry decline mất ACK trả kết quả cũ. Thu hồi/hết hạn 30 ngày không tăng/xoá lịch sử từ chối.

**Kiểm thử:** Vitest tích hợp DB, điều khiển thời gian và cạnh tranh. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Tìm | Tìm tiền tố khác hoa thường | Thẻ đúng username, không email |
| Ca 2 | Vòng đời | Gửi/thu hồi/chấp nhận/từ chối/hết 30 ngày | Đúng trạng thái, từ chối không thông báo người gửi |
| Ca 3 | Biên | 199/200 bạn, 49/50 lời mời; gửi/chấp nhận đồng thời | Không vượt trần cả hai đầu |
| Ca 4 | Chéo/từ chối | Gửi chéo; từ chối hai lần rồi dọn lời mời | Một PENDING, không tự bạn; vẫn chặn đúng chiều |
| Ca 5 | Respond trái quyền | A mời B; C và A tự accept/decline thay B | Từ chối, không ACCEPTED, không tăng friend_declines |
| Ca 6 | Thu hồi trái quyền | B/C thu hồi lời mời của A | Từ chối, giữ lời mời và đếm; A được thu hồi lời mời do A gửi |
| Ca 7 | Retry decline | B từ chối, mất ACK, gửi lại cùng định danh và hai bản đồng thời | Kết quả cũ trả lại; friend_declines chiều A→B chỉ tăng một lần, không báo từ chối cho A |
| Ca 8 | Ghi lỗi/biên lai | Gây lỗi trước commit, thử lại; sau commit làm mất ACK rồi retry decline với cùng commandId | Trước commit không có tác động/biên lai thành công; sau commit retry trả kết quả cũ, chỉ tăng friend_declines một lần |

**PASS khi:** Mọi ca quyền/giới hạn/vòng đời/retry đạt với DB và T0-13 thật; một lệnh decline thành công chỉ tăng một lần theo đúng chiều, không ACCEPTED/thu hồi trái quyền. FAIL nếu mock biên lai thay primitive, commit quan hệ và biên lai lệch, vượt trần hoặc lộ email. Không phụ thuộc UI bạn bè để PASS server.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** T0-13 đã được khai báo, không còn thiếu cạnh chống trùng; không tạo kho biên lai thứ hai. Payload khác cùng commandId và retry sau dọn biên lai còn cần quyết định theo T0-13, không tự đặt chính sách. Mẫu biên lai/lọc lại dữ liệu còn nhãn đề xuất trong docs/07; bảo mật/chống tác động trùng vẫn bắt buộc.

---

### TF-02 — Máy chủ: danh sách bạn và trạng thái online/đang đấu
**Epic:** EF · **Thành phần:** Social · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `TF-01`, `TB-01`
**Bắt đầu khi (kết quả cần có):** TF-01: quan hệ ACCEPTED và dịch vụ kết bạn đã kiểm; TB-01: máy trạng thái phòng và sổ vị trí ROOM/AI có khóa theo người dùng.

**Mục tiêu:** Trả danh sách bạn và trạng thái đang hiện diện đúng dữ liệu máy chủ. Người dùng biết ai có thể nhận lời mời vào phòng.

**Yêu cầu / nguồn:** US-FRIEND-03: AC-FRIEND-03-01 — Online/Đang đấu/Offline; AC-FRIEND-03-03 — huỷ bạn hai chiều. Elo trong AC-FRIEND-03-01 thuộc P2. Nguồn bổ sung: BA 2.5, 5.5; docs/03 §2.1, §2.10; docs/07 §9.

**Kết quả (đầu ra):** Danh sách công khai của bạn, nguồn trạng thái kết nối/ván, sự kiện cập nhật và huỷ kết bạn.

**Phạm vi / ngoài phạm vi:** P1 không thống kê Elo hoặc cấp quyền lịch sử bạn bè.

**Đầu vào cần có:** Quan hệ ACCEPTED, registry kết nối và trạng thái vị trí chơi từ máy chủ; không suy từ màu client. Đầu vào mới bắt buộc: TB-01: máy trạng thái phòng và sổ vị trí ROOM/AI có khóa theo người dùng.

**Cách làm gợi ý:**

1. Truy danh sách theo chính chủ và giới hạn trường trả.
2. Kết hợp hiện diện với vị trí chơi theo BA: ghế WAITING/PLAYING/FINISHED và ván AI đều không rảnh nhận mời.
3. Huỷ quan hệ nguyên tử và phát cập nhật cho hai đầu.
4. Đọc registry ROOM/AI: có kết nối và còn ghế WAITING/PLAYING/FINISHED hoặc chơi AI thì Đang đấu. Chỉ Online rảnh nhận mời; ngắt kết nối không được biến thành Online rảnh dù còn chỗ giữ.

**Kiểm thử:** Vitest tích hợp. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Trạng thái | Bạn đăng nhập, bắt đầu ván, rời/ngắt kết nối | Danh sách phản ánh nguồn trạng thái |
| Ca 2 | Huỷ | Huỷ khi hai bên mở danh sách | Hai bên không còn là bạn |
| Ca 3 | Quyền | Đổi user_id yêu cầu danh sách | Không đọc danh sách người khác |
| Ca 4 | Lỗi | DB/truy vấn lỗi | Báo lỗi, không giả danh sách rỗng |
| Ca 5 | Oracle ghế | Bạn có kết nối, lần lượt fixture ghế WAITING/PLAYING/FINISHED và vị trí AI | Cả bốn Đang đấu, không nhận mời; kết thúc ván nhưng còn ghế không thành Online rảnh |
| Ca 6 | Giải phóng | Giải phóng fixture ghế/AI, giữ kết nối rồi thử ngắt kết nối | Rời vị trí thành Online rảnh; ngắt kết nối không nhận mời như người Online |

**PASS khi:** Mọi ca đạt, payload chỉ chứa dữ liệu cho phép và danh sách nhất quán hai bên. Sai ca bắt buộc: FAIL; chưa kiểm/thiếu điều kiện: NOT_RUN/BLOCKED.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** TB-01 cung cấp registry chung; policy AI kiểm bằng fixture tại đây. Hook TG-02 thật kiểm tại TQ-04 sau TG-05; đề xuất thêm TG-02 vào TF-05 nếu muốn kiểm tại đó. Không tự đặt ngưỡng cập nhật hiện diện hoặc ưu tiên nhãn khi mất mạng mà còn vị trí.

---

### TF-03 — Máy chủ: mời bạn online vào phòng
**Epic:** EF · **Thành phần:** Social · **Sprint đề xuất:** 4 (15/10–17/10) · **Bắt đầu khi (is blocked by):** `TF-02`, `TB-03`, `TB-06`
**Bắt đầu khi (kết quả cần có):** TF-02: quan hệ bạn và hiện diện có thẩm quyền; TB-03: lệnh vào phòng và xếp ghế/người xem theo sức chứa; TB-06: quyền PUBLIC/CODE_ONLY/LOCKED và phiên mã/link hiện hành.

**Mục tiêu:** Cho người ngồi ghế mời bạn Online vào phòng hiện tại. Lời mời là thông báo có hạn, không giữ ghế hay vượt quyền vào phòng.

**Yêu cầu / nguồn:** US-FRIEND-04: AC-FRIEND-04-01 — chỉ bạn Online; AC-FRIEND-04-02 — bận/offline bị vô hiệu; AC-FRIEND-04-03 — pop-up 30 giây; AC-FRIEND-04-04 — tham gia theo US-ROOM-05. Nguồn bổ sung: BA 2.5; docs/07 §5.

**Kết quả (đầu ra):** Lời mời phòng, thời điểm hết hạn, xử lý tham gia/từ chối và kiểm lại toàn bộ điều kiện.

**Phạm vi / ngoài phạm vi:** Mời trong MODAL-INVITE P1; không nút mời trên trang Bạn bè, không Thách đấu.

**Đầu vào cần có:** roomId/link version, tư cách ghế người gửi và quan hệ bạn đang còn hiệu lực. Đầu vào mới bắt buộc: TB-06: quyền PUBLIC/CODE_ONLY/LOCKED và phiên mã/link hiện hành.

**Cách làm gợi ý:**

1. Kiểm người gửi ngồi ghế và người nhận là bạn Online rảnh; còn ghế WAITING/PLAYING/FINISHED hoặc vị trí AI là Đang đấu, không được gửi mời.
2. Gửi thông báo 30 giây không đặt chỗ.
3. Tham gia gọi cùng cơ chế room.join, kiểm lại bạn/bận/khoá/chặn/mã/sức chứa.
4. Tại lúc nhận lời mời, đọc lại privacy và phiên link/mã của TB-06 rồi gọi room.join TB-03; không cấp quyền bằng trạng thái đã cache lúc gửi.

**Kiểm thử:** Vitest tích hợp nhiều kết nối. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Hợp lệ | Người ngồi ghế mời bạn Online rồi nhận | Vào ghế hoặc xem nếu hợp lệ |
| Ca 2 | Quyền | Người xem mời hoặc người nhận bận/offline | Bị chặn, không gửi mời |
| Ca 3 | Trễ | Chờ hết hạn/thu hồi link/khoá trước tham gia | Không vào trái quyền |
| Ca 4 | Tranh chấp | Hai người chấp nhận chỗ cuối | Không vượt trần; phản hồi tình trạng thật |
| Ca 5 | Riêng tư thay đổi | Gửi mời rồi LOCKED hoặc mở lại tạo mã/link mới trước khi nhận | Kiểm lại quyền/mã hiện hành, không dùng lời mời như vé giữ ghế |
| Ca 6 | Bận giữ ghế | Người nhận có kết nối nhưng ở ghế WAITING/PLAYING/FINISHED hoặc fixture AI | Server chặn gửi mời ở cả bốn trường hợp, không chỉ khóa UI |
| Ca 7 | Bận sau mời | Gửi lúc bạn rảnh, bạn chiếm vị trí trước nhận | Kiểm lại vị trí, không vào phòng khác trái luật |

**PASS khi:** Mọi ca đạt, không giữ chỗ hoặc tạo phòng khác; hạn quyết định ở máy chủ. Sai ca bắt buộc: FAIL; chưa kiểm/thiếu điều kiện: NOT_RUN/BLOCKED.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** TB-06 đã là tiền đề; Online là trạng thái tại thời điểm quan sát, vẫn kiểm lại vị trí/quan hệ ở thời điểm tham gia.

---

### TF-04 — Web: giao diện bạn bè (tìm, lời mời, danh sách, mời vào phòng)
**Epic:** EF · **Thành phần:** Frontend, Social · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `T0-10`, `T0-03`, `TH-01`, `TH-02`, `TB-09`
**Bắt đầu khi (kết quả cần có):** T0-10: ứng dụng React/Vite với router và kết nối shared chạy được; T0-03: hợp đồng friend/invite/state/error; TH-01: token Kỳ Đài Cổ Phong và nút/modal/tooltip/thông báo với focus, năm trạng thái; TH-02: shell Sảnh/điều hướng, vị trí ghép chuông, thẻ AI và banner quay lại; TB-09: UI phòng chờ, MODAL-INVITE chia sẻ mã/link và màn từ chối truy cập.

**Mục tiêu:** Dựng tìm kiếm, chuông lời mời và danh sách bạn P1. Điểm mời vào phòng chỉ xuất hiện trong phòng theo BA.

**Yêu cầu / nguồn:** US-FRIEND-01, US-FRIEND-02, US-FRIEND-03, US-FRIEND-04, US-FRIEND-05: AC-FRIEND-03-02 — Nhắn tin/Thách đấu DISABLED; AC-FRIEND-04-01 — mời trong MODAL-INVITE; AC-FRIEND-04-03 — pop-up 30 giây; AC-FRIEND-05-01 — giới hạn có tooltip. Nguồn bổ sung: DANH-MUC SCR-FRIENDS, MODAL-INVITE; DESIGN §8.4.

**Kết quả (đầu ra):** Trang bạn bè, tìm và trả lời/thu hồi lời mời, chuông, danh sách Online trong modal phòng và pop-up nhận mời.

**Phạm vi / ngoài phạm vi:** UI P1; không Elo, chat 1-1, Thách đấu hoạt động hoặc nút mời trên trang Bạn bè.

**Đầu vào cần có:** Fixture ba trạng thái hiện diện, lỗi/trần và quan hệ; adapter theo shared. Đầu vào mới bắt buộc: TH-01: token Kỳ Đài Cổ Phong và nút/modal/tooltip/thông báo với focus, năm trạng thái; TH-02: shell Sảnh/điều hướng, vị trí ghép chuông, thẻ AI và banner quay lại; TB-09: UI phòng chờ, MODAL-INVITE chia sẻ mã/link và màn từ chối truy cập.

**Cách làm gợi ý:**

1. Dựng tìm/chuông/danh sách với năm trạng thái.
2. Đặt mời đúng modal; hiển thị lý do bận/offline/trần.
3. Đếm hạn từ server, chỉ báo thành công sau ack và xử lý mất xác nhận.
4. Ghép chuông/menu vào shell TH-02 và danh sách Mời vào MODAL-INVITE của TB-09; dùng component TH-01, không dựng trang/modal thứ hai.

**Kiểm thử:** Playwright UI, bàn phím. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Điểm vào | Mở trang Bạn bè và MODAL-INVITE | Chỉ modal phòng có nút Mời |
| Ca 2 | Trạng thái | Online/Đang đấu/Offline và đạt trần | Nút/tooltip đúng |
| Ca 3 | Thông báo | Chấp nhận/từ chối/hết 30 giây | Đúng hành động, hết hạn tự tắt |
| Ca 4 | Lỗi | Tải/gửi thất bại hoặc mất ack | Không giả bạn mới; có phản hồi/Thử lại |
| Ca 5 | Điểm ghép | Mở chuông trên shell, mở mời từ phòng chờ TB-09 và trang Bạn bè | Một chuông/modal đúng vị trí; trang Bạn bè không có nút mời vào phòng |
| Ca 6 | Fixture Đang đấu | Hiện bạn còn ghế WAITING/PLAYING/FINISHED hoặc AI | Nhãn Đang đấu, Mời DISABLED có tooltip theo BA; không thành Online rảnh chỉ vì ván đã kết thúc |

**PASS khi:** Mọi ca UI đạt và không lối kích hoạt P2; toàn luồng thật chờ TF-05. Sai ca bắt buộc: FAIL; chưa kiểm/thiếu điều kiện: NOT_RUN/BLOCKED.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** Các điểm ghép shell/phòng chờ đã có tiền đề. TF-05 vẫn cần để chứng minh gửi/nhận lời mời thật; fixture UI không xác nhận đã gửi.

---

### TF-05 — Tích hợp bạn bè (web ↔ máy chủ)
**Epic:** EF · **Thành phần:** Frontend, Social · **Sprint đề xuất:** 4 (15/10–17/10) · **Bắt đầu khi (is blocked by):** `TF-01`, `TF-02`, `TF-03`, `TF-04`, `TB-10`, `TB-11`, `TG-02`
**Bắt đầu khi (kết quả cần có):** TF-01: vòng đời bạn bè/quyền/giới hạn và biên lai; TF-02: danh sách/hiện diện đọc registry; TF-03: lời mời phòng 30 giây, kiểm lại quyền/vị trí; TF-04: UI bạn bè/chuông/MODAL-INVITE; TB-10: tạo/vào/Ready/bắt đầu phòng thật; TB-11: đổi vai/khóa/kick/rời phòng đã tích hợp; TG-02: ai.start/move/sync, vòng đời/RESIGN AI và hook chiếm/giải phóng registry ROOM/AI.

**Mục tiêu:** Nối toàn luồng bạn bè với máy chủ và phòng thật. Bạn được mời phải vào đúng vai theo trạng thái tại lúc chấp nhận.

**Yêu cầu / nguồn:** US-FRIEND-01, US-FRIEND-02, US-FRIEND-03, US-FRIEND-04, US-FRIEND-05: AC-FRIEND-02-01 — chấp nhận hai chiều; AC-FRIEND-04-04 — join theo phòng; AC-FRIEND-05-02 — mời chéo không tự thành bạn. Nguồn bổ sung: docs/07 §5, §9; docs/08 nhóm F; docs/05 D3.

**Kết quả (đầu ra):** Adapter friend.* và invite.received, E2E từ kết bạn tới tham gia phòng.

**Phạm vi / ngoài phạm vi:** Bạn bè/mời P1 với phòng và dịch vụ AI thật. Không Thách đấu/chat 1-1/Elo. Kiểm hiện diện AI bằng TG-02 thật, không đòi màn AI TG-04/05 chưa là tiền đề.

**Đầu vào cần có:** TF-04 UI ↔ TF-01/02/03 server; join và control phòng thật TB-10/11. Gọi dịch vụ TG-02 bằng client thử xác thực để bắt đầu/rời AI, dùng worker TG-01 và registry thật; nhận hook ở TF-02, quan sát trên UI bạn bè. Không dùng fixture giả hook TG-02.

**Cách làm gợi ý:**

1. Nối truy vấn/sự kiện/ACK bạn bè và UI; kiểm hai đầu quan hệ/giới hạn.
2. Mời từ MODAL-INVITE, không giữ ghế; đổi quyền/chỗ/LOCKED khi pop-up mở rồi kiểm join lại.
3. Đối chiếu người còn ghế WAITING/PLAYING/FINISHED là Đang đấu, kể cả FINISHED chưa rời. Trạng thái FINISHED có thể nạp qua dữ liệu thử: không tự nhận đã kiểm toàn luồng kết thúc online.
4. Bắt đầu AI bằng TG-02 thật, kiểm bạn Đang đấu và không nhận mời; xác nhận rời AI qua dịch vụ, kiểm hook giải phóng rồi Online rảnh khi còn kết nối và gửi mời được.
5. Kiểm retry/giới hạn/quyền tại server, không chỉ trạng thái nút.

**Kiểm thử:** Playwright bạn bè/phòng và Vitest/client thử gọi TG-02 thật; ca nội bộ.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | E2E cơ bản | Tìm, kết bạn, mời Online từ phòng rồi nhận | Quan hệ hai chiều; vào đúng phòng/vai theo sức chứa |
| Ca 2 | Hạn/quyền | Để quá 30 giây, hủy bạn, khóa hoặc thu hồi link trước nhận | Không join trái điều kiện, UI phản ánh lỗi thật |
| Ca 3 | Trần/đồng thời | Vượt 200 bạn/50 chờ hoặc gửi chéo | Chặn ở server cả hai đầu; chỉ một PENDING, không tự thành bạn |
| Ca 4 | Ghế còn giữ | WAITING/PLAYING thật và fixture FINISHED trên phòng thật, bạn vẫn có ghế/kết nối | Đang đấu, nút và server chặn Mời; rời ghế mới rảnh |
| Ca 5 | AI thật | Bạn vào AI bằng TG-02; thử mời; bạn xác nhận rời AI và giữ kết nối; thử mời lại | Hook chiếm vị trí làm Đang đấu/không nhận mời; RESIGN/hủy tìm/giải phóng đúng, sau đó Online rảnh và mời được |
| Ca 6 | Rời AI/lặp qua client thử | Client thử không gửi lệnh rời (tương ứng Huỷ), sau đó gửi lệnh rời đã xác nhận rồi retry cùng định danh | Không gửi thì vẫn Đang đấu; rời chỉ một tác động, không giải phóng nhầm vị trí mới. Modal AI thật kiểm ở TG-05 |
| Ca 7 | Phòng đầy | Hai ghế đầy, mời vào chỗ xem rồi thử khi hết chỗ | Vào đúng vai hoặc từ chối, không vượt tối đa năm người xem |

**PASS khi:** Các ca bạn bè/phòng và hook AI thật đạt: người còn ghế WAITING/PLAYING/FINISHED hoặc đang AI không nhận mời; rời vị trí đúng mới có thể Online rảnh. FAIL nếu fixture thay hook AI, chỉ UI chặn mà server gửi, quan hệ/vị trí lệch hoặc trùng tác động. Ca hiện diện AI thuộc task này; TQ-04 chỉ hồi quy toàn P1, không phải đầu vào để PASS TF-05.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** TG-02 đã là tiền đề nên không còn hoãn nhánh AI. Task không cần TG-05 UI để kiểm dịch vụ/hook; màn AI toàn luồng được nghiệm thu ở TG-05/TQ-04. Thứ tự nhãn khi mất mạng nhưng còn giữ vị trí cần oracle nguồn nếu chưa rõ; không tự đặt độ trễ cập nhật.

---
