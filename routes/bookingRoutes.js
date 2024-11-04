const express = require('express');
const bookingController = require('../controllers/bookingController');

const route = express.Router();

route.get('/checkout-seesion/:orderID', bookingController.getCheckoutSeesion);
route.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);
module.exports = route;
