# Ca kết thúc lúc 00:00 và giao diện ca làm

Cập nhật 06/10/2026. Mở http://localhost:3000/shifts.html bằng Admin hoặc quản lý chi nhánh. Giao diện ca làm dùng cùng sidebar, màu sắc, bộ chọn chi nhánh và bố cục với lịch làm việc; có tìm kiếm, lọc trạng thái và nút điền nhanh.

## Tạo hoặc sửa các ca

1. Chọn chi nhánh phía trên.
2. Nếu đã có ca, bấm Sửa ở đúng dòng; nếu chưa có, dùng biểu mẫu Tạo ca làm.
3. Nút điền nhanh cung cấp Sáng 06:00–12:00, Chiều 12:00–18:00, Tối 18:00–00:00. Đây chỉ là điền biểu mẫu, chưa lưu dữ liệu.
4. Kiểm tra mã ca không trùng một ca khác trong cùng chi nhánh, tên và thời lượng; bấm Tạo ca làm hoặc Lưu thay đổi.
5. Ca tối 18:00–00:00 có thời lượng 6 giờ. 00:00 là đầu ngày tiếp theo; danh sách và lịch hiển thị (+1 ngày). Không dùng 23:59 thay cho 00:00.
6. Quay về Công việc & nhân sự để đặt sức chứa, số người tối thiểu/tối đa theo công việc. Phân lịch và công bố ở Lịch làm việc.

## Quy tắc xử lý

API và database chấp nhận ca kết thúc 00:00 khi giờ bắt đầu khác 00:00. Giờ bắt đầu/kết thúc bằng nhau không hợp lệ. Phiên bản này chưa hỗ trợ ca qua đêm kết thúc giờ khác 00:00, ví dụ 22:00–06:00.

Ca chiều kết thúc 18:00 và ca tối bắt đầu 18:00 không bị coi là trùng. Ca 19:00–20:00 sẽ trùng ca tối 18:00–00:00. Ca ngày hôm sau bắt đầu 00:00 là liền kề, không chồng lấn. Kiểm tra trùng khi phân công, đổi ca và sửa giờ ca đã được cập nhật; lịch đã hủy không chặn sửa giờ do xung đột.

## Database và minh chứng

Migration 005_midnight_shifts.sql thay ràng buộc CK_Shifts_Time, không xóa dữ liệu hoặc tự đổi giờ ca có sẵn. Đã áp dụng vào database GymYogaHRM hiện tại và khởi động lại server. Không chạy schema.sql hoặc script reset trên database chính.

Có 35 kiểm tra mới API/UI đạt: tạo/sửa 18:00–00:00, giờ không hợp lệ, liền ca, trùng lịch, duyệt đổi ca, ca đã hủy, tạo/sửa qua giao diện, giao diện mobile, nhãn trên lịch và chặn nhân viên mở quản lý ca. Các bộ hồi quy 56 API/SQL, 52 công việc, 50 chi nhánh, 14 quyền, 11 UI lịch, 14 UI tài khoản và 5 logic cũng đạt. Đây là kết quả kiểm thử trên database riêng, nhóm vẫn cần UAT.

Mã nguồn mới ở Source.zip; log/ảnh ở Minh_chung. Mật khẩu/token và .env không nằm trong gói.

Yêu cầu AI lần này: thành viên cần tạo ca sáng 6h–12h, chiều 12h–18h, tối 18h–00h và đồng bộ frontend quản lý ca với lịch làm. AI sửa ràng buộc, API, kiểm tra trùng, giao diện và kiểm thử. Nhóm xác nhận giờ ca thực tế và nghiệm thu.
