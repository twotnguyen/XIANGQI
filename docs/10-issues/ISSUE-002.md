# ISSUE-002 — ESLint + Prettier + quy ước mã

**Nhóm:** E00 · **Phụ thuộc:** 001 · **Trạng thái:** TODO

---

## 1. MỤC TIÊU

Dựng kiểm tra mã tự động, có **luật riêng bảo vệ ranh giới kiến trúc**.

## 2. ĐỌC TRƯỚC

[../09-technical/tech-stack.md](../09-technical/tech-stack.md) §3 (ranh giới Prisma/SQL) · [../09-technical/architecture.md](../09-technical/architecture.md) §9 (ranh giới mô-đun)

## 3. PHẠM VI

**✅ LÀM** — ESLint phẳng cho toàn kho · Prettier · luật chặn import sai ranh giới · script `lint`

**❌ KHÔNG LÀM** — sửa code có sẵn cho hết cảnh báo (chưa có code)

## 4. FILE TẠO

`eslint.config.js` · `.prettierrc` · `.prettierignore`

## 5. CÁC BƯỚC

1. Cài ESLint 9 (cấu hình phẳng) + `typescript-eslint` + `eslint-config-prettier`
2. Bật các luật: `no-floating-promises` · `no-misused-promises` · `await-thenable` · `no-explicit-any` (mức lỗi) · `consistent-type-imports`
3. **Luật ranh giới kiến trúc — quan trọng nhất.** Dùng `no-restricted-imports`:

   | Package | **Cấm** import |
   |---|---|
   | `packages/game-rules` | bất cứ thứ gì ngoài `@xiangqi/contracts` — **cấm** `pg`, `@nestjs/*`, `fs`, `http` |
   | `packages/ai` | chỉ `@xiangqi/contracts` và `@xiangqi/game-rules` |
   | `packages/contracts` | **không** import package nội bộ nào |

4. Prettier: 2 dấu cách · nháy đơn · dấu phẩy cuối · rộng 100
5. Script `lint` chạy ESLint cho toàn kho, `--max-warnings 0`

## 6. TEST BẮT BUỘC

| Tên | Kiểm gì |
|---|---|
| `T002-01` | `pnpm lint` trên kho sạch → exit 0, 0 cảnh báo |
| `T002-02` | Thêm `import pg from 'pg'` vào `game-rules` → lint **báo lỗi** |
| `T002-03` | Thêm `const x: any` → lint **báo lỗi** |
| `T002-04` | Thêm promise không `await` → lint **báo lỗi** |

> `T002-02` là test quan trọng nhất: chứng minh luật ranh giới **thật sự chạy**.

## 7. ⛔ ĐIỀU KIỆN PASS

- [ ] `pnpm lint` exit 0, **0 cảnh báo**
- [ ] `T002-02` chứng minh `game-rules` không import được `pg`
- [ ] `T002-03` chứng minh `any` bị chặn
- [ ] `T002-04` chứng minh promise trôi bị chặn
- [ ] Prettier không xung đột ESLint

## 8. BẰNG CHỨNG

`docs/test-reports/ISSUE-002.md` — kèm ảnh chụp output lint khi cố tình vi phạm.

## 9. ⚠ CẠM BẪY

Luật ranh giới mà **không có test chứng minh** thì coi như không có. Bắt buộc `T002-02`.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

`pnpm lint` chạy ESLint thật trên TS/TSX/JS, bao gồm rules kiến trúc theo đường file; lỗi/cảnh báo đều exit !=0. Script kiểm âm dùng Node built-in, chưa gọi Vitest 003. Tạo `tests/bootstrap/issue-002.mjs` chạy ESLint CLI và luôn xóa probe.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/bootstrap/issue-002.mjs`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Mỗi probe viết tạm `packages/game-rules/src/__lint_probe.ts` để đúng tsconfig và override. Dùng 3 nội dung tách biệt; tránh để parser error che lỗi rule mục tiêu.

- T002-01: baseline sạch → lint exit 0, warnings 0.
- T002-02: probe `import type { Pool } from "pg"; export type Probe = Pool;` → diagnostic no-restricted-imports, không chấp nhận chỉ lỗi module-not-found.
- T002-03: probe `export const bad: any = 1;` → no-explicit-any.
- T002-04: probe `async function task(): Promise<void> {} task();` → no-floating-promises; sau xóa probe lint xanh.

**Ca trọng yếu — nội dung để triển khai:**

```js
// tests/bootstrap/issue-002.mjs: phần assertion sau spawnSync CLI ESLint.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { writeFileSync, rmSync } from 'node:fs';
const path = 'packages/game-rules/src/__lint_probe.ts';
try {
  writeFileSync(path, 'export const bad: any = 1;\n');
  const run = spawnSync('pnpm', ['exec', 'eslint', path, '--max-warnings', '0'], {encoding:'utf8'});
  assert.notEqual(run.status, 0);
  assert.match(run.stdout + run.stderr, /no-explicit-any/);
} finally { rmSync(path, {force:true}); }
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Tắt riêng override game-rules rồi chạy probe import pg; test phải đỏ vì thiếu diagnostic ranh giới.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
node tests/bootstrap/issue-002.mjs
pnpm lint
pnpm typecheck
pnpm build
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao ESLint/Prettier config và output bốn probe; thiếu công cụ lint là BLOCKED, không thay bằng grep-only.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
