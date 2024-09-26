const mangoose = require('mongoose');
const validator = require('validator');


const UserSchema = new mangoose.Schema({
    FirstName: {
        type: String,
        required: [true, 'A user must have a first name'],
    },
    LastName: {
        type: String,
        required: [true, 'A user must have a last name']
    },
    Email: {
        type: String,
        required: [true, 'A user must have a email'],
        validate: validator.isEmail
    },
    Password: {
        type: String,
    },
    Role: {
        type: String,
        enum: ['admin', 'Responsable','User','UserWithoutAccount'],
        default: 'UserWithoutAccount'
    },
    HasUserHasAccount: {
        type: Boolean,
        default: false
    }
});
