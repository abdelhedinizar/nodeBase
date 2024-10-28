const Order = require('./../models/OrderModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSeesion = async (req, res, next) => {
  const order = await Order.findById(req.params.orderID);
  let line_items = order.dishes.map((dish) => {
    return {
      price_data: {
        currency: 'eur',
        product_data: {
          name: dish.dish.name,
        },
        unit_amount: dish.dish.price * 100,
      },
      quantity: dish.quantity ? dish.quantity : 1,
    };
  });

  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/`,
    cancel_url: `${req.protocol}://${req.get('host')}/order/${order._id}`,
    payment_method_types: ['card'],
    client_reference_id: req.params.orderID,
  });

  res.status(200).json({
    status: 'success',
    session,
  });
};
