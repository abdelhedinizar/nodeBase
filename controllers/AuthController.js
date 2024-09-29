const User = require('./../models/UserModel');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRED_IN,
  });
};

exports.signup = async (req, res, next) => {
  try {
    reqUser = req.body.password
      ? {
          name: req.body.name,
          email: req.body.email,
          password: req.body.password ? req.body.password : '',
          confirmPassword: req.body.confirmPassword
            ? req.body.confirmPassword
            : '',
        }
      : {
          name: req.body.name,
          email: req.body.email,
        };
    const newUser = await User.create(reqUser);
    const token = signToken(newUser._id);
    res.status(201).json({
      status: 'success',
      data: {
        token: token,
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

exports.signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password',
      });
    }
    const user = await User.findOne({ email: email }).select('+password');
    const correct = user?.password
      ? user.correctPassword(password, user.password)
      : false;
    if (!user || !correct) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password',
      });
    }
    const token = signToken(user._id);
    return res.status(200).json({
      status: 'success',
      token,
    });
  } catch (e) {}
};
