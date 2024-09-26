const mangoose = require('mongoose');


const CategorySchema = new mangoose.Schema({
    name: {
        type: String,
        required: [true, 'A category must have a name'],
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    }
});


const Category = mangoose.model('Categories', CategorySchema);

module.exports = Category;
