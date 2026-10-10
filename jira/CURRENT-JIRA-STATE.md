# Kế hoạch hiện hành — đồng bộ Jira ngày 10/10/2026

Nguồn hiện hành: [current-jira-snapshot.json](current-jira-snapshot.json), đọc trực tiếp từ Jira; dữ liệu sinh tài liệu: [plan-data.json](plan-data.json) và [descriptions.json](descriptions.json).

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

`plan-data.json`, `descriptions.json`, `xian-import.csv`, `JIRA-MUC-CHI-TIET.md`, `ANH-XA-JIRA-107-MUC.md`, `jira-key-account-mapping.json`, `PHAN-CONG-CAN-BANG.md`, `DANH-GIA-KHOI-LUONG.md`, `COMPONENTS-LABELS.md`, `KIEM-TRA-KE-HOACH.md`, `../KE-HOACH-JIRA.md` và phần kế hoạch trong `../BACKLOG-P1.md` cùng phản ánh snapshot hiện hành.

CSV có Jira Key, Resolution, Remaining Estimate và account ID; đây là bản đối chiếu các mục đã tồn tại, không nhập như backlog mới hoặc dùng để ép chuyển trạng thái. Việc đồng bộ repo không ghi dữ liệu lên Jira.

## Kiểm tra và sinh lại

```sh
python3 jira/sync_plan_from_snapshot.py
python3 jira/build_plan.py
python3 jira/build_plan.py --check
python3 -m unittest discover -s jira/tests -v
```

Ước lượng giờ độc lập với khoảng ngày. Khi trình bày giờ theo Sprint, bộ sinh chia đều ước lượng trên số ngày lịch; đây không phải giờ đã log. Các ngày Epic/Story là ngày kế hoạch được giữ nguyên từ Jira, không phải ngày hoàn thành thực tế.

**Lưu ý nguồn Jira:** 13 nhãn `sprint-*` vẫn lệch trường Sprint. Repo giữ nguyên nhãn để phản ánh nguồn, còn lịch và báo cáo dùng trường Sprint. Danh sách đầy đủ nằm ở [KIEM-TRA-KE-HOACH.md](KIEM-TRA-KE-HOACH.md). Không tự sửa Jira trong lượt đồng bộ này.

## Hồ sơ lịch sử

Các snapshot trong `rebalance-2026-10-10/`, `deadline-2026-11-04/`, `description-update-2026-10-10/`; các file `live-before-*`, `live-after-*`, `migration-*`, `allocation-proposal-848.json`, `original-estimate-review.json`, các audit có ngày và ảnh chụp cũ là bằng chứng từng thời điểm. Chúng không phải nguồn lịch hiện hành. Bảng ánh xạ của đợt nhập cũ được giữ tại `history/2026-10-09/`.

Các báo cáo trước đây ghi 848 giờ hoặc “chưa nhập Jira” giữ ý nghĩa lịch sử; không dùng chúng để ghi đè kế hoạch hiện tại. Các quyết định nghiệp vụ và 268 tiêu chí nghiệm thu được giữ nguyên.
