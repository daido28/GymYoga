const jwt = require("jsonwebtoken");
const { sql, poolPromise } = require("../config/db");
const branches = require('../services/branchScope');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Bạn chưa gửi token đăng nhập"
    });
  }

  let user;
  try {
    user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(403).json({
      message: "Token không hợp lệ hoặc đã hết hạn"
    });
  }
  if (!Number.isSafeInteger(user.userId) || user.userId <= 0) {
    return res.status(403).json({ message: "Danh tính đăng nhập không hợp lệ" });
  }
  try {
    const pool = await poolPromise;
    const result = await pool.request().input("userId", sql.Int, user.userId).query(`
      SELECT u.UserId, r.RoleName, e.EmployeeId, e.BranchId, e.IsActive AS EmployeeActive
      FROM AppUsers u JOIN Roles r ON r.RoleId = u.RoleId
      LEFT JOIN Employees e ON e.UserId = u.UserId
      WHERE u.UserId = @userId AND u.IsActive = 1
    `);
    const actor = result.recordset[0];
    if (!actor || !["Admin", "Nhân viên", branches.managerRole].includes(actor.RoleName) ||
        (actor.RoleName !== "Admin" && (!actor.EmployeeId || !actor.EmployeeActive))) {
      return res.status(403).json({ message: "Tài khoản hoặc hồ sơ nhân viên không hoạt động" });
    }
    // JWT establishes identity; the database supplies current access rights.
    req.branchId = await branches.resolve(pool, actor, req.headers['x-branch-id']);
    if (!req.branchId) return res.status(403).json({message:'Không có quyền truy cập chi nhánh này'});
    req.user = { ...user, userId: Number(actor.UserId), role: actor.RoleName, branchId:req.branchId, employeeId:actor.EmployeeId?Number(actor.EmployeeId):null };
    const denied=await branches.guard(pool,req);
    if(denied)return res.status(denied.status).json({message:denied.message});
    return next();
  } catch (error) {
    return res.status(503).json({ message: "Không thể xác minh quyền truy cập lúc này" });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role) && !(roles.includes('Admin') && req.user.role===branches.managerRole)) {
      return res.status(403).json({
        message: "Bạn không có quyền thực hiện chức năng này"
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};
