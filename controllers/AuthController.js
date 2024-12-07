const User = require('./../models/UserModel');
const jwt = require('jsonwebtoken');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');

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

exports.signinWithSocialMedia = async (req, res) => {
  let user = req.body;
  // check if the user already exists
  const existingUser = await User.findOne({ email: user.email });
  if (existingUser) {
    // update the user with the new social media info
    const existingIndex = existingUser.socialMedia.findIndex(
      (sm) => sm.id === user.id && sm.graphDomain === user.graphDomain
    );
    if (existingIndex !== -1) {
      // Update the existing social media element
      existingUser.socialMedia[existingIndex] = {
        id: user.id,
        accessToken: user.accessToken,
        graphDomain: user.graphDomain,
      };
    } else {
      // Add the new social media element
      existingUser.socialMedia = [
        ...existingUser.socialMedia,
        {
          id: user.id,
          accessToken: user.accessToken,
          graphDomain: user.graphDomain,
        },
      ];
    }
    existingUser.photo = await user.picture.data.url;
    await existingUser.save();
    const token = signToken(existingUser._id);
    return res.status(200).json({
      status: 'success',
      token,
    });
    // create a new user if the user doesn't exist
    // create a new user with the social media info
  } else {
    user = await User.create({
      name: user.name,
      email: user.email,
      role: 'User',
      socialMedia: [
        {
          id: user.id,
          accessToken: user.accessToken,
          graphDomain: user.graphDomain,
        },
      ],
    });
    const token = await signToken(user._id);
    return res.status(201).json({
      status: 'success',
      token,
    });
  }
};

exports.askResetPassword = async function (req, res) {
  try {
    // Step 1: Get user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }
    // Step 2: Generate random password and hash it
    const resetToken = await user.createPasswordResetToken();
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) have requested a password reset for your account.\n\nPlease click on the following link to reset your password:\n\n${resetURL}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`;

    await sendEmail({
      email: user.email,
      subject: 'Password reset valid for 10 minutes',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Reset password email sent',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.resetPassword = async function (req, res) {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json({
      status: 'fail',
      message: 'Token is invalid or expired',
    });
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  const token = signToken(user._id);
  return res.status(200).json({
    status: 'success',
    token,
  });
};
