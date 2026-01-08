require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/database");
const networkRoutes = require("./routes/networkRoutes");

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
app.get("/", (req, res) => {
  res.json({
    service: "Network Service",
    status: "Running",
    port: process.env.PORT,
  });
});

app.use("/api/network", networkRoutes);

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`Network Service running on port ${PORT}`);
});
