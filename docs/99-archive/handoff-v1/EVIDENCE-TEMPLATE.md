# Mẫu bằng chứng cho mỗi issue

Agent tạo `docs/test-reports/ISSUE-NNN.md` từ cấu trúc này khi thực thi. Điền kết quả thật, không đánh dấu pass trước khi chạy. Chưa chạy ghi NOT_RUN và nguyên nhân. Mẫu này không phải báo cáo kết quả.

## Phạm vi và phiên bản

- Issue, branch, PR URL, trạng thái kỹ thuật.
- Commit đã kiểm hoặc commit gốc + diff chính xác; nếu report nằm trong commit sau test, xác nhận chỉ sửa report.
- Ngày, OS/CPU/RAM, Node/pnpm/browser, DB/SFU/tool versions; test target local/test/cloud, không chứa credential.
- Hợp đồng/files tạo hoặc đổi; mapping đường dẫn thực tế nếu khác plan.

## Ma trận bằng chứng

| Case ID / acceptance | Test path + tên test hoặc bước manual | Kết quả PASS/FAIL/NOT_RUN | Evidence / giới hạn |
|---|---|---|---|

Ghi từng TNNN case từ08 và acceptance bổ sung trong issue. Không ghi chung “tất cả đã test”. Các case có nhiều role/boundary phải nêu các biến thể đã chạy.

## Lệnh đã chạy

| Lệnh nguyên văn từ repo root | Exit code | Pass / fail / skip / total | Thời gian / output path |
|---|---|---|---|

Ghi rõ red/green cho logic mới khi áp dụng, regression và lỗi có sẵn. Phân biệt mock test, real local service, browser synthetic media, hardware, actual cloud provider. Không copy token/env vào output. Benchmark thêm seed/corpus hash/repeats/p50/p95/nodes/depth và cách tính theo07.

## Review và giới hạn

- Findings + cách sửa + lệnh rerun; self-review hay reviewer độc lập.
- Required external/manual còn thiếu, đầu vào cụ thể, gate nào bị chặn và consumer nào vẫn tiếp tục được.
- Bước tiếp theo chính xác: file/case/command cần làm.
- Xác nhận không có placeholder runtime, skipped required test hoặc fixture dựa chính output cần chứng minh.

## Bàn giao

Export/API/harness mới và cách dùng ngắn; migrations/env names mới không kèm values bí mật; lifecycle/cleanup cần consumer giữ. Link report dependency quan trọng. Kết luận DONE/LOCAL_DONE/BLOCKED_EXTERNAL đúng gate và trạng thái PR tra trên GitHub riêng.
