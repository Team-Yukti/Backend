const express = require('express');
const isLoggedIn = require('../../middleware');
const router = express.Router();
const crud = require('../crud');
const upload  = require('../uploadFiles');


router.post('/LodgeComplaint', (req, res) => {
    res.json(req.body);
    complaintData = {
        Name: {S:req.body.Name},
        Age: {S:req.body.Age},
        Date: {S:req.body.Date},
        Gender: {S:req.body.Gender},
        Address: {S:req.body.Address},
        State: {S:req.body.State},
        City: {S:req.body.City},
        Mobile: {S:req.body.Mobile},
        ComplaintBody: {S:req.body.ComplaintBody}
    }
    console.log(complaintData);

    crud.insertItem(complaintData, 'complaints', req.session.user.idToken.payload.sub);
    
})




module.exports = router;


