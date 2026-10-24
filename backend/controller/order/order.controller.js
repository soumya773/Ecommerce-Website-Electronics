const orderModel = require('../../models/orderProductModel');

module.exports = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: String(req.userId) }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not load orders.' });
  }
};
