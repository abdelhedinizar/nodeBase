const express = require('express');
const {
  getAllRestaurants,
  createRestaurant,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
} = require('../controllers/restaurantController');
const route = express.Router();

route.route('/')
  .get(getAllRestaurants)
  .post(createRestaurant);

route.route('/:id')
  .get(getRestaurantById)
  .patch(updateRestaurant)
  .delete(deleteRestaurant);

module.exports = route;
