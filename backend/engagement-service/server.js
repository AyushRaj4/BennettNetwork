require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/database");
const engagementRoutes = require("./routes/engagementRoutes");
const errorHandler = require("./middleware/errorHandler");

connectDB();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    service: "Engagement Service",
    status: "Running",
    port: process.env.PORT,
  });
});

app.use("/api/engagement", engagementRoutes);

// Error handler middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  console.log(`Engagement Service running on port ${PORT}`);
});
