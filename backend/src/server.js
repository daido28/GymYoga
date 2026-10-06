require("dotenv").config();
const scheduleRoutes = require("./routes/scheduleRoutes");
const shiftRoutes = require("./routes/shiftRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const express = require("express");
const cors = require("cors");
const { poolPromise } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../../frontend")));

app.get("/", (req, res) => {
  res.json({ message: "GymYogaHRM API đang hoạt động" });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT DB_NAME() AS databaseName");

    res.json({
      message: "Kết nối SQL Server thành công",
      database: result.recordset[0].databaseName
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi kết nối SQL Server",
      error: error.message
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/week5", require("./routes/week5Routes"));
const PORT = process.env.PORT || 3000;

if(require.main===module) app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
module.exports=app;
