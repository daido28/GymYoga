const sql = require("mssql/msnodesqlv8");

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  connectionTimeout: Number(process.env.DB_CONNECTION_TIMEOUT_MS || 5000),
  requestTimeout: Number(process.env.DB_REQUEST_TIMEOUT_MS || 15000),
  options: {
    trustedConnection: true,
    trustServerCertificate: true
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log(`Đã kết nối SQL Server: ${process.env.DB_DATABASE}`);
    return pool;
  })
  .catch((error) => {
    console.error("Không thể kết nối SQL Server:", error.message);
    throw error;
  });

module.exports = {
  sql,
  poolPromise
};
