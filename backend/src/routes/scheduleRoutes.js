const express = require("express");
const router = express.Router();

const {
  getSchedules,
  assignSchedule,
  updateSchedule,
  deleteSchedule
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

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("Admin"),
  updateSchedule
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("Admin"),
  deleteSchedule
);

module.exports = router;