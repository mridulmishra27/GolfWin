const dotenv = require("dotenv");

dotenv.config();

const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || "development",
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  monthlyPrice: Number(process.env.MONTHLY_PRICE || 29),
  yearlyPrice: Number(process.env.YEARLY_PRICE || 299),
  monthlyPriceId: process.env.MONTHLY_PRICE_ID,
  yearlyPriceId: process.env.YEARLY_PRICE_ID,
  emailHost: process.env.EMAIL_HOST,
  emailPort: Number(process.env.EMAIL_PORT || 587),
  emailService: process.env.EMAIL_SERVICE || "Gmail",
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
  emailFrom: process.env.EMAIL_FROM || process.env.EMAIL_USER || "no-reply@golfplatform.com",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET
};

module.exports = env;
