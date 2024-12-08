const express = require('express');
const {
  getAllOrders,
  createOrder,
  getOrderById,
  updateOrder,
  getOrderBySessionId,
} = require('../controllers/OrderController');
const authController = require('../controllers/AuthController');

const route = express.Router();

route.route('/').get(getAllOrders).post(createOrder);
route.route('/:id').get(getOrderById).patch(authController.protect,updateOrder);

module.exports = route;
