# XIANGQI — hướng dẫn cho agent

Khi bắt đầu hoặc tiếp tục triển khai, đọc `docs/handoff/START-HERE.md`, `docs/handoff/PROGRESS.md` và issue đủ dependency trong `docs/issues/README.md`. `docs/specs/` là đặc tả thực thi; bản phân tích ban đầu đã được thay thế.

Khi tạo nhánh, commit, push, PR, review hoặc merge, bắt buộc đọc `docs/handoff/GIT-WORKFLOW.md`. Người dùng đã ủy quyền tự thực hiện toàn bộ vòng Git/GitHub khi kiểm tra đạt; không cần xin phép lại mỗi PR.

- Một issue một PR triển khai chính vào `main`, cho phép PR verify/fix bổ sung có bằng chứng theo workflow; dependency phải đã merge và đủ gate kỹ thuật trước khi dùng.
- Trước push luôn fetch và kiểm tra commit mới trên remote.
- Khi xuất hiện merge conflict, dừng và báo file/commit cho người dùng; không tự giải quyết.
- Không force push, không né checks/protection hoặc thêm co-author Codex/AI.
- Hoàn thành phải có bằng chứng test thật và cập nhật issue/PROGRESS. Không thay mock cho provider smoke chưa chạy.
- Giữ thay đổi đúng phạm vi; không hoàn tác công việc của người khác, không commit secret.
