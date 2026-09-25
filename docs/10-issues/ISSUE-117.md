# ISSUE-117 — Test media đo luồng thật

**Nhóm:** E17 · **Phụ thuộc:** 116, 076, 099 · **Trạng thái:** TODO
**Scope local:** LiveKit thật và15TS-MED; hai thiết bị/hai mạng TS-MAN-03 là gate Internet bắt buộc ở137, ghi CHỜ riêng khi thiếu. Xem [EXTERNAL-SETUP.md](EXTERNAL-SETUP.md) §3, §7 (DEC-047).

## 1. MỤC TIÊU
Chứng minh **ma trận quyền media** hoạt động bằng **đo luồng dữ liệu thật**, không phải nhìn giao diện.

## 2. ĐỌC TRƯỚC
[../06-acceptance/test-scenarios.md](../06-acceptance/test-scenarios.md) **§7 toàn bộ** · `TS-MED-00`

## 3. PHẠM VI
**✅ LÀM** — 15 kịch bản `TS-MED-01..15` với đo luồng thật
**❌ KHÔNG LÀM** — logic (đã ở 113–116)

## 4. FILE TẠO
`tests/media/matrix.test.ts` · `tests/media/helpers/stats.ts`

**Hợp đồng đã chốt:** [media-control-contract](../09-technical/media-control-contract.md), DEC-041; phạm vi toàn tài khoản, timeout 30 giây, bằng chứng SFU và giới hạn thiết bị vật lý.

## 5. CÁC BƯỚC
1. ⭐ **Mọi khẳng định phải dựa trên THỐNG KÊ LUỒNG THẬT** — số byte nhận, số khung hình, danh tính nguồn phát.
   ⛔ **Không** assert bằng cách nhìn giao diện hay kiểm 403
2. ⭐ **`TS-MED-00` — ĐỐI CHỨNG DƯƠNG BẮT BUỘC**: mỗi lần khẳng định *"không nhận được"*, phải **đồng thời** chứng minh người **còn quyền VẪN nhận được**
3. Chạy đủ 15 kịch bản `TS-MED-01` đến `TS-MED-15`
4. Cửa sổ quan sát **có giới hạn**, ghi rõ trong báo cáo. ⛔ **Không** đòi byte lịch sử về 0
5. Dùng nguồn **tổng hợp** (nhân tạo), ⛔ **không** lưu media thật vào vết hay video trong kho mã
6. Kịch bản **7 người** (2 phát + 5 xem) là mốc bắt buộc

## 6. TEST BẮT BUỘC
| ID | Kịch bản |
|---|---|
| `TS-MED-01` | ⭐ **Cả 9 tổ hợp** camera × micro của một người chơi |
| `TS-MED-02` | A *đối thủ và người xem*, B *chỉ đối thủ* → người xem **chỉ nhận của A** |
| `TS-MED-03` | A camera *chỉ đối thủ* + micro *đối thủ và người xem* → người xem **nghe tiếng, không thấy hình** |
| `TS-MED-04` | ⭐ **Thu hẹp quyền khi đang nhận → byte về 0 cho luồng mới** |
| `TS-MED-05` | ⭐ **Giữ quyền cũ rồi thử nhận tiếp → KHÔNG nhận được** |
| `TS-MED-06` | ⭐ Gate transport cho066/075/076: một SPECTATOR bị đuổi, cả3privacy chuyển kín hơn vàrotateWATCH với5SPECTATOR đang nhận. Sau SFU confirmed/pipeline drain không nhận mẫu media mới; đo RTP/frame thật, token/epoch cũ không vào generation mới, nhóm còn quyền có đối chứng dương |
| `TS-MED-07` | Tải lại trang khi đang bật cả hai → **cả hai về tắt** |
| `TS-MED-08` | Chuyển camera → xác nhận nguồn cũ ngắt, camera mới Tắt tới khi bật riêng; micro vẫn có luồng thật tới đúng nhóm. Kiểm đối xứng chuyển micro, lỗi/ACK muộn theo T099-12/13 |
| `TS-MED-09` | Ván kết thúc → **mọi** luồng dừng |
| `TS-MED-10` | ⭐ **2 người phát + 5 người xem** — tất cả nhận đúng phần được chia sẻ |
| `TS-MED-11` | Hạ tầng mất liên lạc → đang xử lý; đúng deadline 30 giây ⇒ lỗi + Thử lại, fence/mức mong muốn giữ nguyên, không báo đã xong |
| `TS-MED-12` | Từ chối quyền thiết bị → **vẫn đánh cờ được** |
| `TS-MED-13` | Camera ở tab 1 + micro ở tab 2 → **hợp lệ** |
| `TS-MED-14` | Logout ALL/CURRENT hoặc đổi mật khẩu khi hai thiết bị phát: server chặn phiên/token cũ, socket thật đóng và SFU thật thu hồi. Chưa confirmed không báo dừng thiết bị; đối chứng phiên không thuộc scope vẫn dùng được |
| `TS-MED-15` | Source owner im lặng, ACK giả/muộn, control SFU lỗi: đúng 30 giây lỗi + retry; restart không mất fence, không capture/publish mới trước xác nhận, nguồn còn lại có đối chứng dương |
| `TS-MAN-03` | **Gate Internet ở137/T137-08**, hai thiết bị thật/hai mạng; không tính PASS ở117 nếu chưa chạy, không tạo skipped test trong lane local |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] `TS-MED-01`…`TS-MED-15` xanh với LiveKit **thật**
- [ ] ⭐ **Mọi khẳng định dựa trên SỐ BYTE và SỐ KHUNG HÌNH thật**
- [ ] ⭐ **Mỗi khẳng định "không nhận được" có ĐỐI CHỨNG DƯƠNG cùng lúc**
- [ ] **`TS-MED-10`** 7 người đạt
- [ ] TS-MAN-03 được truy sang137/T137-08; chưa chạy thì CHỜ riêng, không tuyên bố toàn media Internet đạt. DONE117 chỉ chứng nhận scope local15TS-MED, không dùng giả lập hay.skip
- [ ] **0 test bị bỏ qua**

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-117.md` — **bảng số byte và khung hình** cho từng kịch bản, cả nhóm có quyền và nhóm mất quyền.

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| Test media **chỉ assert object token tự tạo** — không có luồng nào cả (`F-14`) | Bước 1 — chỉ chấp nhận thống kê thật |
| Không có đối chứng dương ⇒ "0 byte" có thể chỉ vì hạ tầng chết | `TS-MED-00` |

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-117

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** tests/media/matrix.test.ts; tests/media/helpers/stats.ts.
- **File test:** `tests/media/matrix.test.ts`.
- **Nhận từ phụ thuộc:** 116 UI,099 transfer,076 kick,066/075 privacy,050/051 session revoke; 112 stats collector.
- **Bàn giao:** Executable TS-MED-01..15 proof matrix (publisher,source,recipient,policy,generation,bytes,frames,marker,timestamp).
- **Trình tự xử lý tối thiểu:** Capture raw inbound RTP và decoded frames theo actual participant/source; thống kê chênh lệch cùng window, không reset counter giả. Marker lọc buffer; record request/revoke/apply/capture timeline không lưu media riêng tư.

### Chuẩn bị và oracle từng nhóm ca

**Given:** 2 publisher+5 receiver independent contexts; S6 admission negative; synthetic marked media; local SFU actual.

| ID test (tiền tố T117 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `TS-MED-01..03,10,13` | 9 camera×mic com bos; A/B khác policy; cam tab 1/mic tab 2; 7 participants | Mỗi recipient nhận đúng source; unauthorized 0 mẫu mới cùng authorized positive; không kết luận từ 403/token object. |
| `TS-MED-04..09` | Shrink,kick,3 privacy tighten,rotate WATCH,reload,transfer,end; replay old token | Trước có RTP; confirmed+recorded drain+5 s: old actor 0 new markers; remaining positive; stale token không current generation; reload OFF/transfer chỉ source OFF; end all stop. |
| `TS-MED-11..12,14..15` | SFU outage,device-deny,logout CURRENT/ALL/password change,late ACK/restart | Đúng 30 s fence error; device-deny vẫn move; session scope đúng,socket disconnect thật,SFU revoke thật; nguồn không bị thu hồi vẫn positive. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence117 = { unauthorizedFreshMarkers: number[]; authorizedFreshMarkers: number[]; sourceIdentityVerified: boolean };

export function assertIssue117KeyCase(actual: Evidence117): void {
  expect(actual.unauthorizedFreshMarkers).toHaveLength(0); expect(actual.authorizedFreshMarkers.length).toBeGreaterThan(0); expect(actual.sourceIdentityVerified).toBe(true);
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Bỏ server revoke nhưng ẩn video UI; TS-MED-04/06 byte/marker test phải đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-117.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:media -- tests/media/matrix.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:media
```

**Chặn riêng của issue:** Không SFU/positive control/drain evidence ⇒ BLOCKED. TS-MAN-03 chưa có hai thiết bị/mạng ⇒ CHỜ 137 riêng, không.skip local 15 ca.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 133 ma trận deny cần proof media này; 136 local; 137 TS-MAN-03 hai thiết bị/hai mạng.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-AUTH-08` | [REQ-AUTH](../01-requirements/REQ-AUTH.md) | LOCAL+INTERNET |
| `AC-AUTH-12` | [REQ-AUTH](../01-requirements/REQ-AUTH.md) | LOCAL+INTERNET |
| `AC-ROOM-09` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |
| `AC-ROOM-15` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |
| `AC-INV-10` | [REQ-INVITE](../01-requirements/REQ-INVITE.md) | LOCAL |
| `AC-INV-12` | [REQ-INVITE](../01-requirements/REQ-INVITE.md) | LOCAL |
| `AC-SPEC-08` | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) | LOCAL |
| `AC-SPEC-10` | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) | LOCAL |
| `AC-SPEC-16` | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) | LOCAL |
| `AC-SPEC-22` | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) | LOCAL |
| `AC-DIS-09` | [REQ-DISCONNECT](../01-requirements/REQ-DISCONNECT.md) | LOCAL |
| `AC-DIS-11` | [REQ-DISCONNECT](../01-requirements/REQ-DISCONNECT.md) | LOCAL |
| `AC-MED-01` | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) | LOCAL |
| `AC-MED-02` | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) | LOCAL |
| `AC-MED-04` | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) | LOCAL |
| `AC-MED-07` | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) | LOCAL+INTERNET |
| `AC-MED-08` | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) | LOCAL+INTERNET |
| `AC-MED-09` | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) | LOCAL |
| `AC-MED-10` | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) | LOCAL |
| `AC-MED-11` | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) | LOCAL |
| `AC-MED-13` | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) | LOCAL+INTERNET |
| `AC-MED-14` | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) | LOCAL |
| `AC-MED-18` | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) | LOCAL |
| `AC-MED-19` | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) | LOCAL |
| `AC-MED-20` | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) | LOCAL |
| `AC-MED-21` | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) | LOCAL |
| `AC-MED-23` | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) | LOCAL |
| `AC-HIS-10` | [REQ-HISTORY-REMATCH](../01-requirements/REQ-HISTORY-REMATCH.md) | LOCAL |
| `AC-SS-05` | [session-state](../05-data-and-realtime/session-state.md) | LOCAL |
| `AC-SS-06` | [session-state](../05-data-and-realtime/session-state.md) | LOCAL |
| `AC-SS-07` | [session-state](../05-data-and-realtime/session-state.md) | LOCAL |
| `AC-SS-08` | [session-state](../05-data-and-realtime/session-state.md) | LOCAL |
| `AC-SS-11` | [session-state](../05-data-and-realtime/session-state.md) | LOCAL+INTERNET |
| `AC-SS-12` | [session-state](../05-data-and-realtime/session-state.md) | LOCAL+INTERNET |
| `AC-SS-16` | [session-state](../05-data-and-realtime/session-state.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
