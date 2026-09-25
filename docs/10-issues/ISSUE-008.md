# ISSUE-008 — Kiểu ván cờ

**Nhóm:** E01 · **Phụ thuộc:** 006, 010 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Định nghĩa kiểu mô tả trạng thái một ván và kết quả ván.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-MATCH.md](../01-requirements/REQ-MATCH.md) §9 · [../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) §5 · [../01-requirements/REQ-CLOCK.md](../01-requirements/REQ-CLOCK.md)

## 3. PHẠM VI
**✅ LÀM** — kiểu ván, kết quả, đồng hồ, đề nghị, trạng thái treo ván
**❌ KHÔNG LÀM** — Zod (011) · logic (E11)

## 4. FILE TẠO
`packages/contracts/src/match.ts`

## 5. CÁC BƯỚC
1. Kiểu cơ bản:
   ```ts
   export type MatchMode   = 'ONLINE' | 'AI';
   export type MatchStatus = 'ACTIVE' | 'FINISHED' | 'INTERRUPTED';
   export type TimeControl = 0 | 300 | 600 | 900;     // giây mỗi bên; 0 = không giới hạn
   export type AiLevel     = 'EASY' | 'MEDIUM' | 'HARD';
   ```
2. **Nguyên nhân kết thúc — đủ 11 giá trị**, chép đúng `GR-END-05`:
   ```ts
   export type OutcomeReason =
     | 'CHECKMATE' | 'STALEMATE' | 'REPETITION' | 'AGREED_DRAW'
     | 'RESIGN' | 'TIMEOUT' | 'INACTIVITY' | 'DISCONNECT'
     | 'BOTH_OFFLINE' | 'SERVER_RESTART' | 'AI_UNAVAILABLE';
   export type Outcome = { winner: Side | null; reason: OutcomeReason };
   ```
3. Đồng hồ và đề nghị:
   ```ts
   export type ClockState = { redMs: number; blackMs: number; runningSinceEpochMs: number } | null;
   export type ProposalKind = 'DRAW' | 'UNDO';
   export type Proposal = { id: string; kind: ProposalKind; requesterId: string;
                            basePly: number; createdVersion: number; expiresAtMs: number };
   ```
4. **Trạng thái treo ván (R17)**:
   ```ts
   export type InactivityPhase = 'NORMAL' | 'PROMPTING' | 'COUNTDOWN';
   export type InactivityState = {
     phase: InactivityPhase;
     extensionsUsed: number;        // 0..2, reset khi đi được một nước
     deadlineMs: number | null;
   } | null;
   ```
5. `MatchSnapshot` dùng kiểu đầy đủ, nhập `AiState` từ `ai.ts` (ISSUE-010), không import ngược `MatchSnapshot` ở ai.ts:
   ```ts
   export type PresenceEntry = {
     userId: string; online: boolean; disconnectDeadlineMs: number | null;
   };
   export type MatchSnapshot = {
     id: string; roomId: string | null; mode: MatchMode; status: MatchStatus;
     position: Position; version: number; ply: number; ruleSetVersion: string;
     redUserId: string | null; blackUserId: string | null;
     aiSide: Side | null; aiLevel: AiLevel | null; timeControl: TimeControl;
     clock: ClockState; outcome: Outcome | null; activeMoveIds: string[];
     proposal: Proposal | null; inactivity: InactivityState;
     presence: PresenceEntry[]; aiState: AiState; serverNowMs: number;
   };
   ```
   Presence chỉ chứa người thật; không tạo tài khoản cho AI và không gửi tab/client/session IDs nội bộ.
6. Chú thích rõ: `version` **chỉ tăng**; `ply` **có thể giảm** khi đi lại

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T008-01` | `OutcomeReason` có **đúng 11** giá trị |
| `T008-02` | Ánh xạ nguyên nhân → người thắng đúng `GR-END-05`: `BOTH_OFFLINE`/`SERVER_RESTART`/`AI_UNAVAILABLE` ⇒ winner **null**; `REPETITION`/`AGREED_DRAW` ⇒ winner **null** |
| `T008-03` | `TimeControl` chỉ nhận 0/300/600/900 |
| `T008-04` | `extensionsUsed` có chú thích giới hạn **0..2** |
| `T008-05` | `MatchSnapshot` biên dịch với ván ONLINE và ván AI (roomId null) |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ **11** nguyên nhân kết thúc, có `INACTIVITY`
- [ ] Có `InactivityState` với `extensionsUsed`
- [ ] `T008-02` chứng minh ánh xạ đúng
- [ ] `pnpm typecheck` exit 0

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-008.md`

## 9. ⚠ CẠM BẪY
`INACTIVITY` là nguyên nhân **mới** (`DEC-016`). **Không** gộp vào `TIMEOUT` (hết đồng hồ) hay `DISCONNECT` (mất mạng) — ba nguyên nhân khác nhau, QA phải phân biệt được trong lịch sử ván.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Xuất `MatchSnapshot` và `PresenceEntry` đúng chữ ký đầy đủ ở §5. Nhập `AiState` từ ISSUE-010; ai.ts không import ngược MatchSnapshot. `roomId`, người chơi, AI và đồng hồ có nullability đúng ONLINE/AI; `presence` là `PresenceEntry[]`, chỉ chứa người thật. Không gửi token, tab ID, client ID hay app session ID. TypeScript kiểm cấu trúc; giới hạn số và quyền nghiệp vụ phải được schema/service kiểm riêng.

Các giao diện này phải được tạo khi thực thi; chưa có mã runtime hay bằng chứng PASS. Đọc AGENT-START-HERE và TEST-CONVENTIONS; mọi phụ thuộc phải đã merge.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/issue-008.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Test compile fixtures ONLINE và AI với mọi field của snapshot; danh sách lý do là literal tuple 11 mục dùng satisfies readonly OutcomeReason[], cùng Record<OutcomeReason,...> để bắt thiếu enum.

- T008-01/02: Record phủ đủ 11 nguyên nhân; 5 nguyên nhân không thắng trả null; các 6 loại còn lại dùng side hợp lệ. Không khẳng định union rộng tự ép business invariant.
- T008-03: 0/300/600/900 compile;450 và -1 có @ts-expect-error.
- T008-04: compile extensionsUsed; boundary runtime 0..2 thuộc service/schema, không ghi đã được TS number kiểm.
- T008-05: ONLINE roomId UUID, AI roomId null/aiSide/aiLevel thật; tất cả fields compile và JSON không chứa secrets.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import type { OutcomeReason } from '@xiangqi/contracts';
const reasons = ['CHECKMATE','STALEMATE','REPETITION','AGREED_DRAW','RESIGN',
  'TIMEOUT','INACTIVITY','DISCONNECT','BOTH_OFFLINE','SERVER_RESTART','AI_UNAVAILABLE'] as const satisfies readonly OutcomeReason[];
const requiresNoWinner: Record<OutcomeReason, boolean> = {
  CHECKMATE:false, STALEMATE:false, REPETITION:true, AGREED_DRAW:true,
  RESIGN:false, TIMEOUT:false, INACTIVITY:false, DISCONNECT:false,
  BOTH_OFFLINE:true, SERVER_RESTART:true, AI_UNAVAILABLE:true,
};
test('T008-01/02 taxonomy', () => {
  expect(Object.keys(requiresNoWinner).sort()).toEqual([...reasons].sort());
  expect(reasons).toHaveLength(11);
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Bỏ INACTIVITY khỏi union/Record hoặc thêm enum thứ 12; typecheck/test phải đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-008.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao snapshot ONLINE/AI và trường version/ply; hành vi terminal sẽ được chứng minh 024/089, không lấy kiểu làm bằng chứng nghiệp vụ.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
