const express = require('express');
const isLoggedIn = require('../../middleware');
const router = express.Router();
const crud = require('../crud');
const upload  = require('../uploadFiles');
const fileUpload = require('express-fileupload')
const path = require('path')
router.use(
    fileUpload({
      limits: { fileSize: 2 * 1024 * 1024 },
    })
  )
  


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
    
    
    try {
        const file = req.files.docs
        console.log(req.files.docs);  
        console.log(file)
        upload.uploadFilestoS3(file)
        const fileName = new Date().getTime().toString() + path.extname(file.name)
        if (file.truncated) {
          throw new Error('File size is too big...')
        }
        
      } catch (error) {
      }

      

})

router.get('/GetFullComplaint',(req,res)=>{
    
})

router.post('/AddComment',(req,res)=>{

})




module.exports = router;


