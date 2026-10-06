const express = require("express");
const router = express.Router();

const {
  getSchedules,
  assignSchedule,
  updateSchedule,
  deleteSchedule
} = require("../controllers/scheduleController");
const calendar = require('../controllers/calendarController');

const {
  authenticateToken,
  authorizeRoles
} = require("../middlewares/authMiddleware");

router.get("/", authenticateToken, getSchedules);

router.post(
  "/",
  authenticateToken,
  authorizeRoles("Admin"),
  calendar.assign
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("Admin"),
  calendar.update
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("Admin"),
  calendar.cancel
);

module.exports = router;
