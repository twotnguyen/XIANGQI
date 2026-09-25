# BA AUDIT — DISCOVERY & INITIAL AUDIT · 2026-09-22

**Audit ID:** `BA-20260922` · **Trạng thái:** `AWAITING_PO` · **Phạm vi:** Phase 1 theo brief đính kèm.

Đây là đợt audit mới. Báo cáo [initial-audit.md](initial-audit.md) và [final-audit.md](final-audit.md) ngày 2026-09-21 được giữ nguyên làm dấu vết. Báo cáo này **không thay đổi requirement, không đảo quyết định Accepted, không cho phép triển khai, không phải final audit sau sửa**.

## 1. Executive Summary

**Chưa đủ căn cứ để bàn giao toàn bộ tài liệu dưới nhãn DESIGN_COMPLETE.** Các chức năng lớn đều đã có tài liệu; vấn đề chính là quyết định mới chưa được cập nhật xuyên suốt, các nhánh giao nhau chưa có một hành vi duy nhất, và một số tiêu chí nghiệm thu xung đột với chính đặc tả.

| Chỉ số tại snapshot đầu audit | Kết quả / cách hiểu |
|---|---|
| Markdown trong workspace | **304 file, 33.809 dòng**; không tính file đính kèm ngoài workspace |
| Tài liệu trong `docs/`, ngoài archive | **197**: 55 tài liệu nền/chức năng + 142 tài liệu kế hoạch triển khai |
| Tài liệu lịch sử `docs/99-archive/` | **102**; được đọc như lịch sử, không nâng thành yêu cầu hiện hành |
| Root / site | **2 / 3** Markdown |
| Yêu cầu cấp sản phẩm | **19**, R01–R19; không đồng nhất số này với số hành vi nguyên tử |
| Tài liệu chức năng / flow | **16 REQ / 9 FLOW**, không tính README |
| BR định danh trong 16 REQ | **287 ID duy nhất**: 286 ID theo module + `BR-UI-INA-01` |
| AC trong 16 REQ + session-state | **271 + 18 = 289**; không gồm 6 quy tắc báo cáo `AC-RULE-*`, không phải số test đã chạy |
| Screen / page / modal / panel | **34 ID** trong screen inventory |
| Quyết định | **DEC-000** ghi nền 24 câu phỏng vấn; **25 DEC-001–025** bổ sung |
| Kiểm thử ứng dụng | **Không chạy**: nhiệm vụ chỉ audit tài liệu; workspace chưa có ứng dụng |

Không dùng điểm 10/10 hoặc tỷ lệ “đầy đủ” cảm tính. Các tiêu chí để gọi READY chưa đạt: hành vi duy nhất ở nhánh thời gian/quyền; flow có đường ra; AC không phủ định nhau; truy vết tới đúng hành vi; câu hỏi PO được giải quyết. Có tên file, đủ mục, hoặc link tồn tại **không chứng minh** các tiêu chí đó.

**Kết quả:** 31 cụm phát hiện (7 P0, 23 P1, 1 P2); 5 câu hỏi P0 cần PO trả lời ở vòng đầu, 9 câu P1 để các vòng sau. F01/F02 có quyết định sẵn nhưng tài liệu chưa đồng bộ. Chi tiết phân loại tại §5.

**Cách đếm phát hiện:** bảng §5 dùng một ID cho mỗi cụm nguyên nhân; nhiều vị trí lặp cùng lỗi không tính thành nhiều lỗi. Câu hỏi §10 tách quyết định còn thiếu khỏi việc đồng bộ quyết định đã có. Không coi chức năng đã được loại khỏi phạm vi là requirement thiếu.

## 2. Current Documentation Structure

```text
XIANGQI-Design/
├── AGENTS.md, README.md
├── docs/
│   ├── README.md, ONBOARDING.md
│   ├── 00-overview/          4
│   ├── 01-requirements/     17  (16 REQ + README)
│   ├── 02-flows/            10  (9 FLOW + README)
│   ├── 03-screens/           2
│   ├── 04-business-rules/    3
│   ├── 05-data-and-realtime/ 4
│   ├── 06-acceptance/        2
│   ├── 07-decisions/         2
│   ├── 08-ba-review/         5  (trước đợt audit này)
│   ├── 09-technical/         4
│   ├── 10-issues/          142  (138 ISSUE + 4 hướng dẫn/chỉ mục)
│   └── 99-archive/         102
└── site/                    3 Markdown + website tài liệu
```

Cấu trúc đã phân biệt WHAT, HOW, quyết định và lịch sử; **không cần di chuyển hàng loạt để giải quyết các lỗi tìm được**. `site/` là sản phẩm đọc tài liệu và dữ liệu được sinh từ Markdown, không phải mã ứng dụng Cờ Tướng. Chỉ khảo sát vai trò của site qua ba Markdown, không thực hiện audit mã renderer.

`git status` và `git branch` báo không phải Git repository. Không có commit, nhánh hoặc PR được tạo. `DEC-001` đã xác nhận vai trò nguồn chính thức của workspace này; không hỏi lại quyết định đó.

## 3. Documentation Inventory và phương pháp

Inventory từng file, đủ cột **File · Purpose · Quality · Problems · Action**, nằm tại [documentation-inventory-2026-09-22.md](documentation-inventory-2026-09-22.md). Snapshot số dòng và SHA-256 nằm tại [audit-manifest-2026-09-22.json](audit-manifest-2026-09-22.json).

- Đọc toàn văn theo nhóm: 26 file nền/tổng hợp; 27 requirements/flows; 146 technical/issues; 105 archive/site. Tổng bằng 304, không bỏ file vì chỉ là lịch sử hoặc báo cáo cũ.
- Kiểm định lượng được chạy bằng Python trên file local: danh mục, ID định nghĩa (không đếm tham chiếu lặp), liên kết Markdown và dependency issue. Các kết luận nghiệp vụ dựa trên đối chiếu nội dung, không dựa vào regex.
- Kiểm link chỉ kiểm **đích file/thư mục của liên kết Markdown**, không xác nhận mọi đường dẫn trong backtick, mọi tham chiếu ID, anchor hay URL ngoài. Hai cảnh báo regex ở `site/_analysis/SYNTAX-REPORT.md:13,88` là **ví dụ cú pháp trong inline code**, không tính là link hỏng thật. Các tham chiếu lịch sử đã di chuyển được ghi riêng trong inventory.
- Dẫn chiếu `file:Lx` trong báo cáo tính theo snapshot này; đọc cùng section/ID để truy lại khi tài liệu thay đổi.
- `Good` nghĩa là chưa thấy vấn đề cụ thể trong phạm vi audit, **không** là chứng nhận tuyệt đối. `Obsolete` nghĩa là không dùng để triển khai hiện tại, **không** có nghĩa phải xoá.
- Uỷ quyền cũ `DEC-000-Q24` là dữ liệu lịch sử. Đợt này tuân thủ yêu cầu mới của PO: **không tự chốt điểm chưa rõ**.

## 4. Feature Coverage Matrix

Ký hiệu: **Có** = có artifact; **Lệch** = có nhưng mâu thuẫn; **Thiếu nhánh** = chưa đủ để xác định hành vi. Không dùng dấu ✅ để suy ra READY toàn module. Tên REQ/FLOW/SCR rút gọn theo tên file/ID hiện có.

| Module | Requirement / luật | Flow | UI / state / nghiệm thu | Kết quả audit |
|---|---|---|---|---|
| Authentication | R01, AUTH | AUTH | LOGIN/REGISTER/VERIFY/RESET/ONBOARDING; AC-AUTH | Có; ranh giới phiên, xác minh và lỗi dịch vụ cần rõ hơn F14 |
| User/Profile | R02, PROFILE-FRIENDS | Trong REQ | SETTINGS; AC-FRD | Có; nguồn sửa hồ sơ trên screen inventory chỉ trỏ AUTH |
| Friends/Presence | R02, BR-FRD | Trong REQ; matrix lại trỏ AUTH | FRIENDS/NAVBAR; AC-FRD | Truy vết lệch F21; không kết luận thiếu toàn bộ flow bạn bè |
| Lobby | R03/R04, LOBBY | JOIN-ROOM | LOBBY; AC-LOB | Có; DEC-023 đã quyết không hiện FINISHED |
| Create/configure room | R03, ROOM | CREATE-ROOM | CREATE/SETTINGS/WAITING; AC-ROOM | Sẵn sàng một người mâu thuẫn F10; đổi bên thiếu luồng F13 |
| Invite / inbox | R03/R19, INVITE | JOIN-ROOM | INVITE/JOIN/INBOX/NAVBAR; AC-INV | Có; không thiếu inbox, offline invite đã được DEC-008 chốt |
| Player joining | R03, ROOM/INVITE | JOIN-ROOM | WAITING; T063/T133 | FINISHED chưa rõ F07; hợp đồng role trái test F15 |
| Spectator joining | R04/R18, SPECTATOR | SPECTATOR/JOIN | LIST/ACCESS-DENIED; AC-SPEC | Có; giữa ván và 5 ghế đã chốt; quyền/lỗi/đổi privacy F12/F30/F31 |
| Chess Board | R05, BOARD, GR | MATCH | GAME-ROOM; AC-BRD | Toạ độ rõ; còn tab cũ F01; giải thích luật F23 |
| Chess Rules | R05/R07, GR | Trong GR/MATCH | Kết quả; TS-RULE | Có luật di chuyển, lặp, chiếu/bí; không áp luật WXF khác vào audit |
| Multiplayer Match | R06/R07, MATCH | MATCH | ACTIVE/FINISHED/INTERRUPTED | Có; từ chối vì hết giờ cần phát kết quả F25 |
| Realtime Sync | R06, MATCH/DF/SS | MATCH/DISCONNECT | RECONNECTING; AC-MAT/SS | Có; validation quyền tab còn trái nhau F01 |
| Disconnect/Reconnect | R09, DISCONNECT/SS | DISCONNECT | Trạng thái kết nối; AC-DIS | Thiếu nhánh WAITING F05; sơ đồ BOTH_OFFLINE lệch F09 |
| Inactivity | R17, INACTIVITY | INACTIVITY | PROMPT/COUNTDOWN; AC-INA | P0 F03/F04: timeline và reset qua reconnect |
| Resign/draw/undo | R13, GAME-ACTIONS | MATCH | CONFIRM/PROPOSAL; AC-ACT | Có; quyền thấy đề nghị trái nhau F11 |
| Player Chat | R10, CHAT | MATCH, mô tả REQ | CHAT; AC-CHT | Có; trước ván chưa rõ F06, tab cũ F01 |
| Spectator / shared chat | R10, CHAT/SPECTATOR | SPECTATOR | ROOM channel; AC-CHT | Mô hình cũ còn ở overview/flow F02 |
| Webcam | R11, MEDIA | MEDIA | MEDIA/TAB-SWITCH; AC-MED | Có; hậu điều kiện chuyển tab F08, thất bại F26 |
| Microphone/Voice | R11, MEDIA | MEDIA | Mức chia sẻ độc lập | Có; cùng F08/F26, không tự thêm ghi âm/phát cho SPECTATOR |
| AI Match | R12, AI | AI | AI-SETUP/GAME; AC-AI | Có 3 cấp, online/server; gate/test F20, deadline offline F29 |
| Match Result | R07, MATCH | MATCH | MATCH-RESULT | Có; thuật ngữ giải phóng ghế cần rõ F07 |
| Rematch | R14, HISTORY-REMATCH | MATCH | Phiếu tái đấu; AC-HIS | Thay người F07; deadline đúng hạn F16 |
| History/Replay | R14, HISTORY-REMATCH | Trong REQ | HISTORY/REPLAY | Có; đường xem lại cho SPECTATOR chưa khớp route F13 |
| Error Handling | Các EXC/BR + ISSUE-010 | Nhánh các FLOW | ACCESS-DENIED/retry | Có; thiếu điều kiện tiết lộ phòng F12 |
| Permissions | PERM + bảng từng REQ | Các flow | Giả mạo API/TS-AUTH | Nhiều bản chép trái nhau F01/F02/F11/F22 |
| Security BR | AUTH/INVITE/CHT/SPEC | AUTH/JOIN | ISSUE-133 | Có; role intent vs quyền server F15; không coi UI disabled là bảo vệ |
| Notifications | R02/R19/R17 và đề nghị | JOIN/INACTIVITY, REQ | NAVBAR/INBOX/PROMPT | Có thông báo theo tính năng; không tự thêm trung tâm thông báo chung |
| UX states / responsive | R15, SCR/DT | 9 flow | 34 ID, 5 state chung | Thiếu mapping từng màn và N/A có lý do F13 |
| Delivery / external setup | R16, DEP/TECH/138 issues | WORKFLOW | Acceptance evidence | Dependency/cổng không khả thi trọn chuỗi F17/F18/F19/F28 |
| Data retention | DM, CHAT/HISTORY | Trong REQ/DM | Lịch sử/chat | Có 30 ngày chat, giữ lịch sử; membership mới và chat cũ cần chốt F06/F07 |

**Không coi là thiếu:** guest, Elo, giải đấu, thanh toán, chuyển Host, đổi username/email, xoá tài khoản, chat bạn bè ngoài phòng, ghi âm/ghi hình, AI engine có sẵn — đã được loại khỏi phạm vi hoặc không được PO yêu cầu. Nếu muốn thay phạm vi phải có quyết định mới.

## 5. Finding Register

`P0`: chặn xác định/triển khai đúng flow cốt lõi. `P1`: ảnh hưởng đáng kể quyền, kiểm thử, kế hoạch hoặc UI. `P2`: làm rõ thuật ngữ/trình bày. **P0 finding không đồng nghĩa phải hỏi lại PO:** nếu DEC đã chốt, chỉ cần đồng bộ tài liệu ở vòng sau.

| ID | Mức | Loại chính | Nội dung | Hướng xử lý / câu hỏi |
|---|---|---|---|---|
| F01 | P0 | Mâu thuẫn | Quyền thao tác nhiều tab vừa cho vừa cấm | Đồng bộ DEC-020, không hỏi lại |
| F02 | P0 | Mâu thuẫn | Kênh chung vừa mở cho PLAYER vừa cấm | Đồng bộ DEC-018, không hỏi lại |
| F03 | P0 | Mơ hồ | Mốc hỏi, countdown, gia hạn không xác định một timeline | Q-AUD-01 |
| F04 | P0 | Khoảng trống | Reconnect liên tục có thể kéo dài lượt vô hạn | Q-AUD-02 |
| F05 | P0 | Khoảng trống | WAITING offline giữ ghế vô hạn, thiếu đường ra | Q-AUD-03 |
| F06 | P0 | Khoảng trống | Chat WAITING chưa có Match để gắn kênh | Q-AUD-04 |
| F07 | P0 | Mơ hồ | Ghế PLAYER/nhận người mới sau FINISHED chưa rõ | Q-AUD-05 |
| F08 | P1 | Mâu thuẫn | Chuyển media tab vừa phát tiếp vừa OFF | Q-AUD-06, vòng sau |
| F09 | P1 | Mâu thuẫn | BOTH_OFFLINE ngay vs sau grace trong sơ đồ | Đồng bộ BR-DIS-05/EXC-2 |
| F10 | P1 | Mâu thuẫn | Một người có được bấm ready hay không | Q-AUD-07, vòng sau |
| F11 | P1 | Mâu thuẫn | Người xem thấy đề nghị hay bị cấm thấy | Đối chiếu BR-ACT-18 và bảng quyền |
| F12 | P1 | Mâu thuẫn | Join trả phòng đầy/đóng trước khi kiểm quyền | Phân tầng lỗi theo quyền đã được chứng minh |
| F13 | P1 | Khoảng trống | UI states/đích hành động chưa đủ chi tiết | Bổ sung ma trận màn hình và flow dưới đây |
| F14 | P1 | Mơ hồ | Phạm vi phiên và ranh giới auth còn phụ thuộc diễn giải | Q-AUD-08, vòng auth sau |
| F15 | P1 | Mâu thuẫn | Join bắt buộc `role`, test lại cấm `role` | Chốt intent schema với quyền server |
| F16 | P1 | Mâu thuẫn | Tái đấu tại đúng hạn 10 phút cho kết quả trái nhau | Đồng bộ deadline và test |
| F17 | P1 | Mâu thuẫn | Cổng PASS yêu cầu hạ tầng/chức năng nằm ở issue sau | Sửa kế hoạch, không hạ cổng |
| F18 | P1 | Khoảng trống | Chuỗi phụ thuộc Google thật chặn local | Làm rõ dependency nghiệm thu external |
| F19 | P1 | Mâu thuẫn | Hai service AI/server vs tiến trình con IPC | Thiết kế triển khai cần thống nhất |
| F20 | P1 | Mơ hồ | Ngưỡng AI và điều kiện đo chưa truy vết đủ | Không tự chọn/hạ ngưỡng |
| F21 | P1 | Truy vết | ID/range/flow trong matrix không khớp nội dung | Kiểm theo BR/AC thực, không chỉ R-level |
| F22 | P1 | Trùng lặp | Quyền/tab/chat và số liệu có nhiều bản sao tự viết | Canonical + reference, giữ lịch sử |
| F23 | P2 | Thuật ngữ | Tên tự mâu thuẫn; giả định kỹ thuật viết như sự thật | Sửa lời giải thích, không đổi luật |
| F24 | P1 | Bằng chứng | Readiness cũ và số đếm không chứng minh trạng thái mới | Audit theo snapshot, không dùng bằng chứng v1 |
| F25 | P1 | Mâu thuẫn | Từ chối nước do hết giờ nhưng không gửi kết quả tới phòng | Tách rejection thuần với terminal mutation |
| F26 | P1 | Khoảng trống | Chuyển/thu hồi media thiếu hậu điều kiện khi thất bại | Q-AUD-09, vòng media sau |
| F27 | P1 | Mâu thuẫn | CHECK mẫu cho lọt PLAYER thiếu bên, trái test bắt buộc | Sửa mẫu theo invariant đã có; không hỏi lại nghiệp vụ |
| F28 | P1 | Mâu thuẫn | Cho phép hosting ngủ nhưng bắt mọi test always-on xanh | Q-AUD-11, vòng triển khai sau |
| F29 | P1 | Mơ hồ | AI offline: hết giờ trước 60 giây có còn xử thua? | Q-AUD-12, vòng AI sau |
| F30 | P1 | Mơ hồ | WATCH trực tiếp chưa rõ có đủ quyền vào CODE_ONLY | Q-AUD-13, vòng quyền xem sau |
| F31 | P1 | Mâu thuẫn | Thu hồi khi đổi privacy thiếu transition; đổi mã bị gộp với ẩn sảnh | Q-AUD-14 và đồng bộ ma trận transition |

**31 cụm:** 7 P0, 23 P1, 1 P2. Theo loại chính: 15 mâu thuẫn, 6 khoảng trống, 6 mơ hồ, 1 truy vết, 1 trùng lặp, 1 thuật ngữ, 1 bằng chứng. Backlog gồm 5 câu P0 và 9 câu P1; chỉ yêu cầu trả lời 5 câu P0 trong vòng này. Không cộng câu hỏi vào số finding.

## 6. Contradictions — bằng chứng và tác động

### F01 — DEC-020 chưa được truyền xuống toàn bộ tài liệu

Nguồn quyết định: [decision-log.md](../07-decisions/decision-log.md) `DEC-020`, và [session-state.md](../05-data-and-realtime/session-state.md) `SS-07`: mọi tab của cùng tài khoản được đi cờ/chat/đầu hàng/xác nhận.

Các câu phủ định còn sống: [actors.md](../00-overview/actors.md):192; [business-rules.md](../04-business-rules/business-rules.md):22,70; [data-model.md](../05-data-and-realtime/data-model.md):188; [data-flows.md](../05-data-and-realtime/data-flows.md):27,51,92; [REQ-CHAT.md](../01-requirements/REQ-CHAT.md):38,55,112; [REQ-GAME-ACTIONS.md](../01-requirements/REQ-GAME-ACTIONS.md):157–163. Ngay [REQ-INACTIVITY.md](../01-requirements/REQ-INACTIVITY.md):247 vẫn kiểm “đúng tab đang giữ thiết bị” cho xác nhận treo ván.

Hai team có thể viết hai bộ phân quyền trái nhau và đều viện dẫn tài liệu. **Đã có quyết định; không cần hỏi PO chọn lại một tab hay nhiều tab.** Ngoại lệ quyền phát camera/micro theo từng nguồn vẫn giữ.

### F02 — DEC-018 chưa được cập nhật vào mô tả quyền chat

[product-overview.md](../00-overview/product-overview.md):72 nói “Không bên nào đọc được kênh của bên kia”; [FLOW-SPECTATOR.md](../02-flows/FLOW-SPECTATOR.md) §2 vẫn giới hạn kênh cho người xem. [REQ-CHAT.md](../01-requirements/REQ-CHAT.md):14–15,137 và `DEC-018` cho cả hai PLAYER đọc/gửi kênh `ROOM`. [final-audit.md](final-audit.md) §6 vẫn khẳng định chủ phòng không được đọc.

Tác động là quyền riêng tư người xem và test quyền. Canonical hiện có đã chọn kênh chung; cần cập nhật các bản mô tả cũ, không thêm kênh thứ ba hoặc tái mở quyết định một cách ngầm định.

### F08 — Chuyển camera/micro: phát tiếp hay về Tắt

[REQ-MEDIA.md](../01-requirements/REQ-MEDIA.md):102,119,232,256 và `SS-19` yêu cầu **Tắt, bật lại thủ công**. Cùng file:128, [session-state.md](../05-data-and-realtime/session-state.md) `SS-13`/`AC-SS-06`, `DEC-021` lại nói tab cũ dừng rồi tab mới **bắt đầu phát**. Khi camera chuyển nhưng micro ở tab khác, quy tắc “cả hai Tắt” còn đụng tính độc lập từng nguồn.

Không tự chọn phương án vì có tác động quyền riêng tư. Vòng sau cần xác định trạng thái nguồn được chuyển, nguồn không chuyển, audience được giữ hay reset, và lần bấm chuyển có được tính là đồng ý phát không.

### F09 — Cả hai offline: chữ và sơ đồ khác thời điểm

[REQ-DISCONNECT.md](../01-requirements/REQ-DISCONNECT.md):66 ghi **ngay khi** xác định cả hai offline thì INTERRUPTED. Sơ đồ cùng file §12 và [state-machines.md](../05-data-and-realtime/state-machines.md) §5 đi qua nút “quá hạn” rồi mới kiểm đối thủ offline. Ví dụ A offline ở t=0, B ở t=10: xử ở t=10 hay t=60?

BR-DIS-05/EXC-2 đã nêu ý định rõ; sửa sơ đồ để biểu diễn sự kiện người thứ hai offline. Giữ BR-DIS-08: deadline hợp lệ đã đến trước không bị sự kiện phát hiện sau xoá đi.

### F10–F12 — Ready, quyền thấy đề nghị, lỗi join

- **F10:** [REQ-ROOM.md](../01-requirements/REQ-ROOM.md):103 cho một người bấm ready; :190 vô hiệu nút khi chưa đủ hai. Tách điều kiện **ghi ready** khỏi điều kiện **bắt đầu ván**; chưa tự chọn hành vi. Cùng file :71 cho đổi thời gian khi chờ, nhưng :89,132 chỉ reset ready khi đổi bên. B ready với 15 phút, Host đổi còn 5 phút rồi ready: B có phải xác nhận lại không?
- **F11:** [REQ-GAME-ACTIONS.md](../01-requirements/REQ-GAME-ACTIONS.md):163 cấm SPECTATOR thấy đề nghị; :221 `BR-ACT-18` cho thấy nhưng cấm trả lời. Recipient matrix trong data-flows cũng cho cả phòng. Bảng quyền và test phải chọn cùng một nghĩa; không gộp “thấy” với “trả lời”.
- **F12:** [FLOW-JOIN-ROOM.md](../02-flows/FLOW-JOIN-ROOM.md) §1 kiểm phòng/ghế và trả lỗi chi tiết trước kiểm quyền. Trong khi `BR-SPEC-03`, `BR-INV-13` yêu cầu không tiết lộ sự tồn tại khi không có quyền. Test `TS-AUTH-15`/`TS-REG-03` nói “mã phòng” chung còn có thể làm cấm nhầm PLAY vào LOCKED, dù LOCKED chỉ cấm WATCH. Phải ghi actor đã chứng minh quyền nào, loại vé nào, rồi mới chọn lỗi.

### F15–F19 — Đặc tả và backlog triển khai

- **F15:** [ISSUE-063.md](../10-issues/ISSUE-063.md):19 nhận `{roomId|code|token} + role`; [ISSUE-133.md](../10-issues/ISSUE-133.md):42 `T133-20` yêu cầu gửi `role` vào join phải từ chối. Chọn loại ghế mong muốn là **ý định**; tự cấp quyền là chuyện khác. Hợp đồng và test hiện chưa phân biệt. Cùng gốc: ISSUE-011:42 cho `ChatSendSchema.channel`, ISSUE-108:19,34 cấm client khai kênh và suy ra từ role, dù CHAT:54 cho PLAYER chọn một trong hai kênh. ISSUE-011 yêu cầu strict schema nhưng ISSUE-114:50 lại bỏ qua role giả thay vì từ chối. Quyền do server quyết định không loại bỏ ý định chọn đích hợp lệ của người dùng.
- **F16:** [REQ-HISTORY-REMATCH.md](../01-requirements/REQ-HISTORY-REMATCH.md):210 dùng đến **trước** hạn; [ISSUE-128.md](../10-issues/ISSUE-128.md):32,40 buộc tái đấu thắng **tại đúng** hạn. Kết quả không được phụ thuộc test đọc file nào.
- **F17:** `AGENTS.md`/WORKFLOW yêu cầu bốn cổng mọi PR; ISSUE-001 chưa thiết lập lint/unit, các công cụ đó nằm ở 002/003. ISSUE-051 yêu cầu thu hồi realtime/media thật khi gateway/media nằm ở 084/112 trở đi; ISSUE-098 cần các lệnh hoàn chỉnh ở 101/104/108/127. Đây là **thiếu dependency hành vi/định nghĩa PASS theo giai đoạn**, không phải kết luận đồ thị metadata có chu trình. Không dùng mock hoặc test bỏ qua để báo đạt.
- **F18:** [ISSUE-053.md](../10-issues/ISSUE-053.md) cần Google thật để DONE; 054 phụ thuộc 053, rồi 055/056/061 kéo theo phần lớn local. [deployment.md](../09-technical/deployment.md) `DEP-01` và EXTERNAL-SETUP lại nói external không chặn local. Chưa có đường hợp lệ để tiến tiếp nếu 053 là BLOCKED_EXTERNAL mà phụ thuộc bắt buộc DONE. Cần sửa cách phân rã/điều kiện phụ thuộc, không đánh đồng BLOCKED_EXTERNAL với DONE. EXTERNAL-SETUP:32,35–36 còn ghi Cloud/TURN/Supabase cloud/hai điện thoại chặn cổng **local** 112 và 040+, trái chính hướng dẫn local ở :161,178; dòng hai điện thoại còn trỏ nhầm ISSUE-119 là worker AI.
- **F19:** [EXTERNAL-SETUP.md](../10-issues/EXTERNAL-SETUP.md):201,338 mô tả server và AI là hai service; [ISSUE-118.md](../10-issues/ISSUE-118.md):23–31 lại dùng tiến trình con và IPC. Hai mô hình triển khai cần cầu nối thiết kế rõ; không đủ chỉ nói “tiến trình riêng”.

### F27–F28 — Mẫu ràng buộc và nghiệm thu triển khai

- **F27:** [ISSUE-037.md](../10-issues/ISSUE-037.md):30–31 cho `CHECK ((role = 'PLAYER' AND side IN ('RED','BLACK')) OR (role = 'SPECTATOR' AND side IS NULL))`, nhưng `T037-05` bắt PLAYER có side NULL phải bị CHECK từ chối. Với PLAYER/NULL, biểu thức nhận UNKNOWN, không phải FALSE; CHECK này không thể bảo đảm invariant đã nêu. Đây là phân tích tĩnh ngữ nghĩa mẫu SQL, **chưa chạy PostgreSQL**. Cần sửa mẫu để thể hiện invariant hiện có, không hỏi PO có muốn PLAYER không có bên.
- **F28:** [deployment.md](../09-technical/deployment.md) `DEP-05` chấp nhận giới hạn gói ngủ; [ISSUE-137.md](../10-issues/ISSUE-137.md):29,58 cho ghi hạn chế vào runbook, nhưng :51,54 bắt kết nối sống sau 20 phút và **đủ 11 test xanh**. Một ngoại lệ runbook không làm test này xanh. Q-AUD-11 cần chọn yêu cầu online có always-on hay không, sau đó viết AC phù hợp; không tự hạ ngưỡng. “Khôi phục ván” ở T137-10 cũng cần ghi rõ khôi phục kết quả **INTERRUPTED** theo ARCH-10, tránh hiểu là tiếp tục ván. Audit này không xác minh chính sách hiện thời của nhà cung cấp.

### F31 — Privacy transition thiếu và bị gộp sai

[REQ-ROOM.md](../01-requirements/REQ-ROOM.md):70,142 nói đổi kín hơn phải thu hồi; [REQ-SPECTATOR.md](../01-requirements/REQ-SPECTATOR.md):166 và ISSUE-066:26 chỉ liệt kê PUBLIC → CODE_ONLY/LOCKED, bỏ CODE_ONLY → LOCKED. Bảng còn nói có mã mới thì vào lại được, trong khi LOCKED cấm mọi WATCH. Cần ma trận đầy đủ theo cặp trạng thái, tránh suy từ một ví dụ trong ngoặc.

[FLOW-SPECTATOR.md](../02-flows/FLOW-SPECTATOR.md):129–136 gộp đổi PUBLIC → LOCKED với **đổi mã xem**, rồi đều làm phòng biến mất khỏi sảnh. Đổi mã không tự thay visibility trong REQ. Cần tách hai trigger; vé WATCH trực tiếp/link/code cũ bị thu hồi hay chỉ bị chặn trong lúc LOCKED là phần còn cần quyết định.

### F25 — Rejection có thể vẫn tạo kết quả ván

[data-flows.md](../05-data-and-realtime/data-flows.md) §2 bước⑤: hết giờ ⇒ kết thúc ván và từ chối nước đi. Nhưng đoạn “Nếu bị từ chối” nói B/người xem không nhận gì vì không có gì thay đổi. Trong nhánh hết giờ **đã có thay đổi kết quả**. Cần tách từ chối không đổi state khỏi từ chối kèm finalization, và nêu A/B/SPECTATOR đều nhận kết quả cuối. Chưa sửa sự kiện/API ở đợt này.

## 7. Major Gaps, Ambiguities và missing edge cases

### F03 — Không dựng được một timeline inactivity duy nhất

[REQ-INACTIVITY.md](../01-requirements/REQ-INACTIVITY.md):220–227 và [state-machines.md](../05-data-and-realtime/state-machines.md) §4 vẽ **Đang hỏi → 30 giây → Đang đếm ngược**. `AC-INA-05` lại xử thua sau 30 giây không xác nhận. `DEC-011` và REQ §9 khẳng định tối đa **9 phút 30 giây**; [ISSUE-102.md](../10-issues/ISSUE-102.md) cho xác nhận ở giây 29 rồi thêm 3 phút.

Nếu mỗi lần +3 phút tính từ lúc xác nhận và hai lần đều chờ29 giây, tổng là **10 phút28 giây** (180+29+180+29+180+30), không phải 9 phút30. Nếu cộng vào deadline chu kỳ cũ thì tổng khác. Chưa có test oracle duy nhất cho `promptAt`, `countdownAt`, `deadlineAt`. Xem Q-AUD-01.

### F04 — Reconnect tạo đường kéo dài vô hạn

REQ-INACTIVITY §7 EXC-2: mất mạng huỷ inactivity; reconnect trong 60 giây nhận lại 3 phút mới, giữ số lần gia hạn. R17 §1 nói ngăn cả người cố tình kéo dài vô hạn. Chuỗi khả dĩ: không đi nước → gần hết hạn thì ngắt → nối lại trước60 giây → lại 3 phút; lặp mà không dùng thêm gia hạn. Ngay cả khi gia hạn = 2, reset 3 phút vẫn tồn tại.

Đây là **suy luận từ các bước đã được đặc tả**, chưa là exploit được thực thi. Cần PO chọn giới hạn tổng theo lượt hay chấp nhận hệ quả; không tự thêm chế tài. Xem Q-AUD-02.

### F05 — WAITING giữ ghế không có thời hạn

[REQ-DISCONNECT.md](../01-requirements/REQ-DISCONNECT.md):51 giữ ghế khi chưa có ván, không đếm 60 giây. [REQ-ROOM.md](../01-requirements/REQ-ROOM.md) §5.5 chỉ xử lý **chủ động rời**; timer10 phút chỉ áp dụng FINISHED. Không thấy trigger giải phóng ghế WAITING khi Host hoặc PLAYER còn lại đóng hết tab và không quay lại.

Ngoài ra, nếu B đã ready rồi offline, A mới ready thì điều kiện “đủ hai người và cả hai ready” có bắt đầu ván không? ROOM và ISSUE-064 chưa nêu điều kiện online/reset ready tại thời điểm bắt đầu.

Không tự coi đóng tab là bấm Rời, không dùng60 giây của ACTIVE cho WAITING. Cần chốt TTL/đóng phòng/reset ready/thu hồi vé và người xem. Xem Q-AUD-03.

### F06 — Chat trước ván thiếu đối tượng và chính sách lịch sử

[REQ-CHAT.md](../01-requirements/REQ-CHAT.md):38 cho chat khi là thành viên/phòng chưa đóng; :50–56 nạp và gửi khi vào phòng. Nhưng :149 và [data-model.md](../05-data-and-realtime/data-model.md):170 gắn chat với **mỗi ván**; [REQ-ROOM.md](../01-requirements/REQ-ROOM.md):59–62 chỉ tạo ván sau hai ready.

WAITING chưa có `matchId`: chặn chat, có kênh trước ván hay tạo ván sớm? Nếu có chat và B rời trước khi bắt đầu, C thay ghế có được đọc riêng A–B không? Đây là quyết định sản phẩm/quyền riêng tư, không để schema tự quyết. Xem Q-AUD-04.

### F07 — FINISHED và thay người chơi

[REQ-MATCH.md](../01-requirements/REQ-MATCH.md):89,235 nói giải phóng ghế; [REQ-HISTORY-REMATCH.md](../01-requirements/REQ-HISTORY-REMATCH.md):32 cần cả hai vẫn là PLAYER để tái đấu. [ISSUE-089.md](../10-issues/ISSUE-089.md):33 chỉ xoá `active_players`, nên **không kết luận** phải xoá `room_members`; đây còn là lỗi thuật ngữ giữa khoá ván đang chơi và ghế phòng.

Điểm cần quyết định riêng: ROOM chỉ cấm join PLAYER khi PLAYING; `DEC-023` cho mã/link vào FINISHED; HIS:212 nói B rời rồi quay lại không còn PLAYER. Không rõ vé PLAY mới có cho B hoặc C vào ghế trống sau ván, tái đấu với Host, nhận kênh riêng/ván cũ hay không. Xem Q-AUD-05.

### F14 — Phiên và một số ranh giới auth chưa kiểm thử được độc lập

`DEC-007`, [REQ-AUTH.md](../01-requirements/REQ-AUTH.md):141 và `SS §2` dùng cả “chỉ sống trong tab” lẫn “đóng trình duyệt là mất”; bảng SS §1 lại ghi phạm vi cả tài khoản/mọi thiết bị. Cần phân biệt **một phiên**, **các tab dùng phiên**, **thiết bị**, **tất cả phiên**. Khi không ghi nhớ, đóng một tab nhưng browser/tab khác còn mở thì kết quả nào? “Mỗi lần dùng” gia hạn30 ngày là thao tác người dùng hay refresh/heartbeat tự động?

Ngoài ra, tài liệu có lỗi token hết hạn và giới hạn gửi lại email, nhưng chưa có thời hạn link xác minh/khôi phục hoặc con số gửi lại trong requirement; ISSUE-048/052 giao cho cấu hình nhà cung cấp. Không coi mặc định kỹ thuật chưa được ghi là quyết định PO. Trường hợp Google trùng email tài khoản **chưa xác minh**, Google-only xin mật khẩu, callback sau phiên/link mời hết hạn cần kết quả và UX tường minh. Đây là backlog vòng auth, không đòi thêm tính năng ngoài phạm vi.

### F20 — Ngưỡng AI và thông số đo

Phân biệt: ngân sách tìm kiếm 300/1000/3000 ms; cổng sớm depth6 trong3000ms; tổng độ trễ người dùng; và chất lượng nước đi. [ISSUE-033.md](../10-issues/ISSUE-033.md):51 thêm HARD ≥16/20; cần chỉ rõ nguồn quyết định, bộ đáp án, seed và lịch sử lặp của fixture. Một snapshot bàn cờ không đủ kiểm quyết định tránh hoà lặp nếu không kèm lịch sử. `TS-AI-02` dùng “biên độ nhỏ”; các issue/TECH phải được liên kết tới **đúng ngưỡng và cùng phép đo**, không suy ra mọi ngưỡng là một.

ISSUE-032:54–56 thêm `completedDepth` đạt ở **ít nhất 90%** số lần chạy; TECH-08 mô tả p95 hoàn thành độ sâu trong ngân sách nhưng chưa dẫn nguồn cho tỷ lệ 90%. Hai đại lượng không đồng nghĩa. Cần chốt định nghĩa phép đo và nguồn phê duyệt của cả 90% lẫn 16/20 (Q-AUD-10).

Không kết luận AI đạt/không đạt, không chạy benchmark, không sửa threshold. Các cổng32/112 là **chưa được thực thi**, khác với thiếu quyết định nghiệp vụ.

### F26 — Media khi thao tác không hoàn tất

`SS-13`, `BR-MED-20` đòi tab cũ dừng trước tab mới phát, nhưng chưa có hành vi khi tab cũ treo/ngoại tuyến không xác nhận; tab mới bị từ chối quyền/không có thiết bị sau khi tab cũ đã dừng; hai thiết bị khác nhau của cùng tài khoản; một tab chỉ nhận bị mất kết nối trong khi tab phát vẫn online. Không tự suy ra reset cả tài khoản hoặc tự khôi phục mức cũ.

`BR-MED-12`/`AC-MED-13` nói “ngay”, trong khi REQ-MEDIA §11 không hứa tức thời bất kể mạng; cần định nghĩa thời điểm bắt đầu/kết thúc thu hồi, luồng cũ/luồng mới, điều kiện APPLIED và timeout/failure UI. Yêu cầu fail closed đã có; thiếu kết quả người dùng quan sát và oracle thời gian. Không giả định hạ tầng phân tán có thể đảm bảo dừng tức thời ở mọi máy.

### F29–F30 — Hai nhánh điều kiện chưa được diễn đạt thống nhất

- **F29:** [REQ-AI.md](../01-requirements/REQ-AI.md):82,113 và FLOW-AI:148 nói offline quá 60 giây thì gián đoạn, không thua. [REQ-CLOCK.md](../01-requirements/REQ-CLOCK.md):62,64 nói đồng hồ vẫn chạy, áp dụng cả ván AI; flow AI cũng có nhánh hết giờ → thua. Người thật còn 20 giây, mất mạng 70 giây: TIMEOUT tại giây 20 hay được miễn? Luật deadline trước có gợi ý cách phân xử, nhưng AC-AI-08/AC-DIS-15 đang thiếu điều kiện “chưa có kết quả trước đó”; cần xác nhận và đồng bộ, không tự thêm pause clock.
- **F30:** [REQ-INVITE.md](../01-requirements/REQ-INVITE.md):136 cho cả ba cách trực tiếp/link/mã có PLAY/WATCH; REQ-SPECTATOR:64 lại bắt CODE_ONLY có **mã hoặc link**. Lời mời WATCH trực tiếp hợp lệ có đủ quyền vào không, hay người nhận phải cung cấp thêm mã? Cần trả lời trước khi viết cùng một guard cho ba đường vào. LOCKED vẫn cấm WATCH theo quyết định hiện có.

## 8. Missing User Flows, Screens và States

Không yêu cầu thêm page chỉ để đủ checklist. Có thể mô tả ngay tại REQ/SCR đang có, nhưng mỗi hành vi phải có trigger, kết quả và đường lỗi.

| Điểm cần bổ sung/đối chiếu | Bằng chứng hiện có | Phần còn thiếu |
|---|---|---|
| WAITING mất kết nối | DISCONNECT ALT-3 | Host/PLAYER offline → hết hạn/khôi phục → ghế/phòng/ready/vé/chat; F05 |
| Chat trước ván | CHAT precondition vs DM thuộc ván | UI enabled/disabled và lịch sử khi đổi người; F06 |
| FINISHED nhận PLAYER mới | ROOM/HIS/DEC-023 | Allow/deny theo vé, state tiếp theo, kênh riêng cũ; F07 |
| Đổi ghế/bên trước ván | ROOM ALT-2, BR-ROOM-06 | Ai đề nghị/đồng ý, trạng thái chờ/hủy, deadline, màn điều khiển; hiện chỉ có hậu quả reset ready |
| Replay cho SPECTATOR | PERM §9 cho xem ván hiện tại trong phòng | SCR-REPLAY tại `/history/:id` chỉ cho người chơi; cần phân biệt replay trong phòng với lịch sử riêng |
| Modal inactivity | SCR chặn đóng; REQ cho đi nước/đầu hàng | Modal có chặn bàn/nút đầu hàng không; focus/đường thao tác nào vẫn dùng được |
| Modal đóng bằng X/Esc/outside | SCR-RULE-02 | Đóng UI có rút đề nghị/huỷ tác vụ hay giữ pending? Không suy ra đóng hộp thoại = từ chối hoà |
| 34 màn × 5 states | SCR §3 có luật chung | Mapping cụ thể/N/A có lý do cho từng màn, không chỉ câu “mọi màn có đủ” |
| Media chuyển nguồn thất bại | TAB-SWITCH/SM-TAB | STOPPING/WAITING/ERROR/timeout và retry; F08/F26 |
| Auth callback/session | AUTH/FLOW-AUTH | Đích trở về sau onboarding/xác minh, close-tab policy, token/provider failure; F14 |
| Quá hạn trong lúc xử lý lệnh | DF §2 | Broadcast kết quả tới mọi client dù lệnh đi bị từ chối; F25 |

Ma trận trạng thái Room hiện có: WAITING → PLAYING → FINISHED → CLOSED; FINISHED → PLAYING qua tái đấu. Match: ACTIVE → FINISHED hoặc INTERRUPTED. **Không tự thêm PAUSED/STARTING/READY state** theo ví dụ trong brief; chỉ ghi khoảng trống ở transition thực tế.

## 9. Duplicate Information, Terminology, Traceability và misplaced documents

### F21–F22 — Một dòng matrix không thay cho truy vết hành vi

[traceability-matrix.md](traceability-matrix.md):15 gán R02 bạn bè cho FLOW-AUTH, dù FLOW-AUTH không mô tả vòng đời kết bạn. Nhiều range dừng trước luật bổ sung (`BR-LOB-09/10`, `BR-BRD-15`, `BR-SPEC-17/18`, `DT-21`); R16 có “—” cho flow/screen nhưng vẫn kết luận19/19 đủ5 khâu. R16 có thể hợp lệ với N/A, cần giải thích thay vì tuyên bố đủ mọi khâu.

[acceptance-criteria.md](../06-acceptance/acceptance-criteria.md) §4 diễn giải `AC-SS-02` là chuyển thiết bị, trong khi nguồn SS định nghĩa mọi tab thao tác; tổng286 không bằng289 hiện tại. Đây là lỗi mapping, không chỉ lỗi cộng.

Hai cụm trùng lặp có tác động:

1. **Quyền/chat/tab/state:** glossary, actors, overview, scope, PERM, BR index, REQ, FLOW, DM/DF/SM, AC và issue cùng tự viết lại câu quy định. F01/F02 là lệch thực tế do nhiều bản sao.
2. **Readiness/số liệu:** root README, docs README, ONBOARDING, final-audit, inventory site và issue bàn giao giữ các snapshot khác nhau.

Đề xuất canonical (chưa thực hiện): DEC giữ nguồn quyết định; REQ định nghĩa hành vi module; GR định nghĩa luật cờ; PERM định nghĩa quyền có điều kiện; SM/DF dẫn đến BR; các chỉ mục tóm tắt có link tới ID. Không xoá nhắc lại có ích trong UX; phải phân biệt giải thích với một định nghĩa chuẩn thứ hai.

### F23 — Thuật ngữ và WHAT/HOW

- Glossary §5 vừa định nghĩa “tab đang giữ thiết bị/chuyển thiết bị” vừa cấm chính các cụm ấy; §6/§12 và DEC-018 có câu đổi “kênh chung” thành “kênh chung”. Có dấu vết thay từ hàng loạt làm mất nghĩa.
- `data-model` vẫn có thực thể quyền điều khiển tab dù DEC-020 bỏ; “ghế” dùng lẫn membership phòng với khoá tham gia ván đang chạy; cần thuật ngữ riêng, không tự đổi schema.
- `GR-END-01` nói hết nước thua khác cờ tướng tiêu chuẩn; `DEC-019` giải thích giữ THUA vì đúng luật cờ tướng. Audit chỉ xác nhận **hai giải thích nội bộ khác nhau**, không dùng nguồn ngoài để thay bộ luật đã chọn.
- “Một webcam không chia được cho hai tab” trong SS/DEC được dùng như chân lý phần cứng không có điều kiện thiết bị/trình duyệt. Yêu cầu một nguồn phát đã được quyết; nên ghi thành chính sách sản phẩm và ràng buộc thiết kế có kiểm chứng, không phụ thuộc một khẳng định tuyệt đối.
- Không tìm thấy tên thư viện chính như Supabase/LiveKit/Prisma/Socket.IO trong16 REQ bằng lượt quét từ khoá đã thực hiện. Điều này **không chứng minh** tách WHAT/HOW hoàn toàn: GR-SAFE-04 quy định thuật toán, issue auth giao chính sách retry/expiry cho cấu hình nhà cung cấp. Ràng buộc AI tự viết/thuật toán học thuật đã được quyết là phạm vi hợp lệ, không tự loại bỏ chỉ vì có thuật ngữ kỹ thuật.

### F24 — Báo cáo cũ, lịch sử và readiness

`final-audit.md` vẫn dùng snapshot53 file/278 AC, nói không còn câu hỏi nhưng cuối khuyến nghị còn yêu cầu trả lời3 P2; mục chat/tab giữ nghĩa cũ. `open-questions.md` đầu ghi Q003/Q005/Q006 OPEN dù DEC006/007/008 đã Accepted; cuối lại nói không còn mở. `proposed-structure.md` còn “chờ duyệt” dù DEC017 đã chốt.

Không đánh dấu quyết định đã có thành chưa có để hỏi lại. Tách trạng thái lịch sử với backlog mới; không ghi đè audit cũ. README archive/ISSUE-138 ghi100/101 file không trùng102 file Markdown hiện có; **không xoá file để khớp số cũ**. Tham chiếu code/repo/CI v1 là bằng chứng lịch sử có giới hạn, không phải PASS cho rebuild.

Archive README nói các báo cáo đều là baseline số thật, nhưng chính [final-coverage.md](../99-archive/test-reports-v1/final-coverage.md):27 và [PROGRESS.md](../99-archive/handoff-v1/PROGRESS.md):76 bác bỏ một số số đo v1. Review F17 và REMEDIATION lịch sử còn dùng hệ toạ độ ngược với DEC-003; cần cảnh báo tại lối vào archive, **không sửa lịch sử thành yêu cầu mới**. ISSUE-015 v1 chỉ có smoke scope nhưng tick checklist gameplay; ISSUE-032 v1 tuyên bố sẵn sàng cloud trong khi STAGING còn NOT RUN. Inventory ghi nguồn cụ thể cho từng file.

[site/_analysis/QC-REPORT.md](../../site/_analysis/QC-REPORT.md) kết luận rộng hơn phép đo: không tràn mobile trên 5 loại trang không chứng minh toàn bộ trang, kiểm màu không chứng minh toàn bộ WCAG AA; các chế độ file://, Safari/Firefox, reader/print còn chưa thử. Chưa so payload site với Markdown nên **không kết luận site hiện đã stale**. Ngoài ra REQ-LOBBY:149 còn nói đổi nhãn khi ván kết thúc, trái DEC-023 và chính :85,183 yêu cầu bỏ FINISHED khỏi sảnh.

`site` nhúng bản Markdown qua build; sau một đợt cập nhật đã được duyệt cần sinh lại và kiểm nội dung, tránh website tiếp tục quảng bá readiness cũ. Đợt này chưa rebuild site vì chỉ tạo báo cáo audit, chưa sửa bộ đặc tả.

## 10. Question Backlog — chưa có câu trả lời mới

Namespace mới `Q-AUD-*` để không trùng Q001–019 đã có. Tất cả **OPEN**. Đợt này chỉ hỏi **5 câu P0 vòng Room/Match lifecycle** dưới đây. Chín câu P1 được giữ cho vòng sau; không mặc định trả lời thay PO.

### Q-AUD-01 — Timeline treo ván chính xác · P0

**Related Feature:** R17, F03. **Current documentation says:** hỏi ở 180 giây; sơ đồ chờ30 giây rồi countdown; AC xử thua sau 30 giây; tổng tối đa9 phút30. **Problem:** có ít nhất hai thời điểm thua và hai cách cộng gia hạn. **Why this matters:** QA không có một đáp án thời gian duy nhất.

**Options:** A. Hộp hỏi và countdown dùng **chung30 giây**, mỗi lần xác nhận cộng180 giây vào **mốc hết chu kỳ3 phút trước đó**, giữ giới hạn9 phút30. B. Chung30 giây nhưng180 giây mới tính **từ lúc bấm xác nhận**, chấp nhận tổng dài hơn9 phút30. C. Hỏi và countdown là hai giai đoạn riêng; PO cần nêu số giây mỗi giai đoạn và cách gia hạn.

**BA Recommendation — chưa phải quyết định:** A để giữ trần đã ghi; cần diễn đạt lại “được thêm 3 phút” để người bấm muộn không hiểu sai.

**Decision needed from PO:** A/B/C; nếu C ghi timeline tuyệt đối. Ví dụ không xác nhận từ đầu thì thua tại **3:30 hay4:00**? Xác nhận tại3:29 thì cảnh báo kế tiếp ở **6:00 hay6:29**?

### Q-AUD-02 — Reconnect có được gia hạn lượt không · P0

**Related Feature:** R09/R17, F04. **Current documentation says:** reconnect reset 3 phút, giữ số gia hạn. **Problem:** có thể lặp mất/nối trước60 giây để không đi nước mãi. **Why this matters:** phá mục tiêu chống cố tình treo ván ở chế độ mặc định.

**Options:** A. Giữ thời hạn/ngân sách của lượt qua reconnect, reconnect không tặng thêm thời gian; cần dùng timeline Q-AUD-01. B. Cho reset có giới hạn theo mỗi lượt; PO chọn số lần/tổng thời gian. C. Giữ reset không giới hạn, ghi rõ tính năng chỉ xử lý không phản hồi liên tục và chấp nhận lỗ hổng này.

**BA Recommendation — chưa phải quyết định:** A; giữ60 giây grace riêng, nhưng phải chốt cách ưu tiên deadline khi cả grace và inactivity đã đến. Không tự sửa DEC016.

**Decision needed from PO:** A/B/C và nguyên tắc giữa60 giây reconnect với ngân sách lượt.

### Q-AUD-03 — Người chơi offline trong phòng WAITING · P0

**Related Feature:** R03/R09, F05. **Current documentation says:** giữ ghế, không đếm 60 giây; Host chủ động rời thì đóng phòng. **Problem:** Host/PLAYER biến mất có thể giữ phòng/ghế mãi. **Why this matters:** người còn lại và lời mời mới không có flow phục hồi rõ.

**Options:** A. Có thời hạn offline: hết hạn Host thì đóng phòng; hết hạn PLAYER còn lại thì giải phóng ghế và reset ready. B. Giữ ghế vô hạn, người còn lại phải chủ động rời/tạo phòng mới. C. Dùng thời hạn chung của phòng chờ; khi hết thì đóng cả phòng.

**BA Recommendation — chưa phải quyết định:** A;60 giây là giá trị có thể cân nhắc để thống nhất trải nghiệm, **chưa phải yêu cầu**.

**Decision needed from PO:** A/B/C; nếu A/C, thời hạn bao nhiêu và có giữ lời mời còn hạn cho ghế vừa giải phóng không? Nếu B đã ready rồi offline, A ready sau đó thì ván có được bắt đầu, hay phải chờ B online/xác nhận lại?

### Q-AUD-04 — Chat khi chưa bắt đầu ván · P0

**Related Feature:** R10/R03, F06. **Current documentation says:** thành viên phòng chưa đóng được chat, nhưng mọi tin thuộc Match chỉ tạo sau ready. **Problem:** WAITING không có đối tượng lưu/kênh chuẩn. **Why this matters:** ảnh hưởng cách người chơi giao tiếp và dữ liệu riêng khi thay đối thủ.

**Options:** A. Chưa có ván thì chat vô hiệu, UI giải thích; bắt đầu ván mới có hai kênh. B. Có chat phòng chờ riêng, kết thúc/đặt lại khi ván bắt đầu hoặc PLAYER thay đổi. C. Chat xuyên từ WAITING vào ván; PO cần quyết định người vào sau có đọc lịch sử nào.

**BA Recommendation — chưa phải quyết định:** A phù hợp nhất với mô hình mỗi Match hiện có; nếu cần hẹn giờ/sẵn sàng qua chat thì chọn B và đặc tả quyền lịch sử.

**Decision needed from PO:** A/B/C; nếu có chat, C thay B được đọc tin riêng A–B hay không?

### Q-AUD-05 — FINISHED có nhận PLAYER thay thế không · P0

**Related Feature:** R03/R14/R10, F07. **Current documentation says:** giữ10 phút tái đấu; B rời/quay lại không còn PLAYER; chỉ cấm join PLAYER khi PLAYING. **Problem:** chưa rõ vé PLAY mới có được vào ghế trống sau ván. **Why this matters:** quyết định đường tái đấu, danh tính đối thủ, giữ ghế và bảo mật chat/replay cũ.

**Options:** A. FINISHED chỉ hai PLAYER vẫn ở lại được tái đấu; không nhận PLAYER mới; muốn thay người phải tạo phòng mới. B. B cũ có thể vào lại bằng PLAY mới, người khác không được. C. Nhận cả PLAYER mới; cần xác nhận hai bên và tạo Match/kênh mới, không tự trao lịch sử riêng cũ.

**BA Recommendation — chưa phải quyết định:** A, phù hợp nhất với HIS edge case hiện có và ít phát sinh quyền đọc lịch sử.

**Decision needed from PO:** A/B/C; xác nhận “giải phóng ghế khi kết thúc” là giải phóng khoá ván đang chạy, còn membership phòng được giữ tới rời/đóng.

### Câu P1 đã ghi nhận, chưa yêu cầu trả lời trong vòng này

| ID | Related / tài liệu hiện nói | Vấn đề / tác động | Options | BA recommendation, chưa quyết định | PO cần chốt |
|---|---|---|---|---|---|
| Q-AUD-06 | R11, F08; chuyển rồi phát vs OFF | Hậu điều kiện riêng tư trái nhau | A chuyển quyền rồi OFF; B bấm chuyển đồng thời đồng ý phát nguồn đó | A giảm bất ngờ, nhưng DEC021 hiện gợi ýB; cần PO chọn | Camera/mic/audience nào giữ, nào reset |
| Q-AUD-07 | R03, F10; solo ready vừa cho vừa disable | Thao tác/auto-start khác nhau | A cho ghi ready một người; B chỉ bật khi đủ hai | A theo EXC hiện tại, không tự chốt | Điều kiện ready và reset khi cấu hình đổi |
| Q-AUD-08 | R01, F14; tab/browser/session lẫn nhau | Đăng nhập trên máy chung và TTL không có oracle | A phiên tạm theo tab; B phiên tạm chung browser | Ghi chính xác vòng đời; không dựa mặc định SDK | Close-tab, browser restore, gia hạn bởi hoạt động nào; auth boundary còn thiếu |
| Q-AUD-09 | R11, F26; stop-before-start nhưng tab cũ không phản hồi | Không có đường ra/lỗi rõ khi thu hồi thất bại | A từ chối chuyển tới khi xác nhận dừng; B thu hồi tại server rồi cho chuyển khi xác nhận hạ tầng | Chỉ cho chuyển khi đã chứng minh thu hồi; giới hạn thời gian cần chốt | Timeout, fallback, UI, phạm vi nhiều thiết bị |
| Q-AUD-10 | R12, F20; TECH-08 vs ISSUE-032/033 | 90% độ sâu, 16/20 nước đúng và biên độ chưa có nguồn nhất quán | A dẫn quyết định đã có; B chốt rõ tiêu chí bổ sung | Giữ ngân sách, định nghĩa oracle và lịch sử fixture trước đo | Định nghĩa p95/độ sâu, ngưỡng chất lượng, biên độ áp dụng |
| Q-AUD-11 | R16, F28; free sleep vs 11 test xanh | Không thể PASS cùng lúc theo hai cách viết | A chấp nhận sleep và nghiệm thu interruption; B yêu cầu always-on | A theo DEP-05/TECH-11 hiện có; không tự thay test | Yêu cầu online và ngân sách do PO cấp |
| Q-AUD-12 | R08/R09/R12, F29; AI offline không thua vs clock tiếp tục | Kết quả ván khác nhau với deadline đến trước grace | A TIMEOUT trước vẫn thua; B miễn khi offline và quy định ngoại lệ đồng hồ | A theo luật deadline đến trước; cần xác nhận phạm vi AI | Còn 20 giây, offline 70 giây: kết quả và thời điểm |
| Q-AUD-13 | R04/R19, F30; CODE_ONLY chỉ mã/link vs WATCH trực tiếp | Lời mời hợp lệ chưa rõ đủ quyền | A direct WATCH đủ; B phải thêm mã/link và UI hướng dẫn | A phù hợp ba đường đã đặc tả | Quyền của lời mời WATCH trực tiếp còn hạn |
| Q-AUD-14 | R03/R04, F31; đổi kín hơn vs danh sách hai transition | Có thể còn người xem/vé cũ sau đổi privacy | A thu hồi mọi vé WATCH cũ khi kín hơn; B vé bị chặn khi LOCKED nhưng còn hạn sau mở | Thu hồi membership theo luật đã có; vòng đời từng loại vé cần chốt | CODE_ONLY → LOCKED, mở lại, direct/link/code cũ |

**Không hỏi lại:** 5 SPECTATOR (`DEC-005`), guest (`DEC-006`), hộp thư (`DEC-008`), kênh chung (`DEC-018`), hết nước là THUA (`DEC-019`), mọi tab thao tác (`DEC-020`). Brief đính kèm lặp ví dụ “2 spectator/kênh riêng spectator”; chính DEC005/018 đã ghi việc thay các nội dung cũ đó. Audit ghi nhận độ lệch của brief, không dùng nó để âm thầm đảo đặc tả; nếu PO muốn thay phạm vi hiện hành cần nói rõ trong câu trả lời.

## 11. Initial Recommendations và điều kiện qua vòng sau

1. Trả lời5 P0 tại §10; ghi quyết định mới với ngày, context, phạm vi và ID ảnh hưởng. Chưa đánh RESOLVED khi chưa có câu trả lời.
2. Đồng bộ các quyết định đã Accepted trước: DEC018/020 qua overview→REQ→FLOW→PERM→DM/SM/DF→AC→issue. Chỉ khi vòng cập nhật được thực hiện mới đóng F01/F02.
3. Làm rõ các hành vi giao nhau; bổ sung AC biên thời gian đúng bằng deadline, retry/lost-ack, nhiều tab và thu hồi quyền theo từng client.
4. Chỉnh dependency/test oracle để một issue có thể đạt PASS đúng thứ tự bằng dịch vụ thật; không sửa ngưỡng chỉ để báo xanh.
5. Giữ cấu trúc00–10 hiện tại trong giai đoạn này. Sau khi P0 được giải quyết, đề xuất tinh chỉnh điều hướng/canonical, rồi mới tổ chức lại nếu thực sự cần.
6. Cuối cùng audit lại **bản đã cập nhật**, tính lại coverage và kiểm mỗi finding bằng bằng chứng. Chưa gọi vòng này là final audit.

**Dừng tại Phase1, chờ PO.** Chưa cập nhật decision/requirement, chưa reorganize, chưa implement, chưa dùng số đo v1 để chứng minh rebuild.
