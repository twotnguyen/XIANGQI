# GATE-ENGINE / NFR-03 — đo tại local (11/10/2026)

> Kết quả dưới đây là **số đo thật** trên một máy, không phải nghiệm thu hạ tầng demo.
> Phân loại: **PASS / FAIL / BLOCKED** ghi theo từng tiêu chí. Raw: [evidence/gate-engine-local-2026-10-11.json](evidence/gate-engine-local-2026-10-11.json).

## 1. Phương pháp

- Chạy trên runtime **đã biên dịch** `packages/engine/dist` (đúng đường máy chủ dùng qua `@xiangqi/engine/compiled`).
- Harness: `packages/engine/scripts/gate-engine.mjs`
  ```
  pnpm --filter @xiangqi/xiangqi-core build
  pnpm --filter @xiangqi/engine build
  node packages/engine/scripts/gate-engine.mjs --out <file.json>
  ```
- Đầu vào: `packages/engine/fixtures/midgames-50.json` (50 thế giữa ván, đã đối chiếu oracle pyffish độc lập) và `packages/engine/fixtures/mates.json` (2 thế chiếu hết đã xác minh).
- Mỗi cấp chạy đủ 50 thế; ghi `elapsedMs`, `completedDepth`, `nodes`, `timedOut`; p95 tính theo nearest-rank.

## 2. Môi trường đo

| Hạng mục       | Giá trị                                                                  |
| -------------- | ------------------------------------------------------------------------ |
| Máy            | Apple M3 Pro, 18 GB RAM                                                  |
| OS             | macOS 15.7.3 (24G419)                                                    |
| Node / pnpm    | v26.7.0 / 10.34.6 (khác CI Node 22 — xem giới hạn)                       |
| Runtime máy cờ | `packages/engine/dist` (compiled, worker thread)                         |
| Điều kiện      | Chạy nền, máy có tải khác; **một lần chạy**, không lặp để lấy trung bình |

## 3. Kết quả NFR-03 (thời gian theo cấp)

| Cấp        | Ngân sách | p50        | p95            | max        | Trong ngân sách | timedOut | Độ sâu (min/median/max) | Đích |
| ---------- | --------- | ---------- | -------------- | ---------- | --------------- | -------- | ----------------------- | ---- |
| Dễ         | 300 ms    | 5,8 ms     | **11,9 ms**    | 27,2 ms    | **50/50**       | 0        | 2 / 2 / 2               | 2    |
| Trung bình | 1.000 ms  | 243,1 ms   | **684,1 ms**   | 973,9 ms   | **50/50**       | 0        | 4 / 4 / 4               | 4    |
| Khó        | 3.000 ms  | 2.995,4 ms | **2.996,0 ms** | 3.002,5 ms | **48/50**       | 45       | 4 / 5 / 6               | 6    |

- 2 mẫu vượt trần ở cấp Khó: `ccpd-midgame-00000026` (3.002,3 ms) và `ccpd-midgame-00000032` (3.002,5 ms) — vượt 2,3–2,5 ms (≈0,08%), đều `timedOut`, độ sâu 5.
- Cấp Khó **phần lớn chạm ngân sách thời gian** (45/50 `timedOut`), độ sâu 6 chỉ đạt ở 5/50 thế.

**Kết luận NFR-03:**

| Tiêu chí                | Kết quả                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------ |
| Dễ ≤ 300 ms             | **PASS** (50/50, p95 11,9 ms)                                                                          |
| Trung bình ≤ 1.000 ms   | **PASS** (50/50, p95 684,1 ms)                                                                         |
| Khó ≤ 3.000 ms          | **PASS có ghi chú** — p95 2.996 ms nhưng 2/50 mẫu vượt ≤2,5 ms; cần chạy lại trên hạ tầng demo để chốt |
| Độ sâu đích cấp Khó = 6 | **KHÔNG ĐẠT đồng nhất** — chỉ 5/50 thế đạt độ sâu 6 (trung vị 5)                                       |

## 4. Kết quả "cấp Khó 100% bộ chiếu hết ngắn"

| id                                    | mateInPlies | Nước chọn | Nước thắng đã xác minh | Giải? | Độ sâu | ms    |
| ------------------------------------- | ----------- | --------- | ---------------------- | ----- | ------ | ----- |
| xq_jianghu_endgames_084-mate2         | 3           | 42→6      | 42→6, 43→7             | ✅    | 5      | 2.995 |
| xq_jianghu_endgames_084-derived-mate1 | 1           | 43→7      | 43→7                   | ✅    | 5      | 2.995 |

**Kết luận: BLOCKED.** 2/2 thế khả dụng được giải đúng, nhưng `validation-summary.json` ghi `diverseMandatoryMateSuite: "not-established"` (chỉ có 2 thế, 1 nguồn gốc + 1 dẫn xuất). Do đó **không thể tuyên bố "100% bộ chiếu hết ngắn"**; cần bộ chiếu hết đa dạng theo yêu cầu trước khi kết luận.

## 5. Kết luận GATE-ENGINE

| Phần                      | Kết quả                                                                          |
| ------------------------- | -------------------------------------------------------------------------------- |
| Timing (NFR-03)           | **PASS một phần** — Dễ/Trung bình PASS; Khó đạt p95 nhưng 2/50 mẫu vượt trần nhỏ |
| Strength (chiếu hết ngắn) | **BLOCKED** — thiếu bộ chiếu hết đa dạng                                         |
| **Tổng**                  | **CHƯA THỂ ĐÁNH DẤU PASS GATE-ENGINE**                                           |

## 6. Giới hạn (ghi trung thực)

- Một máy, một lần chạy, có tải nền; không phải "máy demo" theo kế hoạch nên số p95 chỉ là tham chiếu.
- Node v26.7.0 trong khi CI/ràng buộc là Node 22 (`engines: >=22.13.0 <23`) — cần đo lại trên Node 22.
- Chưa đo "20 ván cho mỗi cặp cấp" như kế hoạch kỳ vọng; mới là 50 thế/cấp một lượt.
- Máy cờ cấp Khó chưa chứng minh độ sâu 6 đều đặn; ngưỡng NFR-03 là thời gian nên không tự hạ ngưỡng độ sâu.
- Kết quả này là đo **local**, không dùng thay cho nghiệm thu thiết bị/hạ tầng demo.
