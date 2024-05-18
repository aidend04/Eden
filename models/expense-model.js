const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const expenseSchema = new Schema({
    amount: {
        type: Number,
        required: true
    },

    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },

    date: {
        type: Date,
        default: Date.now
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
    recurring: {
        interval: {
            type: String,
            validate: {
                validator: function(v) {
                    return ['daily', 'weekly', 'monthly', 'yearly', 'custom'].includes(v);
                },
                message: props => `${props.value} is not a valid interval!`
            }
        },
        nextDueDate: Date
    }
});

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;