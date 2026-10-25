const orderModel = require("../../models/orderProductModel");

const allowedStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];

async function updateOrderStatus(req, res) {
  try {
    const { orderId, orderStatus } = req.body;

    if (!orderId || !allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Valid order ID and order status are required.",
      });
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { $set: { orderStatus } },
      { new: true, runValidators: true },
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.json({
      success: true,
      message: "Order status updated successfully.",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not update order status.",
    });
  }
}

module.exports = updateOrderStatus;
