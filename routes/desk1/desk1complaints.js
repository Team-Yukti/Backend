const express = require('express');
const isLoggedIn = require('../../middleware');
const crud = require('../crud');
const router = express.Router();

router.post('/UpdateComplaint', (req,res)=>{
  var complaint_id = req.body.id;
  var ministry = req.body.ministry;
  var type = req.body.type;
  crud.updateComplaint(complaint_id, {ministry: ministry, type: type});
  return res.status(200).send({"message": "Success"});
});

// router.get('/approveComplaintDesk1/', (req,res)=>{
//   var complaint_id = req.query.cid;
//   crud.approveComplaintDesk1(complaint_id);
//   var user_id;
//
//   crud.addComment(complaint_id,req.body.uid,"Initial processing of complaint done.");
//   return res.redirect('/Desk1Dashboard');
// });
//
// router.get('/rejectComplaint/', (req,res)=>{
//   var complaint_id = req.query.cid;
//   crud.rejectComplaint(complaint_id);
//   return res.redirect('/Desk1Dashboard');
// })

module.exports = router;
