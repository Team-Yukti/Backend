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
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "preferred_username", Value: req.body.aadhar }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "phone_number", Value: req.body.phone }));
    userPool.signUp(req.body.email, req.body.password, attributeList, null, function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        else {
            cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());




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

            userData = {
                Email: result.idToken.payload.email ,
                Aadhar:  result.idToken.payload.preferred_username ,
                Phone:  result.idToken.payload.phone_number 
            }

            crud.insertItem(userData,"users",result.idToken.payload.sub);

            res.send(req.session.user);
            console.log("Login Success");
            //console.log('Login success => \n');
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
        res.json(result);
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
function resendotp(email) {
    var params = {
        ClientId: '521l6du1g1tn6pdbrt7j2ounqr', /* required */
        Username: email, /* required */

    };
    cognitoidentityserviceprovider.resendConfirmationCode(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
    });

}

module.exports = router;