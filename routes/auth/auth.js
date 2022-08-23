const express = require('express');
const router = express.Router();
const crud = require('../crud');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const isLoggedIn = require('../../middleware');
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
AWS.config.update({ region: 'ap-south-1' });
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
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "custom:aadhar", Value: req.body.aadhar }));
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

            if (result.idToken.payload["custom:role"] == "user") {
                userData = {
                    Email: result.idToken.payload.email,
                    Aadhar: result.idToken.payload["custom:aadhar"],
                    Name: result.idToken.payload.name,
                    Age: result.idToken.payload["custom:age"],
                    Phone: result.idToken.payload.phone_number,
                    Gender: result.idToken.payload.gender,
                    Address: result.idToken.payload.address.formatted,
                    State: result.idToken.payload["custom:state"],
                    City: result.idToken.payload["custom:city"],
                    Pincode: result.idToken.payload["custom:pincode"],
                    Country: result.idToken.payload["custom:country"],
                    Role: result.idToken.payload["custom:role"],
                    complaints: []
                }
            }
            else {
                userData = {
                    Email: result.idToken.payload.email,
                    Name: result.idToken.payload.name,
                    Gender: result.idToken.payload.gender,
                    Role: result.idToken.payload["custom:role"],
                    Ministry: result.idToken.payload["custom:ministry"]
                }
            }

            crud.checkFirstTimeLogin(userData, result.idToken.payload.sub)

            if (result.idToken.payload.role = "user") {
                res.redirect('/Dashboard');
            }
            else if (result.idToken.payload.role = "desk1") {
                res.redirect('/Desk1-Dashboard');
            }
            else if (result.idToken.payload.role = "desk2") {
                res.redirect('/Desk2-Dashboard');
            }


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
                res.send(`<!DOCTYPE html>
                <html lang="en">
                
                <head>
                  <meta charset="utf-8">
                  <meta content="width=device-width, initial-scale=1.0" name="viewport">
                
                  <title>Login</title>
                  <meta content="" name="description">
                  <meta content="" name="keywords">
                
                  <!-- Favicons -->
                  <link href="assets/img/favicon.png" rel="icon">
                  <link href="assets/img/apple-touch-icon.png" rel="apple-touch-icon">
                
                  <!-- Google Fonts -->
                  <link href="https://fonts.gstatic.com" rel="preconnect">
                  <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,600i,700,700i|Nunito:300,300i,400,400i,600,600i,700,700i|Poppins:300,300i,400,400i,500,500i,600,600i,700,700i" rel="stylesheet">
                
                  <!-- Vendor CSS Files -->
                  <link href="assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
                  <link href="assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet">
                  <link href="assets/vendor/boxicons/css/boxicons.min.css" rel="stylesheet">
                  <link href="assets/vendor/quill/quill.snow.css" rel="stylesheet">
                  <link href="assets/vendor/quill/quill.bubble.css" rel="stylesheet">
                  <link href="assets/vendor/remixicon/remixicon.css" rel="stylesheet">
                  <link href="assets/vendor/simple-datatables/style.css" rel="stylesheet">
                
                  <link href="assets/css/style.css" rel="stylesheet">
                
                </head>
                
                <body>
                
                  <main>
                    <div class="container">
                
                      <section class="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
                        <div class="container">
                          <div class="row justify-content-center">
                            <div class="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">
                
                              <div class="d-flex justify-content-center py-4">
                                <a href="/UserDashbord" class="logo d-flex align-items-center w-auto">
                                  <img src="assets/img/logo.png" alt="">
                                  <span class="d-none d-lg-block">Yukti</span>
                                </a>
                              </div><!-- End Logo -->
                
                              <div class="card mb-3">
                
                                <div class="card-body">
                
                                  <div class="pt-4 pb-2">
                                    <h5 class="card-title text-center pb-0 fs-4">Login to Your Account</h5>
                                    <p class="text-center small">Enter your Email & password to login</p>
                                  </div>
                
                                  <!-- changes made M-->   
                                  <form action="/Login" method="post" class="row g-3 needs-validation" novalidate >
                
                                    <div class="col-12">
                                      <label for="yourUsername" class="form-label">Username</label>
                                      <div class="input-group has-validation">
                                        
                                        <!-- changes made M-->                  
                                        <input type="text" name="email" class="form-control" id="Email" required placeholder="Email"> 
                                        <div class="invalid-feedback">Please enter your Email.</div>
                                      </div>
                                    </div>
                
                                    <div class="col-12">
                                      <label for="yourPassword" class="form-label">Password</label>
                
                                      <!-- changes made M-->   
                                      <input  type="password" name="password" placeholder="Password" class="form-control" id="yourPassword" required >
                                      <div class="invalid-feedback">Please enter your password!</div>
                                    </div>
                                    
                                    <div class="col-12">
                                      <label for="yourPassword" class="form-label" style="color: red;">Invalid User</label>
                                      <button class="btn btn-primary w-100" type="submit" value="Send">Login</button>
                                    </div>
                                    <div class="col-12">
                                      <p class="small mb-0">Don't have account? <a href="/signup">Create an account</a></p>
                                    </div>
                                  </form>
                
                                </div>
                              </div>
                
                            </div>
                          </div>
                        </div>
                
                      </section>
                
                    </div>
                  </main><!-- End #main -->
                
                  <a href="#" class="back-to-top d-flex align-items-center justify-content-center"><i class="bi bi-arrow-up-short"></i></a>
                
                  <!-- Vendor JS Files -->
                  <script src="assets/vendor/apexcharts/apexcharts.min.js"></script>
                  <script src="assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
                  <script src="assets/vendor/chart.js/chart.min.js"></script>
                  <script src="assets/vendor/echarts/echarts.min.js"></script>
                  <script src="assets/vendor/quill/quill.min.js"></script>
                  <script src="assets/vendor/simple-datatables/simple-datatables.js"></script>
                  <script src="assets/vendor/tinymce/tinymce.min.js"></script>
                  <script src="assets/vendor/php-email-form/validate.js"></script>
                
                  <!-- Template Main JS File -->
                  <script src="assets/js/main.js"></script>
                
                </body>
                
                </html>
                `)
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
        else {
            console.log("User Confirmed");
            //res.json(result);
            res.redirect('/Login');
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
})


// function to confirm forgotted password
router.post('/ConfirmForgotPassword', (req, res) => {
    var userData = {
        Username: req.body.email, // your username here
        Pool: userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.confirmPassword(req.body.code, req.body.password, {
        onSuccess: function (result) {
            console.log('Confirm Password Success => \n', result);
            res.redirect('/Login');
        }
    });
})

var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18', region: 'ap-south-1' });
router.get('/Resendotp', (req, res) => {
    var params = {
        ClientId: '521l6du1g1tn6pdbrt7j2ounqr', /* required */
        Username: req.query.email, /* required */

    };
    cognitoidentityserviceprovider.resendConfirmationCode(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            res.redirect('/ConfirmOTP?email=' + req.query.email);
        }          // successful response
    });
})

//Change password
router.get('/ChangePassword', isLoggedIn, (req, res) => {
    var userData = {
        Username: req.session.user.idToken.payload.email, // your username here
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
})


router.post('/EditUser', async (req, res) => {
    var isEmpty = false;
    for (var i = 0; i < req.body.length; i++) {
        if (req.body[i].Value == "") {
            res.send(`<!DOCTYPE html>
            <html lang="en">
            
            <head>
              <meta charset="utf-8">
              <meta content="width=device-width, initial-scale=1.0" name="viewport">
            
              <title>Edit Profile</title>
              <meta content="" name="description">
              <meta content="" name="keywords">
            
              <!-- Favicons -->
              <link href="assets/img/favicon.png" rel="icon">
              <link href="assets/img/apple-touch-icon.png" rel="apple-touch-icon">
            
              <!-- Google Fonts -->
              <link href="https://fonts.gstatic.com" rel="preconnect">
              <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,600i,700,700i|Nunito:300,300i,400,400i,600,600i,700,700i|Poppins:300,300i,400,400i,500,500i,600,600i,700,700i" rel="stylesheet">
            
              <!-- Vendor CSS Files -->
              <link href="assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
              <link href="assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet">
              <link href="assets/vendor/boxicons/css/boxicons.min.css" rel="stylesheet">
              <link href="assets/vendor/quill/quill.snow.css" rel="stylesheet">
              <link href="assets/vendor/quill/quill.bubble.css" rel="stylesheet">
              <link href="assets/vendor/remixicon/remixicon.css" rel="stylesheet">
              <link href="assets/vendor/simple-datatables/style.css" rel="stylesheet">
            
              <!-- Template Main CSS File -->
              <link href="assets/css/style.css" rel="stylesheet">
            </head>
            
            <body>
            
              <!-- ======= Header ======= -->
              <header id="header" class="header fixed-top d-flex align-items-center">
            
                <div class="d-flex align-items-center justify-content-between">
                  <a href="/UserDashbord" class="logo d-flex align-items-center">
                    <img src="assets/img/logo.png" alt="">
                    <span class="d-none d-lg-block">Yukti</span>
                  </a>
                  <i class="bi bi-list toggle-sidebar-btn"></i>
                </div><!-- End Logo -->
            
            
                <nav class="header-nav ms-auto">
                  <ul class="d-flex align-items-center">
            
            
            
                    <li class="nav-item dropdown">
            
                      <a class="nav-link nav-icon" href="#" data-bs-toggle="dropdown">
                        <i class="bi bi-bell"></i>
                        <span class="badge bg-primary badge-number">4</span>
                      </a><!-- End Notification Icon -->
            
                      <ul class="dropdown-menu dropdown-menu-end dropdown-menu-arrow notifications">
                        <li class="dropdown-header">
                          You have 4 new notifications
                          <a href="#"><span class="badge rounded-pill bg-primary p-2 ms-2">View all</span></a>
                        </li>
                        <li>
                          <hr class="dropdown-divider">
                        </li>
            
                        <li class="notification-item">
                          <i class="bi bi-exclamation-circle text-warning"></i>
                          <div>
                            <h4>Lorem Ipsum</h4>
                            <p>Quae dolorem earum veritatis oditseno</p>
                            <p>30 min. ago</p>
                          </div>
                        </li>
            
                        <li>
                          <hr class="dropdown-divider">
                        </li>
            
                        <li class="notification-item">
                          <i class="bi bi-x-circle text-danger"></i>
                          <div>
                            <h4>Atque rerum nesciunt</h4>
                            <p>Quae dolorem earum veritatis oditseno</p>
                            <p>1 hr. ago</p>
                          </div>
                        </li>
            
                        <li>
                          <hr class="dropdown-divider">
                        </li>
            
                        <li class="notification-item">
                          <i class="bi bi-check-circle text-success"></i>
                          <div>
                            <h4>Sit rerum fuga</h4>
                            <p>Quae dolorem earum veritatis oditseno</p>
                            <p>2 hrs. ago</p>
                          </div>
                        </li>
            
                        <li>
                          <hr class="dropdown-divider">
                        </li>
            
                        <li class="notification-item">
                          <i class="bi bi-info-circle text-primary"></i>
                          <div>
                            <h4>Dicta reprehenderit</h4>
                            <p>Quae dolorem earum veritatis oditseno</p>
                            <p>4 hrs. ago</p>
                          </div>
                        </li>
            
                        <li>
                          <hr class="dropdown-divider">
                        </li>
                        <li class="dropdown-footer">
                          <a href="#">Show all notifications</a>
                        </li>
            
                      </ul><!-- End Notification Dropdown Items -->
            
                    </li><!-- End Notification Nav -->
            
                    <li class="nav-item dropdown">
            
                      <a class="nav-link nav-icon" href="#" data-bs-toggle="dropdown">
                        <i class="bi bi-chat-left-text"></i>
                        <span class="badge bg-success badge-number">3</span>
                      </a><!-- End Messages Icon -->
            
                      <ul class="dropdown-menu dropdown-menu-end dropdown-menu-arrow messages">
                        <li class="dropdown-header">
                          You have 3 new messages
                          <a href="#"><span class="badge rounded-pill bg-primary p-2 ms-2">View all</span></a>
                        </li>
                        <li>
                          <hr class="dropdown-divider">
                        </li>
            
                        <li class="message-item">
                          <a href="#">
                            <img src="assets/img/messages-1.jpg" alt="" class="rounded-circle">
                            <div>
                              <h4>Maria Hudson</h4>
                              <p>Velit asperiores et ducimus soluta repudiandae labore officia est ut...</p>
                              <p>4 hrs. ago</p>
                            </div>
                          </a>
                        </li>
                        <li>
                          <hr class="dropdown-divider">
                        </li>
            
                        <li class="message-item">
                          <a href="#">
                            <img src="assets/img/messages-2.jpg" alt="" class="rounded-circle">
                            <div>
                              <h4>Anna Nelson</h4>
                              <p>Velit asperiores et ducimus soluta repudiandae labore officia est ut...</p>
                              <p>6 hrs. ago</p>
                            </div>
                          </a>
                        </li>
                        <li>
                          <hr class="dropdown-divider">
                        </li>
            
                        <li class="message-item">
                          <a href="#">
                            <img src="assets/img/messages-3.jpg" alt="" class="rounded-circle">
                            <div>
                              <h4>David Muldon</h4>
                              <p>Velit asperiores et ducimus soluta repudiandae labore officia est ut...</p>
                              <p>8 hrs. ago</p>
                            </div>
                          </a>
                        </li>
                        <li>
                          <hr class="dropdown-divider">
                        </li>
            
                        <li class="dropdown-footer">
                          <a href="#">Show all messages</a>
                        </li>
            
                      </ul><!-- End Messages Dropdown Items -->
            
                    </li><!-- End Messages Nav -->
            
                    <li class="nav-item dropdown pe-3">
            
                      <a class="nav-link nav-profile d-flex align-items-center pe-0" href="#" data-bs-toggle="dropdown">
                        <img src="assets/img/profile-img.jpg" alt="Profile" class="rounded-circle">
                        <span class="d-none d-md-block dropdown-toggle ps-2">
                          <%=userData.idToken.payload.name%>
                        </span>
                      </a><!-- End Profile Iamge Icon -->
            
                      <ul class="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
                        <li class="dropdown-header">
                          <h6>
                            <%=userData.idToken.payload.name%>
                          </h6>
            
                        </li>
                        <li>
                          <hr class="dropdown-divider">
                        </li>
            
                        <li>
                          <a class="dropdown-item d-flex align-items-center" href="">
                            <i class="bi bi-person"></i>
                            <span>My Profile</span>
                          </a>
                        </li>
                        <li>
                          <hr class="dropdown-divider">
                        </li>
            
                        <li>
                          <hr class="dropdown-divider">
                        </li>
            
                        <li>
                          <a class="dropdown-item d-flex align-items-center" href="/Logout">
                            <i class="bi bi-box-arrow-right"></i>
                            <span>Sign Out</span>
                          </a>
                        </li>
            
                      </ul><!-- End Profile Dropdown Items -->
                    </li><!-- End Profile Nav -->
            
                  </ul>
                </nav><!-- End Icons Navigation -->
            
              </header><!-- End Header -->
            
              <!-- ======= Sidebar ======= -->
              <aside id="sidebar" class="sidebar">
            
                <ul class="sidebar-nav" id="sidebar-nav">
            
                  <li class="nav-item">
                    <a class="nav-link collapsed" href="/Dashboard">
                      <i class="bi bi-grid"></i>
                      <span>Dashboard</span>
                    </a>
                  </li><!-- End Dashboard Nav -->
            
                  <li class="nav-item">
                    <a class="nav-link collapsed" href="/UserComplaints">
                      <i class="bi bi-box-arrow-in-right"></i>
                      <span>Lodge Complaint</span>
                    </a>
                  </li><!-- End Login Page Nav -->
                  <li class="nav-item">
                    <a class="nav-link" data-bs-target="#components-nav" data-bs-toggle="collapse" href="#">
                      <i class="bi bi-menu-button-wide"></i><span>My Account</span><i class="bi bi-chevron-down ms-auto"></i>
                    </a>
                    <ul id="components-nav" class="nav-content collapse show " data-bs-parent="#sidebar-nav">
                      <li>
                        <a href="/ViewProfile">
                          <i class="bi bi-circle"></i><span>View Profile</span>
                        </a>
                      </li>
                      <li>
                        <a href="/EditUserProfile" class="active">
                          <i class="bi bi-circle"></i><span>Edit Profile</span>
                        </a>
                      </li>
                      <li>
                        <a href="/ChangePassword">
                          <i class="bi bi-circle"></i><span>Change Password</span>
                        </a>
                      </li>
                      
                    </ul>
                  </li><!-- End Components Nav -->
                </ul>
            
              </aside><!-- End Sidebar-->
            
            
              <main id="main" class="main">
            
                <div class="pagetitle">
                  <h1>Edit Profile</h1>
                  <nav>
                    <ol class="breadcrumb">
                      <li class="breadcrumb-item"><a href="/Dashboard">Dashboard</a></li>
                      <li class="breadcrumb-item active">Edit Profile</li>
                    </ol>
                  </nav>
                </div><!-- End Page Title -->
            
            <section class="section">
                <div class="row">
                  <div class="col-lg-12">
            
                    <div class="card">
                      <div class="card-body">
                        <h5 class="card-title">Edit Profile</h5>
            
                        <!-- General Form Elements -->
                        <form action="/EditUser" method="post">
                          <div class="row mb-3">
                            <label for="inputText" class="col-sm-2 col-form-label">Name</label>
                            <div class="col-sm-10">
                              <input type="text" name="Name" id="" placeholder="Name" class="form-control">
                            </div>
                          </div>
                          <div class="row mb-3">
                            <label for="inputEmail" class="col-sm-2 col-form-label">Age</label>
                            <div class="col-sm-10">
                              <input type="text" name="Age" id="" placeholder="Age" class="form-control">
                            </div>
                          </div>
            
                          <div class="row mb-3">
                            <label class="col-sm-2 col-form-label">Gender</label>
                            <div class="col-sm-10">
                              <select name="Gender"  class="form-select" aria-label="Default select example">
                                <option selected>Select Gender</option>
                                <option value="1">Male</option>
                                <option value="2">Female</option>
                                <option value="3">Other</option>
                              </select>
                            </div>
                          </div>
            
                          <div class="row mb-3">
                            <label for="inputPassword" class="col-sm-2 col-form-label">Address</label>
                            <div class="col-sm-10">
                              <textarea name="Address" id="" placeholder="Address" class="form-control" style="height: 100px"></textarea>
                            </div>
                          </div>
            
                          <div class="row mb-3">
                            <label for="inputText" class="col-sm-2 col-form-label">City/Town</label>
                            <div class="col-sm-10">
                              <input type="text" name="City" id="" placeholder="" class="form-control">
                            </div>
                          </div>
                        
                          <div class="row mb-3">
                            <label for="inputText" class="col-sm-2 col-form-label">State</label>
                            <div class="col-sm-10">
                              <input type="text" name="State" id=""placeholder="State" class="form-control">
                            </div>
                          </div>
            
                          <div class="row mb-3">
                            <label for="inputText" class="col-sm-2 col-form-label">Country</label>
                            <div class="col-sm-10">
                              <input type="text" name="Country" id=""placeholder="Country" class="form-control">
                            </div>
                          </div>
            
                          <div class="row mb-3">
                            <label for="inputText" class="col-sm-2 col-form-label">Pin Code</label>
                            <div class="col-sm-10">
                              <input type="text" name="Pincode" id=""placeholder="Pincode" class="form-control">
                            </div>
                          </div>
            
                          <div class="row mb-3">
                            <label for="inputText" class="col-sm-2 col-form-label">Aadhar Number</label>
                            <div class="col-sm-10">
                              <input type="number" name="Aadhar" id=""placeholder="Aadhar" class="form-control">
                            </div>
                          </div>
            
                          <div class="row mb-3">
                            <label for="inputText" class="col-sm-2 col-form-label">Mobile Number</label>
                            <div class="col-sm-10">
                              <input type="tel" name="Mobile" id=""placeholder="Mobile" class="form-control">
                            </div>
                          </div>
            
                          <div class="row mb-3">
                            <label for="inputText" class="col-sm-2 col-form-label">Email</label>
                            <div class="col-sm-10">
                              <input type="text" name="Email" id="" placeholder="Email" class="form-control">
                            </div>
                            <label for="inputText" class="col-sm-2 col-form-label" style="color: red;">Please fill all fields</label>
                          </div>
             
                          <div class="row mb-3">
                            <div class="col-sm-10">
                              <button type="submit" class="btn btn-primary">Submit</button>
                            </div>
                          </div>
            
                          
            
                        </form><!-- End General Form Elements -->
            
                      </div>
                    </div>
            
                    
                  </div>
                  <div class="col-lg-6">
            
                    <!-- <div class="card">
                      <div class="card-body">
                        <h5 class="card-title">Advanced Form Elements</h5>
                      </div>
                      </div>
                    </div> -->
                
            
              </section>
                
            
              </main><!-- End #main -->
            
            
            
              <a href="#" class="back-to-top d-flex align-items-center justify-content-center"><i class="bi bi-arrow-up-short"></i></a>
            
              <!-- Vendor JS Files -->
              <script src="assets/vendor/apexcharts/apexcharts.min.js"></script>
              <script src="assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
              <script src="assets/vendor/chart.js/chart.min.js"></script>
              <script src="assets/vendor/echarts/echarts.min.js"></script>
              <script src="assets/vendor/quill/quill.min.js"></script>
              <script src="assets/vendor/simple-datatables/simple-datatables.js"></script>
              <script src="assets/vendor/tinymce/tinymce.min.js"></script>
              <script src="assets/vendor/php-email-form/validate.js"></script>
            
              <!-- Template Main JS File -->
              <script src="assets/js/main.js"></script>
            
            </body>
            
            </html>`);
            isEmpty = true;
            break;
        }
    }
    if (isEmpty == false) {
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
    }

});

module.exports = router;
