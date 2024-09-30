const express = require('express');
const { getAllOrders, createOrder } = require('../controllers/OrderController');

const route = express.Router();

route.route('/').get(getAllOrders).post(createOrder);

module.exports = route;
