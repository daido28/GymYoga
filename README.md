# GymYogaHRM

Hệ thống quản lý nhân sự và ca làm cho phòng Gym/Yoga.

## Chức năng MVP

- Đăng nhập bằng tài khoản Admin và xác thực JWT.
- Quản lý nhân viên: thêm, xem, sửa, kích hoạt/ngừng hoạt động.
- Quản lý ca làm: thêm, xem, sửa, kích hoạt/ngừng áp dụng.
- Phân công nhân viên vào ca theo ngày.
- Cảnh báo và chặn một nhân viên có các ca trùng thời gian trong cùng ngày.
- Sửa hoặc hủy phân công.

## Công nghệ sử dụng

- Frontend: HTML, CSS, JavaScript, Bootstrap 5.
- Backend: Node.js, Express.js.
- Database: Microsoft SQL Server Express.
- Xác thực: JWT và BCrypt.
- Kiểm thử API: Postman.
- Quản lý mã nguồn: Git.

## Yêu cầu môi trường

- Node.js 18 trở lên.
- Microsoft SQL Server Express.
- SQL Server Management Studio.
- Git.

## Cài đặt database

1. Mở SQL Server Management Studio.
2. Mở và chạy file `database/schema.sql`.

> Lưu ý: `schema.sql` xóa và tạo lại các bảng dữ liệu. Chỉ chạy khi khởi tạo database mới hoặc khi chấp nhận làm sạch dữ liệu hiện có.

3. Mở và chạy file `database/seed.sql`.
4. Kiểm tra có hai vai trò `Admin`, `Nhân viên` và ba ca `SANG`, `CHIEU`, `TOI`.

## Cấu hình Backend

1. Di chuyển vào thư mục Backend:

```powershell
cd backend

2. Cài đặt package
npm install

3. Tạo file .env từ mẫu .env.example 

4. Cấu hình .env
PORT=3000
DB_SERVER=localhost\SQLEXPRESS01
DB_DATABASE=GymYogaHRM
JWT_SECRET=GymYogaHRM_2026_secret_key_change_later

5. Khởi động backend
npm run dev
backend chạy tại 
http://localhost:3000

Khởi tạo tài khoản Admin
sau khi backend đang chạy, dùng Postman gửi request
POST http://localhost:3000/api/auth/seed-admin
body JSON
{
  "username": "admin",
  "password": "Admin@123",
  "fullName": "Quản trị viên",
  "phone": "0900000000",
  "email": "admin@gymyoga.local"
}
chỉ dùng endpoint này khi database chưa có admin

Chạy hệ thống 
Mở trình duyệt 
http://localhost:3000/index.html
Đăng nhập bằng tài khoản Admin đã tạo

Quy tắc nghiệp vự đang áp dụng
. Chỉ nhân viên đang hoạt động mới được phân công
. Chỉ ca đang áp dụng mới được chọn để phân công
. Một nhân viên không thể được phân vào hai ca có thời gian giao nhau trong cùng 1 ngày
. Nhân viên và ca làm dùng trạng thái hoạt động thay cho xóa cứng
. Lịch phân công có thể hủy trước khi phát sinh dữ liệu chấm công
