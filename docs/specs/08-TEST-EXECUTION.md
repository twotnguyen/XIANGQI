# Kế hoạch thực thi kiểm thử

Đọc cùng issue đang làm. Spec 01–07 quyết định hành vi sản phẩm; tài liệu này quyết định cách chứng minh hành vi. Ma trận dưới là mức tối thiểu, cộng với **tất cả** acceptance trong issue, không thay thế chúng. ID `TNNN-xx` ổn định; thêm ID vào tên test và báo cáo để agent sau tra được. Tên file test cụ thể lấy trong issue; thay đường dẫn phải ghi mapping trong evidence.

## Harness và trách nhiệm bàn giao

| Owner | Đầu ra phải dùng được bởi issue sau | Kiểm chứng harness |
|---|---|---|
| ISSUE-001 | Vitest unit/integration configs, Playwright config, root scripts forward args; CI lint/typecheck/build/unit hiện có | Chạy một file thật bằng đường dẫn từ root; chọn đường dẫn sai phải exit khác 0, không `passWithNoTests`; integration config nhận cả `tests/integration/**/*.test.ts` và `tests/media/spike.ts` |
| ISSUE-002 | `tests/fixtures/positions.ts`: makePosition không thêm quân ngầm, tọa độ theo contracts | Fixture invalid phát hiện trùng square/ID; fixture valid luôn có đủ hai tướng; test pure function không sửa input |
| ISSUE-006 | `tests/fixtures/integration.ts`: createTestApp, seedUsers, authAs, resetTestData; real Supabase local + pg | Factory trả app và async dispose; seed trả ID A/B/S1..S6 với runId; authAs lấy session thật qua Auth; dispose đóng pool/socket/listener kể cả assertion fail |
| ISSUE-012/013 | Socket helper connectUser, điều khiển clock/scheduler qua dependency injection, barrier cho transaction races | connectUser chờ handshake/ack, timeout báo lỗi; testClock now/set/advance và chạy due tasks rõ ràng; không dùng endpoint debug public |
| ISSUE-021 | Worker supervisor harness, injected fault/cancellation, actual child smoke | Unit dùng fake worker để đặt race; integration phải spawn child thật và chứng minh process exit/timeout không treo API |
| ISSUE-024 | LiveKit local thật, browser synthetic audio/video publishers, stats helper | Chứng minh authorized peer nhận frame/byte tăng trước khi dùng zero incoming làm bằng chứng deny; source grants và retired-generation test không mock SFU |
| ISSUE-030 | Bộ acceptance và load entrypoints tái lập | Fresh checkout chạy theo runbook, không phụ thuộc state từ máy tác giả |

Factory/harness là API test nội bộ, không mở cổng bypass auth trong sản phẩm. ISSUE-006 inject Auth fixture trước khi BFF login được viết ở007; seed Auth admin qua local endpoint, không phụ thuộc login UI. Dọn dữ liệu theo runId và thứ tự FK, không truncate/reset DB dùng chung. Reset migration chỉ trên Supabase local đã xác nhận host loopback + project test; nếu không xác nhận được thì fail trước lệnh reset. Test integration dùng role app_server, phép thử RLS dùng cả anon và authenticated; dùng superuser cho mọi assertion sẽ che lỗi quyền.

CI tăng theo các lane đã được triển khai:001 unit;006 integration DB;005 E2E component/board khi có harness;015 E2E online;024 real-SFU tests;023 AI benchmark;030 load. Issue đầu tiên thêm lane chịu trách nhiệm cập nhật CI/runbook và service setup. Benchmark/load có thể là workflow riêng chạy thủ công trên máy đủ cấu hình, nhưng PR liên quan phải có evidence thực và không được coi lane chưa chạy là pass. Pin runtime/tool/containers, dùng lockfile frozen, readiness probe thay sleep cố định.

## Ma trận test tối thiểu theo issue

Mỗi mục phân tách bằng `;` tương ứng lần lượt `TNNN-01`, `TNNN-02`… trong hàng. Nếu một mục có nhiều nhánh, parameterize hoặc tách suffix a/b; không chỉ kiểm happy path. U=unit, I=integration với service thật, E=browser E2E, M=manual/provider/hardware, B=benchmark/load.

| Issue | Lane | Các case bắt buộc và kết quả |
|---|---|---|
| ISSUE-001 | U/build | Clean install/build và health 200; factory close không giữ handle; script chọn sai file exit khác 0 |
| ISSUE-002 | U | Board 90 ô/32 quân đúng side và turn; reject tọa độ ngoài biên/số lẻ/unknown mutation fields; key bỏ qua ID nhưng phân biệt side/type/turn và vị trí |
| ISSUE-003 | U | Cả 7 loại quân, biên bàn/cung/sông, quân cùng phe, vật cản; mã cản chân/tượng cản mắt/pháo 0–1–2 ngòi; tự chiếu và mở mặt tướng bị cấm, bắt quân không mutate input |
| ISSUE-004 | U | Checkmate thua và stalemate thua theo fixture độc lập; lần xuất hiện 2 chưa hòa và 3 hòa cùng turn; hết nước ưu tiên terminal trước repetition |
| ISSUE-005 | E/U | Render 32 quân đúng giao điểm và chữ; lật bàn vẫn gửi đúng tọa độ; tap/keyboard chọn–đi/bỏ chọn và UI disabled không phát move |
| ISSUE-006 | I | Migration từ DB local sạch, constraints/FK/unique; anon và authenticated không đọc/ghi bảng app hay gọi private function; rollback không lưu một nửa dữ liệu; tranh username chỉ một thành công |
| ISSUE-007 | I/E | Đăng ký–verify inbox local–username login–logout; sai user/password cùng lỗi công khai và không lộ email; recovery PKCE, token dùng lại/hết hạn bị từ chối; session revoked không dùng lại HTTP/socket |
| ISSUE-008 | I/E/M | Google mới onboarding rồi giữ profile khi login lại; Google cùng verified email theo provider thật; username tranh chấp chỉ một nhận, displayName invalid reject; callback PKCE lỗi/code dùng lại và refresh trang không exchange lần hai |
| ISSUE-009 | I/E | Gửi/nhận/accept/reject/cancel/unfriend đúng actor; self/duplicate/cross-request không tạo hai quan hệ; presence chỉ audience hợp lệ, disconnect cập nhật |
| ISSUE-010 | I/E | Tạo room owner và ready start đúng hai người; tranh slot cuối chỉ một join/start; PUBLIC được liệt kê, CODE_ONLY/LOCKED không lộ; chặn người đã có room hoặc active AI |
| ISSUE-011 | I/E | Direct invite đúng recipient và accept/reject; link qua login vẫn join rồi xóa token; expiry/rotate/used grant/role mismatch bị từ chối; hai accept cạnh tranh không vượt ghế |
| ISSUE-012 | I | A đi đúng lượt cả HTTP/socket tạo đúng một event/version; wrong turn/role/control/illegal không đổi DB; cùng command retry trả appliedVersion gốc, payload đổi reject; finalizer giải phóng slot và kết thúc room atomic |
| ISSUE-013 | U/I/E | Hết giờ tại deadline trước move, unlimited không timeout; reconnect trước/sau grace60s và clock tiếp tục; hai người offline hoặc restart tạo INTERRUPTED; ack mất retry trả clock sample mới, tab takeover vô hiệu controller cũ |
| ISSUE-014 | U/I/E | Draw accept/reject/expiry30s và proposal rate; undo 1/2ply quay trước nước requester, không hoàn thời gian; move trong lúc proposal pending vô hiệu proposal; resign/timeout/accept race chỉ một terminal |
| ISSUE-015 | E | Hai contexts đồng bộ bàn/lượt/clock; optimistic pending không commit UI sai khi server reject; refresh/reconnect/takeover resync và controls đúng; undo/draw/resign có kết quả phía đối thủ |
| ISSUE-016 | I/E | 2players+5viewers vào được, người xem6 bị từ chối cả race; đổi LOCKED thu hồi quyền board/read/chat; CODE_ONLY cần WATCH grant hợp lệ; viewer không move/ready/takeover vai player bằng forged payload |
| ISSUE-017 | I/E | Player chỉ gửi/đọc PLAYERS, viewer chỉ SPECTATORS cả history/live; XSS hiện text và boundary content theo schema; duplicate clientMessageId một message; revoked member không nhận event mới hoặc lấy history, old controller không gửi được |
| ISSUE-018 | U | Evaluation cùng thế đổi perspective đảo dấu; giá trị terminal ưu tiên hơn material; piece-square tables phản chiếu màu đúng và không mutate board |
| ISSUE-019 | U | Minimax chọn thuộc tập nước đúng đã review tay; terminal trả null/score đúng và repetition đường search là draw; input/counts giữ nguyên kể cả cancel |
| ISSUE-020 | U | Alpha-beta và baseline cùng depth/ordering score và best-move set tương đương; nodes pruning không tăng và giảm tổng corpus; iterative deepening giữ depth hoàn tất, timeout sớm có legal fallback |
| ISSUE-021 | I | Child thật trả legal move qua server authority; queue 8 và 2workers không vượt capacity; undo/end/version đổi làm late result bị bỏ; worker crash/timeout/cancel xử lý đúng outcome và API còn đáp ứng |
| ISSUE-022 | E | Chọn màu/cấp/clock và AI đi trước khi human đen; undo trong khi thinking không áp late move; refresh/heartbeat AI không cần roomId; ended game không tiếp tục gửi command |
| ISSUE-023 | U/B | Corpus20 thế có oracle độc lập và baseline/pruning comparison; 5repeats/position/level đạt budget p95; 60ván đổi màu đạt strength gate theo07, ghi seed/nodes/depth/score và limits |
| ISSUE-024 | I/M | Token camera không publish mic và viewer không publish; old JWT không nhận generation mới sau revoke; clone private/watch hoạt động và stop không giết nhầm source; desktop/mobile capture thật theo device gate |
| ISSUE-025 | I | Tất cả 9 cặp camera/mic policy cho mỗi người, A khác B; forged policy cho đối thủ và viewer publish bị reject, hai update camera/mic cùng policyVersion chỉ một commit; revoke/leave/logout/takeover rotate đúng generation; SFU lỗi giữ APPLYING và không báo APPLIED giả |
| ISSUE-026 | E/M | Hai selector độc lập đúng quyền, OFF mặc định; permission denied/device mất vẫn đánh cờ được; người xem chỉ nhận source được chia sẻ, không có publish UI/quyền; cleanup unmount/rematch và manual camera/mic thật |
| ISSUE-027 | I/E | Replay nhánh effective sau undo và không ghi lại nhánh bỏ; chỉ participant được đọc history theo quyền; rematch cả hai accept đổi màu/reset bàn/clock; timer đóng room cũ không đóng rematch mới |
| ISSUE-028 | E/M | Viewports360/390/1366 không overflow và bàn dùng được; keyboard/focus/labels/contrast; empty/loading/error/retry/permission states; mobile bàn/chat/camera khi bàn phím mở |
| ISSUE-029 | I/E | Ma trận anonymous/nonmember/player/viewer/revoked cho các API/event nhạy cảm; IDOR/forged actor/role/source và Origin sai; rate/body limits, secrets không xuất bundle/log; logout all/expired JWT/old controller bị chặn |
| ISSUE-030 | I/E/B | Full flow8 contexts theo issue và R01–R16 mapping; lost ack/rollback/restart/token expiry không lệch state; 10rooms70clients+2AI đạt latency gate; media7peers source isolation và resync dưới5s |
| ISSUE-031 | I/E/M | Fresh-machine local runbook và migrate/restore trên test target; HTTPS/public callback/Google/email thật; socket/media hai mạng và relay thật; server restart có recovery, env thiếu fail rõ không in secret |
| ISSUE-032 | M | Người khác chạy demo từ tài liệu trên checkout sạch; trace mọi R tới test/evidence và mọi issue đủ trạng thái; trình bày thuật toán tự viết cùng benchmark tái lập; còn external gate thì không PROJECT_COMPLETE |

## Fixture terminal có đáp án độc lập

Tọa độ `(x,y)` zero-based theo04, BLACK ở trên, BLACK tới lượt. Các quân không liệt kê là ô trống. Dùng `makePosition` với tên PieceType đúng; các fixture này là input unit, không thêm endpoint nhập thế cờ vào sản phẩm.

- **F-MATE:** BLACK GENERAL(4,0); RED GENERAL(4,9), PAWN(4,5), ROOK(3,2), ROOK(4,2), ROOK(5,2). Tướng đen đang bị xe cột4 chiếu; ba đích trong cung (3,0),(5,0),(4,1) đều bị xe khống chế. Expected check=true, legalMoves=[], CHECKMATE winner RED.
- **F-STALEMATE:** BLACK GENERAL(4,0); RED GENERAL(4,9), PAWN(4,5), ROOK(3,1), ROOK(5,1). Tướng đen hiện không bị chiếu; (3,0),(5,0) bị xe cùng cột khống chế, (4,1) bị cả hai xe hàng1 khống chế. Expected check=false, legalMoves=[], STALEMATE winner RED.
- **F-REPEAT:** từ initialPosition, lặp chuỗi RED HORSE(1,9)→(2,7), BLACK HORSE(1,0)→(2,2), RED quay(2,7)→(1,9), BLACK quay(2,2)→(1,0) hai vòng. Sau4ply initial key count2 vẫn ACTIVE; sau8ply count3 hòa REPETITION. Mỗi move phải qua validateMove trước apply; key cùng board nhưng turn khác không gộp. Sau undo phải rebuild từ effective ancestry rồi so count, không giữ count nhánh bỏ.

Review tay các tọa độ trên khi viết003/004; không lấy getLegalMoves làm oracle duy nhất cho chính nó. Test phải assert tập đích cụ thể và lý do attack, ngoài terminal enum.

## Race, fault và media assertions

Mỗi race có barrier trước điểm tranh chấp, hai connection DB riêng, cùng state ban đầu. Assert cả response **và** DB sau commit: seats≤capacity, active_players unique, một event/version, không orphan receipt/move. Thử đảo thứ tự bên thắng; không viết test bắt buộc A thắng do timing. Fault injection chỉ có trong factory test: trước commit phải rollback; mất ack sau commit phải retry idempotent; restart phải theo SERVER_RESTART, không replay command thành nước thứ hai.

Với quyền media, đếm track identity/source/generation và inbound RTP stats, không chỉ nhìn video hidden hoặc API 403. Sau revoke acknowledged, current authorized publisher phát marker/source ở generation mới; saved-token attacker kết nối room cũ không nhận marker mới. Không đòi bytes lịch sử/buffer trở về0. Có authorized positive control cùng run và bounded observation window ghi rõ trong report. SFU outage thử riêng và giữ đúng giới hạn06, không dùng nó để hứa ngắt tức thì. Không lưu media cuộc gọi thật vào trace/video Git; dùng synthetic tracks hoặc report thống kê.

## Gate đóng issue và báo cáo

1. Acceptance của issue và mọi TNNN case có test path + test name hoặc manual steps + quan sát thật.
2. Test logic pass, lint/typecheck pass và build khi thay runtime/bundle; dependent regression theo interfaces đã đổi. Không để `.only`, skipped required test hoặc expected-failure che tính năng chưa có.
3. Lưu report theo [mẫu evidence](../handoff/EVIDENCE-TEMPLATE.md); output thô trong artifacts ignored, report chọn lọc vào Git.
4. Reviewer so diff/spec/test: chứng minh test sẽ bắt được lỗi mục tiêu, không chỉ assert chính output mock; không tự approve GitHub thay người khác.
5. DONE khi đủ gate; LOCAL_DONE chỉ thiếu provider/hardware được ghi rõ; blocker local không biến thành LOCAL_DONE. Merge theo workflow rồi mới dùng dependency.

Tất cả lệnh/test paths ở đây là yêu cầu cho agent thực thi. Tại thời điểm lập plan, không có test ứng dụng nào đã chạy.
