const express = require('express');
const isLoggedIn = require('../../middleware');
const router = express.Router();
const crud = require('../../crud');


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
    }
    crud.Insert(complaintData)
})




module.exports = router;


