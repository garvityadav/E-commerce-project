const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const Product = require("../models/product");
const Order = require("../models/order");
const { checkPermissions } = require("../utils");

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_Secret = "someRandomValue";
  return { client_Secret, amount };
};

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;
  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError("No item provided");
  }
  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError(
      "Please provide tax and shipping fee"
    );
  }
  let orderItems = [];
  let subtotal = 0;
  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new CustomError.NotFoundError(
        "No product found with ID: " + item.product
      );
    }
    const { name, price, image, _id } = dbProduct;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };
    orderItems = [...orderItems, singleOrderItem];
    subtotal = item.amount * price;
  }
  const total = tax + shippingFee + subtotal;
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  });
  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_Secret,
    user: req.user.userID,
  });
  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find();
  res.status(StatusCodes.OK).json({ count: orders.length, orders });
};
const getSingleOrder = async (req, res) => {
  const orderID = req.params.id;

  const order = await Order.findOne({ _id: orderID });
  if (!order) {
    throw new CustomError.NotFoundError("Order not found");
  }
  checkPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json(order);
};

const getCurrentUserOrders = async (req, res) => {
  const userID = req.user.userID;
  const order = await Order.findOne({ user: userID });
  if (!order) {
    throw new CustomError.NotFoundError("Order not found");
  }
  res.status(StatusCodes.OK).json(order);
};

const updateOrder = async (req, res) => {
  const orderID = req.params.id;
  const { paymentIntetntID } = req.body;
  const order = await Order.findOne({ _id: orderID });
  if (!order) {
    throw new CustomError.NotFoundError("Order not found");
  }
  checkPermissions(req.user, order.user);
  order.paymentIntetntID = paymentIntetntID;
  order.status = "paid";
  await order.save();
  res.status(StatusCodes.OK).json(order);
};

module.exports = {
  createOrder,
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  updateOrder,
};
