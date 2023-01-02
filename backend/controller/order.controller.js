const asyncHandler = require("../middleware/bigPromise");
const customError = require("../utils/customError");
const Order = require("../model/order.schema");
const Product = require("../model/product.schema");

exports.createOrder = asyncHandler(async (req, res) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
  } = req.body;

  if (
    !(
      shippingInfo &&
      orderItems &&
      paymentInfo &&
      taxAmount &&
      shippingAmount &&
      totalAmount
    )
  ) {
    throw new customError("All fields are required", 400);
  }

  const orderDetails = {
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    user: req.user._id,
  };

  const order = await Order.create(orderDetails);

  res.status(200).json({
    success: true,
    order,
  });
});

exports.findOneOrder = asyncHandler(async (req, res) => {
  const createdOrder = await Order.findById(req.params.id).populate(
    "user",
    "name email role"
  );
  if (!createdOrder) {
    throw new customError("please check order id, order not found", 400);
  }

  res.status(200).json({
    success: true,
    createdOrder,
  });
});

exports.getLoggedInOrders = asyncHandler(async (req, res) => {
  const order = await Order.find({ user: req.user._id });

  if (!order) {
    throw new customError("please check order id, order not found", 400);
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// Admin

exports.adminGetAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find();

  if (!orders) {
    throw new customError("order not found", 400);
  }

  res.status(200).json({
    success: true,
    orders,
  });
});

exports.adminUpdateOrder = asyncHandler(async (req, res) => {
  let order = await Order.findById(req.params.id);

  if (!order) {
    throw new customError("order not found", 400);
  }
  if (order.orderStatus === "delivered") {
    throw new customError("Order is already marked for delivered", 401);
  }

  order.orderStatus = req.body.orderStatus;

  order.orderItems.forEach(async (item) => {
    updateProductStock(item.product, item.quantity);
  });

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    order,
  });
});

async function updateProductStock(productId, quantity) {
  const product = await Product.findById(productId);

  product.stock = product.stock - quantity;

  await product.save({ validateBeforeSave: false });
}

exports.adminDeleteOrder = asyncHandler(async (req, res) => {
  let order = await Order.findById(req.params.id);

  if (!order) {
    throw new customError("order not found", 400);
  }

  await order.remove();

  res.status(200).json({
    success: true,
    order,
  });
});
