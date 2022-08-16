// create simple express server
var express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { sendfile } = require('express/lib/response');
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/user/User'));

app.get('/', (req, res) => {
    res.json({"hello": "world"});
})

app.get('/Home', (req, res) => {
    res.render('home');
})
app.get('/Login', (req, res) => {
    res.render('login');
})
app.get('/Signup', (req, res) => {
    res.render('signup');
})

app.get('/ConfirmPassword', (req, res) => {
        console.log("Hello");
})


app.listen(3000, function () { console.log('Example app listening on port 3000!');});