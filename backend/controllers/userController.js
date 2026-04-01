const { z } = require("zod");
const { supabase } = require("../config/db");
const AppError = require("../utils/AppError");
const { resolveActiveSubscription } = require("../utils/subscriptionStatus");

const adminUpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(["user", "admin"]).optional(),
  subscriptionStatus: z.enum(["active", "inactive", "expired"]).optional(),
  charityPercentage: z.number().min(10).max(100).optional()
});

async function getProfile(req, res, next) {
  try {
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*, charities ( id, name, image, total_donations )")
      .eq("id", req.user.id)
      .maybeSingle();

    if (userError || !user) throw new AppError("User not found", 404);

    const activeSubscription = await resolveActiveSubscription(req.user.id);

    const [{ count: scoreCount }, { data: upcomingDraws }, { data: winners }, { count: drawsEntered }] = await Promise.all([
      supabase.from("scores").select("*", { count: "exact", head: true }).eq("user_id", req.user.id),
      supabase.from("draws").select("month").in("status", ["pending", "simulated"]).order("month", { ascending: true }).limit(1),
      supabase.from("winners").select("*").eq("user_id", req.user.id).order("created_at", { ascending: false }),
      supabase.from("draw_entries").select("*", { count: "exact", head: true }).eq("user_id", req.user.id)
    ]);

    const totalWon = (winners || []).reduce((sum, w) => sum + Number(w.prize_amount || 0), 0);

    res.status(200).json({
      user,
      dashboard: {
        subscription: {
          status: user.subscription_status,
          plan: activeSubscription?.plan || null,
          renewalDate: activeSubscription?.expiry_date || null
        },
        participation: {
          drawsEntered: drawsEntered || 0,
          upcomingDrawMonth: upcomingDraws && upcomingDraws.length > 0 ? upcomingDraws[0].month : null
        },
        winnings: {
          totalWon,
          currentStatuses: (winners || []).map((w) => w.status)
        },
        scoreCount: scoreCount || 0
      }
    });
  } catch (error) {
    next(error);
  }
}

async function adminAnalytics(req, res, next) {
  try {
    // Perform standard counts and sums using Supabase postgREST filters
    const [
      { count: totalUsers },
      { data: activeSubs },
      { data: charities },
      { data: publishedDraws },
      { count: drawCount },
      { count: pendingWinners }
    ] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("subscriptions").select("amount").eq("status", "active"),
      supabase.from("charities").select("total_donations"),
      supabase.from("draws").select("total_pool").eq("status", "published"),
      supabase.from("draws").select("*", { count: "exact", head: true }),
      supabase.from("winners").select("*", { count: "exact", head: true }).eq("status", "pending")
    ]);

    const totalRevenue = (activeSubs || []).reduce((sum, s) => sum + Number(s.amount || 0), 0);
    const totalCharityFunds = (charities || []).reduce((sum, c) => sum + Number(c.total_donations || 0), 0);
    const totalPrizePool = (publishedDraws || []).reduce((sum, d) => sum + Number(d.total_pool || 0), 0);

    res.status(200).json({
      metrics: {
        totalUsers: totalUsers || 0,
        totalRevenue,
        totalCharityFunds,
        totalPrizePool,
        drawCount: drawCount || 0,
        pendingWinners: pendingWinners || 0
      }
    });
  } catch (error) {
    next(error);
  }
}

async function adminListUsers(req, res, next) {
  try {
    const q = (req.query.q || "").trim();
    
    let query = supabase
      .from("users")
      .select("*, charities(name)")
      .order("created_at", { ascending: false });

    if (q) {
      query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
    }

    const { data: users, error } = await query;
    if (error) throw new AppError(error.message, 500);

    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
}

async function adminUpdateUser(req, res, next) {
  try {
    const payload = adminUpdateUserSchema.parse(req.body);
    const updates = {};
    if (payload.name) updates.name = payload.name;
    if (payload.role) updates.role = payload.role;
    if (payload.subscriptionStatus) updates.subscription_status = payload.subscriptionStatus;
    if (payload.charityPercentage !== undefined) updates.charity_percentage = payload.charityPercentage;

    const { data: user, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", req.params.id)
      .select()
      .maybeSingle();

    if (error || !user) throw new AppError("User not found", 404);

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  adminAnalytics,
  adminListUsers,
  adminUpdateUser
};
