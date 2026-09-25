# ISSUE-050 — Phiên + ghi nhớ đăng nhập 30 ngày

**Nhóm:** E05 · **Phụ thuộc:** 049 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Thực hiện chính sách phiên đăng nhập theo `DEC-007/037/038`.

## 2. ĐỌC TRƯỚC
[../05-data-and-realtime/session-state.md](../05-data-and-realtime/session-state.md) **§2** · [../07-decisions/decision-log.md](../07-decisions/decision-log.md) `DEC-007/037/038` · [../01-requirements/REQ-AUTH.md](../01-requirements/REQ-AUTH.md) `BR-AUTH-18/19`, `AC-AUTH-10/15…19`

## 3. PHẠM VI
**✅ LÀM** — checkbox ghi nhớ · 2 chế độ phiên · kiểm hạn/gia hạn tại server
**❌ KHÔNG LÀM** — đăng xuất (051)

## 4. FILE TẠO
`apps/web/src/lib/supabase.ts` · `apps/web/src/features/auth/session.ts` · `apps/server/src/auth/app-session.service.ts` theo contract/schema auth-provider-config §4

**Hợp đồng đã chốt:** [auth-provider-config](../09-technical/auth-provider-config.md) §4–6, DEC-040; không coi SDK mặc định là bằng chứng vòng đời/thu hồi.

## 5. CÁC BƯỚC
1. Màn đăng nhập có checkbox **"Ghi nhớ đăng nhập"**, **mặc định được tick**
2. Hai chế độ lưu:
   | Lựa chọn | Nơi lưu | Hệ quả |
   |---|---|---|
   | **Tick** | lưu trữ lâu dài của trình duyệt | Phiên 30 ngày trượt theo hoạt động; mở lại còn đăng nhập chỉ khi chưa hết hạn/thu hồi |
   | **Bỏ tick** | cách ly **theo tab** | Reload giữ phiên hợp lệ; tab mới thông thường login; restore/duplicate có thể copy phiên còn hạn. Server giới hạn 30 phút nhàn rỗi/12 giờ tuyệt đối |
3. Làm mới token ngầm chỉ trong phiên ứng dụng còn hợp lệ; không được vượt hạn ứng dụng, hồi sinh phiên hoặc bỏ kiểm thu hồi. Hết phiên phải yêu cầu đăng nhập lại.
4. **Trượt 30 ngày** theo BR-AUTH-19: hoạt động chủ động gia hạn phiên đó. Heartbeat, token refresh, tự reconnect, tải/nhận dữ liệu nền không gia hạn. Máy chủ kiểm hạn bằng thời gian máy chủ trước gia hạn; không tin deadline do client gửi.
5. Phiên ghi nhớ hết hạn 30 ngày không hoạt động ⇒ đăng nhập lại, kể cả token kỹ thuật vẫn còn hạn. Kiểm cả HTTP/realtime; phiên độc lập khác không tự được gia hạn.
6. Dữ liệu xác thực phía client lưu theo chế độ đã chọn ở bước 2; không đưa token vào địa chỉ trang, log hoặc `document.cookie` (T050-07). Không coi tên cơ chế lưu trữ là bằng chứng phân biệt reload với khôi phục tab đã đóng.
7. Giao diện giải thích vòng đời checkbox theo SCR-LOGIN.
8. Thi hành AUTH-TIME-01/02 và AUTH-STORE-01: unique auth_session_id, storage cách ly chế độ, hạn server, đóng bằng logout có bảo đảm; không dùng browser close như bằng chứng tuyệt đối. DEC-040 sửa cam kết restore của DEC-037, giữ reload và DEC-038. Luật mất kết nối ván không đổi.

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T050-01` | Tick → đóng/mở lại browser: vẫn đăng nhập nếu phiên còn hạn/chưa bị thu hồi |
| `T050-02` | Bỏ tick → tab trống login; browser restore/duplicate ghi kết quả thực từng browser, có thể giữ phiên còn hạn; logout hoặc hết hạn luôn chặn |
| `T050-03` | Checkbox **mặc định được tick** |
| `T050-04` | Token kỹ thuật hết hạn, phiên ứng dụng còn hợp lệ → làm mới ngầm; deadline ứng dụng không tự dời |
| `T050-05` | Đồng hồ giả: không hoạt động 31 ngày → **yêu cầu đăng nhập lại** |
| `T050-06` | Đồng hồ giả: mở trang/đi cờ/gửi chat chủ động ở ngày 29 → phiên đó thêm đủ 30 ngày; không gia hạn phiên độc lập khác |
| `T050-07` | ⭐ Token **không** xuất hiện trong địa chỉ trang, log, hay `document.cookie` |
| `T050-08` | Giao diện giải thích rõ phiên theo tab và 30 ngày từ hoạt động chủ động |
| `T050-09` | Không ghi nhớ: reload giữ phiên; link mở tab của app có noopener, không sao chép storage; browser duplicate là ngoại lệ đã ghi rõ |
| `T050-10` | Hai tab đăng nhập phiên tạm độc lập, đóng A thì B còn hợp lệ và thao tác được; không đăng xuất cả tài khoản |
| `T050-11` | Đồng hồ giả: chỉ heartbeat/refresh/reconnect/tải nền/nhận sự kiện trong 30 ngày không dời deadline; tới hạn phải đăng nhập |
| `T050-12` | Phiên ứng dụng hết hạn nhưng token kỹ thuật còn hạn: HTTP và realtime bị chặn, hoạt động muộn không hồi sinh phiên |
| `T050-13` | TEMPORARY đúng 30 phút nhàn rỗi hoặc 12 giờ tuyệt đối ⇒ chặn trước gia hạn; hoạt động trước hạn kéo idle nhưng không vượt absolute. |
| `T050-14` | Hai activity đồng thời không rút ngắn hạn; request nền không gọi activity; đăng ký/replay/refresh không đổi mode, tạo lại hoặc hồi sinh phiên. |
| `T050-15` | Storage remembered/temporary không tự fallback lẫn nhau; browser restore cùng session CURRENT logout chặn hết bản copy, phiên đăng nhập độc lập vẫn hợp lệ. |
| `T050-16` | Bootstrap trì hoãn: deadline khởi tạo từ sign_in_at của helper, không thời điểm nhận request. Đúng/sau idle ban đầu bị từ chối; replay bootstrap không đặt lại last_active hoặc deadline. |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 16 test xanh
- [ ] **`T050-02`** chứng minh giới hạn restore được mô tả trung thực và server chặn sau logout/hết hạn
- [ ] `T050-06` chứng minh **trượt**, không phải hết hạn cứng
- [ ] **`T050-07`** chứng minh token không rò
- [ ] Checkbox mặc định tick
- [ ] `T050-02/09/10` dùng trình duyệt thật, có ca khôi phục tab; không thay đóng tab bằng reload
- [ ] `T050-11/12` kiểm server bằng đồng hồ giả; không chỉ ẩn UI. Bằng chứng phải phân biệt hạn token với hạn phiên ứng dụng

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-050.md`

## 9. ⚠ CẠM BẪY
Đây là ứng dụng **có camera và mic**. Phiên bị người khác dùng trên máy chung nghiêm trọng hơn ứng dụng thường — họ bật được camera **dưới danh nghĩa chủ tài khoản**. Checkbox là lối thoát cho người dùng máy phòng máy.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** AppSessionService nhận identity từ JWT verify, mode và clock server; dùng sign_in_at từ helper 043. REMEMBERED idle 30 d, TEMPORARY idle 30 m/absolute 12 h; kiểm now<deadline trước gia hạn. Client storage remembered/temporary tách namespace, temporary sessionStorage không broadcast auth cross-tab; noopener. Activity không nhận deadline từ client.

**Tiền điều kiện cụ thể:** Auth thật, mỗi session có UUID khác; clock t0=2026-09-22T00:00:00Z; Chromium/Firefox/WebKit ghi phiên bản thực; sessionStorage restore là phép đo, không cam kết đóng tab logout.

**File kiểm thử:** `tests/integration/issue-050.test.ts` · `tests/e2e/issue-050.spec.ts` · `tests/unit/issue-050.test.ts`. Giữ tên `T050-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T050-01` | Remembered login, đóng/mở persistent browser profile còn hạn; xác minh /me thay vì chỉ UI. | Tick → đóng/mở lại browser: vẫn đăng nhập nếu phiên còn hạn/chưa bị thu hồi |
| `T050-02` | Temporary login rồi mở tab trống/duplicate/restore; ghi ma trận từng browser; advance tới hạn thì mọi bản copy bị chặn. | Bỏ tick → tab trống login; browser restore/duplicate ghi kết quả thực từng browser, có thể giữ phiên còn hạn; logout hoặc hết hạn luôn chặn |
| `T050-03` | Mở login mới và đọc trạng thái checkbox mặc định. | Checkbox **mặc định được tick** |
| `T050-04` | Refresh token thật trong app_session còn hạn; chụp deadline trước/sau phải bằng nhau. | Token kỹ thuật hết hạn, phiên ứng dụng còn hợp lệ → làm mới ngầm; deadline ứng dụng không tự dời |
| `T050-05` | Clock t0+31 ngày, gọi /me/activity; không gia hạn hay hồi sinh. | Đồng hồ giả: không hoạt động 31 ngày → **yêu cầu đăng nhập lại** |
| `T050-06` | Hai session A1/A2 cùng user; activity hợp lệ A1 ngày 29; idle A1=t_now+30 d, A2 giữ nguyên; command/chat integration tại 087/109. | Đồng hồ giả: mở trang/đi cờ/gửi chat chủ động ở ngày 29 → phiên đó thêm đủ 30 ngày; không gia hạn phiên độc lập khác |
| `T050-07` | Dùng token canary thực: kiểm URL/log/cookie trên login/refresh/logout; không có token. | ⭐ Token **không** xuất hiện trong địa chỉ trang, log, hay `document.cookie` |
| `T050-08` | Đọc copy login và trạng thái hết hạn; khớp AUTH-STORE-01 và SCR-LOGIN. | Giao diện giải thích rõ phiên theo tab và 30 ngày từ hoạt động chủ động |
| `T050-09` | Temporary reload giữ phiên; app mở link noopener tạo tab trống không copy credential. | Không ghi nhớ: reload giữ phiên; link mở tab của app có noopener, không sao chép storage; browser duplicate là ngoại lệ đã ghi rõ |
| `T050-10` | Hai login độc lập A1/A2, đóng tab A1; A2 request vẫn qua và deadline không bị thay. | Hai tab đăng nhập phiên tạm độc lập, đóng A thì B còn hợp lệ và thao tác được; không đăng xuất cả tài khoản |
| `T050-11` | Chỉ heartbeat/refresh/polling/receive/reconnect đến 30 d; idle không tăng, đúng hạn bị chặn. | Đồng hồ giả: chỉ heartbeat/refresh/reconnect/tải nền/nhận sự kiện trong 30 ngày không dời deadline; tới hạn phải đăng nhập |
| `T050-12` | JWT còn hạn nhưng idle hết: HTTP từ chối tại 050; socket thật tái kiểm tại 084 T084-12, không giả gateway. | Phiên ứng dụng hết hạn nhưng token kỹ thuật còn hạn: HTTP và realtime bị chặn, hoạt động muộn không hồi sinh phiên |
| `T050-13` | Tại idle−1 ms/idle/idle+1 ms và absolute−1 ms/absolute/absolute+1 ms, activity; không vượt absolute, đúng hạn từ chối. | TEMPORARY đúng 30 phút nhàn rỗi hoặc 12 giờ tuyệt đối ⇒ chặn trước gia hạn; hoạt động trước hạn kéo idle nhưng không vượt absolute. |
| `T050-14` | Hai activity khác now qua 2 connection/barrier; expiry không giảm; replay bootstrap không đổi mode/hạn. | Hai activity đồng thời không rút ngắn hạn; request nền không gọi activity; đăng ký/replay/refresh không đổi mode, tạo lại hoặc hồi sinh phiên. |
| `T050-15` | Cùng profile browser chứa remembered credential rồi chọn temporary; không fallback; CURRENT chặn bản copy cùng auth_session_id, session khác sống. | Storage remembered/temporary không tự fallback lẫn nhau; browser restore cùng session CURRENT logout chặn hết bản copy, phiên đăng nhập độc lập vẫn hợp lệ. |
| `T050-16` | Trì hoãn bootstrap tới sign_in_at+idle−1 ms/idle/idle+1 ms; kiểm gốc deadline vẫn sign_in_at, replay không đặt lại last_active. | Bootstrap trì hoãn: deadline khởi tạo từ sign_in_at của helper, không thời điểm nhận request. Đúng/sau idle ban đầu bị từ chối; replay bootstrap không đặt lại last_active hoặc deadline. |



### 10.3 Điểm triển khai cần giữ đúng

```ts
export function nextIdle(mode: 'REMEMBERED' | 'TEMPORARY', now: number,
                         oldIdle: number, absolute: number | null): number {
  if (now >= oldIdle || (absolute !== null && now >= absolute)) throw new Error('EXPIRED');
  const windowMs = mode === 'REMEMBERED' ? 30 * 86400000 : 30 * 60000;
  return Math.min(absolute ?? Infinity, Math.max(oldIdle, now + windowMs));
}
// Đây là phép tính sau khi lock + verify phiên; không thay thế kiểm Auth/DB.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **đổi now<deadline thành now<=deadline hoặc cho refresh dời hạn**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-050.md`.

```bash
pnpm test:integration -- tests/integration/issue-050.test.ts
pnpm test:e2e -- tests/e2e/issue-050.spec.ts
pnpm test:unit -- tests/unit/issue-050.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
pnpm test:e2e
```

**Đóng issue:** mọi test trong ma trận và mọi ô PASS phía trên đạt; không `.only`/`.skip`, không thiếu lane. Các gate tích hợp tương lai được nêu đích danh trong issue phải có chủ sở hữu/bằng chứng riêng, không ghi chúng PASS bằng spy/fixture. Chỉ đổi `TODO` sang `DONE` sau PR đã merge theo WORKFLOW.

**BLOCKED và bàn giao:** thiếu capability dependency hoặc invariant trong 10.1 chưa kiểm được ⇒ `BLOCKED`, ghi đúng test/đầu vào/response sai và commit liên quan. PostgreSQL/socket/browser cần cho ma trận không chạy được ⇒ test phải đỏ; không bỏ qua hoặc thay bằng dữ liệu tự dựng để báo đạt. Bàn giao đường dẫn file thực đã sửa, exported interface/DTO, migrations nếu có, các test ID đạt/chưa đạt, bằng chứng fault injection, và tên issue kế tiếp sử dụng hợp đồng ở 10.1; không bàn giao chỉ một câu “đã xong”.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-AUTH-17` | [REQ-AUTH](../01-requirements/REQ-AUTH.md) | LOCAL |
| `AC-AUTH-18` | [REQ-AUTH](../01-requirements/REQ-AUTH.md) | LOCAL |
| `AC-AUTH-23` | [REQ-AUTH](../01-requirements/REQ-AUTH.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
