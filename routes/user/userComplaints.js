const express = require('express');
const isLoggedIn = require('../../middleware');
const router = express.Router();
const crud = require('../crud');
const upload  = require('../uploadFiles');
const fileUpload = require('express-fileupload')
const path = require('path')
const request = require('request');
const userRole = require('../../isUser');


router.use(
    fileUpload({
      limits: { fileSize: 2 * 1024 * 1024 },
    })
  )


router.post('/LodgeComplaint',userRole.isUser, (req, res) => {
    res.json(req.body);
    var complaint_summary = "";
    const runRequestBody = {
        text: req.body.ComplaintBody
    };
    request.post({
        url: "http://13.233.148.244:8000/text-summarizer/",
        json: runRequestBody
    },
    function(error, response, body){
      console.log("Error", error);
      JSON.stringify(body);
      console.log("Body", body);
      complaint_summary=body.extracted_text;
      complaintData = {
          ComplaintBody: req.body.ComplaintBody,
          UID: req.session.user.idToken.payload.sub,
          type: "Salary",
          comments:[],
          ComplaintSummary: complaint_summary,
          DocName:req.body.docs,
          Idproof:req.body.Idproof,
          current_desk: 1,
          status: "Pending",
          ministry: req.body.ministry
      }
      console.log(complaintData);

      crud.insertComplaint(req.session.user.idToken.payload.sub,complaintData);
      try {
          const file = req.files.docs
          const Idproofs = req.files.Idproof
          console.log(req.files.docs);
          var filedata = file.data;
          const b64 = Buffer.from(filedata).toString('base64');
          const mimeType = 'image/png'; // e.g., image/png
          console.log(`data:${mimeType};base64,${b64}`);

          upload.uploadFilestoS3(file)
          upload.uploadFilestoS3(Idproofs)

          const fileName = new Date().getTime().toString() + path.extname(file.name)
          if (file.truncated) {
            throw new Error('File size is too big...')
          }
        } catch (error) {
        }
    });
})

router.post('/AddComment',isLoggedIn,(req,res)=>{
  console.log(req.body);
  crud.addComment(req.body.cid,req.body.uid,req.body.comment);
  res.redirect('/GetFullComplaint?cid='+req.body.cid);
})






module.exports = router;
