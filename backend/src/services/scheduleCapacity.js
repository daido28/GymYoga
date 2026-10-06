const {sql}=require('../config/db');
const {fail}=require('./week5Rules');
module.exports=async function capacity(db,shiftId,workDate,excludeId=0){
 const request=()=>db instanceof sql.Transaction?new sql.Request(db):db.request();
 const shift=await request().input('shift',sql.Int,shiftId).query('SELECT Capacity FROM Shifts WITH(UPDLOCK,HOLDLOCK) WHERE ShiftId=@shift AND IsActive=1');
 if(!shift.recordset.length)fail(409,'Ca không hoạt động');
 const count=await request().input('shift',sql.Int,shiftId).input('day',sql.Date,workDate).input('exclude',sql.Int,excludeId).query("SELECT COUNT(*) AS Total FROM WorkSchedules WITH(UPDLOCK,HOLDLOCK) WHERE ShiftId=@shift AND WorkDate=@day AND ScheduleId<>@exclude AND Status<>N'Đã hủy'");
 if(Number(count.recordset[0].Total)>=Number(shift.recordset[0].Capacity))fail(409,'Ca đã đủ số nhân viên cho phép');
};
