const { default: mongoose } = require('mongoose');
const mangoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mangoose.Schema({
  name: {
    type: String,
  },
  firstname: {
    type: String,
    required: [true, 'A user must have a firstname'],
  },
  lastname: {
    type: String,
    required: [true, 'A user must have a lastname'],
  },
  email: {
    type: String,
    required: [true, 'A user must have a email'],
    unique: true,
    index: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    minlength: 5,
    validate: function (el) {
      return el === this.confirmPassword;
    },
    message: 'You forgot to confirm your password',
    select: false,
  },
  confirmPassword: {
    type: String,
    select: false,
    validate: function (el) {
      return el === this.password;
    },
    message: 'Passwords are not the same',
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  role: {
    type: String,
    enum: ['admin', 'Staff', 'User', 'UserWithoutAccount'],
    default: 'UserWithoutAccount',
  },
  hasUserHasAccount: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  photo: {
    type: String,
    default: 'Default.jpg',
  },
  address: {
    line1: {
      type: String,
    },
    line2: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
  },
  phoneNumber: {
    dialCode: {
      type: String,
    },
    number: {
      type: String,
    },
  },
  socialMedia: [
    {
      id: {
        type: String,
      },
      accessToken: {
        type: String,
      },
      graphDomain: {
        type: String,
      },
    },
  ],
  active: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
});
UserSchema.pre('save', function (next) {
  this.name = this.firstname + ' ' + this.lastname;
  if (this.password && this.role === 'UserWithoutAccount') {
    this.role = 'User';
    this.hasUserHasAccount = true;
  }
  next();
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await this.save({ validateBeforeSave: false });
  return resetToken;
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
