const { z } = require("zod");
const { supabase } = require("../config/db");
const AppError = require("../utils/AppError");
const stripe = require("../config/stripe");
const env = require("../config/env");

const eventSchema = z.object({
  title: z.string().min(2),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Event date must be YYYY-MM-DD"),
  description: z.string().max(2000).optional(),
  link: z.string().url().optional()
});

const createCharitySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  image: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  events: z.array(eventSchema).optional(),
  spotlight: z.boolean().optional(),
  isSpotlight: z.boolean().optional()
});

const updateCharitySchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  image: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  events: z.array(eventSchema).optional(),
  spotlight: z.boolean().optional(),
  isSpotlight: z.boolean().optional()
});

const selectCharitySchema = z.object({
  charityId: z.string().uuid(),
  charityPercentage: z.number().min(10).max(100).optional()
});

const independentDonationSchema = z.object({
  amount: z.number().positive(),
  note: z.string().max(500).optional()
});

function normalizeFrontendUrl(url) {
  if (!url) return "http://localhost:5173";
  return String(url).trim().replace(/\/+$/, "");
}

async function createDonationCheckout(req, res, next) {
  try {
    const { amount, note } = independentDonationSchema.parse(req.body);
    const { data: charity } = await supabase
      .from("charities")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();

    if (!charity) throw new AppError("Charity not found", 404);

    const baseUrl = normalizeFrontendUrl(env.frontendUrl);

    // ── STRIPE BYPASS: directly complete the donation ──
    const bypassSessionId = `bypass_donation_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const { data: donation, error } = await supabase
      .from("donations")
      .insert([{
        user_id: req.user.id,
        charity_id: charity.id,
        amount,
        status: "completed",
        source: "independent",
        stripe_session_id: bypassSessionId
      }])
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    // Increment charity total_donations
    const newTotal = Number((Number(charity.total_donations || 0) + amount).toFixed(2));
    await supabase
      .from("charities")
      .update({ total_donations: newTotal })
      .eq("id", charity.id);

    const successUrl = `${baseUrl}/charities/${charity.id}?donation=success`;

    res.status(201).json({ donation, checkoutUrl: successUrl, sessionId: bypassSessionId });
  } catch (error) {
    next(error);
  }
}

async function listCharities(req, res, next) {
  try {
    const q = (req.query.q || "").trim();
    const spotlight = req.query.spotlight;

    let query = supabase.from("charities").select("*").order("created_at", { ascending: false });

    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }
    if (spotlight === "true") {
      query = query.eq("is_spotlight", true);
    }

    const { data: charities, error } = await query;
    if (error) throw new AppError(error.message, 500);

    res.status(200).json({ charities });
  } catch (error) {
    next(error);
  }
}

async function getCharity(req, res, next) {
  try {
    const { data: charity, error } = await supabase
      .from("charities")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();

    if (error || !charity) throw new AppError("Charity not found", 404);
    res.status(200).json({ charity });
  } catch (error) {
    next(error);
  }
}

async function createCharity(req, res, next) {
  try {
    const payload = createCharitySchema.parse(req.body);
    const isSpotlight = payload.isSpotlight ?? payload.spotlight ?? false;
    const charityData = {
      name: payload.name,
      description: payload.description,
      image: payload.image,
      images: payload.images || [],
      events: payload.events || [],
      is_spotlight: isSpotlight
    };
    
    const { data: charity, error } = await supabase
      .from("charities")
      .insert([charityData])
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    res.status(201).json({ charity });
  } catch (error) {
    next(error);
  }
}

async function selectCharity(req, res, next) {
  try {
    const { charityId, charityPercentage } = selectCharitySchema.parse(req.body);
    
    const { data: charity } = await supabase
      .from("charities")
      .select("id")
      .eq("id", charityId)
      .maybeSingle();

    if (!charity) {
      throw new AppError("Charity not found", 404);
    }

    const { error } = await supabase
      .from("users")
      .update({
        charity_id: charity.id,
        charity_percentage: charityPercentage || 10
      })
      .eq("id", req.user.id);

    if (error) throw new AppError(error.message, 500);

    res.status(200).json({ message: "Charity preference updated" });
  } catch (error) {
    next(error);
  }
}

async function updateCharity(req, res, next) {
  try {
    const payload = updateCharitySchema.parse(req.body);
    const updates = {};
    if (payload.name) updates.name = payload.name;
    if (payload.description !== undefined) updates.description = payload.description;
    if (payload.image !== undefined) updates.image = payload.image;
    if (payload.images !== undefined) updates.images = payload.images;
    if (payload.events !== undefined) updates.events = payload.events;
    if (payload.isSpotlight !== undefined || payload.spotlight !== undefined) {
      updates.is_spotlight = payload.isSpotlight ?? payload.spotlight ?? false;
    }

    const { data: charity, error } = await supabase
      .from("charities")
      .update(updates)
      .eq("id", req.params.id)
      .select()
      .maybeSingle();

    if (error || !charity) throw new AppError("Charity not found", 404);

    res.status(200).json({ charity });
  } catch (error) {
    next(error);
  }
}

async function deleteCharity(req, res, next) {
  try {
    const { data: charity, error } = await supabase
      .from("charities")
      .delete()
      .eq("id", req.params.id)
      .select()
      .maybeSingle();

    if (error || !charity) throw new AppError("Charity not found", 404);

    res.status(200).json({ message: "Charity deleted" });
  } catch (error) {
    next(error);
  }
}

async function donateToCharity(req, res, next) {
  try {
    const { amount, note } = independentDonationSchema.parse(req.body);
    const { data: charity } = await supabase
      .from("charities")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();

    if (!charity) throw new AppError("Charity not found", 404);

    const donationData = {
      user_id: req.user.id,
      charity_id: charity.id,
      amount,
      source: "independent"
    };

    const { data: donation, error } = await supabase
      .from("donations")
      .insert([donationData])
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    // Increment charity total_donations
    const newTotal = Number((Number(charity.total_donations || 0) + amount).toFixed(2));
    await supabase
      .from("charities")
      .update({ total_donations: newTotal })
      .eq("id", charity.id);

    res.status(201).json({ donation });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listCharities,
  getCharity,
  createCharity,
  selectCharity,
  updateCharity,
  deleteCharity,
  donateToCharity,
  createDonationCheckout
};
