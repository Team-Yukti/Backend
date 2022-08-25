const express = require('express');
const isLoggedIn = require('../../middleware');
const router = express.Router();
const crud = require('../crud');
const upload = require('../uploadFiles');
const fileUpload = require('express-fileupload')
const path = require('path')
const request = require('request');
const userRole = require('../../isUser');
const AWS = require('aws-sdk');



router.use(
  fileUpload({
    limits: { fileSize: 2 * 1024 * 1024 },
  })
)


router.post('/LodgeComplaint', userRole.isUser, (req, res) => {
  console.log("Lodge Complaint");
  var complaint_summary = "";
  if(req.body.ComplaintBody == ""){
    complaint_body = "We celebrate Independence Day as the national festival of India. The Day marks\nthe anniversary of national independence from the British Empire on 15th august\n1947. Furthermore, it is the most auspicious day for the people of India because\nIndia becomes independent after lots of hardships and sacrifices of the brave\nIndian freedom fighters. The entire nation celebrates this day with the full spirit of\n\npatriotism.\n"
  }
  const runRequestBody = {
    text: req.body.ComplaintBody
  };

  request.post({
    url: "http://13.233.148.244:8000/text-summarizer/",
    json: runRequestBody
  },
    function (error, response, body) {
      console.log("Error", error);
      JSON.stringify(body);
      console.log("Body", body);
      complaint_summary = body.extracted_text;
      complaintData = {
        ComplaintBody: req.body.ComplaintBody,
        UID: req.session.user.idToken.payload.sub,
        Employer: req.body.Employer,
        type: req.body.type,
        comments: [],
        ComplaintSummary: complaint_summary,
        // complaint_file: req.files.complaint_file.name,
        additional_file: req.files.additional_file.name,
        current_desk: 1,
        status: "Pending",
        ministry: req.body.ministry
      }

      const file = req.files.complaint_file;
      const file1 = req.files.additional_file;
      console.log(file);
      try {
        if(file != null){
          upload.uploadFilestoS3(file,req.session.user.idToken.payload.sub);
        }
        if(file1 != null){
          upload.uploadFilestoS3(file1,req.session.user.idToken.payload.sub);
        }
        console.log(file);
      } catch (error) {
      }

      // crud.insertComplaint(req.session.user.idToken.payload.sub, complaintData, req.files.complaint_file,  req.files.additional_file);
      res.redirect('/Dashboard');
    });
})


router.post('/AddComment', isLoggedIn, (req, res) => {
  if(req.session.user.idToken.payload["custom:role"]=="user"){
    crud.addComment(req.body.cid, req.session.user.idToken.payload.sub, req.body.comment);
    res.redirect('/GetFullComplaint?cid=' + req.body.cid);
  }
  else if(req.session.user.idToken.payload["custom:role"]=="desk1"){
    crud.addComment(req.body.cid, req.session.user.idToken.payload.sub, req.body.comment, "desk1");
    res.redirect('/GetFullComplaintAdmin1?cid=' + req.body.cid);
  }
  else if(req.session.user.idToken.payload["custom:role"]=="desk2"){
    crud.addComment(req.body.cid, req.session.user.idToken.payload.sub, req.body.comment, "desk2");
    res.redirect('/GetFullComplaintAdmin2?cid=' + req.body.cid);
  }
})






module.exports = router;
