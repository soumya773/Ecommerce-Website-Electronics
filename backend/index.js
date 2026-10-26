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

function isAllowedOrigin(origin) {
  if (!origin) return true;

  if (allowedOrigins.includes(origin)) return true;

  try {
    const url = new URL(origin);
    const hostname = url.hostname;

    return (
      url.protocol === "https:" &&
      hostname.endsWith(".vercel.app") &&
      hostname.startsWith("ecommerce-website-electron-git-") &&
      hostname.includes("-soumyas-projects-dbbee300")
    );
  } catch {
    return false;
  }
}

const corsOptions = {
  origin: function (origin, callback) {
    console.log("Incoming request origin:", origin || "(no origin)");

    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    console.error("Rejected CORS origin:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

// CORS must run before routes and database middleware.
app.use(cors(corsOptions));
app.use((req, res, next) => {
  if (req.path === "/api/admin/order-status") {
    console.log("ORDER STATUS REQUEST:", req.method, req.path);
  }
  next();
});
app.options(/.*/, cors(corsOptions));

// Stripe requires the original, unparsed request body.
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB before processing API requests.
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

app.use("/api", router);

const PORT = process.env.PORT || 8080;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
