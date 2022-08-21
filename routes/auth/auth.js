const express = require('express');
const router = express.Router();
const crud = require('../crud');
const session = require('express-session');
const cookieParser = require('cookie-parser');
// Express Session has started

router.use(cookieParser());
router.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
// Express Session has ended



// AWS conginto Authentication declaration starts here

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');
const request = require('request');
const e = require('express');
const { json } = require('body-parser');
global.fetch = require('node-fetch');

const poolData = {
    UserPoolId: "ap-south-1_9ErMvHoXm", // Your user pool id here
    ClientId: "521l6du1g1tn6pdbrt7j2ounqr" // Your client id here
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

// AWS conginto Authentication declaration end here

router.post('/Signup', (req, res) => {

    var attributeList = [];
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "name", Value: req.body.name }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "phone_number", Value: req.body.phone }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "gender", Value: req.body.gender }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "custom:aadhar", Value:req.body.aadhar }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "custom:age", Value: req.body.age }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "address", Value: req.body.address }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "custom:city", Value: req.body.city }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "custom:state", Value: req.body.state }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "custom:country", Value: req.body.country }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "custom:pincode", Value: req.body.pincode }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "custom:role", Value: "user" }));


    userPool.signUp(req.body.email, req.body.password, attributeList, null, function (err, result) {
        if (err) {
            res.send(err);
            return;
        }
        else {
            cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
            console.log(JSON.stringify(cognitoUser));
            res.redirect('/ConfirmOTP?email=' + req.body.email);
        }

    });
});


router.post('/Login', (req, res) => {
    console.log("In Login");
    var authenticationData = {
        Username: req.body.email, // your username here
        Password: req.body.password, // your password here
    };
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    var userData = {
        Username: req.body.email, // your username here
        Pool: userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            req.session.user = result;

            if(result.idToken.payload["custom:role"] == "user"){
              userData = {
                  Email: result.idToken.payload.email,
                  Aadhar: result.idToken.payload["custom:aadhar"],
                  Name: result.idToken.payload.name,
                  Age: result.idToken.payload["custom:age"],
                  Phone: result.idToken.payload.phone_number,
                  Gender: result.idToken.payload.gender,
                  Address: result.idToken.payload.address,
                  State: result.idToken.payload["custom:state"],
                  City: result.idToken.payload["custom:city"],
                  Pincode: result.idToken.payload["custom:pincode"],
                  Country: result.idToken.payload["custom:country"],
                  Role: result.idToken.payload["custom:role"],
              }
            }
            else{
              userData = {
                  Email: result.idToken.payload.email,
                  Name: result.idToken.payload.name,
                  Gender: result.idToken.payload.gender,
                  Role: result.idToken.payload["custom:role"],
                  Ministry: result.idToken.payload["custom:ministry"]
              }
            }
            crud.checkFirstTimeLogin(userData, result.idToken.payload.sub)

            res.send(req.session.user);
            console.log("Login Success");
        },
        onFailure: function (err) {
            console.log("Login Failure");
            console.log(err);
            if (err.code === 'UserNotConfirmedException') {
                console.log("Not Verified");
                res.redirect('/ConfirmOTP?email=' + req.body.email);
            } else {

                console.log("User Not Found");

                res.json(err);
            }
        }
    });

})

router.post('/ConfirmUser', (req, res) => {
    console.log(req.body.email)
    console.log(req.body.code)

    var userData = {
        Username: req.body.email, // your username here
        Pool: userPool
    };
    console.log(userPool);
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.confirmRegistration(req.body.code, true, function (err, result) {
        if (err) {
            res.json(err);
            return;
        }
        else
        {
            console.log("User Confirmed");
            res.json(result);
        }
    }
    );
})

//forgot password
router.post('/ForgotPassword', (req, res) => {
    console.log(req.body.email)
    var userData = {
        Username: req.body.email, // your username here
        Pool: userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.forgotPassword({
        onSuccess: function (result) {
            console.log('Forgot Password Success => \n');
            res.redirect('/ConfirmPassword?email=' + req.body.email);
        }
        ,
        onFailure: function (err) {
            console.log('Forgot Password Failure => \n', err);
            res.send(err);
        }
    });
}
)


// function to confirm forgotted password
router.post('/ConfirmForgotPassword', (req, res) => {
    var userData = {
        Username: req.body.email, // your username here
        Pool: userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.confirmPassword(req.body.code, req.body.password, {
        onSuccess: function (result) {
            res.json(result);
        }
    });
})

var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18', region: 'ap-south-1' });
router.get('/Resendotp',(req,res)=>{
    var params = {
        ClientId: '521l6du1g1tn6pdbrt7j2ounqr', /* required */
        Username: req.query.email, /* required */

    };
    cognitoidentityserviceprovider.resendConfirmationCode(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            res.redirect('/ConfirmOTP?email='+req.query.email);
        }          // successful response
    });
})

module.exports = router;
