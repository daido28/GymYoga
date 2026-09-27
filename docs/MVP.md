# MVP tuần 4

## Chức năng bắt buộc
1. Đăng nhập và phân quyền Admin/Nhân viên.
2. Quản lý hồ sơ nhân sự: thêm, sửa, xem, tìm kiếm.
3. Quản lý mẫu ca: tên ca, giờ bắt đầu, giờ kết thúc.
4. Phân công nhân viên vào ca theo ngày.
5. Cảnh báo nhân viên bị xếp trùng thời gian.

## Dữ liệu tối thiểu
- Nhân viên: mã, họ tên, số điện thoại, email, chức vụ, chuyên môn, trạng thái.
- Ca làm: mã ca, tên ca, giờ bắt đầu, giờ kết thúc.
- Lịch làm: ngày làm, nhân viên, ca, trạng thái.

## Quy tắc bắt buộc
- Chỉ nhân viên đang hoạt động mới được phân ca.
- Một nhân viên không được có hai ca trùng thời gian trong cùng ngày.
- Admin được quản lý toàn bộ dữ liệu.
- Nhân viên chỉ được xem lịch của chính mình.

## Chưa làm trước tuần 5
- Chấm công.
- Nghỉ phép và đổi ca.
- Dashboard, báo cáo, xuất file.
- Gemini AI.