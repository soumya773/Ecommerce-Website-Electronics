const userModel = require("../models/userModel");

async function requireAdmin(req, res, next) {
  try {
    const user = await userModel.findById(req.userId).select("role");

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    return next();
  } catch (error) {
    console.error("Admin authorization error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not verify admin permissions.",
    });
  }
}

module.exports = requireAdmin;
