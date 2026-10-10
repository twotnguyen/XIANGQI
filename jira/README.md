# Tài liệu và dữ liệu Jira XIAN

Nhóm bắt đầu từ [trạng thái hiện hành](reports/CURRENT-JIRA-STATE.md), [kế hoạch tổng thể](../KE-HOACH-JIRA.md) và [mô tả công việc](reports/JIRA-MUC-CHI-TIET.md).

| Thư mục | Nội dung | Khi cần dùng |
|---|---|---|
| `reports/` | Mô tả, phân công, truy vết AC, phân loại và kết quả kiểm tra | Đọc công việc, lịch và tiêu chí nghiệm thu |
| `data/` | Snapshot Jira, kế hoạch, Description, ánh xạ AC và cơ sở đánh giá | Đối chiếu hoặc cập nhật dữ liệu nguồn |
| `tools/` | Công cụ đồng bộ snapshot và sinh tài liệu | Dành cho người duy trì kế hoạch |
| `exports/` | CSV đối chiếu và bảng ánh xạ JSON | Đối chiếu với Jira hoặc xử lý dữ liệu |
| `tests/` | Kiểm tra lịch, trạng thái, phụ thuộc và bản xuất | Kiểm tra sau cập nhật |

## Tài liệu thường dùng

- [Phân công và giờ từng người](reports/PHAN-CONG-CAN-BANG.md)
- [Kết quả kiểm tra kế hoạch](reports/KIEM-TRA-KE-HOACH.md)
- [Truy vết tiêu chí nghiệm thu](reports/TRUY-VET-AC.md)
- [Ánh xạ 107 mục Jira](reports/ANH-XA-JIRA-107-MUC.md)
- [Components và Labels](reports/COMPONENTS-LABELS.md)
- [Đánh giá khối lượng công việc](reports/DANH-GIA-KHOI-LUONG.md)

## Cập nhật và kiểm tra

Chạy từ thư mục gốc dự án:

```sh
python3 jira/tools/sync_plan_from_snapshot.py
python3 jira/tools/build_plan.py
python3 jira/tools/build_plan.py --check
python3 -m unittest discover -s jira/tests -v
```

Công cụ đồng bộ đọc `data/current-jira-snapshot.json` đã có trên máy; không tự truy vấn hoặc ghi lên Jira. Các đường dẫn trong công cụ được xác định theo vị trí tệp, không phụ thuộc thư mục đang đứng. Tệp `source_snapshot` trong kế hoạch và bản xuất được hiểu tương đối với thư mục chứa tệp JSON đó.

Giữ dữ liệu nguồn trong Git để người khác có thể sinh lại và kiểm tra tài liệu sau khi clone. Các báo cáo sinh tự động được cập nhật bằng công cụ; trạng thái hiện hành được duy trì riêng. CSV là bản đối chiếu các mục đã tồn tại, không dùng để nhập lại thành backlog mới.

Ghi chú và bản xuất cá nhân đặt trong `.local/` ở gốc dự án. Việc sắp xếp thư mục không cập nhật Jira, chuyển trạng thái Task hoặc bắt đầu Sprint.
