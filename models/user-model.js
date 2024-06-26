const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    Username: {
        type: String,
        required: true,
        unique: true
    },

    Password: {
        type: String,
        required: true
    },

    Group: {type: Schema.Types.ObjectId, ref: 'Group'},
    
    MonthlyExpenses: [{
        month: {type: String, required: true},
        expenses: [{type: Schema.Types.ObjectId, ref: 'Expense'}]
    }],

    ByCat: 
        {
            'JUN': {
                'Dining Out': { type: Number, default: 0 },
                'Groceries': { type: Number, default: 0 },
                'Subscriptions': { type: Number, default: 0 },
                'Rent': { type: Number, default: 0 },
                'Utilities': { type: Number, default: 0 },
                'Amazon': { type: Number, default: 0 },
                'Misc': { type: Number, default: 0 }
            }
        },
    
        MonthlyAvg: {
            JAN: { type: Number, default: 0 },
            FEB: { type: Number, default: 0 },
            MAR: { type: Number, default: 0 },
            APR: { type: Number, default: 0 },
            MAY: { type: Number, default: 0 },
            JUN: { type: Number, default: 0 },
            JUL: { type: Number, default: 0 },
            AUG: { type: Number, default: 0 },
            SEP: { type: Number, default: 0 },
            OCT: { type: Number, default: 0 },
            NOV: { type: Number, default: 0 },
            DEC: { type: Number, default: 0 }
        }
});

userSchema.pre('save', async function(next) {
    const user = this;

    // Check if the password has been modified
    if (user.isModified('Password')) {
        const passwordValidationRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!passwordValidationRegex.test(user.Password)) {
            throw new Error("Password needs to be 8 characters long, contain at least 1 uppercase letter, 1 number, and a special character.");
        }

        // Hash the modified password
        user.Password = await bcrypt.hash(user.Password, 8);
    }

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;