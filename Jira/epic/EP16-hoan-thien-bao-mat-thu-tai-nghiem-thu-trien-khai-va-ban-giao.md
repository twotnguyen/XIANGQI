# EP16 · Hoàn thiện, bảo mật, thử tải, nghiệm thu, triển khai và bàn giao

> **Loại:** Epic · **Story:** [ST16.7](../story/ST16.7-gioi-han-tan-suat-kich-thuoc-body-cors-va-tieu-de-bao-mat.md), [ST16.8](../story/ST16.8-ha-tang-internet-ban-dau-healthz-trien-khai-vercel-render-mo.md), [ST16.1](../story/ST16.1-kiem-chung-mo-hinh-nhieu-tab-moi-tab-thao-tac-chong-xung-dot.md), [ST16.2](../story/ST16.2-responsive-4-kich-thuoc-tro-nang-wcag-aa-5-trang-thai-toan-b.md), [ST16.3](../story/ST16.3-kiem-ma-tran-quyen-bang-du-lieu-gia-mao.md), [ST16.4](../story/ST16.4-thu-tai-10-phong-70-ket-noi-dong-thoi.md), [ST16.5](../story/ST16.5-nghiem-thu-r01r19-local.md), [ST16.6](../story/ST16.6-kiem-tren-moi-truong-internet-that-ho-so-ban-giao-va-bao-ve.md)

| Trường Jira | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | `EP16 · Hoàn thiện, bảo mật, thử tải, nghiệm thu, triển khai và bàn giao` |
| Components | Frontend, Backend, Design, AI, DevOps, Tester |
| Priority | High |
| Labels | `xq-v2`, `ep16` |
| Fix versions | `v1.0.0` |
| Start date / Due date | 2026-10-12 / 2026-10-23 |
| Nguồn đặc tả | ISSUE-098, ISSUE-130 … ISSUE-138 (R15, R16 + nghiệm thu R01–R19) |

**Mục tiêu:** Đảm bảo toàn bộ ứng dụng dùng được ở 4 kích thước (360, 390, 1366, 1920), đạt WCAG 2.1 AA, đủ 5 trạng thái ở 36 màn/cửa sổ; chứng minh **mọi ô ❌ trong ma trận quyền bị chặn ở máy chủ** bằng dữ liệu giả mạo; có giới hạn tần suất/kích thước/tiêu đề bảo mật; thử tải **thật** 10 phòng / 70 kết nối đồng thời; nghiệm thu R01–R19 bằng kịch bản xương sống 8 phiên; triển khai lên Internet (Vercel + Render + Supabase Cloud + LiveKit Cloud) và đóng gói hồ sơ bàn giao/bảo vệ.

**Nguyên tắc báo cáo trung thực (áp dụng mọi mục kiểm thử và Task Tester trong Epic):** không đạt ngưỡng ⇒ ghi **số thật** + Flag (`blocked`); thiếu tài nguyên ngoài ⇒ `blocked-external` + ghi rõ thiếu gì; **không** hạ ngưỡng, **không** thay bằng giả lập rồi báo đạt; cột "bỏ qua" (skip) luôn = 0.

**Danh sách Story:**
| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST16.1](../story/ST16.1-kiem-chung-mo-hinh-nhieu-tab-moi-tab-thao-tac-chong-xung-dot.md) | Kiểm chứng mô hình nhiều tab (mọi tab thao tác, chống xung đột) | 4 | 1 |
| [ST16.2](../story/ST16.2-responsive-4-kich-thuoc-tro-nang-wcag-aa-5-trang-thai-toan-b.md) | Responsive 4 kích thước, trợ năng WCAG AA, 5 trạng thái toàn bộ màn hình | 4 | 8 |
| [ST16.3](../story/ST16.3-kiem-ma-tran-quyen-bang-du-lieu-gia-mao.md) | Kiểm ma trận quyền bằng dữ liệu giả mạo | 4 | 2 |
| [ST16.4](../story/ST16.4-thu-tai-10-phong-70-ket-noi-dong-thoi.md) | Thử tải 10 phòng / 70 kết nối đồng thời | 4 | 2 |
| [ST16.5](../story/ST16.5-nghiem-thu-r01r19-local.md) | Nghiệm thu R01–R19 (local) | 4 | 3 |
| [ST16.6](../story/ST16.6-kiem-tren-moi-truong-internet-that-ho-so-ban-giao-va-bao-ve.md) | Kiểm trên môi trường Internet thật, hồ sơ bàn giao và bảo vệ | 4 | 5 |
| [ST16.7](../story/ST16.7-gioi-han-tan-suat-kich-thuoc-body-cors-va-tieu-de-bao-mat.md) | Giới hạn tần suất, kích thước body, CORS và tiêu đề bảo mật | 3 | 2 |
| [ST16.8](../story/ST16.8-ha-tang-internet-ban-dau-healthz-trien-khai-vercel-render-mo.md) | Hạ tầng Internet bản đầu: /healthz, triển khai Vercel + Render, môi trường thử tải | 3 | 5 |
