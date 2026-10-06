const express = require("express");
const router = express.Router();

const {
  getEmployees,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus
} = require("../controllers/employeeController");

const {
  authenticateToken,
  authorizeRoles
} = require("../middlewares/authMiddleware");

router.get("/", authenticateToken, authorizeRoles("Admin"), getEmployees);

router.post(
  "/",
  authenticateToken,
  authorizeRoles("Admin"),
  createEmployee
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("Admin"),
  updateEmployee
);

router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRoles("Admin"),
  require('../controllers/jobController').employeeStatus
);

module.exports = router;
