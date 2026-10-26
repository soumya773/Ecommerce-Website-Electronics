const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB = require("./config/db");
const router = require("./routes");
const stripeWebhook = require("./controller/order/webhook");

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://ecommerce-website-electronics.vercel.app",
  "https://ecommerce-website-electronics-c8kbrsxf1.vercel.app",
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  // Exact trusted origins.
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  try {
    const url = new URL(origin);

    // Allow HTTPS Vercel preview deployments for your Vercel team.
    // Example: ecommerce-website-electron-git-....-soumyas-projects-dbbe300.vercel.app
    const isTrustedVercelPreview =
      url.protocol === "https:" &&
      url.hostname.endsWith(".vercel.app") &&
      url.hostname.includes("-soumyas-projects-");

    return isTrustedVercelPreview;
  } catch {
    return false;
  }
};

const corsOptions = {
  origin: (origin, callback) => {
    console.log("Incoming request origin:", origin || "(no origin)");

    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      console.error("Rejected CORS origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// CORS must run before API routes and database middleware.
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Stripe webhook must receive the original raw request body.
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

// Parse JSON and cookies for normal API requests.
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB before handling API requests.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error.message);

    return res.status(503).json({
      success: false,
      message: "Database temporarily unavailable.",
    });
  }
});

// API routes.
app.use("/api", router);

const PORT = process.env.PORT || 8080;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
