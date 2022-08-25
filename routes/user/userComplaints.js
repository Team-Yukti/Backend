const express = require('express');
const isLoggedIn = require('../../middleware');
const router = express.Router();
const crud = require('../crud');
const upload = require('../uploadFiles');
const fileUpload = require('express-fileupload')
const path = require('path')
const request = require('request');
const userRole = require('../../isUser');


router.use(
  fileUpload({
    limits: { fileSize: 2 * 1024 * 1024 },
  })
)


router.post('/LodgeComplaint', userRole.isUser, (req, res) => {
  console.log("Lodge Complaint");
  var complaint_summary = "";
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
        type: "Salary",
        comments: [],
        ComplaintSummary: complaint_summary,
        // DocName:req.body.docs,
        Idproof: req.body.Idproof,
        current_desk: 1,
        status: "Pending",
        ministry: req.body.ministry
      }
      console.log(complaintData);

      crud.insertComplaint(req.session.user.idToken.payload.sub, complaintData, req.files.docs,  req.files.Idproof);
      res.json(req.body )
    });
})

router.post('/AddComment', isLoggedIn, (req, res) => {
  console.log(req.body);
  crud.addComment(req.body.cid, req.body.uid, req.body.comment);
  res.redirect('/GetFullComplaint?cid=' + req.body.cid);
})






module.exports = router;
