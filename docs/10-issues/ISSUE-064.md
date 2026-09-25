# ISSUE-064 — Sẵn sàng + bắt đầu ván

**Nhóm:** E07 · **Phụ thuộc:** 063, 039, 040, 095 · **Trạng thái:** TODO

> DEC-031/042: presence thật ở 095 là phụ thuộc; offline vô hiệu ready, reconnect phải xác nhận lại. Không dùng mock presence để báo PASS.

## 1. MỤC TIÊU
Hai người chơi bấm sẵn sàng ⇒ tạo **đúng một** ván, khoá cấu hình thời gian.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-ROOM.md](../01-requirements/REQ-ROOM.md) §5.3, §9 `BR-ROOM-04/05/06/21/22` · [../02-flows/FLOW-CREATE-ROOM.md](../02-flows/FLOW-CREATE-ROOM.md) §1

## 3. PHẠM VI
**✅ LÀM** — `POST /rooms/:id/ready` · tạo ván nguyên tử
**❌ KHÔNG LÀM** — đi nước (087)

## 4. FILE TẠO
`apps/server/src/modules/rooms/ready.service.ts`

## 5. CÁC BƯỚC
1. `POST /api/v1/rooms/:id/ready`: strict payload `{commandId,membershipId,expectedConfigRevision,expectedReadyRevision,ready}` theo [ROOM-CHAT §1](../09-technical/room-chat-contract.md). Lệnh stale không tự retry theo revision mới.
2. **Trong MỘT transaction**:
   ```
   ① khoá phòng FOR UPDATE
   ② kiểm phòng ĐANG CHỜ — nếu không: CONFLICT
   ③ kiểm người gọi là PLAYER, membershipId hiện hành; không có side-swap pending
   ④ kiểm xác nhận đúng cấu hình hiện hành, cập nhật ready (chấp nhận cả khi một PLAYER)
   ⑤ ĐỦ HAI PLAYER, CẢ HAI ONLINE VÀ ready_config_revision=config_revision, ready=true?
       ├─ KHÔNG → xong
       └─ CÓ    → ⑥ KHOÁ CỨNG time_control
                  ⑦ tạo matches (status ACTIVE, position ban đầu, turn RED)
                  ⑧ ghi sự kiện START version 0
                  ⑨ INSERT active_players cho cả hai
                  ⑩ rooms.status = PLAYING, current_match_id = ván mới; gắn match_id vào current chat context, không copy tin
                  ⑪ tăng room_version
   ```
3. **Đổi ghế/bên ⇒ xoá ready của CẢ HAI** (`BR-ROOM-06`)
4. Bấm sẵn sàng khi phòng **không** ở trạng thái chờ ⇒ **`CONFLICT`**, không để lỗi cơ sở dữ liệu lộ ra
5. Mọi tab đều bấm được (`DEC-020`) — lệnh trùng chỉ cho **một** kết quả
6. Ready phải gắn với cấu hình người dùng xác nhận; không tự áp dụng lệnh cho cấu hình cũ sau khi thời gian đã đổi (DEC-036). ISSUE-066 tích hợp cập nhật cấu hình + xoá ready cùng transaction; kiểm tranh chấp ở T066-11/12. Không coi các ca đó đã đạt trước khi có phần đổi cài đặt.

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T064-01` | Một người sẵn sàng → ván **chưa** bắt đầu |
| `T064-02` | Cả hai sẵn sàng → ván tạo, phòng chuyển **đang chơi**, lượt **ĐỎ** |
| `T064-03` | ⭐ **Cả hai bấm ĐỒNG THỜI → ĐÚNG MỘT ván được tạo** |
| `T064-04` | ⭐ Bấm sẵn sàng khi phòng **đang chơi** → **`CONFLICT`**, không phải lỗi 500 |
| `T064-05` | Bỏ sẵn sàng trước khi bên kia bấm → ván **không** bắt đầu |
| `T064-06` | ⭐ **Đổi bên → ready của CẢ HAI bị xoá** |
| `T064-07` | **Người xem** bấm sẵn sàng → **FORBIDDEN** |
| `T064-08` | Chỉ một PLAYER: ghi ready thành công, có thể bỏ, không có Match; người thứ hai vào và ready, đủ online/ready theo cấu hình hiện hành ⇒ đúng một ván (DEC-035) |
| `T064-09` | ⭐ Sau khi ván bắt đầu → **đổi `time_control` BỊ TỪ CHỐI** |
| `T064-10` | ⭐ Ván tạo xong → có **đúng một** sự kiện `START` version 0 |
| `T064-11` | Hai tab cùng người cùng bấm → **một** kết quả |
| `T064-12` | B đã ready rồi offline, A ready ⇒ không tạo ván; B quay lại trước hạn phải ready lại, sau đó đủ online/ready mới tạo một ván |
| `T064-13` | Ready stale theo configRevision/readyRevision/membershipId (sau offline/rejoin) bị từ chối, không tự set true |
| `T064-14` | Đề nghị đổi bên: chỉ đối thủ accept trước 30s, đổi hai side nguyên tử; self/spectator/đúng hạn/offline/config change không đổi; ready reset cả hai |
| `T064-15` | Hai request swap cùng lúc chỉ một pending; pending chặn ready; cancel/decline không phục hồi ready |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 15 test xanh trên PostgreSQL thật
- [ ] **`T064-03`** với rào đồng bộ, chạy ≥20 lần
- [ ] **`T064-04`** trả `CONFLICT`, **không** để lỗi cơ sở dữ liệu lộ ra
- [ ] **`T064-09`** chứng minh khoá cứng thời gian
- [ ] `T064-06` chứng minh đổi bên xoá ready

### Contract bổ sung bắt buộc

Triển khai side-swap request/respond/cancel và timer bằng clock tiêm theo ROOM-CHAT §1, BR-ROOM-24. Đây là phạm vi 064; UI 067. Biên lai phòng dùng 039; mọi mutation lấy khoá phòng → người. Ready=false cũng kiểm revision.

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-064.md`

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| Tranh chấp sẵn sàng **không kiểm trạng thái phòng** ⇒ trả lỗi cơ sở dữ liệu thô thay vì `CONFLICT` (`F-19`) | `T064-04` |
| Hai người bấm cùng lúc tạo **hai ván** | `T064-03` |

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** Ready payload/revisions và side-swap endpoints đúng ROOM-CHAT§1; clock tiêm, 039 receipt, 095 presence thật. Start transaction tạo 1 Match/START0/active_players, gắn context hiện có vào Match, không copy tin; thứ 2 join không reset ready Host solo hợp lệ.

**Tiền điều kiện cụ thể:** A/B2 membership online socket 095; config_revision 4, ready_revision 7/9; A RED; context 040 có tin fixture.

**File kiểm thử:** `tests/integration/issue-064.test.ts`. Giữ tên `T064-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T064-01` | A ready true, B false; chỉ A ready, zero Match. | Một người sẵn sàng → ván **chưa** bắt đầu |
| `T064-02` | A/B ready đủ online; 1ACTIVE Match turn RED, PLAYING, contextid giữ và match_id gắn. | Cả hai sẵn sàng → ván tạo, phòng chuyển **đang chơi**, lượt **ĐỎ** |
| `T064-03` | Hai ready qua 2 connection/barrier 20 lần; count Match 1, START1, active_players 2. | ⭐ **Cả hai bấm ĐỒNG THỜI → ĐÚNG MỘT ván được tạo** |
| `T064-04` | Room PLAYING, ready request mới; CONFLICT không 500, version không đổi. | ⭐ Bấm sẵn sàng khi phòng **đang chơi** → **`CONFLICT`**, không phải lỗi 500 |
| `T064-05` | A ready rồi false trước B ready; zero Match và ready_config_revision A NULL. | Bỏ sẵn sàng trước khi bên kia bấm → ván **không** bắt đầu |
| `T064-06` | Đề nghị swap và B accept; side đổi nguyên tử, cả 2 ready false/revision tăng. | ⭐ **Đổi bên → ready của CẢ HAI bị xoá** |
| `T064-07` | SPECTATOR raw ready dù membershipid PLAYER giả; FORBIDDEN, không Match. | **Người xem** bấm sẵn sàng → **FORBIDDEN** |
| `T064-08` | Host solo ready/unready; Bjoin không reset Host ready hợp lệ; B ready online mới start. | Chỉ một PLAYER: ghi ready thành công, có thể bỏ, không có Match; người thứ hai vào và ready, đủ online/ready theo cấu hình hiện hành ⇒ đúng một ván (DEC-035) |
| `T064-09` | Sau start PATCH time ở 066 từ chối; tại 064 kiểm locked persisted time và start snapshot, route integration T066-03. | ⭐ Sau khi ván bắt đầu → **đổi `time_control` BỊ TỪ CHỐI** |
| `T064-10` | Query match_events sau start; đúng 1 START/version 0, không MOVE. | ⭐ Ván tạo xong → có **đúng một** sự kiện `START` version 0 |
| `T064-11` | Hai tab A cùng command/payload; trả 1 receipt; khác payload cùng id COMMAND_ID_REUSED. | Hai tab cùng người cùng bấm → **một** kết quả |
| `T064-12` | B ready offline thật 095, A ready; không có Match; B reconnect phải ready revision mới mới start. | B đã ready rồi offline, A ready ⇒ không tạo ván; B quay lại trước hạn phải ready lại, sau đó đủ online/ready mới tạo một ván |
| `T064-13` | Gửi stale config, ready, membership riêng; STALE_ROOM_CONFIG/STALE_READY, không ghi; false cũng kiểm. | Ready stale theo configRevision/readyRevision/membershipId (sau offline/rejoin) bị từ chối, không tự set true |
| `T064-14` | Swap self/spectator/đúng 30 s/offline/config change bị từ chối; đối thủ accept 29.999 s đổi 2 side, không transient unique error. | Đề nghị đổi bên: chỉ đối thủ accept trước 30 s, đổi hai side nguyên tử; self/spectator/đúng hạn/offline/config change không đổi; ready reset cả hai |
| `T064-15` | 2 swap request barrier; 1PENDING/1PROPOSAL_PENDING; pending chặn ready; cancel/decline/expiry không restore ready. | Hai request swap cùng lúc chỉ một pending; pending chặn ready; cancel/decline không phục hồi ready |



### 10.3 Điểm triển khai cần giữ đúng

```ts
export const readyIntent = {
  commandId: '10000000-0000-4000-8000-000000000001',
  membershipId: '20000000-0000-4000-8000-000000000001',
  expectedConfigRevision: 4, expectedReadyRevision: 7, ready: true,
};
// Fixture phải seed đúng membership/revisions; đổi config lên5 rồi gửi object trên phải đỏ.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **không kiểm expectedConfigRevision hoặc bấm ready 2 lần tạo 2 match**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-064.md`.

```bash
pnpm test:integration -- tests/integration/issue-064.test.ts
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
| `AC-ROOM-02` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |
| `AC-ROOM-03` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |
| `AC-ROOM-06` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |
| `AC-ROOM-21` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |
| `AC-ROOM-23` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |
| `AC-ROOM-24` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |
| `AC-ROOM-25` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |
| `AC-ROOM-26` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |
| `AC-MAT-01` | [REQ-MATCH](../01-requirements/REQ-MATCH.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
