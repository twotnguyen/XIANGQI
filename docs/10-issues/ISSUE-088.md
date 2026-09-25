# ISSUE-088 — Cây nước đi + nhánh hiệu lực

**Nhóm:** E11 · **Phụ thuộc:** 087 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Quản lý **nhánh hiệu lực** của cây nước đi — nền tảng cho đi lại và đếm lặp đúng.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-MATCH.md](../01-requirements/REQ-MATCH.md) §9 **`BR-MAT-09`, `BR-MAT-10`** · [../05-data-and-realtime/data-model.md](../05-data-and-realtime/data-model.md) §2.8

## 3. PHẠM VI
**✅ LÀM** — tính nhánh hiệu lực · dựng lại thế cờ và bộ đếm lặp từ nhánh
**❌ KHÔNG LÀM** — lệnh đi lại (106)

## 4. FILE TẠO
`apps/server/src/modules/matches/branch.service.ts`

## 5. CÁC BƯỚC
1. `matches` giữ con trỏ tới **nước cuối của nhánh hiệu lực** (`head_move_id`)
2. **Nhánh hiệu lực** = chuỗi từ `head_move_id` **truy ngược** về gốc theo `parent_move_id`
3. Hàm chính:
   ```ts
   getActiveBranch(matchId): Move[]              // từ gốc tới head, ĐÚNG THỨ TỰ
   rebuildPosition(matchId): Position            // initial + áp dụng nhánh hiệu lực
   rebuildRepetitionCounts(matchId): RepetitionCounts   // đếm CHỈ trên nhánh hiệu lực
   ```
4. ⭐ **`BR-MAT-09`** — nước bị đi lại **VẪN CÒN** trong `match_moves`, chỉ **không** nằm trên nhánh hiệu lực. **Không xoá**
5. ⭐ **`BR-MAT-10`** — đếm lặp **CHỈ** trên nhánh hiệu lực. Nhánh đã bỏ **không** tính
6. Đi lại ⇒ chỉ **dời `head_move_id`** về nước cha tương ứng. Đi nước mới ⇒ tạo nhánh mới từ đó

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T088-01` | Chuỗi 10 nước → nhánh hiệu lực trả **đúng 10 nước, đúng thứ tự** |
| `T088-02` | ⭐ **Đi lại 2 nửa nước → nhánh hiệu lực còn 8**, nhưng `match_moves` **vẫn có 10 hàng** |
| `T088-03` | ⭐ **Đi nước MỚI sau khi đi lại → THÀNH CÔNG**, tạo nhánh mới |
| `T088-04` | ⭐ Sau `T088-03`: **hai nước cùng `parent_move_id`** cùng tồn tại |
| `T088-05` | ⭐ **Đếm lặp CHỈ tính nhánh hiệu lực** — nhánh bỏ không tính |
| `T088-06` | ⭐ **Lặp 3 lần trên nhánh đã bỏ → KHÔNG kích hoạt hoà** |
| `T088-07` | `rebuildPosition` cho **đúng** thế cờ hiện tại |
| `T088-08` | Đi lại rồi đi lại tiếp → nhánh hiệu lực đúng |
| `T088-09` | Đi lại về nước đầu ván → nhánh rỗng, thế cờ ban đầu |
| `T088-10` | Ván 50 nước → dựng lại nhanh, có số ms trong báo cáo |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 10 test xanh trên PostgreSQL thật
- [ ] **`T088-03`** — **đây là lỗi F-01 lần trước**
- [ ] **`T088-05`** và **`T088-06`** — **đây là lỗi F-02 lần trước**
- [ ] `T088-02` — không xoá nước bị đi lại
- [ ] `T088-04` — nhiều nhánh cùng tồn tại

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-088.md` — sơ đồ cây nước đi sau khi đi lại và đi nước mới.

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| **Đi nước mới sau khi đi lại LUÔN gây lỗi trùng khoá → lỗi 500** (`F-01`) | `T088-03`, `T088-04` |
| **Đếm lặp tính cả nhánh đã bỏ → báo hoà sai** (`F-02`) | `T088-05`, `T088-06` |

**Đây là issue chứa hai lỗi nghiêm trọng nhất của lần xây dựng trước.** Làm kỹ.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** BranchService getActiveBranch(matchId)→Promise<Move[]> root→head; rebuildPosition/rebuildRepetitionCounts chỉ active chain. Dữ liệu 038 cho siblings cùng parent; headNULL là initial. Không endpoint undo 106 trong issue này; fixture đổi head có chủ đích để test thuật toán.

**Tiền điều kiện cụ thể:** Cây root→m 1…m 10, headm 10; branch khác m 8→n 9; position fixture mọi move đã qua rules, count hash gồm turn.

**File kiểm thử:** `tests/integration/issue-088.test.ts` · `tests/unit/issue-088.test.ts`. Giữ tên `T088-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T088-01` | Headm 10, query activebranch; IDs đúngm 1…m 10 theo thứ tự. | Chuỗi 10 nước → nhánh hiệu lực trả **đúng 10 nước, đúng thứ tự** |
| `T088-02` | Fixture dờiheadm 8, gọi branch; length 8 trong khi DB tổng 10, không DELETE. | ⭐ **Đi lại 2 nửa nước → nhánh hiệu lực còn 8**, nhưng `match_moves` **vẫn có 10 hàng** |
| `T088-03` | Từheadm 8 dùng move hợp lệ khác thànhn 9; INSERT thành công, headn 9, không unique parent error. | ⭐ **Đi nước MỚI sau khi đi lại → THÀNH CÔNG**, tạo nhánh mới |
| `T088-04` | Query childrenm 8; m 9 vàn 9 cùng tồn tại, immutableoldbranch. | ⭐ Sau `T088-03`: **hai nước cùng `parent_move_id`** cùng tồn tại |
| `T088-05` | Abandonedbranch chứa repeatedhash; count active chain bỏ các node abandoned. | ⭐ **Đếm lặp CHỈ tính nhánh hiệu lực** — nhánh bỏ không tính |
| `T088-06` | Tạo 3 lần hash chỉ trên nhánh đã bỏ; rebuildCounts dưới 3, detectend không REPETITION. | ⭐ **Lặp 3 lần trên nhánh đã bỏ → KHÔNG kích hoạt hoà** |
| `T088-07` | Apply active moves từ initial độc lập oracle 023; position so 90 squares+turn đúng. | `rebuildPosition` cho **đúng** thế cờ hiện tại |
| `T088-08` | Dờiheadm 10→m 8→m 6; branches 10→8→6, rowcount không giảm. | Đi lại rồi đi lại tiếp → nhánh hiệu lực đúng |
| `T088-09` | HeadNULL; branch[], positioninitial, repetition initial count theo 025. | Đi lại về nước đầu ván → nhánh rỗng, thế cờ ban đầu |
| `T088-10` | 50 legal moves fixture; đo performance.now quanhquery/rebuild, ghi ms thật không tự đặt/hạ SLO. | Ván 50 nước → dựng lại nhanh, có số ms trong báo cáo |



### 10.3 Điểm triển khai cần giữ đúng

```sql
WITH RECURSIVE active AS (
 SELECT m.*, 0 AS distance_from_head FROM match_moves m JOIN matches g ON g.head_move_id=m.id WHERE g.id=$1
 UNION ALL
 SELECT p.*, c.distance_from_head + 1 FROM match_moves p JOIN active c ON c.parent_move_id=p.id
 WHERE p.match_id=$1
)
SELECT * FROM active ORDER BY distance_from_head DESC;
-- $1 là match UUID; thứ tự lấy từ độ sâu CTE, không cần cột ply trên match_moves.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **SELECT tất cả moves ORDER BY created_at hoặc xoá abandoned rows**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-088.md`.

```bash
pnpm test:integration -- tests/integration/issue-088.test.ts
pnpm test:unit -- tests/unit/issue-088.test.ts
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

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
