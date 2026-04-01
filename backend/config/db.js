const { createClient } = require("@supabase/supabase-js");
const env = require("./env");

let supabase = null;

function connectDB() {
  if (supabase) return supabase;

  if (!env.supabaseUrl || !env.supabaseKey) {
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY are required");
  }

  supabase = createClient(env.supabaseUrl, env.supabaseKey);
  console.log("✅ Supabase client initialized");
  return supabase;
}

// Immediately initialize for controllers to import
supabase = connectDB();

module.exports = { supabase, connectDB };