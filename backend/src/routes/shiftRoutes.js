const express = require("express");
const router = express.Router();

const {
  getShifts,
  createShift,
  updateShift,
  updateShiftStatus
} = require("../controllers/shiftController");

const {
  authenticateToken,
  authorizeRoles
} = require("../middlewares/authMiddleware");

router.get("/", authenticateToken, getShifts);

router.post(
  "/",
  authenticateToken,
  authorizeRoles("Admin"),
  createShift
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("Admin"),
  updateShift
);

router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRoles("Admin"),
  updateShiftStatus
);

module.exports = router;