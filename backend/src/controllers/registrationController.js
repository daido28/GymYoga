const {sql}=require('../config/db');
const {endpoint,query,staff,int}=require('./week5Controller').helpers;
const {fail,id}=require('../services/week5Rules');
const {saveInTransaction}=require('./calendarController');
function date(v){if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)fail(400,'Ngày phải hợp lệ theo yyyy-mm-dd');return v;}
const register=endpoint(async(req,db)=>{
 staff(req);
 if(req.body.employeeId!==undefined&&Number(req.body.employeeId)!==req.actor.EmployeeId)fail(403,'Chỉ đăng ký ca cho bản thân');
 const start=date(req.body.weekStart),startTime=Date.parse(start);
 if(new Date(start).getUTCDay()!==1)fail(400,'Tuần đăng ký phải bắt đầu từ thứ Hai');
 const entries=req.body.entries;
 if(!Array.isArray(entries)||!entries.length||entries.length>42)fail(400,'Chọn từ 1 đến 42 ca trong cùng một tuần');
 const today=(await query(db,'SELECT CONVERT(varchar(10),SYSDATETIME(),23) Today')).recordset[0].Today,seen=new Set(),data=[];
 for(const entry of entries){
  if(!entry||typeof entry!=='object')fail(400,'Dữ liệu đăng ký không hợp lệ');
  const day=date(entry.workDate),distance=(Date.parse(day)-startTime)/86400000,shift=id(entry.shiftId),job=id(entry.jobTypeId);
  if(distance<0||distance>6)fail(400,'Chỉ được đăng ký trong 7 ngày của tuần đã chọn');
  if(day<today)fail(409,'Không thể đăng ký ngày đã qua');
  const key=day+':'+shift;if(seen.has(key))fail(400,'Không chọn trùng ca trong cùng ngày');seen.add(key);
  const sub={...req,params:{},body:{employeeId:req.actor.EmployeeId,shiftId:shift,jobTypeId:job,workDate:day,note:'Nhân viên đăng ký tuần '+start}};
  const denied=await require('../services/branchScope').guard(db,sub);if(denied)fail(denied.status,denied.message);
  const published=await query(db,'SELECT ShiftId FROM RosterPublications WITH(UPDLOCK,HOLDLOCK) WHERE ShiftId=@shift AND WorkDate=@day',{shift:int(shift),day:[sql.Date,day]});
  if(published.recordset.length)fail(409,'Ca đã công bố; liên hệ quản lý để bổ sung hoặc điều chỉnh');
  const saved=await saveInTransaction(sub,db);data.push(saved.data);
 }
 return {status:201,message:'Đã đăng ký ca trong tuần; quản lý sẽ kiểm tra và công bố lịch',data};
});
module.exports={register};
