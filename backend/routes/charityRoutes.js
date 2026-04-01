const express = require("express");

const {
  listCharities,
  getCharity,
  createCharity,
  selectCharity,
  updateCharity,
  deleteCharity,
  donateToCharity,
  createDonationCheckout
} = require("../controllers/charityController");
const { protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/adminMiddleware");

const router = express.Router();

router.get("/", listCharities);
router.get("/:id", getCharity);
router.post("/", protect, adminOnly, createCharity);
router.patch("/:id", protect, adminOnly, updateCharity);
router.delete("/:id", protect, adminOnly, deleteCharity);
router.post("/select", protect, selectCharity);
router.post("/:id/donate", protect, donateToCharity);
router.post("/:id/donate/checkout", protect, createDonationCheckout);

module.exports = router;
