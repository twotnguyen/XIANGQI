# ISSUE-041 — Migration: media

**Nhóm:** E04 · **Phụ thuộc:** 038 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Bảng chính sách camera/mic và **thế hệ phòng truyền** — nền tảng cho cơ chế thu hồi quyền.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-MEDIA.md](../01-requirements/REQ-MEDIA.md) §10 · [../09-technical/architecture.md](../09-technical/architecture.md) §8

## 3. PHẠM VI
**✅ LÀM** — `media_policies` · `media_transports` · `media_jobs`
**❌ KHÔNG LÀM** — gọi LiveKit (113–115)

## 4. FILE TẠO
`supabase/migrations/<timestamp>_media.sql`

## 5. CÁC BƯỚC
1. **`media_policies`** — mỗi người chơi, mỗi ván:
   | Cột | Ghi chú |
   |---|---|
   | `match_id` · `user_id` | **PK tổ hợp** |
   | `camera_desired` · `microphone_desired` | mức **mong muốn** |
   | `camera_applied` · `microphone_applied` | mức **đã xác nhận** |
   | `policy_version` · `applied_version` | int |
   | `status` | `APPLYING` / `APPLIED` / `FAILED` |
   ```sql
   CHECK (camera_desired IN ('OFF','OPPONENT_ONLY','OPPONENT_AND_SPECTATORS'))
   -- tương tự cho 3 cột còn lại
   CHECK (status IN ('APPLYING','APPLIED','FAILED'))
   ```
   Hàng mới: mọi mức = `OFF`, versions = 0, status = `APPLIED`

2. **`media_transports`** — **giữ MỘT HÀNG MỖI THẾ HỆ**, không ghi đè:
   | Cột | Ghi chú |
   |---|---|
   | `id` | uuid PK |
   | `match_id` · `kind` (`CAMERA`/`MICROPHONE`) · `audience` (`PRIVATE`/`WATCH`) | |
   | `generation` | int — tăng dần |
   | `room_name` | text UNIQUE — chứa nonce 128-bit, **không tái dùng** |
   | `state` | `READY` / `ROTATING` / `RETIRED` |
   ```sql
   UNIQUE (room_name)
   UNIQUE (match_id, kind, audience, generation)
   ```
   ⚠ **Không** ghi đè `room_name` của thế hệ cũ — nếu máy chủ chết giữa chừng sẽ **mất địa chỉ cần thu hồi**

3. **`media_jobs`** — công việc thu hồi bền vững: `id` · `match_id` · `status` (`PENDING`/`RUNNING`/`DONE`/`FAILED`) · `attempts` · `created_at` · `operation_id` UNIQUE · `source_kind` · `old_transport_ids` · `target_epoch` · `started_at` · `deadline_at` · `lease_until` · `last_error` · `confirmed_at`
   ⚠ Phải xử lý được job kẹt `RUNNING` sau khi máy chủ khởi động lại. FAILED giữ fence/mức desired; chỉ retry hợp lệ cùng operation mới chạy lại, không tự quay APPLIED. Chi tiết [media-control-contract](../09-technical/media-control-contract.md). CHECK attempts >= 0, deadline_at >= started_at; index(status, lease_until) cho reclaim; old_transport_ids không được mất khi rotation lỗi.

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T041-01` | Migration chạy trên DB sạch → exit 0 |
| `T041-02` | Mức chia sẻ lạ → **vi phạm CHECK** |
| `T041-03` | Hàng mới mặc định **tất cả `OFF`**, version 0, `APPLIED` |
| `T041-04` | ⭐ **Nhiều thế hệ cùng tồn tại** cho cùng `(match_id, kind, audience)` → **thành công** |
| `T041-05` | Hai hàng cùng `room_name` → **vi phạm UNIQUE** |
| `T041-06` | Cùng `(match_id,kind,audience,generation)` hai lần → **vi phạm UNIQUE** |
| `T041-07` | `camera_desired` và `microphone_desired` đặt **khác nhau** → thành công (độc lập) |
| `T041-08` | Job `RUNNING` quá hạn có thể tra ra được để xử lý lại |
| `T041-09` | FAILED hợp lệ, trạng thái lạ bị CHECK; deadline trước started_at và attempts âm bị từ chối. |
| `T041-10` | Job operation_id unique; old transport refs giữ qua retry/restart, job hết lease được tìm bằng index. |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 10 test xanh trên PostgreSQL thật
- [ ] **`T041-04`** chứng minh giữ nhiều thế hệ
- [ ] `T041-07` chứng minh camera/mic độc lập
- [ ] `room_name` UNIQUE

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-041.md`

## 9. ⚠ CẠM BẪY
Ghi đè `room_name` thế hệ cũ rồi mới gọi xoá phòng — nếu máy chủ chết ở giữa, **địa chỉ phòng cũ mất luôn** ⇒ không bao giờ thu hồi được ⇒ người xem cũ **vẫn nhận media**. Giữ một hàng mỗi thế hệ là bắt buộc.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Schema theo §5 và media-control-contract. Job lưu operation, old_transport_ids, deadline và lease bền vững; thời gian timestamptz UTC. Attempts và versions không âm, applied_version không vượt policy_version. FAILED là trạng thái thật, không đổi thành APPLIED khi lỗi. Không gọi SFU trong issue migration; nhiều generation phải cùng tồn tại.

Các giao diện này phải được tạo khi thực thi; chưa có mã runtime hay bằng chứng PASS. Đọc AGENT-START-HERE và TEST-CONVENTIONS; mọi phụ thuộc phải đã merge.

### Fixture và ca kiểm có thể chạy

**File kiểm thử:** `tests/integration/issue-041.test.ts`. Seed Match M1, user A, hai transport CAMERA/WATCH generation 1/2 với tên khác nhau; MICROPHONE generation 1 làm đối chứng. Thời gian SQL cố định t0, lease quá hạn t0−1ms, không sleep.

- T041-01…03: migration sạch; giá trị audience lạ ở từng cột bị CHECK; bốn policy mặc định OFF, version 0, status APPLIED.
- T041-04…06: hai generation cùng tồn tại và tên generation cũ giữ nguyên; trùng room_name hoặc tuple generation bị UNIQUE 23505.
- T041-07: camera desired OPPONENT_ONLY, microphone OFF được lưu độc lập.
- T041-08…10: truy vấn RUNNING lease<=t0 trả đúng job; FAILED hợp lệ, status lạ/deadline trước start/attempts âm bị CHECK. Trùng operation bị UNIQUE. Đóng rồi mở connection, old transport refs vẫn giữ nguyên; lưu EXPLAIN reclaim index.

**Ca trọng yếu — nội dung để triển khai:**

```sql
-- T041-08: truyền server now $1 cố định; không sleep chờ lease.
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT id,operation_id,old_transport_ids FROM public.media_jobs
WHERE status='RUNNING' AND lease_until <= $1 ORDER BY lease_until;
-- Seed lượng job đủ để truy vấn selective; assert đúng IDs quá hạn và index(status,lease_until).
SELECT generation,room_name FROM public.media_transports
WHERE match_id=$1 AND kind='CAMERA' AND audience='WATCH' ORDER BY generation;
-- Query thứ hai bind matchId riêng; assert còn cả generation1 và2, không ghi đè tên1.
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Dùng unique(match, kind, audience) thiếu generation; T041-04 đỏ; xóa tham chiếu cũ khi cập nhật job làm T041-10 đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:integration -- tests/integration/issue-041.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao bằng chứng job được lưu bền vững và generation history; không claim RTP/revoke PASS trước 112–115; schema FAILED phải đồng bộ 010.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
