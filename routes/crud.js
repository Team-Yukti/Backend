const express = require('express');
const router = express.Router();



const {
    initializeApp,
    applicationDefault,
    cert
} = require('firebase-admin/app');
const {
    getFirestore,
    Timestamp,
    FieldValue
} = require('firebase-admin/firestore');

const serviceAccount = require('../keys/firebase.json');

initializeApp({
    credential: cert(serviceAccount)
});
var admin = require('firebase-admin')

const db = getFirestore();


//insert Json
function insertItem(json, collection, doc) {
    if (doc == null) {
        db.collection(collection).add(json)
            .then(ref => {
                console.log('Added document with ID: ', ref.id);
            }).catch(err => {
                console.log('Error adding document: ', err);
            });
    } else {
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


 function getAllComplaints(cid) {
    db.collection("complaints").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            // console.log(doc.data());
            return doc.data();
        });
    });
}



router.get('/GetFullComplaint',(req,res)=>{
    
    db.collection("complaints").doc(req.query.cid).get().then((querySnapshot) => {

        res.render('user/complaintpage',{complaint:querySnapshot.data(),cid:req.query.cid});
    });
})


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

//get comments
function getComments(cid)
{
    db.collection('complaints').doc(cid).get().then((querySnapshot) => {
        return querySnapshot.data().comments;
    }).catch(err => {
        console.log('Error getting document', err);
    });
}


module.exports = {
    router:router,
    insertItem:insertItem,
    checkFirstTimeLogin:checkFirstTimeLogin,
    insertComplaint:insertComplaint,
    getAllComplaints:getAllComplaints,
    addComment: addComment
};

