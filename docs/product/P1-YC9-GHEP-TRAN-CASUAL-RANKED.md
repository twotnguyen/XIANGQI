# P1 · YC9 — Ghép trận Casual, Đánh Hạng (Ranked), Elo và Bảng xếp hạng

**Ngày lập:** 31/10/2026. **Phạm vi:** gói Ranked (US-P2-01…06 / XIAN-115…120), Đánh Thường ghép ngẫu nhiên (US-P2-07 / XIAN-121), phần Casual của Xin đi lại (XIAN-122) và Tái đấu (XIAN-123), phần Ranked của Lịch sử/thống kê (XIAN-125). Tất cả thuộc **P1 theo [BA 0.27](BA-SCOPE-DECISIONS.md)**; mã `US-P2-*`/`AC-P2-*` chỉ là định danh truy vết.

**Trạng thái:** mới chốt đặc tả. Chưa có mã, migration (Elo, hàng đợi, bảng xếp hạng), test hay Task Jira riêng. Baseline ước lượng cũ: Ranked 212 giờ, Casual 44 giờ (chưa gồm phần Casual của Xin đi lại/Tái đấu), chưa tái ước lượng. **PO chốt 31/10: giữ hạn 04/11/2026, hạng mục chưa xong ghi BLOCKED, không hạ ngưỡng.**

> YC9 **không thuộc tám yêu cầu gốc** của khách hàng; PO bổ sung ngày 31/10. Khi thiếu thời gian, ưu tiên hoàn thiện YC1–YC8 trước (điều kiện PO chọn khi giữ hạn).

## 1. Mục tiêu và nguồn

Cho người chơi tìm đối thủ lạ mà không cần mời: **Đánh Thường** (ghép ngẫu nhiên, không Elo) và **Đánh Hạng** (ghép theo Elo, có bảng xếp hạng).

Nguồn, theo thứ tự ưu tiên: BA Phần 0 (0.3, 0.8, 0.13–0.14, 0.17, 0.22–0.27) → BA 2.0, 3.2–3.6, 5.3–5.5, 7.1–7.3, 8.1–8.3 → [BACKLOG-P2](BACKLOG-P2.md) (AC-P2-01…07, phần Casual của 08/09, phần Ranked của 11) → [DANH-MUC](../design/DANH-MUC-MAN-HINH-XIANGQI.md) (`MODAL-MATCHMAKING`, `SCR-LEADERBOARD`, `MODAL-MATCH-RESULT`).

## 2. Phạm vi và ranh giới

| Thuộc YC9 | Không thuộc YC9 |
|---|---|
| Sảnh: hai lối vào Ghép ngẫu nhiên và Đánh Hạng | Phòng tự tạo, mời, Thách đấu (YC2, YC3) |
| Hàng đợi Casual và Ranked, `MODAL-MATCHMAKING` | Luật cờ, đồng hồ, kết quả ván (YC4, YC5) |
| Vòng đời phòng ghép (`FINISHED` 10 phút, không `WAITING`) | Chat, camera/mic (YC7), chỉ nêu quyền riêng của phòng ghép |
| Elo, K-factor, tier, giới hạn cặp 24 giờ | Ván với máy (YC8) |
| Bảng xếp hạng Top 50, thẻ tóm tắt, hiển thị Elo (mục 8) | Giải đấu, mùa giải, hồ sơ công khai (BA 10.2) |

## 3. Vai trò và quyền

| Hành động | Thành viên | Khách |
|---|---|---|
| Đánh Thường ghép ngẫu nhiên | Có | **Có** (PO xác nhận 0.27) |
| Xin đi lại trong Casual | Có | Có, cùng quota và cooldown (0.22 mục 6) |
| Tái đấu Casual | Có | **Không** (0.20 mục 6; PO xác nhận, mục 12 điểm a) |
| Đánh Hạng, Elo, lên bảng xếp hạng | Có | **Không**; nút `DISABLED` kèm tooltip |
| Xem bảng xếp hạng | Có | Không có bảng (AC-P2-06.1) |

Một người chỉ ngồi một vị trí chơi tại một thời điểm (BA 1.8). Đang có ghế/ván/hàng đợi thì cả hai nút ghép bị `DISABLED` với tooltip *"Bạn đang ở trong một ván/phòng khác"*.

## 4. Đánh Thường ghép ngẫu nhiên (US-P2-07)

1. Bấm **Ghép ngẫu nhiên** → vào hàng đợi trong RAM máy chủ, mở `MODAL-MATCHMAKING`, có **Hủy tìm trận** bất kỳ lúc nào, không phạt.
2. Tìm tối đa **2 phút** (PO 31/10, mục 16); không ghép bot. Hết 2 phút: báo không tìm được, về Sảnh.
3. Mất kết nối quá **30 giây** trong hàng đợi: tự rút. Máy chủ khởi động lại: hàng đợi mất, báo *"Hàng đợi đã bị huỷ, hãy tìm lại"*, không phạt.
4. Ghép được: **hộp xác nhận 30 giây** (Xác nhận/Từ chối, mục 16.1). Người vào hàng đợi trước là Host, phe ngẫu nhiên, **15 phút/bên**, không cộng giây.
5. Cả hai Xác nhận trong hạn → đếm 3-2-1 → ván. Hết 30 giây hoặc Từ chối: người đó về Sảnh; người đã Xác nhận tự tìm tiếp với đồng hồ tìm mới 2 phút; cả hai chưa xác nhận → cả hai về Sảnh. Chưa bắt đầu ván thì không ghi thua.
6. Phòng ghép: không PUBLIC, không người xem, không chia sẻ link/mã, không Kênh Chung, không Cài đặt người xem; chỉ Kênh Riêng và media giữa hai người.
7. Sau ván: phòng giữ `FINISHED`, **không** về `WAITING`, không nhận người mới. Một người rời thì người còn lại giữ màn kết quả. Đóng khi cả hai rời hoặc **10 phút kể từ khi kết thúc ván**, không đặt lại hạn khi một người rời.
8. **Xin đi lại** Casual: cùng luật 3.2/3.6 (tối đa 3 lần thành công/bên/ván, đối thủ đồng ý trong 30 giây, lùi 1 hoặc 2 nửa nước, không hoàn giờ).
9. **Tái đấu** Casual: chọn Giữ phe/Đổi phe (mặc định Đổi), đối thủ có 30 giây, đồng ý → đếm 3 giây → Match ID mới, đặt lại 15 phút/bên, không cần Sẵn sàng; chỉ hợp lệ trước hạn đóng 10 phút.

## 5. Đánh Hạng (US-P2-02, 03, 04, 05)

### 5.1 Hàng đợi và ghép cặp
- Chỉ tài khoản chính thức, chưa có vị trí chơi. Bấm **Tìm trận Xếp hạng** → `MODAL-MATCHMAKING`.
- Biên Elo ban đầu **±100**, mở thêm **±50 mỗi 10 giây**, đạt **±400 ở giây 60** và giữ đến hết **2 phút**; mốc 120 giây thử ghép lần cuối rồi mới hết hạn. Hai người có biên khác nhau thì dùng biên lớn hơn.
- Hết 2 phút không ghép được: báo *"Không tìm được đối thủ, vui lòng tìm lại sau"*, không phạt, không bot.
- Hủy tìm được cho đến khi ghép được; sau khi ghép chỉ còn Xác nhận/Từ chối trong 30 giây rồi đếm 3-2-1 (mục 16.1, thay "vào bàn cờ ngay").
- Mất kết nối quá 30 giây thì rút khỏi hàng đợi. Người đang xếp hàng hiển thị 🟠 Đang đấu, không nhận lời mời.

### 5.2 Giới hạn cặp
Một cặp tối đa **3 ván Ranked/24 giờ**, đếm theo `started_at` trong cửa sổ trượt (`> t − 24h` và `≤ t`), **kể cả ván `INTERRUPTED`**. Cặp chạm trần bị bỏ qua âm thầm, tiếp tục tìm người khác, không báo lý do. Không chặn theo IP hay thiết bị. Hai lượt ghép đồng thời không được vượt trần.

### 5.3 Quyền và vòng đời ván Ranked
- Ghép ngẫu nhiên 100%; **cấm** người xem, mời, chia sẻ, Undo, đổi ghế/Xin đổi bên, Tái đấu, PUBLIC. Khách không tham gia.
- 10 phút/bên, không cộng giây. Xin hòa chỉ khi **mỗi bên đã đi ≥ 20 nước**, hạn 30 giây, bị từ chối thì chờ 5 nước của chính mình. Hòa tính S = 0,5.
- Đầu hàng, rời phòng giữa ván, quá 60 giây mất kết nối: thua và trừ Elo bình thường. Hết giờ trước ân hạn: `TIMEOUT` được ưu tiên.
- Máy chủ tự ghi nhận sự cố (khởi động lại, mất CSDL): `INTERRUPTED`, **giữ Elo cả hai**. Hai người cùng mất mạng khi máy chủ bình thường **không** phải `INTERRUPTED`; xử theo BA 0.23 (bên mất trước thua; trùng timestamp tuyệt đối thì hòa riêng).
- Sau ván: `FINISHED`, mỗi người phải **Rời phòng** trước khi tìm trận mới; một người rời không đưa phòng về `WAITING`. Đóng khi cả hai rời hoặc 10 phút, không đặt lại hạn.

### 5.4 Chat và media
Chỉ Kênh Riêng giữa hai người; 12 sticker và bộ lọc dùng như YC7. Camera/mic mặc định Tắt, mức chia sẻ chỉ có Không chia sẻ / Chỉ đối thủ. **Hình và tiếng đối thủ mặc định ẨN ở phía người nhận** cho đến khi bấm *"Hiện hình/tiếng đối thủ"*; luôn có nút **Tắt ngay**. Không ghi, không lưu.

## 6. Elo (US-P2-01)

- Elo khởi tạo **1200**. Kỳ vọng `E = 1 / (1 + 10^((R_đối thủ − R_mình)/400))`; điểm mới `R' = R + K × (S − E)`, S = 1 / 0,5 / 0.
- **K = 32** cho 30 ván Ranked hoàn tất đầu tiên, **K = 16** từ ván 31. Ván thứ 30 còn dùng K = 32, ván thứ 31 dùng K = 16. Chỉ ván Ranked **hoàn tất** được đếm.
- Tính độc lập từng bên từ Elo trước ván và số ván hoàn tất trước ván này. Làm tròn số nguyên gần nhất (.5 làm tròn lên), rồi áp sàn **100**. Không ép tổng biến động bằng 0.
- Casual, AI, `INTERRUPTED` không đổi Elo và không đếm ván. Mỗi ván Ranked chỉ cập nhật Elo **một lần**, kể cả khi lệnh kết quả gửi trùng. Đầu hàng ngay nước 1 vẫn tính bình thường.
- Tier: Người mới (< 1200), Sơ cấp (1200–1399), Trung cấp (1400–1599), Cao cấp (1600–1799), Kiện tướng (1800–1999), Đại sư (≥ 2000). Chưa có ván Ranked nào: nhãn *"Chưa xếp hạng"* (Elo 1200 vẫn dùng để ghép).

## 7. Bảng xếp hạng (US-P2-06)

- `/leaderboard`: **Top 50** theo Elo, kèm tier, thắng/thua/hòa và tỷ lệ thắng (chỉ ván Ranked).
- Chỉ tài khoản có **≥ 5 ván Ranked hoàn tất** được xếp hạng. Dòng ghim cá nhân luôn hiện ở đáy, kể cả khi ngoài Top 50; chưa đủ thì ghi *"Chưa xếp hạng — cần thêm X ván"*. Khách không có bảng.
- Đồng điểm: Elo giảm dần → nhiều ván thắng hơn → đạt Elo đó sớm hơn → `user_id` tăng dần. Không reset theo ngày/tuần/mùa.
- Thẻ tóm tắt (khi bấm tên): avatar, Display Name, `@username`, Elo, tier, W/D/L. Không có trang hồ sơ công khai; nút Nhắn tin chỉ hiện với bạn đã accepted.
- `INTERRUPTED` và Bỏ dở không tính vào W/D/L.

## 8. Hiển thị Elo — PO chốt 31/10/2026

| Mã | Nơi hiển thị | Nội dung |
|---|---|---|
| AC-YC9-HT-01 | `MODAL-MATCH-RESULT` ván Ranked | Cả hai người: Elo trước → sau và mức tăng/giảm (ví dụ `1200 → 1216 (+16)`), tier. `INTERRUPTED`: ghi *"Elo giữ nguyên"*. Casual/AI/custom không hiện Elo |
| AC-YC9-HT-02 | Lịch sử ván (`/history`) | Cột biến động Elo cho ván Ranked; ván khác và `INTERRUPTED` hiện *"—"* |
| AC-YC9-HT-03 | Thẻ đối thủ trong phòng Ranked | Avatar, Display Name, `@username`, Elo, tier ngay khi vào ván |
| AC-YC9-HT-04 | Hồ sơ cá nhân và navbar | Elo, tier, hạng (#) của chính mình; chưa xếp hạng thì nhãn *"Chưa xếp hạng — cần thêm X ván"*. Khách không thấy |

Mọi số Elo lấy từ ván Ranked thật; không dựng số liệu giả (BA 7.3).

## 9. Giao diện và trạng thái

- Sảnh có bốn lựa chọn hoạt động; không còn `DISABLED` + "Sắp ra mắt" cho Ghép ngẫu nhiên, Đánh Hạng, Bảng xếp hạng (BA 0.27).
- `MODAL-MATCHMAKING`: Đang tìm (đồng hồ, Hủy), Đã ghép (xác nhận 10 giây ở Casual; khóa Hủy ở Ranked), Hết thời gian, Hàng đợi bị hủy, Lỗi + Thử lại. Đủ năm trạng thái theo `SCR-RULE-01`.
- `SCR-LEADERBOARD`: SUCCESS, LOADING (khung xương), EMPTY (chưa ai đủ 5 ván), ERROR + Thử lại, DISABLED cho Khách kèm giải thích.
- Nút đang xử lý chặn bấm đúp (`SCR-RULE-04`); responsive từ 360 px; tiếng Việt; WCAG 2.1 AA; mockup có `SCR-LEADERBOARD.html`, `index.html` chứa `MODAL-MATCHMAKING`.

## 10. Hợp đồng dữ liệu và an toàn (theo AGENTS.md)

- Ghi kết quả và Elo trong **cùng một transaction** Postgres qua `RoomTransactions.withRoom` (khóa actor đã sắp xếp, rồi khóa phòng đã sắp xếp), lệnh mang `commandId` và biên lai; tác dụng phụ Socket.IO đi qua `outbox`.
- Controller → Service → Store: SQL chỉ nằm trong `*.store.ts`; phụ thuộc giữa miền qua `*Port`.
- Hàng đợi chỉ trong RAM; ghép cặp phải nguyên tử, không ghép một tài khoản với chính nó, không để hai lượt ghép cùng chiếm một người.
- Đếm cặp 24 giờ đọc từ bảng ván (`started_at`), không từ cache.
- Migration mới kèm bản `rollback/`; không sửa migration đã áp dụng. Chưa có migration nào cho YC9.
- API/socket/RLS phải kiểm trực tiếp, không chỉ qua giao diện: Khách gọi lệnh Ranked bị từ chối, đoán ID ván, lệnh cũ/trùng.

## 11. Ca biên bắt buộc

1. Hủy đúng lúc `MATCH_FOUND`; hủy đồng thời với khởi động lại; mất mạng 29/30/31 giây trong hàng đợi.
2. Mốc 59,999 / 60 giây của hàng đợi Ranked; biên khác nhau giữa hai người.
3. Ván thứ 3 và thứ 4 của một cặp trong 24 giờ; ván đúng mốc `t − 24h`; hai lượt ghép đồng thời.
4. Ván 30/31 đổi K; Elo chạm sàn 100; kết quả .5; K hai bên khác nhau.
5. Kết quả gửi trùng, hai tab, hai thiết bị (đăng nhập thiết bị khác giữa ván Ranked xử thua theo BA 1.8).
6. Hai người cùng mất mạng đúng timestamp; `TIMEOUT` so với `DISCONNECT`.
7. Casual/Ranked: cả hai chưa xác nhận; một người xác nhận rồi tự tìm tiếp; Tái đấu sát mốc đóng 10 phút.
8. Khách gọi lệnh Ranked bằng API; Khách Tái đấu Casual.
9. Bảng xếp hạng đồng điểm; người đúng 5 ván; người dưới 5 ván.

## 12. Quyết định và giả định

**Đã chốt (PO):** đưa toàn bộ vào P1 (0.27); Khách chơi được Casual, không Ranked; lập YC9 riêng; giữ hạn 04/11 và ghi BLOCKED khi chưa xong; bốn nơi hiển thị Elo ở mục 8.

**PO xác nhận 31/10/2026 — bảy điểm a–g:**

| # | Điểm | Mặc định |
|---|---|---|
| a | Khách Tái đấu trong Casual | Không (nhất quán 0.20) |
| b | Làm mới bảng xếp hạng | Đọc lại khi mở trang, có nút làm mới; không realtime |
| c | Người chưa đủ 5 ván Ranked | Hiện Elo 1200 kèm nhãn "Chưa xếp hạng" |
| d | Elo đối thủ trong phòng Ranked | Hiện (AC-YC9-HT-03) |
| e | Khách mở Casual có tính vào "1 phòng đang mở" | Không tính |
| f | Rủi ro bơm Elo (đầu hàng ngay nước 1, tài khoản luân phiên) | Chấp nhận; chỉ giới hạn cặp 3 ván/24 giờ |
| g | NFR-01 dưới 100 ms (đo cũ ≈ 1,9 giây) | Giữ ngưỡng; không đạt ghi BLOCKED |

## 13. Truy vết

| Nhóm | AC nguồn (BACKLOG-P2) |
|---|---|
| Elo | AC-P2-01.1–3 |
| Hàng đợi Ranked | AC-P2-02.1–3 |
| Giới hạn cặp | AC-P2-03.1–3 |
| Quyền, vòng đời Ranked | AC-P2-04.1–3 |
| Media Ranked | AC-P2-05.1–3 |
| Bảng xếp hạng | AC-P2-06.1–3 |
| Casual ghép ngẫu nhiên | AC-P2-07.1–3 |
| Xin đi lại / Tái đấu — phần Casual | AC-P2-08.1–3, AC-P2-09.1–3 |
| Lịch sử — phần Ranked | AC-P2-11.1–3 |
| Hiển thị Elo (bổ sung) | AC-YC9-HT-01…04 |

Tổng: 30 AC nguồn dùng lại (7 Story × 3 + AC-P2-08, 09, 11) + 4 AC hiển thị Elo (AC-YC9-HT-01…04) + 7 AC rà soát (AC-YC9-RV-01…07). Đây là truy vết yêu cầu, **không phải kết quả PASS**.

## 14. Kịch bản demo

Xem D11 (Casual) và D12 (Ranked + bảng xếp hạng) ở [BACKLOG-P1 §8](BACKLOG-P1.md#8-kịch-bản-demo-đầu-cuối-d1d10).

## 15. Bàn giao

Còn thiếu để vào triển khai: Task và ước lượng giờ cho YC9, migration (Elo/ván Ranked/hàng đợi), mockup `MODAL-MATCH-RESULT` có Elo, và gate kiểm chứng cho đồng thời hàng đợi. Chưa cập nhật Jira, giờ hay Sprint trong lượt này.

## 16. Quyết định PO khi rà soát YC9 — 31/10/2026

**Chưa triển khai.** Mục này **thay** các con số "tìm 3 phút", "tìm Ranked 60 giây", "xác nhận Casual 10 giây" và "Ranked vào ván ngay" ở mục 4 và 5 (đã sửa tại chỗ) cùng BA 2.0, 7.1, 7.2.

### 16.1 Luồng ghép trận thống nhất cho Đánh Thường và Đánh Hạng

1. **Tìm trận:** bấm Tìm → vào hàng đợi, `MODAL-MATCHMAKING` có đồng hồ tìm và **Hủy tìm trận** (không phạt). Không hiện số người đang tìm.
2. **Hết 2 phút** không ghép được: dừng tìm, báo *"Không tìm được đối thủ, vui lòng tìm lại sau"*, về Sảnh, không phạt, không bot. Áp dụng cho cả Casual và Ranked.
3. **Ranked:** biên Elo ±100, mở thêm ±50 mỗi 10 giây đến ±400 ở giây 60, giữ ±400 đến hết 2 phút; mốc 120 giây thử ghép lần cuối rồi mới hết hạn. Hai người có biên khác nhau dùng biên lớn hơn.
4. **Ghép được:** hiện **hộp xác nhận 30 giây** với hai nút **Xác nhận / Từ chối**. Hộp không hiện tên hoặc Elo đối thủ (chống né đối thủ mạnh); thông tin đối thủ chỉ hiện khi cả hai đã xác nhận.
5. **Cả hai Xác nhận** → đếm 3-2-1 → máy chủ kiểm lại hai bên còn kết nối → vào phòng/ván. Đồng hồ chỉ chạy từ lúc ván bắt đầu. Casual: người vào hàng đợi trước là Host, phe ngẫu nhiên, 15 phút/bên; Ranked: phe ngẫu nhiên, 10 phút/bên.
6. **Một người Từ chối hoặc để hết 30 giây:** người đó về Sảnh và **không tự tìm tiếp**; nếu bên kia đã Xác nhận thì **tự quay lại hàng đợi với đồng hồ tìm mới 2 phút**; nếu cả hai chưa xác nhận thì cả hai về Sảnh. Không phạt, không tính vào giới hạn cặp, chưa có ván nên không ghi thua.
7. Mất kết nối quá 30 giây khi đang tìm thì rút khỏi hàng đợi; reload ngắn trong 30 giây thì giữ nguyên lượt tìm. Máy chủ khởi động lại: hàng đợi mất, báo *"Hàng đợi đã bị huỷ, hãy tìm lại"*.
8. Trạng thái `MODAL-MATCHMAKING`: Đang tìm, Hộp xác nhận, Chờ đối thủ xác nhận, Hết thời gian, Hàng đợi bị hủy, Lỗi + Thử lại. Có âm báo khi tìm thấy trận (mặc định, theo quyết định chỉ báo bằng âm thanh ở YC5).

### 16.2 Cờ cấu hình dev/demo

- **Cờ tắt giới hạn cặp 3 ván/24 giờ** và **hạ ngưỡng 5 ván Ranked** để lên bảng xếp hạng (giá trị hạ do dev chọn, ví dụ 1 ván). Mặc định **BẬT luật thật** ở môi trường phát hành/nghiệm thu; chỉ dev/demo mới tắt.
- Khi cờ tắt, AC-P2-03.1–3 và AC-P2-06.1 (ngưỡng 5) không được ghi PASS; D12 ghi rõ chạy ở chế độ nào.

### 16.3 Giao điểm với YC5 (đã chốt)

- **Hủy ván** khi chưa có nước đi: có ở Casual, **không** có ở Ranked (YC5 mục 17). Ván Casual bị hủy giữ vòng đời `FINISHED`.
- **Xin hòa** Casual không ngưỡng nước tối thiểu; Ranked chỉ sau 20 nước mỗi bên.
- Đi nước = tự Từ chối Xin hòa/Xin đi lại áp dụng cả Casual; Ranked không có Xin đi lại.

### 16.4 Tiêu chí bổ sung

| Mã | Given / When | Then bắt buộc |
|---|---|---|
| AC-YC9-RV-01 | Một người tìm Casual hoặc Ranked, không có đối thủ | Sau 2 phút dừng và báo không tìm được đối thủ; Ranked giữ ±400 từ giây 60 đến 120; không phạt, không bot |
| AC-YC9-RV-02 | Hai người ghép được | Cả hai thấy hộp xác nhận 30 giây (Xác nhận/Từ chối) không có tên và Elo đối thủ; âm báo khi tìm thấy trận |
| AC-YC9-RV-03 | Cả hai bấm Xác nhận | Đếm 3-2-1, máy chủ kiểm lại kết nối, vào ván; đồng hồ chỉ chạy từ lúc ván bắt đầu; chỉ một ván được tạo |
| AC-YC9-RV-04 | Một người Từ chối hoặc để hết 30 giây; người kia đã Xác nhận | Người từ chối/hết giờ về Sảnh, không tìm tiếp; người đã xác nhận quay lại hàng đợi với đồng hồ tìm mới 2 phút; không phạt, không tính giới hạn cặp |
| AC-YC9-RV-05 | Cả hai chưa xác nhận hết 30 giây | Cả hai về Sảnh, không tìm tiếp |
| AC-YC9-RV-06 | Cờ dev/demo tắt giới hạn cặp và hạ ngưỡng bảng; hai tài khoản chơi nhiều ván Ranked | Ghép lại được không bị chặn; bảng xếp hạng hiện khi đạt ngưỡng đã hạ; bật luật thật thì áp dụng 3 ván/24 giờ và 5 ván |
| AC-YC9-RV-07 | Reload ngắn hoặc mất kết nối 29/31 giây khi đang tìm | Dưới 30 giây giữ nguyên lượt tìm; từ 30 giây trở lên rút khỏi hàng đợi |

**PO xác nhận:** hạn tìm 2 phút cho cả hai loại; hộp xác nhận 30 giây cho cả hai loại; có nút Từ chối; người đã xác nhận tìm tiếp với đồng hồ mới 2 phút; không hiện số người đang tìm; cờ dev/demo.
**PO xác nhận 31/10/2026:** (a) hộp xác nhận không hiện tên/Elo đối thủ; (b) có âm báo khi tìm thấy trận; (c) Từ chối nhiều lần không bị phạt (chấp nhận rủi ro né đối thủ mạnh ở Ranked).

### 16.5 Tác động triển khai (chưa làm)

- Hàng đợi trong RAM, bước xác nhận 30 giây hai phía, quay lại hàng đợi, cờ cấu hình ở server; `MODAL-MATCHMAKING` thêm trạng thái hộp xác nhận; thay các hằng 180 giây, 60 giây, 10 giây theo mục 16.1.
- Cập nhật BACKLOG-P2 AC-P2-02.1/02.2, AC-P2-07.1/07.2 (ghi chú trỏ về mục này), D11/D12 và mockup `index.html` (`MODAL-MATCHMAKING`).
