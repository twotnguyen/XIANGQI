# FINAL AUDIT — TÀI LIỆU CỜ TƯỚNG ONLINE

**Ngày:** 2026-09-22 · **Trạng thái:** `SPEC_REVIEWED` · **Thẩm quyền:** PO trả lời DEC-026…038 và uỷ quyền BA tại DEC-039.

## Kết luận và phạm vi

31 finding ban đầu đã có quyết định hoặc sửa đồng bộ ở mức đặc tả (`CLOSED_SPEC`). Không còn câu hỏi sản phẩm phải chờ PO trong phạm vi audit này. Đây không phải tuyên bố hệ thống đã hoạt động hoặc mọi lỗi tương lai đã được loại trừ. **138 issue vẫn TODO**, chưa có mã ứng dụng, test runtime, benchmark AI, RTP hay triển khai Internet.

Đợt đầu đọc toàn bộ304 Markdown và ghi [initial audit](initial-audit-2026-09-22.md). Vòng cuối đọc lại các tài liệu thay đổi, rà độc lập auth/media, room/chat và AI/kế hoạch, rồi kiểm cơ học liên kết/ID/màn hình/dependency/site. Snapshot trước lượt hoàn thiện có308 Markdown; con số tăng vì thêm contract, state matrix, traceability và mục lục. Báo cáo này không sửa kết quả snapshot cũ.

## Những quyết định đáng chú ý

- Giữ lựa chọn PO:3:00 hỏi và đếm30s;3:30 không phản hồi thì thua; xác nhận3:29 → ngưỡng tiếp6:29. Reconnect không cấp thêm thời gian; chat ngay khi vào phòng.
- DEC-040 **thay phần đóng/khôi phục tab tuyệt đối của DEC-037**. Trình duyệt có thể giữ dữ liệu khi restore; phiên tạm có hạn server30phút không hoạt động/12giờ tuyệt đối. Đăng xuất là cách chắc chắn chấm dứt. Phiên ghi nhớ vẫn30ngày theo hoạt động chủ động.
- DEC-041 giới hạn chờ media30giây, ERROR + Thử lại; phải có bằng chứng SFU, không ACK client đơn lẻ. Không hứa tắt webcam vật lý từ xa hoặc xoá gói tin đã tới buffer.
- DEC-042…044 chốt revision ready, đổi bên đồng thuận30s, lỗi join không lộ phòng, WATCH và chat context/nhóm người đọc bất biến.
- DEC-045…047 giữ ngưỡng AI, làm rõ oracle/p95, giới hạn admission10ván AI, một backend service có AI child; chọn demo cho phép ngủ, tách nghiệm thu local/Internet và sửa thứ tự phụ thuộc.
- DEC-048 bổ sung trạng thái riêng từng màn và nguồn đặc tả chuẩn. Không mua dịch vụ hoặc phát triển thêm tính năng trong đợt này.

## Đóng từng finding

`CLOSED_SPEC` nghĩa thiếu sót tài liệu đã được xử lý; test thực thi vẫn phải chạy ở issue được dẫn. BR/AC chi tiết tra [registry](../06-acceptance/requirement-register.md), tài liệu tra [matrix](../06-acceptance/traceability-matrix.md).

| Finding | Chủ đề | Trạng thái | Bằng chứng đặc tả / nơi kiểm triển khai |
|---|---|---|---|
| F01 | Nhiều tab | CLOSED_SPEC | DEC-020/040; REQ-DISCONNECT, session-state, permissions; ISSUE-098 |
| F02 | Kênh chat chung | CLOSED_SPEC | DEC-018/044; REQ-CHAT, product-overview, FLOW-CREATE-ROOM |
| F03 | Timeline chống treo | CLOSED_SPEC | DEC-026/027; REQ-INACTIVITY, FLOW-INACTIVITY, ISSUE-100–103 |
| F04 | Reconnect không gia hạn | CLOSED_SPEC | DEC-030; REQ-DISCONNECT/INACTIVITY, ISSUE-096/101 |
| F05 | Ghế WAITING offline | CLOSED_SPEC | DEC-031/042; REQ-ROOM, ISSUE-064/095/096 |
| F06 | Chat trước Match/người thay ghế | CLOSED_SPEC | DEC-044; data-model, room-chat-contract §4–5, ISSUE-040/108–110 |
| F07 | FINISHED không thay PLAYER | CLOSED_SPEC | DEC-032/042; REQ-HISTORY-REMATCH, ISSUE-063/127 |
| F08 | Chuyển media OFF | CLOSED_SPEC | DEC-033/041; REQ-MEDIA, FLOW-MEDIA, ISSUE-099/115–117 |
| F09 | BOTH_OFFLINE ngay | CLOSED_SPEC | REQ-DISCONNECT, FLOW-DISCONNECT, state-machines; ISSUE-097 |
| F10 | Solo ready và cấu hình | CLOSED_SPEC | DEC-035/036/042; room-chat-contract §1, ISSUE-037/039/064/066 |
| F11 | SPECTATOR thấy đề nghị | CLOSED_SPEC | REQ-GAME-ACTIONS, permissions, AC-SPEC-24 |
| F12 | Lỗi join không lộ phòng | CLOSED_SPEC | DEC-043; room-chat-contract §2, FLOW-JOIN-ROOM, ISSUE-063/073 |
| F13 | Flow/route/trạng thái màn hình | CLOSED_SPEC | DEC-042/048; FLOW-FRIENDS, screen-inventory, screen-states, replay hai ngữ cảnh |
| F14 | Auth/phiên/callback | CLOSED_SPEC | DEC-040; REQ-AUTH, session-state, auth-provider-config; ISSUE-042/043/050/052/055 |
| F15 | Intent khác quyền server | CLOSED_SPEC | DEC-043/044; ISSUE-011/063/108/114/133, room-chat-contract |
| F16 | Đúng deadline tái đấu | CLOSED_SPEC | DEC-042; REQ-HISTORY-REMATCH, ISSUE-127/128; now < deadline sau khoá |
| F17 | Dependency/cổng khả thi | CLOSED_SPEC | DEC-047; AGENTS, WORKFLOW, execution-milestones, INDEX; test muộn có đầu việc đích |
| F18 | Local không bị Google cloud chặn | CLOSED_SPEC | DEC-047; ISSUE-053/054/055/136/137, EXTERNAL-SETUP |
| F19 | AI child và hosting | CLOSED_SPEC | DEC-046; architecture, tech-stack, deployment, ISSUE-137 |
| F20 | Oracle/ngưỡng AI | CLOSED_SPEC | DEC-045; REQ-AI, ai-validation, ISSUE-032/033/124 |
| F21 | Truy vết đúng ID/flow | CLOSED_SPEC | DEC-048; registry từng BR/GR/AC và matrix R01–R19 trong06, không dùng matrix08 cũ |
| F22 | Nguồn chuẩn/bản tóm tắt | CLOSED_SPEC | DEC-048; docs/README quy định canonical; tổng số sinh từ registry/sitebuild |
| F23 | Thuật ngữ/giả định kỹ thuật | CLOSED_SPEC | glossary, actors, TECH; bỏ tuyên bố hardware/hiệu năng/AA chưa có bằng chứng |
| F24 | Readiness đúng bằng chứng | CLOSED_SPEC | DEC-048; README/ONBOARDING/site, mục lục08 phân biệt lịch sử; 138 issue vẫn TODO |
| F25 | Reject nhưng có terminal event | CLOSED_SPEC | data-flows §2, TS-MAT-TERMINAL-REJECT; timeout finalize/broadcast khác validation reject |
| F26 | Media failed/retry/bằng chứng | CLOSED_SPEC | DEC-041; media-control-contract, ISSUE-041/042/099/115/117 |
| F27 | CHECK PLAYER NULL side | CLOSED_SPEC | ISSUE-037; CHECK yêu cầu side IS NOT NULL cho PLAYER |
| F28 | Hosting được ngủ | CLOSED_SPEC | DEC-046; deployment DEMO_SLEEP_ALLOWED, T137-11 có restart/interruption/history |
| F29 | AI offline và clock | CLOSED_SPEC | DEC-045; REQ-AI/CLOCK/DISCONNECT, FLOW-AI/DISCONNECT, TS-AI-09 |
| F30 | Direct WATCH ở CODE_ONLY | CLOSED_SPEC | DEC-043; REQ-SPECTATOR/INVITE, FLOW-JOIN-ROOM, ISSUE-068/073 |
| F31 | Privacy transition/rotation | CLOSED_SPEC | DEC-043; chín transitions và rotate; ISSUE-066/075 → T110-14 + TS-MED-06/117 |

## Kiểm chứng tĩnh của lượt cuối

<!-- VERIFIED_COUNTS -->
| Kiểm tra | Kết quả ghi nhận |
|---|---|
| Markdown trong repository |322 file;213 file trong quét hiện hành,102 archive và7 báo cáo/inventory lịch sử được cách ly |
| Lịch sử bất biến |0 file archive/báo cáo lịch sử bị sửa so snapshot trước lượt cuối |
| Liên kết file tương đối trong phạm vi hiện hành |0 đích file hỏng; bỏ mẫu code và URL khỏi phép đếm |
| Registry |315 BR,18 GR,333 AC chức năng/phiên; sáu AC-RULE báo cáo tính riêng |
| Màn hình |36 ID và36 hàng trạng thái tương ứng, không thiếu/thừa |
| Quyết định |49 record DEC-000…048, không trùng ID; gồm record nền000 và quyết định đã được thay thế |
| Issue/INDEX |138 issue/138 hàng, tất cả TODO,223 cạnh phụ thuộc; không chu trình, không thiếu đầu việc phụ thuộc; INDEX khớp header |
| Tham chiếu BR/GR/AC, SCR hiện hành |0 ID cụ thể không tìm thấy nguồn; không dùng dải viết tắt làm bằng chứng |
| Test ID trong issue |0 trùng ID trong từng issue; số test được liệt kê khớp các checklist ghi tổng số |
| Website |Build thành công;217 Markdown được parser xử lý,102 archive payload khớp nguồn; mọi nội dung nhúng khớp file hiện tại |
| JavaScript site |`node --check site/build.mjs` và `node --check site/assets/app.js`: exit0 |
<!-- END_VERIFIED_COUNTS -->

Kiểm liên kết tĩnh xác nhận đích file, không xác nhận mọi nguồn ngoài Internet còn truy cập được hoặc mọi fragment neo là đúng. Dependency không có chu trình là điều kiện cấu trúc; các kiểm cổng/phụ thuộc tương lai còn được rà nội dung và gắn test transport muộn vào110/117/133/136.

## Phần chưa được chứng minh

[Backlog hiện hành](question-backlog-2026-09-22.md) liệt kê kiểm chứng triển khai: cấu hình Supabase thật/email/Google, browser restore, Auth security hook, SFU/token/retry, benchmark AI/fixture oracle, PostgreSQL race và hosting. Những việc này vẫn phải có bằng chứng thật; Supabase có tính năng không đồng nghĩa cấu hình dự án đã đúng. Nếu platform thực tế không đáp ứng contract thì ghi BLOCKED và quyết định lại, không sửa test để giả PASS.

Bảng R→flow→screen→BR/AC và registry đã đầy đủ trong phạm vi tài liệu. Bảng **từng AC→test thực tế→kết quả→bằng chứng** chỉ có thể hoàn tất khi triển khai; ISSUE-136/137 bắt buộc nộp. Không gọi registry là coverage runtime100%.

## Đường đọc và lịch sử

Bắt đầu [docs/README](../README.md), chọn lộ trình tuần tự hoặc [ONBOARDING](../ONBOARDING.md). Folder00…10 giữ cấu trúc chức năng; bổ sung mục lục03/05/06/07/08 và tài liệu chuyên biệt. [Site](../../site/index.html) được build lại từ nguồn hiện hành. Mọi file nguồn trong99-archive và báo cáo audit cũ giữ nguyên; các lời khẳng định readiness cũ được cách ly qua mục lục08, không xoá hay viết lại lịch sử.
