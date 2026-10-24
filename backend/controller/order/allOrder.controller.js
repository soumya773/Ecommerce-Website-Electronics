const orderModel = require('../../models/orderProductModel');
const userModel = require('../../models/userModel');

module.exports = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select('role');
    if (!user || user.role !== 'ADMIN') return res.status(403).json({ success: false, message: 'Admin access required.' });
    const orders = await orderModel.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not load orders.' });
  }
};
