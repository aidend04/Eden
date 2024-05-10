const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require("../models/user-model");
const Group = require("../models/group-model");
const path = require('path');


router.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

router.post('/', async (req, res) => {
    const { username, password } = req.body;

    console.log(req.body);

    const user = await User.findOne({Username: username});

    if (!user){
        return res.status(404).send({message: 'User not found'});
    }

    const validPass = await bcrypt.compare(password, user.Password);

    if (!validPass){
        return res.status(400).send({message: 'Incorrect password' });
    }

    const grp = await Group.findOne(user.Group);

    if (grp){
        return res.status(200).send({message: `${grp.Name}`});
    } else {
        return res.status(200).send({message: 'No group'});
    }
});

module.exports = router;