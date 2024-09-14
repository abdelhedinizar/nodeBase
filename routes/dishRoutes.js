const express = require('express');
const {
  getAllDishs,
  createDish,
  getDishById,
  updateDish,
  deleteDish,
} = require('../controllers/dishController');
const route = express.Router();

route.route('/').get(getAllDishs).post(createDish);
route.route('/:id').get(getDishById).patch(updateDish).delete(deleteDish);

module.exports = route;
