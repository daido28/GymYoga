# FR09 — Thống kê và xuất báo cáo cơ bản

Chức năng FR09 hoàn tất gói WBS `3.6.1.*`: đối chiếu dữ liệu vận hành theo chi nhánh và xuất dữ liệu để nhóm lập báo cáo.

## Cách sử dụng

1. Đăng nhập bằng tài khoản `Admin` hoặc `Quản lý chi nhánh`.
2. Mở trang `week5.html`, chọn **Báo cáo vận hành**.
3. Chọn khoảng ngày tối đa 93 ngày, sau đó chọn **Xem báo cáo**.
4. Kiểm tra bốn chỉ số: phân công còn hiệu lực, số lượt vào/ra ca, ca đã công bố, yêu cầu nghỉ/đổi ca đang chờ.
5. Chọn **Xuất CSV** để tải danh sách phân công chi tiết của khoảng đã xem.

## Dữ liệu đối chiếu

| Nhóm chỉ số | Bảng nguồn |
| --- | --- |
| Phân công, trạng thái hủy | `WorkSchedules`, `Employees`, `Shifts` |
| Công bố lịch | `RosterPublications` |
| Vào/ra ca | `Attendance` |
| Nghỉ phép | `LeaveRequests` |
| Đổi ca | `ShiftChangeRequests` |

API là `GET /api/week5/reports?start=YYYY-MM-DD&end=YYYY-MM-DD`. API chỉ trả dữ liệu của chi nhánh đang chọn, dựa vào ngữ cảnh JWT và `X-Branch-Id`; nhân viên nhận phản hồi 403.

## Điều kiện kiểm tra

- Khoảng ngày hợp lệ và không quá 93 ngày.
- Chỉ quản lý xem báo cáo.
- Báo cáo theo ngày gồm cả ngày chưa có phân công, để đối chiếu đủ kỳ.
- CSV dùng chính dữ liệu chi tiết đã hiển thị, không tạo số liệu riêng.

Kiểm thử tích hợp có các kiểm tra: Admin xem tổng hợp, nhân viên bị chặn và khoảng ngày quá giới hạn bị từ chối. Chạy trong thư mục `backend` bằng `node tests/week5.integration.js` sau khi đã khởi tạo database thử theo `database/week5_test_reset.sql`.
