const User = require('./../models/UserModel');
const APIFeatures = require('./../utils/APIFeatures');
const { signToken } = require('./../utils/jwt');

const getAllUsers = async (req, res) => {
  try {
    const features = new APIFeatures(
      User.find().where({ isDeleted: { $ne: true } }),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const users = await features.query;
    res.status(200).json({
      status: 'success',
      length: users.length,
      data: { users },
    });
  } catch (e) {
    res.status(400).json({
      status: 'fail',
      message: e,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      length: user ? 1 : 0,
      data: { user },
    });
  } catch (e) {
    res.status(400).json({
      status: 'error',
      message: e,
    });
  }
};

const createUser = async (req, res) => {
  try {
    reqUser = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: req.body.password ? req.body.password : '',
      confirmPassword: req.body.confirmPassword ? req.body.confirmPassword : '',
      role: req.body.role ? req.body.role : 'User',
      address: req.body.address ? req.body.address : {},
      phoneNumber: req.body.phoneNumber ? req.body.phoneNumber : undefined,
    };
    const newUser = await User.create(reqUser);
    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
      },
    });
  } catch (e) {
    res.status(400).json({
      status: 'fail',
      message: e,
    });
  }
};
const updateUser = async (req, res) => {
  try {
    const updateFields = {};
    if (req.body.role) updateFields.role = req.body.role;
    if (req.body.photo) updateFields.photo = req.body.photo;
    if (req.body.address) updateFields.address = req.body.address;
    if (req.body.phoneNumber) updateFields.phoneNumber = req.body.phoneNumber;

    const user = await User.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (e) {
    res.status(400).json({
      status: 'fail',
      message: e,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
      },
      {
        new: true,
        runValidators: false,
      }
    );
    res.status(204).json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

const deleteUsers = async (req, res) => {
  try {
    const ids = req.body.ids;
    const users = await User.updateMany(
      { _id: { $in: ids } },
      { isDeleted: true }
    );
    res.status(204).json({
      status: 'success',
      message: 'Users deleted successfully',
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

const getGuestUser = async (req, res) => {
  try {
    const guestUser = await User.findOne({ name: 'Guest User' });
    res.status(200).json({
      status: 'success',
      data: { user: guestUser,
        token: signToken(guestUser._id)
       },
    });
  } catch (e) {
    res.status(400).json({
      status: 'fail',
      message: e,
    });
  }
};

const getUserByEmail = (req, res) => {
  if (!req.email) {
    res.status(400).send('Please provide an email');
  }
  const user = User.findOne({ email: req.email });
  if (!user) {
    res.status(404).send('User not found');
  }
  res.status(200).send(user);
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  deleteUsers,
  getGuestUser,
};
