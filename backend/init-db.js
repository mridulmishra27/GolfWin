/**
 * Database seed script for Supabase (matches schema.sql / backend stack).
 * Run from backend folder: node init-db.js
 *
 * Set SUPABASE_SERVICE_ROLE_KEY in .env if inserts are blocked by RLS; anon key may be read-only for some tables.
 */

const path = require("path");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY)."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;
const ADMIN_NAME = process.env.SEED_ADMIN_NAME;

const charities = [
  {
    name: "First Tee Youth Golf",
    description: "Helping young people build life skills through golf.",
    image:
      "https://images.unsplash.com/photo-1535131749006-b7f58c99034b",
  },
  {
    name: "Clean Water Global",
    description: "Funding clean water projects in underserved communities.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  },
  {
    name: "Children Cancer Support",
    description:
      "Supporting treatment and family care for children with cancer.",
    image: "https://images.unsplash.com/photo-1476231682828-37e571bc172f",
  },
];

async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

async function seedCharities() {
  for (const charity of charities) {
    const { data: existing } = await supabase
      .from("charities")
      .select("id")
      .eq("name", charity.name)
      .maybeSingle();

    if (existing) continue;

    const { error } = await supabase.from("charities").insert([charity]);
    if (error) throw new Error(`seedCharities: ${error.message}`);
  }
}

async function ensureActiveSubscription(userId) {
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (existing) {
    const { error: uErr } = await supabase
      .from("users")
      .update({
        subscription_id: existing.id,
        subscription_status: "active",
      })
      .eq("id", userId);
    if (uErr) throw new Error(`ensureActiveSubscription (link): ${uErr.message}`);
    return;
  }

  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  const { data: sub, error: insErr } = await supabase
    .from("subscriptions")
    .insert([
      {
        user_id: userId,
        plan: "yearly",
        status: "active",
        amount: 99.99,
        expiry_date: expiryDate.toISOString(),
      },
    ])
    .select("id")
    .single();

  if (insErr) throw new Error(`ensureActiveSubscription (insert): ${insErr.message}`);

  const { error: uErr } = await supabase
    .from("users")
    .update({
      subscription_id: sub.id,
      subscription_status: "active",
    })
    .eq("id", userId);
  if (uErr) throw new Error(`ensureActiveSubscription (user): ${uErr.message}`);
}

async function seedAdmin() {
  const passwordHash = await hashPassword(ADMIN_PASSWORD);

  const { data: existing } = await supabase
    .from("users")
    .select("id, email")
    .eq("email", ADMIN_EMAIL)
    .maybeSingle();

  if (!existing) {
    const { data: user, error } = await supabase
      .from("users")
      .insert([
        {
          name: ADMIN_NAME,
          email: ADMIN_EMAIL,
          password: passwordHash,
          role: "admin",
          subscription_status: "active",
          charity_percentage: 10,
        },
      ])
      .select("id")
      .single();

    if (error) throw new Error(`seedAdmin (insert): ${error.message}`);
    await ensureActiveSubscription(user.id);
    return;
  }

  const updates = {
    role: "admin",
    name: ADMIN_NAME,
  };
  if (process.env.SEED_RESET_ADMIN_PASSWORD === "true") {
    updates.password = passwordHash;
  }

  const { error: upErr } = await supabase
    .from("users")
    .update(updates)
    .eq("id", existing.id);
  if (upErr) throw new Error(`seedAdmin (update): ${upErr.message}`);

  await ensureActiveSubscription(existing.id);
}

function randomWinningNumbers() {
  const set = new Set();
  while (set.size < 5) {
    set.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(set);
}

async function seedMockAnalytics() {
  console.log("Seeding mock analytics (test users + draws)...");

  const { error: delUsersErr } = await supabase
    .from("users")
    .delete()
    .like("email", "testuser%@golf.com");
  if (delUsersErr) throw new Error(`seedMockAnalytics (del users): ${delUsersErr.message}`);

  const { data: charityDocs, error: chErr } = await supabase
    .from("charities")
    .select("id");
  if (chErr) throw new Error(chErr.message);
  if (!charityDocs?.length) {
    console.warn("No charities; skipping mock users/draws.");
    return;
  }

  const plain = "Password123";
  const passwordHash = await hashPassword(plain);

  for (let i = 1; i <= 20; i += 1) {
    const charityId =
      charityDocs[Math.floor(Math.random() * charityDocs.length)].id;

    const { data: user, error: uErr } = await supabase
      .from("users")
      .insert([
        {
          name: `Test User ${i}`,
          email: `testuser${i}@golf.com`,
          password: passwordHash,
          role: "user",
          subscription_status: "inactive",
          charity_id: charityId,
          charity_percentage: 15,
        },
      ])
      .select("id")
      .single();

    if (uErr) throw new Error(`seedMockAnalytics user ${i}: ${uErr.message}`);

    await ensureActiveSubscription(user.id);

    const { error: chLinkErr } = await supabase
      .from("users")
      .update({ charity_id: charityId, charity_percentage: 15 })
      .eq("id", user.id);
    if (chLinkErr) throw new Error(chLinkErr.message);
  }

  const { data: drawRows, error: drawListErr } = await supabase
    .from("draws")
    .select("id");
  if (drawListErr) throw new Error(drawListErr.message);
  if (drawRows?.length) {
    const { error: delDrawsErr } = await supabase
      .from("draws")
      .delete()
      .in(
        "id",
        drawRows.map((r) => r.id)
      );
    if (delDrawsErr) {
      throw new Error(`seedMockAnalytics (del draws): ${delDrawsErr.message}`);
    }
  }

  const months = [
    "Oct 2025",
    "Nov 2025",
    "Dec 2025",
    "Jan 2026",
    "Feb 2026",
    "Mar 2026",
  ];
  let jackpotCarryForward = 0;

  for (const m of months) {
    const revenue = Math.floor(Math.random() * 5000) + 15000;
    const subscribers = Math.floor(Math.random() * 50) + 1500;
    const totalPool = Math.floor(revenue * 0.4);
    const charityAmount = Math.floor(revenue * 0.15);

    const { error: dErr } = await supabase
      .from("draws")
      .insert([
        {
          month: m,
          type: "algorithm",
          status: "published",
          total_pool: totalPool,
          participants_count: subscribers,
          winning_numbers: randomWinningNumbers(),
          breakdown: {
            revenue,
            charityAmount,
            jackpotCarryForward,
            note: "seed init-db.js",
          },
        },
      ])
      .select("id")
      .single();

    if (dErr) throw new Error(`seedMockAnalytics draw ${m}: ${dErr.message}`);

    if (Math.random() > 0.5) {
      jackpotCarryForward += Math.floor(totalPool * 0.4);
    } else {
      jackpotCarryForward = 0;
    }

    const perCharity = Math.floor(charityAmount / Math.max(charityDocs.length, 1));
    for (const ch of charityDocs) {
      const { data: row } = await supabase
        .from("charities")
        .select("total_donations")
        .eq("id", ch.id)
        .single();
      const next = Number(row?.total_donations || 0) + perCharity;
      const { error: incErr } = await supabase
        .from("charities")
        .update({ total_donations: next })
        .eq("id", ch.id);
      if (incErr) throw new Error(incErr.message);
    }
  }

  console.log("Mock analytics seed finished.");
}

async function run() {
  try {
    await seedCharities();
    await seedAdmin();
    if (process.env.SEED_MOCK_ANALYTICS !== "false") {
      await seedMockAnalytics();
    } else {
      console.log("SEED_MOCK_ANALYTICS=false — skipping mock users/draws.");
    }

    const { count, error: cErr } = await supabase
      .from("charities")
      .select("*", { count: "exact", head: true });
    if (cErr) throw cErr;

    console.log("Seed complete.");
    console.log(`Admin email: ${ADMIN_EMAIL}`);
    if (process.env.NODE_ENV !== "production") {
      console.log(`Admin password: ${ADMIN_PASSWORD}`);
    }
    console.log(`Total charities: ${count ?? "?"}`);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
}

run();
