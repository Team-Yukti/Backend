// insert data in dynamo db
const express = require('express');
const router = express.Router();
var AWS = require('aws-sdk');
AWS.config.update({region: 'ap-south-1'});

function Insert(){
    var params = {
        Item: {
         "uid": {
           S: "skfhjdsbjhsvk;jadnjvjvjbavbdsv"
          }, 
         "Name": {
           S: "Pradyumna Gayake"
          }, 
         "SongTitle": {
           S: "Call Me Today"
          }
        }, 
        ReturnConsumedCapacity: "TOTAL", 
        TableName: "users"
       };
    
    //  put item in dynamo db
    var dynamodb = new AWS.DynamoDB();
    dynamodb.putItem(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
    });
    
}


function update(){
    var params = {
        TableName: "users",
        Key: {
            "uid": {
                S: "skfhjdsbjhsvk;jadnjvjvjbavbdsv"
            }
        },
        UpdateExpression: "set #name = :n",
        ExpressionAttributeNames: {
            "#name": "Name"
        },
        ExpressionAttributeValues: {
            ":n": {
                S: "Niranjan Girhe"
            }
        },
        ReturnValues: "UPDATED_NEW"
    };
    
    var dynamodb = new AWS.DynamoDB();
    dynamodb.updateItem(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
    });
}

// Delete item from table in dynamo db
function deleteItem(){
    var params = {
        TableName: "users",
        Key: {
            "uid": {
                S: "skfhjdsbjhsvk;jadnjvjvjbavbdsv"
            }
        }
    };

    var dynamodb = new AWS.DynamoDB();
    dynamodb.deleteItem(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred

        else     console.log(data);           // successful response
    });
}
// Insert();
// update();
deleteItem();