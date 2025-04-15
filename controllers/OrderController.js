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

const getOrderStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Total revenue this year
    const yearlyStats = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    // Best 5 selling dishes
    const topProducts = await Order.aggregate([
      { $unwind: '$dishes' },
      {
        $group: {
          _id: '$dishes.dish',
          totalSold: { $sum: '$dishes.quantity' },
        },
      },
      {
        $lookup: {
          from: 'dishs', // collection name
          localField: '_id',
          foreignField: '_id',
          as: 'dishDetails',
        },
      },
      { $unwind: '$dishDetails' },
      {
        $project: {
          _id: 0,
          dishId: '$_id',
          name: '$dishDetails.name',
          totalSold: 1,
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    // Monthly revenue comparison (this month vs last month)
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalRevenue: { $sum: '$totalPrice' },
        },
      },
    ]);

    const thisMonthRev =
      monthlyRevenue.find((m) => m._id === currentMonth)?.totalRevenue || 0;
    const lastMonthRev =
      monthlyRevenue.find((m) => m._id === currentMonth - 1)?.totalRevenue || 0;

    const increasePercent =
      lastMonthRev > 0
        ? (((thisMonthRev - lastMonthRev) / lastMonthRev) * 100).toFixed(2)
        : null;

    res.status(200).json({
      status: 'success',
      data: {
        yearly: {
          totalRevenue: yearlyStats[0]?.totalRevenue || 0,
          totalOrders: yearlyStats[0]?.totalOrders || 0,
        },
        monthly: {
          thisMonth: thisMonthRev,
          lastMonth: lastMonthRev,
          increasePercent,
        },
        topProducts,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

module.exports = {
  getAllOrders,
  createOrder,
  getOrderById,
  updateOrder,
  getOrderStats,
};
