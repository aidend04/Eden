const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uuid = require('uuid');

const inviteSchema = new Schema ({
    _id: {
        type: String,
        required: true,
        default: () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
            let result = '';
            for (let i = 0; i < 4; i++) {
                result += chars[Math.floor(Math.random() * chars.length)];
            }
            return result;
        }
    },

    group: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },

    used: {
        type: Boolean,
        default: false
    }

});

module.exports = mongoose.model('Invite', inviteSchema);