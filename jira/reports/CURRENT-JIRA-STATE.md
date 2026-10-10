# Kế hoạch hiện hành — đồng bộ Jira ngày 10/10/2026

Nguồn hiện hành: [current-jira-snapshot.json](../data/current-jira-snapshot.json), đọc trực tiếp từ Jira; dữ liệu sinh tài liệu: [plan-data.json](../data/plan-data.json) và [descriptions.json](../data/descriptions.json).

- Board duy nhất: 38; cả 4 Sprint chưa bắt đầu.
- 9 Epic và 27 Story BA: Done, Resolution = Done, không gắn Release triển khai.
- 71 Task: To Do, Resolution trống; Original Estimate và Remaining Estimate đều tổng **880 giờ**, chưa ghi giờ thực tế.
- Tình 156h; Đông 120h; Tùng 132h; Cường 124h; Nhạn 120h; Kỳ 108h; Thư 120h.
- Hạn hoàn thành và Release v1.0: **04/11/2026**. T71 tổng duyệt 8h ngày 04/11; không còn chiều dự phòng cố định.
- Tối đa 7 Task/ngày, mỗi người 1 Task/ngày, tính cả ngày đầu/cuối và cuối tuần; 186 phụ thuộc đầu-cuối không trùng ngày. Năm Task kéo qua Sprint kế tiếp.
- XIAN-86 thuộc v1.0; các Release chỉ chứa Task và đang 0% hoàn thành.
- Workflow đã lưu: transition 5 đặt Resolution = Done; transition 9 “Mở lại” đưa Done → To Do và xóa Resolution. Đã đọc lại cấu hình, chưa chuyển thử Task thật.
- Story Points giữ theo Jira (198 điểm), không tự quy đổi lại từ 880 giờ.

## Dữ liệu đã đồng bộ

`../data/plan-data.json`, `../data/descriptions.json`, `../exports/xian-import.csv`, `JIRA-MUC-CHI-TIET.md`, `ANH-XA-JIRA-107-MUC.md`, `../exports/jira-key-account-mapping.json`, `PHAN-CONG-CAN-BANG.md`, `DANH-GIA-KHOI-LUONG.md`, `COMPONENTS-LABELS.md`, `KIEM-TRA-KE-HOACH.md`, `../../KE-HOACH-JIRA.md` và phần kế hoạch trong `../../BACKLOG-P1.md` cùng phản ánh snapshot hiện hành.

CSV có Jira Key, Resolution, Remaining Estimate và account ID; đây là bản đối chiếu các mục đã tồn tại, không nhập như backlog mới hoặc dùng để ép chuyển trạng thái. Bộ sinh local không ghi dữ liệu lên Jira; đợt sửa nhãn được thực hiện riêng qua Atlassian rồi đọc lại.

## Kiểm tra và sinh lại

```sh
python3 jira/tools/sync_plan_from_snapshot.py
python3 jira/tools/build_plan.py
python3 jira/tools/build_plan.py --check
python3 -m unittest discover -s jira/tests -v
```

Ước lượng giờ độc lập với khoảng ngày. Khi trình bày giờ theo Sprint, bộ sinh chia đều ước lượng trên số ngày lịch; đây không phải giờ đã log. Các ngày Epic/Story là ngày kế hoạch được giữ nguyên từ Jira, không phải ngày hoàn thành thực tế.

**Nhãn Sprint:** đã sửa 13 nhãn `sprint-*` trên Jira và đọc lại đủ 107 mục; 71/71 Task khớp Sprint thực tế. Các trường khác không đổi; bốn Sprint vẫn `future`. Chi tiết trước/sau: [sprint-label-sync-2026-10-10.json](https://github.com/twotnguyen/XIANGQI/blob/a586f372549561d8c2f0f508bc7ab10d431d5ef7/jira/sprint-label-sync-2026-10-10.json).

## Hồ sơ lịch sử

Các snapshot, báo cáo nhập/chuyển đổi Jira, phương án 848 giờ và ảnh chụp thao tác cũ đã được bỏ khỏi cây thư mục hiện hành. Khi cần minh chứng, xem [bản lưu trong lịch sử Git](https://github.com/twotnguyen/XIANGQI/tree/a586f372549561d8c2f0f508bc7ab10d431d5ef7/jira); không dùng các bản cũ để ghi đè kế hoạch hiện tại.

Snapshot hiện hành, dữ liệu kế hoạch 880 giờ, nhật ký đối chiếu đặc tả, lịch sử sửa nhãn Sprint và 268 tiêu chí nghiệm thu vẫn được giữ lại.
