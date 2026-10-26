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

const corsOptions = {
  origin: function (origin, callback) {
    console.log("Incoming request origin:", origin || "(no origin)");

    if (!origin || allowedOrigins.includes(origin)) {
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

// CORS must run before database middleware and API routes.
app.use(cors(corsOptions));

// Explicitly handle browser preflight requests.
app.options(/.*/, cors(corsOptions));

// Stripe requires the original raw request bytes for signature verification.
// Keep this route before express.json().
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

// Parse request bodies and cookies.
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB before handling API requests.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error.message);

    res.status(503).json({
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
