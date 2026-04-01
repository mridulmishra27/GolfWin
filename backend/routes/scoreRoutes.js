const express = require("express");

const { createScore, listScores, updateMyScore, adminUpdateScore } = require("../controllers/scoreController");
const { protect } = require("../middlewares/authMiddleware");
const { checkActiveSubscription } = require("../middlewares/subscriptionMiddleware");
const { adminOnly } = require("../middlewares/adminMiddleware");

const router = express.Router();

router.post("/", protect, checkActiveSubscription, createScore);
router.get("/", protect, listScores);
router.patch("/admin/:id", protect, adminOnly, adminUpdateScore);
router.patch("/:id", protect, checkActiveSubscription, updateMyScore);

module.exports = router;
