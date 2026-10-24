# Kế hoạch UAT và biên bản nghiệm thu

**Dự án:** GymYogaHRM

**Phiên bản/commit:** ................................

**Database UAT:** ................................
**Ngày chạy:** ................................

## Điều kiện trước khi chạy

- Database UAT tách khỏi database vận hành và đã chạy đủ migration `001`–`005`.
- Có một tài khoản cho mỗi vai trò: Admin, Quản lý chi nhánh, Nhân viên/HLV.
- Có ít nhất một nhân viên, một ca, một công việc và một lịch trong khoảng kiểm thử.
- Không ghi token, mật khẩu hoặc chuỗi kết nối vào ảnh/log.

## Kịch bản xác nhận

| Mã | Vai trò | Thao tác | Kết quả mong đợi | Actual / Pass-Fail | Người xác nhận |
| --- | --- | --- | --- | --- | --- |
| UAT-01 | Admin | Đăng nhập và chọn chi nhánh | Chỉ thấy dữ liệu của chi nhánh chọn |  |  |
| UAT-02 | Admin | Tạo/sửa/ngừng hoạt động nhân viên | Dữ liệu hợp lệ, không xóa cứng |  |  |
| UAT-03 | Admin | Tạo ca sáng/chiều/tối, gồm 18:00–00:00 | Ca hợp lệ và hiển thị đúng (+1 ngày) |  |  |
| UAT-04 | Admin | Gán công việc, chuyên môn, nhu cầu ca | Chỉ nhân viên đủ chuyên môn được phân |  |  |
| UAT-05 | Admin | Phân lịch trùng giờ cho cùng người | Server từ chối yêu cầu |  |  |
| UAT-06 | Nhân viên | Đăng ký ca trong 7 ngày | Lịch ở trạng thái nháp, không vượt sức chứa |  |  |
| UAT-07 | Admin | Công bố ca đã đủ nhu cầu | Ca hiển thị đã công bố |  |  |
| UAT-08 | Nhân viên | Vào/ra ca của ngày hiện tại | Một lượt vào và một lượt ra được ghi |  |  |
| UAT-09 | Nhân viên/Admin | Gửi và duyệt/từ chối nghỉ ca | Đúng quyền, giữ lịch sử, lịch cập nhật đúng |  |  |
| UAT-10 | Nhân viên/Admin | Gửi và duyệt/từ chối đổi ca | Kiểm tra trùng/sức chứa lại khi duyệt |  |  |
| UAT-11 | Quản lý chi nhánh | Thử truy cập dữ liệu chi nhánh khác | Bị từ chối |  |  |
| UAT-12 | Admin | Mở báo cáo FR09 và xuất CSV | Số liệu/CSV khớp database trong kỳ |  |  |

## Quyết định

- [ ] Chấp nhận để bàn giao.
- [ ] Chấp nhận có điều kiện; danh sách lỗi kèm theo.
- [ ] Chưa chấp nhận; cần chạy lại UAT.

**Đại diện nhóm/PM:** ................................

**Người kiểm thử:** ................................
**Đại diện người dùng:** ................................
