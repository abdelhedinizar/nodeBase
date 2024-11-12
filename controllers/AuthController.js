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
    let correct = user?.password
      ? await user.correctPassword(password, user.password)
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

exports.protect = async (req, res, next) => {
  try {
    // 1. Check if token exists
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to access.',
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'fail',
      message: 'Invalid token or token has expired',
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};
