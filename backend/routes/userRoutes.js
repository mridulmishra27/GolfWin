const express = require("express");

const {
  getProfile,
  adminAnalytics,
  adminListUsers,
  adminUpdateUser
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/adminMiddleware");

const router = express.Router();

router.get("/profile", protect, getProfile);
router.get("/analytics", protect, adminOnly, adminAnalytics);
router.get("/admin/users", protect, adminOnly, adminListUsers);
router.patch("/admin/users/:id", protect, adminOnly, adminUpdateUser);

module.exports = router;
