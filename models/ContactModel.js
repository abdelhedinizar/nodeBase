const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A contact must have a name'],
  },
  companyName: {
    type: String,
    required: [true, 'A contact must have a company name'],
  },
  email: {
    type: String,
    required: [true, 'A contact must have an email'],
    validate: {
      validator: function (val) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val); // Basic email validation
      },
      message: 'Please provide a valid email address',
    },
  },
  phone: {
    type: String,
    required: [true, 'A contact must have a phone number'],
  },
  companySize: {
    type: String
  },
  message: {
    type: String,
    required: [true, 'A contact must have a message'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Contact = mongoose.model('Contacts', ContactSchema);

module.exports = Contact;
