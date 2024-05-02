const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    defaultChoices: {
        type: [String],
        default: ['Groceries', 'Rent', 'Utilities', 'Dining Out', 'Entertainment', 'Subscription', 'Other']
    }
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;