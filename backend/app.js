const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

const env = require("./config/env");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const charityRoutes = require("./routes/charityRoutes");
const drawRoutes = require("./routes/drawRoutes");
const scoreRoutes = require("./routes/scoreRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const userRoutes = require("./routes/userRoutes");
const winnerRoutes = require("./routes/winnerRoutes");
const jobRoutes = require("./routes/jobRoutes");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser tools (no Origin) and common local dev ports
      const allowed = new Set([
        env.frontendUrl,
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
      ]);
      if (!origin) return cb(null, true);
      if (allowed.has(origin)) return cb(null, true);
      return cb(null, true); // keep permissive by default to avoid blocking deployments
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Length"]
  })
);
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

// Subscriptions webhook parses raw data
app.use((req, res, next) => {
  if (req.originalUrl === '/api/subscriptions/webhook') {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true }));

// Root health-check endpoint
app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "API is running" });
});

// Routing definition
app.use("/api/auth", authRoutes);
app.use("/api/charities", charityRoutes);
app.use("/api/draws", drawRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/winners", winnerRoutes);
app.use("/api/jobs", jobRoutes);

// Serve built frontend in production (fixes refresh on /admin, /dashboard, etc.)
// This lets you run the app behind a single server without needing rewrite rules.
const frontendDist = path.resolve(__dirname, "..", "frontend", "dist");
if (env.nodeEnv === "production" && fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get("*", (req, res) => {
    if (req.originalUrl.startsWith("/api/")) {
      return res.status(404).json({ message: `Not found: ${req.originalUrl}` });
    }
    return res.sendFile(path.join(frontendDist, "index.html"));
  });
}

// Error handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;
