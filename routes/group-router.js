const express = require('express');
const router = express.Router();
const Group = require('./models/group-model');
const User = require('./models/user-model');

router.post('/create', async (req, res) => {
    //request from front end -- please send grpName and Adm username
    const { Name, GroupAdm } = req.body;

    //find user
    const admUser = await User.findOne({username: GroupAdm});

    if (!admUser) {
        return res.status(404).json({message: 'User not found'});
    }

    //creating grp
    const newGroup = new Group({
        Name: Name,
        GroupAdm: admUser._id,
        Members: [admUser._id]
    });

    await newGroup.save();

    admUser.groups.push(newGroup._id);
    await admUser.save();

    res.json({message: 'successfully created'});
});