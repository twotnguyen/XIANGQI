# Nghiên cứu media trực tiếp: LiveKit SFU và quyền camera/mic

> Tài liệu nghiên cứu đầu vào, không phải hợp đồng thực thi cuối. Đọc docs/specs/05-AUTH.md hoặc docs/specs/06-MEDIA.md từ repo root; các lựa chọn khác trong nghiên cứu không tự mở rộng phạm vi.
**Ngày tra cứu:** 2026-09-12.  
**Phạm vi:** thiết kế cho 2 người chơi, tối đa 5 người xem; không ghi âm/ghi hình; camera và mic độc lập theo `OFF | OPPONENT_ONLY | OPPONENT_AND_SPECTATORS`. Đây là tài liệu nghiên cứu/đầu vào cho issue, chưa cài đặt hay mở tài khoản dịch vụ.

## Kết luận kiến trúc

Chọn **LiveKit SFU** cho media, còn backend game là nguồn quyền duy nhất. Không cấp LiveKit API secret cho trình duyệt. Trình duyệt chỉ nhận JWT ngắn hạn từ endpoint backend sau khi backend xác thực phiên Supabase, vai trò trong ván, sức chứa người xem và chính sách media hiện tại. LiveKit yêu cầu access token để kết nối; JWT được ký bằng API secret, do đó secret không được đưa ra frontend. [LiveKit: access tokens and grants](https://docs.livekit.io/frontends/reference/tokens-grants/), [LiveKit: endpoint token generation](https://docs.livekit.io/frontends/build/authentication/endpoint/).

Để quyền là quyền thực thi ở máy chủ/SFU thay vì chỉ ẩn ô video trên UI, dùng **bốn LiveKit room theo từng ván**. Mỗi room chỉ nhận đúng source mà nó được phép chứa:

| Room LiveKit (tên opaque) | Thành viên | Grant phát | Grant nhận | Mục đích |
| --- | --- | --- | --- | --- |
| `xq-{gameId}-private-camera` | Hai người chơi | Chỉ `camera` | Hai người chơi | Camera khi policy không phải `OFF` |
| `xq-{gameId}-private-mic` | Hai người chơi | Chỉ `microphone` | Hai người chơi | Mic khi policy không phải `OFF` |
| `xq-{gameId}-public-camera` | Người chơi có camera `OPPONENT_AND_SPECTATORS` + người xem đã có ghế | Chỉ người chơi, chỉ `camera` | Người xem; người chơi không cần subscribe | Phát camera được chủ luồng cho người xem |
| `xq-{gameId}-public-mic` | Người chơi có mic `OPPONENT_AND_SPECTATORS` + người xem đã có ghế | Chỉ người chơi, chỉ `microphone` | Người xem; người chơi không cần subscribe | Phát mic được chủ luồng cho người xem |

Mỗi người chơi nối vào hai private room để nhận/phát hai source tách biệt. Khi họ cho phép người xem một source, client nối thêm vào public room đúng source đó để phát bản sao media của **chính họ**. Người xem nối subscribe-only vào các public room có source hiện được bật. Room public đặt `maxParticipants: 7` để phòng vệ theo giới hạn 2 người chơi + 5 người xem; backend vẫn phải cấp và giữ tối đa 5 ghế xem theo giao dịch database, vì LiveKit không biết quy tắc vai trò game.

Video grant hỗ trợ `canPublish`, `canSubscribe`, `canPublishData` và `canPublishSources`; ví dụ chính thức cho phép token chỉ phát camera. Vì vậy spectator token phải có `canPublish: false`, `canPublishData: false`, `canSubscribe: true`; player token của camera room chỉ được `canPublishSources: [camera]`, mic room chỉ `[microphone]`. [LiveKit: access-token video grants](https://docs.livekit.io/frontends/reference/tokens-grants/).

Không dùng LiveKit data channel cho chat game: chat người chơi và chat người xem đi qua backend realtime với xác thực/ủy quyền riêng. Do đó mọi media token đều có `canPublishData: false` và không vô tình mở một kênh chat chung giữa các room media.

## Vì sao không dùng một room và chỉ ẩn UI

Trong một room, participant thường có thể subscribe mọi track được phát; auto-subscribe mặc định là `true`. Server API có `UpdateSubscriptions`, nhưng unsubscribe chỉ dừng media hiện tại; người nhận có thể subscribe lại nếu token vẫn có `canSubscribe`. [LiveKit: track subscriptions](https://docs.livekit.io/transport/media/subscribe/), [LiveKit: RoomService UpdateSubscriptions](https://docs.livekit.io/reference/other/roomservice-api/).

SDK có `localParticipant.setTrackSubscriptionPermissions(...)` để publisher hạn chế subscriber theo identity/track. Đây là lựa chọn tốt cho UI đơn giản, nhưng lời gọi nằm ở client của publisher. Nó không đáp ứng tiêu chí backend là authority trong trường hợp client bị sửa: publisher có thể đặt lại danh sách cho phép hoặc để mặc định cho tất cả. [LiveKit: camera/microphone track permissions](https://docs.livekit.io/transport/media/publish/), [LiveKit JS `ParticipantTrackPermission`](https://docs.livekit.io/reference/client-sdk-js/interfaces/ParticipantTrackPermission.html).

Tách room biến giới hạn thành quyền room-level mà SFU kiểm tra bằng JWT: spectator không hề có token cho private rooms, public-camera token không hợp lệ để vào public-mic, và token subscribe-only không thể phát. Đây là mức bảo vệ phù hợp cho người xem hay client spectator bị sửa. Người chơi đã được phép nhận luồng riêng của đối thủ vẫn có thể tự ghi màn hình hoặc dùng client bị sửa để phát lại luồng nhận được; không có thiết kế web/SFU nào ngăn một người đã nhận plaintext media làm điều đó. Đây là giới hạn cần nêu rõ khi bảo vệ đồ án.

## Luồng quyền cụ thể

### Dữ liệu authority trong backend

Backend giữ một bản ghi policy có version tăng đơn điệu, ví dụ:

```text
game_media_policy(game_id, player_id, camera_audience, microphone_audience,
                  version, changed_at)
camera_audience, microphone_audience ∈ { OFF, OPPONENT_ONLY, OPPONENT_AND_SPECTATORS }
```

Chỉ người đang giữ ghế người chơi trong ván `ACTIVE` được gọi `PATCH /games/{id}/media-policy`. Request chỉ sửa source của chính người gọi. Backend phải kiểm tra session Supabase, game/seat, `expectedVersion` và ghi policy + audit event trong một transaction. UI nhận trạng thái từ backend; không coi metadata LiveKit hay trạng thái local browser là bản ghi quyền.

Sau khi transaction thành công, worker/command handler backend thực hiện side effect LiveKit và broadcast state mới cho UI. Nếu LiveKit call thất bại, đánh dấu command cần retry và không báo `applied` trước khi trạng thái SFU được đối soát. API Room Service của LiveKit là API backend để quản lý participant/track; các lời gọi này cần `roomAdmin`, do API secret ký server-side. [LiveKit: Room Service API](https://docs.livekit.io/reference/other/roomservice-api/).

### Bảng chuyển trạng thái cho một source

| Chuyển đổi | Private room của source | Public room của source | Kết quả có thể kiểm chứng |
| --- | --- | --- | --- |
| `OFF → OPPONENT_ONLY` | Backend cấp token publish+subscribe đúng source hoặc cập nhật `canPublish: true`; client phát source | Không cấp token/join | Chỉ đối thủ có thể subscribe source |
| `OPPONENT_ONLY → OPPONENT_AND_SPECTATORS` | Không đổi | Backend cấp public token publish-only cho chính player; client phát source của họ; cấp spectator token subscribe-only cho các ghế đang xem | Người xem nhận source đó, không nhận source khác |
| `OPPONENT_AND_SPECTATORS → OPPONENT_ONLY` | Không đổi | Backend gọi `RemoveParticipant(publicRoom, playerIdentity)`; client public room nhận `PARTICIPANT_REMOVED` và không được xin token mới khi policy đã hẹp | Người xem dừng nhận ngay khi SFU remove; source private vẫn tới đối thủ |
| `OPPONENT_ONLY → OFF` | Backend gọi `UpdateParticipant` trong private room với `canPublish: false`, `canSubscribe: true` | Không có membership | Track đã phát tự unpublish, player vẫn nhận source của đối thủ |
| `OPPONENT_AND_SPECTATORS → OFF` | Cùng bước private ở trên | Remove player khỏi public room trước hoặc song song | Cả đối thủ và viewer dừng nhận source |

LiveKit nêu rõ thu hồi `canPublish` sẽ tự unpublish toàn bộ track participant đã phát. Do camera và mic nằm ở private room khác nhau, lệnh này chỉ ảnh hưởng source cần tắt, không vô hiệu hóa source còn lại. `RemoveParticipant` cưỡng chế disconnect và client nhận lý do `PARTICIPANT_REMOVED`. [LiveKit: updating participant permissions](https://docs.livekit.io/intro/basics/rooms-participants-tracks/participants/), [LiveKit: server-initiated disconnect](https://docs.livekit.io/intro/basics/connect/).

Khi bật/tắt public, backend chỉ cấp lại token sau khi đọc lại policy hiện hành và xác nhận requester vẫn ở ghế player. Khi người xem vào/rời game, backend atomically giữ/trả ghế spectator rồi mới phát/thu token của hai public room. Viewer thứ sáu nhận lỗi domain `SPECTATOR_CAPACITY_REACHED`, không nhận bất kỳ LiveKit token nào.

### Token và reconnect

- Mỗi token gắn với **một** `room`, một identity opaque và grant tối thiểu. Không dùng username, email hay tên thật làm identity/room name: LiveKit nói các giá trị này được ghi log/trace và không được PII redaction. [LiveKit: access-token privacy note](https://docs.livekit.io/frontends/reference/tokens-grants/).
- Endpoint token phải bỏ qua room/identity/role do frontend tự gửi; các giá trị này được suy ra từ session và database. Tài liệu endpoint cũng yêu cầu trả 4xx cho field client không được phép đặt và tự thêm authentication cho endpoint. [LiveKit: endpoint token generation](https://docs.livekit.io/frontends/build/authentication/endpoint/).
- Dùng TTL ngắn cho token cấp mới (đề xuất ban đầu **60 giây**, cấu hình chứ không hard-code) và client chỉ reconnect qua endpoint backend, không lưu JWT lâu dài ở localStorage. Con số 60 giây là quyết định sản phẩm cần test, không phải mặc định của LiveKit.
- LiveKit chủ động refresh token cho client đang kết nối; token expiry chỉ kiểm tra khi kết nối ban đầu, không tự cắt một kết nối đang tồn tại. Vì thế TTL không thay `RemoveParticipant` hoặc `UpdateParticipant` khi thu hẹp quyền. [LiveKit: token lifecycle](https://docs.livekit.io/frontends/reference/tokens-grants/).

**Khác biệt bắt buộc phải ghi trong cấu hình triển khai:**

- **LiveKit Cloud:** `RemoveParticipant` hoặc update permissions revoke token hiện tại; client bị remove không thể dùng JWT cũ để reconnect. Có thể truyền `revoke_token_ts` để cắt rõ cửa sổ clock-skew. Đây là lựa chọn có khả năng thu hồi reconnect mạnh nhất từ LiveKit docs. [LiveKit: token revocation](https://docs.livekit.io/frontends/reference/tokens-grants/), [LiveKit: remove participant](https://docs.livekit.io/intro/basics/rooms-participants-tracks/participants/).
- **Self-hosted LiveKit:** removal/update permission **không** invalidate JWT đã phát. LiveKit khuyến nghị token TTL ngắn và không sinh token mới cho participant đã remove. Vì vậy local self-host có thể dừng luồng của connection hiện có bằng API, nhưng một client đối nghịch còn JWT chưa hết hạn có thể thử rejoin trong cửa sổ TTL. Không được tuyên bố local self-host có revoke reconnect tức thời. [LiveKit: self-hosted token-revocation limitation](https://docs.livekit.io/frontends/reference/tokens-grants/).

Sau mỗi `PARTICIPANT_REMOVED`, `JOIN_FAILURE`, reconnect hay browser refresh, frontend gọi backend để lấy plan connection mới. Backend đối chiếu lại policy/role/capacity. Nếu policy hiện tại không cho room đó, response là 403 và UI dừng tile. Đây là kiểm soát ứng dụng; nó không xóa giới hạn JWT self-host nêu trên khi client cố tình gọi thẳng LiveKit bằng JWT cũ.

## Media duplication và phương án Cloud về sau

Ở local/self-host, player phải phát camera/mic của chính mình vào private room và, khi công khai, vào public room tương ứng. Trước khi chọn API frontend cuối cùng, cần có proof-of-concept trên Chrome/Android Safari cho việc dùng cùng capture hoặc bản clone track ở hai `RTCPeerConnection`, theo dõi quyền camera/mic, CPU và việc stop track không làm hỏng room còn lại. Đây là điểm chưa được tài liệu LiveKit ở trên chuẩn hóa thành một pattern; phải kiểm chứng trước khi triển khai đại trà.

LiveKit Cloud/Private Cloud có `ForwardParticipant`, cho phép backend forward participant và tất cả published tracks từ room nguồn sang room đích; forwarding dừng khi source rời hoặc participant forwarded bị remove. Tính năng này **không có ở self-hosted LiveKit** và API forward theo participant, không chọn riêng một track. Nếu dùng về sau, kiến trúc bốn room hiện tại vẫn phù hợp: forward `private-camera → public-camera` và `private-mic → public-mic`, nên từng source vẫn độc lập; browser không cần phát bản sao public. [LiveKit: Forward participant](https://docs.livekit.io/intro/basics/rooms-participants-tracks/participants/).

Không đưa Cloud forwarding vào mốc local hiện tại vì người dùng chưa cho phép chi phí. Đừng thay nó bằng egress/recording: dự án không được ghi hình/ghi âm và egress là dịch vụ khác.

## Local trước; ràng buộc Vercel/Render

### Local demo

LiveKit có development mode: `livekit-server --dev`, mặc định bind `127.0.0.1:7880`, dùng dev key/secret công khai chỉ cho local (`devkey` / `secret`). Có thể thêm `--bind 0.0.0.0` để thiết bị khác cùng LAN thử nghiệm. Không mang secret dev hay HTTP không TLS sang môi trường public. [LiveKit: running locally](https://docs.livekit.io/transport/self-hosting/local/).

Mốc local có thể chạy frontend, backend game và LiveKit trên máy phát triển. Test phải có ít nhất hai browser profile/thiết bị và một viewer; hai tab cùng profile không thay thế test quyền identity riêng. Khi test LAN/NAT khác, ghi nhận ICE candidate/connection state để không nhầm demo localhost với gọi qua Internet.

### Vercel + Render

- **Vercel:** phù hợp host frontend web; không đặt SFU hoặc game Socket server bền vững lên Vercel Functions. Vercel nói Functions là invocation có thời hạn; tài liệu limits hiện cũng nêu Functions không đóng vai trò WebSocket server. [Vercel: Functions lifecycle](https://vercel.com/docs/functions), [Vercel: limits—WebSockets](https://vercel.com/docs/limits).
- **Render:** phù hợp backend HTTP/WebSocket game và endpoint token. Render web service nhận public traffic qua một HTTP port duy nhất (mặc định 10000), nhưng hỗ trợ WebSocket. [Render: web services](https://render.com/docs/web-services), [Render: WebSockets](https://render.com/docs/websocket).
- **Không dùng Render web service để tự host LiveKit SFU public** theo kế hoạch này. Đây là suy luận từ yêu cầu LiveKit: server production cần nhiều port công khai cho ICE UDP range, ICE/TCP và TURN, còn Render public web service chỉ route một HTTP port. LiveKit yêu cầu ví dụ `7881/TCP`, `3478/UDP`, `50000–60000/UDP` (hoặc cấu hình thay thế), TLS/domain và TURN để phủ mạng bị chặn UDP. [LiveKit: ports/firewall](https://docs.livekit.io/transport/self-hosting/ports-firewall/), [LiveKit: deployment and TURN](https://docs.livekit.io/transport/self-hosting/deployment/).

Khi chuyển public, cần một quyết định mới: dùng LiveKit Cloud (có token revocation + forwarding) hoặc self-host LiveKit trên VM/container có public UDP/TCP ports, domain, TLS và TURN. Không coi Vercel/Render là quyết định thay thế cho hạ tầng WebRTC này. Chưa tạo dịch vụ trả phí hay deploy trong giai đoạn lập kế hoạch.

## Quy trình kiểm thử/nghiệm thu cho issue media

1. Tạo game có hai player `A`, `B`; nhập năm spectator `S1…S5` qua backend. Xác nhận `S6` không có spectator seat và endpoint media không trả token.
2. Đặt A: camera `OPPONENT_AND_SPECTATORS`, mic `OPPONENT_ONLY`; B: camera/mic `OFF`. Xác nhận B thấy/nghe camera A; S1–S5 chỉ thấy camera A, không nghe mic A và không thấy media B.
3. Trong lúc room đang chạy, hạ camera A từ public xuống opponent-only. Xác nhận backend có audit policy version mới, API remove public-camera thành công và mọi `S` nhận stop/unsubscribe; B vẫn thấy A.
4. Hạ mic A từ opponent-only xuống off. Xác nhận private-mic track unpublish, B hết nghe; private-camera A không bị tắt. Đây là test chứng minh hai source độc lập.
5. Đổi viewer token, room name, `canPublish`/source hoặc identity ở client request. Endpoint phải 403/4xx; test token spectator không phát được camera/mic, public-camera token không vào public-mic/private room.
6. Thử client spectator sửa UI để gọi subscribe track ở private room: không có JWT hợp lệ nên LiveKit join thất bại. Thử ở cùng public room: chỉ có track mà publisher đã phát vào public room.
7. Với Cloud (nếu đã được phê duyệt), verify `RemoveParticipant` + `revoke_token_ts` ngăn reconnect JWT cũ. Với local self-host, ghi nhận giới hạn token TTL/rejoin thay vì ghi pass sai; verify backend thường không cấp token mới sau revoke.
8. Chạy test thiết bị thật giữa hai mạng có NAT khác nhau trước mốc deploy Internet. Localhost không chứng minh TURN/TLS hay UDP fallback.

## Rủi ro và điểm cần quyết định trong issue thực thi

- **Không được lẫn privacy policy và browser state.** Bất cứ side effect LiveKit nào không hoàn tất phải có retry/đối soát; UI hiển thị trạng thái `APPLYING` hoặc lỗi, không tự kết luận đã private/public.
- **Self-host local không có strict reconnect revocation.** Đây là giới hạn upstream có tài liệu; LiveKit Cloud hoặc chấp nhận cửa sổ TTL là lựa chọn triển khai về sau.
- **Public media có thêm kết nối/publish.** Tối đa quy mô yêu cầu nhỏ (2 player, 5 viewer), nhưng phải đo CPU/băng thông của browser ở POC trước khi chốt UI production.
- **Không có media E2EE trong quyết định này.** Đây không phải yêu cầu đồ án và không giải quyết việc opponent đã nhận media có thể ghi/capture.
- **Room LiveKit không phải room game.** Game room/capacity, chat, nước cờ, lời mời và policy tồn tại trong PostgreSQL/backend; LiveKit room names chỉ là media transport thực thi theo `gameId` opaque.

## Handoff cho bộ issue

Tách thành ít nhất các issue: (1) token service và grant matrix, (2) policy state machine + transaction/audit/outbox retry, (3) LiveKit room orchestration/private-public connections, (4) UI camera/mic controls và device POC, (5) spectator admission + private/spectator chat isolation, (6) adversarial authorization/integration test matrix, (7) runbook local và quyết định deploy Cloud/VM sau khi local pass. Không tạo issue "một room + ẩn video" vì không đạt authority server đã yêu cầu.
