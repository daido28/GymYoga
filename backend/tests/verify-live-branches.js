require('dotenv').config();
const fs=require('fs'),assert=require('node:assert/strict'),{poolPromise}=require('../src/config/db');
(async()=>{
 const p=await poolPromise;
 try{
  const r=await p.request().query(`SELECT DB_NAME() DatabaseName,(SELECT COUNT(*) FROM Employees) Employees,(SELECT COUNT(*) FROM Shifts) Shifts,(SELECT COUNT(*) FROM WorkSchedules) WorkSchedules,(SELECT COUNT(*) FROM Branches) Branches;
   SELECT BranchName FROM Branches; SELECT RoleName FROM Roles; SELECT JobName FROM JobTypes;`);
  assert(r.recordsets[2].some(x=>x.RoleName==='Quản lý chi nhánh'));
  assert(r.recordsets[1].some(x=>x.BranchName==='Chi nhánh hiện tại'));
  assert(r.recordsets[3].some(x=>x.JobName==='Huấn luyện viên'));
  const proof={checkedAt:new Date().toISOString(),dataCounts:r.recordsets[0][0],defaultVietnameseLabels:'PASS',migration:'004_branches.sql',before:{Employees:4,Shifts:4,WorkSchedules:4}};
  fs.mkdirSync('test-results',{recursive:true});fs.writeFileSync('test-results/live-branches-check.json',JSON.stringify(proof,null,2));
  console.log(JSON.stringify(proof));
 }finally{await p.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
