> Cập nhật tiếp: chi nhánh và vai trò Quản lý chi nhánh đã được triển khai. Đọc CHI_NHANH_TAI_KHOAN_HUONG_DAN.md; phần dưới mô tả thời điểm trước bổ sung này.

Ngày đối chiếu 05/10/2026. Nguồn: He_Thong_Quan_Ly_Gym_Yoga_HRM.docx và ảnh ma trận truy cập do thành viên cung cấp; đối chiếu với mã nguồn và kiểm thử local. Đây là bản hiệu chỉnh đề xuất, không phải biên bản nghiệm thu hoặc thay đổi baseline đã được nhóm phê duyệt.

# Kết luận và điểm phù hợp

Bản thiết kế mô tả được chuỗi lịch làm và lịch dạy → ghi nhận thực hiện → doanh số và hoa hồng → bảng lương. Các ý về dạy thay, quyền xem thu nhập cá nhân và khóa kỳ tính lương có giá trị để mở rộng sản phẩm. Phần lịch, chấm công, nghỉ phép và đổi ca phù hợp project hiện có.

Tài liệu đồng thời mở rộng sang quản lý hội viên, bán gói tập, lớp Yoga, buổi PT, POS/CRM, đa chi nhánh và sinh trắc học. Các phần này chưa có trong project; phải ghi là kế hoạch tiếp theo. Tuần 5 ưu tiên nghiệm thu HRM, thống kê FR09, hoàn thiện công cụ quản lý và minh chứng.

# Những điểm cần sửa trong tài liệu nguồn

1. Tách vai trò truy cập khỏi công việc chuyên môn. Lễ tân, vệ sinh, bảo vệ, HLV là loại công việc; Admin hoặc Nhân viên là vai trò truy cập hiện tại. Có quyền làm công việc không đồng nghĩa có quyền duyệt đơn hoặc xem doanh thu.

2. Thay biểu đồ quyền 0–1–2 bằng ma trận hành động và phạm vi dữ liệu. Tách xem lịch chung, xem lịch cá nhân và xem thu nhập; tách chấm công nhân viên, check-in hội viên, điểm danh lớp và xác nhận PT.

3. Lễ tân không có quyền duyệt đơn hoặc xếp lịch mặc định. HLV chỉ điểm danh lớp/buổi PT được giao. Quản lý chi nhánh phải bị giới hạn theo chi nhánh; hệ thống hiện chưa có chi nhánh hoặc vai trò Manager riêng.

4. Bỏ quyền xóa dữ liệu gốc không giới hạn. Dùng vô hiệu hóa, hủy có lý do và lịch sử; hồ sơ đã phát sinh công, doanh số hoặc lương cần giữ liên kết.

5. Tách sức chứa nhân viên của ca khỏi sức chứa hội viên của phòng/lớp. Ca hỗ trợ vẫn phải kiểm tra trùng thời gian và đúng công việc. Không tự hiểu ca trực HRM là lớp Yoga hoặc buổi PT.

# Ma trận quyền áp dụng cho phiên bản hiện tại

| Chức năng | Admin | Nhân viên |
| --- | --- | --- |
| Hồ sơ nhân viên đầy đủ | Xem và quản lý toàn bộ | Không truy cập danh sách đầy đủ |
| Lịch tuần tháng chung | Xem toàn bộ | Xem tên và công việc trên lịch |
| Lịch cá nhân | Xem lịch toàn bộ | Chỉ lịch của tài khoản liên kết |
| Phân ca và cấu hình công việc | Tạo sửa hủy và công bố | Không có quyền |
| Chấm công | Xem bảng công toàn bộ | Vào ra ca của mình |
| Đơn nghỉ và đổi ca | Xem và duyệt toàn bộ | Tạo và xem đơn của mình |
| Lương lớp PT hội viên doanh số | Chưa triển khai | Chưa triển khai |

Phạm vi hiện tại là một hệ thống, chưa phân chi nhánh. Lịch chung chỉ cần tên, công việc và ca; danh mục phục vụ xếp lịch không trả điện thoại/email. Đây là lựa chọn đã được thành viên yêu cầu, không đồng nghĩa được xem hồ sơ cá nhân hoặc thu nhập của đồng nghiệp.

# Điều chỉnh đã thực hiện trong project

GET /api/employees chỉ cho Admin đọc hồ sơ đầy đủ. Middleware xác thực đọc trạng thái tài khoản và vai trò hiện tại từ database; tài khoản Nhân viên cần hồ sơ liên kết còn hoạt động. Token chỉ xác định danh tính, không tự cấp quyền Admin theo thông tin vai trò cũ trong token.

Giữ hai vai trò hiện có; không tự chuyển dữ liệu sang Super Admin, Manager, Reception hoặc PT. Quyền chuyên môn vẫn lưu trong EmployeeJobTypes, mỗi lịch có một JobTypeId. Không cần migration mới cho hai sửa đổi phân quyền này.

Các cập nhật lịch và duyệt đơn vẫn kiểm tra quyền và trạng thái trong giao dịch. Chưa có màn hình quản lý vai trò, thu hồi mọi phiên, RBAC động hay nhật ký audit đầy đủ; không tuyên bố đã có các chức năng đó.

# Kết quả kiểm thử

56 hồi quy API/SQL, 52 kiểm tra phân công công việc, 14 kiểm tra chính sách truy cập và 11 kiểm tra giao diện đều đạt trên GymYogaHRM_Week5_Test. Tổng 122 kiểm tra API/SQL; log và ảnh được sao lưu trong Minh_chung. Nhóm cần thực hiện UAT và không dùng kết quả này như minh chứng sử dụng thực tế.

# Thiết kế mở rộng được đề xuất

Bốn vai trò sau chỉ áp dụng khi triển khai mở rộng: Chủ hệ thống quản lý cấu hình và phân quyền; Quản lý quản lý nghiệp vụ chi nhánh được giao; Lễ tân quản lý khách và giao dịch được cho phép; HLV xử lý lớp/buổi PT được phân công. Mọi người xem lịch, công và thu nhập của mình. Các quyền vượt phạm vi phải được cấp riêng.

| Nhóm dữ liệu | Đối tượng đề xuất | Quy tắc liên kết |
| --- | --- | --- |
| Tổ chức và truy cập | Branches, UserBranches, Permissions, RolePermissions | Role và phạm vi chi nhánh kiểm tra ở API |
| Lớp Yoga | Rooms, Classes, ClassSessions, SessionInstructors, Bookings | Tách mẫu lớp với từng buổi; kiểm tra lịch phòng và HLV |
| Hội viên và PT | Members, Packages, MemberPackages, PTSessions, PackageUsage | Một lần hoàn thành buổi chỉ trừ gói một lần |
| Doanh số và hoa hồng | Sales, Refunds, CommissionRules, CommissionEntries | Lưu nguồn phát sinh, người hưởng, phiên bản đơn giá |
| Lương và audit | PayrollPeriods, PayrollLines, Adjustments, AuditEvents | Bản nháp → duyệt → khóa kỳ; điều chỉnh có nguồn |

Đây là mô hình khái niệm đề xuất, chưa có các bảng này trong database. Không chạy lại schema.sql trên dữ liệu hiện có; khi triển khai dùng migration cộng thêm và liên kết Employees, AppUsers, Attendance cùng dữ liệu nghiệp vụ mới.

# Quy tắc cần bổ sung trước khi lập trình

Dạy thay: giữ HLV được phân công ban đầu, người thực dạy, lý do và người duyệt; chỉ người thực dạy được tính phần công đã được xác nhận, tránh trả hai lần. Kiểm tra trùng ca HRM, lớp và buổi PT trước khi điều chuyển.

Hoa hồng: xác định người bán/người phụ trách nếu loại gói cần; không bắt buộc mọi gói đều có PT. Định nghĩa doanh số được tính, thời điểm xác nhận, hoàn/hủy, đơn giá áp dụng và chứng từ. Dùng số tiền kiểu decimal, không tính bằng float hoặc tự chọn mức hoa hồng.

Khóa kỳ: chặn sửa dữ liệu ảnh hưởng kỳ đã chốt; phát sinh muộn hoặc sai sót phải có điều chỉnh được duyệt và lịch sử, không ghi đè nguồn đã chốt. Chỉ tính lương và khoản khấu trừ theo chính sách nhóm cung cấp; hiện chưa đủ dữ liệu để tự động tính.

Chấm công: phiên bản hiện tại dùng giờ máy chủ, chưa có FaceID, GPS, vân tay, QR hoặc tích hợp POS/CRM. Nếu làm thêm, cần thiết kế nguồn xác minh, trường hợp ngoại lệ, quyền dữ liệu và kiểm thử; ngưỡng 50m trong tài liệu là đề xuất chưa nghiệm thu.

# Lộ trình thực hiện và tiêu chí nghiệm thu

| Giai đoạn | Công việc ưu tiên | Điều kiện hoàn thành |
| --- | --- | --- |
| Tuần 5 hiện tại | UAT lịch chuyên môn, đơn từ; FR09; Jira GitHub Notion | Dữ liệu thật, issue và commit liên kết, biên bản nhóm |
| Mở rộng lớp và PT | Hội viên, phòng, từng buổi lớp/PT, điểm danh, dạy thay | Không trùng lịch; đúng người và đúng số buổi gói |
| Mở rộng thu nhập | Doanh số, hoàn/hủy, quy tắc hoa hồng, bảng lương | Đối soát nguồn, không tính trùng, khóa và điều chỉnh kỳ |
| Mở rộng vận hành | Chi nhánh, quyền theo phạm vi, xác minh chấm công, POS/CRM | Kiểm tra vượt quyền, xử lý đồng bộ và ngoại lệ |

# Kịch bản nhóm cần kiểm chứng

Hiện tại: nhân viên A gửi yêu cầu cho lịch của B phải bị chặn; nhân viên không đọc được điện thoại/email của đồng nghiệp; tài khoản bị khóa không dùng được token cũ.

Hiện tại: có nhiều kỹ năng vẫn chỉ nhận một công việc trên mỗi lịch; ca đủ tổng số người nhưng thiếu bảo vệ không được công bố; nghỉ phép hoặc đổi ca không được làm ca đã công bố thiếu công việc.

Mở rộng: HLV không điểm danh lớp không được giao; không đọc hội viên/thu nhập ngoài phạm vi; lễ tân không duyệt bảng lương hoặc tự đổi tỷ lệ hoa hồng.

Mở rộng: xác nhận PT hai lần hoặc gửi đồng thời chỉ trừ gói một lần; hủy/hoàn tiền có điều chỉnh hoa hồng; người dạy thay không làm phát sinh hai khoản trả cho cùng buổi.

Mở rộng: thao tác sửa nguồn kỳ đã khóa bị từ chối; điều chỉnh được duyệt có lịch sử; quản lý chi nhánh không truy cập dữ liệu chi nhánh khác.

# Tài liệu và minh chứng trong thư mục này

THIET_KE_HIEU_CHINH.md lưu cùng nội dung để theo dõi trên GitHub/Notion. MA_TRAN_QUYEN.csv phân biệt phiên bản hiện tại và giai đoạn đề xuất. Minh_chung chứa log kiểm thử và ảnh giao diện. Source.zip là bản mã hiện tại, không chứa .env hoặc node_modules. Tài liệu nguồn được giữ nguyên.

Nhóm cần xác nhận quy tắc trả lương, hoa hồng, gói tập, hoàn tiền, dạy thay và phạm vi chi nhánh trước khi triển khai các phân hệ mở rộng. Không tự ghi những phân hệ đó là đã hoàn thành trong báo cáo tuần 5.
