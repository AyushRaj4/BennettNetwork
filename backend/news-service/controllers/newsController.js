const News = require("../models/News");
const NewsScraper = require("../utils/scraper");

const scraper = new NewsScraper();

// @desc    Get all news with filters and pagination
// @route   GET /api/news
// @access  Public
exports.getNews = async (req, res, next) => {
  try {
    const {
      category,
      limit = 10,
      page = 1,
      sort = "-publishedDate",
    } = req.query;

    const query = { isActive: true };

    if (category && category !== "all") {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [news, total] = await Promise.all([
      News.find(query).sort(sort).limit(parseInt(limit)).skip(skip).lean(),
      News.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: news,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching news",
      error: error.message,
    });
  }
};

// @desc    Get single news by ID
// @route   GET /api/news/:id
// @access  Public
exports.getNewsById = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    res.status(200).json({
      success: true,
      data: news,
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching news",
      error: error.message,
    });
  }
};

// @desc    Get latest news (top 5)
// @route   GET /api/news/latest
// @access  Public
exports.getLatestNews = async (req, res, next) => {
  try {
    const news = await News.find({ isActive: true })
      .sort("-publishedDate")
      .limit(5)
      .lean();

    res.status(200).json({
      success: true,
      data: news,
    });
  } catch (error) {
    console.error("Error fetching latest news:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching latest news",
      error: error.message,
    });
  }
};

// @desc    Get news categories with counts
// @route   GET /api/news/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await News.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: categories.map((cat) => ({
        category: cat._id,
        count: cat.count,
      })),
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
};

// @desc    Manually trigger news scraping
// @route   POST /api/news/scrape
// @access  Private (can add auth middleware later)
exports.scrapeNews = async (req, res, next) => {
  try {
    const result = await scraper.scrapeBennettNews();

    res.status(200).json({
      success: true,
      message: "News scraping completed",
      data: result,
    });
  } catch (error) {
    console.error("Error scraping news:", error);
    res.status(500).json({
      success: false,
      message: "Error scraping news",
      error: error.message,
    });
  }
};

// @desc    Delete old news (older than 6 months)
// @route   DELETE /api/news/cleanup
// @access  Private (can add auth middleware later)
exports.cleanupOldNews = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const result = await News.deleteMany({
      publishedDate: { $lt: sixMonthsAgo },
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} old news items`,
      data: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    console.error("Error cleaning up news:", error);
    res.status(500).json({
      success: false,
      message: "Error cleaning up news",
      error: error.message,
    });
  }
};

// @desc    Get news statistics
// @route   GET /api/news/stats
// @access  Public
exports.getStats = async (req, res, next) => {
  try {
    const [total, byCategory, recent] = await Promise.all([
      News.countDocuments({ isActive: true }),
      News.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
      News.countDocuments({
        isActive: true,
        publishedDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        recentWeek: recent,
        byCategory: byCategory.reduce((acc, cat) => {
          acc[cat._id] = cat.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};
