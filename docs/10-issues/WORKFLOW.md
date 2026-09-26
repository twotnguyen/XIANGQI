# QUY TRÌNH THỰC THI

**Dành cho agent làm issue.** Đọc một lần, áp dụng cho mọi issue.

---

## 1. VÒNG ĐỜI MỘT ISSUE

```
① Đọc issue + tài liệu ở mục "ĐỌC TRƯỚC"
② Chọn TODO có mọi PHỤ THUỘC DONE/đã merge; chưa đủ thì chọn issue khác
③ Tạo nhánh:  issue/NNN-ten-ngan
④ Viết TEST TRƯỚC (theo mục TEST BẮT BUỘC của issue)
⑤ Viết code cho test xanh
⑥ Chạy đủ cổng: lint · typecheck · build · test
⑦ Tự đối chiếu CHECKLIST PASS — thiếu một ô là chưa xong
⑧ Ghi bằng chứng vào docs/test-reports/ISSUE-NNN.md
⑨ Commit · push · mở PR
⑩ PR xanh ⇒ merge ⇒ cập nhật trạng thái trong INDEX.md
```

---

## 2. GIT

| Mục | Quy định |
|---|---|
| Nhánh | `issue/NNN-ten-ngan` — ví dụ `issue/017-nuoc-di-ma` |
| Commit | `<loại>(<phạm vi>): <mô tả> [ISSUE-NNN]` |
| Loại | `feat` · `fix` · `test` · `docs` · `chore` · `refactor` |
| Một issue | **Một PR** vào `main` |
| Trước khi push | **Luôn** `git fetch` và kiểm tra commit mới trên remote |
| Xung đột merge | **DỪNG**, báo người dùng file/commit. **Không tự giải quyết** |
| Cấm | Force push · né kiểm tra CI · commit secret |

**Cuối mỗi commit message thêm:**
```
Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

**Cuối mỗi mô tả PR thêm:**
```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## 3. BỐN CỔNG BẮT BUỘC TRƯỚC KHI MỞ PR

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
```

Issue nào chạm cơ sở dữ liệu thì thêm `pnpm test:integration`.
Issue nào chạm giao diện thì thêm `pnpm test:e2e`.

**Từ ISSUE-003 trở đi cả bốn phải exit code0**, không chấp nhận script giả xanh. Chỉ giai đoạn bootstrap đã được DEC-047 cho phép:

| Mốc | Cổng có hiệu lực khi đóng issue | Cổng chưa tạo |
|---|---|---|
| 001 | install khóa, build, typecheck, HTTP health thật | lint002/unit003: NOT_IMPLEMENTED, không ghi PASS |
| 002 | build, typecheck, lint và test âm lint bằng CLI thật | unit003: NOT_IMPLEMENTED |
| 003 | cả bốn; test unit thực chạy, sai đường dẫn phải đỏ | không còn ngoại lệ bốn cổng |
| 004 | bốn cổng + e2e smoke desktop/mobile | chức năng chưa đến mốc không giả PASS |
| 005 | bốn cổng và e2e trên CI; bảo vệ merge | DB lane034, media112, tải135 bổ sung đúng mốc |

Script lane chưa tạo phải exit khác0 kèm tên issue tạo lane. Không tạo test bỏ qua để đại diện tính năng tương lai. DB integration runner tối thiểu ở034 trước migrations035–043;044 mở rộng factory/harness. Chọn issue theo dependency DAG, không theo số tăng tuyệt đối. Xem [execution-milestones](execution-milestones.md).

---

## 4. LUẬT VIẾT TEST

| # | Luật | Vì sao |
|---|---|---|
| 1 | **Test thời gian dùng đồng hồ giả tiêm vào** | `sleep` thật làm test chậm và chập chờn |
| 2 | **Test dữ liệu chạy trên PostgreSQL thật** | Lần trước test tự mock chính nó (`F-12`) |
| 3 | **Test tranh chấp có rào đồng bộ + 2 kết nối riêng** | Không có rào thì không tái hiện được |
| 4 | **Test quyền phải GIẢ MẠO dữ liệu gửi lên** | Kiểm nút bị vô hiệu là **chưa đủ** |
| 5 | **Test media đo luồng dữ liệu thật** | Lần trước chỉ assert object tự tạo (`F-14`) |
| 6 | **Cấm `.only`, cấm test bị bỏ qua** | Che tính năng chưa có |
| 7 | **Test phải BẮT được lỗi mục tiêu** | Viết xong thử phá code, test phải đỏ |

**Luật 7 quan trọng nhất:** viết test xong, **cố tình làm hỏng code** xem test có đỏ không. Test luôn xanh dù code sai là test vô dụng.

---

## 5. BẰNG CHỨNG — `docs/test-reports/ISSUE-NNN.md`

Dùng [TEST-REPORT-TEMPLATE](TEST-REPORT-TEMPLATE.md). Ghi kết quả thực, không sao chép số minh hoạ thành bằng chứng. Báo cáo phải có commit/môi trường, lệnh và exit code, pass/fail/skip, đối chiếu T/AC, artifact và thử phá invariant rồi khôi phục.

**Bắt buộc:** cột `Skip` phải là **0** với suite đã chạy. Chưa chạy ghi CHƯA_CHẠY, không điền 0 để tạo cảm giác đã đo. Đối chiếu [TEST-CONVENTIONS](TEST-CONVENTIONS.md) và [AC-COVERAGE](AC-COVERAGE.md) trước đóng issue.

---

## 6. KHI KHÔNG ĐẠT

| Tình huống | Làm gì |
|---|---|
| Test đỏ | Sửa code. **Không** sửa test cho dễ qua |
| Không đạt ngưỡng đo | Ghi số thật + **BLOCKED**. **Không** hạ ngưỡng |
| Thiếu tài nguyên ngoài | `BLOCKED_EXTERNAL` + ghi rõ thiếu gì. **Không** thay bằng giả lập |
| Phát hiện tài liệu sai | **DỪNG**, báo người dùng. **Không** tự đổi yêu cầu |
| Phụ thuộc chưa merge | **DỪNG**. Không làm trước |

> ⚠ **Tuyệt đối không** tự hạ tiêu chí để báo đạt. Ghi số thật luôn tốt hơn.

---

## 7. CẤU TRÚC THƯ MỤC ĐÍCH

```
apps/
  web/src/
    app/            router · providers
    features/       auth · friends · lobby · room · match · chat · media · ai · history
    components/board/
    lib/            api · socket · supabase
    styles/         tokens.css
  server/src/
    auth/           guard · strategy · service
    modules/        friends · rooms · invitations · matches · chat · media · ai · history
    realtime/       gateway · broadcast · presence
    db/             pool · transaction · sql/
  ai-worker/src/    main · supervisor · search-worker
packages/
  contracts/src/    kiểu + Zod dùng chung
  game-rules/src/   luật cờ thuần
  ai/src/           lượng giá · tìm kiếm
supabase/migrations/
tests/
  fixtures/ · unit/ · integration/ · e2e/ · media/ · load/
docs/               ← copy từ XIANGQI-Design
```

---

## 8. ĐỊNH NGHĨA "XONG"

Một issue `DONE` khi **tất cả** đúng:

- [ ] Mọi ô trong CHECKLIST PASS của issue đã tick
- [ ] Cổng có hiệu lực theo §3 exit0 (từ003: đủ bốn)
- [ ] **0 test bị bỏ qua**
- [ ] Có file bằng chứng `docs/test-reports/ISSUE-NNN.md`
- [ ] PR đã merge vào `main`
- [ ] `INDEX.md` đã cập nhật trạng thái

Thiếu **một** ô ⇒ **chưa xong**.
