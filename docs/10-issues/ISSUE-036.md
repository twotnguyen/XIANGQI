# ISSUE-036 — Migration: bạn bè

**Nhóm:** E04 · **Phụ thuộc:** 035 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Bảng quan hệ bạn bè — **một cặp người dùng chỉ có đúng một hàng**, không phân biệt ai gửi trước.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-PROFILE-FRIENDS.md](../01-requirements/REQ-PROFILE-FRIENDS.md) §9 `BR-FRD-01..03`

## 3. PHẠM VI
**✅ LÀM** — bảng `friendships` + ràng buộc chống trùng
**❌ KHÔNG LÀM** — logic nghiệp vụ (058)

## 4. FILE TẠO
`supabase/migrations/<timestamp>_friendships.sql`

## 5. CÁC BƯỚC
1. Bảng `public.friendships`:
   | Cột | Kiểu | Ghi chú |
   |---|---|---|
   | `id` | uuid | PK |
   | `user_a` | uuid | FK profiles, **luôn là id NHỎ HƠN** |
   | `user_b` | uuid | FK profiles, **luôn là id LỚN HƠN** |
   | `requested_by` | uuid | FK profiles — ai gửi lời mời |
   | `status` | text | `PENDING` hoặc `ACCEPTED` |
   | `created_at` | timestamptz | |
2. **Mẹo chống trùng — quan trọng nhất của issue này**:
   ```sql
   CHECK (user_a < user_b)                    -- ép thứ tự
   UNIQUE (user_a, user_b)                    -- một cặp = một hàng
   CHECK (user_a <> user_b)                   -- không tự kết bạn
   CHECK (requested_by IN (user_a, user_b))   -- người gửi phải thuộc cặp
   CHECK (status IN ('PENDING','ACCEPTED'))
   ```
   Luôn **sắp xếp** hai id trước khi insert ⇒ A gửi cho B và B gửi cho A đều ra **cùng một hàng**
3. Index `(user_a, status)` và `(user_b, status)` để tra danh sách bạn nhanh

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T036-01` | Migration chạy trên DB sạch → exit 0 |
| `T036-02` | Insert `(A,B)` rồi insert `(B,A)` (đã sắp xếp) → **vi phạm UNIQUE** |
| `T036-03` | Insert với `user_a > user_b` → **vi phạm CHECK** |
| `T036-04` | `user_a = user_b` → **vi phạm CHECK** |
| `T036-05` | `requested_by` không thuộc cặp → **vi phạm CHECK** |
| `T036-06` | `status` lạ → **vi phạm CHECK** |
| `T036-07` | Xoá profile → hàng bạn bè xử lý đúng theo FK đã khai |
| `T036-08` | Tra danh sách bạn của một người → dùng index, có `EXPLAIN` trong báo cáo |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 8 test xanh trên PostgreSQL thật
- [ ] `T036-02` chứng minh **một cặp = một hàng**
- [ ] Đủ 4 ràng buộc `CHECK` và 1 `UNIQUE`
- [ ] Báo cáo có `EXPLAIN` cho truy vấn danh sách bạn

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-036.md`

## 9. ⚠ CẠM BẪY
Không có `CHECK (user_a < user_b)` thì A→B và B→A tạo **hai hàng** ⇒ hiện hai lời mời cho cùng một cặp, và `BR-FRD-01` bị vi phạm. Đây là lỗi thiết kế dữ liệu rất khó sửa về sau.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Tạo friendships, CHECK và UNIQUE đúng §5. Các FK tới profiles dùng ON DELETE RESTRICT vì chưa có chức năng xóa tài khoản; cleanup test xóa friendships trước profiles. Đặt tên index ổn định cho `(user_a,status)` và `(user_b,status)`. Service 058 chịu trách nhiệm chuẩn hóa cặp và xử lý lệnh; migration chứng minh constraint thật.

Các giao diện này phải được tạo khi thực thi; chưa có mã runtime hay bằng chứng PASS. Đọc AGENT-START-HERE và TEST-CONVENTIONS; mọi phụ thuộc phải đã merge.

### Fixture và ca kiểm có thể chạy

**File kiểm thử:** `tests/integration/issue-036.test.ts`. Seed ba user A/B/C, sắp UUID để A<B. Mỗi ca dùng transaction riêng.

- T036-01…03: áp migration sạch; insert (A,B), sau đó cặp đảo đã chuẩn hóa vẫn (A,B) bị UNIQUE 23505; insert trực tiếp (B,A) bị CHECK 23514.
- T036-04…06: tự kết bạn A/A, requested_by=C và status lạ bị CHECK; PENDING/ACCEPTED hợp lệ.
- T036-07: xóa profile còn được tham chiếu bị FK RESTRICT; hàng bạn bè không mất. Cleanup xóa quan hệ trước profile.
- T036-08: seed 10.000 quan hệ thuộc runId, ANALYZE; truy vấn chọn một user có ít quan hệ phải có kết quả đúng và EXPLAIN dùng index tương ứng user_a/user_b. Không ép tắt sequential scan để làm đẹp bằng chứng.

**Ca trọng yếu — nội dung để triển khai:**

```sql
-- Với :a/:b là UUID fixture đã seed, :relation UUID mới; bind qua pg, không nội suy chuỗi.
INSERT INTO public.friendships(id,user_a,user_b,requested_by,status)
VALUES ($1,$2,$3,$2,'PENDING');
-- T036-02: lệnh thứ hai cùng pair, id khác phải 23505.
INSERT INTO public.friendships(id,user_a,user_b,requested_by,status)
VALUES ($4,$2,$3,$3,'PENDING');
-- Driver rollback savepoint sau expected error và assert COUNT(pair)=1.
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Bỏ UNIQUE pair hay CHECK order; T036-02/03 đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:integration -- tests/integration/issue-036.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giaoindexplans/FK policy;058 ownsnormalizepairs và con current commands, không coi migration đã chứng minh endpoint.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
