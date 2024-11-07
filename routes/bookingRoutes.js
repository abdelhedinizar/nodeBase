const express = require('express');
const bookingController = require('../controllers/bookingController');

const route = express.Router();
const bodyParser = require('body-parser');

route.get(
  '/checkout-seesion/:orderID',
  express.json(),
  bookingController.getCheckoutSeesion
);
route.post(
  '/webhook',
  bodyParser.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);
module.exports = route;
