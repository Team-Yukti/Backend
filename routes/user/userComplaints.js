const express = require('express');
const isLoggedIn = require('../../middleware');
const router = express.Router();
const crud = require('../crud');
const upload  = require('../uploadFiles');


router.post('/LodgeComplaint', (req, res) => {
    res.json(req.body);
    complaintData = {
        Name: req.body.Name,
        Age: req.body.Age,
        Date: req.body.Date,
        Gender: req.body.Gender,
        Address: req.body.Address,
        State: req.body.State,
        City: req.body.City,
        Mobile: req.body.Mobile,
        ComplaintBody: req.body.ComplaintBody,
        UID: req.session.user.idToken.payload.sub
    }
    console.log(complaintData);
    var today = new Date();
    console.log(today.getTime());

    crud.insertComplaint(req.session.user.idToken.payload.sub,complaintData,today.getTime());
})




module.exports = router;


