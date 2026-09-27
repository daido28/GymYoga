const sql = require("mssql/msnodesqlv8");

const config = {
  server: "localhost\\SQLEXPRESS01",
  database: "GymYogaHRM",
  options: {
    trustedConnection: true,
    trustServerCertificate: true
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Đã kết nối SQL Server");
    return pool;
  })
  .catch((error) => {
    console.error("Không thể kết nối SQL Server:", error.message);
  });

module.exports = {
  sql,
  poolPromise
};