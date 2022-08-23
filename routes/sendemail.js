const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const mailer = require('nodemailer')
require('dotenv').config();

var smtpProtocol = mailer.createTransport({
    // service: "Gmail",
    host: "smtp.yandex.com",
    port: 465,
    secure: true,
    
    auth: {
        user:'sih@birangal.com',
        pass:'SIH#3sih'
    }
});


function SendEmail(email,subject,body){
    var mailoption = {
        from: process.env.EMAIL,
        cc:process.env.EMAIL,
        to: 'prgayake100@gmail.com',
        subject: subject,
        html: `Hello from Team Yukti <br>
                `+subject+``
    }
    smtpProtocol.sendMail(mailoption, function(err, response){
        if(err) {
            return JSON.parse(err);
        }   
        return JSON.parse(response);
        smtpProtocol.close();
    });

    
}
 console.log(SendEmail());
