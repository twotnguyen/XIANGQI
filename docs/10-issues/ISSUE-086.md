# ISSUE-086 — Biên lai lệnh chống gửi trùng

**Nhóm:** E11 · **Phụ thuộc:** 085 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Gửi lại cùng một lệnh (do mạng chập chờn) **không** gây hậu quả hai lần.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-MATCH.md](../01-requirements/REQ-MATCH.md) §9 **`BR-MAT-06`, `BR-MAT-07`** · [ISSUE-039.md](ISSUE-039.md)

## 3. PHẠM VI
**✅ LÀM** — băm nội dung chuẩn hoá · tra biên lai · trả kết quả cũ
**❌ KHÔNG LÀM** — lệnh cụ thể (087+)

## 4. FILE TẠO
`apps/server/src/modules/matches/receipt.service.ts`

## 5. CÁC BƯỚC
1. **Băm nội dung chuẩn hoá** — chép đúng:
   ```
   payloadHash = SHA256( JSON chuẩn hoá của { type, expectedVersion, payload } )
   ```
   - Khoá object **sắp xếp** trước khi chuỗi hoá ⇒ cùng nội dung luôn ra cùng băm
   - ⭐ **`type` PHẢI nằm trong băm** — nếu không, `RESIGN {}` sẽ trùng `UNDO_AI {}`
2. **Ba trường hợp**:
   | Tình huống | Xử lý |
   |---|---|
   | Chưa có biên lai | Xử lý bình thường, ghi biên lai |
   | Có biên lai, **cùng băm** | Trả `appliedVersion` **gốc** + **trạng thái HIỆN TẠI** đọc từ cơ sở dữ liệu |
   | Có biên lai, **khác băm** | Trả **`COMMAND_ID_REUSED`** |
3. ⭐ Khi trả lại kết quả cũ: `appliedVersion` là **phiên bản gốc**, nhưng trạng thái là **mới nhất**
   > Ván có thể đã tiến triển ⇒ trạng thái có phiên bản **cao hơn** `appliedVersion` là **bình thường**
4. **Không** trả lại số dư đồng hồ đã lưu từ lần đầu — phải đọc mới

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T086-01` | ⭐ **Gửi lại CÙNG lệnh → trả kết quả cũ, KHÔNG đi hai nước** |
| `T086-02` | ⭐ **Cùng mã lệnh, KHÁC nội dung → `COMMAND_ID_REUSED`** |
| `T086-03` | ⭐ **`RESIGN {}` và `UNDO_AI {}` cho BĂM KHÁC NHAU** |
| `T086-04` | Khoá object **đảo thứ tự** → **cùng băm** |
| `T086-05` | ⭐ **Trả lại kết quả cũ: `appliedVersion` gốc, trạng thái MỚI NHẤT** |
| `T086-06` | ⭐ **Đồng hồ trong trạng thái trả về là số MỚI**, không phải số đã lưu |
| `T086-07` | Cùng mã lệnh, **khác ván** → xử lý bình thường |
| `T086-08` | Cùng mã lệnh, **khác người gửi** → xử lý bình thường |
| `T086-09` | ⭐ **Gửi 3 lần liên tiếp → ghi ĐÚNG MỘT nước** |
| `T086-10` | Gửi lại sau khi ván đã tiến triển → trạng thái có phiên bản cao hơn, **không** lỗi |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 10 test xanh trên PostgreSQL thật
- [ ] **`T086-03`** — `type` nằm trong băm
- [ ] **`T086-05`** và **`T086-06`** — phiên bản gốc, trạng thái mới
- [ ] **`T086-09`** — gửi nhiều lần chỉ một kết quả
- [ ] Băm **tất định** với khoá đảo thứ tự

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-086.md`

## 9. ⚠ CẠM BẪY
Trả lại **số dư đồng hồ đã lưu từ lần đầu** khiến người chơi **được hoàn thời gian** mỗi lần mạng chập chờn — lỗ hổng gian lận. Phải đọc trạng thái **mới nhất** từ cơ sở dữ liệu.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** Receipt key(matchId, actorId, commandId); canonical hash cả{type, payload}, object key sort recursive, array order giữ. Same hash trả appliedVersion gốc + snapshot hiện tại/clock projected; khác hash COMMAND_ID_REUSED. Kiểm quyền hiện tại trước replay receipt.

**Tiền điều kiện cụ thể:** DB receipts 039 + pipeline 085, clock t0/t0+5 s, fixture matchversion 0→1→2; commandID UUID cố định mỗi case. Actual MOVE integration T087 và timeout 093.

**File kiểm thử:** `tests/integration/issue-086.test.ts` · `tests/unit/issue-086.test.ts`. Giữ tên `T086-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T086-01` | Gọi cùng command 3 lần qua pipeline callback mutation; DB mutation/event/receipt đúng 1, result reused true. | ⭐ **Gửi lại CÙNG lệnh → trả kết quả cũ, KHÔNG đi hai nước** |
| `T086-02` | Cùng key đổi from/to hoặc type; COMMAND_ID_REUSED, version không đổi lần 2. | ⭐ **Cùng mã lệnh, KHÁC nội dung → `COMMAND_ID_REUSED`** |
| `T086-03` | Hash RESIGN payload{} và UNDO_AI payload{}; hai digest khác. | ⭐ **`RESIGN {}` và `UNDO_AI {}` cho BĂM KHÁC NHAU** |
| `T086-04` | Object nested có keys đảo thứ tự; digest bằng; array đảo phần tử phải khác. | Khoá object **đảo thứ tự** → **cùng băm** |
| `T086-05` | Receipt appliedVersion 1, DB đã version 2; replay trả appliedVersion 1 và snapshot.version 2. | ⭐ **Trả lại kết quả cũ: `appliedVersion` gốc, trạng thái MỚI NHẤT** |
| `T086-06` | Advance clock 5 s rồi replay; projected balance giảm 5 s, DB clock không bị ghi lại vì snapshot. | ⭐ **Đồng hồ trong trạng thái trả về là số MỚI**, không phải số đã lưu |
| `T086-07` | Cùng commandId/actor ở hai match khác; mỗi match có 1 receipt độc lập. | Cùng mã lệnh, **khác ván** → xử lý bình thường |
| `T086-08` | Cùng match/commandId nhưng actorA/B; key actor tách, permission vẫn kiểm trước apply. | Cùng mã lệnh, **khác người gửi** → xử lý bình thường |
| `T086-09` | Gửi 3 lần tuần tự và thêm 2 concurrent barrier; query đúng 1 mutation/receipt. | ⭐ **Gửi 3 lần liên tiếp → ghi ĐÚNG MỘT nước** |
| `T086-10` | DB tiến triển nhiều version rồi retry; không VERSION_CONFLICT chỉ vì expectedVersion cũ nếu receipt match, nhưng không bỏ authority check. | Gửi lại sau khi ván đã tiến triển → trạng thái có phiên bản cao hơn, **không** lỗi |



### 10.3 Điểm triển khai cần giữ đúng

```ts
export function canonical(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    const encoded = JSON.stringify(value);
    if (encoded === undefined) throw new Error('NON_JSON_PAYLOAD');
    return encoded;
  }
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  const row = value as Record<string, unknown>;
  return '{' + Object.keys(row).sort().map(k => JSON.stringify(k)+':'+canonical(row[k])).join(',') + '}';
}
// Chỉ nhận JSON hợp lệ do schema011; băm canonical({type,payload}), không payload đơn lẻ.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **hash chỉ payload hoặc trả snapshot/clock lưu trong receipt**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-086.md`.

```bash
pnpm test:integration -- tests/integration/issue-086.test.ts
pnpm test:unit -- tests/unit/issue-086.test.ts
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
| `AC-MAT-04` | [REQ-MATCH](../01-requirements/REQ-MATCH.md) | LOCAL |
| `AC-MAT-05` | [REQ-MATCH](../01-requirements/REQ-MATCH.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
