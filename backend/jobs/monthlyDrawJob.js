const cron = require("node-cron");

const { supabase } = require("../config/db");
const { generateUniqueNumbers, generateAlgorithmNumbers } = require("../utils/drawEngine");
const { getMonthKey } = require("../controllers/drawController");
const env = require("../config/env");

async function ensureMonthlyDraftDraw({ type = "random" } = {}) {
  const month = getMonthKey();

  const { data: existing } = await supabase
    .from("draws")
    .select("id, status")
    .eq("month", month)
    .maybeSingle();

  if (existing) {
    return { created: false, drawId: existing.id, month };
  }

  const numbers = type === "algorithm"
    ? await generateAlgorithmNumbers()
    : generateUniqueNumbers(5, 1, 45);

  const { data: draw, error } = await supabase
    .from("draws")
    .insert([{
      month,
      type,
      status: "pending",
      winning_numbers: numbers
    }])
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  return { created: true, drawId: draw.id, month };
}

function startMonthlyDrawJob() {
  const enabled = String(process.env.ENABLE_MONTHLY_JOB || "").toLowerCase() === "true";
  if (!enabled) return;

  const jobType = (process.env.MONTHLY_JOB_DRAW_TYPE || "random").toLowerCase();
  const drawType = jobType === "algorithm" ? "algorithm" : "random";

  cron.schedule("0 0 1 * *", async () => {
    try {
      const result = await ensureMonthlyDraftDraw({ type: drawType });
      if (env.nodeEnv !== "production") {
        console.log(`[monthlyDrawJob] month=${result.month} created=${result.created}`);
      }
    } catch (error) {
      console.error("[monthlyDrawJob] failed", error.message);
    }
  });
}

module.exports = {
  startMonthlyDrawJob,
  ensureMonthlyDraftDraw
};

