const express = require('express');
const router = express.Router();
const User = require('../models/user-model');
const Expense = require('../models/expense-model');
const Group = require('../models/group-model');
const Category = require('../models/category-model');


const path = require('path');

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'home.html'));
});

router.put('/', async (req, res) => {
    let groupId = req.session.groupId;
    let group = await Group.findOne({Name: groupId}).populate('Members');
    
    if (!group) {
        return res.status(404).json("No Bueno");
    }

    let grpMem = await group.Members.map(Member => ({
        name: Member.Username,
    }));

    console.log(grpMem);
    res.json(grpMem);
})
module.exports = router;