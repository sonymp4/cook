const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      console.log("❌ [AUTH DEBUG] No token provided in headers:", req.headers.authorization);
      return res.status(401).json({
        success: false,
        error: "Not authorized to access this route",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key-change-in-production");
      console.log("✅ [AUTH DEBUG] Token verified for User ID:", decoded.userId);
      req.userId = decoded.userId;

      // Load user for admin check
      const currentUser = await User.findById(decoded.userId);
      if (!currentUser) {
        console.log("❌ [AUTH DEBUG] User not found in DB");
        return res.status(401).json({ success: false, error: "User not found" });
      }
      req.user = currentUser;
      next();
    } catch (err) {
      console.log("❌ [AUTH DEBUG] Token verification failed:", err.message);
      return res.status(401).json({
        success: false,
        error: "Not authorized to access this route",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};





