const User = require('../models/UserModel');
const Order = require('./../models/OrderModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

exports.getCheckoutSeesion = async (req, res, next) => {
  const order = await Order.findById(req.params.orderID);
  let line_items = order.dishes.flatMap((dish) => {
    const dishLineItem = {
      price_data: {
        currency: 'eur',
        product_data: {
          name: dish.dish.name,
        },
        unit_amount: dish.dish.price * 100,
      },
      quantity: dish.quantity || 1,
    };

    // Map accompaniments (supplements) to line items
    const accompanimentLineItems = dish.addedAccompaniments.map(
      (accompaniment) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: accompaniment.name,
          },
          unit_amount: accompaniment.price * 100,
        },
        quantity: accompaniment.quantity || 1,
      })
    );
    return [dishLineItem, ...accompanimentLineItems];
  });

  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: 'payment',
    success_url: `${process.env.FRONT_URL}/dashboard/basket/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONT_URL}/dashboard/basket/detail`,
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
  if (!order) {
    console.error('Order not found for session:', session.id);
    return;
  }
  const user = await User.findById(order.user._id);
  if (!user) {
    console.error('User not found for order:', order._id);
  }
  if (user && (user.address.line1 === undefined || user.address.line1 === '')) {
    const address = session.customer_details.address;
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          'address.line1': address.line1,
          'address.line2': address.line2,
          'address.city': address.city,
          'address.state': address.state,
          'address.country': address.country,
        },
      }
    );
  }
  const paymentIntent = await stripe.paymentIntents.retrieve(
    session.payment_intent
  );
  const paymentMethod = await stripe.paymentMethods.retrieve(
    paymentIntent.payment_method
  );
  const lastFourDigits = paymentMethod.card.last4;

  await Order.updateOne(
    { _id: order._id },
    {
      $set: {
        paymentStatus: 'paid',
        status: 'inProgress',
        cardLast4: lastFourDigits,
      },
    }
  );
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
