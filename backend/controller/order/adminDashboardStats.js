const orderModel = require("../../models/orderProductModel");
const productModel = require("../../models/productModel");
const userModel = require("../../models/userModel");

async function adminDashboardStats(req, res) {
  try {
    const [orders, products, users, revenueResult, recentOrders, statusCounts] =
      await Promise.all([
        orderModel.countDocuments(),
        productModel.countDocuments(),
        userModel.countDocuments(),

        orderModel.aggregate([
          {
            $match: {
              "paymentDetails.payment_status": "paid",
              orderStatus: { $ne: "Cancelled" },
            },
          },
          {
            $group: {
              _id: null,
              revenue: { $sum: "$totalAmount" },
            },
          },
        ]),

        orderModel
          .find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select(
            "email totalAmount orderStatus createdAt paymentDetails.payment_status",
          ),

        orderModel.aggregate([
          {
            $group: {
              _id: "$orderStatus",
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

    return res.json({
      success: true,
      data: {
        totals: {
          orders,
          products,
          users,
          revenue: revenueResult[0]?.revenue || 0,
        },
        recentOrders,
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item._id || "Unknown"] = item.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error("Admin dashboard stats error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not load dashboard statistics.",
    });
  }
}

module.exports = adminDashboardStats;
