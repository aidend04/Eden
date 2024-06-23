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
        required: true,
        validate: {
            validator: function(v) {
                return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(v);
            },

            message: props => "Password needs to be 8 characters long, contain at least 1 uppercase letter, 1 number, and a special character."
        }
    },

    Group: {type: Schema.Types.ObjectId, ref: 'Group'},
    
    MonthlyExpenses: [{
        month: {type: String, required: true},
        expenses: [{type: Schema.Types.ObjectId, ref: 'Expense'}]
    }]
});

userSchema.pre('save', async function(next) {
    const user = this;

    if (user.isModified('Password')){
        user.Password = await bcrypt.hash(user.Password, 8);
    }

    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User;