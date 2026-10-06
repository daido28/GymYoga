const shiftTime=require('../services/shiftTime');
const {sql}=require('../config/db');
const {fail,id,note}=require('../services/week5Rules');
const capacity=require('../services/scheduleCapacity');
const jobs=require('../services/jobRoster');
const {endpoint,query,admin,staff,schedule,usable,notAttended,notPending,int,str}=require('./week5Controller').helpers;
function date(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)fail(400,'Ngày phải hợp lệ theo yyyy-mm-dd');return value;}
const calendar=endpoint(async(req,db)=>{
 if(req.actor.RoleName!=='Admin')staff(req);
 const start=date(req.query.start),end=date(req.query.end);
 if(end<start||(Date.parse(end)-Date.parse(start))/86400000>42)fail(400,'Khoảng lịch tối đa 42 ngày');
 const shifts=await query(db,'SELECT ShiftId,ShiftCode,ShiftName,StartTime,EndTime,Capacity,IsSupport FROM Shifts WHERE BranchId=@branch AND IsActive=1 ORDER BY IsSupport,StartTime');
 const rows=await query(db,`SELECT ws.ScheduleId,ws.EmployeeId,ws.ShiftId,ws.WorkDate,ws.JobTypeId,e.FullName,j.JobName,j.Color FROM WorkSchedules ws JOIN Employees e ON e.EmployeeId=ws.EmployeeId LEFT JOIN JobTypes j ON j.JobTypeId=ws.JobTypeId WHERE e.BranchId=@branch AND ws.WorkDate BETWEEN @start AND @end AND ws.Status<>N'Đã hủy'`,{start:[sql.Date,start],end:[sql.Date,end]});
 const requirements=await query(db,'SELECT r.*,j.JobName,j.Color FROM ShiftJobRequirements r JOIN JobTypes j ON j.JobTypeId=r.JobTypeId WHERE j.BranchId=@branch');
 const publications=await query(db,'SELECT ShiftId,WorkDate FROM RosterPublications WHERE ShiftId IN(SELECT ShiftId FROM Shifts WHERE BranchId=@branch) AND WorkDate BETWEEN @start AND @end',{start:[sql.Date,start],end:[sql.Date,end]});
 return {data:{shifts:shifts.recordset,schedules:rows.recordset,requirements:requirements.recordset,publications:publications.recordset}};
});
const saveInTransaction=async(req,db,update=false)=>{
 const employee=id(req.body.employeeId),shift=id(req.body.shiftId),day=date(req.body.workDate),scheduleId=update?id(req.params.id):0;
 let old;
 if(update){old=await schedule(db,scheduleId);usable(old);await notAttended(db,scheduleId);await notPending(db,scheduleId);}
 const e=await query(db,'SELECT EmployeeId FROM Employees WHERE EmployeeId=@id AND IsActive=1',{id:int(employee)});if(!e.recordset.length)fail(400,'Nhân viên không hoạt động');
 await capacity(db,shift,day,scheduleId);
 const required=await query(db,'SELECT JobTypeId FROM ShiftJobRequirements WHERE ShiftId=@id',{id:int(shift)});
 let job=req.body.jobTypeId==null?null:id(req.body.jobTypeId);
 if(required.recordset.length){
  if(!job){const primary=await query(db,'SELECT JobTypeId FROM EmployeeJobTypes WHERE EmployeeId=@id AND IsPrimary=1',{id:int(employee)});job=primary.recordset[0]?.JobTypeId;}
  if(!job)fail(409,'Chọn công việc và cấu hình công việc được phép cho nhân viên');
  await jobs.eligible(db,employee,shift,day,job,scheduleId);
 }else if(job)fail(409,'Ca chưa cấu hình nhu cầu công việc');
 if(old&&(old.EmployeeId!==employee||old.ShiftId!==shift||old.WorkDate.toISOString().slice(0,10)!==day||old.JobTypeId!==job))await jobs.protectRemoval(db,old);
 const overlaps=await query(db,`SELECT TOP 1 ws.ScheduleId FROM WorkSchedules ws WITH(UPDLOCK,HOLDLOCK) JOIN Shifts old ON old.ShiftId=ws.ShiftId JOIN Shifts target ON target.ShiftId=@shift WHERE ws.EmployeeId=@employee AND ws.WorkDate=@day AND ws.ScheduleId<>@id AND ws.Status<>N'Đã hủy' AND ${shiftTime.overlap('target.StartTime','target.EndTime','old.StartTime','old.EndTime')}`,{shift:int(shift),employee:int(employee),day:[sql.Date,day],id:int(scheduleId)});
 if(overlaps.recordset.length)fail(409,'Nhân viên có ca trùng thời gian');
 const scheduleNote=note(req.body.note);if(scheduleNote&&scheduleNote.length>255)fail(400,'Ghi chú lịch tối đa 255 ký tự');
 const params={employee:int(employee),shift:int(shift),day:[sql.Date,day],job:int(job),note:str(scheduleNote)};
 let r;
 if(update)r=await query(db,'UPDATE WorkSchedules SET EmployeeId=@employee,ShiftId=@shift,WorkDate=@day,JobTypeId=@job,Note=@note OUTPUT INSERTED.* WHERE ScheduleId=@id',{...params,id:int(scheduleId)});
 else{
  // Preserve cancelled history and avoid violating the existing unique key.
  const cancelled=await query(db,"SELECT ScheduleId FROM WorkSchedules WITH(UPDLOCK,HOLDLOCK) WHERE EmployeeId=@employee AND ShiftId=@shift AND WorkDate=@day AND Status=N'Đã hủy'",params);
  if(cancelled.recordset.length)fail(409,'Lịch này đã hủy; chọn ca khác hoặc ngày khác để giữ lịch sử');
  r=await query(db,'INSERT INTO WorkSchedules(EmployeeId,ShiftId,WorkDate,JobTypeId,Note) OUTPUT INSERTED.* VALUES(@employee,@shift,@day,@job,@note)',params);
 }
 return {status:update?200:201,message:update?'Đã cập nhật phân công':'Đã phân công',data:r.recordset[0]};
};
const save=update=>endpoint(async(req,db)=>{admin(req);return saveInTransaction(req,db,update);});
const cancel=endpoint(async(req,db)=>{admin(req);const sid=id(req.params.id),s=await schedule(db,sid);usable(s);await notAttended(db,sid);await notPending(db,sid);await jobs.protectRemoval(db,s);await query(db,"UPDATE WorkSchedules SET Status=N'Đã hủy' WHERE ScheduleId=@id",{id:int(sid)});return {message:'Đã hủy lịch, giữ lịch sử'};});
const configure=endpoint(async(req,db)=>{
 admin(req);const sid=id(req.params.id),limit=id(req.body.capacity);if(typeof req.body.isSupport!=='boolean')fail(400,'isSupport phải là boolean');
 const s=await query(db,'SELECT ShiftId FROM Shifts WITH(UPDLOCK,HOLDLOCK) WHERE ShiftId=@id',{id:int(sid)});if(!s.recordset.length)fail(404,'Không tìm thấy ca');
 const max=await query(db,"SELECT TOP 1 COUNT(*) AS Total FROM WorkSchedules WITH(UPDLOCK,HOLDLOCK) WHERE ShiftId=@id AND Status<>N'Đã hủy' GROUP BY WorkDate ORDER BY COUNT(*) DESC",{id:int(sid)});
 if(max.recordset.length&&max.recordset[0].Total>limit)fail(409,'Giới hạn mới thấp hơn số người đã phân công');
 const required=await query(db,'SELECT SUM(MinStaff) Total FROM ShiftJobRequirements WHERE ShiftId=@id',{id:int(sid)});if(Number(required.recordset[0].Total)>limit)fail(409,'Sức chứa thấp hơn tổng nhu cầu tối thiểu của công việc');
 await query(db,'UPDATE Shifts SET Capacity=@limit,IsSupport=@support WHERE ShiftId=@id',{id:int(sid),limit:int(limit),support:[sql.Bit,req.body.isSupport]});return {message:'Đã cập nhật giới hạn ca'};
});
module.exports={calendar,assign:save(false),update:save(true),cancel,configure,saveInTransaction};
