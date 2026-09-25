# ISSUE-011 — Schema Zod + mã lỗi

**Nhóm:** E01 · **Phụ thuộc:** 008, 009, 010 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Schema kiểm tra **mọi dữ liệu client gửi lên**, và danh sách mã lỗi chuẩn.

## 2. ĐỌC TRƯỚC
[../01-requirements/README.md](../01-requirements/README.md) §"Ba luật xuyên suốt" — luật 1: **không bao giờ tin client**

## 3. PHẠM VI
**✅ LÀM** — schema Zod cho input · mã lỗi · envelope kết quả
**❌ KHÔNG LÀM** — gắn vào route (các issue sau)

## 4. FILE TẠO
`packages/contracts/src/schemas.ts` · `errors.ts` · `api.ts`

## 5. CÁC BƯỚC
1. **Mã lỗi** — chép đủ:
   ```ts
   export type ErrorCode =
     | 'UNAUTHENTICATED' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'NOT_FOUND'
     | 'CONFLICT' | 'RATE_LIMITED' | 'EMAIL_UNVERIFIED' | 'ONBOARDING_REQUIRED'
     | 'ROOM_FULL' | 'ROOM_CLOSED' | 'ALREADY_IN_ROOM' | 'INVITE_INVALID'
     | 'BLOCKED_FROM_ROOM' | 'NOT_YOUR_TURN' | 'INVALID_MOVE'
     | 'VERSION_CONFLICT' | 'COMMAND_ID_REUSED' | 'MATCH_ENDED'
     | 'PROPOSAL_EXPIRED' | 'AI_BUSY' | 'MEDIA_UNAVAILABLE'
     | 'ROOM_ACCESS_UNAVAILABLE' | 'ACCESS_DENIED' | 'ROOM_NOT_WAITING'
     | 'STALE_ROOM_CONFIG' | 'STALE_READY' | 'MESSAGE_ID_REUSED' | 'PROPOSAL_PENDING';
   ```
2. Envelope:
   ```ts
   export type ApiResult<T> =
     | { ok: true;  data: T; requestId: string }
     | { ok: false; error: { code: ErrorCode; message: string }; requestId: string };
   ```
3. **Mọi schema input bắt buộc `.strict()`** — thừa trường là **từ chối**. Đây là chốt chặn để client không tự ghi `role`, `winner`, `side`. Các trường ý định `intent`, `channel`, `requestedRole` trong đúng schema vẫn hợp lệ nhưng không phải bằng chứng quyền; máy chủ suy ra quyền từ phiên, grant và membership.
4. Viết schema cho: `SquareSchema` · `MoveSchema` · `MatchCommandSchema` (commandId UUID + expectedVersion + payload) · `CreateRoomSchema` · `JoinRoomSchema` · `ChatSendSchema` · `MediaPolicySchema` · `CreateAiMatchSchema` · `RegisterSchema` · `LoginSchema`
5. Ràng buộc cụ thể:
   | Schema | Ràng buộc |
   |---|---|
   | `SquareSchema` | x 0..8, y 0..9, **số nguyên** |
   | `CreateRoomSchema` | tên 1..60 · visibility enum · timeControl ∈ {0,300,600,900} |
   | `ChatSendSchema` | `contextId` UUID · `channel` PLAYERS/ROOM · `privateSegmentId` UUID bắt buộc chỉ khi PLAYERS · `clientMessageId` UUID · content 1..1000; không nhận senderId/role/senderIsPlayer/matchId |
   | `RegisterSchema` | username `^[a-z0-9_]{3,24}$` · email · mật khẩu 10..128 |
   | `JoinRoomSchema` | `commandId` UUID · `intent` PLAY/WATCH · **đúng một** locator roomId / code / token / invitationId; reject role/side/userId/ownerId |
   | `ReadySchema` | commandId · membershipId · expectedConfigRevision · expectedReadyRevision · ready; phiên/membership phải thuộc người gửi |

   Nguồn contract và mã lỗi không lộ phòng: [room-chat-contract](../09-technical/room-chat-contract.md).

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T011-01` | `SquareSchema` từ chối x=9 · y=10 · x=1.5 · x=-1 |
| `T011-02` | **Thêm trường thừa vào bất kỳ schema nào → BỊ TỪ CHỐI** (`.strict()`) |
| `T011-03` | `RegisterSchema` từ chối username có chữ HOA, ký tự đặc biệt, 2 ký tự, 25 ký tự |
| `T011-04` | `ChatSendSchema`: 0 ký tự và 1001 ký tự → từ chối; 1 và 1000 → nhận |
| `T011-05` | `JoinRoomSchema`: đưa cả roomId **và** code → **từ chối** |
| `T011-06` | `MatchCommandSchema` từ chối commandId không phải UUID |
| `T011-08` | Join đủ bốn locator, intent hợp lệ và mọi tổ hợp nhiều locator bị từ chối; Chat PLAYERS thiếu segment/ROOM thừa segment bị từ chối |
| `T011-09` | Ready thiếu revision bị từ chối; channel/intent là ý định, không biến thành quyền ghi vào dữ liệu |
| `T011-07` | Gửi kèm `winner` hoặc `role` vào schema mutation → **từ chối** |

> `T011-02` và `T011-07` là hai test bảo mật quan trọng nhất của issue này.

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] **Mọi** schema input có `.strict()`
- [ ] Mã lỗi đủ theo danh sách và contract, có `BLOCKED_FROM_ROOM` (`DEC-015`)
- [ ] `T011-02` chứng minh trường thừa bị từ chối ở **mọi** schema
- [ ] `T011-07` chứng minh client không tự ghi được `winner`/`role`
- [ ] Mọi giới hạn số khớp `business-rules.md` §3

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-011.md` — liệt kê từng schema và kết quả `.strict()`.

## 9. ⚠ CẠM BẪY
Không có `.strict()` ⇒ client gửi thêm `{winner:'RED'}` và nếu tầng dưới trải object ra thì **tự thắng**. Đây là lỗ hổng kinh điển, phải chặn ngay từ tầng schema.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Mọi schema nhận unknown và kiểm bằng safeParse; strict ở cả root lẫn object lồng nhau. Xuất registry `INPUT_SCHEMAS` gồm mọi schema thực, có ReadySchema, để test không bỏ sót. Chat chuẩn hóa NFC, trim rồi đếm Unicode code point bằng Array.from(text).length; không cắt ngắn input. Tách payload hợp lệ về cấu trúc khỏi bằng chứng quyền server.

Các giao diện này phải được tạo khi thực thi; chưa có mã runtime hay bằng chứng PASS. Đọc AGENT-START-HERE và TEST-CONVENTIONS; mọi phụ thuộc phải đã merge.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/issue-011.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

UUID cố định 00000000-0000-4000-8000-000000000001. Mỗi schema có valid Fixture typed Input, sinh 1 field thừa ở root/nested. Matrix join gồm 4 single locator,6 pair,4 triple,1 all,0 none,2 intent.

- T011-01: square boundary(-1,0)/(9,0)/(0,10)/(1.5,0) rejected, (0,0)/(8,9) accepted.
- T011-02/07: iterate registry, valid passes; {...valid, winner:RED}, role:SPECTATOR reject; nested Move square thừa cũng bị từ chối.
- T011-03: username aa/25 a/Alice/a-b reject;aaa/24 a accepted, password 9/10/128/129.
- T011-04/08: ROOM không segment, PLAYERS có segment; Unicode emoji 1000 accepted,1001 reject sau NFC trim; empty/whitespace reject.
- T011-05/06/08/09: tất cả locator matrix, UUID xấu, expected Version/revisions âm/lẻ/missing bị từ chối; Ready false vẫn cần revision.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { JoinRoomSchema } from '@xiangqi/contracts';
test('T011-05 strict locator không nâng quyền', () => {
  const id='00000000-0000-4000-8000-000000000001';
  const valid={commandId:id,intent:'WATCH',roomId:id};
  expect(JoinRoomSchema.safeParse(valid).success).toBe(true);
  expect(JoinRoomSchema.safeParse({...valid,code:'ABCDEFGH'}).success).toBe(false);
  expect(JoinRoomSchema.safeParse({...valid,role:'PLAYER'}).success).toBe(false);
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Bỏ strict ở Join/Chat hoặc cho hai locator; T011-02/05/07 phải đỏ; đổi độ dài sang UTF16 làm Unicode case đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-011.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao valid/rejected payloads và Error Code registry cho controllers; schema xác nhận cấu trúc, không cấp quyền.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
