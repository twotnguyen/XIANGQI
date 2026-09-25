# ISSUE-089 — Finalizer kết thúc ván

**Nhóm:** E11 · **Phụ thuộc:** 088, 024 · **Trạng thái:** TODO

## 1. MỤC TIÊU
**Một hàm duy nhất** kết thúc ván — mọi nguyên nhân đều đi qua đây, **không ai viết riêng**.

## 2. ĐỌC TRƯỚC
[../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) **§5 `GR-END-05`** · [../01-requirements/REQ-MATCH.md](../01-requirements/REQ-MATCH.md) §9 `BR-MAT-11/12`

## 3. PHẠM VI
**✅ LÀM** — `finalizeMatch()` dùng chung cho **mọi** nguyên nhân
**❌ KHÔNG LÀM** — bộ đếm thời hạn (093, 096, 102)

## 4. FILE TẠO
`apps/server/src/modules/matches/finalizer.ts`

## 5. CÁC BƯỚC
1. ```ts
   finalizeMatch(tx, match, outcome: Outcome, nowMs: number,
                 terminalEvent: TerminalEvent): MatchSnapshot
   ```
   Người gọi **đã giữ khoá** `phòng → ván` (ván với máy: chỉ khoá ván)
2. Hàm làm **đúng những việc này, trong một lần**:
   ```
   ① status = FINISHED hoặc INTERRUPTED (theo GR-END-05)
   ② ended_at = nowMs
   ③ ghi outcome (winner + reason)
   ④ xoá đề nghị đang chờ
   ⑤ tính và DỪNG đồng hồ
   ⑥ version++ ĐÚNG MỘT LẦN
   ⑦ ghi MỘT sự kiện terminal
   ⑧ xoá active_players
   ⑨ ONLINE: room.status = FINISHED, ghi finished_at
   ```
3. ⭐ **`BR-MAT-12`** — nước đi kết thúc ván dùng **CHUNG MỘT** lần tăng phiên bản với chính nước đi đó. **Không** tăng hai lần
4. **Ánh xạ `GR-END-05` — bắt buộc đúng**:
   | Nguyên nhân | Trạng thái | Người thắng |
   |---|---|---|
   | `BOTH_OFFLINE` · `SERVER_RESTART` · `AI_UNAVAILABLE` | **INTERRUPTED** | **null** |
   | `REPETITION` · `AGREED_DRAW` | FINISHED | **null** |
   | `CHECKMATE` · `STALEMATE` · `RESIGN` · `TIMEOUT` · **`INACTIVITY`** · `DISCONNECT` | FINISHED | bên thắng |
5. ⛔ **Mọi** nơi kết thúc ván (087, 093, 096, 102, 104, 105, 121) **PHẢI** gọi hàm này
6. Phát tin và dọn media **sau khi commit**

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T089-01` | ⭐ **Đủ 11 nguyên nhân** ánh xạ đúng trạng thái và người thắng |
| `T089-02` | ⭐ **`INACTIVITY` → FINISHED, đối thủ thắng** |
| `T089-03` | ⭐ **`BOTH_OFFLINE`/`SERVER_RESTART`/`AI_UNAVAILABLE` → INTERRUPTED, KHÔNG AI thắng** |
| `T089-04` | ⭐ **Nước đi kết thúc ván → CHỈ MỘT lần tăng phiên bản** |
| `T089-05` | ⭐ **Chỉ MỘT sự kiện terminal** được ghi |
| `T089-06` | Đề nghị đang chờ bị **xoá** |
| `T089-07` | Đồng hồ **dừng**, giữ số dư cuối |
| `T089-08` | `active_players` được xoá → tạo ván mới được ngay |
| `T089-09` | Ván online → phòng chuyển **đã xong**, có `finished_at` |
| `T089-10` | ⭐ **Gọi finalizer hai lần → chỉ MỘT kết quả được ghi** |
| `T089-11` | ⭐ **Hết giờ và đầu hàng tranh nhau → ĐÚNG MỘT kết quả** |
| `T089-12` | Ván với máy → **không** đụng tới phòng |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 12 test xanh trên PostgreSQL thật
- [ ] **`T089-01`** đủ 11 nguyên nhân
- [ ] **`T089-04`** không tăng phiên bản hai lần
- [ ] **`T089-11`** với rào đồng bộ
- [ ] **Mọi** nơi kết thúc ván gọi hàm này — kiểm bằng tìm kiếm mã nguồn

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-089.md` — bảng 11 nguyên nhân và kết quả tương ứng.

## 9. ⚠ CẠM BẪY
Mỗi nơi tự viết logic kết thúc ván sẽ dẫn tới **ánh xạ khác nhau** — chỗ này `INACTIVITY` cho winner, chỗ kia cho null. Một hàm duy nhất là cách duy nhất giữ nhất quán.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** finalizeMatch(tx, match, outcome, nowMs, terminalEvent)→MatchSnapshot; callerđãlock room→match, AI chỉ match. Một transitionterminal, một version/event; terminalMOVE chia sẻincrement với MOVE. Xoá proposals/active_players, dừng clock, ONLINEroomFINISHED+finished_at, media/broadcastsau commit.

**Tiền điều kiện cụ thể:** 11 reason theoGR-END05, ONLINE/AI, pendingproposal, clocks và active players thật; 2 connectionsbarrier cho 2 terminal causes. Clock arithmetic có contract 007, timer runner 093 chưa cần.

**File kiểm thử:** `tests/integration/issue-089.test.ts`. Giữ tên `T089-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T089-01` | Parameterize 11 reason đúng bảng§5; assertstatus/winner/reason và exact terminal event. | ⭐ **Đủ 11 nguyên nhân** ánh xạ đúng trạng thái và người thắng |
| `T089-02` | INACTIVITY với actor RED không đi; FINISHED winnerBLACK, không INTERRUPTED. | ⭐ **`INACTIVITY` → FINISHED, đối thủ thắng** |
| `T089-03` | BOTH_OFFLINE/SERVER_RESTART/AI_UNAVAILABLE; INTERRUPTED winnerNULL từng case. | ⭐ **`BOTH_OFFLINE`/`SERVER_RESTART`/`AI_UNAVAILABLE` → INTERRUPTED, KHÔNG AI thắng** |
| `T089-04` | Positionmate trong 1 move, callMove+finalizer; versionN→N+1, khôngN+2. | ⭐ **Nước đi kết thúc ván → CHỈ MỘT lần tăng phiên bản** |
| `T089-05` | Queryterminalevents sau mỗi outcome; đúng 1 event, cùng version finalstate. | ⭐ **Chỉ MỘT sự kiện terminal** được ghi |
| `T089-06` | SeedproposalPENDING; finalize; proposal không còn hiệu lực, respond sau bị từ chối. | Đề nghị đang chờ bị **xoá** |
| `T089-07` | Clock còn 10000 ms, runningSince=t0; finalize t0+3000; còn 7000/stopped, đọc sau không giảm. | Đồng hồ **dừng**, giữ số dư cuối |
| `T089-08` | Queryactive_players sau tuần terminal; 0 rows choMatch, actor tạo fixture ván mới được. | `active_players` được xoá → tạo ván mới được ngay |
| `T089-09` | Online terminal; roomFINISHED, current_match_id giữ, finished_at=now. | Ván online → phòng chuyển **đã xong**, có `finished_at` |
| `T089-10` | Callfinalizer lần 2 cùng/khác reason; giữ outcome/version/event đầu tiên, khôngoverwrite. | ⭐ **Gọi finalizer hai lần → chỉ MỘT kết quả được ghi** |
| `T089-11` | Hai terminalattempt TIMEOUT/RESIGN qua 2 connection barrier; 1 winnerrecord/event; endpointintegration 093/104. | ⭐ **Hết giờ và đầu hàng tranh nhau → ĐÚNG MỘT kết quả** |
| `T089-12` | AI terminal room_id NULL; không UPDATE rooms, active_players human được dọn. | Ván với máy → **không** đụng tới phòng |



### 10.3 Điểm triển khai cần giữ đúng

```ts
export const interruptedReasons = new Set(['BOTH_OFFLINE', 'SERVER_RESTART', 'AI_UNAVAILABLE']);
export const drawnReasons = new Set(['REPETITION', 'AGREED_DRAW']);
// Outcome winner=NULL cho hai tập này; mọi decisive reason còn lại dùng bên thắng.
// Mapping không được nằm rải rác ở timeout/resign/disconnect handlers.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **tăng version cả MOVE và finalizer hoặc winner choBOTH_OFFLINE**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-089.md`.

```bash
pnpm test:integration -- tests/integration/issue-089.test.ts
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
| `AC-MAT-13` | [REQ-MATCH](../01-requirements/REQ-MATCH.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
