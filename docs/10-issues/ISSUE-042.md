# ISSUE-042 — Migration: AI jobs · client controls

**Nhóm:** E04 · **Phụ thuộc:** 038 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Bảng theo dõi việc tính của máy, và bảng theo dõi tab đang giữ camera/mic.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-AI.md](../01-requirements/REQ-AI.md) §10 · [../05-data-and-realtime/session-state.md](../05-data-and-realtime/session-state.md) §4

## 3. PHẠM VI
**✅ LÀM** — `ai_jobs` · `client_controls` · `app_sessions` · `auth_security_jobs` · **❌ KHÔNG LÀM** — logic (118–120, 099)

## 4. FILE TẠO
`supabase/migrations/<timestamp>_ai_controls.sql`

## 5. CÁC BƯỚC
1. **`ai_jobs`** — **một hàng mỗi ván**:
   | Cột | Ghi chú |
   |---|---|
   | `match_id` | **PK** — một ván một hàng |
   | `job_id` | uuid nullable — đổi mỗi lần giao việc mới |
   | `job_version` | int — **tăng xuyên suốt ván**, client dùng để bỏ kết quả cũ |
   | `expected_version` | int nullable — phiên bản ván lúc giao việc |
   | `status` | `IDLE`/`QUEUED`/`THINKING`/`FAILED` |
   | `attempts` | int 0..2 |
   | `queued_at` · `started_at` · `completed_at` · `deadline_at` | |
   ```sql
   CHECK (status IN ('IDLE','QUEUED','THINKING','FAILED'))
   CHECK (attempts BETWEEN 0 AND 2)
   CHECK (job_version >= 0)
   ```
   ⚠ Trạng thái của việc tính **không** làm tăng `matches.version`

2. **`client_controls`** — giữ nguồn trên mọi tab/trình duyệt/thiết bị, PK `(user_id, kind)`:
   | Cột | Ghi chú |
   |---|---|
   | `user_id` · `kind` (`CAMERA`/`MICROPHONE`) | PK tổ hợp, user FK |
   | `owner_client_id` · `app_session_id` | uuid nullable; server cấp client instance, session FK |
   | `ownership_epoch` | bigint >=0, tăng mỗi lần chuyển thành công |
   | `match_id` | nullable FK |
   | `operation_id` · `target_client_id` | nullable UUID; operation_id UNIQUE khi có |
   | `operation_state` | `IDLE`/`STOPPING`/`APPLIED`/`ERROR`/`CANCELLED`, mặc định IDLE |
   | `started_at` · `deadline_at` · `updated_at` | UTC server; deadline>=started |
   | `old_transport_refs` · `last_error` | thông tin job bền vững, không token |

   `epoch`/`tab_id` trong bản cũ được thay bằng `ownership_epoch`/`owner_client_id`, không giữ hai cột đồng nghĩa. STOPPING cần operation_id, target_client_id, started/deadline. ERROR giữ owner/fence cũ và không cho cấp phát mới; APPLIED chỉ sau chứng cứ SFU, nguồn OFF. Không dùng bảng này khoá đi cờ/chat.

3. **`app_sessions`** theo [auth-provider-config §4](../09-technical/auth-provider-config.md): `id` UUID PK, `user_id` FK, `auth_session_id` UUID UNIQUE, `mode` CHECK REMEMBERED/TEMPORARY, `created_at`, `last_active_at`, `idle_expires_at`, `absolute_expires_at` nullable, `revoked_at` nullable. CHECK idle>=created; TEMPORARY có absolute, REMEMBERED absolute=NULL; các deadline do server ghi. Index(user_id, revoked_at), index(idle_expires_at) cho expiry. Không RLS cho phép client sửa dữ liệu phiên; chỉ server.

4. **`auth_security_jobs`**: id UUID PK, user_id FK, operation_id UNIQUE, reason (PASSWORD_CHANGED/LOGOUT), `scope` CHECK CURRENT/ALL, `target_auth_session_ids` UUID[] NOT NULL (snapshot server, không token), `revocation_cutoff` timestamptz NOT NULL, status(PENDING/RUNNING/DONE/FAILED), created_at, lease_until, attempts>=0, last_error. CURRENT CHECK cardinality(target_auth_session_ids)=1; PASSWORD_CHANGED CHECK scope=ALL. ALL snapshot mọi phiên app ở commit, có thể rỗng; chặn bootstrap mới trong barrier. Operation payload (user_id/reason/scope/target_auth_session_ids/revocation_cutoff) bất biến sau insert; retry cùng ID trả job cũ, payload khác bị CONFLICT, không đổi phạm vi theo người retry. Không password/hash/token. Trigger khi `auth.users.encrypted_password` thay đổi fence mọi app_sessions user + ghi job trong cùng transaction; guard và bootstrap kiểm fence. Migration phải pin/kiểm schema Supabase thực, không gọi mạng trong trigger. Bao phủ client gọi Auth trực tiếp theo [auth-provider-config §6](../09-technical/auth-provider-config.md).

5. Index `ai_jobs(status, queued_at)` cho hàng đợi

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T042-01` | Migration chạy trên DB sạch → exit 0 |
| `T042-02` | Hai hàng `ai_jobs` cùng `match_id` → **vi phạm PK** |
| `T042-03` | `attempts = 3` → **vi phạm CHECK** |
| `T042-04` | `status` lạ → **vi phạm CHECK** |
| `T042-05` | ⭐ Camera ở **tab A**, micro ở **tab B**, cùng user → **thành công** (độc lập) |
| `T042-06` | Hai tab cùng giữ `CAMERA` của một user → **vi phạm PK** |
| `T042-07` | `ownership_epoch` tăng khi chuyển nguồn |
| `T042-08` | Tra hàng đợi `QUEUED` dùng index — có `EXPLAIN` |
| `T042-09` | client_controls trạng thái/nguồn lạ, deadline sai, STOPPING thiếu operation bị CHECK; operation_id duplicate bị UNIQUE. |
| `T042-10` | app_sessions auth_session_id unique; mode/deadline/nullability bị CHECK; không client nào tự ghi deadline/revoked_at. |
| `T042-11` | Phiên remembered/temporary hợp lệ cùng user; query expiry/revoke dùng index, fixture không lưu token. |
| `T042-12` | Auth password đổi trực tiếp qua API thật: trigger fence app_sessions + ghi auth_security_jobs atomically, không lưu password/hash; trigger lỗi transaction phải thất bại, không đổi password mà thiếu fence. |
| `T042-13` | CURRENT snapshot đúng một phiên, PASSWORD_CHANGED luôn ALL; retry operation_id cùng payload không tạo job mới, payload khác hoặc UPDATE thay scope/target bị chặn. Restart dùng đúng snapshot, không thu hồi nhầm phiên độc lập. |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 13 test xanh trên PostgreSQL thật
- [ ] **`T042-05`** chứng minh camera và micro tách riêng (`SS-14`)
- [ ] `T042-06` chứng minh một thiết bị một tab
- [ ] `ai_jobs` PK là `match_id`

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-042.md`

## 9. ⚠ CẠM BẪY
Đừng dùng `client_controls` để khoá **lệnh đi cờ**. `DEC-020` đã bỏ khoá tab cho phần chơi cờ — máy chủ đã chống hai nước bằng **kiểm lượt + phiên bản + mã lệnh**. Dùng nhầm sẽ chặn oan tab hợp lệ.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Tạo app_sessions trước client_controls để FK hợp lệ. ai_jobs có một hàng mỗi Match. auth_security_jobs giữ snapshot UUID và trigger bất biến cho payload; không lưu token/password/hash mật khẩu. Trigger encrypted_password dùng SECURITY DEFINER, search_path rỗng, chỉ fence và enqueue cùng transaction, không gọi mạng. Kiểm schema/version Supabase thực trước khi áp trigger; không tương thích thì BLOCKED.

Các giao diện này phải được tạo khi thực thi; chưa có mã runtime hay bằng chứng PASS. Đọc AGENT-START-HERE và TEST-CONVENTIONS; mọi phụ thuộc phải đã merge.

### Fixture và ca kiểm có thể chạy

**File kiểm thử:** `tests/integration/issue-042.test.ts`. Tạo A và hai phiên Auth thật; seed remembered/temporary app_sessions với thời điểm sign-in từ provider qua role migration, không cấp app_server SELECT Auth. Hai nguồn camera/mic có owner riêng.

- T042-01…04/08: ai_jobs trùng Match bị PK; attempts=3/status lạ bị CHECK; truy vấn QUEUED có EXPLAIN index.
- T042-05…07/09: camera và mic khác owner được lưu; hai camera cùng user bị PK. Epoch cập nhật 0→1 được lưu; STOPPING thiếu operation hoặc deadline sai bị CHECK. CAS service thuộc 099.
- T042-10/11: auth_session_id unique; mode/deadline/nullability đúng; browser không tự sửa deadline/revoked_at. Hai mode hợp lệ cùng user, index expiry/revoke và không lưu token.
- T042-12: gọi Auth API đổi mật khẩu thật, cả hai app session bị fence và job ALL được ghi nguyên tử. Cố ý làm trigger lỗi trên DB test: API thất bại và mật khẩu không đổi, không có trạng thái đổi mật khẩu nhưng thiếu fence.
- T042-13: CURRENT có 0 hoặc 2 target bị chặn; PASSWORD_CHANGED+CURRENT bị chặn. Duplicate operation không tạo hàng mới; UPDATE payload bị chặn nhưng cập nhật status/lease/attempts được phép. Sau kết nối lại vẫn dùng đúng targets/cutoff cũ.

**Ca trọng yếu — nội dung để triển khai:**

```sql
-- T042-13: bind job UUID đã seed, thử đổi snapshot trong transaction riêng.
UPDATE public.auth_security_jobs SET scope='ALL', target_auth_session_ids=ARRAY[$2::uuid]
WHERE id=$1;
-- Driver phải nhận lỗi immutable-payload trigger, rollback và SELECT đúng snapshot trước đó.
SELECT operation_id,scope,target_auth_session_ids,revocation_cutoff,status
FROM public.auth_security_jobs WHERE id=$1;
-- Update status/lease/attempts hợp lệ vẫn được; không dùng cấm mọi UPDATE thay payload guard.
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Bỏ trigger fence hoặc cho UPDATE target snapshot; T042-12/13 đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:integration -- tests/integration/issue-042.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn gia oAuth version/schema/triggeratomicityproof, app_sessions và immutable job payload;050/052/099 triển khai các flow, không đòi họ trước migration.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
