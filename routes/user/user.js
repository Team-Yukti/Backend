const express = require('express');
const isLoggedIn = require('../../middleware');
const router = express.Router();

router.get('/ViewProfile',isLoggedIn,(req,res)=>{
    // console.log(req.session.user.idToken);
    res.render('user/viewprofile',{userData:req.session.user.idToken})
})

router.post('/UpdateUserProfile',isLoggedIn, (req, res) => {
    var attributeList = [];
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"name",Value:req.body.name}));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"preferred_username",Value:req.body.addhar}));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"phone_number",Value:req.body.phone}));
    userPool.updateUserAttributes(req.session.user.idToken.payload.email, attributeList, function(err, result){
        if (err) {
            console.log(err);
            return;
        }
        res.json(result);
        console.log('user name is ' + result.user.getUsername());
    });
})

module.exports = router;
