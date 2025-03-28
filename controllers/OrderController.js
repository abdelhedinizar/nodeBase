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
    req.body.sequenceNumber = await setSequenceNumber();
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

const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        order,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

async function setSequenceNumber() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastOrder = await Order.findOne({ createdAt: { $gte: today } }).sort({
    createdAt: -1,
  });
  let sequenceNumber = 100;
  if (lastOrder) {
    if (lastOrder.sequenceNumber) {
      sequenceNumber = lastOrder.sequenceNumber + 1;
    } else {
      sequenceNumber = 100;
    }
  }
  return sequenceNumber;
}
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      length: order ? 1 : 0,
      data: { order },
    });
  } catch (e) {
    res.status(400).json({
      status: 'error',
      message: e,
    });
  }
};

module.exports = {
  getAllOrders,
  createOrder,
  getOrderById,
  updateOrder,
};
