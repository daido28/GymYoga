const { sql, poolPromise } = require("../config/db");

const getEmployees = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        EmployeeId,
        FullName,
        Phone,
        Email,
        Position,
        Specialty,
        IsActive,
        UserId
      FROM Employees
      ORDER BY EmployeeId DESC
    `);

    res.json({
      message: "Lấy danh sách nhân viên thành công",
      data: result.recordset
    });
  } catch (error) {
    res.status(500).json({
      message: "Không thể lấy danh sách nhân viên",
      error: error.message
    });
  }
};

const createEmployee = async (req, res) => {
  try {
    const { fullName, phone, email, position, specialty } = req.body;

    if (!fullName || !position) {
      return res.status(400).json({
        message: "Họ tên và chức vụ là bắt buộc"
      });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input("fullName", sql.NVarChar, fullName)
      .input("phone", sql.NVarChar, phone || null)
      .input("email", sql.NVarChar, email || null)
      .input("position", sql.NVarChar, position)
      .input("specialty", sql.NVarChar, specialty || null)
      .query(`
        INSERT INTO Employees
          (FullName, Phone, Email, Position, Specialty)
        OUTPUT INSERTED.EmployeeId,
               INSERTED.FullName,
               INSERTED.Position
        VALUES
          (@fullName, @phone, @email, @position, @specialty)
      `);

    res.status(201).json({
      message: "Thêm nhân viên thành công",
      data: result.recordset[0]
    });
  } catch (error) {
    console.error("Lỗi createEmployee:", error);

    res.status(500).json({
      message: "Không thể thêm nhân viên",
      error: error.message
    });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const employeeId = Number(req.params.id);
    const { fullName, phone, email, position, specialty } = req.body;

    if (!employeeId || !fullName || !position) {
      return res.status(400).json({
        message: "Mã nhân viên, họ tên và chức vụ là bắt buộc"
      });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input("employeeId", sql.Int, employeeId)
      .input("fullName", sql.NVarChar, fullName)
      .input("phone", sql.NVarChar, phone || null)
      .input("email", sql.NVarChar, email || null)
      .input("position", sql.NVarChar, position)
      .input("specialty", sql.NVarChar, specialty || null)
      .query(`
        UPDATE Employees
        SET FullName = @fullName,
            Phone = @phone,
            Email = @email,
            Position = @position,
            Specialty = @specialty
        WHERE EmployeeId = @employeeId
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        message: "Không tìm thấy nhân viên"
      });
    }

    res.json({ message: "Cập nhật nhân viên thành công" });
  } catch (error) {
    res.status(500).json({
      message: "Không thể cập nhật nhân viên",
      error: error.message
    });
  }
};

const updateEmployeeStatus = async (req, res) => {
  try {
    const employeeId = Number(req.params.id);
    const { isActive } = req.body;

    if (!employeeId || typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "Mã nhân viên và trạng thái true/false là bắt buộc"
      });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input("employeeId", sql.Int, employeeId)
      .input("isActive", sql.Bit, isActive)
      .query(`
        UPDATE Employees
        SET IsActive = @isActive
        WHERE EmployeeId = @employeeId
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        message: "Không tìm thấy nhân viên"
      });
    }

    res.json({
      message: isActive
        ? "Đã kích hoạt nhân viên"
        : "Đã ngừng hoạt động nhân viên"
    });
  } catch (error) {
    res.status(500).json({
      message: "Không thể cập nhật trạng thái",
      error: error.message
    });
  }
};

module.exports = {
  getEmployees,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus
};