# ISSUE-066 — Đổi cài đặt + thu hồi người xem

**Nhóm:** E07 · **Phụ thuộc:** 065, 039, 062 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Chủ phòng đổi tên, chế độ riêng tư, cấu hình thời gian — và đổi sang chế độ kín hơn ⇒ **đuổi toàn bộ người xem**.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-ROOM.md](../01-requirements/REQ-ROOM.md) §5.4, §9 `BR-ROOM-16/22`, §15 `AC-ROOM-22/23` · [../01-requirements/REQ-SPECTATOR.md](../01-requirements/REQ-SPECTATOR.md) §10

## 3. PHẠM VI
**✅ LÀM** — `PATCH /rooms/:id` · primitive thu hồi quyền/DB + job bền vững. PostgreSQL thật, membership/grant/media policy fixture thật; chưa chứng nhận delivery chat hay SFU khi các transport chưa được tạo.
**❌ KHÔNG LÀM** — đuổi một người (076)

## 4. FILE TẠO
`apps/server/src/modules/rooms/settings.service.ts`

## 5. CÁC BƯỚC
1. `PATCH /api/v1/rooms/:id` nhận strict `{ commandId, expectedConfigRevision, name?, visibility?, timeControl? }` (ít nhất một trường đổi, theo ROOM-CHAT §1) — **chỉ chủ phòng**
2. **Quy tắc theo trường**:
   | Trường | Khi nào đổi được |
   |---|---|
   | `name` | mọi lúc |
   | `visibility` | mọi lúc |
   | `timeControl` | **chỉ khi ĐANG CHỜ**; đổi thành công xoá ready cả hai (DEC-036). Khoá cứng khi ván bắt đầu |

   Với thay đổi `timeControl`: khoá phòng, kiểm Host + WAITING, ghi cấu hình và xoá ready cả hai **trong cùng transaction**, tăng config_revision và room_version, tăng ready_revision cả hai; sau commit gửi trạng thái mới cho cả phòng. Dùng SQL thuần theo TECH-07. Tuân thứ tự khoá phòng → người → ván khi cần khoá thêm. Phối hợp ready/start của ISSUE-064: xác nhận cấu hình cũ không được dùng cho cấu hình mới; start trước thì từ chối đổi.
3. **Đổi sang kín hơn** (PUBLIC→CODE_ONLY, PUBLIC→LOCKED, CODE_ONLY→LOCKED) ⇒ **trong cùng transaction**:
   ```
   ① khoá phòng
   ② tăng watch_epoch
   ③ XOÁ TOÀN BỘ thành viên vai trò SPECTATOR và user_active_room tương ứng
   ④ revoke mọi lời mời/mã/link WATCH cũ; PLAY giữ nguyên
   ⑤ đánh dấu media của họ cần thu hồi
   ⑥ tăng room_version
   ⑦ sau commit: ngắt socket control đang có, phát sự kiện room; job media chờ executor115, chưa được báo APPLIED
   ```
4. **Đổi ngược lại thành công khai ⇒ KHÔNG tự nhận lại người cũ** (`BR-SPEC-07`)
5. Người bị thu hồi theo cách này **KHÔNG** vào `room_blocks` — họ vào lại khi chế độ cho phép và có quyền WATCH mới

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T066-01` | Chủ phòng đổi tên → thành công |
| `T066-02` | ⭐ **Người không phải chủ phòng đổi cài đặt → FORBIDDEN**, kể cả khi giả mạo dữ liệu |
| `T066-03` | ⭐ Đổi `timeControl` khi **đang chơi** → **từ chối** |
| `T066-04` | Đổi 15 → 5 phút trong WAITING khi B đã ready ⇒ ghi cấu hình + xoá ready cả hai; Host ready chưa tạo ván, B phải xác nhận lại; cả phòng nhận trạng thái mới. Kiểm cả Host một mình đã ready |
| `T066-05` | ⭐ **Công khai → khoá với 5 người xem → CẢ 5 BỊ ĐƯA RA** |
| `T066-06` | ⭐ PostgreSQL thật: membership/user_active_room bị xoá, mọi WATCH grant/epoch cũ mất quyền; media job tồn tại bền vững và chưa APPLIED. Guard quyền hiện có từ chối actor cũ. Chat delivery/history thật kiểm T110-14, media/RTP thật kiểm TS-MED-06 ở117 |
| `T066-07` | ⭐ **Đổi ngược lại công khai → người cũ KHÔNG tự quay lại** |
| `T066-08` | Người bị thu hồi không vào room_blocks; predicate cho phép grant mới. Join bằng mã mới thực kiểm T075-09 sau068/073 |
| `T066-09` | Đổi chế độ → sảnh cập nhật thời gian thực |
| `T066-10` | Người chơi **không** bị ảnh hưởng khi đổi chế độ |
| `T066-11` | Hai kết nối + rào đồng bộ: đổi thời gian tranh chấp ready/start; start trước ⇒ đổi bị từ chối, đổi trước ⇒ ready cũ không tạo ván theo cấu hình mới |
| `T066-12` | Gửi lệnh ready xác nhận 15 phút sau khi đã đổi 5 phút ⇒ không ghi ready cho cấu hình mới; phải nhận cấu hình mới và chủ động xác nhận lại |
| `T066-13` | 9 chuyển privacy + no-op theo BR-SPEC-20: cả 3 cạnh kín hơn revoke mọi WATCH, cạnh giảm kín không resurrect; PLAY không đổi |
| `T066-14` | Lời mời WATCH trực tiếp trong inbox cùng code/link cũ bị revoke; reopen không dùng lại được |
| `T066-15` | Lưu lại cùng timeControl/đổi tên/privacy không đổi config_revision hay reset ready; timeControl mới reset revision và huỷ side-swap pending |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 15 test xanh
- [ ] **`T066-05/06`** — mutation/guard/job thật trên DB; chưa nhận PASS cho chat/media transport. Bằng chứng ghi T110-14/TS-MED-06/T133-21 là gate tích hợp còn chờ
- [ ] **`T066-02`** chặn cả khi giả mạo
- [ ] `T066-07` chứng minh không tự nhận lại
- [ ] Thu hồi làm **trong cùng transaction**
- [ ] `T066-04/11/12` kiểm DEC-036 trên PostgreSQL thật; thay thời gian và xoá ready nguyên tử, không dùng xác nhận cấu hình cũ

### Contract bổ sung bắt buộc

Ma trận [BR-SPEC-20](../01-requirements/REQ-SPECTATOR.md), contract epoch và grant [ROOM-CHAT §3](../09-technical/room-chat-contract.md). Rotate dùng cùng primitive revoke, nhưng không đổi visibility. Gate tích hợp bắt buộc: [ISSUE-110](ISSUE-110.md) T110-14 (board/socket/chat/history), [ISSUE-117](ISSUE-117.md) TS-MED-06 (SFU/RTP/frame); [ISSUE-133](ISSUE-133.md) T133-21 đối chiếu quyền và [ISSUE-136](ISSUE-136.md) T136-02/04 tổng nghiệm thu. Không mock hoặc ghi các gate này PASS trong066.

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-066.md`

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| **Thu hồi quyền người xem là code chết** — hàm có nhưng không ai gọi, test vẫn xanh (`F-07`) | T066-06 chứng minh primitive được gọi và ghi DB/job; T110-14/TS-MED-06 chứng minh transport thực ở đúng mốc, không mất test cuối |

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** Settings strict commandId, expectedConfigRevision và ít nhất 1 trường. SQL room→users; time mới chỉ WAITING, config++ và reset ready cả hai; cùng time no-op. Privacy 9 cạnh theo ROOM-CHAT§3; revoke WATCH/epoch/member/media job cùng transaction; PLAY giữ.

**Tiền điều kiện cụ thể:** A/B online 095, 5 spectator, grants PLAY/WATCH mọi loại seeded 037, room receipts 039 và job schema 041; 072 UI/inbox chưa là bằng chứng ở đây.

**File kiểm thử:** `tests/integration/issue-066.test.ts`. Giữ tên `T066-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T066-01` | Host PATCH name mới; GET room mới tên, config_revision/ready không đổi. | Chủ phòng đổi tên → thành công |
| `T066-02` | B/S1/C gửi raw PATCH dù thêm hostId=A; FORBIDDEN hoặc strict validation, DB không đổi. | ⭐ **Người không phải chủ phòng đổi cài đặt → FORBIDDEN**, kể cả khi giả mạo dữ liệu |
| `T066-03` | PLAYING PATCH time; từ chối, match và room time giữ. | ⭐ Đổi `timeControl` khi **đang chơi** → **từ chối** |
| `T066-04` | WAITING time 900, B ready; Host đổi 300: config+1, cả hai ready false; lặp Host solo ready; không start bằng ready cũ. | Đổi 15 → 5 phút trong WAITING khi B đã ready ⇒ ghi cấu hình + xoá ready cả hai; Host ready chưa tạo ván, B phải xác nhận lại; cả phòng nhận trạng thái mới. Kiểm cả Host một mình đã ready |
| `T066-05` | PUBLIC5 spectator→LOCKED; count spectator 0, 5 active pointers mất, epoch+1. | ⭐ **Công khai → khoá với 5 người xem → CẢ 5 BỊ ĐƯA RA** |
| `T066-06` | Sau commit đọc predicate room/chat và fence/job thật; actor cũ không quyền, job chưa APPLIED; delivery thật 110/117. | ⭐ PostgreSQL thật: membership/user_active_room bị xoá, mọi WATCH grant/epoch cũ mất quyền; media job tồn tại bền vững và chưa APPLIED. Guard quyền hiện có từ chối actor cũ. Chat delivery/history thật kiểm T110-14, media/RTP thật kiểm TS-MED-06 ở 117 |
| `T066-07` | LOCKED→PUBLIC; không phục hồi memberships/grants/ready của spectator cũ. | ⭐ **Đổi ngược lại công khai → người cũ KHÔNG tự quay lại** |
| `T066-08` | Revoke rồi query room_blocks không có S1; grant mới có thể nhận quyền, join mã mới thật 075-09. | Người bị thu hồi không vào room_blocks; predicate cho phép grant mới. Join bằng mã mới thực kiểm T075-09 sau 068/073 |
| `T066-09` | B ở sảnh socket 062; Host đổi PUBLIC→LOCKED; B nhận remove không metadata kín. | Đổi chế độ → sảnh cập nhật thời gian thực |
| `T066-10` | Privacy transition; so memberships/active pointers/grants PLAY của A/B không đổi. | Người chơi **không** bị ảnh hưởng khi đổi chế độ |
| `T066-11` | Barrier 2 connection start vs time; cả 2 thứ tự: start thắng giữ time cũ, time thắng stale ready không start. | Hai kết nối + rào đồng bộ: đổi thời gian tranh chấp ready/start; start trước ⇒ đổi bị từ chối, đổi trước ⇒ ready cũ không tạo ván theo cấu hình mới |
| `T066-12` | Giữ payload ready revision cũ, đổi 900→300 rồi gửi; STALE_ROOM_CONFIG, không ghi ready. | Gửi lệnh ready xác nhận 15 phút sau khi đã đổi 5 phút ⇒ không ghi ready cho cấu hình mới; phải nhận cấu hình mới và chủ động xác nhận lại |
| `T066-13` | Chạy đủ 9 cặp visibility độc lập; chỉ 3 cạnh kín hơn tăng epoch/revoke, no-op/giảm kín không resurrect. | 9 chuyển privacy + no-op theo BR-SPEC-20: cả 3 cạnh kín hơn revoke mọi WATCH, cạnh giảm kín không resurrect; PLAY không đổi |
| `T066-14` | Seed pending direct WATCH/code/link, đổi privacy; statuses bị revoke; inbox query predicate không trả; PLAY giữ. | Lời mời WATCH trực tiếp trong inbox cùng code/link cũ bị revoke; reopen không dùng lại được |
| `T066-15` | PATCH cùng time/name/privacy; config/ready không đổi; time mới huỷ pending swap và tăng đúng revisions. | Lưu lại cùng timeControl/đổi tên/privacy không đổi config_revision hay reset ready; timeControl mới reset revision và huỷ side-swap pending |



### 10.3 Điểm triển khai cần giữ đúng

```ts
export const tighterPrivacy = (from: string, to: string): boolean =>
  (from === 'PUBLIC' && (to === 'CODE_ONLY' || to === 'LOCKED')) ||
  (from === 'CODE_ONLY' && to === 'LOCKED');
// Rotation là trigger riêng: luôn revoke WATCH, không đổi visibility.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **không reset ready khi time đổi hoặc chỉ revoke mã không revoke direct WATCH**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-066.md`.

```bash
pnpm test:integration -- tests/integration/issue-066.test.ts
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
| `AC-LOB-03` | [REQ-LOBBY](../01-requirements/REQ-LOBBY.md) | LOCAL |
| `AC-ROOM-05` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |
| `AC-ROOM-10` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |
| `AC-ROOM-27` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |
| `AC-CLK-02` | [REQ-CLOCK](../01-requirements/REQ-CLOCK.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
