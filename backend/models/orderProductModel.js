const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  stripeSessionId: { type: String, unique: true, sparse: true },
  productDetails: { type: Array, default: [] },
  email: { type: String, default: '' },
  userId: { type: String, required: true, index: true },
  paymentDetails: {
    paymentId: { type: String, default: '' },
    payment_method_type: { type: [String], default: [] },
    payment_status: { type: String, default: 'unpaid' }
  },
  shipping_options: { type: Array, default: [] },
  totalAmount: { type: Number, default: 0 },
  orderStatus: { type: String, enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Processing' }
}, { timestamps: true });

module.exports = mongoose.models.order || mongoose.model('order', orderSchema);
