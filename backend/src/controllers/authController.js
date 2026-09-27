const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sql, poolPromise } = require("../config/db");

const createFirstAdmin = async (req, res) => {
  try {
    const { username, password, fullName, phone, email } = req.body;

    if (!username || !password || !fullName) {
      return res.status(400).json({
        message: "Username, password và fullName là bắt buộc"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Mật khẩu phải có ít nhất 6 ký tự"
      });
    }

    const pool = await poolPromise;

    const adminCheck = await pool.request().query(`
      SELECT COUNT(*) AS total
      FROM AppUsers u
      INNER JOIN Roles r ON u.RoleId = r.RoleId
      WHERE r.RoleName = N'Admin'
    `);

    if (adminCheck.recordset[0].total > 0) {
      return res.status(400).json({
        message: "Tài khoản Admin đã tồn tại"
      });
    }

    const roleResult = await pool.request()
      .input("roleName", sql.NVarChar, "Admin")
      .query("SELECT RoleId FROM Roles WHERE RoleName = @roleName");

    const adminRoleId = roleResult.recordset[0].RoleId;
    const passwordHash = await bcrypt.hash(password, 10);

    const userResult = await pool.request()
      .input("username", sql.NVarChar, username)
      .input("passwordHash", sql.NVarChar, passwordHash)
      .input("roleId", sql.Int, adminRoleId)
      .query(`
        INSERT INTO AppUsers (Username, PasswordHash, RoleId)
        OUTPUT INSERTED.UserId
        VALUES (@username, @passwordHash, @roleId)
      `);

    const userId = userResult.recordset[0].UserId;

    await pool.request()
      .input("fullName", sql.NVarChar, fullName)
      .input("phone", sql.NVarChar, phone || null)
      .input("email", sql.NVarChar, email || null)
      .input("position", sql.NVarChar, "Quản trị hệ thống")
      .input("specialty", sql.NVarChar, "Quản lý")
      .input("userId", sql.Int, userId)
      .query(`
        INSERT INTO Employees
          (FullName, Phone, Email, Position, Specialty, UserId)
        VALUES
          (@fullName, @phone, @email, @position, @specialty, @userId)
      `);

    res.status(201).json({
      message: "Đã tạo tài khoản Admin thành công",
      username
    });
  } catch (error) {
    res.status(500).json({
      message: "Không thể tạo Admin",
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("username", sql.NVarChar, username)
      .query(`
        SELECT u.UserId, u.Username, u.PasswordHash, u.IsActive,
               r.RoleName, e.FullName
        FROM AppUsers u
        INNER JOIN Roles r ON u.RoleId = r.RoleId
        LEFT JOIN Employees e ON u.UserId = e.UserId
        WHERE u.Username = @username
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
    }

    const user = result.recordset[0];

    if (!user.IsActive) {
      return res.status(403).json({ message: "Tài khoản đã bị khóa" });
    }

    const passwordCorrect = await bcrypt.compare(password, user.PasswordHash);

    if (!passwordCorrect) {
      return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
    }

    const token = jwt.sign(
      {
        userId: user.UserId,
        username: user.Username,
        role: user.RoleName
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        userId: user.UserId,
        username: user.Username,
        fullName: user.FullName,
        role: user.RoleName
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi đăng nhập",
      error: error.message
    });
  }
};

module.exports = {
  createFirstAdmin,
  login
};