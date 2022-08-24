const express = require('express');
const isLoggedIn = require('../../middleware');
const crud = require('../crud');
const router = express.Router();

router.get('/approveComplaintDesk2/', (req,res)=>{
  var complaint_id = req.query.cid;
  crud.approveComplaintDesk2(complaint_id);
  return res.redirect('/Desk2Dashboard');
});

module.exports = router;
