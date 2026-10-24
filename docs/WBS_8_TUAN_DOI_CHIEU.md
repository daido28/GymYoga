# Đối chiếu WBS 8 tuần — GymYogaHRM

Tài liệu này là chỉ mục thực hiện cho 32 gói/40 hoạt động của WBS. Nó tách **đầu ra đã đặt trong repository** khỏi **xác nhận cần có người chạy hoặc ký**; không thay UAT bằng dữ liệu mô phỏng.

## Liên kết quản lý

- Jira: [project GYM](https://doducdai05.atlassian.net/jira/software/projects/GYM/list), gồm Epic GYM-6 đến GYM-10 và 64 issue công việc GYM-11 đến GYM-74.
- GitHub remote: `daido28/GymYoga`.
- Mã nguồn và tài liệu trong repository là minh chứng kỹ thuật; ảnh, log test và biên bản xác nhận được đặt ngoài `.gitignore` trước khi nộp.

## Ma trận WBS và đầu ra

| Giai đoạn / WBS | Hoạt động theo WBS | Đầu ra trong dự án | Jira | Cách chốt |
| --- | --- | --- | --- | --- |
| 1.1.1.1 | Chốt đầu ra, hạn, người xác nhận | Charter và báo cáo trong `report_midterm/` | GYM-11–12 | Nhóm review và xác nhận phiên bản nộp |
| 1.1.1.2 | Rà scope, FR09, thay đổi | [THIET_KE_HIEU_CHINH.md](THIET_KE_HIEU_CHINH.md), FR09 | GYM-13–14 | Đối chiếu từng FR với WBS |
| 1.2.1.1 | Ước lượng, lịch phục hồi | WBS/Gantt/PERT trong bộ báo cáo | GYM-15–16 | Chốt baseline và forecast |
| 1.2.1.2 | Repo, board, task | README, Git remote, Jira GYM | GYM-17–18 | Cập nhật link commit/issue thật |
| 1.2.2.1 | Nhật ký giờ và tiền mặt | Sheet Chi phí/EVM trong bộ báo cáo | GYM-19–20 | Thành viên nhập nhật ký có nguồn |
| 1.2.2.2 | Review và đóng góp | Rubric/phiếu điểm nhóm trong bộ báo cáo | GYM-21–22 | Các thành viên ký/xác nhận điểm |
| 2.1.1.1 | Đặc tả đăng ký, công bố, quyền | [DANG_KY_CA_THEO_TUAN.md](DANG_KY_CA_THEO_TUAN.md), [CHI_NHANH_TAI_KHOAN_HUONG_DAN.md](CHI_NHANH_TAI_KHOAN_HUONG_DAN.md) | GYM-23–24 | Review nghiệp vụ |
| 2.1.1.2 | Review mô hình dữ liệu/API | `database/schema.sql`, migrations, route/controller | GYM-25–26 | Chạy test API trên DB thử |
| 2.2.1.1 | Rà màn hình/trạng thái lỗi | `frontend/*.html`, `frontend/*.js`, `frontend/*.css` | GYM-27–28 | Chạy checklist UI |
| 2.2.1.2 | Test plan và dữ liệu UAT | [UAT_BIEN_BAN.md](UAT_BIEN_BAN.md), `docs/test-cases.md` | GYM-29–30 | Ghi Actual/Pass/Fail |
| 3.1.1.1 | Chạy DB thử sạch | `database/week5_test_reset.sql`, `.env.example` | GYM-31–32 | Chạy database tách biệt |
| 3.1.1.2 | Migration giữ dữ liệu | `database/migrations/001`–`005` | GYM-33–34 | Sao lưu và ghi log migration |
| 3.1.2.1 | Đăng nhập/token | `authRoutes`, `authMiddleware`, test access | GYM-35–36 | Test thiếu/sai token và role |
| 3.2.1.1–3.2.1.2 | API và UI nhân viên | `employeeRoutes`, `employees.html`, `employees.js` | GYM-37–42 | CRUD và tìm kiếm |
| 3.3.1.1–3.3.1.2 | API/UI mẫu ca, sức chứa, 00:00 | `shiftRoutes`, `shifts.*`, [CA_00H_HUONG_DAN.md](CA_00H_HUONG_DAN.md) | GYM-43–44 | Ca hợp lệ, chặn trùng |
| 3.4.1.1–3.4.1.2 | API/UI lịch, đăng ký, công bố | `calendarController`, `registrationController`, `week5.*` | GYM-45–50 | Kiểm tra tuần/tháng, nháp/công bố |
| 3.1.2.2 | Quyền lịch cá nhân/chi nhánh | `branchScope`, `authMiddleware`, test branches/access | GYM-47–48 | Test cho phép và từ chối |
| 3.5.1.1–3.5.1.2 | Chấm công và lịch sử | `week5Controller`, `Attendance`, `week5.*` | GYM-51–54 | Vào/ra, trùng, đồng thời |
| 3.5.2.1 | Nghỉ phép/phê duyệt | `LeaveRequests`, `week5Controller` | GYM-55–56 | Duyệt/từ chối, giữ lịch sử |
| 3.5.2.2 | Đổi ca/xung đột | `ShiftChangeRequests`, `shiftTime.js` | GYM-57–58 | Kiểm tra ca đích, rollback |
| 3.6.1.1 | Thống kê cơ bản | `reportController.js`, Báo cáo vận hành | GYM-59–60 | Đối soát query với DB thử |
| 3.6.1.2 | Xuất báo cáo | `exportReport()` và [FR09_BAO_CAO.md](FR09_BAO_CAO.md) | GYM-61–62 | Mở CSV và đối chiếu dòng |
| 4.1.1.1 | Hồi quy UI/nghiệp vụ | `backend/tests/*.integration.js`, `*.ui.js` | GYM-63–64 | Lưu log test theo phiên bản |
| 4.1.1.2 | Sửa lỗi/hiệu năng | issue bug, timeout DB cấu hình trong `db.js` | GYM-65–66 | Ghi ngưỡng, thời gian, lỗi còn mở |
| 4.2.1.1 | UAT Admin/quản lý/nhân viên | [UAT_BIEN_BAN.md](UAT_BIEN_BAN.md) | GYM-67–68 | Ba vai trò ký/xác nhận |
| 5.1.1.1 | Hướng dẫn cài đặt/sử dụng | [README](../README.md), `docs/` | GYM-69–70 | Người review cài độc lập |
| 5.1.1.2 | Báo cáo/minh chứng cuối kỳ | `report_midterm/`, chỉ mục WBS này | GYM-71–72 | Kiểm tra link và trạng thái thật |
| 5.2.1.1 | Đóng gói, demo, bàn giao | [BAN_GIAO_PHAT_HANH.md](BAN_GIAO_PHAT_HANH.md) | GYM-73–74 | Demo và xác nhận bàn giao |

## Cổng hoàn thành 8 tuần

Một gói chỉ chuyển Jira sang **Done** khi có đủ đầu ra, kiểm tra phù hợp và link minh chứng. Trước khi nộp, nhóm chạy tuần tự:

1. Chạy kiểm thử logic và integration trên `GymYogaHRM_Week5_Test`; lưu console log/ảnh vào thư mục minh chứng.
2. Chạy UAT theo ba vai trò và điền biên bản.
3. Mở CSV FR09, đối chiếu ít nhất một kỳ với database thử.
4. Người không trực tiếp lập trình làm theo README để cài lại từ đầu.
5. Chốt điểm đóng góp, nhật ký giờ/chi phí và trạng thái issue trên Jira.
6. Tạo release/tag Git, nén source + database + tài liệu, demo và ký bàn giao.

Hiện repository có đầy đủ đầu ra kỹ thuật và biểu mẫu cho từng bước. Các dòng cần thao tác trên SQL Server, UAT, chữ ký và số liệu nhóm phải được thực hiện với dữ liệu thật rồi đính kèm; không nên đánh dấu Done thay cho các xác nhận đó.
