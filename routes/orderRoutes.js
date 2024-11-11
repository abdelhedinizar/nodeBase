const express = require('express');
const {
  getAllOrders,
  createOrder,
  getOrderById,
  getOrderBySessionId,
} = require('../controllers/OrderController');

const route = express.Router();

route.route('/').get(getAllOrders).post(createOrder);
route.route('/:id').get(getOrderById);

module.exports = route;
