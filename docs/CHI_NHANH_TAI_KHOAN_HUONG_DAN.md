# Hướng dẫn tài khoản và chi nhánh GymYogaHRM

Cập nhật ngày 05/10/2026. Đăng nhập tại http://localhost:3000/index.html sẽ mở trực tiếp lịch và chấm công. dashboard.html cũ chuyển về week5.html.

## Quyền hiện có

| Vai trò | Phạm vi | Thao tác |
| --- | --- | --- |
| Admin | Chuyển giữa các chi nhánh | Tạo/đổi tên chi nhánh; cấp Admin, quản lý chi nhánh hoặc nhân viên; quản lý nghiệp vụ chi nhánh đang chọn |
| Quản lý chi nhánh | Chi nhánh được cấp | Hồ sơ, ca, công việc, phân lịch, công bố, bảng công, duyệt đơn, cấp tài khoản nhân viên |
| Nhân viên và HLV | Chi nhánh của hồ sơ | Lịch chung trong chi nhánh; lịch/chấm công/đơn từ cá nhân; không có menu quản lý hồ sơ/ca/công việc |

HLV là công việc chuyên môn, không phải quyền quản trị. Chọn quyền Nhân viên, sau đó đặt công việc chính là Huấn luyện viên; có thể tạo công việc HLV Yoga, PT Gym riêng. Quản lý chi nhánh không được cấp Admin hoặc quản lý khác. Chỉ Admin hệ thống được cấp các quyền quản lý.

## Tạo chi nhánh

1. Đăng nhập bằng Admin hiện có.
2. Mở Công việc & nhân sự → Quản lý chi nhánh.
3. Đổi tên “Chi nhánh hiện tại” thành tên thực tế nếu cần. Dữ liệu cũ đang thuộc chi nhánh này.
4. Nhập tên chi nhánh mới và bấm Thêm chi nhánh. Bốn công việc mặc định được tạo; nhân viên và ca chưa được sao chép.
5. Chọn chi nhánh cần làm ở bộ chọn phía trên. Trang tải lại đúng dữ liệu chi nhánh đã chọn. Nhân viên chỉ thấy một chi nhánh của hồ sơ.

## Cấp tài khoản quản lý chi nhánh

1. Admin chọn đúng chi nhánh phía trên trước khi thao tác.
2. Mở Hồ sơ nhân viên → thêm hồ sơ người quản lý, ghi chức vụ Quản lý chi nhánh.
3. Quay về trang lịch → Công việc & nhân sự → Cấp tài khoản.
4. Chọn hồ sơ chưa có tài khoản; chọn quyền Quản lý chi nhánh đang chọn; nhập username và mật khẩu từ 8 ký tự, tối đa 72 byte UTF-8.
5. Bấm Cấp tài khoản. Quyền được liên kết với chi nhánh hiện tại của hồ sơ. Tài khoản đăng nhập được trang lịch/quản lý nhưng không được tạo chi nhánh hoặc cấp quyền Admin.
6. Đăng nhập bằng tài khoản mới và đối chiếu tên chi nhánh ở phía trên. Không cấp Admin nếu mục tiêu chỉ quản lý một chi nhánh.

Nếu cần Admin thứ hai, chọn Admin toàn hệ thống; đây là quyền quản trị tất cả chi nhánh. Bản hiện tại cấp quản lý vào một chi nhánh khi tạo tài khoản; chưa có màn hình bổ sung/thu hồi nhiều chi nhánh cho cùng một quản lý.

## Cấp tài khoản HLV hoặc nhân viên

1. Admin hoặc quản lý chọn chi nhánh được quản lý.
2. Mở Hồ sơ nhân viên → thêm hồ sơ HLV/nhân viên.
3. Vào Công việc & nhân sự → Công việc được phép của nhân viên. Chọn hồ sơ, chọn công việc Huấn luyện viên hoặc loại HLV đã tạo; chọn một công việc chính rồi lưu.
4. Ở Cấp tài khoản, chọn hồ sơ và quyền Nhân viên / HLV; nhập username/mật khẩu rồi cấp. Danh sách cấp chỉ hiện người chưa có tài khoản.
5. Cấu hình Danh mục ca làm và Nhu cầu công việc trong từng ca của chi nhánh; đặt tổng sức chứa và số người tối thiểu/tối đa từng công việc.
6. Quay về Lịch làm việc, phân ca đúng chuyên môn rồi công bố ca khi đủ công việc. Các ca nháp vẫn hiển thị và được ghi rõ là nháp.
7. HLV đăng nhập sẽ vào lịch. Chọn Chấm công & yêu cầu → Lịch cá nhân và chấm công để vào/ra ca và gửi đơn. Vào ca chỉ được thực hiện cho lịch của ngày hiện tại, hệ thống dùng giờ máy chủ.

Đã cấp tài khoản không đồng nghĩa đã phân ca. Hồ sơ chưa có lịch sẽ chưa có ca để chấm công. Tài khoản quản lý hiện dùng luồng quản lý, chưa có màn hình chấm công cá nhân cho quản lý/Admin. Không dùng một tài khoản quản lý chung cho HLV.

## Database và triển khai

Migration 004_branches.sql cộng thêm Branches, UserBranches, vai trò Quản lý chi nhánh và BranchId ở Employees/Shifts/JobTypes. Dữ liệu trước đó thuộc chi nhánh 1. WorkSchedules, chấm công và yêu cầu được giới hạn theo liên kết nhân viên/ca của chi nhánh. Mã ca và tên công việc có thể trùng giữa hai chi nhánh.

Đã áp dụng trên GymYogaHRM hiện tại. Không chạy lại schema.sql hoặc week5_test_reset.sql trên database chính. reset chỉ dùng GymYogaHRM_Week5_Test. Khi áp dụng file migration UTF-8 bằng SQLCMD, thêm -f 65001 để giữ đúng dấu tiếng Việt; dùng SSMS mở file với UTF-8 cũng được. Các kiểm tra quyền không dựa vào việc ẩn nút; server kiểm tra chi nhánh với cả mã tài nguyên trong đường dẫn và body.

## Minh chứng và giới hạn

Kết quả môi trường kiểm thử: 56 hồi quy API/SQL + 52 công việc + 14 quyền tài khoản + 50 chi nhánh = 172 API/SQL đạt; 11 UI lịch + 14 UI đăng nhập/chi nhánh/cấp tài khoản = 25 UI đạt; 5 logic đạt. Mật khẩu và token không nằm trong gói minh chứng.

Database chính sau cập nhật: 4 nhân viên, 4 ca, 4 phân công, không mất dòng dữ liệu. Chi nhánh và công việc mặc định đã được sửa đúng dấu tiếng Việt; ID giữ nguyên. Chưa tạo nhân sự hoặc tài khoản thực tế thay nhóm vì chưa có thông tin người dùng để cấp.

Chưa hỗ trợ nhân viên làm đồng thời nhiều chi nhánh, chuyển chi nhánh hồ sơ đang có lịch, phân quyền động, lương/hoa hồng, lớp Yoga/PT và hội viên. Đây không phải bằng chứng các phân hệ đó đã hoàn thành. Nhóm vẫn cần UAT và hoàn thiện Jira/GitHub/Notion cùng báo cáo tuần 5.
