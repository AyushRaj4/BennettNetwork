const express = require("express");
const router = express.Router();
const {
  getNews,
  getNewsById,
  getLatestNews,
  getCategories,
  scrapeNews,
  cleanupOldNews,
  getStats,
} = require("../controllers/newsController");

// Public routes
router.get("/", getNews);
router.get("/latest", getLatestNews);
router.get("/categories", getCategories);
router.get("/stats", getStats);
router.get("/:id", getNewsById);

// Admin/Maintenance routes
router.post("/scrape", scrapeNews);
router.delete("/cleanup", cleanupOldNews);

module.exports = router;
