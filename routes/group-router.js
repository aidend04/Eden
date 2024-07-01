const express = require('express');
const router = express.Router();
const Group = require('../models/group-model');
const User = require('../models/user-model');
const Invite = require('../models/invite-model');
const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');
const path = require('path');

require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


router.get('/create', async (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'create-join.html'));
});
router.post('/create', async (req, res) => {
    //request from front end -- please send grpName and Adm username, and invitee emails
    const { Name, invitees } = req.body;

    console.log(req.body);

    const GroupAdm = req.session.userId;
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
    let id = admUser._id;
    const newGroup = new Group({
        Name: Name,
        GroupAdm: admUser._id,
        Members: [admUser._id],
        WhoOwe: {id: {}}
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

    req.session.groupId = newGroup.Name;

    for (const invitee of invitees) {
        const newInvite = new Invite({
            group: newGroup._id
        });
    

        await newInvite.save();
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
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

router.post('/invite', async (req, res) => {

        console.log('this is the invite')
        let invitee = req.body.invitee;

        let grp = Group.findOne({Name: req.session.groupId})
        const newInvite = new Invite({
            group: grp._id
        });
    

        await newInvite.save();
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: invitee,
            subject: 'Group Invitation',
            text: `You have been invited to join the group ${Name}. 
            
            Please use the following code: ${newInvite._id}.

            Register today at https://expense-tracker-eden-61fb17e388cd.herokuapp.com/register!`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

    

    res.json({message: 'Success'});
})

router.post('/join', async (req, res) => {
    const { code } = req.body;
    const userId = req.session.userId;

    //find invite
    console.log(code);

    const inv = await Invite.findOne({_id: code});
    console.log(inv);

    if (!inv) {
        console.log("hi");
        return res.status(404).send({message: 'Invalid invite code'});
    };

    if (inv.used){
        await Invite.deleteOne({_id: code});
        return res.status(404).send({message: 'This code is no longer valid.'});
    } else {
        await Invite.updateOne({_id: code}, {used: true});
    }   

    const grp = await Group.findOne({_id: inv.group});

    if (!grp) {
        return res.status(404).send({message: 'Cannot find group.'});
    }

    const user = await User.findOne({Username: userId});

    if (!user) {
        return res.status(404).send({message: 'User not found.'});
    }
    
    grp.Members.push(user._id);

    await grp.save();

    grp.WhoOwe = grp.WhoOwe || {}; // Initialize WhoOwe if it doesn't exist

    for (let i = 0; i < grp.Members.length; i++) {
        const currentUserId = grp.Members[i];
        grp.WhoOwe[currentUserId] = grp.WhoOwe[currentUserId] || {}; // Initialize current user's WhoOwe if it doesn't exist

        for (let j = 0; j < grp.Members.length; j++) {
            if (i !== j) { // Ensure not adding the user owing themselves
                const otherUserId = grp.Members[j];
                grp.WhoOwe[currentUserId][otherUserId] = 0; // Assign or reset the owing amount to 0
            }
        }
    }

    await grp.save();


    await User.updateOne({Username: userId}, {Group: grp._id});

    req.session.groupId = grp.Name;

    await Invite.deleteOne({_id: code});

    return res.status(200).send({message: 'success'});

});

module.exports = router;