const {sql}=require('../config/db');
const {endpoint,query,admin}=require('./week5Controller').helpers;

function invalid(message){const error=Error(message);error.status=400;throw error;}
function reportPeriod(req){
 const start=String(req.query.start||''),end=String(req.query.end||'');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||!/^\d{4}-\d{2}-\d{2}$/.test(end))invalid('Khoảng báo cáo phải có ngày bắt đầu và kết thúc dạng YYYY-MM-DD');
 const first=new Date(start+'T12:00:00'),last=new Date(end+'T12:00:00');
 if(!Number.isFinite(first.getTime())||!Number.isFinite(last.getTime())||first.toISOString().slice(0,10)!==start||last.toISOString().slice(0,10)!==end||start>end)invalid('Khoảng báo cáo không hợp lệ');
 if((last-first)/86400000>92)invalid('Chỉ xuất báo cáo tối đa 93 ngày mỗi lần');
 return {start,end};
}

const summary=endpoint(async(req,db)=>{
 admin(req);
 const {start,end}=reportPeriod(req),params={start:[sql.Date,start],end:[sql.Date,end]};
 const totals=await query(db,`SELECT
   (SELECT COUNT(*) FROM Employees WHERE BranchId=@branch AND IsActive=1) AS ActiveEmployees,
   (SELECT COUNT(*) FROM WorkSchedules ws JOIN Employees e ON e.EmployeeId=ws.EmployeeId WHERE e.BranchId=@branch AND ws.WorkDate BETWEEN @start AND @end AND ws.Status<>N'Đã hủy') AS Scheduled,
   (SELECT COUNT(*) FROM RosterPublications rp JOIN Shifts s ON s.ShiftId=rp.ShiftId WHERE s.BranchId=@branch AND rp.WorkDate BETWEEN @start AND @end) AS Published,
   (SELECT COUNT(*) FROM Attendance a JOIN WorkSchedules ws ON ws.ScheduleId=a.ScheduleId JOIN Employees e ON e.EmployeeId=ws.EmployeeId WHERE e.BranchId=@branch AND ws.WorkDate BETWEEN @start AND @end AND a.CheckInAt IS NOT NULL) AS CheckIns,
   (SELECT COUNT(*) FROM Attendance a JOIN WorkSchedules ws ON ws.ScheduleId=a.ScheduleId JOIN Employees e ON e.EmployeeId=ws.EmployeeId WHERE e.BranchId=@branch AND ws.WorkDate BETWEEN @start AND @end AND a.CheckOutAt IS NOT NULL) AS CheckOuts,
   (SELECT COUNT(*) FROM LeaveRequests lr JOIN Employees e ON e.EmployeeId=lr.EmployeeId JOIN WorkSchedules ws ON ws.ScheduleId=lr.ScheduleId WHERE e.BranchId=@branch AND ws.WorkDate BETWEEN @start AND @end AND lr.Status='Approved') AS LeaveApproved,
   (SELECT COUNT(*) FROM LeaveRequests lr JOIN Employees e ON e.EmployeeId=lr.EmployeeId JOIN WorkSchedules ws ON ws.ScheduleId=lr.ScheduleId WHERE e.BranchId=@branch AND ws.WorkDate BETWEEN @start AND @end AND lr.Status='Pending') AS LeavePending,
   (SELECT COUNT(*) FROM ShiftChangeRequests cr JOIN Employees e ON e.EmployeeId=cr.EmployeeId JOIN WorkSchedules ws ON ws.ScheduleId=cr.ScheduleId WHERE e.BranchId=@branch AND ws.WorkDate BETWEEN @start AND @end AND cr.Status='Approved') AS ChangeApproved,
   (SELECT COUNT(*) FROM ShiftChangeRequests cr JOIN Employees e ON e.EmployeeId=cr.EmployeeId JOIN WorkSchedules ws ON ws.ScheduleId=cr.ScheduleId WHERE e.BranchId=@branch AND ws.WorkDate BETWEEN @start AND @end AND cr.Status='Pending') AS ChangePending`,params);
 const daily=await query(db,`;WITH Days AS (
    SELECT CAST(@start AS date) AS WorkDate
    UNION ALL SELECT DATEADD(day,1,WorkDate) FROM Days WHERE WorkDate<@end
   ), Schedules AS (
    SELECT ws.WorkDate,COUNT(*) AS Scheduled,SUM(CASE WHEN ws.Status=N'Đã hủy' THEN 1 ELSE 0 END) AS Cancelled
    FROM WorkSchedules ws JOIN Employees e ON e.EmployeeId=ws.EmployeeId
    WHERE e.BranchId=@branch AND ws.WorkDate BETWEEN @start AND @end GROUP BY ws.WorkDate
   ), Publications AS (
    SELECT rp.WorkDate,COUNT(*) AS Published FROM RosterPublications rp JOIN Shifts s ON s.ShiftId=rp.ShiftId
    WHERE s.BranchId=@branch AND rp.WorkDate BETWEEN @start AND @end GROUP BY rp.WorkDate
   ), AttendanceTotals AS (
    SELECT ws.WorkDate,SUM(CASE WHEN a.CheckInAt IS NOT NULL THEN 1 ELSE 0 END) AS CheckIns,SUM(CASE WHEN a.CheckOutAt IS NOT NULL THEN 1 ELSE 0 END) AS CheckOuts
    FROM Attendance a JOIN WorkSchedules ws ON ws.ScheduleId=a.ScheduleId JOIN Employees e ON e.EmployeeId=ws.EmployeeId
    WHERE e.BranchId=@branch AND ws.WorkDate BETWEEN @start AND @end GROUP BY ws.WorkDate
   )
   SELECT d.WorkDate,ISNULL(s.Scheduled,0) AS Scheduled,ISNULL(s.Cancelled,0) AS Cancelled,ISNULL(p.Published,0) AS Published,ISNULL(a.CheckIns,0) AS CheckIns,ISNULL(a.CheckOuts,0) AS CheckOuts
   FROM Days d LEFT JOIN Schedules s ON s.WorkDate=d.WorkDate LEFT JOIN Publications p ON p.WorkDate=d.WorkDate LEFT JOIN AttendanceTotals a ON a.WorkDate=d.WorkDate
   ORDER BY d.WorkDate OPTION(MAXRECURSION 100)`,params);
 const schedules=await query(db,`SELECT ws.ScheduleId,ws.WorkDate,e.FullName,e.Position,s.ShiftName,s.StartTime,s.EndTime,j.JobName,ws.Status,a.CheckInAt,a.CheckOutAt
   FROM WorkSchedules ws JOIN Employees e ON e.EmployeeId=ws.EmployeeId JOIN Shifts s ON s.ShiftId=ws.ShiftId
   LEFT JOIN JobTypes j ON j.JobTypeId=ws.JobTypeId LEFT JOIN Attendance a ON a.ScheduleId=ws.ScheduleId
   WHERE e.BranchId=@branch AND ws.WorkDate BETWEEN @start AND @end
   ORDER BY ws.WorkDate,s.StartTime,e.FullName`,params);
 return {data:{period:{start,end},summary:totals.recordset[0],daily:daily.recordset,schedules:schedules.recordset}};
});

module.exports={summary};
