const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A restaurant must have a name']
  },
  address: {
    type: String
  },
  phoneNumber: {
    type: String
  },
  logo: {
    type: String
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // The admin/owner of the restaurants
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);
module.exports = Restaurant;
