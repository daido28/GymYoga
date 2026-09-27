const express = require("express");
const router = express.Router();

const {
  getShifts,
  createShift
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

module.exports = router;