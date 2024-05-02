const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('./models/user-model');

router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ username });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
        username,
        password: hashedPassword
    });

    await newUser.save();

    res.json({ message: 'User registered successfully' });
});

module.exports = router;