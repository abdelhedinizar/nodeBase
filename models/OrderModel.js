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
    restaurant: {
      type: mongoose.Schema.ObjectId,
      ref: 'Restaurant'
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
            name: {
              type: String,
              required: [true, 'A size must have a name'],
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
        size: [
          {
            name: {
              type: String,
              required: [true, 'A size must have a name'],
            },
            price: {
              type: Number,
              required: [true, 'A size must have a price'],
            },
            inputType: {
              type: String,
              enum: ['radio', 'checkbox'],
              default: 'radio',
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
    sessionId: String,
    sequenceNumber: { type: Number },
    status: {
      type: String,
      enum: [
        'pending',
        'inProgress',
        'Processing',
        'Dispatched',
        'completed',
        'cancelled',
      ],
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
    cardLast4: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
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
    select: 'name price image',
  }).populate({
    path: 'user',
    select: 'name email role address',
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
      const accompanimentsPrice = dish.addedAccompaniments.reduce((acc, ac) => {
        return acc + ac.price * ac.quantity;
      }, 0);
      dish.price =
        ((dish.size ? dish.dish.price + dish.size?.price : dish.dish.price) +
          accompanimentsPrice) *
        dish.quantity;
    });

    this.totalPrice = this.dishes.reduce((acc, item) => {
      return acc + item.price;
    }, 0);
    next();
  } catch (err) {
    next(err);
  }
});

// Pre-save middleware to update completedAt if status changes to completed
/*OrderSchema.pre(/^find/, function (next) {
  if (this.isModified('status') && this.status === 'completed') {
    this.completedAt = Date.now();
  }
  next();
});
*/
const Order = mongoose.model('Orders', OrderSchema);
module.exports = Order;
