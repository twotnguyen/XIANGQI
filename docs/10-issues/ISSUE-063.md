# ISSUE-063 — Vào ghế chơi + trần sức chứa (khoá)

**Nhóm:** E07 · **Phụ thuộc:** 061, 040 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Nhận người vào phòng mà **không bao giờ vượt trần** — kể cả khi nhiều người xin cùng lúc.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-ROOM.md](../01-requirements/REQ-ROOM.md) §9 **`BR-ROOM-18`** · [../09-technical/architecture.md](../09-technical/architecture.md) §5 (thứ tự khoá)

## 3. PHẠM VI
**✅ LÀM** — `POST /rooms/join` · đếm sức chứa **trong khoá**
**❌ KHÔNG LÀM** — mã/link (068, 069) · sẵn sàng (064)

## 4. FILE TẠO
`apps/server/src/modules/rooms/join.service.ts`

## 5. CÁC BƯỚC
1. `POST /api/v1/rooms/join` nhận strict union đúng một `{roomId|code|token|invitationId}` + `commandId` + `intent: PLAY|WATCH`; reject role/side/userId. Theo [ROOM-CHAT §2](../09-technical/room-chat-contract.md)
2. **Thuật toán bắt buộc — TẤT CẢ trong MỘT transaction**:
   ```
   ① SELECT ... FROM rooms WHERE id = $1 FOR UPDATE     ← KHOÁ PHÒNG
   ② kiểm bằng chứng quyền biết phòng; chưa có ⇒ ROOM_ACCESS_UNAVAILABLE
   ③ sau bằng chứng: kiểm chưa CLOSED, KHÔNG nằm trong room_blocks                   ← DEC-015
   ④ kiểm quyền theo chế độ riêng tư
   ⑤ ĐẾM thành viên hiện tại (vẫn trong khoá)
   ⑥ PLAYER: status WAITING và count < 2 | SPECTATOR: count < 5, đủ quyền xem
   ⑦ INSERT room_members
   ⑧ INSERT user_active_room
   ⑨ tăng room_version
   ```
   ⛔ Bước ⑤ và ⑦ **phải trong cùng khoá**. Đếm trước rồi mới mở transaction là **sai**
3. **Thứ tự khoá bắt buộc**: `phòng → người dùng (theo thứ tự id) → ván`. Không bao giờ khoá ngược
4. **Chỉ nhận PLAYER mới khi WAITING**. PLAYING/FINISHED đều từ chối; FINISHED không nhận lại người đã rời bằng PLAY. Nối lại thành viên hiện hữu không phải join mới (`DEC-032`)
5. Dùng **SQL thuần** (`TECH-07`)

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T063-01` | Vào ghế chơi thứ 2 → thành công, side = bên còn trống (BLACK trong fixture Host RED) |
| `T063-02` | ⭐ **Hai người xin ghế chơi cuối ĐỒNG THỜI → ĐÚNG MỘT thành công** |
| `T063-03` | ⭐ **Hai người xin ghế xem thứ 5 ĐỒNG THỜI → ĐÚNG MỘT thành công**, không thành 6 |
| `T063-04` | Người thứ 6 xin xem → `ROOM_FULL` |
| `T063-05` | Người thứ 3 xin chơi → `ROOM_FULL` |
| `T063-06` | ⭐ Người có bằng chứng hiện hành, trong `room_blocks` → **`BLOCKED_FROM_ROOM`**; không bằng chứng trả lỗi chung |
| `T063-07` | Đang ở phòng khác → `ALREADY_IN_ROOM` |
| `T063-08` | Vào ghế chơi khi phòng **đang chơi** → **từ chối** |
| `T063-09` | Join mới phòng đã đóng bằng vé thu hồi → `ROOM_ACCESS_UNAVAILABLE`; sự kiện close cho member đã xác thực dùng ROOM_CLOSED |
| `T063-10` | ⭐ **Sau mọi test tranh chấp: kiểm DỮ LIỆU — số người chơi ≤ 2, người xem ≤ 5** |
| `T063-11` | Đưa cả `roomId` và `code` → **từ chối** (schema) |
| `T063-12` | FINISHED: C mới hoặc B đã rời gửi PLAY qua mọi đường vào dù vé còn hạn ⇒ không nhận PLAYER; WATCH đủ quyền vẫn hoạt động |
| `T063-13` | Payload role/side/userId hoặc nhiều locator bị VALIDATION_ERROR; WATCH grant + PLAY intent không được nâng quyền |
| `T063-14` | Không proof: missing/private/closed/full/blocked cùng lỗi chung và không metadata; có proof trả lỗi chi tiết đúng bảng ROOM-CHAT §2 |

> `T063-02`, `T063-03`, `T063-10` phải dùng **rào đồng bộ** và **hai kết nối riêng**, và **đảo thứ tự** để chứng minh không phụ thuộc thời điểm.

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 14 test xanh trên PostgreSQL thật
- [ ] **`T063-02`, `T063-03`** với rào đồng bộ, chạy **≥20 lần** đều đúng
- [ ] **`T063-10`** kiểm **dữ liệu sau commit**, không chỉ phản hồi API
- [ ] `T063-06` chứng minh danh sách chặn có hiệu lực
- [ ] Thứ tự khoá đúng, **không** có đường khoá ngược

### Contract bổ sung bắt buộc

Tách resolver grant (068/069/070) khỏi primitive nhận ghế; không giả token để chứng minh luồng end-to-end. Mọi đường dùng cùng contract quyền biết phòng. Sau join PLAYER trong WAITING tạo segment chat mới với snapshot đúng cặp; ISSUE-108 kiểm hồi quy lịch sử.

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-063.md` — kết quả chạy test tranh chấp 20 lần.

## 9. ⚠ CẠM BẪY
Đếm sức chứa **trước** khi mở transaction là lỗi kinh điển: hai yêu cầu cùng đọc *"còn 1 chỗ"* rồi cùng ghi ⇒ **6 người xem**. Phải đếm **bên trong** khoá phòng.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** Join service nhận strict locator+commandId+intent theo ROOM-CHAT§2; resolver grant và primitive admitInTransaction tách; chỉ grant verified được truyền giữa nội bộ server. Trong lock room→sorted users: proof→status/block/privacy/capacity→consume+membership+active pointer+segment; lỗi theo bảng canonical.

**Tiền điều kiện cụ thể:** PUBLIC WAITING Host A, B/C cạnh tranh, 4/5 SPECTATOR, grant thật DB từ 037; resolver code/link/direct hoàn thiện 068–070.

**File kiểm thử:** `tests/integration/issue-063.test.ts`. Giữ tên `T063-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T063-01` | B vào PLAY bằng verified grant DB primitive; side còn trống BLACK, segment A–B mới, segment solo đã seal. | Vào ghế chơi thứ 2 → thành công, side = bên còn trống (BLACK trong fixture Host RED) |
| `T063-02` | B/C tranh PLAY slot, 2 connection/barrier 20 lần; đúng 1 member mới/consume và loser không active pointer. | ⭐ **Hai người xin ghế chơi cuối ĐỒNG THỜI → ĐÚNG MỘT thành công** |
| `T063-03` | S5/S6 tranh WATCH slot khi 4 spectator; đúng 1 thành công, count 5. | ⭐ **Hai người xin ghế xem thứ 5 ĐỒNG THỜI → ĐÚNG MỘT thành công**, không thành 6 |
| `T063-04` | 5 spectator + proof hợp lệ S6; ROOM_FULL và grant chưa consume. | Người thứ 6 xin xem → `ROOM_FULL` |
| `T063-05` | 2 PLAYER + proof PLAY hợp lệ; ROOM_FULL, không member thứ 3. | Người thứ 3 xin chơi → `ROOM_FULL` |
| `T063-06` | Actor block cùng valid proof→BLOCKED_FROM_ROOM; bỏ proof→404 chung, không metadata. | ⭐ Người có bằng chứng hiện hành, trong `room_blocks` → **`BLOCKED_FROM_ROOM`**; không bằng chứng trả lỗi chung |
| `T063-07` | B active ở R0, joinR1; ALREADY_IN_ROOM không tiết lộ R1. | Đang ở phòng khác → `ALREADY_IN_ROOM` |
| `T063-08` | Room PLAYING + PLAY grant; ROOM_NOT_WAITING, không consume. | Vào ghế chơi khi phòng **đang chơi** → **từ chối** |
| `T063-09` | CLOSED revoke tất cả grant; join mới 404 chung; close event member dùng ROOM_CLOSED ở 065. | Join mới phòng đã đóng bằng vé thu hồi → `ROOM_ACCESS_UNAVAILABLE`; sự kiện close cho member đã xác thực dùng ROOM_CLOSED |
| `T063-10` | Sau mỗi race đọc committed room_members và user_active_room, PLAYER≤2/SPECTATOR≤5, không orphan. | ⭐ **Sau mọi test tranh chấp: kiểm DỮ LIỆU — số người chơi ≤ 2, người xem ≤ 5** |
| `T063-11` | Payload roomId+code; 400 trước resolver, không query grant. | Đưa cả `roomId` và `code` → **từ chối** (schema) |
| `T063-12` | FINISHED actor mới/đã rời với PLAY grant bị từ chối; WATCH valid proof vào được; từng locator test thật 068–073. | FINISHED: C mới hoặc B đã rời gửi PLAY qua mọi đường vào dù vé còn hạn ⇒ không nhận PLAYER; WATCH đủ quyền vẫn hoạt động |
| `T063-13` | Chèn role/side/userId/ownerId/ready; 400; WATCH grant+PLAY intent ACCESS_DENIED không nâng quyền. | Payload role/side/userId hoặc nhiều locator bị VALIDATION_ERROR; WATCH grant + PLAY intent không được nâng quyền |
| `T063-14` | Bảng no-proof missing/private/full/closed/blocked và proof hợp lệ: so status/code/shape/no metadata; không yêu cầu latency bằng nhau. | Không proof: missing/private/closed/full/blocked cùng lỗi chung và không metadata; có proof trả lỗi chi tiết đúng bảng ROOM-CHAT §2 |



### 10.3 Điểm triển khai cần giữ đúng

```ts
// Đầu vào một đường join; actor tuyệt đối không nằm trong payload.
export const joinWatch = (roomId: string, commandId: string) => ({
  roomId, commandId, intent: 'WATCH' as const,
});
// PUBLIC hiện hành WAITING/PLAYING là proof; ID phòng kín không phải proof.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **đếm trước lock hoặc tin role/side từ body**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-063.md`.

```bash
pnpm test:integration -- tests/integration/issue-063.test.ts
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
| `AC-LOB-06` | [REQ-LOBBY](../01-requirements/REQ-LOBBY.md) | LOCAL |
| `AC-ROOM-04` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |
| `AC-ROOM-12` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |
| `AC-ROOM-17` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
