# ISSUE-043 — RLS + grants + vai trò app_server

**Nhóm:** E04 · **Phụ thuộc:** 035–042 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Bật **chặn mặc định** ở tầng dữ liệu, để nếu khoá công khai bị dùng trực tiếp thì **không đọc được gì**.

## 2. ĐỌC TRƯỚC
[../09-technical/tech-stack.md](../09-technical/tech-stack.md) §2.3 · [../01-requirements/README.md](../01-requirements/README.md) luật 2

## 3. PHẠM VI
**✅ LÀM** — bật RLS mọi bảng · vai trò `app_server` · grants
**❌ KHÔNG LÀM** — route kiểm quyền nghiệp vụ. Predicate đọc chat ở [room-chat-contract](../09-technical/room-chat-contract.md) được thực thi tại máy chủ; không mở policy SELECT trực tiếp cho authenticated để thay thế kiến trúc này.

## 4. FILE TẠO
`supabase/migrations/<timestamp>_rls.sql`

## 5. CÁC BƯỚC
1. **Bật RLS trên TẤT CẢ bảng ứng dụng**:
   ```sql
   ALTER TABLE public.<bảng> ENABLE ROW LEVEL SECURITY;
   ```
2. **Không tạo policy nào cho `anon` và `authenticated`** ⇒ chặn mặc định. Trình duyệt **không** đọc thẳng bảng — mọi thứ qua máy chủ (`ARCH-02`)
3. Tạo vai trò `app_server`:
   ```sql
   CREATE ROLE app_server LOGIN;
   GRANT USAGE ON SCHEMA public TO app_server;
   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_server;
   ```
   Cấp **policy cho phép** riêng cho `app_server` ở từng bảng (hoặc dùng `BYPASSRLS`? **KHÔNG** — đặc tả cấm)
4. `app_server` **KHÔNG** được:
   - `BYPASSRLS`
   - `SELECT` thẳng `auth.users` hay `auth.sessions`
   - `SUPERUSER`
5. Hàm kiểm phiên còn hiệu lực:
   ```sql
   CREATE FUNCTION private.is_auth_session_active(session_id uuid, user_id uuid)
   RETURNS boolean SECURITY DEFINER SET search_path = '' ...
   ```
   Chỉ `app_server` được `EXECUTE`. **Không** phơi ra API công khai.
6. Helper metadata bootstrap:
   ```sql
   private.get_auth_session_metadata(session_id uuid, user_id uuid)
   RETURNS TABLE (created_at timestamptz)
   SECURITY DEFINER SET search_path = ''
   ```
   Chỉ trả một hàng `created_at` khi session_id khớp user_id và phiên Auth còn hiệu lực; không khớp/hết hiệu lực trả rỗng. Không trả email, token hay toàn bộ hàng Auth. App chỉ truyền IDs từ JWT đã verify; không nhận user_id tùy ý từ body. Không cấp SELECT auth.users/auth.sessions cho app_server.
7. Cả hai helper do role migration đặc quyền sở hữu, fully-qualified mọi bảng, không dynamic SQL; `REVOKE ALL ON FUNCTION ... FROM PUBLIC, anon, authenticated`, chỉ GRANT EXECUTE cho app_server; schema private không nằm trong danh sách exposed schema. Bật quyền USAGE private cần thiết cho app_server. Test gọi trực tiếp bằng DB role và qua API công khai, không chỉ kiểm UI.

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T043-01` | Migration chạy trên DB sạch → exit 0 |
| `T043-02` | ⭐ Dùng khoá **anon** → `SELECT` mọi bảng ứng dụng đều **trả rỗng hoặc bị từ chối** |
| `T043-03` | ⭐ Dùng khoá **authenticated** → cũng **không đọc được** |
| `T043-04` | Dùng khoá anon → `INSERT` bị **từ chối** |
| `T043-05` | Vai trò `app_server` → đọc ghi **bình thường** |
| `T043-06` | `app_server` **KHÔNG** có `BYPASSRLS` — kiểm `pg_roles` |
| `T043-07` | `app_server` `SELECT auth.users` → **bị từ chối** |
| `T043-08` | RLS bật trên **mọi** bảng ứng dụng — đếm bằng `pg_tables` |
| `T043-09` | Hàm `is_auth_session_active` **không** gọi được qua API công khai |
| `T043-10` | app_server không SELECT auth.sessions nhưng helper metadata trả đúng created_at của cặp session/user hợp lệ; sai user/session hoặc phiên hết hạn trả rỗng, không email/token. |
| `T043-11` | PUBLIC/anon/authenticated không EXECUTE cả hai helper qua SQL/API; app_server không thể thay search_path hay tên đối tượng để đọc dữ liệu ngoài kết quả hẹp. |

> `T043-02` và `T043-03` phải chạy với **cả hai** loại khoá, không chỉ một.

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 11 test xanh trên PostgreSQL thật
- [ ] `T043-08`: **100%** bảng ứng dụng bật RLS
- [ ] `T043-06`: `app_server` không vượt RLS
- [ ] `T043-02` và `T043-03` với **cả hai** loại khoá
- [ ] Báo cáo liệt kê **từng bảng** và trạng thái RLS

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-043.md` — bảng liệt kê mọi bảng ứng dụng và kết quả thử với anon/authenticated/app_server.

## 9. ⚠ CẠM BẪY
Chỉ thử với khoá **anon** là không đủ — khoá **authenticated** có quyền khác. Đặc tả yêu cầu thử **cả hai**. Và nếu dùng superuser để chạy test thì **mọi lỗi phân quyền bị che hết**.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Tái sử dụng app_server đã bootstrap ở 034; CREATE ROLE chỉ khi chưa tồn tại. Cấp grants/policies cho bảng ứng dụng, không cho SELECT Auth. Hai helper private thuộc role migration đặc quyền, SECURITY DEFINER, search_path rỗng, bảng fully-qualified; REVOKE PUBLIC/anon/authenticated. Chỉ app_server có USAGE private và EXECUTE. Schema private không thuộc exposed REST schemas.

Các giao diện này phải được tạo khi thực thi; chưa có mã runtime hay bằng chứng PASS. Đọc AGENT-START-HERE và TEST-CONVENTIONS; mọi phụ thuộc phải đã merge.

### Fixture và ca kiểm có thể chạy

**File kiểm thử:** `tests/integration/issue-043.test.ts`. Lấy inventory bảng ứng dụng từ pg_class, seed canary theo runId cho từng bảng. Tạo JWT Auth thật của A/B và kết nối app_server thật; không dùng superuser để assert quyền.

- T043-01/05/06/08: migration sạch; 100% bảng ứng dụng bật RLS; app_server không SUPERUSER/BYPASSRLS nhưng CRUD ứng dụng hợp lệ được phép.
- T043-02/03/04: mỗi bảng thử anon/authenticated qua REST và SQL. SELECT không thấy canary; INSERT/UPDATE/DELETE bị chặn hoặc không tác động hàng; ghi ma trận role × operation và kiểm DB giữ nguyên.
- T043-07/10: app_server SELECT auth.users/auth.sessions bị 42501; helper metadata đúng cặp session/user chỉ trả created_at, sai cặp hoặc revoked trả rỗng.
- T043-09/11: private helper không có public RPC; anon/authenticated không EXECUTE qua SQL. Thử search_path và object tạm cùng tên không mở thêm dữ liệu; helper có search_path cố định.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { connectTestDb } from '../fixtures/migration-db';
test('T043-06/07 app role không vượt quyền', async () => {
  const db=await connectTestDb();
  try {
    const role=await db.query('SELECT rolsuper,rolbypassrls FROM pg_roles WHERE rolname=current_user');
    expect(role.rows).toEqual([{rolsuper:false,rolbypassrls:false}]);
    await expect(db.query('SELECT id FROM auth.users LIMIT 1')).rejects.toMatchObject({code:'42501'});
  } finally { await db.end(); }
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Cấp BYPASSRLS hoặc EXECUTE PUBLIC; T043-06/11 đỏ; tắt RLS một bảng inventory test đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:integration -- tests/integration/issue-043.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao full table×role×CRUDmatrix+helpers hẹp;045 db pull dùng migration/introspection role riêng, runtime app vẫn không Auth SELECT.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
