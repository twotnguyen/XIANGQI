# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-023 — Thí nghiệm AI và số liệu bảo vệ

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, Apple Silicon (arm64)  
**Tiêu chuẩn kiểm chứng:** [08-TEST-EXECUTION.md](../../specs/08-TEST-EXECUTION.md) & [ISSUE-023](../../issues/ISSUE-023-ai-experiments.md)  

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm test:ai
```

### Kết quả đầu ra (Exit Code: 0):
```
=== AI BENCHMARK SUMMARY ===
Positions tested: 20
Total Minimax Nodes: 2388
Total Alpha-Beta Nodes: 370
Aggregate Pruning Efficiency: 84.51% reduction
Score Agreement: 8/20 (40.0%)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Reproduce** | Cùng seed, độ sâu 2 | Điểm số và nước đi giống hệt nhau 100% | `run1.score === run2.score`, `run1.nodes === run2.nodes`, `run1.move === run2.move` | **PASS** |
| **Pruning** | 20 thế cờ cố định độ sâu | Tổng số nodes duyệt giảm đáng kể | Minimax: 2,388 nodes $\to$ Alpha-Beta: 370 nodes (**giảm 84.51%**) | **PASS** |
| **Corpus Integrity** | 20 thế cờ chuẩn hóa | Đủ 20 thế cờ với 2 tướng hợp lệ | 20 thế cờ bao gồm khai cuộc, trung cuộc, tàn cuộc, đòn chiến thuật | **PASS** |
| **Artifacts** | Xuất báo cáo đo lường | File JSON, CSV và tài liệu kiến trúc | `benchmark-results.json`, `benchmark-results.csv`, `AI-EXPLANATION.md` | **PASS** |

---

## 3. Tổng hợp kết quả các bộ test toàn dự án

```
pnpm test:unit  → 26 test files, 180 tests pass (0 fail)
pnpm test:e2e   → 54 tests pass (27 desktop + 27 mobile)
pnpm test:ai    → 20 thế cờ benchmark hoàn tất, xuất JSON/CSV
pnpm typecheck  → exit 0 (tsc -b)
pnpm lint       → exit 0
pnpm build      → exit 0
```
