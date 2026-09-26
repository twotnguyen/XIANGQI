# EP15 · Chơi với máy: tiến trình riêng, hàng đợi, tích hợp ván, thí nghiệm 60 ván

> **Loại:** Epic · **Story:** [ST15.1](../story/ST15.1-tien-trinh-ai-rieng-worker-thread-huy-tuc-thi-hang-doi-2-8.md), [ST15.2](../story/ST15.2-tich-hop-van-voi-may-di-lai-voi-may-giao-dien-choi-voi-may.md), [ST15.3](../story/ST15.3-thi-nghiem-60-van-va-bao-cao-thuat-toan-tai-lap-duoc.md)

| Trường Jira | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | `EP15 · Chơi với máy: tiến trình riêng, hàng đợi, tích hợp ván, thí nghiệm 60 ván` |
| Components | AI, Backend, Frontend, Tester |
| Priority | High |
| Labels | `xq-v2`, `ep15` |
| Fix versions | `v1.0.0` |
| Start date / Due date | 2026-10-12 / 2026-10-22 |
| Nguồn đặc tả | ISSUE-118 … ISSUE-124 (R12) |

**Điều kiện bắt đầu:** ⛔ Cổng đo AI (ST04.3) phải **PASS**. Chưa PASS ⇒ không bắt đầu Epic này.

**Mục tiêu:** AI chạy ở **tiến trình con riêng** (tối đa **2 worker thread**) để không làm treo máy chủ; hàng đợi **2 chạy / 8 chờ**; tạo và chơi ván với máy qua **cùng** bộ luật và **cùng** đường xử lý lệnh với ván online; đi lại với máy có hiệu lực ngay; giao diện chọn cấp và chơi; **thí nghiệm 60 ván** chứng minh cấp cao mạnh hơn cấp thấp.

**Quy tắc chung (ghi thẳng):**
| Mục | Quy tắc |
|---|---|
| Tiến trình | backend spawn 1 tiến trình con AI qua IPC (mặc định **bật**, không có cờ tắt); trong tiến trình con có tối đa 2 worker thread tìm kiếm; không có endpoint AI công khai |
| Giao thức IPC | Server → AI: `{type:'SEARCH', jobId, position, counts, maxDepth, budgetMs}`, `{type:'CANCEL', jobId}`; AI → Server: `{type:'RESULT', jobId, result: SearchResult}`, `{type:'ERROR', jobId, message}`, `{type:'READY'}` |
| Huỷ | cờ huỷ bằng **SharedArrayBuffer + Atomics** (tới ngay, không chờ vòng lặp đọc tin); worker dừng trong ≤ 100 ms |
| Hàng đợi | `AI_MAX_RUNNING = 2`, `AI_MAX_QUEUED = 8`; tối đa **10 reservation** = số ván AI ACTIVE; mỗi ván 1 job chưa xong; đủ 10 ⇒ ván **mới** nhận `AI_BUSY`; ván đã nhận luôn có chỗ |
| Lỗi | worker lỗi lần 1 ⇒ thử lại 1 lần (nếu còn thời gian); lỗi lần 2 ⇒ ván **INTERRUPTED/AI_UNAVAILABLE**, người chơi **không thua**; hết ngân sách ⇒ nước dự phòng hợp lệ; nước AI trả về **không hợp lệ** ⇒ coi là lỗi máy |
| Ngân sách | không vượt thời gian còn lại trên đồng hồ của máy; đồng hồ máy về 0 ⇒ `TIMEOUT` (ưu tiên hơn lỗi máy); thời gian máy chờ trong hàng đợi **tính vào** đồng hồ máy |
| Kết quả cũ | kết quả về sau khi version ván đã đổi (đi lại/kết thúc) ⇒ **bỏ** (`jobVersion` tăng xuyên suốt ván) |
| Ván AI | không có phòng, người xem, chat, media; **không** áp dụng chống treo ván; máy không xin hoà/đầu hàng (hoà chỉ bằng lặp 3 lần); ĐỎ luôn đi trước (người chọn Đen ⇒ máy đi ngay); người thật offline đủ 60 s mà chưa có hạn sớm hơn ⇒ INTERRUPTED |
| Không mách nước | không hiện điểm đánh giá/đường tính của máy khi ván đang chơi |

**Danh sách Story:**
| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST15.1](../story/ST15.1-tien-trinh-ai-rieng-worker-thread-huy-tuc-thi-hang-doi-2-8.md) | Tiến trình AI riêng, worker thread, huỷ tức thì, hàng đợi 2/8 | 3 | 8 |
| [ST15.2](../story/ST15.2-tich-hop-van-voi-may-di-lai-voi-may-giao-dien-choi-voi-may.md) | Tích hợp ván với máy, đi lại với máy, giao diện chơi với máy | 4 | 5 |
| [ST15.3](../story/ST15.3-thi-nghiem-60-van-va-bao-cao-thuat-toan-tai-lap-duoc.md) | Thí nghiệm 60 ván và báo cáo thuật toán tái lập được | 3 | 3 |
