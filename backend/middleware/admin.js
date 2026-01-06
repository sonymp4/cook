const User = require("../models/User");

exports.admin = async (req, res, next) => {
    console.log("🛡️ [ADMIN DEBUG] Checking role for user:", req.user?.email, "Role:", req.user?.role);
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        console.log("❌ [ADMIN DEBUG] User is NOT admin");
        res.status(403).json({
            success: false,
            error: "Not authorized as an admin",
        });
    }
};
