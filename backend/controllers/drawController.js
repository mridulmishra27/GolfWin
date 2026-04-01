const { z } = require("zod");
const { supabase } = require("../config/db");
const env = require("../config/env");

const { generateAlgorithmNumbers, generateUniqueNumbers, matchCount } = require("../utils/drawEngine");
const { calculatePrizes } = require("../utils/prizeCalculator");
const { sendEmail } = require("../utils/emailService");
const { winnerAlertEmail, drawResultsEmail } = require("../utils/emailTemplates");
const AppError = require("../utils/AppError");

const monthSchema = z.string().regex(/^\d{4}-\d{2}$/, "month must be YYYY-MM").optional();

const createDraftSchema = z.object({
  type: z.enum(["random", "algorithm"]).default("random"),
  month: monthSchema,
});

const runDrawSchema = z.object({
  type: z.enum(["random", "algorithm"]).default("random"),
  month: monthSchema,
});

function getMonthKey(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getActiveSubscriptionFee() {
  return Number(env.monthlyPrice || 0);
}

function groupWinnersByMatchType(winners) {
  return winners.reduce(
    (acc, winner) => {
      acc[winner.matchType] = (acc[winner.matchType] || 0) + 1;
      return acc;
    },
    { "3": 0, "4": 0, "5": 0 }
  );
}

async function resolveDrawParticipants() {
  const now = new Date().toISOString();

  // Find all active subscriptions
  const { data: activeSubscriptions } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("status", "active")
    .gt("expiry_date", now);

  const subscriberIds = [...new Set((activeSubscriptions || []).map((sub) => sub.user_id))];

  if (subscriberIds.length === 0) {
    return { subscriberCount: 0, eligibleUsers: [] };
  }

  // Iterate to find eligible users (those with >= 5 scores)
  const eligibleUserIds = [];
  for (const userId of subscriberIds) {
    const { count } = await supabase
      .from("scores")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
      
    if (count && count >= 5) {
      eligibleUserIds.push(userId);
    }
  }

  if (eligibleUserIds.length === 0) {
     return { subscriberCount: subscriberIds.length, eligibleUsers: [] };
  }

  const { data: users } = await supabase
    .from("users")
    .select("id, email, name")
    .in("id", eligibleUserIds);

  return {
    subscriberCount: subscriberIds.length,
    eligibleUsers: users || []
  };
}

async function buildDrawComputation(draw) {
  // Find last published draw to get carry forward amount
  const { data: lastPublishedDraw } = await supabase
    .from("draws")
    .select("breakdown")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const carryIn = lastPublishedDraw && lastPublishedDraw.breakdown ? Number(lastPublishedDraw.breakdown.carryOut || 0) : 0;

  const { subscriberCount, eligibleUsers } = await resolveDrawParticipants();
  const subscriptionFee = getActiveSubscriptionFee();
  const basePool = Number((subscriberCount * subscriptionFee).toFixed(2));

  const winnerDocs = [];
  for (const user of eligibleUsers) {
    const { data: scores } = await supabase
      .from("scores")
      .select("score")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5);

    const userScores = (scores || []).map((item) => item.score);
    const matches = matchCount(userScores, draw.winning_numbers || draw.numbers);

    if (matches >= 3) {
      winnerDocs.push({
        user_id: user.id,
        draw_id: draw.id,
        matchType: String(matches)
      });
    }
  }

  const groupedWinners = groupWinnersByMatchType(winnerDocs);
  const prizes = calculatePrizes({
    basePool,
    carryIn,
    winnerGroups: groupedWinners
  });

  const prizeAssignedWinners = winnerDocs.map((winner) => ({
    user_id: winner.user_id,
    draw_id: winner.draw_id,
    match_type: `${winner.matchType}-number`,
    prize_amount: prizes[winner.matchType] || 0,
    status: "pending"
  }));

  return {
    subscriptionFee,
    subscriberCount,
    participantCount: eligibleUsers.length,
    basePool,
    totalPool: Number((basePool + carryIn).toFixed(2)),
    carryIn,
    carryOut: prizes.carryOut,
    groupedWinners,
    winners: prizeAssignedWinners,
    participants: eligibleUsers,
    prizeBreakdown: {
      "3": prizes["3"],
      "4": prizes["4"],
      "5": prizes["5"],
      "carryOut": prizes.carryOut
    }
  };
}

async function createDraft(req, res, next) {
  try {
    const { type, month } = createDraftSchema.parse(req.body || {});
    const targetMonth = month || getMonthKey();

    const { data: existing } = await supabase
      .from("draws")
      .select("id")
      .eq("month", targetMonth)
      .maybeSingle();

    if (existing) {
      throw new AppError("Draw for this month already exists", 409);
    }

    const numbers = type === "algorithm" ? await generateAlgorithmNumbers() : generateUniqueNumbers(5, 1, 45);

    const { data: draw, error } = await supabase
      .from("draws")
      .insert([{
        winning_numbers: numbers,
        type,
        month: targetMonth,
        status: "pending" // represents draft
      }])
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    res.status(201).json({ draw });
  } catch (error) {
    next(error);
  }
}

async function simulateDraft(req, res, next) {
  try {
    const { data: draw } = await supabase
      .from("draws")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();

    if (!draw) throw new AppError("Draw not found", 404);

    if (draw.status !== "pending" && draw.status !== "simulated") {
      throw new AppError("Only pending/simulated draws can be simulated", 400);
    }

    const simulation = await buildDrawComputation(draw);
    
    // Update draw status to simulated
    await supabase.from("draws").update({ status: "simulated" }).eq("id", draw.id);

    res.status(200).json({
      draw: {
        id: draw.id,
        month: draw.month,
        numbers: draw.winning_numbers,
        type: draw.type,
        status: "simulated"
      },
      simulation
    });
  } catch (error) {
    next(error);
  }
}

async function publishDraft(req, res, next) {
  try {
    const { data: draw } = await supabase
      .from("draws")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();

    if (!draw) throw new AppError("Draw not found", 404);

    if (draw.status === "published") {
      throw new AppError("Draw is already published", 409);
    }

    const result = await buildDrawComputation(draw);

    if (result.winners.length > 0) {
      await supabase.from("winners").insert(result.winners);
    }

    if (result.participants?.length) {
      const entries = result.participants.map((p) => ({ draw_id: draw.id, user_id: p.id }));
      // Unique(draw_id,user_id) prevents duplicates. We upsert to be safe on retries.
      await supabase.from("draw_entries").upsert(entries, { onConflict: "draw_id,user_id" });
    }

    const { data: updatedDraw, error } = await supabase
      .from("draws")
      .update({
        status: "published",
        total_pool: result.totalPool,
        participants_count: result.participantCount,
        breakdown: {
          subscriptionFee: result.subscriptionFee,
          subscriberCount: result.subscriberCount,
          basePool: result.basePool,
          carryOut: result.carryOut,
          prizes: result.prizeBreakdown
        }
      })
      .eq("id", draw.id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    const winnerIds = result.winners.map((winner) => winner.user_id);

    result.participants.forEach((user) => {
      const isWinner = winnerIds.includes(user.id);
      sendEmail({
        to: user.email,
        subject: isWinner ? "Winner Alert" : "Monthly Draw Results",
        html: isWinner ? winnerAlertEmail(user.name, draw.month) : drawResultsEmail(user.name, draw.month)
      }).catch(() => undefined);
    });

    res.status(200).json({
      draw: updatedDraw,
      summary: {
        participants: result.participantCount,
        winners: result.groupedWinners,
        carryForward: result.carryOut
      }
    });
  } catch (error) {
    next(error);
  }
}

async function runDraw(req, res, next) {
  try {
    const { type, month } = runDrawSchema.parse(req.body || {});
    const targetMonth = month || getMonthKey();

    let { data: draw } = await supabase
      .from("draws")
      .select("*")
      .eq("month", targetMonth)
      .maybeSingle();

    if (draw && draw.status === "published") {
      throw new AppError("Draw for this month already published", 409);
    }

    if (!draw) {
      const numbers = type === "algorithm" ? await generateAlgorithmNumbers() : generateUniqueNumbers(5, 1, 45);

      const { data: newDraw, error } = await supabase
        .from("draws")
        .insert([{
          winning_numbers: numbers,
          type,
          month: targetMonth,
          status: "pending"
        }])
        .select()
        .single();
        
      if (error) throw new AppError(error.message, 500);
      draw = newDraw;
    }

    req.params.id = draw.id;
    await publishDraft(req, res, next);
  } catch (error) {
    next(error);
  }
}

async function latestDraw(req, res, next) {
  try {
    const { data: draw } = await supabase
      .from("draws")
      .select("*")
      .eq("status", "published")
      .order("month", { ascending: false })
      .limit(1)
      .maybeSingle();

    res.status(200).json({ draw: draw || null });
  } catch (error) {
    next(error);
  }
}

async function listDrawHistory(req, res, next) {
  try {
    const { data: draws } = await supabase
      .from("draws")
      .select("*")
      .eq("status", "published")
      .order("month", { ascending: false })
      .order("created_at", { ascending: false });

    res.status(200).json({ draws });
  } catch (error) {
    next(error);
  }
}

async function currentDraw(req, res, next) {
  try {
    const month = getMonthKey();
    const { data: draw } = await supabase
      .from("draws")
      .select("*")
      .eq("month", month)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    res.status(200).json({ draw: draw || null });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  runDraw,
  createDraft,
  simulateDraft,
  publishDraft,
  latestDraw,
  currentDraw,
  listDrawHistory,
  getMonthKey
};
