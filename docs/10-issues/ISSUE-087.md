# ISSUE-087 — Đi nước + phiên bản + sự kiện

**Nhóm:** E11 · **Phụ thuộc:** 086, 023 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Lệnh đi nước hoàn chỉnh — **máy chủ phân xử**, tăng phiên bản, ghi sự kiện, phát cho cả phòng.

## 2. ĐỌC TRƯỚC
[../05-data-and-realtime/data-flows.md](../05-data-and-realtime/data-flows.md) **§2** · [../01-requirements/REQ-MATCH.md](../01-requirements/REQ-MATCH.md) §5, §9

## 3. PHẠM VI
**✅ LÀM** — lệnh đi nước qua cả HTTP và thời gian thực
**❌ KHÔNG LÀM** — kết thúc ván (089) · đồng hồ (092)

## 4. FILE TẠO
`apps/server/src/modules/matches/move.service.ts`

## 5. CÁC BƯỚC
1. Dùng khung xử lý lệnh ở issue 085 — **không** viết đường riêng
2. **`BR-MAT-04`** — máy chủ **luôn** phân xử lại bằng `validateMove` từ package luật. **Không** tin client
3. Sau khi áp dụng:
   ```
   ① INSERT match_moves (parent_move_id = nước cuối của nhánh hiệu lực)
   ② version++
   ③ INSERT match_events (type='MOVE', version mới)
   ④ cập nhật ply · thế cờ · lượt
   ⑤ RESET mốc treo ván cho bên mới đến lượt     ← R17
   ```
4. **Phát cho CẢ PHÒNG**: 2 người chơi + toàn bộ người xem (`data-flows` §2)
5. **Bị từ chối** ⇒ **chỉ** người gửi nhận lỗi. Người khác **không nhận gì** — vì không có gì thay đổi
6. **`DEC-020`** — **mọi tab** của người chơi đều gửi được. Xung đột do kiểm lượt + phiên bản xử lý

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T087-01` | Nước hợp lệ → **đúng một** hàng `match_moves` và **đúng một** lần tăng phiên bản |
| `T087-02` | ⭐ **Đúng một** sự kiện `MOVE` với phiên bản mới |
| `T087-03` | ⭐ **Cả phòng nhận trạng thái mới**: 2 người chơi + 5 người xem |
| `T087-04` | ⭐ **Nước sai luật → KHÔNG ĐỔI GÌ trong cơ sở dữ liệu** |
| `T087-05` | ⭐ **Sai lượt → từ chối**, chỉ người gửi nhận lỗi |
| `T087-06` | ⭐ **Người xem gửi nước đi (giả mạo) → FORBIDDEN** |
| `T087-07` | Nước bị từ chối → người khác **không nhận** sự kiện nào |
| `T087-08` | ⭐ **Gửi qua HTTP và qua thời gian thực → cùng kết quả** |
| `T087-09` | ⭐ **Hai tab cùng người gửi ĐỒNG THỜI → ĐÚNG MỘT nước** |
| `T087-10` | `parent_move_id` trỏ đúng nước cuối của nhánh hiệu lực |
| `T087-11` | ⭐ **Đi nước → mốc treo ván RESET** |
| `T087-12` | Ván đã kết thúc → từ chối |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 12 test xanh trên PostgreSQL thật
- [ ] **`T087-04`** kiểm **dữ liệu**, không chỉ phản hồi
- [ ] **`T087-09`** với rào đồng bộ
- [ ] **`T087-06`** chặn giả mạo
- [ ] `T087-03` cả phòng nhận cùng lúc

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-087.md`

## 9. ⚠ CẠM BẪY
Tin client gửi *"nước này hợp lệ"* mà không phân xử lại là lỗ hổng gian lận cơ bản nhất. `BR-MAT-04` yêu cầu máy chủ **luôn** chạy `validateMove` — `T087-04` và `T087-06` kiểm điều này.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** MoveService dùng pipeline 085/receipts 086 + validateMove 023; accepted move ghi parent=head, position/ply/turn/version, event/receipt cùng transaction. Reset inactivity mốc cho bên mới; broadcaster 084 sau commit toàn room, rejection riêng actor.

**Tiền điều kiện cụ thể:** Match ACTIVE initial 012 RED turn, room 2 PLAYER/5 SPECTATOR+tabA2; HTTP/socket clients thật. Legal(0, 6)→(0, 5); illegal(0, 6)→(0, 4); expectedVersion 0.

**File kiểm thử:** `tests/integration/issue-087.test.ts`. Giữ tên `T087-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T087-01` | A đi Tốt 0, 6→0, 5; one move row, head mới, ply 1, turnBLACK, version 1. | Nước hợp lệ → **đúng một** hàng `match_moves` và **đúng một** lần tăng phiên bản |
| `T087-02` | Query match_events; một MOVE version 1 cùng transaction, không duplicate khi retry. | ⭐ **Đúng một** sự kiện `MOVE` với phiên bản mới |
| `T087-03` | 8 sockets (A2 tabs/B/5 SPECTATOR); tất cả nhận cùng match/version/position sau commit. | ⭐ **Cả phòng nhận trạng thái mới**: 2 người chơi + 5 người xem |
| `T087-04` | A gửi Tốt 0, 6→0, 4; compare DB position/head/ply/version/event/receipt trước/sau không đổi. | ⭐ **Nước sai luật → KHÔNG ĐỔI GÌ trong cơ sở dữ liệu** |
| `T087-05` | B gửi khi RED turn; bị từ chối, chỉ B ACK lỗi. | ⭐ **Sai lượt → từ chối**, chỉ người gửi nhận lỗi |
| `T087-06` | S1 raw HTTP và socket MOVE giả actorId/rolePLAYER; FORBIDDEN hoặc strictvalidation, không mutation. | ⭐ **Người xem gửi nước đi (giả mạo) → FORBIDDEN** |
| `T087-07` | Theo dõi packets A/B/S1 khi invalid move; không room state/event mới, actor nhận lỗi. | Nước bị từ chối → người khác **không nhận** sự kiện nào |
| `T087-08` | Hai fixture giống nhau, send viaHTTP/socket; snapshot/event rows giống, không logic riêng. | ⭐ **Gửi qua HTTP và qua thời gian thực → cùng kết quả** |
| `T087-09` | A1/A2 cùng version với 2 commandId khác và barrier; đúng 1 move, lệnh còn lại conflict/turn theo pipeline. | ⭐ **Hai tab cùng người gửi ĐỒNG THỜI → ĐÚNG MỘT nước** |
| `T087-10` | Seed branch có head hợp lệ; move mới parent_move_id=head cũ, không max(ply) nhánh đã bỏ. | `parent_move_id` trỏ đúng nước cuối của nhánh hiệu lực |
| `T087-11` | Seed inactivity mốc trước move; accepted move reset cho bên mới đến lượt; invalidmove không reset; đầy đủ timer 102 kiểm sau. | ⭐ **Đi nước → mốc treo ván RESET** |
| `T087-12` | FINISHED/INTERRUPTED fixture; MOVE bị từ chối, outcome/head/version không đổi. | Ván đã kết thúc → từ chối |



### 10.3 Điểm triển khai cần giữ đúng

```ts
export const legalRedPawnMove = {
  from: { x: 0, y: 6 }, to: { x: 0, y: 5 },
};
// Gói trong MatchCommand MOVE của011 với matchId,commandId,expectedVersion từ fixture.
// Không gửi position/turn/winner/clientValid: server tính từ position đã lock.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **bỏ validateMove hoặc gửi lỗi từ chối cho cả room**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-087.md`.

```bash
pnpm test:integration -- tests/integration/issue-087.test.ts
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
| `AC-MAT-02` | [REQ-MATCH](../01-requirements/REQ-MATCH.md) | LOCAL |
| `AC-MAT-03` | [REQ-MATCH](../01-requirements/REQ-MATCH.md) | LOCAL |
| `AC-MAT-06` | [REQ-MATCH](../01-requirements/REQ-MATCH.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
