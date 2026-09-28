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
        OUTPUT INSERTED.ShiftId, INSERTED.ShiftCode, INSERTED.ShiftName
        VALUES (@shiftCode, @shiftName, @startTime, @endTime)
      `);

    res.status(201).json({
      message: "Tạo ca làm thành công",
      data: result.recordset[0]
    });
  } catch (error) {
    res.status(500).json({
      message: "Không thể tạo ca làm",
      error: error.message
    });
  }
};

const updateShift = async (req, res) => {
  try {
    const shiftId = Number(req.params.id);
    const { shiftCode, shiftName, startTime, endTime } = req.body;

    if (!shiftId || !shiftCode || !shiftName || !startTime || !endTime) {
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
      .input("shiftId", sql.Int, shiftId)
      .input("shiftCode", sql.NVarChar, shiftCode)
      .input("shiftName", sql.NVarChar, shiftName)
      .input("startTime", sql.Time, startTime)
      .input("endTime", sql.Time, endTime)
      .query(`
        UPDATE Shifts
        SET ShiftCode = @shiftCode,
            ShiftName = @shiftName,
            StartTime = @startTime,
            EndTime = @endTime
        WHERE ShiftId = @shiftId
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        message: "Không tìm thấy ca làm"
      });
    }

    res.json({ message: "Cập nhật ca làm thành công" });
  } catch (error) {
    res.status(500).json({
      message: "Không thể cập nhật ca làm",
      error: error.message
    });
  }
};

const updateShiftStatus = async (req, res) => {
  try {
    const shiftId = Number(req.params.id);
    const { isActive } = req.body;

    if (!shiftId || typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "Mã ca và trạng thái true/false là bắt buộc"
      });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input("shiftId", sql.Int, shiftId)
      .input("isActive", sql.Bit, isActive)
      .query(`
        UPDATE Shifts
        SET IsActive = @isActive
        WHERE ShiftId = @shiftId
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        message: "Không tìm thấy ca làm"
      });
    }

    res.json({
      message: isActive ? "Đã kích hoạt ca làm" : "Đã ngừng áp dụng ca làm"
    });
  } catch (error) {
    res.status(500).json({
      message: "Không thể cập nhật trạng thái ca làm",
      error: error.message
    });
  }
};

module.exports = {
  getShifts,
  createShift,
  updateShift,
  updateShiftStatus
};