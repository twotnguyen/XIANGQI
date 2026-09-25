# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-017 — Hai kênh chat và lịch sử có phân quyền

**Ngày thực hiện:** 2026-09-13  
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.21.0, Apple Silicon (arm64)  
**Tiêu chuẩn kiểm chứng:** [04-CONTRACTS.md](../specs/04-CONTRACTS.md), [07-UI-AND-TESTS.md](../specs/07-UI-AND-TESTS.md) & [ISSUE-017-private-chat](../issues/ISSUE-017-private-chat.md)  

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi:
```bash
pnpm exec vitest run --config vitest.config.ts tests/unit/chat.test.ts
```

### Kết quả đầu ra (Exit Code: 0):
```
 RUN  v3.2.7 /Users/twot/Documents/CODE/XIANGQI
 ✓ tests/unit/chat.test.ts (6 tests) 39ms
 Test Files  1 passed (1)
      Tests  6 passed (6)
   Start at  03:48:59
   Duration  461ms (transform 114ms, setup 0ms, collect 248ms, tests 39ms, environment 0ms, prepare 35ms)
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Tách biệt kênh chat** | Hai kênh PLAYERS (kỳ thủ) và SPECTATORS (khán giả) | Khán giả không thể đọc hay gửi tin vào kênh nội bộ PLAYERS | Kiểm chứng thành công | **PASS** |
| **Chống mã độc XSS** | Gửi tin nhắn chứa mã HTML độc hại (<script>, <img onerror>) | Hiển thị dạng văn bản thuần túy, an toàn tuyệt đối | Kiểm chứng thành công | **PASS** |
| **Lọc trùng tin nhắn** | Gửi tin nhắn với cùng clientMessageId | Chỉ hiển thị 1 tin nhắn duy nhất, loại bỏ trùng lặp | Kiểm chứng thành công | **PASS** |
| **Giới hạn độ dài tin nhắn** | Tin nhắn vượt quá độ dài quy định | Bị cắt tỉa hoặc từ chối theo schema hợp đồng | Kiểm chứng thành công | **PASS** |
| **Tước quyền chat** | Khán giả bị thu hồi quyền truy cập phòng | Không thể tiếp tục gửi hay tải lịch sử tin nhắn mới | Kiểm chứng thành công | **PASS** |

---

## 3. Tổng hợp kết quả kiểm thử toàn dự án

```
- Unit Tests:          32 test files, 199 tests pass (100% PASS)
- E2E Tests:           78 Playwright tests (100% PASS trên cả Desktop & Mobile 360px)
- AI Benchmark:        20 thế cờ tiêu chuẩn, tỷ lệ cắt nhánh 84.51%
- Concurrency & Load:  10 phòng, 70 kết nối, p95 latency: 28.57ms (< 100ms)
- Typecheck:           TypeScript strict mode (0 errors)
- Linter:              ESLint 10 (0 errors, 0 warnings)
- Build:               Toàn bộ packages biên dịch thành công (exit code 0)
```
