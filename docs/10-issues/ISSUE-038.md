# ISSUE-038 — Migration: ván · cây nước đi · sự kiện

**Nhóm:** E04 · **Phụ thuộc:** 037 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Bảng ván cờ và **cây nước đi** — mô hình phải cho phép **nhiều nhánh từ cùng một điểm** sau khi đi lại.

## 2. ĐỌC TRƯỚC
[../05-data-and-realtime/data-model.md](../05-data-and-realtime/data-model.md) **§2.7–2.8** · [../01-requirements/REQ-MATCH.md](../01-requirements/REQ-MATCH.md) §9 `BR-MAT-09`

## 3. PHẠM VI
**✅ LÀM** — `matches` · `match_moves` · `match_events` · `active_players`
**❌ KHÔNG LÀM** — logic đi nước (087)

## 4. FILE TẠO
`supabase/migrations/<timestamp>_matches.sql`

## 5. CÁC BƯỚC
1. **`matches`**: `id` · `room_id` (**nullable** — ván với máy không có phòng) · `mode` · `status` · `red_user_id` · `black_user_id` · `ai_side` · `ai_level` · `time_control` · `red_ms` · `black_ms` · `running_since` · `version` · `ply` · `outcome_winner` · `outcome_reason` · `started_at` · `ended_at`
   ```sql
   CHECK (mode IN ('ONLINE','AI'))
   CHECK (status IN ('ACTIVE','FINISHED','INTERRUPTED'))
   CHECK (version >= 0)
   CHECK (ply >= 0)
   CHECK (outcome_reason IS NULL OR outcome_reason IN (
     'CHECKMATE','STALEMATE','REPETITION','AGREED_DRAW','RESIGN','TIMEOUT',
     'INACTIVITY','DISCONNECT','BOTH_OFFLINE','SERVER_RESTART','AI_UNAVAILABLE'))
   CHECK ((mode='ONLINE' AND room_id IS NOT NULL) OR (mode='AI' AND room_id IS NULL))
   ```
   ⚠ **`INACTIVITY` phải có trong danh sách** (`DEC-016`)
2. **`match_moves` — CÂY, không phải danh sách**:
   | Cột | Ghi chú |
   |---|---|
   | `id` | uuid PK — đây là `moveId` |
   | `match_id` | FK matches |
   | `parent_move_id` | **nullable**, FK `match_moves(id)` — NULL nghĩa là nước đầu |
   | `side` · `from_x` · `from_y` · `to_x` · `to_y` | |
   | `created_at` | |

   > ⛔ **TUYỆT ĐỐI KHÔNG** đặt `UNIQUE (match_id, ply)`. Sau khi đi lại, **nhiều nước khác nhau** cùng có chung `parent_move_id` — đó là điều **bình thường và bắt buộc**.

3. **`match_events`**: `id` · `match_id` · `version` · `type` · `payload` (jsonb) · `created_at`
   ```sql
   UNIQUE (match_id, version)      -- mỗi phiên bản đúng MỘT sự kiện
   CHECK (type IN ('START','MOVE','UNDO','PROPOSAL_CREATED','PROPOSAL_RESOLVED','RESULT'))
   ```
4. **`active_players`**: `user_id` **PK** · `match_id` — ép một người chỉ ở một ván đang chạy
5. Thêm FK `rooms.current_match_id → matches(id)` ở **cuối** migration (vòng tròn)
6. Index: `match_moves(match_id, parent_move_id)` · `match_events(match_id, version)`

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T038-01` | Migration chạy trên DB sạch → exit 0 |
| `T038-02` | **`INACTIVITY` là `outcome_reason` hợp lệ** |
| `T038-03` | Ván `AI` có `room_id` khác NULL → **vi phạm CHECK** |
| `T038-04` | Ván `ONLINE` có `room_id` NULL → **vi phạm CHECK** |
| `T038-05` | ⭐ **Hai nước khác nhau cùng `parent_move_id` → THÀNH CÔNG** |
| `T038-06` | Hai sự kiện cùng `(match_id, version)` → **vi phạm UNIQUE** |
| `T038-07` | Một user trong 2 ván đang chạy → **vi phạm PK** `active_players` |
| `T038-08` | Chuỗi nước đi dài 20 nước, truy ngược từ lá về gốc bằng `parent_move_id` → đúng 20 |
| `T038-09` | `outcome_reason` lạ → **vi phạm CHECK** |

> **`T038-05` là test quan trọng nhất của toàn bộ E04.**

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 9 test xanh trên PostgreSQL thật
- [ ] **`T038-05` xanh** — nhiều nhánh từ cùng một nước cha
- [ ] **Không có** ràng buộc UNIQUE nào trên `(match_id, ply)`
- [ ] `INACTIVITY` nằm trong danh sách nguyên nhân
- [ ] Đủ 11 nguyên nhân kết thúc

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-038.md` — kèm sơ đồ cây nước đi có nhánh.

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| **Đi nước mới sau khi đi lại LUÔN gây lỗi trùng khoá → lỗi 500** (`F-01`) | `T038-05` — mô hình **cây**, không có UNIQUE trên ply |
| Bảng nước đi bị đổi tên và mất `parent_move_id` (`F-18`) | Bước 2 — `parent_move_id` là **bắt buộc** |

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Ngoài §5, thêm `position jsonb NOT NULL`, `active_move_ids uuid[] NOT NULL DEFAULT ARRAY[]::uuid[]`, `rule_set_version text NOT NULL` để lưu thế hiện tại và nhánh hiệu lực theo DM §2.7. Serializer/service kiểm Position đủ 90 ô; migration không gọi bộ luật. match_moves kiểm x=0..8/y=0..9, parent thuộc cùng Match bằng composite FK, parent NULL là gốc. Event payload không chứa token.

Các giao diện này phải được tạo khi thực thi; chưa có mã runtime hay bằng chứng PASS. Đọc AGENT-START-HERE và TEST-CONVENTIONS; mọi phụ thuộc phải đã merge.

### Fixture và ca kiểm có thể chạy

**File kiểm thử:** `tests/integration/issue-038.test.ts`. Seed phòng R và A/B; M1 ONLINE, M2 AI không có phòng. Tạo cây có hai node con cùng parent và một nhánh dài đúng 20 node với danh sách UUID biết trước.

- T038-01…04/09: migration sạch; INACTIVITY hợp lệ; AI có room, ONLINE thiếu room và reason lạ bị CHECK 23514.
- T038-05: insert hai sibling cùng parent thành công, đọc được đủ hai ID; catalog không có UNIQUE(match_id,ply).
- T038-06/07: sự kiện trùng match/version và active_players trùng user bị UNIQUE 23505, số hàng không đổi sau rollback.
- T038-08: recursive CTE từ leaf lên root trả đúng 20 ID theo thứ tự; parent thuộc Match khác phải bị FK chặn.
- Round trip position/active_move_ids/rule_set_version giữ dữ liệu. Kiểm schema không thay thế validateMove ở service.

**Ca trọng yếu — nội dung để triển khai:**

```sql
-- T038-08 bind $1 là leaf UUID của chuỗi 20 node cùng match.
WITH RECURSIVE branch AS (
  SELECT id,parent_move_id,0 AS depth FROM public.match_moves WHERE id=$1
  UNION ALL
  SELECT m.id,m.parent_move_id,b.depth+1
  FROM public.match_moves m JOIN branch b ON m.id=b.parent_move_id
)
SELECT id,parent_move_id,depth FROM branch ORDER BY depth DESC;
-- Driver assert 20 UUID fixture theo thứ tự root→leaf; không lấy COUNT toàn match làm oracle.
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Đặt unique parent hoặc unique(match, ply); T038-05 đỏ; parent FK không gắn match làm crossmatch test đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:integration -- tests/integration/issue-038.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao cây và nơi lưu position/active branch/ruleset cho 087/106; không tự thêm bảng sao chép lịch sử tuyến tính. TheoDM cột position/active branch là khả năng bắt buộc cần cho successors.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
