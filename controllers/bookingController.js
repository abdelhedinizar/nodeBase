const Order = require('./../models/OrderModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

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
    success_url: `${process.env.FRONT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONT_URL}/order-cancelled`,
    payment_method_types: ['card'],
    client_reference_id: req.params.orderID,
  });

  order.sessionId = session.id;
  await order.save();

  res.status(200).json({
    status: 'success',
    session,
  });
};
handleCheckoutSessionCompleted = async (session) => {
  const order = await Order.findOne({ sessionId: session.id });
  if (order) {
    order.paymentStatus = 'paid';
    order.status = 'inProgress';
    await order.save();
  }
  res.sendStatus(200);
};

exports.webhookCheckout = async (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event = req.body;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleCheckoutSessionCompleted(session);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({ received: true });
};
