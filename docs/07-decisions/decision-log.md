# DECISION LOG

Ghi nhận các quyết định của Product Owner trong quá trình audit BA. Mỗi quyết định có ID ổn định, được tham chiếu từ requirement/flow/screen tương ứng.

**Nguồn gốc:** `docs/planning/PHONG_VAN_YEU_CAU.md` (Câu 1–24, giai đoạn 2026-09-12) là decision record gốc — xem `DEC-000`. Các DEC từ `DEC-001` trở đi là quyết định phát sinh trong các vòng BA audit; ngày và phạm vi được ghi riêng tại từng record.

**Trạng thái hợp lệ:** `Accepted` (đã chốt) · `Superseded` (bị thay bởi DEC khác) · `Pending` (chờ PO xác nhận).

---

## DEC-000 — Biên bản phỏng vấn gốc là decision record của 24 quyết định nền

**Date:** 2026-09-12 · **Status:** Accepted

**Context:** `PHONG_VAN_YEU_CAU.md` chứa 24 câu hỏi–trả lời đã chốt toàn bộ nền tảng nghiệp vụ (mục tiêu, công nghệ, AI tự viết, sức chứa, media, luật, đồng hồ, mất mạng, auth, kết bạn, undo, UI, thiết bị, phạm vi, cấp AI, quyền tự quyết).

**Decision:** Giữ nguyên làm decision record chính thức. Gán ID `DEC-000-Q01` … `DEC-000-Q24` tương ứng Câu 1–24 để traceability, **không sửa nội dung**.

**Affected:** R01–R16, toàn bộ `docs/specs/`.

---

## DEC-001 — `XIANGQI-Design` là nguồn tài liệu chính thức để xây dựng lại dự án

**Date:** 2026-09-21 · **Status:** Superseded by `DEC-049` on 2026-09-25 · **Resolves:** Q-001, Q-007

**Context:** Tồn tại hai thư mục: `XIANGQI/` (có mã nguồn, git HEAD `332ae5b`, docs giống hệt từng byte) và `XIANGQI-Design/` (chỉ docs, không phải git repo). Tài liệu tự mâu thuẫn về trạng thái: `docs/README.md` nói "chưa có mã ứng dụng", `PROGRESS.md` nói "LOCAL_COMPLETE, 482 test PASS".

**Decision:**
1. `XIANGQI-Design/` là **nguồn tài liệu chính thức (canonical)**. Mọi thay đổi tài liệu viết vào đây.
2. Mục tiêu của bộ tài liệu: **thiết kế lại toàn bộ để xây dựng lại dự án từ đầu (rebuild)**, không phải để mô tả mã nguồn hiện có.
3. Tiêu chuẩn đầu ra: thành viên khác (developer / QA / designer) đọc được và hiểu **toàn bộ dự án** — từng chức năng, từng màn hình, từng luồng dữ liệu.
4. `XIANGQI/` (mã nguồn + docs cũ) chuyển thành **tham chiếu lịch sử**. Mã nguồn hiện có là nguồn tham khảo, **không phải source of truth**.
5. Toàn bộ `docs/handoff/PROGRESS.md`, `docs/reviews/`, `docs/test-reports/` phản ánh **lần build trước**, không phải trạng thái của bộ tài liệu mới.

**Affected Requirements:** toàn bộ
**Affected Screens:** toàn bộ
**Affected Business Rules:** không đổi BR nào; đổi vai trò tài liệu

**Hệ quả bắt buộc:** trạng thái bộ tài liệu mới bắt đầu lại từ `DESIGN_IN_PROGRESS`. Không được dùng evidence của lần build trước làm bằng chứng cho bản rebuild.

---

## DEC-002 — Luật chống treo ván: cảnh báo 3 phút → xác nhận → đếm ngược 30 giây

> **Làm rõ ngày 2026-09-22:** `DEC-026` xác nhận hộp thoại và đếm ngược bắt đầu đồng thời ở phút thứ 3; không có một khoảng chờ riêng trước đếm ngược. Giữ nội dung record gốc dưới đây để truy vết.

**Date:** 2026-09-21 · **Status:** Accepted · **Chi tiết đã chốt ở:** `DEC-010`…`DEC-013`, `DEC-016` · **Resolves:** Q-002 (BA-G-01)

**Context:** Time control mặc định là **không giới hạn**. R09 chỉ xử lý mất kết nối (grace 60s). Một người chơi vẫn online nhưng không đi nước làm ván treo vô thời hạn; đối thủ chỉ có thể đầu hàng hoặc chờ mãi, đồng thời bị khoá không tạo được phòng khác hay chơi AI.

**Decision:**
1. Nếu bên đến lượt **không đi nước trong 3 phút**, hệ thống hiện hộp thoại xác nhận trên màn hình của người đó: *"Bạn còn trong ván đấu không?"*
2. Người chơi **xác nhận** → được cộng thêm **3 phút** để đi nước.
3. Người chơi **không xác nhận** → bắt đầu đếm ngược **30 giây**.
4. Hết 30 giây không xác nhận → **đối thủ thắng**.

**Affected Requirements:** R08 (đồng hồ), R09 (mất mạng), và một requirement **mới** cho luật chống treo ván.
**Affected Screens:** Game Room / Chess Board (hộp thoại xác nhận + đồng hồ đếm ngược cho cả hai phía).
**Affected Business Rules:** thêm BR mới về inactivity; tương tác với BR timeout và BR disconnect grace.

**Chi tiết đã chốt (Round 2):** `DEC-010` chỉ áp dụng ván không giới hạn · `DEC-011` tối đa **2 lần gia hạn liên tiếp**, reset khi đi được một nước · `DEC-012` không áp dụng ván với máy · `DEC-013` đối thủ và người xem đều thấy · `DEC-016` nguyên nhân `INACTIVITY`, va chạm với mất kết nối, mốc thời gian do máy chủ.

---

## DEC-003 — Quy ước toạ độ bàn cờ lấy theo SPEC (không theo mã nguồn cũ)

**Date:** 2026-09-21 · **Status:** Accepted · **Resolves:** Q-008 (BA-C-02, finding F-17)

**Context:** `docs/specs/07` và `08` đặt BLACK ở y=0 (trên) và RED ở y=9 (dưới). Mã nguồn cũ (`packages/game-rules/src/initial.ts`) làm ngược lại: RED y=0..4, BLACK y=5..9. Finding F-17 đã ghi nhận nhưng đóng bằng ghi chú, không sửa.

**Decision — quy ước canonical:**

| Mục | Giá trị |
|---|---|
| Hệ toạ độ | `(x, y)` zero-based; `x` 0..8 (9 cột), `y` 0..9 (10 hàng) |
| Chiều trục y | **Tăng từ trên xuống dưới** (giống toạ độ màn hình/SVG) |
| `y = 0` | Hàng trên cùng = **hàng cuối của BLACK** (BLACK ở trên) |
| `y = 9` | Hàng dưới cùng = **hàng cuối của RED** (RED ở dưới) |
| Nửa sân BLACK | `y` 0..4 |
| Nửa sân RED | `y` 5..9 |
| Sông | giữa `y = 4` và `y = 5` |
| Cung BLACK | `x` 3..5, `y` 0..2 |
| Cung RED | `x` 3..5, `y` 7..9 |
| Tốt RED đã qua sông | khi `y ≤ 4` |
| Tốt BLACK đã qua sông | khi `y ≥ 5` |
| Board index | `y * 9 + x`, mảng đúng 90 phần tử |
| Bên đi trước | **RED** |

**Kiểm chứng đã thực hiện (review tay, 2026-09-21):** cả hai fixture terminal trong `08-TEST-EXECUTION.md` **đúng luật cờ** theo quy ước này:
- **F-MATE** — BLACK GENERAL(4,0); RED GENERAL(4,9), PAWN(4,5), ROOK(3,2), ROOK(4,2), ROOK(5,2), BLACK đi. Xe (4,2) chiếu tướng đen qua (4,1) trống. Ba đường thoát (3,0)/(5,0)/(4,1) lần lượt bị xe (3,2)/(5,2)/(4,2) khống chế. Không có quân đen nào khác. Tướng đối mặt bị chặn bởi (4,2) và (4,5). ⇒ **CHECKMATE, winner RED** ✔
- **F-STALEMATE** — BLACK GENERAL(4,0); RED GENERAL(4,9), PAWN(4,5), ROOK(3,1), ROOK(5,1), BLACK đi. Tướng đen không bị chiếu. (3,0) bị xe (3,1) khống chế; (5,0) bị xe (5,1); (4,1) bị cả hai xe trên hàng 1. ⇒ **STALEMATE, winner RED** (theo luật giản lược: hết nước hợp lệ là thua) ✔

**Affected Requirements:** R05, R07
**Affected Screens:** Chess Board (render, aria-label, lật bàn theo phe)
**Affected Business Rules:** toàn bộ luật di chuyển, qua sông, cung, tướng đối mặt

**Hệ quả:** vì dự án được **code lại** (DEC-001), chọn spec **không tốn chi phí sửa mã nguồn**. Các chỗ sau trong tài liệu mới phải viết đúng theo quy ước này:
- Ví dụ aria-label trong `07-UI-AND-TESTS.md:9` (*"Mã đỏ, cột 2 hàng 10"*) — hợp lệ vì RED ở y=9 ⇒ hàng 10 khi đánh số 1-based từ trên xuống.
- *"tốt đỏ (4,4) đã qua sông"* (`07:21`) — hợp lệ vì RED qua sông khi y ≤ 4.

---

## DEC-004 — Có tính năng đuổi một người xem cụ thể

**Date:** 2026-09-21 · **Status:** Accepted · **Chi tiết đã chốt ở:** `DEC-014`, `DEC-015` · **Resolves:** Q-004 (BA-G-03)

**Context:** `06-MEDIA.md` nhắc "kick viewer" hai lần và đã thiết kế sẵn cơ chế rotation cho tình huống đó, nhưng không có requirement/endpoint/business rule nào. Cơ chế thu hồi duy nhất hiện có là tất-cả-hoặc-không (đổi visibility hoặc rotate watch code → xoá toàn bộ spectator).

**Decision:** Bổ sung tính năng **đuổi một người xem cụ thể** vào phạm vi sản phẩm.

**Affected Requirements:** R04 (mở rộng) — cần requirement ID mới.
**Affected Screens:** Game Room → Spectator list panel (nút đuổi); màn hình người bị đuổi (thông báo access denied).
**Affected Business Rules:** quyền đuổi; hệ quả với media generation rotation (đã có sẵn trong `06-MEDIA.md`); hệ quả với chat SPECTATORS.

**Chi tiết đã chốt (Round 2):** `DEC-014` **cả hai người chơi** đều đuổi được · `DEC-015` người bị đuổi **bị chặn** khỏi phòng đó tới khi phòng đóng.

---

## DEC-005 — Giới hạn người xem là 5 (xác nhận lại)

**Date:** 2026-09-21 · **Status:** Accepted · **Resolves:** Q-009 (BA-C-04)

**Context:** Brief BA ngày 2026-09-21 ghi "tối đa 2 spectator", trích từ `DU_AN_CO_TUONG_ONLINE.md` — tài liệu đã có banner SUPERSEDED. `PHONG_VAN_YEU_CAU.md` Câu 7 ghi PO đã nâng 2 → 5.

**Decision:** Giữ **2 người chơi + tối đa 5 người xem = 7 thành viên/phòng**. Con số 2 trong brief là trích nhầm từ tài liệu cũ, **không phải quyết định đảo ngược**.

**Affected Requirements:** R04
**Affected Business Rules:** trần 5 spectator; người xem thứ 6 bị từ chối; LOCKED không có người xem
**Hệ quả:** mục tiêu thử tải giữ 10 phòng × 7 thành viên = 70 client.

---

## DEC-006 — Hệ thống không hỗ trợ guest

**Date:** 2026-09-21 · **Status:** Accepted (PO duyệt khuyến nghị 2026-09-21) · **Resolves:** Q-005 (BA-G-04)

**Context:** Không có từ "guest" ở bất kỳ spec nào. Thực tế mọi route (trừ auth/health) đều yêu cầu Bearer + hoàn tất onboarding; phòng PUBLIC chỉ cho "tài khoản hoàn tất onboarding" xem.

**BA Recommendation:** **Không hỗ trợ guest.** Mọi chức năng — kể cả xem phòng PUBLIC — yêu cầu tài khoản đã đăng nhập và hoàn tất onboarding.

**Lý do:**
1. Khớp 100% hiện trạng đặc tả ⇒ chi phí bằng 0, không đổi hành vi nào.
2. Guest kéo theo chuỗi vấn đề chưa được quyết: danh tính hiển thị trong chat SPECTATORS, chống spam/abuse không có tài khoản để chặn, rate limit theo IP, và guest chiếm slot trong trần 5 người xem.
3. R01 đã bắt buộc đăng ký/đăng nhập; cho guest xem tự do làm giảm giá trị của chính yêu cầu đó.
4. Thời hạn dự án 2 tháng — đây là phạm vi mở rộng không có trong bất kỳ R nào.

**Decision:** PO duyệt khuyến nghị. **Không hỗ trợ guest** — mọi chức năng yêu cầu tài khoản đã đăng nhập và hoàn tất onboarding. Viết thành requirement tường minh trong `REQ-AUTH`.

---

## DEC-007 — Chính sách phiên đăng nhập

> **Nguồn hiện hành 2026-09-22:** DEC-040 thay bảo đảm đóng/khôi phục tab tuyệt đối từng ghi tại DEC-037; phiên tạm có hạn server 30 phút nhàn rỗi/12 giờ tuyệt đối. DEC-038 giữ gia hạn phiên ghi nhớ theo hoạt động, không heartbeat/refresh. Bảng gốc dưới đây giữ để truy lịch sử, không ghi đè DEC-038/040.

**Date:** 2026-09-21 · **Status:** Accepted (PO duyệt khuyến nghị 2026-09-21) · **Resolves:** Q-006 (BA-G-05)

**Context:** Hiện `persistSession:true` + `autoRefreshToken:true` — đây là **mặc định kỹ thuật của Supabase đang đóng vai business rule** (vi phạm RULE 6: không biến technical choice thành product decision).

**BA Recommendation:**

| Mục | Giá trị đề xuất | Lý do |
|---|---|---|
| Access token | **1 giờ**, tự refresh ngầm | Mặc định Supabase; người dùng không bao giờ thấy gián đoạn giữa ván cờ |
| Checkbox "Ghi nhớ đăng nhập" ở màn Login | **Có**, mặc định **được tick** | Người dùng tự chọn; máy cá nhân giữ tiện lợi, máy chung có đường thoát |
| Tick "Ghi nhớ" | Phiên sống **30 ngày trượt** — mỗi lần dùng gia hạn lại đủ 30 ngày | Người chơi cờ quay lại theo tuần; 30 ngày tránh bắt đăng nhập lại liên tục |
| Bỏ tick | Phiên **chỉ sống trong tab** — đóng browser là mất | Bảo vệ khi demo trên máy trường/máy chung |
| Không hoạt động quá 30 ngày | Yêu cầu đăng nhập lại | Chặn phiên bị bỏ quên vĩnh viễn |
| Đăng xuất mọi thiết bị | Giữ nguyên `logout {scope:ALL}` đã đặc tả | Đã có sẵn |

**Vì sao 30 ngày mà không phải dài hơn/ngắn hơn:** ngắn hơn (7 ngày) gây đăng nhập lại phiền cho người chơi giải trí không đều đặn; dài hơn (90 ngày/vĩnh viễn) không tương xứng với việc tài khoản gắn email và có thể bị chiếm trên máy dùng chung. 30 ngày trượt là mức cân bằng phổ biến cho ứng dụng giải trí có tài khoản.

**Điểm cần PO biết:** đây là ứng dụng có **camera/mic**. Phiên bị chiếm trên máy dùng chung nghiêm trọng hơn ứng dụng thường, vì người chiếm có thể bật media dưới danh nghĩa chủ tài khoản. Đó là lý do tôi đề xuất **có** checkbox thay vì luôn ghi nhớ.

**Decision:** PO duyệt toàn bộ bảng trên.

---

## DEC-008 — Có hộp thư lời mời (Invitation Inbox)

**Date:** 2026-09-21 · **Status:** Accepted · **Resolves:** Q-003 (BA-G-02)

**Context:** Lời mời trực tiếp chỉ được đẩy realtime và hết hạn 10 phút. Người nhận không mở web trong 10 phút đó sẽ không bao giờ biết mình từng được mời. API lấy danh sách lời mời đã được đặc tả nhưng không có màn hình nào hiển thị.

**Decision:** Bổ sung **hộp thư lời mời**:
1. Chỉ báo số lời mời đang chờ trên thanh điều hướng, hiện ở mọi màn hình sau đăng nhập.
2. Màn hình danh sách lời mời còn hiệu lực, vào được bất cứ lúc nào.
3. Khi đăng nhập, hệ thống nạp lại các lời mời **còn hạn** — không phụ thuộc việc người dùng có online lúc được mời hay không.
4. **Giữ nguyên thời hạn 10 phút** của lời mời trực tiếp.

**Affected Requirements:** `REQ-INVITE`, `REQ-PROFILE-FRIENDS`
**Affected Screens:** `SCR-INVITATION-INBOX` (mới), thanh điều hướng toàn cục
**Affected Business Rules:** không đổi luật hết hạn; chỉ thêm đường hiển thị

---

## DEC-009 — Bộ tài liệu mới phải mô tả đủ chức năng, màn hình và luồng dữ liệu

**Date:** 2026-09-21 · **Status:** Accepted · **Resolves:** yêu cầu trực tiếp của PO

**Context:** PO yêu cầu tài liệu BA để "các thành viên khác đọc và hiểu được toàn bộ dự án. Từng chức năng, màn hình, luồng dữ liệu".

**Decision:** Mỗi tài liệu feature trong bộ mới bắt buộc trả lời đủ 15 mục: mục đích · actor · precondition · main flow · alternative flow · error flow · business rules · permission · UI liên quan · states · realtime behavior · edge cases · acceptance criteria · dependency · open question còn lại.

Ngoài ra bộ tài liệu phải có, ở mức toàn dự án:
1. **Glossary** — thống nhất thuật ngữ (hiện chưa có; vi phạm RULE 4).
2. **Screen inventory** — mọi page/modal/panel, kèm state Loading/Empty/Error/Disabled/Success.
3. **Data flow** — cho mỗi event realtime: ai tạo · server validate gì · state nào đổi · client nào nhận · UI từng client đổi ra sao.
4. **Permission matrix** — `Action × Actor` tập trung một chỗ.
5. **Traceability matrix** — `Requirement → Flow → Screen → BR → AC`.

**Affected:** cấu trúc toàn bộ `docs/`.

---

## DEC-010 — Chống treo ván chỉ áp dụng cho ván KHÔNG GIỚI HẠN thời gian

**Date:** 2026-09-21 · **Status:** Accepted · **Resolves:** Q-010

**Context:** Có 4 cấu hình thời gian: không giới hạn (mặc định), 5, 10, 15 phút. Ván có đồng hồ đã tự giải quyết việc treo ván bằng luật hết giờ (`TIMEOUT`). Chạy thêm luật idle lên trên đồng hồ tạo hai deadline song song.

**Decision:** Luật chống treo ván (`DEC-002`) **chỉ áp dụng khi `timeControl = 0`** (không giới hạn). Ván 5/10/15 phút dùng luật `TIMEOUT` sẵn có, **không** hiện hộp thoại xác nhận.

**Lý do:** vấn đề treo ván **chỉ tồn tại** ở chế độ không giới hạn. Áp dụng cho mọi ván sẽ thêm độ phức tạp về thứ tự deadline mà không mang lại giá trị người dùng nào.

**Affected:** `REQ-INACTIVITY`, `REQ-CLOCK`

---

## DEC-011 — Tối đa 2 lần gia hạn LIÊN TIẾP, đếm lại sau mỗi nước đi

> **Cập nhật 2026-09-22:** DEC-027 thay thế kết luận “tối đa 9 phút 30 giây” bên dưới bằng cách tính đủ 3 phút từ mỗi xác nhận hợp lệ. Quy tắc hai lần gia hạn và reset sau nước đi vẫn giữ. Nội dung gốc được giữ để truy vết.

**Date:** 2026-09-21 · **Status:** Accepted · **Resolves:** Q-011

**Context:** Nếu số lần bấm "Tôi còn đây" không giới hạn, người chơi có thể gia hạn mãi mà không bao giờ đi nước — luật `DEC-002` sẽ không giải quyết được đúng vấn đề nó sinh ra để giải quyết.

**Decision:**
1. Mỗi người chơi được gia hạn tối đa **2 lần liên tiếp** trong một ván.
2. Bộ đếm gia hạn **reset về 0** mỗi khi người đó **thực sự đi được một nước hợp lệ**.
3. Khi đã dùng hết 2 lần liên tiếp: lần treo tiếp theo **không hiện hộp thoại nữa**, đi thẳng vào đếm ngược **30 giây**.

**Kịch bản tối đa:** 3 phút (treo) → gia hạn 1 → 3 phút → gia hạn 2 → 3 phút → 30 giây → thua. **Tổng 9 phút 30 giây** không đi nước là thua.

**Lý do chọn "liên tiếp" thay vì "tổng cả ván":** người chơi chậm trong ván dài không bị phạt oan — miễn là họ vẫn đang đi cờ thì luôn có đủ 2 lần gia hạn cho lượt sau. Người rời máy thật hầu như chỉ cần 1 lần.

**Affected:** `REQ-INACTIVITY`, `BR-INA-*`

---

## DEC-012 — Chống treo ván KHÔNG áp dụng cho ván đấu với máy

**Date:** 2026-09-21 · **Status:** Accepted · **Resolves:** Q-012

**Context:** Ván AI chỉ có một người thật. Không có đối thủ nào để "thắng" khi người đó treo ván.

**Decision:** Ván `AI` **không** áp dụng luật chống treo ván. Người chơi quay lại lúc nào cũng được.

**Lý do:** luật này sinh ra để bảo vệ **người đang chờ**. Ván AI không có ai đang chờ và không chiếm ghế của ai. Luật mất kết nối sẵn có (human offline quá 60 giây → `INTERRUPTED`) vẫn giữ nguyên cho ván AI.

**Affected:** `REQ-INACTIVITY`, `REQ-AI`

---

## DEC-013 — Đối thủ và người xem đều thấy trạng thái treo ván

**Date:** 2026-09-21 · **Status:** Accepted · **Resolves:** Q-013

**Context:** `DEC-002` mới định nghĩa màn hình của **người bị hỏi**. Người **đang chờ** — chính là người luật này bảo vệ — chưa được định nghĩa thấy gì.

**Decision:**
1. Đối thủ thấy dòng trạng thái: *"Đối thủ chưa đi nước — đang chờ xác nhận"*.
2. Khi vào giai đoạn 30 giây, **đồng hồ đếm ngược hiện cho cả hai bên**.
3. **Người xem cũng thấy** trạng thái và đồng hồ đếm ngược này.

**Lý do:** nếu người đang chờ không thấy gì, họ vẫn sẽ đầu hàng vì tưởng mình bị kẹt vĩnh viễn — tức là luật mới không cứu được họ. Người xem đang nhìn một bàn cờ bất động cũng cần lời giải thích.

**Affected:** `REQ-INACTIVITY`, `SCR-GAME-ROOM`, `REQ-SPECTATOR`

---

## DEC-014 — Cả hai người chơi đều được đuổi người xem

**Date:** 2026-09-21 · **Status:** Accepted · **Resolves:** Q-016

**Decision:** Quyền đuổi người xem thuộc về **cả hai người chơi**, không chỉ chủ phòng. Không phụ thuộc trạng thái phòng.

**Lý do:** người xem quấy rối làm phiền **cả hai** người chơi. Nếu chỉ chủ phòng có quyền mà chủ phòng đang mải suy nghĩ nước cờ, người kia không tự bảo vệ được. Rủi ro lạm dụng thấp vì người xem không ảnh hưởng kết quả ván.

**Affected:** `REQ-SPECTATOR`, `permissions.md`

---

## DEC-015 — Người bị đuổi bị chặn trong suốt vòng đời phòng đó

**Date:** 2026-09-21 · **Status:** Accepted · **Resolves:** Q-017

**Decision:**
1. Người bị đuổi được ghi vào **danh sách chặn của phòng**.
2. Người đó **không vào lại được phòng đó** bằng bất kỳ đường nào: mã `WATCH`, link mời, hay phòng chuyển sang `PUBLIC`.
3. Chặn **chỉ trong phạm vi phòng đó**, không phải chặn toàn hệ thống. Danh sách xoá khi phòng `CLOSED`.
4. Người bị đuổi vẫn vào được **các phòng khác** bình thường.

**Lý do:** nếu người bị đuổi chỉ cần dùng lại mã cũ là vào ngay thì tính năng vô nghĩa. Giới hạn trong vòng đời một phòng để tránh phát sinh nhu cầu "danh sách chặn toàn hệ thống" — vốn là phạm vi lớn hơn nhiều và không có trong yêu cầu nào.

**Affected:** `REQ-SPECTATOR`, `REQ-INVITE`, `data-model.md`

---

## DEC-016 — Bốn chi tiết BA tự quyết theo uỷ quyền `DEC-000-Q24`

> **Cập nhật 2026-09-22:** DEC-030 thay phần Q-014 cho phép huỷ/reset hạn chống treo khi mất mạng. Giữ nguyên quy tắc hạn hợp lệ đến trước, bằng nhau ưu tiên DISCONNECT; bảng dưới là record gốc.

**Date:** 2026-09-21 · **Status:** Accepted (PO đã duyệt) · **Resolves:** Q-014, Q-015, Q-018, Q-019

| ID | Quyết định | Lý do |
|---|---|---|
| Q-015 | Thêm `reason` mới **`INACTIVITY`** vào kết quả ván; ánh xạ `FINISHED` / winner = đối thủ | Không gộp vào `TIMEOUT` (hết đồng hồ) hay `DISCONNECT` (mất mạng). Ba nguyên nhân khác nhau, phải phân biệt được trong lịch sử ván và khi QA viết test |
| Q-014 | Idle gặp mất kết nối: deadline nào **đến trước** thì có hiệu lực; bằng nhau ưu tiên `DISCONNECT`. Đang trong 30 giây đếm ngược mà mất kết nối thì **chuyển sang** luật mất kết nối (ân hạn 60 giây), không cộng dồn hai deadline | Dùng lại nguyên tắc "deadline sớm hơn thắng" đã có; không tạo luật thứ hai |
| Q-018 | Hộp thoại xác nhận **chỉ hiện cho bên đến lượt** | Bên không đến lượt không có gì để xác nhận |
| Q-019 | Mốc 3 phút tính từ **thời điểm đến lượt** do máy chủ ghi nhận, không phải từ lần chạm chuột/bàn phím cuối | Máy chủ là nguồn quyết định, đo được, không phụ thuộc sự kiện phía client vốn dễ giả mạo |

---

## DEC-017 — Cấu trúc tài liệu mới và ngôn ngữ

**Date:** 2026-09-21 · **Status:** Accepted · **Resolves:** duyệt `proposed-structure.md`

**Decision:**
1. Áp dụng cấu trúc `00-overview` … `09-technical` + `99-archive` theo `08-ba-review/proposed-structure.md`.
2. **Giữ toàn bộ tài liệu lần build trước** trong `99-archive/` — không xoá file nào. 100 file đã được lưu trữ.
3. Ngôn ngữ tài liệu: **tiếng Việt**. Tên trạng thái/vai trò/enum/ID giữ **tiếng Anh viết hoa** để khớp code.
4. Tách `WHAT` (01-requirements) khỏi `HOW` (09-technical) — không nhắc tên công nghệ trong tài liệu yêu cầu.

---

## DEC-018 — Kênh chat người xem trở thành KÊNH CHUNG; người chơi đọc và gửi được, có công tắc ẩn/hiện độc lập

**Date:** 2026-09-21 · **Status:** Accepted · **Thay thế:** `DEC-000-Q08` (phần chat) · **Sửa:** R10

**Context:** Thiết kế cũ (từ Câu 8 phỏng vấn) tách **tuyệt đối** hai kênh chat: người chơi và người xem **không bao giờ** đọc được của nhau, kể cả chủ phòng. Product Owner quyết định đổi mô hình.

**Decision — mô hình mới:**

| Kênh | Ai đọc | Ai gửi |
|---|---|---|
| **Kênh riêng người chơi** | **Chỉ** 2 người chơi | **Chỉ** 2 người chơi |
| **Kênh chung** (trước gọi *kênh chung*) | 5 người xem **+ cả 2 người chơi** | 5 người xem **+ cả 2 người chơi** |

1. Có **một** khung chat chung cho tối đa 5 người xem.
2. **Cả hai người chơi** đọc được kênh chung và **gửi được** vào đó.
3. Mỗi người chơi có **công tắc ẩn/hiện riêng, hoàn toàn độc lập** với người kia. Bốn tổ hợp đều hợp lệ: cả hai cùng hiện · A hiện B ẩn · A ẩn B hiện · cả hai cùng ẩn.
4. Người xem **vẫn không** đọc được kênh riêng của người chơi.

**Affected Requirements:** R10 (sửa) · REQ-CHAT · REQ-SPECTATOR
**Affected Screens:** `SCR-CHAT-PANEL`
**Affected Business Rules:** `BR-CHT-02` · `BR-CHT-03` · `BR-SPEC-08` (đều phải viết lại)

### Chi tiết BA tự quyết theo uỷ quyền `DEC-000-Q24`

| # | Quyết định | Lý do |
|---|---|---|
| 1 | **Đổi tên** *"kênh chung"* → **"kênh chung"** | Người chơi nay đọc và gửi được, gọi là *kênh chung* sẽ khiến lập trình viên hiểu sai phạm vi (RULE 4 — thuật ngữ) |
| 2 | Công tắc ẩn/hiện là **tuỳ chọn giao diện của riêng máy đó**, **không** phải phân quyền. Máy chủ **vẫn gửi** tin bình thường | Bật lại là thấy **đủ lịch sử**, không có khoảng trống. Ít tình huống lỗi hơn hẳn |
| 3 | Khung chat chung **luôn hiển thị dòng**: *"Người chơi cũng đọc và gửi được ở kênh này"* | Người xem cần **biết** trước khi nói. Rẻ, trung thực, và thay thế được cho việc cấm đoán bằng kỹ thuật |
| 4 | Công tắc ẩn/hiện **không** đồng bộ giữa các tab của cùng người | Là tuỳ chọn hiển thị của từng máy/từng tab |

### Hệ quả phải ghi rõ cho Product Owner

**Người xem không còn kênh riêng tư nào.** Mọi thứ họ nói, hai người chơi đều đọc được. Đây là hệ quả trực tiếp của quyết định, **không phải lỗi thiết kế** — nhưng nếu sau này muốn người xem có chỗ nói riêng thì phải thêm kênh thứ ba, là phạm vi mới.

**Rủi ro mách nước đã được chấp nhận.** BA đã nêu ở vòng hỏi trước; Product Owner chọn mô hình này. Chi tiết số 3 ở trên (hiện dòng cảnh báo) là biện pháp giảm nhẹ bằng minh bạch.

---

## DEC-019 — Hết nước đi giữ nguyên là THUA

**Date:** 2026-09-21 · **Status:** Accepted · **Xác nhận lại:** `DEC-000-Q11` · **Liên quan:** R07

**Context:** Product Owner có lúc cân nhắc đổi *hết nước đi* (bí, không bị chiếu) từ **thua** sang **hoà**, rồi hỏi khuyến nghị của BA.

**BA Recommendation đã đưa:** giữ **THUA**, vì (1) đúng luật cờ tướng thật — khác cờ vua; (2) tình huống này cực hiếm trong cờ tướng nên thực tế gần như không khác; (3) ván cờ đã có đường hoà qua luật lặp 3 lần; (4) tài liệu đang ghi THUA nên **không phải sửa gì**.

**BA cũng khuyên KHÔNG** làm thành tuỳ chọn cho người chơi: thêm một cấu hình phòng, phải khoá khi ván bắt đầu, phải hiện ở sảnh, phải kiểm thử cả hai chế độ, và AI phải chấm điểm khác nhau — chi phí không tương xứng cho tình huống gần như không xảy ra.

**Decision:** Product Owner chốt **giữ THUA**.

**Affected:** không có thay đổi nào. `GR-END-01`, R07, fixture `F-STALEMATE`, cách AI chấm điểm thế cờ bí — **tất cả giữ nguyên**.

---

## DEC-020 — Bỏ khoá quyền điều khiển tab cho phần chơi cờ; chỉ giữ cho camera/mic

**Date:** 2026-09-21 · **Status:** Accepted · **Thay thế:** `SS-06`…`SS-14` · **Sửa:** `BR-DIS-12/13/14`

**Context:** Thiết kế cũ cho **một tab thao tác**, các tab khác **chỉ đọc**, và có nút **Tiếp quản** để chuyển quyền. Product Owner thấy cách này không ổn: mong muốn là **mở bao nhiêu tab cũng được, tất cả tự đồng bộ**, đi ở tab này thì tab kia thấy ngay.

**Rà soát lại của BA:** hai tab **đã tự đồng bộ sẵn** trong thiết kế cũ. Vấn đề chỉ là tab phụ **không bấm được**. Và việc chặn đó **là thừa**, vì máy chủ **đã** chống hai nước bằng **kiểm lượt + kiểm phiên bản + mã lệnh duy nhất**:

> Tab 1 đi nước → phiên bản tăng, lượt chuyển sang đối thủ → tab 2 gửi nước với phiên bản cũ → máy chủ trả **xung đột phiên bản** hoặc **chưa tới lượt**.

Kiểm lại toàn bộ lệnh: đi cờ · đầu hàng · xin hoà/đi lại · sẵn sàng · xác nhận treo ván · tái đấu — **tất cả đều đã an toàn** nhờ ba cơ chế trên. Khoá quyền điều khiển là lớp bảo vệ **trùng lặp**.

**Decision:**

1. **Mọi tab của cùng tài khoản đều đồng bộ VÀ đều thao tác được**: đi cờ · chat **cả hai kênh** · đầu hàng · xin hoà · xin đi lại · sẵn sàng · xác nhận treo ván · tái đấu · đuổi người xem.
2. Máy chủ chống xung đột bằng **kiểm lượt + kiểm phiên bản + mã lệnh duy nhất** — **không** cần khoá tab.
3. **Bỏ hẳn** khái niệm *tab chỉ đọc* và nút **Tiếp quản** cho phần chơi cờ và chat.
4. **Camera/micro vẫn chỉ một tab phát được** — xem `DEC-021`.
5. Mở nhiều tab **vẫn không** tạo thêm ghế trong phòng (giữ nguyên).

**Lý do giữ ngoại lệ cho media:** đây **không phải luật nghiệp vụ** mà là **giới hạn phần cứng** — một webcam không chia cho hai tab được, và hai tab cùng mở micro sẽ **vọng âm**.

**Affected Requirements:** REQ-DISCONNECT · REQ-CHAT · REQ-MATCH · REQ-BOARD · REQ-INACTIVITY · REQ-ROOM · REQ-GAME-ACTIONS
**Affected Screens:** bỏ `SCR-TAKEOVER-PROMPT`; thêm `SCR-MEDIA-TAB-SWITCH`
**Affected Business Rules:** `SS-06`…`SS-14` viết lại · `BR-DIS-12/13/14` · `BR-CHT-17` · `BR-INA-12` · `BR-BRD-11`

**Lợi ích phụ:** bộ tài liệu **đơn giản đi đáng kể** — bớt một khái niệm, một màn hình, và nhiều ô ❌ trong ma trận quyền.

---

## DEC-021 — Camera/micro: tab bật trước giữ quyền, tab khác có nút chuyển sang

> **Cập nhật 2026-09-22:** DEC-033 làm rõ: chỉ chuyển nguồn được chọn; nguồn ở tab mới về Tắt và cần bật thủ công. Không tự phát ngay sau thao tác chuyển. Quy trình lỗi/chờ thu hồi theo DEC-034; phần dưới giữ để truy vết.

**Date:** 2026-09-21 · **Status:** Accepted · **Phương án PO chọn:** A

**Context:** Một webcam/micro không chia được cho hai tab. Ba phương án đã đưa ra: (A) tab bật trước giữ, tab kia có nút chuyển · (B) tab mới tự cướp · (C) cho cả hai bật, chấp nhận vọng âm.

**Decision — phương án A:**

1. Tab nào **bật camera/micro trước** thì **giữ quyền phát**.
2. Tab khác hiện: *"Camera đang bật ở tab khác"* + nút **"Chuyển sang tab này"**.
3. Bấm nút đó ⇒ **tab cũ dừng thiết bị trước**, rồi tab mới mới bắt đầu phát.
4. Áp dụng **riêng cho camera và riêng cho micro** — camera có thể ở tab 1, micro ở tab 2.

**Lý do không chọn B:** tab tự cướp sẽ làm người dùng **mất hình đột ngột** khi vô tình mở lại trang ở tab khác.
**Lý do không chọn C:** vọng âm là lỗi trải nghiệm nặng, và phát hai luồng của cùng một người gây nhầm lẫn cho người nhận.

**Affected Requirements:** REQ-MEDIA · REQ-DISCONNECT
**Affected Screens:** `SCR-MEDIA-TAB-SWITCH` (mới)
**Affected Business Rules:** `BR-MED-18`…`BR-MED-20` (mới)

---

## DEC-022 — Người xem vào được giữa trận

**Date:** 2026-09-21 · **Status:** Accepted · **Resolves:** `BA-A-01` · **Thẩm quyền:** `DEC-000-Q24`

**Context:** Tài liệu cũ **cho phép** vào xem giữa trận, nhưng điều đó chỉ **suy ra** từ chỗ khác, chưa có câu nào nói rõ. Một suy luận không phải một đặc tả.

**Decision:** **Cho phép** người xem vào bất cứ lúc nào — phòng đang chờ, đang chơi, hay vừa kết thúc ván (trong 10 phút). Vào giữa trận thì nhận **ngay** thế cờ hiện tại và lịch sử **kênh chung** của ván đang diễn ra.

**Lý do:**
1. Người ta tìm phòng ở sảnh **khi ván đang diễn ra** — đó là lúc có gì để xem. Nếu chỉ vào được trước khi ván bắt đầu thì tính năng xem gần như vô dụng.
2. **Không lộ gì bất lợi**: người xem chỉ thấy bàn cờ mà **cả hai người chơi đều đã thấy**.
3. **Chi phí bằng 0** — đúng hành vi đang đặc tả.

**Affected:** `REQ-SPECTATOR` §7 (từ "suy ra" thành **luật tường minh** `BR-SPEC-17`) · `REQ-LOBBY`

---

## DEC-023 — Sảnh chỉ hiện phòng ĐANG CHỜ và ĐANG CHƠI, không hiện phòng ĐÃ XONG

**Date:** 2026-09-21 · **Status:** Accepted · **Resolves:** `BA-A-02` · **Thẩm quyền:** `DEC-000-Q24`

**Context:** Mâu thuẫn thật đã phát hiện ở audit vòng 1: mô tả nghiệp vụ nói *"hiện ở sảnh khi còn chỗ"*, còn định nghĩa truy vấn lại gồm **cả phòng đã xong ván**. Hai chỗ nói khác nhau.

**Decision:**

| Trạng thái phòng | Hiện ở sảnh | Vào bằng mã/link |
|---|:---:|:---:|
| Đang chờ | ✅ | ✅ |
| Đang chơi | ✅ | ✅ |
| **Đã xong** (10 phút) | ❌ | ✅ |
| Đã đóng | ❌ | ❌ |

**Lý do:**
1. Người duyệt sảnh muốn **xem một ván đang diễn ra** hoặc **tìm người chơi**. Một phòng đã xong ván **không phải** thứ họ tìm.
2. Mười phút đó là để **hai người chơi** xem lại và quyết định tái đấu. Người lạ lạc vào chỉ thêm nhiễu.
3. Nếu họ **tái đấu**, phòng trở lại **đang chơi** và **tự xuất hiện lại** ở sảnh. Không mất gì.

**Vì sao mã/link vẫn vào được:** người cầm mã là người **được mời**, khác hẳn người lạ duyệt sảnh. Họ vào xem lại ván vừa xong hoặc chờ tái đấu là hợp lý.

**Affected:** `REQ-LOBBY` `BR-LOB-09` (mới) · `REQ-SPECTATOR` §7 ALT-3 · `data-model` (điều kiện truy vấn sảnh)

---

## DEC-024 — Chuẩn tương phản WCAG 2.1 AA, có số đo thật, kèm luật phân biệt hai phe

**Date:** 2026-09-21 · **Status:** Accepted · **Resolves:** `BA-A-05` · **Thẩm quyền:** `DEC-000-Q24`

**Context:** Tài liệu có luật *"không truyền đạt thông tin chỉ bằng màu"* nhưng **không nêu chuẩn tương phản cụ thể** — nên không kiểm thử được.

**Decision:** Áp dụng **WCAG 2.1 mức AA**: chữ thường **4.5:1** · chữ lớn và đối tượng đồ hoạ **3:1**.

### Đã ĐO bảng màu đã chốt — kết quả

| Cặp màu | Tỉ lệ đo được | Cần | Kết quả |
|---|---:|---:|:---:|
| Chữ mực trên nền giấy | **12,95:1** | 4,5 | ✅ |
| Chữ mực trên gỗ sáng | **7,65:1** | 4,5 | ✅ |
| Quân **đỏ** trên gỗ | **3,62:1** | 3,0 | ✅ |
| Quân **đen** trên gỗ | **7,87:1** | 3,0 | ✅ |
| Đường kẻ bàn cờ trên gỗ | **3,98:1** | 3,0 | ✅ |
| Viền tiêu điểm trên nền giấy | **5,99:1** | 3,0 | ✅ |
| Viền tiêu điểm trên gỗ | **3,54:1** | 3,0 | ✅ |
| Chữ gỗ viền trên nền giấy | **6,74:1** | 4,5 | ✅ |

**Kết luận: bảng màu đã chốt ĐẠT WCAG 2.1 AA. Không cần đổi màu nào.**

### Điểm cần chú ý — quân đỏ so với quân đen chỉ 2,17:1

Con số này **không phải** vi phạm WCAG: mỗi quân nằm trên **nền gỗ**, không chồng lên quân kia, và cả hai đều đạt 3:1 so với gỗ. Tiêu chí *1.4.1 Use of Color* được thoả vì hai phe dùng **chữ Hán khác nhau**, không chỉ khác màu.

**Nhưng mức khác biệt của chữ không đồng đều.** Đã rà cả 7 cặp:

| Rõ ràng (4/7) | **Gần giống (3/7)** |
|---|---|
| 帥/將 · 相/象 · 炮/砲 · 兵/卒 | **仕/士 · 傌/馬 · 俥/車** |

Ba cặp *Sĩ, Mã, Xe* chỉ khác nhau ở **bộ thủ đứng nhân**. Với người **mù màu đỏ–lục** (khoảng 8% nam giới) **và** không đọc được chữ Hán, ba cặp này **rất khó phân biệt**.

**Decision bổ sung — `DT-21`:** hai phe phải có **thêm một dấu hiệu phân biệt không phụ thuộc màu và không phụ thuộc chữ**. Ví dụ đạt yêu cầu: viền quân **nét liền** cho một phe và **nét đôi** cho phe kia; hoặc nền quân khác sắc độ rõ rệt. Cách thể hiện do thiết kế chọn, nhưng **phải có** và **phải kiểm thử được ở chế độ giả lập mù màu**.

**Lý do không đổi màu đỏ:** làm đỏ sáng hơn để tách khỏi đen sẽ **giảm** tương phản với nền gỗ (đang là 3,62:1, sát ngưỡng 3:1). Thêm dấu hiệu hình dạng rẻ hơn và không phá kiểu truyền thống.

**Affected:** `design-tokens` §2 (thêm bảng số đo + `DT-21`) · `REQ-BOARD` · `test-scenarios` (`TS-UI-13`)

---

## DEC-025 — Stack công nghệ chính thức: TypeScript toàn bộ

**Date:** 2026-09-21 · **Status:** Accepted · **Thay thế:** đề xuất trong `09-technical/tech-stack.md`
**Căn cứ:** Câu 2, 4, 5, 6, 20 phỏng vấn · đối chiếu dự án tham chiếu `DACS_TravelConnect_VN`

**Context:** Product Owner giao BA chọn stack, với ba mục tiêu: **giao diện đẹp**, **backend xử lý tốt**, **lưu trữ dữ liệu tốt**.

### Quyết định

| Lớp | Chọn |
|---|---|
| **Ngôn ngữ** | **TypeScript toàn bộ** |
| Kho mã | pnpm workspace (bắt buộc — để chia sẻ gói luật cờ) |
| Giao diện | React + Vite + React Router |
| Trạng thái | TanStack Query (đọc HTTP) + Zustand (trạng thái ván realtime) |
| CSS | **Tokens toàn cục + CSS Modules** |
| Bàn cờ | **SVG** |
| Icon / thông báo | lucide-react + sonner |
| Máy chủ | **NestJS** trên **Node.js 24 LTS** |
| Thời gian thực | **Socket.IO** qua `@nestjs/websockets` |
| Cơ sở dữ liệu | **Supabase PostgreSQL** |
| Truy cập dữ liệu | **Prisma lai** — xem `TECH-07` |
| Migration | **Supabase CLI (`.sql`)** — Prisma **không** migrate |
| Xác thực | Supabase Auth |
| Camera/mic | **LiveKit** |
| AI | TypeScript, **tiến trình riêng**, worker thread có cờ huỷ |
| Kiểm thử | **Vitest** + Playwright |
| Kiểm tra mã | ESLint + TypeScript chế độ nghiêm ngặt |

**Không dùng ở bản đầu:** Redis · BullMQ · Prometheus · Swagger · i18next · SSR/Next.js · Tailwind.

### Vì sao TypeScript chứ không phải .NET

.NET đã được cân nhắc **nghiêm túc**, và **thắng ở một điểm thật**: AI viết bằng C# sẽ nhanh hơn 5–20 lần, xoá sạch rủi ro *"chưa đo được depth 6 trong 3 giây"*.

Vẫn chọn TypeScript vì **ba lý do nặng hơn**:

| # | Lý do |
|---|---|
| **1** | **`TECH-01` — một bộ luật cờ duy nhất.** Giao diện chạy trong trình duyệt nên buộc phải là JavaScript. Backend .NET ⇒ luật cờ phải viết **hai lần** (C# cho máy chủ+AI, TS cho giao diện), **chắc chắn lệch nhau**. Câu 5 phỏng vấn đã chọn TypeScript đúng vì lý do này |
| **2** | **Kinh nghiệm thực tế của đội là TypeScript.** Dự án `DACS_TravelConnect_VN` là NestJS + React + TypeScript. Dự án 2 tháng thì **quen tay quan trọng hơn tốc độ chạy** |
| **3** | **LiveKit là phần rủi ro nhất còn lại** (4/30 lỗi của lần trước nằm ở media). SDK chính thức của LiveKit cho Node là hạng nhất; cho .NET chỉ có bản cộng đồng. Không nên tăng rủi ro ở đúng chỗ đã từng hỏng |

**Đổi lại:** rủi ro AI **không biến mất**, mà được xử bằng `TECH-08` — cổng đo bắt buộc.

**Phương án lai bị loại thẳng:** *"AI bằng C#, phần còn lại bằng Node"* là **tệ nhất** — AI gọi bộ sinh nước đi hàng triệu lần mỗi giây nên không thể gọi ngược sang dịch vụ TypeScript ⇒ vẫn phải viết luật hai lần, lại thêm một ngôn ngữ phải bảo trì.

**Nếu sau này** số đo chứng minh TypeScript không đạt ngân sách **sau khi đã tối ưu thuật toán**, thì phương án mở là: chuyển **toàn bộ** backend + AI sang .NET và **bỏ luật cờ phía giao diện** (máy chủ gửi kèm danh sách nước hợp lệ — `BR-BRD-07` đã cho phép). Không làm nửa vời.

### Ràng buộc kỹ thuật kèm theo

| ID | Ràng buộc |
|---|---|
| **TECH-07** | **Prisma lai**: Prisma cho hồ sơ/bạn bè/lời mời/lịch sử. **SQL thuần** cho **toàn bộ đường xử lý lệnh ván** (khoá dòng, thứ tự khoá, đếm sức chứa, tái đấu). Ranh giới này **phải ghi trong mã nguồn** |
| **TECH-08** | **Cổng đo AI sớm**: ngay sau khi xong module luật, phải đo **depth 6 trong 3000 ms**. Không đạt ⇒ tối ưu thuật toán trước, **không** đổi ngôn ngữ ngay |
| **TECH-09** | AI **bắt buộc chạy tiến trình riêng**. Node.js một luồng — để AI trong tiến trình chính sẽ làm **treo mọi ván** 3 giây |
| **TECH-10** | Schema do **Supabase CLI** quản lý bằng file `.sql`. Prisma chỉ `db pull`. **Không bao giờ** chạy `prisma migrate` |
| **TECH-11** | Bảo vệ đồ án bằng **bản chạy ở máy cá nhân**; bản online chỉ để chứng minh đã triển khai được (Render gói miễn phí ngủ ~50 giây) |

**Affected:** `09-technical/tech-stack.md` · `09-technical/architecture.md` · `09-technical/deployment.md`


---

## DEC-026 — Hiện thông báo và đếm ngược 30 giây ngay khi đủ 3 phút không đi

> **Phản hồi tiếp theo:** DEC-027 giải quyết Q-AUD-01b; DEC-028 giải quyết phần cho chat trước ván của Q-AUD-04. Phần “chưa được trả lời” dưới đây phản ánh thời điểm ghi DEC-026.

**Date:** 2026-09-22 · **Status:** Accepted · **Resolves:** `Q-AUD-01a` (một phần `Q-AUD-01`/F03)

**Context:** Audit BA-20260922 phát hiện sơ đồ diễn đạt “hỏi → chờ 30 giây → đếm ngược 30 giây”, trái AC xử thua sau một cửa sổ 30 giây. PO trả lời: “đến lượt của người đánh nếu 3p không phản hồi thì hiện 1 thông báo lên màn hình đến ngược 30s xem có đang chơi ván này không. Nếu sau 30s ko phải hồi thì người này thua”.

**Decision:** Trong phạm vi áp dụng luật chống treo ván hiện có:
1. Tính từ lúc đến lượt, đủ **3 phút không đi được nước hợp lệ** thì hiện thông báo hỏi người đó còn đang chơi không; **đếm ngược 30 giây bắt đầu ngay cùng lúc**.
2. Hết cửa sổ đó mà không xác nhận và không đi nước hợp lệ thì người đó thua, đối thủ thắng, nguyên nhân `INACTIVITY` theo quy tắc hiện có.
3. Nhánh không phản hồi liên tục, không mất kết nối và không kết thúc vì lý do khác: `0:00` đến lượt → `3:00` hỏi + đếm ngược → `3:30` thua. Không chờ tới `4:00`.

**Phạm vi chưa được trả lời:** PO chưa xác định mốc gia hạn sau khi bấm “Tôi còn đây” (`Q-AUD-01b`), xử lý reconnect (`Q-AUD-02`), offline WAITING (`Q-AUD-03`), chat trước ván (`Q-AUD-04`), nhận PLAYER sau ván (`Q-AUD-05`). Nội dung câu hỏi/đề xuất được chép lại không được coi là sự chấp thuận. Không thay số lần gia hạn, trần 9:30 hay phạm vi ván áp dụng bằng suy đoán.

**Affected Requirements:** `R17`, [REQ-INACTIVITY](../01-requirements/REQ-INACTIVITY.md) §5/7/11/12/13/15/17.

**Affected Screens:** `SCR-INACTIVITY-PROMPT`, `SCR-GAME-ROOM`: hỏi và đếm ngược xuất hiện đồng thời. Quyền xem/xác nhận giữ theo các quyết định hiện có.

**Affected Business Rules:** làm rõ `BR-INA-01`, `BR-INA-10` và `AC-INA-01`, `AC-INA-05`; không quyết định lại `BR-INA-02`, `BR-INA-03`, `BR-INA-06`.

**Affected downstream:** FLOW-INACTIVITY §2/5; state-machines §4; ISSUE-100/102/103. ISSUE-101 vẫn cần mốc gia hạn được chốt trước khi nghiệm thu tổng thời gian.

**Theo dõi:** [Question backlog hiện tại](../08-ba-review/question-backlog-2026-09-22.md). F03 chỉ được giải quyết một phần; chưa đóng toàn bộ finding.


---

## DEC-027 — Gia hạn đủ 3 phút từ lúc xác nhận hợp lệ

**Date:** 2026-09-22 · **Status:** Accepted · **Resolves:** `Q-AUD-01b`, hoàn tất `Q-AUD-01`/F03 về timeline khi liên tục online.

**Context:** PO chọn: “B. Lúc 6:29: được thêm đủ 3 phút từ lúc bấm.”

**Decision:** Sau mỗi xác nhận hợp lệ “Tôi còn đây”, ngưỡng cảnh báo tiếp theo bằng **thời điểm máy chủ ghi nhận xác nhận hợp lệ + 180 giây**; không cộng vào mốc cảnh báo cũ. Mốc từ máy chủ và biên nhận trước hạn giữ theo BR-INA-07/edge case 1. Giữ tối đa hai lần gia hạn theo DEC-011; mỗi lần hỏi có chung cửa sổ đếm ngược 30 giây theo DEC-026.

**Hệ quả tính toán (không phải một ngưỡng tự đặt):** Với hai lần xác nhận trễ lần lượt `d1`, `d2` giây sau cảnh báo, `0 ≤ d1,d2 < 30`, không đi nước, không reconnect/undo hay kết thúc vì lý do khác: thời điểm thua tính từ đầu lượt là **570 + d1 + d2 giây**, tức từ **9:30 đến dưới 10:30**. Ví dụ bấm ở giây 29 cả hai lần: hỏi 3:00 → xác nhận 3:29 → hỏi 6:29 → xác nhận 6:58 → đếm cuối 9:58 → thua 10:28. Xác nhận đúng hạn 30 giây vẫn bị từ chối theo luật hiện có.

**Supersedes:** chỉ kết luận trần cố định 9:30 trong DEC-011 và downstream. Không đổi số lần gia hạn; không tạo trần tổng cho các lượt có reconnect/undo. `Q-AUD-02` vẫn OPEN.

**Affected Requirements / Rules / AC:** R17; BR-INA-02/07; AC-INA-04/11; T101-01/11, T102-04.

**Affected Screens / flows:** SCR-INACTIVITY-PROMPT, FLOW-INACTIVITY, state-machines §4, data-flows §5; hiển thị thời gian theo mốc mới.

---

## DEC-028 — Cho chat ngay khi vào phòng, trước khi bắt đầu ván

> **Phản hồi tiếp theo:** DEC-029 giải quyết cả Q-AUD-04b và Q-AUD-04c. Phần “chưa quyết định” dưới đây là lịch sử trước phản hồi đó.

**Date:** 2026-09-22 · **Status:** Accepted · **Resolves:** `Q-AUD-04a` (một phần `Q-AUD-04`/F06).

**Context:** PO chọn: “4) A. Có, cho chat ngay khi vào phòng.”

**Decision:** Thành viên phòng được dùng chat ngay trong trạng thái WAITING, không phải chờ hai người Sẵn sàng hoặc tạo Match. Hai loại kênh và quyền theo vai trò giữ theo DEC-018/REQ-CHAT; chưa có Match không phải lý do vô hiệu nút gửi. Không tạo Match sớm chỉ để thoả schema chat.

**Chưa quyết định:** (1) C thay B có đọc tin riêng A–B trước đó không (`Q-AUD-04b`); (2) khi bắt đầu ván đầu, giữ tin phòng chờ hay mở khung trống, và cách truy cập tin trước ván (`Q-AUD-04c`). Chưa suy ra cơ chế di chuyển/xoá tin hay quyền đọc lịch sử từ quyết định cho gửi tin. Quy tắc tái đấu mở kênh trống và lưu tin 30 ngày giữ nguyên trong phạm vi hiện có.

**Affected Requirements:** R10, R03; REQ-CHAT (BR-CHT-24, AC-CHT-21), phòng chờ.

**Affected Screens:** SCR-WAITING-ROOM có SCR-CHAT-PANEL hoạt động theo quyền; không vô hiệu chỉ vì ván chưa bắt đầu.

**Affected downstream:** FLOW-CREATE-ROOM; data-model §2.12; ISSUE-040/108/109. Mô hình chỉ gắn mọi tin vào Match không còn đủ bao phủ; cần hoàn tất quyền/lifecycle lịch sử trước khi chốt schema/AC liên quan. Không tự quyết thiết kế dữ liệu trong record này.


---

## DEC-029 — Giữ chat phòng chờ khi bắt đầu ván, bảo vệ tin riêng khi thay người

**Date:** 2026-09-22 · **Status:** Accepted · **Resolves:** `Q-AUD-04b`, `Q-AUD-04c`; cùng DEC-028 hoàn tất câu hỏi sản phẩm `Q-AUD-04`.

**Context:** Sau hai đề xuất “C vào thay không đọc tin riêng A–B cũ” và “giữ các tin phòng chờ khi bắt đầu ván đầu”, PO trả lời **“theo bạn đề xuất luôn”**. Chấp thuận này áp dụng hai đề xuất chat vừa nêu, không suy ra lựa chọn cho Q-AUD-02/03/05.

**Decision:**
1. C vào thay B **không được đọc tin riêng A–B đã gửi trước đó**, dù C hiện là PLAYER. Máy chủ không trả các tin ấy qua lịch sử, tải thêm, đồng bộ hoặc truy vấn trực tiếp; không gửi rồi ẩn ở giao diện. Quyền ở kênh chung giữ theo DEC-018.
2. Khi phòng WAITING bắt đầu **ván đầu tiên**, giữ các tin phòng chờ trong khung chat tương ứng, theo đúng quyền đọc. Không xoá/trắng khung vì vừa bắt đầu ván. Nếu C đã thay B, chuyển sang ván đầu không làm C có quyền đọc tin A–B cũ.
3. Quy tắc **tái đấu** mở hai kênh mới, trống và lưu tin 30 ngày vẫn giữ. “Giữ khi bắt đầu ván đầu” không được áp dụng ngầm thành giữ xuyên mọi lần tái đấu.

**Affected Requirements / Rules:** R10/R03; REQ-CHAT BR-CHT-15/24/25/26; permission matrix §7.

**Affected Screens / Flows:** SCR-WAITING-ROOM → SCR-GAME-ROOM, SCR-CHAT-PANEL; FLOW-CREATE-ROOM; data-flows §3.

**Acceptance:** AC-CHT-22 chặn C đọc tin riêng cũ trực tiếp tại máy chủ; AC-CHT-23 giữ lịch sử hợp lệ khi bắt đầu ván đầu; AC-CHT-24 kiểm kết hợp thay người rồi bắt đầu ván. T108-14…16/T109-13 truy vết các hành vi này.

**Technical follow-up:** data-model/ISSUE-040 cần thiết kế lưu tin trước Match và phạm vi người đọc của tin riêng. Đây còn là việc hoàn thiện thiết kế, không phải câu hỏi sản phẩm chưa được PO trả lời; chưa đánh F06 đóng toàn bộ hoặc issue DONE.


---

## DEC-030 — Reconnect giữ các mốc chống treo đã có

**Date:** 2026-09-22 · **Status:** Accepted · **Resolves:** `Q-AUD-02`/F04.

**Context:** PO đồng ý đề xuất “giữ thời hạn lượt cũ, không cấp lại 3 phút” bằng câu “okii theo những gì bạn chọn luôn đi”.

**Decision:**
1. Mất/nối mạng không reset, tạm dừng hay dời mốc cảnh báo và hạn phản hồi chống treo của lượt; giữ số lần gia hạn đã dùng. Nối lại chỉ nhận trạng thái/thời gian còn lại theo các mốc cũ. Chỉ nước đi hợp lệ, xác nhận gia hạn hợp lệ hoặc sự kiện khác được quy định riêng mới làm đổi mốc.
2. Ân hạn mất mạng 60 giây vẫn có, nhưng không thay thế hoặc cộng vào hạn chống treo. Giữ cách phân xử đã có: **hạn hợp lệ đến trước** quyết định kết quả; INACTIVITY và DISCONNECT bằng nhau thì DISCONNECT. Nếu cả hai offline hoặc server restart trước khi có kết quả hợp lệ thì xử gián đoạn theo luật hiện có.
3. Ví dụ không có sự kiện khác: đến lượt 0:00, hỏi ở 3:00/hạn 3:30; mất mạng 2:50, nối lại 3:10 ⇒ thấy còn 20 giây xác nhận, không nhận 3 phút mới. Mất mạng tại 3:20, hạn DISCONNECT là 4:20 ⇒ INACTIVITY tới trước ở 3:30; 60 giây không kéo dài hạn cũ.
4. Nối lại không hồi sinh ván đã kết thúc. Phân xử hạn đã đến trước khi cho thao tác tiếp; không để thứ tự callback/timer trễ đổi kết quả.

**Supersedes:** phần huỷ/reset inactivity khi mất/nối mạng trong DEC-016 Q-014 và các bản diễn giải cũ. Không đổi luật đồng hồ ván có thời gian, AI, số lần gia hạn hoặc quy tắc undo.

**Affected:** R09/R17; BR-INA-06, AC-INA-08/15; BR-DIS-18; FLOW-INACTIVITY/FLOW-DISCONNECT; session-state/state-machines/data-flows; ISSUE-096/100…103.

---

## DEC-031 — Giữ ghế phòng chờ offline 60 giây, kiểm hiện diện trước start

**Date:** 2026-09-22 · **Status:** Accepted · **Resolves:** `Q-AUD-03`/F05.

**Context:** PO đồng ý đề xuất giữ ghế WAITING 60 giây; Host quá hạn đóng phòng, người chơi còn lại quá hạn giải phóng ghế; bắt đầu ván cần cả hai online và sẵn sàng. Vòng đề xuất trước đã nêu xác nhận lại trước khi bắt đầu sau offline.

**Decision:**
1. Khi máy chủ xác định một PLAYER offline trong WAITING, giữ ghế **60 giây** từ mốc phát hiện. Dùng quy tắc hiện diện nhiều tab hiện có; đóng một tab khi tab khác vẫn online không kích hoạt mất ghế.
2. Trong thời gian offline, không bắt đầu ván. Trạng thái sẵn sàng của người offline mất hiệu lực; quay lại trước hạn thì giữ ghế nhưng phải bấm Sẵn sàng lại. Máy chủ kiểm đủ hai PLAYER, **cả hai online và sẵn sàng** khi tạo ván.
3. Đến hạn mà Host chưa quay lại: đóng phòng theo quy trình đóng hiện có, thu hồi lời mời/quyền thành viên/chat/media, người còn lại về sảnh. Không chuyển Host.
4. Đến hạn mà PLAYER còn lại chưa quay lại: giải phóng ghế và tư cách thành viên của người đó, xoá ready cả hai; phòng tiếp tục WAITING nếu Host/phòng còn hợp lệ. Người quay lại sau hạn phải làm thủ tục vào phòng theo quyền/ghế hiện tại.
5. Đây là hết hạn giữ ghế **trước ván**, không phải thua DISCONNECT và không tạo kết quả Match. Người xem vẫn theo thời hạn 15 giây hiện có. Chủ động Rời không được hưởng thêm 60 giây.

**Affected:** R03/R09; BR-ROOM-04/19, BR-DIS-19; SCR-WAITING-ROOM; FLOW-CREATE-ROOM/FLOW-DISCONNECT; state-machines; ISSUE-064/095/096. Cần đồng bộ phụ thuộc triển khai presence với start guard (F17); không báo kiểm thử thật đã chạy.

---

## DEC-032 — FINISHED chỉ tái đấu với hai người chơi vẫn ở lại

**Date:** 2026-09-22 · **Status:** Accepted · **Resolves:** `Q-AUD-05`/F07.

**Context:** PO đồng ý đề xuất “chỉ hai người vẫn ở lại được tái đấu; muốn thay đối thủ thì tạo phòng mới”.

**Decision:**
1. FINISHED không nhận thêm PLAYER, kể cả B đã chủ động rời rồi xin lại bằng vé PLAY còn hạn hoặc người mới C. Chỉ hai PLAYER của ván vừa kết thúc **vẫn còn tư cách thành viên** mới được tái đấu, theo điều kiện hiện có.
2. Một người đã rời thì người còn lại không thể thay đối thủ trong phòng đó. UI giải thích muốn đổi người chơi phải tạo phòng mới; tạo phòng mới vẫn tuân quy tắc phải rời phòng hiện tại.
3. “Rời” là chấm dứt membership, khác với mất mạng/tải lại rồi đồng bộ khi vẫn là thành viên. Không biến nối lại của thành viên hiện hữu thành nhận PLAYER mới.
4. Kết thúc ván giải phóng ràng buộc tham gia ván ACTIVE (`active_players`), **không** tự xoá ghế thành viên phòng còn ở lại. Host rời đóng phòng; người còn lại rời thì giữ quy tắc 10 phút/Host rời, không tự đóng ngay vì thiếu đối thủ.
5. WATCH vào FINISHED vẫn theo quyền xem hiện có, không trao quyền PLAY. Quyết định này không mở lại điều kiện hết hạn 10 phút hoặc thay lịch sử/chat ván đã ghi.

**Affected:** R03/R14; BR-ROOM-20, BR-HIS-21; REQ-MATCH/INVITE; FLOW-JOIN-ROOM/FLOW-CREATE-ROOM; permission/state matrix; ISSUE-062/063/089/127.


---

## DEC-033 — Chuyển từng nguồn camera/micro về Tắt, không ảnh hưởng nguồn còn lại

**Date:** 2026-09-22 · **Status:** Accepted · **Resolves:** `Q-AUD-06` / F08.

**Context:** PO trả lời “đồng ý” với đề xuất chuyển camera sang tab mới thì camera về Tắt, bật lại chủ động; micro đang dùng không bị ảnh hưởng; chuyển micro tương tự.

**Decision:**
1. Chuyển chỉ tác động **nguồn được chọn**. Dừng/thu hồi nguồn đó ở tab cũ trước; sau chuyển thành công nguồn ở tab mới có mức **Tắt**, không tự thu/phát. Người dùng chủ động chọn mức chia sẻ để bật như luồng bật bình thường.
2. Nguồn còn lại giữ tab phát và mức chia sẻ, không bị tắt/reset chỉ vì chuyển nguồn kia. Ví dụ chuyển camera thì micro đang phát vẫn hoạt động với quyền đã chọn.
3. Không diễn giải nút Chuyển thành đồng ý tự phát. Các sự kiện khác như tái đấu/tải lại vẫn theo phạm vi reset đã có; quyết định này chỉ làm rõ chuyển từng nguồn giữa tab.

**Affected:** R11/R09; BR-MED-10/20/21; SS-13/16/19; AC-MED-10/18, AC-SS-06/16; SCR-MEDIA-TAB-SWITCH; FLOW-MEDIA/FLOW-DISCONNECT; ISSUE-099/115/116/117.

---

## DEC-034 — Chưa xác nhận ngắt nguồn cũ thì không cho nguồn mới phát

**Date:** 2026-09-22 · **Status:** Accepted · **Resolves:** phần xử lý chuyển thất bại của `Q-AUD-09` / F26.

**Context:** PO đồng ý đề xuất: chưa xác nhận nguồn cũ bị ngắt thì chưa bật nguồn mới; thất bại thì báo lỗi và cho thử lại.

**Decision:**
1. Sau yêu cầu chuyển, hiện **Đang chuyển… / Đang ngừng chia sẻ…** cho nguồn đó. Khi chưa xác nhận dừng/thu hồi xong, không cho tab mới thu/phát hoặc báo chuyển thành công.
2. Thao tác thất bại ⇒ thông báo rõ **“Chưa chuyển được [camera/micro]. Thử lại.”**, có hành động **Thử lại**. Nguồn mới vẫn không phát; không tuyên bố nguồn cũ đã tắt nếu chưa có xác nhận. Việc chơi cờ/chat và nguồn media còn lại không bị chặn bởi lỗi chuyển này.
3. Thử lại vẫn phải kiểm quyền/trạng thái hiện tại và đi qua xác nhận ngắt nguồn cũ; không bỏ bước vì đã thử một lần. Sau thành công nguồn mới vẫn **Tắt** theo DEC-033, cần bật thủ công. Không tự phát khi xác nhận muộn về sau lỗi.
4. Nếu bật nguồn mới sau chuyển mà người dùng từ chối quyền/không có thiết bị, giữ Tắt và báo lỗi theo BR-MED-15; không tự bật lại tab cũ.

**Affected:** BR-MED-22/23; AC-MED-19/20; SS-13/16; SM-TAB-01; luồng lỗi và trạng thái chuyển; ISSUE-099/115/116.

**Giới hạn kết luận:** quy tắc lỗi/hiển thị và cấm phát trước xác nhận đã chốt. Bằng chứng nào xác nhận nguồn cũ đã ngắt, thời hạn từng bước và thu hồi qua nhiều thiết bị cần đối chiếu thiết kế kỹ thuật hiện có (ARCH-12/13, ISSUE-115); không tự đặt một ngưỡng thời gian mới, không coi toàn bộ F26 đã được kiểm chứng.


---

## DEC-035 — Cho phép Sẵn sàng khi phòng mới có một PLAYER

**Date:** 2026-09-22 · **Status:** Accepted · **Resolves:** phần solo ready của `Q-AUD-07` / F10.

**Context:** PO trả lời “đống ý” với hai đề xuất: một người được bấm Sẵn sàng; Host đổi thời gian thì cả hai phải xác nhận lại.

**Decision:** PLAYER trong WAITING được bấm Sẵn sàng và lưu trạng thái ngay cả khi ghế thứ hai còn trống. UI hiện đã sẵn sàng/chờ đối thủ, cho Bỏ sẵn sàng; không vô hiệu nút chỉ vì chưa đủ hai người. Việc ghi sẵn sàng không tạo ván. Điều kiện bắt đầu vẫn là đủ hai PLAYER, cả hai online và sẵn sàng theo cấu hình hiện hành (`DEC-031`, `DEC-036`).

**Affected:** BR-ROOM-21, AC-ROOM-21; FLOW-CREATE-ROOM; SCR-WAITING-ROOM; state-machines; ISSUE-064/067.

---

## DEC-036 — Đổi cấu hình thời gian phải xác nhận Sẵn sàng lại

**Date:** 2026-09-22 · **Status:** Accepted · **Resolves:** phần đổi cấu hình của `Q-AUD-07` / F10.

**Context:** Cùng phản hồi PO cho đề xuất “Host đổi thời gian ván: hủy trạng thái sẵn sàng của cả hai, yêu cầu xác nhận lại theo cấu hình mới”.

**Decision:** Khi Host đổi cấu hình thời gian thành công trong WAITING, xoá trạng thái sẵn sàng của cả hai PLAYER; cả hai phải bấm lại theo cấu hình mới. Phòng chờ hiển thị thời gian mới, trạng thái chưa sẵn sàng và lý do cần xác nhận lại. Nếu chỉ có một PLAYER thì trạng thái của người đó cũng bị xoá. Cấu hình vẫn khoá khi ván bắt đầu.

**Hệ quả cần kiểm chứng:** đổi thời gian và sẵn sàng/bắt đầu ván phải có thứ tự xử lý nhất quán. Nếu ván đã bắt đầu thì từ chối đổi thời gian; nếu đổi thời gian được chấp nhận trước thì không dùng trạng thái/lệnh sẵn sàng theo cấu hình cũ để bắt đầu với cấu hình mới. Không tự xác nhận thay người dùng.

**Affected:** BR-ROOM-22, AC-ROOM-22/23; FLOW-CREATE-ROOM; SCR-WAITING-ROOM/ROOM-SETTINGS; state-machines; ISSUE-064/066/067. Không thay quy tắc reset do đổi bên/rời phòng/offline.


---

## DEC-037 — Không ghi nhớ: phiên riêng từng tab, tải lại giữ, đóng tab mất

> **Đã được DEC-040 thay thế phần bảo đảm đóng/khôi phục tab tuyệt đối.** Giữ nội dung dưới đây làm lịch sử quyết định; triển khai theo BR-AUTH-18 hiện hành.

**Date:** 2026-09-22 · **Status:** Accepted · **Resolves:** phần vòng đời phiên tạm của `Q-AUD-08` / F14.

**Context:** PO trả lời “đống ý” với đề xuất: không chọn Ghi nhớ thì phiên riêng từng tab; tải lại vẫn đăng nhập; đóng tab rồi mở lại phải đăng nhập lại.

**Decision:**
1. Phiên không ghi nhớ chỉ dùng trong tab đã đăng nhập. Tải lại chính tab đó vẫn giữ đăng nhập nếu phiên còn hợp lệ; không coi reload là đóng tab.
2. Đóng tab rồi mở lại phải đăng nhập lại, kể cả trình duyệt/các tab khác vẫn đang mở. Đóng trình duyệt rồi mở lại cũng không khôi phục phiên tạm. Khôi phục tab đã đóng phải tuân cùng kết quả.
3. Tab mới không tự nhận phiên tạm của tab cũ; người dùng có thể đăng nhập riêng ở nhiều tab. Đóng một tab không đăng xuất các phiên độc lập ở tab/thiết bị khác. Mọi tab đã xác thực vẫn thao tác được theo DEC-020.
4. Đóng tab không phải lệnh Rời phòng/Đầu hàng. Khi không còn tab hợp lệ online, áp dụng luật mất kết nối hiện có. Việc phải đăng nhập lại không dừng hoặc cấp lại hạn reconnect/chống treo.

**Affected:** BR-AUTH-10/18, AC-AUTH-10/15/16; session-state; FLOW-AUTH; REQ-DISCONNECT; SCR-LOGIN; ISSUE-050/055.

**Cần chứng minh kỹ thuật:** phân biệt reload với đóng/khôi phục tab, cách ly phiên giữa tab và kiểm quyền phía server. Không coi tên cơ chế lưu trữ hoặc đóng UI là bằng chứng đáp ứng; chưa kết luận triển khai được chỉ bằng cấu hình mặc định của thư viện.

---

## DEC-038 — Gia hạn phiên ghi nhớ bằng hoạt động chủ động, không bằng tín hiệu nền

**Date:** 2026-09-22 · **Status:** Accepted · **Resolves:** phần gia hạn phiên của `Q-AUD-08` / F14.

**Context:** Cùng phản hồi PO cho đề xuất giữ 30 ngày trượt, gia hạn khi người dùng thực sự sử dụng như mở trang, đi cờ, gửi chat; tín hiệu kết nối tự động không gia hạn.

**Decision:**
1. Giữ checkbox Ghi nhớ mặc định tick và hạn phiên ghi nhớ **30 ngày trượt**. Hoạt động chủ động như mở trang/chuyển màn, đi cờ, gửi chat hoặc dùng chức năng của sản phẩm gia hạn phiên còn hợp lệ thêm đủ 30 ngày từ hoạt động đó.
2. Heartbeat, làm mới token ngầm, tự nối lại, tải dữ liệu định kỳ và nhận sự kiện thụ động không được tính là hoạt động gia hạn. Để tab mở nhưng không sử dụng không giữ phiên vô hạn.
3. Thời hạn phiên ứng dụng độc lập với hạn token kỹ thuật. Làm mới token không tự gia hạn phiên ứng dụng; hoạt động sau khi phiên hết hạn không tự hồi sinh phiên, phải đăng nhập lại. Kiểm hạn tại máy chủ theo thời gian máy chủ.
4. Gia hạn áp dụng cho phiên được sử dụng, không tự kéo dài mọi phiên khác của tài khoản. Hết hạn/thu hồi giữ hiệu lực chặn thao tác, đóng kết nối/media liên quan theo luật hiện có.

**Affected:** BR-AUTH-10/11/19, AC-AUTH-17…19; session-state; FLOW-AUTH; SCR-LOGIN; ISSUE-050/055/095.

**Giới hạn:** Q-AUD-08 còn nhánh Google/email chưa xác minh, tài khoản chỉ Google xin mật khẩu, hạn link/tần suất email và callback sau khi phiên/lời mời hết hạn. Chưa chốt các phần đó bằng phản hồi này.


---

## DEC-039 — PO uỷ quyền BA hoàn thiện các quyết định còn thiếu

**Date:** 2026-09-22 · **Status:** Accepted — uỷ quyền trực tiếp.

**Context:** Sau khi được báo tài liệu còn mâu thuẫn/chưa đồng bộ, PO yêu cầu BA tự quyết định lựa chọn hợp lý nhất cho dự án cờ tướng ở các điểm đó.

**Decision:** BA được đóng câu hỏi nghiệp vụ và chọn thiết kế còn thiếu, ghi rõ lý do và ảnh hưởng trong DEC-040 trở đi. Ưu tiên phạm vi đồ án khả thi, luật phân xử nhất quán, máy chủ kiểm quyền, ít cơ chế trùng với nền tảng. Quyết định mới thay đổi một quyết định cũ phải chỉ rõ phần thay thế; không gọi khả năng chưa kiểm thử là đã đạt. Không uỷ quyền mua dịch vụ, triển khai ứng dụng hoặc tự giảm cổng chất lượng để báo PASS.

**Quy trình:** đồng bộ REQ → FLOW/SCR → quyền/dữ liệu → AC/issue; phân biệt SPEC_REVIEWED với IMPLEMENTED/VERIFIED. Lịch sử audit và archive giữ nguyên nội dung, được gắn nhãn qua mục lục để tránh dùng làm đặc tả hiện hành.


---

## DEC-040 — Phiên khả thi trên web và các nhánh xác thực

**Ngày:** 2026-09-22 · **Trạng thái:** Đã quyết định theo uỷ quyền PO cho BA tự chọn phương án hợp lý để đóng các điểm còn thiếu/mâu thuẫn.

**Quyết định:** Giữ DEC-038: phiên ghi nhớ 30 ngày trượt theo hoạt động chủ động, không heartbeat/refresh. **Thay phần bảo đảm đóng/khôi phục tab tuyệt đối của DEC-037**: phiên không ghi nhớ dùng lưu trữ theo tab, reload còn hợp lệ giữ đăng nhập; browser restore/duplicate có thể giữ/copy session. Phiên tạm hết sau 30 phút không hoạt động hoặc 12 giờ từ login, điều kiện nào tới trước. Đăng xuất là bảo đảm chấm dứt trên máy chung; UI nói rõ giới hạn. Hạn do server kiểm, đúng deadline từ chối trước gia hạn, không refresh hồi sinh; CURRENT theo phiên Auth, ALL theo tài khoản.

Email xác minh/recovery/quota dùng Supabase Auth có sẵn, không xây email engine hay tự thêm quota 5 email/giờ. Ghi cấu hình hiệu lực khi triển khai. Google verified-email liên kết cùng canonical account bằng provider; collision chưa xác minh không tin metadata/credential cũ, bắt onboarding lại cho profile chưa được xác minh; kiểm provider loại đường truy cập chưa xác nhận. Google-only tự nguyện thêm mật khẩu qua recovery, vẫn cùng account/Google identity, thu hồi các phiên cũ. Callback chỉ giữ đích nội bộ và join sau kiểm lại phiên/onboarding/quyền/lời mời/sức chứa/trạng thái; đích lỗi thì về sảnh có thông báo, recovery kết thúc ở login.

**Vì sao:** sessionStorage có thể sống qua restore/copy opener, không có oracle đóng-tab tuyệt đối đáng tin cho web. Hạn ngắn server và explicit logout thực thi được mà không cần gói Auth trả phí. Provider linking tránh tự merge tài khoản; callback không biến việc auth thành quyền vào phòng. Reset-password/logout có server fence + job bền vững trước gọi ngoài, không phụ thuộc callback client.

**Nguồn chuẩn:** [REQ-AUTH](../01-requirements/REQ-AUTH.md) BR-AUTH-18…22/AC-AUTH-20…23; [auth-provider-config](../09-technical/auth-provider-config.md) §4–6; [session-state](../05-data-and-realtime/session-state.md). Nguồn khả năng: [MDN sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage), [Supabase Identity Linking](https://supabase.com/docs/guides/auth/auth-identity-linking).

**Phạm vi/bằng chứng:** đóng F14/Q-AUD-08 về đặc tả; chưa chạy browser/OAuth/email, chưa PASS triển khai. Sửa rõ yêu cầu trước, không hạ test để giữ lời hứa bất khả thi. Mất phiên vẫn theo luật mất kết nối ván, không tự đầu hàng. Phân loại hoạt động áp dụng client hợp tác; không tuyên bố server phân biệt hoàn hảo click người thật với script.

---

## DEC-041 — Chuyển/thu hồi media có bằng chứng và giới hạn thời gian

**Ngày:** 2026-09-22 · **Trạng thái:** Đã quyết định theo uỷ quyền PO; giữ các lựa chọn DEC-033/034.

**Quyết định:** Một owner cho mỗi camera/micro theo tài khoản trên mọi tab/trình duyệt/thiết bị. Chuyển nguồn chỉ nguồn đó về OFF; nguồn còn lại không reset. Server ghi operation/epoch/fence bền vững rồi thu hồi tại SFU; không capture/publish mới trước xác nhận, không ACK client đơn lẻ làm bằng chứng. Mỗi lượt chờ tối đa 30 giây, RPC 5 giây, thử lại tối đa 3 lần sau 1/2/5 giây; đúng deadline chưa chứng minh ⇒ ERROR + Thử lại, giữ fence và mức mong muốn. Retry/ACK muộn/restart không tự bật; logout/match end giữa chuyển huỷ cấp owner mới.

SFU xác nhận đã chặn luồng đủ để chuyển quyền OFF khi tab cũ im lặng; UI không nói camera vật lý đã tắt nếu thiếu ACK. Server không thể dừng hardware trong browser bị mất mạng/sửa mã. Phân biệt token revocation LiveKit Cloud với generation isolation local: token cũ có thể tái tạo room cũ, không bao giờ được dùng để nhận/phát vào generation phục vụ mới. Không hứa DeleteRoom tự vô hiệu mọi token trên mọi deployment. Đo luồng thật có mẫu mới/byte/frame và đối chứng dương; không nhầm buffer cũ hoặc hạ tầng chết với thu hồi thành công.

**Vì sao:** giữ quyền riêng tư đã chọn, có kết cục lỗi hữu hạn để người dùng thử lại; không hứa remote hardware stop hay network instantaneity bất khả thi. Phân quyền trên server phải hoạt động xuyên thiết bị, không dựa giả định webcam luôn độc quyền phần cứng.

**Nguồn chuẩn:** [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) BR-MED-18…25/AC-MED-21…23; [media-control-contract](../09-technical/media-control-contract.md); [LiveKit participant management](https://docs.livekit.io/home/server/managing-participants/).

**Phạm vi/bằng chứng:** F08/F26 và Q-AUD-06/09 đã đầy đủ quyết định/hợp đồng; chưa chạy media thật. ISSUE-112 vẫn cổng RTP/frame thật; ISSUE-117 thêm TS-MED-14/15 nghiệm thu logout/reset và failure/retry thật. ISSUE-051 chỉ xác nhận DB/provider/job trước khi gateway/media tồn tại; không dùng mock để đánh dấu hành vi media đã PASS.



---


## DEC-042 — Ready gắn phiên bản, đổi bên đồng thuận và biên deadline phòng

- **Ngày:** 2026-09-22 · **Trạng thái:** Accepted.
- **Thẩm quyền:** người dùng đã uỷ quyền BA tự chọn phương án hợp lý cho các mâu thuẫn/câu hỏi còn lại; không yêu cầu PO phê duyệt lại lựa chọn thường lệ. Giữ DEC-031/032/035/036.
- **Quyết định:** ready xác nhận membership hiện hành + config revision + ready revision; offline/reset/leave không được lệnh cũ hồi sinh ready. Solo ready hợp lệ; start cần hai PLAYER online và ready đúng cấu hình. Đổi thời gian/bên reset ready; no-op thời gian và đổi tên/privacy không reset. Đổi bên chỉ hai PLAYER online WAITING, đề nghị 30 giây, đối thủ đồng ý; self-accept bị cấm. Pending reset ready và chặn ready=true; từ chối/huỷ/đúng hạn/offline/leave/config change không đổi bên, không phục hồi ready. Đóng modal không tự huỷ. Tái đấu chỉ hợp lệ khi clock server sau khoá nhỏ hơn finished_at+10 phút; đúng hạn close thắng, dù request gửi sớm. Spectator giữ ghế trước 15 giây; đúng hạn mất ghế. Replay phòng chỉ FINISHED/current match, revocation/close/rematch chấm dứt replay cũ.
- **Lý do:** tránh xác nhận cấu hình chưa thấy, gói ready cũ tới sau reconnect và đổi bên đơn phương; một ranh giới thời gian cho handler/timer/test.
- **Nguồn chuẩn:** REQ-ROOM BR-ROOM-23/24, REQ-HISTORY-REMATCH BR-HIS-05/22, ROOM-CHAT §1/6. ISSUE-037/039/064/066/067/074/127. AC-ROOM-24…27, AC-HIS-21/22.

## DEC-043 — WATCH trực tiếp, thu hồi mọi quyền cũ và cổng lỗi join

- **Ngày:** 2026-09-22 · **Trạng thái:** Accepted.
- **Thẩm quyền:** người dùng uỷ quyền BA chốt phương án thực tế cho Q-AUD-13/14 và F12/F15/F30/F31; giữ PLAY riêng với WATCH.
- **Quyết định:** direct WATCH đúng người nhận/còn hạn/chưa dùng hoặc thu hồi được vào CODE_ONLY và FINISHED như mã/link WATCH; LOCKED chặn mọi WATCH và không phát hành WATCH mới. Ba cạnh PUBLIC→CODE_ONLY, PUBLIC→LOCKED, CODE_ONLY→LOCKED đều revoke mọi WATCH direct/code/link và membership, không revoke PLAY. Rotate cũng revoke tất cả WATCH cũ và tạo mã mới, không đổi visibility; PUBLIC vẫn ở sảnh khi WAITING/PLAYING. Mở lại không phục hồi vé/membership cũ; no-op không revoke. Đóng phòng revoke cả PLAY.
- **Join:** client gửi mục đích intent PLAY/WATCH, không gửi role/side/quyền. Server suy role từ grant đã kiểm. Trước bằng chứng hiện hành, phòng không tồn tại/private/closed/invalid-expired-used-revoked-wrong-recipient grant cùng ROOM_ACCESS_UNAVAILABLE và không metadata. Bằng chứng là membership hiện hành, grant hợp lệ hiện hành hoặc PUBLIC WAITING/PLAYING cho WATCH; ảnh sảnh/lời mời cũ không đủ. Có bằng chứng mới trả lỗi đầy/chặn/trạng thái. Chỉ consume vé khi join thành công.
- **Lý do:** lời mời đích danh đã chứng minh quyền tương đương mã, privacy chặt hơn phải thực sự cắt mọi đường quay lại; không để lỗi join làm oracle dò phòng.
- **Nguồn chuẩn:** REQ-SPECTATOR BR-SPEC-19/20; FLOW-JOIN-ROOM §1/8; ROOM-CHAT §2/3; AC-SPEC-21…23, AC-INV-20/21; ISSUE-063/066/068…075. Quyền thấy đề nghị hoà/đi lại giữ BR-ACT-18: SPECTATOR thấy nhưng không trả lời, kiểm AC-SPEC-24.

## DEC-044 — Vòng chat có trước Match và nhóm người đọc bất biến

- **Ngày:** 2026-09-22 · **Trạng thái:** Accepted.
- **Thẩm quyền:** người dùng đã uỷ quyền BA hoàn tất thiết kế; giữ tuyệt đối DEC-018/020/028/029: mọi tab chat được, PLAYER dùng ROOM, chat ngay WAITING, ván đầu giữ tin được phép, C không đọc A–B, rematch hai kênh mới trống.
- **Quyết định:** tạo chat context thuộc phòng ngay lúc tạo phòng; initial match chỉ liên kết context đó, không copy tin. Rematch seal context cũ và tạo context mới, không expose chat cũ qua history ván. Tin PLAYERS thuộc segment participant bất biến user+membership_id. Thay người tạo segment mới; A còn ở phòng đọc A–B/A–C, C chỉ đọc A–C. Host nhắn một mình được, người đến sau không nhận quyền tin một người. B leave/rejoin có membership mới, không hồi sinh quyền tin riêng cũ. ROOM cho current member đọc toàn bộ current context còn retention. Rời/revoke/closed cắt truy cập tiếp theo.
- **Contract:** client chọn channel như ý định, server kiểm quyền; không tự chuyển sai channel. Idempotency unique(context,sender,client_message_id), hash gồm channel/segment/content; khác nội dung cùng mã bị từ chối. Sequence/cursor theo context, không nullable match_id. Gửi SQL thuần serialize membership check/write với leave/revoke; history có predicate đủ. Browser anon/authenticated deny-all RLS theo ARCH-02/ISSUE-043; mọi API/realtime đi backend có participant guard. Rate 5/10s chung channel/tab/context, retry không tính thêm; retention 30 ngày bằng job ISSUE-110.
- **Lý do:** tránh NULL unique, mất/nhân tin ở start và rò lịch sử khi thay người; same role không đồng nghĩa same readership. RLS và backend đều có bằng chứng đúng phạm vi, không dựa UI.
- **Nguồn chuẩn:** REQ-CHAT BR-CHT-27…29, data-model §2.12; ROOM-CHAT §4/5; ISSUE-040/108…110; AC-CHT-25…28.



---

## DEC-045 — AI: phép đo độ sâu, oracle chất lượng và deadline offline

**Ngày:** 2026-09-22 · **Trạng thái:** Accepted · **Nguồn thẩm quyền:** PO uỷ quyền BA chọn giải pháp hợp lý để đóng toàn bộ mâu thuẫn/điểm mở, không yêu cầu hỏi lại. Đóng F20/F29, Q-AUD-10/12.

**Quyết định:** Giữ depth2/4/6 với p95 hoàn thành ≤300/1000/3000ms trên20 thế×5 lần/cấp; percentile nearest-rank trên100 mẫu, mẫu không hoàn thành target là+∞. Bỏ sàn90% trước đây vì yếu hơn p95: nay ít nhất95/100 phải hoàn thành trong ngân sách; biên độ nghiệm thu0ms. Giữ HARD≥16/20 chiến thuật (80%) như sàn học thuật, hợp lệ20/20 và tránh lặp5/5; không quy ra Elo. Hai corpus hiệu năng/chất lượng riêng, freeze manifest/hash/seed và review tay trước đo, fixture tránh lặp có activeHistory tái tạo bàn và ba lần key cùng lượt. Đối kháng60ván deterministic theo depth/seed để tái lập; ngân sách production vẫn có gate riêng. Không dùng output AI làm oracle hay thay corpus sau đo để đạt.

Admission giữ10 reservation cho ván AI ACTIVE (=2running+8queued) kể cả lượt người, mỗi ván≤1job outstanding. Chỉ giải phóng khi terminal; create failure trả slot. Không nhận ván11 khi tất cả đang nghĩ để tránh dồn quá tải lúc cùng tới lượt máy.

**Lý do:** 90% fallback có thể làm percentile thời gian trả trông tốt nhưng không chứng minh depth. Sàn16/20 giữ mục tiêu AI tự viết hợp lý mà không nới luật hợp lệ/lặp. Lịch sử bắt buộc để oracle tránh lặp có nghĩa.

Đồng hồ bên đến lượt tiếp tục khi người chơi AI offline: deadline trước hoặc bằng grace60giây ⇒ TIMEOUT; chỉ chưa có kết quả/deadline sớm hơn mới INTERRUPTED ở giây60. Ví dụ còn20giây/offline70giây ⇒ TIMEOUT tại20; còn60⇒TIMEOUT60; còn>60/không giới hạn⇒INTERRUPTED60 nếu chưa terminal. Không thay kết quả đến trước bằng sự kiện muộn.

**Ảnh hưởng:** REQ-AI/REQ-CLOCK/FLOW-AI, AC-AI04/08/15, TS-AI02/09, TECH-08, ai-validation, ISSUE032/033/121/124/137. Chưa có fixture code, review runtime, benchmark hay PASS được tạo trong đợt tài liệu này.

## DEC-046 — Hồ sơ Internet cho phép ngủ; một backend service với AI child

**Ngày:** 2026-09-22 · **Trạng thái:** Accepted · **Nguồn:** uỷ quyền BA hiện tại của PO. Đóng F19/F28, Q-AUD-11.

**Quyết định:** Chọn `DEMO_SLEEP_ALLOWED`, không cam kết always-on, không tự mua gói trả phí hay dùng ping chống ngủ. Một Web Service chạy backend/Socket.IO và spawn tiến trình AI con cách ly qua IPC cùng host/container; child chứa supervisor và tối đa2 search worker. Không tạo Render service AI thứ hai hoặc thêm network API AI. Health kiểm DB+IPC, shutdown dọn child; restart backend xử ván cũ INTERRUPTED trước khi nhận lệnh mới, giữ lịch sử, không dùng downtime tạo thua.

T137-11 quan sát idle20phút và ép stop/start nếu không ngủ: phải chứng minh reconnect+interruption+history, không yêu cầu socket luôn sống. Công bố profile/giới hạn ở runbook/UI. AI/tải khi backend đang thức vẫn giữ nguyên ngưỡng; T137-07 đo lại đầy đủ trên phần cứng thật. Tài khoản/gói do người dùng cấp; kiểm khả năng nhà cung cấp tại lần triển khai, không giả định gói miễn phí luôn có.

**Lý do:** Phù hợp ngân sách chưa duyệt và DEP-05 hiện có, giữ cách ly CPU mà không thêm hệ thống RPC hay dịch vụ phí. Ngủ là hành vi đã tuyên bố, không là ngoại lệ để bỏ test.

**Ảnh hưởng:** ARCH-16, TECH-09/11, DEP-05, EXTERNAL-SETUP, ISSUE137, acceptance Internet. Chưa triển khai/mua dịch vụ.

## DEC-047 — Bootstrap theo mốc; dependency local tách nghiệm thu Internet

**Ngày:** 2026-09-22 · **Trạng thái:** Accepted · **Nguồn:** uỷ quyền BA hiện tại của PO. Đóng F17/F18 và phần kế hoạch F24.

**Quyết định:**001 bắt install/build/typecheck/HTTP thật;002 thêm lint thật;003 trở đi đủ bốn cổng bắt buộc,004 e2e,005 CI. Lane chưa tồn tại phải fail rõ NOT_IMPLEMENTED, không script xanh rỗng/.skip. Runner DB tối thiểu ở034 trước035–043,044 mở rộng harness; mọi test DB thật và thiếu DB phải đỏ. Chọn theo DAG dependency DONE/merged, không bắt số thứ tự tăng tuyệt đối. Scope051 kiểm session/provider/API hiện có; realtime kiểm084 và media thật kiểm117. Gateway084→presence095→start064 loại vòng WAITING;098 đợi các lệnh thật101/106/110/127; rà UI/tải chờ đầy đủ feature.

Google053 giữ nghiệm thu provider thật, có thể BLOCKED_EXTERNAL;054 phụ thuộc049,055 phụ thuộc050/052/054 nên local không bị chặn.048/052 dùng Auth và hộp thư SMTP local thật;112–117 dùng SFU local/RTP/frame thật; cloud không chặn các issue này.136 nghiệm thu mọi AC local R01–R19, ghi external CHỜ riêng;137 phụ thuộc136+053 và kiểm Google/SMTP/cloud/hai mạng thật.138 có thể bàn giao local từ136 kèm mọi CHỜ, không đồng nhất tài liệu bàn giao DONE với toàn sản phẩm DONE. Không sửa trạng thái runtime vì audit tài liệu.

**Lý do:** Một cổng phải có khả năng thực thi ở thời điểm yêu cầu; di chuyển đúng việc/harness không hạ chất lượng. Tách scope local/Internet thực sự giải phóng dependency mà không coi BLOCKED_EXTERNAL là DONE.

**Phân kỳ thu hồi:** ISSUE-066/075 chứng minh DB/quyền/job; T110-14 chứng minh board/socket/chat/history, TS-MED-06 tại117 chứng minh RTP thật;133/136 bắt buộc tổng hợp. Không gọi test sớm là PASS transport.

**Ảnh hưởng:** AGENTS, WORKFLOW, execution-milestones, README/INDEX, EXTERNAL-SETUP, deployment, ISSUE001–005/034/044/051/054/055/064/078/084/095/098/112–117/121/125/126/130/135–138. Archive kiểm manifest/hash thay số cũ101; bàn giao truy toàn bộ DEC Accepted hiện hành.



---

## DEC-048 — Màn hình có trạng thái cụ thể và nguồn đặc tả hiện hành

**Ngày:** 2026-09-22 · **Status:** Accepted theo uỷ quyền DEC-039. Đóng F13/F21/F22/F24 ở mức tài liệu.

**Decision:** Mỗi SCR có năm trạng thái riêng hoặc N/A kèm lý do trong screen-states. Cảnh báo chống treo không modal, không trap focus/che bàn cờ và Đầu hàng. Đóng UI đề nghị bằng X/Esc/bấm ngoài chỉ thu gọn, không ngầm gửi từ chối/huỷ; pending vẫn mở lại được. Thêm SCR-USER-SEARCH và SCR-SIDE-SWAP-PROMPT cho hành vi đã có. Replay lịch sử và replay trong phòng dùng hai route/quyền riêng theo DEC-042, không cấp lịch sử riêng cho SPECTATOR.

**Nguồn chuẩn:** REQ là nơi định nghĩa BR/AC nghiệp vụ; GR ở game-rules, phiên ở session-state, UI ở screens, kỹ thuật ở09. Registry06 lập chỉ mục từng ID và nguồn; traceability06 nối R01–R19 với flow/screen/nghiệm thu. Phần tóm tắt ở nơi khác chỉ diễn giải, không có quyền ghi đè nguồn. Khi mâu thuẫn mới chưa được DEC giải quyết, báo lại thay vì tự coi tài liệu gần nhất là đúng.

**Lịch sử:** 99-archive và các báo cáo audit cũ giữ nguyên. Mục lục08 phân biệt snapshot cũ, backlog hiện tại và final-audit-2026-09-22. Badge SPEC_REVIEWED nghĩa đã rà soát đặc tả trong phạm vi báo cáo; không có nghĩa triển khai, benchmark, media hoặc external integration đã PASS.

**Lý do:** Developer cần đường đọc liền mạch và hành vi UI kiểm được; PO cần biết chính xác bằng chứng nào hiện có. Không thêm tính năng ngoài phạm vi và không đổi kết quả ván chỉ vì đóng một khung UI.

---

## DEC-049 — `XIANGQI` là kho chính để xây dựng lại dự án

**Ngày:** 2026-09-25 · **Status:** Accepted · **Nguồn:** chỉ đạo trực tiếp của PO · **Supersedes:** phần chọn thư mục nguồn của `DEC-001`.

**Quyết định:** `/Users/twot/Documents/CODE/XIANGQI` là thư mục và Git repository chính của dự án. Xoá nội dung làm việc của lần triển khai cũ, giữ lịch sử Git và remote để truy vết; đưa toàn bộ đặc tả, hướng dẫn agent, tài liệu Jira và trang đọc tài liệu mới từ `XIANGQI-Design` vào đây. Từ thời điểm này, mọi thay đổi tài liệu và mã nguồn mới thực hiện trong `XIANGQI`. `XIANGQI-Design` là bản nguồn tại thời điểm chuyển, không còn là nơi cập nhật chính.

**Trạng thái khởi động lại:** chưa có mã ứng dụng, migration hoặc kết quả kiểm thử runtime mới. Giữ tài liệu `docs/99-archive/` làm lịch sử, không dùng bằng chứng của lần build trước để đánh dấu các issue mới `DONE`. Bắt đầu với `ISSUE-001` theo dependency và WORKFLOW.

**Ảnh hưởng:** README, AGENTS, WORKFLOW, ISSUE-001 và vị trí làm việc của toàn bộ 138 issue. Các quyết định sản phẩm khác không đổi.
