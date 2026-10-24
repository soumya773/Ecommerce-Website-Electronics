const stripe = require('../../config/stripe');
const userModel = require('../../models/userModel');
const cartModel = require('../../models/cartProduct');

const paymentController = async (req, res) => {
  try {
    if (!process.env.FRONTEND_URL) return res.status(500).json({ success: false, message: 'FRONTEND_URL is not configured.' });
    if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ success: false, message: 'Stripe is not configured.' });

    const user = await userModel.findById(req.userId).select('email');
    if (!user) return res.status(401).json({ success: false, message: 'Please sign in again.' });

    const cartItems = await cartModel.find({ userId: String(req.userId) }).populate('productId');
    if (!cartItems.length) return res.status(400).json({ success: false, message: 'Your cart is empty.' });

    const line_items = cartItems.map((item) => {
      const product = item.productId;
      if (!product || !Number.isFinite(Number(product.sellingPrice)) || Number(product.sellingPrice) <= 0 || !Number.isInteger(item.quantity) || item.quantity < 1) {
        throw new Error('A cart item is invalid. Please refresh your cart and try again.');
      }
      return {
        price_data: {
          currency: 'inr',
          product_data: {
            name: String(product.productName).slice(0, 200),
            images: Array.isArray(product.productImage) ? product.productImage.filter((url) => /^https:\/\//i.test(url)).slice(0, 8) : [],
            metadata: { productId: String(product._id) }
          },
          unit_amount: Math.round(Number(product.sellingPrice) * 100)
        },
        quantity: item.quantity
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      customer_email: user.email,
      client_reference_id: String(req.userId),
      metadata: { userId: String(req.userId) },
      line_items,
      success_url: `${process.env.FRONTEND_URL.replace(/\/$/, '')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL.replace(/\/$/, '')}/cancel`
    });

    return res.status(200).json({ success: true, url: session.url, id: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error.message);
    return res.status(400).json({ success: false, message: error.message || 'Could not start checkout.' });
  }
};

module.exports = paymentController;
