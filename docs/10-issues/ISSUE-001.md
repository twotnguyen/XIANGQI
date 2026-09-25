# ISSUE-001 — Khởi tạo monorepo pnpm + TypeScript strict

**Nhóm:** E00 Nền tảng · **Phụ thuộc:** không có · **Trạng thái:** TODO

---

## 1. MỤC TIÊU

Dựng bộ khung kho mã trống nhưng **build được**, có đủ 6 package; script đã có công cụ chạy thật, lane tương lai fail rõ ràng theo WORKFLOW §3.

## 2. ĐỌC TRƯỚC

| Tài liệu | Mục |
|---|---|
| [../09-technical/tech-stack.md](../09-technical/tech-stack.md) | §1 bảng chốt |
| [WORKFLOW.md](WORKFLOW.md) | §7 cấu trúc thư mục đích |

## 3. PHẠM VI

**✅ LÀM**
- `pnpm-workspace.yaml` với 6 package
- `package.json` gốc + script chuyển tiếp tham số
- `tsconfig.base.json` chế độ **nghiêm ngặt**
- `.gitignore` · `.env.example`
- Mỗi package có `package.json` + `tsconfig.json` + `src/index.ts` rỗng
- Giữ nguyên `docs/` đã có sẵn trong kho chính `XIANGQI`

**❌ KHÔNG LÀM**
- Logic nghiệp vụ nào
- ESLint (issue 002) · Vitest (003) · Playwright (004) · CI (005)
- Cài Supabase hay LiveKit

## 4. FILE TẠO

```
package.json · pnpm-workspace.yaml · tsconfig.base.json
.gitignore · .env.example · README.md
apps/web/{package.json,tsconfig.json,src/main.tsx,index.html,vite.config.ts}
apps/server/{package.json,tsconfig.json,src/main.ts}
apps/ai-worker/{package.json,tsconfig.json,src/main.ts}
packages/contracts/{package.json,tsconfig.json,src/index.ts}
packages/game-rules/{package.json,tsconfig.json,src/index.ts}
packages/ai/{package.json,tsconfig.json,src/index.ts}
docs/            ← copy toàn bộ
```

## 5. CÁC BƯỚC

1. Dùng Git repository `XIANGQI` hiện có; kiểm tra `.gitignore` (`node_modules` · `dist` · `.env` · `artifacts` · `test-results`). Không khởi tạo lại Git.
2. Tạo `pnpm-workspace.yaml`:
   ```yaml
   packages: ['apps/*', 'packages/*']
   ```
3. `tsconfig.base.json` bật **tối thiểu** các cờ sau:
   `strict` · `noUncheckedIndexedAccess` · `noImplicitOverride` · `exactOptionalPropertyTypes` · `noUnusedLocals` · `noUnusedParameters` · `isolatedModules`
4. Mỗi package `tsconfig.json` kế thừa base, bật `composite: true`
5. Ba package trong `packages/` đặt tên `@xiangqi/contracts` · `@xiangqi/game-rules` · `@xiangqi/ai`
6. `apps/web` cài React + Vite, dựng trang trắng có chữ *"Cờ Tướng Online"*
7. `apps/server` cài NestJS, có route `GET /health` trả `{ok:true}`
8. Script gốc trong `package.json`: build/typecheck/dev thực chạy. Các lane chưa có công cụ (lint002/unit003/integration034/e2e004/AI032/media112/load135) phải thoát khác0, báo NOT_IMPLEMENTED và issue sở hữu, không trả xanh rỗng. Khi triển khai lane, **phải chuyển tiếp tham số** bằng `--`:
   ```
   dev · build · typecheck · lint · test:unit · test:integration · test:e2e · test:ai · test:media · test:load
   ```
9. **Khoá chính xác phiên bản** mọi thư viện (`TECH-04`). Không dùng `^` hay `~`
10. Ghi phiên bản thực tế vào `docs/test-reports/toolchain.md`
11. Kiểm tra `docs/` có đủ bộ đặc tả hiện hành trong kho; không ghi đè bằng bản cũ ở thư mục khác.

## 6. TEST BẮT BUỘC

| Tên | Kiểm gì |
|---|---|
| `T001-01` | `pnpm install --frozen-lockfile` từ kho sạch → exit 0 |
| `T001-02` | `pnpm build` → exit 0, cả 6 package ra `dist/` |
| `T001-03` | `pnpm typecheck` → exit 0 |
| `T001-04` | Khởi động server, `GET /health` → 200 `{ok:true}` |
| `T001-05` | Lane chưa tạo: `pnpm test:unit -- duong/dan/sai` → **exit khác0**, thông báo NOT_IMPLEMENTED/ISSUE-003; không coi đây là chứng minh forwarding (T003-02 kiểm khi có runner) |

> T001-05 chỉ chứng minh lane chưa tạo không giả xanh. T003-02 kiểm forwarding trên Vitest thật. Cổng001 theo WORKFLOW §3; không bắt lint/unit chưa được tạo.

## 7. ⛔ ĐIỀU KIỆN PASS

- [ ] `pnpm install --frozen-lockfile` exit 0
- [ ] `pnpm build` exit 0, có `dist/` ở cả 6 package
- [ ] `pnpm typecheck` exit 0
- [ ] `GET /health` trả 200
- [ ] `pnpm test:unit -- <đường dẫn sai>` **exit khác 0**
- [ ] `strict` và `noUncheckedIndexedAccess` đều bật
- [ ] **Không** thư viện nào để `^` hoặc `~`
- [ ] `docs/` đã copy đủ
- [ ] `.env.example` chỉ có giá trị mẫu, **không** secret thật

## 8. BẰNG CHỨNG

`docs/test-reports/ISSUE-001.md` + `docs/test-reports/toolchain.md` (phiên bản Node, pnpm, mọi thư viện).

## 9. ⚠ CẠM BẪY

| Lỗi lần trước | Phòng thế nào |
|---|---|
| Script nuốt tham số → chọn sai file vẫn xanh | `T001-05` bắt buộc |
| Lấy `latest` → build lại thì khác phiên bản | Khoá chính xác (`TECH-04`) |

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Đầu ra là workspace 6 package đã build, `GET /health` có Content-Type JSON và body `{ok:true}`; root forwarding giữ nguyên argv. `dev` chạy web/server, AI en try chỉ khởi động được, chưa tính cờ. Không gọi `git init` nếu kho đã có `.git`; nếu làm ngay trong kho đặc tả, giữ nguyên `docs/`, không copy thư mục vào chính nó.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/bootstrap/issue-001.mjs`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Clone/worktree sạch có Node 24 bản vá cụ thể và pnpm bản cụ thể đã pin; cổng backend dùng PORT từ env mẫu. T001 không cần Vitest.

- T001-01..03: chạy install khóa từ checkout mới, rồi build/typecheck; kiểm riêng dist của apps/web, apps/server, apps/ai-worker và 3 package, không chỉ exit của root.
- T001-04: chạy en try server đã build, poll /health tới sẵn sàng bằng HTTP; assert 200 + JSON deep equal, dừng process trong finally.
- T001-05: gọi lane unit với path không tồn tại; assert exit !=0 và stderr/stdout nhắc NOT_IMPLEMENTED + ISSUE-003; giữ log như một negative test đạt.

**Ca trọng yếu — nội dung để triển khai:**

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm typecheck
curl --fail --silent --show-error http://127.0.0.1:3000/health
pnpm test:unit -- tests/unit/khong-ton-tai.test.ts
```
Dòng cuối bắt buộc exit khác 0; test bootstrap ghi riêng kỳ vọng, không dùng `|| true` để làm cổng xanh.

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Đổi một script lane chưa có thành `exit 0`; T001-05 phải báo sai. Phục hồi trước commit.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
node tests/bootstrap/issue-001.mjs
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao README với lệnh start/stop, lockfile, exact versions, sáu đường dist và health URL; 002/003 thay đúng lane tương ứng.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
