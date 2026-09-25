# HỢP ĐỒNG CHUYỂN VÀ THU HỒI MEDIA — DEC-041

**Cập nhật:** 2026-09-22 · **Trạng thái:** Thiết kế đã chốt, chưa chạy media thật.
**Nguồn nghiệp vụ:** [REQ-MEDIA BR-MED-18…25](../01-requirements/REQ-MEDIA.md). Giữ DEC-033 (chỉ nguồn chuyển về OFF) và DEC-034 (không phát mới trước xác nhận).

## 1. DANH TÍNH VÀ PHẠM VI

`client_controls` khoá `(user_id, kind)` với kind CAMERA/MICROPHONE; phạm vi toàn tài khoản trên mọi thiết bị. `owner_client_id` là instance kết nối server cấp, gắn `app_session_id` đã xác thực, không chỉ local tab id client tự khai. Bổ sung `ownership_epoch`, `operation_id`, `target_client_id`, `operation_state`, `started_at`, `deadline_at`, `last_error`, `old_transport_refs` bền vững. Mỗi chuyển có command id, expected epoch; hai kết nối/transaction đồng thời chỉ một CAS thắng, cái còn lại nhận xung đột rồi đọc lại. Nguồn OFF cũng không được cướp owner nếu đang có operation.

Danh tính participant và token ràng buộc user + nguồn + client + epoch + room generation, do server suy ra; TTL token theo ISSUE-114. Camera/micro dùng participant và room tách biệt. Camera chuyển thu hồi ở hai transport camera có nguồn cũ; không xoay transport microphone. Người chơi đối diện có thể gián đoạn camera ngắn khi xoay thế hệ camera, nhưng mức/capture của họ không bị reset; nguồn microphone tiếp tục có đối chứng dương. Không hứa các participant dùng chung transport không bao giờ gián đoạn.

## 2. THAO TÁC VÀ THỜI GIAN

1. Transaction kiểm phiên/membership/PLAYER/ACTIVE, expected epoch; ghi operation STOPPING và mức đích OFF, chặn token phát của nguồn/epoch cũ và mới. Ghi toàn bộ địa chỉ transport cũ trước gọi ngoài. Thứ tự khoá phòng → người → ván; không giữ khoá khi gọi SFU.
2. Gửi yêu cầu dừng capture/unpublish nguồn cũ, đồng thời thu hồi tại SFU. ACK từ tab là thông tin hỗ trợ UI, **không đủ làm bằng chứng phân quyền**.
3. Mỗi lượt tối đa **30 giây** từ `started_at` bằng clock server. Một RPC tối đa 5 giây; thử lần đầu và tối đa 3 lần lại sau 1/2/5 giây; dừng tại deadline nếu đến trước. Không dùng sleep thật trong unit/integration test thời gian. Deadline không phải cam kết SFU luôn hoàn tất trong 30 giây.
4. Có bằng chứng §3 trước deadline: transaction kiểm đúng operation/epoch và điều kiện còn hợp lệ; owner mới + epoch mới, nguồn OFF, APPLIED. Chỉ một hành động bật riêng mới xin capture/token phát. Đã logout/match kết thúc/target mất quyền ⇒ CANCELLED, vẫn thu hồi cũ, không cấp owner mới.
5. `now >= deadline_at` mà chưa có bằng chứng ⇒ ERROR ở client_controls, FAILED ở media_policies/media_jobs, UI “Chưa chuyển/ngừng chia sẻ được. Thử lại.”; giữ fence, không nâng quyền. Retry kiểm lại điều kiện, cùng operation đang dở để reconcile, deadline mới cho lượt mới; không chạy hai job cùng operation. Lưu job qua restart. Bằng chứng muộn được reconcile đúng operation; có thể hoàn tất OFF nhưng **không tự capture/publish**. ACK sai operation/epoch bị bỏ.

Đứt kết nối control không chứng minh media đã dừng. ERROR không hoàn trả token/mức cũ; người dùng vẫn chơi cờ/chat. Không có timeout tự cướp nguồn hoặc fallback cho phát đôi.

## 3. BẰNG CHỨNG THU HỒI VÀ GIỚI HẠN SFU

APPLIED cần phản hồi quản trị SFU xác nhận remove/revoke publisher cũ trên **mọi transport của nguồn**, hoặc DeleteRoom thành công với generation cũ, cùng kiểm generation mới tách biệt. Query xác nhận participant/track cũ không còn; lỗi mạng, ACK client, local cache, một webhook đơn lẻ hoặc không nhận byte do toàn mạng chết **không đủ**. Ghi timestamp/operation/room/epoch, không ghi token.

Giữ chiến lược xoay generation bằng nonce mới ở ARCH-11…13. Không cấp token tới generation cũ nữa, không tái dùng tên cũ; token cũ không nhận/phát vào generation mới. **DeleteRoom không được suy thành token cũ bị thu hồi trên mọi loại triển khai.** Local/self-host có thể cho token cũ tạo lại room cũ tới khi hết hạn; không bao giờ nối publisher hợp lệ mới vào room đó. Đó là room không còn thuộc trạng thái sản phẩm; không được dùng việc không thấy byte ở room mới làm bằng chứng token đã bị vô hiệu tuyệt đối.

LiveKit Cloud hỗ trợ token revocation khi RemoveParticipant/UpdateParticipant; đặt cutoff tường minh theo API/version, kiểm ranh giới `nbf` và token mới được SFU refresh, không dựa TTL 60 giây để chấm dứt kết nối đang mở. Bằng chứng Cloud cho test cũ không thể rejoin có thể khác local; ghi riêng, không dùng mock hoặc giả định feature Cloud có trên local. Chính sách sản phẩm có thể thực hiện trên local bằng tách generation; test yêu cầu **token cũ không vượt vào generation đang phục vụ**. Nếu deployment đòi vô hiệu mọi token ở room cũ, phải có bằng chứng revocation thật của deployment đó, không nhận PASS bằng rotation đơn thuần.

Nguồn chính thức: [LiveKit participant management](https://docs.livekit.io/home/server/managing-participants/) (RemoveParticipant, revoke-token cutoff, CanPublish=false tự unpublish), [Tokens and grants](https://docs.livekit.io/frontends/reference/tokens-grants/). Nguồn kiểm ngày 2026-09-22; chưa xác minh phiên bản triển khai.

**Capture vật lý:** server bảo vệ đường truyền hợp lệ, không thể gọi `MediaStreamTrack.stop()` trong trình duyệt khác bị mất mạng hoặc sửa mã. App hợp tác stop/giải phóng khi nhận lệnh, reload/reconnect không tự capture. Không có ACK stop thì UI “Đã chặn luồng cũ; chưa xác nhận thiết bị cũ đã tắt.” SFU revoke xác nhận đủ cho chuyển quyền OFF dù tab cũ không phản hồi; không hứa tắt đèn webcam từ xa.

## 4. ORACLE NGHIỆM THU

- Ghi `accepted_at`, từng RPC/result, revoke confirmed, APPLIED/ERROR, capture/publish đầu tiên mới. Không capture mới trước confirmed + APPLIED + hành động bật riêng. Đúng deadline chưa confirmed ⇒ ERROR.
- Byte RTP/frame thật trước/sau: trước thu hồi phải có byte > 0; sau ổn định không có **media phát sinh mới** tới người mất quyền. Gói đã trong mạng/buffer trước confirmed có thể tới muộn, không hứa xoá dữ liệu đã nhận. Test dùng nguồn có dấu thứ tự/thời điểm để phân biệt mẫu mới với buffer; đo cửa sổ 5 giây sau pipeline drain được ghi nhận, kèm đối chứng dương bên còn quyền. Nếu không xác định được drain/mẫu thì chưa đủ bằng chứng.
- Đồng hồ giả kiểm timeout; kiểm SFU thật và browser thật riêng, không giả object RTP. Hai kết nối có barrier cho race; kiểm cả hai thiết bị khác mạng theo AC-MED-17/22.
- Tab cũ im lặng, ACK giả/muộn, RPC timeout/lost reply, restart sau revoke trước commit, retry lặp, logout/match-end giữa chuyển, stale token ở generation cũ/mới đều có test. Không ảnh hưởng nguồn còn lại; OFF sau thành công/lỗi.
