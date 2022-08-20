const express = require('express');
const router = express.Router();
var admin = require('firebase-admin');


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

router.get('/GetComplaints', (req,res)=>{
  const type = req.body.type;
  console.log(type);
  db.collection("complaints").where("type", "==", type).get().then((querySnapshot) => {
    var complaints = [];
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        complaints.push(doc.data());
        console.log(doc.id, " => ", doc.data());
    });
    return res.status(200).send({"complaints": complaints});
  });
})

router.get('/GetComplaintTypes', (req,res)=>{
  const name = req.body.name;
  db.collection("ministries").where("Name", "==", name).get().then((querySnapshot) => {
    var complaints_types = [];
    querySnapshot.forEach((doc) => {
        console.log(doc.data());
        const data = doc.data().complaint_types;
        for(var i=0;i<data.length;i++)
          complaints_types.push(data[i]);
    });
    return res.status(200).send({"complaints_types": complaints_types});
  })
})

router.get('/GetFullComplaint',(req,res)=>{

    db.collection("complaints").doc(req.query.cid).get().then((querySnapshot) => {
        res.render('user/complaintpage',{complaint:querySnapshot.data()});
    });
})

function updateComplaint(cid, data)
{
  db.collection("complaints").doc(cid).update(data);
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



module.exports = {
    router:router,
    insertItem:insertItem,
    checkFirstTimeLogin:checkFirstTimeLogin,
    insertComplaint:insertComplaint,
    getAllComplaints:getAllComplaints,
    addComment: addComment,
    updateComplaint: updateComplaint,
};
