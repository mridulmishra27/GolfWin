const { supabase } = require("../config/db");

async function addScoreWithLimit({ userId, score, date }) {
  const { data: existingScores, error: listError } = await supabase
    .from("scores")
    .select("id")
    .eq("user_id", userId)
    .order("date", { ascending: true })
    .order("created_at", { ascending: true });

  if (listError) {
    throw new Error(listError.message);
  }

  if (existingScores && existingScores.length >= 5) {
    const { error: delError } = await supabase
      .from("scores")
      .delete()
      .eq("id", existingScores[0].id);
    if (delError) {
      throw new Error(delError.message);
    }
  }

  const { data: newScore, error: insertError } = await supabase
    .from("scores")
    .insert([{ user_id: userId, score, date: date ? date.toISOString() : new Date().toISOString() }])
    .select()
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }
  if (!newScore) {
    throw new Error("Failed to save score");
  }

  return newScore;
}

module.exports = { addScoreWithLimit };