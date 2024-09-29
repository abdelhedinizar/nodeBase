const { default: mongoose } = require('mongoose');
const mangoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new mangoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a Name'],
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
  role: {
    type: String,
    enum: ['admin', 'Responsable', 'User', 'UserWithoutAccount'],
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
});
UserSchema.pre('save', function (next) {
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

const User = mongoose.model('User', UserSchema);
module.exports = User;
