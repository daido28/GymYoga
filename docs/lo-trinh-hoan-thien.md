# Lộ trình hoàn thiện GymYogaHRM

Mốc rà soát: 04/10/2026, cuối tuần 4. Tuần 5: 05–09/10. Hạn kế hoạch: 30/10/2026.

Đây là kế hoạch thực hiện và tiêu chí kiểm chứng, không phải xác nhận đã hoàn thành. Mã CV là mã theo dõi nội bộ, chưa phải mã Jira. Người phụ trách dưới đây là đề xuất theo phân công trong Charter.

## Bước 1 — Chốt cơ sở chung

- PM: Nguyễn Bảo Minh. Trưởng nhóm học phần/Backend: Nguyễn Vũ Duy. Frontend: Đỗ Đức Đại. BA: Tô Trần Thức. Database/QA: Giang Quốc Thăng.
- Giữ phạm vi đã cam kết: xác thực, nhân viên, mẫu ca, phân công/chặn trùng, lịch cá nhân, chấm công, nghỉ phép, đổi ca, báo cáo cơ bản. Gemini tùy chọn.
- Các yêu cầu hợp đồng, kỹ năng/chứng chỉ, giới hạn số ca/ngày, kiểm tra chuyên môn và hiệu năng cần được đặc tả, triển khai hoặc có quyết định thay đổi phạm vi; không tự bỏ.
- Dùng danh mục WBS cấp 4 trong bản rà soát làm cơ sở đề xuất. Phải bổ sung các gói quản lý, kiểm thử, tài liệu và bàn giao để thành WBS toàn dự án; danh mục 16 gói phát triển không phải WBS đầy đủ.
- Giữ mã CV và mã WBS riêng, thêm mã Jira thật sau khi tạo issue. Không tạo ngày hoàn thành lịch sử không có căn cứ.
- Ngày bắt đầu 07/09 và kết thúc 30/10 là baseline hiện có. Lập riêng forecast cho việc còn lại, không sửa baseline chỉ để che chậm tiến độ.

Đầu ra: biên bản thống nhất có người/ngày xác nhận, ma trận yêu cầu, WBS và danh sách việc. Các thông tin MSSV/lớp/liên hệ/công thực tế phải do thành viên cung cấp.

## Bước 2 — Tạo backlog và theo dõi thực hiện

| Mã | Việc | WBS/FR | Phụ thuộc | Owner đề xuất | Điều kiện hoàn thành |
|---|---|---|---|---|---|
| CV01 | Thống nhất phạm vi, vai trò, ma trận yêu cầu và WBS | Quản lý phạm vi | Không | Minh/Thức | Có quyết định và ma trận, nhận diện đủ yêu cầu chưa đặc tả |
| CV02 | Chuẩn hóa README và hướng dẫn khởi tạo | 3.1.1.1 | CV01 | Duy | Hướng dẫn đúng cấu hình; seed Admin bật tạm rồi tắt; không ghi bí mật thật |
| CV03 | Sửa lọc lịch cá nhân ở server | 3.1.2.2 / FR06 | CV01 | Duy | Admin xem theo quyền; A chỉ thấy lịch A; B chỉ thấy lịch B; không vượt quyền bằng tham số |
| CV04 | Khởi tạo/liên kết tài khoản nhân viên phục vụ kiểm thử | 3.1.2.2 / FR06 | CV01 | Duy/Thăng | Hai tài khoản A/B liên kết đúng Employees.UserId; không công khai mật khẩu |
| CV05 | Chạy kiểm thử MVP và ghi kết quả | FR01–06 | CV02–04 | Thăng/Đại | Ghi Expected/Actual/Pass/Fail/version; sửa lỗi chặn nghiệm thu và chạy lại |
| CV06 | Chốt luật chấm công, nghỉ phép, đổi ca | FR07–08 | CV01 | Thức/Minh | Có quyền, trạng thái, tình huống biên, ERD và hợp đồng API |
| CV07 | Tạo migration bổ sung, bảo toàn dữ liệu | 3.5.* | CV06 | Thăng | Không chạy schema xóa bảng trên DB đang dùng; có bản sao và kiểm tra migration |
| CV08 | API chấm công | 3.5.1.1 / FR07 | CV07 | Duy | Đúng người/ca; chặn trùng và giờ không hợp lệ; có test API |
| CV09 | Giao diện và kiểm thử chấm công | 3.5.1.2 / FR07 | CV08 | Đại/Thăng | Luồng UI–API–DB chạy và có minh chứng |
| CV10 | Yêu cầu nghỉ phép và phê duyệt | 3.5.2.1 / FR08 | CV07 | Duy/Đại | Gửi/duyệt/từ chối đúng quyền; xử lý tác động lên lịch theo luật đã chốt |
| CV11 | Yêu cầu đổi ca và kiểm tra xung đột | 3.5.2.2 / FR08 | CV07 | Duy/Đại | Chỉ đổi ca được phép; kiểm tra lại khi duyệt; cập nhật nguyên tử; giữ lịch sử |
| CV12 | Kiểm thử tích hợp tuần 5 | FR01–08 | CV09–11 | Thăng | Có kết quả, lỗi còn mở và quyết định nghiệm thu; không tự đánh dấu mọi test Pass |
| CV13 | Thống kê và xuất báo cáo cơ bản | 3.6.1.* / FR09 | CV12 | Duy/Đại | Thống nhất chỉ tiêu; đối soát với DB; áp dụng phân quyền |
| CV14 | Hoàn thiện yêu cầu còn thiếu trong Scope | Phạm vi bổ sung | CV01 | Thức/Minh | Mỗi yêu cầu được kiểm chứng hoặc có thay đổi phạm vi được chấp thuận |
| CV15 | Hoàn thiện Excel WBS–PERT–chi phí–EVM–Pareto | Hồ sơ môn học | CV01, cập nhật CV05/CV12 | Minh/Thăng | Mã thống nhất, công thức kiểm tra, dữ liệu thực tế/giả định tách rõ |
| CV16 | Báo cáo cuối kỳ, triển khai, bàn giao | Tích hợp | CV13–15 | Cả nhóm | Cài đặt được, đủ minh chứng, checklist nghiệm thu và tài liệu sử dụng |

Jira: Cần làm → Đang làm → Chờ kiểm thử → Hoàn thành. Mỗi issue ghi mã CV, mã WBS, FR, người làm, hạn, ước lượng, điều kiện nghiệm thu và liên kết minh chứng. Chỉ điền mã Jira thật sau khi hệ thống cấp. Ước lượng và hạn từng việc cần dựa vào thời gian rảnh thực tế của thành viên.

## Bước 3 — Hoàn thiện sản phẩm theo phụ thuộc

Ưu tiên CV03–05 để ổn định MVP. Chốt CV06 trước khi viết CV07–11. Backend và frontend có thể làm song song sau khi chốt hợp đồng API. Không coi chấm công/nghỉ phép/đổi ca là tùy chọn nếu chưa có quyết định thay đổi phạm vi.

Kế hoạch tuần 5: ngày 05 chốt yêu cầu và sửa lịch cá nhân; ngày 06 triển khai dữ liệu/API chấm công; ngày 07 hoàn thiện chấm công và nghỉ phép; ngày 08 đổi ca; ngày 09 kiểm thử tích hợp và báo cáo. Đây là mục tiêu đề xuất, cần cập nhật forecast khi có ước lượng thật. Không cam kết đạt mốc chỉ từ lịch này.

## Bước 4 — Excel dùng cùng nguồn dữ liệu

Workbook chính cần các sheet: YeuCau, WBS, TienDo, NhatKyCong, PERT, ChiPhi, EVM, VanDe_Pareto, RuiRo, MinhChung.

Cột nối xuyên suốt: CV_ID, WBS_ID, FR_ID, Jira_Key. Không dùng số lượng issue hoặc story point để suy trực tiếp EV. Chọn phương pháp đo hoàn thành theo gói và ngân sách trước khi tính.

Tách dữ liệu dự án thực tế khỏi tình huống EVM giả định theo đề. Tách công lao động quy đổi khỏi tiền mặt thực chi. Dữ liệu chưa có để trống và ghi Chưa thu thập, không điền số tùy ý.

Bài EVM theo đề cần tối thiểu 3 việc hoàn thành và 3 việc đang làm: một vượt, một chậm, một đúng tiến độ. Pareto đồ án cần ít nhất 10 vấn đề và số lần có căn cứ hoặc ghi rõ dữ liệu mô phỏng được phép. Giữ bài lab cửa hàng máy tính riêng.

## Bước 5 — Thu minh chứng và báo cáo

Mỗi lần kiểm thử ghi: thời điểm, CV/Jira/WBS/FR, phiên bản Git và trạng thái thay đổi chưa commit, môi trường, dữ liệu đầu vào, mong đợi, thực tế, kết luận, người chạy, đường dẫn ảnh/log. Không đưa JWT, mật khẩu hoặc chuỗi kết nối bí mật vào minh chứng.

Báo cáo đầu tuần 5: kết quả thật đến cuối tuần 4 + lỗi tồn tại + kế hoạch tuần 5. Báo cáo cuối tuần 5: kết quả thật, issue còn mở, chỉ số từ Excel và kế hoạch tuần 6.

## Bước 6 — Nghiệm thu cuối dự án

Đối chiếu từng dòng Scope với sản phẩm/test hoặc quyết định thay đổi. Hoàn thiện 10 chương theo bảng môn học, Excel có công thức, mã nguồn/database, hướng dẫn cài đặt và sử dụng, minh chứng họp/kiểm thử, liên kết Jira/GitHub. MS Project vẫn là yêu cầu trong tài liệu hiện có cho đến khi giảng viên xác nhận Jira thay thế.

## Trạng thái tài liệu này

Đã thực hiện: rà soát mã nguồn và hồ sơ; tạo lộ trình và backlog nội bộ. Chưa thực hiện trong bước này: tạo Jira, sửa code, chạy test SQL Server, lập workbook chính hoặc nghiệm thu sản phẩm. Bắt đầu thực thi kỹ thuật từ CV02–04 sau khi CV01 được nhóm sử dụng làm cơ sở chung.
