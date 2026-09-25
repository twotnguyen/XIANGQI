# ISSUE-090 — Đồng bộ lại + snapshot

**Nhóm:** E11 · **Phụ thuộc:** 089 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Client lấy lại **trạng thái đầy đủ** bất cứ lúc nào — sau mất mạng, sau xung đột, hoặc định kỳ.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-MATCH.md](../01-requirements/REQ-MATCH.md) §6 ALT-3 · [../05-data-and-realtime/data-flows.md](../05-data-and-realtime/data-flows.md) §13

## 3. PHẠM VI
**✅ LÀM** — dựng snapshot · lệnh đồng bộ · lọc dữ liệu theo vai trò
**❌ KHÔNG LÀM** — giao diện (091)

## 4. FILE TẠO
`apps/server/src/modules/matches/snapshot.service.ts`

## 5. CÁC BƯỚC
1. `MatchSnapshot` gồm đủ: thế cờ · phiên bản · ply · trạng thái · đồng hồ · kết quả · nhánh hiệu lực · đề nghị · **trạng thái treo ván** · presence · trạng thái AI · `serverNowMs`
2. ⭐ **`BR-MAT-14` — LỌC THEO VAI TRÒ.** Snapshot gửi cho client **TUYỆT ĐỐI KHÔNG** chứa:
   - mã bí mật, token
   - email
   - phiên đăng nhập
   - **điểm đánh giá hay đường tính của máy** (mách nước — `BR-AI-31`)
3. **Đồng hồ trong snapshot chiếu tới `serverNowMs`** tại lúc trả:
   - Đặt `runningSinceEpochMs = serverNowMs`
   - ⛔ Đọc snapshot **không** được ghi thay đổi vào cơ sở dữ liệu (`BR-CLK-15`)
4. Client đồng bộ lại khi: vừa kết nối · sau lỗi xung đột phiên bản · thấy phiên bản nhảy cóc · **định kỳ 15 giây** khi đang trong ván
5. Snapshot phiên bản **thấp hơn** hiện tại ⇒ client **bỏ qua**
6. Snapshot **cùng phiên bản** nhưng `serverNowMs` **mới hơn** ⇒ vẫn cập nhật **đồng hồ và presence**
7. Khác `matchId` ⇒ client **reset** trạng thái

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T090-01` | Snapshot chứa đủ mọi trường cần thiết |
| `T090-02` | ⭐ **Snapshot KHÔNG chứa** mã, token, email, phiên |
| `T090-03` | ⭐ **Snapshot KHÔNG chứa** điểm đánh giá của máy khi ván đang chơi |
| `T090-04` | ⭐ **Đọc snapshot KHÔNG ghi gì vào cơ sở dữ liệu** |
| `T090-05` | Đồng hồ chiếu đúng tới `serverNowMs` |
| `T090-06` | Client bỏ qua snapshot **phiên bản cũ hơn** |
| `T090-07` | ⭐ **Cùng phiên bản, `serverNowMs` mới hơn → VẪN cập nhật đồng hồ** |
| `T090-08` | Khác `matchId` → client reset |
| `T090-09` | ⭐ **Người xem nhận snapshot GIỐNG người chơi** (cùng nội dung ván) |
| `T090-10` | Người không phải thành viên xin snapshot → **FORBIDDEN** |
| `T090-11` | ⭐ **Đồng bộ lại sau mất mạng → dưới 5 giây** |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 11 test xanh
- [ ] **`T090-02`** và **`T090-03`** — kiểm **toàn bộ** nội dung snapshot
- [ ] **`T090-04`** — đọc không ghi
- [ ] **`T090-07`** — không bỏ nhầm đồng hồ mới
- [ ] `T090-11` — đạt mốc 5 giây

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-090.md`

## 9. ⚠ CẠM BẪY
Bỏ qua snapshot **cùng phiên bản** sẽ làm đồng hồ **đứng im** khi không có nước đi mới — người chơi thấy đồng hồ không chạy. `T090-07` bắt đúng lỗi này.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** SnapshotService build(matchId, actorId, nowMs)→MatchSnapshot 011; serverpermission + whitelist DTO, projection clock read-only. Reducer accepts higherVersion; sameversionnewerTime cập nhật clock/presence; differentmatch reset. Snapshot room projection không trao chat/private/media secrets.

**Tiền điều kiện cụ thể:** RealDBmatch với canary email/grant/Auth session/AIevaluation; A/B/S1 authorized/Coutsider; clockprojection 007, socket 084. Full clock timer 092/093 integration sau.

**File kiểm thử:** `tests/integration/issue-090.test.ts` · `tests/unit/issue-090.test.ts`. Giữ tên `T090-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T090-01` | BuildsnapshotACTIVE và terminal; schema 011 parse, mọi trường bắt buộc có giá trị đúng. | Snapshot chứa đủ mọi trường cần thiết |
| `T090-02` | Seed canarytoken/email/session/code nested; serialize toàn DTO và raw socket, không canary/forbidden keys. | ⭐ **Snapshot KHÔNG chứa** mã, token, email, phiên |
| `T090-03` | AI ACTIVE có eval/PV tronginternalstate; snapshot không eval/PV, không mách nước. | ⭐ **Snapshot KHÔNG chứa** điểm đánh giá của máy khi ván đang chơi |
| `T090-04` | Đọc 10 snapshot, captureDB rows/revisions trước/sau; 0 writes từ snapshot service. | ⭐ **Đọc snapshot KHÔNG ghi gì vào cơ sở dữ liệu** |
| `T090-05` | Clock runningSince=t0, balance 10000, now=t0+3000; projected 7000, runningSinceEpochMs=now; DB vẫn 10000/t0. | Đồng hồ chiếu đúng tới `serverNowMs` |
| `T090-06` | Reducer có version 5, nhận 4; giữ position/version 5. | Client bỏ qua snapshot **phiên bản cũ hơn** |
| `T090-07` | Version 5 time 1000→2000; giữ position và update clock/presence, không drop event. | ⭐ **Cùng phiên bản, `serverNowMs` mới hơn → VẪN cập nhật đồng hồ** |
| `T090-08` | Match ID M1→M2 ngay cảM2 version 0; resetboard/pending/history/proposals. | Khác `matchId` → client reset |
| `T090-09` | S1 WATCH join giữa ván qua 073; HTTP/socket snapshot cùng position/version/branch với A/B, không private chat; đáp ứng ngay saujoin. | ⭐ **Người xem nhận snapshot GIỐNG người chơi** (cùng nội dung ván) |
| `T090-10` | OutsiderC và revokedS1 yêu cầu HTTP/socket snapshot; FORBIDDEN/authorityerror, không DTO data. | Người không phải thành viên xin snapshot → **FORBIDDEN** |
| `T090-11` | Ngắt socket, applymove thật bằng A, reconnect B/S1; đo elapsed từ connect→snapshotrender <5000 ms, không sleep business clock. | ⭐ **Đồng bộ lại sau mất mạng → dưới 5 giây** |



### 10.3 Điểm triển khai cần giữ đúng

```ts
export function shouldAcceptSnapshot(current: {matchId:string;version:number;serverNowMs:number}, incoming: {matchId:string;version:number;serverNowMs:number}) {
  return incoming.matchId !== current.matchId || incoming.version > current.version ||
    (incoming.version === current.version && incoming.serverNowMs > current.serverNowMs);
}
// Same-version chỉ cập nhật các trường clock/presence mới; không rollback position.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **spread DBrow hoặc bỏ sameversionsnapshot**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-090.md`.

```bash
pnpm test:integration -- tests/integration/issue-090.test.ts
pnpm test:unit -- tests/unit/issue-090.test.ts
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
| `AC-SPEC-07` | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) | LOCAL |
| `AC-SPEC-17` | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) | LOCAL |
| `AC-BRD-07` | [REQ-BOARD](../01-requirements/REQ-BOARD.md) | LOCAL |
| `AC-BRD-14` | [REQ-BOARD](../01-requirements/REQ-BOARD.md) | LOCAL |
| `AC-MAT-14` | [REQ-MATCH](../01-requirements/REQ-MATCH.md) | LOCAL |
| `AC-MAT-15` | [REQ-MATCH](../01-requirements/REQ-MATCH.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
