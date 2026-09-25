# AI — PHÉP ĐO, ORACLE VÀ KHẢ NĂNG TÁI LẬP

**Trạng thái:** quyết định thiết kế, chưa có số đo runtime · **Căn cứ:** DEC-045 · **Ngày:** 2026-09-22.

## 1. Ba phép kiểm độc lập

| Phép kiểm | Corpus / điều kiện | Điều kiện đạt |
|---|---|---|
| Cổng độ sâu ISSUE-032 | 20 thế hiệu năng: 5 khai cuộc, 5 trung cuộc đông quân, 5 tàn cuộc, 5 nhiều nước ăn; mỗi cấp 5 lần/thế | Depth 2/4/6 có p95 hoàn thành ≤300/1000/3000 ms |
| Chất lượng ISSUE-033 | 20 thế oracle: 5 bắt quân, 5 thoát chiếu, 5 tàn cuộc/chiếu hết, 5 tránh lặp | HARD chọn nước trong tập đáp án ≥16/20; đồng thời 5/5 tránh lặp đúng |
| Đối kháng ISSUE-124 | 10 khai cuộc × đổi màu × 3 cặp cấp =60 ván | Cấp cao >50% điểm trong từng cặp; không nước sai hoặc treo |

Hai corpus 20 thế là hai tập có mục đích khác nhau, tên và hash khác nhau. Không dùng số đo tốc độ để chứng minh chất lượng, hoặc thắng đối kháng để bỏ cổng độ sâu.

## 2. Cổng độ sâu và ngân sách

Chạy trong tiến trình riêng, một tìm kiếm tại một thời điểm, máy không chạy tải khác. Ghi CPU, RAM, OS, Node, commit, cấu hình build, seed, hash corpus, thứ tự chạy. Mỗi cấp có đúng 100 mẫu đo, gồm năm lần cho từng thế; không loại outlier. Trước đo chạy một vòng warm-up toàn corpus, không tính vào 100 mẫu; xoá bảng transposition giữa các mẫu, không giữ kết quả warm-up.

Đồng hồ monotonic thật đo từ ngay trước lời gọi tìm kiếm tới khi trả kết quả; gồm lượng giá/sinh nước/dọn bộ nhớ trong lời gọi, không gồm IPC/xếp hàng/mạng. Benchmark gọi tìm kiếm mục tiêu độ sâu cố định, watchdog dừng tại 2× ngân sách; phép thử runtime deadline ở ISSUE-031 tách riêng và vẫn bắt trả fallback khi hết ngân sách.

Mỗi mẫu lưu thời gian thật, depth hoàn thành, nodes, nước chọn, aborted và lý do. Khi chưa hoàn thành depth mục tiêu, giá trị dùng tính **percentile hoàn thành** là **+∞**, kể cả fallback trả sớm. Sort 100 giá trị; p50/p95/p99 lần lượt là vị trí 50/95/99 (nearest-rank). Báo thêm percentile thời gian trả thực tế để thấy overhead, không dùng nó thay p95 hoàn thành. Vì vậy p95 trong ngân sách buộc ít nhất **95/100** mẫu hoàn thành mục tiêu trong ngân sách. Mẫu +∞ và tỷ lệ depth phải hiện trong báo cáo; nước sai hay worker không dừng sau watchdog làm lần đo hỏng.

**Quyết định về 90%:** bỏ điều kiện ≥90% ở bản ISSUE-032 cũ vì cho phép 10 fallback nhanh che thất bại depth6. Đây là làm rõ và siết cổng p95 gốc, không hạ ngưỡng. **Biên độ nghiệm thu bằng 0 ms**: không cộng “biên độ nhỏ” chưa định nghĩa vào 300/1000/3000 ms. Thời gian IPC/queue/roundtrip được đo riêng; thời gian queue vẫn trừ đồng hồ máy theo BR-CLK-12. Máy chủ thật phải chạy lại cùng protocol ở T137-07.

## 3. Oracle độc lập và lịch sử lặp

Trước lần chấm đầu, đóng băng manifest cho từng corpus: version, SHA-256 từng fixture, ruleset `xiangqi-simple-v1`, seed, người tạo/người review, ngày review và lập luận. Không ghi `reviewedBy: human` khi chưa có người thực sự review. Thiếu review ⇒ issue còn `BLOCKED`, không sinh đáp án từ AI rồi tự chứng nhận.

Mỗi fixture chất lượng lưu: ID/category; bàn 90 ô và bên tới lượt; `initialPosition`, `activeHistory` là chuỗi nước hợp lệ từ gốc tới hiện tại gồm bên tới lượt sau mỗi nước; tập `expectedBestMoves` có toạ độ đầy đủ; lời giải và các nhánh phản biện; danh tính/ngày review. Lịch sử chỉ chứa nhánh hiệu lực. Có thể lưu nhánh bỏ làm dữ liệu âm, nhưng không cộng nó vào bảng đếm lặp. Replay lịch sử phải tái tạo đúng bàn hiện tại; tự tính key bằng bộ luật từ bàn/lượt, không tin bảng count nhập tay.

Riêng cả 5 thế tránh lặp: trước lượt hiện tại chưa có terminal; nước bẫy dẫn đến key xuất hiện lần thứ ba (cùng bàn và lượt); có ít nhất một nước thay thế hợp lệ được review tốt hơn hoà. Oracle nêu key, các chỉ số ply lần1/lần2/lần3 và continuation chứng minh nước thay thế. Test thay lịch sử bằng rỗng và thêm nhánh bỏ phải bắt được lỗi mục tiêu. Không dùng snapshot bàn cờ đơn lẻ làm bằng chứng tránh lặp.

**Quyết định 16/20:** giữ mức ≥80% đã nằm trong ISSUE-033 làm sàn kiểm tra chiến thuật học thuật cho AI tự viết, có thể sai tối đa4 thế; vẫn yêu cầu hợp lệ20/20 và tránh lặp5/5. Đây không phải đo Elo hoặc lời hứa mạnh trong mọi thế. Chạy HARD với seed cố định, ngân sách/độ sâu đúng cấp; giữ kết quả từng thế (bao gồm thất bại). Không đổi fixture/seed/đáp án sau khi nhìn kết quả để vượt sàn. Mọi sửa lỗi corpus có phiên bản mới, giải thích độc lập, diff review và chạy lại toàn bộ; lưu kết quả phiên bản cũ.

## 4. Đối kháng và so sánh thuật toán

Manifest đóng băng 10 khai cuộc hợp lệ, cùng hai màu, thứ tự nước cố định và seed trước đo. Một trận chạm 200 nửa nước nhận 0,5 điểm mỗi bên **chỉ trong thí nghiệm**, không ghi kết quả hoà sản phẩm. Nước bất hợp lệ/treo làm thí nghiệm hỏng, không tính thành thua.

Để tái lập chính xác so sánh sức mạnh, chạy mode thí nghiệm deterministic theo depth 2/4/6, thứ tự nước và seed cố định, không để jitter đồng hồ chọn depth. Ghi toàn bộ nước/score/nodes/depth; lặp cùng manifest phải cùng kết quả. Mode này không chứng minh deadline runtime: cổng 032 và kiểm ngân sách production vẫn bắt buộc độc lập. Trận chạm watchdog an toàn đã khai trong manifest là hỏng, không chấm hoà. So sánh minimax/alpha-beta dùng cùng depth, cùng ordering, cùng lịch sử; điểm và tập nước tối ưu bằng nhau, node mỗi thế không tăng và tổng giảm. Nếu có ngoại lệ phải báo thật và chưa đạt, không giấu theo BR-AI-30.

## 5. Ngoại tuyến trong ván AI

Nguồn nghiệp vụ là BR-AI-11 và REQ-CLOCK: đồng hồ bên đến lượt tiếp tục chạy. Kiểm bằng clock tiêm vào: deadline20s/offline70s ⇒ TIMEOUT20s; deadline60s ⇒ TIMEOUT60s; deadline>60s/không giới hạn ⇒ INTERRUPTED60s nếu không có kết quả sớm hơn. Sau terminal không thay kết quả khi sự kiện đến muộn; worker bị huỷ và kết quả cũ bị bỏ. Khởi động lại backend áp ARCH-10: không dùng thời gian máy chủ ngừng để tạo thua mới.

## 6. Admission không bỏ ván đã nhận

DEC-045: giữ tối đa10 reservation cho ván AI ACTIVE (=2 running+8queued), kể cả lượt người chơi. Mỗi ván tối đa1 job outstanding; retry/undo giữ reservation đó, terminal giải phóng đúng1. Tạo ván mới đủ10 trả AI_BUSY; thất bại transaction tạo phải trả slot. Như vậy cả10 ván cùng đến lượt AI vẫn nằm trong2+8, không mất slot của ván đang chơi. Đây là giới hạn tiếp nhận kỹ thuật để thực hiện lời hứa quá tải không làm hỏng ván cũ, không thay ngưỡng đo AI.
