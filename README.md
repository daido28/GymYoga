# GymYogaHRM

Hệ thống quản lý nhân sự Gym/Yoga: hồ sơ nhân viên, ca làm, lịch phân công, chuyên môn theo công việc, đăng ký ca, chấm công, đơn nghỉ/đổi ca, đa chi nhánh và báo cáo vận hành FR09.

## Phạm vi đã triển khai

| Nhóm chức năng | Nội dung |
| --- | --- |
| Tài khoản và quyền | JWT; Admin, Quản lý chi nhánh, Nhân viên/HLV; phạm vi dữ liệu theo chi nhánh |
| Nhân sự, ca và lịch | CRUD mềm; ca tối đến 00:00; chặn trùng giờ; sức chứa ca; lịch tuần/tháng |
| Công việc | Danh mục công việc, chuyên môn nhân viên, nhu cầu tối thiểu/tối đa từng ca, công bố lịch |
| Vận hành | Đăng ký 7 ngày vào lịch nháp, chấm công vào/ra, xin nghỉ, đổi ca và duyệt yêu cầu |
| FR09 | Thống kê theo khoảng ngày/chi nhánh và xuất CSV danh sách phân công |

## Yêu cầu môi trường

- Node.js 18 trở lên.
- Microsoft SQL Server Express và SSMS.
- Git.

## Cài đặt database mới

1. Mở `database/schema.sql` trong SSMS và chạy trên database mới. File này có `DROP TABLE`; không dùng để nâng cấp database đang có dữ liệu.
2. Chạy `database/seed.sql`.
3. Để nâng cấp database đang vận hành, chạy lần lượt các file trong `database/migrations/001_week5.sql` đến `005_midnight_shifts.sql`. Các migration có tính cộng thêm và không dùng script reset.
4. Chỉ dùng `database/week5_test_reset.sql` cho database kiểm thử `GymYogaHRM_Week5_Test`.

## Chạy ứng dụng

```powershell
cd backend
copy .env.example .env
npm install
npm start
```

Điền `DB_SERVER`, `DB_DATABASE` và `JWT_SECRET` vào `backend/.env`. Không đưa file `.env`, token hoặc mật khẩu vào Git. Mở `http://localhost:3000/index.html`; sau khi đăng nhập, hệ thống chuyển đến `week5.html`.

Endpoint tạo Admin chỉ hoạt động khi đặt tạm `SEED_ADMIN_ENABLED=true` trong `.env`. Sau khi tạo tài khoản đầu tiên, đặt lại `false` và khởi động lại backend.

## Kiểm thử

```powershell
cd backend
npm run test:logic
npm run test:integration
```

`test:integration` dùng database tách biệt `GymYogaHRM_Week5_Test`. Hãy chạy script reset/test setup trước khi kiểm thử và tuyệt đối không đổi biến `DB_DATABASE` của test sang database vận hành.

## Tài liệu dự án

- [Đối chiếu WBS 8 tuần](docs/WBS_8_TUAN_DOI_CHIEU.md)
- [Kế hoạch UAT và biên bản nghiệm thu](docs/UAT_BIEN_BAN.md)
- [Checklist đóng gói, demo và bàn giao](docs/BAN_GIAO_PHAT_HANH.md)
- [Báo cáo FR09](docs/FR09_BAO_CAO.md)
- [Hướng dẫn tuần 5](docs/WEEK5_HUONG_DAN.md)
- [Hướng dẫn tài khoản và chi nhánh](docs/CHI_NHANH_TAI_KHOAN_HUONG_DAN.md)
- [Hướng dẫn ca đến 00:00](docs/CA_00H_HUONG_DAN.md)

## Theo dõi công việc

Jira: [GymYogaHRM – GYM](https://doducdai05.atlassian.net/jira/software/projects/GYM/list). Backlog hiện có Epic WBS và các issue GYM-11 đến GYM-74 cho các đầu việc rà soát/xác nhận. Git remote: `https://github.com/daido28/GymYoga.git`.

Trạng thái WBS, yêu cầu minh chứng và các bước cần người xác nhận được ghi trong tài liệu đối chiếu. Không dùng dữ liệu EVM, Pareto hoặc điểm đóng góp mô phỏng để thay thế cho UAT, nhật ký công hoặc xác nhận thực tế.
