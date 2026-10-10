# Lõi luật cờ XIANGQI

Gói luật rút gọn theo BA0.12/0.17, dùng chung cho máy chủ và máy cờ. Truy vết: T05/XIAN-41, T07/XIAN-43, T10/XIAN-46; AC-04.1.1–9.

```ts
import { initialPosition, legalMoves, playMove, ending } from "@xiangqi/xiangqi-core";
const history = [initialPosition()];
const move = legalMoves(history[0]!)[0]!;
history.push(playMove(history[0]!, move));
const result = ending(history);
```

`Position` có `board`90ô, `turn`red/black, `halfmove` số nửa nước liên tiếp không ăn quân và `fullmove` số lượt bắt đầu từ1. Chỉ số ô là `y*9+x`, Đen ở hàng0, Đỏ ở hàng9. `Move` có `from`/`to` là chỉ số ô.

- `initialPosition()` tạo khai cuộc mới; `parsePosition(fen)`/`serializePosition(position)` đọc/ghi FEN gồm lượt và bộ đếm. FEN dùng n=Mã, b=Tượng, chữ hoa=Đỏ, w=Đỏ tới lượt; parse kiểm cấu trúc, không chứng minh thế đạt được từ khai cuộc.
- `pseudoLegalMoves(position)` chỉ sinh ứng viên hình học; dùng `legalMoves(position)` để cho phép nước đi. `isInCheck(position,side)` kiểm Tướng bị chiếu. `playMove(position,move)` trả thế mới và không sửa input; nước không hợp lệ ném `ILLEGAL_MOVE`.
- `ending(history)` nhận thế đầu cùng thế sau mỗi nước trên nhánh hiệu lực. Caller cắt lịch sử undo và dừng tại kết quả đầu tiên. Kết quả có `reason` và `winner`red/black/null. Hết nước là thua; lặp3lần xét toàn chu kỳ lần đầu→lần thứ3; chiếu mọi nước của một bên khiến bên đó thua, cả hai chiếu liên tục hòa. Chiếu hết/hết nước/thua chiếu liên tục ưu tiên trước hòa120nửa nước.
- Caller kiểm đồng hồ trước khi chấp nhận nước; timeout, mất kết nối, đầu hàng và hòa thỏa thuận do máy chủ xử lý.
- `perft(position,depth)` nhận độ sâu nguyên không âm, đếm nhánh nước hợp lệ, không áp dụng luật hòa lặp/120.

Chạy từ gốc repo: `pnpm test:core` đo độ phủ và kiểm ngưỡng dòng≥90%. Expected perft từ [bài tác giả Maksim Korzh](https://talkchess.com/viewtopic.php?t=76430): khai cuộc44/1920/79666 ở depth1/2/3; thế chiến thuật trong test38/1128/43929. Những con số này không chứng minh mọi tình huống đều đúng; kiểm riêng an toàn Tướng và thứ tự phân xử trong các suite.
