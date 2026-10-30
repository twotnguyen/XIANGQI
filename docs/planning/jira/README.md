# Tài liệu và dữ liệu Jira XIAN

> **Phạm vi hiện hành (31/10/2026):** dữ liệu, báo cáo sinh tự động và số liệu trong thư mục này là baseline Jira ngày 10/10. Phạm vi sản phẩm hiện hành nằm ở [docs/product](../../product/BA-SCOPE-DECISIONS.md) (BA 0.18–0.36) và chưa được tái ước lượng vào Jira. `tools/build_plan.py --check` hiện báo lỗi dữ liệu EP-08 (Components không phủ Task con) từ trước các thay đổi này; chưa sửa. Tên Task T51 và T71 trên Jira còn ghi D1–D10; bảng demo hiện hành D1–D14 nằm ở [BACKLOG-P1 §8](../../product/BACKLOG-P1.md).

Nhóm bắt đầu từ [trạng thái hiện hành](reports/CURRENT-JIRA-STATE.md), [kế hoạch tổng thể](../KE-HOACH-JIRA.md) và [mô tả công việc](reports/JIRA-MUC-CHI-TIET.md).

| Thư mục | Nội dung | Khi cần dùng |
|---|---|---|
| `reports/` | Mô tả, phân công, truy vết AC, phân loại và kết quả kiểm tra | Đọc công việc, lịch và tiêu chí nghiệm thu |
| `data/` | Snapshot Jira, kế hoạch, Description, ánh xạ AC và cơ sở đánh giá | Đối chiếu hoặc cập nhật dữ liệu nguồn |
| `tools/` | Công cụ đồng bộ snapshot và sinh tài liệu | Dành cho người duy trì kế hoạch |
| `exports/` | CSV đối chiếu và bảng ánh xạ JSON | Đối chiếu với Jira hoặc xử lý dữ liệu |
| `tests/` | Kiểm tra lịch, trạng thái, phụ thuộc và bản xuất | Kiểm tra sau cập nhật |

## Tài liệu thường dùng

- [Tra cứu 71 Task để chọn mã commit](TRA-CUU-TASK-COMMIT.md) — đọc khi phân loại công việc và gắn Jira Key trước commit.
- [Phân công và giờ từng người](reports/PHAN-CONG-CAN-BANG.md)
- [Kết quả kiểm tra kế hoạch](reports/KIEM-TRA-KE-HOACH.md)
- [Truy vết tiêu chí nghiệm thu](reports/TRUY-VET-AC.md)
- [Ánh xạ 107 mục Jira](reports/ANH-XA-JIRA-107-MUC.md)
- [Components và Labels](reports/COMPONENTS-LABELS.md)
- [Đánh giá khối lượng công việc](reports/DANH-GIA-KHOI-LUONG.md)

## Cập nhật và kiểm tra

Chạy từ thư mục gốc dự án:

```sh
python3 docs/planning/jira/tools/sync_plan_from_snapshot.py
python3 docs/planning/jira/tools/build_plan.py
python3 docs/planning/jira/tools/build_plan.py --check
python3 -m unittest discover -s docs/planning/jira/tests -v
```

Công cụ đồng bộ đọc `data/current-jira-snapshot.json` đã có trên máy; không tự truy vấn hoặc ghi lên Jira. Các đường dẫn trong công cụ được xác định theo vị trí tệp, không phụ thuộc thư mục đang đứng. Tệp `source_snapshot` trong kế hoạch và bản xuất được hiểu tương đối với thư mục chứa tệp JSON đó.

Giữ dữ liệu nguồn trong Git để người khác có thể sinh lại và kiểm tra tài liệu sau khi clone. Các báo cáo sinh tự động được cập nhật bằng công cụ; trạng thái hiện hành được duy trì riêng. CSV là bản đối chiếu các mục đã tồn tại, không dùng để nhập lại thành backlog mới.

Ghi chú và bản xuất cá nhân đặt trong `.local/` ở gốc dự án. Việc sắp xếp thư mục không cập nhật Jira, chuyển trạng thái Task hoặc bắt đầu Sprint.

## Quy tắc cho agent khi làm việc với Jira

Chuyển từ `AGENTS.md`; chỉ áp dụng khi tác vụ chạm Jira hoặc kế hoạch.

- **Kiểm tra kết nối (chỉ đọc):** xác nhận site `xiangqi-web.atlassian.net`, project `XIAN`, board `38`, rồi đọc issue liên quan (ví dụ T01 là `XIAN-37`, T06 là `XIAN-42`). Đối chiếu summary, Description, AC, assignee, Sprint, phụ thuộc và trạng thái trước khi triển khai hoặc đồng bộ. Chỉ báo MCP Jira hoạt động khi có phản hồi thành công từ đúng site/project. Không giả định tên tool hoặc tự cài connector; thiếu quyền thì báo chính xác dịch vụ nào không truy cập được.
- Giữ ranh giới BA/triển khai: Epic/Story Done là đặc tả đã chốt; Task Done cần bằng chứng triển khai và kiểm thử. Không chuyển trạng thái hàng loạt theo trạng thái cha.
- Khi được giao sửa lịch, giữ cơ sở 880 giờ, hạn 04/11/2026, tối đa 7 Task/ngày và 1 Task/người/ngày. Phụ thuộc đầu-cuối phải bắt đầu từ ngày sau khi Task trước kết thúc; thứ tự bắt đầu Epic → Story → Task. Thay đổi cơ sở cần quyết định rõ của người dùng.
- Chỉ cập nhật Jira khi thuộc phạm vi yêu cầu. Không tự bắt đầu/kết thúc Sprint, chuyển issue Done, sửa Resolution hoặc thay ước lượng vì đã sửa tài liệu hay tạo commit. Mặc định giữ Sprint chưa bắt đầu cho đến khi có yêu cầu mới.
- Trước khi cập nhật issue, đọc lại dữ liệu live để tránh ghi đè công việc của người khác. Trường Sprint là nguồn chính, nhãn `sprint-*` phải khớp; liên kết Story–Task có thể là `relates to`, không giả định Task là con trực tiếp của Story.
- Đồng bộ kế hoạch theo mục "Cập nhật và kiểm tra" ở trên: cập nhật nguồn phù hợp, sinh lại báo cáo rồi kiểm tra. Script đọc snapshot không tự lấy Jira live. Không nhập lại CSV đối chiếu để tạo backlog trùng.
