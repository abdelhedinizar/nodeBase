const express = require('express');
const {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
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

route.route('/').get(getAllUsers).post(authController.protect, createUser);
route.route('/:id').get(getUserById).patch(updateUser).delete(deleteUser);

module.exports = route;
