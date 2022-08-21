const express = require('express');
const router = express.Router();
var admin = require('firebase-admin');
const isLoggedIn = require('../middleware');

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
function checkFirstTimeLogin(json, uid) {
    db.collection('users').doc(uid).get()
        .then(doc => {
            if (!doc.exists) {
                console.log("first time login");
                insertItem(json, 'users', uid);
            }
        }).catch(err => {
            console.log('Error getting document', err);
        });
}


//insert complaint
function insertComplaint(uid, json) {
    json["Time"] = admin.firestore.Timestamp.fromDate(new Date());
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
            return doc.data();
        });
    });
}

function getComplaintTypes(ministry){
  db.collection("ministries").where("Name", "==", ministry).get().then((querySnapshot) => {
    var complaints_types = [];
    querySnapshot.forEach((doc) => {
        console.log(doc.data());
        const data = doc.data().complaint_types;
        for(var i=0;i<data.length;i++)
          complaints_types.push(data[i]);
    });
    return complaints_types;
  })
}


router.get('/GetFullComplaint', async (req, res) => {
    var jsonData = {}
    await db.collection("complaints").doc(req.query.cid).get().then((querySnapshot) => {
        jsonData = querySnapshot.data();

    });
    for (var i = 0; i < jsonData.comments.length; i++) {
        await db.collection("users").doc(jsonData.comments[i].uid).get().then((userdata) => {
            jsonData.comments[i]["uid"] = userdata.data().Name;
        })
    }
    res.render('user/complaintpage', {
        complaint: jsonData,
        cid: req.query.cid
    });

})

router.get('/GetUserComplaints', isLoggedIn, async (req,res)=>{
  const email = req.session.user.idToken.payload.email;
  var complaint_ids;
  var userinfo;
  await db.collection("users").where("Email", "==", email).get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        // console.log(doc.data());
        complaint_ids=doc.data().complaints;
        userinfo = doc.data();
    });
  });

//   console.log(complaint_ids);
  var complaints = [];
  for(var i=0;i<complaint_ids.length;i++){
    await db.collection("complaints").doc(complaint_ids[i]).get().then((querySnapshot) => {
        complaints.push(querySnapshot.data());
    });
    
  }
  res.render('user/dashboard',{userData:userinfo,complaints:complaints});
})

router.get('/GetDesk1Complaints', isLoggedIn, async (req,res)=>{
  const ministry = req.session.user.idToken.payload['custom:ministry'];
  console.log(ministry);
  complaint_types = await getComplaintTypes(ministry);
  console.log(complaint_types);
  db.collection("complaints").where("type", "in", complaint_types).where("current_desk", "==", 1).get().then((querySnapshot) => {
    var complaints = [];
    querySnapshot.forEach((doc) => {
        complaints.push(doc.data());
    });
    return res.status(200).send({"complaints": complaints});
  });
})

router.get('/GetDesk2Complaints', (req,res)=>{
  const type = req.body.type;
  console.log(type);
  db.collection("complaints").where("type", "==", type).where("current_desk", "==", 2).get().then((querySnapshot) => {
    var complaints = [];
    querySnapshot.forEach((doc) => {
        complaints.push(doc.data());
        console.log(doc.id, " => ", doc.data());
    });
    return res.status(200).send({"complaints": complaints});
  });
})

function updateComplaint(cid, data)
{
  db.collection("complaints").doc(cid).update(data);
}

function approveComplaint(cid)
{
  db.collection("complaints").doc(cid).update({current_desk: 2});
}

function addComment(cid,uid,comment)
{
    db.collection('complaints').doc(cid).update({
        comments: admin.firestore.FieldValue.arrayUnion({
            uid: uid,
            time: admin.firestore.Timestamp.fromDate(new Date()),
            comment: comment
        })
    }).then(ref => {
        console.log('Added document with ID: ', ref.id);
    }).catch(err => {
        console.log('Error adding document: ', err);
    });
}

//get comments
function getComments(cid) {
    db.collection('complaints').doc(cid).get().then((querySnapshot) => {
        console.log(querySnapshot.data().comments);
    }).catch(err => {
        console.log('Error getting document', err);
    });
}
// getComments('34e0a738-9426-4efb-b721-bb7502fe96c01660976645775')



module.exports = {
    router: router,
    insertItem: insertItem,
    checkFirstTimeLogin: checkFirstTimeLogin,
    insertComplaint: insertComplaint,
    getAllComplaints: getAllComplaints,
    addComment: addComment,
    updateComplaint: updateComplaint,
    approveComplaint: approveComplaint
};
