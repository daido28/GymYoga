process.env.DB_DATABASE='GymYogaHRM_Week5_Test';
process.env.JWT_SECRET=require('crypto').randomBytes(32).toString('hex');
require('dotenv').config();
const app=require('../src/server'),{poolPromise}=require('../src/config/db');
const jwt=require('jsonwebtoken'),assert=require('node:assert/strict'),fs=require('fs');
let server; const results=[];
async function run(){
 const pool=await poolPromise;
 assert.equal((await pool.request().query('SELECT DB_NAME() Name')).recordset[0].Name,'GymYogaHRM_Week5_Test');
 server=app.listen(3109);
 const actors=(await pool.request().query(`SELECT TOP 1 u.UserId,u.RoleId FROM AppUsers u JOIN Roles r ON r.RoleId=u.RoleId WHERE r.RoleName=N'Admin' AND u.IsActive=1`)).recordset[0];
 const sign=(userId,role)=>jwt.sign({userId,role},process.env.JWT_SECRET);
 const admin=sign(Number(actors.UserId),'Admin');
 async function call(label,path,token,expected,method='GET',body){
  const r=await fetch('http://localhost:3109/api/'+path,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  const b=await r.json();assert.equal(r.status,expected,label+': '+b.message);
  results.push({test:label,status:'PASS',http:r.status});return b.data;
 }
 const e=await call('Create isolated access-policy fixture','employees',admin,201,'POST',{fullName:'Kiểm thử quyền truy cập',position:'Nhân viên',phone:'0900000000',email:'test@example.invalid'});
 const account=await call('Create fixture staff account','week5/employees/'+e.EmployeeId+'/account',admin,201,'POST',{username:'policy_'+Date.now(),password:require('crypto').randomBytes(16).toString('hex')});
 const staff=sign(Number(account.userId),'Nhân viên');
 await call('Admin can read full employee records','employees',admin,200);
 await call('Staff cannot read colleagues contact records','employees',staff,403);
 await call('JWT Admin claim cannot elevate DB staff','employees',sign(Number(account.userId),'Admin'),403);
 const catalog=await call('Staff retains safe roster directory','week5/jobs',staff,200);
 assert(catalog.employees.every(r=>!('Phone' in r)&&!('Email' in r)));
 results.push({test:'Roster directory excludes phone and email',status:'PASS'});
 await pool.request().input('id',account.userId).query('UPDATE AppUsers SET IsActive=0 WHERE UserId=@id');
 await call('Revoked account old JWT rejected on legacy route','shifts',staff,403);
 await pool.request().input('id',account.userId).query('UPDATE AppUsers SET IsActive=1 WHERE UserId=@id');
 await call('Reactivated account regains permitted route','shifts',staff,200);
 await pool.request().input('id',e.EmployeeId).query('UPDATE Employees SET IsActive=0 WHERE EmployeeId=@id');
 await call('Inactive employee old JWT rejected','shifts',staff,403);
 await pool.request().input('id',e.EmployeeId).query('UPDATE Employees SET IsActive=1 WHERE EmployeeId=@id');
 const prior=(await pool.request().input('id',account.userId).query('SELECT RoleId FROM AppUsers WHERE UserId=@id')).recordset[0].RoleId;
 try{
  await pool.request().input('id',account.userId).input('role',actors.RoleId).query('UPDATE AppUsers SET RoleId=@role WHERE UserId=@id');
  await call('Database role changes override stale JWT role','employees',staff,200);
 }finally{await pool.request().input('id',account.userId).input('role',prior).query('UPDATE AppUsers SET RoleId=@role WHERE UserId=@id');}
 await call('Restored staff role loses Admin access immediately','employees',staff,403);
 await call('Nonexistent identity rejected','shifts',sign(2147483647,'Admin'),403);
 await call('Malformed identity rejected','shifts',sign(String(account.userId),'Admin'),403);
 await pool.request().input('id',e.EmployeeId).query('UPDATE Employees SET IsActive=0 WHERE EmployeeId=@id');
 fs.mkdirSync('test-results',{recursive:true});
 fs.writeFileSync('test-results/access-policy-integration.json',JSON.stringify({testedAt:new Date().toISOString(),database:'GymYogaHRM_Week5_Test',total:results.length,results},null,2));
 console.log(results.length+' access policy API/SQL checks PASS');
}
run().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(async()=>{if(server)await new Promise(r=>server.close(r));const p=await poolPromise.catch(()=>null);if(p)await p.close();});
