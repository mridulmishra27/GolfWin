const AppError = require("../utils/AppError");
const { resolveActiveSubscription } = require("../utils/subscriptionStatus");

async function checkActiveSubscription(req, res, next) {
  try {
    const activeSubscription = await resolveActiveSubscription(req.user.id);
    if (!activeSubscription) {
      throw new AppError("Active subscription required", 403);
    }

    req.activeSubscription = activeSubscription;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  checkActiveSubscription
};
