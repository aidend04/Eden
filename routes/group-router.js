const express = require('express');
const router = express.Router();
const Group = require('./models/group-model');
const User = require('./models/user-model');
const Invite = require('./models/invite-model');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail/com',
    port: 465,
    secure: true,
    auth: {
        user: 'eden@gmail.com',
        pass: 'SEA@eden23'
    }
});

router.post('/create', async (req, res) => {
    //request from front end -- please send grpName and Adm username, and invitee emails
    const { Name, GroupAdm, invitees } = req.body;

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

    for (const invitee of invitees) {
        const newInvite = new Invite({
            group: newGroup._id
        });
    

        await newInvite.save();
        
        const mailOptions = {
            from: 'eden@gmail.com',
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

    res.json({message: 'successfully created'});
});