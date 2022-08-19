// insert data in dynamo db
const express = require('express');
const router = express.Router();
var AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-south-1' });

function insertItem(json, tableName, primaryKey) {
    var params = {
        Item: {
            pid: {
                S: primaryKey
            },
            Data: {
                M: json
            }
        },
        ReturnConsumedCapacity: "TOTAL",
        TableName: tableName
    };

    //  put item in dynamo db
    var dynamodb = new AWS.DynamoDB();
    dynamodb.putItem(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
    });

}


function update(pid,tablename) {
    var params = {
        TableName: tablename,
        Key: {
            pid: {
                S: pid
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
    dynamodb.updateItem(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
    });
}

// Delete item from table in dynamo db
function deleteItem() {
    var params = {
        TableName: "user",
        Key: {
            "uid": {
                S: "skfhjdsbjhsvk;jadnjvjvjbavbdsv"
            }
        }
    };

    var dynamodb = new AWS.DynamoDB();
    dynamodb.deleteItem(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred

        else console.log(data);           // successful response
    });
}

//Read item from table in dynamo db
function readItemNInsert(pid, userData, tableName) {
    console.log("pid: " + pid);
    var params = {
        TableName: tableName,
        Key: {
            pid: {
                S: pid
            }
        }
    }
    var dynamodb = new AWS.DynamoDB();
    dynamodb.getItem(params, function (err, data) {
        if (err) {
            console.log(err, err.stack)
        } // an error occurred
        else {
            if (data.Item == null) {
                insertItem(userData, tableName, pid);
            }
            else {
                console.log("Item found");
            }
        };           // successful response
    }).promise();
}

//Insert Complaint
function InsertComplaint(pid, complaintData) {

    var params = {
        TableName: "users",
        Key: {
            pid: {
                S: pid
            }
        }
    }
    var dynamodb = new AWS.DynamoDB();
    dynamodb.getItem(params, function (err, data) {
        if (err) {
            console.log(err, err.stack)
        } // an error occurred
        else {
            if (data.Item.complaintData == null) {
                insertItem(userData, tableName, pid);
            }
            else {
                console.log("Item found");
            }
        };           // successful response
    }).promise();


    console.log("pid: " + pid);
    var params = {
        TableName: "complaints",
        Key: {
            pid: {
                S: pid
            }
        }
    }
    var dynamodb = new AWS.DynamoDB();
    dynamodb.getItem(params, function (err, data) {
        if (err) {
            console.log(err, err.stack)
        } // an error occurred
        else {
            if (data.Item == null) {
                insertItem(userData, tableName, pid);
            }
            else {
                console.log("Item found");
            }
        };           // successful response
    }).promise();
}



//insertItem();
// update();
//deleteItem();

module.exports = { insertItem, update, deleteItem, readItemNInsert };