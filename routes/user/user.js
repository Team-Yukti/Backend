const express = require('express');
const router = express.Router();
const userRole = require('../../isUser');

router.get('/ViewProfile',userRole.isUser,(req,res)=>{
    // console.log(req.session.user.idToken);
    res.render('user/viewprofile',{userData:req.session.user.idToken})
})

router.post('/EditUser', userRole.isUser, async (req, res) => {
    const params = {
        UserPoolId: "ap-south-1_9ErMvHoXm",
        Username: req.session.user.idToken.payload.email,
        UserAttributes: [
            {
                Name: "email",
                Value: req.body.Email
            },
            {
                Name: "email_verified",
                Value: "false"
            },
            {
                Name: "name",
                Value: req.body.Name
            },
            {
                Name: "phone_number",
                Value: req.body.Mobile
            },
            {
                Name: "gender",
                Value: req.body.Gender
            },
            {
                Name: "custom:aadhar",
                Value: req.body.Aadhar
            },
            {
                Name: "address",
                Value: req.body.Address
            },
            {
                Name: "custom:city",
                Value: req.body.City
            },
            {
                Name: "custom:state",
                Value: req.body.State
            },
            {
                Name: "custom:country",
                Value: req.body.Country
            },
            {
                Name: "custom:pincode",
                Value: req.body.Pincode
            }
        ],
    };
    const cognitoClient = new AWS.CognitoIdentityServiceProvider();
    await cognitoClient.adminUpdateUserAttributes(params).promise().then(data => {
        res.redirect("/Login");
    }).catch(err => {
        res.send(err);
    });
});

module.exports = router;
