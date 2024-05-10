const express = require('express');
const router = express.Router();
const Group = require('../models/group-model');
const User = require('../models/user-model');
const Invite = require('../models/invite-model');
const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');
const path = require('path');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'edenbysea.adm@gmail.com',
        pass: 'tdwa fczg boku pvuq'
    }
});


router.get('/create', async (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'create-join.html'));
});
router.post('/create', async (req, res) => {
    //request from front end -- please send grpName and Adm username, and invitee emails
    const { Name, GroupAdm, invitees } = req.body;

    console.log(req.body);

    //find user
    const admUser = await User.findOne({Username: GroupAdm});


    if (!admUser) {
        console.log('hi');
        return res.status(404).send({message: 'User not found'});
    }

    if (admUser.Group){
        return res.status(400).send({message: 'Looks like you got a group'})
    }

    //creating grp
    const newGroup = new Group({
        Name: Name,
        GroupAdm: admUser._id,
        Members: [admUser._id]
    });

    try {
        await newGroup.save();
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).send({ message: 'Group name already exists.' });
            return;
        }
        throw error;
    }

    await User.updateOne({ _id: admUser._id }, { $set: { Group: newGroup._id } });

    for (const invitee of invitees) {
        const newInvite = new Invite({
            group: newGroup._id
        });
    

        await newInvite.save();
        
        const mailOptions = {
            from: 'edenbysea.adm@gmail.com',
            to: invitee,
            subject: 'Group Invitation',
            text: `You have been invited to join the group ${Name}. Please use the following code: ${newInvite._id}.
            If you don't have an account register today at: localhost:3000/register.
            Have an account? Join the group at this link: localhost:3000/group/join`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

    }

    res.json({message: 'Success'});
});

router.post('/join', async (req, res) => {
    const { code } = req.body;
    const userId = req.cookies.userId;

    //find invite

    const inv = await Invite.findOne({_id: code});

    if (!inv) {
        return res.status(404).json({message: 'Invalid invite code :('});
    };

    const grp = await Group.findOne({_id: inv.group});

    if (!grp) {
        return res.status(404).json({message: 'Cannot find group.'});
    }

    const user = await User.findOne({_id: userId});

    if (!user) {
        return res.status(404).json({message: 'User not found.'});
    }
    
    grp.Members.push(user._id);
    await grp.save();

    user.Group.push(grp._id);
    await user.save();

});

module.exports = router;