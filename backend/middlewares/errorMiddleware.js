function notFound(req, res, next) {
  res.status(404).json({ message: `Not found: ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  const statusCode =
    err.statusCode ||
    (err.name === "ZodError" ? 400 : err.name === "JsonWebTokenError" || err.name === "TokenExpiredError" ? 401 : 500);

  const validationErrors =
    err.name === "ZodError"
      ? err.errors.map((item) => ({
          field: item.path.join("."),
          message: item.message
        }))
      : undefined;

  res.status(statusCode).json({
    message: err.message || "Internal server error",
    ...(validationErrors ? { errors: validationErrors } : {})
  });
}

module.exports = { notFound, errorHandler };
