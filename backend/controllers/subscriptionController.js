const { z } = require("zod");
const stripe = require("../config/stripe");
const env = require("../config/env");
const { supabase } = require("../config/db");
const AppError = require("../utils/AppError");
const { sendEmail } = require("../utils/emailService");
const { subscriptionActivatedEmail, subscriptionRenewedEmail } = require("../utils/emailTemplates");
const { syncUserSubscriptionStatus } = require("../utils/subscriptionStatus");

const subscribeSchema = z.object({
  plan: z.enum(["monthly", "yearly"])
});

function getPlanAmount(plan) {
  return plan === "monthly" ? env.monthlyPrice : env.yearlyPrice;
}

function getExpiry(plan) {
  const now = new Date();
  if (plan === "monthly") {
    now.setMonth(now.getMonth() + 1);
  } else {
    now.setFullYear(now.getFullYear() + 1);
  }
  return now.toISOString();
}

function normalizeFrontendUrl(url) {
  if (!url) return "http://localhost:5173";
  return String(url).trim().replace(/\/+$/, "");
}

function getPriceId(plan) {
  return plan === "monthly" ? env.monthlyPriceId : env.yearlyPriceId;
}

async function fetchStripeSubscription(stripeSubscriptionId) {
  if (!stripe || !stripeSubscriptionId) return null;
  return stripe.subscriptions.retrieve(stripeSubscriptionId);
}

function stripeSubToDbStatus(stripeStatus) {
  if (stripeStatus === "active" || stripeStatus === "trialing") return "active";
  if (stripeStatus === "canceled" || stripeStatus === "unpaid") return "canceled";
  if (stripeStatus === "past_due" || stripeStatus === "incomplete" || stripeStatus === "incomplete_expired") return "payment_failed";
  return "created";
}

async function createCheckoutSession(req, res, next) {
  try {
    const { plan } = subscribeSchema.parse(req.body);

    const { data: user } = await supabase.from("users").select("*").eq("id", req.user.id).single();
    const amount = getPlanAmount(plan);

    const charityPercent = user.charity_percentage || 10;
    const charityAmount = Number(((amount * charityPercent) / 100).toFixed(2));

    const baseUrl = normalizeFrontendUrl(env.frontendUrl);

    // ── STRIPE BYPASS: directly activate the subscription ──
    const bypassSessionId = `bypass_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const { data: subscription, error: subError } = await supabase.from("subscriptions").insert([{
      user_id: user.id,
      plan,
      stripe_session_id: bypassSessionId,
      status: "active",
      amount,
      expiry_date: getExpiry(plan),
      charity_amount: charityAmount
    }]).select().single();

    if (subError) throw new AppError(subError.message, 500);

    // Update user subscription status
    await supabase.from("users").update({
      subscription_status: "active",
      subscription_id: subscription.id
    }).eq("id", user.id);

    // Credit charity if user has one selected
    if (user.charity_id) {
      const { data: charity } = await supabase
        .from("charities")
        .select("total_donations")
        .eq("id", user.charity_id)
        .single();
      const newTotal = Number(charity?.total_donations || 0) + Number(charityAmount || 0);
      await supabase.from("charities").update({ total_donations: newTotal }).eq("id", user.charity_id);
    }

    // Send activation email (fire-and-forget)
    sendEmail({
      to: user.email,
      subject: "Subscription Activated",
      html: subscriptionActivatedEmail()
    }).catch(() => undefined);

    const successUrl = `${baseUrl}/subscription/return?session_id=${bypassSessionId}`;

    res.status(200).json({
      sessionId: bypassSessionId,
      amount,
      checkoutUrl: successUrl
    });
  } catch (error) {
    next(error);
  }
}

async function handleWebhook(req, res, next) {
  try {
    if (!stripe) throw new AppError("Stripe is not configured", 500);

    const signature = req.headers["stripe-signature"];
    let event;

    if (env.stripeWebhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, signature, env.stripeWebhookSecret);
    } else {
      if (env.nodeEnv === "production") {
        throw new AppError("Stripe webhook secret not configured", 500);
      }
      event = JSON.parse(req.body.toString());
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const sessionMode = session.mode;
      const sessionType = session.metadata?.type;

      if (sessionMode === "subscription" && sessionType === "subscription") {
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("stripe_session_id", session.id)
          .maybeSingle();

        if (!subscription) return res.status(200).json({ received: true });

        const stripeSubscriptionId = session.subscription;
        const stripeCustomerId = session.customer;
        const stripeSub = await fetchStripeSubscription(stripeSubscriptionId);

        const expiryDate = stripeSub?.current_period_end
          ? new Date(stripeSub.current_period_end * 1000).toISOString()
          : subscription.expiry_date;

        await supabase.from("subscriptions").update({
          status: "active",
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
          current_period_end: stripeSub?.current_period_end ? new Date(stripeSub.current_period_end * 1000).toISOString() : null,
          cancel_at_period_end: stripeSub?.cancel_at_period_end ?? false,
          expiry_date: expiryDate
        }).eq("id", subscription.id);

        const { data: user } = await supabase.from("users").select("*").eq("id", subscription.user_id).single();

        if (user) {
          await supabase.from("users").update({
            subscription_status: "active",
            subscription_id: subscription.id
          }).eq("id", user.id);

          if (user.charity_id) {
            const { data: charity } = await supabase
              .from("charities")
              .select("total_donations")
              .eq("id", user.charity_id)
              .single();
            const newTotal = Number(charity?.total_donations || 0) + Number(subscription.charity_amount || 0);
            await supabase.from("charities").update({ total_donations: newTotal }).eq("id", user.charity_id);
          }

          sendEmail({
            to: user.email,
            subject: "Subscription Activated",
            html: subscriptionActivatedEmail()
          }).catch(() => undefined);
        }
      }

      if (sessionMode === "payment" && sessionType === "donation") {
        const { data: donation } = await supabase
          .from("donations")
          .select("*")
          .eq("stripe_session_id", session.id)
          .maybeSingle();

        if (donation && donation.status !== "completed") {
          await supabase
            .from("donations")
            .update({
              status: "completed",
              stripe_payment_id: session.payment_intent || null
            })
            .eq("id", donation.id);

          const { data: charity } = await supabase
            .from("charities")
            .select("total_donations")
            .eq("id", donation.charity_id)
            .single();
          const newTotal = Number((Number(charity?.total_donations || 0) + Number(donation.amount || 0)).toFixed(2));
          await supabase
            .from("charities")
            .update({ total_donations: newTotal })
            .eq("id", donation.charity_id);
        }
      }
    }

    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object;
      const stripeSubscriptionId = invoice.subscription;

      if (stripeSubscriptionId) {
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("stripe_subscription_id", stripeSubscriptionId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (subscription) {
          const stripeSub = await fetchStripeSubscription(stripeSubscriptionId);
          const expiryDate = stripeSub?.current_period_end
            ? new Date(stripeSub.current_period_end * 1000).toISOString()
            : subscription.expiry_date;

          await supabase.from("subscriptions").update({
            status: "active",
            current_period_end: stripeSub?.current_period_end ? new Date(stripeSub.current_period_end * 1000).toISOString() : null,
            cancel_at_period_end: stripeSub?.cancel_at_period_end ?? false,
            expiry_date: expiryDate
          }).eq("id", subscription.id);

          const { data: user } = await supabase.from("users").select("*").eq("id", subscription.user_id).single();
          if (user) {
            await syncUserSubscriptionStatus(user);
            sendEmail({
              to: user.email,
              subject: "Subscription Renewed",
              html: subscriptionRenewedEmail(subscription.plan)
            }).catch(() => undefined);
          }
        }
      }
    }

    if (event.type === "customer.subscription.updated") {
      const stripeSub = event.data.object;
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("stripe_subscription_id", stripeSub.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subscription) {
        const expiryDate = stripeSub?.current_period_end
          ? new Date(stripeSub.current_period_end * 1000).toISOString()
          : subscription.expiry_date;

        await supabase.from("subscriptions").update({
          status: stripeSubToDbStatus(stripeSub.status),
          current_period_end: stripeSub?.current_period_end ? new Date(stripeSub.current_period_end * 1000).toISOString() : null,
          cancel_at_period_end: stripeSub?.cancel_at_period_end ?? false,
          expiry_date: expiryDate
        }).eq("id", subscription.id);

        const { data: user } = await supabase.from("users").select("*").eq("id", subscription.user_id).single();
        if (user) {
          await syncUserSubscriptionStatus(user);
        }
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const stripeSub = event.data.object;
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("stripe_subscription_id", stripeSub.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subscription) {
        await supabase.from("subscriptions").update({
          status: "canceled",
          cancel_at_period_end: false
        }).eq("id", subscription.id);

        const { data: user } = await supabase.from("users").select("*").eq("id", subscription.user_id).single();
        if (user) {
          await syncUserSubscriptionStatus(user);
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
}

async function listMySubscriptions(req, res, next) {
  try {
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    res.status(200).json({ subscriptions });
  } catch (error) {
    next(error);
  }
}

async function cancelMySubscription(req, res, next) {
  try {
    const now = new Date().toISOString();
    
    // Find active subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", req.user.id)
      .eq("status", "active")
      .gt("expiry_date", now)
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (!subscription) throw new AppError("No active subscription found", 404);

    if (stripe && subscription.stripe_subscription_id) {
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true
      });
    }

    const { data: updatedSub } = await supabase
      .from("subscriptions")
      .update({ status: "canceled", cancel_at_period_end: true })
      .eq("id", subscription.id)
      .select()
      .single();

    // Keep user active until expiry_date; dashboard logic uses expiry_date.
    await syncUserSubscriptionStatus(req.user);

    res.status(200).json({ message: "Subscription cancellation scheduled", subscription: updatedSub });
  } catch (error) {
    next(error);
  }
}

async function renewMySubscription(req, res, next) {
  try {
    // Renewal is handled through Stripe (new Checkout session or Billing Portal).
    // For simplicity, we create a new Checkout session for the chosen plan.
    req.body = req.body || {};
    const { plan } = subscribeSchema.parse({ plan: req.body.plan || "monthly" });
    return createCheckoutSession(req, res, next);
  } catch (error) {
    next(error);
  }
}

async function adminListSubscriptions(req, res, next) {
  try {
    const status = req.query.status;
    let query = supabase.from("subscriptions").select("*, users ( name, email, subscription_status )").order("created_at", { ascending: false });
    
    if (status) query = query.eq("status", status);

    const { data: subscriptions } = await query;
    res.status(200).json({ subscriptions });
  } catch (error) {
    next(error);
  }
}

const adminUpdateSchema = z.object({
  status: z.enum(["created", "active", "canceled", "expired", "payment_failed"]).optional(),
  expiryDate: z.string().datetime().optional()
});

async function adminUpdateSubscription(req, res, next) {
  try {
    const payload = adminUpdateSchema.parse(req.body);
    const { data: subscription } = await supabase.from("subscriptions").select("*").eq("id", req.params.id).maybeSingle();

    if (!subscription) throw new AppError("Subscription not found", 404);

    const updates = {};
    if (payload.status) updates.status = payload.status;
    if (payload.expiryDate) updates.expiry_date = new Date(payload.expiryDate).toISOString();

    const { data: updatedSub } = await supabase.from("subscriptions").update(updates).eq("id", subscription.id).select().single();

    const { data: user } = await supabase.from("users").select("*").eq("id", subscription.user_id).single();
    if (user) {
      await syncUserSubscriptionStatus(user);
    }

    res.status(200).json({ subscription: updatedSub });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createCheckoutSession,
  handleWebhook,
  listMySubscriptions,
  cancelMySubscription,
  renewMySubscription,
  adminListSubscriptions,
  adminUpdateSubscription
};
