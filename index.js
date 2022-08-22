const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');
var express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { sendfile } = require('express/lib/response');
var app = express();
const isLoggedIn = require('./middleware');
const crud = require('./routes/crud.js');


const poolData = {
    UserPoolId: "ap-south-1_9ErMvHoXm", // Your user pool id here
    ClientId: "521l6du1g1tn6pdbrt7j2ounqr" // Your client id here
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/', require('./routes/auth/auth'));
app.use('/', require('./routes/user/user'));
app.use('/', require('./routes/user/userComplaints'));
app.use('/', require('./routes/desk1/desk1complaints'));
app.use('/', require('./routes/desk2/desk2complaints'));
app.use('/', require('./routes/crud.js').router);
app.use('/', require('./routes/superadmin/handleusers'));



app.get('/', (req, res) => {
    res.json({"hello": "world"});
})

app.get('/Home', (req, res) => {
    res.render('auth/home');
})
app.get('/Login', (req, res) => {
    res.render('auth/login');
})
app.get('/Signup', (req, res) => {
    res.render('auth/signup');
})
app.get('/AdminDashboard', (req, res) => {
    res.render('admin/admindashbord');
})

// "/UserDashbord" added in frontend

app.get('/UserComplaints',isLoggedIn, (req, res) => {
    res.render('user/complaintRegistration');
})

app.get('/OnboardAdmin',isLoggedIn, (req,res) => {
    res.render('superadmin/onboard_admins');
})
app.get('/EditProfile',(req,res)=>{
    res.render('user/editProfile')
})
app.get('/ConfirmOTP', (req, res) => {
    res.render('auth/confirmOTP', {email: req.query.email});
})
app.get('/ConfirmPassword', (req, res) => {
    res.render('auth/confirmPassword', {email: req.query.email});
})
app.get('/ForgotPassword', (req, res) => {
    res.render('auth/forgotPassword', {email: req.query.email});
})

app.get('/Logout',(req,res)=>{
     req.session.destroy();
     res.redirect('/Login');
})
app.listen(3000, function () { console.log('Example app listening on port 3000!');});
