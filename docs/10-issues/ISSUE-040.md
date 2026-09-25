# ISSUE-040 — Migration: vòng chat, nhóm người đọc và tin nhắn

**Nhóm:** E04 · **Phụ thuộc:** 038 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Chat ngay WAITING, giữ tin có quyền qua ván đầu, không rò tin A–B cho C, tái đấu hai kênh mới trống (DEC-028/029/044).

## 2. ĐỌC TRƯỚC
[REQ-CHAT](../01-requirements/REQ-CHAT.md) §11 · [ROOM-CHAT](../09-technical/room-chat-contract.md) §4–5 **toàn bộ** · [data-model](../05-data-and-realtime/data-model.md) §2.12.

## 3. PHẠM VI
Tạo chat_contexts, chat_private_segments, chat_private_participants, chat_messages; rooms.current_chat_context_id; CHECK/FK/unique/index/constraint triggers; RLS deny-all browser theo ISSUE-043. Service ở 108/109; không tạo Match sớm để lưu chat.

## 4. FILE TẠO
`supabase/migrations/<timestamp>_chat.sql`

## 5. CÁC BƯỚC
Thực hiện chính xác schema tại ROOM-CHAT §4: context_id luôn NOT NULL, match_id nullable chỉ tại context; participant snapshot user+membership bất biến; unique(context_id,sender_id,client_message_id) không dựa NULL match; sequence tăng + cursor; FK cùng room/match/context/segment; sender flag từ server, không từ client. Schema hỗ trợ Host nhắn một mình, đóng/mở segment khi thay người, initial match giữ context, rematch seal/tạo context. RLS bật cho cả bốn bảng, browser anon/authenticated deny toàn bộ; backend kiểm predicates §5. Retention 30 ngày, không cascade xoá tin khi leave; cleanup triển khai tại ISSUE-110.

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T040-01` | Migration DB sạch thành công trên PostgreSQL thật |
| `T040-02` | Channel SPECTATORS bị CHECK từ chối; PLAYERS/ROOM đúng constraint chấp nhận |
| `T040-03` | Context chưa Match lưu tin được; chỉ một context unsealed/phòng |
| `T040-04` | Content 0/1001 code point bị từ chối; 1/1000 và Unicode nguyên vẹn |
| `T040-05` | Cùng context/sender/client_message_id bị UNIQUE chặn dù chưa Match |
| `T040-06` | Gắn Match đầu vào context không tạo bản tin mới/không làm mất unique; context rematch khác cho phép dùng lại id |
| `T040-07` | PLAYERS thiếu segment/khác context/sender ngoài participant bị từ chối; ROOM có segment bị từ chối |
| `T040-08` | EXPLAIN phân trang 50 tin theo context/channel/sequence và participant filter dùng index |
| `T040-09` | FK/trigger chặn context gắn Match phòng khác; rooms.current_chat_context_id khác phòng bị từ chối |
| `T040-10` | Participant snapshot không đổi sau có tin, tối đa hai; leave không cascade mất tin; segment mới không cấp quyền tin cũ |
| `T040-11` | Raw anon/authenticated không SELECT/INSERT/UPDATE/DELETE được cả bốn bảng; backend đọc theo predicate riêng kiểm ở 108 |
| `T040-12` | Hai sequence trùng trong cùng context bị UNIQUE; sequence không dương và revision âm bị CHECK |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 12 test xanh PostgreSQL thật, skip=0; mutation loại unique/participant guard/deny RLS làm test mục tiêu đỏ.
- [ ] Có EXPLAIN, FK/CHECK/trigger definitions và không chứa nullable match_id trong khoá idempotency.
- [ ] Không báo quyền API đạt trước ISSUE-108/109; đây là bằng chứng schema.

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-040.md`

## 9. ⚠ CẠM BẪY
Chỉ thêm nullable match_id không giải quyết unique khi NULL, tin cặp cũ hay start nhân tin. Client PLAYER hiện tại không đủ để đọc mọi tin PLAYERS. Không mở direct browser SELECT vì đã có backend guard.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Tạo bốn bảng, CHECK/FK/unique/trigger đúng ROOM-CHAT §4. Bật RLS deny browser ngay trong migration này, không chờ 043. rooms.current_chat_context_id có kiểm cùng phòng và context chưa seal; context/Match có composite FK. Participant tối đa hai, bất biến sau khi có tin; sender thuộc đúng segment. Dùng credentials Auth local thật của 034 để kiểm raw-role CRUD; service read/send thuộc 108/109.

Các giao diện này phải được tạo khi thực thi; chưa có mã runtime hay bằng chứng PASS. Đọc AGENT-START-HERE và TEST-CONVENTIONS; mọi phụ thuộc phải đã merge.

### Fixture và ca kiểm có thể chạy

**File kiểm thử:** `tests/integration/issue-040.test.ts`. Seed R1/R2, A/B/C/S, context K1 chưa Match, các segment A, A–B, A–C với membership ID đúng. Tạo ít nhất 51 tin có sequence biết trước.

- T040-01…03: migration sạch; channel SPECTATORS bị CHECK; tin WAITING không cần Match; hai context unsealed cùng phòng bị UNIQUE.
- T040-04…06: emoji 1000 code point được lưu, 1001 bị từ chối; cùng context/sender/client ID bị UNIQUE dù Match NULL. Gắn Match đầu không đổi ID/số tin; context tái đấu khác cho phép dùng lại client ID.
- T040-07/09: PLAYERS thiếu segment, sai context hoặc sender ngoài participant bị từ chối; ROOM có segment bị từ chối. Context/Match/current context khác phòng bị chặn tại commit.
- T040-08: phân trang sequence 51→2 rồi trang kế; không trùng/mất tin. EXPLAIN phải lọc participant trước LIMIT 50 và dùng index phù hợp.
- T040-10: segment A đã có tin không được thêm B; A–B còn sau leave; C không nhận participant ở A–B; participant thứ ba bị chặn.
- T040-11/12: anon và authenticated raw CRUD không đọc/ghi được bốn bảng, dữ liệu giữ nguyên. Sequence 0/trùng và revision âm bị constraint chặn.

**Ca trọng yếu — nội dung để triển khai:**

```sql
-- T040-04: kiểm Unicode ở chính PostgreSQL, không UTF-16 length.
SELECT char_length(repeat('😀',1000)) AS code_points,
       octet_length(repeat('😀',1000)) AS bytes;
-- Assert code_points=1000, bytes=4000; sau đó INSERT thực 1000/1001 vào chat_messages.
SELECT relname,relrowsecurity FROM pg_class
WHERE oid IN ('public.chat_contexts'::regclass,'public.chat_private_segments'::regclass,
 'public.chat_private_participants'::regclass,'public.chat_messages'::regclass);
-- Assert 4 rows all true; phải chạy raw-role CRUD riêng, chỉ catalog chưa đủ RLS proof.
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Bỏ unique context/sender/client hoặc participant guard/deny RLS; T040-05/10/11 đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:integration -- tests/integration/issue-040.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giaoDDL/triggers/indexplans+SQLSTATE;108/109 ownedAPI quyền/races, không dùng guard tương lai để chứng minh schema.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
