const express = require("express");
const router = express.Router();

const {
  getSchedules,
  assignSchedule
} = require("../controllers/scheduleController");

const {
  authenticateToken,
  authorizeRoles
} = require("../middlewares/authMiddleware");

router.get("/", authenticateToken, getSchedules);

router.post(
  "/",
  authenticateToken,
  authorizeRoles("Admin"),
  assignSchedule
);

module.exports = router;