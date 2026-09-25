# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-023 — Thí nghiệm AI và số liệu bảo vệ

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0 (arm64, Apple M3 Pro), Node.js v26.7.0, pnpm 10.34.5, vitest 3.2.7  
**Tiêu chuẩn kiểm chứng:** [08-TEST-EXECUTION.md](../specs/08-TEST-EXECUTION.md) hàng **ISSUE-023** & [ISSUE-023](../issues/ISSUE-023-ai-experiments.md)  
**Phạm vi lần này:** sửa F-13 (corpus sai tên quân + benchmark không có assertion), F-24 (test tự ghi đè artifact tracked), F-25 (báo cáo che các thế cờ alpha-beta tốn nhiều node hơn). Không đo lại budget p95 và strength gate 60 ván.  
**Trạng thái:** LOCAL_DONE cho phần fixed-depth benchmark; T023-03/T023-04 **chưa có bằng chứng** trong repo (xem §6).

> **Số liệu 84.51% trước đây đã bị thay thế.** Con số cũ (2.388 → 370 node) đo trên corpus dùng `CHARIOT`/`SOLDIER` — hai giá trị **không tồn tại** trong `PieceTypeSchema` (`GENERAL/ADVISOR/ELEPHANT/HORSE/ROOK/CANNON/PAWN`, `packages/contracts/src/game.ts:8-10`). Hệ quả: 12/20 thế cờ trả `NaN`/`-Infinity`, nước đi không hợp lệ, và `tests/ai/benchmark.test.ts` khi đó **không có `expect` nào** nên không thể fail. Corpus hiện tại chỉ dùng 7 loại quân hợp lệ và được Zod validate ngay khi load, nên mọi số dưới đây đo trên dữ liệu hợp lệ.

---

## 1. Lệnh thực thi và kết quả thật

### 1.1 Lệnh bắt buộc

```bash
pnpm test:ai
```

**Exit code: 0** — 5 test trong `tests/ai/benchmark.test.ts`, chạy trên đủ 20 thế cờ ở depth 2 (≈1 s, không đụng file tracked nào).

```bash
pnpm run bench:ai:export
```

**Exit code: 0** — xuất bản có chủ đích vào `docs/test-reports/ai/`:

```text
=== AI BENCHMARK SUMMARY ===
Positions tested: 20
Total Minimax Nodes: 4669
Total Alpha-Beta Nodes: 987
Aggregate Pruning: 78.86% reduction (node-weighted: 100*(sum(MM)-sum(AB))/sum(MM))
Positions where Alpha-Beta visited MORE nodes: 6 [corpus-05-pawn-endgame, corpus-07-two-horses,
  corpus-09-cannon-chariot-battery, corpus-11-rook-check-evasion, corpus-14-advance-pawn-crossed,
  corpus-17-open-file-control]
Score Agreement: 20/20 (100.0%)
Same completed depth for both algorithms: YES
Reports written to: docs/test-reports/ai
```

### 1.2 Lệnh kiểm chứng bổ sung (scoped)

```bash
pnpm exec vitest run --config vitest.config.ts tests/ai/benchmark.test.ts tests/unit/ai-corpus.test.ts
```

**Exit code: 0** — 2 file, **21 test pass** (`ai-corpus.test.ts` 16 test gồm cả các ca corpus cố ý hỏng; `benchmark.test.ts` 5 test assertion thật).

### 1.3 Chứng minh assertion thật sự bắt lỗi (red → green)

Tạm thời thay `corpus-17-open-file-control` bằng thế **BLACK bị chiếu hết** (Tướng Đỏ (4,0), hai Xe Đỏ (4,8)/(0,9), Tướng Đen (4,9), `turn=BLACK`) rồi chạy `pnpm test:ai`:

- **Exit code: 1** — fail tại `expect(noMove).toEqual([])` với danh sách vi phạm:
  `["corpus-17-open-file-control:MINIMAX", "corpus-17-open-file-control:ALPHA_BETA"]`.
- Khôi phục corpus → `pnpm test:ai` **exit 0**.

Ngoài ca trên, 12 đầu vào hỏng (11 biến thể entry: loại quân/side lạ, ô ngoài biên, ô không nguyên, trùng ô, trùng ID quân, thiếu Tướng Đỏ/Đen, trùng ID entry, `turn` lạ, `pieces` rỗng; cộng root không phải mảng) đều ném lỗi rõ ràng từ loader (test `T023-01`). `NaN`/`-Infinity` nay bất khả thi về cấu trúc vì loader từ chối mọi `type` ngoài `PieceTypeSchema`; assertion `Number.isFinite(score)` vẫn giữ để chặn hồi quy.

### 1.4 Không còn ghi đè file tracked (F-24)

- `exportReports` mặc định ghi vào `artifacts/ai-benchmark/` (`/artifacts/` đã nằm trong `.gitignore`).
- Bản curated `docs/test-reports/ai/benchmark-results.{json,csv}` chỉ được ghi bởi `pnpm run bench:ai:export`.
- Đã kiểm: sau `pnpm test:ai`, `git status --short docs/test-reports/ai/` **rỗng** (không file tracked nào bị ghi lại).

---

## 2. Số liệu đo được (thay cho 84.51%)

| Chỉ số | Giá trị |
|---|---|
| Số thế cờ | **20** |
| Tổng node Minimax (single-pass negamax) | **4.669** |
| Tổng node Alpha-Beta (iterative deepening + PV ordering) | **987** |
| Cắt tỉa tổng hợp | **78,86%** (node-weighted, xem định nghĩa dưới) |
| Số thế cờ Alpha-Beta duyệt **nhiều node hơn** Minimax | **6** (`corpus-05`, `07`, `09`, `11`, `14`, `17`) |
| Đồng thuận điểm số (cùng depth hoàn tất) | **20/20 = 100%** |
| Cùng `completedDepth` cho cả hai thuật toán | **Có (20/20 ở depth 2)** |
| Corpus hash (sha256) | `06086504642cdcac4e5f125cd35161381da490d8ad4d541603d3f6d862f8bac6` |
| Artifact JSON / CSV (sha256) | `5d9757bbc8bd03c0a38aa94fd79ad0af0bdd511308253b77240914a0a6519b80` / `972822fda9b3601dc9782c74f6d8deefb8412127d81e711fcfdacd3aaf0e6935` |

**Định nghĩa chính xác của con số 78,86%** (đã ghi trong artifact tại `meta.aggregatePruningDefinition` và in ra ở CLI):

```text
100 * (sum(minimaxNodes) - sum(alphaBetaNodes)) / sum(minimaxNodes)
```

Đây là phần trăm **gia quyền theo tổng node** trên toàn corpus, **không phải** trung bình các tỉ lệ theo từng thế cờ, và **không phải** bất biến: 6/20 thế cờ alpha-beta duyệt nhiều node hơn baseline (do iterative deepening chạy thêm lượt depth 1 và thứ tự nước đi/PV, trong khi Minimax chỉ một lượt depth 2). Artifact JSON có `aggregate.positionsWhereAlphaBetaVisitedMore` + danh sách ID, CSV có cột `Node Delta (MM-AB)` âm — các vị trí này không bị che (F-25).

So sánh trực tiếp với số cũ:

| | Corpus cũ (invalid) | Corpus hiện tại |
|---|---|---|
| Minimax nodes | 2.388 (nhưng 12/20 thế cờ inert) | 4.669 |
| Alpha-Beta nodes | 370 | 987 |
| "Cắt tỉa" | 84,51% (vô nghĩa) | **78,86%** (node-weighted, hợp lệ) |
| Đồng thuận điểm | 8/20 (40%) | **20/20 (100%)** |
| Depth hoàn tất hai thuật toán | lệch (Alpha-Beta kẹt ở 1) | khớp 2/2 |

---

## 3. Bảng per-position (nguồn: `docs/test-reports/ai/benchmark-results.csv`)

Depth = 2, seed = 42, deadline 10.000 ms/thế cờ (không lần nào chạm deadline). `Δ = MM − AB`; Δ âm nghĩa là Alpha-Beta duyệt nhiều node hơn.

| ID | Turn | MM nodes | AB nodes | Δ | Pruning % | Score (MM=AB) | Depth |
|---|---|---|---|---|---|---|---|
| corpus-01-initial | RED | 1965 | 174 | +1791 | 91,1 | -50 | 2/2 |
| corpus-02-rook-siege | RED | 142 | 85 | +57 | 40,1 | 1600 | 2/2 |
| corpus-03-cannon-screen | BLACK | 79 | 29 | +50 | 63,3 | -250 | 2/2 |
| corpus-04-horse-attacks-rook | RED | 150 | 32 | +118 | 78,7 | 400 | 2/2 |
| **corpus-05-pawn-endgame** | RED | 12 | 16 | **-4** | **-33,3** | 140 | 2/2 |
| corpus-06-advisor-pair-endgame | RED | 104 | 60 | +44 | 42,3 | 500 | 2/2 |
| **corpus-07-two-horses** | RED | 41 | 54 | **-13** | **-31,7** | 800 | 2/2 |
| corpus-08-elephant-defense | BLACK | 66 | 26 | +40 | 60,6 | -50 | 2/2 |
| **corpus-09-cannon-chariot-battery** | RED | 80 | 86 | **-6** | **-7,5** | 1350 | 2/2 |
| corpus-10-blocked-horse | RED | 44 | 18 | +26 | 59,1 | 320 | 2/2 |
| **corpus-11-rook-check-evasion** | BLACK | 20 | 22 | **-2** | **-10,0** | -700 | 2/2 |
| corpus-12-double-cannon-check | BLACK | 63 | 19 | +44 | 69,8 | -450 | 2/2 |
| corpus-13-horse-palace-threat | BLACK | 20 | 15 | +5 | 25,0 | -200 | 2/2 |
| **corpus-14-advance-pawn-crossed** | RED | 13 | 17 | **-4** | **-30,8** | 360 | 2/2 |
| corpus-15-rook-double-attack | RED | 325 | 58 | +267 | 82,2 | 500 | 2/2 |
| corpus-16-advisor-file-block | BLACK | 16 | 12 | +4 | 25,0 | -200 | 2/2 |
| **corpus-17-open-file-control** | RED | 53 | 59 | **-6** | **-11,3** | 900 | 2/2 |
| corpus-18-trapped-chariot | RED | 88 | 26 | +62 | 70,5 | 400 | 2/2 |
| corpus-19-pawn-advancement-clash | RED | 20 | 18 | +2 | 10,0 | 320 | 2/2 |
| corpus-20-complex-middlegame | RED | 1368 | 161 | +1207 | 88,2 | 0 | 2/2 |

---

## 4. Những gì đã sửa trong corpus

**a) Tên quân (F-13):** toàn bộ **29** chỗ `CHARIOT` → `ROOK` và `SOLDIER` → `PAWN` trên 14 entry (entry 1 có 14 chỗ, các entry 2/4/5/6/9/10/11/14/15/17/18/19/20 có 1–2 chỗ).

**b) Lỗi cấu trúc/ngữ nghĩa phát hiện thêm (đã sửa):**

| ID | Vấn đề gốc | Sửa |
|---|---|---|
| corpus-02 | "chiếu hết 1 nước" là sai: quân `CHARIOT` không sinh nước; thế cờ thực tế không có chiếu hết | Đổi thành `corpus-02-rook-siege`: 2 Xe đỏ (0,0)/(8,8) + Sĩ đen (4,8) giữ hàng cuối (thế cờ hợp lệ, mô tả đúng) |
| corpus-03 | `turn=RED` nhưng Tướng Đen **đang bị chiếu** → thế cờ bất hợp lệ | `turn=BLACK` (bên bị chiếu đi trước), mô tả ghi rõ Pháo (4,2) chiếu qua ngòi Sĩ (4,8) |
| corpus-05 | Tốt đỏ (4,8) chiếu Tướng Đen trong khi `turn=RED` → bất hợp lệ | Dời Tốt về (4,7): qua sông, chắn cột 4, không chiếu |
| corpus-06 | `turn=RED` + Xe (4,7) chiếu Tướng Đen + hai Tướng cùng cột 4 đối mặt → bất hợp lệ | Đổi thành `corpus-06-advisor-pair-endgame`, Tướng Đỏ (5,0), Xe (0,7) — không còn chiếu/đối mặt |
| corpus-09 | Tướng Đỏ về (4,0) tạo **stalemate 1 nước** → Alpha-Beta early-exit ở depth 1 (lệch `completedDepth`) | Tướng Đỏ (5,0), Xe (1,5) — bỏ bẫy stalemate, giữ bố cục cột 1 |
| corpus-10 | Mô tả "Mã bị chặn cẳng không thể đi" sai (Mã còn 6 hướng) | Đổi thành `corpus-10-blocked-horse`: Tốt (4,5) chặn đúng 2 hướng lên (3,4)/(5,4) |
| corpus-11 | Mô tả "Sĩ che tướng chống xe chiếu ngang" sai (Sĩ (3,8) không chắn hàng 9) | Đổi thành `corpus-11-rook-check-evasion`: Xe (0,9) chiếu hàng cuối, Đen né (4,8) |
| corpus-12 | `turn=RED` nhưng Tướng Đen đang bị chiếu → bất hợp lệ | `turn=BLACK`; mô tả ghi Đen ăn được ngòi (4,8) |
| corpus-13 | `turn=RED` nhưng Mã (2,8) đã chiếu Tướng Đen (4,9) → bất hợp lệ | `turn=BLACK`; mô tả đúng thế "Mã ngọa tào", Đen né (3,9)/(5,9) |
| corpus-14 | Tướng Đỏ về (4,0) tạo **stalemate 1 nước** (Tốt (2,8) khống chế (3,8), hai Tướng đối mặt) | Tướng Đỏ (5,0) + Tốt (2,7); mô tả đe dọa (2,8)/(3,7) |
| corpus-15 | Xe (6,7)→(3,7) là **chiếu hết 1 nước** → Alpha-Beta early-exit | Tướng Đỏ (5,0) để (4,9) còn là ô thoát; mô tả giữ nguyên (đe dọa Mã + Pháo) |
| corpus-16 | Tên `stalemate-defense` sai: Đen còn 3 nước hợp lệ | Đổi thành `corpus-16-advisor-file-block`: Sĩ (4,1) chắn cột 4 ngăn hai Tướng đối mặt |
| corpus-17 | Xe (8,4)→(3,4) là **chiếu hết 1 nước** → Alpha-Beta early-exit | Tướng Đỏ (5,0); mô tả giữ nguyên (Xe độc chiếm cột 8) |
| corpus-04, corpus-18 | Tên `horse-fork`/`trapped-chariot` gắn với `CHARIOT`; "bắt đôi Xe và Tướng" không đúng (Mã không tấn công Tướng) | Đổi tên `corpus-04-horse-attacks-rook`; mô tả chỉ nêu đúng điều đã kiểm (Mã tấn công/ăn được Xe) |

**c) Kiểm chứng trên cả 20 thế cờ** (script chẩn đoán dùng chính `@xiangqi/game-rules`, đã xoá sau khi xong): tất cả có đúng 1 Tướng mỗi bên **trong cung** của mình, không trùng ô/ID, **bên không đi không bị chiếu**, còn ≥1 nước hợp lệ, cả hai thuật toán trả `move ≠ null`, `validateMove` chấp nhận nước đã chọn, điểm hữu hạn và hai thuật toán cùng `completedDepth = 2`. Các bẫy chiếu hết/stalemate 1 nước bị loại vì Alpha-Beta có early-exit khi gặp điểm mate (`Math.abs(score) >= MATE_SCORE - 100`), khiến so sánh mất công bằng; đây là đánh đổi có chủ đích, không giấu.

---

## 5. Mapping T023-xx ↔ 08-TEST-EXECUTION

Hàng ISSUE-023 của spec 08: *"Corpus20 thế có oracle độc lập và baseline/pruning comparison; 5repeats/position/level đạt budget p95; 60ván đổi màu đạt strength gate theo07, ghi seed/nodes/depth/score và limits"*. Repo đã dùng sẵn `T023-01`/`T023-02` cho hai nửa của mệnh đề đầu, nên giữ nguyên và ghi mapping:

| Case | Nội dung | Test path + tên | Kết quả |
|---|---|---|---|
| **T023-01** | Corpus 20 thế, oracle độc lập | `tests/unit/ai-corpus.test.ts` → `T023-01: AI corpus integrity (Zod validation at load time)` | **PASS** — 20/20 hợp lệ; 12 ca đầu vào cố ý hỏng (11 biến thể entry + root không phải mảng) đều bị từ chối kèm thông báo rõ; có ca ghi file hỏng ra đĩa và `loadCorpus` ném lỗi |
| **T023-01b** | Reproduce: cùng seed/depth → cùng kết quả | `tests/unit/ai-corpus.test.ts` → `T023-01b: Reproducibility (same seed and depth)` | **PASS** — score/nodes/move/completedDepth trùng khớp |
| **T023-02** | Baseline vs pruning, so cùng depth | `tests/ai/benchmark.test.ts` → `T023-02: Fixed-depth Minimax vs Alpha-Beta benchmark (20 positions)` | **PASS (depth 2)** — 20/20 `move` hợp lệ, điểm hữu hạn, `completedDepth` khớp, điểm hai thuật toán trùng 20/20, tổng node giảm (987 < 4.669), và 6 vị trí alpha-beta tốn hơn được **báo cáo tường minh** |
| **T023-03** | 5 repeats/position/level + budget p95 | (không có lane) | **NOT_RUN** — không script/test nào chạy; `tests/ai/tournament.ts` tồn tại nhưng không được runner nào gọi và không phải `*.test.ts` |
| **T023-04** | 60 ván đổi màu đạt strength gate theo 07 | (không có lane) | **NOT_RUN** — cùng lý do; `docs/test-reports/ai/` không có `tournament-*.json` |

---

## 6. Giới hạn (ghi rõ, không tô hồng)

1. **Chỉ một độ sâu (depth = 2).** Mọi số node/pruning ở trên là số node tại depth 2, một lần chạy, trên máy Apple M3 Pro; không phải p50/p95 nhiều lần lặp.
2. **78,86% là số gia quyền theo tổng node**, không phải trung bình tỉ lệ từng thế cờ và không phải bất biến: **6/20 thế cờ alpha-beta duyệt nhiều node hơn baseline** (Δ = −4, −13, −6, −2, −4, −6). Bất kỳ tuyên bố "alpha-beta luôn ít node hơn mỗi thế cờ" là sai.
3. **Budget p95 (T023-03) chưa đo.** Deadline 10.000 ms/thế cờ không lần nào bị chạm, nên hành vi abort/timeout của search không được kiểm chứng trong lần này (đã có unit test deadline/cancel riêng ở ISSUE-019/020, không thuộc phạm vi báo cáo này).
4. **Strength gate 60 ván (T023-04) chưa đo.** `tests/ai/tournament.ts` cap 100 ply (`maxPly = 100`, không phải 200 như spec 07 §Gate) và không có lane chạy; không có kết quả `ADJUDICATED_DRAW` nào được tạo trong lần này.
5. **"Oracle độc lập" chỉ ở mức cấu trúc + kiểm tay.** Mô tả từng thế cờ đã được đối chiếu bằng chính rules engine (chiếu/chiếu hết/nước hợp lệ) và sửa lại cho đúng; nhưng corpus **không** có oracle nước đi tốt nhất độc lập kiểu "đáp án giải tay" cho từng thế, nên T023-01 không thể chứng minh chất lượng chiến thuật của từng thế cờ.
6. **Không có lane CI cho `bench:ai:export`.** Xuất bản curated là thao tác có chủ đích, phải gọi tay; artifact JSON đổi cấu trúc từ mảng thuần sang `{meta, aggregate, rows}` (không có consumer code nào đọc file này).
7. **Không chạy `pnpm lint`/`typecheck`/project-wide** trong phạm vi này (theo điều phối: gate toàn cục do orchestrator chạy sau khi mọi nhánh land).

---

## 7. Cách tái lập

```bash
# 1) Chạy benchmark + assertion (không ghi file tracked)
pnpm test:ai

# 2) Xuất bản curated vào docs/test-reports/ai/ (chỉ khi gọi có chủ đích)
pnpm run bench:ai:export

# 3) Chạy cả hai file test của ISSUE-023
pnpm exec vitest run --config vitest.config.ts tests/ai/benchmark.test.ts tests/unit/ai-corpus.test.ts
```

Artifact:

- `artifacts/ai-benchmark/benchmark-results.{json,csv}` — mặc định, đã gitignore (raw output mỗi lần chạy).
- `docs/test-reports/ai/benchmark-results.json` — `{meta, aggregate, rows}`; `meta.aggregatePruningDefinition` ghi định nghĩa con số 78,86%; `aggregate.positionsWhereAlphaBetaVisitedMore` + danh sách ID.
- `docs/test-reports/ai/benchmark-results.csv` — 20 dòng + cột `Node Delta (MM-AB)`, `Scores Match`, `Depths Match`.
- Thay đổi so với trước: `tests/fixtures/ai-corpus.json`, `tests/ai/benchmark.ts`, `tests/ai/benchmark.test.ts`, `tests/unit/ai-corpus.test.ts`, script `bench:ai:export` trong `package.json`.
