const {sql}=require('../config/db');
const {id,fail}=require('../services/week5Rules');
const {endpoint,query,admin,staff,int,str}=require('./week5Controller').helpers;
const catalog=endpoint(async(req,db)=>{
 if(req.actor.RoleName!=='Admin')staff(req);
 const jobs=await query(db,'SELECT * FROM JobTypes WHERE BranchId=@branch ORDER BY JobName');
 const employees=await query(db,`SELECT EmployeeId,FullName,Position,IsActive ${req.actor.RoleName==='Admin'?',CASE WHEN UserId IS NULL THEN 0 ELSE 1 END AS HasAccount':''} FROM Employees WHERE BranchId=@branch AND IsActive=1 ORDER BY FullName`);
 const permissions=await query(db,'SELECT * FROM EmployeeJobTypes WHERE EmployeeId IN(SELECT EmployeeId FROM Employees WHERE BranchId=@branch)');
 const requirements=await query(db,'SELECT * FROM ShiftJobRequirements WHERE ShiftId IN(SELECT ShiftId FROM Shifts WHERE BranchId=@branch)');
 return {data:{jobs:jobs.recordset,employees:employees.recordset,permissions:permissions.recordset,requirements:requirements.recordset}};
});
const create=endpoint(async(req,db)=>{
 admin(req);const {jobName,color}=req.body;if(typeof jobName!=='string'||!jobName.trim()||jobName.trim().length>80)fail(400,'Tên công việc từ 1 đến 80 ký tự');if(!/^#[0-9a-fA-F]{6}$/.test(color||''))fail(400,'Màu không hợp lệ');
 const r=await query(db,'INSERT INTO JobTypes(JobName,Color,BranchId) OUTPUT INSERTED.* VALUES(@name,@color,@branch)',{name:str(jobName.trim()),color:[sql.VarChar,color]});return {status:201,data:r.recordset[0],message:'Đã tạo công việc'};
});
const edit=endpoint(async(req,db)=>{
 admin(req);const job=id(req.params.id),{jobName,color}=req.body;if(typeof jobName!=='string'||!jobName.trim()||jobName.trim().length>80||!/^#[0-9a-fA-F]{6}$/.test(color||''))fail(400,'Tên hoặc màu công việc không hợp lệ');
 const r=await query(db,'UPDATE JobTypes SET JobName=@name,Color=@color OUTPUT INSERTED.* WHERE JobTypeId=@id',{name:str(jobName.trim()),color:[sql.VarChar,color],id:int(job)});if(!r.recordset.length)fail(404,'Không tìm thấy công việc');return {message:'Đã cập nhật công việc',data:r.recordset[0]};
});
const permissions=endpoint(async(req,db)=>{
 admin(req);const employee=id(req.params.id);if(!Array.isArray(req.body.jobTypeIds)||!req.body.jobTypeIds.length)fail(400,'Chọn ít nhất một công việc');const jobs=[...new Set(req.body.jobTypeIds.map(id))],primary=id(req.body.primaryJobTypeId);if(!jobs.includes(primary))fail(400,'Công việc chính phải nằm trong danh sách được phép');
 const e=await query(db,'SELECT EmployeeId FROM Employees WITH(UPDLOCK,HOLDLOCK) WHERE EmployeeId=@id AND IsActive=1',{id:int(employee)});if(!e.recordset.length)fail(404,'Nhân viên không hoạt động');
 for(const job of jobs){const j=await query(db,'SELECT JobTypeId FROM JobTypes WHERE JobTypeId=@id AND IsActive=1',{id:int(job)});if(!j.recordset.length)fail(400,'Công việc không hoạt động');}
 const assigned=await query(db,"SELECT DISTINCT JobTypeId FROM WorkSchedules WITH(UPDLOCK,HOLDLOCK) WHERE EmployeeId=@id AND WorkDate>=CONVERT(date,GETDATE()) AND Status<>N'Đã hủy' AND JobTypeId IS NOT NULL",{id:int(employee)});if(assigned.recordset.some(r=>!jobs.includes(r.JobTypeId)))fail(409,'Không thể bỏ công việc đã phân công từ hôm nay trở đi');
 await query(db,'DELETE FROM EmployeeJobTypes WHERE EmployeeId=@id',{id:int(employee)});for(const job of jobs)await query(db,'INSERT INTO EmployeeJobTypes VALUES(@employee,@job,@primary)',{employee:int(employee),job:int(job),primary:[sql.Bit,job===primary]});return {message:'Đã lưu công việc nhân viên'};
});
const requirements=endpoint(async(req,db)=>{
 admin(req);const shift=id(req.params.id);if(!Array.isArray(req.body.requirements))fail(400,'Danh sách nhu cầu không hợp lệ');const rows=req.body.requirements.map(x=>({job:id(x.jobTypeId),min:Number(x.minStaff),max:Number(x.maxStaff)}));if(new Set(rows.map(x=>x.job)).size!==rows.length)fail(400,'Không được lặp loại công việc');for(const x of rows)if(!Number.isSafeInteger(x.min)||x.min<0||!Number.isSafeInteger(x.max)||x.max<1||x.max<x.min)fail(400,'Tối thiểu/tối đa phải hợp lệ');
 const s=await query(db,'SELECT Capacity FROM Shifts WITH(UPDLOCK,HOLDLOCK) WHERE ShiftId=@id AND IsActive=1',{id:int(shift)});if(!s.recordset.length)fail(404,'Ca không hoạt động');if(rows.reduce((a,x)=>a+x.min,0)>s.recordset[0].Capacity)fail(409,'Tổng số người tối thiểu vượt sức chứa ca');
 const publication=await query(db,'SELECT ShiftId FROM RosterPublications WITH(UPDLOCK,HOLDLOCK) WHERE ShiftId=@id AND WorkDate>=CONVERT(date,GETDATE())',{id:int(shift)});if(publication.recordset.length)fail(409,'Thu hồi lịch đã công bố của ca trước khi đổi nhu cầu');
 const assigned=await query(db,"SELECT JobTypeId,COUNT(*) Total FROM WorkSchedules WITH(UPDLOCK,HOLDLOCK) WHERE ShiftId=@id AND WorkDate>=CONVERT(date,GETDATE()) AND Status<>N'Đã hủy' AND JobTypeId IS NOT NULL GROUP BY WorkDate,JobTypeId",{id:int(shift)});for(const a of assigned.recordset){const rule=rows.find(x=>x.job===a.JobTypeId);if(!rule||Number(a.Total)>rule.max)fail(409,'Nhu cầu mới không phù hợp với lịch đã phân công');}
 for(const r of rows){const j=await query(db,'SELECT JobTypeId FROM JobTypes WHERE JobTypeId=@id AND IsActive=1',{id:int(r.job)});if(!j.recordset.length)fail(400,'Công việc không hoạt động');}
 await query(db,'DELETE FROM ShiftJobRequirements WHERE ShiftId=@id',{id:int(shift)});for(const r of rows)await query(db,'INSERT INTO ShiftJobRequirements VALUES(@shift,@job,@min,@max)',{shift:int(shift),job:int(r.job),min:int(r.min),max:int(r.max)});return {message:'Đã lưu nhu cầu của ca'};
});
const publish=endpoint(async(req,db)=>{
 admin(req);const shift=id(req.body.shiftId),day=req.body.workDate;if(typeof day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Number.isFinite(Date.parse(day))||new Date(day).toISOString().slice(0,10)!==day)fail(400,'Ngày không hợp lệ');
 const s=await query(db,'SELECT Capacity FROM Shifts WITH(UPDLOCK,HOLDLOCK) WHERE ShiftId=@id AND IsActive=1',{id:int(shift)});if(!s.recordset.length)fail(404,'Ca không hoạt động');
 if(req.body.publish===false){await query(db,'DELETE FROM RosterPublications WHERE ShiftId=@shift AND WorkDate=@day',{shift:int(shift),day:[sql.Date,day]});return {message:'Đã thu hồi lịch về bản nháp'};}
 if(req.body.publish!==true)fail(400,'publish phải là boolean');
 const rules=await query(db,'SELECT * FROM ShiftJobRequirements WITH(UPDLOCK,HOLDLOCK) WHERE ShiftId=@id',{id:int(shift)});if(!rules.recordset.length)fail(409,'Cần cấu hình công việc cho ca');
 const assigned=await query(db,`SELECT ws.JobTypeId,e.IsActive EmployeeActive,j.IsActive JobActive,p.JobTypeId Allowed FROM WorkSchedules ws WITH(UPDLOCK,HOLDLOCK) JOIN Employees e ON e.EmployeeId=ws.EmployeeId LEFT JOIN JobTypes j ON j.JobTypeId=ws.JobTypeId LEFT JOIN EmployeeJobTypes p ON p.EmployeeId=ws.EmployeeId AND p.JobTypeId=ws.JobTypeId WHERE ws.ShiftId=@shift AND ws.WorkDate=@day AND ws.Status<>N'Đã hủy'`,{shift:int(shift),day:[sql.Date,day]});
 if(assigned.recordset.length>s.recordset[0].Capacity)fail(409,'Ca vượt sức chứa');if(assigned.recordset.some(x=>!x.JobTypeId||!x.Allowed||!x.EmployeeActive||!x.JobActive||!rules.recordset.some(r=>r.JobTypeId===x.JobTypeId)))fail(409,'Có nhân viên chưa phân loại hoặc không đủ điều kiện công việc');
 for(const r of rules.recordset){const total=assigned.recordset.filter(x=>x.JobTypeId===r.JobTypeId).length;if(total<Number(r.MinStaff)||total>Number(r.MaxStaff))fail(409,'Ca chưa đủ công việc hoặc vượt số người tối đa của công việc');}
 await query(db,'DELETE FROM RosterPublications WHERE ShiftId=@shift AND WorkDate=@day; INSERT INTO RosterPublications(ShiftId,WorkDate,PublishedBy) VALUES(@shift,@day,@user)',{shift:int(shift),day:[sql.Date,day],user:int(req.actor.UserId)});return {message:'Đã công bố lịch đủ công việc'};
});
const employeeStatus=endpoint(async(req,db)=>{
 admin(req);const employee=id(req.params.id),active=req.body.isActive;if(typeof active!=='boolean')fail(400,'Trạng thái phải là boolean');
 const e=await query(db,'SELECT EmployeeId FROM Employees WITH(UPDLOCK,HOLDLOCK) WHERE EmployeeId=@id',{id:int(employee)});if(!e.recordset.length)fail(404,'Không tìm thấy nhân viên');
 if(!active){const p=await query(db,"SELECT TOP 1 ws.ScheduleId FROM WorkSchedules ws WITH(UPDLOCK,HOLDLOCK) JOIN RosterPublications p ON p.ShiftId=ws.ShiftId AND p.WorkDate=ws.WorkDate WHERE ws.EmployeeId=@id AND ws.WorkDate>=CONVERT(date,GETDATE()) AND ws.Status<>N'Đã hủy'",{id:int(employee)});if(p.recordset.length)fail(409,'Thu hồi lịch đã công bố hoặc thay người trước khi ngừng hoạt động nhân viên');}
 await query(db,'UPDATE Employees SET IsActive=@active WHERE EmployeeId=@id',{id:int(employee),active:[sql.Bit,active]});return {message:active?'Đã kích hoạt nhân viên':'Đã ngừng hoạt động nhân viên'};
});
const shiftStatus=endpoint(async(req,db)=>{
 admin(req);const shift=id(req.params.id),active=req.body.isActive;if(typeof active!=='boolean')fail(400,'Trạng thái phải là boolean');
 const s=await query(db,'SELECT ShiftId FROM Shifts WITH(UPDLOCK,HOLDLOCK) WHERE ShiftId=@id',{id:int(shift)});if(!s.recordset.length)fail(404,'Không tìm thấy ca');
 if(!active){const p=await query(db,'SELECT ShiftId FROM RosterPublications WITH(UPDLOCK,HOLDLOCK) WHERE ShiftId=@id AND WorkDate>=CONVERT(date,GETDATE())',{id:int(shift)});if(p.recordset.length)fail(409,'Thu hồi lịch đã công bố trước khi ngừng áp dụng ca');}
 await query(db,'UPDATE Shifts SET IsActive=@active WHERE ShiftId=@id',{id:int(shift),active:[sql.Bit,active]});return {message:active?'Đã kích hoạt ca':'Đã ngừng áp dụng ca'};
});
module.exports={catalog,create,edit,permissions,requirements,publish,employeeStatus,shiftStatus};
