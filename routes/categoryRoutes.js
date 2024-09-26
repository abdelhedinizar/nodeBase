const express = require('express');
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const route = express.Router();

route.route('/').get(getAllCategories).post(createCategory);
route
  .route('/:id')
  .get(getCategoryById)
  .patch(updateCategory)
  .delete(deleteCategory);

module.exports = route;
