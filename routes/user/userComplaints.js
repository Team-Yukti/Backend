const express = require('express');
const isLoggedIn = require('../../middleware');
const router = express.Router();
const crud = require('../crud');
const upload  = require('../uploadFiles');


router.post('/LodgeComplaint',isLoggedIn, (req, res) => {
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
<<<<<<< HEAD
    crud.Insert(complaintData, 'complaints', res.session.user.idToken.payload.sub);
=======
    crud.Insert(complaintData)
    console.log(req.body);
    // upload.uploadFilestoS3(req.files.docs)
    
>>>>>>> e0077618a790ab49a6a5a1d949f931f004909424
})




module.exports = router;


