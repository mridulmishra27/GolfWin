const DISTRIBUTION = {
  "5": 0.4,
  "4": 0.35,
  "3": 0.25
};

function calculatePrizes({ basePool, carryIn = 0, winnerGroups }) {
  const prizes = {};
  const buckets = {
    "3": basePool * DISTRIBUTION["3"],
    "4": basePool * DISTRIBUTION["4"],
    "5": basePool * DISTRIBUTION["5"] + carryIn
  };

  const threeWinners = winnerGroups["3"] || 0;
  const fourWinners = winnerGroups["4"] || 0;
  const fiveWinners = winnerGroups["5"] || 0;

  prizes["3"] = threeWinners > 0 ? Number((buckets["3"] / threeWinners).toFixed(2)) : 0;
  prizes["4"] = fourWinners > 0 ? Number((buckets["4"] / fourWinners).toFixed(2)) : 0;
  prizes["5"] = fiveWinners > 0 ? Number((buckets["5"] / fiveWinners).toFixed(2)) : 0;
  prizes.carryOut = fiveWinners > 0 ? 0 : Number(buckets["5"].toFixed(2));

  return prizes;
}

module.exports = {
  DISTRIBUTION,
  calculatePrizes
};
