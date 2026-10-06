# Lịch hiện đại và phân công theo công việc

Ngày cập nhật: 05/10/2026. Yêu cầu mới thay quy tắc cố định 3 người: Admin tùy chỉnh sức chứa của cả ca; mỗi công việc có tối thiểu/tối đa riêng. Nhân viên có một công việc chính và các công việc được phép, mỗi phân công chọn đúng một loại.

## Thiết lập theo chuỗi
1. Đăng nhập Admin, mở **Mở nghiệp vụ tuần 5** từ dashboard.
2. Vào **Công việc & nhân sự**. Có sẵn Quầy lễ tân, Vệ sinh phòng tập, Bảo vệ/giữ xe, Huấn luyện viên. Thêm tên/màu tùy ý hoặc sửa tên/màu của loại đã có.
3. Chọn nhân viên, đánh dấu các công việc thực sự có thể làm và chọn công việc chính. Ví dụ A chỉ quầy; B chỉ vệ sinh; C chỉ bảo vệ. Không tự coi Position/Specialty cũ là quyền công việc; Admin phải xác nhận.
4. Chọn ca, đặt tổng sức chứa (ví dụ 6), chọn các công việc của ca và nhập tối thiểu/tối đa (ví dụ mỗi loại 1–2). Tổng tối thiểu không vượt sức chứa. Nếu đổi nhu cầu ở ca đã công bố, thu hồi lịch trước. Khi lưu cấu hình, UI lưu sức chứa trước rồi nhu cầu; nếu bước nhu cầu bị từ chối, thông báo nói rõ sức chứa đã lưu.
5. Trở lại **Lịch làm việc**. Chọn tuần/tháng, ngày và góc nhìn Theo ca/Theo nhân viên. Tìm tên hoặc lọc công việc. Màu của công việc được dùng trên các ô phân công.
6. Nhấn **+** trong ô ca/ngày hoặc **Phân công nhân viên**. Chọn công việc; dropdown chỉ hiện nhân viên được phép làm công việc đó. Chọn ngày, ca và người, rồi lưu. API vẫn kiểm tra trực tiếp quyền công việc, trùng thời gian, tổng sức chứa và số người tối đa của từng công việc.
7. Ca nháp có cảnh báo thiếu từng loại công việc. Khi đủ, nhấn **Công bố ca**. Hệ thống kiểm tra lại số lượng, quyền công việc, nhân viên/ca hoạt động và lịch chưa phân loại. Nhân viên xem được cả lịch nháp và lịch công bố với nhãn phân biệt.
8. Lịch đã công bố không cho hủy/chuyển người hoặc duyệt nghỉ/đổi ca nếu làm thiếu công việc. Bố trí người thay trong giới hạn cho phép, hoặc **Thu hồi** về nháp rồi xử lý và công bố lại. Ngừng hoạt động nhân viên/ca có lịch công bố từ hôm nay trở đi cũng bị chặn.
9. Trong **Chấm công & yêu cầu**, nhân viên thực hiện vào/ra ca, xin nghỉ và đổi ca; Admin duyệt hoặc từ chối. Đổi ca giữ nguyên công việc và kiểm tra ca đích có nhu cầu tương ứng.

## Ví dụ
Ca sáng sức chứa 6. Quầy: 1–2; vệ sinh: 1–2; bảo vệ: 1–2. A quầy, B vệ sinh, C bảo vệ là đủ tối thiểu 3 người và có thể công bố. Thêm D quầy là 4 người hợp lệ. Người quầy thứ ba bị từ chối dù còn chỗ trống. A không được xếp bảo vệ trừ khi Admin đã xác nhận thêm quyền bảo vệ. A chỉ được tính vào một công việc của mỗi phân công; không được tính đồng thời để đủ cả hai loại.

## Dữ liệu và phiên bản
Migration 003 thêm JobTypes, EmployeeJobTypes, ShiftJobRequirements, RosterPublications và WorkSchedules.JobTypeId nullable. Không xóa dữ liệu cũ; các lịch cũ chưa có loại công việc hiện Chưa phân loại và cần Admin xử lý trước công bố. Chưa tự gán nhân viên cũ theo chức vụ tự do để tránh gán nhầm chuyên môn.

Kiểm thử trên GymYogaHRM_Week5_Test: 56 API/SQL hồi quy, 52 API/SQL công việc, 11 UI checks và 5 test logic. Log/ảnh trong backend/test-results. Đây là dữ liệu test và kết quả local, chờ nhóm UAT; chưa chứng minh hiệu năng hoặc sử dụng thực ở phòng tập.

Chạy lại: trong backend, `node tests/week5.integration.js` cần database test sạch; `node tests/job-roster.integration.js` chạy sau để có demo; `node tests/job-roster.ui.js` chạy sau test công việc. UI test dùng Edge headless và Playwright trong runtime Codex trên máy hiện tại. `database/week5_test_reset.sql` chỉ reset database thử; không chạy schema.sql/reset script trên database thật.
