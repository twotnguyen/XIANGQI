# ISSUE-009 — Kiểu phòng · thành viên · lời mời

**Nhóm:** E01 · **Phụ thuộc:** 006, 008 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Kiểu mô tả phòng, thành viên, và ba cách mời.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-ROOM.md](../01-requirements/REQ-ROOM.md) §9 · [../01-requirements/REQ-INVITE.md](../01-requirements/REQ-INVITE.md) §11 · [../00-overview/glossary.md](../00-overview/glossary.md) **§1.1** (`SPECTATOR` khác `WATCH`)

## 3. PHẠM VI
**✅ LÀM** — kiểu phòng/thành viên/lời mời · **❌ KHÔNG LÀM** — logic (E07, E08)

## 4. FILE TẠO
`packages/contracts/src/room.ts`

## 5. CÁC BƯỚC
1. **Hai cặp khái niệm — không được lẫn** (`glossary` §1.1):
   ```ts
   export type MemberRole = 'PLAYER' | 'SPECTATOR';   // VAI TRÒ trong phòng
   export type GrantRole  = 'PLAY'   | 'WATCH';       // LOẠI VÉ để vào
   ```
2. ```ts
   export type Visibility = 'PUBLIC' | 'CODE_ONLY' | 'LOCKED';
   export type RoomStatus = 'WAITING' | 'PLAYING' | 'FINISHED' | 'CLOSED';
   export const MAX_PLAYERS = 2;
   export const MAX_SPECTATORS = 5;
   export const MAX_MEMBERS = 7;
   ```
3. Thành viên: `{ userId, membershipId, role, side: Side|null, online, ready, readyRevision, readyConfigRevision }`
   — `side` **chỉ** khác null khi `role === 'PLAYER'`
4. Phòng: `{ id, name, ownerId, visibility, status, roomVersion, configRevision, timeControl, members, currentMatchId, currentChatContextId, spectatorCount }`
5. Lời mời: `{ id, kind: 'DIRECT'|'CODE'|'LINK', grantRole, roomId, recipientId: string|null, expiresAtMs, consumed }`
   — **`recipientId` chỉ khác null với `DIRECT`**
6. **Tuyệt đối không** đặt mã bí mật hay token vào kiểu gửi cho client (`BR-INV-12`)

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T009-01` | `MAX_SPECTATORS === 5` và `MAX_MEMBERS === MAX_PLAYERS + MAX_SPECTATORS` |
| `T009-02` | `MemberRole` và `GrantRole` là **hai kiểu khác nhau**, gán chéo **không biên dịch được** |
| `T009-03` | Kiểu phòng biên dịch với đủ 3 chế độ riêng tư và 4 trạng thái |
| `T009-04` | Lời mời `CODE`/`LINK` có `recipientId === null` |
| `T009-05` | **Không** kiểu nào gửi cho client chứa trường tên `code`, `token`, `secret`, `hmac` |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] `MemberRole` tách hẳn `GrantRole`, `T009-02` chứng minh
- [ ] Ba hằng số sức chứa đúng 2/5/7
- [ ] `T009-05` chứng minh không rò mã bí mật
- [ ] `pnpm typecheck` exit 0

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-009.md`

## 9. ⚠ CẠM BẪY
`SPECTATOR` (vai trò) và `WATCH` (loại vé) là **hai khái niệm khác nhau**. Gộp làm một sẽ dẫn tới lỗi kiểu *"dùng mã xem để xin ghế chơi"* — chính là `BR-INV-11`.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Xuất `RoomMember`, `RoomSnapshot`, `InvitationSummary` từ public index. Nhập `Side` của 006 và `TimeControl` của 008. Member gồm membershipId, readyRevision, readyConfigRevision; snapshot gồm configRevision và currentChatContextId theo ROOM-CHAT. Dùng discriminated union để SPECTATOR có side=null, DIRECT có recipientId, CODE/LINK recipientId=null. DTO không chứa code/token/HMAC/secret.

Các giao diện này phải được tạo khi thực thi; chưa có mã runtime hay bằng chứng PASS. Đọc AGENT-START-HERE và TEST-CONVENTIONS; mọi phụ thuộc phải đã merge.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/issue-009.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

File types tập object cho 3 visibility× 4 status. Dùng discriminated union RoomMember theo role để SPECTATOR side:null; InvitationSummary DIRECT recipientId:string, CODE/LINK recipientId:null.

- T009-01: const an ts 2/5/7 và phép cộng.
- T009-02: @ts-expect-error gán WATCH vào MemberRole và SPECTATOR vào GrantRole.
- T009-03:12 tổ hợp compile, ready defaults false/revisions 0 mô tả ở 037.
- T009-04: CODE/LINK recipientId khác null không compile; DIRECT recipient thật.
- T009-05: type-level Extract<keyof DTO, code/token/secret/hmac> phải never; serializer runtime sau mới kiểm payload.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import type { GrantRole, MemberRole } from '@xiangqi/contracts';
export const role: MemberRole = 'SPECTATOR';
export const grant: GrantRole = 'WATCH';
// @ts-expect-error WATCH là quyền của vé, không phải vai trò thành viên.
export const invalidRole: MemberRole = 'WATCH';
// @ts-expect-error SPECTATOR không phải loại quyền vé.
export const invalidGrant: GrantRole = 'SPECTATOR';
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Gộp hai union vào một; type-negative phải đỏ vì directive thừa.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-009.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao kiểu revisions/membership cho 064/065 và context cho 108; không công khai watch secret.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
