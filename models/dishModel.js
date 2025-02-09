const mangoose = require('mongoose');
const Category = require('./../models/CategoryModel');

const DishSchema = new mangoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A dish must have a name'],
    },
    ingredients: {
      type: String,
      required: [true, 'A dish must have ingredients'],
    },
    category: {
      type: String,
      required: [true, 'A dish must have a category'],
      validate: async function (val) {
        const cat = await Category.find().where('name').equals(val);
        return cat.length !== 0;
      },
    },
    image: {
      type: String,
      required: [true, 'A dish must have an image'],
    },
    price: {
      type: Number,
      required: [true, 'A dish must have a price'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    priceDiscount: Number,
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    PreparationTime: {
      type: Number,
    },
    SpiceLevel: {
      type: Number,
      default: 1,
    },
    Accompaniments: [
      {
        name: {
          type: String,
          required: [true, 'An accompaniment must have a name'],
        },
        price: {
          type: Number,
          required: [true, 'An Accompaniment must have a price'],
        },
        inputType: {
          type: String,
          enum: ['radio', 'checkbox'],
          default: 'radio',
        },
        AccompanimentsTitle: {
          type: String,
          default: 'Accompaniment of your choice',
        },
        AccompanimentsDescription: {
          type: String,
          default: 'Choose what you want',
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
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/*
// run before .save() and .create()
DishSchema.pre('save', function (next) {
  console.log('Before Save Call');
  next();
});

// run after .save() and .create()
DishSchema.post('save', function (doc, next) {
  console.log('After Save Call');
  next();
});

DishSchema.pre('find', function (next) {
  console.log('Before Find Call');
  next();
});

*/

const Dish = mangoose.model('Dishs', DishSchema);

module.exports = Dish;
