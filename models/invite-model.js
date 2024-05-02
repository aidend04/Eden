const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uuid = require('uuid');

const inviteSchema = new Schema ({
    _id: {
        type: String,
        required: true,
        default: () => uuid.v4()
    },

    group: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    }

});

module.exports = mongoose.model('Invite', inviteSchema);