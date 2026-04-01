const express = require("express");

const { listWinners, uploadProof, reviewWinner } = require("../controllers/winnerController");
const { protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/adminMiddleware");
const { uploadProofImage } = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.get("/", protect, listWinners);
router.post("/proof", protect, uploadProofImage, uploadProof);
router.patch("/:id/status", protect, adminOnly, reviewWinner);

module.exports = router;
