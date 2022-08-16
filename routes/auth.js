const express = require('express');
const router = express.Router();
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
global.fetch = require('node-fetch');

const poolData = {
    UserPoolId: "ap-south-1_9ErMvHoXm", // Your user pool id here    
    ClientId: "521l6du1g1tn6pdbrt7j2ounqr" // Your client id here
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

// AWS conginto Authentication declaration end here

router.post('/Signup', (req, res) => {
    
        var attributeList = [];
        attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"name",Value:req.body.name}));
        attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"preferred_username",Value:req.body.addhar}));
        attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"phone_number",Value:req.body.phone}));
        userPool.signUp(req.body.email, req.body.password, attributeList, null, function(err, result){
            if (err) {
                console.log(err);
                return;
            }
            cognitoUser = result.user;
            res.json(cognitoUser);
            console.log('user name is ' + cognitoUser.getUsername());
            
        });
    });


router.post('/Login', (req, res) => {
    
        var authenticationData = {
            Username : req.body.email, // your username here
            Password : req.body.password, // your password here
        };
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
        var userData = {
            Username : req.body.email, // your username here
            Pool : userPool
        };
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                req.session.user = result;
                res.send(req.session.user);
            //    console.log('Login success => \n');
            },
            onFailure: function(err) {
                if(err.code === 'UserNotConfirmedException'){
                    res.redirect('/ConfirmUser?email='+req.body.email);
                }else{
                    res.json(err);
                }
            }
        });
    
})

router.post('/ConfirmUser', (req, res) => {
    var userData = {
        Username : req.body.email, // your username here
        Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.confirmRegistration(req.body.code, true, function(err, result) {
        if (err) {
            res.json(err);
            return;
        }
        res.json(result);
    }
    );
})

router.post('/ForgotPassword', (req, res) => {
    var userData = {
        Username : req.body.email, // your username here
        Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.forgotPassword({
        onSuccess: function (result) {
            res.redirect('/ConfirmPassword?email='+req.body.email);
        }
    });
})

// function to confirm forgotted password
router.post('/ConfirmForgotPassword', (req, res) => {
    var userData = {
        Username : req.body.email, // your username here
        Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.confirmPassword(req.body.code, req.body.password, {
        onSuccess: function (result) {
            res.json(result);
        }
    });
})

router.get('/ConfirmPassword', (req, res) => {
    res.render('confirm', {email: req.query.email});
})


module.exports = router;