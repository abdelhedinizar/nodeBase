const Order = require('./../models/OrderModel');
const APIFeatures = require('./../utils/APIFeatures');

const getAllOrders = async (req, res) => {
  try {
    const features = new APIFeatures(Order.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const orders = await features.query;
    res.status(200).json({
      status: 'success',
      length: orders.length,
      data: { orders },
    });
  } catch (e) {
    res.status(400).json({
      status: 'fail',
      message: e,
    });
  }
};
const createOrder = async (req, res) => {
  try {
    const newOrder = await Order.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { order: newOrder },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

module.exports = {
  getAllOrders,
  createOrder
};
