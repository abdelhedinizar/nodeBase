const express = require('express');
const {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const route = express.Router();

route.route('/').get(getAllUsers).post(createUser);
route.route('/:id').get(getUserById).patch(updateUser).delete(deleteUser);

module.exports = route;
