const mongoose = require('mongoose');
const Dish = require('./dishModel');
const User = require('./UserModel');

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'An order must belong to a user'],
    },
    dishes: [
      {
        dish: {
          type: mongoose.Schema.ObjectId,
          ref: 'Dishs',
          required: [true, 'An order must have at least one dish'],
        },
        quantity: {
          type: Number,
          required: [true, 'Each dish must have a quantity'],
          min: [1, 'Quantity must be at least 1'],
        },
        price: {
          type: Number,
        },
        addedAccompaniments: [
          {
            accompaniment: {
              type: mongoose.Schema.ObjectId,
              ref: 'Accompaniment',
            },
            quantity: {
              type: Number,
              required: [true, 'Each accompaniment must have a quantity'],
              min: [1, 'Quantity must be at least 1'],
            },
            price: {
              type: Number,
            },
          },
        ],
      },
    ],
    totalPrice: {
      type: Number,
      validate: {
        validator: function (val) {
          // This validation ensures the total price is greater than 0
          return val > 0;
        },
        message: 'Total price must be greater than 0',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'inProgress', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'cash', 'paypal'],
      required: [true, 'Payment method is required'],
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    deliveryDate: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

OrderSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'dishes.dish',
    select: 'name price',
  }).populate({
    path: 'user',
    select: 'name email role',
  });
  next();
});

OrderSchema.pre('save', async function (next) {
  try {
    await this.populate({
      path: 'dishes.dish',
      select: 'price', // Select only the price field
    });
    this.dishes.forEach((dish) => {
      dish.price = dish.dish.price * dish.quantity;
      if (dish.addedAccompaniments) {
        dish.price += dish.addedAccompaniments.reduce((acc, ac) => {
          return acc + ac.price * ac.quantity;
        }, 0);
      }
    });

    this.totalPrice = this.dishes.reduce((acc, item) => {
      return acc + item.price;
    }, 0);
    next();
  } catch (err) {
    next(err);
  }
});

const Order = mongoose.model('Orders', OrderSchema);
module.exports = Order;
