const express = require("express");
const { ensureMonthlyDraftDraw } = require("../jobs/monthlyDrawJob");
const env = require("../config/env");

const router = express.Router();

router.get("/monthly-draw", async (req, res) => {
  // Check Vercel Cron Secret (or CRON_SECRET) to prevent unauthorized execution
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const jobType = (process.env.MONTHLY_JOB_DRAW_TYPE || "random").toLowerCase();
    const drawType = jobType === "algorithm" ? "algorithm" : "random";

    const result = await ensureMonthlyDraftDraw({ type: drawType });
    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    console.error("[jobRoutes/monthly-draw] error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

module.exports = router;
