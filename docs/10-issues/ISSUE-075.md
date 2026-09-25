# ISSUE-075 — Thu hồi quyền hàng loạt

**Nhóm:** E09 · **Phụ thuộc:** 074, 066 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Đổi chế độ **kín hơn** hoặc đổi mã ⇒ **toàn bộ người xem bị đưa ra** — và thu hồi **thật sự có hiệu lực**.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-SPECTATOR.md](../01-requirements/REQ-SPECTATOR.md) **§10** · [../02-flows/FLOW-SPECTATOR.md](../02-flows/FLOW-SPECTATOR.md) §5

## 3. PHẠM VI
**✅ LÀM** — dùng primitive066, trigger privacy/rotate + join/DB guard/job thật; transport chat/media đầy đủ nghiệm thu tại110/117 theo bảng test. Không mock endpoint chưa tồn tại.
**❌ KHÔNG LÀM** — đuổi một người (076)

## 4. FILE SỬA
`apps/server/src/modules/rooms/revoke.service.ts`

## 5. CÁC BƯỚC
1. **Hai nguyên nhân thu hồi hàng loạt**: PUBLIC→CODE_ONLY, PUBLIC→LOCKED, CODE_ONLY→LOCKED · đổi mã xem
2. **Trong cùng transaction**:
   ```
   ① khoá phòng
   ② tăng watch_epoch
   ③ XOÁ toàn bộ thành viên SPECTATOR
   ④ xoá user_active_room của họ
   ⑤ revoke mọi lời mời/mã/link WATCH cũ; PLAY giữ nguyên
   ⑥ đánh dấu media cần thu hồi
   ⑦ tăng room_version
   ⑧ SAU COMMIT: ngắt socket control đang có, phát room event; media executor115 xử job sau, chưa đánh APPLIED
   ```
3. **`BR-SPEC-06`** — quyền bàn cờ/chat/history bị chặn từ commit; media có fence và job thu hồi, chỉ xác nhận APPLIED khi đủ bằng chứng SFU theo DEC-041. Không hứa mọi buffer mạng dừng cùng một thời điểm.
4. **`BR-SPEC-07`** — đổi ngược lại công khai **không** tự nhận lại người cũ
5. Người bị thu hồi theo cách này **KHÔNG** vào `room_blocks` — vào lại được nếu có mã mới

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T075-01` | ⭐ **Đổi sang khoá với 5 người xem → CẢ 5 BỊ ĐƯA RA** |
| `T075-02` | ⭐ Sau thu hồi predicate quyền membership/room trong DB thật từ chối actor cũ; room subscription cũ không còn quyền theo epoch. Board snapshot/realtime qua endpoint thật kiểm T110-14 |
| `T075-03` | ⭐ Transaction thu hồi xoá membership và tăng epoch làm predicate quyền đọc/gửi chat FALSE trên DB thật. Tin mới qua socket thực kiểm T110-14 |
| `T075-04` | ⭐ Query quyền context/history bằng dữ liệu DB thật từ chối actor cũ, không trao participant riêng mới. HTTP history thật kiểm T110-14 |
| `T075-05` | ⭐ Fence/policy/job thu hồi ghi bền vững đúng actor/epoch, chưa APPLIED. Media/RTP/frame thực sau thu hồi kiểm TS-MED-06 ở117 |
| `T075-06` | Đổi mã xem → cùng hiệu lực như trên |
| `T075-07` | Mã cũ **không** dùng được nữa |
| `T075-08` | ⭐ **Đổi ngược lại công khai → người cũ KHÔNG tự quay lại** |
| `T075-09` | Người bị thu hồi **không** vào `room_blocks`, vào lại được bằng mã mới |
| `T075-10` | **Người chơi không** bị ảnh hưởng |
| `T075-11` | `user_active_room` của họ được xoá → tạo phòng khác được ngay |
| `T075-12` | Cả 3 cạnh kín hơn revoke mọi WATCH direct/code/link/membership, không revoke PLAY; giảm kín không resurrect |
| `T075-13` | Rotate PUBLIC vẫn hiện ở sảnh, WATCH cũ mất quyền, join mới PUBLIC được phép |
| `T075-14` | Hai kết nối thật + barrier: revoke tranh chấp join theo hai thứ tự, không giữ membership/grant cũ. Race send/history và delivery thật ở T110-14 sau khi108–110 tồn tại |

> T075-02..05 kiểm DB/guard/job thật trong scope hiện có, không chứng minh RTP/chat delivery. Bắt buộc chạy gate T110-14 và TS-MED-06 ở117 trước nghiệm thu toàn tính năng; ghi rõ chưa chạy trong báo cáo075, không `.skip`/mock rồi đánh PASS.

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 14 test xanh
- [ ] **`T075-02`…`T075-05`** — DB/guard/job thật, không false PASS cho transport chưa có; trace T110-14/TS-MED-06/T133-21/T136-02/04 còn chờ
- [ ] **`T075-08`** không tự nhận lại
- [ ] `T075-11` không để người dùng bị kẹt
- [ ] Thu hồi trong **cùng transaction**

### Contract bổ sung bắt buộc

Nguồn chuẩn BR-SPEC-20 + ROOM-CHAT §3/5. Logout/reconnect không bỏ qua watch_epoch. Board/socket/chat/history/revoke race tại ISSUE-110 T110-14; media revoke tại ISSUE-117 TS-MED-06; ma trận quyền133 T133-21 và tổng nghiệm thu136 T136-02/04 phải có hai bằng chứng đó, không mock RTP.

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-075.md`

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| **Thu hồi quyền người xem là code chết** — hàm tồn tại nhưng **không ai gọi**, và không có sự kiện nào được phát (`F-07`) | T075-02..05 kiểm DB/guard/job và trigger thật; T110-14/TS-MED-06 kiểm transport thực, không suy từ spy hoặc UI |

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** RevokeService dùng primitive 066; privacy/rotate triggers thật, watchers(epoch)/grant direct/code/link/pointers/job cùng transaction. Gỡ socket control sau commit; predicate board/chat/history chặn ngay; media APPLIED chỉ 115/117.

**Tiền điều kiện cụ thể:** 5 SPECTATOR, 2 PLAYER, 3 loại WATCH+PLAY grants, media policy/job 041; secretscanary chỉtestmemory; 2 connection barrier.

**File kiểm thử:** `tests/integration/issue-075.test.ts`. Giữ tên `T075-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T075-01` | Host đổi LOCKED qua 066; countSPECTATOR0, từng actor mất active pointer. | ⭐ **Đổi sang khoá với 5 người xem → CẢ 5 BỊ ĐƯA RA** |
| `T075-02` | Actor cũ gọi predicate room/subscription epoch; false sau commit; boardHTTP/socket 110T110-14. | ⭐ Sau thu hồi predicate quyền membership/room trong DB thật từ chối actor cũ; room subscription cũ không còn quyền theo epoch. Board snapshot/realtime qua endpoint thật kiểm T110-14 |
| `T075-03` | Actor cũ query sender/read chat permissionDB; false; tin thật/sendrace 110T110-14. | ⭐ Transaction thu hồi xoá membership và tăng epoch làm predicate quyền đọc/gửi chat FALSE trên DB thật. Tin mới qua socket thực kiểm T110-14 |
| `T075-04` | Actor cũ query history/context predicate; không current context/privateparticipants; API110T110-14. | ⭐ Query quyền context/history bằng dữ liệu DB thật từ chối actor cũ, không trao participant riêng mới. HTTP history thật kiểm T110-14 |
| `T075-05` | Query media fence/job actor+epoch; bền vững saurestart, chưa APPLIED; RTP/frame 117TS-MED-06. | ⭐ Fence/policy/job thu hồi ghi bền vững đúng actor/epoch, chưa APPLIED. Media/RTP/frame thực sau thu hồi kiểm TS-MED-06 ở 117 |
| `T075-06` | Rotatecode qua 068; cùng tậpDB mutations với privacy, không visibility change. | Đổi mã xem → cùng hiệu lực như trên |
| `T075-07` | Dùng code cũ join; genericerror, không member. | Mã cũ **không** dùng được nữa |
| `T075-08` | LOCKED→PUBLIC; zero oldmembers/grants resurrect. | ⭐ **Đổi ngược lại công khai → người cũ KHÔNG tự quay lại** |
| `T075-09` | Queryroom_blocks khôngS1; cấp WATCH mới S1 join được. | Người bị thu hồi **không** vào `room_blocks`, vào lại được bằng mã mới |
| `T075-10` | So 2 PLAYER/grantsPLAY trước/sau; không đổi. | **Người chơi không** bị ảnh hưởng |
| `T075-11` | S1 create room khác ngay saurevoke; success. | `user_active_room` của họ được xoá → tạo phòng khác được ngay |
| `T075-12` | 3 cạnh kín hơn×3 loại WATCH: revoke đủ; 3 cạnh giảm kín/noop không hồi sinh/không revoke PLAY. | Cả 3 cạnh kín hơn revoke mọi WATCH direct/code/link/membership, không revoke PLAY; giảm kín không resurrect |
| `T075-13` | Rotate PUBLIC; lobby còn room, old WATCH denied, fresh roomId WATCH join được. | Rotate PUBLIC vẫn hiện ở sảnh, WATCH cũ mất quyền, join mới PUBLIC được phép |
| `T075-14` | Join và revoke 2 connection barrier, hai thứ tự; join trước bị revoke sau, revoke trước stale grant không join. | Hai kết nối thật + barrier: revoke tranh chấp join theo hai thứ tự, không giữ membership/grant cũ. Race send/history và delivery thật ở T110-14 sau khi 108–110 tồn tại |



### 10.3 Điểm triển khai cần giữ đúng

```sql
-- $1 room, $2 epoch trước thao tác. Sau revoke, không còn spectator ở epoch cũ.
SELECT count(*) FROM room_members
WHERE room_id=$1 AND role='SPECTATOR' AND watch_epoch=$2;
-- Kết quả0 phải đi kèm epoch mới, grants revoked, active pointers mất và jobs thật.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **chỉ tạo helperrevoke nhưng triggerprivacy/rotate không gọi**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-075.md`.

```bash
pnpm test:integration -- tests/integration/issue-075.test.ts
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
| `AC-SPEC-09` | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
