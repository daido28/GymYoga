const express = require("express");
const router = express.Router();

const {
  createFirstAdmin,
  login
} = require("../controllers/authController");

const { authenticateToken } = require("../middlewares/authMiddleware");

router.post("/seed-admin", createFirstAdmin);
router.post("/login", login);

router.get("/me", authenticateToken, (req, res) => {
  res.json({
    message: "Token hợp lệ",
    user: req.user
  });
});

module.exports = router;