const addToCartModel = require("../../models/cartProduct");

const addToCartController = async (req, res) => {
  try {
    const { productId } = req.body;
    const currentUser = req.userId;

    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required",
        success: false,
        error: true,
      });
    }

    // Check this product only in the current user's cart
    const isProductAvailable = await addToCartModel.findOne({
      productId: productId,
      userId: currentUser,
    });

    if (isProductAvailable) {
      return res.json({
        message: "Product already exists in your cart",
        success: false,
        error: true,
      });
    }

    const newAddToCart = new addToCartModel({
      productId: productId,
      quantity: 1,
      userId: currentUser,
    });

    const saveProduct = await newAddToCart.save();

    return res.status(201).json({
      data: saveProduct,
      message: "Product added to cart",
      success: true,
      error: false,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Internal server error",
      success: false,
      error: true,
    });
  }
};

module.exports = addToCartController;
