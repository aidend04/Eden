const express = require('express');
const router = express.Router();


router.post('/', async (req, res) => {
    res.clearCookie('session_token');
    res.redirect("localhost:3000/login");
});

module.exports = router;