const express = require('express');
const isLoggedIn = require('../../middleware');
const router = express.Router();
const crud = require('../crud');
const upload  = require('../uploadFiles');
const fileUpload = require('express-fileupload')
const path = require('path')
const request = require('request');


router.use(
    fileUpload({
      limits: { fileSize: 2 * 1024 * 1024 },
    })
  )


router.post('/LodgeComplaint', (req, res) => {
    res.json(req.body);
    var complaint_summary = "";
    const runRequestBody = {
        text: req.body.ComplaintBody
    };
    request.post({
        url: "http://127.0.0.1:8000/text-summarizer/",
        json: runRequestBody
    },
    function(error, response, body){
      console.log("Error", error);
      JSON.stringify(body);
      console.log("Body", body);
      complaint_summary=body.extracted_text;
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
          UID: req.session.user.idToken.payload.sub,
          type: "Salary",
          ComplaintSummary: complaint_summary,
          current_desk: 1
      }
      console.log(complaintData);

      crud.insertComplaint(req.session.user.idToken.payload.sub,complaintData);
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
    });
})


router.post('/AddComment',(req,res)=>{
  console.log(req.body);
  crud.addComment(req.body.cid,req.body.uid,req.body.comment);
  res.redirect('/GetFullComplaint?cid='+req.body.cid);
})




module.exports = router;
