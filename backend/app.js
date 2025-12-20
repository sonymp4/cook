const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ---------- MIDDLEWARE ----------
app.use(cors({
  origin: '*', // Allow all origins in development (restrict in production)
  credentials: true,
})); // Allow requests from React Native
app.use(express.json()); // Parse JSON bodies

// ---------- DATABASE CONNECTION ----------
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // MongoDB connection options
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("\n💡 Make sure you have:");
    console.error("   1. Created a .env file with MONGO_URI");
    console.error("   2. MongoDB is running (local) or have valid Atlas credentials");
    console.error("   3. Check your connection string format");
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on("disconnected", () => {
  console.log("⚠️  MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB error:", err);
});

// Connect to database
connectDB();

// ---------- ROUTES ----------
const apiRouter = require("./routes");
app.use("/api", apiRouter);

// ---------- TEST ROUTE ----------
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

module.exports = app;