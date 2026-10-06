const {sql}=require('../config/db');
const {fail}=require('./week5Rules');
async function q(db,text,params={}){const r=new sql.Request(db);for(const [key,value]of Object.entries(params))r.input(key,value);return r.query(text);}
async function eligible(db,employee,shift,day,job,exclude=0){
 const allowed=await q(db,`SELECT j.JobTypeId FROM EmployeeJobTypes e JOIN JobTypes j ON j.JobTypeId=e.JobTypeId AND j.IsActive=1 JOIN ShiftJobRequirements r ON r.JobTypeId=j.JobTypeId AND r.ShiftId=@shift WHERE e.EmployeeId=@employee AND e.JobTypeId=@job`,{employee,shift,job});
 if(!allowed.recordset.length)fail(409,'Nhân viên không được phép làm công việc này hoặc ca chưa cấu hình công việc');
 const limit=await q(db,'SELECT MaxStaff FROM ShiftJobRequirements WITH(UPDLOCK,HOLDLOCK) WHERE ShiftId=@shift AND JobTypeId=@job',{shift,job});
 const count=await q(db,"SELECT COUNT(*) Total FROM WorkSchedules WITH(UPDLOCK,HOLDLOCK) WHERE ShiftId=@shift AND WorkDate=@day AND JobTypeId=@job AND ScheduleId<>@exclude AND Status<>N'Đã hủy'",{shift,job,day:new Date(day),exclude});
 if(Number(count.recordset[0].Total)>=Number(limit.recordset[0].MaxStaff))fail(409,'Công việc này trong ca đã đủ số người tối đa');
}
async function protectRemoval(db,s){
 const published=await q(db,'SELECT ShiftId FROM RosterPublications WITH(UPDLOCK,HOLDLOCK) WHERE ShiftId=@shift AND WorkDate=@day',{shift:s.ShiftId,day:s.WorkDate});
 if(!published.recordset.length)return;
 const coverage=await q(db,`SELECT r.MinStaff,(SELECT COUNT(*) FROM WorkSchedules ws WITH(UPDLOCK,HOLDLOCK) WHERE ws.ShiftId=r.ShiftId AND ws.WorkDate=@day AND ws.JobTypeId=r.JobTypeId AND ws.ScheduleId<>@id AND ws.Status<>N'Đã hủy') Total FROM ShiftJobRequirements r WHERE r.ShiftId=@shift AND r.JobTypeId=@job`,{shift:s.ShiftId,job:s.JobTypeId,day:s.WorkDate,id:s.ScheduleId});
 if(coverage.recordset.some(x=>Number(x.Total)<Number(x.MinStaff)))fail(409,'Thao tác làm thiếu người ở ca đã công bố. Thu hồi lịch hoặc bố trí người thay trước');
}
module.exports={eligible,protectRemoval};
