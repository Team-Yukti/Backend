const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const { get } = require('express/lib/response');


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
   }

router.get('/getObject',(req,res)=>{
    var s3 = new AWS.S3();
    var params = {
        Bucket: 'complaint-bucket-sih',
        Key:'aditya.jpeg'
    };
    s3.getObject(params, (err, rest) => {
        if (err) throw err;
    
        const b64 = Buffer.from(rest.Body).toString('base64');
       
        const mimeType = 'image/png'; // e.g., image/png
        
        res.send(`<img src="data:${mimeType};base64,${b64}" />`);
      });
    
})

 
getobject()


module.exports = {
    router:router,
    uploadFilestoS3:uploadFilestoS3
};