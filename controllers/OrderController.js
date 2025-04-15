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
    const now = new Date();
    const currentYear = now.getFullYear();
    const lastYear = currentYear - 1;
    const currentMonth = now.getMonth() + 1; // 1-based
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // Helper for year range
    const yearRange = (year) => ({
      $gte: new Date(`${year}-01-01`),
      $lte: new Date(`${year}-12-31`),
    });

    // Helper for month range
    const monthRange = (y, m) => ({
      $gte: new Date(`${y}-${String(m).padStart(2, '0')}-01`),
      $lte: new Date(`${y}-${String(m).padStart(2, '0')}-31`),
    });

    // === Yearly Revenue ===
    const yearlyStats = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: new Date(`${lastYear}-01-01`) }, // include both years
        },
      },
      {
        $group: {
          _id: { $year: '$createdAt' },
          totalRevenue: { $sum: '$totalPrice' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const thisYearData = yearlyStats.find((y) => y._id === currentYear) || {};
    const lastYearData = yearlyStats.find((y) => y._id === lastYear) || {};

    const yearlyRevenue = thisYearData.totalRevenue || 0;
    const lastYearRevenue = lastYearData.totalRevenue || 0;
    const yearlyOrders = thisYearData.totalOrders || 0;
    const yearlyIncrease =
      lastYearRevenue > 0
        ? (((yearlyRevenue - lastYearRevenue) / lastYearRevenue) * 100).toFixed(
            2
          )
        : yearlyRevenue > 0
        ? '100.00'
        : '0.00';

    // === Monthly Revenue ===
    const monthlyStats = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: {
            $gte: new Date(
              `${lastMonthYear}-${String(lastMonth).padStart(2, '0')}-01`
            ),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalRevenue: { $sum: '$totalPrice' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const thisMonthData =
      monthlyStats.find(
        (m) => m._id.year === currentYear && m._id.month === currentMonth
      ) || {};
    const lastMonthData =
      monthlyStats.find(
        (m) => m._id.year === lastMonthYear && m._id.month === lastMonth
      ) || {};

    const thisMonthRevenue = thisMonthData.totalRevenue || 0;
    const lastMonthRevenue = lastMonthData.totalRevenue || 0;
    const monthlyOrders = thisMonthData.totalOrders || 0;
    const monthlyIncrease =
      lastMonthRevenue > 0
        ? (
            ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) *
            100
          ).toFixed(2)
        : thisMonthRevenue > 0
        ? '100.00'
        : '0.00';

    // === Top Products (same as before) ===
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
          from: 'dishs', // note: collection name (double check spelling!)
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

    res.status(200).json({
      status: 'success',
      data: {
        yearly: {
          totalRevenue: yearlyRevenue,
          lastYearRevenue,
          totalOrders: yearlyOrders,
          increasePercent: yearlyIncrease,
        },
        monthly: {
          thisMonth: thisMonthRevenue,
          lastMonth: lastMonthRevenue,
          totalOrders: monthlyOrders,
          increasePercent: monthlyIncrease,
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
