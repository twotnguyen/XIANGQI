# ISSUE-037 — Migration: phòng · thành viên · danh sách chặn

**Nhóm:** E04 · **Phụ thuộc:** 035 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Bảng phòng, thành viên phòng, và **danh sách chặn** cho tính năng đuổi người xem (`R18`).

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-ROOM.md](../01-requirements/REQ-ROOM.md) §9 · [../01-requirements/REQ-SPECTATOR.md](../01-requirements/REQ-SPECTATOR.md) §11 · [../05-data-and-realtime/data-model.md](../05-data-and-realtime/data-model.md) §2.3–2.5

## 3. PHẠM VI
**✅ LÀM** — 5 bảng (`rooms`, `room_members`, `room_blocks`, `user_active_room`, `invitations`) + ràng buộc · **❌ KHÔNG LÀM** — đếm sức chứa bằng CHECK (phải làm trong transaction, issue 063)

## 4. FILE TẠO
`supabase/migrations/<timestamp>_rooms.sql`

## 5. CÁC BƯỚC
1. **`rooms`**: `id` · `name` · `owner_id` · `visibility` · `status` · `room_version` · `config_revision` · `time_control` · `current_match_id` (nullable, FK thêm sau ở 038) · `watch_epoch` · `finished_at` · `created_at`
   ```sql
   CHECK (char_length(name) BETWEEN 1 AND 60)
   CHECK (visibility IN ('PUBLIC','CODE_ONLY','LOCKED'))
   CHECK (status IN ('WAITING','PLAYING','FINISHED','CLOSED'))
   CHECK (time_control IN (0,300,600,900))
   CHECK (room_version >= 0)
   ```
2. **`room_members`**: `room_id` · `user_id` · `membership_id` UUID UNIQUE NOT NULL · `role` NOT NULL · `side` · `ready` boolean NOT NULL DEFAULT false · `ready_revision` bigint NOT NULL DEFAULT0 · `ready_config_revision` bigint nullable · `joined_at`
   ```sql
   PRIMARY KEY (room_id, user_id)
   CHECK (role IN ('PLAYER','SPECTATOR'))
   CHECK ((role = 'PLAYER' AND side IS NOT NULL AND side IN ('RED','BLACK'))
       OR (role = 'SPECTATOR' AND side IS NULL))
   ```
   **`UNIQUE (room_id, side) DEFERRABLE INITIALLY DEFERRED`** — hoãn kiểm để **đổi bên khi tái đấu** trong cùng transaction
3. **`room_blocks`** ⭐ mới: `room_id` · `user_id` · `blocked_by` · `blocked_at`
   ```sql
   PRIMARY KEY (room_id, user_id)
   ```
   Xoá khi phòng `CLOSED` (`BR-SPEC-12`)
4. **`user_active_room`**: `user_id` **PK** · `room_id` — ép **một tài khoản một phòng** (`SS-20`)
5. Index sảnh: `(created_at DESC, id DESC) WHERE visibility='PUBLIC' AND status IN ('WAITING','PLAYING')`
   ⚠ **Không** gồm `FINISHED` — theo `DEC-023`

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T037-01` | Migration chạy trên DB sạch → exit 0 |
| `T037-02` | Tên phòng 0 và 61 ký tự → **vi phạm CHECK** |
| `T037-03` | `time_control = 450` → **vi phạm CHECK** |
| `T037-04` | Thành viên `SPECTATOR` có `side` khác NULL → **vi phạm CHECK** |
| `T037-05` | Thành viên `PLAYER` có `side` NULL → **vi phạm CHECK** |
| `T037-06` | Hai `PLAYER` cùng `side` trong một phòng → **vi phạm UNIQUE** |
| `T037-07` | **Đổi bên hai người chơi trong MỘT transaction → THÀNH CÔNG** (nhờ `DEFERRABLE`) |
| `T037-08` | Một user vào 2 phòng → **vi phạm PK** của `user_active_room` |
| `T037-09` | Index sảnh **không** gồm phòng `FINISHED` — kiểm bằng `EXPLAIN` |
| `T037-10` | Chặn cùng user 2 lần trong 1 phòng → **vi phạm PK** |
| `T037-11` | ready=true mà ready_config_revision NULL bị CHECK từ chối; SPECTATOR ready=true bị từ chối; config_revision/ready_revision âm bị từ chối |
| `T037-12` | membership_id duy nhất, leave/rejoin sinh định danh mới; PLAYER side NULL bị chặn dù SQL CHECK dùng logic ba giá trị |
| `T037-13` | Storage invitations: 3 kind × 2 grant_role đúng nullability recipient/hash/epoch; hash trùng bị UNIQUE, không lưu plaintext |
| `T037-14` | DIRECT PENDING unique theo issuer/recipient/room/grant; revoke cho phép lời mời mới; query epoch chỉ chọn WATCH cũ, giữ PLAY |
| `T037-15` | expires_at > created_at; EXPLAIN index hộp thư và thu hồi; chưa dùng test schema thay bằng chứng API expiry/consume |

> **`T037-07` là test quan trọng nhất.** Không có `DEFERRABLE`, tái đấu đổi bên sẽ **luôn** vi phạm UNIQUE giữa chừng transaction.

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 15 test xanh trên PostgreSQL thật (T037-01…15)
- [ ] `T037-07` chứng minh đổi bên được trong một transaction
- [ ] `T037-09` chứng minh index sảnh theo `DEC-023`
- [ ] Bảng `room_blocks` tồn tại (`R18`)

### Contract bổ sung bắt buộc

Thêm cột/revision và CHECK đúng [ROOM-CHAT §1](../09-technical/room-chat-contract.md). `side IS NOT NULL` là bắt buộc với PLAYER; không dựa riêng vào `side IN` vì NULL làm CHECK UNKNOWN và lọt. config_revision/ready_revision NOT NULL, >=0. current_chat_context_id được thêm FK ở ISSUE-040.


### Storage lời mời phải có trước service join

Tạo `public.invitations` trong migration này để ISSUE-063 nhận người và ISSUE-066 thu hồi WATCH không phụ thuộc ngược vào ISSUE-068. Đây chỉ là storage; CSPRNG/HMAC và API phát hành do 068–070 triển khai.

| Cột | Kiểu / ràng buộc |
|---|---|
| id | uuid PK |
| room_id | uuid NOT NULL FK rooms |
| issuer_id | uuid NOT NULL FK profiles |
| recipient_id | uuid nullable FK profiles; DIRECT bắt buộc, CODE/LINK phải NULL |
| kind | text CHECK CODE/LINK/DIRECT |
| grant_role | text CHECK PLAY/WATCH |
| secret_hash | text nullable; DIRECT NULL, CODE/LINK NOT NULL; UNIQUE khi khác NULL; không cột mã/token gốc |
| status | text NOT NULL CHECK PENDING/CONSUMED/REJECTED/REVOKED/EXPIRED |
| watch_epoch | bigint nullable; WATCH bắt buộc >=0, PLAY phải NULL |
| created_at, expires_at | timestamptz NOT NULL, CHECK expires_at > created_at |
| consumed_at | timestamptz nullable; lưu mốc tiêu thụ do server ghi |

Index `(recipient_id,status,expires_at)` cho hộp thư; `(room_id,grant_role,watch_epoch,status)` cho thu hồi; partial UNIQUE `(issuer_id,recipient_id,room_id,grant_role) WHERE kind='DIRECT' AND status='PENDING'`. FK dùng RESTRICT, cleanup xóa grants theo vòng đời trước xóa dữ liệu tham chiếu. Status hết hạn được service cập nhật; mọi resolve vẫn phải kiểm `now < expires_at`, không dựa vào worker đã đổi status. PLAY và mọi DIRECT dùng một lần; CODE/LINK WATCH dùng nhiều lần, việc tiêu thụ được kiểm trong transaction ISSUE-063.

Thêm ca cùng `tests/integration/issue-037.test.ts`:

- `T037-13`: insert đủ 3 kind × 2 grant_role với nullability đúng; đảo recipient/hash/epoch ở từng kind → CHECK từ chối (`23514`). Hai hash giống → UNIQUE (`23505`); query row không có plaintext secret.
- `T037-14`: hai DIRECT PENDING cùng bộ khóa → `23505`; chuyển hàng cũ REVOKED rồi insert mới thành công; khác recipient hoặc grant_role được phép. Tạo 2 grants WATCH epoch 0/1 và PLAY epoch NULL, truy vấn thu hồi epoch 0 chỉ lấy đúng WATCH cũ; không đổi PLAY.
- `T037-15`: expires_at bằng/trước created_at → `23514`; đúng thời hạn dương được lưu. Kiểm catalog và EXPLAIN hai index bằng dữ liệu đủ lớn; chưa báo expiry API hay tiêu thụ đồng thời đạt trước ISSUE-063/068.

PASS bổ sung: ba ca trên xanh trên PostgreSQL thật, storage đã có trước 063/066; bỏ CHECK epoch hoặc unique DIRECT phải làm đúng test đỏ.

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-037.md` — kèm `EXPLAIN` truy vấn sảnh.

## 9. ⚠ CẠM BẪY
`UNIQUE (room_id, side)` **không** `DEFERRABLE` sẽ làm tái đấu đổi bên **không thể thực hiện** — vì giữa lúc `UPDATE` người thứ nhất, hai người tạm thời cùng `side`. Đây là lỗi thiết kế phát hiện rất muộn.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Tạo năm bảng và các CHECK ở §5 cùng storage invitations bổ sung. Ready/config/membership theo ROOM-CHAT §1; watch_epoch không âm. UNIQUE(room_id,side) phải DEFERRABLE INITIALLY DEFERRED, không thay bằng partial unique index. current_match_id có FK bổ sung tại 038; current_chat_context_id tại 040. Không dùng CHECK liên hàng để giả kiểm sức chứa; service 063 kiểm đếm trong transaction.

Các giao diện này phải được tạo khi thực thi; chưa có mã runtime hay bằng chứng PASS. Đọc AGENT-START-HERE và TEST-CONVENTIONS; mọi phụ thuộc phải đã merge.

### Fixture và ca kiểm có thể chạy

**File kiểm thử:** `tests/integration/issue-037.test.ts`. Seed A/B/S, hai phòng R1/R2. A cầm RED, B cầm BLACK, S là SPECTATOR có side=NULL; ready=false, revisions=0.

- T037-01…05: migration sạch; tên dài 0/61, time_control=450, SPECTATOR có side, PLAYER thiếu side đều bị CHECK 23514. Các biên tên 1/60 và bốn time control hợp lệ được nhận.
- T037-06/07: hai PLAYER cùng RED phải lỗi 23505 tại COMMIT. Trong transaction khác, UPDATE A sang BLACK rồi B sang RED phải commit thành công; mỗi bên đúng một người, membership IDs giữ nguyên.
- T037-08/10/12: user_active_room không cho A trỏ cả R1 và R2; room_blocks không trùng cặp. Leave/rejoin sinh membership ID mới; ID trùng bị UNIQUE chặn.
- T037-09: seed dữ liệu đủ lớn và ANALYZE. Truy vấn sảnh chỉ trả PUBLIC WAITING/PLAYING, không FINISHED/CLOSED, EXPLAIN dùng partial index.
- T037-11: ready=true nhưng ready_config_revision=NULL, SPECTATOR ready=true, revision âm, hoặc ready=false nhưng ready_config_revision khác NULL đều bị CHECK từ chối.
- T037-13…15: chạy toàn bộ ma trận storage invitations ở phần bổ sung trước mục BẰNG CHỨNG, gồm nullability theo kind/grant, hash và DIRECT unique, epoch và index hộp thư/thu hồi.

**Ca trọng yếu — nội dung để triển khai:**

```sql
-- T037-07: bind $1=room,$2=A,$3=B trên cùng pg.Client.
BEGIN;
UPDATE public.room_members SET side='BLACK' WHERE room_id=$1 AND user_id=$2;
UPDATE public.room_members SET side='RED' WHERE room_id=$1 AND user_id=$3;
SET CONSTRAINTS ALL IMMEDIATE;
COMMIT;
SELECT user_id,side FROM public.room_members WHERE room_id=$1 ORDER BY user_id;
-- Assert A BLACK/B RED, hai hàng PLAYER, không đổi membership_id/ready/revisions ngoài câu SQL.
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Bỏ DEFERRABLE thành unique immediate; T037-07 đỏ ở UPDATE đầu tiên; bỏ side IS NOT NULL thì T037-05 đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:integration -- tests/integration/issue-037.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao SQL constraint names và ready contract cho 064/065; đếm capacity và version increments là service proof sau.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
