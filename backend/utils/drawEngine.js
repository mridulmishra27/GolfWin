const { supabase } = require("../config/db");

function generateUniqueNumbers(count, min = 1, max = 45) {
  const picked = new Set();
  while (picked.size < count) {
    const value = Math.floor(Math.random() * (max - min + 1)) + min;
    picked.add(value);
  }
  return [...picked].sort((a, b) => a - b);
}

async function generateAlgorithmNumbers() {
  const { data: scores } = await supabase.from("scores").select("score");

  if (!scores || !scores.length) {
    return generateUniqueNumbers(5);
  }

  const counts = scores.reduce((acc, curr) => {
    acc[curr.score] = (acc[curr.score] || 0) + 1;
    return acc;
  }, {});

  const frequency = Object.entries(counts)
    .map(([score, count]) => ({ _id: parseInt(score, 10), count }))
    .sort((a, b) => b.count - a.count || a._id - b._id);

  const mostFrequent = frequency.slice(0, 3).map((f) => f._id);
  const leastFrequent = [...frequency].sort((a, b) => a.count - b.count).slice(0, 2).map((f) => f._id);

  const merged = Array.from(new Set([...mostFrequent, ...leastFrequent])).filter(
    (n) => n >= 1 && n <= 45
  );

  while (merged.length < 5) {
    const random = generateUniqueNumbers(1)[0];
    if (!merged.includes(random)) merged.push(random);
  }

  return merged.slice(0, 5).sort((a, b) => a - b);
}

function matchCount(userScores, drawNumbers) {
  const scoreSet = new Set(userScores);
  return drawNumbers.filter((number) => scoreSet.has(number)).length;
}

module.exports = {
  generateUniqueNumbers,
  generateAlgorithmNumbers,
  matchCount
};