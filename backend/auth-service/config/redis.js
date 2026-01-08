const redis = require("redis");

// Create Redis client
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  // Retry strategy
  retry_strategy: (options) => {
    if (options.error && options.error.code === "ECONNREFUSED") {
      console.error("Redis connection refused");
      return new Error("Redis connection refused");
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error("Redis retry time exhausted");
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  },
});

// Handle Redis connection events
redisClient.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis connection error:", err.message);
  console.log("⚠️  Running without Redis cache - using MongoDB only");
});

redisClient.on("ready", () => {
  console.log("✅ Redis client ready");
});

redisClient.on("end", () => {
  console.log("⚠️  Redis connection closed");
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("❌ Failed to connect to Redis:", err.message);
    console.log("⚠️  Application will continue without Redis cache");
  }
})();

// Helper functions for caching

/**
 * Get data from cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} - Parsed JSON data or null
 */
const getCache = async (key) => {
  try {
    if (!redisClient.isOpen) return null;

    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Redis GET error:", error.message);
    return null;
  }
};

/**
 * Set data in cache with expiration
 * @param {string} key - Cache key
 * @param {any} value - Data to cache
 * @param {number} ttl - Time to live in seconds (default: 1 hour)
 */
const setCache = async (key, value, ttl = 3600) => {
  try {
    if (!redisClient.isOpen) return false;

    await redisClient.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Redis SET error:", error.message);
    return false;
  }
};

/**
 * Delete data from cache
 * @param {string} key - Cache key
 */
const deleteCache = async (key) => {
  try {
    if (!redisClient.isOpen) return false;

    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error("Redis DEL error:", error.message);
    return false;
  }
};

/**
 * Delete multiple keys matching pattern
 * @param {string} pattern - Key pattern (e.g., "user:*")
 */
const deleteCachePattern = async (pattern) => {
  try {
    if (!redisClient.isOpen) return false;

    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    console.error("Redis DEL pattern error:", error.message);
    return false;
  }
};

/**
 * Check if Redis is available
 * @returns {boolean}
 */
const isRedisAvailable = () => {
  return redisClient.isOpen;
};

module.exports = {
  redisClient,
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
  isRedisAvailable,
};
