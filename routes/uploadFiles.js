const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');


const s3 = new AWS.S3({
    accessKeyId: "AKIAUNTJLAUF4DV2WFHS",
    secretAccessKey: "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"
})
function uploadFilestoS3(file) {
    var s3 = new AWS.S3();
    var params = {
        Bucket: 'complaint-bucket-sih',
        Key: file.name,
        Body: file.data
    };
    s3.upload(params, function(err, data) {
        if (err) {
            console.log(err);
            // callback(err);
        } else {
            console.log("Successfully uploaded data to S3");
            // callback(null, data);
        }
    }).on('httpUploadProgress', function(progress) {
        console.log(progress);
    });
}
function getobject(){
    var s3 = new AWS.S3();
    var params = {
        Bucket: 'complaint-bucket-sih',
        Key:'post05.png'
    };
    s3.getObject(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
      });
}

// getobject()
module.exports = {uploadFilestoS3};