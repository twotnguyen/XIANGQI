# Media trực tiếp và quyền theo track

Đọc R11 trong [product](01-PRODUCT.md). Quyết định này thay các ví dụ còn mở trong [nghiên cứu media](../planning/RESEARCH_MEDIA.md). Không ghi/egress cuộc gọi.

## SFU và bốn phòng truyền tải

Mỗi match có bốn room LiveKit opaque độc lập: PRIVATE_CAMERA, PRIVATE_MICROPHONE, WATCH_CAMERA, WATCH_MICROPHONE. Private chỉ hai players; watch tối đa hai publisher + năm spectators. Game room vẫn chỉ một room nghiệp vụ, không hiển thị bốn room cho người dùng.

| Vai trò | Private camera/mic | Watch camera/mic |
|---|---|---|
| Player | subscribe; publish đúng source nếu policy khác OFF | publish-only đúng source của mình khi policy public |
| Spectator | không cấp token | subscribe-only đúng room đã cấp |
| Người ngoài/đã bị thu hồi | không | không |

Token room-specific, identity từ server `userUUID-controlEpoch`, TTL 60 giây, `canPublishData:false`, chỉ source camera hoặc microphone tương ứng. Viewer `canPublish:false`. Player public `canSubscribe:false`. Không dùng client metadata/ẩn tile thay cho quyền. [Token grants](https://docs.livekit.io/frontends/reference/tokens-grants/).

Một player capture camera/mic sau thao tác người dùng; clone track của chính mình khi phát vào private và watch, không capture hai lần thiết bị. Tổng cộng tối đa 4 room connections/player, 2/viewer. Với camera giới hạn ban đầu 360p 15fps; mic echoCancellation/noiseSuppression. Đo Safari/iPhone và Android ở spike trước hoàn thiện UI. Khi không có viewer vẫn giữ policy, không cần publish watch cho tới khi có viewer; token plan đánh thức đúng lúc.

## Thu hồi luồng ứng dụng với self-host

LiveKit self-host không vô hiệu JWT cũ ngay khi RemoveParticipant. TTL ngắn một mình không đủ bảo vệ người xem bị thu hồi. [Giới hạn upstream](https://docs.livekit.io/frontends/reference/tokens-grants/).

**Thiết kế bắt buộc: room generations.** DB `media_transports(match_id, kind, audience, generation, room_name, status)` và `media_policy_jobs(id,match_id,desired_version,status,attempts,last_error)` server-only. Mỗi room_name chứa nonce 128-bit, không tái sử dụng. Khi cần thu hẹp quyền hoặc kick viewer/controller:

1. Ghi desired policy/membership mới và đặt transport affected ROTATING; endpoint không cấp token cũ/mới trong thời gian này.
2. Dừng/unpublish local source ngay ở client yêu cầu OFF; server gọi UpdateParticipant canPublish:false đối với nguồn bị thu hẹp, rồi DeleteRoom affected cũ, chờ ack. Trên Cloud gọi RemoveParticipant với revoke_token_ts cho từng identity cũ trước DeleteRoom. Source còn private không bị đổi nếu chỉ thu hẹp watch.
3. Chỉ sau ack tạo generation mới, tên mới; kiểm lại version/membership rồi cấp grants mới cho danh sách còn hợp lệ.
4. Publish lại track của các player còn được phép; client chỉ nhận room names từ plan backend mới. Đánh dấu APPLIED, broadcast policy và refresh plan.

JWT cũ có thể tái tạo room cũ ở self-host nhưng room đó không còn nguồn media từ client hợp lệ; không bao giờ tái dùng room_name cũ. Chặn token cũ xem **media mới**, không hứa thu hồi dữ liệu đã tới máy người nhận. Test đối nghịch giữ JWT cũ, rejoin room cũ, publish private source mới ở generation mới: viewer cũ không nhận byte/track mới.

Xử lý PRIVATE source khi player tắt: rotate private source room để token publish cũ không thể phát vào room đối thủ đang dùng. WATCH source khi public→private/OFF: rotate watch source cho cả hai publishers, ngay cả nếu chỉ A đổi; B rejoin tự động với policy hiện hành. Khi viewer bị kick/đổi mã/room khóa: rotate cả hai WATCH rooms; khi controller bị thay/đăng xuất: rotate tất cả rooms mà identity cũ từng tham gia. Khi match end: delete cả bốn, không tạo mới. Restart: mark policy OFF, retire room generations cũ trước cấp session mới.

Network partition SFU: không báo đã thu hồi khi DeleteRoom thất bại. UI hiển thị “Đang ngừng chia sẻ”, local tracks dừng nếu người phát còn online; API trả MEDIA_UNAVAILABLE sau timeout 5 giây, job retry 1/2/5 giây tối đa 3 lần rồi báo cần xử lý. Desired quyền thu hẹp vẫn giữ, không rollback sang public. Không cấp token mới cho epoch chưa dọn. Khi kết nối phục hồi job đối soát trước cấp lại. Trạng thái này không chặn nước cờ, nhưng test privacy gate không được đánh dấu PASS khi server chưa thực thi side effect.

Đây là cơ chế chặn cấp quyền/phát mới của ứng dụng trong lúc thu hồi chưa hoàn tất, với gián đoạn ngắn có chủ đích. Không ghi “thu hồi tức thời bất kể SFU mất mạng”; hệ thống phân tán không bảo đảm điều đó. Local spike phải chứng minh viewer dùng token cũ không nhận nguồn mới từ client player chính thức sau rotation. Không dùng room-generation để tuyên bố JWT self-host đã bị revoke.

## API details

`POST /media/session`: membership+ACTIVE+session+controller; server suy ra identities/room names/grants. Viewer role không cần player controller nhưng cần tab controller cho viewer. Return `{policyVersion, transports:[{kind,audience,roomName,url,token,generation,canPublish}], policy}`; no-store. Request không chứa role/identity/grants tùy ý. Policy write accepts expected `policyVersion`; mismatch CONFLICT. Một policyVersion chung cho cặp camera/mic của mỗi user (khớp media_policies.policy_version); camera/mic vẫn có audience độc lập. Đổi một mục tăng version một lần; hai update cùng base version chỉ một commit, client đọc policy mới trước retry mục còn lại. Version A và B độc lập. Room transport rotation dưới lock theo match; serialize jobs cùng match để hai request A/B không ghi đè.

`PATCH /media/policy`: ghi desired→apply external→return `{status:'APPLIED'|'APPLYING',policyVersion,policy}`. MediaUnavailable báo lỗi riêng; UI vẫn hiển thị desired và pending. Không hold SQL transaction qua API SFU. Mọi retry có job ID idempotent. Late token issuance kiểm lại transport generation ngay trước trả response; nếu rotation bắt đầu sau trả, old room sẽ bị delete trước thế hệ mới phát.

Token không lưu localStorage, không log, không trả trong generic socket broadcast. Token plan chỉ private HTTPS response cho người nhận. Room maxParticipants là phòng vệ phụ, slot 5 vẫn do SQL game server.

## UX và kiểm thử

Mỗi người có hai select với nhãn đầy đủ: Tắt / Chỉ đối thủ / Đối thủ và người xem. Mặc định OFF. OFF stop clone và capture source khi không còn consumer; private microphone vẫn giữ nếu chỉ tắt camera. Refresh/takeover/reconnect media trở OFF cần thao tác bật lại. Viewer chỉ volume/mute local, không có nút publish. Preview bản thân muted, đối thủ không nhận hai bản âm thanh (private only).

Matrix 3×3 camera/mic của A, B private/off và năm viewer; tự đổi token grants không thành công; viewer không vào private; khóa phòng/mã mới/takeover cắt generation cũ; quyền public A không bật B; ngừng source không làm dừng source khác. Kiểm tra media bytes/track subscriptions, không chỉ ảnh UI ẩn. Cuộc gọi thật qua hai mạng và relay là acceptance riêng.

## Hosting

Local LiveKit Docker dev với API keys test, không public dev key. LAN điện thoại dùng HTTPS dev được thiết bị tin cậy; HTTP IP LAN không phải secure context để camera hoạt động. Online đề xuất LiveKit Cloud resource người dùng cấp; vẫn giữ generation design cho nhất quán. Nếu Cloud không có tài nguyên, deploy gate chờ cấu hình, không tự thay bằng mock hoặc mua gói. Self-host public là lựa chọn thay thế chỉ khi có host UDP/TCP/TLS/TURN phù hợp, không áp vào Render web service một HTTP port. [Ports](https://docs.livekit.io/transport/self-hosting/ports-firewall/), [local](https://docs.livekit.io/transport/self-hosting/local/), [deployment](https://docs.livekit.io/transport/self-hosting/deployment/).

## Mô hình đe dọa và giới hạn cụ thể

Self-host: bảo vệ khỏi người xem sửa client hoặc giữ JWT cũ khi player dùng ứng dụng chính thức. Room cũ có thể bị tái tạo bằng token cũ và token được SFU refresh không nhất thiết chỉ sống 60 giây; vì vậy generation, không TTL, cô lập nguồn mới. Một publisher cố tình giữ token và tiếp tục phát nguồn mình có vào room cũ có thể gửi cho viewer cũ; self-host không cung cấp thu hồi JWT nghiêm ngặt cho cặp client thông đồng. Người chơi đã nhận hình/tiếng riêng cũng có thể phát lại bằng ứng dụng khác, kể cả dùng Cloud. Không đặt mục tiêu ngăn hành vi người nhận cố ý ghi/phát lại vào đồ án.

Cloud: thêm RemoveParticipant với revoke_token_ts cho mọi identity cũ rồi DeleteRoom; test token cũ reconnect bị từ chối theo hỗ trợ provider. Nếu chỉ triển khai local, ghi rõ mức kiểm chứng self-host trong report; không đánh đồng với Cloud token revocation.

APPLIED nghĩa desired policy version còn hiện hành, thao tác thu hồi SFU đã xác nhận và generation mới sẵn cấp đúng grants; không cần đợi người đang offline reconnect. Client publication có trạng thái riêng CONNECTING/LIVE/ERROR. Jobs cùng match serialize, sau external effect đọc lại desired_version để coalesce bản mới nhất, cleanup generation orphan. Nếu SFU mất liên lạc, media cũ có thể còn chảy đến khi thao tác thu hồi thành công; UI nói rõ chưa áp dụng xong, không báo quyền đã bảo vệ thành công.
