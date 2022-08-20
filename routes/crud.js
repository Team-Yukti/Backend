// insert data in dynamo db
const { DocDB } = require('aws-sdk');
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

const serviceAccount = require('../keys/firebase.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();




//insert Json
function insertItem(json,collection,doc)
{
    if(doc==null)
    {
        db.collection(collection).add(json)
        .then(ref => {
            console.log('Added document with ID: ', ref.id);
        }).catch(err => {
            console.log('Error adding document: ', err);
        });
    }
    else
    {
        db.collection(collection).doc(doc).set(json)
        .then(ref => {
            console.log('Added document with ID: ', ref.id);
        }).catch(err => {
            console.log('Error adding document: ', err);
        });
    }
}


//check is first time login
function checkFirstTimeLogin(json,uid)
{
    db.collection('users').doc(uid).get()
    .then(doc => {
        if(!doc.exists)
        {
            console.log("first time login");
            insertItem(json,'users',uid);
        }
    }).catch(err => {
        console.log('Error getting document', err);
    });
}


//insert complaint
function insertComplaint(uid,json)
{
    json["Time"]= admin.firestore.Timestamp.fromDate(new Date());
    db.collection('complaints').add(json)
    .then(ref => {
        console.log('Added document with ID: ', ref.id);
        db.collection('users').doc(uid).update({
            complaints: admin.firestore.FieldValue.arrayUnion(ref.id)
        }).then(ref => {
            console.log('Added document with ID: ', ref.id);
        }).catch(err => {
            console.log('Error adding document: ', err);
        });
    }).catch(err => {
        console.log('Error adding document: ', err);
    });
}


function addComment(cid,uid,comment)
{
    db.collection('complaints').doc(cid).update({
        comments: admin.firestore.FieldValue.arrayUnion({uid:uid,time:admin.firestore.Timestamp.fromDate(new Date()),comment:comment})
    }).then(ref => {
        console.log('Added document with ID: ', ref.id);
    }).catch(err => {
        console.log('Error adding document: ', err);
    });
}

module.exports = { insertItem, checkFirstTimeLogin,insertComplaint,addComment };