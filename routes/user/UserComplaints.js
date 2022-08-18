const express = require('express');
const isLoggedIn = require('../../middleware');
const router = express.Router();


router.post('/LodgeComplaint',isLoggedIn, (req, res) => {
    res.json(req.body);
})

module.exports = router;