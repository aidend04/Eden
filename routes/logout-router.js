const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {

    req.session.destroy(function(err) {
        if(err){
            console.log(err);
        } else {
            res.json('logged out')
        }
    });
});

module.exports = router;