const app = require("./app");
const env = require("./config/env");
const { connectDB } = require("./config/db");

// Scheduled jobs (monthly draft creation only; admin still publishes)
const { startMonthlyDrawJob } = require("./jobs/monthlyDrawJob");

async function bootstrap() {
  // Initialize Database 
  connectDB();
  
  startMonthlyDrawJob();

  app.listen(env.port, () => {
    console.log(`🚀 Server running in ${env.nodeEnv} on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("❌ Failed to start server", error);
  process.exit(1);
});
