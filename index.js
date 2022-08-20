// create simple express server
var express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { sendfile } = require('express/lib/response');
var app = express();
const isLoggedIn = require('./middleware');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');


const crud = require('./routes/crud.js');
const serviceAccount = require('./keys/firebase.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();




app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/', require('./routes/auth/auth'));
app.use('/', require('./routes/user/user'));
app.use('/', require('./routes/user/userComplaints'));


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
app.get('/UserComplaints',isLoggedIn, (req, res) => {
    res.render('user/complaintRegistration');
})
app.get('/ConfirmOTP', (req, res) => {
    res.render('auth/confirmOTP', {email: req.query.email});
})
app.get('/ConfirmPassword', (req, res) => {
    res.render('auth/confirmPassword', {email: req.query.email});
})
app.get('/ForgotPassword', (req, res) => {
    res.render('auth/forgotPassword');
})
app.listen(3000, function () { console.log('Example app listening on port 3000!');});

