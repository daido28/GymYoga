const { sql, poolPromise } = require("../config/db");

const getSchedules = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        ws.ScheduleId,
        ws.WorkDate,
        ws.Status,
        ws.Note,
        e.EmployeeId,
        e.FullName,
        s.ShiftId,
        s.ShiftCode,
        s.ShiftName,
        s.StartTime,
        s.EndTime
      FROM WorkSchedules ws
      INNER JOIN Employees e ON ws.EmployeeId = e.EmployeeId
      INNER JOIN Shifts s ON ws.ShiftId = s.ShiftId
      ORDER BY ws.WorkDate DESC, s.StartTime
    `);

    res.json({
      message: "Lấy lịch phân công thành công",
      data: result.recordset
    });
  } catch (error) {
    res.status(500).json({
      message: "Không thể lấy lịch phân công",
      error: error.message
    });
  }
};

const assignSchedule = async (req, res) => {
  try {
    const { employeeId, shiftId, workDate, note } = req.body;

    if (!employeeId || !shiftId || !workDate) {
      return res.status(400).json({
        message: "Nhân viên, ca làm và ngày làm là bắt buộc"
      });
    }

    const pool = await poolPromise;

    const employeeResult = await pool.request()
      .input("employeeId", sql.Int, employeeId)
      .query(`
        SELECT EmployeeId, FullName
        FROM Employees
        WHERE EmployeeId = @employeeId AND IsActive = 1
      `);

    if (employeeResult.recordset.length === 0) {
      return res.status(400).json({
        message: "Nhân viên không tồn tại hoặc đang ngừng hoạt động"
      });
    }

    const shiftResult = await pool.request()
      .input("shiftId", sql.Int, shiftId)
      .query(`
        SELECT ShiftId, ShiftName
        FROM Shifts
        WHERE ShiftId = @shiftId AND IsActive = 1
      `);

    if (shiftResult.recordset.length === 0) {
      return res.status(400).json({
        message: "Ca làm không tồn tại hoặc đang ngừng áp dụng"
      });
    }

    const conflictResult = await pool.request()
      .input("employeeId", sql.Int, employeeId)
      .input("shiftId", sql.Int, shiftId)
      .input("workDate", sql.Date, workDate)
      .query(`
        SELECT TOP 1 ws.ScheduleId
        FROM WorkSchedules ws
        INNER JOIN Shifts existingShift ON ws.ShiftId = existingShift.ShiftId
        INNER JOIN Shifts newShift ON newShift.ShiftId = @shiftId
        WHERE ws.EmployeeId = @employeeId
          AND ws.WorkDate = @workDate
          AND newShift.StartTime < existingShift.EndTime
          AND newShift.EndTime > existingShift.StartTime
      `);

    if (conflictResult.recordset.length > 0) {
      return res.status(400).json({
        message: "Nhân viên đã có ca trùng thời gian trong ngày này"
      });
    }

    const result = await pool.request()
      .input("employeeId", sql.Int, employeeId)
      .input("shiftId", sql.Int, shiftId)
      .input("workDate", sql.Date, workDate)
      .input("note", sql.NVarChar, note || null)
      .query(`
        INSERT INTO WorkSchedules (EmployeeId, ShiftId, WorkDate, Note)
        OUTPUT
          INSERTED.ScheduleId,
          INSERTED.EmployeeId,
          INSERTED.ShiftId,
          INSERTED.WorkDate,
          INSERTED.Status
        VALUES (@employeeId, @shiftId, @workDate, @note)
      `);

    res.status(201).json({
      message: "Phân công ca thành công",
      data: result.recordset[0]
    });
  } catch (error) {
    res.status(500).json({
      message: "Không thể phân công ca",
      error: error.message
    });
  }
};

module.exports = {
  getSchedules,
  assignSchedule
};