const express = require('express');
const {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} = require('../controllers/contactController');

const route = express.Router();

// Define routes for contacts
route.route('/').get(getAllContacts).post(createContact);
route
  .route('/:id')
  .get(getContactById)
  .patch(updateContact)
  .delete(deleteContact);

module.exports = route;