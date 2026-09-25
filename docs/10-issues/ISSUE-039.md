# ISSUE-039 — Migration: biên lai lệnh · đề nghị

**Nhóm:** E04 · **Phụ thuộc:** 038 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Bảng chống gửi trùng lệnh, và bảng đề nghị hoà / đi lại.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-MATCH.md](../01-requirements/REQ-MATCH.md) §9 `BR-MAT-06/07` · [../01-requirements/REQ-GAME-ACTIONS.md](../01-requirements/REQ-GAME-ACTIONS.md) §10 `BR-ACT-04`

## 3. PHẠM VI
**✅ LÀM** — `command_receipts` · `match_proposals` · `room_rematch_votes`
**❌ KHÔNG LÀM** — logic (086, 105, 127)

## 4. FILE TẠO
`supabase/migrations/<timestamp>_commands.sql`

## 5. CÁC BƯỚC
1. **`command_receipts`**:
   | Cột | Ghi chú |
   |---|---|
   | `match_id` · `actor_id` · `command_id` | **PK tổ hợp** |
   | `command_type` | `MOVE` · `RESIGN` · `PROPOSE` · `RESPOND` · `UNDO_AI` · `CONFIRM_ALIVE` |
   | `payload_hash` | text — **dấu vân tay** nội dung chuẩn hoá |
   | `applied_version` | int — phiên bản lúc áp dụng |
   | `created_at` | |

   **Quy tắc dùng:** cùng `(match_id, actor_id, command_id)` **và** cùng `payload_hash` ⇒ trả kết quả cũ. **Khác `payload_hash`** ⇒ trả lỗi `COMMAND_ID_REUSED`.

   ⚠ `payload_hash` **phải gồm cả `command_type`** — nếu không, `RESIGN` với payload `{}` sẽ trùng `UNDO_AI` với payload `{}`.

2. **`match_proposals`**: `id` · `match_id` · `kind` (`DRAW`/`UNDO`) · `requester_id` · `base_ply` · `created_version` · `expires_at` · `status` (`PENDING`/`ACCEPTED`/`REJECTED`/`EXPIRED`)
   ```sql
   -- TỐI ĐA MỘT đề nghị đang chờ mỗi ván:
   CREATE UNIQUE INDEX ON match_proposals (match_id) WHERE status = 'PENDING';
   ```
3. **`room_rematch_votes`**: `room_id` · `match_id` · `user_id` (**PK tổ hợp**) · `accepted` · `created_at`
4. **`room_command_receipts`**: giống `command_receipts` nhưng khoá theo `(room_id, actor_id, command_id)` — dùng READY/CONFIG/SIDE_SWAP_REQUEST/SIDE_SWAP_RESPOND/SIDE_SWAP_CANCEL/REMATCH; gồm result JSON và room_version, lưu tới CLOSED

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T039-01` | Migration chạy trên DB sạch → exit 0 |
| `T039-02` | Insert trùng `(match_id, actor_id, command_id)` → **vi phạm PK** |
| `T039-03` | Cùng `command_id`, khác ván → **được phép** |
| `T039-04` | ⭐ `payload_hash` của `RESIGN {}` **KHÁC** `payload_hash` của `UNDO_AI {}` |
| `T039-05` | Hai đề nghị `PENDING` cùng ván → **vi phạm UNIQUE INDEX** |
| `T039-06` | Một `PENDING` + nhiều `EXPIRED` cùng ván → **được phép** |
| `T039-07` | `kind` hoặc `status` lạ → **vi phạm CHECK** |
| `T039-08` | Hai phiếu tái đấu cùng user cùng ván → **vi phạm PK** |
| `T039-09` | Mỗi phòng tối đa một đề nghị đổi bên PENDING; requester/responder memberships khác nhau; trạng thái lạ bị CHECK chặn |
| `T039-10` | Biên lai phòng cùng mã khác command_type có hash khác; lưu được kết quả để trả retry |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 10 test xanh trên PostgreSQL thật
- [ ] **`T039-04`** chứng minh `payload_hash` gồm `command_type`
- [ ] `T039-05` chứng minh **tối đa một** đề nghị chờ
- [ ] `T039-06` chứng minh đề nghị cũ không cản đề nghị mới

### Contract bổ sung bắt buộc

Tạo `room_side_swap_proposals` với schema, CHECK, partial UNIQUE và membership snapshots theo [ROOM-CHAT §1](../09-technical/room-chat-contract.md); lưu bằng chứng sau khi membership rời, không cascade xoá. Room command receipt không chỉ dành tái đấu.

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-039.md`

## 9. ⚠ CẠM BẪY
Nếu `payload_hash` **không** gồm `command_type`, người chơi gửi `RESIGN` rồi gửi `UNDO_AI` với cùng `command_id` sẽ nhận lại **kết quả của lệnh đầu** — tức là **đầu hàng nhầm**. `T039-04` bắt đúng lỗi này.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Ngoài SQL §5, tạo `apps/server/src/lib/command-hash.ts`, export `hashCommand(commandType:string,payload:unknown):string`. SHA-256 tính trên canonical JSON của `{commandType,payload}`: sắp key object đệ quy, giữ thứ tự array, từ chối undefined và số không hữu hạn. ISSUE-086 phải dùng lại helper. Receipt có result JSON để trả retry; partial unique PENDING áp cho cả Match proposal và Room side-swap proposal. Snapshot membership không bị xóa khi leave.

Các giao diện này phải được tạo khi thực thi; chưa có mã runtime hay bằng chứng PASS. Đọc AGENT-START-HERE và TEST-CONVENTIONS; mọi phụ thuộc phải đã merge.

### Fixture và ca kiểm có thể chạy

**File kiểm thử:** `tests/integration/issue-039.test.ts` và `tests/unit/issue-039.test.ts` cho hash. Seed M1/M2, phòng R, actor A/B, command UUID C.

- T039-01…03: trùng (M1,A,C) bị PK 23505; khác Match hoặc actor được phép.
- T039-04/10: hash RESIGN{} khác UNDO_AI{}; đổi thứ tự key của cùng payload không đổi hash. Lưu result JSON rồi đọc lại đúng nội dung.
- T039-05/06: hai proposal PENDING cùng Match bị UNIQUE; một PENDING và hai EXPIRED được phép.
- T039-07/08: kind/status lạ bị CHECK; vote tái đấu trùng room/match/user bị PK.
- T039-09: một side swap PENDING/phòng; requester=responder bị CHECK. Xóa membership không xóa snapshot proposal; proposal cũ EXPIRED cho phép đề nghị mới.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { hashCommand } from '../../apps/server/src/lib/command-hash';
test('T039-04 hash phân biệt loại và chuẩn hóa key', () => {
  expect(hashCommand('RESIGN',{})).not.toBe(hashCommand('UNDO_AI',{}));
  expect(hashCommand('MOVE',{a:1,b:2})).toBe(hashCommand('MOVE',{b:2,a:1}));
});
```
Đặt ca pure này ở `tests/unit/issue-039.test.ts`; các constraint vẫn chạy file integration chính, không thay DB bằng unit.

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Hash bỏ commandType; T039-04 đỏ; index unique không partial khiến T039-06 đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-039.test.ts
pnpm test:integration -- tests/integration/issue-039.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao helper/schema result và immutable membership snapshots;086/064 phải dùng cùng hash, không coi SQL duplicate là đã xử lý retry API.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
