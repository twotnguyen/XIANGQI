# Giải thích Thuật toán AI Cờ tướng (Xiangqi AI Architecture)

Tài liệu kỹ thuật giải thích chi tiết cấu trúc, thuật toán và kết quả đo lường của module `@xiangqi/ai`.

---

## 1. Tổng quan kiến trúc

Engine AI được thiết kế theo mô hình phân lớp, chạy độc lập ngoài event loop chính của server (thông qua Worker Threads / IPC):

```
+-------------------------------------------------------+
|                   Fastify API Server                  |
|          apps/server/src/modules/ai/service.ts        |
+---------------------------+---------------------------+
                            | (IPC / Supervisor Pool)
+---------------------------v---------------------------+
|                   AiSupervisor                        |
|       (2 Worker Threads + Queue 8, max capacity 10)   |
+---------------------------+---------------------------+
                            |
+---------------------------v---------------------------+
|               Search Engine (@xiangqi/ai)             |
|   - searchBestMove()                                  |
|   - Iterative Deepening (d = 1 .. maxDepth)           |
|   - Alpha-Beta Pruning (Negamax)                      |
|   - Move Ordering (MVV-LVA + PV Move First)           |
|   - Mate Distance Scoring                             |
|   - Repetition Cycle Detection                        |
+---------------------------+---------------------------+
                            |
+---------------------------v---------------------------+
|               Hàm lượng giá tĩnh (evaluate.ts)         |
|   - Điểm quân số (Material)                            |
|   - Thưởng tốt qua sông và áp sát cung                |
|   - Đối xứng bàn cờ (Antisymmetric Property)          |
+-------------------------------------------------------+
```

---

## 2. Hàm lượng giá tĩnh (Static Evaluation)

### 2.1. Thang điểm quân lực (Material Values)

| Quân cờ | Trọng số (Điểm) | Ghi chú |
|---|---|---|
| **Tướng (GENERAL)** | 0 | Do thuật toán terminal xử lý thắng/thua trực tiếp |
| **Sĩ (ADVISOR)** | 200 | Quân phòng thủ cung tướng |
| **Tượng (ELEPHANT)** | 200 | Quân phòng thủ cánh sân nhà |
| **Mã (HORSE)** | 400 | Cơ động tầm trung, dễ bị cản cẳng |
| **Pháo (CANNON)** | 450 | Tầm xa uy lực khi có ngòi, yếu dần về tàn cuộc |
| **Xe (CHARIOT)** | 900 | Quân chủ lực mạnh nhất bàn cờ |
| **Tốt (SOLDIER)** | 100 | Chưa qua sông |

### 2.2. Điểm thưởng vị trí (Positional Bonuses)

- **Tốt qua sông (`CROSSED_RIVER_PAWN_BONUS`)**: +100 điểm (tổng 200 điểm) do tốt được phép đi ngang.
- **Tốt tiến sâu (`PAWN_ADVANCEMENT_BONUS`)**: +20 điểm cho mỗi hàng tiến gần về phía cung tướng đối phương.

### 2.3. Tính chất đối xứng (Antisymmetric Property)

Hàm lượng giá luôn trả về giá trị từ góc nhìn của bên đang tới lượt đi (`side-to-move`):
$$\text{evaluate}(P) = -\text{evaluate}(\text{flip}(P))$$
Nếu Đỏ đang dẫn 300 điểm và tới lượt Đỏ đi, hàm trả về `+300`. Nếu tới lượt Đen đi trong cùng thế cờ đó, hàm trả về `-300`.

---

## 3. Thuật toán tìm kiếm (Search Algorithms)

### 3.1. Minimax Baseline (negamax formulation)

Được giữ nguyên trong `packages/ai/src/minimax.ts` làm chuẩn đối sánh (ground truth baseline). Mọi tối ưu hóa ở cấp cao hơn bắt buộc phải cho điểm số tương đương ở cùng độ sâu cố định.

### 3.2. Alpha-Beta Pruning với Iterative Deepening

- **Cắt tỉa Alpha-Beta**: Loại bỏ các nhánh mà đối phương chắc chắn sẽ không cho phép xảy ra:
  - $\alpha$: Giá trị tốt nhất mà bên đi có thể đạt được.
  - $\beta$: Giá trị tốt nhất mà đối phương có thể hạn chế bên đi.
  - Cắt nhánh khi $\text{score} \ge \beta$ (Beta Cutoff).
- **Sắp xếp nước đi (Move Ordering)**:
  1. *PV Move*: Nước đi tối ưu tìm được từ vòng lặp trước (`d-1`) được thử đầu tiên.
  2. *MVV-LVA (Most Valuable Victim - Least Valuable Attacker)*: Ưu tiên các nước ăn quân có lời nhất (ví dụ: Tốt ăn Xe được xét trước Xe ăn Tốt).
  3. *Nước đi không ăn quân*.
  4. *Tie-breaker*: Tọa độ chuẩn tắc tăng dần để đảm bảo tính xác định 100% (deterministic).
- **Iterative Deepening**: Tìm kiếm tuần tự từ độ sâu 1 đến độ sâu tối đa. Đảm bảo nếu hết giờ (`deadlineMonoMs`), hệ thống luôn có nước đi hợp lệ tốt nhất từ độ sâu hoàn tất gần nhất (`completedDepth`).

### 3.3. Xử lý chiếu hết và lặp nước

- **Mate Distance Scoring**:
  - Chiếu hết bên mình thắng: $+100,000 - \text{plyFromRoot}$ (ưu tiên chiếu hết nhanh nhất).
  - Bị chiếu hết bên mình thua: $-100,000 + \text{plyFromRoot}$ (ưu tiên trì hoãn thất bại lâu nhất).
- **Phát hiện lặp nước**:
  - Nếu một thế cờ đã xuất hiện $\ge 2$ lần trong lịch sử và nước đi dẫn đến lần thứ 3 $\to$ gán điểm hòa $0$ điểm.

---

## 4. Các cấp độ chơi (Difficulty Levels)

| Cấp độ | Độ sâu tối đa (`maxDepth`) | Ngân sách thời gian (`timeBudgetMs`) | Mục tiêu trải nghiệm |
|---|---|---|---|
| **EASY** | 2 | 300 ms | Phản hồi tức thì, tránh các bẫy 1-2 nước đơn giản |
| **MEDIUM** | 4 | 1,000 ms | Cấp độ tiêu chuẩn, biết phối hợp Xe Pháo Mã cơ bản |
| **HARD** | 6 | 3,000 ms | Tính sâu trung cuộc, khai thác lỗi sơ hở tàn cuộc |

---

## 5. Giới hạn hiện tại (Known Limitations)

1. **Chưa có Bảng hoán vị (Transposition Table - TT)**: Các nhánh hoán đổi thứ tự nước đi vẫn bị tính toán lại ở các tầng sâu.
2. **Chưa có Quiescence Search**: Hiện tại thuật toán dừng ở độ sâu lá (`depth === 0`) và gọi hàm lượng giá tĩnh ngay, có thể gặp hiệu ứng đường chân trời (horizon effect) khi đang có chuỗi đổi quân dở dang.
3. **Chưa có Sách khai cuộc (Opening Book)**: Vòng khai cuộc hoàn toàn do thuật toán tìm kiếm tự tính từ thế ban đầu.
