# ISSUE-035 — Migration: profiles + trigger

**Nhóm:** E04 · **Phụ thuộc:** 034 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Bảng hồ sơ người dùng, gắn với `auth.users` của Supabase, tự tạo khi đăng ký.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-AUTH.md](../01-requirements/REQ-AUTH.md) §9 `BR-AUTH-01..04` · [../05-data-and-realtime/data-model.md](../05-data-and-realtime/data-model.md) §2.1

## 3. PHẠM VI
**✅ LÀM** — bảng `profiles` · ràng buộc · trigger tạo tự động
**❌ KHÔNG LÀM** — RLS (043) · logic đăng ký (047)

## 4. FILE TẠO
`supabase/migrations/<timestamp>_profiles.sql`

## 5. CÁC BƯỚC
1. Bảng `public.profiles`:
   | Cột | Kiểu | Ràng buộc |
   |---|---|---|
   | `user_id` | uuid | **PK**, FK → `auth.users(id)`, `ON DELETE RESTRICT` |
   | `username` | text | **UNIQUE**, cho phép NULL (Google chưa chọn) |
   | `display_name` | text | NOT NULL |
   | `profile_verified_at` | timestamptz NULL | Server-only; NULL là hồ sơ tạm chưa chứng minh sở hữu email, xem auth-provider-config §5 |
   | `created_at` | timestamptz | NOT NULL, mặc định `now()` |
2. **Ràng buộc bắt buộc** — chép đúng:
   ```sql
   CHECK (username IS NULL OR username ~ '^[a-z0-9_]{3,24}$')
   CHECK (char_length(display_name) BETWEEN 1 AND 40)
   ```
   Lưu username **dạng chữ thường** — `CHECK` chặn chữ HOA ở tầng dữ liệu, **không** chỉ chuẩn hoá ở giao diện
3. Trigger `AFTER INSERT ON auth.users`:
   - `SECURITY DEFINER`, `search_path = ''`
   - Đọc `signup_username` và `signup_display_name` từ metadata
   - **Không** đọc quyền hay vai trò từ metadata
   - Google chưa có username ⇒ để `NULL`
4. Đổi metadata về sau **không** cập nhật `profiles` (`BR-AUTH-03`). `profile_verified_at` chỉ server ghi sau xác minh/onboarding; client metadata không được tự đặt. Xử lý Google collision với hồ sơ tạm chưa verified theo [auth-provider-config](../09-technical/auth-provider-config.md), không đổi username chính thức đã xác minh.
5. `ON DELETE RESTRICT` — xoá tài khoản bị chặn có chủ ý (chưa có chức năng xoá)

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T035-01` | Migration chạy trên DB **sạch** → exit 0 |
| `T035-02` | Insert `auth.users` với metadata → `profiles` **tự tạo** |
| `T035-03` | Username `Alice` (chữ HOA) → **vi phạm CHECK** |
| `T035-04` | Username 2 ký tự và 25 ký tự → **vi phạm CHECK** |
| `T035-05` | Hai profile cùng username → **vi phạm UNIQUE** |
| `T035-06` | Username `NULL` cho **nhiều** hàng → **được phép** |
| `T035-07` | `display_name` rỗng và 41 ký tự → **vi phạm CHECK** |
| `T035-08` | Xoá `auth.users` khi còn profile → **bị chặn** |
| `T035-10` | Metadata giả profile_verified_at không xác minh hồ sơ; NULL mặc định; server chỉ đánh dấu theo Auth đã kiểm chứng |
| `T035-09` | Đổi metadata sau khi tạo → `profiles` **không đổi** |

> Toàn bộ test chạy trên **PostgreSQL thật** (`WORKFLOW` §4 luật 2).

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 10 test xanh **trên PostgreSQL thật**
- [ ] `T035-03` chứng minh chữ HOA bị chặn ở **tầng dữ liệu**
- [ ] `T035-06` chứng minh nhiều NULL được phép
- [ ] Trigger có `SECURITY DEFINER` và `search_path` rỗng
- [ ] **0 test bị bỏ qua**

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-035.md`

## 9. ⚠ CẠM BẪY
Chỉ chuẩn hoá chữ thường ở giao diện là **không đủ** — ai gọi thẳng API sẽ tạo được `Alice` và `alice` thành hai tài khoản. `CHECK` ở tầng dữ liệu là chốt chặn cuối.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Tạo profiles và trigger theo §5. Function `public.handle_new_auth_user()` dùng SECURITY DEFINER, search_path rỗng và tên bảng đầy đủ schema. Mở rộng `tests/fixtures/migration-db.ts` với `seedMigrationUsers(runId:string,count:number):Promise<{id:string;email:string;username:string}[]>`, gọi Supabase Admin Auth local thật. Cleanup theo runId/IDs, xóa hàng ứng dụng trước Auth user. Không cần route đăng ký 047 để kiểm trigger.

Các giao diện này phải được tạo khi thực thi; chưa có mã runtime hay bằng chứng PASS. Đọc AGENT-START-HERE và TEST-CONVENTIONS; mọi phụ thuộc phải đã merge.

### Fixture và ca kiểm có thể chạy

**File kiểm thử:** `tests/integration/issue-035.test.ts`. Seed Auth user thật bằng helper của 034; runId riêng, username tối đa 24 ký tự. Mỗi ca lỗi SQL có SAVEPOINT rồi rollback để không làm hỏng ca sau.

- T035-01/02: áp migration từ DB test sạch; tạo Auth user với signup_username/signup_display_name, đọc profile đúng một hàng.
- T035-03…07: Alice, username dài 2/25, display_name dài 0/41 bị CHECK 23514; username trùng bị UNIQUE 23505. Hai username NULL được phép; giới hạn 3/24 và 1/40 được chấp nhận.
- T035-08: xóa Auth user còn profile bị FK 23503; cả hai hàng giữ nguyên.
- T035-09/10: thay metadata username và profile_verified_at giả; profile không đổi, verified vẫn NULL. Flow xác minh thật thuộc 048/053, không được dùng quyền migration để báo đã xác minh.

**Ca trọng yếu — nội dung để triển khai:**

```sql
-- Chạy qua connectMigrationDb trên DB test sau migration; không dùng để thay test trigger/Auth.
SELECT p.prosecdef, p.proconfig
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname='handle_new_auth_user';
-- Assert đúng một function, prosecdef=true và search_path rỗng.
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_schema='public' AND table_name='profiles'
  AND column_name IN ('username','profile_verified_at');
-- Assert cả hai nullable YES; runtime CHECK/UNIQUE phải kiểm riêng bằng inserts thực.
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Bỏ username CHECK hoặc trigger đọc profile_verified_at từ metadata; T035-03/10 đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:integration -- tests/integration/issue-035.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao SQL schema/triggerdefinition+SQLSTATE, không được đánh dấu Google link/verify hoàn thành. Thiếu pinned Auth schema làm trigger không chạy → BLOCKED.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
