const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
    Name: {
        type: String,
        required: true,
        unique: true
    },

    GroupAdm: {type: Schema.Types.ObjectId, ref: 'User'},

    Members: [{type: Schema.Types.ObjectId, ref: 'User'}],

    Categories: [{type: Schema.Types.ObjectId, ref: 'Category'}],

    MonthlyExpenses: [{
        month: {type: String, required: true},
        expenses: [{type: Schema.Types.ObjectId, ref: 'Expense'}]
    }],

    WhoOwe: {
    }
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;

