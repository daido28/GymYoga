> Cập nhật 05/10/2026: lịch và quy tắc sức chứa mới nằm trong [LICH_CONG_VIEC_HUONG_DAN.md](LICH_CONG_VIEC_HUONG_DAN.md). Nội dung dưới đây mô tả phiên bản trước khi bổ sung công việc.

# GymYogaHRM chức năng tuần 5

Mở http://localhost:3000/week5.html sau khi đăng nhập. Database hiện tại đã áp dụng hai migration ngày 05/10/2026; dữ liệu kiểm thử ở database riêng GymYogaHRM_Week5_Test.

## Chạy project
1. Vào backend, chạy `npm install` nếu máy chưa có node_modules.
2. Dùng `.env.example` để cấu hình `.env`; đặt DB_SERVER, DB_DATABASE và JWT_SECRET riêng. Không đưa `.env` lên GitHub.
3. Với database đã có dữ liệu: chạy lần lượt `database/migrations/001_week5.sql` và `002_shift_capacity.sql` trên database đã chọn. Không chạy schema.sql để nâng cấp: script cũ có DROP TABLE.
4. Vào backend chạy `npm start`. Nếu script start chưa có, chạy `node src/server.js`.
5. Đăng nhập tài khoản Admin hiện có, chọn “Mở nghiệp vụ tuần 5”.

## Demo theo chuỗi
1. Admin tạo hồ sơ nhân viên trong Nhân sự, lấy ID hồ sơ.
2. Admin cấp tài khoản trong trang tuần 5; mật khẩu ít nhất 8 ký tự, tối đa 72 byte UTF-8. Một hồ sơ chỉ liên kết một tài khoản.
3. Admin phân công ca trong Phân công. Ca sáng/chiều/tối mặc định 3 người mỗi ca mỗi ngày. Người thứ tư bị từ chối; các ca vẫn kiểm tra trùng giờ của từng nhân viên.
4. Xem bảng lịch theo tuần hoặc tháng: mỗi ô có tên và số người/giới hạn. Lịch đã hủy không chiếm chỗ.
5. Nếu cần hỗ trợ: tạo ca mới với khung giờ phù hợp trong Ca làm, lấy ID ca, đánh dấu ca hỗ trợ và đặt giới hạn riêng trong trang tuần 5. Nhân viên hỗ trợ cũng không được phân công hai ca trùng giờ.
6. Nhân viên đăng nhập, xem lịch cá nhân; vào ca/ra ca trong trang tuần 5. Giờ ghi nhận dùng máy chủ. Phiên bản này kiểm tra ngày làm, chưa giới hạn cửa sổ giờ vào ca, GPS hoặc sinh trắc học.
7. Nhân viên gửi xin nghỉ theo ca hoặc đổi sang ca khác cùng ngày, nhập lý do. Một ca chỉ có một yêu cầu đang chờ; ca đã chấm công không được gửi yêu cầu.
8. Admin duyệt/từ chối. Khi đổi ca, hệ thống kiểm tra lại trùng lịch và giới hạn ca đích trong transaction. Duyệt nghỉ sẽ hủy lịch và giữ lịch sử. Duyệt thất bại không thay đổi yêu cầu hay lịch.
9. Admin không sửa/hủy ca đã chấm công hoặc có yêu cầu chờ; hủy ca là cập nhật trạng thái để giữ lịch sử.

## Kiểm chứng
- `node --test tests/schedule-access.test.js` trong backend: 5 test logic.
- `node tests/week5.integration.js`: cần database thử sạch; 55 kiểm tra API/SQL. Chỉ dùng DB cố định GymYogaHRM_Week5_Test, tuyệt đối không đổi sang database thật.
- `node tests/week5.ui.js`: kiểm tra Edge headless; dùng playwright trong runtime Codex trên máy này. Khi chuyển máy, cấu hình lại dependency.
- `backend/test-results`: JSON và ba ảnh thật của lần kiểm thử. Tên “Nhân viên thử” là dữ liệu giả phục vụ test; không phải thành viên nhóm đã vận hành sản phẩm.
- `database/week5_test_reset.sql` xóa và tạo lại bảng chỉ trong database thử. Không dùng script đó với database thật.

## Còn cần hoàn thiện
FR09 thống kê nghiệp vụ; UAT của nhóm; kiểm tra hiệu năng theo Scope; Jira >=50 issue thật, push GitHub, Notion; MSSV và số liệu công/chi phí/đánh giá có nguồn. Không lấy EVM/Pareto mô phỏng làm số thực. Lịch đã hủy của đúng nhân viên/ca/ngày chưa được tái phân công do unique key hiện có; chọn ca/ngày khác hoặc bổ sung luồng phục hồi có kiểm soát trong phiên bản sau.
