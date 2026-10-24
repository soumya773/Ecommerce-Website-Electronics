const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const connectDB = require('./config/db');
const router = require('./routes');
const stripeWebhook = require('./controller/order/webhook');

const app = express();
const allowedOrigin = process.env.FRONTEND_URL;
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(async (req, res, next) => {
  try { await connectDB(); return next(); }
  catch (error) { console.error('Database connection failed:', error.message); return res.status(503).json({ success: false, message: 'Database temporarily unavailable.' }); }
});
// Stripe requires the original raw request bytes for signature verification.
app.post('/api/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
app.use(express.json());
app.use(cookieParser());
app.use('/api', router);

const PORT = process.env.PORT || 8080;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}
module.exports = app;
