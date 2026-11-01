# Máy cờ XIANGQI

Máy cờ tự viết bằng TypeScript: negamax, alpha-beta, tìm sâu dần, bảng chuyển vị,
ưu tiên nước đã tìm được và nước ăn quân; đánh giá giá trị quân, tiến quân Tốt và
vị trí Mã/Pháo. Chỉ sinh/áp dụng nước bằng `xiangqi-core`.

```ts
import { EngineWorker } from "@xiangqi/engine";
const engine = new EngineWorker();
await engine.ready(); // Khởi tạo máy trước khi máy chủ nhận yêu cầu đánh với máy.
const result = await engine.search(
  {
    position: canonicalFen,
    side: "red",
    level: "medium",
    history: effectiveBranchFens,
  },
  { signal: abortController.signal },
);
await engine.close();
```

`side` phải trùng bên tới lượt trong FEN. `history` tùy chọn phải kết thúc tại
thế hiện tại; nguồn duy nhất là nhánh hiệu lực do máy chủ giữ. Không nhận lịch sử
hoặc phe có thẩm quyền từ client. Có lịch sử thì máy xét lặp thế/chiếu liên tục
bằng đúng `ending()` của lõi. Không có lịch sử thì chỉ xét nhánh từ thế hiện tại.

Mục tiêu Dễ/Trung bình/Khó lần lượt là **2/4/6 nửa nước**, ngân sách tìm kiếm
**300/1.000/3.000 ms**. `completedDepth` chỉ tính vòng đã hoàn tất; hết giờ giữ
nước tốt nhất của vòng hoàn tất cuối, hoặc nước hợp lệ dự phòng nếu chưa hoàn
tất vòng nào. `timedOut` không có nghĩa ván kết thúc. `move:null` đi kèm
`terminal` từ lõi khi thế/lịch sử đã kết thúc. Máy chủ vẫn phải xác nhận đúng
ván, thế, quyền và nước hợp lệ trước khi áp dụng kết quả.

Bảng nhớ có tối đa 50.000 mục. Trong một request, lịch sử gốc cố định; khóa là
chuỗi nước đi chính xác (mỗi from/to mã hóa thành một ký tự), xác định cùng
nhánh/counter/chiếu mà không ghép lại toàn bộ FEN ở mỗi node. Không gộp hai
lịch sử chỉ vì cùng bàn cờ để dùng chung cận điểm.
Điểm chiếu hết ưu tiên hơn các thắng lợi terminal khác; điểm khoảng cách khuyến khích kết thúc
sớm. Không dùng bộ luật đuổi quân riêng.

`EngineWorker` chạy tính toán trong Worker Thread riêng, giữ một tác vụ đang
chạy trên mỗi instance; yêu cầu đồng thời trả `ENGINE_BUSY`. Worker được tái
sử dụng khi thành công; hủy, timeout, crash hoặc kết quả không hợp lệ sẽ chấm
dứt và thu hồi worker trước khi cho tìm mới. `close()` chặn tác vụ mới và chờ
thu hồi tác vụ hiện tại. Idle worker tự thoát/lỗi được loại khỏi cache.
`onProgress({completedDepth,targetDepth,nodes,elapsedMs})` chỉ phát số đo thật
sau một iteration hoàn tất; không chứa nước dự kiến/PV hoặc chạy phân tích bên người.

Máy chủ phải `await ready()` trong vòng đời khởi tạo **trước khi phục vụ AI**.
Handshake chỉ hoàn tất sau khi thread, loader và module tìm kiếm đã sẵn sàng;
không tìm nước giả để làm nóng. Các lời gọi `ready()` đồng thời dùng chung lần
khởi tạo, chặn tìm kiếm bằng `ENGINE_BUSY` đến khi hoàn tất. Startup lỗi/treo
được chặn bằng watchdog và thu hồi trước khi cho khởi tạo lại; `close()` cũng
chờ thu hồi startup. Sau hủy/crash/watchdog hoặc idle exit, máy chủ phải chuẩn bị
lại worker trước khi mở nhận AI, không ẩn bước này trong thời gian một lượt đi.
Gọi thẳng `search()` trên máy lạnh vẫn tính startup vào cùng ngân sách: nếu
startup đã hết 300 ms thì Dễ trả fallback với `completedDepth:0`, không tự cấp
thêm 300 ms. Điều này chưa chứng minh GATE-ENGINE đạt trên hạ tầng demo.

Các lỗi cố định: `ENGINE_INPUT_INVALID`, `ENGINE_BUSY`, `ENGINE_CANCELLED`,
`ENGINE_TIMEOUT` (watchdog mặc định 10 giây), `ENGINE_FAILED`, `ENGINE_CLOSED`.
Không trả stack, lỗi nội bộ hoặc dữ liệu request. Quyết định giữ nguyên ván và
Thử lại khi quá 10 giây thuộc module AI máy chủ; engine không tự bỏ dở ván.

Workspace hiện xuất source TypeScript; Node 22 chạy package/dist với loader
`tsx` đã pin 4.23.15, ví dụ `node --import tsx ...`. Worker bootstrap tự đăng ký
loader, hỗ trợ cả source và dist. `pnpm --filter @xiangqi/engine build` sao chép
bootstrap vào dist. Không thêm engine vào bundle frontend.

## Kiểm chứng và giới hạn

Test gồm thế chiếu hết/không còn nước, nước thoát duy nhất, fallback/hết giờ,
lịch sử lặp, cấp Khó hoàn tất sâu 6 trên một thế nhỏ, đầu vào không đổi; Worker
thật với HTTP health đang phục vụ sau vòng tìm kiếm đầu, hủy/close, crash,
output sai, treo và idle exit. HTTP này là harness độc lập; runtime AI và health
của ứng dụng vẫn cần Root tích hợp.

Bộ timing có 50 thế giữa ván đã xác minh độc lập. Bộ mate gồm hai thế có nguồn
công bố và sáu họ quân tự dựng, đáp án vét cạn bằng pyffish độc lập trong
`fixtures/verify-oracle.py`; đây không phải bao phủ mọi chiến thuật.
Chạy `scripts/gate-engine.mjs` và `scripts/tournament.mjs` dưới Node22 để ghi số
thật. Không coi sự tồn tại fixture/test là nghiệm thu p95/sức mạnh.
Worker dùng hạn chót monotonic chung tính từ yêu cầu, trừ 5 ms dự phòng IPC/kiểm tra
kết quả; khởi động worker không được cấp lại toàn bộ ngân sách. `elapsedMs` là
thời gian compute thực đo bên worker; đo riêng toàn bộ `await engine.search()`
để tính xác minh đầu vào/khởi động/IPC/kiểm kết quả. Chỉ các trường thế, phe, cấp,
seed và lịch sử đã xác minh được gửi sang Worker; thuộc tính phụ không sao chép.
Test lịch sử lặp/chiếu dai tạo từng thế bằng nước đi hợp lệ,
kiểm tra cả bên Đỏ và Đen qua Worker thật. Benchmark vẫn phải đo toàn bộ
`await engine.search()` ở máy demo và phân biệt lượt lạnh/lượt nóng; scheduling
của hệ điều hành và một thao tác lõi đang chạy có thể gây sai số, cần số đo p95.

## YC8: ngẫu nhiên nhẹ

Runtime cấp `randomSeed` uint32 phía server cho cả ba cấp. Seed cố định tái lập
lựa chọn trong test; bỏ seed giữ đường xác định cho gate. Sau mỗi iteration đủ,
chọn giữa các nước có điểm cách tốt nhất tối đa **20 điểm** (1/5 giá trị Tốt).
Root cần điểm chính xác cho từng ứng viên, không dùng cận alpha-beta làm điểm
gần bằng nhau. Khi có điểm terminal/mate (|score| ≥ 99000), chỉ chọn nước bằng
điểm tối ưu: không làm mất mate hoặc nước tránh mate đã được tìm thấy.
Không thay depth/budget; số depth thực có thể thấp hơn khi tìm kiếm chưa đủ giờ.
