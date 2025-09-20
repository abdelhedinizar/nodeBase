const express = require('express');
const {
  getAllDishs,
  createDish,
  getDishById,
  updateDish,
  deleteDish,
} = require('../controllers/dishController');
const { optionalAuth } = require('../controllers/AuthController');
const route = express.Router();

route.route('/')
  .get(optionalAuth, getAllDishs)
  .post(createDish);

route.route('/:id')
  .get(optionalAuth, getDishById)
  .patch(updateDish)
  .delete(deleteDish);

module.exports = route;
