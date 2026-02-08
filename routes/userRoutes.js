const express = require('express');
const {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  deleteUsers,
  getGuestUser,
} = require('../controllers/userController');
const authController = require('../controllers/AuthController');

const route = express.Router();

route.post('/signup', authController.signup);
route.post('/signin', authController.signin);
route
  .route('/me')
  .get(authController.protect, authController.getMe)
  .patch(authController.protect, authController.updateMe);
route
  .route('/signinWithSocialMedia')
  .post(authController.signinWithSocialMedia);

route.post('/askResetPassword', authController.askResetPassword);
route.patch('/resetPassword/:token', authController.resetPassword);
route.param('id', (req, res, next, val) => {
  console.log(`User id is ${val}`);
  next();
});

route
  .route('/')
  .get(authController.protect, getAllUsers)
  .post(authController.protect, createUser)
  .delete(authController.protect, deleteUsers);

route.route('/guest_user').get(getGuestUser);

route
  .route('/:id')
  .get(authController.protect, getUserById)
  .patch(authController.protect, updateUser)
  .delete(authController.protect, deleteUser);

module.exports = route;
