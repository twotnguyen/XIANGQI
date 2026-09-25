# ISSUE-069 — Link mời + token

**Nhóm:** E08 · **Phụ thuộc:** 068 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Link chia sẻ được qua kênh bất kỳ, hoạt động cả khi người nhận **chưa đăng nhập**.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-INVITE.md](../01-requirements/REQ-INVITE.md) §5.2 · [../02-flows/FLOW-JOIN-ROOM.md](../02-flows/FLOW-JOIN-ROOM.md) §5

## 3. PHẠM VI
**✅ LÀM** — sinh link · trang `/join` · ghi nhớ đích khi chưa đăng nhập
**❌ KHÔNG LÀM** — mời trực tiếp (070)

## 4. FILE TẠO
`apps/server/src/modules/invitations/link.service.ts` · `apps/web/src/features/invite/JoinPage.tsx`

## 5. CÁC BƯỚC
1. Token ngẫu nhiên **32 byte**, mã hoá an toàn cho địa chỉ trang. Lưu **dạng băm**, giống mã phòng
2. **Token nằm ở phần fragment của địa chỉ**: `/join#token=...`
   ⚠ Phần fragment **không** được gửi lên máy chủ trong địa chỉ ⇒ không lọt vào log truy cập
3. Trang `/join` đọc token từ fragment, gửi bằng **POST** để đổi lấy tư cách thành viên
4. **Chưa đăng nhập**:
   ```
   ① lưu token vào bộ nhớ CỦA TAB đó
   ② chuyển tới màn đăng nhập
   ③ đăng nhập xong → quay lại /join → dùng token
   ④ dùng xong hoặc hết hạn → XOÁ token khỏi bộ nhớ
   ```
5. Hai loại `PLAY` / `WATCH`, hết hạn **24 giờ**, dùng chung luật với mã phòng
6. ⛔ **Không bao giờ** đưa token đăng nhập vào link mời

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T069-01` | Tạo link → mở link khi **đã đăng nhập** → vào phòng ngay |
| `T069-02` | ⭐ **Chưa đăng nhập → đăng nhập → TỰ VÀO ĐÚNG PHÒNG** |
| `T069-03` | ⭐ Sau khi dùng xong → **token bị xoá** khỏi bộ nhớ tab |
| `T069-04` | Link `PLAY` dùng lần hai → **từ chối** |
| `T069-05` | Link `WATCH` dùng nhiều lần → được |
| `T069-06` | Link hết hạn 24 giờ → từ chối (đồng hồ giả) |
| `T069-07` | Link bị thu hồi → từ chối |
| `T069-08` | ⭐ **Token nằm ở fragment, KHÔNG nằm ở phần gửi lên máy chủ** |
| `T069-09` | ⭐ **Log máy chủ không chứa token** |
| `T069-10` | Token sai định dạng → từ chối, không lỗi nặng |
| `T069-11` | Mở link trong 2 tab khác nhau → bộ nhớ **không lẫn** |
| `T069-12` | Link hết hạn/đã dùng/thu hồi/phòng đóng trả chung ROOM_ACCESS_UNAVAILABLE không metadata; không tự dùng role từ URL |
| `T069-13` | WATCH link cũ sau tighter privacy/rotate không hoạt động khi mở lại PUBLIC; PLAY giữ hiệu lực nếu còn điều kiện nhận ghế |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 13 test xanh
- [ ] **`T069-02`** luồng khách → đăng nhập → vào phòng
- [ ] **`T069-08`** và **`T069-09`** token không rò
- [ ] `T069-03` token được dọn sạch
- [ ] Token lưu **dạng băm** ở cơ sở dữ liệu

### Contract bổ sung bắt buộc

Join link dùng contract ROOM-CHAT §2/3 và cùng dịch vụ với code/invite. Không có thông báo token đã dùng riêng cho người chưa qua cổng bằng chứng.

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-069.md`

## 9. ⚠ CẠM BẪY
Đặt token vào **phần truy vấn** của địa chỉ (`?token=`) thay vì fragment sẽ khiến token **lọt vào log truy cập** của máy chủ, proxy và trình duyệt. Fragment không bao giờ được gửi lên máy chủ — đó là lý do phải dùng nó.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** Link token random 32 bytes base 64 url/HMAC storage; /join#token=... → tab storage → POST join 063 strict token+intent. Fragment xoá bằng replace-history, token storage xoá khi dùng xong/hết hạn. Không đặt Auth access token trong link.

**Tiền điều kiện cụ thể:** Hai tab độc lập, grant PLAY/WATCH thật 068; user logged-in/guest/onboarding và returnPath token riêng; backend access logs capture.

**File kiểm thử:** `tests/integration/issue-069.test.ts` · `tests/e2e/issue-069.spec.ts`. Giữ tên `T069-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T069-01` | A tạo link; B đã login mở; join endpoint thật trả membership đúng grant. | Tạo link → mở link khi **đã đăng nhập** → vào phòng ngay |
| `T069-02` | B guest mở link, login 049/onboarding 054 nếu cần; join cùng token vào đúng room. | ⭐ **Chưa đăng nhập → đăng nhập → TỰ VÀO ĐÚNG PHÒNG** |
| `T069-03` | Sau success/expired kiểm sessionStorage namespace mời và URL không token. | ⭐ Sau khi dùng xong → **token bị xoá** khỏi bộ nhớ tab |
| `T069-04` | PLAY link consume bởi B; C dùng lại lỗi chung, không slot mới. | Link `PLAY` dùng lần hai → **từ chối** |
| `T069-05` | WATCH link dùng S1/S2; 2 membership, cùng grant còn hạn. | Link `WATCH` dùng nhiều lần → được |
| `T069-06` | Clock 24 h−1 ms/24 h/24 h+1 ms; đúng hạn từ chối bằng Authenticated POST join. | Link hết hạn 24 giờ → từ chối (đồng hồ giả) |
| `T069-07` | Rotate/privacy revoke rồi mở link cũ; lỗi chung dù về PUBLIC. | Link bị thu hồi → từ chối |
| `T069-08` | Chụp navigation request URL/Referer tới server; không fragment/token query; POST body redacted log. | ⭐ **Token nằm ở fragment, KHÔNG nằm ở phần gửi lên máy chủ** |
| `T069-09` | Tạo/use/invalidlink; rawtoken không có trong access/application log. | ⭐ **Log máy chủ không chứa token** |
| `T069-10` | Token empty/truncated/invalidbase 64 url/oversized; validation hoặc 404 chung, không 500. | Token sai định dạng → từ chối, không lỗi nặng |
| `T069-11` | TabA/B giữ 2 token khác; login/return riêng, không đọc token tabkia. | Mở link trong 2 tab khác nhau → bộ nhớ **không lẫn** |
| `T069-12` | Used/expired/revoked/CLOSED và role=PLAYER trongURL; cùng generic error/no metadata, URLrole không nâng quyền. | Link hết hạn/đã dùng/thu hồi/phòng đóng trả chung ROOM_ACCESS_UNAVAILABLE không metadata; không tự dùng role từ URL |
| `T069-13` | WATCH cũ sau tighter/rotate rồi PUBLIC không dùng lại; PLAY còn hạn vẫn nhận nếu WAITING/còn ghế. | WATCH link cũ sau tighter privacy/rotate không hoạt động khi mở lại PUBLIC; PLAY giữ hiệu lực nếu còn điều kiện nhận ghế |



### 10.3 Điểm triển khai cần giữ đúng

```ts
export function takeInviteFragment(location: Location, history: History): string | null {
  const token = new URLSearchParams(location.hash.slice(1)).get('token');
  history.replaceState(null, '', location.pathname);
  return token;
}
// Validate token rồi lưu namespace theo tab; không log token.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **chuyển fragment thành query hoặc giữ token ở shared localStorage**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-069.md`.

```bash
pnpm test:integration -- tests/integration/issue-069.test.ts
pnpm test:e2e -- tests/e2e/issue-069.spec.ts
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
| `AC-INV-05` | [REQ-INVITE](../01-requirements/REQ-INVITE.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
