const { sql, poolPromise } = require("../config/db");

const getShifts = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT ShiftId, ShiftCode, ShiftName, StartTime, EndTime, IsActive
      FROM Shifts
      ORDER BY StartTime
    `);

    res.json({
      message: "Lấy danh sách ca làm thành công",
      data: result.recordset
    });
  } catch (error) {
    res.status(500).json({
      message: "Không thể lấy danh sách ca làm",
      error: error.message
    });
  }
};

const createShift = async (req, res) => {
  try {
    const { shiftCode, shiftName, startTime, endTime } = req.body;

    if (!shiftCode || !shiftName || !startTime || !endTime) {
      return res.status(400).json({
        message: "Mã ca, tên ca, giờ bắt đầu và giờ kết thúc là bắt buộc"
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        message: "Giờ kết thúc phải sau giờ bắt đầu"
      });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input("shiftCode", sql.NVarChar, shiftCode)
      .input("shiftName", sql.NVarChar, shiftName)
      .input("startTime", sql.Time, startTime)
      .input("endTime", sql.Time, endTime)
      .query(`
        INSERT INTO Shifts (ShiftCode, ShiftName, StartTime, EndTime)
        OUTPUT INSERTED.ShiftId,
               INSERTED.ShiftCode,
               INSERTED.ShiftName
        VALUES (@shiftCode, @shiftName, @startTime, @endTime)
      `);

    res.status(201).json({
      message: "Tạo ca làm thành công",
      data: result.recordset[0]
    });
  } catch (error) {
    if (error.message.includes("UNIQUE")) {
      return res.status(400).json({
        message: "Mã ca đã tồn tại"
      });
    }

    res.status(500).json({
      message: "Không thể tạo ca làm",
      error: error.message
    });
  }
};

module.exports = {
  getShifts,
  createShift
};