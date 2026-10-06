# Đăng ký ca theo tuần và bổ sung nhân viên vào lịch

Cập nhật ngày 06/10/2026 cho yêu cầu tuần 5.

## Vì sao trước đây chưa làm được?

Trước bản cập nhật, nhân viên chỉ xem lịch và thao tác chấm công/nghỉ/đổi ca, chưa có chức năng tự đăng ký. Khi kiểm tra dữ liệu đang dùng, cả 6 ca tại 2 chi nhánh có ca đều chưa có cấu hình nhu cầu công việc. Một chi nhánh còn chưa có chuyên môn nhân viên. Vì vậy hộp phân công không có công việc/người phù hợp để chọn.

Không tự gán nhân viên vào công việc chưa được xác nhận. Admin cần thiết lập nhu cầu của ca và công việc được phép của nhân viên một lần cho từng chi nhánh.

## Admin thiết lập lần đầu

1. Đăng nhập Admin, mở Lịch làm và chọn đúng chi nhánh.
2. Bấm **Phân công** hoặc dấu **＋** tại ngày/ca cần thêm người, chọn ca.
3. Nếu chưa có công việc, bấm **Thiết lập công việc cho ca**. Hệ thống mở mục Thiết lập và chọn đúng ca đó.
4. Đặt sức chứa tổng; tích các công việc cần có rồi đặt số tối thiểu/tối đa cho từng công việc. Ví dụ quầy 1–2, vệ sinh 1–2, bảo vệ 1–2 thì sức chứa tổng phải ít nhất 3. Bấm lưu và chờ thông báo thành công.
5. Nếu chưa có người phù hợp, bấm **Gán chuyên môn nhân viên** trong hộp phân công. Chọn nhân viên, tích các công việc được phép, chọn công việc chính rồi lưu. Công việc chính phải nằm trong danh sách được phép.
6. Quay lại Lịch làm → Phân công. Chọn ngày, ca, công việc và nhân viên đủ chuyên môn rồi lưu.

Chỉ cấu hình công việc có thật. Nếu thực tế một ca cần nhiều vị trí hơn giới hạn hiện tại, tăng sức chứa trước; không bỏ vị trí bắt buộc chỉ để công bố lịch.

## Nhân viên tự đăng ký

1. Đăng nhập tài khoản nhân viên hoặc HLV gắn với hồ sơ nhân viên đang hoạt động.
2. Chọn chế độ **Tuần**, chọn một ngày thuộc tuần muốn đăng ký và bấm Lọc/Xem để tải lịch.
3. Bấm **Đăng ký ca theo tuần**. Hộp đăng ký chỉ gồm thứ Hai đến Chủ nhật của tuần đang xem.
4. Tích các ngày/ca muốn làm; chọn công việc thuộc chuyên môn được phép trong từng ô.
5. Bấm gửi đăng ký. Các ca hợp lệ được ghi vào lịch nháp của chính nhân viên. Quản lý kiểm tra và công bố khi đủ người, đủ công việc.

Chế độ **Tháng** dùng xem tổng quan. Muốn đăng ký phải chuyển về Tuần. Một lần gửi không được chứa ngày của tuần khác; server kiểm tra điều này, không chỉ giao diện.

Ô đăng ký không khả dụng khi ngày đã qua, ca đã công bố, nhân viên đã có ca đó, ca đã đầy hoặc chưa có công việc phù hợp. Ca đã công bố cần liên hệ quản lý để bổ sung. Lịch đã hủy được giữ làm lịch sử; đăng ký lại cùng người/ngày/ca đó hiện chưa hỗ trợ.

## Admin bổ sung lịch còn thiếu

1. Chọn tuần và chi nhánh, nhìn chỉ báo số người và các công việc còn thiếu tại từng ca.
2. Bấm **＋** tại đúng ô. Chọn công việc thiếu và nhân viên đủ chuyên môn rồi lưu.
3. Lặp lại cho đến khi đáp ứng số người tối thiểu của từng công việc. Bấm **Công bố ca** để xác nhận lịch.

Admin và quản lý chi nhánh được bổ sung người cả vào ca đã công bố, nếu còn sức chứa, chưa vượt giới hạn công việc và không trùng giờ của nhân viên. Quản lý chi nhánh chỉ thao tác trong chi nhánh được cấp quyền.

## Quy tắc và phạm vi bản cập nhật

- Nhân viên chỉ đăng ký cho bản thân, trong chi nhánh của mình.
- Kiểm tra chuyên môn, số tối đa từng công việc, sức chứa tổng và trùng giờ giống thao tác phân công của Admin.
- Một lần gửi nhiều ca dùng một transaction: nếu một ca không hợp lệ, toàn bộ lần gửi hoàn tác để tránh lưu thiếu.
- Đăng ký tạo lịch nháp; chưa có bước duyệt từng đăng ký riêng. Quản lý xác nhận qua thao tác công bố ca.
- Không thay đổi cấu trúc database cho tính năng này; sử dụng bảng lịch và cấu hình công việc hiện có. Không tự thêm nhu cầu hoặc chuyên môn vào dữ liệu thật.
- Các ca sáng 06:00–12:00, chiều 12:00–18:00 và tối 18:00–00:00 vẫn được hỗ trợ.

## Minh chứng kiểm thử

`backend/tests/weekly-registration.integration.js` kiểm tra 45 tình huống API/giao diện trên database riêng `GymYogaHRM_Week5_Test`, gồm đăng ký đúng tuần, chống đăng ký hộ, giới hạn người, trùng giờ, hoàn tác khi lỗi, nhân viên đăng ký trên giao diện, chế độ tháng, Admin thiết lập công việc rồi phân công và bổ sung ca đã công bố. Kết quả và ảnh nằm trong `backend/test-results/weekly-registration*`.

Đây là minh chứng kiểm thử kỹ thuật cục bộ; không thay thế nghiệm thu nhóm hoặc minh chứng Jira/GitHub/Notion.
