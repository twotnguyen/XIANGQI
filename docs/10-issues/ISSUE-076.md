# ISSUE-076 — Đuổi người xem + danh sách chặn (R18)

**Nhóm:** E09 · **Phụ thuộc:** 075 · **Trạng thái:** TODO
**⭐ Yêu cầu MỚI từ audit BA** — `DEC-004`, `DEC-014`, `DEC-015`

## 1. MỤC TIÊU
**Cả hai người chơi** đuổi được một người xem cụ thể — và người đó **không vào lại được**.

## 2. VÌ SAO CÓ YÊU CẦU NÀY

Tài liệu media cũ nhắc *"kick viewer"* **hai lần** nhưng **không có** chức năng nào. Cách duy nhất là đổi chế độ ⇒ **đuổi cả 5 người**. Muốn đuổi 1 người quấy rối phải đuổi hết.

## 3. ĐỌC TRƯỚC
[../01-requirements/REQ-SPECTATOR.md](../01-requirements/REQ-SPECTATOR.md) **§6, §11 `BR-SPEC-10..13`** · [../02-flows/FLOW-SPECTATOR.md](../02-flows/FLOW-SPECTATOR.md) §4

## 4. PHẠM VI
**✅ LÀM** — `POST /rooms/:id/members/:userId/kick` · danh sách chặn
**❌ KHÔNG LÀM** — giao diện (077)

## 5. CÁC BƯỚC
1. **Trong cùng transaction**:
   ```
   ① khoá phòng
   ② kiểm người gọi là NGƯỜI CHƠI của phòng này      ← DEC-014: CẢ HAI, không riêng chủ phòng
   ③ kiểm mục tiêu là NGƯỜI XEM của phòng này
   ④ xoá tư cách thành viên
   ⑤ INSERT room_blocks (room_id, user_id, blocked_by)  ← DEC-015
   ⑥ xoá user_active_room của họ
   ⑦ đánh dấu media cần thu hồi
   ⑧ tăng room_version
   ⑨ SAU COMMIT: ngắt kết nối, phát sự kiện
   ```
2. **`BR-SPEC-13`** — **không** đuổi được người chơi (kể cả đối thủ, kể cả chính mình)
3. **`BR-SPEC-11`** — người bị đuổi **không vào lại** bằng **bất kỳ đường nào**: mã xem · link · phòng chuyển công khai
4. **`BR-SPEC-12`** — chặn **chỉ trong phạm vi phòng đó**. Vào phòng khác **bình thường**. Xoá khi phòng đóng
5. Hai người chơi cùng đuổi một người ⇒ thực hiện **một lần**, lần hai báo người đó không còn trong phòng

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T076-01` | ⭐ **Chủ phòng đuổi người xem → thành công**, người đó về sảnh |
| `T076-02` | ⭐ **Người chơi KHÔNG phải chủ phòng cũng đuổi được** (`DEC-014`) |
| `T076-03` | ⭐ **Người xem đuổi người khác → FORBIDDEN** |
| `T076-04` | ⭐ **Người chơi đuổi ĐỐI THỦ → FORBIDDEN** |
| `T076-05` | Người chơi đuổi **chính mình** → FORBIDDEN |
| `T076-06` | ⭐ **Bị đuổi → dùng MÃ XEM cũ → TỪ CHỐI** |
| `T076-07` | ⭐ **Bị đuổi → dùng LINK cũ → TỪ CHỐI** |
| `T076-08` | ⭐ **Bị đuổi → phòng chuyển CÔNG KHAI → VẪN TỪ CHỐI** |
| `T076-09` | ⭐ **Bị đuổi → vào PHÒNG KHÁC → BÌNH THƯỜNG** |
| `T076-10` | Kick chặn predicate board/chat/history từ commit + media fence/job và socket control; delivery thật T110-14, RTP/frame thật TS-MED-06 ở117. |
| `T076-11` | Bị đuổi → ghế trống ngay, người khác vào được |
| `T076-12` | ⭐ **Hai người chơi cùng đuổi một người → thực hiện MỘT lần** |
| `T076-13` | ⭐ **Phòng đóng → `room_blocks` bị XOÁ** |
| `T076-14` | Đuổi người không ở trong phòng → `NOT_FOUND` |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 14 test xanh trên PostgreSQL thật
- [ ] **`T076-02`** — cả hai người chơi đuổi được
- [ ] **`T076-06`, `T076-07`, `T076-08`** — chặn **cả ba** đường vào lại
- [ ] **`T076-09`** — chặn chỉ trong phạm vi phòng
- [ ] **`T076-04`** — không đuổi được người chơi

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-076.md`

## 9. ⚠ CẠM BẪY
Chỉ chặn ở **một** đường vào (ví dụ chỉ chặn mã, quên link) sẽ làm tính năng **vô nghĩa** — người bị đuổi chỉ cần dùng link cũ. Ba test `T076-06/07/08` kiểm **đủ cả ba** đường.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** POST /rooms/:id/members/:userId/kick: actorPLAYER bất kỳ, targetSPECTATOR; roomlock, delete member/pointer, insert room_blocks(room, user, blocked_by), mediafence/job, version++; no-op duplicate targetgone trả NOT_FOUND. Block cả code/link/public room-scoped.

**Tiền điều kiện cụ thể:** AHost/BPLAYER/S1 SPECTATOR/S2 spectator vàroomR2; WATCH grants thật; kiểm DB và socket control 084.

**File kiểm thử:** `tests/integration/issue-076.test.ts`. Giữ tên `T076-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T076-01` | A kick S1; rowblockS1, member/pointer mất, socket control revoked. | ⭐ **Chủ phòng đuổi người xem → thành công**, người đó về sảnh |
| `T076-02` | BkhôngHostkickS1 fixture mới; cùng kết quả, blocked_by=B. | ⭐ **Người chơi KHÔNG phải chủ phòng cũng đuổi được** (`DEC-014`) |
| `T076-03` | S2 rawkickS1; FORBIDDEN, không row block. | ⭐ **Người xem đuổi người khác → FORBIDDEN** |
| `T076-04` | AkickB; FORBIDDEN, PLAYER giữ. | ⭐ **Người chơi đuổi ĐỐI THỦ → FORBIDDEN** |
| `T076-05` | AkickA; FORBIDDEN. | Người chơi đuổi **chính mình** → FORBIDDEN |
| `T076-06` | S1 bị kick dùng WATCH code còn proof; BLOCKED_FROM_ROOM, không member. | ⭐ **Bị đuổi → dùng MÃ XEM cũ → TỪ CHỐI** |
| `T076-07` | S1 dùng link WATCH; cùng predicate block, không bypass. | ⭐ **Bị đuổi → dùng LINK cũ → TỪ CHỐI** |
| `T076-08` | RoomPUBLIC, S1 roomIdWATCH; blocked dù PUBLIC. | ⭐ **Bị đuổi → phòng chuyển CÔNG KHAI → VẪN TỪ CHỐI** |
| `T076-09` | S1 joinR2 public; thành công, block R1 khôngápdụngR2. | ⭐ **Bị đuổi → vào PHÒNG KHÁC → BÌNH THƯỜNG** |
| `T076-10` | Sau commit predicateboard/chat/media chặn; socket control ngắt; thực data/history 110T110-14 và RTP117, không claim buffer zero. | Kick chặn predicate board/chat/history từ commit + media fence/job và socket control; delivery thật T110-14, RTP/frame thật TS-MED-06 ở 117. |
| `T076-11` | S1 mất ghế ngay, S6 join thành công, count≤5. | Bị đuổi → ghế trống ngay, người khác vào được |
| `T076-12` | A/BkickS1 qua 2 connection barrier; 1 mutation/version increment, 1NOT_FOUND, 1 blockrow. | ⭐ **Hai người chơi cùng đuổi một người → thực hiện MỘT lần** |
| `T076-13` | Host closeR1; block R1 mất, block phòng khác giữ. | ⭐ **Phòng đóng → `room_blocks` bị XOÁ** |
| `T076-14` | Akickidkhôngởroom; NOT_FOUND sauactorcheck, không ảnh hưởng user khác. | Đuổi người không ở trong phòng → `NOT_FOUND` |

T076-10 kiểm fence/predicate/socket control tại 076; delivery board/chat/history giữ tại 110T110-14, media thật 117TS-MED-06. Không hứa xoá packet người dùng đã nhận.

### 10.3 Điểm triển khai cần giữ đúng

```sql
-- Hai actor PLAYER có quyền như nhau; không thêm điều kiện host_user_id.
SELECT role FROM room_members WHERE room_id=$1 AND user_id=$2;
-- $2 từ JWT. Actor phải PLAYER, target query riêng phải SPECTATOR, cùng lockroom.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **chỉ cho Host kick hoặc quên block link/public**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-076.md`.

```bash
pnpm test:integration -- tests/integration/issue-076.test.ts
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
| `AC-LOB-10` | [REQ-LOBBY](../01-requirements/REQ-LOBBY.md) | LOCAL |
| `AC-INV-18` | [REQ-INVITE](../01-requirements/REQ-INVITE.md) | LOCAL |
| `AC-SPEC-11` | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) | LOCAL |
| `AC-SPEC-12` | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) | LOCAL |
| `AC-SPEC-13` | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) | LOCAL |
| `AC-SPEC-14` | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
