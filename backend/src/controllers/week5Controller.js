const shiftTime=require('../services/shiftTime');
const bcrypt=require('bcryptjs');
const capacity=require('../services/scheduleCapacity');
const jobs=require('../services/jobRoster');
const {sql,poolPromise}=require('../config/db');
const {fail,id,reason,decision,note}=require('../services/week5Rules');
const query=async(db,text,params={})=>{
 const r=db instanceof sql.Transaction?new sql.Request(db):db.request();
 if(db.branchId)r.input("branch",sql.Int,db.branchId);
 for(const [name,[type,value]] of Object.entries(params))r.input(name,type,value);
 const result=await r.query(text);
 for(const row of result.recordset||[])for(const key of Object.keys(row)){
  if(row[key]!==null&&(/Id$/.test(key)||['Capacity','Total','MinStaff','MaxStaff','IsToday','IsPast'].includes(key)))row[key]=Number(row[key]);
 }
 return result;
};
const int=v=>[sql.Int,v],str=v=>[sql.NVarChar,v];
const endpoint=fn=>async(req,res)=>{
 let tx;
 try{
  const pool=await poolPromise;tx=new sql.Transaction(pool);await tx.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
  const actor=await query(tx,`SELECT u.UserId,r.RoleName,e.EmployeeId,e.IsActive AS EmployeeActive
   FROM AppUsers u JOIN Roles r ON r.RoleId=u.RoleId LEFT JOIN Employees e ON e.UserId=u.UserId
   WHERE u.UserId=@user AND u.IsActive=1`,{user:int(req.user.userId)});
  if(!actor.recordset.length)fail(403,'Tài khoản không hoạt động');
  req.actor=actor.recordset[0];tx.branchId=req.branchId;
  if(req.actor.RoleName==='Quản lý chi nhánh')req.actor.RoleName='Admin';
  const denied=await require('../services/branchScope').guard(tx,req);
  if(denied)fail(denied.status,denied.message);
  const result=await fn(req,tx);await tx.commit();tx=null;
  res.status(result.status||200).json({message:result.message||'Thành công',data:result.data});
 }catch(error){if(tx){try{await tx.rollback();}catch{}}
  const duplicate=[2601,2627].includes(error.number);
  const status=error.status||(duplicate?409:500);
  if(status===500)console.error('Week5:',error.message);
  res.status(status).json({message:error.status?error.message:(duplicate?'Dữ liệu trùng hoặc yêu cầu đang chờ xử lý':'Không thể xử lý. Kiểm tra cấu hình và migration database.')});
 }
};
function staff(req){if(req.actor.RoleName!=='Nhân viên'||!req.actor.EmployeeId||!req.actor.EmployeeActive)fail(403,'Cần tài khoản nhân viên đang hoạt động và liên kết hồ sơ');}
function admin(req){if(req.actor.RoleName!=='Admin')fail(403,'Chỉ Admin được thực hiện');}
async function schedule(db,scheduleId){
 const r=await query(db,`SELECT ws.*,s.StartTime,s.EndTime,s.IsActive AS ShiftActive,e.IsActive AS EmployeeActive,
  CASE WHEN ws.WorkDate=CONVERT(date,SYSDATETIME()) THEN 1 ELSE 0 END AS IsToday,
  CASE WHEN ws.WorkDate<CONVERT(date,SYSDATETIME()) THEN 1 ELSE 0 END AS IsPast
  FROM WorkSchedules ws WITH(UPDLOCK,HOLDLOCK) JOIN Shifts s ON s.ShiftId=ws.ShiftId JOIN Employees e ON e.EmployeeId=ws.EmployeeId
  WHERE ws.ScheduleId=@id`,{id:int(scheduleId)});
 if(!r.recordset.length)fail(404,'Không tìm thấy lịch');return r.recordset[0];
}
function owned(req,s){staff(req);if(s.EmployeeId!==req.actor.EmployeeId)fail(403,'Không có quyền với lịch này');}
function usable(s){if(s.Status==='Đã hủy'||!s.EmployeeActive||!s.ShiftActive)fail(409,'Lịch, nhân viên hoặc ca không hoạt động');}
async function notAttended(db,scheduleId){const r=await query(db,'SELECT AttendanceId FROM Attendance WITH(UPDLOCK,HOLDLOCK) WHERE ScheduleId=@id',{id:int(scheduleId)});if(r.recordset.length)fail(409,'Ca đã chấm công, không thể nghỉ hoặc đổi');}
async function notPending(db,scheduleId){const r=await query(db,`SELECT RequestId FROM LeaveRequests WITH(UPDLOCK,HOLDLOCK) WHERE ScheduleId=@id AND Status='Pending'
 UNION ALL SELECT RequestId FROM ShiftChangeRequests WITH(UPDLOCK,HOLDLOCK) WHERE ScheduleId=@id AND Status='Pending'`,{id:int(scheduleId)});if(r.recordset.length)fail(409,'Ca có yêu cầu đang chờ xử lý');}
const createAccount=endpoint(async(req,db)=>{
 admin(req);const employeeId=id(req.params.id),{username,password}=req.body;
 if(typeof username!=='string'||!/^[a-zA-Z0-9_.-]{3,50}$/.test(username))fail(400,'Username dài 3–50 ký tự: chữ, số, dấu _, . hoặc -');
 if(typeof password!=='string'||password.length<8||Buffer.byteLength(password,'utf8')>72)fail(400,'Mật khẩu ít nhất 8 ký tự, tối đa 72 byte UTF-8');
 const e=await query(db,'SELECT UserId,IsActive FROM Employees WITH(UPDLOCK,HOLDLOCK) WHERE EmployeeId=@id',{id:int(employeeId)});
 if(!e.recordset.length)fail(404,'Không tìm thấy nhân viên');if(!e.recordset[0].IsActive||e.recordset[0].UserId)fail(409,'Nhân viên không hoạt động hoặc đã có tài khoản');
 const accountRole=req.body.role===undefined?'Nhân viên':req.body.role;
 if(!['Nhân viên','Admin','Quản lý chi nhánh'].includes(accountRole))fail(400,'Vai trò tài khoản không hợp lệ');
 if(req.user.role!=='Admin'&&accountRole!=='Nhân viên')fail(403,'Chỉ Admin hệ thống được cấp tài khoản quản lý');
 const role=await query(db,'SELECT RoleId FROM Roles WHERE RoleName=@name',{name:str(accountRole)});if(!role.recordset.length)fail(409,'Chưa có vai trò tài khoản, cần kiểm tra cấu hình');
 const hash=await bcrypt.hash(password,10);
 const u=await query(db,'INSERT INTO AppUsers(Username,PasswordHash,RoleId) OUTPUT INSERTED.UserId VALUES(@name,@hash,@role)',{name:str(username),hash:str(hash),role:int(role.recordset[0].RoleId)});
 if(accountRole==='Quản lý chi nhánh')await query(db,'INSERT UserBranches(UserId,BranchId) VALUES(@user,@branch)',{user:int(u.recordset[0].UserId)});
 await query(db,'UPDATE Employees SET UserId=@user WHERE EmployeeId=@id',{user:int(u.recordset[0].UserId),id:int(employeeId)});
 return {status:201,message:'Đã tạo và liên kết tài khoản',data:{employeeId,userId:u.recordset[0].UserId,username,role:accountRole}};
});
const listAttendance=endpoint(async(req,db)=>{
 if(req.actor.RoleName!=='Admin')staff(req);
 const r=await query(db,`SELECT a.*,ws.WorkDate,e.FullName,s.ShiftName FROM Attendance a
 JOIN WorkSchedules ws ON ws.ScheduleId=a.ScheduleId JOIN Employees e ON e.EmployeeId=ws.EmployeeId JOIN Shifts s ON s.ShiftId=ws.ShiftId
 WHERE ws.ShiftId IN(SELECT ShiftId FROM Shifts WHERE BranchId=@branch) ${req.actor.RoleName==='Admin'?'':'AND ws.EmployeeId=@employee'} ORDER BY a.AttendanceId DESC`,req.actor.RoleName==='Admin'?{}:{employee:int(req.actor.EmployeeId)});
 return {data:r.recordset};
});
const checkIn=endpoint(async(req,db)=>{
 const scheduleId=id(req.body.scheduleId),s=await schedule(db,scheduleId);owned(req,s);usable(s);
 if(!s.IsToday)fail(409,'Chỉ chấm công ca của ngày hôm nay');await notPending(db,scheduleId);
 const r=await query(db,'INSERT INTO Attendance(ScheduleId) OUTPUT INSERTED.* VALUES(@id)',{id:int(scheduleId)});
 return {status:201,message:'Đã ghi nhận vào ca bằng giờ máy chủ',data:r.recordset[0]};
});
const checkOut=endpoint(async(req,db)=>{
 const scheduleId=id(req.body.scheduleId),s=await schedule(db,scheduleId);owned(req,s);usable(s);
 const r=await query(db,`UPDATE Attendance SET CheckOutAt=SYSDATETIME() OUTPUT INSERTED.* WHERE ScheduleId=@id AND CheckOutAt IS NULL`,{id:int(scheduleId)});
 if(!r.recordset.length)fail(409,'Chưa vào ca hoặc đã ra ca');return {message:'Đã ghi nhận ra ca',data:r.recordset[0]};
});
const listRequests=kind=>endpoint(async(req,db)=>{
 if(req.actor.RoleName!=='Admin')staff(req);
 const table=kind==='leave'?'LeaveRequests':'ShiftChangeRequests';
 const r=await query(db,`SELECT r.*,ws.WorkDate,e.FullName,s.ShiftName ${kind==='change'?',ts.ShiftName AS TargetShiftName':''}
 FROM ${table} r JOIN WorkSchedules ws ON ws.ScheduleId=r.ScheduleId JOIN Employees e ON e.EmployeeId=r.EmployeeId
 JOIN Shifts s ON s.ShiftId=${kind==='change'?'r.OriginalShiftId':'ws.ShiftId'} ${kind==='change'?'JOIN Shifts ts ON ts.ShiftId=r.TargetShiftId':''}
 WHERE e.BranchId=@branch ${req.actor.RoleName==='Admin'?'':'AND r.EmployeeId=@employee'} ORDER BY r.RequestId DESC`,req.actor.RoleName==='Admin'?{}:{employee:int(req.actor.EmployeeId)});
 return {data:r.recordset};
});
const createRequest=kind=>endpoint(async(req,db)=>{
 const scheduleId=id(req.body.scheduleId),text=reason(req.body.reason),s=await schedule(db,scheduleId);owned(req,s);usable(s);
 if(s.IsPast)fail(409,'Không yêu cầu cho ca đã qua');await notAttended(db,scheduleId);await notPending(db,scheduleId);
 let r;
 if(kind==='leave')r=await query(db,'INSERT INTO LeaveRequests(ScheduleId,EmployeeId,Reason) OUTPUT INSERTED.* VALUES(@id,@employee,@reason)',{id:int(scheduleId),employee:int(s.EmployeeId),reason:str(text)});
 else{
  const target=id(req.body.targetShiftId);if(target===s.ShiftId)fail(400,'Ca đích phải khác ca hiện tại');
  const shift=await query(db,'SELECT ShiftId FROM Shifts WHERE ShiftId=@id AND IsActive=1',{id:int(target)});if(!shift.recordset.length)fail(400,'Ca đích không hoạt động');
  r=await query(db,'INSERT INTO ShiftChangeRequests(ScheduleId,EmployeeId,OriginalShiftId,TargetShiftId,Reason) OUTPUT INSERTED.* VALUES(@id,@employee,@original,@target,@reason)',{id:int(scheduleId),employee:int(s.EmployeeId),original:int(s.ShiftId),target:int(target),reason:str(text)});
 }
 return {status:201,message:'Yêu cầu đang chờ Admin duyệt',data:r.recordset[0]};
});
const review=kind=>endpoint(async(req,db)=>{
 admin(req);const requestId=id(req.params.id),status=decision(req.body.status),reviewNote=note(req.body.reviewNote);
 const table=kind==='leave'?'LeaveRequests':'ShiftChangeRequests';
 const r=await query(db,`SELECT * FROM ${table} WITH(UPDLOCK,HOLDLOCK) WHERE RequestId=@id`,{id:int(requestId)});
 if(!r.recordset.length)fail(404,'Không tìm thấy yêu cầu');const item=r.recordset[0];if(item.Status!=='Pending')fail(409,'Yêu cầu đã xử lý');
 if(status==='Approved'){
  const s=await schedule(db,item.ScheduleId);usable(s);if(s.EmployeeId!==item.EmployeeId||s.IsPast)fail(409,'Lịch đã thay đổi hoặc đã qua');await notAttended(db,item.ScheduleId);
  await jobs.protectRemoval(db,s);
  if(kind==='leave')await query(db,"UPDATE WorkSchedules SET Status=N'Đã hủy' WHERE ScheduleId=@id",{id:int(item.ScheduleId)});
  else{
   if(s.ShiftId!==item.OriginalShiftId)fail(409,'Ca gốc đã thay đổi');
   const conflict=await query(db,`SELECT TOP 1 ws.ScheduleId FROM WorkSchedules ws WITH(UPDLOCK,HOLDLOCK)
    JOIN Shifts existing ON existing.ShiftId=ws.ShiftId JOIN Shifts target ON target.ShiftId=@target
    WHERE ws.EmployeeId=@employee AND ws.WorkDate=@day AND ws.ScheduleId<>@id AND ws.Status<>N'Đã hủy'
    AND ${shiftTime.overlap('target.StartTime','target.EndTime','existing.StartTime','existing.EndTime')}`,{target:int(item.TargetShiftId),employee:int(item.EmployeeId),day:[sql.Date,s.WorkDate],id:int(item.ScheduleId)});
   if(conflict.recordset.length)fail(409,'Ca đích trùng lịch hiện có');
   const target=await query(db,'SELECT ShiftId FROM Shifts WHERE ShiftId=@id AND IsActive=1',{id:int(item.TargetShiftId)});if(!target.recordset.length)fail(409,'Ca đích không hoạt động');
   await capacity(db,item.TargetShiftId,s.WorkDate,item.ScheduleId);
   const configured=await query(db,'SELECT JobTypeId FROM ShiftJobRequirements WHERE ShiftId=@id',{id:int(item.TargetShiftId)});
   if(configured.recordset.length){if(!s.JobTypeId)fail(409,'Lịch chưa có công việc; cần Admin phân loại trước');await jobs.eligible(db,item.EmployeeId,item.TargetShiftId,s.WorkDate,s.JobTypeId,item.ScheduleId);}
   else if(s.JobTypeId)fail(409,'Ca đích chưa cấu hình công việc');
   await query(db,'UPDATE WorkSchedules SET ShiftId=@target WHERE ScheduleId=@id',{target:int(item.TargetShiftId),id:int(item.ScheduleId)});
  }
 }
 await query(db,`UPDATE ${table} SET Status=@status,ReviewedBy=@user,ReviewedAt=SYSDATETIME(),ReviewNote=@note WHERE RequestId=@id`,{status:[sql.VarChar,status],user:int(req.actor.UserId),note:str(reviewNote),id:int(requestId)});
 return {message:status==='Approved'?'Đã phê duyệt':'Đã từ chối'};
});
module.exports={createAccount,listAttendance,checkIn,checkOut,listLeave:listRequests('leave'),listChange:listRequests('change'),createLeave:createRequest('leave'),createChange:createRequest('change'),reviewLeave:review('leave'),reviewChange:review('change')};
module.exports.helpers={endpoint,query,admin,staff,schedule,usable,notAttended,notPending,int,str};
