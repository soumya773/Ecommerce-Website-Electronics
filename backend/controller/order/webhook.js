const stripe = require('../../config/stripe');
const orderModel = require('../../models/orderProductModel');
const cartModel = require('../../models/cartProduct');
const productModel = require('../../models/productModel');

module.exports = async function stripeWebhook(req, res) {
  const signature = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(500).send('Stripe webhook secret is not configured.');

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, secret);
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      // Do not record unpaid/async sessions as completed orders.
      if (session.payment_status !== 'paid') return res.status(200).json({ received: true });
      const existing = await orderModel.findOne({ stripeSessionId: session.id });
      if (existing) return res.status(200).json({ received: true });

      const userId = session.metadata?.userId || session.client_reference_id;
      if (!userId) return res.status(400).send('Missing user reference.');
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
      const details = [];
      for (const item of lineItems.data) {
        let stripeProduct = null;
        let productId = '';
        if (typeof item.price?.product === 'string') {
          stripeProduct = await stripe.products.retrieve(item.price.product);
          productId = stripeProduct.metadata?.productId || '';
        }
        const product = productId ? await productModel.findById(productId).select('productName productImage') : null;
        details.push({
          productId,
          name: item.description || stripeProduct?.name || product?.productName || 'Product',
          price: (item.amount_total || item.amount_subtotal || 0) / 100 / Math.max(item.quantity || 1, 1),
          quantity: item.quantity || 1,
          image: product?.productImage || stripeProduct?.images || []
        });
      }

      await orderModel.create({
        stripeSessionId: session.id,
        productDetails: details,
        email: session.customer_details?.email || session.customer_email || '',
        userId: String(userId),
        paymentDetails: {
          paymentId: typeof session.payment_intent === 'string' ? session.payment_intent : '',
          payment_method_type: session.payment_method_types || [],
          payment_status: session.payment_status
        },
        shipping_options: [],
        totalAmount: (session.amount_total || 0) / 100,
        orderStatus: 'Processing'
      });
      await cartModel.deleteMany({ userId: String(userId) });
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Stripe webhook processing error:', err.message);
    return res.status(500).send('Webhook processing failed.');
  }
};
