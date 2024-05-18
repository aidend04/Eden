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

module.exports = router;