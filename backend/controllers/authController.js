const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { z } = require("zod");

const { supabase } = require("../config/db");
const env = require("../config/env");
const AppError = require("../utils/AppError");
const { sendEmail } = require("../utils/emailService");
const { welcomeEmail } = require("../utils/emailTemplates");
const { resolveActiveSubscription } = require("../utils/subscriptionStatus");

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  charityId: z.string().uuid().optional(),
  charityPercentage: z.number().min(10).max(100).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

function signToken(userId) {
  return jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

async function register(req, res, next) {
  try {
    const payload = registerSchema.parse(req.body);
    
    // Check if email already registered
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", payload.email)
      .single();

    if (existingUser) {
      throw new AppError("Email already registered", 409);
    }

    const userData = {
      name: payload.name,
      email: payload.email,
    };

    // Hash the password since Mongoose pre-save hook is gone
    userData.password = await bcrypt.hash(payload.password, 10);

    // If charityId provided, verify it exists
    if (payload.charityId) {
      const { data: charity } = await supabase
        .from("charities")
        .select("id")
        .eq("id", payload.charityId)
        .single();
        
      if (!charity) {
        throw new AppError("Charity not found", 404);
      }
      userData.charity_id = charity.id;
      userData.charity_percentage = payload.charityPercentage || 10;
    }

    // Insert user into Supabase
    const { data: user, error: insertError } = await supabase
      .from("users")
      .insert([userData])
      .select("id, name, email, role")
      .single();

    if (insertError) {
      throw new AppError("Error creating user: " + insertError.message, 500);
    }

    const token = signToken(user.id);

    sendEmail({
      to: user.email,
      subject: "Welcome to Golf Platform",
      html: welcomeEmail(user.name)
    }).catch(() => undefined);

    res.status(201).json({
      token,
      user
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const payload = loginSchema.parse(req.body);
    
    // Fetch user by email
    const { data: user } = await supabase
      .from("users")
      .select("id, name, email, password, role, subscription_status")
      .eq("email", payload.email)
      .single();

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    // Compare passwords
    const valid = await bcrypt.compare(payload.password, user.password);
    if (!valid) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = signToken(user.id);

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription_status
      }
    });
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const { data: row, error } = await supabase
      .from("users")
      .select("id, name, email, role, subscription_status, charity_percentage, charities ( id, name, image, description )")
      .eq("id", req.user.id)
      .single();

    if (error || !row) {
      throw new AppError("User not found", 404);
    }

    const activeSubscription = await resolveActiveSubscription(req.user.id);

    const user = {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      subscriptionStatus: row.subscription_status,
      subscriptionPlan: activeSubscription?.plan || null,
      renewalDate: activeSubscription?.expiry_date || null,
      charityPercentage: row.charity_percentage,
      charity: row.charities ?? null
    };

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  me
};
