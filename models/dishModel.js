const mangoose = require('mongoose');

const DishSchema = new mangoose.Schema({
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
});

const Dish = mangoose.model('Dishs', DishSchema);

module.exports = Dish;
