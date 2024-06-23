const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const expenseSchema = new Schema({
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    date: {
        type: String
    },

    userPaid: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    usersOwe: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        amount: Number,
        paid: { type: Boolean, default: false }
    }],
    recur: {
        interval: {
            type: String,
        },
        nextDueDate: String
    }
});


const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;