# BACKLOG P2 — XIANGQI

Ngày lập: 11/10/2026. Phạm vi P2 được giao mới qua goal, gồm cả Stretch; chưa là xác nhận đã triển khai. Nhóm Epic giữ [BACKLOG-P1 §4.2](BACKLOG-P1.md#42-epic-p2-chỉ-ở-mức-epic-chưa-tách-story). Nguồn nghiệp vụ là [BA-SCOPE-DECISIONS](BA-SCOPE-DECISIONS.md), ưu tiên Phần 0. Danh mục phủ toàn bộ 25 mục tại [PHAM-VI-P1-P2](jira/reports/PHAM-VI-P1-P2.md).

Nguồn BA đã được PO duyệt; Story, AC/TC và ước lượng dưới đây là phân rã kỹ thuật Codex bổ sung, chưa có xác nhận riêng của PO và không tự coi là BA Done. TC chưa chạy, toàn bộ issue mới giữ To Do trong backlog. Không gán Sprint, ngày cam kết, assignee hoặc release.

## Baseline và ước lượng

Giữ nguyên P1: 9 Epic, 27 Story, 71 Task, 268 AC, 880 giờ, hạn 04/11/2026. P2 riêng: **7 Epic, 25 Story, 50 Task, 75 AC/TC; 768 giờ đề xuất**. Đây là tổng ước lượng kỹ thuật, không phải giờ đã làm hoặc cam kết chung hạn P1. Mỗi Story có Task triển khai tích hợp và Task kiểm chứng; Task triển khai bao gồm migration/code/UI/unit/integration trong phạm vi Story. Có thể phân nhỏ thêm khi triển khai nếu cần mà không giảm phạm vi.

Phụ thuộc là kỹ thuật; Codex có thể làm sớm khi đầu vào thật đã đủ, không sửa lịch nhân sự P1. Kiểm QA chờ các nhánh tích hợp ghi rõ trong JSON. P2 không đẩy vào Sprint 1. [Dữ liệu nguồn P2](jira/data/p2-backlog.json) riêng, không sửa baseline `jira/data/plan-data.json` hoặc báo cáo sinh tự động.

## Quyền, chất lượng và bàn giao

BA 0.3 ưu tiên: Khách giữ đủ quyền P1, mọi lệnh tính năng P2 bị từ chối. Khác biệt với danh sách quyền dự kiến ở BA 1.3 được ghi trong truy vết; không tự mở quyền theo nguồn thấp hơn. Hành vi P2 làm việc với đối thủ Khách phải kiểm lại đúng quyền và không tự chấp nhận thay họ.

Giữ 12 NFR, 9 gate và hồi quy D1–D10 P1 sau P2. Kiểm SUCCESS/LOADING/EMPTY/ERROR/DISABLED, bàn phím, responsive, reduced motion, contrast theo DESIGN. API/socket/RLS kiểm độc lập UI; mock/unit không thay thế dịch vụ thật, LAN/media thiết bị thật, SMTP/OAuth hoặc máy demo thật. Mọi kết quả ghi PASS/FAIL/BLOCKED cùng bản dựng, môi trường, dữ liệu và ngày. Chỉ đóng Task sau đạt đầu ra và kiểm tra bắt buộc; không dùng việc tạo backlog làm chứng cứ Done.

Ngoài phạm vi giữ BA 10.2 và 3.5: giải đấu, hint, cộng giây, đổi email, xóa tài khoản, report/admin/ban, chặn riêng, avatar upload, hồ sơ công khai, đa ngôn ngữ, luật đuổi quân riêng, đổi mật khẩu đang đăng nhập và xếp hạng theo mùa.

## Epic và truy vết

| Epic | Jira | Story | Giờ đề xuất |
|---|---|---|---|
| EP-P2-01 | [XIAN-108](https://xiangqi-web.atlassian.net/browse/XIAN-108) | US-P2-01, US-P2-02, US-P2-03, US-P2-04, US-P2-05, US-P2-06 | 212 |
| EP-P2-02 | [XIAN-109](https://xiangqi-web.atlassian.net/browse/XIAN-109) | US-P2-07 | 44 |
| EP-P2-03 | [XIAN-110](https://xiangqi-web.atlassian.net/browse/XIAN-110) | US-P2-08, US-P2-09, US-P2-10 | 108 |
| EP-P2-04 | [XIAN-111](https://xiangqi-web.atlassian.net/browse/XIAN-111) | US-P2-11, US-P2-12, US-P2-13, US-P2-14, US-P2-15 | 148 |
| EP-P2-05 | [XIAN-112](https://xiangqi-web.atlassian.net/browse/XIAN-112) | US-P2-16, US-P2-17, US-P2-18, US-P2-19 | 104 |
| EP-P2-06 | [XIAN-113](https://xiangqi-web.atlassian.net/browse/XIAN-113) | US-P2-20, US-P2-21 | 64 |
| EP-P2-07 | [XIAN-114](https://xiangqi-web.atlassian.net/browse/XIAN-114) | US-P2-22, US-P2-23, US-P2-24, US-P2-25 | 88 |

## Story, AC và ca kiểm thử

### US-P2-01 · Tính Elo và số ván Ranked

Mục yêu cầu: **P2-01**; Epic **EP-P2-01** / XIAN-108. Jira Story: XIAN-115.

**Nguồn chính xác:** BA 7.1;703; tên mục BA là định danh, dòng là vị trí lúc đối chiếu. Phụ thuộc triển khai: T14, T20.

| AC / TC chưa chạy | Given | When | Then |
|---|---|---|---|
| AC-P2-01.1 / TC-P2-01.1 | Hai người có Elo và số ván trước trận | Kết thúc Ranked | Expected score theo BA 7.1; S = 1/0/0.5; K = 32 ở ván 1–30, K = 16 từ ván 31. Tính độc lập từng bên từ Elo và số ván hoàn tất trước trận. |
| AC-P2-01.2 / TC-P2-01.2 | Elo tính được có phần .5 hoặc dưới 100 | Làm tròn và lưu | Làm tròn tới số nguyên gần nhất, .5 lên, rồi áp sàn 100. Không ép tổng biến động bằng 0 khi K khác nhau hoặc chạm sàn. |
| AC-P2-01.3 / TC-P2-01.3 | Casual, AI, INTERRUPTED hoặc kết quả gửi trùng | Hoàn tất giao dịch | Casual, AI, INTERRUPTED không đổi Elo/count. Mỗi Ranked hoàn tất chỉ cập nhật một lần; resign ngay nước đầu vẫn tính bình thường. |

**TC:** Mỗi TC thiết lập Given bằng dữ liệu thử cô lập, thực hiện When qua API/socket/UI theo quyền rồi đối chiếu toàn bộ Then. Không chỉ kiểm giao diện hoặc sao chép implementation làm đáp án. Các biến thể bắt buộc bổ sung: P1 kết quả bền/idempotence/auth; TC bảng đáp án tính độc lập K khác nhau/sàn/.5/ván30–31/duplicate; Casual/AI/INTERRUPTED không đổi.

| Task | Jira | Đầu ra | Giờ đề xuất | Phụ thuộc |
|---|---|---|---|---|
| T-P2-01-I | XIAN-140 | Triển khai hoàn chỉnh server/web/migration cần thiết và unit/integration test trong phạm vi Story; không đóng khi chỉ có mock/scaffold. | 24 | T14, T20 |
| T-P2-01-Q | XIAN-141 | Thực thi mọi AC/TC và biến thể, directAPI/socket/RLS theo quyền, E2E và dịch vụ/thiết bị thật cần thiết; hồi quy P1 phần liên quan. | 8 | T-P2-01-I |

### US-P2-02 · Hàng đợi Ranked

Mục yêu cầu: **P2-02**; Epic **EP-P2-01** / XIAN-108. Jira Story: XIAN-116.

**Nguồn chính xác:** BA 7.1–7.2;703/743; tên mục BA là định danh, dòng là vị trí lúc đối chiếu. Phụ thuộc triển khai: T12, T56, P2-01, P2-03.

| AC / TC chưa chạy | Given | When | Then |
|---|---|---|---|
| AC-P2-02.1 / TC-P2-02.1 | Tài khoản chính thức chưa có vị trí chơi | Tìm Ranked | Biên ±100 mở thêm 50 mỗi 10 giây, dùng biên lớn hơn của hai người. Đúng 60 giây thử ±400 lần cuối rồi mới timeout; không phạt hoặc ghép bot. |
| AC-P2-02.2 / TC-P2-02.2 | Hai đối thủ vừa ghép | MATCH_FOUND hoặc hủy đồng thời | Ghép nguyên tử, phe ngẫu nhiên, 10 phút/bên, vào ván ngay. Chỉ hủy được trước MATCH_FOUND; sau đó nút bị khóa. |
| AC-P2-02.3 / TC-P2-02.3 | Người đang trong hàng đợi | Mất mạng hoặc server restart | Quá 30 giây mất mạng thì rút queue. Restart mất queue và báo Hàng đợi đã bị huỷ, hãy tìm lại. Không phạt; người queued không nhận invite/challenge. |

**TC:** Mỗi TC thiết lập Given bằng dữ liệu thử cô lập, thực hiện When qua API/socket/UI theo quyền rồi đối chiếu toàn bộ Then. Không chỉ kiểm giao diện hoặc sao chép implementation làm đáp án. Các biến thể bắt buộc bổ sung: Elo/auth/socket/single-position; fake-clock tests tại10/59.999/60s, race cancel-found/restart/disconnect.

| Task | Jira | Đầu ra | Giờ đề xuất | Phụ thuộc |
|---|---|---|---|---|
| T-P2-02-I | XIAN-142 | Triển khai hoàn chỉnh server/web/migration cần thiết và unit/integration test trong phạm vi Story; không đóng khi chỉ có mock/scaffold. | 32 | T12, T56, P2-01, P2-03 |
| T-P2-02-Q | XIAN-143 | Thực thi mọi AC/TC và biến thể, directAPI/socket/RLS theo quyền, E2E và dịch vụ/thiết bị thật cần thiết; hồi quy P1 phần liên quan. | 12 | T-P2-02-I |

### US-P2-03 · Giới hạn cặp Ranked trong 24 giờ

Mục yêu cầu: **P2-03**; Epic **EP-P2-01** / XIAN-108. Jira Story: XIAN-117.

**Nguồn chính xác:** BA 7.2;743; tên mục BA là định danh, dòng là vị trí lúc đối chiếu. Phụ thuộc triển khai: T14, T20.

| AC / TC chưa chạy | Given | When | Then |
|---|---|---|---|
| AC-P2-03.1 / TC-P2-03.1 | Một cặp đã bắt đầu 3 ván trong cửa sổ | Tìm ván thứ tư | Bỏ qua cặp này âm thầm, tiếp tục tìm đối thủ khác. Tính cả INTERRUPTED; không chặn theo IP hoặc thiết bị. |
| AC-P2-03.2 / TC-P2-03.2 | Thời điểm kiểm t | Đếm ván tại biên 24 giờ | Chỉ đếm started_at > t − 24 giờ và ≤ t. Ván đúng t − 24 giờ đã ra khỏi cửa sổ. |
| AC-P2-03.3 / TC-P2-03.3 | Hai lượt ghép đồng thời | Ghi thời điểm bắt đầu | Không vượt 3 ván/cặp/24 giờ; không tự ghép cùng tài khoản. |

**TC:** Mỗi TC thiết lập Given bằng dữ liệu thử cô lập, thực hiện When qua API/socket/UI theo quyền rồi đối chiếu toàn bộ Then. Không chỉ kiểm giao diện hoặc sao chép implementation làm đáp án. Các biến thể bắt buộc bổ sung: Lưu match start + queue; TC ván4 và biên chính xác24h/cùng mạng; race ghép đôi không vượt3.

| Task | Jira | Đầu ra | Giờ đề xuất | Phụ thuộc |
|---|---|---|---|---|
| T-P2-03-I | XIAN-144 | Triển khai hoàn chỉnh server/web/migration cần thiết và unit/integration test trong phạm vi Story; không đóng khi chỉ có mock/scaffold. | 16 | T14, T20 |
| T-P2-03-Q | XIAN-145 | Thực thi mọi AC/TC và biến thể, directAPI/socket/RLS theo quyền, E2E và dịch vụ/thiết bị thật cần thiết; hồi quy P1 phần liên quan. | 8 | T-P2-03-I |

### US-P2-04 · Phân quyền và vòng đời ván Ranked

Mục yêu cầu: **P2-04**; Epic **EP-P2-01** / XIAN-108. Jira Story: XIAN-118.

**Nguồn chính xác:** BA 2.0,7.2,8.1,8.3;275/743/770/791; tên mục BA là định danh, dòng là vị trí lúc đối chiếu. Phụ thuộc triển khai: T23, T32, T52, P2-01, P2-02.

| AC / TC chưa chạy | Given | When | Then |
|---|---|---|---|
| AC-P2-04.1 / TC-P2-04.1 | Khách hoặc người ngoài ván Ranked | Gọi lệnh phòng bị cấm | Server từ chối tham gia/xem/mời/chia sẻ/undo/đổi ghế/tái đấu. Chỉ hai tài khoản được ghép có quyền; phòng không PUBLIC và không nhận người mới. |
| AC-P2-04.2 / TC-P2-04.2 | Ranked 10 phút không cộng giây | Xin hòa, resign, rời hoặc mất mạng | Chỉ xin hòa sau mỗi bên ≥20 nước; hạn 30 giây, cooldown 5 nước mình. Resign/DISCONNECT tính Elo; TIMEOUT trước grace được ưu tiên; server INTERRUPTED không đổi Elo. |
| AC-P2-04.3 / TC-P2-04.3 | Ranked đã kết thúc | Một bên rời hoặc đủ 10 phút | Giữ FINISHED cho bên còn lại; không WAITING/Ready/Tái đấu. Đóng khi cả hai rời hoặc 10 phút từ kết thúc, không đặt lại hạn. |

**TC:** Mỗi TC thiết lập Given bằng dữ liệu thử cô lập, thực hiện When qua API/socket/UI theo quyền rồi đối chiếu toàn bộ Then. Không chỉ kiểm giao diện hoặc sao chép implementation làm đáp án. Các biến thể bắt buộc bổ sung: P1 online/core/clock/roles + Elo; forged direct requests cấm các quyền; TC19/20 bên, timeout vs grace/cả hai rớt/restart/end race; E2E result.

| Task | Jira | Đầu ra | Giờ đề xuất | Phụ thuộc |
|---|---|---|---|---|
| T-P2-04-I | XIAN-146 | Triển khai hoàn chỉnh server/web/migration cần thiết và unit/integration test trong phạm vi Story; không đóng khi chỉ có mock/scaffold. | 32 | T23, T32, T52, P2-01, P2-02 |
| T-P2-04-Q | XIAN-147 | Thực thi mọi AC/TC và biến thể, directAPI/socket/RLS theo quyền, E2E và dịch vụ/thiết bị thật cần thiết; hồi quy P1 phần liên quan. | 12 | T-P2-04-I |

### US-P2-05 · Quyền nhận media Ranked

Mục yêu cầu: **P2-05**; Epic **EP-P2-01** / XIAN-108. Jira Story: XIAN-119.

**Nguồn chính xác:** BA 5.4,4.1;617/526; tên mục BA là định danh, dòng là vị trí lúc đối chiếu. Phụ thuộc triển khai: T33, T58, P2-04, P2-17.

| AC / TC chưa chạy | Given | When | Then |
|---|---|---|---|
| AC-P2-05.1 / TC-P2-05.1 | Hai người vừa vào Ranked | Mở media và chat | Camera/mic mặc định Tắt; chỉ Kênh Riêng và hai mức Không chia sẻ/Chỉ đối thủ. Người nhận mặc định ẨN hình và tiếng đối thủ. |
| AC-P2-05.2 / TC-P2-05.2 | Đối thủ đang phát media | Bấm Hiện hình/tiếng hoặc Tắt ngay | Chỉ nhận khi chủ động Hiện; Tắt ngay dừng nhận hình/tiếng. Không ghi âm, ghi hình hoặc cấp quyền người xem. |
| AC-P2-05.3 / TC-P2-05.3 | Ranked có chat và sticker | Gửi hoặc reconnect | Giữ quyền đúng hai người, bộ lọc và giới hạn tốc độ. Không cấp quyền media cho người ngoài hoặc tự hiện media đã ẩn. |

**TC:** Mỗi TC thiết lập Given bằng dữ liệu thử cô lập, thực hiện When qua API/socket/UI theo quyền rồi đối chiếu toàn bộ Then. Không chỉ kiểm giao diện hoặc sao chép implementation làm đáp án. Các biến thể bắt buộc bổ sung: P1 media/chat + sticker; actual subscribed audio/video stop/start ở receiver; default hidden qua reconnect.

| Task | Jira | Đầu ra | Giờ đề xuất | Phụ thuộc |
|---|---|---|---|---|
| T-P2-05-I | XIAN-148 | Triển khai hoàn chỉnh server/web/migration cần thiết và unit/integration test trong phạm vi Story; không đóng khi chỉ có mock/scaffold. | 24 | T33, T58, P2-04, P2-17 |
| T-P2-05-Q | XIAN-149 | Thực thi mọi AC/TC và biến thể, directAPI/socket/RLS theo quyền, E2E và dịch vụ/thiết bị thật cần thiết; hồi quy P1 phần liên quan. | 12 | T-P2-05-I |

### US-P2-06 · Bảng xếp hạng và thẻ tóm tắt

Mục yêu cầu: **P2-06**; Epic **EP-P2-01** / XIAN-108. Jira Story: XIAN-120.

**Nguồn chính xác:** BA 7.1,7.3,5.5;703/754/629; tên mục BA là định danh, dòng là vị trí lúc đối chiếu. Phụ thuộc triển khai: T40, P2-01, P2-11.

| AC / TC chưa chạy | Given | When | Then |
|---|---|---|---|
| AC-P2-06.1 / TC-P2-06.1 | Danh sách tài khoản | Xem Top 50 và dòng ghim | Chỉ tài khoản ≥5 Ranked hoàn tất được xếp hạng. Có dòng cá nhân cả khi ngoài Top 50; chưa đủ ghi Chưa xếp hạng — cần thêm X ván. Khách không có bảng. |
| AC-P2-06.2 / TC-P2-06.2 | Nhiều tài khoản đồng Elo | Sắp xếp | Elo giảm, wins giảm, thời điểm đạt Elo tăng, user_id tăng. Không reset mùa. Stats/winrate chỉ Ranked; INTERRUPTED/Bỏ dở không tính. |
| AC-P2-06.3 / TC-P2-06.3 | Elo tại các biên tier | Hiển thị tier và thẻ tóm tắt | Đúng sáu tier BA 7.1; chưa đấu Ranked ghi Chưa xếp hạng. Thẻ có avatar, Display Name, @username, Elo, tier, W/D/L; không trang hồ sơ công khai, DM chỉ bạn accepted. |

**TC:** Mỗi TC thiết lập Given bằng dữ liệu thử cô lập, thực hiện When qua API/socket/UI theo quyền rồi đối chiếu toàn bộ Then. Không chỉ kiểm giao diện hoặc sao chép implementation làm đáp án. Các biến thể bắt buộc bổ sung: Elo/history/friends; TC ties/4→5/zero/floor/tiers/outside50/guest; leaderboard E2E loading/empty/error.

| Task | Jira | Đầu ra | Giờ đề xuất | Phụ thuộc |
|---|---|---|---|---|
| T-P2-06-I | XIAN-150 | Triển khai hoàn chỉnh server/web/migration cần thiết và unit/integration test trong phạm vi Story; không đóng khi chỉ có mock/scaffold. | 24 | T40, P2-01, P2-11 |
| T-P2-06-Q | XIAN-151 | Thực thi mọi AC/TC và biến thể, directAPI/socket/RLS theo quyền, E2E và dịch vụ/thiết bị thật cần thiết; hồi quy P1 phần liên quan. | 8 | T-P2-06-I |

### US-P2-07 · Ghép ngẫu nhiên Casual

Mục yêu cầu: **P2-07**; Epic **EP-P2-02** / XIAN-109. Jira Story: XIAN-121.

**Nguồn chính xác:** BA 2.0,1.8;275/259; tên mục BA là định danh, dòng là vị trí lúc đối chiếu. Phụ thuộc triển khai: T18, T20, T23, T52, T56.

| AC / TC chưa chạy | Given | When | Then |
|---|---|---|---|
| AC-P2-07.1 / TC-P2-07.1 | Tài khoản chưa có vị trí chơi | Tìm hoặc hủy Casual | Tìm tối đa 3 phút; hủy trong lúc tìm không phạt. Timeout về Sảnh, không bot; mất mạng quá 30 giây rút queue. Khách bị từ chối theo BA 0.3. |
| AC-P2-07.2 / TC-P2-07.2 | Casual vừa ghép | Xác nhận trong 10 giây | Người queued trước là Host, phe ngẫu nhiên, 15 phút/bên không cộng giây. Cả hai Ready mới đếm 3 giây; chưa Ready về Sảnh, đã Ready tự tìm tiếp. Cả hai chưa Ready cùng về Sảnh; chưa bắt đầu không xử thua. |
| AC-P2-07.3 / TC-P2-07.3 | Phòng Casual random | Gọi quyền phòng hoặc kết thúc | Không Elo/PUBLIC/người xem/chia sẻ/Kênh Chung hoặc mở settings người xem. Có private chat/media. FINISHED tới cả hai rời hoặc 10 phút từ end, không WAITING/người mới; undo/rematch theo P2-08/09. |

**TC:** Mỗi TC thiết lập Given bằng dữ liệu thử cô lập, thực hiện When qua API/socket/UI theo quyền rồi đối chiếu toàn bộ Then. Không chỉ kiểm giao diện hoặc sao chép implementation làm đáp án. Các biến thể bắt buộc bổ sung: P1 room/match/session + P2-08/09; tests races ready/timeout/disconnect/cancel, both/unilateral confirm, fixed clocks, no privilege reopening.

| Task | Jira | Đầu ra | Giờ đề xuất | Phụ thuộc |
|---|---|---|---|---|
| T-P2-07-I | XIAN-152 | Triển khai hoàn chỉnh server/web/migration cần thiết và unit/integration test trong phạm vi Story; không đóng khi chỉ có mock/scaffold. | 32 | T18, T20, T23, T52, T56 |
| T-P2-07-Q | XIAN-153 | Thực thi mọi AC/TC và biến thể, directAPI/socket/RLS theo quyền, E2E và dịch vụ/thiết bị thật cần thiết; hồi quy P1 phần liên quan. | 12 | T-P2-07-I, T-P2-08-I, T-P2-09-I |

### US-P2-08 · Xin đi lại online

Mục yêu cầu: **P2-08**; Epic **EP-P2-03** / XIAN-110. Jira Story: XIAN-122.

**Nguồn chính xác:** BA 3.2,3.6,0.12;443/513/101; tên mục BA là định danh, dòng là vị trí lúc đối chiếu. Phụ thuộc triển khai: T10, T32, P2-07.

| AC / TC chưa chạy | Given | When | Then |
|---|---|---|---|
| AC-P2-08.1 / TC-P2-08.1 | Người đã đi ít nhất một nước ở custom/Casual | Xin đi lại | Một pending mỗi người, hạn 30 giây, rút được. Người xin không đi nước mới. Đối thủ đồng ý thì lùi trước nước mình gần nhất, 1 hoặc 2 plies. Ranked và Khách bị từ chối. |
| AC-P2-08.2 / TC-P2-08.2 | Đề nghị đồng ý, từ chối hoặc hết hạn | Cập nhật quota và đồng hồ | Chỉ thành công trừ lượt, tối đa 3/bên/ván. Từ chối/hết hạn chờ 3 nước mình. Đồng hồ tiếp tục và không hoàn thời gian. |
| AC-P2-08.3 / TC-P2-08.3 | Đã undo hoặc ván kết thúc | Xét lặp, không ăn quân, Replay hoặc accept muộn | Chỉ nhánh hiệu lực được tính. Khung nonmodal; X/Esc thu gọn, không từ chối. Accept muộn không đổi kết quả; phiên bản trạng thái cũ bị từ chối. |

**TC:** Mỗi TC thiết lập Given bằng dữ liệu thử cô lập, thực hiện When qua API/socket/UI theo quyền rồi đối chiếu toàn bộ Then. Không chỉ kiểm giao diện hoặc sao chép implementation làm đáp án. Các biến thể bắt buộc bổ sung: Core move tree/receipts/proposals/clock; TC one/two plies,3→4,stale accept/end race/clock preservation/repetition branches, Ranked denied.

| Task | Jira | Đầu ra | Giờ đề xuất | Phụ thuộc |
|---|---|---|---|---|
| T-P2-08-I | XIAN-154 | Triển khai hoàn chỉnh server/web/migration cần thiết và unit/integration test trong phạm vi Story; không đóng khi chỉ có mock/scaffold. | 32 | T10, T32, P2-07 |
| T-P2-08-Q | XIAN-155 | Thực thi mọi AC/TC và biến thể, directAPI/socket/RLS theo quyền, E2E và dịch vụ/thiết bị thật cần thiết; hồi quy P1 phần liên quan. | 12 | T-P2-08-I |

### US-P2-09 · Tái đấu có chọn phe

Mục yêu cầu: **P2-09**; Epic **EP-P2-03** / XIAN-110. Jira Story: XIAN-123.

**Nguồn chính xác:** BA 0.8,2.3,5.3;82/331/601; tên mục BA là định danh, dòng là vị trí lúc đối chiếu. Phụ thuộc triển khai: T41, T46, P2-07.

| AC / TC chưa chạy | Given | When | Then |
|---|---|---|---|
| AC-P2-09.1 / TC-P2-09.1 | Custom/Casual vừa kết thúc | Xin Tái đấu | Chọn Giữ phe/Đổi phe, mặc định Đổi. Người nhận thấy lựa chọn; chấp nhận trong 30 giây thì đếm 3 giây không cần Ready, Match ID mới. Ranked/Khách không có quyền. |
| AC-P2-09.2 / TC-P2-09.2 | Tái đấu thành công | Khởi tạo ván mới | Giữ room, blocks, privacy, spectators và chat cùng cặp. Casual đặt lại 15 phút/bên; custom không dùng Tái đấu vẫn Ready/Xin đổi bên theo BA 0.7. |
| AC-P2-09.3 / TC-P2-09.3 | Hai đề nghị đồng thời hoặc hết hạn phòng | Server nhận phản hồi | Giữ offer tới trước, hủy offer sau và hiện offer đối thủ. Casual accept trước 10 phút mới hủy timer đóng; sau hạn bị từ chối. Thay ghế/kết quả cũ không hồi sinh ván. |

**TC:** Mỗi TC thiết lập Given bằng dữ liệu thử cô lập, thực hiện When qua API/socket/UI theo quyền rồi đối chiếu toàn bộ Then. Không chỉ kiểm giao diện hoặc sao chép implementation làm đáp án. Các biến thể bắt buộc bổ sung: Room/online/proposals; TC both side choices/concurrent offers/change seats/expiry/10m edge; chat isolation vẫn đúng.

| Task | Jira | Đầu ra | Giờ đề xuất | Phụ thuộc |
|---|---|---|---|---|
| T-P2-09-I | XIAN-156 | Triển khai hoàn chỉnh server/web/migration cần thiết và unit/integration test trong phạm vi Story; không đóng khi chỉ có mock/scaffold. | 24 | T41, T46, P2-07 |
| T-P2-09-Q | XIAN-157 | Thực thi mọi AC/TC và biến thể, directAPI/socket/RLS theo quyền, E2E và dịch vụ/thiết bị thật cần thiết; hồi quy P1 phần liên quan. | 8 | T-P2-09-I |

### US-P2-10 · Không giới hạn giờ và chống treo ván

Mục yêu cầu: **P2-10**; Epic **EP-P2-03** / XIAN-110. Jira Story: XIAN-124.

**Nguồn chính xác:** BA 2.1,3.3 mục5;305/458; tên mục BA là định danh, dòng là vị trí lúc đối chiếu. Phụ thuộc triển khai: T18, T23, T25.

| AC / TC chưa chạy | Given | When | Then |
|---|---|---|---|
| AC-P2-10.1 / TC-P2-10.1 | Form custom có bốn mức giờ | Chọn Không giới hạn | Không giới hạn là mặc định P2; 5/10/15 phút vẫn hoạt động, không cộng giây. Khách không chọn mức P2; AI không áp inactivity. |
| AC-P2-10.2 / TC-P2-10.2 | Bên tới lượt không đi 3 phút | Hiện cảnh báo | Banner 30 giây không modal, không che bàn cờ/Đầu hàng và không trap focus. Chỉ bên tới lượt bị hỏi; im lặng hết hạn thua INACTIVITY. |
| AC-P2-10.3 / TC-P2-10.3 | Chưa có nước mới | Bấm Tôi còn đây liên tiếp | Đặt lại 3 phút tối đa hai lần liên tiếp. Lần thứ ba không có nút; hết 30 giây thua. Đi nước mới đặt lại chuỗi nhắc. |

**TC:** Mỗi TC thiết lập Given bằng dữ liệu thử cô lập, thực hiện When qua API/socket/UI theo quyền rồi đối chiếu toàn bộ Then. Không chỉ kiểm giao diện hoặc sao chép implementation làm đáp án. Các biến thể bắt buộc bổ sung: Clock/proposals/UI; fake time thresholds, own move reset chain, inactive side no warning, no-respond result.

| Task | Jira | Đầu ra | Giờ đề xuất | Phụ thuộc |
|---|---|---|---|---|
| T-P2-10-I | XIAN-158 | Triển khai hoàn chỉnh server/web/migration cần thiết và unit/integration test trong phạm vi Story; không đóng khi chỉ có mock/scaffold. | 24 | T18, T23, T25 |
| T-P2-10-Q | XIAN-159 | Thực thi mọi AC/TC và biến thể, directAPI/socket/RLS theo quyền, E2E và dịch vụ/thiết bị thật cần thiết; hồi quy P1 phần liên quan. | 8 | T-P2-10-I |

### US-P2-11 · Lịch sử cá nhân và phân loại kết quả

Mục yêu cầu: **P2-11**; Epic **EP-P2-04** / XIAN-111. Jira Story: XIAN-125.

**Nguồn chính xác:** BA 6.2,7.3,1.3;658/754/176; tên mục BA là định danh, dòng là vị trí lúc đối chiếu. Phụ thuộc triển khai: T14, T20, T56.

| AC / TC chưa chạy | Given | When | Then |
|---|---|---|---|
| AC-P2-11.1 / TC-P2-11.1 | Tài khoản chính thức | Mở và lọc Lịch sử | Hiện tất cả/Ranked/Casual/AI, phe, đối thủ, loại, kết quả/lý do, Elo delta; AI có nhãn cấp độ. Thống kê chỉ Ranked hoàn tất. |
| AC-P2-11.2 / TC-P2-11.2 | INTERRUPTED hoặc AI Bỏ dở | Hiện lịch sử và thống kê | Có History/Replay nhưng không tính W/D/L, winrate, Elo hoặc count. Khách không History/Replay; đối thủ chính thức vẫn lưu ván với Khách. |
| AC-P2-11.3 / TC-P2-11.3 | Khách hết phiên hoặc người ngoài sở hữu | Đọc dữ liệu lịch sử | Sau hết phiên, tên Khách thành tên chung Khách. API/RLS chỉ đúng người chơi đọc; người xem và người ngoài bị từ chối. |

**TC:** Mỗi TC thiết lập Given bằng dữ liệu thử cô lập, thực hiện When qua API/socket/UI theo quyền rồi đối chiếu toàn bộ Then. Không chỉ kiểm giao diện hoặc sao chép implementation làm đáp án. Các biến thể bắt buộc bổ sung: Persistent online/AI records/auth/Elo; direct ownership/RLS tests; filter/result matrix/guest anonymization.

| Task | Jira | Đầu ra | Giờ đề xuất | Phụ thuộc |
|---|---|---|---|---|
| T-P2-11-I | XIAN-160 | Triển khai hoàn chỉnh server/web/migration cần thiết và unit/integration test trong phạm vi Story; không đóng khi chỉ có mock/scaffold. | 24 | T14, T20, T56 |
| T-P2-11-Q | XIAN-161 | Thực thi mọi AC/TC và biến thể, directAPI/socket/RLS theo quyền, E2E và dịch vụ/thiết bị thật cần thiết; hồi quy P1 phần liên quan. | 8 | T-P2-11-I, T-P2-12-I, T-P2-14-I |

### US-P2-12 · Lưu ván AI và Bỏ dở

Mục yêu cầu: **P2-12**; Epic **EP-P2-04** / XIAN-111. Jira Story: XIAN-126.

**Nguồn chính xác:** BA 6.2,6.3;658/675; tên mục BA là định danh, dòng là vị trí lúc đối chiếu. Phụ thuộc triển khai: T63, P2-11.

| AC / TC chưa chạy | Given | When | Then |
|---|---|---|---|
| AC-P2-12.1 / TC-P2-12.1 | Tài khoản chơi AI | Ván kết thúc thắng/thua/hòa/resign | Lưu matches/match_moves với type AI và EASY/MEDIUM/HARD, chỉ nhánh hiệu lực. Hoàn tất chống ghi trùng. |
| AC-P2-12.2 / TC-P2-12.2 | AI đóng tab hoặc mất kết nối | Quá 30 phút | Tài khoản có bản Bỏ dở, không W/D/L/Elo; Khách không lưu. Trong hạn, giữ cùng URL theo P1. |
| AC-P2-12.3 / TC-P2-12.3 | Engine timeout, lỗi hoặc restart | Thử lại và lưu kết quả | Timeout >10 giây giữ thế, không tự Bỏ dở. Lỗi ABANDONED thật lưu record; Retry tạo Match ID mới theo BA 6.1. Restart không giả khôi phục trạng thái P1 đã mất. |

**TC:** Mỗi TC thiết lập Given bằng dữ liệu thử cô lập, thực hiện When qua API/socket/UI theo quyền rồi đối chiếu toàn bộ Then. Không chỉ kiểm giao diện hoặc sao chép implementation làm đáp án. Các biến thể bắt buộc bổ sung: P1 AI + persistence; integration finalization/expiry/worker failure/duplicate/restart; kiểm bản ghi và replay.

| Task | Jira | Đầu ra | Giờ đề xuất | Phụ thuộc |
|---|---|---|---|---|
| T-P2-12-I | XIAN-162 | Triển khai hoàn chỉnh server/web/migration cần thiết và unit/integration test trong phạm vi Story; không đóng khi chỉ có mock/scaffold. | 24 | T63, P2-11 |
| T-P2-12-Q | XIAN-163 | Thực thi mọi AC/TC và biến thể, directAPI/socket/RLS theo quyền, E2E và dịch vụ/thiết bị thật cần thiết; hồi quy P1 phần liên quan. | 8 | T-P2-12-I |

### US-P2-13 · Replay riêng tư

Mục yêu cầu: **P2-13**; Epic **EP-P2-04** / XIAN-111. Jira Story: XIAN-127.

**Nguồn chính xác:** BA 6.2;658 + DANH-MUC §3 SCR-REPLAY;219; tên mục BA là định danh, dòng là vị trí lúc đối chiếu. Phụ thuộc triển khai: T11, T10, P2-11.

| AC / TC chưa chạy | Given | When | Then |
|---|---|---|---|
| AC-P2-13.1 / TC-P2-13.1 | Người chơi sở hữu ván | Mở /history/:id | Chỉ người chơi xem, gồm chủ ván AI; không spectator/share/route thay thế. Chỉ nhánh hiệu lực, không nước đã undo. |
| AC-P2-13.2 / TC-P2-13.2 | Replay có danh sách nước | Đầu/trước/sau/cuối/nhảy dòng | Thế và lượt đúng từng mốc; biên bản tiếng Việt. Controls ở biên không vượt danh sách nước. |
| AC-P2-13.3 / TC-P2-13.3 | Replay đang tự chạy | Thời gian trôi | 1,5 giây mỗi nước, đúng trình tự, dừng ở cuối. Replay chỉ đọc, không phát lệnh đi nước vào ván live. |

**TC:** Mỗi TC thiết lập Given bằng dữ liệu thử cô lập, thực hiện When qua API/socket/UI theo quyền rồi đối chiếu toàn bộ Then. Không chỉ kiểm giao diện hoặc sao chép implementation làm đáp án. Các biến thể bắt buộc bổ sung: History/core/tree/auth; ownership tampering/API/RLS; golden positions từng move, no undone branch/autoplay timer.

| Task | Jira | Đầu ra | Giờ đề xuất | Phụ thuộc |
|---|---|---|---|---|
| T-P2-13-I | XIAN-164 | Triển khai hoàn chỉnh server/web/migration cần thiết và unit/integration test trong phạm vi Story; không đóng khi chỉ có mock/scaffold. | 24 | T11, T10, P2-11 |
| T-P2-13-Q | XIAN-165 | Thực thi mọi AC/TC và biến thể, directAPI/socket/RLS theo quyền, E2E và dịch vụ/thiết bị thật cần thiết; hồi quy P1 phần liên quan. | 8 | T-P2-13-I, T-P2-08-I, T-P2-14-I |

### US-P2-14 · Đi lại với máy

Mục yêu cầu: **P2-14**; Epic **EP-P2-04** / XIAN-111. Jira Story: XIAN-128.

**Nguồn chính xác:** BA 6.3;675; tên mục BA là định danh, dòng là vị trí lúc đối chiếu. Phụ thuộc triển khai: T24, T34, T63.

| AC / TC chưa chạy | Given | When | Then |
|---|---|---|---|
| AC-P2-14.1 / TC-P2-14.1 | AI đã có nước của người chơi | Undo | Lùi hai plies trả lượt người; nếu máy đang nghĩ, hủy worker và lùi một nước người. Không cần máy chấp nhận; Khách bị từ chối theo BA 0.3. |
| AC-P2-14.2 / TC-P2-14.2 | Chưa có nước mình, ván ended hoặc đủ ba Undo | Bấm Undo | Từ chối/disabled có tooltip; chỉ thành công trừ một lượt, bộ đếm X/3. Người cầm Đen chỉ có nước mở đầu của máy chưa được Undo. |
| AC-P2-14.3 / TC-P2-14.3 | Worker cũ trả sau Undo | Nhận nước máy | Không áp stale result. History/Replay/lặp thế chỉ nhánh hiệu lực. |

**TC:** Mỗi TC thiết lập Given bằng dữ liệu thử cô lập, thực hiện When qua API/socket/UI theo quyền rồi đối chiếu toàn bộ Then. Không chỉ kiểm giao diện hoặc sao chép implementation làm đáp án. Các biến thể bắt buộc bổ sung: Engine cancellation/core/move tree; TC black machine-only opening/pending thought/stale worker/end/4th, history hiệu lực.

| Task | Jira | Đầu ra | Giờ đề xuất | Phụ thuộc |
|---|---|---|---|---|
| T-P2-14-I | XIAN-166 | Triển khai hoàn chỉnh server/web/migration cần thiết và unit/integration test trong phạm vi Story; không đóng khi chỉ có mock/scaffold. | 24 | T24, T34, T63 |
| T-P2-14-Q | XIAN-167 | Thực thi mọi AC/TC và biến thể, directAPI/socket/RLS theo quyền, E2E và dịch vụ/thiết bị thật cần thiết; hồi quy P1 phần liên quan. | 8 | T-P2-14-I |

### US-P2-15 · Copy FEN và tải PGN

Mục yêu cầu: **P2-15**; Epic **EP-P2-04** / XIAN-111. Jira Story: XIAN-129.

**Nguồn chính xác:** BA 9.1;807; tên mục BA là định danh, dòng là vị trí lúc đối chiếu. Phụ thuộc triển khai: P2-13.

| AC / TC chưa chạy | Given | When | Then |
|---|---|---|---|
| AC-P2-15.1 / TC-P2-15.1 | Người có quyền Replay ở một mốc nước | Copy FEN | Chuỗi thế hiện tại chính xác; đọc lại đúng quân và lượt. Không xuất nhánh đã undo. |
| AC-P2-15.2 / TC-P2-15.2 | Người có quyền Replay | Download PGN | Tệp .pgn có biên bản nhánh hiệu lực đúng ván; đọc lại đúng thế/kết quả. Không gọi dịch vụ cờ ngoài. |
| AC-P2-15.3 / TC-P2-15.3 | Người ngoài, Khách hoặc người xem không quyền | Gọi API xuất | Bị từ chối theo quyền Replay kể cả đoán Match ID. |

**TC:** Mỗi TC thiết lập Given bằng dữ liệu thử cô lập, thực hiện When qua API/socket/UI theo quyền rồi đối chiếu toàn bộ Then. Không chỉ kiểm giao diện hoặc sao chép implementation làm đáp án. Các biến thể bắt buộc bổ sung: P2-13/core notation; golden FEN roundtrip/PGN đọc lại, clipboard/download E2E, permission denied.

| Task | Jira | Đầu ra | Giờ đề xuất | Phụ thuộc |
|---|---|---|---|---|
| T-P2-15-I | XIAN-168 | Triển khai hoàn chỉnh server/web/migration cần thiết và unit/integration test trong phạm vi Story; không đóng khi chỉ có mock/scaffold. | 16 | P2-13 |
| T-P2-15-Q | XIAN-169 | Thực thi mọi AC/TC và biến thể, directAPI/socket/RLS theo quyền, E2E và dịch vụ/thiết bị thật cần thiết; hồi quy P1 phần liên quan. | 4 | T-P2-15-I |

### US-P2-16 · QR mời phòng

Mục yêu cầu: **P2-16**; Epic **EP-P2-05** / XIAN-112. Jira Story: XIAN-130.

**Nguồn chính xác:** BA 2.2,2.4,4.3;320/361/554; tên mục BA là định danh, dòng là vị trí lúc đối chiếu. Phụ thuộc triển khai: T26, T53.

| AC / TC chưa chạy | Given | When | Then |
|---|---|---|---|
| AC-P2-16.1 / TC-P2-16.1 | Phòng custom đang mở | Hiện QR ở waiting/invite | QR chứa cùng link token với mã tám ký tự, không quyền chơi/xem riêng. Có tải ảnh hoặc copy QR; Khách không sử dụng chức năng P2. |
| AC-P2-16.2 / TC-P2-16.2 | Người quét QR chưa đăng nhập | Login/signup sau quét | Giữ đích và tự join theo quyền/sức chứa hiện tại. Quét điện thoại thật mở đúng URL; không cấp QR cho Khách theo BA 0.3. |
| AC-P2-16.3 / TC-P2-16.3 | Host khóa rồi mở lại | Dùng QR cũ hoặc mới | LOCKED thu hồi QR/link/mã chưa dùng. Mở lại sinh QR/link/code mới; QR cũ bị từ chối. |

**TC:** Mỗi TC thiết lập Given bằng dữ liệu thử cô lập, thực hiện When qua API/socket/UI theo quyền rồi đối chiếu toàn bộ Then. Không chỉ kiểm giao diện hoặc sao chép implementation làm đáp án. Các biến thể bắt buộc bổ sung: P1 link/access/permissions; decode golden QR→đúng URL, scan điện thoại thật→join, oldQR rejected.

| Task | Jira | Đầu ra | Giờ đề xuất | Phụ thuộc |
|---|---|---|---|---|
| T-P2-16-I | XIAN-170 | Triển khai hoàn chỉnh server/web/migration cần thiết và unit/integration test trong phạm vi Story; không đóng khi chỉ có mock/scaffold. | 12 | T26, T53 |
| T-P2-16-Q | XIAN-171 | Thực thi mọi AC/TC và biến thể, directAPI/socket/RLS theo quyền, E2E và dịch vụ/thiết bị thật cần thiết; hồi quy P1 phần liên quan. | 8 | T-P2-16-I |

### US-P2-17 · Bộ 12 sticker

Mục yêu cầu: **P2-17**; Epic **EP-P2-05** / XIAN-112. Jira Story: XIAN-131.

**Nguồn chính xác:** BA 5.1,5.3,5.4;570/601/617; tên mục BA là định danh, dòng là vị trí lúc đối chiếu. Phụ thuộc triển khai: T37, T42, P2-18.

| AC / TC chưa chạy | Given | When | Then |
|---|---|---|---|
| AC-P2-17.1 / TC-P2-17.1 | Người đúng vai trò/kênh | Mở khay và gửi sticker | Đủ 12: clap, heart, think, sweat, cry, tea, lightning, silent, thumbsup, handshake, flag, fire. Một chạm gửi; lưu shortcode, hiển thị SVG. |
| AC-P2-17.2 / TC-P2-17.2 | Player, spectator hoặc accepted friend | Gửi private/public/direct | Quyền như chat text: spectator chỉ public, DM chỉ accepted friend, Ranked chỉ private. Không bypass filter/rate/length; Khách không gửi sticker P2. |
| AC-P2-17.3 / TC-P2-17.3 | Shortcode không hợp lệ hoặc quyền giả | Gọi API/socket | Server kiểm allowlist và quyền, không XSS hoặc ghi HTML tùy ý. |

**TC:** Mỗi TC thiết lập Given bằng dữ liệu thử cô lập, thực hiện When qua API/socket/UI theo quyền rồi đối chiếu toàn bộ Then. Không chỉ kiểm giao diện hoặc sao chép implementation làm đáp án. Các biến thể bắt buộc bổ sung: P1 chat + P2-18; schema/unknown shortcode validation, E2E picker/role/channels, rate tests.

| Task | Jira | Đầu ra | Giờ đề xuất | Phụ thuộc |
|---|---|---|---|---|
| T-P2-17-I | XIAN-172 | Triển khai hoàn chỉnh server/web/migration cần thiết và unit/integration test trong phạm vi Story; không đóng khi chỉ có mock/scaffold. | 16 | T37, T42, P2-18 |
| T-P2-17-Q | XIAN-173 | Thực thi mọi AC/TC và biến thể, directAPI/socket/RLS theo quyền, E2E và dịch vụ/thiết bị thật cần thiết; hồi quy P1 phần liên quan. | 4 | T-P2-17-I |

### US-P2-18 · Chat trực tiếp và tin chưa đọc

Mục yêu cầu: **P2-18**; Epic **EP-P2-05** / XIAN-112. Jira Story: XIAN-132.

**Nguồn chính xác:** BA 5.2,5.5,8.2;592/629/782; tên mục BA là định danh, dòng là vị trí lúc đối chiếu. Phụ thuộc triển khai: T14, T31, T37, T40.

| AC / TC chưa chạy | Given | When | Then |
|---|---|---|---|
| AC-P2-18.1 / TC-P2-18.1 | Hai tài khoản là accepted friends | Đọc/gửi DM | History bền; API/socket/RLS chỉ hai thành viên. Stranger/Khách bị từ chối. Unfriend thu hồi ngay và ẩn history; refriend hiện lại. |
| AC-P2-18.2 / TC-P2-18.2 | Tin đến chưa đọc từ bạn hiện tại | Tính badge và read | Badge tổng incoming unread, không tin mình gửi. Chỉ read khi visible viewport ở active tab; tải ngầm/background không read. Server đồng bộ thiết bị. |
| AC-P2-18.3 / TC-P2-18.3 | Unfriend rồi refriend | Tính lại unread | Unfriend bỏ hội thoại khỏi badge nhưng giữ trạng thái đọc. Refriend chỉ tin vẫn chưa đọc tính lại, không tự read hoặc biến read thành unread. |

**TC:** Mỗi TC thiết lập Given bằng dữ liệu thử cô lập, thực hiện When qua API/socket/UI theo quyền rồi đối chiếu toàn bộ Then. Không chỉ kiểm giao diện hoặc sao chép implementation làm đáp án. Các biến thể bắt buộc bổ sung: P1 friends/auth/chat/filter; forged API/socket/RLS third party; E2E background/hidden/viewport/tab active/multi-device/unfriend races.

| Task | Jira | Đầu ra | Giờ đề xuất | Phụ thuộc |
|---|---|---|---|---|
| T-P2-18-I | XIAN-174 | Triển khai hoàn chỉnh server/web/migration cần thiết và unit/integration test trong phạm vi Story; không đóng khi chỉ có mock/scaffold. | 32 | T14, T31, T37, T40 |
| T-P2-18-Q | XIAN-175 | Thực thi mọi AC/TC và biến thể, directAPI/socket/RLS theo quyền, E2E và dịch vụ/thiết bị thật cần thiết; hồi quy P1 phần liên quan. | 12 | T-P2-18-I |

### US-P2-19 · Thách đấu bạn bè

Mục yêu cầu: **P2-19**; Epic **EP-P2-05** / XIAN-112. Jira Story: XIAN-133.

**Nguồn chính xác:** BA 2.7 mục4;397; tên mục BA là định danh, dòng là vị trí lúc đối chiếu. Phụ thuộc triển khai: T18, T31, T40.

| AC / TC chưa chạy | Given | When | Then |
|---|---|---|---|
| AC-P2-19.1 / TC-P2-19.1 | Bạn accepted đang Online | Mở Thách đấu | Dùng form Create: tên, mặc định 10 phút/CODE_ONLY/5 người xem, chỉnh hợp lệ. Hủy không tạo phòng hoặc gửi lời mời. |
| AC-P2-19.2 / TC-P2-19.2 | Đã xác nhận form | Tạo phòng và mời | Chỉ confirm mới tạo/gửi. Server kiểm một vị trí chơi và recheck bạn online; không mời bạn bận/offline. Khách không có quyền. |
| AC-P2-19.3 / TC-P2-19.3 | Bạn vừa bận, từ chối hoặc hết hạn | Sau khi phòng đã tạo | Phòng vẫn tồn tại cho Host quản lý; không tự đóng, chuyển sang AI hoặc ghi đã chấp nhận. |

**TC:** Mỗi TC thiết lập Given bằng dữ liệu thử cô lập, thực hiện When qua API/socket/UI theo quyền rồi đối chiếu toàn bộ Then. Không chỉ kiểm giao diện hoặc sao chép implementation làm đáp án. Các biến thể bắt buộc bổ sung: P1 friends/create/invite + unlimited nếu enabled; E2E cancel/confirm/race busy/reject; one-position server.

| Task | Jira | Đầu ra | Giờ đề xuất | Phụ thuộc |
|---|---|---|---|---|
| T-P2-19-I | XIAN-176 | Triển khai hoàn chỉnh server/web/migration cần thiết và unit/integration test trong phạm vi Story; không đóng khi chỉ có mock/scaffold. | 16 | T18, T31, T40 |
| T-P2-19-Q | XIAN-177 | Thực thi mọi AC/TC và biến thể, directAPI/socket/RLS theo quyền, E2E và dịch vụ/thiết bị thật cần thiết; hồi quy P1 phần liên quan. | 4 | T-P2-19-I |

### US-P2-20 · Đổi username qua OTP

Mục yêu cầu: **P2-20**; Epic **EP-P2-06** / XIAN-113. Jira Story: XIAN-134.

**Nguồn chính xác:** BA 1.4,1.6;195/235; tên mục BA là định danh, dòng là vị trí lúc đối chiếu. Phụ thuộc triển khai: T04, T09, T56, T65.

| AC / TC chưa chạy | Given | When | Then |
|---|---|---|---|
| AC-P2-20.1 / TC-P2-20.1 | Tài khoản muốn đổi username | Thực hiện bốn bước OTP | Email OTP sáu số/180 giây, resend 60 giây, giới hạn gần đúng năm sai theo BA 1.5. Valid OTP mới mở username mới 3–20, unique không phân biệt hoa thường; không cooldown đổi tên. |
| AC-P2-20.2 / TC-P2-20.2 | Username cũ đã đổi | Đăng ký hoặc đổi lại trong 30 ngày | Tên cũ giữ 30 ngày chỉ chủ cũ lấy lại. Người khác thấy đã có người dùng; đúng 30 ngày hết giữ chỗ. |
| AC-P2-20.3 / TC-P2-20.3 | Đổi username thành công hoặc cố đổi email | Kiểm bản ghi và API | Giữ UUID, friends, messages, matches và Elo; email readonly và server bất biến. Không tự đổi Display Name. |

**TC:** Mỗi TC thiết lập Given bằng dữ liệu thử cô lập, thực hiện When qua API/socket/UI theo quyền rồi đối chiếu toàn bộ Then. Không chỉ kiểm giao diện hoặc sao chép implementation làm đáp án. Các biến thể bắt buộc bổ sung: Auth/SMTP/name reservation + all persistent features; TC rename collisions/owner reclaim/30d boundary/OTP invalid/directAPI, data integrity before-after.

| Task | Jira | Đầu ra | Giờ đề xuất | Phụ thuộc |
|---|---|---|---|---|
| T-P2-20-I | XIAN-178 | Triển khai hoàn chỉnh server/web/migration cần thiết và unit/integration test trong phạm vi Story; không đóng khi chỉ có mock/scaffold. | 24 | T04, T09, T56, T65 |
| T-P2-20-Q | XIAN-179 | Thực thi mọi AC/TC và biến thể, directAPI/socket/RLS theo quyền, E2E và dịch vụ/thiết bị thật cần thiết; hồi quy P1 phần liên quan. | 8 | T-P2-20-I |

### US-P2-21 · Khôi phục username và mật khẩu

Mục yêu cầu: **P2-21**; Epic **EP-P2-06** / XIAN-113. Jira Story: XIAN-135.

**Nguồn chính xác:** BA 1.7,1.5;247/226; tên mục BA là định danh, dòng là vị trí lúc đối chiếu. Phụ thuộc triển khai: T04, T09, T56.

| AC / TC chưa chạy | Given | When | Then |
|---|---|---|---|
| AC-P2-21.1 / TC-P2-21.1 | Email có hoặc không tài khoản | Yêu cầu khôi phục | Cùng thông báo Nếu email này đã đăng ký, mã khôi phục đã được gửi. Không lộ Username/presence trước OTP valid; email nằm trong state, không URL. |
| AC-P2-21.2 / TC-P2-21.2 | OTP sáu số/180 giây, resend 60 giây | Xác minh đúng hoặc sai | Chỉ valid mới hiện username hiện tại; OTP không cấp quyền ứng dụng. Chỉ quên username thì về Login với mật khẩu cũ; tài khoản Google cũng dùng được. |
| AC-P2-21.3 / TC-P2-21.3 | Muốn đặt lại mật khẩu | Nhập ít nhất tám ký tự và xác nhận | Đăng xuất mọi phiên khác, về Login và bắt đăng nhập mới. Mismatch/invalid OTP không reset, không tự đăng nhập. |

**TC:** Mỗi TC thiết lập Given bằng dữ liệu thử cô lập, thực hiện When qua API/socket/UI theo quyền rồi đối chiếu toàn bộ Then. Không chỉ kiểm giao diện hoặc sao chép implementation làm đáp án. Các biến thể bắt buộc bổ sung: Auth/SMTP/session; enumeration/no-app-access assertions/direct session refresh; real OTP được phép + mock automated.

| Task | Jira | Đầu ra | Giờ đề xuất | Phụ thuộc |
|---|---|---|---|---|
| T-P2-21-I | XIAN-180 | Triển khai hoàn chỉnh server/web/migration cần thiết và unit/integration test trong phạm vi Story; không đóng khi chỉ có mock/scaffold. | 24 | T04, T09, T56 |
| T-P2-21-Q | XIAN-181 | Thực thi mọi AC/TC và biến thể, directAPI/socket/RLS theo quyền, E2E và dịch vụ/thiết bị thật cần thiết; hồi quy P1 phần liên quan. | 8 | T-P2-21-I |

### US-P2-22 · Widget thông số AI

Mục yêu cầu: **P2-22**; Epic **EP-P2-07** / XIAN-114. Jira Story: XIAN-136.

**Nguồn chính xác:** BA 9.2;813; tên mục BA là định danh, dòng là vị trí lúc đối chiếu. Phụ thuộc triển khai: T24, T59, T38.

| AC / TC chưa chạy | Given | When | Then |
|---|---|---|---|
| AC-P2-22.1 / TC-P2-22.1 | AI đang tính | Widget cập nhật | Nodes, depth, latency và PV từ worker thật, không giả số; không dịch vụ cờ ngoài. |
| AC-P2-22.2 / TC-P2-22.2 | Worker hoàn tất hoặc hết budget | Đối chiếu telemetry | Widget khớp trace actual depth/time/nodes/best PV đúng ván; giữ ngưỡng P1. Worker đã hủy không cập nhật nhầm widget. |
| AC-P2-22.3 / TC-P2-22.3 | Người đang tới lượt | Dùng widget | Không tính hint cho bên người; PV là đầu ra máy đang tính. Giữ No Hint theo BA 6.1. |

**TC:** Mỗi TC thiết lập Given bằng dữ liệu thử cô lập, thực hiện When qua API/socket/UI theo quyền rồi đối chiếu toàn bộ Then. Không chỉ kiểm giao diện hoặc sao chép implementation làm đáp án. Các biến thể bắt buộc bổ sung: Engine telemetry/UI; compare worker metrics với widget, trace actual depth/budget, board no-hint remains.

| Task | Jira | Đầu ra | Giờ đề xuất | Phụ thuộc |
|---|---|---|---|---|
| T-P2-22-I | XIAN-182 | Triển khai hoàn chỉnh server/web/migration cần thiết và unit/integration test trong phạm vi Story; không đóng khi chỉ có mock/scaffold. | 12 | T24, T59, T38 |
| T-P2-22-Q | XIAN-183 | Thực thi mọi AC/TC và biến thể, directAPI/socket/RLS theo quyền, E2E và dịch vụ/thiết bị thật cần thiết; hồi quy P1 phần liên quan. | 4 | T-P2-22-I |

### US-P2-23 · Công cụ demo mạng

Mục yêu cầu: **P2-23**; Epic **EP-P2-07** / XIAN-114. Jira Story: XIAN-137.

**Nguồn chính xác:** BA 9.3;825; tên mục BA là định danh, dòng là vị trí lúc đối chiếu. Phụ thuộc triển khai: T12, T52.

| AC / TC chưa chạy | Given | When | Then |
|---|---|---|---|
| AC-P2-23.1 / TC-P2-23.1 | Môi trường bật demo flag | Giả lập player 1 mất mạng | Socket ngắt, player 2 thấy grace 60 giây và dùng cơ chế online thật. Không có vai trò Admin. |
| AC-P2-23.2 / TC-P2-23.2 | Demo đang trong grace | Reconnect tức thì | Snapshot bàn cờ, đồng hồ, vai trò đúng server. Không coi mô phỏng là kiểm LAN thiết bị thật. |
| AC-P2-23.3 / TC-P2-23.3 | Môi trường chính thức tắt demo flag | Gọi trực tiếp lệnh giả lập | UI không hiện, server từ chối API/socket giả lập. Không mở quyền cho người ngoài phòng. |

**TC:** Mỗi TC thiết lập Given bằng dữ liệu thử cô lập, thực hiện When qua API/socket/UI theo quyền rồi đối chiếu toàn bộ Then. Không chỉ kiểm giao diện hoặc sao chép implementation làm đáp án. Các biến thể bắt buộc bổ sung: Socket/demo config; positive demo grace60s/snapshot, negative production direct socket/API, không coi simulation là LAN thật.

| Task | Jira | Đầu ra | Giờ đề xuất | Phụ thuộc |
|---|---|---|---|---|
| T-P2-23-I | XIAN-184 | Triển khai hoàn chỉnh server/web/migration cần thiết và unit/integration test trong phạm vi Story; không đóng khi chỉ có mock/scaffold. | 12 | T12, T52 |
| T-P2-23-Q | XIAN-185 | Thực thi mọi AC/TC và biến thể, directAPI/socket/RLS theo quyền, E2E và dịch vụ/thiết bị thật cần thiết; hồi quy P1 phần liên quan. | 4 | T-P2-23-I |

### US-P2-24 · Chuyển thiết bị media giữa các tab

Mục yêu cầu: **P2-24**; Epic **EP-P2-07** / XIAN-114. Jira Story: XIAN-138.

**Nguồn chính xác:** BA 1.8;259 + DANH-MUC §6;292; tên mục BA là định danh, dòng là vị trí lúc đối chiếu. Phụ thuộc triển khai: T33, T56, T58.

| AC / TC chưa chạy | Given | When | Then |
|---|---|---|---|
| AC-P2-24.1 / TC-P2-24.1 | Hai tab cùng thiết bị | Tab thứ hai bật camera/mic tranh thiết bị | Hiện MODAL-MEDIA-TAB-SWITCH với Chuyển thiết bị sang tab này và Hủy bỏ. |
| AC-P2-24.2 / TC-P2-24.2 | Người chọn Chuyển | Trao thiết bị | Thu hồi/dừng track và quyền phát cũ, tab cũ chỉ đọc. Tab mới bật theo quyền; hành vi P1 tiếp quản với mặc định Tắt vẫn đúng. |
| AC-P2-24.3 / TC-P2-24.3 | Hủy hoặc tab cũ reconnect | Xử lý quyền | Hủy không tự lấy thiết bị; reconnect không tự giành control/media. Chỉ thao tác chủ động có quyền mới chuyển. |

**TC:** Mỗi TC thiết lập Given bằng dữ liệu thử cô lập, thực hiện When qua API/socket/UI theo quyền rồi đối chiếu toàn bộ Then. Không chỉ kiểm giao diện hoặc sao chép implementation làm đáp án. Các biến thể bắt buộc bổ sung: Session/media ownership; E2E2tab accepted/cancel/reconnect + real track stop/publish permissions.

| Task | Jira | Đầu ra | Giờ đề xuất | Phụ thuộc |
|---|---|---|---|---|
| T-P2-24-I | XIAN-186 | Triển khai hoàn chỉnh server/web/migration cần thiết và unit/integration test trong phạm vi Story; không đóng khi chỉ có mock/scaffold. | 16 | T33, T56, T58 |
| T-P2-24-Q | XIAN-187 | Thực thi mọi AC/TC và biến thể, directAPI/socket/RLS theo quyền, E2E và dịch vụ/thiết bị thật cần thiết; hồi quy P1 phần liên quan. | 8 | T-P2-24-I |

### US-P2-25 · Giấy Sáng và Theo hệ thống

Mục yêu cầu: **P2-25**; Epic **EP-P2-07** / XIAN-114. Jira Story: XIAN-139.

**Nguồn chính xác:** BA 10.3;866 + DESIGN §2.3;90; tên mục BA là định danh, dòng là vị trí lúc đối chiếu. Phụ thuộc triển khai: T03, T65.

| AC / TC chưa chạy | Given | When | Then |
|---|---|---|---|
| AC-P2-25.1 / TC-P2-25.1 | Người chưa chọn theme | Mở ứng dụng | Kỳ Đài Cổ Phong mặc định; Giấy Sáng/Theo hệ thống có trong settings. Phông theo DESIGN 3.1; Khách không chọn P2 theo BA 0.3. |
| AC-P2-25.2 / TC-P2-25.2 | Đã chọn Theo hệ thống hoặc theme rõ ràng | OS đổi dark/light | Theo hệ thống phản ứng OS, theme rõ ràng giữ lựa chọn. Màu bàn cờ không đổi giữa các theme. |
| AC-P2-25.3 / TC-P2-25.3 | Mọi theme tại bốn kích thước | Kiểm states và trợ năng | Giữ DESIGN: keyboard, contrast, reduced motion, không cuộn ngang, không che bàn cờ/Đầu hàng/đồng hồ. SUCCESS/LOADING/EMPTY/ERROR/DISABLED có đủ giải thích. |

**TC:** Mỗi TC thiết lập Given bằng dữ liệu thử cô lập, thực hiện When qua API/socket/UI theo quyền rồi đối chiếu toàn bộ Then. Không chỉ kiểm giao diện hoặc sao chép implementation làm đáp án. Các biến thể bắt buộc bổ sung: P1 tokens/settings/board; compare board tokens, contrast mọi trạng thái, E2E OS dark/light/explicit theme/4sizes.

| Task | Jira | Đầu ra | Giờ đề xuất | Phụ thuộc |
|---|---|---|---|---|
| T-P2-25-I | XIAN-188 | Triển khai hoàn chỉnh server/web/migration cần thiết và unit/integration test trong phạm vi Story; không đóng khi chỉ có mock/scaffold. | 24 | T03, T65 |
| T-P2-25-Q | XIAN-189 | Thực thi mọi AC/TC và biến thể, directAPI/socket/RLS theo quyền, E2E và dịch vụ/thiết bị thật cần thiết; hồi quy P1 phần liên quan. | 8 | T-P2-25-I |

## Kịch bản nghiệm thu P2

- Chạy đủ 75 TC và mọi biến thể của 25 Story, kiểm cả API/socket/RLS và UI.
- Dùng dữ liệu Elo, biên thời gian, nhánh Undo và thế Replay có đáp án độc lập; đối chiếu kết quả lưu bền.
- Kiểm QR bằng điện thoại thật, receiver media Ranked, chuyển media giữa hai tab, OTP/Google/RLS bằng môi trường được phép.
- Kiểm hồi quy D1–D10, 12 NFR và 9 gate; ghi phần chưa có điều kiện thật là BLOCKED, không nhận PASS từ mock.
- Kiểm bản sao mới, hướng dẫn chạy, migration và dữ liệu thử; rà bí mật trong Git/bundle/bằng chứng.
- Liên kết code/commit/PR và báo cáo TC tới issue trước Done; tích hợp develop/main và xác minh remote theo goal.
