# Kiểm tra sẵn sàng triển khai

**Trạng thái: PLAN_READY — đủ rõ để bắt đầu triển khai toàn bộ theo issue.** Đây là kết luận về tài liệu, không phải kết quả kiểm thử ứng dụng.

## Những điểm đã được sửa qua review

- Auth username đi qua resolver server, Supabase giữ mật khẩu; PKCE signup/recovery ở browser, Google onboarding, session-active check và server logout.
- Match finalizer chung với lock order room→match; clock/undo/proposal/active-player slot/room status nhất quán.
- Receipt có command type và expectedVersion; retry trả appliedVersion gốc cùng snapshot/time sample mới, không phục hồi đồng hồ cũ.
- AI có controller, subscription, job state và grace deadline ngay cả khi không có game room; undo hủy job và giữ history counts đúng.
- Media có quyền riêng camera/mic và room generations; phân biệt giới hạn self-host, Cloud token revocation, publisher cố ý phát lại và SFU outage.
- Proposal expiry/rate, undo1/2ply, tự đóng room10phút, repetition integration có owner và test.
- DAG bổ sung dependency undo cho AI và AI UI cho play-again; không dùng thiếu credentials để chặn consumer local độc lập.
- AI experiments có ngưỡng thời gian, scoring ván cap và dữ liệu tái lập, không chỉ yêu cầu “ghi số liệu”.

## Kiểm tra tự động tài liệu

Lệnh tái kiểm tra từ repo root:

```bash
python3 docs/planning/validate_docs.py
```

Kết quả ngày 12/09/2026: exit0; **50 file Markdown,32 issue,16 nhóm yêu cầu,375 liên kết nội bộ hợp lệ, dependency graph không chu kỳ,0 lỗi**. `TODO` chỉ là trạng thái công việc chưa triển khai, không phải chi tiết đặc tả để trống.

Rà soát độc lập đã kiểm các luồng finalizer/clock retry/AI control/undo/lifecycle/benchmark. Các blocker phát hiện đã sửa; hai dòng hợp đồng heartbeat và control:revoked còn theo room-only cũng đã đổi để hỗ trợ AI context không có roomId. Auth/media được nghiên cứu riêng bằng nguồn chính thức; phạm vi bảo đảm self-host được ghi đúng giới hạn.

Validator kiểm:

- ISSUE-001…032 tồn tại và liên tục.
- Mọi dependency tồn tại, đồ thị không chu kỳ.
- Mọi issue có mục tiêu, files, inputs/outputs, steps, acceptance, command, completion.
- R01…R16 có issue trong bảng truy vết.
- Liên kết Markdown nội bộ có file đích.
- UTF-8 không lỗi, code fences cân bằng, không còn marker chi tiết chưa xác định trong specs.

## Giới hạn của kết luận

Bộ tài liệu có thể sẵn sàng trong khi ứng dụng chưa viết. Chưa có kết quả build/test/game/Google/media/AI performance. Các test code snippets là hướng dẫn assertion, không phải test đã chạy. ISSUE-024 là spike khả thi media có tiêu chí dừng rõ; ISSUE-023 đo và tune AI thật. Không tự biến dự kiến thành bằng chứng.

Tài khoản Google/provider, cloud media, SMTP, thiết bị thật và hai mạng là đầu vào thực thi từng gate; xem [EXTERNAL-INPUTS](handoff/EXTERNAL-INPUTS.md). Không có ngân sách mua dịch vụ đã được cấp.
