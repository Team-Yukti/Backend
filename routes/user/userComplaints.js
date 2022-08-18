const express = require('express');
const isLoggedIn = require('../../middleware');
const router = express.Router();

router.get('/RegisterComplaint', (req, res) => {
    res.render('user/complaintRegistration');
})
router.post('/LodgeComplaint', (req, res) => {
    res.json(req.body);
})

module.exports = router;