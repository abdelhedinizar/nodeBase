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
  image: {
    type: String,
    required: [true, 'A dish must have an image'],
  },
  price: {
    type: Number,
    required: [true, 'A dish must have a price'],
  },
});

const Dish = mangoose.model('Dishs', DishSchema);

module.exports = Dish;
