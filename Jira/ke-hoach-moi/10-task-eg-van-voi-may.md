# Kế hoạch mới (bản nháp) — 10: Task của Epic EG — Đánh với máy

**Ngày:** 2026-10-04 · **Trạng thái:** ĐỀ XUẤT, chờ PO và nhóm duyệt · Chưa tạo gì trên Jira. Khung, phụ thuộc và Sprint: `01-components-epic-khung-task.md`; Description Epic: `02-epic.md`.

Epic gồm **6 task**. Mỗi task: dòng đầu (Epic, thành phần, Sprint, **is blocked by**) lấy từ khung; **Bắt đầu khi (kết quả cần có)** nêu hiện vật cụ thể của từng tiền đề. Chưa có ước lượng giờ và người nhận việc (nhóm điền khi Sprint Planning).

### TG-01 — Máy cờ: tiến trình riêng, IPC, negamax/alpha-beta ba cấp, tìm tĩnh, progress
**Epic:** EG · **Thành phần:** AI · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `TC-04`, `T0-08`
**Bắt đầu khi (kết quả cần có):** TC-04: luật hợp lệ và kết quả lặp/chiếu/120; T0-08: số đo PoC ngân sách/IPC trên máy ghi cấu hình.

**Mục tiêu:** Tạo tiến trình máy cờ tự viết dùng chung luật, trả nước tốt nhất trong ngân sách. Đây là đầu ra thuật toán cho EG, không phải dịch vụ gợi ý cho người chơi.

**Yêu cầu / nguồn:** US-AI-02: AC-AI-02-01 — thời gian tính ba cấp; AC-AI-02-03 — không nước sai. NFR-05 theo docs/02 §9.5. Nguồn bổ sung: docs/02 §9; docs/04 §8; docs/05 §3.2.

**Kết quả (đầu ra):** Tiến trình riêng, tìm sâu dần negamax/alpha-beta, tìm tĩnh/bảng chuyển vị cấp Khó, progress và result có định danh tác vụ; assertion/instrumentation từng nút tìm tĩnh kèm fixture/seed cho TG-06 theo docs/05 §3.2.

**Phạm vi / ngoài phạm vi:** Ba cấp P1; không API cờ ngoài, widget/gợi ý hoặc undo P2.

**Đầu vào cần có:** Gói luật TC, FEN/lịch sử/cấp/ngân sách theo IPC dự kiến; bộ thế từ PoC.

**Cách làm gợi ý:**

1. Tìm sâu dần, sắp nước và lượng giá theo docs/02; giữ kết quả độ sâu hoàn tất.
2. Cấp 2/4/6 dùng 300/1000/3000 ms; ngẫu nhiên Dễ/Trung bình theo §9.3.
3. Khi bị chiếu tìm mọi nước thoát, không stand-pat; hết nước luôn trả điểm thua.

**Kiểm thử:** Vitest thuật toán và đo qua tiến trình thật. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Ba cấp | Tìm trên cùng bộ thế có seed cho cấp ngẫu nhiên | Nước hợp lệ, ngân sách/độ sâu ghi thực |
| Ca 2 | Tìm tĩnh | Thế bị chiếu chỉ thoát bằng nước không ăn | Chọn nước thoát, không đứng yên |
| Ca 3 | Hết nước | Thế chiếu hết/hết nước ở biên sâu | Điểm thua, không lượng giá thường |
| Ca 4 | IPC | Huỷ việc rồi trả progress/result cũ | Định danh đủ để máy chủ bỏ kết quả cũ |
| Ca 5 | Assertion nội bộ | Gắn kiểm từng nút tìm tĩnh trên bộ thế bị chiếu/chân trời với trace/seed | Không nút đang chiếu dùng điểm tĩnh làm cận dưới; xét cả nước thoát không ăn; hết nước ở biên sâu trả thua, không điểm tĩnh |

**PASS khi:** Mọi ca đúng luật và assertion từng nút tìm tĩnh đạt; báo số đo ban đầu, GATE-AI đầy đủ chỉ kết luận sau TG-06. Sai ca bắt buộc: FAIL; chưa kiểm/thiếu điều kiện: NOT_RUN/BLOCKED.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** IPC là thiết kế cần review; điểm lượng giá là khởi đầu được tinh chỉnh. Không hạ độ sâu/loại cấp Khó để báo đạt.

---

### TG-02 — Máy chủ: ván với máy (chọn cấp/phe, một vị trí chơi, vào lại 30 phút)
**Epic:** EG · **Thành phần:** AI · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `TG-01`, `TD-02`, `TB-01`
**Bắt đầu khi (kết quả cần có):** TG-01: tiến trình tìm nước và IPC; TD-02: xử lý nước tuần tự/luật dùng lại được; TB-01: máy trạng thái phòng và sổ vị trí ROOM/AI có khóa theo người dùng.

**Mục tiêu:** Quản lý ván AI trong bộ nhớ cùng quy tắc một vị trí chơi. Người chơi chọn phe/cấp và vào lại đúng ván khi mất kết nối.

**Yêu cầu / nguồn:** US-AI-01, US-AI-02, US-AI-03: AC-AI-01-01 — ba cấp/phe ngẫu nhiên 50/50; AC-AI-01-02 — máy Đỏ đi trước; AC-AI-02-02 — không giờ/Elo/xin hòa; AC-AI-03-01 — kết thúc do luật/đầu hàng; AC-AI-03-02 — giữ 30 phút. Nguồn bổ sung: BA 6.3, 1.8; docs/03 §2.13; docs/04 §4.2, §8; docs/07 §7.

**Kết quả (đầu ra):** ai.start/move/sync, bộ kết thúc AI một lần với lý do/kết quả, state/biên lai memory, registry ROOM/AI và hook chiếm/giải phóng vị trí. Snapshot kết quả cho modal TG-04; dữ liệu banner quay lại. Không phát “rảnh” khi vị trí chưa giải phóng.

**Phạm vi / ngoài phạm vi:** AI P1 chỉ memory; không lịch sử bền, undo, đồng hồ người chơi hoặc PERSIST_FAILED.

**Đầu vào cần có:** FEN/hàm luật, cấp/phe thực tế, danh tính và registry vị trí chung TB-01. Đầu vào mới bắt buộc: TB-01: máy trạng thái phòng và sổ vị trí ROOM/AI có khóa theo người dùng.

**Cách làm gợi ý:**

1. Chiếm vị trí dưới khóa người từ TB-01; bốc phe ở server, máy Đỏ đi đầu nếu người cầm Đen.
2. Tách adapter memory khỏi DB online TD-02, dùng luật TC-04 qua TG-01; kiểm Match ID/version/task ID trước áp nước máy.
3. Sau mỗi nước người hoặc máy, phân xử CHECKMATE/STALEMATE → PERPETUAL_CHECK → DRAW_REPETITION → DRAW_NO_CAPTURE. RESIGN khi đầu hàng; không Xin hòa/DRAW_AGREEMENT, không TIMEOUT người chơi.
4. Kết thúc một lần, hủy tìm, chặn move/result muộn và phát snapshot kết quả. Rời sau kết thúc giải phóng đúng vị trí; kết thúc không tự đồng nghĩa đã rời.
5. Mất mạng giữ 30 phút; chủ động rời/đăng xuất đã xác nhận RESIGN ngay, hủy tìm/giải phóng; giữ hook vị trí cho bạn bè. Không cần TD-04 CASUAL để tạo kết thúc AI.

**Kiểm thử:** Vitest tích hợp dịch vụ/tiến trình. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Phe/cấp | Ba cấp với Đỏ/Đen/Ngẫu nhiên | Máy Đỏ đi trước, phe lưu đúng |
| Ca 2 | Một vị trí | Vào ghế và ai.start đồng thời | Chỉ một vị trí, không ván mồ côi |
| Ca 3 | Vào lại | Đóng tab rồi vào trước/sau 30 phút | Cùng thế trong hạn; quá hạn ABANDONED |
| Ca 4 | Chủ động | Huỷ/đồng ý rời hoặc đăng xuất | Huỷ giữ ván; đồng ý RESIGN và huỷ tìm |
| Ca 5 | Registry dùng chung | Cùng người đồng thời room.join ghế và ai.start, sau đó rời ván đã xác nhận | Chỉ một vị trí; rời giải phóng đúng, không xóa vị trí khác |
| Ca 6 | Kết thúc luật | Thế gây chiếu hết/hết nước/chiếu liên tục/lặp/120; thử nước cuối từ người và worker | Theo TC-04, hết nước thua, chiếu hết ưu tiên hòa; kết quả chỉ chốt một lần trong memory |
| Ca 7 | Sau kết thúc | Gửi move, result tác vụ cũ, đầu hàng lặp | Không thêm nước/tìm kiếm hoặc ghi đè kết quả; retry không nhân kết thúc |

**PASS khi:** Mọi ca đạt, không ghi bền ván AI P1 hoặc xử mất mạng như chủ động đầu hàng. Sai ca bắt buộc: FAIL; chưa kiểm/thiếu điều kiện: NOT_RUN/BLOCKED.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** TB-01 đã là tiền đề chung. Phải kiểm adapter memory không gọi ghi DB/PERSIST_FAILED; restart không phục hồi giả thế AI đã mất.

---

### TG-03 — Máy chủ: sự cố máy cờ (watchdog, hàng đợi, Bỏ dở, Thử lại)
**Epic:** EG · **Thành phần:** AI · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `TG-01`, `TG-02`
**Bắt đầu khi (kết quả cần có):** TG-01: IPC progress/result và tiến trình riêng; TG-02: vòng đời AI, vị trí chơi và biên lai memory.

**Mục tiêu:** Phân biệt máy bận với tiến trình hỏng và trả đúng loại Thử lại. Không áp kết quả tìm đến muộn vào ván mới.

**Yêu cầu / nguồn:** US-AI-04: AC-AI-04-01 — lỗi/quá hạn thành Bỏ dở; AC-AI-04-02 — thử lại tạo Match ID mới giữ phe thực tế. AC-AI-02-04 — ENGINE_BUSY giữ ván/lượt. Nguồn bổ sung: docs/02 §9.4; docs/04 §8; docs/07 §7.

**Kết quả (đầu ra):** Hàng đợi, watchdog, hủy/tái tạo tiến trình và hai nhánh Thử lại idempotent.

**Phạm vi / ngoài phạm vi:** Sự cố AI P1; không hạ cấp tự động hoặc hồi sinh ABANDONED.

**Đầu vào cần có:** budgetMs, mốc vào hàng/bắt đầu tìm, progress hợp lệ gần nhất, Match ID/version/task ID.

**Cách làm gợi ý:**

1. Chờ worker tối đa 3 giây, vượt trả ENGINE_BUSY không đi lại nước người.
2. Hạn cứng budgetMs+2000: dừng worker; có progress dùng nước gần nhất, không có thì lỗi.
3. Crash/không phản hồi quá 10 giây xử Bỏ dở; retry tạo ván mới cùng cấp/phe đã bốc.

**Kiểm thử:** Vitest tích hợp giết/treo tiến trình và thời gian điều khiển. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Bận | Giữ mọi worker bận quá 3 giây, thử lại | Cùng ván/thế, chỉ xếp lại tìm |
| Ca 2 | Watchdog | Quá budget+2000 có/không progress | Có thì dùng nước đã hoàn tất; không thì Bỏ dở |
| Ca 3 | Crash/retry | Giết worker, bấm Thử lại trùng | Một ván mới, giữ phe thực tế |
| Ca 4 | Kết quả cũ | Result sau huỷ/rời/tạo ván mới | Bị bỏ, không đổi thế |

**PASS khi:** Mọi ca đạt, không nhân đôi nước/ván và không dùng nước trái luật từ worker. Sai ca bắt buộc: FAIL; chưa kiểm/thiếu điều kiện: NOT_RUN/BLOCKED.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** Ghi riêng thời gian tính và chờ; watchdog fallback không được dùng để tuyên bố đạt ngân sách GATE-AI.

### TG-04 — Web: chọn cấp độ/phe, ván với máy, thông báo sự cố
**Epic:** EG · **Thành phần:** Frontend · **Sprint đề xuất:** 3 (11/10–14/10) · **Bắt đầu khi (is blocked by):** `T0-10`, `T0-03`, `TC-10`, `TH-01`, `TC-09`, `TH-02`
**Bắt đầu khi (kết quả cần có):** T0-10: ứng dụng React/Vite với router và kết nối shared chạy được; T0-03: hợp đồng AI/ack/lỗi; TC-10: bàn cờ, đánh dấu và âm thanh; TH-01: token Kỳ Đài Cổ Phong và nút/modal/tooltip/thông báo với focus, năm trạng thái; TC-09: tương tác kéo thả dùng cùng tọa độ/nước hợp lệ với click, thả sai trượt về; TH-02: shell Sảnh/điều hướng, vị trí ghép chuông, thẻ AI và banner quay lại.

**Mục tiêu:** Dựng hành trình chọn cấp/phe và chơi với máy trên web. Phân biệt rõ tiếp tục ván bận và bắt đầu ván mới sau sự cố.

**Yêu cầu / nguồn:** US-AI-01, US-AI-02, US-AI-03, US-AI-04: AC-AI-01-02 — lật bàn Đen; AC-AI-03-01 — modal kết quả AI chỉ Rời phòng; AC-AI-03-03 — ẩn undo/lịch sử; AC-AI-03-04 — xác nhận rời/đăng xuất; AC-AI-04-02 — retry sau Bỏ dở tạo ván mới. Nguồn bổ sung: DANH-MUC SCR-AI-GAME, MODAL-AI-SETUP; docs/07 §7. US-BOARD-03: AC-BOARD-03-02 — dùng song song click/kéo trên cảm ứng.

**Kết quả (đầu ra):** Ba thẻ cấp, setup phe, màn AI, banner quay lại, trạng thái đang tìm/bận/lỗi, xác nhận rời và MODAL-MATCH-RESULT cho kết thúc bình thường chỉ có Rời phòng.

**Phạm vi / ngoài phạm vi:** UI P1; không gợi ý, Xin hòa, undo, lưu lịch sử hay widget AI.

**Đầu vào cần có:** Bàn cờ và adapter shared; fixture ENGINE_BUSY/ABANDONED/kết quả, route /ai/:id. Đầu vào mới bắt buộc: TH-01: token Kỳ Đài Cổ Phong và nút/modal/tooltip/thông báo với focus, năm trạng thái; TC-09: tương tác kéo thả dùng cùng tọa độ/nước hợp lệ với click, thả sai trượt về; TH-02: shell Sảnh/điều hướng, vị trí ghép chuông, thẻ AI và banner quay lại.

**Cách làm gợi ý:**

1. Chọn phe không tự bốc client; dùng phe server trả để lật bàn.
2. Khóa thao tác nước khi máy tìm và hiển thị lỗi theo loại.
3. Nối hành vi rời/đăng xuất xác nhận; quay lại không tạo ván khác.
4. Dùng TH-01 cho nút/modal; gắn thẻ AI/banner quay lại vào shell TH-02; nối kéo thả TC-09 vào cùng lệnh với click.

**Kiểm thử:** Playwright UI với fixture hợp đồng. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Phe | Chọn Đen, nhận máy đi đầu | Bàn lật và lượt đúng |
| Ca 2 | Ẩn P2 | Mở AI trong P1 | Không nút ngoài phạm vi |
| Ca 3 | Thử lại | Nhận hai lỗi bận/Bỏ dở | Gọi hai ý định đúng, không tự gửi lại nước người |
| Ca 4 | Rời | Huỷ rồi xác nhận | Huỷ không gửi lệnh; đồng ý chờ kết quả server |
| Ca 5 | Kéo thả/Sảnh | Mở AI từ TH-02, kéo sai/đúng ở hai phe rồi về Sảnh với ván dở | Đúng tọa độ/phản hồi, một banner quay lại cùng ván |
| Ca 6 | Kết quả bình thường | Fixture thắng/thua/hòa luật hoặc RESIGN | Modal đúng kết quả, chỉ Rời phòng; không Tái đấu/Xem lại/Xin hòa. Không nhầm với ABANDONED do sự cố có Thử lại |

**PASS khi:** Mọi ca UI đạt, năm trạng thái đúng; không báo AI thật hoạt động trước TG-05. Sai ca bắt buộc: FAIL; chưa kiểm/thiếu điều kiện: NOT_RUN/BLOCKED.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** TC-09, TH-01/02 đã là đầu vào; snapshot thật/phiên bản ván chỉ được xác nhận tại TG-05. Không dựng banner AI có nguồn trạng thái riêng.

---

### TG-05 — Tích hợp ván với máy (web ↔ máy chủ ↔ máy cờ)
**Epic:** EG · **Thành phần:** Frontend, AI · **Sprint đề xuất:** 4 (15/10–17/10) · **Bắt đầu khi (is blocked by):** `TG-02`, `TG-03`, `TG-04`
**Bắt đầu khi (kết quả cần có):** TG-02: ai.start/move/sync và registry; TG-03: hàng đợi/watchdog/retry; TG-04: UI AI và adapter lỗi.

**Mục tiêu:** Nối màn AI với dịch vụ và tiến trình thật. Chứng minh trọn luồng ba cấp, vào lại và phục hồi lỗi đúng luật.

**Yêu cầu / nguồn:** US-AI-01, US-AI-02, US-AI-03, US-AI-04: AC-AI-02-03 — không nước sai; AC-AI-03-02 — vào lại 30 phút; AC-AI-03-04 — rời chủ động khác mất mạng; AC-AI-04-02 — retry ván mới. Nguồn bổ sung: docs/05 D8, D10; docs/07 §7; docs/08 nhóm G.

**Kết quả (đầu ra):** Luồng web ↔ server ↔ worker chạy thật và E2E ba cấp/phe/lỗi.

**Phạm vi / ngoài phạm vi:** P1 đầy đủ ba cấp; không mô phỏng worker làm bằng chứng đạt thuật toán.

**Đầu vào cần có:** Cặp nối: TG-04 adapter ↔ TG-02/03 dịch vụ ↔ TG-01 IPC; banner quay lại dùng cùng Match ID.

**Cách làm gợi ý:**

1. Chạy các tổ hợp cấp/phe bằng worker thật.
2. Kiểm một vị trí bằng fixture registry ROOM và giải phóng fixture. Không gọi đây là D8 E2E; D8 sau ván online/rời ghế thật giao TQ-04.
3. Ngắt tab, giết worker, bấm trùng retry và gửi kết quả cũ để kiểm trạng thái.

**Kiểm thử:** Playwright E2E, Vitest tích hợp lỗi tiến trình. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Registry thành phần | Chiếm ROOM bằng fixture TB-01, gọi ai.start, giải phóng fixture rồi gọi lại | Chặn trước, nhận sau; không ghi D8 đạt từ fixture |
| Ca 2 | Cấp/phe | Ba cấp và ba lựa chọn phe | Phe/lượt đúng, mọi nước hợp lệ |
| Ca 3 | D10 | Vào lại trước/sau 30 phút | Giữ đúng thế hoặc Bỏ dở |
| Ca 4 | Lỗi/quyền | Bận/crash; user khác mở /ai/:id | Retry đúng loại; người ngoài bị chặn |
| Ca 5 | Kết thúc thật | Nạp thế thử rồi đi bằng UI/worker thật gây chiếu hết/hết nước/hòa luật, thử đầu hàng | TG-02 chốt một kết quả, TG-04 hiện modal chỉ Rời phòng; không đi/tìm tiếp |
| Ca 6 | Hai phía/kết quả muộn | Thử nước cuối từ người và máy, gửi lại result cũ | UI/snapshot cùng kết quả; không nhân kết thúc/hồi sinh ván |

**PASS khi:** Các ca AI tích hợp thật về cấp/phe/nước/kết thúc/vào lại/rời chủ động/sự cố đạt; registry ROOM ghi rõ fixture. GATE-AI do TG-06 kết luận, D8 online→AI đầy đủ do TQ-04 chạy. Không coi hai phần đó đạt từ kiểm thành phần; sai hành vi bắt buộc trong phạm vi thì FAIL.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** TC-09 và TH-02 đã là tổ tiên qua TG-04, không thiếu kéo thả/Sảnh. Task chưa nhận đường online kết thúc/rời ghế nên D8 đầy đủ ở TQ-04. Tách thời gian tìm và thời gian người dùng chờ.

---

### TG-06 — Đo máy cờ đầy đủ (GATE-AI): thời gian, độ sâu, sức mạnh, ổn định
**Epic:** EG · **Thành phần:** AI, QA · **Sprint đề xuất:** 4 (15/10–17/10) · **Bắt đầu khi (is blocked by):** `TG-01`, `T0-09`, `TC-06`, `TG-03`
**Bắt đầu khi (kết quả cần có):** TG-01: worker thật ba cấp với số đo depth/nodes/elapsed và seed; T0-09: báo perft với bộ sinh nước độc lập, nguồn/phiên bản và kết quả đối chiếu; TC-06: bộ thế/ca biên luật, ký hiệu và perft chạy trong CI kèm kết quả; TG-03: hàng đợi, watchdog và hai nhánh ENGINE_BUSY/ABANDONED đã kiểm.

**Mục tiêu:** Trả lời máy cờ có đạt GATE-AI trên cấu hình đo công khai hay không. Timebox: nhóm đặt; báo đạt/không đạt/chưa kết luận bằng số thật.

**Yêu cầu / nguồn:** US-AI-02: AC-AI-02-01 — ngân sách tính; AC-AI-02-03 — nước hợp lệ. NFR-05, GATE-AI và GATE-PERFT. Nguồn bổ sung: docs/02 §9.5; docs/05 §3.1–3.2, §11.

**Kết quả (đầu ra):** Bộ 200 thế mỗi cấp, báo p50/p95, độ sâu, đấu phân cấp và 1000 ván ổn định; báo cáo kết luận kèm cấu hình.

**Phạm vi / ngoài phạm vi:** Đo P1, không tối ưu bằng hạ ngưỡng hoặc sửa oracle theo kết quả hiện có.

**Đầu vào cần có:** Worker/build, bộ thế có nguồn và số worker/máy đo ghi thực; báo cáo oracle và kiểm luật dùng đúng phiên bản đo. Đầu vào mới bắt buộc: T0-09: báo perft với bộ sinh nước độc lập, nguồn/phiên bản và kết quả đối chiếu; TC-06: bộ thế/ca biên luật, ký hiệu và perft chạy trong CI kèm kết quả; TG-03: hàng đợi, watchdog và hai nhánh ENGINE_BUSY/ABANDONED đã kiểm.

**Cách làm gợi ý:**

1. Đo tính và thời gian chờ qua tiến trình riêng, cả 2–3 ván đồng thời.
2. Đấu ≥40 ván mỗi cặp cấp và đổi bên đều; kiểm chiếu hết ngắn.
3. Chạy 1000 ván ổn định; tổng hợp PASS/FAIL từng chỉ tiêu, không lấy trung bình che p95.
4. Ghim oracle/bộ thế T0-09 và kết quả CI TC-06; đo qua hàng đợi/watchdog TG-03, tách số đo thuật toán và chờ người chơi.

**Kiểm thử:** Vitest/công cụ đo Node, worker thật. Ca đánh số nội bộ task.

| Mã ca | AC/nhánh | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| Ca 1 | Thời gian/độ sâu | 200 thế mỗi cấp | p95 ≤300/1000/3000 ms; Khó trung vị ≥6 khai cuộc, ≥5 trung cuộc |
| Ca 2 | Sức mạnh | Khó–Trung bình và Trung bình–Dễ ≥40 ván/cặp | Tỷ lệ thắng ≥75% từng cặp |
| Ca 3 | Đúng/ổn định | 1000 ván, bộ chiếu hết 1/2 nước | 0 nước sai/treo/lỗi tiến trình; chiếu hết đúng ≥95% |
| Ca 4 | Chờ | Đo có tải 2–3 ván | Ghi p95 chờ riêng; hàng đợi ≤3 giây hoặc báo bận |
| Ca 5 | Oracle/watchdog | Đối chiếu oracle độc lập; gây vượt hạn có/không progress qua TG-03 | Không đổi kỳ vọng để khớp; fallback/lỗi đúng, số đo không che quá ngân sách |
| Ca 6 | Assertion tìm tĩnh | Chạy instrumentation TG-01 trên thế bị chiếu chỉ thoát bằng nước không ăn và hết nước tại biên sâu, lưu trace/seed | Không nút đang chiếu dùng điểm tĩnh làm cận dưới; hết nước trả thua. Nước cuối hợp lệ không thay bằng chứng assertion |

**PASS khi:** Công việc đo/báo cáo hoàn tất khi phép đo bắt buộc có dữ liệu tái lập hoặc lý do thiếu rõ, kết luận từng chỉ tiêu và lỗi chuyển TG-01/03 để sửa. Chưa chạy đủ không ghi đã đo đủ. GATE-AI chỉ PASS khi mọi ngưỡng docs/05 §3.2 và assertion đạt; không đạt ghi số thật/BLOCKED gate, báo PO, không hạ ngưỡng. Báo cáo xong không đồng nghĩa gate đạt; sửa/đo lại không đợi TQ-07.

**Bằng chứng nộp:** Build/commit, môi trường, fixture, báo từng ca; trace UI/log máy chủ đã che bí mật.

**Rủi ro / chưa rõ:** Oracle/hàng đợi đã có tiền đề nhưng báo cáo task xong không đồng nghĩa gate PASS. Nếu perft chưa xác minh hoặc build đo khác build luật, phần phụ thuộc bị BLOCKED. Cấu hình 4 vCPU/8 GB vẫn là đề xuất.

---
