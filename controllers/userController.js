const User = require('./../models/UserModel');
const APIFeatures = require('./../utils/APIFeatures');

const getAllUsers = async (req, res) => {
  try {
    const features = new APIFeatures(User.find(), req.query)
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

const getUserById = (req, res) => {
  res.status(200).send(`User with id ${req.params.id}`);
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

const updateDish = async (req, res) => {
  try {
    const dish = await Dish.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        dish,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

const deleteUser = (req, res) => {
  res.status(204).send('User deleted');
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
};
