const express = require("express");

const {
  createCheckoutSession,
  handleWebhook,
  listMySubscriptions,
  cancelMySubscription,
  renewMySubscription,
  adminListSubscriptions,
  adminUpdateSubscription
} = require("../controllers/subscriptionController");
const { protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/adminMiddleware");

const router = express.Router();

router.post("/", protect, createCheckoutSession);
router.get("/me", protect, listMySubscriptions);
router.post("/cancel", protect, cancelMySubscription);
router.post("/renew", protect, renewMySubscription);
router.get("/admin", protect, adminOnly, adminListSubscriptions);
router.patch("/admin/:id", protect, adminOnly, adminUpdateSubscription);
router.post("/webhook", handleWebhook);

module.exports = router;
