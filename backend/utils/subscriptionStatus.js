const { supabase } = require("../config/db");

async function resolveActiveSubscription(userId) {
  const now = new Date().toISOString();
  // We use maybeSingle instead of single so it doesn't error when 0 results
  const { data: activeSubscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("expiry_date", now)
    .order("expiry_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  return activeSubscription;
}

async function syncUserSubscriptionStatus(user) {
  const activeSubscription = await resolveActiveSubscription(user.id);
  
  const { count: prevCount, error } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const nextStatus = activeSubscription ? "active" : (prevCount > 0 ? "expired" : "inactive");

  if (user.subscription_status !== nextStatus) {
    user.subscription_status = nextStatus;
    user.subscription_id = activeSubscription ? activeSubscription.id : null;
    
    await supabase
      .from("users")
      .update({
        subscription_status: nextStatus,
        subscription_id: user.subscription_id
      })
      .eq("id", user.id);
  }

  const now = new Date().toISOString();
  if (!activeSubscription) {
    await supabase
      .from("subscriptions")
      .update({ status: "expired" })
      .eq("user_id", user.id)
      .eq("status", "active")
      .lte("expiry_date", now);
  }

  return activeSubscription;
}

module.exports = {
  resolveActiveSubscription,
  syncUserSubscriptionStatus
};
