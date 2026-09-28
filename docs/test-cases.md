# Test Cases MVP GymYogaHRM

## Thông tin chung

- Môi trường: Windows, Node.js, Express.js, SQL Server Express.
- Backend: `http://localhost:3000`.
- Tài khoản kiểm thử: `admin`.
- Vai trò: Admin.

| Mã test | Chức năng | Bước kiểm thử | Kết quả mong đợi |
|---|---|---|---|
| TC-AUTH-01 | Đăng nhập | Nhập đúng tài khoản `admin` và mật khẩu hợp lệ | Đăng nhập thành công, chuyển tới Dashboard |
| TC-AUTH-02 | Đăng nhập | Nhập sai mật khẩu | Hiển thị thông báo đăng nhập thất bại |
| TC-AUTH-03 | Bảo vệ API | Gọi API nhân sự khi không có Bearer Token | API trả mã 401 |
| TC-EMP-01 | Thêm nhân viên | Nhập họ tên, chức vụ và các thông tin hợp lệ | Thêm thành công, nhân viên xuất hiện trong bảng |
| TC-EMP-02 | Sửa nhân viên | Bấm Sửa, thay đổi chuyên môn, bấm Lưu thay đổi | Thông tin mới hiển thị trong bảng |
| TC-EMP-03 | Ngừng hoạt động | Bấm Ngừng hoạt động một nhân viên | Trạng thái chuyển thành Ngừng hoạt động |
| TC-EMP-04 | Kích hoạt | Bấm Kích hoạt nhân viên đã ngừng hoạt động | Trạng thái chuyển thành Đang hoạt động |
| TC-EMP-05 | Tìm kiếm | Nhập tên, số điện thoại, email hoặc chức vụ vào ô tìm kiếm | Bảng chỉ hiện các nhân viên phù hợp |
| TC-SHIFT-01 | Tạo ca làm | Nhập mã ca, tên ca, giờ bắt đầu và kết thúc hợp lệ | Tạo ca thành công |
| TC-SHIFT-02 | Kiểm tra giờ ca | Nhập giờ kết thúc nhỏ hơn hoặc bằng giờ bắt đầu | Hệ thống báo giờ kết thúc phải sau giờ bắt đầu |
| TC-SHIFT-03 | Sửa ca làm | Bấm Sửa, thay đổi tên/giờ ca và lưu | Bảng hiển thị thông tin ca mới |
| TC-SHIFT-04 | Ngừng áp dụng ca | Bấm Ngừng áp dụng | Ca chuyển trạng thái Ngừng áp dụng và không xuất hiện khi phân công mới |
| TC-SHIFT-05 | Chặn sửa ca gây trùng | Sửa Ca tối `18:00–22:00` thành `10:00–16:00` khi cùng nhân viên đã có Ca sáng `06:00–12:00` | Hệ thống chặn và báo trùng lịch đã phân công |
| TC-SCHEDULE-01 | Phân công ca | Chọn nhân viên hoạt động, ca hoạt động và ngày làm hợp lệ | Lịch được tạo thành công |
| TC-SCHEDULE-02 | Chặn trùng ca | Phân công Ca sáng và Ca hỗ trợ nhanh `09:00–11:00` cho cùng nhân viên, cùng ngày | Hệ thống chặn và báo trùng thời gian |
| TC-SCHEDULE-03 | Sửa phân công | Bấm Sửa, thay đổi ghi chú hoặc ngày/ca hợp lệ | Cập nhật phân công thành công |
| TC-SCHEDULE-04 | Hủy phân công | Bấm Hủy và xác nhận | Lịch phân công bị xóa khỏi danh sách |
| TC-SCHEDULE-05 | Nhân viên không hoạt động | Ngừng hoạt động nhân viên, sau đó mở trang Phân công | Nhân viên không xuất hiện trong danh sách chọn |