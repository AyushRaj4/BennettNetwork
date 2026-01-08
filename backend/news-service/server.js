const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cron = require("node-cron");
const connectDB = require("./config/database");
const newsRoutes = require("./routes/newsRoutes");
const NewsScraper = require("./utils/scraper");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/news", newsRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "News Service is running",
    timestamp: new Date().toISOString(),
  });
});

// Initialize scraper
const scraper = new NewsScraper();

// Run initial scraping on startup
setTimeout(async () => {
  try {
    console.log("🚀 Running initial news scraping...");
    await scraper.scrapeBennettNews();
  } catch (error) {
    console.error("Initial scraping failed:", error.message);
  }
}, 5000); // Wait 5 seconds after startup

// Schedule automatic scraping (every hour)
cron.schedule("0 * * * *", async () => {
  try {
    console.log("⏰ Scheduled scraping started");
    await scraper.scrapeBennettNews();
  } catch (error) {
    console.error("Scheduled scraping failed:", error.message);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start server
const PORT = process.env.PORT || 3011;
app.listen(PORT, () => {
  console.log(`News Service running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});
