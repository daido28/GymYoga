const {sql}=require('../config/db');
const {endpoint,query,int,str}=require('./week5Controller').helpers;
const {fail,id}=require('../services/week5Rules');
const list=endpoint(async(req,db)=>{
 const where=req.user.role==='Admin'?'':req.user.role==='Quản lý chi nhánh'?'AND b.BranchId IN(SELECT BranchId FROM UserBranches WHERE UserId=@user)':'AND b.BranchId=@branch';
 const rows=await query(db,`SELECT b.BranchId,b.BranchName FROM Branches b WHERE b.IsActive=1 ${where} ORDER BY b.BranchId`,{user:int(req.user.userId)});
 return {data:{branches:rows.recordset,selectedBranchId:req.branchId,role:req.user.role}};
});
function systemAdmin(req){if(req.user.role!=='Admin')fail(403,'Chỉ Admin hệ thống được quản lý chi nhánh');}
function name(v){if(typeof v!=='string'||!v.trim()||v.trim().length>100)fail(400,'Tên chi nhánh từ 1 đến 100 ký tự');return v.trim();}
const create=endpoint(async(req,db)=>{
 systemAdmin(req);const r=await query(db,'INSERT Branches(BranchName) OUTPUT INSERTED.* VALUES(@name)',{name:str(name(req.body.branchName))});const branch=Number(r.recordset[0].BranchId);
 await query(db,`INSERT JobTypes(JobName,Color,BranchId) VALUES(N'Quầy lễ tân','#2563eb',@newBranch),(N'Vệ sinh phòng tập','#10b981',@newBranch),(N'Bảo vệ / giữ xe','#f59e0b',@newBranch),(N'Huấn luyện viên','#8b5cf6',@newBranch)`,{newBranch:int(branch)});
 return {status:201,message:'Đã tạo chi nhánh',data:r.recordset[0]};
});
const rename=endpoint(async(req,db)=>{systemAdmin(req);const r=await query(db,'UPDATE Branches SET BranchName=@name OUTPUT INSERTED.* WHERE BranchId=@id',{name:str(name(req.body.branchName)),id:int(id(req.params.id))});if(!r.recordset.length)fail(404,'Không tìm thấy chi nhánh');return {data:r.recordset[0]};});
module.exports={list,create,rename};
