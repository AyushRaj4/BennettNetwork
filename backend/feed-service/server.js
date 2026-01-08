require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/database");
const feedRoutes = require("./routes/feedRoutes");

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("dev"));

// Routes
app.get("/", (req, res) => {
  res.json({
    service: "Feed Service",
    status: "Running",
    port: process.env.PORT,
  });
});

app.use("/api/feed", feedRoutes);

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
  console.log(`Feed Service running on port ${PORT}`);
});
