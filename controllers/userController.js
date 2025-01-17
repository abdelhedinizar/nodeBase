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
const updateUser = (req, res) => {
  console.log(req.body);
  res.status(200).send('User updated');
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
