const jwt = require("jsonwebtoken");
const { supabase } = require("../config/db");
const env = require("../config/env");
const AppError = require("../utils/AppError");
const { syncUserSubscriptionStatus } = require("../utils/subscriptionStatus");

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Unauthorized", 401);
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, env.jwtSecret);
    
    // Find user using Supabase
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", payload.id)
      .maybeSingle();

    if (error || !user) {
      throw new AppError("User no longer exists", 401);
    }

    await syncUserSubscriptionStatus(user);
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { protect };
