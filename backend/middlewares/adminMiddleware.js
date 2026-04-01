const AppError = require("../utils/AppError");

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return next(new AppError("Admin access required", 403));
  }
  return next();
}

module.exports = { adminOnly };