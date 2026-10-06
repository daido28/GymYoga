// Repair only known default labels incorrectly decoded by SQLCMD without -f 65001.
require('dotenv').config();
const {poolPromise,sql}=require('../src/config/db');
(async()=>{
 const pool=await poolPromise,tx=new sql.Transaction(pool);await tx.begin();
 try{
  for(const[table,column,wrong,correct]of [
   ['Branches','BranchName','Chi nhĂ¡nh hiá»‡n táº¡i','Chi nhánh hiện tại'],
   ['Roles','RoleName','Quáº£n lĂ½ chi nhĂ¡nh','Quản lý chi nhánh'],
   ['JobTypes','JobName','Báº£o vá»‡ / giá»¯ xe','Bảo vệ / giữ xe'],
   ['JobTypes','JobName','Huáº¥n luyá»‡n viĂªn','Huấn luyện viên'],
   ['JobTypes','JobName','Quáº§y lá»… tĂ¢n','Quầy lễ tân'],
   ['JobTypes','JobName','Vá»‡ sinh phĂ²ng táº­p','Vệ sinh phòng tập']]){
   await new sql.Request(tx).input('wrong',sql.NVarChar,wrong).input('correct',sql.NVarChar,correct).query(`UPDATE dbo.${table} SET ${column}=@correct WHERE ${column}=@wrong`);
  }
  await tx.commit();console.log('Corrected known default labels; IDs and business records preserved');
 }catch(e){await tx.rollback();throw e;}finally{await pool.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
