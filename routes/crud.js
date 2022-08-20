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
function checkFirstTimeLogin(uid) {
    db.collection('users').doc(uid).get()
        .then(doc => {
            if (doc.exists) {
                return false;
            } else {
                return true;
            }
        }).catch(err => {
            console.log('Error getting document', err);
        });
}


//insert complaint
function insertComplaint(uid, json, time) {
    db.collection('complaints').doc(uid + time).set(json)
        .then(ref => {
            console.log('Added document with ID: ', ref.id);
        }).catch(err => {
            console.log('Error adding document: ', err);
        });
}

// read items from firebase 

 function GetAllComplaints(cid) {
    db.collection("complaints").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            // console.log(doc.data());
            return doc.data();
        });
    });
}



router.get('/GetFullComplaint',(req,res)=>{
    
    db.collection("complaints").doc(req.query.cid).get().then((querySnapshot) => {
        res.render('user/complaintpage',{complaint:querySnapshot.data()});
    });
})



module.exports = {
    router:router,
    insertItem:insertItem,
    checkFirstTimeLogin:checkFirstTimeLogin,
    insertComplaint:insertComplaint,
    GetAllComplaints:GetAllComplaints,
    
};