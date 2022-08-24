const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const { get } = require('express/lib/response');
const fs = require('fs')

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


router.get('/getObject',(req,res)=>{
    let s3 = new AWS.S3();

      async function getImage(){
        const data =  s3.getObject(
          {
              Bucket: 'complaint-bucket-sih',
              Key: "mpv-shot0004.jpg"
            }
          
        ).promise();
        return data;
      }

      
      getImage()
      .then((img)=>{
          let image="data:image/jpeg;base64," + encode(img.Body);
          let startHTML="<html><body></body>";
          let endHTML="</body></html>";
          let html=startHTML + image + endHTML;
        res.send(image)
      }).catch((e)=>{
        res.send(e)
      })

      function encode(data){
          let buf = Buffer.from(data);
          let base64 = buf.toString('base64');
          return base64
      }
    
})

router.get('/saveImageToDir',(req,res)=>{
    let s3 = new AWS.S3();

    async function getImage(){
      const data =  s3.getObject(
        {
            Bucket: 'complaint-bucket-sih',
            Key: "mpv-shot0004.jpg"
          }
        
      ).promise();
      return data;
    }

    var buffer = Buffer.from(encode(getImage().Body),'base64')
    fs.writeFileSync('/upload/file-name.jpg',buffer)
  
    function encode(data){
        let buf = Buffer.from(data);
        let base64 = buf.toString('base64');
        return base64
    }
    
})
 
// getobject()


module.exports = {
    router:router,
    uploadFilestoS3:uploadFilestoS3
};