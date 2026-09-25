# ISSUE-061 — Tạo phòng + chế độ riêng tư

**Nhóm:** E07 Phòng · **Phụ thuộc:** 055, 040 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Tạo phòng với tên, chế độ riêng tư và cấu hình thời gian — người tạo là **chủ phòng cầm quân đỏ**.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-ROOM.md](../01-requirements/REQ-ROOM.md) §5.1, §9 · [../02-flows/FLOW-CREATE-ROOM.md](../02-flows/FLOW-CREATE-ROOM.md) §1

## 3. PHẠM VI
**✅ LÀM** — `POST /rooms` · ràng buộc một-tài-khoản-một-phòng
**❌ KHÔNG LÀM** — sảnh (062) · vào ghế (063)

## 4. FILE TẠO
`apps/server/src/modules/rooms/rooms.service.ts` · `rooms.controller.ts`

## 5. CÁC BƯỚC
1. `POST /api/v1/rooms` nhận `{ name, visibility, timeControl }`
2. **Kiểm trước khi tạo — trong MỘT transaction**:
   ```
   ① đang ở phòng khác?        → ALREADY_IN_ROOM
   ② có ván với máy đang chạy? → CONFLICT
   ③ tạo phòng
   ④ thêm người tạo làm PLAYER, side = RED
   ⑤ ghi user_active_room
   ⑥ tạo chat_context generation0, current_chat_context_id và segment riêng solo Host + participant theo membership_id; cùng transaction
   ```
   ⚠ Bước ①–⑤ phải **cùng transaction** — nếu không, hai yêu cầu song song tạo được 2 phòng
3. Người tạo là **chủ phòng**, cầm **quân đỏ** (`BR-ROOM-02`)
4. Trạng thái ban đầu **đang chờ**, `room_version = 0`
5. Phòng **công khai** ⇒ tạo projection hậu commit cho sảnh; publisher socket thật tích hợp tại062 T062-08 sau084.
6. **Dùng SQL thuần** — đây là thao tác cần khoá và đếm (`TECH-07`)

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T061-01` | Tạo phòng hợp lệ → người tạo là **chủ phòng**, `side = RED` |
| `T061-02` | Trạng thái ban đầu **đang chờ** |
| `T061-03` | ⭐ Đang ở phòng khác → **`ALREADY_IN_ROOM`** |
| `T061-04` | ⭐ Có ván với máy → **từ chối** |
| `T061-05` | ⭐ **Một người gửi 2 yêu cầu tạo phòng ĐỒNG THỜI → ĐÚNG MỘT phòng** |
| `T061-06` | Tên 0 và 61 ký tự → **từ chối** |
| `T061-07` | `timeControl = 450` → **từ chối** |
| `T061-08` | Chế độ riêng tư lạ → **từ chối** |
| `T061-09` | Projection hậu commit của phòng PUBLIC đúng whitelist; rollback không phát. Socket sảnh thật kiểm T062-08. |
| `T061-10` | CODE_ONLY/LOCKED không tạo projection public; GET/socket thật kiểm T062-02/08. |
| `T061-11` | Chưa đăng nhập → `UNAUTHENTICATED` |
| `T061-12` | Lỗi giữa tạo context/solo segment và commit → rollback toàn bộ room/member/active pointer/context; không orphan. |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 12 test xanh trên PostgreSQL thật
- [ ] **`T061-05`** chạy với **rào đồng bộ**
- [ ] `T061-03` và `T061-04` chứng minh ràng buộc một-phòng
- [ ] `T061-10` không tạo projection công khai của phòng kín; T062-02/08 giữ cổng GET/socket thật
- [ ] `T061-12` chứng minh room/member/active pointer/context/solo segment cùng transaction
- [ ] Dùng **SQL thuần**, không Prisma

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-061.md`

## 9. ⚠ CẠM BẪY
Kiểm *"đang ở phòng khác"* **ngoài** transaction rồi mới tạo ⇒ hai yêu cầu song song **cùng thấy chưa ở phòng nào** và tạo 2 phòng. Ràng buộc PK trên `user_active_room` là chốt chặn cuối, nhưng phải nằm **trong cùng** transaction.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** POST /rooms strict {name, visibility, timeControl}; SQL transaction tạo rooms WAITING/version 0, Host PLAYER RED, membership UUID, user_active_room, chat_context generation 0 và solo Host private segment/participant. Post-commit projection sự kiện public cho 062; không socket trước 084.

**Tiền điều kiện cụ thể:** A verified chưa ở phòng/AI; timeControl∈0, 300, 600, 900; schema 040 và 044 có real context.

**File kiểm thử:** `tests/integration/issue-061.test.ts`. Giữ tên `T061-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T061-01` | A tạo PUBLIC/time 0; join DB room/member/active pointer, Host A/RED và context solo đúng membership. | Tạo phòng hợp lệ → người tạo là **chủ phòng**, `side = RED` |
| `T061-02` | Đọc rooms sau create; WAITING, version 0, current_match_id NULL, config_revision 0. | Trạng thái ban đầu **đang chờ** |
| `T061-03` | Seed user_active_room A ởR0; create R1 bị ALREADY_IN_ROOM, số room không tăng. | ⭐ Đang ở phòng khác → **`ALREADY_IN_ROOM`** |
| `T061-04` | Seed active_players A trong AI ACTIVE bằng 044; create từ chối, không room/context mới. | ⭐ Có ván với máy → **từ chối** |
| `T061-05` | Hai create cùng A, 2 connection/barrier, 20 lần; đúng 1 room/active pointer/context, loser không orphan. | ⭐ **Một người gửi 2 yêu cầu tạo phòng ĐỒNG THỜI → ĐÚNG MỘT phòng** |
| `T061-06` | Tên 0/1/60/61; chỉ 1/60 thành công; invalid không room. | Tên 0 và 61 ký tự → **từ chối** |
| `T061-07` | Time 450 bị 400; 0/300/600/900 đều nhận. | `timeControl = 450` → **từ chối** |
| `T061-08` | Visibility UNKNOWN và payload ownerId; strict từ chối trước INSERT. | Chế độ riêng tư lạ → **từ chối** |
| `T061-09` | Create PUBLIC; sau commit projection có đúng fields public để 062 phát; rollback không projection, socket thựcT062-08. | Projection hậu commit của phòng PUBLIC đúng whitelist; rollback không phát. Socket sảnh thật kiểm T062-08. |
| `T061-10` | Create CODE_ONLY/LOCKED; projection không có dữ liệu public; full socket T062-02/08. | CODE_ONLY/LOCKED không tạo projection public; GET/socket thật kiểm T062-02/08. |
| `T061-11` | Không JWT create; 401, không room/member/context. | Chưa đăng nhập → `UNAUTHENTICATED` |
| `T061-12` | Gây lỗi có kiểm soát sau INSERT context và trước participant; dùng connection mới kiểm room/member/active pointer/context/segment đều rollback, không orphan. | Lỗi giữa tạo context/solo segment và commit → rollback toàn bộ room/member/active pointer/context; không orphan. |

Thêm T061-12: chèn lỗi có kiểm soát sau tạo context/trước participant; rollback phải để 0 room, 0 member, 0 active pointer, 0 context/segment orphan. Đây là schema contract 040/ROOM-CHAT§4, không đợi chat 108 mới tạo context.

### 10.3 Điểm triển khai cần giữ đúng

```sql
-- $1 = room UUID vừa tạo; chạy sau COMMIT để chứng minh initial context.
SELECT c.generation, c.match_id, p.user_id, p.membership_id
FROM rooms r JOIN chat_contexts c ON c.id=r.current_chat_context_id
JOIN chat_private_segments s ON s.context_id=c.id AND s.closed_at IS NULL
JOIN chat_private_participants p ON p.segment_id=s.id
WHERE r.id=$1;
-- Đúng 1 dòng: generation=0, match_id=NULL, participant=Host/membership hiện hành.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **tách user_active_room/context ra transaction khác để tạo orphan room**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-061.md`.

```bash
pnpm test:integration -- tests/integration/issue-061.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

**Đóng issue:** mọi test trong ma trận và mọi ô PASS phía trên đạt; không `.only`/`.skip`, không thiếu lane. Các gate tích hợp tương lai được nêu đích danh trong issue phải có chủ sở hữu/bằng chứng riêng, không ghi chúng PASS bằng spy/fixture. Chỉ đổi `TODO` sang `DONE` sau PR đã merge theo WORKFLOW.

**BLOCKED và bàn giao:** thiếu capability dependency hoặc invariant trong 10.1 chưa kiểm được ⇒ `BLOCKED`, ghi đúng test/đầu vào/response sai và commit liên quan. PostgreSQL/socket/browser cần cho ma trận không chạy được ⇒ test phải đỏ; không bỏ qua hoặc thay bằng dữ liệu tự dựng để báo đạt. Bàn giao đường dẫn file thực đã sửa, exported interface/DTO, migrations nếu có, các test ID đạt/chưa đạt, bằng chứng fault injection, và tên issue kế tiếp sử dụng hợp đồng ở 10.1; không bàn giao chỉ một câu “đã xong”.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-ROOM-01` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
