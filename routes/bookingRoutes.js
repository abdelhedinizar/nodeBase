const express = require('express');
const bookingController = require('../controllers/bookingController');

const route = express.Router();

route.get('/checkout-seesion/:orderID', bookingController.getCheckoutSeesion);

module.exports = route;
