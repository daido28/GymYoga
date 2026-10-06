const {sql}=require('../config/db');
const managerRole='Quản lý chi nhánh';
async function resolve(pool,actor,requested){
 let allowed;
 if(actor.RoleName==='Admin')allowed=(await pool.request().query('SELECT BranchId FROM Branches WHERE IsActive=1 ORDER BY BranchId')).recordset;
 else if(actor.RoleName===managerRole)allowed=(await pool.request().input('user',sql.Int,Number(actor.UserId)).query('SELECT b.BranchId FROM UserBranches ub JOIN Branches b ON b.BranchId=ub.BranchId WHERE ub.UserId=@user AND b.IsActive=1 ORDER BY b.BranchId')).recordset;
 else allowed=(await pool.request().input('branch',sql.Int,Number(actor.BranchId)).query('SELECT BranchId FROM Branches WHERE BranchId=@branch AND IsActive=1')).recordset;
 const branch=requested===undefined?Number(allowed[0]?.BranchId):Number(requested);
 if(!Number.isSafeInteger(branch)||!allowed.some(b=>Number(b.BranchId)===branch))return null;
 return branch;
}
async function guard(pool,req){
 const resources=[];
 const add=(kind,v)=>{if(v!==undefined&&v!==null)resources.push([kind,v]);};
 const base=req.baseUrl,path=req.path;
 if(req.params.id){
  const kind=base==='/api/employees'||path.startsWith('/employees/')?'employee':base==='/api/shifts'||path.startsWith('/shifts/')?'shift':base==='/api/schedules'?'schedule':path.startsWith('/jobs/')?'job':path.startsWith('/leave-requests/')?'leave':path.startsWith('/shift-change-requests/')?'change':null;
  if(kind)add(kind,req.params.id);
 }
 for(const [key,kind]of [['employeeId','employee'],['shiftId','shift'],['targetShiftId','shift'],['scheduleId','schedule'],['jobTypeId','job'],['primaryJobTypeId','job']])add(kind,req.body?.[key]);
 if(Array.isArray(req.body?.jobTypeIds))for(const x of req.body.jobTypeIds)add('job',x);
 if(Array.isArray(req.body?.requirements))for(const x of req.body.requirements)add('job',x?.jobTypeId);
 const sources={employee:'Employees WHERE EmployeeId=@id',shift:'Shifts WHERE ShiftId=@id',job:'JobTypes WHERE JobTypeId=@id',schedule:'WorkSchedules r JOIN Employees e ON e.EmployeeId=r.EmployeeId WHERE r.ScheduleId=@id',leave:'LeaveRequests r JOIN Employees e ON e.EmployeeId=r.EmployeeId WHERE r.RequestId=@id',change:'ShiftChangeRequests r JOIN Employees e ON e.EmployeeId=r.EmployeeId WHERE r.RequestId=@id'};
 for(const[kind,value]of resources){
  const id=Number(value);if(!Number.isSafeInteger(id)||id<=0)return {status:400,message:'Mã dữ liệu không hợp lệ'};
  const request=pool instanceof sql.Transaction?new sql.Request(pool):pool.request();
  const r=await request.input('id',sql.Int,id).input('branch',sql.Int,req.branchId).query('SELECT '+(['schedule','leave','change'].includes(kind)?'e.':'')+'BranchId FROM '+sources[kind]+' AND '+(['schedule','leave','change'].includes(kind)?'e.':'')+'BranchId=@branch');
  if(!r.recordset.length)return {status:404,message:'Không tìm thấy dữ liệu trong chi nhánh đang chọn'};
 }
 return null;
}
module.exports={resolve,guard,managerRole};
