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
};

exports.webhookCheckout = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event = req.body;

  try {
    // Verify the event by passing raw body and signature
    event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object; // Access the session object directly
      await handleCheckoutSessionCompleted(session);
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      console.log('PaymentMethod was attached to a Customer!');
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  res.json({ received: true });
};
