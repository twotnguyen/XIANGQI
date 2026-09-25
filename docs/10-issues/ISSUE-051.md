# ISSUE-051 — Đăng xuất thiết bị này / mọi thiết bị

**Nhóm:** E05 · **Phụ thuộc:** 050 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Đăng xuất thu hồi phiên ứng dụng/Auth thật và tạo công việc ngắt bền vững; realtime/media được nghiệm thu tích hợp tại ISSUE-084/117 khi các thành phần đó tồn tại.

## 2. ĐỌC TRƯỚC
[../05-data-and-realtime/session-state.md](../05-data-and-realtime/session-state.md) §2.2 `SS-02` · [../01-requirements/REQ-AUTH.md](../01-requirements/REQ-AUTH.md) §5.5

## 3. PHẠM VI
**✅ LÀM** — endpoint 2 phạm vi · chặn phiên DB/provider · job thu hồi bền vững; tích hợp đóng socket/media tại 084/117
**❌ KHÔNG LÀM** — quên mật khẩu (052)

## 4. FILE TẠO
`apps/server/src/auth/logout.controller.ts` · `revoked-sessions.service.ts`

**Hợp đồng đã chốt:** [auth-provider-config](../09-technical/auth-provider-config.md) §4–6, DEC-040; không coi SDK mặc định là bằng chứng vòng đời/thu hồi.

## 5. CÁC BƯỚC
1. `POST /api/v1/auth/logout` nhận `{ scope: 'CURRENT' | 'ALL' }`
2. **Luồng ở máy chủ**:
   ```
   ① transaction chặn app_sessions trong scope và ghi job bền vững
   ② ngoài transaction gọi Auth thu hồi; lỗi vẫn giữ fence + retry
   ③ xác nhận Auth + hoàn tất job của thành phần đã có
   ④ khi tích hợp gateway/media: chỉ báo hoàn tất toàn bộ khi các bước đó xác nhận (084/117)
   ```
3. Bản ghi thu hồi giữ theo auth-provider-config §6: Auth không thể refresh và JWT cũ hết hạn mới dọn; job pending không được dọn bằng hạn cố định
4. **Không** dựa vào việc trình duyệt tự gọi đăng xuất để bảo vệ máy chủ
5. Sau khi máy chủ báo thành công, trình duyệt gọi đăng xuất phía thư viện và **luôn xoá trạng thái giao diện** — kể cả khi lần gọi thứ hai báo phiên đã bị thu hồi
6. Thu hồi ở máy chủ lỗi ⇒ **không** báo hoàn thành, cho thử lại

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T051-01` | Đăng xuất `CURRENT` → token đó **không dùng được nữa** |
| `T051-02` | Đăng xuất `CURRENT` → token ở **thiết bị khác vẫn dùng được** |
| `T051-03` | ⭐ Đăng xuất `ALL` → **mọi** token của tài khoản **đều bị từ chối** |
| `T051-04` | ALL ghi job media thu hồi bền vững đúng phạm vi; không dùng mock RTP làm bằng chứng. Luồng thật kiểm TS-MED-14 |
| `T051-05` | ALL ghi job ngắt mọi kết nối đúng phiên; socket thật kiểm tại ISSUE-084, media tại117 |
| `T051-06` | Thu hồi ở máy chủ lỗi → **không** báo thành công |
| `T051-07` | Predicate kiểm session cho gateway từ chối revoked; socket tích hợp thật kiểm ISSUE-084, không báo đã nghiệm thu gateway tại051 |
| `T051-08` | Bản ghi thu hồi giữ đủ thời hạn rồi mới dọn |
| `T051-09` | Auth revoke lỗi sau DB commit: phiên vẫn bị chặn, không báo hoàn thành; restart/retry đúng operation. |
| `T051-10` | CURRENT với các tab cùng auth_session_id chặn tất cả bản copy; các phiên độc lập vẫn dùng được; tombstone không bị dọn khi Auth job pending. |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 10 test xanh trên Supabase Auth thật
- [ ] **`T051-03/04`** — DB/provider revoke và job bền vững thật; realtime/media hoàn tất tại084/117
- [ ] `T051-07` kiểm predicate bằng DB thật; không nhận là bằng chứng socket khi084 chưa có
- [ ] `T051-06` chứng minh không báo thành công giả

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-051.md`

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| Hàm ghi nhận phiên bị thu hồi **tồn tại nhưng không ai gọi** (`F-22`) | `T051-03`, `T051-07` |
| Đăng xuất chỉ xoá trạng thái giao diện, token vẫn dùng được | `T051-01` dùng token cũ sau khi đăng xuất |

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** POST /auth/logout scope CURRENT|ALL; operation_id bất biến và target_auth_session_ids snapshot tại commit theo auth-provider-config§6. DB revoke+job trước provider call; retry dùng cùng operation, không suy lại CURRENT từ phiên caller. Trả trạng thái pending khi Auth/transport chưa xác nhận.

**Tiền điều kiện cụ thể:** A có session A1/A2/A3; A1 copy 2 tab; B khác user; job worker dùng DB thật, failure injection ở adapter mạng ngoài transaction.

**File kiểm thử:** `tests/integration/issue-051.test.ts`. Giữ tên `T051-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T051-01` | CURRENT từ A1, dùng JWT cũ gọi protected; bị chặn từ commit. | Đăng xuất `CURRENT` → token đó **không dùng được nữa** |
| `T051-02` | CURRENT A1 rồi A2 gọi /me; A2 còn hợp lệ. | Đăng xuất `CURRENT` → token ở **thiết bị khác vẫn dùng được** |
| `T051-03` | ALL A, thử A1/A2/A3 và B; A bị chặn, B không đổi. | ⭐ Đăng xuất `ALL` → **mọi** token của tài khoản **đều bị từ chối** |
| `T051-04` | Đọc auth_security_jobs sau ALL; scope/target IDs/cutoff chính xác và media chưa xác nhận không APPLIED. | ALL ghi job media thu hồi bền vững đúng phạm vi; không dùng mock RTP làm bằng chứng. Luồng thật kiểm TS-MED-14 |
| `T051-05` | Job ngắt socket chứa đúng tập session snapshot; server restart đọc được cùng job; delivery thật 084 T084-12. | ALL ghi job ngắt mọi kết nối đúng phiên; socket thật kiểm tại ISSUE-084, media tại 117 |
| `T051-06` | Gây provider revoke lỗi thật qua ngắt đường mạng adapter; UI pending/thử lại, không hoàn thành. | Thu hồi ở máy chủ lỗi → **không** báo thành công |
| `T051-07` | Gọi predicate bằng identity A1 sau revoke; false; gateway thật ở 084 dùng lại predicate. | Predicate kiểm session cho gateway từ chối revoked; socket tích hợp thật kiểm ISSUE-084, không báo đã nghiệm thu gateway tại 051 |
| `T051-08` | Chạy cleanup khi JWT còn hạn/Auth job pending; tombstone còn; chỉ dọn sau cả hai điều kiện đạt. | Bản ghi thu hồi giữ đủ thời hạn rồi mới dọn |
| `T051-09` | DB commit xong, provider call lỗi; restart worker/retry operation; target IDs không đổi, A1 không hồi sinh. | Auth revoke lỗi sau DB commit: phiên vẫn bị chặn, không báo hoàn thành; restart/retry đúng operation. |
| `T051-10` | CURRENT A1 chặn cả 2 bản copy; A2 độc lập sống; retry cùng operation từ context khác không đổi target. | CURRENT với các tab cùng auth_session_id chặn tất cả bản copy; các phiên độc lập vẫn dùng được; tombstone không bị dọn khi Auth job pending. |



### 10.3 Điểm triển khai cần giữ đúng

```sql
-- Audit payload của một operation: $1 là operation_id UUID từ response logout.
SELECT operation_id, scope, target_auth_session_ids, revocation_cutoff
FROM auth_security_jobs WHERE operation_id = $1;
-- Đối chiếu với tập session đã đọc trước commit, không chép token vào bằng chứng.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **đánh APPLIED ngay khi enqueue, hoặc CURRENT nhầm revoke mọi session user**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-051.md`.

```bash
pnpm test:integration -- tests/integration/issue-051.test.ts
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
